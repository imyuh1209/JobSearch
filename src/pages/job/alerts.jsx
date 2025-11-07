import React, { useEffect, useState } from 'react';
import { Card, Form, Input, InputNumber, Switch, Button, Table, Space, message, notification } from 'antd';
import { createSavedSearch, listSavedSearches, deleteSavedSearch, runAlert } from '../../services/api.service';

const JobAlertsPage = () => {
  const [form] = Form.useForm();
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [list, setList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const fetchList = async () => {
    setLoadingList(true);
    try {
      const res = await listSavedSearches();
      const data = res?.data || res?.result || res || [];
      setList(Array.isArray(data) ? data : (data?.result || []));
    } catch (e) {
      console.error(e);
      setList([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const onCreate = async (values) => {
    const payload = {
      keywords: (values.keywords || '').trim(),
      location: (values.location || '').trim(),
      minSalary: values.minSalary ?? null,
      enabled: !!values.enabled,
    };
    setLoadingCreate(true);
    try {
      const res = await createSavedSearch(payload);
      if (res?.data || res?.status === 201) {
        message.success('Tạo saved search thành công');
        form.resetFields();
        fetchList();
      } else {
        notification.error({ message: 'Không thể tạo saved search', description: res?.message || '' });
      }
    } catch (e) {
      notification.error({ message: 'Lỗi', description: e?.response?.data?.message || e.message });
    } finally {
      setLoadingCreate(false);
    }
  };

  const columns = [
    { title: 'Từ khóa', dataIndex: 'keywords' },
    { title: 'Địa điểm', dataIndex: 'location' },
    { title: 'Lương tối thiểu', dataIndex: 'minSalary', render: (v) => v ?? '—' },
    { title: 'Bật alert', dataIndex: 'enabled', render: (v) => v ? 'Đang bật' : 'Tắt' },
    {
      title: 'Hành động',
      render: (_, record) => (
        <Space>
          <Button onClick={async () => {
            try {
              const res = await runAlert(record.id);
              if (res?.data || res?.status === 200) {
                message.success('Đã gửi cảnh báo ngay');
              } else {
                notification.error({ message: 'Không thể gửi cảnh báo', description: res?.message || '' });
              }
            } catch (e) {
              notification.error({ message: 'Lỗi', description: e?.response?.data?.message || e.message });
            }
          }}>Gửi cảnh báo ngay</Button>
          <Button danger onClick={async () => {
            try {
              const res = await deleteSavedSearch(record.id);
              if (res?.data || res?.status === 200 || res?.status === 204) {
                message.success('Xóa saved search thành công');
                setList((prev) => prev.filter((x) => x.id !== record.id));
              } else {
                notification.error({ message: 'Không thể xóa', description: res?.message || '' });
              }
            } catch (e) {
              notification.error({ message: 'Lỗi', description: e?.response?.data?.message || e.message });
            }
          }}>Xóa</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 960, margin: '24px auto', padding: '0 12px' }}>
      <Card title="Job Alerts" style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical" onFinish={onCreate}>
          <Form.Item label="Từ khóa" name="keywords">
            <Input placeholder="ví dụ: React, Java, Node" allowClear />
          </Form.Item>
          <Form.Item label="Địa điểm" name="location">
            <Input placeholder="ví dụ: Hà Nội, Hồ Chí Minh" allowClear />
          </Form.Item>
          <Form.Item label="Lương tối thiểu" name="minSalary">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="ví dụ: 10000000" />
          </Form.Item>
          <Form.Item label="Bật Alert" name="enabled" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loadingCreate}>Tạo Saved Search</Button>
        </Form>
      </Card>

      <Card title="Danh sách Saved Searches">
        <Table rowKey={(r) => r.id} columns={columns} dataSource={list} loading={loadingList} pagination={false} />
      </Card>
    </div>
  );
};

export default JobAlertsPage;