# Tổng quan route → file giao diện

Lưu ý: Đây là bản đồ tham chiếu nhanh, không thay đổi cấu trúc mã nguồn hiện tại.

## Client

- `/` (Home)
  - Thư mục: `src/pages/home/`

- `/company` (Danh sách/chi tiết công ty)
  - File chính (chi tiết): `src/pages/company/details.jsx`

- `/job` (Danh sách Jobs)
  - UI chính: `src/components/client/card/job.card.jsx`
  - Styles liên quan: `src/styles/client.module.scss`, `src/styles/JobList.css`

- `/job/:id` (Chi tiết Job)
  - UI: `src/pages/job/details.jsx`

- `/saved-jobs` (Công việc đã lưu)
  - UI: `src/pages/job/saved.jobs.jsx`

- `/account` (Quản lý tài khoản)
  - Thư mục: `src/pages/account/`

- Layout chung
  - Header/Navigation: `src/components/client/layout/header.jsx`

## Admin

- `/admin` (Trang quản trị)
  - Tabs quản lý Jobs: `src/pages/admin/job/manage.jsx`
  - Danh sách Jobs: `src/pages/admin/job/job.jsx`

- Phân quyền/Permission
  - `src/pages/admin/permission.jsx`
  - Thành phần hiển thị group API: `src/components/admin/role/module.api.jsx`

- Quản lý người dùng
  - `src/pages/admin/user.jsx`