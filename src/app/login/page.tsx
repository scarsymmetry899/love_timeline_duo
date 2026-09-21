"use client";

import { Suspense } from "react";
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

  return (
    <main className="min-h-dvh overflow-hidden pb-14 pt-8 sm:pt-12">
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="hand-caveat text-2xl text-ink-soft">just the two of you</p>
          <h1 className="mt-2 text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">Our Path</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
            A private trail of your relationship. Each of you adds the moments you want to keep, in your own words. Your partner’s memories stay sealed until you both decide to open them.
          </p>
          <a href="#sign-in" className="btn mt-6">Start your path</a>
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

      <section id="sign-in" className="mx-auto mt-10 max-w-6xl scroll-mt-6 px-5 sm:px-8">
        <div className="login-panel max-w-xl">
          <h2 className="text-3xl font-extrabold tracking-tight">
            {joining ? "Sign in to join your partner" : "Sign in or start your path"}
          </h2>
          <p className="mt-2 text-ink-soft">We’ll email you a 6-digit code. No password needed.</p>
          {oldLinkFailed && (
            <p className="mt-4 rounded-2xl bg-paper p-4 text-sm" role="status">
              That sign-in link has expired. We now send a code instead, which works on any device.
            </p>
          )}
          <div className="mt-6">
            <EmailCodeSignIn next={next} />
          </div>
          {!joining && (
            <p className="mt-5 text-sm leading-relaxed text-ink-soft">
              New here? Signing in creates your account and your own path. If your partner has already started one, open the invite link they sent you instead, so you land on your shared path.
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
