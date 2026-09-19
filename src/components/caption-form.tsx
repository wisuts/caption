import Link from "next/link";
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
import { BRANDS, CHANNELS } from "@/lib/types";
import type { Caption } from "@/lib/types";

// ฟอร์มเพิ่ม/แก้ไขแคปชัน (PRD 5.2) — ใช้ร่วมกันทั้งหน้าเพิ่มใหม่และหน้าแก้ไข
// Phase 1: หน้าตาและช่องกรอกครบตาม PRD แต่ปุ่มยังไม่บันทึกข้อมูลจริง (มาทำใน Phase 2)
export function CaptionForm({ initial }: { initial?: Caption }) {
  return (
    <form className="flex flex-col gap-space-lg">
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
          />
        </div>

        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="brand">
              แบรนด์ <span className="text-error">*</span>
            </Label>
            <Select name="brand" defaultValue={initial?.brand ?? BRANDS[0]}>
              <SelectTrigger id="brand" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BRANDS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
          <Label htmlFor="imageUrl">ลิงก์รูปประกอบ</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            placeholder="https://drive.google.com/..."
            defaultValue={initial?.imageUrl ?? ""}
          />
        </div>
      </section>

      <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h2 className="text-headline-sm text-on-surface">
          ตัวแคปชัน <span className="text-error">*</span>
        </h2>
        <Textarea
          name="captionText"
          placeholder="พิมพ์แคปชันที่นี่..."
          rows={12}
          defaultValue={initial?.pendingDraftText}
          className="text-body-lg"
        />
      </section>

      <div className="flex flex-col-reverse items-stretch gap-space-sm sm:flex-row sm:items-center sm:justify-end">
        <Link href="/admin" className={buttonVariants({ variant: "ghost" })}>
          ยกเลิก
        </Link>
        <Button type="button" variant="secondary">
          บันทึกไว้ก่อน
        </Button>
        <Button type="button">ส่งตรวจ</Button>
      </div>
      <p className="text-right text-body-sm text-on-surface-variant">
        ปุ่มด้านบนยังไม่บันทึกข้อมูลจริงใน Phase 1 — จะเริ่มบันทึกจริงใน Phase 2
      </p>
    </form>
  );
}
