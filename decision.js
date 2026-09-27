(() => {
'use strict';
const D=window.MARISA_DECISIONS, KEY='marisa-decision-notebook-v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ids=new Set(D.situations.map(s=>s.id));
const outcomes={noticed:'気づいたが選べなかった',missed:'気づけなかった',input:'選べたが入力・タイミングで失敗',acted:'選んで実行できた',waited:'条件を見て見送れた',no:'機会なし',unknown:'機会は不明'};
let state={version:1,plans:{},history:[]}, undo=null, category='暴れ', selected='gap-light', query='', recall=false, revealed=new Set(), dialogId=null, reviewId=null, timer=null,toastTimer=null,storageBlocked=false;
function validState(value){
 if(!value||value.version!==1||!value.plans||typeof value.plans!=='object'||Array.isArray(value.plans)||!Array.isArray(value.history)||value.history.length>5000)throw Error('形式が違います');
 const clean={version:1,plans:{},history:[]};
 for(const [id,p] of Object.entries(value.plans)){
  if(!ids.has(id))throw Error('未対応の判断が含まれています');
  if(!p||!['active','reserve','rest'].includes(p.status)||!['explain','aware','natural'].includes(p.level))throw Error('学習状態が不正です');
  if(!['cue','skip','watch'].every(k=>typeof p[k]==='string'&&p[k].trim()&&p[k].length<=400))throw Error('判断の文章を確認してください');
  clean.plans[id]={cue:p.cue,skip:p.skip,watch:p.watch,status:p.status,level:p.level};
 }
 for(const h of value.history){
  if(!h||!ids.has(h.id)||!Object.hasOwn(outcomes,h.outcome)||!['yes','no','unknown'].includes(h.opportunity)||typeof h.note!=='string'||h.note.length>500||typeof h.date!=='string'||Number.isNaN(Date.parse(h.date)))throw Error('振り返りの形式が不正です');
  clean.history.push({id:h.id,outcome:h.outcome,opportunity:h.opportunity,note:h.note,date:h.date});
 }
 return clean;
}
function storageError(message){$('storage-error').hidden=false;$('storage-error').textContent=message;$('save-status').textContent='保存できていません';}
try{const raw=localStorage.getItem(KEY);if(raw)state=validState(JSON.parse(raw));}catch(e){storageBlocked=true;storageError('保存済み記録を読めません。元の記録は上書きしません。書き出して保管してください。');}
function save(next, message='このブラウザに保存しました'){
 if(storageBlocked){storageError('元の記録を保護するため保存を止めています。書き出した記録の内容を確認してください。');return false;}
 try{localStorage.setItem(KEY,JSON.stringify(next));state=next;$('storage-error').hidden=true;$('save-status').textContent='このブラウザに保存済み';if(message)toast(message);return true;}catch(e){storageError('ブラウザに保存できませんでした。空き容量や保存の許可を確認してください。変更前の記録を保持しています。');return false;}
}
function mutate(fn,message){const next=structuredClone(state);fn(next);return save(next,message);}
function toast(message,canUndo=false){clearTimeout(toastTimer);$('toast').innerHTML=esc(message)+(canUndo?' <button id="undo">元に戻す</button>':'');$('toast').hidden=false;if(canUndo)$('undo').onclick=()=>{if(undo&&save(undo,'元に戻しました')){undo=null;renderPlans();renderDetail();}};toastTimer=setTimeout(()=>{$('toast').hidden=true;},canUndo?12000:4200);}
function total(m){return m.frames?m.frames[0]-1+m.frames[1]+m.frames[2]:null;}
function band(m, interactive=false){
 if(!m.frames)return `<p class="muted">${m.alias==='SA2'?'着地・接触状況で長さが変わるため、固定の時間の帯は表示しません。':'参照資料の数値に不整合があるため、時間の帯は再確認待ちです。'}</p>`;
 const [s,a,r]=m.frames,n=total(m);return `<div class="time-track" role="img" aria-label="攻撃前${s-1}フレーム、持続${a}フレーム、後隙${r}フレーム。${n+1}フレーム目から再行動"><span class="startup" style="width:${(s-1)/.6}%"></span><span class="active" style="width:${a/.6}%"></span><span class="recovery" style="width:${r/.6}%"></span><i class="ready-marker" style="left:${n/.6}%"></i>${interactive?'<i id="frame-cursor" class="time-cursor" style="left:0"></i>':''}</div>`;
}
const legend='<div class="legend"><span><i class="startup"></i>攻撃前</span><span><i class="active"></i>持続</span><span><i class="recovery"></i>後隙</span><span>│ 再行動</span></div>';
function current(){return D.situations.find(s=>s.id===selected);}
function renderCategories(){ $('categories').innerHTML=D.categories.map(([name,description])=>`<button data-category="${name}" aria-pressed="${category===name&&!query}"><b>${name}</b><span>${description}</span></button>`).join('');}
function renderSituations(){
 const list=D.situations.filter(s=>query?`${s.title} ${s.category} ${s.cue} ${D.moves[s.move].name} ${D.moves[s.move].alias} ${D.moves[s.move].input}`.includes(query):s.category===category);
 $('category-description').textContent=query?`検索結果 ${list.length}件`:`${category} / ${D.categories.find(c=>c[0]===category)[1]}`;
 $('situations').innerHTML=list.length?list.map(s=>`<button class="situation" data-situation="${s.id}" aria-pressed="${selected===s.id}"><b>${esc(s.title)}</b><small>${recall&&!revealed.has(s.id)?'どの技を選ぶ？':`${esc(D.moves[s.move].input)} · ${esc(D.moves[s.move].alias)}`}</small></button>`).join(''):'<p class="muted">見つかりませんでした。技名や「対空」などで探してください。</p>';
 if(list.length&&!list.some(s=>s.id===selected)){selected=list[0].id;renderSituations();return;}
 if(!list.length){$('detail').innerHTML='<p>検索語を減らすか、用途を選び直してください。</p>';stopAnimation();return;}renderDetail();
}
function renderDetail(){
 stopAnimation();const s=current();if(!s)return;const m=D.moves[s.move],p=state.plans[s.id],hidden=recall&&!revealed.has(s.id);
 if(hidden){$('detail').innerHTML=`<span class="eyebrow">RECALL</span><h3 class="role-title">${esc(s.title)}</h3><p>${esc(s.cue)}</p><p class="muted" style="margin-top:16px">使う技と、見送る条件を頭の中で考えてみてください。</p><button class="primary" data-action="reveal" style="margin-top:20px">判断の例を見る</button>`;return;}
 const compact=p&&p.level!=='explain';
 const tags=m.cancel===null?'<span class="tag">接続先を再確認中</span>':m.cancel.length?m.cancel.map(c=>`<span class="tag yes">${c}</span>`).join(''):'<span class="tag">キャンセル不可</span>';
 $('detail').innerHTML=`<div class="sectionline"><span class="eyebrow">${esc(s.category)} / DECISION</span><span class="muted">${p?{explain:'説明を確認したい',aware:'意識すれば選べる',natural:'自然に選べる'}[p.level]:'未登録'}</span></div><h3 class="role-title">${esc(s.title)}</h3><div class="move-heading"><div><b>${esc(m.name)}</b><small>${esc(m.alias)}</small></div><kbd>${esc(m.input)}</kbd></div><dl class="conditions"><div><dt>この合図で使う</dt><dd>${esc(p?.cue||s.cue)}</dd></div><div><dt>このときは見送る</dt><dd>${esc(p?.skip||s.skip)}</dd></div></dl><div class="time-preview">${band(m)}${m.frames?legend:''}</div><p class="cancel-title">硬直キャンセル・専用派生</p><div class="cancel-tags">${tags}</div><div class="actions"><button class="primary" data-action="plan">${p?'今回の判断を編集':'次の対戦で意識する'}</button><a class="textbutton" href="moves.html?q=${encodeURIComponent(m.name)}">技の資料へ ↗</a></div><details ${compact?'':'open'}><summary>なぜ、この場面に向くのか</summary><p>${esc(s.why)}</p><div class="reason-grid"><div><h3>練習で確かめる</h3><p>${esc(s.practice)}</p></div><div><h3>条件が違ったら</h3><p>${esc(s.alternative)}</p></div></div></details><details id="time-details"><summary>時間とキャンセルを確かめる</summary><p>${esc(m.note)}</p>${frameDetail(m)}<h3 class="cancel-title">接続先と成立条件</h3><p>${esc(m.condition)}</p><div class="branch">${m.cancel===null?'接続先は再確認中':m.cancel.length?`接続が成立 → ${esc(m.cancel.join(' ／ '))} の動作へ移る`:'出し切る → 再行動可能になるまで待つ'}</div><p class="fine">受付区間の開始・終了フレームは未確認です。帯の持続全体がキャンセル受付時間という意味ではありません。キャンセル可能でも、次の技が連続ヒットするとは限りません。専用派生は空振りでも出る場合があり、一般の接触キャンセルとは別に確認します。</p><p class="fine">参照値／現行ゲーム内未実測 · 2026-09-27参照<br><a href="${D.sources[1].url}" target="_blank" rel="noopener">数値・キャンセル区分の出典 ↗</a> · <a href="controls.html">モダン入力の資料 ↗</a></p></details>`;
 if(m.frames){$('frame-range').oninput=()=>{stopAnimation();updateFrame(m,Number($('frame-range').value));};$('play-time').onclick=()=>playAnimation(m);$('contact').onchange=()=>updateContact(m);$('compare').onchange=()=>renderComparison(m);updateContact(m);}
}
function frameDetail(m){
 if(!m.frames)return '<p class="muted">固定の帯で誤解を生まないよう、時間は状況別にゲーム内で確認します。</p>';
 const [s,a,r]=m.frames,n=total(m);
 return `<dl class="frame-values"><div><dt>発生</dt><dd>${s}F</dd></div><div><dt>持続</dt><dd>${a}F</dd></div><div><dt>後隙</dt><dd>${r}F</dd></div><div><dt>全体</dt><dd>${n}F</dd></div><div><dt>ヒット差</dt><dd>${esc(m.hit)}</dd></div><div><dt>ガード差</dt><dd>${m.block===null?'—':(m.block>0?'+':'')+m.block+'F'}</dd></div></dl><p class="fine">溜め・派生は上の技名の条件に固定。発生${s}Fは「${s}F目に攻撃開始」の意味です。攻撃前は${s-1}F。帯は停止時間を除いた出し切りの参照モデルです。</p><div class="time-head"><span>入力</span><span>共通尺度：右端60F</span></div>${band(m,true)}${legend}<label class="sr-only" for="frame-range">時間を動かす</label><input class="range" id="frame-range" type="range" min="1" max="${n+1}" value="1"><output id="frame-output" class="frame-output">1F · 攻撃前</output><div class="frame-controls"><button id="play-time">ゆっくり再生</button><label>接触条件 <select id="contact"><option value="whiff">空振り</option>${m.block===null?'':'<option value="block">ガード</option>'}<option value="hit">ヒット</option></select></label></div><p id="contact-note"></p><label class="muted" for="compare">同じ尺度で比較</label><select id="compare"><option value="">比較する技を選ぶ</option>${Object.entries(D.moves).filter(([id,x])=>x.frames&&x!==m).map(([id,x])=>`<option value="${id}">${esc(x.alias)} · ${esc(x.input)}</option>`).join('')}</select><div id="comparison"></div>`;
}
function updateContact(m){const value=$('contact').value;if(value==='whiff')$('contact-note').textContent='空振り：接触を条件にするキャンセルは使えません。専用派生・連打は別に確認します。';else if(value==='block')$('contact-note').textContent=`ガード：通常接触の参照硬直差は ${m.block>0?'+':''}${m.block}F。${m.block>0?'自分が先に動けます。':'相手が先に動けます。'}先端や持続の後半で当たる場合は変化し得ます。距離があるため、硬直差だけでは反撃の成否は決まりません。`;else $('contact-note').textContent=`ヒット：参照値 ${m.hit}${/^[+\-]?\d+$/.test(m.hit)?'F':''}。接続先が使えても、距離や浮き方によって追撃の成立は変わります。`;}
function updateFrame(m,f){const [s,a]=m.frames,n=total(m);$('frame-range').value=f;$('frame-cursor').style.left=((f-1)/.6)+'%';$('frame-output').textContent=`${f}F · ${f<s?'攻撃前':f<s+a?'持続':f<=n?'後隙':'再行動可能'}`;}
function stopAnimation(){if(timer){clearInterval(timer);timer=null;}if($('play-time'))$('play-time').textContent='ゆっくり再生';}
function playAnimation(m){if(timer){stopAnimation();return;}let f=1;updateFrame(m,f);$('play-time').textContent='停止';timer=setInterval(()=>{f++;updateFrame(m,f);if(f>=total(m)+1)stopAnimation();},120);}
function renderComparison(m){const other=D.moves[$('compare').value];$('comparison').innerHTML=other?`<div class="time-head"><span>${esc(other.alias)} / ${esc(other.input)}</span><span>全体${total(other)}F</span></div>${band(other)}<p class="fine">上と同じ尺度。出し切り動作の比較です。リーチ・無敵・アーマーは、この長さでは比較できません。</p>`:'';}
function renderPlans(){
 const entries=Object.entries(state.plans),active=entries.filter(([,p])=>p.status==='active'),archive=entries.filter(([,p])=>p.status!=='active');
 $('plan-count').textContent=active.length+'件';$('archive-count').textContent=`(${archive.length})`;
 $('plans').innerHTML=active.length?active.map(([id,p])=>planCard(id,p)).join(''):'<div class="empty"><b>次の対戦に、一つだけ。</b><p>状況を選び「次の対戦で意識する」で、合図と見送り条件を保存できます。</p></div>';
 $('archive').innerHTML=archive.length?archive.map(([id,p])=>`<div class="archive-item"><b>${esc(D.situations.find(s=>s.id===id).title)}</b><span class="muted">${p.level==='natural'?'自然に選べる':p.status==='rest'?'いったん休む':'控え'}</span><div class="actions"><button data-open="${id}">判断を見る</button><button data-resume="${id}">今回に戻す</button></div></div>`).join(''):'<p class="muted">まだありません。</p>';
}
function planCard(id,p){const s=D.situations.find(x=>x.id===id),m=D.moves[s.move],history=state.history.filter(h=>h.id===id).slice(-5).reverse();return `<article class="plan-card ${p.level!=='explain'?'compact':''}"><h3>${esc(s.title)}</h3><p class="plan-move">${esc(m.input)} · ${esc(m.alias)}</p><p class="plan-cue"><span class="label">合図</span>${esc(p.cue)}</p><p class="avoid"><span class="label">見送る条件</span>${esc(p.skip)}</p><p><span class="label">今回、確かめること</span>${esc(p.watch)}</p><label><span class="sr-only">${esc(s.title)}の習得状態</span><select data-level="${id}"><option value="explain" ${p.level==='explain'?'selected':''}>説明を確認したい</option><option value="aware" ${p.level==='aware'?'selected':''}>意識すれば選べる</option><option value="natural" ${p.level==='natural'?'selected':''}>自然に選べる → 畳む</option></select></label><div class="actions"><button data-review="${id}">振り返る</button><button data-open="${id}">詳しく</button><button data-rest="${id}">いったん外す</button></div>${history.length?`<details class="history"><summary>最近の振り返り ${history.length}件</summary>${history.map(h=>`<p><span class="muted">${new Date(h.date).toLocaleDateString('ja-JP')}</span><br>${esc(outcomes[h.outcome])}${h.note?'<br>'+esc(h.note):''}</p>`).join('')}</details>`:''}</article>`;}
function openPlan(){const s=current(),p=state.plans[s.id];dialogId=s.id;const form=$('plan-form');$('dialog-move').textContent=D.moves[s.move].input+' · '+s.title;for(const k of ['cue','skip','watch'])form.elements[k].value=p?.[k]||s[k];$('plan-dialog').showModal();}
function openReview(id){reviewId=id;const s=D.situations.find(s=>s.id===id);$('review-form').reset();$('review-title').textContent=s.title;$('review-outcome').hidden=false;$('review-dialog').showModal();}
$('categories').onclick=e=>{const b=e.target.closest('[data-category]');if(!b)return;category=b.dataset.category;query='';$('search').value='';renderCategories();renderSituations();};
$('situations').onclick=e=>{const b=e.target.closest('[data-situation]');if(!b)return;selected=b.dataset.situation;renderSituations();};
$('search').oninput=e=>{query=e.target.value.trim();renderCategories();renderSituations();};
$('recall-mode').onclick=()=>{recall=!recall;revealed.clear();$('recall-mode').setAttribute('aria-pressed',recall);$('recall-mode').textContent=recall?'技を表示する':'技を隠して思い出す';renderSituations();};
$('detail').onclick=e=>{const action=e.target.closest('[data-action]')?.dataset.action;if(action==='plan')openPlan();if(action==='reveal'){revealed.add(selected);renderSituations();}};
$('close-dialog').onclick=()=>$('plan-dialog').close();$('close-review').onclick=()=>$('review-dialog').close();
$('plan-form').onsubmit=e=>{e.preventDefault();const form=e.target;const values=Object.fromEntries(['cue','skip','watch'].map(k=>[k,form.elements[k].value.trim()]));if(Object.values(values).some(v=>!v)){toast('空白だけの項目は保存できません');return;}if(mutate(n=>{n.plans[dialogId]={...values,status:'active',level:n.plans[dialogId]?.level||'explain'};})){$('plan-dialog').close();renderPlans();renderDetail();}};
$('opportunity').onchange=e=>{$('review-outcome').hidden=e.target.value!=='yes';};
$('review-form').onsubmit=e=>{e.preventDefault();const f=e.target,opportunity=f.elements.opportunity.value;const entry={id:reviewId,date:new Date().toISOString(),opportunity,outcome:opportunity==='yes'?f.elements.outcome.value:opportunity,note:f.elements.note.value.trim()};if(mutate(n=>{n.history.push(entry);n.history=n.history.slice(-5000);},'振り返りを保存しました')){$('review-dialog').close();renderPlans();}};
document.querySelector('.notebook').onclick=e=>{const b=e.target.closest('button');if(!b)return;const {open,resume,rest,review}=b.dataset;
 if(open){const s=D.situations.find(x=>x.id===open);selected=open;category=s.category;query='';$('search').value='';revealed.add(open);renderCategories();renderSituations();$('detail').focus();$('detail').scrollIntoView({block:'start',behavior:'instant'});}
 if(resume&&mutate(n=>{n.plans[resume].status='active';},'今回の判断に戻しました')){renderPlans();renderDetail();}
 if(rest){const previous=structuredClone(state);if(mutate(n=>{n.plans[rest].status='rest';},'')){undo=previous;renderPlans();toast('控えに移しました。記録は残っています。',true);}}
 if(review)openReview(review);
};
document.querySelector('.notebook').onchange=e=>{const id=e.target.dataset.level;if(!id)return;const previous=structuredClone(state),level=e.target.value;if(mutate(n=>{n.plans[id].level=level;if(level==='natural')n.plans[id].status='reserve';},'')){undo=previous;renderPlans();renderDetail();toast(level==='natural'?'身についた判断を畳みました。いつでも戻せます。':'説明の量を変更しました。',true);}else renderPlans();};
$('export').onclick=()=>{let content=JSON.stringify(state,null,2);if(storageBlocked){try{content=localStorage.getItem(KEY)||content;}catch(e){toast('保存済み記録を読み出せません');return;}}const url=URL.createObjectURL(new Blob([content],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='marisa-notebook-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>3000000)throw Error('ファイルが大きすぎます');const incoming=validState(JSON.parse(await file.text()));const before=structuredClone(state),next=structuredClone(state);let added=0;for(const [id,p]of Object.entries(incoming.plans)){if(!next.plans[id]){next.plans[id]=p;added++;}}const seen=new Set(next.history.map(h=>JSON.stringify(h)));for(const h of incoming.history){const key=JSON.stringify(h);if(!seen.has(key)){next.history.push(h);seen.add(key);}}next.history.sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));next.history=next.history.slice(-5000);if(save(next,'')){undo=before;renderPlans();renderDetail();toast(`${added}件追加。重複する判断はこの端末の内容を保持しました。`,true);}}catch(error){toast('読み込めません：'+error.message);}finally{e.target.value='';}};
window.addEventListener('storage',e=>{if(e.key!==KEY)return;try{if(!e.newValue){storageError('別のタブで記録が削除されました。この画面の内容は書き出せます。');storageBlocked=true;return;}state=validState(JSON.parse(e.newValue));renderPlans();renderDetail();toast('別のタブの記録を反映しました');}catch(error){storageBlocked=true;storageError('別のタブの記録を読めません。元の記録を保護しています。');}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAnimation();});
$('sources').innerHTML=D.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)} ↗</a>`).join('');
renderCategories();renderPlans();renderSituations();
// Pure functions are exposed only to the repository's non-browser regression test.
if(typeof module!=='undefined')module.exports={validState,total};
})();
