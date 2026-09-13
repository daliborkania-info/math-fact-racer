# Stav projektu a předávací dokument

Poslední aktualizace: 13. září 2026, po krocích A, B0, B, opravě B0b, celém kroku C,
první položce kroku D nového plánu a opravě řazení mapy (C3b)

**Kde se přestalo.** Z `docs/PLAN.md` je hotový **krok 1** (rodičovská heatmapa
nad všemi rodinami), **první dvě položky kroku 2** (`mult_beyond` s `div_beyond`
a trať `beyond`, `rounding_10` s `rounding_100` a trať `round`), celý **krok 3**
(sbírky vázané na Leitnerovu krabičku, včetně dílny) a celý **krok 4** (čtyři
světy a mapa jako krajina). K tomu dvě věci, které v plánu nebyly a přišly ze
zadání a z hraní, kroky **4c** a **4d**: ročník v profilu s ukázkou dalšího roku,
a rozdělení prvního ročníku na šest číselných oborů.

**Stav v číslech.** Třiadvacet tratí ve čtyřech světech, 92 palet prostředí,
dvě zakázky v dílně, 82 hratelných kapitol z 95 (první ročník 18/18, druhý 43/44,
třetí 21/33), tři jazyky, šest testových souborů.

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

**Na řadě je zbytek kroku D** (D2 až D4), tedy zbývající rodiny na číselné
klávesnici, a dál podle `docs/PLAN.md`. Hotový prompt je na konci, v oddílu 14.

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
src/i18n.js               všechny texty rozhraní, cs / en / de, 332 klíčů
src/curricula.js          kapitoly učebnic pro volbu podle školy, data, ne kód
src/app.js                engine, obrazovky, interakce
tests/                    regresní testy nad jsdom, viz tests/README.md
tests/fixtures/           zamrazené profily starších verzí, jen se přidávají
docs/PROJECT-STATE.md     tenhle soubor
docs/ROADMAP.md           produktový plán, včetně rešerší o motivaci a inkluzi
docs/PLAN.md              implementační plán, verze 2 ze 13. září: kroky A až G, co se kde mění
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
`sceneSVG()`, `sceneThumb()`, `tokenSVG()` nebo `partsTraySVG()`, výsledek uložit
do souboru a převést na obrázek přes `convert`. Tímhle se chytila hnědá obloha,
rudé moře i fialová louka, a žádný test by je nenašel. Pozor, `convert`
ignoruje `stroke-dashoffset`, takže čára postupu vypadá vždycky dojetá až do
konce; v prohlížeči je to správně.

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
ročníku je `chain`, `ops`, `beyond`, `round`, `a1000`.

**Co se počítá dřív.** `ops`, kapitoly 13 a 30 třetího ročníku. Čtyři kbelíky
na dvou osách, tedy bez závorek a se závorkami, nejdřív do sta a pak do tisíce:
`z1` bez závorek do sta (`4 + 3 × 5`), `z2` se závorkami do sta (`(4 + 3) × 5`),
`z3` bez závorek do tisíce (`300 + 7 × 8`), `z4` se závorkami do tisíce
(`500 - (40 + 30)`). Stejný tvar jako ostatní stupňované tratě, aktuální kbelík
nese sedmdesát procent závodu, hledá ho `opsStage()`. Násobí a dělí se **jen
v oboru malé násobilky** a dělení vždycky vyjde beze zbytku, protože trať se
otevírá na násobilce a nic jiného v celé hře zatím `360 : 4` neučí; to je
rodina `tens` z kroku D2, která není. Z toho plyne tvar čtvrtého kbelíku:
dokud je stropem malá násobilka, nemůže příklad, který se násobí nebo dělí
jako poslední, přelézt stovku, takže do tisíce roste čtvrtý kbelík na straně
sčítání a jeho závorka je ta, která výsledek opravdu mění, `a - (b + c)`.
Čtená zleva doprava by vyšla jinak, a přesně to si má dítě všimnout. Staví se
konstrukcí rozsahů, ne ořezem: nejdřív se losuje násobící člen a pak číslo
z rozsahu, který kbelík už drží, takže se nic nedodatečně neupravuje a žádný
mezivýsledek neklesne pod nulu.

