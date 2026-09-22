"use client";

import { useActionState } from "react";
import { createJourney } from "@/app/actions";

export default function StartForm() {
  const [state, action, pending] = useActionState(createJourney, null);
  const err = state?.error;
  return (
    <main className="mx-auto max-w-md px-5 pb-16 pt-12">
      <div className="enter">
        <p className="eyebrow">Step 1 of 2</p>
        <h1 className="mt-1 text-title">Start your path</h1>
        <p className="mt-3 text-lead text-ink-muted">
          Set up the basics, then invite your partner on the next screen. Anything you add stays on your side until you both choose to open it.
        </p>
        <form action={action} noValidate className="panel mt-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="my_name" className="font-semibold">Your name</label>
            <p id="my_name-help" className="text-caption text-ink-muted">The name your partner will see on your side of the path.</p>
            <input
              id="my_name" name="my_name" required maxLength={80} autoComplete="given-name"
              aria-describedby="my_name-help" className="field" placeholder="Tj"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-semibold">Name your path <span className="font-normal text-ink-muted">(optional)</span></label>
            <input id="name" name="name" maxLength={100} className="field hand-caveat !text-hand" placeholder="Tj & Mira" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="together_since" className="font-semibold">Together since <span className="font-normal text-ink-muted">(optional)</span></label>
            <p id="since-help" className="text-caption text-ink-muted">This becomes “day one” on your path and starts your days-together count.</p>
            <input id="together_since" name="together_since" type="date" aria-describedby="since-help" className="field" />
          </div>
          {err && <p role="alert" className="error">{err}</p>}
          <button className="btn" disabled={pending}>{pending ? "Setting up…" : "Continue"}</button>
        </form>
      </div>
    </main>
  );
}
