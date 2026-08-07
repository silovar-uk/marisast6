# MODERN MARISA LAB

Street Fighter 6「モダンマリーザ」の技、状況判断、ガード後の攻防、実戦攻略、コンボ判断を目的別に整理した静的Webサイトです。

## 現行基準

- 調整基準日：**2026年8月3日**
- サイト版：`0.24.0`
- ODディマカイルス：現役データ、コンボ、判断問題、習得進捗から隔離
- 弱・中・強・ODクアドリガ：モダン使用可能技として登録
- クアドリガの現行入力、フレーム、ダメージ、壁挙動、コンボ：実測完了まで`candidate`
- 対空の第一候補：**ワンボタングラディウス**

旧資料や旧数値は削除せず、現行の確定情報とは分けて表示します。2026年3月17日の公式調整ページは、8月3日より前の**旧基準資料**としてのみ参照します。

## 公開ページ

- `index.html`：ホーム。状況、技、攻略、ドリルへの入口と今日の練習
- `situations.html`：距離、画面位置、相手行動から次の判断を逆引き
- `moves.html`：現行モダン技の用途、数値、条件別派生
- `advantage.html`：ガード有利、連続ガード、暴れ潰し、相打ち、割り込み、距離の穴
- `matchups.html`：全31キャラを差し・差し返し・置きで整理する個人用対策ラボ
- `strategy.html`：距離、対空、守り、起き攻め、コンボの試合設計
- `drill.html`：状況、ゲージ、目的に合う現役コンボルートを選ぶ判断ドリル

各公開ページには、カードや一覧とは別に、ページ全体の読み方を文章で説明する解説セクションを設けています。

## Year 4移行

### Phase 1：旧ODディマ依存の隔離

`dimachaerusOD`と、それを含む攻略カード、派生、状況、5つのコンボルート、判断問題、習得系統を現役データから除外します。既存の習得履歴は破棄せず、退役履歴として別保存します。

### Phase 2：クアドリガの登録

弱・中・強・ODクアドリガを技データへ追加します。旧クラシック数値は比較資料としてのみ保持し、現行モダンの未実測項目を確定値として扱いません。

### Phase 3：候補ルートの検証

クアドリガ関連の候補を高・中・低確度に分け、立ち／しゃがみ、中央／端、壁挙動、SA分岐などを検証します。10回中10回の成立記録がない候補は`measured`へ昇格しません。

### Phase 4：学習・参照整合性

現役ルートだけで進捗を再計算し、判断問題、習得系統、攻略カード、技参照の整合性を検査します。技数、ルート数、状況数は固定文言ではなく、読み込んだ現役データから算出します。

詳細は`YEAR4_MIGRATION.md`を参照してください。

## 有利と「埋まる／埋まらない」

`advantage.html`では、次の式で連携の隙間を整理します。

```text
隙間F = 次の技の発生F - 有利F - 1
```

最速4F技を基準にした分類：

- 隙間0F以下：連続ガード。完全に埋まる
- 1〜2F空き：連続ガードではないが4F暴れを潰す
- 3F空き：4F技と相打ち
- 4F以上：4F技で割り込み可能

フレーム上の隙間とは別に、ガードバックで次の技や投げが届かない「距離の穴」も確認します。

## 主なデータと機能

- `data-core.js`：基準日、カテゴリ、Year 4移行レイヤーの読込
- `data-1.js`〜`data-6.js`：基礎技データ
- `year4-phase1.js`〜`year4-phase4.js`：8月3日移行処理
- `page-guides.js` / `page-guides.css`：全ページの文章解説
- `advantage-page.js` / `advantage-page.css`：有利技抽出と隙間計算
- `situations*.js`：状況逆引き
- `playbook-*.js`：実戦攻略カード
- `drill-*.js`：コンボルート、問題、分析
- `combo-learning-data.js`：現役コンボの習得系統
- `version.json`：公開版とデータ基準
- `matchup-data.js` / `matchup-page.js`：全キャラ対策データ、QUICK/LAB、対戦後ログ、三択ドリル

## 保存データ

進捗はブラウザの`localStorage`だけに保存します。

- 現役ルート習得：`modern-marisa-combo-route-learning-v1`
- 退役ルート履歴：`modern-marisa-combo-route-retired-v1`
- 進捗サマリー：`modern-marisa-combo-route-summary-v1`
- 判断履歴：`marisa-decision-drill-v2`
- Year 4実測記録：`modern-marisa-year4-measurements-v1`
- キャラ対策進捗：`modern-marisa-matchup-progress-v1`
- キャラ別対戦後ログ：`modern-marisa-matchup-logs-v1`

## 検証

GitHub Actionsでは、次を検査してからPagesへ配信します。

- 公開JavaScriptの構文
- DOMなしでの`data-core.js`初期化
- Year 4移行後にODディマが現役データへ残っていないこと
- クアドリガ4強度が登録されること
- 現役ルート、判断問題、習得系統の参照整合性
- 公開7ページと静的ナビゲーション
- 全31キャラの対策データ、三つの判断、DO/DON'Tの整合性
- 基準日が2026年8月3日であること
- 「全48技」「24ルート」「ODディマ対空」など旧固定文言が公開ソースへ残っていないこと
- 有利ページのフレーム隙間判定

Pages配信用ワークフローは`.github/workflows/pages.yml`の1本だけです。

## ローカル確認

ビルドは不要です。

```bash
python -m http.server 8000
```

- ホーム：`http://localhost:8000/`
- 有利と連携：`http://localhost:8000/advantage.html`
- Year 4整合性：ブラウザコンソールで`MARISA_YEAR4.validate()`
- 有利判定自己テスト：`advantage.html?selftest`
