import Link from "next/link";
import RevealButton from "./reveal-button";
import DeleteMoment from "./delete-moment";
import { Tape } from "./doodles";
import { ArrowLeftIcon, HeartIcon, LinkIcon, LockIcon } from "./icons";
import type { Member, Moment, PathMarker } from "@/lib/journey";
import { dayNumber, fmtDayMonth, fmtLong } from "@/lib/dates";

const TILTS = ["-rotate-2", "rotate-2", "-rotate-1", "rotate-1"];

type Props = {
  moment: Moment;
  mine: boolean;
  author: Member | null;
  other: Member | null;
  marker: PathMarker | null;
  since: string | null;
  isNew?: boolean;
};

function linkLabel(provider: string | null) {
  if (provider === "spotify") return "Listen on Spotify";
  if (provider === "youtube") return "Watch on YouTube";
  return "Open link";
}

export default function MomentView({ moment, mine, author, other, marker, since, isNew }: Props) {
  const pen = author?.pen_style === "dancing" ? "hand-dancing" : "hand-caveat";
  const day = dayNumber(since, moment.moment_date);
  const year = moment.moment_date.slice(0, 4);

  return (
    <main className="mx-auto max-w-xl overflow-x-clip px-5 pb-24 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <Link href="/" className="inline-flex items-center gap-2 font-semibold text-ink-soft">
        <ArrowLeftIcon /> Back to the path
      </Link>

      {isNew && (
        <p role="status" className="toast fade-up mt-5">
          <Tape i={1} className="tape-top" />
          Pinned to your path. Only you can see it for now.
        </p>
      )}

      {moment.photos.length > 0 && (
        <div className={`photo-strip -mx-5 mt-6 px-5 ${moment.photos.length === 1 ? "justify-center" : ""}`} aria-label="Photos">
          {moment.photos.map((p, i) => (
            <figure key={p.id} className={`polaroid relative flex-none ${TILTS[i % TILTS.length]}`}>
              <Tape i={i} className="tape-top" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={`Photo ${i + 1}${moment.heading ? ` from ${moment.heading}` : ""}`}
                width={p.width ?? undefined}
                height={p.height ?? undefined}
                className="max-h-[62vh] w-auto max-w-[78vw] bg-paper-deep object-contain sm:max-w-md"
              />
              <figcaption className={`${pen} h-10 pt-1 text-center text-xl text-ink-soft`}>
                {moment.photos.length > 1 ? `${i + 1} of ${moment.photos.length}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <article className="relative mt-8">
        <div className="postmark" aria-hidden="true">
          <span className="type text-[0.6rem] uppercase">{fmtDayMonth(moment.moment_date)}</span>
          <span className="type text-xl leading-none">{day ? `day ${day}` : year}</span>
          <span className="type text-[0.6rem] uppercase">{day ? year : "our path"}</span>
        </div>

        <p className="type pr-24 text-xs uppercase text-ink-soft">{fmtLong(moment.moment_date)}</p>
        <h1 className={`${pen} mt-2 pr-20 text-[3.25rem] leading-[0.95]`}>{moment.heading || "A memory"}</h1>
        <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
          <span className="h-3 w-3 rounded-full" style={{ background: author?.pin_color }} />
          written by <span className="font-semibold text-ink">{mine ? "you" : author?.display_name ?? "your partner"}</span>
        </p>

        {moment.place && (
          <p className="luggage-tag mt-5">
            <span className="type text-[0.6rem] uppercase text-ink-soft">where</span>
            <span className="hand-caveat text-2xl leading-none">{moment.place}</span>
          </p>
        )}

        {moment.body && (
          <div className="notebook mt-7">
            <p className="whitespace-pre-wrap">{moment.body}</p>
          </div>
        )}

        {moment.links.length > 0 && (
          <ul className="mt-7 flex flex-col gap-4">
            {moment.links.map((l) =>
              l.provider === "spotify" || l.provider === "youtube" ? (
                <li key={l.id}>
                  <a href={l.url} target="_blank" rel="noreferrer" className="cassette">
                    <span className="cassette-label">
                      <span className="type text-[0.6rem] uppercase text-ink-soft">side a · our song</span>
                      <span className="hand-caveat block truncate text-2xl leading-tight">{l.title || linkLabel(l.provider)}</span>
                    </span>
                    <span className="cassette-window" aria-hidden="true">
                      <span className="reel" /><span className="reel" />
                    </span>
                  </a>
                </li>
              ) : (
                <li key={l.id}>
                  <a href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-polaroid px-4 py-3 font-semibold shadow-sm">
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-paper-deep"><LinkIcon /></span>
                    <span className="min-w-0">
                      <span className="block">{l.title || linkLabel(l.provider)}</span>
                      <span className="block truncate text-sm font-normal text-ink-soft">{new URL(l.url).hostname.replace(/^www\./, "")}</span>
                    </span>
                  </a>
                </li>
              ),
            )}
          </ul>
        )}
      </article>

      {moment.revealed_at ? (
        <section className="opened-stamp mt-10">
          <HeartIcon className="h-6 w-6" />
          <div>
            <p className="type text-xs uppercase">opened together</p>
            <p className="hand-caveat text-2xl leading-none">you both chose to share this</p>
          </div>
        </section>
      ) : (
        <section className="seal-panel mt-10">
          <span className="wax-seal wax-seal-static" style={{ background: author?.pin_color }} aria-hidden="true">
            <LockIcon className="h-4 w-4" />
          </span>
          <p className="hand-caveat text-3xl leading-none">sealed, just for you</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {other
              ? `${other.display_name ?? "Your partner"} sees a sealed envelope on the path. It opens when you’re both ready.`
              : "When your partner joins, they’ll see a sealed envelope here until you both choose to open it."}
          </p>
          {other && marker && (
            <>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
                <span className={`vote-dot ${marker.i_voted ? "on" : ""}`} style={{ ["--c" as string]: author?.pin_color }} />you
                <span className={`vote-dot ml-2 ${marker.partner_voted ? "on" : ""}`} style={{ ["--c" as string]: other.pin_color }} />{other.display_name ?? "them"}
              </div>
              <div className="mt-4 flex justify-center">
                <RevealButton id={moment.id} iVoted={marker.i_voted} partnerVoted={marker.partner_voted} mine otherName={other.display_name} quiet={false} />
              </div>
            </>
          )}
        </section>
      )}

      {mine && (
        <div className="mt-12 text-center">
          <DeleteMoment id={moment.id} />
        </div>
      )}
    </main>
  );
}
