import { redirect } from "next/navigation";
import { getJourney } from "@/lib/journey";
import { todayISO } from "@/lib/dates";
import MomentForm from "@/components/moment-form";

export default async function NewMomentPage() {
  const j = await getJourney();
  if (!j.userId) redirect("/login");
  if (!j.couple) redirect("/start");

  return (
    <main className="mx-auto max-w-xl px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <MomentForm
        pen={j.me.pen_style}
        pin={j.me.pin_color}
        partnerName={j.partner?.display_name ?? null}
        today={todayISO()}
      />
    </main>
  );
}
