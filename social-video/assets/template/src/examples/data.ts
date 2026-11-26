// Nguồn: FPT công bố KQKD 9 tháng 2026, ngày 21/10/2026 (VnEconomy, Mekong ASEAN).
// Đơn vị: tỷ đồng. Giá trị 2025 = tính ngược từ tỷ lệ tăng trưởng công bố.
export const D = {
  revenue: {v: 40023, g: 12.4},
  pbt: {v: 8770, g: 17.0},
  npat: {v: 7778, g: 13.3},
  eps: {v: 4142, g: 12.8},
  tech: {v: 35515, g: 14.8, revShare: 89, pbtShare: 58},
  segments: [
    {name: 'CNTT nước ngoài', v: 28538, g: 11.6},
    {name: 'Giáo dục, đầu tư & khác', v: 4508, g: -3.1},
    {name: 'CNTT trong nước', v: 6977, g: 29.8},
    {name: 'Sản phẩm Made by FPT', v: 2284, g: 19.9},
  ],
  japanG: 17.2, japanYenG: 25.2,
  signed: {v: 36137, g: 23.1, usd: 1.4}, bigDeals: 16,
  dx: {v: 14411, g: 16.3},
  ai: {v: 2915, g: 55},
};
export const prior = (v: number, g: number) => v / (1 + g / 100);
export const fmt = (n: number) => Math.round(n).toLocaleString('de-DE');
export const pct = (g: number) => `${g > 0 ? '+' : ''}${g.toLocaleString('de-DE')}%`;
