"""Run a comment script over IPv4 (this process only): comments_ipv4.py <fb|fb_audit|yt> [args...]"""
import os, runpy, socket, sys

SCRIPTS = {"fb": "fb_comments.py", "fb_audit": "fb_comments_audit.py", "yt": "yt_comments.py"}
_orig = socket.getaddrinfo
socket.getaddrinfo = lambda host, port, family=0, *a, **k: _orig(host, port, socket.AF_INET, *a, **k)
target = os.path.join(os.path.dirname(os.path.abspath(__file__)), SCRIPTS[sys.argv[1]])
sys.argv = [target, *sys.argv[2:]]
runpy.run_path(target, run_name="__main__")
