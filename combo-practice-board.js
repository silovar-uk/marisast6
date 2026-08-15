(() => {
  const STORAGE_KEY = "modern-marisa-practical-combo-board-v1";
  const TARGET = 10;

  const phases = [
    { id: "first", label: "まず覚える", note: "試合で出る回数が多い5本。最初はここだけでOK。" },
    { id: "next", label: "次に覚える", note: "ヒット確認・DR・DI・端を足して、取りこぼしを減らす。" },
    { id: "advanced", label: "発展", note: "SA分岐と端の伸ばし。基本が安定してから追加。" }
  ];

  const combos = [
    {
      id: "jab-basic",
      phase: "first",
      combo: "しゃがみ小P → しゃがみ小P → 小ディマカイルス",
      use: "暴れ、小さい確定反撃、密着で小Pが当たった時",
      difficulty: 1,
      tags: ["小技", "ノーゲージ"]
    },
    {
      id: "medium-basic",
      phase: "first",
      combo: "立ち中P → 中P派生 → 中ディマカイルス",
      use: "近距離の主力。立ち中Pがヒットした時",
      difficulty: 1,
      tags: ["主力", "ノーゲージ"]
    },
    {
      id: "back-heavy-basic",
      phase: "first",
      combo: "引き大P → 大ディマカイルス → 溜め立ち大P",
      use: "シミー、8F確反、引き大Pが当たった時の基準",
      difficulty: 2,
      tags: ["シミー", "確反"]
    },
    {
      id: "big-punish-basic",
      phase: "first",
      combo: "溜め立ち大P［パニカン］ → 引き大P → 大ディマカイルス → 溜め立ち大P",
      use: "無敵技など、大きな隙をガードした時",
      difficulty: 2,
      tags: ["パニカン", "大確反"]
    },
    {
      id: "sa3-basic",
      phase: "first",
      combo: "引き大P → 大ディマカイルス → 大グラディウス → SA3",
      use: "大ディマまで入って、SA3で倒し切りたい時",
      difficulty: 2,
      tags: ["SA3", "倒し切り"]
    },
    {
      id: "crmp-drive-rush",
      phase: "next",
      combo: "しゃがみ中P → キャンセルDR → 立ち中P → 引き大P → 大ディマカイルス → 溜め立ち大P",
      use: "中距離のしゃがみ中Pがヒット。ゲージを使ってダウンを取る時",
      difficulty: 2,
      tags: ["DR", "中距離"]
    },
    {
      id: "forward-medium-counter",
      phase: "next",
      combo: "前中P［カウンター］ → しゃがみ小P → 小ディマカイルス",
      use: "前中Pで差し込んでカウンター表示が出た時",
      difficulty: 2,
      tags: ["カウンター", "差し込み"]
    },
    {
      id: "standing-heavy-punish",
      phase: "next",
      combo: "立ち大P［パニカン］ → 立ち中P → 中P派生 → 中ディマカイルス",
      use: "立ち大Pで差し返し・確反を取ってパニカンした時",
      difficulty: 2,
      tags: ["パニカン", "差し返し"]
    },
    {
      id: "impact-center",
      phase: "next",
      combo: "インパクト［パニカン］ → 溜め引き大P → 引き大P → 大ディマカイルス → 溜め立ち大P",
      use: "中央でインパクト返し・インパクトがパニカンした時",
      difficulty: 2,
      tags: ["DI", "中央"]
    },
    {
      id: "impact-corner-easy",
      phase: "next",
      combo: "インパクト壁やられ → 前大K → 前大K → 小グラディウス",
      use: "画面端で壁やられ。まず落とさず完走したい時",
      difficulty: 1,
      tags: ["DI", "画面端"]
    },
    {
      id: "impact-corner-power",
      phase: "advanced",
      combo: "インパクト壁やられ → 大ディマカイルス → 溜め立ち大P → 立ち大P",
      use: "端DIの簡単版が安定して、少しリターンを伸ばしたい時",
      difficulty: 2,
      tags: ["DI", "画面端"]
    },
    {
      id: "sa1-standing-confirm",
      phase: "advanced",
      combo: "前中P → 大K派生 → SA1",
      use: "立ち相手に前中Pがヒットし、SA1で締めたい時。しゃがみ相手には大K派生が空振りするため注意",
      difficulty: 3,
      tags: ["SA1", "立ち限定"]
    },
    {
      id: "sa2-big-punish",
      phase: "advanced",
      combo: "溜め立ち大P［パニカン］ → 前大K → ODディマカイルス → 生DR → 前大K → 前大K → SA2",
      use: "大きな確反でSA2締めを選びたい時。ドライブゲージ3本使用",
      difficulty: 3,
      tags: ["SA2", "大確反"]
    },
    {
      id: "sa3-big-punish",
      phase: "advanced",
      combo: "溜め立ち大P［パニカン］ → 引き大P → 大ディマカイルス → 大グラディウス → SA3",
      use: "大きな隙から、難しい伸ばしをせずSA3まで確実に入れたい時",
      difficulty: 2,
      tags: ["SA3", "大確反"]
    }
  ];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function loadCounts() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return Object.fromEntries(combos.map(combo => {
        const value = Number(raw[combo.id] || 0);
        return [combo.id, Math.max(0, Math.min(TARGET, Number.isFinite(value) ? value : 0))];
      }));
    } catch {
      return Object.fromEntries(combos.map(combo => [combo.id, 0]));
    }
  }

  let counts = loadCounts();

  function saveCounts() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
    } catch {
      // 保存できない環境でも表は使える。
    }
  }

  function difficultyLabel(level) {
    return level === 1 ? "かんたん" : level === 2 ? "ふつう" : "発展";
  }

  function difficultyDots(level) {
    return `<span class="combo-practice-difficulty-dots" aria-hidden="true">${[1, 2, 3].map(index => `<i${index <= level ? ' class="is-on"' : ""}></i>`).join("")}</span>`;
  }

  function rowMarkup(combo, index) {
    const count = counts[combo.id] || 0;
    const stable = count >= TARGET;
    return `<tr data-combo-practice-row="${escapeHtml(combo.id)}" class="${stable ? "is-stable" : ""}">
      <td class="combo-practice-index" data-label="No."><span>${String(index + 1).padStart(2, "0")}</span></td>
      <td class="combo-practice-combo" data-label="コンボ">
        <strong>${escapeHtml(combo.combo)}</strong>
        <div class="combo-practice-tags">${combo.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      </td>
      <td class="combo-practice-use" data-label="使う場面">${escapeHtml(combo.use)}</td>
      <td class="combo-practice-difficulty" data-label="難易度">
        ${difficultyDots(combo.difficulty)}
        <span>${difficultyLabel(combo.difficulty)}</span>
      </td>
      <td class="combo-practice-score" data-label="成功">
        <div class="combo-practice-counter" aria-label="${escapeHtml(combo.combo)}の成功回数">
          <button type="button" data-practice-minus="${escapeHtml(combo.id)}" aria-label="成功回数を1減らす" ${count <= 0 ? "disabled" : ""}>−</button>
          <output data-practice-count="${escapeHtml(combo.id)}"><b>${count}</b><span>/${TARGET}</span></output>
          <button type="button" data-practice-plus="${escapeHtml(combo.id)}" aria-label="成功回数を1増やす" ${stable ? "disabled" : ""}>＋</button>
        </div>
        <small data-practice-state="${escapeHtml(combo.id)}">${stable ? "安定" : count > 0 ? "練習中" : "未着手"}</small>
      </td>
    </tr>`;
  }

  function phaseMarkup(phase) {
    const phaseCombos = combos.filter(combo => combo.phase === phase.id);
    return `<section class="combo-practice-phase" data-practice-phase="${escapeHtml(phase.id)}">
      <header class="combo-practice-phase-heading">
        <div><small>TRAINING STEP</small><h3>${escapeHtml(phase.label)}</h3><p>${escapeHtml(phase.note)}</p></div>
        <strong data-phase-progress="${escapeHtml(phase.id)}">0/${phaseCombos.length}</strong>
      </header>
      <div class="combo-practice-table-wrap">
        <table class="combo-practice-table">
          <thead><tr><th>No.</th><th>コンボ</th><th>使う場面</th><th>難易度</th><th>成功</th></tr></thead>
          <tbody>${phaseCombos.map(combo => rowMarkup(combo, combos.indexOf(combo))).join("")}</tbody>
        </table>
      </div>
    </section>`;
  }

  function boardMarkup() {
    return `<section id="combo-practice-board" class="combo-practice-board shell" aria-labelledby="combo-practice-title">
      <div class="combo-practice-head">
        <div>
          <p class="page-kicker">PRACTICE TABLE / 14 ROUTES</p>
          <h2 id="combo-practice-title">実戦コンボを、<em>10回ずつ。</em></h2>
          <p>最大火力より「試合で当たる始動」を優先。成功したら＋を押し、10/10で安定扱い。記録はこのブラウザ内だけに保存します。</p>
        </div>
        <div class="combo-practice-summary" aria-label="練習進捗">
          <div><small>安定</small><b data-practice-stable>0</b><span>/${combos.length}本</span></div>
          <div><small>成功</small><b data-practice-total>0</b><span>/${combos.length * TARGET}</span></div>
          <button type="button" data-practice-reset>記録をリセット</button>
        </div>
      </div>

      <div class="combo-practice-legend" aria-label="表記ルール">
        <span><b>方向</b> 前 / 引き / しゃがみ</span>
        <span><b>通常技</b> 小P / 中P / 大P・小K / 中K / 大K</span>
        <span><b>ラッシュ</b> キャンセルDR / 生DR</span>
        <span><b>必殺技</b> コマンド省略・技名のみ</span>
      </div>

      ${phases.map(phaseMarkup).join("")}

      <aside class="combo-practice-sources">
        <b>確認元</b>
        <span>基準は2026年8月3日調整。数値最大化ではなく、成立条件と実戦頻度を優先した練習表です。</span>
        <a href="https://www.streetfighter.com/6/ja-jp/character/marisa/frame" target="_blank" rel="noopener noreferrer">CAPCOM公式フレームデータ ↗</a>
        <a href="https://www.streetfighter.com/6/ja-jp/character/marisa/movelist" target="_blank" rel="noopener noreferrer">CAPCOM公式コマンドリスト ↗</a>
        <a href="https://www.sukoreru.com/sf6-modern-marisa" target="_blank" rel="noopener noreferrer">モダンマリーザ攻略 ↗</a>
      </aside>
    </section>`;
  }

  function renderProgress(root) {
    const total = combos.reduce((sum, combo) => sum + (counts[combo.id] || 0), 0);
    const stable = combos.filter(combo => (counts[combo.id] || 0) >= TARGET).length;
    const totalEl = root.querySelector("[data-practice-total]");
    const stableEl = root.querySelector("[data-practice-stable]");
    if (totalEl) totalEl.textContent = total;
    if (stableEl) stableEl.textContent = stable;

    phases.forEach(phase => {
      const phaseCombos = combos.filter(combo => combo.phase === phase.id);
      const phaseStable = phaseCombos.filter(combo => (counts[combo.id] || 0) >= TARGET).length;
      const progress = root.querySelector(`[data-phase-progress="${phase.id}"]`);
      if (progress) progress.textContent = `${phaseStable}/${phaseCombos.length}`;
    });
  }

  function updateRow(root, comboId) {
    const count = counts[comboId] || 0;
    const row = root.querySelector(`[data-combo-practice-row="${comboId}"]`);
    if (!row) return;
    row.classList.toggle("is-stable", count >= TARGET);
    const output = row.querySelector(`[data-practice-count="${comboId}"]`);
    if (output) output.innerHTML = `<b>${count}</b><span>/${TARGET}</span>`;
    const state = row.querySelector(`[data-practice-state="${comboId}"]`);
    if (state) state.textContent = count >= TARGET ? "安定" : count > 0 ? "練習中" : "未着手";
    const minus = row.querySelector(`[data-practice-minus="${comboId}"]`);
    const plus = row.querySelector(`[data-practice-plus="${comboId}"]`);
    if (minus) minus.disabled = count <= 0;
    if (plus) plus.disabled = count >= TARGET;
    renderProgress(root);
  }

  function mount() {
    if (document.querySelector("#combo-practice-board")) return;
    const intro = document.querySelector(".strategy-page-intro");
    if (!intro) return;
    intro.insertAdjacentHTML("afterend", boardMarkup());
    const root = document.querySelector("#combo-practice-board");
    if (!root) return;
    renderProgress(root);

    root.addEventListener("click", event => {
      const plus = event.target.closest("[data-practice-plus]");
      const minus = event.target.closest("[data-practice-minus]");
      const reset = event.target.closest("[data-practice-reset]");

      if (plus) {
        const id = plus.dataset.practicePlus;
        counts[id] = Math.min(TARGET, (counts[id] || 0) + 1);
        saveCounts();
        updateRow(root, id);
        return;
      }

      if (minus) {
        const id = minus.dataset.practiceMinus;
        counts[id] = Math.max(0, (counts[id] || 0) - 1);
        saveCounts();
        updateRow(root, id);
        return;
      }

      if (reset && window.confirm("コンボ練習の成功回数をすべて0に戻しますか？")) {
        counts = Object.fromEntries(combos.map(combo => [combo.id, 0]));
        saveCounts();
        combos.forEach(combo => updateRow(root, combo.id));
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
