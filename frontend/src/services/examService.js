/**
 * examService.js
 * CRUD + realtime for exams and exam sessions via Supabase.
 * Falls back to localStorage if Supabase is not configured.
 */
import supabase from '../lib/supabase';
import { calculateRank } from '../utils/rankUtils';

const EXAMS_KEY     = 'edumanager_exams_data_v8';
const HISTORY_KEY   = 'edumanager_completed_exams';
const UNFINISHED_KEY = 'edumanager_unfinished_exams';
const GAMI_KEY      = 'edumanager_gamification';
const ROOMS_KEY     = 'edumanager_online_exam_rooms';
const ROOM_SUBMISSIONS_KEY = 'edumanager_room_submissions';

const isSupabaseReady = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

// ─── Exams ────────────────────────────────────────────────────────────────────

export async function getExams(forceSync = false) {
  if (!forceSync) {
    const local = getExamsFromLocal();
    if (local && local.length > 0) return local;
  }
  if (!isSupabaseReady()) {
    return getExamsFromLocal();
  }

  try {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const dbExams = (data || []).map(rowToExam);
    localStorage.setItem(EXAMS_KEY, JSON.stringify(dbExams));
    return dbExams;
  } catch (err) {
    console.error('[examService] getExams error, fallback to local:', err);
    return getExamsFromLocal();
  }
}

/**
 * Save (upsert) an exam. Returns the saved exam with its id.
 */
export async function saveExam(exam) {
  if (!isSupabaseReady()) {
    return saveExamToLocal(exam);
  }

  try {
    const row = examToRow(exam);
    const { data, error } = await supabase
      .from('exams')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    const saved = rowToExam(data);

    // Update local cache
    updateLocalExam(saved);
    return { success: true, exam: saved };
  } catch (err) {
    console.error('[examService] saveExam error:', err);
    const saved = saveExamToLocal(exam);
    return { success: false, exam: saved, error: err.message };
  }
}

/**
 * Delete an exam by id.
 */
export async function deleteExam(examId) {
  if (!isSupabaseReady()) {
    deleteExamFromLocal(examId);
    return { success: true };
  }

  try {
    const { error } = await supabase.from('exams').delete().eq('id', examId);
    if (error) throw error;
    deleteExamFromLocal(examId);
    return { success: true };
  } catch (err) {
    console.error('[examService] deleteExam error:', err);
    return { success: false, error: err.message };
  }
}

// ─── Exam Sessions (kết quả thi) ──────────────────────────────────────────────

/**
 * Submit an exam session. Saves to Supabase + updates gamification.
 */
