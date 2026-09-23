import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getJourney, getVisibleMoments, getOpenAllState, daysTogether, type PathMarker } from "@/lib/journey";
import { signOut } from "@/app/actions";
import Path from "@/components/path";
import InvitePartner from "@/components/invite-partner";
import MySide from "@/components/my-side";
import ShareApp from "@/components/share-app";
import OpenAll from "@/components/open-all";
import { penClass, pinDisplay } from "@/lib/pins";

export default async function Home() {
  const j = await getJourney();
  if (!j.userId) redirect("/login");
  if (!j.couple) redirect("/start");

  const supabase = await createClient();
  const [{ data }, visible, openAll] = await Promise.all([
    supabase.rpc("get_path"),
    getVisibleMoments(),
    getOpenAllState(j.couple.id, j.userId),
  ]);
  const markers = (data ?? []) as PathMarker[];
  const moments = new Map(visible.map((m) => [m.id, m]));
  const sealedFromThem = markers.filter((m) => !m.is_mine && !m.revealed).length;
  const sealedFromMe = markers.filter((m) => m.is_mine && !m.revealed).length;
  const days = daysTogether(j.couple.together_since);

  return (
    <main className="mx-auto max-w-5xl px-5 pb-32 lg:pb-16 pt-[max(2rem,env(safe-area-inset-top))] lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-14">
      <div className="lg:sticky lg:top-8 lg:self-start">
      <header>
        <p className="eyebrow">Our path</p>
        <h1 className={`${penClass(j.me.pen_style)} mt-1 text-hand-lg`}>{j.couple.name ?? "Our path"}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {days && (
            <p className="stamp">
              <span className="stamp__value">{days.toLocaleString("en-IN")}</span>
              <span className="stamp__label">days together</span>
            </p>
          )}
          {j.partner ? (
            <p className="tag">
              <span className="pin" style={{ "--pin": pinDisplay(j.partner.pin_color) } as React.CSSProperties} aria-hidden="true" />
              <span className={`${penClass(j.partner.pen_style)} text-xl`}>with {j.partner.display_name ?? "your partner"}</span>
            </p>
          ) : (
            <p className="tag"><span className="text-caption text-ink-muted">just you so far</span></p>
          )}
        </div>
      </header>

      <div className="mt-10 hidden flex-col gap-8 lg:flex">
        <MySide pen={j.me.pen_style} pin={j.me.pin_color} name={j.me.display_name ?? "you"} />
        <ShareApp />
        <form action={signOut} className="flex">
          <button className="btn-quiet text-caption">Sign out</button>
        </form>
      </div>
      </div>

      <div className="lg:min-w-0">
      <div className="mt-8 hidden lg:mt-0 lg:block">
        <Link href="/moment/new" className="btn w-full">Add a memory</Link>
      </div>

      {!j.partner && (
        <div className="mt-8 lg:mt-6">
          <InvitePartner />
        </div>
      )}

      {j.partner && (
        <div className="mt-8 lg:mt-6">
          <OpenAll
            sealedFromThem={sealedFromThem}
            sealedFromMe={sealedFromMe}
            iAgreed={openAll.iAgreed}
            theyAgreed={openAll.theyAgreed}
            partnerName={j.partner.display_name}
          />
        </div>
      )}

      <div className="mt-12 lg:mt-10">
        <Path markers={markers} me={j.me} partner={j.partner} since={j.couple.together_since} moments={moments} />
      </div>

      <hr className="torn mt-14 lg:hidden" />

      <div className="mt-10 flex flex-col gap-10 lg:hidden">
        <MySide pen={j.me.pen_style} pin={j.me.pin_color} name={j.me.display_name ?? "you"} />
        <ShareApp />
        <form action={signOut} className="flex justify-center">
          <button className="btn-quiet text-caption">Sign out</button>
        </form>
      </div>
      </div>

      <div className="add-bar lg:hidden">
        <Link href="/moment/new" className="btn add-bar__btn">Add a memory</Link>
      </div>
    </main>
  );
}
