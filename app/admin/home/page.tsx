"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { AdminShell } from "@/components/admin/AdminShell";
import { FormSection, PageHeader } from "@/components/admin/FormSection";
import { ImageField } from "@/components/admin/ImageField";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { SaveBar } from "@/components/admin/SaveBar";
import { TextField } from "@/components/admin/TextField";
import {
  stripSystemFields,
  useEditorForm,
} from "@/components/admin/useEditorForm";
import { useSave } from "@/components/admin/useSave";
import { emptyLocalized } from "@/content/localized";

// The "about the Sheikh" block has its own page, so it is not part of this form.
type HomePageForm = Omit<Doc<"homePage">, "_id" | "_creationTime" | "about">;
type WorksCategoryItem = HomePageForm["worksCategory"][number];

const makeDefault = (): HomePageForm => ({
  video: "",
  image: null,
  worksCategory: [],
});

export default function HomePageEditor() {
  return (
    <AdminShell>
      <Editor />
    </AdminShell>
  );
}

function Editor() {
  const doc = useQuery(api.admin.getHomePage);
  const save = useMutation(api.admin.saveHomePage);
  const { state, error, run } = useSave();
  const [form, setForm] = useEditorForm<HomePageForm>(
    doc === undefined
      ? undefined
      : ({ ...makeDefault(), ...stripSystemFields(doc) } as HomePageForm),
    makeDefault,
  );

  if (!form) {
    return <p className="py-20 text-center text-muted-foreground">تحميل...</p>;
  }

  const set = <K extends keyof HomePageForm>(key: K, value: HomePageForm[K]) =>
    setForm({ ...form, [key]: value });

  // `about` is edited elsewhere, and is left untouched when it is not sent.
  const payload: HomePageForm = {
    video: form.video,
    image: form.image,
    worksCategory: form.worksCategory,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="الصفحة الرئيسية"
        description="الفيديو المميّز وبطاقات الأعمال. أما اقتباس الشيخ ونبذته فمن صفحة «عن الشيخ والاقتباس»."
      />

      <FormSection title="الفيديو المميّز">
        <TextField
          label="رابط فيديو يوتيوب"
          type="url"
          value={form.video}
          onChange={(value) => set("video", value)}
          placeholder="https://www.youtube.com/watch?v=..."
          hint="اتركه فارغاً لإخفاء الفيديو من الصفحة."
        />
        <ImageField
          label="صورة مصغّرة للفيديو"
          aspect={16 / 9}
          value={form.image}
          onChange={(value) => set("image", value)}
        />
      </FormSection>

      <FormSection
        title="بطاقات الأعمال"
        description="الصفوف التي تظهر تحت عنوان «تصفح الأعمال». كل صف يُفتح بالنقر عليه لتعديله."
      >
        <RepeatableList<WorksCategoryItem>
          label="البطاقات"
          noun="بطاقة"
          items={form.worksCategory}
          onChange={(items) => set("worksCategory", items)}
          createItem={() => ({
            icon: null,
            title: emptyLocalized(),
            description: emptyLocalized(),
            workUrl: "",
          })}
          itemLabel={(item) => item.title.ar}
          renderItem={(item, update) => (
            <>
              <ImageField
                label="الأيقونة"
                aspect={1}
                value={item.icon}
                onChange={(icon) => update({ ...item, icon })}
              />
              <LocalizedField
                label="العنوان"
                value={item.title}
                onChange={(title) => update({ ...item, title })}
              />
              <LocalizedField
                label="الوصف"
                value={item.description}
                onChange={(description) => update({ ...item, description })}
                multiline
                rows={3}
              />
              <TextField
                label="المسار داخل الموقع"
                value={item.workUrl}
                onChange={(workUrl) => update({ ...item, workUrl })}
                placeholder="books"
                hint="يُضاف بعد اللغة، مثال: books يعني /ar/books"
              />
            </>
          )}
        />
      </FormSection>

      <SaveBar
        state={state}
        error={error}
        onSave={() => run(() => save(payload))}
      />
    </div>
  );
}
