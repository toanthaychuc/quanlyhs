/**
 * examService.js
 * CRUD + realtime for exams and exam sessions via Supabase.
 * Falls back to localStorage if Supabase is not configured.
 */
import supabase from '../lib/supabase';

const EXAMS_KEY     = 'edumanager_exams_data_v7';
const HISTORY_KEY   = 'edumanager_completed_exams';
const UNFINISHED_KEY = 'edumanager_unfinished_exams';
const GAMI_KEY      = 'edumanager_gamification';

const isSupabaseReady = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

// ─── Exams ────────────────────────────────────────────────────────────────────

export async function getExams() {
  const localExams = getExamsFromLocal();

  if (!isSupabaseReady()) {
    return localExams;
  }

  try {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const dbExams = (data || []).map(rowToExam);
    let merged = [...dbExams];
    let needSyncUp = false;

    // Giữ lại các đề thi đã tạo ở local mà Supabase chưa kịp lưu
    for (const le of localExams) {
      if (!merged.some(e => e.id === le.id)) {
        merged.push(le);
        needSyncUp = true;
      }
    }

    localStorage.setItem(EXAMS_KEY, JSON.stringify(merged));

    if (needSyncUp) {
      merged.forEach(ex => saveExam(ex).catch(() => {}));
    }

    return merged;
  } catch (err) {
    console.error('[examService] getExams error, fallback to local:', err);
    return localExams;
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
  saveSessionToLocal({ examId, studentId, score, correctCount, totalQuestions });

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
      .select('exam_id, score, correct_count, total_questions, submitted_at')
      .eq('student_id', studentId)
      .not('submitted_at', 'is', null);

    if (error) throw error;

    // Convert to the same shape as localStorage history
    const history = {};
    for (const s of (data || [])) {
      history[s.exam_id] = {
        examId: s.exam_id,
        score: s.score,
        correctCount: s.correct_count,
        totalQuestions: s.total_questions,
        completedAt: s.submitted_at,
      };
    }
    return history;
  } catch (err) {
    console.error('[examService] getStudentHistory error:', err);
    return getStudentHistoryFromLocal(studentId);
  }
}

// ─── Gamification ─────────────────────────────────────────────────────────────

/**
 * Update gamification data for a student (XP, streak, badges).
 */
export async function updateGamification(studentId, gamiData) {
  // Always update local first
  const allGami = JSON.parse(localStorage.getItem(GAMI_KEY) || '{}');
  allGami[studentId] = gamiData;
  localStorage.setItem(GAMI_KEY, JSON.stringify(allGami));
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

    return {
      xp: data.xp,
      streak: data.streak,
      lastLoginDate: data.last_login_date,
      lastActiveDate: data.last_active_date,
      badges: data.badges || [],
    };
  } catch (err) {
    console.error('[examService] getGamification error:', err);
    const allGami = JSON.parse(localStorage.getItem(GAMI_KEY) || '{}');
    return allGami[studentId] || { xp: 0, streak: 0, badges: [] };
  }
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
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
    created_by: exam.createdBy || null,
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

function saveSessionToLocal({ examId, studentId, score, correctCount, totalQuestions }) {
  try {
    const prev = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    if (!prev[studentId]) prev[studentId] = {};
    prev[studentId][examId] = {
      examId, score, correctCount, totalQuestions,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(prev));
  } catch (_) {}
}

function getStudentHistoryFromLocal(studentId) {
  try {
    const all = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    return all[studentId] || {};
  } catch (_) {
    return {};
  }
}
