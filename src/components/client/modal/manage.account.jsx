import { Modal, Tabs, Table, Form, Row, Col, Select, Button, message, notification, Input, InputNumber } from 'antd';
import { isMobile } from 'react-device-detect';
import { useEffect, useState, useContext } from 'react';
import { callFetchResumeByUser, fetchAllSkillAPI, callCreateSubscriber, callGetSubscriberSkills, callUpdateSubscriber, callUpdateUser, getAccount, callChangePassword } from '../../../services/api.service';
import dayjs from 'dayjs';
import { MonitorOutlined } from "@ant-design/icons";
import { AuthContext } from "../../context/auth.context";

export const UserResume = () => {
    const [listCV, setListCV] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        const init = async () => {
            setIsFetching(true);
            const res = await callFetchResumeByUser();
            if (res && res.data) {
                setListCV(res.data.result)
            }
            setIsFetching(false);
        }
        init();
    }, [])

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
            title: 'Ngày rải CV',
            dataIndex: "createdAt",
            render(value, record) {
                return (
                    <>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
        },
        {
            title: '',
            dataIndex: "",
            render(value, record) {
                return (
                    <a
                        href={`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${record?.url}`}
                        target="_blank"
                    >Chi tiết</a>
                )
            },
        },
    ];

    return (
        <div>
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
