# Stav projektu a předávací dokument

Poslední aktualizace: 12. září 2026, po světech a mapě

**Novinka nad rámec plánu:** mapa se od teď skládá podle **ročníku**, do kterého
dítě chodí, a učivo dalšího roku je za dílnou pod tlačítkem na ukázku. Je to
`docs/PLAN.md`, krok 4c, a oddíl 7d níž.

**Kde se přestalo a kudy dál:** hotová je **dílna**, druhý režim bez stopek
a bez bodů za rychlost, zatím s jednou zakázkou, penězi. Hotový je **krok 1
z `docs/PLAN.md`**, tedy rodičovská heatmapa nad všemi rodinami a vážený
souhrn, **první dvě položky kroku 2**, tedy `mult_beyond` s `div_beyond`
a trať `beyond`, a `rounding_10` s `rounding_100` a trať `round`, celý
**krok 3**, tedy sbírky vázané na Leitnerovu krabičku, a celý **krok 4**, tedy
čtyři světy a mapa jako krajina s cestou mezi místy.

**Mapa už na hranici není.** Byl to důvod, proč krok 4 nešlo odkládat: patnáct
tratí ve svislém seznamu přestávalo být mapa. Od teď je to krajina a další trať
do ní jen přibude jako další místo.

Na řadě je **zbytek vlny A z kroku 2**, tedy `chain_3`, kapitola 11, a dál podle
oddílu 12b. Hotový prompt je na konci, v oddílu 14.

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
src/i18n.js               všechny texty rozhraní, cs / en / de, 242 klíčů
src/curricula.js          kapitoly učebnic pro volbu podle školy, data, ne kód
src/app.js                engine, obrazovky, interakce
tests/                    regresní testy nad jsdom, viz tests/README.md
tests/fixtures/           zamrazené profily starších verzí, jen se přidávají
docs/PROJECT-STATE.md     tenhle soubor
docs/ROADMAP.md           produktový plán, včetně rešerší o motivaci a inkluzi
docs/PLAN.md              implementační plán, sedm kroků, co se kde mění
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
dvaceti, do tisíce od 0,6 na do stovky. Pojistka: po deseti dojetých závodech na jedné trati se další otevře
tak jako tak. Rodič může každou trať přebít ručně. Trať `school` je vždy otevřená.

**Výběr příkladů.** Váha podle úrovně `[7, 8, 6.5, 3.4, 1.6, 0.8]`, zvýšená
u dlouho neviděných a u těch, kde je víc chyb než úspěchů. Neviděné mají váhu
3,2 a je jich na závod omezený počet. U násobilkových tratí je zhruba sedmdesát
procent otázek z ohniska trati a třicet z dřívějších. Šampionát bere jen to, co
by daná trať právě teď sama nabídla, viz `reachedKeys()`; u stupňovaných tratí,
tedy dvacítky a hodin, tím nemůže podstrčit stupeň, na který dítě ještě nedošlo.

**Stupně přechodu přes desítku.** Trať do dvaceti není jeden pytel příkladů,
má šest stupňů: `e1` obor do deseti a desítka jako sčítanec, `e2` desítkové
spoje bez přechodu, tedy 13 + 4, `e3` přechod přes devítku, `e4` přes osmičku,
`e5` přes sedmičku, `e6` zbytek. Přechod se pozná podle jednotek,
`(a % 10) + (b % 10) > 10`, takže doplnění do celé desítky se za přechod
nepočítá. Příklad patří do stupně svého většího sčítance. Pořadí mostů je převzaté ze čtvrtého dílu Matýskovy matematiky, který
každému věnuje celou kapitolu, desítkové spoje jsou před nimi, protože je
učebnice bere o rok dřív. Platí i bez zvolené učebnice. Závod nese
aktuální stupeň ze sedmdesáti procent, zbytek je opakování už zvládnutých
stupňů, tedy stejný tvar jako u násobilkových tratí. Díky tomu začátečník
potká jen součty do deseti. Aktuální stupeň hledá `as20Stage()` jako první,
kde zvládnutí nedosáhlo 0,7.

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

