(() => {
  const data = window.MARISA_DATA;
  const root = document.querySelector("#situation-groups");
  if (!data || !root) return;

  root.innerHTML = (data.situationGroups || []).map((group, groupIndex) => `
    <section class="situation-group">
      <header class="situation-group-header">
        <span>${String(groupIndex + 1).padStart(2, "0")}</span>
        <h2>${group.name}</h2>
        <p>${group.copy}</p>
      </header>
      <div class="situation-list">
        ${group.situations.map((item, itemIndex) => `
          <a class="situation-link" href="moves.html?situation=${encodeURIComponent(item.id)}">
            <div class="situation-link-title"><small>${String(itemIndex + 1).padStart(2, "0")}</small><b>${item.title}</b></div>
            <div class="situation-link-copy">${item.copy}</div>
            <div class="situation-link-choice"><small>第一候補</small><b>${item.primary}</b></div>
            <span class="situation-link-arrow">→</span>
            <div class="situation-link-risk">代替：${item.alternatives}　／　注意：${item.risk}</div>
          </a>`).join("")}
      </div>
    </section>`).join("");
})();
