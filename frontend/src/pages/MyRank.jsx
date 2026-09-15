import React, { useState, useEffect } from 'react';
import { Shield, Target, Trophy, Flame, Zap, ArrowUp, Star, X, Info } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { RANKS, calculateRank } from '../utils/rankUtils';
import { BADGES_CONFIG, parseUserBadges } from '../utils/badgeUtils';
import EmojiRankIcon from '../components/EmojiRankIcon';
import { getGamification } from '../services/examService';
import './MyRank.css';

const MyRank = () => {
  const { currentStudentId, isTeacher } = useRole();
  const [gamification, setGamification] = useState({ xp: 0, streak: 0, badges: [] });
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    if (currentStudentId) {
      // Tải dữ liệu từ Supabase hoặc cache
      getGamification(currentStudentId).then(data => {
        setGamification(data);
      });

      // Lắng nghe sự kiện cập nhật để render lại ngay lập tức
      const handleGamificationUpdated = async () => {
        const myGami = await getGamification(currentStudentId);
        setGamification(myGami);
      };
      
      window.addEventListener('gamification_updated', handleGamificationUpdated);
      return () => window.removeEventListener('gamification_updated', handleGamificationUpdated);
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
  
  const parsedBadges = parseUserBadges(gamification.badges || []);
  const badgesList = BADGES_CONFIG.map(b => ({
    ...b,
    ...parsedBadges[b.id]
  }));

  return (
    <div className="rank-page">
      <div className="rank-header">
        <div className="title-area">
          <h1>
            <Shield className="text-primary" size={28} />
            THÀNH TỰU & HUY HIỆU
          </h1>

        </div>
      </div>

      <div className="rank-content">
        {/* Khu vực Bậc Hiện Tại & Thanh Tiến Trình */}
        <div className="current-rank-card glass" style={{ borderColor: currentRank.color, boxShadow: `0 8px 32px ${currentRank.bg}` }}>
          <div className="rank-display">
            <div className="rank-icon-large" style={{ backgroundColor: 'transparent' }}>
              <EmojiRankIcon rank={currentRank} size={100} />
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
            <div className="badge-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
              {badgesList.map((b) => (
                <div 
                  key={b.id} 
                  className={`badge-item hover-lift ${!b.unlocked ? 'locked' : ''}`}
                  onClick={() => setSelectedBadge(b)}
                  style={{
                    filter: b.unlocked ? 'none' : 'grayscale(100%) opacity(0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'var(--bg-color)',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: `1px solid ${b.unlocked ? b.color + '40' : 'var(--border-color)'}`,
                    boxShadow: b.unlocked ? `0 4px 12px ${b.color}20` : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div className="badge-icon" style={{ fontSize: '32px', marginBottom: '8px' }}>
                    {b.icon}
                  </div>
                  <span className="badge-name" style={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: b.unlocked ? '600' : '500', color: b.unlocked ? b.color : 'var(--text-secondary)' }}>
                    {b.name}
                  </span>
                  {!b.unlocked && b.maxProgress > 1 && (
                    <div style={{ width: '100%', marginTop: '6px' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: '2px' }}>
                        {b.progress}/{b.maxProgress}
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${(b.progress / b.maxProgress) * 100}%`, height: '100%', background: b.color }}></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
                      backgroundColor: 'transparent',
                      border: 'none',
                      overflow: 'visible',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      filter: isPassed ? 'none' : 'grayscale(100%) opacity(50%)'
                    }}>
                      <EmojiRankIcon rank={rank} size={48} />
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

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="badge-modal-overlay" onClick={() => setSelectedBadge(null)}>
          <div className="badge-modal-content" onClick={e => e.stopPropagation()}>
            <button className="badge-modal-close" onClick={() => setSelectedBadge(null)}>
              <X size={20} />
            </button>
            <div className="badge-modal-header">
              <div 
                className="badge-modal-icon" 
                style={{ 
                  filter: selectedBadge.unlocked ? 'none' : 'grayscale(100%) opacity(0.8)'
                }}
              >
                {selectedBadge.icon}
              </div>
              <h2>{selectedBadge.name}</h2>
              <span 
                className="badge-modal-status" 
                style={{ 
                  color: selectedBadge.unlocked ? selectedBadge.color : 'var(--text-secondary)',
                  backgroundColor: selectedBadge.unlocked ? `${selectedBadge.color}15` : 'var(--bg-color)'
                }}
              >
                {selectedBadge.unlocked ? 'Đã Sở Hữu' : 'Chưa Đạt'}
              </span>
            </div>
            
            <div className="badge-modal-body">
              <div className="badge-modal-desc-box">
                <Info size={18} color="var(--primary-color)" />
                <p>{selectedBadge.description}</p>
              </div>
              
              {!selectedBadge.unlocked && (
                <div className="badge-modal-progress">
                  <div className="badge-modal-progress-header">
                    <span>Tiến độ hiện tại:</span>
                    <span style={{ color: selectedBadge.color, fontWeight: 'bold' }}>
                      {selectedBadge.progress} / {selectedBadge.maxProgress}
                    </span>
                  </div>
                  <div className="badge-modal-progress-bar">
                    <div 
                      className="badge-modal-progress-fill" 
                      style={{ 
                        width: `${(selectedBadge.progress / selectedBadge.maxProgress) * 100}%`,
                        backgroundColor: selectedBadge.color
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRank;
