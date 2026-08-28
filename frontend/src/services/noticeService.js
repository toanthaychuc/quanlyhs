/**
 * noticeService.js
 * CRUD for teacher notices (thông báo trên Dashboard).
 */
import supabase from '../lib/supabase';

const LOCAL_KEY = 'edumanager_notices';

const isSupabaseReady = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

function getNoticesFromLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch (_) {
    return [];
  }
}

export async function getNotices(forceSync = false) {
  if (!forceSync) {
    const local = getNoticesFromLocal();
    if (local && local.length > 0) return local;
  }
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
    const notices = (data || []).map(r => {
      let extra = {};
      try { extra = JSON.parse(r.type); } catch (e) {}
      return {
        id: r.id,
        title: r.title,
        content: r.content,
        type: r.type,
        createdAt: r.created_at,
        isPinned: extra.isPinned || false,
        targetClass: extra.targetClass || 'ALL',
        author: extra.author || 'Thầy Lê Công Chức',
        date: extra.date || 'Gần đây',
      };
    });
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
      type: JSON.stringify({
        isPinned: notice.isPinned,
        targetClass: notice.targetClass,
        author: notice.author,
        date: notice.date
      }),
      created_by: notice.createdBy || null,
    };
    let queryResult;
    if (notice.id && /^[0-9a-f-]{36}$/.test(notice.id)) {
      row.id = notice.id;
      queryResult = await supabase.from('notices').upsert(row, { onConflict: 'id' }).select().single();
    } else {
      queryResult = await supabase.from('notices').insert(row).select().single();
    }

    const { data, error } = queryResult;
    if (error) {
      console.error('[noticeService] Supabase Error:', error);
      throw error;
    }
    return { success: true, notice: { id: data.id, ...notice } };
  } catch (err) {
    console.error('[noticeService] saveNotice error:', err);
    return saveNoticeToLocal(notice);
  }
}

export async function saveAllNotices(notices) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(notices));
  if (!isSupabaseReady()) return { success: true };

  try {
    const rows = notices.map(n => ({
      id: String(n.id),
      title: n.title,
      content: n.content,
      type: JSON.stringify({
        isPinned: n.isPinned,
        targetClass: n.targetClass,
        author: n.author,
        date: n.date
      }),
      created_by: n.createdBy || null,
    }));
    
    if (rows.length > 0) {
      const { error: upsertErr } = await supabase.from('notices').upsert(rows, { onConflict: 'id' });
      if (upsertErr) throw upsertErr;
    }
    
    const validIds = rows.map(r => r.id);
    if (validIds.length > 0) {
      await supabase.from('notices').delete().not('id', 'in', `(${validIds.map(id => `"${id}"`).join(',')})`);
    } else {
      await supabase.from('notices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    
    return { success: true };
  } catch (err) {
    console.error('[noticeService] saveAllNotices error:', err);
    return { success: false, error: err.message };
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
