#!/usr/bin/env python3
"""Weekly study-progress summary from the family Google Sheet, for the Sunday brief.

  progress.py brief            this week's study time, days, sets and accuracy per student
  progress.py rows [student]   dump the raw rows

Config: ~/.config/krawchick-study/progress.json  {"endpoint": "<apps script /exec url>", "key": "<report key>", "students": {"noah": "Noah", "julien": "Julien"}}
"""
import json, sys, os, urllib.request, urllib.parse
from datetime import datetime, timedelta, timezone

CFG = os.path.expanduser("~/.config/krawchick-study/progress.json")

def cfg():
    try: return json.load(open(CFG))
    except FileNotFoundError: sys.exit("no config at "+CFG)

def rows(c, student=None):
    q = {"k": c["key"]}
    if student: q["student"] = student
    with urllib.request.urlopen(c["endpoint"]+"?"+urllib.parse.urlencode(q), timeout=30) as r:
        body = r.read().decode()
    if body.strip() == "no": sys.exit("report key rejected")
    out = []
    for r in json.loads(body).get("rows", []):
        try: ts = datetime.fromisoformat(str(r["ts"]).replace("Z","+00:00")).astimezone()
        except Exception: continue
        out.append(dict(r, ts=ts, score=float(r["score"]) if r.get("score") not in ("", None) else None,
                        total=float(r["total"]) if r.get("total") not in ("", None) else None, seconds=float(r.get("seconds") or 0)))
    return sorted(out, key=lambda r: r["ts"])

def brief(c):
    today = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
    mon = today - timedelta(days=today.weekday())
    for key, name in c.get("students", {"noah": "Noah"}).items():
        rs = [r for r in rows(c, name) if r["ts"] >= mon]   # the sheet filter is case-sensitive; pages log the display name
        acts = [r for r in rs if r.get("kind") != "open"]
        days = sorted({r["ts"].date() for r in rs})
        sec = sum(r["seconds"] for r in rs)
        sc = sum(r["score"] for r in acts if r["total"]); tot = sum(r["total"] for r in acts if r["total"])
        print(f"{name} — week of {mon:%b %-d}")
        if not rs:
            print("  No study activity recorded this week."); continue
        print(f"  {round(sec/60)} min over {len(days)} day(s): {', '.join(d.strftime('%a') for d in days)}")
        print(f"  {len(acts)} sets/quizzes, accuracy {round(sc/tot*100) if tot else 0}%")
        by = {}
        for r in acts: by.setdefault(r.get("title") or r.get("guide"), []).append(r)
        for title, g in by.items():
            s = sum(r["score"] for r in g if r["total"]); t = sum(r["total"] for r in g if r["total"])
            mk = {}
            for r in g:
                for m in str(r.get("mistakes") or "").split(","):
                    m = m.strip()
                    if m: mk[m.split(" ×")[0]] = mk.get(m.split(" ×")[0], 0) + (int(m.split("×")[1]) if "×" in m else 1)
            top = sorted(mk.items(), key=lambda x: -x[1])[:2]
            print(f"    {title}: {len(g)} set(s), {round(s/t*100) if t else 0}%, {round(sum(r['seconds'] for r in g)/60)} min" + (f" — slips: {', '.join(f'{k} ({v})' for k,v in top)}" if top else ""))
        last = rs[-1]["ts"]
        print(f"  Last activity {last:%a %b %-d, %-I:%M %p}")

def main():
    c = cfg(); cmd = sys.argv[1] if len(sys.argv) > 1 else "brief"
    if cmd == "brief": brief(c)
    elif cmd == "rows":
        for r in rows(c, sys.argv[2] if len(sys.argv) > 2 else None): print(r["ts"].strftime("%Y-%m-%d %H:%M"), r.get("student"), r.get("title"), r.get("kind"), r.get("label"), r.get("score"), r.get("total"), int(r["seconds"]))
    else: sys.exit(__doc__)

if __name__ == "__main__": main()
