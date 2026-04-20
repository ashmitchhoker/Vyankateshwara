const fs = require('fs');

const files = ['index.html', 'menu.html', 'restaurant.html', 'contact-us.html'];
const newTiming1 = 'Daily : 07.00 am to 10.00 pm';
const newTiming2 = 'Open : 07:00 am - 10:00 pm';

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace variations of the timings
    content = content.replace(/Daily\s*:\s*11\.00\s*am\s*to\s*03\.00\s*pm\s*,\s*07\.00\s*pm\s*to\s*11\.00\s*pm/gi, newTiming1);
    content = content.replace(/Daily\s*:\s*11\.00\s*am\s*to\s*03\.00\s*pm,<br>\s*07\.00\s*pm\s*to\s*11\.00\s*pm/gi, newTiming1);
    content = content.replace(/Open\s*:\s*11:00\s*am\s*-\s*03:00\s*pm,<br>\s*07:00\s*pm\s*-\s*11:00\s*pm/gi, newTiming2);
    content = content.replace(/11:00 AM – 3:00 PM,<br>7:00 PM – 11:00 PM/gi, '7:00 AM – 10:00 PM');
    
    fs.writeFileSync(file, content);
    console.log(`Updated timings in ${file}`);
  }
});
