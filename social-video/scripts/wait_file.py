#!/usr/bin/env python3
"""Chờ (chạy ở tiền cảnh, hợp cron) tới khi file log có một trong các chuỗi: wait_file.py <log> <giây tối đa> <chuỗi>..."""
import sys
import time

log, limit, keys = sys.argv[1], float(sys.argv[2]), sys.argv[3:]
end = time.time() + limit
while True:
    s = open(log, errors='replace').read()
    if any(k in s for k in keys) or time.time() > end:
        print(s[-2000:])
        break
    time.sleep(10)
