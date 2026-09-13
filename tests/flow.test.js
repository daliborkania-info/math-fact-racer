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
const ev=s=>dom.window.eval(s);

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
ok('pri zakladani se vybira trida', qa('[data-gr]').length===4);
ok('bez vybrane tridy nejde pokracovat', q('[data-go]').hasAttribute('disabled'));
d.querySelector('#nm').value='Kuba';
click(qa('[data-gr]').find(b=>b.dataset.gr==='3'));
ok('po vyberu tridy uz tlacitko jde', !q('[data-go]').hasAttribute('disabled'));
click(q('[data-go]'));
ok('rocnik se ulozil do profilu', DBg().profiles[0].grade===3, 'grade '+DBg().profiles[0].grade);
ok('profil dostal startovni sestku zdarma', DBg().profiles[0].owned.length===6, DBg().profiles[0].owned.join(','));
ok('mapa ma 20 ruznych cest', new Set(qa('.thumb svg path').map(p=>p.getAttribute('d'))).size===20,
   new Set(qa('.thumb svg path').map(p=>p.getAttribute('d'))).size+' okruhu');
ok('trat hodin je na mape a odemcena od zacatku', /Hodiny/.test(txt()) && qa('[data-act="play"]').some(b=>b.dataset.id==='clock'));
// mapa uz neni svisly seznam: mista lezi podel cesty a zamcene je vidět taky
ok('mista lezi podel cesty, ne pod sebou', qa('.world .place').length===21 && qa('.worldroad path').length>0,
   qa('.world .place').length+' mist');
ok('kazde misto ma svou polohu v mape', qa('.place').every(el=>/left:/.test(el.getAttribute('style')||'')));
ok('zamcena trat je videt, jen tmava', qa('.place.locked').length>0 && /Šestky a sedmičky/.test(txt()),
   qa('.place.locked').length+' zamcenych');
ok('zamcene misto neni tlacitko', qa('.place.locked').every(el=>el.tagName!=='BUTTON'));
ok('dilna je vlastni misto mimo rady trati', qa('.place.shopplace[data-act="shop"]').length===1);
ok('misto ukazuje, kolik uz je ve sbirce', /0\/4\b/.test(txt()));

console.log('--- zavod s chybami ---');
// naschval nasobilka, ne prvni misto v rade: souhrn nize se porovnava s ni
click(qa('[data-act="play"]').find(b=>b.dataset.id==='t1'));
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
click(q('[data-act="map"]')); click(qa('[data-act="play"]').find(b=>b.dataset.id==='t1')); click(q('[data-go]'));
await wait(300);
ok('souper se zobrazuje', d.getElementById('rivalcar').style.display!=='none');
// v zavodni liste tecky naopak rostou, aby vyplnily sirku mezi krizkem a poctem
ok('tecky v zavodni liste rostou do sirky',
   ev('getComputedStyle(document.querySelector(".gamebar .pips")).flexGrow')==='1',
   'flex-grow '+ev('getComputedStyle(document.querySelector(".gamebar .pips")).flexGrow'));
n=0; while(inRace()&&n<60){ type(answer()); n++; await wait(640); }
await wait(1500);
ok('novy rekord ohlasen', /Překonal jsi svůj rekord/.test(txt()));
// sbirka trati patri na vysledkovou obrazovku, jinak o ni dite nevi
ok('vysledek ukazuje sbirku trati', qa('.tokcard .toks').length===1);
ok('sbirka trati je velka jako trat',
   ev('trackSpec(P(), trackById("t1")).keys.length === trackKeys(P(), trackById("t1")).length'));

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
ok('nasobilka je mrizka 11x11 ve scrollovacim obalu',
   qa('.heatwrap .heat.grid')[0] && qa('.heatwrap .heat.grid')[0].querySelectorAll('span').length===121);
ok('heatmapa neukazuje jen nasobilku', qa('.heatwrap .heat.strip').length>=3,
   qa('.heatwrap .heat.strip').length+' pasu dlazdic');
