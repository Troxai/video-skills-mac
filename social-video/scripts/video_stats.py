"""Snapshot engagement of published videos. usage: video_stats.py [date ...]  (default: last 4 entries in published.json)
Appends to logs/video_stats.jsonl and prints a table. YouTube: views/likes/comments. Facebook reel: video_insights + reactions/comments."""
import os, sys, json, time, re, requests
from datetime import datetime
H = os.path.expanduser("~/goc-nhin"); S = f"{H}/secrets"
pub = json.load(open(f"{H}/published.json"))
sel = [p for p in pub if p["date"] in sys.argv[1:]] if len(sys.argv) > 1 else pub[-4:]
env = dict(l.strip().split("=", 1) for l in open(f"{S}/facebook.env") if "=" in l)
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
c = Credentials.from_authorized_user_file(f"{S}/youtube_token.json", ["https://www.googleapis.com/auth/youtube"])
if not c.valid: c.refresh(Request()); open(f"{S}/youtube_token.json", "w").write(c.to_json())
yt = build("youtube", "v3", credentials=c)
now = datetime.now().astimezone().isoformat(timespec="minutes"); rows = []
for p in sel:
    r = {"ts": now, "date": p["date"], "title": p["title"][:50]}
    m = re.search(r"shorts/([\w-]+)", p.get("youtube", ""))
    if m:
        it = yt.videos().list(part="statistics,snippet", id=m.group(1)).execute().get("items", [])
        if it:
            st = it[0]["statistics"]; r.update(yt_id=m.group(1), yt_published=it[0]["snippet"]["publishedAt"],
                yt_views=int(st.get("viewCount", 0)), yt_likes=int(st.get("likeCount", 0)), yt_comments=int(st.get("commentCount", 0)))
    m = re.search(r"reel/(\d+)", p.get("facebook", ""))
    if m:
        v = m.group(1); tok = env["FB_PAGE_TOKEN"]
        ins = requests.get(f"https://graph.facebook.com/v21.0/{v}/video_insights", params={"access_token": tok}, timeout=30).json()
        for d in ins.get("data", []):
            if d["name"] in ("blue_reels_play_count", "post_impressions_unique", "post_video_avg_time_watched", "post_video_social_actions"):
                val = d["values"][0]["value"]; r["fb_" + d["name"]] = val
        o = requests.get(f"https://graph.facebook.com/v21.0/{v}", params={"fields": "created_time,likes.summary(true).limit(0),comments.summary(true).limit(0)", "access_token": tok}, timeout=30).json()
        r["fb_created"] = o.get("created_time"); r["fb_likes"] = o.get("likes", {}).get("summary", {}).get("total_count"); r["fb_comments"] = o.get("comments", {}).get("summary", {}).get("total_count")
        if "error" in o: r["fb_error2"] = o["error"].get("message", "")[:120]
        if "error" in ins: r["fb_error"] = ins["error"].get("message", "")[:120]
    rows.append(r)
os.makedirs(f"{H}/logs", exist_ok=True)
with open(f"{H}/logs/video_stats.jsonl", "a") as f:
    for r in rows: f.write(json.dumps(r, ensure_ascii=False) + "\n")
for r in rows: print(json.dumps(r, ensure_ascii=False))
