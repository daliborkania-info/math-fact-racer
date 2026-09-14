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

**Stav v den revize, tedy 13. září 2026 před krokem A.** Dvaadvacet tratí ve
čtyřech světech, 88 palet, dvě zakázky v dílně, 80 hratelných kapitol z 95, pět
testových souborů. Všech pět testů prochází, `flow.test.js` 172 kontrol,
`migration.test.js` 84, `i18n` 322 klíčů ve třech jazycích bez děr. Jedna
kontrola je nestabilní, viz A1. **Tahle čísla jsou záznam výchozího stavu a
neaktualizují se**; dnešní stav je v `PROJECT-STATE.md` pod "Stav v číslech".

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

| krok | co | stav | mění datový model |
| --- | --- | --- | --- |
| A | opravy z revize | HOTOVO 13. 9. 2026 | ne |
| B0 | předěl ročníků na mapě, minulé roky složené | HOTOVO 13. 9. 2026, s opravou B0b | ne |
| B | `chain_3`, trať `chain` | HOTOVO 13. 9. 2026 | ne |
| C | responzivita a písmo podle ročníku | HOTOVO 13. 9. 2026, s opravou C3b | ne |
| D | zbytek vlny A, čtyři rodiny na `pad` | HOTOVO 13. 9. 2026 (D1 až D4) | ne |
| E | vlna B, nové vstupní prvky | HOTOVO 14. 9. 2026 (E1 až E4) | ne |
| F | vlna C, slovní úlohy v dílně | HOTOVO 14. 9. 2026 | ne |
| G | čtvrtý a pátý ročník | **jediný nedodělaný**, viz níž | G1 ano, `MAX_GRADE` |
| H | gumová kačenka a opravdová zvířata | HOTOVO 14. 9. 2026 (H1 až H8) | ano, `duck` a `duckParts` |

**Nedodělaný je jediný krok, G.** G0 (mapa z modelového ŠVP) čeká na rozhodnutí
R8 z oddílu 9, G1 (zapnutí ročníků) na ověření map čtvrtého a pátého ročníku ze
skutečných stránek učebnice a znamená změnu datového modelu s novou fixturou.

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

**C3b, oprava po hraní s dítětem (13. září 2026): řazení míst se opravilo
z hadovitého na čtené po řádcích.** Text C3 níže popisuje boustrofedon, tedy
lichý řádek zprava doleva, a dvousloupcové rozvržení, které se střídalo po
stranách; obojí **už neplatí**. Uživatel mapu zkusil s osmiletým synem ve třetí
třídě a dítě v ní nepoznalo, kudy cesta pokračuje: od dveří "Z minulých let"
vedla přes celé okno doprava a pak se čekalo, že pojede doleva, dolů a zase
doprava. Dneska se místa řadí tak, jak se v Evropě čte stránka, tedy zleva
doprava a shora dolů, a to **ve všech šířkách včetně dvou sloupců na telefonu**;
`worldSpots()` má jedinou větev bez obracení lichých řádků. Na konci řádku se
cesta vrací prázdným pásem mezi řádky až k levému okraji: `worldRoad()` pozná
konec řádku podle toho, že další místo leží celé vlevo od předchozího, a šířku
i výšku karty si odečte ze samotných bodů, takže o sloupcích ani o světě pořád
neví. Aby se návrat do pásu vešel a nedotýkal se karet, zvětšilo se `PLACE_GAP`
z 20 na 36 px: šestnáct je stopa silnice a po deseti zbývá nad ní a pod ní.
Zamrzlý seznam dvousloupcových poloh v `items.test.js` se tím vědomě změnil
a je u něj poznámka proč; přibyla k němu kontrola, že v každém řádku roste
`left` s pořadím a že vratná čára leží celá v pásu. Viz PROJECT-STATE, oddíly
7c, 7e a 9.

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

## Krok D. Zbytek vlny A, rodiny na klávesnici — HOTOVO 13. září 2026

Všechny čtyři položky jsou hotové a s nimi celá vlna A. Proti plánu se
upřesnilo, že poslední z nich není rodina, ale varianta, takže kontrolní
seznam pro novou rodinu se na ni nevztahoval; podrobnosti u D4.

Čtyři položky, každá vlastní session, pořadí podle `PROJECT-STATE.md`, oddíl
12b. Každá jde po kontrolním seznamu z oddílu 14 plus B7 (délka otázky) a
C4 (velikosti jsou už násobené). Tady jsou jen rozhodnutí, která seznam
nepokrývá.

### D1. `order_of_ops`, hlavička `z`, trať `ops`, kapitoly 13 a 30 — HOTOVO 13. září 2026

Proti plánu se upřesnil čtvrtý kbelík: dokud násobení a dělení zůstávají
v malé násobilce, nemůže příklad, který se násobí nebo dělí jako poslední,
přelézt stovku, takže `(300 + 60) : 4` by bylo dělení mimo násobilku, které
hra zatím nikde neučí (je to rodina `tens` z kroku D2). `z4` proto roste do
tisíce na straně sčítání a jeho závorka je ta, která výsledek opravdu mění,
tedy `500 - (40 + 30)`; `Z_EX` a heatmapa nesou tenhle příklad. Zbytek vyšel
podle plánu, včetně násobitele prahů 2,4 a `maxLen: 4` u `z3` a `z4`.
Kontrola kroku k tomu 13. září našla, že v záporné závorce `z2` byl odčítanec
vždycky jednociferný, takže `(45 - 17) : 4` nešlo vylosovat; oba členy se teď
losují z oboru kbelíku, hodnota závorky se losuje před nimi, takže dělení dál
vychází beze zbytku a výsledek zůstává do sta.
Nejdelší zadání rodiny je tím pádem `510 - (46 - 31)`, patnáct znaků včetně
mezer, tedy `q-xlong`, jak plán čekal. (Do 13. září tu stálo `900 - (89 + 99)`;
délka seděla, příklad ne, protože členy závorky se losují z `ri(11,89)` a
devětadevadesát mezi nimi nikdy nepadne.) Ze čtyř navržených palet prošla na
obrázku hned napoprvé jen stezka; okruh šel z žlutozeleného bambusu na
fialovou `amethyst`, protože mezi loukou, lesem a savanou vypadal jako další
pole, obloha dostala sytější modrou, aby se nepletla s prachem, a v hlubině se
posunulo dno. Kontrol ve `flow.test.js` je po tomhle kroku 186.

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

### D2. `mult_div_10_100` a `mult_round`, hlavička `g`, trať `tens`, kapitola 28 — HOTOVO 13. září 2026

Proti plánu se upřesnil strop: součin smí dosáhnout na **celý tisíc**, protože
`10 × 100` a `1000 : 100` jsou příklady, na kterých kapitola stojí, a jsou to
jediná zadání rodiny se čtvrtou číslicí, takže `maxLen: 4` má co hlídat.
K tomu dvě věci, které plán neřešil: v prvním kbelíku se dělí **jen deseti nebo
stem**, jinak by vzniklo `230 : 23`, tedy dělení dvojciferným číslem, které hra
nikde neučí, zatímco druhý kbelík jde oběma směry (`120 : 40` i `120 : 3`);
a kulatý činitel se losuje na obě strany (`3 × 40` i `40 × 3`), protože tak to
píše i učebnice. Nejdelší zadání rodiny je `1000 : 100`, deset znaků včetně
mezer, tedy `q-long`, ne `q-xlong`. Z navržených palet prošly na obrázku všechny
čtyři, ale až po porovnání se sousedy: okruh dostal sytou magentu `mulberry`
(tlumenější varianty splývaly s `amethyst`), stezka bluebell les `tr_bells`,
obloha večerní `sk_afterglow` s modrým vrškem a růžovým obzorem a hlubina
fialové ježovky `dp_urchins`. Kontrol ve `flow.test.js` je po tomhle kroku 188.

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

### D3. `unit_convert` a `time_convert`, hlavička `u`, trať `units`, kapitoly 18 a 29 — HOTOVO 13. září 2026

Proti plánu se upřesnilo jedno pravidlo, a všechno ostatní z něj plyne: **do
tisíce zůstává i číslo v zadání**, nejen odpověď, protože třetí třída dál
nepočítá a `3000 g` na obrazovce je číslo, které dítě nezná. Odtud plyne, že
hmotnost má přesně čtyři otázky (`1 kg = 1000 g` a `1 t = 1000 kg` v obou
směrech), což je přesně to, co se u hmotnosti převádí, a že se velká jednotka
losuje nejvýš dvacetkrát, aby z týdne nevyšlo sto čtyřicet dva dní. Dlaždice
hmotnosti v heatmapě je proto `1 kg→g`, ne `2 kg→g`, který by se nikdy
neobjevil. Zkratky jednotek jsou natvrdo v tabulce převodů, slovní jednotky
času jdou přes `t()` a mají ve slovníku **tři tvary** oddělené svislítkem
(jeden, dva až čtyři, pět a víc), protože `2 dny` a `14 dní` je čeština;
tvar vybere číslo, které u jednotky stojí, a v pokynu nad klávesnicí stojí
vždycky prostý plurál. `questionSize()` nově měří celý řádek včetně jednotky
za odpovědí; nejdelší zadání rodiny je převod měsíců na roky, tedy čtrnáct
znaků česky (`240 měsíců = ? let`) a šestnáct anglicky a německy, každopádně
`q-xlong`. `askText()` umí předat argumenty stejně jako dílna. Kontrola
v `items.test.js` na řádku `if(/[+\-×:]/.test(it.text))` teď mezeru mezi
číslem a jednotkou přeskakuje výslovně (`&& !it.unit`), i když dnešní zkratky
žádný operátor neobsahují. Z palet prošly na obrázku všechny čtyři: okruh
dostal sněžnou pláň `snowfield` (bílá je jediná barva, kterou dosud žádná
z devadesáti šesti palet nebyla), stezka jinovatku `tr_frost` nad zeleným
lesem, obloha mrazivé modré nebe se zasněženým obzorem `sk_snow` a hlubina
ledovou plotnu `dp_ice`. Kontrol ve `flow.test.js` je po tomhle kroku 191.

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

### D4. `missing_operand` a `inverse_check`, kapitola 5 — HOTOVO 13. září 2026

Proti plánu se upřesnilo jedno místo, měření délky řádku: `questionSize()`
pro `layout:"lead"` **žádný příplatek nedostal**, i když to tak na první
pohled vypadá. Obě rozvržení kreslí právě jedno odpovídací políčko, takže se
políčko vykrátí; liší se jen tím, že běžný řádek kreslí znaménko mimo měřený
text, kdežto vedoucí řádek si znaménko i výsledek nese uvnitř. Spočítáno
prostě, `× 7 = 42` zůstane o znak pod menším písmem a na 375px telefonu měří
316 px, a `- 23 = 58` na menší písmo dosáhne při 341 px, což je pár pixelů
přes. Prostý počet znaků je tedy správná hranice, na znak přesně. K tomu:
znak `▢` se nakonec nikde nekreslí, protože prázdné políčko v zadání **je**
`#abox`, tedy skutečný prvek s přerušovaným rámečkem a otazníkem, jako
v každé jiné rodině; `▢` v tomhle plánu je zápis toho políčka, ne text hry,
a nechat ho v kódu by znamenalo znak, který na některých písmech Androidu
vyjde jako prázdný obdélníček. Násobitel prahů 1,6 **násobí** násobitel
rodiny, ne že ho nahrazuje, takže chybějící člen do sta má 1,9 × 1,6.
Kapitola 5 dostala vedle `variant` i `as100:ALL_H, mult:ALL_TABLES` podle
plánu; opakování z dřívějších kapitol jede přes tutéž variantu, jen hodiny
z kapitoly 4 zůstávají obrázkem, protože v obrázkové otázce není co skrýt.
Kontrol ve `flow.test.js` je po tomhle kroku 196.

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
Po E1 je na 26 z 33.

---

## Krok E. Vlna B, nové vstupní prvky — HOTOVO 14. září 2026

### E1. `pad2` a dělení se zbytkem, kapitola 27 — HOTOVO 14. září 2026

Pořadí práce: nejdřív dvě políčka, pak generátor. Obojí je hotové, ve dvou
commitech.

**Co se proti plánu upřesnilo, druhá polovina (generátor).** Rozhodnutí **R2
padlo podle doporučení**: rodina po dělitelích, klíče `r2` až `r10`, hlavička
`r`, kbelíky `R_BUCKETS` po dvojicích podle sešitu (`2 a 3`, `4 a 5`, `6 a 7`,
`8 a 9`, `10`), dělenec se losuje. K tomu pět věcí, které plán neřešil:

- **Jak často vyjde dělení beze zbytku, je rozhodnutí, ne náhoda.** Losovat
  zbytek rovnoměrně od nuly by znamenalo, že u dvojky vyjde beze zbytku každý
  druhý příklad a u desítky každý desátý, takže by každý kbelík učil něco
  jiného. Je to proto pevná pětina ve všech kbelících, `DIVREM_EVEN = .2`:
  dost na to, aby "nezbylo nic" zůstalo odpovědí, kterou musí dítě poznat
  a napsat do druhého políčka nulu, a málo na to, aby zbytek zůstal tím, o čem
  kapitola je. Sešit učí obojí, takže se nesmí vynechat ani jedno.
