# Kurikulum, model ve dvou vrstvách

Tenhle adresář drží odpověď na otázku, co se vlastně má procvičovat a v jakém
pořadí. Je oddělený od kódu hry záměrně a ve dvou vrstvách, protože tyhle dvě
věci se mění nezávisle na sobě.

## Proč dvě vrstvy

Kdyby každá učebnice znamenala psát nové generátory příkladů, přidání druhé
učebnice by stálo stejně práce jako první. Přitom třetí třída je všude stejná
matematika, liší se jen pořadí, tempo a číselné rozsahy. Model to tedy dělí:

**Katalog témat** v [TEMATA.md](TEMATA.md) popisuje, co hra umí vygenerovat.
Jedno téma je jeden generátor příkladů plus jeden vstupní prvek plus zařazení
do závodu nebo do dílny. Katalog je společný pro všechny učebnice a pro
adaptivní režim a roste jen tehdy, když se objeví typ úlohy, který hra
neumí.

**Mapa učebnice**, například [nns-matysek-3.md](nns-matysek-3.md), je uspořádaný
seznam kapitol jedné konkrétní řady. Každá kapitola odkazuje na témata
z katalogu a smí u nich zúžit číselný rozsah. Mapa nesmí zavádět téma, které
v katalogu není, to je signál, že katalog potřebuje rozšířit.

Přidat další učebnici pak znamená napsat jednu mapu. Pokud se v ní neobjeví nic
nového, nesahá se do kódu vůbec.

## Co tu je

| soubor | obsah | spolehlivost |
| --- | --- | --- |
| [TEMATA.md](TEMATA.md) | katalog témat, společný pro všechny mapy | |
| [nns-matysek-1.md](nns-matysek-1.md) | Matýskova matematika, 1. ročník | z obsahu |
| [nns-matysek-2.md](nns-matysek-2.md) | Matýskova matematika, 2. ročník | z obsahu |
| [nns-matysek-3.md](nns-matysek-3.md) | Matýskova matematika, 3. ročník | **z prolistovaných stránek** |
| [nns-matysek-4.md](nns-matysek-4.md) | Matýskova matematika, 4. ročník | z obsahu, část neověřená |
| [nns-matysek-5.md](nns-matysek-5.md) | Matýskova matematika, 5. ročník | z obsahu, část neověřená |

Třetí ročník je jediný postavený na skutečně prohlédnutých stránkách obou
pracovních sešitů. Katalog témat vznikl z něj, a proto je v prvních třech
ročnících spolehlivý: celá řada používá dokola stejný slovník asi osmi formátů
zadání. Ve čtvrtém a pátém ročníku přibývají písemné algoritmy, zlomky, rovnice
a desetinná čísla, kde z názvu kapitoly formát odpovědi poznat nejde. Ta témata
jsou v mapách značená `?` a v katalogu vedená jako neověřená.

## Jak se to promítne do profilu

Volba učebnice patří profilu dítěte, ne aplikaci. V jedné rodině může mít každé
dítě jinou učebnici a jiné tempo.

```js
profil = {
  ...
  curriculum: "nns-matysek-3",   // id mapy, nebo null pro čistě adaptivní režim
  chapter: 12,                   // kde třída právě je, nebo null
  chapterMode: "soft"            // "soft" nebo "hard", viz níž
}
```

Výchozí stav je `curriculum: null`, tedy adaptivní režim, který hra má dneska.
Rodič si v rodičovské sekci vybere učebnici a pak posouvá kapitolu podle toho,
kde třída je.

Měkký režim serveruje přibližně sedmdesát procent příkladů z aktuální kapitoly
a zbytek z dřívějších podle Leitnerovy krabičky. Tvrdý režim bere jen aktuální
kapitolu. Měkký je výchozí, protože jinak by se rozpadl celý mechanismus
rozloženého opakování, na kterém hra stojí.

## Autorská práva

Z učebnice se přebírá výhradně struktura, tedy jaká témata, v jakém pořadí,
v jakém číselném rozsahu a jakým typem úlohy. Zadání ani obrázky se nepřebírají,
příklady si hra generuje vlastní. Odkazy na strany v mapách slouží jen jako
kotva pro rodiče, který v sešitě listuje, a jako důkaz, odkud struktura pochází.

## Jak přidat další učebnici

Projít obsah, rozepsat kapitoly do nové mapy, u každé kapitoly přiřadit témata
z katalogu. Co katalog nepokrývá, dopsat nejdřív do katalogu i s návrhem
vstupního prvku a zařazením do závodu nebo dílny. Teprve pak se píše kód.
