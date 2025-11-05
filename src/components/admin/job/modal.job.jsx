import { useState, useEffect } from 'react';
import { Form, Input, Modal, message, InputNumber, Select, Row, Col, DatePicker, Checkbox } from 'antd';
import { callCreateJob, callUpdateJob, fetchAllCompanyAPI } from '../../../services/api.service';
import { LOCATION_LIST } from '../../../config/utils';
import dayjs from 'dayjs';

const ModalJob = ({ openModal, setOpenModal, dataInit, setDataInit, reloadTable }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    // const [skills, setSkills] = useState([]);
    const [companies, setCompanies] = useState([]);
    const negotiable = Form.useWatch('salaryNegotiable', form);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ companiesRes] = await Promise.all([
                    fetchAllCompanyAPI('page=0&size=100')
                ]);
                setCompanies(companiesRes?.data?.result ?? []);
            } catch (error) {
                console.error('Lỗi tải dữ liệu:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (dataInit) {
            const { startDate, endDate, company, salaryMin, salaryMax } = dataInit;

            form.setFieldsValue({
                ...dataInit,
                company: company?.id,
                startDate: startDate ? dayjs(startDate) : null,
                endDate: endDate ? dayjs(endDate) : null,
                salaryNegotiable: (salaryMin == null && salaryMax == null) ? true : false,
            });
        }
    }, [dataInit]);

    const handleCloseModal = () => {
        form.resetFields();
        setDataInit?.(null);
        setOpenModal(false);
    };

    const onFinish = async (values) => {
        setLoading(true);
        const payload = {
            ...values,
            company: { id: values.company },
            startDate: values.startDate?.startOf('day').toDate() || null,
            endDate: values.endDate?.startOf('day').toDate() || null,
        };

        // Nếu chọn lương thoả thuận thì bỏ giá trị min/max
        if (values.salaryNegotiable) {
            payload.salaryMin = null;
            payload.salaryMax = null;
        }
        // Không cần gửi cờ UI lên backend
        delete payload.salaryNegotiable;

        try {
            const apiCall = dataInit?.id
                ? () => callUpdateJob(dataInit.id, payload)
                : () => callCreateJob(payload);

            const res = await apiCall();

            if (res?.data) {
                message.success(dataInit?.id ? 'Cập nhật job thành công' : 'Thêm mới job thành công');
                handleCloseModal();
                reloadTable();
            } else {
                message.error(res?.message || 'Thao tác thất bại');
            }
        } catch (err) {
            console.error(err);
            message.error('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={dataInit?.id ? 'Cập nhật Job' : 'Tạo mới Job'}
            open={openModal}
            onCancel={handleCloseModal}
            onOk={() => form.submit()}
            confirmLoading={loading}
            maskClosable={false}
            width="60vw"
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                name="jobForm"
                onFinish={onFinish}
                preserve={false}
                initialValues={{ active: true, salaryNegotiable: false }}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24} md={12}>
                        <Form.Item
                            label="Tên Job"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập tên job!' }]}
                        >
                            <Input placeholder="Nhập tên job" />
                        </Form.Item>
                    </Col>

                    <Col span={24} md={12}>
                        <Form.Item
                            label="Công ty"
                            name="company"
                            rules={[{ required: true, message: 'Vui lòng chọn công ty!' }]}
                        >
                            <Select
                                placeholder="Chọn công ty"
                                options={companies.map(company => ({
                                    label: company.name,
                                    value: company.id,
                                    key: company.id,
                                }))}
                            />
                        </Form.Item>
                    </Col>

                    {/* <Col span={24} md={12}>
                        <Form.Item
                            label="Skills"
                            name="skills"
                            rules={[{ required: true, message: 'Vui lòng chọn skills!' }]}
                        >
                            <Select
                                mode="multiple"
                                allowClear
                                placeholder="Chọn skills"
                                options={skills.map(skill => ({
                                    label: skill.name,
                                    value: skill.id,
                                    key: skill.id,
                                }))}
                            />
                        </Form.Item>
                    </Col> */}

                    <Col span={24} md={8}>
                        <Form.Item
                            label="Level"
                            name="level"
                            rules={[{ required: true, message: 'Vui lòng chọn level!' }]}
                        >
                            <Select
                                placeholder="Chọn level"
                                options={[
                                    'INTERN',
                                    'FRESHER',
                                    'JUNIOR',
                                    'MIDDLE',
                                    'SENIOR',
                                ].map(level => ({ label: level, value: level }))}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={24} md={8}>
                        <Form.Item
                            label="Địa điểm"
                            name="location"
                            rules={[{ required: true, message: 'Vui lòng chọn địa điểm!' }]}
                        >
                            <Select
                                placeholder="Chọn địa điểm"
                                options={LOCATION_LIST.filter(loc => loc.value !== 'ALL')}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={24} md={8}>
                        <Form.Item
                            label="Lương từ"
                            name="salaryMin"
                            rules={[{ required: true, message: 'Vui lòng nhập lương tối thiểu!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(val) => val.replace(/\D/g, '')}
                                addonAfter="đ"
                                placeholder="Nhập lương tối thiểu"
                                min={0}
                                step={1000000}
                                disabled={negotiable}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={24} md={8}>
                        <Form.Item
                            label="đến"
                            name="salaryMax"
                            rules={[{ required: true, message: 'Vui lòng nhập lương tối đa!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(val) => val.replace(/\D/g, '')}
                                addonAfter="đ"
                                placeholder="Nhập lương tối đa"
                                min={0}
                                step={1000000}
                                disabled={negotiable}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={24} md={8}>
                        <Form.Item name="salaryNegotiable" label="Lương thoả thuận" valuePropName="checked">
                            <Checkbox>
                                Để trống dải lương và hiển thị "Thoả thuận"
                            </Checkbox>
                        </Form.Item>
                    </Col>

                    <Col span={24} md={8}>
                        <Form.Item
                            label="Số lượng"
                            name="quantity"
                            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                        >
                            <InputNumber style={{ width: '100%' }} min={1} placeholder="Nhập số lượng" />
                        </Form.Item>
                    </Col>

                    <Col span={24} md={8}>
                        <Form.Item
                            label="Ngày bắt đầu"
                            name="startDate"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                        >
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>

                    <Col span={24} md={8}>
                        <Form.Item
                            label="Ngày kết thúc"
                            name="endDate"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}
                        >
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            label="Mô tả công việc"
                            name="description"
                            rules={[{ required: true, message: 'Vui lòng nhập mô tả công việc!' }]}
                        >
                            <Input.TextArea rows={4} placeholder="Nhập mô tả công việc" />
                        </Form.Item>
                    </Col>

                    <Col span={24} md={8}>
                        <Form.Item
                            label="Trạng thái"
                            name="active"
                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                        >
                            <Select
                                placeholder="Chọn trạng thái"
                                options={[
                                    { label: 'ACTIVE', value: true },
                                    { label: 'INACTIVE', value: false },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ModalJob;
