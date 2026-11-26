#!/usr/bin/env python3
"""List unreplied YouTube comments (list) or reply to one (reply <comment_id> <text>). Uses secrets/youtube_token.json."""
import json, sys, os
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
SEC = os.path.expanduser('~/goc-nhin/secrets'); tok = os.path.join(SEC, 'youtube_token.json')
creds = Credentials.from_authorized_user_file(tok, ['https://www.googleapis.com/auth/youtube'])
if not creds.valid:
    creds.refresh(Request()); open(tok, 'w').write(creds.to_json()); os.chmod(tok, 0o600)
yt = build('youtube', 'v3', credentials=creds)
me = yt.channels().list(part='id', mine=True).execute()['items'][0]['id']
if sys.argv[1] == 'list':
    out, page = [], None
    while True:
        r = yt.commentThreads().list(part='snippet,replies', allThreadsRelatedToChannelId=me, maxResults=100,
                                     pageToken=page, textFormat='plainText').execute()
        for t in r.get('items', []):
            top = t['snippet']['topLevelComment']
            if (top['snippet'].get('authorChannelId') or {}).get('value') == me: continue
            reps = (t.get('replies') or {}).get('comments', [])
            if any((c['snippet'].get('authorChannelId') or {}).get('value') == me for c in reps): continue
            if t['snippet'].get('totalReplyCount', 0) > len(reps): continue  # can't verify; skip
            out.append({'id': top['id'], 'video': t['snippet'].get('videoId'), 'text': top['snippet']['textDisplay']})
        page = r.get('nextPageToken')
        if not page: break
    print(json.dumps(out, ensure_ascii=False, indent=1))
elif sys.argv[1] == 'reply':
    r = yt.comments().insert(part='snippet', body={'snippet': {'parentId': sys.argv[2], 'textOriginal': sys.argv[3]}}).execute()
    print(json.dumps({'ok': True, 'id': r['id']}))
