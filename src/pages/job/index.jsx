import JobCard from '../../components/client/card/job.card';

const JobPage = () => {
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
                    background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.15)',
                    borderRadius: 9999, padding: '4px 14px', marginBottom: 16
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f46e5', display: 'inline-block' }}></span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#4f46e5', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Khám phá cơ hội</span>
                </div>
                <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 12px', letterSpacing: '-0.03em' }}>
                    Tìm Kiếm Việc Làm
                </h1>
            </div>

            <JobCard showPagination={true} />
        </div>
    );
}

export default JobPage;