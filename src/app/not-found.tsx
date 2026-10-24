import Link from "next/link";

// หน้าที่ขึ้นเวลาเปิดลิงก์ที่ไม่มีอยู่ เช่น ลิงก์ก๊อปมาไม่ครบ หรือชิ้นงานถูกลบไปแล้ว
// ต้องเป็นภาษาคนอ่านรู้เรื่อง ไม่ใช่หน้าขาว ๆ ภาษาอังกฤษ
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-space-md px-gutter-desktop py-space-xl text-center">
      <h1 className="text-headline-lg text-on-surface">ไม่พบหน้านี้</h1>
      <p className="text-body-lg text-on-surface-variant">
        ลิงก์อาจคัดลอกมาไม่ครบ หรือชิ้นงานนี้ถูกลบไปแล้ว
      </p>
      <p className="text-body-md text-on-surface-variant">
        ลองขอลิงก์ใหม่อีกครั้ง หรือกดปุ่มด้านล่างเพื่อกลับไปหน้าคิวรอตรวจ
      </p>
      <Link
        href="/"
        className="mt-space-sm rounded-lg bg-primary px-space-lg py-space-sm text-label-lg font-medium text-on-primary hover:brightness-110"
      >
        กลับไปหน้าคิวรอตรวจ
      </Link>
    </main>
  );
}
