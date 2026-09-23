"use client";

import { useState, useTransition } from "react";
import { voteReveal } from "@/app/actions";

type Props = {
  id: string;
  iVoted: boolean;
  partnerVoted: boolean;
  /** True when the signed-in person wrote this memory. */
  mine?: boolean;
  otherName?: string | null;
  quiet?: boolean;
};

// A memory opens once both people have voted. Either of you can go first.
export default function RevealButton({ id, iVoted, partnerVoted, mine = false, otherName, quiet = true }: Props) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const them = otherName || "them";

  if (iVoted) {
    return <p className="text-caption text-ink-muted">You’re ready. Waiting for {them} to open it too.</p>;
  }

  const label = pending
    ? "Opening…"
    : partnerVoted
      ? mine ? `${them} wants to see this. Open it together` : `${them} is ready. Open it now`
      : mine ? `I’m ready to share this with ${them}` : "I’m ready to open this";

  return (
    <div>
      <button
        type="button"
        className={quiet ? "btn-quiet text-caption" : "btn"}
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
        {label}
      </button>
      {partnerVoted && !pending && !mine && <p className="text-caption text-ink-muted">They’re ready too.</p>}
      {error && <p role="alert" className="error mt-1">{error}</p>}
    </div>
  );
}
