import React, { useContext, useState, useEffect } from 'react';
import { Layout, Menu, Button, message, Dropdown, Space, Avatar } from 'antd';
import { Outlet, Link, useNavigate } from "react-router-dom";
import { MenuFoldOutlined, MenuUnfoldOutlined, BugOutlined, AppstoreOutlined, UserOutlined, ScheduleOutlined, AliwangwangOutlined, ApiOutlined, ExceptionOutlined, BankOutlined, PictureOutlined } from '@ant-design/icons';
import { logoutUserAPI, getAccount } from '../../services/api.service';
import { AuthContext } from '../context/auth.context';

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchAccount = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setUser({
                    email: "",
                    name: "",
                    id: ""
                });
                navigate('/login');
                return;
            }

            try {
                const res = await getAccount();
                if (res.data) {
                    setUser(res.data.user);
                }
            } catch (error) {
                console.error("Error fetching account:", error);
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("access_token");
                    setUser({
                        email: "",
                        name: "",
                        id: ""
                    });
                    navigate('/login');
                }
            }
        };

        fetchAccount();
    }, []);

    const hasPermission = (module) => {
        console.log('Checking permission for module:', module);
        console.log('Current user:', user);
        console.log('User role:', user?.role);
        console.log('User permissions:', user?.role?.permissions);

        if (!user || !user.role || !user.role.permissions) {
            console.log('No user, role or permissions found');
            return false;
        }

        // Kiểm tra xem có permission nào có module trùng với module được truyền vào không
        const hasModulePermission = user.role.permissions.some(permission => {
            console.log('Checking permission:', permission);
            return permission.module === module;
        });

        console.log('Has permission:', hasModulePermission);
        return hasModulePermission;
    };

    const isSuperAdmin = () => {
        const roleCode = user?.role?.code || user?.role?.name || "";
        return roleCode === 'SUPER_ADMIN';
    }

    const menuItems = [
        {
            label: <Link to='/admin'>Dashboard</Link>,
            key: '/admin',
            icon: <AppstoreOutlined />,
            show: true // Dashboard luôn hiển thị
        },
        {
            label: <Link to='/admin/company'>Company</Link>,
            key: '/admin/company',
            icon: <BankOutlined />,
            show: hasPermission('COMPANIES')
        },
        {
            label: <Link to='/admin/user'>User</Link>,
            key: '/admin/user',
            icon: <UserOutlined />,
            show: hasPermission('USERS')
        },
        {
            label: <Link to='/admin/job'>Job</Link>,
            key: '/admin/job',
            icon: <ScheduleOutlined />,
            show: hasPermission('JOBS')
        },
        {
            label: <Link to='/admin/resume'>Resume</Link>,
            key: '/admin/resume',
            icon: <AliwangwangOutlined />,
            show: hasPermission('RESUMES')
        },
        {
            label: <Link to='/admin/permission'>Permission</Link>,
            key: '/admin/permission',
            icon: <ApiOutlined />,
            show: hasPermission('PERMISSIONS')
        },
        {
            label: <Link to='/admin/role'>Role</Link>,
            key: '/admin/role',
            icon: <ExceptionOutlined />,
            show: hasPermission('ROLES')
        },
        {
            label: <Link to='/admin/banner'>Banner</Link>,
            key: '/admin/banner',
            icon: <PictureOutlined />,
            show: isSuperAdmin()
        },
    ].filter(item => item.show);

    const handleLogout = async () => {
        const res = await logoutUserAPI();
        if (res && +res.statusCode === 200) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setUser({
                email: "",
                name: "",
                id: ""
            });
            message.success('Đăng xuất thành công');
            navigate('/');
        }
    };

    const itemsDropdown = [
        { label: <Link to={'/'}>Trang chủ</Link>, key: 'home' },
        { label: <label style={{ cursor: 'pointer' }} onClick={() => handleLogout()}>Đăng xuất</label>, key: 'logout' },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider theme='light' collapsible collapsed={collapsed} onCollapse={setCollapsed}>
                <div style={{ height: 32, margin: 16, textAlign: 'center' }}>
                    <BugOutlined /> ADMIN
                </div>
                <Menu mode="inline" items={menuItems} />
            </Sider>
            <Layout>
                <div style={{ display: "flex", justifyContent: "space-between", padding: 10 }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                    />
                    <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                        <Space style={{ cursor: "pointer" }}>
                            Welcome {user?.name}
                            <Avatar> {user?.name?.substring(0, 2)?.toUpperCase()} </Avatar>
                        </Space>
                    </Dropdown>
                </div>
                <Content style={{ padding: '15px' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default LayoutAdmin;
