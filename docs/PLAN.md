# Implementační plán, verze 2

Sepsáno 13. září 2026 po revizi celého repozitáře (kód, dokumentace, testy,
vyrenderované obrazovky na telefonu a tabletu v obou orientacích). Nahrazuje
`PLAN-2026-09-12.md`, který zůstává jako záznam kroků 1 až 4d a zdůvodnění,
proč jsou postavené tak, jak jsou.

Tenhle soubor říká **co** se dělá dál, **v jakém pořadí** a **kde v kódu se
sahá**. U každého kroku je hotový seznam zásahů, změny testů, čísla, která se
posunou, a pasti. Je psaný pro implementující session, která má přečtený
`PROJECT-STATE.md`; mechaniku ani architekturu neopakuje, odkazuje na ni.

Pravidla práce platí beze změny: zdroje v `src/`, nikdy `index.html`; po každé
změně `python3 build.py` a testy z `tests/`, hlídá se `!!` ve výstupu; nové
chování patří do testů; žádná změna nesmí připravit existující profil o postup;
nedotknutelné principy z `PROJECT-STATE.md`, oddíl 3, se nemění bez pokynu.
Kód a komentáře anglicky, texty rozhraní ve třech jazycích, commit message
anglicky jako jedna věta, která říká, co se pro dítě nebo rodiče změnilo
(vzor: `Teach the racer to round, and to ask something other than a sum`).

---

## 0. Kde stojíme a co se v revizi zjistilo

**Stav.** Dvaadvacet tratí ve čtyřech světech, 88 palet, dvě zakázky v dílně,
80 hratelných kapitol z 95, pět testových souborů. Všech pět testů prochází,
`flow.test.js` 172 kontrol, `migration.test.js` 84, `i18n` 322 klíčů ve třech
jazycích bez děr. Jedna kontrola je nestabilní, viz A1.

**Revize kódu nenašla nic, co by rozbíjelo mechaniku.** Pohyb, body, krabička,
odemykání, světy, ročníky i dílna dělají to, co dokumentace popisuje. Našla ale
sedm věcí, které se mají opravit hned, protože jsou levné a některé z nich
dítě potká (krok A), a jednu věc, která je rozhodnutí uživatele, ne chyba
(oddíl 9, R1).

**Responzivita je dnes nejslabší místo.** `#app` má `max-width:520px` a celé
rozvržení počítá s telefonem na výšku. Na telefonu na šířku (812 × 375) se
závodní obrazovka nevejde: vidět je scéna a první řádek klávesnice, zbytek je
pod okrajem; v dílně jsou mince i tlačítko Hotovo mimo obrazovku; spodní list
s výběrem závodníka přeteče nahoru přes okraj a titulek je uříznutý. Na tabletu
(768 × 1024 i 1024 × 768) běží hra v úzkém sloupci uprostřed a víc než polovina
displeje je prázdná modrá plocha; klávesy jsou široké a nízké, karty na mapě
mají písmo 15 a 11 px na displeji, kde by mohly mít dvojnásobek. Instalovaná
verze má v manifestu `"orientation": "portrait"`, takže se na tabletu vůbec
neotočí. Řeší krok C.

**Písmo nerozlišuje ročník.** Prvňák, který se teprve učí číst, dostává stejné
11 px podtitulky, 11 px zámkové hlášky a 13,5 px nápovědy jako čtvrťák. Řeší
krok C, část C4.

**Mapa třeťáka nemá předěl.** Přišlo z hraní ve stejný den, kdy vznikl
tenhle plán: syn s nastavenou třetí třídou viděl mapu jako pokračování celého
předchozího bloku a nebylo poznat, kde začíná jeho učivo. Dřívější ročníky se
mají složit a rozbalovat jen na žádost. Řeší krok B0, je to výslovný pokyn
uživatele a mění rozhodnutí z `PROJECT-STATE.md`, oddíl 7d.

**Zbytek plánu jsou přírůstky** a jejich pořadí je volné, tady je navržené
podle toho, co je slíbené (řetězec), co bolí nejvíc (responzivita) a co odemkne
nejvíc kapitol za nejmíň práce (zbytek vlny A).

| krok | co | velikost | mění datový model |
| --- | --- | --- | --- |
| A | opravy z revize | hodina | ne |
| B0 | předěl ročníků na mapě, minulé roky složené | půl session | ne |
| B | `chain_3`, trať `chain` — hotovo | jedna session | ne |
| C | responzivita a písmo podle ročníku | jedna až dvě session | ne |
| D | zbytek vlny A, čtyři rodiny na `pad` | čtyři session | ne |
| E | vlna B, nové vstupní prvky, začíná `pad2` | tři až čtyři session | `pad2` možná ano |
| F | vlna C, slovní úlohy v dílně | jedna až dvě session | ne |
| G | čtvrtý a pátý ročník | po ověření map | ano, `MAX_GRADE` |

---

## Krok A. Opravy z revize — HOTOVO 13. září 2026

Proti plánu se upřesnily tři věci: R7 se udělalo podle doporučení, tedy
vynulování nechává `grade`, `lang`, `world`, `curriculum`, `chapter`,
`chapterMode`, `qCount`, `speedMode` a `autoUnlock`; `flow.test.js`
a `names.test.js` se cestou musely opravit, protože obě padaly na kroku, který
rozhraní už nemá (klik na "mapu" na mapě a zakládání hráče bez volby třídy),
takže poslední kontroly nikdy nedoběhly a dnešních 154 kontrol je proti 148
z oddílu 0 hlavně tímhle; a A6 samo o sobě tmavé pruhy po stranách scény
neodstraní, protože strop výšky pořád ořízne poměr stran při šířce 375 px,
jen už scénu nedeformuje na užších displejích — zbytek toho bloku má stejně
na starosti krok C.

Sedm malých zásahů, žádný nemění datový model, takže bez nové fixture. Každý
dostane vlastní kontrolu v testu, ať se nevrátí. Dělá se před čímkoli dalším,
protože A1 dělá testy nestabilní a A3 se týká každého iPhonu.

**A1. Míchání fronty umí vyrobit dva stejné příklady za sebou.** Cyklus na
konci `buildRun()`, který rozhazuje sousedící duplicity, hledá partnera
k prohození jen **doprava** od dvojice. Když dvojice sedí na konci fronty,
nebo když všechno napravo je buď stejný klíč, nebo stojí vedle stejného klíče,
nenajde nic a dvojice zůstane. U trati `a3`, kde se čtyři klíče dělí o dvacet
otázek, se to stává v každém dvacátém závodě; změřeno na osmi tisících
závodech na `a3` až `a10` bylo 698 sousedících dvojic klíčů a 328 z nich mělo
i stejnou tvář, protože klíč jako `s2p2` má jen jednu (`4 - 2`) a přegenerování
na konci `buildRun()` ho nezmění. `items.test.js` to hlásí jako `stejna otazka
dvakrat za sebou na trati a5 1x` zhruba v jednom běhu z deseti.

Pouhé doplnění kontroly levého souseda cíle nestačí, ověřeno stejným měřením
(371 dvojic). Funguje hledání **oběma směry** s úplnou podmínkou na oba konce
prohození; s touhle verzí bylo dvojic v osmi tisících závodech nula:

```js
  const fits = (i, j) => {
    // moving keys[i] to j and keys[j] to i must not create a pair at
    // either end; neighbours that are the swapped slots themselves are
    // skipped, they are being replaced
    const x = keys[i], y = keys[j];
    if(y === keys[i-1]) return false;
    if(i + 1 < keys.length && i + 1 !== j && y === keys[i+1]) return false;
    if(j - 1 >= 0 && j - 1 !== i && x === keys[j-1]) return false;
    if(j + 1 < keys.length && j + 1 !== i && x === keys[j+1]) return false;
    return true;
  };
  for(let i = 1; i < keys.length; i++){
    if(keys[i] !== keys[i-1]) continue;
    let j = -1;
    for(let k = i + 1; k < keys.length && j < 0; k++) if(fits(i, k)) j = k;
    for(let k = i - 2; k >= 0 && j < 0; k--) if(fits(i, k)) j = k;
    if(j >= 0) [keys[i], keys[j]] = [keys[j], keys[i]];
  }
```

Nahrazuje celý dnešní vnořený cyklus, komentář nad ním o hledání dál ve
frontě zůstává platný a jen se doplní o oba směry. Test: v okruhu 2
`items.test.js` postavit závod na `a3`, `a5`, `a7` a `a10` po pěti stech
a hlídat, že žádné dvě sousední otázky nemají stejný klíč ani stejnou tvář;
dnešní kontrola dělá jeden běh, a proto je nestabilní.

**A2. Vynulování postupu vezme rodiči nastavení.** `resetprogress` volá
`newProfile(nm)` bez ročníku, takže prvňák skončí v ročníku 4 a vidí celou
mapu; padne i jazyk dítěte, svět, učebnice, kapitola, délka závodu a rychlost.
Oprava: `newProfile(nm, old.grade)` a překopírovat `lang`, `world`,
`curriculum`, `chapter`, `chapterMode`, `qCount`, `speedMode`, `autoUnlock`.
Postup, tedy `facts`, `stars`, `best`, `done`, `owned`, `xp`, `coins`, `parts`,
`paints`, `paint`, `jobRuns`, `trackRuns`, `opened`, `force` a série, se maže
dál. Test do `flow.test.js`: prvňákovi nastavit svět `trail`, vynulovat,
ověřit `grade === 1` a `world === "trail"` a že `facts` je prázdný.

**A3. `100dvh` je přebité `100vh`.** V `#app` je `min-height:100dvh` a hned
pod ním `min-height:100vh`, takže na iOS Safari platí `vh` a spodní řada
klávesnice se schová pod lištu prohlížeče. Prohodit pořadí: nejdřív `vh`
jako záloha, pak `dvh`. Test viz `tests/style.test.js` v kroku C7; do té doby
ruční kontrola.

**A4. Spodní list přeteče přes horní okraj.** `.sheet .inner` nemá strop
výšky. Na telefonu na šířku má výběr závodníka 411 px při 375 px okna a titulek
je uříznutý; s otevřenou klávesnicí to platí i pro zakládání hráče. Oprava:
`.sheet .inner{max-height:calc(100dvh - 8px);overflow-y:auto}` (opět s `vh`
zálohou před `dvh`).

**A5. Výsledek zakázky slepí chybějící úlohy počítání do jedné.** `viewJobDone()`
odlišuje chyby klíčem plus `i.amount`, a úloha počítání dílků `amount` nemá,
takže dvě různé spadnou do jednoho štítku. Oprava: `i.key + "|" + (i.answer
!== undefined ? i.answer : i.amount)`. Test do `flow.test.js` v průchodu
zakázkou `count`: dvě různé chyby, dva štítky.

**A6. Mrtvé a špatné CSS pro nízké displeje.** V `@media (max-height:660px)`
je `.runner,.ghost{...}`, třídy, které v kódu neexistují (auto je `.carwrap`),
a `.stage{height:148px}` přebíjí poměr stran pevnou výškou, takže na 640 px
vysokém telefonu je scéna 148 px vysoká a po stranách má tmavé pruhy. Smazat
mrtvé selektory, `height` nahradit `max-height`. Zbytek toho bloku přepracuje
krok C.

