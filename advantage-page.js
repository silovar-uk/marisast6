(() => {
  function classifySequence(advantage, startup, fastest = 4) {
    const plus = Number(advantage);
    const start = Number(startup);
    const fastestMove = Math.max(1, Number(fastest) || 4);
    const gap = start - plus - 1;

    if (gap <= 0) {
      return {
        id: "true",
        gap,
        label: "完全に埋まる（連続ガード）",
        detail: "相手が通常行動へ移れる隙間がありません。ガードを続けている相手には次の技まで連続ガードになります。ただし無敵技の性質や技の届く距離は別に確認します。"
      };
    }

    if (gap <= fastestMove - 2) {
      return {
        id: "trap",
        gap,
        label: `${gap}F空くが、最速${fastestMove}F暴れを潰す`,
        detail: "連続ガードではないため、無敵技、アーマー、ジャストパリィなどの選択肢は残ります。一方、通常の最速打撃を押した相手にはこちらの技が先に当たります。"
      };
    }

    if (gap === fastestMove - 1) {
      return {
        id: "trade",
        gap,
        label: `${gap}F空き。最速${fastestMove}Fと相打ち`,
        detail: "相手の最速打撃と同じフレームに攻撃判定が出ます。相打ち後の状況、ダメージ、リーチによって有利不利が変わるため、安定した暴れ潰しとは分けます。"
      };
    }

    return {
      id: "open",
      gap,
      label: `${gap}F空き。最速${fastestMove}Fで割り込まれる`,
      detail: "相手が最速打撃を選ぶと、こちらの次の技より先に攻撃判定が出ます。ディレイ打撃として使う場合は、相手がガードや投げ抜けを選ぶ読み合いとして扱います。"
    };
  }

  function extractPositiveBlockValues(block) {
    if (typeof block === "number") return block > 0 ? [block] : [];
    const text = String(block ?? "");
    if (!text || /要再計測|確認中|未計測/.test(text)) return [];
    const values = [];
    const regex = /([+-]\d+)\s*F?/g;
    let match;
    while ((match = regex.exec(text))) {
      const value = Number(match[1]);
      if (value > 0) values.push(value);
    }
    return values;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function pressureNote(move) {
    const source = `${move.name || ""} ${move.id || ""}`;
    if (/グラディウス|gladius/i.test(source)) {
      return "溜め成立時の有利を使います。ガードバックで投げや短い通常技が届かない場合があるため、次の技は発生だけでなく距離まで確認します。ワンボタン版はモダンマリーザの対空第一候補でもあります。";
    }
    if (/ファランクス|phalanx/i.test(source)) {
      return "ガード後も先に動けますが、強度によって離れる距離が変わります。小技、前歩き、エンフォルド、様子見を相手の暴れ方に合わせて分けます。";
    }
    if (/マグナ|バンカー|bHP|ファルクス|fHK/i.test(source)) {
      return "溜めを完成させた時の有利です。溜め中に割られる可能性と、ガードさせた後の打撃・投げ・ガードの三択を一つの連携として練習します。";
    }
    return "プラスフレームだけで次の行動を決めず、次の技の発生、届く距離、相手の最速技と無敵行動を合わせて判断します。";
  }

  function renderPlusMoves() {
    const list = document.querySelector("#plus-move-list");
    const count = document.querySelector("#plus-move-count");
    if (!list) return;

    const moves = (window.MARISA_DATA?.moves || [])
      .map(move => ({ move, plus: extractPositiveBlockValues(move.block) }))
      .filter(item => item.plus.length > 0)
      .sort((a, b) => Math.max(...b.plus) - Math.max(...a.plus));

    if (count) count.textContent = String(moves.length);

    if (!moves.length) {
      list.innerHTML = '<p class="advantage-caution">現行データから、ガード時プラスを確定できる技を抽出できませんでした。候補値や旧参考値は一覧へ混ぜていません。</p>';
      return;
    }

    list.innerHTML = moves.map(({ move, plus }) => `
      <article class="plus-move-card">
        <div class="plus-move-command">${escapeHtml(move.command || move.modern || "入力確認")}</div>
        <div>
          <small>${escapeHtml(move.category || "技")} / 最大 +${Math.max(...plus)}F</small>
          <h3>${escapeHtml(move.name || move.id)}</h3>
          <div class="plus-move-block">ガード時 ${escapeHtml(move.block)}</div>
          <p>${escapeHtml(pressureNote(move))}</p>
          <p><a href="moves.html?move=${encodeURIComponent(move.id)}">技カードで詳細を確認 →</a></p>
        </div>
      </article>
    `).join("");
  }

  function installCalculator() {
    const advantage = document.querySelector("#calc-advantage");
    const startup = document.querySelector("#calc-startup");
    const fastest = document.querySelector("#calc-fastest");
    const label = document.querySelector("#calc-result-label");
    const detail = document.querySelector("#calc-result-detail");
    const gapCopy = document.querySelector("#calc-result-gap");
    if (!advantage || !startup || !fastest || !label || !detail || !gapCopy) return;

    const update = () => {
      const result = classifySequence(advantage.value, startup.value, fastest.value);
      label.textContent = result.label;
      detail.textContent = result.detail;
      gapCopy.textContent = `計算上の隙間：${Math.max(0, result.gap)}F`;
      label.dataset.result = result.id;
    };

    [advantage, startup, fastest].forEach(input => input.addEventListener("input", update));
    update();
  }

  function runSelfTest() {
    const tests = [
      [4, 5, 4, "true"],
      [4, 6, 4, "trap"],
      [4, 8, 4, "trade"],
      [4, 9, 4, "open"]
    ];
    return tests.map(([advantage, startup, fastest, expected]) => {
      const actual = classifySequence(advantage, startup, fastest).id;
      return { advantage, startup, fastest, expected, actual, ok: actual === expected };
    });
  }

  window.MARISA_ADVANTAGE = {
    version: "1.0.0",
    classifySequence,
    extractPositiveBlockValues,
    selfTest: runSelfTest
  };

  document.addEventListener("DOMContentLoaded", () => {
    installCalculator();
    renderPlusMoves();

    if (new URLSearchParams(location.search).has("selftest")) {
      const results = runSelfTest();
      const target = document.querySelector("#advantage-selftest");
      if (target) {
        target.hidden = false;
        target.textContent = results.every(result => result.ok)
          ? "SELF TEST: PASS"
          : `SELF TEST: FAIL / ${JSON.stringify(results)}`;
      }
    }
  });
})();
