import { SignInForm } from "@/components/sign-in-form";

// หน้า login ของเจ้าของ (PRD 3 / 5) — บัญชีเดียว ไม่มีหน้าสมัครสมาชิก
export default function SignInPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-space-lg bg-background p-space-lg">
      <div className="flex flex-col items-center gap-space-xs text-center">
        <h1 className="text-headline-lg text-on-surface">เข้าสู่ระบบหลังบ้าน</h1>
        <p className="text-body-md text-on-surface-variant">
          สำหรับเจ้าของแอปเท่านั้น
        </p>
      </div>
      <SignInForm />
    </main>
  );
}
