import { Modal, Tabs, Table, Form, Row, Col, Select, Button, message, notification, Input, InputNumber } from 'antd';
import { isMobile } from 'react-device-detect';
import { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { callFetchResumeByUser, fetchAllSkillAPI, callCreateSubscriber, callGetSubscriberSkills, callUpdateSubscriber, callUpdateUser, getAccount, callChangePassword } from '../../../services/api.service';
import dayjs from 'dayjs';
import { MonitorOutlined } from "@ant-design/icons";
import { AuthContext } from "../../context/auth.context";

export const UserResume = () => {
    const [listCV, setListCV] = useState([]);
    const [rawCV, setRawCV] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const init = async () => {
            setIsFetching(true);
            const res = await callFetchResumeByUser();
            if (res && res.data) {
                const data = res.data.result || [];
                setRawCV(data);
                // Áp dụng bộ lọc từ query nếu có
                const status = searchParams.get('status') || '';
                const company = searchParams.get('company') || '';
                const job = searchParams.get('job') || '';
                form.setFieldsValue({ status, company, job });
                setListCV(applyFilters(data, { status, company, job }));
            }
            setIsFetching(false);
        }
        init();
    }, [])

    // Lấy tên công ty từ nhiều nguồn
    const getCompanyName = (record) => {
        return (
            record?.job?.company?.name ||
            record?.job?.companyName ||
            record?.company?.name ||
            record?.companyName ||
            ''
        );
    };

    const applyFilters = (data, filters) => {
        const status = (filters.status || '').toLowerCase();
        const company = (filters.company || '').toLowerCase();
        const job = (filters.job || '').toLowerCase();
        return (data || []).filter((r) => {
            const rStatus = (r?.status || '').toLowerCase();
            const rCompany = (getCompanyName(r) || '').toLowerCase();
            const rJob = (r?.job?.name || '').toLowerCase();
            const okStatus = status ? rStatus.includes(status) : true;
            const okCompany = company ? rCompany.includes(company) : true;
            const okJob = job ? rJob.includes(job) : true;
            return okStatus && okCompany && okJob;
        });
    };

    const onFinish = (values) => {
        const { status = '', company = '', job = '' } = values;
        setListCV(applyFilters(rawCV, { status, company, job }));
        const params = new URLSearchParams({ tab: 'resume' });
        if (status) params.set('status', status);
        if (company) params.set('company', company);
        if (job) params.set('job', job);
        setSearchParams(params);
    };

    const handleReset = () => {
        form.resetFields();
        setListCV(rawCV);
        const params = new URLSearchParams({ tab: 'resume' });
        setSearchParams(params);
    };

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1)}
                    </>)
            }
        },
        {
            title: 'Công Ty',
            // Lấy tên công ty từ job.company.name với fallback
            dataIndex: ["job", "company", "name"],
            render: (_, record) => {
                const name = record?.job?.company?.name
                    || record?.job?.companyName
                    || record?.company?.name
                    || record?.companyName
                    || null;
                return name ? name : 'Đang cập nhật';
            }
        },
        {
            title: 'Job title',
            dataIndex: ["job", "name"],
        },
        {
            title: 'Trạng thái',
            dataIndex: "status",
        },
        {
            title: 'Email',
            dataIndex: 'email',
            render: (email) => email || '—',
        },
        {
            title: 'Ngày rải CV',
            dataIndex: "createdAt",
            render(value, record) {
                return (
                    <>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
        },
        {
            title: 'File CV',
            dataIndex: 'url',
            render(value, record) {
                const url = record?.url;
                if (!url) return 'Không có CV';
                const href = `${import.meta.env.VITE_BACKEND_URL}/storage/resume/${url}`;
                return (
                    <a href={href} target="_blank" rel="noreferrer">Xem CV</a>
                );
            }
        },
        {
            title: '',
            dataIndex: "",
            render(value, record) {
                const status = record?.status || '';
                const companyName = getCompanyName(record);
                const jobName = record?.job?.name || '';
                const goto = () => {
                    const params = new URLSearchParams({ tab: 'resume' });
                    if (status) params.set('status', status);
                    if (companyName) params.set('company', companyName);
                    if (jobName) params.set('job', jobName);
                    navigate(`/account?${params.toString()}`);
                };
                return (
                    <Button type="link" onClick={goto}>Chi tiết</Button>
                )
            },
        },
    ];

    return (
        <div>
            <Form form={form} layout="inline" onFinish={onFinish} style={{ marginBottom: 12 }}>
                <Form.Item name="status" label="Trạng thái">
                    <Select allowClear placeholder="Chọn trạng thái" style={{ minWidth: 160 }}>
                        <Select.Option value="PENDING">PENDING</Select.Option>
                        <Select.Option value="REVIEWING">REVIEWING</Select.Option>
                        <Select.Option value="APPROVED">APPROVED</Select.Option>
                        <Select.Option value="REJECTED">REJECTED</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="company" label="Công ty">
                    <Input allowClear placeholder="Tên công ty" style={{ minWidth: 200 }} />
                </Form.Item>
                <Form.Item name="job" label="Công việc">
                    <Input allowClear placeholder="Tên công việc" style={{ minWidth: 220 }} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>Lọc</Button>
                    <Button onClick={handleReset}>Làm lại</Button>
                </Form.Item>
            </Form>
            <Table
                columns={columns}
                dataSource={listCV}
                loading={isFetching}
                pagination={false}
            />
        </div>
    )
}


