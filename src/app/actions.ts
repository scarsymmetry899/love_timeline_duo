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
  if (!myName) return { error: "Add your name so your partner knows the invite is from you." };
  if (myName.length > 80 || name.length > 100) return { error: "Use a name under 80 characters, and a path name under 100." };
  if (since && !validDate(since)) return { error: "Choose the date you got together, or leave it empty." };

  const uid = await getUserId(supabase);
  if (!uid) return { error: "Your sign-in expired. Please sign in again." };
  const { error: profileError } = await supabase.from("profiles").update({ display_name: myName }).eq("id", uid);
  if (profileError) return { error: "Unable to save your name. Check your connection and try again." };

  const { error } = await supabase
    .from("couples")
    .insert({ name: name || null, together_since: since });
  if (error) return { error: "Unable to start your path. Check your connection and try again." };
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
  if (!member) return { error: "Start your path first, then invite your partner." };

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
  if (error) return { error: "Unable to create the invite. Check your connection and try again." };
  return { code: data.code as string };
}

export async function acceptInvite(code: string, myName: string) {
  const supabase = await createClient();
  const uid = await getUserId(supabase);
  const cleanName = myName.trim();
  if (!uid) return { error: "Your sign-in expired. Please sign in again." };
  if (!INVITE_CODE.test(code)) return { error: "This invite link is incomplete. Open the full link your partner sent." };
  if (!cleanName || cleanName.length > 80) return { error: "Add your name, under 80 characters." };

  const { error: profileError } = await supabase.from("profiles").update({ display_name: cleanName }).eq("id", uid);
  if (profileError) return { error: "Unable to save your name. Check your connection and try again." };

  const { error } = await supabase.rpc("accept_invite", { invite_code: code });
  if (error) return { error: inviteError(error.message) };
  redirect("/");
}

export async function updateMySide(pen: string, pin: string) {
  const supabase = await createClient();
  const uid = await getUserId(supabase);
  if (!uid) return { error: "Your sign-in expired. Please sign in again." };
  if (!PENS.has(pen) || !PINS.has(pin)) return { error: "Choose one of the handwriting and pin options shown." };
  const { error } = await supabase
    .from("couple_members").update({ pen_style: pen, pin_color: pin }).eq("user_id", uid);
  if (error) return { error: "Unable to save your handwriting and pin. Check your connection and try again." };
  revalidatePath("/");
  return { ok: true };
}

function inviteError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("different email")) return "This invite was sent to a different email. Sign in with the address your partner invited.";
  if (m.includes("already used")) return "This invite has already been used. Ask your partner for a new link.";
  if (m.includes("expired")) return "This invite has expired. Ask your partner for a new link.";
  if (m.includes("already part of")) return "This account already has its own path, so it can’t join another one.";
  if (m.includes("two people")) return "This path already has two people on it.";
  if (m.includes("not found")) return "Unable to find this invite. Check that you opened the full link.";
  return "Unable to join this path. Check your connection and try again.";
}

export async function signOutTo(path: string) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(path.startsWith("/") && !path.startsWith("//") ? path : "/login");
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
  if (!UUID.test(momentId)) return { error: "Unable to find this memory. Refresh the page and try again." };
  const { data, error } = await supabase.rpc("vote_reveal", { m: momentId });
  if (error) return { error: "Unable to open this memory right now. Check your connection and try again." };
  revalidatePath("/");
  return { revealed: data as boolean };
}

export type NewMoment = {
  date: string;
  heading: string;
  body: string;
  place: string;
  link: string;
  photoCount: number;
};

function linkProvider(url: URL) {
  const host = url.hostname.replace(/^www\./, "");
  if (host.endsWith("spotify.com")) return "spotify";
  if (host === "youtu.be" || host.endsWith("youtube.com")) return "youtube";
  return "web";
}

