(() => {
  const data = window.MARISA_SITUATIONS;
  const root = document.querySelector("#situation-groups");
  if (!data || !root) return;

  const elements = {
    phases: document.querySelector("#situation-phases"),
    position: document.querySelector("#situation-position-filters"),
    distance: document.querySelector("#situation-distance-filters"),
    opponent: document.querySelector("#situation-opponent-filters"),
    searchPanel: document.querySelector("#situation-search-panel"),
    search: document.querySelector("#situation-search"),
    reset: document.querySelector("#situation-reset"),
    resultReset: document.querySelector("#situation-result-reset"),
    summary: document.querySelector("#situation-result-summary"),
    selftest: document.querySelector("#situation-selftest"),
    categoryCount: document.querySelector("#situation-category-count"),
    totalCount: document.querySelector("#situation-total-count"),
    detailedCount: document.querySelector("#situation-detailed-count")
  };

  const defaults = { phase: "all", position: "all", distance: "all", opponent: "all", q: "", situation: "" };
  let state = readState();

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value ?? "").normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function readState() {
    const params = new URLSearchParams(location.search);
    return {
      phase: params.get("phase") || defaults.phase,
      position: params.get("position") || defaults.position,
      distance: params.get("distance") || defaults.distance,
      opponent: params.get("opponent") || defaults.opponent,
      q: params.get("q") || defaults.q,
      situation: params.get("situation") || defaults.situation
    };
  }

  function writeState({ push = false } = {}) {
    const params = new URLSearchParams();
    Object.entries(state).forEach(([key, value]) => {
      if (!value || value === defaults[key]) return;
      params.set(key, value);
    });
    if (new URLSearchParams(location.search).has("selftest")) params.set("selftest", "");
    const next = `${location.pathname}${params.toString() ? `?${params.toString()}` : ""}${location.hash}`;
    history[push ? "pushState" : "replaceState"](null, "", next);
  }

  function valueMatches(value, selected) {
    if (selected === "all") return true;
    if (Array.isArray(value)) return value.includes(selected);
    return value === selected;
  }

  function searchableText(item) {
    return normalize([
      item.title,
      item.summary,
      item.section,
      item.answers?.primary,
      item.answers?.stable,
      item.answers?.standard,
      item.answers?.maximum,
      item.matchup?.caution,
      item.nextStep,
      ...(item.tags || [])
    ].filter(Boolean).join(" "));
  }

  function filteredItems() {
    const query = normalize(state.q);
    return data.items
      .filter(item => state.phase === "all" || item.phase === state.phase)
      .filter(item => valueMatches(item.conditions?.position || "any", state.position))
      .filter(item => valueMatches(item.conditions?.distance || "any", state.distance))
      .filter(item => valueMatches(item.conditions?.opponent || "all", state.opponent))
      .filter(item => !query || searchableText(item).includes(query))
      .sort((a, b) => Number(Boolean(a.legacy)) - Number(Boolean(b.legacy)) || a.title.localeCompare(b.title, "ja"));
  }

  function renderPhaseButtons() {
    const phases = [{ id: "all", label: "すべて", eyebrow: "ALL", description: "全状況" }, ...data.categories];
    elements.phases.innerHTML = phases.map(phase => {
      const active = state.phase === phase.id;
      const count = phase.id === "all" ? data.items.length : data.items.filter(item => item.phase === phase.id).length;
      return `<button type="button" class="situation-phase${active ? " is-active" : ""}" data-phase="${escapeHtml(phase.id)}" aria-pressed="${active}">
        <small>${escapeHtml(phase.eyebrow)}</small>
        <b>${escapeHtml(phase.label)}</b>
        <span>${count}</span>
      </button>`;
    }).join("");
  }

  function renderFilter(rootElement, type) {
    rootElement.innerHTML = (data.filters[type] || []).map(filter => {
      const active = state[type] === filter.id;
      return `<button type="button" class="filter-chip${active ? " is-active" : ""}" data-filter-type="${type}" data-filter-value="${escapeHtml(filter.id)}" aria-pressed="${active}">${escapeHtml(filter.label)}</button>`;
    }).join("");
  }

  function renderAnswers(item) {
    const answers = [
      ["まずやる", item.answers?.primary, "primary"],
      ["安定", item.answers?.stable, "stable"],
      ["標準", item.answers?.standard, "standard"],
      ["最大", item.answers?.maximum, "maximum"]
    ].filter(([, value]) => value);
    return `<div class="situation-answer-grid">${answers.map(([label, value, tone]) => `<div class="situation-answer answer-${tone}"><small>${label}</small><b>${escapeHtml(value)}</b></div>`).join("")}</div>`;
  }

  function renderMatchup(item) {
    const beats = item.matchup?.beats || [];
    const loses = item.matchup?.losesTo || [];
    const caution = item.matchup?.caution;
    if (!beats.length && !loses.length && !caution) return "";
    return `<div class="situation-matchup">
      ${beats.length ? `<section><small>勝ちやすい</small><p>${beats.map(escapeHtml).join("／")}</p></section>` : ""}
      ${loses.length ? `<section><small>負けやすい</small><p>${loses.map(escapeHtml).join("／")}</p></section>` : ""}
      ${caution ? `<section class="matchup-caution"><small>注意</small><p>${escapeHtml(caution)}</p></section>` : ""}
    </div>`;
  }

  function renderResult(item) {
    const entries = [
      ["ヒット時", item.result?.onHit],
      ["ガード時", item.result?.onBlock],
      ["読み勝ち", item.result?.onRead]
    ].filter(([, value]) => value);
    if (!entries.length) return "";
    return `<dl class="situation-result-list">${entries.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>`;
  }

  function renderPractice(item) {
    if (!item.practice) return "";
    return `<section class="situation-practice"><small>TRAINING MODE</small><h4>トレモで確認</h4><p>${escapeHtml(item.practice.setup)}</p>${item.practice.success ? `<b>成功条件：${escapeHtml(item.practice.success)}</b>` : ""}</section>`;
  }

  function renderLinks(item) {
    const links = [];
    if (item.links?.movesSituation) {
      links.push(`<a href="moves.html?situation=${encodeURIComponent(item.links.movesSituation)}"><small>技候補</small><b>技ページの絞り込みを見る</b><span>→</span></a>`);
    }
    (item.links?.moves || []).slice(0, 4).forEach(move => {
      links.push(`<a href="moves.html?move=${encodeURIComponent(move.id)}"><small>技</small><b>${escapeHtml(move.label)}</b><span>→</span></a>`);
    });
    (item.links?.strategyCards || []).forEach(card => {
      links.push(`<a href="strategy.html#playbook/${encodeURIComponent(card.category)}/${encodeURIComponent(card.id)}"><small>次に学ぶ</small><b>${escapeHtml(card.label)}</b><span>→</span></a>`);
    });
    const sources = (item.verification?.sourceIds || []).map(id => data.sources.find(source => source.id === id)).filter(Boolean);
    sources.forEach(source => {
      links.push(`<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer"><small>参考</small><b>${escapeHtml(source.label)}</b><span>↗</span></a>`);
    });
    if (!links.length) return "";
    return `<div class="situation-links">${links.join("")}</div>`;
  }

  function conditionTags(item) {
    const labels = {
      center: "中央",
      "opponent-corner": "相手が端",
      "own-corner": "自分が端",
      far: "遠距離",
      mid: "中距離",
      "throw-out": "投げ間合い外",
      "throw-in": "投げ間合い内",
      mash: "暴れ",
      block: "ガード",
      tech: "投げ抜け",
      jump: "ジャンプ",
      reversal: "無敵技",
      parry: "パリィ"
    };
    const values = [item.conditions?.position, item.conditions?.distance, item.conditions?.opponent]
      .flatMap(value => Array.isArray(value) ? value : [value])
      .filter(value => labels[value])
      .map(value => labels[value]);
    return [...new Set(values)].slice(0, 4);
  }

  function renderCard(item) {
    const verification = item.verification || {};
    const tags = [...conditionTags(item), ...(item.tags || [])].filter((value, index, values) => values.indexOf(value) === index).slice(0, 5);
    return `<details class="situation-card${item.legacy ? " is-legacy" : " is-detailed"}" data-situation-id="${escapeHtml(item.id)}">
      <summary>
        <div class="situation-card-heading">
          <div class="situation-card-status">
            <span class="verification-${escapeHtml(verification.status || "reference")}">${escapeHtml(verification.statusLabel || "参考")}</span>
            ${item.legacy ? "" : "<b>詳細化</b>"}
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.summary)}</p>
          <div class="situation-card-tags">${tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        </div>
        <div class="situation-primary">
          <small>第一候補</small>
          <b>${escapeHtml(item.answers?.primary || "確認中")}</b>
          <i aria-hidden="true">＋</i>
        </div>
      </summary>
      <div class="situation-card-detail">
        ${renderAnswers(item)}
        ${renderMatchup(item)}
        ${renderResult(item)}
        ${renderPractice(item)}
        ${item.nextStep ? `<p class="situation-next"><small>NEXT</small><b>${escapeHtml(item.nextStep)}</b></p>` : ""}
        ${renderLinks(item)}
        <footer class="situation-verification"><span>${escapeHtml(verification.note || "")}</span><b>対応基準 ${escapeHtml(verification.gameVersion || data.gameVersion)}</b></footer>
      </div>
    </details>`;
  }

  function renderResults({ scrollToSituation = false } = {}) {
    const items = filteredItems();
    const groups = new Map();
    items.forEach(item => {
      const key = item.section || data.categories.find(category => category.id === item.phase)?.label || "その他";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });

    if (!items.length) {
      root.innerHTML = `<div class="situation-empty"><b>該当する状況がない。</b><span>位置・距離・相手行動のどれかを解除してください。</span><button type="button" data-empty-reset>条件を解除</button></div>`;
    } else {
      root.innerHTML = [...groups.entries()].map(([name, groupItems], index) => `<section class="situation-result-group">
        <header><span>${String(index + 1).padStart(2, "0")}</span><div><h2>${escapeHtml(name)}</h2><p>${groupItems.length}状況</p></div></header>
        <div class="situation-card-list">${groupItems.map(renderCard).join("")}</div>
      </section>`).join("");
    }

    const activeFilters = [state.phase !== "all", state.position !== "all", state.distance !== "all", state.opponent !== "all", Boolean(state.q)].filter(Boolean).length;
    elements.summary.innerHTML = `<b>${items.length}</b>件を表示${activeFilters ? `<span>／ ${activeFilters}条件で絞り込み中</span>` : `<span>／ 詳細化カードを先に表示</span>`}`;
    elements.resultReset.hidden = activeFilters === 0;

    root.querySelectorAll("details[data-situation-id]").forEach(details => {
      details.addEventListener("toggle", () => {
        const id = details.dataset.situationId;
        if (details.open) {
          root.querySelectorAll("details[open]").forEach(other => {
            if (other !== details) other.open = false;
          });
          state.situation = id;
          writeState({ push: true });
        } else if (state.situation === id) {
          state.situation = "";
          writeState();
        }
      });
    });

    if (state.situation) {
      const target = root.querySelector(`[data-situation-id="${CSS.escape(state.situation)}"]`);
      if (target) {
        target.open = true;
        if (scrollToSituation) requestAnimationFrame(() => target.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    }
  }

  function renderAll(options = {}) {
    const selectedItem = state.situation ? data.items.find(item => item.id === state.situation) : null;
    if (selectedItem && state.phase === "all") state.phase = selectedItem.phase;
    renderPhaseButtons();
    renderFilter(elements.position, "position");
    renderFilter(elements.distance, "distance");
    renderFilter(elements.opponent, "opponent");
    elements.search.value = state.q;
    if (state.q) elements.searchPanel.open = true;
    renderResults(options);
    writeState();
  }

  function resetFilters() {
    state = { ...defaults };
    renderAll();
  }

  function runSelftest() {
    if (!new URLSearchParams(location.search).has("selftest")) return;
    const errors = [];
    const ids = new Set();
    const categoryIds = new Set(data.categories.map(category => category.id));
    const sourceIds = new Set(data.sources.map(source => source.id));
    const moveIds = new Set(window.MARISA_DATA?.moves?.map(move => move.id) || []);

    data.items.forEach((item, index) => {
      const label = item.id || `index:${index}`;
      if (!item.id || !item.title || !item.phase || !item.answers?.primary) errors.push(`${label}: 必須項目不足`);
      if (ids.has(item.id)) errors.push(`${label}: ID重複`);
      ids.add(item.id);
      if (!categoryIds.has(item.phase)) errors.push(`${label}: 未定義フェーズ ${item.phase}`);
      (item.verification?.sourceIds || []).forEach(id => {
        if (!sourceIds.has(id)) errors.push(`${label}: 未定義出典 ${id}`);
      });
      (item.links?.moves || []).forEach(move => {
        if (moveIds.size && !moveIds.has(move.id)) errors.push(`${label}: 未定義技 ${move.id}`);
      });
    });

    elements.selftest.hidden = false;
    elements.selftest.classList.toggle("has-errors", errors.length > 0);
    elements.selftest.innerHTML = `<div><small>SELF TEST</small><b>${errors.length ? `${errors.length}件の問題` : "PASS"}</b><span>${data.items.length}状況／${data.items.filter(item => !item.legacy).length}詳細化／${data.items.filter(item => item.legacy).length}既存変換</span></div>${errors.length ? `<ul>${errors.map(error => `<li>${escapeHtml(error)}</li>`).join("")}</ul>` : ""}`;
  }

  elements.phases.addEventListener("click", event => {
    const button = event.target.closest("[data-phase]");
    if (!button) return;
    state.phase = button.dataset.phase;
    state.situation = "";
    renderAll();
  });

  document.querySelector(".situation-filter-panel")?.addEventListener("click", event => {
    const button = event.target.closest("[data-filter-type]");
    if (!button) return;
    state[button.dataset.filterType] = button.dataset.filterValue;
    state.situation = "";
    renderAll();
  });

  elements.search.addEventListener("input", () => {
    state.q = elements.search.value;
    state.situation = "";
    renderAll();
  });

  elements.reset.addEventListener("click", resetFilters);
  elements.resultReset.addEventListener("click", resetFilters);
  root.addEventListener("click", event => {
    if (event.target.closest("[data-empty-reset]")) resetFilters();
  });

  window.addEventListener("popstate", () => {
    state = readState();
    renderAll({ scrollToSituation: true });
  });

  elements.categoryCount.textContent = `${data.categories.length}フェーズ`;
  elements.totalCount.textContent = `${data.items.length}状況`;
  elements.detailedCount.textContent = `${data.items.filter(item => !item.legacy).length}状況を詳細化`;

  renderAll({ scrollToSituation: Boolean(state.situation) });
  runSelftest();
})();