// Job by email
export const JobByEmail = () => {
    const [form] = Form.useForm();
    const [optionsSkills, setOptionsSkills] = useState([]);
    const [subscriber, setSubscriber] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const init = async () => {
            console.log("init");
            await fetchSkill();
            // Giá trị email mặc định theo tài khoản hiện tại
            form.setFieldValue("email", user?.email || "");
            const res = await callGetSubscriberSkills();
            if (res && res.data) {
                setSubscriber(res.data);
                const d = res.data.skills || [];
                const arr = d.map((item) => ({ label: item.name, value: item.id + "" }));
                form.setFieldValue("skills", arr);
                // Nếu subscriber có email riêng thì ghi đè
                form.setFieldValue("email", res.data?.email || user?.email || "");
            }
        }
        init();
    }, [])

    const fetchSkill = async () => {
        let query = `page=1&size=100&sort=createdAt,desc`;

        const res = await fetchAllSkillAPI(query);
        if (res && res.data) {
            const arr = res?.data?.result?.content?.map(item => {
                return {
                    label: item.name,
                    value: item.id + ""
                }
            }) ?? [];
            setOptionsSkills(arr);
        }
    }

    const onFinish = async (values) => {
        if (!user) {
            message.error("Vui lòng đăng nhập để sử dụng tính năng này");
            return;
        }

        const { skills, email } = values;
        const normalizedEmail = (email || "").trim();

        const arr = skills?.map((item) => {
            if (item?.id) return { id: item.id };
            return { id: item }
        });

        if (!subscriber?.id) {
            //create subscriber
            const data = {
                email: normalizedEmail,
                name: user.name,
                skills: arr
            }

            const res = await callCreateSubscriber(data);
            if (res.data) {
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            //update subscriber
            const data = {
                id: subscriber.id,
                email: normalizedEmail,
                name: user.name,
                skills: arr
            }

            const res = await callUpdateSubscriber(data);
            if (res.data) {
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }
}

export const UserUpdateInfo = () => {
    const [form] = Form.useForm();
    const { user, setUser } = useContext(AuthContext);

    useEffect(() => {
        if (user && user.id) {
            form.setFieldsValue({
                name: user.name || "",
                email: user.email || "",
                gender: user.gender || undefined,
                address: user.address || "",
            });
        }
    }, [user]);

    const onFinish = async (values) => {
        try {
            // Chuẩn hóa dữ liệu trước khi gửi
            const uid = Number(user?.id);
            const payload = {
                name: (values.name ?? "").trim(),
                email: user?.email || values.email || "",
                gender: values.gender,
                address: values.address ?? "",
            };

            const res = await callUpdateUser(uid, payload);
            if (res?.data) {
                message.success("Cập nhật thông tin thành công");

                // Cập nhật tạm thời context để tránh mất trạng thái (đặc biệt là id)
                setUser((prev) => ({
                    ...prev,
                    ...payload,
                    id: prev?.id, // đảm bảo giữ id hiện tại để không bị PrivateRoute chặn
                }));

                // Sau đó gọi getAccount để đồng bộ dữ liệu mới nhất từ server (nếu có)
                try {
                    const acc = await getAccount();
                    if (acc?.data?.user && acc?.data?.user?.id) {
                        setUser(acc.data.user);
                        // Đồng bộ lại form theo dữ liệu mới
                        form.setFieldsValue({
                            name: acc.data.user.name || "",
                            email: acc.data.user.email || "",
                            gender: acc.data.user.gender ?? undefined,
                            address: acc.data.user.address || "",
                        });
                    }
                } catch (err) {
                    // Bỏ qua nếu getAccount lỗi, đã có dữ liệu tạm thời từ payload
                }
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res?.message || "Vui lòng thử lại",
                });
            }
        } catch (e) {
            notification.error({
                message: "Lỗi",
                description: e?.response?.data?.message || e.message || "Không thể cập nhật",
            });
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Form.Item label="Tên hiển thị" name="name" rules={[{ required: true, message: "Vui lòng nhập tên" }]}> 
                        <Input placeholder="Nhập tên" allowClear />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item label="Email" name="email" rules={[{ required: true }]}> 
                        <Input disabled />
                    </Form.Item>
                </Col>
                {/* Bỏ mục nhập tuổi theo yêu cầu */}
                <Col xs={24} md={12}>
                    <Form.Item label="Giới tính" name="gender" rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}> 
                        <Select
                            options={[
                                { label: 'Nam', value: 'MALE' },
                                { label: 'Nữ', value: 'FEMALE' },
                                { label: 'Khác', value: 'OTHER' },
                            ]}
                        />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item label="Địa chỉ" name="address"> 
                        <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} allowClear />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Button type="primary" onClick={() => form.submit()}>Cập nhật</Button>
                </Col>
            </Row>
        </Form>
    );
}

