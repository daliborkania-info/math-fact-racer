# Stav projektu a předávací dokument

Poslední aktualizace: 9. září 2026

Tenhle soubor je psaný tak, aby se dal na začátku nové konverzace předat celý jako
kontext. Obsahuje rozhodnutí, která už padla, mechaniku hry do detailu, architekturu
kódu, seznam opravených chyb, které se nesmí vrátit, a plán dalšího kroku.

**Pokud jsi nová session, začni tímhle:** přečti tenhle soubor celý, pak `README.cs.md`
kvůli zdůvodnění mechaniky a `src/app.js` kvůli kódu. Nepřepisuj hotová rozhodnutí
z oddílu Nedotknutelné principy, aniž by o to uživatel výslovně požádal, jsou to
odpovědi na konkrétní výzkum a na testování s dítětem.

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
src/index.template.html   kostra dokumentu se třemi značkami
src/styles.css            všechny styly
src/i18n.js               všechny texty rozhraní, cs / en / de, 173 klíčů
src/app.js                engine, obrazovky, interakce
tests/                    regresní testy nad jsdom, viz tests/README.md
docs/PROJECT-STATE.md     tenhle soubor
README.md                 anglické README, hlavní, odkazuje na české
README.cs.md              české README s podrobným zdůvodněním mechaniky
manifest.webmanifest      pro přidání na plochu telefonu
sw.js                     drobná offline cache pro hostovanou kopii
icon.svg, icon-*.png      ikony aplikace
dist/artifact.html        build bez obalu html/head/body, negitovaný
```

Po každé změně ve `src/` je nutné spustit `python3 build.py`. Editovat přímo
`index.html` je chyba, přepíše se.

---

## 3. Nedotknutelné principy

Tyhle věci se nemění bez výslovného pokynu uživatele. Každá je odpovědí na
konkrétní zjištění z výzkumu, podrobné zdůvodnění včetně odkazů je v `README.cs.md`.

Odpověď se píše na číselné klávesnici, nikdy se nevybírá z možností. Vybavení
z paměti staví paměťovou stopu, poznávání ne.

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

**Odemykání.** Prahy zvládnutí: t2 od 0,7 na t1, t3 od 0,7 na t2, t4 od 0,7 na
t3, t5 od 0,65 na t4, dělení od 0,55 celé násobilky, do stovky od 0,6 na do
dvaceti. Pojistka: po deseti dojetých závodech na jedné trati se další otevře
tak jako tak. Rodič může každou trať přebít ručně.

**Výběr příkladů.** Váha podle úrovně `[7, 8, 6.5, 3.4, 1.6, 0.8]`, zvýšená
u dlouho neviděných a u těch, kde je víc chyb než úspěchů. Neviděné mají váhu
3,2 a je jich na závod omezený počet. U násobilkových tratí je zhruba sedmdesát
procent otázek z ohniska trati a třicet z dřívějších.

**Stupně přechodu přes desítku.** Trať do dvaceti není jeden pytel příkladů,
má pět stupňů podle toho, jak těžký je most přes desítku: bez přechodu a s
desítkou jako sčítancem, pak přechod přes devítku, přes osmičku, přes sedmičku
a nakonec zbytek. Příklad patří do stupně svého většího sčítance. Pořadí je
převzaté ze čtvrtého dílu Matýskovy matematiky, který každému věnuje celou
kapitolu, a platí i bez zvolené učebnice. Závod nese aktuální stupeň ze sedmdesáti
procent, zbytek je opakování už zvládnutých stupňů, tedy stejný tvar jako
u násobilkových tratí. Díky tomu začátečník potká jen součty do deseti.

**Prahy rychlé odpovědi.** Pomalu 5,2 s, normálně 3,8 s, rychle 2,8 s. Bleskově
je zhruba polovina toho. U počítání do sta se prahy násobí 1,9.

---

## 5. Trati

Deset tratí, každá má vlastní generovaný okruh a prostředí.

| id | obsah |
| --- | --- |
| t1 | násobilka 1, 2, 5, 10 |
| t2 | násobilka 3, 4 |
| t3 | násobilka 6, 7 |
| t4 | násobilka 8, 9 |
| t5 | celá malá násobilka |
| d1 | dělení |
| a20 | sčítání a odčítání do 20 |
| a100 | sčítání a odčítání do 100, pět obtížnostních kbelíků |
| mix | vše odemčené dohromady |
| weak | jen příklady s nejnižší úrovní |

Klíče příkladů: `m{a}x{b}` násobení, `d{a}x{b}` dělení, `a{a}p{b}` sčítání do 20,
`s{a}p{b}` odčítání do 20, `p{bucket}` a `n{bucket}` do stovky. Kanonicky vždy
`a <= b`, komutativita se sbaluje.

---

## 6. Datový model

Vše v `localStorage` pod klíčem `math-fact-racer-v1`.

```js
DB = { profiles: [...], current: "id", sound: true, lang: "cs", pin: "hash" }

