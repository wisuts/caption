"use client";

import { useMemo, useState, type ReactNode } from "react";
import { CaptionRow } from "@/components/caption-row";
import { EmptyState } from "@/components/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortSelect } from "@/components/sort-select";
import { sortCaptions, type SortOrder } from "@/lib/sort-captions";
import { BRANDS, CHANNELS, type Brand, type Channel, type Caption } from "@/lib/types";

const ALL = "all" as const;

// หน้าคลังงานที่ผ่านแล้ว (PRD 4.3) — ไม่ต้อง login มีตัวกรองแบรนด์/ช่องทาง
// รับข้อมูลจริงจาก server component แม่ (src/app/archive/page.tsx) แล้วกรองฝั่ง client
export function ArchiveClient({ allCaptions }: { allCaptions: Caption[] }) {
  const [brand, setBrand] = useState<Brand | typeof ALL>(ALL);
  const [channel, setChannel] = useState<Channel | typeof ALL>(ALL);
  const [sort, setSort] = useState<SortOrder>("newest");

  const items = useMemo(() => {
    const filtered = allCaptions.filter((c) => {
      const matchBrand = brand === ALL || c.brands.includes(brand);
      const matchChannel = channel === ALL || c.channel === channel;
      return matchBrand && matchChannel;
    });
    return sortCaptions(filtered, sort);
  }, [allCaptions, brand, channel, sort]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-space-lg px-gutter-desktop py-space-xl">
      <div className="flex flex-col gap-space-xs">
        <h1 className="text-display-lg text-on-background">คลังงานที่ผ่านแล้ว</h1>
        <p className="text-body-md text-on-surface-variant">
          ย้อนดูแคปชันที่ผ่านแล้วเพื่อใช้เป็นตัวอย่าง
        </p>
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

        <FilterField label="เรียงลำดับ">
          <SortSelect value={sort} onChange={setSort} />
        </FilterField>
      </div>

      {allCaptions.length === 0 ? (
        <EmptyState title="ยังไม่มีงานที่ผ่านแล้ว" />
      ) : items.length === 0 ? (
        <EmptyState title="ไม่เจองานที่ตรงกับตัวกรองนี้" />
      ) : (
        <div className="flex flex-col gap-space-md">
          {items.map((caption) => (
            <CaptionRow
              key={caption.id}
              caption={caption}
              href={`/items/${caption.id}`}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-space-xs">
      <span className="text-label-sm text-on-surface-variant">{label}:</span>
      {children}
    </div>
  );
}
