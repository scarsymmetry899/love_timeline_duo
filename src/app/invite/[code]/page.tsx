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
        <h1 className="text-3xl font-extrabold tracking-tight">This invite has already been used or has expired</h1>
        <p className="mt-2 text-lg text-ink-soft">
          Invite links work once and last 14 days. Ask your partner to create a new one from their path.
        </p>
        <Link href="/login" className="btn-quiet mt-8">Start your own path instead</Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="polaroid mx-auto mb-10 w-60 rotate-[3deg]">
        <div className="grid aspect-square place-items-center bg-paper-deep px-4 text-center">
          <span className="hand-caveat text-5xl leading-tight">you + {invite.inviter_name ?? "them"}</span>
        </div>
        <p className="hand-caveat py-3 text-center text-2xl">{invite.couple_name ?? "our path"}</p>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight">{inviter} started a path for the two of you</h1>
      <p className="mt-2 text-lg text-ink-soft">
        You’ll each add memories from your own side. Neither of you can read the other’s until you both choose to open them.
      </p>

      {!userId && (
        <div className="mt-8">
          <p className="mb-4 rounded-2xl bg-polaroid p-4 text-sm">
            {invite.email_hint
              ? <>This invite is for <strong>{invite.email_hint}</strong>. Sign in with that email to join.</>
              : <>Sign in with your email to join.</>}
          </p>
          <EmailCodeSignIn next={here} />
        </div>
      )}

      {userId && invite.for_you === false && (
        <div className="mt-8 rounded-2xl bg-polaroid p-5">
          <p className="font-semibold">This invite was sent to a different email</p>
          <p className="mt-1 text-ink-soft">
            You’re signed in as {myEmail ?? "another account"}, but {inviter} invited {invite.email_hint ?? "someone else"}. Switch to that email to join. If you’re testing both sides yourself, open this link in a private window instead.
          </p>
          <div className="mt-4"><SwitchEmailButton returnTo={here} /></div>
        </div>
      )}

      {userId && invite.for_you !== false && alreadyOnAPath && (
        <div className="mt-8 rounded-2xl bg-polaroid p-5">
          <p className="font-semibold">You already have a path with this account</p>
          <p className="mt-1 text-ink-soft">
            Each account belongs to one path. To join {inviter}, sign in with the email they invited instead.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
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
  return <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">{children}</main>;
}
