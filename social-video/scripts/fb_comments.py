"""List unreplied FB comments (list) or reply to one (reply <comment_id> <text>)."""
import os, sys, json, requests
S = os.path.expanduser("~/goc-nhin/secrets")
env = dict(l.strip().split("=", 1) for l in open(f"{S}/facebook.env") if "=" in l)
G, T, PID = "https://graph.facebook.com/v21.0", env["FB_PAGE_TOKEN"], env["FB_PAGE_ID"]
def get(p, **kw): return requests.get(f"{G}/{p}", params={"access_token": T, **kw}, timeout=30).json()
if sys.argv[1] == "list":
    out = []
    for post in get(f"{PID}/posts", fields="id,message", limit=25).get("data", []):
        for c in get(f"{post['id']}/comments", fields="id,message,from,comments{from}", limit=100, filter="toplevel").get("data", []):
            if (c.get("from") or {}).get("id") == PID: continue
            if any((r.get("from") or {}).get("id") == PID for r in c.get("comments", {}).get("data", [])): continue
            out.append({"id": c["id"], "post": (post.get("message") or "")[:60], "text": c.get("message")})
    print(json.dumps(out, ensure_ascii=False, indent=1))
elif sys.argv[1] == "reply":
    print(requests.post(f"{G}/{sys.argv[2]}/comments", data={"message": sys.argv[3], "access_token": T}, timeout=30).json())
