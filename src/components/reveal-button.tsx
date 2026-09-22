"use client";

import { useState, useTransition } from "react";
import { voteReveal } from "@/app/actions";

export default function RevealButton({ id, iVoted, partnerVoted }: { id: string; iVoted: boolean; partnerVoted: boolean }) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  if (iVoted) return <p className="text-caption text-ink-muted">You’re ready. Waiting for them to open it too.</p>;
  return (
    <div>
      <button
        type="button"
        className="btn-quiet text-caption"
        disabled={pending}
        onClick={() => start(async () => {
          setError("");
          try { sessionStorage.setItem(`just-revealed:${id}`, "1"); } catch {}
          const result = await voteReveal(id);
          if (result?.error) {
            try { sessionStorage.removeItem(`just-revealed:${id}`); } catch {}
            setError(result.error);
          } else if (!result?.revealed) {
            try { sessionStorage.removeItem(`just-revealed:${id}`); } catch {}
          }
        })}
      >
        {pending ? "Opening…" : partnerVoted ? "Open it now" : "I’m ready to open this"}
      </button>
      {partnerVoted && !pending && <p className="text-caption text-ink-muted">They’re ready too.</p>}
      {error && <p role="alert" className="error mt-1">{error}</p>}
    </div>
  );
}
