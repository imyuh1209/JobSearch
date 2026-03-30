import React, { useContext, useState, useEffect } from 'react';
import { Dropdown, Avatar, Badge, message, ConfigProvider, theme as antdTheme } from 'antd';
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { logoutUserAPI, getAccount } from '../../services/api.service';
import { AuthContext } from '../context/auth.context';
import '../../styles/admin.css';

const NAV_ITEMS = [
    { key: '/admin', label: 'Dashboard', icon: '📊', module: null },
    { key: '/admin/company', label: 'Công ty', icon: '🏢', module: 'COMPANIES' },
    { key: '/admin/user', label: 'Người dùng', icon: '👤', module: 'USERS' },
    { key: '/admin/job', label: 'Việc làm', icon: '💼', module: 'JOBS' },
    { key: '/admin/resume', label: 'Resume', icon: '📄', module: 'RESUMES' },
    { key: '/admin/permission', label: 'Permission', icon: '🔑', module: 'PERMISSIONS' },
    { key: '/admin/role', label: 'Role', icon: '🛡️', module: 'ROLES' },
    { key: '/admin/banner', label: 'Banner', icon: '🖼️', module: '__SUPER__' },
    { key: '/admin/notification', label: 'Thông báo', icon: '🔔', module: '__SUPER__' },
];

