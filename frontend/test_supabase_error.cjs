const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://abc.supabase.co';
const supabaseKey = 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    const { data, error } = await supabase.from('students').delete().eq('class_id', '123').not('id', 'in', "('a','b')");
    console.log("Data:", data);
    console.log("Error:", error);
  } catch (e) {
    console.log("Caught exception:", e);
  }
}
run();
