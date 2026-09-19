"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { CaptionRow } from "@/components/caption-row";
import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BRANDS,
  CHANNELS,
  CAPTION_STATUSES,
  STATUS_LABEL_TH,
  type Brand,
  type Channel,
  type CaptionStatus,
  type Caption,
} from "@/lib/types";

const ALL = "all" as const;

// หน้ารวมงานของเจ้าของ (PRD 5.1) — ทุกสถานะในรายการเดียว เรียงตามความเคลื่อนไหวล่าสุด
// รับข้อมูลจริงจาก server component แม่ (src/app/admin/page.tsx) แล้วกรองฝั่ง client
export function AdminDashboardClient({ allCaptions }: { allCaptions: Caption[] }) {
  const [status, setStatus] = useState<CaptionStatus | typeof ALL>(ALL);
  const [brand, setBrand] = useState<Brand | typeof ALL>(ALL);
  const [channel, setChannel] = useState<Channel | typeof ALL>(ALL);

  const counts = useMemo(() => {
    const base: Record<CaptionStatus, number> = {
      draft: 0,
      pending_review: 0,
      changes_requested: 0,
      approved: 0,
      published: 0,
    };
    for (const c of allCaptions) base[c.status] += 1;
    return base;
  }, [allCaptions]);

  const items = useMemo(() => {
    return allCaptions.filter((c) => {
      const matchStatus = status === ALL || c.status === status;
      const matchBrand = brand === ALL || c.brand === brand;
      const matchChannel = channel === ALL || c.channel === channel;
      return matchStatus && matchBrand && matchChannel;
    });
  }, [allCaptions, status, brand, channel]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-space-lg px-gutter-desktop py-space-xl">
      <div className="flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-space-xs">
          <h1 className="text-display-lg text-on-background">จัดการแคปชันทั้งหมด</h1>
          <p className="text-body-md text-on-surface-variant">
            ดูสถานะ เพิ่ม แก้ไข และส่งแคปชันให้หัวหน้าตรวจ
          </p>
        </div>
        <Link href="/admin/new" className={buttonVariants({ variant: "default" })}>
          + เพิ่มแคปชันใหม่
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-space-sm sm:grid-cols-5">
        {CAPTION_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(status === s ? ALL : s)}
            className={cn(
              "flex flex-col gap-space-xs rounded-xl bg-surface-container-lowest p-space-md text-left shadow-sm transition-colors hover:bg-surface-container-low",
              status === s && "ring-2 ring-primary",
              s === "changes_requested" &&
                "bg-error-container text-on-error-container hover:bg-error-container/80"
            )}
          >
            <span className="text-label-md font-medium">{STATUS_LABEL_TH[s]}</span>
            <span className="text-display-lg leading-none">{counts[s]}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
        <FilterField label="แบรนด์">
          <Select value={brand} onValueChange={(v) => setBrand(v as Brand | typeof ALL)}>
            <SelectTrigger>
              <SelectValue>
                {(v: Brand | typeof ALL) => (v === ALL ? "ทุกแบรนด์" : v)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>ทุกแบรนด์</SelectItem>
              {BRANDS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="ช่องทาง">
          <Select
            value={channel}
            onValueChange={(v) => setChannel(v as Channel | typeof ALL)}
          >
            <SelectTrigger>
              <SelectValue>
                {(v: Channel | typeof ALL) => (v === ALL ? "ทุกช่องทาง" : v)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>ทุกช่องทาง</SelectItem>
              {CHANNELS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        {status !== ALL && (
          <button
            type="button"
            onClick={() => setStatus(ALL)}
            className="text-label-md font-medium text-primary hover:underline"
          >
            ล้างตัวกรองสถานะ ({STATUS_LABEL_TH[status]}) ✕
          </button>
        )}
      </div>

      {allCaptions.length === 0 ? (
        <EmptyState
          title="ยังไม่มีแคปชัน กดปุ่มเพิ่มแคปชันใหม่เพื่อเริ่ม"
          action={
            <Link href="/admin/new" className={buttonVariants({ variant: "default" })}>
              + เพิ่มแคปชันใหม่
            </Link>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState title="ไม่เจองานที่ตรงกับตัวกรองนี้" />
      ) : (
        <div className="flex flex-col gap-space-md">
          {items.map((caption) => (
            <CaptionRow
              key={caption.id}
              caption={caption}
              href={`/admin/${caption.id}`}
              action={
                <Link
                  href={`/admin/${caption.id}`}
                  className={buttonVariants({ variant: "secondary" })}
                >
                  จัดการ
                </Link>
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-space-xs">
      <span className="text-label-sm text-on-surface-variant">{label}:</span>
      {children}
    </div>
  );
}
