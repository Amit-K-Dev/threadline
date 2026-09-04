# Threadline

One career story, tailored to a job description as a resume + cover letter,
and reused as a LinkedIn post. Built with Next.js 14 (App Router), Tailwind,
and a resilient multi-provider AI layer.

## Run it locally

```bash
npm install
cp .env.example .env.local   # add at least one AI provider key
npm run dev
```

Open http://localhost:3000

## AI providers and fallback

Threadline keeps provider logic in `lib/ai.js`. Every generation tries these
providers sequentially, automatically continuing if a request fails, times
out, returns an invalid response, or is not configured:

1. Gemini (`gemini-2.5-flash`)
2. Groq (`llama-3.3-70b-versatile`)
3. OpenRouter free models: Gemma, Kimi K2, GPT-OSS, DeepSeek R1, then Llama 3.3

Set any combination of these server-only environment variables in `.env.local`:

```bash
GEMINI_API_KEY=
GROQ_API_KEY=
OPENROUTER_API_KEY=
```

When every configured provider is unavailable, the API returns a safe `503`
response and the existing UI displays a retry-friendly error message.

## What's built (MVP)

- Landing page + pricing page
- `/dashboard` with two tools:
  - **Resume tool** — paste a JD + your background → tailored bullets,
    cover letter, match notes (`app/api/tailor-resume/route.js`)
  - **LinkedIn tool** — paste an achievement → a post + hashtags
    (`app/api/generate-post/route.js`)
- A free-tier limit of 2 generations, tracked in `localStorage`
  (`lib/usage.js`) — **not a real paywall**, just an MVP gate.

## What's NOT built yet — do this before charging real money

1. **Auth.** Add NextAuth (or Clerk) so a "free generation" is tied to an
   account, not a browser. Right now clearing localStorage resets the limit.
2. **Stripe.** Wire up Checkout + a webhook:
   - Create a Checkout Session on the "Upgrade" click in `app/pricing/page.js`
   - Handle `checkout.session.completed` in a webhook route to mark the
     user as subscribed in your database
   - Gate `/api/tailor-resume` and `/api/generate-post` on subscription
     status (or remaining free credits) server-side, not just client-side
3. **A database.** Users, subscription status, and usage counts need to
   live somewhere (Postgres via Supabase/Neon is a fast option).
4. **Rate limiting** on the API routes so one user can't exhaust your
   AI-provider quotas.

## Suggested launch sequence

1. Ship the MVP as-is to a small niche community (r/cscareerquestions,
   relevant Discords, LinkedIn itself) to validate people actually want
   tailored output over doing it themselves with ChatGPT.
2. Once a few people ask "how do I pay you" — that's the signal to add
   Stripe. Don't build billing before that signal.
3. Track one metric: generations per returning user. If people come back
   for a second job application, retention (and $/day) follows.

## Deploy

Works out of the box on Vercel. Add at least one of `GEMINI_API_KEY`,
`GROQ_API_KEY`, or `OPENROUTER_API_KEY` in the project's Environment Variables
before deploying.
