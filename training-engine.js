(() => {
  const DATA = window.MARISA_TRAINING;
  if (!DATA) return;

  const STORAGE_KEY = "marisa-training-state-v1";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = {
    view: "dashboard",
    skillId: null,
    drillId: null,
    feedback: "immediate",
    session: null,
    timer: null,
    nextTimer: null,
    currentDirection: "neutral",
    previousMode: "HOME"
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function loadStore() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        attempts: Array.isArray(value.attempts) ? value.attempts : [],
        viewedSkills: Array.isArray(value.viewedSkills) ? value.viewedSkills : [],
        mission: value.mission || null
      };
    } catch {
      return { attempts: [], viewedSkills: [], mission: null };
    }
  }

  let store = loadStore();

  function saveStore() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch {}
  }

  function getSkill(id) { return DATA.skills.find(item => item.id === id) || null; }
  function getDrill(id) { return DATA.drills.find(item => item.id === id) || null; }
  function todayKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  function addDays(dateString, days) {
    const date = new Date(`${dateString}T12:00:00`);
    date.setDate(date.getDate() + days);
    return todayKey(date);
  }
  function latestAttempt(skillId) {
    return [...store.attempts].reverse().find(item => item.skillId === skillId) || null;
  }
  function dueAttempt(skillId) {
    const latest = latestAttempt(skillId);
    return Boolean(latest?.passed && latest.nextReview && latest.nextReview <= todayKey());
  }
  function skillProgress(skillId) {
    const attempts = store.attempts.filter(item => item.skillId === skillId && item.passed);
    let step = store.viewedSkills.includes(skillId) ? 1 : 0;
    if (attempts.some(item => item.level === "choice")) step = Math.max(step, 2);
    if (attempts.some(item => item.level === "random")) step = Math.max(step, 3);
    if (attempts.some(item => item.level === "retention")) step = Math.max(step, 4);
    if (store.mission?.skillId === skillId && store.mission.successes > 0) step = 5;
    return step;
  }

  function waitForController() {
    return new Promise(resolve => {
      const existing = $("#controller-lab");
      if (existing) return resolve(existing);
      const observer = new MutationObserver(() => {
        const lab = $("#controller-lab");
        if (!lab) return;
        observer.disconnect();
        resolve(lab);
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    });
  }

  function inject(lab) {
    if ($("#training-screen-layer")) return;
    const strip = $(".controller-mode-strip", lab);
    const drillButton = document.createElement("button");
    drillButton.type = "button";
    drillButton.className = "training-mode-button";
    drillButton.dataset.trainingOpen = "true";
    drillButton.innerHTML = `<i>●</i><span>DRILL</span>`;
    strip?.append(drillButton);

    const bezel = $(".screen-bezel", lab);
    const layer = document.createElement("section");
    layer.id = "training-screen-layer";
    layer.className = "training-screen-layer";
    layer.hidden = true;
    layer.setAttribute("aria-label", "格闘ゲーム練習モード");
    layer.innerHTML = `
      <header class="training-layer-header">
        <div><small>TRAINING SYSTEM</small><b data-training-title>今日の練習</b></div>
        <div class="training-layer-actions">
          <span>v${escapeHtml(DATA.version)}</span>
          <button type="button" data-training-home>HOME</button>
          <button type="button" data-training-close aria-label="練習モードを閉じる">×</button>
        </div>
      </header>
      <div class="training-view" data-training-view></div>`;
    bezel?.append(layer);

    const footer = $(".controller-footer", lab);
    const launch = document.createElement("button");
    launch.type = "button";
    launch.className = "system-button training-footer-button";
    launch.dataset.trainingOpen = "true";
    launch.innerHTML = `<span>DRILL</span><b>練習開始</b>`;
    footer?.append(launch);
  }

  function openTraining(view = "dashboard") {
    clearSessionTimers();
    const lab = $("#controller-lab");
    const layer = $("#training-screen-layer");
    if (!lab || !layer) return;
    state.previousMode = $("[data-screen-mode]")?.textContent || "HOME";
    lab.classList.add("training-active");
    layer.hidden = false;
    $("[data-screen-mode]").textContent = "DRILL";
    $(".training-mode-button")?.classList.add("is-active");
    state.view = view;
    render();
  }

  function closeTraining() {
    clearSessionTimers();
    const lab = $("#controller-lab");
    const layer = $("#training-screen-layer");
    lab?.classList.remove("training-active");
    if (layer) layer.hidden = true;
    if ($("[data-screen-mode]")) $("[data-screen-mode]").textContent = state.previousMode;
    $(".training-mode-button")?.classList.remove("is-active");
    state.session = null;
  }

  function render() {
    const root = $("[data-training-view]");
    if (!root) return;
    if (state.view === "dashboard") root.innerHTML = renderDashboard();
    else if (state.view === "skill") root.innerHTML = renderSkill();
    else if (state.view === "drill") root.innerHTML = renderDrill();
    else if (state.view === "result") root.innerHTML = renderResult();
    else if (state.view === "mission") root.innerHTML = renderMission();
    updateHeader();
  }

  function updateHeader() {
    const title = $("[data-training-title]");
    if (!title) return;
    if (state.view === "dashboard") title.textContent = "今日の練習";
    else if (state.view === "skill") title.textContent = getSkill(state.skillId)?.name || "技能";
    else if (state.view === "drill") title.textContent = getDrill(state.drillId)?.title || "ドリル";
    else if (state.view === "result") title.textContent = "結果";
    else title.textContent = "実戦ミッション";
  }

  function renderDashboard() {
    const due = DATA.skills.filter(skill => dueAttempt(skill.id));
    const recommended = due[0] || DATA.skills.slice().sort((a, b) => {
      const aa = latestAttempt(a.id)?.accuracy ?? -1;
      const bb = latestAttempt(b.id)?.accuracy ?? -1;
      return aa - bb;
    })[0];
    const attempts = store.attempts.slice(-5).reverse();
    return `
      <div class="training-dashboard">
        <section class="training-hero-panel">
          <div>
            <p class="training-eyebrow">ONE PROBLEM / ONE SESSION</p>
            <h1>今日、何を直す？</h1>
            <p>技を眺める前に、最近の負け方を一つ選ぶ。問題→判断→トレモ→翌日テストまでつなげる。</p>
          </div>
          <aside class="training-recommendation">
            <small>${due.length ? "REVIEW DUE" : "RECOMMENDED"}</small>
            <b>${escapeHtml(recommended?.name || "正面飛びへの対空")}</b>
            <span>${due.length ? `${due.length}件の翌日テストがあります` : "記録が少ない技能から開始"}</span>
            <button type="button" data-training-skill="${escapeHtml(recommended?.id || "anti-air-front")}">${due.length ? "再テストする" : "ここから始める"}</button>
          </aside>
        </section>

        ${store.mission ? renderMissionStrip() : ""}

        <section class="training-section-block">
          <div class="training-section-title"><small>DIAGNOSE</small><h2>最近の負け方</h2></div>
          <div class="training-issue-grid">
            ${DATA.issues.map(issue => {
              const progress = skillProgress(issue.skillId);
              return `<button type="button" data-training-skill="${escapeHtml(issue.skillId)}">
                <span>${escapeHtml(issue.label)}</span><small>${escapeHtml(issue.detail)}</small>
                <i style="--progress:${progress}/5">${progress}/5</i>
              </button>`;
            }).join("")}
          </div>
        </section>

        <section class="training-dashboard-bottom">
          <div class="training-section-block">
            <div class="training-section-title"><small>REVIEW</small><h2>翌日テスト</h2></div>
            ${due.length ? `<div class="training-due-list">${due.map(skill => `<button type="button" data-training-skill="${escapeHtml(skill.id)}"><b>${escapeHtml(skill.name)}</b><span>ヒントなしで再確認</span></button>`).join("")}</div>` : `<p class="training-empty-copy">今日が期限の再テストはない。合格した課題は翌日、3日後、7日後に戻ってくる。</p>`}
          </div>
          <div class="training-section-block">
            <div class="training-section-title"><small>RECENT</small><h2>最近の記録</h2></div>
            ${attempts.length ? `<div class="training-attempt-list">${attempts.map(attempt => `<div><b>${escapeHtml(getSkill(attempt.skillId)?.name || attempt.skillId)}</b><span>${Math.round(attempt.accuracy * 100)}%・${attempt.level}</span><i class="${attempt.passed ? "pass" : "retry"}">${attempt.passed ? "合格" : "再練習"}</i></div>`).join("")}</div>` : `<p class="training-empty-copy">まだ記録がない。最初は二択10問から始める。</p>`}
          </div>
        </section>
      </div>`;
  }

  function renderMissionStrip() {
    const skill = getSkill(store.mission.skillId);
    return `<section class="training-mission-strip">
      <div><small>MATCH MISSION</small><b>${escapeHtml(skill?.name || "実戦課題")}</b><span>${escapeHtml(store.mission.text)}</span></div>
      <div><strong>${store.mission.successes || 0}</strong><small>実戦成功</small></div>
      <button type="button" data-mission-success>成功した</button>
      <button type="button" data-mission-clear>終了</button>
    </section>`;
  }

  function renderSkill() {
    const skill = getSkill(state.skillId);
    const drill = getDrill(skill?.drillId);
    if (!skill || !drill) return `<p>技能データが見つかりません。</p>`;
    const latest = latestAttempt(skill.id);
    const due = dueAttempt(skill.id);
    const progress = skillProgress(skill.id);
    const labels = ["未着手", "理解", "二択", "ランダム", "翌日", "実戦"];
    if (!store.viewedSkills.includes(skill.id)) {
      store.viewedSkills.push(skill.id);
      saveStore();
    }
    return `
      <div class="training-skill-view">
        <button type="button" class="training-back-link" data-training-home>← 課題一覧</button>
        <section class="training-skill-head">
          <div>
            <p class="training-eyebrow">SKILL / ${escapeHtml(skill.id.toUpperCase())}</p>
            <h1>${escapeHtml(skill.name)}</h1>
            <p>${escapeHtml(skill.summary)}</p>
          </div>
          <div class="training-trigger-response">
            <div><small>見るもの</small><b>${escapeHtml(skill.trigger)}</b></div>
            <i>→</i>
            <div><small>回答</small><b>${escapeHtml(skill.response)}</b></div>
          </div>
        </section>

        ${skill.warning ? `<p class="training-warning">${escapeHtml(skill.warning)}</p>` : ""}

        <section class="training-progress-ladder">
          ${labels.map((label, index) => `<div class="${index <= progress ? "is-done" : ""}${index === progress ? " is-current" : ""}"><span>${index}</span><b>${label}</b></div>`).join("")}
        </section>

        <section class="training-skill-grid">
          <article class="training-setup-card">
            <small>SF6 TRAINING SETUP</small><h2>ゲーム内の設定</h2>
            <ol>${skill.gameSetup.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
            <p>ブラウザは判断を鍛える。実際の入力とタイミングは、この設定をSF6のトレモで再現して確認する。</p>
          </article>
          <article class="training-start-card">
            <small>CHOOSE LEVEL</small><h2>練習を始める</h2>
            <label class="training-feedback-select"><span>答えの表示</span><select data-feedback-mode>
              <option value="immediate" ${state.feedback === "immediate" ? "selected" : ""}>毎問すぐ表示</option>
              <option value="result" ${state.feedback === "result" ? "selected" : ""}>結果まで非表示</option>
            </select></label>
            <button type="button" class="training-level-button" data-start-level="choice"><span>LEVEL 2</span><b>二択・10問</b><small>正解と「何もしない」を分ける</small></button>
            <button type="button" class="training-level-button primary" data-start-level="random"><span>LEVEL 3</span><b>ランダム・20問</b><small>4状況から回答を選ぶ</small></button>
            ${due ? `<button type="button" class="training-level-button retention" data-start-level="retention"><span>REVIEW</span><b>翌日テスト</b><small>ヒントなし・15問</small></button>` : ""}
            ${latest ? `<p class="training-last-score">前回：${Math.round(latest.accuracy * 100)}%／誤反応 ${latest.falsePositive}</p>` : ""}
          </article>
        </section>
      </div>`;
  }

  function sessionConfig(level) {
    if (level === "choice") return { trials: 10, timeLimit: 5200, promptMode: "choice" };
    if (level === "retention") return { trials: 15, timeLimit: 3200, promptMode: "all" };
    return { trials: 20, timeLimit: 3800, promptMode: "all" };
  }

  function shuffled(values) {
    const array = [...values];
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function buildTrials(drill, config) {
    const prompts = config.promptMode === "choice"
      ? drill.prompts.filter(item => drill.choicePromptIds.includes(item.id))
      : drill.prompts;
    const result = [];
    while (result.length < config.trials) result.push(...shuffled(prompts));
    return result.slice(0, config.trials);
  }

  function startSession(level) {
    const skill = getSkill(state.skillId);
    const drill = getDrill(skill?.drillId);
    if (!skill || !drill) return;
    const config = sessionConfig(level);
    state.drillId = drill.id;
    state.session = {
      skillId: skill.id,
      drillId: drill.id,
      level,
      feedback: level === "retention" ? "result" : state.feedback,
      trials: buildTrials(drill, config),
      index: 0,
      timeLimit: config.timeLimit,
      correct: 0,
      missed: 0,
      falsePositive: 0,
      inputError: 0,
      wrong: 0,
      resolved: false,
      feedbackState: null,
      startedAt: Date.now()
    };
    state.currentDirection = "neutral";
    state.view = "drill";
    render();
    beginTrial();
  }

  function renderDrill() {
    const session = state.session;
    const drill = getDrill(session?.drillId);
    if (!session || !drill) return "";
    const prompt = session.trials[session.index];
    const total = session.trials.length;
    return `
      <div class="training-drill-view">
        <div class="training-drill-top">
          <div><small>${escapeHtml(session.level.toUpperCase())}</small><b>${escapeHtml(drill.title)}</b></div>
          <div class="training-trial-counter"><b>${String(session.index + 1).padStart(2, "0")}</b><span>/ ${total}</span></div>
          <button type="button" data-training-stop>中断</button>
        </div>
        <div class="training-score-live">
          <span>正答 <b>${session.correct}</b></span>
          <span>見逃し <b>${session.missed}</b></span>
          <span>誤反応 <b>${session.falsePositive}</b></span>
          <span>入力違い <b>${session.inputError}</b></span>
        </div>
        <section class="training-prompt ${session.feedbackState ? "has-feedback" : ""}" data-training-prompt>
          <div class="training-prompt-tag">${escapeHtml(prompt.tag)}</div>
          <p>相手の行動</p>
          <h1>${escapeHtml(prompt.text)}</h1>
          <span>${escapeHtml(prompt.sub)}</span>
          ${session.feedbackState ? renderFeedback(session.feedbackState, prompt) : `
            <div class="training-answer-instruction">操作盤で回答。何もしないのが正解なら、入力せず待つ。</div>
            <div class="training-special-responses"><button type="button" data-training-response="impact">DI返し</button></div>
            <div class="training-timebar" style="--duration:${session.timeLimit}ms"><i></i></div>`}
        </section>
      </div>`;
  }

  function renderFeedback(feedback, prompt) {
    if (state.session.feedback === "result") {
      return `<div class="training-feedback neutral"><b>記録しました</b><span>次の問題へ進みます。</span></div>`;
    }
    return `<div class="training-feedback ${feedback.correct ? "correct" : "incorrect"}">
      <b>${feedback.correct ? "正解" : feedback.label}</b>
      <span>正しい回答：${escapeHtml(prompt.answer)}</span>
    </div>`;
  }

  function beginTrial() {
    clearTimeout(state.timer);
    const session = state.session;
    if (!session) return;
    session.resolved = false;
    session.feedbackState = null;
    render();
    const prompt = session.trials[session.index];
    state.timer = setTimeout(() => {
      if (!state.session || state.session.resolved) return;
      if (prompt.expected.kind === "wait") resolveTrial({ correct: true, label: "待てた" }, "timeout");
      else resolveTrial({ correct: false, label: "見逃し" }, "timeout");
    }, session.timeLimit);
  }

  function expectedMatches(expected, response) {
    if (expected.kind !== response.kind) return false;
    if (expected.kind === "assist") return expected.key === response.key;
    if (expected.kind === "action") return expected.direction === response.direction && expected.action === response.action;
    return true;
  }

  function classify(expected, response, source) {
    if (source === "timeout") {
      if (expected.kind === "wait") return { type: "correct", correct: true, label: "待てた" };
      return { type: "missed", correct: false, label: "見逃し" };
    }
    if (expectedMatches(expected, response)) return { type: "correct", correct: true, label: "正解" };
    if (expected.kind === "wait") return { type: "falsePositive", correct: false, label: "誤反応" };
    if (expected.kind === "action" && response.kind === "action") return { type: "inputError", correct: false, label: "入力違い" };
    return { type: "wrong", correct: false, label: "判断違い" };
  }

  function resolveTrial(response, source = "input") {
    const session = state.session;
    if (!session || session.resolved) return;
    clearTimeout(state.timer);
    const prompt = session.trials[session.index];
    const result = source === "timeout"
      ? classify(prompt.expected, null, source)
      : classify(prompt.expected, response, source);
    session.resolved = true;
    session[result.type] += 1;
    session.feedbackState = result;
    render();
    navigator.vibrate?.(result.correct ? 18 : [20, 35, 20]);
    state.nextTimer = setTimeout(() => {
      if (!state.session) return;
      if (session.index >= session.trials.length - 1) finishSession();
      else {
        session.index += 1;
        beginTrial();
      }
    }, session.feedback === "immediate" ? 850 : 360);
  }

  function finishSession() {
    clearSessionTimers();
    const session = state.session;
    if (!session) return;
    const total = session.trials.length;
    session.accuracy = session.correct / total;
    const falsePositiveMax = total >= 20 ? 2 : 1;
    session.passed = session.accuracy >= DATA.passRate && session.falsePositive <= falsePositiveMax;
    const previousReviews = store.attempts.filter(item => item.skillId === session.skillId && item.level === "retention" && item.passed).length;
    const interval = session.level === "retention"
      ? DATA.reviewIntervals[Math.min(previousReviews + 1, DATA.reviewIntervals.length - 1)]
      : DATA.reviewIntervals[0];
    const attempt = {
      id: `${Date.now()}-${session.skillId}`,
      date: todayKey(),
      skillId: session.skillId,
      drillId: session.drillId,
      level: session.level,
      total,
      correct: session.correct,
      missed: session.missed,
      falsePositive: session.falsePositive,
      inputError: session.inputError,
      wrong: session.wrong,
      accuracy: session.accuracy,
      passed: session.passed,
      nextReview: session.passed ? addDays(todayKey(), interval) : todayKey(),
      durationSeconds: Math.round((Date.now() - session.startedAt) / 1000)
    };
    session.savedAttempt = attempt;
    store.attempts.push(attempt);
    store.attempts = store.attempts.slice(-200);
    saveStore();
    state.view = "result";
    render();
  }

  function renderResult() {
    const session = state.session;
    const attempt = session?.savedAttempt;
    const skill = getSkill(session?.skillId);
    if (!session || !attempt || !skill) return "";
    const rate = Math.round(attempt.accuracy * 100);
    return `
      <div class="training-result-view ${attempt.passed ? "passed" : "failed"}">
        <section class="training-result-hero">
          <small>${attempt.passed ? "PASSED" : "RETRY"}</small>
          <h1>${rate}<span>%</span></h1>
          <b>${attempt.passed ? "次は実戦と翌日テスト" : "難度を一段戻して再練習"}</b>
          <p>${escapeHtml(skill.name)}</p>
        </section>
        <section class="training-result-grid">
          <div><small>正答</small><b>${attempt.correct}</b></div>
          <div><small>見逃し</small><b>${attempt.missed}</b></div>
          <div><small>誤反応</small><b>${attempt.falsePositive}</b></div>
          <div><small>入力違い</small><b>${attempt.inputError}</b></div>
          <div><small>判断違い</small><b>${attempt.wrong}</b></div>
        </section>
        <section class="training-result-reading">
          <h2>結果の読み方</h2>
          <p>${attempt.falsePositive > 2 ? "技は出ているが、何もしていない相手にも反応している。次は正答率より『押さない』を優先。" : attempt.missed > attempt.inputError ? "回答は分かっているが、状況への気づきが遅い。ゲーム内では録画の種類を減らし、見てから押す時間を作る。" : attempt.inputError ? "状況は見えている。方向とボタンを分解し、ゲーム内で入力だけ10回確認する。" : "判断は安定している。実戦ミッションへ移し、翌日にヒントなしで再確認する。"}</p>
          <span>次回確認：${escapeHtml(attempt.nextReview)}</span>
        </section>
        <div class="training-result-actions">
          <button type="button" data-retry-level="${escapeHtml(attempt.passed ? "random" : "choice")}">${attempt.passed ? "もう一度20問" : "二択へ戻る"}</button>
          <button type="button" class="primary" data-set-mission>実戦ミッションへ</button>
          <button type="button" data-training-home>課題一覧へ</button>
        </div>
      </div>`;
  }

  function setMission() {
    const skill = getSkill(state.session?.skillId || state.skillId);
    if (!skill) return;
    store.mission = { skillId: skill.id, text: skill.mission, createdAt: todayKey(), successes: 0 };
    saveStore();
    state.view = "mission";
    render();
  }

  function renderMission() {
    const mission = store.mission;
    const skill = getSkill(mission?.skillId);
    if (!mission || !skill) return `<div class="training-empty-copy">実戦ミッションはまだありません。</div>`;
    return `
      <div class="training-mission-view">
        <p class="training-eyebrow">TRANSFER TO MATCH</p>
        <h1>次の10試合は、<br>これだけ見る。</h1>
        <div class="training-mission-card">
          <small>${escapeHtml(skill.name)}</small>
          <b>${escapeHtml(mission.text)}</b>
          <p>勝率やコンボ成功率は同時に追わない。試合後に、この判断が一度でもできたかだけ記録する。</p>
        </div>
        <div class="training-mission-count"><b>${mission.successes}</b><span>実戦成功</span></div>
        <div class="training-result-actions">
          <button type="button" class="primary" data-mission-success>成功を1回記録</button>
          <button type="button" data-training-home>練習トップへ</button>
          <button type="button" data-training-close>対戦へ戻る</button>
        </div>
      </div>`;
  }

  function recordMissionSuccess() {
    if (!store.mission) return;
    store.mission.successes = (store.mission.successes || 0) + 1;
    saveStore();
    render();
  }

  function clearSessionTimers() {
    clearTimeout(state.timer);
    clearTimeout(state.nextTimer);
    state.timer = null;
    state.nextTimer = null;
  }

  function handleControlClick(event) {
    const lab = $("#controller-lab");
    if (!lab?.classList.contains("training-active") || state.view !== "drill" || !state.session || state.session.resolved) return false;
    const direction = event.target.closest("[data-direction]");
    if (direction) {
      event.preventDefault();
      event.stopImmediatePropagation();
      state.currentDirection = direction.dataset.direction;
      $$('[data-direction]').forEach(button => button.classList.toggle("is-active", button === direction));
      return true;
    }
    const action = event.target.closest("[data-action]");
    if (action) {
      event.preventDefault();
      event.stopImmediatePropagation();
      resolveTrial({ kind: "action", direction: state.currentDirection, action: action.dataset.action });
      return true;
    }
    const assist = event.target.closest("[data-assist]");
    if (assist) {
      event.preventDefault();
      event.stopImmediatePropagation();
      resolveTrial({ kind: "assist", key: assist.dataset.assist });
      return true;
    }
    return false;
  }

  function bind(lab) {
    lab.addEventListener("click", event => {
      if (handleControlClick(event)) return;
      const open = event.target.closest("[data-training-open]");
      if (open) return openTraining();
      if (event.target.closest("[data-training-close]")) return closeTraining();
      if (event.target.closest("[data-training-home]")) {
        clearSessionTimers();
        state.session = null;
        state.view = "dashboard";
        return render();
      }
      const skillButton = event.target.closest("[data-training-skill]");
      if (skillButton) {
        state.skillId = skillButton.dataset.trainingSkill;
        state.view = "skill";
        return render();
      }
      const levelButton = event.target.closest("[data-start-level]");
      if (levelButton) return startSession(levelButton.dataset.startLevel);
      const response = event.target.closest("[data-training-response]");
      if (response && state.view === "drill") return resolveTrial({ kind: response.dataset.trainingResponse });
      if (event.target.closest("[data-training-stop]")) {
        clearSessionTimers();
        state.session = null;
        state.view = "skill";
        return render();
      }
      const retry = event.target.closest("[data-retry-level]");
      if (retry) return startSession(retry.dataset.retryLevel);
      if (event.target.closest("[data-set-mission]")) return setMission();
      if (event.target.closest("[data-mission-success]")) return recordMissionSuccess();
      if (event.target.closest("[data-mission-clear]")) {
        store.mission = null;
        saveStore();
        return render();
      }
    }, true);

    lab.addEventListener("change", event => {
      if (event.target.matches("[data-feedback-mode]")) state.feedback = event.target.value;
    });

    document.addEventListener("keydown", event => {
      if (!lab.classList.contains("training-active")) {
        if (event.key.toLowerCase() === "t" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
          event.preventDefault();
          openTraining();
        }
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        return closeTraining();
      }
      if (state.view !== "drill" || !state.session || state.session.resolved) return;
      const key = event.key.toLowerCase();
      const directions = { arrowup: "up", arrowdown: "down", arrowleft: "left", arrowright: "right", n: "neutral" };
      const actions = { j: "weak", k: "medium", l: "heavy", i: "special" };
      const assists = { q: "light", w: "medium", e: "heavy" };
      if (directions[key]) {
        event.preventDefault();
        event.stopImmediatePropagation();
        state.currentDirection = directions[key];
        $$('[data-direction]').forEach(button => button.classList.toggle("is-active", button.dataset.direction === state.currentDirection));
      } else if (actions[key]) {
        event.preventDefault();
        event.stopImmediatePropagation();
        resolveTrial({ kind: "action", direction: state.currentDirection, action: actions[key] });
      } else if (assists[key]) {
        event.preventDefault();
        event.stopImmediatePropagation();
        resolveTrial({ kind: "assist", key: assists[key] });
      } else if (key === "d") {
        event.preventDefault();
        event.stopImmediatePropagation();
        resolveTrial({ kind: "impact" });
      }
    }, true);
  }

  async function init() {
    const lab = await waitForController();
    inject(lab);
    bind(lab);
  }

  init();
})();
