# Stav projektu a předávací dokument

Poslední aktualizace: 14. září 2026, po krocích A, B0, B, opravě B0b, celém kroku C,
celém kroku D, **celém kroku H** a **krocích E1 a E2** nového plánu, opravě řazení mapy (C3b)
a opravě nálezů z kontroly D1 a D2 (barvy palet, registr hlaviček, dokumentace)

**Kde se přestalo.** Z `docs/PLAN.md` je hotový **krok 1** (rodičovská heatmapa
nad všemi rodinami), **první dvě položky kroku 2** (`mult_beyond` s `div_beyond`
a trať `beyond`, `rounding_10` s `rounding_100` a trať `round`), celý **krok 3**
(sbírky vázané na Leitnerovu krabičku, včetně dílny) a celý **krok 4** (čtyři
světy a mapa jako krajina). K tomu dvě věci, které v plánu nebyly a přišly ze
zadání a z hraní, kroky **4c** a **4d**: ročník v profilu s ukázkou dalšího roku,
a rozdělení prvního ročníku na šest číselných oborů.

**Stav v číslech.** Sedmadvacet tratí ve čtyřech světech, 108 palet prostředí,
dvě zakázky v dílně, 88 hratelných kapitol z 95 (první ročník 18/18, druhý 43/44,
třetí 27/33), sedmatřicet závodníků (osm strojů, 28 zvířat, gumová kačenka),
osm nátěrů za 390 součástek a 65 dílů kačenčí výstroje za 934 součástek v pěti
vrstvách, 457 klíčů rozhraní ve třech jazycích, šest testových souborů.

**Co se v téhle session událo, stručně.** Sbírka vázaná na krabičku a odkrývané
okno v dílně (krok 3). Čtyři světy, ve kterých se mění **tvar cesty a její cíl**,
ne jen barvy, a mapa přestala být svislým seznamem (krok 4). Ročník, podle
kterého se skládá mapa, s ukázkou dalšího roku za dílnou (4c). První ročník
rozložený na šest oborů podle učebnice, protože prvňák dostával 20 - 10, a
přechod přes desítku přesunutý do druhé třídy (4d). Zakázky dílny dostaly ročník
a přibylo počítání dílků pro prvňáky, čímž je první ročník pokrytý celý.

**13. září proběhla revize celého repozitáře** (kód, dokumentace, testy,
vyrenderované obrazovky na telefonu a tabletu v obou orientacích) a z ní vznikl
`docs/PLAN.md` verze 2. Mechanika je v pořádku, testy procházejí; našlo se šest
drobných chyb k opravě (krok A plánu, mimo jiné nestabilní míchání fronty
a vynulování postupu, které bere ročník) a jedno velké téma: hra není
responzivní, na telefonu na šířku se závod ani dílna nevejdou na obrazovku,
na tabletu běží v úzkém sloupci a písmo nerozlišuje ročník (krok C plánu).

Tentýž den přišlo z hraní: syn s nastavenou třetí třídou viděl mapu jako
pokračování prvních dvou tříd bez předělu, takže dřívější ročníky se mají
složit a rozbalovat jen na žádost (krok B0 plánu; mění rozhodnutí z oddílu 7d).

**Krok A je hotový** (13. září): míchání fronty už nedá dvě stejné otázky za
sebou, vynulování postupu nechá rodiči nastavení včetně ročníku, výsledek
zakázky rozliší dvě různé chyby v počítání dílků a tři místa v CSS jsou
srovnaná (`dvh` až za `vh`, strop výšky spodního listu, mrtvé selektory pro
nízké displeje). Při tom se ukázalo, že `flow.test.js` a `names.test.js`
padaly na zastaralém kroku a poslední kontroly nedobíhaly; opravené je to taky.

**Krok B0 je hotový** (13. září): dřívější ročníky jsou na mapě složené za
dveřmi, nad letošním blokem stojí milník s ročníkem a nic z toho se nezapisuje
do profilu.

**Krok B je hotový** (13. září): řetězec tří čísel se dvěma znaménky, kapitola
11 třetího ročníku, jako trať `chain` s hlavičkou klíče `q` a třemi kbelíky.
Na mapě stojí před `beyond`, tedy v pořadí učebnice. K tomu přibylo, že dlouhé
zadání si samo řekne o menší písmo, protože `47 + 5 - 3 = ?` se v plné velikosti
na telefon nevejde.

**Oprava B0b je hotová** (13. září): skládání se ptalo na rok, ve kterém se
učivo zavádí, a schovalo tím třeťákovi malou násobilku, stovku i hodiny, tedy
to, čím třetí třída začíná. Tratě mají od téhle opravy vedle `grade` i `thru`,
poslední ročník, ve kterém se učivo ještě opakuje, a `yearOf()` se ptá na
rozsah. Třeťákovi zůstalo za dveřmi sedm tratí, obory prvního ročníku a most,
a v hlavním bloku má rovnou otevřenou násobilku a hodiny. Druhák dveře nemá
vůbec, protože celý první ročník opakuje. Viz oddíl 7d.

**R1 z oddílu 9 plánu zůstává neudělaná a už netlačí.** Byla to odpověď na to,
že čerstvý třeťák nemá na mapě jediné místo, na které jde klepnout; tenhle
důvod padl s opravou B0b, protože násobilka i hodiny jsou otevřené od začátku.
R1 (otevřít staršímu dítěti celé minulé roky) je tedy dnes jen pohodlí navíc
a čeká na rozhodnutí uživatele.

**Krok C je hotový** (13. září), ve dvou commitech. První dal hře celou plochu:
rozvržení se rozhoduje v JS a stojí jako `data-w` a `data-o` na `<html>`, závod
i dílna se na šířku skládají do dvou sloupců, mapa má podle šířky dva, tři nebo
čtyři sloupce a manifest dovolí obě orientace. Druhý (C4 a C7) přidal měřítko
písma podle ročníku: jedno `--tx` v CSS, které `render()` zapíná přes
`data-grade` na `<html>`, prvňák čte o čtvrtinu větší písmo než čtvrťák a žádný
dětský text nezačíná pod 12,5 px. K tomu šestý testový soubor
`tests/style.test.js`, který hlídá pravidla CSS textově, protože jsdom rozvržení
nemá. Viz oddíl 7e.

**Krok D1 je hotový** (13. září): pořadí operací, kapitoly 13 a 30 třetího
ročníku, jako trať `ops` s hlavičkou klíče `z` a čtyřmi kbelíky. Na mapě stojí
mezi `chain` a `beyond`, tedy v pořadí učebnice, a otevírá se od celé malé
násobilky. Proti plánu se upřesnil čtvrtý kbelík, viz oddíl 4 a `docs/PLAN.md`.

**Oprava C3b je hotová** (13. září): mapa se přestala číst hadovitě. Krok C
řadil místa boustrofedonem, tedy druhý řádek zprava doleva, a dva sloupce na
telefonu byly tentýž had, jen užší. Uživatel to zkusil s osmiletým synem
a dítě nepoznalo, kudy cesta pokračuje. Od téhle opravy se místa řadí tak, jak
se čte stránka, tedy po řádcích zleva doprava, ve všech šířkách, a na konci
řádku se cesta vrací prázdným pásem mezi řádky k levému okraji. Viz oddíl 9.

**Krok D2 je hotový** (13. září): násobení a dělení deseti, stem a kulatou
desítkou, kapitola 28 třetího ročníku, jako trať `tens` s hlavičkou klíče `g`
a dvěma kbelíky v obou směrech. Na mapě stojí hned za `beyond`, protože je to
tentýž početní krok o stupeň dál, a odtud se taky otevírá. Proti plánu se
upřesnilo, že součin smí dosáhnout na celý tisíc, viz oddíl 4 a `docs/PLAN.md`.

**Krok D3 je hotový** (13. září): převody jednotek délky, hmotnosti, objemu
a času, kapitoly 18 a 29 třetího ročníku, jako trať `units` s hlavičkou klíče
`u` a čtyřmi kbelíky podle druhu veličiny, každý v obou směrech. Je to první
rodina, jejíž **odpověď nese jednotku**: položka ji říká sama přes pole `unit`,
kreslí ji `questionHTML()` za odpovídací políčko a měří se do délky řádku.
Na mapě stojí hned za `a1000`, protože kilometr je tisíc metrů, a odtud se taky
otevírá. Proti plánu se upřesnilo, že do tisíce zůstává i číslo v zadání, ne
jen odpověď, viz oddíl 4 a `docs/PLAN.md`.

**Oprava po kontrole kroků D1 a D2 je hotová** (13. září): tři palety trati
`chain` byly barevně totéž co jejich sousedi a vizuální kontrola u kroku B to
neukázala, protože `convert` přechod vůbec nekreslí, viz oddíl 9. `marsh` je
teď tmavě bahenní zelená, `sk_haze` modrá obloha s fialovým oparem na obzoru
a `dp_shoal` světlá lastura na dně pod jasnou vodou; nejbližší soused je
32, 49 a 38 ΔE daleko. Aby se to nevrátilo, hlídá odstup palet okruh 13c
v `items.test.js`. K tomu: registr hlaviček klíčů v oddílu 12c je srovnaný
(chyběly `q`, `z`, `g`, `u` a nikdy tam nebylo `w`), `tests/README.md` mluví
i o kulatých číslech, nejdelší zadání rodiny `ops` je `510 - (46 - 31)` místo
příkladu, který nemohl vzniknout, v záporné závorce `z2` se losují oba členy
z oboru kbelíku, takže vzniká i `(45 - 17) : 4`, a neznámý kbelík padá
v `opsItem()` i `tensItem()` hlasitě. Název kapitoly na dětské mapě je
učitelský žargon; je to starší věc a leží jako R9 v oddílu 9 `docs/PLAN.md`.

**Krok D4 je hotový** (13. září), a s ním **celý krok D a celá vlna A**:
doplňování chybějícího členu, kapitola 5 třetího ročníku, "Zkouška
správnosti". Není to rodina, ale **varianta** nad existujícími klíči, tedy
`6 × 7` položené pozpátku jako `▢ × 7 = 42`. Klíč se nemění, takže se nemění
ani krabička, ani sbírka, ani heatmapa, vlastní trať nevzniká a jede se přes
školní trať a přes kapitolu. `inverse_check` se do varianty skládá, protože
zkouška v sešitě je na klávesnici tatáž otázka. Proti plánu se upřesnilo
měření délky řádku, viz oddíl 7 a `docs/PLAN.md`.

**Krok H je hotový** (14. září), v osmi commitech, a je to první krok, který se
netýká učiva. Sedmým startovním závodníkem je gumová kačenka zdarma a kupuje se
u ní jen to, co má na sobě: pět nezávislých vrstev, 65 dílů, 392 700 kombinací,
a platí se výhradně součástkami z dílny. Tím dostaly součástky druhé odbytiště
a dořešila se otevřená otázka kroku 3b starého plánu, viz oddíl 4b. K tomu se
dnešních dvanáct zvířat překreslilo tak, aby to byla poznatelná zvířata, a
přibylo šestnáct nových, takže jich je osmadvacet; kreslí je tabulka funkcí,
jedna na zvíře, ne jeden tvar s přepínači. Celý kačenčí model je v novém
oddílu 7f, včetně pravidla o autorských právech, které musí znát každý, kdo
sáhne na kresbu.

**Krok E1 je hotový** (14. září), ve dvou commitech. První dal hře **vstupní
prvek `pad2`**, tedy odpověď do dvou políček: `RUN.typed` jako pole, `RUN.slot`,
přeskok po naplnění, mazání přes hranici, klávesa se šipkou, klepnutí do
políčka, třetí tvar řádku v `questionHTML()` se slovy `sep` a `tail`
a `check`, který porovnává hodnoty zvlášť. Druhý postavil rodinu, která ho
používá: **dělení se zbytkem**, kapitola 27 třetího ročníku, jako trať
`divrem` s hlavičkou klíče `r`. Klíč je **dělitel**, `r2` až `r10`, dělenec se
losuje; kbelíky jdou po dvojicích dělitelů podle sešitu. Na mapě stojí hned za
`tens`, tedy na konci násobící a dělící řady, a otevírá se od dělení. Proti
plánu se upřesnilo, jak často má dělení vyjít beze zbytku a proč, viz oddíl 4
a `docs/PLAN.md`.

**Krok E2 je hotový** (14. září), v jednom commitu. Vstupní prvek **`pad3`**
nebyl třetí cesta, ale další řádek v tabulce `SLOTS`: `questionHTML()` kreslí
políčka ve smyčce a slovo `sep` staví do každé mezery mezi nimi, `keypadHTML()`
se ptá na počet políček místo na jméno `pad2`, `questionSize()` počítá `sep`
tolikrát, kolikrát se kreslí, a přeskok, mazání přes hranici, šipka, klepnutí
i `defaultCheck()` se nezměnily vůbec. Rodina, která ho používá, je **rozklad
čísla**, kapitola 21 třetího ročníku, jako trať `split` s hlavičkou klíče `v`:
otázka je číslo a odpověď to, kolik platí jednotlivá jeho místa, tedy
`347 = 300 + 40 + 7`. Tři kbelíky po řádech, první dva do dvou políček, třetí
do tří. Na mapě stojí těsně před `a1000`, protože je to zem, na které tisícovka
teprve stojí. Proti plánu se upřesnil směr otázky a nejširší řádek hry, viz
oddíl 4 a `docs/PLAN.md`.

**Na řadě je zbytek kroku E**, tedy `pick` (E3) a `cmp` (E4), a dál podle
`docs/PLAN.md`. Hotový prompt je na konci, v oddílu 14.

Tenhle soubor je psaný tak, aby se dal na začátku nové konverzace předat celý jako
kontext. Obsahuje rozhodnutí, která už padla, mechaniku hry do detailu, architekturu
kódu, seznam opravených chyb, které se nesmí vrátit, a plán dalšího kroku.

**Pokud jsi nová session, začni tímhle:** přečti tenhle soubor celý, pak
`docs/kurikulum/README.md` kvůli modelu učiva, `README.cs.md` kvůli zdůvodnění
mechaniky a `src/app.js` kvůli kódu. Nepřepisuj hotová rozhodnutí z oddílu
Nedotknutelné principy, aniž by o to uživatel výslovně požádal, jsou to odpovědi
na konkrétní výzkum a na testování s dítětem.

---

## 1. Co to je

Webová hra na procvičování malé násobilky a základního počítání pro děti zhruba
sedm až deset let, postavená jako kolo na závodním okruhu. Vznikla pro syna
uživatele (osm let, třetí třída) a je určená k rozdání rodičům spolužáků.

Jeden soběstačný HTML soubor, žádný účet, žádné reklamy, žádné sledování, po
prvním načtení funguje offline. Rozhraní česky, anglicky a německy.

Uživatel se jmenuje Dalibor, komunikace probíhá česky, kód a komentáře jsou
anglicky. Uživatel preferuje stručné odpovědi bez vaty a v linuxových postupech
editor `micro` místo `nano`.

---

## 2. Kde co leží

Pracovní složka je `~/Dokumenty/Kladska/math-fact-racer`, je to git repozitář.

```
index.html                sestavený hratelný soubor, tohle se otevírá a tohle se hostuje
build.py                  složí index.html ze zdrojů v src/
src/index.template.html   kostra dokumentu se čtyřmi značkami
src/styles.css            všechny styly
src/i18n.js               všechny texty rozhraní, cs / en / de, 457 klíčů
src/curricula.js          kapitoly učebnic pro volbu podle školy, data, ne kód
src/app.js                engine, obrazovky, interakce
tests/                    regresní testy nad jsdom, viz tests/README.md
tests/fixtures/           zamrazené profily starších verzí, jen se přidávají
docs/PROJECT-STATE.md     tenhle soubor
docs/ROADMAP.md           produktový plán, včetně rešerší o motivaci a inkluzi
docs/PLAN.md              implementační plán, verze 2 ze 13. září: kroky A až H, co se kde mění
docs/PLAN-2026-09-12.md   předchozí plán, záznam kroků 1 až 4d a proč jsou postavené tak, jak jsou
docs/kurikulum/           mapy učiva a katalog témat, zdroj pro src/curricula.js
docs/support-qr.png|svg   QR platba pro dobrovolný příspěvek
tools/make-qr.py          generátor toho QR kódu
README.md                 anglické README, hlavní, odkazuje na české
README.cs.md              české README s podrobným zdůvodněním mechaniky
manifest.webmanifest      pro přidání na plochu telefonu
sw.js                     drobná offline cache pro hostovanou kopii
icon.svg, icon-*.png      ikony aplikace
dist/artifact.html        build bez obalu html/head/body, negitovaný
```

Po každé změně ve `src/` je nutné spustit `python3 build.py`. Editovat přímo
`index.html` je chyba, přepíše se. Pořadí vkládání je styly, `i18n.js`,
`curricula.js`, `app.js`, takže `app.js` vidí `I18N` i `CURRICULA` jako globály.

**Kresbu si jde prohlédnout, aniž by se otevírala hra.** Zdroje se dají načíst
do node se zaslepeným `document`, jak to dělá `tests/items.test.js`, zavolat
`sceneSVG()`, `sceneThumb()`, `tokenSVG()`, `partsTraySVG()`, `petSVG()` nebo
`duckSVG()`, výsledek uložit do souboru a převést na obrázek. Tímhle se chytila
hnědá obloha, rudé moře i fialová louka, a žádný test by je nenašel.

**Renderovat se má přes `cairosvg`, ne přes `convert`, a je to poučení kroku H,
které stálo hodně času.** `convert` v tomhle stroji nemá delegáta `rsvg-convert`,
takže kreslí vlastním rendererem ImageMagicku a ten mlčky ignoruje čtyři věci
naráz: `stroke-dashoffset` (čára postupu vypadá vždycky dojetá až do konce),
`opacity` (bílé bříško s `opacity=".2"` vyjde čistě bílé a vypadá jako louže,
a skafandr místo skla udělá mléčný disk), `clip-path` (ořezanou skupinu nakreslí
celou, takže puntíky vzoru vyletí mimo tělo) a `linearGradient` (vezme první
zarážku a vyplní jí celou plochu, takže duhová kačenka je jednobarevná a krajina
jednolitá). Nic z toho nehlásí, takže se člověk dívá na obrázek, který prohlížeč
nikdy neukáže, a překresluje podle něj. Přesně tak proklouzly tři palety trati
`chain`, viz oddíl 9. Dnešní cesta je proto `pip install cairosvg` a pak
`cairosvg.svg2png(url=..., write_to=..., output_width=..., background_color="white")`:
přechody, průhlednost i ořez vyjdou tak, jak je nakreslí prohlížeč. Skládat
obrázky vedle sebe do jedné mřížky s popisky umí dál `montage`.

**Když cairosvg na stroji není a nejde doinstalovat**, dá se každá ta věc obejít,
ale je to práce navíc a je dobré vědět, že se dívám na náhradu. Průhlednost se
pro tu jednu kontrolu zamíchá do plné barvy (`fill` spočítaný jako
`barva * (1-a) + bílá * a`). Ořez se složí ručně: kresba se vyrenderuje dvakrát,
jednou bez ořezané skupiny a jednou s ní bez `clip-path`, a druhá se do první
vloží přes masku vyrobenou z ořezových tvarů. Přechod se podloží zvlášť: z SVG
se vyřízne podkladový obdélník, scéna se vyrenderuje s průhledným pozadím
a podloží přechodem složeným v ImageMagicku
(`convert -size 400x205 gradient:hill1-hill2 scena.png -composite`). Který
z obou rendererů právě běží, se ověřuje dřív, než se podle obrázku něco
překreslí.

---

## 3. Nedotknutelné principy

Tyhle věci se nemění bez výslovného pokynu uživatele. Každá je odpovědí na
konkrétní zjištění z výzkumu, podrobné zdůvodnění včetně odkazů je v `README.cs.md`.

Odpověď se píše na číselné klávesnici, nikdy se nevybírá z možností. Vybavení
z paměti staví paměťovou stopu, poznávání ne. **Tohle platí pro závod.**
V dílně se odpovídá manipulací, tedy skládáním mincí na pult, což poznávání
z nabídky není: dítě musí vědět, co poskládat, a možností je víc.

**Dílna neměří čas a nedává body za rychlost. Nikdy.** Je to celý důvod, proč
existuje vedle závodu. Cokoli, co by do dílny propašovalo stopky, ji ruší.

Čas se měří, ale nikde neběží odpočet ani stopky. Rychlost přidává body, nikdy
neubírá a nikde není vidět jako tlak.

Chyba nikdy neubírá body ani nevrací auto zpět. Auto se za chybu nepohne, ukáže
se správný výsledek a příklad se vrátí jako otázka navíc.

Dítě vždycky dojede celé kolo a vždycky dostane medaili a mince. Neexistuje stav,
ve kterém závod skončí neúspěchem.

Soupeřem je vlastní nejlepší jízda na téže trati, nikdy jiné dítě. Žádné žebříčky.

Cílová úspěšnost je kolem osmdesáti procent, tomu odpovídá poměr sedmdesát ku
třiceti mezi zvládnutým a slabým učivem v každém závodě.

Žádný text v dětské části nesmí obsahovat učitelský žargon. Slovo "spoj" bylo
z celé aplikace vymýceno, používá se "příklad".

Nikdy nepoužívat licencované postavičky. Pokémoni a podobné byly výslovně
odmítnuty a nahrazeny vlastními kreslenými tvory.

**Co hra neumí, to nenabízí.** Žádné nastavení nesmí jít zvolit, pokud se pak
tiše nic nestane. Platí to i na budoucí obrazovky, nejen na volbu kapitoly, kde
to vzniklo.

**Žádná změna nesmí připravit existující profil o to, co už má.** Hra běží na
cizích telefonech, ke kterým se nedostanu, nová verze se do nich dostane sama
při dalším načtení a zálohu si nikdo nedělá. Nová verze proto musí umět načíst
libovolný starší profil a nesmí po ní zmizet ani zmenšit se nic z tohohle:

- příklad v krabičce, jeho úroveň, počty pokusů, úspěchů, chyb a nejlepší čas
- rekord trati, nejlepší medaile, počet dojetých závodů
- mince, součástky, koupení závodníci, nátěry, jejich zkušenosti, dny v řadě
  a celkové součty
- **rozsvícené místo ve sbírce.** Rozsvítí se, když se příklad dostane na
  úroveň 4, a nezhasne nikdy, ani když dítě příklad zapomene a úroveň spadne.
  Je to pole `stars`, ne pohled do krabičky, právě proto; viz oddíl 6.
- jméno, jazyk, kód rodiče a volba učebnice
- **přístup, který dítě už mělo.** Odemčená trať se sama nezavře, vybraná
  kapitola se sama nepřepne dopředu a **ročník nové verze nesmí nikomu ubrat
  mapu**: starší profil žádný ročník nemá a dostane nejvyšší, tedy všechno.
  Snížit ročník smí jen rodič, stejně jako zavřít trať.

Když nová verze přidá učivo do existující trati, klesne tím její zvládnutí,
protože se zvětší jmenovatel. To smí snížit ukazatel na mapě, ale nesmí zavřít
dveře. Pokud změna umí posunout nějakou hranici odemčení, migrace v `load()`
musí starou hranici jednorázově dopočítat, ne doufat, že na ní nikdo nestál;
viz `seedLegacyGates()`.

Jediná povolená výjimka je `normalizeChapter()`, která smí posunout uloženou
kapitolu na nejbližší dřívější hratelnou, protože kapitola bez generátoru
neumí vyrobit závod. Nikdy dopředu.

Hlídá to `tests/migration.test.js` nad zamrazenými profily ze starších verzí.
Každá další verze, která sáhne na datový model, tam přidá další profil. Test
nesmí nikdy začít procházet tak, že se z něj vyškrtne kontrola.

---

## 4. Herní mechanika do detailu

**Závod.** Výchozí délka je dvacet otázek, nastavitelná na 10, 15, 20 nebo 25.
Jeden závod je přesně jedno kolo okruhu.

**Pohyb.** Auto se posune o `1/n0` kola za každou správnou odpověď, kde `n0` je
původní počet otázek. Za chybu se neposune vůbec. Kdo si všechny chyby opraví,
dojede přesně na sto procent.

**Chyba.** Auto zabrzdí, zobrazí se `příklad = výsledek`, příklad se vloží do
fronty o tři pozice dál jako otázka navíc. Závod se tím prodlouží, trať ne.
Jeden příklad se vrací nejvýš dvakrát a závod nepřesáhne `n0 + 6` otázek.

**Body.** Nezávisle na poloze se sbírají body, normalizované na stovkovou škálu
násobitelem `20 / n0`. Rozpětí za jednu odpověď: 6,5 bleskově, 5,9 rychle,
5,3 normálně, 4,7 pomalu, 4,6 za opravený pokus, 0,6 za chybu. Tři a víc
správných v řadě přidají turbo bonus až 0,6 bodu.

**Medaile.** Zlatá od 115 bodů, stříbrná od 100, bronzová od 85, pod tím
"Kolo dojeto". Dvacet správných normálním tempem dá zhruba 106.

**Soupeř.** Duch ve vedlejším pruhu, poloha se počítá jako
`moje poloha na kole minus (moje body minus body rekordu) / 100`. Porovnává se
jen rekord se stejným počtem otázek.

