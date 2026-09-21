"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const STORIES = [
  {
    image: "https://images.unsplash.com/photo-1758523421735-319d8d86c198?auto=format&fit=crop&w=900&q=80",
    alt: "A couple dancing together while cooking at home",
    caption: "the ordinary magic",
    title: "Save the moments you never want to lose",
    copy: "Tiny rituals, trips, firsts and everything in between—kept together on one living path.",
  },
  {
    image: "https://images.unsplash.com/photo-1518925591184-152905776d4f?auto=format&fit=crop&w=900&q=80",
    alt: "A couple walking hand in hand by the sea",
    caption: "your side · their side",
    title: "Write privately, side by side",
    copy: "Each of you adds memories from your own point of view. They stay sealed from one another.",
  },
  {
    image: "https://images.unsplash.com/photo-1588632258523-26242d0a8c2c?auto=format&fit=crop&w=900&q=80",
    alt: "Two people holding hands on a beach",
    caption: "when you are both ready",
    title: "Reveal a memory together",
    copy: "Nothing opens one-sided. A private moment is revealed only after both partners choose it.",
  },
  {
    image: "https://images.unsplash.com/photo-1751486447802-24764d1253b7?auto=format&fit=crop&w=900&q=80",
    alt: "A couple walking together through the ocean",
    caption: "still becoming",
    title: "Watch your shared story keep growing",
    copy: "An endlessly scrolling trail turns days, photos and notes into a path that belongs to just two people.",
  },
];

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
    <main className="min-h-dvh overflow-hidden pb-14 pt-8 sm:pt-12">
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="hand-caveat text-2xl text-ink-soft">a love story only two people can open</p>
          <h1 className="mt-2 text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">Our Path</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
            A private, growing timeline where you and your partner collect memories from both sides—and reveal them only when you are both ready.
          </p>
        </div>
      </section>

      <section className="story-viewport mt-8" aria-label="How Our Path works">
        <div className="story-path" aria-hidden="true" />
        <div className="story-track">
          {[...STORIES, ...STORIES].map((story, index) => (
            <article className={`story-card story-card-${(index % 4) + 1}`} key={`${story.title}-${index}`} aria-hidden={index >= STORIES.length}>
              <figure className="polaroid story-polaroid">
                <div className="relative aspect-[4/3] overflow-hidden bg-paper-deep">
                  <Image src={story.image} alt={story.alt} fill unoptimized sizes="(max-width: 640px) 70vw, 320px" className="object-cover" />
                </div>
                <figcaption className="hand-caveat py-2 text-center text-xl">{story.caption}</figcaption>
              </figure>
              <h2 className="mt-5 text-xl font-extrabold leading-tight">{story.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{story.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-6xl px-5 sm:px-8">
        <div className="login-panel max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-ink-soft">Begin or return to your path</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Sign in with a private email link</h2>
          <p className="mt-2 text-ink-soft">No password to remember. We will send a one-time link that signs you in safely.</p>

          {state === "sent" ? (
            <div className="mt-6 rounded-2xl bg-paper p-5">
              <p className="font-semibold">Check {email}</p>
              <p className="mt-1 text-ink-soft">Open the sign-in link on this device. It works once and expires in an hour.</p>
              <button className="btn-quiet mt-4" onClick={() => setState("idle")}>Use a different email</button>
            </div>
          ) : (
            <form
              className="mt-6 flex flex-col gap-3"
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
                {state === "sending" ? "Sending your private link…" : "Email me a private sign-in link"}
              </button>
              <p className="text-center text-xs leading-relaxed text-ink-soft">New here? The same link creates your account. Your timeline stays separate until you deliberately invite your partner.</p>
              {(state === "error" || linkError) && (
                <p className="text-[var(--danger)]" role="alert">
                  {state === "error" ? message : "That sign-in link has expired or was opened in another browser. Send a new one."}
                </p>
              )}
            </form>
          )}
        </div>
      </section>
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
