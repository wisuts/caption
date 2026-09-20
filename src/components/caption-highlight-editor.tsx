"use client";

import { useMemo, useRef, useState } from "react";
import type { ReviewNote } from "@/lib/types";
import { orderNotesByPosition } from "@/lib/order-notes-by-position";

/** คลาสที่ช่องพิมพ์กับแผ่นระบายสีต้องเหมือนกันเป๊ะ ไม่งั้นตัวหนังสือจะเหลื่อมกัน */
const SHARED_TEXT_STYLE =
  "w-full whitespace-pre-wrap break-words border border-transparent px-2.5 py-2 text-body-lg";

type Segment = { text: string; start: number; noteNumber: number | null };

/** ตัดข้อความเป็นท่อน ๆ คั่นด้วยจุดที่ต้องระบายสี (ไม่ให้ทับกันเอง) */
function buildSegments(
  text: string,
  marks: { quotedText: string; number: number }[]
): Segment[] {
  const ranges: { start: number; end: number; number: number }[] = [];
  for (const mark of marks) {
    const quote = mark.quotedText.replace(/\r\n/g, "\n").trim();
    if (!quote) continue;
    const start = text.indexOf(quote);
    if (start === -1) continue;
    const end = start + quote.length;
    if (ranges.some((r) => start < r.end && end > r.start)) continue;
    ranges.push({ start, end, number: mark.number });
  }
  ranges.sort((a, b) => a.start - b.start);

  const segments: Segment[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start > cursor) {
      segments.push({
        text: text.slice(cursor, r.start),
        start: cursor,
        noteNumber: null,
      });
    }
    segments.push({
      text: text.slice(r.start, r.end),
      start: r.start,
      noteNumber: r.number,
    });
    cursor = r.end;
  }
  segments.push({ text: text.slice(cursor), start: cursor, noteNumber: null });
  return segments;
}

/**
 * ช่องพิมพ์แคปชันที่ระบายสีจุดที่หัวหน้าขอให้แก้ได้จริง (PRD 5.2)
 * วิธีทำ: ซ้อน "แผ่นระบายสี" ไว้ข้างหลังช่องพิมพ์ธรรมดา โดยใช้ตัวอักษร ระยะห่าง
 * และการตัดบรรทัดชุดเดียวกันเป๊ะ ๆ แผ่นหลังโชว์เฉพาะแถบสี ส่วนตัวหนังสือจริง
 * ยังเป็นของช่องพิมพ์เดิม จึงพิมพ์/ก็อปวาง/ใส่อีโมจิได้เหมือนเดิมทุกอย่าง
 */
