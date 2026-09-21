import Link from "next/link";
import Path from "./path";
import InvitePartner from "./invite-partner";
import AccountMenu from "./account-menu";
import ShareApp from "./share-app";
import { Tape } from "./doodles";
import { HeartIcon, PencilIcon } from "./icons";
import type { Member, Moment, PathMarker } from "@/lib/journey";
import { fmtLong, nextMilestone } from "@/lib/dates";

type Props = {
  couple: { name: string | null; together_since: string | null };
  me: Member;
  partner: Member | null;
  markers: PathMarker[];
  moments: Map<string, Moment>;
  days: number | null;
  today: string;
};

export default function HomeView({ couple, me, partner, markers, moments, days, today }: Props) {
  const milestone = days ? nextMilestone(days) : null;
  const pen = me.pen_style === "dancing" ? "hand-dancing" : "hand-caveat";
  const myName = me.display_name ?? "you";
  const partnerName = partner?.display_name ?? null;

  const mineCount = markers.filter((m) => m.is_mine).length;
  const sealedFromThem = markers.filter((m) => !m.is_mine && !m.revealed).length;
  const opened = markers.filter((m) => m.revealed).length;

  return (
    <main className="mx-auto max-w-xl overflow-x-clip px-5 pb-40 pt-[max(1rem,env(safe-area-inset-top))]">
      <nav className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <svg viewBox="0 0 40 24" className="h-6 w-10 text-path" aria-hidden="true">
            <path d="M2 18 C12 2 22 22 38 6" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="5 5" strokeLinecap="round" />
          </svg>
          <span className="hand-caveat text-3xl leading-none">Our Path</span>
        </span>
        <AccountMenu name={myName} pen={me.pen_style} pin={me.pin_color} />
      </nav>

      {/* the cover */}
      <header className="cover fade-up mt-6">
        <Tape i={0} className="tape-corner-l" />
        <Tape i={2} className="tape-corner-r" />

        <div className="flex items-center justify-center gap-2 text-sm font-semibold">
          <span className="name-chip" style={{ ["--c" as string]: me.pin_color }}>{myName}</span>
          <span className="flex flex-1 items-center gap-1 text-[#FF4081]" aria-hidden="true">
            <span className="h-0 flex-1 border-t-[3px] border-dashed border-path" />
            <HeartIcon className="heartbeat h-4 w-4" />
            <span className="h-0 flex-1 border-t-[3px] border-dashed border-path" />
          </span>
          {partner ? (
            <span className="name-chip" style={{ ["--c" as string]: partner.pin_color }}>{partnerName ?? "your partner"}</span>
          ) : (
            <span className="name-chip name-chip-empty">your person</span>
          )}
        </div>

        <h1 className={`${pen} mt-5 text-center text-[clamp(3.2rem,15vw,4.5rem)] leading-[0.9]`}>
          {couple.name ?? "Our path"}
        </h1>

        {days ? (
          <div className="ticket mt-6">
            <div className="ticket-main">
              <p className="type text-[0.68rem] uppercase text-ink-soft">admit two · since {fmtLong(couple.together_since!)}</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="text-6xl font-extrabold leading-none tracking-tight tabular-nums">{days.toLocaleString("en-IN")}</span>
                <span className="hand-caveat text-3xl leading-none">{days === 1 ? "day" : "days"} together</span>
              </p>
            </div>
            <div className="ticket-stub" aria-hidden="true">
              <span className="type">No.</span>
              <span className="type text-lg">{String(days).padStart(4, "0")}</span>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-center text-ink-soft">Every memory you add becomes another stretch of your path.</p>
        )}

        {milestone && (
          <div className="mt-6">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm"><span className="type text-[0.7rem] uppercase text-ink-soft">next stop</span> <span className="hand-caveat text-2xl">{milestone.label}</span></p>
              <p className="text-sm text-ink-soft">{milestone.inDays.toLocaleString("en-IN")} {milestone.inDays === 1 ? "day" : "days"} to go</p>
            </div>
            <div className="mini-trail mt-2" role="img" aria-label={`${Math.round(milestone.progress * 100)}% of the way to ${milestone.label}`}>
              <span className="mini-trail-done" style={{ width: `${Math.max(3, milestone.progress * 100)}%`, ["--c" as string]: me.pin_color }} />
              <span className="mini-trail-you" style={{ left: `${Math.max(3, milestone.progress * 100)}%`, background: me.pin_color }} />
              <span className="mini-trail-flag" />
            </div>
          </div>
        )}

        <dl className="mt-7 grid grid-cols-3 gap-2.5">
          <div className="tag -rotate-2">
            <dt>your memories</dt>
            <dd>{mineCount}</dd>
          </div>
          <div className="tag rotate-1">
            <dt>{partnerName ? `sealed by ${partnerName}` : "sealed by them"}</dt>
            <dd>{sealedFromThem}</dd>
          </div>
          <div className="tag -rotate-1">
            <dt>opened together</dt>
            <dd>{opened}</dd>
          </div>
        </dl>
      </header>

      {!partner && (
        <div className="mt-8">
          <InvitePartner myName={myName} myPin={me.pin_color} />
        </div>
      )}

      {sealedFromThem > 0 && (
        <p className="letter-strip fade-up mt-6">
          <span className="font-semibold">{partnerName ?? "Your partner"} left {sealedFromThem} sealed {sealedFromThem === 1 ? "envelope" : "envelopes"} on the path.</span>{" "}
          <span className="text-ink-soft">Each one opens when you’re both ready.</span>
        </p>
      )}

      <section className="mt-10" aria-label="Your path">
        <Path markers={markers} moments={moments} me={me} partner={partner} since={couple.together_since} days={days} today={today} />
      </section>

      <ShareApp />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <Link href="/moment/new" className="fab pointer-events-auto">
          <PencilIcon /> Add a memory
        </Link>
      </div>
    </main>
  );
}
