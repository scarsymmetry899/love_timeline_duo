"use client";

import { useState, useTransition } from "react";
import { createInvite } from "@/app/actions";

export default function InvitePartner({ myName, myPin }: { myName: string; myPin: string }) {
  const [partnerEmail, setPartnerEmail] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  function make() {
    start(async () => {
      setError("");
      const res = await createInvite(partnerEmail);
      if ("error" in res && res.error) return setError(res.error);
      if ("code" in res) setLink(`${location.origin}/invite/${res.code}`);
    });
  }

  const message = link
    ? `I started a private path for the two of us, where we can each save our memories. Open this link and sign in with ${partnerEmail} to join me: ${link}`
    : "";

  return (
    <section className="invitation fade-up">
      <div className="stamp" aria-hidden="true">
        <span className="grid h-full w-full place-items-center rounded-sm text-2xl font-extrabold text-white" style={{ background: myPin }}>
          {myName.trim().charAt(0).toUpperCase()}
        </span>
      </div>
      <p className="type text-[0.7rem] uppercase text-ink-soft">an invitation</p>
      <h2 className="hand-caveat mt-1 pr-20 text-4xl leading-none">Save a spot on the path for your person</h2>
      <p className="mt-3 pr-4 text-sm leading-relaxed text-ink-soft">
        They get their own side, in their own handwriting. The link only works for the email you enter.
      </p>
      {!link ? (
        <form
          className="mt-4 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            make();
          }}
        >
          <label htmlFor="partner-email" className="font-semibold">Your partner’s email</label>
          <input
            id="partner-email" type="email" required autoComplete="off" className="field"
            value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} placeholder="their@email.com"
          />
          <button className="btn" disabled={pending || !partnerEmail}>
            {pending ? "Creating invite…" : "Create invite link"}
          </button>
        </form>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <p className="font-semibold">Your invite for {partnerEmail} is ready</p>
          <input readOnly value={link} className="field text-sm" onFocus={(e) => e.target.select()} aria-label="Invite link" />
          <div className="flex flex-wrap items-center gap-4">
            <a className="btn" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">
              Send on WhatsApp
            </a>
            <button
              type="button"
              className="btn-quiet"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(message);
                  setCopied(true);
                } catch {
                  setError("Copy didn’t work here. Select the link above and copy it instead.");
                }
              }}
            >
              {copied ? "Message copied" : "Copy message"}
            </button>
          </div>
          <p className="text-sm text-ink-soft">
            The link works once and expires in 14 days. If they don’t join, you can create a new one here.
          </p>
          <button type="button" className="btn-quiet self-start text-sm" onClick={() => { setLink(null); setCopied(false); }}>
            Use a different email
          </button>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-[var(--danger)]">{error}</p>}
    </section>
  );
}