// pozor: nazvy trati jsou v rodicovske sekci i u prepinacu odemceni,
// takze se hleda mezi nadpisy bloku, ne v textu cele obrazovky
const bloky=()=>ev('JSON.stringify(heatSpecs(P()).map(s=>s.title))');
ok('zamcena a nedotcena rodina se neukazuje', !/Do tisíce|Dělení/.test(bloky()), bloky());
const multOnly=ev('Math.round(mastery(P(), MULT.map(f=>mk(f.a,f.b)))*100)');
const shown=+q('.statrow .stat .v').textContent.replace(/\D/g,'');
ok('souhrn uz neni jen nasobilka, ale vazeny prumer pres otevrene trate',
   shown<multOnly, shown+' % celkem vs '+multOnly+' % jen nasobilka');
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
const opts=()=>qa('[data-act="chaptersel"] option');
const zamcene=()=>opts().filter(o=>o.disabled).map(o=>+o.value);
ok('kapitoly bez generatoru jsou nevybratelne', zamcene().length===15, zamcene().length+' zamcenych z 33');
ok('deleni se zbytkem a zlomky jsou mezi zamcenymi', zamcene().includes(27) && zamcene().includes(32));
// nasobeni a deleni mimo malou nasobilku uz umime, takze jeho tri kapitoly zamcene byt nesmi
ok('mimo rozsah male nasobilky se da vybrat',
   !zamcene().includes(14) && !zamcene().includes(16) && !zamcene().includes(31));
// zaokrouhlovani taky umime, tedy kapitoly 7 a 26
ok('zaokrouhlovani se da vybrat', !zamcene().includes(7) && !zamcene().includes(26));
// obor do tisice uz umime, takze jeho tri kapitoly zamcene byt nesmi
ok('obor do tisice se da vybrat', !zamcene().includes(23) && !zamcene().includes(24) && !zamcene().includes(25));
ok('kapitola s hodinami uz zamcena neni', !zamcene().includes(4));
ok('hratelne kapitoly zamcene nejsou', !zamcene().includes(1) && !zamcene().includes(12));
ok('vysvetleni k sedym kapitolam je videt', /Šedé kapitoly/.test(txt()));
ok('u vybrane kapitoly se slibuje trat', /jede přesně podle téhle kapitoly/.test(txt()));
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
console.log('--- hodiny ---');
click(q('[data-act="map"]'));
click(qa('[data-act="play"]').find(b=>b.dataset.id==='clock')); click(q('[data-go]'));
ok('otazkou je cifernik, ne text', qa('#qtext .dial').length===1 && qtext().indexOf('=')<0);
ok('u ciferniku je napsano, jak se cas zapisuje', /Kolik je hodin/.test(d.getElementById('hint').textContent));
ok('zacatecnik dostane jen cele hodiny', ev('RUN.items.every(i=>i.key==="c1")'));
click(qa('[data-k]').find(b=>b.dataset.k==='7')); click(qa('[data-k]').find(b=>b.dataset.k==='4'));
click(qa('[data-k]').find(b=>b.dataset.k==='5'));
ok('cas se v policku pise s dvojteckou', d.getElementById('abox').textContent==='7:45');
click(qa('[data-k]').find(b=>b.dataset.k==='del')); click(qa('[data-k]').find(b=>b.dataset.k==='del'));
click(qa('[data-k]').find(b=>b.dataset.k==='del'));
const cas0=ev('RUN.items[0].answer');
type(cas0+100);                              // klasicka chyba, mala rucicka o hodinu dal
await wait(300);
ok('cas o hodinu vedle ma vlastni hlasku', /Malá ručička/.test(d.getElementById('hint').textContent),
   d.getElementById('hint').textContent.slice(0,70));
await wait(1700);
let cn=1;
// zbytek zavodu se odpovida zkracene: celou hodinu smi dite napsat jako
// jedno cislo, tedy sedmou hodinu jako 7, ne jako 700
while(inRace() && cn<40){ const a=ev('RUN.items[RUN.idx].answer'); type(a%100===0?a/100:a); cn++; await wait(640); }
await wait(1500);
ok('zavod s hodinami dojel do cile', cn>10, cn+' otazek');
ok('cele hodiny se daly napsat bez nul', (DBg().profiles[0].facts.c1||{}).ok>5,
   'c1 ok '+((DBg().profiles[0].facts.c1||{}).ok));
