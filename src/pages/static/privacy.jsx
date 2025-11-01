import React from 'react';
import { Typography, Divider } from 'antd';
import styles from '../../styles/client.module.scss';

const { Title, Paragraph, Text } = Typography;

const PrivacyPage = () => {
  return (
    <div className={`${styles["container"]}`} style={{ paddingTop: 24, paddingBottom: 24 }}>
      <Title level={2}>Chính sách bảo mật</Title>
      <Paragraph>
        Chúng tôi tôn trọng và bảo vệ quyền riêng tư của người dùng. Tất cả dữ liệu cá nhân
        đều được thu thập, sử dụng và lưu trữ theo quy định pháp luật hiện hành.
      </Paragraph>
      <Divider />
      <Title level={4}>Dữ liệu chúng tôi thu thập</Title>
      <Paragraph>
        Bao gồm thông tin tài khoản, hồ sơ ứng tuyển (CV), lịch sử tương tác và các cài đặt
        liên quan tới trải nghiệm người dùng.
      </Paragraph>
      <Title level={4}>Cách chúng tôi sử dụng dữ liệu</Title>
      <Paragraph>
        Dữ liệu được dùng để cung cấp dịch vụ tìm việc, kết nối ứng viên với nhà tuyển dụng,
        cải thiện tính năng và bảo đảm an toàn hệ thống.
      </Paragraph>
      <Divider />
      <Text type="secondary">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</Text>
    </div>
  );
};

export default PrivacyPage;