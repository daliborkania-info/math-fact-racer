const fs=require('fs');const path=require('path');const ROOT=path.resolve(__dirname, '..');
const base = path.join(ROOT, 'src') + '/';
let src=fs.readFileSync(base+'i18n.js','utf8')+'\n'+fs.readFileSync(base+'app.js','utf8');
const el=()=>({innerHTML:'',textContent:'',className:'',style:{},clientWidth:360,classList:{add(){},remove(){}},appendChild(){},remove(){},dataset:{},querySelector:()=>el(),querySelectorAll:()=>[],closest:()=>null,focus(){},offsetWidth:1});
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},createElement:()=>el(),body:{appendChild(){}},onkeydown:null};
global.window={addEventListener(){}};const store={};
global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};
global.navigator={};global.setTimeout=()=>0;
src+="\n;module.exports={itemFromKey,MULT,ADD,mk,dk,ak,sk,H_BUCKETS,newProfile,buildRun,TRACKS,DB,petSVG,rideSVG,PETS,RIDES,ENVS,circuit,atU,circuitThumb,circuitSVG};";
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
