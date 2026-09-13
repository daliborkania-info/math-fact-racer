const fs=require('fs');const path=require('path');const ROOT=path.resolve(__dirname, '..');
const base = path.join(ROOT, 'src') + '/';
let src=fs.readFileSync(base+'i18n.js','utf8')+'\n'+fs.readFileSync(base+'curricula.js','utf8')+'\n'+fs.readFileSync(base+'app.js','utf8');
const el=()=>({innerHTML:'',textContent:'',className:'',style:{},clientWidth:360,classList:{add(){},remove(){}},appendChild(){},remove(){},dataset:{},querySelector:()=>el(),querySelectorAll:()=>[],closest:()=>null,focus(){},offsetWidth:1});
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},createElement:()=>el(),body:{appendChild(){}},onkeydown:null};
global.window={addEventListener(){}};const store={};
global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};
global.navigator={};global.setTimeout=()=>0;
src+="\n;module.exports={itemFromKey,MULT,ADD,mk,dk,ak,sk,H_BUCKETS,K_BUCKETS,as1000Keys,as1000Stage,C_BUCKETS,clockKeys,clockStage,X_BUCKETS,beyondKeys,beyondStage,O_BUCKETS,roundKeys,roundStage,crossesTen,as20Keys,unlockState,seedOpened,rememberUnlocks,trackKeys,newProfile,buildRun,TRACKS,DB,petSVG,rideSVG,PETS,RIDES,ENVS,circuit,route,routeOf,atU,sceneSVG,sceneThumb,E_STAGES,stageKeys,as20Stage,mastery,CURRICULA,poolKeys,poolSize,schoolPool,schoolReady,isPlayable,playableChapters,normalizeChapter,visibleTracks,chapterOf,trackById,chapterJobs,JOBS,jobStage,buildJob,jobItemFromKey,MONEY,fewestCoins,PAINTS,isJobKey,record,I18N,STAR_LV,starred,starCount,seedStars,trackSpec,shopSpec,collectionSpecs,starsAll,tokenSVG,tokenGridSVG,revealSVG,WORLDS,worldById,envOf,seedWorld,ridesOrder,ALL_ITEMS};";
const mod={};new Function('module','exports','require',src)(mod,{},require);
const A=mod.exports;

// 1. overeni vsech typu prikladu
//
// Rozsah odpovedi se uvadi tady, po rodinach, ne jednim stropem pro
// celou hru. Nova rodina si sem dopise radek; kdyz na to zapomene, test
// ji nezna a spadne. Je to jediny zamerny bod, kde se test musi rozsirit
// spolu s kodem.
const RANGE={
  m:[0,100],       // nasobeni v male nasobilce
  d:[1,10],        // deleni v male nasobilce
  a:[2,20],        // scitani do dvaceti vcetne desitkovych spoju
  s:[0,19],        // odcitani do dvaceti
  p:[1,100],       // plus do sta
  n:[0,99],        // minus do sta
  k:[0,1000],      // plus a minus do tisice, vcetne kulateho tisice
  x:[11,999],      // za nasobilkou, soucin i vracene cislo
  o:[10,1000],     // zaokrouhleni, nejmensi desitka az kulaty tisic
  c:[100,2359]     // hodiny, hodina krat sto plus minuty
};
let bad=0,checked=0;
const keys=[];
A.MULT.forEach(f=>{keys.push(A.mk(f.a,f.b)); if(f.a>1) keys.push(A.dk(f.a,f.b));});
A.ADD.forEach(f=>{keys.push(A.ak(f.a,f.b)); keys.push(A.sk(f.a,f.b));});
A.H_BUCKETS.forEach(b=>{keys.push('p'+b.id); keys.push('n'+b.id);});
A.as1000Keys(A.K_BUCKETS.map(b=>b.id)).forEach(k=>keys.push(k));
A.beyondKeys(A.X_BUCKETS.map(b=>b.id)).forEach(k=>keys.push(k));
A.roundKeys(A.O_BUCKETS.map(b=>b.id)).forEach(k=>keys.push(k));
A.clockKeys().forEach(k=>keys.push(k));
const say=(k,m)=>{bad++; if(bad<8) console.log('  !!  '+m+'   ['+k+']');};
for(const k of keys) for(let i=0;i<40;i++){
  const it=A.itemFromKey(k); checked++;
  const r=RANGE[k[0]];
  if(!r){say(k,'rodina nema v testu uvedeny rozsah odpovedi');break;}
  if(!Number.isInteger(it.answer)||it.answer<r[0]||it.answer>r[1]){
    say(k,'odpoved mimo rozsah rodiny: '+it.answer+' neni v '+r.join(' az '));continue;
  }
  // zadani, ktere je aritmeticky radek, se overi spoctenim; obrazkova
  // otazka zadny takovy radek nema a overuje se jen pres check
  if(/[+\-×:]/.test(it.text)){
    const val=eval(it.text.replace(/×/g,'*').replace(/:/g,'/'));
    if(val!==it.answer){say(k,'zadani nesedi s odpovedi: '+it.text+' je '+val+', ma byt '+it.answer);continue;}
  } else if(!it.svg && !it.ask){
    // otazka musi byt sama o sobe srozumitelna: bud je to vypocet, nebo
    // obrazek, nebo je slovy receno, co se ma udelat. Holy pocet bez
    // zadani by dite jen koukalo na cislo a hadalo.
    say(k,'otazka neni ani vypocet, ani obrazek, ani otazka slovy');continue;
  }
  // kazda otazka musi uznat svou odpoved a neuznat sousedni
  if(!it.check(String(it.answer))){say(k,'otazka neuznala vlastni odpoved '+it.answer);continue;}
  if(it.check(String(it.answer+1))){say(k,'otazka uznala i spatnou odpoved '+(it.answer+1));continue;}
  // a musi jit zadat na tom, co nabizi
  if(it.input!=='pad'){say(k,'nezname vstupni zarizeni '+it.input);continue;}
  if(String(it.answer).length>it.maxLen){say(k,'odpoved '+it.answer+' se nevejde do '+it.maxLen+' znaku');}
}
console.log('zkontrolovano prikladu:',checked,'| chyb:',bad);

