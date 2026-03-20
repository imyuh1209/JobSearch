import axios from "./axios.customize";
import axiosLib from "axios";

const axiosPublic = axiosLib.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
});

const loginUserAPI = (username, password) => {
    const URL_BACKEND = "/api/v1/auth/login";
    const data = {
        username: username,
        password: password
    }
    return axios.post(URL_BACKEND, data)
}

const loginWithGoogle = (idToken) => {
    const URL_BACKEND = "/api/v1/auth/google";
    return axiosPublic.post(URL_BACKEND, { idToken });
}

const inspectGoogleToken = (idToken) => {
    const URL_BACKEND = "/api/v1/auth/google/inspect";
    return axiosPublic.post(URL_BACKEND, { idToken });
}

const createUserAPI = (name, email, password, address, age) => {
    const URL_BACKEND = "/api/v1/users";
    const data = {
        name: name,
        password: password,
        email: email,
        address: address,
        age: age
    }
    return axios.post(URL_BACKEND, data)
}

const updateUserAPI = (id, name, address, age, gender) => {
    const URL_BACKEND = "/api/v1/users";
    const data = {
        id: id,
        name: name,
        address: address,
        age: age,
        gender: gender
    }
    return axios.put(URL_BACKEND, data);
}

const deleteUserAPI = (id) => {
    const URL_BACKEND = `/api/v1/users/${id}`;
    return axios.delete(URL_BACKEND);
};

const fetchAllUserAPI = (query) => {
    const URL_BACKEND = `/api/v1/users?${query}`;
    return axios.get(URL_BACKEND)
}

const fetchAllCompanyAPI = (query) => {
    const URL_BACKEND = `/api/v1/companies?${query}`;
    return axios.get(URL_BACKEND)
}

const callFetchCompanyById = (id) => {
    const URL_BACKEND = `/api/v1/companies/${id}`;
    return axios.get(URL_BACKEND)
}

const fetchAllJobAPI = (query) => {
    const URL_BACKEND = `/api/v1/jobs?${query}`;
    return axios.get(URL_BACKEND)
}

const fetchJobsByCompanyAPI = (companyId) => {
    const URL_BACKEND = `/api/v1/companies/jobs/${companyId}`;
    return axios.get(URL_BACKEND)
}

// Fetch jobs belonging to the currently authenticated company
const fetchJobsByCurrentCompanyAPI = () => {
    const URL_BACKEND = "/api/v1/jobs/by-company";
    return axios.get(URL_BACKEND);
}

const callFetchJobById = (id) => {
    const URL_BACKEND = `/api/v1/jobs/${id}`;
    return axios.get(URL_BACKEND)
}

const registerUserAPI = (name, email, password, gender, address) => {
    const URL_BACKEND = "/api/v1/auth/register";
    const data = {
        name: name,
        email: email,
        password: password,
        gender: gender,
        address: address
    }
    return axios.post(URL_BACKEND, data)
}

const deleteCompanyAPI = (id) => {
    const URL_BACKEND = `/api/v1/companies/${id}`;
    return axios.delete(URL_BACKEND);
};

const getAccount = () => {
    const URL_BACKEND = "/api/v1/auth/account";
    return axios.get(URL_BACKEND)
}

const logoutUserAPI = () => {
    const URL_BACKEND = "/api/v1/auth/logout";
    return axios.post(URL_BACKEND);
}

// Change password for current authenticated user
const callChangePassword = (currentPassword, newPassword) => {
    const URL_BACKEND = "/api/v1/auth/change-password";
    return axios.post(URL_BACKEND, { currentPassword, newPassword });
}

const callForgotPassword = (email) => {
    const URL_BACKEND = "/api/v1/auth/forgot-password";
    return axiosPublic.post(URL_BACKEND, { email });
}

const callResetPassword = (token, newPassword) => {
    const URL_BACKEND = "/api/v1/auth/reset-password";
    return axiosPublic.post(URL_BACKEND, { token, newPassword });
}

