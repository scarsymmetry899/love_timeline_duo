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

export type Photo = { id: string; url: string; width: number | null; height: number | null };

export type MomentLink = { id: string; url: string; provider: string | null; title: string | null };

export type Moment = {
  id: string;
  author_id: string;
  moment_date: string;
  heading: string | null;
  body: string | null;
  place: string | null;
  revealed_at: string | null;
  photos: Photo[];
  links: MomentLink[];
};

type MediaRow = {
  id: string; kind: string; storage_path: string; display_path: string | null;
  width: number | null; height: number | null; sort: number;
};

const SIGNED_URL_SECONDS = 60 * 60;

/**
 * Moments the signed-in person may read: their own, plus any both have opened.
 * Row-level security decides which rows come back; sealed partner moments never do.
 * Photos come back as short-lived signed URLs from the private bucket.
 */
export async function getVisibleMoments(ids?: string[]): Promise<Moment[]> {
  const supabase = await createClient();
  let query = supabase
    .from("moments")
    .select(
      "id,author_id,moment_date,heading,body,place,revealed_at," +
        "moment_media(id,kind,storage_path,display_path,width,height,sort)," +
        "moment_links(id,url,provider,title)",
    )
    .order("moment_date");
  if (ids) query = query.in("id", ids);
  const { data } = await query;
  const rows = (data ?? []) as unknown as (Omit<Moment, "photos" | "links"> & {
    moment_media: MediaRow[];
    moment_links: MomentLink[];
  })[];

  const media = rows.flatMap((r) =>
    r.moment_media.filter((m) => m.kind === "photo").map((m) => ({ ...m, momentId: r.id, path: m.display_path ?? m.storage_path })),
  );
  const urls = new Map<string, string>();
  if (media.length) {
    const { data: signed } = await supabase.storage
      .from("moments")
      .createSignedUrls(media.map((m) => m.path), SIGNED_URL_SECONDS);
    signed?.forEach((s) => s.signedUrl && s.path && urls.set(s.path, s.signedUrl));
  }

  return rows.map(({ moment_media, moment_links, ...r }) => ({
    ...r,
    photos: moment_media
      .filter((m) => m.kind === "photo")
      .sort((a, b) => a.sort - b.sort)
      .flatMap((m) => {
        const url = urls.get(m.display_path ?? m.storage_path);
        return url ? [{ id: m.id, url, width: m.width, height: m.height }] : [];
      }),
    links: moment_links ?? [],
  }));
}

export function daysTogether(since: string | null) {
  if (!since) return null;
  const start = new Date(since + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1;
}
