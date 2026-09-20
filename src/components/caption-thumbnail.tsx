"use client";

import { useState } from "react";
import { toPreviewImageUrl } from "@/lib/image-url";

/**
 * รูปย่อในรายการ ให้กวาดตาดูรอบเดียวรู้ว่าแคปชันไหนคู่กับรูปไหน
 * ถ้าไม่มีลิงก์รูป หรือรูปโหลดไม่ขึ้น จะไม่แสดงอะไรเลย ไม่ให้เป็นกรอบว่าง ๆ ค้างอยู่
 */
export function CaptionThumbnail({ imageUrl }: { imageUrl: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!imageUrl || failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={toPreviewImageUrl(imageUrl)}
      alt=""
      onError={() => setFailed(true)}
      className="h-20 w-20 shrink-0 rounded-lg border border-surface-container-high object-cover"
    />
  );
}
