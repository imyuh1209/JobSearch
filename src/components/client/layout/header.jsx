import {
  AliwangwangOutlined,
  BankOutlined,
  FileTextOutlined,
  HomeOutlined,
  LoginOutlined,
  SearchOutlined,
  UserAddOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { Input, Menu, notification, Dropdown, Space, Button, Avatar, Badge } from "antd";
import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth.context";
import { logoutUserAPI } from "../../../services/api.service";
import ManageAccount from "../modal/manage.account";
import { fetchAllCompanyAPI } from "../../../services/api.service";
import { buildQuery } from "../../../config/utils";

const { Search } = Input;

const Header = ({ isDarkTheme, onToggleTheme }) => {
  const { user, setUser } = useContext(AuthContext);
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
      label: <NavLink to="/">Home</NavLink>,
    },
    {
      key: "company",
      icon: <BankOutlined />,
      label: <NavLink to="/company">Company</NavLink>,
    },
    {
      key: "job",
      icon: <FileTextOutlined />,
      label: <NavLink to="/job">Jobs</NavLink>,
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
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-bg)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Top bar: Logo + Search + Right Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "8px 12px",
          }}
        >
          {/* Logo + brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 180,
            }}
          >
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={logoUrl}
                alt="JobHunter"
                style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }}
                onError={(e) => {
                  // fallback nếu ảnh chưa serve được
                  e.currentTarget.style.display = "none";
                }}
              />
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  letterSpacing: 0.2,
                }}
              >
                JobHunter
              </span>
            </Link>
          </div>

          {/* Search danh mục công việc */}
          <div style={{ flex: "1 1 auto", minWidth: 240, maxWidth: 520 }}>
            <Search
              placeholder="Tìm công việc hoặc công ty (ví dụ: React, Viettel)"
              allowClear
              enterButton={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={onSearchCategory}
            />
          </div>

          {/* Right actions: login/register or welcome dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Theme toggle */}
            <Button
              type="text"
              size="large"
              shape="round"
              aria-label="Toggle dark mode"
              title={isDarkTheme ? "Tắt Dark Mode" : "Bật Dark Mode"}
              onClick={onToggleTheme}
              icon={<BulbOutlined style={{ fontSize: 18, color: isDarkTheme ? "#fadb14" : "#1677ff" }} />}
            />
            {!user?.id ? (
              <Space>
                <Link to="/login">
                  <Button
                    type="default"
                    size="large"
                    shape="round"
                    ghost
                    icon={<LoginOutlined style={{ fontSize: 18 }} />}
                    style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    type="primary"
                    size="large"
                    shape="round"
                    icon={<UserAddOutlined style={{ fontSize: 18 }} />}
                    style={{ boxShadow: "0 2px 0 rgba(5, 145, 255, 0.1)", filter: "brightness(1.05)" }}
                  >
                    Đăng ký
                  </Button>
                </Link>
              </Space>
            ) : (
              <Dropdown menu={{ items: authDropdownItems }} trigger={["click"]}>
                <Space style={{ cursor: "pointer" }}>
                  <AliwangwangOutlined style={{ fontSize: 18, color: "var(--color-primary)" }} />
                  <span>Welcome {user?.name}</span>
                  <Badge dot color="#52c41a" offset={[-2, 2]}>
                    <Avatar
                      size={28}
                      style={{
                        background: "linear-gradient(135deg, #1677ff 0%, #69c0ff 100%)",
                        color: "#fff",
                        border: "2px solid #fff",
                        boxShadow: "0 0 0 2px rgba(22, 119, 255, 0.35)",
                      }}
                    >
                      {user?.name?.substring(0, 1)?.toUpperCase()}
                    </Avatar>
                  </Badge>
                </Space>
              </Dropdown>
            )}
          </div>
        </div>

        {/* Main menu */}
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          mode="horizontal"
          items={items}
          style={{ borderBottom: "none" }}
        />
      </header>

      <ManageAccount open={openMangeAccount} onClose={setOpenManageAccount} />
    </>
  );
};

export default Header;
