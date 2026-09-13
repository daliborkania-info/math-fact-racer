/* Migrace: nova verze nesmi pripravit stary profil o nic, co uz ma.
   Hra bezi na cizich telefonech, aktualizuje se sama pri dalsim nacteni
   a zalohu si nikdo nedela, takze tohle je jediny zachytny bod.
   Pravidlo je v docs/PROJECT-STATE.md, oddil 3. Kdyz sahnes na datovy
   model, pridej do fixtures/legacy-profiles.json dalsi zamrazeny profil.
   Nikdy neresit padajici test tim, ze se z nej vyskrtne kontrola. */
const fs=require('fs');const path=require('path');const ROOT=path.resolve(__dirname, '..');const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(ROOT, 'index.html'),'utf8');
const FX=JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'legacy-profiles.json'),'utf8'));
const ok=(n,c,x)=>console.log((c?'  OK  ':'  !!  ')+n+(x!==undefined?'   ['+x+']':''));
/* Okno jsdomu je 1024 x 768; migrace se hlida na telefonu na vysku,
   takze se rozmery nastavi jeste pred spustenim skriptu hry. Od kroku C
   se podle nich pri startu rozhoduje rozvrzeni. */
const phone=win=>{
  Object.defineProperty(win,'innerWidth',{value:375,configurable:true,writable:true});
  Object.defineProperty(win,'innerHeight',{value:812,configurable:true,writable:true});
};

/* prilis velke sady prikladu, aby fixture zustala citelna */
function fillFacts(tag){
  const out={};
  if(tag==='nasobilka-tesne-pod-branou'){
    // cela mala nasobilka rozjeta, ale jen rozjeta: dve tretiny spoju na
    // urovni 2 a zbytek na 1 delaji zvladnuti 0,55, tedy tesne pod branou
    // 0,6, kterou se otevira trat Co dřív. Nova verze ji tedy nesmi
    // otevrit sama, dokud si ji dite neodjezdi.
    let i=0;
    for(let a=1;a<=10;a++) for(let b=a;b<=10;b++)
      out['m'+a+'x'+b]={lv:(i++%3?2:1),reps:5,ok:4,bad:1,best:2600,seen:1757000000000};
  }
  if(tag==='cela-nasobilka-a-za-ni-jen-rozjete'){
    // cela mala nasobilka i deleni na urovni 4, tedy zaslouzene otevrena
    // trat za nasobilkou, ale sama ta trat je jen nacata: osm klicu na
    // urovni 1 dela zvladnuti 1/3, tedy pod branou 0,5, kterou se otevira
    // trat Kulatá čísla. Nova verze ji tedy nesmi otevrit sama.
    for(let a=1;a<=10;a++) for(let b=a;b<=10;b++){
      out['m'+a+'x'+b]={lv:4,reps:7,ok:7,bad:0,best:1800,seen:1757000000000};
      if(a>1) out['d'+a+'x'+b]={lv:4,reps:6,ok:6,bad:0,best:2100,seen:1757000000000};
    }
    for(const h of ['xm','xd']) for(const i of ['1','2','3','4'])
      out[h+i]={lv:1,reps:3,ok:2,bad:1,best:4200,seen:1757000000000};
  }
  if(tag==='a20-stare-klice-na-uroven-2'){
    // obor do dvaceti tak, jak vypadal pred pridanim desitkovych spoju:
    // oba scitance do deseti. Uroven 2 dela zvladnuti 2/3, tedy tesne
    // nad prahem 0,6, kterym se otvira stovka.
    for(let a=1;a<=10;a++) for(let b=a;b<=10;b++) for(const h of ['a','s'])
      out[h+a+'p'+b]={lv:2,reps:4,ok:3,bad:1,best:2500,seen:1757000000000};
  }
  return out;
}

/* projde puvodni profil do hloubky a hlida, ze v novem nic nechybi
   a zadne cislo nekleslo. Pribyt smi cokoli. */
