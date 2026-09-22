"use client";

import { useState, useTransition } from "react";
import { updateMySide } from "@/app/actions";
import { PINS, pinDisplay } from "@/lib/pins";

const PENS = [
  { key: "caveat", label: "Relaxed", cls: "hand-caveat" },
  { key: "dancing", label: "Flowing", cls: "hand-dancing" },
] as const;

export default function MySide({ pen, pin, name }: { pen: string; pin: string; name: string }) {
  const [p, setP] = useState(pen);
  const [c, setC] = useState(pin);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [pending, start] = useTransition();
  const save = (np: string, nc: string) => {
    const previousPen = p;
    const previousPin = c;
    setError("");
    setP(np); setC(nc);
    start(async () => {
      const result = await updateMySide(np, nc);
      if (result?.error) {
        setP(previousPen);
        setC(previousPin);
        setError(result.error);
        setStatus("");
      } else setStatus("Saved.");
    });
  };

  return (
    <details className="panel group">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <span className="font-semibold">Your handwriting and pin</span>
        <span className="flex items-center gap-3">
          <span className={`${PENS.find((x) => x.key === p)?.cls} text-hand`}>{name}</span>
          <span className="h-4 w-4 rounded-full" style={{ background: pinDisplay(c) }} aria-hidden="true" />
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 transition-[rotate] duration-200 group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6l4 4 4-4" /></svg>
        </span>
      </summary>
      <div className="mt-5 flex flex-col gap-5">
        <fieldset>
          <legend className="font-semibold">Handwriting</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {PENS.map((x) => (
              <button
                key={x.key}
                type="button"
                disabled={pending}
                aria-pressed={p === x.key}
                aria-label={`${x.label} handwriting`}
                onClick={() => save(x.key, c)}
                className={`${x.cls} min-h-12 rounded-[14px] border-2 px-4 text-hand ${p === x.key ? "border-ink bg-sunken" : "border-edge"}`}
              >
                {name}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="font-semibold">Pin colour</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {PINS.map((x) => (
              <button
                key={x.value}
                type="button"
                disabled={pending}
                aria-label={x.name}
                aria-pressed={c === x.value}
                onClick={() => save(p, x.value)}
                className={`grid h-11 w-11 place-items-center rounded-full ${c === x.value ? "ring-2 ring-ink ring-offset-2 ring-offset-[var(--surface)]" : ""}`}
              >
                <span className="h-8 w-8 rounded-full" style={{ background: x.display }} />
              </button>
            ))}
          </div>
        </fieldset>
        <p role="status" className="text-caption text-ink-muted">{pending ? "Saving…" : status}</p>
        {error && <p role="alert" className="error">{error}</p>}
      </div>
    </details>
  );
}
