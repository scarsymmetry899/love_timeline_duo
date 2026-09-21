import RevealButton from "./reveal-button";
import type { Member, PathMarker } from "@/lib/journey";

const W = 420;
const STEP = 300;
const TOP = 70;

function fmt(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
}
const penClass = (p?: string) => (p === "dancing" ? "hand-dancing" : "hand-caveat");

export default function Path({
  markers, me, partner, since,
}: { markers: PathMarker[]; me: Member; partner: Member | null; since: string | null }) {
  const pts = [{ x: W / 2, y: TOP }, ...markers.map((_, i) => ({ x: i % 2 ? W * 0.7 : W * 0.3, y: TOP + STEP * (i + 1) }))];
  const last = pts[pts.length - 1];
  const tail = { x: last.x === W / 2 ? W * 0.3 : W - last.x, y: last.y + STEP * 0.8 };
  const all = [...pts, tail];
  const d = all
    .map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : `C${all[i - 1].x} ${all[i - 1].y + STEP / 2} ${p.x} ${p.y - STEP / 2} ${p.x} ${p.y}`))
    .join(" ");
  const H = tail.y + 40;

  return (
    <div className="relative mx-auto w-full max-w-[420px]" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="tailfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset={(last.y / H).toFixed(3)} stopColor="var(--path)" />
            <stop offset="1" stopColor="var(--path)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke="url(#tailfade)" strokeWidth="14" strokeLinecap="round" strokeDasharray="22 26" />
      </svg>

      {/* day one */}
      <Node x={W / 2} y={TOP} H={H}>
        <div className="flex flex-col items-center">
          <span className="h-5 w-5 rounded-full border-4 border-polaroid" style={{ background: me.pin_color }} />
          <div className="mt-1 rounded-2xl bg-paper px-3 py-1 text-center">
            <p className={`${penClass(me.pen_style)} text-3xl leading-none`}>day one</p>
            {since && <p className="text-sm text-ink-soft">{fmt(since)}</p>}
          </div>
        </div>
      </Node>

      {markers.map((m, i) => {
        const owner = m.is_mine ? me : partner;
        const p = pts[i + 1];
        const tilt = i % 2 ? "rotate-[3deg]" : "rotate-[-3deg]";
        return (
          <Node key={m.id} x={p.x} y={p.y} H={H}>
            {m.is_mine || m.revealed ? (
              <figure className={`polaroid w-40 ${tilt}`}>
                <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full" style={{ background: owner?.pin_color }} />
                <div className="aspect-square bg-paper-deep" />
                <figcaption className={`${penClass(owner?.pen_style)} py-2 text-center text-xl leading-tight`}>
                  {fmt(m.moment_date)}
                </figcaption>
              </figure>
            ) : (
              <div className={`w-44 rounded-2xl bg-polaroid p-4 text-center ${tilt}`}>
                <div className="mx-auto mb-2 h-3 w-10 rounded-full" style={{ background: owner?.pin_color }} />
                <p className={`${penClass(owner?.pen_style)} text-2xl leading-tight`}>
                  {owner?.display_name ?? "They"} added something here
                </p>
                <p className="mt-1 text-sm text-ink-soft">{fmt(m.moment_date)}</p>
                <div className="mt-2"><RevealButton id={m.id} iVoted={m.i_voted} partnerVoted={m.partner_voted} /></div>
              </div>
            )}
          </Node>
        );
      })}

      <Node x={tail.x} y={tail.y - 30} H={H}>
        <p className="text-center text-sm text-ink-soft">
          {markers.length ? "More path ahead" : "Your first memory will appear here."}
        </p>
      </Node>
    </div>
  );
}

function Node({ x, y, H, children }: { x: number; y: number; H: number; children: React.ReactNode }) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }}
    >
      {children}
    </div>
  );
}
