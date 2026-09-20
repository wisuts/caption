"use client";

import { CaptionTabs } from "@/components/caption-tabs";
import { VersionTimeline } from "@/components/version-timeline";
import { orderNotesByPosition } from "@/lib/order-notes-by-position";
import type { CaptionVersion } from "@/lib/types";

/**
 * มุมมองอ่านอย่างเดียว สำหรับชิ้นงานที่ตรวจเสร็จแล้ว (ไม่มีปุ่มผ่าน/ขอแก้)
 * จัดหน้าแบบเดียวกับตอนกำลังตรวจ จะได้ไม่ต้องปรับสายตาใหม่เวลาสลับไปมา
 */
export function CaptionReader({
  versionNumber,
  text,
  versions,
  previousText,
}: {
  versionNumber: number;
  text: string;
  versions: CaptionVersion[];
  previousText?: string;
}) {
  const latest = versions.find((v) => v.versionNumber === versionNumber);
  const marks = latest
    ? orderNotesByPosition(text, latest.notes)
        .filter((n) => n.original.quotedText !== null)
        .map((n) => ({
          quotedText: n.original.quotedText as string,
          index: n.index,
        }))
    : [];

  return (
    <div className="flex flex-col gap-space-lg">
      <CaptionTabs
        versionNumber={versionNumber}
        text={text}
        versions={versions}
        previousText={previousText}
        marks={marks}
      />

      <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h2 className="text-headline-sm text-on-surface">ประวัติเวอร์ชันทั้งหมด</h2>
        {versions.length > 0 ? (
          <VersionTimeline versions={versions} />
        ) : (
          <p className="text-body-sm text-on-surface-variant">ยังไม่เคยส่งตรวจ</p>
        )}
      </section>
    </div>
  );
}
