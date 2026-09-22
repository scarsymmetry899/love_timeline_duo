import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EmailCodeSignIn from "@/components/email-code-sign-in";
import SwitchEmailButton from "@/components/switch-email-button";
import JoinForm from "./join-form";

type Preview = {
  couple_name: string | null;
  inviter_name: string | null;
  valid: boolean;
  email_hint?: string | null;
  for_you?: boolean | null;
};

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("invite_preview", { invite_code: code });
  const invite = (data?.[0] ?? null) as Preview | null;
  const { data: claims } = await supabase.auth.getClaims();
  const userId = typeof claims?.claims?.sub === "string" ? claims.claims.sub : null;
  const myEmail = typeof claims?.claims?.email === "string" ? claims.claims.email : null;

  let alreadyOnAPath = false;
  if (userId) {
    const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", userId).maybeSingle();
    alreadyOnAPath = !!member;
  }

  const inviter = invite?.inviter_name ?? "Your partner";
  const here = `/invite/${code}`;

  if (!invite || !invite.valid) {
    return (
      <Shell>
        <h1 className="text-title font-extrabold">This invite has already been used or has expired</h1>
        <p className="mt-3 text-lead text-ink-muted">
          Invite links work once and last 14 days. Ask your partner to create a new one from their path.
        </p>
        <Link href="/login" className="btn-quiet mt-6 self-start">Start your own path instead</Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="polaroid mx-auto mb-10 w-60 rotate-[3deg]" aria-hidden="true">
        <div className="photo-well grid aspect-square place-items-center overflow-hidden bg-sunken p-4 text-center">
          <span className="hand-caveat text-hand-lg [overflow-wrap:anywhere]">you + {invite.inviter_name ?? "them"}</span>
        </div>
        <p className="hand-caveat truncate py-3 text-center text-hand">{invite.couple_name ?? "our path"}</p>
      </div>

      <h1 className="text-title font-extrabold">{inviter} started a path for the two of you</h1>
      <p className="mt-3 text-lead text-ink-muted">
        You’ll each add memories from your own side. Neither of you can read the other’s until you both choose to open them.
      </p>

      {!userId && (
        <div className="panel mt-8">
          <h2 className="text-heading font-extrabold">Sign in to join</h2>
          <p className="mt-2 text-ink-muted">
            {invite.email_hint
              ? <>This invite is for <strong className="text-ink"><bdi>{invite.email_hint}</bdi></strong>. Use that email and we’ll send you a 6-digit code.</>
              : <>Use your email and we’ll send you a 6-digit code.</>}
          </p>
          <div className="mt-5"><EmailCodeSignIn next={here} /></div>
        </div>
      )}

      {userId && invite.for_you === false && (
        <div className="panel mt-8">
          <h2 className="text-heading font-extrabold">This invite was sent to a different email</h2>
          <p className="mt-2 text-ink-muted">
            You’re signed in as {myEmail ?? "another account"}, but {inviter} invited {invite.email_hint ?? "someone else"}. Switch to that email to join. If you’re testing both sides yourself, open this link in a private window instead.
          </p>
          <div className="mt-5"><SwitchEmailButton returnTo={here} /></div>
        </div>
      )}

      {userId && invite.for_you !== false && alreadyOnAPath && (
        <div className="panel mt-8">
          <h2 className="text-heading font-extrabold">You already have a path with this account</h2>
          <p className="mt-2 text-ink-muted">
            Each account belongs to one path. To join {inviter}, sign in with the email they invited instead.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/" className="btn">Go to my path</Link>
            <SwitchEmailButton returnTo={here} quiet />
          </div>
        </div>
      )}

      {userId && invite.for_you !== false && !alreadyOnAPath && <JoinForm code={code} inviter={inviter} />}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-14"><div className="enter flex flex-col">{children}</div></main>;
}
