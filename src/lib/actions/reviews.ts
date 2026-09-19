"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { captions, captionVersions } from "@/lib/db/schema";

export type ReviewActionState = {
  error?: string;
};

async function applyReview(
  formData: FormData,
  result: "approved" | "changes_requested"
): Promise<ReviewActionState> {
  const captionId = String(formData.get("captionId") ?? "").trim();
  const versionNumber = Number(formData.get("versionNumber"));
  const comment = String(formData.get("comment") ?? "").trim();

  // กด "ขอแก้" โดยไม่พิมพ์คอมเมนต์ไม่ได้ (PRD กฎข้อ 7)
  if (result === "changes_requested" && !comment) {
    return { error: "กรุณาพิมพ์สิ่งที่ต้องการให้แก้ไขก่อนกดขอแก้" };
  }

  if (!captionId || !versionNumber) {
    return { error: "ไม่พบข้อมูลชิ้นงาน กรุณารีเฟรชหน้านี้แล้วลองใหม่" };
  }

  // ตรวจได้เฉพาะเวอร์ชันที่ "ยังไม่ตรวจ" เท่านั้น (กันตรวจซ้ำ / ตรวจข้ามเวอร์ชัน)
  const updatedVersion = await db
    .update(captionVersions)
    .set({
      reviewResult: result,
      reviewComment: result === "changes_requested" ? comment : null,
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
