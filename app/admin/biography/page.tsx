"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { AdminShell } from "@/components/admin/AdminShell";
import { FormSection, PageHeader } from "@/components/admin/FormSection";
import { ImageField } from "@/components/admin/ImageField";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { MarkdownField } from "@/components/admin/MarkdownField";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { SaveBar } from "@/components/admin/SaveBar";
import { TextField } from "@/components/admin/TextField";
import {
  stripSystemFields,
  useEditorForm,
} from "@/components/admin/useEditorForm";
import { useSave } from "@/components/admin/useSave";
import { emptyLocalized } from "@/content/localized";

type BiographyForm = Omit<Doc<"biography">, "_id" | "_creationTime">;
type TimelineItem = BiographyForm["timeline"][number];

const makeDefault = (): BiographyForm => ({
  description: emptyLocalized(),
  card: {
    image: null,
    name: emptyLocalized(),
    birthDate: "",
    deathDate: "",
    birthPlace: emptyLocalized(),
    majorEducationalInstitution: emptyLocalized(),
    publishedWorks: [],
  },
  timeline: [],
});

export default function BiographyEditor() {
  return (
    <AdminShell>
      <Editor />
    </AdminShell>
  );
}

function Editor() {
  const doc = useQuery(api.admin.getBiography);
  const books = useQuery(api.admin.listBooks);
  const save = useMutation(api.admin.saveBiography);
  const { state, error, run } = useSave();
  const [form, setForm] = useEditorForm<BiographyForm>(
    doc === undefined ? undefined : (stripSystemFields(doc) as BiographyForm),
    makeDefault,
  );

  if (!form) {
    return <p className="text-muted-foreground py-20 text-center">تحميل...</p>;
  }

  const set = <K extends keyof BiographyForm>(
    key: K,
    value: BiographyForm[K],
  ) => setForm({ ...form, [key]: value });

  const setCard = <K extends keyof BiographyForm["card"]>(
    key: K,
    value: BiographyForm["card"][K],
  ) => setForm({ ...form, card: { ...form.card, [key]: value } });

  const toggleBook = (id: Id<"books">) => {
    const selected = form.card.publishedWorks.includes(id)
      ? form.card.publishedWorks.filter((work) => work !== id)
      : [...form.card.publishedWorks, id];
    setCard("publishedWorks", selected);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="السيرة الذاتية"
        description="عنوان الصفحة والعنوان الفرعي ثابتان في ملفات الترجمة."
      />

      <FormSection title="النصوص">
        <MarkdownField
          label="نص السيرة"
          value={form.description}
          onChange={(value) => set("description", value)}
          rows={16}
        />
      </FormSection>

      <FormSection title="بطاقة التعريف">
        <ImageField
          label="الصورة"
          aspect={5 / 4}
          value={form.card.image}
          onChange={(value) => setCard("image", value)}
        />
        <LocalizedField
          label="الاسم"
          value={form.card.name}
          onChange={(value) => setCard("name", value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="تاريخ الميلاد"
            type="date"
            value={form.card.birthDate}
            onChange={(value) => setCard("birthDate", value)}
          />
          <TextField
            label="تاريخ الوفاة"
            type="date"
            value={form.card.deathDate}
            onChange={(value) => setCard("deathDate", value)}
          />
        </div>
        <LocalizedField
          label="مكان الميلاد"
          value={form.card.birthPlace}
          onChange={(value) => setCard("birthPlace", value)}
        />
        <LocalizedField
          label="أهم مؤسسة تعليمية"
          value={form.card.majorEducationalInstitution}
          onChange={(value) => setCard("majorEducationalInstitution", value)}
        />

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">الأعمال المنشورة</h3>
          {books === undefined && (
            <p className="text-muted-foreground text-sm">تحميل الكتب...</p>
          )}
          {books?.length === 0 && (
            <p className="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
              لا كتب مضافة بعد. أضف الكتب أولاً من صفحة الكتب.
            </p>
          )}
          <div className="space-y-1">
            {books?.map((book) => (
              <label
                key={book._id}
                className="hover:bg-accent/50 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm"
              >
                <input
                  type="checkbox"
                  checked={form.card.publishedWorks.includes(book._id)}
                  onChange={() => toggleBook(book._id)}
                />
                {book.title.ar || book.slug}
              </label>
            ))}
          </div>
        </div>
      </FormSection>

      <FormSection title="الخط الزمني">
        <RepeatableList<TimelineItem>
          label="المحطات"
          noun="محطة"
          items={form.timeline}
          onChange={(items) => set("timeline", items)}
          createItem={() => ({ title: emptyLocalized(), date: "", image: null })}
          itemLabel={(item, index) => item.title.ar || `محطة ${index + 1}`}
          renderItem={(item, update) => (
            <div className="space-y-4">
              <LocalizedField
                label="العنوان"
                value={item.title}
                onChange={(title) => update({ ...item, title })}
              />
              <TextField
                label="التاريخ"
                type="date"
                value={item.date}
                onChange={(date) => update({ ...item, date })}
              />
              <ImageField
                label="صورة الحدث (اختيارية)"
                value={item.image ?? null}
                onChange={(image) => update({ ...item, image })}
              />
              <p className="text-[13px] text-muted-foreground">
                تظهر الصورة خلف الحدث في الخط الزمني بشفافية وأطراف متلاشية.
              </p>
            </div>
          )}
        />
      </FormSection>

      <SaveBar
        state={state}
        error={error}
        onSave={() => run(() => save(form))}
      />
    </div>
  );
}
