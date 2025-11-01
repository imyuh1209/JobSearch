import React from 'react';
import { Tabs, Card } from 'antd';
import { UserUpdateInfo, UserResume, JobByEmail, ChangePassword } from '../../components/client/modal/manage.account';

const AccountPage = () => {
  const items = [
    { key: 'profile', label: 'Thông tin cá nhân', children: <UserUpdateInfo /> },
    { key: 'resume', label: 'Lịch sử ứng tuyển', children: <UserResume /> },
    { key: 'change-password', label: 'Đổi mật khẩu', children: <ChangePassword /> },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '24px auto', padding: '0 12px' }}>
      <Card title="Quản lý tài khoản" variant="borderless">
        <Tabs defaultActiveKey="profile" items={items} />
      </Card>
    </div>
  );
};

export default AccountPage;