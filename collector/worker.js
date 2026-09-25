/* Rangefolio data collector - a Cloudflare Worker.
   POST /            body: { build, sent, invite, book }   -> stored in KV
   GET  /list        header x-admin: <ADMIN_TOKEN>          -> keys + sizes
   GET  /get?k=KEY   header x-admin: <ADMIN_TOKEN>          -> one submission
   The app sends x-rf-key: <APP_KEY>; it's a speed bump, not security -
   the book holds nothing sensitive and the URL only accepts JSON.
   Bindings (wrangler.toml): KV namespace BOOKS; vars APP_KEY, ADMIN_TOKEN. */
export default {
  async fetch(req, env) {
    const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "content-type,x-rf-key,x-admin" };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(req.url);
    const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "content-type": "application/json" } });
    try {
      if (req.method === "POST" && url.pathname === "/") {
        if (env.APP_KEY && req.headers.get("x-rf-key") !== env.APP_KEY) return json({ ok: false, error: "key" }, 403);
        const text = await req.text();
        if (text.length > 20 * 1024 * 1024) return json({ ok: false, error: "too big" }, 413);
        let b; try { b = JSON.parse(text); } catch { return json({ ok: false, error: "not json" }, 400); }
        if (!b || !b.book || !Array.isArray(b.book.runs)) return json({ ok: false, error: "not a book" }, 400);
        const who = String(b.invite || "anon").slice(0, 12), stamp = new Date().toISOString().replace(/[:.]/g, "-");
        const key = `${who}/${stamp}`;
        await env.BOOKS.put(key, text, { metadata: { runs: b.book.runs.length, build: b.build || null, bytes: text.length } });
        return json({ ok: true, key });
      }
      if (req.method === "GET" && (url.pathname === "/list" || url.pathname === "/get")) {
        if (!env.ADMIN_TOKEN || req.headers.get("x-admin") !== env.ADMIN_TOKEN) return json({ ok: false, error: "admin" }, 403);
        if (url.pathname === "/list") { const out = []; let cursor; do { const l = await env.BOOKS.list({ cursor, limit: 1000 }); out.push(...l.keys); cursor = l.list_complete ? null : l.cursor; } while (cursor); return json({ ok: true, keys: out }); }
        const v = await env.BOOKS.get(url.searchParams.get("k") || ""); return v ? new Response(v, { headers: { ...cors, "content-type": "application/json" } }) : json({ ok: false, error: "no such key" }, 404);
      }
      return json({ ok: true, service: "rangefolio-collector" });
    } catch (e) { return json({ ok: false, error: String(e && e.message || e) }, 500); }
  },
};
