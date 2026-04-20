const fs = require('fs');

const files = ['index.html', 'menu.html', 'restaurant.html'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Specifically looking for the fact-title next to the 200 stop counter
    content = content.replace(/<div class="fact-title">Items<\/div>/gi, '<div class="fact-title">Special <br>Dishes</div>');
    
    fs.writeFileSync(file, content);
    console.log(`Updated items to special dishes in ${file}`);
  }
});
