(() => {
  const MOVES = window.MARISA_DATA;
  const ROUTES = window.MARISA_DRILL;
  const DECISIONS = window.MARISA_DECISION_DRILL;
  if (!MOVES || !ROUTES || !DECISIONS) return;

  const moveById = Object.fromEntries(MOVES.moves.map(move => [move.id, move]));
  const routeById = Object.fromEntries(ROUTES.routes.map(route => [route.id, route]));
  const categoryById = Object.fromEntries(DECISIONS.categories.map(category => [category.id, category]));
  const STORE_KEY = "marisa-decision-drill-v2";
  const CONDITION_LABEL = { normal: "通常", counter: "カウンター", punish: "パニカン" };
  const HIDDEN_TAGS = new Set(["カウンター確認", "パニカン確認", "最大反撃"]);

  const screens = {
    setup: document.querySelector('[data-screen="setup"]'),
    quiz: document.querySelector('[data-screen="quiz"]'),
    result: document.querySelector('[data-screen="result"]')
  };

  const setupState = {
    category: "all",
    speed: "standard",
    questionCount: 10
  };

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

  function normalizeNotation(value) {
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
      const stored = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      return {
        settings: stored.settings || null,
        attempts: Array.isArray(stored.attempts) ? stored.attempts : []
      };
    } catch {
      return { settings: null, attempts: [] };
    }
  }

  function saveStore(store) {
    try {
      store.attempts = store.attempts.slice(-100);
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch {
      // 保存できなくてもドリルは続行する。
    }
  }

  function routeSequence(route) {
    return route.steps.map(step => {
      const move = moveById[step.move];
      const command = normalizeNotation(move?.command || step.move);
      return `${step.charge ? "長押し " : ""}${command}`;
    }).join(" → ");
  }

  function visibleTags(route) {
    return (route.tags || []).filter(tag => !HIDDEN_TAGS.has(tag)).slice(0, 3);
  }

  function routeResourceLabel(route) {
    const tags = route.tags || [];
    if (tags.includes("SA3")) return "SA3使用";
    if (tags.includes("OD") && tags.includes("ラッシュ")) return "OD＋ラッシュ";
    if (tags.includes("OD")) return "OD使用";
    if (tags.includes("ラッシュ")) return "ラッシュ使用";
    return "ノーゲージ";
  }

  function routeInputLabel(route) {
    return route.input === "simple" ? "簡易入力" : "コマンド入力";
  }

  function renderChoice(routeId, index) {
    const route = routeById[routeId];
    if (!route) return "";
    return `
      <button type="button" class="decision-choice" data-route-id="${escapeHtml(route.id)}" data-choice-index="${index}">
        <span class="decision-choice-key">${index + 1}</span>
        <strong>${escapeHtml(routeSequence(route))}</strong>
        <span class="decision-choice-meta">
          <i>${escapeHtml(String(route.damage))} DAMAGE${route.damageStatus === "estimated" ? "・概算" : ""}</i>
          <i>${escapeHtml(routeResourceLabel(route))}</i>
          <i>${escapeHtml(routeInputLabel(route))}</i>
        </span>
        <span class="decision-choice-tags">${visibleTags(route).map(tag => `<i>${escapeHtml(tag)}</i>`).join("")}</span>
      </button>`;
  }

  function renderSetup() {
    if (!screens.setup) return;
    screens.setup.innerHTML = `
      <div class="decision-setup-intro">
        <small>DECISION DRILL</small>
        <h2>状況に合う、完成コンボを選ぶ。</h2>
        <p>毎問3→2→1のあと、同じ始動技から始まる3つの完成ルートを表示します。フレーム猶予ではなく、ヒット状況・ゲージ・目的を見て選びます。</p>
      </div>
      <div class="drill-field">
        <p class="drill-field-label">出題テーマ</p>
        <div class="drill-toggle" data-field="category">
          ${DECISIONS.categories.map(category => `<button type="button" data-value="${category.id}" class="${setupState.category === category.id ? "is-active" : ""}">${escapeHtml(category.label)}</button>`).join("")}
        </div>
      </div>
      <div class="drill-field">
        <p class="drill-field-label">判断時間</p>
        <div class="drill-toggle" data-field="speed">
          ${Object.entries(DECISIONS.decisionTimes).map(([id, item]) => `<button type="button" data-value="${id}" class="${setupState.speed === id ? "is-active" : ""}">${escapeHtml(item.label)} <small>${item.seconds}秒</small></button>`).join("")}
        </div>
      </div>
      <div class="drill-field">
        <p class="drill-field-label">問題数</p>
        <div class="drill-toggle" data-field="questionCount">
          ${[6, 10, 18].map(value => `<button type="button" data-value="${value}" class="${setupState.questionCount === value ? "is-active" : ""}">${value}問</button>`).join("")}
        </div>
      </div>
      <button type="button" class="drill-start-button">3・2・1で開始</button>
      <p class="drill-setup-note">全18問を内蔵。各問題は必ず3つの完成コンボから選択します。</p>`;

    screens.setup.querySelectorAll(".drill-toggle button").forEach(button => {
      button.addEventListener("click", () => {
        const field = button.closest(".drill-toggle").dataset.field;
        setupState[field] = field === "questionCount" ? Number(button.dataset.value) : button.dataset.value;
        renderSetup();
      });
    });

    screens.setup.querySelector(".drill-start-button")?.addEventListener("click", startSession);
  }

  function buildQuestionQueue() {
    const eligible = DECISIONS.scenarios.filter(scenario => setupState.category === "all" || scenario.category === setupState.category);
    if (!eligible.length) return [];
    const queue = [];
    let pool = shuffled(eligible);
    while (queue.length < setupState.questionCount) {
      if (!pool.length) pool = shuffled(eligible);
      const next = pool.shift();
      if (queue.length && eligible.length > 1 && queue[queue.length - 1].id === next.id) {
        pool.push(next);
        continue;
      }
      queue.push(next);
    }
    return queue;
  }

  function startSession() {
    clearAllTimers();
    const questions = buildQuestionQueue();
    if (!questions.length) return;
    const store = loadStore();
    store.settings = { ...setupState };
    saveStore(store);
    session = {
      config: { ...setupState },
      questions,
      index: 0,
      results: []
    };
    showScreen("quiz");
    beginCountdown();
  }

  function clearAllTimers() {
    countdownTimers.forEach(timer => clearTimeout(timer));
    countdownTimers = [];
    if (answerTimer) clearTimeout(answerTimer);
    answerTimer = null;
  }

  function beginCountdown() {
    clearAllTimers();
    answered = false;
    const values = DECISIONS.countdown || [3, 2, 1];
    screens.quiz.innerHTML = `
      <div class="decision-countdown" aria-live="assertive">
        <small>NEXT DECISION</small>
        <b>${values[0]}</b>
      </div>`;

    values.forEach((value, index) => {
      const timer = setTimeout(() => {
        const count = screens.quiz.querySelector(".decision-countdown b");
        if (count) {
          count.textContent = value;
          count.classList.remove("is-pop");
          void count.offsetWidth;
          count.classList.add("is-pop");
        }
      }, index * 560);
      countdownTimers.push(timer);
    });

    countdownTimers.push(setTimeout(showQuestion, values.length * 560));
  }

  function showQuestion() {
    clearAllTimers();
    answered = false;
    const scenario = session.questions[session.index];
    const choices = shuffled(scenario.choices);
    const seconds = DECISIONS.decisionTimes[session.config.speed]?.seconds || 8;
    session.currentChoiceOrder = choices;

    screens.quiz.innerHTML = `
      <div class="decision-progress">
        <span><b>${session.index + 1}</b> / ${session.questions.length}</span>
        <i>${escapeHtml(categoryById[scenario.category]?.label || scenario.category)}</i>
      </div>
      <section class="decision-situation">
        <small>SITUATION</small>
        <h2>${escapeHtml(scenario.title)}</h2>
        <div class="decision-facts">${scenario.facts.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`).join("")}</div>
        <p>${escapeHtml(scenario.prompt)}</p>
      </section>
      <div class="decision-timer" aria-label="残り時間 ${seconds}秒"><i style="--decision-duration:${seconds}s"></i><span>${seconds}秒</span></div>
      <div class="decision-choices" aria-label="コンボを3つから選ぶ">
        ${choices.map((routeId, index) => renderChoice(routeId, index)).join("")}
      </div>
      <div class="decision-feedback" hidden></div>`;

    screens.quiz.querySelectorAll(".decision-choice").forEach(button => {
      button.addEventListener("click", () => answerQuestion(button.dataset.routeId));
    });

    questionStartedAt = performance.now();
    answerTimer = setTimeout(() => answerQuestion(null), seconds * 1000);
  }

  function answerQuestion(routeId) {
    if (answered) return;
    answered = true;
    if (answerTimer) clearTimeout(answerTimer);
    answerTimer = null;

    const scenario = session.questions[session.index];
    const elapsedMs = Math.round(performance.now() - questionStartedAt);
    const type = routeId === null ? "timeout" : routeId === scenario.correct ? "correct" : "wrong";
    session.results.push({ scenarioId: scenario.id, routeId, correctRouteId: scenario.correct, type, elapsedMs });

    screens.quiz.querySelectorAll(".decision-choice").forEach(button => {
      button.disabled = true;
      if (button.dataset.routeId === scenario.correct) button.classList.add("is-correct");
      if (routeId && button.dataset.routeId === routeId && routeId !== scenario.correct) button.classList.add("is-wrong");
    });

    const correctRoute = routeById[scenario.correct];
    const selectedRoute = routeId ? routeById[routeId] : null;
    const feedback = screens.quiz.querySelector(".decision-feedback");
    feedback.hidden = false;
    feedback.dataset-tone = type;
    feedback.setAttribute("data-tone", type);
    feedback.innerHTML = `
      <div class="decision-feedback-title">
        <span>${type === "correct" ? "✓" : type === "timeout" ? "TIME" : "×"}</span>
        <div><small>${type === "correct" ? "適切な選択" : type === "timeout" ? "時間切れ" : "選択違い"}</small><b>${escapeHtml(correctRoute.label)}</b></div>
      </div>
      ${selectedRoute && type === "wrong" ? `<p class="decision-selected">選んだルート：${escapeHtml(selectedRoute.label)}</p>` : ""}
      <p>${escapeHtml(scenario.why)}</p>
      <div class="decision-correct-route"><small>選ぶルート</small><strong>${escapeHtml(routeSequence(correctRoute))}</strong><span>${correctRoute.damage} DAMAGE・${escapeHtml(routeResourceLabel(correctRoute))}・${escapeHtml(routeInputLabel(correctRoute))}</span></div>
      <button type="button" class="drill-next-button">${session.index + 1 < session.questions.length ? "次の判断へ" : "結果を見る"}</button>`;

    feedback.querySelector(".drill-next-button")?.addEventListener("click", advance);
  }

  function advance() {
    session.index += 1;
    if (session.index >= session.questions.length) finishSession();
    else beginCountdown();
  }

  function finishSession() {
    clearAllTimers();
    const totals = { correct: 0, wrong: 0, timeout: 0 };
    let decisionSum = 0;
    let decisionCount = 0;
    const misses = [];
    const categoryStats = {};

    session.results.forEach(result => {
      totals[result.type] += 1;
      const scenario = DECISIONS.scenarios.find(item => item.id === result.scenarioId);
      if (!categoryStats[scenario.category]) categoryStats[scenario.category] = { correct: 0, total: 0 };
      categoryStats[scenario.category].total += 1;
      if (result.type === "correct") categoryStats[scenario.category].correct += 1;
      if (result.type !== "timeout") {
        decisionSum += result.elapsedMs;
        decisionCount += 1;
      }
      if (result.type !== "correct") misses.push({ scenario, correctRoute: routeById[result.correctRouteId], type: result.type });
    });

    const accuracy = Math.round((totals.correct / session.results.length) * 100);
    const averageMs = decisionCount ? Math.round(decisionSum / decisionCount) : null;
    const store = loadStore();
    store.attempts.push({
      at: Date.now(),
      config: session.config,
      total: session.results.length,
      accuracy,
      averageMs,
      totals
    });
    saveStore(store);
    renderResult({ accuracy, averageMs, totals, misses, categoryStats });
  }

  function renderResult(summary) {
    showScreen("result");
    const weakCategories = Object.entries(summary.categoryStats)
      .map(([id, stat]) => ({ id, ...stat, rate: stat.total ? Math.round((stat.correct / stat.total) * 100) : 0 }))
      .sort((a, b) => a.rate - b.rate);

    screens.result.innerHTML = `
      <div class="drill-result-hero">
        <small>DECISION RESULT</small>
        <h1>${summary.accuracy}<span>%</span></h1>
        <p>${summary.totals.correct} / ${session.results.length} 問で適切なコンボを選択</p>
      </div>
      <div class="drill-result-grid decision-result-grid">
        <div><small>適切</small><b>${summary.totals.correct}</b></div>
        <div><small>選択違い</small><b>${summary.totals.wrong}</b></div>
        <div><small>時間切れ</small><b>${summary.totals.timeout}</b></div>
        <div><small>平均判断</small><b>${summary.averageMs == null ? "—" : (summary.averageMs / 1000).toFixed(1) + "秒"}</b></div>
      </div>
      <section class="decision-result-categories">
        <h2>判断テーマ別</h2>
        ${weakCategories.map(item => `<div><span>${escapeHtml(categoryById[item.id]?.label || item.id)}</span><b>${item.correct}/${item.total}</b><i style="--rate:${item.rate}%"></i></div>`).join("")}
      </section>
      ${summary.misses.length ? `<section class="decision-result-review"><h2>もう一度見る判断</h2>${summary.misses.map(item => `<article><small>${item.type === "timeout" ? "時間切れ" : "選択違い"}</small><h3>${escapeHtml(item.scenario.title)}</h3><p>${escapeHtml(item.scenario.prompt)}</p><strong>${escapeHtml(routeSequence(item.correctRoute))}</strong><span>${escapeHtml(item.scenario.why)}</span></article>`).join("")}</section>` : ""}
      <div class="drill-result-actions">
        <button type="button" class="drill-retry-button primary">同じ設定でもう一度</button>
        <button type="button" class="drill-back-button">設定に戻る</button>
      </div>`;

    screens.result.querySelector(".drill-retry-button")?.addEventListener("click", startSession);
    screens.result.querySelector(".drill-back-button")?.addEventListener("click", () => {
      showScreen("setup");
      renderSetup();
    });
  }

  function handleKeyboard(event) {
    if (screens.quiz?.hidden || answered) return;
    if (!["1", "2", "3"].includes(event.key)) return;
    const button = screens.quiz.querySelector(`[data-choice-index="${Number(event.key) - 1}"]`);
    if (button && !button.disabled) button.click();
  }

  function runSelfTest() {
    const results = [];
    const routeIds = new Set(ROUTES.routes.map(route => route.id));
    const scenarioIds = new Set();
    DECISIONS.scenarios.forEach(scenario => {
      results.push({ name: `${scenario.id}: 3択`, pass: scenario.choices.length === 3 });
      results.push({ name: `${scenario.id}: 正解を含む`, pass: scenario.choices.includes(scenario.correct) });
      results.push({ name: `${scenario.id}: 全ルートが存在`, pass: scenario.choices.every(id => routeIds.has(id)) });
      const starters = new Set(scenario.choices.map(id => routeById[id]?.starter));
      results.push({ name: `${scenario.id}: 同じ始動技`, pass: starters.size === 1 });
      results.push({ name: `${scenario.id}: ID重複なし`, pass: !scenarioIds.has(scenario.id) });
      scenarioIds.add(scenario.id);
    });
    return results;
  }

  function renderSelfTest(results) {
    const failed = results.filter(result => !result.pass);
    const banner = document.createElement("div");
    banner.id = "drill-selftest-banner";
    banner.dataset.tone = failed.length ? "fail" : "pass";
    banner.innerHTML = `<b>判断ドリル自己チェック：${results.length - failed.length}/${results.length}</b><ul>${results.map(result => `<li data-pass="${result.pass}">${result.pass ? "OK" : "NG"} — ${escapeHtml(result.name)}</li>`).join("")}</ul>`;
    document.body.prepend(banner);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const stored = loadStore();
    if (stored.settings) Object.assign(setupState, stored.settings);
    showScreen("setup");
    renderSetup();
    document.addEventListener("keydown", handleKeyboard);
    if (location.search.includes("selftest")) renderSelfTest(runSelfTest());
  });
})();
