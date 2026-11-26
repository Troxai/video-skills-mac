"""Read-only audit: every unreplied FB comment on all page posts + reels, with context and visible API errors.
Never prints the token (request exceptions contain the URL, so only their type is printed)."""
import os, json, requests
from concurrent.futures import ThreadPoolExecutor

env = dict(l.strip().split("=", 1) for l in open(os.path.expanduser("~/goc-nhin/secrets/facebook.env")) if "=" in l and not l.startswith("#"))
G, T, PID = "https://graph.facebook.com/v21.0", env["FB_PAGE_TOKEN"], env["FB_PAGE_ID"]


def get_all(path, **params):
    items, after = [], None
    while True:
        p = {"access_token": T, **params, **({"after": after} if after else {})}
        try:
            r = requests.get(f"{G}/{path}", params=p, timeout=(8, 40)).json()
        except Exception as e:
            return items, type(e).__name__
        if "error" in r:
            return items, str(r["error"].get("message", "")).replace(T, "***")
        items += r.get("data", [])
        paging = r.get("paging", {})
        after = paging.get("cursors", {}).get("after")
        if not paging.get("next"):
            return items, None
        if not after:
            return items, "pagination without cursor"


posts, e1 = get_all(f"{PID}/posts", fields="id,message,permalink_url,created_time", limit=50)
reels, e2 = get_all(f"{PID}/video_reels", fields="id,description,permalink_url,created_time", limit=50)


def scan(obj):
    return obj, get_all(f"{obj['id']}/comments", filter="stream", limit=100,
                        fields="id,message,from,created_time,parent{id},is_hidden,attachment")


errors, seen = [e for e in (e1, e2) if e], {}
with ThreadPoolExecutor(8) as ex:
    for obj, (comments, err) in ex.map(scan, posts + reels):
        if err:
            errors.append(f"{obj['id']}: {err}")
        replied = {(c.get("parent") or {}).get("id") for c in comments if (c.get("from") or {}).get("id") == PID}
        for c in comments:
            # a reel comment has a different prefix when read through its post; the suffix is stable
            key = c["id"].split("_")[-1]
            row = seen.setdefault(key, {"comment": c, "replied": False, "post": obj})
            row["replied"] |= c["id"] in replied

todo = [r for r in seen.values() if not r["replied"] and (r["comment"].get("from") or {}).get("id") != PID]
print(json.dumps({"posts": len(posts), "reels": len(reels), "comments": len(seen), "errors": errors, "unreplied": todo},
                 ensure_ascii=False, indent=1))
