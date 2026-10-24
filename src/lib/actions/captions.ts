"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { captions, captionVersions } from "@/lib/db/schema";
import { CHANNELS, type Channel } from "@/lib/types";
import { joinBrands, parseBrands } from "@/lib/brands";
import { joinImageUrls, parseImageUrls } from "@/lib/image-url";

/**
 * เก็บข้อความเป็นเวอร์ชันส่งตรวจ
 *
 * ถ้าเวอร์ชันล่าสุดยังไม่ถูกตรวจ จะ "แก้ทับ" เวอร์ชันนั้นแทนการสร้างเวอร์ชันใหม่
 * เพราะเจ้าของมักส่งไปแล้วนึกได้ว่าลืมแก้อีกจุด ไม่ควรกลายเป็นคนละเวอร์ชัน
 * แต่ถ้าหัวหน้าตรวจไปแล้ว ต้องขึ้นเวอร์ชันใหม่เสมอ เพราะโน้ตของหัวหน้าผูกกับ
 * ข้อความของเวอร์ชันนั้นอยู่ ถ้าแก้ทับ โน้ตจะชี้ไปยังข้อความที่ไม่มีแล้ว
 */
async function saveAsPendingVersion(captionId: string, text: string) {
  const [latest] = await db
    .select({
      id: captionVersions.id,
      versionNumber: captionVersions.versionNumber,
      reviewResult: captionVersions.reviewResult,
    })
    .from(captionVersions)
    .where(eq(captionVersions.captionId, captionId))
    .orderBy(desc(captionVersions.versionNumber))
    .limit(1);

  if (latest && latest.reviewResult === "pending") {
    await db
      .update(captionVersions)
      .set({ text, submittedAt: new Date() })
      .where(eq(captionVersions.id, latest.id));
    return;
  }

  await db.insert(captionVersions).values({
    captionId,
    versionNumber: (latest?.versionNumber ?? 0) + 1,
    text,
    reviewResult: "pending",
  });
}

/**
 * เพดานความยาวของแต่ละช่อง (PRD กฎข้อ 7)
 * แคปชันจริงที่ยาวที่สุดเท่าที่เคยใช้คือ ~4,900 ตัวอักษร เผื่อไว้ 4 เท่าก็เหลือเฟือ
 * มีไว้กันข้อมูลก้อนใหญ่ผิดปกติถูกยัดเข้าฐานข้อมูล ไม่ได้มีไว้จำกัดการทำงานจริง
 */
const LIMITS = {
  title: 200,
  authorName: 100,
  captionText: 20000,
  imageUrl: 2000,
} as const;

export type CaptionFormState = {
  errors: Partial<Record<"title" | "brand" | "channel" | "captionText", string>>;
};

function readCommonFields(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const brandRaw = String(formData.get("brand") ?? "");
  const channelRaw = String(formData.get("channel") ?? "");
  const scheduledDateRaw = String(formData.get("scheduledDate") ?? "").trim();
  const authorName = String(formData.get("authorName") ?? "").trim();
  // ลิงก์รูปมาเป็นก้อนเดียวคั่นด้วยบรรทัด — ล้างบรรทัดว่างและช่องว่างส่วนเกินทิ้งก่อนเก็บ
  const imageUrls = joinImageUrls(
    parseImageUrls(String(formData.get("imageUrl") ?? ""))
  );
  const captionText = String(formData.get("captionText") ?? "").trim();

  // เลือกได้หลายแบรนด์ — รับมาเป็นก้อนเดียวคั่นบรรทัด แล้วกรองเหลือเฉพาะชื่อที่มีจริง
  const brand = joinBrands(parseBrands(brandRaw));
  const channel: Channel = CHANNELS.includes(channelRaw as Channel)
    ? (channelRaw as Channel)
    : CHANNELS[0];

  return {
    id: id || null,
    title,
    brand,
    channel,
    scheduledDate: scheduledDateRaw || null,
    authorName,
    imageUrl: imageUrls || null,
    captionText,
  };
}

/**
 * "บันทึกไว้ก่อน" (PRD 5.2) — บันทึกข้อความไว้เฉย ๆ ไม่เปลี่ยนสถานะ
 * ถ้าเป็นชิ้นใหม่สถานะเป็น "ร่าง" ถ้าชิ้นนั้น "รอตรวจ" อยู่แล้ว หัวหน้าจะยังเห็นข้อความเดิม
 * (การแก้ไม่สร้างเวอร์ชันใหม่ — เก็บไว้ที่ pendingDraftText เท่านั้น)
 */
