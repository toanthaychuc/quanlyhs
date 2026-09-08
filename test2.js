const { normalizeLatexString } = require('./frontend/src/utils/latexUtils');

const text1 = 'thu là lớn nhất {\\it (làm tròn kết quả đến hàng phần chục)}?';
const text2 = 'thu là lớn nhất {\\it(làm tròn kết quả đến hàng phần chục)}?';

console.log(normalizeLatexString(text1));
console.log(normalizeLatexString(text2));
