import axios from "./axios.customize";

const loginUserAPI = (username, password) => {
    const URL_BACKEND = "/api/v1/auth/login";
    const data = {
        username: username,
        password: password
    }
    return axios.post(URL_BACKEND, data)
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

const registerUserAPI = (name, email, password, gender, address, age) => {
    const URL_BACKEND = "/api/v1/auth/register";
    const data = {
        name: name,
        email: email,
        password: password,
        gender: gender,
        address: address,
        age: age
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
    const safeAge = data.age != null ? Number(data.age) : 16;
    const payload = {
        id: Number.isFinite(safeId) ? safeId : undefined,
        name: (data.name ?? "").trim(),
        email: data.email || "",
        age: Number.isFinite(safeAge) && safeAge > 0 ? safeAge : 16,
        gender: data.gender || "MALE",
        address: data.address || "",
        // Đảm bảo gửi role theo đúng cấu trúc backend mong đợi
        ...(data.role?.id ? { role: { id: Number(data.role.id) } } : {})
    };
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
        user: {
            "id": userId
        },
        job: {
            "id": jobId
        }
    }
    return axios.post(URL_BACKEND, data);
}

const callFetchResumeByUser = () => {
    const URL_BACKEND = "/api/v1/resumes/by-user";
    return axios.post(URL_BACKEND);
}

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



export {
    deleteCompanyAPI, logoutUserAPI, getAccount, registerUserAPI, callFetchJobById, fetchAllJobAPI, callFetchCompanyById, fetchAllCompanyAPI,
    loginUserAPI, createUserAPI, fetchAllUserAPI, updateUserAPI, deleteUserAPI, callCreateCompany, callUpdateCompany, callUploadSingleFile,
    callCreateUser, callUpdateUser, callFetchUserById,
    // Skill APIs
    fetchAllSkillAPI, callCreateSkill, callUpdateSkill, callDeleteSkill, callFetchSkillById,
    // Job APIs
    callCreateJob, callUpdateJob, callDeleteJob, fetchJobsByCompanyAPI, fetchJobsByCurrentCompanyAPI,
    // Resume APIs
    fetchAllResumeAPI, callDeleteResume, callUpdateResumeStatus, callFetchResumeById, callCreateResume, callFetchResumeByUser,
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
};