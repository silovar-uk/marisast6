(() => {
  const SKILL_MAP = [
    ["飛び・前進・インパクト・待ち", "anti-air-front"],
    ["インパクトと誤反応", "impact-response"],
    ["A中ヒット時だけ", "hit-confirm-medium"],
    ["近距離で勝手に", "close-defense"],
    ["A強を見てから", "punish-heavy"],
    ["A弱・A中・A強", "assist-decision"],
    ["正面飛びへの対空", "anti-air-front"],
    ["インパクトへの反応", "impact-response"],
    ["A中のヒット確認", "hit-confirm-medium"],
    ["近距離の守り", "close-defense"],
    ["大きな隙へのA強", "punish-heavy"],
    ["アシストコンボの選択", "assist-decision"]
  ];

  const GUIDE = {
    "anti-air-front": "相手の行動に合う回答を一つ選ぶ",
    "impact-response": "インパクトか、別行動かを見分ける",
    "hit-confirm-medium": "ヒットした時だけ続ける",
    "close-defense": "小さい隙・大きな隙・連携中を分ける",
    "punish-heavy": "A強を押してよい隙だけ選ぶ",
    "assist-decision": "距離と隙からA弱・中・強を選ぶ"
  };

  const ANSWERS = {
    "anti-air-front": [
      { mark: "↓", label: "↓＋強", detail: "正面の飛び", type: "action", direction: "down", action: "heavy", tone: "primary" },
      { mark: "A", label: "A弱", detail: "前ダッシュ", type: "assist", key: "light" },
      { mark: "DI", label: "DI返し", detail: "赤い演出", type: "response", kind: "impact" },
      { mark: "…", label: "待つ", detail: "何もしていない", type: "response", kind: "wait" }
    ],
    "impact-response": [
      { mark: "DI", label: "DI返し", detail: "インパクト", type: "response", kind: "impact", tone: "primary" },
      { mark: "↓", label: "↓＋強", detail: "前ジャンプ", type: "action", direction: "down", action: "heavy" },
      { mark: "…", label: "待つ", detail: "ガード・様子見", type: "response", kind: "wait" }
    ],
    "hit-confirm-medium": [
      { mark: "A", label: "A中", detail: "ヒットなら継続", type: "assist", key: "medium", tone: "primary" },
      { mark: "A", label: "A強", detail: "大きな隙", type: "assist", key: "heavy" },
      { mark: "…", label: "待つ", detail: "ガードなら停止", type: "response", kind: "wait" }
    ],
    "close-defense": [
      { mark: "A", label: "A弱", detail: "小さい隙", type: "assist", key: "light", tone: "primary" },
      { mark: "A", label: "A強", detail: "大きな隙", type: "assist", key: "heavy" },
      { mark: "…", label: "待つ", detail: "連携中・様子見", type: "response", kind: "wait" }
    ],
    "punish-heavy": [
      { mark: "A", label: "A強", detail: "大きな確定反撃", type: "assist", key: "heavy", tone: "primary" },
      { mark: "…", label: "待つ", detail: "まだ大きな隙ではない", type: "response", kind: "wait" }
    ],
    "assist-decision": [
      { mark: "A", label: "A弱", detail: "近距離の小さい隙", type: "assist", key: "light" },
      { mark: "A", label: "A中", detail: "中距離でヒット", type: "assist", key: "medium", tone: "primary" },
      { mark: "A", label: "A強", detail: "大きな隙", type: "assist", key: "heavy" },
      { mark: "…", label: "待つ", detail: "判断できない", type: "response", kind: "wait" }
    ]
  };

  function enableSafeArea() {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return;
    const parts = viewport.content.split(",").map(value => value.trim()).filter(Boolean);
    if (!parts.some(value => value.startsWith("viewport-fit="))) parts.push("viewport-fit=cover");
    viewport.content = parts.join(", ");
  }

  function detectView(lab) {
    if (!lab.classList.contains("training-active")) return "controller";
    if (lab.querySelector(".training-drill-view")) return "drill";
    if (lab.querySelector(".training-skill-view")) return "skill";
    if (lab.querySelector(".training-result-view")) return "result";
    if (lab.querySelector(".training-mission-view")) return "mission";
    return "dashboard";
  }

  function detectSkill(lab) {
    const text = [
      lab.querySelector(".training-drill-top b")?.textContent,
      lab.querySelector("[data-training-title]")?.textContent,
      lab.querySelector(".training-skill-view h1")?.textContent
    ].filter(Boolean).join(" ");
    return SKILL_MAP.find(([needle]) => text.includes(needle))?.[1] || "";
  }

  function ensureLegacyResponses(lab, skill) {
    const responses = lab.querySelector(".training-special-responses");
    if (!responses) return null;

    if (!responses.querySelector('[data-training-response="wait"]')) {
      const wait = document.createElement("button");
      wait.type = "button";
      wait.dataset.trainingResponse = "wait";
      wait.textContent = "待つ";
      responses.append(wait);
    }

    const impact = responses.querySelector('[data-training-response="impact"]');
    if (impact) impact.hidden = !["anti-air-front", "impact-response"].includes(skill);
    return responses;
  }

  function createAnswerButton(answer) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "training-mobile-answer";
    button.dataset.mobileKind = answer.kind || answer.type;
    if (answer.tone) button.dataset.tone = answer.tone;
    button._trainingAnswer = answer;
    button.setAttribute("aria-label", `${answer.label}：${answer.detail}`);

    const mark = document.createElement("span");
    mark.className = "training-mobile-answer-mark";
    mark.textContent = answer.mark;

    const copy = document.createElement("span");
    copy.className = "training-mobile-answer-copy";
    const label = document.createElement("b");
    label.textContent = answer.label;
    const detail = document.createElement("small");
    detail.textContent = answer.detail;
    copy.append(label, detail);

    button.append(mark, copy);
    return button;
  }

  function mountAnswerGrid(lab, skill) {
    const prompt = lab.querySelector(".training-prompt");
    if (!prompt || prompt.querySelector(".training-mobile-answer-grid")) return;
    const answers = ANSWERS[skill] || [];
    if (!answers.length) return;

    const grid = document.createElement("div");
    grid.className = `training-mobile-answer-grid answers-${answers.length}`;
    grid.setAttribute("role", "group");
    grid.setAttribute("aria-label", "回答を選ぶ");
    answers.forEach(answer => grid.append(createAnswerButton(answer)));

    const timebar = prompt.querySelector(".training-timebar");
    prompt.insertBefore(grid, timebar || null);
  }

  function enhancePrompt(lab, skill) {
    const responses = ensureLegacyResponses(lab, skill);
    if (!responses) return;

    const prompt = lab.querySelector(".training-prompt");
    if (prompt && !prompt.querySelector(".training-mobile-guide")) {
      const guide = document.createElement("div");
      guide.className = "training-mobile-guide";
      guide.textContent = GUIDE[skill] || "回答を一つ選ぶ";
      responses.before(guide);
    }

    mountAnswerGrid(lab, skill);
  }

  function dispatchAnswer(lab, answer) {
    if (!answer) return;
    navigator.vibrate?.(10);

    if (answer.type === "action") {
      lab.querySelector(`[data-direction="${answer.direction}"]`)?.click();
      lab.querySelector(`[data-action="${answer.action}"]`)?.click();
      return;
    }

    if (answer.type === "assist") {
      lab.querySelector(`[data-assist="${answer.key}"]`)?.click();
      return;
    }

    if (answer.type === "response") {
      lab.querySelector(`[data-training-response="${answer.kind}"]`)?.click();
    }
  }

  function sync(lab) {
    const view = detectView(lab);
    const skill = view === "controller" ? "" : detectSkill(lab);
    if (lab.dataset.trainingView !== view) lab.dataset.trainingView = view;
    if (lab.dataset.trainingSkill !== skill) lab.dataset.trainingSkill = skill;
    if (view === "drill") enhancePrompt(lab, skill);
  }

  function setup() {
    const lab = document.querySelector("#controller-lab");
    const trainingButton = document.querySelector(".training-footer-button");
    if (!lab || !trainingButton) return false;
    if (lab.dataset.trainingIntegrated === "true") return true;
    lab.dataset.trainingIntegrated = "true";
    enableSafeArea();

    const footer = lab.querySelector(".controller-footer");
    const startButton = lab.querySelector("[data-open-database]");
    if (footer && startButton && trainingButton.nextElementSibling !== startButton) {
      footer.insertBefore(trainingButton, startButton);
    }

    lab.addEventListener("click", event => {
      const mobileAnswer = event.target.closest(".training-mobile-answer");
      if (mobileAnswer) {
        event.preventDefault();
        event.stopImmediatePropagation();
        dispatchAnswer(lab, mobileAnswer._trainingAnswer);
        return;
      }

      const regularMode = event.target.closest("[data-mode-index]");
      if (regularMode && lab.classList.contains("training-active")) {
        lab.querySelector("[data-training-close]")?.click();
      }
    }, true);

    let wasTraining = lab.classList.contains("training-active");
    const observer = new MutationObserver(() => {
      const isTraining = lab.classList.contains("training-active");
      if (wasTraining && !isTraining) {
        lab.querySelector('[data-direction="neutral"]')?.click();
      }
      wasTraining = isTraining;
      sync(lab);
    });
    observer.observe(lab, { attributes: true, attributeFilter: ["class"], childList: true, subtree: true });
    sync(lab);
    return true;
  }

  enableSafeArea();
  if (setup()) return;
  const observer = new MutationObserver(() => {
    if (!setup()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