- **Staví se konstrukcí, a to pozpátku proti tomu, jak se řádek čte.** Nejdřív
  podíl (1 až 10, tedy po desetinásobek dělitele, jak sešit značí násobky na
  ose), pak zbytek z rozsahu, který na dělitele nedosáhne, a teprve z nich
  dělenec. Zbytek je tím pádem menší než dělitel proto, že jinde být nemůže,
  ne proto, že se něco ořízlo. Neznámý dělitel padá přes `noBucket()`.
- **Trať `divrem` stojí na mapě hned za `tens`**, tedy na konci násobící
  a dělící řady třetího ročníku, a otevírá se od `d1` na 0,6, stejně jako
  `beyond`. Kapitola 27 leží v knize hned vedle kapitoly 28, takže pořadí
  knihy to neporušuje, a na dělení se zbytkem není na čem stavět, dokud dítě
  nezná násobky dělitele.
- **Násobitel prahů je 2,4**, tedy jako u pořadí operací: spoj z násobilky,
  odečtení a k tomu dvě čísla do dvou políček s přeskokem mezi nimi.
- **Nejdelší řádek rodiny je `109 : 10 = ▢ (zb. ▢)`** a na 375 px se vejde na
  jednu řádku od druhého ročníku výš (česky 294 px z 339, anglicky 312,
  německy 313); prvňákovi se zalomí, stejně jako se mu zalomí nejdelší převod,
  který je s 332 px dál pořád nejširší řádek hry.

**Vstupní prvek `pad2` — HOTOVO 14. září 2026.** Dvě políčka fungují a jsou
otestovaná. Do generátoru je žádná rodina
pouštěla jen ručně složená položka v testu; od druhé poloviny kroku je vyrábí
rodina dělení se zbytkem.
Hotové je všechno kolem zadávání, tedy `SLOTS`, `RUN.typed` jako pole,
`RUN.slot`, `boxId`/`boxAt`/`paintBoxes`, `maxLen` po políčkách, přeskok po
naplnění, mazání přes hranici, klávesa `data-k="next"`, klepnutí do políčka
přes `data-slot`, třetí tvar řádku v `questionHTML()` se slovy `sep` a `tail`,
klávesnice `.keypad-pad2` o čtyřech sloupcích, `defaultCheck()` porovnávající
pole hodnotu po hodnotě, `rightAnswerText()` nad celým řádkem a `submit()`
označující obě políčka. Otestované je to v `items.test.js` (okruh 7r, tvar
řádku, klávesnice, porovnání) a v `flow.test.js` (oddíl „dve policka
v odpovedi“, psaní, přeskok, mazání přes hranici, šipka, klepnutí, odeslání),
v obou případech nad položkou složenou v testu, protože generátor neexistuje.
Proti plánu se upřesnilo trojí: řádek si o příplatek na délku **říct musí**
(druhé políčko se nevykrátí, na rozdíl od `layout:"lead"`), takže `questionSize()`
k němu přidá tři znaky plus délku slov mezi políčky; políčko a mezery se pro
takový řádek zúžily vlastní třídou `.question.q-boxes`, jinak se dvě políčka na
375 px nevejdou; a `missHint()` pro `kind:"divrem"` zůstal na potom, protože
hlášky `divremTooBig` a `divremQuotient` potřebují dělitele, tedy generátor.
`record()` se nezměnil, „podíl dobře, zbytek špatně“
je celá chyba a je to zapsané v `PROJECT-STATE.md` jako známé zjednodušení.

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

**Klíč. Rozhodnuto 14. září 2026 podle doporučení.** `TEMATA.md` navrhoval
`r{dělenec}x{dělitel}`, tedy vyčíslitelná fakta. Pro dělitele 2 až 10
a dělence do desetinásobku je to přes pět set klíčů, sbírka s pěti sty místy
a krabička, která se nikdy nenaplní. Udělaná je proto **rodina po dělitelích**,
`r2` až `r10`, `r` v `FAMILY_HEADS`, dělenec se generuje, kbelíky stupňované
ve dvojicích podle sešitu, `2 a 3`, `4 a 5`, `6 a 7`, `8 a 9`, `10`. Krabička
si pamatuje, jak dítěti jde dělení sedmi se zbytkem, což je přesně ta
dovednost, a sbírka trati má devět míst místo pěti set.

`record()` bere správnost jako ano nebo ne; "podíl dobře, zbytek špatně" je
celá chyba. Změna by sáhla na datový model a na migrační test, takže se
v E1 nedělá; zapsat do `PROJECT-STATE.md` jako známé zjednodušení.

**Co našla kontrola a jak se to spravilo: E1 potichu zrušil rozhodnutí kroku
C4 o výšce klávesy.** Plocha s tlačítky potřebovala znát výšku klávesy číslem,
aby si z ní spočítala své vlastní řádky, takže E1 přepsal `.key` z dvojice
`height` a `min-height` na jediné `height:var(--keyh)`. Tím se ale z podlahy
pro nízký displej, `.key{min-height:calc(44px * var(--tx))}` v bloku
`@media (max-height:660px)`, stalo pravidlo pod pevnou výškou, které nikdy
nevyhraje. Prvňákovi tím na 360 × 640 narostla klávesnice ze 244 na 274 px
a o těch třicet přišla otázka; na 320 × 568 je to +30, +24 a +8 px pro první
až třetí ročník. Neuřízlo se nic, protože zóna otázky roluje, takže si toho
nevšiml ani obrázek. Spravené je to tak, že nízký displej snižuje `--keyh`
samotné, tedy `max(clamp(50px,8.6vh,64px), calc(44px * var(--tx)))`; čísla
sedí zpátky na hodnotách C4 a podlaha se tím přenesla i na plochu s tlačítky,
která si výšku z `--keyh` počítá. `tests/style.test.js` na to má dvě kontroly:
nízký displej musí podlahu opravdu snížit, a **žádná podlaha klávesy nesmí
ležet pod pevnou výškou**, což je ta obecná, která zachytí i příští mrtvé
přebití. Ověřeno mutací, tedy vrácením původního `min-height` na `.key`.

### E2. `pad3` a `place_value`, kapitola 21 — HOTOVO 14. září 2026

Tři políčka stovky, desítky, jednotky; `pad3` je rozšíření `pad2` na `n`
políček, takže `RUN.typed` jako pole a `RUN.slot` z E1 se použijí beze změny.
Pozor na jméno třídy: `.keypad-pad3` je vstupní prvek, `.keypad-pad` je
číselná klávesnice, viz past v `PROJECT-STATE.md`, oddíl 7.

**`pad3` opravdu byl jen další řádek v `SLOTS`**, ne třetí cesta. E1 nechal
počet políček na otázce, takže se doplnilo `pad3: 3` a zobecnilo se to, co
ještě počítalo do dvou: `questionHTML()` kreslí políčka ve smyčce a slovo
`sep` staví do **každé** mezery mezi nimi, `keypadHTML()` se ptá `SLOTS[kind] > 1`
místo na jméno `pad2` a třídu si skládá z toho jména, a `questionSize()` počítá
`sep` tolikrát, kolikrát se kreslí. Přeskok, mazání přes hranici, šipka dokola,
klepnutí do políčka, `defaultCheck()` i `rightAnswerText()` se nezměnily vůbec.
Klávesnice `.keypad-pad3` sdílí rozvržení s `.keypad-pad2`, tedy čtyři sloupce;
`.keypad-pad` zůstává jméno rozvržení číselné klávesnice, past z oddílu 7
`PROJECT-STATE.md` se neporušila.

**Co se proti plánu upřesnilo.**

- **Směr otázky je rozklad, ne skládání**, a je to hlavní rozhodnutí kroku.
  `300 + 40 + 7 = ▢` jde odpovědět přečtením číslic v pořadí, v jakém stojí,
  bez jediné myšlenky na to, kolik která platí, a na klávesnici je to navíc
  sčítání do tisíce, které učí `a1000`. `347 = ▢ + ▢ + ▢` to neumožňuje.
  Třetí možnost, tedy "kolik má stovek, desítek a jednotek" s odpovědí 3, 4, 7,
  je to čtení bez počítání a taky se nedělá. Sešit píše řádek stejným směrem.
- **Kbelíky jdou po řádech, ne po velikosti čísla**, jak sešit obor odvozuje:
  `v1` dvojciferné (`47 = 40 + 7`), `v2` trojciferné zakončené celou desítkou
  (`350 = 300 + 50`), `v3` všechny tři řády (`347 = 300 + 40 + 7`). Kolik
  políček řádek má, tedy plyne z učiva: první dva kbelíky se odpovídají do dvou
  políček, poslední do tří. Klíče `v1` až `v3`, hlavička `v`, trať `split`.
- **Každé místo, které má políčko, se losuje od jedné do devíti**, takže v čísle
  není nula tam, kde na ni čeká políčko. Omezení s důvodem, ne ořez: kniha píše
  407 jako 400 + 7, tedy o jeden sčítanec míň, a tři políčka by chtěla nulu,
  kterou nikdo nepíše.
- **Na mapě stojí těsně před `a1000` a otevírá se od stovky na 0,5**, stejně
  jako zaokrouhlování. Kapitola 21 je v knize před kapitolami 23 až 25 a v oboru,
  který dítě nepotkalo, se nedá sčítat, takže tahle trať je zem, na které
  tisícovka teprve stojí, a nikdy nesmí čekat na ni.
- **Násobitel prahů je 2,2**: samotná úvaha je pravidlo jako u kulatých čísel,
  ale píše se až do tří políček s přeskoky, takže je to spíš o ťukání.
- **Nejširší řádek hry se tímhle krokem změnil.** `987 = 900 + 80 + 7` vyšel
  s vyplněnými políčky na 340 px z 339 na telefonu 375 px ve třetím ročníku,
  tedy o pixel mimo. Řeší to vlastní třída `.q-boxes3` (mezera 4 px místo 5,
  odsazení v políčku 5 px místo 8), se kterou je to 322 px ve třetím ročníku
  a 312 ve čtvrtém. Nic se neuřízlo ani předtím, řádek se zalomí, ale řádek,
  který se zalomí bez důvodu, dítě čte dvakrát. Trať patří třetímu ročníku,
  takže ji prvňák ani druhák nedostane; ve větším písmu druhé třídy, kam se dá
  dostat jen přes školní trať s nastavenou kapitolou 21, se zalomí (342 px).
- Chyba rodiny má vlastní hlášku: napsat číslici místo toho, kolik doopravdy
  platí, jmenuje obojí (`splitDigits`).

### E3. `pick`, `parity` a `digit_count`, kapitola 6 — HOTOVO 14. září 2026

Dvě až čtyři velká tlačítka. Porušuje první princip (poznávání místo
vybavování), proto jen jako doplněk uvnitř školní trati, nikdy vlastní trať;
totéž platí pro E4.

**Hranice se držela a je zadrátovaná na čtyřech místech.** Rodina nemá záznam
v `TRACKS`, takže na mapě není a `mix` ji z tratí nenasbírá; `mix` ji navíc
výslovně odfiltruje, protože sbírá i školní trať a ta má pool kapitoly;
`weak` ji odfiltruje z krabičky stejně jako zakázky dílny (`isPickKey` vedle
`isJobKey`); a na konci `buildRun()` stojí hlasitá hlídka, která spadne, když
se otázka s výběrem octne v čemkoli jiném než ve školní trati. Test 7x
v `items.test.js` projede všechny tratě včetně šampionátu a trati "co ti
nejde" s krabičkou plnou výběru a ověří, že žádná ho nedostane, a naopak že
kapitola 6 ho dostat musí.

**Co se proti plánu upřesnilo.**

- **Kolik tlačítek a jak se losují.** Sudé a liché má dvě, protože otázka má
  dvě odpovědi; kolik číslic má tři, protože kapitola jmenuje tři druhy čísel.
  Žádná nabídka neobsahuje volbu, která by nebyla skutečnou odpovědí.
  **Správné tlačítko se losuje první a rovnoměrně a číslo se k němu teprve
  staví**, tlačítka přitom stojí pořád ve stejném pořadí na stejném místě.
  Poloha tím nenese nic (každé tlačítko je správně přesně jednou ze dvou, resp.
  ze tří) a nic se pod prstem nehýbe. Míchání tlačítek by odpověď schovalo
  taky, ale posouvalo by cíl mezi dvěma otázkami téhož závodu a vypadalo by
  jako los. Žádná náhodná odměna nevzniká: body se počítají ze správnosti
  a z času jako všude jinde, na tom, které tlačítko to bylo, nezávisí nic.
  Hlídá to okruh 7w v `items.test.js`, včetně rovnoměrnosti na třech tisících
  otázkách na kbelík.
- **Klíče jsou `jp1`, `jp2` a `jd1`**, hlavička `j`, prefixová konvence jako
  u stovky. Jedna hlavička nese oba druhy otázky, stejně jako `k`, `x` a `g`
  nesou obě znaménka; abecedy zbývá málo. Sudé a liché má dva kbelíky (do sta
  a trojciferná), kolik číslic jeden, a to **musí mít jeden**: kbelík, který by
  nikdy nevyrobil trojciferné číslo, by udělal ze třetího tlačítka tlačítko,
  které se dá vždycky přeskočit.
- **Stisk tlačítka je celá odpověď a rovnou ji odešle.** Fajfka na ploše není,
  protože se výběr neskládá po znacích, takže není co potvrzovat; guma a šipka
  z téhož důvodu taky ne. Tlačítka jdou přes `data-k` (`opt0`, `opt1`, …)
  a mají vlastní větev v `tap()`, tedy past z oddílu 12c se neporušila.
