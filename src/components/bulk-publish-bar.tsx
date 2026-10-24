"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  markCaptionPublished,
  type PublishState,
} from "@/lib/actions/captions";

const EMPTY_STATE: PublishState = {};

/**
 * แถบ "ติ๊กไว้กี่ชิ้น" ที่โผล่ขึ้นมาเมื่อเลือกอย่างน้อย 1 ชิ้น (PRD 5.1)
 * กดทีเดียวเปลี่ยนเป็น "ลงแล้ว" ได้ทั้งหมด ไม่ต้องกดทีละชิ้น
 */
export function BulkPublishBar({
  captionIds,
  onDone,
}: {
  captionIds: string[];
  onDone: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    markCaptionPublished,
    EMPTY_STATE
  );

  // ไม่ต้องล้างที่ติ๊กไว้เอง — พอบันทึกเสร็จชิ้นพวกนั้นจะไม่ใช่สถานะ "ผ่าน" แล้ว
  // แถบนี้จึงหายไปเองโดยปริยาย (เคยใส่ useEffect ไว้ล้างให้ แต่มันทำงานตั้งแต่
  // ตอนแถบโผล่ครั้งแรกด้วย เลยไปล้างสิ่งที่เพิ่งติ๊ก ทำให้ติ๊กไม่ติดสักที)

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-center justify-between gap-space-md rounded-xl bg-primary-fixed p-space-md shadow-sm"
    >
      {captionIds.map((id) => (
        <input key={id} type="hidden" name="captionId" value={id} />
      ))}
      <input type="hidden" name="stay" value="1" />

      <div className="flex flex-col gap-0.5">
        <span className="text-label-md font-semibold text-on-primary-fixed">
          เลือกไว้ {captionIds.length} ชิ้น
        </span>
        {state.error && (
          <span className="text-body-sm text-error">{state.error}</span>
        )}
      </div>

      <div className="flex items-center gap-space-sm">
        <Button type="button" variant="ghost" onClick={onDone} disabled={isPending}>
          ยกเลิกที่เลือก
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "กำลังบันทึก..."
            : `กดว่า "ลงแล้ว" ${captionIds.length} ชิ้น`}
        </Button>
      </div>
    </form>
  );
}
