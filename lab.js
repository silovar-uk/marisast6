(async () => {
'use strict';
const DATA_URL = 'data/official-modern.json';
const LAB = window.MARISA_LAB || { phase: 4, ids: {}, idToName: {}, when: {}, derives: {}, routes: {}, situations: [], scenes: [] };
const PHASE = Number(LAB.phase || 4);
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = v => v === 'D' ? 'D' : v == null ? '—' : v > 0 ? '+' + v : v === 0 ? '±0' : '−' + Math.abs(v);

/* ---------- 公式表の解釈 ---------- */
const CHIP = { '通常技': '通常技', '特殊技': '特殊技', '必殺技': '必殺技', 'スーパーアーツ': 'SA', '通常投げ': '投げ', '共通システム': '共通' };
const FAMILY_OF = {
  'ライトワンツー': '立ち弱P（ライトパンチ）', 'ミドルワンツー': '立ち中P（ミドルパンチ）',
  'ヘビィーワンツー': '立ち強P（ヘビィーパンチ）', 'ヴォラーレコンボ': 'ジャンプ中P（ヴォラーレフィスト）',
  'ノバキュラスワイプ/ノバキュラシュート（1段目）': 'ノバキュラ', 'ノバキュラスワイプ': 'ノバキュラ', 'ノバキュラシュート': 'ノバキュラ',
  'スクトゥム': 'スクトゥム', 'OD スクトゥム': 'スクトゥム', 'スクトゥム(当身派生版)': 'スクトゥム', 'OD スクトゥム(当身派生版)': 'スクトゥム',
  'トニトルス（1段目）': 'スクトゥム', 'トニトルス（2段目）': 'スクトゥム', 'プロケッラ': 'スクトゥム', 'エンフォルド': 'スクトゥム'
};
const VARIANT_OF = {
  'ライトワンツー': '2段目', 'ミドルワンツー': '2段目', 'ヘビィーワンツー': '2段目', 'ヴォラーレコンボ': '2段目',
  'ノバキュラスワイプ/ノバキュラシュート（1段目）': '1段目', 'ノバキュラスワイプ': '→中 スワイプ', 'ノバキュラシュート': '→強 シュート',
  'スクトゥム': '構え', 'OD スクトゥム': 'OD 構え', 'スクトゥム(当身派生版)': '当身', 'OD スクトゥム(当身派生版)': 'OD 当身',
  'トニトルス（1段目）': 'トニトルス1', 'トニトルス（2段目）': 'トニトルス2', 'プロケッラ': 'プロケッラ', 'エンフォルド': 'エンフォルド',
  'SA1 マリーザジャベリン': 'SA1', 'SA1 マリーザジャベリン（ホールド）': 'SA1 ホールド', 'SA1 マリーザジャベリン(当身派生版)': 'SA1 当身',
  'SA2 メテオリティス': 'SA2', 'SA3 アポロウーサ': 'SA3', 'CA アポロウーサ': 'CA',
  'マウントグレイズ': '前投げ', 'ミルヴィオブリッジ': '後ろ投げ',
  '前方ステップ': '前ステップ', '後方ステップ': '後ろステップ', 'ドライブインパクト（セクトール）': 'インパクト',
  '[ガード時]ドライブリバーサル（アモルショック）': 'リバーサル（ガード）', '[起き上がり時]ドライブリバーサル（アモルショック）': 'リバーサル（起き上がり）',
  'ドライブパリィ': 'パリィ', 'ジャストパリィ（打撃）': 'ジャストパリィ打撃', 'ジャストパリィ（飛び道具）': 'ジャストパリィ弾',
  'パリィドライブラッシュ': 'パリィラッシュ', 'キャンセルドライブラッシュ': 'キャンセルラッシュ'
};
const FAMILY_TITLE = { 'ノバキュラ': ['ノバキュラスワイプ／シュート', '→＋中'] };
// 既存サイトの「使いどころ」を1行だけ引き継ぐ(系統単位)
const WHEN = LAB.when || {};
const WIN_LABEL = { armor: 'アーマー', parry: '当身', inv: '完全無敵', aainv: '対空無敵', thinv: '投げ無敵', air: '空中', proj: '弾無敵', derive: '派生受付' };
const FLAG_RULES = [[/強制立ち/, '強制立ち'], [/めくり性能/, 'めくり'], [/アーマーブレイク/, 'アーマーブレイク'], [/壁やられ/, '壁やられ'], [/被パニッシュカウンター判定/, '動作中は常に被パニカン'], [/ハードノックダウン/, 'ハードダウン'], [/しゃがみ状態の相手に当たらない/, 'しゃがみに当たらない'], [/連打キャンセル/, '連打キャンセル']];
const CANCEL = {
  C: { text: '必殺技・インパクト・ラッシュ・SAへ', to: ['sp', 'SA1 マリーザジャベリン', 'SA2 メテオリティス', 'SA3 アポロウーサ', 'キャンセルドライブラッシュ', 'ドライブインパクト（セクトール）'] },
  SA: { text: 'SAだけ（SA1〜3）', to: ['SA1 マリーザジャベリン', 'SA2 メテオリティス', 'SA3 アポロウーサ'] },
  SA2: { text: 'SA2・SA3だけ', to: ['SA2 メテオリティス', 'SA3 アポロウーサ'] },
  SA3: { text: 'SA3だけ', to: ['SA3 アポロウーサ'] }
};
const SPECIAL_FAMILIES = [['グラディウス', '弱 グラディウス'], ['ディマカイルス', '弱 ディマカイルス（1段目）'], ['ファランクス', '弱 ファランクス'], ['クアドリガ', '弱 クアドリガ'], ['スクトゥム', 'スクトゥム']];
const DERIVES = Object.fromEntries(Object.entries(LAB.derives || {}).map(([from, tos]) => [LAB.idToName[from] || from, tos.map(id => LAB.idToName[id] || id)]));
// 既存サイトの定番ルート(資料由来・2026年3月基準)の見本
const ROUTES = Object.fromEntries(Object.entries(LAB.routes || {}).map(([id, conds]) => [LAB.idToName[id] || id, Object.fromEntries(Object.entries(conds).map(([cond, list]) => [cond, list.map(x => [x.route, x.damage, x.verification, x.conditions || []])]))]));
const COND = { n: ['通常ヒット', 0], c: ['カウンター', 2], pc: ['パニカン', 4], dr: ['ラッシュ', 4], g: ['ガード', 0] };
const SITUATIONS = (LAB.situations || []).map(s => ({ ...s, key: s.id, pick: (s.picks || []).map(id => LAB.idToName[id]).filter(Boolean), risk: s.avoid || '' }));

function winKind(t) {
  if (/完全無敵/.test(t)) return 'inv';
  if (/空中判定の打撃・空弾属性に対して無敵/.test(t)) return 'aainv';
  if (/飛び道具無敵/.test(t)) return 'proj';
  if (/投げ無敵/.test(t)) return 'thinv';
  if (/当身/.test(t)) return 'parry';
  if (/アーマー/.test(t)) return 'armor';
  if (/空中判定/.test(t)) return 'air';
  if (/派生|移行可/.test(t)) return 'derive';
  return null;
}
function parse(r, i) {
  const n = s => /^[+-]?\d+$/.test(s) ? Number(s) : null;
  const o = { id: LAB.ids[r.name] || ('r' + i), i, raw: r, name: r.name, section: r.section, input: r.input };
  let base = r.name, m, strength = null;
  if ((m = /^(弱|中|強|OD) (.+)$/.exec(base))) { strength = m[1]; base = m[2]; }
  const hold = base.includes('（ホールド）');
  base = base.replace('（ホールド）', '');
  let part = null;
  if ((m = /（(\d段目)）/.exec(base))) { part = m[1]; base = base.replace(m[0], ''); }
  o.strength = strength; o.hold = hold; o.part = part;
  o.fam = FAMILY_OF[r.name] || ({ 'スーパーアーツ': 'スーパーアーツ', '通常投げ': '通常投げ', '共通システム': '共通システム' })[r.section] || base;
  o.variant = VARIANT_OF[r.name] || [strength, part, hold && 'ホールド'].filter(Boolean).join(' ') || '通常';
  o.startup = n(r.startup);
  const am = /(\d+)\s*-\s*(\d+)/.exec(r.active);
  o.a0 = am ? +am[1] : null; o.a1 = am ? +am[2] : null;
  o.rec = n(r.recovery);
  o.landing = (m = /着地後(\d+)/.exec(r.recovery)) ? +m[1] : null;
  o.totalOnly = (m = /全体 ?(\d+)/.exec(r.recovery)) ? +m[1] : null;
  o.total = o.a1 != null && o.rec != null ? o.a1 + o.rec : o.totalOnly;
  o.span = o.total ?? (o.a1 != null ? o.a1 + (o.landing ? 6 : 0) : (o.startup ?? 0) + (o.rec ?? 0));
  o.hit = r.hit === 'D' ? 'D' : n(r.hit);
  o.block = n(r.block);
  o.cancel = r.cancel;
  const dm = /^(\d+) \((\d+)\)$/.exec(r.damage);
  o.dmg = dm ? { sp: +dm[1], cmd: +dm[2] } : n(r.damage);
  o.windows = []; o.flags = []; o.pcHit = null;
  for (const t of r.notes) {
    const w = /^(\d+)\s*-\s*(\d+)F?\s+(.+)$/.exec(t);
    const kind = w && winKind(w[3]);
    if (kind) { o.windows.push({ from: +w[1], to: +w[2], kind, text: t }); continue; }
    if ((m = /パニッシュカウンター時\+(\d+)F/.exec(t))) o.pcHit = +m[1];
    for (const [re, label] of FLAG_RULES) if (re.test(t) && !o.flags.includes(label)) o.flags.push(label);
  }
  return o;
}
const TIER = v => v === 'D' ? ['down', 'ダウン'] : v == null ? null : v >= 1 ? ['plus', '有利'] : v >= -3 ? ['safe', v === 0 ? '五分' : '反撃されにくい'] : v >= -7 ? ['pun', '小技で確反'] : ['big', '大きく確反'];
const isNormal = o => (o.section === '通常技' || o.section === '特殊技') && !/^（/.test(o.input);
const linkable = o => ['通常技', '特殊技', '必殺技', 'スーパーアーツ'].includes(o.section) && o.startup != null && !/^[（※]/.test(o.input) && !o.input.includes(' → ') && o.part !== '2段目' && !o.name.startsWith('CA ');

/* ---------- 状態 ---------- */
const state = { tab: 'waza', cat: '必殺技', q: '', view: 'band', pun: { on: false, n: 6 }, cond: 'n', path: [], focus: null, sort: { key: null, dir: 1 }, tableFilters: {}, scene: 'すべて', lastMap: null };
let rows = [], byId = new Map(), byName = new Map(), families = new Map();

try {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const snap = await res.json();
  rows = snap.rows.map(parse);
  $('#basis').textContent = `公式フレームデータ（モダン）${snap.fetchedAt} 取得・${snap.rows.length}行`; // date is part of authoritative snapshot
} catch (e) {
  $('#list').innerHTML = `<p class="err">公式データを読み込めませんでした（${esc(e.message)}）。ローカルでは docs/mikiru で python -m http.server を実行し、http://localhost:8000/mock.html を開いてください。</p>`;
  $('#basis').textContent = '読み込み失敗';
  return;
}
for (const o of rows) {
  byId.set(o.id, o); byName.set(o.name, o);
  if (!families.has(o.fam)) {
    let title = o.fam, sub = '', mm;
    if (FAMILY_TITLE[o.fam]) [title, sub] = FAMILY_TITLE[o.fam];
    else if ((mm = /^(.+?)（(.+)）$/.exec(o.fam))) { title = mm[2]; sub = mm[1]; }
    families.set(o.fam, { key: o.fam, title, sub, chip: CHIP[o.section], when: WHEN[o.fam] || '', rows: [] });
  }
  families.get(o.fam).rows.push(o);
}
const SR = { null: 0, '弱': 1, '中': 2, '強': 3, 'OD': 4 };
for (const f of families.values()) {
  if (f.rows.some(r => r.strength)) f.rows.sort((a, b) => (a.part === '2段目') - (b.part === '2段目') || a.hold - b.hold || SR[a.strength] - SR[b.strength] || a.i - b.i);
  f.max = Math.max(20, Math.ceil(Math.max(...f.rows.map(r => r.span)) / 10) * 10);
}
const famOf = o => families.get(o.fam);
const LINK_TARGETS = rows.filter(linkable);

/* ---------- 帯の描画 ---------- */
function barHTML(o, max, lg) {
  const pct = f => (f / max * 100).toFixed(3) + '%';
  const seg = (from, to, cls) => to < from ? '' : `<i class="seg ${cls}" style="left:${pct(from - 1)};width:${pct(Math.min(to, max) - from + 1)};--n:${Math.min(to, max) - from + 1}"></i>`;
  let h = '';
  if (o.a0 != null) {
    h += seg(1, o.a0 - 1, 's') + seg(o.a0, o.a1, 'a');
    if (o.rec != null) h += seg(o.a1 + 1, o.a1 + o.rec, 'r');
    else if (o.landing != null) h += `<i class="land" style="left:${pct(o.a1)}">着地後${o.landing}F</i>`;
  } else if (o.totalOnly != null) h += seg(1, o.totalOnly, 'n');
  else if (o.startup != null) h += seg(1, o.startup + (o.rec ?? 0), 'n');
  for (const w of o.windows) {
    const lane = w.kind === 'derive' ? 'ld' : (w.kind === 'air' || w.kind === 'proj') ? 'l2' : 'l1';
    h += `<i class="win ${lane} k-${w.kind}" style="left:${pct(w.from - 1)};width:${pct(Math.min(w.to, max) - w.from + 1)}" title="${esc(w.text)}"></i>`;
  }
  if (state.pun.on && !lg) h += `<i class="pl" style="left:${pct(state.pun.n)}"></i>`;
  h += '<i class="cur"></i>';
  return `<span class="bar${lg ? ' lg' : ''}" data-max="${max}">${h}</span>`;
}
function rulerHTML(max) {
  let h = '';
  for (let k = 0; k <= max; k += 10) h += `<span class="tk" style="left:${(k / max * 100).toFixed(3)}%">${k}</span>`;
  return `<span class="ruler">${h}</span>`;
}
const advHTML = (v, label) => {
  const t = TIER(v);
  return `<span class="av ${t ? 't-' + t[0] : ''}" title="${label}${t ? '：' + t[1] : ''}"><small>${label === 'ヒット' ? 'H' : 'G'}</small>${fmt(v)}</span>`;
};
function punClass(o) {
  if (!state.pun.on) return '';
  return linkable(o) && o.startup <= state.pun.n ? ' ok' : ' ng';
}
function rowHTML(o, max) {
  const sel = cur() === o;
  const dim = state.focus && !state.focus.names.has(o.name) ? ' dim' : '';
  return `<button class="frow row${sel ? ' sel' : ''}${dim}${punClass(o)}" data-id="${o.id}" data-name="${esc(o.name)}" aria-pressed="${sel}">
    <span class="v">${esc(o.variant)}${o.cancel ? `<b class="cx">${esc(o.cancel)}</b>` : ''}</span>
    ${barHTML(o, max)}
    <span class="adv">${advHTML(o.hit, 'ヒット')}${advHTML(o.block, 'ガード')}</span>
  </button>`;
}
function matches(o, q) {
  const s = (o.name + ' ' + o.input + ' ' + o.variant + ' ' + famOf(o).title).toLowerCase();
  return q.toLowerCase().split(/\s+/).every(w => s.includes(w.replace('+', '＋')));
}
function visibleFamilies() {
  const q = state.q.trim();
  const out = [];
  for (const f of families.values()) {
    if (state.cat !== 'すべて' && f.chip !== state.cat) continue;
    const rs = f.rows.filter(r => !q || matches(r, q));
    if (rs.length) out.push([f, rs]);
  }
  return out;
}
function renderList() {
  const list = $('#list');
  const fams = visibleFamilies();
  if (state.view === 'table') { renderTable(fams); return; }
  list.innerHTML = fams.map(([f, rs]) => `
    <article class="fam" data-fam="${esc(f.key)}">
      <header class="fam-h"><h3>${esc(f.title)}${f.sub ? `<small>${esc(f.sub)}</small>` : ''}</h3><p class="fam-in">${esc(f.rows[0].input)}</p>${f.when ? `<p class="when">${esc(f.when)}</p>` : ''}</header>
      <div class="fam-grid">
        <div class="frow ruler-row"><span></span>${rulerHTML(f.max)}<span class="adv-h">ヒット／ガード</span></div>
        ${rs.map(r => rowHTML(r, f.max)).join('')}
      </div>
      <p class="readout">帯の上をなぞると、同じフレームの状態を並べて比べられます</p>
    </article>`).join('') || '<p class="note">条件に合う技がありません。</p>';
  markPips();
}
function tableFilterValue(o, key) {
  if (key === 'move') return [famOf(o).title, famOf(o).sub, o.variant, o.name].filter(Boolean).join(' ');
  if (key === 'input') return o.input || '';
  if (key === 'startup') return o.startup;
  if (key === 'active') return o.raw.active || '';
  if (key === 'recovery') return o.raw.recovery || '';
  if (key === 'total') return o.total;
  if (key === 'hit') return o.hit;
  if (key === 'block') return o.block;
  if (key === 'cancel') return o.cancel || '';
  if (key === 'dmg') return typeof o.dmg === 'object' && o.dmg ? o.dmg.cmd : o.dmg;
  if (key === 'attribute') return o.raw.attribute || '';
  return '';
}
function tableFilterMatch(value, query) {
  const q = String(query || '').trim();
  if (!q) return true;
  if (typeof value === 'number') {
    const m = /^(<=|>=|<|>|=)?\s*(-?\d+(?:\.\d+)?)$/.exec(q.replace(/[−－]/g, '-'));
    if (m) {
      const n = Number(m[2]);
      return m[1] === '<=' ? value <= n : m[1] === '>=' ? value >= n : m[1] === '<' ? value < n : m[1] === '>' ? value > n : value === n;
    }
  }
  const text = value === 'D' ? 'D ダウン' : String(value ?? '—');
  return text.toLowerCase().includes(q.toLowerCase().replace('+', '＋'));
}
function renderTable(fams) {
  let rs = fams.flatMap(([, r]) => r);
  rs = rs.filter(o => Object.entries(state.tableFilters).every(([key, q]) => tableFilterMatch(tableFilterValue(o, key), q)));
  const k = state.sort.key;
  if (k) {
    const val = o => k === 'dmg' ? (typeof o.dmg === 'object' && o.dmg ? o.dmg.cmd : o.dmg) : o[k] === 'D' ? 99 : o[k];
    rs = [...rs].sort((a, b) => ((val(a) ?? 999) - (val(b) ?? 999)) * state.sort.dir);
  }
  const cols = [
    ['技', 'move', null, '技名'],
    ['入力', 'input', null, '入力'],
    ['発生', 'startup', 'startup', '≤6'],
    ['持続', 'active', null, '持続'],
    ['硬直', 'recovery', null, '硬直'],
    ['全体', 'total', 'total', '≤40'],
    ['ヒット', 'hit', 'hit', '>=1'],
    ['ガード', 'block', 'block', '>=0'],
    ['キャンセル', 'cancel', null, 'C / SA'],
    ['ダメージ', 'dmg', 'dmg', '>=1000'],
    ['属性', 'attribute', null, '属性']
  ];
  const cell = (v, cls = '') => `<td class="${cls}">${v}</td>`;
  const adv = v => { const t = TIER(v); return `<span class="${t ? 't-' + t[0] : ''}">${fmt(v)}</span>`; };
  const peek = text => {
    const full = String(text || '—');
    return `<button type="button" class="cell-peek" data-peek="${esc(full)}" aria-label="${esc(full)}"><span>${esc(full)}</span></button>`;
  };
  $('#list').innerHTML = `<div class="tbl-wrap"><table class="tbl"><thead>
    <tr>${cols.map(([c, filter, sort]) => `<th${sort ? ` data-sort="${sort}"` : ''}>${c}${sort && state.sort.key === sort ? (state.sort.dir > 0 ? ' ▲' : ' ▼') : ''}</th>`).join('')}</tr>
    <tr class="filter-row">${cols.map(([c, filter, sort, ph]) => `<th><input class="tbl-filter" type="search" inputmode="${['startup','total','hit','block','dmg'].includes(filter) ? 'text' : 'search'}" data-filter="${filter}" value="${esc(state.tableFilters[filter] || '')}" placeholder="${esc(ph)}" maxlength="12" size="8" aria-label="${esc(c)}を絞り込む"></th>`).join('')}</tr>
    </thead><tbody>${rs.map(o => `
    <tr data-id="${o.id}" data-name="${esc(o.name)}" class="${cur() === o ? 'sel' : ''}${punClass(o)}">${cell(esc(famOf(o).title) + ' <small>' + esc(o.variant) + '</small>')}${cell(peek(o.input), 'in')}${cell(o.startup ?? '—')}${cell(esc(o.raw.active || '—'))}${cell(esc(o.raw.recovery || '—'))}${cell(o.total ?? '—')}${cell(adv(o.hit))}${cell(adv(o.block))}${cell(esc(o.cancel || '—'))}${cell(esc(o.raw.damage))}${cell(esc(o.raw.attribute || '—'))}</tr>`).join('')}</tbody></table>
    ${rs.length ? '' : '<p class="tbl-empty">この絞り込みに合う技がありません。</p>'}
  </div>`;
}
function markPips() {
  for (const b of $$('.bar')) b.classList.toggle('pips', b.clientWidth / Number(b.dataset.max) >= 5);
}

/* ---------- 詳細とつながりの地図 ---------- */
const cur = () => state.path.length ? byId.get(state.path[state.path.length - 1].id) : null;
function select(id, { keepPath = false } = {}) {
  if (!keepPath) state.path = [{ id, via: null }];
  state.lastMap = null;
  renderAll();
  if (matchMedia('(max-width: 1023px)').matches) openSheet(true);
}
function linksFrom(o, adv) {
  return LINK_TARGETS.map(t => ({ t, w: adv - t.startup + 1 })).filter(x => x.w >= 1).sort((a, b) => a.t.startup - b.t.startup || b.w - a.w);
}
function mapGroups(o) {
  const groups = [];
  const cond = state.path.length === 1 ? state.cond : 'n';
  const node = (target, label, meta, badge, key, doc) => ({ id: target ? target.id : null, label, meta, badge, key, doc });
  let note = state.path.length > 1 ? '2手目以降は、カウンターなどの加算がない通常ヒットとして計算しています。' : '';
  if (cond === 'g') {
    if (typeof o.block === 'number') {
      const gaps = LINK_TARGETS.filter(isNormal).map(t => ({ t, g: t.startup - 1 - o.block })).sort((a, b) => a.g - b.g).slice(0, 6);
      groups.push({ key: 'gap', title: '固め', sub: `ガード${fmt(o.block)}F。次の技までの隙間 = 発生 − 1 − ガード硬直差`, nodes: gaps.map(({ t, g }) => node(t, famOf(t).title + (t.variant !== '通常' ? ' ' + t.variant : ''), t.startup + 'F', g <= 0 ? '連続ガード' : `隙間${g}F`, 'g' + t.id)) });
    } else groups.push({ key: 'gap', title: '固め', sub: 'ガード時の硬直差が公式表にありません', nodes: [] });
  } else if (typeof o.hit === 'number') {
    let adv = o.hit + COND[cond][1];
    if (cond === 'dr' && !isNormal(o)) { adv = o.hit; note = 'ラッシュの+4Fは、ラッシュから出した通常技だけにかかります。'; }
    if (cond === 'pc' && o.pcHit != null) { adv = o.pcHit; note = `公式備考「パニッシュカウンター時+${o.pcHit}F」をヒット有利として使っています（要確認）。`; }
    const L = linksFrom(o, adv);
    groups.push({ key: 'link', title: '目押し', sub: `有利${fmt(adv)}F − 次の発生 + 1 = 猶予`, nodes: L.slice(0, 8).map(({ t, w }) => node(t, famOf(t).title + (t.variant !== '通常' ? ' ' + t.variant : ''), t.startup + 'F', `猶予${w}F`, 'l' + t.id)), more: Math.max(0, L.length - 8) });
  } else if (o.hit === 'D') {
    groups.push({ key: 'down', title: 'ダウン', sub: '目押しは続かない。起き攻めか、定番ルートの追撃へ', nodes: [] });
  }
  const cx = CANCEL[o.cancel];
  if (cx) {
    const nodes = [];
    for (const to of cx.to) {
      if (to === 'sp') for (const [label, name] of SPECIAL_FAMILIES) nodes.push(node(byName.get(name), label, '必殺技', '', 'c' + name));
      else { const t = byName.get(to); if (t) nodes.push(node(t, t.variant, t.startup ? t.startup + 'F' : '', '', 'c' + to)); }
    }
    groups.push({ key: 'cancel', title: 'キャンセル', sub: `${o.cancel}：${cx.text}。届くかは距離次第`, nodes });
  }
  if (o.flags.includes('連打キャンセル')) groups.push({ key: 'rapid', title: '連打キャンセル', sub: '同じ弱攻撃を連打でつなげる', nodes: [node(o, o.variant === '通常' ? famOf(o).title : o.variant, o.startup + 'F', '', 'r' + o.id)] });
  const dv = (DERIVES[o.name] || []).map(n => byName.get(n)).filter(Boolean);
  if (dv.length) {
    const w = o.windows.find(x => x.kind === 'derive');
    groups.push({ key: 'derive', title: '派生', sub: w ? `${w.from}〜${w.to}Fに入力（${w.text.replace(/^\S+\s/, '')}）` : '追加入力で出る専用技', nodes: dv.map(t => node(t, t.variant, t.startup ? t.startup + 'F' : '', '', 'd' + t.id)) });
  }
  const rt = ROUTES[o.name] && (ROUTES[o.name][cond] || ROUTES[o.name].n);
  if (rt) groups.push({ key: 'route', title: '定番ルート', sub: '資料由来・旧攻略ノートを移植。距離・高度はトレモで再確認', nodes: rt.map(([text, dmg, verification, conditions], k) => node(null, text, [dmg, verification, ...(conditions || [])].filter(Boolean).join('・'), '', 'x' + k, true)) });
  return { groups, note, cond };
}
function renderDetail() {
  const el = $('#detail');
  const o = cur();
  if (!o) { el.innerHTML = '<p class="note">左の帯から技を選ぶと、ここに詳細とつながりの地図が出ます。</p>'; return; }
  const f = famOf(o);
  const { groups, note, cond } = mapGroups(o);
  const keys = new Set(groups.flatMap(g => g.nodes.map(n => g.key + n.key)));
  const prev = state.lastMap && state.lastMap.root === o.id ? state.lastMap.keys : null;
  const grown = prev ? [...keys].filter(k => !prev.has(k)).length : 0;
  state.lastMap = { root: o.id, keys };
  const t = TIER(o.block);
  const dmg = o.dmg && typeof o.dmg === 'object' ? `${o.dmg.sp}<small>SP ${o.dmg.sp}／コマンド ${o.dmg.cmd}</small>` : `${o.dmg ?? '—'}`;
  const key = [];
  if (o.a0 != null) key.push(`<li><i style="background:var(--f-start)"></i>発生 <b>${o.startup}F</b></li>`, `<li><i style="background:var(--f-act)"></i>持続 <b>${o.a0}–${o.a1}F</b>（${o.a1 - o.a0 + 1}F）</li>`);
  if (o.rec != null) key.push(`<li><i style="background:var(--f-rec)"></i>硬直 <b>${o.rec}F</b></li>`);
  if (o.landing != null) key.push(`<li>着地後 <b>${o.landing}F</b></li>`);
  if (o.total != null) key.push(`<li>全体 <b>${o.total}F</b></li>`);
  for (const w of o.windows) key.push(`<li><i class="k-${w.kind}"${w.kind === 'derive' ? ' style="border:1.5px dashed var(--text)"' : ''}></i>${WIN_LABEL[w.kind]} <b>${w.from}–${w.to}F</b>${/\((\d)回\)|（(\d)回）/.test(w.text) ? `（${(/(\d)回/.exec(w.text) || [])[1]}回）` : ''}</li>`);
  const r = o.raw;
  el.innerHTML = `
    <div class="d-top">
      <button class="d-close" type="button" aria-label="閉じる" data-close>×</button>
      <p class="d-fam">${esc(f.title)}${f.sub ? ' ・ ' + esc(f.sub) : ''}</p>
      <div class="seg-ctl" role="tablist" aria-label="版">${f.rows.map(x => `<button role="tab" aria-selected="${x === o}" data-sel="${x.id}">${esc(x.variant)}</button>`).join('')}</div>
    </div>
    <h2 class="d-name">${esc(o.name)}</h2>
    <p class="d-input"><kbd>${esc(o.input)}</kbd></p>
    <div class="d-strip">${rulerHTML(f.max)}${barHTML(o, f.max, true)}<p class="readout" data-dread>帯をなぞると1Fごとの状態が出ます</p></div>
    <ul class="key">${key.join('')}</ul>
    <dl class="nums">
      <div><dt>ヒット</dt><dd class="${TIER(o.hit) ? 't-' + TIER(o.hit)[0] : ''}">${fmt(o.hit)}${o.pcHit != null ? `<small>パニカン時 +${o.pcHit}F（公式備考）</small>` : ''}</dd></div>
      <div><dt>ガード</dt><dd class="${t ? 't-' + t[0] : ''}">${fmt(o.block)}${t ? `<small>${t[1]}</small>` : ''}</dd></div>
      <div><dt>キャンセル</dt><dd>${esc(o.cancel || '—')}<small>${o.cancel && CANCEL[o.cancel] ? CANCEL[o.cancel].text : o.cancel ? '特定の技だけ（備考）' : 'できない'}</small></dd></div>
      <div><dt>ダメージ</dt><dd>${dmg}</dd></div>
      <div><dt>Dゲージ</dt><dd>${esc(r.driveHit || '—')}<small>ガード ${esc(r.driveBlock || '—')}／パニカン ${esc(r.drivePC || '—')}</small></dd></div>
      <div><dt>SAゲージ</dt><dd>${esc(r.saGain || '—')}<small>${esc(r.attribute ? '属性 ' + r.attribute : '')}</small></dd></div>
    </dl>
    ${o.flags.length || r.scaling.length ? `<ul class="tags">${[...r.scaling, ...o.flags].map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    ${f.when ? `<p class="d-when">使いどころ：${esc(f.when)}</p>` : ''}
    <section class="map" aria-label="つながりの地図">
      <h3>つながりの地図${grown ? `<span class="grew">+${grown}</span>` : ''}</h3>
      <div class="seg-ctl" role="group" aria-label="当たり方">${Object.entries(COND).map(([k, [label, b]], idx) => `<button type="button" data-cond="${k}" aria-pressed="${state.cond === k}" title="キー ${idx + 1}">${label}${b ? ' +' + b : ''}</button>`).join('')}</div>
      ${note ? `<p class="cond-note">${esc(note)}</p>` : ''}
      ${state.path.length > 1 ? `<div class="path">${state.path.map((p, k) => `${k ? `<span class="via">→ ${esc(p.via)} →</span>` : ''}<button type="button" data-step="${k}">${esc(byId.get(p.id).variant === '通常' ? famOf(byId.get(p.id)).title : famOf(byId.get(p.id)).title + ' ' + byId.get(p.id).variant)}</button>`).join('')}<button type="button" class="reset" data-step="0">最初から</button></div>` : ''}
      <div class="root"><b>${esc(o.variant === '通常' ? f.title : f.title + ' ' + o.variant)}</b><span class="mono">${COND[cond][0]}：ヒット ${fmt(o.hit)} ／ ガード ${fmt(o.block)}</span></div>
      ${groups.map(g => `<div class="tg" data-group="${g.key}"><h4>${esc(g.title)}<small>${esc(g.sub)}</small></h4>${g.nodes.length ? `<ul>${g.nodes.map(n => `<li><button type="button" class="node${n.doc ? ' doc' : ''}${prev && !prev.has(g.key + n.key) ? ' new' : ''}" ${n.id ? `data-to="${n.id}" data-via="${esc(g.title + (n.badge ? ' ' + n.badge : ''))}"` : 'disabled'}>${esc(n.label)}${n.meta ? `<span class="m">${esc(n.meta)}</span>` : ''}${n.badge ? `<em>${esc(n.badge)}</em>` : ''}</button></li>`).join('')}</ul>` : ''}${g.more ? `<p>ほか${g.more}件</p>` : ''}</div>`).join('')}
    </section>
    <details class="more"><summary>公式の全項目</summary><table>
      ${[['発生', r.startup], ['持続', r.active], ['硬直', r.recovery], ['ヒット', r.hit], ['ガード', r.block], ['キャンセル', r.cancel], ['ダメージ', r.damage], ['コンボ補正', r.scaling.join('、')], ['Dゲージ増加', r.driveHit], ['Dゲージ減少（ガード）', r.driveBlock], ['Dゲージ減少（パニカン）', r.drivePC], ['SAゲージ増加', r.saGain], ['属性', r.attribute]].map(([k, v]) => `<tr><th>${k}</th><td class="mono">${esc(v || '—')}</td></tr>`).join('')}
      <tr><th>備考</th><td>${r.notes.map(esc).join('<br>') || '—'}</td></tr>
    </table></details>`;
  markPips();
}
function renderFocus() {
  $('#focus').innerHTML = state.focus ? `<div class="focus-banner">状況：${esc(state.focus.title)}｜${state.focus.names.size}技を強調中<button type="button" data-unfocus>解除</button></div>` : '';
}
function renderChrome() {
  const cats = ['すべて', '通常技', '特殊技', '必殺技', 'SA', '投げ', '共通'];
  $('#cats').innerHTML = cats.map(c => `<button type="button" class="chip" data-cat="${c}" aria-pressed="${state.cat === c}">${c}</button>`).join('');
  $('#view-band').setAttribute('aria-pressed', state.view === 'band');
  $('#view-table').setAttribute('aria-pressed', state.view === 'table');
  $('#pun-out').textContent = '相手−' + state.pun.n;
}
function renderAll() { renderChrome(); renderFocus(); renderList(); renderDetail(); }

/* ---------- 状況から探す ---------- */
function renderSituations() {
  const scenes = ['すべて', ...(LAB.scenes?.length ? LAB.scenes : [...new Set(SITUATIONS.map(s => s.scene))])];
  $('#scenes').innerHTML = scenes.map(s => `<button type="button" class="chip" data-scene="${s}" aria-pressed="${state.scene === s}">${s}</button>`).join('');
  $('#sits').innerHTML = SITUATIONS.map((s, k) => {
    if (state.scene !== 'すべて' && s.scene !== state.scene) return '';
    const picks = s.pick.map(n => byName.get(n)).filter(Boolean);
    const max = Math.max(20, Math.ceil(Math.max(...picks.map(p => p.span)) / 10) * 10);
    return `<article class="sit"><span class="scene">${esc(s.scene)}</span><h3>${esc(s.title)}</h3><p>${esc(s.cue)}</p>
      ${picks.map((p, j) => {
        const showInput = p.section === '通常技' || p.section === '特殊技';
        return `<div class="pick"><span class="${j ? '' : 'first'}">${j ? '代わり' : '第一候補'}<br><span class="pick-name">${esc(famOf(p).title)}${p.variant !== '通常' ? ' ' + esc(p.variant) : ''}</span>${showInput ? `<kbd class="pick-input">${esc(p.input)}</kbd>` : ''}</span>${barHTML(p, max)}<span class="st">${p.startup ?? '—'}F</span></div>`;
      }).join('')}
      <p>避けたい場面：${esc(s.risk)}</p>
      <a data-sit="${k}" href="index.html?focus=${encodeURIComponent(s.key)}">技で比べる</a></article>`;
  }).join('');
  markPips();
}
function showTab(tab) {
  state.tab = tab;
  $('#waza').hidden = tab !== 'waza';
  $('#jokyo').hidden = tab !== 'jokyo';
  $('#tab-waza').toggleAttribute('aria-current', tab === 'waza');
  $('#tab-jokyo').toggleAttribute('aria-current', tab === 'jokyo');
  if (tab === 'waza') $('#tab-waza').setAttribute('aria-current', 'page'); else $('#tab-jokyo').setAttribute('aria-current', 'page');
  if (tab === 'jokyo') renderSituations(); else renderAll();
  try { history.replaceState(null, '', '#' + tab); } catch (e) { /* 一部の表示環境では変更できない */ }
}
function openSheet(on) {
  $('#detail').classList.toggle('open', on);
  $('#backdrop').hidden = !on;
}

/* ---------- 操作 ---------- */
let dragMoved = false, downX = 0;
document.addEventListener('pointerdown', e => { dragMoved = false; downX = e.clientX; });
document.addEventListener('click', e => {
  const peek = e.target.closest('[data-peek]');
  if (peek) {
    e.preventDefault();
    e.stopPropagation();
    const wasOpen = peek.classList.contains('open');
    $('.cell-peek.open').forEach(x => x.classList.remove('open'));
    peek.classList.toggle('open', !wasOpen);
    return;
  }
  const t = e.target.closest('button, tr[data-id], th[data-sort]');
  if (!t) return;
  if (t.matches('.row') && dragMoved) return;
  if (t.dataset.tab) return showTab(t.dataset.tab);
  if (t.dataset.cat) { state.cat = t.dataset.cat; try { localStorage.setItem('marisa-lab-cat', state.cat); } catch {} return renderAll(); }
  if (t.dataset.id) return select(t.dataset.id);
  if (t.dataset.sel) return select(t.dataset.sel);
  if (t.dataset.cond) { state.cond = t.dataset.cond; return renderDetail(); }
  if (t.dataset.to) { state.path.push({ id: t.dataset.to, via: t.dataset.via }); state.lastMap = null; renderAll(); return; }
  if (t.dataset.step != null) { state.path = state.path.slice(0, Number(t.dataset.step) + 1); state.lastMap = null; renderAll(); return; }
  if (t.dataset.sort) { const k = t.dataset.sort; state.sort = { key: k, dir: state.sort.key === k ? -state.sort.dir : 1 }; return renderList(); }
  if (t.dataset.close != null) return openSheet(false);
  if (t.dataset.unfocus != null) { state.focus = null; return renderAll(); }
  if (t.dataset.scene) { state.scene = t.dataset.scene; return renderSituations(); }
  if (t.dataset.sit != null) {
    const s = SITUATIONS[Number(t.dataset.sit)];
    state.focus = { title: s.title, names: new Set(s.pick) };
    state.cat = 'すべて'; state.q = ''; $('#q').value = '';
    state.path = [{ id: byName.get(s.pick[0]).id, via: null }];
    showTab('waza');
    const first = $(`.row[data-id="${state.path[0].id}"]`);
    if (first) first.scrollIntoView({ block: 'center' });
    return;
  }
  if (t.id === 'view-band' || t.id === 'view-table') { state.view = t.id === 'view-band' ? 'band' : 'table'; try { localStorage.setItem('marisa-lab-view', state.view); } catch {} return renderAll(); }
});
$('#backdrop').addEventListener('click', () => openSheet(false));
$('#q').addEventListener('input', e => { state.q = e.target.value; renderList(); });
document.addEventListener('input', e => {
  const f = e.target.closest('.tbl-filter');
  if (!f) return;
  state.tableFilters[f.dataset.filter] = f.value;
  const pos = { start: f.selectionStart, end: f.selectionEnd };
  renderList();
  const next = $(`.tbl-filter[data-filter="${f.dataset.filter}"]`);
  if (next) { next.focus(); next.setSelectionRange(pos.start ?? next.value.length, pos.end ?? next.value.length); }
});
$('#export-notebook')?.addEventListener('click', () => {
  const payload = { version: 1, exportedAt: new Date().toISOString(), situations: SITUATIONS.map(s => ({ id: s.key, scene: s.scene, title: s.title, picks: (s.pick || []).map(n => LAB.ids[n]).filter(Boolean) })) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'marisa-situation-notebook.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
$('#pun-on').addEventListener('change', e => { state.pun.on = e.target.checked; renderList(); });
$('#pun-n').addEventListener('input', e => { state.pun.n = Number(e.target.value); state.pun.on = true; $('#pun-on').checked = true; renderChrome(); renderList(); });

// 帯をなぞる: 同じ系統の全行で、同じフレームの状態を読む
function stateAt(o, f) {
  const s = [];
  if (o.a0 != null) s.push(f < o.a0 ? '発生前' : f <= o.a1 ? '攻撃判定' : o.rec != null && f <= o.a1 + o.rec ? '硬直' : o.landing != null ? '着地待ち' : '終了');
  else if (o.totalOnly != null) s.push(f <= o.totalOnly ? '動作中' : '終了');
  for (const w of o.windows) if (f >= w.from && f <= w.to) s.push(WIN_LABEL[w.kind]);
  return s.join('・');
}
function scrub(e) {
  const host = e.target.closest('.fam-grid, .d-strip');
  if (!host) return;
  const bar = $('.bar', host.matches('.d-strip') ? host : host.querySelector('.row') || host);
  if (!bar) return;
  if (Math.abs(e.clientX - downX) > 8 && e.buttons) dragMoved = true;
  const rect = bar.getBoundingClientRect();
  const max = Number(bar.dataset.max);
  const f = Math.min(max, Math.max(1, Math.ceil((e.clientX - rect.left) / rect.width * max)));
  const pos = ((f - 0.5) / max * 100).toFixed(3) + '%';
  host.classList.add('scrub');
  for (const c of $$('.cur', host)) c.style.left = pos;
  if (host.matches('.d-strip')) {
    const r = $('[data-dread]', host);
    r.textContent = `${f}F：${stateAt(cur(), f)}`; r.classList.add('on');
  } else {
    const card = host.closest('.fam');
    const read = $('.readout', card);
    const ids = $$('.row', host).map(b => byId.get(b.dataset.id));
    read.innerHTML = `<b class="mono">${f}F</b>　` + ids.map(o => `${esc(o.variant)}：${esc(stateAt(o, f))}`).join('　');
    read.classList.add('on');
  }
}
function unscrub(e) {
  const host = e.target.closest('.fam-grid, .d-strip');
  if (!host) return;
  host.classList.remove('scrub');
}
document.addEventListener('pointermove', scrub);
document.addEventListener('pointerout', e => { if (!e.relatedTarget || !e.target.closest('.fam-grid, .d-strip')?.contains(e.relatedTarget)) unscrub(e); });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { openSheet(false); if (state.focus) { state.focus = null; renderAll(); } return; }
  if (e.target.matches('input, textarea')) return;
  if (e.key === '/') { e.preventDefault(); $('#q').focus(); return; }
  const o = cur();
  if (!o || state.tab !== 'waza') return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    const ids = $$('#list [data-id]').map(x => x.dataset.id);
    const k = ids.indexOf(o.id);
    const next = ids[Math.min(ids.length - 1, Math.max(0, k + (e.key === 'ArrowDown' ? 1 : -1)))];
    if (next) { e.preventDefault(); select(next); $(`#list [data-id="${next}"]`)?.scrollIntoView({ block: 'nearest' }); }
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    const fr = famOf(o).rows, k = fr.indexOf(o);
    const t = fr[k + (e.key === 'ArrowRight' ? 1 : -1)];
    if (t) { e.preventDefault(); select(t.id); }
  } else if (/^[1-5]$/.test(e.key)) {
    state.cond = Object.keys(COND)[Number(e.key) - 1]; renderDetail();
  }
});
addEventListener('resize', markPips);

/* ---------- 初期表示: 必殺技の弱グラディウスを選んだ状態 ---------- */
try { const c = localStorage.getItem('marisa-lab-cat'); if (c) state.cat = c; const v = localStorage.getItem('marisa-lab-view'); if (v === 'band' || v === 'table') state.view = v; } catch {}
const params = new URLSearchParams(location.search);
if (params.get('cat')) state.cat = params.get('cat');
if (params.get('view') === 'table' || params.get('view') === 'band') state.view = params.get('view');
if (COND[params.get('cond')]) state.cond = params.get('cond');
const wanted = params.get('move');
const firstMove = (wanted && byId.get(wanted)) || byName.get('弱 グラディウス');
state.path = [{ id: firstMove.id, via: null }];
const focusId = params.get('focus');
if (focusId) {
  const s = SITUATIONS.find(x => x.key === focusId);
  if (s) { state.focus = { title: s.title, names: new Set(s.pick) }; state.cat = 'すべて'; const p = byName.get(s.pick[0]); if (p) state.path = [{ id: p.id, via: null }]; }
}
if (location.pathname.endsWith('/situations.html') || location.pathname.endsWith('situations.html')) showTab('jokyo'); else renderAll();
})();