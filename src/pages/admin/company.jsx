import React, { useEffect, useState } from "react";
import { getCompanyLogoUrl } from "../../utils/logoHelper";
import { Table, Space, Popconfirm, message, Button, Input, Form } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { fetchAllCompanyAPI, deleteCompanyAPI } from "../../services/api.service";
import ModalCompany from "../../components/admin/company/modal.company";

const CompanyTable = () => {
    const [companies, setCompanies] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState({ name: '', address: '' });

    // State để mở Modal
    const [openModal, setOpenModal] = useState(false);
    const [dataInit, setDataInit] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        FetchAllCompanies(1, meta.pageSize, { name: '', address: '' });
    }, []); // Chỉ gọi một lần khi component mount

    const buildQuery = (page, pageSize, searchFilters) => {
        let query = `page=${page}&size=${pageSize}&sort=updatedAt,desc`;

        // Thêm filter nếu có
        let filterStr = '';
        if (searchFilters.name) {
            filterStr = `name ~ '${searchFilters.name}'`;
        }
        if (searchFilters.address) {
            filterStr += searchFilters.name ?
                ` and address ~ '${searchFilters.address}'` :
                `address ~ '${searchFilters.address}'`;
        }

        if (filterStr) {
            query = `filter=${filterStr}&${query}`;
        }

        return query;
    };

    const FetchAllCompanies = async (page = 1, pageSize = 10, searchFilters = filters) => {
        setIsFetching(true);
        try {
            const query = buildQuery(page, pageSize, searchFilters);
            console.log('Query params:', query);
            const res = await fetchAllCompanyAPI(query);
            if (res.data) {
                setCompanies(res.data.result);
                setMeta({
                    page: res.data.meta.page,
                    pageSize: res.data.meta.pageSize || 10,
                    total: res.data.meta.total || 0,
                });
            } else {
                message.error("Lỗi khi tải danh sách công ty");
            }
        } catch (error) {
            console.error("Error:", error);
            message.error("Lỗi khi tải danh sách công ty");
        } finally {
            setIsFetching(false);
        }
    };

    const handleTableChange = (pagination) => {
        const { current, pageSize } = pagination;
        FetchAllCompanies(current, pageSize);
    };

    const handleSearch = (values) => {
        // Gọi API trực tiếp với giá trị mới
        FetchAllCompanies(1, meta.pageSize, values);
        // Cập nhật state filters sau
        setFilters(values);
    };

    const handleReset = () => {
        form.resetFields();
        const emptyFilters = { name: '', address: '' };
        setFilters(emptyFilters);
        FetchAllCompanies(1, meta.pageSize, emptyFilters);
    };

    const handleDeleteCompany = async (id) => {
        if (id) {
            const res = await deleteCompanyAPI(id);
            if (res && res.statusCode === 202) {
                message.success("Xóa Company thành công");
                FetchAllCompanies(meta.page, meta.pageSize);
            } else {
                message.error("Có lỗi xảy ra khi xóa Company");
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
            title: "Tên công ty",
            dataIndex: "name",
            sorter: true,
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            sorter: true,
        },
        {
            title: "Logo",
            dataIndex: "logo",
            render: (logo) => (
                <img
                src={getCompanyLogoUrl(logo)}
                    alt="logo"
                    style={{ width: 50, height: 50, objectFit: 'cover' }}
                />
            )
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
                        title="Xác nhận xóa company"
                        onConfirm={() => handleDeleteCompany(record.id)}
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
                <Form.Item name="address" label="Address">
                    <Input placeholder="Tìm theo địa chỉ" allowClear />
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
                Thêm Công Ty
            </Button>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={companies}
                loading={isFetching}
                pagination={{
                    current: meta.page,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} công ty`
                }}
                onChange={handleTableChange}
            />

            <ModalCompany
                openModal={openModal}
                setOpenModal={setOpenModal}
                dataInit={dataInit}
                setDataInit={setDataInit}
                reloadTable={() => FetchAllCompanies(meta.page, meta.pageSize)}
            />
        </div>
    );
};

export default CompanyTable;