**A7. Dokumentace se rozešla s kódem, opraveno při revizi 13. září.**
`PROJECT-STATE.md` uváděl `FAMILY_HEADS` jako `p`, `n`, `c` a `k` (v kódu
`"pnckxo"`) a násobitele prahů bez 2,6 pro `beyond` a 2,0 pro `round`; obojí
je srovnané s `thresholds()`. Do `tests/README.md` přibylo, jak dlouho který
test běží. Pro implementaci z toho neplyne nic, je to tu jen proto, aby bylo
vidět, že se to hledalo.

Commit za celý krok jeden, například `Fix the small things the review found
before anything else is built on them`.

---

## Krok B0. Předěl ročníků na mapě — HOTOVO 13. září 2026

Proti plánu se upřesnilo tohle: vedle `yearOf()` vznikla ještě `foldsYears(p)`
na pravidlo o vlastní trati ročníku a `worldSpots()` dostalo parametr `gapAt`
na ten půlkrok pod milníkem; a protože R1 se nedělá, nemá čerstvý třeťák na
složené mapě jedinou otevřenou trať, takže `i18n.test.js` i `names.test.js`
musely před závodem otevřít dveře do minulých let, jinak neměly na co
kliknout. Přibyl klíč `backAnd` (spojka mezi třídami v podtitulku dveří)
a přepsala se poznámka `gradeNote` v rodičovské sekci, která slibovala, že
z mapy nic nemizí. Kontrol ve `flow.test.js` je po tomhle kroku 170.

