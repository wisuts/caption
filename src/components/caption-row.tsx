import Link from "next/link";
import type { ReactNode } from "react";
import { BrandBadge } from "@/components/brand-badge";
import { ChannelBadge } from "@/components/channel-badge";
import { StatusBadge } from "@/components/status-badge";
import { CaptionThumbnail } from "@/components/caption-thumbnail";
import type { Caption } from "@/lib/types";
import { formatThaiDate, formatThaiDateTime } from "@/lib/thai-date";
import { getLatestSubmittedVersion } from "@/lib/caption-helpers";

export function CaptionRow({
  caption,
  href,
  action,
}: {
  caption: Caption;
  href: string;
  /** ปุ่มหรือของท้ายแถว เช่น "ตรวจงานนี้" */
  action?: ReactNode;
}) {
  const latestVersion = getLatestSubmittedVersion(caption);

  return (
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center">
      <Link href={href} className="flex min-w-0 flex-1 items-start gap-space-md">
        <CaptionThumbnail imageUrl={caption.imageUrl} />
        <div className="flex min-w-0 flex-1 flex-col gap-space-xs">
        <div className="flex flex-wrap items-center gap-space-xs">
          <BrandBadge brand={caption.brand} />
          <ChannelBadge channel={caption.channel} />
          <StatusBadge status={caption.status} />
          {latestVersion && (
            <span className="rounded bg-surface-container px-1.5 py-0.5 text-label-sm font-semibold text-on-surface-variant">
              v{latestVersion.versionNumber}
            </span>
          )}
        </div>
        <h2 className="text-headline-md text-on-surface">{caption.title}</h2>
        <div className="flex flex-wrap items-center gap-space-md text-body-sm text-on-surface-variant">
          <span>ผู้เขียน: {caption.authorName}</span>
          <span>
            กำหนดลง:{" "}
            {caption.scheduledDate
              ? formatThaiDate(caption.scheduledDate)
              : "ยังไม่กำหนด"}
          </span>
          {latestVersion && (
            <span>ส่งตรวจล่าสุด: {formatThaiDateTime(latestVersion.submittedAt)}</span>
          )}
        </div>
        </div>
      </Link>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
