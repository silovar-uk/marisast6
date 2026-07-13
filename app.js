(() => {
  const data = window.MARISA_DATA;
  const state = { category: "すべて", purpose: "すべて", query: "", moveIds: null, situationId: null };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const normalize = (value) => String(value ?? "").toLowerCase().replace(/\s+/g, "");
  const moveSearchText = (move) => normalize([
    move.name, move.command, move.classic, move.category, move.description, move.when,
    ...(move.purposes || []), ...(move.strong || []), ...(move.follow || []), ...(move.risks || [])
  ].join(" "));
  const allSituations = (data.situationGroups || []).flatMap(group => group.situations.map(item => ({ ...item, group: group.name })));
  const situationById = Object.fromEntries(allSituations.map(item => [item.id, item]));

  const ratingMeta = {
    great: { symbol: "◎", label: "強い" },
    good: { symbol: "○", label: "良好" },
    neutral: { symbol: "―", label: "標準" },
    caution: { symbol: "△", label: "注意" },
    danger: { symbol: "×", label: "大きな隙" }
  };

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
    const matches = String(value ?? "").match(/[+-]?\d+/g) || [];
    return matches.map(Number);
  }

  function result(tone, label, detail = "") {
    return { tone, label, detail, ...ratingMeta[tone] };
  }

  function rateStat(type, value) {
    const text = String(value ?? "");
    if (!text || text === "—" || text.includes("着地") || text.includes("可変") || text.includes("構えのみ") || text.includes("高度依存")) {
      return result("neutral", "条件依存", "数値だけでは比較しにくい");
    }

    if (type === "damage") {
      const number = damageTotal(text);
      if (number === null) return result("neutral", "特殊", "直接ダメージなし");
      if (number >= 1800) return result("great", "非常に高い", "通常版・先頭表記を基準");
      if (number >= 1200) return result("good", "高い", "通常版・先頭表記を基準");
      if (number >= 700) return result("neutral", "標準", "通常版・先頭表記を基準");
      return result("caution", "低め", "速さや用途と交換");
    }

    if (type === "startup") {
      const number = firstNumber(text);
      if (number === null) return result("neutral", "条件依存");
      if (number <= 4) return result("great", "最速級", "4F以下");
      if (number <= 7) return result("good", "速い", "5〜7F");
      if (number <= 11) return result("neutral", "標準", "8〜11F");
      if (number <= 18) return result("caution", "遅め", "12〜18F");
      return result("danger", "かなり遅い", "19F以上");
    }

    if (type === "active") {
      const number = firstNumber(text);
      if (number === null) return result("neutral", "条件依存");
      if (number >= 8) return result("great", "非常に長い", "8F以上");
      if (number >= 5) return result("good", "長い", "5〜7F");
      if (number >= 3) return result("neutral", "標準", "3〜4F");
      return result("caution", "短い", "1〜2F");
    }

    if (type === "recovery") {
      const number = firstNumber(text);
      if (number === null) return result("neutral", "条件依存");
      if (number <= 12) return result("great", "短い", "12F以下");
      if (number <= 20) return result("neutral", "標準", "13〜20F");
      if (number <= 27) return result("caution", "大きい", "21〜27F");
      return result("danger", "非常に大きい", "28F以上");
    }

    if (type === "hit") {
      if (text.includes("バウンド") || text.includes("追撃")) return result("great", "追撃可能", "追加ダメージへ");
      if (text.includes("強制ダウン")) return result("great", "強制ダウン", "起き攻めへ");
      if (text.includes("ダウン")) return result("good", "ダウン獲得", "攻めを作れる");
      const nums = signedNumbers(text);
      if (!nums.length) return result("neutral", "条件依存");
      const min = Math.min(...nums), max = Math.max(...nums);
      if (max >= 4 && min >= 0) return result("great", "大幅有利", "+4F以上");
      if (max >= 1 && min >= 0) return result("good", "有利", "+1〜+3F");
      if (min < 0) return result("caution", "不利あり", "派生・条件を確認");
      return result("neutral", "五分", "±0F");
    }

    if (type === "block") {
      const nums = signedNumbers(text);
      if (!nums.length) return result("neutral", "対象外", "投げ・特殊状況");
      const min = Math.min(...nums), max = Math.max(...nums);
      if (min < 0 && max > 0) return result("neutral", "条件で変化", "通常版・溜め版を確認");
      if (min >= 4) return result("great", "攻め継続", "+4F以上");
      if (min >= 1) return result("good", "有利", "+1〜+3F");
      if (min === 0) return result("neutral", "五分", "±0F");
      if (min >= -3) return result("caution", "小不利", "反撃は受けにくい");
      if (min >= -6) return result("danger", "反撃注意", "距離・相手技を確認");
      return result("danger", "大反撃", "確定反撃を受ける");
    }

    return result("neutral", "標準");
  }

  function renderFirstSix() {
    const root = $("#first-six");
    const byId = Object.fromEntries(data.moves.map(move => [move.id, move]));
    root.innerHTML = data.firstSix.map(id => {
      const move = byId[id];
      return `<button class="first-move" type="button" data-open-move="${move.id}"><kbd>${move.command}</kbd><span>${move.name}</span></button>`;
    }).join("");
  }

  function renderSituationCards() {
    const root = $("#purpose-grid");
    root.innerHTML = data.situationGroups.map((group, groupIndex) => `
      <section class="situation-group" aria-labelledby="situation-group-${group.id}">
        <header class="situation-group-header">
          <span>${String(groupIndex + 1).padStart(2, "0")}</span>
          <div><h3 id="situation-group-${group.id}">${group.name}</h3><p>${group.copy}</p></div>
        </header>
        <div class="situation-grid">
          ${group.situations.map((card, index) => `
            <button class="situation-card${state.situationId === card.id ? " is-active" : ""}" type="button" data-situation-id="${card.id}">
              <small>${String(index + 1).padStart(2, "0")}</small>
              <b>${card.title}</b>
              <span class="situation-copy">${card.copy}</span>
              <span class="situation-choice"><i>第一候補</i><strong>${card.primary}</strong></span>
              <span class="situation-alt">代替：${card.alternatives}</span>
              <span class="situation-risk">注意：${card.risk}</span>
            </button>`).join("")}
        </div>
      </section>`).join("");
  }

  function renderFilters() {
    const categoryRoot = $("#category-filters");
    const purposeRoot = $("#purpose-filters");
    categoryRoot.innerHTML = ["すべて", ...data.categories].map(name => filterButton("category", name)).join("");
    purposeRoot.innerHTML = ["すべて", ...data.purposes].map(name => filterButton("purpose", name)).join("");
  }

  function filterButton(type, name) {
    const active = state[type] === name ? " active" : "";
    return `<button class="filter-button${active}" type="button" data-filter-type="${type}" data-filter-value="${name}">${name}</button>`;
  }

  function stat(label, value, note, type) {
    const rating = rateStat(type, value);
    return `<div class="stat stat-${rating.tone}">
      <small>${label}</small>
      <span class="stat-rating" title="${rating.detail}">${rating.symbol} ${rating.label}</span>
      <b>${value || "—"}</b>
      ${note ? `<em>${note}</em>` : ""}
    </div>`;
  }

  function renderActiveSituation() {
    const root = $("#active-situation");
    const situation = state.situationId ? situationById[state.situationId] : null;
    root.hidden = !situation;
    if (!situation) {
      root.innerHTML = "";
      return;
    }
    root.innerHTML = `
      <div class="active-situation-copy"><small>SITUATION SELECTED / ${situation.group}</small><b>${situation.title}</b><span>${situation.copy}</span></div>
      <div class="active-situation-plan"><span><i>第一候補</i>${situation.primary}</span><span><i>代替</i>${situation.alternatives}</span><span><i>注意</i>${situation.risk}</span></div>
      <button type="button" data-clear-situation>状況指定を解除</button>`;
  }

  function renderMoves() {
    const root = $("#move-list");
    const template = $("#move-template");
    const query = normalize(state.query);
    const filtered = data.moves.filter(move => {
      const categoryOk = state.category === "すべて" || move.category === state.category;
      const purposeOk = state.purpose === "すべて" || move.purposes.includes(state.purpose);
      const queryOk = !query || moveSearchText(move).includes(query);
      const situationOk = !state.moveIds || state.moveIds.includes(move.id);
      return categoryOk && purposeOk && queryOk && situationOk;
    });

    root.innerHTML = "";
    filtered.forEach(move => {
      const fragment = template.content.cloneNode(true);
      const card = $(".move-card", fragment);
      card.dataset.moveId = move.id;
      $(".move-command", fragment).textContent = move.command;
      $(".move-category", fragment).innerHTML = `<span>${move.category}</span><i class="priority-badge priority-${String(move.priority).toLowerCase()}">優先度 ${move.priority}</i>`;
      $(".move-name", fragment).textContent = move.name;
      $(".move-purpose-summary", fragment).textContent = move.purposes.join("・");
      $(".move-damage-summary", fragment).innerHTML = `<span>ダメージ</span><b>${move.damage}</b>`;
      $(".move-when", fragment).textContent = move.when;
      $(".move-description", fragment).textContent = move.description;
      $(".purpose-tags", fragment).innerHTML = move.purposes.map(p => `<span>${p}</span>`).join("");
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
      root.append(fragment);
    });

    $("#result-count").textContent = filtered.length;
    $("#empty-state").hidden = filtered.length !== 0;
    renderActiveSituation();
  }

  function fillList(root, items = []) {
    root.innerHTML = items.map(item => `<li>${item}</li>`).join("");
  }

  function updateFilterUI() {
    $$('[data-filter-type]').forEach(button => {
      button.classList.toggle("active", state[button.dataset.filterType] === button.dataset.filterValue);
    });
  }

  function clearSituation(renderCards = true) {
    state.moveIds = null;
    state.situationId = null;
    if (renderCards) renderSituationCards();
  }

  function setSituation(id) {
    const situation = situationById[id];
    if (!situation) return;
    state.category = "すべて";
    state.purpose = "すべて";
    state.query = "";
    state.moveIds = [...situation.moves];
    state.situationId = id;
    $("#search-input").value = "";
    updateFilterUI();
    renderSituationCards();
    renderMoves();
    $("#moves").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openMove(id) {
    state.category = "すべて";
    state.purpose = "すべて";
    state.query = "";
    clearSituation();
    $("#search-input").value = "";
    updateFilterUI();
    renderMoves();
    requestAnimationFrame(() => {
      const card = $(`[data-move-id="${id}"]`);
      if (!card) return;
      toggleCard(card, true);
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function toggleCard(card, forceOpen) {
    const detail = $(".move-detail", card);
    const summary = $(".move-summary", card);
    const open = forceOpen ?? detail.hidden;
    detail.hidden = !open;
    card.classList.toggle("is-open", open);
    summary.setAttribute("aria-expanded", String(open));
  }

  function resetAll() {
    state.category = "すべて";
    state.purpose = "すべて";
    state.query = "";
    clearSituation();
    $("#search-input").value = "";
    updateFilterUI();
    renderMoves();
  }

  document.addEventListener("click", event => {
    const situation = event.target.closest("[data-situation-id]");
    if (situation) return setSituation(situation.dataset.situationId);

    const filter = event.target.closest("[data-filter-type]");
    if (filter) {
      clearSituation();
      state[filter.dataset.filterType] = filter.dataset.filterValue;
      updateFilterUI();
      renderMoves();
      return;
    }

    const first = event.target.closest("[data-open-move]");
    if (first) return openMove(first.dataset.openMove);

    const summary = event.target.closest(".move-summary");
    if (summary) return toggleCard(summary.closest(".move-card"));

    if (event.target.closest("[data-clear-situation]")) {
      clearSituation();
      renderMoves();
      return;
    }

    if (event.target.closest("#clear-filters")) resetAll();
  });

  let searchTimer;
  $("#search-input").addEventListener("input", event => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      clearSituation();
      state.query = event.target.value;
      renderMoves();
    }, 120);
  });

  renderFirstSix();
  renderSituationCards();
  renderFilters();
  renderMoves();
})();
