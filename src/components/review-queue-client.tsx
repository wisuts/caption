"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CaptionRow } from "@/components/caption-row";
import { EmptyState } from "@/components/empty-state";
import { SortSelect } from "@/components/sort-select";
import { buttonVariants } from "@/components/ui/button";
import { sortCaptions, type SortOrder } from "@/lib/sort-captions";
import type { Caption } from "@/lib/types";

// หน้าคิวรอตรวจ (PRD 4.1) — รับข้อมูลจริงจาก server component แม่ (src/app/page.tsx)
export function ReviewQueueClient({ allCaptions }: { allCaptions: Caption[] }) {
  const [sort, setSort] = useState<SortOrder>("newest");
  const items = useMemo(() => sortCaptions(allCaptions, sort), [allCaptions, sort]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-space-lg px-gutter-desktop py-space-xl">
      <div className="flex flex-col gap-space-xs">
        <h1 className="text-display-lg text-on-background">
          รอตรวจ {items.length > 0 && `(${items.length})`}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          คลิกเลือกรายการเพื่อเปิดอ่านแคปชัน ตรวจรูปประกอบ และส่งผลการตรวจได้ทันที
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState title="ตอนนี้ไม่มีงานรอตรวจ" />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-space-xs rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
            <span className="text-label-sm text-on-surface-variant">เรียงลำดับ:</span>
            <SortSelect value={sort} onChange={setSort} />
          </div>

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
        </>
      )}
    </main>
  );
}
