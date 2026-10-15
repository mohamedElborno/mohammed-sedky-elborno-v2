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

type LessonsPageForm = Omit<Doc<"lessonsPage">, "_id" | "_creationTime">;
type LessonItem = LessonsPageForm["lessons"][number];

const makeDefault = (): LessonsPageForm => ({
  image: null,
  url: "",
  lessons: [],
});

export default function LessonsEditor() {
  return (
    <AdminShell>
      <Editor />
    </AdminShell>
  );
}

function Editor() {
  const doc = useQuery(api.admin.getLessonsPage);
  const save = useMutation(api.admin.saveLessonsPage);
  const { state, error, run } = useSave();
  const [form, setForm] = useEditorForm<LessonsPageForm>(
    doc === undefined ? undefined : (stripSystemFields(doc) as LessonsPageForm),
    makeDefault,
  );

  if (!form) {
    return <p className="text-muted-foreground py-20 text-center">تحميل...</p>;
  }

  const set = <K extends keyof LessonsPageForm>(
    key: K,
    value: LessonsPageForm[K],
  ) => setForm({ ...form, [key]: value });

  return (
    <div className="space-y-6">
      <PageHeader
        title="المقاطع والدروس"
        description="عنوان الصفحة ووصفها ثابتان في ملفات الترجمة."
      />

      <FormSection title="القناة">
        <ImageField
          label="صورة القناة"
          aspect={21 / 9}
          value={form.image}
          onChange={(value) => set("image", value)}
        />
        <TextField
          label="رابط القناة"
          type="url"
          value={form.url}
          onChange={(value) => set("url", value)}
          placeholder="https://www.youtube.com/@..."
        />
      </FormSection>

      <FormSection title="الدروس">
        <RepeatableList<LessonItem>
          label="قائمة الدروس"
          noun="درس"
          items={form.lessons}
          onChange={(items) => set("lessons", items)}
          createItem={() => ({
            title: emptyLocalized(),
            description: emptyLocalized(),
            image: null,
            url: "",
          })}
          itemLabel={(item, index) => item.title.ar || `درس ${index + 1}`}
          renderItem={(item, update) => (
            <div className="space-y-4">
              <ImageField
                label="الصورة"
                aspect={16 / 9}
                value={item.image}
                onChange={(image) => update({ ...item, image })}
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
                label="الرابط"
                type="url"
                value={item.url}
                onChange={(url) => update({ ...item, url })}
                placeholder="https://www.youtube.com/watch?v=..."
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
