import Link from "next/link";
import { CaptionRow } from "@/components/caption-row";
import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { getPendingReviewCaptions } from "@/lib/mock-data";

// หน้าคิวรอตรวจ (PRD 4.1) — หน้าแรกที่หัวหน้าเปิด ไม่ต้อง login
export default function ReviewQueuePage() {
  const items = getPendingReviewCaptions();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-space-lg px-gutter-desktop py-space-xl">
      <div className="flex flex-col gap-space-xs">
        <h1 className="text-display-lg text-on-background">
          รอตรวจ {items.length > 0 && `(${items.length})`}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          คลิกเลือกรายการเพื่อเปิดอ่านแคปชัน ตรวจรูปประกอบ
          และส่งผลการตรวจได้ทันที (เรียงลำดับส่งเข้ามาใหม่สุดไว้ด้านบน)
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState title="ตอนนี้ไม่มีงานรอตรวจ" />
      ) : (
        <div className="flex flex-col gap-space-md">
          {items.map((caption) => (
            <CaptionRow
              key={caption.id}
              caption={caption}
              href={`/items/${caption.id}`}
              action={
                <Link
                  href={`/items/${caption.id}`}
                  className={buttonVariants({ variant: "default" })}
                >
                  ตรวจงานนี้
                </Link>
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}
