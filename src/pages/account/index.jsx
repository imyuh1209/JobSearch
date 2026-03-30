import React from 'react';
import { Tabs, Card } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { UserUpdateInfo, UserResume, JobByEmail, ChangePassword } from '../../components/client/modal/manage.account';

const AccountPage = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'profile';
  const items = [
    { key: 'profile', label: 'Thông tin cá nhân', children: <UserUpdateInfo /> },
    { key: 'resume', label: 'Lịch sử ứng tuyển', children: <UserResume /> },
    { key: 'change-password', label: 'Đổi mật khẩu', children: <ChangePassword /> },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
      <div style={{ paddingTop: 120, paddingBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.15)', borderRadius: 9999, padding: '4px 14px', marginBottom: 16 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f46e5', display: 'inline-block' }}></span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#4f46e5', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Tài khoản cá nhân</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 10px', letterSpacing: '-0.03em' }}>Quản Lý Tài Khoản</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, margin: 0 }}>Cập nhật thông tin, xem lịch sử ứng tuyển và quản lý hồ sơ của bạn.</p>
      </div>
      <div style={{ background: 'var(--card-bg)', borderRadius: 24, padding: '32px 36px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', marginBottom: 60 }}>
        <Tabs defaultActiveKey={tab} items={items} size="large" />
      </div>
    </div>
  );
};

export default AccountPage;