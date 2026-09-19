"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  markCaptionPublished,
  type PublishState,
} from "@/lib/actions/captions";

const EMPTY_STATE: PublishState = {};

// ปุ่ม "กดว่าลงแล้ว" ในหน้ารายละเอียดฝั่งเจ้าของ (PRD 5.3)
export function MarkPublishedButton({ captionId }: { captionId: string }) {
  const [state, formAction, isPending] = useActionState(
    markCaptionPublished,
    EMPTY_STATE
  );

  return (
    <form action={formAction} className="flex flex-col gap-space-xs">
      <input type="hidden" name="captionId" value={captionId} />
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "กำลังบันทึก..." : 'กดว่า "ลงแล้ว"'}
      </Button>
      {state.error && <p className="text-body-sm text-error">{state.error}</p>}
    </form>
  );
}
