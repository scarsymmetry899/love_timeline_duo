"use client";

import { useState, useTransition } from "react";
import { deleteMoment } from "@/app/actions";
import { TrashIcon } from "./icons";

export default function DeleteMoment({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (!confirming) {
    return (
      <button type="button" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft" onClick={() => setConfirming(true)}>
        <TrashIcon /> Delete this memory
      </button>
    );
  }
  return (
    <div className="rounded-2xl bg-polaroid p-4" role="group" aria-label="Confirm delete">
      <p className="font-semibold">Delete this memory and its photos?</p>
      <p className="mt-1 text-sm text-ink-soft">This can’t be undone.</p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <button
          type="button"
          className="btn !bg-[var(--danger)] !text-white"
          disabled={pending}
          onClick={() => start(async () => {
            setError("");
            const res = await deleteMoment(id);
            if (res?.error) setError(res.error);
          })}
        >
          {pending ? "Deleting…" : "Delete"}
        </button>
        <button type="button" className="btn-quiet" disabled={pending} onClick={() => setConfirming(false)}>Keep it</button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-[var(--danger)]">{error}</p>}
    </div>
  );
}
