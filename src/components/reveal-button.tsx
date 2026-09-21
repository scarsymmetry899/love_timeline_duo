"use client";

import { useState, useTransition } from "react";
import { voteReveal } from "@/app/actions";

export default function RevealButton({ id, iVoted, partnerVoted }: { id: string; iVoted: boolean; partnerVoted: boolean }) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  if (iVoted) return <p className="text-sm text-ink-soft">You’re ready. Waiting for them to open it too.</p>;
  return (
    <div>
      <button
        className="btn-quiet text-sm"
        disabled={pending}
        onClick={() => start(async () => {
          setError("");
          const result = await voteReveal(id);
          if (result?.error) setError(result.error);
        })}
      >
        {pending ? "Opening…" : partnerVoted ? "They’re ready. Open it now" : "I’m ready to open this"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-[var(--danger)]">{error}</p>}
    </div>
  );
}
