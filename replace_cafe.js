const fs = require('fs');

const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');

// Update Delightful experience to Vyankateshwara Cafe
content = content.replace(/<div class="subtitle"><span>delightful experience<\/span><\/div>/g, '<div class="subtitle"><span>Vyankateshwara Cafe</span></div>');

fs.writeFileSync(file, content);
console.log('Replaced text successfully!');
