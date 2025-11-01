import React from 'react';
import { Typography, Divider } from 'antd';
import styles from '../../styles/client.module.scss';

const { Title, Paragraph } = Typography;

const TermsPage = () => {
  return (
    <div className={`${styles["container"]}`} style={{ paddingTop: 24, paddingBottom: 24 }}>
      <Title level={2}>Điều khoản sử dụng</Title>
      <Paragraph>
        Khi sử dụng nền tảng JobHunter, bạn đồng ý tuân thủ các điều khoản và quy định
        của chúng tôi, nhằm đảm bảo trải nghiệm an toàn và công bằng cho tất cả người dùng.
      </Paragraph>
      <Divider />
      <Title level={4}>Trách nhiệm người dùng</Title>
      <Paragraph>
        Không đăng tải nội dung sai lệch, không spam và tuân thủ pháp luật hiện hành.
      </Paragraph>
      <Title level={4}>Giới hạn trách nhiệm</Title>
      <Paragraph>
        Chúng tôi nỗ lực cung cấp thông tin chính xác, nhưng không chịu trách nhiệm đối với
        nội dung do bên thứ ba cung cấp.
      </Paragraph>
    </div>
  );
};

export default TermsPage;