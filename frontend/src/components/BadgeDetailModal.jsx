import React, { useEffect } from 'react';
import { X, Info } from 'lucide-react';
import './BadgeDetailModal.css';

const BadgeDetailModal = ({ badge, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!badge) return null;

  return (
    <div className="badge-modal-overlay" onClick={onClose}>
      <div className="badge-modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          className="badge-modal-close" 
          onClick={onClose}
          aria-label="Đóng"
          type="button"
        >
          <X size={20} />
        </button>

        <div className="badge-modal-header">
          <div 
            className="badge-modal-icon" 
            style={{ 
              filter: badge.unlocked ? 'none' : 'grayscale(100%) opacity(0.8)'
            }}
          >
            {badge.icon}
          </div>
          <h2>{badge.name}</h2>
          <span 
            className="badge-modal-status" 
            style={{ 
              color: badge.unlocked ? (badge.color || 'var(--primary-color)') : 'var(--text-secondary)',
              backgroundColor: badge.unlocked 
                ? (badge.color ? `${badge.color}1a` : 'rgba(59, 130, 246, 0.15)') 
                : 'rgba(255, 255, 255, 0.06)'
            }}
          >
            {badge.unlocked ? 'Đã Sở Hữu' : 'Chưa Đạt'}
          </span>
        </div>
        
        <div className="badge-modal-body">
          <div className="badge-modal-desc-box">
            <Info size={18} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p>{badge.description}</p>
          </div>
          
          {!badge.unlocked && badge.maxProgress > 1 && (
            <div className="badge-modal-progress">
              <div className="badge-modal-progress-header">
                <span>Tiến độ hiện tại:</span>
                <span style={{ color: badge.color || 'var(--primary-color)', fontWeight: 'bold' }}>
                  {badge.progress || 0} / {badge.maxProgress}
                </span>
              </div>
              <div className="badge-modal-progress-bar">
                <div 
                  className="badge-modal-progress-fill" 
                  style={{ 
                    width: `${Math.min(100, Math.max(0, ((badge.progress || 0) / badge.maxProgress) * 100))}%`,
                    backgroundColor: badge.color || 'var(--primary-color)'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BadgeDetailModal;
