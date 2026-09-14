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
src+="\n;module.exports={itemFromKey,MULT,ADD,mk,dk,ak,sk,H_BUCKETS,K_BUCKETS,as1000Keys,as1000Stage,C_BUCKETS,clockKeys,clockStage,X_BUCKETS,beyondKeys,beyondStage,O_BUCKETS,roundKeys,roundStage,Q_BUCKETS,chainKeys,chainStage,Z_BUCKETS,opsKeys,opsStage,G_BUCKETS,tensKeys,tensStage,U_BUCKETS,unitKeys,unitsStage,R_BUCKETS,divremKeys,divremStage,V_BUCKETS,splitKeys,splitStage,V_PLACE,J_BUCKETS,pickKeys,isPickKey,surfaceOf,questionHTML,keypadHTML,defaultCheck,slotsOf,rightAnswerText,missHint,thresholds,crossesTen,as20Keys,unlockState,seedOpened,rememberUnlocks,trackKeys,newProfile,buildRun,TRACKS,DB,petSVG,rideSVG,duckSVG,PET,PET_SHAPES,PETS,RIDES,DUCKS,DUCK,DUCK_BODY,DUCK_PAT,DUCK_HEAD,DUCK_EYE,DUCK_GEAR,DUCK_PARTS,DUCK_LAYERS,BODY_LAYER,PAT_LAYER,HEAD_LAYER,EYE_LAYER,GEAR_LAYER,duckFit,partInk,DUCK_INK,duckPartById,duckLayerOf,duckBodyOf,ownsDuckPart,wearDuckPart,seedDuck,STARTERS,isPet,itemById,ENVS,circuit,route,routeOf,atU,sceneSVG,sceneThumb,E_STAGES,stageKeys,bridgeStage,BANDS,bandKeys,seedBands,mastery,CURRICULA,poolKeys,poolSize,schoolPool,schoolReady,isPlayable,playableChapters,normalizeChapter,visibleTracks,chapterOf,trackById,chapterJobs,JOBS,jobStage,jobById,jobsInGrade,buildJob,jobItemFromKey,MONEY,fewestCoins,PAINTS,isJobKey,record,I18N,STAR_LV,starred,starCount,seedStars,trackSpec,shopSpec,collectionSpecs,starsAll,tokenSVG,tokenGridSVG,revealSVG,WORLDS,worldById,envOf,seedWorld,ridesOrder,ALL_ITEMS,MAX_GRADE,seedGrade,inGrade,gradeOf,peekTracks,yearOf,foldsYears,overallMastery,heatSpecs,collectionSpecs,worldSpots,worldRoad,placeBox,placeHeight,PLACE_GAP,PLACE_MAX,WORLD_EDGE,TX_BY_GRADE,txNow,layoutClass,mapCols};";
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
  r:[0,10],        // deleni se zbytkem: podil 1 az 10, zbytek 0 az 9
  v:[1,900],       // rozklad cisla: jednotky 1 az 9 az po stovky 100 az 900
  j:[0,2],         // vyber z nabidky: ktere z nabidnutych tlacitek je to spravne
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
A.divremKeys(A.R_BUCKETS.map(b=>b.id)).forEach(k=>keys.push(k));
A.splitKeys(A.V_BUCKETS.map(b=>b.id)).forEach(k=>keys.push(k));
A.pickKeys(A.J_BUCKETS.map(b=>b.id)).forEach(k=>keys.push(k));
A.clockKeys().forEach(k=>keys.push(k));
const say=(k,m)=>{bad++; if(bad<8) console.log('  !!  '+m+'   ['+k+']');};
// odpoved je vetsinou jedno cislo, ale vstupni prvek se dvema policky
// odpovida dvema hodnotami naraz (podil a zbytek), takze se vsude nize
// pracuje se seznamem hodnot a s tim, co se do policek napsalo
const vals=it=>Array.isArray(it.answer)?it.answer:[it.answer];
const wrote=(it,v)=>Array.isArray(it.answer)?v.map(String):String(v[0]);
const mlen=(it,i)=>Array.isArray(it.maxLen)?it.maxLen[i]:it.maxLen;
for(const k of keys) for(let i=0;i<40;i++){
  const it=A.itemFromKey(k); checked++;
  const r=RANGE[k[0]];
  if(!r){say(k,'rodina nema v testu uvedeny rozsah odpovedi');break;}
  const odp=vals(it);
  if(odp.some(a=>!Number.isInteger(a)||a<r[0]||a>r[1])){
    say(k,'odpoved mimo rozsah rodiny: '+odp.join(' ')+' neni v '+r.join(' az '));continue;
  }
  // zadani, ktere je aritmeticky radek, se overi spoctenim; obrazkova
  // otazka zadny takovy radek nema a overuje se jen pres check
  // otazka s jednotkou neni aritmeticky radek, i kdyby v jednotce nejaky
  // ten znak stal: "3 m" se nepocita, cely vypocet je v prevodu samotnem
  // deleni se zbytkem taky neni: "36 : 5" je 7,2 a odpoved je 7 a 1,
  // tedy dve hodnoty, ktere se z radku spoctou az dohromady
  if(/[+\-×:]/.test(it.text) && !it.unit && odp.length===1){
    const val=eval(it.text.replace(/×/g,'*').replace(/:/g,'/'));
    if(val!==it.answer){say(k,'zadani nesedi s odpovedi: '+it.text+' je '+val+', ma byt '+it.answer);continue;}
  } else if(!it.svg && !it.ask){
    // otazka musi byt sama o sobe srozumitelna: bud je to vypocet, nebo
    // obrazek, nebo je slovy receno, co se ma udelat. Holy pocet bez
    // zadani by dite jen koukalo na cislo a hadalo.
    say(k,'otazka neni ani vypocet, ani obrazek, ani otazka slovy');continue;
  }
  // kazda otazka musi uznat svou odpoved a neuznat sousedni; u dvou
  // policek se check vola polem a kazda hodnota se posuzuje zvlast,
  // takze se zkousi zkazit vzdycky jen jedna z nich
  if(!it.check(wrote(it,odp))){say(k,'otazka neuznala vlastni odpoved '+odp.join(' '));continue;}
  const vedle=odp.some((a,j)=>it.check(wrote(it,odp.map((b,l)=>l===j?b+1:b))));
  if(vedle){say(k,'otazka uznala i spatnou odpoved vedle '+odp.join(' '));continue;}
  // a musi jit zadat na tom, co nabizi
  if(['pad','pad2','pad3','pick'].indexOf(it.input)<0){say(k,'nezname vstupni zarizeni '+it.input);continue;}
  if(A.slotsOf(it)!==odp.length){say(k,A.slotsOf(it)+' policek, ale '+odp.length+' hodnot v odpovedi');continue;}
  const siroka=odp.some((a,j)=>String(a).length>mlen(it,j));
  if(siroka){say(k,'odpoved '+odp.join(' ')+' se nevejde do policka o '+it.maxLen+' znacich');}
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

// 3a. osmadvacet zvirat
//
// Krok H6 nahradil jeden parametricky tvar dvanacti vlastnimi kresbami
// a slibil u toho jednu vec: kresba je jedine, co se smi zmenit. Na id
// visi zkusenosti a vlastnictvi, na cene to, na co dite setri, a jmeno
// i barva jsou duvod, proc si dite zvire vybralo. Proto je tabulka niz
// zamrazena: kdyz se v ni cokoli hne, nekomu se zmenilo neco, co uz ma.
// Krok H7 pridal sestnact dalsich a zaradil je do katalogu podle ceny,
// takze se poradi radku zmenilo; id, cena, barvy, tvar ani jmeno se
// u puvodnich dvanacti nezmenily o pismeno, a poradi v mrizce garaze
// neni nic, co uz dite ma.
//
// Samotnou kresbu test neuvidi, tu je nutne vyrenderovat a prohlednout.
// Spocitat se da zbytek: ze zadne zvire nevyjede z ramu v zadnem ze tri
// stupnu, ze oci a usmev sedi tam, kam si je tvar rekl, a ze se kazde
// zvire kresli vlastni funkci, ne nahradnikem.
let zvBad=0;
const zvsay=m=>{zvBad++;console.log('  !!  '+m);};
const ZVTAB=[
  ['pet_bimbo','dolphin', '#7ad3ff','#3ea8e0', 25,'Bimbo'],
  ['pet_lupi', 'critter', '#ffd166','#e3a521', 30,'Lupi'],
  ['pet_mecha','bear',    '#c79b73','#9c7350', 30,'Méďa'],
  ['pet_kocka','cat',     '#ffb35c','#d9832a', 35,'Mourek'],
  ['pet_kiki', 'rabbit',  '#ff9ec4','#e56d9d', 40,'Kiki'],
  ['pet_zub',  'croc',    '#a4e768','#6fbb34', 40,'Zoubek'],
  ['pet_berus','ladybug', '#ff5b5b','#2b2b33', 45,'Beruška'],
  ['pet_zaba', 'frog',    '#8ee83f','#4a9e1f', 55,'Skokánek'],
  ['pet_duha', 'unicorn', '#d3a4ff','#9a6ae0', 60,'Duháček'],
  ['pet_puk',  'axolotl', '#8ee6d5','#4bb8a4', 60,'Puk'],
  ['pet_zelva','turtle',  '#cfe08a','#a4713a', 65,'Krunýřek'],
  ['pet_flek', 'dog',     '#ffb3a1','#e0705a', 70,'Flíček'],
  ['pet_jezek','hedgehog','#f0d3a8','#8a6a4a', 75,'Bodlinka'],
  ['pet_sova', 'owl',     '#b9a4ff','#7d63d8', 80,'Sovík'],
  ['pet_liska','fox',     '#ff7a3c','#d9521c', 85,'Ryška'],
  ['pet_tucnak','penguin','#4a5a78','#2b3852', 95,'Tučňáček'],
  ['pet_drak', 'dragon',  '#6fe0a8','#2ba36c',100,'Dráček'],
  ['pet_kapy', 'capybara','#b5764a','#8a5230',105,'Kapík'],
  ['pet_panda','panda',   '#f2efe6','#3a3a44',115,'Bambusák'],
  ['pet_hvezd','hornling','#ffe17a','#e0ab1f',120,'Hvězdík'],
  ['pet_lenochod','sloth','#c9b89a','#8c7a5e',125,'Lenoušek'],
  ['pet_slon', 'elephant','#b3bccd','#7d879b',135,'Dupálek'],
  ['pet_noc',  'bat',     '#6d7cff','#3a44b8',150,'Noční'],
  ['pet_lev',  'lion',    '#ffd07a','#d9902a',150,'Hřívák'],
  ['pet_zralok','shark',  '#9fb3c8','#5b7490',165,'Ploutvík'],
  ['pet_papous','parrot', '#4aa8ff','#ffc43f',180,'Pestrouš'],
  ['pet_chobot','octopus','#ff7a6b','#d9443a',190,'Osminožka'],
  ['pet_trex', 'trex',    '#f2a54a','#c26f22',200,'Dinouš']
];
if(A.PETS.length!==ZVTAB.length) zvsay('zvirat uz neni '+ZVTAB.length+', ale '+A.PETS.length);
ZVTAB.forEach((z,i)=>{
  const [id,shape,c1,c2,cost,cz]=z, p=A.PETS[i];
  if(!p||p.id!==id){zvsay('zvire '+i+' uz neni '+id);return;}
  if(p.cost!==cost) zvsay(id+' stoji '+p.cost+' misto '+cost+', dite setrilo na jinou cenu');
  if(p.c1!==c1||p.c2!==c2) zvsay(id+' zmenilo barvu, a podle barvy si ho dite vybralo');
  if(p.shape!==shape) zvsay(id+' kresli '+p.shape+' misto '+shape);
  if(A.I18N.cs[id]!==cz) zvsay(id+' se cesky uz nejmenuje '+cz);
  ['cs','en','de'].forEach(j=>{ if(!A.I18N[j][id]) zvsay(id+' nema jmeno v jazyce '+j); });
});
// katalog je videt cely od prvni chvile a je razeny od nejlevnejsiho,
// takze dite vidi, na co setri, a hned vedle to, co si koupi dneska
for(let i=1;i<A.PETS.length;i++)
  if(A.PETS[i].cost<A.PETS[i-1].cost)
    zvsay('katalog uz neni razeny od nejlevnejsiho: '+A.PETS[i-1].id+' > '+A.PETS[i].id);
// a nova rada nesmi byt zed na konci: nejlevnejsi z H7 musi byt levnejsi
// nez nejdrazsi z puvodnich dvanacti
const stareZ=['pet_bimbo','pet_lupi','pet_mecha','pet_kiki','pet_zub','pet_duha',
              'pet_puk','pet_flek','pet_sova','pet_drak','pet_hvezd','pet_noc'];
const ceny=k=>A.PETS.filter(p=>k(p.id)).map(p=>p.cost);
if(Math.min(...ceny(id=>!stareZ.includes(id)))>=Math.max(...ceny(id=>stareZ.includes(id))))
  zvsay('nova zvirata zacinaji az za nejdrazsim starym, cela rada vypada jako zed');
// kazde zvire ma vlastni kresbu; nahradnik `plain` je jen pojistka pro
// tvar, o kterem tahle verze nikdy neslysela, a nesmi kreslit nikoho
const tvaryZ=A.PETS.map(p=>p.shape);
if(new Set(tvaryZ).size!==tvaryZ.length) zvsay('dve zvirata sdileji tvar: '+tvaryZ.join(','));
tvaryZ.forEach(t=>{ if(!A.PET_SHAPES[t]) zvsay('tvar '+t+' v PET_SHAPES neexistuje, kresli se nahradnik'); });
if(tvaryZ.includes('plain')) zvsay('nekdo se kresli nahradnikem plain');
// nahradnik ale musi fungovat, protoze na nej spadne starsi profil
// s tvarem z novejsi verze
if(/NaN|undefined/.test(A.petSVG({id:'x',shape:'neexistuje',c1:'#ffd166',c2:'#e3a521'},2)))
  zvsay('nezname zvire rozbije kresbu misto toho, aby spadlo na nahradnika');

// ram je 100 x 118 a kresba je v nem zvetsena skupinovou transformaci.
// Zadny tvar se neotaci a vsechnyZ cesty jsou psane absolutne, takze se
// body daji precist primo z kresbyZ a prepocitat stejne, jako je
// prepocita prohlizec; tloustka tahu se pricita, protoze tah lezi na
// obe strany cesty.
const sn=v=>+(+v).toFixed(2);
function bodyKresby(svg){
  const out=[], el=/<(circle|ellipse|path)\b[^>]*>/g;
  let m;
  while((m=el.exec(svg))){
    const s=m[0], sw=/stroke-width="([\d.]+)"/.exec(s);
    const pad=sw?+sw[1]/2:0, add=(x,y)=>out.push([x,y,pad]);
    if(m[1]==='circle'){
      const cx=+/cx="(-?[\d.]+)"/.exec(s)[1], cy=+/cy="(-?[\d.]+)"/.exec(s)[1], r=+/ r="(-?[\d.]+)"/.exec(s)[1];
      add(cx-r,cy);add(cx+r,cy);add(cx,cy-r);add(cx,cy+r);
    } else if(m[1]==='ellipse'){
      const cx=+/cx="(-?[\d.]+)"/.exec(s)[1], cy=+/cy="(-?[\d.]+)"/.exec(s)[1],
            rx=+/rx="(-?[\d.]+)"/.exec(s)[1], ry=+/ry="(-?[\d.]+)"/.exec(s)[1];
      add(cx-rx,cy);add(cx+rx,cy);add(cx,cy-ry);add(cx,cy+ry);
    } else {
      const d=/ d="([^"]+)"/.exec(s)[1], n=d.match(/-?[\d.]+/g)||[];
      // rizeni bezierovy krivky lezi vzdycky vne krivky, takze je to
      // odhad na jistotu, nikdy ne naopak
      for(let i=0;i+1<n.length;i+=2) add(+n[i],+n[i+1]);
    }
  }
  return out;
}
const vsechnyZ=[];
A.PETS.forEach(p=>[1,2,3].forEach(st=>{
  const svg=A.petSVG(p,st);
  vsechnyZ.push(svg);
  const f=/translate\((-?[\d.]+) (-?[\d.]+)\) scale\(([\d.]+)\) translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(svg);
  if(!f){zvsay(p.id+' ztratilo skupinovou transformaci, kotvy uz nesedi s ramem');return;}
  const [tx,ty,sc,ox,oy]=f.slice(1).map(Number);
  // stupen se pozna i bez hvezdy: zvire roste
  if(sc!==(st===1?.84:st===2?1:1.12)) zvsay(p.id+' ma ve stupni '+st+' meritko '+sc);
  for(const [x,y,pad] of bodyKresby(svg)){
    const px=tx+sc*(x+ox), py=ty+sc*(y+oy), q=pad*sc;
    if(px-q<0||px+q>100||py-q<0||py+q>118){
      zvsay(p.id+' stupen '+st+' vyjelo z ramu: '+x+','+y+' -> '+px.toFixed(1)+','+py.toFixed(1));
      break;
    }
  }
  // oci a usmev jsou spolecny obal, ne vec kazdeho tvaru, takze musi
  // sedet presne tam, kam si tvar rekl
  const d=A.PET_SHAPES[p.shape](p,st);
  if(!d.eye||!d.eye.xs||!d.eye.xs.length) zvsay(p.id+' nerika, kam patri oci');
  else{
    d.eye.xs.forEach(cx=>{
      if(svg.indexOf('<ellipse cx="'+sn(cx)+'" cy="'+sn(d.eye.y)+'" rx="'+sn(d.eye.r)+'"')<0)
        zvsay(p.id+' stupen '+st+': oko nesedi na '+cx+','+d.eye.y);
    });
    if(d.eye.xs.length>2) zvsay(p.id+' ma '+d.eye.xs.length+' oci');
  }
  if(d.mouth===undefined) zvsay(p.id+' nerika, kde ma pusu');
  else if(d.mouth!=='own'){
    if(svg.indexOf('M'+sn(d.mouth.x-d.mouth.w/2)+' '+sn(d.mouth.y)+' Q')<0)
      zvsay(p.id+' stupen '+st+': usmev nesedi na '+d.mouth.x+','+d.mouth.y);
    if(d.mouth.y<=d.eye.y) zvsay(p.id+' ma pusu nad ocima');
  }
  // hvezda stupne sviti jen ve tretim stupni a nesmi padnout na oko
  const hvezdZ=(svg.match(/fill="#ffd166" stroke="#e0ab1f"/g)||[]).length;
  if(st===3&&hvezdZ!==1) zvsay(p.id+' ma ve tretim stupni '+hvezdZ+' hvezdZ misto jedne');
  if(st<3&&hvezdZ) zvsay(p.id+' sviti hvezdou uz ve stupni '+st);
  if(st===3){
    const [hx,hy]=d.star||A.PET.STAR;
    d.eye.xs.forEach(cx=>{ if(Math.hypot(hx-cx,hy-d.eye.y)<8.5+d.eye.r)
      zvsay(p.id+': hvezda stupne leze na oko'); });
  }
}));
// na obojim stoji kontrola ramu: otoceny tvar schova, kde skoncil,
// a relativni prikaz v ceste se necha precist jen po rade
const kresbyZ=vsechnyZ.join('');
if(/rotate\(/.test(kresbyZ)) zvsay('nektere zvire se otaci, kontrola ramu tim prestava platit');
for(const dm of kresbyZ.match(/ d="[^"]+"/g)||[]){
  if(/[a-z]/.test(dm.slice(4).replace(/[MLCQZAHVS\d.\s-]/g,'')))
    zvsay('relativni prikaz v ceste: '+dm.slice(0,40));
}
console.log('zvirata:',zvBad?'chyb '+zvBad:'v poradku');

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

// 3c. kacenciny barvy, tedy vrstva Telo
//
// Vrstva je datovy model, ne jen kresba, takze se hlida oboji. Z kresby
// to, co se spocitat da: ze se kazda barva vykresli, ze se barvy navzajem
// lisi a ze zadna nesplyne s bilou dlazdici v garazi. Barvy vypadaji
// v kode odlisne a na obrazku stejne, viz krok D, takze se rozdil meri
// v Lab, ne odhaduje; prah 25 dE je s rezervou nad tim, co dite na
// dlazdici sirokou 104 px rozezna.
// Z modelu to, ze koupeny dil nejde ztratit: obleknuti jine barvy nesmi
// sahnout na seznam koupenych. Vratit dil taky nejde, stejne jako se
// neda vratit nater.
const labOf=hex=>{
  const n=parseInt(hex.slice(1),16);
  const g=v=>{v/=255; return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4);};
  const r=g((n>>16)&255), z=g((n>>8)&255), b=g(n&255);
  const f=t=>t>0.008856?Math.cbrt(t):(7.787*t+16/116);
  const X=f((r*0.4124564+z*0.3575761+b*0.1804375)/0.95047);
  const Y=f( r*0.2126729+z*0.7151522+b*0.0721750);
  const Z=f((r*0.0193339+z*0.1191920+b*0.9503041)/1.08883);
  return [116*Y-16, 500*(X-Y), 200*(Y-Z)];
};
const deLab=(a,b)=>{const x=labOf(a),y=labOf(b);return Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2]);};
let bBad=0;
const bsay=m=>{bBad++;console.log('  !!  '+m);};
const BODY_PRAH=25, DLAZDICE='#ffffff';   // .item ma background var(--paper)
const TELA=A.DUCK_BODY, zdarmaTelo=TELA[0];
if(TELA.length!==10) bsay('tel uz neni deset, ale '+TELA.length);
if(new Set(TELA.map(x=>x.id)).size!==TELA.length) bsay('dve tela maji stejne id');
if(TELA.some(x=>A.duckLayerOf(x)!==A.BODY_LAYER)) bsay('telo, ktere nepatri do vrstvy telo');
if(TELA.some(x=>A.duckPartById(x.id)!==x)) bsay('dil nejde najit podle id');
if(zdarmaTelo.cost!==0) bsay('prvni telo neni zdarma, stoji '+zdarmaTelo.cost);
if(zdarmaTelo.c1||zdarmaTelo.c2) bsay('klasicka zluta je zapsana dvakrat, na kacence i na dilu');
for(let i=1;i<TELA.length;i++) if(TELA[i].cost<TELA[i-1].cost)
  bsay('katalog neni razeny od nejlevnejsiho: '+TELA[i-1].id+' '+TELA[i-1].cost+' pred '+TELA[i].id+' '+TELA[i].cost);
