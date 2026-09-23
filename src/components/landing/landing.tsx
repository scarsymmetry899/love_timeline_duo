"use client";

import Image from "next/image";
import EmailCodeSignIn from "@/components/email-code-sign-in";
import Path from "@/components/path";
import type { Member, PathMarker } from "@/lib/journey";
import { useScrollActs } from "./use-scroll-acts";
import "./landing.css";

const PHOTO = {
  ocean: "https://images.unsplash.com/photo-1751486447802-24764d1253b7?auto=format&fit=crop&w=1400&q=80",
  kitchen: "https://images.unsplash.com/photo-1758523421735-319d8d86c198?auto=format&fit=crop&w=900&q=80",
  seaWalk: "https://images.unsplash.com/photo-1518925591184-152905776d4f?auto=format&fit=crop&w=1100&q=80",
  hands: "https://images.unsplash.com/photo-1588632258523-26242d0a8c2c?auto=format&fit=crop&w=900&q=80",
};

const SAMPLE_ME: Member = { user_id: "a", role: "owner", pen_style: "caveat", pin_color: "#F44336", display_name: "Tj" };
const SAMPLE_PARTNER: Member = { user_id: "b", role: "partner", pen_style: "dancing", pin_color: "#1E88E5", display_name: "Mira" };
const SAMPLE_MARKERS: PathMarker[] = [
  { id: "sample-1", author_id: "a", moment_date: "2024-01-02", is_mine: true, revealed: true, i_voted: true, partner_voted: true },
  { id: "sample-2", author_id: "b", moment_date: "2024-03-14", is_mine: false, revealed: false, i_voted: false, partner_voted: true },
  { id: "sample-3", author_id: "b", moment_date: "2024-06-20", is_mine: false, revealed: true, i_voted: true, partner_voted: true },
];

