import React, { useEffect, useState, useMemo, useContext } from "react";
import { getCompanyLogoUrl } from "../../utils/logoHelper";
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
  message,
  notification,
  Spin
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
import "dayjs/locale/vi";
import ApplyModal from "../../components/client/modal/apply.modal";
import { callFetchJobById, callFetchResumeByUser } from "../../services/api.service";
import { getLocationLabel } from "../../config/utils";
import styles from "../../styles/client.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { callSaveJob, callUnsaveByJobId, callIsSavedJob } from "../../services/api.service";
import { AuthContext } from "../../components/context/auth.context";

dayjs.extend(relativeTime);
dayjs.locale("vi");
const { Title, Text } = Typography;

const metaItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "var(--color-text-secondary)",
};

const pill = (text, bgMode = "geekblue") => {
  const isGreen = bgMode === 'green';
  const isVol = bgMode === 'volcano';
  const cText = isGreen ? '#166534' : isVol ? '#991b1b' : 'var(--color-text)';
  const cBg = isGreen ? '#dcfce7' : isVol ? '#fee2e2' : 'var(--color-bg-soft)';
  const cBd = isGreen ? '#bbf7d0' : isVol ? '#fecaca' : 'var(--card-border)';
  return (
    <Tag style={{ borderRadius: 6, padding: "2px 10px", margin: 0, background: cBg, color: cText, border: `1px solid ${cBd}`, fontWeight: 500 }}>
      {text}
    </Tag>
  );
};

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
const [isApplied, setIsApplied] = useState(false);
const [isCheckingApplied, setIsCheckingApplied] = useState(false);
  const backend = import.meta.env.VITE_BACKEND_URL;

  const checkSaved = async () => {
    if (!id || !user?.id) return;
    try {
      const res = await callIsSavedJob(+id);
      const saved = !!(res?.data && (res.data.saved === true));
      setIsSaved(saved);
    } catch (e) {
      console.error("Error checking saved state:", e);
    }
  };

  const checkAppliedStatus = async () => {
    if (!id || !user?.id) {
        setIsApplied(false);
        return;
    }
    try {
        setIsCheckingApplied(true);
        const res = await callFetchResumeByUser();
        if (res && res.data) {
            const list = res.data.result || [];
            // Kiểm tra xem jobId hiện tại có trong danh sách đã ứng tuyển không
            const found = list.find(item => String(item?.job?.id) === String(id));
            setIsApplied(!!found);
        }
    } catch (e) {
        console.error("Error checking applied status:", e);
    } finally {
        setIsCheckingApplied(false);
    }
  };

  useEffect(() => {
    checkSaved();
    checkAppliedStatus();
  }, [id, user?.id]);

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

  const refetchJobDetail = async () => {
    try {
      const res = await callFetchJobById(id);
      const data = res?.data ?? res;
      if (data?.id) setJobDetail(data);
      await checkAppliedStatus(); // Cập nhật cả trạng thái đã ứng tuyển
    } catch (e) {
      console.error("Refetch job detail error:", e);
    }
  };

  const salaryText = useMemo(() => {
    const fmt = (n) => {
      const num = Number(n || 0);
      if (num >= 1000000) {
        return `${(num / 1000000).toLocaleString('en-US')} triệu`;
      }
      return `${num.toLocaleString('en-US')} đ`;
    };
    const min = jobDetail?.salaryMin;
    const max = jobDetail?.salaryMax;
    if ((min == null && max == null) || (min === 0 && max === 0)) return 'Thoả thuận';
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
    if (!t) return "Cập nhật hôm nay";
    const d = parseDate(t);
    return d.isValid() ? `Cập nhật ${d.fromNow()}` : "Cập nhật hôm nay";
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
    return getCompanyLogoUrl(logo);
  }, [jobDetail]);

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
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
      {/* Header actions */}
      <div
        style={{ paddingTop: 100, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: 'center' }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          type="text"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
        <Space>
          <div 
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, 
              padding: '4px 16px', border: '1px solid var(--color-border)', 
              borderRadius: 12, background: 'var(--color-bg)',
              cursor: 'pointer',
              height: 40
            }}
            onClick={() => !saving && toggleSave()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, position: 'relative' }}>
              {saving ? (
                <Spin size="small" />
              ) : isSaved ? (
                <HeartFilled style={{ color: '#f43f5e', fontSize: 20 }} />
              ) : (
                <HeartOutlined style={{ fontSize: 20, color: 'var(--color-text-secondary)' }} />
              )}
            </div>
            <Text strong style={{ minWidth: 60, lineHeight: '24px' }}>{isSaved ? "Đã lưu" : "Lưu tin"}</Text>
          </div>
          <Tooltip title="Chia sẻ">
            <Button icon={<ShareAltOutlined />} onClick={handleShare} />
          </Tooltip>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* LEFT: Job detail */}
        <Col xs={24} md={16}>
          <Card
            bodyStyle={{ padding: 40 }}
            style={{ borderRadius: 24, border: "var(--card-border)", boxShadow: "var(--shadow-xl)", background: "var(--color-bg)" }}
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
                    size="large"
                    type="primary"
                    onClick={() => setIsModalOpen(true)}
                    disabled={isApplied || isCheckingApplied}
                    loading={isCheckingApplied}
                    style={{
                      height: 50,
                      padding: "0 32px",
                      borderRadius: 12,
                      fontWeight: 600,
                      fontSize: 16,
                      background: isApplied 
                        ? "rgba(100, 116, 139, 0.1)" 
                        : "linear-gradient(to right, #4f46e5, #6366f1)",
                      border: isApplied ? "1px solid rgba(255,255,255,0.1)" : "none",
                      boxShadow: isApplied ? "none" : "0 4px 14px rgba(79, 70, 229, 0.4)",
                      color: isApplied ? "var(--color-text-secondary)" : "#fff"
                    }}
                  >
                    {isApplied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
                  </Button>
                </div>

                <div style={{ marginTop: 32, marginBottom: 32, padding: "20px 24px", background: "var(--color-bg-soft)", borderRadius: 16, border: "var(--card-border)" }}>
                  <Space size="large" wrap >
                    <div style={metaItemStyle}>
                      <DollarOutlined style={{ color: '#10b981', fontSize: 20 }} />
                      <Text strong style={{ fontSize: 18, color: '#10b981' }}>{salaryText}</Text>
                    </div>
                    <div style={metaItemStyle}>
                      <EnvironmentOutlined style={{ fontSize: 18 }} />
                      <Text style={{ fontSize: 16 }}>{getLocationLabel(jobDetail?.location)}</Text>
                    </div>
                    <div style={metaItemStyle}>
                      <CalendarOutlined />
                      <Text>{recruitmentText}</Text>
                    </div>
                    <div style={metaItemStyle}>
                      <HistoryOutlined />
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
                <div style={{ color: "var(--color-text)" }}>
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
          <div style={{ position: "sticky", top: 24 }}>
            <Card
              bodyStyle={{ padding: 32, textAlign: "center" }}
              style={{ borderRadius: 24, border: "var(--card-border)", boxShadow: "var(--shadow-lg)", background: "var(--color-bg)" }}
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
                    background: "var(--color-bg-soft)",
                    borderRadius: 16,
                    border: "var(--card-border)",
                    marginBottom: 20,
                    overflow: "hidden",
                    padding: 8
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
                <Button 
                    block 
                    onClick={() => setIsModalOpen(true)} 
                    type="primary" 
                    disabled={isApplied || !!jobDetail?.applied || isCheckingApplied}
                    loading={isCheckingApplied}
                    style={{ borderRadius: 8 }}
                >
                  {isApplied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
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
        onAppliedSuccess={refetchJobDetail}
      />

    </div>
  );
};

export default ClientJobDetailPage;
