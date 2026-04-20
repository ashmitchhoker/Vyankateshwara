const fs = require('fs');

const files = ['index.html', 'menu.html', 'restaurant.html', 'contact-us.html'];
const newAddress = 'Irwin Square, Camp Rd, Paranjpe Colony, Amravati, Maharashtra 444602';

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace variations of the address
    content = content.replace(/109,\s*1st\s*Floor,\s*Silver\s*Radiance\s*2,\s*Science\s*City\s*Rd,\s*Ahmedabad\.?/g, newAddress);
    content = content.replace(/109,\s*1st\s*Floor,\s*Silver\s*Radiance\s*2,\s*Science\s*City\s*Rd,\s*opp\.\s*Pancham\s*Thal,\s*Sola,\s*Ahmedabad,\s*Gujarat\s*380060/g, newAddress);
    
    fs.writeFileSync(file, content);
    console.log(`Updated address in ${file}`);
  }
});
