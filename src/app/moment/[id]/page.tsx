import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJourney, getVisibleMoments, type PathMarker } from "@/lib/journey";
import MomentView from "@/components/moment-view";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function MomentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const [{ id }, { new: isNew }] = await Promise.all([params, searchParams]);
  if (!UUID.test(id)) notFound();

  const j = await getJourney();
  if (!j.userId) redirect("/login");
  if (!j.couple) redirect("/start");

  const supabase = await createClient();
  const [[moment], { data: path }] = await Promise.all([getVisibleMoments([id]), supabase.rpc("get_path")]);
  if (!moment) notFound();

  const mine = moment.author_id === j.userId;
  return (
    <MomentView
      moment={moment}
      mine={mine}
      author={mine ? j.me : j.partner}
      other={mine ? j.partner : j.me}
      marker={((path ?? []) as PathMarker[]).find((m) => m.id === id) ?? null}
      since={j.couple.together_since}
      isNew={!!isNew}
    />
  );
}
