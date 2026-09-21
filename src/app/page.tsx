import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJourney, daysTogether, type PathMarker } from "@/lib/journey";
import { signOut } from "@/app/actions";
import Path from "@/components/path";
import InvitePartner from "@/components/invite-partner";
import MySide from "@/components/my-side";

export default async function Home() {
  const j = await getJourney();
  if (!j.userId) redirect("/login");
  if (!j.couple) redirect("/start");

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_path");
  const markers = (data ?? []) as PathMarker[];
  const days = daysTogether(j.couple.together_since);
  const pen = j.me.pen_style === "dancing" ? "hand-dancing" : "hand-caveat";

  return (
    <main className="mx-auto max-w-xl px-5 pb-24 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`${pen} text-5xl leading-none`}>{j.couple.name ?? "Our path"}</h1>
          {days && (
            <p className="mt-2 text-lg">
              <span className="text-3xl font-extrabold tabular-nums">{days.toLocaleString("en-IN")}</span>{" "}
              <span className="text-ink-soft">days together</span>
            </p>
          )}
        </div>
        <form action={signOut}>
          <button className="btn-quiet text-sm">Sign out</button>
        </form>
      </header>

      <div className="mt-6 flex flex-col gap-4">
        {!j.partner && <InvitePartner />}
        <MySide pen={j.me.pen_style} pin={j.me.pin_color} name={j.me.display_name ?? "you"} />
      </div>

      <div className="mt-10">
        <Path markers={markers} me={j.me} partner={j.partner} since={j.couple.together_since} />
      </div>
    </main>
  );
}
