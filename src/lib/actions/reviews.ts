"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { captions, captionVersions, reviewNotes } from "@/lib/db/schema";

export type ReviewActionState = {
  error?: string;
};

type IncomingNote = {
  quotedText: string | null;
  note: string;
};

/** อ่านและทำความสะอาดรายการโน้ตที่ฝั่ง client ส่งมาเป็น JSON */
function parseNotes(raw: string): IncomingNote[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const note = String((item as Record<string, unknown>).note ?? "").trim();
      const quotedRaw = (item as Record<string, unknown>).quotedText;
      const quotedText =
        typeof quotedRaw === "string" && quotedRaw.trim() ? quotedRaw.trim() : null;
      if (!note) return null;
      return { quotedText, note };
    })
    .filter((n): n is IncomingNote => n !== null);
}

async function applyReview(
  formData: FormData,
  result: "approved" | "changes_requested"
): Promise<ReviewActionState> {
  const captionId = String(formData.get("captionId") ?? "").trim();
  const versionNumber = Number(formData.get("versionNumber"));
  const notes = parseNotes(String(formData.get("notesJson") ?? "[]"));

  // กด "ขอแก้" ต้องมีโน้ตอย่างน้อย 1 อัน (ชี้จุดหรือโน้ตรวมก็ได้) — PRD กฎข้อ 7
  if (result === "changes_requested" && notes.length === 0) {
    return {
      error:
        "กรุณาเพิ่มโน้ตอย่างน้อย 1 จุด (ลากคลุมข้อความแล้วพิมพ์ หรือพิมพ์โน้ตรวม) ก่อนกดขอแก้",
    };
  }

  if (!captionId || !versionNumber) {
    return { error: "ไม่พบข้อมูลชิ้นงาน กรุณารีเฟรชหน้านี้แล้วลองใหม่" };
  }

  // ตรวจได้เฉพาะเวอร์ชันที่ "ยังไม่ตรวจ" เท่านั้น (กันตรวจซ้ำ / ตรวจข้ามเวอร์ชัน)
  const updatedVersion = await db
    .update(captionVersions)
    .set({
      reviewResult: result,
      reviewedAt: new Date(),
    })
    .where(
      and(
        eq(captionVersions.captionId, captionId),
        eq(captionVersions.versionNumber, versionNumber),
        eq(captionVersions.reviewResult, "pending")
      )
    )
    .returning({ id: captionVersions.id });

  if (updatedVersion.length === 0) {
    const [latest] = await db
      .select({ versionNumber: captionVersions.versionNumber })
      .from(captionVersions)
      .where(eq(captionVersions.captionId, captionId))
      .orderBy(desc(captionVersions.versionNumber))
      .limit(1);

    if (latest && latest.versionNumber !== versionNumber) {
      return { error: "ชิ้นงานนี้มีเวอร์ชันใหม่กว่าแล้ว กรุณารีเฟรชหน้านี้" };
    }
    return { error: "ชิ้นงานนี้ถูกตรวจไปแล้ว" };
  }

  const versionId = updatedVersion[0].id;

  if (notes.length > 0) {
    await db.insert(reviewNotes).values(
      notes.map((n) => ({
        versionId,
        quotedText: n.quotedText,
        note: n.note,
      }))
    );
  }

  await db
    .update(captions)
    .set({ status: result, updatedAt: new Date() })
    .where(
      and(eq(captions.id, captionId), eq(captions.status, "pending_review"))
    );

  revalidatePath("/");
  revalidatePath(`/items/${captionId}`);
  revalidatePath("/admin");
  revalidatePath(`/admin/${captionId}`);
  redirect("/");
}

export async function approveCaption(
  _prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  return applyReview(formData, "approved");
}

export async function requestChanges(
  _prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  return applyReview(formData, "changes_requested");
}
