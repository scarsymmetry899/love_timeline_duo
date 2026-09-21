-- =========================================================
-- Journey Path · 0001 foundation
-- Couples, members, invites, moments (private by default),
-- mutual reveal, media, links, shared icon library, storage.
-- =========================================================

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- couples ----------
create table public.couples (
  id uuid primary key default gen_random_uuid(),
  name text,
  together_since date,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.couples enable row level security;

create table public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','partner')),
  pen_style text not null default 'caveat',       -- handwriting font key
  pin_color text not null default '#F44336',
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id)
);
alter table public.couple_members enable row level security;
create unique index one_couple_per_user on public.couple_members(user_id);

-- membership helper (security definer avoids RLS recursion)
create or replace function public.is_member(c uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from couple_members where couple_id = c and user_id = auth.uid());
$$;

-- max two members per couple
create or replace function public.enforce_two_members()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.couple_members where couple_id = new.couple_id) >= 2 then
    raise exception 'This journey already has two people';
  end if;
  return new;
end $$;
create trigger couple_max_two before insert on public.couple_members
  for each row execute function public.enforce_two_members();

-- creator becomes owner automatically
create or replace function public.add_owner_member()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into couple_members (couple_id, user_id, role) values (new.id, new.created_by, 'owner');
  return new;
end $$;
create trigger couple_add_owner after insert on public.couples
  for each row execute function public.add_owner_member();

create policy "members read couple" on public.couples for select using (public.is_member(id) or created_by = auth.uid());
create policy "user creates couple" on public.couples for insert with check (created_by = auth.uid());
create policy "members update couple" on public.couples for update using (public.is_member(id));

create policy "members read members" on public.couple_members for select using (public.is_member(couple_id));
create policy "update own member row" on public.couple_members for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "read own profile or partner" on public.profiles for select using (
  id = auth.uid() or exists (
    select 1 from couple_members a join couple_members b on a.couple_id = b.couple_id
    where a.user_id = auth.uid() and b.user_id = profiles.id));
create policy "update own profile" on public.profiles for update using (id = auth.uid());

