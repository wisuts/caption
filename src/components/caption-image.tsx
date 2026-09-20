"use client";

import { useState } from "react";
import { toPreviewImageUrl } from "@/lib/image-url";

/**
 * โชว์รูปประกอบจริง ไม่ใช่แค่ลิงก์ (PRD 4.2 / 5.3)
 * ใช้แท็กรูปธรรมดาเพราะผู้ใช้วางลิงก์จากที่ไหนก็ได้ ไม่ได้จำกัดเว็บไว้ล่วงหน้า
 * ถ้ารูปโหลดไม่ขึ้น (เช่นลิงก์ยังไม่ได้เปิดให้คนอื่นดู) จะบอกสาเหตุและให้กดลิงก์แทน
 */
export function CaptionImage({ imageUrl }: { imageUrl: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex flex-col gap-space-sm">
      {!failed && (
        <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={toPreviewImageUrl(imageUrl)}
            alt="รูปประกอบแคปชัน"
            onError={() => setFailed(true)}
            className="max-h-96 w-auto max-w-full rounded-lg border border-surface-container-high object-contain"
          />
        </a>
      )}

      {failed && (
        <p className="text-body-sm text-on-surface-variant">
          แสดงรูปตรงนี้ไม่ได้ — ถ้าเป็นลิงก์ Google Drive ให้ตั้งการแชร์เป็น
          “ทุกคนที่มีลิงก์ดูได้” แล้วรีเฟรชอีกครั้ง หรือกดลิงก์ด้านล่างเพื่อเปิดดู
        </p>
      )}

      <a
        href={imageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary-fixed px-space-md py-2 text-label-md font-medium text-on-primary-fixed hover:bg-primary-fixed-dim"
      >
        เปิดดูรูปต้นฉบับ ↗
      </a>
    </div>
  );
}
