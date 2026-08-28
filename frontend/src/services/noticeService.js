/**
 * noticeService.js
 * CRUD for teacher notices (thông báo trên Dashboard).
 */
import supabase from '../lib/supabase';

const LOCAL_KEY = 'edumanager_notices';

const isSupabaseReady = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export async function getNotices() {
  if (!isSupabaseReady()) {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    } catch (_) { return []; }
  }

  try {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const notices = (data || []).map(r => ({
      id: r.id,
      title: r.title,
      content: r.content,
      type: r.type,
      createdAt: r.created_at,
    }));
    localStorage.setItem(LOCAL_KEY, JSON.stringify(notices));
    return notices;
  } catch (err) {
    console.error('[noticeService] getNotices error:', err);
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); } catch (_) { return []; }
  }
}

export async function saveNotice(notice) {
  if (!isSupabaseReady()) {
    return saveNoticeToLocal(notice);
  }

  try {
    const row = {
      title: notice.title,
      content: notice.content,
      type: notice.type || 'info',
      created_by: notice.createdBy || null,
    };
    if (notice.id && /^[0-9a-f-]{36}$/.test(notice.id)) row.id = notice.id;

    const { data, error } = await supabase
      .from('notices')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return { success: true, notice: { id: data.id, ...notice } };
  } catch (err) {
    console.error('[noticeService] saveNotice error:', err);
    return saveNoticeToLocal(notice);
  }
}

export async function deleteNotice(noticeId) {
  if (!isSupabaseReady()) {
    return deleteNoticeFromLocal(noticeId);
  }

  try {
    const { error } = await supabase.from('notices').delete().eq('id', noticeId);
    if (error) throw error;
    deleteNoticeFromLocal(noticeId);
    return { success: true };
  } catch (err) {
    console.error('[noticeService] deleteNotice error:', err);
    return { success: false, error: err.message };
  }
}

function saveNoticeToLocal(notice) {
  try {
    const notices = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    const saved = { ...notice, id: notice.id || `local-${Date.now()}` };
    const idx = notices.findIndex(n => n.id === saved.id);
    if (idx >= 0) notices[idx] = saved;
    else notices.unshift(saved);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(notices));
    return { success: true, notice: saved };
  } catch (_) { return { success: false }; }
}

function deleteNoticeFromLocal(noticeId) {
  try {
    const notices = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]').filter(n => n.id !== noticeId);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(notices));
  } catch (_) {}
}