Přišlo z hraní 13. září, výslovný pokyn uživatele: syn si nastavil třetí třídu
a mapa byla jen pokračování celého předchozího bloku, bez předělu, kde začíná
"jeho" učivo. Dřívější ročníky mají být **složené a rozbalit se jen na
žádost**, stejně jako se na konci cesty rozbaluje příští rok. Tím se mění
rozhodnutí z `PROJECT-STATE.md`, oddíl 7d ("dřívější ročník se nikdy
neschovává a žádné tlačítko zpátky není"); ten odstavec se přepíše podle
tohohle kroku a uvede, že to přišlo z testování s dítětem.

**Co se nemění.** Učivo dřívějších let zůstává v profilu, v krabičce,
v šampionátu i v rodičovské sekci beze změny; jen na mapě je za dveřmi.
Odemykání se nemění (o žebříku uvnitř dřívějších let rozhoduje R1 v oddílu 9).
Nic se nezapisuje do profilu: rozbalení drží proměnná `BACK` s id profilu,
přesně jako `PEEK`, takže zavření hry i přepnutí hráče mapu zase složí.

**Tvar mapy pro ročník `g`, shora dolů:**

1. **Dveře do minulých let**, `.place.backdoor`, jedno místo na začátku cesty,
   `data-act="back"`. Jsou tam jen tehdy, když existuje aspoň jedna trať
   s `grade < g`, tedy od druhé třídy. Nesou název `backTitle` ("Z minulých
   let"), podtitulek se seznamem tříd (`backSub`, "1. a 2. třída", složený
   z `grade1`, `grade2`), v patičce součet rozsvícených míst ve sbírkách těch
   tratí lomeno jejich velikostí, aby dítě vidělo, že tam něco má, a
   `backShow` / `backHide` podle stavu. Vzhled jako `peekdoor`, čárkovaný
   rámeček, ale bez fialového nádechu, spíš papírový; ikona `&#128218;`
   (knihy) nebo `&#9194;`.
2. **Rozbalené minulé roky**, jen když `BACK === p.id`: tratě s `grade < g`
   v dnešním pořadí, každá s třídou `past`, vzhled plný, ne čárkovaný, protože
   to je učivo, které dítě má, ne ukázka.
3. **Milník**, `.milestone`, malá cedule na cestě mezi minulostí a letoškem,
   s textem `yearSign` ("3. třída"). Není to tlačítko. Je tam vždycky, když
   jsou dveře, ať už jsou rozbalené, nebo ne, protože právě ona je ten předěl,
   který synovi chyběl; nezapočítává se mezi místa, ale zabírá na cestě půl
   kroku (`placeBox().step / 2`; do kroku C8 to byla konstanta `PLACE_STEP`).
4. **Letošní tratě**: `tr.grade === g` plus tratě, které patří každému roku,
   tedy `mix`, `weak` a `school`. Ty dvě první mají v `TRACKS` `grade` 2 a 1
   jen proto, aby prvňák neviděl šampionát; pro účely předělu se berou jako
   letošní. Zavést pomocnou `yearOf(p, tr)`, která vrací `"own"`, `"past"`
   nebo `"ahead"`, a všechno v `viewMap()` se ptá jí, ne `tr.grade` přímo.
5. **Dílna**, jako dnes.
6. **Dveře do příštího roku a ukázka**, jako dnes.

**Ročník 4 ("4. a výš") se neskládá.** Nemá žádnou vlastní trať, takže by
složení schovalo celou mapu za jedny dveře; a jsou to zároveň všechny starší
profily, kterým `seedGrade()` dal čtyřku. Pravidlo: skládá se jen tehdy, když
`TRACKS.some(tr => tr.grade === g)`. Pro čtyřku tedy mapa vypadá jako dnes,
bez dveří i bez milníku. Jakmile krok G přinese učivo čtvrtého ročníku,
začne se skládat i jí, a to je správně.

**Po rozbalení se nesmí ztratit místo, kde dítě bylo.** Rozbalení přidá
místa nad letošní blok, takže cesta vyroste směrem nahoru a pod prstem by se
objevilo něco jiného. Po `render()` se proto posune pohled na milník:
`go("map", {focus:"milestone"})`, `render()` už `view.focus` umí. Sbalení
totéž.

**Zásahy.** `viewMap()` (rozdělení `shown` na `past` a `own`, dveře, milník,
počítání `total` a `spots`), `yearOf()` nová, `BACK` nová proměnná vedle
`PEEK`, větev `back` v posluchači kliknutí (`BACK = BACK === p.id ? null :
p.id; render()`), `pick` a `gradeset` nulují i `BACK`. Styly `.place.backdoor`,
`.place.past`, `.milestone`. Texty `backTitle`, `backSub`, `backShow`,
`backHide`, `yearSign` ve třech jazycích.

**Testy.** `flow.test.js` dnes měří mapu třeťáka a druháka a čísla se hnou:
profil třetího ročníku má po složení **5** různých cest (`beyond`, `round`,
`a1000`, `mix`, `weak`; bylo 20) a **7** míst (5 tratí, dílna, dveře zpět;
bylo 21), po rozbalení **20** cest a **22** míst; druhák má složeno **13**
míst bez dveří dopředu (11 tratí, dílna, dveře zpět; bylo 18) a rozbaleno
**19**; prvňák zůstává na **8** a dveře zpět nemá. Nové kontroly: dveře zpět
existují od druhé třídy a ne v první; milník je vidět i se složenou mapou
a nese "3. třída"; rozbalení nic nezapíše do profilu; přepnutí hráče mapu
složí; profil ročníku 4 dveře nemá a vidí všechno. Po kroku B se čísla
třeťáka posunou o `chain`: 6 cest a 8 míst složeno, 21 a 23 rozbaleno.
`items.test.js`: okruh ročníků ověří `yearOf()` pro každou trať a každý
ročník, zejména že `mix`, `weak` a `school` jsou vždycky `"own"`.

**Dokumentace.** `PROJECT-STATE.md` oddíl 7d celý přepsat, oddíl 14 čísla
v kontrolním seznamu, oddíl 9 (opravené chyby) přidat odstavec "mapa
třeťáka byla pokračování prvních dvou tříd bez předělu".

Commit: `Fold the earlier years away so the map starts where the class is`.

### B0b. Za dveře patří jen to, k čemu se třída nevrací — HOTOVO 13. září 2026

Oprava kroku B0, přišla z hraní týž den. B0 použil na předěl `yearOf()`, které
se ptalo na `tr.grade`, tedy na rok, kdy se učivo **zavádí**, a schovalo tím
třeťákovi malou násobilku, stovku i hodiny. To je přesně to, čím třetí třída
začíná: sedmý díl Matýska má kapitolu 1 "Opakování, sčítání a odčítání do 100",
kapitoly 2 a 3 "Opakování, násobilka ..." a kapitolu 4 "Hodiny a určování
času". Hra vznikla kvůli tomu, že se třeťákům na začátku roku opakuje malá
násobilka, takže ji schovat za dveře je regrese, ne uklizení mapy.

Učivo má proto dvě čísla: `grade` je rok zavedení, nový nepovinný `thru` je
poslední ročník, ve kterém trať zůstává v hlavním bloku mapy (chybí-li, platí
`grade`). `yearOf()` se ptá na rozsah, na `thru` se neptá nic jiného;
`inGrade()`, `peekTracks()`, odemykání ani filtr heatmapy se nezměnily.
Hodnoty: `t1` až `t5` a `d1` `thru 4` (kapitoly 2 a 3 sedmého dílu a kapitola 5
prvního dílu čtvrtého ročníku, "Opakování, násobení a dělení"), `a100` a
`clock` `thru 3` (kapitoly 1 a 4 sedmého dílu; čtvrtý ročník opakuje tisícovku,
ne stovku), obory prvního ročníku `thru 2` (kapitola 1 čtvrtého dílu), `bridge`
beze změny, protože kapitola 10 třetího ročníku je přechod přes základ deset
v oboru do sta, tedy `a100`.

Proti zadání se upřesnilo tohle: `viewMap()` už se na `tr.grade` neptalo, dveře
i milník viselo na `past.length > 0`, takže tam stačil komentář; totéž
`gradeList(past)` u podtitulku dveří. Za to bylo potřeba přepsat druhákovu část
`flow.test.js`, protože **druhák teď dveře nemá vůbec** (celý první ročník
opakuje) a kontrola, že přepnutí hráče mapu složí, se musela přesunout na
třeťáka. `i18n.test.js` a `names.test.js` už nemusí před závodem otevírat dveře
do minulých let, protože první místo na mapě třeťáka je otevřená násobilka.
Kontrol ve `flow.test.js` je po tomhle kroku 175.

Čísla na mapě: třeťák má složeno 14 cest a 16 míst (bylo 6 a 8), rozbaleno
21 cest a 23 míst (stejně jako dřív, jen sedm z nich je za dveřmi místo
patnácti); druhák má 18 míst v jednom bloku bez dveří a bez milníku (bylo 13
složeno a 19 rozbaleno); prvňák a čtvrťák se nehnuli. Nová kontrola v okruhu 14
`items.test.js` hlídá, že hlavní blok mapy má pro každý ročník aspoň jednu
trať, kterou `unlockState()` hlásí jako otevřenou; třeťákovi to dnes dělá `t1`
a `clock`. R1 z oddílu 9 se nedělala a odemykání se nezměnilo ani o řádek.

Commit: `Keep the material the class is revising in front of the door`.

---

## Krok B. `chain_3`, trať `chain` — HOTOVO 13. září 2026

Proti plánu se upřesnilo tohle: dvě ze čtyř navržených palet se na obrázku
neosvědčily a musely se posunout, mokřad okruhu z `pal(160, 140, 60, "drop")`
na `pal(170, 150, 52, "drop")`, protože ve světlejší verzi vypadal jako
trať podle školy, a mělčina v hlubině z `{h2:130, l2:44}` na
`pal(188, 150, 62, "shell", {h2:158, l2:52, sat:38})`, protože zelené dno
vypadalo jako trávník pod vodou; stezka a obloha vyšly podle návrhu. `questionHTML()`
se kvůli B7 změnilo tak, že vrací **celý prvek `#qbox`** i s třídou délky, ne
jen jeho vnitřek, protože třída patří na něj a mezi otázkami se teď vyměňuje
přes `outerHTML`; délku měří nová `questionSize()` a platí pro všechny rodiny,
takže krok D už ji řešit nemusí. Hranice délky se přitom musely posunout:
počítá se řádek **včetně mezer** a prahy jsou 9 a 13 znaků, protože `47 + 5 - 3`
má bez mezer jen šest znaků, tedy přesně ten příklad, kvůli kterému celé B7
vzniklo, by se navrženým pravidlem nezmenšil. Na drawn řádku to vyjde nastejno:
`(300 + 60) : 4` z kroku D1 je pořád `q-xlong`, existující rodiny se nehnuly
kromě prvního stupně tisícovky (`300 + 200`), který je stejně široký jako
řetězec a zmenšit se měl taky. A `flow.test.js` posunula i mapa čtvrťáka,
která má o jedno místo víc, tedy 22; v oddílu 14 `PROJECT-STATE.md` to číslo
bylo, jen o něm plán nemluvil. Kontrol ve `flow.test.js` je po tomhle kroku 172.

Třetí položka vlny A, kapitola 11 třetího ročníku, sedmý díl, strany 28 a 29,
"Sčítání a odčítání více čísel". Řetězec tří členů se dvěma znaménky, například
`7 + 5 - 3`. Kbelíky podle oboru, hlavička klíče `q`, kbelíky číslované jako
u `beyond` a `round`. Jde přesně po kontrolním seznamu z `PROJECT-STATE.md`,
oddíl 14, s jednou věcí navíc, kterou seznam nezná: **otázka je delší než
všechno, co dnes hra kreslí, a musí se vejít na 375 px** (B7).

### B1. Kbelíky a generátor

```js
/* Three numbers and two signs, the first question with more than one
   step. The book takes it in the seventh part, still under a hundred,
   right after the buckets within a hundred, so the ranges follow those:
   within twenty, whole tens, and the mixed hundred. Every intermediate
   result stays inside the bucket's range and above zero, so the child
   never meets a negative number on the way to the answer. */
const Q_BUCKETS = [
  {id:"1", label:"three one digit numbers within twenty"},   // 7 + 5 - 3
  {id:"2", label:"whole tens within a hundred"},             // 30 + 40 - 20
  {id:"3", label:"two digit, one digit and tens within a hundred"}  // 47 + 5 - 3
];
const chainKeys = ids => ids.map(b => "q" + b);
```

`chainItem(key)` staví trojici konstrukcí rozsahů, nikdy ořezem, stejně jako
`thousandItem()`. Znaménka se losují ze čtyř vzorů `++`, `+-`, `-+`, `--`
rovnoměrně. Pro každý kbelík:

`q1`: první člen `ri(2,9)`; druhý člen tak, aby mezivýsledek ležel v 1 až 19
(u `+` je to `ri(1, min(9, 19 - a))`, u `-` `ri(1, a - 1)`); třetí člen tak,
aby výsledek ležel v 0 až 20 a člen byl 1 až 9. Přechod přes desítku je
dovolený, je to třetí třída. Pokud pro zvolený vzor nejde třetí člen vybrat
(například `2 - 1 - ?`), losuje se vzor znovu, nikdy se neořezává.

(Upřesnilo se: mezivýsledek `q1` vychází 1 až 18, ne 1 až 19, protože oba
první členy jsou jednociferné a druhý je nejvýš 9; kontrola na dvacítku v téhle
větvi byla mrtvá a je pryč. A "losuje se vzor znovu" je pojistka, ne provozní
cesta: rozsahy ve všech třech kbelících jsou vedené tak, aby se každý ze čtyř
vzorů vždycky dostavěl, protože přelosování posouvalo distribuci, `++` mělo
v `q2` o třetinu míň. Vyčerpaný strop losování je vyhozená výjimka, ne náhradní
příklad.)

`q2`: členy jsou celé desítky 10 až 90, mezivýsledek 10 až 100, výsledek 0 až
100.

`q3`: první člen dvojciferný a ne kulatý, 11 až 89; druhý a třetí člen je
jednociferné číslo 1 až 9 nebo celá desítka 10 až 50, aspoň jeden z nich
jednociferný, jinak by to byl `q2`; mezivýsledek i výsledek 0 až 100.

Položka: `{key, kind:"chain", text: a + " " + s1 + " " + b + " " + s2 + " " + c,
answer}`; `maxLen` zůstává výchozí 3, odpověď nepřeleze 100. Znaménko minus je
`-`, tedy hyphen-minus, jako u všech ostatních rodin; `items.test.js` zadání
vyhodnocuje přes `eval` a se třemi členy si poradí bez změny.

### B2. Zapojení do enginu

1. `FAMILY_HEADS = "pnckxoq"`.
2. `rawItem()`: `if(head === "q") return chainItem(key);` před nouzový návrat.
3. `poolKeys()`: `if(spec.chain) out.push(...chainKeys(spec.chain));`
4. `trackKeys()`: `if(tr.op === "chain") return chainKeys(Q_BUCKETS.map(b => b.id));`
5. `chainStage(p)` přes `stageIndex(p, i => chainKeys([Q_BUCKETS[i].id]), Q_BUCKETS.length)`.
6. `reachedKeys()`: větev `chain`, kbelíky 0 až `chainStage(p)`.
7. `buildRun()`: větev `chain` přes `focusAndReview(p, chainKeys([Q_BUCKETS[qi].id]), review, n, 2)`, tvar přesně jako `round`.
8. `TRACKS`: `{id:"chain", op:"chain", env:"marsh", grade:3}` **před** `beyond`,
   protože kapitola 11 je v knize před kapitolou 14 a cesta na mapě jde v pořadí
   učebnice. Pořadí třetího ročníku na mapě je tedy `chain`, `beyond`, `round`,
   `a1000`.
9. `unlockState()`: `case "chain": return (m("a100") >= .5 || many("a100"))
   ? {open:true} : {open:false, why: t("lockFinish", t("trk_a100"))};` Stojí na
   stovce jako zaokrouhlování, protože kapitola 11 následuje hned po kapitolách
   8 až 10, které jsou `as100`.
10. `thresholds()`: `item.kind === "chain" ? 2.0`, dvě operace místo jedné.
    Komentář k tomu do kódu, je to místo, na které se zapomíná potichu.
11. `heatSpecs()`: `push("chain", heatStrip(t("trk_chain"), 3, Q_BUCKETS.map(b =>
    ({label: Q_EX[b.id], keys:["q" + b.id], tip: Q_EX[b.id]}))))` hned za
    blokem `a100`, protože je to učivo do sta. `Q_EX = {"1":"7+5-3",
    "2":"30+40-20", "3":"47+5-3"}` vedle `O_EX`.

### B3. Prostředí ve čtyřech světech

Nová trať potřebuje čtyři palety, `items.test.js` hlídá, že každý svět má pro
každou trať vlastní prostředí a že žádná paleta nezůstala nepoužitá, takže se
počet palet posune z 84 na 88.

Okruh: `marsh: pal(160, 140, 60, "drop")`, mokřad, modrozelená, kterou žádné
z patnácti ručních prostředí okruhu ani pobřeží prvního ročníku nemá. Stezka:
`tr_reeds: pal(150, 130, 58, "leaf")`. Obloha: `sk_haze: pal(204, 170, 60,
"drop", {h2:160, l2:82})`, horní konec zůstává v modrých, viz pravidlo
v `PROJECT-STATE.md`, oddíl 7c. Hlubina: `dp_shoal: pal(188, 120, 60, "shell",
{h2:130, l2:44})`. Do `WORLDS` přidat `chain:` do všech tří map.

**Všechny čtyři si vyrenderuj a podívej se na ně**, postup je v
`PROJECT-STATE.md`, oddíl 2. Odstíny nahoře jsou návrh, který má vyjít, ale
hnědá obloha a rudé moře se poznaly až na obrázku.

### B4. Kurikulum a texty

`src/curricula.js`: kapitola 11 třetího ročníku dostane
`pool:{chain:["1","2","3"]}` a do hlavičkového komentáře přibude řádek
`chain [bucket ids]`. Kapitola 12, opakování, `chain` nedostává, mapa ji
u ní neuvádí.

`src/i18n.js`, ve všech třech jazycích: `trk_chain` a `trk_chains`. Návrh:
cs "Řetězec" / "tři čísla za sebou, plus a minus", en "Chains" / "three
numbers in a row, plus and minus", de "Kettenrechnen" / "drei Zahlen
hintereinander, plus und minus". Žádný `ask` není potřeba, je to rovnice.

### B5. Testy

`tests/items.test.js`: do `module.exports` přidat `Q_BUCKETS`, `chainKeys`,
`chainStage`; do `RANGE` řádek `q:[0,100]`; klíče `chainKeys(...)` do seznamu
`keys` i do množiny `VALID`; nový okruh "řetězce", který pro každý kbelík
vygeneruje tři sta položek a ověří: text má právě dva operátory; v `q1` jsou
všechny členy 1 až 9 a mezivýsledek 1 až 19; v `q2` je každý člen násobek
deseti; v `q3` je první člen dvojciferný a ne kulatý a aspoň jeden další člen
jednociferný; mezivýsledek nikdy neklesne pod nulu; přes vzorek se objeví
všechny čtyři vzory znamének; `chainStage()` na čerstvém profilu vrací 0 a po
zvládnutí prvního kbelíku 1, stejně jako okruh pro `round`.

`tests/flow.test.js`, čísla natvrdo, už po kroku B0: složená mapa třeťáka má
**6** různých cest a **8** míst (bylo 5 a 7), rozbalená **21** a **23** (bylo
20 a 22); zamčených kapitol třetí třídy **14 z 33** (bylo 15). Beze změny
zůstává délka mapy prvňáka 8, ukázka druhého ročníku 10 tratí a mapa druháka
13 složená a 19 rozbalená, protože `chain` je třetí ročník.

`tests/migration.test.js`: datový model se nemění, fixture není nutná. Přesto
přidej případ `v8-pred-retezcem`: profil třetího ročníku se stovkou pod 0,5
a `expectClosed:["chain"]`, ať se nová trať starším profilům sama neotevře
bez zásluhy, přesně jako to hlídá `v3` u `beyond`.

### B6. Dokumentace

`PROJECT-STATE.md`: oddíl 5 tabulka tratí a seznam klíčů (`q{bucket}`
řetězec), hlavička úvodu (22 tratí, 88 palet, 80 kapitol z 95, třetí ročník
19/33), oddíl 12 tabulka (řádek `chain_3` pryč, věta o hotových), oddíl 14
čísla v kontrolním seznamu (6 a 8 složeno, 21 a 23 rozbaleno, 14 zamčených). `docs/kurikulum/TEMATA.md`: `chain_3`
na `hotovo`. `docs/kurikulum/nns-matysek-3.md`: odstavec "Co z toho hra umí
dnes" a seznam zamčených kapitol bez 11. `README.md` a `README.cs.md`: pokud
uvádějí počet tratí nebo kapitol, posunout.

### B7. Dlouhá otázka se musí vejít

`.question` má `font-size:clamp(38px,12vw,54px)` a řádek `47 + 5 - 3 = [?]`
při 45 px na 375 px širokém telefonu měří zhruba 400 px, takže přeteče. Totéž
čeká `order_of_ops` s `(12 + 8) × 3`, který je ještě delší. Řešení je na dvou
místech a dělá se tady, protože tady je první rodina, která to potřebuje:

`questionHTML()` doplní na `.question` třídu podle délky zadání. Vykresluje se do
`#qbox`, takže třída se přidává na něj, ne na vnitřní `span`. (Při
implementaci se ukázalo, že se musí počítat i mezery, viz poznámka HOTOVO
nahoře: prahy jsou 9 a 13 znaků včetně mezer, ne 7 a 11 bez nich.)

`styles.css`: `.question{flex-wrap:wrap;justify-content:center;row-gap:6px}`,
aby `= [?]` směl spadnout na druhý řádek, a `.question.q-long{font-size:
clamp(30px,8.6vw,44px)}`, `.question.q-xlong{font-size:clamp(24px,6.6vw,36px)}`.
Krok C tyhle hodnoty ještě vynásobí ročníkovým měřítkem, takže je piš jako
základ, ne jako konečnou velikost.

Test do `items.test.js`: `questionHTML(itemFromKey("q3"))` obsahuje `q-long`
a `questionHTML(itemFromKey("m7x8"))` neobsahuje ani jednu z tříd.

Commit: `Teach the racer to add and take away in one breath`, nebo něco
v tom duchu.

---

## Krok C. Responzivita a písmo podle ročníku — HOTOVO 13. září 2026

**Stav: celý krok je hotový, ve třech commitech; třetí jsou opravy po
kontrole, viz C8 na konci oddílu, a patří k nim i to, že se výška karty na
mapě od té chvíle počítá, a ne odhaduje. První: C1, C2, C3 a C5 i se
společnou částí níže, tedy `layoutClass()`, `data-w` a `data-o` na `<html>`,
`--appw` a třída `narrow`. Druhý: C4 a C7, tedy `--tx` s `data-grade` na
`<html>` a šestý testový soubor `tests/style.test.js`. Rozvržení samo se
v prohlížeči prohlíží podle seznamu rozměrů v C7.**

Cíl: hra funguje na telefonu i tabletu, na výšku i na šířku, využívá plochu
a písmo roste s tím, jak malé je dítě. Nic z toho nesahá na mechaniku ani na
datový model. Sahá to do `styles.css` hodně, do `app.js` na čtyřech místech
(`render()`, `viewMap()` a `worldSpots()`, `viewJob()`, posluchač `resize`) a
do `manifest.webmanifest` jednou.

Co bylo vidět na obrazovkách, je v oddílu 0. Rozhodnutí, která z toho plynou:

**Rozvržení řídí dvě osy, šířka a orientace, a rozhoduje o nich JS, ne media
query.** Důvod: mapa se skládá v JS a musí vědět, kolik sloupců má, a několik
pravidel by potřebovalo `or` v media query, které starší Android nemá.
`layoutClass()` spočítá z `innerWidth` a `innerHeight` dvě hodnoty a zapíše je
na `<html>`: `data-w` je `phone` pod 600 px, `tablet` od 600 do 899, `desk`
od 900; `data-o` je `wide`, když je okno na šířku a `innerWidth >= 640`, jinak
`tall`. Volá se při startu před prvním `go()`, v `resize` a v
`orientationchange`. CSS pak píše `html[data-o="wide"] .game{...}`.

V jsdom je okno 1024 × 768, tedy `desk` a `wide`, a testy dnes simulují
telefon jen přes `clientWidth` 375. Aby dál testovaly telefon, nastaví
`flow.test.js` i `migration.test.js` v `beforeParse` také
`Object.defineProperty(win, "innerWidth", {value:375})` a `innerHeight` 812;
`items.test.js` má `window` zaslepené a přidá `innerWidth` a `innerHeight`
do své náhražky. Jedna kontrola ve `flow.test.js` pak vědomě přepne na
1024 × 768 (přepsat vlastnosti a zavolat `resize`) a ověří, že mapa dostala
`data-cols="4"` a `<html>` `data-o="wide"`.

Zásahy v `app.js` za celý krok C: `layoutClass()` nová, volaná při startu,
v `resize` a `orientationchange`; `render()` zapisuje `data-grade` (C4);
`viewMap()` počítá `cols` a předává ho `worldSpots()` (C3); `viewJob()` dává
obalu tlačítka třídu `jobgo` (C2); posluchač `resize` překresluje mapu (C3);
`viewPlayers()`, `viewResult()`, `viewJobDone()`, `viewTokens()`, `viewGate()`,
`viewSetPin()` a `viewParent()` dostanou na `.scr` třídu `narrow`.

**Šířka aplikace.** `#app{max-width:var(--appw)}` s `--appw:520px` pro
`phone`, `720px` pro `tablet` na výšku a `none` pro `wide`. Obrazovky, které
jsou text a seznam, tedy hráči, výsledek, výsledek zakázky, poklady, brána,
kód, rodičovská sekce, dostanou na `.scr` třídu `narrow` a pravidlo
`.scr.narrow .scr-scroll{width:100%;max-width:760px;margin:0 auto}`, ať se
řádky textu na tabletu netáhnou přes celou šířku. Mapa, závod, dílna a garáž
zůstávají široké, protože právě ty plochu potřebují.

### C1. Závodní obrazovka na šířku — HOTOVO 13. září 2026

Proti plánu se upřesnilo jen tohle: `sceneSVG()` už `preserveAspectRatio
="xMidYMid meet"` mělo, takže se nic měnit nemuselo, a na obrázku je vidět, že
tečky spočítané stejně jako `fitBox()` sedí na cestě ve všech čtyřech světech
i v boxu 470 × 330. Navíc `.keypad` dostala pravidlo pro tablet na výšku
(z C5), aby se klávesy nenafoukly na 160 px.

Dnes: `.game` je sloupec scéna, lišta, otázka, klávesnice. Na šířku se sloupec
nevejde a `.qzone` s `flex:1;min-height:0` se stlačí na nulu.

Nově pro `html[data-o="wide"]`:

```css
html[data-o="wide"] .game{
  display:grid;
  grid-template-columns:minmax(0,46fr) minmax(0,54fr);
  grid-template-rows:auto minmax(0,1fr) auto;
  grid-template-areas:"stage qzone" "stage keypad" "rail keypad";
}
html[data-o="wide"] .stage{grid-area:stage;aspect-ratio:auto;max-height:none;height:100%;min-height:0}
html[data-o="wide"] .rail{grid-area:rail}
html[data-o="wide"] .qzone{grid-area:qzone;padding:10px 14px 4px}
html[data-o="wide"] .keypad{grid-area:keypad;grid-template-rows:repeat(4,minmax(40px,1fr));min-height:0;align-self:stretch}
html[data-o="wide"] .key{height:auto;min-height:40px}
```

Scéna vlevo přes celou výšku, pod ní lišta s body; vpravo otázka a pod ní
klávesnice, která vyplní zbytek výšky. `sceneSVG()` má `preserveAspectRatio
="xMidYMid meet"` a `fitBox()` počítá polohu auta z `clientWidth` a
`clientHeight` scény, takže v jiném než 400 : 205 boxu auto sedí na cestě
i teď; po stranách zůstane barva `#0d1428`, což je barva noci závodu a nevadí.
`slice` místo `meet` nepoužívat, `fitBox()` počítá s `min` obou měřítek.

Na výšku se nemění nic kromě stropu scény: `max-height:46vh` zůstává, ale
`@media (max-height:660px)` dostane `max-height:36vh` místo pevné výšky
(viz A6).

### C2. Dílna na šířku — HOTOVO 13. září 2026

Proti plánu se upřesnilo, že třídu `jobgo` nese existující obal `.pad`
s tlačítkem, takže do `viewJob()` nepřibyl žádný prvek navíc.

`viewJob()` skládá do `.scr-scroll` sedm sourozenců: `.jobask`, `.jobpicbox`
(jen u počítání), `.revealbox`, `.counter`, `.jobhint`, `.tray` a `.pad`
s tlačítkem. Obalu tlačítka dát třídu `jobgo`, ať jde adresovat. Pro `wide`:

```css
html[data-o="wide"] .shop .scr-scroll{
  display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  grid-template-rows:auto auto minmax(0,1fr) auto;column-gap:12px;
  grid-template-areas:"ask counter" "pic hint" "reveal tray" "reveal go";
  align-content:start;
}
.jobask{grid-area:ask} .jobpicbox{grid-area:pic} .revealbox{grid-area:reveal}
.counter{grid-area:counter} .jobhint{grid-area:hint} .tray{grid-area:tray} .jobgo{grid-area:go}
```

Vlevo zadání, obrázek k počítání a kruhové okno; vpravo pult, nápověda, mince
a Hotovo. Chybějící `.jobpicbox` nechá oblast `pic` prázdnou, mřížka se tím
nerozpadne. `.tray.one` (jeden velký dílek) má `padding:10px 26%`, na šířku
zmenšit na `10px 18%`.

### C3. Mapa podle šířky — HOTOVO 13. září 2026 (R6 podle doporučení)

Proti plánu se upřesnily tři věci. Wobble `rnd() * 3` by u posledního sloupce
vyjel na 101 %, takže od tří sloupců je wobble 0,5 až 2,5 a mezi sloupci zbývá
procento; dva sloupce mají wobble beze změny a vracejí přesně dnešní polohy.
`cols` je čtvrtý parametr `worldSpots()`, ne třetí, protože `gapAt` už tam byl.
A **letošek začíná od tří sloupců vlastním řádkem** (`pad` v `worldSpots()`),
protože mezi dvěma kartami v jednom řádku nemá milník kam stoupnout a sedl by
si na ně; bylo to vidět až na vyrenderované geometrii, ne v testu. Výška mapy
se počítá z nejnižší karty, ne ze vzorce s `PLACE_STEP`. (Vzorec
`placeHeight(widthPx) = widthPx * 205 / 400 + 92` a obě konstanty `PLACE_H`
a `PLACE_STEP` níže platily jen do C8; text pod náhledem není 92 px a s
měřítkem roste, takže se karty překrývaly. Dnešní podobu popisuje C8.)

Dnes dva sloupce, místo 44 % široké s `max-width:205px`, sousedi po 96 px,
karta 172 px vysoká, spočítané pro 375 px. Na tabletu tím vznikne úzký had
s malými kartami.

`worldSpots(p, n)` dostane třetí parametr `cols`, který `viewMap()` spočítá:
`2` pro `phone`, `3` pro `tablet`, `4` pro `desk`. Pro `cols === 2` musí
funkce vracet **přesně dnešní polohy**, byte po bytu, aby se nehnul `flow.test.js`
ani vzhled na telefonu. Pro `cols >= 3` se jede po řádcích hadovitě: řádek
`r = floor(i / cols)`, sloupec `c = i % cols` a v lichých řádcích `cols - 1 - c`,
takže cesta jde zleva doprava a zpátky; `left = c * (100 / cols) + 1 + wobble`,
šířka místa `(100 / cols - 3)` procent, `y = 14 + r * (PLACE_H + 22)`. `PLACE_H`
už nemůže být konstanta, protože náhled má poměr 400 : 205 a s širší kartou
roste: `placeHeight(widthPx) = widthPx * 205 / 400 + 92`, kde 92 je změřená
výška textu pod náhledem; šířka v pixelech je `(app.clientWidth || 375) *
šířka v procentech / 100`. Cesta `worldRoad()` bere středy míst v pořadí a
funguje beze změny, protože nezná sloupce. Šířku místa nastavuje CSS podle
`data-cols` na `.world`: `.world[data-cols="3"] .place{width:30.3%;max-width:none}`,
`.world[data-cols="4"] .place{width:22%;max-width:none}`. Dnešní `max-width:205px`
zůstává jen pro dva sloupce.

Změna orientace nebo šířky za běhu: posluchač `resize` už existuje pro závod,
přidat `if(view.name === "map") render();` s debounce 150 ms; mapa se překreslí
do správného počtu sloupců a scroll se vrátí nahoru, což je při otočení
tabletu přijatelné.

Test do `items.test.js`: pro `cols` 2, 3 a 4 a `n` 8 až 24 spočítat obdélníky
míst (`left`, šířka, `y`, `PLACE_H`) a ověřit, že se žádné dva neprotínají
a že žádné nevyjede přes 100 % šířky; pro `cols === 2` navíc porovnat výstup
s dnešními hodnotami, které si test zapíše před změnou (osm míst, zaokrouhleno
na desetiny).

### C4. Písmo podle ročníku — HOTOVO 13. září 2026 (R5 podle doporučení)

Proti plánu se upřesnila jedna hodnota a dvě barvy. `.stat .l` má základ 12,5 px,
ne 12: tabulka u něj psala 12, ale pravidlo "žádný dětský text pod 12,5 px" je
nadřazené a jinak by test z C7 musel mít pro jediný řádek výjimku. A protože
`--ink-faint` se na dětský text přestal používat, přešly do `--ink-soft` vedle
`.place .tokc` i `.tokn` a `.counter-empty`, což jsou zbylá dvě dětská místa,
která v té barvě stála; `.tiny` a `.legend` v rodičovské sekci zůstaly. Výška
`.answerbox` a velikosti `.key.act` a `.key.del` se nenásobí, v tabulce nejsou.
Pozor na `.muted`: selektor z tabulky je `.scr:not(.narrow) .muted`, takže na
výsledku, výsledku zakázky a pokladech, které jsou `narrow`, zůstává 13,5 px
bez měřítka; kdyby to dítěti vadilo, je to jeden selektor.

Princip: jedno měřítko `--tx` na `<html>`, které násobí každou velikost písma
v dětské části. Rodičovská část zůstává na 1. `render()` po `applyLang()`
zapíše `document.documentElement.dataset.grade = parentView ? "" : gradeOf(p)`
(prázdné i bez profilu). Na `<html>`, ne na `#app`, protože spodní listy
`.sheet` se připínají na `body` a z `#app` by měřítko nezdědily.

```css
html{--tx:1}
html[data-grade="1"]{--tx:1.25}
html[data-grade="2"]{--tx:1.12}
html[data-grade="3"]{--tx:1.04}
html[data-grade="4"]{--tx:1}
```

Každá dětská velikost se přepíše na `calc(Zpx * var(--tx))`; u `clamp` je to
`calc(var(--tx) * clamp(a, b, c))`. Zároveň se zvednou základy, které jsou
dnes pod hranicí čitelnosti pro děti; pravidlo je **žádný dětský text pod
12,5 px základu**, což je při 1,25 zhruba 15,6 px pro prvňáka. Tabulka změn,
základ je hodnota pro `--tx:1`:

| selektor | dnes | základ nově |
| --- | --- | --- |
| `.topbar h1` | 20 | 20 |
| `.chip` | 14 | 14 |
| `.place .nm` | 15, jeden řádek s výpustkou | 16, až dva řádky (`-webkit-line-clamp:2`, bez `nowrap`) |
| `.place .sub`, `.place.locked .lockmsg` | 11 | 12,5 |
| `.place .foot`, `.place .tokc` | 12, 11 | 13, 12,5; `.tokc` barvou `--ink-soft` místo `--ink-faint` |
| `.question` | clamp(38, 12vw, 54) | násobit `--tx`, viz B7 pro dlouhé |
| `.answerbox` | 40, min-width 104 | násobit obě |
| `.key` | 26, výška clamp(50, 8.6vh, 64) | 26 násobit, `min-height:calc(50px * var(--tx))` |
| `.hintline`, `.hintline b` | 14, 19 | 15, 20 |
| `.result h2`, `.stat .v`, `.stat .l`, `.factchip` | 28, 23, 11, 15 | 28, 23, 12, 15 |
| `.muted` v dětských obrazovkách | 13,5 | 14 (`.scr:not(.narrow) .muted`) |
| `.jobask` | clamp(19, 5.4vw, 24) | násobit |
| `.jobhint`, `.jobhint b`, `.counter-empty`, `.counter-sum` | 13,5, 17, 13,5, 22 | 14,5, 18, 14,5, 22 |
| `.job .nm`, `.job .sub`, `.atschool` | 18, 12,5, 11 | 18, 13, 12,5 |
| `.pickitem .nm`, `.pickworld .nm`, `.pickworld .sub`, `.item .nm` | 11,5, 16, 11,5, 11,5 | 12,5, 16, 12,5, 12,5 |
| `.h3`, `.tokn`, `.toknew` na Pokladech a výsledku | 13, 11 | 14, 12,5 |
| `.btn` | 17 | 17 |
| `.sheet h3`, `.field`, `.tiny` | 21, 17, 12 | 21, 17, 12,5 |

`.tiny` (velkými písmeny) a `.legend` v rodičovské sekci se nemění. Barva
`--ink-faint` (#8a97b5) má na `--shell` kontrast zhruba 2,6 : 1 a na dětský
text se přestane používat; pro dekoraci (tečky, rámečky) zůstává.

Kontrola po zásahu: na 375 px širokém telefonu s `--tx:1.25` se mapa prvňáka
(osm míst) musí vejít bez vodorovného posuvu a názvy míst se nesmí uříznout
("Počítání dílků", "Do patnácti"); klávesnice nesmí vytlačit otázku z obrazovky
při 640 px výšky. Obojí se kontroluje na obrázku, ne v jsdom.

### C5. Drobnosti, které patří k témuž — HOTOVO 13. září 2026

Proti plánu se upřesnilo, že pravidlo pro klávesnici na tabletu na výšku je
`html[data-w="tablet"][data-o="tall"]`, tedy vázané na obě osy, jinak by
platilo i na tabletu na šířku, kde klávesnice vyplňuje vlastní sloupec.

`.grid` v garáži: `grid-template-columns:repeat(auto-fill,minmax(104px,1fr))`
místo pevných tří sloupců, s `max-width:1000px;margin:0 auto`. `.jobs` na
`wide`: dva sloupce. `.sheet` na `wide`: `align-items:center` a `.inner`
s `border-radius:var(--r-xl)` na všech rozích, tedy dialog uprostřed místo
listu odspodu; `.pickscroll{max-height:42vh}`. `.keypad` na `tablet` na výšku:
`max-width:480px;margin:0 auto;width:100%`, aby klávesy nebyly 160 × 64.
`.hud` na `wide` bez zalomení.

`manifest.webmanifest`: `"orientation": "any"`. Bez toho se instalovaná hra na
tabletu neotočí a celý krok by na tabletu nebyl vidět.

### C6. Co se nemění

Nedotknutelné principy se rozvržením nedotknou. Číselná klávesnice zůstává
jediným vstupem závodu. Dílna nedostává žádný prvek, který by se hýbal nebo
odpočítával. Mapa zůstává klepnutím rovnou na trať. `.place.locked` zůstává
`div`, ne tlačítko. Focus ring `button:focus-visible` zůstává.

### C7. Testy — HOTOVO 13. září 2026

Proti plánu se upřesnilo, že kontrola mrtvých selektorů musí hledat `.runner`
a `.ghost` jen jako samostatnou třídu, jinak by ji shodilo živé `.btn.ghost`,
a že `style.test.js` kromě velikostí ověřuje i to, že každá dětská velikost
opravdu násobí `--tx` a že pět řádků s `--tx` stojí na jednom místě; bez toho
by seznam hlídal jen čísla, ne princip. Kontroly `data-cols` a `jobgo` ve
`flow.test.js` přibyly už v prvním commitu kroku C, přidaly se tedy jen tři na
`data-grade`, celkem 184 kontrol.

jsdom nemá layout, takže rozvržení se ověřuje na obrázcích a pravidla se
hlídají textově. Nový soubor `tests/style.test.js`, čistý node bez jsdom, čte
`src/styles.css`, `src/index.template.html` a `manifest.webmanifest` a hlídá:
`min-height:100vh` stojí před `min-height:100dvh`; `.sheet .inner` má
`max-height`; manifest má `orientation` `any`; existují pravidla
`html[data-grade="1"]` až `"4"` a `html[data-o="wide"] .game`; v CSS není
selektor `.runner` ani `.ghost`; žádné `font-size` v dětských selektorech ze
seznamu v C4 není pod 12,5 px základu (test si seznam selektorů nese sám).
Přidat do `tests/README.md`.

Do `flow.test.js`: po založení prvňáka je `document.documentElement.dataset.grade
=== "1"`, v rodičovské sekci je prázdný, po přepnutí na profil čtvrtého
ročníku je `"4"`; `.world` má `data-cols`; v dílně má obal tlačítka třídu
`jobgo`.

**Obrázky.** Před commitem vyrenderovat a prohlédnout aspoň: mapu, závod,
dílnu se zakázkou `money` a výsledek na 375 × 812, 812 × 375, 768 × 1024
a 1024 × 768, k tomu mapu prvňáka na 375 × 812 a závod na 360 × 640. Sandbox
Cowork nemá prohlížeč s rozvržením; cesty jsou dvě: uživatel pushne a obrazovky
se prohlédnou na GitHub Pages ve vestavěném prohlížeči s emulací rozměrů, nebo
se `dist/artifact.html` nahraje do existujícího artefaktu na claude.ai, který
k tomu slouží. Kterou cestu, říká uživatel.

Krok C je velký; dělit na dva commity je rozumné: C1 až C3 a C5
(`Let the game use the whole screen, on its side and on a tablet`), C4 a C7
(`Give the youngest readers bigger letters`).

### C8. Co našla kontrola kroku C a jak se to spravilo — HOTOVO 13. září 2026

Kontrolní subagent nad oběma commity našel devět věcí, tři z nich blokující.
Spraveno třetím commitem kroku C (`Keep the map cards clear of one another
whatever the letters do`).

**Karty na mapě se překrývaly.** `placeHeight()` počítala text pod náhledem
jako pevných 92 px, jenže od C4 smí mít název dva řádky a všechny velikosti
násobí `--tx`, které JS vůbec neznal. Naměřeno před opravou: telefon 375 px,
karta 200 px (prvňák 226) proti rozestupu 192; tablet 768 px karta 238 (263)
proti 233; desk 1024 px karta 236 (260) proti 230; telefon na boku 812 px
karta 245 (270) proti 240. Překryv 5 až 30 px, na každém rozměru a v každém
ročníku. Nově `placeHeight(šířkaPx, tx)` sčítá kartu z hodnot v `styles.css`:
odsazení a rámeček, náhled v poměru 400 : 205, mezery mezi dětmi prvku a
řádky textu při nejhorším případu, tedy dvouřádkovém názvu i podtitulku.
Bere největší ze čtyř tvarů karty (trať s pruhem, zamčená, dveře, trať bez
pruhu), takže je rozestup v celé mapě stejný. Měřítko zná JS z tabulky
`TX_BY_GRADE` v `app.js`, která je opisem pěti řádků s `--tx`; `style.test.js`
hlídá, že se obě kopie shodují, takže R5 platí dál a ladí se v CSS.
Dvousloupcová mapa si nechala vodorovné polohy byte po bytu (R6), svislý krok
se zvětšit musel: karta je vyšší než dvojnásobek starých 96 px, a tohle byla
právě ta chyba. `.place.locked .lockmsg` dostala `-webkit-line-clamp:2` jako
název a podtitulek, jinak by výška karty nebyla předvídatelná vůbec.

**Test kolizi nechytal.** Okruh 15 v `items.test.js` měřil obdélníky toutéž
výškou, ze které se odvozuje rozestup, takže "neprotnou se" platilo
z definice. Nově si výšku počítá sám z `src/styles.css` (řádkování, počty
řádků, náhled, odsazení), pro obě měřítka, pro dva, tři i čtyři sloupce,
pro devět šířek okna, pro nejdelší skutečná jména tratí ve všech třech
jazycích a pro všechny čtyři tvary karty. Ověřeno, že spadne, když se vrátí
starý vzorec i když se hne řádkování nebo zmizí clamp v CSS.

**Na nízkém displeji se ořízla otázka.** Na 360 × 640 zvedla podlaha klávesy
`calc(50px * var(--tx))` klávesnici prvňáka z 266 na 296 px a na `.qzone`
zbylo 122 px proti potřebným 124 až 137. Uděláno obojí, co kontrola nabízela:
`.qzone` je teď rolovatelná (`overflow-y:auto` a `justify-content:safe center`,
které starší prohlížeč zahodí a zůstane mu dnešní `center`), což je pojistka,
aby se nikdy nic neuřízlo, a na nízkém displeji roste podlaha klávesy
z nižšího základu, `@media (max-height:660px){.key{min-height:calc(44px *
var(--tx))}}`, takže prvňák má klávesnici vysokou jako všichni ostatní
(266 px) a na otázku zbude 146 px. Rolování je záchranná síť, nižší základ je
to, proč po ní není potřeba sahat: k otázce, ke které se musí rolovat, má
šestileté dítě skoro stejně daleko jako k uříznuté.

**C1 a C4 si odporovaly u klávesnice na šířku** a rozhodlo se ve prospěch
dítěte: `html[data-o="wide"] .key{min-height:40px}` přebíjelo podlahu podle
ročníku, takže prvňák měl na šířku klávesu 40 px s číslicí 32,5 px. Nově
`calc(38px * var(--tx))`, a totéž v `minmax()` řádků mřížky. Základ je 38, ne
50: na 640 × 360 zabere otázka 117 px a čtyři řady podle svislé podlahy by
potřebovaly o 10 px víc, než zbývá. Řádky jsou `1fr`, takže podlaha rozhoduje
jen o tom, jak malá klávesa smí být, ne jak velká bude.

Ostatní nálezy: `placeBox()` počítá šířku z `.world`, tedy `#app` mínus 28 px,
a když není co změřit, vezme šířku okna, která může být jen větší než `#app`,
takže krok vyjde s přebytkem vzduchu, nikdy s nedostatkem. Výška mapy se
počítá ze stejné výšky karty jako rozestup. `.place .nm` a `.sub` mají zpátky
`text-overflow:ellipsis` a k tomu `overflow-wrap:break-word`, aby se dlouhé
slovo zalomilo místo uříznutí. Velikosti, které princip "žádný dětský text
pod 12,5 px a všechno násobí `--tx`" míjely, ho dodržují: `.item .lvl` (10),
`.rail .lap` (11), `.rail .gap` (12) a `.gamebar .cnt` (13) mají základ
12,5 a 13, `.milestone`, `.rail .num`, `.h2`, `.finbadge`, `.combo` a
`.floaty` měřítko násobí. Kontrola ve `style.test.js` se obrátila: projde
**všechny** `font-size` v souboru a `var(--ink-faint)` a vyžaduje, aby každý
výskyt buď násobil `--tx`, nebo stál na krátkém seznamu výslovných výjimek,
což jsou rodičovské obrazovky (včetně výběru hráče, který je v `PARENT_VIEWS`)
a znaky, které nejsou text, tedy ikony, emoji a fajfka s gumou na klávesnici.
`layoutClass()` se při `innerWidth` 0 zeptá dokumentu, než sáhne po 375.
`html[data-grade="5"]{--tx:1}` je v CSS i v `TX_BY_GRADE` předem, ať krok G
nespustí pátý ročník s tichým pádem na 1. Rozvržení řádků klávesnice na šířku
přešlo z `.keypad` na `.keypad-pad`, jak říká PROJECT-STATE, oddíl 7.

---

## Krok D. Zbytek vlny A, rodiny na klávesnici

Čtyři položky, každá vlastní session, pořadí podle `PROJECT-STATE.md`, oddíl
12b. Každá jde po kontrolním seznamu z oddílu 14 plus B7 (délka otázky) a
C4 (velikosti jsou už násobené). Tady jsou jen rozhodnutí, která seznam
nepokrývá.

### D1. `order_of_ops`, hlavička `z`, trať `ops`, kapitoly 13 a 30

Čtyři kbelíky, číslované: `z1` bez závorek do sta (`4 + 3 × 5`, `20 - 12 : 4`,
`6 × 7 - 2`), `z2` se závorkami do sta (`(4 + 3) × 5`, `(20 - 8) : 4`), `z3`
bez závorek do tisíce (`300 + 7 × 8`, `500 - 60 : 3`), `z4` se závorkami do
tisíce. Násobení a dělení jen v oboru malé násobilky, dělení vždycky beze
zbytku, konstrukcí. Sčítanec nebo menšenec se volí tak, aby výsledek padl do
oboru kbelíku a nikdy pod nulu. Kapitola 13 dostane `ops:["1","2"]`, kapitola
30 `ops:["1","2","3","4"]`. Text používá `×` a `:` jako ostatní rodiny a
kulaté závorky; `items.test.js` vyhodnocuje přes `eval` po náhradě `×` a `:`,
závorky mu nevadí, ale zkontroluj, že `RANGE.z` je `[0,1000]` a `maxLen: 4`
na položce u `z3` a `z4`. Násobitel prahů 2,4. Trať `ops`, `grade:3`, za
`chain` na mapě, otevírá se od `t5` (`m("t5") >= .6`), protože bez celé
násobilky se to počítat nedá. Prostředí ve čtyřech světech, blok
v `heatSpecs()` se čtyřmi dlaždicemi `Z_EX = {"1":"4+3×5", "2":"(4+3)×5",
"3":"300+7×8", "4":"(300+60):4"}`. Otázka `(300 + 60) : 4` má 11 znaků bez
mezer, tedy `q-xlong`; ověř, že se vejde na 360 px při `--tx:1.04`.

### D2. `mult_div_10_100` a `mult_round`, hlavička `g`, trať `tens`, kapitola 28

Konvence jako `beyond`: `g` plus `m` nebo `d` plus číslo kbelíku. `gm1`
násobení deseti a stem (`7 × 10`, `4 × 100`, `23 × 10`, součin do tisíce),
`gd1` dělení deseti a stem (`70 : 10`, `400 : 100`, `230 : 10`), `gm2`
násobení číslem končícím nulou (`3 × 40`, `20 × 4`, `6 × 70`), `gd2` dělení
takového čísla (`120 : 40`, `120 : 3`, `280 : 7`). Součin vždy do tisíce
konstrukcí. Kapitola 28 dostane `multTens:["1","2"], divTens:["1","2"]`, dvě
pole ze stejného důvodu jako `multBeyond` a `divBeyond`. Násobitel prahů 1,8,
je to spíš pravidlo než počítání. `RANGE.g` `[1,1000]`, `maxLen: 4`. Trať
`tens`, `grade:3`, za `beyond`, otevírá se od `beyond` (`m("beyond") >= .5`).
Heatmapa: čtyři dlaždice, `G_EX = {"m1":"7×10", "d1":"70:10", "m2":"3×40",
"d2":"120:40"}`.

### D3. `unit_convert` a `time_convert`, hlavička `u`, trať `units`, kapitoly 18 a 29

Tady je první otázka, která má u odpovědi **jednotku**, a proto potřebuje
jeden nový údaj na položce a jednu úpravu `questionHTML()`. Položka nese
`text: "3 m"`, `unit: "cm"`, `ask: "unitAskCm"` a odpověď `300`; `questionHTML()`
za `#abox` vykreslí `<span class="unit">cm</span>`, když položka `unit` má.
`rightAnswerText()` přidá jednotku za číslo. `items.test.js` u textu bez
operátoru vyžaduje `svg` nebo `ask`, což tady sedí, ale test na řádku
`if(/[+\-×:]/.test(it.text))` musí ignorovat mezeru mezi číslem a jednotkou
(dnes ji nepotká, protože žádná rodina jednotku nemá).

Kbelíky: `u1` délka (`1 m = 100 cm`, `1 km = 1000 m`, `1 dm = 10 cm`, `1 cm =
10 mm`, oběma směry, převáděná hodnota tak, aby odpověď byla celé číslo do
tisíce), `u2` hmotnost (`1 kg = 1000 g`, `1 t = 1000 kg`), `u3` objem (`1 l =
10 dl`, `1 l = 1000 ml`, `1 hl = 100 l`), `u4` čas (`1 h = 60 min`, `1 min =
60 s`, `1 den = 24 h`, `1 týden = 7 dní`, `1 rok = 12 měsíců`). Zkratky jednotek
jsou ve třech jazycích stejné až na `l` a `dl`, které jsou stejné taky, a
slovní jednotky času (den, týden) jdou přes `t()`. Kapitola 18 dostane
`units:["4"]`, kapitola 29 `units:["1","2","3"]`; kapitola 17 zůstává bez
generátoru, mapa u ní `unit_convert` neuvádí. Násobitel prahů 2,2. `RANGE.u`
`[1,1000]`, `maxLen: 4`. Trať `units`, `grade:3`, otevírá se od `a1000`
(`m("a1000") >= .4`), protože tisícovka je obor, ve kterém se převody dějí.
Heatmapa: čtyři dlaždice `U_EX = {"1":"3 m→cm", "2":"2 kg→g", "3":"4 l→dl",
"4":"2 h→min"}`.

### D4. `missing_operand` a `inverse_check`, kapitola 5

Není to rodina, ale **varianta** nad existujícími klíči, přesně jak říká
`PLAN-2026-09-12.md`. Klíč se nemění, takže se nemění ani krabička ani
sbírka. Zásah:

`itemFromKey(key, opts)` dostane druhý parametr; `opts.variant === "missing"`
obalí `rawItem()`: u `m`, `a`, `p`, `k`, `x` skryje první operand a ukáže
výsledek, tedy `▢ × 7 = 42` s odpovědí 6; u `d`, `s`, `n` skryje menšence
nebo dělence (`▢ - 18 = 27`). Položka dostane `layout:"lead"`, podle kterého
`questionHTML()` postaví řádek `[abox] × 7 = 42` místo `6 × 7 = [abox]`; je
to druhé rozvržení řádku po `svg`, a `rightAnswerText()` k tomu dopočítá
`6 × 7 = 42`. `inverse_check` se do téhle varianty **skládá**: zkouška
správnosti v sešitě je "spočítej `45 - 18`, ověř `27 + 18`", což je jako
otázka na klávesnici totéž co doplnění chybějícího členu; samostatná varianta
by nepřinesla nic nového. Rozhodnutí je zapsané v oddílu 9, R3.

Pool: kapitola 5 dostane `variant:"missing"` a `as100:ALL_H, mult:ALL_TABLES`;
`buildRun()` ve větvi `school` předá `chapterOf(p).pool.variant` do
`itemFromKey`. Trať vlastní nemá, jede se přes školní trať a přes kapitolu;
šampionát ani `weak` variantu nepoužívají. `thresholds()` násobí 1,6, protože
hledání chybějícího členu je obrácená operace. Test: `items.test.js` ověří,
že varianta uzná správný člen a neuzná sousední, že klíč zůstal beze změny a
že `record()` píše pod původní klíč.

Po D4 je třetí ročník na 25 hratelných kapitolách z 33 a vlna A je hotová.

---

## Krok E. Vlna B, nové vstupní prvky

### E1. `pad2` a dělení se zbytkem, kapitola 27

Pořadí práce: nejdřív dvě políčka, pak generátor.

**Dvě políčka.** `RUN.typed` zůstává řetězec pro `pad`, pro `pad2` je to pole
dvou řetězců a `RUN.slot` říká, které je aktivní. `questionHTML()` pro
`input:"pad2"` vykreslí `36 : 5 = [abox0] (zb. [abox1])` s třídou `active`
na aktivním; klepnutí na políčko (`data-slot`) ho zaktivní; `tap()` píše do
aktivního, po naplnění `maxLen` políčka přeskočí na druhé, mazání přes hranici
se vrátí do prvního; `typedText()` dostane index. `keypadHTML()` pro `pad2`
přidá klávesu se šipkou (`data-k="next"`), která přepne políčko, protože
prvňák z toho nebude, ale třeťák ano a klepnutí do políčka nemusí objevit.
`submit()` předá `item.check(RUN.typed)` pole; `check` porovná obě hodnoty
zvlášť. `missHint()` pro `kind:"divrem"`: zbytek větší nebo rovný děliteli
dostane vlastní hlášku `divremTooBig`, zbytek správný a podíl špatný
`divremQuotient`. `items.test.js` na řádku `if(it.input!=='pad')` musí `pad2`
znát a `check` volat s polem.

**Klíč.** `TEMATA.md` navrhuje `r{dělenec}x{dělitel}`, tedy vyčíslitelná
fakta. Pro dělitele 2 až 10 a dělence do desetinásobku je to přes pět set
klíčů, sbírka s pěti sty místy a krabička, která se nikdy nenaplní. Návrh
tohoto plánu: **rodina po dělitelích**, `r2` až `r10`, `r` do `FAMILY_HEADS`,
dělenec se generuje, kbelíky stupňované ve dvojicích podle sešitu, `2 a 3`,
`4 a 5`, `6 a 7`, `8 a 9`, `10`. Krabička si pak pamatuje, jak dítěti jde
dělení sedmi se zbytkem, což je přesně ta dovednost. Rozhodnutí v oddílu 9,
R2; dokud nepadne, generátor se nepíše.

`record()` bere správnost jako ano nebo ne; "podíl dobře, zbytek špatně" je
celá chyba. Změna by sáhla na datový model a na migrační test, takže se
v E1 nedělá; zapsat do `PROJECT-STATE.md` jako známé zjednodušení.

### E2. `pad3` a `place_value`, kapitola 21

Tři políčka stovky, desítky, jednotky; `pad3` je rozšíření `pad2` na `n`
políček, takže `RUN.typed` jako pole a `RUN.slot` z E1 se použijí beze změny.
Pozor na jméno třídy: `.keypad-pad3` je vstupní prvek, `.keypad-pad` je
číselná klávesnice, viz past v `PROJECT-STATE.md`, oddíl 7.

### E3. `pick`, `parity` a `digit_count`, kapitola 6

Dvě až čtyři velká tlačítka. Porušuje první princip (poznávání místo
vybavování), proto jen jako doplněk uvnitř školní trati, nikdy vlastní trať;
totéž platí pro E4.

### E4. `cmp`, `compare_numbers` a `compare_units`, kapitoly 22 a 17

Poslední schválně, viz `PROJECT-STATE.md`, oddíl 12d.

---

## Krok F. Vlna C, slovní úlohy v dílně

`word_problem` je první zakázka, kde se generuje text, ne čísla. Šablony ve
třech jazycích s placeholdery pro čísla a předměty (`{0} jablek`), skloňování
řešit výběrem šablon, které skloňovat nepotřebují, nebo slovníkem tvarů pro
1, 2 až 4, 5 a víc v češtině a němčině. Odpovídá se zápisem výsledku na
`pad`, ale **v dílně**, tedy bez času a bodů za rychlost; k tomu se použije
`keypadHTML()` uvnitř `viewJob()` s vlastním obslužným místem, protože `tap()`
patří závodu. Zakázka `words`, `grade:3`, kroky `ww1` jedna operace do sta,
`ww2` dvě operace, `ww3` "o kolik" a "kolikrát", což je nejčastější chyba
třetí třídy podle `TEMATA.md`. Neodemkne žádnou kapitolu; přidá dovednost,
kterou závod držet nesmí.

---

## Krok G. Čtvrtý a pátý ročník

Krok se po průzkumu státního kurikula (13. září 2026, záznam v
`docs/kurikulum/ZDROJE-RVP.md`) rozpadá na dvě části, které na sobě nezávisí.
G0 je nová mapa, kterou jde napsat hned, G1 je zapnutí ročníků v aplikaci.

### G0. Mapa `npi-msvp-1st` z modelového ŠVP

Předmětový modelový ŠVP "Matematika pro 1. stupeň ZŠ" na
`revize.rvp.cz/zv/jak-na-svp/modelove-svp-pro-zs` má samostatné oddíly pro
1. až 5. ročník a u každého sloupec "Učivo k dosažení OVU", tedy ročníky
i číselné rozsahy. Nečeká na nic, co se teprve má ověřit v Matýskovi.

Udělá se nová mapa `docs/kurikulum/npi-msvp-1st.md` v témže tvaru jako mapy
učebnic, tedy hlavička s `id` a zdrojem a tabulka kapitol odkazujících na
témata z `TEMATA.md`. Do `src/curricula.js` přibydou řádky téhož tvaru jako
u tří stávajících kurikul, včetně deklarativního popisu poolu, a do `i18n.js`
název kurikula ve všech třech jazycích. Kód enginu se nesahá, protože mapa
nezavádí žádné téma mimo katalog; jediné nové téma z průzkumu,
`number_pattern`, se do katalogu přidalo bez generátoru a v této mapě se
zatím nepoužije.

Hrubší je to ve dvou věcech. Ročník má v modelovém ŠVP asi osm položek, ne
třicet dvoustran, takže rodičovský přepínač nastaví čtvrtinu roku, ne
konkrétní kapitolu. A samotný dokument je pracovní verze k pilotnímu
ověřování, finální znění se čeká na přelomu 2026 a 2027. Nevadí to, protože
proti dnešku, kdy čtvrťák nemá co nastavit vůbec, je hrubá mapa zlepšení, a
měkký režim beztak serveruje jen sedmdesát procent z aktuální kapitoly, takže
se nepřesnost v zařazení neprojeví tak, jako by se projevila v tvrdém režimu.
Až vyjde finální znění a k němu tematické plány, mapa se zpřesní na místě,
protože `normalizeChapter(p)` srovná uložené profily na nejbližší dřívější
hratelnou kapitolu.

### G1. Zapnutí čtvrtého a pátého ročníku

Beze změny proti předchozímu plánu: mapy v `docs/kurikulum/nns-matysek-4.md`
a `-5.md` vznikly z obsahů a před zapnutím se ověřují ze stránek. Zapnutí
znamená `MAX_GRADE = 5` nebo 6, což je změna datového modelu (starší profily
mají `grade: 4` jako "všechno" a nová hodnota "všechno" je jiná), takže
`seedGrade()` musí starou čtyřku přeložit a přibude fixture.

Otazníky u číselných rozsahů v obou mapách jdou sundat z RVP, aniž by se
čekalo na prohlédnuté stránky, protože rozsahy za období jsou v RVP uvedené
závazně. Jde o sčítání a odčítání do 10 000 pamětně i písemně, násobení dvou
dvouciferných čísel, písemné dělení jednociferným dělitelem se zbytkem i beze
zbytku, desetinná čísla na dvě desetinná místa a zlomky kmenové i nekmenové.
Otazníky u formátu odpovědi to nesundá, ty pořád potřebují stránky.

---

## 8. Kontrolní seznam pro každý krok

1. Přečíst `PROJECT-STATE.md` oddíly 3, 7 a 14 a tenhle krok.
2. Zásahy v `src/`, nikdy v `index.html`.
3. `python3 build.py`.
4. `node tests/items.test.js | grep '  !!  '` po každé změně enginu, je to
   vteřina; `flow.test.js` je minuta, `i18n.test.js` skoro minuta, pouštět
   před commitem; `migration.test.js` po každém doteku `load()`, `newProfile()`
   nebo profilu.
5. Nové chování má vlastní kontrolu v testu, čísla natvrdo v `flow.test.js`
   se posouvají vědomě a s komentářem.
6. Cokoli kresleného se vyrenderuje a prohlédne.
7. Dokumentace: `PROJECT-STATE.md` (stav v číslech, tabulky, kontrolní
   seznam), `TEMATA.md` a mapa učebnice u nové rodiny, `tests/README.md`
   u nového testu, tenhle plán (krok označit HOTOVO s datem a jednou větou,
   co se proti plánu upřesnilo).
8. Commit s anglickou větou; push dělá uživatel.

---

## 9. Rozhodnutí, která má udělat uživatel

Nic z tohohle není chyba a nic z toho se nedělá bez pokynu. Každé má
doporučení a důvod.

**R1. Žebřík dřívějšího ročníku pro starší dítě.** Profil třetího nebo
čtvrtého ročníku dnes vidí šest oborů prvního ročníku, z nichž pět je zamčených
za "dokonči Do tří", a stovku zamčenou za mostem. Třeťák tedy musí odjezdit
`1 + 2`, aby se dostal k `4 + 5`. Krok B0 to schová za dveře, ale po rozbalení
je to tam pořád a stovka, na které stojí `round` i `chain`, zůstává třeťákovi
zamčená za mostem. Návrh: v `unlockState()` hned za kontrolou
`force` a `opened` přidat `if(tr.grade && tr.grade < gradeOf(p)) return
{open:true};`, tedy učivo minulých let je pro starší dítě otevřené a
Leitnerova krabička si sama vybere, co v něm ještě drhne. Jen otevírá, nikdy
nezavírá, takže je to migračně bezpečné, ale přibude fixture (profil druhého
ročníku s `expectOpen` všech oborů). Dopady: šampionát čerpá i z nich (je to
opakování, správně), souhrn v rodičovské sekci je zpočátku nižší, protože
váží i neprocvičené obory; to je pravdivé číslo. Doporučení: ano. Pokud ne,
zůstává dnešní chování a plán se nemění.

*Po opravě B0b už R1 netlačí.* Třeťák má v hlavním bloku otevřenou násobilku
i hodiny, takže mapa, na kterou přijde, má na co klepnout. Zůstává jen to
křivé místo, že `a100` stojí v jeho letošním bloku zamčená za mostem, který je
za dveřmi; R1 by to spravila, ale nic na ní nestojí.

**R2. Klíč dělení se zbytkem.** Rodina po dělitelích `r2` až `r10` (návrh
plánu) proti vyčíslitelným `r{dělenec}x{dělitel}` (`TEMATA.md`). Doporučení:
rodina po dělitelích, důvody v E1.

**R3. Chybějící člen pod původním klíčem.** `missing_operand` zapisuje do
krabičky pod klíč původního příkladu (`m6x7`), takže `6 × 7` a `▢ × 7 = 42`
sdílí úroveň. Alternativa je vlastní hlavička a vlastní klíče, tedy druhá
krabička pro totéž učivo a druhá sbírka. Doporučení: původní klíč, jak stálo
v předchozím plánu; `inverse_check` se do varianty skládá, viz D4.

**R4. Poloha řetězce na mapě.** Před `beyond`, v pořadí knihy. Alternativa
za `round`, aby se pořadí hotových tratí nehnulo. Doporučení: před `beyond`.

**R5. Měřítka písma. Rozhodnuto 13. září 2026 podle doporučení, hotovo v C4.**
1,25 / 1,12 / 1,04 / 1,0 pro první až čtvrtý ročník.
Jsou to odhady k ověření na dítěti; první úprava má být na jednom místě
v CSS, ne v kódu, a je jí pět řádků s `--tx` v `src/styles.css` hned pod
`--appw`.

**R6. Mapa na tabletu. Rozhodnuto 13. září 2026 podle doporučení, hotovo v C3.**
Tři sloupce na tabletu, čtyři od 900 px, hadovitě.
Alternativa: nechat dva sloupce a jen zvětšit karty. Doporučení: sloupce,
protože dva sloupce na 1024 px dávají kartu 45 % široké a náhled velikosti
poloviny obrazovky, což už není mapa.

**R7. Co přežije vynulování postupu.** Návrh v A2: nastavení zůstávají,
postup se maže. Alternativa je dnešní stav, kdy se maže všechno včetně ročníku,
což je skoro jistě nezáměr.

**R8. Mapa z modelového ŠVP dřív než ověřený Matýsek.** Dnes jsou v aplikaci
kurikula jen pro první až třetí ročník, takže rodič čtvrťáka si nemá co
nastavit a zbývá mu adaptivní režim. Mapy `nns-matysek-4.md` a `-5.md` sice
existují, ale vznikly jen z obsahů a před zapnutím se mají ověřit ze stránek,
což čeká na přístup k učebnicím. Otázka zní, jestli mezitím postavit mapu
`npi-msvp-1st` z předmětového modelového ŠVP, viz krok G0 a
`docs/kurikulum/ZDROJE-RVP.md`. Doporučení: ano. Čtvrťák tím dostane něco, co
jde nastavit, a zpřesnit se to dá později, protože `normalizeChapter(p)` umí
uložené profily srovnat a mapa se mění na místě. Stojí to jednu novou mapu
v `docs/kurikulum/`, řádky v `src/curricula.js`, tři jazykové mutace názvu a
doplnění fixture pro novou volbu kurikula; do enginu se nesahá. Nejisté je,
že modelový ŠVP je zatím pracovní verze k pilotnímu ověřování s finálním
zněním čekaným na přelomu 2026 a 2027, takže se dělení do ročníků ještě může
posunout, a že přepínač bude hrubší než u třetí třídy, tedy po čtvrtinách roku
místo po dvoustranách. Pokud ne, čeká se na Matýska a čtvrtý a pátý ročník
zůstávají bez kurikula.

---

## 10. Jak s plánem pracovat: hlavní session řídí, subagenti implementují

`src/app.js` má skoro čtyři tisíce řádků, `i18n.js` devět set, testy další
dva a půl tisíce. Session, která si to všechno načte a pak implementuje tři
kroky za sebou, dojede s plným kontextem uprostřed třetího. Proto se pracuje
ve dvou rolích.

**Hlavní session je orchestrátor.** Přečte `PROJECT-STATE.md` a tenhle plán,
nic víc; do `src/` se dívá jen přes `grep`, když potřebuje ověřit konkrétní
místo. Každý krok plánu (A, B0, B, C1 až C3 s C5, C4 s C7, D1, D2, ...) zadá
**jednomu subagentovi** (`Agent`, typ `general-purpose`, stejná pracovní
složka, bez worktree, kroky jdou za sebou, protože všechny sahají do
`app.js`). Po návratu subagenta orchestrátor **sám** pustí `python3 build.py`
a `node tests/items.test.js | grep '  !!  '`, u kroků, které se dotkly
obrazovek nebo profilu, i `flow.test.js` a `migration.test.js`, podívá se na
`git log -1 --stat` a `git diff HEAD~1 --stat`, a teprve pak zadá další krok.
Když subagent hlásí něco, co se rozchází s plánem, orchestrátor to rozhodne,
případně se zeptá uživatele; subagent plán nemění.

**Subagent dostane soběstačné zadání**, protože nevidí konverzaci. Šablona:

> Pracuješ v repozitáři `~/Dokumenty/Kladska/math-fact-racer` (v shellu
> `/sessions/<session>/mnt/math-fact-racer`). Přečti si `docs/PROJECT-STATE.md`
> oddíly 2, 3, 7 a 14 a `docs/PLAN.md` oddíl **<krok>** celý; ostatní oddíly
> plánu nečti. Ze `src/app.js` čti jen funkce, které krok jmenuje, najdi je
> přes grep. Implementuj přesně to, co krok říká, nic navíc a nic z jiných
> kroků. Zdroje v `src/`, nikdy `index.html`. Po každé změně `python3 build.py`
> a `node tests/items.test.js | grep '  !!  '`; před commitem všech šest testů
> z `tests/`, čisté je bez `!!`. Nové chování má vlastní kontrolu v testu.
> Když kreslíš nebo měníš vzhled, vyrenderuj si to (postup v PROJECT-STATE,
> oddíl 2). Aktualizuj dokumentaci podle oddílu 8 plánu a krok označ v plánu
> HOTOVO s datem. Commit jeden, anglická věta o tom, co se pro dítě nebo
> rodiče změnilo; push nedělej. Kód a komentáře anglicky. Nedotknutelné
> principy z PROJECT-STATE oddíl 3 neměň. Rozhodnutí z oddílu 9 plánu ber
> takto: **<co orchestrátor rozhodl>**. Na konci odpověz nejvýš třiceti
> řádky: hash commitu, co se změnilo po souborech, výsledky testů, která
> čísla v testech se posunula a kam, co se proti plánu upřesnilo a proč, co
> zbylo nedodělané.

**Co orchestrátor dělá sám a co ne.** Sám: řízení pořadí, spouštění testů po
návratu, kontrola, že commit obsahuje testy i dokumentaci, aktualizace
promptu pro další session v `PROJECT-STATE.md` oddíl 14 na konci práce,
odpověď uživateli. Nedělá: čtení celého `app.js`, psaní kódu, ladění testů;
když subagent selže, dostane další subagent zadání s popisem, co selhalo,
místo aby orchestrátor opravoval sám.

**Kontrolní subagent** po velkých krocích (B, C, každá rodina z D): typ
`general-purpose`, zadání "přečti diff `git diff <před>..<po>`, oddíl kroku
v plánu a oddíl 3 PROJECT-STATE, hledej rozpor s plánem, zapomenuté body
kontrolního seznamu z oddílu 14, změnu datového modelu bez fixture, text
v dětské části s učitelským žargonem; nic neopravuj, vrať seznam nálezů".
Nálezy jdou dalšímu implementačnímu subagentovi.

**Rozdělení kroků na subagenty:** A jeden; B0 jeden; B jeden (B1 až B7 patří
k sobě, rodina se nedá půlit); C dva, první C1 až C3 a C5, druhý C4 a C7;
D1, D2, D3, D4 po jednom; E1 dva, nejdřív dvě políčka bez generátoru, pak
generátor po rozhodnutí R2; F jeden; G až po ověření map.

---

## 11. Co se v žádném kroku nesmí stát

Beze změny proti předchozímu plánu; hlídají to testy a `PROJECT-STATE.md`,
oddíl 3.

Žádná změna nepřipraví existující profil o postup; dotek datového modelu
znamená fixture. Odemčená trať se sama nezavře, rozsvícená hvězda nezhasne,
odkrytý díl kruhu se nezakryje. Do dílny se nedostanou stopky ani body za
rychlost, ani jako klávesnice ze závodu (krok F). Žádné náhodné odměny, žádný
trest za sérii, žádné srovnávání s jinými dětmi, žádná sbírka bez dna. Co hra
neumí, to nenabízí. A nově: **žádné rozvržení nesmí schovat klávesnici nebo
tlačítko Hotovo pod okraj obrazovky**; když se něco nevejde, roluje se, nikdy
se neuřízne.
