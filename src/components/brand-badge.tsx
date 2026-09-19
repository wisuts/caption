import { cn } from "@/lib/utils";
import type { Brand } from "@/lib/types";

const BRAND_STYLE: Record<Brand, string> = {
  FutureSkill: "bg-primary text-on-primary",
  SkillPass: "bg-tertiary text-on-tertiary",
};

export function BrandBadge({
  brand,
  className,
}: {
  brand: Brand;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-label-sm font-medium tracking-wide",
        BRAND_STYLE[brand],
        className
      )}
    >
      {brand}
    </span>
  );
}
