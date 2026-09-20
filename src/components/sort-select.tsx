"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_LABEL, type SortOrder } from "@/lib/sort-captions";

export function SortSelect({
  value,
  onChange,
}: {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortOrder)}>
      <SelectTrigger>
        <SelectValue>{(v: SortOrder) => SORT_LABEL[v]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">{SORT_LABEL.newest}</SelectItem>
        <SelectItem value="oldest">{SORT_LABEL.oldest}</SelectItem>
      </SelectContent>
    </Select>
  );
}
