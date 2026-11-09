#!/usr/bin/env python3
"""Independent watchdog for the study site's automation. Runs from launchd on the Mac Studio, outside Claude.

Checks: did the daily Canvas sync run today; did the Sunday brief go out; can we read Canvas; is the
progress sheet reachable; is the Claude app running. Emails Alex (as alex@krawchick.com, via the Apps Script)
when something is wrong, with the fix. Every Monday morning it sends a short status either way, so a dead
watchdog would itself be noticed. Never emails the same problem more than once per 20 hours.

  watchdog.py            normal run (decides what to check from the day and time)
  watchdog.py --dry-run  print findings, send nothing
  watchdog.py --status   force the Monday-style status email now
"""
import json, os, subprocess, sys, time, urllib.request, urllib.parse
from datetime import datetime, timedelta

HOME = os.path.expanduser("~")
CFG_DIR = f"{HOME}/.config/krawchick-study"
REPO = f"{HOME}/Developer/study"
LOG = f"{CFG_DIR}/sync-log.txt"
STATE = f"{CFG_DIR}/sync-state.json"
WD_STATE = f"{CFG_DIR}/watchdog-state.json"
TO = "alex@krawchick.com"
REALERT_HOURS = 20

def read(path, default=""):
    try: return open(path, encoding="utf-8").read()
    except Exception: return default

def log_lines_for(day):
    return [l for l in read(LOG).splitlines() if l.startswith(day)]

def check_sync(now):
    today = now.strftime("%Y-%m-%d")
    try: last_run = json.load(open(STATE)).get("last_run")
    except Exception: last_run = None
    ran_today = last_run == today or any(log_lines_for(today))
    if now.hour >= 19 and not ran_today:
        return ("sync", f"The daily Canvas sync did not run today ({today}). Last run: {last_run or 'unknown'}.",
                "Open the Claude app on the Mac Studio (the sync only runs while it is open), go to Routines → “Daily Canvas sync into Noah's study guides” → Run now, and approve any prompt it shows.")
    return None

def check_brief(now):
    # Sunday evening after 8 PM, or Monday: was this week's brief sent?
    if now.weekday() == 6 and now.hour >= 20: day = now
    elif now.weekday() == 0: day = now - timedelta(days=1)
    else: return None
    d = day.strftime("%Y-%m-%d")
    sent = any("weekly brief sent" in l for l in log_lines_for(d)) or (now.weekday() == 0 and any("weekly brief sent" in l for l in log_lines_for(now.strftime("%Y-%m-%d"))))
    if not sent:
        return ("brief", f"The Sunday brief for {d} was not sent (no “weekly brief sent” entry in the sync log).",
                "In the Claude app: Routines → “Sunday Canvas brief for Noah (email)” → Run now, and approve any prompt. If it keeps happening, ask Claude to read that run's transcript.")
    return None

def check_canvas():
    try:
        r = subprocess.run([sys.executable, f"{REPO}/tools/canvas.py", "check"], capture_output=True, text=True, timeout=90, cwd=REPO)
        out = (r.stdout + r.stderr).strip()
        if r.returncode != 0 or "Token OK" not in out:
            return ("canvas", "Canvas can't be read: " + out.splitlines()[-1][:200] if out else "Canvas check failed with no output.",
                    "Renew the observer token: Canvas → Account → Settings → New Access Token, then in Terminal: security add-generic-password -a \"$USER\" -s canvas-observer-token -U -w  and update token_expires in ~/.config/krawchick-study/canvas.json.")
        # expiry warning
        for tok in out.split():
            pass
        if "Expires" in out:
            try:
                exp = datetime.strptime(out.split("Expires")[1].split("(")[0].strip(" ."), "%Y-%m-%d")
                if exp - datetime.now() < timedelta(days=14):
                    return ("canvas-expiry", f"The Canvas token expires {exp:%b %d} ({(exp-datetime.now()).days} days).", "Renew it before then (Canvas → Account → Settings → New Access Token, then the security add-generic-password command).")
            except Exception: pass
    except subprocess.TimeoutExpired:
        return ("canvas", "Canvas check timed out after 90 seconds.", "Check the Mac's internet connection, then run tools/canvas.py check by hand.")
    except Exception as e:
        return ("canvas", f"Canvas check could not run: {e}", "Run python3 tools/canvas.py check in the study repo to see the error.")
    return None

def load_progress_cfg():
    try: return json.load(open(f"{CFG_DIR}/progress.json"))
    except Exception: return None

