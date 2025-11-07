import { Button, Checkbox, Divider, Form, Input, notification, Select } from "antd";
import { registerUserAPI } from "../services/api.service";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const RegisterPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate(); // Hook để điều hướng
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onFinish = async (values) => {
        setIsSubmitting(true);
        try {
            const payload = {
                name: (values.name || "").trim(),
                email: (values.email || "").trim().toLowerCase(),
                password: values.password,
                gender: values.gender,
                address: (values.address || "").trim()
            };

            const res = await registerUserAPI(
                payload.name,
                payload.email,
                payload.password,
                payload.gender,
                payload.address
            );

            if (res?.data) {
                notification.success({
                    message: "Đăng ký thành công",
                    description: "Vui lòng đăng nhập để tiếp tục."
                });
                navigate("/login");
            } else {
                notification.error({
                    message: "Đăng ký thất bại",
                    description: res?.message || "Thông tin chưa hợp lệ, vui lòng kiểm tra lại."
                });
            }
        } catch (e) {
            notification.error({
                message: "Đăng ký thất bại",
                description: e?.response?.data?.message || e.message || "Có lỗi xảy ra, vui lòng thử lại!"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onFinishFailed = () => {
        notification.warning({
            message: "Thiếu thông tin",
            description: "Vui lòng kiểm tra lại các trường bắt buộc."
        });
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",  // Chiều cao full màn hình
            backgroundColor: "var(--bg-app)"
        }}>
            <div style={{
                width: "400px",
                padding: "20px",
                borderRadius: "8px",
                backgroundColor: "var(--color-bg)",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
            }}>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "var(--color-text)" }}>Đăng Ký Tài Khoản</h2>
                    <Divider />
                </div>
                <Form
                    layout="vertical"
                    form={form}
                    name="basic"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item label="Họ và tên" name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }, { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' }]}>
                        <Input placeholder="Nhập họ và tên" />
                    </Form.Item>

                    <Form.Item label="Email" name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}>
                        <Input placeholder="Nhập email" />
                    </Form.Item>

                    <Form.Item label="Mật khẩu" name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }, { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }]}>
                        <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu"
                        name="confirm"
                        dependencies={["password"]}
                        rules={[
                            { required: true, message: 'Vui lòng nhập lại mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Nhập lại mật khẩu" />
                    </Form.Item>

                    

                    <Form.Item name="gender" label="Giới tính"
                        rules={[{ required: true, message: 'Giới tính không được để trống!' }]}> 
                        <Select allowClear placeholder="Chọn giới tính">
                            <Select.Option value="MALE">Nam</Select.Option>
                            <Select.Option value="FEMALE">Nữ</Select.Option>
                            <Select.Option value="OTHER">Khác</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Địa chỉ" name="address"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }, { min: 5, message: 'Địa chỉ quá ngắn' }]}>
                        <Input placeholder="Nhập địa chỉ" />
                    </Form.Item>

                    <Form.Item name="remember" valuePropName="checked">
                        <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ width: "100%" }}>
                            Đăng ký
                        </Button>
                    </Form.Item>
                </Form>
                <div style={{ textAlign: "center", marginTop: 8 }}>
                    <span>
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
