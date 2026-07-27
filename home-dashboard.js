(() => {
  const moveData = window.MARISA_DATA;
  const drill = window.MARISA_DRILL;
  const decision = window.MARISA_DECISION_DRILL;
  const learning = window.MARISA_COMBO_LEARNING;
  const planner = window.MARISA_HOME_PRACTICE_PLAN;
  const analysisApi = window.MARISA_DRILL_ANALYSIS;
  const root = document.querySelector("#home-dashboard");
  if (!moveData || !drill || !decision || !learning || !planner || !root) return;

  const routeById = Object.fromEntries(drill.routes.map(route => [route.id, route]));
  const moveById = Object.fromEntries(moveData.moves.map(move => [move.id, move]));
  const scenarioById = Object.fromEntries(decision.scenarios.map(scenario => [scenario.id, scenario]));
  const categoryById = Object.fromEntries(decision.categories.map(category => [category.id, category]));
  const tierRank = { stable: 0, standard: 1, maximum: 2 };
  const sourceLabel = {
    recent: "直近のミス",
    diagnostic: "判断傾向",
    unseen: "久しぶり",
    daily: "日替わり",
    foundation: "基礎確認"
  };

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

  function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function dateLabel(dateKey) {
    const [, month, day] = dateKey.split("-");
    return `${Number(month)}月${Number(day)}日`;
  }

  function notation(value) {
    return String(value ?? "")
      .replace(/A＋([弱中強])/g, "A$1")
      .replace(/A＋/g, "A")
      .replace(/N＋/g, "N")
      .replace(/＋SP/g, "SP");
  }

  function routeSequence(route) {
    return route.steps.map(step => {
      const command = notation(moveById[step.move]?.command || step.move);
      return `${step.charge ? "長押し " : ""}${command}`;
    }).join(" → ");
  }

  function allLearningItems() {
    return learning.families.flatMap((family, familyIndex) => family.routes.map((item, routeIndex) => ({
      ...item,
      family,
      familyIndex,
      routeIndex
    })));
  }

  function nextRouteFromProgress(summary, learnedIds) {
    if (summary?.nextRouteId && routeById[summary.nextRouteId]) {
      return allLearningItems().find(item => item.routeId === summary.nextRouteId) || null;
    }
    const learned = new Set(learnedIds);
    return allLearningItems()
      .filter(item => !learned.has(item.routeId) && (item.prerequisites || []).every(id => learned.has(id)))
      .sort((a, b) => tierRank[routeById[a.routeId]?.tier] - tierRank[routeById[b.routeId]?.tier] || a.familyIndex - b.familyIndex || a.routeIndex - b.routeIndex)[0] || null;
  }

  function renderFirstRun() {
    return `<article class="home-first-run">
      <div><small>FIRST SESSION</small><h2>最初は、この3つだけ。</h2><p>情報を全部読む前に、入口・安定ルート・判断ドリルを一度つなげます。</p></div>
      <ol>
        <li><span>1</span><div><b>A弱コンボを確認</b><p>近距離でまずダウンまで取る入口を持つ。</p><a href="strategy.html#playbook/combo/assist-light-1320">入口カードを見る</a></div></li>
        <li><span>2</span><div><b>安定ルートを1本覚える</b><p>↓＋弱から弱ディマまで、ゲージを使わず完走する。</p><a href="strategy.html#playbook/combo/starter-light-dima">安定ルートを見る</a></div></li>
        <li><span>3</span><div><b>判断ドリルをやる</b><p>3→2→1のあと、完成コンボを状況から選ぶ。</p><a href="drill.html">6問から始める</a></div></li>
      </ol>
    </article>`;
  }

  function renderNextRoute(item, progress) {
    if (!item) {
      return `<article class="home-dashboard-card home-next-route is-complete">
        <header><small>NEXT COMBO</small><span>24 / 24</span></header>
        <h2>習得ロードマップ完了</h2>
        <p>新しいルートを増やすより、最近の判断ミスを使って維持練習へ進みます。</p>
        <div class="home-dashboard-actions"><a href="strategy.html">習得状況を見る</a><a href="drill.html">判断ドリルへ</a></div>
      </article>`;
    }

    const route = routeById[item.routeId];
    const tier = drill.tierMeta?.[route.tier];
    const learned = Number(progress?.learned) || 0;
    const total = Number(progress?.total) || drill.routes.length;
    const cardId = learning.routeToCard[item.routeId];
    const scenarioId = learning.scenarioByRoute[item.routeId];
    return `<article class="home-dashboard-card home-next-route" data-tier="${escapeHtml(route.tier)}">
      <header><small>NEXT COMBO</small><span>${learned} / ${total}</span></header>
      <p class="home-dashboard-tag">${escapeHtml(tier?.label || route.tier)}｜${escapeHtml(item.family.label)}</p>
      <h2>${escapeHtml(route.label)}</h2>
      <strong>${escapeHtml(routeSequence(route))}</strong>
      <p>${escapeHtml(route.learning?.use || "")}</p>
      <div class="home-dashboard-actions">
        <a href="strategy.html#playbook/combo/${encodeURIComponent(cardId)}">攻略を見る</a>
        ${scenarioId ? `<a href="drill.html?scenario=${encodeURIComponent(scenarioId)}">1問練習</a>` : ""}
      </div>
    </article>`;
  }

  function renderTendency(analysis) {
    const attempts = Number(analysis?.attempts) || 0;
    const dominantKey = analysis?.dominantDiagnostic;
    const meta = analysis?.dominantMeta || analysisApi?.diagnosticMeta?.[dominantKey] || null;
    if (!attempts || !meta) {
      return `<article class="home-dashboard-card home-tendency is-empty">
        <header><small>RECENT DECISION</small><span>履歴なし</span></header>
        <h2>まず判断の基準をつくる。</h2>
        <p>6問やると、基準未定着・伸ばしすぎ・リターン不足・条件違い・時間切れの傾向がここに出ます。</p>
        <div class="home-dashboard-actions"><a href="drill.html">判断ドリルを始める</a></div>
      </article>`;
    }
    const count = Number(analysis.diagnostics?.[dominantKey]) || 0;
    return `<article class="home-dashboard-card home-tendency" data-diagnostic="${escapeHtml(dominantKey)}">
      <header><small>RECENT DECISION</small><span>直近${attempts}回・正答率${analysis.accuracy ?? "—"}%</span></header>
      <p class="home-dashboard-tag">最近もっとも多い傾向</p>
      <h2>${escapeHtml(meta.label)} <em>${count}回</em></h2>
      <strong>${escapeHtml(meta.short)}</strong>
      <p>${escapeHtml(meta.description)}</p>
      <div class="home-dashboard-actions"><a href="drill.html">傾向を意識して練習</a></div>
    </article>`;
  }

  function renderToday(plan) {
    const items = plan.items.map((item, index) => {
      const scenario = scenarioById[item.scenarioId];
      return `<li>
        <span>${index + 1}</span>
        <div><small>${escapeHtml(sourceLabel[item.source] || item.source)}・${escapeHtml(categoryById[scenario.category]?.label || scenario.category)}</small><b>${escapeHtml(scenario.title)}</b><p>${escapeHtml(scenario.prompt)}</p></div>
      </li>`;
    }).join("");
    return `<article class="home-today-set">
      <div class="home-today-heading">
        <div><small>TODAY'S FIVE / ${escapeHtml(dateLabel(plan.dateKey))}</small><h2>今日の5問</h2><p>直近のミス、判断傾向、久しぶりの問題、日替わりを重複なしで組みます。今日は更新しても同じ5問です。</p></div>
        <a href="${escapeHtml(plan.href)}">3・2・1で始める</a>
      </div>
      <ol>${items}</ol>
    </article>`;
  }

  function render() {
    const progress = readJson("modern-marisa-combo-route-summary-v1", null);
    const learnedIds = readJson(learning.storageKey, []);
    const store = readJson("marisa-decision-drill-v2", { attempts: [] });
    let analysis = readJson("modern-marisa-drill-analysis-v1", null);
    if ((!analysis || !analysis.attempts) && analysisApi) {
      analysis = analysisApi.buildHistorySummary(Array.isArray(store.attempts) ? store.attempts : []);
    }

    const next = nextRouteFromProgress(progress, Array.isArray(learnedIds) ? learnedIds : []);
    const dateKey = localDateKey();
    const plan = planner.generate({
      count: 5,
      dateKey,
      analysisSummary: analysis || {},
      attempts: Array.isArray(store.attempts) ? store.attempts : []
    });
    const firstRun = (!Array.isArray(learnedIds) || learnedIds.length === 0) && !(analysis?.attempts > 0);
    const progressForDisplay = progress || { learned: Array.isArray(learnedIds) ? learnedIds.length : 0, total: drill.routes.length };

    root.innerHTML = `
      <div class="home-dashboard-heading">
        <div><p class="page-kicker">TODAY'S TRAINING</p><h2>開いたら、次が決まる。</h2></div>
        <p>習得状況と判断履歴は、このブラウザの中だけに保存します。</p>
      </div>
      ${firstRun ? renderFirstRun() : ""}
      <div class="home-dashboard-grid">
        ${renderNextRoute(next, progressForDisplay)}
        ${renderTendency(analysis)}
      </div>
      ${renderToday(plan)}`;
  }

  render();
})();
