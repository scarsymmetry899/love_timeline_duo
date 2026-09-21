import Link from "next/link";
import RevealButton from "./reveal-button";
import { Doodle, Tape } from "./doodles";
import { HeartIcon, LockIcon, PinIcon, PlusIcon } from "./icons";
import type { Member, Moment, PathMarker } from "@/lib/journey";
import { dayNumber, fmtDayMonth, fmtLong, fmtMonthYear, fmtWeekday, monthKey, reachedMilestones } from "@/lib/dates";

const penClass = (p?: string) => (p === "dancing" ? "hand-dancing" : "hand-caveat");
const TILTS = ["-rotate-3", "rotate-2", "-rotate-2", "rotate-3"];

type Side = "left" | "right" | "center";

// One stretch of trail per row. The SVG stretches to the row's height, and
// non-scaling strokes keep the dashes even whatever the row's size.
function Trail({ side, from = 0, to = 100 }: { side: Side; from?: number; to?: number }) {
  const x = side === "left" ? 25 : side === "right" ? 75 : 50;
  const d = side === "center" ? `M50 ${from} L50 ${to}` : `M50 0 C50 30 ${x} 20 ${x} 50 S50 70 50 100`;
  return (
    <svg className="trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path className="trail-base" d={d} vectorEffect="non-scaling-stroke" />
      <path className="trail-dash" d={d} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

type Item =
  | { kind: "memory"; date: string; marker: PathMarker; index: number }
  | { kind: "milestone"; date: string; label: string };

type Props = {
  markers: PathMarker[];
  moments: Map<string, Moment>;
  me: Member;
  partner: Member | null;
  since: string | null;
  days: number | null;
  today: string;
};

export default function Path({ markers, moments, me, partner, since, days, today }: Props) {
  // Memories and reached milestones in date order; a milestone comes first on a shared day.
  const items: Item[] = [
    ...reachedMilestones(since, days).map((m) => ({ kind: "milestone" as const, date: m.date, label: m.label })),
    ...markers.map((marker, index) => ({ kind: "memory" as const, date: marker.moment_date, marker, index })),
  ].sort((a, b) => (a.date === b.date ? (a.kind === "milestone" ? -1 : 1) : a.date < b.date ? -1 : 1));

  const firstOfMonth = items.map((it, i) => monthKey(it.date) !== (i ? monthKey(items[i - 1].date) : since ? monthKey(since) : ""));
  const todayDay = dayNumber(since, today);

  return (
    <ol className="relative flex flex-col" aria-label="Your path, oldest first">
      {/* trailhead */}
      <li className="path-row flex justify-center pb-10 pt-4">
        <Trail side="center" from={60} />
        <div className="relative z-10 flex flex-col items-center">
          <div className="trailhead">
            <p className="type text-[0.7rem] uppercase">the trail begins</p>
            <p className={`${penClass(me.pen_style)} text-5xl leading-none`}>day one</p>
            {since && <p className="type mt-1 text-xs">{fmtLong(since)}</p>}
          </div>
          <span className="trailhead-post" aria-hidden="true" />
        </div>
      </li>

      {items.flatMap((it, i) => {
        const rows = [];
        if (firstOfMonth[i]) {
          rows.push(
            <li key={`month-${monthKey(it.date)}`} className="path-row flex justify-center py-6">
              <Trail side="center" />
              <div className="signpost relative z-10">
                <span className="hand-caveat text-2xl leading-none">{fmtMonthYear(it.date)}</span>
              </div>
            </li>,
          );
        }

        if (it.kind === "milestone") {
          rows.push(
            <li key={`ms-${it.label}`} className="path-row flex justify-center py-7">
              <Trail side="center" />
              <div className="reveal-on-scroll relative z-10 flex flex-col items-center">
                <div className="pennant">
                  <span className="hand-caveat text-2xl leading-none">{it.label}</span>
                </div>
                <span className="pennant-pole" aria-hidden="true" />
                <p className="type mt-1 rounded-full bg-paper px-2 text-[0.7rem] uppercase text-ink-soft">{fmtDayMonth(it.date)}</p>
              </div>
            </li>,
          );
          return rows;
        }

        const m = it.marker;
        const side: Side = it.index % 2 ? "right" : "left";
        const owner = m.is_mine ? me : partner;
        const moment = moments.get(m.id);
        const tilt = TILTS[it.index % TILTS.length];
        const day = dayNumber(since, m.moment_date);
        const pinned = it.index % 3 === 0;

        const card = moment ? (
          <Link href={`/moment/${m.id}`} className={`path-card group block ${tilt}`} aria-label={`Open ${moment.heading || "memory"} from ${fmtLong(m.moment_date)}`}>
            <figure className={`polaroid relative ${moment.photos.length > 1 ? "stacked" : ""}`}>
              {pinned ? <span className="pin" style={{ background: owner?.pin_color }} aria-hidden="true" /> : <Tape i={it.index} className="tape-top" />}
              {moment.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={moment.photos[0].url} alt="" loading="lazy" className="aspect-[4/5] w-full bg-paper-deep object-cover" />
              ) : (
                <div className={`note-card aspect-[4/5] overflow-hidden px-3 pt-3 ${penClass(owner?.pen_style)} text-[1.3rem] leading-7`}>
                  <p className="line-clamp-6">{moment.body || moment.heading || "A memory"}</p>
                </div>
              )}
              <figcaption className={`${penClass(owner?.pen_style)} line-clamp-2 px-1 pb-2.5 pt-2 text-center text-[1.4rem] leading-6`}>
                {moment.heading || "untitled"}
              </figcaption>
            </figure>
            <span className="badge">
              {m.revealed
                ? <><HeartIcon className="h-3 w-3 text-[#FF8FB1]" /> opened together</>
                : <><LockIcon className="h-3 w-3" /> just you</>}
            </span>
          </Link>
        ) : (
          <div className={`path-card envelope-wrap ${tilt}`}>
            <div className="envelope">
              <div className="envelope-flap" aria-hidden="true" />
              <span className="wax-seal" style={{ background: owner?.pin_color }} aria-hidden="true">
                <HeartIcon className="h-4 w-4" />
              </span>
              <div className="relative px-3 pb-4 pt-[6.3rem] text-center">
                <p className="type text-[0.65rem] uppercase text-ink-soft">sealed · from</p>
                <p className={`${penClass(owner?.pen_style)} text-3xl leading-none`} style={{ color: owner?.pin_color }}>
                  {owner?.display_name ?? "them"}
                </p>
                <div className="mt-2 flex items-center justify-center gap-1.5 text-[0.7rem] text-ink-soft" aria-label={`${m.i_voted ? "You are" : "You aren’t"} ready. ${m.partner_voted ? "They are" : "They aren’t"} ready.`}>
                  <span className={`vote-dot ${m.i_voted ? "on" : ""}`} style={{ ["--c" as string]: me.pin_color }} />you
                  <span className={`vote-dot ml-2 ${m.partner_voted ? "on" : ""}`} style={{ ["--c" as string]: owner?.pin_color }} />{owner?.display_name ?? "them"}
                </div>
                <div className="mt-2">
                  <RevealButton id={m.id} iVoted={m.i_voted} partnerVoted={m.partner_voted} otherName={owner?.display_name} />
                </div>
              </div>
            </div>
          </div>
        );

        const label = (
          <div className={`relative z-10 ${side === "left" ? "pl-1 text-left" : "pr-1 text-right"}`}>
            <p className={`${penClass(owner?.pen_style)} text-[2.6rem] leading-none`} style={{ color: owner?.pin_color }}>
              {fmtDayMonth(m.moment_date)}
            </p>
            <p className="type mt-1.5 text-[0.7rem] uppercase text-ink-soft">
              {fmtWeekday(m.moment_date)}{day ? ` · day ${day.toLocaleString("en-IN")}` : ""}
            </p>
            {moment?.place && (
              <p className={`mt-1.5 flex items-center gap-1 text-sm text-ink-soft ${side === "left" ? "" : "justify-end"}`}>
                <PinIcon className="h-3.5 w-3.5 flex-none" /> <span className="line-clamp-1">{moment.place}</span>
              </p>
            )}
            <Doodle i={it.index} className="mt-3 inline-block h-9 w-9" />
          </div>
        );

        rows.push(
          <li key={m.id} className="path-row grid grid-cols-2 items-center gap-3 py-9">
            <Trail side={side} />
            {side === "left" ? (
              <>
                <div className="reveal-on-scroll relative z-10 flex justify-center">{card}</div>
                {label}
              </>
            ) : (
              <>
                {label}
                <div className="reveal-on-scroll relative z-10 flex justify-center">{card}</div>
              </>
            )}
          </li>,
        );
        return rows;
      })}

      {/* you are here */}
      <li className="path-row flex flex-col items-center pt-8">
        <Trail side="center" to={22} />
        <div className="relative z-10 flex flex-col items-center">
          <span className="here-dot" style={{ ["--c" as string]: me.pin_color }} aria-hidden="true" />
          <p className="hand-caveat mt-1 text-2xl leading-none">you are here</p>
          <p className="type text-[0.7rem] uppercase text-ink-soft">
            today{todayDay ? ` · day ${todayDay.toLocaleString("en-IN")}` : ""}
          </p>
        </div>
        <Link href="/moment/new" className="blank-polaroid relative z-10 mt-6 -rotate-2">
          <span className="blank-photo">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-paper"><PlusIcon className="h-6 w-6" /></span>
            <span className="mt-2 text-sm font-bold">{markers.length ? "Add the next memory" : "Pin your first memory"}</span>
          </span>
          <span className="hand-caveat block py-2 text-center text-xl text-ink-soft">what happened today?</span>
        </Link>
      </li>
    </ol>
  );
}
