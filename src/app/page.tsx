import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJourney, daysTogether, type PathMarker } from "@/lib/journey";
import { signOut } from "@/app/actions";
import Path from "@/components/path";
import InvitePartner from "@/components/invite-partner";
import MySide from "@/components/my-side";
import ShareApp from "@/components/share-app";
import { penClass } from "@/lib/pins";

export default async function Home() {
  const j = await getJourney();
  if (!j.userId) redirect("/login");
  if (!j.couple) redirect("/start");

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_path");
  const markers = (data ?? []) as PathMarker[];
  const days = daysTogether(j.couple.together_since);

  return (
    <main className="mx-auto max-w-xl px-5 pb-16 pt-[max(1.75rem,env(safe-area-inset-top))]">
      <header>
        <h1 className={`${penClass(j.me.pen_style)} text-hand-lg`}>{j.couple.name ?? "Our path"}</h1>
        <p className="mt-1 text-ink-muted">
          {days ? (
            <><span className="text-title font-extrabold tabular-nums text-ink">{days.toLocaleString("en-IN")}</span> days together</>
          ) : j.partner ? (
            <>With <span className="font-semibold text-ink">{j.partner.display_name ?? "your partner"}</span></>
          ) : (
            <>Just you so far</>
          )}
        </p>
      </header>

      {!j.partner && (
        <div className="mt-8">
          <InvitePartner />
        </div>
      )}

      <div className="mt-12">
        <Path markers={markers} me={j.me} partner={j.partner} since={j.couple.together_since} />
      </div>

      <div className="mt-16 flex flex-col gap-10 border-t border-rule pt-10">
        <MySide pen={j.me.pen_style} pin={j.me.pin_color} name={j.me.display_name ?? "you"} />
        <ShareApp />
        <form action={signOut} className="flex justify-center">
          <button className="btn-quiet text-caption">Sign out</button>
        </form>
      </div>
    </main>
  );
}
