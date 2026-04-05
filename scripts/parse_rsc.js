const fs = require('fs');
const html = fs.readFileSync('scripts/mindx_centers.html', 'utf-8');

// The RSC format often replaces nested strings. We can just use a regex to grab all objects with "address" and "hotline"
const centerObjects = [];
const regex = /\\"name\\":\\"(.*?)\\",\\"description\\":.*?(?:\\"address\\":\\"(.*?)\\"|\\"hotline\\":\\"(.*?)\\")/g;

// Instead of pure regex, let's look for {"address":"   in the unescaped html
const decoded = html.replace(/\\"/g, '"').replace(/\\\\/g, '\\');

// Find all matches of "name":"..." and near it "address":"..."
const chunkRegex = /"name":"([^"]+)".*?"address":"([^"]+)"/g;
let m;
while ((m = chunkRegex.exec(decoded)) !== null) {
  // It's a center if address exists
  centerObjects.push({ name: m[1], address: m[2] });
}

console.log('Found centers:', centerObjects.length);
console.log(centerObjects.slice(0, 10));
