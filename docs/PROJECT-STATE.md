# Stav projektu a předávací dokument

Poslední aktualizace: 12. září 2026, po přidání hodin a opravě oboru do dvaceti

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
src/i18n.js               všechny texty rozhraní, cs / en / de, 185 klíčů
src/curricula.js          kapitoly učebnic pro volbu podle školy, data, ne kód
src/app.js                engine, obrazovky, interakce
tests/                    regresní testy nad jsdom, viz tests/README.md
tests/fixtures/           zamrazené profily starších verzí, jen se přidávají
docs/PROJECT-STATE.md     tenhle soubor
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

**Co hra neumí, to nenabízí.** Žádné nastavení nesmí jít zvolit, pokud se pak
tiše nic nestane. Platí to i na budoucí obrazovky, nejen na volbu kapitoly, kde
to vzniklo.

**Žádná změna nesmí připravit existující profil o to, co už má.** Hra běží na
cizích telefonech, ke kterým se nedostanu, nová verze se do nich dostane sama
při dalším načtení a zálohu si nikdo nedělá. Nová verze proto musí umět načíst
libovolný starší profil a nesmí po ní zmizet ani zmenšit se nic z tohohle:

- příklad v krabičce, jeho úroveň, počty pokusů, úspěchů, chyb a nejlepší čas
- rekord trati, nejlepší medaile, počet dojetých závodů
- mince, koupení závodníci, jejich zkušenosti, dny v řadě a celkové součty
- jméno, jazyk, kód rodiče a volba učebnice
- **přístup, který dítě už mělo.** Odemčená trať se sama nezavře, vybraná
  kapitola se sama nepřepne dopředu.

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
dvaceti. Pojistka: po deseti dojetých závodech na jedné trati se další otevře
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
Jestli se myslí dopoledne nebo večer, říká slunce nebo měsíc vedle ciferníku,
takže jedna otázka má pořád jednu odpověď.

**Prahy rychlé odpovědi.** Pomalu 5,2 s, normálně 3,8 s, rychle 2,8 s. Bleskově
je zhruba polovina toho. U počítání do sta se prahy násobí 1,9, u hodin 2,4,
protože přečíst ciferník a naťukat čtyři číslice trvá déle než vybavit si spoj.

---

## 5. Trati

Dvanáct tratí, každá má vlastní generovaný okruh a prostředí.

| id | obsah |
| --- | --- |
| t1 | násobilka 1, 2, 5, 10 |
| t2 | násobilka 3, 4 |
| t3 | násobilka 6, 7 |
| t4 | násobilka 8, 9 |
| t5 | celá malá násobilka |
| d1 | dělení |
| a20 | sčítání a odčítání do 20, šest stupňů podle přechodu přes desítku |
| a100 | sčítání a odčítání do 100, pět obtížnostních kbelíků |
| clock | čtení hodin, šest kbelíků přesnosti, otevřená od začátku |
| mix | vše odemčené dohromady |
| weak | jen příklady s nejnižší úrovní |
| school | učivo vybrané kapitoly učebnice, viz oddíl 11 |

Trať `school` se na mapě objeví jen tehdy, když je v profilu zvolená učebnice
a kapitola, a jde vždy na první místo. Nese název kapitoly jako podtitulek.
V rodičovské sekci nemá přepínač odemknutí, řídí ji volba kapitoly.

Klíče příkladů: `m{a}x{b}` násobení, `d{a}x{b}` dělení, `a{a}p{b}` sčítání do 20,
`s{a}p{b}` odčítání do 20, `p{bucket}` a `n{bucket}` do stovky, `c1` až `c6`
hodiny. Kanonicky vždy `a <= b`, komutativita se sbaluje. U dvacítky smí být
druhé číslo i náctka, takže 13 + 4 je `a4p13`; díky tomu generátor ani odčítání
nepotřebují na obor do dvaceti bez přechodu jedinou výjimku.

