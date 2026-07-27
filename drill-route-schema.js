(() => {
  const drill = window.MARISA_DRILL;
  if (!drill) return;

  const tierMeta = {
    stable: {
      label: "安定",
      short: "まず固定",
      description: "完走率、短い入力、ゲージ温存を優先する基準。迷った時に戻るルート。",
      next: "8割以上安定したら、ヒット状況と目的を見て標準へ進む。"
    },
    standard: {
      label: "標準",
      short: "実戦の主力",
      description: "火力、起き攻め、ゲージ効率のバランスを取る主力ルート。",
      next: "大きな隙、十分なゲージ、倒し切りを確認できた時だけ最大へ進む。"
    },
    maximum: {
      label: "最大",
      short: "条件限定",
      description: "パニカン、長押し、端、ゲージ、倒し切りなどの条件を満たした時に選ぶ。",
      next: "条件や入力に不安がある時は、安定または標準へ戻して完走を優先する。"
    }
  };

  const profile = (tier, objectives, values = {}) => ({
    tier,
    objectives,
    positions: values.positions || ["center", "corner"],
    resources: {
      driveCost: values.driveCost || 0,
      saCost: values.saCost || 0
    },
    inputDifficulty: values.inputDifficulty || 1,
    reliability: values.reliability || 3,
    requirements: {
      charge: Boolean(values.charge),
      standing: Boolean(values.standing),
      corner: Boolean(values.corner)
    },
    learning: {
      use: values.use || tierMeta[tier].description,
      fallback: values.fallback || (tier === "stable" ? "このルートを基準として維持する。" : "条件が足りない時は一段階下のルートへ戻す。"),
      upgrade: values.upgrade || tierMeta[tier].next
    }
  });

  const profiles = {
    "crLP-normal-basic": profile("stable", ["save", "oki", "reliability"], {
      inputDifficulty: 1,
      reliability: 3,
      use: "小技が通常ヒットした時に、ゲージを使わずダウンまで完走する。"
    }),
    "crLP-normal-lethal": profile("maximum", ["lethal", "damage"], {
      saCost: 3,
      inputDifficulty: 3,
      reliability: 2,
      use: "↓弱の通常ヒットからSA3で倒し切れる時だけ選ぶ。"
    }),
    "crLP-counter-basic": profile("standard", ["confirm", "oki", "save"], {
      inputDifficulty: 2,
      reliability: 2,
      use: "↓弱のカウンターを確認し、増えた有利からN弱へつなぐ。"
    }),
    "crLP-punish-basic": profile("maximum", ["punish", "damage", "oki"], {
      inputDifficulty: 2,
      reliability: 2,
      use: "↓弱のパニカンを確認し、通常より大きい始動へつなぐ。"
    }),

    "stHP-normal-basic": profile("stable", ["save", "reliability"], {
      inputDifficulty: 1,
      reliability: 3,
      use: "N強が通常ヒットした時に、条件を足さず成立する形で終える。"
    }),
    "stHP-punish-basic": profile("standard", ["punish", "save", "oki"], {
      inputDifficulty: 2,
      reliability: 3,
      use: "N強パニカンから、ノーゲージで反撃と起き攻めを両立する。"
    }),
    "stHP-punish-power": profile("maximum", ["punish", "damage", "carry"], {
      driveCost: 3,
      inputDifficulty: 3,
      reliability: 1,
      charge: true,
      use: "長押しN強パニカンとゲージを確認し、火力と運びを最大化する。"
    }),

    "bHP-normal-plain": profile("stable", ["save", "oki", "reliability"], {
      inputDifficulty: 2,
      reliability: 3,
      use: "溜めていない←強が通常ヒットした時の基準として使う。"
    }),
    "bHP-normal-charge": profile("maximum", ["damage", "oki"], {
      inputDifficulty: 3,
      reliability: 1,
      charge: true,
      use: "長押し←強の通常ヒットを確認できた時に高火力へ伸ばす。"
    }),
    "bHP-counter-basic": profile("standard", ["confirm", "oki", "save"], {
      inputDifficulty: 2,
      reliability: 2,
      use: "←強のカウンターを確認し、通常ヒット用と分けて回収する。"
    }),
    "bHP-punish-simple": profile("stable", ["punish", "reliability"], {
      inputDifficulty: 1,
      reliability: 3,
      charge: true,
      use: "長押し←強パニカン時に、簡易入力で完走率を優先する。"
    }),
    "bHP-punish-command": profile("maximum", ["punish", "damage"], {
      inputDifficulty: 3,
      reliability: 2,
      charge: true,
      use: "長押し←強パニカンを確認し、コマンド入力で最大反撃を取る。"
    }),

    "aMP-normal-basic": profile("stable", ["save", "oki", "reliability"], {
      inputDifficulty: 1,
      reliability: 3,
      use: "A中の通常ヒットから、ノーゲージで中ディマ締めへ進む。"
    }),
    "aMP-normal-od": profile("standard", ["oki", "damage"], {
      driveCost: 2,
      inputDifficulty: 1,
      reliability: 3,
      use: "A中からODを使い、火力より起き攻め継続を優先する。"
    }),
    "aMP-normal-power": profile("maximum", ["damage", "carry"], {
      driveCost: 5,
      inputDifficulty: 3,
      reliability: 1,
      use: "A中通常ヒットから、ODとラッシュを使って火力と運びを伸ばす。"
    }),
    "aMP-counter-basic": profile("standard", ["confirm", "save", "oki"], {
      inputDifficulty: 1,
      reliability: 3,
      use: "A中のカウンターを確認し、条件違いのルートを避けて完走する。"
    }),
    "aMP-punish-basic": profile("standard", ["punish", "oki", "damage"], {
      driveCost: 2,
      inputDifficulty: 1,
      reliability: 3,
      use: "A中パニカンからOD追撃を使い、安定した反撃と起き攻めを取る。"
    }),

    "fMP-normal-sa": profile("maximum", ["lethal", "damage"], {
      saCost: 3,
      inputDifficulty: 3,
      reliability: 1,
      standing: true,
      use: "→中の通常ヒット、立ち相手、SA3を確認できた時に倒し切りを狙う。"
    }),
    "fMP-counter-basic": profile("standard", ["confirm", "oki", "save"], {
      inputDifficulty: 2,
      reliability: 2,
      use: "→中のカウンターを確認し、↓弱から弱ディマへつなぐ。"
    }),

    "fHK-normal-basic": profile("standard", ["damage", "oki"], {
      inputDifficulty: 2,
      reliability: 2,
      use: "膝の強派生が通常ヒットした時の主力として使う。"
    }),
    "fHK-punish-charge": profile("maximum", ["punish", "damage"], {
      inputDifficulty: 3,
      reliability: 1,
      charge: true,
      use: "長押し膝のパニカンを確認した時だけ高火力へ進む。"
    }),

    "dimachaerusOD-normal-basic": profile("standard", ["anti-air", "oki", "reliability"], {
      driveCost: 2,
      inputDifficulty: 1,
      reliability: 3,
      use: "対空ODディマから、入力を短くして起き攻めへ進む。"
    }),
    "dimachaerusOD-normal-power": profile("maximum", ["anti-air", "damage", "carry"], {
      driveCost: 5,
      inputDifficulty: 3,
      reliability: 1,
      use: "対空ODディマ後にゲージと高度を確認し、火力と運びを伸ばす。"
    }),
    "phalanxOD-normal-basic": profile("standard", ["corner", "damage", "oki"], {
      driveCost: 2,
      inputDifficulty: 2,
      reliability: 2,
      corner: true,
      positions: ["corner"],
      use: "画面端のODファランクス壁やられから、追撃と端維持を取る。"
    })
  };

  const missingProfiles = drill.routes.filter(route => !profiles[route.id]).map(route => route.id);
  drill.schemaVersion = 2;
  drill.routeSchemaVersion = "1.0.0";
  drill.tierMeta = tierMeta;
  drill.schemaErrors = missingProfiles.map(id => `route profile missing: ${id}`);
  drill.routes = drill.routes.map(route => ({
    ...route,
    schemaVersion: 1,
    ...(profiles[route.id] || profile("stable", ["reliability"]))
  }));

  function matches(route, query = {}) {
    const scalarKeys = ["starter", "condition", "tier", "input"];
    if (scalarKeys.some(key => query[key] !== undefined && route[key] !== query[key])) return false;
    if (query.charge !== undefined && route.requirements?.charge !== query.charge) return false;
    if (query.standing !== undefined && route.requirements?.standing !== query.standing) return false;
    if (query.corner !== undefined && route.requirements?.corner !== query.corner) return false;
    if (query.saCost !== undefined && route.resources?.saCost !== query.saCost) return false;
    if (query.driveCost !== undefined && route.resources?.driveCost !== query.driveCost) return false;
    if (query.maxDriveCost !== undefined && route.resources?.driveCost > query.maxDriveCost) return false;
    if (query.minReliability !== undefined && route.reliability < query.minReliability) return false;
    if (query.objectivesAll && !query.objectivesAll.every(value => route.objectives.includes(value))) return false;
    if (query.objectivesAny && !query.objectivesAny.some(value => route.objectives.includes(value))) return false;
    if (query.position && !route.positions.includes(query.position)) return false;
    return true;
  }

  function queryText(query) {
    return Object.entries(query).map(([key, value]) => `${key}=${Array.isArray(value) ? value.join("+") : value}`).join(", ");
  }

  function selectOne(query, used = new Set()) {
    const candidates = drill.routes.filter(route => !used.has(route.id) && matches(route, query));
    if (candidates.length !== 1) {
      throw new Error(`Route query must resolve to exactly one route (${candidates.length}): ${queryText(query)}`);
    }
    return candidates[0];
  }

  function compileScenario(definition) {
    const selection = definition.selection || {};
    const base = selection.base || {};
    const used = new Set();
    const choices = (selection.candidates || []).map(candidate => {
      const route = selectOne({ ...base, ...candidate }, used);
      used.add(route.id);
      return route.id;
    });
    const correctRoute = selectOne({ ...base, ...(selection.correct || {}) });
    if (!choices.includes(correctRoute.id)) {
      throw new Error(`Correct route is outside candidate set: ${definition.id} -> ${correctRoute.id}`);
    }
    return {
      ...definition,
      definitionMode: "query",
      choices,
      correct: correctRoute.id,
      resolvedSelection: {
        correctTier: correctRoute.tier,
        correctObjectives: correctRoute.objectives.slice()
      }
    };
  }

  window.MARISA_ROUTE_SCHEMA = {
    version: drill.routeSchemaVersion,
    tierMeta,
    profiles,
    matches,
    selectOne,
    compileScenario
  };
})();
