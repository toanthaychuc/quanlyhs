const katex = require('katex');

const macros = {
  '\\hoac': '\\left[\\begin{array}{ll} #1 \\end{array}\\right.'
};

try {
  console.log('HOAC WITHOUT AMPERSAND');
  console.log(katex.renderToString('\\hoac{ t = -1 \\\\ t = 7 }', { macros }));
} catch(e) { console.log(e.message); }
