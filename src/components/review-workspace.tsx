"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CaptionTabs } from "@/components/caption-tabs";
import { VersionTimeline } from "@/components/version-timeline";
import { orderNotesByPosition } from "@/lib/order-notes-by-position";
import { getPreviousRoundNotes } from "@/lib/previous-round-status";
import { parseImageUrls } from "@/lib/image-url";
import { CaptionImage } from "@/components/caption-image";
import { CaptionDiffView } from "@/components/caption-diff-view";
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
  /** ถ้ามีค่า = โน้ตนี้เป็นของรูปใบนั้น ไม่ใช่ของตัวหนังสือ */
  imageUrl: string | null;
  note: string;
  /** null = ไม่ได้เสนอข้อความ, "" = ขอให้ตัดประโยคนี้ออก, อื่น ๆ = ใช้ข้อความนี้แทน */
  suggestedText: string | null;
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
  imageUrl,
}: {
  captionId: string;
  versionNumber: number;
  text: string;
  versions: CaptionVersion[];
  /** เวอร์ชันก่อนหน้าที่เคยสั่งแก้ไว้ — ใช้บอกว่ารอบนี้แก้ตามที่สั่งครบหรือยัง */
  previousVersionNumber?: number;
  previousText?: string;
  previousNotes?: ReviewNote[];
  /** ลิงก์รูปประกอบ (หลายรูปคั่นด้วยบรรทัด) — แสดงในนี้เพื่อให้คอมเมนต์รูปได้ */
  imageUrl?: string | null;
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
  // รูปที่กำลังจะคอมเมนต์ — เลือกได้ทีละใบ พิมพ์โน้ตแล้วกดเพิ่มเหมือนคอมเมนต์ข้อความ
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  // หัวหน้าพิมพ์แก้แคปชันเองได้ทั้งก้อน เหมือนพิมพ์ในเอกสาร
  // แยกขาดจากการคอมเมนต์ จะได้ไม่งงว่าอันไหนเมนต์ อันไหนแก้เอง
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState(() => text.replace(/\r\n/g, "\n"));
  const originalText = text.replace(/\r\n/g, "\n");
  const [confirming, setConfirming] = useState<"approve" | "changes" | null>(null);
  // บนมือถือแผงตรวจลอยติดขอบล่าง เปิด/ปิดได้ จะได้ไม่บังเนื้อหาตอนอ่าน
  const [sheetOpen, setSheetOpen] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  const imageList = parseImageUrls(imageUrl ?? null);
  /** เรียกรูปว่า "รูปที่ N" ตามลำดับที่แสดงอยู่ ถ้าหาไม่เจอแปลว่ารูปถูกเปลี่ยนไปแล้ว */
  function imageLabel(url: string) {
    const i = imageList.indexOf(url);
    if (i === -1) return "รูปที่ถูกเปลี่ยนไปแล้ว";
    return imageList.length > 1 ? `รูปที่ ${i + 1}` : "รูปประกอบ";
  }

  // กำลังเขียนโน้ตอยู่ไหม — ระหว่างนี้ซ่อนปุ่มส่งผลตรวจ ให้จอเหลือเรื่องเดียว
  // ไม่งั้นหัวหน้าจะไม่รู้ว่าต้องกดอะไรก่อน และเผลอกด "ผ่าน" ทั้งที่พิมพ์โน้ตค้างไว้
  const isWritingNote =
    editing ||
    pendingSelection !== null ||
    pendingImage !== null ||
    noteDraft.trim() !== "";

  // หัวหน้าพิมพ์แก้เองไว้ไหม — ถ้าแก้แล้วกดผ่าน จบงานได้เลยไม่ต้องเด้งกลับหาเจ้าของ
  const hasReviewerEdit = editedText.trim() !== originalText.trim();

  const error = changesState.error ?? approveState.error;
  const isPending = isApproving || isRequestingChanges;

  /** กด "คอมเมนต์รูปนี้" ใต้รูป — เล็งรูปใบนั้นไว้ แล้วพาไปพิมพ์ในกล่องตรวจ */
  function startImageComment(url: string) {
    setPendingImage(url);
    setPendingSelection(null);
    setSheetOpen(true);
    window.getSelection()?.removeAllRanges();
  }

  /**
   * บนมือถือ: แตะที่บรรทัดไหนก็เลือกทั้งบรรทัดนั้นเลย
   * เพราะลากคลุมข้อความด้วยนิ้วบนจอเล็กทำได้ยากมาก
   * หาตำแหน่งตัวอักษรที่แตะ แล้วขยายออกไปจนสุดบรรทัดทั้งสองข้าง
   */
  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    // ใช้เฉพาะตอนจอแคบ (จอเดียวกับที่กล่องโน้ตเป็นแถบลอยด้านล่าง)
    // จอใหญ่ยังลากคลุมเองเหมือนเดิม
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    if ((window.getSelection()?.toString() ?? "").trim()) return; // ลากเลือกเองอยู่ ไม่ต้องยุ่ง

    const root = textRef.current;
    if (!root) return;
    const caret = document.caretRangeFromPoint?.(e.clientX, e.clientY);
    if (!caret || !root.contains(caret.startContainer)) return;

    // นับตัวอักษรจากต้นกล่องจนถึงจุดที่แตะ
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let offset = 0;
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node === caret.startContainer) {
        offset += caret.startOffset;
        break;
      }
      offset += node.textContent?.length ?? 0;
    }

    const full = text.replace(/\r\n/g, "\n");
    const start = full.lastIndexOf("\n", Math.max(0, offset - 1)) + 1;
    const endRaw = full.indexOf("\n", offset);
    const end = endRaw === -1 ? full.length : endRaw;
    const line = full.slice(start, end).trim();

    if (line) {
      setPendingSelection(line);
      setPendingImage(null);
        setSheetOpen(true);
    }
  }

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
      setPendingImage(null);
        setSheetOpen(true);
    }
  }

  function addNote() {
    const noteText = noteDraft.trim();
    if (!noteText) return;
    setNotes((prev) => [
      ...prev,
      {
        clientId: crypto.randomUUID(),
        quotedText: pendingSelection,
        imageUrl: pendingImage,
        note: noteText,
        suggestedText: null,
      },
    ]);
    setNoteDraft("");
    setPendingSelection(null);
    setPendingImage(null);
    // บนมือถือแผงนี้บังแคปชันเกือบทั้งจอ ปิดให้เองหลังเพิ่มโน้ตเสร็จ
    // ไม่งั้นจะแตะเลือกประโยคถัดไปไม่ได้
    setSheetOpen(false);
    window.getSelection()?.removeAllRanges();
  }

  function removeNote(clientId: string) {
    setNotes((prev) => prev.filter((n) => n.clientId !== clientId));
  }

  const notesJson = JSON.stringify(
    notes.map((n) => ({
      quotedText: n.quotedText,
      imageUrl: n.imageUrl,
      note: n.note,
      suggestedText: n.suggestedText,
    }))
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
    <div className="flex flex-col gap-space-lg pb-20 lg:pb-0">
      {/* รูปอยู่ในนี้ (ไม่ใช่ในหน้าแม่) เพื่อให้ปุ่ม "คอมเมนต์รูปนี้" ต่อเข้ากับโน้ตได้ */}
      <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h2 className="text-headline-sm text-on-surface">รูปภาพประกอบแคปชัน</h2>
        {imageList.length > 0 ? (
          <CaptionImage
            imageUrl={imageUrl ?? ""}
            onComment={startImageComment}
            commentedUrls={notes
              .map((n) => n.imageUrl)
              .filter((u): u is string => u !== null)}
          />
        ) : (
          <p className="text-body-md text-on-surface-variant">ยังไม่ได้ใส่ลิงก์รูป</p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-12">
      <div className="flex flex-col gap-space-lg lg:col-span-7 xl:col-span-8">
        <CaptionTabs
          versionNumber={versionNumber}
          text={text}
          versions={versions}
          previousText={previousText}
          marks={marks}
          textRef={textRef}
          onMouseUp={editing ? undefined : handleMouseUp}
          onPointerUp={editing ? undefined : handlePointerUp}
          selectable={!editing}
          editing={editing}
          editedText={editedText}
          onEditedTextChange={setEditedText}
          editControl={
            <Button
              type="button"
              size="sm"
              className={
                editing
                  ? "bg-tertiary text-on-tertiary hover:bg-tertiary/90"
                  : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
              }
              onClick={() => {
                setEditing((v) => !v);
                setPendingSelection(null);
                setPendingImage(null);
                window.getSelection()?.removeAllRanges();
              }}
            >
              {editing ? "พิมพ์เสร็จแล้ว" : "แก้เอง"}
            </Button>
          }
        />

        {/* สรุปให้ดูก่อนส่งว่าหัวหน้าแก้อะไรไปบ้าง กันแก้แล้วลืมว่าแก้อะไร */}
        {hasReviewerEdit && !editing && (
          <section className="flex flex-col gap-space-sm rounded-xl bg-tertiary-fixed/30 p-space-lg">
            <div className="flex flex-wrap items-center justify-between gap-space-sm">
              <h2 className="text-headline-sm text-on-surface">คุณแก้ข้อความเองไว้</h2>
              <button
                type="button"
                onClick={() => setEditedText(originalText)}
                className="text-label-sm text-on-surface-variant hover:text-error"
              >
                ยกเลิกที่แก้ไว้ทั้งหมด
              </button>
            </div>
            <p className="text-label-sm text-on-surface-variant">
              เขียว = ที่คุณแก้ใหม่ · ขีดฆ่า = ของเดิมที่หายไป
            </p>
            <div className="rounded-lg bg-surface-container-lowest p-space-md text-body-md">
              <CaptionDiffView previousText={originalText} currentText={editedText} />
            </div>
          </section>
        )}
      </div>

      {/* ติดหน้าจอไว้ทางขวา (เฉพาะจอกว้าง) เหลือเฉพาะเรื่อง "ตรวจงาน" ล้วน ๆ
          ส่วนเรื่อง "อ่านเนื้อหา" ย้ายไปอยู่ในแท็บของกล่องใหญ่ฝั่งซ้ายหมดแล้ว
          กล่องตรวจอยู่นิ่งเสมอ ถ้าเช็กลิสต์ยาวเกินจะเลื่อนแยกในตัวเอง */}
      {/* จอเล็ก: แผงตรวจลอยติดขอบล่างจอ เลื่อนอ่านตรงไหนก็พิมพ์โน้ตได้ทันที
          ไม่ต้องเลื่อนผ่านแคปชันทั้งก้อนลงไปหา (แคปชันจริงยาวถึง 8 หน้าจอบนมือถือ)
          จอใหญ่: กลับไปเป็นคอลัมน์ขวาติดหน้าจอเหมือนเดิม */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex max-h-[85vh] min-h-0 flex-col gap-space-lg overflow-y-auto rounded-t-xl bg-surface-container-lowest p-space-sm shadow-[0_-4px_16px_rgba(0,0,0,0.12)] lg:static lg:z-auto lg:max-h-[calc(100vh-6rem)] lg:overflow-visible lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 lg:self-start">
        {/* แถบหัวบนมือถือ — แตะเพื่อเปิด/ปิดแผง */}
        <button
          type="button"
          onClick={() => setSheetOpen((v) => !v)}
          className="flex items-center justify-between gap-space-sm rounded-lg bg-surface-container-low px-space-md py-2 text-left lg:hidden"
        >
          <span className="text-label-md font-semibold text-on-surface">
            {pendingSelection
              ? `เลือกไว้: “${pendingSelection.slice(0, 20)}…”`
              : pendingImage
                ? `เลือกไว้: ${imageLabel(pendingImage)}`
                : notes.length > 0
                  ? `เขียนโน้ตแล้ว ${notes.length} จุด`
                  : "แตะเพื่อเขียนโน้ต / ส่งผลตรวจ"}
          </span>
          <span className="shrink-0 text-label-sm text-on-surface-variant">
            {sheetOpen ? "ปิด ▾" : "เปิด ▴"}
          </span>
        </button>

        <div
          className={`${sheetOpen ? "flex" : "hidden"} min-h-0 flex-col gap-space-lg lg:flex`}
        >
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
              {versionNumber - (previousVersionNumber ?? 0) > 1 &&
                ` (เจ้าของส่งแก้มา ${versionNumber - (previousVersionNumber ?? 0)} รอบ รวมให้แล้วทั้งหมด)`}
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
                  onClick={() => {
                    setPendingSelection(null);
                                  }}
                  className="shrink-0 text-label-sm text-on-surface-variant hover:text-error"
                >
                  ยกเลิกจุดนี้
                </button>
              </div>
            ) : pendingImage ? (
              <div className="flex items-start justify-between gap-space-sm">
                <span className="inline-flex items-center gap-1.5 rounded bg-primary-fixed px-1.5 py-0.5 text-label-sm text-on-primary-fixed">
                  กำลังคอมเมนต์ {imageLabel(pendingImage)}
                </span>
                <button
                  type="button"
                  onClick={() => setPendingImage(null)}
                  className="shrink-0 text-label-sm text-on-surface-variant hover:text-error"
                >
                  ยกเลิกรูปนี้
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-space-sm">
                <p className="text-label-sm text-on-surface-variant">
                  ยังไม่ได้เลือกข้อความหรือรูป — โน้ตนี้จะเป็นโน้ตรวม
                </p>
                {/* ทางออกตอนพิมพ์โน้ตรวมค้างไว้ ไม่งั้นปุ่มส่งผลตรวจจะไม่กลับมา */}
                {noteDraft.trim() !== "" && (
                  <button
                    type="button"
                    onClick={() => setNoteDraft("")}
                    className="shrink-0 text-label-sm text-on-surface-variant hover:text-error"
                  >
                    ล้างโน้ตนี้
                  </button>
                )}
              </div>
            )}
            <Textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="พิมพ์สิ่งที่ต้องการให้แก้ไขตรงจุดนี้..."
              rows={2}
            />
            <Button
              type="button"
              className="w-fit"
              onClick={addNote}
              disabled={!noteDraft.trim()}
            >
              + เพิ่มโน้ต
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
                      {!n.quotedText && !n.imageUrl && (
                        <span className="text-label-sm font-semibold text-on-surface-variant">
                          โน้ตรวม
                        </span>
                      )}
                      {n.imageUrl && (
                        <span className="w-fit rounded bg-primary-fixed px-1.5 py-0.5 text-label-sm text-on-primary-fixed">
                          {imageLabel(n.imageUrl)}
                        </span>
                      )}
                      {n.quotedText && (
                        <span className="w-fit rounded bg-amber-200 px-1.5 py-0.5 text-label-sm text-amber-950">
                          “{n.quotedText}”
                        </span>
                      )}
                      <span className="text-body-sm text-on-surface">{n.note}</span>
                      {n.suggestedText !== null && (
                        <span className="w-fit rounded bg-tertiary-fixed px-1.5 py-0.5 text-label-sm text-on-tertiary-fixed">
                          {n.suggestedText === ""
                            ? "→ ตัดประโยคนี้ออก"
                            : `→ ใช้แทน: “${n.suggestedText}”`}
                        </span>
                      )}
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

          {/* บอกให้ชัดตั้งแต่ก่อนกดว่า "ส่งแล้วจบรอบ" ไม่ใช่การสั่งแก้ทีละจุด
              แล้วยังมีขั้นยืนยันอีกชั้นกันกดพลาด (PRD 4.2) */}
          {confirming === null && !isWritingNote && (
            <div className="flex flex-col gap-space-sm sm:flex-row">
              {/* ยังเพิ่มโน้ตไม่ครบ ปุ่มขอแก้เป็นสีเทาไปก่อน จะได้ไม่ดึงให้กดทั้งที่ยังกดไม่ได้ */}
              <Button
                type="button"
                variant="destructive"
                className={`flex-1 ${
                  notes.length === 0 && !hasReviewerEdit
                    ? "bg-outline-variant text-on-surface-variant"
                    : ""
                }`}
                onClick={() => setConfirming("changes")}
                disabled={isPending || (notes.length === 0 && !hasReviewerEdit)}
                title={
                  notes.length === 0
                    ? "เพิ่มโน้ตอย่างน้อย 1 อันก่อนถึงจะกดขอแก้ได้"
                    : undefined
                }
              >
                ส่งผลตรวจ: ขอแก้{notes.length > 0 && ` (${notes.length} จุด)`}
              </Button>
              <Button
                type="button"
                className="flex-1 bg-tertiary-fixed-dim text-on-tertiary-fixed hover:bg-tertiary-fixed"
                onClick={() => setConfirming("approve")}
                disabled={isPending}
              >
                {hasReviewerEdit ? "ผ่าน — ใช้ที่ผมแก้เอง" : "ส่งผลตรวจ: ผ่าน"}
              </Button>
            </div>
          )}

          {confirming === null && !isWritingNote && notes.length === 0 && (
            <p className="text-label-sm text-on-surface-variant">
              ยังไม่มีโน้ต — ถ้าจะขอแก้ ต้องเพิ่มโน้ตอย่างน้อย 1 จุดก่อน
            </p>
          )}

          {confirming !== null && (
            <form className="flex flex-col gap-space-sm rounded-lg border border-primary bg-surface-container-low p-space-md">
              <input type="hidden" name="captionId" value={captionId} />
              <input type="hidden" name="versionNumber" value={versionNumber} />
              <input type="hidden" name="notesJson" value={notesJson} readOnly />
              <input
                type="hidden"
                name="editedText"
                value={hasReviewerEdit ? editedText : ""}
                readOnly
              />

              <p className="text-body-md font-semibold text-on-surface">
                {confirming === "changes"
                  ? `ยืนยันส่ง “ขอแก้” พร้อมโน้ต ${notes.length} จุด?`
                  : hasReviewerEdit
                    ? "ยืนยันผ่าน ด้วยข้อความที่คุณแก้เอง?"
                    : "ยืนยันส่ง “ผ่าน”?"}
              </p>
              <p className="text-body-sm text-on-surface-variant">
                {confirming === "changes"
                  ? "ชิ้นงานจะเปลี่ยนเป็นสถานะ “ขอแก้” และหายจากคิวรอตรวจ เพิ่มโน้ตอีกไม่ได้จนกว่าจะมีเวอร์ชันใหม่"
                  : notes.length > 0
                    ? hasReviewerEdit
                      ? "ข้อความที่คุณแก้จะถูกบันทึกเป็นเวอร์ชันใหม่ที่ผ่านแล้ว พร้อมเอาไปลงได้เลย ไม่ต้องส่งกลับให้เจ้าของแก้อีก"
                      : `ชิ้นงานจะผ่านทันที และโน้ต ${notes.length} จุดที่เพิ่มไว้จะถูกส่งไปพร้อมกัน`
                    : "ชิ้นงานจะเปลี่ยนเป็นสถานะ “ผ่าน” และหายจากคิวรอตรวจ"}
              </p>

              <div className="flex flex-col gap-space-sm sm:flex-row">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setConfirming(null)}
                  disabled={isPending}
                >
                  ย้อนกลับไปตรวจต่อ
                </Button>
                <Button
                  type="submit"
                  formAction={confirming === "changes" ? changesAction : approveAction}
                  variant={confirming === "changes" ? "destructive" : "default"}
                  className={
                    confirming === "approve"
                      ? "flex-1 bg-tertiary-fixed-dim text-on-tertiary-fixed hover:bg-tertiary-fixed"
                      : "flex-1"
                  }
                  disabled={isPending}
                >
                  {isPending
                    ? "กำลังบันทึก..."
                    : confirming === "changes"
                      ? "ยืนยันส่งขอแก้"
                      : "ยืนยันส่งผ่าน"}
                </Button>
              </div>
            </form>
          )}
        </section>
        </div>
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
