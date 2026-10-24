import { ReviewQueueClient } from "@/components/review-queue-client";
import {
  getAwaitingOwnerCaptionsDb,
  getPendingReviewCaptionsDb,
} from "@/lib/db/queries";

// หน้าคิวรอตรวจ (PRD 4.1) — หน้าแรกที่หัวหน้าเปิด ไม่ต้อง login
// ต้องดึงข้อมูลสดทุกครั้ง ห้าม cache แบบหน้า static เพราะข้อมูลเปลี่ยนบ่อย
export const dynamic = "force-dynamic";

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string; n?: string }>;
}) {
  const [items, awaitingOwner, params] = await Promise.all([
    getPendingReviewCaptionsDb(),
    getAwaitingOwnerCaptionsDb(),
    searchParams,
  ]);

  return (
    <ReviewQueueClient
      allCaptions={items}
      awaitingOwner={awaitingOwner}
      justReviewed={
        params.done === "approved" || params.done === "changes_requested"
          ? { result: params.done, noteCount: Number(params.n ?? 0) }
          : null
      }
    />
  );
}
