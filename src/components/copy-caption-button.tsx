"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/copy-to-clipboard";

/**
 * ปุ่มคัดลอกแคปชันทั้งก้อนไปวางที่อื่นได้เลย (PRD 4.2 / 5.3)
 * คัดลอกเฉพาะตัวข้อความล้วน ๆ ไม่ติดเลขกำกับหรือไฮไลต์ไปด้วย
 */
export function CopyCaptionButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  // ให้ปุ่มกลับเป็นปกติเองหลังผ่านไป 2 วินาที
  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  async function copy() {
    // ข้อความที่เก็บไว้อาจขึ้นบรรทัดใหม่คนละแบบ ปรับให้เหมือนกันก่อนคัดลอก
    const plain = text.replace(/\r\n/g, "\n");
    setState((await copyToClipboard(plain)) ? "copied" : "failed");
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="h-8 shrink-0 px-2.5 text-label-sm"
      onClick={copy}
    >
      {state === "copied"
        ? "คัดลอกแล้ว ✓"
        : state === "failed"
          ? "คัดลอกไม่ได้ ลองใหม่"
          : "คัดลอกแคปชัน"}
    </Button>
  );
}
