/**
 * classService.js
 * CRUD operations for classes and students via Supabase.
 * Falls back gracefully if Supabase is not configured.
 */
import supabase from '../lib/supabase';
import { INITIAL_CLASSES_DATA } from '../data/classesData';

const LOCAL_KEY = 'edumanager_classes_data';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Check whether Supabase is properly configured */
const isSupabaseReady = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

/** Normalize a DB row → app shape */
function rowToClass(row) {
  return {
    id: row.id,
    name: row.name,
    school: row.school,
    schoolFullName: row.school_full_name,
    grade: row.grade,
    academicYear: row.academic_year,
    teacher: row.teacher || 'Thầy Lê Công Chức',
    subject: row.subject,
    color: row.color,
    scoreColumns: row.score_columns || [],
    students: [],  // students loaded separately
  };
}

/** Normalize a student DB row → app shape */
function rowToStudent(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    scores: row.scores || {},
    notes: row.notes || '',
  };
}

export async function getClasses() {
  const localClasses = getClassesFromLocal();

  if (!isSupabaseReady()) {
    return localClasses;
  }

  try {
    const [classRes, studentRes] = await Promise.all([
      supabase.from('classes').select('*').order('created_at'),
      supabase.from('students').select('*').order('name'),
    ]);

    if (classRes.error) throw classRes.error;
    if (studentRes.error) throw studentRes.error;

    const dbClasses = classRes.data || [];
    const dbStudents = studentRes.data || [];

    // Map students by class_id from DB
    const studentsByClass = {};
    for (const s of dbStudents) {
      if (!studentsByClass[s.class_id]) studentsByClass[s.class_id] = [];
      studentsByClass[s.class_id].push(rowToStudent(s));
    }

    // Base result from DB
    let mergedClasses = dbClasses.map(row => ({
      ...rowToClass(row),
      students: studentsByClass[row.id] || [],
    }));

    // BẢO VỆ DỮ LIỆU: Nếu Local có dữ liệu lớp/học sinh mà Supabase chưa có -> Giữ lại và tự động đẩy lên Supabase
    let needSyncUp = false;
    for (const localCls of localClasses) {
      const matchedIdx = mergedClasses.findIndex(c => c.id === localCls.id);
      if (matchedIdx === -1) {
        // Lớp này có ở local nhưng chưa có trên Supabase
        mergedClasses.push(localCls);
        needSyncUp = true;
      } else {
        // Nếu lớp trên Supabase chưa có học sinh nào, nhưng local lại có danh sách học sinh
        if ((mergedClasses[matchedIdx].students || []).length === 0 && (localCls.students || []).length > 0) {
          mergedClasses[matchedIdx].students = localCls.students;
          needSyncUp = true;
        }
      }
    }

    // Lưu cache an toàn vào localStorage
    localStorage.setItem(LOCAL_KEY, JSON.stringify(mergedClasses));

    // Nếu phát hiện local có dữ liệu phong phú hơn -> Tự động đồng bộ lên Supabase
    if (needSyncUp) {
      saveAllClasses(mergedClasses).catch(e => console.warn('Auto-sync to Supabase warning:', e));
    }

    return mergedClasses;
  } catch (err) {
    console.error('[classService] getClasses error, using localStorage fallback:', err);
    return localClasses;
  }
}

function getClassesFromLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(c => ({ ...c, teacher: 'Thầy Lê Công Chức' }));
      }
    }
  } catch (_) {}
  return INITIAL_CLASSES_DATA;
}

/**
 * Save (upsert) an entire class object (metadata + all students).
 */
export async function saveClass(cls) {
  if (!isSupabaseReady()) {
    return saveClassToLocal(cls);
  }

  try {
    // 1. Upsert class metadata
    const classRow = {
      id: cls.id,
      name: cls.name,
      school: cls.school,
      school_full_name: cls.schoolFullName,
      grade: cls.grade,
      academic_year: cls.academicYear,
      teacher: cls.teacher || 'Thầy Lê Công Chức',
      subject: cls.subject,
      color: cls.color,
      score_columns: cls.scoreColumns,
    };
    const { error: classErr } = await supabase
      .from('classes')
      .upsert(classRow, { onConflict: 'id' });
    if (classErr) throw classErr;

    // 2. Replace all students for this class
    if (cls.students && cls.students.length > 0) {
      // Delete removed students
      const studentIds = cls.students.map(s => s.id);
      await supabase
        .from('students')
        .delete()
        .eq('class_id', cls.id)
        .not('id', 'in', `(${studentIds.map(id => `'${id}'`).join(',')})`);

      // Upsert current students
      const studentRows = cls.students.map(s => ({
        id: s.id,
        class_id: cls.id,
        name: s.name,
        phone: s.phone || null,
        scores: s.scores || {},
        notes: s.notes || null,
      }));
      const { error: stuErr } = await supabase
        .from('students')
        .upsert(studentRows, { onConflict: 'id' });
      if (stuErr) throw stuErr;
    } else {
      // Remove all students if empty
      await supabase.from('students').delete().eq('class_id', cls.id);
    }

    return { success: true };
  } catch (err) {
    console.error('[classService] saveClass error:', err);
    saveClassToLocal(cls);
    return { success: false, error: err.message };
  }
}

/**
 * Save multiple classes at once (batch upsert).
 */
export async function saveAllClasses(classes) {
  if (!isSupabaseReady()) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(classes));
    return { success: true };
  }

  try {
    await Promise.all(classes.map(cls => saveClass(cls)));
    localStorage.setItem(LOCAL_KEY, JSON.stringify(classes));
    return { success: true };
  } catch (err) {
    console.error('[classService] saveAllClasses error:', err);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(classes));
    return { success: false, error: err.message };
  }
}

/**
 * Delete a class and all its students (cascade handled by DB).
 */
export async function deleteClass(classId) {
  if (!isSupabaseReady()) {
    return deleteClassFromLocal(classId);
  }

  try {
    const { error } = await supabase.from('classes').delete().eq('id', classId);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[classService] deleteClass error:', err);
    return { success: false, error: err.message };
  }
}

function saveClassToLocal(cls) {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const classes = raw ? JSON.parse(raw) : [];
    const idx = classes.findIndex(c => c.id === cls.id);
    if (idx >= 0) classes[idx] = cls;
    else classes.push(cls);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(classes));
  } catch (_) {}
}

function deleteClassFromLocal(classId) {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return;
    const classes = JSON.parse(raw).filter(c => c.id !== classId);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(classes));
  } catch (_) {}
}
