(() => {
  const schema = window.MARISA_ROUTE_SCHEMA;
  if (!schema) throw new Error("MARISA_ROUTE_SCHEMA must load before drill-scenarios.js");

  const scenario = value => schema.compileScenario(value);
  const selection = (base, candidates, correct) => ({ base, candidates, correct });

  window.MARISA_DECISION_DRILL = {
    version: "3.0.0",
    definitionMode: "query",
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
      scenario({
        id: "stable-amp-normal",
        category: "stable",
        title: "A中が通常ヒットした",
        prompt: "ゲージを使わず、まず確実にダウンを取りたい。どのコンボを選ぶ？",
        facts: [["位置", "中央"], ["ヒット", "通常"], ["ドライブ", "温存"], ["目的", "安定完走"]],
        selection: selection(
          { starter: "aMP" },
          [
            { condition: "normal", tier: "stable" },
            { condition: "normal", tier: "standard", objectivesAll: ["oki"] },
            { condition: "normal", tier: "maximum" }
          ],
          { condition: "normal", tier: "stable" }
        ),
        why: "通常ヒットからノーゲージで完走しやすく、まず固定する安定ルート。ODやラッシュは、起き攻めや火力へ目的を変える時に選ぶ。"
      }),
      scenario({
        id: "stable-crlp-normal",
        category: "stable",
        title: "↓弱が通常ヒットした",
        prompt: "SAを使わず、小技始動を安定して完走したい。どのコンボを選ぶ？",
        facts: [["位置", "中央"], ["ヒット", "通常"], ["SA", "温存"], ["目的", "基本ダウン"]],
        selection: selection(
          { starter: "crLP" },
          [
            { condition: "normal", tier: "stable" },
            { condition: "normal", tier: "maximum", objectivesAll: ["lethal"] },
            { condition: "counter", tier: "standard" }
          ],
          { condition: "normal", tier: "stable" }
        ),
        why: "通常ヒット用の安定ルート。SA3を使う最大ルートは倒し切り、カウンター用の標準ルートはヒット状況が違う。"
      }),
      scenario({
        id: "stable-sthp-normal",
        category: "stable",
        title: "N強が通常ヒットした",
        prompt: "パニカンではない。無理に伸ばさず、成立する基準ルートを選ぶ。",
        facts: [["位置", "中央"], ["ヒット", "通常"], ["長押し", "なし"], ["目的", "成立優先"]],
        selection: selection(
          { starter: "stHP" },
          [
            { condition: "normal", tier: "stable" },
            { condition: "punish", tier: "standard" },
            { condition: "punish", tier: "maximum" }
          ],
          { condition: "normal", tier: "stable" }
        ),
        why: "通常ヒットでは安定ルートを選ぶ。パニカン用の標準・最大ルートは、有利時間や長押し条件が必要。"
      }),
      scenario({
        id: "resource-amp-save",
        category: "resource",
        title: "A中が当たったが、ドライブを残したい",
        prompt: "次の守りと攻めにゲージを残す。最も目的に合うコンボは？",
        facts: [["位置", "中央"], ["ヒット", "通常"], ["ドライブ", "残したい"], ["目的", "ゲージ温存"]],
        selection: selection(
          { starter: "aMP", condition: "normal" },
          [
            { tier: "stable" },
            { tier: "standard", objectivesAll: ["oki"] },
            { tier: "maximum" }
          ],
          { tier: "stable" }
        ),
        why: "ドライブ消費0の安定ルートが目的に一致する。標準はODで攻め継続、最大はODとラッシュで火力と運びを買う選択。"
      }),
      scenario({
        id: "resource-amp-oki",
        category: "resource",
        title: "A中からゲージを使って攻めを続けたい",
        prompt: "最大火力より、ODを使って起き攻めへつなぐことを優先する。",
        facts: [["位置", "中央"], ["ヒット", "通常"], ["ドライブ", "使用可"], ["目的", "起き攻め"]],
        selection: selection(
          { starter: "aMP", condition: "normal" },
          [
            { tier: "stable" },
            { tier: "standard", objectivesAll: ["oki"] },
            { tier: "maximum" }
          ],
          { tier: "standard", objectivesAll: ["oki"] }
        ),
        why: "OD継続は、安定ルートよりゲージを使う代わりに起き攻めを取る標準ルート。最大は火力と運びを優先する別目的。"
      }),
      scenario({
        id: "resource-crlp-lethal",
        category: "resource",
        title: "↓弱が当たり、SA3で倒し切れる",
        prompt: "体力を残さず、このヒットでラウンドを終わらせたい。",
        facts: [["位置", "中央"], ["ヒット", "通常"], ["SA", "SA3あり"], ["目的", "倒し切り"]],
        selection: selection(
          { starter: "crLP" },
          [
            { condition: "normal", tier: "stable" },
            { condition: "normal", tier: "maximum", objectivesAll: ["lethal"] },
            { condition: "punish", tier: "maximum", objectivesAll: ["punish"] }
          ],
          { condition: "normal", tier: "maximum", objectivesAll: ["lethal"] }
        ),
        why: "通常ヒット、SA3所持、倒し切りがそろった時だけ選ぶ最大ルート。倒せない時は安定ルートへ戻す。"
      }),
      scenario({
        id: "power-amp-carry",
        category: "power",
        title: "A中が当たり、ゲージも十分ある",
        prompt: "中央から火力と運びを最大限伸ばしたい。どのコンボを選ぶ？",
        facts: [["位置", "中央"], ["ヒット", "通常"], ["ドライブ", "十分"], ["目的", "火力・運び"]],
        selection: selection(
          { starter: "aMP", condition: "normal" },
          [
            { tier: "stable" },
            { tier: "standard", objectivesAll: ["oki"] },
            { tier: "maximum", objectivesAll: ["damage", "carry"] }
          ],
          { tier: "maximum", objectivesAll: ["damage", "carry"] }
        ),
        why: "ODとラッシュを使い、火力と運びを伸ばす最大ルート。ゲージ効率や完走率が必要な場面では安定・標準へ戻す。"
      }),
      scenario({
        id: "power-bhp-punish",
        category: "power",
        title: "長押し←強がパニカンした",
        prompt: "入力に自信があり、最大反撃を取りたい。",
        facts: [["位置", "中央"], ["ヒット", "パニカン"], ["長押し", "成立"], ["目的", "最大反撃"]],
        selection: selection(
          { starter: "bHP" },
          [
            { condition: "punish", tier: "maximum", input: "command" },
            { condition: "punish", tier: "stable", input: "simple" },
            { condition: "normal", tier: "maximum", charge: true }
          ],
          { condition: "punish", tier: "maximum", input: "command" }
        ),
        why: "長押しパニカンと入力精度を確認できたため、コマンド入力の最大ルートを選ぶ。完走を優先する時は簡易入力の安定ルートへ戻す。"
      }),
      scenario({
        id: "power-sthp-punish",
        category: "power",
        title: "長押しN強がパニカンした",
        prompt: "ゲージを使ってでも、反撃火力と運びを伸ばしたい。",
        facts: [["位置", "中央"], ["ヒット", "パニカン"], ["長押し", "成立"], ["目的", "最大火力"]],
        selection: selection(
          { starter: "stHP" },
          [
            { condition: "normal", tier: "stable" },
            { condition: "punish", tier: "standard" },
            { condition: "punish", tier: "maximum", charge: true }
          ],
          { condition: "punish", tier: "maximum", charge: true }
        ),
        why: "長押しパニカンとゲージがそろったため、ラッシュを含む最大ルートを選ぶ。ノーゲージなら標準へ戻す。"
      }),
      scenario({
        id: "confirm-crlp-counter",
        category: "confirm",
        title: "↓弱がカウンターヒットした",
        prompt: "通常ヒットではなく、増えた有利を使うルートを選ぶ。",
        facts: [["位置", "中央"], ["ヒット", "カウンター"], ["ゲージ", "不問"], ["目的", "カウンター確認"]],
        selection: selection(
          { starter: "crLP" },
          [
            { condition: "normal", tier: "stable" },
            { condition: "counter", tier: "standard" },
            { condition: "punish", tier: "maximum" }
          ],
          { condition: "counter", tier: "standard" }
        ),
        why: "カウンター時の有利を使ってN弱へつなぐ標準ルート。通常・パニカンでは成立条件が異なる。"
      }),
      scenario({
        id: "confirm-crlp-punish",
        category: "confirm",
        title: "↓弱がパニカンした",
        prompt: "パニカンで増えた有利を使い、通常より大きい反撃を取る。",
        facts: [["位置", "中央"], ["ヒット", "パニカン"], ["ゲージ", "不問"], ["目的", "有利活用"]],
        selection: selection(
          { starter: "crLP" },
          [
            { condition: "normal", tier: "stable" },
            { condition: "counter", tier: "standard" },
            { condition: "punish", tier: "maximum" }
          ],
          { condition: "punish", tier: "maximum" }
        ),
        why: "パニカン時の有利で←強へつなぐ条件付き最大ルート。通常・カウンターでは同じつなぎ方を選ばない。"
      }),
      scenario({
        id: "confirm-amp-counter",
        category: "confirm",
        title: "A中がカウンターヒットした",
        prompt: "カウンター用の安定した確認ルートを選び、条件違いを避ける。",
        facts: [["位置", "中央"], ["ヒット", "カウンター"], ["ドライブ", "温存"], ["目的", "確認安定"]],
        selection: selection(
          { starter: "aMP" },
          [
            { condition: "normal", tier: "stable" },
            { condition: "counter", tier: "standard" },
            { condition: "punish", tier: "standard", objectivesAll: ["punish"] }
          ],
          { condition: "counter", tier: "standard" }
        ),
        why: "カウンター専用の標準ルート。通常用の安定ルート、パニカン用の標準ルートとヒット状況で分ける。"
      }),
      scenario({
        id: "punish-amp",
        category: "punish",
        title: "A中がパニカンした",
        prompt: "ドライブを使い、安定した高リターンと起き攻めを取る。",
        facts: [["位置", "中央"], ["ヒット", "パニカン"], ["ドライブ", "使用可"], ["目的", "反撃＋起き攻め"]],
        selection: selection(
          { starter: "aMP" },
          [
            { condition: "normal", tier: "standard", objectivesAll: ["oki"] },
            { condition: "counter", tier: "standard", objectivesAll: ["confirm"] },
            { condition: "punish", tier: "standard", objectivesAll: ["punish"] }
          ],
          { condition: "punish", tier: "standard", objectivesAll: ["punish"] }
        ),
        why: "パニカン用のOD追撃を使う標準ルート。通常用ODやカウンター用は、同じA中始動でも成立条件が違う。"
      }),
      scenario({
        id: "punish-sthp-stable",
        category: "punish",
        title: "N強がパニカンしたが、ゲージを温存したい",
        prompt: "最大ではなく、ノーゲージの確定反撃を選ぶ。",
        facts: [["位置", "中央"], ["ヒット", "パニカン"], ["ドライブ", "温存"], ["目的", "安定反撃"]],
        selection: selection(
          { starter: "stHP" },
          [
            { condition: "normal", tier: "stable" },
            { condition: "punish", tier: "standard" },
            { condition: "punish", tier: "maximum" }
          ],
          { condition: "punish", tier: "standard" }
        ),
        why: "パニカン用のノーゲージ標準ルート。ゲージと長押し条件を使える時だけ最大へ進む。"
      }),
      scenario({
        id: "punish-bhp-simple",
        category: "punish",
        title: "長押し←強がパニカンしたが、コマンド入力に不安がある",
        prompt: "火力を少し落としても、簡易入力で完走率を上げたい。",
        facts: [["位置", "中央"], ["ヒット", "パニカン"], ["入力", "安定優先"], ["目的", "完走率"]],
        selection: selection(
          { starter: "bHP" },
          [
            { condition: "punish", tier: "maximum", input: "command" },
            { condition: "punish", tier: "stable", input: "simple" },
            { condition: "counter", tier: "standard" }
          ],
          { condition: "punish", tier: "stable", input: "simple" }
        ),
        why: "簡易入力の安定ルートは、最大反撃より火力を落とす代わりに完走率を上げる。入力に不安がある時の正しい戻り先。"
      }),
      scenario({
        id: "control-bhp-charge",
        category: "control",
        title: "長押し←強が通常ヒットした",
        prompt: "長押しが成立している時の専用ルートを選ぶ。",
        facts: [["位置", "中央"], ["ヒット", "通常"], ["長押し", "成立"], ["目的", "高火力"]],
        selection: selection(
          { starter: "bHP" },
          [
            { condition: "normal", tier: "maximum", charge: true },
            { condition: "normal", tier: "stable", charge: false },
            { condition: "counter", tier: "standard" }
          ],
          { condition: "normal", tier: "maximum", charge: true }
        ),
        why: "長押し通常ヒットが成立しているため、条件付き最大ルートを選ぶ。溜めていない時は安定ルートへ戻す。"
      }),
      scenario({
        id: "control-bhp-plain",
        category: "control",
        title: "溜めていない←強が通常ヒットした",
        prompt: "長押し前提のルートを選ばず、通常版の基準ルートを選ぶ。",
        facts: [["位置", "中央"], ["ヒット", "通常"], ["長押し", "なし"], ["目的", "基準コンボ"]],
        selection: selection(
          { starter: "bHP" },
          [
            { condition: "normal", tier: "maximum", charge: true },
            { condition: "normal", tier: "stable", charge: false },
            { condition: "punish", tier: "stable", input: "simple" }
          ],
          { condition: "normal", tier: "stable", charge: false }
        ),
        why: "非長押しの通常ヒットから成立する安定ルート。長押しやパニカンの条件を足さない。"
      }),
      scenario({
        id: "control-bhp-counter",
        category: "control",
        title: "←強がカウンターヒットした",
        prompt: "通常ヒットやパニカンと区別し、カウンター用のルートを選ぶ。",
        facts: [["位置", "中央"], ["ヒット", "カウンター"], ["長押し", "なし"], ["目的", "状況確認"]],
        selection: selection(
          { starter: "bHP" },
          [
            { condition: "normal", tier: "stable", charge: false },
            { condition: "counter", tier: "standard" },
            { condition: "punish", tier: "stable", input: "simple" }
          ],
          { condition: "counter", tier: "standard" }
        ),
        why: "カウンター用の標準ルート。通常ヒット用の安定ルートや、長押しパニカン用の安定ルートとは分けて覚える。"
      })
    ]
  };
})();
