# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Skills

Project skills are in `skills/`. Load the relevant one before starting a task:
- `skills/ai-youtube-automation.skill` — automation pipeline (Inngest, YouTube, Gemini, Resend)
- `skills/saas-backend.skill` — auth, DB, API patterns (Clerk, Drizzle, Neon)
- `skills/3d-landing-page.skill` — landing page UI (Framer Motion, React — **not** Three.js/GSAP)

---

## Project Overview

**NewsPulseAI** monitors YouTube channels and delivers AI-written video summaries to users' inboxes every morning at 6am or every 8 hours for any new video posted.

```
User adds YouTube channel
  → Inngest cron fires at 6am UTC
  → Fetch new videos (YouTube Data API v3)
  → Gemini summarizes each video
  → Resend delivers a React Email digest
  → Neon DB records channels, videos, summaries, digests
```

---

## Commands

```bash
npm run dev       # Start dev server (Turbopack)
npm run build     # Production build
npm run start     # Start production server

npx drizzle-kit generate   # Generate SQL migration from schema diff
npx drizzle-kit migrate    # Apply migrations to Neon
npx drizzle-kit studio     # Open visual DB browser

npx eslint .      # Lint (next lint is removed in v16)
npx tsc --noEmit  # Type-check without building
```

---

## Architecture

### What currently exists

**App Layer (`src/app/`)**
- `page.tsx` — home page, composes `<Navbar>` and `<Hero>`
- `layout.tsx` — root layout; fonts are **Space Grotesk** (`--font-sans`) + **Bebas Neue** (`--font-heading`) via `next/font/google`
- `globals.css` — Tailwind v4 via `@import "tailwindcss"`, dark theme (`#000` background), `@theme inline` maps both font CSS variables
- `api/inngest/route.ts` — Inngest webhook endpoint; `functions: []` is currently empty — register functions here when built
- `sign-in/[[...sign-in]]/page.tsx` — Clerk `<SignIn />` component, centered on black background
- `sign-up/[[...sign-up]]/page.tsx` — Clerk `<SignUp />` component, same layout

**Components Layer (`src/components/`)**
- `Navbar.tsx` — fixed glassmorphism pill nav; no state, no `"use client"`
- `navbar.css` — `.nav-pill`, `.nav-cta` (backdrop-filter with `-webkit-` prefix for Safari)
- `Hero.tsx` — `"use client"`; scroll-driven video switcher (4 videos in `public/videos/`), Framer Motion text animation, mute toggle
- `hero.css` — `.hero-heading`, `.sidebar-thumb`, `.sidebar-thumb-active`, `.mute-btn`

**DB Layer (`src/db/`)**
- `index.ts` — exports `db` (Drizzle + Neon HTTP driver); uses `loadEnvConfig` so it works outside Next.js (e.g. in migration scripts)
- `schema.ts` — three tables: `users` (PK: `clerk_id`), `channels` (FK → users, cascade delete), `videos` (FK → channels, `youtube_video_id` UNIQUE for `onConflictDoNothing`)

**Auth / Proxy (`src/proxy.ts`)**
- Clerk middleware exported as `proxy` (Next.js 16 convention); protects all non-static routes

**Inngest Client (`src/inngest/client.ts`)**
- Single shared `Inngest` instance: `new Inngest({ id: 'newspulseai' })`

### Not yet built
- `src/lib/` — YouTube, Gemini, email helpers
- `src/app/(dashboard)/` — protected pages (channels list, add channel, etc.)

---

## Key Patterns

**Auth in Server Components (when auth is added):**
```typescript
import { auth } from '@clerk/nextjs/server'
const { userId } = await auth()
if (!userId) redirect('/sign-in')
```

**DB client (import from `@/db`):**
```typescript
import { db } from '@/db'
import { channels } from '@/db/schema'
// e.g.
const rows = await db.select().from(channels).where(eq(channels.clerkId, userId))
```

**Inngest function (register in `api/inngest/route.ts` functions array):**
```typescript
export const dailyDigest = inngest.createFunction(
  { id: 'daily-digest' },
  { cron: '0 6 * * *' },
  async ({ step }) => {
    const users = await step.run('fetch-users', async () => db.select().from(usersTable))
    // fan-out via step.invoke() per user
  }
)
```

**Email:**
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
await resend.emails.send({ from: process.env.RESEND_FROM_EMAIL, to, react: <DigestTemplate /> })
```

---

## Environment Variables

```bash
DATABASE_URL=                        # Neon pooled connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/channels
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/channels
GEMINI_API_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=                   # e.g. digest@yourdomain.com
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
YOUTUBE_API_KEY=                     # Google Cloud YouTube Data API v3
```

---

## Critical Next.js 16 Differences

- `params` and `searchParams` in page/layout props are now **async** — always `await` them
- `cookies()` and `headers()` are now **async** — always `await` them
- Middleware file is now `proxy.ts` (not `middleware.ts`); export `proxy`, not `middleware`
- `next lint` is removed — use `npx eslint .`
- `serverRuntimeConfig` / `publicRuntimeConfig` removed — use `process.env` directly
- Tailwind 4 has no `tailwind.config.js` — configure via `@theme inline` in CSS
- All parallel route slots require a `default.tsx`
