# Státní kurikulum jako zdroj, záznam průzkumu

Mapy v tomhle adresáři zatím vznikaly z učebnic. Druhý možný zdroj je státní
kurikulum, tedy rámcový vzdělávací program a modelové školní vzdělávací
programy. Tenhle soubor je záznam toho, co se na webech Národního pedagogického
institutu našlo, co z toho jde použít a co ne, aby se za měsíc nehledalo znovu.

```
průzkum:   13. září 2026
weby:      prohlednout.rvp.cz, revize.rvp.cz, opendata.npi.cz
závěr:     použitelný je modelový ŠVP, ne samotné RVP
```

## Revidované RVP ZV na prohlednout.rvp.cz

Portál `prohlednout.rvp.cz` nese revidované RVP ZV, tedy znění podle opatření
z 28. srpna 2026. Je to závazný dokument, ze kterého školy odvozují svoje ŠVP.

Pro tenhle projekt má jednu zásadní vlastnost. Matematika v něm má uzlové body
jen v 5. a 9. ročníku, takže druhé období prvního stupně se tam jako jednotlivé
ročníky vůbec nevyskytuje. Pro celý první stupeň je třináct očekávaných
výstupů s kódy `MAT-MAT-001-ZV5-001` až `-013`, rozdělených do pěti okruhů,
a pořadí probírání v dokumentu není, protože si ho určuje škola.

Jediná gradace uvnitř výstupu jsou tři fáze pojmenované Na začátku, Na cestě
a Splněno, plus minimální doporučená úroveň pro děti s podpůrnými opatřeními.

## Proč z toho mapa nevznikne

Mapa ve tvaru `nns-matysek-*.md` potřebuje číslované kapitoly velikosti
zhruba dvoustrany, protože rodič v rodičovské sekci nastavuje, kde třída právě
je. Ze třinácti položek rozprostřených přes pět let by vznikl přepínač,
kterým se nedá trefit: jedna položka by pokrývala rok a půl výuky.

Struktura RVP je tedy pro naši mapu příliš hrubá, a to nezávisle na tom, jak je
jinak dobře napsaná. Použitelné jsou z ní jen dvě věci, popsané níž.

## Co z RVP použitelné je

Ilustrace u jednotlivých fází nesou doslovný typ zadání, tedy přesně to, co
potřebuje generátor. Objevují se tam tvary jako `5 000 - 2 300 =`,
`23 + __ = 59`, `4 800 ÷ 8 =` nebo `Zaokrouhli: 6,7; 3,2; 8,91`. Je jich na
celých pět ročníků asi dvacet a část z nich je dostupná až pod adresou
`/metodika/<kod>`, ne přímo u výstupu.

Druhá použitelná věc jsou číselné rozsahy za celé období, kterými jde sundat
otazníky v už napsaných mapách pro čtvrtý a pátý ročník. RVP pro první stupeň
uvádí sčítání a odčítání do 10 000 pamětně i písemně, násobení dvou dvouciferných
čísel, písemné dělení jednociferným dělitelem se zbytkem i beze zbytku,
desetinná čísla na dvě desetinná místa a zlomky kmenové i nekmenové.

## Lepší zdroj, modelový ŠVP

Na témže webu je předmětový modelový ŠVP "Matematika pro 1. stupeň ZŠ".
Leží na `revize.rvp.cz/zv/jak-na-svp/modelove-svp-pro-zs`, soubor se jmenuje
`2025-predmetovy-matematika-1st.pdf` a tentýž obsah je ke stažení i v XLSX,
což je pro strojové zpracování lepší.

Tenhle dokument má na rozdíl od RVP samostatné oddíly pro 1. až 5. ročník a
u každého sloupec "Učivo k dosažení OVU". Jsou v něm tedy ročníky i rozsahy:
3. ročník do 1 000, 4. ročník do 10 000, 5. ročník do milionu. Učivo čtvrtého
ročníku zní doslova "písemné sčítání a odčítání čísel; písemné násobení
jednociferným číslem; písemné násobení dvojciferným číslem; pamětné dělení
čísel se zbytkem do 100; písemné dělení čísel jednociferným číslem (se zbytkem
i beze zbytku); odhad výsledku početních operací".

Háček je v tom, že je to pracovní verze k pilotnímu ověřování. Finální znění
se čeká na přelomu let 2026 a 2027 a tematické plány k němu teprve vznikají.
Mapa z toho vyjde zhruba osmipoložková na ročník, ne třicetipoložková jako
u Matýska, takže rodičovský přepínač bude hrubší než u třetí třídy. Pořád je
to ale nastavitelné po čtvrtinách roku, což je použitelné.

## Licence

Datová sada RVP ZV na `opendata.npi.cz` má v podmínkách užití uvedeno
"Autorské dílo: Neobsahuje autorská díla. Originální databáze: Není
autorskoprávně chráněnou databází. Zvláštní právo pořizovatele databáze:
Nechráněno". Text RVP tedy jde převzít i doslova, na rozdíl od učebnice, ze
které se přebírá výhradně struktura.

Výjimkou jsou jednotlivé ilustrační materiály s uvedeným autorem. U těch stojí
"Licence: BY-NC-SA" a ty se nepřebírají.

Modelové ŠVP licenci neuvádějí. Pro ně tedy platí stejné opatrné pravidlo jako
pro učebnici, tedy přebírá se jen struktura, nikdy formulace.

## Co katalog témat nezná

Průzkum našel jedno téma, které `TEMATA.md` nemá vůbec, a několik dalších,
která by katalog potřeboval, kdyby se mělo pokrýt celé RVP.

Doplněné do katalogu je `number_pattern`, tedy doplnění dalšího členu číselné
řady s odvozením pravidla, aritmetické i geometrické, například `80, 40, 20, 10`.
Je to vlastní očekávaný výstup `-012` a jde na vstupní prvek `pad`, takže se
do závodu vejde beze změny enginu.

Do katalogu zatím **nepřidané**, ale v RVP jsou: čtení hodnoty ze stupnice
měřidla, převod jednoduchého zlomku na desetinné číslo a zpět, zaokrouhlení
desetinného čísla na přirozené, obsah útvaru ve čtvercové síti, objem počtem
jednotkových krychlí, kombinatorické vyhledání všech prvků splňujících zadané
podmínky a náhodné jevy. Přidávat je má smysl až ve chvíli, kdy se na ně bude
psát generátor, jinak by katalog jen narostl o řádky, na kterých nic nestojí.

## Co má Matýsek navíc proti RVP

Opačným směrem to taky nesedí. Matýskovy mapy obsahují římské číslice, měřítko
mapy, roznásobení závorky, aritmetický průměr a plošné jednotky, a nic z toho
v RVP pro první stupeň není. Není to chyba map ani chyba RVP, učebnice běžně
jdou nad povinné minimum. Pro nás to znamená jen to, že mapa z modelového ŠVP
a mapa z Matýska nebudou mít stejný seznam témat a nemá cenu je k sobě
dotlačovat.

## Kde pokračovat

Další krok je stažení XLSX verze modelového ŠVP a rozepsání sloupce "Učivo
k dosažení OVU" po ročnících do nové mapy `npi-msvp-1st`. Postup je v
`docs/PLAN.md`, krok G0. Rozhodnutí, jestli se do toho jde dřív než dorazí
ověřený Matýsek pro čtvrtý a pátý ročník, je tamtéž jako R8.
