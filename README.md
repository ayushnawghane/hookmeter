# Hookmeter

Is your hook working? A private dashboard (installable PWA) for **@ayush.nawghane.dev**: skip rate per reel, reach, growth over time,
competitor outlier reels and comment-to-DM counts. Next.js 16 (App Router, Cache Components), Bun, Vercel.

Live: https://hookmeter.vercel.app (deploys on every push to `main`).

## Screens
- **Posts**: the latest reel's skip rate against your median, four stat cards, **skip rate by opener** (real
  footage vs AI image or mock-up vs text/counter, tagged per reel on its page), and every post in a sortable
  table with sends and saves per 1,000 reach (sort and filter live in the URL). Tap a post for all its
  metrics, its frame-0 tag and views by day.
- **Growth**: followers, 28-day reach and non-follower reach, from a daily snapshot (needs Upstash Redis).
- **Competitors**: reels from the last 30 days that did 3x or more their own account's median views, from `COMPETITORS`.
- **DMs**: a **Waiting for a DM** queue (keyword comments from the last 8 days the bot hasn't DM'd, with the DM
  text to copy), then DMs and public replies per keyword next to the comments on that reel.
- **Settings**: change the password (show/hide on every password field) and sign out.

## Run locally
```sh
bun install
bun run dev        # http://localhost:3000, log in with APP_PASSWORD from .env.local
```

## Env vars (`.env.local` locally, Project Settings → Environment Variables on Vercel)
| Name | What |
|---|---|
| `IG_ACCESS_TOKEN`, `IG_USER_ID` | same as `~/Documents/Projects/ig-comment-dm/.env` |
| `APP_PASSWORD` | the dashboard password; changing it logs every device out |
| `CRON_SECRET` | Vercel sends it to `/api/cron/snapshot` every day at 03:00 UTC (08:30 IST) |
| `BOT_STATS_URL`, `BOT_STATS_TOKEN` | the bot's `/stats`; the worker needs the same token as `STATS_TOKEN` |
| `COMPETITORS` | comma-separated usernames; only business/creator accounts can be read |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | added by the Upstash integration (`KV_REST_API_*` also work) |

## Deploy
```sh
bunx vercel login
bunx vercel link
bunx vercel env add <NAME> production   # once per var above
bunx vercel deploy --prod
```
Then in the Vercel dashboard: Storage → add Upstash Redis to this project, and redeploy.

## Change the password
Settings (the sliders icon, top right) → Change password. It needs Upstash Redis connected: the new password is
stored there as a salted PBKDF2 hash (`auth:password`), never in plain text, and wins over `APP_PASSWORD`. Every
other device is signed out within 30 seconds; the device you changed it on stays in. Forgot it? Delete the
`auth:password` key in the Upstash console and `APP_PASSWORD` works again.

## Install on the phone
Open the URL in Safari (iPhone) → Share → Add to Home Screen, or Chrome (Android) → Install app.

## Design
Hallmark (custom, from a Fireart Dribbble reference the user picked): grey-green ground, white cards, a forest
spotlight card with a lime signal, a floating forest tab bar on phones. Tokens in `app/tokens.css`; the stamp at
the top of `app/globals.css` records the decisions and waivers.
