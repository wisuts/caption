import { cn } from "@/lib/utils";
import type { Brand } from "@/lib/types";

// FutureSkill/SkillPass เป็นชื่อแบรนด์ ให้สีเด่น ส่วนสายคอร์สใช้สีอ่อนกว่า จะได้แยกออกด้วยตา
const BRAND_STYLE: Record<Brand, string> = {
  FutureSkill: "bg-primary text-on-primary",
  SkillPass: "bg-tertiary text-on-tertiary",
  "Creator & Marketing": "bg-secondary-container text-on-secondary-container",
  "Self Growth": "bg-secondary-container text-on-secondary-container",
  "AI Automation Tech": "bg-secondary-container text-on-secondary-container",
  Data: "bg-secondary-container text-on-secondary-container",
  "Business Leader": "bg-secondary-container text-on-secondary-container",
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

/** ป้ายแบรนด์ทั้งหมดของชิ้นงานหนึ่ง (เลือกได้หลายแบรนด์) */
export function BrandBadges({
  brands,
  className,
}: {
  brands: Brand[];
  className?: string;
}) {
  return (
    <>
      {brands.map((b) => (
        <BrandBadge key={b} brand={b} className={className} />
      ))}
    </>
  );
}
