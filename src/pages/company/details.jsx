import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Tag,
  Divider,
  Skeleton,
  Spin,
  Empty,
  Tooltip,
  Typography,
  Space,
  Button
} from "antd";
import { motion } from "framer-motion";
import {
  EnvironmentOutlined,
  ThunderboltOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import { marked } from "marked";
import {
  callFetchCompanyById,
  fetchJobsByCompanyAPI,
} from "../../services/api.service";
import { getLocationLabel } from "../../config/utils";
import "../../styles/ClientCompanyDetail.css";

const { Title, Paragraph, Text } = Typography;

const currency = (n) =>
  (n + "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " đ";

const ClientCompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [companyDetail, setCompanyDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [companyJobs, setCompanyJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  // -------- Fetch Company --------
  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await callFetchCompanyById(id);
        if (res?.data) setCompanyDetail(res.data);
      } catch (e) {
        console.error("Fetch company error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  // -------- Fetch Jobs of Company --------
  useEffect(() => {
    const fetchJobs = async () => {
      if (!id) return;
      setIsLoadingJobs(true);
      try {
        const res = await fetchJobsByCompanyAPI(id);
        setCompanyJobs(res?.data ?? []);
      } catch (e) {
        console.error("Fetch company jobs error:", e);
        setCompanyJobs([]);
      } finally {
        setIsLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [id]);

  const totalJobs = useMemo(() => companyJobs?.length || 0, [companyJobs]);

  const gotoJobDetail = (job) => navigate(`/job/${job.id}`);


  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '120px 20px 60px' }}>
      {/* ===== HERO ===== */}
            <div 
              style={{
                position: 'relative',
                borderRadius: 24,
                overflow: 'hidden',
                background: 'var(--card-bg)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--color-border)',
                marginBottom: 32
              }}
            >
              {/* Cover Image Placeholder */}
              <div style={{ height: 200, background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)' }}></div>
              
              <div style={{ padding: '0 32px 32px 32px', position: 'relative' }}>
                <Row gutter={[24, 24]} align="bottom" style={{ marginTop: -50 }}>
                  <Col xs={24} md={6}>
                    <div style={{
                      width: 140, height: 140, borderRadius: 24, background: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.1)', border: '4px solid var(--card-bg)', padding: 12, overflow: 'hidden'
                    }}>
                      <img
                        alt={companyDetail?.name}
                        src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${companyDetail?.logo}`}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  </Col>

                  <Col xs={24} md={18}>
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: 32, color: 'var(--color-text)' }}>
                        {companyDetail?.name}
                      </Title>
                      
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-bg-soft)', padding: '6px 16px', borderRadius: 100, fontWeight: 500 }}>
                          <EnvironmentOutlined style={{ color: '#64748b' }} />
                          <Text>{companyDetail?.address || "Đang cập nhật"}</Text>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-primary-soft)', padding: '6px 16px', borderRadius: 100, fontWeight: 600, color: 'var(--color-primary-hover)' }}>
                          <ApartmentOutlined />
                          <Text style={{ color: 'inherit' }}>{totalJobs} vị trí đang tuyển</Text>
                        </span>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </div>
            </div>

      {/* ===== DESCRIPTION ===== */}
      <div style={{ background: 'var(--card-bg)', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', marginBottom: 32 }}>
        {isLoading ? (
          <Skeleton paragraph={{ rows: 6 }} active />
        ) : (
          <>
            <Title level={3} style={{ fontWeight: 700, margin: 0 }}>
              Giới thiệu công ty
            </Title>
            <Divider style={{ margin: '20px 0' }} />
            <div className="company-desc__content" style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--color-text-secondary)' }}>
              {companyDetail?.description ? (
                /<\/?[a-z][\s\S]*>/i.test(companyDetail.description)
                  ? parse(DOMPurify.sanitize(companyDetail.description))
                  : parse(
                      DOMPurify.sanitize(
                        marked.parse(companyDetail.description, { breaks: true, gfm: true })
                      )
                    )
              ) : (
                <Text type="secondary">Đang cập nhật...</Text>
              )}
            </div>
          </>
        )}
      </div>

      {/* ===== JOBS ===== */}
      <div className="company-jobs">
        <div className="company-jobs__header">
          <Title level={4} className="section-title">
            Các vị trí đang tuyển
          </Title>
          <Text type="secondary">{totalJobs} công việc</Text>
        </div>
        <Divider className="section-divider" />

        <Spin spinning={isLoadingJobs}>
          {(!isLoadingJobs && totalJobs === 0) ? (
            <Empty description="Hiện chưa có vị trí tuyển dụng" />
          ) : (
            <Row gutter={[20, 20]}>
              {companyJobs.map((job) => (
                <Col xs={24} md={12} lg={12} key={job.id}>
                  <motion.div
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      style={{ height: "100%" }}
                  >
                      <div
                          onClick={() => gotoJobDetail(job)}
                          style={{
                              background: 'var(--card-bg)',
                              borderRadius: 16,
                              padding: 24,
                              height: '100%',
                              cursor: 'pointer',
                              position: 'relative',
                              border: '1px solid var(--color-border)',
                              boxShadow: 'var(--shadow-sm)',
                              transition: 'all 0.3s ease',
                              display: 'flex',
                              flexDirection: 'column',
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; e.currentTarget.style.borderColor = 'var(--color-primary-soft)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                      >
                          <div style={{ display: 'flex', gap: 20, flex: 1 }}>
                              {/* Logo Box */}
                              <div style={{
                                  width: 72, height: 72, borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 8
                              }}>
                                  <img
                                      alt={job?.company?.name}
                                      src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${job?.company?.logo}`}
                                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                  />
                              </div>

                              {/* Content info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                  <h3 style={{
                                      fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12, lineHeight: 1.4,
                                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                  }}>
                                      {job.name}
                                  </h3>

                                  {/* Tags */}
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                                      {!!job.level && (
                                          <span style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary-hover)', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
                                              {job.level}
                                          </span>
                                      )}
                                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                          <EnvironmentOutlined /> {getLocationLabel(job.location)}
                                      </span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 700, fontSize: 16 }}>
                                      <ThunderboltOutlined style={{ color: '#f59e0b' }} />
                                      {(() => {
                                          const min = job?.salaryMin;
                                          const max = job?.salaryMax;
                                          if ((min == null && max == null) || (min === 0 && max === 0)) return 'Thoả thuận';
                                          const fmt = (v) => {
                                              const num = Number(v || 0);
                                              if (num >= 1000000) return `${(num / 1000000).toLocaleString('en-US')} triệu`;
                                              return `${num.toLocaleString('en-US')} đ`;
                                          };
                                          if (min === max) return `${fmt(min)}`;
                                          return `${fmt(min)} — ${fmt(max)}`;
                                      })()}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default ClientCompanyDetailPage;
