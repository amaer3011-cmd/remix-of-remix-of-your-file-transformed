import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const payloadSchema = z.object({
  path: z.string().max(300),
  session_id: z.string().min(6).max(80),
  referrer: z.string().max(500).optional().nullable(),
  duration_ms: z.number().int().min(0).max(86_400_000).optional().nullable(),
});

function detectDevice(ua: string) {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

export const Route = createFileRoute("/api/public/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response("Bad request", { status: 400 });
        }

        const parsed = payloadSchema.safeParse(body);
        if (!parsed.success) return new Response("Invalid payload", { status: 400 });

        const ua = request.headers.get("user-agent") ?? "";
        const country =
          request.headers.get("cf-ipcountry") ??
          request.headers.get("x-vercel-ip-country") ??
          null;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("page_views").insert({
          path: parsed.data.path.slice(0, 300),
          session_id: parsed.data.session_id,
          referrer: parsed.data.referrer?.slice(0, 500) || null,
          duration_ms: parsed.data.duration_ms ?? null,
          device: detectDevice(ua),
          country,
          user_agent: ua.slice(0, 400),
        });

        if (error) {
          console.error("[track]", error.message);
          return new Response("error", { status: 500 });
        }
        return new Response("ok");
      },
    },
  },
});
