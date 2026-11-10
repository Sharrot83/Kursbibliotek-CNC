// Bygger programmets filer i app/dist av samma sidor som på webben.
// Bara G-vis, lexikonet, simulatorerna och det de behöver följer med, inga kurssidor.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');   // fungerar även på Windows (D:\...)
const dist = path.join(root, 'app', 'dist');
fs.rmSync(dist, { recursive: true, force: true });
const copy = (rel) => {
  const src = path.join(root, rel), dst = path.join(dist, rel);
  if (!fs.existsSync(src)) { console.warn('saknas:', rel); return; }
  fs.cpSync(src, dst, { recursive: true });
};
[
  'courses/cnc-gront-kort/g-vis.html',
  'courses/cnc-gront-kort/lexikon.html',
  'courses/cnc-gront-kort/i18n',
  'courses/cnc-gront-kort/sim',
  'assets/fonts',
  'assets/vendor',
].forEach(copy);
fs.copyFileSync(path.join(root, 'app', 'start.html'), path.join(dist, 'index.html'));
fs.copyFileSync(path.join(root, 'app', 'icon.png'), path.join(dist, 'icon.png'));
const conf = JSON.parse(fs.readFileSync(path.join(root, 'app', 'src-tauri', 'tauri.conf.json'), 'utf8'));
fs.writeFileSync(path.join(dist, 'version.json'), JSON.stringify({ version: conf.version }));
console.log('Klart:', dist, 'version', conf.version);
