const fs = require('fs');
let css = fs.readFileSync('src/pages/Dashboard.css', 'utf8');

css = css.replace(
  /\.overview-grid\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*1\.7fr\s*1fr;\s*gap:\s*1\.25rem;\s*\}/,
  `.dashboard-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
  align-items: start;
}`
);

css = css.replace(
  /\.overview-grid\s*\{\s*grid-template-columns:\s*1fr\s*1fr;\s*\}/g,
  `.dashboard-grid {
    grid-template-columns: 1fr;
  }`
);

css = css.replace(
  /\.overview-grid\s*\{\s*grid-template-columns:\s*1fr;\s*\}/g,
  `.dashboard-grid {
    grid-template-columns: 1fr;
  }`
);

css = css.replace(
  /\.dashboard-main-grid\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*1\.35fr\s*1fr;\s*gap:\s*1\.5rem;\s*\}/,
  ``
);

fs.writeFileSync('src/pages/Dashboard.css', css);
console.log('Replaced CSS!');
