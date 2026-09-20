"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CaptionTabs } from "@/components/caption-tabs";
import { VersionTimeline } from "@/components/version-timeline";
import { orderNotesByPosition } from "@/lib/order-notes-by-position";
import { getPreviousRoundNotes } from "@/lib/previous-round-status";
import type { CaptionVersion, ReviewNote } from "@/lib/types";
import {
  approveCaption,
  requestChanges,
  type ReviewActionState,
} from "@/lib/actions/reviews";

const EMPTY_STATE: ReviewActionState = {};

type DraftNote = {
  clientId: string;
  quotedText: string | null;
  note: string;
};

// พื้นที่ตรวจแคปชัน (PRD 4.2 + ฟีเจอร์ลากคลุมคอมเมนต์เฉพาะจุด)
// หัวหน้าลากคลุมข้อความในแคปชันแล้วพิมพ์โน้ตได้หลายจุด หรือจะพิมพ์โน้ตรวมก็ได้
// กล่องตรวจพิจารณา + ประวัติเวอร์ชัน "ติดหน้าจอ" อยู่ทางขวา ให้อ่านแคปชันยาว ๆ
// พร้อมเขียนโน้ตไปด้วยกันได้โดยไม่ต้องเลื่อนหา
export function ReviewWorkspace({
  captionId,
  versionNumber,
  text,
  versions,
  previousVersionNumber,
  previousText,
  previousNotes,
}: {
  captionId: string;
  versionNumber: number;
  text: string;
  versions: CaptionVersion[];
  /** เวอร์ชันก่อนหน้าที่เคยสั่งแก้ไว้ — ใช้บอกว่ารอบนี้แก้ตามที่สั่งครบหรือยัง */
  previousVersionNumber?: number;
  previousText?: string;
  previousNotes?: ReviewNote[];
}) {
  const [approveState, approveAction, isApproving] = useActionState(
    approveCaption,
    EMPTY_STATE
  );
  const [changesState, changesAction, isRequestingChanges] = useActionState(
    requestChanges,
    EMPTY_STATE
  );

  const [notes, setNotes] = useState<DraftNote[]>([]);
  const [pendingSelection, setPendingSelection] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const textRef = useRef<HTMLDivElement>(null);

  const error = changesState.error ?? approveState.error;
  const isPending = isApproving || isRequestingChanges;

  function handleMouseUp() {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    // รับเฉพาะข้อความที่หาเจอจริงในแคปชัน กันกรณีลากคลุมคร่อมบรรทัดของเดิมในโหมดเทียบ
    if (
      selectedText &&
      selectedText.length > 0 &&
      textRef.current &&
      selection &&
      textRef.current.contains(selection.anchorNode) &&
      text.replace(/\r\n/g, "\n").includes(selectedText)
    ) {
      setPendingSelection(selectedText);
    }
  }

  function addNote() {
    const noteText = noteDraft.trim();
    if (!noteText) return;
    setNotes((prev) => [
      ...prev,
      { clientId: crypto.randomUUID(), quotedText: pendingSelection, note: noteText },
    ]);
    setNoteDraft("");
    setPendingSelection(null);
    window.getSelection()?.removeAllRanges();
  }

  function removeNote(clientId: string) {
    setNotes((prev) => prev.filter((n) => n.clientId !== clientId));
  }

  const notesJson = JSON.stringify(
    notes.map((n) => ({ quotedText: n.quotedText, note: n.note }))
  );

  // เลขกำกับตามตำแหน่งที่ปรากฏในข้อความ ให้ตรงกับที่ไฮไลต์ในเนื้อแคปชัน
  // (รวมจุดที่กำลังลากคลุมค้างไว้ตอนนี้ด้วย เพื่อโชว์เลขล่วงหน้าก่อนกดเพิ่ม)
  const PENDING_ID = "__pending__";
  const notesForOrdering = [
    ...notes.map((n) => ({ id: n.clientId, quotedText: n.quotedText })),
    ...(pendingSelection ? [{ id: PENDING_ID, quotedText: pendingSelection }] : []),
  ];
  const ordered = orderNotesByPosition(text, notesForOrdering);
  const indexById = new Map(ordered.map((o) => [o.original.id, o.index]));
  const pendingIndex = indexById.get(PENDING_ID) ?? null;

  // เทียบกับรอบที่แล้วว่าสั่งแก้อะไรไว้ และตรงไหนที่ยังไม่ได้แตะเลย
  const previousRound =
    previousText && previousNotes && previousNotes.length > 0
      ? getPreviousRoundNotes(previousText, previousNotes, text)
      : [];
  const untouched = previousRound.filter((p) => p.status === "untouched");
  const addressedCount = previousRound.filter(
    (p) => p.status === "addressed"
  ).length;

  // จุดที่สั่งไว้รอบที่แล้วแต่ยังอยู่เหมือนเดิม ระบายสีแดงไว้ให้เห็นทันทีว่าตกหล่น
  const marks = [
    ...ordered
      .filter((o) => o.original.quotedText !== null)
      .map((o) => ({
        quotedText: o.original.quotedText as string,
        index: o.index,
        tone: "amber" as const,
      })),
    ...untouched
      .filter((p) => p.note.quotedText !== null)
      .map((p) => ({
        quotedText: p.note.quotedText as string,
        index: p.number,
        tone: "rose" as const,
      })),
  ];

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-12">
      <div className="flex flex-col gap-space-lg lg:col-span-7 xl:col-span-8">
        <CaptionTabs
          versionNumber={versionNumber}
          text={text}
          versions={versions}
          previousText={previousText}
          marks={marks}
          textRef={textRef}
          onMouseUp={handleMouseUp}
          selectable
        />
      </div>

      {/* ติดหน้าจอไว้ทางขวา (เฉพาะจอกว้าง) เหลือเฉพาะเรื่อง "ตรวจงาน" ล้วน ๆ
          ส่วนเรื่อง "อ่านเนื้อหา" ย้ายไปอยู่ในแท็บของกล่องใหญ่ฝั่งซ้ายหมดแล้ว
          กล่องตรวจอยู่นิ่งเสมอ ถ้าเช็กลิสต์ยาวเกินจะเลื่อนแยกในตัวเอง */}
      <div className="flex min-h-0 flex-col gap-space-lg lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start">
        {previousRound.length > 0 && (
          <section className="flex min-h-0 flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <h2 className="shrink-0 text-headline-sm text-on-surface">
              รอบที่แล้วคุณขอแก้ {previousRound.length} จุด
            </h2>
            <p className="shrink-0 text-label-sm text-on-surface-variant">
              แก้แล้ว {addressedCount} จุด · ยังไม่ได้แก้ {untouched.length} จุด
              {untouched.length > 0 && " (ระบายสีแดงไว้ในแคปชันแล้ว)"}
            </p>
            <ul className="flex min-h-0 flex-col gap-space-xs overflow-y-auto">
              {previousRound.map(({ number, note, status }) => (
                <li key={note.id} className="flex items-start gap-space-xs">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                      status === "untouched" ? "bg-rose-600" : "bg-tertiary"
                    }`}
                  >
                    {number ?? "•"}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-body-sm text-on-surface">{note.note}</span>
                    <span
                      className={`text-label-sm ${
                        status === "untouched"
                          ? "font-semibold text-error"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {status === "untouched"
                        ? "ยังไม่ได้แก้ — ข้อความเดิมยังอยู่"
                        : status === "addressed"
                          ? "แก้แล้ว"
                          : "โน้ตรวม — ตรวจเอง"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-label-sm text-on-surface-variant">
              เทียบกับเวอร์ชัน {previousVersionNumber} ที่คุณตรวจไปรอบก่อน
            </p>
          </section>
        )}

        <section className="flex shrink-0 flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-md">
          <h2 className="text-headline-sm text-on-surface">การตรวจพิจารณา</h2>

          <div className="flex flex-col gap-space-sm rounded-lg bg-surface-container-low p-space-md">
            {pendingSelection ? (
              <div className="flex items-start justify-between gap-space-sm">
                <span className="inline-flex items-center gap-1 rounded bg-amber-200 px-1.5 py-0.5 text-label-sm text-amber-950">
                  {pendingIndex != null && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
                      {pendingIndex}
                    </span>
                  )}
                  จุดที่เลือก: “{pendingSelection}”
                </span>
                <button
                  type="button"
                  onClick={() => setPendingSelection(null)}
                  className="shrink-0 text-label-sm text-on-surface-variant hover:text-error"
                >
                  ยกเลิกจุดนี้
                </button>
              </div>
            ) : (
              <p className="text-label-sm text-on-surface-variant">
                ยังไม่ได้เลือกข้อความ — โน้ตนี้จะเป็นโน้ตรวม (ไม่ชี้เฉพาะจุด)
              </p>
            )}
            <Textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="พิมพ์สิ่งที่ต้องการให้แก้ไขตรงจุดนี้..."
              rows={2}
            />
            <Button
              type="button"
              variant="secondary"
              className="w-fit"
              onClick={addNote}
              disabled={!noteDraft.trim()}
            >
              + เพิ่มโน้ตนี้
            </Button>
          </div>

          {notes.length > 0 && (
            <ul className="flex flex-col gap-space-xs">
              {notes.map((n) => (
                <li
                  key={n.clientId}
                  className="flex items-start justify-between gap-space-sm rounded-lg bg-surface-container-low p-space-sm"
                >
                  <div className="flex items-start gap-space-xs">
                    {indexById.get(n.clientId) != null && (
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[11px] font-bold text-white">
                        {indexById.get(n.clientId)}
                      </span>
                    )}
                    <div className="flex flex-col gap-0.5">
                      {!n.quotedText && (
                        <span className="text-label-sm font-semibold text-on-surface-variant">
                          โน้ตรวม
                        </span>
                      )}
                      {n.quotedText && (
                        <span className="w-fit rounded bg-amber-200 px-1.5 py-0.5 text-label-sm text-amber-950">
                          “{n.quotedText}”
                        </span>
                      )}
                      <span className="text-body-sm text-on-surface">{n.note}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNote(n.clientId)}
                    className="shrink-0 text-label-sm text-on-surface-variant hover:text-error"
                  >
                    ลบ
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && <p className="text-body-sm text-error">{error}</p>}

          <form className="flex flex-col gap-space-sm sm:flex-row">
            <input type="hidden" name="captionId" value={captionId} />
            <input type="hidden" name="versionNumber" value={versionNumber} />
            <input type="hidden" name="notesJson" value={notesJson} readOnly />
            <Button
              type="submit"
              formAction={changesAction}
              variant="destructive"
              className="flex-1"
              disabled={isPending}
            >
              {isRequestingChanges ? "กำลังบันทึก..." : "ขอแก้"}
            </Button>
            <Button
              type="submit"
              formAction={approveAction}
              className="flex-1"
              disabled={isPending}
            >
              {isApproving ? "กำลังบันทึก..." : "ผ่าน"}
            </Button>
          </form>
          <p className="text-body-sm text-on-surface-variant">
            เมื่อกดผ่านหรือขอแก้ ชิ้นงานจะบันทึกสถานะและหายจากคิวรอตรวจทันที
          </p>
        </section>

      </div>
      </div>

      {/* ประวัติทั้งหมดเต็มความกว้างด้านล่าง อ่านไล่ทุกเวอร์ชันรวดเดียวได้โดยไม่ถูกบีบในคอลัมน์แคบ */}
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
