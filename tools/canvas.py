#!/usr/bin/env python3
"""Read-only Canvas helper for the family study site.

Uses the parent observer account's token (stored in the macOS Keychain) to read
what the boys have due, what teachers posted, and lesson pages to build guides from.

Config lives OUTSIDE the repo (the site is public): ~/.config/krawchick-study/canvas.json
  {"base_url": "...", "keychain_service": "canvas-observer-token",
   "students": {"noah": {"id": 123, "name": "Noah"}}, "token_expires": "YYYY-MM-DD"}

Usage:
  canvas.py check                       token works? days until it expires
  canvas.py courses [--student S]       active courses (id, short key, name)
  canvas.py upcoming [--days N]         assignments/events due in the next N days (default 14)
  canvas.py missing                     missing submissions (what Canvas marks missing)
  canvas.py announcements [--days N]    announcements from the last N days (default 10)
  canvas.py modules COURSE              modules and their items (pages, files, assignments)
  canvas.py page COURSE SLUG            a lesson page as plain text, with its links listed
  canvas.py pages COURSE [--days N]     lesson pages updated in the last N days (default 21)
  canvas.py files COURSE                course files, newest first
  canvas.py download COURSE FILE_ID [DEST]   download a course file (default: canvas-cache/)
  canvas.py gdoc URL                    a linked Google Doc/Slides as plain text (works for "anyone with the link" docs)
  canvas.py brief                       everything a parent wants on a Sunday night
COURSE is a course id or a word from its name ("math", "social", "ela", "science").
"""
import argparse, datetime as dt, html, json, os, re, subprocess, sys, urllib.parse, urllib.request
from html.parser import HTMLParser

CONFIG = os.path.expanduser("~/.config/krawchick-study/canvas.json")
TODAY = dt.date.today()


def die(msg):
    print(msg, file=sys.stderr); sys.exit(1)


def load_config():
    try:
        with open(CONFIG) as f: return json.load(f)
    except FileNotFoundError:
        die(f"No config at {CONFIG}. See the docstring in tools/canvas.py.")


def token(cfg):
    r = subprocess.run(["security", "find-generic-password", "-s", cfg["keychain_service"], "-w"],
                       capture_output=True, text=True)
    if r.returncode != 0: die("Canvas token not found in Keychain. Run:\n  security add-generic-password -a \"$USER\" -s %s -U -w" % cfg["keychain_service"])
    return r.stdout.strip()


class Api:
    def __init__(self, cfg):
        self.base = cfg["base_url"].rstrip("/") + "/api/v1"
        self.tok = token(cfg)

    def get(self, path, **params):
        """GET with pagination. Lists are followed across Link: next pages."""
        qs = []
        for k, v in params.items():
            if v is None: continue
            if isinstance(v, (list, tuple)):
                qs += [(k if k.endswith("[]") else k + "[]", x) for x in v]
            else: qs.append((k, v))
        qs.append(("per_page", 100))
        url = f"{self.base}{path}?{urllib.parse.urlencode(qs)}"
        out = None
        while url:
            req = urllib.request.Request(url, headers={"Authorization": f"Bearer {self.tok}"})
            try:
                with urllib.request.urlopen(req, timeout=30) as resp:
                    data = json.loads(resp.read().decode()); link = resp.headers.get("Link", "")
            except urllib.error.HTTPError as e:
                body = e.read().decode(errors="replace")[:300]
                die(f"Canvas {e.code} on {path}: {body}")
            if isinstance(data, list):
                out = (out or []) + data
                m = re.search(r'<([^>]+)>;\s*rel="next"', link)
                url = m.group(1) if m else None
            else:
                return data
        return out


# ---------- helpers ----------

def student(cfg, key):
    key = (key or next(iter(cfg["students"]))).lower()
    if key not in cfg["students"]: die(f"Unknown student {key!r}; config has {list(cfg['students'])}")
    return cfg["students"][key]