**Prahy rychlé odpovědi.** Pomalu 5,2 s, normálně 3,8 s, rychle 2,8 s. Bleskově
je zhruba polovina toho. U počítání do sta se prahy násobí 1,9, u počítání do
tisíce 2,2, u hodin 2,4, protože přečíst ciferník a naťukat čtyři číslice trvá
déle než vybavit si spoj.

---

## 4b. Dílna

Druhý režim, postavený v září 2026. Vzniknul proto, že část učiva není fakt
k vybavení, ale malá úvaha, a na úvahu se nesmí pouštět stopky.

**Co tam je.** Karta na mapě pod tratěmi, výrazně jiná než okruhy, teplé barvy
a ikona nářadí. Uvnitř seznam zakázek, zatím jedna, peníze.

**Zakázka** je šest úloh. Aktuální krok nese většinu, dřívější se vracejí jako
opakování, tedy stejný tvar jako u stupňovaných tratí, `focusAndReview()` sdílí
se závodem. Zakázka se nedá prohrát ani nedojet.

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

Patnáct tratí, každá má vlastní generovaný okruh a vlastní prostředí v každém
ze čtyř světů; okruh je na světě nezávislý, mění se jen krajina kolem něj.

| id | ročník | obsah |
| --- | --- | --- |
| t1 | 2 | násobilka 1, 2, 5, 10 |
| t2 | 2 | násobilka 3, 4 |
| t3 | 2 | násobilka 6, 7 |
| t4 | 2 | násobilka 8, 9 |
| t5 | 2 | celá malá násobilka |
| d1 | 2 | dělení |
| beyond | 3 | násobení a dělení mimo malou násobilku, čtyři kbelíky podle toho, co se rozkládá |
| round | 3 | zaokrouhlování, tři kbelíky: desítky do sta, desítky do tisíce, stovky |
| a20 | 1 | sčítání a odčítání do 20, šest stupňů podle přechodu přes desítku |
| a100 | 2 | sčítání a odčítání do 100, pět obtížnostních kbelíků |
| a1000 | 3 | sčítání a odčítání do 1000, šest stupňů podle toho, co se přičítá a jestli se přechází přes stovku |
| clock | 2 | čtení hodin, šest kbelíků přesnosti, otevřená od začátku |
| mix | 2 | vše odemčené dohromady |
| weak | 1 | jen příklady s nejnižší úrovní |
| school | - | učivo vybrané kapitoly učebnice, viz oddíl 11 |

Ročník je rok, ve kterém se učivo trati probírá, odečtený z map učebnic. Mapa
ukazuje letošní ročník a všechny dřívější; co je dál, je za dílnou pod ukázkou.
Podrobnosti v oddílu 7d.

Trať `school` se na mapě objeví jen tehdy, když je v profilu zvolená učebnice
a kapitola, a jde vždy na první místo. Nese název kapitoly jako podtitulek.
V rodičovské sekci nemá přepínač odemknutí, řídí ji volba kapitoly.

Klíče příkladů: `m{a}x{b}` násobení, `d{a}x{b}` dělení, `a{a}p{b}` sčítání do 20,
`s{a}p{b}` odčítání do 20, `p{bucket}` a `n{bucket}` do stovky, `kp{bucket}`
a `kn{bucket}` do tisíce, `xm{bucket}` a `xd{bucket}` za násobilkou,
`o1` až `o3` zaokrouhlování, `c1` až `c6` hodiny. Kanonicky vždy `a <= b`,
komutativita se sbaluje. U dvacítky smí být
druhé číslo i náctka, takže 13 + 4 je `a4p13`; díky tomu generátor ani odčítání
nepotřebují na obor do dvaceti bez přechodu jedinou výjimku.