**Mince.** `round(body / 5 * n0 / 20) + medaile * 4 + 6 za překonání rekordu
+ 5 za den v řadě`.

**Leitnerova krabička.** Každý příklad má úroveň 0 až 5. Správná a rychlá
odpověď posune o jedna nahoru až na 5, správná pomalá posune nahoru jen do
úrovně 3. Chyba srazí na 1, pokud byl na 3 a výš, jinak o jedna dolů.

**Zvládnutí trati.** `součet(min(3, úroveň)) / (3 * počet příkladů)`. Roste od
prvního závodu a přímo předpovídá odemknutí další trati.

**Jednou otevřená trať se nezavře.** Profil má `opened`, kam se při každém
vykreslení mapy zapíše každá trať, kterou automatika právě otevřela. Od té
chvíle je otevřená napořád. Je to pojistka proti tomu, aby přidání učiva do
trati snížilo zvládnutí a dítě druhý den našlo zamčené dveře; přesně to by se
stalo, když k dvacítce přibyly desítkové spoje. Zavřít trať smí jen rodič.
Starší profily se seedují z toho, kde dítě prokazatelně bylo, tedy z dojetých
závodů a z příkladů dané trati v krabičce.

**Odemykání.** Prahy zvládnutí: t2 od 0,7 na t1, t3 od 0,7 na t2, t4 od 0,7 na
t3, t5 od 0,65 na t4, dělení od 0,55 celé násobilky, do stovky od 0,6 na do
dvaceti, do tisíce od 0,6 na do stovky, zaokrouhlování a řetězec od 0,5 na
stovce. Pojistka: po deseti dojetých závodech na jedné trati se další otevře
tak jako tak. Rodič může každou trať přebít ručně. Trať `school` je vždy otevřená.

**Výběr příkladů.** Váha podle úrovně `[7, 8, 6.5, 3.4, 1.6, 0.8]`, zvýšená
u dlouho neviděných a u těch, kde je víc chyb než úspěchů. Neviděné mají váhu
3,2 a je jich na závod omezený počet. U násobilkových tratí je zhruba sedmdesát
procent otázek z ohniska trati a třicet z dřívějších. Šampionát bere jen to, co
by daná trať právě teď sama nabídla, viz `reachedKeys()`; u stupňovaných tratí,
tedy mostů, hodin a tisícovky, tím nemůže podstrčit stupeň, na který dítě ještě
nedošlo, a u oborů prvního ročníku to hlídá odemykání a filtr ročníku.

**Obory prvního ročníku.** Celý první ročník býval jedna trať a to byla chyba:
její první stupeň bylo "všechno do deseti bez přechodu", takže prvňák hned
v prvním týdnu dostal 10 + 10 a 20 - 10. Učebnice postupuje jinak, přidává jedno
číslo za druhým a procvičuje uvnitř dosaženého oboru. Od září 2026 to mapa
kopíruje: **šest oborů, každý vlastní trať**, `BANDS` v `src/app.js`.

| trať | součet | příkladů | odpovídá |
| --- | --- | --- | --- |
| a3 | 2 až 3 | 4 | 1. díl, kapitoly 4 a 5 |
| a5 | 4 až 5 | 8 | 1. díl, kapitoly 6 až 8 |
| a7 | 6 až 7 | 12 | 2. díl, kapitoly 9 a 10 |
| a10 | 8 až 10 | 26 | 2. díl, kapitoly 11 až 14 |
| a15 | 11 až 15 | 30 | 3. díl, kapitoly 15 a 16 |
| a20 | 16 až 20 | 62 | 3. díl, kapitoly 17 a 18 |

Obor drží **jen to, co sám zavádí**; dřívější se vrací jako opakování přes
`focusAndReview()`, stejně jako u násobilkových tratí. V žádném oboru není
přechod přes desítku. Obory se odemykají jeden po druhém, `a3` je otevřený
vždycky, takže prvňák má na začátku jedno místo a pět zamčených před sebou.

**Mosty přes desítku jsou vlastní trať a je to druhý ročník.** `bridge`, čtyři
mosty: `e3` přes devítku, `e4` přes osmičku, `e5` přes sedmičku, `e6` zbytek.
Pořadí je převzaté ze čtvrtého dílu Matýskovy matematiky, který každému věnuje
celou kapitolu, a ten díl je druhá třída; proto přechod v prvním ročníku není.
Přechod se pozná podle jednotek, `(a % 10) + (b % 10) > 10`, takže doplnění do
celé desítky se za přechod nepočítá. Příklad patří k mostu svého většího
sčítance. Závod nese aktuální most ze sedmdesáti procent, zbytek je opakování,
tedy stejný tvar jako všude jinde. Aktuální most hledá `bridgeStage()` jako
první, kde zvládnutí nedosáhlo 0,7. **Most je otevřený od začátku druhé třídy**,
aby druhák nemusel projít celý žebřík prvního ročníku, než se k němu dostane.
Na mostě pak stojí stovka, ne na posledním oboru.

**Kbelíky přesnosti u hodin.** Trať hodin má stejný tvar jako stupně přechodu
přes desítku, jen kbelíky jdou po přesnosti čtení: `c1` celé hodiny, `c2` půl,
`c3` čtvrt a tři čtvrtě, `c4` zbylé pětiminutovky, `c5` na minutu, `c6`
odpolední zápis po dvanácté. Kbelíky jsou exkluzivní, aktuální nese sedmdesát
procent závodu a hrubší se vracejí jako opakování. Aktuální kbelík hledá
`clockStage()`. Odpověď se píše jako na displeji, tedy 7:45 se ťuká 745 a 19:45
se ťuká 1945, uvnitř je to hodina krát sto plus minuty, tedy jedno celé číslo.
**Celá hodina se smí napsat i bez nul**, tedy sedmá hodina jako 7: jedna nebo
dvě číslice se čtou jako hodina, tři nebo čtyři jako hodina a minuty, viz
`clockTyped()`. Nejednoznačné to není, protože se nikdy negeneruje půlnoc,
takže samotná 19 může znamenat jen sedm večer. Jestli se myslí dopoledne nebo
večer, říká slunce nebo měsíc vedle ciferníku, takže jedna otázka má pořád
jednu odpověď.

**Kroky do tisíce.** Trať do tisíce je stavěná stejně jako dvacítka a hodiny,
tedy šest stupňů, aktuální nese sedmdesát procent závodu a dřívější se vracejí
jako opakování. Kbelíky jdou v pořadí, ve kterém je bere osmý díl: `b1` celé
stovky, `b2` trojciferné plus jednociferné bez přechodu, `b3` totéž s přechodem
přes desítku, `b4` celé desítky, `b5` dvojciferné uvnitř stovky, `b6`
dvojciferné s přechodem přes stovku. Odčítání je totéž sezení čtené pozpátku,
takže `kn*` vrací první sčítanec z `kp*` téhož kbelíku a jeden kbelík trénuje
oba směry. Aktuální kbelík hledá `as1000Stage()`. Součet nikdy nepřeleze tisíc
a generátor si to hlídá konstrukcí rozsahů, ne ořezáním přetečení; kdyby ořezával,
podstrčil by dítěti lehčí příklad a nikde by to nebylo vidět.

**Řetězec tří čísel.** `chain`, kapitola 11 třetího ročníku. Tři členy a dvě
znaménka, například `7 + 5 - 3`, tři kbelíky podle oboru: `q1` tři jednociferná
čísla do dvaceti, `q2` celé desítky do sta, `q3` dvojciferné číslo s
jednociferným a s desítkami do sta. Stejný tvar jako ostatní stupňované tratě,
aktuální kbelík nese sedmdesát procent závodu a dřívější se vracejí jako
opakování, hledá ho `chainStage()`. Vzor znamének se losuje ze čtyř možností
rovnoměrně a trojice se staví konstrukcí rozsahů, ne ořezem; když vzor nemá kam
jít, například `2 - 1 - ?`, losuje se znovu. **Mezivýsledek nikdy neklesne pod
nulu** a zůstane v oboru kbelíku, takže se dítě cestou k výsledku nepotká se
záporným číslem. Na mapě stojí **před** `beyond`, protože kapitola 11 je
v knize dřív než kapitola 14 a cesta jde v pořadí učebnice; pořadí třetího
ročníku je `chain`, `ops`, `beyond`, `tens`, `round`, `a1000`, `units`.

**Co se počítá dřív.** `ops`, kapitoly 13 a 30 třetího ročníku. Čtyři kbelíky
na dvou osách, tedy bez závorek a se závorkami, nejdřív do sta a pak do tisíce:
`z1` bez závorek do sta (`4 + 3 × 5`), `z2` se závorkami do sta (`(4 + 3) × 5`),
`z3` bez závorek do tisíce (`300 + 7 × 8`), `z4` se závorkami do tisíce
(`500 - (40 + 30)`). Stejný tvar jako ostatní stupňované tratě, aktuální kbelík
nese sedmdesát procent závodu, hledá ho `opsStage()`. Násobí a dělí se **jen
v oboru malé násobilky** a dělení vždycky vyjde beze zbytku, protože trať se
otevírá na násobilce a nic jiného v celé hře zatím `360 : 4` neučí; nejblíž
tomu je rodina `tens`, ale ta dělí jen kulatými čísly. Z toho plyne tvar
čtvrtého kbelíku: dokud je stropem malá násobilka, nemůže příklad, který se
násobí nebo dělí jako poslední, přelézt stovku, takže čtvrtý kbelík roste do
tisíce na straně sčítání a jeho závorka je ta, která výsledek opravdu mění,
`a - (b + c)`.
Čtená zleva doprava by vyšla jinak, a přesně to si má dítě všimnout. Staví se
konstrukcí rozsahů, ne ořezem: nejdřív se losuje násobící člen a pak číslo
z rozsahu, který kbelík už drží, takže se nic nedodatečně neupravuje a žádný
mezivýsledek neklesne pod nulu.
V záporné závorce druhého kbelíku se od 13. září losují **oba členy** z oboru
kbelíku, tedy do sta; odčítanec býval jen jednociferný, takže `(45 - 17) : 4`
nemohlo vzniknout a zúžení nebylo nikde zapsané. Hodnota závorky se losuje
dřív než její členy, takže na výsledku ani na tom, že dělení vyjde beze
zbytku, se tím nemění nic.

**Kulatá čísla.** `tens`, kapitola 28 třetího ročníku. Dva kbelíky a v každém
oba směry, tedy čtyři klíče: `gm1` násobení deseti a stem (`7 × 10`, `23 × 10`,
`4 × 100`), `gd1` totéž pozpátku (`70 : 10`, `1000 : 100`), `gm2` násobení
kulatou desítkou (`3 × 40`, `20 × 4`), `gd2` dělení takového součinu (`120 : 40`
i `120 : 3`). Je to jeden krok za trať `beyond`: tam se `12 × 3` rozkládá na
`30 + 6`, tady se k `3 × 4` vrací nula, takže se `tens` otevírá právě od
`beyond` a na mapě stojí hned za ní. Kbelík se stupňuje jako jinde, hledá ho
`tensStage()`, a oba směry v něm stoupají zároveň, stejně jako u `beyond`.
Staví se konstrukcí rozsahů, ne ořezem: nejdřív se losuje kulaté číslo a pak to
druhé z rozsahu, do kterého se tisíc ještě vejde. **Součin nikdy nepřeleze
tisíc** a dělení vždycky vyjde beze zbytku, protože se dělí tím, čím se
násobilo. Celý tisíc je dovolený, `10 × 100` a `1000 : 100` jsou příklady, na
kterých kapitola stojí, a jsou to jediná zadání rodiny se čtvrtou číslicí.
V prvním kbelíku se dělí **jen deseti nebo stem**: `230 : 23` by bylo dělení
dvojciferným číslem, které hra nikde neučí. Kulatý činitel smí stát vpředu
i vzadu, protože tak to píše i učebnice.

**Dělení se zbytkem.** `divrem`, kapitola 27 třetího ročníku, nejdelší
kapitola obou dílů, sešit jí věnuje tři dvoustrany. Je to první rodina, která
se **odpovídá do dvou políček**, tedy `input:"pad2"`, protože podíl a zbytek
jsou dvě čísla, ne jedno divně zapsané. Řádek zní `36 : 5 = ▢ (zb. ▢)`
a slova mezi políčky a za nimi si nese položka jako hotový text (`sep`,
`tail`), stejně jako jednotku; nad klávesnicí navíc stojí slovy, co ta dvě
políčka znamenají, takže se zkratka nemusí hádat.

**Klíč je dělitel, ne dvojice čísel.** `r2` až `r10`, dělenec se losuje. Zápis
po faktech, `r{dělenec}x{dělitel}`, by dal přes pět set klíčů, sbírku s pěti
sty místy a krabičku, která se nikdy nenaplní; krabička má místo toho pamatovat,
jak dítěti jde dělení sedmi se zbytkem, což je přesně ta dovednost, a sbírka
trati má devět míst. Kbelíky jsou dvojice dělitelů, jak je bere sešit: `2 a 3`,
`4 a 5`, `6 a 7`, `8 a 9`, `10`, tedy jeden kbelík je jedna dvoustrana, a oba
dělitele dvojice stoupají zároveň. Aktuální kbelík hledá `divremStage()`.

Staví se konstrukcí a pozpátku proti tomu, jak se řádek čte: nejdřív podíl
(1 až 10, tedy po desetinásobek dělitele, jak sešit značí násobky na ose), pak
zbytek z rozsahu, který na dělitele nedosáhne, a teprve z obojího dělenec.
**Zbytek je tedy menší než dělitel proto, že jinde být nemůže**, ne proto, že
se něco ořízlo, a neznámý dělitel padá hlasitě. **Beze zbytku vyjde pevná
pětina příkladů** ve všech kbelících, `DIVREM_EVEN`. Je to rozhodnutí, ne
náhoda: kdyby se zbytek losoval rovnoměrně od nuly, vyšel by u dvojky beze
zbytku každý druhý příklad a u desítky každý desátý, takže by každý kbelík
učil něco jiného. Pětina je dost na to, aby "nezbylo nic" zůstalo odpovědí,
kterou musí dítě poznat a napsat do druhého políčka nulu, a málo na to, aby
zbytek zůstal tím, o čem kapitola je; sešit učí obojí, takže se nesmí vynechat
ani jedno.

Na mapě stojí hned za `tens`, tedy na konci násobící a dělící řady třetího
ročníku, a otevírá se od `d1` na 0,6, stejně jako `beyond`: dělení se zbytkem
je dělení plus odečtení a bez násobků dělitele nemá na čem stát. Kapitola 27
leží v knize hned vedle kapitoly 28, takže pořadí knihy to neporušuje.
Chybná odpověď má dvě vlastní hlášky, viz oddíl 7.

**Rozklad čísla.** `split`, kapitola 21 třetího ročníku, kde učebnice odvozuje
obor do tisíce ze stovky, kterou dítě umí. Otázka je číslo a odpověď to, kolik
platí jednotlivá jeho místa, tedy `347 = ▢ + ▢ + ▢` s odpovědí 300, 40 a 7. Je
to první rodina, která se **odpovídá do tří políček**, `input:"pad3"`, a slovo
mezi políčky je prosté `+`, ve všech třech jazycích tentýž znak.

**Směr otázky je celé rozhodnutí téhle rodiny.** Obráceně, tedy
`300 + 40 + 7 = ▢`, se dá odpovědět přečtením číslic v pořadí, v jakém stojí,
aniž by dítě vědělo, kolik která platí, a na klávesnici je to navíc sčítání do
tisíce, které učí `a1000`. Při rozkladu to nejde: čtyřku uprostřed musí dítě
vrátit jako čtyřicet, a přesně o tom kapitola je a přesně z toho se pak žije
při písemném sčítání. Třetí možnost, tedy "kolik má stovek, desítek a jednotek"
s odpovědí 3, 4, 7, je zase jen to čtení bez počítání. Sešit píše řádek stejným
směrem jako hra.

**Kbelíky jdou po řádech tak, jak sešit obor odvozuje**: `v1` dvojciferné číslo
(`47 = 40 + 7`), tedy stovka, na které dítě stojí, `v2` trojciferné zakončené
celou desítkou (`350 = 300 + 50`), `v3` všechny tři řády naráz. Kolik políček
řádek má, tedy plyne z učiva, ne z rodiny: první dva kbelíky se odpovídají do
dvou políček, poslední do tří, a `maxLen` je po políčkách `[3,2,1]`, tedy přesně
na to, co do kterého patří. Aktuální kbelík hledá `splitStage()`.

Staví se konstrukcí: **každé místo, které má políčko, se losuje od jedné do
devíti** a násobí se tím, co to místo platí, a číslo v zadání je jejich součet.
Nikdy tedy nevznikne nula tam, kde na ni čeká políčko. Je to omezení s důvodem,
ne ořez: kniha píše 407 jako 400 + 7, tedy o jeden sčítanec míň, a řádek se
třemi políčky by po dítěti chtěl nulu, kterou nikdo nepíše. Neznámý kbelík padá
hlasitě.

Na mapě stojí **těsně před `a1000`** a otevírá se od stovky na 0,5, stejně jako
zaokrouhlování. Kapitola 21 je v knize dřív než kapitoly 23 až 25 a v oboru,
který dítě nepotkalo, se nedá sčítat, takže je to zem, na které tisícovka teprve
stojí, a nikdy nesmí čekat na ni. Kapitola 25, opakování celého oboru, si
rozklad bere taky. Chybná odpověď má vlastní hlášku: napsat číslici místo toho,
kolik doopravdy platí, jmenuje obojí, viz oddíl 7.

**Převody jednotek.** `units`, kapitoly 18 a 29 třetího ročníku. Čtyři kbelíky
podle druhu veličiny: `u1` délka (`m`, `cm`, `km`, `dm`, `mm`), `u2` hmotnost
(`kg`, `g`, `t`), `u3` objem (`l`, `dl`, `ml`, `hl`), `u4` čas (`h`, `min`, `s`,
den, týden, měsíc, rok). Každý kbelík převádí **oběma směry** z téhož poměru,
tedy `3 m = 300 cm` i `300 cm = 3 m`, a stupňuje se jako ostatní, hledá ho
`unitsStage()`. Staví se konstrukcí rozsahů: losuje se dvojice jednotek a počet
té větší z rozsahu, ve kterém odpověď vyjde jako celé číslo; prázdný rozsah
je hlasitá chyba se jménem kbelíku, ne náhradní příklad. **Obě čísla, to
v zadání i odpověď, zůstávají do tisíce**, protože tam třetí třída počítá,
a počet velkých jednotek je nejvýš dvacet, aby z týdne nevyšlo sto čtyřicet
dva dní. Z toho plyne, že hmotnost má přesně čtyři otázky (`1 kg = 1000 g`
a `1 t = 1000 kg` v obou směrech), což je přesně to, co učebnice u hmotnosti
převádí. Zkratky jednotek se ve všech třech jazycích píšou stejně a stojí
přímo v tabulce převodů; slovní jednotky času jdou přes `t()` a mají ve
slovníku tři tvary oddělené svislítkem, protože čeština počítá jinak jeden,
dva až čtyři a pět a víc. Tvar vybírá číslo, které u jednotky stojí, takže
`14 dní` i `2 dny` vyjdou správně; pokyn nad klávesnicí bere vždycky prostý
plurál, protože "Převeď na dní" není česky.

**Prahy rychlé odpovědi.** Pomalu 5,2 s, normálně 3,8 s, rychle 2,8 s. Bleskově
je zhruba polovina toho. U počítání do sta se prahy násobí 1,9, u počítání do
tisíce 2,2, u zaokrouhlování 2,0, u řetězce taky 2,0, protože jsou to dvě
operace místo jedné, u pořadí operací 2,4, protože k těm dvěma operacím
přibývá rozhodnutí, která z nich jde první, u dělení se zbytkem taky 2,4,
protože je to spoj z násobilky, odečtení a k tomu dvě čísla do dvou políček
s přeskokem mezi nimi, u rozkladu čísla 2,2, protože samotná úvaha je pravidlo,
ale píše se až do tří políček s přeskoky, u kulatých čísel 1,8, protože je to
spíš pravidlo než počítání, u převodů 2,2, protože se musí nejdřív rozhodnout,
kterým směrem jednotka jde, a teprve pak počítat, u hodin taky 2,4, protože přečíst ciferník a
naťukat čtyři číslice trvá déle než vybavit si spoj, a za násobilkou 2,6,
protože rozložit číslo a vynásobit obě půlky je víc práce než jeden přechod.
Všechno je na jednom místě, `thresholds()`.

---

## 4b. Dílna

Druhý režim, postavený v září 2026. Vzniknul proto, že část učiva není fakt
k vybavení, ale malá úvaha, a na úvahu se nesmí pouštět stopky.

**Co tam je.** Vlastní místo na mapě, výrazně jiné než tratě, teplé barvy
a ikona nářadí. Uvnitř seznam zakázek, zatím dvě.

**Zakázka patří do ročníku, stejně jako trať.** Mince do padesáti jsou učivo
druhé třídy a prvňák u nich může jen koukat, takže dílna ukazuje jen to, co
třída už potkala, `jobsInGrade()`. Ukázka na konci cesty rozbalí i zakázky
dalšího roku, stejně jako tratě. Sbírka dílny a její blok v heatmapě jdou
podle téhož filtru, takže prvňák nevidí tři šedivá místa za peníze.

| zakázka | ročník | kroky |
| --- | --- | --- |
| `count` | 1 | `wc1` do pěti, `wc2` do deseti, `wc3` dva druhy dohromady |
| `money` | 2 | `wm1` zaplať přesně, `wm2` nejmenším počtem mincí, `wm3` kolik se vrátí |

**Zakázka** je šest úloh. Aktuální krok nese většinu, dřívější se vracejí jako
opakování, tedy stejný tvar jako u stupňovaných tratí, `focusAndReview()` sdílí
se závodem. Zakázka se nedá prohrát ani nedojet.

**Počítání dílků je zakázka prvního ročníku.** V bedýnce leží šroubky, matice
nebo podložky, dítě je spočítá a připraví na pult stejný počet. Odpovídá se tedy
skládáním, ne psaním, což je celý smysl dílny: práce je v tom pečlivě spočítat,
a na to se nesmí pustit stopky. Poslední krok dá do bedýnky dva druhy dílků
dohromady, což je přesně to, kde první ročník začíná sčítat. Učebnice tomu věnuje
první tři kapitoly, takže jsou od téhle chvíle vybratelné a ukazují do dílny.

**Vstupní prvek `pieces`.** Mince mají šest hodnot na výběr, dílek jen jeden,
takže zásobník je jedno velké tlačítko a celá odpověď je, kolikrát se na něj
klepne. Klepnutí na dílek na pultu ho zase odebere. Na pultu se u dílků ukazuje
počet, u mincí částka.

**Obrázek k počítání musí sedět s odpovědí.** Kdyby se rozcházely, dítě by
spočítalo správně a hra by mu to spočítala za chybu; `items.test.js` proto počítá
dílky přímo v nakresleném SVG a porovnává je s odpovědí.

**Peníze mají tři kroky.** `wm1` zaplať přesně, `wm2` zaplať co nejmenším počtem
mincí, `wm3` kolik se vrátí. Mince jsou 1, 2, 5, 10, 20 a 50, což jsou zároveň
české koruny, eurocenty i britské pence, takže jedna sada kreseb stačí na
všechny tři jazyky a mění se jen jednotka.

**Nejmenší počet mincí musí mít jednu správnou hodnotu**, jinak by úloha `wm2`
neměla co porovnávat. Hltavý postup je pro tuhle soustavu prokazatelně optimální
a `items.test.js` to ověřuje proti dynamickému programování do dvou set.

**Odpovídá se skládáním mincí na pult.** Klepnutí na minci v zásobníku ji přidá,
klepnutí na minci na pultu ji vezme zpátky. Vstupní prvek se jmenuje `coins`
a žije celý uvnitř dílny, nesahá na `tap()` ani na klávesnici závodu.

**Platí se v součástkách.** Dva za vyřešenou úlohu, jeden za opravenou nebo za
`wm2` se správnou částkou ale zbytečně mnoha mincemi, tři za dokončenou zakázku.
Plná zakázka dá patnáct. Za součástky se v garáži kupují **nátěry**, tedy barevné
varianty strojů. Nátěr nemá na jízdu žádný vliv, jen na vzhled; soupeřem je
vlastní nejlepší jízda, takže cokoli, co by jízdu zrychlilo, by rozbilo srovnání.
Součástky se nedají vyjezdit a mince se nedají vydělat v dílně, obojí schválně.

**Odchod z dílny nic nebere.** Součástky vydělané do té chvíle zůstávají.

**Kapitola smí být jen pro dílnu.** `pool: {shop:["money"]}` dělá kapitolu
vybratelnou, aniž by vyrobila trať. Proto se rozdělilo `isPlayable()`, tedy jde
vybrat, od `schoolReady()`, tedy dělá trať na mapě. Zakázka, která je zrovna
v kapitole, to říká štítkem na kartě.

