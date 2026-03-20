import { Button, Form, Input, notification } from "antd";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { callResetPassword } from "../services/api.service";

const ResetPasswordPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tokenFromUrl = searchParams.get("token");
    const [form] = Form.useForm();

    useEffect(() => {
        if (tokenFromUrl) {
            form.setFieldsValue({ token: tokenFromUrl });
        }
    }, [tokenFromUrl, form]);

    const onFinish = async (values) => {
        setIsSubmitting(true);
        try {
            const res = await callResetPassword(values.token, values.newPassword);
            if (res && (res.statusCode === 200 || res.statusCode === 201 || res.data?.statusCode === 200)) {
                 notification.success({
                    message: "Thành công",
                    description: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."
                });
                navigate("/login");
            } else {
                 notification.error({
                    message: "Có lỗi xảy ra",
                    description: res?.message || res?.error || "Không thể đặt lại mật khẩu, vui lòng thử lại."
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
                <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Đặt lại mật khẩu</h2>
                <Form
                    form={form}
                    name="reset-password"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="Mã xác thực (Token)"
                        name="token"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã xác thực!' },
                            { pattern: /^\d{6}$/, message: 'Mã xác thực phải gồm 6 chữ số!' }
                        ]}
                    >
                        <Input placeholder="Nhập mã xác thực 6 số" maxLength={6} style={{ textAlign: 'center', letterSpacing: '4px', fontWeight: 'bold' }} />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu mới" />
                    </Form.Item>
                    
                     <Form.Item
                        label="Xác nhận mật khẩu"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Xác nhận mật khẩu mới" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={isSubmitting}>
                            Lưu mật khẩu mới
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

export default ResetPasswordPage;
