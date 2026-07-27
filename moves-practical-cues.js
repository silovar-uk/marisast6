(() => {
  const data = window.MARISA_DATA;
  const root = document.querySelector("#move-list");
  if (!data || !root) return;

  const moves = new Map((data.moves || []).map(move => [move.id, move]));
  const cardSelector = ".move-card[data-move-id]";

  function cueReason(move) {
    if (move.strong?.length) return `強み：${move.strong[0]}`;
    if (move.purposes?.length) return `用途：${move.purposes.join("・")}`;
    return "用途と成立条件を確認して使う。";
  }

  function enhance(scope = root) {
    const cards = [];
    if (scope.matches?.(cardSelector)) cards.push(scope);
    scope.querySelectorAll?.(cardSelector).forEach(card => cards.push(card));

    cards.forEach(card => {
      const move = moves.get(card.dataset.moveId);
      if (!move) return;

      const summary = card.querySelector(".move-purpose-summary");
      if (summary) summary.textContent = move.when || (move.purposes || []).join("・");

      const actionText = card.querySelector(".move-action-text");
      if (actionText) actionText.textContent = move.when || "用途を確認する";

      const actionReason = card.querySelector(".move-action-reason");
      if (actionReason) actionReason.textContent = cueReason(move);
    });
  }

  enhance();
  const observer = new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) enhance(node);
    }));
  });
  observer.observe(root, { childList: true, subtree: true });
})();
