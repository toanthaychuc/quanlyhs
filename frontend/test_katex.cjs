const katex = require('katex');
const html = katex.renderToString('\\begin{cases} &x_M = 1 \\\\ &y_M = 2 \\end{cases}', {throwOnError: false});
console.log(html);
