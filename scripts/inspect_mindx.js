const https = require('https');

https.get('https://mindx.edu.vn/center?city=ALL&district=ALL', (res) => {
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    // Look for Next.js data or Nuxt data
    const nextMatch = rawData.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    const nuxtMatch = rawData.match(/window\.__NUXT__\s*=\s*([\s\S]*?)<\/script>/);
    if (nextMatch) {
      console.log('Found NEXT_DATA. Length:', nextMatch[1].length);
      const data = JSON.parse(nextMatch[1]);
      console.log(Object.keys(data.props.pageProps));
      // Save it
      require('fs').writeFileSync('scripts/mindx_data.json', JSON.stringify(data.props.pageProps, null, 2));
    } else if (nuxtMatch) {
      console.log('Found NUXT data.');
    } else {
      console.log('Not found Next or Nuxt data. Total length:', rawData.length);
      const scriptRegex = /<script[\s\S]*?>([\s\S]*?)<\/script>/g;
      let m;
      while ((m = scriptRegex.exec(rawData)) !== null) {
        if(m[1].includes('campuses') || m[1].includes('centers')) {
           console.log('Potential match:', m[1].substring(0, 200));
        }
      }
    }
  });
});
