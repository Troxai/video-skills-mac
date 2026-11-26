#!/usr/bin/env python3
"""YouTube upload (90plus). usage: publish_youtube.py video.mp4 post.json [privacy]
Needs secrets/youtube_client.json (OAuth client) and secrets/youtube_token.json (created on first interactive run)."""
import json, sys, os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
SEC = os.path.expanduser('~/90plus/secrets'); SCOPES = ['https://www.googleapis.com/auth/youtube']
tok = os.path.join(SEC, 'youtube_token.json')
creds = Credentials.from_authorized_user_file(tok, SCOPES) if os.path.exists(tok) else None
if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token: creds.refresh(Request())
    else: creds = InstalledAppFlow.from_client_secrets_file(os.path.join(SEC, 'youtube_client.json'), SCOPES).run_console()
    open(tok, 'w').write(creds.to_json()); os.chmod(tok, 0o600)
video, post = sys.argv[1], json.load(open(sys.argv[2])); privacy = sys.argv[3] if len(sys.argv) > 3 else 'public'
ytp = post.get("youtube", {})
body = {'snippet': {'tags': ytp.get('tags', [])[:15], 'title': ytp.get('title', post['title'])[:100], 'description': ytp.get('description', post['description'] + '\n' + ' '.join(post['hashtags']))[:5000],
                    'categoryId': '17', 'defaultLanguage': 'vi'},
        'status': {'privacyStatus': privacy, 'selfDeclaredMadeForKids': False, 'containsSyntheticMedia': bool(post.get('ai_label', False))}}
yt = build('youtube', 'v3', credentials=creds)
req = yt.videos().insert(part='snippet,status', body=body, media_body=MediaFileUpload(video, chunksize=8 * 1024 * 1024, resumable=True))
res = None
while res is None: _, res = req.next_chunk()
print(json.dumps({'platform': 'youtube', 'id': res['id'], 'url': f"https://youtube.com/watch?v={res['id']}"}))