Klíč začínající písmenem z `FAMILY_HEADS`, tedy `p`, `n` nebo `c`, není jeden
příklad, ale celá rodina, kterou generátor rozbaluje až v `itemFromKey`. Proto
se v `poolSize` počítá za čtyři a proto `buildRun` na konci přegeneruje otázku,
která by vyšla stejně jako ta předchozí. Každý další kbelíkový generátor přidá
písmeno do `FAMILY_HEADS`, nic víc.

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
  opened: { "t1": true },                // trati, ktere uz jednou byly otevrene
  owned: [...], runner: "ri_auto", xp: { "pet_kiki": 120 },
  coins, force: {}, autoUnlock, qCount, speedMode,
  curriculum: null,                      // id z CURRICULA, null = adaptivní režim
  chapter: null,                         // číslo kapitoly uvnitř toho kurikula
  chapterMode: "soft",                   // soft | hard
  streak, lastDay, bestStreak, runs, totalOk, totalAns, msSum, msN
}
```

PIN je uložený jen jako hash funkcí `hashPin`. Není to skutečné zabezpečení,
jen zábrana proti dítěti, a je to tak napsané i v rozhraní.

Migrace při načtení: každý profil dostane startovní šestku závodníků a jazyk,
pokud je nemá, `normalizeChapter()` srovná kapitolu a `seedOpened()` doplní
seznam otevřených tratí. Nové migrace patří do `load()`, a pokud se týkají
profilu jako celku, taky do větve `import`.

---

## 7. Architektura kódu

`src/app.js` je rozdělený na očíslované oddíly.

1. Jazyk. `t(key, ...)`, `num()`, `applyLang()`, `langSeg()`. `render()` na začátku
   volá `applyLang()`, které podle jména obrazovky vybere buď rodičovský jazyk
   `DB.lang`, nebo dětský `profil.lang`. Rodičovské obrazovky jsou vyjmenované
   v `PARENT_VIEWS`.
2. Úložiště. `load`, `save`, `P()`, `newProfile`, `touchStreak`.
3. Příklady. Generování, klíče, stupně `E_STAGES`, tratě, kurikulum, výběr do
   závodu, zápis odpovědi do krabičky.
4. Sbírka a kresba postaviček. Všechno parametricky, `petSVG` a `rideSVG`.
5. Závodní okruh. Uzavřená Bézierova křivka z osazeného generátoru, geometrie se
   počítá v JS, ne přes SVG DOM, aby šla testovat mimo prohlížeč. `circuit(id)`,
   `atU(c, u)`, `circuitSVG`, `circuitThumb`.
6. Zvuk. Syntetizované tóny, žádné soubory.
7. Obrazovky. `viewPlayers`, `viewMap`, `viewGame`, `viewResult`, `viewCollection`,
   `viewSetPin`, `viewGate`, `viewParent`.
8. Interakce. Jeden delegovaný posluchač kliknutí nad celým dokumentem, plus
   druhý na `change` kvůli rozbalovacím nabídkám, které klik nevyvolávají.

**Pozor na tři pasti.** `t` je překladová funkce. Nikdy nepojmenovávej lokální
proměnnou `t`, zvlášť ne pro objekt trati. Používá se `tr`. Tohle už jednou
způsobilo chybu. Rozbalovací nabídka potřebuje `change`, ne `click`, takže
nové `<select>` musí mít obsluhu v tom druhém posluchači. A otázka není vždycky
řádek textu: `questionHTML()` skládá celý řádek včetně rovnítka nebo ciferníku
a mezi otázkami se přepisuje celý `#qbox`, takže `#abox` se po každé otázce
musí najít znovu. Nikdy nesahej na `#qtext` přes `textContent`, pokud může
nést obrázek.

---

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

`items.test.js` pokrývá jedenáct okruhů: správnost všech generovaných příkladů,
shodu ciferníku s odpovědí včetně úhlů obou ručiček, složení závodu na každé
trati, platnost SVG, konzistenci kurikul, závod podle kapitoly v obou režimech,
stupně přechodu přes desítku, pravidla výběru kapitoly a kbelíky hodin.
`flow.test.js` projede celou hru včetně volby učebnice a závodu s hodinami.
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
95 kapitol, z toho 67 hratelných. Čtvrtý a pátý ročník v aplikaci nejsou,
protože by v nich bylo skoro všechno zamčené; mapy k nim existují v `docs/`.

**Pool je deklarativní.** Kapitola popisuje učivo jako `mult`, `div`, `as20`,
`as100` a `clock`, a `poolKeys()` to překládá na klíče příkladů. Nikdy do kurikula
nepiš klíče přímo. `poolSize()` počítá kbelík do sta za čtyři, ne za jeden,
protože jeden kbelíkový klíč generuje celou rodinu příkladů; bez toho by
kapitola s jediným kbelíkem vypadala jako prázdná.

**Kapitola bez generátoru je nevybratelná.** Rozhoduje `isPlayable(ch)`, tedy
`poolSize` aspoň čtyři. `playableChapters(cur)` vrací, co jde vybrat, a volba
učebnice skáče na první z nich, ne na první kapitolu v knize.
`normalizeChapter(p)` srovná uložený profil na nejbližší dřívější hratelnou
kapitolu, nikdy dopředu, a volá se v `load()` i po importu zálohy. V seznamu
je celá kniha schválně, aby rodič viděl, kde třída je, i když to hra ještě
neumí; nehratelné položky jsou `disabled`.

