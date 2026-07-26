(() => {
  const MOVES = window.MARISA_DATA;
  const DRILL = window.MARISA_DRILL;
  if (!MOVES || !DRILL) return;

  const moveById = Object.fromEntries(MOVES.moves.map(move => [move.id, move]));

  // 制限時間の基準値。実機で必ずズレるため1か所にまとめてある。
  const TIMING = {
    BASE: 600,        // 反応の下駄(ms)
    PER_FRAME: 170,   // 猶予1Fあたりの上乗せ(ms)
    CANCEL: 1600,     // キャンセル(ヒット確認)の固定制限時間
    TARGET: 1400,     // ターゲットコンボ派生の固定制限時間
    JUGGLE: 1800,     // 追撃の固定制限時間
    GRACE: 900         // 時間切れ後、「間に合わず」を許容する猶予(ms)
  };
  const LEVELS = { easy: 1.5, normal: 1.0, hard: 0.7 };
  const CONDITION_ADD = { normal: 0, counter: 2, punish: 4 };
  const CONDITION_LABEL = { normal: "通常ヒット", counter: "カウンター", punish: "パニッシュカウンター" };
  const TYPE_LABEL = { link: "リンク", cancel: "キャンセル", target: "ターゲット", juggle: "追撃", rush: "ラッシュ" };

  // ==========================================================
  // フレーム文字列のパース
  // ==========================================================

  // "12F / 長押し23F" のような併記から、charge指定に応じて片方を取り出す
  function pickVariant(value, charge) {
    const parts = String(value || "").split("/").map(part => part.trim());
    if (charge && parts.length > 1) return parts[1];
    return parts[0];
  }

  function parseFrameNumber(value, charge = false) {
    const variant = pickVariant(value, charge);
    const match = variant.match(/\d+/);
    return match ? Number(match[0]) : null;
  }

  // followups-engine.js の parseHitNumber と同じ考え方。ダウン等は null を返す。
  function parseHitNumber(value, charge = false) {
    const variant = pickVariant(value, charge);
    if (/ダウン|バウンド|追撃|着地|高度|構え|—/.test(variant)) return null;
    const match = variant.match(/[+-]?\d+/);
    return match ? Number(match[0]) : null;
  }

  // ==========================================================
  // 猶予フレーム計算(この機能の核心)
  // ==========================================================

  // 猶予F = (前技のヒット時有利F + 条件加算) − (次技の発生F) + 1
  // 条件加算は「始動技の直後」にのみ適用する。2発目以降は加算しない。
  function linkWindow(prevMove, nextMove, opts) {
    if (!prevMove || !nextMove) return null;
    const hitVal = parseHitNumber(prevMove.hit, !!opts.prevCharge);
    if (hitVal === null) return null;
    const startupVal = parseFrameNumber(nextMove.startup, !!opts.nextCharge);
    if (startupVal === null) return null;
    const addFrames = opts.isStarter ? (CONDITION_ADD[opts.condition] || 0) : 0;
    const rushBonus = opts.rush ? 4 : 0;
    return hitVal + addFrames + rushBonus - startupVal + 1;
  }

  function connects(prevMove, nextMove, opts) {
    const w = linkWindow(prevMove, nextMove, opts);
    return w !== null && w >= 1;
  }

  function timeLimitMs(type, windowFrames, levelKey) {
    const factor = LEVELS[levelKey] || 1;
    if (type === "link" || type === "rush") {
      const frames = windowFrames == null ? 4 : Math.max(windowFrames, 1);
      return Math.round((TIMING.BASE + frames * TIMING.PER_FRAME) * factor);
    }
    if (type === "cancel") return Math.round(TIMING.CANCEL * factor);
    if (type === "target") return Math.round(TIMING.TARGET * factor);
    if (type === "juggle") return Math.round(TIMING.JUGGLE * factor);
    return Math.round(TIMING.BASE * factor);
  }

  // ルートのステップに対する猶予Fを解決する(windowOverride優先)
  function resolveStepWindow(route, stepIndex) {
    const step = route.steps[stepIndex];
    if (step.type !== "link" && step.type !== "rush") return null;
    if (step.windowOverride != null) return step.windowOverride;
    const prevStep = route.steps[stepIndex - 1];
    const prevMove = moveById[prevStep.move];
    const nextMove = moveById[step.move];
    return linkWindow(prevMove, nextMove, {
      condition: route.condition,
      prevCharge: !!prevStep.charge,
      nextCharge: !!step.charge,
      isStarter: prevStep.type === "start",
      rush: step.type === "rush"
    });
  }

  // ==========================================================
  // シャッフル(Fisher-Yates)
  // ==========================================================

  function shuffled(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ==========================================================
  // 誤答の自動生成
  // ==========================================================

  const JUMP_CATEGORY = "ジャンプ";
  function isJump(move) { return move.category === JUMP_CATEGORY; }
  function isStance(move) { return String(move.damage || "").includes("構えのみ"); }

  function buildDistractors(route, stepIndex, count) {
    const step = route.steps[stepIndex];
    const prevStep = route.steps[stepIndex - 1];
    const correctId = step.move;
    const basePool = MOVES.moves.filter(m => m.id !== correctId && !isJump(m) && !isStance(m));

    let candidates;
    if (step.type === "link" || step.type === "rush") {
      const prevMove = moveById[prevStep.move];
      const opts = {
        condition: route.condition,
        prevCharge: !!prevStep.charge,
        isStarter: prevStep.type === "start",
        rush: step.type === "rush",
        nextCharge: false
      };
      // つながらない技だけを残し、「惜しい順(猶予0に近い方)」に並べる
      const scored = basePool.map(m => ({ id: m.id, window: linkWindow(prevMove, m, opts) }))
        .filter(item => item.window === null || item.window < 1);
      scored.sort((a, b) => {
        if (a.window === null && b.window === null) return 0;
        if (a.window === null) return 1;
        if (b.window === null) return -1;
        return b.window - a.window;
      });
      candidates = scored.map(item => item.id);
    } else {
      const correctMove = moveById[correctId];
      const sameCategory = basePool.filter(m => m.category === correctMove.category).map(m => m.id);
      const others = basePool.filter(m => m.category !== correctMove.category).map(m => m.id);
      candidates = sameCategory.concat(others);
    }

    if (candidates.length < count) {
      const fallback = MOVES.moves.filter(m => m.id !== correctId).map(m => m.id);
      candidates = candidates.concat(fallback.filter(id => !candidates.includes(id)));
    }

    const pickPool = candidates.slice(0, Math.max(count * 4, 8));
    return shuffled(pickPool).slice(0, count);
  }

  // ==========================================================
  // 出題生成
  // ==========================================================

  function buildQuestion(route, stepIndex, level, runId) {
    const step = route.steps[stepIndex];
    const windowFrames = resolveStepWindow(route, stepIndex);
    const distractors = buildDistractors(route, stepIndex, 2);
    const choices = shuffled([step.move, ...distractors]);
    return {
      route,
      stepIndex,
      runId,
      correctMoveId: step.move,
      type: step.type,
      note: step.note || "",
      windowFrames,
      timeLimitMs: timeLimitMs(step.type, windowFrames, level),
      choices
    };
  }

  function eligibleRoutes(condition, starterId) {
    return DRILL.routes.filter(r => r.condition === condition && (!starterId || r.starter === starterId));
  }

  // 問題数ぶんの出題列を作る。ルート途中で打ち切らず、完走を保証する
  // (未達の場合は次のルートへ。1ルート単位で必ず完走させるため、
  //  合計は指定数をわずかに超えることがある)。
  function buildSession(config) {
    const eligible = eligibleRoutes(config.condition, config.starterId);
    if (!eligible.length) return { questions: [], routesPlayed: [] };
    let queue = shuffled(eligible);
    let idx = 0;
    let lastId = null;
    let runCounter = 0;
    const questions = [];
    const routesPlayed = [];
    while (questions.length < config.questionCount) {
      if (idx >= queue.length) {
        queue = shuffled(eligible);
        if (eligible.length > 1 && queue[0].id === lastId) {
          const tmp = queue[0]; queue[0] = queue[1]; queue[1] = tmp;
        }
        idx = 0;
      }
      const route = queue[idx++];
      lastId = route.id;
      const runId = runCounter++;
      routesPlayed.push({ runId, routeId: route.id });
      for (let s = 1; s < route.steps.length; s++) {
        questions.push(buildQuestion(route, s, config.level, runId));
      }
    }
    return { questions, routesPlayed };
  }

  // ==========================================================
  // 判定(4値)
  // ==========================================================

  function classify(question, choiceId, timedOut) {
    if (choiceId === null || choiceId === undefined) {
      return { type: "missed", correct: false, label: "見逃し" };
    }
    const isCorrectMove = choiceId === question.correctMoveId;
    if (isCorrectMove && !timedOut) return { type: "correct", correct: true, label: "正解" };
    if (isCorrectMove && timedOut) return { type: "late", correct: false, label: "間に合わず" };
    return { type: "wrong", correct: false, label: "判断違い" };
  }

  // ==========================================================
  // localStorage 記録
  // ==========================================================

  const STORE_KEY = "marisa-drill-v1";

  function loadStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return { attempts: [], settings: null };
      const parsed = JSON.parse(raw);
      return {
        attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
        settings: parsed.settings || null
      };
    } catch (err) {
      return { attempts: [], settings: null };
    }
  }

  function saveStore(store) {
    try {
      store.attempts = store.attempts.slice(-200);
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch (err) {
      // 保存できなくても動作は止めない
    }
  }

  // ==========================================================
  // 表示ヘルパー
  // ==========================================================

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function moveDisplay(id) {
    const move = moveById[id];
    return move ? `${move.name}（${move.command}）` : id;
  }

  // ==========================================================
  // 実行時コントローラ(DOM)
  // ==========================================================

  const els = {};
  let session = null; // { config, questions, index, results, runStats }
  let timers = { main: null, grace: null };
  let questionStartedAt = 0;
  let answered = false;
  let expired = false;

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }

  function cacheEls() {
    els.setupScreen = qs('[data-screen="setup"]');
    els.quizScreen = qs('[data-screen="quiz"]');
    els.resultScreen = qs('[data-screen="result"]');
  }

  function showScreen(name) {
    for (const key of ["setupScreen", "quizScreen", "resultScreen"]) {
      if (els[key]) els[key].hidden = key !== `${name}Screen`;
    }
  }

  // --- 設定画面 ---

  const setupState = {
    condition: "normal",
    starterMode: "random",
    starterId: "",
    level: "normal",
    questionCount: 10
  };

  function starterOptions(condition) {
    const ids = [...new Set(DRILL.routes.filter(r => r.condition === condition).map(r => r.starter))];
    return ids.map(id => ({ id, name: moveById[id] ? moveById[id].name : id }));
  }

  function renderSetup() {
    if (!els.setupScreen) return;
    const options = starterOptions(setupState.condition);
    if (setupState.starterMode === "choose" && !options.some(o => o.id === setupState.starterId)) {
      setupState.starterId = options[0] ? options[0].id : "";
    }

    els.setupScreen.innerHTML = `
      <div class="drill-field">
        <p class="drill-field-label">ヒット状況</p>
        <div class="drill-toggle" data-field="condition">
          ${["normal", "counter", "punish"].map(v => `<button type="button" data-value="${v}" class="${setupState.condition === v ? "is-active" : ""}">${escapeHtml(CONDITION_LABEL[v])}</button>`).join("")}
        </div>
      </div>
      <div class="drill-field">
        <p class="drill-field-label">始動技</p>
        <div class="drill-toggle" data-field="starterMode">
          <button type="button" data-value="random" class="${setupState.starterMode === "random" ? "is-active" : ""}">ランダム</button>
          <button type="button" data-value="choose" class="${setupState.starterMode === "choose" ? "is-active" : ""}">技を選ぶ</button>
        </div>
        <select class="drill-starter-select" ${setupState.starterMode === "choose" ? "" : "hidden"}>
          ${options.map(o => `<option value="${o.id}" ${o.id === setupState.starterId ? "selected" : ""}>${escapeHtml(o.name)}</option>`).join("")}
        </select>
      </div>
      <div class="drill-field">
        <p class="drill-field-label">難易度</p>
        <div class="drill-toggle" data-field="level">
          ${[["easy", "やさしい"], ["normal", "標準"], ["hard", "本気"]].map(([v, label]) => `<button type="button" data-value="${v}" class="${setupState.level === v ? "is-active" : ""}">${label}</button>`).join("")}
        </div>
      </div>
      <div class="drill-field">
        <p class="drill-field-label">問題数</p>
        <div class="drill-toggle" data-field="questionCount">
          ${[10, 20, 30].map(v => `<button type="button" data-value="${v}" class="${setupState.questionCount === v ? "is-active" : ""}">${v}</button>`).join("")}
        </div>
      </div>
      <button type="button" class="drill-start-button" ${options.length ? "" : "disabled"}>ドリル開始</button>
      <p class="drill-setup-note">${options.length ? `${options.length}種類の始動技からルートを収録` : "この条件のルートは未収録です"}</p>
    `;

    qsa(".drill-toggle button", els.setupScreen).forEach(btn => {
      btn.addEventListener("click", () => {
        const field = btn.closest(".drill-toggle").dataset.field;
        const value = field === "questionCount" ? Number(btn.dataset.value) : btn.dataset.value;
        setupState[field] = value;
        renderSetup();
      });
    });
    const select = qs(".drill-starter-select", els.setupScreen);
    if (select) {
      select.addEventListener("change", () => { setupState.starterId = select.value; });
    }
    const startButton = qs(".drill-start-button", els.setupScreen);
    if (startButton) {
      startButton.addEventListener("click", () => {
        const config = {
          condition: setupState.condition,
          starterId: setupState.starterMode === "choose" ? setupState.starterId : null,
          level: setupState.level,
          questionCount: setupState.questionCount
        };
        const store = loadStore();
        store.settings = setupState;
        saveStore(store);
        startSession(config);
      });
    }
  }

  // --- 出題画面 ---

  function startSession(config) {
    const { questions, routesPlayed } = buildSession(config);
    if (!questions.length) return;
    session = {
      config,
      questions,
      index: 0,
      results: [],
      runStats: new Map(routesPlayed.map(r => [r.runId, { routeId: r.routeId, correct: 0, total: 0 }]))
    };
    for (const q of questions) {
      session.runStats.get(q.runId).total++;
    }
    showScreen("quiz");
    showQuestion();
  }

  function clearTimers() {
    if (timers.main) clearTimeout(timers.main);
    if (timers.grace) clearTimeout(timers.grace);
    timers.main = null;
    timers.grace = null;
  }

  function showQuestion() {
    clearTimers();
    answered = false;
    expired = false;
    const question = session.questions[session.index];
    const route = question.route;

    const trail = route.steps.slice(0, question.stepIndex).map((step, i) => {
      const cls = i === 0 ? "is-start" : "";
      const name = moveById[step.move] ? moveById[step.move].name : step.move;
      const chargeTag = step.charge ? '<small>長押し</small>' : "";
      return `<span class="drill-trail-step ${cls}">${escapeHtml(name)}${chargeTag}</span>`;
    }).join('<span class="drill-trail-arrow">→</span>');

    els.quizScreen.innerHTML = `
      <div class="drill-progress"><b>${session.index + 1}</b><span>/ ${session.questions.length}問</span></div>
      <div class="drill-route-trail">${trail}<span class="drill-trail-arrow">→</span><span class="drill-trail-step is-next">？</span></div>
      <div class="drill-type-row">
        <span class="drill-type-badge" data-type="${question.type}">${TYPE_LABEL[question.type] || question.type}</span>
        ${question.windowFrames != null ? `<span class="drill-window-badge">猶予 ${question.windowFrames}F</span>` : ""}
      </div>
      <div class="drill-timebar"><i style="--duration:${question.timeLimitMs}ms"></i></div>
      <div class="drill-choices">
        ${question.choices.map(id => `<button type="button" class="drill-choice" data-move-id="${id}"><b>${escapeHtml(moveById[id].name)}</b><small>${escapeHtml(moveById[id].command)}</small></button>`).join("")}
      </div>
      <div class="drill-feedback" hidden></div>
    `;

    qsa(".drill-choice", els.quizScreen).forEach(btn => {
      btn.addEventListener("click", () => handleAnswer(btn.dataset.moveId));
    });

    questionStartedAt = performance.now();
    timers.main = setTimeout(() => {
      expired = true;
      timers.grace = setTimeout(() => {
        if (!answered) handleAnswer(null);
      }, TIMING.GRACE);
    }, question.timeLimitMs);
  }

  function handleAnswer(choiceId) {
    if (answered) return;
    answered = true;
    clearTimers();
    const question = session.questions[session.index];
    const elapsedMs = Math.round(performance.now() - questionStartedAt);
    const classification = classify(question, choiceId, expired);
    session.results.push({ question, choiceId, classification, elapsedMs });
    const stat = session.runStats.get(question.runId);
    if (classification.type === "correct") stat.correct++;
    renderFeedback(question, classification, choiceId);
  }

  function renderFeedback(question, classification, choiceId) {
    qsa(".drill-choice", els.quizScreen).forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.moveId === question.correctMoveId) btn.classList.add("is-correct");
      if (btn.dataset.moveId === choiceId && choiceId !== question.correctMoveId) btn.classList.add("is-wrong");
    });

    const correctMove = moveById[question.correctMoveId];
    const isFrameType = question.type === "link" || question.type === "rush";
    let reason = "";
    if (classification.type === "late") {
      // 「間に合わず」は技の種別によらず、まず「技は合っている」ことを伝える
      reason = isFrameType
        ? `技は合っています。猶予${question.windowFrames}Fに対して反応が遅れました。`
        : `技は合っています。${TYPE_LABEL[question.type]}の受付時間内に反応が遅れました。`;
    } else if (isFrameType) {
      reason = classification.correct
        ? `猶予${question.windowFrames}F以内に反応できました。`
        : `猶予${question.windowFrames}Fの中では ${escapeHtml(correctMove.name)}（発生${correctMove.startup}）が正解です。`;
    } else {
      reason = classification.correct
        ? `${TYPE_LABEL[question.type]}で正しくつながりました。`
        : `ここは ${escapeHtml(correctMove.name)} への${TYPE_LABEL[question.type]}です。`;
    }

    const feedback = qs(".drill-feedback", els.quizScreen);
    feedback.hidden = false;
    feedback.dataset.tone = classification.correct ? "correct" : "incorrect";
    feedback.innerHTML = `<b>${classification.label}</b><span>${reason}</span>`;

    const nextLabel = session.index + 1 < session.questions.length ? "次へ" : "結果を見る";
    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "drill-next-button";
    nextButton.textContent = nextLabel;
    nextButton.addEventListener("click", advance);
    feedback.appendChild(nextButton);
  }

  function advance() {
    session.index++;
    if (session.index >= session.questions.length) {
      finishSession();
    } else {
      showQuestion();
    }
  }

  // --- 結果画面 ---

  function finishSession() {
    const total = session.results.length;
    const breakdown = { correct: 0, wrong: 0, late: 0, missed: 0 };
    let reactionSum = 0;
    let reactionCount = 0;
    const missedLinks = [];
    for (const r of session.results) {
      breakdown[r.classification.type]++;
      if (r.classification.type !== "missed") {
        reactionSum += r.elapsedMs;
        reactionCount++;
      }
      if (!r.classification.correct) {
        missedLinks.push({
          from: r.question.route.steps[r.question.stepIndex - 1].move,
          to: r.question.correctMoveId,
          type: r.question.type,
          windowFrames: r.question.windowFrames,
          label: r.classification.label
        });
      }
    }
    const completedRoutes = [];
    for (const [, stat] of session.runStats) {
      if (stat.total > 0 && stat.correct === stat.total) {
        const route = DRILL.routes.find(r => r.id === stat.routeId);
        if (route) completedRoutes.push(route);
      }
    }
    const totalDamage = completedRoutes.reduce((sum, r) => sum + r.damage, 0);

    const store = loadStore();
    store.attempts.push({
      at: Date.now(),
      condition: session.config.condition,
      starterId: session.config.starterId,
      level: session.config.level,
      total,
      correct: breakdown.correct,
      accuracy: total ? Math.round((breakdown.correct / total) * 100) : 0,
      avgReactionMs: reactionCount ? Math.round(reactionSum / reactionCount) : null,
      breakdown,
      totalDamage
    });
    saveStore(store);

    renderResult({ total, breakdown, avgReactionMs: reactionCount ? Math.round(reactionSum / reactionCount) : null, missedLinks, completedRoutes, totalDamage });
  }

  function renderResult(summary) {
    showScreen("result");
    const accuracy = summary.total ? Math.round((summary.breakdown.correct / summary.total) * 100) : 0;
    els.resultScreen.innerHTML = `
      <div class="drill-result-hero">
        <small>RESULT</small>
        <h1>${accuracy}<span>%</span></h1>
        <p>${summary.breakdown.correct} / ${summary.total} 問正解</p>
      </div>
      <div class="drill-result-grid">
        <div><small>正解</small><b>${summary.breakdown.correct}</b></div>
        <div><small>判断違い</small><b>${summary.breakdown.wrong}</b></div>
        <div><small>間に合わず</small><b>${summary.breakdown.late}</b></div>
        <div><small>見逃し</small><b>${summary.breakdown.missed}</b></div>
        <div><small>平均反応</small><b>${summary.avgReactionMs != null ? summary.avgReactionMs + "ms" : "—"}</b></div>
      </div>
      ${summary.completedRoutes.length ? `
      <div class="drill-result-damage">
        <h2>完走したルート</h2>
        ${summary.completedRoutes.map(r => `
          <div class="drill-result-route">
            <b>${escapeHtml(r.label)}</b>
            <span>${r.damage}ダメージ${r.damageStatus === "estimated" ? '<i class="drill-badge">概算</i>' : ""}${r.input === "command" ? '<i class="drill-badge">コマンド入力</i>' : ""}</span>
          </div>
        `).join("")}
        <p class="drill-result-total">合計 ${summary.totalDamage} ダメージ</p>
      </div>` : ""}
      ${summary.missedLinks.length ? `
      <div class="drill-result-missed">
        <h2>間違えたリンク</h2>
        <ul>
          ${summary.missedLinks.map(m => `<li>${escapeHtml(moveDisplay(m.from))} → ${escapeHtml(moveDisplay(m.to))}${m.windowFrames != null ? `（猶予${m.windowFrames}F）` : ""} — ${escapeHtml(m.label)}</li>`).join("")}
        </ul>
      </div>` : ""}
      <div class="drill-result-actions">
        <button type="button" class="drill-retry-button primary">もう一度</button>
        <button type="button" class="drill-back-button">設定に戻る</button>
      </div>
    `;
    qs(".drill-retry-button", els.resultScreen).addEventListener("click", () => startSession(session.config));
    qs(".drill-back-button", els.resultScreen).addEventListener("click", () => {
      showScreen("setup");
      renderSetup();
    });
  }

  // ==========================================================
  // 自己チェック(?selftest)
  // ==========================================================

  function runSelfTest() {
    const results = [];
    function assertEqual(actual, expected, name) {
      const pass = actual === expected;
      results.push({ name, pass, detail: pass ? "" : `期待値 ${JSON.stringify(expected)} / 実際 ${JSON.stringify(actual)}` });
    }
    function assertTrue(cond, name) {
      results.push({ name, pass: !!cond, detail: cond ? "" : "条件がfalse" });
    }

    assertEqual(parseHitNumber("+4F"), 4, 'parseHitNumber("+4F") === 4');
    assertEqual(parseHitNumber("±0"), 0, 'parseHitNumber("±0") === 0');
    assertEqual(parseHitNumber("ダウン+35F"), null, 'parseHitNumber("ダウン+35F") === null');
    assertEqual(parseHitNumber("+3F / 長押し+7F", true), 7, 'parseHitNumber charge === 7');
    assertEqual(parseFrameNumber("12F / 長押し23F", true), 23, 'parseFrameNumber charge === 23');

    const crLP = moveById.crLP;
    const aMP = moveById.aMP;
    const bHP = moveById.bHP;

    assertEqual(linkWindow(crLP, crLP, { condition: "normal", isStarter: true }), 1, "crLP→crLP 通常 = 1F");
    assertEqual(linkWindow(crLP, crLP, { condition: "counter", isStarter: true }), 3, "crLP→crLP カウンター = 3F");
    assertEqual(linkWindow(crLP, crLP, { condition: "punish", isStarter: true }), 5, "crLP→crLP パニカン = 5F");
    assertTrue(!connects(crLP, aMP, { condition: "normal", isStarter: true }), "crLP→aMP 通常はつながらない");
    assertEqual(linkWindow(crLP, bHP, { condition: "punish", isStarter: true }), 1, "crLPパニカン→bHP = 1F");

    // 2ステップ目以降には条件加算が乗らないこと
    assertEqual(linkWindow(crLP, crLP, { condition: "punish", isStarter: false }), 1, "非始動リンクには条件加算なし");

    // データ整合
    let allMovesExist = true;
    let allWindowsValid = true;
    let allPrevHitValid = true;
    let allStartTyped = true;
    let allDamageNumeric = true;
    let allDistractorsOk = true;
    for (const route of DRILL.routes) {
      if (route.steps[0].type !== "start") allStartTyped = false;
      if (typeof route.damage !== "number") allDamageNumeric = false;
      route.steps.forEach((step, i) => {
        if (!moveById[step.move]) allMovesExist = false;
        if (i === 0) return;
        if (step.type === "link") {
          const w = resolveStepWindow(route, i);
          if (w === null || w < 1) allWindowsValid = false;
          const prevMove = moveById[route.steps[i - 1].move];
          if (prevMove && parseHitNumber(prevMove.hit, !!route.steps[i - 1].charge) === null && step.windowOverride == null) {
            allPrevHitValid = false;
          }
        }
        const distractors = buildDistractors(route, i, 2);
        if (distractors.length !== 2) allDistractorsOk = false;
      });
    }
    assertTrue(allMovesExist, "全ルートのmoveが48技に実在する");
    assertTrue(allWindowsValid, "全linkステップの猶予Fが1以上");
    assertTrue(allPrevHitValid, "linkステップ直前の技のヒット値がnullでない");
    assertTrue(allStartTyped, "各ルートの最初のステップがtype:start");
    assertTrue(allDamageNumeric, "damageが数値である");
    assertTrue(allDistractorsOk, "誤答生成が必ず2つ返す");

    return results;
  }

  function renderSelfTestBanner(results) {
    const banner = document.createElement("div");
    banner.id = "drill-selftest-banner";
    const failed = results.filter(r => !r.pass);
    banner.dataset.tone = failed.length ? "fail" : "pass";
    banner.innerHTML = `
      <b>自己チェック: ${results.length - failed.length} / ${results.length} パス</b>
      <ul>${results.map(r => `<li data-pass="${r.pass}">${r.pass ? "OK" : "NG"} — ${escapeHtml(r.name)}${r.detail ? ` (${escapeHtml(r.detail)})` : ""}</li>`).join("")}</ul>
    `;
    document.body.prepend(banner);
    // eslint-disable-next-line no-console
    console.log(`[drill selftest] ${results.length - failed.length}/${results.length} passed`, results);
  }

  // ==========================================================
  // 起動
  // ==========================================================

  document.addEventListener("DOMContentLoaded", () => {
    cacheEls();
    if (els.setupScreen) {
      // 保存済み設定の読み込みはここで1回だけ行う。
      // renderSetup()の中で毎回読み直すと、トグル操作の変更が
      // 次の再描画で保存済みの古い値に巻き戻ってしまう。
      const stored = loadStore();
      if (stored.settings) Object.assign(setupState, stored.settings);
      showScreen("setup");
      renderSetup();
    }
    if (location.search.includes("selftest")) {
      renderSelfTestBanner(runSelfTest());
    }
  });
})();
