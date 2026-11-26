"""Read-only: public comment counts per uploaded video (works without the force-ssl scope). IPv4 only."""
import json, os, socket

_orig = socket.getaddrinfo
socket.getaddrinfo = lambda host, port, family=0, *a, **k: _orig(host, port, socket.AF_INET, *a, **k)

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

creds = Credentials.from_authorized_user_file(os.path.expanduser("~/goc-nhin/secrets/youtube_token.json"))
if not creds.valid:
    creds.refresh(Request())  # in memory only
yt = build("youtube", "v3", credentials=creds)
uploads = yt.channels().list(part="contentDetails", mine=True).execute()["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
ids, page = [], None
while True:
    r = yt.playlistItems().list(part="contentDetails", playlistId=uploads, maxResults=50, pageToken=page).execute()
    ids += [i["contentDetails"]["videoId"] for i in r["items"]]
    page = r.get("nextPageToken")
    if not page:
        break
rows = []
for i in range(0, len(ids), 50):
    for v in yt.videos().list(part="statistics,snippet", id=",".join(ids[i:i + 50])).execute()["items"]:
        n = int(v["statistics"].get("commentCount", 0))
        if n:
            rows.append({"id": v["id"], "n": n, "title": v["snippet"]["title"]})
print(json.dumps({"videos": len(ids), "comments": sum(r["n"] for r in rows), "with_comments": rows}, ensure_ascii=False, indent=1))
