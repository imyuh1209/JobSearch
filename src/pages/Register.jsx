import { Form, Input, Select, notification } from "antd";
import { registerUserAPI } from "../services/api.service";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const RegisterPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            const res = await registerUserAPI(payload.name, payload.email, payload.password, payload.gender, payload.address);
            if (res?.data) {
                notification.success({ message: "Đăng ký thành công", description: "Vui lòng đăng nhập để tiếp tục." });
                navigate("/login");
            } else {
                notification.error({ message: "Đăng ký thất bại", description: res?.message || "Vui lòng kiểm tra lại." });
            }
        } catch (e) {
            notification.error({ message: "Đăng ký thất bại", description: e?.response?.data?.message || e.message || "Có lỗi xảy ra!" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#fff', borderRadius: 12, height: 48, fontSize: 15,
    };
    const labelStyle = { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)',
            padding: '100px 20px 40px', position: 'relative', overflow: 'hidden'
        }}>
            {/* Background effects */}
            <motion.div
                animate={{ y: [0, -30, 0], x: [0, -40, 0], scale: [1, 1.15, 1], rotate: [0, -45, 0] }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: 'absolute', top: '-10%', right: '-5%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle at 60% 40%, rgba(124,58,237,0.35), transparent 65%)', filter: 'blur(75px)', pointerEvents: 'none' }}
            />
            <motion.div
                animate={{ y: [0, 45, 0], x: [0, 50, 0], scale: [1, 1.25, 1], rotate: [0, 20, 0] }}
                transition={{ duration: 19, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
                style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: 650, height: 650, borderRadius: '50%', background: 'radial-gradient(circle at 40% 60%, rgba(79,70,229,0.3), transparent 70%)', filter: 'blur(85px)', pointerEvents: 'none' }}
            />
            <motion.div
                animate={{ y: [0, -25, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                style={{ position: 'absolute', top: '15%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle at 50% 50%, rgba(236,72,153,0.18), transparent 60%)', filter: 'blur(55px)', pointerEvents: 'none' }}
            />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

            <motion.div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    display: 'flex', width: '100%', maxWidth: 980,
                    borderRadius: 28, overflow: 'hidden',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.06)',
                    position: 'relative', zIndex: 1,
                    rotateX,
                    rotateY,
                    transformPerspective: 1200
                }}
            >
                {/* Left decorative panel */}
                <div style={{
                    flex: '0 0 38%',
                    background: 'linear-gradient(160deg, #2e2854 0%, #1e1b38 100%)',
                    borderRight: '1px solid rgba(255,255,255,0.02)',
                    padding: '56px 40px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    position: 'relative', zIndex: 2
                }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 44, textDecoration: 'none' }}>
                        <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🚀</div>
                        <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>WorkGo</span>
                    </Link>
                    <h1 style={{ fontSize: 34, fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.04em', margin: '0 0 16px' }}>
                        Bắt đầu hành<br />trình của bạn 🌟
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, margin: '0 0 44px' }}>
                        Tạo tài khoản miễn phí và tiếp cận hàng nghìn cơ hội việc làm.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { icon: '🎯', text: 'Hồ sơ được tìm kiếm bởi nhiều HR' },
                            { icon: '📬', text: 'Nhận job alerts phù hợp mỗi ngày' },
                            { icon: '🔒', text: 'Bảo mật thông tin tuyệt đối' },
                        ].map(f => (
                            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{f.icon}</div>
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500 }}>{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right panel — Form */}
                <div style={{
                    flex: 1, background: '#121421',
                    padding: '48px 52px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    position: 'relative', zIndex: 2
                }}>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.03em' }}>Tạo tài khoản</h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32 }}>
                        Đã có tài khoản?{' '}
                        <Link to="/login" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>Đăng nhập →</Link>
                    </p>

                    <Form layout="vertical" form={form} name="register_form" onFinish={onFinish} size="large">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                            <Form.Item label={<span style={labelStyle}><span style={{ color: '#f43f5e' }}>* </span>HỌ VÀ TÊN</span>} name="name" rules={[{ required: true, message: 'nhập tên' }, { min: 2, message: 'nhập tên' }]}>
                                <Input placeholder="Nguyễn Văn A" style={inputStyle} />
                            </Form.Item>
                            <Form.Item label={<span style={labelStyle}><span style={{ color: '#f43f5e' }}>* </span>GIỚI TÍNH</span>} name="gender" rules={[{ required: false, message: 'bắt buộc' }]}>
                                <Select placeholder="Chọn..." style={{ borderRadius: 12 }}
                                    dropdownStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    <Select.Option value="MALE">Nam</Select.Option>
                                    <Select.Option value="FEMALE">Nữ</Select.Option>
                                    <Select.Option value="OTHER">Khác</Select.Option>
                                </Select>
                            </Form.Item>
                        </div>
                        <Form.Item label={<span style={labelStyle}><span style={{ color: '#f43f5e' }}>* </span>EMAIL</span>} name="email" rules={[{ required: true, message: 'Bắt buộc!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
                            <Input placeholder="you@example.com" style={inputStyle} />
                        </Form.Item>
                        <Form.Item label={<span style={labelStyle}><span style={{ color: '#f43f5e' }}>* </span>ĐỊA CHỈ</span>} name="address" rules={[{ required: false, message: 'bắt buộc' }]}>
                            <Input placeholder="Hà Nội, TP.HCM..." style={inputStyle} />
                        </Form.Item>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                            <Form.Item label={<span style={labelStyle}><span style={{ color: '#f43f5e' }}>* </span>MẬT KHẨU</span>} name="password" rules={[{ required: true, message: 'ngắn' }, { min: 6, message: 'ngắn' }]}>
                                <Input.Password placeholder="••••••••" style={inputStyle} />
                            </Form.Item>
                            <Form.Item label={<span style={labelStyle}><span style={{ color: '#f43f5e' }}>* </span>XÁC NHẬN MẬT KHẨU</span>} name="confirm" dependencies={["password"]} rules={[
                                { required: true, message: 'ngắn' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) return Promise.resolve();
                                        return Promise.reject(new Error('Mật khẩu không khớp!'));
                                    },
                                }),
                            ]}>
                                <Input.Password placeholder="••••••••" style={inputStyle} />
                            </Form.Item>
                        </div>

                        <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    width: '100%', height: 54, fontSize: 16, fontWeight: 700, borderRadius: 14,
                                    background: isSubmitting ? 'rgba(124,58,237,0.5)' : 'linear-gradient(to right, #7c3aed, #4f46e5)',
                                    border: 'none', color: '#fff', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 28px rgba(124,58,237,0.45)', transition: 'all 0.2s',
                                    letterSpacing: '0.01em',
                                }}
                            >
                                {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản miễn phí →'}
                            </button>
                        </Form.Item>
                    </Form>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
