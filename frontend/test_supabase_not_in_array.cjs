const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://abc.supabase.co';
const supabaseKey = 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

let studentIds = ['a', 'b'];

const query = supabase.from('students').delete().eq('class_id', '123').not('id', 'in', studentIds);
console.log("USING ARRAY:", query.url.toString());

// What about .in ?
const query2 = supabase.from('students').delete().eq('class_id', '123').in('id', studentIds);
console.log("USING IN WITH ARRAY:", query2.url.toString());
