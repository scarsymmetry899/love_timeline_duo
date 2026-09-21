"use client";

import { useState, useTransition } from "react";
import { acceptInvite } from "@/app/actions";

export default function JoinForm({ code }: { code: string }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      className="mt-8 flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          setError("");
          const res = await acceptInvite(code, name);
          if (res?.error) setError(res.error);
        });
      }}
    >
      <label htmlFor="name" className="font-semibold">Your name</label>
      <input id="name" required className="field" value={name} onChange={(e) => setName(e.target.value)} />
      <button className="btn mt-2" disabled={pending}>{pending ? "Joining…" : "Join the path"}</button>
      {error && <p role="alert" className="text-[var(--danger)]">{error}</p>}
    </form>
  );
}