def local(iso):
    """ISO8601 UTC -> local date/time string, or '' """
    if not iso: return ""
    d = dt.datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone()
    return d.strftime("%a %b %-d %-I:%M%p").replace("AM", "am").replace("PM", "pm")


def when(iso):
    if not iso: return "no due date"
    d = dt.datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone().date()
    n = (d - TODAY).days
    tag = "today" if n == 0 else "tomorrow" if n == 1 else f"in {n} days" if n > 1 else f"{-n} days ago"
    return f"{d.strftime('%a %b %-d')} ({tag})"


def active_courses(api, st):
    cs = api.get("/users/self/courses", enrollment_state="active", include=["observed_users"])
    seen, out = set(), []
    for c in cs:
        if c["id"] in seen: continue
        if any(e.get("type") == "observer" and e.get("associated_user_id") == st["id"] for e in c.get("enrollments", [])):
            seen.add(c["id"]); out.append(c)
    return out


SHORT = [("math", "math"), ("social studies", "social"), ("ela", "ela"), ("science", "science"),
         ("healthful", "health"), ("marketing", "marketing"), ("pulse", "pulse"), ("safety", "safety")]


def short_key(name):
    n = name.lower()
    for needle, key in SHORT:
        if needle in n: return key
    return re.sub(r"[^a-z]", "", n)[:10]


def find_course(api, st, ident):
    cs = active_courses(api, st)
    if ident.isdigit():
        for c in cs:
            if c["id"] == int(ident): return c
        return {"id": int(ident), "name": f"course {ident}"}
    hits = [c for c in cs if ident.lower() in c["name"].lower() or ident.lower() == short_key(c["name"])]
    if len(hits) == 1: return hits[0]
    if not hits: die(f"No course matches {ident!r}. Try: canvas.py courses")
    die("Ambiguous course; matches: " + ", ".join(f"{c['id']} {c['name']}" for c in hits))


class Text(HTMLParser):
    """HTML -> readable text. Keeps list bullets and paragraph breaks, collects links."""
    def __init__(self):
        super().__init__(); self.out = []; self.links = []; self.skip = 0; self.href = None; self.anchor = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("script", "style"): self.skip += 1
        if tag in ("p", "div", "br", "tr", "h1", "h2", "h3", "h4", "table"): self.out.append("\n")
        if tag == "li": self.out.append("\n- ")
        if tag in ("h1", "h2", "h3", "h4"): self.out.append("## ")
        if tag == "a" and a.get("href"): self.href = a["href"]; self.anchor = []
        if tag == "img" and a.get("alt"): self.out.append(f"[image: {a['alt']}]")
        if tag == "iframe" and a.get("src"): self.links.append(("embed", a["src"]))
    def handle_endtag(self, tag):
        if tag in ("script", "style"): self.skip -= 1
        if tag == "a" and self.href:
            self.links.append(("".join(self.anchor).strip() or "link", self.href)); self.href = None
    def handle_data(self, data):
        if self.skip: return
        self.out.append(data)
        if self.href is not None: self.anchor.append(data)
    def text(self):
        t = html.unescape("".join(self.out))
        t = re.sub(r"[ \t\xa0]+", " ", t)
        t = re.sub(r"\n\s*\n+", "\n\n", t)
        return t.strip()


def to_text(body):
    p = Text(); p.feed(body or ""); return p.text(), p.links


def print_page(pg):
    text, links = to_text(pg.get("body"))
    print(f"# {pg['title'].strip()}   (updated {local(pg.get('updated_at'))})\n")
    print(text or "(empty page)")
    if links:
        print("\nLinks:")
        for label, href in links:
            if "instructure-uploads" in href and href.endswith(".js"): continue
            print(f"  - {label}: {href}")


# ---------- commands ----------

