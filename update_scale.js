const fs = require('fs');

// Update HTML
const htmlFile = 'index.html';
let htmlCode = fs.readFileSync(htmlFile, 'utf8');
htmlCode = htmlCode.replace(/Vyankateshwara Cafe/g, 'Vyankateshwara');
fs.writeFileSync(htmlFile, htmlCode);
console.log('HTML replaced.');

// Update CSS
const cssFile = 'css/style.css';
let cssCode = fs.readFileSync(cssFile, 'utf8');
cssCode = cssCode.replace(/font-size: 24px !important;/g, 'font-size: 42px !important;\n  letter-spacing: 0.1em !important;');
fs.writeFileSync(cssFile, cssCode);
console.log('CSS updated.');
