"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaptionHighlightEditor } from "@/components/caption-highlight-editor";
import { ImageUrlFields } from "@/components/image-url-fields";
import { BrandPicker } from "@/components/brand-picker";
import { CHANNELS } from "@/lib/types";
import type { Caption, ReviewNote } from "@/lib/types";
import {
  saveCaptionDraft,
  submitCaptionForReview,
  type CaptionFormState,
} from "@/lib/actions/captions";

const EMPTY_STATE: CaptionFormState = { errors: {} };

// ฟอร์มเพิ่ม/แก้ไขแคปชัน (PRD 5.2) — ใช้ร่วมกันทั้งหน้าเพิ่มใหม่และหน้าแก้ไข
export function CaptionForm({
  initial,
  reviewNotes,
  reviewedText,
}: {
  initial?: Caption;
  /** โน้ตที่หัวหน้าขอให้แก้จากเวอร์ชันล่าสุด — มีเฉพาะตอนเข้ามาแก้ชิ้นงานที่ถูกตรวจแล้ว */
  reviewNotes?: ReviewNote[];
  reviewedText?: string;
}) {
  const [, draftAction, isDraftPending] = useActionState(
    saveCaptionDraft,
    EMPTY_STATE
  );
  const [submitState, submitAction, isSubmitPending] = useActionState(
    submitCaptionForReview,
    EMPTY_STATE
  );

  // แสดงข้อความเตือนของปุ่มที่เพิ่งกดล่าสุดเท่านั้น
  const errors = submitState.errors;
  const isPending = isDraftPending || isSubmitPending;

  return (
    <form className="flex flex-col gap-space-lg">
      <input type="hidden" name="id" value={initial?.id ?? ""} />

      <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h2 className="text-headline-sm text-on-surface">ข้อมูลทั่วไป</h2>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">
            หัวข้อสั้น <span className="text-error">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="เช่น เปิดตัวคอร์ส AI Data Analyst ลดราคา 50%"
            defaultValue={initial?.title}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && (
            <p className="text-body-sm text-error">{errors.title}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>
            แบรนด์ <span className="text-error">*</span>
          </Label>
          <BrandPicker
            name="brand"
            defaultValue={initial?.brands ?? []}
            invalid={Boolean(errors.brand)}
          />
          {errors.brand && <p className="text-body-sm text-error">{errors.brand}</p>}
        </div>

        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="channel">
              ช่องทาง <span className="text-error">*</span>
            </Label>
            <Select name="channel" defaultValue={initial?.channel ?? CHANNELS[0]}>
              <SelectTrigger id="channel" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNELS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="scheduledDate">กำหนดลง (เว้นว่างได้)</Label>
            <Input
              id="scheduledDate"
              name="scheduledDate"
              type="date"
              defaultValue={initial?.scheduledDate ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="authorName">ชื่อคนเขียน</Label>
            <Input
              id="authorName"
              name="authorName"
              placeholder="ชื่อผู้เขียน"
              defaultValue={initial?.authorName}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h2 className="text-headline-sm text-on-surface">รูปภาพประกอบ (เว้นว่างได้)</h2>
        <div className="flex flex-col gap-1.5">
          <Label>ลิงก์รูปประกอบ (ใส่ได้หลายรูป)</Label>
          <ImageUrlFields name="imageUrl" defaultValue={initial?.imageUrl ?? null} />
        </div>
      </section>

      <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h2 className="text-headline-sm text-on-surface">
          ตัวแคปชัน <span className="text-error">*</span>
        </h2>
        {reviewNotes && reviewNotes.length > 0 && reviewedText ? (
          <CaptionHighlightEditor
            name="captionText"
            defaultValue={initial?.pendingDraftText ?? ""}
            reviewedText={reviewedText}
            notes={reviewNotes}
            invalid={Boolean(errors.captionText)}
          />
        ) : (
          <Textarea
            id="captionText"
            name="captionText"
            placeholder="พิมพ์แคปชันที่นี่..."
            rows={12}
            defaultValue={initial?.pendingDraftText}
            aria-invalid={Boolean(errors.captionText)}
            className="text-body-lg"
          />
        )}
        {errors.captionText && (
          <p className="text-body-sm text-error">{errors.captionText}</p>
        )}
      </section>

      <div className="flex flex-col-reverse items-stretch gap-space-sm sm:flex-row sm:items-center sm:justify-end">
        <Link href="/admin" className={buttonVariants({ variant: "ghost" })}>
          ยกเลิก
        </Link>
        <Button
          type="submit"
          formAction={draftAction}
          variant="secondary"
          disabled={isPending}
        >
          {isDraftPending ? "กำลังบันทึก..." : "บันทึกไว้ก่อน"}
        </Button>
        <Button type="submit" formAction={submitAction} disabled={isPending}>
          {isSubmitPending ? "กำลังส่งตรวจ..." : "ส่งตรวจ"}
        </Button>
      </div>
    </form>
  );
}
