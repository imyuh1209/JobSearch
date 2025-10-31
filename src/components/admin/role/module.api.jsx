import { Card, Col, Collapse, Row, Tooltip } from 'antd';
import { ProFormSwitch } from '@ant-design/pro-components';
import { grey } from '@ant-design/colors';
import { useEffect, useMemo } from 'react';
import { colorMethod, groupByPermission } from '../../../config/utils';
import '../../../styles/reset.scss';

const { Panel } = Collapse;

const ModuleApi = (props) => {
    const { form, listPermissions, singleRole, openModal } = props;

    // Gộp quyền Saved Jobs vào nhóm Jobs để hiển thị trong Role modal
    const mergedListPermissions = useMemo(() => {
        if (!Array.isArray(listPermissions)) return [];
        const jobIndex = listPermissions.findIndex(g => g.module === 'JOB');
        const savedIndex = listPermissions.findIndex(g => g.module === 'SAVED_JOB');
        if (jobIndex === -1) return listPermissions.filter(g => g.module !== 'SAVED_JOB');
        const jobGroup = listPermissions[jobIndex] || { module: 'JOB', permissions: [] };
        const savedGroup = savedIndex !== -1 ? listPermissions[savedIndex] : null;
        const mergedJobGroup = savedGroup
            ? { ...jobGroup, permissions: [ ...(jobGroup.permissions || []), ...(savedGroup.permissions || []) ] }
            : jobGroup;
        return listPermissions
            .map((g, idx) => (idx === jobIndex ? mergedJobGroup : g))
            .filter(g => g.module !== 'SAVED_JOB');
    }, [listPermissions]);

    useEffect(() => {
        if (mergedListPermissions?.length && singleRole?.id && openModal === true) {
            // Map các quyền hiện có theo id để set mặc định theo id, không phụ thuộc module
            const grantedIds = new Set((singleRole?.permissions || []).map(p => p.id));

            let p = {};

            mergedListPermissions.forEach(x => {
                const children = x.permissions || [];
                children.forEach(y => {
                    p[y.id] = grantedIds.has(y.id);
                });
                const allCheck = children.length > 0 ? children.every(it => grantedIds.has(it.id)) : false;
                p[x.module] = allCheck;
            });

            form.setFieldsValue({
                name: singleRole.name,
                active: singleRole.active,
                description: singleRole.description,
                permissions: p
            });
        }
    }, [openModal, singleRole, mergedListPermissions, form]);

    const handleSwitchAll = (value, name) => {
        const child = mergedListPermissions?.find(item => item.module === name);
        if (child) {
            child?.permissions?.forEach(item => {
                if (item.id)
                    form.setFieldValue(["permissions", item.id], value);
            });
        }
    };

    const handleSingleCheck = (value, child, parent) => {
        form.setFieldValue(["permissions", child], value);

        // Check all
        const temp = mergedListPermissions?.find(item => item.module === parent);
        if (temp?.module) {
            const restPermission = temp?.permissions?.filter(item => item.id !== child);
            if (restPermission && restPermission.length) {
                const allTrue = restPermission.every(item => form.getFieldValue(["permissions", item.id]));
                form.setFieldValue(["permissions", parent], allTrue && value);
            }
        }
    };

    return (
        <Card size="small" variant="borderless">
            <Collapse>
                {mergedListPermissions?.map((item, index) => (
                    <Panel
                        header={<div>{item.module}</div>}
                        key={`${index}-parent`}
                        forceRender={true}
                        extra={
                            <div className="customize-form-item" onClick={e => e.stopPropagation()}>
                                <ProFormSwitch
                                    name={["permissions", item.module]}
                                    fieldProps={{
                                        defaultChecked: false,
                                        onChange: (value) => handleSwitchAll(value, item.module),
                                    }}
                                />
                            </div>
                        }
                    >
                        <Row gutter={[16, 16]}>
                            {item.permissions?.map((value, i) => (
                                <Col lg={12} md={12} sm={24} key={`${i}-child-${item.module}`}>
                                    <Card size="small" bodyStyle={{ display: "flex", flex: 1, flexDirection: 'row' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <ProFormSwitch
                                                name={["permissions", value.id]}
                                                fieldProps={{
                                                    defaultChecked: false,
                                                    onChange: (v) => handleSingleCheck(v, value.id, item.module)
                                                }}
                                            />
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <Tooltip title={value?.name}>
                                                <p style={{ paddingLeft: 10, marginBottom: 3 }}>{value?.name || ''}</p>
                                                <div style={{ display: 'flex' }}>
                                                    <p style={{ paddingLeft: 10, fontWeight: 'bold', marginBottom: 0, color: colorMethod(value?.method) }}>{value?.method || ''}</p>
                                                    <p style={{ paddingLeft: 10, marginBottom: 0, color: grey[5] }}>{value?.apiPath || ''}</p>
                                                </div>
                                            </Tooltip>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Panel>
                ))}
            </Collapse>
        </Card>
    );
};

export default ModuleApi;
