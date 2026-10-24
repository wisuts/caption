"use client";

import { useEffect, useRef, useState } from "react";
import { parseImageUrls, toPreviewImageUrl } from "@/lib/image-url";
import { Button } from "@/components/ui/button";
import type { ReviewNote } from "@/lib/types";

/**
 * โชว์รูปประกอบจริง ไม่ใช่แค่ลิงก์ (PRD 4.2 / 5.3) — ใส่ได้หลายรูปต่อแคปชัน
 * ใช้แท็กรูปธรรมดาเพราะผู้ใช้วางลิงก์จากที่ไหนก็ได้ ไม่ได้จำกัดเว็บไว้ล่วงหน้า
 * ถ้ารูปไหนโหลดไม่ขึ้น (เช่นลิงก์ยังไม่ได้เปิดให้คนอื่นดู) จะบอกสาเหตุเฉพาะรูปนั้น
 * รูปที่เหลือยังแสดงตามปกติ
 */
export function CaptionImage({
  imageUrl,
  imageNotes = [],
  onComment,
  commentedUrls = [],
}: {
  imageUrl: string;
  /** โน้ตของหัวหน้าที่ผูกกับรูป — แสดงใต้รูปใบที่ถูกคอมเมนต์ */
  imageNotes?: ReviewNote[];
  /** ถ้าส่งมา = หน้านี้คอมเมนต์รูปได้ จะมีปุ่มใต้รูปแต่ละใบ */
  onComment?: (url: string) => void;
  /** ลิงก์รูปที่คอมเมนต์ไว้แล้วในรอบนี้ ใช้บอกสถานะบนปุ่ม */
  commentedUrls?: string[];
}) {
  const urls = parseImageUrls(imageUrl);

  if (urls.length === 0) return null;

  return (
    <div className="flex flex-col gap-space-md">
      {urls.length > 1 && (
        <p className="text-label-sm text-on-surface-variant">
          รูปประกอบทั้งหมด {urls.length} รูป
        </p>
      )}
      <div className="flex flex-wrap gap-space-md">
        {urls.map((url, i) => (
          <SingleImage
            key={`${url}-${i}`}
            url={url}
            index={urls.length > 1 ? i + 1 : null}
            notes={imageNotes.filter((n) => n.imageUrl === url)}
            onComment={onComment}
            alreadyCommented={commentedUrls.includes(url)}
          />
        ))}
      </div>
    </div>
  );
}

function SingleImage({
  url,
  index,
  notes,
  onComment,
  alreadyCommented,
}: {
  url: string;
  index: number | null;
  notes: ReviewNote[];
  onComment?: (url: string) => void;
  alreadyCommented?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // รูปที่พังเร็วมาก (เช่นลิงก์เสียที่เบราว์เซอร์รู้ผลทันที) อาจพังไปแล้วตั้งแต่ก่อน
  // หน้าเว็บจะเริ่มทำงาน ทำให้ onError ไม่ทัน ต้องเช็กซ้ำตอนเริ่มทำงานด้วย
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <div className="flex flex-col gap-space-xs">
      {index != null && (
        <span className="text-label-sm font-semibold text-on-surface-variant">
          รูปที่ {index}
        </span>
      )}

      {failed ? (
        <p className="max-w-80 text-body-sm text-on-surface-variant">
          แสดงรูปนี้ไม่ได้ — ถ้าเป็นลิงก์ Google Drive ให้ตั้งการแชร์เป็น
          “ทุกคนที่มีลิงก์ดูได้” แล้วรีเฟรชอีกครั้ง หรือกดลิงก์ด้านล่างเพื่อเปิดดู
        </p>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer" className="w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={toPreviewImageUrl(url)}
            alt={index != null ? `รูปประกอบแคปชันรูปที่ ${index}` : "รูปประกอบแคปชัน"}
            onError={() => setFailed(true)}
            className="max-h-96 w-auto max-w-full rounded-lg border border-surface-container-high object-contain"
          />
        </a>
      )}

      <div className="flex flex-wrap items-center gap-space-xs">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary-fixed px-space-md py-2 text-label-md font-medium text-on-primary-fixed hover:bg-primary-fixed-dim"
        >
          เปิดดูรูปต้นฉบับ ↗
        </a>
        {onComment && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => onComment(url)}
            disabled={alreadyCommented}
          >
            {alreadyCommented ? "คอมเมนต์รูปนี้แล้ว" : "คอมเมนต์รูปนี้"}
          </Button>
        )}
      </div>

      {notes.length > 0 && (
        <div className="flex max-w-96 flex-col gap-space-xs rounded-lg bg-error-container/40 p-space-sm">
          <p className="text-label-sm font-semibold text-on-error-container">
            โน้ตจากหัวหน้าเรื่องรูปนี้
          </p>
          {notes.map((n) => (
            <p key={n.id} className="text-body-sm italic text-on-surface">
              {n.note}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