const callCreateCompany = (data) => {
    const URL_BACKEND = "/api/v1/companies";
    return axios.post(URL_BACKEND, data);
};

const callUpdateCompany = (id, data) => {
    const URL_BACKEND = "/api/v1/companies";
    return axios.put(URL_BACKEND, { ...data, id: id });
};

const callUploadSingleFile = (file, folder) => {
    const URL_BACKEND = "/api/v1/files";
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return axios.post(URL_BACKEND, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const callCreateUser = (data) => {
    const URL_BACKEND = "/api/v1/users";
    return axios.post(URL_BACKEND, data);
}

const callUpdateUser = (id, data) => {
    const URL_BACKEND = "/api/v1/users";
    // Ép kiểu và chuẩn hóa dữ liệu trước khi gửi
    const safeId = Number(id);
    const roleId = data?.role?.id != null ? Number(data.role.id) : undefined;
    const payload = {
        id: Number.isFinite(safeId) ? safeId : undefined,
        name: (data.name ?? "").trim(),
        email: data.email || "",
        gender: data.gender || "MALE",
        address: data.address || "",
        phone: data.phone || "",
        // Gửi cả hai định dạng role để tương thích backend
        ...(roleId ? { roleId } : {}),
        ...(roleId ? { role: { id: roleId } } : {}),
    };
    // Chỉ thêm age khi người dùng cung cấp
    if (data.age != null && Number.isFinite(Number(data.age)) && Number(data.age) > 0) {
        payload.age = Number(data.age);
    }
    return axios.put(URL_BACKEND, payload);
}

const callFetchUserById = (id) => {
    const URL_BACKEND = `/api/v1/users/${id}`;
    return axios.get(URL_BACKEND);
}

const fetchAllSkillAPI = (query) => {
    const URL_BACKEND = `/api/v1/skills?${query}`;
    return axios.get(URL_BACKEND)
}

const callCreateSkill = (data) => {
    const URL_BACKEND = "/api/v1/skills";
    return axios.post(URL_BACKEND, data);
};


const callUpdateSkill = (id, data) => {
    const URL_BACKEND = "/api/v1/skills";
    return axios.put(URL_BACKEND, { ...data, id: id });
};

const callDeleteSkill = (id) => {
    const URL_BACKEND = `/api/v1/skills/${id}`;
    return axios.delete(URL_BACKEND);
};

const callFetchSkillById = (id) => {
    const URL_BACKEND = `/api/v1/skills/${id}`;
    return axios.get(URL_BACKEND);
};

const callCreateJob = (data) => {
    const URL_BACKEND = "/api/v1/jobs";
    return axios.post(URL_BACKEND, data);
};

const callUpdateJob = (id, data) => {
    const URL_BACKEND = "/api/v1/jobs";
    return axios.put(URL_BACKEND, { ...data, id: id });
};

const callDeleteJob = (id) => {
    const URL_BACKEND = `/api/v1/jobs/${id}`;
    return axios.delete(URL_BACKEND);
};

const fetchAllResumeAPI = (query) => {
    const URL_BACKEND = `/api/v1/resumes?${query}`;
    return axios.get(URL_BACKEND);
};

const callDeleteResume = (id) => {
    const URL_BACKEND = `/api/v1/resumes/${id}`;
    return axios.delete(URL_BACKEND);
};

const callUpdateResumeStatus = (id, status) => {
    const URL_BACKEND = "/api/v1/resumes";
    return axios.put(URL_BACKEND, { id: id, status: status });
};

// Send email to applicant when resume status changes
// Backend is expected to handle email content/template
const callSendResumeStatusEmail = (resumeId, status) => {
    const URL_BACKEND = "/api/v1/resumes/status-email";
    return axios.post(URL_BACKEND, { resumeId, status });
};

const callFetchResumeById = (id) => {
    const URL_BACKEND = `/api/v1/resumes/${id}`;
    return axios.get(URL_BACKEND);
};

const fetchAllPermissionAPI = (query) => {
    const URL_BACKEND = `/api/v1/permissions?${query}`;
    return axios.get(URL_BACKEND);
};

const callCreatePermission = (data) => {
    const URL_BACKEND = "/api/v1/permissions";
    return axios.post(URL_BACKEND, data);
};

const callUpdatePermission = (data, id) => {
    const URL_BACKEND = "/api/v1/permissions";
    return axios.put(URL_BACKEND, { ...data, id: id });
};

const callDeletePermission = (id) => {
    const URL_BACKEND = `/api/v1/permissions/${id}`;
    return axios.delete(URL_BACKEND);
};

const callFetchPermissionById = (id) => {
    const URL_BACKEND = `/api/v1/permissions/${id}`;
    return axios.get(URL_BACKEND);
};

//role APIs

const fetchAllRoleAPI = (query) => {
    const URL_BACKEND = `/api/v1/roles?${query}`;
    return axios.get(URL_BACKEND);
};

const callCreateRole = (data) => {
    const URL_BACKEND = "/api/v1/roles";
    return axios.post(URL_BACKEND, data);
};

const callUpdateRole = (data) => {
    const URL_BACKEND = "/api/v1/roles";
    return axios.put(URL_BACKEND, data);
};

const callDeleteRole = (id) => {
    const URL_BACKEND = `/api/v1/roles/${id}`;
    return axios.delete(URL_BACKEND);
};

const callFetchRoleById = (id) => {
    const URL_BACKEND = `/api/v1/roles/${id}`;
    return axios.get(URL_BACKEND);
};

const callCreateResume = (urlCV, jobId, email, userId) => {
    const URL_BACKEND = "/api/v1/resumes";
    const data = {
        url: urlCV,
        email: email,
        status: "PENDING",
        user: { id: userId },
    };
    // Chỉ đính kèm job khi có jobId hợp lệ
    if (jobId) {
        data.job = { id: jobId };
    }
    return axios.post(URL_BACKEND, data);
}

const callFetchResumeByUser = () => {
    const URL_BACKEND = "/api/v1/resumes/by-user";
    return axios.post(URL_BACKEND);
}

// New Resume endpoints: split uploads vs applications
const listMyUploads = () => {
    const URL_BACKEND = "/api/v1/resumes/my-uploads";
    return axios.get(URL_BACKEND);
};

// Application history for current user (GET variant)
const listMyApplications = () => {
    const URL_BACKEND = "/api/v1/resumes/by-user";
    return axios.get(URL_BACKEND);
};

// Apply job using a saved resume
const applyJob = (jobId, resumeId) => {
    const URL_BACKEND = `/api/v1/jobs/${jobId}/apply`;
    return axios.post(URL_BACKEND, { resumeId });
};

// Subscriber APIs
const callCreateSubscriber = (data) => {
    const URL_BACKEND = "/api/v1/subscribers";
    return axios.post(URL_BACKEND, data);
};

const callGetSubscriberSkills = () => {
    const URL_BACKEND = "/api/v1/subscribers/skills";
    return axios.get(URL_BACKEND);
};

const callUpdateSubscriber = (data) => {
    const URL_BACKEND = "/api/v1/subscribers";
    return axios.put(URL_BACKEND, data);
};
// Save Job APIs
const callSaveJob = (jobId) => axios.post(`/api/v1/saved-jobs?jobId=${jobId}`);
const callFetchSavedJobs = () => axios.get(`/api/v1/saved-jobs`);
const callDeleteSavedJobBySavedId = (savedId) => axios.delete(`/api/v1/saved-jobs/${savedId}`);
// Xoá theo jobId (ưu tiên):
const callUnsaveByJobId = (jobId) => axios.delete(`/api/v1/saved-jobs/${jobId}?byJobId=true&jobId=${jobId}`);
// Kiểm tra trạng thái đã lưu theo jobId
const callIsSavedJob = (jobId) => axios.get(`/api/v1/saved-jobs/is-saved?jobId=${jobId}`);

// ===== Banner APIs =====
// Public endpoint to fetch active banners for homepage
const callFetchHomeBanners = () => {
    const URL_BACKEND = "/api/v1/banners/home";
    return axios.get(URL_BACKEND);
};

// Admin endpoints for managing banners
const fetchAllBannerAPI = (query) => {
    const URL_BACKEND = `/api/v1/banners?${query}`;
    return axios.get(URL_BACKEND);
};

const callCreateBanner = (data) => {
    const URL_BACKEND = "/api/v1/banners";
    return axios.post(URL_BACKEND, data);
};

const callUpdateBanner = (id, data) => {
    const URL_BACKEND = "/api/v1/banners";
    return axios.put(URL_BACKEND, { ...data, id });
};

const callDeleteBanner = (id) => {
    const URL_BACKEND = `/api/v1/banners/${id}`;
    return axios.delete(URL_BACKEND);
};

const callFetchBannerById = (id) => {
    const URL_BACKEND = `/api/v1/banners/${id}`;
    return axios.get(URL_BACKEND);
};

// Saved Search / Job Alerts APIs
const createSavedSearch = (payload) => {
    const URL_BACKEND = "/api/v1/saved-searches";
    return axios.post(URL_BACKEND, payload);
};

const listSavedSearches = () => {
    const URL_BACKEND = "/api/v1/saved-searches";
    return axios.get(URL_BACKEND);
};

const deleteSavedSearch = (id) => {
    const URL_BACKEND = `/api/v1/saved-searches/${id}`;
    return axios.delete(URL_BACKEND);
};

const runAlert = (id) => {
    const URL_BACKEND = `/api/v1/saved-searches/${id}/run-alert`;
    return axios.post(URL_BACKEND);
};

// Job Alerts APIs: public create via JobAlertController
const createJobAlert = (payload) => {
    const URL_BACKEND = "/api/v1/job-alerts";
    return axiosPublic.post(URL_BACKEND, payload);
};

const createJobAlertAuth = (payload) => {
    const URL_BACKEND = "/api/v1/job-alerts";
    return axios.post(URL_BACKEND, payload);
};

const listJobAlerts = (email) => {
    const base = "/api/v1/job-alerts";
    const url = email ? `${base}?email=${encodeURIComponent(email)}` : base;
    return email ? axiosPublic.get(url) : axios.get(url);
};

const updateJobAlert = (id, payload) => {
    const URL_BACKEND = "/api/v1/job-alerts";
    return axios.put(URL_BACKEND, { ...payload, id });
};

const deleteJobAlert = (id) => {
    const URL_BACKEND = `/api/v1/job-alerts/${id}`;
    return axios.delete(URL_BACKEND);
};

const unsubscribeJobAlert = (token) => {
    const URL_BACKEND = `/api/v1/job-alerts/unsubscribe?token=${encodeURIComponent(token)}`;
    return axiosPublic.get(URL_BACKEND);
};

const runJobAlertNow = (id) => {
    const URL_BACKEND = `/api/v1/job-alerts/${id}/run`;
    return axios.post(URL_BACKEND);
};

// Web Push APIs
const fetchWebPushPublicKey = () => axios.get('/api/v1/webpush/public-key');
const webpushSubscribe = (subscription, channels = ['push']) => {
    const URL_BACKEND = "/api/v1/webpush/subscribe";
    return axios.post(URL_BACKEND, { subscription, channels });
};


// --- THÊM MỚI TỪ ĐÂY ---
const getMyNotificationsAPI = (query) => {
    const URL_BACKEND = `/api/v1/notifications?${query}`;
    return axios.get(URL_BACKEND);
}

const countUnreadNotificationsAPI = () => {
    const URL_BACKEND = "/api/v1/notifications/count-unread";
    return axios.get(URL_BACKEND);
}

const markNotificationAsReadAPI = (id) => {
    const URL_BACKEND = `/api/v1/notifications/${id}/read`;
    return axios.put(URL_BACKEND);
}

const callCreateNotification = (data) => {
    const URL_BACKEND = "/api/v1/notifications";
    return axios.post(URL_BACKEND, data);
}

const callDeleteNotification = (id) => {
    const URL_BACKEND = `/api/v1/notifications/${id}`;
    return axios.delete(URL_BACKEND);
}

const fetchAllNotificationAPI = (query) => {
    const URL_BACKEND = `/api/v1/notifications/admin?${query}`;
    return axios.get(URL_BACKEND);
}
// --- HẾT PHẦN THÊM MỚI ---

export {
    getMyNotificationsAPI,
    countUnreadNotificationsAPI,
    markNotificationAsReadAPI,
    callCreateNotification,
    callDeleteNotification,
    fetchAllNotificationAPI,
    deleteCompanyAPI, logoutUserAPI, getAccount, registerUserAPI, callFetchJobById, fetchAllJobAPI, callFetchCompanyById, fetchAllCompanyAPI,
    loginUserAPI, createUserAPI, fetchAllUserAPI, updateUserAPI, deleteUserAPI, callCreateCompany, callUpdateCompany, callUploadSingleFile,
    loginWithGoogle,
    inspectGoogleToken,
    callCreateUser, callUpdateUser, callFetchUserById,
    // Skill APIs
    fetchAllSkillAPI, callCreateSkill, callUpdateSkill, callDeleteSkill, callFetchSkillById,
    // Job APIs
    callCreateJob, callUpdateJob, callDeleteJob, fetchJobsByCompanyAPI, fetchJobsByCurrentCompanyAPI,
    // Resume APIs
    fetchAllResumeAPI, callDeleteResume, callUpdateResumeStatus, callFetchResumeById, callCreateResume, callFetchResumeByUser,
    listMyUploads, listMyApplications, applyJob,
    callSendResumeStatusEmail,
    // Permission APIs
    fetchAllPermissionAPI, callCreatePermission, callUpdatePermission, callDeletePermission, callFetchPermissionById,
    // Role APIs
    fetchAllRoleAPI, callCreateRole, callUpdateRole, callDeleteRole, callFetchRoleById,
    // Subscriber APIs
    callCreateSubscriber,
    callGetSubscriberSkills,
    callUpdateSubscriber,
  // ... các export cũ
  callSaveJob,
  callFetchSavedJobs,
  callDeleteSavedJobBySavedId,
  callUnsaveByJobId,
  callIsSavedJob,
  callChangePassword,
  callForgotPassword,
  callResetPassword,
  // Banner APIs
  callFetchHomeBanners,
  fetchAllBannerAPI,
  callCreateBanner,
  callUpdateBanner,
  callDeleteBanner,
  callFetchBannerById,
  // Saved Search / Job Alerts
  createSavedSearch,
  listSavedSearches,
  deleteSavedSearch,
  runAlert,
  // Job Alerts preferred endpoints
  createJobAlert,
  createJobAlertAuth,
  listJobAlerts,
  updateJobAlert,
  deleteJobAlert,
  unsubscribeJobAlert,
  runJobAlertNow,
  // Web Push
  fetchWebPushPublicKey,
    webpushSubscribe,
    callFetchFile,
};

const callFetchFile = (fileName, folder = "resume") => {
    const URL_BACKEND = `/api/v1/files?fileName=${fileName}&folder=${folder}`;
    return axios.get(URL_BACKEND, {
        responseType: 'blob',
        headers: {
            'Accept': 'application/pdf, application/msword, image/*, */*'
        }
    });
};