ok('chybny cas se na vysledcich ukaze jako cas, ne jako cislo',
   /Hodiny ukazují \d/.test(txt()) && !/ = \d+00/.test(txt()), txt().slice(-70));
ok('hodiny se zapsaly do krabicky', DBg().profiles[0].facts.c1 && DBg().profiles[0].facts.c1.reps>5,
   'c1 reps '+((DBg().profiles[0].facts.c1||{}).reps));

click(q('[data-act="map"]')); click(q('[data-act="gate"]'));
d.getElementById('gatein').value='1234'; click(q('[data-act="gatego"]'));
const cs2=sel('[data-act="curriculumsel"]');
cs2.value=''; cs2.dispatchEvent(new w.Event('change',{bubbles:true}));
ok('ucebnice se da zase vypnout', DBg().profiles[0].curriculum===null);
click(q('[data-act="map"]'));
ok('trat podle skoly zmizela z mapy', !/Co máte ve škole/.test(txt()));
const raw=DBg(); raw.profiles[0].curriculum='nns-matysek-3'; raw.profiles[0].chapter=15;
const dom3=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/',
  beforeParse(win){ win.localStorage.setItem('math-fact-racer-v1', JSON.stringify(raw)); }});
await wait(50);
const srovnano=JSON.parse(dom3.window.localStorage.getItem('math-fact-racer-v1')).profiles[0];
ok('ulozena zamcena kapitola se pri nacteni srovna dozadu', srovnano.chapter===14, 'kapitola '+srovnano.chapter);
click(q('[data-act="gate"]'));
d.getElementById('gatein').value='1234'; click(q('[data-act="gatego"]'));

click(q('[data-act="setpin"]'));
d.getElementById('pin1').value='5678'; click(q('[data-act="savepin"]'));
ok('kod zmenen', DBg().pin!==undefined && /Pro rodiče/.test(txt()));

console.log('--- dilna ---');
click(q('[data-act="map"]'));
ok('dilna je na mape', qa('[data-act="shop"]').length===1 && /Dílna/.test(txt()));
click(q('[data-act="shop"]'));
ok('dilna nabizi zakazku', qa('[data-act="jobstart"]').length===1 && /Peníze/.test(txt()));
const partsBefore=DBg().profiles[0].parts;
click(q('[data-act="jobstart"]'));
ok('zakazka ma sest uloh', qa('.pip').length===6, qa('.pip').length+' uloh');
// obrazovka dilny je sloupec, takze rostouci rada tecek by spolkla celou
// vysku a nad mincemi by zustal prazdny pas
ok('tecky v dilne nerostou do vysky',
   ev('getComputedStyle(document.querySelector(".pips")).flexGrow')==='0',
   'flex-grow '+ev('getComputedStyle(document.querySelector(".pips")).flexGrow'));
ok('otazka a pult jsou nad mincemi videt',
   q('#jobask').textContent.length>5 && q('#counter')!==null, q('#jobask').textContent);