const LayoutAdmin = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, setUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchAccount = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) { setUser({ email: "", name: "", id: "" }); navigate('/login'); return; }
            try {
                const res = await getAccount();
                if (res.data) setUser(res.data.user);
            } catch (error) {
                if (error.response?.status === 401) {
                    localStorage.removeItem("access_token");
                    setUser({ email: "", name: "", id: "" });
                    navigate('/login');
                }
            }
        };
        fetchAccount();
    }, []);

    const isSuperAdmin = () => {
        const code = user?.role?.code || user?.role?.name || "";
        return code === 'SUPER_ADMIN';
    };

    const hasPermission = (module) => {
        if (!user?.role?.permissions) return false;
        return user.role.permissions.some(p => p.module === module);
    };

    const visibleItems = NAV_ITEMS.filter(item => {
        if (item.module === null) return true;
        if (item.module === '__SUPER__') return isSuperAdmin();
        return hasPermission(item.module);
    });

    const handleLogout = async () => {
        const res = await logoutUserAPI();
        if (res && +res.statusCode === 200) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setUser({ email: "", name: "", id: "" });
            message.success('Đăng xuất thành công');
            navigate('/');
        }
    };

    const dropdownItems = [
        { key: 'home', label: <Link to="/">🏠 Về trang chủ</Link> },
        { key: 'divider', type: 'divider' },
        { key: 'logout', label: <span onClick={handleLogout} style={{ color: '#ef4444' }}>🚪 Đăng xuất</span> },
    ];

    const sidebarWidth = collapsed ? 72 : 240;
    const currentPath = location.pathname;

    return (
        <ConfigProvider
            theme={{
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: "#4f46e5",
                    borderRadius: 12,
                    colorBgLayout: "#0f172a",
                    colorBgContainer: "rgba(255, 255, 255, 0.02)",
                    colorBorder: "rgba(255, 255, 255, 0.08)",
                    colorTextBase: "rgba(255, 255, 255, 0.85)",
                },
                components: {
                    Table: {
                        headerBg: "rgba(255,255,255,0.03)",
                        headerColor: "rgba(255,255,255,0.45)",
                        rowHoverBg: "rgba(255,255,255,0.02)",
                    },
                    Modal: {
                        contentBg: "#1e1b4b",
                        headerBg: "#1e1b4b",
                    }
                }
            }}
        >
            <div className="admin-table-vanguard admin-form-vanguard" style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', fontFamily: "'Inter', -apple-system, sans-serif" }}>

            {/* ── SIDEBAR ── */}
            <aside style={{
                width: sidebarWidth, flexShrink: 0,
                background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column',
                transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
                position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
                overflow: 'hidden',
            }}>
                {/* Logo */}
                <div style={{
                    height: 64, display: 'flex', alignItems: 'center',
                    padding: collapsed ? '0 16px' : '0 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    gap: 12, cursor: 'pointer', flexShrink: 0,
                }} onClick={() => setCollapsed(c => !c)}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                    }}>⚡</div>
                    {!collapsed && (
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>JobHunter</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin Panel</div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
                    {!collapsed && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: 8, marginBottom: 8 }}>
                            MENU
                        </div>
                    )}
                    {visibleItems.map(item => {
                        const isActive = currentPath === item.key || (item.key !== '/admin' && currentPath.startsWith(item.key));
                        return (
                            <Link key={item.key} to={item.key} style={{ textDecoration: 'none', display: 'block', marginBottom: 4 }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: collapsed ? '10px 0' : '10px 12px',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    borderRadius: 10,
                                    background: isActive
                                        ? 'linear-gradient(to right, rgba(79,70,229,0.2), rgba(124,58,237,0.1))'
                                        : 'transparent',
                                    border: isActive ? '1px solid rgba(79,70,229,0.25)' : '1px solid transparent',
                                    color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                                    transition: 'all 0.15s',
                                    position: 'relative',
                                }}>
                                    {isActive && (
                                        <div style={{
                                            position: 'absolute', left: 0, top: '20%', bottom: '20%',
                                            width: 3, borderRadius: '0 4px 4px 0',
                                            background: 'linear-gradient(to bottom, #4f46e5, #7c3aed)'
                                        }} />
                                    )}
                                    <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
                                    {!collapsed && (
                                        <span style={{ fontSize: 14, fontWeight: isActive ? 700 : 500, lineHeight: 1 }}>
                                            {item.label}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom user info */}
                <div style={{
                    padding: collapsed ? '12px 10px' : '14px 16px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                }}>
                    <Avatar size={32} style={{ background: 'linear-gradient(135deg, #4f46e5, #a855f7)', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {user?.name?.substring(0, 1)?.toUpperCase()}
                    </Avatar>
                    {!collapsed && (
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                        </div>
                    )}
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: sidebarWidth, transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)', minHeight: '100vh' }}>

                {/* Topbar */}
                <header style={{
                    height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 24px', background: 'rgba(15,23,42,0.8)',
                    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    position: 'sticky', top: 0, zIndex: 40,
                }}>
                    {/* Breadcrumb / page title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                            onClick={() => setCollapsed(c => !c)}
                            style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {collapsed ? '→' : '←'}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Admin</span>
                            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
                            <span style={{ color: '#a5b4fc', fontSize: 14, fontWeight: 600 }}>
                                {visibleItems.find(i => i.key === currentPath || (i.key !== '/admin' && currentPath.startsWith(i.key)))?.label || 'Dashboard'}
                            </span>
                        </div>
                    </div>

                    {/* Right actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Link to="/" style={{
                            padding: '7px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                            color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                            border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
                            transition: 'all 0.2s',
                        }}>🏠 Trang chủ</Link>

                        <Dropdown menu={{ items: dropdownItems }} trigger={['click']} placement="bottomRight">
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer',
                                padding: '6px 12px 6px 6px', borderRadius: 10,
                                border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
                                transition: 'all 0.2s',
                            }}>
                                <Badge dot color="#22c55e" offset={[-2, 2]}>
                                    <Avatar size={28} style={{ background: 'linear-gradient(135deg, #4f46e5, #a855f7)', fontWeight: 700, fontSize: 12 }}>
                                        {user?.name?.substring(0, 1)?.toUpperCase()}
                                    </Avatar>
                                </Badge>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{user?.name}</span>
                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>▾</span>
                            </div>
                        </Dropdown>
                    </div>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, padding: '28px 28px', background: '#0f172a', position: 'relative' }}>
                    {/* Ambient background glow */}
                    <div style={{ position: 'fixed', top: '10%', right: '5%', width: '35%', height: '40%', background: 'radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <Outlet />
                    </div>
                </main>
            </div>
            </div>
        </ConfigProvider>
    );
};

export default LayoutAdmin;
