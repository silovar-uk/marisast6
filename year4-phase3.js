(() => {
  const year4 = window.MARISA_YEAR4;
  const api = year4?.api;
  if (!year4 || !api || year4.phase3Loaded) return;
  year4.phase3Loaded = true;
  year4.phase = Math.max(year4.phase || 2, 3);
  year4.changeLog.push("Phase 3: クアドリガ系コンボを検証キュー化し、未実測ルートを正解データから分離");

  const candidates = [
    {
      id: "fHKTC-to-quadrigaOD",
      title: "膝強派生→ODクアドリガ",
      confidence: "high",
      status: "candidate",
      hypothesis: "キャンセル可能な強派生から、OD版の運び・壁到達性能へつなぐ。",
      rejectWhen: "通常ヒットで連続ヒットしない、またはしゃがみ相手へ不安定。",
      tests: ["立ち通常ヒット10回", "しゃがみ通常ヒット10回", "中央・端前・完全端", "ダメージと壁挙動"]
    },
    {
      id: "stHP-punish-fHK-quadrigaOD",
      title: "長押しN強パニカン→膝→ODクアドリガ",
      confidence: "high",
      status: "candidate",
      hypothesis: "大きな確定反撃の有利を使い、膝を中継して運びを伸ばす。",
      rejectWhen: "膝までのリンク、または膝からOD版のキャンセルが成立しない。",
      tests: ["必要確反フレーム", "中央10回", "端到達距離", "SA2・SA3分岐"]
    },
    {
      id: "impact-fHK-quadrigaOD",
      title: "インパクトパニカン→膝→ODクアドリガ",
      confidence: "high",
      status: "candidate",
      hypothesis: "インパクトパニカンの長い有利から、運びと端到達を優先する。",
      rejectWhen: "始動補正込みで既存ノーゲージルートより明確に効率が悪い。",
      tests: ["中央", "端から床目盛り2個", "端から床目盛り1個", "壁やられ追撃"]
    },
    {
      id: "quadrigaOD-wall-followups",
      title: "ODクアドリガ壁やられ→追撃",
      confidence: "high",
      status: "candidate",
      hypothesis: "壁やられ後の追撃が、OD版を使う主目的になる。",
      rejectWhen: "現行版で壁やられが発生しない、または追撃猶予がない。",
      tests: ["←＋強", "長押し↓＋強", "強グラディウス", "SA2", "SA3", "前ジャンプ起き攻め"]
    },
    {
      id: "quadrigaOD-sa-branches",
      title: "ODクアドリガ→SA2／SA3",
      confidence: "medium",
      status: "candidate",
      hypothesis: "壁到達前後を問わず、SAで倒し切りへ移れる可能性を確認する。",
      rejectWhen: "キャンセル不能、または距離・高度により安定しない。",
      tests: ["中央SA2", "中央SA3", "壁前SA2", "壁前SA3", "簡易入力補正"]
    },
    {
      id: "dimachaerusH-to-quadriga",
      title: "強ディマ2段→クアドリガ各強度",
      confidence: "medium",
      status: "candidate",
      hypothesis: "強ディマ後の浮きへ、前進距離の異なる各版を比較する。",
      rejectWhen: "コンボカウントまたは高度により全強度が不成立。",
      tests: ["弱10回", "中10回", "強10回", "OD10回", "始動別高度差"]
    },
    {
      id: "wall-impact-to-quadriga",
      title: "インパクト壁やられ→クアドリガ系",
      confidence: "medium",
      status: "candidate",
      hypothesis: "壁やられの長い追撃猶予から、運びではなく火力・SA中継として使う。",
      rejectWhen: "既存の強ディマ・溜め↓強ルートより火力と状況が劣る。",
      tests: ["弱・中・強", "OD", "強ディマ経由", "SA3中継", "起き攻め比較"]
    },
    {
      id: "aMP-to-quadrigaOD",
      title: "A中×2→ODクアドリガ",
      confidence: "low",
      status: "candidate",
      hypothesis: "旧ODルートの代替可否を、成立・不成立の両面から確認する。",
      rejectWhen: "通常ヒットで連続ヒットしない。成立してもゲージ効率が悪い。",
      tests: ["通常", "カウンター", "パニカン", "ラッシュ始動", "立ち・しゃがみ"]
    },
    {
      id: "crMP-to-quadriga",
      title: "↓中→クアドリガ各強度",
      confidence: "low",
      status: "candidate",
      hypothesis: "キャンセル自体と距離適性を確認し、立ち回り入れ込みの可否を判断する。",
      rejectWhen: "全強度で連続ヒットしない、またはガード時リスクが大きすぎる。",
      tests: ["弱・中・強・OD", "先端ヒット", "先端ガード", "インパクト耐性"]
    }
  ];

  year4.comboCandidates = candidates;
  year4.measurements = year4.measurements || {};
  year4.recordMeasurement = (candidateId, result) => {
    const candidate = candidates.find(item => item.id === candidateId);
    if (!candidate) throw new Error(`Unknown Year 4 candidate: ${candidateId}`);
    const record = {
      gameVersion: year4.basisDate,
      checkedAt: new Date().toISOString(),
      attempts: Number(result?.attempts) || 0,
      successes: Number(result?.successes) || 0,
      position: result?.position || "unspecified",
      opponentState: result?.opponentState || "unspecified",
      damage: result?.damage ?? null,
      driveCost: result?.driveCost ?? null,
      saCost: result?.saCost ?? null,
      result: result?.result || "pending",
      note: result?.note || ""
    };
    (year4.measurements[candidateId] ||= []).push(record);
    candidate.status = record.attempts >= 10 && record.successes === record.attempts ? "measured" : "candidate";
    return record;
  };

  api.registerGlobalPatch("MARISA_PLAYBOOK", value => {
    if (!value || !Array.isArray(value.cards)) return value;
    value.cards.push({
      id: "year4-quadriga-verification",
      category: "practice",
      type: "verification",
      number: "Y4",
      title: "Year 4 クアドリガ検証キュー",
      lead: "公開攻略の更新を待たず、キャンセル、距離、壁挙動、SA分岐を一件ずつ確定する。",
      fields: candidates.map(candidate => ({
        label: candidate.confidence === "high" ? "最優先" : candidate.confidence === "medium" ? "次点" : "不成立確認",
        value: `${candidate.title}｜${candidate.tests.join("・")}`
      })),
      status: "candidate",
      statusLabel: "実測待ち",
      sourceNote: "候補は技のキャンセル可否、発生、旧来用途から生成。10回検証と成立条件の記録が終わるまで、コンボカード・習得ルート・判断ドリルの正解に使用しない。",
      relatedMoves: year4.quadrigaMoveIds || []
    });
    return value;
  });

  document.addEventListener("DOMContentLoaded", () => {
    const notice = document.querySelector("#year4-status");
    if (notice) {
      notice.innerHTML = `<b>YEAR 4 DATA STATUS</b><br>クアドリガ4強度を追加し、コンボ候補${candidates.length}件を検証キューへ登録しました。未実測候補は攻略の正解・ドリル・習得数に含めません。`;
    }
  });
})();
