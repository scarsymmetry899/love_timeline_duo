"use client";

import { useState, useTransition } from "react";
import { voteOpenAll, withdrawOpenAll } from "@/app/actions";

type Props = {
  sealedFromThem: number;
  sealedFromMe: number;
  iAgreed: boolean;
  theyAgreed: boolean;
  partnerName: string | null;
};

/**
 * The other way to open memories: instead of one at a time, both of you agree
 * to open everything either of you has saved so far.
 */
export default function OpenAll({ sealedFromThem, sealedFromMe, iAgreed, theyAgreed, partnerName }: Props) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const them = partnerName ?? "your partner";
  const total = sealedFromThem + sealedFromMe;
  if (total === 0) return null;

  return (
    <section className="panel" aria-labelledby="open-all-title">
      <p className="eyebrow">Read each other</p>
      <h2 id="open-all-title" className="text-heading">Open everything together</h2>
      <p className="mt-2 text-ink-muted">
        {sealedFromThem > 0 && sealedFromMe > 0 ? (
          <>{them} is holding {sealedFromThem} sealed {sealedFromThem === 1 ? "memory" : "memories"}, and you’re holding {sealedFromMe}.</>
        ) : sealedFromThem > 0 ? (
          <>{them} is holding {sealedFromThem} sealed {sealedFromThem === 1 ? "memory" : "memories"} for you.</>
        ) : (
          <>You’re holding {sealedFromMe} sealed {sealedFromMe === 1 ? "memory" : "memories"} for {them}.</>
        )}{" "}
        When you both agree, every one of them opens at once, and you can read the whole path from each other’s side.
      </p>

      {theyAgreed && !iAgreed && (
        <p className="mt-3 font-semibold">{them} is ready and waiting for you.</p>
      )}

      <div className="mt-5">
        {iAgreed ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="font-semibold">You’re ready. Waiting for {them}.</p>
            <button
              type="button"
              className="btn-quiet text-caption"
              disabled={pending}
              onClick={() => start(async () => {
                setError("");
                const r = await withdrawOpenAll();
                if (r?.error) setError(r.error);
              })}
            >
              Not yet, change my mind
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn"
            disabled={pending}
            onClick={() => start(async () => {
              setError("");
              const r = await voteOpenAll();
              if ("error" in r && r.error) setError(r.error);
            })}
          >
            {pending ? "Opening…" : theyAgreed ? "Open everything now" : "I’m ready to open everything"}
          </button>
        )}
      </div>
      <p className="mt-3 text-caption text-ink-muted">
        Memories you add after this stay sealed again, until you both open them.
      </p>
      {error && <p role="alert" className="error mt-2">{error}</p>}
    </section>
  );
}
