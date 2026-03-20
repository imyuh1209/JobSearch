import React, { useEffect, useState, useContext } from 'react';
import { Card, Form, Input, InputNumber, Switch, Button, Table, Space, message, notification, Select, Tag, Checkbox } from 'antd';
import dayjs from 'dayjs';
import { AuthContext } from '../../components/context/auth.context';
import { 
  createJobAlert, createJobAlertAuth, listJobAlerts, updateJobAlert, deleteJobAlert, runJobAlertNow,
} from '../../services/api.service';

const JobAlertsPage = () => {
  const [form] = Form.useForm();
  const { user } = useContext(AuthContext);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [list, setList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [levels] = useState([
    { label: 'Thực tập (Intern)', value: 'INTERN' },
    { label: 'Fresher', value: 'FRESHER' },
    { label: 'Junior', value: 'JUNIOR' },
    { label: 'Middle', value: 'MIDDLE' },
    { label: 'Senior', value: 'SENIOR' },
  ]);
  const [useJobAlertAPI, setUseJobAlertAPI] = useState(true);
  const [guestEmail, setGuestEmail] = useState('');

  const fetchList = async (emailParam) => {
    setLoadingList(true);
    try {
      const backendBase = import.meta.env.VITE_BACKEND_URL || '';
      const finalUrl = `${backendBase}${emailParam ? `/api/v1/job-alerts?email=${encodeURIComponent(emailParam)}` : '/api/v1/job-alerts'}`;
      console.log('[JobAlerts] GET', finalUrl, user?.id ? '(JWT)' : '(public)');
      const res = await listJobAlerts(emailParam);
      const data = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : Array.isArray(res?.result)
            ? res.result
            : [];
      const statusGuess = (typeof res?.status === 'number') ? res.status : (Array.isArray(data) ? 200 : undefined);
      console.log('[JobAlerts] Response', { status: statusGuess, body: data });
      setList(data);
    } catch (e) {
      console.error(e);
      setList([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchList(undefined);
    } else {
      const saved = localStorage.getItem('job_alert_email') || '';
      setGuestEmail(saved);
      if (saved) fetchList(saved);
    }
  }, [user?.id]);

  const onCreate = async (values) => {
    const email = user?.email || (values.email || '').trim();
    const mapFreq = (f) => (f === 'weekly' ? 'WEEKLY' : 'DAILY');
    const payload = {
      email,
      keyword: (values.keywords || '').trim() || undefined,
      location: (values.location || '').trim() || undefined,
      salaryMin: typeof values.salaryMin === 'number' ? values.salaryMin : undefined,
      salaryMax: typeof values.salaryMax === 'number' ? values.salaryMax : undefined,
      level: values.level || undefined,
      companyName: (values.company || '').trim() || undefined,
      frequency: mapFreq(values.frequency || 'daily'),
      enabled: !!values.enabled,
    };

    if (!email) {
      message.error('Vui lòng nhập email để tạo job alert');
      return;
    }

    const hasAnyFilter = [
      payload.keyword,
      payload.location,
      payload.level,
      payload.companyName,
      payload.salaryMin,
      payload.salaryMax,
    ].some((v) => v !== undefined && v !== '' && v !== null);

    if (!hasAnyFilter) {
      notification.warning({
        message: 'Chưa nhập tiêu chí',
        description: 'Vui lòng nhập ít nhất một tiêu chí: từ khóa, địa điểm, cấp độ, công ty hoặc mức lương.',
      });
      return;
    }

    if (!user?.id) {
      if (!payload.email) {
        message.error('Vui lòng nhập email để tạo job alert');
        return;
      }
      if (!payload.consent) {
        message.error('Vui lòng đồng ý nhận thông tin (consent)');
        return;
      }
    }
    setLoadingCreate(true);
    try {
      const res = user?.id ? await createJobAlertAuth(payload) : await createJobAlert(payload);
      if (res?.data || res?.status === 201) {
        message.success('Tạo Job Alert thành công');
        form.resetFields();
        if (user?.id) {
          fetchList(undefined);
        } else {
          localStorage.setItem('job_alert_email', email);
          setGuestEmail(email);
          fetchList(email);
        }
      } else {
        notification.error({ message: 'Không thể tạo Job Alert', description: res?.message || '' });
      }
    } catch (e) {
      notification.error({ message: 'Lỗi', description: e?.response?.data?.message || e.message });
    } finally {
      setLoadingCreate(false);
    }
  };

  const columns = [
    {
      title: 'Tiêu chí',
      render: (r) => {
        if (r.criteria) return r.criteria;
        const keyword = r.keyword || r.keywords;
        const company = r.companyName || r.company_name;
        const level = r.level;
        const salaryStr = (typeof r.salaryMin === 'number' || typeof r.salaryMax === 'number')
          ? `${r.salaryMin ?? '—'}–${r.salaryMax ?? '—'}`
          : null;
        const location = r.location;
        const parts = [keyword, company, level, salaryStr, location].filter(Boolean);
        return parts.length ? parts.join('; ') : '—';
      }
    },
    { title: 'Tần suất', dataIndex: 'frequency', render: (v) => (v === 'WEEKLY' ? 'Hàng tuần' : 'Hàng ngày') },
    {
      title: 'Trạng thái',
      render: (v, r) => {
        const enabledVal = typeof r.enabled === 'boolean' ? r.enabled : (r.enabled === 1 || r.enabled === '1' || r.active === true);
        return enabledVal ? 'Đang bật' : 'Tạm dừng';
      }
    },
    {
      title: 'Lần gửi gần nhất',
      render: (v, r) => {
        const t = r.lastSentAt || r.last_sent_at || r.createdAt || r.created_at;
        return t ? dayjs(t).format('DD/MM/YYYY HH:mm') : '—';
      }
    },
    {
      title: 'Hành động',
      render: (_, record) => (
        <Space>
          <Button onClick={async () => {
            try {
              const res = await runJobAlertNow(record.id);
              message.success('Đã gửi cảnh báo ngay');
              if (user?.id) {
                fetchList(undefined);
              } else if (guestEmail) {
                fetchList(guestEmail);
              }
            } catch (e) {
              notification.error({ message: 'Lỗi', description: e?.response?.data?.message || e.message });
            }
          }}>Gửi cảnh báo ngay</Button>
          <Button onClick={async () => {
            try {
              const nextEnabled = !(typeof record.enabled === 'boolean' ? record.enabled : record.active);
              const res = await updateJobAlert(record.id, { enabled: nextEnabled });
              setList((prev) => prev.map((x) => x.id === record.id ? { ...x, enabled: nextEnabled } : x));
            } catch {
              void 0;
            }
          }}>{(typeof record.enabled === 'boolean' ? record.enabled : record.active) ? 'Tạm dừng' : 'Kích hoạt'}</Button>
          <Button danger onClick={async () => {
            try {
              const res = await deleteJobAlert(record.id);
              message.success('Đã xóa Job Alert');
              setList((prev) => prev.filter((x) => x.id !== record.id));
            } catch (e) {
              notification.error({ message: 'Lỗi', description: e?.response?.data?.message || e.message });
            }
          }}>Xóa</Button>
        </Space>
      )
    }
  ];

  // Web Push removed per request

  return (
    <div style={{ maxWidth: 960, margin: '24px auto', padding: '0 12px' }}>
      <Card title="Tạo Job Alert" style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical" onFinish={onCreate}>
          {!user?.id && (
            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }]}> 
              <Input placeholder="Nhập email để nhận job mới" allowClear />
            </Form.Item>
          )}
          <Form.Item label="Từ khóa" name="keywords">
            <Input placeholder="ví dụ: React, Java, Node" allowClear />
          </Form.Item>
          <Form.Item label="Địa điểm" name="location">
            <Input placeholder="ví dụ: Hà Nội, Hồ Chí Minh" allowClear />
          </Form.Item>
          <Form.Item label="Mức lương" style={{ marginBottom: 0 }}>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item name="salaryMin" style={{ flex: 1 }}>
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Tối thiểu" />
              </Form.Item>
              <Form.Item name="salaryMax" style={{ flex: 1 }}>
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Tối đa" />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item label="Cấp độ (Level)" name="level">
            <Select allowClear options={levels} placeholder="Chọn cấp độ công việc" />
          </Form.Item>
          <Form.Item label="Công ty" name="company">
            <Input placeholder="Tên công ty" allowClear />
          </Form.Item>
          <Form.Item label="Tần suất" name="frequency" initialValue={'daily'}>
            <Select options={[{ label: 'Hàng ngày', value: 'daily' }, { label: 'Hàng tuần', value: 'weekly' }]} />
          </Form.Item>
          {!user?.id && (
            <Form.Item name="consent" valuePropName="checked" rules={[{ validator: (_, v) => v ? Promise.resolve() : Promise.reject(new Error('Cần đồng ý nhận thông tin')) }]}>
              <Checkbox>Tôi đồng ý nhận thông tin và có thể hủy bất kỳ lúc nào</Checkbox>
            </Form.Item>
          )}
          <Form.Item name="enabled" label="Bật Alert" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loadingCreate}>Tạo Job Alert</Button>
          </Space>
        </Form>
      </Card>

      <Card title="Job Alerts của tôi">
        {user?.id ? (
          <Table rowKey={(r) => r.id} columns={columns} dataSource={list} loading={loadingList} pagination={false} />
        ) : (
          <div>
            <Space style={{ marginBottom: 12 }}>
              <Input style={{ width: 280 }} value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="Nhập email đã tạo alert" />
              <Button onClick={() => guestEmail ? fetchList(guestEmail) : message.warning('Vui lòng nhập email')}>Tải</Button>
            </Space>
            <Table rowKey={(r) => r.id} columns={columns} dataSource={list} loading={loadingList} pagination={false} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default JobAlertsPage;