export async function submitExamSession({
  examId,
  studentId,
  studentName,
  classId,
  answers,
  flagged,
  score,
  correctCount,
  totalQuestions,
  timeSpent,
}) {
  const sessionData = {
    exam_id: examId,
    student_id: studentId,
    student_name: studentName,
    class_id: classId,
    answers,
    flagged: flagged || [],
    score,
    correct_count: correctCount,
    total_questions: totalQuestions,
    time_spent: timeSpent,
    submitted_at: new Date().toISOString(),
  };

  // Always save to localStorage first (instant)
  saveSessionToLocal({ examId, studentId, score, correctCount, totalQuestions, answers, flagged, timeSpent });

  if (!isSupabaseReady()) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('exam_sessions').insert(sessionData);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[examService] submitExamSession error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get all completed sessions for a specific exam (for teacher view).
 */
export async function getAllExamSessions() {
  if (!isSupabaseReady()) return getAllExamSessionsFromLocal();

  try {
    const { data, error } = await supabase
      .from('exam_sessions')
      .select('*')
      .not('submitted_at', 'is', null)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    
    const history = {};
    for (const s of (data || [])) {
      if (!history[s.exam_id]) history[s.exam_id] = [];
      history[s.exam_id].push({
        id: s.id,
        studentId: s.student_id,
        examId: s.exam_id,
        score: s.score,
        correctCount: s.correct_count,
        totalQuestions: s.total_questions,
        completedAt: s.submitted_at,
        answers: s.answers,
        flagged: s.flagged,
        timeSpent: s.time_spent,
      });
    }
    return history;
  } catch (err) {
    console.error('[examService] getAllExamSessions error:', err);
    return getAllExamSessionsFromLocal();
  }
}

export async function getExamSessions(examId) {
  if (!isSupabaseReady()) return [];

  try {
    const { data, error } = await supabase
      .from('exam_sessions')
      .select('*')
      .eq('exam_id', examId)
      .not('submitted_at', 'is', null)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[examService] getExamSessions error:', err);
    return [];
  }
}

/**
 * Get completed exam history for a specific student.
 */
export async function getStudentHistory(studentId) {
  if (!isSupabaseReady()) {
    return getStudentHistoryFromLocal(studentId);
  }

    try {
      const { data, error } = await supabase
        .from('exam_sessions')
        .select('id, exam_id, score, correct_count, total_questions, submitted_at, answers, flagged, time_spent')
        .eq('student_id', studentId)
        .not('submitted_at', 'is', null);

    if (error) throw error;

    // Group into arrays per exam
    const history = {};
    for (const s of (data || [])) {
      if (!history[s.exam_id]) history[s.exam_id] = [];
      history[s.exam_id].push({
        id: s.id,
        examId: s.exam_id,
        score: s.score,
        correctCount: s.correct_count,
        totalQuestions: s.total_questions,
        completedAt: s.submitted_at,
        answers: s.answers,
        flagged: s.flagged,
        timeSpent: s.time_spent,
      });
    }
    // Ensure chronological order
    Object.keys(history).forEach(key => {
      history[key].sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
    });
    return history;
  } catch (err) {
    console.error('[examService] getStudentHistory error:', err);
    return getStudentHistoryFromLocal(studentId);
  }
}

/**
 * Trích xuất đáp án của học sinh cho câu hỏi q (ở vị trí index idx trong đề thi).
 * Hỗ trợ các trường hợp:
 * 1. Khớp chính xác ID: answers[q.id]
 * 2. Khớp trực tiếp theo index: answers[idx], answers[String(idx)], answers[`q_${idx}`]
 * 3. Khớp theo hậu tố số thứ tự câu hỏi: q_timestamp_12 -> 12 == idx
 * 4. Khớp theo hậu tố số thứ tự trong ID câu hỏi gốc
 */
export function getStudentAnswerForQuestion(answers, q, idx) {
  if (!answers || typeof answers !== 'object') return undefined;

  // 1. Khớp chính xác theo ID câu hỏi
  if (q?.id && answers[q.id] !== undefined) {
    return answers[q.id];
  }

  // 2. Khớp theo index trực tiếp (ví dụ key là '0', 0, hoặc 'q_0')
  if (idx !== undefined && idx !== null) {
    if (answers[idx] !== undefined) return answers[idx];
    const sIdx = String(idx);
    if (answers[sIdx] !== undefined) return answers[sIdx];
    if (answers[`q_${sIdx}`] !== undefined) return answers[`q_${sIdx}`];
  }

  const entries = Object.entries(answers);

  // 3. Khớp theo hậu tố index (_0, _1, _12...) của ID trong answers
  if (idx !== undefined && idx !== null) {
    const targetIdx = Number(idx);
    const indexMatch = entries.find(([k]) => {
      const match = k.match(/(?:^|_)(\d+)$/);
      return match && parseInt(match[1], 10) === targetIdx;
    });
    if (indexMatch !== undefined) {
      return indexMatch[1];
    }
  }

  // 4. Khớp theo hậu tố index của chính q.id nếu q.id có dạng ..._idx
  if (q?.id) {
    const qMatch = q.id.match(/(?:^|_)(\d+)$/);
    if (qMatch) {
      const qIdx = parseInt(qMatch[1], 10);
      const fallbackEntry = entries.find(([k]) => {
        const m = k.match(/(?:^|_)(\d+)$/);
        return m && parseInt(m[1], 10) === qIdx;
      });
      if (fallbackEntry !== undefined) return fallbackEntry[1];
    }
  }

  return undefined;
}

/**
 * Tính điểm cho bài làm của học sinh dựa trên đề thi và danh sách đáp án.
 * Hỗ trợ 4 dạng câu hỏi:
 * - Trắc nghiệm 4 lựa chọn (multiple_choice): so sánh chuỗi đáp án (A, B, C, D)
 * - Đúng/Sai (true_false): tính số ý đúng (1-4 ý) và áp dụng thang điểm bậc thang
 * - Trả lời ngắn (short_answer): so sánh chuỗi (chuẩn hóa dấu phẩy/chấm) và so sánh giá trị số
 * - Tự luận (essay): nếu có
 * Hỗ trợ cả điểm theo cấu hình pointsConfig (hoặc points_config) lẫn thang điểm 10 mặc định.
 */
export function calculateExamScore(exam, answers) {
  if (!exam || !Array.isArray(exam.questions)) {
    return { score: 0, correctCount: 0, totalQuestions: 0 };
  }

  let correctCount = 0;
  let totalCalculatedScore = 0;
  const pConfig = exam.pointsConfig || exam.points_config;
  const hasPointsConfig = !!(pConfig && (
    pConfig.multipleChoice !== undefined ||
    pConfig.shortAnswer !== undefined ||
    pConfig.trueFalse !== undefined
  ));

  exam.questions.forEach((q, idx) => {
    const uAns = getStudentAnswerForQuestion(answers, q, idx);

    if (q.questionType === 'true_false') {
      let subCorrect = 0;
      let hasAnyPick = false;
      (q.options || []).forEach((opt, optIdx) => {
        let userPick = uAns?.[opt.key] 
          ?? uAns?.[opt.key?.toLowerCase()] 
          ?? uAns?.[opt.key?.toUpperCase()];
        if (userPick === undefined && Array.isArray(uAns)) {
          userPick = uAns[optIdx];
        }
        if (userPick !== undefined && userPick !== null && userPick !== '') {
          hasAnyPick = true;
        }

        const normUser = (userPick === true || userPick === 'T' || userPick === 'true' || userPick === 'Đúng')
          ? 'T'
          : ((userPick === false || userPick === 'F' || userPick === 'false' || userPick === 'Sai') ? 'F' : userPick);

        const expected = Boolean(opt.isCorrectTrue) ? 'T' : 'F';
        if (normUser === expected) {
          subCorrect += 1;
        }
      });

      if (subCorrect === 4 && hasAnyPick) {
        correctCount += 1;
      }

      if (hasPointsConfig && hasAnyPick) {
        const tfConfig = pConfig.trueFalse || {};
        if (subCorrect === 1) totalCalculatedScore += (parseFloat(tfConfig.correct1) || 0);
        else if (subCorrect === 2) totalCalculatedScore += (parseFloat(tfConfig.correct2) || 0);
        else if (subCorrect === 3) totalCalculatedScore += (parseFloat(tfConfig.correct3) || 0);
        else if (subCorrect === 4) totalCalculatedScore += (parseFloat(tfConfig.correct4) || 0);
      }
    } else if (q.questionType === 'short_answer') {
      const cleanUser = String(uAns || '').trim().replace(/,/g, '.');
      const cleanTarget = String(q.correctAnswer || '').trim().replace(/,/g, '.');
      const numUser = Number(cleanUser);
      const numTarget = Number(cleanTarget);
      const isNumericMatch = !isNaN(numUser) && !isNaN(numTarget) && cleanUser !== '' && cleanTarget !== '' && numUser === numTarget;

      if ((cleanUser !== '' && cleanUser === cleanTarget) || isNumericMatch) {
        correctCount += 1;
        if (hasPointsConfig) totalCalculatedScore += (parseFloat(pConfig.shortAnswer) || 0);
      }
    } else if (q.questionType === 'essay') {
      // essay không chấm tự động
    } else {
      // Multiple choice (mặc định)
      const uVal = (uAns !== undefined && uAns !== null) ? String(uAns).trim().toUpperCase() : '';
      const targetVal = (q.correctAnswer !== undefined && q.correctAnswer !== null) ? String(q.correctAnswer).trim().toUpperCase() : '';
      if (uVal !== '' && targetVal !== '' && uVal === targetVal) {
        correctCount += 1;
        if (hasPointsConfig) totalCalculatedScore += (parseFloat(pConfig.multipleChoice) || 0);
      }
    }
  });

  const totalQuestions = exam.questions.length;
  const score = hasPointsConfig
    ? Number(totalCalculatedScore.toFixed(2))
    : (totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 10).toFixed(1)) : 0);

  return { score, correctCount, totalQuestions };
}

