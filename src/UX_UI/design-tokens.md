# Chuẩn UI / Design Tokens

Mục tiêu: thống nhất màu sắc, spacing, typography và các thuộc tính giao diện để review UX/UI, đảm bảo tính nhất quán khi mở rộng.

## Tổng quan

- Nền tảng UI: Ant Design (mặc định), kết hợp các styles tuỳ chỉnh trong `src/styles/`.
- Tokens đề xuất dưới đây phản ánh thực tế hiện dùng (primary, spacing form/gutter, label) và mở rộng cho các trường hợp mới.

## Màu sắc (Colors)

- Primary: `#1677ff` (AntD primary)
- Primary Hover: `#4096ff`
- Success: `#52c41a`
- Warning: `#faad14`
- Danger: `#ff4d4f`
- Text: `#1f1f1f`
- Text Secondary: `#595959`
- Border: `#d9d9d9`
- Background: `#ffffff`
- Background Soft: `#f6f8fb` (đã dùng ở cover card job/saved)

## Spacing (khoảng cách)

- Base unit: `4px`
- Scale: `4, 6, 8, 12, 16, 20, 24, 32`
- Lưu ý hiện tại:
  - `gutter` lưới filter Jobs: `8px`
  - `margin-bottom` cho `Form.Item`: `6px`

## Typography

- Font: `system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"`
- Size: `12, 14, 16, 18, 20, 24`
- Weight: `400, 500, 600`
- Line-height: `1.4, 1.5, 1.6`

## Border Radius & Shadow

- Radius: `4, 6, 8` (card/ảnh brand đang dùng ~`8px`)
- Shadow (nhẹ): `0 2px 6px rgba(0,0,0,0.06)`
- Shadow (trung bình): `0 4px 12px rgba(0,0,0,0.08)`

## CSS Variables (đề xuất)

Để dễ áp dụng thống nhất, có thể định nghĩa sẵn biến CSS:

```css
:root {
  /* Colors */
  --color-primary: #1677ff;
  --color-primary-hover: #4096ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-danger: #ff4d4f;
  --color-text: #1f1f1f;
  --color-text-secondary: #595959;
  --color-border: #d9d9d9;
  --color-bg: #ffffff;
  --color-bg-soft: #f6f8fb;

  /* Spacing */
  --space-4: 4px;
  --space-6: 6px;
  --space-8: 8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-20: 20px;
  --space-24: 24px;
  --space-32: 32px;

  /* Radius */
  --radius-4: 4px;
  --radius-6: 6px;
  --radius-8: 8px;
  --radius-round: 999px;

  /* Typography */
  --font-sans: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  --font-size-12: 12px;
  --font-size-14: 14px;
  --font-size-16: 16px;
  --font-size-18: 18px;
  --font-size-20: 20px;
  --font-size-24: 24px;
  --line-140: 1.4;
  --line-150: 1.5;
  --line-160: 1.6;

  /* Shadows */
  --shadow-soft: 0 2px 6px rgba(0,0,0,0.06);
  --shadow-medium: 0 4px 12px rgba(0,0,0,0.08);
}
```

## Mapping vào UI hiện tại

- Jobs Filter Grid:
  - Label dùng `--color-text-secondary`, khoảng cách `--space-6`.
  - Gutter hàng/cột: `--space-8`.
  - Nút hành động riêng hàng cuối, dùng `--color-primary`.

- Card Job / Saved Jobs:
  - Cover nền mềm: `--color-bg-soft`.
  - Bo góc đề xuất: `--radius-6` hoặc `--radius-8`.
  - Shadow nhẹ: `--shadow-soft`.

- Header/Navigation:
  - Màu nhấn theo `--color-primary`.
  - Avatar/Badge sử dụng gradient tiệp với primary.

## Hướng dẫn áp dụng

- Khai báo block class (ví dụ `filter-grid`, `job-card`) và dùng biến CSS tương ứng.
- Ví dụ nhanh:

```css
.filter-grid .ant-form-item-label > label {
  color: var(--color-text-secondary);
}
.filter-grid .ant-form-item {
  margin-bottom: var(--space-6);
}
.job-card .ant-card-cover {
  background: var(--color-bg-soft);
  border-radius: var(--radius-6);
}
```

## Gợi ý mở rộng

- Theme Ant Design: có thể đồng bộ hoá `token` của AntD với các biến trên để đảm bảo hiệu lực toàn cục.
- Thiết lập dark mode: thêm tập biến `--color-*` cho nền tối (ví dụ text `#f0f0f0`, bg `#141414`).