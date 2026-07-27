(() => {
  const data = window.MARISA_PLAYBOOK;
  const root = document.querySelector("#strategy-gallery");
  if (!data || !root) return;

  const cards = new Map((data.cards || []).map(card => [card.id, card]));

  function cueFor(card) {
    if (!card) return null;

    switch (card.type) {
      case "decision": {
        const choice = card.choices?.[0];
        return choice ? { label: "まず試す", text: `${choice.label}：${choice.title}` } : null;
      }
      case "priority": {
        const item = card.priority?.[0];
        return item ? { label: "最優先", text: `${item.title}${item.text ? ` — ${item.text}` : ""}` } : null;
      }
      case "route": {
        const step = card.steps?.[0];
        return step ? { label: "最初の手順", text: step.text } : null;
      }
      case "practice": {
        const task = card.tasks?.[0];
        return task ? { label: "今日やる", text: `${task.title}${task.text ? ` — ${task.text}` : ""}` } : null;
      }
      case "combo":
        return card.use ? { label: "使う場面", text: card.use } : null;
      case "distance": {
        const zone = card.zones?.find(item => item.tone === "main") || card.zones?.[0];
        return zone ? { label: "基準行動", text: `${zone.name}：${zone.action}` } : null;
      }
      case "loadout": {
        const item = card.loadout?.[0];
        return item ? { label: "最初に持つ", text: `${item.move} — ${item.detail}` } : null;
      }
      case "comparison":
        return card.left && card.right ? { label: "比較する", text: `${card.left.title}／${card.right.title}` } : null;
      case "timeline": {
        const period = card.periods?.[0];
        return period ? { label: "開始地点", text: `${period.title} — ${period.text}` } : null;
      }
      case "codes": {
        const item = card.codes?.[0];
        return item ? { label: "最初の合図", text: `${item.code}：${item.label}` } : null;
      }
      case "verification": {
        const field = card.fields?.[0];
        return field ? { label: "確認ポイント", text: `${field.label}：${field.value}` } : null;
      }
      case "manifesto":
        return card.statement ? { label: "試合中の原則", text: card.statement } : null;
      case "evidence": {
        const item = card.evidence?.[0];
        return item ? { label: "読み替える", text: item.meaning } : null;
      }
      default:
        return null;
    }
  }

  function enhance(scope = root) {
    scope.querySelectorAll?.(".playbook-slide[data-playbook-card]").forEach(slide => {
      if (slide.querySelector(".playbook-action-cue")) return;
      const card = cards.get(slide.dataset.playbookCard);
      const cue = cueFor(card);
      if (!cue) return;

      const body = slide.querySelector(".playbook-card-body");
      if (!body) return;

      const aside = document.createElement("aside");
      aside.className = "playbook-action-cue";
      aside.setAttribute("aria-label", "このカードの実戦での使い方");

      const label = document.createElement("small");
      label.textContent = cue.label;
      const text = document.createElement("b");
      text.textContent = cue.text;
      aside.append(label, text);

      const anchor = body.querySelector(".playbook-card-lead") || body.querySelector("h3");
      anchor?.insertAdjacentElement("afterend", aside);
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
