import { diffLines } from "@/lib/diff-lines";

/**
 * มุมมอง "เปลี่ยนอะไรไปบ้าง" — เขียว = ข้อความใหม่รอบนี้, ขีดฆ่าเทา = ของเดิมที่ถูกแทนที่
 * ช่วยให้หัวหน้ากวาดตาดูรอบเดียวรู้ว่าคนแก้แตะตรงไหนไปบ้าง รวมถึงจุดที่ไม่ได้สั่งให้แก้ด้วย
 */
export function CaptionDiffView({
  previousText,
  currentText,
}: {
  previousText: string;
  currentText: string;
}) {
  const lines = diffLines(previousText, currentText);
  const changedCount = lines.filter((l) => l.type === "added").length;
  const removedCount = lines.filter((l) => l.type === "removed").length;

  return (
    <div className="flex flex-col gap-space-sm">
      <p className="text-label-sm text-on-surface-variant">
        {changedCount === 0 && removedCount === 0
          ? "ข้อความเหมือนเดิมทุกบรรทัด ไม่มีอะไรเปลี่ยน"
          : `ข้อความใหม่/แก้ไข ${changedCount} บรรทัด · ของเดิมที่ถูกแทนที่หรือลบออก ${removedCount} บรรทัด`}
      </p>
      <div className="whitespace-pre-wrap break-words text-body-lg text-on-surface">
        {lines.map((line, i) =>
          line.type === "same" ? (
            <div key={i}>{line.text || " "}</div>
          ) : line.type === "added" ? (
            <div key={i} className="rounded bg-emerald-100 px-1">
              {line.text || " "}
            </div>
          ) : (
            <div
              key={i}
              className="rounded bg-surface-container-high/60 px-1 text-on-surface-variant line-through"
            >
              {line.text || " "}
            </div>
          )
        )}
      </div>
    </div>
  );
}
