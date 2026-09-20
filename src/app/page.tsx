import { ReviewQueueClient } from "@/components/review-queue-client";
import { getPendingReviewCaptionsDb } from "@/lib/db/queries";

// หน้าคิวรอตรวจ (PRD 4.1) — หน้าแรกที่หัวหน้าเปิด ไม่ต้อง login
// ต้องดึงข้อมูลสดทุกครั้ง ห้าม cache แบบหน้า static เพราะข้อมูลเปลี่ยนบ่อย
export const dynamic = "force-dynamic";

export default async function ReviewQueuePage() {
  const items = await getPendingReviewCaptionsDb();

  return <ReviewQueueClient allCaptions={items} />;
}
