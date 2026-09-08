const katex = require('katex');
try {
  console.log('1. NO AMPERSAND');
  console.log(katex.renderToString('\\begin{cases} x = 1 \\\\ y = 2 \\end{cases}'));
} catch(e) { console.log(e.message); }

try {
  console.log('2. WITH AMPERSAND');
  console.log(katex.renderToString('\\begin{cases} &x = 1 \\\\ &y = 2 \\end{cases}'));
} catch(e) { console.log(e.message); }

try {
  console.log('3. HEVA WITH AMPERSAND');
  console.log(katex.renderToString('\\heva{ &x = 1 \\\\ &y = 2 }', { macros: { '\\heva': '\\begin{cases} #1 \\end{cases}' } }));
} catch(e) { console.log(e.message); }