-- ---------- invites ----------
create table public.couple_invites (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  code text not null unique default encode(extensions.gen_random_bytes(9), 'hex'),
  created_by uuid not null default auth.uid() references auth.users(id),
  expires_at timestamptz not null default now() + interval '14 days',
  accepted_by uuid references auth.users(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.couple_invites enable row level security;
create policy "members read invites" on public.couple_invites for select using (public.is_member(couple_id));
create policy "members create invites" on public.couple_invites for insert with check (public.is_member(couple_id) and created_by = auth.uid());

create or replace function public.accept_invite(invite_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare inv couple_invites;
begin
  select * into inv from couple_invites where code = invite_code for update;
  if inv is null then raise exception 'Invite not found'; end if;
  if inv.accepted_at is not null then raise exception 'Invite already used'; end if;
  if inv.expires_at < now() then raise exception 'Invite expired'; end if;
  if exists (select 1 from couple_members where user_id = auth.uid()) then
    raise exception 'You are already part of a journey';
  end if;
  insert into couple_members (couple_id, user_id, role, pin_color, pen_style)
    values (inv.couple_id, auth.uid(), 'partner', '#1E88E5', 'dancing');
  update couple_invites set accepted_by = auth.uid(), accepted_at = now() where id = inv.id;
  return inv.couple_id;
end $$;

-- peek at an invite before accepting (couple name + inviter only)
create or replace function public.invite_preview(invite_code text)
returns table (couple_name text, inviter_name text, valid boolean)
language sql stable security definer set search_path = public as $$
  select c.name, p.display_name, (i.accepted_at is null and i.expires_at > now())
  from couple_invites i join couples c on c.id = i.couple_id
  left join profiles p on p.id = i.created_by
  where i.code = invite_code;
$$;

-- ---------- moments (private to author until mutual reveal) ----------
create table public.moments (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid not null default auth.uid() references auth.users(id),
  moment_date date not null default current_date,
  heading text,
  body_original text,          -- exactly what the person typed
  body text,                   -- light grammar-fixed version
  fields jsonb not null default '{}'::jsonb,  -- talked_about, highlights, gifts, unique_things
  place text,
  icons jsonb not null default '[]'::jsonb,   -- [{source:'noto'|'custom', code|slug}]
  terrain_tags text[] not null default '{}',
  revealed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.moments enable row level security;
create index moments_couple_date on public.moments(couple_id, moment_date);

create or replace function public.can_view_moment(m uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from moments where id = m
      and (author_id = auth.uid() or (revealed_at is not null and is_member(couple_id))));
$$;

create policy "author or revealed" on public.moments for select using (
  author_id = auth.uid() or (revealed_at is not null and public.is_member(couple_id)));
create policy "author inserts" on public.moments for insert with check (
  author_id = auth.uid() and public.is_member(couple_id));
create policy "author updates" on public.moments for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "author deletes" on public.moments for delete using (author_id = auth.uid());

-- ---------- mutual reveal ----------
create table public.reveal_votes (
  moment_id uuid not null references public.moments(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (moment_id, user_id)
);
alter table public.reveal_votes enable row level security;
create policy "members read votes" on public.reveal_votes for select using (
  exists (select 1 from moments m where m.id = moment_id and public.is_member(m.couple_id)));
-- The path: every moment in the couple, but only the shape (no content).
create or replace function public.get_path()
returns table (id uuid, author_id uuid, moment_date date, is_mine boolean,
               revealed boolean, i_voted boolean, partner_voted boolean, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select m.id, m.author_id, m.moment_date, m.author_id = auth.uid(), m.revealed_at is not null,
    exists (select 1 from reveal_votes v where v.moment_id = m.id and v.user_id = auth.uid()),
    exists (select 1 from reveal_votes v where v.moment_id = m.id and v.user_id <> auth.uid()),
    m.created_at
  from moments m
  where m.couple_id = (select couple_id from couple_members where user_id = auth.uid())
  order by m.moment_date, m.created_at;
$$;

create or replace function public.vote_reveal(m uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare c uuid; n int;
begin
  select couple_id into c from moments where id = m;
  if c is null or not is_member(c) then raise exception 'Not allowed'; end if;
  insert into reveal_votes (moment_id, user_id) values (m, auth.uid()) on conflict do nothing;
  select count(*) into n from reveal_votes where moment_id = m;
  if n >= 2 then update moments set revealed_at = coalesce(revealed_at, now()) where id = m; return true; end if;
  return false;
end $$;

-- ---------- media & links ----------
create table public.moment_media (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.moments(id) on delete cascade,
  couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid not null default auth.uid() references auth.users(id),
  kind text not null check (kind in ('photo','voice')),
  storage_path text not null,       -- original, untouched
  display_path text,                -- lighter copy, same aspect ratio
  width int, height int,            -- original pixel size → polaroid shape
  duration_ms int,
  taken_at timestamptz,             -- from EXIF
  sort int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.moment_media enable row level security;
create policy "view with moment" on public.moment_media for select using (public.can_view_moment(moment_id));
create policy "author adds media" on public.moment_media for insert with check (
  author_id = auth.uid() and exists (select 1 from moments m where m.id = moment_id and m.author_id = auth.uid()));
create policy "author edits media" on public.moment_media for update using (author_id = auth.uid());
create policy "author removes media" on public.moment_media for delete using (author_id = auth.uid());

create table public.moment_links (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.moments(id) on delete cascade,
  author_id uuid not null default auth.uid() references auth.users(id),
  url text not null,
  provider text,                    -- spotify | youtube | web
  title text, thumbnail_url text,
  created_at timestamptz not null default now()
);
alter table public.moment_links enable row level security;
create policy "view with moment" on public.moment_links for select using (public.can_view_moment(moment_id));
create policy "author adds links" on public.moment_links for insert with check (
  author_id = auth.uid() and exists (select 1 from moments m where m.id = moment_id and m.author_id = auth.uid()));
create policy "author removes links" on public.moment_links for delete using (author_id = auth.uid());

-- ---------- shared icon library ----------
create table public.icons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  source text not null check (source in ('noto','custom')),
  noto_code text,
  svg text,
  concept text,
  tags text[] not null default '{}',
  category text,
  animation text,
  style_version int not null default 1,
  created_at timestamptz not null default now()
);
alter table public.icons enable row level security;
create policy "anyone signed in reads icons" on public.icons for select to authenticated using (true);
create index icons_tags on public.icons using gin(tags);

-- ---------- updated_at ----------
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger moments_touch before update on public.moments for each row execute function public.touch_updated_at();

-- ---------- storage: private bucket, path = couple/moment/file ----------
insert into storage.buckets (id, name, public) values ('moments', 'moments', false)
  on conflict (id) do nothing;

create policy "read media of visible moments" on storage.objects for select to authenticated using (
  bucket_id = 'moments' and public.can_view_moment(((storage.foldername(name))[2])::uuid));
create policy "author uploads to own moment" on storage.objects for insert to authenticated with check (
  bucket_id = 'moments'
  and public.is_member(((storage.foldername(name))[1])::uuid)
  and exists (select 1 from public.moments m
              where m.id = ((storage.foldername(name))[2])::uuid and m.author_id = auth.uid()));
create policy "author deletes own media" on storage.objects for delete to authenticated using (
  bucket_id = 'moments' and owner = auth.uid());
