# MODERN MARISA LAB Year 4移行

基準日: 2026-08-03  
実装バージョン: 0.22.0-year4

## 原則

- 使用可能技、技性能、コンボ成立、起き攻め、学習導線の順で確定する。
- 旧ODディマカイルスをODクアドリガへ機械的に置換しない。
- 公開攻略よりゲーム内コマンドリストとトレーニングモードの実測を優先する。
- 未実測コンボは`candidate`とし、攻略の正解、習得ルート、判断ドリルに使用しない。
- 10回中10回の成立と条件記録がそろった候補のみ`measured`へ昇格する。

## Phase 1: 安全化

- `dimachaerusOD`を現役の技一覧から除外。
- ODディマを含む攻略カード、状況カード、派生候補を除外。
- 以下の旧コンボルートを`retired`へ移行。
  - `aMP-normal-od`
  - `aMP-normal-power`
  - `aMP-punish-basic`
  - `dimachaerusOD-normal-basic`
  - `dimachaerusOD-normal-power`
- 上記ルートを含む判断問題と習得ファミリーを現役データから除外。
- 対空候補をSA2、しゃがみ強、空対空へ再整理。

## Phase 2: クアドリガ追加

以下を使用可能技として追加。

- `quadrigaL`
- `quadrigaM`
- `quadrigaH`
- `quadrigaOD`

現行モダンの入力、発生、持続、硬直、ダメージ、壁挙動は未実測のため`candidate`表示とする。旧クラシック版の数値は比較用の参考値で、現行確定値ではない。

## Phase 3: コンボ検証キュー

優先順位を付けて候補を登録。

### 最優先

- 膝強派生→ODクアドリガ
- 長押しN強パニカン→膝→ODクアドリガ
- インパクトパニカン→膝→ODクアドリガ
- ODクアドリガ壁やられ→追撃

### 次点

- ODクアドリガ→SA2／SA3
- 強ディマ2段→クアドリガ各強度
- インパクト壁やられ→クアドリガ系

### 不成立確認も重要

- A中×2→ODクアドリガ
- しゃがみ中→クアドリガ各強度

## Phase 4: 学習機能再構築

- 旧ルートを習得済み件数から除外。
- 旧習得データは`modern-marisa-combo-route-retired-v1`へ保存。
- 次に覚えるルートが旧ルートの場合は解除。
- クアドリガ系は`pendingFamilies`へ置き、現役の習得数に含めない。
- 技数、コンボ数、判断問題数を実データから表示。
- 旧3月調整リンクは旧基準資料として明示。
- ページ読み込み時に参照整合性を自動検査。

## 実測記録

ブラウザーの開発者コンソールで以下を実行すると検証用JSONの雛形を取得できる。

```js
MARISA_YEAR4.exportVerificationTemplate()
```

検証結果の登録例。

```js
MARISA_YEAR4.recordMeasurement("fHKTC-to-quadrigaOD", {
  attempts: 10,
  successes: 10,
  position: "center",
  opponentState: "standing",
  damage: 0,
  driveCost: 2,
  saCost: 0,
  result: "connected",
  note: "入力とダメージを実測値へ置換する"
})
```

## 公開前チェック

ブラウザーの開発者コンソールで実行。

```js
MARISA_YEAR4.validate()
```

`ok: true`を確認する。主な検査対象は以下。

- 現役技に`dimachaerusOD`が残っていない。
- クアドリガ4強度が技一覧に存在する。
- 現役コンボが削除済み技を参照していない。
- 判断問題の選択肢と正解が現役コンボを参照している。
- 習得ロードマップが現役コンボだけを参照している。
- 攻略カードに旧ODディマ表記が残っていない。
- 10回中10回の記録なしに候補が`measured`へ昇格していない。
