const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('frontend/.env.production', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.log('Missing env vars');
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('documents').select('*');
  if (error) {
    console.error('Error fetching documents:', error);
  } else {
    console.log('Documents count:', data.length);
    console.log('Categories:', data.map(d => d.category));
    console.log('Sample document:', data[0]);
  }
}

run();