ok('v dilne nejsou stopky ani body', !/bodů|body/.test(txt()) && qa('.rail,.stage').length===0);
ok('mince jsou k dispozici', qa('[data-coin]').length===6);
// vyresit celou zakazku: mince se klepou, dokud se nesejde castka
const jev=s=>dom.window.eval(s);
const pay=()=>{
  const sol=jev('JSON.stringify(JOB.items[JOB.idx].solution)');
  for(const c of JSON.parse(sol)) click(qa('[data-coin]').find(b=>+b.dataset.coin===c));
};
// kruh nad pultem: tolik dilu, kolik ma zakazka uloh, a odkryva se po
// jednom za vyresenou ulohu. Zakryte vysece se poznaji podle barvy,
// protoze obrazek zavodnika pod nimi ma svoje vlastni cesty.
const kryto=()=>qa('#reveal path').filter(x=>x.getAttribute('fill')==='#f2e3ca').length;
ok('kruh nad pultem ma tolik dilu, kolik ma zakazka uloh', kryto()===6, kryto()+' zakrytych');
ok('kruh ukazuje vlastniho zavodnika ditete', q('#reveal svg svg')!==null);
pay();
ok('pult ukazuje, co na nem lezi', qa('#counter [data-drop]').length>0, qa('#counter [data-drop]').length+' minci');
const firstCount=qa('#counter [data-drop]').length;
click(q('#counter [data-drop]'));
ok('minci z pultu jde vzit zpatky', qa('#counter [data-drop]').length===firstCount-1);
pay();                                       // doplnit zpet, muze prihodit i vic
let jn=0; const odkryto=[];
while(jev('view.name')==='job' && jn<20){
  // pult srovnat na presne reseni a odevzdat
  while(qa('#counter [data-drop]').length) click(q('#counter [data-drop]'));
  pay();
  click(q('[data-act="jobcheck"]'));          // vyhodnotit
  odkryto.push(6-kryto());                    // jeste na te same uloze
  if(jev('view.name')==='job') click(q('[data-act="jobcheck"]'));   // dalsi uloha
  jn++;
}
ok('zakazka dosla do konce', jev('view.name')==='jobdone', 'obrazovka '+jev('view.name'));
ok('kruh se odkryva po jednom dilu za vyresenou ulohu a na konci je cely',
   odkryto.join(',')==='1,2,3,4,5,6', odkryto.join(','));
ok('sbirka dilny je na vysledku zakazky', qa('.tokcard .toks').length===1);
ok('soucastky pribyly', DBg().profiles[0].parts>partsBefore,
   partsBefore+' -> '+DBg().profiles[0].parts);
ok('dilna se zapsala do krabicky', !!DBg().profiles[0].facts.wm1);
ok('dilna nezkreslila prumerny cas', DBg().profiles[0].msN>0 &&
   DBg().profiles[0].msN < DBg().profiles[0].totalAns, 'merenych '+DBg().profiles[0].msN+' z '+DBg().profiles[0].totalAns);
// opravena uloha musi kruh odkryt taky, jinak by z nej bylo meridlo
// bezchybnosti a dilna by zacala hodnotit vykon
click(q('[data-act="jobagain"]'));
let jn2=0, chybnuto=false;
while(jev('view.name')==='job' && jn2<20){
  while(qa('#counter [data-drop]').length) click(q('#counter [data-drop]'));
  pay();
  // prvni uloha schvalne o jednu korunu vedle, aby se vratila jako oprava
  if(!chybnuto){ chybnuto=true; click(qa('[data-coin]').find(b=>+b.dataset.coin===1)); }
  click(q('[data-act="jobcheck"]'));
  if(jev('view.name')==='job') click(q('[data-act="jobcheck"]'));
  jn2++;
}
ok('chyba zakazku prodlouzila o opravu', jev('JOB.retries')===1 && jev('JOB.items.length')===7,
   jev('JOB.items.length')+' uloh, oprav '+jev('JOB.retries'));
ok('opravena uloha odkryla dil taky, kruh je i po chybe cely',
   jev('JOB.ok')===6 && jev('JOB.marks.filter(m=>m===2).length')===1, 'vyreseno '+jev('JOB.ok')+' z 6');

// soucastky jsou jen na natery, takze utrata za ne ma skocit rovnou na ne
click(q('[data-act="paintshop"]'));
ok('utrata soucastek otevre garaz rovnou u nateru',
   ev('view.name')==='collection' && ev('view.focus')==='paintsec' && q('#paintsec')!==null,
   ev('view.name')+' / '+ev('view.focus'));
ok('vyber stroje uz zpatky k naterum neskace',
   (click(qa('[data-act="use"]')[0]), ev('view.focus')===undefined));

