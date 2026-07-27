(() => {
  const drill = window.MARISA_DRILL;
  const registry = window.MARISA_COMBO_LEARNING;
  const moveData = window.MARISA_DATA;
  if (!drill || !registry || !moveData) return;

  const routeById = Object.fromEntries(drill.routes.map(route => [route.id, route]));
  const moveById = Object.fromEntries(moveData.moves.map(move => [move.id, move]));
  const tierRank = { stable: 0, standard: 1, maximum: 2 };
  const objectiveLabel = {
    save: "ゲージ温存",
    oki: "起き攻め",
    reliability: "完走率",
    lethal: "倒し切り",
    damage: "火力",
    confirm: "ヒット確認",
    punish: "確定反撃",
    carry: "運び",
    "anti-air": "対空",
    corner: "画面端"
  };
  const SUMMARY_KEY = "modern-marisa-combo-route-summary-v1";

  let learned = loadLearned();
  let panel = null;
  let scheduled = false;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function notation(value) {
    return String(value ?? "")
      .replace(/A＋([弱中強])/g, "A$1")
      .replace(/A＋/g, "A")
      .replace(/N＋/g, "N")
      .replace(/＋SP/g, "SP");
  }

  function loadLearned() {
    try {
      const value = JSON.parse(localStorage.getItem(registry.storageKey) || "[]");
      return new Set(Array.isArray(value) ? value.filter(id => routeById[id]) : []);
    } catch {
      return new Set();
    }
  }

  function saveLearned() {
    try {
      localStorage.setItem(registry.storageKey, JSON.stringify([...learned]));
      localStorage.setItem(SUMMARY_KEY, JSON.stringify(progressSnapshot()));
    } catch {
      // 保存不能でも攻略デッキは利用できる。
    }
  }

  function routeSequence(route) {
    return route.steps.map(step => {
      const command = notation(moveById[step.move]?.command || step.move);
      return `${step.charge ? "長押し " : ""}${command}`;
    }).join(" → ");
  }

  function prerequisites(item) {
    return item.prerequisites || [];
  }

  function isUnlocked(item) {
    return prerequisites(item).every(id => learned.has(id));
  }

  function itemState(item, nextRouteId) {
    if (learned.has(item.routeId)) return "learned";
    if (!isUnlocked(item)) return "locked";
    if (item.routeId === nextRouteId) return "next";
    return "available";
  }

  function flattenedItems() {
    return registry.families.flatMap((family, familyIndex) => family.routes.map((item, routeIndex) => ({ ...item, family, familyIndex, routeIndex })));
  }

  function nextRouteItem() {
    return flattenedItems()
      .filter(item => !learned.has(item.routeId) && isUnlocked(item))
      .sort((a, b) => {
        const tierDiff = tierRank[routeById[a.routeId]?.tier] - tierRank[routeById[b.routeId]?.tier];
        return tierDiff || a.familyIndex - b.familyIndex || a.routeIndex - b.routeIndex;
      })[0] || null;
  }

  function progressSnapshot() {
    const next = nextRouteItem();
    const tierStats = {};
    ["stable", "standard", "maximum"].forEach(tier => {
      const routes = drill.routes.filter(route => route.tier === tier);
      tierStats[tier] = { total: routes.length, learned: routes.filter(route => learned.has(route.id)).length };
    });
    const familyStats = Object.fromEntries(registry.families.map(family => [family.id, {
      total: family.routes.length,
      learned: family.routes.filter(item => learned.has(item.routeId)).length
    }]));
    return {
      version: 1,
      updatedAt: Date.now(),
      learnedRouteIds: [...learned],
      total: drill.routes.length,
      learned: learned.size,
      nextRouteId: next?.routeId || null,
      tierStats,
      familyStats
    };
  }

  function resourceText(route) {
    const parts = [];
    if (route.resources?.driveCost) parts.push(`D${route.resources.driveCost}`);
    if (route.resources?.saCost) parts.push(`SA${route.resources.saCost}`);
    if (!parts.length) parts.push("ノーゲージ");
    return parts.join("・");
  }

  function difficultyText(route) {
    return `入力${route.inputDifficulty}/3・安定${route.reliability}/3`;
  }

  function prerequisiteText(item) {
    const ids = prerequisites(item).filter(id => !learned.has(id));
    if (!ids.length) return "";
    return ids.map(id => `${drill.tierMeta?.[routeById[id]?.tier]?.label || "前段階"}「${routeById[id]?.label || id}」`).join("、");
  }

  function routeActions(item, state) {
    const route = routeById[item.routeId];
    const scenarioId = registry.scenarioByRoute[item.routeId];
    const toggle = state === "locked"
      ? `<button type="button" class="combo-route-toggle" disabled>先に前段階を習得</button>`
      : `<button type="button" class="combo-route-toggle${state === "learned" ? " is-learned" : ""}" data-combo-route-toggle="${escapeHtml(item.routeId)}">${state === "learned" ? "✓ 習得済み" : "習得済みにする"}</button>`;
    return `<div class="combo-route-actions">
      ${toggle}
      <a href="#playbook/combo/${encodeURIComponent(item.cardId)}">攻略カード</a>
      ${scenarioId ? `<a href="drill.html?scenario=${encodeURIComponent(scenarioId)}">1問練習</a>` : ""}
    </div>`;
  }

  function renderRouteItem(item, nextRouteId) {
    const route = routeById[item.routeId];
    const meta = drill.tierMeta?.[route.tier];
    const state = itemState(item, nextRouteId);
    const missing = prerequisiteText(item);
    return `<article class="combo-roadmap-route is-${state}" data-route-id="${escapeHtml(item.routeId)}" data-tier="${escapeHtml(route.tier)}">
      <header>
        <span class="combo-route-tier">${escapeHtml(meta?.label || route.tier)}</span>
        ${state === "next" ? `<i>次に覚える</i>` : state === "learned" ? `<i>習得済み</i>` : state === "locked" ? `<i>未解放</i>` : `<i>練習可能</i>`}
      </header>
      <h4>${escapeHtml(route.label)}</h4>
      <p class="combo-route-input">${escapeHtml(routeSequence(route))}</p>
      <div class="combo-route-meta">
        <span>${escapeHtml(resourceText(route))}</span>
        <span>${escapeHtml(difficultyText(route))}</span>
        ${(route.objectives || []).slice(0, 3).map(value => `<span>${escapeHtml(objectiveLabel[value] || value)}</span>`).join("")}
      </div>
      <p class="combo-route-use">${escapeHtml(route.learning?.use || "")}</p>
      ${missing ? `<p class="combo-route-lock-reason">先に：${escapeHtml(missing)}</p>` : ""}
      ${routeActions(item, state)}
    </article>`;
  }

  function renderFamily(family, nextRouteId, openIds) {
    const count = family.routes.filter(item => learned.has(item.routeId)).length;
    const containsNext = family.routes.some(item => item.routeId === nextRouteId);
    const open = openIds.has(family.id) || containsNext;
    return `<details class="combo-roadmap-family" data-family-id="${escapeHtml(family.id)}"${open ? " open" : ""}>
      <summary>
        <div><small>LEARNING LANE</small><b>${escapeHtml(family.label)}</b><span>${escapeHtml(family.description)}</span></div>
        <strong>${count}/${family.routes.length}</strong>
      </summary>
      <div class="combo-roadmap-family-body">
        <a class="combo-roadmap-entry" href="#playbook/combo/${encodeURIComponent(family.entry.cardId)}">
          <small>${family.entry.type === "assist" ? "ASSIST ENTRY" : "STARTER CARD"}</small>
          <b>${escapeHtml(family.entry.label)}</b>
          <span>攻略カードで入口を確認 →</span>
        </a>
        <div class="combo-roadmap-routes">${family.routes.map(item => renderRouteItem(item, nextRouteId)).join("")}</div>
      </div>
    </details>`;
  }

  function ensurePanel() {
    const filters = document.querySelector("#playbook-combo-filters");
    if (!filters) return null;
    panel = document.querySelector("#combo-learning-panel");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "combo-learning-panel";
      panel.className = "combo-learning-panel";
      filters.insertAdjacentElement("afterend", panel);
    }
    return panel;
  }

  function renderPanel() {
    const root = ensurePanel();
    if (!root) return;
    const comboActive = Boolean(document.querySelector('[data-playbook-category="combo"].is-active'));
    root.hidden = !comboActive;
    if (!comboActive) return;

    const openIds = new Set([...root.querySelectorAll("details[open][data-family-id]")].map(item => item.dataset.familyId));
    const next = nextRouteItem();
    const nextRoute = next ? routeById[next.routeId] : null;
    const snapshot = progressSnapshot();
    const percent = Math.round((snapshot.learned / snapshot.total) * 100);

    root.innerHTML = `
      <div class="combo-learning-heading">
        <div><small>COMBO LEARNING MAP</small><h3>アシストから、安定・標準・最大へ。</h3><p>まず落とさないルートを固定し、条件を見られるようになったら一段ずつ上げます。</p></div>
        <div class="combo-learning-progress"><b>${snapshot.learned}<span>/${snapshot.total}</span></b><i><em style="--combo-progress:${percent}%"></em></i><small>${percent}% 習得</small></div>
      </div>
      ${nextRoute ? `<article class="combo-learning-next" data-tier="${escapeHtml(nextRoute.tier)}">
        <div><small>NEXT ROUTE</small><b>${escapeHtml(drill.tierMeta?.[nextRoute.tier]?.label || nextRoute.tier)}｜${escapeHtml(nextRoute.label)}</b><p>${escapeHtml(nextRoute.learning?.use || "")}</p></div>
        <strong>${escapeHtml(routeSequence(nextRoute))}</strong>
        ${routeActions(next, "next")}
      </article>` : `<article class="combo-learning-complete"><b>24ルートをすべて習得済み</b><span>次は実戦での選択ミスと判断時間を見て、維持練習へ移ります。</span></article>`}
      <div class="combo-learning-tier-guide">
        ${["stable", "standard", "maximum"].map(tier => {
          const stat = snapshot.tierStats[tier];
          const meta = drill.tierMeta[tier];
          return `<div data-tier="${tier}"><small>${escapeHtml(meta.label)}</small><b>${stat.learned}/${stat.total}</b><span>${escapeHtml(meta.short)}</span></div>`;
        }).join("")}
      </div>
      <div class="combo-roadmap-families">${registry.families.map(family => renderFamily(family, next?.routeId || null, openIds)).join("")}</div>`;
  }

  function cardRouteBlock(cardId) {
    const ids = registry.cardToRoutes[cardId] || [];
    if (!ids.length) return "";
    const rows = ids.map(routeId => {
      const route = routeById[routeId];
      const itemRef = registry.families.flatMap(family => family.routes).find(item => item.routeId === routeId);
      const state = itemRef ? itemState(itemRef, nextRouteItem()?.routeId || null) : "available";
      const meta = drill.tierMeta[route.tier];
      return `<div class="combo-card-route is-${state}" data-tier="${escapeHtml(route.tier)}">
        <span>${escapeHtml(meta.label)}</span>
        <b>${escapeHtml(route.label)}</b>
        <i>${state === "learned" ? "習得済み" : state === "locked" ? "前段階を先に" : state === "next" ? "次に覚える" : "練習可能"}</i>
        ${state === "locked" ? "" : `<button type="button" data-combo-route-toggle="${escapeHtml(routeId)}">${state === "learned" ? "✓" : "○"}</button>`}
      </div>`;
    }).join("");
    return `<section class="combo-card-learning-block"><header><small>LEARNING LEVEL</small><b>対応する習得ルート</b></header>${rows}</section>`;
  }

  function enhanceCards() {
    document.querySelectorAll('.playbook-slide[data-playbook-card] .playbook-card-combo').forEach(card => {
      const slide = card.closest("[data-playbook-card]");
      const cardId = slide?.dataset.playbookCard;
      if (!cardId) return;
      card.querySelector(".combo-card-learning-block")?.remove();
      card.classList.remove("is-route-complete");
      const markup = cardRouteBlock(cardId);
      if (!markup) return;
      const body = card.querySelector(".playbook-card-body");
      body?.insertAdjacentHTML("beforeend", markup);
      const ids = registry.cardToRoutes[cardId] || [];
      card.classList.toggle("is-route-complete", ids.length > 0 && ids.every(id => learned.has(id)));
    });
  }

  function publishProgress() {
    const snapshot = progressSnapshot();
    window.MARISA_COMBO_PROGRESS = snapshot;
    document.dispatchEvent(new CustomEvent("marisa:combo-progress", { detail: snapshot }));
  }

  function sync() {
    renderPanel();
    enhanceCards();
    saveLearned();
    publishProgress();
  }

  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      sync();
    });
  }

  document.addEventListener("click", event => {
    const toggle = event.target.closest("[data-combo-route-toggle]");
    if (toggle) {
      event.preventDefault();
      const routeId = toggle.dataset.comboRouteToggle;
      const item = registry.families.flatMap(family => family.routes).find(value => value.routeId === routeId);
      if (!item) return;
      if (learned.has(routeId)) learned.delete(routeId);
      else if (isUnlocked(item)) learned.add(routeId);
      scheduleSync();
      return;
    }

    if (event.target.closest("[data-playbook-category], [data-combo-filter], [data-learned-card]")) scheduleSync();
  });

  window.addEventListener("hashchange", scheduleSync);

  document.addEventListener("DOMContentLoaded", () => {
    if (registry.errors.length) console.warn("Combo learning registry errors", registry.errors);
    sync();
    const deck = document.querySelector("#playbook-deck");
    if (deck) {
      const observer = new MutationObserver(scheduleSync);
      observer.observe(deck, { childList: true });
    }
  });
})();
