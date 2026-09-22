"use client";

import { useRef, useState, useTransition } from "react";
import { createInvite } from "@/app/actions";

export default function InvitePartner() {
  const [partnerEmail, setPartnerEmail] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [pending, start] = useTransition();
  const ref = useRef<HTMLInputElement>(null);

  function make() {
    if (!/^\S+@\S+\.\S+$/.test(partnerEmail.trim())) {
      setError("Enter your partner’s email, like name@example.com.");
      ref.current?.focus();
      return;
    }
    start(async () => {
      setError("");
      const res = await createInvite(partnerEmail);
      if ("error" in res && res.error) {
        setError(res.error);
        ref.current?.focus();
        return;
      }
      if ("code" in res) {
        setLink(`${location.origin}/invite/${res.code}`);
        setStatus(`Invite for ${partnerEmail} created.`);
      }
    });
  }

  const message = link
    ? `I started a private path for the two of us, where we can each save our memories. Open this link and sign in with ${partnerEmail} to join me: ${link}`
    : "";

  return (
    <section className="panel" aria-labelledby="invite-title">
      <p className="eyebrow">Step 2 of 2</p>
      <h2 id="invite-title" className="text-heading">Invite your partner</h2>
      <p className="mt-2 text-ink-muted">
        They’ll get their own side of the path. Only they can accept, because the invite is tied to their email.
      </p>
      <p role="status" className="sr-only">{status}</p>
      {!link ? (
        <form
          noValidate
          className="mt-5 flex flex-col gap-2"
          onSubmit={(e) => { e.preventDefault(); make(); }}
        >
          <label htmlFor="partner-email" className="font-semibold">Partner’s email</label>
          <input
            ref={ref}
            id="partner-email" name="partner-email" type="email" inputMode="email" autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "partner-email-error" : undefined}
            className="field mt-1" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} placeholder="name@example.com"
          />
          {error && <p id="partner-email-error" className="error">{error}</p>}
          <button className="btn mt-3" disabled={pending}>
            {pending ? "Creating invite…" : "Create invite link"}
          </button>
        </form>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          <p className="font-semibold">Invite ready for <bdi>{partnerEmail}</bdi></p>
          <label htmlFor="invite-link" className="sr-only">Invite link</label>
          <input id="invite-link" readOnly value={link} className="field text-caption" onFocus={(e) => e.target.select()} />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a className="btn" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">
              Send on WhatsApp
            </a>
            <button
              type="button"
              className="btn-quiet"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(message);
                  setStatus("Message copied.");
                } catch {
                  setError("Unable to copy here. Select the link above and copy it instead.");
                }
              }}
            >
              Copy message
            </button>
          </div>
          {status === "Message copied." && <p className="text-caption text-ink-muted" aria-hidden="true">Message copied.</p>}
          {error && <p className="error">{error}</p>}
          <p className="text-caption text-ink-muted">
            The link works once and expires in 14 days. If they don’t join in time, create a new one here.
          </p>
          <button type="button" className="btn-quiet self-start text-caption" onClick={() => { setLink(null); setStatus(""); setError(""); }}>
            Invite a different email
          </button>
        </div>
      )}
    </section>
  );
}
