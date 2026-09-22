"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  /** Where to go once signed in. Must be a same-site path. */
  next?: string;
  submitLabel?: string;
};

function friendly(message: string, step: "email" | "code") {
  const m = message.toLowerCase();
  if (m.includes("rate limit")) return "Too many codes were requested for this address. Wait a few minutes, then send a new code.";
  if (step === "code" && (m.includes("expired") || m.includes("invalid") || m.includes("token")))
    return "That code doesn’t match. Check the most recent email, or send a new code.";
  if (step === "email" && m.includes("email") && m.includes("invalid")) return "Enter an email address like name@example.com.";
  return step === "email"
    ? "Unable to send your code. Check your connection and try again in a few minutes."
    : "Unable to check your code. Check your connection and try again.";
}

export default function EmailCodeSignIn({ next = "/", submitLabel = "Send code" }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const emailRef = useRef<HTMLInputElement>(null);
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
    const address = email.trim();
    const { error } = await createClient().auth.signInWithOtp({ email: address, options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) {
      setError(friendly(error.message, "email"));
      (step === "email" ? emailRef : codeRef).current?.focus();
      return;
    }
    setStatus(`Code sent to ${address}.`);
    setStep("code");
    setCooldown(60);
  }

  async function verify(token: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.verifyOtp({ email: email.trim(), token, type: "email" });
    if (error) {
      setBusy(false);
      setError(friendly(error.message, "code"));
      codeRef.current?.focus();
      return;
    }
    setStatus("Signed in. Opening your path…");
    router.replace(safeNext);
    router.refresh();
  }

  return (
    <div>
      {/* Stable polite region, rendered before its text changes */}
      <p role="status" className="sr-only">{status}</p>

      {step === "code" ? (
        <form
          noValidate
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length < 6) {
              setError("Enter the 6-digit code from the email.");
              codeRef.current?.focus();
              return;
            }
            verify(code);
          }}
        >
          <label htmlFor="code" className="font-semibold">Code from the email</label>
          <p id="code-help" className="text-caption text-ink-muted">
            Sent to <bdi className="font-semibold text-ink">{email}</bdi>. It works for one hour, on any device.
          </p>
          <input
            ref={codeRef}
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "code-help code-error" : "code-help"}
            className="field mt-1 text-center text-heading tracking-[0.4em] tabular-nums"
            value={code}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 8);
              setCode(v);
              if (v.length === 6 || v.length === 8) verify(v);
            }}
            placeholder="123456"
          />
          {error && <p id="code-error" className="error">{error}</p>}
          <button className="btn mt-2" disabled={busy}>
            {busy ? "Checking…" : "Continue"}
          </button>
          <div className="mt-1 flex flex-wrap gap-x-6">
            <button type="button" className="btn-quiet text-caption" disabled={cooldown > 0 || busy} onClick={sendCode}>
              {cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
            </button>
            <button
              type="button"
              className="btn-quiet text-caption"
              onClick={() => { setStep("email"); setCode(""); setError(""); setStatus(""); setTimeout(() => emailRef.current?.focus()); }}
            >
              Change email
            </button>
          </div>
        </form>
      ) : (
        <form
          noValidate
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
              setError("Enter an email address like name@example.com.");
              emailRef.current?.focus();
              return;
            }
            sendCode();
          }}
        >
          <label htmlFor="email" className="font-semibold">Email</label>
          <input
            ref={emailRef}
            id="email" name="email" type="email" autoComplete="email" inputMode="email"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "email-error" : undefined}
            className="field mt-1"
            value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com"
          />
          {error && <p id="email-error" className="error">{error}</p>}
          <button className="btn mt-2" disabled={busy}>{busy ? "Sending…" : submitLabel}</button>
        </form>
      )}
    </div>
  );
}
