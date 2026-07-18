(() => {
  const PLAYBOOK_URL = "playbook-data.js";
  const DIRECTION_LABELS = {
    neutral: "N",
    up: "↑",
    down: "↓",
    left: "←",
    right: "→"
  };

  const ASSIST_COMBOS = {
    light: {
      label: "A弱",
      sub: "アシスト弱",
      cardId: "assist-light-1320",
      moveId: "crLK",
      shortcut: "Q"
    },
    medium: {
      label: "A中",
      sub: "アシスト中",
      cardId: "assist-medium-2660",
      moveId: "aMP",
      shortcut: "W"
    },
    heavy: {
      label: "A強",
      sub: "アシスト強",
      cardId: "assist-heavy-3020",
      moveId: "fHK",
      shortcut: "E"
    }
  };

  const MOVE_MAP = {
    "neutral:weak": "stLP",
    "down:weak": "crLP",
    "neutral:medium": "stMK",
    "down:medium": "crMP",
    "right:medium": "fMP",
    "neutral:heavy": "stHP",
    "down:heavy": "crHP",
    "right:heavy": "fHK",
    "left:heavy": "bHP",
    "neutral:special": "gladiusL",
    "down:special": "phalanxM",
    "left:special": "dimachaerusM",
    "right:special": "scutum"
  };

  const FEATURE_SCREENS = [
    { type: "home", label: "HOME" },
    { type: "assist", key: "light", label: "ASSIST" },
    { type: "card", cardId: "round-order", label: "ROUND PLAN" },
    { type: "card", cardId: "anti-air-one", label: "DEFENSE" },
    { type: "card", cardId: "thirty-minute", label: "TRAINING" }
  ];

  const state = {
    direction: "neutral",
    featureIndex: 0,
    selected: null,
    lastOpen: null
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function loadPlaybook() {
    if (window.MARISA_PLAYBOOK) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${PLAYBOOK_URL}"]`);
      if (existing) {
        const timer = setInterval(() => {
          if (!window.MARISA_PLAYBOOK) return;
          clearInterval(timer);
          resolve();
        }, 20);
        setTimeout(() => {
          clearInterval(timer);
          window.MARISA_PLAYBOOK ? resolve() : reject(new Error("Playbook data timeout"));
        }, 4000);
        return;
      }
      const script = document.createElement("script");
      script.src = PLAYBOOK_URL;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }

  function getMove(id) {
    return window.MARISA_DATA?.moves?.find(move => move.id === id) || null;
  }

  function getCard(id) {
    return window.MARISA_PLAYBOOK?.cards?.find(card => card.id === id) || null;
  }

  function buildShell() {
    if (document.querySelector("#controller-lab")) return;
    const main = document.querySelector("main#top");
    if (!main) return;

    document.body.classList.add("has-controller-lab");

    const section = document.createElement("section");
    section.id = "controller-lab";
    section.className = "controller-lab";
    section.setAttribute("aria-label", "モダンマリーザ操作型攻略端末");
    section.innerHTML = `
      <div class="controller-frame">
        <header class="controller-topbar">
          <button type="button" class="shoulder-button" data-controller-prev><span>L1</span><small>前の画面</small></button>
          <div class="controller-title">
            <small>STREET FIGHTER 6 / MODERN</small>
            <b>MARISA TRAINING PAD</b>
            <span>実機の再現ではなく、判断とコンボを覚えるための操作盤</span>
          </div>
          <button type="button" class="shoulder-button" data-controller-next><span>R1</span><small>次の画面</small></button>
        </header>

        <div class="controller-body">
          <section class="controller-left" aria-label="方向入力">
            <div class="control-label"><small>DIRECTION</small><b>方向を選ぶ</b></div>
            <div class="dpad" role="group" aria-label="方向キー">
              <button type="button" class="dpad-key dpad-up" data-direction="up" aria-label="上">↑</button>
              <button type="button" class="dpad-key dpad-left" data-direction="left" aria-label="左">←</button>
              <button type="button" class="dpad-key dpad-neutral is-active" data-direction="neutral" aria-label="ニュートラル">N</button>
              <button type="button" class="dpad-key dpad-right" data-direction="right" aria-label="右">→</button>
              <button type="button" class="dpad-key dpad-down" data-direction="down" aria-label="下">↓</button>
            </div>
            <div class="direction-readout">
              <small>SELECTED</small>
              <b data-direction-readout>N</b>
              <span>方向を選んで、通常ボタンまたはSPを押す</span>
            </div>
          </section>

          <section class="controller-screen-wrap" aria-label="攻略表示画面">
            <div class="screen-bezel">
              <div class="screen-statusbar">
                <span><i></i> PERSONAL LAB</span>
                <b data-screen-mode>HOME</b>
                <span>2026.03.17</span>
              </div>
              <div class="controller-screen" data-controller-screen aria-live="polite"></div>
              <div class="screen-actions">
                <button type="button" data-screen-back disabled>BACK</button>
                <button type="button" data-screen-open>DETAIL</button>
              </div>
            </div>
          </section>

          <section class="controller-right" aria-label="攻撃とアシストコンボ">
            <div class="normal-controls">
              <div class="control-label"><small>NORMAL / SPECIAL</small><b>通常入力</b></div>
              <div class="action-diamond" role="group" aria-label="通常攻撃ボタン">
                <button type="button" class="action-button action-weak" data-action="weak"><b>弱</b><small>J</small></button>
                <button type="button" class="action-button action-medium" data-action="medium"><b>中</b><small>K</small></button>
                <button type="button" class="action-button action-heavy" data-action="heavy"><b>強</b><small>L</small></button>
                <button type="button" class="action-button action-special" data-action="special"><b>SP</b><small>I</small></button>
              </div>
            </div>

            <div class="assist-controls">
              <div class="assist-heading">
                <span>LEARNING SHORTCUT</span>
                <b>アシストコンボ</b>
                <small>実機操作とは別の、攻略用ワンタッチボタン</small>
              </div>
              <div class="assist-buttons" role="group" aria-label="アシストコンボ専用ボタン">
                <button type="button" class="assist-button assist-light" data-assist="light">
                  <span><i>A</i><b>弱</b></span><small>アシスト弱</small><em data-assist-damage="light">1,320</em><kbd>Q</kbd>
                </button>
                <button type="button" class="assist-button assist-medium" data-assist="medium">
                  <span><i>A</i><b>中</b></span><small>アシスト中</small><em data-assist-damage="medium">2,660</em><kbd>W</kbd>
                </button>
                <button type="button" class="assist-button assist-heavy" data-assist="heavy">
                  <span><i>A</i><b>強</b></span><small>アシスト強</small><em data-assist-damage="heavy">3,020</em><kbd>E</kbd>
                </button>
              </div>
            </div>
          </section>
        </div>

        <footer class="controller-footer">
          <button type="button" class="system-button" data-open-playbook><span>SELECT</span><b>実戦攻略</b></button>
          <div class="input-history" aria-label="現在の入力">
            <small>INPUT</small><b data-input-history>N</b>
          </div>
          <button type="button" class="system-button" data-open-database><span>START</span><b>全技データ</b></button>
        </footer>
      </div>`;

    main.prepend(section);
  }

  function renderHome() {
    return `
      <div class="screen-home">
        <p class="screen-kicker">TODAY'S FOCUS</p>
        <h1>見る。止める。<br><em>当たったら伸ばす。</em></h1>
        <p>方向＋通常ボタンで技を確認。右側のA弱・A中・A強は、アシストコンボを直接開く学習用ボタン。</p>
        <div class="screen-home-grid">
          <div><small>対空</small><b>↓＋強</b><span>正面の飛びを一つに固定</span></div>
          <div><small>近距離</small><b>A弱</b><span>分からない時の小さい択</span></div>
          <div><small>確定反撃</small><b>A強</b><span>大きな隙を見てから</span></div>
        </div>
      </div>`;
  }

  function renderAssist(key) {
    const config = ASSIST_COMBOS[key];
    const card = getCard(config.cardId);
    if (!card) return renderMissing("アシストコンボのデータを読み込み中");
    return `
      <div class="screen-combo screen-assist-${escapeHtml(key)}">
        <div class="screen-combo-head">
          <div><p class="screen-kicker">ASSIST COMBO / ONE TOUCH</p><h1>${escapeHtml(config.label)}コンボ</h1></div>
          <span class="screen-measured ${card.status === "verify" ? "is-verify" : ""}">${escapeHtml(card.statusLabel || "記録")}</span>
        </div>
        <div class="screen-metrics">
          <div class="metric-main"><small>DAMAGE</small><b>${escapeHtml(card.damage)}</b></div>
          <div><small>DRIVE</small><b>${escapeHtml(card.drive)}</b></div>
          <div><small>SA</small><b>${escapeHtml(card.sa)}</b></div>
        </div>
        <div class="screen-command">${(card.inputs || []).map((input, index) => `<span>${escapeHtml(input)}${index < card.inputs.length - 1 ? " →" : ""}</span>`).join("")}</div>
        <dl class="screen-facts">
          <div><dt>使う場面</dt><dd>${escapeHtml(card.use)}</dd></div>
          <div><dt>次の行動</dt><dd>${escapeHtml(card.next)}</dd></div>
          <div><dt>補足</dt><dd>${escapeHtml(card.sourceNote || card.condition)}</dd></div>
        </dl>
        <p class="assist-explanation">このボタンは実際の操作配置を再現するものではなく、<b>${escapeHtml(config.sub)}</b>をすぐ比較するための攻略用ショートカット。</p>
      </div>`;
  }

  function renderMove(move) {
    if (!move) return renderMissing("この方向とボタンに登録された技はまだありません");
    return `
      <div class="screen-move">
        <div class="screen-move-head">
          <div><p class="screen-kicker">MOVE INPUT</p><h1>${escapeHtml(move.command)}</h1></div>
          <span>${escapeHtml(move.category)}</span>
        </div>
        <h2>${escapeHtml(move.name)}</h2>
        <p class="screen-move-when">${escapeHtml(move.when)}</p>
        <div class="screen-move-stats">
          <div><small>DAMAGE</small><b>${escapeHtml(move.damage)}</b></div>
          <div><small>STARTUP</small><b>${escapeHtml(move.startup)}</b></div>
          <div><small>BLOCK</small><b>${escapeHtml(move.block)}</b></div>
        </div>
        <p class="screen-move-copy">${escapeHtml(move.description)}</p>
        <div class="screen-tags">${(move.purposes || []).map(purpose => `<span>${escapeHtml(purpose)}</span>`).join("")}</div>
      </div>`;
  }

  function renderFeatureCard(card) {
    if (!card) return renderMissing("攻略カードを読み込み中");
    const items = card.steps || card.priority || card.tasks || card.periods || [];
    return `
      <div class="screen-feature">
        <p class="screen-kicker">${escapeHtml(card.number || "PLAYBOOK")} / ${escapeHtml(card.category || "LAB")}</p>
        <h1>${escapeHtml(card.title)}</h1>
        <p>${escapeHtml(card.lead)}</p>
        <div class="screen-feature-list">${items.slice(0, 5).map((item, index) => `
          <div><span>${escapeHtml(item.label || item.rank || item.time || item.range || index + 1)}</span><b>${escapeHtml(item.text || item.title)}</b></div>`).join("")}</div>
        ${card.judgment || card.warning || card.result ? `<strong class="screen-feature-note">${escapeHtml(card.judgment || card.warning || card.result)}</strong>` : ""}
      </div>`;
  }

  function renderMissing(message) {
    return `<div class="screen-missing"><b>${escapeHtml(message)}</b><span>別の入力を選んでください。</span></div>`;
  }

  function updateScreen(selection = null) {
    const screen = document.querySelector("[data-controller-screen]");
    const modeLabel = document.querySelector("[data-screen-mode]");
    const backButton = document.querySelector("[data-screen-back]");
    const openButton = document.querySelector("[data-screen-open]");
    if (!screen) return;

    if (selection) state.selected = selection;
    const current = state.selected || FEATURE_SCREENS[state.featureIndex];
    state.lastOpen = current;

    if (current.type === "assist") {
      modeLabel.textContent = `${ASSIST_COMBOS[current.key].label} COMBO`;
      screen.innerHTML = renderAssist(current.key);
      openButton.disabled = false;
    } else if (current.type === "move") {
      const move = getMove(current.moveId);
      modeLabel.textContent = move?.command || "MOVE";
      screen.innerHTML = renderMove(move);
      openButton.disabled = !move;
    } else if (current.type === "card") {
      const card = getCard(current.cardId);
      modeLabel.textContent = current.label || "PLAYBOOK";
      screen.innerHTML = renderFeatureCard(card);
      openButton.disabled = !card;
    } else {
      modeLabel.textContent = "HOME";
      screen.innerHTML = renderHome();
      openButton.disabled = true;
    }

    backButton.disabled = !state.selected;
    document.querySelectorAll("[data-assist]").forEach(button => {
      button.classList.toggle("is-active", current.type === "assist" && button.dataset.assist === current.key);
    });
  }

  function setDirection(direction) {
    state.direction = direction;
    document.querySelectorAll("[data-direction]").forEach(button => {
      button.classList.toggle("is-active", button.dataset.direction === direction);
    });
    const label = DIRECTION_LABELS[direction];
    document.querySelector("[data-direction-readout]").textContent = label;
    document.querySelector("[data-input-history]").textContent = label;
    pulse(document.querySelector(`[data-direction="${direction}"]`));
  }

  function selectAction(action) {
    const key = `${state.direction}:${action}`;
    const moveId = MOVE_MAP[key];
    const direction = DIRECTION_LABELS[state.direction];
    const actionLabel = action === "special" ? "SP" : { weak: "弱", medium: "中", heavy: "強" }[action];
    document.querySelector("[data-input-history]").textContent = `${direction}＋${actionLabel}`;
    pulse(document.querySelector(`[data-action="${action}"]`));
    updateScreen({ type: "move", moveId, label: "MOVE" });
  }

  function selectAssist(key) {
    const config = ASSIST_COMBOS[key];
    document.querySelector("[data-input-history]").textContent = config.label;
    pulse(document.querySelector(`[data-assist="${key}"]`));
    updateScreen({ type: "assist", key, label: "ASSIST" });
  }

  function cycleFeature(delta) {
    state.selected = null;
    state.featureIndex = (state.featureIndex + delta + FEATURE_SCREENS.length) % FEATURE_SCREENS.length;
    pulse(document.querySelector(delta < 0 ? "[data-controller-prev]" : "[data-controller-next]"));
    updateScreen();
  }

  function pulse(element) {
    if (!element) return;
    element.classList.remove("is-pressed");
    requestAnimationFrame(() => {
      element.classList.add("is-pressed");
      setTimeout(() => element.classList.remove("is-pressed"), 140);
    });
  }

  function openPlaybookCard(cardId) {
    if (!cardId) return;
    location.hash = `#playbook/${getCard(cardId)?.category || "combo"}/${cardId}`;
    setTimeout(() => document.querySelector("#strategy-gallery")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }

  function openMove(moveId) {
    const move = getMove(moveId);
    const search = document.querySelector("#search-input");
    const moves = document.querySelector("#moves");
    if (!move || !search || !moves) return;
    search.value = move.name;
    search.dispatchEvent(new Event("input", { bubbles: true }));
    moves.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      const summary = document.querySelector(`[data-move-id="${move.id}"] .move-summary`);
      summary?.click();
      summary?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 240);
  }

  function openCurrentDetail() {
    const current = state.lastOpen;
    if (!current) return;
    if (current.type === "assist") return openPlaybookCard(ASSIST_COMBOS[current.key].cardId);
    if (current.type === "card") return openPlaybookCard(current.cardId);
    if (current.type === "move") return openMove(current.moveId);
  }

  function bindEvents() {
    const lab = document.querySelector("#controller-lab");
    if (!lab) return;

    lab.addEventListener("click", event => {
      const direction = event.target.closest("[data-direction]");
      if (direction) return setDirection(direction.dataset.direction);

      const action = event.target.closest("[data-action]");
      if (action) return selectAction(action.dataset.action);

      const assist = event.target.closest("[data-assist]");
      if (assist) return selectAssist(assist.dataset.assist);

      if (event.target.closest("[data-controller-prev]")) return cycleFeature(-1);
      if (event.target.closest("[data-controller-next]")) return cycleFeature(1);
      if (event.target.closest("[data-screen-back]")) {
        state.selected = null;
        return updateScreen();
      }
      if (event.target.closest("[data-screen-open]")) return openCurrentDetail();
      if (event.target.closest("[data-open-playbook]")) return document.querySelector("#strategy-gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (event.target.closest("[data-open-database]")) return document.querySelector("#moves")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    document.addEventListener("keydown", event => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      const key = event.key.toLowerCase();
      const directionKeys = { arrowup: "up", arrowdown: "down", arrowleft: "left", arrowright: "right", n: "neutral" };
      const actionKeys = { j: "weak", k: "medium", l: "heavy", i: "special" };
      const assistKeys = { q: "light", w: "medium", e: "heavy" };
      if (directionKeys[key]) {
        event.preventDefault();
        return setDirection(directionKeys[key]);
      }
      if (actionKeys[key]) return selectAction(actionKeys[key]);
      if (assistKeys[key]) return selectAssist(assistKeys[key]);
      if (key === "[") return cycleFeature(-1);
      if (key === "]") return cycleFeature(1);
      if (key === "enter") return openCurrentDetail();
      if (key === "escape" && state.selected) {
        state.selected = null;
        return updateScreen();
      }
    });
  }

  async function init() {
    try {
      await loadPlaybook();
    } catch (error) {
      console.warn("[Marisa Controller] Playbook data could not be loaded", error);
    }
    buildShell();
    bindEvents();
    updateScreen();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
