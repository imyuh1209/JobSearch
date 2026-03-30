import {
  AliwangwangOutlined,
  BankOutlined,
  FileTextOutlined,
  HomeOutlined,
  LoginOutlined,
  SearchOutlined,
  UserAddOutlined,
  BulbOutlined,
  BellOutlined, // <-- Thêm icon chuông
} from "@ant-design/icons";
import { Input, Menu, notification, Dropdown, Space, Button, Avatar, Badge, Popover, List, Typography, Empty } from "antd";
import { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth.context";
import { logoutUserAPI, getMyNotificationsAPI, countUnreadNotificationsAPI, markNotificationAsReadAPI } from "../../../services/api.service";
import ManageAccount from "../modal/manage.account";
import { fetchAllCompanyAPI } from "../../../services/api.service";
import { buildQuery } from "../../../config/utils";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Search } = Input;

const Header = ({ isDarkTheme, onToggleTheme }) => {
  const { user, setUser } = useContext(AuthContext);

  // --- LOGIC THÔNG BÁO ---
  const [notifyList, setNotifyList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openNotify, setOpenNotify] = useState(false);

  // Lấy số lượng tin chưa đọc khi load trang
  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
    }
  }, [user?.id]);

  const fetchUnreadCount = async () => {
    const res = await countUnreadNotificationsAPI();
    if (res && res.data) {
      setUnreadCount(res.data);
    }
  };

  const handleOpenChange = async (newOpen) => {
    setOpenNotify(newOpen);
    if (newOpen) {
      // Khi mở, load danh sách thông báo (ví dụ lấy 10 tin mới nhất)
      const query = buildQuery(1, 10, {}, { sort: 'createdAt,desc' });
      const res = await getMyNotificationsAPI(query);
      if (res && res.data && res.data.result) {
        setNotifyList(res.data.result);
      }
    }
  };

  const handleReadNotification = async (item) => {
    if (!item.read) {
      await markNotificationAsReadAPI(item.id);
      // Cập nhật state local
      setNotifyList(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    // Điều hướng nếu là thông báo ứng tuyển
    if (item.title?.includes("Hồ sơ")) {
      navigate("/account?tab=resume");
      setOpenNotify(false);
    }
  };

  const contentNotification = (
    <div style={{ width: 350, maxHeight: 400, overflowY: 'auto', padding: '4px 8px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px 0 8px', 
        borderBottom: '1px solid var(--color-border)',
        marginBottom: 8
      }}>
        <Typography.Text strong style={{ fontSize: 16 }}>Thông báo</Typography.Text>
      </div>
      {notifyList.length === 0 ? (
        <Empty description="Không có thông báo nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notifyList}
          renderItem={(item) => (
            <List.Item
              style={{
                cursor: 'pointer',
                background: item.read ? 'transparent' : 'var(--color-primary-soft)',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '6px',
                border: item.read ? '1px solid transparent' : '1px solid var(--color-primary-border)',
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleReadNotification(item)}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       {!item.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }} />}
                       <Typography.Text strong style={{ fontSize: 13, color: 'var(--color-text)' }}>{item.title}</Typography.Text>
                    </div>
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {dayjs(item.createdAt).fromNow()}
                    </Typography.Text>
                  </div>
                }
                description={<Typography.Text type="secondary" style={{ fontSize: 12 }}>{item.message}</Typography.Text>}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
  const [current, setCurrent] = useState("home");
  const [keyword, setKeyword] = useState("");
  const [openMangeAccount, setOpenManageAccount] = useState(false);
  const navigate = useNavigate();

  const onClick = (e) => setCurrent(e.key);

  const handleLogout = async () => {
    try {
      const res = await logoutUserAPI();
      if (res && res.statusCode === 200) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser({ email: "", name: "", id: "" });
        notification.success({ message: "Đăng xuất thành công!" });
        navigate("/");
      } else {
        notification.error({ message: "Đăng xuất thất bại!" });
      }
    } catch (error) {
      console.error("Error during logout:", error);
      notification.error({ message: "Có lỗi xảy ra khi đăng xuất!" });
    }
  };

  // Main navigation items (left)
  const items = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <NavLink to="/">Trang chủ</NavLink>,
    },
    // {
    //   key: "company",
    //   icon: <BankOutlined />,
    //   label: <NavLink to="/company">Công ty</NavLink>,
    // },
    {
      key: "job",
      icon: <FileTextOutlined />,
      label: <NavLink to="/job">Việc làm</NavLink>,
    },
  ];

  // Auth actions (right)
  const authDropdownItems = [
    { label: <NavLink to="/account">Quản lý tài khoản</NavLink>, key: "account" },
    { label: <NavLink to="/account?tab=resume">Lịch sử ứng tuyển</NavLink>, key: "applications-history" },
    { label: <NavLink to="/job-alerts">Job Alerts</NavLink>, key: "job-alerts" },
    // Trang quản lý CV cá nhân
    ...((user?.id)
      ? [{ label: <NavLink to="/my-cv">CV cá nhân</NavLink>, key: "my-cv" }]
      : []),
    // Admin pages based on role
    ...((user?.role?.name === 'SUPER_ADMIN' || user?.role?.name === 'Công ty' || user?.role?.name === 'Company')
      ? [{ label: <NavLink to="/admin">Trang quản trị</NavLink>, key: "admin" }]
      : []),
    ...((user?.role?.name === 'Công ty' || user?.role?.name === 'Company' || user?.role?.name === 'SUPER_ADMIN')
      ? [{ label: <NavLink to="/admin/resume">Quản lý CV ứng tuyển</NavLink>, key: "admin-resume" }]
      : []),
    // Hiển thị Saved Jobs cho tất cả người dùng đã đăng nhập (bao gồm admin/company)
    ...((user?.id)
      ? [{ label: <NavLink to="/saved-jobs">Công việc đã lưu</NavLink>, key: "saved-jobs" }]
      : []),
    { label: <span onClick={handleLogout}>Đăng xuất</span>, key: "logout" },
  ];

  // Parse input: support job keyword OR company name (prefix '@' or 'company:'/'công ty:')
  const onSearchCategory = async (value) => {
    const v = (value || "").trim();
    if (!v) return;
    const lower = v.toLowerCase();
    let companyName = "";
    if (v.startsWith("@") && v.length > 1) companyName = v.slice(1).trim();
    const companyMatch = lower.match(/^\s*(company|công ty|cty)\s*:\s*(.+)$/);
    if (!companyName && companyMatch) companyName = (companyMatch[2] || "").trim();

    // If no explicit company token, do a quick check against companies API
    if (!companyName) {
      try {
        const q = buildQuery(1, 1, { name: v });
        const res = await fetchAllCompanyAPI(q);
        const total = res?.data?.meta?.total || 0;
        if (total > 0) companyName = v; // treat as company
      } catch (e) {
        // ignore and fall back to category
      }
    }

    if (companyName) navigate(`/job?company=${encodeURIComponent(companyName)}`);
    else navigate(`/job?category=${encodeURIComponent(v)}`);
    setKeyword("");
  };

  // Logo public qua Spring static mapping: /storage/**
  const logoUrl = `${import.meta.env.VITE_BACKEND_URL}/storage/logoweb.png`;

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 15,
          left: 0,
          right: 0,
          margin: "0 auto",
          width: "calc(100% - 40px)",
          maxWidth: 1200,
          zIndex: 100,
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 24,
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(15, 23, 42, 0.08)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Top bar: Logo + Search + Right Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 20px",
          }}
        >
          {/* Logo + brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={logoUrl}
                alt="JobHunter"
                style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)' }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: -0.5,
                }}
              >
                JobHunter
              </span>
            </Link>

            {/* Custom Navbar Links */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {items.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.key === 'home' ? '/' : `/${item.key}`}
                  style={({ isActive }) => ({
                    padding: '8px 16px',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    color: isActive ? '#4f46e5' : '#475569',
                    background: isActive ? '#eef2ff' : 'transparent',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  })}
                  onMouseOver={(e) => {
                    if (e.currentTarget.style.background === 'transparent') {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.color = '#0f172a';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (e.currentTarget.style.background === 'rgb(241, 245, 249)' || e.currentTarget.style.background === '#f1f5f9') {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#475569';
                    }
                  }}
                >
                  {item.icon} {item.label.props.children}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right actions: login/register or welcome dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Premium Theme Switch (Sun & Moon) */}
            <label className="theme-switch">
              <input
                type="checkbox"
                className="theme-switch__checkbox"
                checked={isDarkTheme}
                onChange={onToggleTheme}
              />
              <div className="theme-switch__container">
                <div className="theme-switch__circle-container">
                  <div className="theme-switch__sun-moon-container">
                    <div className="theme-switch__moon">
                      <div className="theme-switch__spot"></div>
                      <div className="theme-switch__spot"></div>
                      <div className="theme-switch__spot"></div>
                    </div>
                  </div>
                </div>
                <div className="theme-switch__clouds"></div>
                <div className="theme-switch__stars-container">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="currentColor">
                    <path d="M18.8221 19.7916L18.6121 20.5422C18.5414 20.7941 18.3505 20.99 18.1037 21.0638L17.3683 21.2842C17.0772 21.3715 17.0772 21.7825 17.3683 21.8696L18.1037 22.0902C18.3505 22.164 18.5414 22.3599 18.6121 22.6118L18.8221 23.3624C18.9051 23.6586 19.3174 23.6586 19.4005 23.3624L19.6105 22.6118C19.6811 22.3599 19.872 22.164 20.1188 22.0902L20.8542 21.8696C21.1453 21.7825 21.1453 21.3715 20.8542 21.2842L20.1188 21.0638C19.872 20.99 19.6811 20.7941 19.6105 20.5422L19.4005 19.7916C19.3174 19.4952 18.9051 19.4952 18.8221 19.7916Z"></path>
                    <path d="M103.111 11.2335L102.665 12.8277C102.515 13.3626 102.109 13.7788 101.585 13.9355L100.023 14.4036C99.4048 14.5889 99.4048 15.4619 100.023 15.6472L101.585 16.1153C102.109 16.272 102.515 16.6882 102.665 17.2231L103.111 18.8173C103.287 19.4463 104.163 19.4463 104.339 18.8173L104.785 17.2231C104.935 16.6882 105.341 16.272 105.865 16.1153L107.427 15.6472C108.045 15.4619 108.045 14.5889 107.427 14.4036L105.865 13.9355C105.341 13.7788 104.935 13.3626 104.785 12.8277L104.339 11.2335C104.163 10.6045 103.287 10.6045 103.111 11.2335Z"></path>
                    <path d="M54.5147 6.47146L54.1952 7.61463C54.0877 7.99815 53.7963 8.29653 53.4206 8.40889L52.3005 8.74452C51.8573 8.87742 51.8573 9.50346 52.3005 9.63636L53.4206 9.97199C53.7963 10.0843 54.0877 10.3827 54.1952 10.7662L54.5147 11.9094C54.6409 12.3604 55.2687 12.3604 55.3949 11.9094L55.7144 10.7662C55.8219 10.3827 56.1133 10.0843 56.4891 9.97199L57.6091 9.63636C58.0524 9.50346 58.0524 8.87742 57.6091 8.74452L56.4891 8.40889C56.1133 8.29653 55.8219 7.99815 55.7144 7.61463L55.3949 6.47146C55.2687 6.02039 54.6409 6.02039 54.5147 6.47146Z"></path>
                  </svg>
                </div>
              </div>
            </label>

            {!user?.id ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/login" style={{
                  padding: '8px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  color: '#475569', textDecoration: 'none', transition: 'all 0.2s',
                  border: '1px solid transparent'
                }}
                  onMouseOver={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                >
                  Đăng nhập
                </Link>
                <Link to="/register" style={{
                  padding: '9px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                  background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                  color: '#fff', textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                  transition: 'all 0.2s', display: 'inline-block'
                }}
                  onMouseOver={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseOut={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,70,229,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Popover
                  content={contentNotification}
                  trigger="click"
                  open={openNotify}
                  onOpenChange={handleOpenChange}
                  placement="bottomRight"
                >
                  <Badge count={unreadCount} overflowCount={99} size="small">
                    <button className="onoff-btn">
                      <input type="checkbox" className="onoff-btn-checkbox" />
                      <svg
                        className="onoff-btn-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18 8A6 6 0 0 0 6 8C6 11.09 4.91 12.82 4 14H20C19.09 12.82 18 11.09 18 8Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.73 21a2 2 0 0 1-3.46 0"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </Badge>
                </Popover>

                <Dropdown menu={{ items: authDropdownItems }} trigger={["click"]}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 12px', borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-bg)', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--color-bg-soft)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'var(--color-bg)'; }}
                  >
                    <Avatar
                      size={28}
                      style={{
                        background: "linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)",
                        color: "#fff", fontWeight: 700, fontSize: 12
                      }}
                    >
                      {user?.name?.substring(0, 1)?.toUpperCase()}
                    </Avatar>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name}
                    </span>
                    <span style={{ color: 'var(--color-text-tertiary)', fontSize: 12 }}>▾</span>
                  </div>
                </Dropdown>
              </div>
            )}
          </div>
        </div>

      </header>

      <ManageAccount open={openMangeAccount} onClose={setOpenManageAccount} />
    </>
  );
};

export default Header;
