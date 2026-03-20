# JobHunter - Frontend Web Application (React.js)

Giao diện người dùng hiện đại cho dự án **JobHunter**, cung cấp trải nghiệm tìm kiếm việc làm và quản trị tuyển dụng chuyên nghiệp.

---

## �️ Công nghệ sử dụng

- **Framework:** React.js 18 (Vite)
- **UI Library:** Ant Design (antd)
- **State Management:** React Context API
- **HTTP Client:** Axios (Xử lý JWT, Refresh Token, Interceptors)
- **Routing:** React Router DOM v6
- **Date Utility:** Day.js (Hỗ trợ định dạng thời gian tiếng Việt)
- **Styling:** SCSS & CSS Modules
- **Tiện ích khác:** React Device Detect, DOMPurify, Marked

---

## 🏗️ Cấu trúc dự án (Project Structure)

```text
src/
├── components/   # Các components dùng chung (Admin, Client, Common, Context)
├── config/       # Cấu hình permissions, utils, hằng số
├── pages/        # Các trang chính (Account, Admin, Job, Static, Auth)
├── services/     # Lớp gọi API (api.service.js, axios.customize.js)
├── styles/       # Cấu hình SCSS, Design Tokens
└── utils/        # Các hàm tiện ích bổ trợ
```

---

## 🚀 Hướng dẫn khởi chạy (Running the project)

### 1. Yêu cầu hệ thống
- **Node.js:** Phiên bản 18.x trở lên.
- **npm** hoặc **yarn**.

### 2. Cấu hình Môi trường (Environment)
Tạo hoặc mở file `.env.development` và cập nhật URL của Backend API:
```env
VITE_BACKEND_URL=http://localhost:8080
```

### 3. Cài đặt và Chạy
Dùng lệnh sau trong terminal:
```bash
# Cài đặt thư viện
npm install

# Chạy ở chế độ phát triển
npm run dev
```

Ứng dụng sẽ mặc định chạy tại: `http://localhost:5173`

---

## 📑 Kết nối với Backend
Dự án này yêu cầu Backend API để hoạt động.
- **Backend Repository:** [imyuh1209/dacn-backend](https://github.com/imyuh1209/dacn-backend.git)
- **Framework:** Spring Boot 3.4.2 (JDK 21)

---

## 🌟 Các tính năng chính của Frontend
- **Tìm kiếm & Lọc nâng cao:** Gửi query string chuẩn hóa tới Backend thông qua `spring-filter`.
- **Hệ thống Thông báo:** Nhận thông báo thời gian thực, đánh dấu đã đọc, và phân loại thông báo hệ thống.
- **Quản lý Tài khoản:** Cập nhật thông tin, đổi mật khẩu, quản lý danh sách hồ sơ (Resume) đã nộp.
- **Giao diện Admin chuyên sâu:** Quản lý toàn bộ hệ thống (User, Role, Permission, Job, Company, Banner).
- **Responsive Design:** Tương thích tốt trên cả Desktop và Mobile.
- **Xác thực JWT:** Tự động xử lý Refresh Token khi Access Token hết hạn.

---

## � Giấy phép
Dự án được thực hiện cho mục đích học tập và đồ án tốt nghiệp.
