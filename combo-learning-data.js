(() => {
  const drill = window.MARISA_DRILL;
  const playbook = window.MARISA_PLAYBOOK;
  if (!drill || !playbook) return;

  const assistEntryCards = [
    {
      id: "assist-light-1320",
      category: "combo",
      type: "combo",
      number: "A1",
      title: "入口：A弱コンボ",
      lead: "近距離では、まずアシスト完走でダウンまで取る。",
      damage: 1320,
      drive: 0,
      sa: 0,
      position: "中央・画面端",
      condition: "A弱が近距離でヒット",
      inputs: ["A弱", "アシストコンボ完走"],
      use: "暴れ、小さい確定反撃、近距離の安定択",
      next: "完走が安定したら、↓弱×n→弱ディマへ移る",
      filters: ["starter", "no-meter"],
      status: "measured",
      statusLabel: "入口ルート",
      relatedMoves: ["crLK", "crLP"],
      sourceNote: "既存の実測1,320を、手動ルートへ移るための入口として再登録。"
    },
    {
      id: "assist-medium-2660",
      category: "combo",
      type: "combo",
      number: "A2",
      title: "入口：A中コンボ",
      lead: "A中が当たった後の完走感覚を、先にアシストで固定する。",
      damage: 2660,
      drive: "アシスト依存",
      sa: "アシスト依存",
      position: "中央",
      condition: "A中が通常ヒット",
      inputs: ["A中", "アシストコンボ完走"],
      use: "中距離のヒット確認を、まず一つの入力へ固定",
      next: "A中×2→中ディマへ移り、OD起き攻めと最大を分ける",
      filters: ["starter"],
      status: "measured",
      statusLabel: "入口ルート",
      relatedMoves: ["aMP"],
      sourceNote: "実測2,660。ゲージ内訳はアシスト設定と実戦条件で再確認。"
    },
    {
      id: "assist-heavy-3020",
      category: "combo",
      type: "combo",
      number: "A3",
      title: "入口：A強コンボ",
      lead: "大きな隙では、最初に落とさない確定反撃を持つ。",
      damage: 3020,
      drive: 0,
      sa: 0,
      position: "中央・画面端",
      condition: "大きな隙へのA強始動",
      inputs: ["A強", "アシストコンボ完走"],
      use: "無敵技などの大きな確定反撃",
      next: "N強・膝の始動条件を確認し、手動の標準と最大へ移る",
      filters: ["starter", "punish", "no-meter"],
      status: "measured",
      statusLabel: "入口ルート",
      relatedMoves: ["fHK", "stHP"],
      sourceNote: "既存の実測3,020を、手動確定反撃へ移る入口として再登録。"
    }
  ];

  const existingCardIds = new Set(playbook.cards.map(card => card.id));
  assistEntryCards.forEach(card => {
    if (!existingCardIds.has(card.id)) playbook.cards.push(card);
  });

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
        { routeId: "aMP-normal-od", cardId: "sa1-medium-assist", prerequisites: ["aMP-normal-basic"] },
        { routeId: "aMP-counter-basic", cardId: "starter-assist-medium-dima", prerequisites: ["aMP-normal-basic"] },
        { routeId: "aMP-punish-basic", cardId: "sa1-medium-assist", prerequisites: ["aMP-normal-basic"] },
        { routeId: "aMP-normal-power", cardId: "sa1-medium-assist", prerequisites: ["aMP-normal-od"] }
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
      entry: { cardId: "assist-heavy-3020", label: "入口：A強コンボ", type: "assist" },
      routes: [
        { routeId: "fHK-normal-basic", cardId: "starter-assist-heavy-sa3", prerequisites: [] },
        { routeId: "fHK-punish-charge", cardId: "starter-charged-heavy-punish", prerequisites: ["fHK-normal-basic"] }
      ]
    },
    {
      id: "od-dima",
      label: "ODディマ対空",
      description: "短い起き攻めルートを先に安定させ、高度とゲージを確認できる時だけ運びへ進む。",
      entry: { cardId: "sa1-medium-assist", label: "入口：A中からODディマ", type: "manual" },
      routes: [
        { routeId: "dimachaerusOD-normal-basic", cardId: "sa1-medium-assist", prerequisites: [] },
        { routeId: "dimachaerusOD-normal-power", cardId: "punish-heavy-sa2", prerequisites: ["dimachaerusOD-normal-basic"] }
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
    assistEntryCards: assistEntryCards.map(card => card.id),
    families,
    scenarioByRoute,
    routeToFamily,
    routeToCard,
    cardToRoutes,
    errors
  };
})();
