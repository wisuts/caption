"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export type SetupState = {
  error?: string;
};

// ใช้ครั้งเดียวตอนสร้างบัญชีเจ้าของคนแรก — ไฟล์นี้และหน้า /admin/setup
// จะถูกลบทิ้งทันทีหลังสร้างบัญชีสำเร็จ (PRD: ไม่มีหน้าสมัครสมาชิกในเว็บถาวร)
export async function setupOwnerAccountAction(
  _prevState: SetupState,
  formData: FormData
): Promise<SetupState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !password) {
    return { error: "กรุณากรอกอีเมลและรหัสผ่านให้ครบ" };
  }
  if (password.length < 8) {
    return { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };
  }
  if (password !== confirmPassword) {
    return { error: "รหัสผ่านทั้งสองช่องไม่ตรงกัน" };
  }

  const { error } = await auth.signUp.email({
    email,
    password,
    name: name || email,
  });

  if (error) {
    return { error: `สร้างบัญชีไม่สำเร็จ: ${error.message}` };
  }

  redirect("/admin");
}
