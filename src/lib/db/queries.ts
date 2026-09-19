import { and, desc, eq } from "drizzle-orm";
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
