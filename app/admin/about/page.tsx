"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { AdminShell } from "@/components/admin/AdminShell";
import { FormSection, PageHeader } from "@/components/admin/FormSection";
import { ImageField } from "@/components/admin/ImageField";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { SaveBar } from "@/components/admin/SaveBar";
import { useEditorForm } from "@/components/admin/useEditorForm";
import { useSave } from "@/components/admin/useSave";
import { emptyLocalized } from "@/content/localized";

type AboutForm = NonNullable<Doc<"homePage">["about"]>;

const makeDefault = (): AboutForm => ({
  image: null,
  description: emptyLocalized(),
  quote: {
    text: emptyLocalized(),
    author: emptyLocalized(),
    source: emptyLocalized(),
  },
});

export default function AboutEditor() {
  return (
    <AdminShell>
      <Editor />
    </AdminShell>
  );
}

function Editor() {
  const doc = useQuery(api.admin.getHomePage);
  const save = useMutation(api.admin.saveAbout);
  const { state, error, run } = useSave();
  // `doc` is null until the home page has been saved once.
  const [form, setForm] = useEditorForm<AboutForm>(
    doc === undefined ? undefined : (doc?.about ?? makeDefault()),
    makeDefault,
  );

  if (!form) {
    return <p className="py-20 text-center text-muted-foreground">تحميل...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="عن الشيخ والاقتباس"
        description="هذا ما يظهر في قسم «عن الشيخ» بالصفحة الرئيسية. كل الحقول اختيارية: إن تركت الاقتباس فارغاً يختفي من الصفحة، وإن تركت النبذة فارغة يظهر النص الافتراضي."
      />

      <FormSection title="الاقتباس">
        <LocalizedField
          label="نص الاقتباس"
          value={form.quote.text}
          onChange={(text) =>
            setForm({ ...form, quote: { ...form.quote, text } })
          }
          multiline
          rows={4}
          hint="اكتب الاقتباس بكل لغة. اتركه فارغاً لإخفائه."
        />
        <LocalizedField
          label="قائل الاقتباس"
          value={form.quote.author}
          onChange={(author) =>
            setForm({ ...form, quote: { ...form.quote, author } })
          }
          hint="إن تُرك فارغاً يظهر اسم الشيخ."
        />
        <LocalizedField
          label="مصدر الاقتباس"
          value={form.quote.source}
          onChange={(source) =>
            setForm({ ...form, quote: { ...form.quote, source } })
          }
          hint="مثل اسم كتاب أو درس. اختياري."
        />
      </FormSection>

      <FormSection title="نبذة عن الشيخ">
        <ImageField
          label="صورة الشيخ"
          aspect={4 / 5}
          value={form.image}
          onChange={(image) => setForm({ ...form, image })}
        />
        <LocalizedField
          label="النبذة"
          value={form.description}
          onChange={(description) => setForm({ ...form, description })}
          multiline
          rows={5}
        />
      </FormSection>

      <SaveBar
        state={state}
        error={error}
        onSave={() => run(() => save({ about: form }))}
      />
    </div>
  );
}
