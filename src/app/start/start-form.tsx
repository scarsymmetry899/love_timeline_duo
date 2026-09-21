"use client";

import { useActionState } from "react";
import { createJourney } from "@/app/actions";

export default function StartForm() {
  const [state, action, pending] = useActionState(createJourney, null);
  return (
    <main className="mx-auto max-w-md px-6 py-14">
      <p className="hand-caveat text-2xl text-ink-soft">step one of two</p>
      <h1 className="text-4xl font-extrabold tracking-tight">Start your path</h1>
      <p className="mt-2 text-lg text-ink-soft">
        Set up the basics, then invite your partner on the next screen. Anything you add stays on your side until you both choose to open it.
      </p>
      <form action={action} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="my_name" className="font-semibold">Your name</label>
          <input id="my_name" name="my_name" required className="field" placeholder="What your partner calls you" maxLength={80} autoComplete="given-name" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-semibold">Name your path</label>
          <input id="name" name="name" className="field hand-caveat !text-2xl" placeholder="Tj & Mira" maxLength={100} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="together_since" className="font-semibold">Together since</label>
          <input id="together_since" name="together_since" type="date" className="field" />
          <p className="text-sm text-ink-soft">This becomes “day one” on your path and starts your days-together count. You can add it later.</p>
        </div>
        <button className="btn mt-2" disabled={pending}>{pending ? "Setting up…" : "Continue"}</button>
        {state?.error && <p role="alert" className="text-[var(--danger)]">{state.error}</p>}
      </form>
    </main>
  );
}
