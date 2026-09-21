import { createClient } from "@/lib/supabase/server";

export type Member = {
  user_id: string;
  role: "owner" | "partner";
  pen_style: "caveat" | "dancing";
  pin_color: string;
  display_name: string | null;
};

export type PathMarker = {
  id: string;
  author_id: string;
  moment_date: string;
  is_mine: boolean;
  revealed: boolean;
  i_voted: boolean;
  partner_voted: boolean;
};

export async function getJourney() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  if (!userId) return { userId: null } as const;

  const { data: mine } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!mine) return { userId, couple: null } as const;

  const [{ data: couple }, { data: members }, { data: profiles }] = await Promise.all([
    supabase.from("couples").select("id,name,together_since").eq("id", mine.couple_id).single(),
    supabase.from("couple_members").select("user_id,role,pen_style,pin_color").eq("couple_id", mine.couple_id),
    supabase.from("profiles").select("id,display_name"),
  ]);

  const withNames: Member[] = (members ?? []).map((m) => ({
    ...m,
    display_name: profiles?.find((p) => p.id === m.user_id)?.display_name ?? null,
  })) as Member[];

  return {
    userId,
    couple: couple!,
    me: withNames.find((m) => m.user_id === userId)!,
    partner: withNames.find((m) => m.user_id !== userId) ?? null,
  } as const;
}

export function daysTogether(since: string | null) {
  if (!since) return null;
  const start = new Date(since + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1;
}
