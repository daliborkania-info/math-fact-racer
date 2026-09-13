const fs=require('fs');const path=require('path');const ROOT=path.resolve(__dirname, '..');
const base = path.join(ROOT, 'src') + '/';
let src=fs.readFileSync(base+'i18n.js','utf8')+'\n'+fs.readFileSync(base+'curricula.js','utf8')+'\n'+fs.readFileSync(base+'app.js','utf8');
const el=()=>({innerHTML:'',textContent:'',className:'',style:{},clientWidth:360,classList:{add(){},remove(){}},appendChild(){},remove(){},dataset:{},querySelector:()=>el(),querySelectorAll:()=>[],closest:()=>null,focus(){},offsetWidth:1});
// layoutClass() cte sirku a vysku okna a zapisuje je na <html>, takze
// nahrazka okna je musi mit; bez documentElementu by se rozvrzeni
// nespoctelo a mapa by se v testu vzdycky skladala do dvou sloupcu.
// #app je jeden a tyz prvek po celou dobu behu, protoze mapa si z nej
// bere sirku a kontrola 15 ji potrebuje menit.
const appEl=el();
global.document={getElementById:id=>id==='app'?appEl:el(),querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},createElement:()=>el(),body:{appendChild(){}},onkeydown:null,documentElement:el()};
global.window={addEventListener(){},innerWidth:375,innerHeight:812};const store={};
global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};
global.navigator={};global.setTimeout=()=>0;
src+="\n;module.exports={itemFromKey,MULT,ADD,mk,dk,ak,sk,H_BUCKETS,K_BUCKETS,as1000Keys,as1000Stage,C_BUCKETS,clockKeys,clockStage,X_BUCKETS,beyondKeys,beyondStage,O_BUCKETS,roundKeys,roundStage,Q_BUCKETS,chainKeys,chainStage,Z_BUCKETS,opsKeys,opsStage,G_BUCKETS,tensKeys,tensStage,U_BUCKETS,unitKeys,unitsStage,questionHTML,rightAnswerText,thresholds,crossesTen,as20Keys,unlockState,seedOpened,rememberUnlocks,trackKeys,newProfile,buildRun,TRACKS,DB,petSVG,rideSVG,duckSVG,PETS,RIDES,DUCKS,DUCK,STARTERS,isPet,itemById,ENVS,circuit,route,routeOf,atU,sceneSVG,sceneThumb,E_STAGES,stageKeys,bridgeStage,BANDS,bandKeys,seedBands,mastery,CURRICULA,poolKeys,poolSize,schoolPool,schoolReady,isPlayable,playableChapters,normalizeChapter,visibleTracks,chapterOf,trackById,chapterJobs,JOBS,jobStage,jobById,jobsInGrade,buildJob,jobItemFromKey,MONEY,fewestCoins,PAINTS,isJobKey,record,I18N,STAR_LV,starred,starCount,seedStars,trackSpec,shopSpec,collectionSpecs,starsAll,tokenSVG,tokenGridSVG,revealSVG,WORLDS,worldById,envOf,seedWorld,ridesOrder,ALL_ITEMS,MAX_GRADE,seedGrade,inGrade,gradeOf,peekTracks,yearOf,foldsYears,overallMastery,heatSpecs,collectionSpecs,worldSpots,worldRoad,placeBox,placeHeight,PLACE_GAP,PLACE_MAX,WORLD_EDGE,TX_BY_GRADE,txNow,layoutClass,mapCols};";
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
  q:[0,100],       // retezec tri cisel, nikdy pod nulu a nikdy pres sto
  z:[0,1000],      // co se pocita driv, nikdy pod nulu a nikdy pres tisic
  g:[1,1000],      // kulata cisla, soucin nikdy pres tisic
  u:[1,1000],      // prevody jednotek, odpoved vzdycky cele cislo do tisice
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
A.chainKeys(A.Q_BUCKETS.map(b=>b.id)).forEach(k=>keys.push(k));
A.opsKeys(A.Z_BUCKETS.map(b=>b.id)).forEach(k=>keys.push(k));
A.tensKeys(A.G_BUCKETS.map(b=>b.id)).forEach(k=>keys.push(k));
A.unitKeys(A.U_BUCKETS.map(b=>b.id)).forEach(k=>keys.push(k));
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
  // otazka s jednotkou neni aritmeticky radek, i kdyby v jednotce nejaky
  // ten znak stal: "3 m" se nepocita, cely vypocet je v prevodu samotnem
  if(/[+\-×:]/.test(it.text) && !it.unit){
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
// 2b. mala zasoba a dvacet otazek: jeden zavod na trati nic nedokaze, protoze
// dvojice vznikaly zhruba v jednom zavode z dvaceti. Trati prvniho roku maji
// nejmensi zasobu klicu, takze se na nich meri po peti stech zavodech.
let neigh=0, neighFace=0;
for(const id of ['a3','a5','a7','a10']){
  const q=A.newProfile('N'); A.DB.profiles=[q]; A.DB.current=q.id; q.autoUnlock=false;
  let pair=0, same=0;
  for(let r=0;r<500;r++){
    const run=A.buildRun(q,A.trackById(id));
    for(let i=1;i<run.length;i++){
      if(run[i].key===run[i-1].key) pair++;
      if((run[i].disp||run[i].text)===(run[i-1].disp||run[i-1].text)) same++;
    }
  }
  if(pair||same) console.log('  !!  sousedni dvojice na trati',id,'klicu',pair,'tvari',same);
  neigh+=pair; neighFace+=same;
}
console.log('500 zavodu na a3/a5/a7/a10 | sousednich klicu',neigh,'| sousednich tvari',neighFace);

// sampionat nesmi zacatecnikovi podstrcit stupen, na ktery jeste nedosel
let mixBad=0;
const mixp=A.newProfile('M'); A.DB.profiles=[mixp]; A.DB.current=mixp.id;
mixp.autoUnlock=false;                                   // vsechno otevrene
// obory do dvaceti uz nejsou stupne jedne trati, ale samostatne trati,
// takze je hlida odemykani; stupnovane trati ale platí dal
const firstBridge=new Set(A.stageKeys(0));
const crossing=k=>{const m=/^[as](\d+)p(\d+)$/.exec(k); return m && A.crossesTen(+m[1],+m[2]);};
for(const it of A.buildRun(mixp,A.trackById('mix'))){
  if(it.kind==='clock'&&it.key!=='c1'){mixBad++;console.log('  !!  sampionat dal zacatecnikovi cas',it.disp);break;}
  if(crossing(it.key)&&!firstBridge.has(it.key)){mixBad++;console.log('  !!  sampionat dal zacatecnikovi tezsi most',it.text);break;}
  if(/^k/.test(it.key)&&it.key.slice(2)!=='b1'){mixBad++;console.log('  !!  sampionat dal zacatecnikovi krok do tisice',it.text);break;}
}
console.log('sampionat respektuje stupne:',mixBad?'ne':'ano');

// 3. platnost SVG (parovani tagu a NaN)
let svgBad=0;
A.PETS.forEach(x=>[1,2,3].forEach(s=>{const v=A.petSVG(x,s); if(/NaN|undefined/.test(v)){svgBad++;console.log('  !!  SVG problem',x.id,s);}}));
A.RIDES.forEach(x=>{const v=A.rideSVG(x); if(/NaN|undefined/.test(v)){svgBad++;console.log('  !!  SVG problem',x.id);}});
A.DUCKS.forEach(x=>{const v=A.duckSVG(x); if(/NaN|undefined/.test(v)){svgBad++;console.log('  !!  SVG problem',x.id);}});
Object.keys(A.ENVS).forEach(e=>{const v=A.sceneSVG('circuit',e,"t1"); if(/NaN|undefined/.test(v)){svgBad++;console.log('  !!  ENV problem',e);}});
console.log('vadnych SVG:',svgBad);

// 3b. kacenka
//
// Kresba je jedina vec, kterou test neuvidi, takze se hlida aspon to, co
// se spocitat da: ze zadny bod nevyjede z ramu (kotvy jsou spolecne pro
// vsechny budouci vrstvy, takze kdyz ujede kotva, ujede s ni vsechno)
// a ze kacenka neni ani stroj, ani zviratko. Kdyby prosla jako zviratko,
// zacala by sbirat zkusenosti a vyrostla by do stupne, ke kteremu zadna
// druha kresba neexistuje.
let dBad=0;
const dsay=m=>{dBad++;console.log('  !!  '+m);};
const duck=A.DUCKS[0];
const dsvg=A.duckSVG(duck);
if(A.DUCKS.length!==1) dsay('kacenek uz neni jedna, krok H1 pocital s jednou');
if(duck.cost!==0) dsay('kacenka neni zdarma, stoji '+duck.cost);
if(!A.STARTERS.includes(duck.id)) dsay('kacenka neni mezi startovnimi zavodniky');
if(A.STARTERS[0]!=='ri_auto') dsay('prvni startovni zavodnik se zmenil na '+A.STARTERS[0]);
if(A.isPet(duck)) dsay('kacenka projde jako zviratko a zacne rust');
if(duck.kind) dsay('kacenka projde jako stroj a dostane nater');
if(A.itemById(duck.id)!==duck) dsay('kacenka nejde najit podle id');
// ram je 100 x 118 a kresba je v nem zvetsena skupinovou transformaci,
// takze se body prepocitaji stejne, jako je prepocita prohlizec
const fit=/translate\((-?[\d.]+) (-?[\d.]+)\) scale\(([\d.]+)\) translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(dsvg);
if(!fit) dsay('kacenka ztratila skupinovou transformaci, kotvy uz nesedi s ramem');
else{
  const [tx,ty,s,ox,oy]=fit.slice(1).map(Number);
  const px=x=>tx+s*(x+ox), py=y=>ty+s*(y+oy);
  const B=A.DUCK.BODY,H=A.DUCK.HEAD;
  const pts=[[B.x-B.rx,B.y],[B.x+B.rx,B.y],[B.x,B.y-B.ry],[B.x,B.y+B.ry],
             [H.x-H.r,H.y],[H.x+H.r,H.y],[H.x,H.y-H.r],[H.x,H.y+H.r],
             [A.DUCK.EYE.x,A.DUCK.EYE.y],[A.DUCK.WING.x,A.DUCK.WING.y],
             [A.DUCK.BEAK.x+21,A.DUCK.BEAK.y],[A.DUCK.TAIL.x-22,A.DUCK.TAIL.y-15]];
  for(const [x,y] of pts){
    if(px(x)<0||px(x)>100||py(y)<0||py(y)>118){dsay('kotva vyjela z ramu: '+x+','+y+' -> '+px(x).toFixed(1)+','+py(y).toFixed(1));break;}
  }
  // nad hlavou musi zbyt misto, jinak nebude kam posadit klobouk
  const room=py(H.y-H.r);
  if(room<18) dsay('nad hlavou zbyva jen '+room.toFixed(1)+', na klobouk to nestaci');
  // hlava se musi dotykat tela, jinak by kacenka byla dva kusy
  const overlap=(H.y+H.r)-(B.y-B.ry*Math.sqrt(Math.max(0,1-Math.pow((H.x-B.x)/B.rx,2))));
  if(overlap<=0) dsay('hlava se nedotyka tela, chybi '+(-overlap).toFixed(1));
}
console.log('kacenka:',dBad?'chyb '+dBad:'v poradku');

// 4. kurikulum: kazda kapitola s poolem musi dat pouzitelnou zasobu klicu
const VALID=new Set();
A.MULT.forEach(f=>{VALID.add(A.mk(f.a,f.b)); if(f.a>1) VALID.add(A.dk(f.a,f.b));});
A.ADD.forEach(f=>{VALID.add(A.ak(f.a,f.b)); VALID.add(A.sk(f.a,f.b));});
A.H_BUCKETS.forEach(b=>{VALID.add('p'+b.id); VALID.add('n'+b.id);});
A.as1000Keys(A.K_BUCKETS.map(b=>b.id)).forEach(k=>VALID.add(k));
A.beyondKeys(A.X_BUCKETS.map(b=>b.id)).forEach(k=>VALID.add(k));
A.roundKeys(A.O_BUCKETS.map(b=>b.id)).forEach(k=>VALID.add(k));
A.chainKeys(A.Q_BUCKETS.map(b=>b.id)).forEach(k=>VALID.add(k));
A.opsKeys(A.Z_BUCKETS.map(b=>b.id)).forEach(k=>VALID.add(k));
A.tensKeys(A.G_BUCKETS.map(b=>b.id)).forEach(k=>VALID.add(k));
A.unitKeys(A.U_BUCKETS.map(b=>b.id)).forEach(k=>VALID.add(k));
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

// 6. obory prvniho rocniku a mosty pres desitku
//
// Obory a mosty musi dohromady pokryt cely obor do dvaceti a nesmi se
// prekryvat, jinak by nekterý priklad nemel svoje misto na mape.
// Prvni rocnik je zebrik oboru, kazdy obor je vlastni trat; prechod pres
// desitku je az druhy rocnik a ma vlastni trat se ctyrmi mosty.
let stBad=0;
const all20=new Set();
A.ADD.forEach(f=>{all20.add(A.ak(f.a,f.b)); all20.add(A.sk(f.a,f.b));});
const covered=new Set(); let overlap=0;
A.BANDS.forEach(b=>{
  const ks=A.bandKeys(b.id);
  if(ks.length<4){stBad++;console.log('  !!  obor',b.id,'ma prilis malo prikladu:',ks.length);}
  for(const k of ks){ if(covered.has(k)) overlap++; covered.add(k); }
});
A.E_STAGES.forEach((st,i)=>{
  const ks=A.stageKeys(i);
  if(!ks.length){stBad++;console.log('  !!  prazdny most',st.id);}
  for(const k of ks){ if(covered.has(k)) overlap++; covered.add(k); }
});
if(overlap){stBad++;console.log('  !!  obory a mosty se prekryvaji o',overlap,'klicu');}
if(covered.size!==all20.size){stBad++;console.log('  !!  obory a mosty nepokryly cely obor',covered.size,'z',all20.size);}
// v oborech prvniho rocniku nesmi byt ani jeden prechod pres desitku
for(const b of A.BANDS) for(const k of A.bandKeys(b.id)){
  const m=/^[as](\d+)p(\d+)$/.exec(k);
  if(m && A.crossesTen(+m[1],+m[2])){stBad++;console.log('  !!  obor',b.id,'pustil prechod pres desitku',k);break;}
}
// a soucet musi sedet do oboru, tedy zadne 20 - 10 hned v prvnim tydnu
for(const b of A.BANDS) for(const k of A.bandKeys(b.id)){
  const m=/^[as](\d+)p(\d+)$/.exec(k), soucet=+m[1]+ +m[2];
  if(soucet<b.lo||soucet>b.hi){stBad++;console.log('  !!  obor',b.id,'ma priklad mimo rozsah',k);break;}
}
// zacatecnik dostane opravdu jen soucty do tri
const beg=A.newProfile('Z',1); A.DB.profiles=[beg]; A.DB.current=beg.id;
const prvni=new Set(A.bandKeys('a3'));
for(const it of A.buildRun(beg,A.trackById('a3')))
  if(!prvni.has(it.key)){stBad++;console.log('  !!  zacatecnik dostal priklad mimo prvni obor',it.text);break;}
for(const it of A.buildRun(beg,A.trackById('a3')))
  if(it.answer>3||it.answer<0){stBad++;console.log('  !!  zacatecnik dostal vysledek mimo tri',it.text,it.answer);break;}
// a dalsi obory ma zamcene, dokud ten prvni nezvladne
if(A.unlockState(beg,A.trackById('a5')).open){stBad++;console.log('  !!  druhy obor je otevreny hned');}
A.bandKeys('a3').forEach(k=>beg.facts[k]={lv:5,reps:9,ok:9,bad:0,best:900,seen:Date.now()});
if(!A.unlockState(beg,A.trackById('a5')).open){stBad++;console.log('  !!  zvladnuty prvni obor neotevrel druhy');}
// druhy obor nese zavod a prvni se vraci jako opakovani
const run1=A.buildRun(beg,A.trackById('a5'));
const inFocus=run1.filter(it=>new Set(A.bandKeys('a5')).has(it.key)).length;
if(inFocus<run1.length*0.5){stBad++;console.log('  !!  druhy obor nenese zavod',inFocus+'/'+run1.length);}
if(inFocus===run1.length){stBad++;console.log('  !!  chybi opakovani prvniho oboru');}
// mosty: zacatecnik zacina devitkou a po zvladnuti se posune
const br=A.newProfile('B',2); A.DB.profiles=[br]; A.DB.current=br.id;
if(A.bridgeStage(br)!==0){stBad++;console.log('  !!  zacatecnik nezacina prvnim mostem');}
const bfirst=new Set(A.stageKeys(0));
for(const it of A.buildRun(br,A.trackById('bridge')))
  if(!bfirst.has(it.key)){stBad++;console.log('  !!  zacatecnik dostal tezsi most',it.text);break;}
A.stageKeys(0).forEach(k=>br.facts[k]={lv:5,reps:9,ok:9,bad:0,best:900,seen:Date.now()});
if(A.bridgeStage(br)!==1){stBad++;console.log('  !!  po zvladnuti prvniho mostu se neposunul');}
// most je otevreny od zacatku druhe tridy, nema cekat na cely prvni rocnik
if(!A.unlockState(A.newProfile('B2',2),A.trackById('bridge')).open){
  stBad++;console.log('  !!  most na druhaka ceka za celym prvnim rocnikem');}
console.log('chyb v oborech a mostech:',stBad);

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
  // hratelna kapitola bud dela trat, nebo posila do dilny; prvni rocnik
  // zacina pocitanim predmetu, coz je zakazka, ne zavod
  if(!A.schoolReady(q)&&!A.chapterJobs(ok[0]).length){
    selBad++;console.log('  !!  prvni hratelna kapitola nedela ani trat, ani zakazku',c.id,ok[0].n);}
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
// obory: prvni je do tri, desitkove spoje jsou az v patnactce a dvacitce
const b3=new Set(A.bandKeys('a3')), b15=new Set(A.bandKeys('a15')), b20=new Set(A.bandKeys('a20'));
if(!b3.has(A.ak(1,2))||b3.has(A.ak(3,4))){teenBad++;console.log('  !!  prvni obor neni obor do tri');}
if(b3.has(A.sk(10,10))){teenBad++;console.log('  !!  prvni obor pustil 20 - 10');}
if(!b15.has(A.ak(3,12))||b15.has(A.ak(6,13))){teenBad++;console.log('  !!  patnactka nesedi');}
if(!b20.has(A.ak(6,13))||!b20.has(A.sk(10,10))){teenBad++;console.log('  !!  dvacitka nesedi');}
if(A.E_STAGES.length!==4){teenBad++;console.log('  !!  mostu nejsou ctyri',A.E_STAGES.length);}
if(A.BANDS.length!==6){teenBad++;console.log('  !!  oboru neni sest',A.BANDS.length);}
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
A.trackKeys(op,A.trackById('bridge')).forEach(k=>op.facts[k]={lv:5,reps:9,ok:9,bad:0,best:900,seen:Date.now()});
A.rememberUnlocks(op);
if(!op.opened.a100){opBad++;console.log('  !!  zvladnuty prechod pres desitku neotevrel stovku');}
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

// 7i. retezce: kazdy kbelik dela to, co slibuje, a po ceste se nikdy
// neobjevi zaporne cislo. Mezivysledek se pocita zvlast, protoze prave
// on je to, co dite drzi v hlave.
let qBad=0, qN=0;
const qsay=m=>{qBad++; if(qBad<8) console.log('  !!  '+m);};
const znam=new Set();
for(const b of A.Q_BUCKETS){
  for(let i=0;i<300;i++){
    const it=A.itemFromKey('q'+b.id); qN++;
    const m=String(it.text).match(/^(\d+) ([+-]) (\d+) ([+-]) (\d+)$/);
    if(!m){qsay('zadani neni tri cisla a dve znamenka: '+it.text);break;}
    const a=+m[1], y=+m[3], z=+m[5], s1=m[2], s2=m[4];
    znam.add(s1+s2);
    const mid=s1==='+'?a+y:a-y;
    const res=s2==='+'?mid+z:mid-z;
    if(res!==it.answer){qsay('vysledek nesedi: '+it.text+' je '+res+', vraceno '+it.answer);break;}
    if(mid<0||res<0){qsay('po ceste se objevilo zaporne cislo: '+it.text);break;}
    if(b.id==='1'){
      if([a,y,z].some(v=>v<1||v>9)){qsay('v prvnim kbeliku neni vsechno jednociferne: '+it.text);break;}
      if(mid<1||mid>19){qsay('mezivysledek mimo dvacitku: '+it.text+' -> '+mid);break;}
      if(res>20){qsay('vysledek prelezl dvacet: '+it.text);break;}
    } else if(b.id==='2'){
      if([a,y,z].some(v=>v%10!==0||v<10||v>90)){qsay('druhy kbelik neni cele desitky: '+it.text);break;}
      if(mid<10||mid>100){qsay('mezivysledek mimo stovku: '+it.text+' -> '+mid);break;}
    } else {
      if(a<10||a>99||a%10===0){qsay('prvni clen neni dvojciferny a nekulaty: '+it.text);break;}
      if(y>9&&z>9){qsay('treti kbelik nema ani jeden jednociferny clen: '+it.text);break;}
      if([y,z].some(v=>v>9&&(v%10!==0||v>50))){qsay('druhy nebo treti clen neni jednociferny ani cela desitka: '+it.text);break;}
      if(mid>100||res>100){qsay('treti kbelik prelezl stovku: '+it.text);break;}
    }
  }
}
if(znam.size!==4){qsay('nektery vzor znamenek se vubec neobjevil: '+[...znam].join(' '));}
// Ctyri vzory se losuji rovnomerne, kazdy tedy ma mit kolem ctvrtiny.
// Kdyz se nejaky vzor nepodari dostavit a losuje se znovu, jeho podil
// klesne, a presne to se uz jednou stalo: "++" ve druhem kbeliku melo
// o tretinu min nez ostatni. Hranice je volna, patnact procent, aby
// spadla jen na skutecny vypadek, ne na nahodu ve vzorku.
const QN=1200, QMIN=0.15;
for(const b of A.Q_BUCKETS){
  const c={'++':0,'+-':0,'-+':0,'--':0};
  for(let i=0;i<QN;i++){
    const m=String(A.itemFromKey('q'+b.id).text).match(/^\d+ ([+-]) \d+ ([+-]) \d+$/);
    if(m) c[m[1]+m[2]]++;
  }
  for(const p of Object.keys(c))
    if(c[p] < QN*QMIN) qsay('vzor '+p+' je v kbeliku q'+b.id+' vzacny: '+c[p]+' z '+QN);
}
console.log('zkontrolovano retezcu:',qN,'| chyb:',qBad,'| vzoru znamenek:',znam.size);

// 7j. retezec se stupnuje a stoji na stovce, stejne jako zaokrouhlovani
let qStBad=0;
const tq1=A.newProfile('Q1'); A.DB.profiles=[tq1]; A.DB.current=tq1.id;
if(A.chainStage(tq1)!==0){qStBad++;console.log('  !!  zacatecnik nezacina dvacitkou');}
const qRun0=A.buildRun(tq1,A.trackById('chain'));
for(const it of qRun0) if(it.key!=='q1'){qStBad++;console.log('  !!  zacatecnik dostal tezsi kbelik',it.text);break;}
A.chainKeys(['1']).forEach(k=>tq1.facts[k]={lv:5,reps:9,ok:9,bad:0,best:2000,seen:Date.now()});
if(A.chainStage(tq1)!==1){qStBad++;console.log('  !!  po zvladnuti prvniho kbeliku se neposunul');}
const qRun1=A.buildRun(tq1,A.trackById('chain'));
const qFocus=qRun1.filter(it=>it.key==='q2').length;
if(qFocus<qRun1.length*0.5){qStBad++;console.log('  !!  druhy kbelik nenese zavod',qFocus+'/'+qRun1.length);}
if(qFocus===qRun1.length){qStBad++;console.log('  !!  chybi opakovani prvniho kbeliku');}
const qg=A.newProfile('Q2'); A.DB.profiles=[qg]; A.DB.current=qg.id;
if(A.unlockState(qg,A.trackById('chain')).open){qStBad++;console.log('  !!  retezec je otevreny hned od zacatku');}
A.trackKeys(qg,A.trackById('a100')).forEach((k,i)=>qg.facts[k]={lv:i%2?2:1,reps:9,ok:7,bad:2,best:4000,seen:Date.now()});
if(!A.unlockState(qg,A.trackById('chain')).open){qStBad++;console.log('  !!  rozjeta stovka neotevrela retezec');}
// retezec je kapitola 11, tedy pred nasobenim mimo malou nasobilku;
// na mape tomu ma odpovidat poradi
const poradi=A.TRACKS.map(x=>x.id);
if(poradi.indexOf('chain')>poradi.indexOf('beyond')){qStBad++;console.log('  !!  retezec stoji na mape az za nasobenim mimo nasobilku');}
console.log('chyb ve stupnich retezce:',qStBad);

// 7l. co se pocita driv: kazdy kbelik dela to, co slibuje. Poradi
// operaci se tady pocita znovu a rucne, ne pres eval, protoze prave
// poradi je to, co se ma overit; eval by odpovidal toutez pravidlem,
// ktere mel zkontrolovat. Deleni musi vzdycky vyjit beze zbytku a
// nikde po ceste nesmi byt zaporne cislo.
let zBad=0, zN=0, zPoradi=0;
const zsay=m=>{zBad++; if(zBad<8) console.log('  !!  '+m);};
// jeden nasobici nebo delici clen: oba cinitele do deseti, deleni beze
// zbytku a podil do deseti, tedy porad jeste mala nasobilka
const zFact=(txt,kde)=>{
  const m=txt.match(/^(\d+) ([×:]) (\d+)$/);
  if(!m){zsay(kde+': "'+txt+'" neni ani nasobeni, ani deleni');return null;}
  const a=+m[1], b=+m[3];
  if(m[2]==='×'){
    if(a<2||a>10||b<2||b>10){zsay(kde+': nasobi se mimo malou nasobilku: '+txt);return null;}
    return {value:a*b, x:a, y:b, op:'×'};
  }
  if(a%b!==0){zsay(kde+': deleni ma zbytek: '+txt);return null;}
  const q=a/b;
  if(b<2||b>10||q<2||q>10){zsay(kde+': deleni je mimo malou nasobilku: '+txt);return null;}
  return {value:q, x:a, y:b, op:':'};
};
const zApply=(op,a,b)=> op==='+'?a+b : op==='-'?a-b : op==='×'?a*b : a/b;
const zPlain=(txt,kde)=>{     // cislo a nasobici clen v libovolnem poradi
  let m=txt.match(/^(\d+) ([+-]) (\d+ [×:] \d+)$/);
  if(m){ const f=zFact(m[3],kde); if(!f) return null;
         // kdyby se to cetlo zleva doprava, spocitalo by se nejdriv
         // cislo se zacatkem nasobiciho clenu, a to je prave ta chyba,
         // kterou se rodina uci nedelat
         return {val: zApply(m[2], +m[1], f.value), part:f.value, plain:+m[1], first:'num',
                 lr: zApply(f.op, zApply(m[2], +m[1], f.x), f.y)}; }
  m=txt.match(/^(\d+ [×:] \d+) ([+-]) (\d+)$/);
  if(m){ const f=zFact(m[1],kde); if(!f) return null;
         // s nasobicim clenem vpredu vyjde cteni zleva doprava stejne,
         // takze na poradi v tomhle tvaru nezalezi a necita se
         return {val: zApply(m[2], f.value, +m[3]), part:f.value, plain:+m[3], first:'fact', lr:null}; }
  zsay(kde+': "'+txt+'" neni cislo a jeden nasobici clen');
  return null;
};
for(const b of A.Z_BUCKETS){
  for(let i=0;i<400;i++){
    const it=A.itemFromKey('z'+b.id); zN++;
    const txt=String(it.text);
    const top=(b.id==='1'||b.id==='2')?100:1000;
    if(it.maxLen!==((b.id==='3'||b.id==='4')?4:3)){
      zsay('kbelik z'+b.id+' ma spatne maxLen: '+it.maxLen);break;
    }
    let val=null, lr=null;
    if(b.id==='1'||b.id==='3'){
      const e=zPlain(txt,'z'+b.id); if(!e) break;
      val=e.val; lr=e.lr;
      if(e.part<0||e.val<0){zsay('po ceste se objevilo zaporne cislo: '+txt);break;}
      if(b.id==='3'){
        if(e.first!=='num'){zsay('do tisice ma vest velke cislo: '+txt);break;}
        if(e.plain%10!==0||e.plain<100||e.plain>990){zsay('do tisice neni prvni cislo cela desitka ve stovkach: '+txt);break;}
      } else if(e.plain>100||e.part>100){zsay('prvni kbelik prelezl stovku: '+txt);break;}
    } else if(b.id==='2'){
      const m=txt.match(/^\((\d+) ([+-]) (\d+)\) ([×:]) (\d+)$/);
      if(!m){zsay('z2 neni zavorka a za ni krat nebo deleno: '+txt);break;}
      const inner=m[2]==='+'? +m[1]+ +m[3] : +m[1]- +m[3];
      if(inner<0){zsay('zavorka vysla pod nulu: '+txt);break;}
      if(inner>100){zsay('zavorka prelezla stovku: '+txt);break;}
      if(m[4]===':'){
        if(inner%+m[5]!==0){zsay('deleni zavorky ma zbytek: '+txt);break;}
        val=inner/+m[5];
        if(val>10||+m[5]>10){zsay('deleni zavorky je mimo malou nasobilku: '+txt);break;}
      } else {
        val=inner*+m[5];
        if(inner>10||+m[5]>10){zsay('nasobeni zavorky je mimo malou nasobilku: '+txt);break;}
      }
      // zavorka je videt, takze "cteno zleva doprava" tady nema smysl;
      // na poradi se ptaji kbeliky bez zavorek a ten se zavorkou do tisice
      lr=null;
    } else {
      const m=txt.match(/^(\d+) - \((\d+) ([+-]) (\d+)\)$/);
      if(!m){zsay('z4 neni velke cislo minus zavorka: '+txt);break;}
      const inner=m[3]==='+'? +m[2]+ +m[4] : +m[2]- +m[4];
      if(inner<0){zsay('zavorka vysla pod nulu: '+txt);break;}
      if(+m[1]%10!==0||+m[1]<100||+m[1]>900){zsay('z4 nevede cela desitka ve stovkach: '+txt);break;}
      val=+m[1]-inner;
      lr=m[3]==='+'? +m[1]- +m[2]+ +m[4] : +m[1]- +m[2]- +m[4];
    }
    if(val!==it.answer){zsay('poradi operaci nesedi: '+txt+' je '+val+', vraceno '+it.answer);break;}
    if(val<0){zsay('vysledek klesl pod nulu: '+txt);break;}
    if(val>top){zsay('kbelik z'+b.id+' prelezl svuj obor: '+txt+' = '+val);break;}
    if(lr!==null && lr!==val) zPoradi++;
  }
}
// a hlavne: zadani, ktere by se cetlo zleva doprava, musi vyjit jinak,
// jinak by rodina o prednosti operaci vubec nebyla
if(zPoradi < zN*0.15) zsay('na poradi operaci skoro nikdy nezalezi: '+zPoradi+' z '+zN);
console.log('zkontrolovano zadani s poradim operaci:',zN,'| chyb:',zBad,'| zalezi na poradi:',zPoradi);

// 7m. co se pocita driv se stupnuje a stoji na cele nasobilce
let zStBad=0;
const tz1=A.newProfile('Z1'); A.DB.profiles=[tz1]; A.DB.current=tz1.id;
if(A.opsStage(tz1)!==0){zStBad++;console.log('  !!  zacatecnik nezacina bez zavorek do sta');}
const zRun0=A.buildRun(tz1,A.trackById('ops'));
for(const it of zRun0) if(it.key!=='z1'){zStBad++;console.log('  !!  zacatecnik dostal tezsi kbelik',it.text);break;}
A.opsKeys(['1']).forEach(k=>tz1.facts[k]={lv:5,reps:9,ok:9,bad:0,best:2000,seen:Date.now()});
if(A.opsStage(tz1)!==1){zStBad++;console.log('  !!  po zvladnuti prvniho kbeliku se neposunul');}
const zRun1=A.buildRun(tz1,A.trackById('ops'));
const zFocus=zRun1.filter(it=>it.key==='z2').length;
if(zFocus<zRun1.length*0.5){zStBad++;console.log('  !!  druhy kbelik nenese zavod',zFocus+'/'+zRun1.length);}
if(zFocus===zRun1.length){zStBad++;console.log('  !!  chybi opakovani prvniho kbeliku');}
const zg=A.newProfile('Z2'); A.DB.profiles=[zg]; A.DB.current=zg.id;
if(A.unlockState(zg,A.trackById('ops')).open){zStBad++;console.log('  !!  poradi operaci je otevrene hned od zacatku');}
// stovka sama nestaci, tohle visi na cele nasobilce
A.trackKeys(zg,A.trackById('a100')).forEach(k=>zg.facts[k]={lv:3,reps:9,ok:8,bad:1,best:3000,seen:Date.now()});
if(A.unlockState(zg,A.trackById('ops')).open){zStBad++;console.log('  !!  otevrela to stovka misto nasobilky');}
A.trackKeys(zg,A.trackById('t5')).forEach(k=>zg.facts[k]={lv:2,reps:9,ok:7,bad:2,best:3000,seen:Date.now()});
if(!A.unlockState(zg,A.trackById('ops')).open){zStBad++;console.log('  !!  rozjeta nasobilka neotevrela poradi operaci');}
// kapitola 13 je pred kapitolou 14, tedy na mape pred nasobenim mimo
// malou nasobilku a hned za retezcem
const zPor=A.TRACKS.map(x=>x.id);
if(zPor.indexOf('ops')<zPor.indexOf('chain')||zPor.indexOf('ops')>zPor.indexOf('beyond')){
  zStBad++;console.log('  !!  poradi operaci nestoji na mape mezi retezcem a nasobenim mimo nasobilku');}
// kapitoly 13 a 30 uz musi jit vybrat a musi ukazovat sem
const cur3=A.CURRICULA.find(c=>c.id==='nns-matysek-3');
for(const n of [13,30]){
  const ch=cur3.chapters.find(x=>x.n===n);
  if(!A.isPlayable(ch)){zStBad++;console.log('  !!  kapitola '+n+' porad nejde vybrat');}
  if(!A.poolKeys(ch.pool).every(k=>k[0]==='z')){zStBad++;console.log('  !!  kapitola '+n+' neukazuje na poradi operaci');}
}
if(A.poolKeys(cur3.chapters.find(x=>x.n===13).pool).length!==2){
  zStBad++;console.log('  !!  kapitola 13 ma mit jen dva kbeliky, sedmy dil je do sta');}
console.log('chyb ve stupnich poradi operaci:',zStBad);

// 7n. kulata cisla: kazdy kbelik dela to, co slibuje
//
// Kbelik 1 nasobi a deli deseti nebo stem, kbelik 2 kulatou desitkou
// nebo tim, co k ni patri z male nasobilky. Soucin nikdy nesmi prelezt
// tisic a deleni nikdy nesmi mit zbytek; oboji se overuje z textu
// zadani, ne z toho, co si generator mysli.
let tnBad=0, tnN=0, tnCtvrta=0;
const tnsay=m=>{tnBad++; if(tnBad<8) console.log('  !!  '+m);};
for(const b of A.G_BUCKETS){
  for(let i=0;i<600;i++){
    const mi=A.itemFromKey('gm'+b.id), di=A.itemFromKey('gd'+b.id); tnN+=2;
    if(mi.maxLen!==4||di.maxLen!==4){tnsay('kulata cisla maji mit misto na ctyri cislice');break;}
    const mm=mi.text.match(/^(\d+) × (\d+)$/);
    if(!mm){tnsay('nasobeni nema tvar cislo krat cislo: '+mi.text);break;}
    const a=+mm[1], c=+mm[2];
    // jeden z cinitelu musi byt kulaty, at uz stoji vpredu, nebo vzadu
    const kulate=[a,c].filter(v=>v%10===0);
    if(!kulate.length){tnsay('ani jeden cinitel neni kulaty: '+mi.text);break;}
    if(b.id==='1'){
      // jedno z cisel je deset nebo sto a to druhe se do tisice vejde;
      // kulaty cinitel smi stat vpredu i vzadu a "10 × 100" je oboji
      // zaraz, takze se zkousi obe prirazeni
      const sedi=[[a,c],[c,a]].some(([xx,rr]) =>
        (rr===10&&xx>=2&&xx<=99)||(rr===100&&xx>=2&&xx<=10));
      if(!sedi){tnsay('kbelik 1 ma nasobit deseti nebo stem: '+mi.text);break;}
    } else {
      const kulat=a%10===0?a:c, maly=a%10===0?c:a;
      if(kulat<20||kulat>90||kulat%10!==0){tnsay('kbelik 2 ma nasobit kulatou desitkou: '+mi.text);break;}
      if(maly<2||maly>9){tnsay('kbelik 2 ma druhe cislo jednociferne: '+mi.text);break;}
    }
    if(a*c>1000){tnsay('soucin prelezl tisic: '+mi.text);break;}
    if(String(a*c).length>4){tnsay('soucin se nevejde do ctyr cislic: '+mi.text);break;}
    if(String(mi.answer).length===4) tnCtvrta++;
    const dm=di.text.match(/^(\d+) : (\d+)$/);
    if(!dm){tnsay('deleni nema tvar cislo deleno cislo: '+di.text);break;}
    const del=+dm[1], dl=+dm[2];
    if(del>1000){tnsay('deleny soucin prelezl tisic: '+di.text);break;}
    if(dl===0||del%dl!==0){tnsay('deleni nevychazi beze zbytku: '+di.text);break;}
    if(b.id==='1'&&dl!==10&&dl!==100){tnsay('kbelik 1 ma delit deseti nebo stem: '+di.text);break;}
    // ve druhem kbeliku se deli bud kulatou desitkou, nebo tim
    // jednocifernym, ktere k ni patri; nic tretiho
    if(b.id==='2'&&!((dl%10===0&&dl>=20&&dl<=90)||(dl>=2&&dl<=9))){
      tnsay('kbelik 2 deli necim, co v nem nema co delat: '+di.text);break;}
    if(di.answer!==del/dl){tnsay('podil nesedi: '+di.text);break;}
  }
}
// cely tisic se musi objevovat, jinak by maxLen 4 nemel co hlidat
if(tnCtvrta===0) tnsay('kulaty tisic se nikdy neobjevil, ctvrta cislice je zbytecna');
console.log('zkontrolovano kulatych cisel:',tnN,'| chyb:',tnBad);

// 7o. kulata cisla se stupnuji a stoji na trati za nasobilkou
let tnStBad=0;
const tg=A.newProfile('G1'); A.DB.profiles=[tg]; A.DB.current=tg.id;
if(A.tensStage(tg)!==0){tnStBad++;console.log('  !!  zacatecnik nezacina desitkou a stovkou');}
const tnRun0=A.buildRun(tg,A.trackById('tens'));
for(const it of tnRun0) if(it.key.slice(2)!=='1'){tnStBad++;console.log('  !!  zacatecnik dostal tezsi kbelik',it.text);break;}
if(!tnRun0.some(it=>it.key[1]==='m')||!tnRun0.some(it=>it.key[1]==='d')){
  tnStBad++;console.log('  !!  kbelik netrenuje oba smery naraz');}
A.tensKeys(['1']).forEach(k=>tg.facts[k]={lv:5,reps:9,ok:9,bad:0,best:2000,seen:Date.now()});
if(A.tensStage(tg)!==1){tnStBad++;console.log('  !!  po zvladnuti prvniho kbeliku se neposunul');}
const tnRun1=A.buildRun(tg,A.trackById('tens'));
const tnFocus=tnRun1.filter(it=>it.key.slice(2)==='2').length;
if(tnFocus<tnRun1.length*0.5){tnStBad++;console.log('  !!  druhy kbelik nenese zavod',tnFocus+'/'+tnRun1.length);}
if(tnFocus===tnRun1.length){tnStBad++;console.log('  !!  chybi opakovani prvniho kbeliku');}
const gg=A.newProfile('G2'); A.DB.profiles=[gg]; A.DB.current=gg.id;
if(A.unlockState(gg,A.trackById('tens')).open){tnStBad++;console.log('  !!  kulata cisla jsou otevrena hned od zacatku');}
// stoji to na trati za nasobilkou, ne na cele male nasobilce
A.trackKeys(gg,A.trackById('t5')).forEach(k=>gg.facts[k]={lv:5,reps:9,ok:9,bad:0,best:2000,seen:Date.now()});
if(A.unlockState(gg,A.trackById('tens')).open){tnStBad++;console.log('  !!  otevrela to nasobilka misto trati za nasobilkou');}
A.trackKeys(gg,A.trackById('beyond')).forEach(k=>gg.facts[k]={lv:2,reps:9,ok:7,bad:2,best:3000,seen:Date.now()});
if(!A.unlockState(gg,A.trackById('tens')).open){tnStBad++;console.log('  !!  rozjeta trat za nasobilkou neotevrela kulata cisla');}
// kapitola 28 je az za kapitolou 14, takze i na mape stoji za tratí
// za nasobilkou
const tnPor=A.TRACKS.map(x=>x.id);
if(tnPor.indexOf('tens')!==tnPor.indexOf('beyond')+1){
  tnStBad++;console.log('  !!  kulata cisla nestoji na mape hned za tratí za nasobilkou');}
const tnCur3=A.CURRICULA.find(c=>c.id==='nns-matysek-3');
const tn28=tnCur3.chapters.find(x=>x.n===28);
if(!A.isPlayable(tn28)){tnStBad++;console.log('  !!  kapitola 28 porad nejde vybrat');}
if(!A.poolKeys(tn28.pool).every(k=>k[0]==='g')){tnStBad++;console.log('  !!  kapitola 28 neukazuje na kulata cisla');}
if(A.poolKeys(tn28.pool).length!==4){tnStBad++;console.log('  !!  kapitola 28 ma mit oba kbeliky v obou smerech');}
console.log('chyb ve stupnich kulatych cisel:',tnStBad);

// 7p. prevody jednotek: kazdy kbelik prevadi to, co slibuje, a oboji smerem
//
// Zadani je cislo a jednotka, odpoved je cislo a jednotku nese polozka
// vedle nej. Overuje se z textu zadani, ne z toho, co si generator
// mysli: dvojice musi byt z kbeliku, odpoved musi vyjit jako cele cislo
// a obe cisla, to v otazce i to v odpovedi, musi zustat do tisice,
// protoze tretí trida dal nepocita.
let uBad=0, uN=0;
const usay=m=>{uBad++; if(uBad<8) console.log('  !!  '+m);};
// slovni jednotky maji ve slovniku tri tvary oddelene svislitkem, jeden
// pro jednu, jeden pro dve az ctyri a jeden pro pet a vic; kratke
// jednotky se ve vsech trech jazycich pisou stejne a zadny tvar nemaji
const uLab=(u,n)=>{const w=A.I18N.en['unit_'+u]; return w?w.split('|')[n===1?0:n<5?1:2]:u;};
for(const b of A.U_BUCKETS){
  const smery=new Set(), dvojice=new Set();
  for(let i=0;i<800;i++){
    const it=A.itemFromKey('u'+b.id); uN++;
    if(it.maxLen!==4){usay('prevod ma mit misto na ctyri cislice: '+it.text);break;}
    if(!it.unit){usay('odpoved nema jednotku: '+it.text);break;}
    if(!it.ask){usay('prevod nerika slovy, co se ma udelat: '+it.text);break;}
    const m=/^(\d+) (\S+)$/.exec(it.text);
    if(!m){usay('zadani neni cislo a jednotka: '+it.text);break;}
    const n=+m[1], lab=m[2];
    if(!Number.isInteger(it.answer)||it.answer<1||it.answer>1000){
      usay('odpoved neni cele cislo do tisice: '+it.text+' = '+it.answer);break;}
    if(n>1000){usay('cislo v zadani prelezlo tisic: '+it.text);break;}
    if(lab===it.unit){usay('prevadi se na tutez jednotku: '+it.text+' = ? '+it.unit);break;}
    // dvojice a smer se poznaji ze zadani: bud se velka jednotka
    // rozpada na male, nebo se male skladaji do velke
    let sedi=null;
    for(const pr of b.pairs){
      const big=pr[0], small=pr[1], f=pr[2];
      if(lab===uLab(big,n) && it.unit===uLab(small,n*f) && it.answer===n*f && n<=20) sedi=[pr,'dolu'];
      else if(lab===uLab(small,n) && n%f===0 && it.unit===uLab(big,n/f) && it.answer===n/f && n/f<=20) sedi=[pr,'nahoru'];
      if(sedi) break;
    }
    if(!sedi){usay('prevod neni z tohohle kbeliku: '+it.text+' = '+it.answer+' '+it.unit);break;}
    smery.add(sedi[1]); dvojice.add(sedi[0][0]+'/'+sedi[0][1]);
    // otazka se musi umet ukazat i s jednotkou za odpovedi
    if(A.questionHTML(it).indexOf('<span class="unit">'+it.unit+'</span>')<0){
      usay('jednotka se nedostala do otazky: '+it.text);break;}
    if(A.rightAnswerText(it)!==it.text+' = '+it.answer+' '+it.unit){
      usay('spravna odpoved se ukazuje bez jednotky: '+A.rightAnswerText(it));break;}
  }
  if(smery.size!==2) usay('kbelik '+b.id+' neprevadi obema smery');
  if(dvojice.size!==b.pairs.length) usay('kbelik '+b.id+' nepouziva vsechny sve dvojice');
}
console.log('zkontrolovano prevodu:',uN,'| chyb:',uBad);

// 7q. prevody se stupnuji a stoji na tisicovce
let uStBad=0;
const ug=A.newProfile('U1'); A.DB.profiles=[ug]; A.DB.current=ug.id;
if(A.unitsStage(ug)!==0){uStBad++;console.log('  !!  zacatecnik nezacina delkou');}
const uRun0=A.buildRun(ug,A.trackById('units'));
if(uRun0.length!==20){uStBad++;console.log('  !!  spatna delka zavodu s prevody',uRun0.length);}
for(const it of uRun0) if(it.key!=='u1'){uStBad++;console.log('  !!  zacatecnik dostal tezsi kbelik',it.text);break;}
A.unitKeys(['1']).forEach(k=>ug.facts[k]={lv:5,reps:9,ok:9,bad:0,best:2000,seen:Date.now()});
if(A.unitsStage(ug)!==1){uStBad++;console.log('  !!  po zvladnuti delky se neposunul');}
const uRun1=A.buildRun(ug,A.trackById('units'));
const uFocus=uRun1.filter(it=>it.key==='u2').length;
if(uFocus<uRun1.length*0.5){uStBad++;console.log('  !!  druhy kbelik nenese zavod',uFocus+'/'+uRun1.length);}
if(uFocus===uRun1.length){uStBad++;console.log('  !!  chybi opakovani prvniho kbeliku');}
const uu=A.newProfile('U2'); A.DB.profiles=[uu]; A.DB.current=uu.id;
if(A.unlockState(uu,A.trackById('units')).open){uStBad++;console.log('  !!  prevody jsou otevrene hned od zacatku');}
// stoji to na tisicovce, ne na stovce: kilometr je tisic metru
A.trackKeys(uu,A.trackById('a100')).forEach(k=>uu.facts[k]={lv:5,reps:9,ok:9,bad:0,best:2000,seen:Date.now()});
if(A.unlockState(uu,A.trackById('units')).open){uStBad++;console.log('  !!  otevrela to stovka misto tisicovky');}
A.trackKeys(uu,A.trackById('a1000')).forEach(k=>uu.facts[k]={lv:1,reps:4,ok:3,bad:1,best:4000,seen:Date.now()});
if(A.unlockState(uu,A.trackById('units')).open){uStBad++;console.log('  !!  nacata tisicovka otevrela prevody prilis brzy');}
A.trackKeys(uu,A.trackById('a1000')).forEach(k=>uu.facts[k]={lv:2,reps:6,ok:5,bad:1,best:3000,seen:Date.now()});
if(!A.unlockState(uu,A.trackById('units')).open){uStBad++;console.log('  !!  rozjeta tisicovka neotevrela prevody');}
// prevody se deji v oboru do tisice, takze na mape stoji hned za nim
const uPor=A.TRACKS.map(x=>x.id);
if(uPor.indexOf('units')!==uPor.indexOf('a1000')+1){
  uStBad++;console.log('  !!  prevody nestoji na mape hned za tisicovkou');}
const uCur3=A.CURRICULA.find(c=>c.id==='nns-matysek-3');
const u18=uCur3.chapters.find(x=>x.n===18), u29=uCur3.chapters.find(x=>x.n===29);
if(!A.isPlayable(u18)){uStBad++;console.log('  !!  kapitola 18 porad nejde vybrat');}
if(!A.isPlayable(u29)){uStBad++;console.log('  !!  kapitola 29 porad nejde vybrat');}
if(A.poolKeys(u18.pool).join()!=='u4'){uStBad++;console.log('  !!  kapitola 18 nema byt o nicem jinem nez o case');}
if(A.poolKeys(u29.pool).join()!=='u1,u2,u3'){uStBad++;console.log('  !!  kapitola 29 ma mit delku, hmotnost a objem');}
// kapitola 17 jednotky jen pojmenovava, neprevadi je, takze generator
// nema a vybrat se nesmi dat
if(A.isPlayable(uCur3.chapters.find(x=>x.n===17))){
  uStBad++;console.log('  !!  kapitola 17 se da vybrat, i kdyz se v ni nic neprevadi');}
console.log('chyb ve stupnich prevodu:',uStBad);

// 7k. dlouhe zadani si rekne o mensi pismo, kratke ne
let qhBad=0;
const qh=k=>A.questionHTML(A.itemFromKey(k));
// vsechny tri kbeliky retezce jsou delsi nez jeden spoj, takze zadny
// z nich nesmi zustat v plne velikosti, at padne jakakoli trojice
for(const b of ['q1','q2','q3']) for(let i=0;i<200;i++)
  if(!/q-long|q-xlong/.test(qh(b))){qhBad++;console.log('  !!  retezec si nerekl o mensi pismo',b);break;}
// poradi operaci je jeste delsi radek nez retezec: nejkratsi zadani ma
// devet znaku ("4 + 3 × 5") a nejdelsi patnact ("510 - (46 - 31)";
// cleny zavorky jsou dvouciferne z ri(11,89), takze 99 mezi nimi nepadne),
// takze zadny kbelik nesmi zustat v plne velikosti a cely ctvrty musi
// dostat tu nejmensi
let zDelka=0, zDelsi='';
for(const b of ['z1','z2','z3','z4']) for(let i=0;i<300;i++){
  const it=A.itemFromKey(b), h=A.questionHTML(it);
  if(String(it.text).length>zDelka){zDelka=String(it.text).length; zDelsi=it.text;}
  if(!/q-long|q-xlong/.test(h)){qhBad++;console.log('  !!  poradi operaci si nereklo o mensi pismo',b,it.text);break;}
  if(b==='z4'&&!/q-xlong/.test(h)){qhBad++;console.log('  !!  zavorky do tisice nedostaly nejmensi pismo',it.text);break;}
}
if(zDelka<13){qhBad++;console.log('  !!  nejdelsi zadani rodiny je kratsi, nez plan cekal:',zDelsi);}
console.log('nejdelsi zadani poradi operaci:',zDelsi,'('+zDelka+' znaku)');
// kulata cisla jsou proti tomu kratka rodina: nejdelsi zadani je
// "1000 : 100", tedy deset znaku vcetne mezer, takze dostane prostredni
// velikost, a kratke "7 × 10" musi zustat v plne
let tnDelka=0, tnDelsi='';
for(const b of ['gm1','gd1','gm2','gd2']) for(let i=0;i<600;i++){
  const it=A.itemFromKey(b), h=A.questionHTML(it);
  if(String(it.text).length>tnDelka){tnDelka=String(it.text).length; tnDelsi=it.text;}
  if(/q-xlong/.test(h)){qhBad++;console.log('  !!  kulate cislo si vzalo nejmensi pismo',it.text);break;}
  if(String(it.text).length>=9&&!/q-long/.test(h)){
    qhBad++;console.log('  !!  dlouhe kulate cislo si nereklo o mensi pismo',it.text);break;}
}
if(tnDelsi!=='1000 : 100'){qhBad++;console.log('  !!  nejdelsi kulate cislo neni "1000 : 100", ale',tnDelsi);}
console.log('nejdelsi zadani kulatych cisel:',tnDelsi,'('+tnDelka+' znaku)');
// prevody jsou prvni rodina, kde na radku stoji i jednotka za odpovedi,
// a delka se meri z celeho radku, tedy vcetne ni. Trida se proto pocita
// ze zadani, mezery a jednotky dohromady a aspon jedna otazka musi mit
// kratke zadani a dlouhy radek, jinak by se meritko divalo jen na
// zadani a nikdo by si toho nevsiml.
let uDelka=0, uDelsi='', uJenJednotka=0;
const trida=h=>/q-xlong/.test(h)?'q-xlong':/q-long/.test(h)?'q-long':'';
const chce=n=>n>=13?'q-xlong':n>=9?'q-long':'';
for(const b of ['u1','u2','u3','u4']) for(let i=0;i<3000;i++){
  const it=A.itemFromKey(b), h=A.questionHTML(it);
  const radek=String(it.text).length+String(it.unit).length+1;
  if(radek>uDelka){uDelka=radek; uDelsi=it.text+' = ? '+it.unit;}
  if(trida(h)!==chce(radek)){
    qhBad++;console.log('  !!  prevod dostal spatnou velikost pisma',it.text+' = ? '+it.unit,trida(h)||'plna');break;}
  if(String(it.text).length<9&&trida(h)) uJenJednotka++;
}
if(!uJenJednotka){qhBad++;console.log('  !!  jednotka se do delky radku nepocita, nic se o ni nezmensilo');}
// nejdelsi radek rodiny je prevod mesicu na roky, sestnact znaku
// v anglictine ("240 months = ? years") i v nemcine ("240 Monate = ?
// Jahre"), v cestine ctrnact ("240 mesicu = ? let"); tak jako tak je to
// nejmensi pismo a proti "500 - (40 + 30)" v poradi operaci to neni nic
if(uDelka!==16||!/^\d+ months = \? years$/.test(uDelsi)){
  qhBad++;console.log('  !!  nejdelsi prevod neni mesice na roky o sestnacti znacich, ale',uDelsi,uDelka);}
console.log('nejdelsi radek prevodu:',uDelsi,'('+uDelka+' znaku)');
if(/q-long|q-xlong/.test(qh('m7x8'))){qhBad++;console.log('  !!  kratka otazka si zbytecne zmensila pismo');}
if(/q-long|q-xlong/.test(qh('xm4'))){qhBad++;console.log('  !!  trojciferne nasobeni se zmensilo, i kdyz se veslo');}
if(/q-long|q-xlong/.test(qh('c1'))){qhBad++;console.log('  !!  obrazkova otazka se meri jako text');}
console.log('chyb v delce otazky:',qhBad);

// 7l. chybejici clen: tataz otazka pozpatku a pod tymz klicem
//
// Neni to rodina, ale varianta, takze se nekontroluje generator, ale to,
// co se od varianty ceka: ze uzna spravny clen a neuzna sousedni, ze klic
// zustal beze zmeny, ze se pise do krabicky pod nej a ze se varianta
// nedostane nikam, kde se o ni nezadalo.
let mvBad=0, mvN=0, mvDelka=0, mvDelsi='';
const MV={variant:'missing'};
const mv=k=>A.itemFromKey(k,MV);
for(const k of ['m6x7','m3x8','m1x9','d6x7','d2x9','a3p4','s3p4','ph1','ph5','nh1','nh5','kpb1','knb3','xm1','xd2'])
for(let i=0;i<60;i++){
  const it=mv(k); mvN++;
  if(it.key!==k){mvBad++;console.log('  !!  varianta zmenila klic',k,'->',it.key);break;}
  if(it.layout!=='lead'){mvBad++;console.log('  !!  chybejici clen nema policko vpredu',k,it.text);break;}
  if(it.variant!=='missing'){mvBad++;console.log('  !!  varianta o sobe nerekla',k);break;}
  if(!it.ask){mvBad++;console.log('  !!  chybejici clen neni receny slovy',k,it.text);break;}
  // doplneny radek musi vyjit: "6 × 7 = 42"
  const cely=A.rightAnswerText(it), pul=cely.split(' = ');
  if(pul.length!==2||eval(pul[0].replace(/×/g,'*').replace(/:/g,'/'))!==Number(pul[1])){
    mvBad++;console.log('  !!  doplneny radek nevychazi',cely);break;}
  if(pul[0].indexOf(String(it.answer))!==0){
    mvBad++;console.log('  !!  odpoved nepatri na misto policka',cely,it.answer);break;}
  // uzna svuj clen a neuzna sousedni na obe strany
  if(!it.check(String(it.answer))){mvBad++;console.log('  !!  varianta neuznala spravny clen',cely);break;}
  if(it.check(String(it.answer+1))||it.check(String(it.answer-1))){
    mvBad++;console.log('  !!  varianta uznala i sousedni clen',cely);break;}
  if(String(it.answer).length>it.maxLen){
    mvBad++;console.log('  !!  clen se nevejde do policka',it.answer,it.maxLen);break;}
  // radek se meri jako kazdy jiny, jen ma jiny tvar: policko stoji vpredu
  const h=A.questionHTML(it);
  if(h.indexOf('id="abox"')>h.indexOf('id="qtext"')){
    mvBad++;console.log('  !!  policko nestoji pred zbytkem radku',it.text);break;}
  const n=String(it.text).length;
  if(trida(h)!==chce(n)){mvBad++;console.log('  !!  chybejici clen dostal spatnou velikost pisma',it.text,trida(h)||'plna');break;}
  if(n>mvDelka){mvDelka=n; mvDelsi=it.text;}
}
// kratky nasobilkovy radek se vejde v plne velikosti, delsi do sta uz ne
if(/q-long|q-xlong/.test(A.questionHTML(mv('m6x7')))){
  mvBad++;console.log('  !!  chybejici cinitel si zbytecne zmensil pismo');}
if(!/q-long/.test(A.questionHTML(mv('nh5')))){
  mvBad++;console.log('  !!  chybejici mensenec do sta si nerekl o mensi pismo');}
// rodina, ktera prvni cislo nema co skryt, zustava presne jak byla
for(const k of ['o1','q1','z1','u1','gm1','c1']){
  const it=mv(k), plain=A.itemFromKey(k);
  if(it.layout||it.variant){mvBad++;console.log('  !!  varianta sahla na rodinu, ktera do ni nepatri',k,it.text);}
  if(it.ask!==plain.ask){mvBad++;console.log('  !!  varianta prepsala zadani cizi rodiny',k);}
}
console.log('zkontrolovano chybejicich clenu:',mvN,'| nejdelsi radek:',mvDelsi,'('+mvDelka+' znaku) | chyb:',mvBad);

// 7m. varianta jede pres skolni trat a pres kapitolu, nikam jinam
let mvTrBad=0;
const mp=A.newProfile('M'); A.DB.profiles=[mp]; A.DB.current=mp.id;
mp.grade=3; mp.curriculum='nns-matysek-3'; mp.chapter=5;
const kap5=A.CURRICULA.find(c=>c.id==='nns-matysek-3').chapters.find(x=>x.n===5);
if(!A.isPlayable(kap5)){mvTrBad++;console.log('  !!  zkouska spravnosti porad nejde vybrat');}
if(kap5.pool.variant!=='missing'){mvTrBad++;console.log('  !!  kapitola 5 si o variantu nerekla');}
// klice kapitoly jsou tytez, ktere uz hra zna; varianta je nepridava
const kap5k=A.poolKeys(kap5.pool);
if(kap5k.some(k=>!keys.includes(k))){
  mvTrBad++;console.log('  !!  kapitola 5 zavedla novy klic',kap5k.filter(k=>!keys.includes(k)).join(' '));}
const mrun=A.buildRun(mp,A.trackById('school'));
if(mrun.length!==20){mvTrBad++;console.log('  !!  spatna delka zavodu podle kapitoly 5',mrun.length);}
// opakovani z drivejsich kapitol jde pres tutez variantu, jen obrazkova
// otazka (hodiny z kapitoly 4) zustava obrazkem
const mimo=mrun.filter(x=>x.variant!=='missing');
if(mimo.some(x=>!x.svg)){
  mvTrBad++;console.log('  !!  zavod podle kapitoly 5 nese i primou otazku',(mimo.find(x=>!x.svg)||{}).text);}
if(mrun.filter(x=>x.variant==='missing').length<10){
  mvTrBad++;console.log('  !!  chybejicich clenu je v zavodu malo',mrun.filter(x=>x.variant==='missing').length);}
// sampionat bere jen to, co by trat sama nabidla, a zadna trat variantu
// nenabizi; "co ti nejde" cerpa z krabicky, tedy taky ne
const mixRun=A.buildRun(mp,A.trackById('mix'));
if(mixRun.some(x=>x.variant)){mvTrBad++;console.log('  !!  varianta se dostala do sampionatu');}
for(const it of mrun) A.record(mp,it,true,1500);
const weakRun=A.buildRun(mp,A.trackById('weak'));
if(weakRun.some(x=>x.variant)){mvTrBad++;console.log('  !!  varianta se dostala do trati co ti nejde');}
if(!weakRun.length){mvTrBad++;console.log('  !!  trat co ti nejde nic nenabidla');}
// krabicka: varianta pise pod puvodni klic, takze "6 × 7" a "▢ × 7 = 42"
// jsou jeden a tyz priklad a uroven se deli
const mq=A.newProfile('Q'); A.DB.profiles=[mq]; A.DB.current=mq.id;
A.record(mq,A.itemFromKey('m6x7'),true,1000);
A.record(mq,mv('m6x7'),true,1000);
const mkeys=Object.keys(mq.facts);
if(mkeys.length!==1||mkeys[0]!=='m6x7'){
  mvTrBad++;console.log('  !!  varianta si zalozila vlastni klic v krabicce',mkeys.join(' '));}
if(mq.facts.m6x7.reps!==2){mvTrBad++;console.log('  !!  oba tvary se nescitaji do jednoho prikladu',mq.facts.m6x7.reps);}
// hledani chybejiciho clenu je obracena operace, takze dostane vic casu
const thPlain=A.thresholds(mq,A.itemFromKey('m6x7')), thMiss=A.thresholds(mq,mv('m6x7'));
if(Math.abs(thMiss.fast/thPlain.fast-1.6)>0.001){
  mvTrBad++;console.log('  !!  chybejici clen nema nasobitel prahu 1,6',thMiss.fast/thPlain.fast);}
console.log('chyb v zapojeni chybejiciho clenu:',mvTrBad);

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
const job=A.jobById('money');
// kazda uloha dilny, at uz je na mince nebo na dilky, se resi skladanim
// na pult, musi uznat svoje vlastni reseni a neuznat o kus vic
for(const j of A.JOBS) for(const k of j.keys) for(let i=0;i<60;i++){
  const it=A.jobItemFromKey(k); shN++;
  if(it.input!=='coins'&&it.input!=='pieces'){shBad++;if(shBad<6)console.log('  !!  uloha dilny neni na skladani',k,it.input);continue;}
  if(!it.solution.length){shBad++;if(shBad<6)console.log('  !!  uloha nema reseni',k);continue;}
  if(!it.check(it.solution)){shBad++;if(shBad<6)console.log('  !!  uloha neuznala vlastni reseni',k,it.solution.join('+'));continue;}
  if(it.check(it.solution.concat([1]))){shBad++;if(shBad<6)console.log('  !!  uloha uznala i kus navic',k);continue;}
  if(it.input==='coins'){
    if(it.solution.some(c=>!A.MONEY.includes(c))){shBad++;if(shBad<6)console.log('  !!  reseni pouzilo neexistujici minci',k,it.solution.join('+'));continue;}
    if(it.amount<1){shBad++;if(shBad<6)console.log('  !!  castka je nula nebo zaporna',k,it.amount);}
  } else {
    // pocitani dilku: obrazek musi mit tolik dilku, kolik je odpoved,
    // jinak by dite pocitalo spravne a hra mu to spocitala za chybu
    const nakresleno=(it.pic.match(/<g transform="translate/g)||[]).length;
    if(nakresleno!==it.answer){shBad++;if(shBad<6)console.log('  !!  na obrazku je jiny pocet dilku, nez je odpoved',k,nakresleno,'vs',it.answer);continue;}
    if(it.answer<1||it.answer>10){shBad++;if(shBad<6)console.log('  !!  pocet dilku mimo prvni rocnik',k,it.answer);continue;}
    if(k==='wc1'&&it.answer>5){shBad++;if(shBad<6)console.log('  !!  prvni krok pocitani prelezl pet',it.answer);continue;}
    if(!it.ask){shBad++;if(shBad<6)console.log('  !!  u pocitani chybi zadani slovy',k);}
  }
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

// 13c. zadne dve palety jednoho sveta si nesmi byt barevne blizko
//
// Paleta se v kodu nelisi nicim napadnym: sousedni radek ma tentyz tvar
// a jina cisla, takze tri skoro stejna mista vedle sebe projdou ctenim
// kodu i vsemi ostatnimi kontrolami. Na obrazku se to pozna, ale jen
// tehdy, kdyz se prechod opravdu vykresli: `convert` linearGradient
// nekresli vubec, vezme prvni zarazku a vyplni ji celou plochu, takze
// dve palety, ktere se lisi spodnim koncem, na nem vyjdou stejne. Tohle
// je proto jedina kontrola, ktera rozdil mista od jeho souseda hlida
// sama od sebe.
//
// Mira: oba konce prechodu se prevedou do Lab a vezme se odmocnina ze
// souctu ctvercu obou dE, tedy vzdalenost te dvojice barev jako celku.
// Pocita se z hill1 a hill2, protoze prechod zabira na nahledu nejvic
// plochy. Palety s `dark` do toho nevstupuji: nocni zem se kresli
// pevnou dvojici barev a vlastni kopce takove palety se nikde
// neobjevi, takze srovnavat je by nerikalo nic. Srovnava se uvnitr
// sveta, protoze dve mista na jedne mape si dite srovnava, kdezto mista
// ze dvou svetu vedle sebe nikdy nestoji.
//
// Prah je 22 dE a je to laťka, kterou splnila kazda paleta pridana od
// zari 2026 (nejtesnejsi je amethyst s 23). Starsi palety ji zdaleka
// nesplnuji vsechny a nejblizsi dvojice oblohy ma 5,3, takze samotny
// prah by dnesni stav neprosel. Hlida se proto dluh: kolik dvojic pod
// prahem ma ktery svet. Cislo smi klesat, nikdy stoupat, takze nova ani
// prekreslena paleta blizko k sousedovi neprojde. Palety trati chain
// byly do 13. zari 2026 presne takove a cisla byla o ctrnact vyssi:
// okruh 5 (marsh proti school, 15), obloha 40 (sk_haze proti sk_hilltop,
// 5,7) a hlubina 16 (dp_shoal proti dp_lagoon, 15,5).
let pBad=0;
const psay=m=>{pBad++; console.log('  !!  '+m);};
const PAL_PRAH=22, PAL_DNO=5.2;
const PAL_DLUH={circuit:4, trail:11, sky:31, deep:12};
const palLab=hex=>{
  const n=parseInt(hex.slice(1),16);
  const g=v=>{v/=255; return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4);};
  const r=g((n>>16)&255), z=g((n>>8)&255), b=g(n&255);
  const f=t=>t>0.008856?Math.cbrt(t):(7.787*t+16/116);
  const X=f((r*0.4124564+z*0.3575761+b*0.1804375)/0.95047);
  const Y=f( r*0.2126729+z*0.7151522+b*0.0721750);
  const Z=f((r*0.0193339+z*0.1191920+b*0.9503041)/1.08883);
  return [116*Y-16, 500*(X-Y), 200*(Y-Z)];
};
const palDE=(a,b)=>{const x=palLab(a),y=palLab(b);return Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2]);};
const palOdstup=(a,b)=>Math.hypot(palDE(A.ENVS[a].hill1,A.ENVS[b].hill1),palDE(A.ENVS[a].hill2,A.ENVS[b].hill2));
let palNej=1e9, palNejParek='';
for(const w of A.WORLDS){
  const jmena=[...new Set(A.TRACKS.map(tr=>A.envOf({world:w.id},tr)))].filter(n=>A.ENVS[n]&&!A.ENVS[n].dark);
  const blizke=[];
  for(let i=0;i<jmena.length;i++) for(let j=i+1;j<jmena.length;j++){
    const d=palOdstup(jmena[i],jmena[j]);
    if(d<PAL_PRAH) blizke.push([d,jmena[i],jmena[j]]);
    if(d<palNej){palNej=d; palNejParek=jmena[i]+' a '+jmena[j];}
  }
  blizke.sort((a,b)=>a[0]-b[0]);
  const dluh=PAL_DLUH[w.id];
  if(dluh===undefined) psay('svet '+w.id+' nema v testu zapsany dluh blizkych palet');
  else if(blizke.length>dluh){
    psay('ve svete '+w.id+' pribyly palety blizsi nez '+PAL_PRAH+' dE: '+blizke.length+' dvojic misto '+dluh);
    for(const b of blizke.slice(0,5)) console.log('        '+b[1]+' a '+b[2]+': '+b[0].toFixed(1)+' dE');
  } else if(blizke.length<dluh)
    console.log('  ..  svet '+w.id+' ma blizkych dvojic uz jen '+blizke.length+' z '+dluh+', zapis do testu nizsi cislo');
}
// a dno, aby uz tak blizka dvojice nemohla tise srust jeste vic
if(palNej<PAL_DNO) psay('nejblizsi dve palety klesly na '+palNej.toFixed(1)+' dE ('+palNejParek+'), dno je '+PAL_DNO);
console.log('nejblizsi dve palety:',palNejParek,'('+palNej.toFixed(1)+' dE) | chyb:',pBad);

// 14. rocniky
//
// Mapa se sklada podle toho, do ktere tridy dite chodi: je na ni ucivo
// letosniho rocniku a vsech drivejsich. Drivejsi se z profilu nikdy
// neztrati, na mape je jen slozene za dvermi, viz yearOf() nize.
// Starsi profil zadny rocnik nema a musi dostat nejvyssi, jinak by mu
// nova verze vzala trati, ktere uz vidi.
let gBad=0;
const gsay=m=>{gBad++; if(gBad<10) console.log('  !!  '+m);};
// kazda trat s ucivem patri do nejakeho rocniku
for(const tr of A.TRACKS){
  const bezRocniku = tr.op==='school' || tr.op==='mix' || tr.op==='weak';
  if(!tr.grade && !bezRocniku) gsay('trat '+tr.id+' nepatri do zadneho rocniku');
  if(tr.grade && (tr.grade<1||tr.grade>3)) gsay('trat '+tr.id+' ma rocnik mimo rozsah: '+tr.grade);
  // thru je posledni rocnik, ve kterem se ucivo jeste opakuje, a nesmi byt
  // drive nez rok zavedeni ani za koncem toho, co hra zna
  if(tr.thru && (tr.thru<tr.grade||tr.thru>A.MAX_GRADE))
    gsay('trat '+tr.id+' ma thru mimo rozsah: '+tr.thru);
}
// starsi profil bez rocniku vidi porad vsechno
const gp={};
A.seedGrade(gp);
if(gp.grade!==A.MAX_GRADE) gsay('profil bez rocniku nedostal nejvyssi');
for(const tr of A.TRACKS) if(!A.inGrade(gp,tr)) gsay('starsimu profilu zmizela trat '+tr.id);
// a nesmysly se srovnaji
for(const spatny of [0,-1,9,'druha',null]){ const q={grade:spatny}; A.seedGrade(q);
  if(q.grade!==A.MAX_GRADE) gsay('nesmyslny rocnik se nesrovnal: '+spatny); }
// prvnak vidi dvacitku, ne nasobilku; tretak vidi obojí
const rk1=A.newProfile('G1',1), rk2=A.newProfile('G2',2), rk3=A.newProfile('G3',3);
if(rk1.grade!==1||rk3.grade!==3) gsay('novy profil si nepamatoval rocnik');
const vidi=(p)=>A.visibleTracks(p).map(t=>t.id);
if(!vidi(rk1).includes('a20')) gsay('prvnak nevidi do dvaceti');
if(vidi(rk1).includes('t1')) gsay('prvnak vidi nasobilku');
if(vidi(rk1).includes('a1000')) gsay('prvnak vidi tisicovku');
if(!vidi(rk2).includes('t1')||!vidi(rk2).includes('a20')) gsay('druhak nevidi nasobilku nebo dvacitku');
if(vidi(rk2).includes('a1000')) gsay('druhak vidi tisicovku');
if(!vidi(rk3).includes('a1000')||!vidi(rk3).includes('a20')) gsay('tretak neco ztratil');
// drivejsi rocnik na mape zustava, jen slozeny; z dosahu nezmizi
for(const p of [rk2,rk3]) for(const tr of A.TRACKS) if(tr.grade && tr.grade<p.grade && !A.inGrade(p,tr))
  gsay('rocnik '+p.grade+' schoval drivejsi trat '+tr.id);
// predel rocniku: yearOf() rozhoduje, co je na mape letosni, co minule
// a co teprve prijde, a ptá se na nej celá mapa misto tr.grade. Uciva se
// tyka dvojice cisel, rok zavedeni (grade) a posledni rok opakovani
// (thru); za dvermi je ucivo az po tom druhem.
const rk4=A.newProfile('G4',4);
for(const p of [rk1,rk2,rk3,rk4]) for(const tr of A.TRACKS){
  const y=A.yearOf(p,tr);
  if(['own','past','ahead'].indexOf(y)<0){gsay('yearOf vratil nesmysl '+y+' pro '+tr.id);continue;}
  // sampionat, slaba mista a trat podle skoly patri vzdycky letosku
  if(tr.op==='mix'||tr.op==='weak'||tr.op==='school'||!tr.grade){
    if(y!=='own') gsay('trat '+tr.id+' ma byt vzdycky letosni, ale pro rocnik '+p.grade+' je '+y);
    continue;
  }
  if(tr.thru && tr.thru<tr.grade) gsay('trat '+tr.id+' se opakuje driv, nez se zavede');
  const thru = tr.thru || tr.grade;
  const cekano = tr.grade>p.grade ? 'ahead' : (thru<p.grade ? 'past' : 'own');
  if(y!==cekano) gsay('yearOf('+p.grade+','+tr.id+') je '+y+', ma byt '+cekano);
  // co je na mape videt, to nikdy neni "ahead", a naopak
  if(A.inGrade(p,tr) && y==='ahead') gsay('viditelna trat '+tr.id+' oznacena jako pristi rok');
  if(!A.inGrade(p,tr) && y!=='ahead') gsay('neviditelna trat '+tr.id+' neoznacena jako pristi rok');
}
// ucivo, ktere se letos opakuje, patri do hlavniho bloku, ne za dvere.
// Tohle je ta regrese: treti trida zacina opakovanim male nasobilky
// (kapitoly 2 a 3 sedmeho dilu), stovky (kapitola 1) a hodin (kapitola 4),
// a po kroku B0 se treťákovi vsechno tohle schovalo za dvere.
for(const id of ['t1','t2','t3','t4','t5','d1','a100','clock'])
  if(A.yearOf(rk3,A.trackById(id))!=='own') gsay('treťák ma '+id+' za dvermi, i kdyz ji letos opakuje');
for(const id of ['a3','a5','a7','a10','a15','a20','bridge'])
  if(A.yearOf(rk3,A.trackById(id))!=='past') gsay('treťák ma '+id+' v hlavnim bloku, i kdyz se k ni uz nevraci');
for(const id of ['a3','a20','bridge','t1','clock'])
  if(A.yearOf(rk2,A.trackById(id))!=='own') gsay('druhak ma '+id+' jinde nez v hlavnim bloku');
// sklada se jen rocnik, ktery ma vlastni trat; ctvrty zadnou nema, takze by
// slozeni schovalo celou mapu za jedny dvere, a takove jsou vsechny starsi profily
for(const p of [rk1,rk2,rk3]) if(!A.foldsYears(p)) gsay('rocnik '+p.grade+' se neskládá, i kdyz ma vlastni trat');
if(A.foldsYears(rk4)) gsay('ctvrtak sklada mapu, i kdyz nema vlastni trat');
if(A.foldsYears(gp)) gsay('starsi profil bez rocniku sklada mapu');
// prvnak ani druhak nemaji co slozit: prvnak je na zacatku a druhak cely
// prvni rocnik opakuje. Dvere tedy patri az treti tride a je za nimi sedm
// trati, obory prvniho rocniku a most.
const minuleU=p=>A.visibleTracks(p).filter(tr=>A.yearOf(p,tr)==='past');
for(const p of [rk1,rk2]) if(minuleU(p).length)
  gsay('rocnik '+p.grade+' ma za dvermi '+minuleU(p).length+' trati, i kdyz je vsechny letos opakuje');
if(minuleU(rk3).length!==7) gsay('treťák ma za dvermi '+minuleU(rk3).length+' trati misto sedmi');
// A hlavne: v hlavnim bloku mapy, tedy bez dveri a bez ukazky, musi mit
// kazdy cerstvy profil aspon jednu trat, na kterou jde rovnou klepnout.
// Kdyby se tohle znovu rozeslo, dite se posadi k mape a nema co delat.
for(const p of [rk1,rk2,rk3,rk4]){
  const hlavni=A.visibleTracks(p).filter(tr=>A.yearOf(p,tr)==='own');
  A.DB.profiles=[p]; A.DB.current=p.id;
  const otevrene=hlavni.filter(tr=>A.unlockState(p,tr).open).map(tr=>tr.id);
  if(!otevrene.length) gsay('rocnik '+p.grade+' nema v hlavnim bloku mapy ani jednu otevrenou trat');
}
// ukazka nabizi prave jeden dalsi rocnik, nikdy vic a nikdy zpatky
for(const p of [rk1,rk2,rk3]){
  const ah=A.peekTracks(p);
  for(const tr of ah) if(tr.grade!==p.grade+1) gsay('ukazka nabidla rocnik '+tr.grade+' misto '+(p.grade+1));
  if(p.grade<3 && !ah.length) gsay('rocnik '+p.grade+' nema co ukazat');
}
if(A.peekTracks({grade:A.MAX_GRADE}).length) gsay('nejvyssi rocnik ma co ukazovat, ale nic dalsiho neni');
if(A.peekTracks(A.newProfile('G4',4)).length) gsay('ctvrtak dostal ukazku, ktera neexistuje');
// sampionat nesmi podstrcit ucivo, ktere na mape jeste neni
A.DB.profiles=[rk1]; A.DB.current=rk1.id;
rk1.autoUnlock=false;                                   // vsechno odemcene, at je videt filtr
const vyssi=new Set();
for(const tr of A.TRACKS) if(tr.grade>1) A.trackKeys(rk1,tr).forEach(k=>vyssi.add(k));
for(const it of A.buildRun(rk1,A.trackById('mix')))
  if(vyssi.has(it.key)){gsay('sampionat dal prvnakovi ucivo vyssiho rocniku: '+it.key);break;}
// rodicovska sekce a souhrn taky nemluvi o tom, co dite nema na mape
if(A.heatSpecs(rk1).some(sp=>sp.title===A.I18N.cs.trk_a1000)) gsay('heatmapa prvnakovi ukazuje tisicovku');
if(A.collectionSpecs(rk1).some(sp=>sp.title===A.I18N.cs.trk_a1000)) gsay('sbirka prvnakovi ukazuje tisicovku');
// ale co uz ma rozsviceno, o to neprijde ani mimo rocnik
rk1.stars={kpb1:true};
if(!A.collectionSpecs(rk1).some(sp=>sp.keys.indexOf('kpb1')>=0)) gsay('rozsvicena sbirka mimo rocnik zmizela');
console.log('rocniku:',A.MAX_GRADE,'| chyb:',gBad);

// 15. rozvrzeni mapy: dve karty se nikdy nesmi prekryt a zadna nesmi
// vyjet ven.
//
// Vysku karty si tenhle test pocita sam ze stylu, ne z placeBox(): kdyby
// meril obdelniky touz vyskou, ze ktere worldSpots() odvozuje rozestup,
// platilo by "neprekryvaji se" z definice a zadnou kolizi by nechytil.
// Cte tedy src/styles.css, secte z nej odsazeni, ramecek, mezery,
// nahled a radky textu, a to pro obe meritka, pro dva, tri i ctyri
// sloupce, pro nejdelsi skutecna jmena trati ve vsech trech jazycich a
// pro vsechny ctyri tvary karty. Je to jedina pojistka proti tomu, aby
// se karty zase zacaly prekryvat, takze je zamerne prisna.
let mBad=0;
const msay=m=>{mBad++;if(mBad<=12)console.log('  !!  '+m)};

/* --- co o karte rika src/styles.css --- */
const CSSSRC=fs.readFileSync(base+'styles.css','utf8');
function cssRules(src){
  const out=[],stack=[];let buf='';
  for(const ch of src.replace(/\/\*[\s\S]*?\*\//g,'')){
    if(ch==='{'){stack.push(buf.trim());buf='';}
    else if(ch==='}'){const sel=stack.pop();if(sel&&sel[0]!=='@')out.push({sel,body:buf});buf='';}
    else buf+=ch;
  }
  return out;
}
const CR=cssRules(CSSSRC);
const cbody=sel=>CR.filter(r=>r.sel.split(',').map(s=>s.trim().replace(/\s+/g,' ')).indexOf(sel)>=0);
const cdecl=(sel,prop)=>{
  const r=cbody(sel);
  for(let i=r.length-1;i>=0;i--){const m=r[i].body.match(new RegExp(prop+'\\s*:\\s*([^;}]+)'));if(m)return m[1].trim();}
  return null;
};
const cpx=v=>parseFloat(v);
// zaklad velikosti pisma: calc(Zpx * var(--tx)) -> Z
const cbase=v=>{const m=/calc\(\s*([\d.]+)px\s*\*\s*var\(--tx\)\s*\)/.exec(v);return m?+m[1]:parseFloat(v)};
const cclamp=sel=>{const v=cdecl(sel,'-webkit-line-clamp');return v?parseInt(v,10):99};
const CARD={
  pad:cpx(cdecl('.place','padding')),
  bord:cpx(/([\d.]+)px/.exec(cdecl('.place','border'))[1]),
  gap:cpx(cdecl('.place','gap')),
  thumb:(()=>{const a=cdecl('.place .thumb','aspect-ratio').split('/');return +a[1]/+a[0]})(),
  nm:cbase(cdecl('.place .nm','font-size')),nmLh:parseFloat(cdecl('.place .nm','line-height')),nmMax:cclamp('.place .nm'),
  sub:cbase(cdecl('.place .sub','font-size')),subLh:parseFloat(cdecl('.place .sub','line-height')),subMax:cclamp('.place .sub'),
  bar:cpx(cdecl('.place .bar','height')),
  foot:cbase(cdecl('.place .foot','font-size')),footLh:parseFloat(cdecl('.place .foot','line-height')),
  footMin:cpx(cdecl('.place .foot','min-height')),
  lock:cbase(cdecl('.place.locked .lockmsg','font-size')),lockLh:parseFloat(cdecl('.place.locked .lockmsg','line-height')),
  lockMax:cclamp('.place.locked .lockmsg'),
  edge:2*cpx(cdecl('.world','margin').split(/\s+/)[1])
};
const SIRKA={2:{w:cpx(cdecl('.place','width')),max:cpx(cdecl('.place','max-width'))},
             3:{w:cpx(cdecl('.world[data-cols="3"] .place','width')),max:Infinity},
             4:{w:cpx(cdecl('.world[data-cols="4"] .place','width')),max:Infinity}};
const MERITKA={};
for(const g of [1,2,3,4,5]){const r=cbody('html[data-grade="'+g+'"]');if(r.length)MERITKA[g]=parseFloat(/--tx\s*:\s*([\d.]+)/.exec(r[0].body)[1]);}
for(const k of Object.keys(CARD)) if(!(CARD[k]>0)) msay('ze stylu se nepodarilo precist '+k+': '+CARD[k]);

/* --- nejdelsi texty, ktere na karte opravdu stoji --- */
// Sirku pismene bereme 0,58 em; pro Baloo 2 i Nunito je to spis vic nez
// min, takze odhad poctu radku nadhodnocuje a test je tim prisnejsi.
const EM=0.58;
const radku=(txt,fs,w,max)=>Math.min(max,Math.max(1,Math.ceil(txt.length*fs*EM/w)));
const NEJ={nm:'',sub:'',lock:''};
for(const l of ['cs','en','de']){
  const D=A.I18N[l];
  const jmena=Object.keys(D).filter(k=>/^trk_/.test(k)&&D[k+'s']).map(k=>D[k])
    .concat([D.backTitle,D.peekTitle,D.shopTitle]);
  const podtitulky=Object.keys(D).filter(k=>/^trk_.+s$/.test(k)&&D[k.slice(0,-1)]).map(k=>D[k])
    .concat([D.backSub.replace('{0}','1. a 2.'),D.peekSub,D.peekOpenSub,D.shopSub]);
  const duvody=[D.lockByParent,D.lockHalfTable,D.lockRaceFirst]
    .concat(jmena.map(n=>D.lockFinish.replace('{0}',n)))
    .concat(jmena.map(n=>D.lockOpen.replace('{0}',n)));
  for(const [kde,pole] of [['nm',jmena],['sub',podtitulky],['lock',duvody]])
    for(const s of pole) if(s&&s.length>NEJ[kde].length) NEJ[kde]=s;
}
if(NEJ.nm.length<16||NEJ.sub.length<20||NEJ.lock.length<16)
  msay('nejdelsi texty na karte vypadaji podezrele kratke: '+JSON.stringify(NEJ));

/* --- vyska karty, spoctena nezavisle na app.js --- */
// tvary: 'trat' (otevrena trat s pruhem postupu), 'zamcena', 'dvere'
// (zpatky do minulych let, na pristi rok, dilna) a 'bezpruhu'
// (sampionat a "co ti nejde", ktere pruh nemaji)
function vyskaKarty(wPx,tx,tvar){
  const inner=wPx-2*CARD.pad-2*CARD.bord;
  const nmFs=CARD.nm*tx, subFs=CARD.sub*tx, lockFs=CARD.lock*tx;
  const noha=Math.max(CARD.footMin,CARD.foot*tx*CARD.footLh);
  let h=2*CARD.pad+2*CARD.bord+inner*CARD.thumb
    + radku(NEJ.nm,nmFs,inner,CARD.nmMax)*nmFs*CARD.nmLh
    + radku(NEJ.sub,subFs,inner,CARD.subMax)*subFs*CARD.subLh;
  if(tvar==='zamcena') h+=3*CARD.gap+radku(NEJ.lock,lockFs,inner,CARD.lockMax)*lockFs*CARD.lockLh;
  else if(tvar==='trat') h+=4*CARD.gap+CARD.bar+noha;
  else h+=3*CARD.gap+noha;
  return h;
}
const TVARY=['trat','zamcena','dvere','bezpruhu'];

/* --- dva sloupce: zamrzle polohy --- */
// Tenhle seznam se 13. zari 2026 **vedome zmenil**. Do te doby drzel
// polohy, ktere telefon mel pred krokem C (rozhodnuti R6), jenze ty jely
// hadovite: mista se stridala po stranach a druhy radek sel zprava
// doleva. Uzivatel to zkusil s osmiletym synem a dite nepoznalo, kam
// cesta pokracuje. Od te chvile se mapa cte jako stranka, tedy po radcich
// zleva doprava, a to ve vsech sirkach vcetne telefonu; prvni dve mista
// proto stoji vedle sebe v jednom radku a maji tutez vysku. Viz
// PROJECT-STATE, oddil 9.
const VLEVO=[0.7,52.2,0.9,50.7,0.9,52.3,1.2,52.2];
{
  global.document.documentElement.dataset.grade='';
  appEl.clientWidth=375;
  const s=A.worldSpots({world:'circuit'},8);
  const ted=s.map(x=>+x.left.toFixed(1));
  if(JSON.stringify(ted)!==JSON.stringify(VLEVO))
    msay('dva sloupce se hnuly do stran: '+JSON.stringify(ted)+' misto '+JSON.stringify(VLEVO));
  const b=A.placeBox(2);
  if(b.w!==44) msay('dva sloupce zmenily sirku karty: '+b.w);
  if(Math.abs(s[1].y-s[0].y)>0.05) msay('dve mista v jednom radku nestoji ve stejne vysce');
  if(Math.abs(s[2].y-s[0].y-b.step)>0.05) msay('rozestup radku neodpovida kroku karty');
}

/* --- nic se nesmi prekryt, pro obe meritka a vsechny sirky --- */
// polovina stopy silnice (stroke-width 16 na .worldroad) a ctyri pixely
// vzduchu, ktere maji zbyt mezi carou a kartou
const VZDUCH=8+4;
const OKNA=[[360,2],[375,2],[568,2],[600,3],[768,3],[812,3],[900,4],[1024,4],[1280,4]];
for(const rocnik of ['','1']){
  const tx=rocnik?MERITKA[rocnik]:1;
  global.document.documentElement.dataset.grade=rocnik;
  for(const [appW,cols] of OKNA){
    appEl.clientWidth=appW;
    const svet=appW-CARD.edge;
    const b=A.placeBox(cols);
    const wPx=Math.min(svet*SIRKA[cols].w/100,SIRKA[cols].max);
    const vlastni=Math.max(...TVARY.map(t=>vyskaKarty(wPx,tx,t)));
    // app.js musi na kartu myslet aspon tak velkou, jaka opravdu je
    if(b.h+0.05<vlastni) msay('tx '+tx+', '+appW+' px, cols '+cols+': placeBox pocita s kartou '
      +b.h.toFixed(1)+' px, ale nejvyssi tvar ma '+vlastni.toFixed(1)+' px');
    for(let n=8;n<=24;n++){
      const s=A.worldSpots({world:'circuit'},n,n>12?5:null,cols);
      if(s.length!==n){msay('worldSpots vratil '+s.length+' mist misto '+n);continue;}
      // Mapa se cte jako stranka: radky jdou shora dolu a v radku roste
      // left s poradim. Radek pozna podle toho, ze maji mista tutez
      // vysku. Driv se jelo hadovite a osmilety syn uzivatele nepoznal,
      // kam cesta pokracuje; tohle je kontrola proti navratu toho tvaru.
      for(let i=1;i<n;i++){
        if(s[i].y<s[i-1].y-0.05)
          msay('cols '+cols+', n '+n+': misto '+i+' stoji vys nez '+(i-1));
        else if(Math.abs(s[i].y-s[i-1].y)<0.05&&s[i].left<=s[i-1].left)
          msay('cols '+cols+', n '+n+': v radku nejde misto '+i+' doprava od '+(i-1));
      }
      // Vratna cara na konci radku vede prazdnym pasem mezi radky, nikdy
      // pres karty: ma byt vodorovna, dost dlouha na to, aby byla videt,
      // a cela sestnactipixelova stopa silnice se musi vejit mezi spodek
      // horniho radku a vrsek dolniho, a to jeste se ctyrmi pixely
      // vzduchu na kazde strane. Osm plus ctyri, tedy VZDUCH nize: samo
      // "neprekryva se" by proslo i pri dvacetipixelove mezere, ve ktere
      // silnice viditelne lezi na kartach.
      {
        const vyska=Math.round(s.reduce((m,x)=>Math.max(m,x.y),0)+b.h+A.PLACE_GAP);
        const cmds=A.worldRoad(s,vyska).match(/[MLC][^MLC]*/g)
          .map(c=>c.slice(1).replace(/,/g,' ').trim().split(/\s+/).map(Number))
          .map(v=>({v,konec:v.slice(-2)}));
        const radky=s.map(x=>x.y).filter((y,i,a)=>a.indexOf(y)===i).sort((x,y)=>x-y);
        // o kolik procent mapy se cesta na kterem konci radku vraci
        const cesty=s.map((x,i)=>i>0&&x.left+2*(x.cx-x.left)<=s[i-1].left?s[i-1].cx-x.cx:0)
          .filter(Boolean);
        let cur=null,vratnych=0;
        for(const c of cmds){
          const p=c.konec;
          if(cur&&c.v.length===2&&Math.abs(p[1]-cur[1])<0.01&&Math.abs(p[0]-cur[0])>0.01){
            const siroka=Math.abs(p[0]-cur[0]),ma=cesty[vratnych]||0;
            vratnych++;
            const nad=radky.filter(r=>r+b.h<=p[1]+0.05).pop();
            const pod=radky.filter(r=>r>=p[1]-0.05)[0];
            if(nad==null||pod==null||p[1]-VZDUCH<nad+b.h||p[1]+VZDUCH>pod)
              msay('cols '+cols+', n '+n+': vratna cara v '+p[1].toFixed(1)+' px se dotyka karet');
            // aspon pulka navratu je rovny usek, zbytek jsou dve zatacky
            if(siroka<ma/2-0.05)
              msay('cols '+cols+', n '+n+': vratna cara ma '+siroka.toFixed(1)+' z '+ma.toFixed(1)+' %');
          }
          cur=p;
        }
        if(vratnych!==cesty.length)
          msay('cols '+cols+', n '+n+': cesta ma '+vratnych+' vratnych car misto '+cesty.length);
      }
      // obdelniky v pixelech: vodorovne z procent sirky mapy, svisle
      // z vlastni spoctene vysky, ne z te, kterou pocita mapa. Kazda
      // karta se bere jako nejvyssi tvar, protoze na kterem miste ktery
      // tvar stoji, rozhoduje az postup ditete.
      const r=s.map(x=>({l:x.left*svet/100,r:x.left*svet/100+wPx,t:x.y,b:x.y+vlastni}));
      for(let i=0;i<r.length&&mBad<=12;i++){
        if(s[i].left<0||s[i].left+SIRKA[cols].w>100){
          msay('tx '+tx+', cols '+cols+', n '+n+': misto '+i+' vyjelo ven ('
            +s[i].left.toFixed(1)+' az '+(s[i].left+SIRKA[cols].w).toFixed(1)+' %)');break;}
        for(let j=i+1;j<r.length;j++){
          if(r[i].l<r[j].r-0.05&&r[j].l<r[i].r-0.05&&r[i].t<r[j].b-0.05&&r[j].t<r[i].b-0.05){
            msay('tx '+tx+', '+appW+' px, cols '+cols+', n '+n+': mista '+i+' a '+j
              +' se prekryvaji o '+Math.min(r[i].b-r[j].t,r[j].b-r[i].t).toFixed(1)+' px');break;
          }
        }
      }
      if(mBad>12)break;
    }
  }
}
global.document.documentElement.dataset.grade='';
appEl.clientWidth=360;
// tabulka meritek v app.js a v CSS musi rikat totez; hlida to i
// style.test.js, tady je to proto, ze se z ni pocita vyska karty
for(const g of Object.keys(MERITKA))
  if(A.TX_BY_GRADE[g]!==MERITKA[g])
    msay('rocnik '+g+' ma v app.js meritko '+A.TX_BY_GRADE[g]+', v CSS '+MERITKA[g]);
// tri sloupce od 600 px, ctyri od 900 px, dva na telefonu na vysku.
// Telefon polozeny na bok ma pres 600 px sirky, takze uz ma tri sloupce
// a orientaci "wide": rozhoduje sirka okna, ne to, co je to za pristroj.
for(const [w,h,cols,ori] of [[375,812,2,'tall'],[812,375,3,'wide'],[768,1024,3,'tall'],
                             [1024,768,4,'wide'],[900,600,4,'wide'],[640,360,3,'wide'],
                             [568,320,2,'tall']]){
  global.window.innerWidth=w; global.window.innerHeight=h; A.layoutClass();
  if(A.mapCols()!==cols) msay(w+'x'+h+' dalo '+A.mapCols()+' sloupcu misto '+cols);
  if(global.document.documentElement.dataset.o!==ori)
    msay(w+'x'+h+' dalo orientaci '+global.document.documentElement.dataset.o+' misto '+ori);
}
global.window.innerWidth=375; global.window.innerHeight=812; A.layoutClass();
console.log('chyb v rozvrzeni mapy:',mBad);

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
