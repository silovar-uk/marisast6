(() => {
  const data = window.MARISA_DECISION_DRILL;
  if (!data) return;

  const scenarioId = new URLSearchParams(location.search).get("scenario");
  if (!scenarioId) return;

  const scenario = data.scenarios.find(item => item.id === scenarioId);
  if (!scenario) return;

  data.scenarios = [scenario];
  window.MARISA_DRILL_FOCUS = scenario;

  const key = "marisa-decision-drill-v2";
  let previousSettings = { category: "all", speed: "standard", questionCount: 10 };

  function restoreSettings() {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "{}");
      stored.settings = previousSettings;
      localStorage.setItem(key, JSON.stringify(stored));
    } catch {
      // 次回設定の復元に失敗しても、現在の1問練習は続行する。
    }
  }

  try {
    const stored = JSON.parse(localStorage.getItem(key) || "{}");
    if (stored.settings) previousSettings = stored.settings;
    stored.settings = { category: "all", speed: "standard", questionCount: 1 };
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
    setTimeout(() => {
      const start = document.querySelector(".drill-start-button");
      if (start && !start.disabled) start.click();
      restoreSettings();
    }, 0);
  });
})();
