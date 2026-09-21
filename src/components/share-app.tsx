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
      setNote("Sharing didn’t open. You can copy the address from your browser instead.");
    }
  }
  return (
    <footer className="mt-16 border-t border-line pt-6 text-center text-sm text-ink-soft">
      <p>Know a couple who’d love this?</p>
      <button type="button" className="btn-quiet mt-2" onClick={share}>Share Our Path with them</button>
      <p className="mt-2">They’ll start their own private path. Nothing of yours is shared.</p>
      {note && <p className="mt-2" role="status">{note}</p>}
    </footer>
  );
}