**Prahy rychlé odpovědi.** Pomalu 5,2 s, normálně 3,8 s, rychle 2,8 s. Bleskově
je zhruba polovina toho. U počítání do sta se prahy násobí 1,9, u počítání do
tisíce 2,2, u zaokrouhlování 2,0, u řetězce taky 2,0, protože jsou to dvě
operace místo jedné, u pořadí operací 2,4, protože k těm dvěma operacím
přibývá rozhodnutí, která z nich jde první, u hodin taky 2,4, protože přečíst ciferník a
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
správný tvar, tedy klíč k obsahu místo platu za výkon. Co s nimi, až budou
všechny nátěry koupené, je rozhodnuté v `docs/PLAN.md`, krok 3b, ale zatím
neudělané: číslo se má tehdy přestat tvářit jako peněženka a začít říkat, kolik
práce je hotové celkem. Do doby, než někdo utratí 390 součástek, to nikoho
netlačí.

**Klíče dílny začínají na `w`.** Ukládají se do stejné Leitnerovy krabičky jako
příklady, ale žádný pool závodu je vyrobit neumí a trať "co ti nejde" je
vyfiltruje. `record()` s `ms = null` posune úroveň bez měření času a nezapočítá
se do průměrné doby odpovědi.

## 5. Trati

Třiadvacet tratí, každá má vlastní generovanou cestu a vlastní prostředí
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
| round | 3 | 3 | zaokrouhlování, tři kbelíky: desítky do sta, desítky do tisíce, stovky |
| a3, a5, a7, a10, a15, a20 | 1 | 2 | šest oborů prvního ročníku, sčítání a odčítání bez přechodu přes desítku, viz oddíl 4 |
| bridge | 2 | 2 | sčítání a odčítání s přechodem přes desítku, čtyři mosty |
| a100 | 2 | 3 | sčítání a odčítání do 100, pět obtížnostních kbelíků |
| a1000 | 3 | 3 | sčítání a odčítání do 1000, šest stupňů podle toho, co se přičítá a jestli se přechází přes stovku |
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
operací, `c1` až `c6`
hodiny. Kanonicky vždy `a <= b`,
komutativita se sbaluje. U dvacítky smí být
druhé číslo i náctka, takže 13 + 4 je `a4p13`; díky tomu generátor ani odčítání
nepotřebují na obor do dvaceti bez přechodu jedinou výjimku.

Klíč začínající písmenem z `FAMILY_HEADS`, dnes `p`, `n`, `c`, `k`, `x`, `o`,
`q` a `z`,
není jeden příklad, ale celá rodina, kterou generátor rozbaluje až v `itemFromKey`.
Proto se v `poolSize` počítá za čtyři a proto `buildRun` na konci přegeneruje
otázku, která by vyšla stejně jako ta předchozí. Každý další kbelíkový generátor
přidá písmeno do `FAMILY_HEADS`, nic víc.

Rodina do tisíce nese znaménko uvnitř klíče, tedy jedna hlavička `k` místo
dvojice písmen jako u stovky. Bylo to vědomé šetření: míst v abecedě je
šestadvacet a plánovaných generátorů kolem dvaceti. Rodina za násobilkou
to dělá stejně, `x` plus `m` nebo `d`.

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

Migrace při načtení: každý profil dostane startovní šestku závodníků a jazyk,
pokud je nemá, `normalizeChapter()` srovná kapitolu, `seedOpened()` doplní
seznam otevřených tratí, `seedShop()` prázdnou dílnu, `seedStars()` sbírku
`seedWorld()` svět a `seedGrade()` ročník. Nové migrace patří do `load()`, a pokud se týkají
profilu jako celku, taky do větve `import`.

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
4. Závodníci a kresba postaviček. Všechno parametricky, `petSVG` a `rideSVG`.
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
stejně jako u hodin.

