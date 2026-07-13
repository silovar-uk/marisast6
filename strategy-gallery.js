(() => {
  const section = document.querySelector("#strategy-gallery");
  if (!section) return;

  const navLink = document.querySelector('a[href="#strategy-gallery"]');
  if (navLink) navLink.textContent = "初心者チャート";

  document.querySelector("#strategy-dialog")?.remove();

  section.className = "beginner-flow-section";
  section.innerHTML = `
    <div class="shell">
      <details class="beginner-guide" open>
        <summary class="beginner-guide-summary">
          <div>
            <p class="eyebrow">BEGINNER ROUTE</p>
            <h2>初心者実戦チャート</h2>
            <p>何が当たったか、ガードされたか、画面端か。試合中の状況から次の行動をたどる。</p>
          </div>
          <span class="beginner-guide-toggle">開閉<i>＋</i></span>
        </summary>

        <div class="beginner-guide-body">
          <div class="beginner-alert">
            <b>最初の考え方</b>
            <span>遠距離では無理に技を振らず、<strong>A＋中が届く距離</strong>まで歩く。触れたら、ヒットかガードかを見て分岐する。</span>
          </div>

          <section class="flow-block flow-block-main" aria-labelledby="flow-neutral-title">
            <header>
              <span>01</span>
              <div><p>NEUTRAL</p><h3 id="flow-neutral-title">試合開始から触るまで</h3></div>
            </header>
            <ol class="route-line route-line-four">
              <li><small>遠距離</small><b>無理に振らない</b><span>歩き・パリィ前進</span></li>
              <li><small>中距離</small><b>A＋中の間合いへ</b><span>相手の前歩きも止める</span></li>
              <li><small>接触</small><b>A＋中</b><span>まず1段目を見る</span></li>
              <li class="route-decision"><small>確認</small><b>当たった？</b><span>YES／NOへ分岐</span></li>
            </ol>
            <div class="route-subnote"><b>弱飛び・ラッシュから触る時</b><span>弱アシストコンボを使う。無敵技を読むなら完走せず、途中止めからガード・後退で空振らせる。</span></div>
          </section>

          <section class="flow-block" aria-labelledby="flow-amp-title">
            <header>
              <span>02</span>
              <div><p>HIT OR BLOCK</p><h3 id="flow-amp-title">A＋中からの分岐</h3></div>
            </header>
            <div class="branch-origin">
              <b>A＋中 → A＋中</b>
              <span>2段目はヒット確認推奨。ガード時は-8Fなので、固定連携ではなく相手の行動を読む場面。</span>
            </div>
            <div class="branch-grid">
              <article class="branch-card branch-hit">
                <p><i>YES</i> ヒットした</p>
                <ol class="route-stack">
                  <li><b>ODディマカイルス</b><span>A＋←＋SP</span></li>
                  <li><b>2段目派生</b><span>→＋攻撃</span></li>
                  <li><b>ラッシュ → ←＋強</b><span>引き大／マグナバンカー</span></li>
                  <li class="route-finish"><b>締めを選ぶ</b><span>ODファランクス／ODグラディウス／SA3</span></li>
                </ol>
              </article>
              <article class="branch-card branch-block">
                <p><i>NO</i> ガードされた</p>
                <div class="read-grid">
                  <div><small>上段・中段・インパクト読み</small><b>最大溜めグラディウス</b><span>インパクトも受けて返す狙い</span></div>
                  <div><small>下段技読み</small><b>溜めなしグラディウス</b><span>発生で先に触る。下段アーマーではない点に注意</span></div>
                  <div><small>読み切れない</small><b>ガード・後退</b><span>無理にグラディウスを入れ込まない</span></div>
                </div>
              </article>
            </div>
          </section>

          <section class="flow-block" aria-labelledby="flow-trigger-title">
            <header>
              <span>03</span>
              <div><p>CONVERSION</p><h3 id="flow-trigger-title">当たった技から覚えるルート</h3></div>
            </header>
            <div class="combo-route-grid">
              <article class="combo-route-card">
                <div class="combo-route-title"><span>コマ投げ</span><b>中央の基本ルート</b></div>
                <ol class="combo-steps">
                  <li>ラッシュ N＋中</li><li>←＋強</li><li>強ディマ → 2段目</li><li>ラッシュ ←＋強</li><li>締め</li>
                </ol>
                <p class="route-check">原メモの「強ファラ→派生」は、派生のある強ディマの可能性が高いため表記を補正。トレモで確認。</p>
              </article>

              <article class="combo-route-card">
                <div class="combo-route-title"><span>インパクト</span><b>中央の高火力ルート</b></div>
                <ol class="combo-steps">
                  <li>長押し ←＋強</li><li>←＋強</li><li>強ディマ → 2段目</li><li>ラッシュ ←＋強</li><li>締め</li>
                </ol>
                <p>壁が近い時は、ラッシュ追撃ではなく<strong>長押し←＋強 → 強グラディウス</strong>を候補にする。</p>
              </article>

              <article class="combo-route-card combo-route-wall">
                <div class="combo-route-title"><span>壁ドン</span><b>膝から択を作る</b></div>
                <ol class="combo-steps">
                  <li>膝（→＋強）</li><li>ODファランクス</li><li class="combo-choice">エンフォルド</li><li class="combo-choice">または SA3</li>
                </ol>
                <p class="route-check">ODファランクス後の距離・壁やられ状態で成立条件が変わるため、相手位置ごとにトレモ確認。</p>
              </article>
            </div>
          </section>

          <section class="flow-block" aria-labelledby="flow-memory-title">
            <header>
              <span>04</span>
              <div><p>ONE ROUND LOOP</p><h3 id="flow-memory-title">対戦中はこの順番だけ考える</h3></div>
            </header>
            <ol class="route-line route-line-five">
              <li><small>1</small><b>A＋中の距離へ寄る</b></li>
              <li><small>2</small><b>触ってヒット確認</b></li>
              <li><small>3</small><b>当たればコンボ</b></li>
              <li><small>4</small><b>ガードなら相手を見る</b></li>
              <li><small>5</small><b>ダウン後に起き攻め</b></li>
            </ol>
            <div class="notation-strip">
              <span><b>引き大</b>＝←＋強</span>
              <span><b>膝</b>＝→＋強／A＋強</span>
              <span><b>中K</b>＝N＋中</span>
              <span><b>派生</b>＝ディマ2段目</span>
            </div>
          </section>

          <p class="beginner-guide-note">※コンボは距離、カウンター、補正、画面位置、操作入力で変化します。実戦投入前にトレーニングモードで成立を確認してください。</p>
        </div>
      </details>
    </div>`;
})();