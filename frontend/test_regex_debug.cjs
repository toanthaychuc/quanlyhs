const str1 = '\\heva{&a=\\dfrac{-3}{4}\\\\&b=\\dfrac{9}{2}\\\\&c=0\\\\&d=0.}';

str1.replace(/\\(heva|hoac)\s*\{([\s\S]*?)\}/g, (match, cmd, inner) => {
  console.log("INNER IS:", JSON.stringify(inner));
  
  let result = inner.replace(/(^|\\\\)\s*&/g, match => {
    console.log("MATCHED:", JSON.stringify(match));
    return 'XX';
  });
  console.log("RESULT:", JSON.stringify(result));
});