const GROW_ONLY=new Set(['lv','reps','ok','bad','coins','runs','totalOk','totalAns',
  'msSum','msN','streak','bestStreak','trackRuns','done']);
function compare(before, after, pathStr, out, growing){
  if(before===null || typeof before!=='object'){
    if(after===undefined){ out.push('zmizelo '+pathStr+' (bylo '+JSON.stringify(before)+')'); return; }
    if(growing && typeof before==='number' && typeof after==='number'){
      if(after<before) out.push('kleslo '+pathStr+': '+before+' -> '+after);
      return;
    }
    if(JSON.stringify(before)!==JSON.stringify(after))
      out.push('zmenilo se '+pathStr+': '+JSON.stringify(before)+' -> '+JSON.stringify(after));
    return;
  }
  if(Array.isArray(before)){
    if(!Array.isArray(after)){ out.push('uz to neni seznam '+pathStr); return; }
    for(const v of before) if(!after.some(x=>JSON.stringify(x)===JSON.stringify(v)))
      out.push('ze seznamu '+pathStr+' zmizelo '+JSON.stringify(v));
    return;
  }
  if(after===null || typeof after!=='object'){ out.push('zmizel objekt '+pathStr); return; }
  for(const k of Object.keys(before)){
    if(k[0]==='_') continue;
    compare(before[k], after[k], pathStr?pathStr+'.'+k:k, out, growing || GROW_ONLY.has(k));
  }
}

/* jedina povolena vyjimka: kapitola bez generatoru se srovna dozadu */
const ALLOWED=['chapter'];
function allowed(msg){ return ALLOWED.some(k=>new RegExp('(^| |\\.)'+k+':').test(msg)); }

