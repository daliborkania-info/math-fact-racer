/* ------------------------------------------------------------------ *
 * Curricula: the sequence layer.
 *
 * The topic catalogue (what the game can generate) lives in the engine.
 * This file only says, for one textbook series, which chapters come in
 * which order and which facts belong to each. Adding another textbook
 * means adding an entry here, not writing generators.
 *
 * Chapter names stay in the language of the textbook. A Czech series
 * has Czech chapter names whatever language the interface is set to,
 * because that is what the parent reads on the cover.
 *
 * `pool` is null for a chapter whose topic the game cannot generate yet.
 * Such a chapter is still listed, so the parent can set where the class
 * actually is, but it produces no race of its own.
 *
 * pool fields:
 *   mult  [tables]                multiplication facts touching those tables
 *   div   [tables]                division facts touching those tables
 *   as20  {maxSum, carry, addend} addition and subtraction within 20
 *                                 carry: "yes" crosses a ten, "no" never
 *                                 does, which still allows 13 + 4
 *                                 addend: one of the two addends is in the list
 *   as100 [bucket ids]            h1..h5, the difficulty buckets within 100
 *   as1000 [bucket ids]           b1..b6, the steps into the thousand,
 *                                 from whole hundreds to crossing one
 *   multBeyond [bucket ids]       1..4, multiplying past the times table,
 *   divBeyond  [bucket ids]       and the same examples read backwards.
 *                                 The two are separate fields because the
 *                                 book teaches them as separate chapters
 *   round [bucket ids]            o1..o3, rounding: tens under a hundred,
 *                                 tens of a three digit number, hundreds
 *   chain [bucket ids]            1..3, three numbers and two signs,
 *                                 within twenty, whole tens, the hundred
 *   clock [bucket ids]            c1..c6, telling the time by precision,
 *                                 c6 being the afternoon 24 hour reading
 *   shop  [job ids]               workshop jobs, for material that is
 *                                 reasoning rather than recall. A chapter
 *                                 with only these is pickable but puts no
 *                                 track on the map.
 *
 * Source of the sequences: docs/kurikulum/. Structure only, no content.
 * ------------------------------------------------------------------ */
const ALL_TABLES = [1,2,3,4,5,6,7,8,9,10];
const ALL_H = ["h1","h2","h3","h4","h5"];
const ALL_C = ["c1","c2","c3","c4","c5","c6"];
const ALL_K = ["b1","b2","b3","b4","b5","b6"];
const ALL_X = ["1","2","3","4"];
const ALL_O = ["o1","o2","o3"];

