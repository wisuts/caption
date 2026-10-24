"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/copy-to-clipboard";

/**
 * ปุ่มคัดลอกลิงก์ชิ้นงาน (PRD 5.1) — ใช้ตอนส่งต่อให้ตัวเซทโพสต์
 * ก๊อปได้จากรายการเลย ไม่ต้องเปิดเข้าไปแล้วลากก๊อปจากช่อง address
 */
export function CopyLinkButton({ captionId }: { captionId: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  async function copy() {
    const url = `${window.location.origin}/items/${captionId}`;
    setState((await copyToClipboard(url)) ? "copied" : "failed");
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="shrink-0"
      onClick={copy}
      title="คัดลอกลิงก์สำหรับส่งให้ตัวเซทโพสต์"
    >
      {state === "copied"
        ? "คัดลอกแล้ว ✓"
        : state === "failed"
          ? "คัดลอกไม่ได้"
          : "คัดลอกลิงก์"}
    </Button>
  );
}
