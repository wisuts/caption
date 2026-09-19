// ชนิดข้อมูลหลักของระบบคิวตรวจแคปชัน ตาม PRD.md หัวข้อ 6

/** รายชื่อแบรนด์ตายตัว (PRD หัวข้อ 8) */
export const BRANDS = ["FutureSkill", "SkillPass"] as const;
export type Brand = (typeof BRANDS)[number];

/** รายชื่อช่องทางตายตัว (PRD หัวข้อ 8) */
export const CHANNELS = ["Facebook"] as const;
export type Channel = (typeof CHANNELS)[number];

/** ชุดสถานะของชิ้นงาน (PRD หัวข้อ 8): ร่าง → รอตรวจ → ขอแก้ → ผ่าน → ลงแล้ว */
export const CAPTION_STATUSES = [
  "draft",
  "pending_review",
  "changes_requested",
  "approved",
  "published",
] as const;
export type CaptionStatus = (typeof CAPTION_STATUSES)[number];

/** ผลการตรวจของแต่ละเวอร์ชัน */
export type ReviewResult = "pending" | "approved" | "changes_requested";

export interface CaptionVersion {
  /** เลขเวอร์ชัน เริ่มที่ 1 */
  versionNumber: number;
  /** ข้อความแคปชันเต็มตอนที่ส่งตรวจเวอร์ชันนี้ */
  text: string;
  /** วันเวลาที่ส่งตรวจเวอร์ชันนี้ (ISO string) */
  submittedAt: string;
  /** ผลการตรวจของเวอร์ชันนี้ */
  reviewResult: ReviewResult;
  /** คอมเมนต์ของคนตรวจ (มีได้ 1 อันต่อเวอร์ชัน) */
  reviewComment: string | null;
  /** วันเวลาที่ตรวจ (ISO string) — ไม่มีถ้ายังไม่ตรวจ */
  reviewedAt: string | null;
}

export interface Caption {
  id: string;
  /** หัวข้อสั้น ๆ */
  title: string;
  brand: Brand;
  channel: Channel;
  /** กำหนดลง — ไม่บังคับ */
  scheduledDate: string | null;
  authorName: string;
  /** ลิงก์รูปประกอบ — ไม่บังคับ */
  imageUrl: string | null;
  status: CaptionStatus;
  /**
   * ข้อความที่เจ้าของกำลังแก้ค้างอยู่ตอนนี้ ยังไม่ได้ส่งตรวจ
   * ถ้าเท่ากับข้อความเวอร์ชันล่าสุดแปลว่ายังไม่มีการแก้ค้าง
   */
  pendingDraftText: string;
  createdAt: string;
  /** วันเวลาที่มีความเคลื่อนไหวล่าสุด ใช้เรียงลำดับ */
  updatedAt: string;
  /** ทุกเวอร์ชัน เรียงจากเวอร์ชันแรกไปเวอร์ชันล่าสุด */
  versions: CaptionVersion[];
}

export const STATUS_LABEL_TH: Record<CaptionStatus, string> = {
  draft: "ร่าง",
  pending_review: "รอตรวจ",
  changes_requested: "ขอแก้",
  approved: "ผ่าน",
  published: "ลงแล้ว",
};

/** ชิ้นงานที่ "ล็อก" ไม่ให้ตรวจซ้ำ/แก้สถานะได้อีกจนกว่าเจ้าของจะส่งเวอร์ชันใหม่ */
export const REVIEWABLE_STATUS: CaptionStatus = "pending_review";