def cmd_check(cfg, api, a):
    me = api.get("/users/self")
    exp = dt.date.fromisoformat(cfg["token_expires"]); left = (exp - TODAY).days
    print(f"Token OK as {me['name']} (id {me['id']}). Expires {exp} ({left} days).")
    if left <= 14:
        print("WARNING: generate a new token soon at Account > Settings > New Access Token, then\n"
              f"  security add-generic-password -a \"$USER\" -s {cfg['keychain_service']} -U -w\n"
              f"and update token_expires in {CONFIG}.")
    for key, st in cfg["students"].items():
        obs = api.get("/users/self/observees")
        ok = any(o["id"] == st["id"] for o in obs)
        print(f"Observing {st['name']} ({st['id']}): {'yes' if ok else 'NO - check Account > Observing'}")


def cmd_courses(cfg, api, a):
    st = student(cfg, a.student)
    for c in active_courses(api, st):
        print(f"{c['id']}  {short_key(c['name']):10}  {c['name']}")


def cmd_upcoming(cfg, api, a):
    st = student(cfg, a.student)
    cs = active_courses(api, st)
    codes = [f"course_{c['id']}" for c in cs]
    start, end = TODAY - dt.timedelta(days=1), TODAY + dt.timedelta(days=a.days)
    items = api.get("/planner/items", observed_user_id=st["id"], context_codes=codes,
                    start_date=start.isoformat(), end_date=end.isoformat())
    items.sort(key=lambda i: i.get("plannable_date") or "")
    if not items: print(f"Nothing due in the next {a.days} days."); return
    for i in items:
        pl = i.get("plannable", {}); sub = i.get("submissions") or {}
        state = "submitted" if (isinstance(sub, dict) and sub.get("submitted")) else "missing" if (isinstance(sub, dict) and sub.get("missing")) else ""
        pts = f"{pl['points_possible']:g} pts" if pl.get("points_possible") else ""
        print(f"{when(i.get('plannable_date')):24} {i.get('context_name','')[:34]:34} {pl.get('title','')}  {pts} {state}".rstrip())


def cmd_missing(cfg, api, a):
    st = student(cfg, a.student)
    ms = api.get(f"/users/{st['id']}/missing_submissions", include=["course"])
    if not ms: print("No missing submissions."); return
    for m in ms:
        print(f"{when(m.get('due_at')):24} {(m.get('course') or {}).get('name','')[:34]:34} {m['name']}  {m.get('points_possible') or 0:g} pts")


def cmd_announcements(cfg, api, a):
    st = student(cfg, a.student)
    cs = {c["id"]: c for c in active_courses(api, st)}
    codes = [f"course_{i}" for i in cs]
    start = (TODAY - dt.timedelta(days=a.days)).isoformat()
    anns = api.get("/announcements", context_codes=codes, start_date=start, end_date=(TODAY + dt.timedelta(days=1)).isoformat())
    anns.sort(key=lambda x: x.get("posted_at") or "", reverse=True)
    if not anns: print(f"No announcements in the last {a.days} days."); return
    for an in anns:
        cid = int(an["context_code"].split("_")[1]); cname = cs.get(cid, {}).get("name", an["context_code"])
        text, _ = to_text(an.get("message"))
        print(f"\n[{local(an.get('posted_at'))}] {cname}\n{an['title']}\n{text}")


def cmd_modules(cfg, api, a):
    st = student(cfg, a.student); c = find_course(api, st, a.course)
    print(f"{c['name']} ({c['id']})")
    for m in api.get(f"/courses/{c['id']}/modules", include=["items"]):
        print(f"\n== {m['name']}")
        for it in m.get("items") or []:
            ref = it.get("page_url") or it.get("content_id") or it.get("external_url") or ""
            print(f"   {it['type']:14} {it['title'].strip():50} {ref}")


def cmd_page(cfg, api, a):
    st = student(cfg, a.student); c = find_course(api, st, a.course)
    print_page(api.get(f"/courses/{c['id']}/pages/{a.slug}"))