**Kruhové okno nad pultem.** Od září 2026 stojí nad pultem kruh, v něm obrázek
vlastního závodníka dítěte včetně nátěru, a po každé vyřešené úloze z něj odpadne
jedna výseč; na konci zakázky je obrázek celý. `revealSVG(inner, done, total)`,
výseče a ne prolínání, aby šlo spočítat, kolik zbývá. Odkrývá se něco, co dítě
už vlastní, takže se nedá nic vyhrát ani prohrát a nekupuje se nic za výkon.
**Opravená úloha odkrývá taky**, jinak by z kruhu bylo měřidlo bezchybnosti
a dílna by začala hodnotit výkon. Ubrat výseč neumí nic. Kruh se dělí délkou
zakázky, tedy `job.n`, ne počtem úloh ve frontě: chyba frontu prodlouží a kruh,
který by se přepočítal, by zmenšil už odkrytý díl.

**Dílna má vlastní sbírku.** Platí pro ni pravidlo z oddílu 6 beze změny: klíč
dílny, který se v krabičce dostane na úroveň 4, rozsvítí místo ve sbírce. Sbírka
dílny je dneska třímístná, `wm1` až `wm3`, a s každou další zakázkou povyroste.
Velikost si říká `shopSpec()` sama, protože dílna žádná trať není a `trackKeys()`
by ji minulo, přesně jako ji jednou minula rodičovská heatmapa.

**Součástky jsou pořád jediná měna dílny** a mají podle roadmapy, oddíl 4,
správný tvar, tedy klíč k obsahu místo platu za výkon. **Od kroku H kupují dvě
různé věci**, nátěry na stroje (osm kusů za 390 součástek) a výstroj gumové
kačenky (65 dílů za 934), a nic z toho nejde koupit za mince ani vyjezdit.
Druhé odbytiště je tam schválně: nátěry jsou po šestadvaceti plných zakázkách
vykoupené a do té chvíle bylo číslo v dílně peněženka bez obchodu.

**Dílna říká, kam součástky jdou, a od kroku H5 taky to, kdy už nejdou nikam.**
Věta dole na obrazovce dílny jmenuje obojí, nátěry i kačenku. Tlačítko „utrať
součástky“ po zakázce míří **do první sekce garáže, na kterou dítě opravdu má**,
tedy do nejlevnější z těch, kde ještě něco zbývá a kde je nejlevnější kus
v dosahu dnešních součástek; rozhoduje o tom `spendTarget(p)` nad
`shelvesLeft(p)`, které vrací sekce i s cenou toho nejlevnějšího v nich. Sekce
jsou v garáži řazené od nejlevnějšího dílu, takže první dlaždice, kterou dítě
uvidí, je ta, na kterou dosáhne. Když nestačí na nic, tlačítko se nenabízí
vůbec, protože nabídnout cestu, která nic neudělá, je přesně to, co hra nedělá;
viz princip v oddílu 3. Je to seznam míst, nikdy počet zbývajících kusů: číslo
„devět z pětašedesáti“ by z police na koukání udělalo cíl k honění a v dílně se
nic honit nemá.

**Až je koupené všechno, číslo přestane být peněženka.** Tohle je dořešená
otevřená otázka kroku 3b starého plánu. Podmínka je `shelvesEmpty(p)`, tedy
koupené **nátěry i všech 65 dílů kačenky**; ani jedna polovina sama nestačí,
protože dítě, které má všechny nátěry, má pořád kam dalším součástkám jít. Pak
se přepne štítek pod celkovým číslem na výsledku zakázky (`statPartsAll` →
`statPartsWork`) a věta v dílně (`shopPartsNote` → `shopPartsDone`), tlačítko
na utracení se přestane nabízet, protože není kam, a **nic dalšího se nemění**:
číslo zůstává `p.parts`, žádné nové zboží ani cíl nevzniká a součástky přibývají
dál. Datový model se kvůli tomu nehnul.

Přepnutý štítek je změna textu, ne nová mechanika: v dílně se ani po něm nikde
neměří čas a za rychlost pořád nejsou body. Hlídá to kontrola na konci okruhu
„kam součástky jdou“ ve `flow.test.js`.

**Klíče dílny začínají na `w`.** Ukládají se do stejné Leitnerovy krabičky jako
příklady, ale žádný pool závodu je vyrobit neumí a trať "co ti nejde" je
vyfiltruje. `record()` s `ms = null` posune úroveň bez měření času a nezapočítá
se do průměrné doby odpovědi.

## 5. Trati

Sedmadvacet tratí, každá má vlastní generovanou cestu a vlastní prostředí
v každém ze čtyř světů; tvar cesty je na trati, ne na světě, mění se s ním
krajina kolem ní a to, čím cesta končí.

| id | ročník | do | obsah |
| --- | --- | --- | --- |
| t1 | 2 | 4 | násobilka 1, 2, 5, 10 |
| t2 | 2 | 4 | násobilka 3, 4 |
| t3 | 2 | 4 | násobilka 6, 7 |
| t4 | 2 | 4 | násobilka 8, 9 |
| t5 | 2 | 4 | celá malá násobilka |
| d1 | 2 | 4 | dělení |
| chain | 3 | 3 | řetězec tří čísel se dvěma znaménky, tři kbelíky podle oboru |
| ops | 3 | 3 | co se počítá dřív, čtyři kbelíky: bez závorek a se závorkami, do sta a do tisíce |
| beyond | 3 | 3 | násobení a dělení mimo malou násobilku, čtyři kbelíky podle toho, co se rozkládá |
| tens | 3 | 3 | násobení a dělení deseti, stem a kulatou desítkou, dva kbelíky v obou směrech |
| divrem | 3 | 3 | dělení se zbytkem, klíč je dělitel `r2` až `r10`, pět kbelíků po dvojicích dělitelů |
| round | 3 | 3 | zaokrouhlování, tři kbelíky: desítky do sta, desítky do tisíce, stovky |
| split | 3 | 3 | rozklad čísla na to, kolik platí jeho místa, tři kbelíky po řádech, `v1` až `v3` |
| a3, a5, a7, a10, a15, a20 | 1 | 2 | šest oborů prvního ročníku, sčítání a odčítání bez přechodu přes desítku, viz oddíl 4 |
| bridge | 2 | 2 | sčítání a odčítání s přechodem přes desítku, čtyři mosty |
| a100 | 2 | 3 | sčítání a odčítání do 100, pět obtížnostních kbelíků |
| a1000 | 3 | 3 | sčítání a odčítání do 1000, šest stupňů podle toho, co se přičítá a jestli se přechází přes stovku |
| units | 3 | 3 | převody jednotek, čtyři kbelíky podle veličiny: délka, hmotnost, objem, čas, v obou směrech |
| clock | 2 | 3 | čtení hodin, šest kbelíků přesnosti, otevřená od začátku |
| mix | 2 | - | vše odemčené dohromady |
| weak | 1 | - | jen příklady s nejnižší úrovní |
| school | - | - | učivo vybrané kapitoly učebnice, viz oddíl 11 |

**Učivo má dvě čísla, ne jedno.** `grade` je rok, ve kterém se učivo zavádí,
`thru` (sloupec "do") poslední rok, ve kterém se k němu třída ještě vrací;
obojí je odečtené z map učebnic a `thru` chybí tam, kde se rovná `grade`.
Malá násobilka se zavádí ve druhé třídě, ale třetí jí začíná (kapitoly 2 a 3
sedmého dílu) a čtvrtá ji opakuje taky (kapitola 5 prvního dílu), takže
`grade 2, thru 4`. Stovka a hodiny `thru 3`, obory prvního ročníku `thru 2`.

Na `thru` se ptá **jedině `yearOf()`**, tedy jen to, co je na mapě před dveřmi
a co za nimi. Odemykání, `inGrade()`, ukázka dalšího roku i filtr rodičovské
heatmapy se pořád ptají na `grade`, protože to je rok, ve kterém učivo začíná.
Mapa ukazuje letošní ročník a všechny dřívější; co je dál, je za dílnou pod
ukázkou. Podrobnosti v oddílu 7d.

Trať `school` se na mapě objeví jen tehdy, když je v profilu zvolená učebnice
a kapitola, a jde vždy na první místo. Nese název kapitoly jako podtitulek.
V rodičovské sekci nemá přepínač odemknutí, řídí ji volba kapitoly.

Klíče příkladů: `m{a}x{b}` násobení, `d{a}x{b}` dělení, `a{a}p{b}` sčítání do 20,
`s{a}p{b}` odčítání do 20, `p{bucket}` a `n{bucket}` do stovky, `kp{bucket}`
a `kn{bucket}` do tisíce, `xm{bucket}` a `xd{bucket}` za násobilkou,
`o1` až `o3` zaokrouhlování, `q{bucket}` řetězec tří čísel, `z{bucket}` pořadí
operací, `gm{bucket}` a `gd{bucket}` kulatá čísla, `u1` až `u4` převody
jednotek, `r2` až `r10` dělení se zbytkem, `v1` až `v3` rozklad čísla,
`c1` až `c6` hodiny. Kanonicky vždy `a <= b`,
komutativita se sbaluje. U dvacítky smí být
druhé číslo i náctka, takže 13 + 4 je `a4p13`; díky tomu generátor ani odčítání
nepotřebují na obor do dvaceti bez přechodu jedinou výjimku.

Klíč začínající písmenem z `FAMILY_HEADS`, dnes `p`, `n`, `c`, `k`, `x`, `o`,
`q`, `z`, `g`, `u`, `r` a `v`,
není jeden příklad, ale celá rodina, kterou generátor rozbaluje až v `itemFromKey`.
Proto se v `poolSize` počítá za čtyři a proto `buildRun` na konci přegeneruje
otázku, která by vyšla stejně jako ta předchozí. Každý další kbelíkový generátor
přidá písmeno do `FAMILY_HEADS`, nic víc.

**Varianta žádný klíč nepřidává.** Doplňování chybějícího členu se ptá na tytéž
klíče, jen obráceně, takže v žádném seznamu klíčů nestojí a v `FAMILY_HEADS`
nemá co dělat; viz oddíl 7.

Rodina do tisíce nese znaménko uvnitř klíče, tedy jedna hlavička `k` místo
dvojice písmen jako u stovky. Bylo to vědomé šetření: míst v abecedě je
šestadvacet a plánovaných generátorů kolem dvaceti. Rodina za násobilkou
to dělá stejně, `x` plus `m` nebo `d`, a kulatá čísla taky, `g` plus `m`
nebo `d`.

**Kbelíky za násobilkou se číslují, ne písmenkují.** Hodiny mají rovnou celý
klíč `c1`, stovka a tisícovka lepí písmeno, `"p" + "h1"`. Za násobilkou je
vnitřní id prostě `"1"` až `"4"` a klíč je `"xm" + "1"`. Je to třetí konvence
a je schválně: každé další vnitřní písmeno ubírá z abecedy místo budoucím
hlavičkám rodin, a těch je v plánu ještě kolem deseti.

---

## 6. Datový model

Vše v `localStorage` pod klíčem `math-fact-racer-v1`.

```js
DB = { profiles: [...], current: "id", sound: true, lang: "cs", pin: "hash" }

profil = {
  id, name, lang,
  facts: { "m7x8": {lv, reps, ok, bad, best, seen} },
  stars: { "m7x8": true },               // misto ve sbirce, jednou a navzdy
  best:  { "t1": {dist, hist, n0} },     // rekordy tratí
  done:  { "t1": 3 },                    // nejlepší medaile
  trackRuns: { "t1": 8 },
  opened: { "t1": true },                // trati, ktere uz jednou byly otevrene
  owned: [...], runner: "ri_auto", xp: { "pet_kiki": 120 },
  coins,
  parts: 0,                              // mena dilny, zavodem se nevydela
  paints: ["pa_neon"],                   // koupene natery
  paint: { "ri_auto": "pa_neon" },       // ktery nater je na kterem stroji
  duckParts: ["db_bila", "dh_ksilt"],    // koupene dily kacenky, taky za soucastky
  duck: { body: "db_bila", head: "dh_ksilt" },  // vrstva -> dil, ktery ma kacenka na sobe
  jobRuns: { "money": 3 },               // hotove zakazky
  force: {}, autoUnlock, qCount, speedMode,
  curriculum: null,                      // id z CURRICULA, null = adaptivní režim
  chapter: null,                         // číslo kapitoly uvnitř toho kurikula
  chapterMode: "soft",                   // soft | hard
  world: "circuit",                      // kabat hry, nikdy ne obtiznost
  grade: 2,                              // do ktere tridy dite chodi, 1 az 4
  streak, lastDay, bestStreak, runs, totalOk, totalAns, msSum, msN
}
```

PIN je uložený jen jako hash funkcí `hashPin`. Není to skutečné zabezpečení,
jen zábrana proti dítěti, a je to tak napsané i v rozhraní.

Migrace při načtení: `seedStarters()` dá každému profilu startovní sedmičku
závodníků včetně kačenky, jazyk se doplní, pokud chybí, `normalizeChapter()`
srovná kapitolu, `seedOpened()` doplní seznam otevřených tratí, `seedShop()`
prázdnou dílnu, `seedDuck()` prázdnou kačenčí výstroj, `seedStars()` sbírku,
`seedWorld()` svět a `seedGrade()` ročník. Nové migrace patří do `load()`, a pokud
se týkají profilu jako celku, **taky do větve `import`**; obnovená záloha je
cizí profil, ne ten, který právě běží.

**Kačenka přidala do profilu dvě pole a nic víc.** `duckParts` je seznam id
koupených dílů, `duck` je mapa vrstva → id dílu, který má kačenka zrovna na
sobě. Obojí zakládá `seedDuck(p)` jako prázdné, takže starší profil nic
neztratí: **chybějící `duck.body` znamená klasickou žlutou**, ne kačenku bez
barvy, takže dítě otevře garáž a vidí kačenku hotovou. Díl zdarma patří všem od
začátku a v `duckParts` nestojí, přesně jako startovní závodníci v `owned`;
`duckParts` umí jenom růst. Zamrazený profil těsně před kačenkou je fixture
`v12-pred-kacenkami` v `tests/fixtures/legacy-profiles.json` a `migration.test.js`
u něj hlídá, že obě pole vzniknou prázdná, že kačenka přibude mezi závodníky,
že se bez uloženého těla kreslí klasická žlutá a že se součástky ani nátěry
nezměnily. Byla to jediná věc kroku H, která šla udělat jen tehdy; profil dnešní
verze se zpětně zamrazit nedá.

**Sbírka je vlastní pole, ne pohled do krabičky.** Místo se rozsvítí ve chvíli,
kdy se příklad dostane na úroveň 4, a **už nikdy nezhasne**. Kdyby se počítalo
z `facts`, zhaslo by při každém zapomenutí, a zhasínající sbírka trestá přesně
za to, na čem celá hra stojí. Rozsvěcuje to jediné místo, konec `record()`;
zhasnout to neumí nikde nic. Starší profil se seeduje z toho, co umí teď, tedy
za každý klíč s `lv >= 4`; co uměl dřív, o tom záznam neexistuje.

**Velikost sbírky je `trackKeys(p, tr).length`**, takže násobilková trať má
kolem čtyřiceti míst a kbelíková dvanáct. **Dílna žádná trať není**, takže si
velikost říká `shopSpec()` sama; je to přesně to místo, kde se na dílnu jednou
už zapomnělo, v rodičovské heatmapě. Tratě `mix`, `weak` a `school` sbírku
nemají, první dvě nemají vlastní učivo a třetí si pool půjčuje, takže by
počítala tytéž příklady podruhé. Stejná úvaha jako u `overallMastery()`.

---

## 7. Architektura kódu

`src/app.js` je rozdělený na očíslované oddíly.

1. Jazyk. `t(key, ...)`, `num()`, `applyLang()`, `langSeg()`. `render()` na začátku
   volá `applyLang()`, které podle jména obrazovky vybere buď rodičovský jazyk
   `DB.lang`, nebo dětský `profil.lang`. Rodičovské obrazovky jsou vyjmenované
   v `PARENT_VIEWS`.
2. Úložiště. `load`, `save`, `P()`, `newProfile`, `touchStreak`.
3b. Dílna. Zakázky, peníze, kresba mincí. Sdílí se závodem `focusAndReview()`,
   `stageIndex()` a Leitnerovu krabičku, všechno ostatní má vlastní, včetně
   stavu `JOB` a obrazovek, aby se do závodu nemohla propsat.
3. Příklady. Generování, klíče, stupně `E_STAGES`, tratě, kurikulum, výběr do
   závodu, zápis odpovědi do krabičky.
   **Otázka si o sobě řekne všechno sama.** `itemFromKey()` obalí generátor
   a doplní `input`, tedy na čem se odpovídá, `maxLen` a `check(napsané)`,
   tedy co je správně. Výchozí je jedno celé číslo na číselné klávesnici,
   takže generátor to řeší jen tehdy, když potřebuje něco jiného. Mimo
   `itemFromKey` nikdo nesmí předpokládat, že odpověď je číslo.
   **Vzorec sedmdesát ku třiceti je na jednom místě**, `focusAndReview()`,
   a stupňování taky, `stageIndex()`. Nová rodina je volá, nepíše znovu.
4. Závodníci a kresba postaviček. Všechno parametricky, `petSVG`, `rideSVG`
   a `duckSVG`; vybírá mezi nimi `itemSVG(p, id)`.
   **Závodníci jsou tři druhy, ne dva.** Stroj (`it.kind`), zvíře a gumová
   kačenka (`it.duck`). Kačenka se nemaluje a neroste, takže `isPet(it) =
   !it.kind && !it.duck` a všechna místa, která se dřív ptala jen „je to
   stroj“, se ptají tímhle; kdyby ne, kačenka by tiše sbírala zkušenosti
   a vyrostla do stupně, ke kterému žádná druhá kresba neexistuje.
   **Kačenka se skládá z pěti vrstev a kreslí ji `duckSVG(it, outfit)`**
   podle kotev v `DUCK`. Celý model má vlastní oddíl 7f, včetně pravidla
   o autorských právech u nových dílů.
   **Zvíře se kreslí vlastní funkcí, ne jedním tvarem s přepínači.**
   `PET_SHAPES` je tabulka kreseb, jedna na zvíře, a `petSVG()` je jen
   dispatcher plus společný obal: měřítko podle stupně, oči, úsměv a hvězda
   třetího stupně. Tvar vrátí hotovou kresbu a řekne, kam patří oči a pusa;
   sova a krokodýl mají `mouth:"own"`, protože zobák a zubatá čelist jsou
   ta pusa. Nic se neotáčí a všechny cesty jsou psané absolutně, takže si
   `items.test.js` umí body přečíst zpátky z kresby a ohlídat rám.
   Tady je i sbírka nálezů: `tokenShape()` se sedmi tvary, `tokenSVG()` pro jedno
   místo a `tokenGridSVG()` pro celou sbírku. **Celá sbírka je jedna kresba**,
   ne jeden prvek na místo; dvacítka jich má sto dvaaosmdesát a přes všechny
   tratě jich je přes čtyři sta, což by byla zbytečná hromada uzlů. Tvar se
   řídí prostředím trati, každá paleta v `ENVS` si přes `tok` řekne, co se v ní
   sbírá, a barvu dá taky.
5. Cesta jednoho závodu. Bézierova křivka z osazeného generátoru, geometrie se
   počítá v JS, ne přes SVG DOM, aby šla testovat mimo prohlížeč. `route(svět, id)`
   vrací uzavřenou smyčku v okruhu a otevřenou cestu se zastávkami v ostatních
   světech, `atU(c, u)` je nad obojím stejné, `sceneSVG()` to nakreslí a týmž
   kódem vyrobí i náhled na mapě. Viz oddíl 7c.
6. Zvuk. Syntetizované tóny, žádné soubory.
7. Obrazovky. `viewPlayers`, `viewMap`, `viewGame`, `viewResult`, `viewTokens`,
   `viewCollection`, `viewShop`, `viewJob`, `viewJobDone`, `viewSetPin`,
   `viewGate`, `viewParent`. Pozor na dvě slova, která znějí stejně:
   `viewCollection` je **garáž**, tedy stroje, zvířata a nátěry, a jmenuje se
   v rozhraní Sbírka; `viewTokens` je **sbírka nálezů** vázaná na krabičku
   a jmenuje se Poklady.
8. Interakce. Jeden delegovaný posluchač kliknutí nad celým dokumentem, plus
   druhý na `change` kvůli rozbalovacím nabídkám, které klik nevyvolávají.

**Rozvržení je dvě hodnoty na `<html>`, ne media query.** `layoutClass()` je
zapisuje při startu, v `resize` i v `orientationchange` a `mapCols()` z nich
odvozuje počet sloupců mapy; podrobnosti v oddílu 7e. Obrazovky o tom vědí jen
tolik, že mapa si vyžádá `cols` a textové obrazovky mají na `.scr` třídu
`narrow`. Třetí hodnotu, `data-grade`, píše na `<html>` `render()` hned za
`applyLang()` a je to jediné, co kód o velikosti písma ví; samo měřítko `--tx`
je v CSS.

**Obrazovka se smí otevřít u konkrétní sekce.** `go(name, {focus:"id"})` po
vykreslení posune sekci s tím `id` do zorného pole. Používá to dílna, když
posílá dítě utratit součástky za nátěry. `scrollIntoView` v jsdomu není, takže
volání je pojištěné podmínkou, jinak by spadly testy.

**Otázka nemusí být rovnice.** Zaokrouhlování je první rodina, kde mezi
zadáním a odpovědí nestojí rovnítko. Znak si říká položka sama přes `rel`,
což je překladový klíč, ne hotový znak, protože české školy píšou `≐`
a anglické a německé `≈`; dítě má na obrazovce vidět to, co zná ze sešitu.
Vykresluje to `relOf()` a používají ho dvě místa, `questionHTML()` a
`rightAnswerText()`. Co se má udělat, se říká slovy nad klávesnicí přes `ask`,
stejně jako u hodin; `askText()` umí k `ask` předat i argumenty přes `askArgs`,
stejně jako dílna.

**Odpověď smí nést jednotku.** Převody jsou první rodina, u které za
odpovídacím políčkem stojí ještě `cm` nebo `dny`. Je to **další údaj na
položce**, `unit`, ne výjimka rozesetá po kódu: `questionHTML()` ho vykreslí za
`#abox`, `rightAnswerText()` ho přilepí za číslo a `questionSize()` ho počítá do
délky řádku. Kdo jednotku nemá, nepozná, že existuje. Tvar jednotky vybírá
generátor podle čísla, které u ní stojí, takže na položku se ukládá hotový text,
ne klíč; jazyk se uprostřed závodu nemění.

**Otázka smí být položená pozpátku, a není to nová rodina.** `itemFromKey(key,
opts)` bere druhý parametr; `opts.variant === "missing"` nechá generátor
pracovat beze změny a pak výsledek obalí: schová první číslo řádku a dopíše
výsledek, tedy z `6 × 7` udělá `▢ × 7 = 42` s odpovědí 6. **Klíč se nemění**,
takže krabička, sbírka i rodičovská heatmapa vidí jeden příklad, ne dva; kdyby
si varianta založila vlastní hlavičku, byla by to druhá krabička na totéž
učivo a začínala by na nule. Variantu si vyžádá **kapitola**, polem `variant`
v `pool`, a předává ji jediné místo, větev `school` v `buildRun()`; žádná trať
o ní neví, takže se nedostane ani do šampionátu, ani do trati "co ti nejde".
Obalit jde jen prostý početní řádek, proto `MISSING_HEADS`: ciferník,
zaokrouhlení, převod s jednotkou a řetězec tří čísel projdou nedotčené, což je
potřeba, protože závod podle kapitoly pouští variantu i na opakování
z dřívějších kapitol. Násobitel prahů 1,6 **násobí** násobitel rodiny.

**Řádek otázky má tři tvary, ne jeden.** Vedle běžného `zadání = [políčko]`
existuje `layout:"lead"`, kde políčko stojí vlevo a zbytek řádku za ním,
`[políčko] × 7 = 42`, a od kroku E1 řádek s víc políčky, viz níž. Kreslí je
všechny totéž
`questionHTML()`. Vedoucí řádek příplatek na délku **nedostal a nemá ho dostat**:
obě ta rozvržení kreslí právě jedno políčko, takže se políčko vykrátí, a vedoucí
řádek si navíc nese znaménko i výsledek uvnitř měřeného textu, kdežto běžný je
kreslí mimo něj. Prostý počet znaků tedy sedí na znak přesně. `rightAnswerText()`
takový řádek přečte s doplněným políčkem, tedy `6 × 7 = 42`. Žádný znak pro
prázdné políčko se nekreslí; políčko **je** `#abox`, skutečný prvek
s přerušovaným rámečkem a otazníkem, takže na řádku není nic, co by záviselo na
jazyku nebo na tom, jestli písmo telefonu zná `▢`.

