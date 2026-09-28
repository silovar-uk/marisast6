(function (root) {
  'use strict';
  const number = v => /^[+-]?\d+$/.test(String(v ?? '').trim()) ? Number(v) : null;
  function activeRange(v) {
    const m = /(\d+)\s*-\s*(\d+)/.exec(String(v ?? ''));
    return m ? { from: Number(m[1]), to: Number(m[2]) } : null;
  }
  function windowKind(text) {
    if (/完全無敵/.test(text)) return 'inv';
    if (/空中判定の打撃・空弾属性に対して無敵/.test(text)) return 'aainv';
    if (/飛び道具無敵/.test(text)) return 'proj';
    if (/投げ無敵/.test(text)) return 'thinv';
    if (/当身/.test(text)) return 'parry';
    if (/アーマー/.test(text)) return 'armor';
    if (/空中判定/.test(text)) return 'air';
    if (/派生|移行可/.test(text)) return 'derive';
    return null;
  }
  function parseWindows(notes = []) {
    return notes.flatMap(text => {
      const m = /^(\d+)\s*-\s*(\d+)F?\s+(.+)$/.exec(text);
      if (!m) return [];
      const kind = windowKind(m[3]);
      return kind ? [{ from: Number(m[1]), to: Number(m[2]), kind, text }] : [];
    });
  }
  function parseOfficialRow(row, id, index = 0) {
    const a = activeRange(row.active);
    const rec = number(row.recovery);
    const totalOnly = /全体 ?(\d+)/.exec(String(row.recovery ?? ''));
    const landing = /着地後(\d+)/.exec(String(row.recovery ?? ''));
    const total = a && rec != null ? a.to + rec : totalOnly ? Number(totalOnly[1]) : null;
    return { id, index, startup: number(row.startup), active: a, recovery: rec, landing: landing ? Number(landing[1]) : null, total, hit: row.hit === 'D' ? 'D' : number(row.hit), block: number(row.block), windows: parseWindows(row.notes), raw: row };
  }
  function frameGap(blockAdvantage, startup) { return startup - 1 - blockAdvantage; }
  function linkWindow(hitAdvantage, startup) { return hitAdvantage - startup + 1; }
  root.MarisaCore = Object.freeze({ number, activeRange, windowKind, parseWindows, parseOfficialRow, frameGap, linkWindow });
})(typeof window === 'undefined' ? globalThis : window);