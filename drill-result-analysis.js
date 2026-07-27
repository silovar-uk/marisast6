(() => {
  const drill = window.MARISA_DRILL;
  if (!drill) return;

  const routeById = Object.fromEntries(drill.routes.map(route => [route.id, route]));
  const tierRank = { stable: 0, standard: 1, maximum: 2 };
  const tierOrder = ["stable", "standard", "maximum"];
  const SUMMARY_KEY = "modern-marisa-drill-analysis-v1";

  const diagnosticMeta = {
    foundationGap: {
      id: "foundation-gap",
      label: "基準未定着",
      short: "安定を先に固定",
      description: "安定ルートが正解の場面で迷っています。最大を増やす前に、条件を見ずに戻れる基準を固定します。"
    },
    overextend: {
      id: "overextend",
      label: "伸ばしすぎ",
      short: "一段下へ戻す",
      description: "正解より上の段階を選んでいます。ゲージ、ヒット状況、成立条件が足りない時は安定・標準へ戻します。"
    },
    underconvert: {
      id: "underconvert",
      label: "リターン不足",
      short: "取れる時は伸ばす",
      description: "正解より下の段階へ逃げています。パニカン、十分なゲージ、倒し切りを確認できた時は標準・最大へ進みます。"
    },
    conditionMiss: {
      id: "condition-miss",
      label: "条件違い",
      short: "段階より条件を見る",
      description: "同じ安定・標準・最大の中で、通常・カウンター・パニカンや長押し条件を取り違えています。"
    },
    timeout: {
      id: "timeout",
      label: "時間切れ",
      short: "判断軸を減らす",
      description: "答えを選ぶ前に時間が切れています。始動、ヒット状況、目的の順に見る情報を固定します。"
    }
  };

  function emptyDiagnostics() {
    return {
      foundationGap: 0,
      overextend: 0,
      underconvert: 0,
      conditionMiss: 0,
      timeout: 0
    };
  }

  function emptyTierStat(tier) {
    return {
      tier,
      total: 0,
      correct: 0,
      wrong: 0,
      timeout: 0,
      answeredCount: 0,
      answeredMs: 0,
      averageMs: null
    };
  }

  function flagsFor(type, correctTier, selectedTier) {
    const flags = [];
    if (type === "correct") return flags;
    if (correctTier === "stable") flags.push("foundationGap");
    if (type === "timeout") {
      flags.push("timeout");
      return flags;
    }
    if (!(correctTier in tierRank) || !(selectedTier in tierRank)) {
      flags.push("conditionMiss");
      return flags;
    }
    const delta = tierRank[selectedTier] - tierRank[correctTier];
    if (delta > 0) flags.push("overextend");
    else if (delta < 0) flags.push("underconvert");
    else flags.push("conditionMiss");
    return flags;
  }

  function enrichResult(result) {
    const correctRoute = routeById[result.correctRouteId];
    const selectedRoute = result.routeId ? routeById[result.routeId] : null;
    const correctTier = correctRoute?.tier || null;
    const selectedTier = selectedRoute?.tier || null;
    const flags = flagsFor(result.type, correctTier, selectedTier);
    return {
      ...result,
      correctTier,
      selectedTier,
      tierDelta: selectedTier && correctTier ? tierRank[selectedTier] - tierRank[correctTier] : null,
      diagnosticFlags: flags
    };
  }

  function dominantDiagnostic(diagnostics) {
    const priority = ["foundationGap", "overextend", "underconvert", "conditionMiss", "timeout"];
    return priority
      .map((key, index) => ({ key, count: diagnostics[key] || 0, index }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count || a.index - b.index)[0]?.key || null;
  }

  function summarizeSession(results, scenarioById = {}) {
    const tierStats = Object.fromEntries(tierOrder.map(tier => [tier, emptyTierStat(tier)]));
    const diagnostics = emptyDiagnostics();
    const enrichedResults = results.map(result => result.correctTier ? result : enrichResult(result));

    enrichedResults.forEach(result => {
      const tier = result.correctTier;
      if (tierStats[tier]) {
        const stat = tierStats[tier];
        stat.total += 1;
        stat[result.type] += 1;
        if (result.type !== "timeout") {
          stat.answeredCount += 1;
          stat.answeredMs += result.elapsedMs;
        }
      }
      (result.diagnosticFlags || []).forEach(flag => {
        if (flag in diagnostics) diagnostics[flag] += 1;
      });
    });

    Object.values(tierStats).forEach(stat => {
      stat.averageMs = stat.answeredCount ? Math.round(stat.answeredMs / stat.answeredCount) : null;
    });

    const dominantKey = dominantDiagnostic(diagnostics);
    return {
      version: 1,
      diagnostics,
      dominantDiagnostic: dominantKey,
      dominantMeta: dominantKey ? diagnosticMeta[dominantKey] : null,
      tierStats,
      results: enrichedResults.map(result => ({
        ...result,
        scenarioCategory: scenarioById[result.scenarioId]?.category || null
      }))
    };
  }

  function createAttempt({ at, config, total, accuracy, averageMs, totals, analysis }) {
    return {
      version: 2,
      at,
      config,
      total,
      accuracy,
      averageMs,
      totals,
      diagnostics: analysis.diagnostics,
      dominantDiagnostic: analysis.dominantDiagnostic,
      tierStats: analysis.tierStats,
      results: analysis.results
    };
  }

  function mergeTierStats(target, source) {
    tierOrder.forEach(tier => {
      const from = source?.[tier];
      if (!from) return;
      const to = target[tier];
      to.total += Number(from.total) || 0;
      to.correct += Number(from.correct) || 0;
      to.wrong += Number(from.wrong) || 0;
      to.timeout += Number(from.timeout) || 0;
      to.answeredCount += Number(from.answeredCount) || 0;
      to.answeredMs += Number(from.answeredMs) || 0;
    });
  }

  function buildHistorySummary(attempts = []) {
    const recentAttempts = attempts.filter(attempt => attempt?.version === 2).slice(-20);
    const diagnostics = emptyDiagnostics();
    const tierStats = Object.fromEntries(tierOrder.map(tier => [tier, emptyTierStat(tier)]));
    const recentMisses = [];
    let total = 0;
    let correct = 0;

    recentAttempts.forEach(attempt => {
      total += Number(attempt.total) || 0;
      correct += Number(attempt.totals?.correct) || 0;
      Object.keys(diagnostics).forEach(key => {
        diagnostics[key] += Number(attempt.diagnostics?.[key]) || 0;
      });
      mergeTierStats(tierStats, attempt.tierStats);
    });

    [...recentAttempts].reverse().forEach(attempt => {
      [...(attempt.results || [])].reverse().forEach(result => {
        if (result.type === "correct") return;
        if (recentMisses.some(item => item.scenarioId === result.scenarioId)) return;
        recentMisses.push({
          at: attempt.at,
          scenarioId: result.scenarioId,
          correctRouteId: result.correctRouteId,
          routeId: result.routeId,
          correctTier: result.correctTier,
          selectedTier: result.selectedTier,
          type: result.type,
          diagnosticFlags: result.diagnosticFlags || []
        });
      });
    });

    Object.values(tierStats).forEach(stat => {
      stat.averageMs = stat.answeredCount ? Math.round(stat.answeredMs / stat.answeredCount) : null;
    });

    const dominantKey = dominantDiagnostic(diagnostics);
    const suggestedScenarioIds = recentMisses.slice(0, 5).map(item => item.scenarioId);
    return {
      version: 1,
      updatedAt: Date.now(),
      attempts: recentAttempts.length,
      total,
      correct,
      accuracy: total ? Math.round((correct / total) * 100) : null,
      diagnostics,
      dominantDiagnostic: dominantKey,
      dominantMeta: dominantKey ? diagnosticMeta[dominantKey] : null,
      tierStats,
      recentMisses: recentMisses.slice(0, 8),
      suggestedScenarioIds
    };
  }

  function saveHistorySummary(attempts) {
    const summary = buildHistorySummary(attempts);
    try {
      localStorage.setItem(SUMMARY_KEY, JSON.stringify(summary));
    } catch {
      // 保存不能でも今回の結果表示は継続する。
    }
    window.MARISA_DRILL_ANALYSIS_SUMMARY = summary;
    document.dispatchEvent(new CustomEvent("marisa:drill-analysis", { detail: summary }));
    return summary;
  }

  window.MARISA_DRILL_ANALYSIS = {
    version: "1.0.0",
    summaryStorageKey: SUMMARY_KEY,
    tierOrder,
    tierRank,
    diagnosticMeta,
    enrichResult,
    summarizeSession,
    createAttempt,
    buildHistorySummary,
    saveHistorySummary
  };
})();
