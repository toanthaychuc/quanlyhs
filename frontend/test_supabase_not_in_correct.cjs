const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://abc.supabase.co';
const supabaseKey = 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

let studentIds = ['a', 'b'];

// Correct string without quotes
let notInString = `(${studentIds.join(',')})`;

const query = supabase.from('students').delete().eq('class_id', '123').not('id', 'in', notInString);
console.log("CORRECT STRING:", query.url.toString());
