# JobHunter - Nền tảng kết nối ứng viên và nhà tuyển dụng

JobHunter là một ứng dụng web hiện đại được xây dựng để kết nối ứng viên tìm kiếm việc làm và nhà tuyển dụng một cách hiệu quả, minh bạch.

## 🚀 Tính năng chính

### Dành cho Ứng viên (Client)
- **Tìm kiếm việc làm:** Tìm kiếm theo tiêu đề, công ty, kỹ năng và mức lương.
- **Quản lý hồ sơ:** Cập nhật thông tin cá nhân, quản lý CV đã tải lên.
- **Lịch sử ứng tuyển:** Theo dõi trạng thái hồ sơ ứng tuyển (Pending, Approved, Rejected).
- **Hệ thống thông báo:** Nhận thông báo thời gian thực khi trạng thái hồ sơ thay đổi hoặc có thông báo mới từ hệ thống.
- **Việc làm đã lưu:** Lưu lại các công việc quan tâm để xem sau.

### Dành cho Nhà tuyển dụng & Quản trị viên (Admin)
- **Quản lý Công ty:** Quản lý thông tin và logo các công ty đối tác.
- **Quản lý Việc làm:** Đăng tuyển, cập nhật và quản lý trạng thái các vị trí tuyển dụng.
- **Quản lý Hồ sơ (Resume):** Duyệt và cập nhật trạng thái hồ sơ của ứng viên.
- **Quản lý Người dùng:** Phân quyền người dùng theo Role (Admin, HR, User).
- **Quản lý Phân quyền (RBAC):** Cấu hình chi tiết Role và Permission cho từng Module.
- **Thông báo toàn hệ thống (Broadcast):** Admin có thể gửi thông báo đến tất cả người dùng trong hệ thống một cách nhanh chóng (xử lý bất đồng bộ).

## 🛠 Công nghệ sử dụng

### Frontend
- **Framework:** React.js (Vite)
- **UI Library:** Ant Design
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Date Utility:** Day.js

### Backend
- **Repository:** [imyuh1209/dacn-backend](https://github.com/imyuh1209/dacn-backend.git)
- **Framework:** Java Spring Boot
- **Security:** Spring Security (JWT Authentication)
- **Database:** Spring Data JPA
- **Search:** Spring Filter (Turkraft)
- **Email:** Spring Mail Sender

## ⚙️ Cài đặt và Chạy thử

### Yêu cầu hệ thống
- Node.js (v18+)
- Java JDK 17+
- MySQL/PostgreSQL

### Chạy Frontend
1. Truy cập thư mục `DoAnChuyenNganh`
2. Cấu hình file `.env` (VITE_BACKEND_URL)
3. Chạy lệnh:
   ```bash
   npm install
   npm run dev
   ```

### Chạy Backend
1. Clone backend repository: `https://github.com/imyuh1209/dacn-backend.git`
2. Cấu hình `application.properties` (Database, JWT Secret, Mail server)
3. Chạy bằng Maven hoặc IDE (IntelliJ/Eclipse)

## 📄 Giấy phép
Dự án được phát triển phục vụ mục đích học tập và đồ án chuyên ngành.
