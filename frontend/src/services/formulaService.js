import supabase from '../lib/supabase';

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
