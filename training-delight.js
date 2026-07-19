(() => {
  const TRAINING_KEY = "marisa-training-state-v1";
  const DELIGHT_KEY = "marisa-training-delight-v1";
  const $ = (selector, root = document) => root.querySelector(selector);

  const runtime = {
    previousView: "controller",
    streak: 0,
    bestStreak: 0,
    lastFeedbackSignature: "",
    lastScores: null,
    lastCelebratedAttempt: "",
    lastMissionCount: 0,
    syncing: false
  };

  const correctLines = [
    "いい判断。先に目が勝ってる。",
    "見えてる。その一回が実戦を変える。",
    "迷わなかった。いまのは強い。",
    "その反応、ちゃんと対戦へ持っていける。"
  ];

  const recoveryLines = [
    "いまの一問が、次の正解になる。",
    "間違いを見つけた。練習としては前進。",
    "答えは分かった。次は見えた瞬間に押す。",
    "ここで間違えたぶん、対戦で一回助かる。"
  ];

  function readJson(key, fallback) {
    try {
      return { ...fallback, ...JSON.parse(localStorage.getItem(key) || "{}") };
    } catch {
      return { ...fallback };
    }
  }

  function saveDelight(patch) {
    const current = readJson(DELIGHT_KEY, {});
    try { localStorage.setItem(DELIGHT_KEY, JSON.stringify({ ...current, ...patch })); } catch {}
  }

  function readTrainingStore() {
    return readJson(TRAINING_KEY, { attempts: [], viewedSkills: [], mission: null });
  }

  function todayKey(offset = 0) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function dailyStreak(attempts) {
    const days = new Set(attempts.map(item => item.date).filter(Boolean));
    let offset = days.has(todayKey()) ? 0 : -1;
    let count = 0;
    while (days.has(todayKey(offset))) {
      count += 1;
      offset -= 1;
    }
    return count;
  }

  function detectView(lab) {
    return lab.dataset.trainingView || (lab.classList.contains("training-active") ? "dashboard" : "controller");
  }

  function ensureLayer(lab) {
    let layer = $(".training-delight-overlay", lab);
    if (layer) return layer;
    layer = document.createElement("div");
    layer.className = "training-delight-overlay";
    layer.setAttribute("aria-live", "polite");
    layer.innerHTML = `<div class="training-joy-toast" hidden><small></small><b></b></div><div class="training-joy-spark" aria-hidden="true"></div>`;
    lab.append(layer);
    return layer;
  }

  let toastTimer = null;
  function showToast(lab, title, body, tone = "good") {
    const layer = ensureLayer(lab);
    const toast = $(".training-joy-toast", layer);
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.dataset.tone = tone;
    $("small", toast).textContent = title;
    $("b", toast).textContent = body;
    toast.hidden = false;
    toast.classList.remove("is-showing");
    requestAnimationFrame(() => toast.classList.add("is-showing"));
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-showing");
      setTimeout(() => { toast.hidden = true; }, 220);
    }, tone === "milestone" ? 1800 : 1250);
  }

  function burst(lab, tone = "good") {
    const layer = ensureLayer(lab);
    const spark = $(".training-joy-spark", layer);
    if (!spark) return;
    spark.dataset.tone = tone;
    spark.classList.remove("is-bursting");
    void spark.offsetWidth;
    spark.classList.add("is-bursting");
  }

  function parseScores(root) {
    const result = { correct: 0, missed: 0, falsePositive: 0, inputError: 0 };
    root.querySelectorAll(".training-score-live span").forEach(item => {
      const text = item.textContent || "";
      const value = Number(item.querySelector("b")?.textContent || 0);
      if (text.includes("正答")) result.correct = value;
      else if (text.includes("見逃し")) result.missed = value;
      else if (text.includes("誤反応")) result.falsePositive = value;
      else if (text.includes("入力違い")) result.inputError = value;
    });
    return result;
  }

  function addMeter(root) {
    const score = $(".training-score-live", root);
    if (!score || $(".training-joy-meter", root)) return;
    const meter = document.createElement("div");
    meter.className = "training-joy-meter";
    meter.innerHTML = `<span>連続判断</span><b>${runtime.streak}</b><i>${runtime.streak >= 5 ? "流れが来てる" : runtime.streak >= 3 ? "判断が温まってきた" : "一問ずつでいい"}</i>`;
    score.after(meter);
  }

  function updateMeter(root) {
    const meter = $(".training-joy-meter", root);
    if (!meter) return;
    $("b", meter).textContent = runtime.streak;
    $("i", meter).textContent = runtime.streak >= 10 ? "対戦へ持っていける" : runtime.streak >= 5 ? "もう偶然ではない" : runtime.streak >= 3 ? "判断が温まってきた" : "一問ずつでいい";
    meter.classList.toggle("is-hot", runtime.streak >= 3);
  }

  function answerFlavor(root) {
    const prompt = $(".training-prompt h1", root)?.textContent || "";
    const feedback = $(".training-feedback", root)?.textContent || "";
    if (/待てた|何も|連携|ガード/.test(`${prompt} ${feedback}`)) return "押さなかった。格ゲーでいちばん難しいやつ。";
    if (/ジャンプ|飛び/.test(prompt)) return "見えた。落とした。次も同じ景色。";
    if (/インパクト|赤い/.test(prompt)) return "赤を見て返した。反応が先に出た。";
    if (/大きな隙|無敵技|空振り/.test(prompt)) return "隙を見てから押せた。火力より大事。";
    return correctLines[(runtime.streak - 1) % correctLines.length];
  }

  function processFeedback(lab, root) {
    const feedback = $(".training-feedback", root);
    if (!feedback) return;
    const counter = $(".training-trial-counter", root)?.textContent?.replace(/\s+/g, "") || "";
    const scores = parseScores(root);
    const signature = `${counter}|${scores.correct}|${scores.missed}|${scores.falsePositive}|${scores.inputError}|${feedback.className}`;
    if (signature === runtime.lastFeedbackSignature) return;
    runtime.lastFeedbackSignature = signature;

    const previous = runtime.lastScores || { correct: 0, missed: 0, falsePositive: 0, inputError: 0 };
    const correct = feedback.classList.contains("correct") || scores.correct > previous.correct;
    runtime.lastScores = scores;

    if (correct) {
      runtime.streak += 1;
      runtime.bestStreak = Math.max(runtime.bestStreak, runtime.streak);
      const milestone = [3, 5, 10, 15, 20].includes(runtime.streak);
      showToast(lab, milestone ? `${runtime.streak}連続` : "GOOD READ", milestone ? (runtime.streak >= 10 ? "もう対戦で試していい。" : "手ではなく、判断が温まってきた。") : answerFlavor(root), milestone ? "milestone" : "good");
      burst(lab, milestone ? "milestone" : "good");
      navigator.vibrate?.(milestone ? [14, 25, 26] : 12);
    } else {
      runtime.streak = 0;
      showToast(lab, "NEXT ONE", recoveryLines[(scores.missed + scores.falsePositive + scores.inputError) % recoveryLines.length], "soft");
    }
    updateMeter(root);
  }

  function decorateDashboard(lab, root) {
    const hero = $(".training-hero-panel", root);
    if (!hero || $(".training-joy-summary", root)) return;
    const store = readTrainingStore();
    const todayAttempts = store.attempts.filter(item => item.date === todayKey()).length;
    const streak = dailyStreak(store.attempts);
    const firstTime = store.attempts.length === 0;

    const summary = document.createElement("section");
    summary.className = "training-joy-summary";
    summary.innerHTML = `
      <div><small>TODAY</small><b>${todayAttempts}</b><span>セッション</span></div>
      <div><small>CONTINUE</small><b>${streak}</b><span>日連続</span></div>
      <p>${firstTime ? "今日は勝たなくていい。ひとつ見えれば、ちゃんと前進。" : todayAttempts ? "もう練習を始めている。それだけで昨日より具体的。" : "3分だけ、ひとつ直す。長くやるより、戻ってこられる方が強い。"}</p>`;
    hero.after(summary);

    if (firstTime && !$(".training-first-gift", root)) {
      const gift = document.createElement("section");
      gift.className = "training-first-gift";
      gift.innerHTML = `<div><small>FIRST SESSION</small><b>最初の成功は、正解することじゃない。</b><p>最近の負け方を一つ選べたら、もう練習は始まっている。</p></div><button type="button" data-joy-first-start>おすすめから始める</button>`;
      summary.after(gift);
    }
  }

  function decorateSkill(root) {
    const head = $(".training-skill-head", root);
    if (!head || $(".training-skill-encouragement", root)) return;
    const note = document.createElement("p");
    note.className = "training-skill-encouragement";
    note.textContent = "全問正解より、迷わず選べた一問を増やす。そこからで十分。";
    head.after(note);
  }

  function readResultNumber(root, label) {
    const card = [...root.querySelectorAll(".training-result-grid > div")].find(item => item.querySelector("small")?.textContent === label);
    return Number(card?.querySelector("b")?.textContent || 0);
  }

  function decorateResult(lab, root) {
    const result = $(".training-result-view", root);
    if (!result || $(".training-achievements", result)) return;
    const rate = Number($(".training-result-hero h1", result)?.textContent?.replace(/\D/g, "") || 0);
    const missed = readResultNumber(result, "見逃し");
    const falsePositive = readResultNumber(result, "誤反応");
    const inputError = readResultNumber(result, "入力違い");
    const passed = result.classList.contains("passed");
    const badges = [];
    if (rate === 100) badges.push(["PERFECT READ", "全部見えた"]);
    if (falsePositive === 0) badges.push(["CALM", "押さない判断"]);
    if (missed === 0) badges.push(["NO MISS", "見逃しゼロ"]);
    if (inputError === 0) badges.push(["CLEAN INPUT", "入力違いゼロ"]);
    if (runtime.bestStreak >= 3) badges.push([`${runtime.bestStreak} CHAIN`, "連続判断"]);
    if (!badges.length) badges.push(["ONE STEP", "弱点を発見"]);

    const section = document.createElement("section");
    section.className = "training-achievements";
    section.innerHTML = `<div class="training-achievements-head"><small>TODAY'S WIN</small><b>${passed ? "できたことを、ちゃんと持って帰る。" : "弱点が一つ具体的になった。今日はそれで勝ち。"}</b></div><div class="training-badge-list">${badges.slice(0, 4).map(([title, copy]) => `<div><span>◆</span><p><b>${title}</b><small>${copy}</small></p></div>`).join("")}</div>`;
    $(".training-result-reading", result)?.before(section);

    const store = readTrainingStore();
    const latest = store.attempts.at(-1);
    const delight = readJson(DELIGHT_KEY, {});
    if (latest?.id && delight.lastCelebratedAttempt !== latest.id) {
      saveDelight({ lastCelebratedAttempt: latest.id, allTimeBestStreak: Math.max(Number(delight.allTimeBestStreak || 0), runtime.bestStreak) });
      showToast(lab, passed ? "SESSION CLEAR" : "SESSION COMPLETE", passed ? "今日の判断を、明日の自分へ保存した。" : "苦手が見えた。これはちゃんと成果。", passed ? "milestone" : "good");
      if (passed) burst(lab, "result");
    }
  }

  function decorateMission(root) {
    const card = $(".training-mission-card", root);
    if (!card || $(".training-mission-promise", root)) return;
    const promise = document.createElement("p");
    promise.className = "training-mission-promise";
    promise.textContent = "成功は一度でいい。対戦中に一度見えたら、練習はつながった。";
    card.after(promise);
  }

  function processMission(lab, root) {
    const count = Number($(".training-mission-count b", root)?.textContent || $(".training-mission-strip strong", root)?.textContent || 0);
    if (count <= runtime.lastMissionCount) return;
    runtime.lastMissionCount = count;
    const messages = {
      1: "練習が実戦につながった。これは本物の1点。",
      3: "3回使えた。もう偶然ではない。",
      5: "5回成功。新しい選択肢になり始めてる。",
      10: "10回達成。次の課題へ進んでいい。"
    };
    showToast(lab, `${count} MATCH SUCCESS`, messages[count] || "実戦で使えた回数がまた増えた。", count >= 3 ? "milestone" : "good");
    burst(lab, count >= 3 ? "result" : "good");
  }

  function sync(lab) {
    if (runtime.syncing) return;
    runtime.syncing = true;
    requestAnimationFrame(() => {
      const root = $("[data-training-view]", lab);
      const view = detectView(lab);
      ensureLayer(lab);

      if (view !== runtime.previousView) {
        if (view === "drill") {
          runtime.streak = 0;
          runtime.bestStreak = 0;
          runtime.lastFeedbackSignature = "";
          runtime.lastScores = null;
        }
        runtime.previousView = view;
      }

      if (root) {
        if (view === "dashboard") decorateDashboard(lab, root);
        else if (view === "skill") decorateSkill(root);
        else if (view === "drill") {
          addMeter(root);
          updateMeter(root);
          processFeedback(lab, root);
        } else if (view === "result") decorateResult(lab, root);
        else if (view === "mission") decorateMission(root);
        processMission(lab, root);
      }
      runtime.syncing = false;
    });
  }

  function setup() {
    const lab = $("#controller-lab");
    if (!lab) return false;
    if (lab.dataset.delightReady === "true") return true;
    lab.dataset.delightReady = "true";
    ensureLayer(lab);

    const initialMission = readTrainingStore().mission;
    runtime.lastMissionCount = Number(initialMission?.successes || 0);

    lab.addEventListener("click", event => {
      if (event.target.closest("[data-joy-first-start]")) {
        event.preventDefault();
        const recommended = $(".training-recommendation button", lab);
        recommended?.click();
        showToast(lab, "FIRST STEP", "ひとつ選べた。もう練習は始まってる。", "good");
      }
      if (event.target.closest("[data-training-open]")) {
        setTimeout(() => showToast(lab, "TODAY'S LAB", "今日はひとつだけ上手くなる。", "good"), 180);
      }
    }, true);

    const observer = new MutationObserver(() => sync(lab));
    observer.observe(lab, { attributes: true, childList: true, subtree: true });
    sync(lab);
    return true;
  }

  if (setup()) return;
  const observer = new MutationObserver(() => {
    if (!setup()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
