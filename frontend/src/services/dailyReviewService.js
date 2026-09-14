import { getExams, getStudentHistory } from './examService';

const DAILY_REVIEW_KEY = 'edumanager_daily_review_v3';

export const getDailyReviewState = (studentId) => {
  try {
    const raw = localStorage.getItem(DAILY_REVIEW_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data[studentId] || null;
  } catch (err) {
    return null;
  }
};

export const saveDailyReviewState = (studentId, state) => {
  try {
    const raw = localStorage.getItem(DAILY_REVIEW_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[studentId] = state;
    localStorage.setItem(DAILY_REVIEW_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving daily review state', err);
  }
};

const isMultipleChoice = (q) => {
  return (!q.questionType || q.questionType === 'multiple_choice') && q.options && q.options.length === 4;
};

// Hàm lấy tag/ID của câu hỏi
const getQuestionTags = (q) => {
  return q.tags || [];
};

export const generateDailyReviewQuestions = async (studentId, studentGrade) => {
  // Lấy state hiện tại
  let currentState = getDailyReviewState(studentId);
  const todayStr = new Date().toISOString().split('T')[0];

  // Nếu hôm nay đã cấp câu hỏi rồi thì trả về state hiện tại
  if (currentState && currentState.lastUpdateDate === todayStr) {
    return currentState;
  }

  if (!currentState) {
    currentState = {
      lastUpdateDate: '',
      pendingQuestions: [],
      masteredQuestionIds: [], // Những câu đã làm đúng trong Daily Review
      failedReviewItems: [] // Những câu học sinh làm sai trong Daily Review: [{ id, tags, failedAt }]
    };
  } else if (!currentState.failedReviewItems) {
    currentState.failedReviewItems = [];
  }

  // Nếu pending >= 10, không cộng thêm
  if (currentState.pendingQuestions.length >= 10) {
    currentState.lastUpdateDate = todayStr;
    saveDailyReviewState(studentId, currentState);
    return currentState;
  }

  // Số lượng câu cần cấp thêm
  const needed = Math.min(3, 10 - currentState.pendingQuestions.length);
  if (needed <= 0) {
    currentState.lastUpdateDate = todayStr;
    saveDailyReviewState(studentId, currentState);
    return currentState;
  }

  // Lấy dữ liệu
  const exams = await getExams() || [];
  const history = await getStudentHistory(studentId) || {};

  // Lọc đề thi theo khối của học sinh:
  // - Lớp 12: chỉ lấy các đề của thi thử khối 12 và THPTQG, tuyệt đối KHÔNG lấy trong VACT.
  // - Lớp 11: chỉ lấy của khối 11.
  // - Lớp 10: chỉ lấy của khối 10.
  const validExams = exams.filter(exam => {
    const taskGrade = exam.grade ? String(exam.grade).toLowerCase() : '';
    if (!taskGrade) return false;

    if (String(studentGrade) === '12') {
      const isGrade12OrTHPT = taskGrade.includes('12') || taskGrade.includes('thptqg');
      const isVact = taskGrade.includes('vact') || taskGrade.includes('dgnl');
      return isGrade12OrTHPT && !isVact;
    }
    if (String(studentGrade) === '11') {
      return taskGrade.includes('11');
    }
    if (String(studentGrade) === '10') {
      return taskGrade.includes('10');
    }
    return false;
  });

  // Tìm các câu sai và danh sách tag của câu sai
  const wrongQuestions = [];
  const wrongTags = new Set();
  const allValidQuestions = [];
  
  validExams.forEach(exam => {
    const examSessions = history[exam.id] || [];
    // Lấy session mới nhất nếu có làm nhiều lần
    const latestSession = examSessions.length > 0 ? examSessions[examSessions.length - 1] : null;
    const userAnswers = latestSession ? (latestSession.answers || {}) : {};

    let currentClusterContext = null;
    let clusterRemaining = 0;

    (exam.questions || []).forEach(q => {
      // Bảo tồn clusterContext cho các câu trong cùng chùm/cụm
      if (q.clusterContext) {
        currentClusterContext = q.clusterContext;
        clusterRemaining = q.clusterLength || 1;
      }

      const effectiveClusterContext = q.clusterContext || (clusterRemaining > 0 ? currentClusterContext : null);

      if (clusterRemaining > 0) {
        clusterRemaining--;
        if (clusterRemaining === 0) {
          currentClusterContext = null;
        }
      }

      // Chỉ xử lý trắc nghiệm 4 phương án
      if (!isMultipleChoice(q)) return;

      // Không lấy lại các câu đã có trong pending hoặc đã master
      if (currentState.pendingQuestions.some(pq => pq.id === q.id)) return;
      if (currentState.masteredQuestionIds.includes(q.id)) return;

      const qWithContext = {
        ...q,
        clusterContext: effectiveClusterContext
      };

      allValidQuestions.push(qWithContext);

      if (latestSession) {
        const uAns = userAnswers[q.id];
        // Nếu đã trả lời và trả lời sai
        if (uAns && uAns !== q.correctAnswer) {
          wrongQuestions.push(qWithContext);
          const tags = getQuestionTags(q);
          tags.forEach(t => wrongTags.add(t));
        }
      }
    });
  });

  // Chọn câu hỏi
  const selected = [];

  // Ưu tiên 0: Học sinh ôn tập và làm sai câu nào hôm trước -> Hôm sau hỏi lại câu đó HOẶC hỏi câu cùng dạng
  const failedReviewItems = currentState.failedReviewItems || [];
  const shuffledFailed = [...failedReviewItems].sort(() => 0.5 - Math.random());

  for (const item of shuffledFailed) {
    if (selected.length >= needed) break;

    const exactQ = allValidQuestions.find(q => q.id === item.id && !selected.some(sq => sq.id === q.id));
    const sameTagQs = allValidQuestions.filter(q => 
      q.id !== item.id && 
      !selected.some(sq => sq.id === q.id) &&
      (q.tags || []).some(t => (item.tags || []).includes(t))
    );

    // 50% cơ hội hỏi lại chính câu đó, 50% cơ hội bốc câu cùng dạng (nếu có)
    const chooseSameTag = sameTagQs.length > 0 && (Math.random() > 0.5 || !exactQ);

    if (chooseSameTag && sameTagQs.length > 0) {
      const picked = sameTagQs[Math.floor(Math.random() * sameTagQs.length)];
      selected.push({ ...picked, reviewReason: 'same_tag_failed' });
    } else if (exactQ) {
      selected.push({ ...exactQ, reviewReason: 'failed_in_review' });
    }
  }

  // Ưu tiên 1: Câu làm sai trong đề thi thử
  if (selected.length < needed) {
    wrongQuestions.sort(() => 0.5 - Math.random());
    for (const q of wrongQuestions) {
      if (selected.length >= needed) break;
      if (!selected.some(sq => sq.id === q.id)) {
        selected.push({ ...q, reviewReason: 'wrong' });
      }
    }
  }

  // Ưu tiên 2: Cùng dạng (tag) với câu sai trong đề thi thử
  if (selected.length < needed) {
    const sameTagQs = allValidQuestions.filter(q => {
      if (selected.some(sq => sq.id === q.id)) return false;
      const tags = getQuestionTags(q);
      return tags.some(t => wrongTags.has(t));
    });
    sameTagQs.sort(() => 0.5 - Math.random());
    for (const q of sameTagQs) {
      if (selected.length >= needed) break;
      selected.push({ ...q, reviewReason: 'same_tag' });
    }
  }

  // Ưu tiên 3: Ngẫu nhiên
  if (selected.length < needed) {
    const remaining = allValidQuestions.filter(q => !selected.some(sq => sq.id === q.id));
    remaining.sort(() => 0.5 - Math.random());
    for (const q of remaining) {
      if (selected.length >= needed) break;
      selected.push({ ...q, reviewReason: 'random' });
    }
  }

  // Cập nhật state
  currentState.pendingQuestions = [...currentState.pendingQuestions, ...selected];
  currentState.lastUpdateDate = todayStr;
  saveDailyReviewState(studentId, currentState);

  return currentState;
};

// Hàm gọi khi học sinh trả lời 1 câu trong mục Ôn tập
export const submitDailyReviewAnswer = (studentId, questionId, isCorrect, tags = []) => {
  const currentState = getDailyReviewState(studentId);
  if (!currentState) return;

  if (!currentState.failedReviewItems) currentState.failedReviewItems = [];
  if (!currentState.masteredQuestionIds) currentState.masteredQuestionIds = [];

  // Loại câu hỏi này khỏi pending
  currentState.pendingQuestions = currentState.pendingQuestions.filter(q => q.id !== questionId);

  const todayStr = new Date().toISOString().split('T')[0];

  if (!isCorrect) {
    // Làm sai trong Ôn tập: ghi nhận để ngày hôm sau hỏi lại câu đó hoặc cùng dạng
    const existingIndex = currentState.failedReviewItems.findIndex(item => item.id === questionId);
    if (existingIndex >= 0) {
      currentState.failedReviewItems[existingIndex].failedAt = todayStr;
    } else {
      currentState.failedReviewItems.push({
        id: questionId,
        tags: tags || [],
        failedAt: todayStr
      });
    }
    // Xóa khỏi mastered nếu có
    currentState.masteredQuestionIds = currentState.masteredQuestionIds.filter(id => id !== questionId);
  } else {
    // Làm đúng:
    // 1. Thêm vào mastered
    if (!currentState.masteredQuestionIds.includes(questionId)) {
      currentState.masteredQuestionIds.push(questionId);
    }
    // 2. Nếu đã hoàn thành đúng, gỡ bỏ khỏi danh sách câu sai của Ôn tập
    currentState.failedReviewItems = currentState.failedReviewItems.filter(item => {
      if (item.id === questionId) return false;
      // Nếu câu vừa làm đúng có cùng tag với câu làm sai trước đó, cũng coi như đã vượt qua dạng này
      if (tags && tags.length > 0 && item.tags && item.tags.some(t => tags.includes(t))) {
        return false;
      }
      return true;
    });
  }

  saveDailyReviewState(studentId, currentState);
  return currentState;
};
