"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  markCaptionPublished,
  type PublishState,
} from "@/lib/actions/captions";

const EMPTY_STATE: PublishState = {};

// ปุ่ม "กดว่าลงแล้ว" (PRD 5.3) — ใช้ได้ทั้งในหน้ารายละเอียดและในรายการ
// แบบ compact ไว้ใช้ในรายการ จะได้กดได้เลยโดยไม่ต้องเปิดเข้าไปในชิ้นงาน
export function MarkPublishedButton({
  captionId,
  compact = false,
}: {
  captionId: string;
  compact?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    markCaptionPublished,
    EMPTY_STATE
  );

  return (
    <form action={formAction} className="flex flex-col gap-space-xs">
      <input type="hidden" name="captionId" value={captionId} />
      {/* กดจากรายการให้อยู่หน้าเดิม ไม่เด้งเข้าไปในชิ้นงาน */}
      {compact && <input type="hidden" name="stay" value="1" />}
      <Button
        type="submit"
        variant={compact ? "secondary" : "default"}
        className={compact ? "shrink-0" : "w-full"}
        disabled={isPending}
      >
        {isPending ? "กำลังบันทึก..." : 'กดว่า "ลงแล้ว"'}
      </Button>
      {state.error && <p className="text-body-sm text-error">{state.error}</p>}
    </form>
  );
}
