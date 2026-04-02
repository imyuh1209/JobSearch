import React, { useEffect, useMemo, useState, useContext } from 'react';
import { Card, Upload, Button, Space, Table, Tag, Empty, message } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { callUploadSingleFile, callCreateResume, listMyUploads, callDeleteResume, callFetchFile } from '../../services/api.service';
import { AuthContext } from '../../components/context/auth.context';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
];
const MAX_SIZE_MB = 5;

const ManageMyCVPage = () => {
  const { user } = useContext(AuthContext);
  const storageKey = useMemo(() => (user && user.id) ? `my_cvs_${user.id}` : 'my_cvs_guest', [user]);
  const [list, setList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const load = async () => {
      // Ưu tiên lấy từ server cho thống nhất (Flutter/web)
      try {
        const res = await listMyUploads();
        const items = res?.data?.result ?? [];
        if (Array.isArray(items) && items.length >= 0) {
          setList(items);
          return;
        }
      } catch (_) {
        // fallback localStorage nếu API lỗi
      }
      try {
        const saved = localStorage.getItem(storageKey);
        setList(saved ? JSON.parse(saved) : []);
      } catch (_) {
        setList([]);
      }
    };
    load();
  }, [storageKey]);

  const persist = (next) => {
    // Giữ lại cho fallback localStorage
    setList(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch (_) {}
  };

  const beforeUpload = (file) => {
    const extOk = /\.(pdf|doc|docx|jpg|jpeg|png)$/i.test(file.name);
    const typeOk = ACCEPTED_TYPES.includes(file.type);
    if (!extOk && !typeOk) {
      message.error('Chỉ chấp nhận PDF/DOC/DOCX/JPG/PNG');
      return Upload.LIST_IGNORE;
    }
    const sizeOk = file.size / 1024 / 1024 <= MAX_SIZE_MB;
    if (!sizeOk) {
      message.error(`Kích thước tối đa ${MAX_SIZE_MB}MB`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest = async (options) => {
    const { file, onSuccess, onError, onProgress } = options;
    try {
      setUploading(true);
      setPercent(10);
      onProgress?.({ percent: 10 });
      const res = await callUploadSingleFile(file, 'resume');
      // API trả về tên file (key: fileUploadedName)
      setPercent(70);
      onProgress?.({ percent: 70 });
      const uploadedName = res?.fileUploadedName || res?.fileName || res?.data?.fileUploadedName || res?.data?.fileName;
      if (uploadedName) {
        // Tạo bản ghi resume trên server (không gắn job)
        try {
          await callCreateResume(uploadedName, undefined, user?.email, user?.id);
        } catch (e) {
          // Nếu tạo resume lỗi, vẫn lưu local để không mất hiển thị
          const item = {
            id: uploadedName,
            fileName: uploadedName,
            originalName: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            urlStorage: `/api/v1/files?folder=resume&fileName=${uploadedName}`,
          };
          const next = [item, ...list];
          persist(next);
        }
        // Sau cùng: refresh từ server
        try {
          const r2 = await listMyUploads();
          const items = r2?.data?.result ?? [];
          if (Array.isArray(items)) setList(items);
        } catch (_) {}
        setPercent(100);
        onSuccess?.(uploadedName);
        message.success('Tải CV lên thành công');
      } else {
        throw new Error('Upload thất bại');
      }
    } catch (err) {
      console.error(err);
      onError?.(err);
      message.error('Không thể tải CV lên. Vui lòng thử lại');
    } finally {
      setUploading(false);
      setPercent(0);
    }
  };

  const handleDeleteLocal = (fileName) => {
    const next = list.filter((x) => x.fileName !== fileName);
    persist(next);
    message.success('Đã gỡ khỏi danh sách trên thiết bị');
  };

  const handleDelete = async (record) => {
    // Nếu có id từ server → xóa backend, sau đó refresh
    if (record?.id) {
      try {
        const res = await callDeleteResume(record.id);
        const ok = Number(res?.statusCode ?? res?.status ?? 200) >= 200 && Number(res?.statusCode ?? res?.status ?? 200) < 300;
        if (ok || res?.success) {
          message.success(res?.message || 'Đã xóa CV khỏi server');
          const r2 = await listMyUploads();
          const items = r2?.data?.result ?? [];
          if (Array.isArray(items)) setList(items);
        } else {
          message.error(res?.message || 'Không thể xóa CV trên server');
        }
      } catch (e) {
        message.error(e?.response?.data?.message || 'Lỗi khi xóa CV trên server');
      }
      return;
    }
    // fallback: xóa local
    handleDeleteLocal(record?.fileName);
  };

  const formatType = (mime, originalName) => {
    const ext = (originalName || '').split('.').pop()?.toUpperCase();
    if (ext && ['PDF', 'DOC', 'DOCX', 'JPG', 'JPEG', 'PNG'].includes(ext)) return ext;
    switch (mime) {
      case 'application/pdf': return 'PDF';
      case 'application/msword': return 'DOC';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return 'DOCX';
      case 'image/jpeg': return 'JPG';
      case 'image/png': return 'PNG';
      default: return (mime || '').split('/')[1]?.toUpperCase() || 'N/A';
    }
  };

  const handleViewCV = async (url, originalName) => {
    if (!url) return;
    try {
      const blob = await callFetchFile(url, "resume");
      const ext = originalName ? originalName.split('.').pop().toLowerCase() : '';
      const isViewable = ['pdf', 'jpg', 'jpeg', 'png'].includes(ext);

      if (isViewable) {
          const fileURL = URL.createObjectURL(blob);
          window.open(fileURL, '_blank');
      } else {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = originalName || url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
    } catch (error) {
      message.error("Không thể tải file CV");
    }
  };

  const columns = [
    { title: 'STT', key: 'index', width: 70, align: 'center', render: (_, __, i) => i + 1 },
    { title: 'Tên file', dataIndex: 'originalName', ellipsis: true },
    { title: 'Định dạng', dataIndex: 'type', width: 140, align: 'center',
      render: (t, r) => <Tag color="geekblue">{formatType(t, r.originalName)}</Tag> },
    { title: 'Ngày tải', dataIndex: 'uploadedAt', render: (v) => new Date(v).toLocaleString() },
    { title: 'Xem', dataIndex: 'fileName', render: (name, record) => (
      name ? (
        <span style={{ cursor: "pointer", color: "blue" }} onClick={() => handleViewCV(name, record.originalName)}>Xem CV</span>
      ) : '—'
    ) },
    { title: 'Thao tác', key: 'actions', render: (_, r) => (
      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r)}>Xóa</Button>
    )},
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
      <div style={{ paddingTop: 120, paddingBottom: 48, borderBottom: '1px solid var(--color-border)', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.15)', borderRadius: 9999, padding: '4px 14px', marginBottom: 16 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f46e5', display: 'inline-block' }}></span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#4f46e5', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Tài khoản</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 10px', letterSpacing: '-0.03em' }}>Quản lý CV</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, margin: 0 }}>
          Lưu trữ CV để dùng khi ứng tuyển.
        </p>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <Upload
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          beforeUpload={beforeUpload}
          customRequest={customRequest}
          showUploadList={false}
        >
          <Button type="primary" icon={<UploadOutlined />} loading={uploading} size="large" style={{ borderRadius: 8 }}>
            {uploading ? `Đang tải (${percent}%)` : 'Tải CV lên'}
          </Button>
        </Upload>
      </div>

      <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 24, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        {list && list.length > 0 ? (
          <Table rowKey={(r) => r.fileName} columns={columns} dataSource={list} pagination={false} />
        ) : (
          <Empty description="Chưa có CV nào được tải lên." />
        )}
      </div>
    </div>
  );
};

export default ManageMyCVPage;