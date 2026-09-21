import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJourney, getVisibleMoments, daysTogether, type PathMarker } from "@/lib/journey";
import { todayISO } from "@/lib/dates";
import HomeView from "@/components/home-view";

export default async function Home() {
  const j = await getJourney();
  if (!j.userId) redirect("/login");
  if (!j.couple) redirect("/start");

  const supabase = await createClient();
  const [{ data }, visible] = await Promise.all([supabase.rpc("get_path"), getVisibleMoments()]);

  return (
    <HomeView
      couple={j.couple}
      me={j.me}
      partner={j.partner}
      markers={(data ?? []) as PathMarker[]}
      moments={new Map(visible.map((m) => [m.id, m]))}
      days={daysTogether(j.couple.together_since)}
      today={todayISO()}
    />
  );
}
