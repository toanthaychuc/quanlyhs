const katex = require('katex');
try {
  console.log(katex.renderToString('\\begin{cases} s(0) = 0 \\\\ s(1) = 0 \\end{cases}', {throwOnError: false}));
} catch (e) {
  console.log('Error:', e.message);
}