**Pozor na čtyři pasti.** `t` je překladová funkce. Nikdy nepojmenovávej lokální
proměnnou `t`, zvlášť ne pro objekt trati. Používá se `tr`. Tohle už jednou
způsobilo chybu. Rozbalovací nabídka potřebuje `change`, ne `click`, takže
nové `<select>` musí mít obsluhu v tom druhém posluchači. A otázka není vždycky
řádek textu: `questionHTML()` vrací **celý prvek `#qbox`** včetně rovnítka nebo
ciferníku, odpovídacího políčka a třídy podle délky zadání, a mezi otázkami se
ten prvek vyměňuje přes `outerHTML`, takže `#abox` se po každé otázce musí najít
znovu. Nikdy nesahej na `#qtext` přes `textContent`, pokud může nést obrázek.
**Dlouhé zadání si samo řekne o menší písmo.** `questionSize()` měří řádek tak,
jak se kreslí, tedy **včetně mezer**, a dá `#qbox` třídu `q-long` od devíti
znaků a `q-xlong` od třinácti; `47 + 5 - 3 = ?` se v plné velikosti na 375 px
telefon nevejde. Mezery se počítají schválně: bez nich má právě tenhle příklad
šest znaků a propadl by. Dnes to potkává celý řetězec a první stupeň tisícovky,
tedy `300 + 200`, což jsou opravdu nejširší řádky ve hře. Řádek se navíc smí
zalomit, takže `= ?` spadne na druhý řádek dřív, než by se cokoli uřízlo. A čtvrtá: CSS třída `.keypad` je odpovídací plocha, `.keypad-pad`
je konkrétní rozvržení číselné klávesnice. Jméno `pad3` je v katalogu témat
vyhrazené pro vstupní prvek se třemi políčky, takže se na rozvržení používat
nesmí, i když jsou to zrovna tři sloupce.

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
a jsou to barvy okruhu, **nesahat na ně**; zbylých pětačtyřicet se generuje
funkcí `pal(odstín země, odstín porostu, světlost, co se sbírá, volitelné)`,
takže další svět stojí patnáct krátkých řádků, ne šedesát ručně míchaných barev.

**`hill1` je vždycky horní konec přechodu a `hill2` spodní.** Na zemi to znamená
světleji nahoře a tmavěji dole, jak vypadá louka. Obloha je obráceně, tmavší
nahoře a jasná u obzoru, a moře je nahoře voda a dole dno, takže tyhle palety
si druhý konec řeknou samy přes `h2` a `l2`. Pravidlo, které z toho plyne:
**u oblohy zůstává horní konec v modrých a u hlubiny taky**, charakter místa
nese ten spodní. Bez toho vyšlo rudé moře a hnědá obloha. `sat` je pro kámen,
mlhu a bouřku, které musí být tlumené.

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

