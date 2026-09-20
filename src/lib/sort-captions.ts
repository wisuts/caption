import type { Caption } from "@/lib/types";

/**
 * การเรียงลำดับรายการ — ค่าตั้งต้นคือใหม่สุดอยู่บน
 * มีตัวเลือกให้สลับ และมีป้ายบอกชัด ๆ ว่าอันบนสุดคืออันใหม่หรืออันเก่า
 * จะได้ไม่ต้องเดาเวลาเปิดมาเจอรายการยาว ๆ
 */
export type SortOrder = "newest" | "oldest";

export const SORT_LABEL: Record<SortOrder, string> = {
  newest: "ใหม่สุดอยู่บน",
  oldest: "เก่าสุดอยู่บน",
};

export function sortCaptions(items: Caption[], order: SortOrder): Caption[] {
  return [...items].sort((a, b) => {
    const diff = Date.parse(a.updatedAt) - Date.parse(b.updatedAt);
    return order === "newest" ? -diff : diff;
  });
}
