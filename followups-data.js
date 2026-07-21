(() => {
  const rec = (rank, route, options = {}) => ({
    rank,
    route,
    kind: options.kind || "combo",
    damage: options.damage || "未計測",
    drive: options.drive || "0",
    super: options.super || "0",
    difficulty: options.difficulty || 1,
    power: options.power || 2,
    oki: options.oki || 2,
    ease: options.ease || 3,
    result: options.result || "状況を見て攻めを継続",
    reason: options.reason || "火力・継続・安定性のバランスを優先。",
    conditions: options.conditions || [],
    sources: options.sources || ["official-frame", "lab-data"],
    verification: options.verification || "資料照合"
  });

  const sources = {
    "official-frame": {
      label: "CAPCOM公式フレームデータ",
      url: "https://www.streetfighter.com/6/ja-jp/character/marisa/frame",
      note: "発生・ヒット有利・ダウン状況の基準"
    },
    "official-movelist": {
      label: "CAPCOM公式コマンドリスト",
      url: "https://www.streetfighter.com/6/ja-jp/character/marisa/movelist",
      note: "モダンで使用可能な技と派生の確認"
    },
    "official-patch": {
      label: "CAPCOM 2026年3月17日調整",
      url: "https://www.streetfighter.com/6/buckler/ja-jp/battle_change/20260317/marisa",
      note: "現行調整の差分確認"
    },
    "system-rules": {
      label: "SF6システム差分",
      url: "https://streetfighter.fandom.com/wiki/Street_Fighter_6",
      note: "カウンター+2F・パニカン/ラッシュ+4Fの照合"
    },
    "kamigame-modern": {
      label: "神ゲー攻略 モダンマリーザコンボ",
      url: "https://kamigame.jp/streetfighter6/page/271002230109263938.html",
      note: "2026年2月7日更新。主要始動・ダメージ・ゲージ量"
    },
    "sukoreru-modern": {
      label: "すこれる モダンマリーザ攻略",
      url: "https://www.sukoreru.com/sf6-modern-marisa",
      note: "2026年4月27日更新。高火力・SA・起き攻め候補"
    },
    "lab-data": {
      label: "MODERN MARISA LAB技データ",
      url: "#sources",
      note: "公式数値を基にした既存48技の用途・ヒット後整理"
    }
  };

  const overrides = {
    stLP: {
      normal: [
        rec("安定", "N＋弱で触ったら1段止め", { kind: "pressure", power: 1, oki: 2, ease: 5, result: "±0。ガード・後ろ歩き・↓＋弱の読み合い", reason: "通常ヒットではライトワンツーが連続ヒットしない。", conditions: ["通常ヒットでは2段目非連続"] })
      ],
      counter: [
        rec("総合", "N＋弱 → N＋弱 → 弱ディマカイルス2段", { damage: "要実測", power: 3, oki: 4, ease: 4, result: "ダウン後に生ラッシュ起き攻め", reason: "カウンター+2Fでライトワンツーが連続ヒット。", sources: ["official-frame", "system-rules", "lab-data"] }),
        rec("倒し切り", "N＋弱 → N＋弱 → SA3", { super: "3", difficulty: 2, power: 5, oki: 1, ease: 4, result: "リーサル優先", reason: "2段目からSAキャンセル。", sources: ["official-frame", "lab-data"] })
      ],
      punish: [
        rec("総合", "N＋弱 → N＋弱 → 弱ディマカイルス2段", { power: 3, oki: 4, ease: 5, result: "小さい確反からダウン", reason: "6Fで届く小さい隙の確反用。", sources: ["official-frame", "system-rules", "lab-data"] })
      ],
      rush: [
        rec("総合", "ラッシュ N＋弱 → ↓＋弱 → 弱ディマカイルス2段", { drive: "0.5", difficulty: 2, power: 3, oki: 4, ease: 4, result: "ダウン後に攻め継続", reason: "ラッシュ+4Fで4Fの↓＋弱へつなぐ。密着推奨。", conditions: ["密着付近", "距離で↓＋弱が届かない場合あり"], sources: ["official-frame", "system-rules"] })
      ]
    },
    stMK: {
      normal: [
        rec("総合", "N＋中 → ↓＋弱", { difficulty: 2, power: 2, oki: 3, ease: 4, result: "近ければ小技確認へ", reason: "+4Fから4F技。先端では届かないため距離確認。", conditions: ["近距離ヒット"], sources: ["official-frame", "lab-data"], verification: "距離依存" }),
        rec("継続", "ヒット後に前歩き／生ラッシュ", { kind: "oki", power: 1, oki: 3, ease: 5, result: "中距離の制圧を継続", reason: "先端では無理にリンクせず位置を取る。" })
      ],
      counter: [
        rec("総合", "N＋中（カウンター）→ N＋弱 → 弱ディマカイルス", { difficulty: 3, power: 3, oki: 4, ease: 3, result: "ダウン", reason: "+6Fとなり6FのN＋弱が候補。距離確認が必要。", conditions: ["近め", "先端不可の場合あり"], sources: ["official-frame", "system-rules"], verification: "フレーム差分推定" })
      ],
      punish: [
        rec("総合", "N＋中（パニカン）→ A＋中×2 → 中ディマカイルス", { difficulty: 2, power: 4, oki: 4, ease: 4, result: "ダウン後に起き攻め", reason: "+8F相当から7FのA＋中。近距離限定。", conditions: ["近距離"], sources: ["official-frame", "system-rules", "lab-data"], verification: "フレーム差分推定" })
      ],
      rush: [
        rec("総合", "ラッシュ N＋中 → A＋中×2 → 中ディマカイルス", { drive: "0.5", difficulty: 2, power: 4, oki: 4, ease: 4, result: "ダウン", reason: "ラッシュ+4FでA＋中へ。", conditions: ["近距離"], sources: ["official-frame", "system-rules", "lab-data"], verification: "距離依存" })
      ]
    },
    stHP: {
      normal: [
        rec("総合", "N＋強 → N＋強（ヘヴィーツーヒッター）", { power: 4, oki: 4, ease: 5, result: "ダウン+42F。ラッシュ／安全飛び候補", reason: "確認が簡単で運びと起き攻めが安定。", sources: ["official-frame", "lab-data"] })
      ],
      counter: [
        rec("総合", "N＋強 → N＋強", { power: 4, oki: 4, ease: 5, result: "ダウン", reason: "カウンターでもターゲット完走が安定。" }),
        rec("位置重視", "N＋強（カウンター）→ ↓＋弱", { difficulty: 3, power: 2, oki: 3, ease: 3, result: "小技確認へ", reason: "+5F相当。近距離のみ。", conditions: ["密着"], sources: ["official-frame", "system-rules"], verification: "フレーム差分推定" })
      ],
      punish: [
        rec("総合", "長押しN＋強（パニカン）→ ←＋強 → 強ディマカイルス2段 → 長押しN＋強", { damage: "3910前後", power: 5, oki: 5, ease: 3, result: "前ステップから投げ／溜め打撃", reason: "ノーゲージ確反の基準。", conditions: ["大きな隙", "長押し確定"], sources: ["official-frame", "kamigame-modern", "sukoreru-modern"] }),
        rec("火力", "長押しN＋強（パニカン）→ ←＋強 → 強ディマ2段 → ラッシュ←＋強 → 強ファランクス", { damage: "4266前後", drive: "1", difficulty: 4, power: 5, oki: 4, ease: 2, result: "運び＋起き攻め", reason: "1本追加で火力と運びを伸ばす。", sources: ["kamigame-modern"] }),
        rec("倒し切り", "長押しN＋強（パニカン）→ ←＋強 → 強ディマ2段 → ラッシュ←＋強 → 強グラディウス → SA3", { damage: "6308〜6462", drive: "1", super: "3", difficulty: 4, power: 5, oki: 1, ease: 2, result: "リーサル", reason: "最大反撃の倒し切り候補。", sources: ["kamigame-modern", "sukoreru-modern"] })
      ],
      rush: [
        rec("総合", "ラッシュ N＋強 → A＋中×2 → 強／ODディマカイルス", { drive: "0.5〜2.5", difficulty: 3, power: 4, oki: 4, ease: 3, result: "ディマ後の追撃へ", reason: "+7F相当から7FのA＋中。", conditions: ["近距離"], sources: ["official-frame", "system-rules", "lab-data"], verification: "距離依存" })
      ]
    },
    crLP: {
      normal: [
        rec("総合", "↓＋弱×2 → 弱ディマカイルス2段", { damage: "1320前後", power: 2, oki: 4, ease: 5, result: "ダウン後に生ラッシュ", reason: "4F暴れ・小さい確反の標準。", sources: ["official-frame", "kamigame-modern", "lab-data"] }),
        rec("倒し切り", "↓＋弱×2 → 弱ディマ1段 → SA3", { super: "3", difficulty: 2, power: 5, oki: 1, ease: 4, result: "リーサル", reason: "弱始動からSA3へ直接つなぐ。", sources: ["kamigame-modern", "lab-data"] })
      ],
      counter: [
        rec("総合", "↓＋弱（カウンター）→ N＋弱 → 弱ディマカイルス", { difficulty: 2, power: 3, oki: 4, ease: 4, result: "ダウン", reason: "+6F相当から6FのN＋弱。距離が近ければ採用。", conditions: ["密着"], sources: ["official-frame", "system-rules"], verification: "フレーム差分推定" }),
        rec("安定", "↓＋弱×2 → 弱ディマカイルス", { power: 2, oki: 4, ease: 5, result: "ダウン", reason: "確認を増やさず通常ルートを完走。" })
      ],
      punish: [
        rec("総合", "↓＋弱（パニカン）→ ←＋強 → 強ディマカイルス2段", { difficulty: 3, power: 4, oki: 4, ease: 3, result: "強ディマ追撃へ", reason: "+8F相当から8Fの←＋強。", conditions: ["密着", "距離確認"], sources: ["official-frame", "system-rules", "lab-data"], verification: "フレーム差分推定" }),
        rec("安定", "↓＋弱×2 → 弱ディマカイルス", { power: 2, oki: 4, ease: 5, result: "ダウン", reason: "距離に不安がある時。" })
      ],
      rush: [
        rec("総合", "ラッシュ ↓＋弱 → ←＋強 → 強ディマカイルス2段", { drive: "0.5", difficulty: 3, power: 4, oki: 4, ease: 3, result: "高火力ルートへ", reason: "ラッシュ+4Fで合計+8F。", conditions: ["密着"], sources: ["official-frame", "system-rules", "lab-data"], verification: "距離依存" })
      ]
    },
    crMP: {
      normal: [
        rec("総合", "↓＋中 → キャンセルラッシュ → A＋中 → ←＋強 → 強ディマ2段 → 長押しN＋強", { damage: "3178前後", drive: "3", difficulty: 3, power: 4, oki: 5, ease: 3, result: "良い起き攻め", reason: "中距離の主力始動。火力と継続のバランス。", sources: ["official-frame", "kamigame-modern"] }),
        rec("火力", "↓＋中 → CR → A＋中 → ←＋強 → 強ディマ2段 → ラッシュ←＋強 → 強ファランクス", { damage: "3396〜3501", drive: "4", difficulty: 4, power: 5, oki: 4, ease: 2, result: "運び＋起き攻め", reason: "ゲージが多い時の伸ばし。", sources: ["kamigame-modern"] }),
        rec("倒し切り", "↓＋中 → CR → A＋中 → ←＋強 → 強ディマ2段 → ラッシュ←＋強 → 強グラディウス → SA3", { damage: "5476前後", drive: "4", super: "3", difficulty: 4, power: 5, oki: 1, ease: 2, result: "リーサル", reason: "低リスク牽制からの倒し切り。", sources: ["kamigame-modern"] })
      ],
      counter: [
        rec("安定", "↓＋中（カウンター）→ ↓＋弱 → 弱ディマカイルス", { difficulty: 2, power: 2, oki: 4, ease: 4, result: "ダウン", reason: "+5F相当から4F小技。距離確認。", conditions: ["近距離"], sources: ["official-frame", "system-rules"], verification: "フレーム差分推定" }),
        rec("総合", "↓＋中 → キャンセルラッシュ → A＋中 → ←＋強 → 強ディマ", { drive: "3", difficulty: 3, power: 4, oki: 5, ease: 3, result: "起き攻め", reason: "カウンター確認不要で安定。", sources: ["kamigame-modern"] })
      ],
      punish: [
        rec("総合", "↓＋中（パニカン）→ A＋中×2 → 中ディマカイルス", { difficulty: 2, power: 3, oki: 4, ease: 4, result: "ダウン", reason: "+7F相当から7FのA＋中。", conditions: ["近距離"], sources: ["official-frame", "system-rules", "lab-data"], verification: "距離依存" }),
        rec("火力", "↓＋中 → CR → A＋中 → ←＋強 → 強ディマ2段 → ラッシュ←＋強 → 強ファランクス", { drive: "4", power: 5, oki: 4, ease: 2, difficulty: 4, result: "運び", reason: "確反でゲージを使うなら通常CRルート。", sources: ["kamigame-modern"] })
      ],
      rush: [
        rec("総合", "ラッシュ ↓＋中 → A＋中×2 → ODディマカイルス → 長押しN＋強", { drive: "2.5", difficulty: 3, power: 4, oki: 5, ease: 3, result: "前ステップ起き攻め", reason: "ラッシュ+4FでA＋中がつながる。", sources: ["official-frame", "system-rules", "kamigame-modern"], verification: "距離依存" })
      ]
    },
    crHP: {
      normal: [
        rec("総合", "↓＋強（対空）→ 生ラッシュで起き攻め", { kind: "oki", power: 2, oki: 4, ease: 4, result: "正面対空から接近", reason: "通常版はダウンを取り、無理な追撃より位置を取る。" }),
        rec("端・火力", "長押し↓＋強 → 中グラディウス", { power: 4, oki: 3, ease: 3, difficulty: 3, result: "端の追撃", reason: "長押し版の打ち上げを利用。", conditions: ["画面端・追撃状態"], sources: ["official-frame", "lab-data"] })
      ],
      counter: [rec("総合", "通常版対空 → 生ラッシュ起き攻め", { kind: "oki", power: 2, oki: 4, ease: 4, result: "位置有利", reason: "空中カウンターは高度で追撃可否が変わる。", conditions: ["空中ヒット高度依存"] })],
      punish: [
        rec("端・省エネ", "長押し↓＋強（パニカン）→ 長押し↓＋強 → 長押し↓＋強 → 最大溜めSA1", { damage: "約5000", super: "1", difficulty: 4, power: 5, oki: 2, ease: 2, result: "端で大ダメージ", reason: "画面端限定の省エネSA1ルート。", conditions: ["画面端", "長い硬直"], sources: ["sukoreru-modern"] })
      ],
      rush: [rec("総合", "ラッシュ ↓＋強 → ダウン後に前ステップ／ラッシュ", { kind: "oki", drive: "0.5", power: 2, oki: 4, ease: 4, result: "起き攻め", reason: "ダウン属性のため+4Fをリンクより起き攻めへ変換。" })]
    },
    crLK: {
      normal: [
        rec("総合", "A＋弱連打（弱アシストコンボ完走）", { damage: "1470前後", power: 2, oki: 4, ease: 5, result: "自動確認からダウン", reason: "下段始動・自動ヒット確認で最も簡単。", sources: ["kamigame-modern", "lab-data"] }),
        rec("手動", "A＋弱 → ↓＋弱 → 弱ディマカイルス", { damage: "要実測", difficulty: 2, power: 2, oki: 4, ease: 4, result: "ダウン", reason: "アシスト完走以外の手動確認。", sources: ["official-frame", "lab-data"] })
      ],
      counter: [rec("総合", "A＋弱（カウンター）→ ↓＋弱 → 弱ディマカイルス", { power: 2, oki: 4, ease: 4, result: "ダウン", reason: "+4F相当から4F小技。", sources: ["official-frame", "system-rules", "lab-data"] })],
      punish: [rec("総合", "A＋弱（パニカン）→ N＋弱 → 弱ディマカイルス", { difficulty: 2, power: 3, oki: 4, ease: 4, result: "ダウン", reason: "+6F相当から6FのN＋弱。密着確認。", conditions: ["密着"], sources: ["official-frame", "system-rules"], verification: "フレーム差分推定" })],
      rush: [rec("総合", "ラッシュ A＋弱 → N＋弱 → 弱ディマカイルス", { drive: "0.5", difficulty: 2, power: 3, oki: 4, ease: 4, result: "ダウン", reason: "ラッシュ+4FでN＋弱へ。", conditions: ["密着"], sources: ["official-frame", "system-rules"], verification: "距離依存" })]
    },
    crHK: {
      normal: [rec("総合", "↘＋強ヒット → 生ラッシュで接近", { kind: "oki", power: 2, oki: 4, ease: 5, result: "ダウン+29F。中距離起き攻め", reason: "直接追撃より位置を詰める。" })],
      counter: [rec("総合", "↘＋強ヒット → 生ラッシュ／N＋中で再制圧", { kind: "oki", power: 2, oki: 4, ease: 5, result: "ダウン", reason: "カウンターでもダウン後の継続が本命。" })],
      punish: [rec("総合", "長押し↘＋強（パニカン）→ 生ラッシュ起き攻め", { kind: "oki", power: 3, oki: 4, ease: 4, result: "安全度の高いダウン", reason: "追撃コンボより長押し版の有利状況を取る。" })],
      rush: [rec("総合", "ラッシュ ↘＋強 → 前ステップ／ファランクスで再制圧", { kind: "oki", drive: "0.5", power: 2, oki: 4, ease: 4, result: "ダウン", reason: "ラッシュ補正はダウン後の接近へ変換。" })]
    },
    aMP: {
      normal: [
        rec("総合", "A＋中×2 → 中ディマカイルス2段", { damage: "2168〜2280", power: 3, oki: 5, ease: 5, result: "ダウン後に起き攻め", reason: "ノーゲージの標準確認。", sources: ["kamigame-modern", "lab-data"] }),
        rec("継続", "A＋中×2 → ODディマカイルス → 長押しN＋強", { damage: "2704〜2800", drive: "2", difficulty: 2, power: 4, oki: 5, ease: 4, result: "前ステップから投げ／溜め打撃", reason: "火力と起き攻めの総合候補。", sources: ["kamigame-modern"] }),
        rec("火力", "A＋中×2 → ODディマ → ラッシュ←＋強 → 強ファランクス", { damage: "3010〜3156", drive: "3", difficulty: 4, power: 5, oki: 4, ease: 2, result: "運び＋詐欺飛び候補", reason: "ゲージを使って3000超。", sources: ["kamigame-modern"] })
      ],
      counter: [rec("総合", "A＋中×2 → 中／ODディマカイルス", { power: 4, oki: 5, ease: 5, result: "ダウン／追撃", reason: "ターゲット確認が最も安定。" })],
      punish: [rec("総合", "A＋中×2 → ODディマカイルス → 長押しN＋強", { drive: "2", power: 4, oki: 5, ease: 4, result: "起き攻め", reason: "7F確反の安定高リターン。", sources: ["kamigame-modern"] })],
      rush: [rec("総合", "ラッシュ A＋中 → ↓＋弱 → 弱ディマカイルス", { drive: "0.5", difficulty: 2, power: 2, oki: 4, ease: 4, result: "ダウン", reason: "+6F相当。ターゲット完走も安定候補。", sources: ["official-frame", "system-rules", "lab-data"], verification: "距離依存" }), rec("火力", "ラッシュ A＋中×2 → ODディマ → ラッシュ←＋強 → 強ファランクス", { drive: "3.5", power: 5, oki: 4, ease: 2, difficulty: 4, result: "運び", reason: "ラッシュ始動から既存ODディマ伸ばし。", sources: ["kamigame-modern"] })]
    },
    fMP: {
      normal: [rec("安定", "→＋中ヒット確認 → 強派生／下段派生", { power: 2, oki: 4, ease: 3, result: "派生でダウン", reason: "通常ヒットは派生確認が基本。立ち相手のみ強派生。", conditions: ["強派生は立ち相手限定"], sources: ["official-frame", "lab-data"] })],
      counter: [rec("総合", "→＋中（カウンター）→ ↓＋弱 → 弱ディマカイルス", { power: 3, oki: 4, ease: 4, result: "ダウン", reason: "+4F相当から4Fの↓＋弱。", sources: ["official-frame", "system-rules", "lab-data"] })],
      punish: [rec("総合", "→＋中（パニカン）→ N＋弱 → 弱ディマカイルス", { difficulty: 2, power: 3, oki: 4, ease: 4, result: "ダウン", reason: "+6F相当から6FのN＋弱。", conditions: ["距離確認"], sources: ["official-frame", "system-rules"], verification: "フレーム差分推定" })],
      rush: [rec("総合", "ラッシュ →＋中 → N＋弱 → 弱ディマカイルス", { drive: "0.5", difficulty: 2, power: 3, oki: 4, ease: 4, result: "ダウン", reason: "ラッシュ+4FでN＋弱へ。", conditions: ["距離確認"], sources: ["official-frame", "system-rules"], verification: "距離依存" })]
    },
    bHP: {
      normal: [
        rec("総合", "←＋強 → 強ディマカイルス2段 → 長押しN＋強", { power: 5, oki: 5, ease: 4, difficulty: 2, result: "前ステップ起き攻め", reason: "火力・継続・簡単さの基準ルート。", sources: ["official-frame", "kamigame-modern", "sukoreru-modern"] }),
        rec("火力", "←＋強 → 強ディマ2段 → ラッシュ←＋強 → 強ファランクス", { drive: "1", power: 5, oki: 4, ease: 3, difficulty: 4, result: "運び＋起き攻め", reason: "ゲージ1本で伸ばす。", sources: ["kamigame-modern"] }),
        rec("SA1", "←＋強 → 強ディマ2段 → 長押し↓＋強 → 最大溜めSA1", { super: "1", power: 5, oki: 2, ease: 2, difficulty: 4, result: "省エネ高火力", reason: "SA1で火力を出したい時。", sources: ["sukoreru-modern"] })
      ],
      counter: [rec("総合", "←＋強 → 強ディマカイルス2段 → 長押しN＋強", { power: 5, oki: 5, ease: 4, result: "起き攻め", reason: "キャンセルルートが安定。" })],
      punish: [rec("総合", "長押し←＋強（パニカン）→ ←＋強 → 強ディマ2段 → 長押しN＋強", { power: 5, oki: 5, ease: 3, difficulty: 3, result: "最大級の起き攻め", reason: "長押しが確定する時の本命。", sources: ["official-frame", "kamigame-modern", "sukoreru-modern"] })],
      rush: [rec("総合", "ラッシュ 長押し←＋強 → ←＋強 → 強ディマカイルス", { drive: "0.5", difficulty: 3, power: 5, oki: 5, ease: 3, result: "コンボ／ガード時も+4F", reason: "起き攻めの本命。ヒット時は通常←＋強へ。", sources: ["official-frame", "lab-data"] })]
    },
    fHK: {
      normal: [rec("総合", "→＋強 → 強派生 → 強ディマカイルス2段", { power: 4, oki: 4, ease: 5, result: "強ディマ追撃へ", reason: "強アシストコンボ系の安定ルート。", sources: ["official-frame", "lab-data"] }), rec("継続", "→＋強 → キャンセルラッシュ → 最速エンフォルド", { kind: "pressure", drive: "3", power: 3, oki: 4, ease: 4, result: "ガード崩し", reason: "ヒットコンボではなく、ガード時のコマ投げ択。", sources: ["lab-data"] })],
      counter: [rec("総合", "→＋強 → 強派生 → 強ディマカイルス", { power: 4, oki: 4, ease: 5, result: "ダウン／追撃", reason: "カウンターでも派生確認が安定。" })],
      punish: [rec("総合", "長押し→＋強（パニカン）→ 強派生 → 強ディマカイルス", { power: 5, oki: 4, ease: 4, result: "高火力ルート", reason: "長押しが確定する隙で使用。", sources: ["official-frame", "lab-data"] })],
      rush: [rec("総合", "ラッシュ →＋強 → 強派生 → 強ディマカイルス", { drive: "0.5", power: 4, oki: 4, ease: 5, result: "運び", reason: "ラッシュで届かせ、ターゲット完走。" })]
    },
    jLP: { normal: [rec("総合", "空中N＋弱ヒット → 着地して↓＋弱／位置調整", { kind: "oki", power: 1, oki: 3, ease: 5, result: "低高度なら小技確認", reason: "空対空は高度で着地有利が変わる。", conditions: ["高度依存"] })] },
    jMP: { normal: [rec("総合", "空中N＋中 → N＋中（ヴォラーレコンボ）", { damage: "1500", power: 4, oki: 4, ease: 5, result: "強制ダウン→ラッシュ起き攻め", reason: "空対空の本命。", sources: ["official-movelist", "lab-data"] })] },
    volare: { normal: [rec("総合", "強制ダウン → 前ステップ／生ラッシュ起き攻め", { kind: "oki", power: 2, oki: 5, ease: 5, result: "密着に近い起き攻め", reason: "追加コンボではなく起き攻めを取る。" })] },
    jHP: { normal: [rec("総合", "空中N＋強 → ←＋強 → 強ディマカイルス2段 → 長押しN＋強", { power: 5, oki: 5, ease: 4, difficulty: 3, result: "高火力＋起き攻め", reason: "長押しせず地上コンボへ。", sources: ["official-frame", "lab-data", "sukoreru-modern"] })] },
    jLK: { normal: [rec("総合", "空中A＋弱（めくり）→ A＋弱連打", { power: 2, oki: 4, ease: 5, result: "弱アシストコンボでダウン", reason: "めくり確認を簡単にする。", sources: ["lab-data"] })] },
    jMK: { normal: [rec("総合", "空中A＋中 → 着地↓＋弱 → 弱ディマカイルス", { power: 2, oki: 4, ease: 4, result: "ダウン", reason: "低めヒット時。高度により不成立。", conditions: ["低めヒット"], verification: "高度依存" })] },
    jHK: { normal: [rec("総合", "空中A＋強 → ←＋強 → 強ディマカイルス2段", { power: 5, oki: 5, ease: 4, difficulty: 3, result: "高火力", reason: "N＋強より足側で当てた時の同系統ルート。", sources: ["lab-data"] })] },
    caelum: { normal: [rec("総合", "低めカエルムアーク → 着地←＋強 → 強ディマカイルス", { power: 4, oki: 4, ease: 3, difficulty: 3, result: "地上高火力へ", reason: "+11F以上を利用。高度でつながりが変化。", conditions: ["低めヒット"], sources: ["official-frame", "lab-data"], verification: "高度依存" }), rec("継続", "ガードさせる → 投げ／A＋弱", { kind: "pressure", power: 2, oki: 4, ease: 4, result: "+7F以上から崩し", reason: "ヒットしなかった時も有利を活かす。" })] },
    middleTC: { normal: [rec("総合", "A＋中×2 → 中ディマカイルス2段", { damage: "2168〜2280", power: 3, oki: 5, ease: 5, result: "ダウン", reason: "ノーゲージ標準。", sources: ["kamigame-modern"] }), rec("火力", "A＋中×2 → ODディマ → ラッシュ←＋強 → 強ファランクス", { damage: "3010〜3156", drive: "3", difficulty: 4, power: 5, oki: 4, ease: 2, result: "運び", reason: "ゲージ使用の主力。", sources: ["kamigame-modern"] }), rec("倒し切り", "A＋中×2 → ODディマ → ラッシュ←＋強 → 強グラディウス → SA3", { damage: "5122前後", drive: "3", super: "3", difficulty: 4, power: 5, oki: 1, ease: 2, result: "リーサル", reason: "半分以下を倒し切る候補。", sources: ["kamigame-modern"] })] },
    heavyTC: { normal: [rec("総合", "N＋強→N＋強 → ラッシュ／安全飛び", { kind: "oki", power: 4, oki: 5, ease: 5, result: "ダウン+42F", reason: "コンボ完走後は起き攻めへ。" })] },
    fMPTC: { normal: [rec("総合", "→＋中→中（下段派生）→ 生ラッシュ", { kind: "oki", power: 3, oki: 4, ease: 4, result: "ダウン+31F", reason: "ヒット確認できた時だけ派生。" })] },
    fMPShoot: { normal: [rec("総合", "→＋中→強 → SA1／SA3", { super: "1 or 3", difficulty: 4, power: 5, oki: 2, ease: 2, result: "SA締め", reason: "立ち相手限定。2段目SAキャンセル。", conditions: ["立ち相手限定"], sources: ["official-frame", "lab-data"] }), rec("継続", "ダウン後に地上制圧", { kind: "oki", power: 2, oki: 3, ease: 5, result: "距離を取ってN＋中／ファランクス", reason: "SAを使わない時。" })] },
    fHKTC: { normal: [rec("総合", "→＋強→強 → 強ディマカイルス2段", { power: 4, oki: 4, ease: 5, result: "強ディマ追撃へ", reason: "強アシストコンボの主要パーツ。" })] },
    lightTC: { counter: [rec("総合", "ライトワンツー → 弱ディマカイルス／SA3", { power: 3, oki: 4, ease: 4, result: "ダウンまたはリーサル", reason: "初段カウンター時のみ連続ヒット。" })] },
    dimachaerusH: { normal: [rec("総合", "強ディマ2段 → 長押しN＋強", { power: 4, oki: 5, ease: 4, result: "前ステップ起き攻め", reason: "追撃の簡単さと継続を優先。" }), rec("火力", "強ディマ2段 → ラッシュ←＋強 → 強ファランクス", { drive: "1", power: 5, oki: 4, ease: 3, difficulty: 4, result: "運び", reason: "ゲージを使って伸ばす。" }), rec("倒し切り", "強ディマ2段 → 強グラディウス → SA3", { super: "3", power: 5, oki: 1, ease: 4, difficulty: 2, result: "リーサル", reason: "SA3の標準中継。", sources: ["kamigame-modern", "lab-data"] })] },
    dimachaerusOD: { normal: [rec("総合", "ODディマ2段 → 長押しN＋強", { drive: "2", power: 4, oki: 5, ease: 4, result: "起き攻め", reason: "対空・中攻撃始動の安定追撃。" }), rec("火力", "ODディマ2段 → ラッシュ←＋強 → 強ファランクス", { drive: "3", power: 5, oki: 4, ease: 2, difficulty: 4, result: "運び", reason: "高火力伸ばし。", sources: ["kamigame-modern"] }), rec("SA", "ODディマ2段 → 強グラディウス → SA3", { drive: "2", super: "3", power: 5, oki: 1, ease: 3, difficulty: 3, result: "倒し切り", reason: "SA3へ。" })] },
    phalanxOD: { normal: [rec("端・総合", "端ODファランクス → 長押し↓＋強 → 中グラディウス", { drive: "2", power: 5, oki: 4, ease: 3, difficulty: 3, result: "壁やられ追撃", reason: "端の基本追撃。", conditions: ["画面端"], sources: ["official-frame", "lab-data"] }), rec("端・SA1", "端ODファランクス → 長押し↓＋強 → 最大溜めSA1", { drive: "2", super: "1", power: 5, oki: 2, ease: 3, difficulty: 3, result: "省エネ大ダメージ", reason: "SA1で締める。", conditions: ["画面端"], sources: ["lab-data", "sukoreru-modern"] }), rec("ガード時", "ガード+4F → A＋中／投げ", { kind: "pressure", drive: "2", power: 2, oki: 5, ease: 5, result: "攻め継続", reason: "ヒットしなくても+4F。" })] }
  };

  const allMoveIds = [
    "stLP","stMK","stHP","crLP","crMP","crHP","crLK","crHK",
    "aMP","fMP","bHP","fHK","lightTC","middleTC","heavyTC","fMPTC",
    "fMPShoot","fHKTC","jLP","jMP","volare","jHP","jLK","jMK",
    "jHK","caelum","gladiusL","gladiusM","gladiusH","gladiusOD","dimachaerusL","dimachaerusM",
    "dimachaerusH","dimachaerusOD","phalanxL","phalanxM","phalanxH","phalanxOD","scutum","scutumOD",
    "tonitrus","procella","enfold","sa1","sa2","sa3","throwF","throwB"
  ];

  window.MARISA_FOLLOWUPS = {
    version: "0.11.0",
    basisDate: "2026-07-21",
    conditions: [
      { id: "normal", label: "通常", addFrames: 0 },
      { id: "counter", label: "カウンター", addFrames: 2 },
      { id: "punish", label: "パニカン", addFrames: 4 },
      { id: "rush", label: "ラッシュ", addFrames: 4 }
    ],
    sources,
    overrides,
    allMoveIds,
    rec
  };
})();
