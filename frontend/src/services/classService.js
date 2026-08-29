/**
 * classService.js
 * CRUD operations for classes and students via Supabase.
 * Falls back gracefully if Supabase is not configured.
 */
import supabase from '../lib/supabase';
const LOCAL_KEY = 'edumanager_classes_data_v2';

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
  const { _gender, _dob, _email, _note, _address, ...realScores } = row.scores || {};
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    scores: realScores,
    notes: row.notes || '',
    note: _note || row.notes || '',
    gender: _gender || 'Nam',
    dob: _dob || '',
    email: _email || '',
    address: _address || '',
  };
}

export async function getClasses(forceSync = false) {
  if (!forceSync) {
    const local = getClassesFromLocal();
    if (local && local.length > 0) return local;
  }
  if (!isSupabaseReady()) {
    return getClassesFromLocal();
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

    // Lưu cache an toàn vào localStorage
    localStorage.setItem(LOCAL_KEY, JSON.stringify(mergedClasses));

    return mergedClasses;
  } catch (err) {
    console.error('[classService] getClasses error, using localStorage fallback:', err);
    return getClassesFromLocal();
  }
}

function getClassesFromLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(c => ({ ...c, teacher: 'Thầy Lê Công Chức' }));
      }
    }
  } catch (_) {}
  return [];
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
      const studentRows = cls.students.map(s => {
        const enrichedScores = { ...s.scores };
        if (s.gender) enrichedScores._gender = s.gender;
        if (s.dob) enrichedScores._dob = s.dob;
        if (s.email) enrichedScores._email = s.email;
        if (s.note) enrichedScores._note = s.note;
        if (s.address) enrichedScores._address = s.address;

        return {
          id: s.id,
          class_id: cls.id,
          name: s.name,
          phone: s.phone || null,
          scores: enrichedScores,
          notes: s.notes || s.note || null,
        };
      });
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
