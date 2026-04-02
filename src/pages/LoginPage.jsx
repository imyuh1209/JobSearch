import { Button, Checkbox, Form, Input, notification } from "antd";
import { loginUserAPI, loginWithGoogle } from '../services/api.service';
import { useNavigate, Link } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../components/context/auth.context";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const LoginPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const googleBtnRef = useRef(null);
    const [googleReady, setGoogleReady] = useState(false);

    // 3D Tilt Effect Setup
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);
    const rotateX = useTransform(mouseYSpring, [0, 1], [6, -6]);
    const rotateY = useTransform(mouseXSpring, [0, 1], [-6, 6]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        x.set(mouseX / width);
        y.set(mouseY / height);
    };

    const handleMouseLeave = () => {
        x.set(0.5);
        y.set(0.5);
    };

    const validateUsernameOrEmail = (_, value) => {
        const trimmed = (value || "").trim();
        if (!trimmed) return Promise.reject('Vui lòng nhập email!');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(trimmed) || trimmed.length >= 3) return Promise.resolve();
        return Promise.reject('Email không hợp lệ!');
    };

    const onFinish = async (values) => {
        try {
            setIsSubmitting(true);
            const res = await loginUserAPI(values.username, values.password);
            const data = res?.data || res;
            if (data?.access_token || data?.data?.access_token) {
                notification.success({ message: "Đăng nhập thành công", description: "Chào mừng bạn quay lại!" });
                const access = data?.access_token || data?.data?.access_token;
                const refresh = data?.refresh_token || data?.data?.refresh_token;
                const userData = data?.user || data?.data?.user;
                if (access) localStorage.setItem("access_token", access);
                if (refresh) localStorage.setItem("refresh_token", refresh);
                if (userData) {
                    setUser(userData);
                    // Điều hướng dựa trên Role để thỏa mãn test kịch bản
                    const role = userData?.role?.name;
                    if (role === 'SUPER_ADMIN' || role === 'Company' || role === 'Công ty') {
                        navigate("/admin");
                    } else {
                        navigate("/");
                    }
                }
            } else {
                notification.error({ message: "Đăng nhập thất bại", description: data?.message || "Sai email hoặc mật khẩu." });
            }
        } catch (e) {
            const status = e?.response?.status ?? e?.response?.data?.statusCode;
            const rawMsg = e?.response?.data?.message || e?.message || "";
            let description = "Có lỗi xảy ra, vui lòng thử lại!";
            if (status === 401 || /bad credentials|unauthorized|invalid/i.test(rawMsg)) {
                description = "sai email hoặc mật khẩu hoặc không hợp lệ!";
            } else if (status >= 500) {
                description = "Máy chủ gặp sự cố, vui lòng thử lại sau.";
            }
            notification.error({ message: "Đăng nhập thất bại", description });
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const remembered = localStorage.getItem('remember_login_email') || '';
        if (remembered) form.setFieldsValue({ username: remembered, remember: true });
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
        if (!clientId) return;
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true; script.defer = true;
        script.onload = () => {
            setGoogleReady(true);
            try {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async (resp) => {
                        const idToken = resp?.credential;
                        if (!idToken) { notification.error({ message: 'Đăng nhập Google thất bại' }); return; }
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
                                notification.error({ message: 'Đăng nhập thất bại', description: data?.message });
                            }
                        } catch (e) {
                            notification.error({ message: 'Đăng nhập Google thất bại', description: e?.response?.data?.message || e.message });
                        }
                    }
                });
            } catch (_) { notification.error({ message: 'Không thể khởi tạo Google Sign-In' }); }
        };
        document.body.appendChild(script);
        return () => { try { window.google?.accounts.id.cancel(); } catch (_) { } };
    }, []);

    useEffect(() => {
        if (googleReady && googleBtnRef.current && window.google?.accounts?.id) {
            try {
                window.google.accounts.id.renderButton(googleBtnRef.current, {
                    theme: 'filled_blue', size: 'large', text: 'signin_with', shape: 'pill', locale: 'vi', width: '300'
                });
            } catch (e) { console.error(e); }
        }
    }, [googleReady]);

    const inputStyle = {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#fff',
        borderRadius: 12,
        height: 50,
        fontSize: 15,
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)',
            padding: '100px 20px 40px', position: 'relative', overflow: 'hidden'
        }}>
            {/* Background effects */}
            <motion.div
                animate={{ y: [0, -40, 0], x: [0, 30, 0], scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: 'absolute', top: '5%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, rgba(79,70,229,0.35), transparent 60%)', filter: 'blur(70px)', pointerEvents: 'none' }}
            />
            <motion.div
                animate={{ y: [0, 50, 0], x: [0, -40, 0], scale: [1, 1.3, 1], rotate: [0, -30, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle at 70% 70%, rgba(168,85,247,0.3), transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none' }}
            />
            <motion.div
                animate={{ y: [0, -30, 0], x: [0, -20, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                style={{ position: 'absolute', top: '20%', right: '20%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle at 50% 50%, rgba(56,189,248,0.2), transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }}
            />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

            <motion.div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    display: 'flex', width: '100%', maxWidth: 980,
                    borderRadius: 28, overflow: 'hidden',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.06)',
                    position: 'relative', zIndex: 1, minHeight: 600,
                    rotateX,
                    rotateY,
                    transformPerspective: 1200
                }}
            >
                {/* Left panel */}
                <div style={{
                    flex: '0 0 40%',
                    background: 'linear-gradient(160deg, #2e2854 0%, #1e1b38 100%)',
                    borderRight: '1px solid rgba(255,255,255,0.02)',
                    padding: '56px 44px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    position: 'relative', zIndex: 2
                }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 48, textDecoration: 'none' }}>
                        <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎯</div>
                        <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>WorkGo</span>
                    </Link>
                    <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.04em', margin: '0 0 18px' }}>
                        Chào mừng<br />trở lại! 👋
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, margin: '0 0 48px' }}>
                        Đăng nhập để tiếp tục hành trình khám phá cơ hội nghề nghiệp của bạn.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { icon: '⚡', text: 'Việc làm  cập nhật hằng ngày' },
                            { icon: '🏆', text: 'Kết nối với top công ty công nghệ' },
                            { icon: '💰', text: 'Mức lương hấp dẫn, cạnh tranh' },
                        ].map(f => (
                            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{f.icon}</div>
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right panel — Form */}
                <div style={{
                    flex: 1, background: '#121421',
                    padding: '60px 80px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    position: 'relative', zIndex: 2
                }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.03em' }}>Đăng nhập</h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 36, lineHeight: 1.5 }}>
                        Chưa có tài khoản?{' '}
                        <Link to="/register" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>Đăng ký miễn phí →</Link>
                    </p>

                    <Form layout="vertical" form={form} name="login_form" initialValues={{ remember: true }} onFinish={onFinish} size="large">
                        <Form.Item
                            label={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600, letterSpacing: '0.01em', textTransform: 'uppercase' }}><span style={{ color: '#f43f5e' }}>* </span>EMAIL</span>}
                            name="username"
                            rules={[{ validator: validateUsernameOrEmail }]}
                        >
                            <Input placeholder="you@example.com" style={inputStyle} />
                        </Form.Item>
                        <Form.Item
                            label={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600, letterSpacing: '0.01em', textTransform: 'uppercase' }}><span style={{ color: '#f43f5e' }}>* </span>MẬT KHẨU</span>}
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password placeholder="••••••••" style={inputStyle} />
                        </Form.Item>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox id="remember" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Ghi nhớ đăng nhập</Checkbox>
                            </Form.Item>
                            <Link to="/forgot-password" style={{ color: '#818cf8', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Quên mật khẩu?</Link>
                        </div>

                        <Form.Item>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    width: '100%', height: 54, fontSize: 16, fontWeight: 700, borderRadius: 14,
                                    background: isSubmitting ? 'rgba(79,70,229,0.5)' : 'linear-gradient(to right, #4f46e5, #7c3aed)',
                                    border: 'none', color: '#fff', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 28px rgba(79,70,229,0.45)',
                                    transition: 'all 0.2s', letterSpacing: '0.01em',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                }}
                            >
                                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập →'}
                            </button>
                        </Form.Item>
                    </Form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '4px 0 24px' }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, letterSpacing: '0.1em' }}>HOẶC</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {googleReady ? (
                            <div ref={googleBtnRef} />
                        ) : (
                            <div style={{ height: 44, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                                Đang tải Google...
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default LoginPage;
