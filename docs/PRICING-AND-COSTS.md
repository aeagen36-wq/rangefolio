# Pricing and costs - a first pass

Estimates, September 2026. Everything here should be re-checked against the
providers' current price pages before launch; the shape of the reasoning is
the useful part.

## What it costs to run, per user

**Fixed (the whole app, regardless of users)**

| Item | Cost |
|---|---|
| Apple developer account | $99 / year |
| Google Play developer account | $25 once |
| Domain | ~$12 / year |
| Cloudflare Workers/Pages/KV/R2 | free tier covers the first few thousand users; ~$5/month when it doesn't |
| Auth (Clerk, Supabase Auth, or Cloudflare Access) | free to ~10k monthly users, then ~$25/month |
| Database (Cloudflare D1 or Supabase) | free tier, then ~$5-25/month |
| Error/crash reporting | free tier |

Call it **$150/year + $0-60/month** until there are thousands of users.

**Variable (per active paying user, per month)**

| Item | Estimate | How it's figured |
|---|---|---|
| AI coach (text) | $0.30 - $1.50 | ~8 range days/month, each a coaching read of ~6k tokens in / ~1k out on a mid-tier model (~$3 in / $15 out per million) ≈ $0.25; plus a few follow-up questions. A cheap model for routine reads brings the low end under $0.15. |
| Photo hole detection | $0.05 - $0.40 | ~20 photos/month. A hosted vision model is ~$0.005-0.02 per image; a small self-hosted detector is pennies. |
| Video storage (coach tier) | $0.10 - $1.00 | R2 at ~$0.015/GB-month, no egress fee. 100 MB/user/month is a lot of clips. |
| Sync / storage / requests | < $0.05 | A book is under 1 MB. |
| Payment processing | 2.9% + $0.30 (Stripe, web) or the store cut (below) | |

So a Pro shooter costs roughly **$0.50-2.00/month** to serve; a Coach with
video maybe **$2-4**. Free-tier users cost effectively nothing, which is why
the free tier should stay generous (tracker, book, ballistics) - it's the
funnel and it's free to run.

## The store cut

- Apple and Google both take **30%** of in-app subscriptions, dropping to
  **15%** after a subscriber's first year (Apple) and for developers under
  $1M/year in the small-business programs (both). At your size, plan on 15%.
- **Can it all be through the web?** Mostly, with rules:
  - Android: Google allows external offers in many regions now, with a
    reduced fee rather than none; the "sign up on our website, log in here"
    pattern works fine.
  - iPhone: Apple's rule is that digital goods used in the app must be
    offered through in-app purchase. Since the 2025 US court ruling Apple
    must allow US apps to link out to web checkout without a commission, but
    that is US-only and has been contested; outside the US you either offer
    IAP or you run the Netflix pattern (no signup or purchase in the app at
    all, just a login screen). The Netflix pattern is allowed but hurts
    conversion badly - people expect to tap Subscribe.
  - Practical answer: offer both. IAP in the app for convenience, web
    checkout on the site at the same price or with the annual discount.
    Expect most mobile signups to come through the store and budget the
    15%.
- Re-check this at launch. It is the most-changed rule in the industry.

## A pricing shape that fits the tiers

| Tier | What's in it | Price idea |
|---|---|---|
| Free | Log, book, sessions, stages, ballistics, target taps, backup | $0 |
| Shooter Pro | Review with placement reads, photo scoring, trend charts, AI coach, sync across devices, share runs | **$6.99/month or $49.99/year** |
| Coach | Everything in Pro + class builder, roster (say 25 students, more in a bigger tier), publish classes and events, video review, student trends | **$19.99/month or $179/year** |
| Club / Range (later) | Many coaches, events with join codes, branded | custom |

Why those numbers: Pro at $6.99 nets ~$5.90 after a 15% store cut and
~$6.50 on the web, against a variable cost of $0.50-2.00 - a healthy margin
that pays for the fixed costs at a few hundred subscribers. Coach at $19.99
is cheap against what an instructor charges for one seat in one class; the
value story is organisation and student retention, not the software.
Annual pricing at ~7× monthly is standard and improves cash flow.

Sanity check: **150 Pro + 25 Coach subscribers ≈ $1,400/month gross, ~$1,150
after store cuts, ~$1,000 after variable costs.** That covers fixed costs
many times over; the real cost is your time and the build.

## How to job-cost this (you asked)

Software costing is unit economics, and the trick is to instrument it from
day one so the numbers come from the system, not from guessing:

1. **Log every metered thing per user.** Each AI call records user id,
   model, tokens in, tokens out, and the price at the time. Each photo
   scored, each MB of video stored, each sync - same. One `usage` table.
2. **Monthly, pull the provider invoices** (Cloudflare, the AI provider, R2,
   Stripe, Apple, Google) into one sheet. Divide fixed items by active users;
   variable items come straight from the `usage` table.
3. **Cost per user per tier = fixed ÷ active users + their variable usage.**
   Gross margin per tier = price − store/payment cut − cost per user.
4. **Watch two dashboards:** average AI cost per Pro user (the number most
   likely to run away) and the ratio of free to paid users (the funnel).
5. **Guardrails in the product:** a soft cap on AI calls per day for Pro (say
   30) with a friendly message, so one enthusiastic user can't cost more
   than they pay; photo scoring runs a cheap model first and only escalates
   when confidence is low.

When the backend exists I'll build the `usage` table and a monthly report
with it, so this becomes a page you look at rather than a spreadsheet you
maintain.
