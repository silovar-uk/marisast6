(() => {
  const DATA_URL = "playbook-data.js";
  const STORAGE_KEY = "modern-marisa-playbook-learned-v1";

  function replaceNotation(value) {
    if (typeof value !== "string") return value;
    return value
      .replace(/A＋(N|[←→↑↓↖↗↘↙])＋SP/g, "A$1SP")
      .replace(/A＋SP/g, "ASP")
      .replace(/A＋([弱中強])/g, "A$1")
      .replace(/アシ(弱|中|強)/g, "A$1");
  }

  function normalizeData(value, seen = new WeakSet()) {
    if (!value || typeof value !== "object" || seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "string") value[index] = replaceNotation(item);
        else normalizeData(item, seen);
      });
      return;
    }
    Object.keys(value).forEach(key => {
      if (typeof value[key] === "string") value[key] = replaceNotation(value[key]);
      else normalizeData(value[key], seen);
    });
  }

  function normalizeDom(root = document.body) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => {
      const next = replaceNotation(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    });
    root.querySelectorAll?.("[placeholder], [aria-label], [title], [value]").forEach(element => {
      ["placeholder", "aria-label", "title", "value"].forEach(attribute => {
        if (!element.hasAttribute(attribute)) return;
        const current = element.getAttribute(attribute);
        const next = replaceNotation(current);
        if (next !== current) element.setAttribute(attribute, next);
      });
    });
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function loadLearned() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return new Set(Array.isArray(saved) ? saved : []);
    } catch {
      return new Set();
    }
  }

  function saveLearned(set) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    } catch {
      // Storage can be unavailable in private browsing. The deck still works.
    }
  }

  function init() {
    const section = document.querySelector("#strategy-gallery");
    const data = window.MARISA_PLAYBOOK;
    if (!section || !data) {
      normalizeDom();
      return;
    }

    normalizeData(data);
    normalizeData(window.MARISA_DATA);

    document.querySelector("#strategy-dialog")?.remove();
    const navLink = document.querySelector('a[href="#strategy-gallery"]');
    if (navLink) navLink.textContent = "実戦攻略";

    const categoryById = Object.fromEntries(data.categories.map(category => [category.id, category]));
    const learned = loadLearned();
    const state = {
      category: "core",
      comboFilter: "all",
      activeIndex: 0,
      cards: [],
      scrollTimer: null
    };

    const deepLink = parseHash();
    if (deepLink.category && categoryById[deepLink.category]) state.category = deepLink.category;

    section.className = "playbook-section";
    section.innerHTML = `
      <div class="shell">
        <div class="playbook-heading">
          <div>
            <p class="eyebrow">PLAYBOOK / PERSONAL LAB</p>
            <h2>実戦攻略デッキ</h2>
            <p>長い記事を読むのではなく、いま直したい話だけを横にめくる。実測値、動画メモ、未確認事項を分けて記録。</p>
          </div>
          <aside class="playbook-principle" aria-label="この攻略デッキの基本方針">
            <small>ROUND RULE</small>
            <b>見る。止める。<br>当たったら伸ばす。</b>
          </aside>
        </div>

        <div class="playbook-category-wrap">
          <div id="playbook-categories" class="playbook-categories" role="tablist" aria-label="攻略カテゴリー"></div>
          <p id="playbook-category-description" class="playbook-category-description"></p>
        </div>

        <div id="playbook-combo-filters" class="playbook-combo-filters" aria-label="コンボ条件" hidden></div>

        <div class="playbook-stage">
          <div class="playbook-stage-top">
            <div class="playbook-position" aria-live="polite">
              <span id="playbook-current">01</span>
              <i>/</i>
              <span id="playbook-total">01</span>
            </div>
            <div class="playbook-controls">
              <button type="button" data-playbook-prev aria-label="前のカード">←</button>
              <button type="button" data-playbook-next aria-label="次のカード">→</button>
            </div>
          </div>
          <div id="playbook-deck" class="playbook-deck" tabindex="0" aria-label="攻略カード。左右へスワイプできます"></div>
          <div id="playbook-dots" class="playbook-dots" aria-label="カード位置"></div>
        </div>

        <div class="playbook-footnote">
          <p><b>記録の読み方</b><span>実測済み＝トレモで数値確認／動画メモ＝参考ルート／要検証＝入力・ゲージ・成立条件が未確定</span></p>
          <p>${escapeHtml(data.note)}</p>
        </div>
      </div>`;

    const categoryRoot = section.querySelector("#playbook-categories");
    const categoryDescription = section.querySelector("#playbook-category-description");
    const comboFilterRoot = section.querySelector("#playbook-combo-filters");
    const deck = section.querySelector("#playbook-deck");
    const dots = section.querySelector("#playbook-dots");
    const currentLabel = section.querySelector("#playbook-current");
    const totalLabel = section.querySelector("#playbook-total");
    const prevButton = section.querySelector("[data-playbook-prev]");
    const nextButton = section.querySelector("[data-playbook-next]");

    function categoryCards() {
      const cards = data.cards.filter(card => card.category === state.category);
      if (state.category !== "combo" || state.comboFilter === "all") return cards;
      return cards.filter(card => (card.filters || []).includes(state.comboFilter));
    }

    function renderCategories() {
      categoryRoot.innerHTML = data.categories.map(category => {
        const active = category.id === state.category;
        const count = data.cards.filter(card => card.category === category.id).length;
        return `<button class="playbook-category${active ? " is-active" : ""}" type="button" role="tab" aria-selected="${active}" data-playbook-category="${escapeHtml(category.id)}">
          <small>${escapeHtml(category.eyebrow)}</small>
          <b>${escapeHtml(category.label)}</b>
          <span>${String(count).padStart(2, "0")}</span>
        </button>`;
      }).join("");
      const category = categoryById[state.category];
      categoryDescription.textContent = category?.description || "";
    }

    function renderComboFilters() {
      const visible = state.category === "combo";
      comboFilterRoot.hidden = !visible;
      if (!visible) return;
      comboFilterRoot.innerHTML = data.comboFilters.map(filter => {
        const active = state.comboFilter === filter.id;
        return `<button type="button" class="playbook-filter${active ? " is-active" : ""}" data-combo-filter="${escapeHtml(filter.id)}">${escapeHtml(filter.label)}</button>`;
      }).join("");
    }

    function renderDeck(targetCardId = null) {
      state.cards = categoryCards();
      if (targetCardId) {
        const targetIndex = state.cards.findIndex(card => card.id === targetCardId);
        state.activeIndex = targetIndex >= 0 ? targetIndex : 0;
      } else {
        state.activeIndex = Math.min(state.activeIndex, Math.max(state.cards.length - 1, 0));
      }

      if (!state.cards.length) {
        deck.innerHTML = `<div class="playbook-empty"><b>該当するコンボがまだない。</b><span>条件を減らすか、要検証カードを表示してください。</span></div>`;
        dots.innerHTML = "";
        updatePosition();
        return;
      }

      deck.innerHTML = state.cards.map((card, index) => renderCard(card, index)).join("");
      dots.innerHTML = state.cards.map((card, index) => `
        <button type="button" class="playbook-dot${index === state.activeIndex ? " is-active" : ""}" data-playbook-index="${index}" aria-label="${index + 1}枚目：${escapeHtml(card.title)}"></button>`).join("");

      requestAnimationFrame(() => scrollToIndex(state.activeIndex, false));
      updatePosition();
    }

    function renderCard(card, index) {
      const learnedClass = learned.has(card.id) ? " is-learned" : "";
      const status = renderStatus(card);
      const cardBody = renderCardBody(card);
      return `<article class="playbook-slide" data-playbook-card="${escapeHtml(card.id)}" data-card-index="${index}" aria-label="${index + 1}枚目 ${escapeHtml(card.title)}">
        <div class="playbook-card playbook-card-${escapeHtml(card.type)}${learnedClass}">
          <header class="playbook-card-header">
            <div class="playbook-card-number"><span>${escapeHtml(card.number || String(index + 1).padStart(2, "0"))}</span><small>${escapeHtml(categoryById[card.category]?.eyebrow || "PLAYBOOK")}</small></div>
            ${status}
          </header>
          <div class="playbook-card-body">
            <h3>${escapeHtml(card.title)}</h3>
            ${card.lead ? `<p class="playbook-card-lead">${escapeHtml(card.lead)}</p>` : ""}
            ${cardBody}
          </div>
          ${renderCardFooter(card)}
        </div>
      </article>`;
    }

    function renderStatus(card) {
      if (!card.statusLabel) return "";
      const status = card.status || "memo";
      return `<span class="playbook-status status-${escapeHtml(status)}"><i></i>${escapeHtml(card.statusLabel)}</span>`;
    }

    function renderCardBody(card) {
      switch (card.type) {
        case "route":
          return `${renderSteps(card.steps)}${card.judgment ? `<p class="playbook-judgment">${escapeHtml(card.judgment)}</p>` : ""}`;
        case "evidence":
          return `<div class="evidence-list">${(card.evidence || []).map(item => `<blockquote><p>「${escapeHtml(item.quote)}」</p><span>${escapeHtml(item.meaning)}</span></blockquote>`).join("")}</div>${card.sourceNote ? `<p class="playbook-source-note">${escapeHtml(card.sourceNote)}</p>` : ""}`;
        case "manifesto":
          return `<div class="manifesto-statement">${escapeHtml(card.statement)}</div><div class="manifesto-grid">${(card.columns || []).map(item => `<div><b>${escapeHtml(item.title)}</b><span>${escapeHtml(item.text)}</span></div>`).join("")}</div>${renderAvoid(card.avoid)}`;
        case "loadout":
          return `<ol class="loadout-list">${(card.loadout || []).map(item => `<li><small>${escapeHtml(item.role)}</small><b>${escapeHtml(item.move)}</b><span>${escapeHtml(item.detail)}</span></li>`).join("")}</ol>`;
        case "distance":
          return `<div class="distance-zones">${(card.zones || []).map(zone => `<section class="distance-zone zone-${escapeHtml(zone.tone)}"><div><small>${escapeHtml(zone.name)}</small><b>${escapeHtml(zone.action)}</b></div><ul>${(zone.points || []).map(point => `<li>${escapeHtml(point)}</li>`).join("")}</ul></section>`).join("")}</div>`;
        case "priority":
          return `<ol class="priority-list">${(card.priority || []).map(item => `<li><span>${escapeHtml(item.rank)}</span><div><b>${escapeHtml(item.title)}</b><p>${escapeHtml(item.text)}</p></div></li>`).join("")}</ol>${card.warning ? `<p class="playbook-warning">${escapeHtml(card.warning)}</p>` : ""}`;
        case "comparison":
          return `<div class="comparison-grid">${renderComparisonSide(card.left, "left")}${renderComparisonSide(card.right, "right")}</div>`;
        case "practice":
          return `<div class="practice-tasks">${(card.tasks || []).map(item => `<div><small>${escapeHtml(item.time)}</small><b>${escapeHtml(item.title)}</b><span>${escapeHtml(item.text)}</span></div>`).join("")}</div>${renderChecklist(card.checklist)}${card.judgment ? `<p class="playbook-judgment">${escapeHtml(card.judgment)}</p>` : ""}`;
        case "combo":
          return renderCombo(card);
        case "decision":
          return `<div class="decision-origin">${escapeHtml(card.origin)}</div><div class="decision-grid">${(card.choices || []).map(choice => `<div><small>${escapeHtml(choice.label)}</small><b>${escapeHtml(choice.title)}</b><span>${escapeHtml(choice.text)}</span></div>`).join("")}</div>`;
        case "verification":
          return `<dl class="verification-list">${(card.fields || []).map(field => `<div><dt>${escapeHtml(field.label)}</dt><dd>${escapeHtml(field.value)}</dd></div>`).join("")}</dl>`;
        case "timeline":
          return `<div class="timeline-list">${(card.periods || []).map(period => `<div><small>${escapeHtml(period.range)}</small><b>${escapeHtml(period.title)}</b><span>${escapeHtml(period.text)}</span></div>`).join("")}</div>${card.result ? `<p class="timeline-result">${escapeHtml(card.result)}</p>` : ""}`;
        case "codes":
          return `<div class="code-grid">${(card.codes || []).map(item => `<div><strong>${escapeHtml(item.code)}</strong><b>${escapeHtml(item.label)}</b><span>${escapeHtml(item.detail)}</span></div>`).join("")}</div>${card.result ? `<p class="timeline-result">${escapeHtml(card.result)}</p>` : ""}`;
        case "sources":
          return `<div class="reference-list">${(card.sources || []).map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer"><small>${escapeHtml(source.role || "SOURCE")}</small><b>${escapeHtml(source.label)}</b><span>動画を開く ↗</span></a>`).join("")}</div>`;
        default:
          return "";
      }
    }

    function renderSteps(steps = []) {
      return `<ol class="playbook-steps">${steps.map((step, index) => `<li><span>${escapeHtml(step.label || index + 1)}</span><b>${escapeHtml(step.text)}</b></li>`).join("")}</ol>`;
    }

    function renderAvoid(items = []) {
      if (!items.length) return "";
      return `<div class="avoid-strip"><small>避ける</small>${items.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
    }

    function renderChecklist(items = []) {
      if (!items.length) return "";
      return `<div class="playbook-checklist">${items.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
    }

    function renderComparisonSide(side, direction) {
      if (!side) return "";
      return `<section class="comparison-side comparison-${direction}"><small>${escapeHtml(side.label)}</small><h4>${escapeHtml(side.title)}</h4><ul>${(side.points || []).map(point => `<li>${escapeHtml(point)}</li>`).join("")}</ul></section>`;
    }

    function renderCombo(card) {
      const metrics = [
        ["DAMAGE", card.damage],
        ["DRIVE", card.drive],
        ["SA", card.sa]
      ];
      return `
        <div class="combo-metrics">${metrics.map(([label, value]) => `<div><small>${label}</small><b>${escapeHtml(value)}</b></div>`).join("")}</div>
        <div class="combo-inputs" aria-label="コンボ入力">${(card.inputs || []).map((input, index) => `<span>${escapeHtml(input)}${index < card.inputs.length - 1 ? `<i>→</i>` : ""}</span>`).join("")}</div>
        <dl class="combo-facts">
          <div><dt>画面位置</dt><dd>${escapeHtml(card.position)}</dd></div>
          <div><dt>始動条件</dt><dd>${escapeHtml(card.condition)}</dd></div>
          <div><dt>使う場面</dt><dd>${escapeHtml(card.use)}</dd></div>
          <div><dt>次の確認</dt><dd>${escapeHtml(card.next)}</dd></div>
        </dl>
        ${card.sourceNote ? `<p class="playbook-source-note">${escapeHtml(card.sourceNote)}</p>` : ""}`;
    }

    function renderCardFooter(card) {
      const relatedMoves = (card.relatedMoves || []).map(id => {
        const move = window.MARISA_DATA?.moves?.find(item => item.id === id);
        const label = move?.name || id;
        return `<button type="button" data-open-move="${escapeHtml(id)}">${escapeHtml(label)}</button>`;
      }).join("");
      const sources = card.type === "sources" ? "" : (card.sources || []).map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)} ↗</a>`).join("");
      const isLearned = learned.has(card.id);
      return `<footer class="playbook-card-footer">
        <div class="playbook-related">${relatedMoves}${sources}</div>
        <button type="button" class="learned-button${isLearned ? " is-active" : ""}" data-learned-card="${escapeHtml(card.id)}" aria-pressed="${isLearned}"><span>${isLearned ? "✓" : "○"}</span>${isLearned ? "習得済み" : "習得チェック"}</button>
      </footer>`;
    }

    function scrollToIndex(index, smooth = true) {
      const slides = [...deck.querySelectorAll(".playbook-slide")];
      const target = slides[index];
      if (!target) return;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: smooth && !reduceMotion ? "smooth" : "auto", block: "nearest", inline: "start" });
      state.activeIndex = index;
      updatePosition();
    }

    function updatePosition() {
      const length = state.cards.length;
      const index = length ? state.activeIndex : 0;
      currentLabel.textContent = String(index + 1).padStart(2, "0");
      totalLabel.textContent = String(length).padStart(2, "0");
      prevButton.disabled = !length || index <= 0;
      nextButton.disabled = !length || index >= length - 1;
      dots.querySelectorAll(".playbook-dot").forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
      const card = state.cards[index];
      if (card) updateHash(state.category, card.id);
    }

    function detectActiveSlide() {
      const slides = [...deck.querySelectorAll(".playbook-slide")];
      if (!slides.length) return;
      const deckLeft = deck.getBoundingClientRect().left;
      let closestIndex = 0;
      let closestDistance = Infinity;
      slides.forEach((slide, index) => {
        const distance = Math.abs(slide.getBoundingClientRect().left - deckLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      if (closestIndex !== state.activeIndex) {
        state.activeIndex = closestIndex;
        updatePosition();
      }
    }

    function setCategory(categoryId, targetCardId = null) {
      if (!categoryById[categoryId]) return;
      state.category = categoryId;
      state.comboFilter = "all";
      state.activeIndex = 0;
      renderCategories();
      renderComboFilters();
      renderDeck(targetCardId);
    }

    function parseHash() {
      const match = location.hash.match(/^#playbook\/([^/]+)(?:\/([^/]+))?/);
      return match ? { category: match[1], card: match[2] || null } : {};
    }

    function updateHash(category, cardId) {
      const nextHash = `#playbook/${category}/${cardId}`;
      if (location.hash === nextHash) return;
      history.replaceState(null, "", nextHash);
    }

    section.addEventListener("click", event => {
      const categoryButton = event.target.closest("[data-playbook-category]");
      if (categoryButton) {
        setCategory(categoryButton.dataset.playbookCategory);
        return;
      }

      const filterButton = event.target.closest("[data-combo-filter]");
      if (filterButton) {
        state.comboFilter = filterButton.dataset.comboFilter;
        state.activeIndex = 0;
        renderComboFilters();
        renderDeck();
        return;
      }

      const dot = event.target.closest("[data-playbook-index]");
      if (dot) {
        scrollToIndex(Number(dot.dataset.playbookIndex));
        return;
      }

      const learnedButton = event.target.closest("[data-learned-card]");
      if (learnedButton) {
        const id = learnedButton.dataset.learnedCard;
        if (learned.has(id)) learned.delete(id);
        else learned.add(id);
        saveLearned(learned);
        const cardElement = learnedButton.closest(".playbook-card");
        cardElement?.classList.toggle("is-learned", learned.has(id));
        learnedButton.classList.toggle("is-active", learned.has(id));
        learnedButton.setAttribute("aria-pressed", String(learned.has(id)));
        learnedButton.innerHTML = `<span>${learned.has(id) ? "✓" : "○"}</span>${learned.has(id) ? "習得済み" : "習得チェック"}`;
      }
    });

    prevButton.addEventListener("click", () => scrollToIndex(Math.max(state.activeIndex - 1, 0)));
    nextButton.addEventListener("click", () => scrollToIndex(Math.min(state.activeIndex + 1, state.cards.length - 1)));

    deck.addEventListener("scroll", () => {
      clearTimeout(state.scrollTimer);
      state.scrollTimer = setTimeout(detectActiveSlide, 80);
    }, { passive: true });

    deck.addEventListener("keydown", event => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollToIndex(Math.max(state.activeIndex - 1, 0));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollToIndex(Math.min(state.activeIndex + 1, state.cards.length - 1));
      }
    });

    window.addEventListener("hashchange", () => {
      const hash = parseHash();
      if (!hash.category || !categoryById[hash.category]) return;
      setCategory(hash.category, hash.card);
    });

    renderCategories();
    renderComboFilters();
    renderDeck(deepLink.card);
    normalizeDom(section);

    if (location.hash.startsWith("#playbook/")) {
      requestAnimationFrame(() => section.scrollIntoView({ block: "start" }));
    }

    const observer = new MutationObserver(records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            const next = replaceNotation(node.nodeValue);
            if (next !== node.nodeValue) node.nodeValue = next;
          } else if (node.nodeType === Node.ELEMENT_NODE && !node.closest?.("#strategy-gallery")) {
            normalizeDom(node);
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  normalizeData(window.MARISA_DATA);

  if (window.MARISA_PLAYBOOK) {
    init();
  } else {
    const script = document.createElement("script");
    script.src = DATA_URL;
    script.onload = init;
    script.onerror = () => normalizeDom();
    document.head.append(script);
  }
})();