/**
 * Tự động chấm lại toàn bộ các bài làm của học sinh cho đề thi `exam`
 * Cập nhật trên:
 * - Supabase bảng `exam_sessions`
 * - Supabase bảng `system_settings` (các bài nộp phòng thi exam_subs_*)
 * - LocalStorage `HISTORY_KEY` (edumanager_completed_exams)
 * - LocalStorage `ROOM_SUBMISSIONS_KEY` (edumanager_room_submissions)
 * Bảo tồn tuyệt đối dữ liệu nộp bài hiện có (thời gian làm, mã học sinh, đáp án chọn, v.v.)
 */
export async function regradeExamSessions(exam) {
  if (!exam || !exam.id || !Array.isArray(exam.questions) || exam.questions.length === 0) {
    return { success: false, updatedCount: 0 };
  }

  let localHistoryUpdatedCount = 0;
  let localRoomUpdatedCount = 0;
  let dbUpdatedCount = 0;

  // 1. Cập nhật LocalStorage HISTORY_KEY
  try {
    const all = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    let historyChanged = false;
    Object.keys(all).forEach(studentId => {
      const studentHistory = all[studentId];
      if (studentHistory && studentHistory[exam.id]) {
        const sessions = Array.isArray(studentHistory[exam.id]) ? studentHistory[exam.id] : [studentHistory[exam.id]];
        sessions.forEach(session => {
          const recalculated = calculateExamScore(exam, session.answers);
          if (session.score !== recalculated.score || session.correctCount !== recalculated.correctCount || session.totalQuestions !== recalculated.totalQuestions) {
            session.score = recalculated.score;
            session.correctCount = recalculated.correctCount;
            session.totalQuestions = recalculated.totalQuestions;
            historyChanged = true;
            localHistoryUpdatedCount++;
          }
        });
        studentHistory[exam.id] = sessions;
      }
    });
    if (historyChanged) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
    }
  } catch (err) {
    console.warn('[examService] Error regrading local history:', err);
  }

  // 2. Cập nhật LocalStorage ROOM_SUBMISSIONS_KEY
  try {
    const allRooms = JSON.parse(localStorage.getItem(ROOM_SUBMISSIONS_KEY) || '{}');
    let roomChanged = false;
    Object.keys(allRooms).forEach(roomId => {
      const subs = allRooms[roomId] || [];
      subs.forEach(sub => {
        if (sub.examId === exam.id) {
          const recalculated = calculateExamScore(exam, sub.answers);
          if (sub.score !== recalculated.score || sub.correctCount !== recalculated.correctCount || sub.totalQuestions !== recalculated.totalQuestions) {
            sub.score = recalculated.score;
            sub.correctCount = recalculated.correctCount;
            sub.totalQuestions = recalculated.totalQuestions;
            roomChanged = true;
            localRoomUpdatedCount++;
          }
        }
      });
    });
    if (roomChanged) {
      localStorage.setItem(ROOM_SUBMISSIONS_KEY, JSON.stringify(allRooms));
    }
  } catch (err) {
    console.warn('[examService] Error regrading local room submissions:', err);
  }

  // 3. Cập nhật Supabase exam_sessions
  if (isSupabaseReady()) {
    try {
      const { data, error } = await supabase
        .from('exam_sessions')
        .select('id, answers, score, correct_count, total_questions')
        .eq('exam_id', exam.id);

      if (!error && Array.isArray(data) && data.length > 0) {
        const updates = [];
        for (const row of data) {
          const recalculated = calculateExamScore(exam, row.answers);
          if (row.score !== recalculated.score || row.correct_count !== recalculated.correctCount || row.total_questions !== recalculated.totalQuestions) {
            updates.push(
              supabase
                .from('exam_sessions')
                .update({
                  score: recalculated.score,
                  correct_count: recalculated.correctCount,
                  total_questions: recalculated.totalQuestions
                })
                .eq('id', row.id)
            );
            dbUpdatedCount++;
          }
        }
        if (updates.length > 0) {
          await Promise.all(updates);
        }
      }
    } catch (err) {
      console.warn('[examService] Error regrading supabase exam_sessions:', err);
    }

    // 4. Cập nhật Supabase system_settings cho exam_subs_*
    try {
      const { data: roomSettings, error: roomErr } = await supabase
        .from('system_settings')
        .select('key, value')
        .like('key', 'exam_subs_%');

      if (!roomErr && Array.isArray(roomSettings)) {
        for (const item of roomSettings) {
          if (Array.isArray(item.value)) {
            let hasChange = false;
            const updatedSubs = item.value.map(sub => {
              if (sub.examId === exam.id) {
                const recalculated = calculateExamScore(exam, sub.answers);
                if (sub.score !== recalculated.score || sub.correctCount !== recalculated.correctCount || sub.totalQuestions !== recalculated.totalQuestions) {
                  hasChange = true;
                  return {
                    ...sub,
                    score: recalculated.score,
                    correctCount: recalculated.correctCount,
                    totalQuestions: recalculated.totalQuestions
                  };
                }
              }
              return sub;
            });
            if (hasChange) {
              await supabase
                .from('system_settings')
                .upsert({ key: item.key, value: updatedSubs }, { onConflict: 'key' });
            }
          }
        }
      }
    } catch (err) {
      console.warn('[examService] Error regrading system_settings room subs:', err);
    }
  }

  const updatedCount = Math.max(dbUpdatedCount, localHistoryUpdatedCount + localRoomUpdatedCount);
  return {
    success: true,
    updatedCount,
    dbUpdatedCount,
    localHistoryUpdatedCount,
    localRoomUpdatedCount
  };
}