**Odpověď smí mít víc než jedno políčko.** Dělení se zbytkem má podíl a zbytek,
a to jsou dvě čísla, ne jedno divně zapsané; finta „hodina krát sto plus minuty“
by u nich nerozlišila špatný zápis od špatného výpočtu. Kolik políček otázka má,
si říká sama přes `input`, a tabulka `SLOTS` k tomu jménu přiřadí počet: `pad` je
jedno, `pad2` dvě, `pad3` tři. Kód kolem toho je obecný v počtu, takže `pad3`
v kroku E2 opravdu byl jen další řádek v `SLOTS` a ne třetí cesta; nic
z odpovídání se kvůli němu nemuselo přepsat, jen se zobecnilo to, co ještě
počítalo do dvou. `pad2` vyrábí dělení se zbytkem, `divremItem()`, `pad3`
i `pad2` rozklad čísla, `splitItem()`; viz oddíl 4. Kolik políček otázka má, smí
záviset i na kbelíku: rozklad má první dva kbelíky do dvou políček a poslední do
tří, protože tolik řádů to číslo má.

- `RUN.typed` je řetězec, dokud je políčko jedno, a pole řetězců, jakmile jich je
  víc; `RUN.slot` říká, do kterého se píše. Sahá se na to jen přes `typedAt()`,
  `setTypedAt()`, `blankTyped()` a `typedFull()`, takže zbytek kódu o tom, který
  z obou tvarů zrovna platí, vědět nemusí.
- Políčka mají `id` `abox`, `abox2`, …; **první si jméno nechalo**, protože ho zná
  celá obrazovka. Dává je `boxId()`, hledá `boxAt()` a překresluje `paintBoxes()`.
- `maxLen` smí být číslo pro všechna políčka, nebo pole po políčkách; dělení se
  zbytkem chce dvouciferný podíl a jednociferný zbytek, tedy `[2,1]`.
- Plné políčko předá klávesy dalšímu samo, mazání za začátkem políčka se vrátí do
  předchozího a přepnout se dá dvěma způsoby: klávesou se šipkou (`data-k="next"`)
  a klepnutím do políčka (`data-slot`). Klávesa musí jít přes `data-k`, protože
  delegovaný posluchač bere `data-k` dřív; `data-slot` je z téhož důvodu vlastní
  větev hned za ním, ne `data-act`.
- `check` dostane **pole** a porovná každou hodnotu zvlášť; výchozí porovnání
  vyrábí `defaultCheck(answer)` z toho, jestli je odpověď pole. Prázdné políčko
  není nula, `typedFull()` nepustí OK dřív, než je v každém políčku něco.
- Slova mezi políčky a za nimi jsou na položce jako hotový text (`sep`, `tail`),
  ze stejného důvodu jako jednotka: jazyk se uprostřed závodu nemění. **`sep`
  stojí v každé mezeře mezi dvěma políčky**, takže jedno slovo obslouží řádek se
  dvěma políčky i se třemi; u rozkladu je to prosté `+`, které je ve všech třech
  jazycích tentýž znak, takže stojí rovnou v generátoru.
  `questionSize()` je počítá do délky řádku tolikrát, kolikrát se kreslí, každé
  políčko navíc k nim přidá tři znaky za sebe, protože se nevykrátí, a k tomu
  ještě tolik znaků, o kolik je první políčko širší než jedno místo: to jediné,
  co se vykrátí, je políčko na jednu číslici, a do prvního políčka rozkladu se
  píše tři sta. `rightAnswerText()` přečte celý řádek zpátky, tedy
  `36 : 5 = 7 (zb. 1)` a `347 = 300 + 40 + 7`.
- CSS: `.question.q-boxes` je řádek s víc políčky (užší políčko a menší mezery,
  jinak se dvě políčka na 375 px nevejdou), `.question.q-boxes3` je totéž ještě
  o kousek stažené pro tři políčka, `.keypad-pad2` a `.keypad-pad3` je táž
  klávesnice se čtvrtým sloupcem na gumu, šipku a fajfku. Řádek se na telefonu na
  výšku vejde na jednu řádku pro třetí a čtvrtý ročník; ve větším písmu prvních
  dvou ročníků a v závodě na šířku se zalomí, stejně jako se dnes zalomí nejdelší
  převod nebo závorka, a nic se neuřízne.

**Chyba v rozkladu má vlastní hlášku.** `missHint()` u `kind:"split"` pozná
jedinou chybu, o kterou v téhle rodině jde: napsanou číslici místo toho, kolik
doopravdy platí, tedy 4 tam, kam patří čtyřicet. Každá část odpovědi je číslice
krát to, co její místo platí, takže ta číslice je první znak z ní, a hláška
jmenuje obojí (`splitDigits`).

**Chyba s dvěma políčky má vlastní hlášky.** `missHint()` u `kind:"divrem"`
pojmenuje dvě chyby, které dítě opravdu dělá: zbytek větší nebo rovný děliteli
znamená, že se tam vejde ještě jedna celá (`divremTooBig`), a správný zbytek
s chybným podílem znamená, že se špatně spočítalo, kolikrát se to tam vejde
(`divremQuotient`). Obě jmenují dělitele, takže obě potřebovaly generátor; než
byl, nešly napsat. Cokoli jiného padá na obecnou hlášku, stejně jako u hodin.

**Známé zjednodušení: `record()` bere správnost jako ano nebo ne**, takže „podíl
dobře, zbytek špatně“ spadne do krabičky jako celá chyba a celý příklad se vrátí
jako otázka navíc. Rozlišit to by znamenalo sáhnout na datový model, tedy na
pravidlo z oddílu 3 i na migrační test, a v kroku E1 se to vědomě nedělá. Pro
učení to není špatně (dítě si příklad zopakuje celý), ale rodičovská heatmapa
kvůli tomu neukáže, že zlobí jenom zbytek.

**Pozor na čtyři pasti.** `t` je překladová funkce. Nikdy nepojmenovávej lokální
proměnnou `t`, zvlášť ne pro objekt trati. Používá se `tr`. Tohle už jednou
způsobilo chybu. Rozbalovací nabídka potřebuje `change`, ne `click`, takže
nové `<select>` musí mít obsluhu v tom druhém posluchači. A otázka není vždycky
řádek textu: `questionHTML()` vrací **celý prvek `#qbox`** včetně rovnítka nebo
ciferníku, odpovídacího políčka a třídy podle délky zadání, a mezi otázkami se
ten prvek vyměňuje přes `outerHTML`, takže `#abox` se po každé otázce musí najít
znovu; od kroku E1 to platí dvojnásob, protože políček může být víc a hledají se
přes `boxAt(i)`, nikdy si je nedrž v proměnné přes hranici otázky. Nikdy nesahej
na `#qtext` přes `textContent`, pokud může nést obrázek.
**Dlouhé zadání si samo řekne o menší písmo.** `questionSize()` měří řádek tak,
jak se kreslí, tedy **včetně mezer a včetně jednotky za odpovědí**, a dá `#qbox`
třídu `q-long` od devíti znaků a `q-xlong` od třinácti; `47 + 5 - 3 = ?` se v plné velikosti na 375 px
telefon nevejde. Mezery se počítají schválně: bez nich má právě tenhle příklad
šest znaků a propadl by. Dnes to potkává celý řetězec, první stupeň tisícovky, tedy `300 + 200`,
a převody, jejichž nejdelší řádek je převod měsíců na roky
(`240 měsíců = ? let`), což jsou opravdu nejširší řádky ve hře. Řádek se navíc smí
zalomit, takže `= ?` spadne na druhý řádek dřív, než by se cokoli uřízlo. A čtvrtá: CSS třída `.keypad` je odpovídací plocha, `.keypad-pad`
je konkrétní rozvržení číselné klávesnice. Jméno `pad3` patří v katalogu témat
vstupnímu prvku se třemi políčky, který od kroku E2 existuje a má třídu
`.keypad-pad3`, takže se na rozvržení používat nesmí, i když jsou to zrovna tři
sloupce; rozvržení číselné klávesnice se jmenuje `.keypad-pad`, ať se otázka
odpovídá do kolika políček chce.

---

## 7b. Rodičovská heatmapa

Od září 2026 je to komponenta, ne natvrdo skládaná tabulka. Obrazovka o rodinách
neví, rodina si řekne, co se má vykreslit.

**Dva tvary.** `heatGrid()` pro to, co je součin dvou os, tedy násobilka
a dělení. `heatStrip()` pro všechno ostatní, tedy jedna dlaždice na kbelík,
stupeň nebo krok dílny. Obojí vrací stejný objekt `{title, kind, cols, tiles}`
a vykresluje ho jeden `heatBlock()`. Počet sloupců jde do CSS proměnné `--hc`,
takže `.heat` má jedno pravidlo pro obě šířky.

**Dlaždice smí stát nad víc klíči.** Stupeň do dvaceti jich má sedmdesát,
kbelík do sta jeden. `heatCell()` počítá průměrnou úroveň přes všechny klíče
dlaždice, tedy dělí počtem klíčů, ne počtem procvičených; kdyby dělilo
procvičenými, vypadal by načatý stupeň jako zvládnutý. Barevná škála je díky
tomu v obou tvarech stejná.

**Kbelík se pojmenovává příkladem, ne slovem.** `34+5` řekne rodiči víc než
jakýkoli popisek a nepotřebuje překlad. Odčítací polovina se dopočítá ze
sčítacího příkladu přes `minusEx()`, aby se totéž nepsalo dvakrát. Slovní
popisky potřebují jen kroky dílny.

**Co se ukazuje.** Rodina dostane blok, když je její trať otevřená, nebo když
z ní dítě něco má v krabičce. Zamčená a nedotčená rodina by byla jen plocha
prázdných čtverečků. Dílna je na mapě vždycky, takže má blok vždycky.

**Souhrn nahoře** je `overallMastery()`, vážený průměr zvládnutí přes otevřené
tratě, váhou je `poolSize()` klíčů trati. Nepočítají se `mix` a `weak`, protože
nemají vlastní učivo, ani `school`, protože svůj pool půjčuje od ostatních
a počítal by tytéž příklady podruhé. Dílna taky ne, není to trať.

**Nová rodina** přidá jeden `push()` do `heatSpecs()`, tabulku příkladů vedle
`H_EX` a `K_EX`, a pokud potřebuje slovní popisky, klíče `heat_*` ve třech
jazycích. Ty se skládají dynamicky, takže prefix `heat_` je v poli `dyn`
v `tests/i18n.test.js`.

---

## 7c. Světy a mapa

Od září 2026 má hra čtyři světy: `circuit`, `trail`, `sky` a `deep`. Je to
**jedna hra v jiném kabátě, nikdy dvě hry**; proč právě takhle, je
v `ROADMAP.md`, oddíl 2, včetně experimentu, ve kterém byla genderově neutrální
hra oblíbenější než hra cílená na vlastní pohlaví.

**Co svět mění.** Tvar cesty, co u ní stojí, čím končí, krajinu každé trati,
pořadí nabízených jezdců a hrstku slov.
**Co nemění: učivo, obtížnost, odemykání ani rekordy.** Rekordy se ukládají pod
`tr.id`, takže přepnutí světa je nechává být, a to tak musí zůstat.

**Svět není přebarvený okruh.** Okruh je uzavřená smyčka, po které se jezdí
dokola, a končí tam, kde začal, tedy u cílové čáry. Ostatní tři světy jsou
otevřená cesta z jedné strany scény na druhou, zakončená cílem: stezka se vine
lesem k velkému stromu, obloha je řada skoků z obláčku na obláček k duhové
bráně, hlubina klesá kolem různobarevných rybiček k potopené truhle. Dělá to
`route(world, id)`, tvar podle `ROUTE_KIND`, a vrací vždycky totéž, tedy křivku
ke kreslení, lomenou čáru k měření a seznam zastávek, na kterých stojí obláčky,
rybičky nebo houby. **Díky tomu nikdo za `route()` neví, ve kterém světě je**,
`atU()` a celý pohyb včetně ducha vlastního rekordu zůstal beze změny.

**Cesta je pro každou trať jiná, ne jen jinak barevná.** Počet zastávek, výška
oblouků, amplituda vlnění i sklon stoupání se losují ze seedu trati, protože
jedenadvacet tratí lišících se jen barvou by udělalo z náhledů na mapě ozdobu.
Hlídá to `items.test.js`, okruh 13b, i to, že cesta nevyjede ze scény.

**Scénu kreslí jedno místo, `sceneSVG()`,** a totéž se používá i jako náhled na
mapě, jen s méně detaily; co dítě vidí na mapě, tam se pak opravdu dostane.
Okruh v náhledu vypadá přesně jako dřív.

**Nabídka jezdců se jen řadí, nikdy nefiltruje.** `ridesOrder()` dá dopředu
jezdce daného světa a za ně všechny ostatní. Kdyby svět filtroval, přišlo by
dítě přepnutím světa o koupený stroj, a to je přesně to, co zakazuje oddíl 3.

**Krajinu určuje jediné místo, `envOf(p, tr)`.** `TRACKS` si nechává `env` jako
výchozí hodnotu pro okruh, ostatní světy mají vlastní mapu trať na prostředí.
Čte to mapa, závodní obrazovka i sbírka; nikdo jiný se na `tr.env` dívat nemá.

**Paleta je čtyři barvy plus pár příznaků.** `dark` znamená noční oblohu místo
křoví, `tok` říká, co se v prostředí sbírá. Obojí bývalo v seznamu jinde v kódu
a při šedesáti prostředích by to nešlo udržet. Prvních patnáct palet je ručních
a jsou to barvy okruhu, **nesahat na ně**; zbylých pětaosmdesát se generuje
funkcí `pal(odstín země, odstín porostu, světlost, co se sbírá, volitelné)`,
takže další svět stojí patnáct krátkých řádků, ne šedesát ručně míchaných barev.

**`hill1` je vždycky horní konec přechodu a `hill2` spodní.** Na zemi to znamená
světleji nahoře a tmavěji dole, jak vypadá louka. Obloha je obráceně, tmavší
nahoře a jasná u obzoru, a moře je nahoře voda a dole dno, takže tyhle palety
si druhý konec řeknou samy přes `h2` a `l2`. Pravidlo, které z toho plyne:
**u oblohy zůstává horní konec v modrých a u hlubiny taky**, charakter místa
nese ten spodní. Bez toho vyšlo rudé moře a hnědá obloha. `sat` je pro kámen,
mlhu a bouřku, které musí být tlumené.

**Nová paleta musí být od všech ostatních v témže světě aspoň 22 ΔE**, měřeno
jako Euklidovská délka rozdílu obou konců přechodu v Lab. Tolik má každá paleta
přidaná od září 2026 a hlídá to okruh 13c v `items.test.js`; starší palety
laťku nesplňují všechny, takže test drží zapsaný dluh po světech a ten smí jen
klesat. Palety s `dark` do měření nevstupují, protože noční zem se kreslí
pevnou dvojicí barev a jejich vlastní kopce se nikde neobjeví. Bez téhle
kontroly se to neuhlídá okem ani v kódu, viz oddíl 9.

**Texty se přebíjejí přes `w_<svet>_<klic>`.** `t()` hledá nejdřív klíč se
světem a pak holý, takže ve slovníku jsou jen slova, která se opravdu liší,
a zbytek se nekopíruje čtyřikrát. Který svět platí, drží `CUR_WORLD`, nastavuje
ho `applyLang()` a v rodičovské sekci je prázdný, protože rodič mluví o hře,
ne z ní. Dnes se přebíjejí tři klíče: `whichRacer`, `letsGo` a `crossedLine`.

**Volba světa je na mapě, ne za rodičovským kódem.** Je to dětská volba a funguje
přes to, že se v ní dítě pozná; schovat ji dospělým by ji zrušilo.

**Mapa je krajina.** `viewMap()` rozmístí místa podél vinoucí se cesty:
`worldSpots()` počítá polohy ze seedu světa, `worldRoad()` prokládá jejich středy
esíčky. Vodorovně se měří v procentech a svisle v pixelech, takže se to vejde do
každého telefonu; cesta je jedno SVG přes celou plochu s `vector-effect`, jinak
by ji roztažení do šířky rozmázlo. **Klepnutí na místo skočí rovnou na trať**,
cesta je ozdoba; jediná nalezená studie hlásí u povinného průchodu centrem
pokles pocitu kompetence a autonomie. Zamčené místo je vidět, jen je tmavé,
a není to tlačítko. Dílna má vlastní místo a vlastní vzhled. Co z mapy patří
letošku a co minulým letům, řeší oddíl 7d.

**Rozměry jsou spočítané, ne odhadnuté.** Na telefonu je místo široké 44 procent
a mezi dvěma sloupci zbývají čtyři procenta, takže se nedotknou ani na nejužším
telefonu; svisle stojí řádky od sebe o výšku karty plus `PLACE_GAP`, což je na
telefonu kolem 238 pixelů. `flow.test.js` to ověřuje
polohami, ne pohledem, a `items.test.js` od kroku C počítá obdélníky míst pro
dva, tři i čtyři sloupce a hlídá, že se žádné dva neprotnou a žádné nevyjede ven.

**Kolik má mapa sloupců, řídí šířka okna**, viz oddíl 7e. Místa stojí v řádcích
a **čtou se jako stránka, tedy zleva doprava a shora dolů**, ve všech šířkách
včetně dvou sloupců na telefonu; od tří sloupců k tomu karta roste do šířky
i do výšky. Na konci řádku se cesta vrací prázdným pásem mezi řádky až k levému
okraji a dalším řádkem pokračuje zase zleva. Hadovité řazení, které tu stálo od
kroku C, osmiletý neuměl přečíst, viz oddíl 9.

## 7d. Ročník, předěl na mapě a ukázka dalšího roku

Od září 2026 má profil `grade`, tedy třídu, do které dítě chodí. **Skládá se
podle něj mapa**: jsou na ní tratě letošního ročníku a všech dřívějších.
Rozhoduje `inGrade(p, tr)` a ročník trati je v `TRACKS`, odečtený z map
učebnic, viz tabulka v oddílu 5.

**První ročník je žebřík šesti oborů**, ne jedna trať, viz oddíl 4. Prvňák tak
na mapě nezačíná u jednoho velkého místa, ale u nejmenšího oboru a pět dalších
vidí před sebou.

**Mapa začíná tam, kde je letos třída.** Přišlo to z hraní s dítětem 13. září
2026: syn si nastavil třetí třídu a mapa byla jen pokračování celého
předchozího bloku, bez předělu, kde začíná "jeho" učivo. Dřívější roky jsou
proto na mapě složené a rozbalí se jen na žádost, stejně jako se na druhém
konci rozbaluje příští rok. Tím padl dřívější závěr, že se dřívější ročník
nikdy neschovává a žádné tlačítko zpátky není. **Nic se ale neztrácí:** učivo
minulých let zůstává v profilu, v krabičce, v šampionátu i v rodičovské sekci
beze změny, vrací se k němu Leitnerova krabička a odemykání se nemění. Na mapě
je jen za dveřmi.

**Za dveřmi je jen to, k čemu se třída už nevrací, ne všechno starší.** První
verze skládání se ptala na rok, ve kterém se učivo zavádí, a schovala tím
třeťákovi malou násobilku, stovku i hodiny. To je přesně naopak, než jak
vypadá školní rok: třetí třída začíná opakováním malé násobilky (kapitoly 2
a 3 sedmého dílu Matýska), stovky (kapitola 1) a hodin (kapitola 4), a hra
vznikla právě kvůli tomuhle opakování. Učivo má proto v `TRACKS` dvě čísla,
`grade` a `thru`, viz oddíl 5, a `yearOf(p, tr)` se ptá na rozsah: co je
zavedené později, je `"ahead"`, co se naposled opakovalo dřív než letos, je
`"past"`, zbytek je `"own"`. Na `thru` se neptá nic jiného než tahle jediná
funkce.

**Druhák dveře nemá**, protože celý první ročník se ve druhé třídě opakuje
(kapitola 1 čtvrtého dílu, "Opakování do dvaceti bez přechodu"), takže nemá co
dát za ně. Jeho mapa je jeden blok, celý letošní, bez dveří i bez milníku,
a to je správně. Dveře a milník se ukazují podle toho, jestli je aspoň jedna
trať `"past"`, nikdy podle `tr.grade < g`; dnes to znamená od třetí třídy.

**Tvar mapy shora dolů:** dveře do minulých let (`.place.backdoor`,
`data-act="back"`, s podtitulkem, které třídy jsou za nimi, a v patičce
součtem rozsvícených míst ve sbírkách těch tratí), za nimi rozbalené tratě
minulých let s třídou `past` (plný vzhled, ne čárkovaný, protože je to učivo,
které dítě má, ne ukázka), pak **milník** `.milestone` s letošním ročníkem,
pak letošní tratě, dílna a nakonec dveře do příštího roku s ukázkou.

**Podtitulek dveří vychází z ročníků tratí, které jsou opravdu `"past"`**, ne
z rozsahu 1 až g-1; dělá to `gradeList(past)`. Třeťák tam má "1. a 2. třída",
protože za dveřmi jsou obory prvního ročníku i most přes desítku.

**Milník je ten předěl, kvůli kterému to celé je,** takže stojí na cestě
vždycky, ať jsou dveře otevřené, nebo zavřené. Není to tlačítko. Mezi místa se
nepočítá, ale na cestě zabírá půl kroku (`placeBox().step / 2`); `worldSpots()` to
umí přes parametr `gapAt` a milník sedí v půlce toho esíčka, což je u téhle
křivky přesně střed obou sousedních míst. **Letošek začíná vlastním řádkem**,
v každé šířce včetně dvou sloupců na telefonu, protože mezi dvěma kartami
v jednom řádku není pro ceduli místo a sedla by si na ně; buňky, které tím na
konci předchozího řádku zbydou, zůstanou prázdné a milník stojí v tom prázdném
pásu nad letoškem. Ten pás je široký `PLACE_GAP` plus půl kroku, takže cedule
má nad sebou i pod sebou přes sedmdesát pixelů volného místa, a protože střed
obou sousedních míst vychází přesně na vratnou čáru, stojí milník na cestě,
přesně jak má.

**Co je letošní, říká `yearOf(p, tr)`**, ne `tr.grade`, a ptá se jí celá mapa.
Vrací `"past"`, `"own"` nebo `"ahead"`. Šampionát (`mix`), slabá místa (`weak`)
a trať podle školy (`school`) jsou **vždycky letošní**: ročník mají v `TRACKS`
jen proto, aby je prvňák neviděl.

**Ročník 4 se neskládá.** Nemá vlastní trať, takže by složení schovalo celou
mapu za jedny dveře, a jsou to zároveň všechny starší profily, kterým
`seedGrade()` dal čtyřku. Pravidlo je ve `foldsYears(p)`: skládá se jen ročník,
který má v `TRACKS` aspoň jednu vlastní trať. Až krok G přinese učivo čtvrtého
ročníku, začne se skládat i on. Prvňák a druhák dveře zpátky nemají taky, ale
z druhé strany: nemají co složit.

**Po rozbalení i po sbalení se pohled posune na milník**, `go("map",
{focus:"milestone"})`. Rozbalení přidá místa nad letošní blok, cesta vyroste
směrem nahoru a pod prstem by se jinak objevilo něco jiného.

**V hlavním bloku mapy musí mít každý čerstvý profil aspoň jednu otevřenou
trať.** Hlídá to okruh 14 v `items.test.js` pro všechny čtyři ročníky, protože
právě tohle se rozbilo: čerstvý třeťák chvíli neměl otevřené nic a jeho první
klepnutí musely být dveře do minulých let. Dnes má otevřenou malou násobilku
(`t1`) a hodiny (`clock`), obojí bez čekání na loňsko. Odemykání
(`unlockState()`) se kvůli tomu nezměnilo ani o řádek; rozhodnutí R1
v `docs/PLAN.md`, oddíl 9, tedy otevřít starším dětem celé minulé roky,
zůstává neudělané a není na něm nic závislého.

**Ročník se vybírá při zakládání hráče** a nedá se přeskočit; předvolba by byla
tichý odhad, který buď zavalí prvňáka, nebo schová půlku hry třeťákovi. Rodič
ho pak může kdykoli změnit v rodičovské sekci, oddíl Ročník.

**Za dílnou je na konci cesty dveře na příští rok.** Klepnutí rozbalí tratě
následujícího ročníku, dají se rovnou zkusit, ale **nic se tím nepřepíná**:
`PEEK` je proměnná, ne pole v profilu, takže zavření hry i přepnutí hráče
ji složí zpátky. Nabízí se vždycky jen jeden rok dopředu; seznam všeho, co
zbývá, není pozvánka, ale zeď.

**Do profilu nezapisují ani jedny dveře.** Rozbalení minulých let drží `BACK`
s id profilu, přesně jako `PEEK`, takže zavření hry i přepnutí hráče mapu zase
složí. `pick` a `gradeset` nulují obojí.

**Filtr platí i jinde než na mapě.** Šampionát nesmí podstrčit učivo, které
na mapě ještě není, rodičovská heatmapa a souhrn mluví jen o tom, co dítě
opravdu má, a sbírka mimo ročník se ukáže jen tehdy, když už v ní něco svítí,
což se stane po zkoušce z ukázky.

**Starší profil žádný ročník nemá.** `seedGrade()` mu dá nejvyšší, tedy celou
mapu, protože cokoli nižšího by mu vzalo tratě, které už vidí. Čtyřka znamená
čtvrtou třídu a výš, tedy všechno; čtvrtý ročník v aplikaci zatím není, takže
čtvrťák nemá co ukazovat dopředu a dveře na příští rok se mu neobjeví.

