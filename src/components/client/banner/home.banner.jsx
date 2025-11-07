import React, { useEffect, useRef, useState } from 'react';
import { Carousel, Card, Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { callFetchHomeBanners } from '../../../services/api.service';

const resolveBannerImageUrl = (backend, banner) => {
  const imageUrl = banner?.imageUrl || banner?.imagePath || banner?.image;
  if (!imageUrl) return '';
  // Absolute
  if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) return imageUrl;
  // Already a path (e.g. /storage/banner/xxx or storage/banner/xxx)
  if (typeof imageUrl === 'string') {
    const normalized = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    // If looks like a filename (no slash), assume storage folder
    const isFileNameOnly = !imageUrl.includes('/');
    if (isFileNameOnly) return `${backend}/storage/banner/${imageUrl}`;
    return `${backend}${normalized}`;
  }
  return '';
}

const HomeBannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const carouselRef = useRef(null);
  const backend = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await callFetchHomeBanners();
        // Interceptor returns response.data, so res is the body
        // Support multiple shapes: array, { data: [] }, { data: { result: [] } }, { result: [] }
        const arr = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.result)
              ? res.data.result
              : Array.isArray(res?.result)
                ? res.result
                : [];
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

  if (loading) {
    return <Card style={{ borderRadius: 12 }}><Spin /></Card>;
  }

  if (!banners || banners.length === 0) {
    // Fallback banner
    return (
      <div
        style={{
          background: 'linear-gradient(90deg, #1d2938 0%, #0a6cff 100%)',
          color: '#fff',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 600 }}>Khám phá công việc phù hợp hôm nay</div>
        <div style={{ opacity: 0.9 }}>Banner đang cập nhật…</div>
      </div>
    );
  }

  return (
    <Card bodyStyle={{ padding: 0 }} style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
      <Carousel autoplay dots ref={carouselRef}>
        {banners.map((b) => {
          const href = b?.link || '#';
          const src = resolveBannerImageUrl(backend, b);
          const title = b?.title || 'Banner';
          return (
            <a key={`${b.id || src || Math.random()}`} href={href} target="_blank" rel="noreferrer">
              {src ? (
                <img
                  src={src}
                  alt={title}
                  style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa' }}>
                  {title}
                </div>
              )}
            </a>
          );
        })}
      </Carousel>
      {banners.length > 1 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            transform: 'translateY(-50%)',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 8px',
            pointerEvents: 'none'
          }}
          aria-hidden="false"
        >
          <button
            type="button"
            onClick={() => carouselRef.current?.prev?.()}
            title="Banner trước"
            aria-label="Banner trước"
            style={{
              pointerEvents: 'auto',
              background: 'rgba(0,0,0,0.45)',
              border: 'none',
              color: '#fff',
              width: 36,
              height: 36,
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <LeftOutlined />
          </button>
          <button
            type="button"
            onClick={() => carouselRef.current?.next?.()}
            title="Banner tiếp theo"
            aria-label="Banner tiếp theo"
            style={{
              pointerEvents: 'auto',
              background: 'rgba(0,0,0,0.45)',
              border: 'none',
              color: '#fff',
              width: 36,
              height: 36,
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <RightOutlined />
          </button>
        </div>
      )}
    </Card>
  );
};

export default HomeBannerCarousel;