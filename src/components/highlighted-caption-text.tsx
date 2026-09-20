import { Fragment } from "react";

export interface HighlightMark {
  /** ข้อความที่ต้องไฮไลต์ */
  quotedText: string;
  /** เลขกำกับที่จะโชว์ติดกับจุดไฮไลต์ — ไม่ใส่ถ้าไม่ต้องการเลข */
  index?: number | null;
}

/**
 * แสดงข้อความแคปชัน โดยไฮไลต์ส่วนที่ตรงกับ "ข้อความที่ลากคลุมไว้" ของแต่ละโน้ต
 * พร้อมเลขกำกับ (ถ้ามี) เพื่อให้จับคู่กับคอมเมนต์ในลิสต์ได้ทันทีแบบเชิงอรรถ
 * ไม่ต้องพึ่งตำแหน่งตัวอักษร เพราะข้อความของเวอร์ชันที่ตรวจแล้วไม่มีวันเปลี่ยนอีก
 * จับคู่ด้วยการค้นหาข้อความตรง ๆ ก็แม่นยำพอ
 */
export function HighlightedCaptionText({
  text,
  marks,
}: {
  text: string;
  marks: HighlightMark[];
}) {
  const cleanMarks = marks.filter((m) => m.quotedText.trim().length > 0);

  if (cleanMarks.length === 0) {
    return <span className="whitespace-pre-line">{text}</span>;
  }

  type Range = { start: number; end: number; index?: number | null };
  const ranges: Range[] = [];
  for (const mark of cleanMarks) {
    const quote = mark.quotedText.trim();
    const start = text.indexOf(quote);
    if (start === -1) continue;
    const end = start + quote.length;
    const overlaps = ranges.some((r) => start < r.end && end > r.start);
    if (!overlaps) ranges.push({ start, end, index: mark.index });
  }
  ranges.sort((a, b) => a.start - b.start);

  if (ranges.length === 0) {
    return <span className="whitespace-pre-line">{text}</span>;
  }

  const segments: (
    | { text: string; highlighted: false }
    | { text: string; highlighted: true; index?: number | null }
  )[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start > cursor) {
      segments.push({ text: text.slice(cursor, r.start), highlighted: false });
    }
    segments.push({
      text: text.slice(r.start, r.end),
      highlighted: true,
      index: r.index,
    });
    cursor = r.end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false });
  }

  return (
    <span className="whitespace-pre-line">
      {segments.map((seg, i) => (
        <Fragment key={i}>
          {seg.highlighted ? (
            <mark className="rounded bg-amber-200 px-0.5 text-inherit">
              {seg.text}
              {seg.index != null && (
                <span className="ml-0.5 inline-flex h-4 w-4 -translate-y-1 items-center justify-center rounded-full bg-amber-600 align-super text-[10px] font-bold text-white">
                  {seg.index}
                </span>
              )}
            </mark>
          ) : (
            seg.text
          )}
        </Fragment>
      ))}
    </span>
  );
}
