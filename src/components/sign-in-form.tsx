"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction, type SignInState } from "@/lib/actions/auth";

const EMPTY_STATE: SignInState = {};

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    EMPTY_STATE
  );

  return (
    <form
      action={formAction}
      className="flex w-full max-w-sm flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-md"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">อีเมล</Label>
        <Input id="email" name="email" type="email" required autoFocus />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">รหัสผ่าน</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {state.error && <p className="text-body-sm text-error">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </Button>
    </form>
  );
}
