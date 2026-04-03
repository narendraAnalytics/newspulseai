# NewsPulseAI — Plan Restrictions & Behaviour

---

## FREE PLAN

| Feature | Limit |
|---|---|
| YouTube Channels | **2 max** |
| Daily Email Digest | **1 per calendar month** (not per day) |
| Email Content | Digest + Upgrade CTA section at the bottom |
| Channel delete | Not available (no delete button in UI) |

### Inngest Trigger Behaviour — Free Plan

```
Cron fires every day at 6:00 AM IST (12:30 AM UTC)
  ↓
Is user on free plan?  YES
  ↓
Check last_email_sent_at in DB
  ↓
Already sent this calendar month?
  → YES  →  SKIP — no email sent, log "already received email this month"
  → NO   →  Fetch new videos → summarise → send email + upgrade CTA
             → Update last_email_sent_at = NOW()
```

**Example:**
- April 3 → email sent ✓ → `last_email_sent_at = 2026-04-03`
- April 4 to April 30 → cron fires daily → SKIPPED every day
- May 1 → new calendar month → email sent ✓
- User never upgrades → gets 1 email per month, every month

### Channel Limit Behaviour — Free Plan
- Add 1st channel → ✓ allowed
- Add 2nd channel → ✓ allowed
- Add 3rd channel → ✗ BLOCKED — upgrade modal appears:
  > "You've used all 2 Free plan channels. Upgrade to Plus for up to 10 channels, or go Pro for unlimited."
  > [View Pricing Plans ▶] button → goes to /pricing

---

## PLUS PLAN  ($9/month · $7/month billed annually)

| Feature | Limit |
|---|---|
| YouTube Channels | **10 max** (2 carried over from Free + 8 new) |
| Daily Email Digest | **1 per day** at 6:00 AM IST |
| Email Content | Normal digest — no upgrade CTA |
| Channel delete | Not available |

### Inngest Trigger Behaviour — Plus Plan

```
Cron fires every day at 6:00 AM IST (12:30 AM UTC)
  ↓
Is user on plus plan?  YES
  ↓
NO monthly gate check — always proceeds
  ↓
Fetch new videos from all channels → summarise → send email
→ Update last_email_sent_at = NOW()
```

**Example:**
- Every day at 6 AM IST → email sent if new videos exist ✓

### Channel Limit Behaviour — Plus Plan
- Can add up to 10 channels total
- Add 11th channel → ✗ BLOCKED — upgrade modal appears:
  > "You've used all 10 Plus plan channels. Upgrade to Pro for unlimited channels."
  > [View Pricing Plans ▶] button → goes to /pricing

---

## PRO PLAN  ($19/month · $15/month billed annually)

| Feature | Limit |
|---|---|
| YouTube Channels | **Unlimited** |
| Daily Email Digest | **1 per day** at 6:00 AM IST |
| Email Content | Normal digest — no upgrade CTA |
| Channel delete | Not available |

### Inngest Trigger Behaviour — Pro Plan

```
Cron fires every day at 6:00 AM IST (12:30 AM UTC)
  ↓
Is user on pro plan?  YES
  ↓
NO monthly gate check — always proceeds
  ↓
Fetch new videos from ALL channels → summarise → send email
→ Update last_email_sent_at = NOW()
```

**Example:**
- Every day at 6 AM IST → email sent if new videos exist ✓
- No channel limit — add as many as needed ✓

---

## UPGRADE FLOW

### Free → Plus or Pro
1. User visits /pricing (or clicks "Upgrade ▶" link)
2. Subscribes via Clerk PricingTable (Stripe handles payment)
3. User visits /channels — plan syncs from Clerk → DB (plan = 'plus' or 'pro')
4. From next 6 AM IST cron → daily emails resume with no monthly gate

### Plus → Pro
1. Same as above — visit /pricing → upgrade → visit /channels → synced

> ⚠️ Important: Plan syncs to DB only when user visits /channels after upgrading.
> Until then, Inngest still sees the old plan. After the visit, it corrects from the next cron run.

---

## PLAN STATUS IN NAVBAR

| Plan | Badge colour | Animation |
|---|---|---|
| FREE | Amber/gold | Pulsing dot + glow breathe |
| PLUS | Emerald green | Pulsing dot + glow breathe |
| PRO | Violet/purple | Pulsing dot + glow breathe |

Badge appears next to the logo (left side of navbar), visible on all pages when signed in.

---

## CHANNELS PAGE BANNER

| Plan | Banner |
|---|---|
| FREE | Amber banner: "Free Plan · X/2 channels used" + "Upgrade ▶" link |
| PLUS | Emerald banner: "Plus Plan · X/10 channels used" (+ "Go Pro ▶" only when at limit) |
| PRO | No banner (unlimited) |

---

## INNGEST CRON SCHEDULE (unchanged)

```
30 0 * * *   →   12:30 AM UTC  =  6:00 AM IST   (every day)
```

The cron fires for ALL users every day. The monthly gate logic inside the function controls whether a free user actually gets an email.

---

## DB COLUMNS USED FOR RESTRICTIONS

| Column | Table | Purpose |
|---|---|---|
| `plan` | users | Stores 'free' / 'plus' / 'pro' — synced from Clerk on /channels visit |
| `last_email_sent_at` | users | Timestamp of last email sent — used for free plan monthly gate |
