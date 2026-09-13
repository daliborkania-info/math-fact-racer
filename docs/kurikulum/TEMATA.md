# Katalog témat

Co hra umí nebo bude umět vygenerovat. Nezávislé na konkrétní učebnici. Mapy
učebnic v tomhle adresáři odkazují na `id` z tabulek níž.

## Hranice mezi závodem a dílnou

Do **závodu** patří jen to, co se má zautomatizovat a kde je jedna krátká
odpověď, kterou lze zadat na číselné klávesnici nebo jedním klepnutím. Závod je
trenažér plynulosti, měří čas a odměňuje rychlost.

Do **dílny** patří všechno, kde je hlavní prací pečlivé čtení, rozvaha nebo více
kroků. Dílna neměří čas a nedává body za rychlost, protože odměňovat rychlost
u úlohy, kde se má přemýšlet, učí dítě hádat. Dílna od září 2026 existuje
a platí se v ní součástkami; podrobnosti v docs/PROJECT-STATE.md, oddíl 4b.

Zařazení není o obtížnosti. Dělení se zbytkem je těžké a patří do závodu, protože
je to jedna vybavovaná dvojice čísel. Volba správné jednotky je snadná a patří
do dílny, protože je to rozvaha, ne vybavení.

## Vstupní prvky

| kód | prvek | stav |
| --- | --- | --- |
| `pad` | číselná klávesnice, jedna odpověď | hotovo |
| `coins` | mince se skládají na pult, odpověď je hrst mincí | hotovo, jen v dílně |
| `pad2` | dvě políčka vedle sebe, podíl a zbytek | k dodělání |
| `pad3` | tři políčka, stovky a desítky a jednotky | k dodělání |
| `cmp` | tři velká tlačítka `<` `=` `>` | k dodělání |
| `pick` | dvě až čtyři velká tlačítka s volbami | k dodělání |
| `clock` | ciferník k přečtení, odpověď na `pad` | hotovo |
| `frac` | čitatel a jmenovatel, dvě políčka | k dodělání |
| `line` | číselná osa, klepnutí na pozici | k dodělání |
| `col` | rozepsaný sloupec pro písemné počítání | k dodělání |

## Závod

| id | téma | vstup | rozsah | stav |
| --- | --- | --- | --- | --- |
| `mult_table` | malá násobilka do 10 × 10 | `pad` | 1 až 100 | hotovo |
| `div_table` | dělení v oboru malé násobilky | `pad` | 1 až 100 | hotovo |
| `add_sub_10` | sčítání a odčítání do 10 | `pad` | 0 až 10 | hotovo, je to `add_sub_20` s `maxSum` |
| `add_sub_20` | sčítání a odčítání do 20 | `pad` | 0 až 20 | hotovo |
| `add_sub_100` | sčítání a odčítání do 100, pět kbelíků obtížnosti | `pad` | 0 až 100 | hotovo |
| `missing_operand` | chybějící sčítanec, menšenec, činitel nebo dělenec | `pad` | podle nosného tématu | nové |
| `times_more_less` | o kolik více či méně, kolikrát více či méně | `pad` | podle nosného tématu | nové |
| `inverse_check` | zkouška správnosti jako obrácená operace | `pad` | podle nosného tématu | nové |
| `rounding_10` | zaokrouhlování na desítky, dvojciferná i trojciferná | `pad` | 0 až 1000 | hotovo |
| `rounding_100` | zaokrouhlování na stovky | `pad` | 0 až 1000 | hotovo |
| `chain_3` | řetězec tří čísel, sčítání a odčítání, tři kbelíky podle oboru | `pad` | 0 až 100 | hotovo |
| `order_of_ops` | pořadí operací bez závorek a se závorkami, čtyři kbelíky: bez závorek a se závorkami, do sta a do tisíce | `pad` | 0 až 1000 | hotovo |
| `mult_beyond` | násobení mimo rozsah malé násobilky, 12 × 3, čtyři kbelíky podle toho, co se rozkládá | `pad` | do 1000 | hotovo |
| `div_beyond` | dělení mimo rozsah malé násobilky, 56 : 4, totéž sezení pozpátku | `pad` | do 1000 | hotovo |
| `div_remainder` | dělení se zbytkem | `pad2` | dělitel 2 až 10 | **pilot** |
| `div_remainder_inv` | doplnění dělence ze zadaného podílu a zbytku | `pad` | dělitel 2 až 10 | nové |
| `mult_div_10_100` | násobení a dělení deseti a stem | `pad` | do 1000 | nové |
| `mult_round` | násobení číslem končícím nulami a dělení takového čísla | `pad` | do 1000 | nové |
| `place_value` | rozklad trojciferného čísla na stovky, desítky, jednotky | `pad3` | 100 až 999 | nové |
| `add_sub_1000` | sčítání a odčítání do tisíce, šest stupňů podle toho, co se přičítá a jestli se přechází přes stovku | `pad` | 0 až 1000 | hotovo |
| `time_elapsed` | kolik minut nebo hodin uplynulo | `pad` | do 24 h | nové |
| `time_convert` | převody jednotek času | `pad` | dny, týdny, měsíce, roky | nové |
| `unit_convert` | převody jednotek délky, hmotnosti a objemu | `pad` | celá čísla | nové |
| `parity` | sudé nebo liché | `pick` | 0 až 1000 | nové |
| `digit_count` | jednociferné, dvojciferné, trojciferné | `pick` | 0 až 1000 | nové |
| `number_pattern` | doplnění dalšího členu číselné řady, aritmetické i geometrické | `pad` | 0 až 1000 | nové |
| `compare_numbers` | porovnávání čísel | `cmp` | 0 až 1000 | nové |
| `compare_units` | porovnávání veličin s jednotkami | `cmp` | podle jednotky | nové |
| `clock_read` | přečtení analogových hodin na digitální čas | `clock` | 12 i 24 hodin | hotovo |

