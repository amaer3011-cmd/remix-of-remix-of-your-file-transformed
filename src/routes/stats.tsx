import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getSiteStats } from "@/lib/stats.functions";
import { Button } from "@/components/ui/button";
import type { Bucket } from "@/lib/stats-core";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "لوحة إحصائيات الموقع | Thanawiyah🎯" },
      {
        name: "description",
        content: "لوحة تحكم خاصة لمتابعة زيارات الموقع والصفحات والأجهزة والمستخدمين المسجّلين.",
      },
      { property: "og:title", content: "لوحة إحصائيات الموقع | Thanawiyah🎯" },
      {
        property: "og:description",
        content: "متابعة الزيارات والصفحات والمستخدمين المسجّلين في Thanawiyah🎯.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StatsPage,
});

const RANGES = [
  { days: 7, label: "٧ أيام" },
  { days: 30, label: "٣٠ يوم" },
  { days: 90, label: "٩٠ يوم" },
];

function StatsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [days, setDays] = useState(30);
  const fetchStats = useServerFn(getSiteStats);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const query = useQuery({
    queryKey: ["site-stats", days, session?.user.id],
    enabled: !!session,
    queryFn: () => fetchStats({ data: { days } }),
  });

  if (!ready) {
    return <Shell><p className="text-muted-foreground">جارٍ التحميل…</p></Shell>;
  }

  if (!session) {
    return (
      <Shell>
        <p className="text-muted-foreground">لازم تسجّل دخول بحساب الأدمن لعرض الإحصائيات.</p>
        <a href="/auth">
          <Button className="mt-4">تسجيل الدخول</Button>
        </a>
      </Shell>
    );
  }

  if (query.isError) {
    return (
      <Shell>
        <p className="text-destructive">
          {String(query.error).includes("Forbidden")
            ? "الحساب ده مش أدمن، مش مسموح بعرض الإحصائيات."
            : "تعذّر تحميل الإحصائيات."}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => supabase.auth.signOut()}>
          تسجيل الخروج
        </Button>
      </Shell>
    );
  }

  const d = query.data;

  return (
    <Shell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <Button
              key={r.days}
              size="sm"
              variant={days === r.days ? "default" : "outline"}
              onClick={() => setDays(r.days)}
            >
              {r.label}
            </Button>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={() => supabase.auth.signOut()}>
          تسجيل الخروج
        </Button>
      </div>

      {!d ? (
        <p className="text-muted-foreground">جارٍ تحميل البيانات…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Stat label="الزوار" value={d.visitors} />
            <Stat label="مشاهدات الصفحات" value={d.pageviews} />
            <Stat label="صفحات/زيارة" value={d.pageviewsPerVisit} />
            <Stat label="متوسط الجلسة" value={`${Math.floor(d.avgDurationSec / 60)}د ${d.avgDurationSec % 60}ث`} />
            <Stat label="معدل الارتداد" value={`${d.bounceRate}%`} />
            <Stat label="مستخدمون مسجّلون" value={d.totalUsers} />
          </div>

          <Card title="الزيارات يوميًا" className="mt-6">
            <Timeline data={d.timeline} />
          </Card>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card title="أكثر الصفحات زيارة"><BarList items={d.pages} /></Card>
            <Card title="مصادر الزيارات"><BarList items={d.sources} /></Card>
            <Card title="الأجهزة"><BarList items={d.devices} /></Card>
            <Card title="الدول"><BarList items={d.countries} /></Card>
          </div>

          <Card title={`المستخدمون المسجّلون (${d.totalUsers})`} className="mt-6">
            {d.users.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا يوجد مستخدمون بعد.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-2 text-start font-medium">الاسم</th>
                      <th className="py-2 text-start font-medium">البريد</th>
                      <th className="py-2 text-start font-medium">تاريخ التسجيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.users.map((u) => (
                      <tr key={u.id} className="border-b border-border/50">
                        <td className="py-2">{u.full_name || "—"}</td>
                        <td className="py-2" dir="ltr">{u.email}</td>
                        <td className="py-2">
                          {new Date(u.created_at).toLocaleDateString("ar-EG")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">لوحة إحصائيات Thanawiyah🎯</h1>
          <p className="text-sm text-muted-foreground">
            متابعة الزيارات والصفحات والمستخدمين المسجّلين.
          </p>
        </header>
        {children}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-border bg-card p-4 ${className}`}>
      <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function BarList({ items }: { items: Bucket[] }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">لا توجد بيانات.</p>;
  const max = Math.max(...items.map((i) => i.value));
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.label} className="relative overflow-hidden rounded-md bg-muted/40 px-3 py-1.5">
          <div
            className="absolute inset-y-0 start-0 bg-primary/15"
            style={{ width: `${(i.value / max) * 100}%` }}
          />
          <div className="relative flex justify-between text-sm">
            <span className="truncate text-foreground">{i.label}</span>
            <span className="font-medium text-muted-foreground">{i.value}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Timeline({ data }: { data: { date: string; views: number; visitors: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.views));
  return (
    <div className="flex h-40 items-end gap-1" dir="ltr">
      {data.map((d) => (
        <div key={d.date} className="group relative flex-1">
          <div
            className="w-full rounded-t bg-primary/70 transition-colors group-hover:bg-primary"
            style={{ height: `${Math.max(2, (d.views / max) * 150)}px` }}
            title={`${d.date}: ${d.views} مشاهدة · ${d.visitors} زائر`}
          />
        </div>
      ))}
    </div>
  );
}