profil = {
  id, name, lang,
  facts: { "m7x8": {lv, reps, ok, bad, best, seen} },
  best:  { "t1": {dist, hist, n0} },     // rekordy tratí
  done:  { "t1": 3 },                    // nejlepší medaile
  trackRuns: { "t1": 8 },
  owned: [...], runner: "ri_auto", xp: { "pet_kiki": 120 },
  coins, force: {}, autoUnlock, qCount, speedMode,
  streak, lastDay, bestStreak, runs, totalOk, totalAns, msSum, msN
}
```

PIN je uložený jen jako hash funkcí `hashPin`. Není to skutečné zabezpečení,
jen zábrana proti dítěti, a je to tak napsané i v rozhraní.

Migrace při načtení: každý profil dostane startovní šestku závodníků a jazyk,
pokud je nemá. Nové migrace patří do `load()`.

---

## 7. Architektura kódu

`src/app.js` je rozdělený na očíslované oddíly.

1. Jazyk. `t(key, ...)`, `num()`, `applyLang()`, `langSeg()`. `render()` na začátku
   volá `applyLang()`, které podle jména obrazovky vybere buď rodičovský jazyk
   `DB.lang`, nebo dětský `profil.lang`. Rodičovské obrazovky jsou vyjmenované
   v `PARENT_VIEWS`.
2. Úložiště. `load`, `save`, `P()`, `newProfile`, `touchStreak`.
3. Příklady. Generování, klíče, výběr do závodu, zápis odpovědi do krabičky.
4. Sbírka a kresba postaviček. Všechno parametricky, `petSVG` a `rideSVG`.
5. Závodní okruh. Uzavřená Bézierova křivka z osazeného generátoru, geometrie se
   počítá v JS, ne přes SVG DOM, aby šla testovat mimo prohlížeč. `circuit(id)`,
   `atU(c, u)`, `circuitSVG`, `circuitThumb`.
6. Zvuk. Syntetizované tóny, žádné soubory.
7. Obrazovky. `viewPlayers`, `viewMap`, `viewGame`, `viewResult`, `viewCollection`,
   `viewSetPin`, `viewGate`, `viewParent`.
8. Interakce. Jeden delegovaný posluchač kliknutí nad celým dokumentem.

**Pozor na jednu past.** `t` je překladová funkce. Nikdy nepojmenovávej lokální
proměnnou `t`, zvlášť ne pro objekt trati. Používá se `tr`. Tohle už jednou
způsobilo chybu.

---

## 8. Testy

V `tests/`, spouštějí se přes node, potřebují jen `jsdom`. Podrobnosti v
`tests/README.md`. Testy načítají sestavený `index.html`, takže před během je
nutné pustit `build.py`.

Po každé změně mechaniky pusť `flow.test.js` a `items.test.js`, po každé změně
textů `i18n.test.js` a `names.test.js`.

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

---

## 10. Kde to teď stojí

Repozitář je založený a má tři commity. **Ještě nebyl odeslán na GitHub.**
Uživatel má SSH klíč, který je na GitHubu registrovaný jako deploy key
repozitáře Obsidian-SecondBrain, ne jako klíč účtu, takže push zatím neprojde.
Řešení je překlopit ten klíč z repozitáře na účet, nebo vyrobit druhý účtový
klíč a rozlišit je aliasem v `~/.ssh/config`.

Po pushi zbývá zapnout GitHub Pages, tedy Settings, Pages, zdroj větev `main`
a složka root. Odkaz `https://daliborkania-info.github.io/math-fact-racer/`
je už v obou README předvyplněný.

Hra je zároveň publikovaná jako artefakt na claude.ai, ten se aktualizuje
nahráním `dist/artifact.html`.

---

## 11. Další krok, rozšíření o učivo třetí třídy

