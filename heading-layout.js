(() => {
  const guideTitleLines = new Map([
    ["このサイトは、技表ではなく判断の順番を読む。", ["このサイトは、技表ではなく", "判断の順番を読む。"]],
    ["状況カードは、答えを一つに決めるためのものではない。", ["状況カードは、答えを一つに", "決めるためのものではない。"]],
    ["技カードは、数値表ではなく使いどころの説明書。", ["技カードは、数値表ではなく", "使いどころの説明書。"]],
    ["試合全体を、距離と目的の連続として読む。", ["試合全体を、距離と目的の", "連続として読む。"]],
    ["このドリルは、コンボ入力より選択の癖を直す。", ["このドリルは、コンボ入力より", "選択の癖を直す。"]]
  ]);

  function normalize(value) {
    return String(value || "").replace(/\s+/g, "").trim();
  }

  function applyGuideTitleLines() {
    document.querySelectorAll(".editorial-guide h2").forEach(heading => {
      if (heading.dataset.lineBreaksApplied === "true") return;
      const source = normalize(heading.textContent);
      const entry = [...guideTitleLines.entries()].find(([title]) => normalize(title) === source);
      if (!entry) return;
      heading.textContent = "";
      entry[1].forEach(line => {
        const span = document.createElement("span");
        span.className = "editorial-title-line";
        span.textContent = line;
        heading.appendChild(span);
      });
      heading.dataset.lineBreaksApplied = "true";
    });
  }

  function markBalancedHeadings() {
    document.querySelectorAll([
      ".home-hero h1",
      ".page-hero h1",
      ".editorial-guide h2",
      ".editorial-guide h3",
      ".home-method h2",
      ".first-six-head h2",
      ".finder-heading h2",
      ".move-group-heading h2",
      ".advantage-heading h2",
      ".strategy-page-intro h1"
    ].join(",")).forEach(heading => heading.classList.add("is-balanced-heading"));
  }

  function apply() {
    applyGuideTitleLines();
    markBalancedHeadings();
  }

  if (typeof document === "undefined") return;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(apply, 0));
  } else {
    setTimeout(apply, 0);
  }
})();