`items.test.js` pokrývá dvaadvacet okruhů: správnost všech generovaných příkladů,
shodu ciferníku s odpovědí včetně úhlů obou ručiček, složení závodu na každé
trati, platnost SVG, konzistenci kurikul, závod podle kapitoly v obou režimech,
stupně přechodu přes desítku, pravidla výběru kapitoly, kbelíky hodin, kroky
do tisíce, u kterých ověřuje i to, že každý kbelík dělá to, co slibuje, pořadí
operací, u kterého si výsledek počítá sám a s pravidlem o přednosti, ne přes
`eval`, protože právě to pravidlo se testuje, a hlídá u něj i to, že dělení
nikdy nezbývá, že se nikde nepočítá pod nulu a že by se většina zadání čtená
zleva doprava vyhodnotila jinak, a dílnu,
tedy že hltavé drobné jsou opravdu nejmenší, že úloha uzná své vlastní řešení
a že se úloha dílny nemůže dostat do závodu ani zkreslit průměrný čas, a u
počítání dílků, že je jich na obrázku přesně tolik, kolik je odpověď. K tomu
sbírku, tedy že se místo rozsvítí až na úrovni 4, že po poklesu úrovně nezhasne,
že ho rozsvítí i klíč dílny, že je sbírka trati velká jako trať a že `seedStars()`
dopočítá starší profil; kruh v dílně, tedy počet zakrytých výsečí; a světy, tedy
že každý svět má pro každou trať vlastní prostředí, že žádná paleta nezůstala
nepoužitá, že přepnutí světa nehne učivem, odemčením ani rekordy a že nabídku
jezdců jen řadí; a tvary cest, tedy že okruh zůstal uzavřený, že ostatní světy
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
`flow.test.js` má od kroku D1 186 kontrol, po kroku C jich bylo 184, po kroku
B0b 175, po kroku B0 170 a po kroku A 153. Dvě přibyly v D1: pořadí operací
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
95 kapitol, z toho 82 hratelných. Čtvrtý a pátý ročník v aplikaci nejsou,
protože by v nich bylo skoro všechno zamčené; mapy k nim existují v `docs/`.

**Pool je deklarativní.** Kapitola popisuje učivo jako `mult`, `div`, `as20`,
`as100`, `as1000`, `multBeyond`, `divBeyond`, `round`, `clock`, `chain` a `ops`,
a `poolKeys()` to překládá na klíče příkladů. Násobení a dělení za násobilkou jsou dvě pole,
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
dojmu. Stav po přidání pořadí operací je 82 hratelných
kapitol z 95, po ročnících 18/18, 43/44 a 21/33; první ročník je tím celý.

| generátor | vstup | kapitol | kde |
| --- | --- | --- | --- |
| `unit_convert` + `time_convert` | `pad` | 2 | g3: 18, 29 |
| `mult_div_10_100` + `mult_round` | `pad` | 1 | g3: 28 |
| `missing_operand` + `inverse_check` | `pad` | 1 | g3: 5 |
| `div_remainder` | `pad2` | 1 | g3: 27 |
| `place_value` | `pad3` | 1 | g3: 21 |
| `parity` + `digit_count` | `pick` | 1 | g3: 6 |
| `compare_numbers` + `compare_units` | `cmp` | 2 | g3: 17, 22 |
| `fraction_read` | `frac`, dílna | 2 | g3: 19, 32 |
| `written_mult` | `col`, dílna | 1 | g3: 15 |

`finance_money` byl v téhle tabulce poslední a je hotový, viz oddíl 4b.
`mult_beyond` s `div_beyond` byl první a je taky hotový, viz oddíl 5, trať
`beyond`; odemkl kapitoly 14, 16 a 31. `rounding_10` s `rounding_100` byl druhý,
trať `round`, kapitoly 7 a 26. `chain_3` byl třetí, trať `chain`, kapitola 11,
a `order_of_ops` čtvrtý, trať `ops`, kapitoly 13 a 30.

**Hlavní zjištění.** Čtyři ze dvanácti zbylých zamčených kapitol třetí třídy
nepotřebují na vstupu vůbec nic nového, stačí generátory na `pad`. Třetí třída
tím jde z 21/33 na 25/33, aniž by se sáhlo na klávesnici.

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

Pořadí, na kterém jsme se dohodli: nejdřív všechno, co jde na `pad`. `add_sub_1000`
je z toho hotový, byla to páteř osmého dílu a architektonicky
jen další sada kbelíků vedle `add_sub_100`. Hotové je i `mult_beyond`
a `div_beyond`, první položka vlny A, `rounding_10` s `rounding_100`, druhá,
`chain_3`, třetí, a `order_of_ops`, čtvrtá. Dál `mult_div_10_100`
a `mult_round`, `unit_convert` a `time_convert`, nakonec `missing_operand`
a `inverse_check`, protože to nejsou samostatné rodiny, ale modifikátory
existujících, a to je jiný typ zásahu do `itemFromKey`.

