#!/usr/bin/env python3
"""In ngày | tiêu đề | link từ file RSS đã tải: python3 -I scripts/rss_titles.py <file>..."""
import re
import sys
from html import unescape

def tag(block, name):
    m = re.search(rf'<{name}>(.*?)</{name}>', block, re.S)
    return unescape(re.sub(r'<!\[CDATA\[|\]\]>', '', m.group(1))).strip() if m else ''

for path in sys.argv[1:]:
    print('##', path)
    with open(path, encoding='utf-8', errors='replace') as f:
        for item in re.findall(r'<item>(.*?)</item>', f.read(), re.S)[:45]:
            print(tag(item, 'pubDate'), '|', tag(item, 'title'), '|', tag(item, 'link'))
