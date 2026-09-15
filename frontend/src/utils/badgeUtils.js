export const BADGES_CONFIG = [
  {
    id: 'speed',
    name: 'Tốc Độ',
    icon: '⚡',
    description: 'Hoàn thành bài trong ≤ 80% thời gian và điểm ≥ 8.5',
    maxProgress: 5,
    color: '#3b82f6'
  },
  {
    id: 'hardworking_bee',
    name: 'Ong Chăm Chỉ',
    icon: '🐝',
    description: 'Làm bài liên tục 7 ngày không ngắt quãng',
    maxProgress: 7,
    color: '#eab308'
  },
  {
    id: 'perfect_shot',
    name: 'Bách Phát Bách Trúng',
    icon: '🎯',
    description: 'Đạt điểm tối đa (10/10) ở 3 đề thi thử',
    maxProgress: 3,
    color: '#ef4444'
  },
  {
    id: 'comeback',
    name: 'Lội Ngược Dòng',
    icon: '🚀',
    description: 'Cải thiện điểm đề thi từ < 5 lên ≥ 8.5',
    maxProgress: 1,
    color: '#8b5cf6'
  },
  {
    id: 'kaleidoscope',
    name: 'Kính Vạn Hoa',
    icon: '💎',
    description: 'Giải đúng 100% câu hỏi phân loại khó trong đề',
    maxProgress: 1, // Unlock immediately if achieved once
    color: '#06b6d4'
  },
  {
    id: 'streak_hunter',
    name: 'Thợ Săn Chuỗi',
    icon: '🔥',
    description: 'Duy trì chuỗi làm bài 14 ngày liên tiếp',
    maxProgress: 14,
    color: '#f97316'
  }
];

/**
 * Phân tích mảng badges (vd: ['speed:3', 'perfect_shot']) thành object chi tiết
 * @param {string[]} badgesArray 
 * @returns {Record<string, { unlocked: boolean, progress: number }>}
 */
export const parseUserBadges = (badgesArray = []) => {
  const result = {};
  
  // Khởi tạo tất cả badge với progress = 0
  BADGES_CONFIG.forEach(b => {
    result[b.id] = { unlocked: false, progress: 0 };
  });

  badgesArray.forEach(item => {
    // Có thể là 'speed:3' hoặc 'perfect_shot' (nếu đã unlock hoàn toàn trong tương lai hoặc tương thích ngược)
    if (item.includes(':')) {
      const [id, progressStr] = item.split(':');
      if (result[id]) {
        result[id].progress = parseInt(progressStr, 10) || 0;
        const config = BADGES_CONFIG.find(b => b.id === id);
        if (config && result[id].progress >= config.maxProgress) {
          result[id].unlocked = true;
          result[id].progress = config.maxProgress;
        }
      }
    } else {
      // Tương thích ngược: Nếu chỉ có tên badge cũ, map sang ID mới
      let mappedId = null;
      if (item === 'Tốc Độ') mappedId = 'speed';
      if (item === 'Chăm Chỉ' || item === 'Ong Chăm Chỉ') mappedId = 'hardworking_bee';
      if (item === 'Điểm Tuyệt Đối') mappedId = 'perfect_shot';
      
      const id = mappedId || item; // Nếu item là ID luôn thì dùng item
      if (result[id]) {
        result[id].unlocked = true;
        const config = BADGES_CONFIG.find(b => b.id === id);
        if (config) {
          result[id].progress = config.maxProgress;
        }
      }
    }
  });

  return result;
};

/**
 * Chuyển đổi state result object trở lại mảng string để lưu vào db
 * @param {Record<string, { unlocked: boolean, progress: number }>} parsedBadges 
 * @returns {string[]}
 */
export const encodeUserBadges = (parsedBadges) => {
  const arr = [];
  for (const [id, data] of Object.entries(parsedBadges)) {
    if (data.progress > 0) {
      if (data.unlocked) {
        // Chỉ lưu ID để đánh dấu đã unlock hoàn toàn (hoặc có thể lưu id:maxProgress)
        // Ta chọn lưu `id` cho sạch data
        arr.push(id);
      } else {
        arr.push(`${id}:${data.progress}`);
      }
    }
  }
  return arr;
};