Klíč začínající písmenem z `FAMILY_HEADS`, tedy `p`, `n`, `c` nebo `k`, není
jeden příklad, ale celá rodina, kterou generátor rozbaluje až v `itemFromKey`.
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
   řídí prostředím trati přes `TOKEN_KIND`, barva je z `ENVS`.
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
řádek textu: `questionHTML()` skládá celý řádek včetně rovnítka nebo ciferníku
a mezi otázkami se přepisuje celý `#qbox`, takže `#abox` se po každé otázce
musí najít znovu. Nikdy nesahej na `#qtext` přes `textContent`, pokud může
nést obrázek. A čtvrtá: CSS třída `.keypad` je odpovídací plocha, `.keypad-pad`
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
patnáct tratí lišících se jen barvou by udělalo z náhledů na mapě ozdobu.
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
a není to tlačítko. Dílna má vlastní místo a vlastní vzhled.

**Rozměry jsou spočítané, ne odhadnuté.** Místo je široké 44 procent a sousedi
jsou po 96 pixelech, takže se dvě místa na téže straně nepřekryjou a dva sloupce
se nedotknou ani na nejužším telefonu. `flow.test.js` to ověřuje polohami, ne
pohledem.

## 7d. Ročník a ukázka dalšího roku

Od září 2026 má profil `grade`, tedy třídu, do které dítě chodí. **Skládá se
podle něj mapa**: jsou na ní tratě letošního ročníku a všech dřívějších.
Rozhoduje `inGrade(p, tr)` a ročník trati je v `TRACKS`, odečtený z map
učebnic, viz tabulka v oddílu 5.

**Dřívější ročník se nikdy neschovává** a žádné tlačítko zpátky není. Učivo
minulého roku prostě zůstává na mapě, protože se k němu stejně vrací
Leitnerova krabička a dítě ho potřebuje dál.

**Ročník se vybírá při zakládání hráče** a nedá se přeskočit; předvolba by byla
tichý odhad, který buď zavalí prvňáka, nebo schová půlku hry třeťákovi. Rodič
ho pak může kdykoli změnit v rodičovské sekci, oddíl Ročník.

**Za dílnou je na konci cesty dveře na příští rok.** Klepnutí rozbalí tratě
následujícího ročníku, dají se rovnou zkusit, ale **nic se tím nepřepíná**:
`PEEK` je proměnná, ne pole v profilu, takže zavření hry i přepnutí hráče
ji složí zpátky. Nabízí se vždycky jen jeden rok dopředu; seznam všeho, co
zbývá, není pozvánka, ale zeď.

**Filtr platí i jinde než na mapě.** Šampionát nesmí podstrčit učivo, které
na mapě ještě není, rodičovská heatmapa a souhrn mluví jen o tom, co dítě
opravdu má, a sbírka mimo ročník se ukáže jen tehdy, když už v ní něco svítí,
což se stane po zkoušce z ukázky.

**Starší profil žádný ročník nemá.** `seedGrade()` mu dá nejvyšší, tedy celou
mapu, protože cokoli nižšího by mu vzalo tratě, které už vidí. Čtyřka znamená
čtvrtou třídu a výš, tedy všechno; čtvrtý ročník v aplikaci zatím není, takže
čtvrťák nemá co ukazovat dopředu a dveře na příští rok se mu neobjeví.

## 8. Testy

V `tests/`, spouštějí se přes node, potřebují jen `jsdom`. Podrobnosti v
`tests/README.md`. Testy načítají sestavený `index.html`, kromě `items.test.js`,
který skládá zdroje přímo, takže před během je nutné pustit `build.py`.

Po každé změně mechaniky pusť `flow.test.js` a `items.test.js`, po každé změně
textů `i18n.test.js` a `names.test.js`, po každém doteku datového modelu
`migration.test.js`. Žádný test nevrací nenulový kód, kontroluje se výskyt `!!`
ve výstupu:

```bash
python3 build.py
for f in tests/*.test.js; do echo "$f"; node "$f" | grep '  !!  '; done
```