/** เช็กว่าช่องไหนยาวเกินเพดาน แล้วบอกเป็นภาษาคนว่าต้องตัดออกกี่ตัวอักษร */
function tooLongErrors(
  fields: ReturnType<typeof readCommonFields>
): CaptionFormState["errors"] {
  const errors: CaptionFormState["errors"] = {};
  if (fields.title.length > LIMITS.title) {
    errors.title = `หัวข้อยาวเกินไป ตัดออกอีก ${fields.title.length - LIMITS.title} ตัวอักษร`;
  }
  if (fields.captionText.length > LIMITS.captionText) {
    errors.captionText = `แคปชันยาวเกินไป ตัดออกอีก ${fields.captionText.length - LIMITS.captionText} ตัวอักษร`;
  }
  if (fields.authorName.length > LIMITS.authorName) {
    errors.title = "ชื่อคนเขียนยาวเกินไป";
  }
  if ((fields.imageUrl ?? "").length > LIMITS.imageUrl) {
    errors.title = "ลิงก์รูปรวมกันยาวเกินไป ลองลดจำนวนรูปลง";
  }
  return errors;
}

export async function saveCaptionDraft(
  _prevState: CaptionFormState,
  formData: FormData
): Promise<CaptionFormState> {
  const fields = readCommonFields(formData);

  const tooLong = tooLongErrors(fields);
  if (Object.keys(tooLong).length > 0) return { errors: tooLong };

  if (fields.id) {
    await db
      .update(captions)
      .set({
        title: fields.title,
        brand: fields.brand,
        channel: fields.channel,
        scheduledDate: fields.scheduledDate,
        authorName: fields.authorName,
        imageUrl: fields.imageUrl,
        pendingDraftText: fields.captionText,
        updatedAt: new Date(),
      })
      .where(and(eq(captions.id, fields.id), eq(captions.isDeleted, false)));
  } else {
    await db.insert(captions).values({
      title: fields.title,
      brand: fields.brand,
      channel: fields.channel,
      scheduledDate: fields.scheduledDate,
      authorName: fields.authorName,
      imageUrl: fields.imageUrl,
      status: "draft",
      pendingDraftText: fields.captionText,
    });
  }

  revalidatePath("/admin");
  if (fields.id) revalidatePath(`/admin/${fields.id}`);
  redirect("/admin");
}

/**
 * "ส่งตรวจ" / "ส่งเวอร์ชันใหม่ให้ตรวจ" (PRD 5.2 / 5.3)
 * เก็บข้อความตอนนี้เป็นเวอร์ชันใหม่ สถานะเปลี่ยนเป็น "รอตรวจ"
 */
export async function submitCaptionForReview(
  _prevState: CaptionFormState,
  formData: FormData
): Promise<CaptionFormState> {
  const fields = readCommonFields(formData);

  const errors: CaptionFormState["errors"] = {};
  if (!fields.title) errors.title = "กรุณากรอกหัวข้อสั้น";
  if (!fields.brand) errors.brand = "กรุณาเลือกแบรนด์อย่างน้อย 1 อัน";
  if (!fields.captionText) errors.captionText = "กรุณาพิมพ์ตัวแคปชัน";
  Object.assign(errors, tooLongErrors(fields));
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  let captionId = fields.id;

  if (captionId) {
    await db
      .update(captions)
      .set({
        title: fields.title,
        brand: fields.brand,
        channel: fields.channel,
        scheduledDate: fields.scheduledDate,
        authorName: fields.authorName,
        imageUrl: fields.imageUrl,
        pendingDraftText: fields.captionText,
        status: "pending_review",
        updatedAt: new Date(),
      })
      .where(and(eq(captions.id, captionId), eq(captions.isDeleted, false)));
  } else {
    const [inserted] = await db
      .insert(captions)
      .values({
        title: fields.title,
        brand: fields.brand,
        channel: fields.channel,
        scheduledDate: fields.scheduledDate,
        authorName: fields.authorName,
        imageUrl: fields.imageUrl,
        pendingDraftText: fields.captionText,
        status: "pending_review",
      })
      .returning({ id: captions.id });
    captionId = inserted.id;
  }

  await saveAsPendingVersion(captionId, fields.captionText);

  revalidatePath("/admin");
  revalidatePath(`/admin/${captionId}`);
  revalidatePath("/");
  redirect("/admin");
}

export type SubmitDraftState = {
  error?: string;
};

/**
 * "ส่งเวอร์ชันใหม่ให้ตรวจ" (PRD 5.3) — ปุ่มในหน้ารายละเอียดฝั่งเจ้าของ
 * เก็บ "ข้อความที่แก้ค้างไว้" ตอนนี้เป็นเวอร์ชันใหม่ทันที โดยไม่ต้องเปิดฟอร์มแก้ไข
 * ใช้ได้ทั้งชิ้นที่ยังเป็นร่าง (ยังไม่เคยส่งตรวจเลย) และชิ้นที่เคยส่งตรวจไปแล้ว
 */
