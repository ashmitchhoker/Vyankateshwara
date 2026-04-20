const fs = require('fs');

const files = ['index.html', 'menu.html', 'restaurant.html'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace "101+ Items"
    content = content.replace(/<h2>101\+\s*Items<\/h2>/gi, '<h2>200+ Items</h2>');
    
    // Replace counter data-stop="101"
    content = content.replace(/data-stop="101"/gi, 'data-stop="200"');
    
    fs.writeFileSync(file, content);
    console.log(`Updated dishes count in ${file}`);
  }
});
