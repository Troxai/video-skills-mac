#!/usr/bin/env python3
"""90plus comment helper. Never prints tokens.
  comments.py fetch            -> runs/comments_pending.json (unanswered comments, FB + YT)
  comments.py reply FILE.json  -> posts replies: [{"platform":"facebook","id":..,"text":..}, ...]
"""
import json, os, sys, urllib.request, urllib.parse, urllib.error, datetime, socket

# IPv6 on this VPS stalls ~20s per request; force IPv4.
_gai = socket.getaddrinfo
socket.getaddrinfo = lambda h, p, f=0, *a, **k: _gai(h, p, socket.AF_INET, *a, **k)

H = os.path.expanduser("~/90plus")
S = f"{H}/secrets"
LOG = f"{H}/logs/comments.log"


def log(msg):
    with open(LOG, "a") as f:
        f.write(f"{datetime.datetime.now().isoformat(timespec='seconds')} {msg}\n")


def env(path):
    d = {}
    for l in open(path):
        if "=" in l and not l.lstrip().startswith("#"):
            k, v = l.split("=", 1)
            d[k.strip()] = v.strip().strip('"').strip("'")
    return d


def http(url, data=None, headers=None, method=None):
    body = urllib.parse.urlencode(data).encode() if isinstance(data, dict) else data
    req = urllib.request.Request(url, data=body, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        try:
            err = json.load(e)
        except Exception:
            err = {"error": str(e.code)}
        return {"_http_error": e.code, **err}


# ---------- Facebook ----------
FB = env(f"{S}/facebook.env")
FBAPI = FB.get("FB_API") or "https://graph.facebook.com/v21.0"
if not FBAPI.startswith("http"):
    FBAPI = f"https://graph.facebook.com/{FBAPI}"


def fb_get(path, **params):
    params["access_token"] = FB["FB_PAGE_TOKEN"]
    return http(f"{FBAPI}/{path}?{urllib.parse.urlencode(params)}")


def fb_fetch():
    pid = FB["FB_PAGE_ID"]
    out, errs = [], []
    r = fb_get(f"{pid}/posts", fields="id,message,created_time", limit=50)
    if "error" in r:
        return out, [f"posts: {r['error'].get('message') if isinstance(r['error'], dict) else r['error']}"]
    for p in r.get("data", []):
        url = None
        c = fb_get(f"{p['id']}/comments", fields="id,message,from,created_time,comments.limit(50){from}",
                   filter="toplevel", limit=100)
        if "error" in c:
            errs.append(f"comments {p['id']}: {c['error'].get('message')}")
            continue
        for cm in c.get("data", []):
            frm = (cm.get("from") or {}).get("id")
            if frm == pid:
                continue
            replies = (cm.get("comments") or {}).get("data", [])
            if any((x.get("from") or {}).get("id") == pid for x in replies):
                continue
            out.append({"platform": "facebook", "id": cm["id"], "post": (p.get("message") or "")[:200],
                        "author": (cm.get("from") or {}).get("name"), "text": cm.get("message", ""),
                        "time": cm.get("created_time")})
    return out, errs


def fb_reply(cid, text):
    r = http(f"{FBAPI}/{cid}/comments", {"message": text, "access_token": FB["FB_PAGE_TOKEN"]})
    return ("id" in r), (r.get("error") or {}).get("message") if "id" not in r else r["id"]


# ---------- YouTube ----------
def yt_token():
    t = json.load(open(f"{S}/youtube_token.json"))
    r = http(t["token_uri"], {"client_id": t["client_id"], "client_secret": t["client_secret"],
                              "refresh_token": t["refresh_token"], "grant_type": "refresh_token"})
    return r.get("access_token"), t.get("scopes", []), r.get("error_description") or r.get("error")


def yt_get(tok, path, **params):
    return http(f"https://www.googleapis.com/youtube/v3/{path}?{urllib.parse.urlencode(params)}",
                headers={"Authorization": f"Bearer {tok}"})


def yt_fetch():
    tok, scopes, err = yt_token()
    if not tok:
        return [], [f"token refresh: {err}"], scopes
    ch = yt_get(tok, "channels", part="id", mine="true")
    if "error" in ch:
        return [], [f"channels: {ch['error'].get('message')}"], scopes
    cid = ch["items"][0]["id"]
    out, errs, page = [], [], None
    while True:
        p = dict(part="snippet,replies", allThreadsRelatedToChannelId=cid, maxResults=100, textFormat="plainText")
        if page:
            p["pageToken"] = page
        r = yt_get(tok, "commentThreads", **p)
        if "error" in r:
            errs.append(f"commentThreads: {r['error'].get('message')}")
            break
        for th in r.get("items", []):
            top = th["snippet"]["topLevelComment"]["snippet"]
            if (top.get("authorChannelId") or {}).get("value") == cid:
                continue
            reps = (th.get("replies") or {}).get("comments", [])
            if any((x["snippet"].get("authorChannelId") or {}).get("value") == cid for x in reps):
                continue
            out.append({"platform": "youtube", "id": th["snippet"]["topLevelComment"]["id"],
                        "video": th["snippet"].get("videoId"), "author": top.get("authorDisplayName"),
                        "text": top.get("textDisplay", ""), "time": top.get("publishedAt")})
        page = r.get("nextPageToken")
        if not page:
            break
    return out, errs, scopes


def yt_reply(cid, text):
    tok, _, err = yt_token()
    if not tok:
        return False, err
    r = http("https://www.googleapis.com/youtube/v3/comments?part=snippet",
             json.dumps({"snippet": {"parentId": cid, "textOriginal": text}}).encode(),
             headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})
    return ("id" in r), r.get("id") or (r.get("error") or {}).get("message")


def main():
    if sys.argv[1] == "fetch":
        fb, fbe = fb_fetch()
        yt, yte, scopes = yt_fetch()
        res = {"facebook": fb, "facebook_errors": fbe, "youtube": yt, "youtube_errors": yte,
               "youtube_scopes": scopes,
               "tiktok_errors": [] if os.path.exists(f"{S}/tiktok.env") else ["không có credentials TikTok trong secrets/"]}
        os.makedirs(f"{H}/runs", exist_ok=True)
        json.dump(res, open(f"{H}/runs/comments_pending.json", "w"), ensure_ascii=False, indent=1)
        log(f"fetch fb={len(fb)} yt={len(yt)} fb_err={len(fbe)} yt_err={len(yte)}")
        print(json.dumps(res, ensure_ascii=False, indent=1))
    elif sys.argv[1] == "reply":
        items = json.load(open(sys.argv[2]))
        ok = {"facebook": 0, "youtube": 0}
        fails = []
        for it in items:
            fn = fb_reply if it["platform"] == "facebook" else yt_reply
            good, info = fn(it["id"], it["text"])
            log(f"reply {it['platform']} {it['id']} {'OK' if good else 'FAIL ' + str(info)}")
            if good:
                ok[it["platform"]] += 1
            else:
                fails.append(f"{it['platform']} {it['id']}: {info}")
        print(json.dumps({"ok": ok, "fails": fails}, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
