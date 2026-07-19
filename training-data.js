window.MARISA_TRAINING = {
  version: "0.8.0",
  updatedAt: "2026-07-19",
  passRate: 0.8,
  reviewIntervals: [1, 3, 7, 14],
  issues: [
    { id: "anti-air", label: "対空が出ない", detail: "飛びに気づく・正面だけ落とす", skillId: "anti-air-front" },
    { id: "impact", label: "インパクトを見逃す", detail: "インパクトと何もしないを見分ける", skillId: "impact-response" },
    { id: "commit", label: "技を入れ込みすぎる", detail: "ヒット時だけ続け、ガード時は止める", skillId: "hit-confirm-medium" },
    { id: "close", label: "近距離で暴れる", detail: "ガード・A弱・待ちを選び分ける", skillId: "close-defense" },
    { id: "punish", label: "大きな隙を逃す", detail: "見てからA強を選ぶ", skillId: "punish-heavy" },
    { id: "assist", label: "A弱・中・強で迷う", detail: "距離と隙から役割を選ぶ", skillId: "assist-decision" }
  ],
  skills: [
    {
      id: "anti-air-front",
      name: "正面飛びへの対空",
      summary: "飛びを見てから↓＋強。飛んでいない時は押さない。",
      trigger: "相手が正面から前ジャンプ",
      response: "↓＋強",
      relatedMoves: ["crHP"],
      drillId: "anti-air-random",
      mission: "次の10試合は、勝敗より『正面の飛びへ↓＋強を押せたか』だけ数える。",
      gameSetup: [
        "録画1：前ジャンプ攻撃",
        "録画2：前ダッシュ投げ",
        "録画3：ドライブインパクト",
        "録画4：何もしない",
        "4録画をランダム再生"
      ]
    },
    {
      id: "impact-response",
      name: "インパクトへの反応",
      summary: "赤い演出へ返し、何もしていない相手には撃たない。",
      trigger: "相手のドライブインパクト",
      response: "インパクト返し",
      relatedMoves: [],
      drillId: "impact-random",
      mission: "次の10試合は、自分から雑に撃たず、相手のインパクト返しだけ狙う。",
      gameSetup: [
        "録画1：ドライブインパクト",
        "録画2：前ジャンプ攻撃",
        "録画3：弱攻撃を刻む",
        "録画4：何もしない",
        "画面端と中央を各10回"
      ]
    },
    {
      id: "hit-confirm-medium",
      name: "A中のヒット確認",
      summary: "ヒット時だけ続け、ガード時は止める。ダメージより入れ込み削減を優先。",
      trigger: "A中がヒットしたか、ガードされたか",
      response: "ヒットならA中継続／ガードなら待つ",
      relatedMoves: ["aMP"],
      drillId: "hit-confirm-random",
      mission: "次の10試合は、A中ガード後の入れ込みを0回にする。",
      warning: "A中コンボのゲージ・ダメージ条件は要再計測。ここでは継続判断だけを練習する。",
      gameSetup: [
        "ガード：ランダム",
        "カウンター：通常",
        "A中を一度だけ押す",
        "ヒット時だけ次へ",
        "ガード時は完全に止める"
      ]
    },
    {
      id: "close-defense",
      name: "近距離の守り",
      summary: "連携中はガード。止まった時だけA弱。大きな隙だけA強。",
      trigger: "相手の連携が続いているか、止まったか",
      response: "待つ／A弱／A強",
      relatedMoves: ["crLP", "fHK"],
      drillId: "close-defense-random",
      mission: "次の10試合は『分からない＝まだガード』を合言葉にする。",
      gameSetup: [
        "録画1：弱攻撃を2〜3回刻む",
        "録画2：前ダッシュ投げ",
        "録画3：大きな技を空振り",
        "録画4：何もしない",
        "最初はガードを解除しない"
      ]
    },
    {
      id: "punish-heavy",
      name: "大きな隙へのA強",
      summary: "A強は立ち回りで振る技ではなく、隙を見てから使う。",
      trigger: "昇龍拳などの大きな隙、明確な空振り",
      response: "A強",
      relatedMoves: ["fHK"],
      drillId: "punish-random",
      mission: "次の10試合はA強を『確定反撃か大きな空振り』に限定する。",
      gameSetup: [
        "録画1：無敵技を空振り",
        "録画2：大技を空振り",
        "録画3：小技をガードさせる",
        "録画4：何もしない",
        "大きな隙だけA強"
      ]
    },
    {
      id: "assist-decision",
      name: "アシストコンボの選択",
      summary: "A弱は近距離、A中はヒット確認、A強は大きな隙。",
      trigger: "距離と相手の隙",
      response: "A弱／A中／A強／待つ",
      relatedMoves: ["crLK", "aMP", "fHK"],
      drillId: "assist-decision-random",
      mission: "次の10試合は、A弱・A中・A強を役割外で押した回数を数える。",
      gameSetup: [
        "近距離の小さい隙：A弱",
        "中距離でA中ヒット：A中継続",
        "大きな隙：A強",
        "判断できない時：待つ"
      ]
    }
  ],
  drills: [
    {
      id: "anti-air-random",
      skillId: "anti-air-front",
      title: "飛び・前進・インパクト・待ち",
      choicePromptIds: ["jump", "idle"],
      prompts: [
        { id: "jump", text: "相手が正面から前ジャンプ", sub: "ジャンプ攻撃が来る", expected: { kind: "action", direction: "down", action: "heavy" }, answer: "↓＋強", tag: "対空" },
        { id: "dash", text: "相手が前ダッシュで接近", sub: "投げ間合いへ入ってくる", expected: { kind: "assist", key: "light" }, answer: "A弱", tag: "前進止め" },
        { id: "impact", text: "相手がドライブインパクト", sub: "赤い演出が見えた", expected: { kind: "impact" }, answer: "インパクト返し", tag: "DI" },
        { id: "idle", text: "相手は何もしていない", sub: "こちらの反応を待っている", expected: { kind: "wait" }, answer: "何も押さない", tag: "待ち" }
      ]
    },
    {
      id: "impact-random",
      skillId: "impact-response",
      title: "インパクトと誤反応を分ける",
      choicePromptIds: ["impact", "idle"],
      prompts: [
        { id: "impact", text: "相手がドライブインパクト", sub: "赤い演出と効果音", expected: { kind: "impact" }, answer: "インパクト返し", tag: "DI" },
        { id: "jump", text: "相手が前ジャンプ", sub: "インパクトではない", expected: { kind: "action", direction: "down", action: "heavy" }, answer: "↓＋強", tag: "対空" },
        { id: "jab", text: "相手が弱攻撃を刻んでいる", sub: "返しのインパクトは危険", expected: { kind: "wait" }, answer: "ガード継続", tag: "守り" },
        { id: "idle", text: "相手は何もしていない", sub: "インパクトを釣っている", expected: { kind: "wait" }, answer: "何も押さない", tag: "待ち" }
      ]
    },
    {
      id: "hit-confirm-random",
      skillId: "hit-confirm-medium",
      title: "A中ヒット時だけ続ける",
      choicePromptIds: ["hit", "block"],
      prompts: [
        { id: "hit", text: "A中がヒット", sub: "相手がのけぞった", expected: { kind: "assist", key: "medium" }, answer: "A中を継続", tag: "ヒット" },
        { id: "block", text: "A中をガードされた", sub: "相手は立っている", expected: { kind: "wait" }, answer: "止める", tag: "ガード" },
        { id: "whiff", text: "相手の無敵技が空振り", sub: "大きな隙がある", expected: { kind: "assist", key: "heavy" }, answer: "A強", tag: "確反" },
        { id: "idle", text: "まだ技を当てていない", sub: "中距離で見合っている", expected: { kind: "wait" }, answer: "待つ", tag: "中距離" }
      ]
    },
    {
      id: "close-defense-random",
      skillId: "close-defense",
      title: "近距離で勝手にターンを取らない",
      choicePromptIds: ["string", "gap"],
      prompts: [
        { id: "string", text: "相手の連携がまだ続いている", sub: "攻撃モーションが途切れていない", expected: { kind: "wait" }, answer: "ガード継続", tag: "連携中" },
        { id: "gap", text: "相手が近距離で一度止まった", sub: "小さい隙を確認", expected: { kind: "assist", key: "light" }, answer: "A弱", tag: "小さい隙" },
        { id: "big", text: "相手の大技が目の前で空振り", sub: "明確に大きな隙", expected: { kind: "assist", key: "heavy" }, answer: "A強", tag: "大きな隙" },
        { id: "idle", text: "相手がガードで固まっている", sub: "こちらの暴れを待っている", expected: { kind: "wait" }, answer: "一度待つ", tag: "待ち" }
      ]
    },
    {
      id: "punish-random",
      skillId: "punish-heavy",
      title: "A強を見てから押す",
      choicePromptIds: ["big", "small"],
      prompts: [
        { id: "big", text: "無敵技をガードした", sub: "相手は長い硬直中", expected: { kind: "assist", key: "heavy" }, answer: "A強", tag: "確反" },
        { id: "whiff", text: "相手の大技が空振り", sub: "こちらのA強が届く", expected: { kind: "assist", key: "heavy" }, answer: "A強", tag: "差し返し" },
        { id: "small", text: "相手の弱攻撃をガードした", sub: "大きな隙ではない", expected: { kind: "wait" }, answer: "ガード・A弱確認", tag: "小さい隙" },
        { id: "idle", text: "中距離で見合っている", sub: "相手はまだ何も振っていない", expected: { kind: "wait" }, answer: "A強を振らない", tag: "待ち" }
      ]
    },
    {
      id: "assist-decision-random",
      skillId: "assist-decision",
      title: "A弱・A中・A強を役割で選ぶ",
      choicePromptIds: ["close", "big"],
      prompts: [
        { id: "close", text: "近距離で小さい隙が見えた", sub: "大技を入れるほどではない", expected: { kind: "assist", key: "light" }, answer: "A弱", tag: "近距離" },
        { id: "medium", text: "中距離でA中がヒット", sub: "ヒット確認できた", expected: { kind: "assist", key: "medium" }, answer: "A中を継続", tag: "中距離" },
        { id: "big", text: "相手の無敵技をガード", sub: "大きな確定反撃", expected: { kind: "assist", key: "heavy" }, answer: "A強", tag: "確反" },
        { id: "idle", text: "相手は何もしていない", sub: "こちらの大技を待っている", expected: { kind: "wait" }, answer: "待つ", tag: "待ち" }
      ]
    }
  ]
};
