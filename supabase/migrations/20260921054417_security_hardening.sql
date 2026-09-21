-- Lock down helper functions that exist only to support RLS and storage policies.
-- These remain callable by signed-in users because Postgres evaluates them as
-- part of those policies, but they are no longer exposed to anonymous callers.
revoke execute on function public.is_member(uuid) from public, anon;
revoke execute on function public.can_view_moment(uuid) from public, anon;
grant execute on function public.is_member(uuid) to authenticated, service_role;
grant execute on function public.can_view_moment(uuid) to authenticated, service_role;

-- Every function gets a fixed, empty search path. Relations are schema-qualified
-- so a caller cannot shadow them with objects from another schema.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end
$$;

create or replace function public.is_member(c uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.couple_members
    where couple_id = c and user_id = (select auth.uid())
  );
$$;

create or replace function public.enforce_two_members()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.couple_members where couple_id = new.couple_id) >= 2 then
    raise exception 'This journey already has two people';
  end if;
  return new;
end
$$;

create or replace function public.add_owner_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.couple_members (couple_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end
$$;

create or replace function public.accept_invite(invite_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  inv public.couple_invites;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  select * into inv
  from public.couple_invites
  where code = invite_code
  for update;

  if inv is null then raise exception 'Invite not found'; end if;
  if inv.accepted_at is not null then raise exception 'Invite already used'; end if;
  if inv.expires_at < now() then raise exception 'Invite expired'; end if;

  -- Serialize acceptances across every invite for this couple. Without this
  -- lock, two different invite codes could be accepted concurrently.
  perform 1 from public.couples where id = inv.couple_id for update;

  if exists (
    select 1 from public.couple_members where user_id = (select auth.uid())
  ) then
    raise exception 'You are already part of a journey';
  end if;
  if (select count(*) from public.couple_members where couple_id = inv.couple_id) >= 2 then
    raise exception 'This journey already has two people';
  end if;

  insert into public.couple_members (couple_id, user_id, role, pin_color, pen_style)
  values (inv.couple_id, (select auth.uid()), 'partner', '#1E88E5', 'dancing');

  update public.couple_invites
  set accepted_by = (select auth.uid()), accepted_at = now()
  where id = inv.id;

  return inv.couple_id;
end
$$;

create or replace function public.invite_preview(invite_code text)
returns table (couple_name text, inviter_name text, valid boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select c.name, p.display_name, (i.accepted_at is null and i.expires_at > now())
  from public.couple_invites i
  join public.couples c on c.id = i.couple_id
  left join public.profiles p on p.id = i.created_by
  where i.code = invite_code;
$$;

create or replace function public.can_view_moment(m uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.moments
    where id = m
      and (
        author_id = (select auth.uid())
        or (revealed_at is not null and public.is_member(couple_id))
      )
  );
$$;

create or replace function public.get_path()
returns table (
  id uuid,
  author_id uuid,
  moment_date date,
  is_mine boolean,
  revealed boolean,
  i_voted boolean,
  partner_voted boolean,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    m.id,
    m.author_id,
    m.moment_date,
    m.author_id = (select auth.uid()),
    m.revealed_at is not null,
    exists (
      select 1 from public.reveal_votes v
      where v.moment_id = m.id and v.user_id = (select auth.uid())
    ),
    exists (
      select 1 from public.reveal_votes v
      where v.moment_id = m.id and v.user_id <> (select auth.uid())
    ),
    m.created_at
  from public.moments m
  where m.couple_id = (
    select couple_id
    from public.couple_members
    where user_id = (select auth.uid())
  )
  order by m.moment_date, m.created_at;
$$;

create or replace function public.vote_reveal(m uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  c uuid;
  n int;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  select couple_id into c from public.moments where id = m;
  if c is null or not public.is_member(c) then
    raise exception 'Not allowed';
  end if;

  insert into public.reveal_votes (moment_id, user_id)
  values (m, (select auth.uid()))
  on conflict do nothing;

  select count(*) into n from public.reveal_votes where moment_id = m;
  if n >= 2 then
    update public.moments
    set revealed_at = coalesce(revealed_at, now())
    where id = m;
    return true;
  end if;
  return false;
end
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

-- Keep the public API surface explicit.
revoke execute on function public.accept_invite(text) from public, anon;
revoke execute on function public.get_path() from public, anon;
revoke execute on function public.vote_reveal(uuid) from public, anon;
grant execute on function public.accept_invite(text) to authenticated, service_role;
grant execute on function public.get_path() to authenticated, service_role;
grant execute on function public.vote_reveal(uuid) to authenticated, service_role;

-- Invite previews intentionally remain available to anonymous invite recipients.
revoke execute on function public.invite_preview(text) from public;
grant execute on function public.invite_preview(text) to anon, authenticated, service_role;

-- Constrain the only user-editable presentation settings to supported values.
alter table public.couple_members
  add constraint couple_members_pen_style_check
  check (pen_style in ('caveat', 'dancing'));

alter table public.couple_members
  add constraint couple_members_pin_color_check
  check (pin_color ~ '^#[0-9A-Fa-f]{6}$');