console.log('--- heatmapa nad vsemi rodinami ---');
ev('go("map")'); click(q('[data-act="gate"]'));
d.getElementById('gatein').value='5678'; click(q('[data-act="gatego"]'));
// kazda rodina, kterou ma dite v krabicce, musi mit v rodicovske sekci vlastni blok
const chybi=ev(`(function(){
  const p=P();
  const head={m:"heatMult",d:"trk_d1",a:"heatBands",s:"heatBands",p:"trk_a100",n:"trk_a100",
              k:"trk_a1000",c:"trk_clock",w:"shopTitle"};
  const want=new Set(Object.keys(p.facts).filter(k=>p.facts[k].reps>0).map(k=>t(head[k[0]])));
  const have=new Set(heatSpecs(p).map(s=>s.title));
  return [...want].filter(x=>!have.has(x)).join(", ");
})()`);
ok('kazda rodina z krabicky ma v rodicovske sekci blok', chybi==='', chybi||'zadna nechybi');
ok('hodiny maji vlastni pas dlazdic', /7:00/.test(txt()) && /19:45/.test(txt()));
ok('dilna je v heatmape taky', /Dílna/.test(txt()) && /nejmíň mincí/.test(txt()));
ok('dlazdice hodin uz neco ukazuje',
   ev('heatCell(P(), ["c1"]).has && heatCell(P(), ["c1"]).n===1'));
ok('krok do dvaceti je dlazdice pres celou skupinu', ev('heatCell(P(), stageKeys(0)).n>10'),
   ev('heatCell(P(), stageKeys(0)).n')+' prikladu v prvnim kroku');

console.log('--- sbirka nalezu ---');
ev('go("map")');
ok('sbirka je dostupna z mapy', qa('[data-act="tokens"]').length===1);
click(q('[data-act="tokens"]'));
ok('sbirka ma vlastni obrazovku', /Poklady/.test(txt()) && qa('.tokwrap .toks').length>1,
   qa('.tokwrap .toks').length+' sbirek');
ok('dilna ma sbirku, i kdyz zadna trat neni',
   ev('collectionSpecs(P()).some(s=>s.keys.indexOf("wm1")>=0)'));
ok('sbirka dilny neni velka podle trati, ale podle kroku zakazek',
   ev('shopSpec().keys.length')===3, ev('shopSpec().keys.length')+' mist');
ok('ve sbirce uz neco sviti', ev('starsAll(P())')>0, ev('starsAll(P())')+' rozsvicenych');
// rozsvicene misto nezhasne, i kdyz uroven prikladu spadne
const zkus=ev(`(function(){
  const p=P(), k=Object.keys(p.stars)[0];
  p.facts[k].lv=0;
  record(p, {key:k, kind:"mult"}, false, 9000);
  return p.stars[k] === true;
})()`);
ok('rozsvicene misto nezhasne ani po chybe a poklesu urovne', zkus===true);

console.log('--- volba sveta ---');
ev('go("map")');
const rekordy=JSON.stringify(DBg().profiles[0].best);
const krajinaOkruh=q('.place .thumb svg stop').getAttribute('stop-color');
ok('volba sveta je na mape, ne za rodicovskym kodem', qa('[data-act="worldpick"]').length===1);
click(q('[data-act="worldpick"]'));
ok('nabidka ma vsechny ctyri svety', qa('[data-act="worldset"]').length===4 && /Stezka/.test(d.body.textContent));
// ctyri nahledy teze trati v jednom dokumentu: kdyby mely stejne id
// prechodu, vykreslily by se vsechny barvou toho prvniho
ok('kazdy svet se v nabidce ukazuje svou barvou',
   new Set(qa(".pickworld .thumb svg linearGradient[id^='grd_'] stop[offset='0']").map(s=>s.getAttribute('stop-color'))).size===4,
   new Set(qa(".pickworld .thumb svg linearGradient[id^='grd_'] stop[offset='0']").map(s=>s.getAttribute('stop-color'))).size+' ruznych');
