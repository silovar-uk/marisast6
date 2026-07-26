window.MARISA_DRILL = {
  version: "0.1.0",
  basisDate: "2026-03-17",
  routes: [
    {
      id: "crLP-normal-basic",
      starter: "crLP",
      condition: "normal",
      label: "小技始動の基本",
      damage: 1320,
      damageStatus: "measured",
      input: "command",
      tags: ["ノーゲージ", "基本"],
      source: "followups-data.js crLP.normal 総合",
      steps: [
        { move: "crLP", type: "start" },
        { move: "crLP", type: "link" },
        { move: "dimachaerusL", type: "cancel", note: "2段目まで入力" }
      ]
    },
    {
      id: "crLP-normal-lethal",
      starter: "crLP",
      condition: "normal",
      label: "小技始動の倒し切り",
      damage: 3720,
      damageStatus: "estimated",
      input: "command",
      tags: ["SA3", "倒し切り"],
      source: "followups-data.js crLP.normal 倒し切り",
      steps: [
        { move: "crLP", type: "start" },
        { move: "crLP", type: "link" },
        { move: "dimachaerusL", type: "cancel", note: "1段止め" },
        { move: "sa3", type: "cancel", note: "コマンド入力4000。始動補正込みで概算" }
      ]
    },
    {
      id: "crLP-counter-basic",
      starter: "crLP",
      condition: "counter",
      label: "小技カウンター確認",
      damage: 1500,
      damageStatus: "estimated",
      input: "command",
      tags: ["カウンター確認"],
      source: "followups-data.js crLP.counter 総合",
      steps: [
        { move: "crLP", type: "start" },
        { move: "stLP", type: "link", note: "+6F相当から6FのN＋弱" },
        { move: "dimachaerusL", type: "cancel" }
      ]
    },
    {
      id: "crLP-punish-basic",
      starter: "crLP",
      condition: "punish",
      label: "小技パニカン確認",
      damage: 2100,
      damageStatus: "estimated",
      input: "command",
      tags: ["パニカン確認"],
      source: "followups-data.js crLP.punish 総合",
      steps: [
        { move: "crLP", type: "start" },
        { move: "bHP", type: "link", note: "+8F相当から8Fの←＋強" },
        { move: "dimachaerusH", type: "cancel", note: "2段目まで入力" }
      ]
    },
    {
      id: "stHP-punish-basic",
      starter: "stHP",
      condition: "punish",
      label: "強パニカンからの確認コンボ",
      damage: 3910,
      damageStatus: "measured",
      input: "command",
      tags: ["ノーゲージ確反", "基準"],
      source: "followups-data.js stHP.punish 総合",
      steps: [
        { move: "stHP", type: "start" },
        { move: "aMP", type: "link", note: "+7F相当から7FのA＋中" },
        { move: "aMP", type: "target", note: "ミドルワンツー2段目" },
        { move: "dimachaerusM", type: "cancel" }
      ]
    },
    {
      id: "bHP-normal-charge",
      starter: "bHP",
      condition: "normal",
      label: "長押し←＋強からの高火力",
      damage: 2800,
      damageStatus: "estimated",
      input: "command",
      tags: ["長押し", "起き攻め"],
      source: "data-2.js bHP.follow 長押しヒット → ←＋強 → 強ディマ",
      steps: [
        { move: "bHP", type: "start", charge: true },
        { move: "bHP", type: "link" },
        { move: "dimachaerusH", type: "cancel", note: "2段目まで入力" }
      ]
    },
    {
      id: "bHP-normal-plain",
      starter: "bHP",
      condition: "normal",
      label: "←＋強からの基準ルート",
      damage: 2600,
      damageStatus: "estimated",
      input: "command",
      tags: ["基準", "起き攻め"],
      source: "followups-data.js bHP.normal 総合",
      steps: [
        { move: "bHP", type: "start" },
        { move: "dimachaerusH", type: "cancel", note: "2段目まで入力" },
        { move: "stHP", type: "juggle", charge: true, note: "バウンド追撃。長押しN＋強" }
      ]
    },
    {
      id: "bHP-counter-basic",
      starter: "bHP",
      condition: "counter",
      label: "←＋強カウンターからの基準ルート",
      damage: 2600,
      damageStatus: "estimated",
      input: "command",
      tags: ["カウンター確認"],
      source: "followups-data.js bHP.counter 総合",
      steps: [
        { move: "bHP", type: "start" },
        { move: "dimachaerusH", type: "cancel", note: "2段目まで入力" },
        { move: "stHP", type: "juggle", charge: true, note: "バウンド追撃。長押しN＋強" }
      ]
    },
    {
      id: "bHP-punish-command",
      starter: "bHP",
      condition: "punish",
      label: "長押し←＋強パニカンの最大反撃",
      damage: 3400,
      damageStatus: "estimated",
      input: "command",
      tags: ["長押し", "最大反撃"],
      source: "followups-data.js bHP.punish 総合",
      steps: [
        { move: "bHP", type: "start", charge: true },
        { move: "bHP", type: "link", note: "長押し+13F+パニカン4F=17Fから発生8Fへ" },
        { move: "dimachaerusH", type: "cancel", note: "2段目まで入力" },
        { move: "stHP", type: "juggle", charge: true, note: "バウンド追撃。長押しN＋強" }
      ]
    },
    {
      id: "bHP-punish-simple",
      starter: "bHP",
      condition: "punish",
      label: "長押し←＋強パニカンの簡易入力ルート",
      damage: 2400,
      damageStatus: "estimated",
      input: "simple",
      tags: ["長押し", "簡易入力"],
      source: "followups-data.js bHP.punish（←＋SP版に置き換え）",
      steps: [
        { move: "bHP", type: "start", charge: true },
        { move: "bHP", type: "link", note: "長押し+13F+パニカン4F=17Fから発生8Fへ" },
        { move: "dimachaerusM", type: "cancel", note: "←＋SPで2段目まで" }
      ]
    },
    {
      id: "aMP-normal-basic",
      starter: "aMP",
      condition: "normal",
      label: "A中確認の基本",
      damage: 2224,
      damageStatus: "estimated",
      input: "simple",
      tags: ["ノーゲージ", "基本"],
      source: "followups-data.js aMP.normal 総合",
      steps: [
        { move: "aMP", type: "start" },
        { move: "aMP", type: "target", note: "ミドルワンツー2段目" },
        { move: "dimachaerusM", type: "cancel", note: "←＋SPで2段目まで" }
      ]
    },
    {
      id: "aMP-normal-od",
      starter: "aMP",
      condition: "normal",
      label: "A中からのOD継続",
      damage: 2752,
      damageStatus: "estimated",
      input: "simple",
      tags: ["OD", "起き攻め"],
      source: "followups-data.js aMP.normal 継続",
      steps: [
        { move: "aMP", type: "start" },
        { move: "aMP", type: "target", note: "ミドルワンツー2段目" },
        { move: "dimachaerusOD", type: "cancel", note: "A＋←＋SPで2段目まで" },
        { move: "stHP", type: "juggle", charge: true, note: "バウンド追撃。長押しN＋強" }
      ]
    },
    {
      id: "aMP-normal-power",
      starter: "aMP",
      condition: "normal",
      label: "A中からの火力伸ばし",
      damage: 3083,
      damageStatus: "estimated",
      input: "command",
      tags: ["OD", "ラッシュ", "運び"],
      source: "followups-data.js aMP.normal 火力",
      steps: [
        { move: "aMP", type: "start" },
        { move: "aMP", type: "target", note: "ミドルワンツー2段目" },
        { move: "dimachaerusOD", type: "cancel", note: "A＋←＋SPで2段目まで" },
        { move: "bHP", type: "juggle", note: "バウンド追撃をラッシュで拾う" },
        { move: "phalanxH", type: "cancel" }
      ]
    },
    {
      id: "aMP-counter-basic",
      starter: "aMP",
      condition: "counter",
      label: "A中カウンターの確認",
      damage: 2200,
      damageStatus: "estimated",
      input: "simple",
      tags: ["カウンター確認"],
      source: "followups-data.js aMP.counter 総合",
      steps: [
        { move: "aMP", type: "start" },
        { move: "aMP", type: "target", note: "ミドルワンツー2段目" },
        { move: "dimachaerusM", type: "cancel", note: "←＋SPで2段目まで" }
      ]
    },
    {
      id: "aMP-punish-basic",
      starter: "aMP",
      condition: "punish",
      label: "A中パニカンの安定ルート",
      damage: 2800,
      damageStatus: "estimated",
      input: "simple",
      tags: ["パニカン確認", "起き攻め"],
      source: "followups-data.js aMP.punish 総合",
      steps: [
        { move: "aMP", type: "start" },
        { move: "aMP", type: "target", note: "ミドルワンツー2段目" },
        { move: "dimachaerusOD", type: "cancel", note: "A＋←＋SPで2段目まで" },
        { move: "stHP", type: "juggle", charge: true, note: "バウンド追撃。長押しN＋強" }
      ]
    },
    {
      id: "stHP-normal-basic",
      starter: "stHP",
      condition: "normal",
      label: "N＋強確認の基本",
      damage: 1900,
      damageStatus: "estimated",
      input: "simple",
      tags: ["ノーゲージ", "基本"],
      source: "followups-data.js stHP.normal 総合",
      steps: [
        { move: "stHP", type: "start" },
        { move: "stHP", type: "target", note: "ヘヴィーツーヒッター2段目" }
      ]
    },
    {
      id: "stHP-punish-power",
      starter: "stHP",
      condition: "punish",
      label: "長押しパニカンの火力ルート",
      damage: 4266,
      damageStatus: "estimated",
      input: "command",
      tags: ["長押し", "ラッシュ", "最大反撃"],
      source: "followups-data.js stHP.punish 火力",
      steps: [
        { move: "stHP", type: "start", charge: true },
        { move: "bHP", type: "link", note: "長押し+7F+パニカン4F=11Fから発生8Fへ" },
        { move: "dimachaerusH", type: "cancel", note: "2段目まで入力" },
        { move: "bHP", type: "juggle", note: "バウンド追撃をラッシュで拾う" },
        { move: "phalanxH", type: "cancel" }
      ]
    },
    {
      id: "fMP-normal-sa",
      starter: "fMP",
      condition: "normal",
      label: "→中のヒット確認からSA",
      damage: 3600,
      damageStatus: "estimated",
      input: "command",
      tags: ["SA3", "立ち限定"],
      source: "followups-data.js fMPShoot.normal 総合",
      steps: [
        { move: "fMP", type: "start" },
        { move: "fMPShoot", type: "target", note: "強派生。立ち相手限定" },
        { move: "sa3", type: "cancel", note: "2段目からSAキャンセル" }
      ]
    },
    {
      id: "fMP-counter-basic",
      starter: "fMP",
      condition: "counter",
      label: "→中カウンターの確認",
      damage: 1500,
      damageStatus: "estimated",
      input: "command",
      tags: ["カウンター確認"],
      source: "followups-data.js fMP.counter 総合",
      steps: [
        { move: "fMP", type: "start" },
        { move: "crLP", type: "link", note: "+4F相当から4Fの↓＋弱" },
        { move: "dimachaerusL", type: "cancel" }
      ]
    },
    {
      id: "fHK-normal-basic",
      starter: "fHK",
      condition: "normal",
      label: "膝の強派生からの基準ルート",
      damage: 2600,
      damageStatus: "estimated",
      input: "command",
      tags: ["基準"],
      source: "followups-data.js fHK.normal 総合",
      steps: [
        { move: "fHK", type: "start" },
        { move: "fHKTC", type: "target", note: "強派生" },
        { move: "dimachaerusH", type: "cancel", note: "2段目まで入力" }
      ]
    },
    {
      id: "fHK-punish-charge",
      starter: "fHK",
      condition: "punish",
      label: "長押し膝パニカンの高火力ルート",
      damage: 3200,
      damageStatus: "estimated",
      input: "command",
      tags: ["長押し", "最大反撃"],
      source: "followups-data.js fHK.punish 総合",
      steps: [
        { move: "fHK", type: "start", charge: true },
        { move: "fHKTC", type: "target", note: "強派生" },
        { move: "dimachaerusH", type: "cancel", note: "2段目まで入力" }
      ]
    },
    {
      id: "dimachaerusOD-normal-basic",
      starter: "dimachaerusOD",
      condition: "normal",
      label: "対空ODディマからの起き攻め",
      damage: 1900,
      damageStatus: "estimated",
      input: "simple",
      tags: ["対空", "OD", "起き攻め"],
      source: "followups-data.js dimachaerusOD.normal 総合",
      steps: [
        { move: "dimachaerusOD", type: "start", note: "対空。A＋←＋SPで2段目まで" },
        { move: "stHP", type: "juggle", charge: true, note: "バウンド追撃。長押しN＋強" }
      ]
    },
    {
      id: "dimachaerusOD-normal-power",
      starter: "dimachaerusOD",
      condition: "normal",
      label: "対空ODディマからの火力伸ばし",
      damage: 2900,
      damageStatus: "estimated",
      input: "command",
      tags: ["対空", "OD", "運び"],
      source: "followups-data.js dimachaerusOD.normal 火力",
      steps: [
        { move: "dimachaerusOD", type: "start", note: "対空。A＋←＋SPで2段目まで" },
        { move: "bHP", type: "juggle", note: "バウンド追撃をラッシュで拾う" },
        { move: "phalanxH", type: "cancel" }
      ]
    },
    {
      id: "phalanxOD-normal-basic",
      starter: "phalanxOD",
      condition: "normal",
      label: "端ODファランクスの壁やられ追撃",
      damage: 3200,
      damageStatus: "estimated",
      input: "command",
      tags: ["画面端", "壁やられ"],
      source: "followups-data.js phalanxOD.normal 端・総合",
      steps: [
        { move: "phalanxOD", type: "start", note: "画面端限定。壁やられを起こす" },
        { move: "crHP", type: "juggle", charge: true, note: "壁やられ追撃。長押し↓＋強" },
        { move: "gladiusM", type: "link", note: "長押し+52Fから発生19Fへ。猶予は大きい" }
      ]
    }
  ]
};
