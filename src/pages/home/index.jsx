import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CompanyCard from "../../components/client/card/company.card";
import JobCard from "../../components/client/card/job.card";
import HomeBannerCarousel from "../../components/client/banner/home.banner";

const SectionHeader = ({ badge, title, subtitle, linkTo, linkLabel }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
    <div>
      {badge && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.15)',
          borderRadius: 9999, padding: '4px 14px', marginBottom: 12
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f46e5', display: 'inline-block' }}></span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#4f46e5', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{badge}</span>
        </div>
      )}
      <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
        {title}
      </h2>
      {subtitle && <p style={{ margin: '8px 0 0', color: 'var(--color-text-secondary)', fontSize: 15 }}>{subtitle}</p>}
    </div>
    {linkTo && (
      <Link to={linkTo} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px',
        borderRadius: 9999, border: '1px solid var(--color-border)',
        fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)',
        textDecoration: 'none', transition: 'all 0.2s',
        background: 'var(--card-bg)',
      }}
      onMouseOver={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.background = 'rgba(79,70,229,0.04)'; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'var(--card-bg)'; }}
      >
        {linkLabel} <span style={{ fontSize: 16 }}>→</span>
      </Link>
    )}
  </div>
);



const HomePage = () => {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
      <HomeBannerCarousel />

      <div style={{ marginBottom: 60, position: 'relative', minHeight: 520, display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.06) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0 }}></div>
        <SectionHeader
          badge="Hàng đầu Việt Nam"
          title="Nhà Tuyển Dụng Nổi Bật"
          subtitle="Khám phá cơ hội từ các tập đoàn công nghệ hàng đầu"
          linkTo="/company"
          linkLabel="Xem tất cả"
        />
        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <CompanyCard isCarousel={true} />
        </div>
      </div>

      <div style={{ marginBottom: 80 }}>
        <SectionHeader
          badge="Cập nhật liên tục"
          title="Việc Làm Mới Nhất"
          subtitle="Hàng nghìn cơ hội đang chờ bạn khám phá mỗi ngày"
          linkTo="/job"
          linkLabel="Xem tất cả"
        />
        <JobCard />
      </div>

      {/* CTA Section */}
      <div style={{
        marginBottom: 80, borderRadius: 32, overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        padding: '60px 48px', textAlign: 'center', position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: '-30%', left: '20%', width: '30%', height: '80%', background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: '-0.03em' }}>
            Sẵn sàng bứt phá sự nghiệp?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 18, marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
            Tạo hồ sơ miễn phí và để nhà tuyển dụng tìm đến bạn.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              padding: '14px 36px', borderRadius: 9999, fontWeight: 700, fontSize: 16, textDecoration: 'none',
              background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
              color: '#fff', boxShadow: '0 4px 24px rgba(79,70,229,0.5)',
              transition: 'all 0.2s'
            }}>Đăng ký miễn phí</Link>
            <Link to="/job" style={{
              padding: '14px 36px', borderRadius: 9999, fontWeight: 700, fontSize: 16, textDecoration: 'none',
              background: 'rgba(255,255,255,0.08)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
            }}>Khám phá việc làm</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;