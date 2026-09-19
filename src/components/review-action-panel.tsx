"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  approveCaption,
  requestChanges,
  type ReviewActionState,
} from "@/lib/actions/reviews";

const EMPTY_STATE: ReviewActionState = {};

// แผงตรวจพิจารณา (PRD 4.2) — ปุ่ม "ผ่าน" / "ขอแก้" พร้อมบังคับคอมเมนต์ตอนขอแก้
export function ReviewActionPanel({
  captionId,
  versionNumber,
}: {
  captionId: string;
  versionNumber: number;
}) {
  const [approveState, approveAction, isApproving] = useActionState(
    approveCaption,
    EMPTY_STATE
  );
  const [changesState, changesAction, isRequestingChanges] = useActionState(
    requestChanges,
    EMPTY_STATE
  );

  const error = changesState.error ?? approveState.error;
  const isPending = isApproving || isRequestingChanges;

  return (
    <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-md">
      <h2 className="text-headline-sm text-on-surface">การตรวจพิจารณา</h2>
      <form className="flex flex-col gap-space-md">
        <input type="hidden" name="captionId" value={captionId} />
        <input type="hidden" name="versionNumber" value={versionNumber} />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="comment">
            คอมเมนต์สำหรับผู้เขียน{" "}
            <span className="text-error">* (บังคับถ้ากดขอแก้)</span>
          </Label>
          <Textarea
            id="comment"
            name="comment"
            placeholder="พิมพ์สิ่งที่ต้องการให้แก้ไข..."
            rows={4}
            aria-invalid={Boolean(error)}
          />
        </div>

        {error && <p className="text-body-sm text-error">{error}</p>}

        <div className="flex flex-col gap-space-sm sm:flex-row">
          <Button
            type="submit"
            formAction={changesAction}
            variant="destructive"
            className="flex-1"
            disabled={isPending}
          >
            {isRequestingChanges ? "กำลังบันทึก..." : "ขอแก้"}
          </Button>
          <Button
            type="submit"
            formAction={approveAction}
            className="flex-1"
            disabled={isPending}
          >
            {isApproving ? "กำลังบันทึก..." : "ผ่าน"}
          </Button>
        </div>
        <p className="text-body-sm text-on-surface-variant">
          เมื่อกดผ่านหรือขอแก้ ชิ้นงานจะบันทึกสถานะและหายจากคิวรอตรวจทันที
        </p>
      </form>
    </section>
  );
}
