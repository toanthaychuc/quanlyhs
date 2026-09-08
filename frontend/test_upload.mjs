import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gclzdhvocwpunpmntpkz.supabase.co';
const supabaseKey = 'sb_publishable_-x_RJxT50C199EvBfonekg_M0r69awU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  console.log("Testing upload...");
  const { data, error } = await supabase.storage
    .from('assignments')
    .upload('test.txt', 'hello world', {
      contentType: 'text/plain',
    });

  if (error) {
    console.error("UPLOAD FAILED:", error);
  } else {
    console.log("UPLOAD SUCCESS:", data);
  }
}

testUpload();