(async()=>{
for(const c of FX.cases){
  console.log('--- '+c.id+'  ('+c.note+')');
  const db=JSON.parse(JSON.stringify(c.db));
  for(const p of db.profiles) if(p._fillFacts) p.facts=Object.assign(p.facts||{}, fillFacts(p._fillFacts));
  const before=JSON.parse(JSON.stringify(db));

  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/',
    beforeParse(win){ win.localStorage.setItem('math-fact-racer-v1', JSON.stringify(db)); phone(win); }});
  const w=dom.window; const errs=[];
  w.addEventListener('error',e=>errs.push('ERROR: '+e.message));
  dom.virtualConsole.on('jsdomError',e=>errs.push('JSDOM: '+e.message));
  Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 375}});
  Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{get(){return 192}});
  await new Promise(r=>setTimeout(r,60));

  ok('hra po nacteni starsiho profilu nespadla', errs.length===0, errs.join(' | ')||'zadne chyby');
  const after=JSON.parse(w.localStorage.getItem('math-fact-racer-v1'));

  ok('profil zustal na miste', after.profiles.length===before.profiles.length
     && after.profiles[0].id===before.profiles[0].id && after.current===before.current);
  ok('kod rodice a jazyk prezily', after.pin===before.pin && after.lang===before.lang);

  const diffs=[];
  compare(before.profiles[0], after.profiles[0], '', diffs, false);
  const hard=diffs.filter(d=>!allowed(d));
  ok('nic z profilu nezmizelo ani neklesla', hard.length===0, hard.join(' | ')||'vse na miste');
  if(diffs.length!==hard.length) console.log('       povolena migrace: '+diffs.filter(allowed).join(' | '));

  const opened=JSON.parse(w.eval('JSON.stringify(TRACKS.filter(t=>unlockState(P(),t).open).map(t=>t.id))'));
  const chybi=(c.expectOpen||[]).filter(id=>!opened.includes(id));
  ok('trati, ktere uz byly otevrene, zustaly otevrene', chybi.length===0,
     chybi.length?'zavrelo se '+chybi.join(','):'otevreno '+opened.join(','));
  const navic=(c.expectClosed||[]).filter(id=>opened.includes(id));
  ok('co bylo zamcene, zustalo zamcene', navic.length===0, navic.length?'otevrelo se '+navic.join(','):'ok');

  // sbirka: starsimu profilu se misto ve sbirce dopocita z krabicky, tedy
  // z toho, co prokazatelne umi ted. Rozsvitit se smi jen to, co je na
  // urovni ctyri a vys, jinak by sbirka prestala byt obrazkem uciva.
  if(c.expectStars){
    const st=after.profiles[0].stars||{};
    const chybi=c.expectStars.filter(k=>!st[k]);
    ok('hvezdy se dopocitaly z krabicky', chybi.length===0,
       chybi.length?'nerozsvitilo se '+chybi.join(','):'rozsviceno '+Object.keys(st).length);
    const navic=(c.expectNoStars||[]).filter(k=>st[k]);
    ok('pod urovni ctyri se nerozsvitilo nic', navic.length===0,
       navic.length?'rozsvitilo se '+navic.join(','):'ok');
  }

  // svet: starsi profil patri do okruhu, protoze v nem uz hral, a zadny
  // svet mu nesmi vzit koupeneho zavodnika z nabidky
  if(c.expectWorld){
    ok('profil skoncil ve spravnem svete', after.profiles[0].world===c.expectWorld,
       'svet '+after.profiles[0].world);
    const vsude=w.eval(`(function(){
      const p=P(), own=ALL_ITEMS.filter(i=>p.owned.includes(i.id));
      return WORLDS.every(x=>ridesOrder({world:x.id}, own).length===own.length);
    })()`);
    ok('zadny svet neschoval koupeneho zavodnika', vsude===true);
  }

  // rocnik: starsi profil zadny nema a musi dostat nejvyssi, jinak by mu
  // filtr mapy vzal trati, ktere uz vidi
  if(c.expectGrade){
    ok('profil dostal rocnik, ktery mu nic nebere', after.profiles[0].grade===c.expectGrade,
       'rocnik '+after.profiles[0].grade);
    // na mape je to, co patri do rocniku; co je z vyssiho, doskoci dite
    // pres ukazku na konci cesty, takze se to nepocita za ztratu
    const vidi=JSON.parse(w.eval('JSON.stringify(visibleTracks(P()).map(t=>t.id))'));
    const patri=JSON.parse(w.eval('JSON.stringify(TRACKS.filter(t=>inGrade(P(),t)).map(t=>t.id))'));
    const chybi=(c.expectOpen||[]).filter(id=>patri.includes(id) && !vidi.includes(id));
    ok('vsechny jeho trati z jeho rocniku zustaly na mape', chybi.length===0,
       chybi.length?'z mapy zmizelo '+chybi.join(','):vidi.length+' trati na mape');
  }

  if(c.expectChapter!==null){
    const ch=after.profiles[0].chapter;
    ok('kapitola se srovnala jen dozadu', ch===c.expectChapter,
       'kapitola '+before.profiles[0].chapter+' -> '+ch+', cekano '+c.expectChapter);
  }
  dom.window.close();
}

/* a nakonec: dvoji nacteni uz nesmi hnout vubec nicim */
console.log('--- opakovane nacteni');
const db2=JSON.parse(JSON.stringify(FX.cases[0].db));
const boot=raw=>{
  const d=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/',
    beforeParse(win){ win.localStorage.setItem('math-fact-racer-v1', raw); phone(win); }});
  Object.defineProperty(d.window.HTMLElement.prototype,'clientWidth',{get(){return 375}});
  Object.defineProperty(d.window.HTMLElement.prototype,'clientHeight',{get(){return 192}});
  return d;
};
const d1=boot(JSON.stringify(db2)); await new Promise(r=>setTimeout(r,60));
const once=d1.window.localStorage.getItem('math-fact-racer-v1'); d1.window.close();
const d2=boot(once); await new Promise(r=>setTimeout(r,60));
const twice=d2.window.localStorage.getItem('math-fact-racer-v1'); d2.window.close();
ok('druhe nacteni uz profil nemeni', once===twice,
   once===twice?'shodne':'lisi se o '+Math.abs(once.length-twice.length)+' znaku');
process.exit(0);
})();
