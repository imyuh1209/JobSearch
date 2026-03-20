import { Button, Form, Input, notification } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { callForgotPassword } from "../services/api.service";

const ForgotPasswordPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setIsSubmitting(true);
        try {
            const res = await callForgotPassword(values.email);
            // Assuming the backend returns a success message or statusCode
            if (res && (res.statusCode === 200 || res.statusCode === 201 || res.data?.statusCode === 200)) {
                 notification.success({
                    message: "Thành công",
                    description: "Vui lòng kiểm tra email để lấy mã xác thực."
                });
                navigate("/reset-password");
            } else {
                 notification.error({
                    message: "Có lỗi xảy ra",
                    description: res?.message || res?.error || "Không thể gửi yêu cầu, vui lòng thử lại."
                });
            }
        } catch (error) {
            notification.error({
                message: "Có lỗi xảy ra",
                description: error?.response?.data?.message || error?.message || "Vui lòng thử lại sau."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <div style={{ width: 400, padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Quên mật khẩu</h2>
                <Form
                    name="forgot-password"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input placeholder="Nhập email của bạn" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={isSubmitting}>
                            Gửi yêu cầu
                        </Button>
                    </Form.Item>
                    
                    <div style={{ textAlign: 'center' }}>
                        <Link to="/login">Quay lại đăng nhập</Link>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
