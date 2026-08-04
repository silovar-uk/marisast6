(() => {
  const BASIS_DATE = "2026-08-03";
  const SOURCE = {
    id: "year4-ingame-verification",
    label: "2026年8月3日以降 ゲーム内トレーニングモード",
    url: "#year4-status",
    note: "壁やられ高度、入力猶予、ダメージ、相手キャラクター差を最終確認する。"
  };

  const wallBase = {
    phase: "conversion",
    section: "壁インパクト後",
    level: "platinum-master",
    tags: ["インパクト", "壁やられ", "画面端", "Year 4"],
    verification: {
      status: "reference",
      statusLabel: "現役技で再構成",
      gameVersion: BASIS_DATE,
      verifiedAt: null,
      sourceIds: [SOURCE.id],
      note: "ODディマカイルスを使わない現役技だけで再構成。壁やられ高度、ダメージ、入力猶予はトレーニングモードで再計測する。"
    }
  };

  const lowBase = {
    phase: "neutral",
    section: "下段で接近を止められる",
    level: "platinum-master",
    tags: ["中足", "大足", "下段", "接近", "差し返し"],
    verification: {
      status: "principle",
      statusLabel: "立ち回り原則",
      gameVersion: BASIS_DATE,
      verifiedAt: null,
      sourceIds: [SOURCE.id],
      note: "技ごとの硬直差とキャンセル可否は相手キャラクター別に確認する。"
    }
  };

  function pushUnique(list, values) {
    if (!Array.isArray(list)) return;
    values.forEach(value => {
      if (!list.some(item => item?.id === value.id)) list.push(value);
    });
  }

  function addSituations() {
    const data = window.MARISA_SITUATIONS;
    if (!data || !Array.isArray(data.items)) return;

    data.gameVersion = BASIS_DATE;
    data.updatedAt = "2026-08-05";
    data.sources ||= [];
    pushUnique(data.sources, [SOURCE]);

    if (data.filters?.opponent && !data.filters.opponent.some(item => item.id === "low-poke")) {
      data.filters.opponent.push({ id: "low-poke", label: "中足・大足" });
    }

    const wallItems = [
      {
        ...wallBase,
        id: "conversion-wall-impact-normal-save",
        title: "通常壁やられ：ドライブを温存する",
        summary: "相手がバーンアウトしていない通常壁やられ。まずは短い現役ルートを完走し、起き攻めを残す。",
        conditions: { position: "opponent-corner", distance: "throw-out", opponent: "all", trigger: "drive-impact-wall-splat", opponentBurnout: false, ownDrive: "0〜1本" },
        answers: {
          primary: "壁やられ→←＋強→中ファランクス",
          stable: "壁やられの高さを見て←＋強を最速で当てる",
          standard: "中ファランクス締めから前ジャンプまたは端継続",
          maximum: null
        },
        matchup: {
          beats: ["ドライブ消費を抑えたい場面", "コンボを短くして起き攻めを残す判断"],
          losesTo: ["壁やられ高度の見誤り", "入力が遅れて←＋強が届かない場面"],
          caution: "インパクトの当たり方で相手の高さが変わる。技名だけで固定せず、←＋強が届く高さを確認する。"
        },
        result: { onHit: "中ファランクスでダウンを取り、端を維持する", onRead: "ドライブを守りながら次の打撃・投げへ" },
        practice: { setup: "通常ガード壁やられと通常ヒット壁やられを別々に録画", success: "各10回、←＋強→中ファランクスを落とさず完走" },
        nextStep: "安定してからODファランクス使用ルートを追加する。",
        links: { moves: [{ id: "bHP", label: "←＋強" }, { id: "phalanxM", label: "中ファランクス" }] }
      },
      {
        ...wallBase,
        id: "conversion-wall-impact-normal-drive",
        title: "通常壁やられ：ドライブ2本で火力を伸ばす",
        summary: "ドライブに余裕があり、端を維持しながら火力を取る候補。ODファランクスの低い壁やられを利用する。",
        conditions: { position: "opponent-corner", distance: "throw-out", opponent: "all", trigger: "drive-impact-wall-splat", opponentBurnout: false, ownDrive: "2本以上" },
        answers: {
          primary: "壁やられ→←＋強→ODファランクス",
          stable: "ODファランクス後は落下高度を見て追撃を止めてもよい",
          standard: "ODファランクス→→＋強ターゲットコンボ→強派生候補",
          maximum: "SAへつなぐ場合は高度と補正を別途確認"
        },
        matchup: {
          beats: ["端火力を伸ばしたい場面", "ODファランクス後の壁追撃"],
          losesTo: ["ドライブ不足", "追撃高度のずれ", "未確認の入れ込み"],
          caution: "→＋強ターゲットコンボ以降はYear 4再計測候補。成立を確認するまではODファランクスで止めてもよい。"
        },
        result: { onHit: "低い壁やられから追撃し、端を継続", onRead: "ドライブ残量が少なければ温存ルートへ戻す" },
        practice: { setup: "ドライブ2本・3本で開始し、ODファランクス後の高さを記録", success: "10回中10回成立した追撃だけを正解ルートへ昇格" },
        nextStep: "成立高度とダメージを記録し、安定・標準へ分類する。",
        verification: { ...wallBase.verification, status: "candidate", statusLabel: "Year 4要再計測" },
        links: { moves: [{ id: "bHP", label: "←＋強" }, { id: "phalanxOD", label: "ODファランクス" }, { id: "fHK", label: "→＋強ターゲット" }] }
      },
      {
        ...wallBase,
        id: "conversion-wall-impact-sa2",
        title: "通常壁やられ：SA2で倒し切る",
        summary: "SA2を使う価値がある時だけ選ぶ。最大溜め始動とOD技の順序は、壁やられ高度ごとに確認する。",
        conditions: { position: "opponent-corner", distance: "throw-out", opponent: "all", trigger: "drive-impact-wall-splat", opponentBurnout: false, ownDrive: "2本以上", ownSA: "2本以上" },
        answers: {
          primary: "壁やられ→溜め←＋強→ODグラディウス→SA2候補",
          stable: "倒し切れない時はドライブ温存ルートへ戻す",
          standard: "体力・補正・高度を確認してSA2を選ぶ",
          maximum: "リーサル時のみSA2締め"
        },
        matchup: {
          beats: ["SA2で倒し切れる体力", "ラウンドを終えるためのゲージ使用"],
          losesTo: ["高さが合わないSA2", "倒し切れず次ラウンドのSAを失う判断"],
          caution: "旧環境の数値や入力猶予をそのまま使わない。トレモのダメージ表示でリーサルを登録する。"
        },
        result: { onHit: "SA2でラウンドを取る", onRead: "倒し切れなければ位置維持を優先" },
        practice: { setup: "相手体力を複数設定し、壁やられ高度別にSA2成立とダメージを保存", success: "倒し切れる体力帯を3段階で記録" },
        nextStep: "成立確認後、ドリルのリーサル問題へ追加する。",
        verification: { ...wallBase.verification, status: "candidate", statusLabel: "Year 4要再計測" },
        links: { moves: [{ id: "bHP", label: "溜め←＋強" }, { id: "gladiusOD", label: "ODグラディウス" }, { id: "sa2", label: "SA2" }] }
      },
      {
        ...wallBase,
        id: "conversion-wall-impact-burnout-stun",
        title: "相手バーンアウト中：インパクトでスタンした",
        summary: "通常壁やられより時間が長い。ジャンプ攻撃と溜め強攻撃から、現役の高火力ルートへ入る。",
        conditions: { position: "opponent-corner", distance: "throw-in", opponent: "all", trigger: "drive-impact-stun", opponentBurnout: true, ownDrive: "任意" },
        answers: {
          primary: "スタン→J＋A強→溜め←＋強→←＋強→強ディマ→強グラ",
          stable: "J＋A強→A強コンボで確実に完走",
          standard: "溜め←＋強始動から強ディマ→強グラ",
          maximum: "倒し切りなら強グラ→SA3"
        },
        matchup: {
          beats: ["バーンアウト中のスタン", "最大溜めを入れる時間がある場面"],
          losesTo: ["通常壁やられとの取り違え", "スタン解除ぎりぎりまで溜めすぎること"],
          caution: "相手がバーンアウトしていない壁やられでは、ジャンプ始動の時間はない。表示と相手ドライブゲージを先に確認する。"
        },
        result: { onHit: "現役技だけの高火力ルートからSA3または端起き攻め", onRead: "SAを温存する場合は強グラで締める" },
        practice: { setup: "相手をバーンアウトさせ、通常壁やられとスタンを交互に再生", success: "表示を見てジャンプ始動と地上始動を10回中10回選び分ける" },
        nextStep: "通常壁やられとスタンの見分けを先に固定する。",
        links: { moves: [{ id: "jHP", label: "J＋A強" }, { id: "bHP", label: "溜め←＋強" }, { id: "dimachaerusH", label: "強ディマカイルス" }, { id: "gladiusH", label: "強グラディウス" }, { id: "sa3", label: "SA3" }] }
      }
    ];

    const lowItems = [
      {
        ...lowBase,
        id: "neutral-vs-repeated-crmk",
        title: "中足を置かれて、歩いて近づけない",
        summary: "中足の先端外で一度止まり、歩きガードで空振りを作ってから差し返す。",
        conditions: { position: "center", distance: "mid", opponent: "low-poke", trigger: "repeated-crouching-medium-kick" },
        answers: {
          primary: "中足の先端外で停止→空振りへN＋中またはN＋強",
          stable: "半歩進む→しゃがみガードを繰り返す",
          standard: "空振り確認後だけ前進して差し返す",
          maximum: "相手の置く周期を読んだ時だけ中ファランクスで越える"
        },
        matchup: {
          beats: ["同じ間隔の置き中足", "前進へ置かれる下段", "空振り後の長い戻り"],
          losesTo: ["中足を振らず前進する相手", "ファランクス待ちの対空", "キャンセルラッシュからの攻め"],
          caution: "ワンボタングラディウスのアーマーは下段への万能回答ではない。中足へ正面からアーマーで勝とうとしない。"
        },
        result: { onRead: "空振りへN＋中で触るか、N＋強パニカンを狙う", onBlock: "中足キャンセルの有無を見るためガード継続" },
        practice: { setup: "相手に中足、前歩き、前ジャンプをランダム再生", success: "中足の時だけ差し返し、前ジャンプにはワンボタングラディウス" },
        nextStep: "差し返しより先に、先端外で止まれる距離を保存する。",
        links: { moves: [{ id: "stMK", label: "N＋中" }, { id: "stHP", label: "N＋強" }, { id: "phalanxM", label: "中ファランクス" }, { id: "gladiusL", label: "ワンボタングラディウス" }] }
      },
      {
        ...lowBase,
        id: "neutral-vs-sweep",
        title: "大足を繰り返されて、前進を止められる",
        summary: "大足は届かない位置で空振らせるか、ガード後に届く確定反撃を相手別に選ぶ。",
        conditions: { position: "center", distance: "mid", opponent: "low-poke", trigger: "repeated-sweep" },
        answers: {
          primary: "先端外で空振らせる→N＋強または前進N＋中",
          stable: "ガード後の不利幅と距離を技表で確認して確定反撃",
          standard: "同じ周期なら垂直ジャンプも混ぜる",
          maximum: "キャンセル不可と確認できる大足だけ、早めのインパクトを候補にする"
        },
        matchup: {
          beats: ["戻りの長い大足", "同じ間隔で振る大足", "先端管理をせず届かせに来る相手"],
          losesTo: ["大足を振らず待つ相手", "垂直ジャンプへの対空", "インパクトを返せるキャンセル技"],
          caution: "『大足だから必ずこの技で確反』とは決めない。キャラクター、先端ガード、持続当てで届く反撃が変わる。"
        },
        result: { onRead: "空振り差し返しから端へ運ぶ", onBlock: "届く最速技で確反。届かなければ無理に追わない" },
        practice: { setup: "大足を先端・近め・空振りの3距離で録画", success: "ガード確反と空振り差し返しを別々に10回成功" },
        nextStep: "相手キャラクターごとの大足確反を1本だけ登録する。",
        links: { moves: [{ id: "stHP", label: "N＋強" }, { id: "stMK", label: "N＋中" }] }
      },
      {
        ...lowBase,
        id: "neutral-vs-crmk-drive-rush",
        title: "中足からキャンセルラッシュで攻め込まれる",
        summary: "近づく途中で無理に技を押さず、中足をガードして相手にドライブを使わせ、ラッシュ後の打撃・投げを守る。",
        conditions: { position: "center", distance: "mid", opponent: "low-poke", trigger: "crouching-medium-kick-drive-rush" },
        answers: {
          primary: "歩きガード→中足ガード→ラッシュを見たらガード継続",
          stable: "投げと打撃を一度見てから遅らせ行動",
          standard: "ラッシュを使わせた後、次の中足の先端外へ戻る",
          maximum: "明確な隙だけ4F暴れまたはSAで切り返す"
        },
        matchup: {
          beats: ["中足ラッシュへの焦った暴れ", "接近したい気持ちからの前入れっぱなし", "根拠のないインパクト"],
          losesTo: ["投げを読み切れない受け身", "ガードし続けるだけで端へ運ばれること"],
          caution: "中足がキャンセル可能な相手へ、見てからでないインパクトを繰り返さない。キャンセルインパクトやラッシュで返される。"
        },
        result: { onBlock: "まず一連の攻めを受け、連携が切れた位置から中距離へ戻す", onRead: "相手のドライブ消費を確認して次の接近を作る" },
        practice: { setup: "中足→ラッシュ打撃、中足→ラッシュ投げ、中足止めをランダム再生", success: "初手を暴れず、3択の後にだけ自分の行動を始める" },
        nextStep: "中足そのものより、キャンセル後の一手をキャラクター別に登録する。",
        links: { moves: [{ id: "crLP", label: "↓＋弱" }, { id: "sa2", label: "SA2" }] }
      }
    ];

    pushUnique(data.items, [...wallItems, ...lowItems]);
  }

  function addPlaybook() {
    const data = window.MARISA_PLAYBOOK;
    if (!data || !Array.isArray(data.cards)) return;

    const cards = [
      {
        id: "year4-wall-impact-decision",
        category: "combo",
        type: "comparison",
        number: "Y4-01",
        title: "壁インパクト後は、まず状態を見分ける",
        lead: "通常壁やられとバーンアウト中のスタンでは、使える時間も始動も違う。",
        left: {
          label: "通常壁やられ",
          title: "地上からすぐ拾う",
          points: ["ドライブ温存：←＋強→中ファランクス", "2本以上：←＋強→ODファランクス候補", "SA2は倒し切りと高度を確認"]
        },
        right: {
          label: "バーンアウト中のスタン",
          title: "ジャンプ攻撃と溜めから最大へ",
          points: ["J＋A強から開始", "溜め←＋強を入れる", "強ディマ→強グラ→必要ならSA3"]
        },
        judgment: "相手ドライブゲージとSTUN表示を確認してから、ジャンプ始動か地上始動かを決める。",
        filters: ["corner", "verify"],
        status: "memo",
        statusLabel: "Year 4整理",
        relatedMoves: ["bHP", "phalanxM", "phalanxOD", "gladiusOD", "sa2", "sa3"]
      },
      {
        id: "year4-low-poke-approach",
        category: "neutral",
        type: "priority",
        number: "Y4-02",
        title: "中足・大足で止められる時の優先順位",
        lead: "下段へ技をぶつけるのではなく、空振りを作ってから近づく。",
        priority: [
          { rank: 1, title: "先端外で止まる", text: "相手の中足・大足が届かない距離を先に作る" },
          { rank: 2, title: "半歩だけ歩いてガード", text: "前入れっぱなしをやめ、空振りとキャンセルを確認する" },
          { rank: 3, title: "空振りへ差し返す", text: "N＋中、N＋強。届かないなら追わない" },
          { rank: 4, title: "周期を読んで中ファランクス", text: "低い攻撃を越える候補。対空待ちには負ける" },
          { rank: 5, title: "インパクトは限定する", text: "キャンセル不可の大足など、相手技を確認できる時だけ" }
        ],
        warning: "グラディウスのアーマーは下段への万能回答ではない。『近づけないから大技』をやめ、停止とガードを接近の一部にする。",
        status: "principle",
        statusLabel: "立ち回り原則",
        relatedMoves: ["stMK", "stHP", "phalanxM", "gladiusL"]
      },
      {
        id: "year4-low-poke-lab",
        category: "practice",
        type: "practice",
        number: "Y4-03",
        title: "下段を擦る相手への15分練習",
        lead: "中足、大足、前ジャンプを混ぜ、押し返すのではなく見分ける。",
        tasks: [
          { time: "5分", title: "先端外を保存", text: "中足と大足が空振る位置を床の目印で記録" },
          { time: "5分", title: "空振り差し返し", text: "中足へN＋中、大足へN＋強。届かない時は何もしない" },
          { time: "5分", title: "飛びを混ぜる", text: "前ジャンプだけワンボタングラディウスで落とす" }
        ],
        checklist: ["前入れっぱなしをやめた", "下段へグラディウスを入れ込まない", "中ファランクスを毎回使わない", "大足のガード確反を相手別に確認"],
        status: "practice",
        statusLabel: "練習メニュー",
        relatedMoves: ["stMK", "stHP", "phalanxM", "gladiusL"]
      }
    ];

    pushUnique(data.cards, cards);
  }

  function install() {
    addSituations();
    addPlaybook();
  }

  if (typeof document === "undefined") return;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
