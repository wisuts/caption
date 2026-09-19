"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export type SignInState = {
  error?: string;
};

export async function signInAction(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "กรุณากรอกอีเมลและรหัสผ่านให้ครบ" };
  }

  const { error } = await auth.signIn.email({ email, password });
  if (error) {
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  redirect("/admin");
}

export async function signOutAction() {
  await auth.signOut();
  redirect("/admin/sign-in");
}
