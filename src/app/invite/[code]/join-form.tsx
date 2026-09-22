"use client";

import { useRef, useState, useTransition } from "react";
import { acceptInvite } from "@/app/actions";

export default function JoinForm({ code, inviter }: { code: string; inviter: string }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const ref = useRef<HTMLInputElement>(null);
  return (
    <form
      noValidate
      className="panel mt-8 flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) {
          setError("Add your name to join.");
          ref.current?.focus();
          return;
        }
        start(async () => {
          setError("");
          const res = await acceptInvite(code, name);
          if (res?.error) {
            setError(res.error);
            ref.current?.focus();
          }
        });
      }}
    >
      <label htmlFor="name" className="font-semibold">Your name</label>
      <p id="name-help" className="text-caption text-ink-muted">The name {inviter} will see on your side of the path.</p>
      <input
        ref={ref} id="name" name="name" maxLength={80} autoComplete="given-name"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "name-help name-error" : "name-help"}
        className="field mt-1" value={name} onChange={(e) => setName(e.target.value)}
      />
      {error && <p id="name-error" className="error">{error}</p>}
      <button className="btn mt-3" disabled={pending}>{pending ? "Joining…" : `Join ${inviter}’s path`}</button>
    </form>
  );
}