const CURRICULA = [
  {
    id: "nns-matysek-1",
    name: "Matýskova matematika, 1. ročník",
    lang: "cs",
    grade: 1,
    chapters: [
      // the first three chapters are counting things on a picture, which
      // is workshop material: pickable, and it points at the counting job
      {n:1,  name:"Úvodní procvičování",      src:"1. díl, s. 1–7",   pool:{shop:["count"]}},
      {n:2,  name:"Číslo 1",                  src:"1. díl, s. 8–9",   pool:{shop:["count"]}},
      {n:3,  name:"Čísla 1 a 2",              src:"1. díl, s. 10–15", pool:{shop:["count"]}},
      {n:4,  name:"Čísla 1 až 3",             src:"1. díl, s. 16–23", pool:{as20:{maxSum:3}}},
      {n:5,  name:"Čísla 1 až 4",             src:"1. díl, s. 24–33", pool:{as20:{maxSum:4}}},
      {n:6,  name:"Čísla 1 až 5",             src:"1. díl, s. 34–43", pool:{as20:{maxSum:5}}},
      {n:7,  name:"Čísla 0 až 5",             src:"1. díl, s. 44–53", pool:{as20:{maxSum:5}}},
      {n:8,  name:"Opakování do pěti",        src:"1. díl, s. 54–60", pool:{as20:{maxSum:5}}},
      {n:9,  name:"Číslo 6",                  src:"2. díl, s. 1–11",  pool:{as20:{maxSum:6}}},
      {n:10, name:"Číslo 7",                  src:"2. díl, s. 12–22", pool:{as20:{maxSum:7}}},
      {n:11, name:"Číslo 8",                  src:"2. díl, s. 23–33", pool:{as20:{maxSum:8}}},
      {n:12, name:"Číslo 9",                  src:"2. díl, s. 34–44", pool:{as20:{maxSum:9}}},
      {n:13, name:"Číslo 10",                 src:"2. díl, s. 45–55", pool:{as20:{maxSum:10}}},
      {n:14, name:"Opakování do deseti",      src:"2. díl, s. 56–60", pool:{as20:{maxSum:10}}},
      // the whole third part stays under the ten bridge, only the range grows
      {n:15, name:"Obor 0 až 15, část A",     src:"3. díl, s. 1–16",  pool:{as20:{maxSum:15, carry:"no"}}},
      {n:16, name:"Obor 0 až 15, část B",     src:"3. díl, s. 17–30", pool:{as20:{maxSum:15, carry:"no"}}},
      {n:17, name:"Obor 0 až 20, část C",     src:"3. díl, s. 31–44", pool:{as20:{maxSum:20, carry:"no"}}},
      {n:18, name:"Obor 0 až 20, část D",     src:"3. díl, s. 45–60", pool:{as20:{maxSum:20, carry:"no"}}}
    ]
  },
  {
    id: "nns-matysek-2",
    name: "Matýskova matematika, 2. ročník",
    lang: "cs",
    grade: 2,
    chapters: [
      {n:1,  name:"Opakování do dvaceti bez přechodu", src:"4. díl, s. 2–5",   pool:{as20:{carry:"no"}}},
      {n:2,  name:"Určování času a osová souměrnost",  src:"4. díl, s. 6–9",   pool:{clock:["c1","c2"]}},
      // workshop material: pickable and it does something, but it has no
      // race of its own, so no track appears on the map for it
      {n:3,  name:"Finanční gramotnost, mince a směňování", src:"4. díl, s. 10–11", pool:{shop:["money"]}},
      {n:4,  name:"Sčítání 9 +, odčítání 11 −",        src:"4. díl, s. 12–25", pool:{as20:{carry:"yes", addend:[9]}}},
      {n:5,  name:"Sčítání 8 +, odčítání 12 −",        src:"4. díl, s. 26–37", pool:{as20:{carry:"yes", addend:[8,9]}}},
      {n:6,  name:"Sčítání 7 +, odčítání 13 −",        src:"4. díl, s. 38–47", pool:{as20:{carry:"yes", addend:[7,8,9]}}},
      {n:7,  name:"Sčítání 6 + a 5 +, odčítání 14 − a 15 −", src:"4. díl, s. 48–55", pool:{as20:{carry:"yes", addend:[5,6,7,8,9]}}},
      {n:8,  name:"Sčítání 4 +, 3 +, 2 +, odčítání 16 − až 18 −", src:"4. díl, s. 56–61", pool:{as20:{carry:"yes"}}},
      {n:9,  name:"Určování času a čtvrtina",          src:"4. díl, s. 62–65", pool:{clock:["c1","c2","c3"]}},
      {n:10, name:"Opakování do dvaceti",              src:"5. díl, s. 2–5",   pool:{as20:{maxSum:20}}},
      {n:11, name:"Desítky a jednotky, obor do sta",   src:"5. díl, s. 8–11",  pool:{as100:["h3"]}},
      {n:12, name:"Sčítání a odčítání desítek",        src:"5. díl, s. 12–19", pool:{as100:["h3"]}},
      {n:13, name:"Početní operace v oboru 0 až 39",   src:"5. díl, s. 20–31", pool:{as100:["h1","h2"]}},
      {n:14, name:"Určování času, tři čtvrtiny",       src:"5. díl, s. 32–33", pool:{clock:["c1","c2","c3"]}},
      {n:15, name:"Početní operace v oboru 0 až 59",   src:"5. díl, s. 34–47", pool:{as100:["h1","h2","h3"]}},
      {n:16, name:"Určování času a rýsování úsečky",   src:"5. díl, s. 48–49", pool:{clock:["c1","c2","c3","c4"]}},
      {n:17, name:"Početní operace v oboru 0 až 100",  src:"5. díl, s. 50–61", pool:{as100:ALL_H}},
      {n:18, name:"Určování času a osová souměrnost",  src:"5. díl, s. 62–65", pool:{clock:["c1","c2","c3","c4"]}},
      {n:19, name:"Násobení číslem 2",                 src:"6. díl, s. 2–5",   pool:{mult:[2]}},
      {n:20, name:"Dělení číslem 2",                   src:"6. díl, s. 6–9",   pool:{mult:[2], div:[2]}},
      {n:21, name:"Násobení číslem 3",                 src:"6. díl, s. 10–13", pool:{mult:[2,3]}},
      {n:22, name:"Dělení číslem 3",                   src:"6. díl, s. 14–15", pool:{mult:[2,3], div:[2,3]}},
      {n:23, name:"Násobení a dělení číslem 1 a 0",    src:"6. díl, s. 16–19", pool:{mult:[1,2,3], div:[2,3]}},
      {n:24, name:"Procvičování násobilky 1, 2, 3",    src:"6. díl, s. 20–21", pool:{mult:[1,2,3], div:[2,3]}},
      {n:25, name:"Geometrie a určování času",         src:"6. díl, s. 22–23", pool:{clock:["c1","c2","c3","c4"]}},
      {n:26, name:"Násobení číslem 4",                 src:"6. díl, s. 24–25", pool:{mult:[4]}},
      {n:27, name:"Dělení číslem 4",                   src:"6. díl, s. 26–29", pool:{mult:[4], div:[4]}},
      {n:28, name:"Násobení číslem 5",                 src:"6. díl, s. 30–31", pool:{mult:[5]}},
      {n:29, name:"Dělení číslem 5",                   src:"6. díl, s. 32–35", pool:{mult:[5], div:[5]}},
      {n:30, name:"Násobení číslem 10",                src:"6. díl, s. 36–37", pool:{mult:[10]}},
      {n:31, name:"Dělení číslem 10",                  src:"6. díl, s. 38–39", pool:{mult:[10], div:[10]}},
      {n:32, name:"Procvičování násobilky 4, 5, 10",   src:"6. díl, s. 40–41", pool:{mult:[1,2,3,4,5,10], div:[2,3,4,5,10]}},
      {n:33, name:"Násobení číslem 6",                 src:"6. díl, s. 42–43", pool:{mult:[6]}},
      {n:34, name:"Dělení číslem 6",                   src:"6. díl, s. 44–45", pool:{mult:[6], div:[6]}},
      {n:35, name:"Násobení číslem 7",                 src:"6. díl, s. 46–47", pool:{mult:[7]}},
      {n:36, name:"Dělení číslem 7",                   src:"6. díl, s. 48–49", pool:{mult:[7], div:[7]}},
      {n:37, name:"Procvičování násobilky 6 a 7",      src:"6. díl, s. 50–51", pool:{mult:[1,2,3,4,5,6,7,10], div:[2,3,4,5,6,7,10]}},
      {n:38, name:"Geometrie a určování času",         src:"6. díl, s. 52–53", pool:{clock:["c1","c2","c3","c4","c5"]}},
      {n:39, name:"Násobení číslem 8",                 src:"6. díl, s. 54–55", pool:{mult:[8]}},
      {n:40, name:"Dělení číslem 8",                   src:"6. díl, s. 56–57", pool:{mult:[8], div:[8]}},
      {n:41, name:"Násobení číslem 9",                 src:"6. díl, s. 58–59", pool:{mult:[9]}},
      {n:42, name:"Dělení číslem 9",                   src:"6. díl, s. 60–61", pool:{mult:[9], div:[9]}},
      {n:43, name:"Procvičování celé násobilky",       src:"6. díl, s. 62–63", pool:{mult:ALL_TABLES, div:ALL_TABLES}},
      {n:44, name:"Geometrie",                         src:"6. díl, s. 64–65", pool:null}
    ]
  },
  {
    id: "nns-matysek-3",
    name: "Matýskova matematika, 3. ročník",
    lang: "cs",
    grade: 3,
    chapters: [
      {n:1,  name:"Opakování, sčítání a odčítání do 100", src:"7. díl, s. 2–5",   pool:{as100:ALL_H}},
      {n:2,  name:"Opakování, násobilka 1, 2, 3, 4, 10",  src:"7. díl, s. 6–7",   pool:{mult:[1,2,3,4,10], div:[1,2,3,4,10]}},
      {n:3,  name:"Opakování, násobilka 5, 6, 7, 8, 9",   src:"7. díl, s. 8–9",   pool:{mult:[5,6,7,8,9], div:[5,6,7,8,9]}},
      {n:4,  name:"Hodiny a určování času",               src:"7. díl, s. 10–11", pool:{clock:ALL_C}},
      {n:5,  name:"Zkouška správnosti",                   src:"7. díl, s. 12–13", pool:null},
      {n:6,  name:"Jednociferná až trojciferná, sudá a lichá", src:"7. díl, s. 14–15", pool:null},
      // the seventh part is still under a hundred, so only two digit numbers
      {n:7,  name:"Zaokrouhlování na desítky",            src:"7. díl, s. 16",    pool:{round:["o1"]}},
      {n:8,  name:"Dvojciferná bez přechodu",             src:"7. díl, s. 16–19", pool:{as100:["h1","h4"]}},
      {n:9,  name:"Sčítání do celých desítek",            src:"7. díl, s. 20–23", pool:{as100:["h2","h3"]}},
      {n:10, name:"S přechodem přes základ 10",           src:"7. díl, s. 24–27", pool:{as100:["h2","h5"]}},
      {n:11, name:"Sčítání a odčítání více čísel",        src:"7. díl, s. 28–29", pool:{chain:["1","2","3"]}},
      {n:12, name:"Opakování do sta",                     src:"7. díl, s. 30–31", pool:{as100:ALL_H}},
      {n:13, name:"Početní operace se závorkami",         src:"7. díl, s. 32–34", pool:null},
      // the seventh part stays inside a hundred, so only the first two
      // buckets; the eighth part takes the same skill past it, chapter 31
      {n:14, name:"Násobení mimo rozsah malé násobilky",  src:"7. díl, s. 34–37", pool:{multBeyond:["1","2"]}},
      {n:15, name:"Písemné násobení",                     src:"7. díl, s. 36–39", pool:null},
      {n:16, name:"Dělení mimo rozsah malé násobilky",    src:"7. díl, s. 38–41", pool:{divBeyond:["1","2"]}},
      {n:17, name:"Jednotky délky, hmotnosti a objemu",   src:"7. díl, s. 40–43", pool:null},
      {n:18, name:"Jednotky času",                        src:"7. díl, s. 44–45", pool:null},
      {n:19, name:"Zlomky, úvodní seznámení",             src:"7. díl, s. 46–47", pool:null},
      {n:20, name:"Opakování celého pololetí",            src:"7. díl, s. 48–49", pool:{mult:ALL_TABLES, div:ALL_TABLES, as100:ALL_H}},
      {n:21, name:"Obor do tisíce, číselná osa",          src:"8. díl, s. 2–5",   pool:null},
      {n:22, name:"Porovnávání čísel do tisíce",          src:"8. díl, s. 4–5",   pool:null},
      {n:23, name:"Sčítání a odčítání po stovkách",       src:"8. díl, s. 6–7",   pool:{as1000:["b1"]}},
      // the book walks these twenty pages through all six steps in order
      {n:24, name:"Přičítání a odčítání do tisíce",       src:"8. díl, s. 8–27",  pool:{as1000:ALL_K}},
      {n:25, name:"Opakování oboru do tisíce",            src:"8. díl, s. 28–29", pool:{as1000:ALL_K, as100:ALL_H}},
      {n:26, name:"Zaokrouhlování na desítky a stovky",   src:"8. díl, s. 30",    pool:{round:ALL_O}},
      {n:27, name:"Dělení se zbytkem",                    src:"8. díl, s. 30–35", pool:null},
      {n:28, name:"Násobení a dělení 10 a 100",           src:"8. díl, s. 36–39", pool:null},
      {n:29, name:"Převody jednotek",                     src:"8. díl, s. 38–41", pool:null},
      {n:30, name:"Sloučené početní operace",             src:"8. díl, s. 40–41", pool:null},
      {n:31, name:"Mimo rozsah malé násobilky do tisíce", src:"8. díl, s. 42–47",
             pool:{multBeyond:ALL_X, divBeyond:ALL_X}},
      {n:32, name:"Zlomky a porovnávání zlomků",          src:"8. díl, s. 45–47", pool:null},
      {n:33, name:"Závěrečné opakování",                  src:"8. díl, s. 48–49", pool:{mult:ALL_TABLES, div:ALL_TABLES, as100:ALL_H, as1000:ALL_K}}
    ]
  }
];
