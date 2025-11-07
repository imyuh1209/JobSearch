# Company UI

## Chi tiết công ty (`/company/:id`)

- UI: `src/pages/company/details.jsx`
  - Tải thông tin công ty qua `callFetchCompanyById(id)`.
  - Tải danh sách job thuộc công ty qua `fetchJobsByCompanyAPI(id)`.
  - Điều hướng tới chi tiết job: `navigate(/job/:id)`.

## Danh sách công ty (`/company`)

- Thư mục: `src/pages/company/`
- Styles liên quan: `src/styles/CompanyList.css`