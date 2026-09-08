const katex = require('katex');

const macros = {
  '\\hevaA': '\\left\\{ \\begin{aligned} #1 \\end{aligned} \\right.',
  '\\hoacA': '\\left[ \\begin{aligned} #1 \\end{aligned} \\right.'
};

try {
  console.log('1. HEVA WITHOUT AMPERSAND');
  console.log(katex.renderToString('\\hevaA{ x = 1 \\\\ y = 2 }', { macros }));
} catch(e) { console.log(e.message); }

try {
  console.log('2. HEVA WITH AMPERSAND');
  console.log(katex.renderToString('\\hevaA{ &x = 1 \\\\ &y = 2 }', { macros }));
} catch(e) { console.log(e.message); }
