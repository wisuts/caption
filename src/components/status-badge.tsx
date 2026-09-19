import { cn } from "@/lib/utils";
import { STATUS_LABEL_TH, type CaptionStatus } from "@/lib/types";

const STATUS_STYLE: Record<CaptionStatus, string> = {
  draft: "bg-surface-container text-on-surface-variant",
  pending_review: "bg-amber-100 text-amber-900",
  changes_requested: "bg-error-container text-on-error-container",
  approved: "bg-tertiary-fixed text-on-tertiary-fixed",
  published: "bg-primary-fixed text-on-primary-fixed",
};

const STATUS_DOT: Record<CaptionStatus, string> = {
  draft: "bg-on-surface-variant",
  pending_review: "bg-amber-500",
  changes_requested: "bg-error",
  approved: "bg-tertiary-container",
  published: "bg-primary-container",
};

export function StatusBadge({
  status,
  className,
}: {
  status: CaptionStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-label-sm font-semibold",
        STATUS_STYLE[status],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
      {STATUS_LABEL_TH[status]}
    </span>
  );
}