## 7e. Rozvržení: šířka, orientace a počet sloupců

Od kroku C (13. září 2026) hra nepočítá s tím, že je na telefonu na výšku.

**Rozhoduje JS, ne media query.** `layoutClass()` přečte `innerWidth` a
`innerHeight` a zapíše na `<html>` dvě hodnoty: `data-w` je `phone` pod 600 px,
`tablet` od 600 do 899 a `desk` od 900, `data-o` je `wide`, když je okno na
šířku a aspoň 640 px široké, jinak `tall`. Volá se při startu před prvním
`go()`, v `resize` a v `orientationchange`. Důvod, proč ne media query: mapu
skládá JS a musí vědět, kolik má sloupců, a část pravidel by potřebovala `or`,
které starší Android v media query neumí. CSS pak píše `html[data-o="wide"]
.game{...}`. Rozhoduje **šířka okna, ne přístroj**: telefon položený na bok má
přes 600 px, takže dostane tři sloupce a `wide`, a je to tak správně.

**Šířka aplikace** je `--appw`: 520 px na telefonu, 720 px na tabletu na výšku,
`none` na šířku. Obrazovky, které jsou text a seznam (hráči, výsledek, výsledek
zakázky, poklady, brána, kód, rodičovská sekce), mají na `.scr` třídu `narrow`
a jejich `.scr-scroll` má `max-width:760px`, ať se řádky netáhnou přes celý
tablet. Mapa, závod, dílna a garáž `narrow` nemají, protože plochu potřebují.

**Na šířku se závod i dílna skládají do dvou sloupců.** Závod je mřížka
`"stage qzone" "stage keypad" "rail keypad"`, tedy scéna vlevo přes celou výšku,
vpravo otázka a pod ní klávesnice, která vyplní zbytek. Scéna si drží poměr
(`preserveAspectRatio="xMidYMid meet"`) a `fitBox()` počítá polohu auta
z naměřeného boxu, takže auto sedí na cestě i v jiném než 400 : 205 boxu; po
stranách zůstane `#0d1428`, což je barva noci závodu. `slice` nikdy, `fitBox()`
počítá s menším z obou měřítek. Dílna má vlevo zadání, obrázek a kruhové okno,
vpravo pult, nápovědu, mince a Hotovo; obal tlačítka Hotovo se jmenuje `jobgo`.

**Mapa má podle šířky dva, tři nebo čtyři sloupce**, viz oddíl 7c a rozhodnutí
R6 v `docs/PLAN.md`. `viewMap()` spočítá `cols` přes `mapCols()` a předá ho
`worldSpots()`; šířku karty nastavuje CSS podle `data-cols` na `.world`.
**Pořadí míst je pro všechny šířky totéž**, tedy po řádcích zleva doprava:
`worldSpots()` má od 13. září jedinou větev, řádek je `Math.floor(j / cols)`
a sloupec `j % cols`, bez obracení lichých řádků. Cesta o sloupcích pořád neví;
`worldRoad()` pozná konec řádku podle toho, že další místo leží celé vlevo od
toho předchozího, a šířku i výšku karty si odečte ze samotných bodů, které
dostane (`2 * (cx - left)` a `2 * (cy - y)`). Návrat je pak dvě zatáčky a rovný
úsek uprostřed pásu mezi řádky, takže se nekreslí přes karty. Změna
orientace mapu překreslí s odkladem 150 ms; pohled se vrátí nahoru, což je při
otočení tabletu v pořádku.

**Výška karty na mapě se počítá, neodhaduje.** `placeHeight(šířkaPx, tx)` sčítá
kartu z hodnot v `src/styles.css`: odsazení 9 a rámeček 2 nahoře i dole, náhled
v poměru 400 : 205 z vnitřní šířky, mezera 5 mezi každými dvěma prvky, název
16 px × `tx` s řádkováním 1,1 na dva řádky, podtitulek 12,5 × `tx` s 1,25 na dva
řádky a podle tvaru karty buď pruh postupu 7 px a patička, nebo dvouřádková
zpráva o zámku. Bere největší ze čtyř tvarů, takže je rozestup v celé mapě
stejný a nezáleží na tom, která karta kde stojí. Dva řádky nejsou opatrnost,
ale skutečnost: "Šestky a sedmičky", "Sechser und Siebener" ani "Was ihr in der
Schule macht" se na jeden řádek nevejdou. Všechny tři texty mají v CSS
`-webkit-line-clamp:2`, takže třetí řádek vzniknout nemůže. `placeBox()` počítá
šířku z `.world`, tedy `#app` mínus 28 px okrajů, a když není co změřit, vezme
šířku okna, která může být jen větší; krok pak vyjde s přebytkem vzduchu, nikdy
s nedostatkem. Mezi dvěma řádky je `PLACE_GAP`, **36 px**, a z téhož čísla se
počítá i vzduch pod poslední kartou. Krok dolů je jeden řádek, tedy výška karty
plus `PLACE_GAP`, a je stejný pro dva, tři i čtyři sloupce, protože místa stojí
v řádcích všude. Hlídá to okruh 15 v `items.test.js`, který si výšku karty
počítá nezávisle, přímo ze stylu.

**Pás mezi řádky je vratná dráha, ne jen vzduch.** Cesta jím na konci každého
řádku jede zpátky k levému okraji, a silnice je kreslená šestnáctipixelovou
stopou, která se s obrazovkou nezmenšuje (`vector-effect`). Dvacet pixelů, se
kterými se mapa spokojila do 13. září, by ji nechalo ležet na kartách; z 36 px
je šestnáct silnice a po deseti zbývá volných nad ní a pod ní. Okruh 15 to
hlídá se čtyřmi pixely rezervy navíc, takže se mezera nedá vrátit na dvacet,
aniž by test spadl; samo "nepřekrývá se" by prošlo.

**Co se rozvržením nemění:** číselná klávesnice zůstává jediným vstupem závodu,
dílna nedostala nic, co by se hýbalo nebo odpočítávalo, klepnutí na místo jde
rovnou na trať a zamčené místo zůstává `div`, ne tlačítko. A nic se nesmí
schovat pod okraj: když se něco nevejde, roluje se.

**Písmo roste s tím, jak malé je dítě.** Je to jedno měřítko `--tx` na `<html>`,
kterým se násobí každá velikost písma v dětské části: `render()` hned za
`applyLang()` zapíše `data-grade`, a to jen tehdy, když obrazovka patří dítěti
a nějaký profil existuje; v rodičovské sekci (`PARENT_VIEWS`) i před založením
prvního hráče je prázdné a `--tx` zůstane 1. Hodnoty jsou **1,25 / 1,12 / 1,04 /
1,0** pro první až čtvrtý ročník (rozhodnutí R5 v `docs/PLAN.md`), stojí na
jednom místě v `src/styles.css` hned pod `--appw` a jsou to odhady k ověření na
dítěti; ladí se tam, ne v kódu. Na `<html>` proto, že spodní listy `.sheet` visí
na `body` a z `#app` by měřítko nezdědily.

Hodnoty stojí na dvou místech, ne na jednom: `src/styles.css` je to místo, kde
se ladí, a `TX_BY_GRADE` v `app.js` je jeho opis, protože mapa musí znát výšku
karty dřív, než se karta nakreslí, a vlastnost z CSS se bez rozvržení přečíst
nedá. `style.test.js` spadne, jakmile se kopie rozejdou. `html[data-grade="5"]`
je v obou předem, ať krok G nespustí pátý ročník s tichým pádem měřítka na 1.

Spolu s měřítkem se zvedly základy, které byly pod hranicí čitelnosti:
**žádný dětský text nezačíná pod 12,5 px**, což je prvňákovi zhruba 15,6 px.
Název místa na mapě smí mít dva řádky místo výpustky, protože při 1,25 se
"Počítání dílků" na jeden nevejde; dlouhé jediné slovo ("Zaokrouhlování",
"Kettenrechnen") se zalomí, `overflow-wrap:break-word`, a výpustka zůstává pro
přetečení druhého řádku. Barva `--ink-faint` (kontrast 2,6 : 1) se na dětský
text nepoužívá, zůstává jen na dekoraci; tři místa, která v ní stála
(`.place .tokc`, `.tokn`, `.counter-empty`), jsou dnes v `--ink-soft`.
Rodičovská sekce, heatmapa a `.tiny` s `.legend` se nemění, čte je dospělý;
výběr hráče je v `PARENT_VIEWS`, takže i tam je měřítko 1. Hlídá to
`tests/style.test.js`, viz oddíl 8, a hlídá to obráceně, než se zdá: projde
všechny velikosti písma v souboru a chce, aby každá buď násobila `--tx`, nebo
stála na krátkém seznamu výjimek, což jsou rodičovské obrazovky a znaky, které
nejsou text (ikony, emoji, fajfka a guma na klávesnici). Seznam vypsaných
dětských selektorů by novou velikost nikdy neuviděl, a taky neviděl.

**Klávesa roste s číslicí na ní, ale nikdy přes okraj.** Podlaha je
`calc(50px * var(--tx))` na výšku, `calc(44px * var(--tx))` na displeji nižším
než 660 px, kde by prvňákova klávesnice jinak vytlačila otázku, a
`calc(38px * var(--tx))` na šířku, kde má klávesnice jen půlku obrazovky.
Řádky mřížky jsou `1fr`, takže podlaha rozhoduje jen o tom, jak malá klávesa
smí být. A `.qzone`, tedy ta část závodu, která ustupuje, se roluje: co se
nevejde, se nikdy neuřízne.

---

## 7f. Gumová kačenka a jejích pět vrstev

Postavené v kroku H, 13. a 14. září 2026. Je to první obsah hry, který není
učivo: kačenka je sedmý startovní závodník, je zdarma a **sama se nekupuje**.
Kupuje se to, co má na sobě.

**Proč vrstvy a ne hotové kačenky.** Kdyby byla každá kombinace vlastní
položkou, byl by katalog nekonečný a dítě by pořád kupovalo něco skoro
stejného. Takhle je v katalogu 65 dílů v pěti nezávislých vrstvách a poskládat
se z nich dá 392 700 kačenek, přičemž **každý koupený díl je vidět hned a beze
zbytku**. Vrstvy jsou Tělo (10 barev), Vzor (10), Na hlavu (20), Oči (9)
a Výbava (16). Platí se výhradně součástkami z dílny, nikdy mincemi, viz
oddíl 4b.

**Vrstva je jedno místo na kačence, na kterém smí být právě jeden díl.**
V profilu je to `duck`, mapa vrstva → id dílu. Tělo je jediná vrstva, která
nesmí být prázdná, protože kačenka nemůže být bez barvy; zbylé čtyři mají
v garáži první dlaždici prázdnou a tou se díl zase sundá. **Žádná pravidla
vylučování nejsou**: přes brýle jde nasadit skafandr a je to legrační, a
legrační je v pořádku. Zakazovat kombinace by znamenalo nabízet něco, co se pak
tiše nestane, což je přímo proti principu „co hra neumí, to nenabízí“ z oddílu 3.
Do které vrstvy díl patří, se pozná **z jeho id** (`db`, `dp`, `dh`, `de`, `dg`),
ne z ručně vyplněného pole, takže se žádná položka nedá zapsat pod špatnou
vrstvu. A díl, který je nasazený ve vrstvě, kam nepatří, nebo id, které tahle
verze nezná, nechá vrstvu holou místo aby rozbil kresbu: profil oblečený novější
verzí se musí dát otevřít.

**Kotvy, a proč se počítají při každém kreslení.** `DUCK` je šest bodů, tedy
tělo, hlava, oko, křídlo, zobák a ocásek, plus výška hladiny. Klobouk patří na
hlavu, brýle na oko, kruh kolem těla. Kdyby si každý z pětašedesáti dílů nesl
vlastní kopii toho, kde hlava je, byl by den, kdy se hlava pohne, dnem, kdy
z ní všech dvacet klobouků sjede. Proto se souřadnice **nikdy nepíšou do dílu**
a `duckFit()` je spočítá znovu **při každém kreslení**, ne jednou při načtení.
Rozdíl je vidět až v testu: ten `DUCK.HEAD` posune a chce, aby se všech dvacet
klobouků posunulo s ní. Kdyby se kotvy spočítaly jednou předem, neměla by ta
kontrola jak proběhnout, protože posunutá hlava by se do kresby vůbec nedostala
a díl s natvrdo napsanou souřadnicí by od poslušného nešel odlišit. `duckFit()` k tomu dává
pomocníky, kterými je psaná většina katalogu: `at(úhel)` bod na hlavě,
`band(y1, y2)` pás mezi dvěma výškami s boky uříznutými hlavou, `dome(y)`
všechno nad výškou, `neck` místo, kde hlava sedí na těle, a **`brim`**, tedy
čára, kde klobouk končí. Pod `brim` je oko, takže klobouk, který na `brim`
dosáhne, zakryl obličej; každý klobouk proto končí tam nebo výš a všechno
z vrstev Oči a Výbava zůstává pod ní.

**Ořez vzoru staženým `clipPath`.** Vzor se kreslí přes tělo i hlavu naráz,
takže by bez ořezu puntíky vylétly do vzduchu vedle kačenky. Ořezová cesta je
elipsa těla a kruh hlavy, ale **stažené o 1,5 dovnitř**, ne jejich přesný
okraj. Důvod je ten, že světlá značka ležící přesně na okraji sebere obrys
kačenky, a klasická žlutá kačenka žádný vlastní obrys nemá, jen svou barvu
proti bílé dlaždici; jedna hvězdička na kraji by jí ukousla kus zad. Pozice
značek jsou vždycky pevný seznam, nikdy losované: dvě stejně oblečené kačenky
musí vypadat stejně dnes i zítra.

**Kontrola kontrastu `partInk()` a proč vznikla.** Černá pneumatika na uhlové
kačence byla jedna tmavá skvrna s obličejem někde uvnitř a zlaté kulaté
obroučky na klasické žluté nebyly vidět vůbec. Dílů je 65 a těl deset, takže
dvojic je 550 a na obrázku se prostě přehlédnou; tohle je přesně ten druh
chyby, kterou musí hlídat stroj. `partInk(kresba, rim, barvy těla)` se podívá,
jestli má díl aspoň jednu barvu, která stojí **od všech barev těla dál než
25 ΔE** v Lab. Když ano, vrátí kresbu beze změny. Když ne, podloží ji **jen
obrysem**, tedy týmiž tvary o 2,4 širším tahem, bez výplně, v kontrastní barvě,
kterou si nese tělo (světlé tělo dostane tmavou linku, tmavé světlou). Obrys,
ne druhá vyplněná kopie: skafandr je sklo, přes které musí být vidět, a
vyplněný duch pod ním by na kačence udělal šedý disk místo obličeje. Hlídá to
okruh 3f v `items.test.js` přes všech 550 dvojic, počítá si vzdálenost sám a
kromě kontrastu kontroluje i to, že obrys nerozbil tagy a že ho hotová kresba
kačenky opravdu volá, tedy že `partInk` nevisí ve vzduchu vedle kódu.
Vedle toho má několik těl vypsanou výjimku na jednom poli, protože je to věc
jednoho těla, ne pravidlo do kresby: `edge` obrys pro sněhovou, která by na
bílé dlaždici zmizela celá, `eyeRing` světlá skvrna, na které sedí oko uhlové,
protože tmavé oko by se do tmavého těla propadlo, `belly` silnější bříško
tamtéž, `beakEdge` linka kolem zobáku ohnivé, do které by se oranžový zobák
jinak ztratil, a `beak` růžový zobák jediné kačenky z fotky.

**Z-order, a každé místo v něm je kvůli něčemu, čeho by si dítě všimlo.**
Pořadí je: zadní půlka výbavy, ocásek, tělo, hlava, **vzor**, bříško, křídlo,
zobák, oko, oční díl, hlavový díl, přední půlka výbavy. Vzor je pod bříškem,
křídlem a zobákem, takže žádný puntík nikdy neskončí na obličeji. Oční díl je
pod kloboukem, takže kšilt překryje sklo přesně tak, jako to dělá doopravdy.
A výbava je **jediná vrstva rozdělená na dvě půlky**, `back` a `front`: plovací
kruh musí kačenku obepnout, ne stát před ní, batoh a dýchací nádrž visí za
ocáskem a surf je celý vzadu, protože kačenka na něm sedí. Zadních půlek má
pět dílů z šestnácti. Pořadí není jen komentář, čte ho zpátky z hotového SVG
okruh 3e v `items.test.js`.

**Autorská práva, a tohle je nejdůležitější odstavec celé kresby.** Je to
rozvedení nedotknutelného principu z oddílu 3, tedy zákazu licencovaných
postaviček, na díly a na zvířata. Gumová kačenka sama je generický předmět,
vyráběný od devatenáctého století desítkami firem, a je v pořádku. **Žádný
jednotlivý díl ale nesmí být převzatá postava, maskot ani značková kačenka.**
Každý díl je věc, ne bytost: klobouk, brýle, kruh, šála. Nejcitlivější jsou tři,
u kterých se sklouzne nejsnáz, a proto stojí vypsané: maska přes oči
(`de_maska`) je karnevalová maska se stužkou, ne domino v barvách konkrétního
hrdiny, a plášť do katalogu nepatří vůbec; ke kulatým obroučkám (`de_dioptr`)
nikdy nepřibude jizva; klapka na oko (`de_klapka`) je klapka, ne ničí znak.
Totéž platí pro zvířata: kočka, liška, panda ani tučňák nejsou ničí a kreslí se
podle skutečného zvířete, a drak, jednorožec a axolotl jsou generické bytosti,
ne konkrétní filmová podoba. **Kontrolní otázka je jediná a platí pro každý díl
i pro každé zvíře: když se u kresby dá říct jméno postavy, je špatně.** Ptát se
na ni je potřeba dřív, než se nový díl nakreslí, ne až potom.

**Žádný díl nemá jiný atribut než kresbu a cenu.** Vzhled nemá na jízdu vliv,
soupeřem zůstává vlastní nejlepší jízda a celý katalog i s cenami je vidět od
první chvíle: nic se nelosuje, nic se nedá ztratit ani zdražit. Zdarma je jedině
klasické žluté tělo, zbylých 64 dílů stojí 6 až 30 součástek; nejlevnější je
levnější než polovina jedné zakázky, takže dítě, které dokončí jednu jedinou
zakázku, si má vždycky co koupit.

---

## 8. Testy

V `tests/` je jich šest, spouštějí se přes node, potřebují jen `jsdom`.
Podrobnosti v `tests/README.md`. Testy načítají sestavený `index.html`, kromě
`items.test.js`, který skládá zdroje přímo, a `style.test.js`, který zdroje čte
jako text a jsdom nepotřebuje vůbec; před během je nutné pustit `build.py`.

Po každé změně mechaniky pusť `flow.test.js` a `items.test.js`, po každé změně
textů `i18n.test.js` a `names.test.js`, po každém doteku datového modelu
`migration.test.js`, po každém doteku `src/styles.css` nebo kostry dokumentu
`style.test.js`. Žádný test nevrací nenulový kód, kontroluje se výskyt `!!`
ve výstupu:

```bash
python3 build.py
for f in tests/*.test.js; do echo "$f"; node "$f" | grep '  !!  '; done
```

`items.test.js` pokrývá pětačtyřicet okruhů: správnost všech generovaných příkladů,
shodu ciferníku s odpovědí včetně úhlů obou ručiček, složení závodu na každé
trati, platnost SVG, konzistenci kurikul, závod podle kapitoly v obou režimech,
stupně přechodu přes desítku, pravidla výběru kapitoly, kbelíky hodin, kroky
do tisíce, u kterých ověřuje i to, že každý kbelík dělá to, co slibuje, pořadí
operací, u kterého si výsledek počítá sám a s pravidlem o přednosti, ne přes
`eval`, protože právě to pravidlo se testuje, a hlídá u něj i to, že dělení
nikdy nezbývá, že se nikde nepočítá pod nulu a že by se většina zadání čtená
zleva doprava vyhodnotila jinak, kulatá čísla, u kterých hlídá, že se násobí
a dělí jen deseti, stem nebo kulatou desítkou, že součin nikdy nepřeleze tisíc,
že dělení vždycky vyjde beze zbytku a že se celý tisíc opravdu objevuje, jinak
by byla čtvrtá číslice zbytečná, převody jednotek, u kterých ze zadání pozná
dvojici jednotek i směr a hlídá, že odpověď je celé číslo do tisíce, že do
tisíce zůstane i číslo v zadání, že se každý kbelík převádí oběma směry
a že žádná jeho dvojice nezůstane nepoužitá, a dílnu,
tedy že hltavé drobné jsou opravdu nejmenší, že úloha uzná své vlastní řešení
a že se úloha dílny nemůže dostat do závodu ani zkreslit průměrný čas, a u
počítání dílků, že je jich na obrázku přesně tolik, kolik je odpověď. K tomu
sbírku, tedy že se místo rozsvítí až na úrovni 4, že po poklesu úrovně nezhasne,
že ho rozsvítí i klíč dílny, že je sbírka trati velká jako trať a že `seedStars()`
dopočítá starší profil; kruh v dílně, tedy počet zakrytých výsečí; a světy, tedy
že každý svět má pro každou trať vlastní prostředí, že žádná paleta nezůstala
nepoužitá, že přepnutí světa nehne učivem, odemčením ani rekordy a že nabídku
jezdců jen řadí; **barevný odstup palet**, tedy že si žádné dvě palety jednoho
světa nejsou blízko, měřeno v Lab přes oba konce přechodu, práh 22 ΔE a zapsaný
dluh starších dvojic, který smí jen klesat (okruh 13c, zavedený 13. září, viz
oddíl 9); a tvary cest, tedy že okruh zůstal uzavřený, že ostatní světy
vedou z jedné strany na druhou, že cesta nevyjede ze scény a že se patnáct
tratí v jednom světě od sebe pozná; a ročníky, tedy že prvňák nevidí násobilku,
že dřívější ročník nikdy nezmizí z dosahu, že `yearOf()` sedí pro každou trať
a každý ročník včetně `thru`, tedy že třeťák má malou násobilku, stovku
i hodiny v hlavním bloku a za dveřmi jen obory prvního ročníku a most, a že
šampionát, slabá místa i trať podle školy jsou vždycky letošní, že se skládá
jen ročník s vlastní tratí, že **hlavní blok mapy má pro každý ročník aspoň
jednu otevřenou trať**, že ukázka nabízí právě jeden rok dopředu a že šampionát
ani rodičovská sekce nemluví o tom, co na mapě není. Od kroku C k tomu přibylo
rozvržení mapy: obdélníky míst se pro dva, tři i čtyři sloupce při osmi až
čtyřiadvaceti místech nesmí protnout ani vyjet přes sto procent šířky, **pořadí
musí jít po řádcích zleva doprava**, vratná čára na konci řádku musí být
vodorovná, dost dlouhá a celá i se svou šestnáctipixelovou stopou se musí vejít
do pásu mezi řádky, dva sloupce musí vodorovně vrátit zamrzlý seznam poloh
(od 13. září nový, viz oddíl 9) a sedm šířek okna musí dát očekávaný počet
sloupců a orientaci. **Výšku karty si ta
kontrola počítá sama ze `src/styles.css`**, ne z `placeBox()`, jinak by měřila
definici proti sobě samé a nechytila nic; jede pro měřítko 1 i 1,25, pro devět
šířek okna, pro nejdelší skutečná jména tratí ve všech třech jazycích a pro
všechny čtyři tvary karty, a porovnává i to, že `TX_BY_GRADE` v `app.js` říká
totéž co `--tx` v CSS.

**Krok H přidal šest okruhů a všechny čtou hotovou kresbu zpátky**, protože
samotnou kresbu žádný test neuvidí a prohlédnout ji musí člověk. Okruh 3a jde
přes osmadvacet zvířat: id, tvar, obě barvy, cenu a české jméno má zamrazené
v tabulce, protože na id visí zkušenosti a vlastnictví a na ceně to, na co dítě
šetří, a každé zvíře kreslí ve všech třech stupních, hlídá rám i s tahy, polohu
očí a úsměvu podle toho, co si tvar sám řekl, hvězdu třetího stupně a to, že se
nikde neotáčí a nepoužívá relativní příkaz v cestě, jinak by se body z kresby
nedaly přečíst zpátky. Okruh 3b je holá kačenka, tedy že je zdarma, startovní,
ani stroj ani zvíře, že žádná kotva nevyjede z rámu a že nad hlavou zbývá místo
na klobouk. Okruh 3c je deset těl, tedy že se každá barva opravdu vykreslí, že
si těla nejsou navzájem barevně blízko ani nesplývají s bílou dlaždicí garáže
(zase v Lab, práh 25 ΔE), a že obléknutí jiné barvy nesahá na seznam koupených
dílů.
Okruhy 3d a 3e jsou zbylé čtyři vrstvy, tedy všech 55 vzorů, klobouků, očních
dílů a kusů výbavy vykreslených na kačenku a přečtených zpátky: žádný díl
nesmí vyjet z rámu, žádný klobouk sedět na oku (měřeném jako kolečko) ani na
zobáku (měřeném jako klín ze tří obdélníků, protože obdélník, do kterého se
vejdou, zakazoval i to, co leží vedle nich), každý klobouk se musí dotýkat
hlavy, vzor musí ležet pod okem a zobákem a uvnitř staženého ořezu, skafandr
musí být jediný díl, který něco zakrývá, a musí to zakrývat přes sklo, všechno
z vrstvy Oči musí sedět na oku a zůstat pod `brim`, nic z výbavy nesmí nad
`brim` vylézt ani viset ve vzduchu mimo tělo, a **hotové SVG se čte v pořadí**,
takže zadní půlka výbavy musí stát před tělem a přední za vším ostatním.
K tomu kontrola, kterou žádná jiná nenahradí: `DUCK.HEAD` se v testu posune
a všech dvacet klobouků se musí pohnout s ní. Okruh 3f je kontrast dílu proti
tělu přes všech 550 dvojic, viz oddíl 7f.

