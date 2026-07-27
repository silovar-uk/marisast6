(() => {
  const registry = window.MARISA_LEARNING_LINKS;
  if (!registry) return;

  const typeLabels = {
    situation: "状況から探す",
    strategy: "実戦攻略",
    move: "技と派生",
    drill: "判断ドリル"
  };

  const escapeHtml = value => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function uniqueLinks(links = []) {
    const seen = new Set();
    return links.filter(link => {
      if (!link?.href || seen.has(link.href)) return false;
      seen.add(link.href);
      return true;
    });
  }

  function flowMarkup(links, title = "次へ進む") {
    const items = uniqueLinks(links);
    if (!items.length) return "";
    return `<aside class="learning-flow" data-learning-flow>
      <small>LEARNING FLOW</small>
      <h4>${escapeHtml(title)}</h4>
      <div class="learning-flow-links">
        ${items.map(link => `<a class="learning-flow-link" data-link-type="${escapeHtml(link.type)}" href="${escapeHtml(link.href)}"><small>${escapeHtml(typeLabels[link.type] || "関連ページ")}</small><b>${escapeHtml(link.label)}</b><span>→</span></a>`).join("")}
      </div>
    </aside>`;
  }

  function appendFlow(container, links, title) {
    if (!container || container.querySelector(":scope > [data-learning-flow]")) return;
    const markup = flowMarkup(links, title);
    if (markup) container.insertAdjacentHTML("beforeend", markup);
  }

  function enhanceSituations(root = document) {
    root.querySelectorAll?.("details[data-situation-id]").forEach(card => {
      const id = card.dataset.situationId;
      appendFlow(card.querySelector(".situation-card-detail"), registry.get("situation", id), "理解して、練習へ進む");
    });
  }

  function enhanceMoves(root = document) {
    root.querySelectorAll?.(".move-card[data-move-id]").forEach(card => {
      const id = card.dataset.moveId;
      appendFlow(card.querySelector(".move-detail"), registry.get("move", id), "この技を実戦につなぐ");
    });
  }

  function enhanceStrategy(root = document) {
    root.querySelectorAll?.(".playbook-slide[data-playbook-card]").forEach(slide => {
      const id = slide.dataset.playbookCard;
      appendFlow(slide.querySelector(".playbook-card-footer"), registry.get("strategy", id), "状況確認と反復練習");
    });
  }

  function scenarioFromTitle(title) {
    return window.MARISA_DECISION_DRILL?.scenarios?.find(item => item.title === title) || null;
  }

  function currentScenario(root = document) {
    const situation = root.querySelector?.(".decision-situation") || document.querySelector(".decision-situation");
    if (!situation) return null;
    if (situation.dataset.scenarioId) {
      return window.MARISA_DECISION_DRILL?.scenarios?.find(item => item.id === situation.dataset.scenarioId) || null;
    }
    const scenario = scenarioFromTitle(situation.querySelector("h2")?.textContent?.trim());
    if (scenario) situation.dataset.scenarioId = scenario.id;
    return scenario;
  }

  function enhanceDrill(root = document) {
    const scenario = currentScenario(root);
    if (scenario) {
      const feedback = document.querySelector(".decision-feedback:not([hidden])");
      if (feedback) {
        const replay = { type: "drill", label: "この問題だけもう一度", href: `drill.html?scenario=${encodeURIComponent(scenario.id)}` };
        appendFlow(feedback, [...registry.get("scenario", scenario.id), replay], "答えを理解して、次へ進む");
      }
    }

    root.querySelectorAll?.(".decision-result-review article").forEach(article => {
      const scenarioItem = scenarioFromTitle(article.querySelector("h3")?.textContent?.trim());
      if (!scenarioItem) return;
      const replay = { type: "drill", label: "この問題を1問だけ復習", href: `drill.html?scenario=${encodeURIComponent(scenarioItem.id)}` };
      appendFlow(article, [...registry.get("scenario", scenarioItem.id).slice(0, 2), replay], "復習する");
    });
  }

  function enhanceAll(root = document) {
    enhanceSituations(root);
    enhanceMoves(root);
    enhanceStrategy(root);
    enhanceDrill(root);
  }

  document.addEventListener("click", event => {
    const moveButton = event.target.closest("[data-open-move]");
    if (!moveButton) return;
    event.preventDefault();
    location.href = `moves.html?move=${encodeURIComponent(moveButton.dataset.openMove)}`;
  });

  const observer = new MutationObserver(records => {
    const roots = new Set([document]);
    records.forEach(record => {
      if (record.target?.nodeType === Node.ELEMENT_NODE) roots.add(record.target);
      record.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) roots.add(node);
      });
    });
    roots.forEach(enhanceAll);
  });

  document.addEventListener("DOMContentLoaded", () => {
    enhanceAll();
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "open"] });
  });
})();
