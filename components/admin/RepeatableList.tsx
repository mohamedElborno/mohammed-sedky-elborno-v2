"use client";

import { ReactNode, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props<T> = {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  renderItem: (item: T, update: (next: T) => void, index: number) => ReactNode;
  itemLabel?: (item: T, index: number) => string;
  /** Wording for the add button and the delete confirmation. */
  noun?: string;
};

// A compact list: every item is one row, and only the row being edited is
// open. That keeps long lists (books, timeline, lessons) easy to scan.
export function RepeatableList<T>({
  label,
  items,
  onChange,
  createItem,
  renderItem,
  itemLabel,
  noun = "عنصر",
}: Props<T>) {
  const [open, setOpen] = useState<number | null>(null);

  const update = (index: number, next: T) =>
    onChange(items.map((item, position) => (position === index ? next : item)));

  const add = () => {
    onChange([...items, createItem()]);
    setOpen(items.length);
  };

  const remove = (index: number) => {
    if (!confirm(`حذف هذا ${noun}؟`)) return;
    onChange(items.filter((_, position) => position !== index));
    setOpen(null);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    setOpen(target);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">
          {label}
          <span className="ms-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {items.length}
          </span>
        </h3>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="size-4" />
          إضافة {noun}
        </Button>
      </div>

      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-input p-6 text-center text-sm text-muted-foreground">
          لا شيء بعد. اضغط «إضافة {noun}» للبدء.
        </p>
      )}

      <ul className="space-y-2">
        {items.map((item, index) => {
          const isOpen = open === index;
          const title = itemLabel?.(item, index) || `${noun} ${index + 1}`;
          return (
            <li
              key={index}
              className={cn(
                "overflow-hidden rounded-xl border bg-card transition-shadow",
                isOpen && "border-foreground/40 shadow-sm",
              )}
            >
              <div className="flex items-center gap-1 pe-2">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-accent/60"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="truncate text-[15px] font-medium">
                    {title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "ms-auto size-4 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  aria-label="تحريك للأعلى"
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label="تحريك للأسفل"
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  aria-label="حذف"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>

              {isOpen && (
                <div className="space-y-5 border-t bg-muted/30 p-4 md:p-5">
                  {renderItem(item, (next) => update(index, next), index)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
