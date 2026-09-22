import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LogoIntroSplash.css';

const MATH_SYMBOLS = [
  { symbol: 'π', top: '18%', left: '15%', size: '1.8rem', delay: 0 },
  { symbol: '∑', top: '22%', right: '18%', size: '2rem', delay: 0.2 },
  { symbol: '∫', bottom: '25%', left: '20%', size: '2.2rem', delay: 0.4 },
  { symbol: '∞', bottom: '20%', right: '22%', size: '1.7rem', delay: 0.1 },
  { symbol: 'f(x)', top: '35%', left: '10%', size: '1.3rem', delay: 0.3 },
  { symbol: 'lim', bottom: '38%', right: '12%', size: '1.2rem', delay: 0.5 },
  { symbol: '∆', top: '15%', right: '35%', size: '1.4rem', delay: 0.25 },
  { symbol: '√x', bottom: '15%', left: '38%', size: '1.5rem', delay: 0.35 }
];

const LogoIntroSplash = ({ onRadiate, onFinish }) => {
  const [isRadiating, setIsRadiating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Kích hoạt hiệu ứng "tỏa ra" để chuyển cảnh vào trang web
  const triggerRadiate = () => {
    if (isRadiating) return;
    setIsRadiating(true);
    if (onRadiate) onRadiate();

    // Thời gian hiệu ứng sóng tỏa bùng nổ trước khi unmount hoàn toàn
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 350);
    }, 850);
  };

  useEffect(() => {
    // Tự động kích hoạt hiệu ứng tỏa ra sau 1.6s nếu người dùng chưa bấm
    const timer = setTimeout(() => {
      triggerRadiate();
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  if (isExiting) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className={`logo-intro-overlay ${isRadiating ? 'is-radiating' : ''}`}
        onClick={triggerRadiate}
        initial={false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.35 } }}
      >
        {/* Nền hạt ký hiệu toán học bay lơ lửng */}
        <div className="math-ambient-grid">
          {MATH_SYMBOLS.map((item, index) => (
            <motion.span
              key={index}
              className="math-symbol-floating"
              style={{
                top: item.top,
                bottom: item.bottom,
                left: item.left,
                right: item.right,
                fontSize: item.size
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ 
                opacity: [0.08, 0.22, 0.08],
                y: [0, -12, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: item.delay,
                ease: "easeInOut"
              }}
            >
              {item.symbol}
            </motion.span>
          ))}
        </div>

        {/* Quầng sáng ambient ở trung tâm */}
        <div className="ambient-center-glow"></div>

        {/* Khối hiệu ứng sóng tỏa ra (Radiating Shockwave Rings) */}
        {isRadiating && (
          <div className="shockwave-container">
            <motion.div 
              className="shockwave-ring ring-1"
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 12, opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.15, 0.85, 0.35, 1] }}
            />
            <motion.div 
              className="shockwave-ring ring-2"
              initial={{ scale: 0.6, opacity: 0.9 }}
              animate={{ scale: 16, opacity: 0 }}
              transition={{ duration: 1.05, delay: 0.1, ease: [0.15, 0.85, 0.35, 1] }}
            />
            <motion.div 
              className="shockwave-ring ring-3"
              initial={{ scale: 0.4, opacity: 0.8 }}
              animate={{ scale: 20, opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.15, 0.85, 0.35, 1] }}
            />
            <motion.div 
              className="shockwave-flash"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 5, 8], opacity: [0, 1, 0] }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
        )}

        {/* Vòng hào quang gợn sóng tuần hoàn trước khi tỏa (Breathing Ripple Rings) */}
        {!isRadiating && (
          <div className="breathing-rings-wrapper">
            <div className="breath-ring ring-a"></div>
            <div className="breath-ring ring-b"></div>
          </div>
        )}

        {/* Cụm trung tâm: Logo LC + Tên thương hiệu */}
        <motion.div 
          className="intro-center-stage"
          initial={{ scale: 0.7, opacity: 0, y: 30 }}
          animate={isRadiating ? {
            scale: 2.8,
            opacity: 0,
            filter: 'blur(10px)',
            transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] }
          } : {
            scale: 1,
            opacity: 1,
            y: 0,
            transition: { 
              type: "spring", 
              damping: 18, 
              stiffness: 140,
              duration: 0.8 
            }
          }}
        >
          {/* Logo LC Emblem */}
          <div className="intro-emblem-wrapper">
            <div className="intro-emblem">
              <span className="emblem-text">LC</span>
              <div className="emblem-shine"></div>
            </div>
            <div className="emblem-glow-behind"></div>
          </div>

          {/* Dòng chữ: Toán thầy Công Chức */}
          <motion.div 
            className="intro-brand-wrapper"
            initial={{ opacity: 0, y: 15 }}
            animate={isRadiating ? {
              opacity: 0,
              y: -10,
              transition: { duration: 0.3 }
            } : {
              opacity: 1,
              y: 0,
              transition: { delay: 0.25, duration: 0.6 }
            }}
          >
            <h1 className="intro-brand-title">Toán thầy Công Chức</h1>
            <p className="intro-brand-sub">Kỷ luật mỗi ngày · Làm chủ phòng thi</p>
          </motion.div>

          {/* Gợi ý chạm để vào ngay */}
          <motion.div 
            className="intro-tap-hint"
            initial={{ opacity: 0 }}
            animate={isRadiating ? { opacity: 0 } : { opacity: [0, 0.75, 0.4] }}
            transition={{ delay: 0.5, duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          >
            <span>✦ Chạm để vào ngay ✦</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LogoIntroSplash;
