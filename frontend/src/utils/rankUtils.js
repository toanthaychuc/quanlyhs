const getIconUrl = (filename) => {
  return `${import.meta.env.BASE_URL}ranks/${filename}`;
};

export const RANKS = [
  { id: 'rank1', name: 'Trứng Cú Nhỏ', minXP: 0, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.2)', baseEmoji: '🥚', accessoryEmoji: null },
  { id: 'rank2', name: 'Cú Chập Chững', minXP: 500, color: '#fca5a5', bg: 'rgba(252, 165, 165, 0.2)', baseEmoji: '🦉', accessoryEmoji: '🎒' },
  { id: 'rank3', name: 'Cú Kính Cận', minXP: 1500, color: '#6ee7b7', bg: 'rgba(110, 231, 183, 0.2)', baseEmoji: '🦉', accessoryEmoji: '🤓' },
  { id: 'rank4', name: 'Cú Chăm Chỉ', minXP: 3000, color: '#fcd34d', bg: 'rgba(252, 211, 77, 0.2)', baseEmoji: '🦉', accessoryEmoji: '📖' },
  { id: 'rank5', name: 'Cú Thông Thái', minXP: 5000, color: '#93c5fd', bg: 'rgba(147, 197, 253, 0.2)', baseEmoji: '🦉', accessoryEmoji: '🎓' },
  { id: 'rank6', name: 'Cú Uyên Bác', minXP: 8000, color: '#c4b5fd', bg: 'rgba(196, 181, 253, 0.2)', baseEmoji: '🦉', accessoryEmoji: '✨' },
  { id: 'rank7', name: 'Cú Học Bá', minXP: 12000, color: '#f9a8d4', bg: 'rgba(249, 168, 212, 0.2)', baseEmoji: '🦉', accessoryEmoji: '🔮' },
  { id: 'rank8', name: 'Cú Thần Đồng', minXP: 16000, color: '#5eead4', bg: 'rgba(94, 234, 212, 0.2)', baseEmoji: '🦉', accessoryEmoji: '🪽' },
  { id: 'rank9', name: 'Cú Thủ Khoa', minXP: 20000, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)', baseEmoji: '🦉', accessoryEmoji: '👑' }
];

export const calculateRank = (xp) => {
  let currentRankIndex = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXP) {
      currentRankIndex = i;
    } else {
      break;
    }
  }
  
  const currentRank = RANKS[currentRankIndex];
  const nextRank = currentRankIndex < RANKS.length - 1 ? RANKS[currentRankIndex + 1] : null;
  
  let progressPercent = 100;
  let xpNeeded = 0;
  
  if (nextRank) {
    const xpInCurrentRank = xp - currentRank.minXP;
    const xpRequiredForNext = nextRank.minXP - currentRank.minXP;
    progressPercent = Math.min(100, Math.max(0, (xpInCurrentRank / xpRequiredForNext) * 100));
    xpNeeded = nextRank.minXP - xp;
  }

  return {
    currentRank,
    nextRank,
    progressPercent,
    xpNeeded
  };
};