Teprve pak nové vstupní prvky: `pad2` a `div_remainder`, `pad3` a `place_value`,
`pick` a dvojice `parity` s `digit_count`, úplně nakonec `cmp` a porovnávání.

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
zatím 2,6 za násobilkou, 2,4 pro hodiny, 2,2 pro počítání do tisíce, 2,0 pro
zaokrouhlování i pro řetězec a 1,9 pro počítání do sta. Kdo na to zapomene, dostane
prahy pro jednociferné vybavování a děti budou mít samé pomalé odpovědi.
Tohle je jediná věc, na kterou se v téhle vlně dá zapomenout tiše.

Odpověď nad 999 potřebuje `maxLen: 4` přímo na položce, jinak ji nejde doťukat.
Výchozí jsou tři znaky. `items.test.js` to hlídá, takže `add_sub_1000` bez toho
neprojde, ale je dobré na to myslet rovnou.

Do tabulky `RANGE` v `items.test.js` si každá nová rodina dopíše svůj rozsah
odpovědi. Bez toho test skončí hláškou, že rodina nemá uvedený rozsah. Je to
schválně jediné místo, kde se test musí rozšířit ručně spolu s kódem.

**B. Nové vstupní prvky, tedy `pad2`, `pad3`, `cmp`, `pick`.**

Porovnání odpovědi už přes `item.check()` prochází, ale zadávání pořád počítá
s jedním polem: `RUN.typed` je jeden řetězec, `#abox` je jeden prvek a
`typedText()` vrací jeden řetězec. Dvě políčka potřebují pojem aktivního
políčka, přeskok po naplnění, mazání přes hranici a druhý `id`. To je zbylá
práce na `pad2`, ale je to už jen `tap()`, `typedText()` a `questionHTML()`,
ne celá dráha. U hodin šla použít finta hodina krát sto plus minuty, u dělení
se zbytkem je křehká, protože nerozliší špatný zápis od špatného výsledku, takže
`check` tam má dostat opravdové dvě hodnoty.

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

V CSS je políčko odpovědi široké nejmíň 104 pixelů a klávesnice má pevně tři
sloupce. Dvě nebo tři políčka vedle sebe se do řádku nevejdou a tři velká
tlačítka do třísloupcového gridu jen náhodou. Rozměry jsou navíc zopakované
podruhé v media query pro nízké displeje.

**C. Viditelnost pro rodiče. Hotovo, září 2026.** Heatmapa byla doslova tabulka
jedenáct krát jedenáct pro malou násobilku a souhrn nahoře počítal taky jen
z násobilky, takže dítě, které dva měsíce jede sčítání do sta, vidělo nula
procent. Teď je to komponenta, podrobnosti v oddílu 7b. Nová rodina si dopíše
jeden řádek do `heatSpecs()` a je vidět.

**D. Pasti, na které se dá naběhnout.**

Hlavička klíče je jedno písmeno a `key.slice(1)` to předpokládá na čtyřech
místech. Obsazené je `m` násobení, `d` dělení, `a` sčítání do 20, `s` odčítání
do 20, `p` a `n` kbelíky do sta, `k` celý obor do tisíce včetně znaménka,
`x` násobení a dělení za násobilkou včetně znaménka,
`o` zaokrouhlování, `c` hodiny. Rezervované je `r` pro dělení se
zbytkem. Pozor na `h`, to je vnitřní id kbelíků do sta a klíč vzniká slepením
`"p" + "h1"`; jako hlavička rodiny by se to pralo. Stejně tak `b` je vnitřní id
kbelíků do tisíce. Míst je šestadvacet a
plánovaných generátorů kolem dvaceti, takže nová rodina se znaménkem ho má
nést uvnitř klíče jako tisícovka, ne brát si dvě písmena jako stovka.

