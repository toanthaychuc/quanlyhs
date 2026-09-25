import supabase from '../lib/supabase';

export const updateFormulaOrders = async (formulas) => {
  const updates = formulas.map((f, index) => {
    return supabase
      .from('formulas')
      .update({ order_index: index })
      .eq('id', f.id);
  });
  
  const results = await Promise.all(updates);
  const errors = results.filter(r => r.error).map(r => r.error);
  if (errors.length > 0) {
    console.error('Error updating formula orders:', errors);
    throw new Error('Failed to update formula orders');
  }
  return true;
};

const LOCAL_FORMULAS_KEY = 'edumanager_formulas_cache';

export const getLocalFormulas = () => {
  try {
    const raw = localStorage.getItem(LOCAL_FORMULAS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
};

export const saveLocalFormulas = (list) => {
  try {
    // Strip cached_svgs from local cache to avoid exceeding localStorage quota
    const lightList = (list || []).map(({ cached_svgs, ...rest }) => rest);
    localStorage.setItem(LOCAL_FORMULAS_KEY, JSON.stringify(lightList));
  } catch (err) {
    console.warn('[formulaService] Could not save to localStorage:', err);
  }
};

export const getFormulaCachedSvgs = async (id) => {
  if (!id) return {};
  try {
    const { data, error } = await supabase
      .from('formulas')
      .select('cached_svgs')
      .eq('id', id)
      .single();

    if (error) {
      console.warn('[formulaService] Error fetching cached_svgs for formula:', id, error);
      return {};
    }
    return data?.cached_svgs || {};
  } catch (err) {
    console.warn('[formulaService] Error fetching cached_svgs:', err);
    return {};
  }
};

export const getFormulas = async () => {
  try {
    // Tải danh sách công thức nhẹ (không kèm 8MB ảnh SVG thô) để giao diện mở tức thì
    const { data, error } = await supabase
      .from('formulas')
      .select('id, title, content, order_index, class_level, created_at, updated_at')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('[formulaService] Error fetching formulas from Supabase:', error);
      const local = getLocalFormulas();
      if (local && local.length > 0) return local;
      throw error;
    }

    if (Array.isArray(data)) {
      saveLocalFormulas(data);
      return data;
    }

    return getLocalFormulas();
  } catch (err) {
    console.warn('[formulaService] Network failed, using local formulas:', err);
    return getLocalFormulas();
  }
};

export const addFormula = async (formula) => {
  try {
    const { data, error } = await supabase
      .from('formulas')
      .insert([formula])
      .select();

    if (error) {
      if (error.message && error.message.includes('cached_svgs')) {
        const { cached_svgs, ...rest } = formula;
        const fallbackRes = await supabase
          .from('formulas')
          .insert([rest])
          .select();
        if (fallbackRes.error) throw fallbackRes.error;
        return fallbackRes.data[0];
      }
      throw error;
    }
    return data[0];
  } catch (err) {
    console.error('Error adding formula:', err);
    throw err;
  }
};

export const updateFormula = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('formulas')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) {
      if (error.message && error.message.includes('cached_svgs')) {
        const { cached_svgs, ...rest } = updates;
        const fallbackRes = await supabase
          .from('formulas')
          .update({ ...rest, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select();
        if (fallbackRes.error) throw fallbackRes.error;
        return fallbackRes.data[0];
      }
      throw error;
    }
    return data[0];
  } catch (err) {
    console.error('Error updating formula:', err);
    throw err;
  }
};

export const deleteFormula = async (id) => {
  const { error } = await supabase
    .from('formulas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting formula:', error);
    throw error;
  }
  return true;
};
