// Date helpers shared by server and client components. Dates are stored as
// plain `YYYY-MM-DD` strings and always read as local midnight.

const at = (d: string) => new Date(d + "T00:00:00");

export const fmtLong = (d: string) =>
  at(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

export const fmtDayMonth = (d: string) => at(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export const fmtWeekday = (d: string) => at(d).toLocaleDateString("en-IN", { weekday: "long" });

export const fmtMonthYear = (d: string) => at(d).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

export const monthKey = (d: string) => d.slice(0, 7);

/** Today in India, as `YYYY-MM-DD`. The app's couples are India-based. */
export const todayISO = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

/** Which day of the relationship `date` falls on, counting `since` as day 1. */
export function dayNumber(since: string | null, date: string) {
  if (!since) return null;
  const n = Math.round((at(date).getTime() - at(since).getTime()) / 86_400_000) + 1;
  return n >= 1 ? n : null;
}

// Day counts, plus one entry per anniversary for the first ten years.
const MILESTONES = [
  ...[7, 30, 50, 100, 200, 300, 500, 1000, 1500, 2000, 2500, 3000].map((n) => ({ n, label: `${n.toLocaleString("en-IN")} days` })),
  ...Array.from({ length: 10 }, (_, i) => ({ n: Math.round((i + 1) * 365.25), label: i ? `${i + 1} years` : "1 year" })),
].sort((a, b) => a.n - b.n);

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Milestones already reached, with the date each one fell on. */
export function reachedMilestones(since: string | null, days: number | null) {
  if (!since || !days) return [];
  return MILESTONES.filter((m) => m.n <= days).map((m) => {
    const d = at(since);
    d.setDate(d.getDate() + m.n - 1);
    return { n: m.n, label: m.label, date: iso(d) };
  });
}

/** The next milestone after `days`, with progress from the previous one. */
export function nextMilestone(days: number) {
  const next = MILESTONES.find((m) => m.n > days) ?? { n: Math.ceil((days + 1) / 1000) * 1000, label: "" };
  const prev = MILESTONES.findLast((m) => m.n <= days)?.n ?? 0;
  return {
    label: next.label || `${next.n.toLocaleString("en-IN")} days`,
    inDays: next.n - days,
    progress: Math.min(1, Math.max(0, (days - prev) / (next.n - prev))),
  };
}
