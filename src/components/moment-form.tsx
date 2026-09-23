"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createMoment } from "@/app/actions";
import { uploadPhotos } from "@/lib/photos";
import { Tape } from "./doodles";
import { ArrowLeftIcon, CameraIcon, CloseIcon, LockIcon, MusicIcon, PinIcon, PlusIcon } from "./icons";

const MAX_PHOTOS = 8;

type Props = { pen: string; pin: string; partnerName: string | null; today: string };

export default function MomentForm({ pen, pin, partnerName, today }: Props) {
  const router = useRouter();
  const penClass = pen === "dancing" ? "hand-dancing" : "hand-caveat";
  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [date, setDate] = useState(today);
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [place, setPlace] = useState("");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const busy = !!status;

  // Release preview URLs when photos are removed or the page closes.
  const urls = useRef<string[]>([]);
  useEffect(() => {
    urls.current = photos.map((p) => p.url);
  }, [photos]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = [...list].filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    const room = MAX_PHOTOS - photos.length;
    if (incoming.length > room) setError(`You can add up to ${MAX_PHOTOS} photos to one memory.`);
    else setError("");
    setPhotos((p) => [...p, ...incoming.slice(0, room).map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  }

  function removePhoto(i: number) {
    setPhotos((p) => {
      URL.revokeObjectURL(p[i].url);
      return p.filter((_, j) => j !== i);
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("Saving your memory…");
    const res = await createMoment({ date, heading, body, place, link, photoCount: photos.length });
    if ("error" in res) {
      setStatus("");
      return setError(res.error ?? "We couldn’t save this memory. Please try again.");
    }
    if (photos.length) {
      setStatus(`Adding photos (0 of ${photos.length})…`);
      const failed = await uploadPhotos(res.coupleId, res.id, photos.map((p) => p.file), (done) =>
        setStatus(`Adding photos (${done} of ${photos.length})…`),
      );
      if (failed) {
        setStatus("");
        setSaved(res.id);
        return setError(
          failed === photos.length
            ? "Your memory is saved, but the photos didn’t upload. Check your connection and try adding them again."
            : `Your memory is saved, but ${failed} of the photos didn’t upload.`,
        );
      }
    }
    setStatus("Pinned to your path");
    router.replace(`/moment/${res.id}?new=1`);
    router.refresh();
  }

  const cover = photos[0]?.url;
  const pickPhotos = () => fileRef.current?.click();
  const prettyDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <form onSubmit={save} className="flex flex-col gap-8 pb-4">
      <header>
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-ink-muted">
          <ArrowLeftIcon /> Back to the path
        </Link>
      </header>

      <div className="text-center">
        <p className={`${penClass} text-3xl`} style={{ color: pin }}>a new page</p>
        <h1 className="text-title">What do you want to keep?</h1>
      </div>

      {/* Live preview: the polaroid this memory becomes on the path. */}
      <section aria-label="Photos" className="flex flex-col items-center">
        <div className="w-[min(78vw,17rem)] -rotate-2">
          <figure className={`polaroid relative ${photos.length > 1 ? "stacked" : ""}`}>
            <Tape i={0} className="tape-top" />
            {cover ? (
              <button type="button" onClick={pickPhotos} disabled={busy || photos.length >= MAX_PHOTOS} className="block w-full" aria-label="Add more photos">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt="" className="aspect-[4/5] w-full bg-sunken object-cover" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
              </button>
            ) : (
              <button
                type="button"
                onClick={pickPhotos}
                disabled={busy}
                className="empty-photo flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 text-ink-muted"
              >
                <CameraIcon className="h-9 w-9" />
                <span className="font-bold text-ink">Add photos</span>
                <span className="text-sm">up to {MAX_PHOTOS}</span>
              </button>
            )}
            <figcaption className="px-1 pb-3 pt-2 text-center">
              <span className={`${penClass} line-clamp-2 block text-[1.6rem] leading-7 ${heading ? "" : "opacity-40"}`}>
                {heading || "your title here"}
              </span>
              <span className="type mt-1 block text-[0.65rem] uppercase text-ink-muted">{prettyDate}</span>
            </figcaption>
          </figure>
        </div>

        {photos.length > 0 && (
          <div className="mt-6 flex max-w-full gap-3 overflow-x-auto px-2 pb-2 pt-2">
            {photos.map((p, i) => (
              <div key={p.url} className="relative flex-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={`Photo ${i + 1}`} className="h-16 w-16 rounded-lg bg-sunken object-cover shadow" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  disabled={busy}
                  className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-paper shadow"
                  aria-label={`Remove photo ${i + 1}`}
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button type="button" onClick={pickPhotos} disabled={busy} className="add-tile grid h-16 w-16 flex-none place-items-center" aria-label="Add more photos">
                <PlusIcon />
              </button>
            )}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </section>

      <div className="flex flex-col gap-2">
        <label htmlFor="heading" className="type text-xs uppercase text-ink-muted">title</label>
        <input
          id="heading"
          className={`field ${penClass} !text-3xl`}
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          maxLength={120}
          placeholder="The night the power went out"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="date" className="type text-xs uppercase text-ink-muted">the day it happened</label>
        <input id="date" type="date" required max={today} className="field" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="body" className="type text-xs uppercase text-ink-muted">the story</label>
        <textarea
          id="body"
          className="notebook notebook-field min-h-56 w-full resize-y"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={5000}
          placeholder="What you did, what you talked about, the little thing you don’t want to forget…"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="place" className="type inline-flex items-center gap-1.5 text-xs uppercase text-ink-muted"><PinIcon className="h-3.5 w-3.5" /> where</label>
          <input id="place" className="field" value={place} onChange={(e) => setPlace(e.target.value)} maxLength={120} placeholder="Marine Drive, Mumbai" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="link" className="type inline-flex items-center gap-1.5 text-xs uppercase text-ink-muted"><MusicIcon className="h-3.5 w-3.5" /> your song</label>
          <input id="link" inputMode="url" className="field" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Paste a Spotify or YouTube link" />
        </div>
      </div>

      <div className="seal-note">
        <span className="wax-seal wax-seal-static wax-seal-sm" style={{ background: pin }} aria-hidden="true">
          <LockIcon className="h-3.5 w-3.5" />
        </span>
        <p className="text-sm leading-relaxed text-ink-muted">
          <span className="font-semibold text-ink">Sealed, just for you.</span>{" "}
          {partnerName ? `${partnerName} will see` : "When your partner joins, they’ll see"} an envelope on the path
          until you both choose to open it.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-2xl border-2 border-[var(--danger)] bg-surface p-4 text-[var(--danger)]">
          <p>{error}</p>
          {saved && <Link className="btn-quiet mt-2" href={`/moment/${saved}`}>Open the memory</Link>}
        </div>
      )}

      <div className="sticky bottom-0 -mx-5 bg-gradient-to-t from-paper via-paper to-transparent px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
        <button className="btn w-full py-4 text-lg" disabled={busy || !!saved}>
          {status || "Pin it to our path"}
        </button>
        <p role="status" className="sr-only">{status}</p>
      </div>
    </form>
  );
}
