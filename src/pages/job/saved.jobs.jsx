import React, { useEffect, useState, useContext } from "react";
import { Card, Row, Col, Empty, message, Popconfirm, Button, Space, Tag } from "antd";
import { EnvironmentOutlined, ThunderboltOutlined, DeleteOutlined } from "@ant-design/icons";
import { callFetchSavedJobs, callDeleteSavedJobBySavedId } from "../../services/api.service";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../components/context/auth.context";
import { motion } from "framer-motion";

const currency = (n) => (n + "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " đ";

export default function SavedJobsPage() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const load = async () => {
    try {
      const res = await callFetchSavedJobs();
      const list = res?.data || [];
      setItems(list);
    } catch {
      message.error("Không tải được danh sách đã lưu");
    }
  };

  useEffect(() => { load(); }, []);

  if (!user?.id) {
    return <Empty description="Vui lòng đăng nhập để xem công việc đã lưu" />;
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
      <div style={{ paddingTop: 120, paddingBottom: 48, borderBottom: '1px solid var(--color-border)', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.15)', borderRadius: 9999, padding: '4px 14px', marginBottom: 16 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f46e5', display: 'inline-block' }}></span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#4f46e5', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Tài khoản</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 10px', letterSpacing: '-0.03em' }}>Công Việc Đã Lưu</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, margin: 0 }}>
          {items.length > 0 ? `Bạn đang theo dõi ${items.length} công việc` : 'Chưa có công việc nào được lưu.'}
        </p>
      </div>
      {items.length === 0 ? (
        <Empty description="Chưa có công việc nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {items.map((it) => (
            <Col xs={24} sm={12} md={8} key={it.id}>
              <motion.div
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{ height: "100%" }}
              >
                  <div
                      onClick={() => navigate(`/job/${it.jobId}`)}
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
                      {/* Delete Button */}
                      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                          <Popconfirm
                              title="Bỏ lưu công việc?"
                              onConfirm={async (e) => {
                                  e?.stopPropagation?.();
                                  const prev = items;
                                  setItems((cur) => cur.filter((x) => x.id !== it.id));
                                  try {
                                      const res = await callDeleteSavedJobBySavedId(it.id);
                                      message.success(res?.message || "Đã bỏ lưu");
                                  } catch (err) {
                                      message.error(err?.response?.data?.message || err?.response?.data?.error || "Xóa không thành công, thử lại");
                                      setItems(prev);
                                  }
                              }}
                              onCancel={(e) => e?.stopPropagation?.()}
                          >
                              <Button
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                      width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      background: '#fee2e2', color: '#ef4444', borderRadius: '50%', border: '1px solid #fca5a5'
                                  }}
                              />
                          </Popconfirm>
                      </div>

                      <div style={{ display: 'flex', gap: 20, flex: 1 }}>
                          {/* Logo Box */}
                          <div style={{
                              width: 72, height: 72, borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 8
                          }}>
                              {(() => {
                                  const backend = import.meta.env.VITE_BACKEND_URL;
                                  const isAbsolute = typeof it.companyLogo === 'string' && /^https?:\/\//.test(it.companyLogo);
                                  const src = isAbsolute ? it.companyLogo : `${backend}/storage/company/${it.companyLogo}`;
                                  return (
                                      <img
                                          alt={it.companyName}
                                          src={src}
                                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                      />
                                  );
                              })()}
                          </div>

                          {/* Content info */}
                          <div style={{ flex: 1, minWidth: 0, paddingRight: 40 }}>
                              <div style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4 }}>
                                  {it.companyName || 'Công ty ẩn danh'}
                              </div>
                              <h3 style={{
                                  fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12, lineHeight: 1.4,
                                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                              }}>
                                  {it.jobName}
                              </h3>

                              {/* Tags */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                                  {!!it.level && (
                                      <span style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary-hover)', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
                                          {it.level}
                                      </span>
                                  )}
                                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <EnvironmentOutlined /> {it.location || "Toàn quốc"}
                                  </span>
                              </div>

                              {/* Salary */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 700, fontSize: 16 }}>
                                  <ThunderboltOutlined style={{ color: '#f59e0b' }} />
                                  {(() => {
                                      const min = it.salaryMin;
                                      const max = it.salaryMax;
                                      if ((min == null && max == null) || (min === 0 && max === 0)) return 'Thoả thuận';
                                      return min === max ? currency(min) : `${currency(min)} — ${currency(max)}`;
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
      <div style={{ paddingBottom: 60 }} />
    </div>
  );
}
