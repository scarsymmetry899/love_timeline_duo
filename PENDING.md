# Pending

Status as of 21 September 2026.

## Done

- GitHub `main` matches production.
- The Vercel project `love-timeline-duo` is connected to this repo, so every push to `main` deploys to production.
- Supabase migrations are applied. Don't edit or re-run them.

## 1. Partner can't receive sign-in codes (blocking)

Supabase sends sign-in emails through Resend, and Resend has no verified domain. Until it has one, Resend only delivers to the Resend account owner's email. Fix it one of these two ways:

- **Gmail SMTP (free, no domain).**
  1. Turn on 2-Step Verification: https://myaccount.google.com/signinoptions/twosv
  2. Create an app password: https://myaccount.google.com/apppasswords
  3. In Supabase, go to Authentication → Emails → SMTP settings and set host `smtp.gmail.com`, port `465`, your Gmail address as both username and sender, and the app password.
  4. If the app password page says it isn't available, 2-Step Verification is off, the account is in Advanced Protection, or it's a work/school account. Use a separate personal Gmail in that case.
- **Own domain.** Buy a domain (Vercel or any registrar), add it in Resend, add Resend's DNS records, then use that domain as the sender in Supabase's SMTP settings.

After either fix, test sign-in with the partner's email and check that the code arrives. Look in spam too.

## 2. Supabase auth URLs

In Authentication → URL Configuration, check:

- Site URL: `https://love-timeline-duo.vercel.app`
- Redirect URLs include `https://love-timeline-duo.vercel.app/**` and `http://localhost:3000/**`

## 3. Test after onboarding

This hasn't been tested yet. After starting or joining a journey, check:

- The home page shows the journey name, the days-together counter, your side, the path and the share button.
- Before your partner joins, the invite card is visible. Once they join, it disappears.
- Moments on each side stay hidden from the partner until both of you vote to reveal them.
- Sign out and sign back in.

## 4. Security warnings to review (low priority)

The Supabase security check flags `SECURITY DEFINER` functions that can be called through the API: `invite_preview`, which anyone can call without signing in, plus `accept_invite`, `vote_reveal`, `get_path`, `is_member` and `can_view_moment`, which any signed-in user can call. The app uses all of them. Check that each one enforces its own access rules. If you change one, do it in a new migration. Don't edit old migrations, and never disable row-level security.

## Local development

```bash
npm install
cp .env.example .env.local   # or add these values to an existing .env.local
npm run dev                  # http://localhost:3000
```
