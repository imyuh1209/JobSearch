import {
  FacebookFilled,
  GithubOutlined,
  LinkedinFilled,
  MailOutlined,
  PhoneFilled,
  UpOutlined,
} from "@ant-design/icons";
import { FloatButton, Col, Divider, Row, Space, Typography } from "antd";

const { Title, Paragraph, Link: AntLink, Text } = Typography;

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#0b1220", color: "#d7dde8", marginTop: 40 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 16px" }}>
        <Row gutter={[24, 24]} align="top" justify="space-between">
          {/* Brand */}
          <Col xs={24} sm={12} md={10} lg={8}>
            <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
              JobHunter
            </Title>
            <Paragraph style={{ color: "#a7b0c3", marginTop: 8 }}>
              Kết nối ứng viên & nhà tuyển dụng nhanh chóng, tiện lợi và hiệu quả.
            </Paragraph>
          </Col>

          {/* Quick links */}
          <Col xs={12} sm={6} md={7} lg={6}>
            <Title level={5} style={{ color: "#ffffff", marginBottom: 12 }}>
              Liên kết
            </Title>
            <Space direction="vertical" size={8}>
              <AntLink href="/" style={{ color: "#a7b0c3" }}>
                Trang chủ
              </AntLink>
              <AntLink href="/job" style={{ color: "#a7b0c3" }}>
                Công việc
              </AntLink>
              <AntLink href="/company" style={{ color: "#a7b0c3" }}>
                Công ty
              </AntLink>
            </Space>
          </Col>

          {/* Contact */}
          <Col xs={12} sm={6} md={7} lg={6}>
            <Title level={5} style={{ color: "#ffffff", marginBottom: 12 }}>
              Liên hệ
            </Title>
            <Space direction="vertical" size={8} style={{ color: "#a7b0c3" }}>
              <span>
                <MailOutlined /> huy12904@gmail.com
              </span>
              <span>
                <PhoneFilled /> 0774477782
              </span>
            </Space>
          </Col>
        </Row>

        <Divider style={{ borderColor: "#1f2a44", margin: "24px 0" }} />

        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Text style={{ color: "#7f8aa3" }}>
              © {year} JobHunter. All rights reserved.
            </Text>
          </Col>
          <Col xs={24} md="auto">
            <Space size="small" wrap>
              <AntLink href="/privacy" style={{ color: "#a7b0c3" }}>
                Privacy
              </AntLink>
              <span style={{ color: "#1f2a44" }}>|</span>
              <AntLink href="/terms" style={{ color: "#a7b0c3" }}>
                Terms
              </AntLink>
              <span style={{ color: "#1f2a44" }}>|</span>
              <AntLink href="/about" style={{ color: "#a7b0c3" }}>
                About
              </AntLink>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Back to top */}
      <FloatButton.BackTop
        icon={<UpOutlined />}
        type="primary"
        shape="circle"
        tooltip="Back to top"
        style={{ right: 24, bottom: 24 }}
      />
    </footer>
  );
};

export default Footer;
