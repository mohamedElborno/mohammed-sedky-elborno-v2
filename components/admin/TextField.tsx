"use client";

import { Input } from "@/components/ui/input";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "url" | "date" | "number";
  placeholder?: string;
  hint?: string;
};

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
}: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input
        type={type}
        dir={type === "text" ? undefined : "ltr"}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}
