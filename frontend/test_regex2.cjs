const str1 = '\\heva{ &x = 1 \\\\ &y = 2 }';

const fix = (s) => s.replace(/\\(heva|hoac)\s*\{([\s\S]*?)\}/g, (match, cmd, inner) => {
  return `\\${cmd}{${inner.replace(/(^|\\\\)\s*&/g, '$1 ')}}`;
});

console.log(fix(str1));
