(() => {
  const target = window.MARISA_SITUATIONS;
  const legacyGroups = window.MARISA_DATA?.situationGroups || [];
  if (!target || !Array.isArray(legacyGroups)) return;

  const phaseMap = {
    ground: "neutral",
    projectile: "neutral",
    offense: "pressure",
    corner: "pressure",
    defense: "defense",
    "anti-air": "defense",
    combo: "conversion",
    resource: "conversion"
  };

  const positionFrom = text => {
    if (/自分が端|端を背負|バーンアウト中、端/.test(text)) return "own-corner";
    if (/相手を端|端で固め|画面端|壁やられ|端・/.test(text)) return "opponent-corner";
    if (/中央/.test(text)) return "center";
    return "any";
  };

  const distanceFrom = text => {
    if (/遠距離|遠め/.test(text)) return "far";
    if (/中距離|開幕距離|牽制/.test(text)) return "mid";
    if (/投げ間合い|近距離|密着|起き攻め/.test(text)) return "throw-in";
    return "any";
  };

  const opponentFrom = text => {
    if (/暴れ|小技連携/.test(text)) return "mash";
    if (/ガードを固め|立ちガード/.test(text)) return "block";
    if (/投げ抜け/.test(text)) return "tech";
    if (/無敵技|切り返し/.test(text)) return "reversal";
    if (/ジャンプ|飛び|垂直|めくり/.test(text)) return "jump";
    if (/パリィ|ジャスパ/.test(text)) return "parry";
    return "all";
  };

  const moveName = id => window.MARISA_DATA?.moves?.find(move => move.id === id)?.name || id;
  const existing = new Set(target.items.map(item => item.id));

  legacyGroups.forEach(group => {
    (group.situations || []).forEach(value => {
      if (!value?.id || existing.has(value.id)) return;
      const text = [value.title, value.copy, value.primary, value.alternatives, value.risk].filter(Boolean).join(" ");
      target.items.push({
        id: value.id,
        phase: phaseMap[group.id] || "neutral",
        section: group.name,
        level: "foundation",
        title: value.title,
        summary: value.copy,
        conditions: {
          position: positionFrom(text),
          distance: distanceFrom(text),
          opponent: opponentFrom(text)
        },
        answers: {
          primary: value.primary,
          stable: value.alternatives
        },
        matchup: {
          beats: [],
          losesTo: [],
          caution: value.risk
        },
        tags: [group.name, "既存40状況"],
        links: {
          movesSituation: value.id,
          moves: (value.moves || []).map(id => ({ id, label: moveName(id) }))
        },
        verification: {
          status: "legacy",
          statusLabel: "既存データ",
          gameVersion: target.gameVersion,
          verifiedAt: null,
          sourceIds: [],
          note: "従来の状況カードを新Finderへ自動変換。詳細条件は今後v2形式へ更新する。"
        },
        legacy: true
      });
      existing.add(value.id);
    });
  });

  target.stats = {
    categories: target.categories.length,
    situations: target.items.length,
    detailed: target.items.filter(item => !item.legacy).length,
    legacy: target.items.filter(item => item.legacy).length
  };
})();
