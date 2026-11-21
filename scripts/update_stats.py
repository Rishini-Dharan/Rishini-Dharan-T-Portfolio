"""Fetch competitive-programming stats and write stats.json.

Run daily by .github/workflows/update-stats.yml. Each source is fetched
independently: if one site is down, its previous numbers are kept.
"""
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

LEETCODE_USER = "rishini_dharan"
CODEFORCES_USER = "Rishini_Dharan_T"
ATCODER_USER = "Rishini"
OUT = Path(__file__).resolve().parent.parent / "stats.json"
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
    m = re.search(r"<th[^>]*>Rank</th>\s*<td>(\d+)", page)
    return {"rating": rated[-1]["NewRating"], "rank": int(m.group(1)) if m else None}


def main():
    old = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    new = dict(old)
    ok = 0
    for name, fn in [("leetcode", leetcode), ("codeforces", codeforces), ("atcoder", atcoder)]:
        try:
            new[name] = fn()
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


if __name__ == "__main__":
    main()
