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
 *                                 carry: "yes" crosses ten, "no" stays below
 *                                 addend: one of the two addends is in the list
 *   as100 [bucket ids]            h1..h5, the difficulty buckets within 100
 *
 * Source of the sequences: docs/kurikulum/. Structure only, no content.
 * ------------------------------------------------------------------ */
const ALL_TABLES = [1,2,3,4,5,6,7,8,9,10];
const ALL_H = ["h1","h2","h3","h4","h5"];

const CURRICULA = [
  {
    id: "nns-matysek-1",
    name: "Matýskova matematika, 1. ročník",
    lang: "cs",
    grade: 1,
    chapters: [
      {n:1,  name:"Úvodní procvičování",      src:"1. díl, s. 1–7",   pool:null},
      {n:2,  name:"Číslo 1",                  src:"1. díl, s. 8–9",   pool:null},
      {n:3,  name:"Čísla 1 a 2",              src:"1. díl, s. 10–15", pool:null},
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
      {n:15, name:"Obor 0 až 15, část A",     src:"3. díl, s. 1–16",  pool:null},
      {n:16, name:"Obor 0 až 15, část B",     src:"3. díl, s. 17–30", pool:null},
      {n:17, name:"Obor 0 až 20, část C",     src:"3. díl, s. 31–44", pool:null},
      {n:18, name:"Obor 0 až 20, část D",     src:"3. díl, s. 45–60", pool:null}
    ]
  },
  {
    id: "nns-matysek-2",
    name: "Matýskova matematika, 2. ročník",
    lang: "cs",
    grade: 2,
    chapters: [
      {n:1,  name:"Opakování do dvaceti bez přechodu", src:"4. díl, s. 1–11",  pool:{as20:{maxSum:10}}},
      {n:2,  name:"Sčítání 9 +, odčítání 11 −",        src:"4. díl, s. 12–25", pool:{as20:{carry:"yes", addend:[9]}}},
      {n:3,  name:"Sčítání 8 +, odčítání 12 −",        src:"4. díl, s. 26–37", pool:{as20:{carry:"yes", addend:[8,9]}}},
      {n:4,  name:"Sčítání 7 +, odčítání 13 −",        src:"4. díl, s. 38–47", pool:{as20:{carry:"yes", addend:[7,8,9]}}},
      {n:5,  name:"Sčítání 6 + a 5 +",                 src:"4. díl, s. 48–55", pool:{as20:{carry:"yes", addend:[5,6,7,8,9]}}},
      {n:6,  name:"Sčítání 4 +, 3 +, 2 +",             src:"4. díl, s. 56–64", pool:{as20:{carry:"yes"}}},
      {n:7,  name:"Opakování do dvaceti",              src:"5. díl, s. 1–7",   pool:{as20:{maxSum:20}}},
      {n:8,  name:"Obor do sta, celé desítky",         src:"5. díl, s. 8–19",  pool:{as100:["h3"]}},
      {n:9,  name:"Početní operace do 39",             src:"5. díl, s. 20–34", pool:{as100:["h1","h2"]}},
      {n:10, name:"Početní operace do 59",             src:"5. díl, s. 35–49", pool:{as100:["h1","h2","h3"]}},
      {n:11, name:"Početní operace do 100",            src:"5. díl, s. 50–64", pool:{as100:ALL_H}},
      {n:12, name:"Vyvození násobení, násobilka 2",    src:"6. díl, s. 1–10",  pool:{mult:[2], div:[2]}},
      {n:13, name:"Násobilka 3",                       src:"6. díl, s. 11–16", pool:{mult:[2,3], div:[2,3]}},
      {n:14, name:"Násobení a dělení 1 a 0",           src:"6. díl, s. 17–19", pool:{mult:[1,2,3], div:[2,3]}},
      {n:15, name:"Násobilka 4, 5 a 10",               src:"6. díl, s. 24–37", pool:{mult:[4,5,10], div:[4,5,10]}},
      {n:16, name:"Násobilka 6 a 7",                   src:"6. díl, s. 43–52", pool:{mult:[6,7], div:[6,7]}},
      {n:17, name:"Násobilka 8 a 9",                   src:"6. díl, s. 54–61", pool:{mult:[8,9], div:[8,9]}},
      {n:18, name:"Procvičování celé násobilky",       src:"6. díl, s. 20–22, 40–41, 62–63", pool:{mult:ALL_TABLES, div:ALL_TABLES}},
      {n:19, name:"Geometrie",                         src:"6. díl, s. 23, 42, 53, 64", pool:null}
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
      {n:4,  name:"Hodiny a určování času",               src:"7. díl, s. 10–11", pool:null},
      {n:5,  name:"Zkouška správnosti",                   src:"7. díl, s. 12–13", pool:null},
      {n:6,  name:"Jednociferná až trojciferná, sudá a lichá", src:"7. díl, s. 14–15", pool:null},
      {n:7,  name:"Zaokrouhlování na desítky",            src:"7. díl, s. 16",    pool:null},
      {n:8,  name:"Dvojciferná bez přechodu",             src:"7. díl, s. 16–19", pool:{as100:["h1","h4"]}},
      {n:9,  name:"Sčítání do celých desítek",            src:"7. díl, s. 20–23", pool:{as100:["h2","h3"]}},
      {n:10, name:"S přechodem přes základ 10",           src:"7. díl, s. 24–27", pool:{as100:["h2","h5"]}},
      {n:11, name:"Sčítání a odčítání více čísel",        src:"7. díl, s. 28–29", pool:null},
      {n:12, name:"Opakování do sta",                     src:"7. díl, s. 30–31", pool:{as100:ALL_H}},
      {n:13, name:"Početní operace se závorkami",         src:"7. díl, s. 32–34", pool:null},
      {n:14, name:"Násobení mimo rozsah malé násobilky",  src:"7. díl, s. 34–37", pool:null},
      {n:15, name:"Písemné násobení",                     src:"7. díl, s. 36–39", pool:null},
      {n:16, name:"Dělení mimo rozsah malé násobilky",    src:"7. díl, s. 38–41", pool:null},
      {n:17, name:"Jednotky délky, hmotnosti a objemu",   src:"7. díl, s. 40–43", pool:null},
      {n:18, name:"Jednotky času",                        src:"7. díl, s. 44–45", pool:null},
      {n:19, name:"Zlomky, úvodní seznámení",             src:"7. díl, s. 46–47", pool:null},
      {n:20, name:"Opakování celého pololetí",            src:"7. díl, s. 48–49", pool:{mult:ALL_TABLES, div:ALL_TABLES, as100:ALL_H}},
      {n:21, name:"Obor do tisíce, číselná osa",          src:"8. díl, s. 2–5",   pool:null},
      {n:22, name:"Porovnávání čísel do tisíce",          src:"8. díl, s. 4–5",   pool:null},
      {n:23, name:"Sčítání a odčítání po stovkách",       src:"8. díl, s. 6–7",   pool:null},
      {n:24, name:"Přičítání a odčítání do tisíce",       src:"8. díl, s. 8–27",  pool:null},
      {n:25, name:"Opakování oboru do tisíce",            src:"8. díl, s. 28–29", pool:null},
      {n:26, name:"Zaokrouhlování na desítky a stovky",   src:"8. díl, s. 30",    pool:null},
      {n:27, name:"Dělení se zbytkem",                    src:"8. díl, s. 30–35", pool:null},
      {n:28, name:"Násobení a dělení 10 a 100",           src:"8. díl, s. 36–39", pool:null},
      {n:29, name:"Převody jednotek",                     src:"8. díl, s. 38–41", pool:null},
      {n:30, name:"Sloučené početní operace",             src:"8. díl, s. 40–41", pool:null},
      {n:31, name:"Mimo rozsah malé násobilky do tisíce", src:"8. díl, s. 42–47", pool:null},
      {n:32, name:"Zlomky a porovnávání zlomků",          src:"8. díl, s. 45–47", pool:null},
      {n:33, name:"Závěrečné opakování",                  src:"8. díl, s. 48–49", pool:{mult:ALL_TABLES, div:ALL_TABLES, as100:ALL_H}}
    ]
  }
];