## Dílna

| id | téma | vstup | stav |
| --- | --- | --- | --- |
| `insert_parens` | doplnit závorky tak, aby příklad vyšel | `pick` | nové |
| `expression_choice` | který zápis výpočtu slovní úlohy je správný | `pick` | nové |
| `word_problem` | slovní úloha se zápisem, výpočtem a odpovědí | `pad` plus zápis | nové |
| `written_mult` | písemné násobení pod sebou | `col` | nové |
| `written_add_sub` | písemné sčítání a odčítání pod sebou | `col` | nové |
| `number_line` | orientace na číselné ose, doplnění a vyznačení čísel | `line` | nové |
| `unit_pick` | která jednotka se hodí pro danou veličinu | `pick` | nové |
| `fraction_read` | jaká část celku je vybarvená | `frac` | nové |
| `fraction_compare` | porovnávání zlomků a částí celku | `cmp` | nové |
| `count_objects` | spočítání předmětů na obrázku | `pad` | nové |

## Témata vyšších ročníků, neověřená

Tahle témata vyplynula z obsahů učebnic pro čtvrtý a pátý ročník. Vím, že
existují a kde v pořadí leží, ale formát odpovědi a vstupní prvek jsou jen
odhad, protože stránky jsem neviděl. V mapách jsou značená `?`. Než se na
kterékoli z nich napíše generátor, je potřeba se podívat na pár stran.

| id | téma | odhad vstupu | odhad režimu |
| --- | --- | --- | --- |
| `rounding_1000` | zaokrouhlování na tisíce a výš | `pad` | závod |
| `add_sub_10000` | sčítání a odčítání ve větších oborech | `pad` | závod |
| `written_div` | písemné dělení jednociferným i dvojciferným dělitelem | `col` | dílna |
| `distribute` | roznásobení závorky | `pad` | závod |
| `equation` | rovnice a nerovnice | `pad` | závod |
| `roman_numerals` | římské číslice | `pick` nebo textové pole | závod |
| `fraction_of` | výpočet části z celku | `pad` | závod |
| `decimals` | desetinná čísla | `pad` | závod |
| `percent` | procenta | `pad` | závod |
| `negatives` | záporná čísla | `pad` | závod |
| `average` | aritmetický průměr | `pad` | závod |
| `estimate` | odhad výsledku | `pick` | dílna |
| `chart_read` | čtení z diagramů a grafů | `pad` | dílna |
| `finance_money` | placení, drobné a vracení | `coins`, dílna | hotovo |

## Poznámky ke generátorům

**`div_remainder`.** Klíč příkladu `r{dělenec}x{dělitel}`, odpověď je dvojice
podíl a zbytek. Dělitel 2 až 10, dělenec do desetinásobku dělitele. Vynechávat
případy se zbytkem nula není potřeba, naopak patří dovnitř, protože rozlišit
"beze zbytku" je součást dovednosti. Typická chyba je zbytek větší nebo rovný
děliteli, na to má chybová hláška reagovat konkrétně.

