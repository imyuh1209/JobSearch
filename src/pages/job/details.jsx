import React, { useEffect, useState, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Space,
  Typography,
  Tag,
  Divider,
  Button,
  Skeleton,
  Empty,
  Tooltip,
  Alert,
  message
} from "antd";
import {
  DollarOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  ShareAltOutlined,
  StarOutlined,
  ThunderboltFilled,
  CalendarOutlined,
} from "@ant-design/icons";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import { marked } from "marked";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ApplyModal from "../../components/client/modal/apply.modal";
import { callFetchJobById } from "../../services/api.service";
import { getLocationLabel } from "../../config/utils";
import styles from "../../styles/client.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { callSaveJob, callUnsaveByJobId, callIsSavedJob } from "../../services/api.service";
import { useContext } from "react";
import { AuthContext } from "../../components/context/auth.context";
dayjs.extend(relativeTime);
const { Title, Text } = Typography;

const metaItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#667085",
};

const pill = (text, color = "blue") => (
  <Tag color={color} style={{ borderRadius: 999, padding: "2px 10px" }}>
    {text}
  </Tag>
);

const ClientJobDetailPage = () => {
  const [jobDetail, setJobDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchErr, setFetchErr] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
const { user } = useContext(AuthContext);
const [isSaved, setIsSaved] = useState(false);
const [saving, setSaving] = useState(false);
  const backend = import.meta.env.VITE_BACKEND_URL;

  const checkSaved = async () => {
    if (!id) return;
    try {
      const res = await callIsSavedJob(+id);
      const saved = !!(res?.data && (res.data.saved === true));
      setIsSaved(saved);
    } catch (e) {
      console.error("Error checking saved state:", e);
    }
  };

  useEffect(() => {
    checkSaved();
  }, [id]);

const toggleSave = async () => {
  if (!user?.id) {
    message.error("Vui lòng đăng nhập để lưu công việc");
    return;
  }
  try {
    setSaving(true);
    if (isSaved) {
      const res = await callUnsaveByJobId(+id);
      await checkSaved();
      message.success(res?.message || "Đã bỏ lưu");
    } else {
      const res = await callSaveJob(+id);
      await checkSaved();
      message.success(res?.message || "Đã lưu công việc");
    }
  } catch (e) {
    message.error(e?.response?.data?.message || e?.response?.data?.error || "Có lỗi xảy ra");
  } finally {
    setSaving(false);
  }
};
  useEffect(() => {
    const fetchJobDetail = async () => {
      if (!id) return;
      setLoading(true);
      setFetchErr("");
      try {
        const res = await callFetchJobById(id);
        const data = res?.data ?? res;
        if (data?.id) {
          setJobDetail(data);
        } else {
          setJobDetail(null);
        }
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu công việc:", error);
        setFetchErr(
          error?.response?.data?.message ||
            "Không tải được thông tin công việc. Vui lòng thử lại."
        );
        setJobDetail(null);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetail();
  }, [id]);

  const salaryText = useMemo(() => {
    const fmt = (n) => `${(Number(n || 0) + "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")} đ`;
    const min = jobDetail?.salaryMin;
    const max = jobDetail?.salaryMax;
    if (min == null && max == null) return 'Thoả thuận';
    if (min === max) return fmt(min);
    return `${fmt(min)} — ${fmt(max)}`;
  }, [jobDetail]);

  const updatedText = useMemo(() => {
    if (!jobDetail) return "";
    const parseDate = (val) => {
      if (!val) return null;
      if (typeof val === 'number') {
        return val < 1e12 ? dayjs(val * 1000) : dayjs(val);
      }
      if (typeof val === 'string') {
        const num = Number(val);
        if (!Number.isNaN(num)) {
          return num < 1e12 ? dayjs(num * 1000) : dayjs(num);
        }
      }
      return dayjs(val);
    };
    const candidates = [
      jobDetail?.updatedAt,
      jobDetail?.updated_at,
      jobDetail?.createdAt,
      jobDetail?.created_at,
      jobDetail?.publishedAt,
      jobDetail?.postedAt,
      jobDetail?.publishDate,
      jobDetail?.postedDate,
    ].filter(Boolean);
    const t = candidates[0];
    if (!t) return "";
    const d = parseDate(t);
    return d.isValid() ? d.fromNow() : "";
  }, [jobDetail]);

  // Tuyển dụng: hiển thị khoảng thời gian startDate — endDate (nếu có)
  const recruitmentText = useMemo(() => {
    if (!jobDetail) return "";
    const fmt = (val) => {
      if (!val) return null;
      if (typeof val === "number") {
        const d = val < 1e12 ? dayjs(val * 1000) : dayjs(val);
        return d.isValid() ? d.format("DD/MM/YYYY") : null;
      }
      if (typeof val === "string") {
        const num = Number(val);
        if (!Number.isNaN(num)) {
          const d = num < 1e12 ? dayjs(num * 1000) : dayjs(num);
          return d.isValid() ? d.format("DD/MM/YYYY") : null;
        }
        const d = dayjs(val);
        return d.isValid() ? d.format("DD/MM/YYYY") : null;
      }
      const d = dayjs(val);
      return d.isValid() ? d.format("DD/MM/YYYY") : null;
    };

    const startCandidates = [
      jobDetail?.startDate,
      jobDetail?.postedDate,
      jobDetail?.publishedAt,
      jobDetail?.createdAt,
    ].filter(Boolean);
    const endCandidates = [
      jobDetail?.endDate,
      jobDetail?.deadline,
      jobDetail?.closingDate,
      jobDetail?.expiredAt,
    ].filter(Boolean);

    const start = fmt(startCandidates[0]);
    const end = fmt(endCandidates[0]);
    if (start && end) return `Tuyển từ ${start} — ${end}`;
    if (start) return `Bắt đầu tuyển: ${start}`;
    return "Đang cập nhật";
  }, [jobDetail]);

  const companyLogo = useMemo(() => {
    const logo = jobDetail?.company?.logo;
    if (!logo) return null;
    return `${backend}/storage/company/${logo}`;
  }, [backend, jobDetail]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // Antd message nằm ngoài scope — dùng native:
      alert("Đã sao chép link!");
    } catch {
      alert("Không sao chép được link, thử lại sau.");
    }
  };

  return (
    <div className={`${styles["container"]}`}>
      {/* Header actions */}
      <div
        className="section-header"
        style={{ marginBottom: 12, display: "flex", justifyContent: "space-between" }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          type="text"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
        <Space>
          <Tooltip title="Chia sẻ">
            <Button icon={<ShareAltOutlined />} onClick={handleShare} />
          </Tooltip>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* LEFT: Job detail */}
        <Col xs={24} md={16}>
          <Card
            bodyStyle={{ padding: 20 }}
            style={{ borderRadius: 12, boxShadow: "0 4px 24px rgba(18,38,63,0.06)" }}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : fetchErr ? (
              <Alert type="error" message={fetchErr} showIcon />
            ) : !jobDetail ? (
              <Empty description="Không tìm thấy công việc" />
            ) : (
              <>
                {/* Title + Level/Active */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <Title level={3} style={{ marginBottom: 6 }}>
                      {jobDetail?.name}
                    </Title>
                    <Space wrap size={[8, 8]}>
                      {jobDetail?.level && pill(jobDetail.level, "geekblue")}
                      {jobDetail?.active
                        ? pill("Đang tuyển", "green")
                        : pill("Tạm dừng", "volcano")}
                    </Space>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    icon={<ThunderboltFilled />}
                    onClick={() => setIsModalOpen(true)}
                  >
                    Ứng tuyển ngay
                  </Button>
                </div>

                {/* Meta row */}
                <div style={{ marginTop: 14 }}>
                  <Space size="large" wrap>
                    <div style={metaItemStyle}>
                      <DollarOutlined />
                      <Text strong>{salaryText}</Text>
                    </div>
                    <div style={metaItemStyle}>
                      <EnvironmentOutlined style={{ color: "#58aaab" }} />
                      <Text>{getLocationLabel(jobDetail?.location)}</Text>
                    </div>
                    <div style={metaItemStyle}>
                      <CalendarOutlined />
                      <Text>{recruitmentText}</Text>
                    </div>
                    <div style={metaItemStyle}>
                      <Text>{updatedText}</Text>
                    </div>
                  </Space>
                </div>

                {/* Skills */}
                {Array.isArray(jobDetail?.skills) && jobDetail.skills.length > 0 && (
                  <>
                    <Divider />
                    <Space wrap size={[8, 8]}>
                      {jobDetail.skills.map((s) => (
                        <Tag key={s.id || s.name} color="gold">
                          {s.name}
                        </Tag>
                      ))}
                    </Space>
                  </>
                )}

                {/* Description */}
                <Divider />
                <div style={{ color: "#1f2430" }}>
                  {/* Giữ xuống dòng khi mô tả là text thường; nếu có HTML thì parse */}
                  {jobDetail?.description ? (
                    /<\/?[a-z][\s\S]*>/i.test(jobDetail.description)
                      ? parse(DOMPurify.sanitize(jobDetail.description))
                      : parse(
                          DOMPurify.sanitize(
                            marked.parse(jobDetail.description, { breaks: true, gfm: true })
                          )
                        )
                  ) : (
                    <Text type="secondary">Chưa có mô tả cho công việc này.</Text>
                  )}
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* RIGHT: Company sticky card */}
        <Col xs={24} md={8}>
          <div style={{ position: "sticky", top: 16 }}>
            <Card
              bodyStyle={{ padding: 20, textAlign: "center" }}
              style={{ borderRadius: 12, boxShadow: "0 4px 24px rgba(18,38,63,0.06)" }}
            >
              {loading ? (
                <Skeleton.Avatar active shape="square" size={120} />
              ) : companyLogo ? (
                <div
                  style={{
                    height: 140,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fafafa",
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    marginBottom: 12,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={companyLogo}
                    alt={jobDetail?.company?.name}
                    style={{ maxWidth: 180, maxHeight: 100, objectFit: "contain" }}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/200x120.png?text=Company";
                    }}
                  />
                </div>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có logo" />
              )}

              {!loading && jobDetail?.company?.name && (
                <>
                  <Title level={5} style={{ marginBottom: 6 }}>
                    {jobDetail.company.name}
                  </Title>
                  <Text type="secondary">Nhà tuyển dụng</Text>
                </>
              )}
              <Divider />
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button block onClick={() => setIsModalOpen(true)} type="primary">
                  Ứng tuyển ngay
                </Button>
                <Button block href={`/company/${jobDetail?.company?.id}`}>
                  Xem trang công ty
                </Button>
              </Space>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Apply Modal */}
      <ApplyModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        jobDetail={jobDetail}
      />

  <Button
  type="text"
  onClick={toggleSave}
  icon={isSaved ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
  loading={saving}
  disabled={saving}
>
  {isSaved ? "Đã lưu" : "Lưu job"}
</Button>
    </div>
    
  );
};

export default ClientJobDetailPage;
