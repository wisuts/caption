/**
 * แปลงลิงก์ที่คนวางมาให้กลายเป็นลิงก์ "รูปจริง" ที่เอามาโชว์ได้
 *
 * ลิงก์ Google Drive ที่ก๊อปมาจากปุ่มแชร์ (.../file/d/xxx/view) เป็นลิงก์ "หน้าเว็บ"
 * ไม่ใช่ตัวไฟล์รูป เอามาแสดงตรง ๆ ไม่ขึ้น ต้องเปลี่ยนเป็นลิงก์รูปของ Drive ก่อน
 * ลิงก์แบบอื่น (เช่นลิงก์รูปตรง ๆ ที่ลงท้าย .jpg) ส่งกลับไปเหมือนเดิม
 */
const DRIVE_FILE_ID = /drive\.google\.com\/file\/d\/([\w-]+)/;
const DRIVE_ID_PARAM = /drive\.google\.com\/.*[?&]id=([\w-]+)/;

export function toPreviewImageUrl(url: string): string {
  const driveId = url.match(DRIVE_FILE_ID)?.[1] ?? url.match(DRIVE_ID_PARAM)?.[1];
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
  }
  return url;
}
