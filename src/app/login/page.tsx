"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import EmailCodeSignIn from "@/components/email-code-sign-in";

const STORIES = [
  {
    image: "https://images.unsplash.com/photo-1758523421735-319d8d86c198?auto=format&fit=crop&w=900&q=80",
    alt: "A couple dancing together while cooking at home",
    caption: "the ordinary magic",
    title: "Keep the small things too",
    copy: "The Tuesday dinner, the inside joke, the song in the car. Add a photo and a few lines, and it joins the path.",
  },
  {
    image: "https://images.unsplash.com/photo-1518925591184-152905776d4f?auto=format&fit=crop&w=900&q=80",
    alt: "A couple walking hand in hand by the sea",
    caption: "your side, their side",
    title: "Two sides of one story",
    copy: "You each write from your own memory. Neither of you can read the other’s side yet.",
  },
  {
    image: "https://images.unsplash.com/photo-1588632258523-26242d0a8c2c?auto=format&fit=crop&w=900&q=80",
    alt: "Two people holding hands on a beach",
    caption: "when you’re both ready",
    title: "Open them together",
    copy: "A sealed memory opens only when you both tap reveal. Then you get to see how they remembered it.",
  },
  {
    image: "https://images.unsplash.com/photo-1751486447802-24764d1253b7?auto=format&fit=crop&w=900&q=80",
    alt: "A couple walking together through the ocean",
    caption: "still becoming",
    title: "A path that keeps going",
    copy: "Every moment adds another stretch of trail. Scroll back to day one whenever you like.",
  },
];

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const oldLinkFailed = params.get("error") === "link";
  const joining = next.startsWith("/invite/");
  const [paused, setPaused] = useState(false);

  return (
    <main className="min-h-dvh overflow-hidden pb-16 pt-10 sm:pt-14">
      <section className="mx-auto max-w-6xl px-5 sm:px-8" aria-labelledby="hero-title">
        <p className="hand-caveat text-hand text-ink-muted">just the two of you</p>
        <h1 id="hero-title" className="mt-2 text-display font-extrabold">Our Path</h1>
        <p className="measure mt-4 text-lead text-ink-muted">
          A private trail of your relationship. Each of you adds the moments you want to keep, in your own words. Your partner’s memories stay sealed until you both decide to open them.
        </p>
        <a href="#sign-in" className="btn mt-6">Get started</a>
      </section>

      <section className="story-viewport mt-10" aria-labelledby="stories-title" data-paused={paused}>
        <h2 id="stories-title" className="sr-only">How Our Path works</h2>
        <div className="story-path" aria-hidden="true" />
        <ul className="story-track">
          {[...STORIES, ...STORIES].map((story, index) => (
            <li className={`story-card story-card-${(index % 4) + 1}`} key={`${story.title}-${index}`} aria-hidden={index >= STORIES.length || undefined}>
              <figure className="polaroid">
                <div className="photo-well relative aspect-[4/3] overflow-hidden bg-sunken">
                  <Image src={story.image} alt={story.alt} fill unoptimized sizes="(max-width: 640px) 70vw, 320px" className="object-cover" />
                </div>
                <figcaption className="hand-caveat py-2 text-center text-hand">{story.caption}</figcaption>
              </figure>
              <h3 className="mt-5 text-heading font-extrabold">{story.title}</h3>
              <p className="mt-2 text-caption text-ink-muted">{story.copy}</p>
            </li>
          ))}
        </ul>
      </section>
      <div className="mx-auto flex max-w-6xl justify-end px-5 motion-reduce:hidden sm:px-8">
        <button type="button" className="btn-quiet text-caption" aria-pressed={paused} onClick={() => setPaused((v) => !v)}>
          {paused ? "Play stories" : "Pause stories"}
        </button>
      </div>

      <section id="sign-in" className="mx-auto mt-8 max-w-6xl scroll-mt-6 px-5 sm:px-8" aria-labelledby="sign-in-title">
        <div className="panel max-w-xl">
          <h2 id="sign-in-title" className="text-title font-extrabold">
            {joining ? "Sign in to join your partner" : "Sign in or get started"}
          </h2>
          <p className="mt-2 text-ink-muted">We’ll email you a 6-digit code. No password needed.</p>
          {oldLinkFailed && (
            <p className="mt-4 rounded-2xl bg-sunken p-4 text-caption" role="status">
              That sign-in link has expired. Sign-in now uses a code instead, which works on any device.
            </p>
          )}
          <div className="mt-6">
            <EmailCodeSignIn next={next} />
          </div>
          {!joining && (
            <p className="mt-6 border-t border-rule pt-5 text-caption text-ink-muted">
              New here? Signing in creates your account and your own path. If your partner already started one, open the invite link they sent you instead.
            </p>
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