// Creates the moment row (and its link). Photos are uploaded straight from the
// browser afterwards, into `couple/moment/…`, which storage policies allow only
// for the moment's author.
export async function createMoment(input: NewMoment) {
  const supabase = await createClient();
  const uid = await getUserId(supabase);
  if (!uid) return { error: "Your sign-in expired. Please sign in again." };

  const heading = input.heading.trim();
  const body = input.body.trim();
  const place = input.place.trim();
  const rawLink = input.link.trim();
  if (!heading && !body && input.photoCount < 1) {
    return { error: "Add a photo, a title or a few words, so there’s something to remember." };
  }
  if (!validDate(input.date) || Date.parse(`${input.date}T00:00:00Z`) > Date.now() + 86_400_000) {
    return { error: "Choose the day this happened. It can’t be in the future." };
  }
  if (heading.length > 120 || place.length > 120) return { error: "Please use a shorter title or place." };
  if (body.length > 5000) return { error: "That story is a little long. Keep it under 5,000 characters." };

  let link: URL | null = null;
  if (rawLink) {
    try {
      link = new URL(/^https?:\/\//i.test(rawLink) ? rawLink : `https://${rawLink}`);
    } catch {
      return { error: "That link doesn’t look right. Paste the full address." };
    }
    if (!["http:", "https:"].includes(link.protocol) || link.href.length > 500) {
      return { error: "That link doesn’t look right. Paste the full address." };
    }
  }

  const { data: member } = await supabase
    .from("couple_members").select("couple_id").eq("user_id", uid).single();
  if (!member) return { error: "Start your path first, then add memories to it." };

  const { data: moment, error } = await supabase
    .from("moments")
    .insert({
      couple_id: member.couple_id,
      moment_date: input.date,
      heading: heading || null,
      body_original: body || null,
      body: body || null,
      place: place || null,
    })
    .select("id")
    .single();
  if (error || !moment) return { error: "Unable to save this memory. Check your connection and try again." };

  if (link) {
    await supabase.from("moment_links").insert({ moment_id: moment.id, url: link.href, provider: linkProvider(link) });
  }
  revalidatePath("/");
  return { id: moment.id as string, coupleId: member.couple_id as string };
}

export async function deleteMoment(momentId: string) {
  const supabase = await createClient();
  const uid = await getUserId(supabase);
  if (!uid) return { error: "Your sign-in expired. Please sign in again." };
  if (!UUID.test(momentId)) return { error: "Unable to find this memory. Refresh the page and try again." };

  const { data: media } = await supabase
    .from("moment_media").select("storage_path,display_path").eq("moment_id", momentId).eq("author_id", uid);
  const paths = (media ?? []).flatMap((m) => [m.storage_path, m.display_path].filter(Boolean) as string[]);
  if (paths.length) await supabase.storage.from("moments").remove(paths);

  const { error, count } = await supabase
    .from("moments").delete({ count: "exact" }).eq("id", momentId).eq("author_id", uid);
  if (error || !count) return { error: "Unable to delete this memory. Check your connection and try again." };
  revalidatePath("/");
  redirect("/");
}

/** Agree to open every sealed memory on the path. It happens when both of you have. */
export async function voteOpenAll() {
  const supabase = await createClient();
  const uid = await getUserId(supabase);
  if (!uid) return { error: "Your sign-in expired. Please sign in again." };
  const { data, error } = await supabase.rpc("vote_open_all");
  if (error) return { error: "Unable to record that right now. Check your connection and try again." };
  revalidatePath("/");
  const row = (data as { both: boolean; opened: number }[] | null)?.[0];
  return { both: !!row?.both, opened: row?.opened ?? 0 };
}

/** Change your mind while you're still waiting for them. */
export async function withdrawOpenAll() {
  const supabase = await createClient();
  const uid = await getUserId(supabase);
  if (!uid) return { error: "Your sign-in expired. Please sign in again." };
  const { error } = await supabase.rpc("withdraw_open_all");
  if (error) return { error: "Unable to change that right now. Check your connection and try again." };
  revalidatePath("/");
  return { ok: true };
}
