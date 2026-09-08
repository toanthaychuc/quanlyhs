const inner = '&& \\lim x \\\\ \n&& \\lim y';
const fixedInner = inner.replace(/&([^&]+)&/g, '&$1');
console.log(fixedInner);
