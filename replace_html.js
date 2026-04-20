const fs = require('fs');

const newHTML = `                                        <div class="links-box clearfix mobile-only-box">
                                                <!-- Hidden Nav Toggler -->
                        <div class="nav-toggler">
                            <button class="hidden-bar-opener">
                                <span class="hamburger">
                                    <span class="top-bun"></span>
                                    <span class="meat"></span>
                                    <span class="bottom-bun"></span>
                                </span>
                            </button>
                        </div>
                                        </div>

                    <!--Logo-->
                    <div class="logo-box pc-logo-left">
                         <div class="logo"><a href="index.html" title="Jor-Shor-logo"><img src="images/logo.png" alt="" title="Jor-Shor-logo"></a></div>
                    </div>

                    <!-- Right Menu (Desktop) -->
                    <div class="nav-box pc-only-nav nav-right-all clearfix">
                        <div class="nav-outer clearfix" style="display:block;">         
                            <nav class="main-menu">
                                <ul class="navigation clearfix" style="display:flex; justify-content:flex-end;">
                                    <li><a href="index.html">Home</a></li>
                                    <li><a href="restaurant.html">Restaurant</a></li>
                                    <li><a href="menu.html">Menu</a></li>
                                    <li><a href="contact-us.html">Contact Us</a></li>
                                </ul>
                            </nav>
                        </div>
                    </div>`;

const files = ['index.html', 'menu.html', 'restaurant.html', 'contact-us.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match starting from mobile-only-box which is our links-box
  const startRegex = /<div class="links-box clearfix mobile-only-box">/;
  const endRegex = /<div class="nav-box pc-only-nav nav-right clearfix">[\s\S]*?<\/div>\s*<\/div>/;
  
  const mStart = content.match(startRegex);
  const mEnd = content.match(endRegex);

  if (mStart && mEnd) {
    const startIndex = mStart.index;
    const endIndex = mEnd.index + mEnd[0].length;
    
    content = content.substring(0, startIndex) + newHTML + content.substring(endIndex);
    fs.writeFileSync(file, content);
    console.log("Updated", file);
  } else {
    console.log("Could not match in", file);
  }
});
