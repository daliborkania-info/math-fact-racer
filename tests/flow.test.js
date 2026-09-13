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
// startovnich zavodniku je od kroku H1 sedm, ne sest: pribyla gumova
// kacenka a je zdarma, protoze se na ni pozdeji kupuji veci, ne ona sama.
// Cislo se posunulo vedome, viz tests/README.md
ok('profil dostal startovni sedmicku zdarma', DBg().profiles[0].owned.length===7, DBg().profiles[0].owned.join(','));
ok('kacenka je mezi startovnimi zdarma', DBg().profiles[0].owned.includes('du_kacka'));
// mapa treťáka zacina tam, kde je letos trida, ale ucivo, ktere se letos
// opakuje, zustava pred dvermi: treti rocnik zacina opakovanim nasobilky
// (kapitoly 2 a 3 sedmeho dilu), stovky (kapitola 1) a hodin (kapitola 4).
// V hlavnim bloku je tedy 17 trati: t1 az t5, d1, a100, clock, sedm trati
// tretiho rocniku a k tomu sampionat se slabymi misty. Plus dilna a dvere
// zpatky je to 19 mist; cest je 17, dilna ani dvere nahled nemaji.
// Sedm trati tretiho rocniku je od kroku D3: retezec, poradi operaci,
// za nasobilkou, kulata cisla, zaokrouhlovani, tisicovka a prevody.
const cesty=()=>new Set(qa('.thumb svg path').map(p=>p.getAttribute('d'))).size;
ok('slozena mapa treťáka ma 17 ruznych cest', cesty()===17, cesty()+' okruhu');
ok('slozena mapa ma 19 mist', qa('.world .place').length===19, qa('.world .place').length+' mist');
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
ok('rozbaleni ukazalo minule roky', cesty()===24, cesty()+' okruhu');
ok('za dvermi je sest oboru prvniho rocniku a most', qa('.place.past').length===7 && qa('.place.peek').length===0,
   qa('.place.past').length+' trati z minulych let');
ok('minule roky jsou plne, ne carkovane jako ukazka', /Do tří/.test(txt())
   && qa('.place.past').every(el=>el.tagName==='BUTTON'||el.classList.contains('locked')));
