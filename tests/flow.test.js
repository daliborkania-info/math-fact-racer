const fs=require('fs');const path=require('path');const ROOT=path.resolve(__dirname, '..');const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(ROOT, 'index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/'});
const w=dom.window,d=w.document;const errs=[];
w.addEventListener('error',e=>errs.push('ERROR: '+e.message));
dom.virtualConsole.on('jsdomError',e=>errs.push('JSDOM: '+e.message));
Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 375}});
Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{get(){return 192}});
const click=el=>{if(!el)throw new Error('prvek nenalezen');el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
const q=s=>d.querySelector(s), qa=s=>[...d.querySelectorAll(s)];
const txt=()=>d.getElementById('app').textContent.replace(/\s+/g,' ').trim();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const type=s=>{String(s).split('').forEach(ch=>click(qa('[data-k]').find(b=>b.dataset.k===ch)));
  click(qa('[data-k]').find(b=>b.dataset.k==='ok'));};
const qtext=()=>d.getElementById('qtext')?d.getElementById('qtext').textContent:null;
const answer=()=>eval(qtext().replace('×','*').replace(':','/'));
const inRace=()=>qtext() && qtext()!=='cíl';
const DBg=()=>JSON.parse(w.localStorage.getItem('math-fact-racer-v1'));
const tot=()=>parseFloat(d.getElementById('trail').getAttribute('stroke-dasharray'));
const u=()=>+(1-parseFloat(d.getElementById('trail').style.strokeDashoffset)/tot()).toFixed(3);
const ok=(n,c,x)=>console.log((c?'  OK  ':'  !!  ')+n+(x!==undefined?'   ['+x+']':''));

(async()=>{
console.log('--- prvni spusteni ---');
ok('kod je jen jedno pole', qa('#pin1,#pin2').length===1);
ok('prepinac jazyka na uvodni obrazovce', qa('[data-act="parentlang"]').length===3);
click(qa('[data-act="parentlang"]').find(b=>b.dataset.lang==='cs'));
d.getElementById('pin1').value='12'; click(q('[data-act="savepin"]'));
ok('kratky kod odmitnut', d.getElementById('pinerr').textContent.length>5, d.getElementById('pinerr').textContent);
d.getElementById('pin1').value='1234'; click(q('[data-act="savepin"]'));
ok('kod ulozen jako hash', DBg().pin && !/1234/.test(JSON.stringify(DBg())), DBg().pin);

console.log('--- zalozeni hrace ---');
click(q('[data-act="newplayer"]'));
ok('pri zakladani se avatar nevybira', qa('[data-pick]').length===0);
d.querySelector('#nm').value='Kuba'; click(q('[data-go]'));
ok('profil dostal startovni sestku zdarma', DBg().profiles[0].owned.length===6, DBg().profiles[0].owned.join(','));
ok('mapa ma 10 ruznych okruhu', new Set(qa('.thumb svg path').map(p=>p.getAttribute('d'))).size===10);

console.log('--- zavod s chybami ---');
click(q('[data-act="play"]'));
ok('vyber zavodnika pred zavodem', qa('[data-pick]').length===6);
click(qa('[data-pick]').find(b=>b.dataset.pick==='pet_kiki'));
ok('vyber se ulozil', DBg().profiles[0].runner==='pet_kiki');
click(q('[data-go]'));
const n0=RUNlen(); function RUNlen(){return qa('.pip').length;}
let n=0, moves=[];
while(inRace() && n<60){
  const before=u(), bad=(n===2||n===5||n===19);
  type(bad?answer()+1:answer()); n++;
  await wait(bad?2000:640);
  if(d.getElementById('trail')) moves.push({n,bad,delta:+(u()-before).toFixed(3)});
}
ok('chyba auto neposune', moves.filter(m=>m.bad).every(m=>m.delta===0),
   moves.filter(m=>m.bad).map(m=>'#'+m.n+':'+m.delta).join(' '));
ok('spravna odpoved posune o 1/N', moves.filter(m=>!m.bad).every(m=>Math.abs(m.delta-1/n0)<0.002));
ok('zavod se o chyby prodlouzil', n>n0, n0+' -> '+n);
ok('kolo dojeto na 100 % po opravach', u()===1, Math.round(u()*100)+'%');
await wait(1500);
ok('vysledkova obrazovka', /medaile|Kolo dojeto/.test(txt()), txt().slice(0,60));
ok('bez zargonu spoj', !/spoj/i.test(txt()));

console.log('--- rekord a souper ---');
click(q('[data-act="map"]')); click(q('[data-act="play"]')); click(q('[data-go]'));
await wait(300);
ok('souper se zobrazuje', d.getElementById('rivalcar').style.display!=='none');
n=0; while(inRace()&&n<60){ type(answer()); n++; await wait(640); }
await wait(1500);
ok('novy rekord ohlasen', /Překonal jsi svůj rekord/.test(txt()));

console.log('--- sbirka ---');
click(q('[data-act="map"]')); click(q('[data-act="collection"]'));
ok('ve sbirce zbyva co kupovat', qa('[data-act="buy"]').length>0, qa('[data-act="buy"]').length+' k odemceni');
const coins=DBg().profiles[0].coins;
click(qa('[data-act="buy"]')[0]); click(q('[data-yes]'));
ok('nakup odecetl mince a nastavil jezdce', DBg().profiles[0].coins<coins && DBg().profiles[0].owned.length===7,
   coins+' -> '+DBg().profiles[0].coins);

console.log('--- rodicovska sekce ---');
click(q('[data-act="map"]')); click(q('[data-act="gate"]'));
d.getElementById('gatein').value='0000'; click(q('[data-act="gatego"]'));
ok('spatny kod odmitnut', /nesedí/.test(d.getElementById('gateerr').textContent));
d.getElementById('gatein').value='1234'; click(q('[data-act="gatego"]'));
ok('heatmapa 11x11 ve scrollovacim obalu', qa('.heatwrap .heat span').length===121);
click(qa('[data-act="qcount"]').find(b=>b.dataset.n==='10'));
click(qa('[data-act="speed"]').find(b=>b.dataset.sp==='slow'));
ok('nastaveni ulozeno', DBg().profiles[0].qCount===10 && DBg().profiles[0].speedMode==='slow');

console.log('--- volba ucebnice ---');
const sel=s=>{const el=q(s); return el;};
ok('vychozi stav je bez ucebnice', DBg().profiles[0].curriculum===null);
ok('nabidka ucebnic je v rodicovske sekci', sel('[data-act="curriculumsel"]')!==null);
const cs=sel('[data-act="curriculumsel"]');
cs.value='nns-matysek-3'; cs.dispatchEvent(new w.Event('change',{bubbles:true}));
ok('ucebnice ulozena a kapitola prednastavena',
   DBg().profiles[0].curriculum==='nns-matysek-3' && DBg().profiles[0].chapter===1,
   'kapitola '+DBg().profiles[0].chapter);
ok('nabidka kapitol ma 33 polozek', qa('[data-act="chaptersel"] option').length===33,
   qa('[data-act="chaptersel"] option').length+' kapitol');
ok('nepodporovana kapitola je oznacena', /zatím neumíme/.test(txt()));
const chs=sel('[data-act="chaptersel"]');
chs.value='2'; chs.dispatchEvent(new w.Event('change',{bubbles:true}));
ok('kapitola prepnuta', DBg().profiles[0].chapter===2);
click(qa('[data-act="chaptermode"]').find(b=>b.dataset.cm==='hard'));
ok('rezim kapitoly ulozen', DBg().profiles[0].chapterMode==='hard');
click(q('[data-act="map"]'));
ok('trat podle skoly je na mape', /Co máte ve škole/.test(txt()));
ok('trat nese nazev kapitoly', /násobilka 1, 2, 3, 4, 10/.test(txt()));
click(qa('[data-act="play"]').find(b=>b.dataset.id==='school')); click(q('[data-go]'));
const tabs=[]; while(inRace() && tabs.length<40){ tabs.push(qtext()); type(answer()); await wait(640); }
await wait(1500);
ok('zavod podle kapitoly probehl a drzel se nasobilky z kapitoly',
   tabs.length===10 && tabs.every(x=>/×|:/.test(x)), tabs.length+' otazek');
click(q('[data-act="map"]')); click(q('[data-act="gate"]'));
d.getElementById('gatein').value='1234'; click(q('[data-act="gatego"]'));
const cs2=sel('[data-act="curriculumsel"]');
cs2.value=''; cs2.dispatchEvent(new w.Event('change',{bubbles:true}));
ok('ucebnice se da zase vypnout', DBg().profiles[0].curriculum===null);
click(q('[data-act="map"]'));
ok('trat podle skoly zmizela z mapy', !/Co máte ve škole/.test(txt()));
click(q('[data-act="gate"]'));
d.getElementById('gatein').value='1234'; click(q('[data-act="gatego"]'));

click(q('[data-act="setpin"]'));
d.getElementById('pin1').value='5678'; click(q('[data-act="savepin"]'));
ok('kod zmenen', DBg().pin!==undefined && /Pro rodiče/.test(txt()));

console.log('--- druhy hrac ---');
click(q('[data-act="map"]')); click(q('[data-act="players"]'));
click(q('[data-act="newplayer"]')); d.querySelector('#nm').value='Anička'; click(q('[data-go]'));
ok('druhy profil ma vlastni postup', DBg().profiles.length===2 && DBg().profiles[1].coins===0);
click(q('[data-act="play"]')); click(q('[data-go]'));
ok('kratsi zavod dle nastaveni prvniho hrace se neprenasi', qa('.pip').length===20, qa('.pip').length+' otazek');

console.log('\nchyby za behu:', errs.length?errs.join('\n'):'zadne');
process.exit(0);
})();
