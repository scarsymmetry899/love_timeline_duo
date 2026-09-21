-- Partner links are private invitations, not generic referral links.
-- Bind every new invite to the intended partner's email so a forwarded link
-- cannot attach the wrong person to a couple.
alter table public.couple_invites
  add column intended_email text;

alter table public.couple_invites
  add constraint couple_invites_intended_email_length
  check (intended_email is null or length(intended_email) between 3 and 320);

-- Existing links predate email binding. Keep them usable until their existing
-- expiry so this rollout does not unexpectedly revoke a pending invitation.
-- Every invite created by the updated application is email-bound.

create index couple_invites_intended_email_idx
  on public.couple_invites (lower(intended_email));

create or replace function public.accept_invite(invite_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  inv public.couple_invites;
  signed_in_email text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  select lower(email) into signed_in_email
  from auth.users
  where id = (select auth.uid());

  select * into inv
  from public.couple_invites
  where code = invite_code
  for update;

  if inv is null then raise exception 'Invite not found'; end if;
  if inv.accepted_at is not null then raise exception 'Invite already used'; end if;
  if inv.expires_at < now() then raise exception 'Invite expired'; end if;
  if inv.intended_email is not null and lower(inv.intended_email) <> signed_in_email then
    raise exception 'This private invite was sent to a different email address';
  end if;

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

revoke execute on function public.accept_invite(text) from public, anon;
grant execute on function public.accept_invite(text) to authenticated, service_role;
