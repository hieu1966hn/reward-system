const fs = require('fs');
const html = fs.readFileSync('scripts/mindx_centers.html', 'utf-8');
const index = html.indexOf('Đống Đa');
if (index !== -1) {
  console.log(html.substring(index - 200, index + 200));
} else {
  console.log('Not found');
}