Kbelíky mají dvě různé konvence: `c1` je rovnou celý klíč, `h1` a `b1` se
prefixují. Nová kbelíková rodina si musí vědomě vybrat jednu.

Tiché nouzové cesty schovávají chyby. Neznámý klíč vrátí z `itemFromKey()`
příklad 1 + 1, prázdný pool spadne v `buildRun()` na malou násobilku a chybějící
prostředí na louku. Při vývoji nové rodiny to vypadá, že to skoro funguje.

**E. Co blokátor není, i když to tak vypadá.** Service worker má cache
pojmenovanou `math-fact-racer-v1` a nemění se, ale načítá se ze sítě jako
první a cache je jen záloha pro offline, takže aktualizace se k dětem dostane.
`record()`, `mastery()`, `sampleKeys()`, `pickWeight()` a celá geometrie okruhu
jsou nad klíčem skutečně obecné a nepotřebují sáhnout vůbec.

**Co z toho je teď na řadě.** Rodiny na klávesnici jdou psát rovnou, cesta je
volná. Před prvním `pad2` zbývá dodělat víc políček v `tap()`, `typedText()`
a `questionHTML()`, což je odhadem půl dne. Heatmapa v rodičovské sekci je
samostatný kus práce, který nikoho neblokuje, ale s každou další rodinou je
ta obrazovka nepravdivější.

## 12d. Pilot pro `pad2`

**Dělení se zbytkem.** Kapitola 27 mapy třetího ročníku, strany 30 až 35
osmého dílu. Je to jádrová látka třetí třídy, sešit jí věnuje tři dvoustrany,
nejvíc ze všech témat obou dílů, a celá se odehraje uvnitř existujícího závodu.
Potřebuje jediný nový vstupní prvek, druhé políčko na zbytek.

Sešit ji staví v pořadí, které stojí za to zachovat: vyznačení násobků dělitele
na číselné ose, výpočet podílu a zbytku, obrácená úloha na doplnění dělence,
slovní úloha, kde je zbytek smyslem zadání. Dělitele bere po dvojicích 2 a 3,
4 a 5, 6 a 7, 8 a 9, pak 10 a nakonec smíšené opakování, což je hotová osnova
pro pět podkapitol nebo pět tratí.

Co je k tomu potřeba: klíč příkladu `r{dělenec}x{dělitel}`, vstupní prvek `pad2`
se dvěma políčky, rozšíření `poolKeys()` o `divrem`, doplnění kapitoly 27 v
`src/curricula.js` a texty ve třech jazycích. Typická chyba je zbytek větší nebo
rovný děliteli, na to má chybová hláška reagovat konkrétně.

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
10. `maxLen` na položce, pokud odpověď přeleze tři číslice
11. blok v `heatSpecs()`, jinak ji rodič v heatmapě neuvidí

**Dál:** kapitoly v `src/curricula.js` a dvojice textů `trk_*` a `trk_*s` ve všech
třech jazycích v `src/i18n.js`.

**Délku otázky řešit nemusíš**, `questionSize()` ji měří sama a dlouhý řádek
dostane menší písmo; od řetězce tří čísel to platí pro každou rodinu. Co stojí
za kontrolu na obrázku, je jen to, jestli se nejdelší zadání té rodiny opravdu
vejde na 360 px.

**V `tests/items.test.js`:** export nových symbolů v `module.exports` na konci
skládaného zdroje, řádek do tabulky `RANGE`, klíče do seznamu `keys` i do množiny
`VALID` a vlastní okruh, který ověří, že každý kbelík dělá to, co slibuje.

