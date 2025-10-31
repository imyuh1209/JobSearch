import React, { useEffect, useState } from "react";
import { Table, Space, Popconfirm, message, Button, Input, Form, Select, Tag, Alert } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { fetchAllRoleAPI, callDeleteRole, fetchAllPermissionAPI } from "../../services/api.service";
import ModalRole from "../../components/admin/role/modal.role";
import dayjs from 'dayjs';
import { buildQuery, groupByPermission } from "../../config/utils";

const RolePage = () => {
    const [roles, setRoles] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState({ name: '' });

    // State để mở Modal
    const [openModal, setOpenModal] = useState(false);
    const [singleRole, setSingleRole] = useState(null);
    const [form] = Form.useForm();

    // State cho danh sách permission
    const [listPermissions, setListPermissions] = useState([]);
    const [noData, setNoData] = useState(false);

    useEffect(() => {
        FetchAllRoles(1, meta.pageSize, filters);
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            // Tải tất cả quyền để đảm bảo có Saved Jobs
            const res = await fetchAllPermissionAPI("page=1&size=1000&sort=updatedAt,desc");
            console.log("Permissions API response:", res);

            if (res && res.data) {
                // Kiểm tra cấu trúc dữ liệu
                console.log("Permissions data structure:", res.data);

                // Kiểm tra các cấu trúc phổ biến và chọn đúng cấu trúc
                let permissionsData = [];

                if (res.data.result && Array.isArray(res.data.result)) {
                    console.log("Permissions in 'result' array");
                    permissionsData = res.data.result;
                }
                else if (res.data.result && res.data.result.content && Array.isArray(res.data.result.content)) {
                    console.log("Permissions in 'result.content' array");
                    permissionsData = res.data.result.content;
                }
                else if (res.data.content && Array.isArray(res.data.content)) {
                    console.log("Permissions in 'content' array");
                    permissionsData = res.data.content;
                }
                else if (Array.isArray(res.data)) {
                    console.log("Permissions in direct array");
                    permissionsData = res.data;
                }

                // Nếu không có dữ liệu từ API
                if (permissionsData.length === 0) {
                    console.log("No permissions data available");
                    setNoData(true);
                    setListPermissions([]);
                } else {
                    console.log("Processed permissions data:", permissionsData);
                    const groupedPermissions = groupByPermission(permissionsData);
                    console.log("Grouped permissions:", groupedPermissions);
                    setListPermissions(groupedPermissions);
                    setNoData(false);
                }
            } else {
                console.log("No data from permissions API");
                setNoData(true);
                setListPermissions([]);
            }
        } catch (error) {
            console.error("Error fetching permissions:", error);
            setNoData(true);
            setListPermissions([]);
        }
    };

    const FetchAllRoles = async (page = 1, pageSize = 10, searchFilters = filters) => {
        setIsFetching(true);
        try {
            const query = buildQuery(page, pageSize, searchFilters);
            console.log("Query for roles:", query);
            const res = await fetchAllRoleAPI(query);
            console.log("Roles API response:", res);

            if (res && res.data) {
                // Kiểm tra cấu trúc dữ liệu
                console.log("Roles data structure:", res.data);

                // Kiểm tra các cấu trúc phổ biến và chọn đúng cấu trúc
                let rolesData = [];
                let metaData = { page: 1, pageSize: 10, total: 0 };

                if (res.data.result && Array.isArray(res.data.result)) {
                    console.log("Roles in 'result' array");
                    rolesData = res.data.result;
                    metaData = {
                        page: res.data.meta?.page || 1,
                        pageSize: res.data.meta?.pageSize || 10,
                        total: res.data.meta?.total || 0
                    };
                }
                else if (res.data.result && res.data.result.content && Array.isArray(res.data.result.content)) {
                    console.log("Roles in 'result.content' array");
                    rolesData = res.data.result.content;
                    metaData = {
                        page: res.data.meta?.page || 1,
                        pageSize: res.data.meta?.pageSize || 10,
                        total: res.data.meta?.total || 0
                    };
                }
                else if (res.data.content && Array.isArray(res.data.content)) {
                    console.log("Roles in 'content' array");
                    rolesData = res.data.content;
                    metaData = {
                        page: res.data.number + 1 || 1,
                        pageSize: res.data.size || 10,
                        total: res.data.totalElements || 0
                    };
                }
                else if (Array.isArray(res.data)) {
                    console.log("Roles in direct array");
                    rolesData = res.data;
                }

                // Nếu không có dữ liệu từ API
                if (rolesData.length === 0) {
                    console.log("No roles data available");
                    setRoles([]);
                    setNoData(true);
                } else {
                    console.log("Processed roles data:", rolesData);
                    setRoles(rolesData);
                    setNoData(false);
                }
                setMeta(metaData);
            } else {
                console.log("No data from roles API");
                setRoles([]);
                setNoData(true);
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
            setRoles([]);
            setNoData(true);
        } finally {
            setIsFetching(false);
        }
    };

    const handleTableChange = (pagination) => {
        const { current, pageSize } = pagination;
        FetchAllRoles(current, pageSize);
    };

    const handleSearch = (values) => {
        FetchAllRoles(1, meta.pageSize, values);
        setFilters(values);
    };

    const handleReset = () => {
        form.resetFields();
        const emptyFilters = { name: '' };
        setFilters(emptyFilters);
        FetchAllRoles(1, meta.pageSize, emptyFilters);
    };

    const handleDeleteRole = async (id) => {
        if (id) {
            const res = await callDeleteRole(id);
            if (res && res.data) {
                message.success("Xóa Role thành công");
                FetchAllRoles(meta.page, meta.pageSize);
            } else {
                message.error("Có lỗi xảy ra khi xóa Role");
            }
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
            title: "Tên Role",
            dataIndex: "name",
            sorter: true,
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            ellipsis: true,
        },
        {
            title: "Trạng thái",
            dataIndex: "active",
            render: (active) => (
                <Tag color={active ? "green" : "red"}>
                    {active ? "ACTIVE" : "INACTIVE"}
                </Tag>
            ),
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
                            setSingleRole(record);
                            setOpenModal(true);
                        }}
                    />
                    <Popconfirm
                        title="Xác nhận xóa role"
                        onConfirm={() => handleDeleteRole(record.id)}
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
            {noData && (
                <Alert
                    message="Không có dữ liệu"
                    description="Hiện tại không có dữ liệu roles hoặc permissions. Vui lòng thử lại sau hoặc liên hệ quản trị viên."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            <Form
                form={form}
                layout="inline"
                onFinish={handleSearch}
                style={{ marginBottom: 16 }}
            >
                <Form.Item name="name" label="Tên">
                    <Input placeholder="Tìm theo tên" allowClear />
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
                    setSingleRole(null);
                    setOpenModal(true);
                }}
                style={{ marginBottom: 16 }}
            >
                Thêm mới
            </Button>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={roles}
                loading={isFetching}
                pagination={{
                    current: meta.page,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} role`
                }}
                onChange={handleTableChange}
            />

            <ModalRole
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={() => FetchAllRoles(meta.page, meta.pageSize)}
                listPermissions={listPermissions}
                singleRole={singleRole}
                setSingleRole={setSingleRole}
            />
        </div>
    );
};

export default RolePage;
