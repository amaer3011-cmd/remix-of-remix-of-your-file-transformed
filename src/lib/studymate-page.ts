import studymateHtml from "../studymate.html?raw";

const ROUTER_SCRIPT = `
<script>
(function () {
  var NAV = {
    "/": "navCreate",
    "/explain": "navCreateExplain",
    "/summary": "navCreateSummary",
    "/library": "navLibrary",
  };
  var PATH_BY_NAV = {
    navCreate: "/",
    navCreateExplain: "/explain",
    navCreateSummary: "/summary",
    navLibrary: "/library",
  };

  function normalize(p) {
    if (!p) return "/";
    p = p.replace(/\\/+$/, "");
    return p === "" ? "/" : p;
  }

  function applyPath(path, viaPush) {
    var id = NAV[normalize(path)];
    if (!id) return;
    var btn = document.getElementById(id);
    if (btn) btn.click();
    if (viaPush) window.scrollTo({ top: 0 });
  }

  function syncUrl(navId) {
    var path = PATH_BY_NAV[navId];
    if (!path) return;
    if (normalize(location.pathname) !== path) {
      history.pushState({ smNav: navId }, "", path);
    }
  }

  function init() {
    Object.keys(PATH_BY_NAV).forEach(function (navId) {
      var btn = document.getElementById(navId);
      if (btn) btn.addEventListener("click", function () { syncUrl(navId); });
    });
    applyPath(location.pathname, false);
    window.addEventListener("popstate", function () {
      applyPath(location.pathname, true);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
</script>
`;

const closeIdx = studymateHtml.lastIndexOf("</body>");
const baseHtml =
  closeIdx === -1
    ? studymateHtml + ROUTER_SCRIPT
    : studymateHtml.slice(0, closeIdx) +
      ROUTER_SCRIPT +
      studymateHtml.slice(closeIdx);

export interface PageSeo {
  path: string;
  title: string;
  description: string;
}

export const PAGES: PageSeo[] = [
  {
    path: "/",
    title: "Thanawiyah🎯 — إنشاء اختبارات تفاعلية بالذكاء الاصطناعي",
    description:
      "حوّل ملازمك ونصوصك إلى اختبارات تفاعلية فورية بالذكاء الاصطناعي، مع تحكم في الصعوبة وعدد الأسئلة ونتائج مفصّلة.",
  },
  {
    path: "/explain",
    title: "إنشاء شرح تفاعلي للدروس | Thanawiyah🎯",
    description:
      "أنشئ ملزمة شرح تفاعلية منسّقة من أي نص أو ملف، بصفحات ووضع تركيز وتعديل ذكي بالذكاء الاصطناعي.",
  },
  {
    path: "/summary",
    title: "إنشاء ملخصات دراسية سريعة | Thanawiyah🎯",
    description:
      "لخّص محاضراتك وملفاتك في نقاط واضحة ومنظمة خلال ثوانٍ، وجهّزها للمراجعة قبل الامتحان.",
  },
  {
    path: "/library",
    title: "مكتبتي — اختباراتي وملخصاتي المحفوظة | Thanawiyah🎯",
    description:
      "ارجع لكل الاختبارات وملازم الشرح والملخصات المحفوظة في مكتبتك، وتابع نتائجك ومراجعاتك.",
  },
];

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHead(page: PageSeo) {
  const t = escapeAttr(page.title);
  const d = escapeAttr(page.description);
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Thanawiyah🎯",
    url: page.path,
    applicationCategory: "EducationalApplication",
    inLanguage: "ar",
    description: page.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  });

  return `
<meta name="description" content="${d}">
<link rel="canonical" href="${escapeAttr(page.path)}">
<meta property="og:site_name" content="Thanawiyah🎯">
<meta property="og:locale" content="ar_AR">
<meta property="og:type" content="website">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:url" content="${escapeAttr(page.path)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<script type="application/ld+json">${jsonLd}</script>
`;
}

const pageHtml = new Map<string, string>(
  PAGES.map((page) => {
    let html = baseHtml.replace(
      /<title>[\s\S]*?<\/title>/i,
      `<title>${escapeAttr(page.title)}</title>${buildHead(page)}`,
    );
    if (!html.includes('name="description"')) {
      html = html.replace(/<head>/i, `<head>${buildHead(page)}`);
    }
    return [page.path, html] as const;
  }),
);

export function studymateResponse(path = "/") {
  const html = pageHtml.get(path) ?? pageHtml.get("/")!;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
