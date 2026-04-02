1. User adds a YouTube channel → saved to channels table in Neon                                                                            2. Inngest cron fires (6am UTC daily) → triggers the pipeline                                                                             
  3. Fetch new videos → YouTube Data API v3 checks each channel for videos published since last run → insert into videos table using          .onConflictDoNothing() (skips already-seen video)    
  4. Gemini summarises → for each new video, sends transcript/title to Gemini → stores summary back in videos.summary
  5. Resend sends email → builds a React Email digest with all new summaries → delivers to user's inbox
  6. Done → user wakes up to an AI-written inbox digest


  That's the full loop. Next logical step to build: the dashboard UI where users can add/manage YouTube channels.

   1. Webhook (recommended) — Clerk calls your API when a user signs up → you insert into users table immediately. User exists in DB from day   one even before they do anything.
  2. Lazy sync — When the user first visits the dashboard (/channels), your server component checks if they exist in DB, if not inserts them   on the spot.

  For NewsPulseAI, lazy sync is simpler — no webhook setup needed. When the user logs in and lands on the /channels dashboard page, that's
  when we upsert their Clerk ID + email + name into the users table. From that point on they're in Neon and can add channels.

  So to answer your question directly: yes, the user info will appear in Neon once we build the /channels dashboard page — that's where the
  sync happens.


Leave the root directory blank (empty) in Vercel.                                                                                         
                                                                                                                                            
  Your package.json and next.config.ts are at the repo root (newspulseai/), so Vercel auto-detects it as a Next.js app with no subdirectory
  needed.                                                                                                                                      
  Vercel will automatically set:                                                                                                              - Framework Preset: Next.js                                                                                                             
  - Build Command: npm run build
  - Output Directory: .next
  - Install Command: npm install

 ----------------------------------------------------------------- -------------------------------------------- 

## Features Section — Card Copy

Each feature: Bold Headline | Tech Subtitle | 2-line description | Problem solved

---

### 1. Wake Up to Your Briefing
**AI Morning Digest, Delivered at 6 AM**
Stop scrolling. Every morning your inbox holds a sharp, AI-written summary of everything new from the channels you follow — before your coffee gets cold.
_Problem solved: Hours lost to YouTube rabbit holes just to stay informed._

---

### 2. Never Miss a Drop
**24/7 Automated Channel Monitoring**
NewsPulseAI watches your channels around the clock. The moment a creator drops something new, the pipeline captures it — you never have to manually check again.
_Problem solved: Missing uploads from creators you actually care about._

---

### 3. AI Reads It First
**Gemini-Powered 3-Sentence Summaries**
Google's Gemini AI watches each video and distills it into 3–4 factual sentences. Read the summary, decide if it's worth your hour, skip the rest.
_Problem solved: Watching full videos just to know if they matter to you._

---

### 4. Your Feed. Your Rules.
**Zero Algorithm. Zero Noise.**
You choose exactly which channels to track. No recommendations, no trending, no autoplay traps — just the creators you deliberately chose, nothing more.
_Problem solved: YouTube's algorithm hijacking your attention with irrelevant content._

---

### 5. One Click. Forever Tracked.
**Add Any Channel in Seconds**
Paste an @handle, a full YouTube URL, or a bare channel ID. NewsPulseAI resolves it instantly and starts monitoring — no setup wizard, no API keys, no friction.
_Problem solved: Complex onboarding and friction when adding sources to follow._

---

### 6. Your Inbox Is Your Dashboard
**Everything Lands in One Place**
No new app to open. No dashboard to check. Your digest arrives in your real inbox — read it, click through to videos you want, archive the rest. Done.
_Problem solved: Content scattered across multiple platforms and apps._

---

### Image Direction per Feature Card

| # | Bold Headline (big text for image)   | Visual Mood                                       |
|---|--------------------------------------|---------------------------------------------------|
| 1 | "Wake Up to Your Briefing"           | Dark bg, email envelope glowing, sunrise gradient |
| 2 | "Never Miss a Drop"                  | Radar/pulse wave scanning YouTube icon            |
| 3 | "AI Reads It First"                  | Gemini spark, video frame → condensed text lines  |
| 4 | "Your Feed. Your Rules."             | Clean grid of channel icons, no algorithm noise   |
| 5 | "One Click. Forever Tracked."        | Single cursor click → channel card appears        |
| 6 | "Your Inbox Is Your Dashboard"       | Inbox icon, digest card inside, emerald accents   |