def cmd_pages(cfg, api, a):
    st = student(cfg, a.student); c = find_course(api, st, a.course)
    since = TODAY - dt.timedelta(days=a.days)
    pgs = api.get(f"/courses/{c['id']}/pages", sort="updated_at", order="desc")
    for p in pgs:
        d = dt.datetime.fromisoformat(p["updated_at"].replace("Z", "+00:00")).date()
        if d < since: continue
        if a.full:
            print_page(api.get(f"/courses/{c['id']}/pages/{p['url']}")); print("\n" + "-" * 60 + "\n")
        else:
            print(f"{d}  {p['url']:55} {p['title'].strip()}")


def cmd_files(cfg, api, a):
    st = student(cfg, a.student); c = find_course(api, st, a.course)
    for f in api.get(f"/courses/{c['id']}/files", sort="updated_at", order="desc"):
        print(f"{f['id']:>10}  {f['size']/1e6:6.1f} MB  {f['updated_at'][:10]}  {f['display_name']}")


def cmd_download(cfg, api, a):
    st = student(cfg, a.student); c = find_course(api, st, a.course)
    f = api.get(f"/courses/{c['id']}/files/{a.file_id}")
    dest = a.dest or os.path.join("canvas-cache", f["display_name"])
    os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
    req = urllib.request.Request(f["url"], headers={"Authorization": f"Bearer {api.tok}"})
    with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as out: out.write(r.read())
    print(f"Saved {dest} ({f['size']/1e6:.1f} MB)")


def cmd_gdoc(cfg, api, a):
    m = re.search(r"docs\.google\.com/(document|presentation|spreadsheets)/d/([\w-]+)", a.url)
    if not m: die("Not a Google Docs/Slides/Sheets link.")
    kind, fid = m.groups()
    fmt = {"document": "txt", "presentation": "txt", "spreadsheets": "csv"}[kind]
    url = f"https://docs.google.com/{kind}/d/{fid}/export?format={fmt}"
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60) as r:
            data = r.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        die(f"Google returned {e.code}; the doc may not be shared with the link. Try the Google Drive connector instead.")
    data = data.lstrip("\ufeff")
    data = re.sub(r"\n\s*\n+", "\n\n", data)
    print(data.strip())


def cmd_brief(cfg, api, a):
    for key, st in cfg["students"].items():
        a.student = key
        print(f"===== {st['name']} =====\n"); print("-- Due in the next 14 days"); a.days = 14; cmd_upcoming(cfg, api, a)
        print("\n-- Missing"); cmd_missing(cfg, api, a)
        print("\n-- Announcements, last 7 days"); a.days = 7; cmd_announcements(cfg, api, a)
        print()
    print("-- Token"); cmd_check(cfg, api, a)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--student", "-s", help="student key from config (default: first)")
    sp = p.add_subparsers(dest="cmd", required=True)
    sp.add_parser("check"); sp.add_parser("courses"); sp.add_parser("missing"); sp.add_parser("brief")
    x = sp.add_parser("upcoming"); x.add_argument("--days", type=int, default=14)
    x = sp.add_parser("announcements"); x.add_argument("--days", type=int, default=10)
    x = sp.add_parser("modules"); x.add_argument("course")
    x = sp.add_parser("page"); x.add_argument("course"); x.add_argument("slug")
    x = sp.add_parser("pages"); x.add_argument("course"); x.add_argument("--days", type=int, default=21); x.add_argument("--full", action="store_true")
    x = sp.add_parser("files"); x.add_argument("course")
    x = sp.add_parser("gdoc"); x.add_argument("url")
    x = sp.add_parser("download"); x.add_argument("course"); x.add_argument("file_id"); x.add_argument("dest", nargs="?")
    a = p.parse_args()
    cfg = load_config()
    if a.cmd == "gdoc": return cmd_gdoc(cfg, None, a)
    api = Api(cfg)
    globals()["cmd_" + a.cmd](cfg, api, a)


if __name__ == "__main__":
    main()
