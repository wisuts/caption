import type { Caption } from "@/lib/types";

/** เวอร์ชันล่าสุดที่ "ส่งตรวจแล้ว" ของชิ้นงาน (ไม่ใช่ข้อความแก้ค้างไว้) */
export function getLatestSubmittedVersion(caption: Caption) {
  return caption.versions[caption.versions.length - 1] ?? null;
}

/**
 * เวอร์ชันก่อนหน้าเวอร์ชันล่าสุด ใช้เทียบว่ารอบนี้เปลี่ยนอะไรไปบ้าง
 * และแก้ตามที่หัวหน้าสั่งไว้ครบหรือยัง
 */
export function getPreviousVersion(caption: Caption) {
  return caption.versions[caption.versions.length - 2] ?? null;
}

/** เช็คว่าชิ้นงานนี้มีข้อความแก้ค้างที่ยังไม่ได้ส่งตรวจอยู่หรือไม่ */
export function hasUnsentEdit(caption: Caption): boolean {
  const latest = getLatestSubmittedVersion(caption);
  const latestText = latest?.text ?? "";
  return caption.pendingDraftText.trim() !== latestText.trim();
}
