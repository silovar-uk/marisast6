// CAPCOM公式フレームデータ(マリーザ)をモダン表示で抽出する。
// 使い方: https://www.streetfighter.com/6/ja-jp/character/marisa/frame を普通のブラウザで開き、
//        このファイルの中身をコンソール(またはClaudeのブラウザペインのjavascript_tool)で実行する。
// 戻り値: { text, sha256, rows } 。text をそのまま data/official-modern-YYYY-MM-DD.json に保存し、
//        保存後のファイルのSHA-256が sha256 と一致することを確認する。
// 自動取得(ヘッドレス)は公式サイトが403で拒否するため使わない。拒否を回避する設定も入れない。
(async () => {
  const ICON = {
    'modern_l.png': '弱', 'modern_m.png': '中', 'modern_h.png': '強', 'modern_sp.png': 'SP',
    'modern_auto.png': 'A', 'modern_dl.png': 'DI', 'modern_dp.png': 'DP', 'key-all.png': '攻撃',
    'key-plus.png': '＋', 'arrow_3.png': ' → ', 'key-or.png': ' / ', 'key-nutral.png': 'N',
    'key-u.png': '↑', 'key-ur.png': '↗', 'key-r.png': '→', 'key-dr.png': '↘',
    'key-d.png': '↓', 'key-dl.png': '↙', 'key-l.png': '←', 'key-ul.png': '↖'
  };
  const tabs = document.querySelectorAll('[class*="frame_movelist_tabs"] li');
  if (tabs.length < 2) throw new Error('クラシック/モダンのタブが見つかりません');
  tabs[1].click(); // 2つ目がモダン
  for (let i = 0; i < 50 && !document.querySelector('table p[class*="frame_modern"]'); i++) {
    await new Promise(r => setTimeout(r, 100));
  }
  const txt = el => (el ? el.innerText.replace(/\s+/g, ' ').trim() : '');
  const items = el => (el ? [...el.querySelectorAll('li')].map(txt).filter(Boolean) : []);
  const input = p => {
    if (!p) return '';
    let s = '', last = '';
    const walk = n => {
      if (n.nodeType === 3) {
        let t = n.textContent;
        // ボタン画像の直後に同じ文字(弱・中・強)が続くので重複を消す
        if (last && t.trimStart().startsWith(last)) t = t.trimStart().slice(last.length);
        s += t; last = '';
      } else if (n.tagName === 'IMG') {
        const v = ICON[n.getAttribute('src').split('/').pop()] ?? '?';
        s += v; last = ['弱', '中', '強'].includes(v) ? v : '';
      } else n.childNodes.forEach(walk);
    };
    p.childNodes.forEach(walk);
    return s.replace(/\s+/g, ' ').replace(/ ?＋ ?/g, '＋').replace(/\( /g, '(')
      .replace(/攻撃 攻撃/g, '攻撃攻撃')
      .replace(/(SP|弱|中|強|攻撃) ?(?=(SP|弱|中|強|攻撃))/g, '$1＋').trim();
  };
  let section = '';
  const rows = [];
  for (const r of document.querySelectorAll('table tr')) {
    const td = [...r.querySelectorAll('td')];
    if (td.length === 1) { section = txt(td[0]); continue; }
    if (td.length < 14) continue;
    const note = r.querySelector('[class*="frame_note"]');
    const notes = items(note);
    rows.push({
      section,
      name: txt(td[0].querySelector('[class*="frame_arts"]')),
      input: input(td[0].querySelector('p')),
      startup: txt(td[1]), active: txt(td[2]), recovery: txt(td[3]),
      hit: txt(td[4]), block: txt(td[5]), cancel: txt(td[6]), damage: txt(td[7]),
      scaling: items(td[8]), driveHit: txt(td[9]), driveBlock: txt(td[10]),
      drivePC: txt(td[11]), saGain: txt(td[12]), attribute: txt(td[13]),
      notes: notes.length ? notes : [txt(note)].filter(Boolean)
    });
  }
  if (rows.length < 80) throw new Error(`行数が少なすぎます: ${rows.length}`);
  const unknown = rows.filter(r => r.input.includes('?')).map(r => r.name);
  const date = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  const text = `{"source":${JSON.stringify(location.href)},"mode":"modern","fetchedAt":"${date}","rows":[\n`
    + rows.map(r => JSON.stringify(r)).join(',\n') + '\n]}\n';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  const sha256 = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  return { rows: rows.length, unknown, sha256, text };
})();