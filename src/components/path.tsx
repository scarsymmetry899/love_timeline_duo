"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import RevealButton from "./reveal-button";
import PathPolaroid from "./path-polaroid";
import type { Member, PathMarker } from "@/lib/journey";
import { dayNumber, formatDay, penClass, pinDisplay, shortDay, upcomingMilestones } from "@/lib/pins";

const fmt = formatDay;

// "Today" in the reader's own time zone, read only in the browser so the
// server render never disagrees with it.
const noop = () => () => {};
function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * The path is an ordered list in normal flow, so reading order matches the
 * visual order and cards never overlap, whatever the width or text size.
 * The dashed trail is decorative and is drawn afterwards, behind the list,
 * through the measured centre of each stop.
 */
export default function Path({
  markers, me, partner, since,
}: { markers: PathMarker[]; me: Member; partner: Member | null; since: string | null }) {
  const listRef = useRef<HTMLOListElement>(null);
  const today = useSyncExternalStore(noop, localToday, () => null);
  const ahead = since && today ? upcomingMilestones(since, today) : [];
  const [trail, setTrail] = useState<{ d: string; w: number; h: number; fadeFrom: number } | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const draw = () => {
      const box = list.getBoundingClientRect();
      const pts = [...list.querySelectorAll<HTMLElement>("[data-stop]")].map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
      });
      if (!pts.length) return;
      const last = pts[pts.length - 1];
      const tail = { x: box.width - last.x < box.width / 2 ? box.width * 0.3 : box.width * 0.7, y: box.height };
      const all = [...pts, tail];
      const d = all
        .map((p, i) => {
          if (i === 0) return `M${p.x} ${p.y}`;
          const a = all[i - 1];
          const mid = (p.y - a.y) / 2;
          return `C${a.x} ${a.y + mid} ${p.x} ${p.y - mid} ${p.x} ${p.y}`;
        })
        .join(" ");
      setTrail({ d, w: box.width, h: box.height, fadeFrom: last.y / box.height });
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(list);
    return () => ro.disconnect();
  }, [markers.length, ahead.length]);

  return (
    <section aria-labelledby="path-title">
      <h2 id="path-title" className="sr-only">Your path</h2>
      <div className="relative">
        {trail && (
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 ${trail.w} ${trail.h}`}
          >
            <defs>
              <linearGradient id="trail-fade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={trail.h}>
                <stop offset={Math.min(trail.fadeFrom, 0.98)} stopColor="var(--trail)" />
                <stop offset="1" stopColor="var(--trail)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={trail.d} fill="none" stroke="url(#trail-fade)" strokeWidth="12" strokeLinecap="round" strokeDasharray="20 24" />
          </svg>
        )}

        <ol ref={listRef} className="relative flex flex-col gap-14 pb-28">
          <li className="flex justify-center">
            <div data-stop className="flex flex-col items-center px-4 text-center">
              <span className="pin" style={{ "--pin": pinDisplay(me.pin_color) } as React.CSSProperties} aria-hidden="true" />
              <p className={`${penClass(me.pen_style)} mt-2 text-hand-lg`}>day one</p>
              {since && <p className="eyebrow mt-1"><time dateTime={since}>{fmt(since)}</time></p>}
            </div>
          </li>

          {markers.map((m, i) => {
            const owner = m.is_mine ? me : partner;
            const who = m.is_mine ? "You" : owner?.display_name ?? "Your partner";
            const side = i % 2 ? "justify-end" : "justify-start";
            const tilt = i % 2 ? "rotate-[2.5deg]" : "rotate-[-2.5deg]";
            return (
              <li key={m.id} className={`flex ${side}`}>
                <div data-stop className={`w-[min(13rem,62%)] ${tilt}`}>
                  {m.is_mine || m.revealed ? (
                    <PathPolaroid
                      id={m.id}
                      who={who}
                      pen={owner?.pen_style}
                      pin={owner?.pin_color}
                      date={m.moment_date}
                      dateLabel={shortDay(m.moment_date)}
                      day={since ? dayNumber(since, m.moment_date) : null}
                    />
                  ) : (
                    <article
                      className="panel text-center"
                      style={{ "--pin": pinDisplay(owner?.pin_color) } as React.CSSProperties}
                      aria-label={`Sealed memory from ${who}, ${fmt(m.moment_date)}`}
                    >
                      <span className="wax mx-auto mb-3" aria-hidden="true">{(who[0] ?? "?").toUpperCase()}</span>
                      <p className={`${penClass(owner?.pen_style)} text-hand leading-none`}>{who}</p>
                      <p className="mt-1 text-caption text-ink-muted">sealed a memory here</p>
                      <p className="eyebrow mt-2">
                        {since && <>Day {dayNumber(since, m.moment_date).toLocaleString("en-IN")} · </>}
                        <time dateTime={m.moment_date}>{shortDay(m.moment_date)}</time>
                      </p>
                      <div className="mt-3"><RevealButton id={m.id} iVoted={m.i_voted} partnerVoted={m.partner_voted} /></div>
                    </article>
                  )}
                </div>
              </li>
            );
          })}

          {ahead.map((a, i) => (
            <li key={a.date} className={`flex ${(markers.length + i) % 2 ? "justify-end" : "justify-start"}`}>
              <div data-stop className="ahead-stop w-[min(12rem,58%)] p-4 text-center">
                <p className="eyebrow">Coming up</p>
                <p className={`${penClass(me.pen_style)} mt-1 text-hand`}>{a.label}</p>
                <p className="mt-1 text-caption text-ink-muted">
                  <time dateTime={a.date}>{shortDay(a.date)}</time>
                  <br />{a.inDays === 0 ? "today" : a.inDays === 1 ? "tomorrow" : `in ${a.inDays} days`}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {markers.length === 0 && (
        <div className="-mt-16 text-center">
          <p className="font-semibold">No memories yet</p>
          <p className="measure mx-auto mt-1 text-caption text-ink-muted">
            Memories you and your partner add will appear along this path, in the order they happened. Adding memories is coming soon.
          </p>
        </div>
      )}
    </section>
  );
}
