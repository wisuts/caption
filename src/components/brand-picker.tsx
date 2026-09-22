"use client";

import { useState } from "react";
import { joinBrands } from "@/lib/brands";
import { BRANDS, type Brand } from "@/lib/types";

/**
 * เลือกแบรนด์ได้หลายอันด้วยการติ๊ก (PRD 5.2)
 * รวมค่าที่ติ๊กไว้เป็นข้อความก้อนเดียวคั่นบรรทัด ส่งไปกับฟอร์มในช่องเดิมชื่อ brand
 */
export function BrandPicker({
  name,
  defaultValue,
  invalid,
}: {
  name: string;
  defaultValue: Brand[];
  invalid?: boolean;
}) {
  const [selected, setSelected] = useState<Brand[]>(defaultValue);

  function toggle(brand: Brand) {
    setSelected((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }

  return (
    <div className="flex flex-col gap-space-xs">
      <input type="hidden" name={name} value={joinBrands(selected)} readOnly />
      <div
        className={`flex flex-wrap gap-space-xs rounded-lg border p-space-sm ${
          invalid ? "border-destructive" : "border-input"
        }`}
      >
        {BRANDS.map((brand) => {
          const isOn = selected.includes(brand);
          return (
            <label
              key={brand}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-space-sm py-1.5 text-label-md font-medium transition-colors ${
                isOn
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <input
                type="checkbox"
                checked={isOn}
                onChange={() => toggle(brand)}
                className="size-3.5 accent-on-primary"
              />
              {brand}
            </label>
          );
        })}
      </div>
      <p className="text-label-sm text-on-surface-variant">
        ติ๊กได้มากกว่า 1 อัน — เลือกอย่างน้อย 1 อันก่อนส่งตรวจ
      </p>
    </div>
  );
}
