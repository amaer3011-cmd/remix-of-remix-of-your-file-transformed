export interface RawView {
  path: string;
  session_id: string;
  device: string | null;
  country: string | null;
  referrer: string | null;
  duration_ms: number | null;
  created_at: string;
}

export interface Bucket {
  label: string;
  value: number;
}

function topCounts(items: (string | null | undefined)[], fallback = "غير معروف"): Bucket[] {
  const map = new Map<string, number>();
  for (const raw of items) {
    const key = (raw && raw.trim()) || fallback;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function sourceOf(referrer: string | null): string {
  if (!referrer) return "مباشر";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "مباشر";
  }
}

export function buildStats(views: RawView[], days: number) {
  const sessions = new Map<string, { views: number; duration: number }>();
  for (const v of views) {
    const s = sessions.get(v.session_id) ?? { views: 0, duration: 0 };
    s.views += 1;
    s.duration += v.duration_ms ?? 0;
    sessions.set(v.session_id, s);
  }

  const sessionList = [...sessions.values()];
  const bounced = sessionList.filter((s) => s.views <= 1).length;
  const totalDuration = sessionList.reduce((sum, s) => sum + s.duration, 0);

  const dayMap = new Map<string, { views: number; sessions: Set<string> }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    dayMap.set(d, { views: 0, sessions: new Set() });
  }
  for (const v of views) {
    const key = v.created_at.slice(0, 10);
    const entry = dayMap.get(key);
    if (!entry) continue;
    entry.views += 1;
    entry.sessions.add(v.session_id);
  }

  return {
    pageviews: views.length,
    visitors: sessions.size,
    pageviewsPerVisit: sessions.size ? +(views.length / sessions.size).toFixed(2) : 0,
    avgDurationSec: sessionList.length
      ? Math.round(totalDuration / sessionList.length / 1000)
      : 0,
    bounceRate: sessionList.length ? Math.round((bounced / sessionList.length) * 100) : 0,
    timeline: [...dayMap.entries()].map(([date, e]) => ({
      date,
      views: e.views,
      visitors: e.sessions.size,
    })),
    pages: topCounts(views.map((v) => v.path)).slice(0, 12),
    devices: topCounts(views.map((v) => v.device)),
    countries: topCounts(views.map((v) => v.country)).slice(0, 12),
    sources: topCounts(views.map((v) => sourceOf(v.referrer))).slice(0, 12),
  };
}
