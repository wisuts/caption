"use client";

import Link from "next/link";

// หน้าที่ขึ้นเวลามีอะไรผิดพลาดจริง ๆ เช่น ฐานข้อมูลสะดุด
// บอกเป็นภาษาคน + ให้ทางไปต่อ ไม่ปล่อยให้เจอหน้าขาวภาษาอังกฤษ
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-space-md px-gutter-desktop py-space-xl text-center">
      <h1 className="text-headline-lg text-on-surface">ตอนนี้เปิดหน้านี้ไม่ได้</h1>
      <p className="text-body-lg text-on-surface-variant">
        มีบางอย่างขัดข้องชั่วคราว ไม่ใช่ความผิดของคุณ และงานที่บันทึกไว้ยังอยู่ครบ
      </p>
      <p className="text-body-md text-on-surface-variant">
        ลองกดโหลดใหม่ดูก่อน ถ้ายังไม่ได้ รออีกสักครู่แล้วลองอีกครั้ง
      </p>
      <div className="mt-space-sm flex flex-wrap justify-center gap-space-sm">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-space-lg py-space-sm text-label-lg font-medium text-on-primary hover:brightness-110"
        >
          โหลดหน้านี้ใหม่
        </button>
        <Link
          href="/"
          className="rounded-lg bg-surface-container-high px-space-lg py-space-sm text-label-lg font-medium text-on-surface hover:bg-surface-container-highest"
        >
          กลับไปหน้าคิวรอตรวจ
        </Link>
      </div>
    </main>
  );
}
