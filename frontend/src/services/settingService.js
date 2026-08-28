/**
 * settingService.js
 * CRUD for system-wide settings (Social links, Exam target date, Target score) via Supabase.
 */
import supabase from '../lib/supabase';

const isSupabaseReady = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export async function getSetting(key, defaultValue = null, forceSync = false) {
  const localVal = getLocalSetting(key, defaultValue);
  if (!forceSync && localVal !== null) return localVal;

  if (!isSupabaseReady()) return localVal;

  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (data && data.value !== undefined) {
      saveLocalSetting(key, data.value);
      return data.value;
    }

    // If not in Supabase yet but exists in local, auto-push to Supabase
    if (localVal !== null && localVal !== undefined) {
      saveSetting(key, localVal).catch(() => {});
    }

    return localVal;
  } catch (err) {
    console.error(`[settingService] getSetting(${key}) error:`, err);
    return localVal;
  }
}

export async function saveSetting(key, value) {
  saveLocalSetting(key, value);

  if (!isSupabaseReady()) return { success: true };

  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({ key, value }, { onConflict: 'key' });
    if (error) {
      console.error('[settingService] Supabase Error:', error);
      throw error;
    }
    return { success: true };
  } catch (err) {
    console.error(`[settingService] saveSetting(${key}) error:`, err);
    return { success: false, error: err.message };
  }
}

function getLocalSetting(key, defaultValue) {
  try {
    const raw = localStorage.getItem(`edumanager_setting_${key}`);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (_) {
    return defaultValue;
  }
}

function saveLocalSetting(key, value) {
  try {
    localStorage.setItem(`edumanager_setting_${key}`, JSON.stringify(value));
  } catch (_) {}
}
