"use client";

import { useActionState } from "react";
import { createJourney } from "@/app/actions";

export default function StartForm() {
  const [state, action, pending] = useActionState(createJourney, null);
  return (
    <main className="mx-auto max-w-md px-6 py-14">
      <h1 className="text-4xl font-extrabold tracking-tight">Start your path</h1>
      <p className="mt-2 text-lg text-ink-soft">
        You can invite your partner right after this. Everything you add stays private to you until you both choose to reveal it.
      </p>
      <form action={action} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="my_name" className="font-semibold">Your name</label>
          <input id="my_name" name="my_name" required className="field" placeholder="What your partner calls you" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-semibold">Name this journey</label>
          <input id="name" name="name" className="field hand-caveat !text-2xl" placeholder="Tj & Mira" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="together_since" className="font-semibold">Together since</label>
          <input id="together_since" name="together_since" type="date" className="field" />
          <p className="text-sm text-ink-soft">This starts your days-together counter. You can leave it empty.</p>
        </div>
        <button className="btn mt-2" disabled={pending}>{pending ? "Starting…" : "Start our path"}</button>
        {state?.error && <p role="alert" className="text-[var(--danger)]">{state.error}</p>}
      </form>
    </main>
  );
}