export async function deleteExamSession(sessionId, studentId, examId, completedAt) {
  // Try to delete from Supabase if ready and has ID
  if (isSupabaseReady() && sessionId) {
    try {
      const { error } = await supabase
        .from('exam_sessions')
        .delete()
        .eq('id', sessionId);
      if (error) throw error;
    } catch (err) {
      console.error('[examService] deleteExamSession error:', err);
      throw err;
    }
  }

  // Also delete from local storage as fallback or sync
  try {
    const all = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    if (all[studentId] && all[studentId][examId]) {
      const sessions = Array.isArray(all[studentId][examId]) 
        ? all[studentId][examId] 
        : [all[studentId][examId]];
      
      const updatedSessions = sessions.filter(s => s.completedAt !== completedAt);
      
      if (updatedSessions.length === 0) {
        delete all[studentId][examId];
      } else {
        all[studentId][examId] = updatedSessions;
      }
      localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
    }
  } catch (err) {
    console.error('[examService] deleteExamSession local error:', err);
  }
}

// ─── Gamification ─────────────────────────────────────────────────────────────

/**
 * Update gamification data for a student (XP, streak, badges).
 */
export async function updateGamification(studentId, gamiData) {
  // Always update local first
  const allGami = JSON.parse(localStorage.getItem(GAMI_KEY) || '{}');
  const oldGami = allGami[studentId] || { xp: 0, streak: 0 };
  
  const oldRank = calculateRank(oldGami.xp || 0).currentRank;
  const newRank = calculateRank(gamiData.xp || 0).currentRank;

  allGami[studentId] = gamiData;
  localStorage.setItem(GAMI_KEY, JSON.stringify(allGami));
  
  if (newRank.minXP > oldRank.minXP) {
    window.dispatchEvent(new CustomEvent('level_up', { detail: { newRank } }));
  }
  window.dispatchEvent(new Event('gamification_updated'));

  if (!isSupabaseReady()) return { success: true };

  try {
    const { error } = await supabase.from('gamification').upsert({
      student_id: studentId,
      xp: gamiData.xp || 0,
      streak: gamiData.streak || 0,
      last_login_date: gamiData.lastLoginDate || null,
      last_active_date: gamiData.lastActiveDate || null,
      badges: gamiData.badges || [],
    }, { onConflict: 'student_id' });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[examService] updateGamification error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get gamification for a student.
 */
export async function getGamification(studentId) {
  if (!isSupabaseReady()) {
    const allGami = JSON.parse(localStorage.getItem(GAMI_KEY) || '{}');
    return allGami[studentId] || { xp: 0, streak: 0, badges: [] };
  }

  try {
    const { data, error } = await supabase
      .from('gamification')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    if (!data) return { xp: 0, streak: 0, badges: [] };

    const fetchedData = {
      xp: data.xp,
      streak: data.streak,
      lastLoginDate: data.last_login_date,
      lastActiveDate: data.last_active_date,
      badges: data.badges || [],
    };

    // Cache locally so it syncs across tabs/components
    const allGami = JSON.parse(localStorage.getItem(GAMI_KEY) || '{}');
    allGami[studentId] = fetchedData;
    localStorage.setItem(GAMI_KEY, JSON.stringify(allGami));

    return fetchedData;
  } catch (err) {
    console.error('[examService] getGamification error:', err);
    const allGami = JSON.parse(localStorage.getItem(GAMI_KEY) || '{}');
    return allGami[studentId] || { xp: 0, streak: 0, badges: [] };
  }
}

/**
 * Process daily login for streak tracking
 */
export async function processDailyLogin(studentId) {
  if (!studentId || studentId === 'khach_tudolamde@gmail.com') return null;
  
  const studentGami = await getGamification(studentId);
  
  // Lấy ngày hiện tại theo chuẩn YYYY-MM-DD local time (vd: Vietnam)
  const todayStr = new Date().toLocaleDateString('en-CA');
  
  let lastLoginDateStr = studentGami.lastLoginDate;
  // Đổi format cũ (nếu có T) thành YYYY-MM-DD
  if (lastLoginDateStr && lastLoginDateStr.includes('T')) {
    lastLoginDateStr = new Date(lastLoginDateStr).toLocaleDateString('en-CA');
  }

  let updated = false;

  if (!lastLoginDateStr) {
    studentGami.streak = 1;
    studentGami.lastLoginDate = todayStr;
    updated = true;
  } else if (lastLoginDateStr !== todayStr) {
    // So sánh ngày bằng cách chuyển về chung chuẩn UTC midnight
    const t = new Date(todayStr).getTime();
    const l = new Date(lastLoginDateStr).getTime();
    const diffDays = Math.round((t - l) / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 1) {
      studentGami.streak = (studentGami.streak || 0) + 1;
      studentGami.lastLoginDate = todayStr;
      
      if (studentGami.streak >= 41) {
        studentGami.xp = (studentGami.xp || 0) + 200;
      } else if (studentGami.streak >= 31) {
        studentGami.xp = (studentGami.xp || 0) + 150;
      } else if (studentGami.streak >= 2) {
        studentGami.xp = (studentGami.xp || 0) + 100;
      }
      updated = true;
    } else if (diffDays > 1) {
      studentGami.streak = 1;
      studentGami.lastLoginDate = todayStr;
      updated = true;
    }
    // Nếu diffDays === 0 hoặc âm (lỗi giờ), không làm gì cả
  }

  if (updated) {
    await updateGamification(studentId, studentGami);
  }
  
  return studentGami;
}

/**
 * Subscribe to new exam submissions (realtime, for teacher dashboard).
 * Returns the channel object — call channel.unsubscribe() to clean up.
 */
export function subscribeToExamSessions(examId, onNewSession) {
  if (!isSupabaseReady()) return null;

  const channel = supabase
    .channel(`exam-sessions-${examId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'exam_sessions', filter: `exam_id=eq.${examId}` },
      (payload) => onNewSession(payload.new)
    )
    .subscribe();

  return channel;
}

// ─── Save/Save-in-progress ────────────────────────────────────────────────────

/**
 * Save unfinished exam progress to localStorage (called every few seconds).
 */
export function saveUnfinishedExam(studentId, examId, { answers, flagged, timeLeft }) {
  try {
    const raw = localStorage.getItem(UNFINISHED_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[studentId] = { examId, answers, flagged, timeLeft, savedAt: Date.now() };
    localStorage.setItem(UNFINISHED_KEY, JSON.stringify(map));
  } catch (_) {}
}

export function getUnfinishedExam(studentId) {
  try {
    const raw = localStorage.getItem(UNFINISHED_KEY);
    if (!raw) return null;
    return JSON.parse(raw)[studentId] || null;
  } catch (_) {
    return null;
  }
}

export function clearUnfinishedExam(studentId) {
  try {
    const raw = localStorage.getItem(UNFINISHED_KEY);
    if (!raw) return;
    const map = JSON.parse(raw);
    delete map[studentId];
    localStorage.setItem(UNFINISHED_KEY, JSON.stringify(map));
  } catch (_) {}
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function rowToExam(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    classId: row.class_id,
    questions: row.questions || [],
    duration: row.duration,
    grade: row.grade,
    curriculumId: row.curriculum_id,
    chapterId: row.chapter_id,
    topicId: row.topic_id,
    isPublished: row.is_published,
    isHidden: row.is_hidden === true,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pointsConfig: row.points_config,
    latexBulkCode: row.latex_bulk_code,
  };
}

function examToRow(exam) {
  const row = {
    id: String(exam.id || `exam_${Date.now()}`),
    title: exam.title,
    description: exam.description || null,
    class_id: exam.classId || null,
    questions: exam.questions || [],
    duration: exam.duration || 45,
    grade: exam.grade || null,
    curriculum_id: exam.curriculumId || null,
    chapter_id: exam.chapterId || null,
    topic_id: exam.topicId || null,
    is_published: exam.isPublished !== undefined ? exam.isPublished : true,
    is_hidden: exam.isHidden === true,
    created_by: exam.createdBy || null,
    points_config: exam.pointsConfig || null,
    latex_bulk_code: exam.latexBulkCode || null,
  };
  return row;
}

function getExamsFromLocal() {
  try {
    const raw = localStorage.getItem(EXAMS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function updateLocalExam(exam) {
  try {
    const exams = getExamsFromLocal();
    const idx = exams.findIndex(e => e.id === exam.id);
    if (idx >= 0) exams[idx] = exam;
    else exams.unshift(exam);
    localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
  } catch (_) {}
}

function saveExamToLocal(exam) {
  try {
    const exams = getExamsFromLocal();
    const saved = { ...exam, id: exam.id || `local-${Date.now()}` };
    const idx = exams.findIndex(e => e.id === saved.id);
    if (idx >= 0) exams[idx] = saved;
    else exams.unshift(saved);
    localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
    return saved;
  } catch (_) {
    return exam;
  }
}

function deleteExamFromLocal(examId) {
  try {
    const exams = getExamsFromLocal().filter(e => e.id !== examId);
    localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
  } catch (_) {}
}

function saveSessionToLocal({ examId, studentId, score, correctCount, totalQuestions, answers, flagged, timeSpent }) {
  try {
    const prev = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    if (!prev[studentId]) prev[studentId] = {};
    
    if (prev[studentId][examId] && !Array.isArray(prev[studentId][examId])) {
      prev[studentId][examId] = [prev[studentId][examId]];
    } else if (!prev[studentId][examId]) {
      prev[studentId][examId] = [];
    }
    
    prev[studentId][examId].push({
      examId, score, correctCount, totalQuestions, answers, flagged, timeSpent,
      completedAt: new Date().toISOString(),
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(prev));
  } catch (_) {}
}

function getStudentHistoryFromLocal(studentId) {
  try {
    const all = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    const studentHistory = all[studentId] || {};
    
    Object.keys(studentHistory).forEach(examId => {
       if (!Array.isArray(studentHistory[examId])) {
          studentHistory[examId] = [studentHistory[examId]];
       }
    });
    
    return studentHistory;
  } catch (_) {
    return {};
  }
}

function getAllExamSessionsFromLocal() {
  try {
    const all = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    const history = {};
    
    Object.keys(all).forEach(studentId => {
      const studentHistory = all[studentId];
      Object.keys(studentHistory).forEach(examId => {
        if (!history[examId]) history[examId] = [];
        
        // Handle array or object
        const sessions = Array.isArray(studentHistory[examId]) ? studentHistory[examId] : [studentHistory[examId]];
        
        sessions.forEach(s => {
          history[examId].push({
            studentId,
            ...s
          });
        });
      });
    });
    
    // Sort all arrays by completedAt desc
    Object.keys(history).forEach(examId => {
      history[examId].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    });
    
    return history;
  } catch (_) {
    return {};
  }
}

// ─── Online Exam Rooms (Phòng thi trực tuyến) ───────────────────────────────────

function getRoomsFromLocal() {
  try {
    const raw = localStorage.getItem(ROOMS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function saveRoomToLocal(room) {
  try {
    const rooms = getRoomsFromLocal();
    const idx = rooms.findIndex(r => r.id === room.id);
    if (idx >= 0) rooms[idx] = room;
    else rooms.unshift(room);
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    return room;
  } catch (_) {
    return room;
  }
}

function deleteRoomFromLocal(roomId) {
  try {
    const rooms = getRoomsFromLocal().filter(r => r.id !== roomId);
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  } catch (_) {}
}

export async function createExamRoom(roomData) {
  const room = {
    id: roomData.id || `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    exam_id: roomData.exam_id || roomData.examId,
    exam_title: roomData.exam_title || roomData.examTitle || 'Bài kiểm tra',
    created_by: roomData.created_by || 'lecongchuc02@gmail.com',
    created_at: new Date().toISOString(),
    status: 'active', // 'active' | 'closed'
    duration: Number(roomData.duration) || 45,
    shuffle_questions: Boolean(roomData.shuffle_questions),
    shuffle_answers: Boolean(roomData.shuffle_answers),
    max_violations: Number(roomData.max_violations) || 1, // Mặc định cảnh báo 1 lần, lần 2 tự nộp
    force_fullscreen: Boolean(roomData.force_fullscreen),
    cached_svgs: roomData.cached_svgs || {},
    exam_data: roomData.exam_data || null,
    students_attempted: {}
  };

  saveRoomToLocal(room);

  if (isSupabaseReady()) {
    // 1. Thử ghi vào bảng chuyên dụng exam_rooms nếu đã tạo
    try {
      await supabase.from('exam_rooms').upsert({
        id: room.id,
        exam_id: room.exam_id,
        exam_title: room.exam_title,
        status: room.status,
        duration: room.duration,
        shuffle_questions: room.shuffle_questions,
        shuffle_answers: room.shuffle_answers,
        max_violations: room.max_violations,
        force_fullscreen: room.force_fullscreen,
        cached_svgs: room.cached_svgs,
        exam_data: room.exam_data,
        created_at: room.created_at
      }, { onConflict: 'id' });
    } catch (_) {}

    // 2. Đồng thời lưu vào system_settings (bảng luôn sẵn có trong database)
    // Giúp tab ẩn danh và mọi thiết bị học sinh truy cập được phòng thi ngay lập tức
    try {
      await supabase.from('system_settings').upsert({
        key: `exam_room_${room.id}`,
        value: room
      }, { onConflict: 'key' });
    } catch (err) {
      console.warn('[examService] system_settings room upsert error:', err.message);
    }
  }

  return room;
}

export async function getExamRoom(roomId) {
  if (!roomId) return null;

  // 1. Kiểm tra Supabase nếu có
  if (isSupabaseReady()) {
    // 1a. Thử từ bảng exam_rooms
    try {
      const { data, error } = await supabase
        .from('exam_rooms')
        .select('*')
        .eq('id', roomId)
        .maybeSingle();

      if (!error && data) {
        const localRooms = getRoomsFromLocal();
        const existingLocal = localRooms.find(r => r.id === roomId);
        const merged = {
          ...data,
          students_attempted: { ...(existingLocal?.students_attempted || {}), ...(data.students_attempted || {}) }
        };
        saveRoomToLocal(merged);
        return merged;
      }
    } catch (_) {}

    // 1b. Thử từ system_settings (key: exam_room_${roomId})
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', `exam_room_${roomId}`)
        .maybeSingle();

      if (!error && data && data.value) {
        const remoteRoom = data.value;
        const localRooms = getRoomsFromLocal();
        const existingLocal = localRooms.find(r => r.id === roomId);
        const merged = {
          ...remoteRoom,
          students_attempted: { ...(existingLocal?.students_attempted || {}), ...(remoteRoom.students_attempted || {}) }
        };
        saveRoomToLocal(merged);
        return merged;
      }
    } catch (err) {
      console.warn('[examService] getExamRoom from system_settings error:', err.message);
    }
  }

  // 2. Fallback localStorage
  const rooms = getRoomsFromLocal();
  return rooms.find(r => r.id === roomId) || null;
}

/**
 * Đóng / Hủy link phòng thi: Xóa cached_svgs để giải phóng bộ nhớ
 */
export async function closeExamRoom(roomId) {
  const room = await getExamRoom(roomId);
  if (!room) return false;

  room.status = 'closed';
  // Xóa hình TikZ đã lưu trong bộ nhớ để tiết kiệm dung lượng như yêu cầu của giáo viên
  room.cached_svgs = null;

  saveRoomToLocal(room);

  if (isSupabaseReady()) {
    try {
      await supabase.from('exam_rooms').update({
        status: 'closed',
        cached_svgs: null
      }).eq('id', roomId);
    } catch (_) {}

    try {
      await supabase.from('system_settings').upsert({
        key: `exam_room_${roomId}`,
        value: room
      }, { onConflict: 'key' });
    } catch (_) {}
  }

  return true;
}

export async function deleteExamRoom(roomId) {
  deleteRoomFromLocal(roomId);
  if (isSupabaseReady()) {
    try { await supabase.from('exam_rooms').delete().eq('id', roomId); } catch (_) {}
    try { await supabase.from('system_settings').delete().eq('key', `exam_room_${roomId}`); } catch (_) {}
    try { await supabase.from('system_settings').delete().eq('key', `exam_subs_${roomId}`); } catch (_) {}
  }
  return true;
}

export async function getActiveRoomsByExamId(examId) {
  const rooms = await getAllExamRooms();
  return rooms.filter(r => (String(r.exam_id) === String(examId) || String(r.examId) === String(examId)) && r.status === 'active');
}

export async function getAllExamRooms() {
  const localRooms = getRoomsFromLocal();
  if (!isSupabaseReady()) return localRooms;

  let remoteRooms = [];
  // 1. Thử exam_rooms
  try {
    const { data, error } = await supabase
      .from('exam_rooms')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data) && data.length > 0) {
      remoteRooms = data;
    }
  } catch (_) {}

  // 2. Thử system_settings
  if (remoteRooms.length === 0) {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .like('key', 'exam_room_%');
      if (!error && Array.isArray(data)) {
        remoteRooms = data.map(d => d.value).filter(Boolean);
      }
    } catch (_) {}
  }

  // 3. Tự động đồng bộ các phòng local chưa có trên remote lên system_settings
  for (const lr of localRooms) {
    if (lr.status === 'active' && !remoteRooms.some(rr => rr.id === lr.id)) {
      try {
        await supabase.from('system_settings').upsert({
          key: `exam_room_${lr.id}`,
          value: lr
        }, { onConflict: 'key' });
      } catch (_) {}
      remoteRooms.push(lr);
    }
  }

  if (remoteRooms.length > 0) {
    const map = new Map();
    remoteRooms.forEach(r => map.set(r.id, r));
    localRooms.forEach(r => {
      if (!map.has(r.id)) map.set(r.id, r);
    });
    const merged = Array.from(map.values());
    localStorage.setItem(ROOMS_KEY, JSON.stringify(merged));
    return merged;
  }

  return localRooms;
}

