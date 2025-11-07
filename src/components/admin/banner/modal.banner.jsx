import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Modal, Form, Input, message, Upload, Switch, ConfigProvider } from "antd";
import { useState } from "react";
import { callUploadSingleFile, callCreateBanner, callUpdateBanner } from "../../../services/api.service";
import enUS from 'antd/lib/locale/en_US';

const ModalBanner = ({ openModal, setOpenModal, dataInit, setDataInit, reloadTable }) => {
    const [form] = Form.useForm();
    const [loadingUpload, setLoadingUpload] = useState(false);
    const [dataImage, setDataImage] = useState([]);

    const handleSubmit = async (values) => {
        if (!dataImage.length && !dataInit?.image) {
            message.error("Vui lòng upload ảnh banner");
            return;
        }

        const payload = {
            title: values.title?.trim(),
            link: values.link?.trim(),
            position: values.position?.trim() || 'HOME',
            active: !!values.active,
            image: dataImage[0]?.name || dataInit?.image
        };

        const res = dataInit?.id
            ? await callUpdateBanner(dataInit.id, payload)
            : await callCreateBanner(payload);

        if (res?.data) {
            message.success(dataInit?.id ? "Cập nhật banner thành công" : "Tạo banner thành công");
            handleReset();
            reloadTable?.();
        } else {
            message.error("Có lỗi xảy ra");
        }
    };

    const handleReset = () => {
        form.resetFields();
        setDataImage([]);
        setDataInit(null);
        setOpenModal(false);
    };

    const handleUploadFile = async ({ file, onSuccess, onError }) => {
        setLoadingUpload(true);
        try {
            const res = await callUploadSingleFile(file, "banner");
            if (res?.data) {
                setDataImage([{ name: res.data.fileName }]);
                onSuccess?.("ok");
            } else {
                onError?.(new Error(res?.message || 'Upload failed'));
            }
        } catch (e) {
            onError?.(new Error('Upload failed'));
        } finally {
            setLoadingUpload(false);
        }
    };

    const beforeUpload = (file) => {
        const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
        if (!isImage) {
            message.error('Chỉ chấp nhận ảnh JPG/PNG/WebP');
            return false;
        }
        const isLt3M = file.size / 1024 / 1024 < 3;
        if (!isLt3M) {
            message.error('Kích thước file phải nhỏ hơn 3MB');
            return false;
        }
        return true;
    };

    return (
        <Modal
            title={dataInit?.id ? "Cập nhật Banner" : "Tạo mới Banner"}
            open={openModal}
            onOk={() => form.submit()}
            onCancel={handleReset}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form
                form={form}
                onFinish={handleSubmit}
                initialValues={{
                    title: dataInit?.title,
                    link: dataInit?.link,
                    position: dataInit?.position || 'HOME',
                    active: dataInit?.active ?? true
                }}
                layout="vertical"
            >
                <Form.Item
                    label="Tiêu đề"
                    name="title"
                    rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Ảnh Banner"
                    required
                >
                    <ConfigProvider locale={enUS}>
                        <Upload
                            listType="picture-card"
                            maxCount={1}
                            customRequest={handleUploadFile}
                            beforeUpload={beforeUpload}
                            defaultFileList={dataInit?.image ? [{
                                uid: '-1',
                                name: dataInit.image,
                                status: 'done',
                                url: `${import.meta.env.VITE_BACKEND_URL}/storage/banner/${dataInit.image}`
                            }] : []}
                        >
                            {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                        </Upload>
                    </ConfigProvider>
                </Form.Item>

                <Form.Item label="Liên kết" name="link">
                    <Input placeholder="https://..." />
                </Form.Item>

                <Form.Item label="Vị trí" name="position">
                    <Input placeholder="HOME" />
                </Form.Item>

                <Form.Item label="Kích hoạt" name="active" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalBanner;