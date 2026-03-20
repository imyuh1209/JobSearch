import { Modal, Form, Input, message } from "antd";
import { useState } from "react";
import { callCreateNotification } from "../../../services/api.service";

const ModalNotification = (props) => {
    const { open, setOpen, fetchNotifications } = props;
    const [form] = Form.useForm();
    const [isSubmit, setIsSubmit] = useState(false);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmit(true);
            const res = await callCreateNotification(values);
            if (res && res.statusCode === 201) {
                message.success("Tạo thông báo toàn hệ thống thành công");
                setOpen(false);
                form.resetFields();
                fetchNotifications();
            } else {
                message.error("Có lỗi xảy ra");
            }
        } catch (error) {
            console.log("Validate Failed:", error);
        } finally {
            setIsSubmit(false);
        }
    };

    return (
        <Modal
            title="Tạo thông báo mới"
            open={open}
            onOk={handleOk}
            onCancel={() => { setOpen(false); form.resetFields(); }}
            confirmLoading={isSubmit}
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Tiêu đề" name="title" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Nội dung" name="message" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
                    <Input.TextArea rows={4} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ModalNotification;