export async function submitCurrentDraftForReview(
  _prevState: SubmitDraftState,
  formData: FormData
): Promise<SubmitDraftState> {
  const captionId = String(formData.get("captionId") ?? "").trim();
  if (!captionId) {
    return { error: "ไม่พบข้อมูลชิ้นงาน กรุณารีเฟรชหน้านี้แล้วลองใหม่" };
  }

  const [current] = await db
    .select({
      title: captions.title,
      pendingDraftText: captions.pendingDraftText,
    })
    .from(captions)
    .where(and(eq(captions.id, captionId), eq(captions.isDeleted, false)));

  if (!current) {
    return { error: "ไม่พบชิ้นงานนี้ อาจถูกลบไปแล้ว" };
  }
  if (!current.title.trim()) {
    return { error: "หัวข้อสั้นยังว่างอยู่ กรุณากด \"แก้ไข\" แล้วกรอกหัวข้อก่อนส่งตรวจ" };
  }
  if (!current.pendingDraftText.trim()) {
    return { error: "ยังไม่มีตัวแคปชัน กรุณากด \"แก้ไข\" แล้วพิมพ์ข้อความก่อนส่งตรวจ" };
  }

  await saveAsPendingVersion(captionId, current.pendingDraftText);

  await db
    .update(captions)
    .set({ status: "pending_review", updatedAt: new Date() })
    .where(eq(captions.id, captionId));

  revalidatePath("/admin");
  revalidatePath(`/admin/${captionId}`);
  revalidatePath("/");
  redirect(`/admin/${captionId}`);
}

export type PublishState = {
  error?: string;
};

/**
 * "ลงแล้ว" (PRD 5.3) — กดเมื่อเอาไปโพสต์จริงแล้ว ทำได้เฉพาะชิ้นที่สถานะ "ผ่าน" เท่านั้น
 * ชิ้นงานจะย้ายไปอยู่ในคลังงานที่ผ่านแล้ว
 */
export async function markCaptionPublished(
  _prevState: PublishState,
  formData: FormData
): Promise<PublishState> {
  // กดได้ทีละหลายชิ้น — ส่ง captionId มาได้หลายค่าในครั้งเดียว
  const captionIds = formData
    .getAll("captionId")
    .map((v) => String(v).trim())
    .filter(Boolean);

  if (captionIds.length === 0) {
    return { error: "ไม่พบข้อมูลชิ้นงาน กรุณารีเฟรชหน้านี้แล้วลองใหม่" };
  }

  const updated = await db
    .update(captions)
    .set({ status: "published", updatedAt: new Date() })
    .where(
      and(
        inArray(captions.id, captionIds),
        eq(captions.isDeleted, false),
        eq(captions.status, "approved")
      )
    )
    .returning({ id: captions.id });

  if (updated.length === 0) {
    return { error: "ชิ้นงานนี้ไม่ได้อยู่ในสถานะ \"ผ่าน\" แล้ว กรุณารีเฟรชหน้านี้" };
  }

  revalidatePath("/admin");
  for (const id of captionIds) revalidatePath(`/admin/${id}`);
  revalidatePath("/archive");

  // กดจากรายการให้อยู่หน้าเดิม ไม่ต้องเด้งเข้าไปในชิ้นงาน
  // (เด้งเข้าไปเฉพาะตอนกดจากในหน้ารายละเอียดของชิ้นนั้นเอง)
  const stayHere = String(formData.get("stay") ?? "") === "1";
  if (stayHere) {
    return {};
  }
  redirect(`/admin/${captionIds[0]}`);
}

export type DeleteState = {
  error?: string;
};

/**
 * "ลบ" (PRD 5.3 / กฎข้อ 7) — ซ่อนออกจากทุกหน้า ไม่ได้ลบแถวออกจากฐานข้อมูลจริง
 * ทำได้ทุกสถานะ การถามยืนยันทำที่ฝั่ง client ก่อนเรียก action นี้
 */
export async function deleteCaption(
  _prevState: DeleteState,
  formData: FormData
): Promise<DeleteState> {
  const captionId = String(formData.get("captionId") ?? "").trim();
  if (!captionId) {
    return { error: "ไม่พบข้อมูลชิ้นงาน กรุณารีเฟรชหน้านี้แล้วลองใหม่" };
  }

  const updated = await db
    .update(captions)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(and(eq(captions.id, captionId), eq(captions.isDeleted, false)))
    .returning({ id: captions.id });

  if (updated.length === 0) {
    return { error: "ไม่พบชิ้นงานนี้ อาจถูกลบไปแล้ว" };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/archive");
  redirect("/admin");
}
