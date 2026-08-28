const getIconUrl = (filename) => {
  return `${import.meta.env.BASE_URL}ranks/${filename}`;
};

export const RANKS = [
  { id: 'iron', name: 'Sắt', minXP: 0, color: '#a19d94', bg: 'rgba(161, 157, 148, 0.15)', icon: getIconUrl('emblem-iron.png') },
  { id: 'bronze', name: 'Đồng', minXP: 500, color: '#ab6f53', bg: 'rgba(171, 111, 83, 0.15)', icon: getIconUrl('emblem-bronze.png') },
  { id: 'silver', name: 'Bạc', minXP: 1500, color: '#a0aeb2', bg: 'rgba(160, 174, 178, 0.15)', icon: getIconUrl('emblem-silver.png') },
  { id: 'gold', name: 'Vàng', minXP: 3000, color: '#f1c356', bg: 'rgba(241, 195, 86, 0.15)', icon: getIconUrl('emblem-gold.png') },
  { id: 'platinum', name: 'Bạch Kim', minXP: 5000, color: '#4e9996', bg: 'rgba(78, 153, 150, 0.15)', icon: getIconUrl('emblem-platinum.png') },
  { id: 'diamond', name: 'Kim Cương', minXP: 8000, color: '#576bce', bg: 'rgba(87, 107, 206, 0.15)', icon: getIconUrl('emblem-diamond.png') },
  { id: 'master', name: 'Cao Thủ', minXP: 12000, color: '#9d48e0', bg: 'rgba(157, 72, 224, 0.15)', icon: getIconUrl('emblem-master.png') },
  { id: 'grandmaster', name: 'Đại Cao Thủ', minXP: 16000, color: '#e84141', bg: 'rgba(232, 65, 65, 0.15)', icon: getIconUrl('emblem-grandmaster.png') },
  { id: 'challenger', name: 'Thách Đấu', minXP: 20000, color: '#f4c874', bg: 'rgba(244, 200, 116, 0.15)', icon: getIconUrl('emblem-challenger.png') }
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
