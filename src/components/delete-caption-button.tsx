"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteCaption, type DeleteState } from "@/lib/actions/captions";

const EMPTY_STATE: DeleteState = {};

// ปุ่ม "ลบ" ในหน้ารายละเอียดฝั่งเจ้าของ (PRD 5.3 / กฎข้อ 7) — ถามยืนยันก่อนเสมอ
//
// ใช้กล่องยืนยันในหน้าเว็บเอง (ไม่ใช้ window.confirm) เพราะเบราว์เซอร์บางตัว
// (โดยเฉพาะเบราว์เซอร์ในแอปมือถือ หรือเบราว์เซอร์ที่โดนติ๊ก "ไม่ต้องถามอีก"
// จากการกดยืนยันหลายครั้งก่อนหน้า) จะปิดกั้นกล่องเตือนของเบราว์เซอร์แบบเงียบ ๆ
// ทำให้กดปุ่มแล้วดูเหมือนไม่มีอะไรเกิดขึ้นเลย
export function DeleteCaptionButton({ captionId }: { captionId: string }) {
  const [state, formAction, isPending] = useActionState(
    deleteCaption,
    EMPTY_STATE
  );
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <form action={formAction} className="flex flex-col gap-space-sm rounded-lg border border-error/30 bg-error-container/40 p-space-md">
        <p className="text-body-sm text-on-error-container">
          แน่ใจนะครับว่าจะลบชิ้นงานนี้? ชิ้นงานจะหายไปจากทุกหน้าทันที
          (ถ้าลบผิดต้องแจ้งผู้พัฒนาให้ดึงกลับ)
        </p>
        <input type="hidden" name="captionId" value={captionId} />
        <div className="flex gap-space-sm">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => setConfirming(false)}
            disabled={isPending}
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            variant="destructive"
            className="flex-1"
            disabled={isPending}
          >
            {isPending ? "กำลังลบ..." : "ยืนยันลบ"}
          </Button>
        </div>
        {state.error && <p className="text-body-sm text-error">{state.error}</p>}
      </form>
    );
  }

  return (
    <Button
      type="button"
      variant="destructive"
      className="w-full"
      onClick={() => setConfirming(true)}
    >
      ลบชิ้นงาน
    </Button>
  );
}
