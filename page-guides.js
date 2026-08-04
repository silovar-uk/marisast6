(() => {
  const guides = {
    "page-home": {
      kicker: "READING GUIDE / HOW THIS LAB WORKS",
      title: "このサイトは、技表ではなく判断の順番を読む。",
      intro: "モダンマリーザは、強い技を知るだけでは安定しません。飛びにはワンボタングラディウス、近距離ではA中確認、端では壁やられ後の追撃というように、状況を見て第一候補を変える必要があります。このホームは、その判断を調べ、理解し、反復するための入口です。",
      articles: [
        {
          label: "01 / FIND",
          title: "困った場面から逆算する",
          body: "試合中の失敗を技名だけで覚えず、距離、画面位置、相手の行動へ分解します。飛びを落とせなかったなら対空、暴れに負けたなら有利と連携、コンボを選べなかったなら判断ドリルへ進みます。",
          href: "situations.html",
          link: "状況から探す"
        },
        {
          label: "02 / UNDERSTAND",
          title: "数字を次の行動へ変える",
          body: "発生、ガード硬直差、ヒット有利は暗記のための数字ではありません。反撃されるか、次の打撃が埋まるか、4F暴れを潰せるかを判断する材料です。特にガード後の攻防は専用ページで段階的に整理します。",
          href: "advantage.html",
          link: "有利と連携を読む"
        },
        {
          label: "03 / PRACTICE",
          title: "一度に一つだけ固定する",
          body: "攻略を全部覚えようとせず、安定ルートを一本、対空を一種類、ガード後の連携を一組という単位で反復します。現在の対空第一候補はワンボタングラディウス。SA2やしゃがみ強は距離と状況で使い分けます。",
          href: "drill.html",
          link: "今日の判断練習へ"
        }
      ]
    },
    "page-situations": {
      kicker: "READING GUIDE / SITUATION FIRST",
      title: "状況カードは、答えを一つに決めるためのものではない。",
      intro: "このページでは、技名を思い出す前に、いま何が起きているかを整理します。中央か端か、相手が飛んだか暴れたか、自分が攻めているか守っているかを先に決めると、候補技を必要な数まで減らせます。",
      articles: [
        {
          label: "01 / FIRST ANSWER",
          title: "最初に試す行動を決める",
          body: "カードの第一候補は、すべての相手に通る唯一解ではありません。迷った時に戻る基準です。たとえば正面の飛びにはワンボタングラディウスを第一候補とし、近い飛びやめくりにはしゃがみ強、空対空、ガードへ切り替えます。"
        },
        {
          label: "02 / CONDITIONS",
          title: "位置と距離を省略しない",
          body: "同じ技でも、密着と先端、中央と画面端では結果が変わります。フレーム上は有利でも次の技が届かないことがあり、コンボも相手の立ち・しゃがみや高度で外れます。カードの注意点まで読んで一組として扱います。",
          href: "advantage.html",
          link: "時間と距離の連携を確認"
        },
        {
          label: "03 / TRAINING",
          title: "相手の反応を三つ録画する",
          body: "トレーニングモードでは、最速4F、投げ抜け、無敵技またはインパクトをランダム再生します。第一候補が何に勝ち、何に負けるかを確認してから、対戦では相手の癖に合わせて二手目を変えます。"
        }
      ]
    },
    "page-moves": {
      kicker: "READING GUIDE / FROM DATA TO ACTION",
      title: "技カードは、数値表ではなく使いどころの説明書。",
      intro: "技カードは、まず『いつ使うか』を読み、そのあと必要な数字だけ確認します。発生は割り込みと確定反撃、ガード硬直差は攻守の継続、ヒット有利はリンクコンボの成立を見るために使います。",
      articles: [
        {
          label: "01 / STARTUP",
          title: "発生は、間に合うかを見る",
          body: "発生4Fは近距離の最速暴れ、発生の遅い強攻撃は大きな隙への反撃や溜め連携に向きます。ただし、数字が速くてもリーチが足りなければ届きません。発生と距離は必ずセットで確認します。"
        },
        {
          label: "02 / BLOCK",
          title: "有利、安全、不利を分ける",
          body: "ガード時がプラスなら先に動けますが、それだけで次の攻撃が連続ガードになるわけではありません。次の技の発生とガードバックを合わせて、完全に埋まる、4F暴れを潰す、相打ち、割り込まれるを分けます。",
          href: "advantage.html",
          link: "有利と埋まるを詳しく読む"
        },
        {
          label: "03 / STATUS",
          title: "確定値と候補を混ぜない",
          body: "Year 4で追加したクアドリガ系など、入力や数値を再計測中の技は候補表示です。旧数値をそのまま現行の正解にせず、ゲーム内フレーム表示と10回の成立確認がそろってから、コンボや判断ドリルへ昇格します。"
        }
      ]
    },
    "page-strategy": {
      kicker: "READING GUIDE / BUILD A MATCH PLAN",
      title: "試合全体を、距離と目的の連続として読む。",
      intro: "実戦攻略は、個別技の強さを並べるページではありません。開幕でどの距離を取り、飛びにどう備え、触った後に何を狙い、端へ運んだ後にどうラウンドを終わらせるかを、一つの流れとして整理します。",
      articles: [
        {
          label: "01 / FOUNDATION",
          title: "まず再現率の高い基準を持つ",
          body: "地上ではN中とグラディウス、対空ではワンボタングラディウス、近距離確認ではA中、守りでは4F暴れとガードを基準にします。基準が決まると、相手の対策に応じて二手目を変えられます。"
        },
        {
          label: "02 / THREE TIERS",
          title: "安定・標準・最大を場面で選ぶ",
          body: "安定は完走率とゲージ温存、標準は火力と起き攻めの両立、最大はパニカン、端、倒し切りなど条件がそろった時の選択です。難しいルートを知っていることより、条件に合う段階を選べることを優先します。"
        },
        {
          label: "03 / PRESSURE",
          title: "触った後は有利と距離を見る",
          body: "溜めグラディウスやファランクスをガードさせた後は、先に動ける時間だけでなく、投げが届くか、次の打撃が埋まるか、相手の無敵技やインパクトに負けるかを確認します。",
          href: "advantage.html",
          link: "ガード後の攻めを組み立てる"
        }
      ]
    },
    "page-drill": {
      kicker: "READING GUIDE / DECISION PRACTICE",
      title: "このドリルは、コンボ入力より選択の癖を直す。",
      intro: "問題では、始動技が当たった後に何でも最大へ伸ばすのではなく、ヒット状況、位置、ドライブゲージ、SA、倒し切りの有無を読みます。正解は最も高いダメージではなく、その場面で目的に合うルートです。",
      articles: [
        {
          label: "01 / CHOOSE",
          title: "安定へ戻る判断も正解になる",
          body: "ゲージが足りない、入力に自信がない、倒し切れない場面では、短く確実なルートが正解です。最大ルートを選び続ける癖は『伸ばしすぎ』として分け、火力不足とは別の問題として振り返ります。"
        },
        {
          label: "02 / DIAGNOSE",
          title: "ミスの種類を区別する",
          body: "基準未定着、伸ばしすぎ、リターン不足、条件違い、時間切れを分けます。同じ不正解でも原因が違えば練習も変わります。ルートを忘れたのか、条件を読めなかったのかを結果画面で確認します。"
        },
        {
          label: "03 / RETURN",
          title: "間違えた理由を別ページで読む",
          body: "状況を読み違えたら状況ページ、技の発生や派生が曖昧なら技ページ、ガード後のターン理解が曖昧なら有利ページへ戻ります。読んだ後は同じ問題だけを再出題し、選択が変わったかを確かめます。",
          href: "advantage.html",
          link: "有利と連携を復習"
        }
      ]
    }
  };

  function addAdvantageNavigation() {
    document.querySelectorAll(".site-tabs").forEach(nav => {
      if (nav.querySelector('a[href="advantage.html"]')) return;
      const link = document.createElement("a");
      link.href = "advantage.html";
      link.textContent = "有利と連携";
      const strategy = nav.querySelector('a[href="strategy.html"]');
      nav.insertBefore(link, strategy || null);
    });
  }

  function setCurrentNavigation() {
    const page = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".site-tabs a").forEach(link => {
      if (link.getAttribute("href") === page) link.setAttribute("aria-current", "page");
      else if (link.getAttribute("aria-current") === "page" && link.getAttribute("href") !== page) link.removeAttribute("aria-current");
    });
  }

  function createGuide(guide) {
    const section = document.createElement("section");
    section.className = "editorial-guide shell";
    section.setAttribute("aria-label", "このページの解説");
    section.innerHTML = `
      <div class="editorial-guide-head">
        <div><p class="page-kicker">${guide.kicker}</p><h2>${guide.title}</h2></div>
        <p class="editorial-guide-intro">${guide.intro}</p>
      </div>
      <div class="editorial-guide-grid">
        ${guide.articles.map(article => `
          <article>
            <small>${article.label}</small>
            <h3>${article.title}</h3>
            <p>${article.body}</p>
            ${article.href ? `<a class="editorial-guide-link" href="${article.href}">${article.link}</a>` : ""}
          </article>
        `).join("")}
      </div>`;
    return section;
  }

  function injectGuide() {
    if (document.querySelector(".editorial-guide")) return;
    const className = Object.keys(guides).find(name => document.body.classList.contains(name));
    const guide = guides[className];
    if (!guide) return;
    const hero = document.querySelector("main > .page-hero, main > .home-hero");
    if (!hero) return;
    hero.insertAdjacentElement("afterend", createGuide(guide));
  }

  function correctModernAntiAirCopy() {
    const gladius = document.querySelector('.first-six-list a[href*="gladiusL"] small');
    if (gladius) gladius.textContent = "ワンボタン対空・牽制";
    const sa2 = document.querySelector('.first-six-list a[href*="sa2"] small');
    if (sa2) sa2.textContent = "補助対空・切り返し";
  }

  function updateFooterVersion() {
    document.querySelectorAll(".site-footer span").forEach(span => {
      span.textContent = span.textContent.replace(/v0\.\d+\.\d+/, "v0.23.0");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    addAdvantageNavigation();
    setCurrentNavigation();
    injectGuide();
    correctModernAntiAirCopy();
    updateFooterVersion();
  });
})();
