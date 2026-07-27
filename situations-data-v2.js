(() => {
  const SOURCE = {
    id: "sukoreru-modern-marisa",
    label: "すこれるブログ｜モダンマリーザ 立ち回り・コンボ・起き攻め",
    url: "https://www.sukoreru.com/sf6-modern-marisa"
  };

  const base = {
    phase: "okizeme",
    section: "弱ディマ後",
    level: "platinum-master",
    tags: ["弱ディマ", "中央起き攻め", "最優先"],
    verification: {
      status: "reference",
      statusLabel: "参考整理",
      gameVersion: "2026-03-17",
      verifiedAt: null,
      sourceIds: [SOURCE.id],
      note: "攻略資料から整理。距離・入力タイミング・キャラクター差はトレーニングモードで最終確認。"
    }
  };

  const item = value => ({ ...base, ...value });

  window.MARISA_SITUATIONS = {
    schemaVersion: 2,
    gameVersion: "2026-03-17",
    updatedAt: "2026-07-27",
    note: "新形式の状況カードは、第一候補だけでなく、相手の対応・負ける行動・練習方法まで記録する。未検証情報は参考整理として表示する。",
    categories: [
      { id: "neutral", label: "立ち回る", eyebrow: "NEUTRAL", description: "開幕、距離管理、弾や牽制への回答。" },
      { id: "pressure", label: "攻める", eyebrow: "PRESSURE", description: "近距離で触った後、投げ間合いと相手の防御を読む。" },
      { id: "okizeme", label: "起き攻め", eyebrow: "OKIZEME", description: "ダウンを取った技、中央・端、到着距離から次の一手を決める。" },
      { id: "defense", label: "守る", eyebrow: "DEFENSE", description: "起き上がり、画面端、対空と切り返し。" },
      { id: "conversion", label: "コンボを選ぶ", eyebrow: "CONVERSION", description: "始動、ゲージ、画面位置から安定・標準・最大を選ぶ。" }
    ],
    filters: {
      position: [
        { id: "all", label: "位置すべて" },
        { id: "center", label: "中央" },
        { id: "opponent-corner", label: "相手が端" },
        { id: "own-corner", label: "自分が端" }
      ],
      distance: [
        { id: "all", label: "距離すべて" },
        { id: "far", label: "遠距離" },
        { id: "mid", label: "中距離" },
        { id: "throw-out", label: "投げ間合い外" },
        { id: "throw-in", label: "投げ間合い内" }
      ],
      opponent: [
        { id: "all", label: "相手行動すべて" },
        { id: "mash", label: "暴れ" },
        { id: "block", label: "ガード" },
        { id: "tech", label: "投げ抜け" },
        { id: "jump", label: "ジャンプ" },
        { id: "reversal", label: "無敵技" },
        { id: "parry", label: "パリィ" }
      ]
    },
    sources: [SOURCE],
    items: [
      item({
        id: "oki-light-dima-center-overview",
        title: "中央・弱ディマ後：まず回す三択",
        summary: "ラッシュで接近し、打撃・エンフォルド・ガードを相手の防御に合わせて回す。",
        conditions: { position: "center", distance: "throw-in", opponent: "all", originMove: "dimachaerusL", ownDrive: "1本以上" },
        answers: {
          primary: "最速ラッシュ→溜めN＋強",
          stable: "ラッシュ→N＋中",
          standard: "打撃／エンフォルド／ガードの三択",
          maximum: "ヒット確認→←＋強始動の高火力ルート"
        },
        matchup: {
          beats: ["4F暴れ", "後ろ歩き"],
          losesTo: ["無敵技", "ジャストパリィ"],
          caution: "毎回同じ溜め打撃にすると、無敵技やパリィを合わせられる。"
        },
        result: { onHit: "←＋強から標準コンボ", onBlock: "有利を使って投げ・シミーへ", onRead: "無敵技を読む時はラッシュ後にガード" },
        practice: { setup: "相手の起き上がりを4F暴れ・ガード・無敵技でランダム再生", success: "10回中8回、相手の行動に合わせて択を切り替える" },
        nextStep: "弱ディマ後の三択を固定してから、投げ抜け狩りを追加する。",
        links: {
          moves: [
            { id: "dimachaerusL", label: "弱ディマカイルス" },
            { id: "stHP", label: "N＋強" },
            { id: "stMK", label: "N＋中" },
            { id: "enfold", label: "エンフォルド" }
          ],
          strategyCards: [{ category: "oki", id: "oki-center-light-dima", label: "弱ディマ後：生ラッシュ四択" }]
        }
      }),
      item({
        id: "oki-light-dima-vs-mash",
        title: "弱ディマ後、相手が4Fで暴れる",
        summary: "投げを急がず、まず打撃重ねで暴れを止める。",
        conditions: { position: "center", distance: "throw-in", opponent: "mash", originMove: "dimachaerusL", ownDrive: "1本以上" },
        answers: { primary: "最速ラッシュ→溜めN＋強", stable: "ラッシュ→N＋中", standard: "打撃を2回見せてからエンフォルド", maximum: "パニカン確認から←＋強始動" },
        matchup: { beats: ["4F暴れ", "後ろ歩き"], losesTo: ["無敵技", "ジャストパリィ"], caution: "暴れを止める前に投げへ行くと、最速打撃に負ける。" },
        result: { onHit: "←＋強へつないでダウンを取り直す", onBlock: "次の暴れを警戒しながら投げを混ぜる" },
        practice: { setup: "起き上がり4F暴れを固定し、打撃重ねを10回", success: "相打ちを含めず8回以上勝つ" },
        nextStep: "暴れが減ったら『ガードを固める相手』へ移る。",
        links: { strategyCards: [{ category: "oki", id: "oki-center-light-dima", label: "弱ディマ後：生ラッシュ四択" }] }
      }),
      item({
        id: "oki-light-dima-vs-block",
        title: "弱ディマ後、相手がガードを固める",
        summary: "打撃で固めた後、エンフォルドか通常投げでガードを崩す。",
        conditions: { position: "center", distance: "throw-in", opponent: "block", originMove: "dimachaerusL", ownDrive: "1本以上" },
        answers: { primary: "ラッシュ→エンフォルド", stable: "ラッシュ→N＋中→通常投げ", standard: "打撃と投げを1回ずつ見せる", maximum: "投げ抜けを読んだ次のシミー" },
        matchup: { beats: ["立ちガード", "しゃがみガード", "パリィ待ち"], losesTo: ["前ジャンプ", "最速暴れ"], caution: "初手から毎回エンフォルドにすると、ジャンプと暴れの両方を呼ぶ。" },
        result: { onHit: "再びダウンを取って同じ読み合いへ", onBlock: "打撃ガード後の有利から通常投げを混ぜる" },
        practice: { setup: "ガード・4F暴れ・前ジャンプをランダム再生", success: "投げだけに偏らず3択を選ぶ" },
        nextStep: "投げ抜けが増えたらシミーへ移行する。",
        links: { moves: [{ id: "enfold", label: "エンフォルド" }], strategyCards: [{ category: "oki", id: "oki-center-light-dima", label: "弱ディマ後：生ラッシュ四択" }] }
      }),
      item({
        id: "oki-light-dima-vs-reversal",
        title: "弱ディマ後、相手が無敵技を振る",
        summary: "重ね続けず、ラッシュ後に止まってガードする。",
        conditions: { position: "center", distance: "throw-in", opponent: "reversal", originMove: "dimachaerusL", ownDrive: "1本以上" },
        answers: { primary: "ラッシュ→ガード", stable: "一度起き攻めを遅らせて様子を見る", standard: "打撃2回に対してガード1回を混ぜる", maximum: "無敵技ガード→溜めN＋強パニカン始動" },
        matchup: { beats: ["OD無敵技", "SA切り返し"], losesTo: ["何もしないガード", "通常投げ"], caution: "ガードを見せすぎると、相手に安全な起き上がりを渡す。" },
        result: { onRead: "大きな確定反撃から標準または最大コンボ", onBlock: "相手が何もしなければ次回から打撃へ戻す" },
        practice: { setup: "無敵技・ガードをランダム再生し、確定反撃まで練習", success: "無敵技ガード後の始動を10回中8回成功" },
        nextStep: "確定反撃を『安定・標準・最大』の3本に固定する。",
        links: { strategyCards: [{ category: "combo", id: "punish-heavy-lethal", label: "大きな確定反撃のリーサル候補" }] }
      }),
      item({
        id: "oki-light-dima-vs-tech",
        title: "弱ディマ後、相手が投げ抜けする",
        summary: "投げ間合いへ入った後に少し下がり、投げ抜けの空振りを←＋強で取る。",
        conditions: { position: "center", distance: "throw-in", opponent: "tech", originMove: "dimachaerusL", ownDrive: "1本以上" },
        answers: { primary: "ラッシュ接近→少し下がる→←＋強", stable: "ラッシュ→ガードで投げ抜けの癖を見る", standard: "通常投げとシミーを交互に見せる", maximum: "←＋強パニカン→高火力ルート" },
        matchup: { beats: ["最速投げ抜け", "遅らせ投げ抜け"], losesTo: ["遅らせ打撃", "前歩き打撃"], caution: "下がりすぎると←＋強が届かず、相手へターンを返す。" },
        result: { onHit: "←＋強パニカンからコンボ", onRead: "投げ抜けが減れば通常投げへ戻す" },
        practice: { setup: "投げ抜け・遅らせ打撃をランダム再生", success: "投げ抜けだけを確認して←＋強を当てる" },
        nextStep: "シミー成功時の標準コンボを一本に固定する。",
        links: { strategyCards: [{ category: "combo", id: "shimmy-back-heavy", label: "←＋強パニカンの安定回収" }] }
      }),
      item({
        id: "oki-light-dima-low-drive",
        title: "弱ディマ後、ドライブを温存したい",
        summary: "無理にラッシュせず、位置を維持して次の中距離戦へ戻る。",
        conditions: { position: "center", distance: "throw-out", opponent: "all", originMove: "dimachaerusL", ownDrive: "少ない" },
        answers: { primary: "前歩き→N＋中の距離で停止", stable: "その場でゲージ回復を優先", standard: "相手の前進へN＋中か弱グラ", maximum: null },
        matchup: { beats: ["焦った前歩き", "その場の様子見"], losesTo: ["遠距離技", "前ジャンプ"], caution: "ゲージが少ない時に毎回ラッシュすると、次の守りが弱くなる。" },
        result: { onRead: "中距離の主戦場へ戻す" },
        practice: { setup: "ドライブ2本以下から弱ディマで締め、ラッシュしない展開を練習", success: "ゲージを回復しながら対空と前進を監視する" },
        nextStep: "起き攻めを捨てる判断も、正解として持つ。",
        links: { strategyCards: [{ category: "neutral", id: "medium-range-loop", label: "中距離は、半歩と停止で作る" }] }
      }),
      item({
        id: "oki-light-dima-corner",
        title: "画面端・弱ディマ後：フレーム消費で重ねる",
        summary: "端では感覚で走らず、↓＋弱空振りから溜め←＋強を重ねる。",
        conditions: { position: "opponent-corner", distance: "throw-in", opponent: "all", originMove: "dimachaerusL", ownDrive: "不問" },
        answers: { primary: "↓＋弱空振り→溜め←＋強", stable: "溜めを短くして←＋強", standard: "打撃重ね／通常投げ／無敵技待ち", maximum: "ヒット確認→端の高火力ルート" },
        matchup: { beats: ["4F暴れ", "後ろ歩き"], losesTo: ["無敵技", "ジャストパリィ"], caution: "中央用のラッシュ起き攻めと入力を混同しない。" },
        result: { onHit: "←＋強へつないで端を維持", onBlock: "有利から再度打撃と投げ" },
        practice: { setup: "画面端で弱ディマ締め→↓＋弱空振り→溜め←＋強を反復", success: "4F暴れへ10回中8回以上勝つ" },
        nextStep: "端の無敵技待ちとジャンプ逃げ狩りを追加する。",
        tags: ["弱ディマ", "画面端", "フレーム消費", "最優先"],
        links: { strategyCards: [{ category: "oki", id: "oki-corner-light-dima", label: "端・弱ディマ後の基本重ね" }] }
      }),
      item({
        id: "oki-light-dima-training",
        title: "弱ディマ後をトレモで覚える",
        summary: "技を一つずつ練習せず、相手の起き上がり行動をランダム再生して判断まで反復する。",
        conditions: { position: ["center", "opponent-corner"], distance: ["throw-in", "throw-out"], opponent: "all", originMove: "dimachaerusL", ownDrive: "不問" },
        answers: { primary: "4F暴れ・ガード・無敵技の3再生から始める", stable: "最初は打撃とガードだけで対応", standard: "投げ・投げ抜け・前ジャンプを追加", maximum: "中央と端をランダムに切り替える" },
        matchup: { beats: ["決め打ち", "起き攻めの入力迷い"], losesTo: ["一つの行動だけを固定した練習"], caution: "成功条件を『技が出た』ではなく『相手に合わせて選べた』にする。" },
        practice: { setup: "録画1＝4F暴れ、2＝ガード、3＝無敵技。慣れたら投げ抜けとジャンプを追加", success: "20回中16回、相手の行動に対応する" },
        nextStep: "失敗した相手行動だけを、次の10回で重点練習する。",
        tags: ["弱ディマ", "トレモ", "判断練習", "最優先"],
        links: { strategyCards: [{ category: "practice", id: "distance-lab", label: "実戦攻略の練習カードを見る" }] }
      })
    ]
  };
})();
