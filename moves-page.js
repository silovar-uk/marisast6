(() => {
  const data = window.MARISA_DATA;
  if (!data) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const normalize = value => String(value ?? "").toLowerCase().replace(/\s+/g, "");
  const params = new URLSearchParams(location.search);
  const allSituations = (data.situationGroups || []).flatMap(group => group.situations.map(item => ({ ...item, group: group.name })));
  const situationById = Object.fromEntries(allSituations.map(item => [item.id, item]));
  const moveById = Object.fromEntries(data.moves.map(move => [move.id, move]));

  const state = {
    category: data.categories.includes(params.get("category")) ? params.get("category") : "すべて",
    purpose: data.purposes.includes(params.get("purpose")) ? params.get("purpose") : "すべて",
    query: params.get("q") || "",
    situationId: situationById[params.get("situation")] ? params.get("situation") : null,
    moveId: moveById[params.get("move")] ? params.get("move") : null
  };

  const ratingMeta = {
    great: { symbol: "◎", label: "強い" },
    good: { symbol: "○", label: "良好" },
    neutral: { symbol: "―", label: "標準" },
    caution: { symbol: "△", label: "注意" },
    danger: { symbol: "×", label: "大きな隙" }
  };

  function moveSearchText(move) {
    return normalize([
      move.name, move.command, move.classic, move.category, move.description, move.when,
      ...(move.purposes || []), ...(move.strong || []), ...(move.follow || []), ...(move.risks || [])
    ].join(" "));
  }

  function firstNumber(value) {
    const match = String(value ?? "").match(/\d+/);
    return match ? Number(match[0]) : null;
  }

  function damageTotal(value) {
    const firstVariant = String(value ?? "").split("/")[0];
    if (!/\d/.test(firstVariant)) return null;
    return firstVariant.split("＋").reduce((sum, segment) => {
      const nums = (segment.match(/\d+/g) || []).map(Number);
      return sum + (nums.length ? Math.max(...nums) : 0);
    }, 0);
  }

  function signedNumbers(value) {
    return (String(value ?? "").match(/[+-]?\d+/g) || []).map(Number);
  }

  function rating(tone, label, detail = "") {
    return { ...ratingMeta[tone], tone, label, detail };
  }

  function rateStat(type, value) {
    const text = String(value ?? "");
    if (!text || text === "—" || /着地|可変|構えのみ|高度依存/.test(text)) return rating("neutral", "条件依存", "数値だけでは比較しにくい");
    if (type === "damage") {
      const number = damageTotal(text);
      if (number === null) return rating("neutral", "特殊", "直接ダメージなし");
      if (number >= 1800) return rating("great", "非常に高い");
      if (number >= 1200) return rating("good", "高い");
      if (number >= 700) return rating("neutral", "標準");
      return rating("caution", "低め");
    }
    if (type === "startup") {
      const number = firstNumber(text);
      if (number === null) return rating("neutral", "条件依存");
      if (number <= 4) return rating("great", "最速級");
      if (number <= 7) return rating("good", "速い");
      if (number <= 11) return rating("neutral", "標準");
      if (number <= 18) return rating("caution", "遅め");
      return rating("danger", "かなり遅い");
    }
    if (type === "active") {
      const number = firstNumber(text);
      if (number === null) return rating("neutral", "条件依存");
      if (number >= 8) return rating("great", "非常に長い");
      if (number >= 5) return rating("good", "長い");
      if (number >= 3) return rating("neutral", "標準");
      return rating("caution", "短い");
    }
    if (type === "recovery") {
      const number = firstNumber(text);
      if (number === null) return rating("neutral", "条件依存");
      if (number <= 12) return rating("great", "短い");
      if (number <= 20) return rating("neutral", "標準");
      if (number <= 27) return rating("caution", "大きい");
      return rating("danger", "非常に大きい");
    }
    if (type === "hit") {
      if (/バウンド|追撃/.test(text)) return rating("great", "追撃可能");
      if (/強制ダウン/.test(text)) return rating("great", "強制ダウン");
      if (/ダウン/.test(text)) return rating("good", "ダウン獲得");
      const nums = signedNumbers(text);
      if (!nums.length) return rating("neutral", "条件依存");
      const min = Math.min(...nums), max = Math.max(...nums);
      if (max >= 4 && min >= 0) return rating("great", "大幅有利");
      if (max >= 1 && min >= 0) return rating("good", "有利");
      if (min < 0) return rating("caution", "不利あり");
      return rating("neutral", "五分");
    }
    if (type === "block") {
      const nums = signedNumbers(text);
      if (!nums.length) return rating("neutral", "対象外");
      const min = Math.min(...nums), max = Math.max(...nums);
      if (min < 0 && max > 0) return rating("neutral", "条件で変化");
      if (min >= 4) return rating("great", "攻め継続");
      if (min >= 1) return rating("good", "有利");
      if (min === 0) return rating("neutral", "五分");
      if (min >= -3) return rating("caution", "小不利");
      return rating("danger", "反撃注意");
    }
    return rating("neutral", "標準");
  }

  function stat(label, value, note, type) {
    const meta = rateStat(type, value);
    return `<div class="stat stat-${meta.tone}"><small>${label}</small><span class="stat-rating" title="${meta.detail}">${meta.symbol} ${meta.label}</span><b>${value || "—"}</b>${note ? `<em>${note}</em>` : ""}</div>`;
  }

  function fillList(root, items = []) {
    root.innerHTML = items.map(item => `<li>${item}</li>`).join("");
  }

  function selectedSituation() {
    return state.situationId ? situationById[state.situationId] : null;
  }

  function filteredMoves() {
    const query = normalize(state.query);
    const situation = selectedSituation();
    const moveIds = situation ? new Set(situation.moves) : null;
    return data.moves.filter(move => {
      const categoryOk = state.category === "すべて" || move.category === state.category;
      const purposeOk = state.purpose === "すべて" || move.purposes.includes(state.purpose);
      const queryOk = !query || moveSearchText(move).includes(query);
      const situationOk = !moveIds || moveIds.has(move.id);
      return categoryOk && purposeOk && queryOk && situationOk;
    });
  }

  function syncUrl() {
    const next = new URLSearchParams();
    if (state.category !== "すべて") next.set("category", state.category);
    if (state.purpose !== "すべて") next.set("purpose", state.purpose);
    if (state.query) next.set("q", state.query);
    if (state.situationId) next.set("situation", state.situationId);
    if (state.moveId) next.set("move", state.moveId);
    const query = next.toString();
    history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}`);
  }

  function renderCategoryTabs() {
    const root = $("#category-tabs");
    root.innerHTML = ["すべて", ...data.categories].map(name => `<button type="button" class="${state.category === name ? "is-active" : ""}" data-category="${name}">${name}</button>`).join("");
  }

  function renderPurposeFilters() {
    const root = $("#purpose-filters");
    root.innerHTML = ["すべて", ...data.purposes].map(name => `<button type="button" class="filter-button${state.purpose === name ? " active" : ""}" data-purpose="${name}">${name}</button>`).join("");
  }

  function renderActiveSituation() {
    const root = $("#active-situation");
    const situation = selectedSituation();
    root.hidden = !situation;
    if (!situation) {
      root.innerHTML = "";
      return;
    }
    root.innerHTML = `<div><small>SITUATION / ${situation.group}</small><b>${situation.title}</b><p>${situation.copy}　第一候補：${situation.primary}</p></div><button type="button" data-clear-situation>状況指定を解除</button>`;
  }

  function renderStatus(count) {
    $("#result-count").textContent = count;
    const parts = [];
    if (state.category !== "すべて") parts.push(state.category);
    if (state.purpose !== "すべて") parts.push(state.purpose);
    if (state.query) parts.push(`「${state.query}」`);
    if (selectedSituation()) parts.push(selectedSituation().title);
    $("#active-filter-copy").textContent = parts.length ? parts.join(" / ") : "全技をカテゴリ順に表示";
  }

  function populateMoveCard(fragment, move) {
    const card = $(".move-card", fragment);
    card.dataset.moveId = move.id;
    $(".move-command", fragment).textContent = move.command;
    $(".move-category", fragment).innerHTML = `<span>${move.category}</span><i class="priority-badge priority-${String(move.priority).toLowerCase()}">優先度 ${move.priority}</i>`;
    $(".move-name", fragment).textContent = move.name;
    $(".move-purpose-summary", fragment).textContent = move.purposes.join("・");
    $(".move-damage-summary", fragment).innerHTML = `<span>ダメージ</span><b>${move.damage}</b>`;
    $(".move-when", fragment).textContent = move.when;
    $(".move-description", fragment).textContent = move.description;
    $(".purpose-tags", fragment).innerHTML = move.purposes.map(item => `<span>${item}</span>`).join("");
    $(".stats-grid", fragment).innerHTML = [
      stat("ダメージ", move.damage, move.shortcutDamage || "", "damage"),
      stat("発生", move.startup, "", "startup"),
      stat("持続", move.active, "", "active"),
      stat("硬直", move.recovery, "", "recovery"),
      stat("ヒット時", move.hit, "", "hit"),
      stat("ガード時", move.block, "", "block")
    ].join("");
    fillList($(".strong-list", fragment), move.strong);
    fillList($(".follow-list", fragment), move.follow);
    fillList($(".risk-list", fragment), move.risks);
    $(".input-notes", fragment).innerHTML = `<b>入力・性能メモ：</b> ${move.note || "—"}${move.classic ? ` <span>（補助表記：${move.classic}）</span>` : ""}`;
  }

  function renderMoves() {
    const moves = filteredMoves();
    const root = $("#move-list");
    const template = $("#move-template");
    root.innerHTML = "";

    data.categories.forEach((category, categoryIndex) => {
      const categoryMoves = moves.filter(move => move.category === category);
      if (!categoryMoves.length) return;
      const section = document.createElement("section");
      section.className = "move-group";
      section.id = `group-${categoryIndex + 1}`;
      section.innerHTML = `<header class="move-group-heading"><span>${String(categoryIndex + 1).padStart(2, "0")}</span><h2>${category}</h2><small>${categoryMoves.length}技</small></header><div class="move-list"></div>`;
      const list = $(".move-list", section);
      categoryMoves.forEach(move => {
        const fragment = template.content.cloneNode(true);
        populateMoveCard(fragment, move);
        list.append(fragment);
      });
      root.append(section);
    });

    renderStatus(moves.length);
    renderActiveSituation();
    $("#empty-state").hidden = moves.length !== 0;

    if (state.moveId && moves.some(move => move.id === state.moveId)) {
      requestAnimationFrame(() => openMove(state.moveId, false));
    }
  }

  function toggleCard(card, forceOpen) {
    const detail = $(".move-detail", card);
    const summary = $(".move-summary", card);
    const open = forceOpen ?? detail.hidden;
    detail.hidden = !open;
    card.classList.toggle("is-open", open);
    summary.setAttribute("aria-expanded", String(open));
    if (open) {
      state.moveId = card.dataset.moveId;
      syncUrl();
    } else if (state.moveId === card.dataset.moveId) {
      state.moveId = null;
      syncUrl();
    }
  }

  function openMove(id, scroll = true) {
    const card = $(`[data-move-id="${id}"]`);
    if (!card) return;
    toggleCard(card, true);
    if (scroll) card.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function rerender() {
    state.moveId = null;
    renderCategoryTabs();
    renderPurposeFilters();
    renderMoves();
    syncUrl();
  }

  document.addEventListener("click", event => {
    const category = event.target.closest("[data-category]");
    if (category) {
      state.category = category.dataset.category;
      state.situationId = null;
      rerender();
      return;
    }

    const purpose = event.target.closest("[data-purpose]");
    if (purpose) {
      state.purpose = purpose.dataset.purpose;
      state.situationId = null;
      rerender();
      return;
    }

    const summary = event.target.closest(".move-summary");
    if (summary) {
      toggleCard(summary.closest(".move-card"));
      return;
    }

    if (event.target.closest("[data-clear-situation]")) {
      state.situationId = null;
      rerender();
      return;
    }

    if (event.target.closest("#clear-filters") || event.target.closest("#status-clear")) {
      state.category = "すべて";
      state.purpose = "すべて";
      state.query = "";
      state.situationId = null;
      $("#search-input").value = "";
      rerender();
    }
  });

  let searchTimer;
  $("#search-input").addEventListener("input", event => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = event.target.value.trim();
      state.situationId = null;
      rerender();
    }, 140);
  });

  $("#search-input").value = state.query;
  renderCategoryTabs();
  renderPurposeFilters();
  renderMoves();
  renderActiveSituation();
  if (state.query || state.purpose !== "すべて") $("#move-tools").open = true;
})();
