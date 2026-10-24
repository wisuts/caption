"use client";

import { useActionState, useEffect } from "react";
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

  // พอบันทึกเสร็จ (ไม่มี error และไม่ได้กำลังทำงาน) ให้ล้างที่ติ๊กไว้
  useEffect(() => {
    if (!isPending && !state.error) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, isPending]);

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