// cena cele vrstvy je zapsane cislo, ne dopoctene: kdyz se posune, ma se
// na to kouknout. Plan kroku H2 pocital se 145, soucet vypsanych cen je 120.
const CENA_TEL=120;
const cenaTel=TELA.reduce((s,x)=>s+x.cost,0);
if(cenaTel!==CENA_TEL) bsay('vrstva Telo stoji '+cenaTel+' soucastek, zapsano bylo '+CENA_TEL);
// zobak je oranzovy, pokud telo nerekne jinak, a jinak rekne jenom jedno
const jinyZobak=TELA.filter(x=>x.beak);
if(jinyZobak.length!==1 || jinyZobak[0].id!=='db_ruzova')
  bsay('zobak si prebarvuje '+(jinyZobak.map(x=>x.id).join(',')||'nikdo')+', mel jen db_ruzova');
// kresba: kazda barva se musi vykreslit a stara kacenka bez ulozeneho
// tela musi vypadat presne jako ta klasicka, ne jako prazdna
const kacka=A.DUCKS[0];
for(const telo of TELA){
  const svg=A.duckSVG(kacka,{[A.BODY_LAYER]:telo.id});
  if(/NaN|undefined/.test(svg)) bsay('SVG problem u '+telo.id);
  if((svg.match(/</g)||[]).length!==(svg.match(/>/g)||[]).length) bsay('rozbite tagy u '+telo.id);
}
if(A.duckSVG(kacka,{})!==A.duckSVG(kacka,{[A.BODY_LAYER]:zdarmaTelo.id}))
  bsay('kacenka bez ulozeneho tela nevypada jako klasicka');
if(A.duckSVG(kacka,{})!==A.duckSVG(kacka,{[A.BODY_LAYER]:'db_neexistuje'}))
  bsay('neznamy dil v profilu kacenku rozbije misto toho, aby spadla na klasickou');
if(A.duckSVG(kacka,{}).indexOf(kacka.c1)<0) bsay('klasicka kacenka uz neni zluta');
// barvy se musi lisit navzajem i od dlazdice, na ktere stoji
const ploche=TELA.map(x=>Object.assign({},x,{c1:x.c1||kacka.c1})).filter(x=>!x.grad);
let nejblizsiTelo=1e9, parTel='';
for(let i=0;i<ploche.length;i++) for(let j=i+1;j<ploche.length;j++){
  const d=deLab(ploche[i].c1,ploche[j].c1);
  if(d<nejblizsiTelo){nejblizsiTelo=d; parTel=ploche[i].id+' a '+ploche[j].id;}
  if(d<BODY_PRAH) bsay('barvy splyvaji: '+ploche[i].id+' a '+ploche[j].id+' maji '+d.toFixed(1)+' dE');
}
for(const telo of ploche){
  const d=deLab(telo.c1,DLAZDICE);
  // svetle telo smi zustat svetle, ale pak musi mit obrys, jinak na bile
  // dlazdici v garazi neni videt
  if(d<20 && !telo.edge) bsay(telo.id+' je od dlazdice jen '+d.toFixed(1)+' dE a nema obrys');
}
// duhove telo je jedine, ktere neni plocha, a to je cely jeho rozdil
const duhove=TELA.filter(x=>x.grad);
if(duhove.length!==1) bsay('prechod ma '+duhove.length+' tel, mel jedno');
else{
  const st=duhove[0].grad;
  if(st.length!==5) bsay('duha ma '+st.length+' zastavek, cekano pet');
  for(let i=1;i<st.length;i++) if(deLab(st[i-1],st[i])<25)
    bsay('dve sousedni zastavky duhy splyvaji: '+st[i-1]+' a '+st[i]);
  if(A.duckSVG(kacka,{[A.BODY_LAYER]:duhove[0].id}).indexOf('linearGradient')<0)
    bsay('duhove telo se nekresli prechodem');
}
// model: zdarma ma kazdy, placene jen ten, kdo koupil, a obleknuti jineho
// dilu nesmi koupeny dil ztratit
const profilTelo={duckParts:[],duck:{}};
if(!A.ownsDuckPart(profilTelo,zdarmaTelo)) bsay('telo zdarma neni od zacatku k dispozici');
if(A.ownsDuckPart(profilTelo,TELA[1])) bsay('placene telo ma i ten, kdo ho nekoupil');
profilTelo.duckParts.push(TELA[1].id);
A.wearDuckPart(profilTelo,A.BODY_LAYER,TELA[1].id);
A.wearDuckPart(profilTelo,A.BODY_LAYER,zdarmaTelo.id);
if(!profilTelo.duckParts.includes(TELA[1].id)) bsay('vyber jine barvy pripravil dite o koupenou');
if(!A.ownsDuckPart(profilTelo,TELA[1])) bsay('koupene telo prestalo byt koupene');
if(profilTelo.duck[A.BODY_LAYER]!==zdarmaTelo.id) bsay('vrstva si nedrzi, co je na ni obleceno');
// starsi profil dostane obe pole prazdna a nic jineho se mu nestane
const staryProfil={owned:[],coins:5};
A.seedDuck(staryProfil);
if(!Array.isArray(staryProfil.duckParts)||staryProfil.duckParts.length) bsay('seedDuck nezalozil prazdny seznam dilu');
if(!staryProfil.duck||Object.keys(staryProfil.duck).length) bsay('seedDuck nezalozil prazdnou vystroj');
if(staryProfil.coins!==5) bsay('seedDuck sahl na neco, co mu nepatri');
const drziProfil={duckParts:['db_mint'],duck:{body:'db_mint'}};
A.seedDuck(drziProfil);
if(drziProfil.duckParts[0]!=='db_mint'||drziProfil.duck.body!=='db_mint') bsay('seedDuck prepsal, co uz profil mel');
console.log('kacenciny barvy:',bBad?'chyb '+bBad:'v poradku',
  '| nejblizsi dvojice '+parTel+' '+nejblizsiTelo.toFixed(1)+' dE | vrstva stoji '+cenaTel);

