const fs = require('fs');
const html = fs.readFileSync('scripts/mindx_centers.html', 'utf-8');

// The data in Next.js App Router is often inside self.__next_f.push([... , "JSON..."])
// Let's decode all double-escaped strings like \\"
let decoded = html.replace(/\\"/g, '"').replace(/\\\\/g, '\\');

const centers = [];
const regex = /"id":(\d+),"attributes":\{"name":"([^"]+)","address":"([^"]+)","hotline":"([^"]*)"/g;
let m;
while ((m = regex.exec(decoded)) !== null) {
  centers.push({
    name: m[2],
    address: m[3],
    hotline: m[4]
  });
}

console.log(`Found ${centers.length} centers.`);
console.log(centers.slice(0, 5));
fs.writeFileSync('scripts/parsed_centers.json', JSON.stringify(centers, null, 2));
