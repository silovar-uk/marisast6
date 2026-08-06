window.MARISA_DATA = {
  categories: ["通常技", "特殊技", "ターゲット", "ジャンプ", "必殺技", "SA", "投げ"],
  purposes: [
    "牽制", "差し返し", "暴れ", "下段", "対空", "飛び込み", "弾抜け",
    "インパクト対策", "起き攻め", "崩し", "切り返し", "コンボ", "確定反撃", "端攻め"
  ],
  purposeCards: [
    { name: "対空", copy: "飛びを見た瞬間の選択肢", hint: "ワンボタングラディウス・SA2・↓＋強" },
    { name: "牽制", copy: "相手を近づけず地上を制圧", hint: "N＋中・グラディウス" },
    { name: "差し返し", copy: "空振りを見て大きく殴る", hint: "N＋強・↘＋強" },
    { name: "暴れ", copy: "近距離の隙を最速で割る", hint: "↓＋弱" },
    { name: "弾抜け", copy: "飛び道具を見て接近する", hint: "ファランクス・SA3" },
    { name: "起き攻め", copy: "ダウン後の本命二択", hint: "長押し←＋強・エンフォルド" },
    { name: "切り返し", copy: "守勢を無敵・アーマーで拒否", hint: "SA2・ODスクトゥム" },
    { name: "端攻め", copy: "壁を背負わせて試合を壊す", hint: "ODファランクス・ODクアドリガ" }
  ],
  firstSix: ["crLP", "stMK", "aMP", "gladiusL", "phalanxM", "sa2"],
  moves: []
};

window.MARISA_YEAR4 = window.MARISA_YEAR4 || {
  version: "0.23.2-year4",
  basisDate: "2026-08-03",
  phase: 4,
  changeLog: []
};

const MARISA_HAS_DOCUMENT = typeof document !== "undefined";

function appendMarisaStylesheet(href, dataKey) {
  if (!MARISA_HAS_DOCUMENT || document.querySelector(`link[data-${dataKey}]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset[dataKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = "true";
  document.head.appendChild(link);
}

appendMarisaStylesheet("contrast-guard.css?v=20260805", "contrast-guard");
appendMarisaStylesheet("icon-system.css?v=20260806", "icon-system");
appendMarisaStylesheet("icon-density.css?v=20260806", "icon-density");
appendMarisaStylesheet("immersive-lab.css?v=20260806-2", "immersive-lab");

if (MARISA_HAS_DOCUMENT && document.readyState === "loading") {
  document.write('<script src="year4-phase1.js?v=0.23.3"></' + 'script>');
  document.write('<script src="year4-phase2.js?v=0.23.3"></' + 'script>');
  document.write('<script src="year4-phase3.js?v=0.23.3"></' + 'script>');
  document.write('<script src="year4-phase4.js?v=0.23.3"></' + 'script>');
  document.write('<script src="year4-playbook-guard.js?v=0.23.3"></' + 'script>');
  document.write('<script src="year4-tactical-additions.js?v=0.23.3"></' + 'script>');
  document.write('<script src="heading-layout.js?v=0.23.3"></' + 'script>');
  document.write('<script src="icon-system.js?v=20260806"></' + 'script>');
  document.write('<script src="immersive-lab.js?v=20260806-2"></' + 'script>');
  document.write('<script src="contrast-guard.js?v=20260805"></' + 'script>');
}

if (MARISA_HAS_DOCUMENT) {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      const moveCount = window.MARISA_DATA?.moves?.length || 0;
      document.querySelectorAll(".home-hero-note").forEach(note => {
        note.innerHTML = `基準：2026年8月3日調整<br>現行モダン技 ${moveCount}件・一部再計測中<br>進捗はブラウザ内だけに保存`;
      });
      document.querySelectorAll(".site-footer span").forEach(span => {
        span.textContent = span.textContent.replace(/v0\.\d+\.\d+/, "v0.23.2");
      });
      if (!document.querySelector("#year4-version-style")) {
        const style = document.createElement("style");
        style.id = "year4-version-style";
        style.textContent = 'html body:has(.home-hero) .site-footer span::after,html body:has(.moves-workspace) .site-footer span::after{content:"v0.23.2 / YEAR 4"}';
        document.head.appendChild(style);
      }
    }, 0);
  });
}
