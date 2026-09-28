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
for (const key of ['section','name','input','damage','startup','active','recovery','hit','block','cancel','attribute','notes']) {
  ok(snap.rows.every(r => Object.hasOwn(r, key)), `missing official column: ${key}`);
}

const box = { window: {} };
vm.createContext(box);
vm.runInContext(read('data/lab-data.js'), box);
const lab = box.window.MARISA_LAB;
ok(lab && lab.version === '1.0.0', 'lab data version');
ok(Object.keys(lab.ids).length === 84, `ids ${Object.keys(lab.ids).length}`);
ok(new Set(Object.values(lab.ids)).size === 84, 'duplicate ids');
for (const row of snap.rows) ok(lab.ids[row.name], `missing id: ${row.name}`);
const ids = new Set(Object.values(lab.ids));

ok(Object.keys(lab.when || {}).length >= 15, `when ${Object.keys(lab.when || {}).length}`);
ok(Object.keys(lab.derives || {}).length >= 10, `derives ${Object.keys(lab.derives || {}).length}`);
for (const [from, tos] of Object.entries(lab.derives || {})) {
  ok(ids.has(from), `unknown derive source: ${from}`);
  ok(Array.isArray(tos) && tos.length, `empty derive target: ${from}`);
  for (const to of tos) ok(ids.has(to), `unknown derive target ${from}: ${to}`);
}

const allowedConds = new Set(['n','c','pc','dr']);
ok(Object.keys(lab.routes || {}).length === 29, `route move count ${Object.keys(lab.routes || {}).length}`);
for (const [id, conds] of Object.entries(lab.routes || {})) {
  ok(ids.has(id), `unknown route move: ${id}`);
  for (const [cond, list] of Object.entries(conds)) {
    ok(allowedConds.has(cond), `unknown route condition ${id}: ${cond}`);
    ok(Array.isArray(list) && list.length, `empty route list ${id}: ${cond}`);
    for (const item of list) ok(item.route && Object.hasOwn(item,'damage') && item.verification, `bad route ${id}: ${cond}`);
  }
}

ok(lab.situations.length === 48, `situations ${lab.situations.length}`);
ok(Array.isArray(lab.scenes) && lab.scenes.length === 8, `scenes ${lab.scenes?.length}`);
ok(new Set(lab.situations.map(s => s.scene)).size === 8, 'situation scene count');
for (const s of lab.situations) {
  ok(s.id && s.title && s.scene && s.cue && s.source, `bad situation ${JSON.stringify(s)}`);
  ok(Array.isArray(s.picks) && s.picks.length >= 1, `no picks: ${s.id}`);
  for (const id of s.picks) ok(ids.has(id), `unknown situation pick ${s.id}: ${id}`);
}
ok((lab.situationSources || []).length === 3, 'three situation sources');
ok(lab.situations.some(s => String(s.source).includes('decision-data.js')), 'decision notebook was not merged');

const coreBox = {};
vm.createContext(coreBox);
vm.runInContext(read('lab-core.js'), coreBox);
const core = coreBox.MarisaCore;
ok(core.frameGap(-2, 4) === 5, 'frameGap model');
ok(core.linkWindow(4, 4) === 1, 'linkWindow model');

const byName = name => snap.rows.find(r => r.name === name);
const weak = core.parseOfficialRow(byName('弱 グラディウス'), 'gladiusL');
ok(weak.startup === 17 && weak.active.from === 17 && weak.active.to === 20 && weak.recovery === 21 && weak.total === 41, 'weak gladius base frames');
ok(weak.windows.some(w => w.kind === 'armor' && w.from === 5 && w.to === 10), 'weak gladius armor');

const od = core.parseOfficialRow(byName('OD グラディウス'), 'gladiusOD');
ok(od.windows.some(w => w.kind === 'armor' && w.from === 1 && w.to === 22), 'OD gladius armor');

const dima = core.parseOfficialRow(byName('弱 ディマカイルス（1段目）'), 'dimachaerusL');
ok(dima.windows.some(w => w.kind === 'derive' && w.from === 22 && w.to === 32), 'weak dimachaerus derive 22-32F');

const crlp = core.parseOfficialRow(byName('しゃがみ弱P（アンダーライト）'), 'crLP');
const amp = core.parseOfficialRow(byName('立ち中P（ミドルパンチ）'), 'aMP');
ok(core.linkWindow(crlp.hit, crlp.startup) === 1, 'crLP normal -> crLP must have 1F link window');
ok(core.linkWindow(crlp.hit + 4, amp.startup) === 2, 'crLP punish counter -> aMP must have 2F link window');

const sthpHold = core.parseOfficialRow(byName('立ち強P（ヘビィーパンチ）（ホールド）'), 'stHP.hold');
ok(sthpHold.pcHit === 15, `stHP hold punish note ${sthpHold.pcHit}`);

for (const pth of ['data/official-modern.json','data/lab-data.js','lab-core.js','lab.css','lab.js','index.html','situations.html','version.json']) {
  ok(existsSync(resolve(root,pth)), `missing ${pth}`);
}
const version = JSON.parse(read('version.json'));
ok(version.appVersion === '1.0.0' && version.officialModernRows === 84 && version.situationCount === 48, 'version contract');

for (const page of ['index.html','situations.html']) {
  const html = read(page);
  ok((html.match(/data-tab=/g)||[]).length === 2, `${page}: top nav must have 2 tabs`);
  for (const word of ['MISSION','LAB MAP','今日の5問','TRAINING SESSION']) ok(!html.includes(word), `${page}: legacy UI word: ${word}`);
  ok(html.includes('lab.css') && html.includes('lab.js') && html.includes('lab-core.js') && html.includes('data/lab-data.js'), `${page}: new assets not wired`);
}
ok(read('situations.html').includes('export-notebook'), 'notebook export missing');

for (const pth of ['moves.html','decision.html','advantage.html','matchups.html','strategy.html','drill.html','spacing.html','systems.html','controls.html']) {
  const h = read(pth);
  ok(h.includes('location.search'), `${pth} must preserve query`);
  ok(h.includes('noindex'), `${pth} missing noindex`);
}

const roots = readdirSync(root);
const allowedJs = new Set(['lab.js','lab-core.js']);
const allowedCss = new Set(['lab.css']);
for (const f of roots) {
  if (f.endsWith('.js')) ok(allowedJs.has(f), `legacy root js remains: ${f}`);
  if (f.endsWith('.css')) ok(allowedCss.has(f), `legacy root css remains: ${f}`);
}

console.log(`validate: OK / official=${snap.rows.length} / routes=${Object.keys(lab.routes).length} / situations=${lab.situations.length} / scenes=${lab.scenes.length} / version=${lab.version}`);
