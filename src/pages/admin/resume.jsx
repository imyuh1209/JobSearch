import React, { useEffect, useState } from "react";
import { Table, Space, Popconfirm, message, Button, Input, Form, Tag, Drawer, Descriptions, Select } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { fetchAllResumeAPI, callDeleteResume, callUpdateResumeStatus } from "../../services/api.service";
import ViewDetailResume from "../../components/admin/resume/view.resume";
import dayjs from 'dayjs';

const ResumePage = () => {
    const [resumes, setResumes] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState({ status: '' });

    // State để mở Modal
    const [openViewDetail, setOpenViewDetail] = useState(false);
    const [dataInit, setDataInit] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        FetchAllResumes(1, meta.pageSize, { status: '' });
    }, []);

    const buildQuery = (page, pageSize, searchFilters) => {
        let query = `page=${page}&size=${pageSize}&sort=updatedAt,desc`;

        // Thêm filter nếu có
        let filterStr = '';
        if (searchFilters.status) {
            filterStr = `status ~ '${searchFilters.status}'`;
        }

        if (filterStr) {
            query = `filter=${filterStr}&${query}`;
        }

        return query;
    };

    const FetchAllResumes = async (page = 1, pageSize = 10, searchFilters = filters) => {
        setIsFetching(true);
        try {
            const query = buildQuery(page, pageSize, searchFilters);
            console.log('Query params:', query);
            const res = await fetchAllResumeAPI(query);
            if (res && res.data) {
                setResumes(res.data.result || []);
                setMeta({
                    page: res.data.meta.page,
                    pageSize: res.data.meta.pageSize || 10,
                    total: res.data.meta.total || 0,
                });
            } else {
                setResumes([]);
                message.error("Lỗi khi tải danh sách resume");
            }
        } catch (error) {
            console.error("Error:", error);
            setResumes([]);
            message.error("Lỗi khi tải danh sách resume");
        } finally {
            setIsFetching(false);
        }
    };

    const handleTableChange = (pagination) => {
        const { current, pageSize } = pagination;
        FetchAllResumes(current, pageSize);
    };

    const handleSearch = (values) => {
        FetchAllResumes(1, meta.pageSize, values);
        setFilters(values);
    };

    const handleReset = () => {
        form.resetFields();
        const emptyFilters = { status: '' };
        setFilters(emptyFilters);
        FetchAllResumes(1, meta.pageSize, emptyFilters);
    };

    const handleDeleteResume = async (id) => {
        if (id) {
            const res = await callDeleteResume(id);
            if (res && +res.data.statusCode === 202) {
                message.success("Xóa Resume thành công");
                FetchAllResumes(meta.page, meta.pageSize);
            } else {
                message.error("Có lỗi xảy ra khi xóa Resume");
            }
        }
    };

    const handleChangeStatus = async () => {
        if (dataInit) {
            const status = form.getFieldValue('status');
            const res = await callUpdateResumeStatus(dataInit.id, status);
            if (res && res.data) {
                message.success("Cập nhật trạng thái thành công");
                setDataInit(null);
                setOpenViewDetail(false);
                FetchAllResumes(meta.page, meta.pageSize);
            } else {
                message.error("Có lỗi xảy ra khi cập nhật trạng thái");
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
            title: "Trạng thái",
            dataIndex: "status",
            render: (status) => {
                let color = 'default';
                switch (status) {
                    case 'PENDING':
                        color = 'orange';
                        break;
                    case 'REVIEWING':
                        color = 'blue';
                        break;
                    case 'APPROVED':
                        color = 'green';
                        break;
                    case 'REJECTED':
                        color = 'red';
                        break;
                    default:
                        color = 'default';
                }
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: "Tên Job",
            dataIndex: ["job", "name"],
        },
        {
            title: "Tên Công Ty",
            // Hiển thị linh hoạt theo nhiều dạng dữ liệu trả về từ backend
            render: (_, record) => {
                const companyName =
                    record?.job?.company?.name ||
                    record?.job?.companyName ||
                    record?.company?.name ||
                    record?.companyName ||
                    null;
                return <>{companyName || "Đang cập nhật"}</>;
            },
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
            title: "CV",
            dataIndex: "url",
            render: (url) => url ? (
                <a
                    href={`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${url}`}
                    target="_blank"
                >
                    Xem CV
                </a>
            ) : "Không có CV"
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
                            setOpenViewDetail(true);
                        }}
                    />
                    <Popconfirm
                        title="Xác nhận xóa resume"
                        onConfirm={() => handleDeleteResume(record.id)}
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
                <Form.Item name="status" label="Trạng thái">
                    <Select
                        style={{ width: 200 }}
                        placeholder="Chọn trạng thái"
                        allowClear
                    >
                        <Select.Option value="PENDING">PENDING</Select.Option>
                        <Select.Option value="REVIEWING">REVIEWING</Select.Option>
                        <Select.Option value="APPROVED">APPROVED</Select.Option>
                        <Select.Option value="REJECTED">REJECTED</Select.Option>
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

            <Table
                rowKey="id"
                columns={columns}
                dataSource={resumes}
                loading={isFetching}
                pagination={{
                    current: meta.page,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} resume`
                }}
                onChange={handleTableChange}
            />

            <ViewDetailResume
                open={openViewDetail}
                onClose={setOpenViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
                reloadTable={() => FetchAllResumes(meta.page, meta.pageSize)}
            />
        </div>
    );
};

export default ResumePage;
