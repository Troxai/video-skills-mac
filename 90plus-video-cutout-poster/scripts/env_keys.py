#!/usr/bin/env python3
"""Print only KEY NAMES (never values) of secrets files, plus JSON key structure."""
import json, os, sys
S = os.path.expanduser("~/90plus/secrets")
for f in sorted(os.listdir(S)):
    p = os.path.join(S, f)
    if f.endswith(".env"):
        keys = [l.split("=", 1)[0].strip() for l in open(p) if "=" in l and not l.lstrip().startswith("#")]
        print(f, keys)
    elif f.endswith(".json"):
        try:
            d = json.load(open(p))
            print(f, {k: (list(v.keys()) if isinstance(v, dict) else type(v).__name__) for k, v in d.items()})
        except Exception as e:
            print(f, "unreadable", type(e).__name__)
    else:
        print(f)
