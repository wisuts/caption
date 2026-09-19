import type { ReactNode } from "react";

export function EmptyState({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-space-md rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
      <p className="text-headline-sm text-on-surface">{title}</p>
      {action}
    </div>
  );
}
