const fs=require('fs');const path=require('path');const ROOT=path.resolve(__dirname, '..');const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(ROOT, 'index.html'),'utf8');
// Okno jsdomu je 1024 x 768, tedy sirsi nez telefon, a od kroku C se
// podle nej rozhoduje rozvrzeni uz pri startu. Testuje se telefon na
// vysku, takze se sirka i vyska nastavi jeste pred spustenim skriptu;
// jedna kontrola nize se pak vedome prepne zpatky na 1024 x 768.
const phone=win=>{
  Object.defineProperty(win,'innerWidth',{value:375,configurable:true,writable:true});
  Object.defineProperty(win,'innerHeight',{value:812,configurable:true,writable:true});
};
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/',
  beforeParse:phone});
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
/* Garaz ma police pod zavodniky slozene a otevrena je vzdycky jedna,
   takze se do police musi nejdriv klepnout, nez se z ni da neco koupit.
   Presne to dela dite a presne to musi delat i test; kdyby se tady
   sahalo rovnou do SHELF, neoverilo by se, ze se police da otevrit
   klepnutim. */
const shelf=sec=>{
  const b=qa('.shelfhead').find(x=>x.dataset.sec===sec);
  if(!b) throw new Error('police '+sec+' v garazi neni');
  if(!q('#'+sec).classList.contains('open')) click(b);
  return q('#'+sec);
};