// 3d. vrstvy Vzor a Na hlave
//
// Kresbu test neuvidi, takze se na ni koukalo na obrazku: kazdy z tech
// tricet dilu na klasicke, uhlikove, snehove a duhove kacence a k tomu
// vsech dvacet klobouku nad vzorem, aby se videlo skladani vrstev.
// Strojove se hlida to, co se spocitat da, a je to prave to, co by se
// na obrazku prehledlo: ze zadny dil nevyjede z ramu, ze zadny klobouk
// nesedne na oko ani na zobak, ze kazdy klobouk drzi na hlave, ze se
// vzor kresli pod okem a orezany, a ze vsechny dily jdou od kotev.
// Posledni je ta nejdulezitejsi: kdyby mel dil souradnice hlavy napsane
// v sobe, prvni posunuti hlavy by nechalo dvacet klobouku viset ve
// vzduchu a zadny jiny test by si toho nevsiml.
let hBad=0;
const hsay=m=>{hBad++;console.log('  !!  '+m);};
const VZORY=A.DUCK_PAT, HLAVA=A.DUCK_HEAD, kacka2=A.DUCKS[0];

// --- cteni kresby ---
// plocha u tvaru, ktere ji maji, a body u cest. Ridici bod Bezieru na
// krivce nelezi, ale krivka nevyjede z obalky svych bodu, takze co plati
// o bodech, plati s rezervou i o care. Oblouk je jina, ta se vyduje
// mimo sve konce, a prave obloukem se kresli kazdy klobouk, takze se
// u ni doviraji krajni body kruhu, ktere do vysece padnou.
const ATTR=/([a-z-]+)="([^"]*)"/g;
const attrsOf=tag=>{const o={};let m;ATTR.lastIndex=0;while((m=ATTR.exec(tag)))o[m[1]]=m[2];return o;};
const numsOf=s=>(String(s).match(/-?\d*\.?\d+/g)||[]).map(Number);
function arcBox(x0,y0,r,laf,sf,x1,y1){
  const mx=(x0+x1)/2,my=(y0+y1)/2,dx=(x1-x0)/2,dy=(y1-y0)/2,d=Math.hypot(dx,dy);
  const h=Math.sqrt(Math.max(0,r*r-d*d)), out=[[x0,y0],[x1,y1]];
  if(!d) return out;
  for(const sg of [1,-1]){
    const cx=mx+sg*h*(-dy/d), cy=my+sg*h*(dx/d);
    const a0=Math.atan2(y0-cy,x0-cx), a1=Math.atan2(y1-cy,x1-cx);
    let span=a1-a0;
    if(sf){ if(span<0) span+=2*Math.PI; } else { if(span>0) span-=2*Math.PI; }
    if((Math.abs(span)>Math.PI)!==!!laf) continue;        // druhy stred kresli jiny oblouk
    for(let k=0;k<4;k++){
      const a=k*Math.PI/2;
      let t=a-a0; if(sf){ if(t<0)t+=2*Math.PI; } else { if(t>0)t-=2*Math.PI; }
      if(Math.abs(t)<=Math.abs(span)) out.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);
    }
    break;
  }
  return out;
}
function pathBoxes(d,w){
  const tok=String(d).match(/[A-Za-z]|-?\d*\.?\d+/g)||[];
  const out=[];let i=0,cmd='',cx=0,cy=0;
  const add=(x,y)=>out.push([x-w/2,y-w/2,x+w/2,y+w/2]);
  while(i<tok.length){
    if(/[A-Za-z]/.test(tok[i])){cmd=tok[i++];continue;}
    const n=k=>{const v=[];for(let j=0;j<k;j++)v.push(+tok[i++]);return v;};
    if(cmd==='M'||cmd==='L'){const v=n(2);add(v[0],v[1]);cx=v[0];cy=v[1];}
    else if(cmd==='Q'){const v=n(4);add(v[0],v[1]);add(v[2],v[3]);cx=v[2];cy=v[3];}
    else if(cmd==='C'){const v=n(6);add(v[0],v[1]);add(v[2],v[3]);add(v[4],v[5]);cx=v[4];cy=v[5];}
    else if(cmd==='A'){const v=n(7);arcBox(cx,cy,v[0],v[3],v[4],v[5],v[6]).forEach(pt=>add(pt[0],pt[1]));cx=v[5];cy=v[6];}
    else {hsay('neznamy prikaz v ceste: '+cmd);i++;}
  }
  return out;
}
function boxesOf(frag){
  const out=[];
  for(const tag of frag.match(/<[a-z]+[^>]*\/>/g)||[]){
    const a=attrsOf(tag), w=+(a['stroke-width']||0);
    const push=(x1,y1,x2,y2)=>out.push({b:[x1-w/2,y1-w/2,x2+w/2,y2+w/2],o:a.opacity===undefined?1:+a.opacity});
    // kruh bez vyplne je obroucka, ne kotouc: sklo skafandru vede kolem
    // oka, ne pres nej, takze se z nej berou body na kruznici
    if(/^<circle/.test(tag)&&a.fill==='none'){
      for(let k=0;k<120;k++){const b=k*Math.PI/60;
        push(+a.cx+a.r*Math.cos(b),+a.cy+a.r*Math.sin(b),+a.cx+a.r*Math.cos(b),+a.cy+a.r*Math.sin(b));}}
    else if(/^<circle/.test(tag)) push(+a.cx-a.r,+a.cy-a.r,+a.cx+ +a.r,+a.cy+ +a.r);
    else if(/^<ellipse/.test(tag)) push(+a.cx-a.rx,+a.cy-a.ry,+a.cx+ +a.rx,+a.cy+ +a.ry);
    else if(/^<rect/.test(tag)) push(+a.x,+a.y,+a.x+ +a.width,+a.y+ +a.height);
    else if(/^<polygon/.test(tag)){const n=numsOf(a.points);
      for(let i=0;i<n.length;i+=2) push(n[i],n[i+1],n[i],n[i+1]);}
    else if(/^<path/.test(tag)) pathBoxes(a.d,w).forEach(b=>out.push({b,o:a.opacity===undefined?1:+a.opacity}));
    else hsay('neznamy tvar v dilu: '+tag.slice(0,24));
  }
  return out;
}
const bbox=list=>list.reduce((r,s)=>[Math.min(r[0],s.b[0]),Math.min(r[1],s.b[1]),
  Math.max(r[2],s.b[2]),Math.max(r[3],s.b[3])],[1e9,1e9,-1e9,-1e9]);

// --- katalog ---
if(VZORY.length!==10) hsay('vzoru uz neni deset, ale '+VZORY.length);
if(HLAVA.length!==20) hsay('dilu na hlavu uz neni dvacet, ale '+HLAVA.length);
if(new Set(A.DUCK_PARTS.map(x=>x.id)).size!==A.DUCK_PARTS.length) hsay('dva dily maji stejne id');
for(const [list,layer,jm] of [[VZORY,A.PAT_LAYER,'vzor'],[HLAVA,A.HEAD_LAYER,'hlava']]){
  for(let i=0;i<list.length;i++){
    const x=list[i];
    if(A.duckLayerOf(x)!==layer) hsay(x.id+' nepatri do vrstvy '+jm);
    if(A.duckPartById(x.id)!==x) hsay(x.id+' nejde najit podle id');
    if(typeof x.draw!=='function') hsay(x.id+' nema kresbu');
    if(!x.cost) hsay(x.id+' je zdarma, placene vrstvy zadny dil zdarma nemaji');
    if(i&&list[i].cost<list[i-1].cost) hsay('katalog '+jm+' neni razeny od nejlevnejsiho: '+list[i-1].id+' pred '+x.id);
    // zadny dil nema jiny atribut nez kresbu, cenu a id; kdyby mel, mohl
    // by na jizdu zacit mit vliv a soupeřem by prestala byt vlastni jizda
    const navic=Object.keys(x).filter(k=>['id','cost','draw','see'].indexOf(k)<0);
    if(navic.length) hsay(x.id+' ma atribut navic: '+navic.join(','));
    for(const l of ['cs','en','de']) if(!A.I18N[l][x.id]) hsay(x.id+' nema jmeno v jazyce '+l);
  }
}
// cena vrstvy je zapsane cislo, ne dopoctene. Plan kroku H3 pocital
// u vzoru se 114 a u hlavy s 294; soucet vypsanych cen hlavy je 314.
const CENA_VZOR=114, CENA_HLAVA=314;
const cenaVzor=VZORY.reduce((s,x)=>s+x.cost,0), cenaHlava=HLAVA.reduce((s,x)=>s+x.cost,0);
if(cenaVzor!==CENA_VZOR) hsay('vrstva Vzor stoji '+cenaVzor+', zapsano bylo '+CENA_VZOR);
if(cenaHlava!==CENA_HLAVA) hsay('vrstva Na hlavu stoji '+cenaHlava+', zapsano bylo '+CENA_HLAVA);
for(const spec of A.DUCK_LAYERS) for(const k of [spec.title,spec.note,spec.none])
  if(k) for(const l of ['cs','en','de']) if(!A.I18N[l][k]) hsay('sekce garaze nema text '+k+' v jazyce '+l);

// --- kresba kazdeho dilu ---
const sed=A.duckFit();   // kde dil sedi, spoctene z kotev
const EYE=A.DUCK.EYE, BEAK=A.DUCK.BEAK, OKO=4.4;   // oko ma 3.4 a jeste kousek kolem
// zobak je klin, ne obdelnik, ve kterem se skryva: u koreno je vysoky
// pres jedenact a u spicky uz jen pres sedm, a rozdil je prave to misto,
// kde kolem nej vede sklo skafandru
const ZOBAK=[[BEAK.x,BEAK.y-6,BEAK.x+8,BEAK.y+5.5],
             [BEAK.x+8,BEAK.y-6,BEAK.x+14,BEAK.y+4.5],
             [BEAK.x+14,BEAK.y-5,BEAK.x+18.5,BEAK.y+2.5]];
