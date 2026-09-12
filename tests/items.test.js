const fs=require('fs');const path=require('path');const ROOT=path.resolve(__dirname, '..');
const base = path.join(ROOT, 'src') + '/';
let src=fs.readFileSync(base+'i18n.js','utf8')+'\n'+fs.readFileSync(base+'curricula.js','utf8')+'\n'+fs.readFileSync(base+'app.js','utf8');
const el=()=>({innerHTML:'',textContent:'',className:'',style:{},clientWidth:360,classList:{add(){},remove(){}},appendChild(){},remove(){},dataset:{},querySelector:()=>el(),querySelectorAll:()=>[],closest:()=>null,focus(){},offsetWidth:1});
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},createElement:()=>el(),body:{appendChild(){}},onkeydown:null};
global.window={addEventListener(){}};const store={};
global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};
global.navigator={};global.setTimeout=()=>0;
src+="\n;module.exports={itemFromKey,MULT,ADD,mk,dk,ak,sk,H_BUCKETS,K_BUCKETS,as1000Keys,as1000Stage,C_BUCKETS,clockKeys,clockStage,crossesTen,as20Keys,unlockState,seedOpened,rememberUnlocks,trackKeys,newProfile,buildRun,TRACKS,DB,petSVG,rideSVG,PETS,RIDES,ENVS,circuit,atU,circuitThumb,circuitSVG,E_STAGES,stageKeys,as20Stage,mastery,CURRICULA,poolKeys,poolSize,schoolPool,schoolReady,isPlayable,playableChapters,normalizeChapter,visibleTracks,chapterOf,trackById};";
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
  c:[100,2359]     // hodiny, hodina krat sto plus minuty
};
let bad=0,checked=0;
const keys=[];
A.MULT.forEach(f=>{keys.push(A.mk(f.a,f.b)); if(f.a>1) keys.push(A.dk(f.a,f.b));});
A.ADD.forEach(f=>{keys.push(A.ak(f.a,f.b)); keys.push(A.sk(f.a,f.b));});
A.H_BUCKETS.forEach(b=>{keys.push('p'+b.id); keys.push('n'+b.id);});
A.as1000Keys(A.K_BUCKETS.map(b=>b.id)).forEach(k=>keys.push(k));
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
  if(/^[\d\s+\-×:]+$/.test(it.text)){
    const val=eval(it.text.replace(/×/g,'*').replace(/:/g,'/'));
    if(val!==it.answer){say(k,'zadani nesedi s odpovedi: '+it.text+' je '+val+', ma byt '+it.answer);continue;}
  } else if(!it.svg){
    say(k,'otazka neni ani vypocet, ani obrazek');continue;
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
  if(!okRange){clkBad++;if(clkBad<5)console.log('CHYBA casu',k,it.answer,it.disp);continue;}
  const noon=!!(A.C_BUCKETS.find(b=>b.id===k)||{}).pm;
  if(noon!==(h>12)){clkBad++;if(clkBad<5)console.log('spatna pulka dne',k,it.disp);continue;}
  if(noon!==!!it.night){clkBad++;if(clkBad<5)console.log('mesic nesouhlasi s casem',k,it.disp);continue;}
  // rucicky na ciferniku musi ukazovat presne to, co je spravna odpoved
  const hands=[...it.svg.matchAll(HAND)];
  if(hands.length!==2){clkBad++;if(clkBad<5)console.log('cifernik nema dve rucicky',k,hands.length);continue;}
  const ang=g=>{const a=(Math.atan2(+g[3]-46,-(+g[4]-54))*180/Math.PI+360)%360; return a;};
  const near=(a,b)=>Math.min(Math.abs(a-b),360-Math.abs(a-b))<1.5;
  if(!near(ang(hands[0]),((h%12)*30+m*0.5)%360)){clkBad++;if(clkBad<5)console.log('mala rucicka jinde',k,it.disp);continue;}
  if(!near(ang(hands[1]),m*6)){clkBad++;if(clkBad<5)console.log('velka rucicka jinde',k,it.disp);continue;}
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
A.PETS.forEach(x=>[1,2,3].forEach(s=>{const v=A.petSVG(x,s); if(/NaN|undefined/.test(v)){svgBad++;console.log('SVG problem',x.id,s);}}));
A.RIDES.forEach(x=>{const v=A.rideSVG(x); if(/NaN|undefined/.test(v)){svgBad++;console.log('SVG problem',x.id);}});
Object.keys(A.ENVS).forEach(e=>{const v=A.circuitSVG(e,"t1"); if(/NaN|undefined/.test(v)){svgBad++;console.log('ENV problem',e);}});
console.log('vadnych SVG:',svgBad);

// 4. kurikulum: kazda kapitola s poolem musi dat pouzitelnou zasobu klicu
const VALID=new Set();
A.MULT.forEach(f=>{VALID.add(A.mk(f.a,f.b)); if(f.a>1) VALID.add(A.dk(f.a,f.b));});
A.ADD.forEach(f=>{VALID.add(A.ak(f.a,f.b)); VALID.add(A.sk(f.a,f.b));});
A.H_BUCKETS.forEach(b=>{VALID.add('p'+b.id); VALID.add('n'+b.id);});
A.as1000Keys(A.K_BUCKETS.map(b=>b.id)).forEach(k=>VALID.add(k));
A.clockKeys().forEach(k=>VALID.add(k));

let curBad=0, chapters=0, playable=0, tiny=0;
for(const c of A.CURRICULA){
  const seen=new Set();
  for(const ch of c.chapters){
    chapters++;
    if(seen.has(ch.n)){curBad++;console.log('duplicitni cislo kapitoly',c.id,ch.n);}
    seen.add(ch.n);
    if(!ch.name||!ch.src){curBad++;console.log('kapitola bez nazvu nebo zdroje',c.id,ch.n);}
    const keys=A.poolKeys(ch.pool);
    if(!ch.pool){ if(keys.length){curBad++;console.log('prazdny pool neco vratil',c.id,ch.n);} continue; }
    if(!keys.length){curBad++;console.log('pool bez klicu',c.id,ch.n);continue;}
    for(const k of keys) if(!VALID.has(k)){curBad++;console.log('neznamy klic',c.id,ch.n,k);break;}
    if(A.poolSize(keys)>=4) playable++; else tiny++;
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
    if(!A.visibleTracks(q).some(t=>t.id==='school')){runBad++;console.log('trat skoly chybi na mape',c.id,ch.n);}
    const pool=new Set(A.schoolPool(q));
    // tvrdy rezim nesmi pustit nic mimo kapitolu
    q.chapterMode='hard';
    const hard=A.buildRun(q,A.trackById('school'));
    if(hard.length!==20){runBad++;console.log('spatna delka zavodu',c.id,ch.n,hard.length);}
    for(const it of hard) if(!pool.has(it.key)){runBad++;console.log('tvrdy rezim pustil cizi priklad',c.id,ch.n,it.key);break;}
    // volny rezim musi mit vetsinu z kapitoly
    q.chapterMode='soft';
    const soft=A.buildRun(q,A.trackById('school'));
    const inCh=soft.filter(it=>pool.has(it.key)).length;
    if(inCh < soft.length*0.6){runBad++;console.log('volny rezim ma malo z kapitoly',c.id,ch.n,inCh+'/'+soft.length);}
  }
}
// bez zvolene ucebnice se trat skoly na mape neobjevi a hra nespadne
const q0=A.newProfile('N'); A.DB.profiles=[q0]; A.DB.current=q0.id;
if(A.schoolReady(q0)){runBad++;console.log('trat skoly se objevila bez ucebnice');}
if(A.visibleTracks(q0).some(t=>t.id==='school')){runBad++;console.log('trat skoly je na mape bez ucebnice');}
if(A.buildRun(q0,A.trackById('school')).length!==20){runBad++;console.log('nouzovy zavod nema 20 otazek');}
console.log('chyb v zavodech podle kapitoly:',runBad);

// 6. stupne prechodu pres desitku pokryji cely obor a radi se od lehciho
let stBad=0;
const all20=new Set();
A.ADD.forEach(f=>{all20.add(A.ak(f.a,f.b)); all20.add(A.sk(f.a,f.b));});
const covered=new Set(); let overlap=0;
A.E_STAGES.forEach((st,i)=>{
  const ks=A.stageKeys(i);
  if(!ks.length){stBad++;console.log('prazdny stupen',st.id);}
  for(const k of ks){ if(covered.has(k)) overlap++; covered.add(k); }
});
if(overlap){stBad++;console.log('stupne se prekryvaji o',overlap,'klicu');}
if(covered.size!==all20.size){stBad++;console.log('stupne nepokryly cely obor',covered.size,'z',all20.size);}
// zacatecnik dostane jen prechod bez desitky
const beg=A.newProfile('Z'); A.DB.profiles=[beg]; A.DB.current=beg.id;
if(A.as20Stage(beg)!==0){stBad++;console.log('zacatecnik nezacina prvnim stupnem');}
const first=new Set(A.stageKeys(0));
const run0=A.buildRun(beg,A.trackById('a20'));
for(const it of run0) if(!first.has(it.key)){stBad++;console.log('zacatecnik dostal prechod pres desitku',it.text);break;}
// po zvladnuti prvniho stupne se posune dal a starsi se vraci jako opakovani
A.stageKeys(0).forEach(k=>beg.facts[k]={lv:5,reps:9,ok:9,bad:0,best:900,seen:Date.now()});
if(A.as20Stage(beg)!==1){stBad++;console.log('po zvladnuti prvniho stupne se neposunul');}
const run1=A.buildRun(beg,A.trackById('a20'));
const inFocus=run1.filter(it=>new Set(A.stageKeys(1)).has(it.key)).length;
if(inFocus<run1.length*0.5){stBad++;console.log('druhy stupen nenese zavod',inFocus+'/'+run1.length);}
if(inFocus===run1.length){stBad++;console.log('chybi opakovani drivejsiho uciva');}
console.log('chyb ve stupnich do dvaceti:',stBad);

// 7. neumime-li kapitolu, nesmi jit vybrat, a ulozeny profil se srovna
let selBad=0, offered=0, blocked=0;
for(const c of A.CURRICULA){
  const ok=A.playableChapters(c);
  if(!ok.length){selBad++;console.log('kurikulum bez jedine hratelne kapitoly',c.id);continue;}
  for(const ch of c.chapters){
    if(A.isPlayable(ch)) offered++; else blocked++;
  }
  // volba ucebnice musi skocit na prvni hratelnou kapitolu, ne na prvni v knize
  const q=A.newProfile('S'); q.curriculum=c.id; q.chapter=ok[0].n;
  A.DB.profiles=[q]; A.DB.current=q.id;
  if(!A.schoolReady(q)){selBad++;console.log('prvni hratelna kapitola nedela trat',c.id,ok[0].n);}
  // profil ulozeny na nehratelne kapitole se srovna dozadu, nikdy dopredu
  for(const ch of c.chapters){
    if(A.isPlayable(ch)) continue;
    const r=A.newProfile('R'); r.curriculum=c.id; r.chapter=ch.n;
    A.normalizeChapter(r);
    const got=c.chapters.find(x=>x.n===r.chapter);
    if(!A.isPlayable(got)){selBad++;console.log('srovnani skoncilo na nehratelne kapitole',c.id,ch.n,'->',r.chapter);continue;}
    const earlier=ok.filter(x=>x.n<ch.n);
    const cekano=earlier.length?earlier[earlier.length-1].n:ok[0].n;
    if(r.chapter!==cekano){selBad++;console.log('spatne srovnani',c.id,ch.n,'->',r.chapter,'cekano',cekano);}
  }
}
// bez kurikula se kapitola vynuluje
const rn=A.newProfile('X'); rn.curriculum='neexistuje'; rn.chapter=5; A.normalizeChapter(rn);
if(rn.chapter!==null){selBad++;console.log('kapitola prezila zruseni ucebnice');}
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

// 7b. hodiny se stupnuji stejne jako prechod pres desitku
let clStBad=0;
const zeg=A.newProfile('H'); A.DB.profiles=[zeg]; A.DB.current=zeg.id;
if(A.clockStage(zeg)!==0){clStBad++;console.log('zacatecnik nezacina celymi hodinami');}
const clRun0=A.buildRun(zeg,A.trackById('clock'));
if(clRun0.length!==20){clStBad++;console.log('spatna delka zavodu s hodinami',clRun0.length);}
for(const it of clRun0) if(it.key!=='c1'){clStBad++;console.log('zacatecnik dostal jemnejsi cas',it.disp);break;}
if(new Set(clRun0.map(x=>x.disp)).size<6){clStBad++;console.log('cele hodiny se malo stridaji',new Set(clRun0.map(x=>x.disp)).size);}
zeg.facts.c1={lv:5,reps:9,ok:9,bad:0,best:2000,seen:Date.now()};
if(A.clockStage(zeg)!==1){clStBad++;console.log('po zvladnuti celych hodin se neposunul');}
const clRun1=A.buildRun(zeg,A.trackById('clock'));
const clFocus=clRun1.filter(x=>x.key==='c2').length;
if(clFocus<clRun1.length*0.5){clStBad++;console.log('druhy stupen nenese zavod',clFocus+'/'+clRun1.length);}
if(clFocus===clRun1.length){clStBad++;console.log('chybi opakovani celych hodin');}
// odpoledni cas se objevi az v poslednim kbelicku
for(const it of clRun1) if(it.night){clStBad++;console.log('vecerni cas prisel prilis brzo',it.disp);break;}
console.log('chyb ve stupnich hodin:',clStBad);