- **Plocha má přesně výšku číselné klávesnice.** Čtyři řady kláves a tři mezery
  jsou `4K + 24 px`; n tlačítek a n-1 mezer musí dát totéž, z čehož plynou tři
  řádky v CSS (`2K+8`, `(4K+8)/3`, `K`). Výška klávesy se proto píše jednou
  jako `--keyh` a čte se z obou stran. Na šířku se nepočítá nic: plocha se
  roztáhne do téhož pole mřížky jako klávesnice.
- **Tlačítka jdou pod sebe přes celou šířku, ne do třísloupcového gridu.**
  Tři velká tlačítka vedle sebe by měla 110 px a nevešlo by se do nich nic
  čitelného; je to přesně ta náhoda, před kterou oddíl 12c varuje. Naměřeno
  na telefonu 375 px: tlačítko je široké 347 px, nejširší slovo `jedna číslice`
  má 118 px ve třetím ročníku a 176 px v písmu prvního, tedy poloviny volného
  místa. Řádek otázky s vyplněným políčkem je nejširší `697 hat zwei Ziffern`
  s 326 px z 339 ve třetím ročníku (česky 320, anglicky 325); ve druhém se
  nejširší varianta zalomí o pár pixelů a v prvním zalomí, stejně jako se tam
  zalomí rozklad čísla, a je to v pořádku, trať patří třetímu ročníku.
- **Políčko odpovědi zůstalo**, jen s vlastní třídou řádku `.q-pick`: plní se
  slovem, ne číslem, takže se sází v písmu jednotky za odpovědí (22 px), ne
  v písmu čísla. Díky tomu nepřibyla ani jedna nová cesta zpětné vazby,
  `paintBoxes()` a `submit()` obarví políčko zeleně nebo červeně jako vždycky.
- **Odpovídací plocha se pozná podle nabídky, ne podle jména prvku.**
  `surfaceOf(item)` a `data-surface`: dvě otázky s výběrem mají obě
  `input:"pick"`, ale jinou nabídku, a `submit()` by pod prstem nechal slova
  předchozí otázky. Tohle byla jediná skutečná past kroku.
- **Rodina nemá sbírku, a proto ani nerozsvěcuje místa.** Velikost sbírky se
  bere z trati, tahle žádnou nemá, a místo, které se rozsvítí tam, kam se nedá
  podívat, by slibovalo víc, než Poklady ukážou. Hlídá to `lightStar()`, jediná
  brána, která místo rozsvěcuje; `seedStars()` teď jde přes ni taky.
- **V heatmapě vidět je, a to je záměr.** Nemá trať, takže se neptá na
  odemčení: ukáže se, když ji vybraná kapitola chce nebo když už dítě něco
  z ní odpovídalo. Rodič má vidět, co dítě v krabičce má, ne které cesty
  existují; a strip tří šedých dlaždic pro dítě, které se ke kapitole 6 nikdy
  nedostane, by neříkal nic.
- **Násobitel prahů je 1,4**: přečíst číslo a použít pravidlo je víc než
  vybavit si spoj, a mnohem míň než cokoli psaného, protože odpověď je jeden
  stisk a nic se neťuká.
- **Texty obcházejí "cifru" i "řád".** Mluví se o číslicích, což je slovo
  z první třídy: `jedna číslice`, `dvě číslice`, `tři číslice`, a otázka zní
  "Kolik číslic má to číslo?". Chybná odpověď u sudých a lichých dostane
  pravidlo, které je celým obsahem kapitoly: rozhoduje poslední číslice.
- **Míchání vstupních prvků v jedné jízdě posouzeno, viz `PROJECT-STATE.md`,
  oddíl 12c.** Závěr: únosné je to, protože se mění jen spodní část obrazovky
  a výška zůstává, a v měkkém režimu je výběr menšinou otázek; podmínku
  v `buildRun()` a `reachedKeys()` proto nepotřebujeme.

**Co našla kontrola a jak se to spravilo: ta menšina žádná nebyla.** Věta
o menšině stála v plánu i ve stavu projektu, ale nedržel ji žádný kód.
Změřeno na čerstvém profilu: kapitola 6 dávala 70,0 % otázek s tlačítky
v měkkém režimu a 100 % v tvrdém. Sedmdesát procent není náhoda, je to tvar
`focusAndReview()`, tedy kapitola nese závod a zbytek je opakování; u kapitoly,
jejíž celý pool se odpovídá výběrem, z toho vyjde závod za poznávání, a závod
měří čas a dává body za rychlost. Šestce navíc nešlo dosypat nic jiného, mapa
učebnice u ní kromě sudých, lichých a počtu číslic uvádí jen číselnou osu,
kterou hra neumí. Přibyl proto **strop `PICK_MAX_SHARE`, jedna třetina závodu,
a `capChosen()` na konci školní větve `buildRun()`**: co je přes čáru, nahradí
učivem, které se píše, nejdřív z kapitoly samotné a teprve když žádné nemá,
z dřívějších kapitol. Platí v obou režimech, protože "kapitola a nic jiného"
nesmí znamenat "hádání a nic jiného"; tvrdý režim tím přestává být doslovný
jen u kapitol, které kromě výběru nic vlastního nemají, tedy u šestky
a dvaadvacítky. Po opravě je kapitola 6 na 30,0 % v obou režimech. Měří to
nový okruh 7y v `items.test.js` přes všechny kapitoly, oba režimy a všechny
čtyři délky závodu; ověřeno mutací, tedy vypnutím stropu.

### E4. `cmp`, `compare_numbers` a `compare_units`, kapitoly 22 a 17 — HOTOVO 14. září 2026

Poslední schválně, viz `PROJECT-STATE.md`, oddíl 12d. **Tímhle je hotový celý
krok E a celá vlna B.**

**Hranice se držela a nezdvojila se.** Plán ji u porovnávání říká důrazněji než
u E3 a zůstala přesně stejná, protože porovnávání dostalo **tutéž hlavičku
klíče `j`**: klíče jsou `jc1`, `jc2` (čísla) a `ju1`, `ju3`, `ju4` (jednotky),
takže `isPickKey` je pořád jedna funkce a drží obě rodiny naráz. Nevznikla
druhá skoro stejná hlídka v `mix`, v `weak`, v `lightStar()` ani na konci
`buildRun()`; vznikla jen jedna nová věta v komentáři u `isPickKey`, která říká,
že hlavička znamená "odpovídá se výběrem", ne "sudé a liché". Rodina nemá
záznam v `TRACKS`, nemá sbírku a místa nerozsvěcuje. Okruh 7x v
`items.test.js` projíždí každou trať včetně šampionátu a trati "co ti nejde"
s krabičkou plnou obou rodin a s kapitolou 22, a naopak ověřuje, že školní trať
na kapitole 22 porovnávání dostat musí.

**Co se proti plánu upřesnilo.**

- **`cmp` je zvláštní případ `pick`, ne třetí cesta.** Položka má
  `input:"pick"` a na tlačítkách místo slov tři znaky, takže `SLOTS`,
  `keypadHTML()`, větev v `tap()`, `surfaceOf()`, `defaultCheck()`,
  `paintBoxes()` i `submit()` zůstaly beze změny. Přibyly dvě věci: čtvrtý tvar
  řádku `layout:"mid"`, tedy **políčko mezi dvěma stranami** (`3 m ▢ 280 cm`),
  a `data-glyph` na ploše, když je každá volba jeden znak, aby se znak sázel
  větší. Ani jedno nejmenuje rodinu, takže se CSS nemusí ptát, kdo se ptá.
- **Znaky jdou přes slovník, i když je dnes všechny tři jazyky píšou stejně.**
  Je to tentýž mechanismus jako `rel` u zaokrouhlování (`≐` česky, `≈` jinde):
  znak, který dítě zná ze sešitu, nemusí být všude týž, a `cmpLt`, `cmpEq`
  a `cmpGt` dávají jazyku, kde by to platilo, kam to napsat.
- **Rovnost vychází v jedné čtvrtině otázek**, `CMP_EQUAL`. Rozhodnutí táhnou
  dvě věci proti sobě: tlačítko, které je správně skoro nikdy, se dítě naučí
  přeskakovat (přesně proto má "kolik číslic" kbelík, který dosáhne na tři
  číslice), ale rovnost je v sešitě menšina a všimnout si jí je ten výkon.
  Čtvrtina je největší podíl, který se pořád čte jako menšina, a drží los
  nejblíž rovnoměrnému: na menší a větší zbývá po třech osminách, takže hádat
  nejpravděpodobnější polohu vynáší 37,5 % proti 33,3 % u rovnoměrné trojice,
  a **rovnítko je z těch tří tipů ten nejhorší**, ne nejlepší.
- **Porovnávání jednotek bere tabulku převodů z kroku D3**, `U_BUCKETS`, druhá
  nevznikla; kbelíky se z ní odvozují. **Hmotnost z toho vypadla a je to
  správně:** do tisíce gramy nepřelezou kilo ani kila tunu, takže by o všem
  rozhodla jednotka a dítě by nic nepřevádělo. Říká to jedna konstanta,
  `CMP_MAX_F = 100`, a tatáž vyhodí kilometr, mililitr a tunu z kbelíků, které
  zůstaly. Zbývá délka (`u1`), objem (`u3`) a čas (`u4`).
- **Která strana nese větší jednotku, se losuje zvlášť od toho, která strana
  vyhrává.** Bez toho by stačilo číst popisky. Hlídá to okruh 7y na třech
  tisících otázkách na kbelík, spolu s podílem rovnosti a s tím, že se
  nevyplatí hádat pořád tutéž polohu.
- **Obě strany zůstávají do jedné velké jednotky od sebe**, tedy `3 m` proti
  `280 cm`, ne proti `12 cm`. Staví se konstrukcí: nejdřív počet velké
  jednotky, pak počet malé z okna, které už drží vylosovanou odpověď.
  U čísel je to totéž jinak: **obě čísla mají stejný počet číslic** a shodují se
  až do místa, kde se poprvé liší, a to místo se losuje rovnoměrně. Dvojciferné
  proti trojcifernému rozhodne počet číslic, což je kapitola 6, ne tahle.
- **Kapitoly.** 17 (jednotky délky a objemu) a 22 (čísla do tisíce) dostaly
  generátor a přestaly být zamčené, kapitola 18 dostala k převodu času i jeho
  porovnání. Zamčených kapitol třetího ročníku je pět mínus dvě, tedy **tři**:
  písemné násobení a dvě o zlomcích.
- **Násobitele prahů jsou dva**, protože jsou to dvě práce: 1,6 u čísel, tedy
  přečíst dvě místo jednoho a stisknout, a 2,2 u jednotek, tedy tolik co
  převod, protože co se ušetří na ťukání, to se utratí na druhé straně.
- **Naměřeno na telefonu 375 px ve třetím ročníku** (339 px k dispozici):
  nejširší řádek rodiny je `227 months > 18 years` s 324 px, česky
  `235 měsíců < 20 let` 289 px, německy 318 px; čísla jsou nejvýš 244 px.
  Prvnímu a druhému ročníku se nejširší časový řádek zalomí, stejně jako se jim
  zalomí rozklad čísla, a trať patří třetímu ročníku. Tlačítko se znakem je na
  telefonu na výšku 347 × 88 px, tedy tři tlačítka a dvě mezery dají přesně
  280 px, což je výška čtyř řad kláves; na šířku je široké 410 px na telefonu
  812 × 375 a 525 px na tabletu 1024 × 768 a výšku si dělí stejně jako
  klávesnice. Znak sám je 25 px široký, proto se sází 48 px a ne 26 jako slovo.

**Co našla kontrola a jak se to spravilo: kapitoly 17 a 22 byly na tom stejně
jako šestka.** Naměřeno 70,8 % a 71,2 % výběru v měkkém režimu a 100 %
v tvrdém, kapitola 18 pak 36,1 % a 50,0 %. Spravené je to dvěma různými
cestami a rozhoduje o tom mapa učebnice, ne pohodlnost:

- **Kapitola 17 dostala `as100:ALL_H`**, protože `nns-matysek-3.md` u těch
  stran vedle `compare_units` uvádí i `add_sub_100` a hra to umí. Výběr v ní
  spadl na 12,3 % měkce a 16,4 % tvrdě, a to bez stropu: kapitola se odpovídá
  převážně psaním, protože se převážně psaním odpovídá i v sešitě. To je lepší
  výsledek než strop, protože to není brzda, ale učivo.
- **Kapitoly 22 a 18 mají strop z E3.** Dvaadvacítce mapa nabízí navíc jen
  porovnávání veličin, což je zase výběr, takže protiváha to není; osmnáctka má
  dva klíče a jeden z nich je výběr. Obě jsou po opravě na 30,0 % v obou
  režimech.

Okruh 7x v `items.test.js` tím přestal tvrdit, že tvrdý režim pustí do kapitoly
6 a 22 jen výběr; ověřuje se místo toho, že výběr v závodě je a že netvoří celý
závod. Okruh 5 tamtéž ví, že kapitola s výběrem je výjimka z pravidla "tvrdý
režim nepustí nic cizího", a hlídá, že to cizí je vždycky učivo dřívějších
kapitol téže učebnice.

---

## Krok F. Vlna C, slovní úlohy v dílně — HOTOVO 14. září 2026

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