const kryje=(b,x1,y1,x2,y2)=>b[0]<x2&&b[2]>x1&&b[1]<y2&&b[3]>y1;
// oko je kolecko, ne ctverec, takze se meri vzdalenost tvaru od jeho
// stredu; roh ctverce by zakazal i to, co lezi sikmo vedle nej
const odOka=b=>Math.hypot(Math.max(b[0]-EYE.x,0,EYE.x-b[2]),Math.max(b[1]-EYE.y,0,EYE.y-b[3]));
for(const part of VZORY.concat(HLAVA)){
  const frag=part.draw(sed,'#26324c');
  if(!frag||/NaN|undefined/.test(frag)) hsay('kresba '+part.id+' je vadna');
  if((frag.match(/</g)||[]).length!==(frag.match(/>/g)||[]).length) hsay('rozbite tagy u '+part.id);
  if((frag.match(/"/g)||[]).length%2) hsay('rozbite uvozovky u '+part.id);
  // jen absolutni prikazy velkymi pismeny, aby se kresba dala precist
  // zpatky a zkontrolovat; relativni cesta by test oslepila
  for(const m of frag.match(/ d="[^"]*"/g)||[]) if(/[a-z]/.test(m.slice(4,-1).replace(/e-/g,'')))
    hsay(part.id+' kresli relativni cestou, to uz nikdo nezkontroluje');
  const shp=boxesOf(frag);
  if(!shp.length) hsay(part.id+' nekresli nic');
  if(HLAVA.indexOf(part)>=0){
    const bb=bbox(shp);
    // ram je 100 x 118 a kresba je v nem zvetsena skupinovou transformaci
    const px=x=>50+1.08*(x-46), py=y=>63+1.08*(y-65.5);
    if(px(bb[0])<0||px(bb[2])>100||py(bb[1])<0||py(bb[3])>118)
      hsay(part.id+' vyjel z ramu: '+bb.map(v=>+v.toFixed(1)).join(',')+' -> '
        +[px(bb[0]),py(bb[1]),px(bb[2]),py(bb[3])].map(v=>+v.toFixed(1)).join(','));
    // klobouk musi drzet na hlave, ne se vznaset nad ni
    if(!shp.some(s=>kryje(s.b,sed.x-sed.r,sed.y-sed.r,sed.x+sed.r,sed.y+sed.r)))
      hsay(part.id+' se nedotyka hlavy');
    for(const s of shp){
      const naOku=odOka(s.b)<OKO;
      const naZobaku=ZOBAK.some(z=>kryje(s.b,z[0],z[1],z[2],z[3]));
      // skafandr je jediny dil, ktery neco prekryva, a prekryva to sklem:
      // co je pod nim, musi zustat videt, takze smi jen pruhledny tvar
      if((naOku||naZobaku)&&!(part.see&&s.o<=.35))
        hsay(part.id+' sedl na '+(naOku?'oko':'zobak')+': '+s.b.map(v=>+v.toFixed(1)).join(','));
    }
  } else {
    // vzor musi nekde na kacence opravdu lezet, jinak ho oriznuti sezere
    if(!shp.some(s=>kryje(s.b,sed.B.x-sed.B.rx,sed.B.y-sed.B.ry,sed.B.x+sed.B.rx,sed.B.y+sed.B.ry)
                 || kryje(s.b,sed.x-sed.r,sed.y-sed.r,sed.x+sed.r,sed.y+sed.r)))
      hsay(part.id+' nelezi na kacence, oriznuti by z nej nenechalo nic');
  }
  if(part.see&&!frag.includes('opacity')) hsay(part.id+' se tvari jako pruhledny, ale pruhledny neni');
  if(!part.see&&/opacity/.test(frag)) hsay(part.id+' je pruhledny, aniz by to rekl');
}
if(HLAVA.filter(x=>x.see).length!==1||!HLAVA.find(x=>x.see&&x.id==='dh_kosmo'))
  hsay('pruhledny ma byt jediny dil, a to skafandr');

// --- skladani vrstev ---
// kazdy dil na kazdem tele, protoze vrstvy se skladaji a barva pod nimi
// se meni; kresba se pri tom nesmi rozbit a dil musi byt videt
for(const telo of A.DUCK_BODY) for(const part of VZORY.concat(HLAVA)){
  const outfit={}; outfit[A.BODY_LAYER]=telo.id; outfit[A.duckLayerOf(part)]=part.id;
  const svg=A.duckSVG(kacka2,outfit);
  if(/NaN|undefined/.test(svg)) hsay('SVG problem u '+telo.id+' + '+part.id);
  if((svg.match(/</g)||[]).length!==(svg.match(/>/g)||[]).length) hsay('rozbite tagy u '+telo.id+' + '+part.id);
  if(svg.length<=A.duckSVG(kacka2,{[A.BODY_LAYER]:telo.id}).length) hsay(part.id+' se na '+telo.id+' vubec nepridal');
}
// vsechny tri vrstvy najednou drzi kazda svoje
const troji=A.duckSVG(kacka2,{body:'db_uhel',pat:'dp_kostka',head:'dh_koruna'});
if(troji.indexOf('clip-path')<0||troji.indexOf('#f2c13c')<0) hsay('tri vrstvy najednou se nevykreslily');
// vrstveni vrstev: vzor lezi pod okem i pod zobakem, jinak by kacence
// puntik sedl na oko. Klobouk je naopak az nad okem.
const vrstveni=A.duckSVG(kacka2,{pat:'dp_puntiky',head:'dh_koruna'});
const iVzor=vrstveni.indexOf('clip-path'), iOko=vrstveni.indexOf('#22314f'),
      iZobak=vrstveni.indexOf('#ff9f1c'), iKlobouk=vrstveni.indexOf('#f2c13c');
if(!(iVzor<iZobak&&iVzor<iOko)) hsay('vzor se kresli az nad okem nebo nad zobakem');
if(!(iKlobouk>iOko)) hsay('klobouk se kresli pod oko');
// oriznuti je telo a hlava stazene o kousek dovnitr: kdyby siahalo az
// na okraj, svetly vzor by u snehove kacenky snedl obrys
const cm=/<clipPath id="duckskin"><ellipse cx="[\d.]+" cy="[\d.]+" rx="([\d.]+)" ry="([\d.]+)"\/><circle cx="[\d.]+" cy="[\d.]+" r="([\d.]+)"\/><\/clipPath>/.exec(vrstveni);
if(!cm) hsay('vzor se nekresli do oriznuti tela a hlavy');
else if(!(+cm[1]<A.DUCK.BODY.rx&&+cm[2]<A.DUCK.BODY.ry&&+cm[3]<A.DUCK.HEAD.r))
  hsay('oriznuti vzoru neni stazene dovnitr, obrys kacenky je v ohrozeni');
if(A.duckSVG(kacka2,{}).indexOf('clip-path')>=0) hsay('holá kacenka si nese oriznuti vzoru, ktery nema');
// dil z jine vrstvy ani neznamy dil kacenku nerozbije, jen se nenasadi
if(A.duckSVG(kacka2,{pat:'dh_koruna'})!==A.duckSVG(kacka2,{}))
  hsay('klobouk zapsany do vrstvy vzoru se presto nakreslil');
if(A.duckSVG(kacka2,{head:'dh_neexistuje'})!==A.duckSVG(kacka2,{}))
  hsay('neznamy dil na hlave kacenku rozbije misto toho, aby zustala holá');
if(A.duckSVG(kacka2,{head:''})!==A.duckSVG(kacka2,{})) hsay('prazdna vrstva neni tataz jako zadna');

// --- kotvy ---
// kdyz se hlava posune, musi se s ni posunout kazdy klobouk, a kdyz se
// posune telo i hlava, musi se posunout kazdy vzor. Tohle je jedina
// kontrola, ktera pozna souradnici napsanou v dilu natvrdo.
const zmer=part=>bbox(boxesOf(part.draw(A.duckFit(),'#26324c')));
const predH=HLAVA.map(zmer), predV=VZORY.map(zmer);
const H0=A.DUCK.HEAD, B0=A.DUCK.BODY;
A.DUCK.HEAD={x:H0.x+7,y:H0.y-5,r:H0.r};
HLAVA.forEach((part,i)=>{const b=zmer(part),p=predH[i];
  if(Math.abs(b[0]-p[0]-7)>.06||Math.abs(b[1]-p[1]+5)>.06)
    hsay(part.id+' se s hlavou neposunul, ma v sobe napsanou souradnici');});
A.DUCK.HEAD=H0;
A.DUCK.HEAD={x:H0.x+6,y:H0.y+4,r:H0.r};
A.DUCK.BODY={x:B0.x+6,y:B0.y+4,rx:B0.rx,ry:B0.ry};
VZORY.forEach((part,i)=>{const b=zmer(part),p=predV[i];
  if(Math.abs(b[0]-p[0]-6)>.06||Math.abs(b[1]-p[1]-4)>.06)
    hsay(part.id+' se s kacenkou neposunul, ma v sobe napsanou souradnici');});
A.DUCK.HEAD=H0; A.DUCK.BODY=B0;

// --- model ---
// vrstvy se navzajem nemazou a koupeny dil se sundanim neztrati
const pf={duckParts:['dp_kostka','dh_koruna'],duck:{}};
A.wearDuckPart(pf,A.BODY_LAYER,'db_mint');
A.wearDuckPart(pf,A.PAT_LAYER,'dp_kostka');
A.wearDuckPart(pf,A.HEAD_LAYER,'dh_koruna');
if(Object.keys(pf.duck).length!==3) hsay('tri vrstvy najednou se do profilu nevejdou');
A.wearDuckPart(pf,A.HEAD_LAYER,'');
if(pf.duck.head!==undefined||pf.duck.pat!=='dp_kostka'||pf.duck.body!=='db_mint')
  hsay('sundani klobouku sahlo na ostatni vrstvy');
if(!pf.duckParts.includes('dh_koruna')) hsay('sundani klobouku pripravilo dite o koupeny dil');
console.log('vzory a hlava:',hBad?'chyb '+hBad:'v poradku',
  '| vrstva Vzor stoji '+cenaVzor+', Na hlavu '+cenaHlava+' soucastek');

// 3e. vrstvy Oci a Vybava
//
// Oko je nejmensi misto kresby a nese cely vyraz, takze se u nej hlida
// vic nez u ostatnich vrstev: ze dil opravdu sedi na oku a ne vedle
// nej, ze nevyleze na zobak a ze se vejde pod klobouk, protoze nad
// linkou brim konci klobouk a bryle, ktere tam vylezou, uz nikdo
// neuvidi. Vybava naopak na hlavu nesmi vubec: patri telu, takze se
// hlida, ze je pod toutez linkou, ze nesahne na oko ani na zobak a ze
// se aspon kouskem drzi tela, jinak by visela ve vzduchu.
// Nejdulezitejsi je ale porovnani poradi vrstev: zadni vybava pod
// telem, predni nad vsim, a ocni dil mezi okem a kloboukem. Kdyby se
// poradi otocilo, mela by kacenka nadrz pres kridlo a bryle pres
// klobouk, a zadna jina kontrola by si toho nevsimla.
let eBad=0;
const esay=m=>{eBad++;console.log('  !!  '+m);};
const OCI=A.DUCK_EYE, VYBAVA=A.DUCK_GEAR, kacka3=A.DUCKS[0];
const BODYBOX=[sed.B.x-sed.B.rx,sed.B.y-sed.B.ry,sed.B.x+sed.B.rx,sed.B.y+sed.B.ry];
// vlasova rezerva nad linkou klobouku: spicka rasy ji smi prekrocit,
// protoze je tenka jako cara a klobouk pres ni vypada spravne, ale nic,
// co nese sklo, se tam nedostane
const POD_KLOBOUK=sed.brim-4;

// --- katalog ---
if(OCI.length!==9) esay('ocnich dilu uz neni devet, ale '+OCI.length);
if(VYBAVA.length!==16) esay('kusu vybavy uz neni sestnact, ale '+VYBAVA.length);
if(new Set(A.DUCK_PARTS.map(x=>x.id)).size!==A.DUCK_PARTS.length) esay('dva dily maji stejne id');
if(A.DUCK_PARTS.length!==A.DUCK_BODY.length+VZORY.length+HLAVA.length+OCI.length+VYBAVA.length)
  esay('spolecny seznam dilu neobsahuje vsech pet vrstev');
for(const [list,layer,jm] of [[OCI,A.EYE_LAYER,'oci'],[VYBAVA,A.GEAR_LAYER,'vybava']]){
  for(let i=0;i<list.length;i++){
    const x=list[i];
    if(A.duckLayerOf(x)!==layer) esay(x.id+' nepatri do vrstvy '+jm);
    if(A.duckPartById(x.id)!==x) esay(x.id+' nejde najit podle id');
    if(typeof x.draw!=='function') esay(x.id+' nema kresbu');
    if(!x.cost) esay(x.id+' je zdarma, placene vrstvy zadny dil zdarma nemaji');
    if(i&&list[i].cost<list[i-1].cost) esay('katalog '+jm+' neni razeny od nejlevnejsiho: '+list[i-1].id+' pred '+x.id);
    // krome kresby a ceny nesmi dil nest nic; `back` je druha pulka
    // kresby, ne vlastnost, a ma ji jen vybava
    const navic=Object.keys(x).filter(k=>['id','cost','draw','back'].indexOf(k)<0);
    if(navic.length) esay(x.id+' ma atribut navic: '+navic.join(','));
    if(x.back&&layer!==A.GEAR_LAYER) esay(x.id+' ma zadni pulku, a to umi jen vybava');
    for(const l of ['cs','en','de']) if(!A.I18N[l][x.id]) esay(x.id+' nema jmeno v jazyce '+l);
  }
}
// ceny vrstev jsou zapsana cisla, ne dopoctena, stejne jako u H2 a H3
const CENA_OCI=108, CENA_VYBAVA=278;
const cenaOci=OCI.reduce((s,x)=>s+x.cost,0), cenaVyb=VYBAVA.reduce((s,x)=>s+x.cost,0);
if(cenaOci!==CENA_OCI) esay('vrstva Oci stoji '+cenaOci+', zapsano bylo '+CENA_OCI);
if(cenaVyb!==CENA_VYBAVA) esay('vrstva Vybava stoji '+cenaVyb+', zapsano bylo '+CENA_VYBAVA);
if(A.DUCK_LAYERS.length!==5) esay('garaz ukazuje '+A.DUCK_LAYERS.length+' vrstev misto peti');

// --- kresba kazdeho dilu ---
const vRamu=(part,bbx)=>{
  const px=x=>50+1.08*(x-46), py=y=>63+1.08*(y-65.5);
  if(px(bbx[0])<0||px(bbx[2])>100||py(bbx[1])<0||py(bbx[3])>118)
    esay(part.id+' vyjel z ramu: '+[px(bbx[0]),py(bbx[1]),px(bbx[2]),py(bbx[3])].map(v=>+v.toFixed(1)).join(','));
};
const zdravaKresba=(part,frag)=>{
  if(!frag||/NaN|undefined/.test(frag)) esay('kresba '+part.id+' je vadna');
  if((frag.match(/</g)||[]).length!==(frag.match(/>/g)||[]).length) esay('rozbite tagy u '+part.id);
  if((frag.match(/"/g)||[]).length%2) esay('rozbite uvozovky u '+part.id);
  for(const m of frag.match(/ d="[^"]*"/g)||[]) if(/[a-z]/.test(m.slice(4,-1).replace(/e-/g,'')))
    esay(part.id+' kresli relativni cestou, to uz nikdo nezkontroluje');
  // pruhledny smi byt jediny dil ve hre, skafandr, a ten je na hlave
  if(/opacity/.test(frag)) esay(part.id+' je pruhledny, a to umi jen skafandr');
};
for(const part of OCI){
  const frag=part.draw(sed,'#26324c');
  zdravaKresba(part,frag);
  const shp=boxesOf(frag);
  if(!shp.length){esay(part.id+' nekresli nic');continue;}
  const bx=bbox(shp);
  vRamu(part,bx);
  // dil musi sedet na oku, ne vedle nej
  if(!(bx[0]<=EYE.x&&bx[2]>=EYE.x&&bx[1]<=EYE.y&&bx[3]>=EYE.y))
    esay(part.id+' nesedi na oku: '+bx.map(v=>+v.toFixed(1)).join(','));
  // a nejen ze ho obepina: aspon jeden tvar musi lezet na samotnem oku,
  // jinak by dil mohl byt prstenec kolem prazdna
  if(!shp.some(s=>odOka(s.b)<OKO)) esay(part.id+' se oka jen letmo dotyka');
  for(const s of shp){
    if(ZOBAK.some(z=>kryje(s.b,z[0],z[1],z[2],z[3])))
      esay(part.id+' sedl na zobak: '+s.b.map(v=>+v.toFixed(1)).join(','));
    if(s.b[1]<POD_KLOBOUK)
      esay(part.id+' vyleze nad linku klobouku ('+s.b[1].toFixed(1)+' proti '+POD_KLOBOUK.toFixed(1)+')');
    // bryle drzi na hlave, ne vedle ni: kazdy roh tvaru lezi uvnitr
    // hlavy plus rezerva na tloustku cary
    const rohy=[[s.b[0],s.b[1]],[s.b[2],s.b[1]],[s.b[0],s.b[3]],[s.b[2],s.b[3]]];
    if(rohy.some(r=>Math.hypot(r[0]-sed.x,r[1]-sed.y)>sed.r+3))
      esay(part.id+' vyjel z hlavy: '+s.b.map(v=>+v.toFixed(1)).join(','));
  }
}
for(const part of VYBAVA){
  const zadni=part.back?part.back(sed,'#26324c'):'';
  const predni=part.draw(sed,'#26324c');
  if(!zadni&&!predni) esay(part.id+' nekresli nic');
  if(part.back&&!zadni) esay(part.id+' ma prazdnou zadni pulku');
  zdravaKresba(part,zadni+predni);
  const shp=boxesOf(zadni+predni);
  if(!shp.length){esay(part.id+' nekresli zadny tvar');continue;}
  vRamu(part,bbox(shp));
  // vybava patri telu: na hlavu, na oko ani na zobak nesmi
  if(!shp.some(s=>kryje(s.b,BODYBOX[0],BODYBOX[1],BODYBOX[2],BODYBOX[3])))
    esay(part.id+' se nedrzi tela a visi ve vzduchu');
  for(const s of shp){
    if(odOka(s.b)<OKO) esay(part.id+' sedl na oko: '+s.b.map(v=>+v.toFixed(1)).join(','));
    if(ZOBAK.some(z=>kryje(s.b,z[0],z[1],z[2],z[3]))) esay(part.id+' sedl na zobak');
    if(s.b[1]<sed.brim) esay(part.id+' leze na hlavu, kde uz je klobouk ('+s.b[1].toFixed(1)+')');
  }
}
// zadni pulku ma mit jen to, co musi jit za telo, a je jich mene nez pul
const sZady=VYBAVA.filter(x=>x.back).map(x=>x.id);
if(sZady.length<3) esay('zadni pulku nema skoro nic, kruh nebo batoh se ztratil: '+sZady.join(','));

// --- poradi vrstev ---
// jedna kacenka se vsemi peti vrstvami a strojova kontrola, ze se
// kresli v poradi zadni vybava, telo, vzor, oko, ocni dil, klobouk,
// predni vybava
const pet=A.duckSVG(kacka3,{body:'db_klasik',pat:'dp_puntiky',head:'dh_koruna',eye:'de_brejle',gear:'dg_kruh'});
const poradiVrstev=[['zadni vybava','#e8402a'],['telo',kacka3.c1],['vzor','clip-path'],['oko','#22314f'],
              ['bryle','#23283a'],['klobouk','#f2c13c'],['predni vybava','#fdfdff']];
let posledni=-1;
for(const [jm,znak] of poradiVrstev){
  const i=pet.indexOf(znak);
  if(i<0){esay('v peti vrstvach chybi '+jm);continue;}
  if(i<posledni) esay('poradi vrstev se rozpadlo, '+jm+' se kresli prilis brzy');
  posledni=i;
}
// kazda vrstva zvlast: dil se nasadi jen do sve vrstvy a neznamy dil
// nechá vrstvu holou misto toho, aby kacenku rozbil
if(A.duckSVG(kacka3,{eye:'dg_kruh'})!==A.duckSVG(kacka3,{})) esay('vybava zapsana do vrstvy oci se presto nakreslila');
if(A.duckSVG(kacka3,{gear:'de_brejle'})!==A.duckSVG(kacka3,{})) esay('bryle zapsane do vrstvy vybavy se presto nakreslily');
if(A.duckSVG(kacka3,{eye:'de_neexistuje'})!==A.duckSVG(kacka3,{})) esay('neznamy ocni dil kacenku rozbije');
if(A.duckSVG(kacka3,{gear:''})!==A.duckSVG(kacka3,{})) esay('prazdna vybava neni tataz jako zadna');

// --- kotvy ---
// ocni dil se musi pohnout s okem a vybava s telem; tohle je jedina
// kontrola, ktera pozna souradnici napsanou v dilu natvrdo
const zmerO=part=>bbox(boxesOf(part.draw(A.duckFit(),'#26324c')));
const zmerV=part=>bbox(boxesOf((part.back?part.back(A.duckFit(),'#26324c'):'')+part.draw(A.duckFit(),'#26324c')));
const predOci=OCI.map(zmerO), predVyb=VYBAVA.map(zmerV);
const E0=A.DUCK.EYE, B1=A.DUCK.BODY, W0=A.DUCK.WING, T0=A.DUCK.TAIL, WA0=A.DUCK.WATER;
A.DUCK.EYE={x:E0.x+5,y:E0.y-3};
OCI.forEach((part,i)=>{const b=zmerO(part),p=predOci[i];
  if(Math.abs(b[0]-p[0]-5)>.06||Math.abs(b[1]-p[1]+3)>.06)
    esay(part.id+' se s okem neposunul, ma v sobe napsanou souradnici');});
A.DUCK.EYE=E0;
A.DUCK.BODY={x:B1.x+6,y:B1.y+4,rx:B1.rx,ry:B1.ry};
A.DUCK.WING={x:W0.x+6,y:W0.y+4}; A.DUCK.TAIL={x:T0.x+6,y:T0.y+4}; A.DUCK.WATER=WA0+4;
VYBAVA.forEach((part,i)=>{const b=zmerV(part),p=predVyb[i];
  if(Math.abs(b[0]-p[0]-6)>.06||Math.abs(b[1]-p[1]-4)>.06)
    esay(part.id+' se s telem neposunul, ma v sobe napsanou souradnici');});
A.DUCK.BODY=B1; A.DUCK.WING=W0; A.DUCK.TAIL=T0; A.DUCK.WATER=WA0;

// --- skladani vrstev ---
// kazdy novy dil na kazdem tele, protoze pod nim se meni barva
for(const telo of A.DUCK_BODY) for(const part of OCI.concat(VYBAVA)){
  const outfit={}; outfit[A.BODY_LAYER]=telo.id; outfit[A.duckLayerOf(part)]=part.id;
  const svg=A.duckSVG(kacka3,outfit);
  if(/NaN|undefined/.test(svg)) esay('SVG problem u '+telo.id+' + '+part.id);
  if((svg.match(/</g)||[]).length!==(svg.match(/>/g)||[]).length) esay('rozbite tagy u '+telo.id+' + '+part.id);
  if(svg.length<=A.duckSVG(kacka3,{[A.BODY_LAYER]:telo.id}).length) esay(part.id+' se na '+telo.id+' vubec nepridal');
}
// vsech pet vrstev najednou drzi kazda svoje a sundani jedne nesahne
// na ostatni
const pf5={duckParts:['dp_kostka','dh_koruna','de_maska','dg_kruh'],duck:{}};
A.wearDuckPart(pf5,A.BODY_LAYER,'db_mint'); A.wearDuckPart(pf5,A.PAT_LAYER,'dp_kostka');
A.wearDuckPart(pf5,A.HEAD_LAYER,'dh_koruna'); A.wearDuckPart(pf5,A.EYE_LAYER,'de_maska');
A.wearDuckPart(pf5,A.GEAR_LAYER,'dg_kruh');
if(Object.keys(pf5.duck).length!==5) esay('pet vrstev najednou se do profilu nevejde');
A.wearDuckPart(pf5,A.EYE_LAYER,'');
if(pf5.duck.eye!==undefined||pf5.duck.gear!=='dg_kruh'||pf5.duck.head!=='dh_koruna')
  esay('sundani bryli sahlo na ostatni vrstvy');
if(!pf5.duckParts.includes('de_maska')) esay('sundani bryli pripravilo dite o koupeny dil');
console.log('oci a vybava:',eBad?'chyb '+eBad:'v poradku',
  '| vrstva Oci stoji '+cenaOci+', Vybava '+cenaVyb+' soucastek');

// 3f. kontrast dilu proti telu
//
// Dil nakresleny v barve, kterou uz ma telo pod nim, je dil, ktery neni
// videt: cerna pneumatika na uhlikove kacence byla jedna tmava skvrna
// s oblicejem nekde uvnitr a kulate zlate obroucky na klasicke zlute
// nebyly videt vubec. Kacenka ma pet vrstev a deset tel, takze dvojic je
// 550 a na obrazku se prehlednou; tohle je presne ten druh chyby, ktery
// musi hlidat stroj.
// Meri se v Lab, stejne jako u palet z okruhu 15 a u samotnych tel
// v okruhu 3c, protoze dve barvy, ktere v kodu vypadaji odlisne, mohou
// na dlazdici splynout. Prah je tychz 25 dE, kterym se drzi deset tel od
// sebe navzajem. Test si vzdalenost pocita sam a nebere ji z app.js:
// merit definici sebou samou nechytne nic.
// Dil projde tehdy, kdyz aspon jedna jeho barva stoji dost daleko od
// **vsech** barev tela; nemusi se lisit celý, staci, aby mel na sobe
// linku, kterou telo nesnese. Prave to dela `partInk`, a hlida se
// i to, ze ho kresba kacenky opravdu vola.
let ktBad=0;
const ktsay=m=>{ktBad++;console.log('  !!  '+m);};
const KONTRAST_PRAH=25, kackaK=A.DUCKS[0], sedK=A.duckFit();
if(A.DUCK_INK>KONTRAST_PRAH) ktsay('app.js si dovoluje mensi kontrast ('+A.DUCK_INK+') nez tenhle test');
// ktery ze dvou kontrastnich odstinu telo dostane, je totez pravidlo
// jako v duckSVG: svetle telo tmavou linku, tmave svetlou
const jasT=h=>{const n=parseInt((h.length===4?'#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3]:h).slice(1),16);
  return (((n>>16)&255)*.299+((n>>8)&255)*.587+(n&255)*.114)/255;};
const hexy=frag=>[...new Set((frag.match(/(?:fill|stroke)="#[0-9a-fA-F]{3,6}"/g)||[])
  .map(s=>s.slice(s.indexOf('#'),-1).toLowerCase())
  .map(h=>h.length===4?'#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3]:h))];
const DILY_K=VZORY.concat(HLAVA,OCI,VYBAVA);
let nejhorsi=1e9, nejhorsiPar='', sObrysem=[];
for(const telo of A.DUCK_BODY){
  const c1=telo.c1||kackaK.c1, c2=telo.c2||kackaK.c2;
  const barvyTela=telo.grad?telo.grad.slice():[c1,c2];
  const jas=telo.grad?telo.grad.reduce((s,c)=>s+jasT(c),0)/telo.grad.length:jasT(c1);
  const rimT=jas<.45?'#f2f7ff':'#26324c';
  for(const part of DILY_K){
    const syrove=(part.back?part.back(sedK,rimT):'')+part.draw(sedK,rimT);
    const hotove=(part.back?A.partInk(part.back(sedK,rimT),rimT,barvyTela):'')
                +A.partInk(part.draw(sedK,rimT),rimT,barvyTela);
    if(hotove!==syrove) sObrysem.push(part.id+' na '+telo.id);
    if(/NaN|undefined/.test(hotove)) ktsay('obrys rozbil kresbu '+part.id+' na '+telo.id);
    if((hotove.match(/</g)||[]).length!==(hotove.match(/>/g)||[]).length)
      ktsay('obrys rozbil tagy u '+part.id+' na '+telo.id);
    // dva stejne pojmenovane atributy v jednom tvaru prohlizec vezme,
    // ale opravdovy parser SVG na nich spadne
    for(const tag of hotove.match(/<[a-z]+[^>]*\/>/g)||[]){
      const jm=(tag.match(/([a-z-]+)="/g)||[]).map(s=>s.slice(0,-2));
      if(new Set(jm).size!==jm.length) ktsay(part.id+' na '+telo.id+' ma tvar s dvojim atributem: '+tag.slice(0,40));
    }
    const d=Math.max(...hexy(hotove).map(c=>Math.min(...barvyTela.map(b=>deLab(c,b)))));
    if(d<nejhorsi){nejhorsi=d; nejhorsiPar=part.id+' na '+telo.id;}
    if(d<KONTRAST_PRAH)
      ktsay(part.id+' splyva s telem '+telo.id+': nejlepsi barva je jen '+d.toFixed(1)+' dE');
  }
}
// a obrys opravdu musi byt v hotove kacence, ne jen ve funkci vedle ni
const zlutaK=A.DUCK_BODY[0], hueK=[zlutaK.c1||kackaK.c1, zlutaK.c2||kackaK.c2];
const dioptr=A.duckPartById('de_dioptr');
if(!A.duckSVG(kackaK,{body:zlutaK.id,eye:'de_dioptr'})
    .includes(A.partInk(dioptr.draw(sedK,'#26324c'),'#26324c',hueK)))
  ktsay('kacenka kresli dily bez obrysu, partInk visi ve vzduchu');
if(!sObrysem.length) ktsay('obrys nedostal ani jeden dil, pravidlo je nejspis mrtve');
console.log('kontrast dilu:',ktBad?'chyb '+ktBad:'v poradku',
  '| nejtesnejsi '+nejhorsiPar+' '+nejhorsi.toFixed(1)+' dE | obrys dostalo '+sObrysem.length
  +' dvojic z '+(A.DUCK_BODY.length*DILY_K.length)+': '+sObrysem.join(', '));

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
A.divremKeys(A.R_BUCKETS.map(b=>b.id)).forEach(k=>VALID.add(k));
A.splitKeys(A.V_BUCKETS.map(b=>b.id)).forEach(k=>VALID.add(k));
A.pickKeys(A.J_BUCKETS.map(b=>b.id)).forEach(k=>VALID.add(k));
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

// 7s. deleni se zbytkem: kazdy kbelik deli tim, co slibuje, zbytek je
// vzdycky mensi nez delitel a obe policka se vyhodnocuji zvlast
//
// Overuje se ze zadani, ne z toho, co si generator mysli: z radku se
// precte delenec a delitel, z odpovedi podil a zbytek, a musi platit
// delenec = podil krat delitel plus zbytek. Deleni beze zbytku vypadnout
// musi, protoze to sesit uci taky, ale nesmi vypadavat porad.
let zbBad=0, zbN=0, zbBez=0, zbSe=0;
const zbsay=m=>{zbBad++; if(zbBad<8) console.log('  !!  '+m);};
for(const b of A.R_BUCKETS) for(const key of A.divremKeys([b.id])){
  const d=+key.slice(1);
  if(!b.div.includes(d)){zbsay('klic '+key+' nepatri do kbeliku '+b.id);continue;}
  const podily=new Set(), zbytky=new Set();
  for(let i=0;i<600;i++){
    const it=A.itemFromKey(key); zbN++;
    if(it.input!=='pad2'){zbsay('deleni se zbytkem se neodpovida do dvou policek: '+it.input);break;}
    if(!Array.isArray(it.answer)||it.answer.length!==2){zbsay('odpoved neni podil a zbytek: '+JSON.stringify(it.answer));break;}
    if(String(it.maxLen)!=='2,1'){zbsay('policka nemaji misto na dvouciferny podil a jednociferny zbytek: '+it.maxLen);break;}
    if(!it.sep||!it.tail){zbsay('na radku chybi slova mezi polickami nebo za nimi');break;}
    if(!it.ask){zbsay('nerika se slovy, co ta dve policka znamenaji');break;}
    const m=/^(\d+) : (\d+)$/.exec(it.text);
    if(!m){zbsay('zadani neni deleni: '+it.text);break;}
    const delenec=+m[1], delitel=+m[2], [q,zb]=it.answer;
    if(delitel!==d){zbsay('klic '+key+' deli '+delitel);break;}
    if(zb<0||zb>=delitel){zbsay('zbytek '+zb+' neni mensi nez delitel '+delitel+': '+it.text);break;}
    if(q<1||q>10){zbsay('podil '+q+' je mimo desetinasobek delitele: '+it.text);break;}
    if(delenec!==q*delitel+zb){zbsay('zadani nesedi s odpovedi: '+it.text+' != '+q+' × '+delitel+' + '+zb);break;}
    podily.add(q); (zb?zbytky.add(zb):0); zb?zbSe++:zbBez++;
    // kazda hodnota zvlast: zkazit jednu musi stacit na to, aby odpoved neprosla
    if(!it.check([String(q),String(zb)])){zbsay('otazka neuznala vlastni odpoved: '+it.text);break;}
    if(it.check([String(q+1),String(zb)])){zbsay('spatny podil prosel: '+it.text);break;}
    if(it.check([String(q),String(zb+1)])){zbsay('spatny zbytek prosel: '+it.text);break;}
    if(it.check(String(q)+String(zb))){zbsay('podil a zbytek slepene do jednoho cisla prosly: '+it.text);break;}
    // a cely radek se precte zpatky i se slovy mezi policky
    const cely=A.rightAnswerText(it);
    if(cely!==it.text+' = '+q+' '+it.sep+' '+zb+it.tail){zbsay('cela odpoved se necte jako radek: '+cely);break;}
  }
  if(podily.size<8) zbsay('klic '+key+' losuje jen '+podily.size+' ruznych podilu');
  if(zbytky.size!==d-1) zbsay('klic '+key+' nepouzije vsechny zbytky, jen '+zbytky.size+' z '+(d-1));
}
// deleni beze zbytku patri dovnitr, ale nesmi zabrat zavod: podil je
// pevnych dvacet procent, at se deli cimkoli, takze kbeliky neuci kazdy
// neco jineho
const zbPodil=zbBez/(zbBez+zbSe);
if(zbPodil<0.14||zbPodil>0.26) zbsay('deleni beze zbytku vychazi v '+Math.round(zbPodil*100)+' % pripadu, ma to byt kolem dvaceti');
// obe chybove hlasky musi umet vzniknout a musi byt ruzne
const zbIt=A.itemFromKey('r7');
const zbZb=zbIt.answer[1];
const hlaska1=A.missHint(zbIt,[String(zbIt.answer[0]),'7']);
const hlaska2=A.missHint(zbIt,[String(zbIt.answer[0]+1),String(zbZb)]);
const hlaska0=A.missHint(A.itemFromKey('m6x7'),'41');
if(hlaska1===hlaska0) zbsay('prilis velky zbytek nedostal vlastni hlasku');
if(hlaska2===hlaska0) zbsay('spatny podil se spravnym zbytkem nedostal vlastni hlasku');
if(hlaska1===hlaska2) zbsay('obe chyby deleni se zbytkem dostaly tutez hlasku');
if(hlaska1.indexOf('7')<0) zbsay('hlaska o velkem zbytku nejmenuje delitele: '+hlaska1);
console.log('zkontrolovano deleni se zbytkem:',zbN,'| beze zbytku',Math.round(zbPodil*100)+'%','| chyb:',zbBad);

// 7t. deleni se zbytkem se stupnuje po dvojicich delitelu a stoji na deleni
let zbStBad=0;
const zbg=A.newProfile('R1'); A.DB.profiles=[zbg]; A.DB.current=zbg.id;
if(A.divremStage(zbg)!==0){zbStBad++;console.log('  !!  zacatecnik nezacina dvojkou a trojkou');}
const zbRun0=A.buildRun(zbg,A.trackById('divrem'));
if(zbRun0.length!==20){zbStBad++;console.log('  !!  spatna delka zavodu s delenim se zbytkem',zbRun0.length);}
for(const it of zbRun0) if(it.key!=='r2'&&it.key!=='r3'){zbStBad++;console.log('  !!  zacatecnik dostal tezsi delitele',it.text);break;}
A.divremKeys(['1']).forEach(k=>zbg.facts[k]={lv:5,reps:9,ok:9,bad:0,best:2000,seen:Date.now()});
if(A.divremStage(zbg)!==1){zbStBad++;console.log('  !!  po zvladnuti dvojky a trojky se neposunul');}
const zbRun1=A.buildRun(zbg,A.trackById('divrem'));
const zbFocus=zbRun1.filter(it=>it.key==='r4'||it.key==='r5').length;
if(zbFocus<zbRun1.length*0.5){zbStBad++;console.log('  !!  druhy kbelik nenese zavod',zbFocus+'/'+zbRun1.length);}
if(zbFocus===zbRun1.length){zbStBad++;console.log('  !!  chybi opakovani prvniho kbeliku');}
// stoji to na deleni: zbytek je deleni plus odecteni, takze bez nasobku
// delitele nema na cem stat
const zbu=A.newProfile('R2'); A.DB.profiles=[zbu]; A.DB.current=zbu.id;
if(A.unlockState(zbu,A.trackById('divrem')).open){zbStBad++;console.log('  !!  deleni se zbytkem je otevrene hned od zacatku');}
A.trackKeys(zbu,A.trackById('t5')).forEach(k=>zbu.facts[k]={lv:5,reps:9,ok:9,bad:0,best:2000,seen:Date.now()});
if(A.unlockState(zbu,A.trackById('divrem')).open){zbStBad++;console.log('  !!  otevrela to nasobilka misto deleni');}
A.trackKeys(zbu,A.trackById('d1')).forEach(k=>zbu.facts[k]={lv:1,reps:4,ok:3,bad:1,best:4000,seen:Date.now()});
if(A.unlockState(zbu,A.trackById('divrem')).open){zbStBad++;console.log('  !!  nacate deleni otevrelo zbytky prilis brzy');}
A.trackKeys(zbu,A.trackById('d1')).forEach(k=>zbu.facts[k]={lv:2,reps:6,ok:5,bad:1,best:3000,seen:Date.now()});
if(!A.unlockState(zbu,A.trackById('divrem')).open){zbStBad++;console.log('  !!  rozjete deleni neotevrelo zbytky');}
// na mape stoji hned za kulatymi cisly, tedy na konci nasobici a delici rady
const zbPor=A.TRACKS.map(x=>x.id);
if(zbPor.indexOf('divrem')!==zbPor.indexOf('tens')+1){
  zbStBad++;console.log('  !!  deleni se zbytkem nestoji na mape hned za kulatymi cisly');}
// kapitola 27 uz generator ma
const zbCur3=A.CURRICULA.find(c=>c.id==='nns-matysek-3');
const zbKap27=zbCur3.chapters.find(x=>x.n===27);
if(!A.isPlayable(zbKap27)){zbStBad++;console.log('  !!  kapitola 27 porad nejde vybrat');}
if(A.poolKeys(zbKap27.pool).join()!=='r2,r3,r4,r5,r6,r7,r8,r9,r10'){
  zbStBad++;console.log('  !!  kapitola 27 nema vsechny delitele:',A.poolKeys(zbKap27.pool).join());}
// klic rodiny se rozbaluje az v itemFromKey, takze se v zasobe pocita za ctyri
if(A.poolSize(['r7'])!==4){zbStBad++;console.log('  !!  klic deleni se zbytkem se nepocita jako rodina');}
console.log('chyb ve stupnich deleni se zbytkem:',zbStBad);

// 7u. rozklad cisla: kazdy kbelik rozepisuje prave ty rady, ktere slibuje,
// a kazda cast je cislice krat to, co dane misto v cisle plati
//
// Overuje se ze zadani, ne z toho, co si generator mysli: z radku se
// precte cislo, z odpovedi jeho casti, a musi platit, ze se casti
// sectou na to cislo a ze kazda z nich je jedna cislice nasobena stem,
// deseti nebo jednickou. Nula v zadnem rade byt nesmi, protoze pro ni
// neni policko: kniha pise 407 jako 400 + 7, tedy o jednu cast min.
let rzBad=0, rzN=0;
const rzsay=m=>{rzBad++; if(rzBad<8) console.log('  !!  '+m);};
const RAD={h:100,t:10,o:1};
for(const b of A.V_BUCKETS) for(const key of A.splitKeys([b.id])){
  const videno=b.places.map(()=>new Set());
  for(let i=0;i<600;i++){
    const it=A.itemFromKey(key); rzN++;
    const casti=it.answer;
    if(!Array.isArray(casti)||casti.length!==b.places.length){
      rzsay('kbelik '+b.id+' nerozepsal '+b.places.length+' casti: '+JSON.stringify(casti));break;}
    // kolik policek radek ma, rika material, ne rodina
    if(A.slotsOf(it)!==casti.length){rzsay('policek je '+A.slotsOf(it)+', casti '+casti.length);break;}
    if(it.input!=='pad'+casti.length){rzsay('vstupni prvek nesedi s poctem casti: '+it.input);break;}
    if(!/^\d+$/.test(it.text)){rzsay('zadani neni cislo: '+it.text);break;}
    if(+it.text!==casti.reduce((a,x)=>a+x,0)){
      rzsay('casti se nesectou na cislo v zadani: '+it.text+' != '+casti.join(' + '));break;}
    let chyba=false;
    b.places.forEach((pl,j)=>{
      const cifra=casti[j]/RAD[pl];
      if(!Number.isInteger(cifra)||cifra<1||cifra>9){
        rzsay('cast '+casti[j]+' neni jednociferny nasobek '+RAD[pl]);chyba=true;}
      if(String(casti[j]).length!==(Array.isArray(it.maxLen)?it.maxLen[j]:it.maxLen)){
        rzsay('policko '+j+' nema misto presne na '+casti[j]);chyba=true;}
      videno[j].add(cifra);
    });
    if(chyba)break;
    if(it.sep!=='+'){rzsay('mezi policky nestoji plus: '+it.sep);break;}
    if(it.tail){rzsay('za poslednim polickem nema nic stat');break;}
    if(!it.ask){rzsay('nerika se slovy, co se ma udelat');break;}
    // kazda hodnota zvlast: zkazit jednu staci na to, aby odpoved neprosla
    const psane=casti.map(String);
    if(!it.check(psane)){rzsay('otazka neuznala vlastni odpoved: '+it.text);break;}
    let prosla=false;
    casti.forEach((c,j)=>{ if(it.check(psane.map((x,l)=>l===j?String(c+1):x))) prosla=true; });
    if(prosla){rzsay('spatna cast prosla: '+it.text);break;}
    if(it.check(it.text)){rzsay('slepene cislo proslo misto casti: '+it.text);break;}
    // cely radek se precte zpatky i s plusy mezi polickami
    const cely=A.rightAnswerText(it);
    if(cely!==it.text+' = '+casti.join(' + ')){rzsay('cela odpoved se necte jako radek: '+cely);break;}
  }
  videno.forEach((v,j)=>{ if(v.size!==9) rzsay('klic '+key+' pouzil v '+j+'. policku jen '+v.size+' cislic z devíti'); });
}
// napsat cislici misto toho, kolik doopravdy plati, ma vlastni hlasku
const rzIt=A.itemFromKey('v3');
const rzCifry=rzIt.answer.map(c=>String(c)[0]);
const rzH1=A.missHint(rzIt,rzCifry);
const rzH0=A.missHint(A.itemFromKey('m6x7'),'41');
if(rzH1===rzH0) rzsay('napsane cislice misto radu nedostaly vlastni hlasku');
if(rzH1.indexOf(String(rzIt.answer[0]))<0) rzsay('hlaska nerekne, co do policka patri: '+rzH1);
// a spravna odpoved zadnou hlasku o cislicich nedostane
if(A.missHint(rzIt,rzIt.answer.map(String))!==rzH0) rzsay('spravne napsane rady dostaly hlasku o cislicich');
// neznamy kbelik pada nahlas, nevyrobi nahradni priklad
let rzPadl=false; try{A.itemFromKey('v9');}catch(e){rzPadl=true;}
if(!rzPadl) rzsay('neznamy kbelik rozkladu nespadl');
console.log('zkontrolovano rozkladu cisla:',rzN,'| chyb:',rzBad);

// 7v. rozklad se stupnuje po radech a stoji na stovce, ne na tisicovce
let rzStBad=0;
const rzg=A.newProfile('V1'); A.DB.profiles=[rzg]; A.DB.current=rzg.id;
if(A.splitStage(rzg)!==0){rzStBad++;console.log('  !!  zacatecnik nezacina dvojcifernym cislem');}
const rzRun0=A.buildRun(rzg,A.trackById('split'));
if(rzRun0.length!==20){rzStBad++;console.log('  !!  spatna delka zavodu s rozkladem',rzRun0.length);}
for(const it of rzRun0) if(it.key!=='v1'){rzStBad++;console.log('  !!  zacatecnik dostal vetsi cisla',it.text);break;}
A.splitKeys(['1']).forEach(k=>rzg.facts[k]={lv:5,reps:9,ok:9,bad:0,best:2000,seen:Date.now()});
if(A.splitStage(rzg)!==1){rzStBad++;console.log('  !!  po zvladnuti dvojciferneho se neposunul');}
const rzRun1=A.buildRun(rzg,A.trackById('split'));
const rzFocus=rzRun1.filter(it=>it.key==='v2').length;
if(rzFocus<rzRun1.length*0.5){rzStBad++;console.log('  !!  druhy kbelik nenese zavod',rzFocus+'/'+rzRun1.length);}
if(rzFocus===rzRun1.length){rzStBad++;console.log('  !!  chybi opakovani prvniho kbeliku');}
// posledni kbelik je jediny, ktery se odpovida do tri policek
const rzTri=A.itemFromKey('v3'), rzDve=A.itemFromKey('v2');
if(A.slotsOf(rzTri)!==3){rzStBad++;console.log('  !!  treti kbelik nema tri policka');}
if(A.slotsOf(rzDve)!==2){rzStBad++;console.log('  !!  druhy kbelik nema dve policka');}
// stoji to na stovce, ne na tisicovce: je to zeme, na ktere tisicovka
// teprve stoji, takze na ni nikdy nesmi cekat
const rzu=A.newProfile('V2'); A.DB.profiles=[rzu]; A.DB.current=rzu.id;
if(A.unlockState(rzu,A.trackById('split')).open){rzStBad++;console.log('  !!  rozklad je otevreny hned od zacatku');}
A.trackKeys(rzu,A.trackById('a100')).forEach(k=>rzu.facts[k]={lv:2,reps:6,ok:5,bad:1,best:3000,seen:Date.now()});
if(!A.unlockState(rzu,A.trackById('split')).open){rzStBad++;console.log('  !!  rozjeta stovka neotevrela rozklad');}
// na mape stoji tesne pred tisicovkou, tedy v poradi knihy
const rzPor=A.TRACKS.map(x=>x.id);
if(rzPor.indexOf('split')!==rzPor.indexOf('a1000')-1){
  rzStBad++;console.log('  !!  rozklad nestoji na mape tesne pred tisicovkou');}
// kapitola 21 uz generator ma, kapitola 25 rozklad opakuje
const rzCur3=A.CURRICULA.find(c=>c.id==='nns-matysek-3');
if(!A.isPlayable(rzCur3.chapters.find(x=>x.n===21))){rzStBad++;console.log('  !!  kapitola 21 porad nejde vybrat');}
if(A.poolKeys(rzCur3.chapters.find(x=>x.n===21).pool).join()!=='v1,v2,v3'){
  rzStBad++;console.log('  !!  kapitola 21 nema vsechny rady');}
if(A.poolKeys(rzCur3.chapters.find(x=>x.n===25).pool).indexOf('v3')<0){
  rzStBad++;console.log('  !!  opakovani oboru do tisice zapomnelo na rozklad');}
if(A.poolSize(['v3'])!==4){rzStBad++;console.log('  !!  klic rozkladu se nepocita jako rodina');}
console.log('chyb ve stupnich rozkladu:',rzStBad);

// 7w. vyber z nabidky: nabizi se jen skutecne odpovedi, spravna se losuje
// rovnomerne a tlacitka se nehybou
//
// Overuje se ze zadani, ne z toho, co si generator mysli: z radku se
// precte cislo a z odpovedi se vezme, ktere tlacitko melo byt stisknute,
// a musi platit, ze to o tom cisle doopravdy plati. Rovnomernost je tu
// jadro veci: kdyby nektere tlacitko bylo spravne casteji, dalo by se
// hadat z polohy, a kdyby bylo spravne nikdy, naucilo by se dite ho
// preskakovat.
let vbBad=0, vbN=0;
const vbsay=m=>{vbBad++; if(vbBad<8) console.log('  !!  '+m);};
for(const b of A.J_BUCKETS){
  const key='j'+b.id;
  const trefy=new Map(), cisla=new Set();
  const N=3000;
  for(let i=0;i<N;i++){
    const it=A.itemFromKey(key); vbN++;
    if(it.input!=='pick'){vbsay('vyber z nabidky se neodpovida tlacitky: '+it.input);break;}
    if(A.slotsOf(it)!==1){vbsay('vyber ma mit jedno policko, ma '+A.slotsOf(it));break;}
    if(!Array.isArray(it.opts)||it.opts.length<2||it.opts.length>4){
      vbsay('nabidka nema dve az ctyri moznosti: '+JSON.stringify(it.opts));break;}
    if(new Set(it.opts).size!==it.opts.length){vbsay('dve tlacitka nesou tutez odpoved: '+it.opts.join('/'));break;}
    if(!it.ask){vbsay('nerika se slovy, na co se ptame');break;}
    if(!it.rel){vbsay('na radku chybi slovo mezi cislem a odpovedi');break;}
    if(!/^\d+$/.test(it.text)){vbsay('zadani neni cislo: '+it.text);break;}
    const n=+it.text, a=it.answer;
    if(!Number.isInteger(a)||a<0||a>=it.opts.length){vbsay('odpoved neukazuje na tlacitko: '+a);break;}
    // a ted to hlavni: odpoved musi o tom cisle doopravdy platit
    if(b.kind==='parity'){
      if(n<b.lo||n>b.hi){vbsay('cislo '+n+' je mimo kbelik '+b.id);break;}
      if((n%2===0?0:1)!==a){vbsay('cislo '+n+' neni to, co tvrdi tlacitko '+a);break;}
    }else{
      if(String(n).length-1!==a){vbsay('cislo '+n+' nema tolik cislic, kolik tvrdi tlacitko '+a);break;}
    }
    trefy.set(a,(trefy.get(a)||0)+1); cisla.add(n);
    // kazda otazka uzna svou odpoved a neuzna zadnou jinou
    if(!it.check(String(a))){vbsay('otazka neuznala vlastni odpoved: '+it.text);break;}
    let prosla=false;
    for(let j=0;j<it.opts.length;j++) if(j!==a&&it.check(String(j))) prosla=true;
    if(prosla){vbsay('prosla i jina moznost: '+it.text);break;}
    // cely radek se precte zpatky jako veta, ne jako cislo tlacitka
    const cely=A.rightAnswerText(it);
    const slovo=A.I18N[A.DB.lang||'cs'][it.rel];
    if(cely!==it.text+' '+slovo+' '+it.opts[a]){vbsay('odpoved se necte jako veta: '+cely);break;}
    // a v policku se ukaze slovo, ne cislo stisknuteho tlacitka
    if(A.questionHTML(it).indexOf('q-pick')<0){vbsay('radek s vyberem nema vlastni tridu');break;}
  }
  // rovnomernost: kazde tlacitko musi byt spravne zhruba stejne casto
  const pocet=A.J_BUCKETS.find(x=>x.id===b.id).kind==='parity'?2:3;
  if(trefy.size!==pocet) vbsay('kbelik '+b.id+' nepouzil vsechna tlacitka, jen '+trefy.size+' z '+pocet);
  for(const [tl,kolik] of trefy){
    const podil=kolik/N;
    if(podil<1/pocet-0.05||podil>1/pocet+0.05)
      vbsay('tlacitko '+tl+' v kbeliku '+b.id+' je spravne v '+Math.round(podil*100)+' % pripadu');
  }
  if(cisla.size<9) vbsay('kbelik '+b.id+' losuje jen '+cisla.size+' ruznych cisel');
}
// tlacitka stoji porad ve stejnem poradi, jinak by se cil hybal pod prstem
for(const key of ['jp1','jd1']){
  const prvni=A.itemFromKey(key).opts.join('|');
  for(let i=0;i<200;i++) if(A.itemFromKey(key).opts.join('|')!==prvni){
    vbsay('klic '+key+' michá tlacitka mezi otazkami');break;}
}
// spatna odpoved u sudych a lichych dostane pravidlo, ne obecnou hlasku
const vbIt=A.itemFromKey('jp2');
const vbH1=A.missHint(vbIt,String(1-vbIt.answer));
const vbH0=A.missHint(A.itemFromKey('m6x7'),'41');
if(vbH1===vbH0) vbsay('sude a liche nedostalo vlastni hlasku');
// neznamy kbelik pada nahlas, nevyrobi nahradni priklad
let vbPadl=false; try{A.itemFromKey('jz9');}catch(e){vbPadl=true;}
if(!vbPadl) vbsay('neznamy kbelik vyberu nespadl');
console.log('zkontrolovano vyberu z nabidky:',vbN,'| chyb:',vbBad);

// 7x. HRANICE: vyber z nabidky se do zavodu dostane jen pres vybranou
// kapitolu ucebnice, nikam jinam
//
// Je to porusení prvniho z nedotknutelnych principu (poznavani misto
// vybavovani), povolene jen jako doplnek uvnitr skolni trati. Tenhle
// okruh je duvod, proc se to za rok nebude muset dohledavat: zkousi
// kazdou trat na mape vcetne sampionatu a trati "co ti nejde", a to i
// pote, co dite otazky s vyberem uz odpovidalo a ma je v krabicce.
let hrBad=0;
const hrsay=m=>{hrBad++;console.log('  !!  '+m);};
const hr=A.newProfile('J1'); A.DB.profiles=[hr]; A.DB.current=hr.id;
hr.grade=4;                                    // at vidi celou mapu
// rodina nema vlastni trat a mit ji nesmi
if(A.TRACKS.some(x=>A.trackKeys(hr,x).some(A.isPickKey)&&x.op!=='school'))
  hrsay('vyber z nabidky si zalozil vlastni trat');
// krabicka plna vyberu a vsechno ostatni taky rozjete, aby se mely
// sampionat i "co ti nejde" z ceho brat
for(const tr of A.TRACKS){
  if(tr.op==='school') continue;
  for(const k of A.trackKeys(hr,tr)) hr.facts[k]={lv:4,reps:8,ok:7,bad:1,best:2500,seen:Date.now()};
}
for(const k of A.pickKeys(A.J_BUCKETS.map(b=>b.id)))
  hr.facts[k]={lv:1,reps:9,ok:2,bad:7,best:4000,seen:Date.now()};   // nejhorsi v krabicce
hr.curriculum='nns-matysek-3'; hr.chapter=6;
for(const tr of A.TRACKS){
  if(tr.op==='school') continue;
  for(let i=0;i<40;i++){
    let run;
    try{ run=A.buildRun(hr,tr); }
    catch(e){ hrsay('trat '+tr.id+' spadla na hlidce: '+e.message); break; }
    if(run.some(it=>A.isPickKey(it.key))){hrsay('trat '+tr.id+' dostala otazku s vyberem');break;}
  }
}
// a naopak: skolni trat na kapitole 6 ji dostat musi, jinak by kapitola
// byla vybratelna a tise by nedelala nic
// mekky rezim je vychozi, takze kapitola nese zavod a zbytek je
// opakovani drivejsich kapitol; tvrdy rezim bere jen kapitolu
const hrSkola=A.buildRun(hr,A.trackById('school'));
const hrKolik=hrSkola.filter(it=>A.isPickKey(it.key)).length;
if(hrKolik<hrSkola.length*0.5)
  hrsay('skolni trat na kapitole 6 nedostala otazky s vyberem: '+hrKolik+'/'+hrSkola.length);
if(hrKolik===hrSkola.length) hrsay('mekky rezim zapomnel na opakovani drivejsich kapitol');
hr.chapterMode='hard';
const hrTvrdy=A.buildRun(hr,A.trackById('school'));
if(!hrTvrdy.every(it=>A.isPickKey(it.key))) hrsay('tvrdy rezim pustil do kapitoly 6 neco jineho');
hr.chapterMode='soft';
// kapitola 6 uz jde vybrat a nese prave tri klice
const hrCur3=A.CURRICULA.find(c=>c.id==='nns-matysek-3');
const hrKap6=hrCur3.chapters.find(x=>x.n===6);
if(!A.isPlayable(hrKap6)) hrsay('kapitola 6 porad nejde vybrat');
if(A.poolKeys(hrKap6.pool).join()!=='jp1,jp2,jd1') hrsay('kapitola 6 nema cekane klice: '+A.poolKeys(hrKap6.pool).join());
if(A.poolSize(['jp1'])!==4) hrsay('klic vyberu se nepocita jako rodina');
// zadne misto ve sbirce, protoze zadna sbirka: misto, ktere se rozsviti
// tam, kam se neda podivat, slibuje vic, nez obrazovka splni
const hrSb=A.newProfile('J2'); A.DB.profiles=[hrSb]; A.DB.current=hrSb.id;
const hrPol=A.itemFromKey('jp1');
for(let i=0;i<8;i++) A.record(hrSb,hrPol,true,900);
if(hrSb.facts['jp1'].lv<A.STAR_LV) hrsay('kontrola sbirky nedojela na uroven ctyri');
if(A.starred(hrSb,'jp1')) hrsay('vyber z nabidky rozsvitil misto ve sbirce, kterou nema');
// a klasicky klic se rozsvitit musi, aby hlidka neshodila vsechno
const hrPol2=A.itemFromKey('m6x7');
for(let i=0;i<8;i++) A.record(hrSb,hrPol2,true,900);
if(!A.starred(hrSb,'m6x7')) hrsay('hlidka sbirky zhasla i beznemu prikladu');
console.log('chyb v hranici vyberu z nabidky:',hrBad);

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
// deleni se zbytkem je nejsirsi radek, ktery hra kresli: ke zadani se
// pocita druhe policko za tri znaky (nevykrati se, na rozdil od
// vedouciho radku) a slova mezi polickami a za nimi. Vsechny kbeliky
// musi dostat nejmensi pismo a radek musi mit vlastni tridu.
let rDelka=0, rDelsi='', rMaxDelenec=0;
// nejvetsi delenec chce nejvetsi podil a nejvetsi zbytek naraz, coz je
// jedna losovana dvojice z devadesati, takze se losuje dost dlouho na to,
// aby to nebyla nahoda
for(const key of A.divremKeys(A.R_BUCKETS.map(b=>b.id))) for(let i=0;i<4000;i++){
  const it=A.itemFromKey(key), h=A.questionHTML(it);
  const radek=String(it.text)+' ? '+it.sep+' ?'+it.tail;
  const delenec=+/^(\d+)/.exec(it.text)[1];
  if(radek.length>rDelka){rDelka=radek.length; rDelsi=radek;}
  if(delenec>rMaxDelenec) rMaxDelenec=delenec;
  if(!/q-boxes/.test(h)){qhBad++;console.log('  !!  deleni se zbytkem nema tridu radku se dvema polickami',it.text);break;}
  if(!/q-xlong/.test(h)){qhBad++;console.log('  !!  deleni se zbytkem si nereklo o nejmensi pismo',it.text);break;}
}
// nejdelsi zadani rodiny je "109 : 10", tedy nejvetsi podil a nejvetsi
// zbytek u desitky; vetsi delenec vzniknout nemuze, protoze podil konci
// na deseti. Cely radek je s obema policky a se slovy devatenact znaku
// a je to nejsirsi radek, ktery hra kresli.
if(rMaxDelenec!==109){
  qhBad++;console.log('  !!  nejvetsi delenec neni 109, ale',rMaxDelenec);}
if(rDelka!==19||!/^\d\d\d : 10 /.test(rDelsi)){
  qhBad++;console.log('  !!  nejdelsi radek deleni se zbytkem neni trojciferny delenec deleny deseti:',rDelsi,rDelka);}
console.log('nejdelsi radek deleni se zbytkem:',rDelsi,'('+rDelka+' znaku)');
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

// 7r. vstupni prvek se dvema polickami
//
// Deleni se zbytkem jeste neexistuje, takze se prvek zkousi na polozce
// slozene tady: dve hodnoty v odpovedi a slova, ktera mezi polickami
// a za nimi stoji. Az generator prijde, tenhle okruh se nemeni, jen
// prestane byt jediny, kdo pad2 vyrabi. Psani, preskok a mazani pres
// hranici jsou interakce nad zivym DOMem a hlida je flow.test.js.
let p2Bad=0;
const p2say=m=>{p2Bad++;console.log('  !!  '+m);};
const dvoj=Object.assign({key:'r36x5', text:'36 : 5', answer:[7,1], input:'pad2',
  maxLen:[2,1], sep:'(zb.', tail:')', kind:'divrem'});
dvoj.check=A.defaultCheck(dvoj.answer);
const jedno=A.itemFromKey('m6x7');

if(A.slotsOf(dvoj)!==2) p2say('pad2 nema dve policka, ale '+A.slotsOf(dvoj));
if(A.slotsOf(jedno)!==1) p2say('obycejna otazka dostala vic nez jedno policko');
// radek: zadani, prvni policko, slova mezi, druhe policko, slova za nim
const hd=A.questionHTML(dvoj);
const iA=hd.indexOf('id="abox"'), iB=hd.indexOf('id="abox2"'), iS=hd.indexOf('(zb.');
if(iA<0||iB<0) p2say('radek nema obe policka: '+hd);
if(iA>iB) p2say('policka nestoji v poradi podil, zbytek');
if(!(iS>iA&&iS<iB)) p2say('slova mezi polickami nestoji mezi nimi');
if(hd.indexOf('<span class="qsep">)</span>')<iB) p2say('zavorka se nezavrela za druhym polickem');
if(!/data-slot="0"/.test(hd)||!/data-slot="1"/.test(hd)) p2say('policko nerekne, ktere je, takze do nej nejde klepnout');
if(!/class="answerbox active" id="abox"/.test(hd)) p2say('neni videt, do ktereho policka se pise');
const hd1=A.questionHTML(dvoj,1);
if(!/class="answerbox active" id="abox2"/.test(hd1)) p2say('prepnute policko se neoznacilo');
if(/class="answerbox active" id="abox"/.test(hd1)) p2say('aktivni jsou dve policka naraz');
// nejsirsi radek, ktery hra kresli, takze nejmensi pismo a vlastni trida
if(!/q-boxes/.test(hd)) p2say('radek se dvema polickami nema vlastni tridu');
if(!/q-xlong/.test(hd)) p2say('radek se dvema polickami si nerekl o nejmensi pismo: '+hd);
// jedno policko zustalo presne takove, jake bylo
const hd0=A.questionHTML(jedno);
if(/data-slot|q-boxes|active/.test(hd0)) p2say('jedno policko dostalo vybavu dvou: '+hd0);
if(!/<span class="answerbox" id="abox">/.test(hd0)) p2say('policko jedne odpovedi zmenilo tvar: '+hd0);
// klavesnice: tri sloupce cislic plus ctvrty s gumou, sipkou a fajfkou
const kp=A.keypadHTML(dvoj), kp0=A.keypadHTML(jedno);
if(!/data-input="pad2"/.test(kp)) p2say('klavesnice se nepredstavila jako pad2');
if(!/class="keypad keypad-pad2"/.test(kp)) p2say('klavesnice nema vlastni rozvrzeni');
if((kp.match(/data-k="/g)||[]).length!==13) p2say('klavesnice pro dve policka nema trinact klaves');
if(!/data-k="next"/.test(kp)) p2say('chybi klavesa na prepnuti policka');
// prepinaci klavesa musi jit pres data-k, jinak ji delegovany posluchac
// nikdy nedostane
if(/data-act=/.test(kp)) p2say('klavesa si vzala data-act, ktere posluchac cte az nakonec');
if(/data-k="next"/.test(kp0)) p2say('obycejna klavesnice dostala prepinaci klavesu');
if((kp0.match(/data-k="/g)||[]).length!==12) p2say('obycejna klavesnice uz nema dvanact klaves');
// kazda hodnota se porovnava zvlast, nikdy se neslepi do jednoho cisla
if(!dvoj.check(['7','1'])) p2say('otazka neuznala vlastni odpoved');
if(dvoj.check(['7','2'])) p2say('spatny zbytek prosel');
if(dvoj.check(['8','1'])) p2say('spatny podil prosel');
if(dvoj.check(['1','7'])) p2say('prohozene hodnoty prosly');
if(dvoj.check('71')) p2say('podil a zbytek slepene do jednoho cisla prosly');
if(dvoj.check(['7'])) p2say('chybejici zbytek prosel jako odpoved');
if(dvoj.check(['7',''])) p2say('prazdne policko proslo jako nula');
if(!A.defaultCheck(42)('42')||A.defaultCheck(42)('43')) p2say('jedna hodnota se prestala porovnavat');
// a cela odpoved se precte zpatky jako radek, ne jako dve cisla za sebou
const celyR=A.rightAnswerText(dvoj);
if(celyR!=='36 : 5 = 7 (zb. 1)') p2say('cela odpoved se necte jako radek: '+celyR);
/* Tri policka nejsou treti cesta, jen dalsi radek v tabulce SLOTS,
   takze se tady overuje totez, co u dvou: radek, klavesnice a porovnani.
   Polozka je skutecna, z rodiny rozkladu cisla. */
const troje=A.itemFromKey('v3');
if(A.slotsOf(troje)!==3) p2say('pad3 nema tri policka, ale '+A.slotsOf(troje));
const h3=A.questionHTML(troje);
const i3=['id="abox"','id="abox2"','id="abox3"'].map(x=>h3.indexOf(x));
if(i3.some(x=>x<0)) p2say('radek nema vsechna tri policka: '+h3);
if(!(i3[0]<i3[1]&&i3[1]<i3[2])) p2say('policka nestoji v poradi stovky, desitky, jednotky');
// slovo mezi policky stoji v kazde mezere, tedy dvakrat
if((h3.match(/<span class="qsep">\+<\/span>/g)||[]).length!==2) p2say('plus nestoji v obou mezerach: '+h3);
if(!/data-slot="2"/.test(h3)) p2say('treti policko nerekne, ktere je');
if(!/class="answerbox active" id="abox"/.test(h3)) p2say('neni videt, do ktereho ze tri policek se pise');
if(!/class="answerbox active" id="abox3"/.test(A.questionHTML(troje,2))) p2say('prepnuti na treti policko se neoznacilo');
if(!/q-boxes q-boxes3/.test(h3)) p2say('radek se tremi polickami nerekne, kolik jich ma: '+h3);
if(!/q-xlong/.test(h3)) p2say('nejsirsi radek hry si nerekl o nejmensi pismo: '+h3);
const kp3=A.keypadHTML(troje);
if(!/data-input="pad3"/.test(kp3)) p2say('klavesnice se nepredstavila jako pad3');
if(!/class="keypad keypad-pad3"/.test(kp3)) p2say('klavesnice pro tri policka nema vlastni rozvrzeni');
if((kp3.match(/data-k="/g)||[]).length!==13) p2say('klavesnice pro tri policka nema trinact klaves');
if(!/data-k="next"/.test(kp3)) p2say('chybi klavesa na prepnuti policka');
const c3=A.defaultCheck([300,40,7]);
if(!c3(['300','40','7'])) p2say('tri hodnoty se neuznaly');
if(c3(['300','40','8'])||c3(['30','40','7'])) p2say('spatna z tri hodnot prosla');
if(c3(['300','40'])||c3('300407')) p2say('slepene nebo chybejici hodnoty prosly');
/* A vstupni prvek s tlacitky, tedy vyber z nabidky. Overuje se tvar
   radku, tvar odpovidaci plochy a to, ze se plocha vymeni i mezi dvema
   otazkami, ktere se obe odpovidaji vyberem: sude a liche nabizi dve
   slova, kolik cislic tri, a kdyby se plocha menila jen podle jmena
   prvku, zustala by pod prstem spatna slova. */
const vyb=A.itemFromKey('jp1'), vyb3=A.itemFromKey('jd1');
if(A.slotsOf(vyb)!==1) p2say('vyber ma mit jedno policko, ma '+A.slotsOf(vyb));
const hv=A.questionHTML(vyb);
if(!/q-pick/.test(hv)) p2say('radek s vyberem nema vlastni tridu: '+hv);
if(/data-slot|q-boxes/.test(hv)) p2say('radek s vyberem si vzal vybavu vic policek: '+hv);
if(!/<span class="answerbox" id="abox">/.test(hv)) p2say('radek s vyberem nema policko odpovedi: '+hv);
const kv=A.keypadHTML(vyb), kv3=A.keypadHTML(vyb3);
if(!/data-input="pick"/.test(kv)) p2say('plocha se nepredstavila jako pick');
if(!/class="keypad keypad-pick"/.test(kv)) p2say('plocha vyberu nema vlastni rozvrzeni');
if(!/data-opts="2"/.test(kv)||!/data-opts="3"/.test(kv3)) p2say('plocha nerekne, kolik ma tlacitek');
if((kv.match(/data-k="/g)||[]).length!==2) p2say('nabidka dvou ma jiny pocet tlacitek');
if((kv3.match(/data-k="/g)||[]).length!==3) p2say('nabidka tri ma jiny pocet tlacitek');
// zadna guma, zadna sipka, zadna fajfka: vyber neni nic, co by se
// skladalo po znacich, takze neni co potvrzovat ani mazat
if(/data-k="ok"|data-k="del"|data-k="next"/.test(kv)) p2say('plocha vyberu dostala klavesy ciselne klavesnice');
// tlacitka musi jit pres data-k, jinak je delegovany posluchac nedostane
if(/data-act=/.test(kv)) p2say('tlacitko vyberu si vzalo data-act, ktere posluchac cte az nakonec');
for(let i=0;i<vyb.opts.length;i++) if(kv.indexOf('data-k="opt'+i+'"')<0) p2say('chybi tlacitko '+i);
for(const o of vyb.opts) if(kv.indexOf(o)<0) p2say('na plose chybi slovo '+o);
// odpovidaci plocha se pozna podle nabidky, ne podle jmena prvku
if(A.surfaceOf(vyb)===A.surfaceOf(vyb3)) p2say('dve ruzne nabidky vypadaji jako tataz plocha');
if(A.surfaceOf(A.itemFromKey('jp1'))!==A.surfaceOf(A.itemFromKey('jp2')))
  p2say('tataz nabidka vypada jako dve ruzne plochy');
if(A.surfaceOf(jedno)!=='pad'||A.surfaceOf(dvoj)!=='pad2') p2say('obycejna plocha si zmenila jmeno');
if(A.keypadHTML(jedno).indexOf('data-surface="pad"')<0) p2say('ciselna klavesnice nerekne, jaka je to plocha');
console.log('chyb ve vstupnim prvku s vic policky:',p2Bad);

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
