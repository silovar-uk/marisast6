(() => {
function initMoveAdvancedTools() {
  const data = window.MARISA_DATA;
  if (!data?.moves?.length || !document.querySelector("#move-list")) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const params = new URLSearchParams(location.search);
  const moveById = Object.fromEntries(data.moves.map(move => [move.id, move]));
  const moveOrder = Object.fromEntries(data.moves.map((move, index) => [move.id, index]));
  const SORTS = {
    category: { label: "カテゴリ順" },
    startup: { label: "発生が速い順" },
    damage: { label: "ダメージが高い順" },
    block: { label: "ガード時有利順" },
    recovery: { label: "硬直が短い順" },
    priority: { label: "優先度順" }
  };
  const PUNISH_FRAMES = [4, 5, 6, 7, 8, 10, 12, 15];
  const parsedPunish = Number(params.get("punish"));
  const initialCompare = (params.get("compare") || "")
    .split(",")
    .filter(id => moveById[id])
    .slice(0, 3);

  const state = {
    sort: SORTS[params.get("sort")] ? params.get("sort") : "category",
    punish: PUNISH_FRAMES.includes(parsedPunish) ? parsedPunish : null,
    compareMode: params.get("compareMode") === "1" || initialCompare.length > 0,
    compare: initialCompare
  };

  let applying = false;
  let observer;
  let scheduled = false;

  const firstVariant = value => String(value ?? "").split("/")[0].trim();
  const firstNumber = value => {
    const match = firstVariant(value).match(/\d+/);
    return match ? Number(match[0]) : null;
  };
  const firstSigned = value => {
    const match = firstVariant(value).match(/[+-]?\d+/);
    return match ? Number(match[0]) : null;
  };
  const damageTotal = value => {
    const text = firstVariant(value);
    if (!/\d/.test(text)) return null;
    return text.split("＋").reduce((sum, segment) => {
      const nums = (segment.match(/\d+/g) || []).map(Number);
      return sum + (nums.length ? Math.max(...nums) : 0);
    }, 0);
  };
  const priorityValue = value => ({ S: 0, A: 1, B: 2, C: 3, D: 4 })[String(value || "").toUpperCase()] ?? 9;
  const valueFor = (move, key) => {
    if (!move) return null;
    if (key === "startup") return firstNumber(move.startup);
    if (key === "damage") return damageTotal(move.damage);
    if (key === "block") return firstSigned(move.block);
    if (key === "recovery") return firstNumber(move.recovery);
    if (key === "priority") return priorityValue(move.priority);
    if (key === "total") return firstNumber(move.total);
    return null;
  };
  const compareNullable = (a, b, direction = 1) => {
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    return (a - b) * direction;
  };
  const sortMoves = moves => {
    const direction = state.sort === "damage" || state.sort === "block" ? -1 : 1;
    return [...moves].sort((a, b) => {
      let result = compareNullable(valueFor(a, state.sort), valueFor(b, state.sort), direction);
      if (!result && state.sort !== "startup") {
        result = compareNullable(valueFor(a, "startup"), valueFor(b, "startup"), 1);
      }
      return result || (moveOrder[a.id] ?? 9999) - (moveOrder[b.id] ?? 9999);
    });
  };

  function syncAdvancedUrl() {
    const next = new URLSearchParams(location.search);
    if (state.sort !== "category") next.set("sort", state.sort); else next.delete("sort");
    if (state.punish) next.set("punish", String(state.punish)); else next.delete("punish");
    if (state.compareMode) next.set("compareMode", "1"); else next.delete("compareMode");
    if (state.compare.length) next.set("compare", state.compare.join(",")); else next.delete("compare");
    const query = next.toString();
    history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}${location.hash}`);
  }

  function ensureToolbar() {
    if ($("#move-advanced-tools")) return;
    const categoryTabs = $("#category-tabs");
    if (!categoryTabs) return;
    const wrap = document.createElement("div");
    wrap.id = "move-advanced-tools";
    wrap.className = "move-advanced-wrap";
    wrap.innerHTML = `
      <div class="move-advanced-tools" aria-label="技一覧の表示設定">
        <label class="move-sort-control">
          <span>並び順</span>
          <select id="move-sort-select">
            ${Object.entries(SORTS).map(([value, meta]) => `<option value="${value}">${meta.label}</option>`).join("")}
          </select>
        </label>
        <button id="punish-toggle" class="advanced-tool-button" type="button" aria-expanded="false"><span>確反検索</span><b>不利Fから逆引き</b></button>
        <button id="compare-mode-toggle" class="advanced-tool-button" type="button" aria-pressed="false"><span>比較モード</span><b>最大3技</b></button>
      </div>
      <section id="punish-panel" class="punish-panel" hidden>
        <div class="punish-panel-copy"><small>PUNISH FINDER</small><b>相手の不利フレームから、間に合う技を絞る</b><span>フレーム上の候補です。実戦では距離・入力時間・姿勢も確認してください。</span></div>
        <div class="punish-buttons" aria-label="相手の不利フレーム">
          ${PUNISH_FRAMES.map(frame => `<button type="button" data-punish-frame="${frame}">-${frame}F</button>`).join("")}
          <button type="button" data-punish-clear>解除</button>
        </div>
      </section>
      <section id="move-compare-panel" class="move-compare-panel" hidden></section>`;
    categoryTabs.insertAdjacentElement("afterend", wrap);

    $("#move-sort-select", wrap).value = state.sort;
    $("#move-sort-select", wrap).addEventListener("change", event => {
      state.sort = event.target.value;
      applyAll();
    });
    $("#punish-toggle", wrap).addEventListener("click", () => {
      const panel = $("#punish-panel", wrap);
      panel.hidden = !panel.hidden;
      $("#punish-toggle", wrap).setAttribute("aria-expanded", String(!panel.hidden));
    });
    $("#compare-mode-toggle", wrap).addEventListener("click", () => {
      state.compareMode = !state.compareMode;
      if (!state.compareMode) state.compare = [];
      applyAll();
    });
    wrap.addEventListener("click", event => {
      const frameButton = event.target.closest("[data-punish-frame]");
      if (frameButton) {
        state.punish = Number(frameButton.dataset.punishFrame);
        if (state.sort === "category") state.sort = "damage";
        applyAll();
        return;
      }
      if (event.target.closest("[data-punish-clear]")) {
        state.punish = null;
        applyAll();
        return;
      }
      if (event.target.closest("[data-compare-clear]")) {
        state.compare = [];
        applyAll();
      }
    });

    const clearFilters = $("#clear-filters");
    if (clearFilters && !clearFilters.dataset.advancedBound) {
      clearFilters.dataset.advancedBound = "true";
      clearFilters.addEventListener("click", () => {
        state.punish = null;
        scheduleApply();
      });
    }
    const statusClear = $("#status-clear");
    if (statusClear && !statusClear.dataset.advancedBound) {
      statusClear.dataset.advancedBound = "true";
      statusClear.addEventListener("click", () => {
        state.punish = null;
        scheduleApply();
      });
    }
  }

  function updateToolbar() {
    const select = $("#move-sort-select");
    if (select) select.value = state.sort;
    const punishToggle = $("#punish-toggle");
    if (punishToggle) punishToggle.classList.toggle("is-active", Boolean(state.punish));
    $$("[data-punish-frame]").forEach(button => {
      button.classList.toggle("is-active", Number(button.dataset.punishFrame) === state.punish);
    });
    const compareToggle = $("#compare-mode-toggle");
    if (compareToggle) {
      compareToggle.classList.toggle("is-active", state.compareMode);
      compareToggle.setAttribute("aria-pressed", String(state.compareMode));
      const count = $("b", compareToggle);
      if (count) count.textContent = state.compareMode ? `${state.compare.length}/3選択` : "最大3技";
    }
    document.body.classList.toggle("is-move-compare-mode", state.compareMode);
  }

  function decorateCards() {
    $$(".move-card").forEach(card => {
      const move = moveById[card.dataset.moveId];
      if (!move) return;
      const damage = $(".move-damage-summary", card);
      if (damage && damage.dataset.advanced !== "true") {
        damage.dataset.advanced = "true";
        damage.innerHTML = `
          <span class="summary-stat"><small>発生</small><b>${move.startup || "—"}</b></span>
          <span class="summary-stat"><small>DMG</small><b>${move.damage || "—"}</b></span>`;
      }
      const summary = $(".move-summary", card);
      if (summary && !$(".compare-toggle", card)) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "compare-toggle";
        button.dataset.compareId = move.id;
        button.setAttribute("aria-label", `${move.name}を比較対象にする`);
        summary.insertAdjacentElement("afterend", button);
      }
      const compareButton = $(".compare-toggle", card);
      if (compareButton) {
        const selected = state.compare.includes(move.id);
        compareButton.classList.toggle("is-selected", selected);
        compareButton.textContent = selected ? "✓ 比較中" : "＋ 比較";
        compareButton.setAttribute("aria-pressed", String(selected));
      }
    });
  }

  function restoreCategoryLayout(root) {
    const sortedSection = $(".advanced-sorted-group", root);
    if (sortedSection) {
      $$(".move-card", sortedSection).forEach(card => {
        const move = moveById[card.dataset.moveId];
        const categoryIndex = data.categories.indexOf(move?.category);
        const target = categoryIndex >= 0 ? $(`#group-${categoryIndex + 1} .move-list`, root) : null;
        if (target) target.append(card);
      });
      sortedSection.remove();
    }
    $$(".move-group", root).forEach(section => {
      section.hidden = false;
      const list = $(".move-list", section);
      if (list && !list.children.length) section.hidden = true;
    });
  }

  function applyPunish(cards) {
    let visible = 0;
    cards.forEach(card => {
      const move = moveById[card.dataset.moveId];
      const startup = valueFor(move, "startup");
      const eligible = !state.punish || (move?.category !== "ジャンプ" && startup !== null && startup <= state.punish);
      card.hidden = !eligible;
      if (eligible) visible += 1;
    });
    return visible;
  }

  function applySort(root) {
    restoreCategoryLayout(root);
    const cards = $$(".move-card", root);
    if (state.sort === "category") return cards;

    const section = document.createElement("section");
    section.className = "move-group advanced-sorted-group";
    section.innerHTML = `<header class="move-group-heading"><span>↕</span><h2>${SORTS[state.sort].label}</h2><small></small></header><div class="move-list"></div>`;
    const list = $(".move-list", section);
    const orderedMoves = sortMoves(cards.map(card => moveById[card.dataset.moveId]).filter(Boolean));
    const cardById = Object.fromEntries(cards.map(card => [card.dataset.moveId, card]));
    orderedMoves.forEach(move => list.append(cardById[move.id]));
    $$(".move-group", root).forEach(group => { group.hidden = true; });
    root.prepend(section);
    return $$(".move-card", section);
  }

  function updateStatus(visibleCount) {
    const count = $("#result-count");
    if (count) count.textContent = String(visibleCount);
    const copy = $("#active-filter-copy");
    if (copy) {
      const base = copy.textContent.split("｜")[0].trim().replace(/全技をカテゴリ順に表示$/, "全技を表示");
      const extras = [];
      if (state.sort !== "category") extras.push(SORTS[state.sort].label);
      if (state.punish) extras.push(`-${state.punish}F確反`);
      copy.textContent = extras.length ? `${base} ｜ ${extras.join("・")}` : (base === "全技を表示" ? "全技をカテゴリ順に表示" : base);
    }
    const empty = $("#empty-state");
    if (empty) {
      empty.hidden = visibleCount !== 0;
      if (visibleCount === 0 && state.punish) {
        const title = $("b", empty);
        const note = $("span", empty);
        if (title) title.textContent = `-${state.punish}F以内で間に合う技がありません。`;
        if (note) note.textContent = "カテゴリ・用途・検索条件を減らすか、確反条件を解除してください。";
      }
    }
    const headingCount = $(".advanced-sorted-group .move-group-heading small");
    if (headingCount) headingCount.textContent = `${visibleCount}技`;
  }

  function bestSet(moves, key, direction) {
    const values = moves.map(move => ({ id: move.id, value: valueFor(move, key) })).filter(item => item.value !== null);
    if (!values.length) return new Set();
    const best = direction === "min" ? Math.min(...values.map(item => item.value)) : Math.max(...values.map(item => item.value));
    return new Set(values.filter(item => item.value === best).map(item => item.id));
  }

  function renderComparison() {
    const panel = $("#move-compare-panel");
    if (!panel) return;
    panel.hidden = !state.compareMode && !state.compare.length;
    if (panel.hidden) return;

    const moves = state.compare.map(id => moveById[id]).filter(Boolean);
    if (!moves.length) {
      panel.innerHTML = `<div class="compare-empty"><small>COMPARE MODE</small><b>比較したい技を2〜3個選ぶ</b><span>各技の「＋ 比較」を押すと、発生・火力・有利不利を横並びで確認できます。</span></div>`;
      return;
    }

    const best = {
      startup: bestSet(moves, "startup", "min"),
      damage: bestSet(moves, "damage", "max"),
      block: bestSet(moves, "block", "max"),
      recovery: bestSet(moves, "recovery", "min"),
      total: bestSet(moves, "total", "min")
    };
    const cell = (move, key, text) => `<td class="${best[key]?.has(move.id) && moves.length > 1 ? "is-best" : ""}">${text || "—"}</td>`;
    const rows = [
      ["入力", move => `<td>${move.command || "—"}</td>`],
      ["カテゴリ", move => `<td>${move.category || "—"}</td>`],
      ["発生", move => cell(move, "startup", move.startup)],
      ["ダメージ", move => cell(move, "damage", move.damage)],
      ["ガード時", move => cell(move, "block", move.block)],
      ["ヒット時", move => `<td>${move.hit || "—"}</td>`],
      ["硬直", move => cell(move, "recovery", move.recovery)],
      ["全体", move => cell(move, "total", move.total)],
      ["用途", move => `<td>${(move.purposes || []).join("・") || "—"}</td>`]
    ];

    panel.innerHTML = `
      <div class="compare-panel-head">
        <div><small>COMPARE MODE</small><b>${moves.length} / 3技を選択中</b><span>${moves.length < 2 ? "あと1技選ぶと差が見やすくなります。" : "緑のセルは、選択中の技で最も優秀な数値です。"}</span></div>
        <button type="button" data-compare-clear>選択をクリア</button>
      </div>
      <div class="compare-table-scroll">
        <table class="compare-table">
          <thead><tr><th>比較項目</th>${moves.map(move => `<th><b>${move.name}</b><span>${move.command}</span></th>`).join("")}</tr></thead>
          <tbody>${rows.map(([label, renderer]) => `<tr><th>${label}</th>${moves.map(renderer).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>`;
  }

  function handleCompareClick(event) {
    const button = event.target.closest(".compare-toggle");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const id = button.dataset.compareId;
    if (!id) return;
    if (state.compare.includes(id)) {
      state.compare = state.compare.filter(item => item !== id);
    } else if (state.compare.length < 3) {
      state.compare = [...state.compare, id];
    } else {
      const panel = $("#move-compare-panel");
      if (panel) {
        panel.classList.remove("is-limit");
        void panel.offsetWidth;
        panel.classList.add("is-limit");
      }
      return;
    }
    applyAll();
  }

  document.addEventListener("click", handleCompareClick, true);

  function applyAll() {
    if (applying) return;
    applying = true;
    if (observer) observer.disconnect();
    try {
      ensureToolbar();
      updateToolbar();
      decorateCards();
      const root = $("#move-list");
      if (root) {
        const orderedCards = applySort(root);
        const visibleCount = applyPunish(orderedCards);
        if (state.sort === "category") {
          $$(".move-group", root).forEach(section => {
            const visibleInGroup = $$(".move-card", section).some(card => !card.hidden);
            section.hidden = !visibleInGroup;
          });
        }
        updateStatus(visibleCount);
      }
      renderComparison();
      syncAdvancedUrl();
    } finally {
      if (observer) observer.observe($("#move-list"), { childList: true, subtree: true });
      applying = false;
    }
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyAll();
    });
  }

  const root = $("#move-list");
  if (!root) return;
  observer = new MutationObserver(scheduleApply);
  applyAll();
  observer.observe(root, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMoveAdvancedTools, { once: true });
} else {
  initMoveAdvancedTools();
}
})();
