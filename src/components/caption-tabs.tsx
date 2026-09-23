"use client";

import { useState, type RefObject } from "react";
import { HighlightedCaptionText } from "@/components/highlighted-caption-text";
import type { HighlightMark } from "@/components/highlighted-caption-text";
import { CaptionDiffView } from "@/components/caption-diff-view";
import { VersionCaptionCard } from "@/components/version-caption-card";
import { CopyCaptionButton } from "@/components/copy-caption-button";
import type { CaptionVersion } from "@/lib/types";

/**
 * กล่องอ่านเนื้อหาแบบมีแท็บ: เวอร์ชันล่าสุด / สิ่งที่เปลี่ยนไป / เวอร์ชันเก่าแต่ละอัน
 * ใช้ทั้งหน้าที่กำลังตรวจ (ลากคลุมสั่งแก้ได้) และหน้าที่ตรวจเสร็จแล้ว (อ่านอย่างเดียว)
 * จะได้อ่านเวอร์ชันเก่าได้เต็มความกว้างเหมือนกันทั้งสองหน้า
 */
export function CaptionTabs({
  versionNumber,
  text,
  versions,
  previousText,
  marks = [],
  textRef,
  onMouseUp,
  selectable = false,
}: {
  versionNumber: number;
  text: string;
  versions: CaptionVersion[];
  previousText?: string;
  marks?: HighlightMark[];
  textRef?: RefObject<HTMLDivElement | null>;
  onMouseUp?: () => void;
  /** true เมื่อหน้านี้ลากคลุมข้อความเพื่อสั่งแก้ได้ */
  selectable?: boolean;
}) {
  const [activeTab, setActiveTab] = useState("latest");

  const earlierVersions = [...versions]
    .filter((v) => v.versionNumber !== versionNumber)
    .reverse();
  const tabs = [
    { key: "latest", label: `เวอร์ชันล่าสุด (v${versionNumber})` },
    ...(previousText ? [{ key: "diff", label: "สิ่งที่เปลี่ยนไป" }] : []),
    ...earlierVersions.map((v) => ({
      key: `v${v.versionNumber}`,
      label: `เวอร์ชัน ${v.versionNumber}`,
    })),
  ];
  const activeVersion =
    earlierVersions.find((v) => `v${v.versionNumber}` === activeTab) ?? null;

  const hint =
    activeTab === "diff"
      ? "เขียว = บรรทัดที่แก้มาใหม่ · ขีดฆ่าสีเทา = ของเดิมที่ถูกแทนที่"
      : activeTab !== "latest"
        ? selectable
          ? "เวอร์ชันเก่า อ่านอย่างเดียว — สลับกลับไปแท็บเวอร์ชันล่าสุดเพื่อคลุมข้อความสั่งแก้"
          : "เวอร์ชันเก่า พร้อมไฮไลต์และโน้ตของรอบนั้น"
        : selectable
          ? "ลากคลุมข้อความที่มีปัญหา แล้วพิมพ์โน้ตทางขวาได้เลย"
          : "ข้อความเวอร์ชันล่าสุดที่ส่งตรวจ พร้อมไฮไลต์จุดที่หัวหน้าคอมเมนต์ไว้";

  return (
    <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`rounded-lg px-space-sm py-1.5 text-label-md font-medium transition-colors ${
              activeTab === t.key
                ? "bg-primary text-on-primary"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-space-xs">
        <p className="text-label-sm text-on-surface-variant">{hint}</p>
        {activeTab === "latest" && <CopyCaptionButton text={text} />}
      </div>
      <div
        ref={textRef}
        onMouseUp={activeTab === "latest" ? onMouseUp : undefined}
        className="select-text rounded-lg bg-surface-container-low/40 p-space-lg text-body-lg text-on-surface"
      >
        {activeTab === "latest" && (
          <HighlightedCaptionText text={text} marks={marks} />
        )}
        {activeTab === "diff" && previousText && (
          <CaptionDiffView previousText={previousText} currentText={text} />
        )}
        {activeVersion && <VersionCaptionCard version={activeVersion} />}
      </div>
    </section>
  );
}
