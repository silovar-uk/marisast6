(() => {
  const drill = window.MARISA_DRILL;
  const playbook = window.MARISA_PLAYBOOK;
  if (!drill || !playbook) return;

  const routeIds = new Set(drill.routes.map(route => route.id));
  const cardIds = new Set(playbook.cards.map(card => card.id));

  const scenarioByRoute = {
    "crLP-normal-basic": "stable-crlp-normal",
    "crLP-normal-lethal": "resource-crlp-lethal",
    "crLP-counter-basic": "confirm-crlp-counter",
    "crLP-punish-basic": "confirm-crlp-punish",
    "stHP-normal-basic": "stable-sthp-normal",
    "stHP-punish-basic": "punish-sthp-stable",
    "stHP-punish-power": "power-sthp-punish",
    "bHP-normal-charge": "control-bhp-charge",
    "bHP-normal-plain": "control-bhp-plain",
    "bHP-counter-basic": "control-bhp-counter",
    "bHP-punish-command": "power-bhp-punish",
    "bHP-punish-simple": "punish-bhp-simple",
    "aMP-normal-basic": "stable-amp-normal",
    "aMP-normal-od": "resource-amp-oki",
    "aMP-normal-power": "power-amp-carry",
    "aMP-counter-basic": "confirm-amp-counter",
    "aMP-punish-basic": "punish-amp"
  };

  const families = [
    {
      id: "light",
      label: "↓弱始動",
      description: "A弱コンボを入口に、小技ヒットの完走、カウンター、パニカン、倒し切りへ広げる。",
      entry: { cardId: "assist-light-1320", label: "入口：A弱コンボ", type: "assist" },
      routes: [
        { routeId: "crLP-normal-basic", cardId: "starter-light-dima", prerequisites: [] },
        { routeId: "crLP-counter-basic", cardId: "starter-light-dima", prerequisites: ["crLP-normal-basic"] },
        { routeId: "crLP-punish-basic", cardId: "punish-light-close", prerequisites: ["crLP-counter-basic"] },
        { routeId: "crLP-normal-lethal", cardId: "punish-light-close", prerequisites: ["crLP-normal-basic"] }
      ]
    },
    {
      id: "assist-medium",
      label: "A中始動",
      description: "アシスト完走から短い手動ルートへ移り、OD起き攻めと最大運びを選び分ける。",
      entry: { cardId: "assist-medium-2660", label: "入口：A中コンボ", type: "assist" },
      routes: [
        { routeId: "aMP-normal-basic", cardId: "starter-assist-medium-dima", prerequisites: [] },
        { routeId: "aMP-normal-od", cardId: "amp-od-dima-route", prerequisites: ["aMP-normal-basic"] },
        { routeId: "aMP-counter-basic", cardId: "starter-assist-medium-dima", prerequisites: ["aMP-normal-basic"] },
        { routeId: "aMP-punish-basic", cardId: "amp-od-dima-route", prerequisites: ["aMP-normal-basic"] },
        { routeId: "aMP-normal-power", cardId: "amp-od-dima-route", prerequisites: ["aMP-normal-od"] }
      ]
    },
    {
      id: "standing-heavy",
      label: "N強始動",
      description: "A強コンボを入口に、通常ヒット、ノーゲージ確反、長押し最大へ段階を上げる。",
      entry: { cardId: "assist-heavy-3020", label: "入口：A強コンボ", type: "assist" },
      routes: [
        { routeId: "stHP-normal-basic", cardId: "poke-standing-heavy-punish", prerequisites: [] },
        { routeId: "stHP-punish-basic", cardId: "poke-standing-heavy-punish", prerequisites: ["stHP-normal-basic"] },
        { routeId: "stHP-punish-power", cardId: "punish-heavy-lethal", prerequisites: ["stHP-punish-basic"] }
      ]
    },
    {
      id: "back-heavy",
      label: "←強始動",
      description: "通常ヒット、カウンター、長押し、パニカン簡易入力と最大反撃を分ける。",
      entry: { cardId: "starter-back-heavy-dima-sa3", label: "入口：←強の基準カード", type: "manual" },
      routes: [
        { routeId: "bHP-normal-plain", cardId: "starter-back-heavy-dima-sa3", prerequisites: [] },
        { routeId: "bHP-counter-basic", cardId: "shimmy-back-heavy", prerequisites: ["bHP-normal-plain"] },
        { routeId: "bHP-normal-charge", cardId: "starter-back-heavy-dima-sa3", prerequisites: ["bHP-normal-plain"] },
        { routeId: "bHP-punish-simple", cardId: "shimmy-back-heavy", prerequisites: [] },
        { routeId: "bHP-punish-command", cardId: "shimmy-back-heavy", prerequisites: ["bHP-punish-simple"] }
      ]
    },
    {
      id: "forward-medium",
      label: "→中始動",
      description: "カウンター確認を先に固定し、立ち確認とSA3がそろう時だけ最大へ進む。",
      entry: { cardId: "poke-forward-medium-counter", label: "入口：→中カウンター", type: "manual" },
      routes: [
        { routeId: "fMP-counter-basic", cardId: "poke-forward-medium-counter", prerequisites: [] },
        { routeId: "fMP-normal-sa", cardId: "poke-forward-medium-counter", prerequisites: ["fMP-counter-basic"] }
      ]
    },
    {
      id: "knee",
      label: "膝・A強始動",
      description: "通常ヒットの主力を固定し、長押しパニカンを確認できる時だけ最大へ進む。",
      entry: { cardId: "starter-assist-heavy-sa3", label: "入口：A強の確定反撃", type: "assist" },
      routes: [
        { routeId: "fHK-normal-basic", cardId: "assist-heavy-3020", prerequisites: [] },
        { routeId: "fHK-punish-charge", cardId: "starter-charged-heavy-punish", prerequisites: ["fHK-normal-basic"] }
      ]
    },
    {
      id: "od-dima",
      label: "ODディマ対空",
      description: "短い起き攻めルートを先に安定させ、高度とゲージを確認できる時だけ運びへ進む。",
      entry: { cardId: "light-od-dima-2584", label: "入口：ODディマの追撃確認", type: "manual" },
      routes: [
        { routeId: "dimachaerusOD-normal-basic", cardId: "light-od-dima-2584", prerequisites: [] },
        { routeId: "dimachaerusOD-normal-power", cardId: "amp-od-dima-route", prerequisites: ["dimachaerusOD-normal-basic"] }
      ]
    },
    {
      id: "od-phalanx",
      label: "ODファランクス・端",
      description: "壁やられ追撃を標準として固定し、端維持とSA分岐の土台にする。",
      entry: { cardId: "impact-wall-od-phalanx", label: "入口：壁やられODファランクス", type: "manual" },
      routes: [
        { routeId: "phalanxOD-normal-basic", cardId: "impact-wall-od-phalanx", prerequisites: [] }
      ]
    }
  ];

  const routeToFamily = {};
  const routeToCard = {};
  const errors = [];

  families.forEach((family, familyIndex) => {
    if (!cardIds.has(family.entry.cardId)) errors.push(`unknown entry card: ${family.id}:${family.entry.cardId}`);
    family.routes.forEach((item, routeIndex) => {
      if (!routeIds.has(item.routeId)) errors.push(`unknown route: ${family.id}:${item.routeId}`);
      if (!cardIds.has(item.cardId)) errors.push(`unknown card: ${item.routeId}:${item.cardId}`);
      if (routeToFamily[item.routeId]) errors.push(`duplicate route assignment: ${item.routeId}`);
      routeToFamily[item.routeId] = { familyId: family.id, familyIndex, routeIndex };
      routeToCard[item.routeId] = item.cardId;
    });
  });

  drill.routes.forEach(route => {
    if (!routeToFamily[route.id]) errors.push(`unassigned route: ${route.id}`);
  });

  const cardToRoutes = {};
  Object.entries(routeToCard).forEach(([routeId, cardId]) => {
    (cardToRoutes[cardId] ||= []).push(routeId);
  });

  window.MARISA_COMBO_LEARNING = {
    version: "1.0.0",
    storageKey: "modern-marisa-combo-route-learning-v1",
    families,
    scenarioByRoute,
    routeToFamily,
    routeToCard,
    cardToRoutes,
    errors
  };
})();
