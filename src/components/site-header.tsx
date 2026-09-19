"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "คิวรอตรวจ" },
  { href: "/archive", label: "คลังงานที่ผ่านแล้ว" },
  { href: "/admin", label: "จัดการแคปชัน (หลังบ้าน)" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface-container-lowest">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-space-md px-gutter-desktop">
        <Link href="/" className="flex flex-col justify-center">
          <span className="text-headline-sm text-on-surface">คิวตรวจแคปชัน</span>
          <span className="text-body-sm text-on-surface-variant leading-none">
            FutureSkill &amp; SkillPass Content Review
          </span>
        </Link>
        <nav className="hidden items-center gap-space-xs rounded-xl bg-surface-container-low p-space-xs md:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-space-md py-1.5 text-label-md font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface",
                  active && "bg-surface-container text-primary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
