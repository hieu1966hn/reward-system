const fs = require('fs');
let html = fs.readFileSync('scripts/mindx_centers.html', 'utf-8');

// Unescape unicode `\uXXXX`
html = html.replace(/\\u([\d\w]{4})/gi, function (match, grp) {
    return String.fromCharCode(parseInt(grp, 16));
});

fs.writeFileSync('scripts/decoded.html', html);