**`add_sub_20`, obor do dvaceti bez přechodu, hotovo.** Klíč `a{a}p{b}` měl
původně oba sčítance do deseti, takže 12 + 3 se nedalo zapsat vůbec, a celý
třetí díl prvního ročníku byl kvůli tomu nehratelný. Teď je v oboru i devětatřicet
spojů typu desítka a jednotky bez přechodu, uložených stejně jako všechny
ostatní, tedy větší číslo druhé: 13 + 4 je `a4p13`. Generátor ani odčítání
nepotřebovaly jedinou výjimku.

Přechod přes desítku se od té chvíle pozná podle jednotek, ne podle součtu:
`(a % 10) + (b % 10) > 10`. Díky tomu 13 + 4 i 10 + 7 správně spadnou na lehkou
stranu a doplnění do celé desítky se za přechod nepočítá. Pole `carry` v mapě
znamená přesně tohle, ne "součet nad deset", takže kapitola "Sčítání 9 +" už
neobsahuje 10 + 7.

Stupňů přechodu je proto šest, ne pět, a druhý v pořadí jsou právě desítkové
spoje. Je to o rok dřív než mosty přes devítku, takže patří dopředu, ne na
konec.

**`add_sub_1000`.** Hotové. Stejná architektura kbelíků jako `add_sub_100`, jen
se štěpí podle toho, jestli se přechází přes stovku a jestli se přičítá
jednociferné, dvojciferné, nebo celé stovky. Učebnice tomu věnuje devět
dvoustran a rozlišuje šest případů, takže kbelíků je šest, ne pět, a na rozdíl
od stovky jsou stupňované: aktuální nese sedmdesát procent závodu a dřívější
se vracejí jako opakování, stejně jako u mostů přes desítku a u hodin.

**`number_pattern`.** Jediné téma v katalogu, které nepochází z učebnice, ale ze
státního kurikula: v revidovaném RVP ZV je to samostatný očekávaný výstup
`MAT-MAT-001-ZV5-012` pro první stupeň, zatímco Matýskovy mapy ho nemají.
Zadání je řada čtyř až pěti členů a otázka na další člen, například
`80, 40, 20, 10`, tedy geometrická stejně jako aritmetická. Odpověď je jedno
číslo na klávesnici, takže se do závodu vejde beze změny vstupních prvků.
Podrobnosti o zdroji jsou v [ZDROJE-RVP.md](ZDROJE-RVP.md).

**`times_more_less`.** Pozor na rozdíl mezi "o kolik" a "kolikrát". Je to
nejčastější zdroj chyb v celé třetí třídě a stojí za samostatné téma, i když
generátor je triviální.

**`compare_numbers` a `compare_units`.** Tři tlačítka místo klávesnice. Je to
poznávání, ne vybavování, takže to porušuje první z nedotknutelných principů.
Proto tam patří jen jako doplněk a nikdy jako celá trať.

**`clock_read`, hotovo.** Ciferník se kreslí parametricky stejně jako okruhy
a postavičky, žádné obrázky. Odpověď je čas na klávesnici, ne výběr z možností,
a píše se jako na displeji, tedy 7:45 se ťuká 745 a 19:45 se ťuká 1945. Hodina
krát sto plus minuty je jedno celé číslo, takže se nemusela měnit ani jedna
řádka bodování, rekordů nebo Leitnerovy krabičky.

Dopolední a odpolední zápis učebnice chce oba, ale ne jako dvě odpovědi za
jednu otázku. Vedle ciferníku je nakreslené slunce nebo měsíc a to říká, která
půlka dne se myslí. Jedna otázka tedy má pořád jednu odpověď a přechod na
čtyřiadvacetihodinový zápis se tím učí zvlášť.

Kbelíky jsou exkluzivní a jdou po přesnosti: `c1` celé hodiny, `c2` půl, `c3`
čtvrt a tři čtvrtě, `c4` zbylé pětiminutovky, `c5` na minutu, `c6` odpolední
zápis. Aktuální kbelík nese sedmdesát procent závodu, zbytek je opakování
hrubších, tedy stejný tvar jako stupně přechodu přes desítku.