(async()=>{
/* Hlidac na cely beh. Kazda obrazovka prochazi render(), takze jedina
   kontrola, kterou nejde obejit, visi tam: po kazdem vykresleni
   obrazovky, ktera neni za rodicovskym kodem, tam nesmi byt poznamka
   o dobrovolnem prispevku. Prohlidka par obrazovek, na ktere test
   nahodou prijde, by minula tu, ktera pribude priste. */
ev('window.__seen=0;window.__leak=[];const __r=render;'
  +'render=function(){__r.apply(null,arguments);'
  +'if(PARENT_VIEWS.indexOf(view.name)<0){window.__seen++;'
  +'if(document.querySelector("#app .support")) window.__leak.push(view.name);}};');

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
// startovnich zavodniku je od kroku H1 sedm, ne sest: pribyla gumova
// kacenka a je zdarma, protoze se na ni pozdeji kupuji veci, ne ona sama.
// Cislo se posunulo vedome, viz tests/README.md
ok('profil dostal startovni sedmicku zdarma', DBg().profiles[0].owned.length===7, DBg().profiles[0].owned.join(','));
ok('kacenka je mezi startovnimi zdarma', DBg().profiles[0].owned.includes('du_kacka'));
// mapa treťáka zacina tam, kde je letos trida, ale ucivo, ktere se letos
// opakuje, zustava pred dvermi: treti rocnik zacina opakovanim nasobilky
// (kapitoly 2 a 3 sedmeho dilu), stovky (kapitola 1) a hodin (kapitola 4).
// V hlavnim bloku je tedy 19 trati: t1 az t5, d1, a100, clock, devet trati
// tretiho rocniku a k tomu sampionat se slabymi misty. Plus dilna a dvere
// zpatky je to 21 mist; cest je 19, dilna ani dvere nahled nemaji.
// Devet trati tretiho rocniku je od kroku E2: retezec, poradi operaci,
// za nasobilkou, kulata cisla, deleni se zbytkem, zaokrouhlovani, rozklad
// cisla, tisicovka a prevody. Cislo se posunulo vedome, viz tests/README.md.
const cesty=()=>new Set(qa('.thumb svg path').map(p=>p.getAttribute('d'))).size;
ok('slozena mapa treťáka ma 19 ruznych cest', cesty()===19, cesty()+' okruhu');
ok('slozena mapa ma 21 mist', qa('.world .place').length===21, qa('.world .place').length+' mist');
// tohle je ta regrese, kvuli ktere thru vzniklo: treťák si sedne k mape
// a rovnou ma na co klepnout, nemusi hledat dvere do minulych let
ok('mala nasobilka je treťákovi na mape a otevrena',
   qa('[data-act="play"]').some(b=>b.dataset.id==='t1') && /Rozjezd/.test(txt()));
// retezec je kapitola 11, tedy na ceste pred nasobenim mimo nasobilku
const mista=()=>qa('.world .place .nm').map(e=>e.textContent);
ok('retezec stoji na mape pred tratí za nasobilkou',
   mista().indexOf('Řetězec')>=0 && mista().indexOf('Řetězec')<mista().indexOf('Za násobilkou'),
   mista().join(', '));
// kapitola 13 lezi mezi kapitolou 11 a 14, takze i cesta jde takhle
ok('poradi operaci stoji mezi retezcem a tratí za nasobilkou',
   mista().indexOf('Co dřív')>mista().indexOf('Řetězec')
   && mista().indexOf('Co dřív')<mista().indexOf('Za násobilkou'),
   mista().join(', '));
// kapitola 28 prijde az po kapitole 14, takze kulata cisla lezi na ceste
// hned za tratí za nasobilkou; je to tentyz pocetni krok o stupen dal
ok('kulata cisla stoji hned za tratí za nasobilkou',
   mista().indexOf('Kulatá čísla')===mista().indexOf('Za násobilkou')+1,
   mista().join(', '));
// prevody se deji v oboru do tisice, takze na ceste stoji hned za nim
ok('prevody stoji hned za tisicovkou',
   mista().indexOf('Převody')===mista().indexOf('Do tisíce')+1,
   mista().join(', '));
ok('dvere do minulych let jsou od druhe tridy',
   qa('.place.backdoor[data-act="back"]').length===1 && /Z minulých let/.test(txt()));
ok('predel nese letosni rocnik', qa('.milestone').length===1 && /3\. třída/.test(q('.milestone').textContent),
   q('.milestone')?q('.milestone').textContent.trim():'zadny predel');
// za dvermi zustavaji obory prvniho rocniku a most, tedy to, k cemu se
// treti trida uz nevraci; "Do tri" je proto slozene, hodiny ne
// jmena hledej mezi misty, ne v celem textu: "Přes desítku" se objevuje
// i v zamku stovky ("Dojeď Přes desítku"), a to je zprava, ne misto
ok('minule roky jsou slozene, ne jen tmave',
   mista().indexOf('Do tří')<0 && mista().indexOf('Přes desítku')<0, mista().join(', '));
ok('trat hodin je v hlavnim bloku, uz ne za dvermi',
   /Hodiny/.test(txt()) && qa('[data-act="play"]').some(b=>b.dataset.id==='clock'));
const predRozbalenim=JSON.stringify(DBg());
click(q('[data-act="back"]'));
ok('rozbaleni ukazalo minule roky', cesty()===26, cesty()+' okruhu');
ok('za dvermi je sest oboru prvniho rocniku a most', qa('.place.past').length===7 && qa('.place.peek').length===0,
   qa('.place.past').length+' trati z minulych let');
ok('minule roky jsou plne, ne carkovane jako ukazka', /Do tří/.test(txt())
   && qa('.place.past').every(el=>el.tagName==='BUTTON'||el.classList.contains('locked')));
ok('o rozbaleni neni v ulozenych datech ani slovo', JSON.stringify(DBg())===predRozbalenim);
ok('predel je videt i s rozbalenou mapou', qa('.milestone').length===1);
// mapa uz neni svisly seznam: mista lezi podel cesty a zamcene je vidět taky
// rozbaleno je to porad 28 mist, jen jich vic patri do hlavniho bloku:
// 1 dvere + 7 minulych + 19 letosnich + dilna
ok('mista lezi podel cesty, ne pod sebou', qa('.world .place').length===28 && qa('.worldroad path').length>0,
   qa('.world .place').length+' mist');
ok('kazde misto ma svou polohu v mape', qa('.place').every(el=>/left:/.test(el.getAttribute('style')||'')));
ok('zamcena trat je videt, jen tmava', qa('.place.locked').length>0 && /Šestky a sedmičky/.test(txt()),
   qa('.place.locked').length+' zamcenych');
ok('zamcene misto neni tlacitko', qa('.place.locked').every(el=>el.tagName!=='BUTTON'));
ok('dilna je vlastni misto mimo rady trati', qa('.place.shopplace[data-act="shop"]').length===1);
// kolik ma mapa sloupcu, rika sama; na telefonu na vysku jsou to dva
ok('mapa rika, kolik ma sloupcu', q('.world').dataset.cols==='2', 'data-cols '+q('.world').dataset.cols);
ok('rozvrzeni je na html, ne v media query',
   d.documentElement.dataset.w==='phone' && d.documentElement.dataset.o==='tall',
   d.documentElement.dataset.w+' / '+d.documentElement.dataset.o);
ok('misto ukazuje, kolik uz je ve sbirce', /0\/4\b/.test(txt()));

console.log('--- zavod s chybami ---');
// naschval nasobilka, ne prvni misto v rade: souhrn nize se porovnava s ni
click(qa('[data-act="play"]').find(b=>b.dataset.id==='t1'));
// sedm startovnich zavodniku od kroku H1, do nej jich bylo sest
ok('vyber zavodnika pred zavodem', qa('[data-pick]').length===7, qa('[data-pick]').length+' zavodniku');
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
// sedm startovnich plus jeden koupeny je osm; do kroku H1 to bylo sedm
ok('nakup odecetl mince a nastavil jezdce', DBg().profiles[0].coins<coins && DBg().profiles[0].owned.length===8,
   coins+' -> '+DBg().profiles[0].coins);
// cely katalog zvirat je videt od prvni chvile i s cenami, tedy i to,
// na co dite teprve setri; krok H7 ho rozsiril z dvanacti na osmadvacet
// a je to potreti, co se tenhle pocet vedome posunul (H1 pridal kacenku,
// H2 vrstvy, tady zvirata). Nova zvirata se kupuji za mince a novemu
// profilu se zadne z nich nesmi objevit jako uz koupene.
click(q('[data-act="map"]')); click(q('[data-act="collection"]'));
const zvir=ev('PETS.length'), zamcena=qa('[data-act="buy"]').filter(b=>b.dataset.id.slice(0,4)==='pet_');
ok('garaz ukazuje vsech osmadvacet zvirat', zvir===28, zvir+' zvirat');
ok('nova zvirata jsou zamcena, ne darovana', zamcena.length===25
   && zamcena.every(b=>/\d/.test(b.textContent)), zamcena.length+' k odemceni');
// nakup za mince: mince se odectou a zvire pribude do owned
const zbozi=DBg(); zbozi.profiles[0].coins=60;
w.localStorage.setItem('math-fact-racer-v1', JSON.stringify(zbozi));
ev('load(); go("collection")');
click(qa('[data-act="buy"]').find(b=>b.dataset.id==='pet_kocka')); click(q('[data-yes]'));
ok('nove zvire se koupi za mince', DBg().profiles[0].owned.includes('pet_kocka')
   && DBg().profiles[0].coins===25, DBg().profiles[0].coins+' minci zbylo');
// kacenka ma v garazi vlastni sekci, je v ni odemcena a neda se koupit
click(q('[data-act="map"]')); click(q('[data-act="collection"]'));
ok('garaz ma sekci kacenky', !!d.getElementById('ducksec'));
ok('kacenka je v garazi odemcena', qa('[data-act="use"]').some(b=>b.dataset.id==='du_kacka'));
ok('kacenka se neda koupit za mince', !qa('[data-act="buy"]').some(b=>b.dataset.id==='du_kacka'));
// zviratko roste, kacenka ne: kdyby prosla jako zviratko, dostala by v
// dlazdici stupen, ke kteremu zadna druha kresba neexistuje
ok('kacenka nema stupen rustu',
   !qa('[data-act="use"]').find(b=>b.dataset.id==='du_kacka').querySelector('.lvl'));
click(qa('[data-act="use"]').find(b=>b.dataset.id==='du_kacka'));
ok('kacenka jde nasadit jako zavodnik', DBg().profiles[0].runner==='du_kacka');
// nabidka pred startem se jen radi, nikdy nefiltruje, takze v ni stoji
// vsech devet, kacenku nevyjimaje; sedm startovnich, stroj koupeny vys
// a kocka koupena za mince v kroku H7
click(q('[data-act="map"]')); click(q('[data-act="play"]'));
ok('nabidka pred startem ukazuje vsech devet vlastnenych', qa('[data-pick]').length===9,
   qa('[data-pick]').length+' zavodniku');
ok('kacenka je v nabidce pred startem', qa('[data-pick]').some(b=>b.dataset.pick==='du_kacka'));
click(qa('[data-pick]').find(b=>b.dataset.pick==='ri_auto'));
ok('zpet na auto', DBg().profiles[0].runner==='ri_auto');
// list se zavira klepnutim mimo nej; test ho odklidi rovnou, aby dalsi
// blok nehledal tlacitka pod nim
q('.sheet').remove();
click(q('[data-act="collection"]'));

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

console.log('--- dobrovolna podpora ---');
// Jeden blok, nahore, nad prvnim nadpisem sekce, a rekne vsechny tri
// veci z oddilu 13: hra je zdarma, na co se prispiva, a ze nepřispet
// nic nemeni. Text se bere ze slovniku, ne se opisuje sem, aby se
// kontrola nedala projit prepsanim zdejsi vety.
const SUP=JSON.parse(ev('JSON.stringify(I18N.cs)'));
ok('podpora je v rodicovske sekci prave jednou', qa('.scr .support').length===1,
   qa('.scr .support').length+' bloku');
ok('podpora stoji nad prvnim nadpisem sekce',
   !!(q('.support').compareDocumentPosition(q('.h2')) & 4));
const supTxt=()=>q('.support').textContent.replace(/\s+/g,' ').trim();
ok('rika, ze hra je a zustane zdarma', supTxt().indexOf(SUP.supportTitle)>=0);
ok('rika, na co se prispiva', supTxt().indexOf(SUP.supportWhat)>=0);
ok('rika, ze neprispet je v poradku a ve hre se to nepozna', supTxt().indexOf(SUP.supportFine)>=0);
ok('nic se neodemyka ani nepocita', qa('.support [data-act],.support .sw,.support progress').length===0);
const odkaz=()=>q('.support a.more');
ok('odkaz vede na ceskou sekci README a otevre se v nove zalozce',
   odkaz().getAttribute('href')==='https://github.com/daliborkania-info/math-fact-racer/blob/main/README.cs.md#podpora-projektu'
   && odkaz().getAttribute('target')==='_blank' && /noopener/.test(odkaz().getAttribute('rel')),
   odkaz().getAttribute('href'));
// jazyk rodicovske sekce rozhoduje o tom, na kterou verzi README se miri;
// nemecke README neexistuje, takze nemcina cte anglicke
click(qa('[data-act="parentlang"]').find(b=>b.dataset.lang==='de'));
ok('nemcina mluvi nemecky, ale ctenim miri na anglicke README',
   supTxt().indexOf(JSON.parse(ev('JSON.stringify(I18N.de)')).supportTitle)>=0
   && odkaz().getAttribute('href').indexOf('README.md#supporting-the-project')>0,
   odkaz().getAttribute('href'));
click(qa('[data-act="parentlang"]').find(b=>b.dataset.lang==='en'));
ok('anglictina miri na anglicke README',
   odkaz().getAttribute('href').indexOf('README.md#supporting-the-project')>0);
click(qa('[data-act="parentlang"]').find(b=>b.dataset.lang==='cs'));
ok('zpatky v cestine', DBg().lang==='cs' && odkaz().getAttribute('href').indexOf('README.cs.md')>0);

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
// krok E4 otevrel kapitoly 17 a 22, tedy porovnavani jednotek a cisel,
// takze zamcene zustavaji uz jen pisemne nasobeni a dve o zlomcich
ok('kapitoly bez generatoru jsou nevybratelne', zamcene().length===3, zamcene().length+' zamcenych z 33');
ok('scitani a odcitani vice cisel se da vybrat', !zamcene().includes(11));
// vyber z nabidky umime od kroku E3, tedy kapitola 6; je to jedina
// kapitola, ktera se odpovida tlacitky, a jinam nez do skolni trati se
// z ni nic nedostane
ok('jednociferna az trojciferna a sude a liche se daji vybrat', !zamcene().includes(6));
// deleni se zbytkem umime od kroku E1, tedy kapitola 27; zlomky porad ne
ok('deleni se zbytkem se da vybrat a zlomky zustaly zamcene',
   !zamcene().includes(27) && zamcene().includes(32));
// nasobeni a deleni mimo malou nasobilku uz umime, takze jeho tri kapitoly zamcene byt nesmi
ok('mimo rozsah male nasobilky se da vybrat',
   !zamcene().includes(14) && !zamcene().includes(16) && !zamcene().includes(31));
// zaokrouhlovani taky umime, tedy kapitoly 7 a 26
ok('zaokrouhlovani se da vybrat', !zamcene().includes(7) && !zamcene().includes(26));
// poradi operaci umime od kroku D1, takze jeho dve kapitoly uz zamcene nejsou
ok('poceti operace se zavorkami se daji vybrat', !zamcene().includes(13) && !zamcene().includes(30));
// nasobeni a deleni deseti a stem umime od kroku D2, tedy kapitola 28
ok('nasobeni a deleni 10 a 100 se da vybrat', !zamcene().includes(28));
// prevody jednotek umime od kroku D3: cas v kapitole 18, delka, hmotnost
// a objem v kapitole 29
ok('prevody jednotek se daji vybrat', !zamcene().includes(18) && !zamcene().includes(29));
// zkouska spravnosti od kroku D4: neni to novy generator, ale latka
// predchozich kapitol pozpatku, takze kapitola 5 uz zamcena neni
ok('zkouska spravnosti se da vybrat', !zamcene().includes(5));
// porovnavani umime od kroku E4: jednotky v kapitole 17, cisla do tisice
// v kapitole 22. Obe se odpovidaji znaky a dal nez do skolni trati se
// z nich nic nedostane
ok('porovnavani jednotek a cisel se da vybrat', !zamcene().includes(17) && !zamcene().includes(22));
ok('pisemne nasobeni a zlomky zamcene zustaly',
   zamcene().includes(15) && zamcene().includes(19) && zamcene().includes(32));
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
// zkouska spravnosti, kapitola 5: tataz latka pozpatku. Neni to vlastni
// trat ani vlastni klic, jede se pres skolni trat, a radek ma jiny tvar,
// tedy policko vpredu. Odpoved se bere z RUN, protoze "× 7 = 42" se ze
// zadani spocitat neda, o to prave jde.
click(q('[data-act="map"]'));
ev('(function(){const p=P();p.chapter=5;save();})()');
click(q('[data-act="play"][data-id="school"]')); click(q('[data-go]'));
const qbHTML=d.getElementById('qbox').innerHTML;
ok('u chybejiciho clenu stoji policko pred zadanim',
   qbHTML.indexOf('id="abox"')>=0 && qbHTML.indexOf('id="abox"')<qbHTML.indexOf('id="qtext"'));
ok('u chybejiciho clenu je receno, co se hleda', /Které číslo chybí/.test(d.getElementById('hint').textContent));
const mtabs=[];
while(inRace() && mtabs.length<40){ mtabs.push(qtext()); type(ev('RUN.items[RUN.idx].answer')); await wait(640); }
await wait(1500);
ok('zavod podle zkousky spravnosti probehl a cely byl pozpatku',
   mtabs.length===10 && mtabs.every(x=>/^[+\-×:] /.test(x)), mtabs.length+' otazek, napr. '+mtabs[0]);
ok('chybejici clen se zapsal pod puvodni klic, ne pod novy',
   Object.keys(DBg().profiles[0].facts).every(k=>/^[mdpn]/.test(k)),
   Object.keys(DBg().profiles[0].facts).join(' '));
ev('(function(){const p=P();p.chapter=2;save();})()');
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
// tretak vidi zakazky vsech tri rocniku: pocitani dilku je prvnackovo,
// penize druhackovy a slovni ulohy jeho vlastni. Krok F to posunul ze
// dvou na tri.
ok('dilna nabizi zakazky vsech rocniku az po ten jeho', qa('[data-act="jobstart"]').length===3
   && /Peníze/.test(txt()) && /Počítání dílků/.test(txt()) && /Slovní úlohy/.test(txt()),
   qa('[data-act="jobstart"]').length+' zakazek');
const partsBefore=DBg().profiles[0].parts;
click(qa('[data-act="jobstart"]').find(b=>b.dataset.id==='money'));
ok('zakazka ma sest uloh', qa('.pip').length===6, qa('.pip').length+' uloh');
// obrazovka dilny je sloupec, takze rostouci rada tecek by spolkla celou
// vysku a nad mincemi by zustal prazdny pas
ok('tecky v dilne nerostou do vysky',
   ev('getComputedStyle(document.querySelector(".pips")).flexGrow')==='0',
   'flex-grow '+ev('getComputedStyle(document.querySelector(".pips")).flexGrow'));
ok('otazka a pult jsou nad mincemi videt',
   q('#jobask').textContent.length>5 && q('#counter')!==null, q('#jobask').textContent);
ok('v dilne nejsou stopky ani body', !/bodů|body/.test(txt()) && qa('.rail,.stage').length===0);
// obal tlacitka Hotovo se musi dat adresovat, jinak ho rozvrzeni na sirku
// nema kam postavit
ok('tlacitko Hotovo ma svuj obal', q('.jobgo #jobok')!==null);
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

// utrata soucastek ma skocit tam, kde si dite opravdu muze neco koupit.
// Nejlevnejsi nater stoji 30 soucastek, nejlevnejsi kacenci dil 6, takze
// dite po prvni zakazce patri do kacenci sekce, ne k naterum, na ktere
// jeste dlouho mit nebude
click(q('[data-act="spendparts"]'));
const kamUtrata=ev('view.focus'), soucastekPoZakazce=DBg().profiles[0].parts;
ok('utrata soucastek otevre garaz u sekce, na kterou dite ma',
   ev('view.name')==='collection' && kamUtrata===ev('spendTarget(P())') && q('#'+kamUtrata)!==null,
   ev('view.name')+' / '+kamUtrata+' | soucastek '+soucastekPoZakazce);
// a police, na kterou utrata posila, musi byt opravdu otevrena: dorazit
// z dilny na zavrenou cedulku je totez jako dojit ke dverim, ktere jsou
// zamcene
ok('utrata soucastek tu polici rovnou otevre',
   q('#'+kamUtrata).classList.contains('open') && q('#'+kamUtrata+' .grid')!==null,
   q('#'+kamUtrata).className);
ok('s par soucastkami neposila utrata dite na natery za tricet',
   kamUtrata!=='paintsec' && soucastekPoZakazce<30, kamUtrata+' se '+soucastekPoZakazce+' soucastkami');
ok('vyber stroje uz zpatky k naterum neskace',
   (click(qa('[data-act="use"]')[0]), ev('view.focus')===undefined));

console.log('--- slovni ulohy v dilne ---');
// Zakazka, ktera se odpovida psanim. Klavesnice je ze zavodu prevzata
// jako kresba, nikdy jako obsluha: tap() patri zavodu i s merenim casu
// a body za rychlost, takze se tady hlida, ze se zavodni stav ani
// nezalozi a ze prumerny cas zustane presne tam, kde byl.
/* Do dilny se schvalne prichazi se zavodem, ktery ceka na odpoved:
   tlacitko ven ze zavodu RUN nemaze, takze presne takhle vypada stav,
   kdyz dite odejde uprostred otazky. Do teto opravy se otisk bral az po
   dojetem zavodu, tedy ve stavu "feedback", ve kterem tap() vypadne na
   prvnim radku, at se vola odkud chce; kontrola pak nemohla spadnout,
   ani kdyby klavesy dilny opravdu pres tap() sly. Overeno mutaci. */
ev('go("map")');
click(qa('[data-act="play"]').find(b=>b.dataset.id==='t1')); click(q('[data-go]'));
click(q('[data-act="quit"]')); click(q('[data-yes]'));
ok('do dilny se prichazi se zavodem, ktery ceka na odpoved',
   ev('RUN && RUN.state')==='ask' && ev('RUN.typed')==='',
   'stav '+ev('RUN && RUN.state')+', napsano "'+ev('RUN && RUN.typed')+'"');
ev('go("shop")');
const msPred=DBg().profiles[0].msN, castiPred=DBg().profiles[0].parts;
click(qa('[data-act="jobstart"]').find(b=>b.dataset.id==='words'));
ok('slovni uloha je zadani slovy, ne rovnice',
   q('#jobask').textContent.length>40 && /\?/.test(q('#jobask').textContent),
   q('#jobask').textContent);
ok('odpovida se na klavesnici uvnitr dilny, mince nikde',
   qa('.tray.pad [data-k]').length===12 && qa('[data-coin]').length===0,
   qa('.tray.pad [data-k]').length+' klaves');
ok('ani u psane odpovedi nejsou v dilne stopky ani body',
   qa('.rail,.stage,.hud').length===0 && !/bodů|body/.test(txt()));
const wans=()=>ev('JOB.items[JOB.idx].answer');
const wkey=k=>click(qa('.tray.pad [data-k]').find(b=>b.dataset.k===k));
const wtype=s=>String(s).split('').forEach(wkey);
const wkeyb=k=>d.dispatchEvent(new w.KeyboardEvent('keydown',{key:k,bubbles:true}));
// otisk zavodu tesne pred psanim: kdyby klavesy sly pres tap(), zmenil
// by se, a s nim by v dilne zacaly bezet stopky posledniho zavodu
const otisk=()=>ev('RUN ? [RUN.idx,RUN.typed,RUN.coins,RUN.state,RUN.t0].join("|") : "null"');
const zavodPred=otisk();
wtype(wans());
ok('klavesa v dilne se zavodnim stavem nehne', otisk()===zavodPred, zavodPred+' -> '+otisk());
ok('napsane cislo je videt na pultu', q('#counter').textContent.indexOf(String(wans()))>=0,
   q('#counter').textContent);
const predGumou=ev('JOB.typed');
wkey('del');
ok('guma bere po jedne cislici', ev('JOB.typed')===predGumou.slice(0,-1), ev('JOB.typed'));
wtype(predGumou.slice(-1));
// fajfka na klavesnici musi odevzdat tady, ne v zavode
wkey('ok');
ok('fajfka na klavesnici odevzda ulohu dilny', ev('JOB.state')==='done-step' && ev('JOB.ok')===1);
const wkryto=()=>qa('#reveal path').filter(x=>x.getAttribute('fill')==='#f2e3ca').length;
ok('kruh se odkryva i u psane odpovedi', wkryto()===5, wkryto()+' zakrytych');
click(q('[data-act="jobcheck"]'));
/* Klavesnice pod prsty, ne jen nakreslena. V zavode se odpoved napsat
   da, takze v dilne taky: jinak by dite u notebooku melo pult a nemelo
   cim psat, presne na obrazovce, ktera tech dvanact klaves kresli. Jde
   tudy obsluha dilny, ne zavodni tap(), takze se otisk zavodu nesmi
   hnout ani tady. */
const wOdp=String(wans());
wOdp.split('').forEach(wkeyb);
ok('fyzicka klavesnice pise i v dilne', ev('JOB.typed')===wOdp, ev('JOB.typed')+' vs '+wOdp);
wkeyb('Backspace');
ok('guma na klavesnici bere v dilne taky', ev('JOB.typed')===wOdp.slice(0,-1), ev('JOB.typed'));
wkeyb(wOdp.slice(-1));
wkeyb('Enter');
ok('enter na klavesnici odevzda ulohu dilny',
   ev('JOB.state')==='done-step' && ev('JOB.ok')===2, 'stav '+ev('JOB.state')+', hotovo '+ev('JOB.ok'));
ok('psani na klavesnici v dilne zavodnim stavem nehne', otisk()===zavodPred, otisk());
click(q('[data-act="jobcheck"]'));
let wn=0;
while(ev('view.name')==='job' && wn<20){
  while(ev('JOB.typed').length) wkey('del');
  wtype(wans());
  click(q('[data-act="jobcheck"]'));
  if(ev('view.name')==='job') click(q('[data-act="jobcheck"]'));
  wn++;
}
ok('zakazka se slovnimi ulohami dosla do konce', ev('view.name')==='jobdone',
   'obrazovka '+ev('view.name'));
ok('slovni uloha se zapsala do krabicky', !!DBg().profiles[0].facts.ww1);
ok('psana odpoved v dilne nezmerila zadny cas', DBg().profiles[0].msN===msPred,
   msPred+' -> '+DBg().profiles[0].msN);
ok('za slovni ulohy pribyly soucastky', DBg().profiles[0].parts>castiPred,
   castiPred+' -> '+DBg().profiles[0].parts);
ev('go("map")');

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
// tri kroky na zakazku a tretak ma tri zakazky; krok F to posunul ze
// sesti na devet
ok('sbirka dilny neni velka podle trati, ale podle kroku zakazek',
   ev('shopSpec(P()).keys.length')===9, ev('shopSpec(P()).keys.length')+' mist');
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
// sedm startovnich vcetne kacenky plus dva koupene, stroj a kocka;
// do kroku H1 sedm, do H7 osm
ok('vsichni koupeni zavodnici jsou porad k vyberu', qa('[data-pick]').length===9,
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
// slozena police o sobe rekne, co v ni je, kolik toho je a od kolika,
// takze dite nema duvod ji otevirat naslepo a katalog nezmizel
ok('slozena police natery ohlasi i s cenou',
   /Nátěry/.test(txt()) && qa('[data-act="buypaint"]').length===0
   && /8 nátěrů/.test(txt()) && /od 30/.test(txt()), txt().match(/Nátěry[^N]{0,40}/));
shelf('paintsec');
ok('natery jsou v garazi', /Nátěry/.test(txt()) && qa('[data-act="buypaint"]').length===8);
click(qa('[data-act="buypaint"]')[0]);
click(q('[data-yes]'));
ok('nater koupen a nasazen', DBg().profiles[0].paints.length===1 &&
   Object.keys(DBg().profiles[0].paint).length===1, JSON.stringify(DBg().profiles[0].paint));
ok('nater stal soucastky, ne mince', DBg().profiles[0].parts===170, DBg().profiles[0].parts+' soucastek');
// po nakupu se dite nesmi divat na slozeny seznam: police, ze ktere si
// prave koupilo, zustava otevrena a koupeny kus je v ni videt vybrany
ok('po nakupu je police porad otevrena a koupene je videt',
   q('#paintsec').classList.contains('open')
   && q('#paintsec .item.sel')!==null
   && q('#paintsec .item.sel').dataset.id===DBg().profiles[0].paints[0],
   q('#paintsec .item.sel') ? q('#paintsec .item.sel').dataset.id : 'nic vybraneho');
click(qa('[data-act="usepaint"]')[0]);
ok('nater jde zase sundat', Object.keys(DBg().profiles[0].paint).length===0);

console.log('--- kacenciny barvy ---');
// dily kacenky se kupuji za tutez menu jako natery, tedy za soucastky
// z dilny, nikdy za mince; mincim se po nakupu nesmi stat vubec nic
const minciPred=DBg().profiles[0].coins, soucastekPred=DBg().profiles[0].parts;
// pet vrstev pod natery: deset barev, deset vzoru, dvacet dilu na
// hlavu, devet na oci a sestnact kusu vybavy. Cisla se posunula krokem
// H4 vedome: k 39 placenym dilum z H2 a H3 pribylo 25, tedy 64
// k odemceni, a k jedinemu dilu zdarma (klasicka zluta) pribyly ctyri
// prazdne dlazdice, tedy pet dlazdic, na ktere se klepne bez placeni
// Vrstvy jsou od rozhodnuti R11 police, ktere se sklada a rozbaluje;
// pocty dilu se tim nezmenily, jen se k nim dochazi po jedne polici.
const SEC={body:'duckbodysec',pat:'duckpatsec',head:'duckheadsec',eye:'duckeyesec',gear:'duckgearsec'};
const vrstvy=Object.keys(SEC).map(l=>SEC[l]);
let kOdemceni=0, bezPlaceni=0, prazdnych=0;
for(const s of vrstvy){
  shelf(s);
  kOdemceni+=qa('#'+s+' [data-act="buyduck"]').length;
  bezPlaceni+=qa('#'+s+' [data-act="useduck"]').length;
  prazdnych+=qa('#'+s+' [data-act="useduck"]').filter(b=>b.dataset.id==='').length;
}
ok('vrstvy kacenky jsou v garazi pod natery', vrstvy.every(s=>!!d.getElementById(s))
   && kOdemceni===64, kOdemceni+' k odemceni');
// klasicka zluta je zdarma, takze se nekupuje, jen vybira, a vrstvy,
// ktere jdou sundat, maji prazdnou dlazdici
shelf(SEC.body);
ok('telo zdarma a ctyri prazdne dlazdice se nekupuji', bezPlaceni===5
   && qa('#'+SEC.body+' [data-act="useduck"]')[0].dataset.id==='db_klasik'
   && prazdnych===4, bezPlaceni+' dlazdic bez placeni, z toho '+prazdnych+' prazdnych');
const telo=qa('[data-act="buyduck"]')[0].dataset.id;
const cenaTela=ev('duckPartById("'+telo+'").cost');
click(qa('[data-act="buyduck"]')[0]); click(q('[data-yes]'));
// tataz kontrola jako u nateru, tentokrat na dilu kacenky: po nakupu
// zustava police otevrena a koupeny dil je v ni videt
ok('po nakupu dilu je police porad otevrena a dil je videt',
   q('#'+SEC.body).classList.contains('open')
   && q('#'+SEC.body+' .item.sel').dataset.id===telo,
   q('#'+SEC.body+' .item.sel') ? q('#'+SEC.body+' .item.sel').dataset.id : 'nic vybraneho');
ok('barva koupena a kacenka ji ma na sobe', DBg().profiles[0].duckParts.includes(telo)
   && DBg().profiles[0].duck.body===telo, JSON.stringify(DBg().profiles[0].duck));
ok('barva stala soucastky, ne mince', DBg().profiles[0].coins===minciPred
   && DBg().profiles[0].parts===soucastekPred-cenaTela,
   DBg().profiles[0].parts+' soucastek, '+DBg().profiles[0].coins+' minci');
// koupeny dil se neztrati tim, ze si dite vybere jiny, presne jako nater
click(qa('[data-act="useduck"]').find(b=>b.dataset.id==='db_klasik'));
ok('vyber klasicke barvy koupenou neztratil', DBg().profiles[0].duckParts.includes(telo)
   && DBg().profiles[0].duck.body==='db_klasik', JSON.stringify(DBg().profiles[0].duckParts));
ok('koupena barva uz se znovu neprodava',
   !qa('[data-act="buyduck"]').some(b=>b.dataset.id===telo)
   && qa('[data-act="useduck"]').some(b=>b.dataset.id===telo));
// vrstvy se skladaji: vzor, klobouk, bryle i vybava se daji koupit
// a nosit zaroven s barvou, a sundani jedne nesahne na zbytek ani na
// koupene dily
const koupVrstvu=layer=>{
  shelf(SEC[layer]);
  const id=qa('[data-act="buyduck"]').find(b=>b.dataset.layer===layer).dataset.id;
  click(qa('[data-act="buyduck"]').find(b=>b.dataset.id===id)); click(q('[data-yes]'));
  return id;
};
const vzor=koupVrstvu('pat'), klobouk=koupVrstvu('head');
const bryle=koupVrstvu('eye'), vybava=koupVrstvu('gear');
ok('kacenka ma na sobe vsech pet vrstev najednou',
   DBg().profiles[0].duck.body==='db_klasik' && DBg().profiles[0].duck.pat===vzor
   && DBg().profiles[0].duck.head===klobouk && DBg().profiles[0].duck.eye===bryle
   && DBg().profiles[0].duck.gear===vybava, JSON.stringify(DBg().profiles[0].duck));
// prazdna dlazdice vrstvu sundá, ale koupeny dil zustava koupeny
shelf(SEC.head);
click(qa('[data-act="useduck"]').find(b=>b.dataset.id===''&&b.dataset.layer==='head'));
ok('klobouk jde sundat a zustane koupeny', DBg().profiles[0].duck.head===undefined
   && DBg().profiles[0].duckParts.includes(klobouk)
   && DBg().profiles[0].duck.pat===vzor && DBg().profiles[0].duck.eye===bryle,
   JSON.stringify(DBg().profiles[0].duck));
// a na co dite nema, to se nekoupi; soucastky zustanou, kde byly
const chudy=DBg(); chudy.profiles[0].parts=1;
w.localStorage.setItem('math-fact-racer-v1', JSON.stringify(chudy));
jev('load(); go("collection")');
shelf(SEC.body);
click(qa('[data-act="buyduck"]')[0]);
ok('bez soucastek se dil nekoupi', DBg().profiles[0].parts===1
   && DBg().profiles[0].duckParts.length===5, DBg().profiles[0].parts+' soucastek');
q('.sheet').remove();

console.log('--- police v garazi a kolik uzlu delaji ---');
/* Rozhodnuti R11. Garaz kreslila 115 dlazdic naraz a kazda z nich je
   cela kresba, takze pocet dlazdic je rovnou pocet uzlu. Police pod
   zavodniky se proto skladaji, otevrena je vzdycky jedna, a dlazdice
   otevrene police dostane kresbu, teprve az se priblizi k zornemu poli.
   Meri se obojí, protoze prave pocet uzlu je to, kvuli cemu R11 vzniklo.

   Zorne pole jsdom nezna a IntersectionObserver v nem neni vubec, takze
   se bez nej kresli vsechno hned; to je zaloha pro stary telefon a plati
   pro zbytek tohohle souboru. Aby se dalo zmerit, kolik uzlu garaz
   opravdu postavi, dostane okno na tenhle jeden blok pozorovatele, ktery
   si dlazdice zapamatuje a sam nikdy nic neohlasi, tedy prohlizec, ve
   kterem se jeste nikam neposunulo. */
ev('window.__eyes=[];window.IntersectionObserver=function(cb){var me=this;me.cb=cb;me.seen=[];'
  +'me.observe=function(el){me.seen.push(el)};me.unobserve=function(){};me.disconnect=function(){};'
  +'window.__eyes.push(me)};');
click(q('[data-act="map"]')); click(q('[data-act="players"]'));
click(qa('[data-act="pick"]')[0]);
click(q('[data-act="collection"]'));
const uzly=()=>d.getElementById('app').querySelectorAll('*').length;
ok('prepnuti hrace police slozilo a garaz se otevira slozena',
   qa('.shelf').length===6 && qa('.shelf.open').length===0 && qa('.shelf .grid').length===0,
   qa('.shelf.open').length+' otevrenych z '+qa('.shelf').length);
// slozena police neni prazdne misto: rekne, co v ni je, kolik toho je,
// kolik uz toho dite ma a od kolika, takze katalog s cenami nezmizel
ok('slozena police rekne, co v ni je, kolik a od kolika',
   qa('.shelfsub').length===6
   && qa('.shelfsub').every(e=>/\d+ (dílů|nátěrů)/.test(e.textContent))
   && qa('.shelfsub').every(e=>/už máš/.test(e.textContent))
   && qa('.shelfsub').filter(e=>/od \d+/.test(e.textContent)).length===6,
   qa('.shelfsub')[0].textContent+' | '+qa('.shelfsub')[1].textContent);
// a police, ze ktere ma dite neco na sobe, to na sobe rekne, takze
// slozena nikdy necte jako prazdna
ok('slozena police rekne i to, co ma dite z ni na sobe',
   qa('.shelfworn').length>0 && qa('.shelfworn').every(e=>/vybráno: \S/.test(e.textContent)),
   qa('.shelfworn').map(e=>e.textContent).join(' | '));
const slozeno=uzly();
ok('slozena garaz kresli jen zavodniky', qa('.item').length===37, qa('.item').length+' dlazdic');
// slozeni je zpusob koukani, ne postup: nesmi se dostat do profilu
const predOtevrenim=w.localStorage.getItem('math-fact-racer-v1');
click(qa('.shelfhead').find(b=>b.dataset.sec==='duckheadsec'));
ok('police se otevre jednim klepnutim',
   qa('.shelf.open').length===1 && q('#duckheadsec').classList.contains('open')
   && qa('#duckheadsec .item').length===21, qa('#duckheadsec .item').length+' dlazdic na hlavu');
ok('otevreni police nic neulozilo',
   w.localStorage.getItem('math-fact-racer-v1')===predOtevrenim
   && !/shelf|paintsec|duckheadsec/i.test(JSON.stringify(DBg())));
const otevreno=uzly();
click(qa('.shelfhead').find(b=>b.dataset.sec==='duckgearsec'));
ok('otevrena je vzdycky jedna', qa('.shelf.open').length===1
   && q('#duckgearsec').classList.contains('open')
   && !q('#duckheadsec').classList.contains('open'));
click(qa('.shelfhead').find(b=>b.dataset.sec==='duckgearsec'));
ok('druhe klepnuti polici zase slozi', qa('.shelf.open').length===0);
// line kresleni: dlazdice, na kterou dite nevidi, je zatim jen tlacitko
click(qa('.shelfhead').find(b=>b.dataset.sec==='duckheadsec'));
const hned=qa('#duckheadsec .pic svg').length, ceka=qa('#duckheadsec .pic[data-draw]').length;
ok('kresli se jen to, na co je videt, zbytek ceka na priblizeni',
   hned===8 && ceka===13 && hned+ceka===21, hned+' nakreslenych, '+ceka+' cekajicich');
const oko=ev('window.__eyes[window.__eyes.length-1]');
ok('cekajici dlazdice jsou opravdu hlidane', oko.seen.length===ceka, oko.seen.length+' hlidanych');
ok('cekajici dlazdice ma porad cenu a da se klepnout',
   qa('#duckheadsec .pic[data-draw]').every(e=>/\d/.test(e.parentNode.textContent)
      && e.parentNode.dataset.act==='buyduck'));
ev('(function(){var o=window.__eyes[window.__eyes.length-1];'
  +'o.cb(o.seen.map(function(el){return {target:el,isIntersecting:true}}));})()');
ok('po priblizeni se dlazdice dokresli a uz neceka',
   qa('#duckheadsec .pic[data-draw]').length===0 && qa('#duckheadsec .pic svg').length===21,
   qa('#duckheadsec .pic svg').length+' kreseb');
/* Strop poctu uzlu, a je to cele meritko rozhodnuti R11. Pred nim mela
   garaz 2368 uzlu a 115 celych kreseb naraz. Dneska ma slozena 962 az
   1009 podle toho, jak je kacenka oblecena, a s nejvetsi otevrenou
   polici nejvys 1489. Padesat vlajek, ktere prijdou jako vzor na
   kacenku, udela z police vzoru jednasedesat dlazdic a garaz s ni
   otevrenou vyjde na 1537 uzlu, tedy porad hluboko pod stavem pred R11.
   Strop 1800 ma na tech padesat vlajek rezervu zhruba sedmdesati
   dalsich dlazdic a spadne, az garaz povyroste o dalsi takovy kus, nebo
   az nekdo skladani ci line kresleni zase vypne: bez nich vyjde garaz
   s vlajkami na 3713 uzlu. */
const STROP=1800;
ok('slozena garaz drzi pod stropem uzlu', slozeno<=STROP, slozeno+' uzlu, strop '+STROP);
ok('i s nejvetsi otevrenou polici drzi pod stropem uzlu',
   otevreno<=STROP, otevreno+' uzlu, strop '+STROP);
// a zbytek souboru at zase vidi cely katalog, jako ho vidi stary telefon
ev('delete window.IntersectionObserver; render()');

console.log('--- kam soucastky jdou ---');
// Otevrena otazka kroku 3b: stitek u soucastek se ma prestat tvarit jako
// penezenka teprve tehdy, kdyz uz neni co kupovat. Od kroku H nestaci
// natery, protoze kacenka ma dalsich 65 dilu, takze podminka je
// "vsechny natery A vsechny dily" a ani jedna polovina sama nestaci.
const zaloha=w.localStorage.getItem('math-fact-racer-v1');
const vsechnyNatery=JSON.parse(ev('JSON.stringify(PAINTS.map(x=>x.id))'));
const vsechnyDily=JSON.parse(ev('JSON.stringify(DUCK_PARTS.map(x=>x.id))'));
const stav=(nat,dily,soucastky)=>{
  const s=JSON.parse(zaloha);
  s.profiles[0].paints=nat?vsechnyNatery.slice():[];
  s.profiles[0].duckParts=dily?vsechnyDily.slice():[];
  s.profiles[0].parts=soucastky===undefined?50:soucastky;
  w.localStorage.setItem('math-fact-racer-v1', JSON.stringify(s));
  ev('load()');
  return {prazdno:ev('shelvesEmpty(P())'),
          police:JSON.parse(ev('JSON.stringify(partsShelves(P()))')),
          cil:ev('spendTarget(P())')};
};
const nic=stav(false,false), jenNatery=stav(true,false);
const jenDily=stav(false,true), vsechno=stav(true,true);
// police jsou razene od nejlevnejsiho zbyvajiciho dilu, ne podle toho,
// jak je garaz ukazuje: nejlevnejsi kacenci dil stoji 6 soucastek,
// nejlevnejsi nater 30, takze utrata miri nejdriv ke kacence
ok('police jsou razene od nejlevnejsiho a natery za tricet jsou az posledni',
   nic.police[0]!=='paintsec' && nic.police[nic.police.length-1]==='paintsec'
   && nic.cil===nic.police[0] && !nic.prazdno, nic.police.join(','));
ok('po poslednim nateru zustanou kacenci sekce',
   jenNatery.police[0]!=='paintsec' && jenNatery.police.indexOf('paintsec')<0
   && !jenNatery.prazdno, jenNatery.police.join(','));
ok('samotne natery stitek neprepnou', !jenNatery.prazdno);
ok('samotne dily kacenky stitek neprepnou taky',
   !jenDily.prazdno && jenDily.police.join(',')==='paintsec' && jenDily.cil==='paintsec',
   jenDily.police.join(','));
ok('stitek se prepne az pri naterech i vsech dilech',
   vsechno.prazdno && vsechno.police.length===0 && vsechno.cil===null, vsechno.police.join(','));
// dite se sesti az devetadvaceti soucastkami ma na kacenci dil, ale na
// zadny nater, takze ho utrata nesmi poslat mezi ceny, na ktere nema
const malo=stav(false,false,9);
ok('s devíti soucastkami miri utrata na dil, ktery si dite koupi',
   malo.cil && malo.cil!=='paintsec', malo.cil);
// a kdyz nema nikde na nic, neni co nabizet: zadne falesne tlacitko
// a zadna sekce plna cen, na ktere dite nedosahne
const nula=stav(false,false,3);
ok('bez soucastek na cokoli se utrata nenabizi, ale police zustavaji plne',
   nula.cil===null && !nula.prazdno && nula.police.length===6, nula.police.length+' polic');
ev('go("jobdone")');
ok('na vysledku zakazky pak tlacitko utraty neni, cislo ale zustava penezenkou',
   q('[data-act="spendparts"]')===null && /celkem/.test(txt()), txt().slice(0,90));
// a to same, jak to uvidi dite: dilna rika, na co soucastky jsou, a kdyz
// uz neni na co, rekne misto toho, kolik prace je hotove
stav(false,false); ev('go("shop")');
const dilnaDrive=txt();
stav(true,true); ev('go("shop")');
const dilnaPotom=txt();
ok('dilna rika, ze soucastky jdou na natery i na kacenku',
   /nátěry/.test(dilnaDrive) && /kačenka/.test(dilnaDrive), dilnaDrive.slice(-120));
ok('kdyz uz neni co kupovat, mluvi dilna o hotove praci',
   /kolik práce/.test(dilnaPotom) && !/kupují/.test(dilnaPotom), dilnaPotom.slice(-120));
// vysledek zakazky: stitek pod celkovym cislem a nabidka jit utracet
stav(false,false); ev('go("jobdone")');
ok('dokud je co kupovat, je cislo penezenka a da se jit utracet',
   q('[data-act="spendparts"]')!==null && /celkem/.test(txt()), txt().slice(0,90));
stav(true,true); ev('go("jobdone")');
ok('kdyz uz neni co kupovat, rika cislo hotovou praci a utrata se nenabizi',
   q('[data-act="spendparts"]')===null && /hotová práce/.test(txt()) && !/celkem/.test(txt()),
   txt().slice(0,90));
// prepnuty stitek je zmena textu, nic jineho: v dilne se ani ted nikde
// nemeri cas a nic za rychlost nepribylo
ok('prepnuty stitek nepridal do dilny stopky ani body za rychlost',
   (ev('go("shop")'), qa('.rail,.stage').length===0
    && /Nikdo tu neměří čas a za rychlost nejsou body/.test(txt())), txt().slice(0,90));
w.localStorage.setItem('math-fact-racer-v1', zaloha);
ev('load(); go("collection")');

console.log('--- rocnik a ukazka dalsiho roku ---');
click(q('[data-act="map"]')); click(q('[data-act="players"]'));
click(q('[data-act="newplayer"]')); d.querySelector('#nm').value='Prvňák';
click(qa('[data-gr]').find(b=>b.dataset.gr==='1')); click(q('[data-go]'));
const prvni=()=>DBg().profiles.find(x=>x.name==='Prvňák');
// pismo roste s tim, jak male je dite: obrazovka rekne jen rocnik,
// meritko --tx uz je v CSS
ok('prvnak dostal nejvetsi pismo', d.documentElement.dataset.grade==='1',
   'data-grade '+d.documentElement.dataset.grade);
ok('prvnak ma na mape jen ucivo sveho rocniku',
   /Do dvaceti/.test(txt()) && !/Rozjezd|Hodiny|Do tisíce/.test(txt()), txt().slice(0,90));
const mistPrvnak=qa('.place:not(.peekdoor)').length;
ok('mapa prvnaka je kratka', mistPrvnak===8, mistPrvnak+' mist vcetne dilny');
// prvnak nema co slozit, takze zadne dvere zpatky ani predel nedostane
ok('prvnak nema dvere do minulych let', qa('.place.backdoor').length===0 && qa('.milestone').length===0);
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
// dilna prvnaka: mince do padesati nedava smysl, pocitani dilku ano
click(q('[data-act="shop"]'));
ok('prvnak ma v dilne jen svou zakazku',
   qa('[data-act="jobstart"]').length===1 && /Počítání dílků/.test(txt()) && !/Peníze/.test(txt()),
   qa('[data-act="jobstart"]').length+' zakazek');
click(q('[data-act="jobstart"]'));
ok('pocita se to skladanim dilku, ne psanim', qa('[data-coin]').length===1 && q('.parts')!==null);
const dilku=()=>ev('JOB.items[JOB.idx].answer');
ok('na obrazku je tolik dilku, kolik ma byt odpoved',
   ev('(JOB.items[JOB.idx].pic.match(/<g transform="translate/g)||[]).length')===dilku(),
   dilku()+' dilku');
// naschval dve ruzne chyby ve dvou ulohach tehoz druhu: uloha s dilky nema
// castku, takze je od sebe musi odlisit odpoved, jinak splynou v jeden stitek
const chyby=[];
let kn=0;
while(ev('view.name')==='job' && kn<20){
  while(qa('#counter [data-drop]').length) click(q('#counter [data-drop]'));
  const dl=dilku(), klic=ev('JOB.items[JOB.idx].key'), opak=ev('!!JOB.items[JOB.idx].retry');
  const chybne = !opak && (chyby.length===0 || (chyby.length===1 && chyby[0].k===klic && chyby[0].d!==dl));
  if(chybne) chyby.push({k:klic,d:dl});
  const polozit = chybne ? (dl>1 ? dl-1 : dl+1) : dl;
  for(let i=0;i<polozit;i++) click(q('[data-coin]'));
  click(q('[data-act="jobcheck"]'));
  if(ev('view.name')==='job') click(q('[data-act="jobcheck"]'));
  kn++;
}
ok('zakazka s pocitanim dosla do konce', ev('view.name')==='jobdone', 'obrazovka '+ev('view.name'));
if(chyby.length===2) ok('dve ruzne chyby v pocitani daly dva stitky', qa('.factchips .factchip').length===2,
   qa('.factchips .factchip').length+' stitku pro '+chyby.map(x=>x.d).join(' a '));
else console.log('  --  v tomhle behu nevysly dve ruzne chyby, stitky neovereny');
ok('pocitani se zapsalo do krabicky', !!prvni().facts.wc1);
ok('prvnak dostal soucastky', prvni().parts>0, prvni().parts+' soucastek');
ok('sbirka dilny prvnaka je jen za jeho zakazku', ev('shopSpec(P()).keys.length')===3,
   ev('shopSpec(P()).keys.length')+' mist');
click(q('[data-act="shop"]')); click(q('[data-act="map"]'));

// rodic rocnik prepnout smi
click(q('[data-act="gate"]'));
d.getElementById('gatein').value='5678'; click(q('[data-act="gatego"]'));
ok('rodic ma prepinac rocniku', qa('[data-act="gradeset"]').length===4 && /Ročník/.test(txt()));
ok('rodicovska sekce pismo nezvetsuje', d.documentElement.dataset.grade==='',
   'data-grade "'+d.documentElement.dataset.grade+'"');
click(qa('[data-act="gradeset"]').find(b=>b.dataset.gr==='2'));
ok('rocnik prepnut', prvni().grade===2);
click(q('[data-act="map"]'));
// druhak opakuje cely prvni rocnik (kapitola 1 ctvrteho dilu), takze nema
// za dvere co slozit: 17 trati a dilna v jednom bloku. Zadne dvere zpatky
// ani predel, a to je spravne, cela jeho mapa je letosni. Deleni se
// zbytkem je treti rocnik, takze druhaka se nedotklo.
ok('mapa druhaka je jeden blok', qa('.place:not(.peekdoor)').length===18
   && /Rozjezd/.test(txt()) && /Do tří/.test(txt()), qa('.place:not(.peekdoor)').length+' mist');
ok('druhak nema dvere do minulych let ani predel',
   qa('.place.backdoor').length===0 && qa('.milestone').length===0);
ok('druhak vidi ukazku treti tridy', /Do tisíce/.test((click(q('[data-act="peek"]')), txt())));
// dvere jsou az od treti tridy a jsou za nimi obory prvniho rocniku a most
click(q('[data-act="gate"]'));
d.getElementById('gatein').value='5678'; click(q('[data-act="gatego"]'));
click(qa('[data-act="gradeset"]').find(b=>b.dataset.gr==='3'));
click(q('[data-act="map"]'));
ok('predel treťáka nese jeho rocnik', /3\. třída/.test(q('.milestone').textContent),
   q('.milestone').textContent.trim());
ok('dvere rikaji, ktere roky jsou za nimi', /1\. a 2\. třída/.test(q('.place.backdoor').textContent),
   q('.place.backdoor .sub').textContent.trim());
click(q('[data-act="back"]'));
ok('rozbalena mapa treťáka je delsi', qa('.place:not(.peekdoor)').length===28 && /Do tří/.test(txt()),
   qa('.place:not(.peekdoor)').length+' mist');
// prepnuti hrace mapu zase slozi, stejne jako zavreni hry
click(q('[data-act="players"]')); click(qa('[data-act="pick"]').find(b=>b.dataset.id===prvni().id));
ok('prepnuti hrace mapu slozilo', qa('.place.past').length===0 && qa('.place.backdoor').length===1
   && qa('.place:not(.peekdoor)').length===21);

console.log('--- druhy hrac ---');
// mapa zadne tlacitko "mapa" nema, uz na ni stojime; ten klik navic tady test
// shazoval, takze posledni ctyri kontrolce nikdy nedosly na radu
click(q('[data-act="players"]'));
click(q('[data-act="newplayer"]')); d.querySelector('#nm').value='Anička';
click(qa('[data-gr]').find(b=>b.dataset.gr==='2')); click(q('[data-go]'));
// v tuhle chvili uz stoji v datech tri profily: Kuba, Prvnak a Anicka; kontrola
// cekala dva jeste z doby, kdy prvnaka test nezakladal, a nikdy nedobehla
const anicka=()=>DBg().profiles.find(x=>x.name==='Anička');
ok('novy profil ma vlastni postup', DBg().profiles.length===3 && anicka().coins===0,
   DBg().profiles.length+' profilu');
click(q('[data-act="play"]')); click(q('[data-go]'));
ok('kratsi zavod dle nastaveni prvniho hrace se neprenasi', qa('.pip').length===20, qa('.pip').length+' otazek');

console.log('--- vynulovani postupu ---');
// vlastni prvnak, at se nesaha na nic, co uz test overil vyse
click(q('[data-act="quit"]')); click(q('[data-yes]'));   // z rozjeteho zavodu na mapu
click(q('[data-act="players"]'));
click(q('[data-act="newplayer"]')); d.querySelector('#nm').value='Terka';
click(qa('[data-gr]').find(b=>b.dataset.gr==='1')); click(q('[data-go]'));
ev('(function(){const p=P();p.world="trail";p.qCount=10;p.speedMode="slow";p.chapterMode="hard";'
  +'p.facts.t1x2={lv:3,reps:4,ok:3,bad:1,best:900,seen:1};p.stars.t1x2=true;p.coins=40;p.parts=7;'
  +'p.done.t1=2;p.trackRuns.t1=3;p.opened.t1=true;p.streak=4;save();})()');
click(q('[data-act="gate"]')); d.getElementById('gatein').value='5678'; click(q('[data-act="gatego"]'));
click(q('[data-act="resetprogress"]')); click(q('[data-yes]'));
const ter=()=>DBg().profiles.find(x=>x.name==='Terka');
ok('vynulovani nechalo prvnaka prvnakem', ter().grade===1, 'grade '+ter().grade);
ok('vynulovani nechalo nastaveni rodice',
   ter().world==='trail' && ter().qCount===10 && ter().speedMode==='slow' && ter().chapterMode==='hard',
   ter().world+' / '+ter().qCount+' / '+ter().speedMode+' / '+ter().chapterMode);
ok('vynulovani smazalo postup',
   !Object.keys(ter().facts).length && !Object.keys(ter().stars).length && !Object.keys(ter().done).length
   && ter().coins===0 && ter().parts===0 && ter().streak===0,
   Object.keys(ter().facts).length+' prikladu, '+ter().coins+' minci');

console.log('--- ctvrty rocnik se neskláda ---');
// ctvrtak nema zadnou vlastni trat, takze by slozeni schovalo celou mapu za
// jedny dvere; a ctvrtak je zaroven kazdy starsi profil po seedGrade()
ev('go("map")'); click(q('[data-act="players"]'));
click(q('[data-act="newplayer"]')); d.querySelector('#nm').value='Čtvrťák';
click(qa('[data-gr]').find(b=>b.dataset.gr==='4')); click(q('[data-go]'));
ok('ctvrtak cte pismo v zakladni velikosti', d.documentElement.dataset.grade==='4',
   'data-grade '+d.documentElement.dataset.grade);
ok('ctvrtak nema dvere zpatky ani predel',
   qa('.place.backdoor').length===0 && qa('.milestone').length===0);
ok('ctvrtak vidi celou mapu jako driv',
   qa('.place').length===27 && /Do tří/.test(txt()) && /Hodiny/.test(txt()) && /Do tisíce/.test(txt()),
   qa('.place').length+' mist');
ok('ctvrtak nema ani dvere dopredu, nic dalsiho neni', qa('.place.peekdoor').length===0);

console.log('--- vic policek v odpovedi ---');
// Deleni se zbytkem jeste neexistuje, takze se vstupni prvek zkousi na
// polozce slozene tady: zavod se rozjede jako kterykoli jiny a otazka
// se vymeni za dvoupolickovou. Zkousi se prave to, co strojovy test nad
// retezci nevidi, tedy psani do obou policek, preskok po naplneni,
// mazani pres hranici, prepinaci klavesa a klepnuti do policka.
ev('startRun(P(),"t1")');
ev(`(function(){
  const it=Object.assign({},itemFromKey('m6x7'),{text:'36 : 5',answer:[7,1],
    input:'pad2',maxLen:[2,1],sep:'(zb.',tail:')',kind:'divrem'});
  it.check=defaultCheck(it.answer);
  RUN.items[RUN.idx]=it; RUN.typed=blankTyped(it); RUN.slot=0; RUN.state='ask';
  render();
})()`);
const bx=i=>d.getElementById(i?'abox2':'abox');
const key=k=>click(qa('[data-k]').find(b=>b.dataset.k===k));
ok('otazka o dvou hodnotach ma dve policka', !!bx(0)&&!!bx(1));
ok('klavesnice ma navic klavesu na prepnuti policka',
   qa('#keypad [data-k]').length===13 && q('#keypad [data-k="next"]')!==null,
   qa('#keypad [data-k]').length+' klaves');
ok('pise se do prvniho policka',
   bx(0).classList.contains('active') && !bx(1).classList.contains('active'));
key('1');
ok('cislice jde do policka, do ktereho se pise', bx(0).textContent==='1' && bx(1).textContent==='?');
key('2');
ok('plne policko preda klavesy dalsimu',
   bx(0).textContent==='12' && bx(1).classList.contains('active'), 'policko '+ev('RUN.slot'));
key('3');
ok('druhe policko se da napsat',
   bx(1).textContent==='3' && ev('JSON.stringify(RUN.typed)')==='["12","3"]');
key('del'); key('del');
ok('mazani pres hranici se vrati do predchoziho policka',
   bx(1).textContent==='?' && bx(0).textContent==='1' && bx(0).classList.contains('active'),
   ev('JSON.stringify(RUN.typed)'));
key('ok');
ok('nedopsana odpoved se neodesle', ev('RUN.state')==='ask', 'stav '+ev('RUN.state'));
key('next');
ok('sipka prepne policko', bx(1).classList.contains('active') && !bx(0).classList.contains('active'));
key('next');
ok('sipka se po poslednim policku vrati na prvni', bx(0).classList.contains('active'));
click(bx(1));
ok('klepnuti do policka do nej prepne klavesy',
   bx(1).classList.contains('active') && ev('RUN.slot')===1);
ok('kazda hodnota se posuzuje zvlast',
   ev('RUN.items[RUN.idx].check(["7","1"])')===true
   && ev('RUN.items[RUN.idx].check(["7","2"])')===false
   && ev('RUN.items[RUN.idx].check(["8","1"])')===false
   && ev('RUN.items[RUN.idx].check("71")')===false);
// a cela cesta az do zapisu: odpoved se slozi z obou policek a odesle
ev('RUN.typed=["",""];RUN.slot=0;paintBoxes(RUN.items[RUN.idx])');
key('7'); key('next'); key('1');
ok('odpoved se slozila z obou policek', ev('JSON.stringify(RUN.typed)')==='["7","1"]');
const dvojDist=ev('RUN.dist');
key('ok');
await wait(900);
ok('spravna odpoved ve dvou polickach posunula zavodnika', ev('RUN.dist')>dvojDist,
   dvojDist+' -> '+ev('RUN.dist'));
ok('dalsi otazka si vzala zpatky klavesnici s jednim polickem',
   qa('#keypad [data-k]').length===12 && bx(1)===null,
   qa('#keypad [data-k]').length+' klaves');
click(q('[data-act="quit"]')); click(q('[data-yes]'));

// a totez uz i z opravdove trati, ne jen z rucne slozene polozky: od
// kroku E1 vyrabi pad2 rodina deleni se zbytkem
ev('startRun(P(),"divrem")');
ev('render()');
ok('zavod s delenim se zbytkem kresli dve policka', !!bx(0) && !!bx(1)
   && / : /.test(qtext()), qtext());
ok('nad klavesnici stoji slovy, co ta dve policka znamenaji',
   /kolikrát se to tam vejde/.test(txt()));
const zbyt=()=>ev('JSON.stringify(RUN.items[RUN.idx].answer)');
ok('odpoved je podil a zbytek, zbytek mensi nez delitel',
   ev(`(function(){const it=RUN.items[RUN.idx];const d=+it.text.split(' : ')[1];
      return Array.isArray(it.answer) && it.answer[1]<d && it.answer[0]*d+it.answer[1]===+it.text.split(' : ')[0];})()`),
   qtext()+' -> '+zbyt());
// prilis velky zbytek dostane vlastni hlasku, ne obecnou
ev(`(function(){const it=RUN.items[RUN.idx];const d=+it.text.split(' : ')[1];
  RUN.typed=[String(it.answer[0]),String(d)];RUN.slot=1;paintBoxes(it);})()`);
key('ok');
await wait(900);
ok('prilis velky zbytek rekne, ze se tam vejde jeste jedna',
   /vejde se tam ještě jedna celá/.test(txt()), txt().slice(0,140));
click(q('[data-act="quit"]')); click(q('[data-yes]'));

// a tri policka, od kroku E2, na rodine rozkladu cisla. Kolik policek
// radek ma, rika material: prvni dva kbeliky rozepisuji cislo na dva
// rady a treti na tri, takze se tady vezme otazka z posledniho kbeliku.
ev('startRun(P(),"split")');
ev("RUN.items[RUN.idx]=itemFromKey('v3');RUN.typed=blankTyped(RUN.items[RUN.idx]);RUN.slot=0;RUN.state='ask';render()");
const bx3=()=>d.getElementById('abox3');
ok('zavod s rozkladem kresli tri policka', !!bx(0)&&!!bx(1)&&!!bx3()&&/^\d+$/.test(qtext()), qtext());
ok('mezi polickami stoji plus, a to dvakrat',
   (q('#qbox').innerHTML.match(/qsep/g)||[]).length===2, q('#qbox').textContent);
ok('klavesnice pro tri policka ma taky trinact klaves',
   qa('#keypad [data-k]').length===13 && q('#keypad [data-k="next"]')!==null,
   qa('#keypad [data-k]').length+' klaves');
ok('nad klavesnici stoji slovy, na co se cislo rozepisuje', /Rozepiš/.test(txt()));
// policko je siroke presne na to, co do nej patri: tri cislice, dve, jedna
key('9'); key('0'); key('0');
ok('trojciferne policko preda klavesy az po treti cislici',
   bx(0).textContent==='900' && ev('RUN.slot')===1, 'policko '+ev('RUN.slot'));
key('8'); key('0');
ok('druhe policko preda klavesy tretimu', ev('RUN.slot')===2, 'policko '+ev('RUN.slot'));
key('7');
ok('treti policko se napise a klavesy uz nikam nejdou',
   bx3().textContent==='7' && ev('RUN.slot')===2 && ev('JSON.stringify(RUN.typed)')==='["900","80","7"]');
key('del'); key('del');
ok('mazani pres hranici se vrati i ze tretiho policka do druheho',
   bx3().textContent==='?' && bx(1).textContent==='8' && bx(1).classList.contains('active'),
   ev('JSON.stringify(RUN.typed)'));
key('next'); key('next');
ok('sipka objede vsechna tri policka dokola', bx(0).classList.contains('active'));
// spravna odpoved z generatoru posune zavodnika
ev("(function(){const it=RUN.items[RUN.idx];RUN.typed=it.answer.map(String);RUN.slot=2;paintBoxes(it);})()");
const rozDist=ev('RUN.dist');
key('ok');
await wait(900);
ok('spravny rozklad posunul zavodnika', ev('RUN.dist')>rozDist, rozDist+' -> '+ev('RUN.dist'));
// napsat cislice misto toho, kolik doopravdy plati, ma vlastni hlasku
ev("RUN.items[RUN.idx]=itemFromKey('v3');RUN.typed=blankTyped(RUN.items[RUN.idx]);RUN.slot=0;RUN.state='ask';render();"
  +"RUN.typed=RUN.items[RUN.idx].answer.map(a=>String(a)[0]);paintBoxes(RUN.items[RUN.idx])");
key('ok');
// hlaska se cte drive, nez chybnou otazku po 1,9 s vystrida dalsi
await wait(400);
ok('napsane cislice misto radu dostanou vlastni hlasku', /doopravdy/.test(txt()), txt().slice(0,160));
await wait(1700);
click(q('[data-act="quit"]')); click(q('[data-yes]'));

console.log('--- vyber z nabidky ---');
// Odpoved, ktera se vybira z tlacitek. Zkousi se prave to, co strojovy
// test nad retezci nevidi: ze stisk tlacitka odpoved rovnou odesle, ze
// se v policku objevi slovo a ne cislo tlacitka, ze se plocha vymeni i
// mezi dvema otazkami s vyberem, kdyz se lisi nabidka, a ze se plocha
// vejde na obrazovku stejne jako ciselna klavesnice.
ev('startRun(P(),"t1")');
ev("RUN.items[RUN.idx]=itemFromKey('jp1');RUN.typed=blankTyped(RUN.items[RUN.idx]);RUN.slot=0;RUN.state='ask';render()");
const nab=()=>qa('#keypad [data-k]');
ok('otazka s vyberem kresli dve velka tlacitka',
   nab().length===2 && q('#keypad').dataset.input==='pick' && q('#keypad').dataset.opts==='2',
   nab().map(b=>b.textContent).join(' / '));
ok('na plose vyberu neni guma, sipka ani fajfka',
   !q('#keypad [data-k="ok"]') && !q('#keypad [data-k="del"]') && !q('#keypad [data-k="next"]'));
ok('na radku stoji cislo, slovo a prazdne policko',
   /^\d+$/.test(qtext()) && bx(0) && bx(0).textContent==='?' && /je/.test(q('#qbox').textContent),
   q('#qbox').textContent);
ok('nad tlacitky stoji slovy, na co se ptame', /sudé, nebo liché/.test(txt()));
// stisk je cela odpoved: nic se nepotvrzuje a odesle se hned
const vybDist=ev('RUN.dist');
const spravne=ev('RUN.items[RUN.idx].answer');
click(nab()[spravne]);
ok('stisk tlacitka rovnou odeslal odpoved', ev('RUN.state')==='feedback', 'stav '+ev('RUN.state'));
ok('v policku je slovo, ne cislo tlacitka',
   ['sudé','liché'].indexOf(bx(0).textContent)>=0, bx(0).textContent);
ok('spravny vyber posunul zavodnika', ev('RUN.dist')>vybDist, vybDist+' -> '+ev('RUN.dist'));
await wait(900);
// druha otazka s vyberem, ale s jinou nabidkou: plocha se musi vymenit,
// jinak by pod prstem zustala slova predchozi otazky
ev("RUN.items[RUN.idx]=itemFromKey('jd1');RUN.typed=blankTyped(RUN.items[RUN.idx]);RUN.slot=0;RUN.state='ask';render()");
ok('jina nabidka vymenila plochu, i kdyz je prvek tyz',
   nab().length===3 && nab().every(b=>/číslice/.test(b.textContent)),
   nab().map(b=>b.textContent).join(' / '));
// spatny vyber u sudych a lichych dostane pravidlo, ne obecnou hlasku
ev("RUN.items[RUN.idx]=itemFromKey('jp2');RUN.typed=blankTyped(RUN.items[RUN.idx]);RUN.slot=0;RUN.state='ask';render()");
click(nab()[1-ev('RUN.items[RUN.idx].answer')]);
await wait(400);
ok('spatne sude nebo liche rekne pravidlo o posledni cislici',
   /poslední číslice/.test(txt()), txt().slice(0,170));
await wait(1700);
console.log('--- porovnavani ---');
// Tentyz vstupni prvek s jinymi popiskami: tri znaky misto slov. Zkousi
// se, ze se plocha vymenila i proti nabidce slov, ze znak stoji mezi
// dvema stranami a ne pred polickem, a ze stisk odpoved rovnou odesle.
ev("RUN.items[RUN.idx]=itemFromKey('ju1');RUN.typed=blankTyped(RUN.items[RUN.idx]);RUN.slot=0;RUN.state='ask';render()");
ok('porovnavani kresli tri tlacitka se znaky',
   nab().length===3 && nab().map(b=>b.textContent.trim()).join('')==='<=>'
   && q('#keypad').dataset.glyph==='1',
   nab().map(b=>b.textContent.trim()).join(' / '));
const pmQ=d.getElementById('qbox');
ok('policko stoji mezi dvema stranami',
   pmQ.innerHTML.indexOf('id="qtext"')<pmQ.innerHTML.indexOf('id="abox"')
   && pmQ.innerHTML.indexOf(ev('RUN.items[RUN.idx].tail'))>pmQ.innerHTML.indexOf('id="abox"'),
   pmQ.textContent);
ok('u jednotek je receno, ze se ma nejdriv prevest', /stejnou jednotku/.test(txt()));
const pmDist=ev('RUN.dist'), pmSpr=ev('RUN.items[RUN.idx].answer');
click(nab()[pmSpr]);
ok('stisk znaku rovnou odeslal odpoved', ev('RUN.state')==='feedback', 'stav '+ev('RUN.state'));
ok('v policku je znak, ne cislo tlacitka', ['<','=','>'].indexOf(bx(0).textContent)>=0, bx(0).textContent);
ok('spravny znak posunul zavodnika', ev('RUN.dist')>pmDist, pmDist+' -> '+ev('RUN.dist'));
await wait(900);
// spatny znak u jednotek rekne obe strany v teze jednotce
ev("RUN.items[RUN.idx]=itemFromKey('ju4');RUN.typed=blankTyped(RUN.items[RUN.idx]);RUN.slot=0;RUN.state='ask';render()");
const pmSame=ev('JSON.stringify(RUN.items[RUN.idx].same)');
click(nab()[(ev('RUN.items[RUN.idx].answer')+1)%3]);
await wait(400);
ok('spatne porovnani jednotek ukaze obe strany v teze jednotce',
   JSON.parse(pmSame).every(s=>txt().indexOf(s)>=0), txt().slice(0,180));
await wait(1700);
// a zpatky na ciselnou klavesnici, aniz by se cokoli zaseklo
ev("RUN.items[RUN.idx]=itemFromKey('m6x7');RUN.typed=blankTyped(RUN.items[RUN.idx]);RUN.slot=0;RUN.state='ask';render()");
ok('po vyberu se ciselna klavesnice vratila cela', nab().length===12 && !!q('#keypad [data-k="ok"]'),
   nab().length+' klaves');
click(q('[data-act="quit"]')); click(q('[data-yes]'));

console.log('--- sirsi okno ---');
// Az sem se hralo na telefonu 375 x 812. Tady se okno vedome prepne na
// 1024 x 768, tedy tablet na sirku, a mapa se musi prestehovat do ctyr
// sloupcu sama. Prekresleni ma debounce 150 ms, proto to cekani.
ev('go("map")');
Object.defineProperty(w,'innerWidth',{value:1024,configurable:true,writable:true});
Object.defineProperty(w,'innerHeight',{value:768,configurable:true,writable:true});
w.dispatchEvent(new w.Event('resize'));
await wait(260);
ok('sirsi okno da mape ctyri sloupce', q('.world').dataset.cols==='4', 'data-cols '+q('.world').dataset.cols);
ok('okno na sirku se pozna na html', d.documentElement.dataset.o==='wide' && d.documentElement.dataset.w==='desk',
   d.documentElement.dataset.w+' / '+d.documentElement.dataset.o);
const sirka=ev('placeBox(4).w');       // 22 procent, tedy 100/4 - 3
ok('siroka mapa nevyjede ven',
   qa('.world .place').every(el=>parseFloat(el.style.left)+sirka<=100),
   qa('.world .place').length+' mist siroke po '+sirka+' %');

console.log('--- co dite nikdy neuvidi ---');
// Vysledek hlidace z uvodu souboru: za cely beh se vykreslila mapa,
// zavod, vysledek, garaz, poklady, obchod i dilna, a ani na jedne z nich
// nesmela poznamka o prispevku byt. Pocet prohlednutych obrazovek se
// tiskne schvalne: hlidac, ktery nic nevidel, nic nehlida.
const videl=ev('window.__seen'), unik=JSON.parse(ev('JSON.stringify(window.__leak)'));
ok('hlidac opravdu bezel pres detske obrazovky', videl>20, videl+' vykresleni');
ok('podpora se na zadne detske obrazovce neukazala', unik.length===0,
   unik.length?[...new Set(unik)].join(', '):'zadna z '+videl);
// druhy zamek, ve zdroji: slova o prispevku se skladaji na jednom miste
// a to misto je rodicovska obrazovka. Kdyby je nekdo zavolal odjinud,
// hlidac vyse by to chytil az ve chvili, kdy tudy test projde.
const appsrc=fs.readFileSync(path.join(ROOT, 'src', 'app.js'),'utf8');
const odKud=[...appsrc.matchAll(/\$\{supportCard\(\)\}/g)].map(m=>m.index);
const zacatek=appsrc.indexOf('function viewParent('), konec=appsrc.indexOf('\nfunction ', zacatek+1);
const mimo=odKud.filter(i=>i<zacatek || i>konec);
ok('podporu vykresluje jedine viewParent', odKud.length===1 && mimo.length===0,
   odKud.length+' volani, mimo viewParent '+mimo.length);
const slova=[...appsrc.matchAll(/t\("(support[A-Za-z]*)"\)/g)].map(m=>m.index);
const defStart=appsrc.indexOf('function supportCard('), defEnd=appsrc.indexOf('\nfunction ', defStart+1);
ok('slova o podpore stoji jen v tom jednom bloku',
   slova.length===4 && slova.every(i=>i>defStart && i<defEnd), slova.length+' klicu');

console.log('\nchyby za behu:', errs.length?errs.join('\n'):'zadne');
process.exit(0);
})();
