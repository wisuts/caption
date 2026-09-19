"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { deleteCaption, type DeleteState } from "@/lib/actions/captions";

const EMPTY_STATE: DeleteState = {};

// ปุ่ม "ลบ" ในหน้ารายละเอียดฝั่งเจ้าของ (PRD 5.3 / กฎข้อ 7) — ถามยืนยันก่อนเสมอ
export function DeleteCaptionButton({ captionId }: { captionId: string }) {
  const [state, formAction, isPending] = useActionState(
    deleteCaption,
    EMPTY_STATE
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-space-xs">
      <input type="hidden" name="captionId" value={captionId} />
      <Button
        type="button"
        variant="destructive"
        className="w-full"
        disabled={isPending}
        onClick={() => {
          const confirmed = window.confirm(
            "ต้องการลบชิ้นงานนี้ใช่ไหมครับ? ชิ้นงานจะหายไปจากทุกหน้าทันที (ถ้าลบผิดต้องแจ้งผู้พัฒนาให้ดึงกลับ)"
          );
          if (confirmed) {
            formRef.current?.requestSubmit();
          }
        }}
      >
        {isPending ? "กำลังลบ..." : "ลบชิ้นงาน"}
      </Button>
      {state.error && <p className="text-body-sm text-error">{state.error}</p>}
    </form>
  );
}
