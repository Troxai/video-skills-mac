#!/usr/bin/env python3
"""Kiểm token 90plus còn dùng được (chỉ đọc, không in token)."""
import os, requests
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
S = os.path.expanduser('~/90plus/secrets')
c = Credentials.from_authorized_user_file(f'{S}/youtube_token.json')
if not c.valid and c.refresh_token: c.refresh(Request()); open(f'{S}/youtube_token.json', 'w').write(c.to_json())
ch = build('youtube', 'v3', credentials=c).channels().list(part='snippet', mine=True).execute()['items'][0]['snippet']['title']
print('YouTube OK:', ch)
env = dict(l.strip().split('=', 1) for l in open(f'{S}/facebook.env') if '=' in l and not l.startswith('#'))
r = requests.get(f"https://graph.facebook.com/{env.get('FB_API','v21.0')}/{env['FB_PAGE_ID']}", params={'fields': 'name', 'access_token': env['FB_PAGE_TOKEN']}, timeout=30).json()
print('Facebook:', r.get('name') or r.get('error', {}).get('message'))
