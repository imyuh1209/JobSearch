import React, { useState, useEffect, useContext } from 'react';
import { Steps, Button, Form, Input, Card, Space, Divider, Row, Col, Typography, message, Modal, Select, ColorPicker, List, Badge, Empty, Spin } from 'antd';
import { 
  UserOutlined, 
  BookOutlined, 
  SolutionOutlined, 
  BulbOutlined, 
  SafetyCertificateOutlined, 
  EyeOutlined, 
  SaveOutlined, 
  FilePdfOutlined,
  RobotOutlined,
  PlusOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../components/context/auth.context';
import { 
  callCreateOrUpdateCV, 
  callFetchCVById, 
  callExportCVToPDF, 
  callGetAISuggestions, 
  callFetchCVTemplateById 
} from '../../services/api.service';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const CVBuilderPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const templateIdFromUrl = searchParams.get('templateId');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cvData, setCvData] = useState({
    name: 'CV Mới của tôi',
    template: templateIdFromUrl || 'template-1',
    primaryColor: '#4f46e5',
    fontFamily: 'Inter',
    content: {
      personalInfo: {},
      education: [],
      experience: [],
      skills: [],
      certificates: []
    }
  });
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadCV(id);
    } else if (templateIdFromUrl) {
      loadTemplate(templateIdFromUrl);
    }
  }, [id, templateIdFromUrl]);

  const loadTemplate = async (tid) => {
    setLoading(true);
    try {
      const res = await callFetchCVTemplateById(tid);
      if (res.data) {
        setCvData(prev => ({
          ...prev,
          template: tid,
          primaryColor: res.data.primaryColor || prev.primaryColor,
        }));
        form.setFieldsValue({
          template: tid,
          primaryColor: res.data.primaryColor || cvData.primaryColor
        });
      }
    } catch (error) {
      console.error('Failed to load template', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCV = async (cvId) => {
    setLoading(true);
    try {
      const res = await callFetchCVById(cvId);
      if (res.data) {
        setCvData(res.data);
        form.setFieldsValue({
          cvName: res.data.name,
          template: res.data.template,
          primaryColor: res.data.primaryColor,
          fontFamily: res.data.fontFamily || 'Inter',
          ...res.data.content?.personalInfo,
          education: res.data.content?.education || [],
          experience: res.data.content?.experience || [],
          skills: res.data.content?.skills || [],
          certificates: res.data.content?.certificates || []
        });
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu CV');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...cvData,
        name: values.cvName || cvData.name,
        template: values.template || cvData.template,
        primaryColor: values.primaryColor?.toHexString ? values.primaryColor.toHexString() : values.primaryColor || cvData.primaryColor,
        fontFamily: values.fontFamily || cvData.fontFamily,
        content: {
          personalInfo: {
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            address: values.address,
            summary: values.summary,
            title: values.title,
            avatar: values.avatar
          },
          education: values.education || [],
          experience: values.experience || [],
          skills: values.skills || [],
          certificates: values.certificates || []
        }
      };

      setLoading(true);
      const res = await callCreateOrUpdateCV(payload);
      if (res.data) {
        message.success('Đã lưu CV thành công');
        if (!id) {
          navigate(`/cv/builder/${res.data.id}`);
        } else {
          loadCV(id); // Refresh data
        }
      }
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Vui lòng kiểm tra lại thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!id) {
      message.warning('Vui lòng lưu CV trước khi xuất PDF');
      return;
    }
    setLoading(true);
    try {
      const res = await callExportCVToPDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${cvData.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Lỗi khi xuất PDF');
    } finally {
      setLoading(false);
    }
  };

  const fetchAISuggestions = async () => {
    if (!id) {
      message.warning('Vui lòng lưu CV trước khi nhận gợi ý từ AI');
      return;
    }
    setLoadingAI(true);
    setShowAIModal(true);
    try {
      const res = await callGetAISuggestions(id);
      const suggestions = res?.data?.result ?? res?.data ?? [];
      setAiSuggestions(Array.isArray(suggestions) ? suggestions : []);
    } catch (error) {
      message.error('Không thể lấy gợi ý từ AI');
      setAiSuggestions([]);
    } finally {
      setLoadingAI(false);
    }
  };

  const steps = [
    {
      title: 'Thông tin',
      icon: <UserOutlined />,
      content: (
        <Card title="Thông tin cá nhân" variant="outlined">
          <Form.Item name="cvName" label="Tên CV" rules={[{ required: true }]}>
            <Input placeholder="VD: CV Ứng tuyển Java Developer" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="title" label="Vị trí ứng tuyển">
                <Input placeholder="Fullstack Developer" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input placeholder="example@gmail.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input placeholder="0987654321" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="Quận 1, TP. Hồ Chí Minh" />
          </Form.Item>
          <Form.Item name="summary" label="Giới thiệu bản thân">
            <Input.TextArea rows={4} placeholder="Tóm tắt ngắn gọn về kinh nghiệm và mục tiêu nghề nghiệp..." />
          </Form.Item>
        </Card>
      )
    },
    {
      title: 'Học vấn',
      icon: <BookOutlined />,
      content: (
        <Card title="Quá trình học tập" variant="outlined">
          <Form.List name="education">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    size="small" 
                    className="mb-3"
                    extra={<DeleteOutlined className="text-red-500" onClick={() => remove(name)} />}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'school']} label="Trường/Trung tâm" rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'degree']} label="Bằng cấp/Khóa học">
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'startDate']} label="Từ ngày">
                          <Input placeholder="MM/YYYY" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'endDate']} label="Đến ngày">
                          <Input placeholder="MM/YYYY hoặc Hiện tại" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item {...restField} name={[name, 'description']} label="Mô tả thêm">
                      <Input.TextArea />
                    </Form.Item>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm học vấn</Button>
              </>
            )}
          </Form.List>
        </Card>
      )
    },
    {
      title: 'Kinh nghiệm',
      icon: <SolutionOutlined />,
      content: (
        <Card title="Kinh nghiệm làm việc" variant="outlined">
          <Form.List name="experience">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    size="small" 
                    className="mb-3"
                    extra={<DeleteOutlined className="text-red-500" onClick={() => remove(name)} />}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'company']} label="Công ty" rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'position']} label="Chức danh">
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'startDate']} label="Từ ngày">
                          <Input placeholder="MM/YYYY" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'endDate']} label="Đến ngày">
                          <Input placeholder="MM/YYYY hoặc Hiện tại" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item {...restField} name={[name, 'description']} label="Mô tả công việc">
                      <Input.TextArea rows={4} />
                    </Form.Item>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm kinh nghiệm</Button>
              </>
            )}
          </Form.List>
        </Card>
      )
    },
    {
      title: 'Kỹ năng',
      icon: <BulbOutlined />,
      content: (
        <Card title="Kỹ năng chuyên môn" variant="outlined">
          <Form.List name="skills">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={16} align="middle" className="mb-2">
                    <Col span={10}>
                      <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true }]} noStyle>
                        <Input placeholder="Tên kỹ năng (VD: ReactJS)" />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item {...restField} name={[name, 'level']} noStyle>
                        <Select placeholder="Mức độ">
                          <Select.Option value="Cơ bản">Cơ bản</Select.Option>
                          <Select.Option value="Trung bình">Trung bình</Select.Option>
                          <Select.Option value="Khá">Khá</Select.Option>
                          <Select.Option value="Thành thạo">Thành thạo</Select.Option>
                          <Select.Option value="Chuyên gia">Chuyên gia</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                    </Col>
                  </Row>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm kỹ năng</Button>
              </>
            )}
          </Form.List>
        </Card>
      )
    },
    {
      title: 'Chứng chỉ',
      icon: <SafetyCertificateOutlined />,
      content: (
        <Card title="Chứng chỉ & Khác" variant="outlined">
          <Form.List name="certificates">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    size="small" 
                    className="mb-3"
                    extra={<DeleteOutlined className="text-red-500" onClick={() => remove(name)} />}
                  >
                    <Form.Item {...restField} name={[name, 'name']} label="Tên chứng chỉ" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'organization']} label="Tổ chức cấp">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'issueDate']} label="Ngày cấp">
                          <Input placeholder="MM/YYYY" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm chứng chỉ</Button>
              </>
            )}
          </Form.List>
        </Card>
      )
    },
    {
      title: 'Hoàn thiện',
      icon: <EyeOutlined />,
      content: (
        <Card title="Tùy chỉnh & Xem trước" variant="outlined">
          <Row gutter={[24, 24]}>
            <Col span={10}>
              <Title level={5}>Thiết kế</Title>
          <Form.Item name="template" label="Mẫu CV">
            <Select 
              onChange={(v) => navigate(`/cv/builder${id ? `/${id}` : ''}?templateId=${v}`)}
              dropdownRender={menu => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ padding: '0 8px 4px', textAlign: 'center' }}>
                    <Button type="link" onClick={() => navigate('/cv/templates')}>
                      Xem tất cả mẫu CV
                    </Button>
                  </div>
                </>
              )}
            >
              <Select.Option value="template-1">Mẫu Chuyên nghiệp 1</Select.Option>
              <Select.Option value="template-2">Mẫu Sáng tạo 2</Select.Option>
              <Select.Option value="template-3">Mẫu Tối giản 3</Select.Option>
              <Select.Option value="template-4">Mẫu Ấn tượng 4</Select.Option>
              <Select.Option value="template-5">Mẫu Harvard 5</Select.Option>
            </Select>
          </Form.Item>
              <Form.Item name="primaryColor" label="Màu chủ đạo">
                <ColorPicker showText />
              </Form.Item>
              <Form.Item name="fontFamily" label="Font chữ">
                <Select>
                  <Option value="Inter">Inter (Mặc định)</Option>
                  <Option value="Roboto">Roboto</Option>
                  <Option value="Open Sans">Open Sans</Option>
                  <Option value="Montserrat">Montserrat</Option>
                  <Option value="Playfair Display">Playfair Display (Hàn lâm)</Option>
                </Select>
              </Form.Item>
              <Divider />
              <Title level={5}>Công cụ AI</Title>
              <Button 
                type="primary" 
                ghost 
                icon={<RobotOutlined />} 
                onClick={fetchAISuggestions}
                block
              >
                Lấy gợi ý từ AI
              </Button>
              <Paragraph className="mt-2 text-gray-500 text-sm">
                AI sẽ phân tích nội dung CV của bạn và đưa ra các gợi ý cải thiện để tăng cơ hội trúng tuyển.
              </Paragraph>
            </Col>
            <Col span={14}>
              <div className="preview-container border rounded p-4 bg-gray-50 text-center" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <FilePdfOutlined style={{ fontSize: '48px', color: '#4f46e5' }} />
                <Title level={4} className="mt-3">Xem trước CV</Title>
                <Text>Nhấn nút bên dưới để tải bản PDF và xem trước định dạng chuẩn nhất.</Text>
                <div className="mt-4">
                  <Button type="primary" icon={<FilePdfOutlined />} onClick={handleExportPDF}>
                    Tải PDF / Xem trước
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      )
    }
  ];

  const next = async () => {
    try {
      // Validate only current step fields if needed
      // For simplicity, we'll just save the data to local state
      const values = form.getFieldsValue();
      setCvData(prev => ({
        ...prev,
        content: {
          ...prev.content,
          personalInfo: {
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            address: values.address,
            summary: values.summary,
            title: values.title,
            avatar: values.avatar
          },
          education: values.education || [],
          experience: values.experience || [],
          skills: values.skills || [],
          certificates: values.certificates || []
        },
        template: values.template || prev.template,
        primaryColor: values.primaryColor?.toHexString ? values.primaryColor.toHexString() : values.primaryColor || prev.primaryColor
      }));
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="cv-builder-page container mx-auto py-8 px-4" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <Title level={2}>
            <SolutionOutlined /> {id ? 'Chỉnh sửa CV' : 'Tạo CV trực tuyến'}
          </Title>
          <Text type="secondary">Hoàn thành các bước bên dưới để có một bản CV chuyên nghiệp</Text>
        </Col>
        <Col>
          <Space>
            <Button icon={<SaveOutlined />} onClick={handleSave} loading={loading}>
              Lưu bản nháp
            </Button>
            <Button type="primary" icon={<FilePdfOutlined />} onClick={handleExportPDF} disabled={!id}>
              Xuất PDF
            </Button>
          </Space>
        </Col>
      </Row>

      <Steps current={currentStep} className="mb-8" size="small">
        {steps.map(item => (
          <Step key={item.title} title={item.title} icon={item.icon} />
        ))}
      </Steps>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          cvName: cvData.name,
          template: cvData.template,
          primaryColor: cvData.primaryColor,
          fontFamily: cvData.fontFamily,
          ...cvData.content.personalInfo,
          education: cvData.content.education,
          experience: cvData.content.experience,
          skills: cvData.content.skills,
          certificates: cvData.content.certificates
        }}
        onFinish={handleSave}
      >
        <div className="steps-content min-h-[400px]">
          {steps[currentStep].content}
        </div>

        <div className="steps-action mt-8 flex justify-between">
          {currentStep > 0 && (
            <Button icon={<LeftOutlined />} onClick={() => prev()}>
              Quay lại
            </Button>
          )}
          <div style={{ marginLeft: 'auto' }}>
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={() => next()}>
                Tiếp theo <RightOutlined />
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                Hoàn tất & Lưu CV
              </Button>
            )}
          </div>
        </div>
      </Form>

      <Modal
        title={<span><RobotOutlined /> Gợi ý từ AI để cải thiện CV</span>}
        open={showAIModal}
        onCancel={() => setShowAIModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowAIModal(false)}>Đóng</Button>
        ]}
        width={700}
      >
        {loadingAI ? (
          <div className="text-center py-12">
            <Spin size="large" tip="AI đang phân tích CV của bạn..." />
          </div>
        ) : aiSuggestions && aiSuggestions.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={aiSuggestions}
            renderItem={(item, index) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Badge count={index + 1} style={{ backgroundColor: '#4f46e5' }} />}
                  title={<Text strong>{item.section}</Text>}
                  description={
                    <div>
                      <Paragraph>{item.suggestion}</Paragraph>
                      {item.example && (
                        <div className="bg-blue-50 p-2 rounded border-l-4 border-blue-500 text-sm italic">
                          Ví dụ: {item.example}
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="AI chưa có gợi ý nào cho bản CV này. Hãy thử thêm nhiều nội dung hơn!" />
        )}
      </Modal>
    </div>
  );
};

export default CVBuilderPage;
