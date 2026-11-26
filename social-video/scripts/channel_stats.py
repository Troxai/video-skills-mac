import os, json, requests
S = os.path.expanduser("~/goc-nhin/secrets")
env = dict(l.strip().split("=", 1) for l in open(f"{S}/facebook.env") if "=" in l)
r = requests.get(f"https://graph.facebook.com/v21.0/{env['FB_PAGE_ID']}",
                 params={"fields": "name,followers_count,fan_count,link", "access_token": env["FB_PAGE_TOKEN"]}, timeout=30).json()
print("FB:", {k: r.get(k) for k in ("name", "followers_count", "fan_count", "link")} if "name" in r else r.get("error", {}).get("message"))
dbg = requests.get("https://graph.facebook.com/v21.0/debug_token", params={"input_token": env["FB_PAGE_TOKEN"], "access_token": env["FB_PAGE_TOKEN"]}, timeout=30).json().get("data", {})
print("FB token: valid=%s expires=%s scopes=%s" % (dbg.get("is_valid"), dbg.get("expires_at"), ",".join(dbg.get("scopes", []))))

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
c = Credentials.from_authorized_user_file(f"{S}/youtube_token.json", ["https://www.googleapis.com/auth/youtube"])
if not c.valid: c.refresh(Request()); open(f"{S}/youtube_token.json", "w").write(c.to_json())
yt = build("youtube", "v3", credentials=c)
ch = yt.channels().list(part="snippet,statistics", mine=True).execute()["items"][0]
st = ch["statistics"]
print("YT:", ch["snippet"]["title"], "| subs", st.get("subscriberCount"), "| videos", st.get("videoCount"), "| views", st.get("viewCount"), "| id", ch["id"])
