"use client";

import { useState, useTransition } from "react";
import { updateMySide } from "@/app/actions";

const PINS = ["#F44336", "#FF4081", "#FB8C00", "#7CB342", "#1E88E5", "#7E57C2"];
const PENS = [
  { key: "caveat", label: "Caveat", cls: "hand-caveat" },
  { key: "dancing", label: "Dancing", cls: "hand-dancing" },
] as const;

// Handwriting and pin colour for the signed-in person's side of the path.
export default function MySide({ pen, pin, name }: { pen: string; pin: string; name: string }) {
  const [p, setP] = useState(pen);
  const [c, setC] = useState(pin);
  const [error, setError] = useState("");
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
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <fieldset>
        <legend className="text-sm font-semibold">Your handwriting</legend>
        <div className="mt-2 flex gap-2">
          {PENS.map((x) => (
            <button
              key={x.key}
              type="button"
              disabled={pending}
              aria-pressed={p === x.key}
              onClick={() => save(x.key, c)}
              className={`${x.cls} flex-1 rounded-xl border-2 px-3 py-1 text-2xl ${p === x.key ? "border-ink bg-paper" : "border-line"}`}
              style={p === x.key ? { color: c } : undefined}
            >
              {name}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-semibold">Your pin colour</legend>
        <div className="mt-2 flex flex-wrap gap-2.5">
          {PINS.map((x) => (
            <button
              key={x}
              type="button"
              disabled={pending}
              aria-label={`Pin colour ${x}`}
              aria-pressed={c === x}
              onClick={() => save(p, x)}
              className={`h-8 w-8 rounded-full ring-offset-2 ring-offset-[var(--polaroid)] ${c === x ? "ring-3 ring-ink" : ""}`}
              style={{ background: x }}
            />
          ))}
        </div>
      </fieldset>
      <p className="min-h-5 text-sm text-ink-soft" role="status">{pending ? "Saving…" : ""}</p>
      {error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}
    </div>
  );
}
