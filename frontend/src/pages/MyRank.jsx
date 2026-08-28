import React, { useState, useEffect } from 'react';
import { Shield, Target, Trophy, Flame, Zap, ArrowUp, Star } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { RANKS, calculateRank } from '../utils/rankUtils';
import './MyRank.css';

const MyRank = () => {
  const { currentStudentId, isTeacher } = useRole();
  const [gamification, setGamification] = useState({ xp: 0, streak: 0, badges: [] });

  useEffect(() => {
    if (currentStudentId) {
      const gamiKey = 'edumanager_gamification';
      const allGami = JSON.parse(localStorage.getItem(gamiKey) || '{}');
      setGamification(allGami[currentStudentId] || { xp: 0, streak: 0, badges: [] });
    }
  }, [currentStudentId]);

  if (isTeacher) {
    return (
      <div className="rank-page">
        <div className="empty-state">
          <h3>Tính năng dành cho học sinh</h3>
          <p>Hệ thống xếp hạng, huy hiệu và tiến trình XP được áp dụng cho từng cá nhân học sinh.</p>
        </div>
      </div>
    );
  }

  const { currentRank, nextRank, progressPercent, xpNeeded } = calculateRank(gamification.xp);

  return (
    <div className="rank-page">
      <div className="rank-header">
        <div className="title-area">
          <h1>
            <Shield className="text-primary" size={28} />
            Thành Tựu & Huy Hiệu
          </h1>
          <p className="subtitle">
            Theo dõi quá trình rèn luyện, tích luỹ kinh nghiệm và thăng hạng của bạn.
          </p>
        </div>
      </div>

      <div className="rank-content">
        {/* Khu vực Bậc Hiện Tại & Thanh Tiến Trình */}
        <div className="current-rank-card glass" style={{ borderColor: currentRank.color, boxShadow: `0 8px 32px ${currentRank.bg}` }}>
          <div className="rank-display">
            <div className="rank-icon-large" style={{ color: currentRank.color, backgroundColor: currentRank.bg, borderColor: currentRank.color }}>
              <img src={currentRank.icon} alt={currentRank.name} style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(5.5)' }} />
            </div>
            <div className="rank-info-main">
              <span className="rank-label">Bậc Hiện Tại</span>
              <h2 style={{ color: currentRank.color }}>{currentRank.name}</h2>
              <div className="xp-total">{gamification.xp} <span>XP</span></div>
            </div>
          </div>

          {nextRank ? (
            <div className="progress-section">
              <div className="progress-header">
                <span style={{ color: 'var(--text-secondary)' }}>Tiến trình tới <strong style={{ color: nextRank.color }}>{nextRank.name}</strong></span>
                <span className="xp-needed">Cần thêm {xpNeeded} XP</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill"
                  style={{ 
                    width: `${progressPercent}%`,
                    backgroundColor: nextRank.color,
                    boxShadow: `0 0 10px ${nextRank.color}`
                  }}
                ></div>
              </div>
              <div className="progress-footer">
                <span>{currentRank.name}</span>
                <span>{nextRank.name}</span>
              </div>
            </div>
          ) : (
            <div className="progress-section max-rank">
              <Trophy size={24} color="#fbbf24" />
              <h3>Bạn đã đạt bậc cao nhất!</h3>
              <p>Huyền thoại là đây. Hãy tiếp tục giữ vững phong độ nhé!</p>
            </div>
          )}
        </div>

        <div className="side-cards">
          {/* Huy hiệu cá nhân */}
          <div className="card my-badges-card">
            <h3><Star size={18} color="#f59e0b" /> Bộ Sưu Tập Huy Hiệu</h3>
            {gamification.badges && gamification.badges.length > 0 ? (
              <div className="badge-grid">
                {gamification.badges.map((b, i) => (
                  <div key={i} className="badge-item hover-lift">
                    <div className="badge-icon">
                      {b.includes('Tuyệt Đối') ? <Trophy size={20} color="#eab308" /> : 
                       b.includes('Tốc Độ') ? <Zap size={20} color="#3b82f6" /> : 
                       <Flame size={20} color="#ef4444" />}
                    </div>
                    <span className="badge-name">{b}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-badges">
                <p>Bạn chưa đạt huy hiệu nào.</p>
                <span className="hint">Hãy làm bài đạt 10 điểm, nộp sớm hoặc giữ chuỗi ngày để mở khoá!</span>
              </div>
            )}
          </div>
          
          {/* Lộ Trình Thăng Hạng */}
          <div className="card roadmap-card">
            <h3><ArrowUp size={18} color="var(--primary-color)" /> Lộ Trình Thăng Hạng</h3>
            <div className="roadmap-list">
              {RANKS.map((rank, index) => {
                const isCurrent = currentRank.id === rank.id;
                const isPassed = gamification.xp >= rank.minXP;
                
                return (
                  <div key={rank.id} className={`roadmap-item ${isCurrent ? 'current' : ''} ${isPassed ? 'passed' : 'locked'}`}>
                    <div className="roadmap-icon" style={{ 
                      backgroundColor: isPassed ? rank.color : 'var(--bg-color)',
                      color: isPassed ? 'white' : 'var(--text-secondary)',
                      border: `2px solid ${isPassed ? rank.color : 'var(--border-color)'}`,
                      overflow: 'hidden'
                    }}>
                      <img src={rank.icon} alt={rank.name} style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(4.5)', filter: isPassed ? 'none' : 'grayscale(100%) opacity(50%)' }} />
                    </div>
                    <div className="roadmap-details">
                      <h4 style={{ color: isPassed ? rank.color : 'var(--text-secondary)' }}>
                        {rank.name}
                        {isCurrent && <span className="current-tag">Hiện tại</span>}
                      </h4>
                      <span className="roadmap-xp">{rank.minXP} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRank;
