# Chạy script Python với kết nối chỉ IPv4 (IPv6 của VPS không ra được Google)
import socket, runpy, sys
_g = socket.getaddrinfo
socket.getaddrinfo = lambda h, p, f=0, *a, **k: _g(h, p, socket.AF_INET, *a, **k)
sys.argv = sys.argv[1:]
runpy.run_path(sys.argv[0], run_name='__main__')
