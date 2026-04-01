1. User adds a YouTube channel → saved to channels table in Neon                                                                            2. Inngest cron fires (6am UTC daily) → triggers the pipeline                                                                             
  3. Fetch new videos → YouTube Data API v3 checks each channel for videos published since last run → insert into videos table using          .onConflictDoNothing() (skips already-seen videos)    
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

  Just make sure all your .env variables are added under Settings → Environment Variables before the first deploy.

❯ ok then for our website no need deploy again this so this url can we used for both inngest and our website link also i'm bit confused     
here .                                                                                                                                      
                                                                                                                                            
● Yes, same URL for both. No separate deployment needed.                                                                                    
                                                                                                                                            
  Your Vercel URL (e.g. https://newspulseai.vercel.app) serves everything:                                                                                                                                                                                                              
  https://newspulseai.vercel.app          → your website (homepage, channels, etc.)                                                           https://newspulseai.vercel.app/api/inngest  → Inngest webhook endpoint                                                                  

  Inngest Cloud just calls the /api/inngest path on your already-deployed app. That's it — one deployment, two purposes.

  Flow:
  6:00 AM UTC
    → Inngest Cloud hits your Vercel URL /api/inngest
    → Your Next.js app runs dailyDigest
    → Emails go out

  So deploy once to Vercel → add env vars → sync that URL in Inngest Cloud → done.