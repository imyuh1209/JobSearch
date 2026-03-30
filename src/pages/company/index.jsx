import CompanyCard from "../../components/client/card/company.card";

const CompanyPage = () => {
    return (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
            {/* Page Header */}
            <div style={{
                paddingTop: 120, paddingBottom: 48,
                borderBottom: '1px solid var(--color-border)',
                marginBottom: 48
            }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: 9999, padding: '4px 14px', marginBottom: 16
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Nhà tuyển dụng</span>
                </div>
                <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 12px', letterSpacing: '-0.03em' }}>
                    Các Công Ty Hàng Đầu
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 16, margin: 0, maxWidth: 540 }}>
                    Khám phá văn hóa, môi trường làm việc và cơ hội tuyển dụng từ 2,500+ doanh nghiệp công nghệ.
                </p>
            </div>

            <CompanyCard showPagination={true} />
        </div>
    );
}

export default CompanyPage;