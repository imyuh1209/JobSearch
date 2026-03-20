import { Button, Checkbox, Divider, Form, Input, notification, Select } from "antd";
import { loginUserAPI, loginWithGoogle, inspectGoogleToken } from '../services/api.service';
import { useNavigate, Link } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../components/context/auth.context";
import styles from '../styles/auth.module.scss';
import { UserOutlined } from '@ant-design/icons';

const LoginPage = () => {

    const [form] = Form.useForm();
    const navigate = useNavigate(); // Hook để điều hướng
    const { setUser } = useContext(AuthContext);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const googleBtnRef = useRef(null);
    const [googleReady, setGoogleReady] = useState(false);
    const [lastIdToken, setLastIdToken] = useState("");

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
            const data = res?.data || res;
            if (data?.access_token || data?.data?.access_token) {
                notification.success({
                    message: "Đăng nhập thành công",
                    description: "Chào mừng bạn quay lại!"
                });
                const access = data?.access_token || data?.data?.access_token;
                const refresh = data?.refresh_token || data?.data?.refresh_token;
                const userData = data?.user || data?.data?.user;
                if (access) localStorage.setItem("access_token", access);
                if (refresh) localStorage.setItem("refresh_token", refresh);
                if (userData) setUser(userData);
                if (values.remember) {
                    localStorage.setItem('remember_login_email', (values.username || '').trim());
                } else {
                    localStorage.removeItem('remember_login_email');
                }
                navigate("/");
            } else {
                notification.error({
                    message: "Đăng nhập thất bại",
                    description: data?.message || "Sai email hoặc mật khẩu."
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

    useEffect(() => {
        const remembered = localStorage.getItem('remember_login_email') || '';
        if (remembered) {
            form.setFieldsValue({ username: remembered, remember: true });
        }
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
        console.log('[GoogleSignIn] clientId =', clientId ? '[SET]' : '[MISSING]');
        if (!clientId) return;
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            setGoogleReady(true);
            console.log('[GoogleSignIn] script loaded, initializing');
            try {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async (resp) => {
                        const idToken = resp?.credential;
                        if (!idToken) {
                            notification.error({ message: 'Đăng nhập Google thất bại', description: 'Không nhận được id_token' });
                            return;
                        }
                        setLastIdToken(idToken);
                        try {
                            const res = await loginWithGoogle(idToken);
                            const data = res?.data || res;
                            const access = data?.access_token || data?.data?.access_token;
                            const refresh = data?.refresh_token || data?.data?.refresh_token;
                            const userData = data?.user || data?.data?.user;
                            if (access) {
                                localStorage.setItem('access_token', access);
                                if (refresh) localStorage.setItem('refresh_token', refresh);
                                if (userData) setUser(userData);
                                notification.success({ message: 'Đăng nhập Google thành công' });
                                navigate('/');
                            } else {
                                const err = data?.error_description || data?.message || 'Không thể đăng nhập Google';
                                notification.error({ message: 'Đăng nhập thất bại', description: err });
                            }
                        } catch (e) {
                            const err = e?.response?.data?.error_description || e?.response?.data?.message || e.message;
                            notification.error({ message: 'Đăng nhập Google thất bại', description: err });
                        }
                    }
                });
                // renderButton sẽ được gọi sau khi phần tử ref mount trong effect bên dưới
            } catch (_) {
                notification.error({ message: 'Không thể khởi tạo Google Sign-In' });
                console.error('[GoogleSignIn] init error', _);
            }
        };
        script.onerror = (e) => {
            console.error('[GoogleSignIn] script load error', e);
        };
        document.body.appendChild(script);
        return () => {
            try { window.google?.accounts.id.cancel(); } catch (_) {}
        };
    }, []);

    useEffect(() => {
        if (googleReady && googleBtnRef.current && window.google?.accounts?.id) {
            try {
                window.google.accounts.id.renderButton(googleBtnRef.current, { theme: 'filled_blue', size: 'large', text: 'signin_with', shape: 'pill', logo_alignment: 'left', locale: 'vi', width: '300' });
                console.log('[GoogleSignIn] button rendered (effect)');
            } catch (e) {
                console.error('[GoogleSignIn] renderButton error', e);
            }
        }
    }, [googleReady]);

    return (
        <div className={styles['auth-container']}>
            <div className={styles['auth-card']}>
                <div className={styles['auth-side-left']}>
                    <UserOutlined className={styles['auth-icon']} />
                    <h2>Đăng Nhập</h2>
                    <p>Chào mừng bạn quay lại! Hãy đăng nhập để tiếp tục.</p>
                </div>
                
                <div className={styles['auth-side-right']}>
                    <div className={styles['form-header']}>
                        <h3>Tài khoản</h3>
                        <p>Nhập thông tin đăng nhập của bạn</p>
                    </div>

                    <Form
                        layout="vertical"
                        form={form}
                        name="basic"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        size="large"
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

                        <div className={styles['link-group']}>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Ghi nhớ</Checkbox>
                            </Form.Item>
                            <Link to="/forgot-password">Quên mật khẩu?</Link>
                        </div>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: "100%" }} loading={isSubmitting}>
                                Đăng nhập
                            </Button>
                        </Form.Item>
                    </Form>

                    <div style={{ position: 'relative', margin: '20px 0', textAlign: 'center' }}>
                        <Divider plain>hoặc</Divider>
                    </div>

                    <div className={styles['google-btn-wrapper']}>
                        {googleReady ? (
                            <div ref={googleBtnRef} />
                        ) : (
                            <Button disabled style={{ width: '100%' }}>Đăng nhập với Google...</Button>
                        )}
                    </div>

                    <div className={styles['bottom-text']}>
                        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
