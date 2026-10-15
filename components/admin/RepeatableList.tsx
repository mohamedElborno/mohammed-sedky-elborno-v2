"use client";

import { ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props<T> = {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  renderItem: (item: T, update: (next: T) => void, index: number) => ReactNode;
  itemLabel?: (item: T, index: number) => string;
};

export function RepeatableList<T>({
  label,
  items,
  onChange,
  createItem,
  renderItem,
  itemLabel,
}: Props<T>) {
  const update = (index: number, next: T) =>
    onChange(items.map((item, position) => (position === index ? next : item)));

  const remove = (index: number) =>
    onChange(items.filter((_, position) => position !== index));

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{label}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, createItem()])}
        >
          <Plus className="h-4 w-4" />
          إضافة
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm">
          لا عناصر بعد
        </p>
      )}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-xs font-medium">
                {itemLabel ? itemLabel(item, index) : `عنصر ${index + 1}`}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  aria-label="تحريك للأعلى"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label="تحريك للأسفل"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  aria-label="حذف"
                >
                  <Trash2 className="text-destructive h-4 w-4" />
                </Button>
              </div>
            </div>

            {renderItem(item, (next) => update(index, next), index)}
          </div>
        ))}
      </div>
    </div>
  );
}
