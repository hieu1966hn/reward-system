const fs = require('fs');
const html = fs.readFileSync('scripts/mindx_centers.html', 'utf-8');
const names = [...html.matchAll(/\\"name\\":\\"(.*?)\\"/g)].map(m => m[1]);
const addresses = [...html.matchAll(/\\"address\\":\\"(.*?)\\"/g)].map(m => m[1]);
// We might have more matches because of other data
console.log(names.slice(0, 10));
