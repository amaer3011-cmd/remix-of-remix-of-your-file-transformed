import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { PAGES } from "../lib/studymate-page";

const FALLBACK_BASE_URL = "https://creative-clone-web.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // نبني الروابط مطلقة (مطلوبة في معيار sitemap) بناءً على الدومين الحالي
        let base = FALLBACK_BASE_URL;
        try {
          const origin = new URL(request.url).origin;
          if (/^https?:\/\//.test(origin) && !origin.includes("localhost")) base = origin;
        } catch { /* استخدم الافتراضي */ }

        const urls = PAGES.map((page) =>
          [
            `  <url>`,
            `    <loc>${base}${page.path}</loc>`,
            `    <changefreq>weekly</changefreq>`,
            `    <priority>${page.path === "/" ? "1.0" : "0.8"}</priority>`,
            `  </url>`,
          ].join("\n"),
        );


        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
