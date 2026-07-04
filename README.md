# Zenith AI - Premium Landing Page

Giao diện Landing Page cao cấp, phản hồi (responsive) và có tính tương tác cao dành cho **Zenith AI** - Không gian làm việc thông minh thế hệ mới tích hợp các AI Agents tự chủ.

Dự án được xây dựng hoàn toàn bằng **HTML5**, **Vanilla CSS (CSS Custom Properties)** và **Modern JavaScript (Vanilla)** để đạt hiệu năng tối ưu (100 điểm Lighthouse) và khả năng tùy chỉnh giao diện linh hoạt.

## 🚀 Các Tính Năng Nổi Bật

1. **Giao Diện Hiện Đại & Cao Cấp (Premium Aesthetics):**
   - Thiết kế Dark Mode mặc định sang trọng với các dải màu Gradient chuyển tiếp mượt mà.
   - Hỗ trợ đầy đủ Light Mode được tối ưu hóa độ tương phản cao.
   - Các hiệu ứng viền phát sáng (neon glow), bóng đổ động và chuyển động micro-animations khi di chuột.
2. **Dịch Đa Ngôn Ngữ Việt - Anh (i18n):**
   - Chuyển đổi ngôn ngữ tức thì giữa Tiếng Việt và Tiếng Anh chỉ với một nút bấm.
   - Tự động duy trì trạng thái ngôn ngữ qua các phiên tải lại trang (F5) sử dụng `localStorage`.
   - Bộ dịch DOM Walker đệ quy hiệu năng cao tự động biên dịch văn bản tĩnh, thuộc tính `placeholder`, tooltip `title` và các kịch bản động (nhật ký simulator, chatbot, giỏ hàng).
3. **Tối Ưu Hiệu Năng Đỉnh Cao (Lighthouse >95+):**
   - **Nhúng CSS Trực Tiếp (Inlined CSS):** Toàn bộ file CSS đã nén được nhúng thẳng vào file HTML, loại bỏ hoàn toàn yêu cầu mạng chặn dựng hình (Render-blocking CSS request), tối ưu chỉ số FCP và LCP về mức tối thiểu.
   - **Triệt tiêu Forced Reflow (Layout Thrashing):** Sử dụng `ResizeObserver` thay thế vòng lặp cuộn trang đệ quy `requestAnimationFrame` trên load. Đồng thời lưu bộ nhớ đệm (caching) chiều cao cuộn trang của tài liệu để tránh đọc trực tiếp hình học trong sự kiện cuộn chuột.
4. **Bộ Trình Diễn AI Tương Tác (Interactive AI Simulator):**
   - Giả lập bảng console gõ lệnh và xuất phản hồi thực tế của AI Agents theo từng chủ đề: viết bài marketing, sửa lỗi code, nghiên cứu thị trường.
5. **Chuyển Đổi Bảng Giá Linh Hoạt (Pricing Switcher) & Giỏ Hàng:**
   - Công tắc chuyển đổi thanh toán Theo tháng / Theo năm cập nhật giá tiền theo thời gian thực với hiệu ứng chuyển đổi mượt màng.
   - Giỏ hàng sidebar (Cart Drawer) hỗ trợ thêm/bớt addon tiện ích mở rộng, tính tổng chi phí động, quản lý lịch sử xem và lưu gói cước yêu thích.
6. **Hệ Thống Trả Lời FAQ Thông Minh:**
   - Các hộp Accordion mở rộng/thu hẹp mượt mà sử dụng thuộc tính chiều cao động.
7. **Form Đăng Ký Kiểm Thử Tích Hợp:**
   - Hỗ trợ kiểm tra dữ liệu đầu vào phía Client và hiển thị trạng thái đang xử lý (loading spinner), thông báo thành công hoặc lỗi với hiệu ứng Toast.
8. **Thiết Kế Phản Hồi Toàn Diện (Responsive Design):**
   - Hiển thị hoàn hảo trên các thiết bị Mobile, Tablet, Laptop và Desktop cỡ lớn.
   - Hỗ trợ menu trượt cho thiết bị di động.

## 📁 Cấu Trúc Dự Án

