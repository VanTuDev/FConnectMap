# FConnect — Demo

Nền tảng khám phá quán ăn & cafe ở quận Ngũ Hành Sơn, Đà Nẵng.
Front-end Next.js + data mock + AI search qua Google Gemini.

## Tính năng
- **AI Search**: nhập nhu cầu bằng ngôn ngữ tự nhiên (VD "quán cafe yên tĩnh để học, dưới 50k"), Gemini chọn quán phù hợp từ danh sách và giải thích lý do.
- **Mood chips**: tìm nhanh theo mục đích (học, hẹn hò, họp nhóm, check-in, hải sản...).
- **Chi tiết quán**: thông tin, giờ mở cửa, khoảng giá, độ đông, món nổi bật.
- **Đặt bàn (mock)**: form đặt chỗ, trả mã đặt bàn giả lập.

## Cách chạy

1. Cài dependencies:
   ```bash
   npm install
   ```

2. Tạo file `.env.local` (đã có sẵn trong demo này) với key Gemini:
   ```
   GEMINI_API_KEY=AIza...
   ```
   > Lưu ý bảo mật: nên thu hồi key đã lộ và tạo key mới tại https://aistudio.google.com/apikey

3. Chạy dev server:
   ```bash
   npm run dev
   ```
   Mở http://localhost:3000

## Cấu trúc
```
app/
  layout.js              # layout + font
  page.js                # trang chủ (AI search)
  globals.css            # design tokens + style
  api/search/route.js    # gọi Gemini -> chọn quán
  api/booking/route.js   # mock đặt bàn
  quan/[id]/page.js      # chi tiết quán
components/
  Header.js
  PlaceCard.js
  BookingForm.js
data/
  places.js              # mock data các quán (dựa trên quán thật)
```

## Cách AI hoạt động
Server gửi cho Gemini danh sách quán (rút gọn) + nhu cầu người dùng, yêu cầu trả JSON gồm `reply` và `results` (id quán + lý do). Key chỉ nằm ở server, không lộ ra client. Gemini chỉ được chọn trong danh sách có sẵn, không bịa quán mới.

## Mở rộng tiếp
- Thêm bản đồ (Google Maps / Leaflet)
- Lưu lịch sử tìm kiếm để cá nhân hoá
- Review xác thực từ cộng đồng
- Trang dành cho merchant (B2B)
# FConnectMap
