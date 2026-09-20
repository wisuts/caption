import { cn } from "@/lib/utils";
import type { CaptionVersion } from "@/lib/types";
import { VersionCaptionCard } from "@/components/version-caption-card";

const DOT_STYLE: Record<CaptionVersion["reviewResult"], string> = {
  pending: "bg-amber-500",
  approved: "bg-tertiary-container",
  changes_requested: "bg-error",
};

/** ไล่จากเวอร์ชันใหม่สุดลงไปเวอร์ชันแรก ตาม PRD 4.2 */
export function VersionTimeline({ versions }: { versions: CaptionVersion[] }) {
  const newestFirst = [...versions].reverse();

  return (
    <div className="relative flex flex-col gap-space-lg pl-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-surface-container-high">
      {newestFirst.map((version) => (
        <div key={version.versionNumber} className="relative">
          <span
            className={cn(
              "absolute -left-6 top-1.5 h-3 w-3 rounded-full ring-4 ring-primary/10",
              DOT_STYLE[version.reviewResult]
            )}
          />
          <VersionCaptionCard version={version} />
        </div>
      ))}
    </div>
  );
}
