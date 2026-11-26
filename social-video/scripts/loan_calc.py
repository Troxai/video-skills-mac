"""Tính tiền trả hàng tháng (gốc+lãi đều, annuity). Dùng: python3 scripts/loan_calc.py <số tiền> <tháng> <lãi1> [lãi2 ...]"""
import sys

L, n = float(sys.argv[1]), int(sys.argv[2])
for r in sys.argv[3:]:
    i = float(r) / 1200
    pay = L * i / (1 - (1 + i) ** -n)
    print(f"{r}%/năm: {pay/1e6:.2f} triệu/tháng; lãi tháng đầu {L*i/1e6:.2f} triệu; tổng lãi {(pay*n-L)/1e6:.0f} triệu")
