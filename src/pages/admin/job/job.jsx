import React, { useEffect, useState } from "react";
import { Table, Space, Popconfirm, message, Button, Input, InputNumber, Form, Tag } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { fetchAllJobAPI, callDeleteJob } from "../../../services/api.service";
import ModalJob from "../../../components/admin/job/modal.job";
import dayjs from 'dayjs';

const JobPage = () => {
    const [jobs, setJobs] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState({ name: '', salaryMin: null, salaryMax: null });

    // State để mở Modal
    const [openModal, setOpenModal] = useState(false);
    const [dataInit, setDataInit] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        FetchAllJobs(1, meta.pageSize, { name: '', salaryMin: null, salaryMax: null });
    }, []); // Chỉ gọi một lần khi component mount

    const buildQuery = (page, pageSize, searchFilters) => {
        let query = `page=${page}&size=${pageSize}&sort=updatedAt,desc`;

        // Thêm filter nếu có
        let filterStr = '';
        if (searchFilters.name) {
            filterStr = `name ~ '${searchFilters.name}'`;
        }
        // Lọc theo khoảng lương (giao nhau):
        //  - Nếu có ngưỡng tối thiểu mong muốn: job.salaryMax >= desiredMin
        //  - Nếu có ngưỡng tối đa mong muốn: job.salaryMin <= desiredMax
        const { salaryMin, salaryMax } = searchFilters || {};
        const desiredMin = Number(salaryMin);
        const desiredMax = Number(salaryMax);
        if (!Number.isNaN(desiredMin) && salaryMin !== null && salaryMin !== undefined && salaryMin !== '') {
            filterStr += filterStr ? ` and salaryMax >= ${desiredMin}` : `salaryMax >= ${desiredMin}`;
        }
        if (!Number.isNaN(desiredMax) && salaryMax !== null && salaryMax !== undefined && salaryMax !== '') {
            filterStr += filterStr ? ` and salaryMin <= ${desiredMax}` : `salaryMin <= ${desiredMax}`;
        }

        if (filterStr) {
            query = `filter=${filterStr}&${query}`;
        }

        return query;
    };

    const FetchAllJobs = async (page = 1, pageSize = 10, searchFilters = filters) => {
        setIsFetching(true);
        try {
            const query = buildQuery(page, pageSize, searchFilters);
            console.log('Query params:', query);
            const res = await fetchAllJobAPI(query);
            if (res.data) {
                setJobs(res.data.result || []);
                setMeta({
                    page: res.data.meta.page,
                    pageSize: res.data.meta.pageSize || 10,
                    total: res.data.meta.total || 0,
                });
            } else {
                setJobs([]);
                message.error("Lỗi khi tải danh sách job");
            }
        } catch (error) {
            console.error("Error:", error);
            setJobs([]);
            message.error("Lỗi khi tải danh sách job");
        } finally {
            setIsFetching(false);
        }
    };

    const handleTableChange = (pagination) => {
        const { current, pageSize } = pagination;
        FetchAllJobs(current, pageSize);
    };

    const handleSearch = (values) => {
        // Gọi API trực tiếp với giá trị mới
        FetchAllJobs(1, meta.pageSize, values);
        // Cập nhật state filters sau
        setFilters(values);
    };

    const handleReset = () => {
        form.resetFields();
        const emptyFilters = { name: '', salaryMin: null, salaryMax: null };
        setFilters(emptyFilters);
        FetchAllJobs(1, meta.pageSize, emptyFilters);
    };

    const handleDeleteJob = async (id) => {
        if (id) {
            const res = await callDeleteJob(id);
            if (res && +res.statusCode === 200) {
                message.success("Xóa Job thành công");
                FetchAllJobs(meta.page, meta.pageSize);
            } else {
                message.error("Có lỗi xảy ra khi xóa Job");
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
            title: "Tên Job",
            dataIndex: "name",
            sorter: true,
        },
        {
            title: "Công ty",
            dataIndex: ["company", "name"],
            sorter: true,
        },
        {
            title: "Lương (từ–đến)",
            key: "salaryRange",
            sorter: true,
            render: (_, record) => {
                const fmt = (val) => ("" + (val ?? 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                const { salaryMin, salaryMax } = record || {};
                if (salaryMin == null && salaryMax == null) {
                    return <>Thoả thuận</>;
                }
                if (salaryMin === salaryMax) {
                    return <>{fmt(salaryMin)} đ</>;
                }
                return <>{fmt(salaryMin)} — {fmt(salaryMax)} đ</>;
            }
        },
        {
            title: "Level",
            dataIndex: "level",
            filters: [
                { text: 'INTERN', value: 'INTERN' },
                { text: 'FRESHER', value: 'FRESHER' },
                { text: 'JUNIOR', value: 'JUNIOR' },
                { text: 'MIDDLE', value: 'MIDDLE' },
                { text: 'SENIOR', value: 'SENIOR' },
            ],
            onFilter: (value, record) => record.level === value,
        },
        {
            title: "Trạng thái",
            dataIndex: "active",
            render: (active) => (
                <Tag color={active ? "lime" : "red"}>
                    {active ? "ACTIVE" : "INACTIVE"}
                </Tag>
            )
        },
        {
            title: "CreatedAt",
            dataIndex: "createdAt",
            width: 200,
            sorter: true,
            render: (text, record) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
        },
        {
            title: "UpdatedAt",
            dataIndex: "updatedAt",
            width: 200,
            sorter: true,
            render: (text, record) => {
                return (
                    <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
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
                        title="Xác nhận xóa job"
                        onConfirm={() => handleDeleteJob(record.id)}
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
                <Form.Item name="name" label="Name">
                    <Input placeholder="Tìm theo tên" allowClear />
                </Form.Item>
                <Form.Item name="salaryMin" label="Lương từ">
                    <InputNumber min={0} step={1000000} placeholder="Tối thiểu" style={{ width: 140 }} />
                </Form.Item>
                <Form.Item name="salaryMax" label="đến">
                    <InputNumber min={0} step={1000000} placeholder="Tối đa" style={{ width: 140 }} />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Tìm kiếm
                        </Button>
                        <Button onClick={handleReset}>Đặt lại</Button>
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
                Thêm Job
            </Button>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={jobs}
                loading={isFetching}
                pagination={{
                    current: meta.page,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} job`
                }}
                onChange={handleTableChange}
            />

            <ModalJob
                openModal={openModal}
                setOpenModal={setOpenModal}
                dataInit={dataInit}
                setDataInit={setDataInit}
                reloadTable={() => FetchAllJobs(meta.page, meta.pageSize)}
            />
        </div>
    );
};

export default JobPage;