`flow.test.js` projede celou hru včetně volby učebnice a závodu s hodinami
a na konci ověří, že rodičovská sekce má blok pro každou rodinu, kterou má
profil v krabičce, a že souhrn nahoře není jen z násobilky. Projde taky celou
zakázku v dílně a hlídá, že se kruh odkrývá po jednom dílu za vyřešenou úlohu,
že opravená úloha odkrývá taky a že je na konci kruh celý i po chybě.
`items.test.js` navíc hlídá, že obory a mosty dohromady pokryjí celý obor do
dvaceti a nepřekrývají se, že v oboru není jediný přechod přes desítku a že
prvňákův první závod nevyleze nad tři.
`flow.test.js` navíc projde celý ročníkový tok: založí prvňáka, ověří, že má
krátkou mapu a žádné dveře zpátky, rozbalí ukázku, spustí z ní trať
a zkontroluje, že se ročník nezměnil a že přepnutí hráče ukázku složí. Od kroku
B0 měří i předěl ročníků: složenou i rozbalenou mapu třeťáka, že má malou
násobilku v hlavním bloku a otevřenou, že za dveřmi je sedm tratí, tedy obory
prvního ročníku a most, že druhák je jeden blok bez dveří i bez milníku, že
milník nese číslo třídy i se složenou mapou, že podtitulek dveří říká "1. a 2.
třída", že rozbalení nezapíše do profilu ani písmeno, že přepnutí hráče mapu
zase složí a že čtvrťák nemá dveře ani milník a vidí všechno.
`items.test.js` postaví od kroku A pět set závodů na každé z tratí `a3`, `a5`,
`a7` a `a10` a hlídá, že v nich není jediná dvojice sousedních otázek se stejným
klíčem ani stejnou tváří; jeden závod na trať nic nedokazoval, protože dvojice
vznikaly zhruba v jednom závodě z dvaceti, a kontrola proto bývala nestabilní.
`flow.test.js` má od kroku H 231 kontrol, po kroku D4 jich bylo 196, po kroku
D3 191, po kroku D2 188, po kroku
D1 186, po kroku C 184, po kroku B0b 175, po kroku B0 170 a po kroku A 153.
Pětatřicet přibylo v kroku H a nejsou to kontroly učiva: že profil dostane
startovní sedmičku a kačenka je mezi ní zdarma, že ji nejde koupit za mince ani
jí narůst stupeň, že se dá nasadit a stojí v nabídce před startem, že garáž
ukazuje osmadvacet zvířat a má sekci kačenky, že se díl koupí za součástky a ne
za mince a že ho kačenka hned nese, že se dá obléknout všech pět vrstev naráz,
že jsou police řazené od nejlevnějšího a utrata míří na tu, na kterou dítě
opravdu má, že štítek pod celkovým číslem přepnou teprve nátěry a díly dohromady
ve všech čtyřech kombinacích, a že se s tím přepnutím do dílny nedostaly stopky
ani body za rychlost.
Tři přibyly v D3: převody stojí na mapě hned za tisícovkou, kapitoly 18 a 29 už
jdou vybrat a kapitola 17, která jednotky jen pojmenovává, zamčená zůstala.
Dvě přibyly v D2:
kulatá čísla stojí na mapě hned za tratí za násobilkou a kapitola 28 už jde
vybrat. Dvě přibyly v D1: pořadí operací
stojí na mapě mezi řetězcem a tratí za násobilkou a kapitoly 13 a 30 už jdou
vybrat. Devět přibylo v kroku C: mapa říká, kolik má sloupců,
rozvržení stojí na `<html>`, tlačítko Hotovo v dílně má svůj obal, tři kontroly
po vědomém přepnutí okna na 1024 × 768 a tři na písmo podle ročníku, tedy že
prvňák má `data-grade="1"`, rodičovská sekce prázdné a čtvrťák `"4"`. Navíc
předěl ročníků popsaný výše, a už od kroku A vynulování postupu, po kterém
prvňák zůstane prvňákem a nastavení rodiče se nehne, zatímco krabička, mince
a medaile jsou pryč, a dva různé chybné počty dílků, které musí dát dva štítky,
ne jeden. Do kroku A jich dobíhalo 148, protože `flow.test.js` i `names.test.js`
padaly na kroku, který dnešní rozhraní už nemá (tlačítko "mapa" na mapě
a zakládání hráče bez volby třídy); poslední kontroly obou souborů proto od té
změny nikdo neviděl.
`migration.test.js` nabootuje zamrazené profily ze starších verzí a hlídá
pravidlo z oddílu 3, tedy že se nic neztratilo. Fixtury jsou v
`tests/fixtures/legacy-profiles.json` a jen se přidávají, nikdy neupravují.
`style.test.js` je od kroku C šestý soubor a jediný bez jsdomu: čte
`src/styles.css`, `src/index.template.html` a manifest jako text a hlídá to,
co se jinak pozná jen na obrázku. Tedy `vh` před `dvh`, strop výšky spodního
listu, `orientation` `any`, mřížku závodu na šířku i s jejími oblastmi, že
řádky klávesnice visí na `.keypad-pad` a ne na `.keypad`, že podlaha klávesy
roste s ročníkem i na šířku, že se otázka při nedostatku místa roluje, že se
nevrátily mrtvé selektory `.runner` a `.ghost`, a celé měřítko písma: řádky
s `--tx` na jednom místě pro ročníky 1 až 5, shodu s tabulkou `TX_BY_GRADE`
v `app.js`, žádný základ pod 12,5 px a žádný dětský text v `--ink-faint`.
**Velikosti i barvu prochází všechny**, ne podle seznamu dětských selektorů:
každý výskyt buď násobí `--tx`, nebo stojí na krátkém seznamu výjimek, a
nepoužitá výjimka je taky chyba. Vypsaný seznam dětských selektorů nové
pravidlo nikdy neuvidí, a taky neuviděl: `.item .lvl` zůstalo na 10 px
a `.rail .lap` na 11, obojí pod hranicí, kterou měl ten test hlídat.

---

## 9. Chyby, které už byly opravené

Nesmí se vrátit. Každá z nich vznikla při vývoji a byla nahlášená uživatelem.

Auto se posouvalo i za chybnou odpověď. Poloha se počítala z bodů místo ze
správných odpovědí.

Hra pokračovala i po projetí cílem. Poloha se počítala z bodů, takže rychlé dítě
nasbíralo cílovou vzdálenost dřív, než mu došly otázky.

Po chybné poslední odpovědi auto skočilo do cíle. Bylo to řešené doháněním na
konci závodu, což vypadalo jako odměna za chybu. Odstraněno, chyba místo toho
závod prodlouží.

Jména závodníků se zobrazovala jako `undefined`. Při stěhování textů do slovníku
se opravil jen jeden ze dvou výskytů.

Přepínač rychlosti v rodičovské sekci nefungoval, protože používal atribut
`data-k`, který zabírá číselná klávesnice. Přejmenováno na `data-sp`.

Heatmapa přetékala přes okraj obrazovky. Vyřešeno `minmax(0, 1fr)` a obalem
s vodorovným posuvem.

Bílý text na světlém podkladu na úvodní obrazovce. Světlý oblouk přes spodek
fialové hlavičky se překrýval s podtitulkem, nahrazeno zaoblením hlavičky.

Celá hodina se musela ťukat i s nulami. Ciferník ukazoval sedmou hodinu
a hra chtěla 700, protože odpověď se porovnávala jako holé číslo. Dítě, které
se právě naučilo číst celé hodiny, nemá důvod přemýšlet o dvou nulách. Teď se
jedna nebo dvě číslice čtou jako hodina.

V dílně byl nad mincemi prázdný pás přes půl obrazovky. Řada teček měla
`flex:1`, což je správně v závodní liště, protože ta je řádek a růst tam znamená
zabrat šířku mezi křížkem a počtem otázek. Obrazovka dílny je ale sloupec, takže
tentýž růst spolkl celou výšku a otázku s pultem stlačil dolů k mincím. Růst
teď patří liště, `.gamebar .pips`, ne samotným tečkám.

Tlačítko "utrať součástky" po dokončené zakázce otevřelo garáž nahoře u strojů
a nátěry byly až úplně dole, takže je dítě muselo hledat rolováním. Obrazovka
teď umí `view.focus` a otevře se rovnou u nátěrů; výběr stroje nebo zvířete
focus zruší, aby to zpátky dolů neskákalo.

Prvňák dostával hned v prvním týdnu 20 - 10. Celý první ročník byl jedna trať
a její první stupeň bylo "všechno do deseti bez přechodu", do čehož spadne
i 10 + 10. Opraveno rozdělením na šest číselných oborů podle učebnice, viz
oddíl 4. **Nová rodina pro nejmladší děti se musí měřit tím, co je v učebnici
na prvních stránkách, ne tím, co se vejde do jednoho pravidla.**

Prvňák dostával v dílně placení mincemi do padesáti. Zakázky neměly ročník,
takže dílna ukazovala všem všechno. Opraveno polem `grade` v `JOBS`.

Všechny čtyři náhledy v nabídce světů vypadaly stejně. Náhled okruhu měl id
barevného přechodu jen podle trati, a čtyři náhledy téže trati v jednom
dokumentu tak sdílely první definici. Id teď nese i prostředí.

Obloha vycházela hnědá, moře u útesu rudé a louka svítivě fialová. Palety se
generovaly z jednoho odstínu pro oba konce přechodu. Horní konec u oblohy
a hlubiny teď zůstává v modrých a charakter místa nese spodní, a na kámen
a mlhu je tlumená sytost. **Bylo to vidět až na vyrenderovaném obrázku, ne
v kódu a ne v testech.**

Čtvrtinové značky na trati vypadaly na úzké cestičce jako odhozené papírky.
Byly dělané přes šestatřicet pixelů širokou silnici okruhu; teď se zmenšují
podle šířky cesty.

V nejmenším oboru padaly dvě stejné otázky za sebou. Ochrana proti tomu koukala
jen na souseda, což při čtyřech příkladech na dvacet otázek nestačí; teď hledá
dál ve frontě, a od kroku A **oběma směry**. Hledání jen doprava nenašlo partnera
pro dvojici na konci fronty: v osmi tisících závodech na `a3` až `a10` zůstalo
698 sousedících dvojic, po doplnění obou směrů a podmínky na oba konce prohození
nula.

Vynulování postupu bralo rodiči nastavení. `newProfile()` se volalo bez ročníku,
takže prvňák skončil ve čtvrtém ročníku a viděl celou mapu; padl i jazyk dítěte,
svět, učebnice, kapitola, délka závodu a rychlost. Teď se postup maže a
nastavení zůstávají.

Výsledek zakázky slepil dvě různé chybné úlohy do jednoho štítku. Chyby se
rozlišovaly podle částky, kterou úloha s počítáním dílků nemá; teď podle
odpovědi, a částka je záloha pro úlohy s penězi.

Volba kapitoly bez generátoru nedělala nic. Šla vybrat, poznámka "zatím neumíme"
se v nabídce usekla a rodič si nastavil kapitolu, se kterou se nestalo nic.
Mezikrok s tichým návratem na dřívější kapitolu byl taky špatně, protože
nastavení pořád dělalo něco jiného, než říkalo. Teď je kapitola bez generátoru
nevybratelná, viz princip v oddílu 3.

Mapa třeťáka byla pokračování prvních dvou tříd bez předělu. Syn si nastavil
třetí třídu a dostal jednadvacet míst v jedné řadě, ve které nebylo poznat,
kde končí loňsko a kde začíná "jeho" učivo. Minulé roky se teď skládají za
dveře a mezi ně a letošek se postavil milník s číslem třídy; nic z toho se
neztratilo, jen to na mapě není v cestě, viz oddíl 7d.

Skládání pak třeťákovi schovalo malou násobilku. Hned při dalším hraní se
ukázalo, že krok B0 sice udělal předěl, ale postavil ho na roku, ve kterém se
učivo **zavádí**, takže za dveřmi skončila násobilka, stovka i hodiny, tedy
přesně to, čím třetí třída začíná (kapitoly 1 až 4 sedmého dílu) a kvůli čemu
hra vznikla. Čerstvý třeťák navíc neměl na mapě jedinou otevřenou trať. Učivo
má proto od 13. září dvě čísla, rok zavedení a poslední rok opakování, a ptá
se na ně `yearOf()`; za dveřmi zůstaly jen obory prvního ročníku a most.
Druhák tím dveře ztratil úplně, protože celý první ročník opakuje. Napříště to
hlídá kontrola, že hlavní blok mapy má pro každý ročník aspoň jednu otevřenou
trať.

**Karty na mapě si sedaly jedna na druhou.** Když písmo dostalo ročníkové
měřítko a název místa směl mít dva řádky, zůstala výška karty v kódu pevných
"92 px textu pod náhledem" změřených na jednom telefonu. Karta tím byla
o 5 až 30 px vyšší než rozestup, ve všech čtyřech šířkách a ve všech ročnících,
nejhorší u prvňáka, kterému je to nejvíc vidět. Výška se teď sčítá z hodnot
v CSS, a to z nejhoršího případu a z nejvyššího ze čtyř tvarů karty, takže
je rozestup v celé mapě stejný; podrobnosti v oddílu 7e. Poučení je ale
obecnější než ta jedna funkce, a proto to stojí tady: **rozměr, který v kódu
opisuje CSS, se musí počítat, ne odhadnout, a musí to hlídat test, který si
tentýž rozměr spočítá nezávisle.** Původní kontrola v `items.test.js` měřila
obdélníky toutéž hodnotou, ze které se odvozuje rozestup, takže "nic se
nepřekrývá" platilo z definice a devět měsíců by to tak vydrželo. Test si dnes
čte `src/styles.css` sám, pro obě měřítka, pro dva až čtyři sloupce a pro
nejdelší skutečná jména tratí ve všech třech jazycích. Stejný důvod má i
`TX_BY_GRADE` v `app.js`: kopie hodnot z CSS je v pořádku jen s testem, který
spadne, jakmile se obě strany rozejdou.

**Mapa se četla hadovitě a osmiletý v ní nepoznal, kudy dál.** Krok C rozložil
mapu od tří sloupců do řádků a řadil je boustrofedonem, tedy první řádek zleva
doprava, druhý zprava doleva, třetí zase zleva; dva sloupce na telefonu byly
tentýž had, jen užší, protože se místa střídala po stranách. Uživatel to zkusil
se synem ve třetí třídě a dítě se ztratilo: mapa začíná dveřmi "Z minulých let",
od nich vede cesta přes celé okno doprava na první klikatelné místo a pak se
čekalo, že dítě pojede doleva, dolů a zase doprava. Osmiletý to sám nepoznal
a musel mu to vysvětlit rodič. **Místa se od 13. září řadí tak, jak se v Evropě
čte, tedy zleva doprava a shora dolů, v každé šířce**, každý řádek začíná vlevo
a cesta se na jeho konci vrací prázdným pásem mezi řádky až k levému okraji.
Návrat je vidět jako součást cesty, vede mezerou mezi řádky a nikdy ne přes
karty; kvůli tomu se mezera zvětšila z 20 na 36 px, viz oddíl 7e. Poučení je
starší než tahle mapa: **pořadí, ve kterém se něco čte, není věc vkusu, a
u dítěte, které se teprve učí číst souvislý text, se nesmí odhadovat.** Hlídá
to okruh 15 v `items.test.js`, který chce, aby v každém řádku rostlo `left`
s pořadím, a k tomu i to, že vratná čára je vodorovná a že se celá stopa
silnice vejde mezi dva řádky se čtyřmi pixely rezervy.

**Tři palety trati `chain` byly barevně totéž co jejich sousedi a vizuální
kontrola u kroku B to neukázala.** `sk_haze` byla 5,7 ΔE od `sk_hilltop`
a 9,4 od `sk_kite`, tedy tatáž bledě zelená obloha třikrát; `dp_shoal` splývala
s `dp_lagoon`, `dp_garden` i `dp_grass` (15 až 17), tedy čtyři stejná
zelenomodrá dna; `marsh` byla 15,1 od `school`, dvě mátové louky vedle sebe
v jednom okruhu. Proč to prošlo: palety se kontrolovaly na obrázku z `convert`,
jenže **`convert` `linearGradient` nekreslí**, vezme první zarážku a vyplní jí
celou plochu, takže dvě palety lišící se spodním koncem přechodu daly tentýž
obrázek a rozdíl, který dítě na mapě vidí, na kontrolním obrázku nebyl vůbec.
Od 13. září se paleta posuzuje dvěma způsoby naráz: na obrázku složeném podle
postupu z oddílu 2 (podkladový obdélník se z SVG vyřízne a podloží přechodem
z ImageMagicku) a číselně, okruhem 13c v `items.test.js`. Poučení: **kontrola
na obrázku platí jen tehdy, když se na obrázku opravdu kreslí to, co se
posuzuje**, a barva je věc, kterou v kódu nepozná nikdo: sousední řádek má
tentýž tvar a jiná čísla. Zbytek dluhu je změřený a zapsaný, nejblíž si jsou
`sk_hilltop` a `sk_kite` s 5,3 ΔE.

**Po obnovení zálohy se kačenka tvářila jako zamčená.** Startovní sestavu
dopisoval `load()` přímo v cyklu přes profily, kdežto větev `import` si seznam
závodníků ze zálohy prostě přepsala do profilu. Záloha udělaná dřív, než kačenka
existovala, ten seznam nese bez ní, takže dítě, které si obnovilo zálohu,
najednou vidělo v garáži svého závodníka s cenovkou. Doplňování startovní
sestavy je od kroku H funkce `seedStarters(p)` a volá se na obou místech, stejně
jako všechny ostatní seedy. Poučení je pravidlo, které v oddílu 6 stálo už
předtím a jen se na ně zapomnělo: **migrace, která se týká profilu jako celku,
patří do `load()` i do větve `import`**, protože obnovená záloha je cizí profil,
ne ten, který zrovna běží.

**Tlačítko „utrať součástky“ posílalo dítě do sekce, na kterou nemá.** Mířilo
do první police, kde ještě něco zbývalo, a tou byly nátěry: nejlevnější stojí
třicet součástek, kdežto nejlevnější kačenčí díl šest. Dítě s patnácti
součástkami po jedné zakázce tedy dostalo nabídku a za ní stěnu cen, na které
nedosáhne. Rozhoduje o tom od kroku H `spendTarget(p)`, tedy nejlevnější police,
ze které jde **dnešními součástkami opravdu zaplatit**, a když nejde zaplatit
z žádné, tlačítko se nenabídne vůbec. Je to princip „co hra neumí, to nenabízí“
z oddílu 3 přenesený na odkaz: cesta, která vede ke zdi, je slib, který hra
nesplní.

**Tmavý díl na tmavém těle splýval a nikdo to neviděl.** Černá pneumatika na
uhlové kačence byla jedna tmavá skvrna s obličejem někde uvnitř a zlaté kulaté
obroučky na klasické žluté nebyly vidět vůbec. Nešlo o chybu v kódu, obě kresby
byly správně; chyba byla v tom, že se dvě správné barvy na dlaždici potkaly.
Dvojic díl a tělo je 550 a na obrázku se přehlédnou, takže se od kroku H každá
z nich měří v Lab a díl, který nemá ani jednu barvu dál než 25 ΔE od všech
barev těla, dostane od `partInk()` kontrastní obrys, viz oddíl 7f. Poučení je
totéž jako u palet trati `chain`, jen o kus dál: **splývání dvou barev není
vlastnost jedné z nich, ale jejich dvojice, a dvojic je vždycky řádově víc než
věcí.** Ruční prohlídka takové mřížky je neproveditelná, a proto to musí počítat
stroj; hlídá to okruh 3f v `items.test.js` a hlídá i to, že `partInk()` opravdu
volá hotová kresba kačenky, ne jen test vedle ní.

---

## 10. Kde to teď stojí

Repozitář žije na `https://github.com/daliborkania-info/math-fact-racer`, je
odeslaný a rodiče spolužáků si hru stahují. Hostuje ji GitHub Pages na
`https://daliborkania-info.github.io/math-fact-racer/`, zdroj je větev `main`
a složka root.

Hra je zároveň publikovaná jako artefakt na claude.ai, ten se aktualizuje
nahráním `dist/artifact.html`.

**Push z prostředí Cowork neprojde.** Shell běží v izolovaném sandboxu, který
nevidí SSH klíč ani agenta, jen připojenou složku. Commitovat jde, odeslat ne.
Uživatel pushuje sám z terminálu. Sandbox navíc někdy nechá v `.git` zámek,
který nejde smazat bez povolení mazání souborů; projeví se to hláškou
`cannot lock ref HEAD`. Řeší to smazání `.git/*.lock` a `.git/objects/tmp_obj_*`.

---

## 11. Učivo podle učebnice, hotová část

**Model je dvouvrstvý a je to nejdůležitější rozhodnutí téhle fáze.**
`docs/kurikulum/TEMATA.md` je katalog témat, tedy co hra umí nebo bude umět
vygenerovat: jeden generátor plus jeden vstupní prvek plus zařazení do závodu
nebo do dílny. Mapy jako `docs/kurikulum/nns-matysek-3.md` jsou uspořádané
seznamy kapitol jedné konkrétní řady, které na katalog odkazují. Další učebnice
znamená napsat další mapu, ne další generátory. Mapa nesmí zavést téma, které
v katalogu není, to je signál, že katalog potřebuje rozšířit.

**Zdroj map.** Matýskova matematika nakladatelství Nová škola. Druhý a třetí
ročník jsou ověřené ze skutečných stránek, první, čtvrtý a pátý jen z obsahů,
a témata, u kterých neznám formát odpovědi, jsou v mapách značená `?`.

**Jak se čtou učebnice.** Nejlepší zdroj je čtečka na `mediacreator.cz`, protože
u každé dvoustrany vypisuje názvy interaktivních cvičení jako text, takže je
z ní vidět typ úlohy, ne jen název kapitoly. Adresa má tvar
`mediacreator.cz/mc/index.php?opentitle=<titul>/<titul>.mc&pageord=1`. Veřejně
odkazované jsou ale jen tři tituly, `Matyskova_matematika_4dil_2019`, `5dil`
a `6dil`, všechny na stránce o aktualizovaném vydání 2018-2019 na
matyskova-matematika.cz. Oba weby nakladatele jsem projel přes sitemapy, 914
stránek, žádné další matematické tituly tam nejsou a jména titulů v adresách
jsou nesystematická, takže uhodnout je nejde. Čtečka `ucebnice.online` otevře
konkrétní sešit přes odkaz `qr.nns.cz`, celý katalog ale vyžaduje registraci
a třicetidenní zkušební přístup. Účet zakládat nebudu. Další učebnice tedy
chodí tak, že uživatel pošle odkaz, nebo se sám přihlásí v prohlížeči a já pak
katalog přečtu.

**Druhý typ zdroje je státní kurikulum.** Mapa nemusí pocházet z učebnice.
Revidované RVP ZV na `prohlednout.rvp.cz` samo o sobě na mapu nestačí, protože
matematika v něm má uzlové body jen v 5. a 9. ročníku a celý první stupeň je
v něm třináct očekávaných výstupů bez pořadí probírání. Použitelný je ale
předmětový modelový ŠVP "Matematika pro 1. stupeň ZŠ" na
`revize.rvp.cz/zv/jak-na-svp/modelove-svp-pro-zs`, který má samostatné oddíly
pro jednotlivé ročníky i sloupec s učivem, a použitelné jsou z RVP číselné
rozsahy za období, kterými jde sundat otazníky v mapách čtvrtého a pátého
ročníku. Celý záznam průzkumu z 13. září 2026 včetně názvů souborů a toho, co
je v nich, drží `docs/kurikulum/ZDROJE-RVP.md`; navázaný plán je v `PLAN.md`
jako krok G0 a rozhodnutí R8.

**Licence je u státního kurikula jiná než u učebnice.** Datová sada RVP ZV na
`opendata.npi.cz` má v podmínkách užití uvedeno, že neobsahuje autorská díla a
že databáze není chráněná, takže text RVP jde převzít i doslova. Výjimkou jsou
jednotlivé ilustrační materiály s uvedeným autorem, u kterých stojí BY-NC-SA;
ty se nepřebírají. Modelové ŠVP licenci neuvádějí, takže u nich platí stejné
opatrné pravidlo jako u učebnice, tedy jen struktura.

