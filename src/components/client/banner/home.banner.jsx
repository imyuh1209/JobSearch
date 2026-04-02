import React, { useEffect, useRef, useState } from 'react';
import { Carousel, Card, Spin, Input, Button } from 'antd';
import { motion } from 'framer-motion';
import { LeftOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons';
import styles from '../../../styles/client.module.scss';
import { callFetchHomeBanners } from '../../../services/api.service';
import { useNavigate } from 'react-router-dom';
import parseSemanticQuery from '../../../utils/semanticQueryParser';

const { Search } = Input;

const resolveBannerImageUrl = (backend, banner) => {
  const imageUrl = banner?.imageUrl || banner?.imagePath || banner?.image;
  if (!imageUrl) return '';
  if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) return imageUrl;
  if (typeof imageUrl === 'string') {
    const normalized = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    const isFileNameOnly = !imageUrl.includes('/');
    if (isFileNameOnly) return `${backend}/storage/banner/${imageUrl}`;
    return `${backend}${normalized}`;
  }
  return '';
}

const HomeBannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const carouselRef = useRef(null);
  const backend = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await callFetchHomeBanners();
        const arr = Array.isArray(res)
          ? res : Array.isArray(res?.data)
            ? res.data : Array.isArray(res?.data?.result)
              ? res.data.result : Array.isArray(res?.result)
                ? res.result : [];
        setBanners(arr);
      } catch (e) {
        console.error('Fetch banners error', e);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const onSearchCategory = (value) => {
    const v = (value || "").trim();
    if (!v) return;

    // Áp dụng bộ tìm kiếm thông minh (Semantic Parser)
    const parsed = parseSemanticQuery(v);
    const params = new URLSearchParams();

    // Ánh xạ từ khoá và bộ lọc sang Query params để trang JobCard đọc
    if (parsed.keyword) params.set("category", parsed.keyword);
    else if (v && !parsed.level && !parsed.location && !parsed.salaryMin && !parsed.companyName) {
      // Fallback nếu câu không parse được gì
      params.set("category", v);
    }

    if (parsed.level) params.set("level", parsed.level);
    if (parsed.location) params.set("location", parsed.location);
    if (parsed.salaryMin) params.set("salaryMin", parsed.salaryMin);
    if (parsed.salaryMax) params.set("salaryMax", parsed.salaryMax);
    if (parsed.companyName) params.set("company", parsed.companyName);

    navigate(`/job?${params.toString()}`);
  };

  if (loading) {
    return <Card style={{ borderRadius: 16, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin size="large" /></Card>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div style={{
        marginBottom: 60,
        marginTop: 100, // accommodate fixed header
        borderRadius: 36,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: "0 40px 80px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)",
        height: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(120% 120% at 50% -10%, #6b21a8 0%, #1e1b4b 40%, #050510 100%)' // Premium Deep Space radial
      }}>
        {/* Glow Effects (Mesh alternatives) */}
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none'
        }}></div>
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%', width: '60%', height: '60%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none'
        }}></div>
        <div style={{
          position: 'absolute', top: '20%', right: '20%', width: '30%', height: '30%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none'
        }}></div>

        {/* Mesh Background Pattern (dot grid) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px', pointerEvents: 'none',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
        }}></div>

        {/* Centered Search Content */}
        <div style={{
          position: 'relative', zIndex: 10, width: '100%', maxWidth: 860, textAlign: 'center', padding: '0 20px'
        }}>
          <h1 style={{
            color: '#fff', fontSize: 'clamp(3.5rem, 6vw, 4.5rem)', fontWeight: 800, marginBottom: 16,
            letterSpacing: '-0.04em', lineHeight: 1.1,
            textShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            Khám phá cơ hội<br />
            <span style={{
              background: 'linear-gradient(110deg, #a78bfa 0%, #c084fc 40%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              display: 'inline-block', paddingBottom: '0.1em'
            }}>
              Tìm kiếm việc làm
            </span>
          </h1>
          <p style={{
            color: '#94a3b8', fontSize: 'clamp(1.1rem, 2vw, 1.25rem)', marginBottom: 48, fontWeight: 400,
            maxWidth: 640, margin: '0 auto 48px', lineHeight: 1.6
          }}>
            Hệ sinh thái kết nối công việc. Sẵn sàng bứt phá thu nhập cùng các tập đoàn hàng đầu.
          </p>

          <div className={styles.poda}>
            <div className={styles.glow_layer} />
            <div className={styles.darkBorderBg} />
            <div className={styles.white_layer} />
            <div className={styles.border_layer} />
            <div className={styles.main_search}>
              <div className={styles.search_icon_box}>
                <SearchOutlined />
              </div>
              <input
                type="text"
                className={styles.input}
                placeholder="Nhập tên công việc, công ty, vị trí..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSearchCategory(keyword);
                }}
              />
              <div className={styles.input_mask} />
              <div className={styles.pink_mask} />
              <div className={styles.filterBorder} />
              <button
                className={styles.filter_icon_btn}
                onClick={() => onSearchCategory(keyword)}
              >
                <SearchOutlined style={{ fontSize: 20 }} />
              </button>
            </div>
          </div>



        </div>
      </div>
    </motion.div>
  );
};

export default HomeBannerCarousel;