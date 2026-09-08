const katex = require('katex');
try {
  const html = katex.renderToString('\\begin{aligned} && \\lim x = 1 \\\\ && \\lim y = 2 \\end{aligned}', {throwOnError: true});
  console.log(html);
} catch (e) {
  console.log('Error:', e.message);
}
