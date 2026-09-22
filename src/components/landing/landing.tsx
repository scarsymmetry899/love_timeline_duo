"use client";

import Image from "next/image";
import EmailCodeSignIn from "@/components/email-code-sign-in";
import { useScrollActs } from "./use-scroll-acts";
import "./landing.css";

const PHOTO = {
  ocean: "https://images.unsplash.com/photo-1751486447802-24764d1253b7?auto=format&fit=crop&w=1400&q=80",
  kitchen: "https://images.unsplash.com/photo-1758523421735-319d8d86c198?auto=format&fit=crop&w=900&q=80",
  seaWalk: "https://images.unsplash.com/photo-1518925591184-152905776d4f?auto=format&fit=crop&w=1100&q=80",
  hands: "https://images.unsplash.com/photo-1588632258523-26242d0a8c2c?auto=format&fit=crop&w=900&q=80",
};

function Photo({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  return (
    <div className="photo-well relative aspect-[4/3] overflow-hidden bg-sunken">
      <Image src={src} alt={alt} fill unoptimized sizes={sizes} className="object-cover" />
    </div>
  );
}

/** A dashed stretch of the path behind an act, drawn by the reader's scroll. */
function Trail({ d }: { d: string }) {
  return (
    <svg className="act-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path className="act-trail__dash" d={d} />
    </svg>
  );
}

export default function Landing({ next, joining, oldLinkFailed }: { next: string; joining: boolean; oldLinkFailed: boolean }) {
  useScrollActs();

  return (
    <main className="landing">
      {/* 1 · Recognition: a layered hero, three planes on paper */}
      <section data-act className="act act--hero" aria-labelledby="hero-title">
        <div className="stage hero-grid">
          <Trail d="M8 100 C 30 70, 20 40, 55 35 S 90 10, 96 -5" />
          <div className="hero-copy">
            <p className="eyebrow">A private path for two</p>
            <h1 id="hero-title" className="mt-2 text-display">Our&nbsp;Path</h1>
            <p className="measure mt-4 text-lead text-ink-muted">
              A trail of your relationship, written from both sides. Add the moments you want to keep; theirs stay sealed until you open them together.
            </p>
            <a href="#sign-in" className="btn mt-6">Get started</a>
          </div>
          <div className="hero-stack">
            <div className="hero-rear polaroid">
              <Photo src={PHOTO.ocean} alt="A couple walking together into the sea" sizes="(max-width: 960px) 80vw, 560px" />
              <p className="hand-caveat hero-caption">day one</p>
            </div>
            <div className="hero-front polaroid" aria-hidden="true">
              <Photo src={PHOTO.kitchen} alt="" sizes="240px" />
              <p className="hand-caveat hero-caption">day 214</p>
              <span className="tape" />
            </div>
          </div>
          <p className="scroll-hint text-caption text-ink-muted" aria-hidden="true">Scroll to walk the path</p>
        </div>
      </section>

      {/* 2 · Recognition of each other: one day, two captions */}
      <section data-act className="act act--two" aria-labelledby="two-title">
        <div className="stage two-grid">
          <Trail d="M50 -5 C 20 25, 80 45, 50 60 S 30 90, 45 105" />
          <h2 id="two-title" className="two-title text-title">Same day. Two memories.</h2>
          <figure className="two-photo polaroid">
            <Photo src={PHOTO.seaWalk} alt="A couple walking hand in hand along the shore" sizes="(max-width: 960px) 80vw, 460px" />
            <figcaption className="hand-caveat hero-caption">day 412, Gokarna</figcaption>
          </figure>
          <p className="caption-card caption-card--his">
            <span className="eyebrow">Tj remembers</span>
            <span className="hand-caveat caption-card__quote">“the rain ruined everything”</span>
          </p>
          <p className="caption-card caption-card--hers">
            <span className="eyebrow">Mira remembers</span>
            <span className="hand-dancing caption-card__quote">“best day of the whole trip”</span>
          </p>
        </div>
      </section>

      {/* 3 · Curiosity: each side is sealed */}
      <section data-act className="act act--sealed" aria-labelledby="sealed-title">
        <div className="stage sealed-grid">
          <Trail d="M45 -5 C 60 30, 20 50, 60 70 S 70 95, 55 105" />
          <div className="sealed-copy">
            <h2 id="sealed-title" className="text-title">Each side stays sealed</h2>
            <p className="measure mt-4 text-lead text-ink-muted">
              You write what you remember. So do they. Neither of you can read the other’s side until you both decide to.
            </p>
          </div>
          <div className="envelopes" aria-hidden="true">
            <div className="envelope envelope--his"><span className="seal" style={{ background: "#D32F2F" }} /><span className="hand-caveat envelope__label">Tj’s side</span></div>
            <div className="envelope envelope--hers"><span className="seal" style={{ background: "#1565C0" }} /><span className="hand-dancing envelope__label">Mira’s side</span></div>
          </div>
        </div>
      </section>

      {/* 4 · The peak: the reader's scroll opens it */}
      <section data-act className="act act--peak" aria-labelledby="peak-title">
        <div className="stage peak-grid">
          <Trail d="M55 -5 C 40 20, 60 35, 50 55" />
          <p className="peak-kicker hand-caveat text-hand text-ink-muted" aria-hidden="true">keep scrolling to open it</p>
          <div className="letter-slot">
            <div className="letter" aria-hidden="true">
              <div className="letter__back" />
              <div className="letter__photos">
                <div className="polaroid letter__photo letter__photo--a">
                  <Photo src={PHOTO.hands} alt="" sizes="260px" />
                  <p className="hand-caveat letter__caption">“you held my hand the whole way back”</p>
                </div>
                <div className="polaroid letter__photo letter__photo--b">
                  <Photo src={PHOTO.seaWalk} alt="" sizes="260px" />
                  <p className="hand-dancing letter__caption">“I didn’t want the walk to end”</p>
                </div>
              </div>
              <div className="letter__front" />
              <div className="letter__flap letter__flap--open" />
              <div className="letter__flap letter__flap--closed"><span className="seal seal--flap" /></div>
            </div>
          </div>
          <div className="peak-copy">
            <h2 id="peak-title" className="text-title">Opened together</h2>
            <p className="measure mx-auto mt-3 text-lead text-ink-muted">
              When you’re both ready, you each tap reveal. Then you finally get to see how they remembered it.
            </p>
          </div>
        </div>
      </section>

      {/* 5 · Commitment: the path keeps going */}
      <section id="sign-in" className="act act--close scroll-mt-4" aria-labelledby="sign-in-title">
        <ol className="ahead" aria-label="The path ahead">
          <li className="ahead__stop"><span className="hand-caveat text-hand">day 730</span><span className="eyebrow mt-1">two years</span></li>
          <li className="ahead__stop"><span className="hand-caveat text-hand">day 1,000</span><span className="eyebrow mt-1">1,000 days</span></li>
          <li className="ahead__stop"><span className="hand-caveat text-hand">and after</span><span className="eyebrow mt-1">still becoming</span></li>
        </ol>
        <div className="panel mx-auto max-w-xl">
          <h2 id="sign-in-title" className="text-title">
            {joining ? "Sign in to join your partner" : "Start your path"}
          </h2>
          <p className="mt-2 text-ink-muted">We’ll email you a 6-digit code. No password needed.</p>
          {oldLinkFailed && (
            <p className="mt-4 rounded-2xl bg-sunken p-4 text-caption" role="status">
              That sign-in link has expired. Sign-in now uses a code instead, which works on any device.
            </p>
          )}
          <div className="mt-6"><EmailCodeSignIn next={next} /></div>
          {!joining && (
            <p className="mt-6 border-t border-rule pt-5 text-caption text-ink-muted">
              Already have an account? The same code signs you back in. If your partner already started a path, open the invite link they sent you instead.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
