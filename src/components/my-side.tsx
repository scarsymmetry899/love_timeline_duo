"use client";

import { useState, useTransition } from "react";
import { updateMySide } from "@/app/actions";

const PINS = ["#F44336", "#FF4081", "#FB8C00", "#7CB342", "#1E88E5", "#7E57C2"];
const PENS = [
  { key: "caveat", label: "Caveat", cls: "hand-caveat" },
  { key: "dancing", label: "Dancing", cls: "hand-dancing" },
] as const;

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
    <details className="group rounded-3xl bg-polaroid p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between">
        <span className="text-xl font-bold">Your side of the path</span>
        <span className={`${PENS.find((x) => x.key === p)?.cls} text-2xl`} style={{ color: c }}>
          {name}
        </span>
      </summary>
      <div className="mt-4 flex flex-col gap-4">
        <fieldset>
          <legend className="font-semibold">Handwriting</legend>
          <div className="mt-2 flex gap-2">
            {PENS.map((x) => (
              <button
                key={x.key}
                type="button"
                disabled={pending}
                aria-pressed={p === x.key}
                onClick={() => save(x.key, c)}
                className={`${x.cls} rounded-xl border-2 px-4 py-1 text-2xl ${p === x.key ? "border-ink" : "border-line"}`}
              >
                {name}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="font-semibold">Pin colour</legend>
          <div className="mt-2 flex gap-3">
            {PINS.map((x) => (
              <button
                key={x}
                type="button"
                disabled={pending}
                aria-label={`Pin colour ${x}`}
                aria-pressed={c === x}
                onClick={() => save(p, x)}
                className={`h-9 w-9 rounded-full ring-offset-2 ring-offset-[var(--polaroid)] ${c === x ? "ring-3 ring-ink" : ""}`}
                style={{ background: x }}
              />
            ))}
          </div>
        </fieldset>
        {pending && <p className="text-sm text-ink-soft">Saving…</p>}
        {error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}
      </div>
    </details>
  );
}
