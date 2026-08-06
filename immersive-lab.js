(() => {
  if (typeof document === "undefined") return;

  const rootWindow = typeof window !== "undefined" ? window : globalThis;
  const STORAGE_KEY = "modern-marisa-lab-session-v1";
  const PAGE_MAP = [
    { file: "index.html", body: "page-home", label: "ホーム", icon: "home" },
    { file: "situations.html", body: "page-situations", label: "状況", icon: "search" },
    { file: "moves.html", body: "page-moves", label: "技", icon: "moves" },
    { file: "advantage.html", body: "page-advantage", label: "有利", icon: "chain" },
    { file: "strategy.html", body: "page-strategy", label: "攻略", icon: "map" },
    { file: "drill.html", body: "page-drill", label: "ドリル", icon: "drill" }
  ];

  const MISSIONS = {
    "page-home": {
      code: "CMD-00",
      label: "SESSION COMMAND",
      title: "今日の一手を決める。",
      description: "次に覚えるコンボと最近の判断傾向を確認し、今日の5問へつなげます。全部を読むより、今の自分に必要な一つを持ち帰ります。",
      icon: "target",
      target: "#home-dashboard",
      primary: "今日の司令盤へ",
      secondary: { href: "drill.html", label: "すぐ5問始める", icon: "drill" }
    },
    "page-situations": {
      code: "FND-01",
      label: "SITUATION MISSION",
      title: "失敗した場面を、一つ特定する。",
      description: "技名から探さず、距離・画面位置・相手の行動を選びます。第一候補を一つ決めたら、その回答が負ける行動まで確認します。",
      icon: "search",
      target: ".situation-finder",
      primary: "場面を選ぶ",
      secondary: { href: "advantage.html", label: "有利後を確認", icon: "chain" }
    },
    "page-moves": {
      code: "MOV-02",
      label: "MOVE MISSION",
      title: "技を一つ、使う場面まで理解する。",
      description: "数値を眺めるだけで終わらず、いつ押すか、ガードされた後に何をするか、ヒット後にどこまで伸ばすかを一組で確認します。",
      icon: "moves",
      target: ".moves-workspace",
      primary: "技を選ぶ",
      secondary: { href: "situations.html", label: "場面から逆引き", icon: "search" }
    },
    "page-advantage": {
      code: "FRM-03",
      label: "FRAME MISSION",
      title: "有利を、次の勝ち方へ変える。",
      description: "プラスの数字だけで満足せず、連続ガード、暴れ潰し、相打ち、割り込み可能を分けます。最後に距離の穴まで確認します。",
      icon: "chain",
      target: ".advantage-section",
      primary: "連携を判定する",
      secondary: { href: "situations.html", label: "実戦状況へ戻る", icon: "search" }
    },
    "page-strategy": {
      code: "PLN-04",
      label: "MATCH PLAN MISSION",
      title: "ラウンドの勝ち筋を、一つ組む。",
      description: "地上、対空、接近後、画面端を別々の知識にせず、一つの試合の流れとして読みます。安定・標準・最大から今使う段階を決めます。",
      icon: "map",
      target: "#strategy-gallery",
      primary: "作戦ボードを開く",
      secondary: { href: "drill.html", label: "判断を試す", icon: "drill" }
    },
    "page-drill": {
      code: "TST-05",
      label: "DECISION TEST",
      title: "知識ではなく、選択の癖を鍛える。",
      description: "カウントダウン後に、状況・ゲージ・目的から完成ルートを選びます。最大を選ぶことではなく、その場面に合う答えへ戻れることを狙います。",
      icon: "drill",
      target: ".drill-stage, #drill-app",
      primary: "判断テストへ",
      secondary: { href: "strategy.html", label: "攻略を復習", icon: "map" }
    }
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

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
  }

  function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function currentFile() {
    return location.pathname.split("/").pop() || "index.html";
  }

  function currentPage() {
    return PAGE_MAP.find(page => document.body.classList.contains(page.body)) || PAGE_MAP[0];
  }

  function icon(name, className = "mi-icon") {
    const api = rootWindow.MARISA_ICONS;
    return api?.svgMarkup ? api.svgMarkup(name, className) : "";
  }

  function pageMission() {
    const bodyClass = Object.keys(MISSIONS).find(name => document.body.classList.contains(name));
    return MISSIONS[bodyClass] || MISSIONS["page-home"];
  }

  function updateSession() {
    const today = localDateKey();
    const file = currentFile();
    const stored = readJson(STORAGE_KEY, null);
    const session = stored?.date === today
      ? stored
      : { date: today, visited: [], openedAt: Date.now(), lastPage: "index.html" };
    const wasVisited = session.visited.includes(file);
    if (!wasVisited) session.visited.push(file);
    session.lastPage = file;
    session.updatedAt = Date.now();
    writeJson(STORAGE_KEY, session);
    return { session, newlyVisited: !wasVisited };
  }

  function progressData() {
    const routeSummary = readJson("modern-marisa-combo-route-summary-v1", {});
    const analysis = readJson("modern-marisa-drill-analysis-v1", {});
    const drillStore = readJson("marisa-decision-drill-v2", { attempts: [] });
    const attempts = Number(analysis.attempts) || (Array.isArray(drillStore.attempts) ? drillStore.attempts.length : 0);
    const accuracy = Number.isFinite(Number(analysis.accuracy)) ? Number(analysis.accuracy) : null;
    const learned = Number(routeSummary.learned) || 0;
    const totalRoutes = Number(routeSummary.total) || rootWindow.MARISA_DRILL?.routes?.length || 0;
    const focus = analysis.dominantMeta?.label || analysis.dominantDiagnostic || (attempts ? "判断を継続" : "基準づくり");
    return { routeSummary, analysis, attempts, accuracy, learned, totalRoutes, focus };
  }

  function injectAtmosphere() {
    if (document.querySelector(".lab-atmosphere")) return;
    const layer = document.createElement("div");
    layer.className = "lab-atmosphere";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = '<i class="lab-orbit"></i><i class="lab-beam"></i>';
    document.body.prepend(layer);
  }

  function injectSessionRibbon(session) {
    if (document.querySelector(".lab-session-ribbon")) return;
    const header = document.querySelector(".site-header");
    if (!header) return;
    const page = currentPage();
    const ribbon = document.createElement("aside");
    ribbon.className = "lab-session-ribbon";
    ribbon.setAttribute("aria-label", "ラボ内の進行状況");
    ribbon.innerHTML = `
      <div class="lab-session-ribbon-inner shell">
        <span class="lab-live-state"><i></i> TRAINING SESSION / ACTIVE</span>
        <nav class="lab-map-track" aria-label="ラボマップ">
          ${PAGE_MAP.map(item => `<a class="lab-map-node${session.visited.includes(item.file) ? " is-visited" : ""}${item.file === page.file ? " is-current" : ""}" href="${item.file}" title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</a>`).join("")}
        </nav>
        <span class="lab-map-copy"><b>${session.visited.length}/6</b> 今日の探索</span>
      </div>`;
    header.insertAdjacentElement("afterend", ribbon);
  }

  function missionStats(session) {
    const page = currentPage();
    const progress = progressData();
    const moveCount = rootWindow.MARISA_DATA?.moves?.length || 0;
    const plusCount = Number(document.querySelector("#plus-move-count")?.textContent) || 0;
    const situationCount = String(document.querySelector("#situation-total-count")?.textContent || "").replace(/[^0-9]/g, "") || "—";
    const routeCount = rootWindow.MARISA_DRILL?.routes?.length || progress.totalRoutes || 0;
    const commonMap = { label: "LAB MAP", value: `${session.visited.length}/6`, note: "今日確認したページ" };

    const byPage = {
      "index.html": [
        { label: "LEARNED ROUTES", value: progress.totalRoutes ? `${progress.learned}/${progress.totalRoutes}` : "—", note: "習得ロードマップ" },
        { label: "DECISIONS", value: String(progress.attempts), note: "記録された判断" },
        { label: "ACCURACY", value: progress.accuracy === null ? "—" : `${progress.accuracy}%`, note: "直近の正答率" },
        commonMap
      ],
      "situations.html": [
        { label: "SITUATIONS", value: situationCount, note: "現在の状況カード" },
        { label: "MISSION", value: "1場面", note: "今日持ち帰る回答" },
        { label: "ANTI-AIR", value: "1BTN", note: "第一候補グラディウス" },
        commonMap
      ],
      "moves.html": [
        { label: "ACTIVE MOVES", value: String(moveCount || "—"), note: "現行モダン技" },
        { label: "READ ORDER", value: "3STEP", note: "用途→数値→派生" },
        { label: "DATA BASIS", value: "AUG 03", note: "Year 4調整基準" },
        commonMap
      ],
      "advantage.html": [
        { label: "PLUS MOVES", value: String(plusCount || "—"), note: "確定値から抽出" },
        { label: "FASTEST", value: "4F", note: "暴れ判定の基準" },
        { label: "CHECK", value: "時間+距離", note: "二つの穴を分離" },
        commonMap
      ],
      "strategy.html": [
        { label: "ACTIVE ROUTES", value: String(routeCount || "—"), note: "現役コンボルート" },
        { label: "LEARNED", value: String(progress.learned), note: "習得済みルート" },
        { label: "TIERS", value: "3", note: "安定・標準・最大" },
        commonMap
      ],
      "drill.html": [
        { label: "DECISIONS", value: String(progress.attempts), note: "累計の判断記録" },
        { label: "ACCURACY", value: progress.accuracy === null ? "—" : `${progress.accuracy}%`, note: "直近の正答率" },
        { label: "FOCUS", value: String(progress.focus).slice(0, 8), note: "現在の判断テーマ" },
        commonMap
      ]
    };
    return byPage[page.file] || [commonMap];
  }

  function resolveTarget(selector) {
    const target = document.querySelector(selector);
    if (!target) return "#";
    if (!target.id) target.id = "lab-primary-station";
    return `#${target.id}`;
  }

  function createMissionBrief(session) {
    if (document.querySelector(".lab-mission-brief")) return;
    const hero = document.querySelector("main > .home-hero, main > .page-hero");
    if (!hero) return;
    const mission = pageMission();
    const targetHref = resolveTarget(mission.target);
    const stats = missionStats(session);
    const section = document.createElement("section");
    section.className = "lab-mission-brief shell";
    section.dataset.code = mission.code;
    section.setAttribute("aria-labelledby", "lab-mission-title");
    section.innerHTML = `
      <div class="lab-mission-copy">
        <p class="lab-mission-label">${escapeHtml(mission.label)}</p>
        <h2 id="lab-mission-title">${escapeHtml(mission.title)}</h2>
        <p>${escapeHtml(mission.description)}</p>
        <div class="lab-mission-actions">
          <a class="lab-mission-action is-primary" href="${targetHref}">${icon(mission.icon)}<span>${escapeHtml(mission.primary)}</span></a>
          <a class="lab-mission-action" href="${escapeHtml(mission.secondary.href)}">${icon(mission.secondary.icon)}<span>${escapeHtml(mission.secondary.label)}</span></a>
        </div>
      </div>
      <div class="lab-mission-stats" aria-label="現在のラボ状況">
        ${stats.map(stat => `<div class="lab-mission-stat"><small>${escapeHtml(stat.label)}</small><b>${escapeHtml(stat.value)}</b><span>${escapeHtml(stat.note)}</span></div>`).join("")}
      </div>`;
    hero.insertAdjacentElement("afterend", section);
    if (!hero.querySelector(".lab-hero-status")) {
      const status = document.createElement("span");
      status.className = "lab-hero-status";
      status.innerHTML = `${icon(mission.icon)}<span>${escapeHtml(mission.code)} / MISSION LOADED</span>`;
      const lead = hero.querySelector(".page-lead, .home-hero-copy");
      (lead || hero).insertAdjacentElement("afterend", status);
    }
  }

  function injectHomeCommandSummary(session) {
    if (!document.body.classList.contains("page-home") || document.querySelector(".lab-command-summary")) return;
    const dashboard = document.querySelector("#home-dashboard");
    const heading = dashboard?.querySelector(".home-dashboard-heading");
    if (!dashboard || !heading) return;
    const progress = progressData();
    const routePercent = progress.totalRoutes ? Math.round((progress.learned / progress.totalRoutes) * 100) : 0;
    const stats = [
      { tone: "reward", label: "ROUTE MASTERY", value: progress.totalRoutes ? `${routePercent}%` : "—", note: progress.totalRoutes ? `${progress.learned}/${progress.totalRoutes}ルート` : "記録待ち" },
      { tone: "accent", label: "DECISION LOG", value: String(progress.attempts), note: "蓄積した判断" },
      { tone: progress.accuracy !== null && progress.accuracy < 60 ? "alert" : "accent", label: "RECENT ACCURACY", value: progress.accuracy === null ? "—" : `${progress.accuracy}%`, note: "直近の正答率" },
      { tone: "reward", label: "LAB MAP", value: `${session.visited.length}/6`, note: "今日の探索範囲" }
    ];
    const summary = document.createElement("div");
    summary.className = "lab-command-summary";
    summary.setAttribute("aria-label", "トレーニング進捗の概要");
    summary.innerHTML = stats.map(stat => `<div class="lab-command-stat is-${stat.tone}"><small>${escapeHtml(stat.label)}</small><b>${escapeHtml(stat.value)}</b><span>${escapeHtml(stat.note)}</span></div>`).join("");
    heading.insertAdjacentElement("afterend", summary);
  }

  function decorateHomeMeters() {
    if (!document.body.classList.contains("page-home")) return;
    const progress = progressData();
    const routeCard = document.querySelector(".home-next-route");
    const tendencyCard = document.querySelector(".home-tendency");
    const addMeter = (card, value, label) => {
      if (!card || card.querySelector(".lab-card-meter")) return;
      const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
      const meter = document.createElement("div");
      meter.className = "lab-card-meter";
      meter.style.setProperty("--lab-meter", safeValue);
      meter.innerHTML = `<i></i><span>${escapeHtml(label)}</span>`;
      const actions = card.querySelector(".home-dashboard-actions");
      if (actions) actions.insertAdjacentElement("beforebegin", meter);
      else card.appendChild(meter);
    };
    const routePercent = progress.totalRoutes ? Math.round((progress.learned / progress.totalRoutes) * 100) : 0;
    addMeter(routeCard, routePercent, `習得 ${routePercent}%`);
    addMeter(tendencyCard, progress.accuracy ?? 0, progress.accuracy === null ? "履歴待ち" : `正答率 ${progress.accuracy}%`);
  }

  function addRevealRhythm(root = document) {
    const targets = root.querySelectorAll([
      "main > section:not(.home-hero):not(.page-hero):not(.lab-mission-brief)",
      ".home-dashboard-card",
      ".home-today-set",
      ".entry-link",
      ".situation-card",
      ".move-card",
      ".playbook-card",
      ".strategy-card",
      ".plus-move-card"
    ].join(","));
    targets.forEach(target => {
      if (target.dataset.labReveal === "true") return;
      target.dataset.labReveal = "true";
      target.classList.add("lab-reveal");
      revealObserver?.observe(target);
    });
  }

  let revealObserver = null;
  function startRevealObserver() {
    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll(".lab-reveal").forEach(element => element.classList.add("is-lab-visible"));
      return;
    }
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-lab-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: .08 });
    addRevealRhythm();
  }

  function showRewardToast(session, newlyVisited) {
    if (!newlyVisited || document.querySelector(".lab-reward-toast")) return;
    const page = currentPage();
    const toast = document.createElement("aside");
    toast.className = "lab-reward-toast";
    toast.setAttribute("aria-live", "polite");
    toast.innerHTML = `<small>LAB MAP UPDATED</small><b>${escapeHtml(page.label)}を確認</b><span>今日の探索 ${session.visited.length}/6。必要な場所だけ回れば十分です。</span>`;
    document.body.appendChild(toast);
    rootWindow.setTimeout(() => toast.classList.add("is-visible"), 700);
    rootWindow.setTimeout(() => toast.classList.remove("is-visible"), 4000);
    rootWindow.setTimeout(() => toast.remove(), 4400);
  }

  function setupPointerLight() {
    if (matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    document.addEventListener("pointermove", event => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        document.body.style.setProperty("--lab-pointer-x", `${event.clientX}px`);
        document.body.style.setProperty("--lab-pointer-y", `${event.clientY}px`);
        frame = 0;
      });
    }, { passive: true });
  }

  function refreshDynamicEnhancements(session) {
    injectHomeCommandSummary(session);
    decorateHomeMeters();
    addRevealRhythm();
  }

  function start() {
    const { session, newlyVisited } = updateSession();
    document.body.classList.add("lab-immersive-ready");
    injectAtmosphere();
    injectSessionRibbon(session);
    setupPointerLight();

    rootWindow.setTimeout(() => {
      createMissionBrief(session);
      injectHomeCommandSummary(session);
      decorateHomeMeters();
      startRevealObserver();
      showRewardToast(session, newlyVisited);
      rootWindow.MARISA_ICONS?.enhance?.(document);
      rootWindow.MARISA_CONTRAST?.audit?.();
    }, 0);

    if (typeof MutationObserver !== "undefined") {
      let timer = 0;
      const observer = new MutationObserver(() => {
        rootWindow.clearTimeout(timer);
        timer = rootWindow.setTimeout(() => refreshDynamicEnhancements(session), 90);
      });
      const main = document.querySelector("main");
      if (main) observer.observe(main, { childList: true, subtree: true });
      rootWindow.MARISA_LAB = { session, observer, refresh: () => refreshDynamicEnhancements(session) };
    } else {
      rootWindow.MARISA_LAB = { session, observer: null, refresh: () => refreshDynamicEnhancements(session) };
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
