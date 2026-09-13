const fs=require('fs');const path=require('path');const ROOT=path.resolve(__dirname, '..');const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(ROOT, 'index.html'),'utf8');
// zkontrolovat uplnost slovniku
const i18n=fs.readFileSync(path.join(ROOT, 'src', 'i18n.js'),'utf8');
const mod={};new Function('module',i18n+';module.exports={I18N,LANGS};')(mod);
const {I18N}=mod.exports;
const base=Object.keys(I18N.en);
for(const l of Object.keys(I18N)){
  const miss=base.filter(k=>I18N[l][k]===undefined);
  const extra=Object.keys(I18N[l]).filter(k=>base.indexOf(k)<0);
  console.log(l, '| klicu', Object.keys(I18N[l]).length, '| chybi', miss.length?miss.join(','):'nic', '| navic', extra.length?extra.join(','):'nic');
}
// zkontrolovat, ze kazdy t("...") klic ve zdrojaku existuje
const app=fs.readFileSync(path.join(ROOT, 'src', 'app.js'),'utf8');
const used=new Set([...app.matchAll(/\bt\("([a-zA-Z0-9_]+)"/g)].map(m=>m[1]));
// klice skladane za behu, napriklad t("trk_" + tr.id), se v kodu objevi
// jen jako prefix a ve slovniku samy o sobe nejsou
const dyn=['trk_','res','legend','job_','heat_','w_','grade','unit_'];
const missing=[...used].filter(k=>I18N.en[k]===undefined && !dyn.includes(k));
console.log('\npouzitych klicu v kodu:', used.size, '| bez prekladu:', missing.length?missing.join(', '):'zadny');

// projit hru ve vsech jazycich
async function play(lang){
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/'});
  const w=dom.window,d=w.document;const errs=[];
  w.addEventListener('error',e=>errs.push('ERROR: '+e.message));
  dom.virtualConsole.on('jsdomError',e=>errs.push('JSDOM: '+e.message));
  Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 375}});
  Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{get(){return 192}});
  const click=el=>{if(!el)throw new Error('prvek nenalezen '+lang);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
  const q=s=>d.querySelector(s), qa=s=>[...d.querySelectorAll(s)];
  const txt=()=>d.getElementById('app').textContent.replace(/\s+/g,' ').trim();
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const type=s=>{String(s).split('').forEach(ch=>click(qa('[data-k]').find(b=>b.dataset.k===ch)));
    click(qa('[data-k]').find(b=>b.dataset.k==='ok'));};
  const qt=()=>d.getElementById('qtext')?d.getElementById('qtext').textContent:null;
  const fin=()=>I18N[lang].finishWord;
  await wait(30);
  click(qa('[data-act="parentlang"]').find(b=>b.dataset.lang===lang));
  d.getElementById('pin1').value='1234'; click(q('[data-act="savepin"]'));
  click(q('[data-act="newplayer"]')); d.querySelector('#nm').value='Sam';
  click(qa('[data-gr]').find(b=>b.dataset.gr==='3'));            // bez tridy se dal nejde
  click(q('[data-go]'));
  const map=txt();
  // mapa treťáka zacina u letosniho uciva a prvni misto v rade je male
  // nasobilka, kterou tretí trida opakuje a ma ji otevrenou od zacatku;
  // dokud se na ni ptalo jen na rok zavedeni, byla za dvermi a test musel
  // nejdriv klepnout na "Z minulých let"
  click(q('[data-act="play"]')); click(q('[data-go]'));
  let n=0;
  while(qt() && qt()!==fin() && n<40){ const a=eval(qt().replace('×','*').replace(':','/')); type(n===3?a+1:a); n++; await wait(n===4?2000:620); }
  await wait(1500);
  const res=txt();
  click(q('[data-act="map"]')); click(q('[data-act="gate"]'));
  d.getElementById('gatein').value='1234'; click(q('[data-act="gatego"]'));
  const par=txt();
  console.log('\n['+lang+'] mapa:', map.slice(0,110));
  console.log('['+lang+'] vysledek:', res.slice(0,90));
  console.log('['+lang+'] rodice:', par.slice(0,100));
  console.log('['+lang+'] chyby:', errs.length?errs.join(' | '):'zadne');
}
(async()=>{ for(const l of ['cs','en','de']) await play(l); process.exit(0); })();
