import axios from "axios";
import { notification } from "antd";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Queue để lưu các request đang chờ refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const handleRefreshToken = async () => {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        });
    }

    isRefreshing = true;
    try {
        const refreshToken = localStorage.getItem("refresh_token");
        const res = await instance.get('/api/v1/auth/refresh', {
            headers: refreshToken ? { 'X-Refresh-Token': refreshToken } : {}
        });
        // Endpoint refresh trả kiểu đơn giản: { access_token }
        if (res?.data && res.data.access_token) {
            localStorage.setItem("access_token", res.data.access_token);
            processQueue(null, res.data.access_token);
            return res.data.access_token;
        }
        throw new Error("No access token in refresh response");
    } catch (error) {
        console.error("Error refreshing token:", error);
        processQueue(error, null);
        throw error;
    } finally {
        isRefreshing = false;
    }
};

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
instance.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và không phải là request refresh token
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/v1/auth/refresh') {
            originalRequest._retry = true;

            try {
                const newToken = await handleRefreshToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return instance(originalRequest);
            } catch (refreshError) {
                console.error("Failed to refresh token:", refreshError);
                // Chỉ chuyển hướng về login nếu không phải là request getAccount
                if (originalRequest.url !== '/api/v1/auth/account') {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        // Xử lý lỗi 403
        if (error.response?.status === 403) {
            notification.error({
                message: "Không có quyền truy cập",
                description: error.response?.data?.message || "Bạn không có quyền sử dụng chức năng này."
            });
        }

        return Promise.reject(error);
    }
);

export default instance;
