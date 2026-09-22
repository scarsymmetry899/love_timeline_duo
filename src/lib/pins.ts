// Stored values stay as they are in the database; the UI shows a deeper shade
// of the same hue so each pin reads at 3:1 or better on the polaroid surface.
export const PINS = [
  { value: "#F44336", name: "Red", display: "#D32F2F" },
  { value: "#FF4081", name: "Pink", display: "#D81B60" },
  { value: "#FB8C00", name: "Orange", display: "#E65100" },
  { value: "#7CB342", name: "Green", display: "#558B2F" },
  { value: "#1E88E5", name: "Blue", display: "#1565C0" },
  { value: "#7E57C2", name: "Purple", display: "#6A3FB5" },
] as const;

export function pinDisplay(value: string | null | undefined) {
  return PINS.find((p) => p.value.toLowerCase() === (value ?? "").toLowerCase())?.display ?? "#705845";
}

export const penClass = (pen?: string | null) => (pen === "dancing" ? "hand-dancing" : "hand-caveat");

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "Thu, 2 January 2025". Deterministic, so server and browser render the same text. */
export function formatDay(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  const weekday = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${weekday}, ${d} ${MONTHS[m - 1]} ${y}`;
}

const DAY_MS = 86_400_000;
const toUTC = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const toISO = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Day number of `iso` on a path that started on `since` (day one = 1). */
export function dayNumber(since: string, iso: string) {
  return Math.floor((toUTC(iso) - toUTC(since)) / DAY_MS) + 1;
}

export type Milestone = { date: string; label: string; inDays: number };

/** The next two milestones after `today`: yearly anniversaries and round day counts. */
export function upcomingMilestones(since: string, today: string, count = 2): Milestone[] {
  const start = toUTC(since);
  const now = toUTC(today);
  const out: Milestone[] = [];
  const [sy, sm, sd] = since.split("-").map(Number);
  for (let years = 1; years < 80; years++) {
    const t = Date.UTC(sy + years, sm - 1, sd);
    if (t > now) {
      out.push({ date: toISO(t), label: years === 1 ? "1 year together" : `${years} years together`, inDays: Math.round((t - now) / DAY_MS) });
      break;
    }
  }
  const dayToday = Math.floor((now - start) / DAY_MS) + 1;
  for (const step of [1000, 100]) {
    const nextDay = (Math.floor(dayToday / step) + 1) * step;
    const t = start + (nextDay - 1) * DAY_MS;
    if (!out.some((m) => m.date === toISO(t))) {
      out.push({ date: toISO(t), label: `Day ${nextDay.toLocaleString("en-IN")}`, inDays: Math.round((t - now) / DAY_MS) });
    }
  }
  return out.sort((a, b) => a.inDays - b.inDays).slice(0, count);
}

/** "2 Jan 2025": short enough for a Polaroid caption in handwriting. */
export function shortDay(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}
