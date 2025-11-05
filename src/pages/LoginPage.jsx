import { Button, Checkbox, Divider, Form, Input, notification, Select } from "antd";
import { loginUserAPI } from '../services/api.service';
import { useNavigate, Link } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import { useContext, useState } from "react";
import { AuthContext } from "../components/context/auth.context";
const LoginPage = () => {

    const [form] = Form.useForm();
    const navigate = useNavigate(); // Hook để điều hướng
    const { setUser } = useContext(AuthContext);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateUsernameOrEmail = (_, value) => {
        const trimmed = (value || "").trim();
        if (!trimmed) return Promise.reject('Vui lòng nhập email!');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(trimmed) || trimmed.length >= 3) return Promise.resolve();
        return Promise.reject('Email không hợp lệ hoặc tên đăng nhập quá ngắn!');
    };

    const onFinish = async (values) => {
        try {
            setIsSubmitting(true);
            const res = await loginUserAPI(values.username, values.password);
            if (res?.data) {
                notification.success({
                    message: "Đăng nhập thành công",
                    description: "Chào mừng bạn quay lại!"
                });
                localStorage.setItem("access_token", res.data.access_token);
                if (res.data.refresh_token) {
                    localStorage.setItem("refresh_token", res.data.refresh_token);
                }
                setUser(res.data.user);
                navigate("/");
            } else {
                notification.error({
                    message: "Đăng nhập thất bại",
                    description: res?.message || "Sai email hoặc mật khẩu."
                });
            }
        } catch (e) {
            const status = e?.response?.status ?? e?.response?.data?.statusCode;
            const rawMsg = e?.response?.data?.message || e?.message || "";
            let description = "Có lỗi xảy ra, vui lòng thử lại!";

            if (status === 401) {
                description = "Sai email hoặc mật khẩu!";
            } else if (typeof rawMsg === 'string' && /bad credentials|unauthorized|invalid username|invalid password/i.test(rawMsg)) {
                description = "Sai email hoặc mật khẩu!";
            } else if (typeof rawMsg === 'string' && /IdInvalidException/i.test(rawMsg)) {
                description = "Sai email hoặc mật khẩu!";
            } else if (status === 400) {
                description = "Thông tin đăng nhập chưa hợp lệ, vui lòng kiểm tra lại.";
            } else if (status >= 500) {
                description = "Máy chủ gặp sự cố, vui lòng thử lại sau.";
            }

            notification.error({
                message: "Đăng nhập thất bại",
                description
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const onFinishFailed = () => {
        notification.warning({
            message: "Thiếu thông tin",
            description: "Vui lòng kiểm tra lại email/tên đăng nhập và mật khẩu."
        });
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",  // Chiều cao full màn hình
            backgroundColor: "#f1f5f9"
        }}>
            <div style={{
                width: "400px",
                padding: "20px",
                borderRadius: "8px",
                backgroundColor: "#fff",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
            }}>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#121212" }}>Đăng Nhập</h2>
                    <Divider />
                </div>
                <Form
                    layout="vertical"
                    form={form}
                    name="basic"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="Email đăng nhập"
                        name="username"
                        rules={[{ validator: validateUsernameOrEmail }]}
                    >
                        <Input placeholder="Nhập email" />
                    </Form.Item>

                    <Form.Item label="Mật khẩu" name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                        <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>

                    <Form.Item name="remember" valuePropName="checked">
                        <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: "100%" }} loading={isSubmitting}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
                <div style={{ textAlign: "center", marginTop: 8 }}>
                    <span>
                        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;