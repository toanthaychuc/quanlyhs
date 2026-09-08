const katex = require('katex');

function transformEqnarray(inner) {
  // 1. Convert && to &
  let fixed = inner.replace(/&&/g, '&');
  // 2. Convert & = & (or similar) to &=
  fixed = fixed.replace(/&([^&\n\r]+)&/g, '&$1');
  return `\\begin{aligned}${fixed}\\end{aligned}`;
}

const input1 = `
			A &=& \\overrightarrow{P} \\cdot \\overrightarrow{d} \\\\
			&=& P \\cdot d \\cdot \\cos \\left(\\overrightarrow{P}, \\overrightarrow{d}\\right) \\\\
`;
const input2 = `
			&& \\lim\\limits_{x \\to \\pm \\infty} y = \\frac{1}{2}.\\\\
			&& \\lim\\limits_{x \\to -2^+} y = -\\infty;
`;

console.log('--- Input 1 ---');
console.log(transformEqnarray(input1));
console.log('--- Input 2 ---');
console.log(transformEqnarray(input2));
