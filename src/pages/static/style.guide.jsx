import React, { useEffect, useState } from "react";
import { Card, Row, Col, Space, Typography, Tag, Button, Divider } from "antd";
import { BulbOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ColorSwatch = ({ name, varName }) => (
  <Card size="small" style={{ boxShadow: 'var(--shadow-soft)' }}>
    <Space direction="vertical" style={{ width: '100%' }}>
      <div style={{ height: 40, borderRadius: 6, background: `var(${varName})` }} />
      <Text type="secondary">{name}</Text>
      <Tag>{varName}</Tag>
    </Space>
  </Card>
);

const SpacingItem = ({ size }) => (
  <Card size="small">
    <Space direction="vertical" style={{ width: '100%' }}>
      <div style={{ height: `var(--space-${size})`, background: 'var(--color-primary)', borderRadius: 999 }} />
      <Text type="secondary">space-{size}</Text>
    </Space>
  </Card>
);

export default function StyleGuidePage() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('theme-dark'));
  useEffect(() => {
    const cls = document.documentElement.classList;
    if (dark) cls.add('theme-dark'); else cls.remove('theme-dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="container" style={{ padding: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Space align="center" style={{ justifyContent: 'space-between' }}>
          <Title level={3} style={{ margin: 0 }}><BulbOutlined /> Style Guide — Design Tokens</Title>
          <Button type={dark ? 'primary' : 'default'} icon={dark ? <MoonOutlined /> : <SunOutlined />} onClick={() => setDark(v => !v)}>
            {dark ? 'Dark mode' : 'Light mode'}
          </Button>
        </Space>

        <Card title="Colors">
          <Row gutter={[12, 12]}>
            {[
              { name: 'Primary', varName: '--color-primary' },
              { name: 'Primary Hover', varName: '--color-primary-hover' },
              { name: 'Success', varName: '--color-success' },
              { name: 'Warning', varName: '--color-warning' },
              { name: 'Danger', varName: '--color-danger' },
              { name: 'Text', varName: '--color-text' },
              { name: 'Text Secondary', varName: '--color-text-secondary' },
              { name: 'Border', varName: '--color-border' },
              { name: 'Background', varName: '--color-bg' },
              { name: 'Background Soft', varName: '--color-bg-soft' },
            ].map((c) => (
              <Col xs={12} sm={8} md={6} lg={4} key={c.varName}><ColorSwatch {...c} /></Col>
            ))}
          </Row>
        </Card>

        <Card title="Spacing scale">
          <Row gutter={[12, 12]}>
            {[4,6,8,12,16,20,24,32].map((s) => (
              <Col xs={12} sm={8} md={6} lg={4} key={s}><SpacingItem size={s} /></Col>
            ))}
          </Row>
        </Card>

        <Card title="Typography">
          <Space direction="vertical" size={12}>
            <Title style={{ margin: 0 }}>Heading — 24px</Title>
            <Text style={{ fontSize: 'var(--font-size-20)' }}>H4 — size 20</Text>
            <Text style={{ fontSize: 'var(--font-size-16)' }}>Body — size 16</Text>
            <Text style={{ fontSize: 'var(--font-size-14)', color: 'var(--color-text-secondary)' }}>Caption — size 14, secondary</Text>
          </Space>
        </Card>

        <Card title="Radius & Shadow">
          <Row gutter={[12, 12]}>
            {[4,6,8].map((r) => (
              <Col xs={12} sm={8} md={6} lg={6} key={r}>
                <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: `var(--radius-${r})`, boxShadow: 'var(--shadow-soft)', padding: 16 }}>
                  <Text>radius-{r}</Text>
                </div>
              </Col>
            ))}
          </Row>
          <Divider />
          <Row gutter={[12,12]}>
            {[ 'var(--shadow-soft)', 'var(--shadow-medium)' ].map((sh) => (
              <Col xs={12} sm={8} md={6} lg={6} key={sh}>
                <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, boxShadow: sh, padding: 16 }}>
                  <Text>{sh}</Text>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      </Space>
    </div>
  );
}