const fs = require('fs');

const files = ['index.html', 'menu.html', 'restaurant.html', 'contact-us.html'];
const dummyNumber = '+91 1234567890';
const dummyEmail = 'dummy@example.com';

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace number and email globally
    content = content.replace(/\+91\s*7600010702/g, dummyNumber);
    content = content.replace(/jorshorrestaurant@gmail\.com/g, dummyEmail);
    
    fs.writeFileSync(file, content);
    console.log(`Updated contact info in ${file}`);
  }
});
