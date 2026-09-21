"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  /** Where to go once signed in. Must be a same-site path. */
  next?: string;
  submitLabel?: string;
  /** Shown under the email field, e.g. which address an invite expects. */
  hint?: React.ReactNode;
};

function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes("rate limit")) return "Too many codes were sent to this address. Wait a few minutes, then try again.";
  if (m.includes("expired") || m.includes("invalid")) return "That code didn’t work. Check the latest email, or send a new code.";
  if (m.includes("email")) return "Enter a valid email address.";
  return "Something went wrong. Please try again.";
}

export default function EmailCodeSignIn({ next = "/", submitLabel = "Send my code", hint }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  async function sendCode() {
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) return setError(friendly(error.message));
    setStep("code");
    setCooldown(60);
  }

  async function verify(token: string) {
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.verifyOtp({ email: email.trim(), token, type: "email" });
    if (error) {
      setBusy(false);
      return setError(friendly(error.message));
    }
    router.replace(safeNext);
    router.refresh();
  }

  if (step === "code") {
    return (
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          verify(code);
        }}
      >
        <label htmlFor="code" className="font-semibold">Enter the code we sent to {email}</label>
        <input
          ref={codeRef}
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6,8}"
          maxLength={8}
          required
          className="field text-center text-2xl tracking-[0.4em] tabular-nums"
          value={code}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 8);
            setCode(v);
            if (v.length === 6 || v.length === 8) verify(v);
          }}
          placeholder="••••••"
        />
        <button className="btn mt-1" disabled={busy || code.length < 6}>
          {busy ? "Checking…" : "Continue"}
        </button>
        <p className="text-sm text-ink-soft">
          The code works for one hour. You can type it on any phone or laptop.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <button type="button" className="btn-quiet" disabled={cooldown > 0 || busy} onClick={sendCode}>
            {cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
          </button>
          <button type="button" className="btn-quiet" onClick={() => { setStep("email"); setCode(""); setError(""); }}>
            Use a different email
          </button>
        </div>
        {error && <p role="alert" className="text-[var(--danger)]">{error}</p>}
      </form>
    );
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        sendCode();
      }}
    >
      <label htmlFor="email" className="font-semibold">Your email</label>
      <input
        id="email" type="email" required autoComplete="email" className="field"
        value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
      />
      {hint}
      <button className="btn mt-1" disabled={busy}>{busy ? "Sending…" : submitLabel}</button>
      {error && <p role="alert" className="text-[var(--danger)]">{error}</p>}
    </form>
  );
}
