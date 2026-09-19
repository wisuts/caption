"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { captions, captionVersions } from "@/lib/db/schema";
import { BRANDS, CHANNELS, type Brand, type Channel } from "@/lib/types";

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
  const imageUrlRaw = String(formData.get("imageUrl") ?? "").trim();
  const captionText = String(formData.get("captionText") ?? "").trim();

  const brand: Brand = BRANDS.includes(brandRaw as Brand)
    ? (brandRaw as Brand)
    : BRANDS[0];
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
    imageUrl: imageUrlRaw || null,
    captionText,
  };
}

/**
 * "บันทึกไว้ก่อน" (PRD 5.2) — บันทึกข้อความไว้เฉย ๆ ไม่เปลี่ยนสถานะ
 * ถ้าเป็นชิ้นใหม่สถานะเป็น "ร่าง" ถ้าชิ้นนั้น "รอตรวจ" อยู่แล้ว หัวหน้าจะยังเห็นข้อความเดิม
 * (การแก้ไม่สร้างเวอร์ชันใหม่ — เก็บไว้ที่ pendingDraftText เท่านั้น)
 */
export async function saveCaptionDraft(
  _prevState: CaptionFormState,
  formData: FormData
): Promise<CaptionFormState> {
  const fields = readCommonFields(formData);

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
  if (!fields.captionText) errors.captionText = "กรุณาพิมพ์ตัวแคปชัน";
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

  const [{ nextVersion }] = await db
    .select({
      nextVersion: sql<number>`coalesce(max(${captionVersions.versionNumber}), 0) + 1`,
    })
    .from(captionVersions)
    .where(eq(captionVersions.captionId, captionId));

  await db.insert(captionVersions).values({
    captionId,
    versionNumber: nextVersion,
    text: fields.captionText,
    reviewResult: "pending",
  });

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

  const [{ nextVersion }] = await db
    .select({
      nextVersion: sql<number>`coalesce(max(${captionVersions.versionNumber}), 0) + 1`,
    })
    .from(captionVersions)
    .where(eq(captionVersions.captionId, captionId));

  await db.insert(captionVersions).values({
    captionId,
    versionNumber: nextVersion,
    text: current.pendingDraftText,
    reviewResult: "pending",
  });

  await db
    .update(captions)
    .set({ status: "pending_review", updatedAt: new Date() })
    .where(eq(captions.id, captionId));

  revalidatePath("/admin");
  revalidatePath(`/admin/${captionId}`);
  revalidatePath("/");
  redirect(`/admin/${captionId}`);
}
