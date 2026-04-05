const https = require('https');
const fs = require('fs');

https.get('https://mindx.edu.vn/center?city=ALL&district=ALL', (res) => {
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    fs.writeFileSync('scripts/mindx_centers.html', rawData);
    console.log('Saved to mindx_centers.html');
  });
});
