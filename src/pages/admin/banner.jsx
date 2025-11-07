import React, { useEffect, useState, useContext } from "react";
import { Table, Space, Popconfirm, message, Button, Input, Form, Tag } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { fetchAllBannerAPI, callDeleteBanner } from "../../services/api.service";
import ModalBanner from "../../components/admin/banner/modal.banner";
import { AuthContext } from '../../components/context/auth.context.jsx';

const BannerAdminPage = () => {
    const [banners, setBanners] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState({ title: '' });

    const { user } = useContext(AuthContext);
    const canManage = (user?.role?.code === 'SUPER_ADMIN' || user?.role?.name === 'SUPER_ADMIN');

    const [openModal, setOpenModal] = useState(false);
    const [dataInit, setDataInit] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        FetchAllBanners(1, meta.pageSize, { title: '' });
    }, []);

    const buildQuery = (page, pageSize, searchFilters) => {
        let query = `page=${page}&size=${pageSize}&sort=updatedAt,desc`;
        let filterStr = '';
        if (searchFilters.title) {
            filterStr = `title ~ '${searchFilters.title}'`;
        }
        if (filterStr) {
            query = `filter=${filterStr}&${query}`;
        }
        return query;
    };

    const FetchAllBanners = async (page = 1, pageSize = 10, searchFilters = filters) => {
        setIsFetching(true);
        try {
            const query = buildQuery(page, pageSize, searchFilters);
            const res = await fetchAllBannerAPI(query);
            if (res.data) {
                setBanners(res.data.result);
                setMeta({
                    page: res.data.meta.page,
                    pageSize: res.data.meta.pageSize || 10,
                    total: res.data.meta.total || 0,
                });
            } else {
                message.error("Lỗi khi tải danh sách banner");
            }
        } catch (error) {
            console.error("Error:", error);
            message.error("Lỗi khi tải danh sách banner");
        } finally {
            setIsFetching(false);
        }
    };

    const handleTableChange = (pagination) => {
        const { current, pageSize } = pagination;
        FetchAllBanners(current, pageSize);
    };

    const handleSearch = (values) => {
        FetchAllBanners(1, meta.pageSize, values);
        setFilters(values);
    };

    const handleReset = () => {
        form.resetFields();
        const emptyFilters = { title: '' };
        setFilters(emptyFilters);
        FetchAllBanners(1, meta.pageSize, emptyFilters);
    };

    const handleDeleteBanner = async (id) => {
        if (!canManage) {
            message.warning("Chỉ SUPER_ADMIN mới được xóa banner");
            return;
        }
        if (id) {
            const res = await callDeleteBanner(id);
            if (res && +res.statusCode === 202) {
                message.success("Xóa banner thành công");
                FetchAllBanners(meta.page, meta.pageSize, filters);
            } else {
                message.error("Có lỗi xảy ra khi xóa banner");
            }
        }
    };

    const columns = [
        {
            title: "STT",
            key: "index",
            width: 60,
            align: "center",
            render: (text, record, index) => (
                <>{(index + 1) + (meta.page - 1) * meta.pageSize}</>
            ),
        },
        {
            title: "Tiêu đề",
            dataIndex: "title",
            sorter: true,
        },
        {
            title: "Ảnh",
            dataIndex: "image",
            render: (image) => image ? (
                <img
                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/banner/${image}`}
                    alt="banner"
                    style={{ width: 120, height: 60, objectFit: 'cover', borderRadius: 6 }}
                />
            ) : null
        },
        {
            title: "Liên kết",
            dataIndex: "link",
            render: (link) => link ? <a href={link} target="_blank" rel="noreferrer">Mở</a> : "",
        },
        {
            title: "Vị trí",
            dataIndex: "position",
            width: 120
        },
        {
            title: "Trạng thái",
            dataIndex: "active",
            render: (active) => active ? <Tag color="green">ACTIVE</Tag> : <Tag>INACTIVE</Tag>,
            width: 120
        },
        {
            title: canManage ? "Actions" : undefined,
            key: "actions",
            render: canManage ? ((_, record) => (
                <Space>
                    <EditOutlined
                        style={{ fontSize: 20, color: "#ffa500", cursor: "pointer" }}
                        onClick={() => { setDataInit(record); setOpenModal(true); }}
                    />
                    <Popconfirm
                        title="Xác nhận xóa banner"
                        onConfirm={() => handleDeleteBanner(record.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <DeleteOutlined style={{ fontSize: 20, color: "#ff4d4f", cursor: "pointer" }} />
                    </Popconfirm>
                </Space>
            )) : undefined,
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
                <Form.Item name="title" label="Tiêu đề">
                    <Input placeholder="Tìm theo tiêu đề" allowClear />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">Tìm kiếm</Button>
                        <Button onClick={handleReset}>Làm lại</Button>
                    </Space>
                </Form.Item>
            </Form>

            {canManage && (
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => { setDataInit(null); setOpenModal(true); }}
                    style={{ marginBottom: 16 }}
                >
                    Thêm Banner
                </Button>
            )}

            <Table
                rowKey="id"
                columns={columns}
                dataSource={banners}
                loading={isFetching}
                pagination={{
                    current: meta.page,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} banner`
                }}
                onChange={handleTableChange}
            />

            {canManage && (
                <ModalBanner
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    dataInit={dataInit}
                    setDataInit={setDataInit}
                    reloadTable={() => FetchAllBanners(meta.page, meta.pageSize, filters)}
                />
            )}
        </div>
    );
};

export default BannerAdminPage;