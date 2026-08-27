import { Link } from "@tanstack/react-router";

const LINKS = [
  { to: "/", label: "إنشاء اختبار", desc: "حوّل أي محتوى إلى أسئلة تدريبية" },
  { to: "/explain", label: "إنشاء شرح", desc: "شرح مبسّط خطوة بخطوة" },
  { to: "/summary", label: "إنشاء ملخص", desc: "ملخصات سريعة قبل الامتحان" },
  { to: "/library", label: "مكتبتي", desc: "كل ما حفظته في مكان واحد" },
] as const;

export function NotFoundPage() {
  return (
    <main
      dir="rtl"
      lang="ar"
      className="flex min-h-screen items-center justify-center bg-background px-4 py-12"
    >
      <div className="w-full max-w-2xl text-center">
        <p className="text-7xl font-black tracking-tight text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          الصفحة غير موجودة
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          يبدو أن الرابط الذي فتحته غير صحيح أو تم نقل الصفحة. يمكنك العودة
          للصفحة السابقة أو الانتقال مباشرة إلى أحد أقسام StudyMate بالأسفل.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            رجوع للصفحة السابقة
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            الذهاب للصفحة الرئيسية
          </Link>
        </div>

        <nav
          aria-label="روابط سريعة"
          className="mt-10 grid gap-3 text-right sm:grid-cols-2"
        >
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
            >
              <span className="block text-sm font-semibold text-foreground">
                {link.label}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {link.desc}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}

export const notFoundMeta = [
  { title: "الصفحة غير موجودة (404) — StudyMate" },
  {
    name: "description",
    content:
      "لم نعثر على الصفحة المطلوبة في StudyMate. ارجع للصفحة السابقة أو تصفّح أقسام إنشاء الاختبارات والشرح والملخصات والمكتبة.",
  },
  { name: "robots", content: "noindex, follow" },
  { property: "og:title", content: "الصفحة غير موجودة (404) — StudyMate" },
  {
    property: "og:description",
    content:
      "لم نعثر على الصفحة المطلوبة في StudyMate. ارجع للصفحة السابقة أو تصفّح أقسام الموقع.",
  },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary_large_image" },
];
