# Setting up the data collector on Cloudflare

What it is: a tiny Cloudflare Worker (free tier) with a key-value store.
When a tester taps **Send my data to Drew** in Settings, their book is
posted to it. `collector/pull.py` on titan downloads everything.
Free tier limits (100k requests/day, 1 GB of KV) are far beyond a test round.

## What you do (about 15 minutes)

1. **Make the account.** cloudflare.com → Sign up. Free plan. Verify the
   email. No domain needed.

2. **Install the tools on titan.** You need Node (nodejs.org, LTS, the
   default installer). Then in a terminal in the `Rangefolio PWA\collector`
   folder:
   ```
   npx wrangler login
   ```
   A browser tab opens; click Allow.

3. **Create the store.**
   ```
   npx wrangler kv namespace create BOOKS
   ```
   It prints an `id = "…"`. Open `wrangler.toml` and paste it where it says
   `PASTE_KV_ID_HERE`.

4. **Set the two secrets.** Make up two long random strings (a password
   manager's generator is fine, 30+ characters).
   ```
   npx wrangler secret put APP_KEY
   npx wrangler secret put ADMIN_TOKEN
   ```
   Each asks you to paste the value. APP_KEY is what the app sends; ADMIN_TOKEN
   is what pull.py uses. Keep ADMIN_TOKEN private.

5. **Deploy.**
   ```
   npx wrangler deploy
   ```
   It prints the URL: `https://rangefolio-collector.<something>.workers.dev`.
   Open it in a browser; you should see `{"ok":true,"service":"rangefolio-collector"}`.

6. **Point the app at it.** In `build.js`, set
   `RF_CONFIG = { collect_url: "https://rangefolio-collector.<something>.workers.dev", collect_key: "<the APP_KEY you chose>" }`
   and bump `n` to the next build. Upload `build.js` to GitHub. The **Send my
   data** button stops being coming-soon and starts working.

7. **Pull the data whenever you like.** On titan, in the collector folder:
   ```
   py pull.py https://rangefolio-collector.<something>.workers.dev <ADMIN_TOKEN>
   ```
   Books land in `collector\books\`, one file per send, named by invite code
   and time, and it prints a line per tester.

## Notes

- Testers see a consent card listing exactly what's in the send before it goes.
  Photos are never included.
- The APP_KEY ends up in the app's source, so it stops casual spam, nothing
  more. There is nothing sensitive to protect at this stage.
- When the real backend gets built this Worker becomes its first endpoint;
  nothing here is throwaway.