**Co se proti plánu upřesnilo.** Skloňování se nakonec dělá obojím naráz a obě
poloviny se navzájem drží: slovník tří tvarů má jen **předmět**, o kterém věta
mluví, a čte ho tatáž `pickForm()`, kterou si pro slovní jednotky času postavil
krok D3 (`unitLabel()` je od téhle chvíle jen její volání), a **zbytek věty je
psaný tak, aby se s číslem nehýbal**: krabice stojí vždycky ve druhém pádě po
"do", německá množná čísla se od dvou nemění ani po "in" a "auf", a hlavně
**žádný počet ve větě není menší než dva**, takže se první tvar na úloze nikdy
nepoužije a nevznikne "1 samolepku". Předměty jsou proto schválně věci, ne živí
tvorové.

**Vlastní obslužné místo se jmenuje `jobKey()`** a delegovaný posluchač se mezi
ním a `tap()` rozhoduje podle `view.name`, protože klávesnice je jediné, co obě
části sdílejí. Napsané číslo drží `JOB.typed`, `jobCheck()` si podle vstupního
prvku vezme buď je, nebo hrst mincí, a `record()` se pořád volá s `ms = null`.
Ve `flow.test.js` je na to kontrola, která si vezme otisk závodního stavu těsně
před psaním a porovná ho po něm.

**Tvarů úlohy je dvanáct, ne šest, a je to kvůli jednoznačnosti.** "O kolik
míň" je vlastní tvar se svým vlastním losováním čísel, ne tentýž tvar se
znaménkem, takže se na míň nikdy nezeptá tam, kde je jich víc; stejně tak se
"kolikrát víc" ptá zvlášť na modrou a zvlášť na červenou krabici, aby němčina
nemusela říkat "wie viele Mal weniger". Každý tvar si čísla staví tak, aby
situace vyšla, a `items.test.js` to kontroluje nad tisícem úloh na krok a na
jazyk: odpověď se přepočítá nezávisle z čísel, která ve větě opravdu stojí,
a věta musí obsahovat právě je, v tom pořadí a se správným tvarem předmětu.

**Na obrazovku dílny přibyla dvě rozvržení.** Zadání dostane od devadesáti
znaků menší písmo a zarovnání doleva, jako dlouhá otázka v závodě, a **na
šířku má psaná odpověď vlastní mřížku**: pravý sloupec je jen pult a
klávesnice, zadání, věta o odpovídání, kruhové okno i Hotovo jdou pod sebou
vlevo. S Hotovem vpravo, jak ho mají mince, by spodní řada kláves spadla pod
okraj. Na telefonu 375 × 812 končí celý sloupec kolem 760 px.

**Čísla, která se posunula:** žádné z mapy. Třeťák vidí v dílně tři zakázky
místo dvou a jeho sbírka dílny má devět míst místo šesti. Zamčené kapitoly
zůstaly tři, protože zakázka žádnou neodemyká.

**Co našla kontrola a jak se to spravilo.** Tři věci, a dvě z nich byly
kontroly, které nemohly spadnout.

- **Slovní úlohu nešlo napsat na opravdové klávesnici.** Klávesnice počítače
  visela na `document.onkeydown`, který zakládal `mountGame()` a který se
  vracel, když nestála závodní obrazovka. Dítě u notebooku tedy umělo napsat
  příklad v závodě a slovní úlohu ne, na obrazovce, která těch dvanáct kláves
  kreslí. Posluchač `keydown` teď visí vedle posluchače kliknutí, jednou pro
  celou hru, a rozhoduje se podle téhož `view.name`: `game` do `tap()`, `job`
  do `jobKey()`, jinde nic. Šipka zůstala závodu, protože přepíná mezi
  odpovídacími políčky a dílna žádná nemá. Ze závodu se tím do dílny nedostalo
  nic a `flow.test.js` to hlídá otiskem rozehraného závodu.
- **Kontrola "klavesa v dilne se zavodnim stavem nehne" brala otisk po
  dojetém závodě**, tedy ve stavu `feedback`, ve kterém `tap()` vypadne na
  prvním řádku, ať se volá odkud chce. Ověřeno mutací: když se udělalo, že
  každá klávesa dílny jde i přes závodní `tap()`, test prošel. Teď se do dílny
  přichází se závodem, který čeká na odpověď, protože odchod ze závodu
  uprostřed otázky `RUN` nemaže; mutace od té chvíle padá.
- **Kontrola tvarů předmětu volala tutéž `thingLabel()` a `pickForm()`, které
  tvar vyrábějí.** Viděla tedy chybějící tvar, ale ne chybný: po posunu hranice
  z `n < 5` na `n < 4` říkala čeština "4 sušenek" a test procházel. Okruh má
  nově **vlastní tabulku očekávaných tvarů** pro všech osm předmětů ve všech
  třech jazycích, ověřuje tvar **u jeho čísla** (mezi číslem a předmětem smí
  stát nejvýš jedno slovo, kvůli anglickému "35 more apples") a navíc porovnává
  `thingLabel()` proti té tabulce přímo na hranici, tedy na čtyřce a pětce.
  Nový předmět bez řádku v tabulce test shodí. Ověřeno toutéž mutací, padá
  obojí.

---

## Krok G. Čtvrtý a pátý ročník, jediný nedodělaný krok celého plánu

**Stav k 14. září 2026: všechny ostatní kroky plánu jsou hotové a tenhle je
jediný, který zbývá.** Nezačalo se na něm nic.

Krok se po průzkumu státního kurikula (13. září 2026, záznam v
`docs/kurikulum/ZDROJE-RVP.md`) rozpadá na dvě části, které na sobě nezávisí.
G0 je nová mapa, kterou jde napsat hned, G1 je zapnutí ročníků v aplikaci.

**Na čem každá z nich visí.** **G0 visí na rozhodnutí R8** z oddílu 9, tedy
jestli se hrubší mapa ze státního zdroje má postavit dřív, než dorazí ověřený
Matýsek; doporučení je ano a nic jiného už tomu nebrání, protože zdroj je
veřejný a do enginu se nesahá. **G1 visí na dvou věcech naráz**: mapy
`nns-matysek-4.md` a `-5.md` vznikly jen z obsahů a před zapnutím se musí ověřit
ze skutečných stránek, což potřebuje přístup k učebnicím od uživatele, a samotné
zapnutí je **změna datového modelu** (`MAX_GRADE`), takže znamená překlad staré
čtyřky v `seedGrade()` a nový zamrazený profil ve
`tests/fixtures/legacy-profiles.json`.

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

## Krok H. Gumové kačenky a opravdová zvířata — HOTOVO 14. září 2026

Celý krok je hotový v osmi commitech, H1 až H8, a proti plánu se souhrnně
upřesnilo pět věcí. **Ceny nesedí se souhrnem, sedí s katalogem:** všech 65 dílů
stojí 934 součástek, ne 939, protože vrstva Tělo je o 25 levnější (120 místo
145) a vrstva Na hlavu o 20 dražší (314 místo 294); testy si zapisují součet
vypsaných cen, nikdy souhrn. **Zvířata stojí 1820 mincí**, ne odhadovaných 1700,
a nová se do `PETS` vetkala podle ceny místo za konec, aby byl katalog jedna
řada. **R10 padlo ano, ale bez změny identity**, takže Lupi zůstal žlutým
špičatouchým tvorem a Hvězdík žlutým tvorem s rohem a žirafa s křečkem přišly
v H7 jako nová id. **Kresba se posuzuje přes `cairosvg`, ne přes `convert`**;
past z H1 se potvrdila v plné šíři a stálo to nejvíc času z celého kroku, viz
`PROJECT-STATE.md` oddíl 2. A **přibyla kontrola, se kterou plán nepočítal**,
tedy `partInk()` a okruh 3f: dvojic díl a tělo bylo tehdy 550, po vlajkách 1020,
a splývání dvou barev se na obrázku přehlédne.

Otevřené po kroku zůstalo jedno, a je z něj rozhodnutí **R11** v oddílu 9: garáž
má 115 dlaždic, z toho 70 celých kačenek, a past z H5 je tedy o čtvrtinu horší,
než jak ji plán odhadoval. **R11 padlo 14. září 2026**, sbalitelné police plus
líné kreslení; podrobnosti a naměřená čísla jsou u něj v oddílu 9.

**A po dokončení celého kroku přišly ze zadání uživatele vlajky**, 14. září
2026, tedy až za tímhle plánem: dnešní díl vrstvy Vzor `dp_pasy` (tři pásy)
skončil a nahradilo ho osmačtyřicet vlajek střední, západní a severní Evropy
a celé Ameriky. Plán s nimi nepočítal a R11 je jediné místo, kde se o nich
psalo dopředu; skutečnost dopadla jinak a lépe, protože vlajky nevisí na jedné
polici, ale na pěti podle světadílu, takže nejdelší otevřená police má pořád
jednadvacet dlaždic jako před nimi a garáž místo odhadovaných 1537 uzlů dělá
nejvýš 1519 při 167 dlaždicích. Vrstva Vzor má od té chvíle 57 dílů za 482
součástek a celý kačenčí katalog 112 dílů za 1302, kombinací je 2 070 600.
Tři pásy se neztratily nikomu, kdo si je koupil: byly červené, bílé a modré,
tedy nizozemská vlajka nakreslená, aniž by to někdo řekl, a tou zůstaly, takže
staré id odpoví nástupcem a v profilu se nic nepřepisuje. Patnáct vlajek se od
jiné v seznamu liší jen znakem uprostřed; znaky se nekreslí a nahrazuje je
jedna jednoduchá značka, a jestli to stačí, se **měří** okruhem 3g
v `items.test.js`; je to zároveň obecný mechanismus, protože `DUCK_HEIR` umí
dát nástupce každému dílu, který skončí. Model vlajek je v `PROJECT-STATE.md`
oddílu 7f, garáž i s naměřenými čísly v oddílu 7g.

**Na pořadí s krokem G nezávisí.** G je učivo a kurikula, H je jen to, co se
dá vlastnit a na co se dá koukat; nesdílejí jediný soubor kromě `app.js`
a `i18n.js`, a i tam sahají do jiných oddílů. Stojí za G jen proto, že se
plán píše v pořadí, ve kterém vznikal. Dá se udělat kdykoli, i mezi E a F,
a jediné pořadí, které uvnitř kroku platí, je H1 → H2 → (H3, H4) → H5
a H6 → H7; H8 je poslední.

Podklad: `kacenky-navrh.md` (průzkum trhu s gumovými kačenkami a rozbor
dnešní kresby postaviček, 13. září 2026) a fotka nabídky kačenek od
uživatele z téhož dne. Katalog níž je podklad **plus to, co bylo na fotce
a v podkladu chybělo**; co přibylo, je u příslušné části vypsané zvlášť.

**Co to celé je.** Sedmý startovní závodník je gumová kačenka a je zdarma.
Nekupuje se kačenka, kupuje se to, co má na sobě: pět nezávislých vrstev,
65 dílů, dohromady 392 700 kombinací. Platí se **součástkami z dílny**, nikdy
mincemi, takže je to zároveň odpověď na otevřenou otázku kroku 3b, tedy kam
mají součástky jít, až budou koupené všechny nátěry. K tomu se dvanáct
dnešních zvířat překreslí tak, aby to byla poznatelná zvířata, a přibude
šestnáct nových.

**Autorská práva, a je to nejdůležitější věta celého kroku.** Nedotknutelný
princip z `PROJECT-STATE.md` oddíl 3 zakazuje licencované postavičky. Gumová
kačenka je generický předmět, vyráběný od devatenáctého století desítkami
firem, a je v pořádku. **Žádný jednotlivý díl ale nesmí být převzatá postava,
maskot ani značková kačenka.** Každý díl je věc, ne bytost: klobouk, brýle,
kruh, šála. Nejcitlivější jsou tři díly, u kterých se sklouzne nejsnáz:
maska přes oči (`de_maska`), kulaté obroučky (`de_dioptr`) a klapka na oko
(`de_klapka`). Maska je karnevalová maska se stužkou, ne domino v barvách
konkrétního hrdiny, a plášť do katalogu proto nepatří vůbec. K obroučkám
nikdy nepřibude jizva. Kontrolní otázka je jediná a platí pro každý díl
i pro každé zvíře: **když se u kresby dá říct jméno postavy, je špatně.**

**Ekonomika.** Díly stojí 6 až 30 součástek, celkem 939. Nejlevnější díl je
levnější než polovina jedné zakázky, takže dítě, které dokončí jednu jedinou
zakázku, si má vždycky co koupit; nejdražší jsou dvě zakázky, takže šetřit se
vyplatí, ale ne déle než pár dní. Sekce v garáži jsou proto řazené od
nejlevnějšího. Dnešním dvanácti zvířatům se cena **nemění ani o minci**;
nových šestnáct dostane 35 až 200 mincí. Nic z toho se nelosuje, celý katalog
i s cenami je vidět od první chvíle, žádný díl se nedá ztratit ani zdražit
a **žádný díl nemá jiný atribut než kresbu**, takže vzhled dál nemá na jízdu
vliv a soupeřem zůstává vlastní nejlepší jízda.

### H1. Kačenka jako závodník, holá — HOTOVO 13. září 2026

Sedmý startovní závodník zdarma, kreslený parametricky, bez jediného doplňku.

- `src/app.js`: nové pole `DUCKS` s jedinou položkou `du_kacka`
  (`{duck:true, c1, c2, cost:0}`), `ALL_ITEMS = PETS.concat(RIDES).concat(DUCKS)`,
  `du_kacka` **na konec** `STARTERS`, kotvy `DUCK` a funkce `duckSVG(it)`
  vedle `petSVG` a `rideSVG`, větev v `itemSVG()`.
