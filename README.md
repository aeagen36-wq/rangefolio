# Rangefolio

Range day, scored honestly. A standalone PWA: drills, sessions, stages,
coaching, a class builder for instructors, photo scoring and a ballistics
solver - on your phone, no account, no server.

**Run it:** serve this folder over HTTPS (or `localhost`) and open `index.html`.
Any static host works (GitHub Pages, Netlify, an S3 bucket). Service workers
need HTTPS, so `file://` won't install as an app.

Local test: `python -m http.server 8080` in this folder, then
http://localhost:8080/index.html. On a phone, open it in Safari/Chrome and
"Add to Home Screen".

Deploying: `DEPLOY.md`. Testers: `TESTERS.md`. Everything else: `HANDOFF.md`
first, then `docs/`.
