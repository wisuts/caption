import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { captions, captionVersions } from "@/lib/db/schema";
import type { Caption, CaptionVersion } from "@/lib/types";

type CaptionRow = typeof captions.$inferSelect;
type CaptionVersionRow = typeof captionVersions.$inferSelect;

function toCaption(row: CaptionRow, versionRows: CaptionVersionRow[]): Caption {
  const versions: CaptionVersion[] = versionRows
    .slice()
    .sort((a, b) => a.versionNumber - b.versionNumber)
    .map((v) => ({
      versionNumber: v.versionNumber,
      text: v.text,
      submittedAt: v.submittedAt.toISOString(),
      reviewResult: v.reviewResult,
      reviewComment: v.reviewComment,
      reviewedAt: v.reviewedAt ? v.reviewedAt.toISOString() : null,
    }));

  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    channel: row.channel,
    scheduledDate: row.scheduledDate,
    authorName: row.authorName,
    imageUrl: row.imageUrl,
    status: row.status,
    pendingDraftText: row.pendingDraftText,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    versions,
  };
}

/** ทุกชิ้นงานที่ยังไม่ถูกลบ เรียงตามความเคลื่อนไหวล่าสุด (PRD 5.1) */
export async function getAllCaptionsDb(): Promise<Caption[]> {
  const rows = await db.query.captions.findMany({
    where: eq(captions.isDeleted, false),
    orderBy: [desc(captions.updatedAt)],
    with: { versions: true },
  });
  return rows.map((row) => toCaption(row, row.versions));
}

export async function getCaptionByIdDb(id: string): Promise<Caption | undefined> {
  const row = await db.query.captions.findFirst({
    where: and(eq(captions.id, id), eq(captions.isDeleted, false)),
    with: { versions: true },
  });
  if (!row) return undefined;
  return toCaption(row, row.versions);
}

/** หน้าคิวรอตรวจ (PRD 4.1) — เฉพาะสถานะ "รอตรวจ" เรียงส่งเข้ามาใหม่สุดไว้บนสุด */
export async function getPendingReviewCaptionsDb(): Promise<Caption[]> {
  const rows = await db.query.captions.findMany({
    where: and(eq(captions.isDeleted, false), eq(captions.status, "pending_review")),
    orderBy: [desc(captions.updatedAt)],
    with: { versions: true },
  });
  return rows.map((row) => toCaption(row, row.versions));
}

/** คลังงานที่ผ่านแล้ว (PRD 4.3) — สถานะ "ผ่าน" และ "ลงแล้ว" เท่านั้น */
export async function getArchivedCaptionsDb(): Promise<Caption[]> {
  const rows = await db.query.captions.findMany({
    where: and(
      eq(captions.isDeleted, false),
      inArray(captions.status, ["approved", "published"])
    ),
    orderBy: [desc(captions.updatedAt)],
    with: { versions: true },
  });
  return rows.map((row) => toCaption(row, row.versions));
}
