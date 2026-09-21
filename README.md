# Our Path

A private, endlessly scrolling journey for couples. Next.js 16 on Vercel, Supabase for auth, database and storage.

## What's in Step 1

- Email sign-in (magic link)
- Start a journey or join one with a partner's invite link (sent via WhatsApp or copied)
- Hidden sides: each person's moments are private to them; the partner only sees a sealed marker until both vote to reveal. Enforced by Postgres row-level security, not the UI.
- Per-person handwriting font and pin colour
- Days-together counter and the first version of the dashed path

## Setup

1. Push this folder to a new GitHub repo, then import it in Vercel (framework: Next.js). `.env.production` already holds the public Supabase URL and publishable key.
2. In Supabase, open **Authentication → URL Configuration**:
   - Site URL: your Vercel URL, e.g. `https://our-path.vercel.app`
   - Redirect URLs: add `https://our-path.vercel.app/**` and `http://localhost:3000/**`
3. For your partner to receive sign-in emails, add custom SMTP under **Authentication → Emails → SMTP settings** (Resend's free tier works). Supabase's built-in email only delivers to members of your Supabase organisation.

The database schema lives in `supabase/migrations/0001_foundation.sql` and is already applied to the `journey-path` project.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```
