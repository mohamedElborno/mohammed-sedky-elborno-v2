"use client";

import { useId } from "react";
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
  const id = useId();
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      <Input
        id={id}
        type={type}
        dir={type === "text" ? undefined : "ltr"}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && <p className="text-[13px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
