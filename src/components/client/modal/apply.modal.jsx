import { Button, Col, ConfigProvider, Divider, Modal, Row, Upload, Space, Table, message, notification } from "antd";
import { useNavigate } from "react-router-dom";
import enUS from 'antd/lib/locale/en_US';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { callCreateResume, callUploadSingleFile, listMyUploads } from "../../../services/api.service";
import { useContext } from "react";
import { AuthContext } from "../../context/auth.context";

const ApplyModal = (props) => {
    const { isModalOpen, setIsModalOpen, jobDetail } = props;
    const { user } = useContext(AuthContext);
    const [urlCV, setUrlCV] = useState("");
    const [savedUploads, setSavedUploads] = useState([]);
    const navigate = useNavigate();

    // Load CV đã tải lên từ server để đồng bộ với Flutter/app
    useEffect(() => {
        const fetchUploads = async () => {
            if (!isModalOpen || !user?.id) return;
            try {
                const res = await listMyUploads();
                const list = res?.data?.result ?? [];
                setSavedUploads(Array.isArray(list) ? list : []);
            } catch (err) {
                // Fallback: nếu API lỗi, thử đọc từ localStorage (giữ trải nghiệm cũ)
                try {
                    const key = `my_cvs_${user.id}`;
                    const raw = localStorage.getItem(key);
                    const localList = raw ? JSON.parse(raw) : [];
                    setSavedUploads(Array.isArray(localList) ? localList : []);
                } catch (_) {
                    setSavedUploads([]);
                }
            }
        };
        fetchUploads();
    }, [isModalOpen, user?.id]);

    const columns = [
        { title: 'Tên file', dataIndex: 'originalName', render: (v) => v || '—' },
        { title: 'Ngày tạo', dataIndex: 'uploadedAt', render: (v) => v ? new Date(v).toLocaleString() : '—' },
        { title: 'Xem', dataIndex: 'fileName', render: (name) => name ? (
            <a href={`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${name}`} target="_blank" rel="noreferrer">Xem</a>
        ) : '—' },
    ];

    const handleOkButton = async () => {
        if (!urlCV) {
            message.error("Vui lòng upload CV!");
            return;
        }

        if (!user?.id) {
            setIsModalOpen(false);
            navigate(`/login?callback=${window.location.href}`)
        }
        else {
            if (jobDetail) {
                const res = await callCreateResume(urlCV, jobDetail?.id, user.email, user.id);
                if (res.data) {
                    message.success("Rải CV thành công!");
                    setIsModalOpen(false);
                } else {
                    notification.error({
                        message: 'Có lỗi xảy ra',
                        description: res.message
                    });
                }
            }
        }
    }

    const propsUpload = {
        maxCount: 1,
        multiple: false,
        accept: "application/pdf,application/msword, .doc, .docx, .pdf",
        async customRequest({ file, onSuccess, onError }) {
            const res = await callUploadSingleFile(file, "resume");
            if (res && res.data) {
                setUrlCV(res.data.fileName);
                if (onSuccess) onSuccess('ok')
            } else {
                if (onError) {
                    setUrlCV("");
                    const error = new Error(res.message);
                    onError({ event: error });
                }
            }
        },
        onChange(info) {
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.")
            }
        },
    };

    return (
        <>
            <Modal title="Ứng Tuyển Job"
                open={isModalOpen}
                onOk={() => handleOkButton()}
                onCancel={() => setIsModalOpen(false)}
                maskClosable={false}
                okText={user?.id ? "Rải CV Nào " : "Đăng Nhập Nhanh"}
                cancelButtonProps={
                    { style: { display: "none" } }
                }
                destroyOnClose={true}
            >
                <Divider />
                {user?.id ?
                    <div>
                        <ConfigProvider locale={enUS}>
                            <div>
                                <Row gutter={[10, 10]}>
                                    <Col span={24}>
                                        <div>
                                            Bạn đang ứng tuyển công việc <b>{jobDetail?.name} </b>tại  <b>{jobDetail?.company?.name}</b>
                                        </div>
                                    </Col>
                                    <Col span={24}>
                                        <div>
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                value={user?.email}
                                                disabled
                                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                            />
                                        </div>
                                    </Col>
                                    <Col span={24}>
                                        <div>
                                            <label>Chọn CV đã lưu</label>
                                            <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
                                                <Table
                                                    size="small"
                                                    rowKey={(r) => r.fileName}
                                                    dataSource={savedUploads}
                                                    columns={columns}
                                                    pagination={false}
                                                    onRow={(record) => ({
                                                        onClick: () => setUrlCV(record.fileName)
                                                    })}
                                                    rowSelection={{
                                                        type: 'radio',
                                                        selectedRowKeys: urlCV ? [urlCV] : [],
                                                        onChange: (keys) => setUrlCV(keys[0])
                                                    }}
                                                />
                                            </Space>
                                        </div>
                                    </Col>
                                    <Col span={24}>
                                        <Divider style={{ margin: '12px 0' }} />
                                        <div>
                                            <label>Upload file CV</label>
                                            <Upload {...propsUpload}>
                                                <Button icon={<UploadOutlined />}>Tải lên CV của bạn ( Hỗ trợ *.doc, *.docx, *.pdf, and &lt; 5MB )</Button>
                                            </Upload>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </ConfigProvider>
                    </div>
                    :
                    <div>
                        Bạn chưa đăng nhập hệ thống. Vui lòng đăng nhập để có thể "Rải CV" bạn nhé -.-
                    </div>
                }
                <Divider />
            </Modal>
        </>
    )
}

export default ApplyModal;