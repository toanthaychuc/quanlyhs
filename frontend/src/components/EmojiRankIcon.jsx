import React from 'react';

const EmojiRankIcon = ({ rank, size = 32, style = {}, className = "" }) => {
  if (!rank) return null;
  
  // Scale everything relative to the size prop
  const fontSize = size * 0.6;
  const accessorySize = size * 0.35;
  
  return (
    <div 
      className={`emoji-rank-icon ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        display: 'inline-flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: rank.bg || 'transparent',
        borderRadius: '50%',
        position: 'relative',
        flexShrink: 0,
        boxShadow: rank.bg ? `0 2px 8px ${rank.color}40` : 'none',
        ...style 
      }}
      title={`Hạng: ${rank.name}`}
    >
      {rank.image ? (
        <img 
          src={rank.image} 
          alt={rank.name} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain', 
            mixBlendMode: 'multiply',
            borderRadius: '50%'
          }} 
        />
      ) : (
        <span style={{ fontSize: `${fontSize}px`, lineHeight: 1 }}>
          {rank.baseEmoji}
        </span>
      )}
    </div>
  );
};

export default EmojiRankIcon;
