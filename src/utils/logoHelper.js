/**
 * Trả về URL ảnh logo công ty.
 * - Nếu logo là URL đầy đủ (http/https) → dùng thẳng
 * - Nếu là tên file → ghép với backend URL
 */
export const getCompanyLogoUrl = (logo) => {
    if (!logo) return "";
    if (logo.startsWith("http://") || logo.startsWith("https://")) {
        return logo;
    }
    return `${import.meta.env.VITE_BACKEND_URL}/storage/company/${logo}`;
};
