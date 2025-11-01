import React from 'react';
import { Typography, Divider } from 'antd';
import styles from '../../styles/client.module.scss';

const { Title, Paragraph, Text } = Typography;

const AboutPage = () => {
  return (
    <div className={`${styles["container"]}`} style={{ paddingTop: 24, paddingBottom: 24 }}>
      <Title level={2}>Giới thiệu</Title>
      <Paragraph>
        JobHunter là nền tảng kết nối ứng viên và nhà tuyển dụng, giúp quá trình tuyển dụng
        và tìm việc trở nên nhanh chóng, minh bạch và hiệu quả.
      </Paragraph>
      <Divider />
      <Title level={4}>Sứ mệnh</Title>
      <Paragraph>
        Mang đến cơ hội việc làm phù hợp cho mọi người và hỗ trợ doanh nghiệp tiếp cận
        ứng viên chất lượng.
      </Paragraph>
      <Text type="secondary">Phiên bản: 1.0</Text>
    </div>
  );
};

export default AboutPage;