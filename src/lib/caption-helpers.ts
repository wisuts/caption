import type { Caption } from "@/lib/types";

/** เวอร์ชันล่าสุดที่ "ส่งตรวจแล้ว" ของชิ้นงาน (ไม่ใช่ข้อความแก้ค้างไว้) */
export function getLatestSubmittedVersion(caption: Caption) {
  return caption.versions[caption.versions.length - 1] ?? null;
}

/**
 * เวอร์ชันก่อนหน้าที่หัวหน้าเคยเขียนโน้ตสั่งแก้ไว้ ใช้เทียบว่ารอบนี้แก้ตามที่สั่งครบหรือยัง
 * ข้ามเวอร์ชันที่ตรวจผ่านหรือยังไม่มีโน้ต เพราะไม่มีอะไรให้เทียบ
 */
export function getPreviousNotedVersion(caption: Caption) {
  const latest = getLatestSubmittedVersion(caption);
  if (!latest) return null;
  for (let i = caption.versions.length - 2; i >= 0; i--) {
    const version = caption.versions[i];
    if (version.notes.length > 0) return version;
  }
  return null;
}

/** เช็คว่าชิ้นงานนี้มีข้อความแก้ค้างที่ยังไม่ได้ส่งตรวจอยู่หรือไม่ */
export function hasUnsentEdit(caption: Caption): boolean {
  const latest = getLatestSubmittedVersion(caption);
  const latestText = latest?.text ?? "";
  return caption.pendingDraftText.trim() !== latestText.trim();
}
