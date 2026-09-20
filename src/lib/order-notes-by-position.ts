/**
 * เรียงโน้ตตามตำแหน่งที่ "ข้อความที่ลากคลุมไว้" ปรากฏในแคปชัน (ไม่ใช่ตามลำดับที่พิมพ์)
 * แล้วให้เลขกำกับ 1, 2, 3, ... ตามลำดับการอ่าน เพื่อให้จุดไฮไลต์ในเนื้อแคปชัน
 * กับคอมเมนต์ในลิสต์ใช้เลขเดียวกัน จับคู่กันได้ทันทีโดยไม่ต้องไล่หา
 * โน้ตรวม (ไม่มี quotedText หรือหาในข้อความไม่เจอ) จะต่อท้ายลิสต์ ไม่มีเลขกำกับ
 */
export interface OrderedNote<T> {
  /** เลขกำกับ (1-based) ตามลำดับที่ปรากฏในข้อความ — ไม่มีถ้าเป็นโน้ตรวม */
  index: number | null;
  original: T;
}

export function orderNotesByPosition<T extends { quotedText: string | null }>(
  text: string,
  notes: T[]
): OrderedNote<T>[] {
  // ปรับให้ตัดขึ้นบรรทัดใหม่แบบเดียวกันหมดก่อนค้นหา (เหตุผลเดียวกับ highlighted-caption-text.tsx)
  const normalizedText = text.replace(/\r\n/g, "\n");
  const withPosition = notes.map((note) => ({
    note,
    pos: note.quotedText
      ? normalizedText.indexOf(note.quotedText.replace(/\r\n/g, "\n"))
      : -1,
  }));

  const pointNotes = withPosition
    .filter((w) => w.pos >= 0)
    .sort((a, b) => a.pos - b.pos);
  const generalNotes = withPosition.filter((w) => w.pos < 0);

  return [
    ...pointNotes.map((w, i) => ({ index: i + 1, original: w.note })),
    ...generalNotes.map((w) => ({ index: null, original: w.note })),
  ];
}
