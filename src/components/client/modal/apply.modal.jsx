import { Button, ConfigProvider, Divider, Modal, Upload, message, notification } from "antd";
import { useNavigate } from "react-router-dom";
import enUS from 'antd/lib/locale/en_US';
import { UploadOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons';
import { useEffect, useState, useContext } from 'react';
import { callCreateResume, callUploadSingleFile, listMyUploads, callFetchFile } from "../../../services/api.service";
import { AuthContext } from "../../context/auth.context";
import styles from '../../../styles/client.module.scss';

const OrbitRadio = ({ isSelected }) => (
  <div className={styles.radio_orbit}>
    <input type="radio" checked={isSelected} readOnly />
    <div className={styles.circ_container}>
      {[...Array(8)].map((_, i) => (
        <div key={i} className={styles.circle} />
      ))}
    </div>
  </div>
);

const ApplyModal = (props) => {
  const { isModalOpen, setIsModalOpen, jobDetail } = props;
  const { user } = useContext(AuthContext);
  const [urlCV, setUrlCV] = useState("");
  const [savedUploads, setSavedUploads] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUploads = async () => {
      if (!isModalOpen || !user?.id) return;
      try {
        const res = await listMyUploads();
        const list = res?.data?.result ?? [];
        setSavedUploads(Array.isArray(list) ? list : []);
      } catch {
        try {
          const raw = localStorage.getItem(`my_cvs_${user.id}`);
          setSavedUploads(raw ? JSON.parse(raw) : []);
        } catch { setSavedUploads([]); }
      }
    };
    fetchUploads();
  }, [isModalOpen, user?.id]);

  const handleViewCV = async (url, originalName) => {
    if (!url) return;
    try {
      const blob = await callFetchFile(url, "resume");
      const ext = originalName?.split('.').pop().toLowerCase();
      if (['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
        window.open(URL.createObjectURL(blob), '_blank');
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = originalName || url;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
      }
    } catch { message.error("Không thể tải file CV"); }
  };

  const handleOkButton = async () => {
    if (!urlCV) { message.error("Vui lòng chọn hoặc upload CV!"); return; }
    if (!user?.id) {
      setIsModalOpen(false);
      navigate(`/login?callback=${window.location.href}`);
    } else if (jobDetail) {
      const res = await callCreateResume(urlCV, jobDetail?.id, user.email, user.id);
      if (res.data) {
        message.success("Rải CV thành công! 🎉");
        setIsModalOpen(false);
      } else {
        notification.error({ message: 'Có lỗi xảy ra', description: res.message });
      }
    }
  };

  const propsUpload = {
    maxCount: 1, multiple: false,
    accept: "application/pdf,application/msword,.doc,.docx,.pdf",
    async customRequest({ file, onSuccess, onError }) {
      const res = await callUploadSingleFile(file, "resume");
      if (res?.data) { setUrlCV(res.data.fileName); onSuccess?.('ok'); }
      else { setUrlCV(""); onError?.({ event: new Error(res.message) }); }
    },
    onChange(info) {
      if (info.file.status === 'done') message.success(`${info.file.name} đã được tải lên`);
      else if (info.file.status === 'error') message.error(info?.file?.error?.event?.message ?? "Lỗi khi upload file.");
    },
  };

  return (
    <>
      <ConfigProvider locale={enUS}>
        <Modal
          title={
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>
              🚀 Ứng Tuyển Job
            </span>
          }
          open={isModalOpen}
          onOk={handleOkButton}
          onCancel={() => setIsModalOpen(false)}
          maskClosable={false}
          okText={user?.id ? "🎯 Rải CV Nào!" : "Đăng Nhập Nhanh"}
          okButtonProps={{
            style: {
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              border: 'none', borderRadius: 8, fontWeight: 700,
              boxShadow: '0 4px 14px rgba(79,70,229,0.4)',
            }
          }}
          cancelButtonProps={{ style: { display: "none" } }}
          destroyOnClose
          width={500}
          styles={{
            content: { borderRadius: 20, padding: 0, overflow: 'hidden', background: 'var(--color-bg, #0f172a)', border: '1px solid rgba(255,255,255,0.07)' },
            header: { padding: '20px 24px 0', background: 'transparent', borderBottom: 'none' },
            body: { padding: '16px 24px' },
            footer: { padding: '12px 24px 20px', background: 'transparent', borderTop: '1px solid rgba(255,255,255,0.06)' },
          }}
        >
          {user?.id ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Job info banner */}
              <div style={{
                padding: '12px 16px', borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(124,58,237,0.08))',
                border: '1px solid rgba(99,102,241,0.2)',
                fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-secondary, #94a3b8)'
              }}>
                Bạn đang ứng tuyển vị trí{' '}
                <span style={{ fontWeight: 700, color: '#a5b4fc' }}>{jobDetail?.name}</span>
                {' '}tại{' '}
                <span style={{ fontWeight: 700, color: '#c084fc' }}>{jobDetail?.company?.name}</span>
              </div>

              {/* Email */}
              <div>
                <span className={styles.apply_label}>Email liên hệ</span>
                <input className={styles.apply_email_box} type="email" value={user?.email} disabled />
              </div>

              {/* CV list */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className={styles.apply_label} style={{ marginBottom: 0 }}>Chọn CV đã lưu</span>
                  {urlCV && (
                    <span className={styles.cv_deselect} onClick={() => setUrlCV('')}>✕ Bỏ chọn</span>
                  )}
                </div>
                {savedUploads.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#475569', fontSize: 13 }}>
                    Bạn chưa có CV nào được lưu
                  </div>
                ) : (
                  <div className={styles.cv_card_list}>
                    {savedUploads
                      .filter(cv => cv?.fileName)
                      .map((cv) => {
                      const isSelected = urlCV === cv.fileName;
                      return (
                        <div
                          key={cv.fileName}
                          className={`${styles.cv_card}${isSelected ? ` ${styles.selected}` : ''}`}
                          onClick={() => setUrlCV(isSelected ? '' : cv.fileName)}
                        >
                          <OrbitRadio isSelected={isSelected} />
                          <div style={{ color: '#6366f1', fontSize: 20, flexShrink: 0, marginLeft: 4 }}>
                            <FileTextOutlined />
                          </div>
                          <div className={styles.cv_info}>
                            <div className={styles.cv_name}>{cv.originalName || cv.fileName}</div>
                            <div className={styles.cv_date}>
                              {cv.uploadedAt ? new Date(cv.uploadedAt).toLocaleString('vi-VN') : '—'}
                            </div>
                          </div>
                          <span
                            className={styles.cv_view_btn}
                            onClick={(e) => { e.stopPropagation(); handleViewCV(cv.fileName, cv.originalName); }}
                          >
                            <EyeOutlined /> Xem
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Upload */}
              <div>
                <Divider style={{ margin: '4px 0 14px', borderColor: 'rgba(255,255,255,0.06)' }} />
                <span className={styles.apply_label}>Hoặc upload CV mới</span>
                <Upload {...propsUpload} showUploadList={false}>
                  <div className={styles.apply_upload_btn}>
                    <UploadOutlined style={{ fontSize: 16 }} />
                    Tải lên CV của bạn (*.doc, *.docx, *.pdf — tối đa 5MB)
                  </div>
                </Upload>
              </div>

            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: 14 }}>
              Bạn chưa đăng nhập. Vui lòng <b>đăng nhập</b> để rải CV nhé!
            </div>
          )}
        </Modal>
      </ConfigProvider>
    </>
  );
};

export default ApplyModal;
