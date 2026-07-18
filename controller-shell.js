(() => {
  const PLAYBOOK_URL = "playbook-data.js";
  const DIRECTION_LABELS = { neutral: "N", up: "↑", down: "↓", left: "←", right: "→" };
  const ACTION_LABELS = { weak: "弱", medium: "中", heavy: "強", special: "SP" };

  const ASSIST_COMBOS = {
    light: {
      label: "A弱",
      sub: "アシスト弱",
      cardId: "assist-light-1320",
      moveId: "crLK",
      shortcut: "Q",
      role: "近距離の安定択",
      cue: "迷ったらここ",
      tone: "safe"
    },
    medium: {
      label: "A中",
      sub: "アシスト中",
      cardId: "assist-medium-2660",
      moveId: "aMP",
      shortcut: "W",
      role: "中距離の主力",
      cue: "当たったら火力",
      tone: "main"
    },
    heavy: {
      label: "A強",
      sub: "アシスト強",
      cardId: "assist-heavy-3020",
      moveId: "fHK",
      shortcut: "E",
      role: "大きな隙への反撃",
      cue: "見てから押す",
      tone: "punish"
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
    { type: "home", label: "HOME", short: "HOME" },
    { type: "assist-compare", label: "ASSIST COMBO", short: "ASSIST" },
    { type: "card", cardId: "round-order", label: "ROUND PLAN", short: "ROUND" },
    { type: "card", cardId: "anti-air-one", label: "DEFENSE", short: "DEFENSE" },
    { type: "card", cardId: "thirty-minute", label: "TRAINING", short: "TRAIN" }
  ];

  const state = {
    direction: "neutral",
    featureIndex: 0,
    selected: null,
    lastOpen: null,
    inputHistory: [],
    swipeStart: null
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

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
      const existing = document.querySelector(`script[src^="${PLAYBOOK_URL}"]`);
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
    if ($("#controller-lab")) return;
    const main = $("main#top");
    if (!main) return;

    document.body.classList.add("has-controller-lab");

    const section = document.createElement("section");
    section.id = "controller-lab";
    section.className = "controller-lab";
    section.setAttribute("aria-label", "モダンマリーザ操作型攻略端末");
    section.innerHTML = `
      <div class="controller-frame">
        <div class="controller-grip controller-grip-left" aria-hidden="true"></div>
        <div class="controller-grip controller-grip-right" aria-hidden="true"></div>

        <header class="controller-topbar">
          <button type="button" class="shoulder-button" data-controller-prev><span>L1</span><small>前の画面</small></button>
          <div class="controller-title">
            <small>STREET FIGHTER 6 / MODERN</small>
            <b>MARISA TRAINING PAD</b>
            <div class="controller-mode-strip" role="tablist" aria-label="表示モード">
              ${FEATURE_SCREENS.map((item, index) => `<button type="button" role="tab" data-mode-index="${index}" aria-selected="${index === 0}"><i></i>${escapeHtml(item.short)}</button>`).join("")}
            </div>
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
              <span>方向を選び、通常ボタンかSPを押す</span>
            </div>
          </section>

          <section class="controller-screen-wrap" aria-label="攻略表示画面">
            <div class="screen-bezel">
              <div class="screen-statusbar">
                <span><i></i> PERSONAL LAB</span>
                <b data-screen-mode>HOME</b>
                <button type="button" class="screen-fullscreen" data-controller-fullscreen aria-label="コントローラーを全画面表示">□</button>
              </div>
              <div class="controller-screen" data-controller-screen aria-live="polite" tabindex="0"></div>
              <div class="screen-actions">
                <button type="button" data-screen-back disabled>BACK</button>
                <button type="button" data-assist-compare>3つ比較</button>
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
              <button type="button" class="assist-heading" data-assist-compare>
                <span>LEARNING SHORTCUT</span>
                <b>アシストコンボ</b>
                <small>3つを比較する ↗</small>
              </button>
              <div class="assist-buttons" role="group" aria-label="アシストコンボ専用ボタン">
                ${Object.entries(ASSIST_COMBOS).map(([key, item]) => `
                  <button type="button" class="assist-button assist-${key}" data-assist="${key}">
                    <span><i>A</i><b>${escapeHtml(item.label.slice(1))}</b></span>
                    <small>${escapeHtml(item.role)}</small>
                    <em data-assist-damage="${key}">${escapeHtml(getCard(item.cardId)?.damage || "—")}</em>
                    <strong>${escapeHtml(item.cue)}</strong>
                    <kbd>${escapeHtml(item.shortcut)}</kbd>
                  </button>`).join("")}
              </div>
            </div>
          </section>
        </div>

        <footer class="controller-footer">
          <button type="button" class="system-button" data-open-playbook><span>SELECT</span><b>実戦攻略</b></button>
          <div class="input-history" aria-label="最近の入力">
            <small>INPUT LOG</small>
            <div data-input-history><span>N</span></div>
            <button type="button" data-input-reset aria-label="入力履歴を消す">RESET</button>
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
        <p>方向＋通常ボタンで技を確認。A弱・A中・A強は、アシストコンボを直接開く学習用ボタン。</p>
        <div class="screen-home-grid">
          <button type="button" data-screen-shortcut="anti-air"><small>対空</small><b>↓＋強</b><span>正面の飛びを一つに固定</span></button>
          <button type="button" data-assist="light"><small>近距離</small><b>A弱</b><span>分からない時の小さい択</span></button>
          <button type="button" data-assist="heavy"><small>確定反撃</small><b>A強</b><span>大きな隙を見てから</span></button>
        </div>
        <div class="screen-hint"><span>SWIPE</span><b>中央画面を左右に払ってモード移動</b></div>
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
        <div class="assist-role-line"><b>${escapeHtml(config.role)}</b><span>${escapeHtml(config.cue)}</span></div>
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
        <p class="assist-explanation">実際の操作配置とは別に、<b>${escapeHtml(config.sub)}</b>を判断単位として呼び出す攻略用ショートカット。</p>
      </div>`;
  }

  function renderAssistCompare() {
    const items = Object.entries(ASSIST_COMBOS).map(([key, config]) => ({ key, config, card: getCard(config.cardId) }));
    return `
      <div class="screen-assist-compare">
        <div class="screen-compare-head">
          <div><p class="screen-kicker">ASSIST COMBO SELECTOR</p><h1>3つを、役割で選ぶ。</h1></div>
          <span>Q / W / E</span>
        </div>
        <div class="assist-compare-grid">
          ${items.map(({ key, config, card }) => `
            <button type="button" class="assist-compare-card compare-${escapeHtml(config.tone)}" data-assist="${escapeHtml(key)}">
              <div><span><i>A</i>${escapeHtml(config.label.slice(1))}</span><small>${escapeHtml(config.cue)}</small></div>
              <strong>${escapeHtml(config.role)}</strong>
              <dl>
                <div><dt>DAMAGE</dt><dd>${escapeHtml(card?.damage || "—")}</dd></div>
                <div><dt>DRIVE</dt><dd>${escapeHtml(card?.drive ?? "—")}</dd></div>
                <div><dt>SA</dt><dd>${escapeHtml(card?.sa ?? "—")}</dd></div>
              </dl>
              <em>${escapeHtml(card?.statusLabel || "記録なし")}</em>
            </button>`).join("")}
        </div>
        <div class="assist-compare-answer">
          <div><b>A弱</b><span>近距離で迷った時</span></div>
          <div><b>A中</b><span>中距離で当てた時</span></div>
          <div><b>A強</b><span>大きな隙を見た時</span></div>
        </div>
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

  function setScreenContent(html, view) {
    const screen = $("[data-controller-screen]");
    if (!screen) return;
    screen.classList.remove("is-entering");
    screen.dataset.view = view;
    screen.innerHTML = html;
    void screen.offsetWidth;
    screen.classList.add("is-entering");
  }

  function updateScreen(selection = null) {
    const modeLabel = $("[data-screen-mode]");
    const backButton = $("[data-screen-back]");
    const openButton = $("[data-screen-open]");
    if (!$('[data-controller-screen]')) return;

    if (selection) state.selected = selection;
    const current = state.selected || FEATURE_SCREENS[state.featureIndex];
    state.lastOpen = current;

    if (current.type === "assist") {
      modeLabel.textContent = `${ASSIST_COMBOS[current.key].label} COMBO`;
      setScreenContent(renderAssist(current.key), "assist");
      openButton.disabled = false;
    } else if (current.type === "assist-compare") {
      modeLabel.textContent = "ASSIST SELECT";
      setScreenContent(renderAssistCompare(), "assist-compare");
      openButton.disabled = true;
    } else if (current.type === "move") {
      const move = getMove(current.moveId);
      modeLabel.textContent = move?.command || "MOVE";
      setScreenContent(renderMove(move), "move");
      openButton.disabled = !move;
    } else if (current.type === "card") {
      const card = getCard(current.cardId);
      modeLabel.textContent = current.label || "PLAYBOOK";
      setScreenContent(renderFeatureCard(card), "card");
      openButton.disabled = !card;
    } else {
      modeLabel.textContent = "HOME";
      setScreenContent(renderHome(), "home");
      openButton.disabled = true;
    }

    backButton.disabled = !state.selected;
    $$('[data-assist]').forEach(button => {
      button.classList.toggle("is-active", current.type === "assist" && button.dataset.assist === current.key);
    });
    $$('[data-mode-index]').forEach((button, index) => {
      const active = !state.selected && index === state.featureIndex;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }

  function addInput(label, kind = "normal") {
    state.inputHistory.push({ label, kind });
    state.inputHistory = state.inputHistory.slice(-5);
    renderInputHistory();
  }

  function renderInputHistory() {
    const root = $("[data-input-history]");
    if (!root) return;
    if (!state.inputHistory.length) {
      root.innerHTML = "<span>N</span>";
      return;
    }
    root.innerHTML = state.inputHistory.map(item => `<span class="input-token token-${escapeHtml(item.kind)}">${escapeHtml(item.label)}</span>`).join("");
  }

  function resetInputHistory() {
    state.inputHistory = [];
    state.direction = "neutral";
    setDirection("neutral", false);
    renderInputHistory();
  }

  function setDirection(direction, pulseKey = true) {
    state.direction = direction;
    $$('[data-direction]').forEach(button => button.classList.toggle("is-active", button.dataset.direction === direction));
    const label = DIRECTION_LABELS[direction];
    $("[data-direction-readout]").textContent = label;
    if (pulseKey) pulse($(`[data-direction="${direction}"]`));
  }

  function selectAction(action) {
    const key = `${state.direction}:${action}`;
    const moveId = MOVE_MAP[key];
    const label = `${DIRECTION_LABELS[state.direction]}＋${ACTION_LABELS[action]}`;
    addInput(label, action === "special" ? "special" : "normal");
    pulse($(`[data-action="${action}"]`));
    updateScreen({ type: "move", moveId, label: "MOVE" });
  }

  function selectAssist(key) {
    const config = ASSIST_COMBOS[key];
    addInput(config.label, `assist-${key}`);
    pulse($(`[data-assist="${key}"]`));
    updateScreen({ type: "assist", key, label: "ASSIST" });
  }

  function showAssistCompare() {
    state.selected = { type: "assist-compare", label: "ASSIST COMBO" };
    updateScreen();
  }

  function cycleFeature(delta) {
    state.selected = null;
    state.featureIndex = (state.featureIndex + delta + FEATURE_SCREENS.length) % FEATURE_SCREENS.length;
    pulse($(delta < 0 ? "[data-controller-prev]" : "[data-controller-next]"));
    updateScreen();
  }

  function setFeature(index) {
    if (!Number.isInteger(index) || !FEATURE_SCREENS[index]) return;
    state.selected = null;
    state.featureIndex = index;
    updateScreen();
  }

  function pulse(element) {
    if (!element) return;
    navigator.vibrate?.(8);
    element.classList.remove("is-pressed");
    requestAnimationFrame(() => {
      element.classList.add("is-pressed");
      setTimeout(() => element.classList.remove("is-pressed"), 140);
    });
  }

  function openPlaybookCard(cardId) {
    if (!cardId) return;
    location.hash = `#playbook/${getCard(cardId)?.category || "combo"}/${cardId}`;
    setTimeout(() => $("#strategy-gallery")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }

  function openMove(moveId) {
    if (!getMove(moveId)) return;
    const proxy = document.createElement("button");
    proxy.type = "button";
    proxy.dataset.openMove = moveId;
    proxy.hidden = true;
    document.body.append(proxy);
    proxy.click();
    proxy.remove();
  }

  function openCurrentDetail() {
    const current = state.lastOpen;
    if (!current) return;
    if (current.type === "assist") return openPlaybookCard(ASSIST_COMBOS[current.key].cardId);
    if (current.type === "card") return openPlaybookCard(current.cardId);
    if (current.type === "move") return openMove(current.moveId);
  }

  async function toggleFullscreen() {
    const lab = $("#controller-lab");
    if (!lab) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await lab.requestFullscreen?.();
    } catch (error) {
      console.warn("[Marisa Controller] Fullscreen unavailable", error);
    }
  }

  function handleScreenShortcut(name) {
    if (name === "anti-air") {
      setDirection("down");
      selectAction("heavy");
    }
  }

  function bindEvents() {
    const lab = $("#controller-lab");
    const screen = $("[data-controller-screen]");
    if (!lab || !screen) return;

    lab.addEventListener("click", event => {
      const direction = event.target.closest("[data-direction]");
      if (direction) return setDirection(direction.dataset.direction);

      const action = event.target.closest("[data-action]");
      if (action) return selectAction(action.dataset.action);

      const assist = event.target.closest("[data-assist]");
      if (assist) return selectAssist(assist.dataset.assist);

      const mode = event.target.closest("[data-mode-index]");
      if (mode) return setFeature(Number(mode.dataset.modeIndex));

      const shortcut = event.target.closest("[data-screen-shortcut]");
      if (shortcut) return handleScreenShortcut(shortcut.dataset.screenShortcut);

      if (event.target.closest("[data-controller-prev]")) return cycleFeature(-1);
      if (event.target.closest("[data-controller-next]")) return cycleFeature(1);
      if (event.target.closest("[data-assist-compare]")) return showAssistCompare();
      if (event.target.closest("[data-input-reset]")) return resetInputHistory();
      if (event.target.closest("[data-controller-fullscreen]")) return toggleFullscreen();
      if (event.target.closest("[data-screen-back]")) {
        state.selected = null;
        return updateScreen();
      }
      if (event.target.closest("[data-screen-open]")) return openCurrentDetail();
      if (event.target.closest("[data-open-playbook]")) return $("#strategy-gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (event.target.closest("[data-open-database]")) return $("#moves")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    screen.addEventListener("pointerdown", event => {
      state.swipeStart = { x: event.clientX, y: event.clientY, time: performance.now() };
    });
    screen.addEventListener("pointerup", event => {
      if (!state.swipeStart) return;
      const dx = event.clientX - state.swipeStart.x;
      const dy = event.clientY - state.swipeStart.y;
      const elapsed = performance.now() - state.swipeStart.time;
      state.swipeStart = null;
      if (elapsed > 700 || Math.abs(dx) < 55 || Math.abs(dy) > 70) return;
      cycleFeature(dx < 0 ? 1 : -1);
    });

    document.addEventListener("fullscreenchange", () => {
      document.body.classList.toggle("controller-is-fullscreen", Boolean(document.fullscreenElement));
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
      if (key === "a") return showAssistCompare();
      if (key === "[") return cycleFeature(-1);
      if (key === "]") return cycleFeature(1);
      if (key === "r") return resetInputHistory();
      if (key === "f") return toggleFullscreen();
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