**Fáze jedna je hotová.** Mapa učiva existuje a leží v `docs/kurikulum/`.
Vznikla z pracovních sešitů Matýskova matematika 7. a 8. díl, které jsou
dostupné ve čtečce ucebnice.online přes odkazy `qr.nns.cz`, jež poslal uživatel.
Čte se to tak, že přečteš `docs/kurikulum/README.md`, pak katalog a pak mapu.

Model je dvouvrstvý, a to je nejdůležitější rozhodnutí téhle fáze.
`docs/kurikulum/TEMATA.md` je katalog témat, tedy co hra umí vygenerovat, jeden
generátor plus jeden vstupní prvek plus zařazení do závodu nebo do dílny.
`docs/kurikulum/nns-matysek-3.md` je mapa jedné konkrétní učebnice, tedy
uspořádaný seznam kapitol odkazující na `id` z katalogu. Další učebnice znamená
napsat další mapu, ne další generátory. Mapa nesmí zavést téma, které není
v katalogu.

**Volba učebnice patří profilu**, ne aplikaci. Rodič ji v rodičovské sekci
nastaví zvlášť pro každé dítě, protože sourozenci mohou mít různé učebnice.
Profil má `curriculum`, `chapter` a `chapterMode`. Výchozí je
`curriculum: null`, tedy dnešní adaptivní režim. Měkký režim kapitoly serveruje
zhruba sedmdesát procent z aktuální kapitoly a zbytek podle Leitnerovy krabičky,
tvrdý bere jen aktuální kapitolu, měkký je výchozí, protože jinak se rozpadne
rozložené opakování.

**Tohle je hotové a v kódu.** Data leží v `src/curricula.js`, což je nový
zdrojový soubor, který `build.py` vkládá mezi `i18n.js` a `app.js`. Jsou v něm
tři kurikula pro první až třetí ročník, dohromady sedmdesát kapitol, z toho
třicet osm s poolem, který hra umí zahrát. Kapitola bez poolu se dá vybrat, ale
trať pro ni nevznikne, a v nabídce je označená jako "zatím neumíme". Čtvrtý
a pátý ročník v aplikaci nejsou, protože by v nich bylo skoro všechno šedé,
mapy k nim ale existují v `docs/kurikulum/`.

Kapitola se do hry propisuje přes novou trať `school`, tedy "Co máte ve škole".
Objeví se na mapě jen tehdy, když má vybraná kapitola dost zásoby, a nese název
té kapitoly jako podtitulek. Bylo to zvolené proti variantě, kdy by kapitola
překreslovala všechny existující tratě. Tohle je menší zásah, dítě tomu rozumí
a ostatní tratě fungují beze změny.

**Kapitola bez generátoru není slepá ulička.** Rodič nastavuje, kde je třída,
což je fakt o škole, ne otázka na hru. Většina kapitol jsou ale zatím témata
bez generátoru, a kdyby hra v takové chvíli mlčela, vypadalo by nastavení jako
rozbité. Proto `effectiveChapter()` hledá nejbližší dřívější kapitolu, kterou
hra zahrát umí, a trať jede podle ní. Je to učivo, které dítě už probralo,
takže opakování dává smysl a Leitnerova krabička ho stejně chce vracet.
Rodičovská sekce to napíše konkrétně, tedy podle které kapitoly se skutečně
jede. Dopředu se nikdy neskáče, to by učilo neprobrané. Nikdy nepoužívej
`chapterOf()` tam, kde jde o obsah závodu, to je jen vybraná kapitola.

**Pozor na dvě věci v kódu.** Pool je popsaný deklarativně, tedy `mult`, `div`,
`as20` a `as100`, a `poolKeys()` ho překládá na klíče příkladů. Nikdy do
kurikula nepiš klíče přímo. A `poolSize()` počítá kbelík do sta za čtyři, ne za
jeden, protože jeden kbelíkový klíč generuje celou rodinu příkladů. Bez toho by
kapitola s jediným kbelíkem vypadala jako prázdná.

**Katalog učebnic na ucebnice.online je za registrací.** Přes odkazy `qr.nns.cz`
jde otevřít konkrétní sešit bez přihlášení, celý katalog sta a více titulů ale
vyžaduje účet a třicetidenní zkušební přístup. Účet zakládat nebudu, další
učebnice tedy chodí tak, že uživatel pošle odkaz.

**Fáze dvě, teď.** Nad katalogem dohodnout mechaniku u každého nového tématu,
hlavně vstupní prvky `pad2`, `cmp`, `pick` a `clock`.

**Fáze tři.** Teprve pak generátory a obrazovky, po tématech. Pilot je dělení
se zbytkem, kapitola 27 mapy, tedy strany 30 až 35 osmého dílu.

