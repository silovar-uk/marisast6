(() => {
  const data = window.MARISA_DECISION_DRILL;
  if (!data) return;

  const scenarioId = new URLSearchParams(location.search).get("scenario");
  if (!scenarioId) return;

  const scenario = data.scenarios.find(item => item.id === scenarioId);
  if (!scenario) return;

  data.scenarios = [scenario];
  window.MARISA_DRILL_FOCUS = scenario;

  try {
    const key = "marisa-decision-drill-v2";
    const stored = JSON.parse(localStorage.getItem(key) || "{}");
    stored.settings = { category: "all", speed: "standard", questionCount: 1 };
    localStorage.setItem(key, JSON.stringify(stored));
  } catch {
    // 保存できなくても、下の自動開始を試す。
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("is-focused-drill");
    setTimeout(() => {
      const start = document.querySelector(".drill-start-button");
      if (start && !start.disabled) start.click();
    }, 0);
  });
})();
