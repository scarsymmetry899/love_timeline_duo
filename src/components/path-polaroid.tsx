"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { penClass, pinDisplay } from "@/lib/pins";
import type { Moment } from "@/lib/journey";

const KEY = (id: string) => `just-revealed:${id}`;

/** A memory on the path. Plays the unseal animation once, right after a mutual reveal. */
export default function PathPolaroid({
  id, who, pen, pin, date, dateLabel, day, moment,
}: {
  id: string; who: string; pen?: string | null; pin?: string | null;
  date: string; dateLabel: string; day?: number | null; moment?: Moment;
}) {
  const ref = useRef<HTMLElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  // Read once after mount; the class is applied directly so the server and
  // first client render stay identical.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY(id))) {
        sessionStorage.removeItem(KEY(id));
        ref.current?.classList.add("just-revealed");
        if (statusRef.current) statusRef.current.textContent = "Memory opened.";
      }
    } catch {}
  }, [id]);

  const photo = moment?.photos?.[0];
  const title = moment?.heading?.trim();
  const inner = (
    <>
      <span className="tape tape--top" aria-hidden="true" />
      <div className={`reveal-photo photo-well aspect-square overflow-hidden ${photo ? "" : "empty-photo"}`}>
        {photo && (
          // Signed URLs from private storage: plain img, never the image optimiser.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt="" className="h-full w-full object-cover" loading="lazy" />
        )}
      </div>
      <figcaption className="reveal-caption px-1 pb-1 pt-2 text-center">
        {title ? (
          <span className={`${penClass(pen)} block text-hand leading-none`}>{title}</span>
        ) : (
          <time dateTime={date} className={`${penClass(pen)} block text-hand leading-none`}>{dateLabel}</time>
        )}
        <span className="eyebrow mt-1 block">
          {who}{day ? ` · Day ${day.toLocaleString("en-IN")}` : ""}{title ? ` · ${dateLabel}` : ""}
        </span>
      </figcaption>
      <span ref={statusRef} role="status" className="sr-only" />
    </>
  );

  const style = { "--pin": pinDisplay(pin) } as React.CSSProperties;
  const stacked = (moment?.photos?.length ?? 0) > 1 ? " stacked" : "";

  // On the path itself a memory opens; in the marketing preview there is nothing to open.
  if (!moment) {
    return <figure ref={ref} className={`polaroid${stacked}`} style={style}>{inner}</figure>;
  }
  return (
    <figure ref={ref} className={`polaroid${stacked}`} style={style}>
      <Link href={`/moment/${id}`} className="block" aria-label={`Open ${title || dateLabel}, by ${who}`}>
        {inner}
      </Link>
    </figure>
  );
}
