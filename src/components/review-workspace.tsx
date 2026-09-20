"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HighlightedCaptionText } from "@/components/highlighted-caption-text";
import { VersionTimeline } from "@/components/version-timeline";
import type { CaptionVersion } from "@/lib/types";
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
}: {
  captionId: string;
  versionNumber: number;
  text: string;
  versions: CaptionVersion[];
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
    if (
      selectedText &&
      selectedText.length > 0 &&
      textRef.current &&
      selection &&
      textRef.current.contains(selection.anchorNode)
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

  return (
    <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-12">
      <div className="flex flex-col gap-space-lg lg:col-span-7 xl:col-span-8">
        <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm text-on-surface">
              แคปชันเวอร์ชันส่งตรวจล่าสุด
            </h2>
            <span className="text-label-sm text-on-surface-variant">
              ลากคลุมข้อความที่มีปัญหา แล้วพิมพ์โน้ตทางขวาได้เลย
            </span>
          </div>
          <div
            ref={textRef}
            onMouseUp={handleMouseUp}
            className="select-text rounded-lg bg-surface-container-low/40 p-space-lg text-body-lg text-on-surface"
          >
            <HighlightedCaptionText
              text={text}
              quotes={[
                ...notes.map((n) => n.quotedText),
                pendingSelection,
              ].filter((q): q is string => q !== null)}
            />
          </div>
        </section>
      </div>

      {/* ติดหน้าจอไว้ทางขวา (เฉพาะจอกว้าง) เลื่อนอ่านแคปชันซ้ายได้โดยไม่หลุดจากกล่องตรวจ
          ความสูงจำกัดเท่าจอ กล่องตรวจอยู่นิ่งเสมอ ส่วนประวัติเวอร์ชันเลื่อนแยกในตัวเองถ้ายาวเกิน */}
      <div className="flex min-h-0 flex-col gap-space-lg lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:self-start">
        <section className="flex shrink-0 flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-md">
          <h2 className="text-headline-sm text-on-surface">การตรวจพิจารณา</h2>

          <div className="flex flex-col gap-space-sm rounded-lg bg-surface-container-low p-space-md">
            {pendingSelection ? (
              <div className="flex items-start justify-between gap-space-sm">
                <span className="rounded bg-amber-200 px-1.5 py-0.5 text-label-sm text-amber-950">
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
              {notes.map((n, i) => (
                <li
                  key={n.clientId}
                  className="flex items-start justify-between gap-space-sm rounded-lg bg-surface-container-low p-space-sm"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-label-sm font-semibold text-on-surface-variant">
                      โน้ตที่ {i + 1}
                      {n.quotedText ? "" : " (โน้ตรวม)"}
                    </span>
                    {n.quotedText && (
                      <span className="w-fit rounded bg-amber-200 px-1.5 py-0.5 text-label-sm text-amber-950">
                        “{n.quotedText}”
                      </span>
                    )}
                    <span className="text-body-sm text-on-surface">{n.note}</span>
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

        <section className="flex min-h-0 flex-1 flex-col gap-space-md overflow-y-auto rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <h2 className="shrink-0 text-headline-sm text-on-surface">ประวัติเวอร์ชัน</h2>
          {versions.length > 0 ? (
            <VersionTimeline versions={versions} />
          ) : (
            <p className="text-body-sm text-on-surface-variant">ยังไม่เคยส่งตรวจ</p>
          )}
        </section>
      </div>
    </div>
  );
}
