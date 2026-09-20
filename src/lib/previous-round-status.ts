import { orderNotesByPosition } from "@/lib/order-notes-by-position";
import type { ReviewNote } from "@/lib/types";

/**
 * เทียบโน้ตที่หัวหน้าสั่งไว้รอบที่แล้ว กับข้อความเวอร์ชันใหม่ที่เพิ่งส่งมา
 * เพื่อบอกหัวหน้าได้ทันทีว่าข้อไหนแก้แล้ว ข้อไหนยังไม่ได้แตะ ไม่ต้องไล่อ่านเทียบเอง
 *
 * วิธีดู: ถ้าประโยคที่เคยลากคลุมไว้ยังอยู่ในข้อความใหม่แบบเป๊ะ ๆ แปลว่ายังไม่ได้แก้
 * ถ้าหาไม่เจอแล้ว แปลว่าข้อความตรงนั้นถูกแก้ไปแล้ว
 * ส่วนโน้ตรวม (ไม่ได้ชี้ประโยคไหน) ระบบเดาแทนไม่ได้ ต้องให้หัวหน้าดูเอง
 */
export type PreviousNoteStatus = "addressed" | "untouched" | "unknown";

export interface PreviousRoundNote {
  /** เลขกำกับเดิมจากรอบที่แล้ว ให้ตรงกับที่หัวหน้าเคยเห็น */
  number: number | null;
  note: ReviewNote;
  status: PreviousNoteStatus;
}

export function getPreviousRoundNotes(
  previousText: string,
  previousNotes: ReviewNote[],
  currentText: string
): PreviousRoundNote[] {
  const normalizedCurrent = currentText.replace(/\r\n/g, "\n");

  return orderNotesByPosition(previousText, previousNotes).map(
    ({ index, original }) => {
      const quote = original.quotedText?.replace(/\r\n/g, "\n").trim();
      const status: PreviousNoteStatus = !quote
        ? "unknown"
        : normalizedCurrent.includes(quote)
          ? "untouched"
          : "addressed";
      return { number: index, note: original, status };
    }
  );
}
