import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, Col, Row, Divider, Pagination, Spin, Empty } from "antd";
import { fetchAllCompanyAPI } from "../../../services/api.service";
import { isMobile } from "react-device-detect";
import { Link, useNavigate } from "react-router-dom";
import styles from '../../../styles/client.module.scss';
import '../../../styles/carousel.css';

const CompanyCard = ({ showPagination = false, isCarousel = false }) => {
    const [displayCompany, setDisplayCompany] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(isCarousel ? 5 : 4); // Chỉ hiển thị top 5 công ty
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

    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const requestRef = useRef();
    const lastRotationRef = useRef(0);

    // Auto-rotation loop
    useEffect(() => {
        if (isCarousel && !isDragging) {
            const animate = () => {
                setRotation(prev => prev + 0.15); // Adjust auto-rotation speed here
                requestRef.current = requestAnimationFrame(animate);
            };
            requestRef.current = requestAnimationFrame(animate);
            return () => cancelAnimationFrame(requestRef.current);
        }
    }, [isCarousel, isDragging]);

    const handlePan = (event, info) => {
        setIsDragging(true);
        // Sensitivity: 1px movement = 0.5 degree rotation
        const delta = info.delta.x * 0.5;
        setRotation(prev => prev + delta);
    };

    const handlePanEnd = () => {
        // Delay resuming auto-rotation for a better feel
        setTimeout(() => setIsDragging(false), 2000);
    };

    const handleViewDetailCompany = (item) => {
        // Prevent clicking while dragging
        if (isDragging) return;
        if (item.name) {
            navigate(`/company/${item.id}`);
        }
    };

    if (isCarousel) {
        return (
            <div className="carousel-wrapper" style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>
                <Spin spinning={isLoading} tip="Đang tải...">
                    <motion.div 
                        className="carousel-inner" 
                        onPan={handlePan}
                        onPanEnd={handlePanEnd}
                        style={{ 
                            "--quantity": displayCompany.length,
                            transform: `perspective(1000px) rotateX(-8deg) rotateY(${rotation}deg)`,
                            cursor: isDragging ? 'grabbing' : 'grab'
                        }}
                    >
                        {displayCompany.map((item, index) => (
                            <div key={item.id} className="carousel-card" style={{ "--index": index }}>
                                <div className="carousel-image-container" onClick={() => handleViewDetailCompany(item)}>
                                    <div className="carousel-logo">
                                        <img
                                            alt={item.name}
                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item.logo}`}
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                                            draggable={false}
                                        />
                                    </div>
                                    <h3 className="carousel-name" style={{ pointerEvents: 'none' }}>{item.name}</h3>
                                    <div className="carousel-indicator">Xem chi tiết</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </Spin>
            </div>
        );
    }

    return (
        <div className={`${styles["company-section"]}`}>
            <div className={styles["company-content"]}>
                <Spin spinning={isLoading} tip="Đang tải...">
                    <Row gutter={[20, 20]}>
                        {displayCompany.length > 0 ? (
                            displayCompany.map((item) => (
                                <Col span={24} md={6} key={item.id}>
                                    <motion.div
                                        whileHover={{ y: -6, scale: 1.02 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        style={{ height: "100%" }}
                                    >
                                        <div
                                            onClick={() => handleViewDetailCompany(item)}
                                            style={{
                                                background: 'var(--card-bg)',
                                                borderRadius: 20,
                                                padding: '32px 24px',
                                                height: '100%',
                                                cursor: 'pointer',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: 'var(--shadow-md)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseOver={(e) => { 
                                                e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; 
                                                e.currentTarget.style.borderColor = 'var(--color-primary-soft)'; 
                                            }}
                                            onMouseOut={(e) => { 
                                                e.currentTarget.style.boxShadow = 'var(--shadow-md)'; 
                                                e.currentTarget.style.borderColor = '#e2e8f0'; 
                                            }}
                                        >
                                            <div style={{
                                                width: 100, height: 100, borderRadius: 24, background: '#f8fafc',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', padding: 12, marginBottom: 20
                                            }}>
                                                <img
                                                    alt={item.name}
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item.logo}`}
                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                />
                                            </div>
                                            <h3 style={{ 
                                                fontSize: 18, fontWeight: 700, color: 'var(--color-text)', textAlign: 'center', margin: 0, 
                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' 
                                            }}>
                                                {item.name}
                                            </h3>
                                        </div>
                                    </motion.div>
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
