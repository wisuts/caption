import Link from "next/link";
import { CaptionForm } from "@/components/caption-form";

export default function NewCaptionPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-space-lg px-gutter-desktop py-space-xl">
      <Link
        href="/admin"
        className="w-fit text-body-sm font-medium text-on-surface-variant hover:text-primary"
      >
        ← กลับหน้ารวมงาน
      </Link>
      <div className="flex flex-col gap-space-xs">
        <h1 className="text-headline-lg text-on-surface">เพิ่มแคปชันใหม่</h1>
        <p className="text-body-md text-on-surface-variant">
          กรอกข้อมูลที่มีเครื่องหมาย <span className="text-error">*</span>{" "}
          ให้ครบก่อนส่งตรวจ
        </p>
      </div>
      <CaptionForm />
    </main>
  );
}