- **Třetí druh závodníka znamená třetí otázku.** Dosud se kód ptal jen
  „je to stroj“ (`it.kind`) a všechno ostatní bralo za zvířátko. Kačenka
  není ani jedno: nemaluje se a neroste. Proto `isPet(it) = !it.kind &&
  !it.duck` a všechna tři místa, která se ptala obráceně, se musí přeptat
  (stupeň v dlaždici garáže, `RUN.evolved` po závodě, náhled zamčené
  dlaždice). Kdyby se to zapomnělo, kačenka by tiše sbírala zkušenosti
  a vyrostla by do stupně, ke kterému žádná druhá kresba neexistuje.
- **Datový model se nemění.** `load()` už dnes dopisuje každému profilu
  chybějící startovní závodníky, takže starý profil kačenku dostane sám
  a nic neztratí; fixture proto netřeba. Kačenka se přidává **na konec**
  seznamu, aby se nikomu nezměnil první závodník (`STARTERS[0]`).
- `src/i18n.js`: `du_kacka` a nadpis sekce `ducks` ve třech jazycích.
- `viewCollection()`: vlastní nadpis `#ducksec` mezi zvířátky a nátěry,
  tedy kačenka stojí ke zbytku závodníků a barvy zůstávají pod ní.
- Testy: `items.test.js` okruh 3b (kačenka je zdarma, je startovní, není
  ani stroj ani zvířátko, žádná kotva nevyjede z rámu po skupinové
  transformaci, nad hlavou zbývá místo na klobouk a hlava se dotýká těla);
  `flow.test.js` sedm kontrol navíc a **tři zapsaná čísla se posunula
  vědomě**: startovních závodníků je sedm místo šesti a dvě místa, která
  po jednom nákupu počítají závodníky profilu, jsou na osmi místo sedmi.
- Past, která se potvrdila: `convert` v tomhle repozitáři **nemá delegáta
  `rsvg-convert`**, takže kreslí vlastním rendererem a kromě `linearGradient`
  a `stroke-dashoffset` ignoruje i `opacity`. Bříško s `opacity=".2"` vyjde
  na PNG čistě bílé a vypadá jako louže. Než se paleta kačenky posoudí,
  musí se průhlednost pro tu jednu kontrolu zamíchat do plné barvy, jinak
  se posuzuje něco, co prohlížeč nikdy neukáže.

### H2. Datový model a vrstva Tělo — HOTOVO 13. září 2026

Proti plánu se upřesnilo tohle: datový model sedí, jak byl navržený, tedy
`duckParts` a `duck` v profilu a `seedDuck()` v `load()` i ve větvi `import`;
fixture se jmenuje `v12-pred-kacenkami` a `migration.test.js` u ní hlídá, že
starší profil dostane obě pole prázdná, kačenku mezi závodníky a beze změny
součástky i nátěry; těl je deset podle katalogu, ale **součet vypsaných cen je
120 součástek, ne 145** ze souhrnu, a test si zapisuje ten vypsaný součet.

Deset těl, `db_*`, a s nimi celý datový model vrstev. Tohle je jediná část
kroku H, která sahá na profil.

- `newProfile()`: `duckParts: []` (koupené díly) a `duck: {}` (co má na sobě,
  vrstva → id dílu).
- `seedDuck(p)` v `load()` **a v `import` větvi**, protože se to týká profilu
  jako celku: `p.duckParts = p.duckParts || []; p.duck = p.duck || {};`.
  Chybějící `duck.body` znamená klasickou žlutou, takže starý profil vidí
  kačenku hotovou, ne prázdnou.
- **Migrace: nový zamrazený profil do `tests/fixtures/legacy-profiles.json`**,
  tedy profil dnešní verze s `parts`, `paints` a `paint`, ale bez `duck*`.
  `migration.test.js` ověří, že po načtení obě pole existují a že se nic
  nezmenšilo. Je to jedna z mála věcí, které nejdou udělat zpětně: když se
  profil dnešní verze nezamrazí teď, nebude už nikdy z čeho migraci ověřit.
- `DUCK_BODY` (10 položek), `wearDuckPart(p, layer, id)`, obsluha `buyduck`
  a `useduck` v posluchači kliknutí, přesná kopie tvaru `buypaint`
  a `usepaint` včetně listu „nemáš dost součástek“.
- `duckSVG` dostane druhý parametr, `duckSVG(it, outfit)`; barvy `c1` a `c2`
  bere z vrstvy Tělo, ne z položky `du_kacka`.
- Sekce v garáži pod nátěry. Dlaždice ukazuje **celou kačenku s tím jedním
  dílem**, ne barevný čtvereček, ze stejného důvodu, jaký je dnes napsaný
  nad `paintCells()`: barevný čtvereček dítěti neřekne nic o tom, jak to
  bude vypadat.

| id | název | `c1` / `c2` | čím se liší |
| --- | --- | --- | --- |
| db_klasik | Klasická | #ffd23f / #e0a41f | **zdarma**, výchozí, to, co si každý představí |
| db_bila | Sněhová | #fdfdfd / #cfd6e0 | jediná téměř bílá, kontrast dělá jen křídlo |
| db_ruzova | Růžová | #ff9ec4 / #e56d9d | jediná s **růžovým zobákem**, viz níž |
| db_mint | Mátová | #8ee6d5 / #4bb8a4 | studená zeleň, jediná bez žluté složky |
| db_nebeska | Nebeská | #7ad3ff / #3ea8e0 | modrá, od mátové ji dělí 40° odstínu |
| db_limetka | Limetková | #a4e768 / #6fbb34 | jasná zeleň proti tlumené mátové |
| db_levandule | Levandulová | #c9a8ff / #8a63d8 | fialová, jediná v té části kruhu |
| db_ohniva | Ohnivá | #ff7a3d / #c23a12 | celooranžová kačenka z fotky; zobák dostane tmavší obrys, protože se tělu blíží |
| db_uhel | Uhlová | #3a4360 / #1b2436 | jediná tmavá, bříško se u ní zesvětlí na .45 |
| db_duhova | Duhová | přechod přes pět zastávek | jediná, která není plocha; `linearGradient` napříč tělem |

Ceny: 0, 8, 10, 10, 12, 12, 15, 15, 18, 20, **145 celkem**.

**Proti podkladu se mění jedna věc, a je z fotky.** Podklad říkal, že zobák
zůstane oranžový vždycky, protože oranžový zobák je to, podle čeho se kačenka
pozná. Na fotce je ale kačenka s **růžovým zobákem a dlouhými řasami** a je to
jeden z motivů, které uživatel chce. Řešení: Tělo dostane **nepovinné pole
`beak`** a vyplní ho **jediná položka z deseti**, `db_ruzova`. Pravidlo tím
nepadá, jen dostává jednu vypsanou výjimku: zobák je oranžový, pokud tělo
neřekne jinak, a jinak řekne jenom růžové. Řasy nejsou na zobáku, ale na
vrstvě Oči, viz H4.

**Past.** `convert` nekreslí `linearGradient` (vezme první zarážku) ani
`opacity`, viz H1. Duhová kačenka se proto musí posoudit v prohlížeči, ne na
PNG, a u každé vrstvy platí totéž pro průhlednost.

### H3. Vzory a hlava — HOTOVO 14. září 2026

Deset vzorů `dp_*` a dvacet dílů na hlavu `dh_*`, tedy třicet dílů a devadesát
textů. Nejpočetnější část celého kroku.

- `DUCK_PAT` (10) a `DUCK_HEAD` (20) v `src/app.js`, z-order v `duckSVG`:
  zadní výbava → ocásek → tělo → hlava → **vzor** → bříško → křídlo → zobák →
  oko → oční díl → **hlavový díl** → přední výbava.
- Vzor se kreslí přes tělo i hlavu a **ořezává se `clipPath`** složeným
  z elipsy těla a kruhu hlavy, jinak by puntíky vylétly do vzduchu. Pozice
  jsou vždycky pevný seznam, nikdy losované: dvě stejně vybavené kačenky
  musí vypadat stejně.
- Všechny hlavové díly sedí na kotvě `DUCK.HEAD` a nesmí mít v sobě jediné
  natvrdo napsané souřadnice hlavy.
- `src/i18n.js`: 30 názvů ve třech jazycích.
- Testy: v `items.test.js` nový okruh, který **projde všech 30 dílů**, každý
  vykreslí na základní kačenku, ověří, že SVG jde naparsovat, že v něm není
  `NaN` a že žádný bod nevyjede z rámu; rám se počítá stejně jako v okruhu
  3b, tedy po skupinové transformaci.
- Ruční kontrola je povinná, postup v `PROJECT-STATE.md` oddíl 2, s ohledem
  na pasti z H1.

Vzory (8 z podkladu + 2 z fotky): `dp_puntiky` puntíky 6, `dp_dres` **svislé
pruhy jako fotbalový dres** 12 (z fotky), `dp_pruhy` vodorovné oblouky 8,
`dp_kostka` závodní šachovnice 8, `dp_srdicka` srdíčka 10, `dp_hvezdicky`
hvězdičky 12, `dp_maskac` maskáč 14, `dp_vlnky` vlnky 12, `dp_pasy` tři
barevné pásy 16, `dp_mapa` **obrysy pevnin jako na globusu** 16 (z fotky).
Celkem 114.

Na hlavě (16 z podkladu + 4 z fotky): `dh_celenka` **bílá sportovní čelenka**
6 (z fotky), `dh_ksilt` kšiltovka 8, `dh_satek` pirátský šátek 8, `dh_rohy`
malé rohy 10, `dh_ousi` čelenka s oušky 10, `dh_kuchar` kuchařská čepice 12,
`dh_cepice` zimní čepice s bambulí 12, `dh_hreben` **růžový hřeben jako
punkový účes** 14 (z fotky), `dh_slamak` slamák 14, `dh_vencik` věneček
z kytek 16, `dh_vavrin` **zelený vavřínový věnec** 16 (z fotky), `dh_prilba`
stavařská přilba 16, `dh_kudrny` **blond kudrnaté vlasy** 18 (z fotky),
`dh_cylindr` cylindr 18, `dh_hasic` hasičská 18, `dh_kapitan` kapitánská 20,
`dh_helma` závodní helma 22, `dh_koruna` koruna 24, `dh_kovboj` kovbojský 24,
`dh_kosmo` skafandr 28. Celkem 294.

**`dh_kapitan` se proti podkladu mění podle fotky:** ne plochá bílá čepice
s tmavým kšiltem, ale **tmavě modrá se zlatým lemem a kulatým odznakem**.
Odznak je kroužek s kotvou nebo hvězdou, tedy tvar, ne znak žádné firmy ani
námořnictva.

**Past.** `dh_kosmo` (skafandr) je jediný průhledný díl, ostatní díly pod ním
musí zůstat vidět, takže se kreslí naposledy a s nízkou krycí barvou; a to je
právě to, co `convert` neukáže. `dh_ousi` je **čelenka s oušky, ne uši**:
proužek čelenky musí být vidět, jinak je z kačenky zvíře a vrstva ztratí smysl.

**Co se proti plánu upřesnilo.** Ceny dílů na hlavu vypsané v katalogu dávají
314 součástek, ne 294 ze souhrnu; test si zapisuje součet vypsaných cen, stejně
jako u H2 (120 místo 145). Vzor se **ořezává tělem a hlavou staženými o 1,5
dovnitř**, ne jejich přesným okrajem: světlá značka až na okraji sebere obrys,
a klasická žlutá kačenka žádný vlastní obrys nemá, jen svou barvu proti bílé
dlaždici. Každý vzor dostává **vlásovou linku v té z bílé a černé, která tělo
není**; ta jedna řádka je to, čím deset vzorů funguje na deseti tělech včetně
duhového. `dp_dres` přišel o bílé pruhy, protože bílý pruh na okraji rozřízl
kačenku vejpůl; druhým pruhem je teď barva kačenky, jak to u dresu bývá.
`dh_kosmo` musel povyrůst na `r + 11`, aby se zobák vešel dovnitř skla, protože
obroučka vedená přes zobák vypadá jako uříznutý zobák. `dh_helma` je kopule plus
panel po zadní straně hlavy: helma přes celou hlavu by zakryla oko a helma jen
na temeni vypadá jako obruč. `dh_ousi` má špičatá ouška na úzké čelence, protože
dva kulaté disky vypadaly jako sluchátka. `duckFit()` se počítá **při každém
kreslení**, ne jednou při načtení, aby šlo v testu pohnout `DUCK.HEAD` a ověřit,
že se všech dvacet klobouků pohne s ní. Strojová kontrola měří oko jako kolečko
a zobák jako klín ze tří obdélníků: obdélník, do kterého se vejdou, zakazoval
i to, co leží vedle nich.

### H4. Oči a výbava — HOTOVO 14. září 2026

Devět dílů na oči `de_*` a šestnáct kusů výbavy `dg_*`, tedy 25 dílů
a 75 textů.

- `DUCK_EYE` (9), `DUCK_GEAR` (16). Výbava má **dvě půlky**, `back` a `front`,
  a `duckSVG` je kreslí na dvou různých místech, aby plovací kruh mohl obepnout
  tělo (zadní oblouk za tělem, přední před ním), batoh a nádrž mohly viset za
  ocáskem a míč mohl ležet před tělem.
- Oči sedí na kotvě `DUCK.EYE`, výbava na `DUCK.BODY`, `DUCK.WING`
  a `DUCK.WATER`.
- 25 názvů ve třech jazycích, testy jako v H3.

