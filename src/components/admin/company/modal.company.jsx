import { Modal, Form, Input, message, Image } from "antd";
import { useState, useEffect } from "react";
import { callCreateCompany, callUpdateCompany } from "../../../services/api.service";

const ModalCompany = ({ openModal, setOpenModal, dataInit, setDataInit, reloadTable }) => {
    const [form] = Form.useForm();
    const [logoPreview, setLogoPreview] = useState("");

    useEffect(() => {
        if (dataInit) {
            form.setFieldsValue(dataInit);
            setLogoPreview(dataInit.logo || "");
        } else {
            form.resetFields();
            setLogoPreview("");
        }
    }, [dataInit]);

    const handleSubmit = async (values) => {
        if (!values.logo) {
            message.error("Vui lòng nhập URL ảnh Logo");
            return;
        }

        const payload = { ...values };
        const res = dataInit?.id
            ? await callUpdateCompany(dataInit.id, payload)
            : await callCreateCompany(payload);

        if (res.data) {
            message.success(dataInit?.id ? "Cập nhật thành công" : "Thêm mới thành công");
            handleReset();
            reloadTable();
        } else {
            message.error("Có lỗi xảy ra");
        }
    };

    const handleReset = () => {
        form.resetFields();
        setLogoPreview("");
        setDataInit(null);
        setOpenModal(false);
    };

    return (
        <Modal
            title={dataInit?.id ? "Cập nhật Company" : "Tạo mới Company"}
            open={openModal}
            onOk={() => form.submit()}
            onCancel={handleReset}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
            >
                <Form.Item
                    label="Tên công ty"
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="URL Ảnh Logo (dán link ảnh từ internet)"
                    name="logo"
                    rules={[{ required: true, message: "Vui lòng nhập URL ảnh Logo" }]}
                >
                    <Input
                        placeholder="https://example.com/logo.png"
                        onChange={(e) => setLogoPreview(e.target.value)}
                    />
                </Form.Item>

                {logoPreview && (
                    <div style={{ marginBottom: 16, textAlign: "center" }}>
                        <p style={{ marginBottom: 8, color: "#aaa" }}>Xem trước:</p>
                        <Image
                            src={logoPreview}
                            alt="Logo preview"
                            style={{
                                maxHeight: 100,
                                maxWidth: "100%",
                                objectFit: "contain",
                                borderRadius: 8,
                                border: "1px solid #333",
                                padding: 8
                            }}
                            fallback="https://via.placeholder.com/100x100?text=Invalid+URL"
                        />
                    </div>
                )}

                <Form.Item
                    label="Địa chỉ"
                    name="address"
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                >
                    <Input.TextArea />
                </Form.Item>

                <Form.Item
                    label="Mô tả"
                    name="description"
                >
                    <Input.TextArea />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalCompany;
