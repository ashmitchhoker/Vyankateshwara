const fs = require('fs');

const files = ['index.html', 'menu.html', 'restaurant.html', 'contact-us.html'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the fact counter
    content = content.replace(/data-stop="101"/g, 'data-stop="200"');
    content = content.replace(/Special\s*<br>Dishes/gi, 'Items');
    
    // Replace the text 101+ Items
    content = content.replace(/101\+\s*Items/gi, '200+ Items');
    
    fs.writeFileSync(file, content);
    console.log(`Updated items count in ${file}`);
  }
});
