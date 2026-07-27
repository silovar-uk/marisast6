window.MARISA_DECISION_DRILL = {
  version: "2.0.0",
  countdown: [3, 2, 1],
  decisionTimes: {
    think: { label: "じっくり", seconds: 12 },
    standard: { label: "実戦", seconds: 8 },
    quick: { label: "即決", seconds: 5 }
  },
  categories: [
    { id: "all", label: "すべて" },
    { id: "stable", label: "安定" },
    { id: "resource", label: "ゲージ管理" },
    { id: "power", label: "火力・運び" },
    { id: "confirm", label: "ヒット状況" },
    { id: "punish", label: "確定反撃" },
    { id: "control", label: "入力・成立条件" }
  ],
  scenarios: [
    {
      id: "stable-amp-normal",
      category: "stable",
      title: "A中が通常ヒットした",
      prompt: "ゲージを使わず、まず確実にダウンを取りたい。どのコンボを選ぶ？",
      facts: [["位置", "中央"], ["ヒット", "通常"], ["ドライブ", "温存"], ["目的", "安定完走"]],
      choices: ["aMP-normal-basic", "aMP-normal-od", "aMP-normal-power"],
      correct: "aMP-normal-basic",
      why: "通常ヒットからノーゲージで完走しやすく、まず基準にするルート。ODやラッシュを使うルートは、ゲージを使う目的がある時に選ぶ。"
    },
    {
      id: "stable-crlp-normal",
      category: "stable",
      title: "↓弱が通常ヒットした",
      prompt: "SAを使わず、小技始動を安定して完走したい。どのコンボを選ぶ？",
      facts: [["位置", "中央"], ["ヒット", "通常"], ["SA", "温存"], ["目的", "基本ダウン"]],
      choices: ["crLP-normal-basic", "crLP-normal-lethal", "crLP-counter-basic"],
      correct: "crLP-normal-basic",
      why: "通常ヒット用の基本ルート。SA3ルートは倒し切り、カウンター用ルートはヒット状況が違う。"
    },
    {
      id: "stable-sthp-normal",
      category: "stable",
      title: "N強が通常ヒットした",
      prompt: "パニカンではない。無理に伸ばさず、成立する基準ルートを選ぶ。",
      facts: [["位置", "中央"], ["ヒット", "通常"], ["長押し", "なし"], ["目的", "成立優先"]],
      choices: ["stHP-normal-basic", "stHP-punish-basic", "stHP-punish-power"],
      correct: "stHP-normal-basic",
      why: "通常ヒットでは通常用のターゲットコンボを選ぶ。パニカン専用ルートは有利時間や長押し条件が必要。"
    },
    {
      id: "resource-amp-save",
      category: "resource",
      title: "A中が当たったが、ドライブを残したい",
      prompt: "次の守りと攻めにゲージを残す。最も目的に合うコンボは？",
      facts: [["位置", "中央"], ["ヒット", "通常"], ["ドライブ", "残したい"], ["目的", "ゲージ温存"]],
      choices: ["aMP-normal-basic", "aMP-normal-od", "aMP-normal-power"],
      correct: "aMP-normal-basic",
      why: "ノーゲージの基準ルートが目的に一致する。ODとラッシュを含むルートは、火力や運びを買う選択。"
    },
    {
      id: "resource-amp-oki",
      category: "resource",
      title: "A中からゲージを使って攻めを続けたい",
      prompt: "最大火力より、ODを使って起き攻めへつなぐことを優先する。",
      facts: [["位置", "中央"], ["ヒット", "通常"], ["ドライブ", "使用可"], ["目的", "起き攻め"]],
      choices: ["aMP-normal-basic", "aMP-normal-od", "aMP-normal-power"],
      correct: "aMP-normal-od",
      why: "OD継続ルートは、基準ルートよりゲージを使う代わりに起き攻めへつなげる選択。火力・運びを最優先するなら別ルート。"
    },
    {
      id: "resource-crlp-lethal",
      category: "resource",
      title: "↓弱が当たり、SA3で倒し切れる",
      prompt: "体力を残さず、このヒットでラウンドを終わらせたい。",
      facts: [["位置", "中央"], ["ヒット", "通常"], ["SA", "SA3あり"], ["目的", "倒し切り"]],
      choices: ["crLP-normal-basic", "crLP-normal-lethal", "crLP-punish-basic"],
      correct: "crLP-normal-lethal",
      why: "通常ヒットからSA3へつなぐ倒し切りルート。相手を倒せないなら、SAを温存する基本ルートも候補になる。"
    },
    {
      id: "power-amp-carry",
      category: "power",
      title: "A中が当たり、ゲージも十分ある",
      prompt: "中央から火力と運びを最大限伸ばしたい。どのコンボを選ぶ？",
      facts: [["位置", "中央"], ["ヒット", "通常"], ["ドライブ", "十分"], ["目的", "火力・運び"]],
      choices: ["aMP-normal-basic", "aMP-normal-od", "aMP-normal-power"],
      correct: "aMP-normal-power",
      why: "ODとラッシュを使い、火力と運びを伸ばすルート。ゲージ効率や完走率を優先する場面では下位のルートを選ぶ。"
    },
    {
      id: "power-bhp-punish",
      category: "power",
      title: "長押し←強がパニカンした",
      prompt: "入力に自信があり、最大反撃を取りたい。",
      facts: [["位置", "中央"], ["ヒット", "パニカン"], ["長押し", "成立"], ["目的", "最大反撃"]],
      choices: ["bHP-punish-command", "bHP-punish-simple", "bHP-normal-charge"],
      correct: "bHP-punish-command",
      why: "長押しパニカンからコマンド入力で最大反撃を取るルート。簡易版は安定重視、通常ヒット用は条件が違う。"
    },
    {
      id: "power-sthp-punish",
      category: "power",
      title: "長押しN強がパニカンした",
      prompt: "ゲージを使ってでも、反撃火力と運びを伸ばしたい。",
      facts: [["位置", "中央"], ["ヒット", "パニカン"], ["長押し", "成立"], ["目的", "最大火力"]],
      choices: ["stHP-normal-basic", "stHP-punish-basic", "stHP-punish-power"],
      correct: "stHP-punish-power",
      why: "長押しパニカンからラッシュを含めて伸ばす火力ルート。ノーゲージ反撃や通常ヒット用とは目的が異なる。"
    },
    {
      id: "confirm-crlp-counter",
      category: "confirm",
      title: "↓弱がカウンターヒットした",
      prompt: "通常ヒットではなく、増えた有利を使うルートを選ぶ。",
      facts: [["位置", "中央"], ["ヒット", "カウンター"], ["ゲージ", "不問"], ["目的", "カウンター確認"]],
      choices: ["crLP-normal-basic", "crLP-counter-basic", "crLP-punish-basic"],
      correct: "crLP-counter-basic",
      why: "カウンター時の有利を使ってN弱へつなぐ確認ルート。通常用とパニカン用では次の技が変わる。"
    },
    {
      id: "confirm-crlp-punish",
      category: "confirm",
      title: "↓弱がパニカンした",
      prompt: "パニカンで増えた有利を使い、通常より大きい反撃を取る。",
      facts: [["位置", "中央"], ["ヒット", "パニカン"], ["ゲージ", "不問"], ["目的", "有利活用"]],
      choices: ["crLP-normal-basic", "crLP-counter-basic", "crLP-punish-basic"],
      correct: "crLP-punish-basic",
      why: "パニカン時の有利で←強へつなぐルート。通常・カウンターでは同じつなぎ方は成立しない。"
    },
    {
      id: "confirm-amp-counter",
      category: "confirm",
      title: "A中がカウンターヒットした",
      prompt: "カウンター用の安定ルートを選び、条件違いのルートを避ける。",
      facts: [["位置", "中央"], ["ヒット", "カウンター"], ["ドライブ", "温存"], ["目的", "確認安定"]],
      choices: ["aMP-normal-basic", "aMP-counter-basic", "aMP-punish-basic"],
      correct: "aMP-counter-basic",
      why: "カウンター専用の確認ルート。通常用・パニカン用を混ぜず、ヒット状況に合わせて選ぶ。"
    },
    {
      id: "punish-amp",
      category: "punish",
      title: "A中がパニカンした",
      prompt: "ドライブを使い、安定した高リターンと起き攻めを取る。",
      facts: [["位置", "中央"], ["ヒット", "パニカン"], ["ドライブ", "使用可"], ["目的", "反撃＋起き攻め"]],
      choices: ["aMP-normal-od", "aMP-counter-basic", "aMP-punish-basic"],
      correct: "aMP-punish-basic",
      why: "パニカン用に用意されたOD追撃ルート。通常用ODルートやカウンター用ルートとは成立条件が異なる。"
    },
    {
      id: "punish-sthp-stable",
      category: "punish",
      title: "N強がパニカンしたが、ゲージを温存したい",
      prompt: "最大ではなく、ノーゲージの確定反撃を選ぶ。",
      facts: [["位置", "中央"], ["ヒット", "パニカン"], ["ドライブ", "温存"], ["目的", "安定反撃"]],
      choices: ["stHP-normal-basic", "stHP-punish-basic", "stHP-punish-power"],
      correct: "stHP-punish-basic",
      why: "パニカン用のノーゲージ基準ルート。最大火力ルートはゲージと入力精度を使う。"
    },
    {
      id: "punish-bhp-simple",
      category: "punish",
      title: "長押し←強がパニカンしたが、コマンド入力に不安がある",
      prompt: "火力を少し落としても、簡易入力で完走率を上げたい。",
      facts: [["位置", "中央"], ["ヒット", "パニカン"], ["入力", "安定優先"], ["目的", "完走率"]],
      choices: ["bHP-punish-command", "bHP-punish-simple", "bHP-counter-basic"],
      correct: "bHP-punish-simple",
      why: "簡易入力版は最大反撃より火力を落とす代わりに、入力を短くして完走率を上げる選択。"
    },
    {
      id: "control-bhp-charge",
      category: "control",
      title: "長押し←強が通常ヒットした",
      prompt: "長押しが成立している時の専用ルートを選ぶ。",
      facts: [["位置", "中央"], ["ヒット", "通常"], ["長押し", "成立"], ["目的", "高火力"]],
      choices: ["bHP-normal-charge", "bHP-normal-plain", "bHP-counter-basic"],
      correct: "bHP-normal-charge",
      why: "長押し通常ヒット用の高火力ルート。非長押し版やカウンター版とは成立条件が違う。"
    },
    {
      id: "control-bhp-plain",
      category: "control",
      title: "溜めていない←強が通常ヒットした",
      prompt: "長押し前提のルートを選ばず、通常版の基準ルートを選ぶ。",
      facts: [["位置", "中央"], ["ヒット", "通常"], ["長押し", "なし"], ["目的", "基準コンボ"]],
      choices: ["bHP-normal-charge", "bHP-normal-plain", "bHP-punish-simple"],
      correct: "bHP-normal-plain",
      why: "非長押しの通常ヒットから成立する基準ルート。長押し・パニカン条件のルートは選ばない。"
    },
    {
      id: "control-bhp-counter",
      category: "control",
      title: "←強がカウンターヒットした",
      prompt: "通常ヒットやパニカンと区別し、カウンター用のルートを選ぶ。",
      facts: [["位置", "中央"], ["ヒット", "カウンター"], ["長押し", "なし"], ["目的", "状況確認"]],
      choices: ["bHP-normal-plain", "bHP-counter-basic", "bHP-punish-simple"],
      correct: "bHP-counter-basic",
      why: "カウンター用の基準ルート。通常ヒット用や長押しパニカン用とは分けて覚える。"
    }
  ]
};
