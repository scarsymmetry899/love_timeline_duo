"use client";

import { useState, useTransition } from "react";
import { createInvite } from "@/app/actions";

export default function InvitePartner() {
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

  const text = link ? `I made a private path for just us. Join me with ${partnerEmail}: ${link}` : "";
  const appText = "Try Our Path — a private memory trail made by two people.";

  async function shareApp() {
    const url = `${location.origin}/login`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Our Path", text: appText, url });
      } else {
        await navigator.clipboard.writeText(`${appText} ${url}`);
        setCopied(true);
      }
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") return;
      setError("We couldn’t open sharing. Copy the app address from your browser instead.");
    }
  }

  return (
    <section className="rounded-3xl bg-polaroid p-5">
      <h2 className="text-xl font-bold">Bring your partner in</h2>
      <p className="mt-1 text-ink-soft">
        This private link is only for your better half. It is locked to their email, so a forwarded link cannot add somebody else to your timeline.
      </p>
      {!link ? (
        <div className="mt-4 flex flex-col gap-3">
          <label htmlFor="partner-email" className="font-semibold">Your partner’s email</label>
          <input
            id="partner-email"
            type="email"
            required
            autoComplete="email"
            className="field"
            value={partnerEmail}
            onChange={(event) => setPartnerEmail(event.target.value)}
            placeholder="yourperson@example.com"
          />
          <button className="btn" type="button" onClick={make} disabled={pending || !partnerEmail}>
            {pending ? "Creating private link…" : "Create partner-only invite"}
          </button>
          <p className="text-sm text-ink-soft">Only a person signed in with this exact email can accept.</p>
        </div>
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
          <p className="text-sm text-ink-soft">The link works once, expires in 14 days, and only accepts {partnerEmail}.</p>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-[var(--danger)]">{error}</p>}

      <div className="mt-6 border-t border-line pt-5">
        <p className="font-semibold">Want friends to make their own path?</p>
        <p className="mt-1 text-sm text-ink-soft">Share the app—not your private partner link. They will register and start a completely separate timeline.</p>
        <button className="btn-quiet mt-3 text-sm" type="button" onClick={shareApp}>
          Share Our Path with everyone
        </button>
      </div>
    </section>
  );
}
