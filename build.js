// Rangefolio build stamp. ONE place to bump: change `n` (and the date) on
// every deploy. sw.js reads it for its cache name, the page shows it under
// Settings, and the "updated to build N" notice keys off it.
// The per-build change list lives in data/builds.json (internal; testers
// only ever see the number unless `show_changes` is flipped on).
var RF_BUILD = { n: 4, date: "2026-09-25", show_changes: false };
// Where "Send my data" posts a book. Empty = the button shows a coming-soon
// card. Set it to the collector URL once the Cloudflare Worker is up.
var RF_CONFIG = { collect_url: "", collect_key: "" };