Oči (8 z podkladu + 1 z fotky): `de_brejle` sluneční brýle, tedy **dvě kulatá
tmavá skla s můstkem** (motiv z fotky, podklad ho měl) 8, `de_sport` sportovní
brýle 8, `de_rasy` **dlouhé řasy** 10 (z fotky), `de_potapec` plavecké brýle
s páskem 10, `de_dioptr` kulaté obroučky 12, `de_maska` karnevalová maska 12,
`de_klapka` klapka přes oko 14, `de_snorchl` **potápěčská maska s páskou přes
hlavu** 16, `de_lyze` lyžařské brýle 18. Celkem 108.

Výbava (14 z podkladu + 2 z fotky): `dg_motylek` motýlek 8, `dg_sal`
**šála kolem krku** 10, `dg_privesek` přívěsek s hvězdou 10, `dg_plavky`
plavky 12, `dg_mic` **černobílý fotbalový míč** 14 (z fotky), `dg_bubliny`
bublinky 14, `dg_kridla` křidélka 14, `dg_vlajecka` vlaječka 16, `dg_klic`
francouzský klíč 18, `dg_batoh` batoh 20, `dg_nadrz` **šedá dýchací nádrž na
zádech** 20 (z fotky), `dg_vesta` záchranná vesta 20, `dg_stit` štít 22,
`dg_kruh` plovací kruh 24, `dg_pneu` pneumatika 26, `dg_prkno` surf 30.
Celkem 278.

**Žádná pravidla vylučování nejsou.** Jedna vrstva, jeden díl, a přes sebe jde
obléknout cokoli. Skafandr přes brýle je legrační a legrační je v pořádku.
Zakazovat kombinace by znamenalo nabízet něco, co se pak tiše nestane, a to je
přímo proti principu „co hra neumí, to nenabízí“.

**Dvě pasti.** `de_maska` je ta nejcitlivější kresba celého kroku: karnevalová
maska se stužkou na boku, v barvě, kterou si nese vrstva, **nikdy černá
s pláštěm**. A `dg_privesek` je hvězdička na šňůrce, ne medaile; medaile se
schválně nedá koupit, protože je to jediná věc, kterou dítě v závodě vyjezdí,
a koupitelná medaile by ji znehodnotila.

**Co se proti plánu upřesnilo.** Ceny obou vrstev sedí, 108 a 278 součástek,
takže všech 65 dílů stojí 934, ne 939 ze souhrnu: vrstva Tělo je o 25 levnější
(120 místo 145) a vrstva Na hlavu o 20 dražší (314 místo 294).
Kačenka je vidět ze strany a má jedno oko, takže na obličeji je jen šest bodů
mezi okem a linkou klobouku a pět mezi okem a zobákem; **všechny oční díly
proto končí nejvýš na hranici `brim` a nejdál na `K.x`**, jinak se schovají pod
klobouk nebo vylezou na zobák, a `de_rasy` jsou jediný díl, který smí špičkou
linku klobouku přerůst, protože řasa je tenká jako čára. Oko zůstává vidět
u `de_rasy`, `de_dioptr`, `de_potapec`, `de_snorchl` (obroučka bez skla)
a u `de_maska`, která má **díru přes `fill-rule="evenodd"`**; tmavé sklo ho
zakrývá jen u brýlí, klapky a lyžařských, tedy tam, kde je zakryté i doopravdy.
`de_maska` se překreslovala třikrát: s ploutvičkovou mašlí na konci vypadala
jako ryba ležící přes obličej, takže má teď zoubkovaný horní okraj se zlatou
linkou a **dvě tkanice vedené dozadu po hlavě** místo mašle. Tmavá skla
(`de_brejle`, `de_sport`, `de_klapka`) mají obrys v pevné šedé, ne v kontrastní
barvě vrstvy: bílá linka kolem tmavého skla udělá z uhlíkové kačenky dvě
vyvalené oči. Výbava má **zadní půlku jen u čtyř dílů** (kruh, pneumatika,
batoh, nádrž) plus surf, který je celý vzadu, protože kačenka na něm sedí;
`dg_vlajecka` se naopak musela přestěhovat celá dopředu, protože praporek
kreslený za tělem si zakryl vlastní tyčku a vypadal jako trojúhelník ve
vzduchu. Kruh i pneumatika se kreslí **kvadratikou, ne eliptickým obloukem**,
aby si je test uměl přečíst zpátky, a obě mají pod sebou kontrastní linku,
jinak zmizí černá pneumatika na uhlíkové a červený kruh na ohnivé kačence.
`dg_kridla` jsou pás kolem křídla: prstenec z nich dělal druhý plovací kruh
a dva vyplněné laloky dva pomeranče. Strojová kontrola přibyla v okruhu 3e
`items.test.js` a kromě rámu a kotev měří i **pořadí vrstev v hotovém SVG**,
tedy zadní výbava, tělo, vzor, oko, oční díl, klobouk, přední výbava.

### H5. Dílna ukazuje, kam součástky jdou — HOTOVO 14. září 2026

Proti plánu se upřesnilo tohle: přepnutí štítku je opravdu jen změna textu, tedy
číslo pod ním zůstává tím samým `p.parts` a žádný nový součet ani pole v profilu
kvůli němu nevzniká, a když už není co koupit, tlačítko „utrať součástky“ se
přestane nabízet místo aby mířilo do prázdné sekce.

Tady se dořeší otevřená otázka kroku 3b.

- **Rozhodnutí 3b nepadá, jen se odsouvá.** Nátěry stojí dohromady 390
  součástek, plná zakázka dá patnáct, takže po šestadvaceti zakázkách je
  obchod prázdný a bylo rozhodnuto, že se pak číslo přestane tvářit jako
  peněženka a začne říkat, kolik práce je hotové celkem. Kačenčí díly za
  939 součástek jsou dalších zhruba 63 plných zakázek, tedy dohromady
  s nátěry kolem devadesáti; to je řádově školní rok při dvou zakázkách
  týdně. **Podmínka pro přepnutí štítku se proto rozšíří z „všechny nátěry“
  na „všechny nátěry a všechny díly“**, jinak nic. **Hotovo:** `shelvesEmpty(p)`,
  tedy `partsShelves(p).length === 0`; ani samotné nátěry, ani samotné díly
  štítek nepřepnou a test to zkouší ve všech čtyřech kombinacích. Přepne se
  štítek pod celkovým číslem na výsledku zakázky (`statPartsAll` →
  `statPartsWork`) a věta dole v dílně (`shopPartsNote` → `shopPartsDone`);
  číslo samo zůstává `p.parts`.
- Tlačítko „utrať součástky“ po zakázce dnes skáče na `#paintsec`; má mířit
  tam, kde ještě něco koupitelného zbývá, tedy případně rovnou do kačenčí
  sekce. Sekce v garáži jsou od téhle chvíle řazené od nejlevnějšího dílu,
  aby první dlaždice byla ta, na kterou dítě má. **Hotovo:** rozhoduje o tom
  `partsShelves(p)`, které vrací seznam sekcí, ve kterých ještě něco zbývá,
  v pořadí, v jakém je garáž ukazuje; akce se přejmenovala z `paintshop` na
  `spendparts`, protože už nevede jen k nátěrům. Řazení od nejlevnějšího sedělo
  už z H2 až H4, uvnitř každé vrstvy i mezi vrstvami (0, 6, 6, 8, 8).
- Kruhové okno nad pultem (`revealSVG`) kreslí vlastního závodníka dítěte,
  takže kačenku odkrývá samo; ověřit, že se do kruhu vejde i s kloboukem
  a se skafandrem, protože ty jdou nad obrys hlavy. **Ověřeno na renderu:**
  kačenka má viewBox 100 × 118, takže se do okna vejde na výšku a zbyde jí
  po stranách; vykreslených bylo všech šestnáct kusů výbavy s nejvyššími
  klobouky, plus skafandr, cylindr, koruna, rohy, kruh a pneumatika, a nic
  se o rám kruhu neuřízlo.
- **Pravidlo „součástky se nedají vyjezdit a mince se nedají vydělat v dílně“
  se nemění ani o kousek.** Kačenčí díly jsou výhradně za součástky, nikdy za
  mince, i kdyby to bylo pohodlné. Když se 939 součástek ukáže jako moc,
  správná páka je **zlevnit ceny, ne změnit měnu**; rozdělení měn je jediná
  věc, která dílnu drží při životě.
- Testy: `flow.test.js` koupí díl za součástky a ověří, že ho kačenka nese
  a že se odečetly součástky, ne mince; a že po koupení všeho štítek změní
  význam. **Hotovo:** nákup dílu za součástky hlídá okruh „kačenčiny barvy“
  z H2, nový okruh „kam součástky jdou“ přidal deset kontrol: kam míří utrata
  ve třech stavech, čtyři kombinace nátěrů a dílů, text dílny před přepnutím
  i po něm, štítek a tlačítko na výsledku zakázky, a že se s přepnutím do
  dílny nedostaly stopky ani body za rychlost.

**Past.** Garáž naroste zhruba na devadesát dlaždic a každá je celá kačenka,
tedy devadesát SVG na jedné obrazovce. Komentář u sbírky nálezů říká, že celá
sbírka je schválně **jedna** kresba právě kvůli počtu uzlů; tady hrozí přesně
to, čemu se tam vyhýbalo. Pokud se to na telefonu projeví, řešení je menší
náhled dlaždice nebo kreslit v dlaždici jen vybíranou vrstvu nad šedou
siluetou, ne zmenšit katalog.

**Past se potvrdila a je o čtvrtinu horší:** dlaždic je 115, ne devadesát,
a sedmdesát z nich je celá kačenka. Leželo to jako rozhodnutí **R11** v oddílu 9
a padlo 14. září 2026: nejdřív se změřilo (2368 uzlů), pak se udělaly sbalitelné
police a k nim líné kreslení, protože samo sbalení na padesát vlajek nestačilo.
Katalog se nezmenšil.

### H6. Zvířata: přesnější kresba dvanácti dnešních — HOTOVO 14. září 2026

Proti plánu se upřesnilo tohle: R10 padlo **ano, ale bez změny identity**, takže
Lupi zůstává žlutým špičatouchým tvorem se skvrnami a Hvězdík žlutým tvorem
s rohem a žirafa s křečkem přijdou v H7 jako nová id; společný obal musel umět
o dvě věci víc, než plán čekal, tedy tvar si řekne, kam patří oči a pusa, a dvě
zvířata (sova a krokodýl) kreslí pusu vlastní, protože zobák a zubatá čelist
**jsou** ta pusa; hvězda stupně se odstěhovala zpod nebe nad hlavou do pravého
dolního rohu, protože vršek rámu zabraly uši, rohy a hřebínky; delfín a krokodýl
se musí kreslit z boku, zepředu je poznat nejde; a celá tabulka je psaná bez
jediného otočení a jen absolutními příkazy v cestách, což je to jediné, díky
čemu si test umí body přečíst zpátky z kresby a ohlídat rám ve všech třech
stupních.

**Nejdřív rozhodnutí R10 z oddílu 9. Bez něj se tahle část nedělá.**

Dnešních dvanáct zvířat je jeden tvar s parametry (`body`, `ear`, `ex`, `pat`),
takže výsledek je vždycky týž kulatý tvor, který má jednou špičaté a jednou
kulaté uši. Dítě v něm nepozná konkrétní zvíře, protože tam žádné konkrétní
zvíře není.

- `PET_SHAPES` jako **tabulka funkcí, jedna na zvíře**. `petSVG(it, stage)`
  je pak jen dispatcher plus společný obal: měřítko podle stupně, oči, úsměv
  a hvězda na stupni 3. Sdílené pomocné funkce (`earTri`, `earRound`,
  `earLong`, `legs`, `tail`, `snout`, `spots`, `stripes`) drží každé zvíře na
  šesti až dvanácti řádcích.
- Nepovinný háček `extra(stage)`: lvu povyroste hříva, ježkovi přibude řada
  bodlin, žirafě krk, drakovi se rozevřou křídla (což dnes dělá natvrdo
  `ex === "wings" && s >= 2`). Tři stupně a `EVO = [0, 70, 220]` se nemění.
- **Žádné id, žádná cena a žádné jméno se nemění.** Na id visí `owned` a `xp`,
  na ceně visí to, na co dítě šetří. Mění se jen kresba.

| id | dnešní jméno | zvíře | podle čeho ho dítě pozná |
| --- | --- | --- | --- |
| pet_mecha | Méďa | medvěd | kulatá ouška vysoko a daleko od sebe, světlejší čumáková skvrna, malé oči blízko u sebe, žádný ocas |
| pet_sova | Sovík | sova | srdcovitý obličejový závoj, obří kulaté oči s kroužkem, drobný háček zobáku, dvě pírka nahoře |
| pet_drak | Dráček | drak | hřebínek z pěti trojúhelníků po zádech, netopýří křídla se třemi prsty, ocas s hrotem |
| pet_zub | Zoubek | krokodýl | dlouhá plochá tlama s řadou trojúhelníkových zoubků, oči nahoře na hlavě, zubatý hřbet |
| pet_kiki | Kiki | králík | dvě dlouhá ouška s růžovým vnitřkem, bílý bambulkový ocásek, trojúhelníkový nosík, dva zuby |
| pet_lupi | Lupi | žirafa | velmi dlouhý krk, dva pahýlky s kuličkou, nepravidelné mnohoúhelníkové skvrny |
| pet_bimbo | Bimbo | delfín | protažený rypec, srpovitá hřbetní ploutev, ocas do V, jedna tmavá čárka místo oka |
| pet_puk | Puk | axolotl | tři pírkovité žábry po každé straně hlavy, široká usměvavá pusa, plochý ocas s lemem |
| pet_flek | Flíček | pes | jedno ucho klopené a druhé vztyčené, černý nos, tmavá skvrna přes oko, ocásek nahoru |
| pet_duha | Duháček | jednorožec | spirálový roh, hříva ze tří vln, kopýtka, ocas z vln |
| pet_hvezd | Hvězdík | křeček | baculaté tělo bez krku, kulatá ouška, dvě lícní torby, drobounký ocásek, oříšek v tlapkách |
| pet_noc | Noční | netopýr | blanitá křídla se třemi prsty, velké špičaté uši, nos do V, drobné nožky |

