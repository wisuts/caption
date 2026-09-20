import { SetupOwnerForm } from "@/components/setup-owner-form";

// หน้าชั่วคราวสำหรับสร้างบัญชีเจ้าของคนแรกเท่านั้น
// ใช้เสร็จแล้วต้องลบไฟล์นี้ทิ้งทันที ห้ามปล่อยให้เปิดใช้ถาวร (PRD: ไม่มีหน้าสมัครสมาชิก)
export default function SetupOwnerPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-space-lg bg-background p-space-lg">
      <div className="flex flex-col items-center gap-space-xs text-center">
        <h1 className="text-headline-lg text-on-surface">
          สร้างบัญชีเจ้าของ (ใช้ครั้งเดียว)
        </h1>
        <p className="max-w-sm text-body-md text-on-surface-variant">
          กรอกอีเมลและตั้งรหัสผ่านของคุณเอง หน้านี้จะถูกลบออกจากเว็บทันที
          หลังสร้างบัญชีเสร็จ
        </p>
      </div>
      <SetupOwnerForm />
    </main>
  );
}
