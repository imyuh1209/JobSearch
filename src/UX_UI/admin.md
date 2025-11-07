# Admin UI

## Trang quản trị (`/admin`)

- Tabs quản lý Jobs: `src/pages/admin/job/manage.jsx`
  - Chứa tab `Quản lý Jobs` → render `src/pages/admin/job/job.jsx`.

## Quản lý Jobs

- Danh sách, lọc, phân trang: `src/pages/admin/job/job.jsx`
  - Dùng `fetchAllJobAPI(query)` để tải danh sách.
  - `handleSearch(values)` cập nhật trực tiếp theo filter.

## Phân quyền/Permission

- Trang: `src/pages/admin/permission.jsx`
  - Có nhóm API Saved Jobs hiển thị trong module `SAVED_JOB`.
- Thành phần Module API: `src/components/admin/role/module.api.jsx`
  - Gộp các quyền Saved Jobs vào nhóm Jobs để hiển thị trong Role modal.

## Quản lý người dùng

- Trang: `src/pages/admin/user.jsx`
  - Lọc, phân trang, gọi `FetchAllUsers`.