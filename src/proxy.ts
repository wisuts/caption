import { auth } from "@/lib/auth/server";

// ป้องกันเฉพาะหน้าหลังบ้าน (/admin) — หน้าฝั่งหัวหน้า/สาธารณะยังเปิดได้ไม่ต้อง login
// ตาม PRD: แอปแบบ B (หน้าบ้าน + หลังบ้าน)
export default auth.middleware({ loginUrl: "/admin/sign-in" });

export const config = {
  // จับทุกอย่างใต้ /admin ยกเว้นหน้า sign-in และ setup (กันเด้งวนไม่รู้จบ)
  // TODO: ลบ "setup" ออกจากส่วนที่ยกเว้นนี้ทันทีหลังลบหน้า /admin/setup ทิ้งแล้ว
  matcher: ["/admin", "/admin/((?!sign-in|setup).*)"],
};
