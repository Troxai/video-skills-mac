#!/usr/bin/env python3
"""usage: fb_comment.py <fb_video_id> [text]  — Page đăng bình luận mời góp chủ đề, thử ghim."""
import sys, os, requests
env = dict(l.strip().split('=', 1) for l in open(os.path.expanduser('~/goc-nhin/secrets/facebook.env')) if '=' in l and not l.startswith('#'))
TOKEN, V = env['FB_PAGE_TOKEN'], env.get('FB_API', 'v21.0')
vid = sys.argv[1]
text = sys.argv[2] if len(sys.argv) > 2 else ("📌 Bạn muốn Góc Nhìn Đa Chiều phân tích chủ đề gì tiếp theo? Vàng, nhà đất, lãi suất hay chứng khoán? "
        "Bình luận bên dưới, chủ đề nhiều người hỏi nhất sẽ lên video tuần tới 👇")
r = requests.post(f'https://graph.facebook.com/{V}/{vid}/comments', data={'message': text, 'access_token': TOKEN}, timeout=60)
print('comment', r.status_code, r.json() if r.ok else r.json().get('error', {}).get('message'))
if r.ok:
    cid = r.json()['id']
    p = requests.post(f'https://graph.facebook.com/{V}/{cid}', data={'is_pinned': 'true', 'access_token': TOKEN}, timeout=60)
    print('pin', p.status_code, 'ok' if p.ok else p.json().get('error', {}).get('message'))
