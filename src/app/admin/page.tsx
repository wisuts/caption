import { AdminDashboardClient } from "@/components/admin-dashboard-client";
import { getAllCaptionsDb } from "@/lib/db/queries";

// ต้องดึงข้อมูลสดทุกครั้ง ห้าม cache แบบหน้า static เพราะข้อมูลเปลี่ยนบ่อย
export const dynamic = "force-dynamic";

// หน้ารวมงานของเจ้าของ (PRD 5.1) — ดึงข้อมูลจริงจากฐานข้อมูล
export default async function AdminDashboardPage() {
  const allCaptions = await getAllCaptionsDb();
  return <AdminDashboardClient allCaptions={allCaptions} />;
}
