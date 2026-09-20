import { cn } from "@/lib/utils";
import type { CaptionVersion } from "@/lib/types";
import { formatThaiDateTime } from "@/lib/thai-date";
import { HighlightedCaptionText } from "@/components/highlighted-caption-text";
import { orderNotesByPosition } from "@/lib/order-notes-by-position";

const RESULT_LABEL: Record<CaptionVersion["reviewResult"], string> = {
  pending: "รอตรวจ",
  approved: "ผ่าน",
  changes_requested: "ขอแก้",
};

const RESULT_STYLE: Record<CaptionVersion["reviewResult"], string> = {
  pending: "bg-amber-100 text-amber-900",
  approved: "bg-tertiary-fixed text-on-tertiary-fixed",
  changes_requested: "bg-error-container text-on-error-container",
};

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
      {newestFirst.map((version) => {
        const orderedNotes = orderNotesByPosition(version.text, version.notes);

        return (
        <div key={version.versionNumber} className="relative flex flex-col gap-space-xs">
          <span
            className={cn(
              "absolute -left-6 top-1.5 h-3 w-3 rounded-full ring-4 ring-primary/10",
              DOT_STYLE[version.reviewResult]
            )}
          />
          <div className="flex flex-wrap items-center justify-between gap-space-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-headline-sm text-on-surface">
                เวอร์ชัน {version.versionNumber}
              </span>
              <span
                className={cn(
                  "rounded px-2 py-0.5 text-label-sm font-semibold",
                  RESULT_STYLE[version.reviewResult]
                )}
              >
                {RESULT_LABEL[version.reviewResult]}
              </span>
            </div>
            <span className="text-label-sm text-on-surface-variant">
              ส่งตรวจ {formatThaiDateTime(version.submittedAt)}
            </span>
          </div>
          <div className="rounded-lg bg-surface-container-low p-space-md text-body-md text-on-surface">
            <HighlightedCaptionText
              text={version.text}
              marks={orderedNotes
                .filter((n) => n.original.quotedText !== null)
                .map((n) => ({
                  quotedText: n.original.quotedText as string,
                  index: n.index,
                }))}
            />
          </div>
          {version.notes.length > 0 && (
            <div className="flex flex-col gap-space-sm rounded-lg bg-error-container/40 p-space-md text-body-sm text-on-surface">
              <p className="font-semibold text-on-error-container">
                โน้ตจากหัวหน้า
                {version.reviewedAt &&
                  ` (${formatThaiDateTime(version.reviewedAt)})`}
                :
              </p>
              <ul className="flex flex-col gap-space-sm">
                {orderedNotes.map(({ index, original: n }) => (
                  <li key={n.id} className="flex items-start gap-space-xs">
                    {index != null && (
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[11px] font-bold text-white">
                        {index}
                      </span>
                    )}
                    <div className="flex flex-col gap-1">
                      {n.quotedText && (
                        <span className="w-fit rounded bg-amber-200 px-1.5 py-0.5 text-label-sm text-amber-950">
                          “{n.quotedText}”
                        </span>
                      )}
                      <span className="italic leading-relaxed">{n.note}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}
