import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// รายชื่อแบรนด์และช่องทางตายตัว (PRD หัวข้อ 8) — เก็บเป็น enum ในโค้ด
// ไม่ใช่ตารางแยก เพราะยังไม่มีความจำเป็นต้องแก้ผ่านหน้าเว็บ
export const channelEnum = pgEnum("channel", ["Facebook"]);

// ชุดสถานะของชิ้นงาน (PRD หัวข้อ 8): ร่าง → รอตรวจ → ขอแก้ → ผ่าน → ลงแล้ว
export const captionStatusEnum = pgEnum("caption_status", [
  "draft",
  "pending_review",
  "changes_requested",
  "approved",
  "published",
]);

// ผลการตรวจของแต่ละเวอร์ชัน
export const reviewResultEnum = pgEnum("review_result", [
  "pending",
  "approved",
  "changes_requested",
]);

/**
 * ตาราง captions — 1 แถวต่อแคปชัน 1 ชิ้น (PRD หัวข้อ 6)
 */
export const captions = pgTable("captions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  // เลือกได้หลายแบรนด์ เก็บเป็นข้อความคั่นด้วยการขึ้นบรรทัดใหม่ (แบบเดียวกับลิงก์รูป)
  // รายชื่อแบรนด์ที่เลือกได้คุมด้วย BRANDS ในโค้ด ไม่ต้องแก้ฐานข้อมูลเวลาเพิ่มแบรนด์
  brand: text("brand").notNull().default(""),
  channel: channelEnum("channel").notNull(),
  scheduledDate: date("scheduled_date"),
  authorName: text("author_name").notNull().default(""),
  imageUrl: text("image_url"),
  status: captionStatusEnum("status").notNull().default("draft"),
  // ข้อความที่เจ้าของกำลังแก้ค้างอยู่ตอนนี้ ยังไม่ได้ส่งตรวจ
  pendingDraftText: text("pending_draft_text").notNull().default(""),
  // ซ่อนออกจากทุกหน้าเมื่อกด "ลบ" (soft delete ตาม PRD กฎข้อ 7) — ไม่เก็บวันที่ลบ
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * ตาราง caption_versions — 1 แถวต่อเวอร์ชัน (PRD หัวข้อ 6)
 * แคปชัน 1 ชิ้นมีได้หลายเวอร์ชัน ข้อความเก่าไม่เคยถูกทับ
 */
export const captionVersions = pgTable("caption_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  captionId: uuid("caption_id")
    .notNull()
    .references(() => captions.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  text: text("text").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  reviewResult: reviewResultEnum("review_result").notNull().default("pending"),
  // ไม่เก็บชื่อคนตรวจ ตาม PRD หัวข้อ 6
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

/**
 * ตาราง review_notes — โน้ตของหัวหน้าตอนตรวจ ผูกกับเวอร์ชันหนึ่ง ๆ ได้หลายอัน
 * แต่ละอันชี้เฉพาะจุด (มี quotedText = ข้อความที่ลากคลุมไว้) หรือเป็นโน้ตรวม
 * (quotedText เป็นค่าว่าง) ก็ได้
 */
export const reviewNotes = pgTable("review_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  versionId: uuid("version_id")
    .notNull()
    .references(() => captionVersions.id, { onDelete: "cascade" }),
  // ข้อความที่หัวหน้าลากคลุมไว้ในแคปชัน — ว่างได้ถ้าเป็นโน้ตรวม ไม่ชี้เฉพาะจุด
  quotedText: text("quoted_text"),
  note: text("note").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const captionsRelations = relations(captions, ({ many }) => ({
  versions: many(captionVersions),
}));

export const captionVersionsRelations = relations(
  captionVersions,
  ({ one, many }) => ({
    caption: one(captions, {
      fields: [captionVersions.captionId],
      references: [captions.id],
    }),
    notes: many(reviewNotes),
  })
);

export const reviewNotesRelations = relations(reviewNotes, ({ one }) => ({
  version: one(captionVersions, {
    fields: [reviewNotes.versionId],
    references: [captionVersions.id],
  }),
}));