**V `tests/flow.test.js` sedí natvrdo tahle čísla** a každá nová trať je posune.
Od kroku B0 se měří zvlášť složená a rozbalená mapa, viz oddíl 7d, a od D1
platí tahle: třeťák má složeno 15 různých cest a 17 míst (1 dveře, 15 tratí
letoška, dílna) a rozbaleno 22 cest a 24 míst, za dveřmi má 7 tratí; druhák má
18 míst bez dveří a bez milníku a k tomu dveře dopředu; prvňák má 8 a dveře
zpátky nemá; čtvrťák vidí celou mapu, tedy 23 míst a žádné dveře ani milník.
Dál sedí počet tratí v ukázce druhého ročníku (10) a počet zamčených kapitol
třetí třídy (12 z 33).

**Nová zakázka do dílny** je jiný seznam a je kratší: záznam v `JOBS` včetně
`grade`, generátor úlohy vedle `moneyItem()` a `countItem()`, větev v
`jobItemFromKey()`, texty `job_*`, `heat_w*` a zadání úlohy ve třech jazycích,
a pokud potřebuje jiný vstupní prvek než mince a dílky, větev v `trayHTML()`,
`counterHTML()` a `solutionHTML()`.

### Prompt pro nejbližší krok

Použij tenhle, pokud se pokračuje tam, kde se přestalo. Další kroky mají
v `docs/PLAN.md` vlastní zadání a stačí v tomhle promptu vyměnit odstavec
s dnešním úkolem.

**Kde přesně stojíme.** Kroky 1, 3 a 4 starého plánu jsou hotové, k tomu 4c
a 4d. Z vlny A jsou hotové čtyři položky ze sedmi. Revize ze 13. září sepsala
`docs/PLAN.md` verze 2 s kroky A až G; hotové jsou A, B0, B, oprava B0b, celý
krok C (responzivita ve dvou commitech, druhý s písmem podle ročníku a šestým
testovým souborem) a D1 (pořadí operací, trať `ops`), nejbližší je zbytek kroku
D, tedy D2 až D4, každá rodina vlastní subagent a vlastní commit. Z rozhodnutí
v oddílu 9 plánu padla R4 (řetězec před `beyond`), R7 (vynulování nechá
nastavení), R6 (tři sloupce mapy na tabletu, čtyři od 900 px) a R5 (měřítka
písma 1,25 / 1,12 / 1,04 / 1,0), všechna podle doporučení. R1 (žebřík minulých
let) je odložené a po B0b už není naléhavé, viz hlavička.

**Co je čerstvě hotové a nesmí se rozbít.** Sbírka vázaná na krabičku se nikdy
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
> `git log -1 --stat`, a teprve pak zadej další krok. Po každé části kroku C
> pusť kontrolního subagenta podle oddílu 10 a jeho nálezy dej opravit dalšímu
> subagentovi, než půjdeš dál. Když subagent hlásí rozpor s plánem, rozhodni
> autonomně podle plánu.
>
> Dneska chci krok C, tedy responzivitu a písmo podle ročníku, ve dvou
> subagentech a dvou commitech přesně podle oddílu 10 plánu: první dostane
> C1 až C3 a C5 (závod a dílna na šířku, mapa podle šířky, drobnosti a
> manifest), druhý C4 a C7 (měřítko písma podle ročníku a nový
> `tests/style.test.js`). Rozhodnutí z oddílu 9 plánu, která se kroku týkají
> (R5 měřítka písma, R6 mapa na tabletu), ber podle doporučení a řekni to
> subagentovi v zadání; R1 (žebřík minulých let) zatím nedělej.
>
> Obrazovky z kroku C se v sandboxu prohlédnout nedají, jsdom rozvržení nemá.
> Až bude krok hotový, řekni mi, které rozměry mám projít sám, nebo mi nabídni,
> že `dist/artifact.html` nahraješ do mého artefaktu na claude.ai a prohlédneš
> si ho ve vestavěném prohlížeči s emulací rozměrů.
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
> úkolem byl krok D (D1 až D4, každá rodina vlastní subagent a vlastní
> commit), a ověř, že subagenti označili hotové kroky v `docs/PLAN.md`.

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
