import Link from "next/link";
import {
  BookOpen,
  Home,
  Images,
  Info,
  PlayCircle,
  UserRound,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/admin/FormSection";

const sections = [
  {
    href: "/admin/home",
    icon: Home,
    title: "الصفحة الرئيسية",
    description: "الفيديو المميّز وصورته وبطاقات الأعمال",
  },
  {
    href: "/admin/about",
    icon: Info,
    title: "عن الشيخ والاقتباس",
    description: "صورة الشيخ ونبذته والاقتباس الذي يظهر في الصفحة الرئيسية",
  },
  {
    href: "/admin/gallery",
    icon: Images,
    title: "ألبوم الصور",
    description: "رفع الصور وترتيبها وكتابة وصف لكل صورة",
  },
  {
    href: "/admin/biography",
    icon: UserRound,
    title: "السيرة الذاتية",
    description: "نص السيرة وبطاقة التعريف والخط الزمني",
  },
  {
    href: "/admin/books",
    icon: BookOpen,
    title: "الكتب",
    description: "إضافة الكتب وتعديل أغلفتها وروابط تحميلها وترتيبها",
  },
  {
    href: "/admin/lessons",
    icon: PlayCircle,
    title: "المقاطع والدروس",
    description: "صفحة المقاطع وقائمة الدروس المرئية",
  },
];

export default function AdminHome() {
  return (
    <AdminShell>
      <div className="space-y-8">
        <PageHeader
          title="إدارة المحتوى"
          description="اختر القسم الذي تريد تعديله. المحتوى المتغيّر يُحرَّر هنا بالعربية والتركية والإنجليزية، أما عناوين الصفحات ونصوص الأزرار فثابتة في ملفات الترجمة."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="group flex gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:border-foreground/40 hover:bg-accent/40"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <span className="space-y-1">
                <span className="block font-bold">{title}</span>
                <span className="block text-sm leading-relaxed text-muted-foreground">
                  {description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
