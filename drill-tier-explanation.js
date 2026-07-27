(() => {
  const drill = window.MARISA_DRILL;
  const data = window.MARISA_DECISION_DRILL;
  if (!drill || !data) return;

  const routeById = Object.fromEntries(drill.routes.map(route => [route.id, route]));
  const scenarioByTitle = Object.fromEntries(data.scenarios.map(scenario => [scenario.title, scenario]));

  const escapeHtml = value => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function currentScenario() {
    const title = document.querySelector(".decision-situation h2")?.textContent?.trim();
    return title ? scenarioByTitle[title] || null : null;
  }

  function tierMarkup(route, selectedRoute = null) {
    const meta = drill.tierMeta?.[route.tier];
    if (!meta) return "";
    const selectedMeta = selectedRoute && selectedRoute.id !== route.id ? drill.tierMeta?.[selectedRoute.tier] : null;
    return `<section class="decision-tier-explanation" data-tier="${escapeHtml(route.tier)}">
      <header>
        <small>ROUTE LEVEL</small>
        <b>${escapeHtml(meta.label)}<span>${escapeHtml(meta.short)}</span></b>
      </header>
      <p>${escapeHtml(route.learning?.use || meta.description)}</p>
      <dl>
        <div><dt>この場面</dt><dd>${escapeHtml(route.learning?.use || meta.description)}</dd></div>
        <div><dt>戻す条件</dt><dd>${escapeHtml(route.learning?.fallback || "条件が足りない時は一段階下へ戻す。")}</dd></div>
        <div><dt>次の段階</dt><dd>${escapeHtml(route.learning?.upgrade || meta.next)}</dd></div>
      </dl>
      ${selectedMeta ? `<aside><small>選んだ段階</small><b>${escapeHtml(selectedMeta.label)}</b><span>${escapeHtml(selectedRoute.learning?.use || selectedMeta.description)}</span></aside>` : ""}
    </section>`;
  }

  function enhanceFeedback() {
    const feedback = document.querySelector(".decision-feedback:not([hidden])");
    if (!feedback || feedback.querySelector(".decision-tier-explanation")) return;
    const scenario = currentScenario();
    const correctRoute = scenario ? routeById[scenario.correct] : null;
    if (!correctRoute) return;
    const selectedId = document.querySelector(".decision-choice.is-wrong")?.dataset.routeId || null;
    const selectedRoute = selectedId ? routeById[selectedId] : null;
    const next = feedback.querySelector(".drill-next-button");
    if (!next) return;
    next.insertAdjacentHTML("beforebegin", tierMarkup(correctRoute, selectedRoute));
  }

  function enhanceReviewCards(root = document) {
    root.querySelectorAll?.(".decision-result-review article").forEach(article => {
      if (article.querySelector(".decision-review-tier")) return;
      const scenario = scenarioByTitle[article.querySelector("h3")?.textContent?.trim()];
      const route = scenario ? routeById[scenario.correct] : null;
      const meta = route ? drill.tierMeta?.[route.tier] : null;
      if (!meta) return;
      const heading = article.querySelector("h3");
      heading?.insertAdjacentHTML("afterend", `<div class="decision-review-tier" data-tier="${escapeHtml(route.tier)}"><small>正解の段階</small><b>${escapeHtml(meta.label)}</b><span>${escapeHtml(meta.short)}</span></div>`);
    });
  }

  function enhance(root = document) {
    enhanceFeedback();
    enhanceReviewCards(root);
  }

  const observer = new MutationObserver(records => {
    records.forEach(record => {
      if (record.target?.nodeType === Node.ELEMENT_NODE) enhance(record.target);
      record.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) enhance(node);
      });
    });
  });

  document.addEventListener("DOMContentLoaded", () => {
    enhance();
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "class"] });
  });
})();
