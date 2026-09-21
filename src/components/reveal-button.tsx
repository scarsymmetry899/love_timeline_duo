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
    return <p className="text-sm text-ink-soft">You’re ready. Waiting for {them} to open it too.</p>;
  }
  const label = pending
    ? "Opening…"
    : partnerVoted
      ? mine ? `${them} wants to see this. Open it together` : `${them} is ready. Open it now`
      : mine ? `I’m ready to share this with ${them}` : "I’m ready to open this";

  return (
    <div>
      <button
        className={quiet ? "btn-quiet text-sm" : "btn"}
        disabled={pending}
        onClick={() => start(async () => {
          setError("");
          const result = await voteReveal(id);
          if (result?.error) setError(result.error);
        })}
      >
        {label}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-[var(--danger)]">{error}</p>}
    </div>
  );
}
