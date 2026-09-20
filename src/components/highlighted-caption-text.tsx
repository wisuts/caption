import { Fragment } from "react";

/**
 * แสดงข้อความแคปชัน โดยไฮไลต์ส่วนที่ตรงกับ "ข้อความที่ลากคลุมไว้" ของแต่ละโน้ต
 * (quotedText) ด้วยพื้นหลังสีเหลือง ไม่ต้องพึ่งตำแหน่งตัวอักษร เพราะข้อความของ
 * เวอร์ชันที่ตรวจแล้วไม่มีวันเปลี่ยนอีก จับคู่ด้วยการค้นหาข้อความตรง ๆ ก็แม่นยำพอ
 */
export function HighlightedCaptionText({
  text,
  quotes,
}: {
  text: string;
  quotes: string[];
}) {
  const cleanQuotes = quotes
    .map((q) => q.trim())
    .filter((q, i, arr) => q.length > 0 && arr.indexOf(q) === i);

  if (cleanQuotes.length === 0) {
    return <span className="whitespace-pre-line">{text}</span>;
  }

  // หาตำแหน่งที่แต่ละ quote เจอครั้งแรกในข้อความ แล้วเรียงตามตำแหน่ง ไม่ให้ซ้อนกัน
  type Range = { start: number; end: number };
  const ranges: Range[] = [];
  for (const quote of cleanQuotes) {
    const index = text.indexOf(quote);
    if (index === -1) continue;
    const start = index;
    const end = index + quote.length;
    const overlaps = ranges.some((r) => start < r.end && end > r.start);
    if (!overlaps) ranges.push({ start, end });
  }
  ranges.sort((a, b) => a.start - b.start);

  if (ranges.length === 0) {
    return <span className="whitespace-pre-line">{text}</span>;
  }

  const segments: { text: string; highlighted: boolean }[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start > cursor) {
      segments.push({ text: text.slice(cursor, r.start), highlighted: false });
    }
    segments.push({ text: text.slice(r.start, r.end), highlighted: true });
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
            </mark>
          ) : (
            seg.text
          )}
        </Fragment>
      ))}
    </span>
  );
}
