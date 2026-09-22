import { BRANDS, type Brand } from "@/lib/types";

/**
 * 1 ชิ้นงานเลือกแบรนด์ได้หลายอัน เก็บรวมในช่องเดิมคั่นด้วยการขึ้นบรรทัดใหม่
 * (ไม่ต้องทำตารางแยก และงานเก่าที่เก็บไว้ค่าเดียวก็อ่านได้เหมือนเดิม)
 * กรองเฉพาะชื่อที่อยู่ใน BRANDS จริง ๆ กันข้อมูลแปลกปลอมหลุดเข้ามา
 */
export function parseBrands(value: string | null): Brand[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line): line is Brand => BRANDS.includes(line as Brand));
}

export function joinBrands(brands: Brand[]): string {
  // เรียงตามลำดับใน BRANDS เสมอ ป้ายแบรนด์จะได้เรียงเหมือนกันทุกที่
  return BRANDS.filter((b) => brands.includes(b)).join("\n");
}