`items.test.js` pokrývá šestnáct okruhů: správnost všech generovaných příkladů,
shodu ciferníku s odpovědí včetně úhlů obou ručiček, složení závodu na každé
trati, platnost SVG, konzistenci kurikul, závod podle kapitoly v obou režimech,
stupně přechodu přes desítku, pravidla výběru kapitoly, kbelíky hodin, kroky
do tisíce, u kterých ověřuje i to, že každý kbelík dělá to, co slibuje, a dílnu,
tedy že hltavé drobné jsou opravdu nejmenší, že úloha uzná své vlastní řešení
a že se úloha dílny nemůže dostat do závodu ani zkreslit průměrný čas. K tomu
sbírku, tedy že se místo rozsvítí až na úrovni 4, že po poklesu úrovně nezhasne,
že ho rozsvítí i klíč dílny, že je sbírka trati velká jako trať a že `seedStars()`
dopočítá starší profil; kruh v dílně, tedy počet zakrytých výsečí; a světy, tedy
že každý svět má pro každou trať vlastní prostředí, že žádná paleta nezůstala
nepoužitá, že přepnutí světa nehne učivem, odemčením ani rekordy a že nabídku
jezdců jen řadí; a tvary cest, tedy že okruh zůstal uzavřený, že ostatní světy
vedou z jedné strany na druhou, že cesta nevyjede ze scény a že se patnáct
tratí v jednom světě od sebe pozná; a ročníky, tedy že prvňák nevidí násobilku,
že dřívější ročník nikdy nezmizí, že ukázka nabízí právě jeden rok dopředu
a že šampionát ani rodičovská sekce nemluví o tom, co na mapě není.
`flow.test.js` projede celou hru včetně volby učebnice a závodu s hodinami
a na konci ověří, že rodičovská sekce má blok pro každou rodinu, kterou má
profil v krabičce, a že souhrn nahoře není jen z násobilky. Projde taky celou
zakázku v dílně a hlídá, že se kruh odkrývá po jednom dílu za vyřešenou úlohu,
že opravená úloha odkrývá taky a že je na konci kruh celý i po chybě.
`flow.test.js` navíc projde celý ročníkový tok: založí prvňáka, ověří, že má
krátkou mapu, rozbalí ukázku, spustí z ní trať a zkontroluje, že se ročník
nezměnil a že přepnutí hráče ukázku složí.
`migration.test.js` nabootuje zamrazené profily ze starších verzí a hlídá
pravidlo z oddílu 3, tedy že se nic neztratilo. Fixtury jsou v
`tests/fixtures/legacy-profiles.json` a jen se přidávají, nikdy neupravují.

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

Volba kapitoly bez generátoru nedělala nic. Šla vybrat, poznámka "zatím neumíme"
se v nabídce usekla a rodič si nastavil kapitolu, se kterou se nestalo nic.
Mezikrok s tichým návratem na dřívější kapitolu byl taky špatně, protože
nastavení pořád dělalo něco jiného, než říkalo. Teď je kapitola bez generátoru
nevybratelná, viz princip v oddílu 3.

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

**Volba učebnice patří profilu**, ne aplikaci, protože sourozenci mohou mít
různé učebnice. Profil má `curriculum`, `chapter` a `chapterMode`. Výchozí je
`curriculum: null`, tedy adaptivní režim. Měkký režim serveruje zhruba sedmdesát
procent z aktuální kapitoly a zbytek z dřívějších kapitol podle Leitnerovy
krabičky, tvrdý bere jen aktuální kapitolu. Měkký je výchozí, protože jinak se
rozpadne rozložené opakování.

**Data jsou v `src/curricula.js`.** Tři kurikula pro první až třetí ročník,
95 kapitol, z toho 76 hratelných. Čtvrtý a pátý ročník v aplikaci nejsou,
protože by v nich bylo skoro všechno zamčené; mapy k nim existují v `docs/`.

**Pool je deklarativní.** Kapitola popisuje učivo jako `mult`, `div`, `as20`,
`as100`, `as1000`, `multBeyond`, `divBeyond`, `round` a `clock`, a `poolKeys()` to
překládá na klíče příkladů. Násobení a dělení za násobilkou jsou dvě pole,
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
dojmu. Stav po přidání zaokrouhlování je 76 hratelných
kapitol z 95, po ročnících 15/18, 43/44 a 18/33.

