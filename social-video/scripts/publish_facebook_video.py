#!/usr/bin/env python3
"""Facebook Page VIDEO (ngang 16:9, dài) via Graph API — không phải Reels. usage: publish_facebook_video.py video.mp4 post.json [thumbnail.jpg]
secrets/facebook.env: FB_PAGE_ID, FB_PAGE_TOKEN"""
import json, os, sys, time, requests
env = dict(l.strip().split('=', 1) for l in open(os.path.expanduser('~/goc-nhin/secrets/facebook.env')) if '=' in l and not l.startswith('#'))
PAGE, TOKEN, V = env['FB_PAGE_ID'], env['FB_PAGE_TOKEN'], env.get('FB_API', 'v21.0')
video, post = sys.argv[1], json.load(open(sys.argv[2]))
thumb = sys.argv[3] if len(sys.argv) > 3 else None
fb = post.get('facebook', {})
data = {'title': fb.get('title', post['title']), 'description': fb.get('description', post['description']),
        'published': 'true', 'access_token': TOKEN}
U = f'https://graph-video.facebook.com/{V}/{PAGE}/videos'
size = os.path.getsize(video)
st = requests.post(U, data={'upload_phase': 'start', 'file_size': size, 'access_token': TOKEN}, timeout=60).json()
sess, vid, a, b = st['upload_session_id'], st['video_id'], int(st['start_offset']), int(st['end_offset'])
with open(video, 'rb') as fh:
    while a < b:
        fh.seek(a); chunk = fh.read(b - a)
        for k in range(3):
            try:
                t = requests.post(U, data={'upload_phase': 'transfer', 'upload_session_id': sess, 'start_offset': a, 'access_token': TOKEN},
                                  files={'video_file_chunk': ('c', chunk)}, timeout=600).json(); break
            except Exception: time.sleep(10)
        a, b = int(t['start_offset']), int(t['end_offset'])
fin = {'upload_phase': 'finish', 'upload_session_id': sess, 'access_token': TOKEN, 'title': data['title'], 'description': data['description'], 'published': 'true'}
r = requests.post(U, data=fin, files={'thumb': open(thumb, 'rb')} if thumb else None, timeout=300)
if not r.ok: print(r.text[:500]); r.raise_for_status()
s = {}
for _ in range(60):
    s = requests.get(f'https://graph.facebook.com/{V}/{vid}', params={'fields': 'status,permalink_url', 'access_token': TOKEN}, timeout=30).json()
    if s.get('status', {}).get('video_status') == 'ready': break
    time.sleep(20)
pl = s.get('permalink_url', '')
print(json.dumps({'platform': 'facebook', 'id': vid, 'url': ('https://facebook.com' + pl) if pl.startswith('/') else pl}))
