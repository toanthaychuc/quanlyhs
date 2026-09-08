import { normalizeLatexString } from './src/utils/latexUtils.js';
const text = `$L = AB + AE + BC + \\wideparen{EDC} = 2r + 2h + \\pi r = 10 \\Rightarrow 2h = 10 - (\\pi + 2)r.$`;
console.log('Original:');
console.log(text);
console.log('Normalized:');
console.log(normalizeLatexString(text));
