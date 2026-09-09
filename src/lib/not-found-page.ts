const LINKS = [
  { href: "/", label: "إنشاء اختبار", desc: "حوّل أي محتوى إلى أسئلة تدريبية" },
  { href: "/explain", label: "إنشاء شرح", desc: "شرح مبسّط خطوة بخطوة" },
  { href: "/summary", label: "إنشاء ملخص", desc: "ملخصات سريعة قبل الامتحان" },
  { href: "/library", label: "مكتبتي", desc: "كل ما حفظته في مكان واحد" },
];

const cards = LINKS.map(
  (l) => `<a class="card" href="${l.href}">
        <span class="card-title">${l.label}</span>
        <span class="card-desc">${l.desc}</span>
      </a>`,
).join("\n      ");

const HTML = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>الصفحة غير موجودة (404) — Thanawiyah🎯</title>
  <meta name="description" content="لم نعثر على الصفحة المطلوبة في Thanawiyah🎯. ارجع للصفحة السابقة أو تصفّح أقسام إنشاء الاختبارات والشرح والملخصات والمكتبة." />
  <meta name="robots" content="noindex, follow" />
  <meta property="og:title" content="الصفحة غير موجودة (404) — Thanawiyah🎯" />
  <meta property="og:description" content="لم نعثر على الصفحة المطلوبة في Thanawiyah🎯. ارجع للصفحة السابقة أو تصفّح أقسام الموقع." />
  <meta property="og:type" content="website" />
  <style>
    * { box-sizing: border-box; margin: 0; }
    body {
      font-family: "Segoe UI", Tahoma, Arial, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
    }
    main { width: 100%; max-width: 42rem; text-align: center; }
    .code { font-size: 4.5rem; font-weight: 900; color: #60a5fa; letter-spacing: -0.025em; }
    h1 { margin-top: 1rem; font-size: 1.5rem; font-weight: 700; }
    .lead { margin-top: 0.75rem; font-size: 0.875rem; line-height: 1.7; color: #94a3b8; }
    .actions { margin-top: 1.5rem; display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 0.375rem; padding: 0.625rem 1.25rem;
      font-size: 0.875rem; font-weight: 500; text-decoration: none;
      cursor: pointer; transition: background 0.15s; border: 1px solid transparent;
      font-family: inherit;
    }
    .btn-outline { border-color: #334155; background: transparent; color: #e2e8f0; }
    .btn-outline:hover { background: #1e293b; }
    .btn-primary { background: #3b82f6; color: #ffffff; }
    .btn-primary:hover { background: #2563eb; }
    nav { margin-top: 2.5rem; display: grid; gap: 0.75rem; text-align: right; }
    @media (min-width: 640px) { nav { grid-template-columns: 1fr 1fr; } }
    .card {
      display: block; border-radius: 0.5rem; border: 1px solid #334155;
      background: #1e293b; padding: 1rem; text-decoration: none; transition: background 0.15s;
    }
    .card:hover { background: #273449; }
    .card-title { display: block; font-size: 0.875rem; font-weight: 600; color: #e2e8f0; }
    .card-desc { display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #94a3b8; }
  </style>
</head>
<body>
  <main>
    <p class="code">404</p>
    <h1>الصفحة غير موجودة</h1>
    <p class="lead">يبدو أن الرابط الذي فتحته غير صحيح أو تم نقل الصفحة. يمكنك العودة للصفحة السابقة أو الانتقال مباشرة إلى أحد أقسام Thanawiyah🎯 بالأسفل.</p>
    <div class="actions">
      <button type="button" class="btn btn-outline" onclick="history.back()">رجوع للصفحة السابقة</button>
      <a class="btn btn-primary" href="/">الذهاب للصفحة الرئيسية</a>
    </div>
    <nav aria-label="روابط سريعة">
      ${cards}
    </nav>
  </main>
</body>
</html>`;

export function notFoundResponse(): Response {
  return new Response(HTML, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
