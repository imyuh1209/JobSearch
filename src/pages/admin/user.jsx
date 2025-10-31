import React, { useEffect, useState } from "react";
import { Table, Space, Popconfirm, message, Button, Input, Form, Tag, Modal } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { fetchAllUserAPI, deleteUserAPI, fetchAllResumeAPI, callDeleteResume } from "../../services/api.service";
import ModalUser from "../../components/admin/user/modal.user";
import ViewDetailUser from "../../components/admin/user/view.detail.user";
import dayjs from 'dayjs';

const UserTable = () => {
    const [users, setUsers] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState({ name: '', email: '' });

    // State để mở Modal
    const [openModal, setOpenModal] = useState(false);
    const [dataInit, setDataInit] = useState(null);
    const [form] = Form.useForm();

    // State để mở ViewDetail
    const [openViewDetail, setOpenViewDetail] = useState(false);
    const [userSelected, setUserSelected] = useState(null);

    const roleColors = {
        ADMIN: 'red',
        USER: 'blue',
        HR: 'green'
    };

    useEffect(() => {
        FetchAllUsers(1, meta.pageSize, { name: '', email: '' });
    }, []); // Chỉ gọi một lần khi component mount

    const buildQuery = (page, pageSize, searchFilters) => {
        let query = `page=${page}&size=${pageSize}&sort=updatedAt,desc`;

        // Thêm filter nếu có
        let filterStr = '';
        if (searchFilters.name) {
            filterStr = `name ~ '${searchFilters.name}'`;
        }
        if (searchFilters.email) {
            filterStr += searchFilters.name ?
                ` and email ~ '${searchFilters.email}'` :
                `email ~ '${searchFilters.email}'`;
        }

        if (filterStr) {
            query = `filter=${filterStr}&${query}`;
        }

        return query;
    };

    const FetchAllUsers = async (page = 1, pageSize = 10, searchFilters = filters) => {
        setIsFetching(true);
        try {
            const query = buildQuery(page, pageSize, searchFilters);
            console.log('Query params:', query);
            const res = await fetchAllUserAPI(query);
            if (res.data) {
                setUsers(res.data.result);
                setMeta({
                    page: res.data.meta.page,
                    pageSize: res.data.meta.pageSize || 10,
                    total: res.data.meta.total || 0,
                });
            } else {
                message.error("Lỗi khi tải danh sách người dùng");
            }
        } catch (error) {
            console.error("Error:", error);
            message.error("Lỗi khi tải danh sách người dùng");
        } finally {
            setIsFetching(false);
        }
    };

    const handleTableChange = (pagination) => {
        const { current, pageSize } = pagination;
        FetchAllUsers(current, pageSize);
    };

    const handleSearch = (values) => {
        // Gọi API trực tiếp với giá trị mới
        FetchAllUsers(1, meta.pageSize, values);
        // Cập nhật state filters sau
        setFilters(values);
    };

    const handleReset = () => {
        form.resetFields();
        const emptyFilters = { name: '', email: '' };
        setFilters(emptyFilters);
        FetchAllUsers(1, meta.pageSize, emptyFilters);
    };

    const handleDeleteUser = async (id) => {
        if (!id) return;
        try {
            const res = await deleteUserAPI(id);
            if (res?.statusCode === 200) {
                message.success(res?.message || "Xóa người dùng thành công");
                FetchAllUsers(meta.page, meta.pageSize, filters);
                return;
            }
            message.error(res?.error || res?.message || "Có lỗi xảy ra khi xóa người dùng");
        } catch (error) {
            const errMsg = error?.response?.data?.message || error?.response?.data?.error || "Có lỗi xảy ra khi xóa người dùng";
            // Nếu lỗi do ràng buộc khóa ngoại với bảng resumes, đề xuất xoá resume
            const isResumeConstraint = typeof errMsg === 'string' && errMsg.includes('resumes') && errMsg.includes('foreign key');
            if (isResumeConstraint) {
                Modal.confirm({
                    title: "Không thể xóa người dùng vì còn Resume liên quan",
                    content: "Hệ thống phát hiện người dùng này có Resume. Bạn có muốn xoá toàn bộ Resume của người dùng này rồi tiếp tục xoá?",
                    okText: "Xóa Resume và tiếp tục",
                    cancelText: "Hủy",
                    onOk: async () => {
                        await handleCascadeDeleteUser(id);
                    }
                });
            } else {
                message.error(errMsg);
            }
        }
    };

    const handleCascadeDeleteUser = async (userId) => {
        try {
            // Lấy tất cả resume của user, kích thước lớn để gom xóa một lượt
            const query = `filter=user.id == '${userId}'&page=1&size=1000`;
            const res = await fetchAllResumeAPI(query);
            const resumes = res?.data?.result || [];
            if (resumes.length === 0) {
                // Không có resume, thử xóa lại user
                const del = await deleteUserAPI(userId);
                if (del?.statusCode === 200) {
                    message.success("Đã xóa người dùng sau khi kiểm tra phụ thuộc");
                    FetchAllUsers(meta.page, meta.pageSize, filters);
                } else {
                    message.error(del?.message || "Xóa người dùng thất bại");
                }
                return;
            }

            // Xóa tất cả resume liên quan
            await Promise.allSettled(resumes.map(r => callDeleteResume(r.id)));

            // Thử xóa lại user sau khi đã xóa resume
            const del2 = await deleteUserAPI(userId);
            if (del2?.statusCode === 200) {
                message.success("Đã xóa Resume liên quan và xóa người dùng thành công");
                FetchAllUsers(meta.page, meta.pageSize, filters);
            } else {
                message.error(del2?.message || "Xóa người dùng thất bại sau khi xóa Resume");
            }
        } catch (e) {
            const err = e?.response?.data?.message || e.message || "Có lỗi khi xóa dữ liệu phụ thuộc";
            message.error(err);
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
            title: "Tên hiển thị",
            dataIndex: "name",
            sorter: true,
        },
        {
            title: "Email",
            dataIndex: "email",
            sorter: true,
        },
        {
            title: "Role",
            dataIndex: "role",
            render: (role) => (
                <Tag color={roleColors[role?.name] || 'default'}>
                    {role?.name || 'N/A'}
                </Tag>
            ),
            filters: [
                { text: 'Admin', value: 'ADMIN' },
                { text: 'User', value: 'USER' },
                { text: 'HR', value: 'HR' }
            ],
            onFilter: (value, record) => record.role?.name === value
        },
        {
            title: "Avatar",
            dataIndex: "avatar",
            render: (avatar) => (
                avatar && <img
                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/user/${avatar}`}
                    alt="avatar"
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '50%' }}
                />
            )
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            render: (date) => date && dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
            sorter: true,
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <EyeOutlined
                        style={{ fontSize: 20, color: "#1890ff", cursor: "pointer" }}
                        onClick={() => {
                            setUserSelected(record);
                            setOpenViewDetail(true);
                        }}
                    />
                    <EditOutlined
                        style={{ fontSize: 20, color: "#ffa500", cursor: "pointer" }}
                        onClick={() => {
                            setDataInit({
                                ...record,
                                _id: record.id // Ensure we have _id for update
                            });
                            setOpenModal(true);
                        }}
                    />
                    <Popconfirm
                        title="Xác nhận xóa người dùng"
                        onConfirm={() => handleDeleteUser(record.id)}
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
                <Form.Item name="email" label="Email">
                    <Input placeholder="Tìm theo email" allowClear />
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
                Thêm người dùng
            </Button>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={users}
                loading={isFetching}
                pagination={{
                    current: meta.page,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} người dùng`
                }}
                onChange={handleTableChange}
            />

            <ModalUser
                openModal={openModal}
                setOpenModal={setOpenModal}
                dataInit={dataInit}
                setDataInit={setDataInit}
                reloadTable={() => FetchAllUsers(meta.page, meta.pageSize)}
            />

            <ViewDetailUser
                open={openViewDetail}
                onClose={setOpenViewDetail}
                dataInit={userSelected}
                setDataInit={setUserSelected}
            />
        </div>
    );
};

export default UserTable;
