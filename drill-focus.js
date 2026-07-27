(() => {
  const data = window.MARISA_DECISION_DRILL;
  if (!data) return;

  function parseFocus(search, scenarios) {
    const params = new URLSearchParams(search || "");
    const scenarioIds = new Set(scenarios.map(item => item.id));
    const singleId = params.get("scenario");
    const setValue = params.get("set");
    const rawIds = singleId
      ? [singleId]
      : setValue
        ? setValue.split(",").map(value => value.trim()).filter(Boolean)
        : [];
    const ids = [];
    rawIds.forEach(id => {
      if (!scenarioIds.has(id) || ids.includes(id) || ids.length >= scenarios.length) return;
      ids.push(id);
    });
    if (!ids.length) return null;
    return {
      mode: singleId ? "scenario" : "set",
      ids,
      scenarios: ids.map(id => scenarios.find(item => item.id === id))
    };
  }

  window.MARISA_DRILL_FOCUS_UTILS = { parseFocus };
  const focus = parseFocus(location.search, data.scenarios);
  if (!focus) return;

  data.scenarios = focus.scenarios;
  window.MARISA_DRILL_FOCUS = {
    mode: focus.mode,
    scenario: focus.scenarios[0] || null,
    scenarios: focus.scenarios,
    orderedScenarioIds: focus.ids
  };

  const key = "marisa-decision-drill-v2";
  let previousSettings = { category: "all", speed: "standard", questionCount: 10 };

  function restoreSettings() {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "{}");
      stored.settings = previousSettings;
      localStorage.setItem(key, JSON.stringify(stored));
    } catch {
      // 次回設定の復元に失敗しても、現在の集中練習は続行する。
    }
  }

  try {
    const stored = JSON.parse(localStorage.getItem(key) || "{}");
    if (stored.settings) previousSettings = stored.settings;
    stored.settings = { category: "all", speed: "standard", questionCount: focus.ids.length };
    localStorage.setItem(key, JSON.stringify(stored));
  } catch {
    // 保存できなくても、下の自動開始を試す。
  }

  document.addEventListener("click", event => {
    if (!event.target.closest(".drill-retry-button")) return;
    setTimeout(restoreSettings, 0);
  });

  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("is-focused-drill");
    document.body.dataset.focusMode = focus.mode;
    setTimeout(() => {
      const start = document.querySelector(".drill-start-button");
      if (start && !start.disabled) start.click();
      restoreSettings();
    }, 0);
  });
})();
