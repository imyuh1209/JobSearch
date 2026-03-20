import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const IntroScreen = ({ onComplete }) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        // Fast entry for performance
        const timer = setTimeout(() => {
            handleEnter();
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleEnter = () => {
        setShow(false);
        setTimeout(onComplete, 300); // Quick fast exit
    };

    // Bubble animation variants
    const bubbleVariants = {
        initial: { y: "120vh", opacity: 0 },
        animate: (i) => ({
            y: "-20vh",
            opacity: [0, 0.4, 0],
            transition: {
                repeat: Infinity,
                duration: 3 + Math.random() * 4, // Faster bubbles
                delay: Math.random() * 1,
                ease: "linear"
            }
        })
    };

    return (
        <motion.div
            initial={{ y: 0 }}
            animate={{ y: show ? 0 : "-100%" }}
            transition={{ duration: 0.4, ease: "easeIn" }} // Quick slide up
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'linear-gradient(180deg, #001529 0%, #003a8c 50%, #0077b6 100%)', // Deep Sea Blue Gradient
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
            {/* Animated Background Bubbles */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    custom={i}
                    variants={bubbleVariants}
                    initial="initial"
                    animate="animate"
                    style={{
                        position: 'absolute',
                        left: `${Math.random() * 100}%`,
                        width: `${10 + Math.random() * 40}px`,
                        height: `${10 + Math.random() * 40}px`,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(2px)'
                    }}
                />
            ))}

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                style={{ textAlign: 'center', zIndex: 10, padding: '0 20px' }}
            >
                <div style={{
                    width: '90px', height: '90px', margin: '0 auto 24px',
                    background: 'rgba(255,255,255,0.1)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                </div>

                <h1 style={{
                    fontSize: 'min(3.5rem, 12vw)',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    fontFamily: "'Montserrat', sans-serif",
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    background: 'linear-gradient(to right, #ffffff, #b3e0ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.3))'
                }}>
                    Job Hunter
                </h1>

                <div style={{ width: '60px', height: '3px', background: '#4dacff', margin: '0 auto 16px', borderRadius: '2px' }}></div>

                <p style={{
                    fontSize: '1rem',
                    letterSpacing: '3px',
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: 400,
                    textTransform: 'uppercase'
                }}>
                    Professional Recruitment Platform
                </p>
            </motion.div>
        </motion.div>
    );
};

export default IntroScreen;
