import React, { useEffect, useState } from "react";
import { Table, Space, Popconfirm, message, Button } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { fetchAllNotificationAPI, callDeleteNotification } from "../../../services/api.service";
import ModalNotification from "./modal.notification";
import dayjs from 'dayjs';
import { buildQuery } from "../../../config/utils";

const NotificationTable = () => {
    const [listNotify, setListNotify] = useState([]);
    const [uniqueListNotify, setUniqueListNotify] = useState([]); // State cho danh sách đã lọc trùng
    const [isFetching, setIsFetching] = useState(false);
    const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0 });
    
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, [meta.page, meta.pageSize]);

    // Xử lý lọc trùng lặp khi listNotify thay đổi
    useEffect(() => {
        if (listNotify && listNotify.length > 0) {
            const uniqueMap = new Map();
            listNotify.forEach(item => {
                // Tạo key duy nhất dựa trên nội dung và thời gian
                // Lưu ý: Dữ liệu cũ có thể lệch time mili giây nên có thể vẫn tách rời, dữ liệu mới sẽ gộp tốt
                const key = `${item.title}|${item.message}|${item.createdAt}`;
                if (!uniqueMap.has(key)) {
                    uniqueMap.set(key, item);
                }
            });
            setUniqueListNotify(Array.from(uniqueMap.values()));
        } else {
            setUniqueListNotify([]);
        }
    }, [listNotify]);

    const fetchNotifications = async () => {
        setIsFetching(true);
        try {
            // Override sort default (updatedAt) bằng createdAt vì Entity Notification không có updatedAt
            const query = buildQuery(meta.page, meta.pageSize, {}, { sort: "createdAt,desc" });
            const res = await fetchAllNotificationAPI(query);
            if (res && res.data) {
                // Trường hợp trả về ResultPaginationDTO
                if (res.data.result) {
                    setListNotify(res.data.result);
                    setMeta({
                        page: res.data.meta.page,
                        pageSize: res.data.meta.pageSize,
                        total: res.data.meta.total
                    });
                } 
                // Trường hợp trả về List thuần
                else if (Array.isArray(res.data)) {
                     setListNotify(res.data);
                     setMeta({
                        ...meta,
                        total: res.data.length
                     });
                }
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setIsFetching(false);
        }
    }

    const handleDelete = async (id) => {
        try {
            const res = await callDeleteNotification(id);
            console.log("Delete notification res:", res);
            if (res && res.statusCode === 200) {
                message.success("Xóa thông báo thành công");
                fetchNotifications();
            } else if (res === undefined || res === null || res === "") {
                 // Trường hợp trả về 204 No Content hoặc 200 OK nhưng không có body
                 message.success("Xóa thông báo thành công");
                 fetchNotifications();
            } else {
                message.error("Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Delete notification error:", error);
            message.error("Có lỗi xảy ra khi xóa");
        }
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 50,
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>
        },
        {
            title: 'Nội dung',
            dataIndex: 'message',
            ellipsis: true,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 180,
            render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm:ss")
        },
        {
            title: 'Actions',
            width: 100,
            render: (_, record) => (
                <Space>
                    <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
                        <Button icon={<DeleteOutlined />} danger size="small" />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenModal(true)}>Thêm mới</Button>
            </div>
            <Table
                columns={columns}
                dataSource={uniqueListNotify}
                rowKey="id"
                loading={isFetching}
                pagination={{
                    current: meta.page,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showSizeChanger: true,
                    onChange: (page, pageSize) => setMeta({ ...meta, page, pageSize })
                }}
            />
            <ModalNotification
                open={openModal}
                setOpen={setOpenModal}
                fetchNotifications={fetchNotifications}
            />
        </div>
    )
}

export default NotificationTable;
