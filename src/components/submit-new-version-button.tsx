"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  submitCurrentDraftForReview,
  type SubmitDraftState,
} from "@/lib/actions/captions";

const EMPTY_STATE: SubmitDraftState = {};

// ปุ่ม "ส่งเวอร์ชันใหม่ให้ตรวจ" ในหน้ารายละเอียดฝั่งเจ้าของ (PRD 5.3)
export function SubmitNewVersionButton({ captionId }: { captionId: string }) {
  const [state, formAction, isPending] = useActionState(
    submitCurrentDraftForReview,
    EMPTY_STATE
  );

  return (
    <form action={formAction} className="flex flex-col gap-space-xs">
      <input type="hidden" name="captionId" value={captionId} />
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "กำลังส่งตรวจ..." : "ส่งเวอร์ชันใหม่ให้ตรวจ"}
      </Button>
      {state.error && <p className="text-body-sm text-error">{state.error}</p>}
    </form>
  );
}
