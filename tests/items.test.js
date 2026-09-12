const fs=require('fs');const path=require('path');const ROOT=path.resolve(__dirname, '..');
const base = path.join(ROOT, 'src') + '/';
let src=fs.readFileSync(base+'i18n.js','utf8')+'\n'+fs.readFileSync(base+'curricula.js','utf8')+'\n'+fs.readFileSync(base+'app.js','utf8');
const el=()=>({innerHTML:'',textContent:'',className:'',style:{},clientWidth:360,classList:{add(){},remove(){}},appendChild(){},remove(){},dataset:{},querySelector:()=>el(),querySelectorAll:()=>[],closest:()=>null,focus(){},offsetWidth:1});
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},createElement:()=>el(),body:{appendChild(){}},onkeydown:null};
global.window={addEventListener(){}};const store={};
global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};
global.navigator={};global.setTimeout=()=>0;
src+="\n;module.exports={itemFromKey,MULT,ADD,mk,dk,ak,sk,H_BUCKETS,newProfile,buildRun,TRACKS,DB,petSVG,rideSVG,PETS,RIDES,ENVS,circuit,atU,circuitThumb,circuitSVG,CURRICULA,poolKeys,poolSize,schoolPool,schoolReady,visibleTracks,chapterOf,trackById};";
const mod={};new Function('module','exports','require',src)(mod,{},require);
const A=mod.exports;

// 1. overeni vsech typu prikladu
let bad=0,checked=0;
const keys=[];
A.MULT.forEach(f=>{keys.push(A.mk(f.a,f.b)); if(f.a>1) keys.push(A.dk(f.a,f.b));});
A.ADD.forEach(f=>{keys.push(A.ak(f.a,f.b)); keys.push(A.sk(f.a,f.b));});
A.H_BUCKETS.forEach(b=>{keys.push('p'+b.id); keys.push('n'+b.id);});
for(const k of keys) for(let i=0;i<40;i++){
  const it=A.itemFromKey(k); checked++;
  const parts=it.text.replace(/×/g,'*').replace(/:/g,'/').split(' ');
  const val=eval(parts.join(' '));
  const inRange = it.answer>=0 && it.answer<=100 && Number.isInteger(it.answer);
  if(val!==it.answer||!inRange){bad++;if(bad<6)console.log('CHYBA',k,it.text,'ocekavano',val,'ma',it.answer);}
}
console.log('zkontrolovano prikladu:',checked,'| chyb:',bad);

// 2. delka a rozmanitost zavodu na vsech tratich
const p=A.newProfile('T'); A.DB.profiles=[p]; A.DB.current=p.id;
for(const t of A.TRACKS){
  const it=A.buildRun(p,t);
  let dup=0; for(let i=1;i<it.length;i++) if(it[i].key===it[i-1].key) dup++;
  const uniq=new Set(it.map(x=>x.key)).size;
  console.log(t.id.padEnd(5), 'otazek', it.length, '| ruznych', uniq, '| za sebou stejne', dup, '|', it.slice(0,4).map(x=>x.text+'='+x.answer).join('  '));
}

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
