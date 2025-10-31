import React, { useEffect, useState } from "react";
import { Table, Space, Popconfirm, message, Button, Input, Form, Select, Tag, notification } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { fetchAllPermissionAPI, callDeletePermission } from "../../services/api.service";
import ModalPermission from "../../components/admin/permission/modal.permission";
import dayjs from 'dayjs';
import { ALL_MODULES } from "../../config/permissions";

const PermissionPage = () => {
    const [permissions, setPermissions] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState({ name: '', apiPath: '', method: '', module: '' });

    // State để mở Modal
    const [openModal, setOpenModal] = useState(false);
    const [dataInit, setDataInit] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        FetchAllPermissions(1, meta.pageSize, filters);
    }, []);

    const buildQuery = (page, pageSize, searchFilters) => {
        let query = `page=${page}&size=${pageSize}&sort=updatedAt,desc`;

        // Thêm filter nếu có
        let filterStr = '';
        if (searchFilters.name) {
            filterStr = `name ~ '${searchFilters.name}'`;
        }
        if (searchFilters.apiPath) {
            filterStr += filterStr ? ` and apiPath ~ '${searchFilters.apiPath}'` : `apiPath ~ '${searchFilters.apiPath}'`;
        }
        if (searchFilters.method) {
            filterStr += filterStr ? ` and method ~ '${searchFilters.method}'` : `method ~ '${searchFilters.method}'`;
        }
        if (searchFilters.module) {
            filterStr += filterStr ? ` and module ~ '${searchFilters.module}'` : `module ~ '${searchFilters.module}'`;
        }

        if (filterStr) {
            query = `filter=${filterStr}&${query}`;
        }

        return query;
    };

    const FetchAllPermissions = async (page = 1, pageSize = 10, searchFilters = filters) => {
        setIsFetching(true);
        try {
            const query = buildQuery(page, pageSize, searchFilters);
            console.log('Query params:', query);
            const res = await fetchAllPermissionAPI(query);
            if (res && res.data) {
                setPermissions(res.data.result || []);
                setMeta({
                    page: res.data.meta.page,
                    pageSize: res.data.meta.pageSize || 10,
                    total: res.data.meta.total || 0,
                });
            } else {
                setPermissions([]);
                message.error("Lỗi khi tải danh sách permission");
            }
        } catch (error) {
            console.error("Error:", error);
            setPermissions([]);
            message.error("Lỗi khi tải danh sách permission");
        } finally {
            setIsFetching(false);
        }
    };

    const handleTableChange = (pagination) => {
        const { current, pageSize } = pagination;
        FetchAllPermissions(current, pageSize);
    };

    const handleSearch = (values) => {
        FetchAllPermissions(1, meta.pageSize, values);
        setFilters(values);
    };

    const handleReset = () => {
        form.resetFields();
        const emptyFilters = { name: '', apiPath: '', method: '', module: '' };
        setFilters(emptyFilters);
        FetchAllPermissions(1, meta.pageSize, emptyFilters);
    };

    const handleDeletePermission = async (id) => {
        if (id) {
            const res = await callDeletePermission(id);
            if (res && +res.data.statusCode === 202) {
                message.success("Xóa Permission thành công");
                FetchAllPermissions(meta.page, meta.pageSize);
            } else {
                message.error("Có lỗi xảy ra khi xóa Permission");
            }
        }
    };

    // Seed default permissions
    const getAllPermissionsRaw = async () => {
        try {
            const res = await fetchAllPermissionAPI("page=1&size=1000&sort=updatedAt,desc");
            let permissionsData = [];
            if (res && res.data) {
                if (res.data.result && Array.isArray(res.data.result)) permissionsData = res.data.result;
                else if (res.data.result && res.data.result.content && Array.isArray(res.data.result.content)) permissionsData = res.data.result.content;
                else if (res.data.content && Array.isArray(res.data.content)) permissionsData = res.data.content;
                else if (Array.isArray(res.data)) permissionsData = res.data;
            }
            return permissionsData;
        } catch (e) {
            console.error("Error getAllPermissionsRaw:", e);
            return [];
        }
    };

    const buildDefaultPermissions = () => {
        return [
            // Companies
            { name: 'Create a company', apiPath: '/api/v1/companies', method: 'POST', module: 'COMPANY' },
            { name: 'Get companies with pagination', apiPath: '/api/v1/companies', method: 'GET', module: 'COMPANY' },
            { name: 'Get a company by id', apiPath: '/api/v1/companies/{id}', method: 'GET', module: 'COMPANY' },
            { name: 'Update a company', apiPath: '/api/v1/companies', method: 'PUT', module: 'COMPANY' },
            { name: 'Delete a company', apiPath: '/api/v1/companies/{id}', method: 'DELETE', module: 'COMPANY' },
            { name: 'Get jobs by company', apiPath: '/api/v1/companies/jobs/{id}', method: 'GET', module: 'COMPANY' },
            // Jobs
            { name: 'Create a job', apiPath: '/api/v1/jobs', method: 'POST', module: 'JOB' },
            { name: 'Get jobs with pagination', apiPath: '/api/v1/jobs', method: 'GET', module: 'JOB' },
            { name: 'Get a job by id', apiPath: '/api/v1/jobs/{id}', method: 'GET', module: 'JOB' },
            { name: 'Update a job', apiPath: '/api/v1/jobs', method: 'PUT', module: 'JOB' },
            { name: 'Delete a job', apiPath: '/api/v1/jobs/{id}', method: 'DELETE', module: 'JOB' },
            { name: 'Get jobs by current company', apiPath: '/api/v1/jobs/by-company', method: 'GET', module: 'JOB' },
            { name: 'Get jobs with applicant count', apiPath: '/api/v1/jobs-with-applicants', method: 'GET', module: 'JOB' },
            // Saved Jobs
            { name: 'Save a job', apiPath: '/api/v1/saved-jobs', method: 'POST', module: 'SAVED_JOB' },
            { name: 'List my saved jobs', apiPath: '/api/v1/saved-jobs', method: 'GET', module: 'SAVED_JOB' },
            { name: 'Delete a saved job by id', apiPath: '/api/v1/saved-jobs/{id}', method: 'DELETE', module: 'SAVED_JOB' },
            { name: 'Check job saved status', apiPath: '/api/v1/saved-jobs/is-saved', method: 'GET', module: 'SAVED_JOB' },
            // Resumes
            { name: 'Create a resume', apiPath: '/api/v1/resumes', method: 'POST', module: 'RESUME' },
            { name: 'Get resumes with pagination', apiPath: '/api/v1/resumes', method: 'GET', module: 'RESUME' },
            { name: 'Get a resume by id', apiPath: '/api/v1/resumes/{id}', method: 'GET', module: 'RESUME' },
            { name: 'Update a resume', apiPath: '/api/v1/resumes', method: 'PUT', module: 'RESUME' },
            { name: 'Delete a resume', apiPath: '/api/v1/resumes/{id}', method: 'DELETE', module: 'RESUME' },
            { name: 'Get my resumes', apiPath: '/api/v1/resumes/by-user', method: 'POST', module: 'RESUME' },
            { name: 'Count resumes by job', apiPath: '/api/v1/resumes/count-by-job/{jobId}', method: 'GET', module: 'RESUME' },
            // Users
            { name: 'Create a user', apiPath: '/api/v1/users', method: 'POST', module: 'USER' },
            { name: 'Update a user', apiPath: '/api/v1/users', method: 'PUT', module: 'USER' },
            { name: 'Delete a user', apiPath: '/api/v1/users/{id}', method: 'DELETE', module: 'USER' },
            { name: 'Get a user by id', apiPath: '/api/v1/users/{id}', method: 'GET', module: 'USER' },
            { name: 'Get users with pagination', apiPath: '/api/v1/users', method: 'GET', module: 'USER' },
            // Roles
            { name: 'Create a role', apiPath: '/api/v1/roles', method: 'POST', module: 'ROLE' },
            { name: 'Update a role', apiPath: '/api/v1/roles', method: 'PUT', module: 'ROLE' },
            { name: 'Delete a role', apiPath: '/api/v1/roles/{id}', method: 'DELETE', module: 'ROLE' },
            { name: 'Get a role by id', apiPath: '/api/v1/roles/{id}', method: 'GET', module: 'ROLE' },
            { name: 'Get roles with pagination', apiPath: '/api/v1/roles', method: 'GET', module: 'ROLE' },
            // Permissions
            { name: 'Create a permission', apiPath: '/api/v1/permissions', method: 'POST', module: 'PERMISSION' },
            { name: 'Update a permission', apiPath: '/api/v1/permissions', method: 'PUT', module: 'PERMISSION' },
            { name: 'Delete a permission', apiPath: '/api/v1/permissions/{id}', method: 'DELETE', module: 'PERMISSION' },
            { name: 'Get a permission by id', apiPath: '/api/v1/permissions/{id}', method: 'GET', module: 'PERMISSION' },
            { name: 'Get permissions with pagination', apiPath: '/api/v1/permissions', method: 'GET', module: 'PERMISSION' },
            // Skills
            { name: 'Add a skill', apiPath: '/api/v1/skills', method: 'POST', module: 'SKILL' },
            { name: 'Get skills with pagination', apiPath: '/api/v1/skills', method: 'GET', module: 'SKILL' },
            { name: 'Get a skill by id', apiPath: '/api/v1/skills/{id}', method: 'GET', module: 'SKILL' },
            { name: 'Update a skill', apiPath: '/api/v1/skills', method: 'PUT', module: 'SKILL' },
            { name: 'Delete a skill', apiPath: '/api/v1/skills/{id}', method: 'DELETE', module: 'SKILL' },
            // Subscribers
            { name: 'Create a subscriber', apiPath: '/api/v1/subscribers', method: 'POST', module: 'SUBSCRIBER' },
            { name: 'Update a subscriber', apiPath: '/api/v1/subscribers', method: 'PUT', module: 'SUBSCRIBER' },
            { name: "Get subscriber's skill", apiPath: '/api/v1/subscribers/skills', method: 'GET', module: 'SUBSCRIBER' },
            // Auth
            { name: 'Register', apiPath: '/api/v1/auth/register', method: 'POST', module: 'AUTH' },
            { name: 'Login', apiPath: '/api/v1/auth/login', method: 'POST', module: 'AUTH' },
            { name: 'Get current account', apiPath: '/api/v1/auth/account', method: 'GET', module: 'AUTH' },
            { name: 'Refresh token (cookie/header)', apiPath: '/api/v1/auth/refresh', method: 'GET', module: 'AUTH' },
            { name: 'Refresh token (body)', apiPath: '/api/v1/auth/refresh', method: 'POST', module: 'AUTH' },
            { name: 'Logout', apiPath: '/api/v1/auth/logout', method: 'POST', module: 'AUTH' },
        ];
    };

    const seedDefaultPermissions = async () => {
        try {
            const existing = await getAllPermissionsRaw();
            const defaults = buildDefaultPermissions();
            const toCreate = defaults.filter(p => !existing.some(e => e.apiPath === p.apiPath && e.method === p.method && e.module === p.module));

            if (!toCreate.length) {
                message.info('Tất cả quyền mặc định đã tồn tại.');
                return;
            }

            notification.info({ message: 'Đang tạo quyền mặc định', description: `Số lượng: ${toCreate.length}` });
            const results = await Promise.allSettled(toCreate.map(p => callCreatePermission(p)));
            const successCount = results.filter(r => r.status === 'fulfilled' && r.value && r.value.data).length;
            const failCount = toCreate.length - successCount;
            if (successCount) message.success(`Tạo thành công ${successCount} quyền.`);
            if (failCount) message.warning(`${failCount} quyền tạo thất bại hoặc trùng.`);
            FetchAllPermissions(meta.page, meta.pageSize);
        } catch (error) {
            console.error('Seed default permissions error:', error);
            notification.error({ message: 'Lỗi seed quyền mặc định', description: error?.message || 'Vui lòng thử lại.' });
        }
    };

    const colorMethod = (method) => {
        switch (method) {
            case 'GET':
                return '#52c41a';
            case 'POST':
                return '#1890ff';
            case 'PUT':
                return '#faad14';
            case 'PATCH':
                return '#722ed1';
            case 'DELETE':
                return '#f5222d';
            default:
                return '#000000';
        }
    };

    const columns = [
        {
            title: "STT",
            key: "index",
            width: 50,
            align: "center",
            render: (text, record, index) => (
                <>{(index + 1) + (meta.page - 1) * meta.pageSize}</>
            ),
        },
        {
            title: "Tên Permission",
            dataIndex: "name",
            sorter: true,
        },
        {
            title: "API Path",
            dataIndex: "apiPath",
            sorter: true,
        },
        {
            title: "Method",
            dataIndex: "method",
            sorter: true,
            render: (method) => (
                <Tag color={colorMethod(method)}>{method}</Tag>
            ),
        },
        {
            title: "Module",
            dataIndex: "module",
            sorter: true,
            render: (module) => ALL_MODULES[module] || module,
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            render: (text) => text ? dayjs(text).format('DD-MM-YYYY HH:mm:ss') : "",
        },
        {
            title: "Ngày sửa",
            dataIndex: "updatedAt",
            render: (text) => text ? dayjs(text).format('DD-MM-YYYY HH:mm:ss') : "",
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <EditOutlined
                        style={{ fontSize: 20, color: "#ffa500", cursor: "pointer" }}
                        onClick={() => {
                            setDataInit(record);
                            setOpenModal(true);
                        }}
                    />
                    <Popconfirm
                        title="Xác nhận xóa permission"
                        onConfirm={() => handleDeletePermission(record.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <DeleteOutlined
                            style={{ fontSize: 20, color: "#ff4d4f", cursor: "pointer" }}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Form
                form={form}
                layout="inline"
                onFinish={handleSearch}
                style={{ marginBottom: 16 }}
            >
                <Form.Item name="name" label="Tên">
                    <Input placeholder="Tìm theo tên" allowClear />
                </Form.Item>
                <Form.Item name="apiPath" label="API Path">
                    <Input placeholder="Tìm theo path" allowClear />
                </Form.Item>
                <Form.Item name="method" label="Method">
                    <Select
                        style={{ width: 120 }}
                        placeholder="Chọn method"
                        allowClear
                    >
                        <Select.Option value="GET">GET</Select.Option>
                        <Select.Option value="POST">POST</Select.Option>
                        <Select.Option value="PUT">PUT</Select.Option>
                        <Select.Option value="PATCH">PATCH</Select.Option>
                        <Select.Option value="DELETE">DELETE</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="module" label="Module">
                    <Select
                        style={{ width: 200 }}
                        placeholder="Chọn module"
                        allowClear
                    >
                        {Object.entries(ALL_MODULES).map(([key, value]) => (
                            <Select.Option key={key} value={key}>{value}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Tìm kiếm
                        </Button>
                        <Button onClick={handleReset}>Làm lại</Button>
                    </Space>
                </Form.Item>
            </Form>

            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                    setDataInit(null);
                    setOpenModal(true);
                }}
                style={{ marginBottom: 16 }}
            >
                Thêm mới
            </Button>
            <Button onClick={seedDefaultPermissions} style={{ marginLeft: 8, marginBottom: 16 }}>
                Thêm quyền mặc định
            </Button>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={permissions}
                loading={isFetching}
                pagination={{
                    current: meta.page,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} permission`
                }}
                onChange={handleTableChange}
            />

            <ModalPermission
                openModal={openModal}
                setOpenModal={setOpenModal}
                dataInit={dataInit}
                setDataInit={setDataInit}
                reloadTable={() => FetchAllPermissions(meta.page, meta.pageSize)}
            />
        </div>
    );
};

export default PermissionPage;
