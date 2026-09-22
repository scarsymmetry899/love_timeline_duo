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
    <figure ref={ref} className="polaroid relative">
      <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full ring-2 ring-surface" style={{ background: pinDisplay(pin) }} aria-hidden="true" />
      <div className="reveal-photo photo-well aspect-square bg-sunken" />
      <figcaption className="reveal-caption py-2 text-center">
        <span className="block text-caption font-semibold text-ink-muted">{who}{day ? ` · Day ${day.toLocaleString("en-IN")}` : ""}</span>
        <time dateTime={date} className={`${penClass(pen)} block text-hand`}>{dateLabel}</time>
      </figcaption>
      <span ref={statusRef} role="status" className="sr-only" />
    </figure>
  );
}
