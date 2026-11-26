#!/usr/bin/env python3
"""Đặt thumbnail/ảnh bìa cho video đã đăng. usage: set_thumbnail.py youtube|facebook <video_id> <image.jpg>
Đọc secrets như publish_*.py, không in token. Chạy qua ipv4_run.py."""
import json, os, sys, requests
plat, vid, img = sys.argv[1], sys.argv[2], sys.argv[3]
SEC = os.path.expanduser('~/90plus/secrets')
if plat == 'youtube':
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    tok = os.path.join(SEC, 'youtube_token.json')
    creds = Credentials.from_authorized_user_file(tok, ['https://www.googleapis.com/auth/youtube'])
    if not creds.valid:
        creds.refresh(Request()); open(tok, 'w').write(creds.to_json()); os.chmod(tok, 0o600)
    yt = build('youtube', 'v3', credentials=creds)
    res = yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(img, mimetype='image/jpeg')).execute()
    print(json.dumps({'platform': 'youtube', 'id': vid, 'ok': bool(res.get('items'))}))
else:
    env = dict(l.strip().split('=', 1) for l in open(os.path.join(SEC, 'facebook.env')) if '=' in l and not l.startswith('#'))
    TOKEN, V = env['FB_PAGE_TOKEN'], env.get('FB_API', 'v21.0')
    with open(img, 'rb') as f:
        r = requests.post(f'https://graph.facebook.com/{V}/{vid}/thumbnails', data={'is_preferred': 'true', 'access_token': TOKEN}, files={'source': ('thumb.jpg', f, 'image/jpeg')}, timeout=120)
    ok = r.ok
    err = '' if ok else r.json().get('error', {}).get('message', r.text[:200])
    print(json.dumps({'platform': 'facebook', 'id': vid, 'ok': ok, 'error': err}, ensure_ascii=False))
