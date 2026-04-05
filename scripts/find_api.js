const fs = require('fs');
const html = fs.readFileSync('scripts/mindx_centers.html', 'utf-8');

const apiRegex = /https?:\/\/[a-zA-Z0-9.-]+\/api\/[a-zA-Z0-9.\/?=&_-]+/g;
const matches = [...new Set(html.match(apiRegex))];
console.log("Found APIs:", matches);
