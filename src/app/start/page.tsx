import { redirect } from "next/navigation";
import { getJourney } from "@/lib/journey";
import StartForm from "./start-form";

export default async function StartPage() {
  const j = await getJourney();
  if (!j.userId) redirect("/login");
  if (j.couple) redirect("/");
  return <StartForm />;
}
