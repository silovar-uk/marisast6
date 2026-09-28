import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const read = p => readFileSync(resolve(root, p), 'utf8');
const fail = msg => { throw new Error(msg); };
const ok = (cond, msg) => cond || fail(msg);

const raw = read('data/official-modern.json');
const snap = JSON.parse(raw);
const sha = createHash('sha256').update(raw).digest('hex');
ok(sha === '019bf6e85747c85052d1f2aada5c7ff3261a08ea5dea795064f6816c2b2c1d54', `snapshot hash ${sha}`);
ok(snap.mode === 'modern', `mode ${snap.mode}`);
ok(snap.rows.length === 84, `official rows ${snap.rows.length}`);
ok(new Set(snap.rows.map(r => r.name)).size === 84, 'duplicate official row names');

const box = { window: {} };
vm.createContext(box);
vm.runInContext(read('data/lab-data.js'), box);
const lab = box.window.MARISA_LAB;
ok(lab && lab.version === '1.0.0', 'lab data version');
ok(Object.keys(lab.ids).length === 84, `ids ${Object.keys(lab.ids).length}`);
ok(new Set(Object.values(lab.ids)).size === 84, 'duplicate ids');
for (const row of snap.rows) ok(lab.ids[row.name], `missing id: ${row.name}`);
ok(lab.situations.length >= 40 && lab.situations.length <= 50, `situations ${lab.situations.length}`);
const ids = new Set(Object.values(lab.ids));
for (const s of lab.situations) {
  ok(s.id && s.title && s.scene, `bad situation ${JSON.stringify(s)}`);
  ok(s.picks.length >= 1, `no picks: ${s.id}`);
  for (const id of s.picks) ok(ids.has(id), `unknown situation pick ${s.id}: ${id}`);
}

const coreBox = {};
vm.createContext(coreBox);
vm.runInContext(read('lab-core.js'), coreBox);
const core = coreBox.MarisaCore;
ok(core.frameGap(-2, 4) === 5, 'frameGap model');
ok(core.linkWindow(4, 4) === 1, 'linkWindow model');
const weak = snap.rows.find(r => r.name === '弱 グラディウス');
const p = core.parseOfficialRow(weak, 'gladiusL');
ok(p.startup === 17 && p.active.from === 17 && p.active.to === 20 && p.recovery === 21, 'weak gladius base frames');
ok(p.windows.some(w => w.kind === 'armor' && w.from === 5 && w.to === 10), 'weak gladius armor');

for (const pth of ['data/official-modern.json','data/lab-data.js','lab-core.js']) ok(existsSync(resolve(root,pth)), `missing ${pth}`);
const index = read('index.html');
const migrated = index.includes('lab.js');
if (migrated) {
  for (const pth of ['situations.html','lab.css','lab.js','version.json']) ok(existsSync(resolve(root,pth)), `missing ${pth}`);
  ok((index.match(/data-tab=/g)||[]).length === 2, 'top nav must have 2 tabs');
  for (const word of ['MISSION','LAB MAP','今日の5問','TRAINING SESSION']) ok(!index.includes(word), `legacy UI word: ${word}`);
  ok(index.includes('lab.css') && index.includes('lab.js') && index.includes('lab-core.js'), 'new assets not wired');
  if (existsSync(resolve(root, 'situations.html')) && read('situations.html').includes('lab.js')) ok(read('situations.html').includes('export-notebook'), 'notebook export missing');
  for (const pth of ['moves.html','decision.html','advantage.html','matchups.html','strategy.html','drill.html','spacing.html','systems.html','controls.html']) {
    const h = read(pth); ok(h.includes('location.search'), `${pth} must preserve query`); ok(h.includes('noindex'), `${pth} missing noindex`);
  }
  const roots = readdirSync(root);
  const allowedJs = new Set(['lab.js','lab-core.js']);
  const allowedCss = new Set(['lab.css']);
  for (const f of roots) {
    if (f.endsWith('.js')) ok(allowedJs.has(f), `legacy root js remains: ${f}`);
    if (f.endsWith('.css')) ok(allowedCss.has(f), `legacy root css remains: ${f}`);
  }
}
console.log(`validate: OK / official=${snap.rows.length} / situations=${lab.situations.length} / version=${lab.version}`);