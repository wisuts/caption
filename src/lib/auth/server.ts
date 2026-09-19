import { createNeonAuth } from "@neondatabase/auth/next/server";

if (!process.env.NEON_AUTH_BASE_URL) {
  throw new Error("ไม่พบ NEON_AUTH_BASE_URL — ตรวจสอบไฟล์ .env.local");
}
if (!process.env.NEON_AUTH_COOKIE_SECRET) {
  throw new Error("ไม่พบ NEON_AUTH_COOKIE_SECRET — ตรวจสอบไฟล์ .env.local");
}

// จุดเดียวที่ใช้เรียกระบบ login ทั้งหมด (PRD 5 / Neon Auth)
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET,
  },
});
