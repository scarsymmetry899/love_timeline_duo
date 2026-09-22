"use client";

import { useState } from "react";

// Recommends the app to other couples. Deliberately separate from the partner
// invite: this link starts a brand-new path, it never joins yours.
export default function ShareApp() {
  const [note, setNote] = useState("");
  async function share() {
    const url = `${location.origin}/login`;
    const text = "Our Path is a private place for couples to save their memories. Worth a look:";
    try {
      if (navigator.share) await navigator.share({ title: "Our Path", text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setNote("Link copied.");
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setNote("Unable to open sharing. Copy the address from your browser instead.");
    }
  }
  return (
    <section className="text-center" aria-labelledby="share-title">
      <h2 id="share-title" className="font-semibold">Know a couple who’d love this?</h2>
      <p className="mt-1 text-caption text-ink-muted">They’ll start their own private path. Nothing of yours is shared.</p>
      <button type="button" className="btn-quiet mt-1" onClick={share}>Share Our Path</button>
      <p role="status" className="text-caption text-ink-muted">{note}</p>
    </section>
  );
}
