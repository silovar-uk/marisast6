(() => {
  const year4 = window.MARISA_YEAR4;
  const api = year4?.api;
  if (!year4 || !api || year4.phase4Loaded) return;
  year4.phase4Loaded = true;
  year4.phase = 4;
  year4.changeLog.push("Phase 4: 学習・ドリル・保存データ・表示数を現役ルート基準へ再構築");

  const retiredRouteIds = new Set(year4.retiredRouteIds || []);
  const retiredMoveIds = new Set(year4.retiredMoveIds || []);
  const quadrigaMoveIds = year4.quadrigaMoveIds || [];

  api.registerGlobalPatch("MARISA_COMBO_LEARNING", value => {
    if (!value) return value;
    value.pendingFamilies = [{
      id: "quadriga-year4",
      label: "クアドリガ系",
      status: "candidate",
      description: "入力・フレーム・壁挙動・コンボ・起き攻めを実測後、安定・標準・最大へ昇格する。",
      candidates: (year4.comboCandidates || []).map(item => item.id)
    }];
    value.activeRouteCount = (value.families || []).reduce((sum, family) => sum + (family.routes?.length || 0), 0);
    return value;
  });

  api.registerGlobalPatch("MARISA_SITUATIONS", value => {
    if (!value) return value;
    value.sources ||= [];
    if (!value.sources.some(source => source.id === "year4-ingame-verification")) {
      value.sources.push({
        id: "year4-ingame-verification",
        label: "2026年8月3日以降 ゲーム内トレーニングモード",
        url: "#year4-status",
        note: "クアドリガの入力・フレーム・壁挙動・コンボ成立の最終確認先"
      });
    }
    return value;
  });

  function migrateStorage() {
    try {
      const learningKey = "modern-marisa-combo-route-learning-v1";
      const retiredKey = "modern-marisa-combo-route-retired-v1";
      const learned = JSON.parse(localStorage.getItem(learningKey) || "[]");
      if (Array.isArray(learned)) {
        const active = learned.filter(id => !retiredRouteIds.has(id));
        const retired = learned.filter(id => retiredRouteIds.has(id));
        localStorage.setItem(learningKey, JSON.stringify(active));
        localStorage.setItem(retiredKey, JSON.stringify(retired));
      }

      const summaryKey = "modern-marisa-combo-route-summary-v1";
      const summary = JSON.parse(localStorage.getItem(summaryKey) || "null");
      if (summary) {
        if (retiredRouteIds.has(summary.nextRouteId)) summary.nextRouteId = null;
        const activeLearned = Array.isArray(learned) ? learned.filter(id => !retiredRouteIds.has(id)) : [];
        summary.total = window.MARISA_DRILL?.routes?.length || summary.total;
        summary.learned = activeLearned.length;
        summary.migratedFor = year4.basisDate;
        localStorage.setItem(summaryKey, JSON.stringify(summary));
      }

      const measurementsKey = "modern-marisa-year4-measurements-v1";
      const storedMeasurements = JSON.parse(localStorage.getItem(measurementsKey) || "null");
      if (storedMeasurements && typeof storedMeasurements === "object") {
        year4.measurements = storedMeasurements;
      }
      const originalRecord = year4.recordMeasurement;
      if (typeof originalRecord === "function" && !year4.__recordMeasurementPersisted) {
        year4.__recordMeasurementPersisted = true;
        year4.recordMeasurement = (candidateId, result) => {
          const record = originalRecord(candidateId, result);
          localStorage.setItem(measurementsKey, JSON.stringify(year4.measurements));
          return record;
        };
      }
    } catch (error) {
      console.warn("[MARISA YEAR4] storage migration skipped", error);
    }
  }

  function replaceLeafText(root, matcher, replacement) {
    root.querySelectorAll("*").forEach(node => {
      if (node.children.length || !node.textContent) return;
      matcher.lastIndex = 0;
      if (!matcher.test(node.textContent)) return;
      if (node.closest('a[href*="20260317"]')) return;
      matcher.lastIndex = 0;
      node.textContent = node.textContent.replace(matcher, replacement);
    });
  }

  function updateVisibleMeta() {
    const hasMoveDataset = Boolean(window.MARISA_DATA?.moves?.length);
    const hasDrillDataset = Boolean(window.MARISA_DRILL);
    const hasDecisionDataset = Boolean(window.MARISA_DECISION_DRILL);
    const moveCount = window.MARISA_DATA?.moves?.length || 0;
    const routeCount = window.MARISA_DRILL?.routes?.length || 0;
    const scenarioCount = window.MARISA_DECISION_DRILL?.scenarios?.length || 0;

    document.querySelectorAll('a[href*="20260317"]').forEach(anchor => {
      const label = anchor.querySelector("span");
      if (label) label.textContent = "旧基準 2026年3月17日 調整内容";
      anchor.dataset.year4Status = "legacy-source";
    });

    replaceLeafText(document, /基準：2026年3月17日調整/g, "基準：2026年8月3日対応／数値検証中");
    replaceLeafText(document, /2026年3月17日調整/g, "Year 4移行中（旧値3月17日）");
    replaceLeafText(document, /全48技/g, `全${moveCount}技`);
    replaceLeafText(document, /48 MOVES/g, `${moveCount} MOVES`);
    replaceLeafText(document, /24ルート/g, `${routeCount}ルート`);
    replaceLeafText(document, /24 \/ 24/g, `${routeCount} / ${routeCount}`);

    document.querySelectorAll(".home-hero-note").forEach(note => {
      note.innerHTML = `基準：2026年8月3日対応／数値検証中<br>モダンで使用できる${moveCount}技を収録<br>進捗はブラウザ内だけに保存`;
    });

    const notice = document.querySelector("#year4-status");
    if (notice) {
      const counts = [];
      if (hasMoveDataset) counts.push(`現役技 ${moveCount}件`);
      if (hasDrillDataset) counts.push(`現役コンボ ${routeCount}件`);
      if (hasDecisionDataset) counts.push(`判断問題 ${scenarioCount}件`);
      const countText = counts.length ? `${counts.join("・")}。` : "Year 4移行レイヤー適用済み。";
      notice.innerHTML = `<b>YEAR 4 DATA STATUS / PHASE 4</b><br>${countText}クアドリガ候補は実測完了まで習得数と正解問題から除外しています。`;
    }
  }

  function validate() {
    const moves = window.MARISA_DATA?.moves || [];
    const routes = window.MARISA_DRILL?.routes || [];
    const scenarios = window.MARISA_DECISION_DRILL?.scenarios || [];
    const learning = window.MARISA_COMBO_LEARNING;
    const playbook = window.MARISA_PLAYBOOK;
    const errors = [];
    const warnings = [];

    const hasMoveDataset = moves.length > 0;
    if (moves.some(move => retiredMoveIds.has(move.id))) errors.push("retired move remains active");
    if (hasMoveDataset) {
      quadrigaMoveIds.forEach(id => {
        const move = moves.find(item => item.id === id);
        if (!move) errors.push(`missing move: ${id}`);
        else if (move.verificationStatus !== "candidate" && move.verificationStatus !== "measured") warnings.push(`unexpected Quadriga status: ${id}`);
      });
    }

    routes.forEach(route => {
      if (api.routeUsesRetired(route)) errors.push(`retired route remains active: ${route.id}`);
      route.steps?.forEach(step => {
        if (!moves.some(move => move.id === step.move)) errors.push(`unknown move ${step.move} in ${route.id}`);
      });
    });

    scenarios.forEach(scenario => {
      [...(scenario.choices || []), scenario.correct].filter(Boolean).forEach(id => {
        if (!routes.some(route => route.id === id)) errors.push(`unknown route ${id} in scenario ${scenario.id}`);
      });
    });

    learning?.families?.forEach(family => family.routes?.forEach(item => {
      if (!routes.some(route => route.id === item.routeId)) errors.push(`unknown learning route: ${item.routeId}`);
    }));

    playbook?.cards?.forEach(card => {
      if (api.containsRetired(card)) errors.push(`retired token in playbook: ${card.id}`);
    });

    (year4.comboCandidates || []).forEach(candidate => {
      if (candidate.status === "measured") {
        const records = year4.measurements?.[candidate.id] || [];
        if (!records.some(record => record.attempts >= 10 && record.successes === record.attempts)) {
          errors.push(`candidate promoted without 10/10 evidence: ${candidate.id}`);
        }
      }
    });

    year4.validation = {
      checkedAt: new Date().toISOString(),
      ok: errors.length === 0,
      errors,
      warnings,
      counts: {
        moves: moves.length,
        activeRoutes: routes.length,
        scenarios: scenarios.length,
        learningFamilies: learning?.families?.length || 0,
        pendingFamilies: learning?.pendingFamilies?.length || 0,
        candidates: year4.comboCandidates?.length || 0
      }
    };

    if (errors.length) console.error("[MARISA YEAR4] validation failed", year4.validation);
    else console.info("[MARISA YEAR4] validation passed", year4.validation);
    return year4.validation;
  }

  function exportVerificationTemplate() {
    return {
      schemaVersion: 1,
      gameVersion: year4.basisDate,
      controlType: "modern",
      candidateId: null,
      opponentCharacter: null,
      position: "center",
      startDistance: null,
      hitState: "normal",
      opponentState: "standing",
      driveBefore: null,
      saBefore: null,
      inputs: [],
      attempts: 10,
      successes: 0,
      damage: null,
      carry: null,
      knockdownAdvantage: null,
      recoveryType: null,
      note: null,
      checkedAt: null
    };
  }

  year4.validate = validate;
  year4.exportVerificationTemplate = exportVerificationTemplate;

  document.addEventListener("DOMContentLoaded", () => {
    api.finalizeDrillRoutes();
    migrateStorage();
    updateVisibleMeta();
    validate();
  });
})();