ok('o rozbaleni neni v ulozenych datech ani slovo', JSON.stringify(DBg())===predRozbalenim);
ok('predel je videt i s rozbalenou mapou', qa('.milestone').length===1);
// mapa uz neni svisly seznam: mista lezi podel cesty a zamcene je vidět taky
// rozbaleno je to porad 26 mist, jen jich vic patri do hlavniho bloku:
// 1 dvere + 7 minulych + 17 letosnich + dilna
ok('mista lezi podel cesty, ne pod sebou', qa('.world .place').length===26 && qa('.worldroad path').length>0,
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
// vsech osm, kacenku nevyjimaje
click(q('[data-act="map"]')); click(q('[data-act="play"]'));
ok('nabidka pred startem ukazuje vsech osm vlastnenych', qa('[data-pick]').length===8,
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
ok('kapitoly bez generatoru jsou nevybratelne', zamcene().length===8, zamcene().length+' zamcenych z 33');
ok('scitani a odcitani vice cisel se da vybrat', !zamcene().includes(11));
ok('deleni se zbytkem a zlomky jsou mezi zamcenymi', zamcene().includes(27) && zamcene().includes(32));
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
// a objem v kapitole 29. Kapitola 17 jednotky jen pojmenovava, takze
// generator nema a zamcena zustava
ok('prevody jednotek se daji vybrat', !zamcene().includes(18) && !zamcene().includes(29));
// zkouska spravnosti od kroku D4: neni to novy generator, ale latka
// predchozich kapitol pozpatku, takze kapitola 5 uz zamcena neni
ok('zkouska spravnosti se da vybrat', !zamcene().includes(5));
ok('kapitola, ktera jednotky jen pojmenovava, zamcena zustala', zamcene().includes(17));
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
ok('dilna nabizi zakazky obou rocniku', qa('[data-act="jobstart"]').length===2
   && /Peníze/.test(txt()) && /Počítání dílků/.test(txt()), qa('[data-act="jobstart"]').length+' zakazek');
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
   ev('shopSpec(P()).keys.length')===6, ev('shopSpec(P()).keys.length')+' mist');
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
// sedm startovnich vcetne kacenky plus jeden koupeny; do kroku H1 sedm
ok('vsichni koupeni zavodnici jsou porad k vyberu', qa('[data-pick]').length===8,
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

console.log('--- kacenciny barvy ---');
// dily kacenky se kupuji za tutez menu jako natery, tedy za soucastky
// z dilny, nikdy za mince; mincim se po nakupu nesmi stat vubec nic
const minciPred=DBg().profiles[0].coins, soucastekPred=DBg().profiles[0].parts;
// pet vrstev pod natery: deset barev, deset vzoru, dvacet dilu na
// hlavu, devet na oci a sestnact kusu vybavy. Cisla se posunula krokem
// H4 vedome: k 39 placenym dilum z H2 a H3 pribylo 25, tedy 64
// k odemceni, a k jedinemu dilu zdarma (klasicka zluta) pribyly ctyri
// prazdne dlazdice, tedy pet dlazdic, na ktere se klepne bez placeni
ok('vrstvy kacenky jsou v garazi pod natery', !!d.getElementById('duckbodysec')
   && !!d.getElementById('duckpatsec') && !!d.getElementById('duckheadsec')
   && !!d.getElementById('duckeyesec') && !!d.getElementById('duckgearsec')
   && qa('[data-act="buyduck"]').length===64, qa('[data-act="buyduck"]').length+' k odemceni');
// klasicka zluta je zdarma, takze se nekupuje, jen vybira, a vrstvy,
// ktere jdou sundat, maji prazdnou dlazdici
ok('telo zdarma a ctyri prazdne dlazdice se nekupuji', qa('[data-act="useduck"]').length===5
   && qa('[data-act="useduck"]')[0].dataset.id==='db_klasik'
   && qa('[data-act="useduck"]').filter(b=>b.dataset.id==='').length===4,
   qa('[data-act="useduck"]').map(b=>b.dataset.id+':'+b.dataset.layer).join(' '));
const telo=qa('[data-act="buyduck"]')[0].dataset.id;
const cenaTela=ev('duckPartById("'+telo+'").cost');
click(qa('[data-act="buyduck"]')[0]); click(q('[data-yes]'));
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
click(qa('[data-act="useduck"]').find(b=>b.dataset.id===''&&b.dataset.layer==='head'));
ok('klobouk jde sundat a zustane koupeny', DBg().profiles[0].duck.head===undefined
   && DBg().profiles[0].duckParts.includes(klobouk)
   && DBg().profiles[0].duck.pat===vzor && DBg().profiles[0].duck.eye===bryle,
   JSON.stringify(DBg().profiles[0].duck));
// a na co dite nema, to se nekoupi; soucastky zustanou, kde byly
const chudy=DBg(); chudy.profiles[0].parts=1;
w.localStorage.setItem('math-fact-racer-v1', JSON.stringify(chudy));
jev('load(); go("collection")');
click(qa('[data-act="buyduck"]')[0]);
ok('bez soucastek se dil nekoupi', DBg().profiles[0].parts===1
   && DBg().profiles[0].duckParts.length===5, DBg().profiles[0].parts+' soucastek');
q('.sheet').remove();

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
// ani predel, a to je spravne, cela jeho mapa je letosni.
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
ok('rozbalena mapa treťáka je delsi', qa('.place:not(.peekdoor)').length===26 && /Do tří/.test(txt()),
   qa('.place:not(.peekdoor)').length+' mist');
// prepnuti hrace mapu zase slozi, stejne jako zavreni hry
click(q('[data-act="players"]')); click(qa('[data-act="pick"]').find(b=>b.dataset.id===prvni().id));
ok('prepnuti hrace mapu slozilo', qa('.place.past').length===0 && qa('.place.backdoor').length===1
   && qa('.place:not(.peekdoor)').length===19);

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
   qa('.place').length===25 && /Do tří/.test(txt()) && /Hodiny/.test(txt()) && /Do tisíce/.test(txt()),
   qa('.place').length+' mist');
ok('ctvrtak nema ani dvere dopredu, nic dalsiho neni', qa('.place.peekdoor').length===0);

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

console.log('\nchyby za behu:', errs.length?errs.join('\n'):'zadne');
process.exit(0);
})();
