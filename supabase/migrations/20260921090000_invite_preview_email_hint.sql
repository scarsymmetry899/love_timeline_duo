-- The invite page tells the visitor which email the invite is locked to
-- (masked), and whether the signed-in person is the intended partner.
-- Return type changes, so the function is dropped and recreated.
-- Additive for callers: existing columns keep their names and order.
drop function if exists public.invite_preview(text);

create function public.invite_preview(invite_code text)
returns table (couple_name text, inviter_name text, valid boolean, email_hint text, for_you boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.name,
    p.display_name,
    (i.accepted_at is null and i.expires_at > now()),
    case
      when i.intended_email is null then null
      else left(split_part(i.intended_email, '@', 1), 2) || '•••@' || split_part(i.intended_email, '@', 2)
    end,
    case
      when (select auth.uid()) is null then null
      when i.intended_email is null then true
      else lower(i.intended_email) = (select lower(u.email) from auth.users u where u.id = (select auth.uid()))
    end
  from public.couple_invites i
  join public.couples c on c.id = i.couple_id
  left join public.profiles p on p.id = i.created_by
  where i.code = invite_code;
$$;

revoke execute on function public.invite_preview(text) from public;
grant execute on function public.invite_preview(text) to anon, authenticated, service_role;