click(qa('[data-act="worldset"]').find(b=>b.dataset.id==='trail'));
ok('svet se ulozil do profilu', DBg().profiles[0].world==='trail', DBg().profiles[0].world);
ok('krajina se zmenila', q('.place .thumb svg stop').getAttribute('stop-color')!==krajinaOkruh);
ok('jmena trati zustala', /Rozjezd/.test(txt()) && /Hodiny/.test(txt()));
ok('rekordy prepnuti sveta neprezilo nic neubralo', JSON.stringify(DBg().profiles[0].best)===rekordy);
ok('ucivo se nezmenilo', ev('trackKeys(P(), trackById("t1")).length')===34,
   ev('trackKeys(P(), trackById("t1")).length')+' prikladu');
click(q('[data-act="play"]'));
ok('ve stezce se jde, ne jede', /Jdeme/.test(d.body.textContent) && /S kým půjdeš/.test(d.body.textContent));
ok('trat uz neni okruh, ale cesta se zastavkami',
   ev('route("trail","t1").closed')===false && ev('route("trail","t1").stops.length')>=6,
   ev('route("trail","t1").stops.length')+' zastavek');
ok('okruh zustal uzavrenou smyckou', ev('route("circuit","t1").closed')===true);
ok('vsichni koupeni zavodnici jsou porad k vyberu', qa('[data-pick]').length===7,
   qa('[data-pick]').length+' zavodniku');
ok('svet dal sve zavodniky dopredu', qa('[data-pick]')[0].dataset.pick.slice(0,4)==='pet_',
   qa('[data-pick]')[0].dataset.pick);
// a zavod v jinem svete musi dojet stejne jako v okruhu
click(q('[data-go]'));
await wait(200);
ok('cesta ve stezce se kresli a zavodnik po ni jde',
   q('#trail')!==null && d.getElementById('mycar').style.left!=='', d.getElementById('mycar').style.left);
let sn=0; while(inRace()&&sn<40){ type(answer()); sn++; await wait(640); }
await wait(1500);
ok('zavod ve stezce dojel ke stromu', /Došel jsi až ke stromu|medaile/.test(txt()), txt().slice(0,50));
// rekord patri trati, ne svetu: jinak by prepnuti kabatu zaradilo dite
// na start a duch vlastni nejlepsi jizdy by zmizel
ok('rekord se ulozil pod trat, ne pod svet',
   ev('Object.keys(P().best).every(k=>TRACKS.some(t=>t.id===k))')===true
   && ev('!!P().best.t1')===true, ev('Object.keys(P().best).join(",")'));
click(q('[data-act="map"]'));
click(q('[data-act="worldpick"]'));
click(qa('[data-act="worldset"]').find(b=>b.dataset.id==='sky'));
click(q('[data-act="play"]'));
ok('na obloze se leti', /Letíme/.test(d.body.textContent));
click(q('.sheet'));                                  // zavrit vyber klepnutim vedle
click(q('[data-act="worldpick"]'));
click(qa('[data-act="worldset"]').find(b=>b.dataset.id==='circuit'));
ok('zpatky do okruhu se da kdykoli', DBg().profiles[0].world==='circuit'
   && q('.place .thumb svg stop').getAttribute('stop-color')===krajinaOkruh);

console.log('--- natery ---');
const withParts=DBg(); withParts.profiles[0].parts=200;
w.localStorage.setItem('math-fact-racer-v1', JSON.stringify(withParts));
jev('load(); go("collection")');
ok('natery jsou v garazi', /Nátěry/.test(txt()) && qa('[data-act="buypaint"]').length===8);
click(qa('[data-act="buypaint"]')[0]);
click(q('[data-yes]'));
ok('nater koupen a nasazen', DBg().profiles[0].paints.length===1 &&
   Object.keys(DBg().profiles[0].paint).length===1, JSON.stringify(DBg().profiles[0].paint));
ok('nater stal soucastky, ne mince', DBg().profiles[0].parts===170, DBg().profiles[0].parts+' soucastek');
click(qa('[data-act="usepaint"]')[0]);
ok('nater jde zase sundat', Object.keys(DBg().profiles[0].paint).length===0);

