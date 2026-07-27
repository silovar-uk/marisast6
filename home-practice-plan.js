(() => {
  const drill = window.MARISA_DRILL;
  const decision = window.MARISA_DECISION_DRILL;
  if (!drill || !decision) return;

  const routeById = Object.fromEntries(drill.routes.map(route => [route.id, route]));
  const scenarioById = Object.fromEntries(decision.scenarios.map(scenario => [scenario.id, scenario]));

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function scoreFor(id, seed) {
    return hashString(`${seed}|${id}`);
  }

  function validScenario(id) {
    return Boolean(id && scenarioById[id]);
  }

  function correctTier(scenario) {
    return routeById[scenario?.correct]?.tier || null;
  }

  function lastSeenByScenario(attempts = []) {
    const map = {};
    attempts.forEach(attempt => {
      const at = Number(attempt?.at) || 0;
      (attempt?.results || []).forEach(result => {
        if (!validScenario(result.scenarioId)) return;
        map[result.scenarioId] = Math.max(map[result.scenarioId] || 0, at);
      });
    });
    return map;
  }

  function diagnosticMatches(key, scenario) {
    const tier = correctTier(scenario);
    switch (key) {
      case "foundationGap":
        return tier === "stable";
      case "overextend":
        return tier === "stable" || tier === "standard";
      case "underconvert":
        return tier === "maximum";
      case "conditionMiss":
        return ["confirm", "punish", "control"].includes(scenario.category);
      case "timeout":
        return true;
      default:
        return false;
    }
  }

  function sortDaily(list, seed) {
    return list.slice().sort((a, b) => scoreFor(a.id, seed) - scoreFor(b.id, seed));
  }

  function generate(options = {}) {
    const count = Math.max(1, Math.min(Number(options.count) || 5, decision.scenarios.length));
    const dateKey = options.dateKey || new Date().toISOString().slice(0, 10);
    const analysis = options.analysisSummary || {};
    const attempts = Array.isArray(options.attempts) ? options.attempts : [];
    const selected = [];
    const used = new Set();

    function add(id, source, reason) {
      if (!validScenario(id) || used.has(id) || selected.length >= count) return false;
      used.add(id);
      selected.push({ scenarioId: id, source, reason });
      return true;
    }

    const recentMisses = Array.isArray(analysis.recentMisses) ? analysis.recentMisses : [];
    recentMisses.slice(0, 8).forEach(item => {
      if (selected.filter(entry => entry.source === "recent").length >= 2) return;
      add(item.scenarioId, "recent", "直近で選択違い・時間切れになった問題");
    });

    const dominantKey = analysis.dominantDiagnostic || null;
    if (dominantKey) {
      const candidates = sortDaily(
        decision.scenarios.filter(scenario => !used.has(scenario.id) && diagnosticMatches(dominantKey, scenario)),
        `${dateKey}|diagnostic|${dominantKey}`
      );
      if (dominantKey === "overextend") {
        candidates.sort((a, b) => {
          const rank = { stable: 0, standard: 1, maximum: 2 };
          return rank[correctTier(a)] - rank[correctTier(b)] || scoreFor(a.id, dateKey) - scoreFor(b.id, dateKey);
        });
      }
      add(candidates[0]?.id, "diagnostic", "最近もっとも多い判断傾向を直す問題");
    }

    const lastSeen = lastSeenByScenario(attempts);
    const longUnseen = decision.scenarios
      .filter(scenario => !used.has(scenario.id))
      .sort((a, b) => (lastSeen[a.id] || 0) - (lastSeen[b.id] || 0) || scoreFor(a.id, `${dateKey}|unseen`) - scoreFor(b.id, `${dateKey}|unseen`));
    add(longUnseen[0]?.id, "unseen", "未出題、または長く出していない問題");

    const daily = sortDaily(decision.scenarios.filter(scenario => !used.has(scenario.id)), `${dateKey}|daily`);
    add(daily[0]?.id, "daily", "その日ごとに固定される日替わり問題");

    const fallback = sortDaily(decision.scenarios.filter(scenario => !used.has(scenario.id)), `${dateKey}|fill`);
    fallback.forEach(scenario => add(scenario.id, "foundation", "重複を避けて基礎判断を補う問題"));

    return {
      version: 1,
      dateKey,
      dominantDiagnostic: dominantKey,
      items: selected,
      scenarioIds: selected.map(item => item.scenarioId),
      href: `drill.html?set=${encodeURIComponent(selected.map(item => item.scenarioId).join(","))}`
    };
  }

  window.MARISA_HOME_PRACTICE_PLAN = {
    version: "1.0.0",
    hashString,
    lastSeenByScenario,
    diagnosticMatches,
    generate
  };
})();
