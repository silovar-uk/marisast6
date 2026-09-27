const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function mount(storage=new Map(),failWrites=false){
 const elements=new Map();
 function el(id){if(!elements.has(id))elements.set(id,{id,innerHTML:'',textContent:'',hidden:false,value:'',style:{},dataset:{},setAttribute(){},focus(){},scrollIntoView(){},showModal(){this.open=true;},close(){this.open=false;},click(){},reset(){},elements:{cue:{value:''},skip:{value:''},watch:{value:''},opportunity:{value:'yes'},outcome:{value:'acted'},note:{value:''}}});return elements.get(id);}
 const document={getElementById:el,querySelector:el,addEventListener(){},createElement:el};
 const context=vm.createContext({window:{addEventListener(){}},document,module:{exports:{}},structuredClone,console,Date,Blob,URL,Set,Map,localStorage:{getItem:k=>storage.get(k)||null,setItem(k,v){if(failWrites)throw Error('quota');storage.set(k,v);}},setTimeout(){return 1;},clearTimeout(){},setInterval(){return 1;},clearInterval(){}});
 for(const file of ['decision-data.js','decision.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 return {el,context,storage,core:context.module.exports};
}
const app=mount(),D=app.context.window.MARISA_DECISIONS;
const key='marisa-decision-notebook-v1';
assert.equal(D.categories.length,8);
assert.equal(new Set(D.situations.map(s=>s.id)).size,D.situations.length);
for(const s of D.situations){assert.ok(D.moves[s.move]);assert.ok(s.cue&&s.skip&&s.watch&&s.practice);}
assert.equal(app.core.total(D.moves.crLP),15,'Startup includes first active frame');
assert.equal(app.core.total(D.moves.sa2),null,'No invented landing duration');
assert.equal(app.core.total(D.moves.bHP),null,'Conflicting data must not produce a false timeline');
assert.equal(D.moves.stMK.cancel.length,0);
assert.ok(D.moves.crHPHold.cancel.includes('SA'));
assert.equal(D.moves.crHP.cancel.length,0);
assert.ok(app.el('detail').innerHTML.includes('次の対戦で意識する'));
app.el('detail').onclick({target:{closest:()=>({dataset:{action:'plan'}})}});
app.el('plan-form').onsubmit({preventDefault(){},target:app.el('plan-form')});
assert.equal(JSON.parse(app.storage.get(key)).plans['gap-light'].status,'active');
assert.match(app.el('plans').innerHTML,/近距離の隙/);
const reloaded=mount(app.storage);assert.match(reloaded.el('plans').innerHTML,/近距離の隙/);
reloaded.el('.notebook').onclick({target:{closest:()=>({dataset:{review:'gap-light'}})}});
reloaded.el('review-form').elements.opportunity.value='no';
reloaded.el('review-form').onsubmit({preventDefault(){},target:reloaded.el('review-form')});
assert.equal(JSON.parse(app.storage.get(key)).history[0].outcome,'no');
reloaded.el('.notebook').onchange({target:{dataset:{level:'gap-light'},value:'natural'}});
assert.equal(JSON.parse(app.storage.get(key)).plans['gap-light'].status,'reserve');
assert.match(reloaded.el('archive').innerHTML,/自然に選べる/);
reloaded.el('undo').onclick();
assert.equal(JSON.parse(app.storage.get(key)).plans['gap-light'].status,'active');
const before=app.storage.get(key);const blocked=mount(app.storage,true);
blocked.el('.notebook').onclick({target:{closest:()=>({dataset:{rest:'gap-light'}})}});
assert.equal(app.storage.get(key),before,'A failed write must not destroy a plan');
assert.equal(blocked.el('storage-error').hidden,false);
const broken=new Map([[key,'not-json']]);const bad=mount(broken);assert.equal(broken.get(key),'not-json');assert.equal(bad.el('storage-error').hidden,false);
assert.throws(()=>app.core.validState({version:2,plans:{},history:[]}));
assert.throws(()=>app.core.validState({version:1,plans:{unknown:{}},history:[]}));
const injected=JSON.parse(before);injected.plans['gap-light'].cue='<img src=x onerror=alert(1)>';
const safe=mount(new Map([[key,JSON.stringify(injected)]]));assert.ok(!safe.el('plans').innerHTML.includes('<img'));assert.ok(safe.el('plans').innerHTML.includes('&lt;img'));
(async()=>{
 const original=app.storage.get(key);const incoming=JSON.parse(original);incoming.plans['gap-light'].cue='duplicate must not overwrite';
 const imported=mount(app.storage);
 await imported.el('import').onchange({target:{files:[{size:100,text:async()=>JSON.stringify(incoming)}],value:'file'}});
 assert.equal(JSON.parse(app.storage.get(key)).plans['gap-light'].cue,JSON.parse(original).plans['gap-light'].cue);
 await imported.el('import').onchange({target:{files:[{size:100,text:async()=>'{bad'}],value:'file'}});
 assert.deepEqual(JSON.parse(app.storage.get(key)),JSON.parse(original));
 for(const file of ['decision.html','decision.js','decision.css','decision-data.js'])assert.ok(fs.statSync(path.join(root,file)).size>0);
 const html=fs.readFileSync(path.join(root,'decision.html'),'utf8');for(const match of html.matchAll(/(?:src|href)="([^"?#]+\.(?:js|css))(?:\?[^\"]*)?"/g))assert.ok(fs.existsSync(path.join(root,match[1])));
 console.log('Decision notebook: state persistence, no-opportunity review, mastery/undo, failed writes, corrupt records, import validation/merge, escaping, frame math and references passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
