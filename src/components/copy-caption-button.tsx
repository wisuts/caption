"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * คัดลอกข้อความลงคลิปบอร์ด — วิธีใหม่ใช้ไม่ได้ในบางกรณี (เบราว์เซอร์ไม่อนุญาต
 * หรือหน้าจอไม่ได้ถูกโฟกัสอยู่) จึงมีวิธีเดิมสำรองไว้ให้ยังก๊อปได้
 */
async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // ตกมาใช้วิธีเดิม: สร้างช่องข้อความซ่อนไว้ เลือกทั้งหมด แล้วสั่งคัดลอก
  }

  const holder = document.createElement("textarea");
  holder.value = value;
  holder.setAttribute("readonly", "");
  holder.style.position = "fixed";
  holder.style.top = "0";
  holder.style.opacity = "0";
  document.body.appendChild(holder);
  holder.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(holder);
  return ok;
}

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
