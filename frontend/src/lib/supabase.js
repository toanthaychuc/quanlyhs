import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing env vars: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY\n' +
    'Tạo file frontend/.env.local và thêm 2 biến này từ Supabase dashboard.'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    realtime: {
      params: { eventsPerSecond: 10 }
    }
  }
);

export default supabase;