**Dvě jména jsou na hraně.** Lupi znělo vlkem a bude z něj žirafa (dnešní žlutá
se skvrnami je žirafa, ne vlk), Hvězdík znělo hvězdou a bude z něj křeček.
U obou se mění nejen kresba, ale i to, co to zvíře je; když to bude uživateli
vadit, dá se u nich nechat dnešní fantazijní tvar a zvíře doplnit jako nové id.
Patří to k rozhodnutí R10.

- Testy: platnost sprajtů pro všech dvanáct ve všech třech stupních, jména ve
  třech jazycích, plus **ruční renderování do PNG všech dvanácti ve všech třech
  stupních**; je to jediné místo, kde se pozná, jestli zvíře vypadá jako zvíře.

**Past.** Kresba je celá ta funkce a žádný test ji neuvidí; `items.test.js`
ověří, že SVG jde naparsovat a nevyjede z rámu, nic víc. A druhá: je to jediné
místo celého kroku H, kde nová verze sáhne na něco, co dítě už má.

### H7. Šestnáct nových zvířat — HOTOVO 14. září 2026

Proti plánu se upřesnilo tohle: nová zvířata se do `PETS` **vetkala podle ceny**,
ne přidala za konec, takže je katalog jedna řada od 25 do 200 mincí a nejlevnější
nové zvíře (kočka za 35) stojí míň než polovina nejdražšího dnešního; ceny sedí
podle plánu, jen je celkem 1820 mincí místo odhadovaných 1700. Tři zvířata si
řekla o `mouth:"own"`, protože jejich pusa **je** ta kresba (tučňákův klín zobáku,
žraločí a tyranosauří čelist se zuby), a slon taky, protože jeho úsměv obchází
chobot; papoušek a chobotnice si musely přestěhovat hvězdu třetího stupně, jednomu
zabírají pravý dolní roh ocasní pera a druhému chapadla. Přibyly čtyři sdílené
díly (`beads`, `whiskers`, `hexPlate` a vedle nich se znovu použily `ridge`,
`toothRow`, `paws`, `earTri`, `earRound`), takže šestnáct zvířat stojí zhruba
230 řádků. A po prvním renderu se předělávalo šest z šestnácti: kapybara dostala
hranatou hlavu s tmavým čenichem, aby nebyla druhý medvěd, ježkovi se obličej
posunul pod čepici z bodlin, protože uprostřed kruhu vypadal jako sluníčko,
želvě se nohy přestěhovaly před krunýř, jinak je krunýř celé schoval, lenochod
dostal tmavší masku a drápy přes větev, T-rexovi přibyly pořádné nohy a ručička
dál od těla a papouškovi chocholka ze tří per místo kudrlin.

Šestnáct položek v `PETS`, šestnáct tvarových funkcí v `PET_SHAPES`, 48 textů.
Vybíráno podle dvou kritérií zároveň: zvíře, které má malé dítě rádo,
a zvíře, jehož silueta se pozná i v kresbě široké 100 jednotek.

`pet_kocka` kočka, `pet_tucnak` tučňák, `pet_liska` liška, `pet_jezek` ježek,
`pet_zelva` želva, `pet_zaba` žába, `pet_slon` slon, `pet_lev` lev,
`pet_panda` panda, `pet_kapy` kapybara, `pet_lenochod` lenochod,
`pet_zralok` žralok, `pet_chobot` chobotnice, `pet_trex` T-rex,
`pet_berus` beruška, `pet_papous` papoušek.

Ceny 35, 45, 55, 65, 75, 85, 95, 105, 115, 125, 135, 150, 165, 180, 190, 200,
tedy asi 1700 mincí celkem neboli kolem 55 závodů. Seřazené tak, aby
**nejlevnější nové zvíře bylo levnější než nejdražší dnešní**; jinak by celá
nová řada vypadala jako zeď.

- Testy: platnost sprajtů, jména ve třech jazycích, `flow.test.js` koupí jedno
  za mince, ruční renderování všech šestnácti.
- **Pozor: `flow.test.js` čte seznam dlaždic v garáži a počty se posunou
  potřetí** (poprvé v H1, podruhé v H2, potřetí tady). Každý ten posun musí
  být vědomý a s komentářem, viz `tests/README.md`.
- Zvířata jsou zvířata, ne animované postavy. Kočka, liška, panda ani tučňák
  nejsou ničí; kreslí se podle skutečného zvířete. Drak, jednorožec a axolotl
  jsou generické mytologické nebo skutečné bytosti a nesmí být nakreslené
  podle konkrétní filmové podoby.

### H8. Dokumentace — HOTOVO 14. září 2026

Proti plánu se upřesnilo tohle: srovnání čísel bylo větší práce než dopsání
nového, protože dokumentace zaostávala už před krokem H. Klíčů v `i18n.js` je
**443 ve všech třech jazycích**, ne 427, jak stálo v oddílu 2; okruhů
v `items.test.js` je **pětačtyřicet**, ne šestadvacet, a šestadvacet jich
nebylo už dávno před krokem H (před ním jich bylo 39, krok H přidal šest);
`flow.test.js` má **231 kontrol**, ne 191, protože zápis se naposledy srovnával
u D3 a nezachytil ani D4. Oddíl 6 mluvil o startovní **šestce** závodníků,
od H1 je jich sedm. A oddíl 4b popisoval tlačítko „utrať součástky“ tak, jak se
chovalo do posledního commitu kroku H, tedy že míří do první neprázdné sekce;
dnes míří do první, na kterou dítě má.

Nad rámec srovnání přibyl **oddíl 7f**, celý kačenčí model psaný jako 7b až 7e,
tedy proč a ne jen co: co je vrstva, kotvy a proč se počítají při každém
kreslení, ořez vzoru staženým `clipPath`, kontrola kontrastu `partInk()`,
z-order a **pravidlo o autorských právech u kresby** s kontrolní otázkou „když
se u dílu dá říct jméno postavy, je špatně“. Oddíl 9 dostal tři chyby kroku H,
oddíl 14 dva nové kontrolní seznamy (nový kus výstroje, nové zvíře) a oddíl 2
se srovnal do jednoho odstavce o tom, že se dnes renderuje přes `cairosvg`.
Nové je taky **rozhodnutí R11** v oddílu 9 tohohle plánu, tedy počet dlaždic
v garáži; past z H5 se potvrdila a je o čtvrtinu horší, než plán čekal.

- `PROJECT-STATE.md`: **stav v číslech**, oddíl 2 (renderování a počet klíčů),
  oddíl 4b (kam jdou součástky, odpověď na 3b), oddíl 6 (`duckParts`, `duck`,
  `seedDuck()`, `seedStarters()`, fixture `v12-pred-kacenkami`), oddíl 7 bod 4
  (`duckSVG`, `DUCK` a jeho kotvy, `isPet()`, `PET_SHAPES`), **nový oddíl 7f**,
  oddíl 8 (počty kontrol a šest nových okruhů), oddíl 9 (tři opravené chyby),
  oddíl 14 (dva nové kontrolní seznamy a posunutá čísla). Oddíl 5 beze změny,
  trati se to netýká.
- `ROADMAP.md`: kačenka dopsaná do rytmu z oddílu 3, tedy do okna mezi třetím
  a šestým týdnem.
- `docs/PLAN.md`: krok H označený za hotový, nové rozhodnutí R11. Krok 3b byl
  za dořešený označený už v `PLAN-2026-09-12.md` u H5.
- `tests/README.md`: osmadvacet zvířat místo dvanácti a posunutá čísla.

### Co se kde mění, souhrnně

| soubor | co |
| --- | --- |
| `src/app.js` | `DUCKS`, `DUCK`, `duckSVG()`, `isPet()`, `DUCK_BODY/PAT/HEAD/EYE/GEAR`, `wearDuckPart()`, `seedDuck()`, `newProfile()`, `STARTERS`, `ALL_ITEMS`, `itemSVG()`, `viewCollection()`, obsluha `buyduck`/`useduck`, podmínka štítku součástek, `PET_SHAPES` + 28 tvarů, `petSVG()` |
| `src/i18n.js` | asi 240 nových klíčů: 65 dílů + 16 zvířat + kačenka + nadpisy vrstev + hlášky nákupu, vše ve třech jazycích |
| `src/styles.css` | pravděpodobně nic; sekce dílů použijí dnešní `.grid` a `.item` |
| `tests/fixtures/legacy-profiles.json` | jeden nový zamrazený profil (H2) |
| `tests/migration.test.js` | kontrola `duckParts` a `duck` |
| `tests/items.test.js` | nové okruhy: kačenka, každý díl kačenky, každé zvíře |
| `tests/flow.test.js` | posunuté počty (H1, H2, H7), nákup dílu za součástky |
| `tests/names.test.js` | projde samo, ale počty v jeho výpisu narostou |

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

**Stav k 14. září 2026.** Otevřená jsou tři: **R1** (učivo minulých let
otevřené staršímu dítěti), **R8** (mapa z modelového ŠVP dřív než ověřený
Matýsek, **na tomhle visí krok G0**) a **R9** (učitelský žargon v názvech
kapitol na dětské mapě). Rozhodnutá jsou **R2 až R7, R10 a R11**, všechna podle
doporučení, a je to u nich napsané i s krokem, ve kterém se to udělalo.

**R1. Žebřík dřívějšího ročníku pro starší dítě. OTEVŘENÉ.** Profil třetího nebo
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

**R2. Rozhodnuto 14. září 2026 podle doporučení, hotovo v E1.**
**Klíč dělení se zbytkem.** Rodina po dělitelích `r2` až `r10` (návrh
plánu) proti vyčíslitelným `r{dělenec}x{dělitel}` (`TEMATA.md`). Doporučení:
rodina po dělitelích, důvody v E1.

**R3. Rozhodnuto 13. září 2026 podle doporučení, hotovo v D4.**
**Chybějící člen pod původním klíčem.** `missing_operand` zapisuje do
krabičky pod klíč původního příkladu (`m6x7`), takže `6 × 7` a `▢ × 7 = 42`
sdílí úroveň. Alternativa je vlastní hlavička a vlastní klíče, tedy druhá
krabička pro totéž učivo a druhá sbírka. Doporučení: původní klíč, jak stálo
v předchozím plánu; `inverse_check` se do varianty skládá, viz D4.

**R4. Rozhodnuto 13. září 2026 podle doporučení, hotovo v B.**
**Poloha řetězce na mapě.** Před `beyond`, v pořadí knihy. Alternativa
za `round`, aby se pořadí hotových tratí nehnulo. Doporučení: před `beyond`.

**R5. Měřítka písma. Rozhodnuto 13. září 2026 podle doporučení, hotovo v C4.**
1,25 / 1,12 / 1,04 / 1,0 pro první až čtvrtý ročník.
Jsou to odhady k ověření na dítěti; první úprava má být na jednom místě
v CSS, ne v kódu, a je jí pět řádků s `--tx` v `src/styles.css` hned pod
`--appw`.

**R6. Mapa na tabletu. Rozhodnuto 13. září 2026 podle doporučení, hotovo v C3.**
Tři sloupce na tabletu, čtyři od 900 px. Hadovité řazení, se kterým se to
udělalo, padlo týž den po hraní s dítětem; místa se čtou po řádcích zleva
doprava, viz C3b.
Alternativa: nechat dva sloupce a jen zvětšit karty. Doporučení: sloupce,
protože dva sloupce na 1024 px dávají kartu 45 % široké a náhled velikosti
poloviny obrazovky, což už není mapa.

**R7. Rozhodnuto 13. září 2026 podle doporučení, hotovo v A.**
**Co přežije vynulování postupu.** Návrh v A2: nastavení zůstávají,
postup se maže. Alternativa je dnešní stav, kdy se maže všechno včetně ročníku,
což je skoro jistě nezáměr.

**R8. Mapa z modelového ŠVP dřív než ověřený Matýsek. OTEVŘENÉ, blokuje G0.**
Dnes jsou v aplikaci
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

