(() => {
  const year4 = window.MARISA_YEAR4;
  const api = year4?.api;
  if (!year4 || !api || year4.phase2Loaded) return;
  year4.phase2Loaded = true;
  year4.phase = Math.max(year4.phase || 1, 2);
  year4.quadrigaMoveIds = ["quadrigaL", "quadrigaM", "quadrigaH", "quadrigaOD"];
  year4.changeLog.push("Phase 2: 弱・中・強・ODクアドリガを検証候補技として追加");

  const quadrigaMoves = [
    {
      id: "quadrigaL",
      category: "必殺技",
      name: "弱クアドリガ",
      command: "現行モダン入力をゲーム内で確認中",
      classic: "↓↘→＋弱K / QCF+LK",
      purposes: ["コンボ", "牽制"],
      priority: "B",
      damage: "要再計測",
      startup: "要再計測（旧参考20F）",
      active: "要再計測",
      recovery: "要再計測",
      total: "要再計測",
      hit: "要再計測",
      block: "要再計測（旧参考-6F）",
      attribute: "上段・前進蹴り",
      when: "Year 4でモダンから使用可能になったクアドリガの短距離版。まず入力とコンボ成立を確認する時。",
      description: "使用可能であることと、旧クラシック版の数値を現行値として扱うことは別。現行モダンの入力・発生・硬直・補正を再計測してから主力へ昇格する。",
      strong: ["短い確定コンボ候補", "コンボ締め候補", "SA3中継候補"],
      follow: ["候補：強ディマ後の追撃", "候補：ヒット後SA3", "成立確認までは判断ドリルに出さない"],
      risks: ["現行入力未確定", "数値未実測", "距離とコンボカウントで不成立の可能性"],
      note: "availability=confirmed / verification=candidate。旧数値は比較用であり現行確定値ではない。",
      availability: "confirmed",
      verificationStatus: "candidate",
      basisDate: year4.basisDate
    },
    {
      id: "quadrigaM",
      category: "必殺技",
      name: "中クアドリガ",
      command: "現行モダン入力をゲーム内で確認中",
      classic: "↓↘→＋中K / QCF+MK",
      purposes: ["コンボ", "牽制"],
      priority: "B",
      damage: "要再計測",
      startup: "要再計測（旧参考24F）",
      active: "要再計測",
      recovery: "要再計測",
      total: "要再計測",
      hit: "要再計測",
      block: "要再計測（旧参考-4F）",
      attribute: "上段・前進蹴り",
      when: "弱版より距離が必要なコンボ締めや差し込みを検証する時。",
      description: "前進距離と発生の違いを弱・強版と比較するための検証対象。成立距離を床目盛りで記録する。",
      strong: ["中距離の締め候補", "運び候補", "先端当て候補"],
      follow: ["候補：強ディマ後の追撃", "候補：SA3中継", "距離別に10回検証"],
      risks: ["現行入力未確定", "数値未実測", "弱版より発生が遅い可能性"],
      note: "availability=confirmed / verification=candidate。",
      availability: "confirmed",
      verificationStatus: "candidate",
      basisDate: year4.basisDate
    },
    {
      id: "quadrigaH",
      category: "必殺技",
      name: "強クアドリガ",
      command: "現行モダン入力をゲーム内で確認中",
      classic: "↓↘→＋強K / QCF+HK",
      purposes: ["コンボ", "牽制", "弾抜け"],
      priority: "B",
      damage: "要再計測",
      startup: "要再計測（旧参考29F）",
      active: "要再計測",
      recovery: "要再計測",
      total: "要再計測",
      hit: "要再計測",
      block: "要再計測（旧参考-3F）",
      attribute: "上段・長距離前進蹴り",
      when: "遠い相手への差し込み、長い運び、強ディマ後の追撃候補を検証する時。",
      description: "最長距離版として、空振り時の危険と先端ガード時の距離をセットで確認する。",
      strong: ["長距離の運び候補", "遠い確定コンボ候補", "SA3中継候補"],
      follow: ["候補：強ディマ2段後", "候補：壁やられ後", "候補：SA3"],
      risks: ["発生が遅い可能性", "空振りが重い", "現行数値未実測"],
      note: "availability=confirmed / verification=candidate。",
      availability: "confirmed",
      verificationStatus: "candidate",
      basisDate: year4.basisDate
    },
    {
      id: "quadrigaOD",
      category: "必殺技",
      name: "ODクアドリガ",
      command: "現行モダン入力をゲーム内で確認中",
      classic: "↓↘→＋KK / QCF+KK",
      purposes: ["コンボ", "端攻め", "インパクト対策"],
      priority: "A",
      damage: "要再計測",
      startup: "要再計測（旧参考24F）",
      active: "要再計測",
      recovery: "要再計測",
      total: "要再計測",
      hit: "壁到達・壁やられ条件を要再計測",
      block: "要再計測（旧参考-6F）",
      attribute: "上段・アーマーブレイク候補・壁運び候補",
      when: "Year 4の新しいドライブ使用先として、画面端到達・壁やられ・SA分岐を検証する時。",
      description: "ODディマの代替技ではなく、役割の異なる新しい運び・端コンボ候補。A中始動や対空へ機械的に置き換えない。",
      strong: ["壁運び候補", "端の壁やられ候補", "SA2・SA3中継候補"],
      follow: ["最優先検証：膝派生→ODクアドリガ", "最優先検証：壁やられ→←＋強／長押し↓＋強", "成立後のみコンボドリルへ登録"],
      risks: ["ODディマより発生が遅い可能性", "対空代替ではない", "中央では追撃不能の可能性"],
      note: "availability=confirmed / verification=candidate。壁挙動とキャンセル先を最優先で実測する。",
      availability: "confirmed",
      verificationStatus: "candidate",
      basisDate: year4.basisDate
    }
  ];

  let added = false;
  api.addAfterMovePushHook(({ sourceItems, moves, nativePush }) => {
    if (added || !sourceItems.some(item => item?.id === "throwB")) return;
    added = true;
    nativePush.apply(moves, quadrigaMoves.map(move => ({ ...move })));
  });

  const edgeCard = window.MARISA_DATA.purposeCards.find(card => card.name === "端攻め");
  if (edgeCard) edgeCard.hint = "ODファランクス・ODクアドリガ";

  document.addEventListener("DOMContentLoaded", () => {
    const notice = document.querySelector("#year4-status");
    if (notice) {
      notice.innerHTML = "<b>YEAR 4 DATA STATUS</b><br>ODディマ依存を隔離し、弱・中・強・ODクアドリガを使用可能技として追加しました。現行数値は実測完了まで候補表示です。";
    }
  });
})();
