import React, { useEffect, useMemo, useState, useContext } from 'react';
import { Card, Upload, Button, Space, Table, Tag, Empty, message } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { callUploadSingleFile, callCreateResume, listMyUploads, callDeleteResume } from '../../services/api.service';
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
            urlStorage: `/storage/resume/${uploadedName}`,
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

  const columns = [
    { title: 'STT', key: 'index', width: 70, align: 'center', render: (_, __, i) => i + 1 },
    { title: 'Tên file', dataIndex: 'originalName', ellipsis: true },
    { title: 'Định dạng', dataIndex: 'type', width: 140, align: 'center',
      render: (t, r) => <Tag color="geekblue">{formatType(t, r.originalName)}</Tag> },
    { title: 'Ngày tải', dataIndex: 'uploadedAt', render: (v) => new Date(v).toLocaleString() },
    { title: 'Xem', dataIndex: 'fileName', render: (name) => (
      name ? (
        <a href={`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${name}`} target="_blank">Xem CV</a>
      ) : '—'
    ) },
    { title: 'Thao tác', key: 'actions', render: (_, r) => (
      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r)}>Xóa</Button>
    )},
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>CV đã tải lên</div>
            <div style={{ color: '#888' }}>Lưu trữ CV để dùng khi ứng tuyển.</div>
          </div>
          <Upload
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            beforeUpload={beforeUpload}
            customRequest={customRequest}
            showUploadList={false}
          >
            <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
              {uploading ? `Đang tải (${percent}%)` : 'Tải CV lên'}
            </Button>
          </Upload>
        </Space>

        <div style={{ marginTop: 16 }}>
          {list && list.length > 0 ? (
            <Table rowKey={(r) => r.fileName} columns={columns} dataSource={list} pagination={false} />
          ) : (
            <Empty description="Chưa có CV nào được tải lên." />
          )}
        </div>
      </Card>
    </div>
  );
};

export default ManageMyCVPage;