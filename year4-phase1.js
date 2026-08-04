(() => {
  const year4 = window.MARISA_YEAR4;
  if (!year4 || year4.phase1Loaded) return;
  year4.phase1Loaded = true;

  const RETIRED_MOVE_IDS = new Set(["dimachaerusOD"]);
  const RETIRED_ROUTE_IDS = new Set([
    "aMP-normal-od",
    "aMP-normal-power",
    "aMP-punish-basic",
    "dimachaerusOD-normal-basic",
    "dimachaerusOD-normal-power"
  ]);
  const RETIRED_TOKENS = ["dimachaerusOD", "ODディマカイルス", "ODディマ"];
  const globalPatches = {};
  const afterMovePushHooks = [];

  year4.retiredMoveIds = Array.from(RETIRED_MOVE_IDS);
  year4.retiredRouteIds = Array.from(RETIRED_ROUTE_IDS);
  year4.changeLog.push("Phase 1: ODディマ依存を現役データから隔離");

  function containsRetired(value) {
    if (value == null) return false;
    if (typeof value === "string") return RETIRED_TOKENS.some(token => value.includes(token));
    if (Array.isArray(value)) return value.some(containsRetired);
    if (typeof value === "object") {
      return Object.entries(value).some(([key, item]) => RETIRED_MOVE_IDS.has(key) || containsRetired(item));
    }
    return false;
  }

  function sanitizeText(value) {
    return String(value)
      .replace(/強[／・]ODディマカイルス/g, "強ディマカイルス")
      .replace(/強[／・]ODディマ/g, "強ディマ")
      .replace(/中[／・]ODディマカイルス/g, "中ディマカイルス")
      .replace(/中[／・]ODディマ/g, "中ディマ")
      .replace(/、?ODディマカイルス/g, "")
      .replace(/、?ODディマ/g, "")
      .replace(/・{2,}/g, "・")
      .replace(/→\s*→/g, "→")
      .trim();
  }

  function cleanValue(value, options = {}) {
    if (typeof value === "string") return sanitizeText(value);
    if (Array.isArray(value)) {
      return value
        .filter(item => !(options.dropRetiredItems && containsRetired(item)))
        .map(item => cleanValue(item, options));
    }
    if (value && typeof value === "object") {
      const output = {};
      Object.entries(value).forEach(([key, item]) => {
        if (RETIRED_MOVE_IDS.has(key)) return;
        output[key] = cleanValue(item, options);
      });
      return output;
    }
    return value;
  }

  function routeUsesRetired(route) {
    return RETIRED_ROUTE_IDS.has(route?.id)
      || containsRetired(route)
      || route?.steps?.some(step => RETIRED_MOVE_IDS.has(step.move));
  }

  function filterPushableArray(items, predicate) {
    const result = items.filter(predicate);
    Object.defineProperty(result, "push", {
      configurable: true,
      value: function (...newItems) {
        return Array.prototype.push.apply(this, newItems.filter(predicate));
      }
    });
    return result;
  }

  function registerGlobalPatch(name, patch) {
    (globalPatches[name] ||= []).push(patch);
  }

  function interceptGlobal(name) {
    let current;
    Object.defineProperty(window, name, {
      configurable: true,
      enumerable: true,
      get() { return current; },
      set(value) {
        current = (globalPatches[name] || []).reduce((result, patch) => patch(result) || result, value);
      }
    });
  }

  function addAfterMovePushHook(hook) {
    afterMovePushHooks.push(hook);
  }

  function sanitizeMove(move) {
    if (!move || RETIRED_MOVE_IDS.has(move.id)) return null;
    const result = cleanValue(move);
    ["follow", "strong", "risks"].forEach(key => {
      if (!Array.isArray(result[key])) return;
      result[key] = result[key]
        .filter(item => !containsRetired(item))
        .map(sanitizeText)
        .filter(Boolean);
    });
    result.basisDate ||= year4.basisDate;
    result.verificationStatus ||= "legacy-reference";
    result.availability ||= "confirmed";
    return result;
  }

  function installMovePipeline() {
    const moves = window.MARISA_DATA.moves;
    const nativePush = Array.prototype.push;
    Object.defineProperty(moves, "push", {
      configurable: true,
      value: function (...items) {
        const safe = items.map(sanitizeMove).filter(Boolean);
        const length = nativePush.apply(this, safe);
        afterMovePushHooks.forEach(hook => hook({ sourceItems: items, moves: this, nativePush }));
        return length;
      }
    });
  }

  function finalizeDrillRoutes() {
    const drill = window.MARISA_DRILL;
    if (!drill || !Array.isArray(drill.routes) || drill.__year4Finalized) return;
    drill.__year4Finalized = true;
    drill.retiredRoutes = drill.routes.filter(route => route.availability === "retired");
    drill.routes = drill.routes.filter(route => route.availability !== "retired");
    drill.activeRoutes = drill.routes;
  }

  year4.api = {
    containsRetired,
    sanitizeText,
    cleanValue,
    routeUsesRetired,
    filterPushableArray,
    registerGlobalPatch,
    addAfterMovePushHook,
    finalizeDrillRoutes
  };

  registerGlobalPatch("MARISA_PLAYBOOK", value => {
    if (!value || !Array.isArray(value.cards)) return value;
    value.updatedAt = year4.basisDate;
    value.note = "2026年8月3日Year 4調整対応。ODディマ依存は現役情報から隔離し、代替ルートは実測後に追加する。";
    value.cards = filterPushableArray(
      value.cards.map(card => cleanValue(card)),
      card => card && !containsRetired(card)
    );
    return value;
  });

  registerGlobalPatch("MARISA_DRILL", value => {
    if (!value || !Array.isArray(value.routes)) return value;
    value.basisDate = year4.basisDate;
    value.routes = value.routes.map(route => routeUsesRetired(route)
      ? { ...route, availability: "retired", verificationStatus: "retired", retiredReason: "ODディマカイルス削除" }
      : { ...route, availability: route.availability || "active", verificationStatus: route.verificationStatus || "legacy-reference" });
    value.activeRoutes = value.routes.filter(route => route.availability !== "retired");
    return value;
  });

  registerGlobalPatch("MARISA_ROUTE_SCHEMA", value => {
    if (!value) return value;
    RETIRED_ROUTE_IDS.forEach(id => { if (value.profiles) delete value.profiles[id]; });
    return value;
  });

  registerGlobalPatch("MARISA_DECISION_DRILL", value => {
    if (!value || !Array.isArray(value.scenarios)) return value;
    value.scenarios = value.scenarios.filter(scenario => {
      if (!scenario) return false;
      const ids = [...(scenario.choices || []), scenario.correct].filter(Boolean);
      return !ids.some(id => RETIRED_ROUTE_IDS.has(id));
    });
    finalizeDrillRoutes();
    return value;
  });

  registerGlobalPatch("MARISA_COMBO_LEARNING", value => {
    if (!value || !Array.isArray(value.families)) return value;
    value.families = value.families
      .filter(family => family.id !== "od-dima")
      .map(family => ({ ...family, routes: (family.routes || []).filter(item => !RETIRED_ROUTE_IDS.has(item.routeId)) }))
      .filter(family => family.routes.length > 0);
    ["routeToFamily", "routeToCard", "scenarioByRoute"].forEach(key => {
      Object.keys(value[key] || {}).forEach(id => { if (RETIRED_ROUTE_IDS.has(id)) delete value[key][id]; });
    });
    value.errors = (value.errors || []).filter(error => {
      return !RETIRED_TOKENS.some(token => error.includes(token))
        && !Array.from(RETIRED_ROUTE_IDS).some(id => error.includes(id));
    });
    finalizeDrillRoutes();
    return value;
  });

  registerGlobalPatch("MARISA_FOLLOWUPS", value => {
    if (!value) return value;
    const cleaned = cleanValue(value, { dropRetiredItems: true });
    cleaned.basisDate = year4.basisDate;
    cleaned.version = `${value.version || "0"}-year4`;
    return cleaned;
  });

  registerGlobalPatch("MARISA_SITUATIONS", value => {
    if (!value) return value;
    value.gameVersion = year4.basisDate;
    value.updatedAt = year4.basisDate;
    value.note = "Year 4対応。ODディマ依存の状況カードは除外し、代替ルートは実測後に追加する。";
    if (Array.isArray(value.items)) value.items = value.items.filter(item => !containsRetired(item)).map(item => cleanValue(item));
    return value;
  });

  installMovePipeline();
  [
    "MARISA_PLAYBOOK",
    "MARISA_DRILL",
    "MARISA_ROUTE_SCHEMA",
    "MARISA_DECISION_DRILL",
    "MARISA_COMBO_LEARNING",
    "MARISA_FOLLOWUPS",
    "MARISA_SITUATIONS"
  ].forEach(interceptGlobal);

  document.addEventListener("DOMContentLoaded", () => {
    finalizeDrillRoutes();
    const hero = document.querySelector(".page-hero, .home-hero");
    if (hero && !document.querySelector("#year4-status")) {
      const notice = document.createElement("aside");
      notice.id = "year4-status";
      notice.style.cssText = "margin-top:18px;padding:14px 16px;border:1px solid rgba(255,255,255,.18);border-radius:12px;background:rgba(255,255,255,.045);font-size:13px;line-height:1.65";
      notice.innerHTML = "<b>YEAR 4 DATA STATUS</b><br>ODディマカイルス依存の技・コンボ・対空・ドリルを現役データから隔離しました。";
      hero.appendChild(notice);
    }
  });
})();