**R9. Název kapitoly na dětské mapě je učitelský žargon. OTEVŘENÉ.** `trackSub()` dává
trati "Co máte ve škole" jako podtitulek název kapitoly z učebnice, tak jak
stojí v `src/curricula.js`. Ty názvy jsou psané pro učitele a rodiče, takže
osmiletý čte na svojí mapě "Početní operace se závorkami" (kapitola 13),
"Sloučené početní operace" (kapitola 30) nebo "Početní operace v oboru 0 až
39" (kapitola 13 druhého ročníku). Není to chyba kroku D1, vzorec je starší
a týká se všech pětadevadesáti kapitol; nová kapitola jen přidala další
jazykolam. Kreslí se to na dvou dětských místech, na kartě mapy a v nabídce
závodníka před startem, a obojí jde přes `trackSub()`, tedy přes jedno místo.
Dvě cesty ven: **(a)** dopsat do každé kapitoly v `curricula.js` dětský název
vedle učebnicového a ukazovat dítěti ten, nebo **(b)** na dětských
obrazovkách název kapitoly neukazovat vůbec a nechat tam `trk_schools`, tedy
"podle učebnice"; rodič má název dál v nabídce kapitol i v rodičovské sekci,
kde se právě podle něj vybírá a kde sedět s učebnicí musí. Doporučení: **(b)
hned a (a) později**, protože oddíl 3 `PROJECT-STATE.md`, tedy nedotknutelné
principy, říká, že žádný text v dětské části
nesmí obsahovat učitelský žargon, a to je pravidlo o tom, co dítě čte, ne
o tom, kde se to vzalo. (b) je jeden řádek v `trackSub()` a platí okamžitě
pro všechny kapitoly, včetně těch, které teprve přibudou; (a) je pětadevadesát
nových názvů, a pokud se má chovat jako zbytek rozhraní, tak v každém ze tří
jazyků, tedy práce na celý krok. Až (a) přijde, dá se přidávat po kapitolách:
volitelné pole `kid` na kapitole, `trackSub()` vezme `kid`, když je, jinak
neutrální text, a učebnicový název dítěti nedá nikdy. Pokud ne, zůstává dnešní
stav a dítě čte, co stojí v knize.

**R10. Rozhodnuto 14. září 2026 podle doporučení, hotovo v H6 a H7.**
Uživatel výslovně žádal zvířata, která vypadají jako konkrétní zvířata, takže
se překreslilo deset z dvanácti a Lupi s Hvězdíkem si nechali svou identitu;
žirafa a křeček přišli v H7 jako nová id. Původní zadání otázky:
**Smí se překreslit dnešních dvanáct zvířat?** Krok H6 chce nahradit
jeden parametrický tvar dvanácti vlastními kresbami, aby Méďa vypadal jako
medvěd a Kiki jako králík. Formálně se neztratí nic: id, jméno, cena, `xp`
i `owned` zůstávají, takže krabička, sbírka ani mince se nehnou a
`migration.test.js` nemá co chytat. **Je to ale jediné místo celého kroku H,
kde nová verze sáhne na něco, co dítě už má.** Hra běží na cizích telefonech
a nová verze se do nich dostane sama při dalším načtení, takže se dítě jednoho
rána podívá a Kiki bude vypadat jinak, aniž by se ho kdokoli zeptal. To je
věcně něco jiného než přidaný obsah a rozhodnout to má uživatel.

Doporučení: **ano, překreslit, ale ne samostatně.** Tři důvody. Za prvé, dnešní
dvanáctka není dvanáct zvířat, je to jeden tvar s přepínači, a celé zadání
kroku H zní „hodně zvířátek, která opravdu vypadají jako konkrétní zvířata“;
nechat dvanáct obecných tvorů vedle šestnácti poznatelných zvířat je horší než
obě čistá řešení, protože ve stejné mřížce by stály dvě různé kresebné řeči
a ta stará by vypadala jako chyba. Za druhé, ztráta je menší, než se zdá:
jméno i barva zůstávají a zvíře se ke každému vybíralo právě podle nich, takže
růžová Kiki s dlouhýma ušima zůstane růžová Kiki s dlouhýma ušima, jen nakreslená
líp. Za třetí, čím dřív se to udělá, tím míň dětí to potká; za rok bude
dvanáctka zaběhaná víc než dnes a cena stejného kroku bude vyšší.

Dvě podmínky k tomu doporučení. **H6 a H7 se mají vydat spolu**, v jedné verzi,
aby to dítě četlo jako „zvěřinec vyrostl“ a ne jako „vyměnili mi parťáka“.
A **Lupi a Hvězdík jsou jiný případ než zbylých deset**: u nich se nemění jen
kvalita kresby, ale i to, co to zvíře je (Lupi zní vlkem a byla by z něj
žirafa, Hvězdík zní hvězdou a byl by z něj křeček). Tam doporučuju **nechat
dnešní fantazijní tvar** a žirafu s křečkem přidat jako nová id v H7; nic se
tím neztratí, jen se přidá, a překreslených zůstane deset.

Pokud ne, zůstává dnešní kresba a H6 se vypustí; H7 pak přidá šestnáct
poznatelných zvířat vedle dvanácti obecných a s tím rozdílem se bude muset žít.
Střední cesta, tedy překreslit jen ta zvířata, která dnes vypadají nejhůř,
se nedoporučuje: to je právě ten stav dvou kresebných řečí v jedné mřížce.

**R11. Garáž má po kroku H sto patnáct dlaždic a sedmdesát z nich je celá
kačenka. ROZHODNUTO 14. září 2026 podle doporučení, a to obojí: sbalitelné
sekce i líné kreslení.** Nejdřív se změřilo, jak plán žádal. Garáž dneška
postaví **115 dlaždic, 2368 uzlů a 159 kB HTML**; s padesáti vlajkami přidanými
jako vzor na kačenku by to bylo **165 dlaždic, 3713 uzlů a 251 kB**. Měřeno nad
skutečným kódem, zdroje načtené do node se zaslepeným `document` jako
v `items.test.js`, uzly spočítané jsdomem.

Pak **sbalitelné sekce**: šest polic pod závodníky, tedy nátěry a pět kačenčích
vrstev, se skládá a **otevřená je vždycky jedna**. Sbalená police se nekreslí
vůbec, ne že by se jen schovala. Závodníci, tedy stroje, zvířata a kačenka, se
neskládají nikdy: je to výběr závodníka, který se jen řadí a nikdy nefiltruje.
Sbalená police o sobě na jednom řádku řekne, co v ní je, kolik toho je, kolik
už toho dítě má a od kolika, a na druhém řádku to, co z ní má dítě na sobě,
takže katalog s cenami nezmizel a police, ze které něco nosí, nikdy nečte jako
prázdná. Stav sbalení drží proměnná `SHELF` s id profilu, přesně jako `PEEK`
a `BACK`, takže se do profilu nedostane a zavření hry i přepnutí hráče ji
složí. Utrata součástek z dílny cílovou polici rovnou otevře.

Samo sbalení ale na těch padesát vlajek **nestačilo, a je to vidět z měření**:
vlajky jdou do jedné jediné vrstvy, takže by police vzorů měla jednašedesát
dlaždic a garáž s ní otevřenou **2591 uzlů**, tedy víc, než má dnes celá garáž.
Proto se udělalo i **líné kreslení**. Dlaždice otevřené police se píše ve dvou
kusech: tlačítko se jménem a cenou, tedy to, co dítě čte a na co klepá, a
kresba, která se doplní, teprve až se dlaždice přiblíží k zornému poli
(`IntersectionObserver`, `rootMargin` 400 px). Prvních osm dlaždic police se
kreslí rovnou, aby to, na co se police otevře, nebyla řada děr. **Nový stav to
do kódu nepřidává**: co se má nakreslit, stojí na samotné dlaždici jako
`data-draw`, takže obrazovka se pořád kreslí z profilu. Prohlížeč bez
`IntersectionObserver` dostane všechny kresby při připojení obrazovky, tedy
přesně dnešní chování.

Výsledek: garáž se otevírá na **37 dlaždicích a 962 až 1009 uzlech** podle toho,
jak je kačenka oblečená, s největší otevřenou policí má **nejvýš 1489 uzlů**,
a s padesáti vlajkami by police vzorů vyšla na **1537 uzlů a 104 kB**, tedy pořád
hluboko pod dneškem. Hlídá to kontrola ve `flow.test.js` se **stropem 1800
uzlů**, měřená na skutečném DOM se zaslepeným pozorovatelem; spadne, až garáž
povyroste zhruba o dalších sedmdesát dlaždic, nebo až někdo skládání či líné
kreslení vypne. Náhled jen hlavy se neudělal, jak plán říkal, a stránkování
taky ne. Katalog se nezmenšil ani o dlaždici.

**Jak to dopadlo, když vlajky opravdu přišly** (14. září 2026, pár hodin po
tomhle rozhodnutí): vlajek je osmačtyřicet, ne padesát, a nevisí na jedné polici,
ale **na pěti podle světadílu**, takže nejdelší otevřená police má pořád
jednadvacet dlaždic jako před nimi a odhad 1537 uzlů se nenaplnil. Garáž má dnes
**167 dlaždic**, tedy o polovinu víc než 115 před R11, a přesto sbalená dělá
**992 až 1104 uzlů** a s největší otevřenou policí **nejvýš 1519**. Největší
police není nejdelší, ale nejhustší, tedy kreslené vzory: dlaždic má deset, ale
šachovnice i mapa světa jsou samy o sobě dvacet tvarů. Bez skládání a líného
kreslení by dnešní garáž dělala **6875 uzlů** a strop by překročila šestkrát.
Model celé garáže je v `PROJECT-STATE.md` oddílu 7g.

Původní zadání rozhodnutí: past z H5 se potvrdila a je horší, než jak ji plán odhadoval: čekalo
se devadesát dlaždic, skutečnost je 115, tedy o čtvrtinu víc. Rozpad je osm
strojů, osmadvacet zvířat, jedna kačenka, devět nátěrů (osm plus prázdná
dlaždice) a devětašedesát kačenčích dílů (65 plus čtyři prázdné, kterými se
vrstva sundá). **A každá z těch sedmdesáti kačenčích dlaždic je vlastní SVG**,
protože dlaždice ukazuje celou kačenku s tím jedním dílem, ne barevný čtvereček;
to je správně, barevný čtvereček dítěti neřekne nic o tom, jak to bude vypadat,
a stejný důvod má dnešní `paintCells()`. Cena za to je počet uzlů na jedné
obrazovce.

**Proč to stojí za rozhodnutí a ne za tichou opravu.** Přesně tomuhle se
v projektu už jednou vyhýbalo: **sbírka nálezů je schválně jedna kresba místo
jednoho prvku na místo**, protože do dvacítky jich padne sto dvaaosmdesát a přes
všechny tratě přes čtyři sta; je to napsané v `PROJECT-STATE.md` oddílu 7 bodu 4
u `tokenGridSVG()`. Garáž ten princip porušuje, a porušuje ho vědomě, protože
sbírka nálezů je jedna kresba téhož tvaru v mřížce, kdežto tady je každá
dlaždice jiná kačenka. Sloučit je do jedné kresby tedy nejde; jde jen zmenšit
to, co se kreslí, nebo kdy se to kreslí. **Změřeno to na telefonu zatím není**,
takže první krok je změřit, ne opravovat.

Čtyři cesty, které se nabízejí, od nejlevnější:

- **Sbalitelné sekce.** Každá z pěti vrstev plus nátěry začne složená a rozbalí
  se klepnutím; složená sekce se nekreslí vůbec. Dítě uvidí nejvýš jednu vrstvu
  naráz, tedy nejhůř dvacet dlaždic. Je to nejmenší zásah, nic se neztratí
  a mechanika skládání a rozbalování v aplikaci už je, na mapě za dveřmi
  minulých let.
- **Náhled jen hlavy místo celé kačenky.** Vzor, klobouk a oční díl sedí na
  hlavě, takže by dlaždici stačil výřez kolem hlavy; ubere to zhruba dvě
  třetiny uzlů. Nefunguje ale na vrstvě Výbava a na Tělo, kde je vidět právě
  to, co je na těle, takže by garáž kreslila dvěma různými způsoby a to je
  přesně ta dvojí kresebná řeč v jedné mřížce, kterou zakázalo R10.
- **Líné kreslení.** Dlaždice se vykreslí, teprve až se přiblíží k zornému poli
  (`IntersectionObserver`). Nejúčinnější a zároveň jediná cesta, která přidává
  do kódu stav a možnost prázdné dlaždice; hra je dnes celá „vykresli obrazovku
  z profilu“ a tohle je první místo, které by to porušilo.
- **Stránkování vrstev.** Vrstva by měla vlastní obrazovku a garáž jen šest
  odkazů. Nejméně uzlů, nejvíc klepání a dítě ztratí přehled o tom, co všechno
  existuje, což je u katalogu, který je celý vidět od první chvíle, ztráta.

**Doporučení: nejdřív změřit, pak sbalitelné sekce, a líné kreslení až tehdy,
když sbalení nestačí.** Sbalení řeší problém tam, kde vzniká, tedy že se kreslí
sto patnáct dlaždic naráz, přitom dítě se dívá na jednu vrstvu; nepřidává do
kódu žádný nový stav, nic neschovává natrvalo a dá se vydat samostatně. Náhled
jen hlavy se nedoporučuje vůbec, protože rozbíjí jednotu mřížky, a stránkování
je až poslední možnost. **Katalog se v žádném případě nezmenšuje**; dílů je 65,
protože z nich má jít poskládat 392 700 kačenek, a zmenšit katalog kvůli
výkonu by bylo řešení opačným koncem.

---

## 10. Jak s plánem pracovat: hlavní session řídí, subagenti implementují

`src/app.js` má k 14. září 2026 **přes osm tisíc řádků**, `i18n.js` čtrnáct set
a testy dalších pět a půl tisíce; když tenhle plán vznikal, byla to necelá
polovina. Session, která si to všechno načte a pak implementuje tři
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
generátor po rozhodnutí R2; F jeden; H1 až H8 po jednom
a v pořadí, protože všechny sahají do `app.js`, H6 a H7 až po rozhodnutí R10.
**Zbývá jen G, a to jsou dva subagenti**: G0 po rozhodnutí R8, G1 až po ověření
map ze skutečných stránek. Nesahají si do stejných míst, takže na sobě
nezávisí ani v pořadí.

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