**Volba učebnice patří profilu**, ne aplikaci, protože sourozenci mohou mít
různé učebnice. Profil má `curriculum`, `chapter` a `chapterMode`. Výchozí je
`curriculum: null`, tedy adaptivní režim. Měkký režim serveruje zhruba sedmdesát
procent z aktuální kapitoly a zbytek z dřívějších kapitol podle Leitnerovy
krabičky, tvrdý bere jen aktuální kapitolu. Měkký je výchozí, protože jinak se
rozpadne rozložené opakování.

**Data jsou v `src/curricula.js`.** Tři kurikula pro první až třetí ročník,
95 kapitol, z toho 88 hratelných. Čtvrtý a pátý ročník v aplikaci nejsou,
protože by v nich bylo skoro všechno zamčené; mapy k nim existují v `docs/`.

**Pool je deklarativní.** Kapitola popisuje učivo jako `mult`, `div`, `as20`,
`as100`, `as1000`, `multBeyond`, `divBeyond`, `round`, `clock`, `chain`, `ops`,
`multTens`, `divTens`, `units`, `divrem` a `split`,
a `poolKeys()` to překládá na klíče příkladů. Vedle toho smí kapitola říct
`variant`, což není pool, ale **tvar otázky**: tytéž klíče položené jinak, dnes
`"missing"`, viz oddíl 7. Do `poolKeys()` nevstupuje. Násobení a dělení za násobilkou jsou dvě pole,
a ne jedno jako u stovky, protože je učebnice učí jako dvě samostatné
kapitoly a kapitola 14 má umět chtít jen násobení. Nikdy do kurikula
nepiš klíče přímo. `poolSize()` počítá kbelík do sta za čtyři, ne za jeden,
protože jeden kbelíkový klíč generuje celou rodinu příkladů; bez toho by
kapitola s jediným kbelíkem vypadala jako prázdná.

**Kapitola bez generátoru je nevybratelná.** Rozhoduje `isPlayable(ch)`, tedy
`poolSize` aspoň čtyři, nebo aspoň jedna zakázka dílny. `playableChapters(cur)` vrací, co jde vybrat, a volba
učebnice skáče na první z nich, ne na první kapitolu v knize.
`normalizeChapter(p)` srovná uložený profil na nejbližší dřívější hratelnou
kapitolu, nikdy dopředu, a volá se v `load()` i po importu zálohy. V seznamu
je celá kniha schválně, aby rodič viděl, kde třída je, i když to hra ještě
neumí; nehratelné položky jsou `disabled`.

**Zásadní hranice návrhu.** Závod je trenažér plynulosti, ne přemýšlení. Patří
do něj jen to, co se má zautomatizovat a kde je jedna krátká odpověď. Slovní
úlohy, geometrie, písemné algoritmy a čtení z tabulek potřebují druhý režim bez
stopek a bez bodů za rychlost, protože odměňovat rychlost u úlohy, kde je hlavní
práce pečlivé čtení, učí dítě hádat. Ten druhý režim se jmenuje **dílna**
a od září 2026 existuje, viz oddíl 4b.

**Autorská práva.** Z učebnice se přebírá výhradně struktura, tedy jaká témata,
v jakém pořadí, v jakém rozsahu a jakým typem úlohy. Zadání ani obrázky se
nepřebírají, příklady se generují vlastní. Je to i lepší produkt, protože
generátor jich vyrobí neomezeně a umí je stupňovat.

---

## 12. Chybějící generátory, změřeno

Tabulka vznikla tak, že se přes reálnou logiku `poolKeys` a `poolSize` spočítalo,
kolik kapitol každý chybějící generátor odemkne. Řadí se podle toho, ne podle
dojmu. Stav po rozkladu čísla je 88 hratelných
kapitol z 95, po ročnících 18/18, 43/44 a 27/33; první ročník je tím celý,
**vlna A, tedy všechno, co jde na `pad`, je hotová celá** a z vlny B jsou hotové
první dva vstupní prvky, `pad2` a `pad3`. Zbylých šest
zamčených kapitol třetí třídy čeká na další vstupní prvek nebo na dílnu, tedy
na zbytek kroku E a na krok F plánu.

| generátor | vstup | kapitol | kde |
| --- | --- | --- | --- |
| `parity` + `digit_count` | `pick` | 1 | g3: 6 |
| `compare_numbers` + `compare_units` | `cmp` | 2 | g3: 17, 22 |
| `fraction_read` | `frac`, dílna | 2 | g3: 19, 32 |
| `written_mult` | `col`, dílna | 1 | g3: 15 |

`finance_money` byl v téhle tabulce poslední a je hotový, viz oddíl 4b.
`mult_beyond` s `div_beyond` byl první a je taky hotový, viz oddíl 5, trať
`beyond`; odemkl kapitoly 14, 16 a 31. `rounding_10` s `rounding_100` byl druhý,
trať `round`, kapitoly 7 a 26. `chain_3` byl třetí, trať `chain`, kapitola 11,
a `order_of_ops` čtvrtý, trať `ops`, kapitoly 13 a 30. `mult_div_10_100`
s `mult_round` byl pátý, trať `tens`, kapitola 28, `unit_convert`
s `time_convert` šestý, trať `units`, kapitoly 18 a 29, a `missing_operand`
s `inverse_check` sedmý a poslední, kapitola 5. Ten jediný **žádnou trať
nedostal**, protože to není rodina, ale varianta nad existujícími klíči, viz
oddíl 7.

**Hlavní zjištění platilo.** Poslední z devíti zamčených kapitol třetí třídy,
která nepotřebovala na vstupu nic nového, byla kapitola 5, a třetí třída je
s ní na 25/33, aniž by se sáhlo na klávesnici. Kapitola 17 mezi zbylých osm
patří: jednotky jen pojmenovává a porovnává, takže na ni `unit_convert`
nestačí. Devátou odemklo až dělení se zbytkem, tedy první nový vstupní prvek,
a třetí třída je od 14. září 2026 na 26/33. Hned po ní přišel rozklad čísla,
tedy druhý nový vstupní prvek, `pad3`, a s kapitolou 21 je třetí třída na
27/33; zamčených zůstává šest, kapitoly 6, 15, 17, 19, 22 a 32.

**`written_add_sub` neodemkne ani jednu kapitolu**, i když ho mapa druhé třídy
posunula v prioritě nahoru. Kapitoly, ve kterých se objevuje, jsou hratelné už
teď přes `as100`. Je to prohloubení, ne odemčení, a navíc potřebuje dílnu.

**První ročník je celý hratelný.** Kapitoly 1 až 3 jsou počítání předmětů na
obrázku, nic pro závod; od září 2026 je umí zakázka `count` v dílně, viz oddíl
4b. Tím padla poslední díra prvního ročníku.

**Jak se to bude dělat, je v `docs/PLAN.md`**, sedm kroků od heatmapy po pátý
ročník, u každého konkrétní zásahy do kódu, migrace a testy.

**Proč právě takhle, je v `docs/ROADMAP.md`**, tedy co s hrou jako s produktem:
volba světa místo závodu pro děti, které závodění neláká, sbírky vázané na
Leitnerovu krabičku, mapa jako svět a seznam věcí, které se do dětské hry
přidat nesmí. Vzniklo to z rešerše, u každého zjištění je odkaz na studii.

## 12b. Další krok

Pořadí, na kterém jsme se dohodli: nejdřív všechno, co jde na `pad`. **Tahle
část je od 13. září 2026 hotová celá.** `add_sub_1000` byl první, páteř osmého
dílu a architektonicky jen další sada kbelíků vedle `add_sub_100`. Pak vlna A:
`mult_beyond` s `div_beyond`, `rounding_10` s `rounding_100`, `chain_3`,
`order_of_ops`, `mult_div_10_100` s `mult_round`, `unit_convert`
s `time_convert` a nakonec `missing_operand` s `inverse_check`. Ten poslední
byl schválně až na konci, protože to nejsou samostatné rodiny, ale
modifikátory existujících, a byl to jiný typ zásahu: ne nová trať a nové
klíče, ale druhý parametr `itemFromKey()` a druhý tvar řádku otázky.

**Další na řadě jsou nové vstupní prvky**, tedy krok E plánu: `pad2`
a `div_remainder` a `pad3` s `place_value` (obojí **hotovo 14. září 2026**, viz
oddíl 12d), pak `pick` a dvojice `parity`
s `digit_count`, úplně nakonec `cmp` a porovnávání. Od téhle chvíle každá
další kapitola čeká buď na ně, nebo na dílnu, což je jiný druh práce než
celá vlna A: sahá se na klávesnici a na `tap()`, ne jen na generátor.

**Dílna měla být až po tom všem, ale předběhla**, protože se ukázalo, že čtyři
kapitoly nečekají na nic jiného a že bez ní nejde říct, kam patří slovní úlohy.
Stojí, takže další témata dílny jsou od téhle chvíle jen další zakázka:
`word_problem` pro slovní úlohy, kterých je třetí ročník plný. `count_objects`
pro první ročník je hotové, viz oddíl 4b.

**Každá nová rodina dostane vlastní trať**, tak jsme se rozhodli u hodin a platí
to dál. Hranice patnácti tratí, u které svislý seznam přestával být mapou, padla
po zaokrouhlování a krok 4 ji vyřešil: mapa je od září 2026 krajina s cestou,
takže další trať je jen další místo na ní. Cenou za to je, že nová rodina musí
dostat prostředí ve všech čtyřech světech, ne v jednom.

## 12c. Co stojí v cestě

Soupis vznikl průchodem kódu, ne odhadem. Odkazuje na funkce, ne na řádky,
protože ty se posouvají. Řazeno podle toho, co která skupina blokuje.

**Hotová příprava, září 2026.** Šest nejlevnějších věcí ze seznamu je udělaných,
takže tímhle se zabývat nemusíš: CSS třída se jmenuje `.keypad`, vzorec 70 ku 30
je v `focusAndReview()`, stupňování v `stageIndex()`, otázka nese `input`,
`maxLen` a `check(napsané)`, klávesnice se překresluje, když se u další otázky
změní vstupní prvek, a `items.test.js` už neuvažuje jeden strop sto pro celou
hru, ale rozsah po rodinách plus kontrolu, že otázka uzná svou odpověď
a neuzná sousední. Zbytek dole platí.

**Ověřeno praxí.** `add_sub_1000` je první rodina, která tudy celá prošla,
a cesta skutečně volná byla. Zabralo to jeden zásah do `app.js` v osmi místech
ze seznamu v oddílu 14, tři řádky v `curricula.js`, tři řádky textů a dva nové
okruhy v `items.test.js`. Nic z bodů A až D se neukázalo jako skrytý blokátor.

**A. Rodiny na `pad`, tedy nejlevnější vlna.**

`thresholds()` je ruční výraz, kde má každá rodina svůj násobitel prahů,
zatím 2,6 za násobilkou, 2,4 pro hodiny, pro pořadí operací i pro dělení se
zbytkem, 2,2 pro počítání do tisíce, pro převody i pro rozklad čísla, 2,0 pro
zaokrouhlování i pro řetězec, 1,9 pro počítání do sta a 1,8 pro kulatá čísla.
Kdo na to zapomene, dostane
prahy pro jednociferné vybavování a děti budou mít samé pomalé odpovědi.
Tohle je jediná věc, na kterou se v téhle vlně dá zapomenout tiše.

Odpověď nad 999 potřebuje `maxLen: 4` přímo na položce, jinak ji nejde doťukat.
Výchozí jsou tři znaky. `items.test.js` to hlídá, takže `add_sub_1000` bez toho
neprojde, ale je dobré na to myslet rovnou.

Do tabulky `RANGE` v `items.test.js` si každá nová rodina dopíše svůj rozsah
odpovědi. Bez toho test skončí hláškou, že rodina nemá uvedený rozsah. Je to
schválně jediné místo, kde se test musí rozšířit ručně spolu s kódem.

**B. Nové vstupní prvky, tedy `pad2`, `pad3`, `cmp`, `pick`.**
**`pad2` i `pad3` jsou hotové i s rodinami, 14. září 2026.** Políčka umí
`tap()`, `typedText()`, `questionHTML()`, `keypadHTML()` i `submit()` v libovolném
počtu, `check` dostane pole hodnot a porovná je zvlášť, celé je to popsané
v oddílu 7 pod „Odpověď smí mít víc než jedno políčko“. `pad2` používá dělení se
zbytkem, `divrem`, `pad3` i `pad2` rozklad čísla, `split`. Zbývají `cmp`
a `pick`, u kterých zbytek dole platí dál.

Zadávání dřív počítalo s jedním polem: `RUN.typed` byl jeden řetězec, `#abox`
jeden prvek a `typedText()` vracel jeden řetězec. Víc políček potřebuje pojem
aktivního políčka, přeskok po naplnění, mazání přes hranici a další `id`. Kód je
napsaný obecně v počtu políček, což se v kroku E2 potvrdilo: `pad3` stál jeden
řádek v `SLOTS` a zobecnění tří míst, která ještě počítala do dvou. U hodin šla použít finta hodina krát sto plus minuty,
u dělení se zbytkem je křehká, protože nerozliší špatný zápis od špatného
výsledku, takže `check` tam dostává opravdové dvě hodnoty.

Klávesnice se skládá v `keypadHTML(item)` a `submit()` ji vymění, když má další
otázka jiný `input`. Nový vstupní prvek přidá větev tam, pravidlo
`.keypad-<jméno>` do stylů a větev do `tap()`. Pozor: tlačítka musí buď použít
`data-k` a projít přes `tap()`, nebo dostat vlastní atribut a vlastní větev,
protože delegovaný posluchač bere `data-k` dřív než `data-act`.

**Míchání vstupních prvků v jednom závodě je technicky vyřešené** tím, že se
klávesnice mění spolu s otázkou. Zůstává jen posouzení, jestli je pro dítě
únosné střídat klávesnici a tlačítka uvnitř jedné jízdy. To se dá rozhodnout
až se skutečnou obrazovkou; pokud vyjde, že ne, brání se to jednou podmínkou
v `buildRun()` a v `reachedKeys()`.

`record()` bere správnost jako ano nebo ne. U dvou políček to znamená, že
"podíl dobře, zbytek špatně" spadne do krabičky jako celá chyba. Změna by sáhla
na datový model, takže rovnou na pravidlo z oddílu 3 a na migrační test.
**Vědomě se to v E1 nezměnilo**, viz známé zjednodušení na konci oddílu 7.

V CSS je políčko odpovědi široké nejmíň 104 pixelů a klávesnice má pevně tři
sloupce. Dvě nebo tři políčka vedle sebe se do řádku nevejdou a tři velká
tlačítka do třísloupcového gridu jen náhodou. Rozměry jsou navíc zopakované
podruhé v media query pro nízké displeje. **Pro dvě políčka se to vyřešilo
vlastní třídou řádku** `.question.q-boxes`, která políčko zúží na 52 px a mezery
na 5 px, a klávesnicí `.keypad-pad2` o čtyřech sloupcích místo tří; tři velká
tlačítka `pick` a `cmp` tenhle problém pořád mají.

**C. Viditelnost pro rodiče. Hotovo, září 2026.** Heatmapa byla doslova tabulka
jedenáct krát jedenáct pro malou násobilku a souhrn nahoře počítal taky jen
z násobilky, takže dítě, které dva měsíce jede sčítání do sta, vidělo nula
procent. Teď je to komponenta, podrobnosti v oddílu 7b. Nová rodina si dopíše
jeden řádek do `heatSpecs()` a je vidět.

**D. Pasti, na které se dá naběhnout.**

Hlavička klíče je jedno písmeno a `key.slice(1)` to předpokládá na čtyřech
místech. **Tenhle seznam je registr a musí se doplnit v témže kroku, ve kterém
rodina vzniká**, jinak si příští rodina sáhne po obsazeném písmenu; po krocích
B a D1 až D3 byl čtyři kroky pozadu. Obsazené je `m` násobení, `d` dělení,
`a` sčítání do 20, `s` odčítání do 20, `p` a `n` kbelíky do sta, `k` celý obor
do tisíce včetně znaménka, `x` násobení a dělení za násobilkou včetně znaménka,
`o` zaokrouhlování, `q` řetězec tří čísel, `z` pořadí operací, `g` kulatá čísla
včetně znaménka, `u` převody jednotek, `r` dělení se zbytkem, `c` hodiny
a `w` zakázky dílny, které
leží v téže krabičce, i když je žádný pool závodu nevyrobí (`isJobKey`).

Kbelíkové rodiny z toho jsou `FAMILY_HEADS` v `src/app.js`, dnes řetězec
`pnckxoqzgur`, tedy tenhle seznam bez jednotlivých spojů (`m`, `d`, `a`, `s`)
a bez dílny (`w`); obojí musí sedět, `poolSize` a `buildRun` se ptají právě
`FAMILY_HEADS`. Pozor na `h`, to je vnitřní id kbelíků do sta a klíč vzniká
slepením `"p" + "h1"`; jako hlavička rodiny by se to pralo. Stejně tak `b` je
vnitřní id kbelíků do tisíce. Šestnáct písmen je tedy pryč a volných zbývá
deset (`b`, `e`, `f`, `h`, `i`, `j`, `l`, `t`, `v`, `y`, z toho `b` a `h` jen
opatrně), zatímco plánovaných generátorů je kolem deseti, takže nová rodina se
znaménkem ho má nést uvnitř klíče jako tisícovka, ne brát si dvě písmena jako
stovka.

Kbelíky mají dvě různé konvence: `c1` je rovnou celý klíč, `h1` a `b1` se
prefixují. Nová kbelíková rodina si musí vědomě vybrat jednu. **Dělení se
zbytkem přidalo třetí:** klíč je `"r" + dělitel`, tedy `r7`, a kbelík je
dvojice dělitelů nad ním, takže jeden kbelík drží dva klíče a `divremKeys()`
je rozbaluje. Je to schválně: dovednost, kterou si má krabička pamatovat, je
dělení sedmi, ne "druhá dvoustrana", a dvojice v sešitu je jen pořadí, ve
kterém se dělitele zavádějí.

Tiché nouzové cesty schovávají chyby. Neznámý klíč vrátí z `itemFromKey()`
příklad 1 + 1, prázdný pool spadne v `buildRun()` na malou násobilku a chybějící
prostředí na louku. Při vývoji nové rodiny to vypadá, že to skoro funguje.
Uvnitř rodiny se to od 13. září 2026 nedělá: neznámý kbelík je hlasitý pád,
`noBucket(kde, klíč)` v `opsItem()`, `tensItem()` a `divremItem()`, vedle
hlasitých pádů
u prázdného rozsahu převodu a u nedokončitelného řetězce. Zbývají dvě tichá
místa téhož druhu, `unitItem()` bere u neznámého kbelíku `U_BUCKETS[0]`
a `chainTriple()` spadne na poslední větev; dnes to nikdo nevyrobí, protože
klíče vznikají z kbelíků, ale rovnat se to má stejně.

**E. Co blokátor není, i když to tak vypadá.** Service worker má cache
pojmenovanou `math-fact-racer-v1` a nemění se, ale načítá se ze sítě jako
první a cache je jen záloha pro offline, takže aktualizace se k dětem dostane.
`record()`, `mastery()`, `sampleKeys()`, `pickWeight()` a celá geometrie okruhu
jsou nad klíčem skutečně obecné a nepotřebují sáhnout vůbec.

**Co z toho je teď na řadě.** Rodiny na klávesnici jdou psát rovnou, cesta je
volná, a od kroku E1 to platí i pro rodinu na `pad2`. Heatmapa v rodičovské
sekci je hotová, viz oddíl 7b.

## 12d. Pilot pro `pad2` a `pad3` — hotovo 14. září 2026

**Dělení se zbytkem.** Kapitola 27 mapy třetího ročníku, strany 30 až 35
osmého dílu. Je to jádrová látka třetí třídy, sešit jí věnuje tři dvoustrany,
nejvíc ze všech témat obou dílů, a celá se odehraje uvnitř existujícího závodu.
Potřebovala jediný nový vstupní prvek, druhé políčko na zbytek.

Sešit ji staví v pořadí, které stojí za to zachovat: vyznačení násobků dělitele
na číselné ose, výpočet podílu a zbytku, obrácená úloha na doplnění dělence,
slovní úloha, kde je zbytek smyslem zadání. Dělitele bere po dvojicích 2 a 3,
4 a 5, 6 a 7, 8 a 9, pak 10 a nakonec smíšené opakování, což je hotová osnova
pro pět kbelíků, a přesně tak jsou udělané: `R_BUCKETS`.

**Hotovo je:** trať `divrem` s hlavičkou klíče `r`, klíč po dělitelích `r2` až
`r10` místo vyčíslitelných faktů (přes pět set klíčů), `divrem` v `poolKeys()`,
kapitola 27 v `src/curricula.js`, texty ve třech jazycích včetně slov mezi
políčky, a dvě vlastní chybové hlášky: zbytek větší nebo rovný děliteli dostane
`divremTooBig`, zbytek správný a podíl špatný `divremQuotient`. Podrobnosti
v oddílu 4.

**Zbylé dvě úlohy kapitoly se nedělaly a je to schválně.** Doplnění dělence ze
zadaného podílu a zbytku (`div_remainder_inv`) je obrácená úloha nad týmiž
klíči, tedy varianta jako doplňování chybějícího členu, ne rodina; slovní úloha
se zbytkem patří podle oddílu 4b do dílny, ne do závodu.

**Rozklad čísla, druhá polovina pilotu.** Kapitola 21, strany 2 až 5 osmého
dílu, tedy místo, kde se obor do tisíce teprve odvozuje ze stovky. Potvrdila to,
kvůli čemu byl `pad2` psaný obecně v počtu políček: `pad3` stál jeden řádek
v `SLOTS` a zobecnění tří míst, která ještě počítala do dvou, a nic z přeskoku,
mazání přes hranici ani porovnávání se nezměnilo. Rodina navíc ukázala, že počet
políček smí říkat **kbelík**, ne rodina: první dva kbelíky rozkladu se
odpovídají do dvou políček a poslední do tří, protože tolik řádů to číslo má.
Hotová je trať `split` s hlavičkou klíče `v`, klíče `v1` až `v3`, `split`
v `poolKeys()`, kapitoly 21 a 25 v `src/curricula.js`, texty ve třech jazycích
včetně tří zadání nad klávesnicí a vlastní hlášky `splitDigits`. Podrobnosti
v oddílu 4, rozhodnutí o směru otázky v `docs/PLAN.md`, krok E2.

**Porovnávání zůstává poslední úmyslně.** `cmp` a `pick` vypadají jako levný
způsob, jak odemknout hodně naráz, ale změřeno to nesedí, jsou to tři kapitoly
dohromady. Navíc je porovnávání poznávání, ne vybavování, takže porušuje první
z nedotknutelných principů a patří dovnitř jen jako doplněk, nikdy jako celá
trať.

**Zlomky mají zvláštní poznámku.** V druhé třídě se objevují jako vedlejší
produkt dělení, tedy poloviny u dvojky, třetiny u trojky, čtvrtiny u čtyřky.
Až se bude psát `fraction_read`, má navázat na tohle, ne to stavět od nuly
ve třetí třídě.

---

## 13. Dobrovolná podpora projektu

Hra zůstává zdarma, MIT, bez reklam a bez sledování. Vedle toho je v README
sekce s výzvou k dobrovolnému příspěvku, umístěná až za Licencí, tedy dole.
Formulace musí vždy splnit tři věci: říct, že hra je a zůstane zdarma; říct,
co konkrétně se za příspěvky bude vyvíjet dál, tedy učivo třetí třídy a další
ročníky; a explicitně říct, že nepřispět je naprosto v pořádku a že se to ve
hře nijak nepozná. Žádné odemykání, žádné počítadlo cíle, žádný tlak.

**Zvolený kanál.** QR platba podle českého standardu SPAYD, obrázek přímo
v repozitáři. Nulové poplatky, žádná registrace pro dárce, rodič to zvládne
na tři klepnutí v bankovní aplikaci. QR se generuje skriptem `tools/make-qr.py`
knihovnou `segno`, není závislé na žádné externí službě. Účet je
`2800927751/2010`, IBAN `CZ4920100000002800927751`, Fio, bez předvyplněné
částky.

**Zamítnuté kanály a proč.** Buy Me a Coffee si bere pět procent navždy
a podporuje jen kartu. Ko-fi je levnější, nula procent z jednorázových
příspěvků, ale pořád je to anglická platforma s registrací, což je pro české
rodiče zbytečná bariéra. GitHub Sponsors má nulový poplatek a Česko je
podporované, ale dárce potřebuje účet na GitHubu. Patreon a Herohero jsou
předplatné, špatný tvar pro jednorázové poděkování. Donio a Darujme potřebují
kampaň nebo právní formu.

**Odložené, pro zahraničí.** Až bude hra mířit i mimo Česko, přibude druhý
QR kód podle evropského standardu EPC069-12, známého jako EPC QR nebo
GiroCode. Ten čtou německé a rakouské bankovní aplikace a pokrývá celou SEPA,
takže jedním obrázkem obslouží i německou jazykovou verzi, která už v aplikaci
je. Vedle toho se dá později doplnit Ko-fi jako kartová varianta pro ty, kdo
nemají evropský účet. Zatím se nedělá nic z toho.

