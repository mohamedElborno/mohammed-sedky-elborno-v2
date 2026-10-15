"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
  Unlink,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LOCALE_LABELS, type Localized } from "@/content/localized";

type Props = {
  label: string;
  value: Localized;
  onChange: (value: Localized) => void;
  /** Kept for compatibility; the editor grows with its text. */
  rows?: number;
};

type MarkdownStorage = { markdown: { getMarkdown: () => string } };

// A visual editor: text is typed and formatted directly (bold, headings,
// lists, links) and is stored as Markdown, which is what the site renders.
export function MarkdownField({ label, value, onChange }: Props) {
  const [active, setActive] = useState<keyof Localized>("ar");
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const activeRef = useRef(active);

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
    activeRef.current = active;
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      Markdown.configure({
        html: false,
        bulletListMarker: "-",
        tightLists: true,
        linkify: false,
        breaks: false,
        transformPastedText: true,
      }),
    ],
    content: value[active],
    editorProps: {
      attributes: { "aria-label": label },
    },
    onUpdate: ({ editor: current }) => {
      const markdown = (
        current.storage as unknown as MarkdownStorage
      ).markdown.getMarkdown();
      onChangeRef.current({
        ...valueRef.current,
        [activeRef.current]: markdown,
      });
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive("bold") ?? false,
      italic: current?.isActive("italic") ?? false,
      h2: current?.isActive("heading", { level: 2 }) ?? false,
      h3: current?.isActive("heading", { level: 3 }) ?? false,
      bullet: current?.isActive("bulletList") ?? false,
      ordered: current?.isActive("orderedList") ?? false,
      quote: current?.isActive("blockquote") ?? false,
      link: current?.isActive("link") ?? false,
      canUndo: current?.can().undo() ?? false,
      canRedo: current?.can().redo() ?? false,
    }),
  });

  // Switching language swaps the text shown, without counting as an edit.
  const switchLanguage = (next: keyof Localized) => {
    setActive(next);
    editor?.commands.setContent(valueRef.current[next], { emitUpdate: false });
    editor?.commands.focus("end");
  };

  const toggleLink = () => {
    if (!editor) return;
    if (state?.link) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const url = window.prompt("أدخل الرابط (https://...)");
    if (!url) return;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  const tools: {
    id: string;
    title: string;
    icon: LucideIcon;
    active: boolean;
    disabled?: boolean;
    run: () => void;
  }[] = editor
    ? [
        {
          id: "h2",
          title: "عنوان كبير",
          icon: Heading2,
          active: state?.h2 ?? false,
          run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          id: "h3",
          title: "عنوان فرعي",
          icon: Heading3,
          active: state?.h3 ?? false,
          run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
        {
          id: "bold",
          title: "عريض",
          icon: Bold,
          active: state?.bold ?? false,
          run: () => editor.chain().focus().toggleBold().run(),
        },
        {
          id: "italic",
          title: "مائل",
          icon: Italic,
          active: state?.italic ?? false,
          run: () => editor.chain().focus().toggleItalic().run(),
        },
        {
          id: "bullet",
          title: "قائمة نقطية",
          icon: List,
          active: state?.bullet ?? false,
          run: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
          id: "ordered",
          title: "قائمة مرقّمة",
          icon: ListOrdered,
          active: state?.ordered ?? false,
          run: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
          id: "quote",
          title: "اقتباس",
          icon: Quote,
          active: state?.quote ?? false,
          run: () => editor.chain().focus().toggleBlockquote().run(),
        },
        {
          id: "link",
          title: state?.link ? "إزالة الرابط" : "إضافة رابط",
          icon: state?.link ? Unlink : Link2,
          active: state?.link ?? false,
          run: toggleLink,
        },
        {
          id: "undo",
          title: "تراجع",
          icon: Undo2,
          active: false,
          disabled: !state?.canUndo,
          run: () => editor.chain().focus().undo().run(),
        },
        {
          id: "redo",
          title: "إعادة",
          icon: Redo2,
          active: false,
          disabled: !state?.canRedo,
          run: () => editor.chain().focus().redo().run(),
        },
      ]
    : [];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
        <div
          role="tablist"
          aria-label={label}
          className="flex items-center gap-0.5 rounded-lg bg-muted p-1"
        >
          {LOCALE_LABELS.map((locale) => {
            const filled = Boolean(value[locale.id]);
            return (
              <button
                key={locale.id}
                type="button"
                role="tab"
                aria-selected={active === locale.id}
                onClick={() => switchLanguage(locale.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  active === locale.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {locale.label}
                <span
                  aria-label={filled ? "مكتوب" : "فارغ"}
                  className={cn(
                    "size-1.5 rounded-full",
                    filled ? "bg-emerald-600" : "bg-amber-500",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-input bg-white shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30">
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b bg-muted/60 p-1.5">
          {tools.map((tool, index) => (
            <span key={tool.id} className="contents">
              {(index === 2 || index === 4 || index === 8) && (
                <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
              )}
              <button
                type="button"
                title={tool.title}
                aria-label={tool.title}
                aria-pressed={tool.active}
                disabled={tool.disabled}
                // Keep the text selection while a tool is used.
                onMouseDown={(event) => event.preventDefault()}
                onClick={tool.run}
                className={cn(
                  "rounded-lg p-2 transition-colors disabled:opacity-35",
                  tool.active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/80 hover:bg-accent",
                )}
              >
                <tool.icon className="size-[18px]" />
              </button>
            </span>
          ))}
        </div>

        <div className="rich-editor" dir={active === "ar" ? "rtl" : "ltr"}>
          <EditorContent editor={editor} />
        </div>
      </div>

      <p className="text-[13px] text-muted-foreground">
        اكتب النص مباشرة وحدّد ما تريد تنسيقه ثم اختر الأداة من الشريط. يظهر
        النص في الموقع بهذا الشكل نفسه.
      </p>
    </div>
  );
}