const FAQ = [
  { q: "Is it free?", a: "Yes. It’s free for the two of you while we’re building it, and there are no ads." },
  { q: "Who can see what I write?", a: "Only your partner, and only once you both agree to open a memory. There are no public pages and nothing is shared anywhere else." },
  { q: "What if my partner doesn’t join yet?", a: "You can start on your own and invite them whenever you like. Your memories wait for them." },
  { q: "Do I need to install anything?", a: "No. It runs in your phone’s browser, and you can add it to your home screen if you want it to feel like an app." },
  { q: "How do I sign in?", a: "Enter your email and we send you a 6-digit code. No passwords to remember or lose." },
  { q: "Can I change my mind about a memory?", a: "Yes. Anything you added, you can edit or delete at any time." },
];

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
    <>
      <header className="topbar">
        <a href="#sign-in" className="sr-only focus:not-sr-only">Skip to sign in</a>
        <p className="topbar__mark font-display">Our Path</p>
        <a href="#sign-in" className="btn-ghost topbar__cta">Sign in</a>
      </header>
    <main className="landing">
      {/* 1 · Recognition: a layered hero, three planes on paper */}
      <section data-act className="act act--hero" aria-labelledby="hero-title">
        <div className="stage hero-grid">
          <Trail d="M8 100 C 30 70, 20 40, 55 35 S 90 10, 96 -5" />
          <div className="hero-copy">
            <p className="eyebrow">A private scrapbook for two</p>
            <h1 id="hero-title" className="mt-2 text-display">Our&nbsp;Path</h1>
            <p className="measure mt-4 text-lead text-ink-muted">
              Keep the moments you don’t want to forget: photos, a few lines in your own words, a voice note. Everything you add stays sealed on your side until you both choose to open it together.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a href="#sign-in" className="btn">Start your path</a>
              <a href="#how" className="btn-quiet">See how it works</a>
            </div>
            <p className="mt-4 text-caption text-ink-muted">Free for the two of you · No app to install · Sign in with an emailed code</p>
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


      {/* How it works — the plain explanation, right after the hero */}
      <section id="how" className="band" aria-labelledby="how-title">
        <div className="band__inner">
          <p className="eyebrow">How it works</p>
          <h2 id="how-title" className="mt-2 text-title">Three steps, and the rest is yours</h2>
          <ol className="steps mt-10">
            <li className="step panel">
              <span className="step__n" aria-hidden="true">1</span>
              <h3 className="text-heading">Add a memory</h3>
              <p className="mt-2 text-ink-muted">
                A photo, a few lines in your own words, a voice note, the song that was playing, where you were. Anything worth keeping.
              </p>
            </li>
            <li className="step panel">
              <span className="step__n" aria-hidden="true">2</span>
              <h3 className="text-heading">It stays sealed</h3>
              <p className="mt-2 text-ink-muted">
                Your partner sees that you saved something that day, and the date. Not a word of what you wrote, until you’re both ready.
              </p>
            </li>
            <li className="step panel">
              <span className="step__n" aria-hidden="true">3</span>
              <h3 className="text-heading">Open it together</h3>
              <p className="mt-2 text-ink-muted">
                When you both tap reveal, the memory opens on the path and you see how they remembered the very same day.
              </p>
            </li>
          </ol>
          <ul className="chips mt-10" aria-label="What a memory can hold">
            <li className="chip">Photos</li>
            <li className="chip">Notes in your words</li>
            <li className="chip">Voice notes</li>
            <li className="chip">A song link</li>
            <li className="chip">The place</li>
            <li className="chip">The date and day number</li>
          </ul>
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


      {/* The actual product, built from the app's own path component */}
      <section className="band band--sunken" aria-labelledby="product-title">
        <div className="band__inner">
          <p className="eyebrow">Inside your path</p>
          <h2 id="product-title" className="mt-2 text-title">Every memory joins the trail</h2>
          <p className="measure mt-3 text-lead text-ink-muted">
            Your path grows downward in the order things happened, from day one to whatever you added last week. Milestones you haven’t reached yet wait further down the trail.
          </p>
          <div className="preview mt-10">
            <div className="preview__frame">
              <Path markers={SAMPLE_MARKERS} me={SAMPLE_ME} partner={SAMPLE_PARTNER} since="2022-03-17" />
            </div>
            <p className="mt-4 text-caption text-ink-muted">A path with two memories saved, one still sealed, and the next milestone ahead.</p>
          </div>
        </div>
      </section>

      {/* Privacy, stated plainly */}
      <section className="band" aria-labelledby="privacy-title">
        <div className="band__inner">
          <p className="eyebrow">Just the two of you</p>
          <h2 id="privacy-title" className="mt-2 text-title">Nobody else is reading this</h2>
          <ul className="facts mt-8">
            <li className="fact panel"><h3 className="text-heading">Private by default</h3><p className="mt-2 text-ink-muted">A path holds exactly two people. There are no public profiles, no feed, no followers, no ads.</p></li>
            <li className="fact panel"><h3 className="text-heading">Sealed until you both agree</h3><p className="mt-2 text-ink-muted">Your partner’s device is never even sent what you wrote until you both tap reveal. That rule lives in the database, not just the screen.</p></li>
            <li className="fact panel"><h3 className="text-heading">Yours to remove</h3><p className="mt-2 text-ink-muted">Anything you added, you can delete, whenever you want.</p></li>
          </ul>
        </div>
      </section>

      {/* Questions people actually ask */}
      <section className="band band--sunken" aria-labelledby="faq-title">
        <div className="band__inner band__inner--narrow">
          <p className="eyebrow">Questions</p>
          <h2 id="faq-title" className="mt-2 text-title">Before you start</h2>
          <div className="mt-8 flex flex-col gap-3">
            {FAQ.map((f) => (
              <details className="faq panel" key={f.q}>
                <summary className="faq__q">
                  <span>{f.q}</span>
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="faq__chev" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 6l4 4 4-4" /></svg>
                </summary>
                <p className="mt-3 text-ink-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 5 · Commitment: the path keeps going */}
      <section id="sign-in" className="act act--close scroll-mt-24" aria-labelledby="sign-in-title">
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

      <footer className="footer">
        <p className="font-display text-heading">Our Path</p>
        <p className="mt-2 text-caption text-ink-muted">A private scrapbook for two. Free while we’re building it.</p>
        <p className="mt-4 text-caption"><a className="btn-quiet" href="#sign-in">Start your path</a></p>
      </footer>
    </>
  );
}
