(() => {
  const rootWindow = typeof window !== "undefined" ? window : globalThis;

  const ICONS = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    moves: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    link: '<path d="M9.5 14.5 14.5 9.5"/><path d="M7.5 17.5 5 20a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5 0" transform="translate(2 -2)"/><path d="m16.5 6.5 2.5-2.5a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 0" transform="translate(-2 2)"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/>',
    drill: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 8 1.5 1.5L12 7M8 14l1.5 1.5L12 13M14 9h3M14 15h3"/>',
    shield: '<path d="M12 3 20 6v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
    bolt: '<path d="M13 2 5 14h6l-1 8 9-13h-6Z"/>',
    chain: '<path d="M8.5 15.5 6 18a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5 0l1 1" transform="translate(2 -2)"/><path d="m15.5 8.5 2.5-2.5a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 0l-1-1" transform="translate(-2 2)"/><path d="m9 15 6-6"/>',
    split: '<path d="M6 4v4c0 4 3 4 6 4s6 0 6 4v4"/><path d="M6 20v-4c0-4 3-4 6-4s6 0 6-4V4"/><path d="m3 7 3 3 3-3M15 17l3 3 3-3"/>',
    swap: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    wall: '<path d="M3 4h18v16H3Z"/><path d="M3 9h18M3 15h18M8 4v5M16 4v5M6 9v6M14 9v6M9 15v5M17 15v5"/>',
    fire: '<path d="M12 22c4 0 7-2.7 7-6.5 0-3.2-2-5.2-4.4-7.7.2 2.5-1 3.6-2 4.1.1-3.8-2-6.3-4.2-8.9.2 3.4-3.4 5.9-3.4 10.8C5 18.7 7.9 22 12 22Z"/><path d="M9.5 18.5c0-1.7 1.2-2.7 2.5-4.2 1.4 1.5 2.5 2.5 2.5 4.2 0 1.5-1.1 2.5-2.5 2.5s-2.5-1-2.5-2.5Z"/>',
    star: '<path d="m12 2 2.6 6.2L21 9l-4.8 4.3L17.6 20 12 16.5 6.4 20l1.4-6.7L3 9l6.4-.8Z"/>',
    low: '<path d="M4 7h16M12 5v12"/><path d="m8 14 4 4 4-4"/><path d="M5 21h14"/>',
    jump: '<path d="M5 18c3.5-8 10.5-8 14 0"/><path d="M12 18V5"/><path d="m8 9 4-4 4 4"/>',
    ruler: '<path d="m4 17 13-13 3 3L7 20H4Z"/><path d="m9 12 3 3M12 9l3 3M15 6l3 3"/>',
    impact: '<path d="m12 2 2.2 5.1L20 4l-3.1 5.8L22 12l-5.1 2.2L20 20l-5.8-3.1L12 22l-2.2-5.1L4 20l3.1-5.8L2 12l5.1-2.2L4 4l5.8 3.1Z"/><circle cx="12" cy="12" r="2.3"/>',
    stable: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 8"/>',
    scale: '<path d="M12 3v18M6 6h12M5 6l-3 6h6ZM19 6l-3 6h6ZM8 21h8"/>',
    max: '<path d="M4 20 10 8l3 6 3-10 4 16Z"/><path d="M3 20h18"/>',
    battery: '<rect x="3" y="7" width="17" height="10" rx="2"/><path d="M20 10h2v4h-2M6 10v4M10 10v4M14 10v4"/>',
    super: '<path d="M12 2 21 12 12 22 3 12Z"/><path d="m12 7 1.5 3.5L17 12l-3.5 1.5L12 17l-1.5-3.5L7 12l3.5-1.5Z"/>',
    warning: '<path d="M12 3 22 21H2Z"/><path d="M12 9v5M12 18h.01"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 15h9"/>',
    repeat: '<path d="M20 7h-8a7 7 0 1 0 6.5 9.5"/><path d="m17 4 3 3-3 3"/><path d="M8 9v6l4 2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    guard: '<path d="M4 4h16v7c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10Z"/><path d="M8 10h8"/>',
    walk: '<path d="M9 4c1.4 0 2.5 1.1 2.5 2.5S10.4 9 9 9 6.5 7.9 6.5 6.5 7.6 4 9 4Z"/><path d="m10 10 3 3 4 1M10 10l-3 4-4 1M13 13l-1 7M7 14l2 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    up: '<path d="M12 21V4"/><path d="m5 11 7-7 7 7"/>',
    grab: '<path d="M4 9v8a3 3 0 0 0 3 3h3M20 9v8a3 3 0 0 1-3 3h-3"/><path d="M8 12V5a2 2 0 0 1 4 0v7M16 12V7a2 2 0 0 0-4 0v5"/>'
  };

  const CONCEPT_RULES = [
    { id: "wall", icon: "wall", label: "壁・端", re: /壁|画面端|端攻め|コーナー/iu },
    { id: "burnout", icon: "fire", label: "バーンアウト", re: /バーンアウト|burnout/iu },
    { id: "stun", icon: "star", label: "スタン", re: /スタン|stun/iu },
    { id: "low", icon: "low", label: "下段", re: /下段|中足|大足|しゃがみ中K|crMK/iu },
    { id: "anti-air", icon: "jump", label: "対空", re: /対空|飛び|ジャンプ|空対空/iu },
    { id: "impact", icon: "impact", label: "インパクト", re: /インパクト|impact/iu },
    { id: "true", icon: "chain", label: "連続ガード", re: /連続ガード|完全に埋まる|true block/iu },
    { id: "trap", icon: "bolt", label: "暴れ潰し", re: /暴れ潰し|frame trap/iu },
    { id: "trade", icon: "swap", label: "相打ち", re: /相打ち|trade/iu },
    { id: "interrupt", icon: "split", label: "割り込み可", re: /割り込み|interrupt/iu },
    { id: "punish", icon: "warning", label: "確定反撃", re: /確定反撃|確反|punishable/iu },
    { id: "stable", icon: "stable", label: "安定", re: /安定/iu },
    { id: "standard", icon: "scale", label: "標準", re: /標準/iu },
    { id: "maximum", icon: "max", label: "最大", re: /最大|倒し切り|リーサル|maximum/iu },
    { id: "plus", icon: "up", label: "有利", re: /有利|plus|\+\d+F/iu },
    { id: "safe", icon: "shield", label: "安全", re: /安全|反撃なし|safe/iu },
    { id: "super", icon: "super", label: "SA", re: /(?:^|\s)SA[123]?(?:\s|$)|スーパー/iu },
    { id: "gauge", icon: "battery", label: "ゲージ", re: /ゲージ|ドライブ|OD/iu },
    { id: "distance", icon: "ruler", label: "距離", re: /距離|先端|間合い/iu },
    { id: "training", icon: "repeat", label: "練習", re: /練習|トレーニング|training|practice|反復/iu },
    { id: "candidate", icon: "flask", label: "候補", re: /候補|再計測|未計測|candidate/iu },
    { id: "startup", icon: "clock", label: "発生", re: /発生|startup/iu },
    { id: "guard", icon: "guard", label: "ガード", re: /ガード|block/iu },
    { id: "throw", icon: "grab", label: "投げ", re: /投げ|エンフォルド/iu },
    { id: "combo", icon: "link", label: "コンボ", re: /コンボ|ルート|派生/iu }
  ];

  const NAV_ICONS = {
    "index.html": "home",
    "situations.html": "search",
    "moves.html": "moves",
    "advantage.html": "chain",
    "strategy.html": "map",
    "drill.html": "drill"
  };

  const PAGE_LEGENDS = {
    "page-home": [
      { icon: "search", label: "状況" },
      { icon: "ruler", label: "理解" },
      { icon: "repeat", label: "反復" }
    ],
    "page-situations": [
      { icon: "ruler", label: "距離" },
      { icon: "target", label: "相手行動" },
      { icon: "shield", label: "第一候補" }
    ],
    "page-moves": [
      { icon: "target", label: "用途" },
      { icon: "clock", label: "発生" },
      { icon: "link", label: "派生" }
    ],
    "page-advantage": [
      { icon: "up", label: "有利" },
      { icon: "chain", label: "連続ガード" },
      { icon: "ruler", label: "距離" }
    ],
    "page-strategy": [
      { icon: "map", label: "試合設計" },
      { icon: "jump", label: "対空" },
      { icon: "wall", label: "画面端" }
    ],
    "page-drill": [
      { icon: "stable", label: "安定" },
      { icon: "scale", label: "標準" },
      { icon: "max", label: "最大" }
    ]
  };

  const GUIDE_CARD_MAP = {
    "困った場面から逆算する": { icon: "search", summary: "場面から入口を選ぶ。" },
    "数字を次の行動へ変える": { icon: "ruler", summary: "数値は判断のために使う。" },
    "一度に一つだけ固定する": { icon: "target", summary: "練習単位を小さくする。" },
    "最初に試す行動を決める": { icon: "target", summary: "迷った時に戻る基準を持つ。" },
    "位置と距離を省略しない": { icon: "ruler", summary: "技名だけでなく距離まで見る。" },
    "相手の反応を三つ録画する": { icon: "repeat", summary: "勝ち負けを再現して比べる。" },
    "発生は、間に合うかを見る": { icon: "clock", summary: "発生とリーチをセットで見る。" },
    "有利、安全、不利を分ける": { icon: "shield", summary: "攻守の順番を明確にする。" },
    "確定値と候補を混ぜない": { icon: "flask", summary: "未計測の情報は正解にしない。" },
    "まず再現率の高い基準を持つ": { icon: "target", summary: "迷った時に戻れる軸を作る。" },
    "安定・標準・最大を場面で選ぶ": { icon: "scale", summary: "目的に合わせて三段階を選ぶ。" },
    "触った後は有利と距離を見る": { icon: "chain", summary: "時間と距離の両方で攻める。" },
    "安定へ戻る判断も正解になる": { icon: "stable", summary: "完走率も正解の条件にする。" },
    "ミスの種類を区別する": { icon: "warning", summary: "原因ごとに練習を変える。" },
    "間違えた理由を別ページで読む": { icon: "map", summary: "失敗から復習先へ戻る。" }
  };

  const ADVANTAGE_SECTION_MAP = {
    "有利は、先に動ける時間。": { icon: "up", summary: "先に動ける時間を、次の行動へ使う。" },
    "埋まるかは、次の技まで計算する。": { icon: "chain", summary: "発生差から、相手が動ける隙間を計算する。" },
    "時間が埋まっても、距離が空く。": { icon: "ruler", summary: "フレームと実際の間合いを別々に確認する。" },
    "ガードされて有利な技。": { icon: "guard", summary: "現行データで確定したプラス技だけを見る。" }
  };

  const ENTRY_ICON_MAP = {
    "situations.html": "search",
    "moves.html": "moves",
    "strategy.html": "map",
    "drill.html": "drill",
    "advantage.html": "chain"
  };

  const FIRST_SIX_MAP = {
    crLP: "bolt",
    stMK: "ruler",
    aMP: "target",
    gladiusL: "jump",
    phalanxM: "walk",
    sa2: "super"
  };

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function resolveConcepts(text, limit = 3) {
    const source = normalizeText(text);
    const output = [];
    const used = new Set();
    for (const rule of CONCEPT_RULES) {
      if (!rule.re.test(source) || used.has(rule.icon)) continue;
      output.push({ id: rule.id, icon: rule.icon, label: rule.label });
      used.add(rule.icon);
      if (output.length >= limit) break;
    }
    return output;
  }

  function svgMarkup(name, className = "mi-icon") {
    const drawing = ICONS[name] || ICONS.info;
    return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${drawing}</svg>`;
  }

  const api = {
    version: "1.0.0",
    icons: Object.keys(ICONS),
    resolveConcepts,
    svgMarkup
  };
  rootWindow.MARISA_ICONS = api;

  if (typeof document === "undefined") return;

  function createSvg(name, className = "mi-icon") {
    const template = document.createElement("template");
    template.innerHTML = svgMarkup(name, className).trim();
    return template.content.firstElementChild;
  }

  function iconToken(name, className = "mi-icon-badge") {
    const token = document.createElement("span");
    token.className = className;
    token.dataset.miIcon = name;
    token.setAttribute("aria-hidden", "true");
    token.appendChild(createSvg(name));
    return token;
  }

  function addInlineIcon(element, name) {
    if (!element || element.dataset.miIconified === "true") return;
    element.classList.add("mi-inline-label");
    element.prepend(createSvg(name));
    element.dataset.miIcon = name;
    element.dataset.miIconified = "true";
  }

  function addHeadingIcon(heading, name) {
    if (!heading || heading.dataset.miIconified === "true") return;
    heading.classList.add("mi-heading-with-icon");
    heading.prepend(iconToken(name));
    heading.dataset.miIconified = "true";
  }

  function conceptChip(concept) {
    const chip = document.createElement("span");
    chip.className = "mi-concept-chip";
    chip.dataset.miIcon = concept.icon;
    chip.append(createSvg(concept.icon), document.createTextNode(concept.label));
    return chip;
  }

  function addConceptRow(card, host, forcedText = "") {
    if (!card || !host || card.dataset.miConcepts === "true") return;
    const concepts = resolveConcepts(`${forcedText} ${card.textContent}`, 3);
    if (!concepts.length) return;
    const row = document.createElement("div");
    row.className = "mi-concept-row";
    concepts.forEach(concept => row.appendChild(conceptChip(concept)));
    host.appendChild(row);
    card.dataset.miConcepts = "true";
  }

  function pageClass() {
    return Object.keys(PAGE_LEGENDS).find(name => document.body?.classList.contains(name)) || "page-home";
  }

  function decorateNavigation() {
    document.querySelectorAll(".site-tabs a").forEach(link => {
      if (link.dataset.miNav === "true") return;
      const href = String(link.getAttribute("href") || "").split("?")[0];
      const icon = NAV_ICONS[href];
      if (!icon) return;
      link.prepend(iconToken(icon, "mi-nav-icon"));
      link.dataset.miNav = "true";
    });
  }

  function decoratePageHero() {
    const name = pageClass();
    const legendItems = PAGE_LEGENDS[name];
    const hero = document.querySelector(".home-hero, .page-hero");
    if (!hero || !legendItems || hero.querySelector(".mi-page-legend")) return;

    const legend = document.createElement("div");
    legend.className = "mi-page-legend";
    legend.setAttribute("aria-label", "このページで扱う内容");
    legendItems.forEach(item => {
      const chip = document.createElement("span");
      chip.className = "mi-legend-chip";
      chip.dataset.miIcon = item.icon;
      chip.append(createSvg(item.icon), document.createTextNode(item.label));
      legend.appendChild(chip);
    });

    const host = hero.querySelector(".page-hero-grid > div:first-child") || hero;
    host.appendChild(legend);

    const kicker = hero.querySelector(":scope > .page-kicker, .page-hero-grid > div:first-child > .page-kicker");
    const pageIcon = legendItems[0]?.icon;
    if (kicker && pageIcon) addInlineIcon(kicker, pageIcon);
  }

  function decorateEntryLinks() {
    document.querySelectorAll(".entry-link").forEach(link => {
      if (link.querySelector(":scope > .mi-entry-icon")) return;
      const href = String(link.getAttribute("href") || "").split("?")[0];
      const icon = ENTRY_ICON_MAP[href] || "target";
      link.prepend(iconToken(icon, "mi-entry-icon"));
    });
  }

  function decorateMethodSteps() {
    const icons = ["search", "map", "drill"];
    document.querySelectorAll(".method-steps article").forEach((article, index) => {
      if (article.querySelector(":scope > .mi-step-icon")) return;
      article.prepend(iconToken(icons[index] || "target", "mi-step-icon"));
    });
  }

  function decorateFirstSix() {
    document.querySelectorAll(".first-six-list a").forEach(link => {
      if (link.querySelector(":scope > .mi-first-six-icon")) return;
      const move = new URL(link.href, location.href).searchParams.get("move");
      const icon = FIRST_SIX_MAP[move] || resolveConcepts(link.textContent, 1)[0]?.icon || "moves";
      link.prepend(iconToken(icon, "mi-first-six-icon"));
    });
  }

  function compactExplanation(container, summaryText, iconName, className = "mi-section-details") {
    if (!container || container.dataset.miCompacted === "true") return;
    const paragraphs = Array.from(container.querySelectorAll(":scope > p"));
    if (!paragraphs.length) return;

    const brief = document.createElement("p");
    brief.className = "mi-section-brief";
    brief.dataset.miIcon = iconName;
    brief.append(createSvg(iconName), document.createTextNode(summaryText));

    const details = document.createElement("details");
    details.className = className;
    const summary = document.createElement("summary");
    summary.append(createSvg("info"), document.createTextNode("詳しい説明"));
    const body = document.createElement("div");
    body.className = "mi-section-details-body";
    paragraphs.forEach(paragraph => body.appendChild(paragraph));
    details.append(summary, body);
    container.append(brief, details);
    container.dataset.miCompacted = "true";
  }

  function decorateEditorialGuides() {
    document.querySelectorAll(".editorial-guide article").forEach(article => {
      const heading = article.querySelector("h3");
      const config = GUIDE_CARD_MAP[normalizeText(heading?.textContent)];
      if (!heading || !config) return;

      if (!article.querySelector(":scope > .mi-guide-icon")) {
        article.prepend(iconToken(config.icon, "mi-icon-badge mi-guide-icon"));
      }

      if (!article.querySelector(":scope > .mi-card-summary")) {
        const summary = document.createElement("p");
        summary.className = "mi-card-summary";
        summary.textContent = config.summary;
        heading.insertAdjacentElement("afterend", summary);
      }

      const paragraph = article.querySelector(":scope > p:not(.mi-card-summary)");
      if (paragraph && !article.querySelector(":scope > .mi-explanation")) {
        const details = document.createElement("details");
        details.className = "mi-explanation";
        const summary = document.createElement("summary");
        summary.append(createSvg("info"), document.createTextNode("説明を読む"));
        const body = document.createElement("div");
        body.className = "mi-explanation-body";
        body.appendChild(paragraph);
        details.append(summary, body);
        const link = article.querySelector(":scope > .editorial-guide-link");
        article.insertBefore(details, link || null);
      }
      article.dataset.miGuide = "true";
    });
  }

  function decorateAdvantagePage() {
    document.querySelectorAll(".advantage-heading").forEach(headingBlock => {
      const heading = headingBlock.querySelector("h2");
      const config = ADVANTAGE_SECTION_MAP[normalizeText(heading?.textContent)];
      if (!heading || !config) return;
      addHeadingIcon(heading, config.icon);
      compactExplanation(headingBlock.querySelector(".advantage-heading-copy"), config.summary, config.icon);
    });

    const classIcons = [
      [".advantage-definition-grid article:nth-child(1) h3", "up"],
      [".advantage-definition-grid article:nth-child(2) h3", "shield"],
      [".advantage-definition-grid article:nth-child(3) h3", "warning"],
      [".tightness-card.is-true h3", "chain"],
      [".tightness-card.is-trap h3", "bolt"],
      [".tightness-card.is-trade h3", "swap"],
      [".tightness-card.is-open h3", "split"],
      [".advantage-caution h3", "warning"]
    ];
    classIcons.forEach(([selector, icon]) => document.querySelectorAll(selector).forEach(el => addHeadingIcon(el, icon)));

    document.querySelectorAll(".training-grid article h3").forEach((heading, index) => {
      addHeadingIcon(heading, ["target", "guard", "warning"][index] || "repeat");
    });

    document.querySelectorAll(".plus-move-card").forEach(card => {
      const host = card.querySelector("h3")?.parentElement || card;
      addConceptRow(card, host, "ガード 有利");
    });
  }

  function isCompactSemanticLabel(element) {
    const text = normalizeText(element.textContent);
    if (!text || text.length > 28 || element.dataset.miIconified === "true") return false;
    const classTokens = Array.from(element.classList || []);
    const classMatch = classTokens.some(token => /(?:^|-)(?:badge|chip|tag)$/.test(token));
    return classMatch || element.matches([
      ".filter-chip",
      ".situation-phase small",
      ".situation-card-status span",
      ".situation-card-status b",
      ".situation-card-tags span",
      ".situation-answer small",
      ".situation-primary small",
      ".plus-move-card small",
      ".plus-move-block"
    ].join(","));
  }

  function decorateSemanticLabels(root = document) {
    root.querySelectorAll("main [class], main .situation-phase small, main .situation-answer small, main .situation-primary small").forEach(element => {
      if (!isCompactSemanticLabel(element)) return;
      const concept = resolveConcepts(element.textContent, 1)[0];
      if (concept) addInlineIcon(element, concept.icon);
    });
  }

  function decorateGenericHeadings(root = document) {
    const selector = [
      ".situation-card-heading h3",
      ".situation-result-group > header h2",
      ".move-card h3",
      ".playbook-card h3",
      ".strategy-card h3",
      ".drill-card h3",
      ".decision-card h3",
      ".combo-card h3"
    ].join(",");
    root.querySelectorAll(selector).forEach(heading => {
      const concept = resolveConcepts(`${heading.textContent} ${heading.parentElement?.textContent || ""}`, 1)[0];
      if (concept) addHeadingIcon(heading, concept.icon);
    });
  }

  function decorateDataCards(root = document) {
    const cards = root.querySelectorAll([
      ".situation-card",
      ".move-card",
      ".playbook-card",
      ".strategy-card",
      ".drill-card",
      ".decision-card",
      ".combo-card",
      ".home-dashboard article"
    ].join(","));

    cards.forEach(card => {
      const host = card.matches(".situation-card")
        ? card.querySelector(".situation-card-heading")
        : card.querySelector("h2, h3")?.parentElement || card;
      addConceptRow(card, host);
    });
  }

  function enhance(root = document) {
    decorateNavigation();
    decoratePageHero();
    decorateEntryLinks();
    decorateMethodSteps();
    decorateFirstSix();
    decorateEditorialGuides();
    decorateAdvantagePage();
    decorateSemanticLabels(root);
    decorateGenericHeadings(root);
    decorateDataCards(root);
    document.body?.classList.add("mi-icons-ready");
  }

  let timer = 0;
  function scheduleEnhance() {
    rootWindow.clearTimeout(timer);
    timer = rootWindow.setTimeout(() => enhance(document), 35);
  }

  api.enhance = enhance;
  api.createSvg = createSvg;

  function start() {
    enhance(document);
    if (typeof MutationObserver === "undefined") return;
    const main = document.querySelector("main");
    if (!main) return;
    const observer = new MutationObserver(scheduleEnhance);
    observer.observe(main, { childList: true, subtree: true });
    api.observer = observer;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
