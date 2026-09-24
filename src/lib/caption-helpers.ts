import type { Caption } from "@/lib/types";

/** เวอร์ชันล่าสุดที่ "ส่งตรวจแล้ว" ของชิ้นงาน (ไม่ใช่ข้อความแก้ค้างไว้) */
export function getLatestSubmittedVersion(caption: Caption) {
  return caption.versions[caption.versions.length - 1] ?? null;
}

/**
 * เวอร์ชันล่าสุดที่หัวหน้า "ตรวจไปแล้ว" ใช้เป็นตัวตั้งต้นในการเทียบ
 *
 * ต้องยึดเวอร์ชันที่ถูกตรวจ ไม่ใช่เวอร์ชันก่อนหน้าเฉย ๆ เพราะเจ้าของส่งซ้ำได้
 * หลายรอบก่อนหัวหน้าจะกลับมาดู ถ้าเทียบกับเวอร์ชันก่อนหน้า หัวหน้าจะเห็นแค่
 * การแก้ครั้งสุดท้าย และเช็กลิสต์ "รอบที่แล้วขอแก้กี่จุด" จะหายไปด้วย
 */
export function getLastReviewedVersion(caption: Caption) {
  const latest = getLatestSubmittedVersion(caption);
  for (let i = caption.versions.length - 1; i >= 0; i--) {
    const version = caption.versions[i];
    if (version.versionNumber === latest?.versionNumber) continue;
    if (version.reviewResult !== "pending") return version;
  }
  return null;
}

/** เช็คว่าชิ้นงานนี้มีข้อความแก้ค้างที่ยังไม่ได้ส่งตรวจอยู่หรือไม่ */
export function hasUnsentEdit(caption: Caption): boolean {
  const latest = getLatestSubmittedVersion(caption);
  const latestText = latest?.text ?? "";
  return caption.pendingDraftText.trim() !== latestText.trim();
}
