import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function recoverIDs() {
  const { data: exams, error } = await supabase.from('exams').select('id, title, questions, latex_bulk_code');
  if (error) {
    console.error('Error fetching exams:', error);
    return;
  }

  console.log(`Found ${exams.length} exams.`);
  let recoveredExamsCount = 0;
  let totalRecoveredTags = 0;

  for (const exam of exams) {
    if (!exam.latex_bulk_code || !exam.questions || exam.questions.length === 0) continue;

    let modified = false;
    let questions = exam.questions;
    
    // Parse tags from latex_bulk_code manually
    const envRegex = /\\begin\s*\{\s*(?:ex|bt|vd|cau)\s*\}(?:\[[^\]]*\])*([\s\S]*?)\\end\s*\{\s*(?:ex|bt|vd|cau)\s*\}/gi;
    let match;
    let qIdx = 0;
    
    while ((match = envRegex.exec(exam.latex_bulk_code)) !== null) {
      if (qIdx >= questions.length) break;
      
      let block = match[1].trim();
      let tags = [];
      block.replace(/^\s*(?:%?\s*\[([^\]]+)\]\s*)+/g, (m, tag) => {
          tags.push(tag.trim());
          return '';
      });
      
      if (tags.length > 0) {
        if (!questions[qIdx].tags || questions[qIdx].tags.join(',') !== tags.join(',')) {
          questions[qIdx].tags = tags;
          modified = true;
          totalRecoveredTags++;
        }
      }
      qIdx++;
    }
    
    if (modified) {
      console.log(`Recovered tags for exam: ${exam.title} (${exam.id})`);
      const { error: updateError } = await supabase.from('exams').update({ questions }).eq('id', exam.id);
      if (updateError) {
        console.error(`Error updating exam ${exam.id}:`, updateError);
      } else {
        recoveredExamsCount++;
      }
    }
  }

  console.log(`Successfully recovered IDs for ${recoveredExamsCount} exams.`);
  console.log(`Total questions recovered: ${totalRecoveredTags}`);
}

recoverIDs();
