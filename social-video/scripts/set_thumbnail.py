"""Attach thumbnail after publishing. usage: set_thumbnail.py <youtube|facebook> <video_id> <thumbnail.png>"""
import os, sys, requests
S = os.path.expanduser("~/goc-nhin/secrets")
plat, vid, img = sys.argv[1:4]
if plat == "facebook":
    env = dict(l.strip().split("=", 1) for l in open(f"{S}/facebook.env") if "=" in l)
    r = requests.post(f"https://graph.facebook.com/v21.0/{vid}/thumbnails", data={"is_preferred": "true", "access_token": env["FB_PAGE_TOKEN"]},
                      files={"source": open(img, "rb")}, timeout=120).json()
    print("facebook", r)
else:
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    c = Credentials.from_authorized_user_file(f"{S}/youtube_token.json", ["https://www.googleapis.com/auth/youtube"])
    if not c.valid: c.refresh(Request()); open(f"{S}/youtube_token.json", "w").write(c.to_json())
    jpg = img.rsplit(".", 1)[0] + "_yt.jpg"
    from PIL import Image; Image.open(img).convert("RGB").save(jpg, quality=88)  # YouTube limit 2 MB
    try: print("youtube", build("youtube", "v3", credentials=c).thumbnails().set(videoId=vid, media_body=MediaFileUpload(jpg)).execute().get("items"))
    except Exception as e: print("youtube thumbnail failed:", str(e)[:200])