// 1b. hodiny: cifernik musi souhlasit s odpovedi a odpoved se zapisuje jako cas
let clkBad=0, clkN=0;
const HAND=/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)" stroke="(#182543|#5b4bd6)" stroke-width="[53]"/g;
for(const k of A.clockKeys()) for(let i=0;i<80;i++){
  const it=A.itemFromKey(k); clkN++;
  const h=Math.floor(it.answer/100), m=it.answer%100;
  const okRange = h>=1 && h<=23 && m>=0 && m<=59 && it.disp===h+':'+(m<10?'0':'')+m;
  if(!okRange){clkBad++;if(clkBad<5)console.log('  !!  chyba casu',k,it.answer,it.disp);continue;}
  const noon=!!(A.C_BUCKETS.find(b=>b.id===k)||{}).pm;
  if(noon!==(h>12)){clkBad++;if(clkBad<5)console.log('  !!  spatna pulka dne',k,it.disp);continue;}
  if(noon!==!!it.night){clkBad++;if(clkBad<5)console.log('  !!  mesic nesouhlasi s casem',k,it.disp);continue;}
  // rucicky na ciferniku musi ukazovat presne to, co je spravna odpoved
  const hands=[...it.svg.matchAll(HAND)];
  if(hands.length!==2){clkBad++;if(clkBad<5)console.log('  !!  cifernik nema dve rucicky',k,hands.length);continue;}
  const ang=g=>{const a=(Math.atan2(+g[3]-46,-(+g[4]-54))*180/Math.PI+360)%360; return a;};
  const near=(a,b)=>Math.min(Math.abs(a-b),360-Math.abs(a-b))<1.5;
  if(!near(ang(hands[0]),((h%12)*30+m*0.5)%360)){clkBad++;if(clkBad<5)console.log('  !!  mala rucicka jinde',k,it.disp);continue;}
  if(!near(ang(hands[1]),m*6)){clkBad++;if(clkBad<5)console.log('  !!  velka rucicka jinde',k,it.disp);continue;}
  // cela hodina se smi napsat i bez nul, tedy sedmou hodinu staci jako 7
  if(m===0){
    if(!it.check(String(h))){clkBad++;if(clkBad<5)console.log('  !!  cela hodina neuznala kratky zapis',it.disp,'vs '+h);continue;}
    if(it.check(String(h+1))){clkBad++;if(clkBad<5)console.log('  !!  cela hodina uznala i sousedni hodinu',it.disp,'vs '+(h+1));continue;}
  } else {
    // cas s minutami naopak samotnou hodinu uznat nesmi
    if(it.check(String(h))){clkBad++;if(clkBad<5)console.log('  !!  cas s minutami uznal holou hodinu',it.disp);continue;}
  }
  if(!it.check(String(it.answer))){clkBad++;if(clkBad<5)console.log('  !!  cifernik neuznal vlastni cas',it.disp);}
}
console.log('zkontrolovano ciferniku:',clkN,'| chyb:',clkBad);

// 2. delka a rozmanitost zavodu na vsech tratich
const p=A.newProfile('T'); A.DB.profiles=[p]; A.DB.current=p.id;
for(const t of A.TRACKS){
  const it=A.buildRun(p,t);
  // kbelikovy klic je cela rodina otazek, takze rozmanitost se meri na
  // vygenerovanem zadani, ne na klici
  const face=x=>x.disp||x.text;
  let dup=0; for(let i=1;i<it.length;i++) if(face(it[i])===face(it[i-1])) dup++;
  const uniq=new Set(it.map(face)).size;
  if(dup){console.log('  !!  stejna otazka dvakrat za sebou na trati',t.id,dup+'x');}
  console.log(t.id.padEnd(6), 'otazek', it.length, '| ruznych', uniq, '| za sebou stejne', dup, '|', it.slice(0,4).map(x=>face(x)+(x.kind==='clock'?'':'='+x.answer)).join('  '));
}
// sampionat nesmi zacatecnikovi podstrcit stupen, na ktery jeste nedosel
let mixBad=0;
const mixp=A.newProfile('M'); A.DB.profiles=[mixp]; A.DB.current=mixp.id;
mixp.autoUnlock=false;                                   // vsechno otevrene
const first20=new Set(A.stageKeys(0));
for(const it of A.buildRun(mixp,A.trackById('mix'))){
  if(it.kind==='clock'&&it.key!=='c1'){mixBad++;console.log('  !!  sampionat dal zacatecnikovi cas',it.disp);break;}
  if(/^[as]/.test(it.key)&&!first20.has(it.key)){mixBad++;console.log('  !!  sampionat dal zacatecnikovi',it.text);break;}
  if(/^k/.test(it.key)&&it.key.slice(2)!=='b1'){mixBad++;console.log('  !!  sampionat dal zacatecnikovi krok do tisice',it.text);break;}
}
console.log('sampionat respektuje stupne:',mixBad?'ne':'ano');

// 3. platnost SVG (parovani tagu a NaN)
let svgBad=0;
A.PETS.forEach(x=>[1,2,3].forEach(s=>{const v=A.petSVG(x,s); if(/NaN|undefined/.test(v)){svgBad++;console.log('  !!  SVG problem',x.id,s);}}));
A.RIDES.forEach(x=>{const v=A.rideSVG(x); if(/NaN|undefined/.test(v)){svgBad++;console.log('  !!  SVG problem',x.id);}});
Object.keys(A.ENVS).forEach(e=>{const v=A.sceneSVG('circuit',e,"t1"); if(/NaN|undefined/.test(v)){svgBad++;console.log('  !!  ENV problem',e);}});
console.log('vadnych SVG:',svgBad);

// 4. kurikulum: kazda kapitola s poolem musi dat pouzitelnou zasobu klicu
const VALID=new Set();
A.MULT.forEach(f=>{VALID.add(A.mk(f.a,f.b)); if(f.a>1) VALID.add(A.dk(f.a,f.b));});
A.ADD.forEach(f=>{VALID.add(A.ak(f.a,f.b)); VALID.add(A.sk(f.a,f.b));});
A.H_BUCKETS.forEach(b=>{VALID.add('p'+b.id); VALID.add('n'+b.id);});
A.as1000Keys(A.K_BUCKETS.map(b=>b.id)).forEach(k=>VALID.add(k));
A.beyondKeys(A.X_BUCKETS.map(b=>b.id)).forEach(k=>VALID.add(k));
A.roundKeys(A.O_BUCKETS.map(b=>b.id)).forEach(k=>VALID.add(k));
A.clockKeys().forEach(k=>VALID.add(k));

let curBad=0, chapters=0, playable=0, tiny=0;
for(const c of A.CURRICULA){
  const seen=new Set();
  for(const ch of c.chapters){
    chapters++;
    if(seen.has(ch.n)){curBad++;console.log('  !!  duplicitni cislo kapitoly',c.id,ch.n);}
    seen.add(ch.n);
    if(!ch.name||!ch.src){curBad++;console.log('  !!  kapitola bez nazvu nebo zdroje',c.id,ch.n);}
    const keys=A.poolKeys(ch.pool);
    const jobs=A.chapterJobs(ch);
    if(!ch.pool){ if(keys.length){curBad++;console.log('  !!  prazdny pool neco vratil',c.id,ch.n);} continue; }
    // kapitola smi mit misto prikladu do zavodu zakazku v dilne, ale
    // nesmi mit ani jedno; prazdny pool je vzdycky chyba zapisu
    if(!keys.length && !jobs.length){curBad++;console.log('  !!  pool bez klicu i bez zakazky',c.id,ch.n);continue;}
    if((ch.pool.shop||[]).length!==jobs.length){curBad++;console.log('  !!  kapitola odkazuje na neznamou zakazku',c.id,ch.n,(ch.pool.shop||[]).join(','));continue;}
    for(const k of keys) if(!VALID.has(k)){curBad++;console.log('  !!  neznamy klic',c.id,ch.n,k);break;}
    if(A.poolSize(keys)>=4||jobs.length) playable++; else tiny++;
  }
}
console.log('kurikul:',A.CURRICULA.length,'| kapitol:',chapters,'| hratelnych:',playable,'| prilis malych:',tiny,'| chyb:',curBad);

// 5. zavod podle kapitoly drzi delku a zustava v kapitole
let runBad=0;
for(const c of A.CURRICULA){
  for(const ch of c.chapters){
    const q=A.newProfile('K'); q.curriculum=c.id; q.chapter=ch.n;
    A.DB.profiles=[q]; A.DB.current=q.id;
    if(!A.schoolReady(q)) continue;
    if(!A.visibleTracks(q).some(t=>t.id==='school')){runBad++;console.log('  !!  trat skoly chybi na mape',c.id,ch.n);}
    const pool=new Set(A.schoolPool(q));
    // tvrdy rezim nesmi pustit nic mimo kapitolu
    q.chapterMode='hard';
    const hard=A.buildRun(q,A.trackById('school'));
    if(hard.length!==20){runBad++;console.log('  !!  spatna delka zavodu',c.id,ch.n,hard.length);}
    for(const it of hard) if(!pool.has(it.key)){runBad++;console.log('  !!  tvrdy rezim pustil cizi priklad',c.id,ch.n,it.key);break;}
    // volny rezim musi mit vetsinu z kapitoly
    q.chapterMode='soft';
    const soft=A.buildRun(q,A.trackById('school'));
    const inCh=soft.filter(it=>pool.has(it.key)).length;
    if(inCh < soft.length*0.6){runBad++;console.log('  !!  volny rezim ma malo z kapitoly',c.id,ch.n,inCh+'/'+soft.length);}
  }
}
// bez zvolene ucebnice se trat skoly na mape neobjevi a hra nespadne
const q0=A.newProfile('N'); A.DB.profiles=[q0]; A.DB.current=q0.id;
if(A.schoolReady(q0)){runBad++;console.log('  !!  trat skoly se objevila bez ucebnice');}
if(A.visibleTracks(q0).some(t=>t.id==='school')){runBad++;console.log('  !!  trat skoly je na mape bez ucebnice');}
if(A.buildRun(q0,A.trackById('school')).length!==20){runBad++;console.log('  !!  nouzovy zavod nema 20 otazek');}
console.log('chyb v zavodech podle kapitoly:',runBad);

// 6. stupne prechodu pres desitku pokryji cely obor a radi se od lehciho
let stBad=0;
const all20=new Set();
A.ADD.forEach(f=>{all20.add(A.ak(f.a,f.b)); all20.add(A.sk(f.a,f.b));});
const covered=new Set(); let overlap=0;
A.E_STAGES.forEach((st,i)=>{
  const ks=A.stageKeys(i);
  if(!ks.length){stBad++;console.log('  !!  prazdny stupen',st.id);}
  for(const k of ks){ if(covered.has(k)) overlap++; covered.add(k); }
});
if(overlap){stBad++;console.log('  !!  stupne se prekryvaji o',overlap,'klicu');}
if(covered.size!==all20.size){stBad++;console.log('  !!  stupne nepokryly cely obor',covered.size,'z',all20.size);}
// zacatecnik dostane jen prechod bez desitky
const beg=A.newProfile('Z'); A.DB.profiles=[beg]; A.DB.current=beg.id;
if(A.as20Stage(beg)!==0){stBad++;console.log('  !!  zacatecnik nezacina prvnim stupnem');}
const first=new Set(A.stageKeys(0));
const run0=A.buildRun(beg,A.trackById('a20'));
for(const it of run0) if(!first.has(it.key)){stBad++;console.log('  !!  zacatecnik dostal prechod pres desitku',it.text);break;}
// po zvladnuti prvniho stupne se posune dal a starsi se vraci jako opakovani
A.stageKeys(0).forEach(k=>beg.facts[k]={lv:5,reps:9,ok:9,bad:0,best:900,seen:Date.now()});
if(A.as20Stage(beg)!==1){stBad++;console.log('  !!  po zvladnuti prvniho stupne se neposunul');}
const run1=A.buildRun(beg,A.trackById('a20'));
const inFocus=run1.filter(it=>new Set(A.stageKeys(1)).has(it.key)).length;
if(inFocus<run1.length*0.5){stBad++;console.log('  !!  druhy stupen nenese zavod',inFocus+'/'+run1.length);}
if(inFocus===run1.length){stBad++;console.log('  !!  chybi opakovani drivejsiho uciva');}
console.log('chyb ve stupnich do dvaceti:',stBad);

// 7. neumime-li kapitolu, nesmi jit vybrat, a ulozeny profil se srovna
let selBad=0, offered=0, blocked=0;
for(const c of A.CURRICULA){
  const ok=A.playableChapters(c);
  if(!ok.length){selBad++;console.log('  !!  kurikulum bez jedine hratelne kapitoly',c.id);continue;}
  for(const ch of c.chapters){
    if(A.isPlayable(ch)) offered++; else blocked++;
  }
  // volba ucebnice musi skocit na prvni hratelnou kapitolu, ne na prvni v knize
  const q=A.newProfile('S'); q.curriculum=c.id; q.chapter=ok[0].n;
  A.DB.profiles=[q]; A.DB.current=q.id;
  if(!A.schoolReady(q)){selBad++;console.log('  !!  prvni hratelna kapitola nedela trat',c.id,ok[0].n);}
  // profil ulozeny na nehratelne kapitole se srovna dozadu, nikdy dopredu
  for(const ch of c.chapters){
    if(A.isPlayable(ch)) continue;
    const r=A.newProfile('R'); r.curriculum=c.id; r.chapter=ch.n;
    A.normalizeChapter(r);
    const got=c.chapters.find(x=>x.n===r.chapter);
    if(!A.isPlayable(got)){selBad++;console.log('  !!  srovnani skoncilo na nehratelne kapitole',c.id,ch.n,'->',r.chapter);continue;}
    const earlier=ok.filter(x=>x.n<ch.n);
    const cekano=earlier.length?earlier[earlier.length-1].n:ok[0].n;
    if(r.chapter!==cekano){selBad++;console.log('  !!  spatne srovnani',c.id,ch.n,'->',r.chapter,'cekano',cekano);}
  }
}
// bez kurikula se kapitola vynuluje
const rn=A.newProfile('X'); rn.curriculum='neexistuje'; rn.chapter=5; A.normalizeChapter(rn);
if(rn.chapter!==null){selBad++;console.log('  !!  kapitola prezila zruseni ucebnice');}
console.log('nabizenych kapitol:',offered,'| zamcenych:',blocked,'| chyb:',selBad);

// 8. obor do dvaceti bez prechodu, tedy prvni rocnik
let teenBad=0;
const teens=A.ADD.filter(f=>f.b>10);
if(teens.length!==36){teenBad++;console.log('  !!  spatny pocet desitkovych spoju',teens.length);}
for(const f of teens) if(A.crossesTen(f.a,f.b)){teenBad++;console.log('  !!  desitkovy spoj prechazi desitku',f.a,'+',f.b);break;}
// generator je musi umet vyrobit a odpoved musi sedet
for(const f of teens.slice(0,8)) for(let i=0;i<20;i++){
  for(const k of [A.ak(f.a,f.b), A.sk(f.a,f.b)]){
    const it=A.itemFromKey(k);
    const val=eval(it.text.replace(/×/g,'*'));
    if(val!==it.answer||it.answer<0||it.answer>20){teenBad++;console.log('  !!  spatny spoj do dvaceti',k,it.text,it.answer);break;}
  }
}
// stupne: prvni je do desiti, druhy jsou desitky, teprve pak mosty
const st0=new Set(A.stageKeys(0)), st1=new Set(A.stageKeys(1));
if(!st0.has(A.ak(3,4))||st0.has(A.ak(4,13))){teenBad++;console.log('  !!  prvni stupen neni obor do desiti');}
if(!st1.has(A.ak(4,13))||st1.has(A.ak(8,5))){teenBad++;console.log('  !!  druhy stupen nejsou desitky bez prechodu');}
if(A.E_STAGES.length!==6){teenBad++;console.log('  !!  stupnu neni sest',A.E_STAGES.length);}
// kapitola prvniho rocniku musi dat desitkove spoje a zadny prechod
const ch15=A.CURRICULA.find(c=>c.id==='nns-matysek-1').chapters.find(c=>c.n===15);
const k15=A.poolKeys(ch15.pool);
if(!k15.includes(A.ak(3,11))){teenBad++;console.log('  !!  obor do patnacti nema 11 + 3');}
if(k15.includes(A.ak(7,8))){teenBad++;console.log('  !!  obor do patnacti pustil prechod pres desitku');}
if(k15.some(k=>{const [x,y]=k.slice(1).split('p').map(Number); return x+y>15;})){teenBad++;console.log('  !!  obor do patnacti prelezl patnact');}
// druha trida s prechodem naopak desitkove spoje brat nesmi
const g2=A.CURRICULA.find(c=>c.id==='nns-matysek-2').chapters.find(c=>c.n===4);
const k4=A.poolKeys(g2.pool);
if(k4.some(k=>{const [x,y]=k.slice(1).split('p').map(Number); return !A.crossesTen(x,y);})){
  teenBad++;console.log('  !!  kapitola s prechodem pustila neco bez prechodu');
}
console.log('chyb v oboru do dvaceti bez prechodu:',teenBad);

// 9. jednou otevrena trat uz se nezavre
let opBad=0;
const op=A.newProfile('O');
A.DB.profiles=[op]; A.DB.current=op.id;
A.trackKeys(op,A.trackById('a20')).forEach(k=>op.facts[k]={lv:5,reps:9,ok:9,bad:0,best:900,seen:Date.now()});
A.rememberUnlocks(op);
if(!op.opened.a100){opBad++;console.log('  !!  zvladnuta dvacitka neotevrela stovku');}
op.facts={};                                  // pribylo ucivo, zvladnuti spadlo na nulu
if(!A.unlockState(op,A.trackById('a100')).open){opBad++;console.log('  !!  otevrena trat se zase zavrela');}
op.force.a100=false;                          // rodic ji ale zavrit smi
if(A.unlockState(op,A.trackById('a100')).open){opBad++;console.log('  !!  rodic nemuze zavrit trat');}
// starsi profil bez zaznamu se seedne z toho, kde uz byl
const old={...A.newProfile('S'), trackRuns:{a100:3}};
delete old.opened;
A.seedOpened(old);
if(!old.opened.a100){opBad++;console.log('  !!  odjete zavody trat neotevrely');}
console.log('chyb v pameti odemceni:',opBad);

// 7c. kroky do tisice: kazdy kbelik musi delat to, co slibuje
//
// Generator si kbelik hlida konstrukci, ne orezanim preteceni, takze
// tenhle test je jediny, kdo tvrzeni o kbelicich overuje. Prechod pres
// stovku se pozna na stovkove cislici souctu, presne jako u desitky.
let kBad=0, kN=0;
const parts=it=>{
  const n=it.text.split(/[+-]/).map(s=>Number(s.trim()));
  return it.kind==='add1000' ? {x:n[0], y:n[1]} : {x:n[0]-n[1], y:n[1]};
};
const RULE={
  b1:(x,y)=>x%100===0 && y%100===0,
  b2:(x,y)=>y<10 && (x%10)+y<10,
  b3:(x,y)=>y<10 && (x%10)+y>=10 && Math.floor(x/100)===Math.floor((x+y)/100),
  b4:(x,y)=>y%10===0 && y<100 && Math.floor(x/100)===Math.floor((x+y)/100),
  b5:(x,y)=>y>=10 && y<100 && Math.floor(x/100)===Math.floor((x+y)/100),
  b6:(x,y)=>y>=10 && y<100 && Math.floor(x/100)<Math.floor((x+y)/100)
};
for(const key of A.as1000Keys(A.K_BUCKETS.map(b=>b.id))) for(let i=0;i<60;i++){
  const it=A.itemFromKey(key); kN++;
  const b=key.slice(2), {x,y}=parts(it);
  if(x<0||y<0||x+y>1000){kBad++;if(kBad<6)console.log('  !!  mimo obor do tisice',key,it.text);continue;}
  if(x<100){kBad++;if(kBad<6)console.log('  !!  prvni cislo neni trojciferne',key,it.text);continue;}
  if(!RULE[b](x,y)){kBad++;if(kBad<6)console.log('  !!  kbelik nedela, co slibuje',key,it.text);continue;}
  if(it.maxLen!==4){kBad++;if(kBad<6)console.log('  !!  odpoved do tisice se nevejde do klavesnice',key,it.maxLen);continue;}
  // odcitani je totez sezeni ctene pozpatku, takze vraci prvni scitanec
  if(it.kind==='sub1000'&&it.answer!==x){kBad++;if(kBad<6)console.log('  !!  odcitani neni obracene scitani',key,it.text);}
}
// kulaty tisic musi jit doťukat a musi se nekdy trefit
let hitK=0;
for(let i=0;i<400;i++) if(A.itemFromKey('kpb1').answer===1000) hitK++;
if(!hitK){kBad++;console.log('  !!  cely tisic nikdy nepadne');}
console.log('zkontrolovano do tisice:',kN,'| chyb:',kBad);

// 7d. kroky do tisice se stupnuji stejne jako prechod pres desitku
let kStBad=0;
const tz=A.newProfile('K1'); A.DB.profiles=[tz]; A.DB.current=tz.id;
if(A.as1000Stage(tz)!==0){kStBad++;console.log('  !!  zacatecnik nezacina celymi stovkami');}
const kRun0=A.buildRun(tz,A.trackById('a1000'));
if(kRun0.length!==20){kStBad++;console.log('  !!  spatna delka zavodu do tisice',kRun0.length);}
for(const it of kRun0) if(it.key.slice(2)!=='b1'){kStBad++;console.log('  !!  zacatecnik dostal tezsi krok',it.text);break;}
if(new Set(kRun0.map(x=>x.text)).size<6){kStBad++;console.log('  !!  stovky se malo stridaji',new Set(kRun0.map(x=>x.text)).size);}
A.as1000Keys(['b1']).forEach(k=>tz.facts[k]={lv:5,reps:9,ok:9,bad:0,best:2000,seen:Date.now()});
if(A.as1000Stage(tz)!==1){kStBad++;console.log('  !!  po zvladnuti stovek se neposunul');}
const kRun1=A.buildRun(tz,A.trackById('a1000'));
const kFocus=kRun1.filter(x=>x.key.slice(2)==='b2').length;
if(kFocus<kRun1.length*0.5){kStBad++;console.log('  !!  druhy krok nenese zavod',kFocus+'/'+kRun1.length);}
if(kFocus===kRun1.length){kStBad++;console.log('  !!  chybi opakovani stovek');}
// trat se otevira po stovce, ne driv
const kg=A.newProfile('K2'); A.DB.profiles=[kg]; A.DB.current=kg.id;
if(A.unlockState(kg,A.trackById('a1000')).open){kStBad++;console.log('  !!  tisic je otevreny hned od zacatku');}
A.trackKeys(kg,A.trackById('a100')).forEach(k=>kg.facts[k]={lv:5,reps:9,ok:9,bad:0,best:2000,seen:Date.now()});
if(!A.unlockState(kg,A.trackById('a1000')).open){kStBad++;console.log('  !!  zvladnuta stovka neotevrela tisic');}
console.log('chyb ve stupnich do tisice:',kStBad);

// 7e. za nasobilkou: kazdy kbelik dela to, co slibuje
let xBad=0, xN=0;
const xsay=m=>{xBad++; if(xBad<8) console.log('  !!  '+m);};
for(const b of A.X_BUCKETS){
  for(let i=0;i<300;i++){
    const mi=A.itemFromKey('xm'+b.id), di=A.itemFromKey('xd'+b.id); xN+=2;
    const mm=mi.text.match(/^(\d+) × (\d+)$/);
    if(!mm){xsay('nasobeni nema tvar cislo krat cislo: '+mi.text);break;}
    const x=+mm[1], mul=+mm[2];
    if(mul<2||mul>9){xsay('nasobi se necim, co neni jednociferne: '+mi.text);break;}
    const carries=(x%10)*mul>=10;
    if(b.id==='1'&&(x>99||carries||x*mul>99)){xsay('kbelik 1 ma byt dvojciferny bez prechodu do sta: '+mi.text);break;}
    if(b.id==='2'&&(x>99||!carries||x*mul>99)){xsay('kbelik 2 ma prechazet a zustat do sta: '+mi.text);break;}
    if(b.id==='3'&&(x>99||x*mul<=100)){xsay('kbelik 3 ma byt dvojciferny a prelezt stovku: '+mi.text);break;}
    if(b.id==='4'&&(x<100||carries||Math.floor(x/100)*mul>9||Math.floor(x/10)%10*mul>9)){
      xsay('kbelik 4 ma byt trojciferny bez prechodu: '+mi.text);break;}
    if(x*mul>999){xsay('soucin prelezl tisic: '+mi.text);break;}
    // deleni je totez sezeni ctene pozpatku, tedy deli se jednocifernym
    const dm=di.text.match(/^(\d+) : (\d+)$/);
    if(!dm){xsay('deleni nema tvar cislo deleno cislo: '+di.text);break;}
    if(+dm[2]<2||+dm[2]>9){xsay('deli se necim, co neni jednociferne: '+di.text);break;}
    if(+dm[1]%+dm[2]!==0){xsay('deleni nevychazi beze zbytku: '+di.text);break;}
  }
}
console.log('zkontrolovano za nasobilkou:',xN,'| chyb:',xBad);

// 7f. za nasobilkou se stupnuje a otevira se az po deleni
let xStBad=0;
const tx=A.newProfile('X1'); A.DB.profiles=[tx]; A.DB.current=tx.id;
if(A.beyondStage(tx)!==0){xStBad++;console.log('  !!  zacatecnik nezacina nejlehcim kbelikem');}
const xRun0=A.buildRun(tx,A.trackById('beyond'));
for(const it of xRun0) if(it.key.slice(2)!=='1'){xStBad++;console.log('  !!  zacatecnik dostal tezsi kbelik',it.text);break;}
if(!xRun0.some(it=>it.key[1]==='m')||!xRun0.some(it=>it.key[1]==='d')){
  xStBad++;console.log('  !!  kbelik netrenuje oba smery naraz');}
A.beyondKeys(['1']).forEach(k=>tx.facts[k]={lv:5,reps:9,ok:9,bad:0,best:2000,seen:Date.now()});
if(A.beyondStage(tx)!==1){xStBad++;console.log('  !!  po zvladnuti prvniho kbeliku se neposunul');}
const xRun1=A.buildRun(tx,A.trackById('beyond'));
const xFocus=xRun1.filter(it=>it.key.slice(2)==='2').length;
if(xFocus<xRun1.length*0.5){xStBad++;console.log('  !!  druhy kbelik nenese zavod',xFocus+'/'+xRun1.length);}
if(xFocus===xRun1.length){xStBad++;console.log('  !!  chybi opakovani prvniho kbeliku');}
const xg=A.newProfile('X2'); A.DB.profiles=[xg]; A.DB.current=xg.id;
if(A.unlockState(xg,A.trackById('beyond')).open){xStBad++;console.log('  !!  za nasobilkou je otevrene hned od zacatku');}
A.trackKeys(xg,A.trackById('d1')).forEach(k=>xg.facts[k]={lv:5,reps:9,ok:9,bad:0,best:2000,seen:Date.now()});
if(!A.unlockState(xg,A.trackById('beyond')).open){xStBad++;console.log('  !!  zvladnute deleni neotevrelo trat za nasobilkou');}
console.log('chyb ve stupnich za nasobilkou:',xStBad);

// 7g. zaokrouhlovani: pravidlo, kbelik a to, ze se nezaokrouhluje kulate cislo
let oBad=0, oN=0;
const osay=m=>{oBad++; if(oBad<8) console.log('  !!  '+m);};
for(const b of A.O_BUCKETS){
  for(let i=0;i<300;i++){
    const it=A.itemFromKey('o'+b.id); oN++;
    const n=Number(it.text);
    if(!Number.isInteger(n)){osay('zadanim neni cele cislo: '+it.text);break;}
    if(n<b.lo||n>b.hi){osay('cislo mimo kbelik: '+n+' neni v '+b.lo+' az '+b.hi);break;}
    if(n%b.to===0){osay('zaokrouhluje se uz kulate cislo: '+n+' na '+b.to);break;}
    // ceske pravidlo: petka nahoru
    const want=Math.round(n/b.to)*b.to;
    if(it.answer!==want){osay('spatne zaokrouhleno: '+n+' na '+b.to+' je '+want+', vraceno '+it.answer);break;}
    if(String(it.answer).length>it.maxLen){osay('odpoved se nevejde: '+it.answer);break;}
    if(!it.ask){osay('u zaokrouhlovani chybi, na co se ma zaokrouhlit');break;}
    if(it.rel!=='relRound'){osay('zaokrouhleni se tvari jako presna rovnost');break;}
  }
}
// hranicni pripady musi jit nahoru, at uz jsou v nahodnem vzorku, nebo ne
for(const [n,to,want] of [[45,10,50],[44,10,40],[350,100,400],[349,100,300],[995,10,1000],[950,100,1000]]){
  if(Math.round(n/to)*to!==want){oBad++;console.log('  !!  pravidlo petky nahoru nesedi u '+n);}
}
console.log('zkontrolovano zaokrouhlovani:',oN,'| chyb:',oBad);

// 7h. zaokrouhlovani se stupnuje a otevira se drive nez tisic
let oStBad=0;
const to1=A.newProfile('O1'); A.DB.profiles=[to1]; A.DB.current=to1.id;
if(A.roundStage(to1)!==0){oStBad++;console.log('  !!  zacatecnik nezacina desitkami do sta');}
const oRun0=A.buildRun(to1,A.trackById('round'));
for(const it of oRun0) if(it.key!=='o1'){oStBad++;console.log('  !!  zacatecnik dostal trojciferne',it.text);break;}
if(new Set(oRun0.map(x=>x.text)).size<8){oStBad++;console.log('  !!  cisla se malo stridaji',new Set(oRun0.map(x=>x.text)).size);}
A.roundKeys(['1']).forEach(k=>to1.facts[k]={lv:5,reps:9,ok:9,bad:0,best:2000,seen:Date.now()});
if(A.roundStage(to1)!==1){oStBad++;console.log('  !!  po zvladnuti desitek do sta se neposunul');}
const oRun1=A.buildRun(to1,A.trackById('round'));
const oFocus=oRun1.filter(it=>it.key==='o2').length;
if(oFocus<oRun1.length*0.5){oStBad++;console.log('  !!  druhy kbelik nenese zavod',oFocus+'/'+oRun1.length);}
if(oFocus===oRun1.length){oStBad++;console.log('  !!  chybi opakovani prvniho kbeliku');}
const og=A.newProfile('O2'); A.DB.profiles=[og]; A.DB.current=og.id;
if(A.unlockState(og,A.trackById('round')).open){oStBad++;console.log('  !!  zaokrouhlovani je otevrene hned od zacatku');}
// stovka presne na pul cesty: pul klicu na urovni 1, pul na 2, tedy
// zvladnuti 0,5. Tim se ukaze, ze zaokrouhlovani ma nizsi prah nez tisic
A.trackKeys(og,A.trackById('a100')).forEach((k,i)=>og.facts[k]={lv:i%2?2:1,reps:9,ok:7,bad:2,best:4000,seen:Date.now()});
if(!A.unlockState(og,A.trackById('round')).open){oStBad++;console.log('  !!  rozjeta stovka neotevrela zaokrouhlovani');}
if(A.unlockState(og,A.trackById('a1000')).open){oStBad++;console.log('  !!  zaokrouhlovani se ma otevirat driv nez tisic, ne spolu s nim');}
console.log('chyb ve stupnich zaokrouhlovani:',oStBad);

// 7b. hodiny se stupnuji stejne jako prechod pres desitku
let clStBad=0;
const zeg=A.newProfile('H'); A.DB.profiles=[zeg]; A.DB.current=zeg.id;
if(A.clockStage(zeg)!==0){clStBad++;console.log('  !!  zacatecnik nezacina celymi hodinami');}
const clRun0=A.buildRun(zeg,A.trackById('clock'));
if(clRun0.length!==20){clStBad++;console.log('  !!  spatna delka zavodu s hodinami',clRun0.length);}
for(const it of clRun0) if(it.key!=='c1'){clStBad++;console.log('  !!  zacatecnik dostal jemnejsi cas',it.disp);break;}
if(new Set(clRun0.map(x=>x.disp)).size<6){clStBad++;console.log('  !!  cele hodiny se malo stridaji',new Set(clRun0.map(x=>x.disp)).size);}
zeg.facts.c1={lv:5,reps:9,ok:9,bad:0,best:2000,seen:Date.now()};
if(A.clockStage(zeg)!==1){clStBad++;console.log('  !!  po zvladnuti celych hodin se neposunul');}
const clRun1=A.buildRun(zeg,A.trackById('clock'));
const clFocus=clRun1.filter(x=>x.key==='c2').length;
if(clFocus<clRun1.length*0.5){clStBad++;console.log('  !!  druhy stupen nenese zavod',clFocus+'/'+clRun1.length);}
if(clFocus===clRun1.length){clStBad++;console.log('  !!  chybi opakovani celych hodin');}
// odpoledni cas se objevi az v poslednim kbelicku
for(const it of clRun1) if(it.night){clStBad++;console.log('  !!  vecerni cas prisel prilis brzo',it.disp);break;}
console.log('chyb ve stupnich hodin:',clStBad);

// 11. dilna
//
// Dilna nemeri cas a plati v soucastkach, takze se tu neoveruje nic
// o rychlosti. Overuje se, ze uloha ma reseni, ze sve vlastni reseni
// uzna, a ze klice dilny nemohou spadnout do zavodu.
let shBad=0, shN=0;
// nejmensi pocet minci se overi proti dynamickemu programovani, protoze
// hltavy postup je optimalni jen u nekterych soustav a tahle uloha na tom
// stoji: "zaplat co nejmene mincemi" musi mit jedno spravne cislo
const dp=[0]; for(let a=1;a<=200;a++){ let b=Infinity; for(const c of A.MONEY) if(a>=c) b=Math.min(b,dp[a-c]+1); dp[a]=b; }
for(let a=1;a<=200;a++){
  const g=A.fewestCoins(a);
  if(g.reduce((s,x)=>s+x,0)!==a){shBad++;if(shBad<6)console.log('  !!  drobne nedavaji castku',a);continue;}
  if(g.length!==dp[a]){shBad++;if(shBad<6)console.log('  !!  hltavy postup neni nejmensi',a,g.length,'vs',dp[a]);}
}
const job=A.JOBS[0];
for(const k of job.keys) for(let i=0;i<60;i++){
  const it=A.jobItemFromKey(k); shN++;
  if(it.input!=='coins'){shBad++;if(shBad<6)console.log('  !!  uloha dilny neni na mince',k,it.input);continue;}
  if(!it.solution.length){shBad++;if(shBad<6)console.log('  !!  uloha nema reseni',k);continue;}
  if(it.solution.some(c=>!A.MONEY.includes(c))){shBad++;if(shBad<6)console.log('  !!  reseni pouzilo neexistujici minci',k,it.solution.join('+'));continue;}
  if(!it.check(it.solution)){shBad++;if(shBad<6)console.log('  !!  uloha neuznala vlastni reseni',k,it.solution.join('+'));continue;}
  // prihodit minci navic nesmi projit ani u jedne z uloh
  if(it.check(it.solution.concat([1]))){shBad++;if(shBad<6)console.log('  !!  uloha uznala i minci navic',k);continue;}
  if(it.amount<1){shBad++;if(shBad<6)console.log('  !!  castka je nula nebo zaporna',k,it.amount);}
}
// "co nejmene minci" musi rozliseni castky a poctu minci opravdu delat
const few=A.jobItemFromKey('wm2');
const longWay=[]; for(let i=0;i<few.amount;i++) longWay.push(1);
if(few.check(longWay)){shBad++;console.log('  !!  nejmensi pocet minci prosel i po jedne korune');}
if(!few.near(longWay)){shBad++;console.log('  !!  spravna castka po jedne se nepozna jako tesny miss');}
// vraceni: castka k vraceni je rozdil, ne cena
const chg=A.jobItemFromKey('wm3');
if(!chg.check(A.fewestCoins(chg.amount))){shBad++;console.log('  !!  vraceni neuznalo rozdil');}
console.log('zkontrolovano uloh dilny:',shN,'| chyb:',shBad);

// 11b. zakazka, stupne a oddeleni od zavodu
let jbBad=0;
const jp=A.newProfile('D'); A.DB.profiles=[jp]; A.DB.current=jp.id;
if(jp.parts!==0){jbBad++;console.log('  !!  novy profil nezacina na nule soucastek');}
if(A.jobStage(jp,job)!==0){jbBad++;console.log('  !!  zacatecnik nezacina prvnim krokem');}
const run=A.buildJob(jp,job);
if(run.length!==job.n){jbBad++;console.log('  !!  spatna delka zakazky',run.length);}
for(const it of run) if(it.key!==job.keys[0]){jbBad++;console.log('  !!  zacatecnik dostal tezsi krok',it.key);break;}
// po zvladnuti prvniho kroku se posune a prvni se vraci jako opakovani
jp.facts[job.keys[0]]={lv:5,reps:9,ok:9,bad:0,best:null,seen:Date.now()};
if(A.jobStage(jp,job)!==1){jbBad++;console.log('  !!  po zvladnuti prvniho kroku se neposunul');}
const run2=A.buildJob(jp,job);
const foc=run2.filter(it=>it.key===job.keys[1]).length;
if(foc<run2.length*0.5){jbBad++;console.log('  !!  druhy krok nenese zakazku',foc+'/'+run2.length);}
if(foc===run2.length){jbBad++;console.log('  !!  chybi opakovani prvniho kroku');}
// uloha dilny se nesmi objevit v zavode, ani na trati "co ti nejde"
if(!job.keys.every(A.isJobKey)){jbBad++;console.log('  !!  klic dilny nema svou hlavicku');}
for(const tr of A.TRACKS) for(const it of A.buildRun(jp,tr))
  if(A.isJobKey(it.key)){jbBad++;console.log('  !!  uloha dilny se dostala do zavodu na trati',tr.id);break;}
// cas se v dilne nemeri, takze nesmi zkreslit prumernou dobu odpovedi
const tp=A.newProfile('C'); A.DB.profiles=[tp]; A.DB.current=tp.id;
A.record(tp,{key:'wm1',kind:'money'},true,null);
if(tp.msN!==0){jbBad++;console.log('  !!  dilna zapocitala cas do prumeru');}
if(tp.totalAns!==1||tp.totalOk!==1){jbBad++;console.log('  !!  dilna se nezapocitala do uspesnosti');}
if(tp.facts.wm1.lv!==1){jbBad++;console.log('  !!  spravna odpoved v dilne neposunula uroven',tp.facts.wm1.lv);}
console.log('chyb v zakazkach dilny:',jbBad);

// 12. sbirka vazana na Leitnerovu krabicku
//
// Misto ve sbirce se rozsvecuje na urovni ctyri a uz nikdy nezhasne.
// Zhasinajici sbirka by trestala presne za to, na cem cela hra stoji,
// tedy ze se zapomina a opakuje, takze to nejde dopocitat z krabicky
// a je na to vlastni pole v profilu. Tenhle okruh hlida obe strany
// pravidla, a k tomu, ze se na dilnu nezapomnelo.
let stBad2=0;
const sp=A.newProfile('SB'); A.DB.profiles=[sp]; A.DB.current=sp.id;
const rychle=(key,kind)=>A.record(sp,{key,kind:kind||'mult'},true,300);
const kl=A.mk(7,8);
for(let i=0;i<3;i++) rychle(kl);
if(sp.facts[kl].lv!==3){stBad2++;console.log('  !!  tri rychle odpovedi nedaly uroven 3',sp.facts[kl].lv);}
if(A.starred(sp,kl)){stBad2++;console.log('  !!  hvezda se rozsvitila uz pod urovni ctyri');}
rychle(kl);
if(sp.facts[kl].lv!==A.STAR_LV){stBad2++;console.log('  !!  ctvrta rychla odpoved nedala uroven ctyri',sp.facts[kl].lv);}
if(!A.starred(sp,kl)){stBad2++;console.log('  !!  uroven ctyri hvezdu nerozsvitila');}
// uroven spadne, hvezda zustava
A.record(sp,{key:kl,kind:'mult'},false,3000);
if(sp.facts[kl].lv>=A.STAR_LV){stBad2++;console.log('  !!  chyba nesrazila uroven',sp.facts[kl].lv);}
if(!A.starred(sp,kl)){stBad2++;console.log('  !!  hvezda zhasla, kdyz uroven spadla');}
// dilna plati bez mereni casu a hvezdu rozsvitit musi taky
for(let i=0;i<4;i++) A.record(sp,{key:'wm1',kind:'money'},true,null);
if(!A.starred(sp,'wm1')){stBad2++;console.log('  !!  klic dilny hvezdu nerozsvitil');}
// velikost sbirky trati je pocet jejich prikladu; dilna zadna trat neni,
// takze si velikost rekne sama
for(const tr of A.TRACKS){
  const spec=A.trackSpec(sp,tr);
  if(tr.op==='mix'||tr.op==='weak'||tr.op==='school'){
    if(spec){stBad2++;console.log('  !!  trat bez vlastniho uciva ma sbirku',tr.id);}
    continue;
  }
  if(!spec){stBad2++;console.log('  !!  trat nema sbirku',tr.id);continue;}
  if(spec.keys.length!==A.trackKeys(sp,tr).length){stBad2++;console.log('  !!  sbirka neni velka jako trat',tr.id);}
}
if(!A.collectionSpecs(sp).some(s=>s.keys.indexOf('wm1')>=0)){
  stBad2++;console.log('  !!  dilna ve sbirce chybi');
}
if(A.starCount(sp,[kl,'wm1',A.mk(2,3)])!==2){stBad2++;console.log('  !!  spatne se pocitaji rozsvicena mista');}
if(A.starsAll(sp)<2){stBad2++;console.log('  !!  celkovy pocet na mape nesedi',A.starsAll(sp));}
// starsi profil bez pole se dopocita z krabicky, tedy z toho, co umi ted
const sd=A.newProfile('SD');
sd.facts={m2x3:{lv:5,reps:9,ok:9,bad:0,best:900,seen:1},m4x5:{lv:4,reps:8,ok:7,bad:1,best:900,seen:1},
          m6x7:{lv:3,reps:6,ok:5,bad:1,best:2600,seen:1},wm3:{lv:4,reps:7,ok:6,bad:1,best:null,seen:1}};
delete sd.stars;
A.seedStars(sd);
if(!sd.stars.m2x3||!sd.stars.m4x5||!sd.stars.wm3){stBad2++;console.log('  !!  seedStars nedopocital hvezdy z krabicky');}
if(sd.stars.m6x7){stBad2++;console.log('  !!  seedStars rozsvitil i priklad pod urovni ctyri');}
// kresba: mrizka ma tolik mist, kolik ma sbirka klicu
const spT1=A.trackSpec(sd,A.trackById('t1'));
const grid=A.tokenGridSVG(sd,spT1);
const mist=(grid.match(/<g transform=/g)||[]).length;
if(mist!==spT1.keys.length){stBad2++;console.log('  !!  mrizka nema tolik mist, kolik ma sbirka',mist,'vs',spT1.keys.length);}
if(/NaN|undefined/.test(grid)){stBad2++;console.log('  !!  vadne SVG sbirky');}
for(const kind of ['flower','leaf','stone','crystal','shell','drop','cog','star'])
  for(const f of [true,false]){
    const v=A.tokenSVG(kind,f,{c1:'#123456',c2:'#654321'});
    if(/NaN|undefined/.test(v)){stBad2++;console.log('  !!  vadny tvar sbirky',kind);}
  }
console.log('chyb ve sbirce:',stBad2);

// 12b. kruh nad pultem v dilne
//
// Odkryty dil se uvnitr zakazky uz nezakryje, ani po chybe, a opravena
// uloha odkryva taky, jinak by se z kruhu stalo meridlo bezchybnosti
// a dilna by zacala hodnotit vykon.
let rvBad=0;
const cover=v=>(v.match(/ d="M 50 50 /g)||[]).length;
const pic=A.rideSVG(A.RIDES[0]);
for(let done=0;done<=6;done++){
  const v=A.revealSVG(pic,done,6);
  if(cover(v)!==6-done){rvBad++;console.log('  !!  spatny pocet zakrytych vysecí',done,cover(v));}
  if(/NaN|undefined/.test(v)){rvBad++;console.log('  !!  vadne SVG kruhu',done);}
}
if(cover(A.revealSVG(pic,9,6))!==0){rvBad++;console.log('  !!  vic vyresenych nez dilu kruh rozbilo');}
if(cover(A.revealSVG(pic,-1,6))!==6){rvBad++;console.log('  !!  zaporny pocet kruh rozbil');}
console.log('chyb v kruhu dilny:',rvBad);

// 13. svety
//
// Svet je jina kabat teze hry, nikdy druha hra. Smi menit krajinu,
// poradi nabizenych jezdcu a hrstku slov. Nesmi sahnout na ucivo, na
// obtiznost, na odemykani ani na rekordy, a nesmi ditěti nic vzit.
let wBad=0;
const wsay=m=>{wBad++; if(wBad<10) console.log('  !!  '+m);};
// kazdy svet krome okruhu ma vlastni prostredi pro kazdou trat
for(const w of A.WORLDS){
  const seen=new Set();
  for(const tr of A.TRACKS){
    const e=A.envOf({world:w.id}, tr);
    if(!A.ENVS[e]){wsay('svet '+w.id+' odkazuje na nezname prostredi '+e+' u trati '+tr.id);continue;}
    if(w.id!=='circuit' && e===tr.env) wsay('svet '+w.id+' nechal trati '+tr.id+' puvodni krajinu');
    if(seen.has(e)) wsay('svet '+w.id+' dal dvema tratim tutez krajinu: '+e);
    seen.add(e);
  }
}
// zadna paleta nezustala nepouzita, tedy zadny preklep v mapovani
const used=new Set(A.TRACKS.map(tr=>tr.env));
for(const w of A.WORLDS) for(const tr of A.TRACKS) used.add(A.envOf({world:w.id}, tr));
const zbyle=Object.keys(A.ENVS).filter(k=>!used.has(k));
if(zbyle.length) wsay('nepouzite palety: '+zbyle.join(','));
// kazda paleta ma ctyri barvy a rika, co se v ni sbira
for(const k of Object.keys(A.ENVS)){
  const e=A.ENVS[k];
  for(const c of ['hill1','hill2','dec','dec2'])
    if(!/^#[0-9a-f]{6}$/i.test(e[c]||'')) wsay('paleta '+k+' nema barvu '+c+': '+e[c]);
  if(!e.tok) wsay('paleta '+k+' nerika, co se v ni sbira');
  if(/NaN|undefined/.test(A.sceneThumb('circuit',k,'t1',.5))) wsay('vadny nahled okruhu v prostredi '+k);
}
// neznamy svet spadne na okruh, at uz z ulozeneho profilu, nebo preklepem
const sw={world:'neexistuje'}; A.seedWorld(sw);
if(sw.world!=='circuit') wsay('neznamy svet se nesrovnal na okruh');
const sw2={}; A.seedWorld(sw2);
if(sw2.world!=='circuit') wsay('profil bez sveta nedostal okruh');
if(A.envOf({world:'neexistuje'}, A.trackById('t1'))!=='meadow') wsay('neznamy svet nekresli okruh');
// prepnuti sveta nesmi hnout ucivem, odemykanim ani velikosti sbirky
const wp=A.newProfile('W'); A.DB.profiles=[wp]; A.DB.current=wp.id;
A.trackKeys(wp,A.trackById('a20')).forEach(k=>wp.facts[k]={lv:5,reps:9,ok:9,bad:0,best:900,seen:Date.now()});
wp.best={t1:{dist:118,hist:[],n0:20}}; wp.done={t1:3}; wp.trackRuns={t1:4};
const snap=id=>{
  wp.world=id;
  return JSON.stringify({
    keys: A.TRACKS.map(tr=>A.trackKeys(wp,tr)),
    open: A.TRACKS.map(tr=>A.unlockState(wp,tr).open),
    coll: A.TRACKS.map(tr=>{const s=A.trackSpec(wp,tr); return s?s.keys:null;}),
    best: wp.best, done: wp.done
  });
};
const zaklad=snap('circuit');
for(const w of A.WORLDS) if(snap(w.id)!==zaklad) wsay('svet '+w.id+' zmenil ucivo, odemceni nebo rekordy');
// zavod v jinem svete bere tytez klice
wp.world='deep';
const deepRun=A.buildRun(wp,A.trackById('t1'));
const t1keys=new Set(A.trackKeys(wp,A.trackById('t1')));
for(const it of deepRun) if(!t1keys.has(it.key)){wsay('svet podstrcil do zavodu cizi priklad '+it.key);break;}
// nabidka jezdcu se jen radi, nikdy nefiltruje
for(const w of A.WORLDS){
  const rp={world:w.id};
  const ord=A.ridesOrder(rp, A.ALL_ITEMS);
  if(ord.length!==A.ALL_ITEMS.length) wsay('svet '+w.id+' ubral jezdce: '+ord.length+' z '+A.ALL_ITEMS.length);
  if(new Set(ord.map(x=>x.id)).size!==A.ALL_ITEMS.length) wsay('svet '+w.id+' jezdce zdvojil');
  for(const it of A.ALL_ITEMS) if(!ord.some(x=>x.id===it.id)) {wsay('svet '+w.id+' zapomnel jezdce '+it.id);break;}
  const prvni=worldById2(w.id).rides[0];
  if(ord[0].id!==prvni) wsay('svet '+w.id+' nedal sve jezdce dopredu, prvni je '+ord[0].id);
}
function worldById2(id){ return A.WORLDS.find(w=>w.id===id); }
// jezdec, ktereho dite vlastni, jde vybrat v kazdem svete
const own=['ri_ufo','pet_noc','ri_auto'];
for(const w of A.WORLDS){
  const ord=A.ridesOrder({world:w.id}, A.ALL_ITEMS.filter(it=>own.includes(it.id)));
  if(ord.length!==own.length) wsay('svet '+w.id+' schoval koupeneho jezdce');
}
console.log('svetu:',A.WORLDS.length,'| palet:',Object.keys(A.ENVS).length,'| chyb:',wBad);

// 13b. tvar cesty
//
// Svet nemeni jen barvy, ale i to, kudy se jde: okruh je uzavrena smycka,
// ostatni svety jsou cesta z jedne strany na druhou, zakoncena cilem.
// Hlida se hlavne to, co by rozbilo pohyb: cesta musi mit delku, musi
// zacinat a koncit tam, kde ma, a musi byt pro kazdou trat jina, jinak
// jsou nahledy na mape k nicemu.
let rBad=0;
const rsay=m=>{rBad++; if(rBad<10) console.log('  !!  '+m);};
const vsechnyTrati=A.TRACKS.map(t=>t.id);
for(const w of A.WORLDS){
  const tvary=new Set(), delky=[];
  for(const id of vsechnyTrati){
    const r=A.route(w.id,id);
    if(!(r.total>80)){rsay('cesta '+w.id+'/'+id+' nema delku: '+r.total);continue;}
    if(r.samples.length<20){rsay('cesta '+w.id+'/'+id+' ma prilis malo bodu');continue;}
    // krajni body musi sedet s tim, co vraci atU
    const a=A.atU(r,0), b=A.atU(r,1);
    const konec=r.samples[r.samples.length-1];
    if(Math.hypot(b.x-konec.x,b.y-konec.y)>1){rsay('konec cesty nesedi se vzorky '+w.id+'/'+id);continue;}
    // vsechno se musi vejit do sceny, jinak by zavodnik vyjel z obrazku
    for(const s of r.samples) if(s.x<0||s.x>400||s.y<0||s.y>205){
      rsay('cesta '+w.id+'/'+id+' vyjizdi ze sceny');break;}
    if(w.id==='circuit'){
      if(!r.closed) rsay('okruh prestal byt uzavreny');
      if(Math.hypot(a.x-b.x,a.y-b.y)>1) rsay('okruh nekonci tam, kde zacal');
      if(r.stops.length) rsay('okruh ma mit cil ve startu, ne zastavky');
    } else {
      if(r.closed) rsay('cesta ve svete '+w.id+' se uzavrela do smycky');
      if(b.x-a.x<180) rsay('cesta ve svete '+w.id+'/'+id+' nevede na druhou stranu');
      if(r.stops.length<6) rsay('cesta '+w.id+'/'+id+' ma malo zastavek: '+r.stops.length);
      // posledni zastavka je cil a nesmi ji zaclanet predposledni
      const st=r.stops, mezera=st[st.length-1].x-st[st.length-2].x;
      if(mezera<46) rsay('cil ve svete '+w.id+'/'+id+' stoji na posledni zastavce: '+mezera.toFixed(0));
      if(w.id==='sky' && b.y>=a.y) rsay('obloha nestoupa vzhuru');
      if(w.id==='deep' && b.y<=a.y) rsay('hlubina neklesa dolu');
    }
    tvary.add(r.d);
    const ys=r.samples.map(s=>s.y);
    delky.push({vyska:Math.max(...ys)-Math.min(...ys), zastavek:r.stops.length});
  }
  // patnact trati ve stejnem svete nesmi vypadat stejne, jinak nahled na
  // mape nerika, na kterou trat dite klepe. Delka cesty je na to spatne
  // meritko, protoze vsechny vedou pres celou scenu; pozna se to na tom,
  // jak vysoko se cesta vlni a kolik ma zastavek
  if(tvary.size!==vsechnyTrati.length) rsay('svet '+w.id+' ma jen '+tvary.size+' ruznych tvaru z '+vsechnyTrati.length);
  const vysky=delky.map(x=>x.vyska), rozptyl=Math.max(...vysky)-Math.min(...vysky);
  if(rozptyl<25) rsay('cesty ve svete '+w.id+' se vlni skoro stejne, rozptyl '+rozptyl.toFixed(0));
  if(w.id!=='circuit' && new Set(delky.map(x=>x.zastavek)).size<3)
    rsay('cesty ve svete '+w.id+' maji porad stejny pocet zastavek');
  // dvakrat po sobe musi vyjit tataz cesta, jinak by se trat menila pod rukama
  if(A.route(w.id,'t1').d!==A.route(w.id,'t1').d) rsay('cesta ve svete '+w.id+' neni pokazde stejna');
}
// tvar se lisi i mezi svety, ne jen barvou
if(A.route('sky','t1').d===A.route('deep','t1').d) rsay('obloha a hlubina maji tutez cestu');
if(A.route('circuit','t1').d===A.route('trail','t1').d) rsay('okruh a stezka maji tutez cestu');
// scena kazdeho sveta musi mit to, co svetu slibuje
const scena=(w,id)=>A.sceneSVG(w,A.envOf({world:w},A.trackById(id)),id,{prog:.5});
if(!/id="trail"/.test(scena('sky','t1'))) rsay('scene chybi cara postupu, po ktere se hybe zavodnik');
if(!/id="circuit"/.test(scena('deep','t1'))) rsay('scene chybi id, podle ktereho se rozsvecuji znacky');
if(/id="circuit"/.test(A.sceneThumb('deep','dp_shallow','t1',.4))) rsay('nahled si bere id sceny, budou dve stejna v dokumentu');
for(const [w,znak] of [['sky','<circle cx="52" cy="36"'],['deep','stroke="#18253f"']]){
  // obloha ma slunce, hlubina rybicky s okem
  if(w==='sky' && !scena(w,'t1').includes(znak)) rsay('obloze chybi slunce');
}
if(!/f0c063|8a5a2b|a76f36/.test(scena('deep','t1'))) rsay('v hlubine chybi truhla na konci');
if(!scena('sky','t1').includes('#ff6b6b')) rsay('na obloze chybi duhova brana nebo start');
console.log('zkontrolovano cest:',A.WORLDS.length*vsechnyTrati.length,'| chyb:',rBad);

// 11c. kazda zakazka a kazdy nater ma jmeno ve vsech trech jazycich
let trBad=0;
for(const l of ['cs','en','de']){
  for(const j of A.JOBS) for(const k of ['job_'+j.id, 'job_'+j.id+'s'])
    if(!A.I18N[l][k]){trBad++;console.log('  !!  chybi preklad',l,k);}
  for(const pa of A.PAINTS) if(!A.I18N[l][pa.id]){trBad++;console.log('  !!  chybi jmeno nateru',l,pa.id);}
}
// nater nesmi menit nic krome barev, takze nema zadnou dalsi vlastnost
for(const pa of A.PAINTS){
  const extra=Object.keys(pa).filter(k=>!['id','c1','c2','cost'].includes(k));
  if(extra.length){trBad++;console.log('  !!  nater ma vlastnost navic',pa.id,extra.join(','));}
}
console.log('chyb v prekladech dilny:',trBad);
