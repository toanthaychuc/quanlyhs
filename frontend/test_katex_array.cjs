const katex = require('katex');
try {
  const html1 = katex.renderToString('\\begin{array}{l} x = -1 \\end{array}', {throwOnError: true});
  const html2 = katex.renderToString('\\begin{array}{ll} x = -1 \\end{array}', {throwOnError: true});
  console.log(html1);
  console.log(html2);
} catch (e) {
  console.log('Error:', e.message);
}
