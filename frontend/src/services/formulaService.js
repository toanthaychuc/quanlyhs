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

export const getFormulas = async () => {
  const { data, error } = await supabase
    .from('formulas')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching formulas:', error);
    throw error;
  }
  return data;
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
