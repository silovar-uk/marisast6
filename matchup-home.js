(() => {
  const data = window.MARISA_MATCHUPS;
  const dashboard = document.querySelector("#home-dashboard");
  if (!data || !dashboard || document.querySelector(".home-matchup-brief")) return;

  const readJson = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
  };
  const progress = readJson("modern-marisa-matchup-progress-v1", { characters: {} });
  const logs = readJson("modern-marisa-matchup-logs-v1", []);
  const weakId = Object.entries(progress.characters || {}).find(([, value]) => value?.weak)?.[0];
  const lastId = [...logs].sort((a, b) => b.at - a.at)[0]?.characterId;
  const id = data.byId[lastId] ? lastId : (data.byId[weakId] ? weakId : "ryu");
  const profile = data.byId[id];
  const recent = logs.filter(item => item.characterId === id).slice(-10);
  const mistakeCounts = recent.reduce((map, item) => ({ ...map, [item.mistake]: (map[item.mistake] || 0) + 1 }), {});
  const dominant = Object.entries(mistakeCounts).filter(([key]) => key !== "correct").sort((a, b) => b[1] - a[1])[0]?.[0];
  const focus = data.mistakeMeta[dominant]?.prescription || "前進を見た時だけ一回置く。空振り後はガードへ戻す。";
  const reviewed = Object.values(progress.characters || {}).filter(item => item?.viewed).length;

  const section = document.createElement("section");
  section.className = "home-matchup-brief shell";
  section.setAttribute("aria-labelledby", "home-matchup-title");
  section.innerHTML = `
    <div class="home-matchup-copy">
      <small>MATCHUP LAB / PERSONAL</small>
      <h2 id="home-matchup-title">次は、${profile.name}戦。</h2>
      <p>${focus}</p>
      <div><a href="matchups.html?character=${encodeURIComponent(profile.id)}#matchup-detail">30秒の対策を見る</a><a href="matchups.html?character=${encodeURIComponent(profile.id)}#matchup-drill">三択ドリル</a></div>
    </div>
    <dl>
      <div><dt>警戒</dt><dd>${profile.threat}</dd></div>
      <div><dt>危険距離</dt><dd>${profile.danger}</dd></div>
      <div><dt>確認済み</dt><dd>${reviewed}/31キャラ</dd></div>
    </dl>`;
  dashboard.insertAdjacentElement("afterend", section);
})();
