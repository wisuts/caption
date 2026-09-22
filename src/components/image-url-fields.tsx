"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinImageUrls, parseImageUrls, toPreviewImageUrl } from "@/lib/image-url";

/**
 * ช่องใส่ลิงก์รูปทีละรูป พร้อมปุ่มเพิ่ม/ลบ และรูปย่อให้เห็นทันทีว่าวางลิงก์ถูกอันไหม
 * เบื้องหลังรวมทุกลิงก์เป็นข้อความก้อนเดียวคั่นด้วยการขึ้นบรรทัดใหม่ ส่งไปกับฟอร์ม
 * (ใช้ช่องเดิมในฐานข้อมูล งานเก่าที่มีลิงก์เดียวจึงเปิดมาแก้ได้ตามปกติ)
 */
export function ImageUrlFields({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: string | null;
}) {
  const initial = parseImageUrls(defaultValue);
  const [urls, setUrls] = useState<string[]>(initial.length > 0 ? initial : [""]);

  function updateUrl(index: number, value: string) {
    setUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
  }

  function addUrl() {
    setUrls((prev) => [...prev, ""]);
  }

  function removeUrl(index: number) {
    setUrls((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [""];
    });
  }

  return (
    <div className="flex flex-col gap-space-sm">
      <input type="hidden" name={name} value={joinImageUrls(urls)} readOnly />

      {urls.map((url, i) => (
        <div key={i} className="flex items-start gap-space-sm">
          <MiniPreview key={url.trim()} url={url.trim()} index={i + 1} />

          <Input
            type="url"
            value={url}
            onChange={(e) => updateUrl(i, e.target.value)}
            placeholder="https://drive.google.com/..."
            aria-label={`ลิงก์รูปที่ ${i + 1}`}
          />

          {(urls.length > 1 || url.trim()) && (
            <button
              type="button"
              onClick={() => removeUrl(i)}
              className="shrink-0 py-2 text-label-md text-on-surface-variant hover:text-error"
            >
              ลบ
            </button>
          )}
        </div>
      ))}

      <Button type="button" variant="secondary" className="w-fit" onClick={addUrl}>
        + เพิ่มรูป
      </Button>
    </div>
  );
}

/** รูปย่อข้างช่องกรอก ถ้าลิงก์ยังว่างหรือรูปขึ้นไม่ได้ จะโชว์เป็นกรอบเลขลำดับแทน */
function MiniPreview({ url, index }: { url: string; index: number }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // เช็กซ้ำตอนเริ่มทำงาน เผื่อรูปพังไปแล้วก่อน onError จะทำงานทัน
  // (ตัวนี้ถูก key ด้วยลิงก์จากข้างนอก พอเปลี่ยนลิงก์จะเริ่มนับใหม่เองอัตโนมัติ)
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (!url || failed) {
    return (
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-surface-container-high text-label-sm text-on-surface-variant">
        {index}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={toPreviewImageUrl(url)}
      alt=""
      onError={() => setFailed(true)}
      className="h-14 w-14 shrink-0 rounded-lg border border-surface-container-high object-cover"
    />
  );
}
