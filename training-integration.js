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
    "anti-air-front": "下の方向キーと攻撃ボタンで回答",
    "impact-response": "DI返し、または待つを選ぶ",
    "hit-confirm-medium": "A中を継続するか、待つ",
    "close-defense": "A弱・A強・待つから選ぶ",
    "punish-heavy": "A強を押すか、待つ",
    "assist-decision": "A弱・A中・A強・待つから選ぶ"
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

  function enhancePrompt(lab) {
    const responses = lab.querySelector(".training-special-responses");
    if (!responses) return;

    if (!responses.querySelector('[data-training-response="wait"]')) {
      const wait = document.createElement("button");
      wait.type = "button";
      wait.dataset.trainingResponse = "wait";
      wait.textContent = "待つ";
      responses.append(wait);
    }

    const skill = lab.dataset.trainingSkill || "";
    const impact = responses.querySelector('[data-training-response="impact"]');
    if (impact) impact.hidden = !["anti-air-front", "impact-response"].includes(skill);

    const prompt = lab.querySelector(".training-prompt");
    if (prompt && !prompt.querySelector(".training-mobile-guide")) {
      const guide = document.createElement("div");
      guide.className = "training-mobile-guide";
      guide.textContent = GUIDE[skill] || "下の回答盤から選ぶ";
      responses.before(guide);
    }
  }

  function sync(lab) {
    const view = detectView(lab);
    lab.dataset.trainingView = view;
    lab.dataset.trainingSkill = view === "controller" ? "" : detectSkill(lab);
    if (view === "drill") enhancePrompt(lab);
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
