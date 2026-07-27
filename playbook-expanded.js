(() => {
  const data = window.MARISA_PLAYBOOK;
  if (!data) return;

  const SOURCE = {
    label: "すこれるブログ（仮）｜モダンマリーザ 立ち回り・コンボ・起き攻め",
    url: "https://www.sukoreru.com/sf6-modern-marisa"
  };

  const withSource = card => ({
    status: "memo",
    statusLabel: "参考整理",
    sources: [SOURCE],
    sourceNote: "参照記事のルートをMODERN MARISA LAB向けに再構成。ダメージ・入力猶予・キャラ差はトレーニングモードで最終確認。",
    ...card
  });

  const combo = card => withSource({ category: "combo", type: "combo", ...card });
  const okiDecision = card => withSource({ category: "oki", type: "decision", ...card });
  const okiRoute = card => withSource({ category: "oki", type: "route", ...card });
  const okiComparison = card => withSource({ category: "oki", type: "comparison", ...card });

  data.updatedAt = "2026-07-27";
  data.note = "参照記事の『とりこれコンボ』以降を、始動・ゲージ・画面位置・次の起き攻めで再構成。ダメージ・成立条件はゲーム内トレーニングモードとCAPCOM公式情報を最終確認先とする。";
  data.categories = data.categories.map(category => {
    if (category.id === "combo") return { ...category, description: "まずこれ、牽制、インパクト、確反、SA1から実戦ルートを選ぶ。" };
    if (category.id === "oki") return { ...category, description: "締め技と画面位置から、打撃・投げ・待ちを選ぶ。" };
    return category;
  });

  data.comboFilters = [
    { id: "all", label: "全部" },
    { id: "starter", label: "まずこれ" },
    { id: "poke", label: "牽制・シミー" },
    { id: "impact", label: "インパクト" },
    { id: "phalanx", label: "ODファランクス" },
    { id: "punish", label: "確定反撃" },
    { id: "sa1", label: "最大溜めSA1" },
    { id: "no-meter", label: "ノーゲージ" },
    { id: "od", label: "OD使用" },
    { id: "sa", label: "SA使用" },
    { id: "corner", label: "画面端" }
  ];

  const comboCards = [
    combo({
      id: "starter-assist-heavy-sa3", number: "01", title: "A強×3→強グラディウス→SA3",
      lead: "強アシストコンボを軸にした、最初のSA3ルート。",
      damage: "—", drive: 0, sa: 3, position: "中央・画面端", condition: "A強始動",
      inputs: ["A強×3", "強グラディウス", "SA3"],
      use: "大きな隙、飛び込み後、確定反撃", next: "SA3を使わない時はディマ後の追撃と起き攻めを選ぶ",
      filters: ["starter", "no-meter", "sa"], relatedMoves: ["fHK", "gladiusH", "sa3"]
    }),
    combo({
      id: "starter-back-heavy-dima-sa3", number: "02", title: "←＋強→強ディマ→強グラ→SA3",
      lead: "←＋強が当たった時の基準ルート。",
      damage: "—", drive: 0, sa: 3, position: "中央・画面端", condition: "←＋強ヒット",
      inputs: ["←＋強", "強ディマカイルス", "強グラディウス", "SA3"],
      use: "打撃択、シミー、ラッシュ後のヒット", next: "SAを使わない時は強ディマ後の締めを選ぶ",
      filters: ["starter", "no-meter", "sa"], relatedMoves: ["bHP", "dimachaerusH", "gladiusH", "sa3"]
    }),
    combo({
      id: "starter-assist-medium-dima", number: "03", title: "A中×2→中ディマ",
      lead: "A中タゲコンから、起き攻めへつなぐ安定ルート。",
      damage: "—", drive: 0, sa: 0, position: "中央・画面端", condition: "A中ヒット確認",
      inputs: ["A中×2", "中ディマカイルス"],
      use: "近距離の主力確認", next: "生ラッシュから溜めA強／エンフォルド／ガード",
      filters: ["starter", "no-meter"], relatedMoves: ["aMP", "dimachaerusM", "enfold"]
    }),
    combo({
      id: "starter-light-dima", number: "04", title: "↓＋弱×n→弱ディマ",
      lead: "4F暴れや小技確認から、確実にダウンを取る。",
      damage: "—", drive: 0, sa: 0, position: "中央・画面端", condition: "小技ヒット",
      inputs: ["↓＋弱×n", "弱ディマカイルス"],
      use: "暴れ、細かい確定反撃", next: "生ラッシュから溜めN＋強／エンフォルド／ガード",
      filters: ["starter", "no-meter"], relatedMoves: ["crLP", "dimachaerusL", "enfold"]
    }),
    combo({
      id: "starter-jump-light", number: "05", title: "J＋A弱→A弱コンボ",
      lead: "めくりが当たった時は、難しく考えず弱アシストへ。",
      damage: "—", drive: "アシスト依存", sa: "アシスト依存", position: "中央・画面端", condition: "めくりJ＋A弱ヒット",
      inputs: ["J＋A弱", "A弱コンボ"],
      use: "めくり飛び込み", next: "ダウン後の距離を見て起き攻め",
      filters: ["starter"]
    }),
    combo({
      id: "starter-jump-heavy", number: "06", title: "J＋A強→←＋強→強ディマ→強グラ→SA3",
      lead: "正面飛び込みが通った時の高火力基準。",
      damage: "—", drive: 0, sa: 3, position: "中央・画面端", condition: "J＋A強ヒット",
      inputs: ["J＋A強", "←＋強", "強ディマカイルス", "強グラディウス", "SA3"],
      use: "飛び込み成功時", next: "SAを使わない時は強ディマ後の起き攻めへ",
      filters: ["starter", "no-meter", "sa"], relatedMoves: ["bHP", "dimachaerusH", "gladiusH", "sa3"]
    }),
    combo({
      id: "starter-cr-medium-rush", number: "07", title: "↓＋中→CR→N＋中→←＋強→強ディマ",
      lead: "置きの↓＋中からダウンを奪う基幹ルート。",
      damage: "—", drive: "CR", sa: "0〜3", position: "中央・画面端", condition: "↓＋中ヒット",
      inputs: ["↓＋中", "キャンセルラッシュ", "N＋中", "←＋強", "強ディマカイルス", "締めを選択"],
      use: "置き技、差し返し", next: "強グラ→SA3／追撃なし前ジャンプ起き攻め",
      filters: ["starter", "poke", "sa"], relatedMoves: ["crMP", "stMK", "bHP", "dimachaerusH"]
    }),
    combo({
      id: "starter-charged-heavy-punish", number: "08", title: "溜めN＋強パニカン→A強×3→強グラ→SA3",
      lead: "無敵技などの大きな隙へ入れる確定反撃の基準。",
      damage: "約6100", drive: 0, sa: 3, position: "中央・画面端", condition: "溜めN＋強パニカン",
      inputs: ["溜めN＋強", "A強×3", "強グラディウス", "SA3"],
      use: "大きな確定反撃", next: "画面端は強グラ前に溜め←＋強を追加可能",
      filters: ["starter", "punish", "no-meter", "sa"], relatedMoves: ["stHP", "fHK", "gladiusH", "sa3"]
    }),
    combo({
      id: "starter-impact-punish", number: "09", title: "インパクトパニカン→溜め←＋強→←＋強→強ディマ",
      lead: "インパクト返し後は、←＋強始動の形へ戻す。",
      damage: "—", drive: "DI", sa: "0〜3", position: "中央・画面端", condition: "インパクトパニカン",
      inputs: ["インパクト", "溜め←＋強", "←＋強", "強ディマカイルス", "締めを選択"],
      use: "インパクト返し成功時", next: "強グラ→SA3／別追撃から起き攻め",
      filters: ["starter", "impact", "sa"], relatedMoves: ["bHP", "dimachaerusH", "gladiusH", "sa3"]
    }),
    combo({
      id: "starter-impact-wall", number: "10", title: "インパクト壁やられ→強ディマ→溜めN＋強→強",
      lead: "画面端で状況と起き攻めを両立する基本ルート。",
      damage: "—", drive: "DI", sa: 0, position: "画面端", condition: "インパクト壁やられ",
      inputs: ["インパクト壁やられ", "強ディマカイルス", "溜めN＋強", "強派生"],
      use: "壁当て後の基準", next: "安全飛び。詳細セットプレーはD段階で追加",
      filters: ["starter", "impact", "corner", "no-meter"], relatedMoves: ["dimachaerusH", "stHP"]
    }),

    combo({
      id: "poke-forward-medium-counter", number: "11", title: "→＋中カウンター→↓＋弱→弱ディマ",
      lead: "差し込みの→＋中がカウンターした時だけ伸ばす。",
      damage: "—", drive: 0, sa: 0, position: "中央・画面端", condition: "→＋中カウンター",
      inputs: ["→＋中", "↓＋弱", "弱ディマカイルス"],
      use: "中距離の差し込み", next: "SA3へ行く時は弱ディマ1段目をキャンセル",
      filters: ["poke", "no-meter"], relatedMoves: ["fMP", "crLP", "dimachaerusL"]
    }),
    combo({
      id: "poke-standing-heavy-punish", number: "12", title: "N＋強パニカン→A中×2→中ディマ",
      lead: "差し返しのN＋強がパニカンした時の安定回収。",
      damage: "—", drive: 0, sa: 0, position: "中央・画面端", condition: "N＋強パニカン",
      inputs: ["N＋強", "A中×2", "中ディマカイルス"],
      use: "差し返し成功時", next: "中ディマ後の中央／端起き攻めへ",
      filters: ["poke", "no-meter"], relatedMoves: ["stHP", "aMP", "dimachaerusM"]
    }),
    combo({
      id: "shimmy-back-heavy", number: "13", title: "←＋強パニカン→A中×2→中ディマ",
      lead: "投げ抜けの空振りを見てから入れるシミー用。",
      damage: "—", drive: 0, sa: 0, position: "中央・画面端", condition: "←＋強パニカン",
      inputs: ["←＋強", "A中×2", "中ディマカイルス"],
      use: "投げ抜け狩り", next: "中ディマ後の起き攻め",
      filters: ["poke", "punish", "no-meter"], relatedMoves: ["bHP", "aMP", "dimachaerusM"]
    }),

    combo({
      id: "impact-wall-easy", number: "14", title: "壁やられ→A強×2→弱グラ",
      lead: "難しいルートが安定しない時の簡易版。",
      damage: "基本版と近い", drive: "DI", sa: 0, position: "画面端", condition: "インパクト壁やられ",
      inputs: ["インパクト壁やられ", "A強×2", "弱グラディウス"],
      use: "まず落とさないことを優先", next: "起き攻めは基本版より弱め",
      filters: ["impact", "corner", "no-meter"], relatedMoves: ["fHK", "gladiusL"]
    }),
    combo({
      id: "impact-wall-od-phalanx", number: "15", title: "壁やられ→A強→ODファランクス→溜め↓＋強→中グラ",
      lead: "画面端でドライブを使って伸ばすルート。",
      damage: "—", drive: "DI＋OD", sa: 0, position: "画面端", condition: "インパクト壁やられ",
      inputs: ["インパクト壁やられ", "A強", "ODファランクス", "溜め↓＋強", "中グラディウス"],
      use: "火力を伸ばしたい壁当て", next: "端の溜め←＋強重ねへ",
      filters: ["impact", "phalanx", "od", "corner"], relatedMoves: ["fHK", "phalanxOD", "crHP", "gladiusM"]
    }),
    combo({
      id: "impact-stun-standard", number: "16", title: "スタン→溜めA強→←＋強→CR×2→強ディマ→SA3",
      lead: "スタン後の倒し切り候補。途中のラッシュ回数でゲージ調整。",
      damage: "—", drive: "CR×2", sa: 3, position: "画面端", condition: "スタン",
      inputs: ["溜めA強", "←＋強", "CR→N＋中→←＋強", "CR→N＋中→←＋強", "強ディマ", "溜め←＋強", "強グラ", "SA3"],
      use: "リーサルが見えるスタン", next: "ドライブ温存時は最初の←＋強から強ディマへ",
      filters: ["impact", "corner", "sa"], relatedMoves: ["fHK", "bHP", "dimachaerusH", "sa3"]
    }),

    combo({
      id: "phalanx-basic-sa3", number: "17", title: "ODファランクス→溜め↓＋強→中グラ→SA3",
      lead: "画面端ODファランクス始動の基準。",
      damage: "—", drive: "OD", sa: 3, position: "画面端", condition: "ODファランクスヒット",
      inputs: ["ODファランクス", "溜め↓＋強", "中グラディウス", "SA3"],
      use: "弾抜け、下段・インパクト読み", next: "SAを使わない時は中グラ後の端起き攻め",
      filters: ["phalanx", "od", "sa", "corner"], relatedMoves: ["phalanxOD", "crHP", "gladiusM", "sa3"]
    }),
    combo({
      id: "phalanx-max-sa1", number: "18", title: "ODファランクス→溜め↓＋強→最大溜めSA1",
      lead: "SA1一本で大きく減らす省エネルート。",
      damage: "約4500", drive: "OD", sa: 1, position: "画面端", condition: "ODファランクスヒット",
      inputs: ["ODファランクス", "溜め↓＋強", "最大溜めSA1"],
      use: "SA3を温存しながら火力を出す", next: "当身成立時とは起き攻めが異なる点に注意",
      filters: ["phalanx", "sa1", "od", "sa", "corner"], relatedMoves: ["phalanxOD", "crHP", "sa1"]
    }),
    combo({
      id: "phalanx-lethal", number: "19", title: "ODファランクス→溜め↓＋強→ラッシュ連係→SA3",
      lead: "画面端のリーサル用。まず基準ルートを安定させてから。",
      damage: "—", drive: "OD＋ラッシュ複数", sa: 3, position: "画面端", condition: "ODファランクスヒット",
      inputs: ["ODファランクス", "溜め↓＋強", "ラッシュ←＋強", "CR→←＋強", "CR→A強×2", "強グラ", "SA3"],
      use: "倒し切り", next: "ラッシュを一回減らす時は中グラ締め",
      filters: ["phalanx", "od", "sa", "corner"], relatedMoves: ["phalanxOD", "crHP", "bHP", "gladiusH", "sa3"]
    }),

    combo({
      id: "punish-light-close", number: "20", title: "↓＋弱パニカン→←＋強→強ディマ→強グラ→SA3",
      lead: "ドライブリバーサルをガードした後などの4F確反。",
      damage: "—", drive: 0, sa: 3, position: "中央・画面端", condition: "↓＋弱パニカン・近距離",
      inputs: ["↓＋弱", "←＋強", "強ディマカイルス", "強グラディウス", "SA3"],
      use: "ドラリバガード後、4F確反", next: "距離が遠い時はA中ルートへ切り替え",
      filters: ["punish", "no-meter", "sa"], relatedMoves: ["crLP", "bHP", "dimachaerusH", "gladiusH", "sa3"]
    }),
    combo({
      id: "punish-light-far", number: "21", title: "↓＋弱パニカン→A中×2→中ディマ",
      lead: "←＋強が届きにくい距離の4F確反。",
      damage: "—", drive: 0, sa: 0, position: "中央・画面端", condition: "↓＋弱パニカン・やや遠め",
      inputs: ["↓＋弱", "A中×2", "中ディマカイルス"],
      use: "遠めのドラリバ確反", next: "中ディマ後の起き攻め",
      filters: ["punish", "no-meter"], relatedMoves: ["crLP", "aMP", "dimachaerusM"]
    }),
    combo({
      id: "punish-heavy-lethal", number: "22", title: "溜めN＋強パニカン→A強→CR×2→強ディマ→SA3",
      lead: "中央でも安定しやすい大きな確定反撃のリーサル候補。",
      damage: "約6600／CA約6850", drive: "CR×2", sa: 3, position: "中央・画面端", condition: "溜めN＋強パニカン",
      inputs: ["溜めN＋強", "A強", "CR→N＋中→←＋強", "CR→N＋中→←＋強", "強ディマ", "強グラ", "SA3"],
      use: "無敵技ガード後の倒し切り", next: "端は強グラ前に溜め←＋強を追加可能",
      filters: ["punish", "sa"], relatedMoves: ["stHP", "fHK", "bHP", "dimachaerusH", "sa3"]
    }),
    combo({
      id: "punish-heavy-sa2", number: "23", title: "溜めN＋強パニカン→A強→ODディマ→ラッシュA強×2→SA2",
      lead: "SA2で締めたい時の確定反撃ルート。",
      damage: "—", drive: "OD＋ラッシュ（計3本目安）", sa: 2, position: "中央・画面端", condition: "溜めN＋強パニカン",
      inputs: ["溜めN＋強", "A強", "ODディマカイルス", "ラッシュA強×2", "SA2"],
      use: "SA3を使わずに切り返しゲージを活用", next: "ゲージ残量と倒し切りを確認",
      filters: ["punish", "od", "sa"], relatedMoves: ["stHP", "fHK", "dimachaerusOD", "sa2"]
    }),
    combo({
      id: "punish-corner-max", number: "24", title: "溜めN＋強パニカン→A強×3→溜め↓＋強ループ→SA3",
      lead: "画面端の最大級リーサル。SA1・SA2への分岐も作れる。",
      damage: "SA3約6800／CA約7050", drive: "OD＋ラッシュ複数", sa: 3, position: "画面端", condition: "溜めN＋強パニカン",
      inputs: ["溜めN＋強", "A強×3", "溜め↓＋強", "ラッシュ←＋強", "ODグラ", "溜め↓＋強", "ラッシュ←＋強", "CR→溜め←＋強", "強グラ", "SA3"],
      use: "端の倒し切り", next: "溜め↓＋強の地点で最大溜めSA1へ分岐可能",
      filters: ["punish", "sa1", "od", "sa", "corner"], relatedMoves: ["stHP", "crHP", "bHP", "gladiusOD", "sa3"]
    }),

    combo({
      id: "sa1-medium-assist", number: "25", title: "A中×2→ODディマ→溜め↓＋強→最大溜めSA1",
      lead: "使用頻度の高いA中始動からSA1へ。",
      damage: "約3860", drive: "OD", sa: 1, position: "中央・画面端", condition: "A中ヒット確認",
      inputs: ["A中×2", "ODディマカイルス", "溜め↓＋強", "最大溜めSA1"],
      use: "SA3を温存して火力を取る", next: "リーサル判断はダメージをトレモ登録",
      filters: ["sa1", "od", "sa"], relatedMoves: ["aMP", "dimachaerusOD", "crHP", "sa1"]
    }),
    combo({
      id: "sa1-back-heavy", number: "26", title: "←＋強→強ディマ→溜め↓＋強→最大溜めSA1",
      lead: "←＋強始動の分かりやすいSA1ルート。",
      damage: "約4200", drive: 0, sa: 1, position: "中央・画面端", condition: "←＋強ヒット",
      inputs: ["←＋強", "強ディマカイルス", "溜め↓＋強", "最大溜めSA1"],
      use: "ラッシュを使わず火力を出す", next: "A強始動でも同じ考え方",
      filters: ["sa1", "no-meter", "sa"], relatedMoves: ["bHP", "dimachaerusH", "crHP", "sa1"]
    }),
    combo({
      id: "sa1-corner-efficient", number: "27", title: "溜め↓＋強パニカン→溜め↓＋強×2→最大溜めSA1",
      lead: "画面端でSA一本だけ使う高効率ルート。",
      damage: "約5000", drive: 0, sa: 1, position: "画面端", condition: "溜め↓＋強パニカン",
      inputs: ["溜め↓＋強", "溜め↓＋強", "溜め↓＋強", "最大溜めSA1"],
      use: "ドライブを残して倒し切りを狙う", next: "溜め↓＋強からSAキャンセル",
      filters: ["sa1", "punish", "no-meter", "sa", "corner"], relatedMoves: ["crHP", "sa1"]
    })
  ];

  const okiCards = [
    okiDecision({
      id: "oki-center-light-dima", number: "01", title: "弱ディマ後：生ラッシュ四択",
      lead: "最初は打撃・コマ投げ・待ちの三択。N＋中は溜めを見て固まる相手へ。",
      origin: "弱ディマカイルスでダウン／中央",
      choices: [
        { label: "打撃", title: "最速ラッシュ→溜めN＋強", text: "ヒット時は←＋強。ガード時も大幅有利でドライブを削る" },
        { label: "投げ", title: "ラッシュ→エンフォルド", text: "重ねタイミングは要練習。暴れを止めた後に見せる" },
        { label: "待ち", title: "ラッシュ→ガード", text: "無敵技をガードして溜めN＋強確反へ" },
        { label: "早い打撃", title: "ラッシュ→N＋中", text: "ヒット時は←＋強。ガード時は密着有利から投げ・シミー" }
      ],
      relatedMoves: ["dimachaerusL", "stHP", "stMK", "enfold"]
    }),
    okiDecision({
      id: "oki-center-medium-dima", number: "02", title: "中ディマ後：溜めA強を基準にする",
      lead: "弱ディマ後と同じ三択だが、最速ラッシュ溜めA強が軸。",
      origin: "中ディマカイルスでダウン／中央",
      choices: [
        { label: "打撃", title: "最速ラッシュ→溜めA強", text: "ヒット時はA強または←＋強。ガード後も←＋強へ" },
        { label: "投げ", title: "ラッシュ→エンフォルド", text: "ガードを固める相手へ" },
        { label: "待ち", title: "ラッシュ→ガード", text: "無敵技・SAを誘って確定反撃" },
        { label: "早い打撃", title: "ラッシュ→N＋中", text: "溜めを見て守る相手へ。密着有利を継続" }
      ],
      relatedMoves: ["dimachaerusM", "fHK", "stMK", "enfold"]
    }),
    okiRoute({
      id: "oki-center-heavy-dima-charge", number: "03", title: "強ディマ→溜めN＋強後：前ステップ溜めA強",
      lead: "ドライブを使わず、相手のゲージを削る省エネ起き攻め。",
      steps: [
        { label: "締め", text: "強ディマ→溜めN＋強" },
        { label: "接近", text: "前ステップ" },
        { label: "重ね", text: "溜めA強" },
        { label: "ヒット", text: "←＋強へつなぐ" },
        { label: "ガード", text: "弱連係や弱グラで暴れを止める" }
      ],
      judgment: "火力よりドライブ温存とガード削りを優先する時に選ぶ。",
      relatedMoves: ["dimachaerusH", "stHP", "fHK"]
    }),
    okiComparison({
      id: "oki-heavy-dima-followup-position", number: "04", title: "強ディマ→溜めN＋強→強は、中央と端で価値が変わる",
      lead: "同じ締めでも、中央ではコマ投げが暴れに負け、端では安全飛びへ行ける。",
      left: { label: "中央", title: "優先度は低め", points: ["ラッシュN＋中を厚めにする", "エンフォルドは暴れに負ける", "無敵技読みのガードを混ぜる"] },
      right: { label: "画面端", title: "主力の締め", points: ["安全飛びへ移行", "火力・ゲージ・継続のバランスが良い", "詳細セットプレーはD段階で拡張"] },
      relatedMoves: ["dimachaerusH", "stHP"]
    }),
    okiDecision({
      id: "oki-center-phalanx-end", number: "05", title: "強ディマ→ラッシュ←＋強→強ファランクス後",
      lead: "打撃重ねをN＋強とA強から選び、投げと待ちを混ぜる。",
      origin: "強ファランクス締め／中央",
      choices: [
        { label: "火力", title: "ラッシュ→溜めN＋強", text: "ヒット時のダメージを優先" },
        { label: "SA回収", title: "ラッシュ→溜めA強", text: "SAゲージ回収を優先" },
        { label: "投げ", title: "ラッシュ→エンフォルド", text: "打撃を警戒して固まる相手へ" },
        { label: "待ち", title: "ラッシュ→ガード／N＋中", text: "無敵技読み、または溜め重ねが不安定な時" }
      ],
      relatedMoves: ["phalanxH", "stHP", "fHK", "enfold"]
    }),
    okiDecision({
      id: "oki-center-heavy-dima-no-follow", number: "06", title: "強ディマ追撃なし：前ジャンプから全部最速",
      lead: "ドライブが少ない時の、簡単で再現しやすい起き攻め。",
      origin: "強ディマカイルスで追撃せずダウン／中央",
      choices: [
        { label: "打撃", title: "前ジャンプ→着地N＋中", text: "最速で持続重ね。ヒット時はA中へ" },
        { label: "投げ", title: "前ジャンプ→着地エンフォルド", text: "最速でちょうど重なる" },
        { label: "待ち", title: "前ジャンプ→着地ガード", text: "無敵技を誘う" }
      ],
      relatedMoves: ["dimachaerusH", "stMK", "aMP", "enfold"]
    }),
    okiRoute({
      id: "oki-center-sa1-counter", number: "07", title: "溜めSA1の当身成立後",
      lead: "通常のSA1ヒットではなく、当身が成立した時の起き攻め。",
      steps: [
        { label: "接近", text: "生ラッシュ" },
        { label: "重ね", text: "N＋中" },
        { label: "注意", text: "エンフォルドは相手が端に近い時だけ届きやすい" }
      ],
      judgment: "位置を見ずにコマ投げへ行かず、まずN＋中を基準にする。",
      relatedMoves: ["sa1", "stMK", "enfold"]
    }),
    okiRoute({
      id: "oki-center-max-gladius", number: "08", title: "最大溜めグラディウス後",
      lead: "ヒット演出が出る最大溜め版からの接近。",
      steps: [
        { label: "接近", text: "前ステップ" },
        { label: "重ね", text: "溜めN＋強" },
        { label: "注意", text: "厳密には相手の4F技に負ける余地がある" }
      ],
      judgment: "相手がこの距離で4Fを押すかを見て継続判断する。",
      relatedMoves: ["gladiusH", "stHP"]
    }),

    okiRoute({
      id: "oki-corner-light-dima", number: "09", title: "端・弱ディマ後：↓＋弱消費→溜め←＋強",
      lead: "入力を固定できる画面端の基本重ね。",
      steps: [
        { label: "ダウン", text: "弱ディマカイルス締め" },
        { label: "消費", text: "↓＋弱を空振り" },
        { label: "重ね", text: "溜め←＋強" },
        { label: "ヒット", text: "←＋強へ" },
        { label: "ガード", text: "有利から再び←＋強" }
      ],
      judgment: "端では感覚重ねより、フレーム消費で再現性を上げる。",
      relatedMoves: ["dimachaerusL", "crLP", "bHP"]
    }),
    okiRoute({
      id: "oki-corner-medium-dima", number: "10", title: "端・中ディマ／グラ締め：N＋弱消費→溜め←＋強",
      lead: "中ディマとグラディウス締めで共通化できるセット。",
      steps: [
        { label: "ダウン", text: "中ディマまたはグラディウス締め" },
        { label: "消費", text: "N＋弱を空振り" },
        { label: "重ね", text: "溜め←＋強" },
        { label: "確認", text: "ヒットでもガードでも次の←＋強を準備" }
      ],
      judgment: "締めを見て、↓＋弱消費とN＋弱消費を取り違えない。",
      relatedMoves: ["dimachaerusM", "gladiusM", "bHP"]
    }),
    okiRoute({
      id: "oki-corner-safe-jump-entry", number: "11", title: "端・強ディマ→溜めN＋強→強：安全飛びへ",
      lead: "C段階では入口だけ登録。ジャンプ後の細かな分岐はDで追加する。",
      steps: [
        { label: "締め", text: "強ディマ→溜めN＋強→強" },
        { label: "移行", text: "安全飛び" },
        { label: "次段階", text: "溜めJ攻撃、ガード後の択、再安全飛びをDで追加" }
      ],
      judgment: "まず『この締めなら安全飛び』を結び付ける。",
      relatedMoves: ["dimachaerusH", "stHP"]
    }),
    okiDecision({
      id: "oki-corner-throw", number: "12", title: "端・通常投げ後：溜めN＋強重ね",
      lead: "投げ後も打撃重ねから大きなリターンを取る。",
      origin: "画面端で通常投げ",
      choices: [
        { label: "ヒット", title: "溜めN＋強→←＋強", text: "持続ヒットを確認してコンボへ" },
        { label: "ガード", title: "溜めN＋強→A中", text: "暴れを止めながら攻めを継続" },
        { label: "簡略", title: "確認が難しければ両方A中", text: "まず再現性を優先" }
      ],
      relatedMoves: ["stHP", "bHP", "aMP"]
    }),
    okiRoute({
      id: "oki-corner-phalanx-punish", number: "13", title: "端・ファランクスパニカン後：N＋中消費→溜めA強",
      lead: "パニカン後の有利を、持続重ねへ変換する。",
      steps: [
        { label: "成立", text: "ファランクスがパニカン" },
        { label: "消費", text: "N＋中を空振り" },
        { label: "重ね", text: "溜めA強" },
        { label: "確認", text: "ヒット・ガードとも←＋強を準備" }
      ],
      judgment: "A強ヒット時は←＋強始動コンボへ。",
      relatedMoves: ["phalanxM", "stMK", "fHK", "bHP"]
    })
  ];

  data.cards = [
    ...data.cards.filter(card => card.category !== "combo" && card.category !== "oki"),
    ...comboCards,
    ...okiCards
  ];

  const referenceShelf = data.cards.find(card => card.id === "reference-shelf");
  if (referenceShelf && Array.isArray(referenceShelf.sources) && !referenceShelf.sources.some(source => source.url === SOURCE.url)) {
    referenceShelf.sources.push({ ...SOURCE, role: "コンボ・起き攻め" });
  }
})();