| generátor | vstup | kapitol | kde |
| --- | --- | --- | --- |
| `unit_convert` + `time_convert` | `pad` | 2 | g3: 18, 29 |
| `order_of_ops` | `pad` | 2 | g3: 13, 30 |
| `chain_3` | `pad` | 1 | g3: 11 |
| `mult_div_10_100` + `mult_round` | `pad` | 1 | g3: 28 |
| `missing_operand` + `inverse_check` | `pad` | 1 | g3: 5 |
| `div_remainder` | `pad2` | 1 | g3: 27 |
| `place_value` | `pad3` | 1 | g3: 21 |
| `parity` + `digit_count` | `pick` | 1 | g3: 6 |
| `compare_numbers` + `compare_units` | `cmp` | 2 | g3: 17, 22 |
| `fraction_read` | `frac`, dílna | 2 | g3: 19, 32 |
| `written_mult` | `col`, dílna | 1 | g3: 15 |
| `count_objects` | dílna | 3 | g1: 1, 2, 3 |

`finance_money` byl v téhle tabulce poslední a je hotový, viz oddíl 4b.
`mult_beyond` s `div_beyond` byl první a je taky hotový, viz oddíl 5, trať
`beyond`; odemkl kapitoly 14, 16 a 31. `rounding_10` s `rounding_100` byl druhý,
trať `round`, kapitoly 7 a 26.

**Hlavní zjištění.** Sedm z patnácti zbylých zamčených kapitol třetí třídy
nepotřebuje na vstupu vůbec nic nového, stačí generátory na `pad`. Třetí třída
tím jde z 18/33 na 25/33, aniž by se sáhlo na klávesnici.

**`written_add_sub` neodemkne ani jednu kapitolu**, i když ho mapa druhé třídy
posunula v prioritě nahoru. Kapitoly, ve kterých se objevuje, jsou hratelné už
teď přes `as100`. Je to prohloubení, ne odemčení, a navíc potřebuje dílnu.

**Zbytek prvního ročníku čeká na `count_objects`.** Kapitoly 1 až 3 jsou
počítání předmětů na obrázku, nic pro závod. Dílna, do které patří, už stojí,
takže zbývá jen ten generátor a kresba počítaných věcí.

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
a `div_beyond`, první položka vlny A, a `rounding_10` s `rounding_100`, druhá.
Dál `chain_3`, `order_of_ops`, `mult_div_10_100`
a `mult_round`, `unit_convert` a `time_convert`, nakonec `missing_operand`
a `inverse_check`, protože to nejsou samostatné rodiny, ale modifikátory
existujících, a to je jiný typ zásahu do `itemFromKey`.

Teprve pak nové vstupní prvky: `pad2` a `div_remainder`, `pad3` a `place_value`,
`pick` a dvojice `parity` s `digit_count`, úplně nakonec `cmp` a porovnávání.

**Dílna měla být až po tom všem, ale předběhla**, protože se ukázalo, že čtyři
kapitoly nečekají na nic jiného a že bez ní nejde říct, kam patří slovní úlohy.
Stojí, takže další témata dílny jsou od téhle chvíle jen další zakázka:
`count_objects` pro první ročník a `word_problem` pro slovní úlohy, kterých je
třetí ročník plný.

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
zatím 2,4 pro hodiny, 2,2 pro počítání do tisíce a 1,9 pro počítání do sta.
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

