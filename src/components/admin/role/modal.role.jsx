import { Col, Form, Row, message, notification, Button, Space, Modal } from "antd";
import { ProCard, ProFormSwitch, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { isMobile } from 'react-device-detect';
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { callCreateRole, callUpdateRole } from "../../../services/api.service";
import ModuleApi from "./module.api";

const ModalRole = (props) => {
    const { openModal, setOpenModal, reloadTable, listPermissions, singleRole, setSingleRole } = props;
    const [form] = Form.useForm();

    const submitRole = async (valuesForm) => {
        console.log("Form values:", valuesForm);
        const { description, active, name, permissions } = valuesForm;
        const checkedPermissions = [];

        if (permissions) {
            for (const key in permissions) {
                // Chỉ lấy các permission là ID (số) và có giá trị là true
                if (key.match(/^[0-9]+$/) && permissions[key] === true) {
                    const pid = Number(key);
                    if (!Number.isNaN(pid)) {
                        checkedPermissions.push({ id: pid });
                    }
                }
            }
        }

        console.log("Checked permissions:", checkedPermissions);

        if (singleRole?.id) {
            // update
            const role = {
                name,
                description,
                active,
                permissions: checkedPermissions
            };
            console.log("Updating role with data:", { ...role, id: singleRole.id });
            const res = await callUpdateRole({ ...role, id: singleRole.id });
            console.log("Update role response:", res);

            if (res.data) {
                message.success("Cập nhật role thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            // create
            const role = {
                name,
                description,
                active,
                permissions: checkedPermissions
            };
            console.log("Creating role with data:", role);
            const res = await callCreateRole(role);
            console.log("Create role response:", res);

            if (res.data) {
                message.success("Thêm mới role thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const handleReset = async () => {
        form.resetFields();
        setOpenModal(false);
        setSingleRole(null);
    }

    return (
        <>
            <Modal
                title={singleRole?.id ? "Cập nhật Role" : "Tạo mới Role"}
                open={openModal}
                onCancel={handleReset}
                width={isMobile ? "100%" : 900}
                maskClosable={false}
                destroyOnClose={true}
                footer={[
                    <Button key="cancel" onClick={handleReset} icon={<CloseOutlined />}>
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => form.submit()}
                        icon={<SaveOutlined />}
                    >
                        {singleRole?.id ? "Cập nhật" : "Tạo mới"}
                    </Button>
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={submitRole}
                    scrollToFirstError={true}
                >
                    <Row gutter={16}>
                        <Col lg={12} md={12} sm={24} xs={24}>
                            <Form.Item
                                label="Tên Role"
                                name="name"
                                rules={[
                                    { required: true, message: 'Vui lòng không bỏ trống' },
                                ]}
                            >
                                <ProFormText placeholder="Nhập name" />
                            </Form.Item>
                        </Col>
                        <Col lg={12} md={12} sm={24} xs={24}>
                            <Form.Item
                                label="Trạng thái"
                                name="active"
                                valuePropName="checked"
                                initialValue={true}
                            >
                                <ProFormSwitch
                                    checkedChildren="ACTIVE"
                                    unCheckedChildren="INACTIVE"
                                    fieldProps={{
                                        defaultChecked: true,
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                label="Miêu tả"
                                name="description"
                                rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            >
                                <ProFormTextArea
                                    placeholder="Nhập miêu tả role"
                                    fieldProps={{
                                        autoSize: { minRows: 2 }
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <ProCard
                                title="Quyền hạn"
                                subTitle="Các quyền hạn được phép cho vai trò này"
                                headStyle={{ color: '#d81921' }}
                                style={{ marginBottom: 20 }}
                                headerBordered
                                size="small"
                                bordered
                            >
                                <ModuleApi
                                    form={form}
                                    listPermissions={listPermissions}
                                    singleRole={singleRole}
                                    openModal={openModal}
                                />
                            </ProCard>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    )
}

export default ModalRole;