**Rozhodnutí, která už padla.**

Pokrýt se má nakonec všechno: numerace a počítání do tisíce, dělení se zbytkem
a násobky deseti, jednotky, čas a peníze, a taky geometrie a slovní úlohy.

Navázání na školu bude obojí. Výchozí je adaptivní režim, rodič ale může
v rodičovské sekci nastavit kapitolu, kde třída je, a hra pak servíruje
převážně to učivo.

Jako pilot se doporučilo dělení se zbytkem. Je to jádrová látka třetí třídy,
vyžaduje jeden nový vstupní prvek, tedy druhé políčko na zbytek, a přitom se
celé odehraje uvnitř existujícího závodu. Osmý díl mu věnuje tři dvoustrany,
nejvíc ze všech témat obou dílů, a staví ho v pořadí číselná osa s násobky,
výpočet podílu a zbytku, obrácená úloha na dělence, slovní úloha se zbytkem.
Dělitele bere po dvojicích 2 a 3, 4 a 5, 6 a 7, 8 a 9, pak 10 a smíšené
opakování, což je hotová osnova pro pět tratí.

**Zásadní hranice návrhu.** Závod je trenažér plynulosti, ne přemýšlení. Patří
do něj jen to, co se má zautomatizovat a kde je jedna číselná odpověď. Slovní
úlohy, geometrie a čtení z tabulek potřebují druhý režim bez stopek a bez bodů
za rychlost, protože odměňovat rychlost u úlohy, kde je hlavní práce pečlivé
čtení, učí dítě hádat. Pracovně se pro ten druhý režim uvažovalo o názvu
servis nebo dílna.

**Autorská práva.** Z naskenované učebnice se nesmí přebírat zadání ani obrázky.
Legálně a užitečně se z ní bere jen struktura, tedy jaká témata, v jakém pořadí,
v jakém rozsahu a jakým typem úlohy. Příklady se pak generují vlastní. Je to
i lepší produkt, protože generátor jich vyrobí neomezeně a umí je stupňovat.

**Co si vyžádá úpravu architektury.** Témata dostanou vedle obtížnosti i pozici
v učebnici, tedy číslo kapitoly. Rodičovská sekce dostane přepínač kapitoly.
Tabulka zvládnutých příkladů přestane být mřížka deset krát deset a stane se
z ní seznam témat s pruhy, ve kterém bude mřížka násobilky jednou položkou.
Dělení se zbytkem potřebuje dvě vstupní políčka, porovnávání čísel tři velká
tlačítka místo klávesnice, řazení čísel přetahování.

---

## 12. Dobrovolná podpora projektu

Hra zůstává zdarma, MIT, bez reklam a bez sledování. Vedle toho je v README
sekce s výzvou k dobrovolnému příspěvku, umístěná až za Licencí, tedy dole.
Formulace musí vždy splnit tři věci: říct, že hra je a zůstane zdarma; říct,
co konkrétně se za příspěvky bude vyvíjet dál, tedy učivo třetí třídy a další
ročníky; a explicitně říct, že nepřispět je naprosto v pořádku a že se to ve
hře nijak nepozná. Žádné odemykání, žádné počítadlo cíle, žádný tlak.

**Zvolený kanál.** QR platba podle českého standardu SPAYD, obrázek přímo
v repozitáři. Nulové poplatky, žádná registrace pro dárce, rodič to zvládne
na tři klepnutí v bankovní aplikaci. QR se generuje skriptem `tools/make-qr.py`
knihovnou `segno`, není závislé na žádné externí službě.

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

## 13. Hotový prompt pro novou session

> Pokračujeme v projektu Math Fact Racer, což je hra na procvičování násobilky
> pro mého osmiletého syna. Repozitář je v `~/Dokumenty/Kladska/math-fact-racer`.
> Přečti si nejdřív `docs/PROJECT-STATE.md`, je tam kompletní stav, mechanika,
> architektura a plán. Pak `README.cs.md` kvůli zdůvodnění návrhu a `src/app.js`
> kvůli kódu. Zdroje se editují v `src/`, po každé změně se pouští
> `python3 build.py` a testy z `tests/`. Piš mi česky, kód a komentáře anglicky.
> Nedotknutelné principy z oddílu 3 neměň bez mého pokynu.
>
> Dneska chci [doplň, například: poslat ti první kapitolu učebnice k analýze /
> dodělat push na GitHub / opravit tohle a tamto].
