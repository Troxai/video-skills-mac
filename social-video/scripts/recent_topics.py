#!/usr/bin/env python3
"""Liệt kê topic/angle/title của các brief gần nhất (mặc định 14 ngày)."""
import json, glob, sys, datetime
days = int(sys.argv[1]) if len(sys.argv) > 1 else 14
cut = (datetime.date.today() - datetime.timedelta(days=days)).isoformat()
for f in sorted(glob.glob('runs/*/*/brief.json')):
    d = f.split('/')[1]
    if d < cut:
        continue
    try:
        b = json.load(open(f))
    except Exception as e:
        print(f, 'ERR', e); continue
    print(d, f.split('/')[2], '|', b.get('topic'), '|', b.get('title'), '|', b.get('angle'))
