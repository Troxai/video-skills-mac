#!/usr/bin/env python3
"""Facebook Page 90 Plus. usage: publish_facebook.py video.mp4 post.json [reel|video]
Mặc định: video ≤ 90 s → Reels, dài hơn → video thường (/videos). Token đọc từ ~/90plus/secrets/facebook.env, không in ra."""
import json, os, sys, time, subprocess, requests
env = dict(l.strip().split('=', 1) for l in open(os.path.expanduser('~/90plus/secrets/facebook.env')) if '=' in l and not l.startswith('#'))
PAGE, TOKEN, V = env['FB_PAGE_ID'], env['FB_PAGE_TOKEN'], env.get('FB_API', 'v21.0')
video, post = sys.argv[1], json.load(open(sys.argv[2]))
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], capture_output=True, text=True).stdout or 0)
mode = sys.argv[3] if len(sys.argv) > 3 else ('reel' if dur <= 90 else 'video')
fb = post.get('facebook', {})
desc = fb.get('description', post.get('description', '') + '\n' + ' '.join(post.get('hashtags', [])))
title = fb.get('title', post.get('title', ''))
size = os.path.getsize(video)
if mode == 'reel':
    G = f'https://graph.facebook.com/{V}/{PAGE}/video_reels'
    r = requests.post(G, data={'upload_phase': 'start', 'access_token': TOKEN}, timeout=60); r.raise_for_status(); vid = r.json()['video_id']
    with open(video, 'rb') as f:
        requests.post(f'https://rupload.facebook.com/video-upload/{V}/{vid}', data=f, headers={'Authorization': f'OAuth {TOKEN}', 'offset': '0', 'file_size': str(size)}, timeout=1800).raise_for_status()
    requests.post(G, data={'upload_phase': 'finish', 'video_id': vid, 'video_state': 'PUBLISHED', 'description': desc, 'title': title, 'access_token': TOKEN}, timeout=60).raise_for_status()
else:  # resumable upload cho video dài
    G = f'https://graph-video.facebook.com/{V}/{PAGE}/videos'
    s = requests.post(G, data={'upload_phase': 'start', 'file_size': size, 'access_token': TOKEN}, timeout=60); s.raise_for_status(); s = s.json()
    sid, vid, start, end = s['upload_session_id'], s['video_id'], int(s['start_offset']), int(s['end_offset'])
    with open(video, 'rb') as f:
        while start < end:
            f.seek(start); chunk = f.read(end - start)
            r = requests.post(G, data={'upload_phase': 'transfer', 'upload_session_id': sid, 'start_offset': start, 'access_token': TOKEN}, files={'video_file_chunk': ('c', chunk)}, timeout=600); r.raise_for_status()
            start, end = int(r.json()['start_offset']), int(r.json()['end_offset'])
    requests.post(G, data={'upload_phase': 'finish', 'upload_session_id': sid, 'title': title, 'description': desc, 'published': 'true', 'access_token': TOKEN}, timeout=120).raise_for_status()
s = {}
for _ in range(40):
    s = requests.get(f'https://graph.facebook.com/{V}/{vid}', params={'fields': 'status,permalink_url', 'access_token': TOKEN}, timeout=30).json()
    if s.get('status', {}).get('video_status') in ('ready', 'published') or s.get('permalink_url'): break
    time.sleep(15)
p = s.get('permalink_url', '')
print(json.dumps({'platform': 'facebook', 'mode': mode, 'id': vid, 'url': ('https://facebook.com' + p) if p.startswith('/') else p}))
