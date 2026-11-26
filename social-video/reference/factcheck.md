# Kiểm số liệu (bắt buộc trước khi dựng)

Mỗi con số trong `brief.json` phải có:
- `value`, `unit`, `period` (9T/2026, Q3/2026, tháng 10/2026…), `basis` (hợp nhất, công ty mẹ, trước/sau thuế)
- `source_urls`: **≥ 2 nguồn độc lập** (ưu tiên: công bố của doanh nghiệp/HOSE/HNX/SSC/NHNN/GSO > báo lớn)
- `checked_at` (giờ VN)

Quy tắc:
1. Hai nguồn lệch nhau → lấy công bố gốc; không có gốc → bỏ con số.
2. Số tự tính (ví dụ năm trước suy ra từ % tăng) phải ghi `derived: true` và trên màn hình ghi "tính từ mức tăng công bố".
3. Không trộn kỳ (quý với lũy kế) trong cùng một so sánh.
4. Thay đổi phương pháp kế toán, hợp nhất, tách/gộp mảng → đưa vào "Mặt khác" nếu làm so sánh kém chính xác.
5. Giá cổ phiếu / chỉ số: ghi thời điểm chính xác; không dự báo giá.
6. Sau khi dựng: đối chiếu lại mọi số trên contact sheet với `brief.json`. Lệch 1 số → sửa trước khi render.
Thiếu chuẩn → **không đăng**, lưu video vào `runs/.../held/` kèm lý do, báo Telegram.
