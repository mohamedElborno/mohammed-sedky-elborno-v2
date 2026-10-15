"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { AdminShell } from "@/components/admin/AdminShell";
import { FormSection } from "@/components/admin/FormSection";
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

type HomePageForm = Omit<Doc<"homePage">, "_id" | "_creationTime">;
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
    doc === undefined ? undefined : (stripSystemFields(doc) as HomePageForm),
    makeDefault,
  );

  if (!form) {
    return <p className="text-muted-foreground py-20 text-center">تحميل...</p>;
  }

  const set = <K extends keyof HomePageForm>(key: K, value: HomePageForm[K]) =>
    setForm({ ...form, [key]: value });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الصفحة الرئيسية</h1>
      <p className="text-muted-foreground text-sm">
        العناوين والأوصاف ونصوص الأزرار ثابتة في ملفات الترجمة، وهنا يُحرَّر
        المحتوى المتغيّر فقط.
      </p>

      <FormSection title="الفيديو المميّز">
        <TextField
          label="رابط فيديو يوتيوب"
          type="url"
          value={form.video}
          onChange={(value) => set("video", value)}
          placeholder="https://www.youtube.com/watch?v=..."
          hint="اتركه فارغاً لإخفاء الفيديو من الصفحة"
        />
        <ImageField
          label="صورة مصغّرة للفيديو"
          value={form.image}
          onChange={(value) => set("image", value)}
        />
      </FormSection>

      <FormSection title="بطاقات الأعمال">
        <RepeatableList<WorksCategoryItem>
          label="البطاقات"
          items={form.worksCategory}
          onChange={(items) => set("worksCategory", items)}
          createItem={() => ({
            icon: null,
            title: emptyLocalized(),
            description: emptyLocalized(),
            workUrl: "",
          })}
          itemLabel={(item, index) => item.title.ar || `بطاقة ${index + 1}`}
          renderItem={(item, update) => (
            <div className="space-y-4">
              <ImageField
                label="الأيقونة"
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
