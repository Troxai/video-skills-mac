#!/usr/bin/env python3
"""Facebook Page Reels via Graph API. usage: publish_facebook.py video.mp4 post.json
secrets/facebook.env: FB_PAGE_ID=..., FB_PAGE_TOKEN=... (long-lived Page token), FB_API=v21.0 (optional)"""
import json, os, sys, time, requests
env = dict(l.strip().split('=', 1) for l in open(os.path.expanduser('~/goc-nhin/secrets/facebook.env')) if '=' in l and not l.startswith('#'))
PAGE, TOKEN, V = env['FB_PAGE_ID'], env['FB_PAGE_TOKEN'], env.get('FB_API', 'v21.0')
video, post = sys.argv[1], json.load(open(sys.argv[2]))
G = f'https://graph.facebook.com/{V}/{PAGE}/video_reels'
r = requests.post(G, data={'upload_phase': 'start', 'access_token': TOKEN}, timeout=60); r.raise_for_status(); vid = r.json()['video_id']
size = os.path.getsize(video)
with open(video, 'rb') as f:
    u = requests.post(f'https://rupload.facebook.com/video-upload/{V}/{vid}', data=f,
                      headers={'Authorization': f'OAuth {TOKEN}', 'offset': '0', 'file_size': str(size)}, timeout=600)
u.raise_for_status()
fb = post.get('facebook', {})
desc = fb.get('description', post['description'] + '\n' + ' '.join(post['hashtags']))
r = requests.post(G, data={'upload_phase': 'finish', 'video_id': vid, 'video_state': 'PUBLISHED', 'description': desc, 'title': fb.get('title', post['title']), 'access_token': TOKEN}, timeout=60)
r.raise_for_status()
for _ in range(40):
    s = requests.get(f'https://graph.facebook.com/{V}/{vid}', params={'fields': 'status,permalink_url', 'access_token': TOKEN}, timeout=30).json()
    if s.get('status', {}).get('video_status') in ('ready', 'published') or s.get('permalink_url'): break
    time.sleep(15)
print(json.dumps({'platform': 'facebook', 'id': vid, 'url': 'https://facebook.com' + s.get('permalink_url', '') if s.get('permalink_url', '').startswith('/') else s.get('permalink_url', '')}))
