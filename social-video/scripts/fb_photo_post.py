"""Post photo to FB page: fb_photo_post.py <image> <caption> [unix_ts_to_schedule]"""
import os, sys, requests
S = os.path.expanduser("~/goc-nhin/secrets")
env = dict(l.strip().split("=", 1) for l in open(f"{S}/facebook.env") if "=" in l)
d = {"caption": sys.argv[2], "access_token": env["FB_PAGE_TOKEN"]}
if len(sys.argv) > 3: d.update(published="false", scheduled_publish_time=sys.argv[3])
print(requests.post(f"https://graph.facebook.com/v21.0/{env['FB_PAGE_ID']}/photos", data=d,
                    files={"source": open(sys.argv[1], "rb")}, timeout=120).json())
