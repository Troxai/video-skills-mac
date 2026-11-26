#!/usr/bin/env python3
"""Chạy `comments_ipv4.py fb_audit` và tóm tắt: python3 scripts/fb_audit_summary.py"""
import json, os, subprocess, sys

here = os.path.dirname(os.path.abspath(__file__))
out = subprocess.run([sys.executable, os.path.join(here, "comments_ipv4.py"), "fb_audit"],
                     capture_output=True, text=True, timeout=180).stdout
d = json.loads(out[out.index("{"):])
for k, v in d.items():
    if not isinstance(v, list):
        print(k, ":", str(v)[:200])
for k, v in d.items():
    if isinstance(v, list):
        print("==", k, len(v))
        for x in v:
            c = x.get("comment", x)
            p = x.get("post", {})
            print(c.get("id"), c.get("created_time", "")[:10],
                  "REPLY" if c.get("parent") else "TOP", x.get("replied"),
                  "|", c.get("message", "")[:160].replace("\n", " "),
                  "|| post:", (p.get("message") or "")[:60])