```text
LandingPageTest/
├── public/          # Thư mục chứa tài nguyên tĩnh public (được deploy trực tiếp)
│   ├── index.html   # Cấu trúc HTML chính & Thẻ SEO Meta & Inlined CSS
│   ├── style.css    # CSS nguồn phục vụ phát triển
│   ├── style.min.css# CSS đã nén (minified)
│   ├── app.js       # JS nguồn xử lý logic giao diện, hiệu ứng tương tác & mô phỏng
│   └── app.min.js   # JS đã nén (minified) và tối ưu hóa
├── tests/           # Kịch bản kiểm thử tự động (Playwright)
├── wrangler.jsonc   # Cấu hình deploy Cloudflare Pages/Workers
└── README.md        # Tài liệu hướng dẫn dự án
```

## 🛠️ Hướng Dẫn Sử Dụng & Chạy Thử

Do dự án sử dụng HTML/CSS/JS thuần và không có các dependency phức tạp, bạn có thể chạy thử dự án bằng một trong những cách sau:

### Cách 1: Mở Trực Tiếp trong Trình Duyệt
1. Click đúp chuột vào file `index.html` trong thư mục `public` để mở trực tiếp trên trình duyệt.

### Cách 2: Sử Dụng Live Server (Khuyên dùng)
Nếu bạn dùng **VS Code**, bạn có thể:
1. Cài đặt extension **Live Server**.
2. Nhấn nút **Go Live** ở góc dưới cùng bên phải hoặc click chuột phải vào file `public/index.html` và chọn **Open with Live Server**.

### Cách 3: Chạy Server Tĩnh qua Terminal
Bạn có thể khởi động server tĩnh cực kỳ nhanh chóng bằng các lệnh sau:

*Sử dụng Python:*
```bash
python -m http.server 8000
```
Sau đó truy cập địa chỉ: `http://localhost:8000`

*Sử dụng Node.js (npx):*
```bash
npx http-server -p 8000
```
Sau đó truy cập địa chỉ: `http://localhost:8000`

---

## 🏗️ Quy Trình Phát Triển & Biên Dịch (Build Tooling)

Dự án sử dụng Clean-CSS và Terser để tối ưu hóa tệp tĩnh trước khi đưa lên môi trường thử nghiệm/sản xuất:

*Biên dịch & nén CSS:*
```bash
npx --yes clean-css-cli -o public/style.min.css public/style.css
```

*Biên dịch & nén JavaScript:*
```bash
npx --yes terser -c -m -o public/app.min.js -- public/app.js
```

*Chạy kiểm thử tự động (Playwright tests):*
```bash
# Cài đặt playwright locally nếu chưa có
npm install -D @playwright/test
# Chạy bộ test kiểm thử độ ổn định layout và cuộn trang
npx playwright test
```

## 🌐 Hướng Dẫn Triển Khai Lên Đám Mây (Cloud Deployment)

Trang web tĩnh này cực kỳ dễ triển khai lên bất kỳ nền tảng đám mây nào với chi phí 0đ:

### 1. Triển khai lên GitHub Pages (Tự động hóa hoàn toàn)
Dự án đã tích hợp sẵn workflow GitHub Actions tại `.github/workflows/static.yml`. Để chạy tự động:
1. Đẩy code lên GitHub.
2. Truy cập vào **Settings** của repository trên GitHub.
3. Chọn mục **Pages** ở thanh bên trái.
4. Tại phần **Build and deployment** -> **Source**, chọn **GitHub Actions**.
5. Kể từ lúc này, mỗi khi bạn push code mới vào nhánh `main` hoặc `production/deploy`, GitHub sẽ tự động chạy biên dịch và triển khai trang web của bạn lên liên kết `<username>.github.io/LandingPageTest`.

### 2. Triển khai lên Vercel (Khuyên dùng cho hiệu năng cao)
Vercel tự động nhận diện trang tĩnh HTML thuần rất tốt:
1. Truy cập [Vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
2. Chọn **Add New** -> **Project** -> Chọn repository `LandingPageTest`.
3. Nhấp nút **Deploy** (không cần cấu hình thêm bất kỳ build command hay install command nào).
4. Vercel sẽ cấp cho bạn một tên miền phụ `.vercel.app` miễn phí có hỗ trợ sẵn giao thức HTTPS bảo mật và CDN tải trang siêu tốc.

### 3. Triển khai lên Netlify
1. Truy cập [Netlify.com](https://netlify.com).
2. Kết nối với GitHub và chọn repository `LandingPageTest`.
3. Để trống mục **Build Command** và **Publish Directory** (để mặc định là thư mục gốc `.`).
4. Nhấn **Deploy** để hoàn tất.