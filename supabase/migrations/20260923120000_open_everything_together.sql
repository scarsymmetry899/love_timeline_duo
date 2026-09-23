-- Two people keep separate scrapbooks on one path. Besides opening a single
-- memory, they can agree to open everything either of them has written so far.
create table if not exists public.open_all_votes (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (couple_id, user_id)
);
alter table public.open_all_votes enable row level security;

create policy "members read open-all votes" on public.open_all_votes
  for select using (public.is_member(couple_id));

-- Records this person's agreement. When both have agreed, every memory on the
-- path that is still sealed is opened, and the votes are cleared so the next
-- round starts fresh for memories added later.
create or replace function public.vote_open_all()
returns table ("both" boolean, opened integer)
language plpgsql
security definer
set search_path = ''
as $$
declare c uuid; n int; changed int := 0;
begin
  select couple_id into c from public.couple_members where user_id = (select auth.uid());
  if c is null then raise exception 'You are not on a path yet'; end if;

  insert into public.open_all_votes (couple_id, user_id)
  values (c, (select auth.uid()))
  on conflict do nothing;

  select count(*) into n from public.open_all_votes where couple_id = c;
  if n >= 2 then
    with opened as (
      update public.moments set revealed_at = now()
      where couple_id = c and revealed_at is null
      returning 1
    )
    select count(*) into changed from opened;
    delete from public.open_all_votes where couple_id = c;
    return query select true, changed;
  end if;
  return query select false, 0;
end $$;

-- Undo an agreement while you are still waiting for your partner.
create or replace function public.withdraw_open_all()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare c uuid;
begin
  select couple_id into c from public.couple_members where user_id = (select auth.uid());
  if c is null then return false; end if;
  delete from public.open_all_votes where couple_id = c and user_id = (select auth.uid());
  return true;
end $$;

revoke execute on function public.vote_open_all() from anon, public;
revoke execute on function public.withdraw_open_all() from anon, public;
grant execute on function public.vote_open_all() to authenticated;
grant execute on function public.withdraw_open_all() to authenticated;
