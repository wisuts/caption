import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-space-md bg-background p-space-lg text-center">
      <span className="rounded-full bg-primary-container px-space-md py-space-xs text-label-sm font-medium tracking-wide text-on-primary uppercase">
        Phase 0
      </span>
      <h1 className="text-display-lg text-on-background">คิวตรวจแคปชัน</h1>
      <p className="max-w-md text-body-lg text-on-surface-variant">
        วางโครงโปรเจกต์ ใส่โทนสีและตัวอักษรตาม DESIGN.md เรียบร้อยแล้ว
        ยังไม่มีหน้าจอจริง — หน้าจอจริงจะเริ่มสร้างใน Phase 1
      </p>
      <Button>ปุ่มตัวอย่าง (ทดสอบธีม)</Button>
    </main>
  );
}
