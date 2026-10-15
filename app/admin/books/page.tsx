"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Plus, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { FormSection } from "@/components/admin/FormSection";
import { ImageField } from "@/components/admin/ImageField";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { SaveBar } from "@/components/admin/SaveBar";
import { TextField } from "@/components/admin/TextField";
import { useSave } from "@/components/admin/useSave";
import { Button } from "@/components/ui/button";
import { emptyLocalized } from "@/content/localized";

type BookForm = Omit<Doc<"books">, "_id" | "_creationTime">;

const makeDefault = (order: number): BookForm => ({
  title: emptyLocalized(),
  description: emptyLocalized(),
  url: "",
  slug: "",
  order,
  coverImage: null,
  date: "",
});

export default function BooksEditor() {
  return (
    <AdminShell>
      <Editor />
    </AdminShell>
  );
}

function Editor() {
  const books = useQuery(api.admin.listBooks);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Id<"books"> | null>(null);

  if (books === undefined) {
    return <p className="text-muted-foreground py-20 text-center">تحميل...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">الكتب</h1>
        <Button onClick={() => setCreating(true)} disabled={creating}>
          <Plus className="h-4 w-4" />
          كتاب جديد
        </Button>
      </div>

      {creating && (
        <NewBook
          nextOrder={books.length}
          onDone={() => setCreating(false)}
        />
      )}

      {books.length === 0 && !creating && (
        <p className="text-muted-foreground rounded-md border border-dashed p-6 text-center">
          لا كتب بعد. اضغط &laquo;كتاب جديد&raquo; للبدء.
        </p>
      )}

      <div className="space-y-3">
        {books.map((book) => (
          <div key={book._id} className="rounded-lg border">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{book.title.ar || book.slug}</p>
                <p className="text-muted-foreground text-xs">
                  ترتيب {book.order} • {book.slug}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setEditing(editing === book._id ? null : book._id)
                }
              >
                {editing === book._id ? "إغلاق" : "تعديل"}
              </Button>
            </div>

            {editing === book._id && (
              <div className="border-t p-4">
                <ExistingBook book={book} onDone={() => setEditing(null)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NewBook({
  nextOrder,
  onDone,
}: {
  nextOrder: number;
  onDone: () => void;
}) {
  const create = useMutation(api.admin.createBook);
  const [form, setForm] = useState<BookForm>(() => makeDefault(nextOrder));
  const { state, error, run } = useSave();

  return (
    <FormSection title="كتاب جديد">
      <BookFields form={form} setForm={setForm} />
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onDone}>
          إلغاء
        </Button>
      </div>
      <SaveBar
        state={state}
        error={error}
        onSave={() =>
          run(async () => {
            await create(form);
            onDone();
          })
        }
      />
    </FormSection>
  );
}

function ExistingBook({
  book,
  onDone,
}: {
  book: Doc<"books">;
  onDone: () => void;
}) {
  const update = useMutation(api.admin.updateBook);
  const remove = useMutation(api.admin.deleteBook);
  const { state, error, run } = useSave();
  const [form, setForm] = useState<BookForm>(() => {
    const { _id, _creationTime, ...rest } = book;
    void _id;
    void _creationTime;
    return rest;
  });

  return (
    <div className="space-y-4">
      <BookFields form={form} setForm={setForm} />

      <Button
        variant="ghost"
        onClick={() => {
          if (!confirm("سيُحذف الكتاب وغلافه نهائياً. متابعة؟")) return;
          void run(async () => {
            await remove({ id: book._id });
            onDone();
          });
        }}
      >
        <Trash2 className="text-destructive h-4 w-4" />
        حذف الكتاب
      </Button>

      <SaveBar
        state={state}
        error={error}
        onSave={() => run(() => update({ id: book._id, ...form }))}
      />
    </div>
  );
}

function BookFields({
  form,
  setForm,
}: {
  form: BookForm;
  setForm: (form: BookForm) => void;
}) {
  const set = <K extends keyof BookForm>(key: K, value: BookForm[K]) =>
    setForm({ ...form, [key]: value });

  return (
    <div className="space-y-4">
      <ImageField
        label="غلاف الكتاب"
        value={form.coverImage}
        onChange={(value) => set("coverImage", value)}
      />
      <LocalizedField
        label="عنوان الكتاب"
        value={form.title}
        onChange={(value) => set("title", value)}
      />
      <LocalizedField
        label="وصف الكتاب"
        value={form.description}
        onChange={(value) => set("description", value)}
        multiline
      />
      <TextField
        label="رابط التحميل (PDF)"
        type="url"
        value={form.url}
        onChange={(value) => set("url", value)}
        hint="اتركه فارغاً إذا لم تتوفّر نسخة PDF"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="المُعرّف (slug)"
          value={form.slug}
          onChange={(value) => set("slug", value)}
          placeholder="mawsuat-alqawaid"
          hint="حروف إنجليزية وشرطات، ويجب أن يكون فريداً"
        />
        <TextField
          label="الترتيب"
          type="number"
          value={String(form.order)}
          onChange={(value) => set("order", Number(value) || 0)}
          hint="الأصغر يظهر أولاً"
        />
      </div>
      <TextField
        label="تاريخ النشر"
        type="date"
        value={form.date}
        onChange={(value) => set("date", value)}
      />
    </div>
  );
}