/**
 * Kiểm tra xem thí sinh này đã từng nộp bài cho phòng thi này hay chưa (1 lần duy nhất)
 */
export async function hasStudentSubmittedRoom(roomId, studentIdentifier) {
  if (!roomId || !studentIdentifier) return false;

  const room = await getExamRoom(roomId);
  if (room && room.students_attempted && room.students_attempted[studentIdentifier]) {
    return true;
  }

  // Kiểm tra bảng local submissions
  try {
    const raw = localStorage.getItem(ROOM_SUBMISSIONS_KEY);
    if (raw) {
      const allSubmissions = JSON.parse(raw);
      const studentSubmissions = allSubmissions[roomId] || [];
      const found = studentSubmissions.some(s => 
        String(s.studentId).toLowerCase() === String(studentIdentifier).toLowerCase() ||
        String(s.studentPhone).toLowerCase() === String(studentIdentifier).toLowerCase()
      );
      if (found) return true;
    }
  } catch (_) {}

  // Kiểm tra qua Supabase system_settings & exam_sessions
  if (isSupabaseReady()) {
    try {
      const { data } = await supabase.from('system_settings').select('value').eq('key', `exam_subs_${roomId}`).maybeSingle();
      if (data && Array.isArray(data.value)) {
        const found = data.value.some(s =>
          String(s.studentId).toLowerCase() === String(studentIdentifier).toLowerCase() ||
          String(s.studentPhone).toLowerCase() === String(studentIdentifier).toLowerCase()
        );
        if (found) return true;
      }
    } catch (_) {}

    try {
      const { data, error } = await supabase
        .from('exam_sessions')
        .select('id')
        .eq('class_id', roomId) // Dùng class_id để phân biệt room_id
        .eq('student_id', studentIdentifier)
        .limit(1);

      if (!error && data && data.length > 0) return true;
    } catch (_) {}
  }

  return false;
}

