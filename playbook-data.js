window.MARISA_PLAYBOOK = {
  updatedAt: "2026-07-17",
  note: "ダメージ・ゲージ・成立条件は、ゲーム内トレーニングモードとCAPCOM公式情報を最終確認先とする。",
  categories: [
    { id: "core", label: "基本", eyebrow: "ROUND PLAN", description: "試合中に考える順番を固定する。" },
    { id: "neutral", label: "立ち回り", eyebrow: "NEUTRAL", description: "距離ごとに、振る技と待つ場面を分ける。" },
    { id: "combo", label: "コンボ", eyebrow: "CONVERSION", description: "何が当たったかとゲージ量から選ぶ。" },
    { id: "oki", label: "起き攻め", eyebrow: "OKIZEME", description: "コンボ後の一手までセットで覚える。" },
    { id: "defense", label: "守り", eyebrow: "DEFENSE", description: "飛び・インパクト・近距離の混乱を減らす。" },
    { id: "practice", label: "練習", eyebrow: "TRAINING", description: "一度に一つの判断だけ直す。" }
  ],
  comboFilters: [
    { id: "all", label: "全部" },
    { id: "no-meter", label: "ノーゲージ" },
    { id: "od", label: "OD使用" },
    { id: "sa", label: "SA使用" },
    { id: "corner", label: "壁際" },
    { id: "verify", label: "要検証" }
  ],
  cards: [
    {
      id: "round-order",
      category: "core",
      type: "route",
      number: "01",
      title: "ラウンド中は、この順番だけ考える",
      lead: "火力より先に、判断の順番を整える。",
      steps: [
        { label: "寄る", text: "A中が届く距離まで歩く" },
        { label: "見る", text: "飛び・インパクト・前進を監視" },
        { label: "触る", text: "A弱かA中で小さく触る" },
        { label: "確認", text: "当たった時だけコンボへ" },
        { label: "続ける", text: "ダウン後は起き攻め" }
      ],
      judgment: "遠距離から技を当てにいくのではなく、中距離まで安全に移動してから勝負する。",
      relatedMoves: ["aMP", "crLP"]
    },
    {
      id: "current-problems",
      category: "core",
      type: "evidence",
      number: "02",
      title: "いま負けにつながっている6つ",
      lead: "実戦中の独り言から、そのまま拾った課題。",
      evidence: [
        { quote: "技をついつい入れ込みすぎ", meaning: "相手を見る前に次の技を決めている" },
        { quote: "インパクト全然見れてねえ", meaning: "地上技へ意識を使いすぎている" },
        { quote: "大技振りすぎかな", meaning: "近距離の小さい選択肢が不足" },
        { quote: "対空がそもそも出ない", meaning: "画面上部を見る時間が少ない" },
        { quote: "SA2が今出なかったら誤爆", meaning: "入力を速さだけで解決しようとしている" },
        { quote: "ガードが緩い", meaning: "分からない場面で守りを解除している" }
      ],
      status: "measured",
      statusLabel: "実戦メモ",
      sourceNote: "2026年7月17日の対戦メモを分類"
    },
    {
      id: "three-rules",
      category: "core",
      type: "manifesto",
      number: "03",
      title: "見る。止める。当たったら伸ばす。",
      lead: "試合中の情報量を、三つまで減らす。",
      statement: "SEE / STOP / CONVERT",
      columns: [
        { title: "見る", text: "ジャンプ、インパクト、前ダッシュ" },
        { title: "止める", text: "対空、弱攻撃、ガード" },
        { title: "伸ばす", text: "ヒット確認後だけOD・ラッシュ・SA" }
      ],
      avoid: ["分からないからインパクト", "届かない距離の強攻撃", "ガード確認なしのOD技"]
    },
    {
      id: "first-loadout",
      category: "core",
      type: "loadout",
      number: "04",
      title: "最初に持ち込むのは5本だけ",
      lead: "新しいコンボを増やす前に、使用場面を固定する。",
      loadout: [
        { role: "近距離", move: "A弱コンボ", detail: "1,320 / ノーゲージ" },
        { role: "中距離", move: "A中", detail: "ヒットかガードを見る" },
        { role: "大きな隙", move: "A強コンボ", detail: "3,020 / ノーゲージ" },
        { role: "飛び", move: "↓＋強", detail: "正面対空を一つに固定" },
        { role: "弱始動火力", move: "A弱×2→ODディマ", detail: "2,584 / OD使用" }
      ],
      relatedMoves: ["crLK", "crLP", "aMP", "fHK", "crHP", "dimachaerusOD"]
    },
    {
      id: "distance-map",
      category: "neutral",
      type: "distance",
      number: "01",
      title: "距離で、やることを変える",
      lead: "強い技を選ぶのではなく、届く技を選ぶ。",
      zones: [
        { name: "遠距離", tone: "quiet", action: "歩く・パリィ", points: ["A中の距離まで寄る", "適当なファランクスを減らす", "焦って前ジャンプしない"] },
        { name: "中距離", tone: "main", action: "A中・膝・グラ", points: ["ここが主戦場", "半歩進んで一度止まる", "空振りを見たら差し返す"] },
        { name: "近距離", tone: "danger", action: "ガード・A弱", points: ["分からなければ守る", "小技から始める", "大技とインパクトへ逃げない"] }
      ],
      relatedMoves: ["aMP", "gladiusL", "crLP"]
    },
    {
      id: "medium-range-loop",
      category: "neutral",
      type: "route",
      number: "02",
      title: "中距離は、半歩と停止で作る",
      lead: "ボタンを押し続けると、相手の飛びとインパクトが見えなくなる。",
      steps: [
        { label: "1", text: "半歩進む" },
        { label: "2", text: "いったん止まる" },
        { label: "3", text: "相手の前進を見る" },
        { label: "4", text: "A中か膝を置く" },
        { label: "5", text: "空振りなら追わない" }
      ],
      judgment: "『何か振る時間』と『画面を見る時間』を交互に作る。",
      relatedMoves: ["aMP", "stMK", "fHK"]
    },
    {
      id: "close-range-priority",
      category: "neutral",
      type: "priority",
      number: "03",
      title: "近距離で迷った時の優先順位",
      lead: "読み切れていない場面では、強い技より小さい技。",
      priority: [
        { rank: 1, title: "ガード", text: "相手の連携が終わったかを見る" },
        { rank: 2, title: "A弱・屈弱", text: "小さい隙へ最速で触る" },
        { rank: 3, title: "通常投げ", text: "相手が固まった時だけ" },
        { rank: 4, title: "A強", text: "大きな隙を見てから" }
      ],
      warning: "『分からない』は攻撃の合図ではなく、ガード継続の合図。",
      relatedMoves: ["crLP", "fHK"]
    },
    {
      id: "burnout-pressure",
      category: "neutral",
      type: "comparison",
      number: "04",
      title: "相手をバーンアウトさせた後",
      lead: "『バーンアウトマリーザが強い』は、自分ではなく相手がバーンアウトした場面として整理する。",
      left: { label: "中央", title: "削って端へ運ぶ", points: ["膝→弱グラディウス", "ガード削りを優先", "無理なインパクトはまだ撃たない"] },
      right: { label: "画面端", title: "壁やられを狙う", points: ["打撃と投げを散らす", "インパクトの成立条件を見る", "SA返しのゲージを確認"] },
      status: "memo",
      statusLabel: "動画・実戦メモ",
      relatedMoves: ["fHK", "gladiusL"]
    },
    {
      id: "distance-lab",
      category: "neutral",
      type: "practice",
      number: "05",
      title: "技振りの距離を、3地点で記録する",
      lead: "技名ではなく、届く・先端・空振りで覚える。",
      tasks: [
        { time: "地点A", title: "密着", text: "ガード後の状況まで確認" },
        { time: "地点B", title: "先端", text: "最も安全に使える距離を保存" },
        { time: "地点C", title: "空振り", text: "どこから後隙を狩られるか確認" }
      ],
      checklist: ["A弱", "A中", "A強", "膝", "グラディウス", "ファランクス", "インパクト"],
      judgment: "トレモの床模様を目印に、スクリーンショットも残す。"
    },
    {
      id: "assist-light-1320",
      category: "combo",
      type: "combo",
      number: "01",
      title: "A弱コンボ",
      lead: "近距離で迷った時の安定択。",
      damage: 1320,
      drive: 0,
      sa: 0,
      position: "中央・画面端",
      condition: "通常ヒット",
      inputs: ["A弱", "アシストコンボ完走"],
      use: "暴れ、小さい確定反撃、起き攻めへの入口",
      next: "生ラッシュから打撃／エンフォルド",
      filters: ["no-meter"],
      status: "measured",
      statusLabel: "実測済み",
      relatedMoves: ["crLK"],
      sourceNote: "2026年7月17日 トレモ実測"
    },
    {
      id: "assist-medium-2660",
      category: "combo",
      type: "combo",
      number: "02",
      title: "A中コンボ",
      lead: "中距離からの主力候補。ゲージ内訳を再計測する。",
      damage: 2660,
      drive: "要確認",
      sa: "1〜2?",
      position: "中央",
      condition: "通常ヒット想定",
      inputs: ["A中", "アシストコンボ完走"],
      use: "A中が当たった時の安定ルート",
      next: "条件をそろえて4,310ダメージ版と比較",
      filters: ["sa", "verify"],
      status: "verify",
      statusLabel: "ゲージ要確認",
      relatedMoves: ["aMP"],
      sourceNote: "実測2,660。動画メモには4,310の別条件あり"
    },
    {
      id: "assist-heavy-3020",
      category: "combo",
      type: "combo",
      number: "03",
      title: "A強コンボ",
      lead: "大きな隙へ入れるノーゲージ高火力。",
      damage: 3020,
      drive: 0,
      sa: 0,
      position: "中央・画面端",
      condition: "大きな隙への確定反撃",
      inputs: ["A強", "アシストコンボ完走"],
      use: "確定反撃。立ち回りで先に振らない",
      next: "ダウン状況と起き攻めを再確認",
      filters: ["no-meter"],
      status: "measured",
      statusLabel: "実測済み",
      relatedMoves: ["fHK"],
      sourceNote: "2026年7月17日 トレモ実測"
    },
    {
      id: "light-od-dima-2584",
      category: "combo",
      type: "combo",
      number: "04",
      title: "A弱×2→ODディマ→グラ",
      lead: "小技始動からドライブを使って伸ばす。",
      damage: 2584,
      drive: 2,
      sa: 0,
      position: "中央",
      condition: "近距離ヒット",
      inputs: ["A弱", "A弱", "ODディマカイルス", "2段目派生", "グラディウス"],
      use: "弱攻撃のヒット確認後",
      next: "正確な強度と入力順を再確認",
      filters: ["od", "verify"],
      status: "verify",
      statusLabel: "技順要確認",
      relatedMoves: ["crLP", "dimachaerusOD", "gladiusL"],
      sourceNote: "ダメージ2,584は実測。入力聞き取りに曖昧さあり"
    },
    {
      id: "knee-rush-gladius",
      category: "combo",
      type: "combo",
      number: "05",
      title: "膝→ラッシュ→膝→グラディウス",
      lead: "膝が当たった時の基礎ラッシュルート候補。",
      damage: "未計測",
      drive: "CR分",
      sa: 0,
      position: "中央",
      condition: "膝ヒット",
      inputs: ["膝", "キャンセルラッシュ", "膝", "グラディウス"],
      use: "中距離からのリターン",
      next: "膝の正式入力と成立距離を確認",
      filters: ["verify"],
      status: "memo",
      statusLabel: "動画メモ",
      relatedMoves: ["fHK", "gladiusL"],
      sources: [{ label: "膝ラッシュ膝グラディウス", url: "https://youtu.be/3FJOodJeUTk?si=dI04TOvq5soE2sXJ" }]
    },
    {
      id: "amp-od-dima-route",
      category: "combo",
      type: "combo",
      number: "06",
      title: "A中×2→ODディマ→ラッシュ引大",
      lead: "A中のヒット確認から最大火力へ進む候補。",
      damage: "未計測",
      drive: "OD＋CR",
      sa: "0〜3",
      position: "中央",
      condition: "A中2段ヒット",
      inputs: ["A中", "A中", "ODディマ", "2段目", "ラッシュ", "←＋強", "締め"],
      use: "ヒット確認後の高火力",
      next: "ODファランクス／ODグラ／SA3から締めを選ぶ",
      filters: ["od", "sa", "verify"],
      status: "memo",
      statusLabel: "動画メモ",
      relatedMoves: ["aMP", "dimachaerusOD", "bHP"],
      sources: [
        { label: "モダンマリーザ初心者向け立ち回り", url: "https://youtu.be/4wrIL8_faGA?si=B00u1emtwPPoK3IZ" },
        { label: "モダンマリーザの勧め", url: "https://youtu.be/FyqxyhXfhVQ?si=vxwrCTmPbmiDr9hx" }
      ]
    },
    {
      id: "wall-impact-2784",
      category: "combo",
      type: "combo",
      number: "07",
      title: "壁当て→ODファランクス系→投げ",
      lead: "壁際の実測ルート。技順を確定させる。",
      damage: "約2,784",
      drive: "DI＋OD",
      sa: 0,
      position: "画面端",
      condition: "インパクト壁当て",
      inputs: ["DI壁当て", "ODファランクス系", "スクトゥム移行?", "エンフォルド"],
      use: "画面端でインパクトが通った時",
      next: "相手位置別に成立を確認",
      filters: ["od", "corner", "verify"],
      status: "verify",
      statusLabel: "技順要確認",
      relatedMoves: ["phalanxOD", "scutum", "enfold"],
      sourceNote: "ダメージ約2,784は実測メモ"
    },
    {
      id: "corner-sa3-route",
      category: "combo",
      type: "combo",
      number: "08",
      title: "壁ドン→膝→ODファランクス→SA3",
      lead: "画面端で勝ち切るための候補ルート。",
      damage: "未計測",
      drive: "DI＋OD",
      sa: 3,
      position: "画面端",
      condition: "壁ドン",
      inputs: ["壁ドン", "膝", "ODファランクス", "SA3"],
      use: "リーサル、または大きくリードを取る場面",
      next: "エンフォルド締めとのダメージ・状況比較",
      filters: ["od", "sa", "corner", "verify"],
      status: "memo",
      statusLabel: "動画メモ",
      relatedMoves: ["fHK", "phalanxOD", "sa3"],
      sources: [{ label: "初心者向けコンボ", url: "https://youtu.be/T9FAksRUCb4?si=m-EgVtCzM5QyNYgB" }]
    },
    {
      id: "assist-light-oki",
      category: "oki",
      type: "decision",
      number: "01",
      title: "A弱コンボ後は、三択だけ",
      lead: "ダメージ1,320で終わらせず、次の接触を作る。",
      origin: "A弱コンボでダウン",
      choices: [
        { label: "打撃", title: "生ラッシュ→引大", text: "相手が暴れる時" },
        { label: "投げ", title: "生ラッシュ→エンフォルド", text: "相手がガードで固まる時" },
        { label: "待ち", title: "生ラッシュ→ガード", text: "無敵技を読んだ時" }
      ],
      relatedMoves: ["crLK", "bHP", "enfold"]
    },
    {
      id: "dima-oki",
      category: "oki",
      type: "decision",
      number: "02",
      title: "ディマ締め後の打撃・投げ・待ち",
      lead: "毎回溜め膝に行かず、相手の守り方で変える。",
      origin: "ディマカイルスでダウン",
      choices: [
        { label: "打撃", title: "ラッシュ→溜め膝", text: "暴れとバックステップを止める" },
        { label: "投げ", title: "ラッシュ→通常投げ／エンフォルド", text: "ガードを崩す" },
        { label: "待ち", title: "ラッシュ→停止", text: "SA・無敵技を空振らせる" }
      ],
      relatedMoves: ["dimachaerusM", "fHK", "enfold"]
    },
    {
      id: "safe-jump-check",
      category: "oki",
      type: "verification",
      number: "03",
      title: "安全飛びは、成立条件まで書く",
      lead: "『前飛びで安全飛び』だけでは、実戦で再現できない。",
      fields: [
        { label: "始動", value: "ODディマ→溜め強→強（動画メモ）" },
        { label: "受け身", value: "通常／後方を両方確認" },
        { label: "入力", value: "最速前ジャンプか確認" },
        { label: "検証", value: "4F無敵技をガードできるか" },
        { label: "例外", value: "キャラ・距離差を記録" }
      ],
      status: "verify",
      statusLabel: "要検証",
      sources: [{ label: "モダンマリーザの勧め", url: "https://youtu.be/FyqxyhXfhVQ?si=vxwrCTmPbmiDr9hx" }]
    },
    {
      id: "corner-pressure",
      category: "oki",
      type: "comparison",
      number: "04",
      title: "画面端は、火力と継続を分けて考える",
      lead: "毎回SA3へ行くと、次のラウンドや起き攻めが細くなる。",
      left: { label: "倒し切れる", title: "SA3で決める", points: ["体力を確認", "補正後ダメージを確認", "相手のSA返しを考えない確定状況で使う"] },
      right: { label: "倒し切れない", title: "ダウンと端を残す", points: ["エンフォルド締め", "ドライブを残す", "次の打撃・投げへ"] },
      relatedMoves: ["sa3", "enfold"]
    },
    {
      id: "anti-air-one",
      category: "defense",
      type: "priority",
      number: "01",
      title: "対空は、まず正面の一種類",
      lead: "全部落とそうとすると、結局何も出ない。",
      priority: [
        { rank: 1, title: "↓＋強", text: "正面からの通常飛び" },
        { rank: 2, title: "ODディマ", text: "距離と反応が合う場面" },
        { rank: 3, title: "ガード", text: "判断が遅れた時" }
      ],
      warning: "真上・めくりは別課題。最初の検定には入れない。",
      relatedMoves: ["crHP", "dimachaerusOD"],
      sources: [{ label: "ODディマ対空", url: "https://youtu.be/pEj3Sk3uxLk?si=67DezaJFUJgHrO-F" }]
    },
    {
      id: "impact-rules",
      category: "defense",
      type: "comparison",
      number: "02",
      title: "インパクトを撃つ場面、撃たない場面",
      lead: "パニックボタンから、条件付きの反撃手段へ戻す。",
      left: { label: "撃つ", title: "条件が見えた時", points: ["キャンセル不可の大技", "画面端の固定連携", "相手のドライブが少ない"] },
      right: { label: "撃たない", title: "分からない時", points: ["相手が何もしていない", "弱攻撃を刻まれている", "相手にSA返しがある"] }
    },
    {
      id: "defense-random-recording",
      category: "defense",
      type: "practice",
      number: "03",
      title: "4録画で、誤反応を減らす",
      lead: "成功数だけでなく、何もしていない相手へ技を振った回数も数える。",
      tasks: [
        { time: "録画1", title: "前ジャンプ", text: "↓＋強で落とす" },
        { time: "録画2", title: "ドライブインパクト", text: "インパクト返し" },
        { time: "録画3", title: "前ダッシュ投げ", text: "A弱か投げ抜け" },
        { time: "録画4", title: "何もしない", text: "こちらも何もしない" }
      ],
      checklist: ["20回中誤反応5回以下", "対空70％", "インパクト返し70％"],
      judgment: "『何もしない』に攻撃したら失敗扱い。"
    },
    {
      id: "sa-input-clean",
      category: "defense",
      type: "practice",
      number: "04",
      title: "SAは、速さより入力履歴",
      lead: "出なかった時は、ボタン連打でなく原因を分類する。",
      tasks: [
        { time: "10回", title: "右向き単体", text: "入力履歴を毎回見る" },
        { time: "10回", title: "左向き単体", text: "左右差を確認" },
        { time: "各5回", title: "コンボ中", text: "位置入れ替わりも試す" }
      ],
      checklist: ["方向抜け", "余計な方向", "ボタンが早い", "ラッシュ入力残り"],
      judgment: "10回中9回に届かない日は、実戦で安定ルートを使う。",
      relatedMoves: ["sa1", "sa2", "sa3"]
    },
    {
      id: "close-defense",
      category: "defense",
      type: "manifesto",
      number: "05",
      title: "分からない場面では、まだ自分のターンではない",
      lead: "ガードが緩くなる瞬間を、言葉で止める。",
      statement: "UNKNOWN = KEEP BLOCKING",
      columns: [
        { title: "連携中", text: "しゃがみガードを継続" },
        { title: "相手が止まった", text: "A弱で小さく確認" },
        { title: "大きな隙", text: "A強コンボで確定反撃" }
      ],
      avoid: ["毎回投げ抜け", "毎回SA", "毎回インパクト"]
    },
    {
      id: "thirty-minute",
      category: "practice",
      type: "practice",
      number: "01",
      title: "30分の反省プログラム",
      lead: "コンボ練習だけで終わらず、判断と入力を半分ずつ扱う。",
      tasks: [
        { time: "8分", title: "対空・インパクト", text: "4録画をランダム再生" },
        { time: "5分", title: "対空だけ", text: "正面の飛びを↓＋強" },
        { time: "5分", title: "近距離", text: "ガード・A弱・投げだけ" },
        { time: "5分", title: "弱始動", text: "A弱×2→ODディマを分解" },
        { time: "5分", title: "SA", text: "左右と入力履歴" },
        { time: "2分", title: "記録", text: "負け方コードを一つ選ぶ" }
      ],
      judgment: "一日に直す主題は一つ。全部の成功率を同時に追わない。"
    },
    {
      id: "ten-match-rule",
      category: "practice",
      type: "timeline",
      number: "02",
      title: "実戦10試合を、3区間に分ける",
      lead: "勝率ではなく、使う判断を区切る。",
      periods: [
        { range: "1–3", title: "大技を減らす", text: "開始20秒は自分からインパクト禁止" },
        { range: "4–6", title: "弱攻撃確認", text: "A弱が当たった時だけ伸ばす" },
        { range: "7–10", title: "通常運転", text: "大技は確反・差し返し・セットプレーだけ" }
      ],
      result: "試合後に『不要な大技』『対空を押せた回数』『雑インパクト』だけ記録する。"
    },
    {
      id: "mistake-codes",
      category: "practice",
      type: "codes",
      number: "03",
      title: "負けた理由は、一試合一コード",
      lead: "『全部ダメだった』を禁止する。",
      codes: [
        { code: "A", label: "入れ込み", detail: "ガード確認前に必殺技まで出した" },
        { code: "B", label: "インパクト", detail: "見逃し／雑に自分から撃った" },
        { code: "C", label: "対空", detail: "飛びへ反応できなかった" },
        { code: "D", label: "入力", detail: "ラッシュ・SAが誤爆" },
        { code: "E", label: "ガード", detail: "相手の連携中に解除" },
        { code: "F", label: "距離", detail: "届かない技を振った" },
        { code: "G", label: "知識", detail: "相手の固有技が分からない" }
      ],
      result: "次の試合では、選んだ一コードだけ修正する。"
    },
    {
      id: "weekly-program",
      category: "practice",
      type: "timeline",
      number: "04",
      title: "1週間で、一周させる",
      lead: "毎日別の主題を扱い、Day 7で再検定する。",
      periods: [
        { range: "Day 1", title: "振らない", text: "何もしない相手へ攻撃しない" },
        { range: "Day 2", title: "対空", text: "正面だけ落とす" },
        { range: "Day 3", title: "近距離", text: "ガード・A弱・投げ" },
        { range: "Day 4", title: "弱始動", text: "ラッシュとODディマ" },
        { range: "Day 5", title: "SA", text: "左右10回中9回" },
        { range: "Day 6", title: "キャラ対策", text: "一人だけ調べる" },
        { range: "Day 7", title: "検定", text: "20試合で数値確認" }
      ],
      result: "検定：雑インパクト3回以下／入れ込み大技1試合平均1回以下／SA誤爆0。"
    },
    {
      id: "reference-shelf",
      category: "practice",
      type: "sources",
      number: "05",
      title: "動画は、役割を決めて見る",
      lead: "一本を全部覚えようとせず、今日の課題に必要な場面だけ見る。",
      sources: [
        { label: "膝ラッシュ膝グラディウス", url: "https://youtu.be/3FJOodJeUTk?si=dI04TOvq5soE2sXJ", role: "コンボ" },
        { label: "マスターに行くには", url: "https://youtu.be/6uvIhAD7pHM?si=ANI5AcsWMXs1f4gl", role: "立ち回り" },
        { label: "初心者向けコンボ", url: "https://youtu.be/T9FAksRUCb4?si=m-EgVtCzM5QyNYgB", role: "コンボ" },
        { label: "成長の過程", url: "https://youtu.be/nr9ReBqqPOQ?si=milNr83urgFvwW78", role: "振り返り" },
        { label: "ODディマ対空", url: "https://youtu.be/pEj3Sk3uxLk?si=67DezaJFUJgHrO-F", role: "対空" },
        { label: "初心者実戦講座", url: "https://youtu.be/4wrIL8_faGA?si=B00u1emtwPPoK3IZ", role: "全体" },
        { label: "モダンマリーザの勧め", url: "https://youtu.be/FyqxyhXfhVQ?si=vxwrCTmPbmiDr9hx", role: "セットプレー" }
      ]
    }
  ]
};
