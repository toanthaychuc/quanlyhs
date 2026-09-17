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
  const { data, error } = await supabase
    .from('formulas')
    .insert([formula])
    .select();

  if (error) {
    console.error('Error adding formula:', error);
    throw error;
  }
  return data[0];
};

export const updateFormula = async (id, updates) => {
  const { data, error } = await supabase
    .from('formulas')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating formula:', error);
    throw error;
  }
  return data[0];
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
