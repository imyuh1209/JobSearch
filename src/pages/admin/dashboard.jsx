import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Space, Avatar } from 'antd';
import { Link } from 'react-router-dom';
import { UserOutlined, BankOutlined, ScheduleOutlined, FileTextOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { fetchAllUserAPI, fetchAllJobAPI, fetchAllCompanyAPI, fetchAllResumeAPI } from '../../services/api.service';

const AdminDashboard = () => {
    const [counts, setCounts] = useState({ users: 0, jobs: 0, companies: 0, resumes: 0 });
    const [recentJobs, setRecentJobs] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [users, jobs, companies, resumes, latestUsers] = await Promise.all([
                    fetchAllUserAPI('page=1&size=0'),
                    fetchAllJobAPI('page=1&size=5&sort=createdAt,desc'),
                    fetchAllCompanyAPI('page=1&size=0'),
                    fetchAllResumeAPI('page=1&size=0'),
                    fetchAllUserAPI('page=1&size=5&sort=createdAt,desc')
                ]);

                setCounts({
                    users: users.data?.meta?.total || 0,
                    jobs: jobs.data?.meta?.total || 0,
                    companies: companies.data?.meta?.total || 0,
                    resumes: resumes.data?.meta?.total || 0
                });

                setRecentJobs(jobs.data?.result || []);
                setRecentUsers(latestUsers.data?.result || []);
            } catch (error) {
                console.error("Lỗi fetch dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statItems = [
        { title: 'Tổng người dùng', value: counts.users, icon: <UserOutlined />, color: '#4f46e5', suffix: 'thành viên' },
        { title: 'Việc làm đang tuyển', value: counts.jobs, icon: <ScheduleOutlined />, color: '#10b981', suffix: 'vị trí' },
        { title: 'Công ty đối tác', value: counts.companies, icon: <BankOutlined />, color: '#0ea5e9', suffix: 'đối tác' },
        { title: 'Hồ sơ đã nhận', value: counts.resumes, icon: <FileTextOutlined />, color: '#f59e0b', suffix: 'hồ sơ' },
    ];

    const columns = [
        {
            title: 'Việc làm',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span style={{ fontWeight: 600, color: '#a5b4fc', fontSize: 13 }}>{text}</span>
        },
        {
            title: 'Công ty',
            dataIndex: 'company',
            key: 'company',
            render: (company) => <span style={{ fontSize: 13 }}>{company?.name || 'N/A'}</span>
        },
        {
            title: 'Lương (VNĐ)',
            dataIndex: 'salary',
            key: 'salary',
            render: (_ignored, item) => (
                <Tag color="cyan">
                    {item.salaryMin === item.salaryMax 
                        ? `${(item.salaryMin / 1000000).toFixed(1)}Tr` 
                        : `${(item.salaryMin / 1000000).toFixed(1)} - ${(item.salaryMax / 1000000).toFixed(1)}Tr`}
                </Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            key: 'active',
            render: (active) => (
                <Tag color={active !== false ? "processing" : "default"}>
                    {active !== false ? "Đang tuyển" : "Đã đóng"}
                </Tag>
            )
        }
    ];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .admin-stat-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 20px;
                    padding: 24px;
                    transition: all 0.3s ease;
                }
                .admin-stat-card:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(99, 102, 241, 0.3);
                    transform: translateY(-4px);
                }
            `}</style>
            
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: 0 }}>Hệ thống quản trị</h1>
                <p style={{ color: 'rgba(255,255,255,0.45)', margin: '4px 0 0' }}>Chào mừng bạn quay trở lại, đây là tổng quan tình hình hôm nay.</p>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                {statItems.map((item, i) => (
                    <Col xs={24} sm={12} lg={6} key={i}>
                        <div className="admin-stat-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12, 
                                    background: `${item.color}15`, color: item.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                                }}>
                                    {item.icon}
                                </div>
                            </div>
                            <div style={{ marginTop: 20 }}>
                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 500 }}>{item.title}</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-px' }}>
                                        {counts.jobs === 0 && item.title === 'Việc làm đang tuyển' ? "0" : item.value.toLocaleString()}
                                    </div>
                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>{item.suffix}</span>
                                </div>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            <Row gutter={[24, 24]}>
                <Col span={24} lg={16}>
                    <div className="admin-table-vanguard" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ color: '#fff', margin: 0, fontSize: 18, fontWeight: 700 }}>Việc làm mới đăng</h3>
                            <Link to="/admin/job" style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600 }}>Xem tất cả →</Link>
                        </div>
                        <Table 
                            columns={columns} 
                            dataSource={recentJobs} 
                            pagination={false} 
                            loading={isLoading}
                            rowKey="id"
                        />
                    </div>
                </Col>
                <Col span={24} lg={8}>
                    <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', borderRadius: 24, padding: 24, border: '1px solid rgba(255,255,255,0.06)', height: '100%', minHeight: 400 }}>
                        <h3 style={{ color: '#fff', marginBottom: 20, fontSize: 18, fontWeight: 700 }}>Người dùng mới</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {recentUsers.length > 0 ? (
                                recentUsers.map((u, i) => (
                                    <div key={u.id} style={{ display: 'flex', gap: 12, padding: '12px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}
                                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                    >
                                        <Avatar 
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} 
                                            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                                        >
                                            {u.name?.substring(0, 1)}
                                        </Avatar>
                                        <div>
                                            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{u.email}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>Chưa có người dùng mới</div>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