**Zásadní hranice návrhu.** Závod je trenažér plynulosti, ne přemýšlení. Patří
do něj jen to, co se má zautomatizovat a kde je jedna krátká odpověď. Slovní
úlohy, geometrie, písemné algoritmy a čtení z tabulek potřebují druhý režim bez
stopek a bez bodů za rychlost, protože odměňovat rychlost u úlohy, kde je hlavní
práce pečlivé čtení, učí dítě hádat. Pracovně se pro ten druhý režim uvažovalo
o názvu servis nebo dílna. Zatím neexistuje.

**Autorská práva.** Z učebnice se přebírá výhradně struktura, tedy jaká témata,
v jakém pořadí, v jakém rozsahu a jakým typem úlohy. Zadání ani obrázky se
nepřebírají, příklady se generují vlastní. Je to i lepší produkt, protože
generátor jich vyrobí neomezeně a umí je stupňovat.

---

## 12. Chybějící generátory, změřeno

Tabulka vznikla tak, že se přes reálnou logiku `poolKeys` a `poolSize` spočítalo,
kolik kapitol každý chybějící generátor odemkne. Řadí se podle toho, ne podle
dojmu. Stav po přidání hodin a po opravě oboru do dvaceti je 67 hratelných
kapitol z 95, po ročnících 15/18, 42/44 a 10/33.

| generátor | vstup | kapitol | kde |
| --- | --- | --- | --- |
| `add_sub_1000` | `pad` | 3 | g3: 23, 24, 25 |
| `mult_beyond` + `div_beyond` | `pad` | 3 | g3: 14, 16, 31 |
| `unit_convert` + `time_convert` | `pad` | 2 | g3: 18, 29 |
| `rounding_10` + `rounding_100` | `pad` | 2 | g3: 7, 26 |
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
| `finance_money` | dílna | 1 | g2: 3 |

**Hlavní zjištění.** Patnáct z třiadvaceti zamčených kapitol třetí třídy
nepotřebuje na vstupu vůbec nic nového, stačí generátory na `pad`. Třetí třída
tím jde z 10/33 na 25/33, aniž by se sáhlo na klávesnici.

**`written_add_sub` neodemkne ani jednu kapitolu**, i když ho mapa druhé třídy
posunula v prioritě nahoru. Kapitoly, ve kterých se objevuje, jsou hratelné už
teď přes `as100`. Je to prohloubení, ne odemčení, a navíc potřebuje dílnu.

**Zbytek prvního ročníku už chybí jen dílna.** Kapitoly 1 až 3 jsou počítání
předmětů na obrázku, nic pro závod.

## 12b. Další krok

Pořadí, na kterém jsme se dohodli: nejdřív všechno, co jde na `pad`, a uvnitř
toho začít `add_sub_1000`, protože je to páteř osmého dílu a architektonicky
jen další sada kbelíků vedle `add_sub_100`. Pak `mult_beyond` a `div_beyond`,
`rounding_10` a `rounding_100`, `chain_3`, `order_of_ops`, `mult_div_10_100`
a `mult_round`, `unit_convert` a `time_convert`, nakonec `missing_operand`
a `inverse_check`, protože to nejsou samostatné rodiny, ale modifikátory
existujících, a to je jiný typ zásahu do `itemFromKey`.

Teprve pak nové vstupní prvky: `pad2` a `div_remainder`, `pad3` a `place_value`,
`pick` a dvojice `parity` s `digit_count`, úplně nakonec `cmp` a porovnávání.
Dílna až po tom všem.

**Každá nová rodina dostane vlastní trať**, tak jsme se rozhodli u hodin a platí
to dál. Mapa tím naroste a bude ji potřeba přeskládat do skupin, jakmile tratí
bude patnáct a víc.

**Pilot pro `pad2`: dělení se zbytkem.** Kapitola 27 mapy třetího ročníku, strany 30 až 35
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

**Co si vyžádá úpravu architektury.** Tabulka zvládnutých příkladů v rodičovské
sekci přestane být mřížka deset krát deset a stane se z ní seznam témat s pruhy,
ve kterém bude mřížka násobilky jednou položkou. Dělení se zbytkem potřebuje dvě
vstupní políčka, porovnávání čísel tři velká tlačítka místo klávesnice, řazení
čísel přetahování.

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
