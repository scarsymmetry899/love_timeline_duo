"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Signs out in the browser, then does a full page reload of `returnTo`, so the
// server re-renders with no session. A server-action redirect to the same URL
// can be served from the client router cache and look like nothing happened.
export default function SwitchEmailButton({ returnTo, quiet = false }: { returnTo: string; quiet?: boolean }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className={quiet ? "btn-quiet" : "btn"}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await createClient().auth.signOut();
        window.location.assign(returnTo);
      }}
    >
      {busy ? "Signing out…" : "Switch email"}
    </button>
  );
}
