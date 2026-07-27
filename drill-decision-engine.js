(() => {
  const MOVES = window.MARISA_DATA;
  const ROUTES = window.MARISA_DRILL;
  const DATA = window.MARISA_DECISION_DRILL;
  const ANALYSIS = window.MARISA_DRILL_ANALYSIS;
  if (!MOVES || !ROUTES || !DATA) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const moveById = Object.fromEntries(MOVES.moves.map(move => [move.id, move]));
  const routeById = Object.fromEntries(ROUTES.routes.map(route => [route.id, route]));
  const scenarioById = Object.fromEntries(DATA.scenarios.map(scenario => [scenario.id, scenario]));
  const categoryById = Object.fromEntries(DATA.categories.map(category => [category.id, category]));
  const STORE_KEY = "marisa-decision-drill-v2";
  const HIDDEN_TAGS = new Set(["カウンター確認", "パニカン確認", "最大反撃"]);

  const screens = {
    setup: $('[data-screen="setup"]'),
    quiz: $('[data-screen="quiz"]'),
    result: $('[data-screen="result"]')
  };

  const setupState = { category: "all", speed: "standard", questionCount: 10 };
  let session = null;
  let countdownTimers = [];
  let answerTimer = null;
  let questionStartedAt = 0;
  let answered = false;

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

  function shuffled(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function showScreen(name) {
    Object.entries(screens).forEach(([key, element]) => {
      if (element) element.hidden = key !== name;
    });
  }

  function loadStore() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      return { settings: parsed.settings || null, attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [] };
    } catch {
      return { settings: null, attempts: [] };
    }
  }

  function saveStore(store) {
    try {
      store.attempts = store.attempts.slice(-100);
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch {
      // 保存不能でもプレイは継続する。
    }
  }

  function routeSequence(route) {
    return route.steps.map(step => {
      const command = notation(moveById[step.move]?.command || step.move);
      return `${step.charge ? "長押し " : ""}${command}`;
    }).join(" → ");
  }

  function routeResource(route) {
    const tags = route.tags || [];
    if (tags.includes("SA3")) return "SA3使用";
    if (tags.includes("OD") && tags.includes("ラッシュ")) return "OD＋ラッシュ";
    if (tags.includes("OD")) return "OD使用";
    if (tags.includes("ラッシュ")) return "ラッシュ使用";
    return "ノーゲージ";
  }

  function routeInput(route) {
    return route.input === "simple" ? "簡易入力" : "コマンド入力";
  }

  function routeTags(route) {
    return (route.tags || []).filter(tag => !HIDDEN_TAGS.has(tag)).slice(0, 3);
  }

  function tierLabel(tier) {
    return ROUTES.tierMeta?.[tier]?.label || tier || "—";
  }

  function diagnosticLabel(flag) {
    return ANALYSIS?.diagnosticMeta?.[flag]?.label || flag;
  }

  function formatSeconds(milliseconds) {
    return milliseconds == null ? "—" : `${(milliseconds / 1000).toFixed(1)}秒`;
  }

  function renderChoice(routeId, index) {
    const route = routeById[routeId];
    if (!route) return "";
    return `
      <button type="button" class="decision-choice" data-route-id="${escapeHtml(route.id)}" data-choice-index="${index}">
        <span class="decision-choice-key">${index + 1}</span>
        <strong>${escapeHtml(routeSequence(route))}</strong>
        <span class="decision-choice-meta">
          <i>${route.damage} DAMAGE${route.damageStatus === "estimated" ? "・概算" : ""}</i>
          <i>${escapeHtml(routeResource(route))}</i>
          <i>${escapeHtml(routeInput(route))}</i>
        </span>
        <span class="decision-choice-tags">${routeTags(route).map(tag => `<i>${escapeHtml(tag)}</i>`).join("")}</span>
      </button>`;
  }

  function renderSetup() {
    screens.setup.innerHTML = `
      <div class="decision-setup-intro">
        <small>DECISION DRILL</small>
        <h2>状況に合う、完成コンボを選ぶ。</h2>
        <p>毎問3→2→1のあと、同じ始動技から始まる3つの完成ルートを表示します。フレーム猶予ではなく、ヒット状況・ゲージ・目的を見て選びます。</p>
      </div>
      <div class="drill-field">
        <p class="drill-field-label">出題テーマ</p>
        <div class="drill-toggle" data-field="category">${DATA.categories.map(category => `<button type="button" data-value="${category.id}" class="${setupState.category === category.id ? "is-active" : ""}">${escapeHtml(category.label)}</button>`).join("")}</div>
      </div>
      <div class="drill-field">
        <p class="drill-field-label">判断時間</p>
        <div class="drill-toggle" data-field="speed">${Object.entries(DATA.decisionTimes).map(([id, item]) => `<button type="button" data-value="${id}" class="${setupState.speed === id ? "is-active" : ""}">${escapeHtml(item.label)} <small>${item.seconds}秒</small></button>`).join("")}</div>
      </div>
      <div class="drill-field">
        <p class="drill-field-label">問題数</p>
        <div class="drill-toggle" data-field="questionCount">${[6, 10, 18].map(value => `<button type="button" data-value="${value}" class="${setupState.questionCount === value ? "is-active" : ""}">${value}問</button>`).join("")}</div>
      </div>
      <button type="button" class="drill-start-button">3・2・1で開始</button>
      <p class="drill-setup-note">全18問を内蔵。すべて3つの完成コンボから選択します。</p>`;

    $$(".drill-toggle button", screens.setup).forEach(button => {
      button.addEventListener("click", () => {
        const field = button.closest(".drill-toggle").dataset.field;
        setupState[field] = field === "questionCount" ? Number(button.dataset.value) : button.dataset.value;
        renderSetup();
      });
    });
    $(".drill-start-button", screens.setup)?.addEventListener("click", startSession);
  }

  function buildQueue() {
    const eligible = DATA.scenarios.filter(item => setupState.category === "all" || item.category === setupState.category);
    const queue = [];
    let pool = shuffled(eligible);
    while (queue.length < setupState.questionCount && eligible.length) {
      if (!pool.length) pool = shuffled(eligible);
      const next = pool.shift();
      if (queue.length && eligible.length > 1 && queue.at(-1).id === next.id) {
        pool.push(next);
        continue;
      }
      queue.push(next);
    }
    return queue;
  }

  function startSession() {
    clearTimers();
    const questions = buildQueue();
    if (!questions.length) return;
    const store = loadStore();
    store.settings = { ...setupState };
    saveStore(store);
    session = { config: { ...setupState }, questions, index: 0, results: [] };
    showScreen("quiz");
    beginCountdown();
  }

  function clearTimers() {
    countdownTimers.forEach(clearTimeout);
    countdownTimers = [];
    if (answerTimer) clearTimeout(answerTimer);
    answerTimer = null;
  }

  function beginCountdown() {
    clearTimers();
    answered = false;
    const values = DATA.countdown || [3, 2, 1];
    screens.quiz.innerHTML = `<div class="decision-countdown" aria-live="assertive"><small>NEXT DECISION</small><b>${values[0]}</b></div>`;
    values.forEach((value, index) => {
      countdownTimers.push(setTimeout(() => {
        const count = $(".decision-countdown b", screens.quiz);
        if (!count) return;
        count.textContent = value;
        count.classList.remove("is-pop");
        void count.offsetWidth;
        count.classList.add("is-pop");
      }, index * 560));
    });
    countdownTimers.push(setTimeout(showQuestion, values.length * 560));
  }

  function showQuestion() {
    clearTimers();
    answered = false;
    const scenario = session.questions[session.index];
    const choices = shuffled(scenario.choices);
    const seconds = DATA.decisionTimes[session.config.speed]?.seconds || 8;

    screens.quiz.innerHTML = `
      <div class="decision-progress"><span><b>${session.index + 1}</b> / ${session.questions.length}</span><i>${escapeHtml(categoryById[scenario.category]?.label || scenario.category)}</i></div>
      <section class="decision-situation">
        <small>SITUATION</small>
        <h2>${escapeHtml(scenario.title)}</h2>
        <div class="decision-facts">${scenario.facts.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`).join("")}</div>
        <p>${escapeHtml(scenario.prompt)}</p>
      </section>
      <div class="decision-timer" aria-label="残り時間 ${seconds}秒"><i style="--decision-duration:${seconds}s"></i><span>${seconds}秒</span></div>
      <div class="decision-choices" aria-label="コンボを3つから選ぶ">${choices.map((routeId, index) => renderChoice(routeId, index)).join("")}</div>
      <div class="decision-feedback" hidden></div>`;

    $$(".decision-choice", screens.quiz).forEach(button => button.addEventListener("click", () => answerQuestion(button.dataset.routeId)));
    questionStartedAt = performance.now();
    answerTimer = setTimeout(() => answerQuestion(null), seconds * 1000);
  }

  function answerQuestion(routeId) {
    if (answered) return;
    answered = true;
    if (answerTimer) clearTimeout(answerTimer);
    answerTimer = null;

    const scenario = session.questions[session.index];
    const type = routeId === null ? "timeout" : routeId === scenario.correct ? "correct" : "wrong";
    const elapsedMs = Math.round(performance.now() - questionStartedAt);
    const rawResult = { scenarioId: scenario.id, routeId, correctRouteId: scenario.correct, type, elapsedMs };
    const result = ANALYSIS ? ANALYSIS.enrichResult(rawResult) : rawResult;
    session.results.push(result);

    $$(".decision-choice", screens.quiz).forEach(button => {
      button.disabled = true;
      if (button.dataset.routeId === scenario.correct) button.classList.add("is-correct");
      if (routeId && button.dataset.routeId === routeId && routeId !== scenario.correct) button.classList.add("is-wrong");
    });

    const correctRoute = routeById[scenario.correct];
    const selectedRoute = routeId ? routeById[routeId] : null;
    const feedback = $(".decision-feedback", screens.quiz);
    feedback.hidden = false;
    feedback.setAttribute("data-tone", type);
    feedback.innerHTML = `
      <div class="decision-feedback-title">
        <span>${type === "correct" ? "✓" : type === "timeout" ? "TIME" : "×"}</span>
        <div><small>${type === "correct" ? "適切な選択" : type === "timeout" ? "時間切れ" : "選択違い"}</small><b>${escapeHtml(correctRoute.label)}</b></div>
      </div>
      ${selectedRoute && type === "wrong" ? `<p class="decision-selected">選んだルート：${escapeHtml(selectedRoute.label)}</p>` : ""}
      <p>${escapeHtml(scenario.why)}</p>
      <div class="decision-correct-route"><small>選ぶルート</small><strong>${escapeHtml(routeSequence(correctRoute))}</strong><span>${correctRoute.damage} DAMAGE・${escapeHtml(routeResource(correctRoute))}・${escapeHtml(routeInput(correctRoute))}</span></div>
      <button type="button" class="drill-next-button">${session.index + 1 < session.questions.length ? "次の判断へ" : "結果を見る"}</button>`;
    $(".drill-next-button", feedback)?.addEventListener("click", advance);
  }

  function advance() {
    session.index += 1;
    if (session.index >= session.questions.length) finishSession();
    else beginCountdown();
  }

  function fallbackAnalysis(results) {
    return {
      diagnostics: {},
      dominantDiagnostic: null,
      dominantMeta: null,
      tierStats: {},
      results
    };
  }

  function finishSession() {
    clearTimers();
    const totals = { correct: 0, wrong: 0, timeout: 0 };
    const categoryStats = {};
    const misses = [];
    let decisionSum = 0;
    let decisionCount = 0;

    session.results.forEach(result => {
      totals[result.type] += 1;
      const scenario = scenarioById[result.scenarioId];
      categoryStats[scenario.category] ||= { correct: 0, total: 0 };
      categoryStats[scenario.category].total += 1;
      if (result.type === "correct") categoryStats[scenario.category].correct += 1;
      if (result.type !== "timeout") {
        decisionSum += result.elapsedMs;
        decisionCount += 1;
      }
      if (result.type !== "correct") {
        misses.push({
          scenario,
          result,
          correctRoute: routeById[result.correctRouteId],
          selectedRoute: result.routeId ? routeById[result.routeId] : null,
          type: result.type
        });
      }
    });

    const accuracy = Math.round((totals.correct / session.results.length) * 100);
    const averageMs = decisionCount ? Math.round(decisionSum / decisionCount) : null;
    const analysis = ANALYSIS ? ANALYSIS.summarizeSession(session.results, scenarioById) : fallbackAnalysis(session.results);
    const store = loadStore();
    const attempt = ANALYSIS
      ? ANALYSIS.createAttempt({ at: Date.now(), config: session.config, total: session.results.length, accuracy, averageMs, totals, analysis })
      : { at: Date.now(), config: session.config, total: session.results.length, accuracy, averageMs, totals };
    store.attempts.push(attempt);
    saveStore(store);
    const historySummary = ANALYSIS ? ANALYSIS.saveHistorySummary(store.attempts) : null;
    renderResult({ totals, categoryStats, misses, accuracy, averageMs, analysis, historySummary });
  }

  function renderTierStats(tierStats = {}) {
    const order = ANALYSIS?.tierOrder || ["stable", "standard", "maximum"];
    return `<section class="decision-result-tiers">
      <div class="decision-result-section-heading"><small>ROUTE LEVEL</small><h2>段階別の判断</h2><p>正解として求められた段階ごとに、正答・時間切れ・判断時間を分けます。</p></div>
      <div class="decision-tier-stat-grid">${order.map(tier => {
        const stat = tierStats[tier] || { total: 0, correct: 0, timeout: 0, averageMs: null };
        const rate = stat.total ? Math.round((stat.correct / stat.total) * 100) : 0;
        return `<article data-tier="${escapeHtml(tier)}">
          <header><small>${escapeHtml(tierLabel(tier))}</small><b>${stat.correct}<span>/${stat.total}</span></b></header>
          <i style="--tier-rate:${rate}%"></i>
          <dl><div><dt>正答率</dt><dd>${stat.total ? rate + "%" : "—"}</dd></div><div><dt>時間切れ</dt><dd>${stat.timeout || 0}</dd></div><div><dt>平均判断</dt><dd>${formatSeconds(stat.averageMs)}</dd></div></dl>
        </article>`;
      }).join("")}</div>
    </section>`;
  }

  function renderDiagnostics(analysis) {
    const diagnostics = analysis?.diagnostics || {};
    const entries = Object.entries(ANALYSIS?.diagnosticMeta || {})
      .map(([key, meta]) => ({ key, meta, count: diagnostics[key] || 0 }))
      .filter(item => item.count > 0);
    const dominant = analysis?.dominantMeta;

    return `<section class="decision-result-diagnostics">
      <div class="decision-result-section-heading"><small>DECISION HABIT</small><h2>今回の判断傾向</h2><p>ミスを、火力不足ではなく「どちらへ外したか」で分類します。</p></div>
      ${dominant ? `<article class="decision-dominant-diagnostic" data-diagnostic="${escapeHtml(analysis.dominantDiagnostic)}"><small>優先して直す</small><h3>${escapeHtml(dominant.label)}</h3><b>${escapeHtml(dominant.short)}</b><p>${escapeHtml(dominant.description)}</p></article>` : `<article class="decision-dominant-diagnostic is-clear"><small>今回の傾向</small><h3>段階選択は安定</h3><p>明確な判断の偏りは出ていません。速度を上げる前に、同じ条件で再現できるかを確認します。</p></article>`}
      <div class="decision-diagnostic-grid">${entries.length ? entries.map(item => `<div data-diagnostic="${escapeHtml(item.key)}"><b>${item.count}</b><span>${escapeHtml(item.meta.label)}</span><small>${escapeHtml(item.meta.short)}</small></div>`).join("") : `<p class="decision-no-diagnostics">選択違い・時間切れはありませんでした。</p>`}</div>
    </section>`;
  }

  function renderMiss(item) {
    const flags = item.result.diagnosticFlags || [];
    const correctTier = tierLabel(item.result.correctTier);
    const selectedTier = item.type === "timeout" ? "未選択" : tierLabel(item.result.selectedTier);
    return `<article>
      <small>${item.type === "timeout" ? "時間切れ" : "選択違い"}</small>
      <h3>${escapeHtml(item.scenario.title)}</h3>
      <div class="decision-review-comparison"><span>正解：<b>${escapeHtml(correctTier)}</b></span><span>選択：<b>${escapeHtml(selectedTier)}</b></span></div>
      ${flags.length ? `<div class="decision-review-diagnostics">${flags.map(flag => `<i>${escapeHtml(diagnosticLabel(flag))}</i>`).join("")}</div>` : ""}
      <p>${escapeHtml(item.scenario.prompt)}</p>
      <strong>${escapeHtml(routeSequence(item.correctRoute))}</strong>
      <span>${escapeHtml(item.scenario.why)}</span>
    </article>`;
  }

  function renderResult(summary) {
    showScreen("result");
    const categoryRows = Object.entries(summary.categoryStats)
      .map(([id, stat]) => ({ id, ...stat, rate: Math.round((stat.correct / stat.total) * 100) }))
      .sort((a, b) => a.rate - b.rate);

    screens.result.innerHTML = `
      <div class="drill-result-hero"><small>DECISION RESULT</small><h1>${summary.accuracy}<span>%</span></h1><p>${summary.totals.correct} / ${session.results.length} 問で適切なコンボを選択</p></div>
      <div class="drill-result-grid decision-result-grid">
        <div><small>適切</small><b>${summary.totals.correct}</b></div>
        <div><small>選択違い</small><b>${summary.totals.wrong}</b></div>
        <div><small>時間切れ</small><b>${summary.totals.timeout}</b></div>
        <div><small>平均判断</small><b>${formatSeconds(summary.averageMs)}</b></div>
      </div>
      ${renderDiagnostics(summary.analysis)}
      ${renderTierStats(summary.analysis?.tierStats)}
      <section class="decision-result-categories"><h2>判断テーマ別</h2>${categoryRows.map(item => `<div><span>${escapeHtml(categoryById[item.id]?.label || item.id)}</span><b>${item.correct}/${item.total}</b><i style="--rate:${item.rate}%"></i></div>`).join("")}</section>
      ${summary.misses.length ? `<section class="decision-result-review"><h2>もう一度見る判断</h2>${summary.misses.map(renderMiss).join("")}</section>` : ""}
      <div class="drill-result-actions"><button type="button" class="drill-retry-button primary">同じ設定でもう一度</button><button type="button" class="drill-back-button">設定に戻る</button></div>`;

    $(".drill-retry-button", screens.result)?.addEventListener("click", startSession);
    $(".drill-back-button", screens.result)?.addEventListener("click", () => { showScreen("setup"); renderSetup(); });
  }

  function handleKeyboard(event) {
    if (screens.quiz.hidden || answered || !["1", "2", "3"].includes(event.key)) return;
    const button = $(`[data-choice-index="${Number(event.key) - 1}"]`, screens.quiz);
    if (button && !button.disabled) button.click();
  }

  function runSelfTest() {
    const routeIds = new Set(ROUTES.routes.map(route => route.id));
    const scenarioIds = new Set();
    const results = [];
    DATA.scenarios.forEach(scenario => {
      results.push([`${scenario.id}: 3択`, scenario.choices.length === 3]);
      results.push([`${scenario.id}: 正解を含む`, scenario.choices.includes(scenario.correct)]);
      results.push([`${scenario.id}: ルート実在`, scenario.choices.every(id => routeIds.has(id))]);
      results.push([`${scenario.id}: 同じ始動技`, new Set(scenario.choices.map(id => routeById[id]?.starter)).size === 1]);
      results.push([`${scenario.id}: ID重複なし`, !scenarioIds.has(scenario.id)]);
      results.push([`${scenario.id}: 正解段階あり`, Boolean(routeById[scenario.correct]?.tier)]);
      scenarioIds.add(scenario.id);
    });
    results.push(["段階診断モジュール", Boolean(ANALYSIS)]);
    return results;
  }

  function renderSelfTest(results) {
    const failed = results.filter(([, pass]) => !pass);
    const banner = document.createElement("div");
    banner.id = "drill-selftest-banner";
    banner.dataset.tone = failed.length ? "fail" : "pass";
    banner.innerHTML = `<b>判断ドリル自己チェック：${results.length - failed.length}/${results.length}</b><ul>${results.map(([name, pass]) => `<li data-pass="${pass}">${pass ? "OK" : "NG"} — ${escapeHtml(name)}</li>`).join("")}</ul>`;
    document.body.prepend(banner);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const stored = loadStore();
    if (stored.settings) Object.assign(setupState, stored.settings);
    if (ANALYSIS) ANALYSIS.saveHistorySummary(stored.attempts);
    showScreen("setup");
    renderSetup();
    document.addEventListener("keydown", handleKeyboard);
    if (location.search.includes("selftest")) renderSelfTest(runSelfTest());
  });
})();
