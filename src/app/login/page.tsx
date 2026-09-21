"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const linkError = params.get("error") === "link";
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function send() {
    setState("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setState("error");
      setMessage(error.message);
    } else setState("sent");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <div className="polaroid mx-auto mb-10 w-56 rotate-[-4deg]">
        <div className="aspect-square bg-[linear-gradient(160deg,#87cdde,#f8c28c)]" />
        <p className="hand-caveat py-3 text-center text-2xl">day one</p>
      </div>
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight">Our Path</h1>
      <p className="mt-2 text-lg text-ink-soft">
        A private trail of the moments you two collect.
      </p>

      {state === "sent" ? (
        <div className="mt-8 rounded-2xl bg-polaroid p-5">
          <p className="font-semibold">Check {email}</p>
          <p className="mt-1 text-ink-soft">
            Open the sign-in link on this device. It works once and expires in an hour.
          </p>
          <button className="btn-quiet mt-4" onClick={() => setState("idle")}>
            Use a different email
          </button>
        </div>
      ) : (
        <form
          className="mt-8 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label htmlFor="email" className="font-semibold">Your email</label>
          <input
            id="email" type="email" required autoComplete="email" className="field"
            value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
          />
          <button className="btn mt-2" disabled={state === "sending"}>
            {state === "sending" ? "Sending link…" : "Email me a sign-in link"}
          </button>
          {(state === "error" || linkError) && (
            <p className="text-[var(--danger)]" role="alert">
              {state === "error" ? message : "That sign-in link has expired or was opened in another browser. Send a new one."}
            </p>
          )}
        </form>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
