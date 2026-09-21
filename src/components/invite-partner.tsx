"use client";

import { useState, useTransition } from "react";
import { createInvite } from "@/app/actions";

export default function InvitePartner() {
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  function make() {
    start(async () => {
      setError("");
      const res = await createInvite();
      if ("error" in res && res.error) return setError(res.error);
      if ("code" in res) setLink(`${location.origin}/invite/${res.code}`);
    });
  }

  const text = link ? `I started our path. Join me here: ${link}` : "";

  return (
    <section className="rounded-3xl bg-polaroid p-5">
      <h2 className="text-xl font-bold">Bring your partner in</h2>
      <p className="mt-1 text-ink-soft">
        They get their own side of the path. Your moments stay sealed from each other until you both reveal them.
      </p>
      {!link ? (
        <button className="btn mt-4" onClick={make} disabled={pending}>
          {pending ? "Creating link…" : "Create invite link"}
        </button>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <input readOnly value={link} className="field text-sm" onFocus={(e) => e.target.select()} aria-label="Invite link" />
          <div className="flex flex-wrap gap-3">
            <a className="btn" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">
              Send on WhatsApp
            </a>
            <button
              className="btn-quiet"
              onClick={async () => {
                await navigator.clipboard.writeText(link);
                setCopied(true);
              }}
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
          <p className="text-sm text-ink-soft">The link works once and expires in 14 days.</p>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-[var(--danger)]">{error}</p>}
    </section>
  );
}
