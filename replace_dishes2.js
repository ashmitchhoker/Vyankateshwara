const fs = require('fs');

const files = ['index.html', 'menu.html', 'restaurant.html'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace "200+ Items"
    content = content.replace(/200\+\s*Items/gi, '200+ Special Dishes');
    
    fs.writeFileSync(file, content);
    console.log(`Updated items to special dishes in ${file}`);
  }
});
