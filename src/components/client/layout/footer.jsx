import { Link } from "react-router-dom";
import { FacebookFilled, GithubOutlined, LinkedinFilled, MailOutlined, PhoneFilled } from "@ant-design/icons";
import { FloatButton } from "antd";

const Footer = () => {
  const year = new Date().getFullYear();

  const linkStyle = {
    color: 'rgba(255,255,255,0.45)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    transition: 'color 0.2s',
    display: 'block',
    marginBottom: 10,
  };

  return (
    <footer style={{
      background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      marginTop: 80,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '-40%', left: '20%', width: '35%', height: '80%', background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-30%', right: '10%', width: '30%', height: '60%', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr', gap: 48, marginBottom: 56 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎯</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>JobHunter</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.7, marginBottom: 28, maxWidth: 280 }}>
              Kết nối ứng viên tài năng với các công ty công nghệ hàng đầu. Nhanh chóng, tiện lợi và hiệu quả.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { icon: <FacebookFilled />, href: 'https://www.facebook.com/huytruong1209/', color: '#4267B2' },
                { icon: <LinkedinFilled />, href: 'https://www.linkedin.com/in/huy-tr%C6%B0%C6%A1ng-0525073b5/', color: '#0077B5' },
                { icon: <GithubOutlined />, href: 'https://github.com/imyuh1209', color: '#fff' },
              ].map((s, i) => (
                <a key={i} href={s.href} style={{
                  width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.5)', fontSize: 16, transition: 'all 0.2s', textDecoration: 'none',
                }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                >{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 20, letterSpacing: '-0.01em' }}>Trang web</h4>
            {[
              { label: 'Trang chủ', to: '/' },
              { label: 'Tìm việc làm', to: '/job' },
              { label: 'Công ty', to: '/company' },
              { label: 'Đăng nhập', to: '/login' },
              { label: 'Đăng ký', to: '/register' },
            ].map(l => (
              <Link key={l.to} to={l.to} style={linkStyle}
                onMouseOver={e => e.currentTarget.style.color = '#818cf8'}
                onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
              >{l.label}</Link>
            ))}
          </div>



          {/* Contact */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 20, letterSpacing: '-0.01em' }}>Liên hệ</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(79,70,229,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
                  <MailOutlined />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>huy12904@gmail.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
                  <PhoneFilled />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>0774 477 782</span>
              </div>
            </div>


          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '24px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
        }}>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>© {year} JobHunter. From HuyTruong with ❤️.</span>
        </div>
      </div>

      <FloatButton.BackTop
        style={{ right: 24, bottom: 24 }}
        tooltip="Về đầu trang"
        visibilityHeight={400}
      />
    </footer>
  );
};

export default Footer;
