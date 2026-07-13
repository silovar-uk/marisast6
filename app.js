(() => {
  const data = window.MARISA_DATA;
  const state = { category: "すべて", purpose: "すべて", query: "" };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const normalize = (value) => String(value ?? "").toLowerCase().replace(/\s+/g, "");
  const moveSearchText = (move) => normalize([
    move.name, move.command, move.classic, move.category, move.description, move.when,
    ...(move.purposes || []), ...(move.strong || []), ...(move.follow || []), ...(move.risks || [])
  ].join(" "));

  function renderFirstSix() {
    const root = $("#first-six");
    const byId = Object.fromEntries(data.moves.map(move => [move.id, move]));
    root.innerHTML = data.firstSix.map(id => {
      const move = byId[id];
      return `<button class="first-move" type="button" data-open-move="${move.id}"><kbd>${move.command}</kbd><span>${move.name}</span></button>`;
    }).join("");
  }

  function renderPurposeCards() {
    const root = $("#purpose-grid");
    root.innerHTML = data.purposeCards.map(card => `
      <button class="purpose-card" type="button" data-purpose="${card.name}">
        <b>${card.name}</b><span>${card.copy}</span><small>${card.hint} →</small>
      </button>`).join("");
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

  function stat(label, value, note = "") {
    return `<div class="stat"><small>${label}</small><b>${value || "—"}</b>${note ? `<em>${note}</em>` : ""}</div>`;
  }

  function renderMoves() {
    const root = $("#move-list");
    const template = $("#move-template");
    const query = normalize(state.query);
    const filtered = data.moves.filter(move => {
      const categoryOk = state.category === "すべて" || move.category === state.category;
      const purposeOk = state.purpose === "すべて" || move.purposes.includes(state.purpose);
      const queryOk = !query || moveSearchText(move).includes(query);
      return categoryOk && purposeOk && queryOk;
    });

    root.innerHTML = "";
    filtered.forEach(move => {
      const fragment = template.content.cloneNode(true);
      const card = $(".move-card", fragment);
      card.dataset.moveId = move.id;
      $(".move-command", fragment).textContent = move.command;
      $(".move-category", fragment).textContent = `${move.category} / 優先度 ${move.priority}`;
      $(".move-name", fragment).textContent = move.name;
      $(".move-purpose-summary", fragment).textContent = move.purposes.join("・");
      $(".move-damage-summary", fragment).innerHTML = `<span>ダメージ</span><b>${move.damage}</b>`;
      $(".move-when", fragment).textContent = move.when;
      $(".move-description", fragment).textContent = move.description;
      $(".purpose-tags", fragment).innerHTML = move.purposes.map(p => `<span>${p}</span>`).join("");
      $(".stats-grid", fragment).innerHTML = [
        stat("ダメージ", move.damage, move.shortcutDamage || ""),
        stat("発生", move.startup),
        stat("持続", move.active),
        stat("硬直", move.recovery),
        stat("ヒット時", move.hit),
        stat("ガード時", move.block)
      ].join("");
      fillList($(".strong-list", fragment), move.strong);
      fillList($(".follow-list", fragment), move.follow);
      fillList($(".risk-list", fragment), move.risks);
      $(".input-notes", fragment).innerHTML = `<b>入力・性能メモ：</b> ${move.note || "—"}${move.classic ? ` <span>（補助表記：${move.classic}）</span>` : ""}`;
      root.append(fragment);
    });

    $("#result-count").textContent = filtered.length;
    $("#empty-state").hidden = filtered.length !== 0;
  }

  function fillList(root, items = []) {
    root.innerHTML = items.map(item => `<li>${item}</li>`).join("");
  }

  function updateFilterUI() {
    $$('[data-filter-type]').forEach(button => {
      button.classList.toggle("active", state[button.dataset.filterType] === button.dataset.filterValue);
    });
  }

  function setPurpose(purpose) {
    state.purpose = purpose;
    updateFilterUI();
    renderMoves();
    $("#moves").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openMove(id) {
    state.category = "すべて";
    state.purpose = "すべて";
    state.query = "";
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

  document.addEventListener("click", event => {
    const filter = event.target.closest("[data-filter-type]");
    if (filter) {
      state[filter.dataset.filterType] = filter.dataset.filterValue;
      updateFilterUI();
      renderMoves();
      return;
    }
    const purpose = event.target.closest("[data-purpose]");
    if (purpose) return setPurpose(purpose.dataset.purpose);
    const first = event.target.closest("[data-open-move]");
    if (first) return openMove(first.dataset.openMove);
    const summary = event.target.closest(".move-summary");
    if (summary) return toggleCard(summary.closest(".move-card"));
    if (event.target.closest("#clear-filters")) {
      state.category = "すべて"; state.purpose = "すべて"; state.query = "";
      $("#search-input").value = "";
      updateFilterUI(); renderMoves();
    }
  });

  let searchTimer;
  $("#search-input").addEventListener("input", event => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.query = event.target.value; renderMoves(); }, 120);
  });

  renderFirstSix();
  renderPurposeCards();
  renderFilters();
  renderMoves();
})();
