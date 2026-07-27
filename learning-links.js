(() => {
  const strategy = (category, id, label) => ({
    type: "strategy",
    label,
    href: `strategy.html#playbook/${encodeURIComponent(category)}/${encodeURIComponent(id)}`
  });
  const situation = (id, label) => ({
    type: "situation",
    label,
    href: `situations.html?situation=${encodeURIComponent(id)}`
  });
  const situationSearch = (params, label) => ({
    type: "situation",
    label,
    href: `situations.html?${new URLSearchParams(params).toString()}`
  });
  const move = (id, label) => ({
    type: "move",
    label,
    href: `moves.html?move=${encodeURIComponent(id)}`
  });
  const drill = (id, label) => ({
    type: "drill",
    label,
    href: `drill.html?scenario=${encodeURIComponent(id)}`
  });

  const scenarioLinks = {
    "stable-amp-normal": [
      strategy("combo", "starter-assist-medium-dima", "A中の基準ルートを読む"),
      situationSearch({ phase: "conversion", q: "A中" }, "A中始動の状況を探す"),
      move("aMP", "A中の性能を見る")
    ],
    "resource-amp-save": [
      strategy("combo", "starter-assist-medium-dima", "A中のノーゲージ基準"),
      situationSearch({ phase: "conversion", q: "ゲージ 温存" }, "ゲージ温存の判断を見る"),
      move("aMP", "A中の性能を見る")
    ],
    "resource-amp-oki": [
      strategy("combo", "starter-assist-medium-dima", "A中から起き攻めへ"),
      situationSearch({ phase: "okizeme", q: "中ディマ" }, "中ディマ後を探す"),
      move("dimachaerusM", "中ディマを見る")
    ],
    "power-amp-carry": [
      strategy("combo", "starter-assist-medium-dima", "A中始動の火力判断"),
      situationSearch({ phase: "conversion", q: "火力 運び" }, "火力・運びの状況を見る"),
      move("dimachaerusOD", "ODディマを見る")
    ],
    "confirm-amp-counter": [
      strategy("combo", "starter-assist-medium-dima", "A中確認の基準"),
      situationSearch({ phase: "conversion", q: "A中 カウンター" }, "A中カウンターを探す"),
      move("aMP", "A中の性能を見る")
    ],
    "punish-amp": [
      strategy("combo", "starter-assist-medium-dima", "A中パニカンの考え方"),
      situationSearch({ phase: "conversion", q: "A中 パニカン" }, "A中パニカンを探す"),
      move("aMP", "A中の性能を見る")
    ],

    "stable-crlp-normal": [
      strategy("combo", "starter-light-dima", "小技から弱ディマの基準"),
      situation("oki-light-dima-center-overview", "弱ディマ後の三択へ"),
      move("crLP", "↓弱の性能を見る")
    ],
    "resource-crlp-lethal": [
      strategy("combo", "punish-heavy-lethal", "倒し切り判断を読む"),
      situationSearch({ phase: "conversion", q: "SA3 倒し切り" }, "リーサル状況を探す"),
      move("sa3", "SA3の性能を見る")
    ],
    "confirm-crlp-counter": [
      strategy("combo", "starter-light-dima", "小技カウンターの基準"),
      situation("oki-light-dima-center-overview", "弱ディマ後へ進む"),
      move("crLP", "↓弱の性能を見る")
    ],
    "confirm-crlp-punish": [
      strategy("combo", "starter-light-dima", "小技パニカンの判断"),
      situationSearch({ phase: "conversion", q: "↓弱 パニカン" }, "小技パニカンを探す"),
      move("crLP", "↓弱の性能を見る")
    ],

    "stable-sthp-normal": [
      strategy("combo", "poke-standing-heavy-punish", "N強からの回収を見る"),
      situationSearch({ phase: "conversion", q: "N強 通常" }, "N強通常ヒットを探す"),
      move("stHP", "N強の性能を見る")
    ],
    "power-sthp-punish": [
      strategy("combo", "starter-charged-heavy-punish", "溜めN強の最大反撃"),
      situation("oki-light-dima-vs-reversal", "無敵技を読んだ後の反撃"),
      move("stHP", "N強の性能を見る")
    ],
    "punish-sthp-stable": [
      strategy("combo", "poke-standing-heavy-punish", "N強パニカンの安定回収"),
      situation("oki-light-dima-vs-reversal", "無敵技ガード後の判断"),
      move("stHP", "N強の性能を見る")
    ],

    "power-bhp-punish": [
      strategy("combo", "shimmy-back-heavy", "←強パニカンの回収"),
      situation("oki-light-dima-vs-tech", "投げ抜け狩りの状況"),
      move("bHP", "←強の性能を見る")
    ],
    "punish-bhp-simple": [
      strategy("combo", "shimmy-back-heavy", "←強パニカンの安定回収"),
      situation("oki-light-dima-vs-tech", "シミーの状況を見る"),
      move("bHP", "←強の性能を見る")
    ],
    "control-bhp-charge": [
      strategy("combo", "starter-back-heavy-dima-sa3", "長押し←強の基準"),
      situationSearch({ phase: "conversion", q: "長押し ←強" }, "長押し条件を探す"),
      move("bHP", "←強の性能を見る")
    ],
    "control-bhp-plain": [
      strategy("combo", "starter-back-heavy-dima-sa3", "←強通常ヒットの基準"),
      situationSearch({ phase: "conversion", q: "←強 通常" }, "←強通常ヒットを探す"),
      move("bHP", "←強の性能を見る")
    ],
    "control-bhp-counter": [
      strategy("combo", "shimmy-back-heavy", "←強カウンターの回収"),
      situationSearch({ phase: "conversion", q: "←強 カウンター" }, "←強カウンターを探す"),
      move("bHP", "←強の性能を見る")
    ]
  };

  const situationLinks = {
    "oki-light-dima-center-overview": [
      strategy("oki", "oki-center-light-dima", "弱ディマ後の四択を詳しく読む"),
      drill("stable-crlp-normal", "小技→弱ディマの選択を練習"),
      move("dimachaerusL", "弱ディマの性能を見る")
    ],
    "oki-light-dima-vs-mash": [
      strategy("oki", "oki-center-light-dima", "暴れを止める起き攻め"),
      drill("stable-crlp-normal", "弱ディマまでの基準を練習"),
      move("stHP", "重ねるN強を見る")
    ],
    "oki-light-dima-vs-block": [
      strategy("oki", "oki-center-light-dima", "ガードを崩す四択"),
      move("enfold", "エンフォルドを見る")
    ],
    "oki-light-dima-vs-reversal": [
      strategy("combo", "starter-charged-heavy-punish", "無敵技ガード後の最大反撃"),
      drill("punish-sthp-stable", "安定反撃を選ぶ練習"),
      drill("power-sthp-punish", "最大反撃を選ぶ練習")
    ],
    "oki-light-dima-vs-tech": [
      strategy("combo", "shimmy-back-heavy", "シミー成功後の回収"),
      drill("punish-bhp-simple", "安定ルートを選ぶ練習"),
      drill("power-bhp-punish", "最大ルートを選ぶ練習")
    ],
    "oki-light-dima-training": [
      strategy("oki", "oki-center-light-dima", "弱ディマ後の手順を読む"),
      drill("stable-crlp-normal", "小技始動から通して練習")
    ]
  };

  const strategyLinks = {
    "starter-assist-medium-dima": [
      situationSearch({ phase: "conversion", q: "A中" }, "A中始動の状況を探す"),
      drill("stable-amp-normal", "A中の基準選択を練習"),
      drill("resource-amp-oki", "起き攻め重視を練習")
    ],
    "starter-light-dima": [
      situation("oki-light-dima-center-overview", "弱ディマ後の状況へ"),
      drill("stable-crlp-normal", "小技始動の基準を練習")
    ],
    "poke-standing-heavy-punish": [
      situationSearch({ phase: "conversion", q: "N強 パニカン" }, "N強パニカンの状況へ"),
      drill("punish-sthp-stable", "安定反撃を練習"),
      drill("power-sthp-punish", "最大反撃を練習")
    ],
    "starter-charged-heavy-punish": [
      situation("oki-light-dima-vs-reversal", "無敵技を読んだ状況へ"),
      drill("power-sthp-punish", "最大反撃を選ぶ練習")
    ],
    "starter-back-heavy-dima-sa3": [
      situationSearch({ phase: "conversion", q: "←強" }, "←強始動の状況へ"),
      drill("control-bhp-plain", "通常ヒットを選ぶ練習"),
      drill("control-bhp-charge", "長押し条件を練習")
    ],
    "shimmy-back-heavy": [
      situation("oki-light-dima-vs-tech", "投げ抜け狩りの状況へ"),
      drill("punish-bhp-simple", "安定回収を練習"),
      drill("power-bhp-punish", "最大回収を練習")
    ],
    "oki-center-light-dima": [
      situation("oki-light-dima-center-overview", "弱ディマ後の状況へ"),
      drill("stable-crlp-normal", "弱ディマまでの基準を練習")
    ],
    "punish-heavy-lethal": [
      situationSearch({ phase: "conversion", q: "倒し切り" }, "リーサル状況を探す"),
      drill("resource-crlp-lethal", "SA3倒し切りを練習")
    ]
  };

  const moveLinks = {
    crLP: [
      strategy("combo", "starter-light-dima", "小技始動の基準を読む"),
      situation("oki-light-dima-center-overview", "弱ディマ後へ進む"),
      drill("stable-crlp-normal", "小技始動を練習")
    ],
    aMP: [
      strategy("combo", "starter-assist-medium-dima", "A中始動の基準を読む"),
      situationSearch({ phase: "conversion", q: "A中" }, "A中の状況を探す"),
      drill("stable-amp-normal", "A中の選び分けを練習")
    ],
    stHP: [
      strategy("combo", "poke-standing-heavy-punish", "N強パニカンの回収"),
      situation("oki-light-dima-vs-reversal", "無敵技ガード後へ"),
      drill("punish-sthp-stable", "N強反撃を練習")
    ],
    bHP: [
      strategy("combo", "shimmy-back-heavy", "←強パニカンの回収"),
      situation("oki-light-dima-vs-tech", "シミーの状況へ"),
      drill("punish-bhp-simple", "←強の選び分けを練習")
    ],
    dimachaerusL: [
      strategy("oki", "oki-center-light-dima", "弱ディマ後の起き攻め"),
      situation("oki-light-dima-center-overview", "弱ディマ後を探す"),
      drill("stable-crlp-normal", "弱ディマ締めを練習")
    ],
    dimachaerusM: [
      strategy("combo", "starter-assist-medium-dima", "A中→中ディマの基準"),
      situationSearch({ phase: "okizeme", q: "中ディマ" }, "中ディマ後を探す"),
      drill("stable-amp-normal", "A中始動を練習")
    ],
    sa3: [
      strategy("combo", "punish-heavy-lethal", "倒し切り判断を読む"),
      situationSearch({ phase: "conversion", q: "SA3 倒し切り" }, "リーサル状況を探す"),
      drill("resource-crlp-lethal", "SA3倒し切りを練習")
    ]
  };

  window.MARISA_LEARNING_LINKS = {
    version: "1.0.0",
    scenarioLinks,
    situationLinks,
    strategyLinks,
    moveLinks,
    get(type, id) {
      const registry = {
        scenario: scenarioLinks,
        situation: situationLinks,
        strategy: strategyLinks,
        move: moveLinks
      }[type];
      return registry?.[id] || [];
    }
  };
})();
