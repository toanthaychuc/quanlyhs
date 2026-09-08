const str1 = '\\heva{&a=\\dfrac{-3}{4}\\\\&b=\\dfrac{9}{2}\\\\&c=0\\\\&d=0.}';

const fix = (s) => s.replace(/\\(heva|hoac)\s*\{([\s\S]*?)\}/g, (match, cmd, inner) => {
  return `\\${cmd}{${inner.replace(/(^|\\\\)\s*&/g, '$1 ')}}`;
});

console.log(fix(str1));
