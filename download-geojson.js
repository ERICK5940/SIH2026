const fs = require('fs');
const path = require('path');
const https = require('https');

const states = ['arunachal-pradesh','assam','meghalaya','manipur','mizoram','nagaland','tripura'];
const base = 'https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/geojson/states/';
const outDir = path.join(__dirname, 'public', 'geojson');
fs.mkdirSync(outDir, { recursive: true });

async function dl(state) {
  const url = base + state + '.geojson';
  const out = path.join(outDir, state + '.geojson');
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(state + ' ' + res.statusCode));
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { fs.writeFileSync(out, data); console.log('downloaded', state, data.length); resolve(); });
    }).on('error', reject);
  });
}

(async () => {
  for (const s of states) {
    try { await dl(s); } catch(e) { console.error(e.message); }
  }
})();
