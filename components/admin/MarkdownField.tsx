"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Eye,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pencil,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LOCALE_LABELS, type Localized } from "@/content/localized";
import { RichText } from "@/components/BlockStyle";

type Props = {
  label: string;
  value: Localized;
  onChange: (value: Localized) => void;
  rows?: number;
};

const TOOLS = [
  { id: "bold", icon: Bold, title: "عريض" },
  { id: "italic", icon: Italic, title: "مائل" },
  { id: "heading", icon: Heading2, title: "عنوان" },
  { id: "list", icon: List, title: "قائمة" },
  { id: "ordered", icon: ListOrdered, title: "قائمة مرقّمة" },
  { id: "quote", icon: Quote, title: "اقتباس" },
  { id: "link", icon: Link2, title: "رابط" },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

export function MarkdownField({ label, value, onChange, rows = 10 }: Props) {
  const [active, setActive] = useState<keyof Localized>("ar");
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const text = value[active];

  const commit = (next: string, start: number, end: number) => {
    onChange({ ...value, [active]: next });
    // The value is controlled by the parent, so the caret is restored after the
    // re-render instead of right away.
    requestAnimationFrame(() => {
      const node = textareaRef.current;
      if (!node) return;
      node.focus();
      node.setSelectionRange(start, end);
    });
  };

  const wrap = (marker: string, placeholder: string) => {
    const node = textareaRef.current;
    if (!node) return;
    const { selectionStart: start, selectionEnd: end } = node;
    const selected = text.slice(start, end) || placeholder;
    const next =
      text.slice(0, start) + marker + selected + marker + text.slice(end);
    commit(next, start + marker.length, start + marker.length + selected.length);
  };

  const prefixLines = (prefix: string, ordered = false) => {
    const node = textareaRef.current;
    if (!node) return;
    const { selectionStart: start, selectionEnd: end } = node;
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    const lineBreak = text.indexOf("\n", end);
    const lineEnd = lineBreak === -1 ? text.length : lineBreak;
    const block = text.slice(lineStart, lineEnd);
    const prefixed = block
      .split("\n")
      .map((line, index) => {
        const mark = ordered ? `${index + 1}. ` : prefix;
        return line.startsWith(mark) ? line : mark + line;
      })
      .join("\n");
    const next = text.slice(0, lineStart) + prefixed + text.slice(lineEnd);
    commit(next, lineStart, lineStart + prefixed.length);
  };

  const insertLink = () => {
    const node = textareaRef.current;
    if (!node) return;
    const { selectionStart: start, selectionEnd: end } = node;
    const selected = text.slice(start, end) || "نص الرابط";
    const snippet = `[${selected}](https://)`;
    const next = text.slice(0, start) + snippet + text.slice(end);
    // Leave the caret at the end of the url so it can be typed right away.
    const caret = start + snippet.length - 1;
    commit(next, caret, caret);
  };

  const runTool = (id: ToolId) => {
    switch (id) {
      case "bold":
        return wrap("**", "نص عريض");
      case "italic":
        return wrap("*", "نص مائل");
      case "heading":
        return prefixLines("## ");
      case "list":
        return prefixLines("- ");
      case "ordered":
        return prefixLines("1. ", true);
      case "quote":
        return prefixLines("> ");
      case "link":
        return insertLink();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-1 rounded-md border p-0.5">
          {LOCALE_LABELS.map((locale) => (
            <button
              key={locale.id}
              type="button"
              onClick={() => setActive(locale.id)}
              className={cn(
                "rounded px-2 py-0.5 text-xs transition-colors",
                active === locale.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent",
              )}
            >
              {locale.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 rounded-md border p-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            title={tool.title}
            aria-label={tool.title}
            disabled={showPreview}
            onClick={() => runTool(tool.id)}
            className="hover:bg-accent text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors disabled:opacity-40"
          >
            <tool.icon className="h-4 w-4" />
          </button>
        ))}

        <button
          type="button"
          onClick={() => setShowPreview((previous) => !previous)}
          className="hover:bg-accent ms-auto flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors"
        >
          {showPreview ? (
            <>
              <Pencil className="h-3.5 w-3.5" />
              تحرير
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              معاينة
            </>
          )}
        </button>
      </div>

      {showPreview ? (
        <div
          dir={active === "ar" ? "rtl" : "ltr"}
          className="min-h-40 rounded-md border p-4"
        >
          <RichText value={text} />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          dir={active === "ar" ? "rtl" : "ltr"}
          rows={rows}
          value={text}
          onChange={(event) =>
            onChange({ ...value, [active]: event.target.value })
          }
          className="border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 font-mono text-sm shadow-xs outline-none focus-visible:ring-[3px]"
        />
      )}

      <p className="text-muted-foreground text-xs">
        النص يُحفظ بصيغة Markdown ويظهر منسّقاً على الموقع. اضغط معاينة لرؤية
        الشكل النهائي.
      </p>
    </div>
  );
}
