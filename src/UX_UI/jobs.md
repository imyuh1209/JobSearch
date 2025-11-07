# Jobs UI

## Danh sách Jobs (`/job`)

- Thành phần chính: `src/components/client/card/job.card.jsx`
  - Hiển thị bộ lọc lưới, label inline, nút hành động riêng hàng.
  - Hỗ trợ lưu/bỏ lưu job, trạng thái đã lưu đồng bộ qua API.
  - Phân trang có/không hiển thị tùy thuộc vào `showPagination`.
  - Liên quan styles: `src/styles/client.module.scss` (spacing, label màu, form item margin).

## Chi tiết Job (`/job/:id`)

- UI: `src/pages/job/details.jsx`
  - Kiểm tra trạng thái đã lưu (`callIsSavedJob`) và toggle lưu/bỏ lưu.
  - Điều hướng quay lại danh sách hoặc sang công ty/job khác.

## Công việc đã lưu (`/saved-jobs`)

- UI: `src/pages/job/saved.jobs.jsx`
  - Tải danh sách đã lưu của người dùng hiện tại (`callFetchSavedJobs`).
  - Xóa item đã lưu bằng `callDeleteSavedJobBySavedId`.
  - Điều hướng tới chi tiết job bằng `navigate(/job/:id)`.

## API liên quan

- Trong `src/services/api.service.js`:
  - `callSaveJob(jobId)`, `callUnsaveByJobId(jobId)`, `callIsSavedJob(jobId)`, `callFetchSavedJobs()`, `callDeleteSavedJobBySavedId(savedId)`.