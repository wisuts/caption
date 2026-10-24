"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * ดึงข้อมูลใหม่ให้เองเงียบ ๆ เป็นระยะ (PRD 5.1)
 * เจ้าของจะได้ไม่ต้องคอยกดรีเฟรชดูว่าหัวหน้าตรวจหรือยัง
 *
 * หยุดเช็กตอนสลับไปแท็บอื่นหรือย่อหน้าต่างไว้ จะได้ไม่ยิงถามฐานข้อมูลทิ้ง ๆ
 * แล้วเช็กทันทีหนึ่งครั้งตอนกลับมาที่หน้านี้ จะได้เห็นของล่าสุดเลย
 */
export function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    function refresh() {
      router.refresh();
      setLastChecked(new Date());
    }

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, seconds * 1000);

    function onVisible() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, seconds]);

  return (
    <span className="text-label-sm text-on-surface-variant">
      {lastChecked
        ? `อัปเดตอัตโนมัติ · เช็กล่าสุด ${lastChecked.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          })} น.`
        : "อัปเดตอัตโนมัติ ไม่ต้องกดรีเฟรช"}
    </span>
  );
}
