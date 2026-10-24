"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  duplicateCaption,
  type DuplicateState,
} from "@/lib/actions/captions";

const EMPTY_STATE: DuplicateState = {};

/**
 * ปุ่ม "ทำซ้ำ" (PRD 5.1) — ใช้ตอนทำแคมเปญเดียวกันหลายสาย
 * กดแล้วได้ร่างใหม่ที่มีข้อความ รูป แบรนด์ เดิมครบ แล้วเด้งไปหน้าแก้ไขให้เลย
 */
export function DuplicateCaptionButton({
  captionId,
  compact = false,
}: {
  captionId: string;
  compact?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    duplicateCaption,
    EMPTY_STATE
  );

  return (
    <form action={formAction} className="flex flex-col gap-space-xs">
      <input type="hidden" name="captionId" value={captionId} />
      <Button
        type="submit"
        variant="secondary"
        className={compact ? "shrink-0" : "w-full"}
        disabled={isPending}
      >
        {isPending ? "กำลังทำซ้ำ..." : "ทำซ้ำ"}
      </Button>
      {state.error && <p className="text-body-sm text-error">{state.error}</p>}
    </form>
  );
}
