"use client";

import { useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * ช่องหัวข้อสั้นที่เติมชื่อให้จากชื่อที่เคยตั้งไว้ (PRD 5.2)
 *
 * งานชุดเดียวกันมักใช้ชื่อแคมเปญเดิมแล้วต่างแค่วงเล็บท้าย เช่น
 * "October theory (AI)" / "(DATA)" / "(Business Leader)"
 * พิมพ์ไม่กี่ตัวแล้วเลือกชื่อเก่ามาเติม จะได้แก้แค่ท้ายชื่อ
 */
export function TitleField({
  defaultValue,
  recentTitles,
  invalid,
}: {
  defaultValue: string;
  recentTitles: string[];
  invalid?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return recentTitles.slice(0, 8);
    return recentTitles
      .filter((t) => t.toLowerCase().includes(q) && t.toLowerCase() !== q)
      .slice(0, 8);
  }, [value, recentTitles]);

  function choose(title: string) {
    setValue(title);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(matches[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <Input
        id="title"
        name="title"
        autoComplete="off"
        placeholder="เช่น October theory (AI)"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setHighlight(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        // รอแป๊บก่อนปิด ไม่งั้นกดเลือกในรายการไม่ทันเพราะช่องเสียโฟกัสก่อน
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 150);
        }}
        aria-invalid={invalid}
      />

      {open && matches.length > 0 && (
        <ul
          className="absolute z-20 mt-1 flex max-h-64 w-full flex-col overflow-y-auto rounded-lg border border-surface-container-high bg-surface-container-lowest py-1 shadow-md"
          onMouseDown={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
          }}
        >
          <li className="px-space-sm py-1 text-label-sm text-on-surface-variant">
            ชื่อที่เคยตั้งไว้ — กดเพื่อเติม แล้วแก้ท้ายชื่อได้
          </li>
          {matches.map((title, i) => (
            <li key={title}>
              <button
                type="button"
                onClick={() => choose(title)}
                onMouseEnter={() => setHighlight(i)}
                className={`w-full px-space-sm py-1.5 text-left text-body-sm text-on-surface ${
                  i === highlight ? "bg-surface-container-high" : ""
                }`}
              >
                {title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
