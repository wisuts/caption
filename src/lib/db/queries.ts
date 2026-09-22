import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { captions, captionVersions, reviewNotes } from "@/lib/db/schema";
import type { Caption, CaptionVersion, ReviewNote } from "@/lib/types";
import { parseBrands } from "@/lib/brands";

type CaptionRow = typeof captions.$inferSelect;
type ReviewNoteRow = typeof reviewNotes.$inferSelect;
type CaptionVersionRow = typeof captionVersions.$inferSelect & {
  notes: ReviewNoteRow[];
};

const versionsWithNotes = { with: { notes: true } } as const;

function toCaption(row: CaptionRow, versionRows: CaptionVersionRow[]): Caption {
  const versions: CaptionVersion[] = versionRows
    .slice()
    .sort((a, b) => a.versionNumber - b.versionNumber)
    .map((v) => {
      const notes: ReviewNote[] = v.notes
        .slice()
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((n) => ({
          id: n.id,
          quotedText: n.quotedText,
          note: n.note,
          createdAt: n.createdAt.toISOString(),
        }));

      return {
        versionNumber: v.versionNumber,
        text: v.text,
        submittedAt: v.submittedAt.toISOString(),
        reviewResult: v.reviewResult,
        notes,
        reviewedAt: v.reviewedAt ? v.reviewedAt.toISOString() : null,
      };
    });

  return {
    id: row.id,
    title: row.title,
    brands: parseBrands(row.brand),
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
    with: { versions: versionsWithNotes },
  });
  return rows.map((row) => toCaption(row, row.versions));
}

export async function getCaptionByIdDb(id: string): Promise<Caption | undefined> {
  const row = await db.query.captions.findFirst({
    where: and(eq(captions.id, id), eq(captions.isDeleted, false)),
    with: { versions: versionsWithNotes },
  });
  if (!row) return undefined;
  return toCaption(row, row.versions);
}

/** หน้าคิวรอตรวจ (PRD 4.1) — เฉพาะสถานะ "รอตรวจ" เรียงส่งเข้ามาใหม่สุดไว้บนสุด */
export async function getPendingReviewCaptionsDb(): Promise<Caption[]> {
  const rows = await db.query.captions.findMany({
    where: and(eq(captions.isDeleted, false), eq(captions.status, "pending_review")),
    orderBy: [desc(captions.updatedAt)],
    with: { versions: versionsWithNotes },
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
    with: { versions: versionsWithNotes },
  });
  return rows.map((row) => toCaption(row, row.versions));
}
