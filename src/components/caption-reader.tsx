"use client";

import { CaptionTabs } from "@/components/caption-tabs";
import { orderNotesByPosition } from "@/lib/order-notes-by-position";
import type { CaptionVersion } from "@/lib/types";

/**
 * มุมมองอ่านอย่างเดียว สำหรับชิ้นงานที่ตรวจเสร็จแล้ว (ไม่มีปุ่มผ่าน/ขอแก้)
 * จัดหน้าแบบเดียวกับตอนกำลังตรวจ จะได้ไม่ต้องปรับสายตาใหม่เวลาสลับไปมา
 * เวอร์ชันเก่าดูผ่านแท็บเอา ไม่ต้องมีช่องประวัติยาว ๆ ต่อท้ายอีก
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
    <CaptionTabs
      versionNumber={versionNumber}
      text={text}
      versions={versions}
      previousText={previousText}
      marks={marks}
    />
  );
}
