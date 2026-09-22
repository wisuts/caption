"use client";

import { useEffect, useRef, useState } from "react";
import { parseImageUrls, toPreviewImageUrl } from "@/lib/image-url";

/**
 * รูปย่อในรายการ ให้กวาดตาดูรอบเดียวรู้ว่าแคปชันไหนคู่กับรูปไหน
 * ถ้ามีหลายรูปจะโชว์รูปแรกพร้อมป้ายบอกจำนวน
 * ถ้าไม่มีลิงก์รูป หรือรูปโหลดไม่ขึ้น จะไม่แสดงอะไรเลย ไม่ให้เป็นกรอบว่าง ๆ ค้างอยู่
 */
export function CaptionThumbnail({ imageUrl }: { imageUrl: string | null }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const urls = parseImageUrls(imageUrl);

  // เช็กซ้ำตอนเริ่มทำงาน เผื่อรูปพังไปแล้วก่อนหน้าเว็บจะเริ่มทำงาน (onError ไม่ทัน)
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (urls.length === 0 || failed) return null;

  return (
    <div className="relative shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={toPreviewImageUrl(urls[0])}
        alt=""
        onError={() => setFailed(true)}
        className="h-20 w-20 rounded-lg border border-surface-container-high object-cover"
      />
      {urls.length > 1 && (
        <span className="absolute right-1 bottom-1 rounded bg-black/70 px-1.5 text-label-sm font-semibold text-white">
          {urls.length} รูป
        </span>
      )}
    </div>
  );
}