export const ChangePassword = () => {
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        const { currentPassword, newPassword } = values;
        try {
            const res = await callChangePassword(currentPassword, newPassword);
            // Nếu request thành công (không throw), coi là thành công
            notification.success({
                message: "Đổi mật khẩu thành công",
                description: (typeof res?.message === 'string' && res.message) || "Mật khẩu đã được cập nhật."
            });
            form.resetFields();
        } catch (e) {
            notification.error({
                message: "Lỗi",
                description: e?.response?.data?.message || e.message || "Không thể đổi mật khẩu",
            });
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu hiện tại" allowClear />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }, { min: 6, message: "Ít nhất 6 ký tự" }]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu mới" allowClear />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Xác nhận mật khẩu"
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                            { required: true, message: "Vui lòng xác nhận mật khẩu" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("newPassword") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Nhập lại mật khẩu mới" allowClear />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Button type="primary" onClick={() => form.submit()}>Đổi mật khẩu</Button>
                </Col>
            </Row>
        </Form>
    );
}

const ManageAccount = (props) => {
    const { open, onClose } = props;

    const onChange = (key) => {
        console.log(key);
    };

    const items = [
        {
            key: 'user-resume',
            label: `Lịch sử ứng tuyển`,
            children: <UserResume />,
        },
    
    ];

    return (
        <>
            <Modal
                title="Quản lý tài khoản"
                open={open}
                onCancel={() => onClose(false)}
                maskClosable={false}
                footer={null}
                destroyOnClose={true}
                width={isMobile ? "100%" : "1000px"}
            >
                <div style={{ minHeight: 400 }}>
                    <Tabs
                        defaultActiveKey="user-resume"
                        items={items}
                        onChange={onChange}
                    />
                </div>
            </Modal>
        </>
    )
}

export default ManageAccount;
