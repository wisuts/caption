/**
 * คัดลอกข้อความลงคลิปบอร์ด — วิธีใหม่ใช้ไม่ได้ในบางกรณี (เบราว์เซอร์ไม่อนุญาต
 * หรือหน้าจอไม่ได้ถูกโฟกัสอยู่) จึงมีวิธีเดิมสำรองไว้ให้ยังก๊อปได้
 */
export async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // ตกมาใช้วิธีเดิม: สร้างช่องข้อความซ่อนไว้ เลือกทั้งหมด แล้วสั่งคัดลอก
  }

  const holder = document.createElement("textarea");
  holder.value = value;
  holder.setAttribute("readonly", "");
  holder.style.position = "fixed";
  holder.style.top = "0";
  holder.style.opacity = "0";
  document.body.appendChild(holder);
  holder.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(holder);
  return ok;
}
