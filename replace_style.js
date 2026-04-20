const fs = require('fs');

const cssFile = 'css/style.css';
let cssCode = fs.readFileSync(cssFile, 'utf8');

const additionalCss = `

/* Vyankateshwara Cafe Font Size Increase */
.bg-video-wrap .subtitle,
.banner-section .slide-item .subtitle {
  font-size: 24px !important;
}
`;

if (!cssCode.includes('Vyankateshwara Cafe Font Size Increase')) {
  cssCode += additionalCss;
  fs.writeFileSync(cssFile, cssCode);
  console.log('Update complete!');
} else {
  console.log('Already added');
}
