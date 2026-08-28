/**
 * assignmentService.js
 * CRUD operations for assignments via Supabase with localStorage fallback.
 */
import supabase from '../lib/supabase';

const LOCAL_KEY = 'edumanager_class_assignments_v2';

const isSupabaseReady = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

function rowToAssignment(row) {
  return {
    id: row.id,
    classId: row.class_id,
    title: row.title,
    description: row.description || '',
    type: row.type || 'latex',
    dueDate: row.due_date || '',
    ...(row.data || {}),
  };
}

function assignmentToRow(asg) {
  const { id, classId, title, description, type, dueDate, ...rest } = asg;
  return {
    id: String(id),
    class_id: classId || null,
    title: title || 'Bài tập',
    description: description || null,
    type: type || 'latex',
    due_date: dueDate || null,
    data: rest || {},
  };
}

export async function getAssignments() {
  if (!isSupabaseReady()) {
    return getLocalAssignments();
  }

  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      const formatted = data.map(rowToAssignment);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(formatted));
      return formatted;
    }
    return getLocalAssignments();
  } catch (err) {
    console.error('[assignmentService] getAssignments error:', err);
    return getLocalAssignments();
  }
}

export async function saveAssignment(asg) {
  const asgId = asg.id || `asg_${Date.now()}`;
  const fullAsg = { ...asg, id: asgId };

  // Save to local
  saveLocalAssignment(fullAsg);

  if (!isSupabaseReady()) return { success: true, assignment: fullAsg };

  try {
    const row = assignmentToRow(fullAsg);
    const { data, error } = await supabase
      .from('assignments')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return { success: true, assignment: rowToAssignment(data) };
  } catch (err) {
    console.error('[assignmentService] saveAssignment error:', err);
    return { success: false, error: err.message };
  }
}

export async function saveAllAssignments(assignments) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(assignments));
  if (!isSupabaseReady()) return { success: true };

  try {
    const rows = assignments.map(assignmentToRow);
    const { error } = await supabase.from('assignments').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[assignmentService] saveAllAssignments error:', err);
    return { success: false, error: err.message };
  }
}

export async function deleteAssignment(id) {
  deleteLocalAssignment(id);
  if (!isSupabaseReady()) return { success: true };

  try {
    const { error } = await supabase.from('assignments').delete().eq('id', String(id));
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[assignmentService] deleteAssignment error:', err);
    return { success: false, error: err.message };
  }
}

function getLocalAssignments() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveLocalAssignment(asg) {
  try {
    const list = getLocalAssignments();
    const idx = list.findIndex(a => a.id === asg.id);
    if (idx >= 0) list[idx] = asg;
    else list.unshift(asg);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch (_) {}
}

function deleteLocalAssignment(id) {
  try {
    const list = getLocalAssignments().filter(a => a.id !== id);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch (_) {}
}