console.log('--- rocnik a ukazka dalsiho roku ---');
click(q('[data-act="map"]')); click(q('[data-act="players"]'));
click(q('[data-act="newplayer"]')); d.querySelector('#nm').value='Prvňák';
click(qa('[data-gr]').find(b=>b.dataset.gr==='1')); click(q('[data-go]'));
const prvni=()=>DBg().profiles.find(x=>x.name==='Prvňák');
ok('prvnak ma na mape jen ucivo sveho rocniku',
   /Do dvaceti/.test(txt()) && !/Rozjezd|Hodiny|Do tisíce/.test(txt()), txt().slice(0,90));
const mistPrvnak=qa('.place:not(.peekdoor)').length;
ok('mapa prvnaka je kratka', mistPrvnak===8, mistPrvnak+' mist vcetne dilny');
ok('na konci cesty je tlacitko na priste', qa('.place.peekdoor').length===1 && /Co tě čeká příští rok/.test(txt()));
ok('dilna je na mape i prvnakovi', qa('[data-act="shop"]').length===1);
// ukazka rozbali dalsi rocnik, ale profil nechava na miste
click(q('[data-act="peek"]'));
const ukazka=qa('.place.peek');
ok('ukazka rozbalila tratě dalsiho rocniku', ukazka.length===10, ukazka.length+' trati');
ok('ukazka ukazuje druhou tridu, ne tretí', /Rozjezd/.test(txt()) && !/Do tisíce/.test(txt()));
ok('tratě z ukazky jdou spustit', ukazka.every(el=>el.tagName==='BUTTON' && el.dataset.act==='play'));
ok('rocnik v profilu se nezmenil', prvni().grade===1, 'grade '+prvni().grade);
ok('o ukazce neni v ulozenych datech ani slovo', !/peek/i.test(JSON.stringify(DBg())));
// zavod z ukazky se opravdu spusti
click(ukazka.find(el=>el.dataset.id==='t1')); click(q('[data-go]'));
ok('trat z ukazky se rozjela', ev('RUN && RUN.t.id')==='t1');
click(q('[data-act="quit"]')); click(q('[data-yes]'));
ok('po navratu je ukazka porad rozbalena', qa('.place.peek').length===10);
// prepnuti hrace ji slozi zpatky, stejne jako zavreni hry
click(q('[data-act="players"]')); click(qa('[data-act="pick"]').find(b=>b.dataset.id===prvni().id));
ok('prepnuti hrace ukazku slozilo', qa('.place.peek').length===0 && qa('.place.peekdoor').length===1);
ok('zkousena trat na mape prvnaka nezustala', !/Rozjezd/.test(txt()));
// rodic rocnik prepnout smi
click(q('[data-act="gate"]'));
d.getElementById('gatein').value='5678'; click(q('[data-act="gatego"]'));
ok('rodic ma prepinac rocniku', qa('[data-act="gradeset"]').length===4 && /Ročník/.test(txt()));
click(qa('[data-act="gradeset"]').find(b=>b.dataset.gr==='2'));
ok('rocnik prepnut', prvni().grade===2);
click(q('[data-act="map"]'));
ok('mapa druhaka je delsi', qa('.place:not(.peekdoor)').length===18 && /Rozjezd/.test(txt()),
   qa('.place:not(.peekdoor)').length+' mist');
ok('druhak vidi ukazku treti tridy', /Do tisíce/.test((click(q('[data-act="peek"]')), txt())));

console.log('--- druhy hrac ---');
click(q('[data-act="map"]')); click(q('[data-act="players"]'));
click(q('[data-act="newplayer"]')); d.querySelector('#nm').value='Anička';
click(qa('[data-gr]').find(b=>b.dataset.gr==='2')); click(q('[data-go]'));
ok('druhy profil ma vlastni postup', DBg().profiles.length===2 && DBg().profiles[1].coins===0);
click(q('[data-act="play"]')); click(q('[data-go]'));
ok('kratsi zavod dle nastaveni prvniho hrace se neprenasi', qa('.pip').length===20, qa('.pip').length+' otazek');

console.log('\nchyby za behu:', errs.length?errs.join('\n'):'zadne');
process.exit(0);
})();