Tohle projela tisícovka a sedělo to do puntíku. V `src/app.js`: písmeno hlavičky
klíče do `FAMILY_HEADS`, definice kbelíků nebo stupňů, generátor, větev
v `rawItem()`, `poolKeys()`, `trackKeys()`, `reachedKeys()` pokud má stupně,
vlastní `*Stage()` přes `stageIndex()`, větev v `buildRun()` přes
`focusAndReview()`, záznam v `TRACKS` včetně **ročníku**, bez kterého se trať
neobjeví nikomu na mapě, záznam v `ENVS` **a prostředí ve všech třech
zbylých světech ve `WORLDS`**, jinak bude nová trať ve stezce, na obloze
i v hlubině vypadat jako v okruhu; paleta si rovnou řekne přes `tok`, co se v ní
sbírá. Dál větev v `unlockState()`,
násobitel v `thresholds()` a `maxLen` na položce, pokud odpověď přeleze tři
číslice, a blok v `heatSpecs()`, jinak ji rodič v heatmapě neuvidí. Dál kapitoly
v `src/curricula.js` a dvojice textů `trk_*` a `trk_*s` ve všech třech jazycích
v `src/i18n.js`.

V `tests/items.test.js`: export nových symbolů v `module.exports` na konci
skládaného zdroje, řádek do tabulky `RANGE`, klíče do seznamu `keys` i do
množiny `VALID` a vlastní okruh, který ověří, že každý kbelík dělá to, co
slibuje. V `tests/flow.test.js` sedí natvrdo počet okruhů na mapě a počet
zamčených kapitol, obojí je potřeba posunout.

### Prompt pro nejbližší krok

Použij tenhle, pokud se pokračuje tam, kde se přestalo. Další kroky mají
v `docs/PLAN.md` vlastní zadání a stačí v tomhle promptu vyměnit odstavec
s dnešním úkolem.

**Kde přesně stojíme.** Kroky 1, 3 a 4 jsou hotové, tedy všechno, co něco
přestavuje. Z kroku 2, vlny A, jsou hotové dvě položky ze sedmi. Zbytek plánu
už jsou samostatné přírůstky a pořadí mezi nimi je volné:

- **Zbytek vlny A**, tedy `chain_3`, pak `order_of_ops`, `mult_div_10_100`
  s `mult_round`, `unit_convert` s `time_convert` a nakonec `missing_operand`
  s `inverse_check`. Kontrolní seznam pro novou rodinu je nad tímhle promptem
  a od kroku 4 je v něm navíc prostředí ve všech čtyřech světech.
- **Krok 5, vlna B**, tedy `pad2` a dělení se zbytkem. Před ním je půl dne
  práce na víc políčkách v `tap()`, `typedText()` a `questionHTML()`.
- **Krok 6, další zakázka do dílny**, nejspíš `count_objects`, což je poslední
  díra v celém prvním ročníku.

> Pokračujeme v projektu Math Fact Racer, hra na procvičování počítání pro mého
> osmiletého syna, repozitář `~/Dokumenty/Kladska/math-fact-racer`.
>
> Přečti si celý `docs/PROJECT-STATE.md` kvůli stavu a mechanice, pak
> `docs/PLAN.md` kvůli tomu, co se dělá dál a v jakém pořadí, a `src/app.js`
> kvůli kódu. `docs/ROADMAP.md` čti jen tehdy, když potřebuješ vědět, proč je
> něco navržené tak, jak je; jsou tam odkazy na studie.
>
> Dneska chci `chain_3` z kroku 2, tedy třetí položku vlny A, kapitolu 11
> třetího ročníku. Hlavička klíče `q`, kbelíky podle oboru. Drž se kontrolního
> seznamu pro novou rodinu z oddílu 14, hlavně násobitele v `thresholds()`,
> bloku v `heatSpecs()` a prostředí ve všech čtyřech světech.
>
> Zdroje se editují v `src/`, nikdy ne `index.html`. Po každé změně `python3
> build.py` a pak testy z `tests/`, hlídá se výskyt `!!` ve výstupu. Nové
> chování patří do testů, ne jen do kódu. Žádná změna nesmí připravit existující
> profil o postup, hlídá to `tests/migration.test.js`, a pokud sáhneš na datový
> model, přidej do `tests/fixtures/legacy-profiles.json` další zamrazený profil.
>
> Piš mi česky, kód a komentáře anglicky, stručně a bez vaty. Nedotknutelné
> principy z oddílu 3 neměň bez mého pokynu. Push dělám sám, jen commituj
> a řekni mi, co poslat.
