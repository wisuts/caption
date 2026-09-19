// จัดรูปแบบวันเวลาเป็นภาษาไทย เขตเวลา Asia/Bangkok ตามกฎใน PRD.md หัวข้อ 7
// ตัวอย่างรูปแบบที่ต้องการ: "19 ก.ย. 2569 14:30"

const THAI_MONTHS_ABBR = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
] as const;

const BANGKOK_TZ = "Asia/Bangkok";

function getBangkokParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BANGKOK_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return {
    day: Number(get("day")),
    month: Number(get("month")),
    year: Number(get("year")),
    hour: get("hour") === "24" ? "00" : get("hour"),
    minute: get("minute"),
  };
}

/** "19 ก.ย. 2569 14:30" — วันที่ + เวลา */
export function formatThaiDateTime(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const { day, month, year, hour, minute } = getBangkokParts(date);
  const buddhistYear = year + 543;
  return `${day} ${THAI_MONTHS_ABBR[month - 1]} ${buddhistYear} ${hour}:${minute}`;
}

/** "19 ก.ย. 2569" — วันที่อย่างเดียว ไม่มีเวลา (ใช้กับ "กำหนดลง") */
export function formatThaiDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const { day, month, year } = getBangkokParts(date);
  const buddhistYear = year + 543;
  return `${day} ${THAI_MONTHS_ABBR[month - 1]} ${buddhistYear}`;
}
