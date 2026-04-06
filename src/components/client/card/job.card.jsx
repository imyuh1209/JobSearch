import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { Card, Col, Row, Divider, Pagination, Spin, Empty, Form, Select, InputNumber, Button, Space, message, Input, Tag } from "antd";
import { fetchAllJobAPI, callSaveJob, callFetchSavedJobs, callUnsaveByJobId, callDeleteSavedJobBySavedId, fetchAllCompanyAPI } from "../../../services/api.service";
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
    const [companies, setCompanies] = useState([]);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
    const [sort, setSort] = useState("updatedAt,desc");

    const getLocationLabel = (code) => {
        if (!code) return "Không xác định";
        const normalized = String(code).trim().toUpperCase();
        const found = LOCATION_LIST.find((loc) => loc.value === normalized);
        if (found) return found.value === "ALL" ? "Toàn quốc" : found.label;
        return String(code);
    };

    useEffect(() => {
        // Tự động gán tham số mặc định lên URL nếu chưa có
        const params = new URLSearchParams(location.search);
        if (!params.get('page')) {
            const next = new URLSearchParams(location.search);
            next.set("page", "1");
            next.set("size", "6");
            next.set("sort", "updatedAt,desc");
            navigate(`${location.pathname}?${next.toString()}`, { replace: true });
        }
    }, []);

        // Đọc thông số từ URL để đồng bộ từ khoá, bộ lọc và phân trang
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cat = (params.get("category") || "").trim();
        const q = (params.get("q") || "").trim();
        const keywordValue = cat || q;

        const level = (params.get("level") || "").trim();
        const loc = (params.get("location") || "").trim();
        const sMinRaw = params.get("salaryMin");
        const sMaxRaw = params.get("salaryMax");
        const company = (params.get("company") || "").trim();
        const sMin = sMinRaw !== null && sMinRaw !== "" ? Number(sMinRaw) : null;
        const sMax = sMaxRaw !== null && sMaxRaw !== "" ? Number(sMaxRaw) : null;
        const pageRaw = params.get("page");
        const sizeRaw = params.get("size");
        const sortRaw = params.get("sort") || "updatedAt,desc";
        const page = pageRaw ? parseInt(pageRaw, 10) : 1;
        const size = sizeRaw ? parseInt(sizeRaw, 10) : 6;

        const parsedFilters = {
            level,
            location: loc,
            salaryMin: Number.isNaN(sMin) ? null : sMin,
            salaryMax: Number.isNaN(sMax) ? null : sMax,
            companyName: company,
        };

        setKeyword(keywordValue);
        setFilters(parsedFilters);
        setCurrent(Number.isNaN(page) ? 1 : page);
        setPageSize(Number.isNaN(size) ? 6 : size);
        setSort(sortRaw);

        // Tái tạo câu tìm kiếm gốc để hiển thị lại trên ô Semantic Search
        const parts = [];
        if (keywordValue) parts.push(keywordValue);
        if (company) parts.push(`@${company}`);
        if (level) parts.push(level.toLowerCase());
        if (loc) parts.push(`tại ${loc}`);
        if (!Number.isNaN(sMin) && sMin) parts.push(`lương từ ${(sMin / 1_000_000).toLocaleString('vi')}tr`);
        if (!Number.isNaN(sMax) && sMax) parts.push(`đến ${(sMax / 1_000_000).toLocaleString('vi')}tr`);
        const reconstructed = parts.join(" ");

        form.setFieldsValue({
            semanticQuery: reconstructed || undefined,
            level: level || undefined,
            location: loc || undefined,
            salaryMin: Number.isNaN(sMin) ? undefined : sMin,
            salaryMax: Number.isNaN(sMax) ? undefined : sMax,
            companyName: company || undefined,
        });

        // Gọi fetch trực tiếp với giá trị đã parse — tránh stale-closure từ state chain
        runFetch(keywordValue, parsedFilters, Number.isNaN(page) ? 1 : page, Number.isNaN(size) ? 6 : size, sortRaw);
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

    useEffect(() => {
        const fetchCompanies = async () => {
            setIsLoadingCompanies(true);
            try {
                const res = await fetchAllCompanyAPI("size=10");
                if (res && res.data) {
                    setCompanies(res.data.result || []);
                }
            } catch (e) {
                console.error("Lỗi fetch công ty:", e);
            } finally {
                setIsLoadingCompanies(false);
            }
        };
        fetchCompanies();
    }, []);

    // runFetch nhận params ường mịnh — tránh stale-closure khi gọi từ URL effect
    const runFetch = async (kw, fil, page, size, srt = "updatedAt,desc") => {
        setIsLoading(true);
        const runQuery = async (p, s, pf) => {
            const q = buildQuery(p, s, pf, { sort: srt });
            return await fetchAllJobAPI(q);
        };

        try {
            // 1) Tìm theo tên việc làm
            const baseFilters = {};
            if (kw) baseFilters.name = kw;
            if (fil.level) baseFilters.level = fil.level;
            if (fil.location && fil.location !== "ALL") baseFilters.location = fil.location;
            if (fil.salaryMin != null) baseFilters.salaryMin = fil.salaryMin;
            if (fil.salaryMax != null) baseFilters.salaryMax = fil.salaryMax;
            if (fil.companyName) baseFilters["company.name"] = fil.companyName;

            let res = await runQuery(page, size, baseFilters);
            let totalRes = res?.data?.meta?.total ?? 0;
            if (totalRes > 0) {
                setDisplayJob(res.data.result);
                setTotal(totalRes);
                setIsLoading(false);
                return;
            }

            // 2) Nếu có keyword, thử tìm theo tên công ty
            if (kw && !fil.companyName) {
                const companyFilters = { "company.name": kw };
                if (fil.level) companyFilters.level = fil.level;
                if (fil.location && fil.location !== "ALL") companyFilters.location = fil.location;
                if (fil.salaryMin != null) companyFilters.salaryMin = fil.salaryMin;
                if (fil.salaryMax != null) companyFilters.salaryMax = fil.salaryMax;

                res = await runQuery(page, size, companyFilters);
                totalRes = res?.data?.meta?.total ?? 0;
                if (totalRes > 0) {
                    setDisplayJob(res.data.result);
                    setTotal(totalRes);
                    setIsLoading(false);
                    return;
                }
            }

            // 3) Nới lỏng dần điều kiện
            const relaxSteps = [
                { desc: "bỏ 'Lương đến'", apply: (f) => { const { salaryMax, ...rest } = f; return rest; } },
                { desc: "bỏ 'Level'", apply: (f) => { const { level, ...rest } = f; return rest; } },
                { desc: "bỏ 'Địa điểm'", apply: (f) => { const { location, ...rest } = f; return rest; } },
                { desc: "bỏ 'Lương từ'", apply: (f) => { const { salaryMin, ...rest } = f; return rest; } },
                {
                    desc: "chỉ lọc theo công ty", apply: (f) => {
                        const company = f["company.name"];
                        return company ? { "company.name": company } : null;
                    }
                },
                { desc: "chỉ lọc theo tên việc làm", apply: (f) => (f.name ? { name: f.name } : null) },
            ];


            for (const step of relaxSteps) {
                const nextFilters = step.apply(baseFilters);
                if (nextFilters === null) continue;
                res = await runQuery(1, size, nextFilters);
                totalRes = res?.data?.meta?.total ?? 0;
                if (totalRes > 0) {
                    setDisplayJob(res.data.result);
                    setTotal(totalRes);
                    message.info(`Không có kết quả chính xác, đã ${step.desc}.`);
                    setIsLoading(false);
                    return;
                }
            }

            setDisplayJob([]);
            setTotal(0);
        } catch (error) {
            console.error("Lỗi khi fetch dữ liệu:", error);
        }
        setIsLoading(false);
    };

    // Wrapper để giữ tương thích với các nơi khác gọi fetchJobs()
    const fetchJobs = () => runFetch(keyword, filters, current, pageSize, sort);

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
        const nextSort = overrides.sort !== undefined ? overrides.sort : sort;

        const next = new URLSearchParams(location.search);
        if (nextKeyword !== undefined) nextKeyword ? next.set("category", nextKeyword) : next.delete("category");
        if (nextLevel !== undefined) nextLevel ? next.set("level", nextLevel) : next.delete("level");
        if (nextLocation !== undefined) nextLocation ? next.set("location", nextLocation) : next.delete("location");
        if (nextSalaryMin !== undefined) (nextSalaryMin !== null && nextSalaryMin !== "") ? next.set("salaryMin", `${nextSalaryMin}`) : next.delete("salaryMin");
        if (nextSalaryMax !== undefined) (nextSalaryMax !== null && nextSalaryMax !== "") ? next.set("salaryMax", `${nextSalaryMax}`) : next.delete("salaryMax");
        if (nextCompany !== undefined) nextCompany ? next.set("company", nextCompany) : next.delete("company");
        
        next.set("page", `${nextPage}`);
        next.set("size", `${nextSize}`);
        if (nextSort) next.set("sort", nextSort);
        
        // Use current pathname instead of hardcoded /job
        navigate(`${location.pathname}?${next.toString()}`);
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
        form.resetFields();
        setKeyword("");
        setFilters({ level: "", location: "", salaryMin: null, salaryMax: null, companyName: "" });
        setSort("updatedAt,desc");
        setCurrent(1);
        if (!showPagination) return;
        // Xóa TOÀN BỘ query params, chỉ giữ lại size mặc định và đưa về trang 1
        navigate(location.pathname); 
    };

    return (
        <div className={styles["card-job-section"]}>
            <div className={styles["job-content"]}>
                <Spin spinning={isLoading} tip="Đang tải...">
                    {showPagination && (
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                                    {keyword ? `Kết quả: "${keyword}"` : "Tất cả công việc"}
                                </h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Sắp xếp:</span>
                                    <div id="sort-select" style={{ display: 'inline-block', width: 180 }}>
                                        <Select
                                            value={sort}
                                            style={{ width: '100%' }}
                                            onChange={(val) => updateURL({ sort: val, page: 1 })}
                                            options={[
                                                { label: "Mới nhất", value: "updatedAt,desc" },
                                                { label: "Lương cao nhất", value: "salary,desc" },
                                                { label: "Lương thấp nhất", value: "salary,asc" },
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: '24px 24px 8px 24px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)' }}>
                                <Form form={form} layout="vertical" onFinish={handleFilterSubmit} className={styles["filter-grid"]}>
                                    <Row gutter={[8, 8]} align="middle">
                                        <Col xs={24} md={12} lg={8}>
                                            <Form.Item name="semanticQuery" label="Tìm kiếm thông minh" className={styles["smart-search"]}>
                                                <Input
                                                    id="search-input-main"
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
                                                <div id="filter-level-dropdown" style={{ width: '100%' }}>
                                                    <Select placeholder="Chọn level" allowClear style={{ width: '100%' }}>
                                                        <Select.Option value="INTERN">INTERN</Select.Option>
                                                        <Select.Option value="FRESHER">FRESHER</Select.Option>
                                                        <Select.Option value="JUNIOR">JUNIOR</Select.Option>
                                                        <Select.Option value="MIDDLE">MIDDLE</Select.Option>
                                                        <Select.Option value="SENIOR">SENIOR</Select.Option>
                                                    </Select>
                                                </div>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} md={6} lg={4}>
                                            <Form.Item name="location" label="Địa điểm">
                                                <div id="filter-location-dropdown" style={{ width: '100%' }}>
                                                    <Select placeholder="Chọn địa điểm" allowClear style={{ width: '100%' }}>
                                                        {LOCATION_LIST.map((loc) => (
                                                            <Select.Option key={loc.value} value={loc.value}>{loc.label}</Select.Option>
                                                        ))}
                                                    </Select>
                                                </div>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} md={6} lg={4}>
                                            <Form.Item name="salaryMin" label="Lương từ">
                                                <InputNumber id="salary-min-input" min={0} step={1000000} placeholder="Min" style={{ width: "100%" }} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} md={6} lg={4}>
                                            <Form.Item name="salaryMax" label="đến">
                                                <InputNumber id="salary-max-input" min={0} step={1000000} placeholder="Max" style={{ width: "100%" }} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={[8, 8]} style={{ marginTop: 12 }}>
                                        <Col span={24}>
                                            <Form.Item>
                                                <Space wrap>
                                                    <Button type="primary" onClick={handleUnifiedSearch} loading={semanticLoading} style={{ background: 'linear-gradient(to right, #4f46e5, #6366f1)', border: 'none', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)', borderRadius: 8, fontWeight: 600 }}>
                                                        Phân tích & Tìm kiếm
                                                    </Button>
                                                    <Button onClick={handleResetFilters} style={{ borderRadius: 8, fontWeight: 500 }}>Đặt lại</Button>
                                                </Space>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </div>
                    )}

                    <Row gutter={[24, 24]}>
                        {/* Sidebar */}
                        {showPagination && !isMobile && (
                            <Col xs={0} md={6}>
                                <div style={{ position: 'sticky', top: 20 }}>
                                    <Card 
                                        title="Lọc theo công ty" 
                                        bordered={false} 
                                        className={styles["sidebar-card"]}
                                        style={{ borderRadius: 16, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}
                                    >
                                        <Spin spinning={isLoadingCompanies}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                {companies.map(c => (
                                                    <div 
                                                        key={c.id} 
                                                        onClick={() => {
                                                            form.setFieldValue("companyName", c.name);
                                                            handleFilterSubmit(form.getFieldsValue());
                                                        }}
                                                        style={{ 
                                                            display: 'flex', alignItems: 'center', gap: 12, 
                                                            padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            background: filters.companyName === c.name ? 'var(--color-primary-soft)' : 'transparent',
                                                            border: filters.companyName === c.name ? '1px solid var(--color-primary-border)' : '1px solid transparent'
                                                        }}
                                                        className={styles["company-sidebar-item"]}
                                                    >
                                                        <img 
                                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${c.logo}`} 
                                                            alt={c.name} 
                                                            style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 4, background: '#fff' }}
                                                        />
                                                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {c.name}
                                                        </span>
                                                    </div>
                                                ))}
                                                {companies.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" />}
                                                <Link to="/company" style={{ textAlign: 'center', marginTop: 8, fontSize: 13 }}>Xem tất cả công ty</Link>
                                            </div>
                                        </Spin>
                                    </Card>
                                </div>
                            </Col>
                        )}

                        {/* Main list */}
                        <Col xs={24} md={showPagination ? 18 : 24}>
                            <Row gutter={[20, 20]}>
                                {isLoading ? (
                                    Array(pageSize).fill(0).map((_, i) => (
                                        <Col span={24} lg={showPagination ? 12 : 8} key={`skeleton-${i}`}>
                                            <Card data-testid="job-skeleton" className={styles["liquid-glass-card"]} bordered={false}>
                                                <div style={{ display: 'flex', gap: 20 }}>
                                                    <div style={{ width: 80, height: 80, borderRadius: 16, background: 'rgba(255,255,255,0.05)' }}></div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ width: '40%', height: 12, background: 'rgba(255,255,255,0.05)', marginBottom: 8 }}></div>
                                                        <div style={{ width: '80%', height: 20, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }}></div>
                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                            <div style={{ width: 60, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.05)' }}></div>
                                                            <div style={{ width: 80, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.05)' }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Col>
                                    ))
                                ) : displayJob.length > 0 ? (
                                    displayJob.map((item) => (
                                        <Col span={24} lg={showPagination ? 12 : 8} key={item.id}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4 }}
                                                className={styles["liquid-glass-card"]}
                                                onClick={() => handleViewDetailJob(item)}
                                            >
                                                {/* Heart Icon */}
                                                <div 
                                                    style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div
                                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, cursor: 'pointer' }}
                                                        onClick={(e) => !savingSet.has(item.id) && toggleSaveJob(item.id, e)}
                                                    >
                                                        {savingSet.has(item.id) ? (
                                                            <Spin size="small" />
                                                        ) : savedIds.has(item.id) ? (
                                                            <HeartFilled style={{ color: '#f43f5e', fontSize: 18 }} />
                                                        ) : (
                                                            <HeartOutlined style={{ fontSize: 18, color: 'var(--color-text-secondary)' }} />
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Content... */}
                                                <div style={{ display: 'flex', gap: 20, flex: 1 }}>
                                                    <div className={styles["glass-logo-box"]}>
                                                        <img
                                                            alt={item?.company?.name}
                                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.company?.logo}`}
                                                        />
                                                    </div>

                                                    <div style={{ flex: 1, minWidth: 0, paddingRight: 32 }}>
                                                        <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>
                                                            {item?.company?.name || 'Công ty ẩn danh'}
                                                        </div>
                                                        <h3 style={{
                                                            fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 12, lineHeight: 1.4,
                                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                                        }}>
                                                            {item.name}
                                                        </h3>

                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                                                            {!!item.level && (
                                                                <span style={{ 
                                                                    background: 'var(--color-primary-soft)', color: 'var(--color-primary)', 
                                                                    padding: '4px 10px', border: '1px solid var(--color-primary-border)', 
                                                                    borderRadius: 6, fontSize: 11, fontWeight: 700
                                                                }}>
                                                                    {item.level}
                                                                </span>
                                                            )}
                                                            <span style={{ 
                                                                background: 'var(--color-bg-soft)', color: 'var(--color-text-secondary)', 
                                                                padding: '4px 10px', border: '1px solid var(--color-border)', 
                                                                borderRadius: 6, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 
                                                            }}>
                                                                <EnvironmentOutlined style={{ fontSize: 12 }} /> {getLocationLabel(item.location)}
                                                            </span>
                                                        </div>

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-success)', fontWeight: 800, fontSize: 16 }}>
                                                            <ThunderboltOutlined style={{ color: 'var(--color-warning)' }} />
                                                            {(() => {
                                                                const fmt = (v) => {
                                                                    const num = Number(v || 0);
                                                                    if (num >= 1000000) return `${(num / 1000000).toLocaleString('en-US')} triệu`;
                                                                    return `${num.toLocaleString('en-US')} đ`;
                                                                };
                                                                const min = item?.salaryMin;
                                                                const max = item?.salaryMax;
                                                                if ((min == null && max == null) || (min === 0 && max === 0)) return 'Thoả thuận';
                                                                if (min === max) return `${fmt(min)}`;
                                                                return `${fmt(min)} — ${fmt(max)}`;
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Col>
                                    ))
                                ) : (
                                    <Col span={24}>
                                        <div style={{ textAlign: 'center', padding: '40px 0', background: 'var(--card-bg)', borderRadius: 16 }}>
                                            <div id="empty-message-text" style={{ fontSize: 18, color: 'var(--color-text-secondary)' }}>Không có dữ liệu</div>
                                        </div>
                                    </Col>
                                )}
                            </Row>

                            {showPagination && (
                                <div id="job-pagination-wrapper">
                                    <Row style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
                                        <Pagination
                                            current={current}
                                            total={total}
                                            pageSize={pageSize}
                                            responsive
                                            onChange={handlePageChange}
                                        />
                                    </Row>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Spin>
            </div>
        </div>
    );
};

export default JobCard;