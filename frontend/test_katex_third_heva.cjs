const katex = require('katex');

const str = '\\begin{cases} a=\\dfrac{-3}{4}\\\\b=\\dfrac{9}{2}\\\\c=0\\\\d=0. \\end{cases}';
try {
  console.log(katex.renderToString(str));
} catch(e) { console.log(e.message); }
