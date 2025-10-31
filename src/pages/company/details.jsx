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
} from "antd";
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
    <div className="company-detail-container">
      {/* ===== HERO ===== */}
            <Card className="company-hero" variant="borderless">
        {isLoading ? (
          <Skeleton active avatar paragraph={{ rows: 2 }} />
        ) : companyDetail ? (
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={6} className="company-hero__logoWrap">
              <img
                className="company-hero__logo"
                alt={companyDetail?.name}
                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${
                  companyDetail?.logo
                }`}
              />
            </Col>

            <Col xs={24} md={18}>
              <Space direction="vertical" size={4} className="w-full">
                <Title level={2} className="company-hero__title">
                  {companyDetail?.name}
                </Title>

                <div className="company-hero__meta">
                  <span className="meta-item">
                    <EnvironmentOutlined />
                    <Text>&nbsp;{companyDetail?.address || "Đang cập nhật"}</Text>
                  </span>

                  <span className="meta-item">
                    <ApartmentOutlined />
                    <Text>&nbsp;{totalJobs} vị trí đang tuyển</Text>
                  </span>
                </div>
              </Space>
            </Col>
          </Row>
        ) : (
          <Empty description="Không tìm thấy công ty" />
        )}
      </Card>

      {/* ===== DESCRIPTION ===== */}
            <Card className="company-desc" variant="borderless">
        {isLoading ? (
          <Skeleton paragraph={{ rows: 6 }} active />
        ) : (
          <>
            <Title level={4} className="section-title">
              Giới thiệu
            </Title>
            <Divider className="section-divider" />
            <div className="company-desc__content">
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
      </Card>

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
            <Row gutter={[16, 16]}>
              {companyJobs.map((job) => (
                <Col xs={24} sm={12} md={8} key={job.id}>
                  <Card
                    hoverable
                    className="job-card"
                    onClick={() => gotoJobDetail(job)}
                    cover={
                      <div className="job-card__cover">
                        <img
                          alt={job?.company?.name}
                          src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${
                            job?.company?.logo
                          }`}
                        />
                      </div>
                    }
                  >
                    <div className="job-card__body">
                      <Tooltip title={job.name}>
                        <Title level={5} className="job-card__title" ellipsis>
                          {job.name}
                        </Title>
                      </Tooltip>

                      <div className="job-card__meta">
                        <span className="meta-item">
                          <EnvironmentOutlined />
                          <Text>&nbsp;{job.location || "Toàn quốc"}</Text>
                        </span>
                        <span className="meta-item">
                          <ThunderboltOutlined style={{ color: "orange" }} />
                          <Text>&nbsp;{currency(job.salary || 0)}</Text>
                        </span>
                      </div>

                      <div className="job-card__tags">
                        {!!job.level && <Tag color="geekblue">{job.level}</Tag>}
                        {(job.skills || []).slice(0, 3).map((s) => (
                          <Tag key={s.id} color="gold">
                            {s.name}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </Card>
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
