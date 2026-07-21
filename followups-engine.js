(() => {
  const DATA = window.MARISA_FOLLOWUPS;
  const MOVES = window.MARISA_DATA;
  if (!DATA || !MOVES) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const moveById = Object.fromEntries(MOVES.moves.map(move => [move.id, move]));
  const rushEligible = new Set(["stLP","stMK","stHP","crLP","crMP","crHP","crLK","crHK","aMP","fMP","bHP","fHK"]);
  const targetIds = new Set(["lightTC","middleTC","heavyTC","fMPTC","fMPShoot","fHKTC","volare"]);

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function parseHitNumber(value) {
    const text = String(value || "").split("/")[0];
    if (/ダウン|バウンド|追撃|着地|高度|構え|—/.test(text)) return null;
    const match = text.match(/[+-]?\d+/);
    return match ? Number(match[0]) : null;
  }

  function kindFromText(text) {
    if (/SA3|SA2|SA1|倒し|リーサル/.test(text)) return "super";
    if (/起き攻め|前ステップ|生ラッシュ|再制圧|位置|投げ|ガード/.test(text)) return "oki";
    if (/→|＞|×|コンボ|ディマ|グラディウス|ファランクス/.test(text)) return "combo";
    return "position";
  }

  function defaultRec(move, text, index, conditionId) {
    const condition = DATA.conditions.find(item => item.id === conditionId);
    const kind = kindFromText(text);
    const rank = index === 0 ? "総合" : index === 1 ? "継続" : "代替";
    return DATA.rec(rank, text, {
      kind,
      power: kind === "super" ? 5 : kind === "combo" ? 3 : 1,
      oki: kind === "oki" ? 4 : /ダウン/.test(text) ? 4 : 2,
      ease: index === 0 ? 4 : 3,
      result: /ダウン/.test(text) ? "ダウン後の攻めへ" : /SA/.test(text) ? "SA締め" : "次の読み合いへ",
      reason: conditionId === "normal"
        ? "既存技データのヒット後候補を、実戦で使いやすい順に整理。"
        : `${condition.label}時も基本ルートは共通。追撃可否が変わる場合は距離・相手状態をトレモで確認。`,
      sources: ["official-frame", "lab-data"],
      verification: conditionId === "normal" ? "資料照合" : "通常ルート共通"
    });
  }

  function baseRecommendations(move, conditionId = "normal") {
    const follow = Array.isArray(move.follow) && move.follow.length
      ? move.follow.slice(0, 3)
      : ["直接追撃は狙わず、ヒット後の有利状況から次の読み合いへ"];
    return follow.map((text, index) => defaultRec(move, text, index, conditionId));
  }

  function rushUnavailable(move) {
    if (move.category === "投げ") {
      return {
        unavailable: false,
        note: "生ラッシュから投げには移れるが、投げ自体にラッシュの+4F補正は付かない。",
        recommendations: [DATA.rec("崩し", "生ラッシュ → 通常投げ", {
          kind: "pressure", drive: "0.5", power: 2, oki: 3, ease: 5,
          result: "打撃を警戒した相手を投げる",
          reason: "ラッシュ打撃との二択。投げ後は技カード記載の起き攻めへ。",
          sources: ["system-rules", "lab-data"]
        })]
      };
    }
    if (targetIds.has(move.id)) return { unavailable: true, note: "ターゲットコンボは初段の技側にラッシュ補正が付く。始動技のラッシュタブを参照。", recommendations: [] };
    if (["必殺技", "SA", "ジャンプ"].includes(move.category)) return { unavailable: true, note: "この技そのものはラッシュ強化通常技ではない。ラッシュ通常技からの中継先として使用する。", recommendations: [] };
    return { unavailable: true, note: "ラッシュ強化の対象外。", recommendations: [] };
  }

  function conditionResult(move, conditionId) {
    const override = DATA.overrides[move.id]?.[conditionId];
    if (override) return { unavailable: false, note: "", recommendations: override.slice(0, 3) };

    if (conditionId === "normal") {
      return { unavailable: false, note: "", recommendations: baseRecommendations(move, conditionId) };
    }

    if (conditionId === "rush") {
      if (!rushEligible.has(move.id)) return rushUnavailable(move);
      const normal = baseRecommendations(move, conditionId).slice(0, 2).map(item => ({
        ...item,
        drive: item.drive === "0" ? "0.5" : item.drive,
        reason: "ラッシュ通常技はヒット有利が+4F増える。専用リンク未登録のため、まず通常ルートを安定候補として表示。",
        verification: "通常ルート共通・専用リンク要確認",
        sources: ["official-frame", "system-rules", "lab-data"]
      }));
      return { unavailable: false, note: "専用リンクがない技は、通常ルートを安全側で表示。", recommendations: normal };
    }

    const condition = DATA.conditions.find(item => item.id === conditionId);
    const recommendations = baseRecommendations(move, conditionId).map(item => ({
      ...item,
      reason: `${condition.label}で通常より${condition.addFrames}F有利になるが、この技は専用ルート未登録。通常ルートを安定候補として表示。`,
      verification: "通常ルート共通・追加リンク要確認",
      sources: ["official-frame", "system-rules", "lab-data"]
    }));
    return { unavailable: false, note: "専用リンクがない場合は、無理に高難度ルートへ変えず通常ヒットと同じ選択を推奨。", recommendations };
  }

  function frameSummary(move, conditionId) {
    const condition = DATA.conditions.find(item => item.id === conditionId);
    if (conditionId === "rush" && !rushEligible.has(move.id)) return "ラッシュ補正対象外";
    const base = parseHitNumber(move.hit);
    if (base === null) {
      if (/ダウン|バウンド/.test(String(move.hit))) return `${condition.label}：ダウン・浮き属性。単純な+${condition.addFrames}F計算ではなく、追撃状態を優先。`;
      return `${condition.label}：高度・派生・技属性で結果が変わる。`;
    }
    const total = base + condition.addFrames;
    return `${condition.label}時の目安：${base >= 0 ? "+" : ""}${base}F → ${total >= 0 ? "+" : ""}${total}F`;
  }

  function rating(label, value) {
    return `<span><small>${escapeHtml(label)}</small><b>${"●".repeat(Math.max(1, Math.min(5, value)))}${"○".repeat(Math.max(0, 5 - value))}</b></span>`;
  }

  function sourceLinks(ids = []) {
    const unique = [...new Set(ids)].filter(id => DATA.sources[id]);
    return unique.map(id => {
      const source = DATA.sources[id];
      return `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer" title="${escapeHtml(source.note)}">${escapeHtml(source.label)}</a>`;
    }).join("");
  }

  function recommendationCard(item, index) {
    const conditions = (item.conditions || []).map(text => `<span>${escapeHtml(text)}</span>`).join("");
    return `<article class="followup-recommendation followup-kind-${escapeHtml(item.kind)}">
      <header>
        <div><small>#${index + 1}</small><b>${escapeHtml(item.rank)}</b></div>
        <span class="followup-verification">${escapeHtml(item.verification)}</span>
      </header>
      <p class="followup-route">${escapeHtml(item.route)}</p>
      <div class="followup-metrics">
        ${rating("火力", item.power)}${rating("継続", item.oki)}${rating("簡単", item.ease)}
      </div>
      <dl class="followup-resource-grid">
        <div><dt>ダメージ</dt><dd>${escapeHtml(item.damage)}</dd></div>
        <div><dt>Dゲージ</dt><dd>${escapeHtml(item.drive)}</dd></div>
        <div><dt>SA</dt><dd>${escapeHtml(item.super)}</dd></div>
        <div><dt>難度</dt><dd>Lv.${escapeHtml(item.difficulty)}</dd></div>
      </dl>
      <p class="followup-result"><small>ヒット後</small>${escapeHtml(item.result)}</p>
      <p class="followup-reason">${escapeHtml(item.reason)}</p>
      ${conditions ? `<div class="followup-conditions">${conditions}</div>` : ""}
      <footer><small>出典</small><div>${sourceLinks(item.sources)}</div></footer>
    </article>`;
  }

  function panelHtml(move, conditionId) {
    const result = conditionResult(move, conditionId);
    if (result.unavailable) {
      return `<div class="followup-unavailable"><b>この条件の専用ルートはなし</b><p>${escapeHtml(result.note)}</p></div>`;
    }
    return `<div class="followup-condition-summary">
        <b>${escapeHtml(frameSummary(move, conditionId))}</b>
        ${result.note ? `<span>${escapeHtml(result.note)}</span>` : ""}
      </div>
      <div class="followup-recommendation-grid">
        ${result.recommendations.slice(0, 3).map(recommendationCard).join("")}
      </div>`;
  }

  function renderSection(move) {
    const tabs = DATA.conditions.map((condition, index) => `<button type="button" role="tab" aria-selected="${index === 0}" class="${index === 0 ? "is-active" : ""}" data-followup-tab="${condition.id}">${escapeHtml(condition.label)}</button>`).join("");
    return `<details class="hit-followups" data-followup-move="${escapeHtml(move.id)}">
      <summary>
        <div><small>WHAT CONNECTS NEXT?</small><b>ヒット後おすすめ</b><span>通常・カウンター・パニカン・ラッシュを比較</span></div>
        <i>最大3択</i>
      </summary>
      <div class="hit-followups-body">
        <p class="followup-caution">火力・起き攻め・簡単さを総合評価。距離、持続当て、立ち／しゃがみ、画面端で変わるルートは条件を表示しています。「フレーム差分推定」はトレモでの最終確認を推奨します。</p>
        <div class="followup-tabs" role="tablist" aria-label="ヒット状況">${tabs}</div>
        <div class="followup-panel" data-followup-panel>${panelHtml(move, "normal")}</div>
      </div>
    </details>`;
  }

  function injectCard(card) {
    if (card.dataset.followupsReady === "true") return;
    const move = moveById[card.dataset.moveId];
    const detail = $(".move-detail", card);
    if (!move || !detail) return;
    detail.insertAdjacentHTML("beforeend", renderSection(move));
    card.dataset.followupsReady = "true";
  }

  function injectAll(root = document) {
    $$(".move-card[data-move-id]", root).forEach(injectCard);
  }

  document.addEventListener("click", event => {
    const tab = event.target.closest("[data-followup-tab]");
    if (!tab) return;
    const section = tab.closest(".hit-followups");
    const move = moveById[section?.dataset.followupMove];
    if (!section || !move) return;
    const conditionId = tab.dataset.followupTab;
    $$("[data-followup-tab]", section).forEach(button => {
      const active = button === tab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    const panel = $("[data-followup-panel]", section);
    if (panel) panel.innerHTML = panelHtml(move, conditionId);
  });

  function validateCoverage() {
    const actual = new Set(MOVES.moves.map(move => move.id));
    const declared = new Set(DATA.allMoveIds);
    const missing = [...actual].filter(id => !declared.has(id));
    const unknown = [...declared].filter(id => !actual.has(id));
    if (missing.length || unknown.length) console.warn("MARISA follow-up coverage mismatch", { missing, unknown });
  }

  const moveList = document.querySelector("#move-list");
  if (moveList) {
    const observer = new MutationObserver(() => injectAll(moveList));
    observer.observe(moveList, { childList: true, subtree: true });
  }
  validateCoverage();
  injectAll();
})();
