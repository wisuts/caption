"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setupOwnerAccountAction, type SetupState } from "@/lib/actions/setup";

const EMPTY_STATE: SetupState = {};

export function SetupOwnerForm() {
  const [state, formAction, isPending] = useActionState(
    setupOwnerAccountAction,
    EMPTY_STATE
  );

  return (
    <form
      action={formAction}
      className="flex w-full max-w-sm flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-md"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">ชื่อ (ไม่บังคับ)</Label>
        <Input id="name" name="name" type="text" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">อีเมล</Label>
        <Input id="email" name="email" type="email" required autoFocus />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)</Label>
        <Input id="password" name="password" type="password" required minLength={8} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านอีกครั้ง</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
        />
      </div>
      {state.error && <p className="text-body-sm text-error">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "กำลังสร้างบัญชี..." : "สร้างบัญชีเจ้าของ"}
      </Button>
    </form>
  );
}
