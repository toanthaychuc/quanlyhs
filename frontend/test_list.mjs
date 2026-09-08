import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gclzdhvocwpunpmntpkz.supabase.co';
const supabaseKey = 'sb_publishable_-x_RJxT50C199EvBfonekg_M0r69awU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listBuckets() {
  console.log("Listing buckets...");
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("ERROR:", error);
  } else {
    console.log("BUCKETS:", data.map(b => b.name));
  }
}

listBuckets();
