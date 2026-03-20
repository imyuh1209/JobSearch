import React, { useEffect, useState } from "react";
import { Card, Col, Row, Divider, Pagination, Spin, Empty } from "antd";
import { fetchAllCompanyAPI } from "../../../services/api.service";
import { isMobile } from "react-device-detect";
import { Link, useNavigate } from "react-router-dom";
import styles from '../../../styles/client.module.scss';

const CompanyCard = ({ showPagination = false }) => {
    const [displayCompany, setDisplayCompany] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(4);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCompanies();
    }, [current, pageSize]);

    const fetchCompanies = async () => {
        setIsLoading(true);
        try {
            const res = await fetchAllCompanyAPI(`page=${current}&size=${pageSize}`);
            if (res && res.data) {
                setDisplayCompany(res.data.result);
                setTotal(res.data.meta.total);
            }
        } catch (error) {
            console.error("Lỗi khi fetch dữ liệu:", error);
        }
        setIsLoading(false);
    };

    const handlePageChange = (page, size) => {
        setCurrent(page);
        setPageSize(size);
    };

    const handleViewDetailCompany = (item) => {
        if (item.name) {
            navigate(`/company/${item.id}`);
        }
    };

    return (
        <div className={`${styles["company-section"]}`}>
            <div className={styles["company-content"]}>
                <Spin spinning={isLoading} tip="Đang tải...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} className={isMobile ? "dflex-mobile" : "dflex-pc"}>
                                <span className="title">Nhà Tuyển Dụng Hàng Đầu</span>
                                {!showPagination && <Link to="/company">Xem tất cả</Link>}
                            </div>
                        </Col>
                        {displayCompany.length > 0 ? (
                            displayCompany.map((item) => (
                                <Col span={24} md={6} key={item.id}>
                                    <Card
                                        onClick={() => handleViewDetailCompany(item)}
                                        className={styles["company-grid-card"]}
                                        hoverable
                                        bordered={false}
                                        cover={
                                            <div className={styles["logo-wrapper"]} >
                                                <img
                                                    alt={item.name}
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item.logo}`}
                                                />
                                            </div>
                                        }
                                    >
                                        <div className={styles["company-name"]}>{item.name}</div>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            !isLoading && <Empty description="Không có dữ liệu" />
                        )}
                    </Row>

                    {showPagination && (
                        <Row style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
                            <Pagination
                                current={current}
                                total={total}
                                pageSize={pageSize}
                                responsive
                                onChange={handlePageChange}
                            />
                        </Row>
                    )}
                </Spin>
            </div>
        </div>
    );
};

export default CompanyCard;
