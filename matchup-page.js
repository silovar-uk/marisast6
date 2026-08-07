(() => {
  const root = document.querySelector("#matchup-app");
  const data = window.MARISA_MATCHUPS;
  if (!root) return;

  if (!data || !data.validate().ok) {
    root.innerHTML = `<div class="matchup-detail-empty"><b>対策データを読み込めませんでした。</b><p>ページを再読み込みしてください。進捗データはブラウザ内に保持されています。</p></div>`;
    return;
  }

  const PROGRESS_KEY = "modern-marisa-matchup-progress-v1";
  const LOG_KEY = "modern-marisa-matchup-logs-v1";
  const filters = [
    { id: "all", label: "全31キャラ" },
    { id: "weak", label: "要復習" },
    { id: "recent", label: "最近対戦" },
    { id: "BASE", label: "BASE" },
    { id: "YEAR 1", label: "YEAR 1" },
    { id: "YEAR 2", label: "YEAR 2" },
    { id: "YEAR 3", label: "YEAR 3" },
    { id: "YEAR 4", label: "YEAR 4" }
  ];
  const laneOrder = ["poke", "whiff", "place"];
  const laneLabels = { poke: "差し", whiff: "差し返し", place: "置き" };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
  }

  const storedProgress = readJson(PROGRESS_KEY, {});
  const params = new URLSearchParams(location.search);
  const requestedId = params.get("character");
  const initialId = data.byId[requestedId] ? requestedId : (data.byId[storedProgress.selectedId] ? storedProgress.selectedId : "ryu");

  const state = {
    selectedId: initialId,
    filter: "all",
    search: "",
    mode: storedProgress.mode === "lab" ? "lab" : "quick",
    lane: "poke",
    drill: null,
    progress: {
      version: 1,
      selectedId: initialId,
      mode: storedProgress.mode === "lab" ? "lab" : "quick",
      characters: storedProgress.characters || {}
    },
    logs: readJson(LOG_KEY, [])
  };

  function characterProgress(id) {
    if (!state.progress.characters[id]) {
      state.progress.characters[id] = { viewed: 0, weak: false, lanes: {}, attempts: 0, correct: 0, updatedAt: null };
    }
    return state.progress.characters[id];
  }

  function saveProgress() {
    state.progress.selectedId = state.selectedId;
    state.progress.mode = state.mode;
    writeJson(PROGRESS_KEY, state.progress);
  }

  function logsFor(id) {
    return state.logs.filter(item => item.characterId === id);
  }

  function recentCharacterIds() {
    return [...new Set([...state.logs].sort((a, b) => b.at - a.at).map(item => item.characterId))].slice(0, 8);
  }

  function focusFor(id) {
    const recent = logsFor(id).slice(-12).filter(item => item.mistake !== "correct");
    if (!recent.length) return { label: "TODAY'S GUARDRAIL", text: "置きは相手の前進を見た時だけ。一度空振ったらガードか後退へ戻す。", note: "個人基準 / Diamond 5" };
    const counts = recent.reduce((map, item) => ({ ...map, [item.mistake]: (map[item.mistake] || 0) + 1 }), {});
    const key = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    const meta = data.mistakeMeta[key] || data.mistakeMeta.noCuePlace;
    return { label: `RECENT FOCUS / ${meta.short}`, text: meta.prescription, note: `直近${recent.length}件から自動選択` };
  }

  function overallStats() {
    const values = Object.values(state.progress.characters);
    const reviewed = values.filter(item => item.viewed > 0).length;
    const weak = values.filter(item => item.weak).length;
    const attempts = values.reduce((sum, item) => sum + (Number(item.attempts) || 0), 0);
    const correct = values.reduce((sum, item) => sum + (Number(item.correct) || 0), 0);
    return { reviewed, weak, attempts, accuracy: attempts ? Math.round((correct / attempts) * 100) : null };
  }

  function monogram(name) {
    return String(name).replace(/[.・\s]/g, "").slice(0, 1).toUpperCase();
  }

  function confidenceLabel(value) {
    return value === "candidate" ? "要追加検証" : "攻略基準";
  }

  function renderCommand() {
    const stats = overallStats();
    return `<section class="matchup-command" aria-label="キャラ対策の進行状況">
      <div>
        <small>PERSONAL MATCHUP COMMAND</small>
        <h2>合図を見るまで、振らない。</h2>
        <p>置きを消すのではなく、置く条件を限定します。相手が止まったら差す。空振ったら差し返す。前へ入った時だけ一回置く。</p>
      </div>
      <div class="matchup-command-stats">
        <div><small>REVIEWED</small><b>${stats.reviewed}/31</b><span>一度確認した相手</span></div>
        <div><small>NEEDS WORK</small><b>${stats.weak}</b><span>要復習キャラ</span></div>
        <div><small>DECISIONS</small><b>${stats.attempts}</b><span>対策ドリル</span></div>
        <div><small>ACCURACY</small><b>${stats.accuracy === null ? "—" : `${stats.accuracy}%`}</b><span>三択の正答率</span></div>
      </div>
    </section>`;
  }

  function visibleProfiles() {
    const query = state.search.trim().toLocaleLowerCase("ja");
    const recentIds = recentCharacterIds();
    return data.profiles.filter(item => {
      const progress = characterProgress(item.id);
      const searchable = `${item.name} ${item.archetype} ${item.threat} ${item.release}`.toLocaleLowerCase("ja");
      if (query && !searchable.includes(query)) return false;
      if (state.filter === "weak") return progress.weak;
      if (state.filter === "recent") return recentIds.includes(item.id);
      if (state.filter !== "all") return item.release === state.filter;
      return true;
    });
  }

  function renderCards() {
    const items = visibleProfiles();
    if (!items.length) return `<div class="matchup-detail-empty"><b>条件に合うキャラがありません。</b><p>検索語またはフィルターを変更してください。</p></div>`;
    return items.map(item => {
      const progress = characterProgress(item.id);
      const statusClass = progress.weak ? "is-weak" : (progress.viewed ? "is-reviewed" : "");
      const recentCount = logsFor(item.id).length;
      return `<button class="matchup-card${item.id === state.selectedId ? " is-selected" : ""}" type="button" data-character="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.name)}の対策を開く">
        <span class="matchup-monogram" aria-hidden="true">${escapeHtml(monogram(item.name))}</span>
        <span class="matchup-card-copy"><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.archetype)}${recentCount ? `・記録${recentCount}` : ""}</small></span>
        <i class="matchup-card-status ${statusClass}" aria-hidden="true"></i>
      </button>`;
    }).join("");
  }

  function renderBrowser() {
    return `<section class="matchup-browser" aria-labelledby="matchup-browser-title">
      <div class="matchup-browser-head">
        <div><span class="matchup-section-label">SELECT OPPONENT</span><h2 id="matchup-browser-title">相手キャラを選ぶ。</h2></div>
        <label class="matchup-search"><span>キャラ名・特徴・技で検索</span><input id="matchup-search" type="search" value="${escapeHtml(state.search)}" placeholder="例：中足、飛び道具、投げ" autocomplete="off" /></label>
      </div>
      <div class="matchup-filters" role="group" aria-label="キャラ絞り込み">
        ${filters.map(item => `<button class="matchup-filter${state.filter === item.id ? " is-active" : ""}" type="button" data-filter="${escapeHtml(item.id)}">${escapeHtml(item.label)}</button>`).join("")}
      </div>
      <div id="matchup-grid" class="matchup-grid">${renderCards()}</div>
      <div class="matchup-upcoming">
        <h3>YEAR 4 / UPCOMING</h3>
        <div class="matchup-upcoming-list">${data.upcoming.map(item => `<article><b>LOCKED / ${escapeHtml(item.name)}</b><small>${escapeHtml(item.note)}</small></article>`).join("")}</div>
      </div>
    </section>`;
  }

  function renderRules(profile) {
    const group = (type, title, items) => `<section class="matchup-rule-group ${type}"><h3>${title}</h3><ol>${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ol></section>`;
    return `<div class="matchup-rules">${group("is-do", "DO / やること", profile.do)}${group("is-dont", "DON'T / やらないこと", profile.dont)}</div>`;
  }

  function renderNeutralQuick(profile) {
    const lane = profile.neutral[state.lane] || profile.neutral.poke;
    return `<section class="neutral-quick">
      <span class="matchup-section-label">NEUTRAL / THREE DECISIONS</span>
      <div class="neutral-tabs" role="tablist" aria-label="地上戦の判断">
        ${laneOrder.map(key => `<button class="neutral-tab${state.lane === key ? " is-active" : ""}" type="button" role="tab" aria-selected="${state.lane === key}" data-lane="${key}">${laneLabels[key]}</button>`).join("")}
      </div>
      <div class="neutral-panel" role="tabpanel">
        <div><small>見る合図</small><b>${escapeHtml(lane.cue)}</b></div>
        <div><small>マリーザの回答</small><b>${escapeHtml(lane.action)}</b></div>
        <div class="is-stop"><small>中止条件</small><b>${escapeHtml(lane.stop)}</b></div>
      </div>
    </section>`;
  }

  function renderNeutralLab(profile) {
    const progress = characterProgress(profile.id);
    return `<section class="matchup-lab">
      <div class="matchup-lab-intro"><div><span class="matchup-section-label">LAB / COMPARE ALL THREE</span><h3>同時に比べて、選択条件を分ける。</h3></div><p>「何を出すか」より「何を見たか」を先に固定します。確認済みはキャラ別にブラウザへ保存します。</p></div>
      <div class="neutral-lab-grid">
        ${laneOrder.map((key, index) => {
          const lane = profile.neutral[key];
          const complete = Boolean(progress.lanes[key]);
          return `<article class="neutral-lab-card" data-lane="${key}">
            <small>0${index + 1} / ${key.toUpperCase()}</small><h4>${escapeHtml(lane.label)}</h4>
            <dl><div><dt>見る合図</dt><dd>${escapeHtml(lane.cue)}</dd></div><div><dt>回答</dt><dd>${escapeHtml(lane.action)}</dd></div><div><dt>中止条件</dt><dd>${escapeHtml(lane.stop)}</dd></div></dl>
            <button class="matchup-mastery-button${complete ? " is-complete" : ""}" type="button" data-mastery="${key}">${complete ? "✓ 確認済み" : "○ この判断を確認"}</button>
          </article>`;
        }).join("")}
      </div>
    </section>`;
  }

  function createDrill(profile) {
    const lane = laneOrder[Math.floor(Math.random() * laneOrder.length)];
    state.drill = { characterId: profile.id, lane, answered: null };
  }

  function renderDrill(profile) {
    if (!state.drill || state.drill.characterId !== profile.id) createDrill(profile);
    const question = profile.neutral[state.drill.lane];
    const progress = characterProgress(profile.id);
    const result = state.drill.answered;
    return `<section id="matchup-drill" class="matchup-practice">
      <span class="matchup-section-label">30 SEC DECISION DRILL</span>
      <h3>合図から一つ選ぶ。</h3>
      <p>CPU録画の代わりに、判断条件だけを高速確認します。</p>
      <p class="matchup-drill-prompt">相手の合図：<b>${escapeHtml(question.cue)}</b></p>
      <div class="matchup-drill-choices">${laneOrder.map(key => `<button class="matchup-drill-choice" type="button" data-choice="${key}"${result ? " disabled" : ""}>${laneLabels[key]}</button>`).join("")}</div>
      <p class="matchup-drill-result${result ? (result.correct ? " is-correct" : " is-wrong") : ""}">${result ? (result.correct ? `正解。${question.action}` : `今回は「${laneLabels[state.drill.lane]}」。${question.action}`) : `このキャラ：${progress.correct}/${progress.attempts || 0} 正解`}</p>
      ${result ? `<button class="matchup-action" type="button" data-next-drill>次の問題</button>` : ""}
    </section>`;
  }

  function renderPostMatch(profile) {
    return `<section class="matchup-practice">
      <span class="matchup-section-label">POST MATCH / 10 SEC</span>
      <h3>直前の負け方を一つ記録。</h3>
      <p>一番大きかったものだけを選びます。次回のガードレールへ反映されます。</p>
      <div class="matchup-log-buttons">${Object.entries(data.mistakeMeta).map(([key, meta]) => `<button class="matchup-log-button" type="button" data-mistake="${key}">${escapeHtml(meta.label)}</button>`).join("")}</div>
      <p id="matchup-log-note" class="matchup-log-note">${logsFor(profile.id).length ? `この相手の記録 ${logsFor(profile.id).length}件` : "まだ記録はありません。"}</p>
    </section>`;
  }

  function renderDetail() {
    const profile = data.byId[state.selectedId];
    if (!profile) return `<section class="matchup-detail-empty">キャラを選択してください。</section>`;
    const progress = characterProgress(profile.id);
    const focus = focusFor(profile.id);
    return `<section id="matchup-detail" class="matchup-detail" aria-labelledby="matchup-detail-title">
      <header class="matchup-detail-header">
        <div class="matchup-detail-title"><span class="matchup-monogram" aria-hidden="true">${escapeHtml(monogram(profile.name))}</span><div><small>VS / ${escapeHtml(profile.release)} / ${escapeHtml(confidenceLabel(profile.confidence))}</small><h2 id="matchup-detail-title">${escapeHtml(profile.name)}</h2><p>${escapeHtml(profile.archetype)}｜最警戒：${escapeHtml(profile.threat)}</p></div></div>
        <div><div class="matchup-mode-switch" role="group" aria-label="表示モード"><button class="matchup-mode-button${state.mode === "quick" ? " is-active" : ""}" type="button" data-mode="quick">QUICK</button><button class="matchup-mode-button${state.mode === "lab" ? " is-active" : ""}" type="button" data-mode="lab">LAB</button></div><button class="matchup-action" type="button" data-toggle-weak>${progress.weak ? "要復習から外す" : "要復習に追加"}</button></div>
      </header>
      <div class="matchup-focus-bar"><small>${escapeHtml(focus.label)}</small><b>${escapeHtml(focus.text)}</b><span>${escapeHtml(focus.note)}</span></div>
      <div class="matchup-${state.mode}">
        <div class="matchup-thesis"><div><small>ROUND PLAN</small><strong>${escapeHtml(profile.thesis)}</strong></div><div><small>DANGER RANGE</small><strong>${escapeHtml(profile.danger)}</strong><p>危険帯へ入ったら、先に振るより相手の選択を一度見る。</p></div></div>
        ${renderRules(profile)}
        ${state.mode === "quick" ? renderNeutralQuick(profile) : renderNeutralLab(profile)}
      </div>
      <div class="matchup-practice-grid">${renderDrill(profile)}${renderPostMatch(profile)}</div>
    </section>`;
  }

  function render() {
    root.innerHTML = `${renderCommand()}${renderBrowser()}${renderDetail()}`;
  }

  function refreshGrid() {
    const grid = document.querySelector("#matchup-grid");
    if (grid) grid.innerHTML = renderCards();
  }

  function selectCharacter(id, shouldScroll = true) {
    if (!data.byId[id]) return;
    state.selectedId = id;
    state.lane = "poke";
    state.drill = null;
    const progress = characterProgress(id);
    progress.viewed = (Number(progress.viewed) || 0) + 1;
    progress.updatedAt = Date.now();
    saveProgress();
    const url = new URL(location.href);
    url.searchParams.set("character", id);
    history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}#matchup-detail`);
    render();
    if (shouldScroll) document.querySelector("#matchup-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showToast(text) {
    document.querySelector(".matchup-toast")?.remove();
    const toast = document.createElement("div");
    toast.className = "matchup-toast";
    toast.setAttribute("role", "status");
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  root.addEventListener("click", event => {
    const character = event.target.closest("[data-character]");
    if (character) return selectCharacter(character.dataset.character);

    const filter = event.target.closest("[data-filter]");
    if (filter) {
      state.filter = filter.dataset.filter;
      render();
      document.querySelector("#matchup-search")?.focus();
      return;
    }

    const mode = event.target.closest("[data-mode]");
    if (mode) {
      state.mode = mode.dataset.mode;
      saveProgress();
      document.querySelector("#matchup-detail").outerHTML = renderDetail();
      return;
    }

    const mastery = event.target.closest("[data-mastery]");
    if (mastery) {
      const progress = characterProgress(state.selectedId);
      progress.lanes[mastery.dataset.mastery] = !progress.lanes[mastery.dataset.mastery];
      progress.updatedAt = Date.now();
      saveProgress();
      document.querySelector("#matchup-detail").outerHTML = renderDetail();
      refreshGrid();
      return;
    }

    const lane = event.target.closest('[role="tab"][data-lane]');
    if (lane) {
      state.lane = lane.dataset.lane;
      document.querySelector("#matchup-detail").outerHTML = renderDetail();
      return;
    }

    if (event.target.closest("[data-toggle-weak]")) {
      const progress = characterProgress(state.selectedId);
      progress.weak = !progress.weak;
      progress.updatedAt = Date.now();
      saveProgress();
      render();
      showToast(progress.weak ? "要復習へ追加しました。" : "要復習から外しました。");
      return;
    }

    const choice = event.target.closest("[data-choice]");
    if (choice && state.drill && !state.drill.answered) {
      const correct = choice.dataset.choice === state.drill.lane;
      state.drill.answered = { correct, choice: choice.dataset.choice };
      const progress = characterProgress(state.selectedId);
      progress.attempts = (Number(progress.attempts) || 0) + 1;
      if (correct) progress.correct = (Number(progress.correct) || 0) + 1;
      progress.updatedAt = Date.now();
      saveProgress();
      document.querySelector("#matchup-detail").outerHTML = renderDetail();
      return;
    }

    if (event.target.closest("[data-next-drill]")) {
      createDrill(data.byId[state.selectedId]);
      document.querySelector("#matchup-detail").outerHTML = renderDetail();
      return;
    }

    const mistake = event.target.closest("[data-mistake]");
    if (mistake) {
      const key = mistake.dataset.mistake;
      const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, characterId: state.selectedId, mistake: key, at: Date.now() };
      state.logs = [...state.logs, item].slice(-200);
      writeJson(LOG_KEY, state.logs);
      const progress = characterProgress(state.selectedId);
      if (key !== "correct") progress.weak = true;
      progress.updatedAt = Date.now();
      saveProgress();
      render();
      showToast(`${data.byId[state.selectedId].name}戦を記録しました。次回の課題へ反映します。`);
    }
  });

  root.addEventListener("input", event => {
    if (event.target.id !== "matchup-search") return;
    state.search = event.target.value;
    refreshGrid();
  });

  render();
  const selectedProgress = characterProgress(state.selectedId);
  selectedProgress.viewed = Math.max(1, Number(selectedProgress.viewed) || 0);
  selectedProgress.updatedAt = Date.now();
  saveProgress();

  if (location.hash === "#matchup-drill") {
    requestAnimationFrame(() => document.querySelector("#matchup-drill")?.scrollIntoView({ block: "start" }));
  }
})();
