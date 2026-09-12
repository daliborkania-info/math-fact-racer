# Počtářský závod

*[English README](README.md)*

Procvičování malé násobilky pro děti zhruba od sedmi do deseti let, hrané jako kolo na závodním okruhu. Jeden HTML soubor, žádný účet, žádné reklamy, žádné sledování a po prvním načtení ani žádné připojení. Rozhraní česky, anglicky a německy.

**[▶ Spustit hru](https://daliborkania-info.github.io/math-fact-racer/)** — a níž v kapitole [Jak z toho na mobilu udělat aplikaci](#jak-z-toho-na-mobilu-udělat-aplikaci) jsou dva kroky, po kterých z toho je ikona na ploše.

---

## Co se dá procvičovat

| Trať | Obsah |
| --- | --- |
| Rozjezd | násobilka 1, 2, 5 a 10 |
| Trojky a čtyřky | násobilka 3 a 4 |
| Šestky a sedmičky | násobilka 6 a 7 |
| Osmičky a devítky | nejtěžší roh tabulky |
| Velký okruh | celá malá násobilka do 10 × 10 |
| Dělení | stejné příklady čtené pozpátku |
| Do dvaceti | sčítání a odčítání do 20 |
| Do stovky | sčítání a odčítání do 100 |
| Do tisíce | sčítání a odčítání do 1000, od celých stovek po přechod přes stovku |
| Hodiny | přečtení ciferníku, od celých hodin po odpolední čas |
| Šampionát | všechno odemčené dohromady |
| Co ti nejde | jen příklady, které dítě opakovaně mine |

Vedle tratí je na mapě **dílna**. Tam se nezávodí: neběží čas a za rychlost nejsou body, protože do dílny patří učivo, kde je hlavní prací rozvaha, ne vybavení z paměti. První zakázka jsou peníze, tedy placení, drobné a vracení, a odpovídá se skládáním mincí na pult. Za hotovou práci jsou součástky, za které se v garáži kupují nátěry strojů. Součástky se nedají vyjezdit a na jízdu nemají žádný vliv.

Trati se odemykají podle toho, jak dítě zvládá tu předchozí. Rodič může kterékoli odemknutí přebít ručně.

### Nebo podle toho, kde je zrovna třída

V rodičovské sekci se dá vybrat učebnice a kapitola, ve které třída je. Na mapě pak přibude trať **Co máte ve škole**, která procvičuje přesně to učivo. Zatím jsou v aplikaci Matýskova matematika pro první, druhý a třetí ročník, dohromady pětadevadesát kapitol, z nichž hra umí procvičit jedenasedmdesát. Zbylé jsou v seznamu vidět, ale nejdou vybrat, aby bylo poznat, kde třída je.

Nastavuje se zvlášť pro každého hráče, takže sourozenci mohou mít různé učebnice. Volně znamená, že zhruba sedmdesát procent příkladů je z nastavené kapitoly a zbytek se vrací z dřívějšího učiva, aby se neztratilo. Výchozí stav je bez učebnice, kdy si hra vybírá učivo sama podle toho, co dítěti nejde.

Z učebnic je převzatá jen struktura, tedy jaká témata, v jakém pořadí a v jakém rozsahu. Žádná zadání ani obrázky, příklady si hra generuje vlastní. Mapy učiva jsou v [docs/kurikulum/](docs/kurikulum/).

---

## Jak probíhá závod

Závod je dvacet příkladů a přesně jedno kolo okruhu. Odpovídá se na velké číselné klávesnici, za každou správnou odpověď auto ujede dvacetinu kola a projetá část trati se za ním obarví. Průjezdem cílovou čárou kolo končí.

**Chyba autem nepohne.** Auto zabrzdí, ukáže se správný výsledek a příklad se vrátí do fronty jako otázka navíc o pár kol dál. Trať tím zůstává stejně dlouhá, ať se děje cokoli, a kdo si chybu opraví, dojede přesně do cíle. Nikdy se necouvá.

**Rychlost se odměňuje, ale nevyžaduje.** Nikde neběží stopky ani odpočet. Rychlá odpověď přinese víc bodů, tři správné za sebou zapnou turbo bonus a body rozhodnou o medaili. Dítě, které počítá přesně, ale pomaleji, kolo dojede a medaili dostane taky.

**Soupeřem je vlastní včerejší jízda.** Auto ve vedlejším pruhu je nejlepší dosavadní jízda na téže trati, umístěná podle aktuálního rozdílu bodů. Žádné žebříčky, žádné cizí děti, proti kterým se dá prohrát.

Mince z každého závodu kupují závodníky do garáže: rakety, závoďáky, robota, buginu a sadu zvířátek, která rostou přes tři stupně podle toho, kolik příkladů s nimi dítě spočítá.

---

## Mechanika a proč je taková

Každé rozhodnutí níž je záměrnou odpovědí na něco z výzkumu o početní plynulosti a o motivaci dětí. Nic z toho tam není jako ozdoba.

### Vybavování, ne poznávání

Odpověď se píše na klávesnici, ne vybírá ze čtyř možností. Vyrobit odpověď z paměti je retrieval practice, vybrat jednu ze čtyř je rekognice a ta staví paměťovou stopu mnohem hůř. Ve školní studii s druháky porazily kartičky s aktivním vybavováním hlasité odříkávání řady, a to jak v krátkodobé, tak v dlouhodobé plynulosti v násobení ([Ophuis-Cox a kol., 2023](https://onlinelibrary.wiley.com/doi/10.1002/acp.4141), shrnutí v [The Hechinger Report](https://hechingerreport.org/proof-points-flashcards-prevail-over-repetition-in-memorizing-multiplication-tables/)).

### Rozložení v čase pomocí Leitnerovy krabičky

Každý příklad nese úroveň 0 až 5. Správná odpověď ho posune nahoru, chyba dolů, a úroveň řídí, jak často se příklad vrací. Slabé se vracejí ještě v témže závodě, zvládnuté jen zřídka. Rozložené vybavování poráží nahuštěné opakování a je to druhá nejsilnější páka celého návrhu hned po vybavování samotném.

### Tři sekundy jsou hranice mezi vybavením a dopočítáváním

Na úroveň 4 nebo 5 se příklad dostane jen tehdy, když dítě odpoví do hranice rychlé odpovědi, ve výchozím stavu 3,8 sekundy a nastavitelné. Plynulost se běžně definuje jako vybavení příkladu do zhruba tří sekund bez počítání na prstech a bez odříkávání řady, což je právě bod, kdy se odpověď vybavuje, a ne počítá. Měřit čas je proto jediný poctivý způsob, jak poznat, jestli dítě příklad skutečně umí.

### Čas se měří, ale nikde neběží odpočet

Tohle je kompromis, ke kterému data nutí. Časované procvičování má silnou oporu: panel What Works Clearinghouse za ním našel podstatné množství studií. Zároveň má NCTM stanovisko, že časované testy plynulost neměří a mohou žákům uškodit, a známé tvrzení, že časované testy způsobí úzkost z matematiky asi u třetiny dětí, pochází z článku pro praxi, ne z kontrolované studie. Studie ze 113 žáků čtvrtých a pátých tříd z roku 2024 nenašla významný rozdíl v úzkosti mezi otevřeně a skrytě časovanými úlohami ([Education Week](https://www.edweek.org/teaching-learning/do-timed-tasks-really-worsen-math-anxiety/2024/08), [Hechinger Report](https://hechingerreport.org/proof-points-do-math-drills-help-children-learn/)). Debata je opravdu nedořešená, aplikace si proto bere tu část, která je dobře podložená, tedy měření času, a vynechává tu spornou, tedy viditelný časový tlak.

### Chyba stojí méně, než přinese úspěch

Herní i pedagogický výzkum se shodují, že trest demotivuje rychleji, než odměna motivuje, že potrestaný hráč musí přesně chápat proč, a že neomezené pokusy chrání vytrvalost. Zpětná vazba, která zdůrazňuje postup a strategii místo selhání, chrání dětské přesvědčení, že na to má ([zpětná vazba a vytrvalost dětí v matematice](https://www.sciencedirect.com/science/article/abs/pii/S0022096524000055), [motivace v reakci na zpětnou vazbu a úzkost z matematiky](https://pmc.ncbi.nlm.nih.gov/articles/PMC12338047/)). Proto: chyba auto zastaví, ale nevrátí, správný výsledek se hned ukáže, příklad se vrátí na druhý pokus a každý závod končí medailí a mincemi.

### Cílem je zhruba osmdesát procent úspěšnosti

Každý závod míchá asi sedmdesát procent příkladů, které dítě už zvládá, se třiceti procenty těch, na kterých vázne, a uvnitř těch třiceti váží nejsilněji ty nejslabší. Úspěšnost kolem osmdesáti procent je běžně doporučovaná hranice pro udržení úlohy v zóně nejbližšího vývoje, tedy dost těžké, aby učila, a dost snadné, aby udržela pozornost ([návrh obtížnosti v adaptivní výukové hře](https://bera-journals.onlinelibrary.wiley.com/doi/10.1111/bjet.13146)).

### Práce je menší, než vypadá, tak ji zamiř

V tabulce je 100 součinů, ale díky komutativitě jen 55 různých příkladů, a po vyloučení řad 0, 1, 2, 5 a 10 zbývá asi 21 opravdu těžkých. Skoro všechny leží v bloku ohraničeném čísly 6, 7, 8 a 9, přičemž 7 × 8, 6 × 8 a 4 × 8 vycházejí dlouhodobě nejhůř ([proč jsou 4×8 a 6×8 tak těžké](https://www.justinmath.com/why-4x8-and-6x8-are-perhaps-surprisingly-some-of-the-hardest-multiplication-facts-for-students-to-remember/)). Pořadí tratí proto míří k tomuhle rohu záměrně, místo aby drilovalo tabulku rovnoměrně.

### Krátce a denně je lepší než dlouho a občas

Jeden závod trvá dvě až čtyři minuty. Počítadlo dnů v řadě odměňuje návrat zítra, ne delší sezení dnes. Školy používají srovnatelné nástroje pět až deset minut denně, což je dávka, která sedí jak efektu rozložení v čase, tak dětské pozornosti.

### Závodí se sám se sebou

Jediným soupeřem je vlastní rekord na dané trati. Žebříčky umí motivovat, ale pro dítě, které cvičí doma, je spolehlivý návrh ten, kde se postup měří vůči sobě samému, protože v něm nelze skončit jako poražený.

---

## Jak z toho na mobilu udělat aplikaci

Hra běží v prohlížeči, ale dvěma klepnutími z ní uděláte ikonu na ploše, která se otvírá na celou obrazovku bez lišt prohlížeče, přesně jako nainstalovaná aplikace. Funguje potom i bez signálu.

Nejdřív otevřete hru: **[daliborkania-info.github.io/math-fact-racer](https://daliborkania-info.github.io/math-fact-racer/)**

### iPhone a iPad

1. Otevřete ten odkaz **v Safari**. Z Chromu ani z prohlížeče vestavěného do WhatsAppu to nejde, takže pokud se stránka otevřela uvnitř jiné aplikace, klepněte na ⋯ nebo na ikonu kompasu a zvolte *Otevřít v Safari*.
2. Klepněte na **tlačítko sdílení** dole uprostřed, čtvereček se šipkou nahoru.
3. Sjeďte v nabídce dolů a klepněte na **Přidat na plochu**.
4. Potvrďte tlačítkem **Přidat** vpravo nahoře.

### Android

1. Otevřete odkaz v **Chromu**. Pokud se otevřel uvnitř WhatsAppu, klepněte na nabídku ⋮ a zvolte *Otevřít v Chromu* nebo *Otevřít v prohlížeči*.
2. Klepněte na **nabídku ⋮** vpravo nahoře.
3. Klepněte na **Přidat na plochu** nebo **Nainstalovat aplikaci**, podle verze Chromu.
4. Potvrďte tlačítkem **Přidat** nebo **Instalovat**.

Při prvním spuštění si aplikace vyžádá rodičovský kód. Zvolte něco, co dítě neuhodne, chrání nastavení a přehled výsledků. Pak založte hráče a vyberte trať.

### Když chcete radši samotný soubor

Stáhněte si [index.html](index.html) a otevřete ho v mobilu nebo tabletu. Je úplně soběstačný a funguje zcela bez připojení, jen dekorativní zaoblené písmo se nahradí systémovým. Takhle si taky uděláte kopii, která se sama nikdy nezmění.

---

## Soukromí

Ze zařízení nic neodchází. Postup je uložený v místním úložišti prohlížeče pod jedním klíčem, není tam žádný účet, žádná analytika, žádné reklamy a kromě načtení stránky a písma ani žádné volání po síti. Vymazání dat webu v prohlížeči postup smaže, takže pokud si ho chcete zachovat nebo přenést na jiné zařízení, použijte panel se zálohou v rodičovské sekci.

Rodičovský kód je uložený jen jako hash. Udrží dítě mimo nastavení, ale není to skutečné zabezpečení a kdokoli s vývojářskými nástroji prohlížeče se přes něj dostane.

---

## Pro vývojáře

Hratelná stránka je jeden soběstačný soubor. Negeneruje se ručně, ale sestavuje.

```
src/index.template.html   kostra dokumentu se třemi značkami
src/styles.css            všechny styly
src/i18n.js               všechny texty rozhraní, cs / en / de
src/curricula.js          kapitoly učebnic pro volbu podle školy
src/app.js                engine, obrazovky, interakce
build.py                  vloží zdroje do index.html
index.html                sestavený, hratelný soubor
dist/artifact.html        stejná stránka bez obalu html/head/body
sw.js                     drobná offline cache pro hostovanou kopii
```

```bash
python3 build.py
```

Žádný toolchain, žádné závislosti, žádné npm. Hra je čisté ES2017 bez frameworku, geometrie okruhu se počítá v JavaScriptu místo přes SVG DOM, aby se dala testovat mimo prohlížeč, a každá postavička i trať se kreslí z parametrů, ne načítá z obrázku.

Přidání jazyka: doplňte do `I18N` v `src/i18n.js` blok se stejnými klíči jako `en`, přidejte kód do `LANGS` a sestavte znovu.

---

## Licence

MIT. Dělejte si s tím, co chcete, včetně rozdání všem rodičům ve třídě.

---

## Podpora projektu

Hra je zdarma a zůstane zdarma. Žádné reklamy, žádné sledování, žádný účet, žádná placená verze, žádné odemykání za peníze. Nic z toho se nezmění, ať se stane cokoli.

Jestli vám ale doma udělala radost a chcete, aby v ní přibývalo další učivo, tohle je způsob, jak to podpořit. Rozdělané mám dělení se zbytkem, počítání do tisíce, jednotky, čas a peníze, slovní úlohy a postupně i látku dalších ročníků. Píšu to po večerech vedle práce, takže každý příspěvek je hlavně signál, že to někdo používá a že má smysl v tom pokračovat.

Je to zcela dobrovolné. Nic se tím neodemyká, nic se tím nezrychluje a ve hře se nijak nepozná, kdo přispěl a kdo ne. Klidně tenhle odstavec přeskočte a hrajte dál, je to naprosto v pořádku a nic vám tím neuteče.

Orientačně jedno kafe, tedy padesát nebo sto korun. Víc opravdu není potřeba.

<img src="docs/support-qr.png" alt="QR kód pro platbu" width="180">

Namiřte na kód mobil z bankovní aplikace, účet se vyplní sám a částku si zadáte vlastní. Kdo radši ručně: **2800927751/2010**.

---

## Repozitář

<https://github.com/daliborkania-info/math-fact-racer>

Hostování zajišťuje GitHub Pages: v repozitáři *Settings → Pages → Source: Deploy from a branch → main → / (root)*. Stránka pak žije na `https://daliborkania-info.github.io/math-fact-racer/` a aktualizuje se při každém pushi.

---

## Stav projektu

Kompletní zachycení rozhodnutí, mechaniky, architektury, opravených chyb a plánu
dalších kroků je v [docs/PROJECT-STATE.md](docs/PROJECT-STATE.md). Slouží zároveň
jako podklad pro pokračování v jiné konverzaci.