/**
 * Nộp bài thi trực tuyến cho phòng thi
 */
export async function submitRoomExamSession({
  roomId,
  examId,
  studentId,
  studentName,
  studentClass,
  studentPhone,
  answers,
  flagged,
  score,
  correctCount,
  totalQuestions,
  timeSpent,
  violationsCount = 0,
  isViolationSubmit = false
}) {
  const sessionItem = {
    id: `rs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    roomId,
    examId,
    studentId,
    studentName,
    studentClass: studentClass || '',
    studentPhone: studentPhone || '',
    answers,
    flagged: flagged || [],
    score,
    correctCount,
    totalQuestions,
    timeSpent,
    violationsCount,
    isViolationSubmit,
    submittedAt: new Date().toISOString()
  };

  // 1. Lưu vào danh sách nộp bài của phòng thi trong localStorage
  try {
    const all = JSON.parse(localStorage.getItem(ROOM_SUBMISSIONS_KEY) || '{}');
    if (!all[roomId]) all[roomId] = [];
    all[roomId].unshift(sessionItem);
    localStorage.setItem(ROOM_SUBMISSIONS_KEY, JSON.stringify(all));

    // Đánh dấu học sinh đã làm
    const room = await getExamRoom(roomId);
    if (room) {
      if (!room.students_attempted) room.students_attempted = {};
      room.students_attempted[studentId] = true;
      if (studentPhone) room.students_attempted[studentPhone] = true;
      saveRoomToLocal(room);
      if (isSupabaseReady()) {
        try {
          await supabase.from('system_settings').upsert({
            key: `exam_room_${roomId}`,
            value: room
          }, { onConflict: 'key' });
        } catch (_) {}
      }
    }
  } catch (err) {
    console.warn('[examService] Error saving room session locally:', err);
  }

  // 2. Lưu vào lịch sử chung của học sinh
  saveSessionToLocal({
    examId,
    studentId,
    score,
    correctCount,
    totalQuestions,
    answers,
    flagged,
    timeSpent
  });

  // 3. Đẩy lên Supabase system_settings & exam_sessions nếu có
  if (isSupabaseReady()) {
    try {
      const { data } = await supabase.from('system_settings').select('value').eq('key', `exam_subs_${roomId}`).maybeSingle();
      const subs = Array.isArray(data?.value) ? data.value : [];
      subs.unshift(sessionItem);
      await supabase.from('system_settings').upsert({ key: `exam_subs_${roomId}`, value: subs }, { onConflict: 'key' });
    } catch (_) {}

    try {
      await supabase.from('exam_sessions').insert({
        exam_id: examId,
        student_id: studentId,
        student_name: studentName,
        class_id: roomId, // Lưu roomId vào class_id để dễ phân loại
        answers,
        flagged: flagged || [],
        score,
        correct_count: correctCount,
        total_questions: totalQuestions,
        time_spent: timeSpent,
        submitted_at: sessionItem.submittedAt
      });
    } catch (err) {
      console.warn('[examService] Supabase submit room session error:', err.message);
    }
  }

  return { success: true, session: sessionItem };
}

export async function getExamRoomSubmissions(roomId) {
  let localSubs = [];
  try {
    const all = JSON.parse(localStorage.getItem(ROOM_SUBMISSIONS_KEY) || '{}');
    localSubs = all[roomId] || [];
  } catch (_) {}

  if (isSupabaseReady()) {
    try {
      const { data } = await supabase.from('system_settings').select('value').eq('key', `exam_subs_${roomId}`).maybeSingle();
      if (data && Array.isArray(data.value)) {
        const map = new Map();
        localSubs.forEach(s => map.set(s.id, s));
        data.value.forEach(s => map.set(s.id, s));
        const merged = Array.from(map.values()).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        return merged;
      }
    } catch (_) {}
  }

  return localSubs;
}

