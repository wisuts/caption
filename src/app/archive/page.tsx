import { ArchiveClient } from "@/components/archive-client";
import { getArchivedCaptionsDb } from "@/lib/db/queries";

// ต้องดึงข้อมูลสดทุกครั้ง ห้าม cache แบบหน้า static เพราะข้อมูลเปลี่ยนบ่อย
export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const allCaptions = await getArchivedCaptionsDb();
  return <ArchiveClient allCaptions={allCaptions} />;
}