def check_sheet(cfg):
    if not cfg: return ("sheet", "progress.json is missing, so the report and alerts can't reach the Google Sheet.", "Ask Claude to recreate ~/.config/krawchick-study/progress.json.")
    try:
        q = urllib.parse.urlencode({"k": cfg["key"], "student": "Noah"})
        with urllib.request.urlopen(cfg["endpoint"] + "?" + q, timeout=45) as r: body = r.read().decode()
        if body.strip() == "no": return ("sheet", "The Study log script rejected the report key.", "The key in progress.json no longer matches the Apps Script. Ask Claude to re-sync them.")
        json.loads(body)["rows"]
    except Exception as e:
        return ("sheet", f"The Study log Google Sheet can't be reached: {str(e)[:160]}", "Open script.google.com → Noah study log beacon → Deploy → Manage deployments and confirm the web app is still deployed with access “Anyone”.")
    return None

def check_app():
    r = subprocess.run(["ps", "-axo", "comm"], capture_output=True, text=True)
    if "/Applications/Claude.app/Contents/MacOS/Claude" not in r.stdout:
        return ("app", "The Claude app is not running on the Mac Studio, so none of the scheduled tasks can run.", "Open the Claude app and leave it running (it can sit in the background).")
    return None

def send(cfg, subject, html):
    body = json.dumps({"action": "email", "k": cfg["key"], "to": TO, "subject": subject, "html": html}).encode()
    req = urllib.request.Request(cfg["endpoint"], data=body, headers={"Content-Type": "text/plain"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r: out = r.read().decode(errors="replace")
    except urllib.error.HTTPError as e: out = e.read().decode(errors="replace")
    except Exception as e: out = f"error {e}"
    return out.strip().startswith("sent"), out[:200]

def notify_mac(title, text):
    try: subprocess.run(["osascript", "-e", f'display notification "{text[:180]}" with title "{title}"'], timeout=10)
    except Exception: pass

def main():
    dry = "--dry-run" in sys.argv; force_status = "--status" in sys.argv
    now = datetime.now(); cfg = load_progress_cfg()
    problems = [p for p in [check_app(), check_sync(now), check_brief(now), check_canvas(), check_sheet(cfg)] if p]
    try: wd = json.load(open(WD_STATE))
    except Exception: wd = {}
    fresh = [p for p in problems if time.time() - wd.get("alerted", {}).get(p[0], 0) > REALERT_HOURS * 3600]
    status_day = force_status or (now.weekday() == 0 and 6 <= now.hour < 12)
    summary = "; ".join(p[1] for p in problems) if problems else "all checks passed"
    print(f"{now:%Y-%m-%d %H:%M} watchdog: {summary}")
    if dry:
        for p in problems: print(" -", p[0], "|", p[1], "| fix:", p[2])
        return
    with open(LOG, "a") as f: f.write(f"{now:%Y-%m-%d}  watchdog: {summary}\n")
    if fresh or status_day:
        if problems:
            subject = "Study site problem: " + ", ".join(sorted({p[0].split('-')[0] for p in problems}))
            html = "<p>The study-site watchdog found a problem at " + now.strftime("%a %b %d, %-I:%M %p") + ".</p><ul>" + "".join(f"<li><b>{p[1]}</b><br>Fix: {p[2]}</li>" for p in problems) + "</ul>"
        else:
            last_run = (json.load(open(STATE)).get("last_run") if os.path.exists(STATE) else "unknown")
            week = [(now - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(1, 8)]
            ran = sum(1 for d in week if any(l for l in log_lines_for(d) if "watchdog" not in l))
            subject = "Study site: all systems ran this week"
            html = f"<p>Weekly check, {now:%a %b %d}.</p><ul><li>Daily sync ran on {ran} of the last 7 days (last run {last_run}).</li><li>Sunday brief: sent.</li><li>Canvas token OK; Study log sheet reachable; Claude app running.</li></ul><p>This note comes from the watchdog on the Mac Studio, which runs outside Claude. If it ever stops arriving on Mondays, that itself is a problem.</p>"
        ok, out = (send(cfg, subject, html) if cfg else (False, "no progress.json"))
        if not ok:
            notify_mac("Study site watchdog", "Could not email Alex: " + out)
            with open(f"{CFG_DIR}/watchdog-FAILED.txt", "a") as f: f.write(f"{now:%Y-%m-%d %H:%M} email failed: {out}\n{summary}\n")
        else:
            wd.setdefault("alerted", {})
            for p in problems: wd["alerted"][p[0]] = time.time()
            wd["last_email"] = now.isoformat(timespec="minutes")
            json.dump(wd, open(WD_STATE, "w"), indent=1)
        print("email:", "sent" if ok else "FAILED " + out)

if __name__ == "__main__": main()
