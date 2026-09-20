import { Fragment } from "react";

export interface HighlightMark {
  /** ข้อความที่ต้องไฮไลต์ */
  quotedText: string;
  /** เลขกำกับที่จะโชว์ติดกับจุดไฮไลต์ — ไม่ใส่ถ้าไม่ต้องการเลข */
  index?: number | null;
  /** สีของไฮไลต์: เหลือง = จุดของรอบนี้, แดง = จุดที่สั่งไว้รอบที่แล้วแต่ยังไม่ได้แก้ */
  tone?: "amber" | "rose";
}

const TONE_STYLE = {
  amber: { mark: "bg-amber-200", badge: "bg-amber-600" },
  rose: { mark: "bg-rose-200", badge: "bg-rose-600" },
} as const;

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
  // ปรับให้ตัดขึ้นบรรทัดใหม่แบบเดียวกันหมด (\r\n หรือ \n) ก่อนค้นหา
  // เพราะข้อความที่ลากคลุมจากเบราว์เซอร์จะได้ \n เสมอ แต่ข้อความที่วางมาจากที่อื่นอาจเป็น \r\n
  const normalizedText = text.replace(/\r\n/g, "\n");
  const cleanMarks = marks
    .map((m) => ({ ...m, quotedText: m.quotedText.replace(/\r\n/g, "\n") }))
    .filter((m) => m.quotedText.trim().length > 0);

  if (cleanMarks.length === 0) {
    return <span className="whitespace-pre-line">{normalizedText}</span>;
  }

  type Range = {
    start: number;
    end: number;
    index?: number | null;
    tone: "amber" | "rose";
  };
  const ranges: Range[] = [];
  for (const mark of cleanMarks) {
    const quote = mark.quotedText.trim();
    const start = normalizedText.indexOf(quote);
    if (start === -1) continue;
    const end = start + quote.length;
    const overlaps = ranges.some((r) => start < r.end && end > r.start);
    if (!overlaps) {
      ranges.push({ start, end, index: mark.index, tone: mark.tone ?? "amber" });
    }
  }
  ranges.sort((a, b) => a.start - b.start);

  if (ranges.length === 0) {
    return <span className="whitespace-pre-line">{normalizedText}</span>;
  }

  const segments: (
    | { text: string; highlighted: false }
    | {
        text: string;
        highlighted: true;
        index?: number | null;
        tone: "amber" | "rose";
      }
  )[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start > cursor) {
      segments.push({ text: normalizedText.slice(cursor, r.start), highlighted: false });
    }
    segments.push({
      text: normalizedText.slice(r.start, r.end),
      highlighted: true,
      index: r.index,
      tone: r.tone,
    });
    cursor = r.end;
  }
  if (cursor < normalizedText.length) {
    segments.push({ text: normalizedText.slice(cursor), highlighted: false });
  }

  return (
    <span className="whitespace-pre-line">
      {segments.map((seg, i) => (
        <Fragment key={i}>
          {seg.highlighted ? (
            <mark
              className={`rounded px-0.5 text-inherit ${TONE_STYLE[seg.tone].mark}`}
            >
              {seg.text}
              {seg.index != null && (
                <span
                  className={`ml-0.5 inline-flex h-4 w-4 -translate-y-1 items-center justify-center rounded-full align-super text-[10px] font-bold text-white ${TONE_STYLE[seg.tone].badge}`}
                >
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
