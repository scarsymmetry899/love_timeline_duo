"use client";

import { useEffect, useRef } from "react";
import { penClass, pinDisplay } from "@/lib/pins";

const KEY = (id: string) => `just-revealed:${id}`;

/** A memory on the path. Plays the unseal animation once, right after a mutual reveal. */
export default function PathPolaroid({
  id, who, pen, pin, date, dateLabel, day,
}: { id: string; who: string; pen?: string | null; pin?: string | null; date: string; dateLabel: string; day?: number | null }) {
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

  return (
    <figure ref={ref} className="polaroid" style={{ "--pin": pinDisplay(pin) } as React.CSSProperties}>
      <span className="tape tape--top" aria-hidden="true" />
      <div className="reveal-photo photo-well aspect-square" />
      <figcaption className="reveal-caption px-1 pb-1 pt-2 text-center">
        <time dateTime={date} className={`${penClass(pen)} block text-hand leading-none`}>{dateLabel}</time>
        <span className="eyebrow mt-1 block">{who}{day ? ` · Day ${day.toLocaleString("en-IN")}` : ""}</span>
      </figcaption>
      <span ref={statusRef} role="status" className="sr-only" />
    </figure>
  );
}
