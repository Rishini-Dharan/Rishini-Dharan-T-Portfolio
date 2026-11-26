"""Fetch competitive-programming stats and write stats.json.

Run daily by .github/workflows/update-stats.yml. Each source is fetched
independently: if one site is down, its previous numbers are kept.
"""
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

LEETCODE_USER = "rishini_dharan"
CODEFORCES_USER = "Rishini_Dharan_T"
ATCODER_USER = "Rishini"
GITHUB_USER = "Rishini-Dharan"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "stats.json"
CONTRIB = ROOT / "contributions.js"
UA = {"User-Agent": "portfolio-stats-bot/1.0"}


def get(url, data=None, headers=None):
    req = urllib.request.Request(url, data=data, headers={**UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")


def leetcode():
    query = """query($u: String!) {
      userContestRanking(username: $u) { rating globalRanking topPercentage badge { name } }
      matchedUser(username: $u) { submitStatsGlobal { acSubmissionNum { difficulty count } } }
    }"""
    body = json.dumps({"query": query, "variables": {"u": LEETCODE_USER}}).encode()
    d = json.loads(get("https://leetcode.com/graphql", body,
                       {"Content-Type": "application/json", "Referer": "https://leetcode.com"}))["data"]
    rank, user = d["userContestRanking"], d["matchedUser"]
    counts = {x["difficulty"].lower(): x["count"] for x in user["submitStatsGlobal"]["acSubmissionNum"]}
    return {
        "rating": round(rank["rating"]),
        "globalRank": rank["globalRanking"],
        "topPercent": rank["topPercentage"],
        "badge": (rank.get("badge") or {}).get("name"),
        "solved": counts["all"], "easy": counts["easy"], "medium": counts["medium"], "hard": counts["hard"],
    }


def codeforces():
    info = json.loads(get(f"https://codeforces.com/api/user.info?handles={CODEFORCES_USER}"))["result"][0]
    subs = json.loads(get(f"https://codeforces.com/api/user.status?handle={CODEFORCES_USER}"))["result"]
    solved = {(s["problem"].get("contestId"), s["problem"]["index"]) for s in subs if s.get("verdict") == "OK"}
    return {"rating": info["rating"], "maxRating": info["maxRating"], "rank": info["rank"],
            "maxRank": info["maxRank"], "solved": len(solved)}


def atcoder():
    history = json.loads(get(f"https://atcoder.jp/users/{ATCODER_USER}/history/json"))
    rated = [h for h in history if h.get("IsRated")]
    page = get(f"https://atcoder.jp/users/{ATCODER_USER}")
    # profile shows e.g. "25594th (Top 20.58%)"
    m = re.search(r"<th[^>]*>Rank</th>\s*<td>(\d+)(?:st|nd|rd|th)?\s*(?:<span[^>]*>\(Top ([\d.]+)%\))?", page)
    out = {"rating": rated[-1]["NewRating"], "maxRating": max(h["NewRating"] for h in rated),
           "rank": int(m.group(1)) if m else None}
    if m and m.group(2):
        out["topPercent"] = float(m.group(2))
    return out


def github():
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        raise RuntimeError("GITHUB_TOKEN not set")
    query = """query($u: String!) { user(login: $u) { contributionsCollection { contributionCalendar {
      totalContributions weeks { contributionDays { date contributionCount } } } } } }"""
    body = json.dumps({"query": query, "variables": {"u": GITHUB_USER}}).encode()
    d = json.loads(get("https://api.github.com/graphql", body,
                       {"Authorization": f"bearer {token}", "Content-Type": "application/json"}))
    cal = d["data"]["user"]["contributionsCollection"]["contributionCalendar"]
    days = [x for w in cal["weeks"] for x in w["contributionDays"]]
    return {"total": cal["totalContributions"], "start": days[0]["date"],
            "counts": [x["contributionCount"] for x in days]}


def plausible(name, fresh, prev):
    """Reject responses that look broken; a rejected source keeps yesterday's numbers."""
    num = lambda v: isinstance(v, (int, float)) and not isinstance(v, bool)
    sane = lambda r: num(r) and 0 < r < 5000
    prev = prev or {}
    no_big_jump = lambda: not num(prev.get("rating")) or abs(fresh["rating"] - prev["rating"]) <= 400
    if name == "leetcode":
        return (sane(fresh["rating"]) and fresh["solved"] > 0
                and fresh["easy"] + fresh["medium"] + fresh["hard"] == fresh["solved"]
                and fresh["solved"] >= prev.get("solved", 0) and no_big_jump())
    if name == "codeforces":
        return (sane(fresh["rating"]) and fresh["maxRating"] >= fresh["rating"] and fresh["solved"] > 0
                and fresh["solved"] >= prev.get("solved", 0) and no_big_jump())
    if name == "atcoder":
        return (sane(fresh["rating"]) and fresh["maxRating"] >= fresh["rating"]
                and fresh["maxRating"] >= prev.get("maxRating", 0) and no_big_jump())
    if name == "github":
        c = fresh["counts"]
        return 364 <= len(c) <= 371 and all(isinstance(n, int) and n >= 0 for n in c) and sum(c) == fresh["total"]
    return False


def main():
    old = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    new = dict(old)
    ok = 0
    for name, fn in [("leetcode", leetcode), ("codeforces", codeforces), ("atcoder", atcoder)]:
        try:
            fresh = fn()
            if not plausible(name, fresh, old.get(name)):
                print(f"{name}: implausible response {fresh}; keeping previous values", file=sys.stderr)
                continue
            new[name] = fresh
            ok += 1
        except Exception as e:  # keep the last good numbers for this source
            print(f"{name}: failed ({e}); keeping previous values", file=sys.stderr)
    if not ok:
        sys.exit("all sources failed")
    data_changed = {k: v for k, v in new.items() if k != "updated"} != {k: v for k, v in old.items() if k != "updated"}
    if data_changed:
        new["updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        OUT.write_text(json.dumps(new, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(new, indent=2))

    # GitHub contribution calendar, written as the script the page already loads
    try:
        cal = github()
        if plausible("github", cal, None):
            today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            text = CONTRIB.read_text(encoding="utf-8") if CONTRIB.exists() else ""
            if json.dumps(cal["counts"]) not in text.replace(" ", "") or f'"total":{cal["total"]}' not in text.replace(" ", ""):
                CONTRIB.write_text(
                    f"// GitHub contribution calendar for {GITHUB_USER}, refreshed by scripts/update_stats.py on {today}.\n"
                    f"window.CONTRIB = {json.dumps({'asOf': today, **cal}, separators=(',', ':'))};\n", encoding="utf-8")
                print("github: calendar updated")
        else:
            print("github: implausible calendar; kept previous", file=sys.stderr)
    except Exception as e:
        print(f"github: failed ({e}); keeping previous calendar", file=sys.stderr)


if __name__ == "__main__":
    main()
