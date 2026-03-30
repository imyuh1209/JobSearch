import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const IntroScreen = ({ onComplete }) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        // Đủ thời gian cho chuỗi animation siêu mượt
        const timer = setTimeout(() => {
            handleEnter();
        }, 1800);
        return () => clearTimeout(timer);
    }, []);

    const handleEnter = () => {
        if (!show) return;
        setShow(false);
        setTimeout(onComplete, 500); // Chờ animation exit kết thúc
    };

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 1.05 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
                position: 'fixed',
                inset: 0,
                background: '#0a0a0f', // Dark mode SaaS background
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
            onClick={handleEnter}
        >
            {/* Ambient Background Glow */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{
                    position: 'absolute',
                    width: '60vw',
                    height: '60vw',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 60%)',
                    filter: 'blur(100px)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}
            />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* 3D Animated Logo Container */}
                <motion.div
                    initial={{ scale: 0.6, opacity: 0, rotateY: 90 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 100, duration: 1 }}
                    style={{
                        width: 80, height: 80,
                        background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
                        borderRadius: 24,
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        boxShadow: '0 20px 40px rgba(99,102,241,0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
                        marginBottom: 30,
                        position: 'relative',
                        transformStyle: 'preserve-3d'
                    }}
                >
                    {/* Quầng sáng lưỡi liềm quay quanh logo */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        style={{ position: 'absolute', inset: -4, borderRadius: 28, background: 'conic-gradient(from 0deg, transparent 0 280deg, rgba(255,255,255,0.8) 360deg)', opacity: 0.5, filter: 'blur(4px)' }}
                    />
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 2 }}>
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </motion.div>

                {/* Text Reveal Animation */}
                <div style={{ overflow: 'hidden' }}>
                    <motion.h1
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            fontSize: '3.5rem',
                            fontWeight: 800,
                            letterSpacing: '-1.5px',
                            margin: 0,
                            background: 'linear-gradient(to right, #ffffff, #a5b4fc)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        JobHunter
                    </motion.h1>
                </div>

                <div style={{ overflow: 'hidden', marginTop: 12 }}>
                    <motion.p
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            fontSize: '1rem',
                            letterSpacing: '4px',
                            color: 'rgba(255,255,255,0.5)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            margin: 0
                        }}
                    >
                    </motion.p>
                </div>

                {/* Modern Loading Laser Line */}
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 140, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
                    style={{
                        height: 2,
                        background: 'linear-gradient(90deg, transparent, #818cf8, transparent)',
                        marginTop: 40,
                        borderRadius: 2
                    }}
                />
            </div>
        </motion.div>
    );
};

export default IntroScreen;