**Daňová poznámka.** Bezúplatný příjem od nepříbuzné osoby je osvobozený
zhruba do 15 000 Kč ročně od jednoho dárce. Příspěvky velikosti kafe se k tomu
nepřiblíží. Limity se novelami mění, u čehokoli většího ověřit u Finanční
správy.

---

## 14. Hotový prompt pro novou session

> Pokračujeme v projektu Math Fact Racer, což je hra na procvičování počítání
> pro mého osmiletého syna, kterou už používají rodiče spolužáků. Repozitář je
> v `~/Dokumenty/Kladska/math-fact-racer`.
>
> Přečti si nejdřív `docs/PROJECT-STATE.md` celý, je tam kompletní stav,
> mechanika, architektura, opravené chyby a plán. Pak `docs/kurikulum/README.md`
> kvůli modelu učiva a `src/app.js` kvůli kódu.
>
> Zdroje se editují v `src/`, nikdy ne `index.html`. Po každé změně se pouští
> `python3 build.py` a pak testy z `tests/`, u kterých se hlídá výskyt `!!`
> ve výstupu. Nové chování patří do testů, ne jen do kódu. Žádná změna nesmí
> připravit existující profil o postup, hlídá to `tests/migration.test.js`.
>
> Piš mi česky, kód a komentáře anglicky, stručně a bez vaty. Nedotknutelné
> principy z oddílu 3 neměň bez mého pokynu. Push na GitHub dělám sám, z tvého
> prostředí neprojde, takže jen commituj a řekni mi, co poslat.
>
> Dneska chci [doplň, například: napsat generátor dělení se zbytkem podle
> oddílu 12 / projet další učebnici, odkaz posílám / opravit tohle a tamto].

### Kontrolní seznam pro každou novou rodinu

Projela tudy tisícovka, za násobilkou i zaokrouhlování a sedělo to do puntíku.
Od kroku 4 a 4c v něm přibyly dva body, prostředí ve čtyřech světech a ročník.

**Na variantu se tenhle seznam nevztahuje.** Varianta je tentýž klíč položený
jinak, dnes doplňování chybějícího členu; klíč se nemění, krabička ani sbírka
se nemění, vlastní trať nevzniká, do `FAMILY_HEADS` se nepíše nic a heatmapa
zůstane, jak byla. Zásah je jinde a je krátký: obalení v `itemFromKey()`,
pole `variant` na kapitole v `src/curricula.js`, předání ve větvi `school`
v `buildRun()`, násobitel v `thresholds()` a případný druhý tvar řádku
v `questionHTML()`. Viz oddíl 7.

**V `src/app.js`:**

1. písmeno hlavičky klíče do `FAMILY_HEADS`
2. definice kbelíků nebo stupňů a generátor, větev v `rawItem()`
3. `poolKeys()`, `trackKeys()`, a `reachedKeys()`, pokud má rodina stupně
4. vlastní `*Stage()` přes `stageIndex()`, pokud má stupně
5. větev v `buildRun()`, vždycky přes `focusAndReview()`, nikdy vlastní poměr
6. záznam v `TRACKS` **včetně `grade`**, bez něj se trať neobjeví na mapě
   nikomu; a `thru`, pokud se učivo opakuje i v dalších ročnících, jinak
   spadne po roce za dveře do minulých let
7. paleta v `ENVS` a **prostředí ve všech třech zbylých světech ve `WORLDS`**,
   jinak bude nová trať ve stezce, na obloze i v hlubině vypadat jako v okruhu;
   paleta si přes `tok` řekne, co se v ní sbírá, a přes `dark`, jestli je noční
8. větev v `unlockState()`, a rozmyslet, jestli je trať vstupní branou ročníku
   (ty jsou otevřené vždycky), nebo visí na zvládnutí předchozí
9. násobitel v `thresholds()`, jinak bude mít dítě samé pomalé odpovědi
10. `maxLen` na položce, pokud odpověď přeleze tři číslice, a `unit`, pokud
    odpověď nese jednotku; obojí je údaj na položce, ne výjimka v obrazovce.
    Odpovídá-li se do víc políček, patří sem `input:"pad2"` nebo `"pad3"`,
    odpověď jako pole čísel, `maxLen` jako pole a slova mezi políčky a za nimi
    (`sep`, `tail`) jako hotový text ve všech třech jazycích; `sep` stojí
    v každé mezeře, takže jedno slovo stačí na dvě políčka i na tři. Počet
    políček smí říkat kbelík, ne jen rodina; viz oddíl 7
11. blok v `heatSpecs()`, jinak ji rodič v heatmapě neuvidí

**Dál:** kapitoly v `src/curricula.js` a dvojice textů `trk_*` a `trk_*s` ve všech
třech jazycích v `src/i18n.js`.

**Délku otázky řešit nemusíš**, `questionSize()` ji měří sama a dlouhý řádek
dostane menší písmo; od řetězce tří čísel to platí pro každou rodinu. Co stojí
za kontrolu, je jen to, jestli se nejdelší zadání té rodiny opravdu vejde na
telefon. Rodina s víc políčky si musí říct o příplatek, viz oddíl 7, a měřit se
musí **s vyplněnými políčky**, ne s otazníky: do prvního políčka rozkladu se
píše tři sta a to je o polovinu širší než otazník. Řádky se měří z opravdového
CSS a opravdového `questionHTML()` přes metriky písma Baloo 2; na telefonu
375 px na výšku je k dispozici 339 px (`.qzone` má po 18 px odsazení).
Ve třetím ročníku, kde tohle učivo je: nejdelší převod
(`240 měsíců = ▢ let`) 330 px, rozklad do tří políček (`987 = 900 + 80 + 7`)
322 px s vlastní třídou `.q-boxes3`, bez ní 340, dělení se zbytkem 292 px česky
a 311 německy. Prvňákovi a druhákovi se ty tři nejširší zalomí, a to je v pořádku:
co se nevejde, se zalomí nebo roluje, nikdy se neuřízne.

**V `tests/items.test.js`:** export nových symbolů v `module.exports` na konci
skládaného zdroje, řádek do tabulky `RANGE`, klíče do seznamu `keys` i do množiny
`VALID` a vlastní okruh, který ověří, že každý kbelík dělá to, co slibuje.

**V `tests/flow.test.js` sedí natvrdo tahle čísla** a každá nová trať je posune.
Od kroku B0 se měří zvlášť složená a rozbalená mapa, viz oddíl 7d, a od E2
platí tahle: třeťák má složeno 19 různých cest a 21 míst (1 dveře, 19 tratí
letoška, dílna) a rozbaleno 26 cest a 28 míst, za dveřmi má 7 tratí; druhák má
18 míst bez dveří a bez milníku a k tomu dveře dopředu; prvňák má 8 a dveře
zpátky nemá; čtvrťák vidí celou mapu, tedy 27 míst a žádné dveře ani milník.
Dál sedí počet tratí v ukázce druhého ročníku (10) a počet zamčených kapitol
třetí třídy (6 z 33). Krok D4 mapu neposunul, protože varianta vlastní trať
nemá; posunul jen ten poslední počet, z devíti na osm. Krok E1 posunul obojí:
`divrem` je třetiročníková trať, takže se mapa druháka ani prvňáka nehnula,
a kapitola 27 dostala generátor, takže zamčených bylo sedm. Krok E2 posunul
tytéž dvě věci o jedno dál, ze stejného důvodu: `split` je taky třetiročníková
trať a kapitola 21 dostala generátor.

**Krok H mapu taky neposunul a posunul zato garáž.** Startovních závodníků je
sedm místo šesti (přibyla kačenka) a dvě místa, která počítají závodníky profilu
po jednom nákupu, jsou na devíti; garáž ukazuje osmadvacet zvířat místo dvanácti
a 64 kačenčích dílů k odemčení plus pět dlaždic zdarma, tedy klasickou žlutou
a čtyři prázdné, kterými se vrstva zase sundá. Každý ten posun je vědomý
a s komentářem, viz `tests/README.md`.

**Nová zakázka do dílny** je jiný seznam a je kratší: záznam v `JOBS` včetně
`grade`, generátor úlohy vedle `moneyItem()` a `countItem()`, větev v
`jobItemFromKey()`, texty `job_*`, `heat_w*` a zadání úlohy ve třech jazycích,
a pokud potřebuje jiný vstupní prvek než mince a dílky, větev v `trayHTML()`,
`counterHTML()` a `solutionHTML()`.

### Kontrolní seznam pro nový kus kačenčí výstroje

Deset bodů, a první z nich se odbaví dřív, než se něco nakreslí. Podrobnosti
k celému modelu jsou v oddílu 7f.

1. **Autorská práva.** Kontrolní otázka zní: dá se u té kresby říct jméno
   postavy? Když ano, je špatně a dál se nepokračuje. Díl je věc, ne bytost.
2. Katalog: položka do `DUCK_BODY`, `DUCK_PAT`, `DUCK_HEAD`, `DUCK_EYE` nebo
   `DUCK_GEAR`. Vrstva se pozná z předpony id (`db`, `dp`, `dh`, `de`, `dg`),
   takže id musí sedět s tím seznamem, do kterého se píše.
3. Cena mezi 6 a 30 součástkami a položka zařazená **podle ceny**, protože
   sekce jsou v garáži řazené od nejlevnějšího a podle toho se rozhoduje, kam
   dítě pošle tlačítko „utrať součástky“.
4. Jméno pod id ve všech třech jazycích v `src/i18n.js`.
5. Kresba jako funkce `draw(g, rim)`, u výbavy případně i `back(g, rim)` pro
   půlku, která patří za tělo.
6. **Kotvy.** Žádná souřadnice hlavy, oka ani těla napsaná natvrdo, všechno
   z `g`, tedy z `duckFit()`. Klobouk končí na `brim` nebo výš, oční díl a
   výbava zůstávají pod ní.
7. **Z-order.** Ověřit, že díl vychází ve své vrstvě a že se zadní půlka výbavy
   kreslí před tělem a přední za vším ostatním.
8. **Kontrast.** Díl musí mít aspoň jednu barvu dál než 25 ΔE od **všech** barev
   všech deseti těl, jinak mu `partInk()` podloží obrys; pokud ani ten nestačí,
   je potřeba změnit barvu dílu.
9. **Strojová kontrola** v okruhu 3d nebo 3e `items.test.js` (rám, kotvy, oko,
   zobák, pořadí vrstev) a v okruhu 3f (kontrast); u nové vrstvy taky posun
   kotvy a kontrola, že se díl pohne s ní.
10. **Render a prohlédnutí.** Vykreslit díl na všech deset těl přes `cairosvg`
    podle oddílu 2 a podívat se; kresbu žádný test neuvidí a `convert` ji
    ukáže špatně.

### Kontrolní seznam pro nové zvíře

Kratší, protože zvíře nemá vrstvy, ale první bod je tentýž.

1. **Autorská práva.** Zvíře se kreslí podle skutečného zvířete, nikdy podle
   filmové podoby. Když se u kresby dá říct jméno postavy, je špatně.
2. Katalog: položka v `PETS` **vetknutá podle ceny**, ne přidaná za konec, aby
   byl katalog jedna souvislá řada; cena v mincích, dnes od 25 do 200.
3. Jméno ve všech třech jazycích v `src/i18n.js`.
4. Tvarová funkce v `PET_SHAPES` pod týmž id. Vrací kresbu a říká, kam patří
   oči a pusa; `mouth:"own"` tehdy, když je pusa sama ta kresba (zobák, čelist
   se zuby, úsměv obcházející chobot).
5. **Bez otáčení a jen absolutními příkazy v cestách**, jinak si test nedokáže
   body přečíst zpátky a rám nepohlídá.
6. Hvězda třetího stupně: ověřit, že jí v pravém dolním rohu nestojí v cestě
   ocas, chapadla ani pera; když ano, přestěhovat ji.
7. **Strojová kontrola** v okruhu 3a `items.test.js`: řádek do zamrazené
   tabulky (id, tvar, obě barvy, cena, české jméno), platnost sprajtu ve všech
   třech stupních, rám i s tahy, poloha očí a úsměvu.
8. **Render a prohlédnutí ve všech třech stupních.** Je to jediné místo, kde se
   pozná, jestli zvíře vypadá jako to zvíře; v kroku H7 se po prvním renderu
   předělávalo šest zvířat ze šestnácti.
9. Posunuté počty ve `flow.test.js`, viz níž a `tests/README.md`.

### Prompt pro nejbližší krok

Použij tenhle, pokud se pokračuje tam, kde se přestalo. Další kroky mají
v `docs/PLAN.md` vlastní zadání a stačí v tomhle promptu vyměnit odstavec
s dnešním úkolem.

**Kde přesně stojíme.** Kroky 1, 3 a 4 starého plánu jsou hotové, k tomu 4c
a 4d. **Vlna A je hotová celá**, tedy všech sedm položek. Revize ze 13. září
sepsala `docs/PLAN.md` verze 2 s kroky A až G; hotové jsou A, B0, B, oprava
B0b, celý krok C (responzivita ve dvou commitech, druhý s písmem podle ročníku
a šestým testovým souborem) a **celý krok D**: D1 (pořadí operací, trať `ops`),
D2 (kulatá čísla, trať `tens`), D3 (převody jednotek, trať `units`) a D4
(chybějící člen, varianta bez vlastní trati). **Hotový je i celý krok H**, tedy
gumová kačenka s pěti vrstvami výstroje a osmadvacet zvířat, v osmi commitech;
učiva se netýká a na mapu nesáhl. **Hotové jsou i kroky E1 a E2**, tedy vstupní
prvky `pad2` a `pad3` a rodiny dělení se zbytkem a rozklad čísla, ve třech
commitech. Nejbližší je zbytek kroku E: E3 (`pick`) a E4 (`cmp`).
Z rozhodnutí
v oddílu 9 plánu padla R4 (řetězec před `beyond`), R7 (vynulování nechá
nastavení), R6 (tři sloupce mapy na tabletu, čtyři od 900 px), R5 (měřítka
písma 1,25 / 1,12 / 1,04 / 1,0), R3 (chybějící člen pod původním klíčem),
R10 (překreslit dnešních dvanáct zvířat, ale bez změny identity Lupi
a Hvězdíka) a R2 (dělení se zbytkem jako rodina po dělitelích `r2` až `r10`),
všechna podle doporučení. R1 (žebřík minulých
let) je odložené a po B0b už není naléhavé, viz hlavička. Nová je **R11**,
tedy počet dlaždic v garáži, viz oddíl 9 plánu.

**Co je čerstvě hotové a nesmí se rozbít.** Odpověď smí mít víc než jedno
políčko: `RUN.typed` je pole, jakmile jich je víc, sahá se na něj jen přes
`typedAt()` a spol., a `check` porovnává hodnoty zvlášť, nikdy je neslepuje do
jednoho čísla (E1). Kolik políček to je, říká tabulka `SLOTS` a všechno kolem
počítá, nikde se neptá na jméno `pad2`; počet políček smí říkat kbelík, takže
rozklad čísla má dva kbelíky do dvou políček a jeden do tří (E2). Rozklad se ptá
**od čísla k řádům**, nikdy obráceně, protože skládání jde odpovědět přečtením
číslic, a každý řád, který má políčko, je od jedné do devíti, takže nikde není
nula, na kterou čeká políčko (E2, oddíl 4). Dělení se zbytkem má klíč po dělitelích, staví se
konstrukcí pozpátku (podíl, zbytek, teprve dělenec), zbytek je menší než
dělitel proto, že jinde být nemůže, a beze zbytku vyjde pevná pětina příkladů
ve všech kbelících (E1, oddíl 4). Chybějící člen je varianta, ne
rodina: klíč se nemění, variantu si vyžádá kapitola a předává ji jediné místo,
větev `school` v `buildRun()`, takže se nikdy nedostane do šampionátu ani do
trati "co ti nejde", a obalit se dá jen prostý početní řádek, takže ciferník
projde nedotčený (D4). Převody jednotek drží obě čísla,
v zadání i v odpovědi, do tisíce a jednotku nesou jako údaj na položce, takže
o ní mimo `itemFromKey`, `questionHTML()` a `rightAnswerText()` nikdo neví
(D3). Kulatá čísla staví součin tak, aby
nikdy nepřelezl tisíc, a dělí jen tím, čím násobila (D2).
Kačenka se skládá z pěti nezávislých vrstev, kde
se nic nevylučuje, díly se platí výhradně součástkami, kotvy se počítají při
každém kreslení a žádný díl si nesmí nést souřadnice hlavy (H, viz 7f).
Sbírka vázaná na krabičku se nikdy
nevrací (oddíl 6), tvar cesty se řídí světem a `atU()` o něm neví (7c), mapa se
skládá podle ročníku, za dveřmi je jen učivo, ke kterému se třída už nevrací,
a ukázka dalšího roku se nikam nezapisuje (7d), první ročník
je žebřík šesti oborů bez přechodu přes desítku (4) a zakázka v dílně patří do
ročníku (4b).

> Pokračujeme v projektu Math Fact Racer, hra na procvičování počítání pro mého
> osmiletého syna a jeho spolužáky, repozitář `~/Dokumenty/Kladska/math-fact-racer`.
>
> Tvoje role je **orchestrátor**, ne programátor. Přečti si celý
> `docs/PROJECT-STATE.md` kvůli stavu a mechanice a celý `docs/PLAN.md` kvůli
> tomu, co se dělá, v jakém pořadí a kde v kódu se sahá. **`src/app.js` ani
> testy nečti celé**, šetři si kontext; do zdrojů se dívej jen přes grep, když
> potřebuješ něco ověřit. Implementaci každého kroku zadej jednomu subagentovi
> podle oddílu 10 plánu, kde je šablona zadání i rozdělení kroků; subagent
> si zdroje přečte sám. Po návratu subagenta sám pusť `python3 build.py`
> a `node tests/items.test.js | grep '  !!  '`, u kroků sahajících na
> obrazovky nebo profil i `flow.test.js` a `migration.test.js`, prohlédni
> `git log -1 --stat`, a teprve pak zadej další krok. Po každé rodině pusť
> kontrolního subagenta podle oddílu 10 a jeho nálezy dej opravit dalšímu
> subagentovi, než půjdeš dál. Když subagent hlásí rozpor s plánem, rozhodni
> autonomně podle plánu.
>
> Dneska chci zbytek kroku E, tedy E3 (`pick`, sudá a lichá, kapitola 6) a E4
> (`cmp`, porovnávání, kapitoly 22 a 17); E1 (`pad2` a dělení se zbytkem) i E2
> (`pad3` a rozklad čísla) jsou hotové. Každý subagent má vlastní commit.
> Rozhodnutí z oddílu 9 plánu ber podle doporučení a řekni to subagentovi
> v zadání; R1 (žebřík minulých let) zatím nedělej.
>
> Každá nová rodina si vyrenderuje své čtyři palety a prohlédne je na obrázku
> podle oddílu 2; `convert` nekreslí přechody, takže se pozadí skládá zvlášť.
> Rozvržení obrazovek se v sandboxu prohlédnout nedá, jsdom ho nemá.
>
> Pravidla, která patří do každého zadání subagentovi: zdroje se editují
> v `src/`, nikdy `index.html`; po každé změně `python3 build.py` a testy
> z `tests/`, hlídá se `!!` ve výstupu; nové chování patří do testů; žádná
> změna nesmí připravit existující profil o postup, hlídá to
> `tests/migration.test.js`, a dotek datového modelu znamená další zamrazený
> profil v `tests/fixtures/legacy-profiles.json`; cokoli kresleného se
> vyrenderuje a prohlédne; nedotknutelné principy z oddílu 3 se nemění; kód
> a komentáře anglicky, commit anglicky jednou větou; push ne.
>
> Piš mi česky, stručně a bez vaty. Push dělám sám, jen mi na konci řekni,
> které commity poslat. Na konci sám aktualizuj tenhle soubor, hlavně
> hlavičku "Kde se přestalo", stav v číslech a tenhle prompt tak, aby dalším
> úkolem byl krok F (slovní úlohy v dílně), a ověř, že subagenti označili
> hotové kroky v `docs/PLAN.md`.

### Prompt pro autonomní dokončení celého plánu

Varianta bez průběžných otázek: session dojede zbytek plánu sama, rozhodnutí
z oddílu 9 plánu bere podle doporučení a krok G jen připraví. Použij, když
nechceš být u toho. Kroky A, B0, B a oprava B0b jsou hotové, začíná se krokem C.

> Pokračujeme v projektu Math Fact Racer, hra na procvičování počítání pro mého
> osmiletého syna a jeho spolužáky, repozitář `~/Dokumenty/Kladska/math-fact-racer`.
> Tentokrát pracuješ **autonomně až do konce plánu**, bez otázek na mě.
>
> Tvoje role je **orchestrátor**. Přečti si celý `docs/PROJECT-STATE.md` a celý
> `docs/PLAN.md`. **`src/app.js` ani testy nečti celé**, do zdrojů se dívej
> jen přes grep. Každý krok zadej jednomu subagentovi přesně podle oddílu 10
> plánu (šablona zadání, rozdělení kroků, kontrolní subagent); po jeho návratu
> sám pusť `python3 build.py` a všech šest testů z `tests/`, prohlédni
> `git log -1 --stat` a teprve pak zadej další krok. Po každém hotovém kroku
> přepiš v tomhle souboru hlavičku "Kde se přestalo" jednou větou, aby šlo
> po případném přerušení navázat.
>
> Pořadí a rozdělení: C ve dvou subagentech (C1 až C3 s C5, pak C4 s C7);
> D1, D2, D3, D4 po jednom; E1 ve dvou (nejdřív dvě políčka `pad2`, pak
> generátor dělení se zbytkem); E2; E3; E4; F. Po obou částech C, po každém D
> a po E1 pusť kontrolního subagenta a jeho nálezy dej opravit dalšímu
> subagentovi před tím, než jdeš dál. Krok G nedělej: mapy čtvrtého a pátého ročníku nejsou
> ověřené ze stránek a k tomu potřebuješ mě; místo toho na konci sepiš do
> `docs/PLAN.md` u kroku G, co přesně je k ověření a co se změní v datovém
> modelu.
>
> Rozhodnutí z oddílu 9 plánu ber podle doporučení a řekni to subagentům
> v zadání: R2 rodina po dělitelích `r2` až `r10`, R3 původní klíč,
> R5 měřítka 1,25 / 1,12 / 1,04 / 1,0, R6 sloupce na tabletu. R4 a R7 už
> padly v kroku A a B. R1 (učivo minulých let starším dětem otevřené) je
> jediné, které nech na mně, ani ho nedělej. Kde subagent narazí na něco,
> co plán neřeší, rozhodni ve prospěch nedotknutelných principů z oddílu 3
> a zapiš rozhodnutí do plánu k danému kroku.
>
> Když krok dvakrát po sobě neprojde testy nebo kontrolou, nepokračuj v něm:
> vrať pracovní strom na poslední čistý commit (`git checkout -- . && git
> clean -fd src tests docs`, nikdy `reset --hard` na cizí commity), označ
> krok v plánu ODLOŽENO s důvodem a jdi na další krok, který na něm
> nezávisí. `migration.test.js` musí být zelený po každém commitu a nikdy se
> neopravuje škrtnutím kontroly.
>
> Vzhled se ověřuje na obrázku. Kresby (palety, cesty, sbírky) přes node
> a `convert` podle oddílu 2 tohohle souboru. Rozvržení z kroku C tak, že
> `dist/artifact.html` nahraješ do mého existujícího artefaktu "Math Fact
> Racer" na claude.ai, který k tomu slouží, a ve vestavěném prohlížeči si ho
> prohlédneš s emulací 375 × 812, 812 × 375, 768 × 1024, 1024 × 768
> a 360 × 640 na mapě, v závodě, v dílně a na výsledku, pro prvňáka i pro
> třeťáka; co nevypadá dobře, dostane subagent k opravě s popisem, co a kde.
> Po skončení kroku C nahraj artefakt ještě jednou s hotovým stavem.
>
> Pravidla do každého zadání subagentovi: zdroje v `src/`, nikdy `index.html`;
> po každé změně `python3 build.py` a testy, hlídá se `!!`; nové chování
> patří do testů; žádná změna nesmí připravit existující profil o postup,
> dotek datového modelu znamená další zamrazený profil ve
> `tests/fixtures/legacy-profiles.json`; cokoli kresleného se vyrenderuje
> a prohlédne; nedotknutelné principy z oddílu 3 se nemění; dokumentace
> podle oddílu 8 plánu včetně označení kroku HOTOVO; kód a komentáře
> anglicky, commit anglicky jednou větou; push ne.
>
> Na konci: aktualizuj celý tenhle soubor (hlavička, stav v číslech, tabulky
> tratí a klíčů, oddíl 12, kontrolní seznam v oddílu 14 s novými čísly,
> prompt pro další session, kde bude dalším úkolem krok G a rozhodnutí R1), ověř, že
> `docs/PLAN.md` má u každého kroku HOTOVO nebo ODLOŽENO s datem, pusť
> všech šest testů naposledy a napiš mi česky, stručně: seznam commitů
> k pushnutí v pořadí, která rozhodnutí padla a proč, co je odložené a proč,
> a co mám prohlédnout sám (obrazovky z kroku C, texty pro děti).
