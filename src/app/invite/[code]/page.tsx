import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import JoinForm from "./join-form";

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("invite_preview", { invite_code: code });
  const invite = data?.[0] as { couple_name: string | null; inviter_name: string | null; valid: boolean } | undefined;
  const { data: claims } = await supabase.auth.getClaims();
  const signedIn = !!claims?.claims;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      {!invite || !invite.valid ? (
        <>
          <h1 className="text-3xl font-extrabold tracking-tight">This invite can’t be used</h1>
          <p className="mt-2 text-lg text-ink-soft">
            It has expired or someone already joined with it. Ask your partner to send a fresh link.
          </p>
        </>
      ) : (
        <>
          <div className="polaroid mx-auto mb-10 w-60 rotate-[3deg]">
            <div className="grid aspect-square place-items-center bg-paper-deep">
              <span className="hand-caveat text-5xl">you + {invite.inviter_name ?? "them"}</span>
            </div>
            <p className="hand-caveat py-3 text-center text-2xl">{invite.couple_name ?? "our path"}</p>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {invite.inviter_name ?? "Your partner"} saved you a spot on the path
          </h1>
          <p className="mt-2 text-lg text-ink-soft">
            You’ll each add memories on your own side. Neither of you sees the other’s until you both choose to reveal.
          </p>
          {signedIn ? (
            <JoinForm code={code} />
          ) : (
            <Link className="btn mt-8" href={`/login?next=/invite/${code}`}>Sign in to join</Link>
          )}
        </>
      )}
    </main>
  );
}
