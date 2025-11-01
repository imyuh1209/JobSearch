import React, { useContext } from 'react';
import { Button, Typography, Space, Row, Col, Tag } from 'antd';
import { ThunderboltOutlined, RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/auth.context';

const { Title, Text } = Typography;

const RecruitmentBanner = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const backend = import.meta.env.VITE_BACKEND_URL;

  const isCompany = user?.role?.name === 'Công ty' || user?.role?.name === 'Company' || user?.role?.name === 'SUPER_ADMIN';

  const handleEmployerCTA = () => {
    if (isCompany) navigate('/admin/job');
    else navigate('/register');
  };

  const handleExploreJobs = () => navigate('/job');

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #1d2938 0%, #0a6cff 100%)',
        color: '#fff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={16}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Title level={3} style={{ color: '#fff', margin: 0 }}>
              <ThunderboltOutlined /> Tìm việc nhanh – Tìm những công ty chất lượng
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
              Tìm việc nhanh chóng, quản lý CV tập trung, nâng cao hiệu quả tuyển dụng.
            </Text>
            <Space wrap>
              
              <Button size="large" shape="round" ghost onClick={handleExploreJobs}>
                Khám phá công việc
              </Button>
            </Space>
          </Space>
        </Col>
        <Col xs={0} md={8} style={{ textAlign: 'right' }}>
          <img
            alt="Campaign Banner"
            src={`${backend}/storage/banner.png`}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12, border: '2px solid rgba(255,255,255,0.6)' }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default RecruitmentBanner;