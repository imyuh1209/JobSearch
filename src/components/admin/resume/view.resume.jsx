import React, { useState, useEffect } from 'react';
import { Badge, Button, Descriptions, Drawer, Form, Select, message, notification, Space } from "antd";
import dayjs from 'dayjs';
import { callUpdateResumeStatus, callSendResumeStatusEmail } from "../../../services/api.service";

const { Option } = Select;

const ViewDetailResume = (props) => {
    const [isSubmit, setIsSubmit] = useState(false);
    const { onClose, open, dataInit, setDataInit, reloadTable } = props;
    const [form] = Form.useForm();

    const handleChangeStatus = async () => {
        setIsSubmit(true);
        try {
            const status = form.getFieldValue('status');
            const res = await callUpdateResumeStatus(dataInit?.id, status);
            if (res && res.data) {
                message.success("Cập nhật trạng thái thành công!");
                // Try to send email notification to applicant
                try {
                    const mail = await callSendResumeStatusEmail(dataInit?.id, status);
                    if (mail?.data) {
                        message.success("Đã gửi email thông báo tới ứng viên.");
                    } else {
                        message.warning("Cập nhật xong nhưng gửi email thất bại.");
                    }
                } catch (mailErr) {
                    message.warning("Cập nhật xong nhưng gửi email thất bại.");
                }
                setDataInit(null);
                onClose(false);
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } catch (error) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error.message
            });
        } finally {
            setIsSubmit(false);
        }
    };

    useEffect(() => {
        if (dataInit) {
            form.setFieldValue("status", dataInit.status);
        }
        return () => form.resetFields();
    }, [dataInit]);

    return (
        <Drawer
            title="Thông Tin Resume"
            placement="right"
            onClose={() => { onClose(false); setDataInit(null) }}
            open={open}
            width={"40vw"}
            maskClosable={false}
            destroyOnClose
            extra={
                <Space>
                    {dataInit?.url && (
                        <Button
                            type="primary"
                            onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${dataInit.url}`, '_blank')}
                        >
                            Xem CV
                        </Button>
                    )}
                    <Button loading={isSubmit} type="primary" onClick={handleChangeStatus}>
                        Cập nhật trạng thái
                    </Button>
                </Space>
            }
        >
            <Descriptions title="" bordered column={2} layout="vertical">
                <Descriptions.Item label="Email">{dataInit?.email}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Form form={form}>
                        <Form.Item name={"status"}>
                            <Select
                                style={{ width: "100%" }}
                                defaultValue={dataInit?.status}
                            >
                                <Option value="PENDING">PENDING</Option>
                                <Option value="REVIEWING">REVIEWING</Option>
                                <Option value="APPROVED">APPROVED</Option>
                                <Option value="REJECTED">REJECTED</Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Descriptions.Item>
                <Descriptions.Item label="Tên Job">
                    {dataInit?.job?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Tên Công Ty">
                    {dataInit?.companyName}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                    {dataInit?.createdAt ? dayjs(dataInit.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sửa">
                    {dataInit?.updatedAt ? dayjs(dataInit.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
};

export default ViewDetailResume;