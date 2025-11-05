import React, { useEffect, useState, useContext } from "react";
import { Card, Col, Row, Divider, Pagination, Spin, Empty, Form, Select, InputNumber, Button, Space, message, Input, Tag } from "antd";
import { fetchAllJobAPI, callSaveJob, callFetchSavedJobs, callUnsaveByJobId, callDeleteSavedJobBySavedId } from "../../../services/api.service";
import { isMobile } from "react-device-detect";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from '../../../styles/client.module.scss';
import { EnvironmentOutlined, ThunderboltOutlined, HeartOutlined, HeartFilled } from "@ant-design/icons";
import { buildQuery, LOCATION_LIST } from "../../../config/utils";
import parseSemanticQuery from "../../../utils/semanticQueryParser";
import { AuthContext } from "../../context/auth.context";
 


const JobCard = ({ showPagination = false }) => {
    const [displayJob, setDisplayJob] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const [keyword, setKeyword] = useState("");
    const [filters, setFilters] = useState({ level: "", location: "", salaryMin: null, salaryMax: null, companyName: "" });
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const [savedIds, setSavedIds] = useState(new Set());
    const [savedMap, setSavedMap] = useState(new Map()); // jobId -> savedId
    const [savingSet, setSavingSet] = useState(new Set()); // jobId đang xử lý
    const [semanticLoading, setSemanticLoading] = useState(false);

    const getLocationLabel = (code) => {
        if (!code) return "Không xác định";
        const normalized = String(code).trim().toUpperCase();
        const found = LOCATION_LIST.find((loc) => loc.value === normalized);
        if (found) return found.value === "ALL" ? "Toàn quốc" : found.label;
        return String(code);
    };

    useEffect(() => {
        fetchJobs();
    }, [current, pageSize, keyword, filters]);

    // Đọc tham số từ URL để đồng bộ từ khoá, bộ lọc và phân trang
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cat = (params.get("category") || "").trim();
        const level = (params.get("level") || "").trim();
        const loc = (params.get("location") || "").trim();
        const sMinRaw = params.get("salaryMin");
        const sMaxRaw = params.get("salaryMax");
        const company = (params.get("company") || "").trim();
        const sMin = sMinRaw !== null && sMinRaw !== "" ? Number(sMinRaw) : null;
        const sMax = sMaxRaw !== null && sMaxRaw !== "" ? Number(sMaxRaw) : null;
        const pageRaw = params.get("page");
        const sizeRaw = params.get("size");
        const page = pageRaw ? parseInt(pageRaw, 10) : 1;
        const size = sizeRaw ? parseInt(sizeRaw, 10) : 6;

        setKeyword(cat);
        setFilters({ level, location: loc, salaryMin: Number.isNaN(sMin) ? null : sMin, salaryMax: Number.isNaN(sMax) ? null : sMax, companyName: company });
        setCurrent(Number.isNaN(page) ? 1 : page);
        setPageSize(Number.isNaN(size) ? 6 : size);
        // Đồng bộ giá trị lên Form
        form.setFieldsValue({
            level: level || undefined,
            location: loc || undefined,
            salaryMin: Number.isNaN(sMin) ? undefined : sMin,
            salaryMax: Number.isNaN(sMax) ? undefined : sMax,
            companyName: company || undefined,
        });
    }, [location.search]);

    // Tải danh sách công việc đã lưu để hiển thị trạng thái
    useEffect(() => {
        const loadSaved = async () => {
            if (!user?.id) {
                setSavedIds(new Set());
                setSavedMap(new Map());
                return;
            }
            try {
                const res = await callFetchSavedJobs();
                const list = res?.data || [];
                const ids = new Set(list.map((i) => i.jobId));
                const map = new Map(list.map((i) => [i.jobId, i.id]));
                setSavedIds(ids);
                setSavedMap(map);
            } catch (e) {
                console.error("Không tải được danh sách đã lưu", e);
            }
        };
        loadSaved();
    }, [user?.id]);

    const fetchJobs = async () => {
        setIsLoading(true);
        const runQuery = async (page, size, pf) => {
            const q = buildQuery(page, size, pf, { sort: "updatedAt,desc" });
            return await fetchAllJobAPI(q);
        };

        try {
            // 1) Xây filters từ state hiện tại
            const baseFilters = {};
            if (keyword) baseFilters.name = keyword;
            if (filters.level) baseFilters.level = filters.level;
            if (filters.location && filters.location !== "ALL") baseFilters.location = filters.location;
            if (filters.salaryMin != null) baseFilters.salaryMin = filters.salaryMin;
            if (filters.salaryMax != null) baseFilters.salaryMax = filters.salaryMax;
            if (filters.companyName) baseFilters["company.name"] = filters.companyName;

            // 2) Truy vấn lần đầu với điều kiện đầy đủ
            let res = await runQuery(current, pageSize, baseFilters);
            let totalRes = res?.data?.meta?.total ?? 0;
            if (totalRes > 0) {
                setDisplayJob(res.data.result);
                setTotal(totalRes);
                setIsLoading(false);
                return;
            }

            // 3) Nếu không có kết quả, thử nới lỏng dần điều kiện
            const relaxSteps = [
                { desc: "bỏ 'Lương đến'", apply: (f) => { const { salaryMax, ...rest } = f; return rest; } },
                { desc: "bỏ 'Level'", apply: (f) => { const { level, ...rest } = f; return rest; } },
                { desc: "bỏ 'Địa điểm'", apply: (f) => { const { location, ...rest } = f; return rest; } },
                { desc: "bỏ 'Lương từ'", apply: (f) => { const { salaryMin, ...rest } = f; return rest; } },
                { desc: "chỉ lọc theo công ty", apply: (f) => {
                    const next = { ...f };
                    // keep only company filter if exists
                    const company = next["company.name"];
                    for (const k of Object.keys(next)) {
                        if (k !== "company.name") delete next[k];
                    }
                    return company ? { "company.name": company } : {};
                } },
                { desc: "chỉ lọc theo từ khoá", apply: (f) => (f.name ? { name: f.name } : {}) },
                { desc: "hiển thị tất cả công việc", apply: () => ({}) },
            ];

            for (const step of relaxSteps) {
                const nextFilters = step.apply(baseFilters);
                res = await runQuery(1, pageSize, nextFilters);
                totalRes = res?.data?.meta?.total ?? 0;
                if (totalRes > 0) {
                    setDisplayJob(res.data.result);
                    setTotal(totalRes);
                    // Thông báo để người dùng biết đã nới điều kiện
                    message.info(`Không có kết quả với điều kiện hiện tại, đã ${step.desc}.`);
                    setIsLoading(false);
                    return;
                }
            }

            // 4) Nếu vẫn không có kết quả, set rỗng
            setDisplayJob([]);
            setTotal(0);
        } catch (error) {
            console.error("Lỗi khi fetch dữ liệu:", error);
        }
        setIsLoading(false);
    };

    const handleSemanticSearch = async () => {
        try {
            setSemanticLoading(true);
            const q = form.getFieldValue("semanticQuery") || "";
            const parsed = parseSemanticQuery(q);
            const nextKeyword = parsed.keyword || "";
            const nextFilters = {
                level: parsed.level || "",
                location: parsed.location || "",
                salaryMin: parsed.salaryMin ?? null,
                salaryMax: parsed.salaryMax ?? null,
                companyName: parsed.companyName || "",
            };

            // Cập nhật form hiển thị để người dùng thấy các giá trị đã tách
            form.setFieldsValue({
                level: nextFilters.level || undefined,
                location: nextFilters.location || undefined,
                salaryMin: nextFilters.salaryMin ?? undefined,
                salaryMax: nextFilters.salaryMax ?? undefined,
                companyName: nextFilters.companyName || undefined,
            });

            if (!showPagination) {
                setKeyword(nextKeyword);
                setFilters(nextFilters);
                setCurrent(1);
            } else {
                updateURL({
                    keyword: nextKeyword,
                    level: nextFilters.level,
                    location: nextFilters.location,
                    salaryMin: nextFilters.salaryMin,
                    salaryMax: nextFilters.salaryMax,
                    companyName: nextFilters.companyName,
                    page: 1,
                });
                // Đồng bộ state ngay để UX mượt hơn
                setKeyword(nextKeyword);
                setFilters(nextFilters);
                setCurrent(1);
            }
        } catch (e) {
            message.error("Không thể phân tích câu tìm kiếm. Vui lòng thử lại.");
        } finally {
            setSemanticLoading(false);
        }
    };

    // Unified action: If có câu, phân tích & lọc; nếu không, dùng các trường filter hiện tại
    const handleUnifiedSearch = async () => {
        const q = (form.getFieldValue("semanticQuery") || "").trim();
        if (q) {
            await handleSemanticSearch();
            return;
        }
        const values = form.getFieldsValue([
            "level",
            "location",
            "salaryMin",
            "salaryMax",
            "companyName",
        ]);
        handleFilterSubmit(values);
    };

    // Cập nhật URL dựa trên state hiện tại và overrides
    const updateURL = (overrides = {}) => {
        const params = new URLSearchParams();
        const nextKeyword = overrides.keyword !== undefined ? overrides.keyword : keyword;
        const nextLevel = overrides.level !== undefined ? overrides.level : filters.level;
        const nextLocation = overrides.location !== undefined ? overrides.location : filters.location;
        const nextSalaryMin = overrides.salaryMin !== undefined ? overrides.salaryMin : filters.salaryMin;
        const nextSalaryMax = overrides.salaryMax !== undefined ? overrides.salaryMax : filters.salaryMax;
        const nextCompany = overrides.companyName !== undefined ? overrides.companyName : filters.companyName;
        const nextPage = overrides.page !== undefined ? overrides.page : current;
        const nextSize = overrides.size !== undefined ? overrides.size : pageSize;

        if (nextKeyword) params.set("category", nextKeyword);
        if (nextLevel) params.set("level", nextLevel);
        if (nextLocation) params.set("location", nextLocation);
        if (nextSalaryMin !== null && nextSalaryMin !== undefined && nextSalaryMin !== "") params.set("salaryMin", nextSalaryMin);
        if (nextSalaryMax !== null && nextSalaryMax !== undefined && nextSalaryMax !== "") params.set("salaryMax", nextSalaryMax);
        if (nextCompany) params.set("company", nextCompany);
        params.set("page", nextPage);
        params.set("size", nextSize);
        navigate(`/job?${params.toString()}`);
    };

    const handlePageChange = (page, size) => {
        if (!showPagination) {
            setCurrent(page);
            setPageSize(size);
            return;
        }
        updateURL({ page, size });
    };

    const handleViewDetailJob = (item) => {
        navigate(`/job/${item.id}`);
    };

    const toggleSaveJob = async (jobId, e) => {
        e?.stopPropagation?.();
        if (!user?.id) {
            message.error("Vui lòng đăng nhập để lưu công việc");
            navigate('/login');
            return;
        }
        try {
            setSavingSet(prev => {
                const next = new Set(prev);
                next.add(jobId);
                return next;
            });
            if (savedIds.has(jobId)) {
                const res = await callUnsaveByJobId(jobId);
                await refreshSavedState();
                message.success(res?.message || "Đã bỏ lưu");
            } else {
                const res = await callSaveJob(jobId);
                await refreshSavedState();
                message.success(res?.message || "Đã lưu công việc");
            }
        } catch (e) {
            message.error(e?.response?.data?.message || e?.response?.data?.error || "Có lỗi xảy ra");
        } finally {
            setSavingSet(prev => {
                const next = new Set(prev);
                next.delete(jobId);
                return next;
            });
        }
    };

    const refreshSavedState = async () => {
        try {
            const res = await callFetchSavedJobs();
            const list = res?.data || [];
            const ids = new Set(list.map((i) => i.jobId));
            const map = new Map(list.map((i) => [i.jobId, i.id]));
            setSavedIds(ids);
            setSavedMap(map);
        } catch (e) {
            console.error("Không tải được trạng thái lưu job", e);
        }
    };

    const handleFilterSubmit = (values) => {
        const { level, location, salaryMin, salaryMax, companyName } = values || {};
        if (!showPagination) {
            setFilters({
                level: level || "",
                location: location || "",
                salaryMin: salaryMin ?? null,
                salaryMax: salaryMax ?? null,
                companyName: companyName || "",
            });
            setCurrent(1);
            return;
        }
        updateURL({ level: level || "", location: location || "", salaryMin: salaryMin ?? null, salaryMax: salaryMax ?? null, companyName: companyName || "", page: 1 });
    };

    const handleResetFilters = () => {
        if (!showPagination) {
            setFilters({ level: "", location: "", salaryMin: null, salaryMax: null, companyName: "" });
            form.resetFields();
            setCurrent(1);
            return;
        }
        form.resetFields();
        // Chỉ giữ từ khóa (nếu có), reset page về 1 và bỏ các filters
        const params = new URLSearchParams(location.search);
        const cat = (params.get("category") || "").trim();
        const next = new URLSearchParams();
        if (cat) next.set("category", cat);
        next.set("page", "1");
        next.set("size", `${pageSize}`);
        navigate(`/job?${next.toString()}`);
    };

    return (
        <div className={styles["card-job-section"]}>
            <div className={styles["job-content"]}>
                <Spin spinning={isLoading} tip="Đang tải...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} className={isMobile ? "dflex-mobile" : "dflex-pc"}>
                                <span className="title">
                                    {keyword ? `Kết quả theo từ khoá: "${keyword}"` : "Việc Làm Mới Nhất"}
                                </span>
                                {!showPagination && <Link to="/job">Xem tất cả</Link>}
                            </div>
                        </Col>
                        {showPagination && (
                            <Col span={24}>
                                <Card size="small" style={{ marginTop: 8 }} className={styles["smart-search-card"]}>
                                    <Form form={form} layout="vertical" onFinish={handleFilterSubmit} className={styles["filter-grid"]}>
                                        <Row gutter={[8, 8]} align="middle">
                                            <Col xs={24} md={12} lg={8}>
                                                <Form.Item name="semanticQuery" label="Tìm kiếm thông minh" className={styles["smart-search"]}>
                                                    <Input
                                                        allowClear
                                                        placeholder="Ví dụ: React lương > 15tr ở HN Viettel"
                                                        onPressEnter={handleUnifiedSearch}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={12} lg={6}>
                                                <Form.Item name="companyName" label="Công ty">
                                                    <Input allowClear placeholder="Tên công ty" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12} md={6} lg={4}>
                                                <Form.Item name="level" label="Level">
                                                    <Select placeholder="Chọn level" allowClear>
                                                        <Select.Option value="INTERN">INTERN</Select.Option>
                                                        <Select.Option value="FRESHER">FRESHER</Select.Option>
                                                        <Select.Option value="JUNIOR">JUNIOR</Select.Option>
                                                        <Select.Option value="MIDDLE">MIDDLE</Select.Option>
                                                        <Select.Option value="SENIOR">SENIOR</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12} md={6} lg={4}>
                                                <Form.Item name="location" label="Địa điểm">
                                                    <Select placeholder="Chọn địa điểm" allowClear>
                                                        {LOCATION_LIST.map((loc) => (
                                                            <Select.Option key={loc.value} value={loc.value}>{loc.label}</Select.Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12} md={6} lg={4}>
                                                <Form.Item name="salaryMin" label="Lương từ">
                                                    <InputNumber min={0} step={1000000} placeholder="Min" style={{ width: "100%" }} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12} md={6} lg={4}>
                                                <Form.Item name="salaryMax" label="đến">
                                                    <InputNumber min={0} step={1000000} placeholder="Max" style={{ width: "100%" }} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={[8, 8]} style={{ marginTop: 6 }}>
                                            <Col span={24}>
                                                <Form.Item>
                                                    <Space wrap>
                                                        <Button type="primary" onClick={handleUnifiedSearch} loading={semanticLoading}>
                                                            Phân tích & Lọc
                                                        </Button>
                                                        <Button onClick={handleResetFilters}>Đặt lại</Button>
                                                    </Space>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Card>
                            </Col>
                        )}
                        {displayJob.length > 0 ? (
                            displayJob.map((item) => (
                                <Col span={24} md={12} key={item.id}>
                                    <Card size="small" title={null} hoverable
                                        onClick={() => handleViewDetailJob(item)}
                                    >
                                        <div className={styles["card-job-content"]}>
                                            <div className={styles["card-job-left"]}>
                                                <img
                                                    alt="example"
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.company?.logo}`}
                                                />
                                            </div>
                                            <div className={styles["card-job-right"]}>
                                                <div className={styles["job-title"]}>
                                                    {item.name}
                                                </div>
                                                {!!item.level && (
                                                    <div style={{ margin: "4px 0 6px" }}>
                                                        <Tag color="geekblue" style={{ borderRadius: 999, padding: "0 10px" }}>{item.level}</Tag>
                                                    </div>
                                                )}
                                                <div className={styles["job-location"]}><EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;{getLocationLabel(item.location)}</div>
                                                <div>
                                                    <ThunderboltOutlined style={{ color: 'orange' }} />&nbsp;
                                                    {(() => {
                                                        const fmt = (v) => ("" + (v ?? 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                                        const min = item?.salaryMin;
                                                        const max = item?.salaryMax;
                                                        if (min == null && max == null) return 'Thoả thuận';
                                                        if (min === max) return `${fmt(min)} đ`;
                                                        return `${fmt(min)} — ${fmt(max)} đ`;
                                                    })()}
                                                </div>
                                                
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                                            <Button
                                                type="text"
                                                icon={savedIds.has(item.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                                                onClick={(e) => toggleSaveJob(item.id, e)}
                                                loading={savingSet.has(item.id)}
                                                disabled={savingSet.has(item.id)}
                                            >
                                                {savedIds.has(item.id) ? "Đã lưu" : "Lưu"}
                                            </Button>
                                        </div>

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

export default JobCard;