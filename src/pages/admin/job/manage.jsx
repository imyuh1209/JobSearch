import React from 'react';
import { Tabs } from 'antd';
import JobPage from './job';

const ManagePage = () => {
    const items = [
        {
            key: 'jobs',
            label: 'Quản lý Jobs',
            children: <JobPage />,
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <Tabs defaultActiveKey="jobs" items={items} />
        </div>
    );
};

export default ManagePage;