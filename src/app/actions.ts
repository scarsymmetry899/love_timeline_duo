"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PENS = new Set(["caveat", "dancing"]);
const PINS = new Set(["#F44336", "#FF4081", "#FB8C00", "#7CB342", "#1E88E5", "#7E57C2"]);
const INVITE_CODE = /^[0-9a-f]{18}$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.auth.getClaims();
  return typeof data?.claims?.sub === "string" ? data.claims.sub : null;
}

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export async function createJourney(_: unknown, form: FormData) {
  const supabase = await createClient();
  const name = String(form.get("name") ?? "").trim();
  const myName = String(form.get("my_name") ?? "").trim();
  const since = String(form.get("together_since") ?? "") || null;
  if (!myName) return { error: "Add your name so your partner knows who invited them." };
  if (myName.length > 80 || name.length > 100) return { error: "Please use a shorter name." };
  if (since && !validDate(since)) return { error: "Choose a valid together-since date." };

  const uid = await getUserId(supabase);
  if (!uid) return { error: "Your sign-in expired. Please sign in again." };
  const { error: profileError } = await supabase.from("profiles").update({ display_name: myName }).eq("id", uid);
  if (profileError) return { error: "We couldn’t save your name. Please try again." };

  const { error } = await supabase
    .from("couples")
    .insert({ name: name || null, together_since: since });
  if (error) return { error: error.message };
  redirect("/");
}

export async function createInvite(partnerEmail: string) {
  const supabase = await createClient();
  const uid = await getUserId(supabase);
  const email = partnerEmail.trim().toLowerCase();
  if (!uid) return { error: "Your sign-in expired. Please sign in again." };
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 320) {
    return { error: "Enter your partner’s email address." };
  }
  const { data: member } = await supabase
    .from("couple_members").select("couple_id").eq("user_id", uid).single();
  if (!member) return { error: "Start your journey first." };

  // Reuse an open invite instead of piling up new ones.
  const { data: open } = await supabase
    .from("couple_invites")
    .select("code")
    .eq("couple_id", member.couple_id)
    .eq("intended_email", email)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();
  if (open) return { code: open.code as string };

  const { data, error } = await supabase
    .from("couple_invites")
    .insert({ couple_id: member.couple_id, intended_email: email })
    .select("code")
    .single();
  if (error) return { error: error.message };
  return { code: data.code as string };
}

export async function acceptInvite(code: string, myName: string) {
  const supabase = await createClient();
  const uid = await getUserId(supabase);
  const cleanName = myName.trim();
  if (!uid) return { error: "Your sign-in expired. Please sign in again." };
  if (!INVITE_CODE.test(code)) return { error: "This invite link is invalid." };
  if (!cleanName || cleanName.length > 80) return { error: "Add a name under 80 characters." };

  const { error: profileError } = await supabase.from("profiles").update({ display_name: cleanName }).eq("id", uid);
  if (profileError) return { error: "We couldn’t save your name. Please try again." };

  const { error } = await supabase.rpc("accept_invite", { invite_code: code });
  if (error) return { error: error.message };
  redirect("/");
}

export async function updateMySide(pen: string, pin: string) {
  const supabase = await createClient();
  const uid = await getUserId(supabase);
  if (!uid) return { error: "Your sign-in expired. Please sign in again." };
  if (!PENS.has(pen) || !PINS.has(pin)) return { error: "Choose one of the available styles." };
  const { error } = await supabase
    .from("couple_members").update({ pen_style: pen, pin_color: pin }).eq("user_id", uid);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function voteReveal(momentId: string) {
  const supabase = await createClient();
  const uid = await getUserId(supabase);
  if (!uid) return { error: "Your sign-in expired. Please sign in again." };
  if (!UUID.test(momentId)) return { error: "That moment is invalid." };
  const { data, error } = await supabase.rpc("vote_reveal", { m: momentId });
  if (error) return { error: error.message };
  revalidatePath("/");
  return { revealed: data as boolean };
}
