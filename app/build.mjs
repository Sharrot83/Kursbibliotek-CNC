
// Bygger offline-appen i app/dist.
// Endast G-vis, lexikonet, simulatorerna och nödvändiga resurser.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Hitta projektroten direkt från build.mjs.
// URL-metoden undviker problem med D:\ på Windows.
const root = fileURLToPath(new URL('../', import.meta.url));

const appDir = path.join(root, 'app');
const dist = path.join(appDir, 'dist');

console.log('Projektrot:', root);

// Kontrollera obligatoriska filer innan bygget startar.
const required = [
  'app/start.html',
  'app/icon.png',
  'courses/cnc-gront-kort/g-vis.html',
  'courses/cnc-gront-kort/lexikon.html',
  'courses/cnc-gront-kort/i18n',
  'courses/cnc-gront-kort/sim',
  'assets/fonts',
  'assets/vendor'
];

const missing = required.filter(
  rel => !fs.existsSync(path.join(root, rel))
);

if (missing.length > 0) {
  console.error('Följande filer eller mappar saknas:');
  missing.forEach(f => console.error(' - ' + f));
  process.exit(1);
}

// Rensa gammal distribution.
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

// Kopiera filer och mappar.
function copy(rel) {
  const src = path.join(root, rel);
  const dst = path.join(dist, rel);

  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.cpSync(src, dst, { recursive: true });

  console.log('Kopierad:', rel);
}

// Appens innehåll.
[
  'courses/cnc-gront-kort/g-vis.html',
  'courses/cnc-gront-kort/lexikon.html',
  'courses/cnc-gront-kort/i18n',
  'courses/cnc-gront-kort/sim',
  'assets/fonts',
  'assets/vendor'
].forEach(copy);

// Startsidan blir appens index.html.
fs.copyFileSync(
  path.join(appDir, 'start.html'),
  path.join(dist, 'index.html')
);

// Appikon.
fs.copyFileSync(
  path.join(appDir, 'icon.png'),
  path.join(dist, 'icon.png')
);

console.log('');
console.log('BYGGET KLART!');
console.log('Distribution:', dist);
