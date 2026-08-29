import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildStats } from "./stats-core";

export const getSiteStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ days: z.number().int().min(1).max(90).default(30) }).parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) {
      throw new Error("Forbidden");
    }

    const since = new Date(Date.now() - data.days * 24 * 60 * 60 * 1000).toISOString();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [views, profiles] = await Promise.all([
      supabaseAdmin
        .from("page_views")
        .select("path, session_id, device, country, referrer, duration_ms, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(20000),
      supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, created_at, last_seen_at")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    if (views.error) throw new Error(views.error.message);
    if (profiles.error) throw new Error(profiles.error.message);

    return {
      days: data.days,
      ...buildStats(views.data ?? [], data.days),
      users: profiles.data ?? [],
      totalUsers: (profiles.data ?? []).length,
    };
  });