export function CaptionHighlightEditor({
  name,
  defaultValue,
  reviewedText,
  notes,
  invalid,
}: {
  name: string;
  defaultValue: string;
  /** ข้อความของเวอร์ชันที่หัวหน้าตรวจ ใช้กำหนดเลขกำกับให้ตรงกับหน้ารายละเอียด */
  reviewedText: string;
  notes: ReviewNote[];
  invalid?: boolean;
}) {
  // ปรับการขึ้นบรรทัดใหม่ให้เป็นแบบเดียวกันตั้งแต่แรก ข้อความที่หัวหน้าลากคลุมไว้จะได้ตรงกัน
  const [text, setText] = useState(() => defaultValue.replace(/\r\n/g, "\n"));
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // เลขกำกับยึดจากข้อความตอนที่หัวหน้าตรวจ จะได้ไม่สลับเลขไปมาระหว่างพิมพ์แก้
  const numbered = useMemo(() => {
    const ordered = orderNotesByPosition(reviewedText, notes);
    return ordered.map(({ index, original }) => ({ number: index, note: original }));
  }, [reviewedText, notes]);

  const pointMarks = numbered
    .filter((n) => n.note.quotedText !== null && n.number !== null)
    .map((n) => ({ quotedText: n.note.quotedText as string, number: n.number as number }));

  const segments = buildSegments(text, pointMarks);
  const stillInText = new Set(
    segments.filter((s) => s.noteNumber !== null).map((s) => s.noteNumber)
  );

  function syncScroll() {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }

  /** กดที่โน้ต → เลื่อนช่องพิมพ์ไปหาประโยคนั้นแล้วคลุมข้อความให้เลย พิมพ์ทับได้ทันที */
  function jumpToNote(quotedText: string | null) {
    const textarea = textareaRef.current;
    if (!textarea || !quotedText) return;
    const quote = quotedText.replace(/\r\n/g, "\n").trim();
    const start = text.indexOf(quote);
    if (start === -1) return;

    // ต้อง focus ก่อนแล้วค่อยเลื่อน ไม่งั้นการ focus จะดีดกลับไปบนสุดเอง
    textarea.focus();
    textarea.setSelectionRange(start, start + quote.length);

    const mark = backdropRef.current?.querySelector<HTMLElement>(
      `[data-start="${start}"]`
    );
    if (mark) {
      textarea.scrollTop = Math.max(0, mark.offsetTop - 48);
      syncScroll();
    }
  }

  function toggleDone(id: string) {
    setDoneIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="grid grid-cols-1 gap-space-md lg:grid-cols-12">
      <div className="lg:col-span-7 xl:col-span-8">
        <div className="relative h-[60vh] overflow-hidden rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 aria-invalid:border-destructive" aria-invalid={invalid}>
          <div
            ref={backdropRef}
            aria-hidden
            className={`pointer-events-none absolute inset-0 overflow-hidden text-transparent ${SHARED_TEXT_STYLE}`}
          >
            {segments.map((seg, i) =>
              seg.noteNumber === null ? (
                <span key={i}>{seg.text}</span>
              ) : (
                <mark
                  key={i}
                  data-start={seg.start}
                  className="rounded bg-amber-200 text-transparent"
                >
                  {seg.text}
                  <span className="relative inline-block w-0 align-baseline">
                    <span className="absolute -top-1 left-0 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
                      {seg.noteNumber}
                    </span>
                  </span>
                </mark>
              )
            )}
            {"\n"}
          </div>
          <textarea
            ref={textareaRef}
            id="captionText"
            name={name}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onScroll={syncScroll}
            placeholder="พิมพ์แคปชันที่นี่..."
            className={`absolute inset-0 resize-none bg-transparent text-on-surface outline-none ${SHARED_TEXT_STYLE}`}
          />
        </div>
      </div>

      {/* แถบโน้ตติดหน้าจอ เลื่อนพิมพ์ยังไงก็ยังเห็นว่าหัวหน้าสั่งแก้อะไรไว้บ้าง */}
      <aside className="flex flex-col gap-space-sm lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 lg:h-[60vh] lg:self-start">
        <h3 className="shrink-0 text-label-md font-semibold text-on-surface">
          หัวหน้าขอให้แก้ ({doneIds.length}/{numbered.length} แก้แล้ว)
        </h3>
        <ul className="flex flex-1 flex-col gap-space-xs overflow-y-auto">
          {numbered.map(({ number, note }) => {
            const isDone = doneIds.includes(note.id);
            const isGone = number !== null && !stillInText.has(number);
            return (
              <li
                key={note.id}
                className={`flex flex-col gap-1 rounded-lg p-space-sm ${
                  isDone ? "bg-surface-container-low/50 opacity-60" : "bg-surface-container-low"
                }`}
              >
                <div className="flex items-start gap-space-xs">
                  {number != null ? (
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[11px] font-bold text-white">
                      {number}
                    </span>
                  ) : (
                    <span className="mt-0.5 rounded bg-surface-container-high px-1.5 text-label-sm text-on-surface-variant">
                      รวม
                    </span>
                  )}
                  <div className="flex flex-col gap-1">
                    {note.quotedText && (
                      <button
                        type="button"
                        onClick={() => jumpToNote(note.quotedText)}
                        disabled={isGone}
                        className="w-fit rounded bg-amber-200 px-1.5 py-0.5 text-left text-label-sm text-amber-950 hover:bg-amber-300 disabled:cursor-default disabled:bg-surface-container-high disabled:text-on-surface-variant"
                      >
                        “{note.quotedText}”
                      </button>
                    )}
                    <span className="text-body-sm italic text-on-surface">
                      {note.note}
                    </span>
                    {isGone && (
                      <span className="text-label-sm text-on-surface-variant">
                        (แก้ข้อความตรงนี้ไปแล้ว)
                      </span>
                    )}
                  </div>
                </div>
                <label className="flex w-fit cursor-pointer items-center gap-1.5 text-label-sm text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggleDone(note.id)}
                    className="size-3.5 accent-primary"
                  />
                  แก้แล้ว
                </label>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
