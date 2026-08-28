import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { calculateRank } from '../utils/rankUtils';

const StudentName = ({ studentId, name, showRank = true, style, className }) => {
  const [rank, setRank] = useState(null);
  const [streak, setStreak] = useState(0);

  const loadData = () => {
    if (showRank && studentId) {
      const gamiData = JSON.parse(localStorage.getItem('edumanager_gamification') || '{}');
      const xp = gamiData[studentId]?.xp || 0;
      setRank(calculateRank(xp).currentRank);
      setStreak(gamiData[studentId]?.streak || 0);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('gamification_updated', handleUpdate);
    return () => window.removeEventListener('gamification_updated', handleUpdate);
  }, [studentId, showRank]);

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', ...style }}>
      <span>{name}</span>
      {streak >= 2 && (
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '2px', 
          color: '#f97316', 
          fontWeight: 'bold', 
          fontSize: '0.85em',
          backgroundColor: '#ffedd5',
          padding: '2px 6px',
          borderRadius: '12px'
        }} title={`${streak} ngày đăng nhập liên tiếp`}>
          <Flame size={14} fill="#f97316" />
          {streak}
        </span>
      )}
      {rank && (
        <span style={{ 
          width: '32px', 
          height: '32px', 
          display: 'inline-flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          overflow: 'hidden',
          borderRadius: '50%',
          flexShrink: 0,
          marginLeft: '4px'
        }}>
          <img 
            src={rank.icon} 
            alt={rank.name} 
            title={`Hạng: ${rank.name}`}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain', 
              transform: 'scale(5)',
              filter: `drop-shadow(0 0 2px ${rank.color}) drop-shadow(0 0 6px ${rank.color})`
            }} 
          />
        </span>
      )}
    </span>
  );
};

export default StudentName;
