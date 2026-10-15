import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";

const sections = [
  {
    href: "/admin/home",
    title: "الصفحة الرئيسية",
    description: "الفيديو المميّز وصورته وبطاقات الأعمال",
  },
  {
    href: "/admin/biography",
    title: "السيرة الذاتية",
    description: "نص السيرة وبطاقة التعريف والخط الزمني",
  },
  {
    href: "/admin/books",
    title: "الكتب",
    description: "إضافة وتعديل الكتب وأغلفتها وروابط التحميل وترتيبها",
  },
  {
    href: "/admin/lessons",
    title: "المقاطع والدروس",
    description: "صفحة المقاطع وقائمة الدروس المرئية",
  },
];

export default function AdminHome() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">إدارة المحتوى</h1>
          <p className="text-muted-foreground">
            المحتوى المتغيّر فقط يُحرَّر هنا بالعربية والتركية، والصور تُرفع
            مباشرة إلى Convex. أما عناوين الصفحات وأوصافها ونصوص الأزرار فهي
            ثابتة في ملفات الترجمة.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="hover:bg-accent/50 rounded-lg border p-4 transition-colors"
            >
              <h2 className="font-semibold">{section.title}</h2>
              <p className="text-muted-foreground text-sm">
                {section.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
