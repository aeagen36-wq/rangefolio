# Putting Rangefolio online (GitHub Pages)

Five minutes, no command line needed.

1. On github.com, click **+ → New repository**. Name it `rangefolio`.
   Public or private doesn't matter for the site (Pages is public either
   way on a free account — the invite code is what keeps testers-only).
   Don't tick "Add a README". Create it.
2. On the empty repo page click **uploading an existing file**. Drag in
   everything from this folder: `index.html`, `engine.js`, `app-more.js`,
   `targets.js`, `build.js`, `sw.js`, `manifest.webmanifest`, `.nojekyll`,
   and the `data/` and `icons/` folders (the `docs/`, `collector/` folders
   and the .md files can come too; harmless).
   Click **Commit changes**.
3. **Settings → Pages**. Under "Build and deployment" set Source to
   **Deploy from a branch**, branch **main**, folder **/ (root)**. Save.
4. Wait a minute, refresh that page. It shows the link:
   `https://<your-username>.github.io/rangefolio/`

That link plus a code from `TESTERS.md` is all a tester needs.

## Updating later

Upload the changed files again (same drag-and-drop, "Add file → Upload
files"). **Every deploy: bump `n` in `build.js`** (4 → 5 …). That one number
drives the offline cache, so phones fetch the new files, reload themselves,
and show "Updated to build 5". Forget it and phones keep the old build.

Files that changed in a build are listed in `data/builds.json`; keep it
current (it's for you, testers only see the number).

A file inside a folder (`data/classes.json`, say) must be uploaded from
inside that folder on GitHub, or it lands at the top level as a duplicate.

## Invite codes

The current codes are in `TESTERS.md`. They're checked in the
browser against hashes in `index.html`, so they keep the app friends-only
but they are not real security — fine for a test round, since nothing is
stored on the server anyway. To add or change codes, ask Claude to
regenerate them; the hashes live in the `OK` list near the top of the
script in `index.html`.
