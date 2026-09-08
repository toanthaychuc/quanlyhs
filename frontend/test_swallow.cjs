const fs = require('fs');
const { replaceMacroWithBraces } = require('./src/utils/latexUtils.js');

const str = '\\heva{&s(0)=0}\Leftrightarrow \\heva{&d=0}';

let res = replaceMacroWithBraces(str, '\\heva', (inner, trailing = '') => {
  return `\\heva{${inner.replace(/(^|\\\\)\s*&/g, '$1 ')}}${trailing}`;
});

console.log(res);
