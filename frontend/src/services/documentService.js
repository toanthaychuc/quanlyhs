/**
 * documentService.js
 * CRUD operations for teacher documents via Supabase with localStorage fallback.
 */
import supabase from '../lib/supabase';

const LOCAL_KEY = 'edumanager_teacher_documents';

const isSupabaseReady = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

function rowToDoc(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    subCategory: row.sub_category,
    subject: row.subject,
    coverUrl: row.cover_url,
    driveLink: row.drive_link,
  };
}

function docToRow(doc) {
  return {
    id: String(doc.id),
    title: doc.title,
    category: doc.category || 'grade-12',
    sub_category: doc.subCategory || 'book',
    subject: doc.subject || '',
    cover_url: doc.coverUrl || null,
    drive_link: doc.driveLink || '',
  };
}

export async function getDocuments(forceSync = false) {
  if (!forceSync) {
    const local = getLocalDocuments();
    if (local && local.length > 0) return local;
  }
  if (!isSupabaseReady()) {
    return getLocalDocuments();
  }

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (Array.isArray(data)) {
      const formatted = data.map(rowToDoc);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(formatted));
      return formatted;
    }
    return getLocalDocuments();
  } catch (err) {
    console.error('[documentService] getDocuments error:', err);
    return getLocalDocuments();
  }
}

export async function saveDocument(doc) {
  const docId = doc.id || `doc_${Date.now()}`;
  const fullDoc = { ...doc, id: docId };

  // Save to local
  saveLocalDocument(fullDoc);

  if (!isSupabaseReady()) return { success: true, document: fullDoc };

  try {
    const row = docToRow(fullDoc);
    const { data, error } = await supabase
      .from('documents')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return { success: true, document: rowToDoc(data) };
  } catch (err) {
    console.error('[documentService] saveDocument error:', err);
    return { success: false, error: err.message };
  }
}

export async function saveAllDocuments(docs) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(docs));
  if (!isSupabaseReady()) return { success: true };

  try {
    const rows = docs.map(docToRow);
    const { error } = await supabase.from('documents').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[documentService] saveAllDocuments error:', err);
    return { success: false, error: err.message };
  }
}

export async function deleteDocument(id) {
  deleteLocalDocument(id);
  if (!isSupabaseReady()) return { success: true };

  try {
    const { error } = await supabase.from('documents').delete().eq('id', String(id));
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[documentService] deleteDocument error:', err);
    return { success: false, error: err.message };
  }
}

function getLocalDocuments() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveLocalDocument(doc) {
  try {
    const list = getLocalDocuments();
    const idx = list.findIndex(d => d.id === doc.id);
    if (idx >= 0) list[idx] = doc;
    else list.unshift(doc);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch (_) {}
}

function deleteLocalDocument(id) {
  try {
    const list = getLocalDocuments().filter(d => d.id !== id);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch (_) {}
}
