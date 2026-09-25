"""Pull every submitted book from the collector down to this PC.

    py pull.py https://rangefolio-collector.<you>.workers.dev  <ADMIN_TOKEN>  [out_dir]

Writes one JSON per submission under out_dir (default: ./books), skipping
ones already downloaded, and prints a one-line summary per tester.
"""
import json, os, sys, urllib.request

def get(url, token):
    r = urllib.request.Request(url, headers={"x-admin": token})
    with urllib.request.urlopen(r, timeout=60) as f:
        return f.read()

def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    base, token = sys.argv[1].rstrip("/"), sys.argv[2]
    out = sys.argv[3] if len(sys.argv) > 3 else "books"
    os.makedirs(out, exist_ok=True)
    keys = json.loads(get(base + "/list", token))["keys"]
    by = {}
    for k in keys:
        name = k["name"]; path = os.path.join(out, name.replace("/", "__") + ".json")
        if not os.path.exists(path):
            open(path, "wb").write(get(base + "/get?k=" + urllib.parse.quote(name, safe=""), token))
        who = name.split("/")[0]; by.setdefault(who, []).append(name)
    for who, names in sorted(by.items()):
        latest = sorted(names)[-1]
        b = json.load(open(os.path.join(out, latest.replace("/", "__") + ".json")))
        book = b.get("book", {})
        taps = sum(1 for r in book.get("runs", []) if r.get("placement"))
        print(f"{who:12s} {len(names):3d} sends  latest {latest.split('/')[1][:19]}  runs {len(book.get('runs', [])):4d}  with taps {taps:4d}  classes {len(book.get('classes', []))}  soon-taps {book.get('meta', {}).get('soon', {})}")
    print(f"\n{len(keys)} submissions from {len(by)} testers in ./{out}")

if __name__ == "__main__":
    import urllib.parse
    main()
