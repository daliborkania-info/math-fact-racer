"use strict";
/* =================================================================
   1. LANGUAGE
   The parent section and every player profile can run in a different
   language. render() decides which one applies to the screen it draws.
   ================================================================= */
const FALLBACK_LANG = "en";
const PARENT_VIEWS = ["setpin", "gate", "parent", "players"];
let CUR_LANG = FALLBACK_LANG;
/* Which world the words come from, empty for the parent section. A world
   renames only the handful of things that read wrong in it: nobody
   drives along a forest trail. The dictionary therefore holds just the
   words that really differ, under `w_<world>_<key>`, and everything else
   falls through to the plain key instead of being copied four times. */
let CUR_WORLD = "";

function detectLang(){
  const wanted = (navigator.languages || [navigator.language || ""])
    .map(l => String(l).slice(0, 2).toLowerCase());
  for(const l of wanted) if(I18N[l]) return l;
  return FALLBACK_LANG;
}
function t(key){
  const dict = I18N[CUR_LANG] || I18N[FALLBACK_LANG];
  let s = CUR_WORLD ? dict["w_" + CUR_WORLD + "_" + key] : undefined;
  if(s === undefined) s = dict[key];
  if(s === undefined) s = I18N[FALLBACK_LANG][key];
  if(s === undefined) return key;
  for(let i = 1; i < arguments.length; i++) s = s.split("{" + (i-1) + "}").join(arguments[i]);
  return s;
}
/* Decimal separator follows the interface language, not the browser locale. */
function num(x, decimals){
  const s = Number(x).toFixed(decimals === undefined ? 0 : decimals);
  return CUR_LANG === "en" ? s : s.replace(".", ",");
}
function applyLang(){
  const p = P();
  const parent = PARENT_VIEWS.indexOf(view.name) >= 0;
  CUR_LANG = parent
    ? (DB.lang || FALLBACK_LANG)
    : ((p && p.lang) || DB.lang || FALLBACK_LANG);
  // the parent section talks about the game, not from inside it, so it
  // keeps the plain words whatever world the child is playing in
  CUR_WORLD = (!parent && p && p.world) ? p.world : "";
  try{ document.documentElement.lang = CUR_LANG; }catch(e){}
}
/* The school year picker, the same control in the new player sheet and
   in the parent section. Nothing before the first year and nothing past
   the fourth: the game has no material for either. */
function gradeSeg(act, current){
  return `<div class="seg">` + [1,2,3,4].map(function(g){
    return `<button class="${current === g ? "on" : ""}" data-act="${act}" data-gr="${g}">${t("grade" + g)}</button>`;
  }).join("") + `</div>`;
}
function langSeg(act, current){
  return `<div class="seg">` + LANGS.map(function(l){
    return `<button class="${current === l[0] ? "on" : ""}" data-act="${act}" data-lang="${l[0]}">${l[1]}</button>`;
  }).join("") + `</div>`;
}

/* =================================================================
   2. STORAGE
   Everything lives in one localStorage entry. There is no server.
   ================================================================= */
const KEY = "math-fact-racer-v1";
let DB = { profiles: [], current: null, sound: true, lang: null };

function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(raw) DB = Object.assign(DB, JSON.parse(raw));
  }catch(e){ /* first run, or storage blocked by the browser */ }
  DB.profiles = DB.profiles || [];
  DB.lang = DB.lang || detectLang();
  for(const p of DB.profiles){
    // the free starter set belongs to everyone, including older profiles
    p.owned = p.owned || [];
    for(const s of STARTERS) if(!p.owned.includes(s)) p.owned.push(s);
    if(!p.runner || !p.owned.includes(p.runner)) p.runner = STARTERS[0];
    p.lang = p.lang || DB.lang;
    // curriculum choice, added later: older profiles stay adaptive
    if(p.curriculum === undefined) p.curriculum = null;
    if(p.chapter === undefined) p.chapter = null;
    p.chapterMode = p.chapterMode || "soft";
    // a curriculum that no longer exists must not strand the profile
    if(p.curriculum && !curriculumById(p.curriculum)){ p.curriculum = null; p.chapter = null; }
    if(p.curriculum) normalizeChapter(p);
    seedOpened(p);
    seedShop(p);
    seedStars(p);
    seedWorld(p);
    seedGrade(p);
    seedBands(p);
  }
}
/* The workshop, added later. An older profile has none of this and must
   simply start with an empty toolbox; nothing it already owns is touched. */
function seedShop(p){
  if(typeof p.parts !== "number") p.parts = 0;
  p.paints  = p.paints  || [];     // paint ids bought with parts
  p.paint   = p.paint   || {};     // machine id -> paint id currently on it
  p.jobRuns = p.jobRuns || {};     // workshop job id -> pieces of work finished
}
/* The collection, added later. A place lights up when a fact reaches
   level four and never goes dark again, so it cannot be derived from
   the box: a fact that was forgotten is back at level one while its
   place has to stay lit. An older profile has no record of what it once
   knew, so the best it can be given is what it knows right now. */
function seedStars(p){
  p.stars = p.stars || {};
  for(const k of Object.keys(p.facts || {})) if(p.facts[k].lv >= STAR_LV) p.stars[k] = true;
}
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(DB)); }catch(e){}
}
function P(){ return DB.profiles.find(p => p.id === DB.current) || null; }

/* A new profile is told which school year the child is in, because that
   is what decides how much of the map is laid out in front of them. An
   older profile, and an imported backup from before this existed, has no
   year and gets the top one, which is what it was already seeing. */
function newProfile(name, grade){
  return {
    id: "p" + Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    name: name,
    lang: DB.lang || FALLBACK_LANG,
    facts: {},          // fact key -> {lv, reps, ok, bad, best, seen}
    stars: {},          // fact key -> true once it has ever reached level 4
    best: {},           // track id -> best run {dist, hist, n0}
    done: {},           // track id -> best medal 0..3
    owned: STARTERS.slice(),
    runner: STARTERS[0],
    xp: {},             // collectible id -> experience
    coins: 0,
    parts: 0,           // workshop currency, cannot be earned by racing
    paints: [],         // paint ids bought with parts
    paint: {},          // machine id -> paint id currently on it
    jobRuns: {},        // workshop job id -> pieces of work finished
    trackRuns: {},      // track id -> races completed
    opened: {},         // track id -> true once it has ever been unlocked
    force: {},          // parent override: track id -> true/false
    autoUnlock: true,
    qCount: 20,
    speedMode: "normal",// slow | normal | fast (fast answer threshold)
    curriculum: null,   // curriculum id, or null for the adaptive default
    chapter: null,      // chapter number inside that curriculum
    chapterMode: "soft",// soft keeps spaced review, hard drills the chapter only
    world: "circuit",   // the coat the game wears; never changes difficulty
    grade: (grade >= 1 && grade <= MAX_GRADE) ? grade : MAX_GRADE,
    streak: 0, lastDay: null, bestStreak: 0,
    runs: 0, totalOk: 0, totalAns: 0, msSum: 0, msN: 0,
    created: Date.now()
  };
}

function today(){ const d = new Date(); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); }
function touchStreak(p){
  const t = today();
  if(p.lastDay === t) return false;
  const y = new Date(); y.setDate(y.getDate()-1);
  const yk = y.getFullYear()+"-"+(y.getMonth()+1)+"-"+y.getDate();
  p.streak = (p.lastDay === yk) ? p.streak + 1 : 1;
  p.lastDay = t;
  if(p.streak > p.bestStreak) p.bestStreak = p.streak;
  return true;
}

/* =================================================================
   3. QUESTIONS
   55 unique multiplication facts (commutative pairs collapsed), the
   same for addition within 20, and five difficulty buckets each for
   addition and subtraction within 100.
   ================================================================= */
const MULT = [];
for(let a=1; a<=10; a++) for(let b=a; b<=10; b++) MULT.push({a,b});   // 55 facts

/* Addition within twenty is not only single digit plus single digit.
   The whole of the first grade is spent on the teens without ever
   crossing a ten, so 13 + 4 has to be a fact of its own; the old key
   space could not even write it down. A teen fact is stored the same
   way as any other, larger number second, so 13 + 4 is a4p13 and the
   generator needs no special case at all. */
const ADD = [];
for(let a=1; a<=10; a++) for(let b=a; b<=10; b++) ADD.push({a,b});    // sums within 20
for(let teen=11; teen<=19; teen++) for(let d=1; d<=9-(teen%10); d++) ADD.push({a:d, b:teen});

/* Crossing a ten is what makes an addition hard, and it happens when
   the units alone add up past ten. Written this way the rule holds for
   6 + 7, for 13 + 4 and for 10 + 7 alike, and making a whole ten does
   not count as crossing one. */
const crossesTen = (a,b) => (a % 10) + (b % 10) > 10;

/* The first year is not one skill and not one track. The books add one
   number at a time and practise everything inside the range they have
   reached: to three, to five, to seven, to ten, then the teens without
   ever leaving the ten, first to fifteen and then to twenty. A child in
   the first weeks has no business meeting 20 - 10, and putting the whole
   of the first year behind one door did exactly that.
   Each range is therefore a place of its own, and it holds only the
   facts it introduces; everything earlier comes back as review through
   the Leitner box, the same shape as every other track here.
   The ranges are read off the first year map in docs/kurikulum. */
const BANDS = [
  {id:"a3",  lo:2,  hi:3},
  {id:"a5",  lo:4,  hi:5},
  {id:"a7",  lo:6,  hi:7},
  {id:"a10", lo:8,  hi:10},
  {id:"a15", lo:11, hi:15},
  {id:"a20", lo:16, hi:20}
];
const inBand = (b, f) => !crossesTen(f.a, f.b) && (f.a + f.b) >= b.lo && (f.a + f.b) <= b.hi;
function bandKeys(id){
  const b = BANDS.find(x => x.id === id) || BANDS[0];
  const out = [];
  for(const f of ADD) if(inBand(b, f)) out.push(ak(f.a,f.b), sk(f.a,f.b));
  return out;
}

/* Crossing the ten is not one skill but four, and they are not equally
   hard. Making ten from a nine is the easiest bridge and gets taught
   first, then eight, then seven, then the rest. The order is lifted from
   Matyskova matematika part four, which devotes a whole chapter to each.
   A fact belongs to the stage of its larger addend, which is the chapter
   where the book first teaches it. The whole of it is second year work,
   which is why it is a track of its own and not the tail of the first
   year's ladder. */
const E_STAGES = [
  {id:"e3", has:(a,b) => crossesTen(a,b) && Math.max(a,b) === 9},
  {id:"e4", has:(a,b) => crossesTen(a,b) && Math.max(a,b) === 8},
  {id:"e5", has:(a,b) => crossesTen(a,b) && Math.max(a,b) === 7},
  {id:"e6", has:(a,b) => crossesTen(a,b) && Math.max(a,b) <= 6}
];

const H_BUCKETS = [
  {id:"h1", label:"two digit plus one digit, no carry"},
  {id:"h2", label:"one digit crossing the ten"},
  {id:"h3", label:"round tens"},
  {id:"h4", label:"two digit plus two digit, no carry"},
  {id:"h5", label:"two digit plus two digit with a carry"}
];

/* Within a thousand the book splits the work twice over: by what is
   being added, a single digit, whole tens, or a two digit number, and
   by whether the hundred has to be crossed. That is six steps, and the
   eighth part spends twenty pages walking through them in this order,
   so the buckets are staged like the bridges over ten rather than drawn
   from one bag: the child meets whole hundreds first and carrying into
   the next hundred last. */
const K_BUCKETS = [
  {id:"b1", label:"whole hundreds"},
  {id:"b2", label:"three digit plus one digit, no carry"},
  {id:"b3", label:"three digit plus one digit crossing the ten"},
  {id:"b4", label:"three digit plus whole tens"},
  {id:"b5", label:"three digit plus two digit, within the hundred"},
  {id:"b6", label:"three digit plus two digit crossing the hundred"}
];
const as1000Keys = ids => ids.map(b => "kp" + b).concat(ids.map(b => "kn" + b));

/* Telling the time is not one skill either. The book adds precision one
   step at a time and returns to it every few chapters all through the
   second grade, so the buckets are exclusive: each one holds only the
   minute positions it introduces, and everything earlier comes back as
   review through the Leitner box, exactly like the bridges over ten.
   The last bucket is the afternoon reading, which is where a quarter to
   eight becomes 19:45. The sun or moon drawn beside the dial says which
   half of the day is meant, so one dial still has one answer. */
/* Past the times table. The seventh part spends four pages on
   multiplying a two digit number by a one digit one and four more on
   reading it backwards as division, and the eighth part takes the same
   two skills into the thousand. The child is taught to split the number
   apart, 12 × 3 as 30 + 6, so the buckets go by how much splitting the
   example costs: first the ones where every part stays a single digit,
   then the ones where the units carry, then past a hundred, and last
   three digits.
   Division is the same pair read backwards, as within a hundred and
   within a thousand, so one bucket trains both directions. It is always
   the one digit factor that divides, 36 : 3 rather than 36 : 12, which
   is what the book asks and keeps the answer the number that was split.
   Bucket ids are plain numbers here. The clock spells its whole key and
   the hundred and the thousand prefix a letter; a number avoids picking
   yet another letter out of an alphabet that the coming families still
   have to share. */
const X_BUCKETS = [
  {id:"1", label:"two digit by one digit, nothing carries"},
  {id:"2", label:"two digit by one digit, the units carry"},
  {id:"3", label:"two digit by one digit, past a hundred"},
  {id:"4", label:"three digit by one digit, nothing carries"}
];
const beyondKeys = ids => ids.map(b => "xm" + b).concat(ids.map(b => "xd" + b));

/* Rounding. The seventh part rounds to tens while everything still
   lives under a hundred, and the eighth part comes back to it with
   three digit numbers and adds rounding to hundreds, so the buckets go
   in that order and a child meets two digit numbers first.
   A number that is already round is left out. Rounding fifty to tens is
   a true but empty question, and a race full of them would teach the
   child that the answer is usually the number itself. */
const O_BUCKETS = [
  {id:"1", to:10,  lo:10,  hi:99,  ask:"roundAsk10"},   // 47 to tens
  {id:"2", to:10,  lo:100, hi:999, ask:"roundAsk10"},   // 347 to tens
  {id:"3", to:100, lo:100, hi:999, ask:"roundAsk100"}   // 347 to hundreds
];
const roundKeys = ids => ids.map(b => "o" + b);

/* Three numbers and two signs, the first question with more than one
   step. The book takes it in the seventh part, still under a hundred,
   right after the buckets within a hundred, so the ranges follow those:
   within twenty, whole tens, and the mixed hundred. Every intermediate
   result stays inside the bucket's range and above zero, so the child
   never meets a negative number on the way to the answer. */
const Q_BUCKETS = [
  {id:"1", label:"three one digit numbers within twenty"},   // 7 + 5 - 3
  {id:"2", label:"whole tens within a hundred"},             // 30 + 40 - 20
  {id:"3", label:"two digit, one digit and tens within a hundred"}  // 47 + 5 - 3
];
const chainKeys = ids => ids.map(b => "q" + b);
// the four patterns a pair of signs can take, drawn evenly
const Q_SIGNS = ["++", "+-", "-+", "--"];

const FIVES = [0,5,10,15,20,25,30,35,40,45,50,55];
const C_BUCKETS = [
  {id:"c1", mins:[0]},                            // whole hours
  {id:"c2", mins:[30]},                           // half past
  {id:"c3", mins:[15,45]},                        // quarter past and quarter to
  {id:"c4", mins:[5,10,20,25,35,40,50,55]},       // the remaining five minute steps
  {id:"c5", mins:null},                           // any minute at all
  {id:"c6", mins:FIVES, pm:true}                  // afternoon, the 24 hour reading
];
const clockKeys = () => C_BUCKETS.map(b => b.id);

const mk  = (a,b) => "m" + a + "x" + b;
const dk  = (a,b) => "d" + a + "x" + b;
const ak  = (a,b) => "a" + a + "p" + b;
const sk  = (a,b) => "s" + a + "p" + b;

function multFactsFor(tables){
  return MULT.filter(f => tables.includes(f.a) || tables.includes(f.b));
}
function stageKeys(i){
  const st = E_STAGES[i];
  const out = [];
  for(const f of ADD) if(st.has(f.a, f.b)) out.push(ak(f.a,f.b), sk(f.a,f.b));
  return out;
}

/* `grade` is the school year in which a track's material is taught, read
   off the curriculum maps: the first year is the whole of adding within
   twenty, the second brings the times table, division, the hundred and
   the clock, and the third the thousand, rounding and everything past
   the tables. A track without a grade belongs to no particular year:
   the trouble spots are useful from the first week, and the school track
   follows whatever chapter the parent picked.

   Material has two years, though, not one: the year it is introduced and
   the year it is last revised. `thru` is that second one, the last year
   in which the track still belongs to the main block of the map; when it
   is missing it equals `grade`. Only yearOf() reads it. Everything else
   -- inGrade(), peekTracks(), unlocking, the parent heat map -- keeps
   asking `grade`, because that is still the year the material starts in.
   Without this the third year lost the times table behind the door to
   earlier years, and revising the table is where the third year begins. */
/* The order here is the order of the road on the map, so it runs the way
   the school years do: the first year's ranges, then crossing the ten,
   then the tables and the hundred, then the third year. */
const TRACKS = [
  /* The first year's ranges are chapter 1 of the fourth part, "Opakování do
     dvaceti bez přechodu", so the second year opens on them; the third year
     map never comes back to twenty, hence thru 2. */
  {id:"a3",   op:"band",                                  env:"dunes",    grade:1, thru:2},
  {id:"a5",   op:"band",                                  env:"shore",    grade:1, thru:2},
  {id:"a7",   op:"band",                                  env:"palms",    grade:1, thru:2},
  {id:"a10",  op:"band",                                  env:"bay",      grade:1, thru:2},
  {id:"a15",  op:"band",                                  env:"cliffs",   grade:1, thru:2},
  {id:"a20",  op:"band",                                  env:"beach",    grade:1, thru:2},
  /* Crossing the ten is the second year alone. The third year's chapter 10
     crosses the base ten within a hundred, which is a100, not this. */
  {id:"bridge",op:"bridge",                               env:"pier",     grade:2},
  /* The tables and dividing are revised at the very start of the third year,
     chapters 2 and 3 of the seventh part ("Opakování, násobilka ..."), and
     again in the fourth year, part one chapter 5 ("Opakování, násobení
     a dělení"), so they stay in the main block through the fourth. */
  {id:"t1",   op:"mult",  tables:[1,2,5,10],              env:"meadow",   grade:2, thru:4},
  {id:"t2",   op:"mult",  tables:[3,4],                   env:"forest",   grade:2, thru:4},
  {id:"t3",   op:"mult",  tables:[6,7],                   env:"canyon",   grade:2, thru:4},
  {id:"t4",   op:"mult",  tables:[8,9],                   env:"peaks",    grade:2, thru:4},
  {id:"t5",   op:"mult",  tables:[1,2,3,4,5,6,7,8,9,10],  env:"city",     grade:2, thru:4},
  {id:"d1",   op:"div",                                   env:"space",    grade:2, thru:4},
  /* The hundred is chapter 1 of the seventh part, "Opakování, sčítání
     a odčítání do 100"; the fourth year revises the thousand instead. */
  {id:"a100", op:"as100",                                 env:"ocean",    grade:2, thru:3},
  /* Telling the time is chapter 2 of the fourth part and comes back as
     chapter 4 of the seventh, "Hodiny a určování času". */
  {id:"clock",op:"clock",                                 env:"clocktown",grade:2, thru:3},
  // the chain of three numbers is chapter 11 and multiplying past the
  // tables is chapter 14, so on the map it comes first: the road runs in
  // the order of the book
  {id:"chain", op:"chain",                                env:"marsh",    grade:3},
  {id:"beyond",op:"beyond",                               env:"savanna",  grade:3},
  {id:"round", op:"round",                                env:"cave",     grade:3},
  {id:"a1000",op:"as1000",                                env:"volcano",  grade:3},
  {id:"mix",  op:"mix",                                   env:"night",    grade:2},
  {id:"weak", op:"weak",                                  env:"storm",    grade:1},
  {id:"school", op:"school",                              env:"school"}
];
const trackById = id => TRACKS.find(x => x.id === id);

/* Which school year the child is in. Four means the fourth and up, so
   the whole catalogue; the game has no fourth year material yet, and a
   child that far along should see everything rather than a locked door.
   An older profile has no year recorded and gets the top one, because
   the alternative would be hiding tracks it can already see today, and
   nothing may take away what a profile already has. */
const MAX_GRADE = 4;
function seedGrade(p){
  if(typeof p.grade !== "number" || p.grade < 1 || p.grade > MAX_GRADE) p.grade = MAX_GRADE;
}
const gradeOf = p => (p && p.grade) || MAX_GRADE;
/* Is this track part of what the class is doing this year or earlier?
   Earlier years stay in the profile, in the box and in the parent area
   exactly as before; on the map they are folded behind a door, see
   yearOf() and viewMap(). */
function inGrade(p, tr){ return !tr.grade || tr.grade <= gradeOf(p); }
/* Which year a place on the map belongs to, seen from this profile:
   "past", "own" or "ahead". It asks a range, not a single year: material
   is behind the door only once the class has stopped coming back to it,
   which is `thru`. The times table is introduced in the second year and
   revised in the first weeks of the third, so a third year still has it
   in front of the door. The championship, the weak-spot track and the
   school track carry a grade only so that a first year does not see
   them; whatever year the child is in, they are that year's, so they
   never end up behind the door to earlier years. Everything on the map
   asks this rather than reading tr.grade. */
function yearOf(p, tr){
  if(!tr.grade || tr.op === "mix" || tr.op === "weak" || tr.op === "school") return "own";
  const g = gradeOf(p);
  if(tr.grade > g) return "ahead";
  const thru = tr.thru || tr.grade;
  return thru < g ? "past" : "own";
}
/* Does this year fold the earlier ones away? Only a year that has tracks
   of its own. The fourth has none yet, so folding would put the whole
   map behind one door, and every older profile is a fourth year after
   seedGrade(). Once the fourth year has material, it folds too. */
function foldsYears(p){ return TRACKS.some(tr => tr.grade === gradeOf(p)); }
/* What next year holds. Only the next one: a taste of what is coming is
   an invitation, a list of everything left is a wall. */
function peekTracks(p){
  const next = gradeOf(p) + 1;
  return next > MAX_GRADE ? [] : TRACKS.filter(tr => tr.grade === next);
}

/* --- curriculum: the sequence layer, see src/curricula.js ---
   A chapter names a pool of fact keys. Everything else about the race
   stays exactly the same, so a chapter can never change the mechanics,
   only which facts come up. */
function curriculumById(id){ return CURRICULA.find(c => c.id === id) || null; }
function chapterOf(p){
  const c = curriculumById(p && p.curriculum);
  if(!c) return null;
  return c.chapters.find(ch => ch.n === p.chapter) || null;
}
function as20Keys(spec){
  const out = [];
  for(const f of ADD){
    const sum = f.a + f.b;
    if(spec.maxSum && sum > spec.maxSum) continue;
    // carry means crossing a ten, not merely landing above ten: 13 + 4
    // and 10 + 7 both stay on the easy side of that line
    if(spec.carry === "yes" && !crossesTen(f.a, f.b)) continue;
    if(spec.carry === "no"  &&  crossesTen(f.a, f.b)) continue;
    if(spec.addend && !spec.addend.includes(f.a) && !spec.addend.includes(f.b)) continue;
    out.push(ak(f.a,f.b), sk(f.a,f.b));
  }
  return out;
}
function poolKeys(spec){
  if(!spec) return [];
  const out = [];
  if(spec.mult) out.push(...multFactsFor(spec.mult).map(f => mk(f.a,f.b)));
  if(spec.div)  out.push(...MULT.filter(f => f.a > 1 && (spec.div.includes(f.a) || spec.div.includes(f.b)))
                              .map(f => dk(f.a,f.b)));
  if(spec.as20) out.push(...as20Keys(spec.as20));
  if(spec.as100){
    out.push(...spec.as100.map(b => "p" + b));
    out.push(...spec.as100.map(b => "n" + b));
  }
  if(spec.as1000) out.push(...as1000Keys(spec.as1000));
  // past the tables the two directions are separate chapters in the
  // book, so unlike the hundred a chapter may ask for only one of them
  if(spec.multBeyond) out.push(...spec.multBeyond.map(b => "xm" + b));
  if(spec.divBeyond)  out.push(...spec.divBeyond.map(b => "xd" + b));
  if(spec.round) out.push(...spec.round);
  if(spec.chain) out.push(...chainKeys(spec.chain));
  if(spec.clock) out.push(...spec.clock);
  return [...new Set(out)];
}
/* A chapter is offered only when the game can actually generate it.
   Chapters whose topic has no generator yet stay visible in the list so
   the parent sees the whole book, but they cannot be picked, because a
   setting that quietly does nothing reads as broken.
   Being playable and driving a track are two different things: a chapter
   whose material belongs in the workshop, money being the first of them,
   can be picked and does something, but it has no race to put on the map. */
function chapterJobs(ch){
  return ((ch && ch.pool && ch.pool.shop) || []).filter(id => JOBS.some(j => j.id === id));
}
function isPlayable(ch){
  return !!ch && (poolSize(poolKeys(ch.pool)) >= 4 || chapterJobs(ch).length > 0);
}
function playableChapters(cur){
  return cur ? cur.chapters.filter(isPlayable) : [];
}
/* Pull a stored chapter back onto a playable one. Runs on load and after
   an import, so a profile saved before a generator was removed, or edited
   by hand, can never point at a chapter that produces nothing. */
function normalizeChapter(p){
  const cur = curriculumById(p.curriculum);
  if(!cur){ p.chapter = null; return; }
  const ok = playableChapters(cur);
  if(!ok.length){ p.curriculum = null; p.chapter = null; return; }
  if(isPlayable(cur.chapters.find(ch => ch.n === p.chapter))) return;
  const earlier = ok.filter(ch => ch.n < p.chapter);
  p.chapter = (earlier.length ? earlier[earlier.length - 1] : ok[0]).n;
}
function schoolPool(p){ const ch = chapterOf(p); return ch ? poolKeys(ch.pool) : []; }
/* How much variety a pool can actually produce. A bucket key is a whole
   family of questions rather than a single fact, so it counts for more
   than one. A chapter drives its own track only when it can fill a race
   with enough variety; otherwise it stays selectable but shows no track
   on the map.
   Buckets are the normal shape for anything that is not an enumerable
   fact, so the family test lives in one place rather than growing a
   longer condition with every new topic. */
const FAMILY_HEADS = "pnckxoq";
const isFamilyKey = k => FAMILY_HEADS.includes(k[0]);
function poolSize(keys){
  let n = 0;
  for(const k of keys) n += isFamilyKey(k) ? 4 : 1;
  return n;
}
/* The school track appears only when the chapter can fill a race. A
   workshop-only chapter is a perfectly good setting, it just points at
   the workshop rather than at the map. */
function schoolReady(p){ return poolSize(schoolPool(p)) >= 4; }
/* Which workshop jobs the class is on right now, so the workshop can say
   so on the card rather than leaving the parent to guess. */
function chapterJobIds(p){ return chapterJobs(chapterOf(p)); }
function visibleTracks(p){
  const rest = TRACKS.filter(tr => tr.op !== "school" && inGrade(p, tr));
  return schoolReady(p) ? [trackById("school")].concat(rest) : rest;
}
function trackName(p, tr){ return t("trk_" + tr.id); }
function trackSub(p, tr){
  if(tr.op === "school"){ const ch = chapterOf(p); return ch ? esc(ch.name) : t("trk_schools"); }
  return t("trk_" + tr.id + "s");
}

function fact(p, key){ return p.facts[key] || {lv:0, reps:0, ok:0, bad:0, best:null, seen:0}; }
/* Track mastery: every fact contributes in proportion to its level and
   level 3 already counts as a full point. The indicator therefore grows
   from the very first race and directly predicts the next unlock. */
function mastery(p, keys){
  if(!keys.length) return 0;
  let s = 0;
  for(const k of keys) s += Math.min(3, fact(p, k).lv);
  return s / (3 * keys.length);
}
function trackKeys(p, tr){
  if(tr.op === "school") return schoolPool(p);
  if(tr.op === "mult") return multFactsFor(tr.tables).map(f => mk(f.a,f.b));
  if(tr.op === "div")  return MULT.filter(f => f.a > 1).map(f => dk(f.a,f.b));
  if(tr.op === "band") return bandKeys(tr.id);
  if(tr.op === "bridge"){
    const out = [];
    for(let i = 0; i < E_STAGES.length; i++) out.push(...stageKeys(i));
    return out;
  }
  if(tr.op === "as100")return H_BUCKETS.map(b => "p"+b.id).concat(H_BUCKETS.map(b => "n"+b.id));
  if(tr.op === "as1000")return as1000Keys(K_BUCKETS.map(b => b.id));
  if(tr.op === "beyond")return beyondKeys(X_BUCKETS.map(b => b.id));
  if(tr.op === "round") return roundKeys(O_BUCKETS.map(b => b.id));
  if(tr.op === "chain") return chainKeys(Q_BUCKETS.map(b => b.id));
  if(tr.op === "clock") return clockKeys();
  return [];
}
/* Where the child is on a staged track: the first level not yet at the
   threshold, so mastered levels drop back to being review rather than
   filling the race. One implementation for every staged track; a track
   only has to say how many levels it has and which keys each holds. */
const STAGE_PASS = .7;
function stageIndex(p, keysAt, count){
  for(let i = 0; i < count; i++) if(mastery(p, keysAt(i)) < STAGE_PASS) return i;
  return count - 1;
}
// which bridge over ten is being built
function bridgeStage(p){ return stageIndex(p, stageKeys, E_STAGES.length); }
// how finely the child can already read a dial
function clockStage(p){ return stageIndex(p, i => [C_BUCKETS[i].id], C_BUCKETS.length); }
// which step into the thousand is being taken; plus and minus of one
// bucket are the same step, so they rise and fall together
function as1000Stage(p){ return stageIndex(p, i => as1000Keys([K_BUCKETS[i].id]), K_BUCKETS.length); }
// how far past the times table the child has got; multiplying and
// dividing one bucket are the same step, so they rise and fall together
function beyondStage(p){ return stageIndex(p, i => beyondKeys([X_BUCKETS[i].id]), X_BUCKETS.length); }
// how far the rounding has got: tens under a hundred, then tens of a
// three digit number, then hundreds
function roundStage(p){ return stageIndex(p, i => roundKeys([O_BUCKETS[i].id]), O_BUCKETS.length); }
// which range the chain of three numbers is being practised in
function chainStage(p){ return stageIndex(p, i => chainKeys([Q_BUCKETS[i].id]), Q_BUCKETS.length); }
/* What a track would actually serve right now. A staged track holds
   back the levels the child has not reached yet, and the championship
   has to respect that, otherwise it hands out material that the track
   itself would refuse to. */
function reachedKeys(p, tr){
  if(tr.op === "bridge"){
    const out = [];
    for(let i = 0; i <= bridgeStage(p); i++) out.push(...stageKeys(i));
    return out;
  }
  if(tr.op === "clock") return C_BUCKETS.slice(0, clockStage(p) + 1).map(b => b.id);
  if(tr.op === "as1000") return as1000Keys(K_BUCKETS.slice(0, as1000Stage(p) + 1).map(b => b.id));
  if(tr.op === "beyond") return beyondKeys(X_BUCKETS.slice(0, beyondStage(p) + 1).map(b => b.id));
  if(tr.op === "round") return roundKeys(O_BUCKETS.slice(0, roundStage(p) + 1).map(b => b.id));
  if(tr.op === "chain") return chainKeys(Q_BUCKETS.slice(0, chainStage(p) + 1).map(b => b.id));
  return trackKeys(p, tr);
}
function trackProgress(p, tr){
  if(tr.op === "mix" || tr.op === "weak") return 0;
  return mastery(p, trackKeys(p, tr));
}

/* A track that has once been open never closes again. Adding material
   to a track lowers its mastery figure, and a child who was racing
   somewhere yesterday must not find the door shut this morning. Only a
   parent can close a track.
   Older profiles are seeded from finished races, which is the only
   unambiguous evidence. A fact in the box is not evidence, because the
   key sets overlap: every multiplication fact belongs to the grand
   circuit too, so one lap of the warm-up would have opened everything. */
function seedOpened(p){
  const firstTime = !p.opened;
  p.opened = p.opened || {};
  for(const tr of TRACKS) if(((p.trackRuns || {})[tr.id] || 0) > 0) p.opened[tr.id] = true;
  if(firstTime) seedLegacyGates(p);
}
/* One time migration, September 2026. The twenty track grew by the teen
   facts, which lowers its mastery figure and would have shut the
   hundred track for a child who had already earned it but never raced
   there. Whenever a change lowers a gate, the migration has to reproduce
   the old gate rather than hope nobody was standing on it, so the figure
   is recomputed once against the fact set as it stood before: the sums
   with both addends under eleven.
   Safe to delete once no device can still be running the older build. */
function seedLegacyGates(p){
  const before = ADD.filter(f => f.b <= 10);
  const was20 = before.map(f => ak(f.a,f.b)).concat(before.map(f => sk(f.a,f.b)));
  if(mastery(p, was20) >= .6) p.opened.a100 = true;
}
/* One time migration, September 2026. The twenty track used to be one
   door holding the whole of the first year and the bridges over ten; it
   is now a ladder of ranges plus a bridge track of its own. Anyone who
   could already race there keeps every range, because all of them are
   easier than what that one door used to serve, and the bridges are
   open to everybody anyway.
   Safe to delete once no device can still be running the older build. */
function seedBands(p){
  p.opened = p.opened || {};
  // the smallest range is open to everyone and every render of the map
  // writes that down, so a profile that has it has already been through
  // here and there is nothing to do
  if(p.opened.a3) return;
  // a profile with any history at all predates the split, and the old
  // twenty track was open to everybody, so it keeps the whole ladder;
  // one created just now has no history and walks it from the bottom
  const played = (p.runs || 0) > 0 || Object.keys(p.facts || {}).length > 0;
  if(!played) return;
  for(const b of BANDS) p.opened[b.id] = true;
}
/* Called on every render of the map, so the moment a track opens it is
   written down and stays written down. */
function rememberUnlocks(p){
  let added = false;
  for(const tr of TRACKS){
    if(p.opened[tr.id]) continue;
    if(unlockState(p, tr).open){ p.opened[tr.id] = true; added = true; }
  }
  return added;
}

function unlockState(p, tr){
  if(p.force[tr.id] === true)  return {open:true};
  if(p.force[tr.id] === false) return {open:false, why: t("lockByParent")};
  if((p.opened || {})[tr.id])  return {open:true};
  if(!p.autoUnlock)            return {open:true};
  const m = id => mastery(p, trackKeys(p, trackById(id)));
  // safety valve: after ten races the next track opens regardless, so nobody gets stuck
  const many = id => ((p.trackRuns || {})[id] || 0) >= 10;
  // each school year has one door that is open from the start, so a
  // child does not have to walk through last year's ladder to reach
  // what the class is doing now: the smallest range for the first year,
  // crossing the ten and the first table for the second
  switch(tr.id){
    // telling the time does not build on any of the arithmetic, so it
    // never waits for it
    case "t1": case "a3": case "bridge": case "clock": case "school": return {open:true};
    // the first year is a ladder of ranges, one number at a time
    case "a5":  return (m("a3")  >= .7 || many("a3"))  ? {open:true} : {open:false, why: t("lockFinish", t("trk_a3"))};
    case "a7":  return (m("a5")  >= .7 || many("a5"))  ? {open:true} : {open:false, why: t("lockFinish", t("trk_a5"))};
    case "a10": return (m("a7")  >= .7 || many("a7"))  ? {open:true} : {open:false, why: t("lockFinish", t("trk_a7"))};
    case "a15": return (m("a10") >= .7 || many("a10")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_a10"))};
    case "a20": return (m("a15") >= .7 || many("a15")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_a15"))};
    case "t2": return (m("t1") >= .7 || many("t1")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_t1"))};
    case "t3": return (m("t2") >= .7 || many("t2")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_t2"))};
    case "t4": return (m("t3") >= .7 || many("t3")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_t3"))};
    case "t5": return (m("t4") >= .65 || many("t4")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_t4"))};
    case "d1": return mastery(p, MULT.map(f => mk(f.a,f.b))) >= .55
                 ? {open:true} : {open:false, why: t("lockHalfTable")};
    // splitting 12 × 3 into 30 + 6 only works once the table underneath
    // is there, and the track teaches dividing as well as multiplying
    case "beyond": return (m("d1") >= .6 || many("d1")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_d1"))};
    // rounding needs place value rather than fluent arithmetic, so it
    // opens earlier than the thousand does, and its own first bucket
    // keeps the child on two digit numbers until they are solid
    case "round": return (m("a100") >= .5 || many("a100")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_a100"))};
    // adding and taking away in one breath is the chapter right after the
    // buckets within a hundred, so it stands on the hundred exactly as
    // rounding does
    case "chain": return (m("a100") >= .5 || many("a100")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_a100"))};
    // the hundred is built on being able to cross a ten, not merely on
    // having finished the first year's ranges
    case "a100": return (m("bridge") >= .6 || many("bridge")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_bridge"))};
    case "a1000": return (m("a100") >= .6 || many("a100")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_a100"))};
    case "mix":  return (unlockState(p, trackById("t5")).open)
                 ? {open:true} : {open:false, why: t("lockOpen", t("trk_t5"))};
    case "weak": return Object.keys(p.facts).length >= 15
                 ? {open:true} : {open:false, why: t("lockRaceFirst")};
  }
  return {open:true};
}

/* --- build one question from a fact key ---
   Every question answers two things about itself: what it is answered
   on (`input`) and whether a given answer is right (`check`). The whole
   catalogue so far is one whole number typed on the number pad, so that
   is the default and only a family that needs something else has to say
   so. Nothing outside here may assume the answer is a number. */
function itemFromKey(key){
  const it = rawItem(key);
  if(!it.input)  it.input  = "pad";
  if(!it.maxLen) it.maxLen = 3;
  if(!it.check)  it.check  = typed => parseInt(typed, 10) === it.answer;
  return it;
}
function rawItem(key){
  const head = key[0];
  if(head === "m"){
    const [a,b] = key.slice(1).split("x").map(Number);
    const flip = Math.random() < .5;
    const x = flip ? b : a, y = flip ? a : b;
    return {key, text: x + " × " + y, answer: a*b, kind:"mult"};
  }
  if(head === "d"){
    const [a,b] = key.slice(1).split("x").map(Number);
    const useA = (b > 1 && Math.random() < .5) || a === 1;
    const div = useA ? a : b, res = useA ? b : a;
    return {key, text: (a*b) + " : " + div, answer: res, kind:"div"};
  }
  if(head === "a"){
    const [a,b] = key.slice(1).split("p").map(Number);
    const flip = Math.random() < .5;
    return {key, text:(flip?b:a) + " + " + (flip?a:b), answer:a+b, kind:"add"};
  }
  if(head === "s"){
    const [a,b] = key.slice(1).split("p").map(Number);
    const sub = Math.random() < .5 ? a : b;
    return {key, text:(a+b) + " - " + sub, answer:(a+b)-sub, kind:"sub"};
  }
  if(head === "p" || head === "n") return hundredItem(key);
  if(head === "k") return thousandItem(key);
  if(head === "x") return beyondItem(key);
  if(head === "o") return roundItem(key);
  if(head === "q") return chainItem(key);
  if(head === "c") return clockItem(key);
  return {key, text:"1 + 1", answer:2, kind:"add"};
}

const ri = (lo,hi) => lo + Math.floor(Math.random()*(hi-lo+1));

function hundredItem(key){
  const plus = key[0] === "p";
  const b = key.slice(1);
  let x, y;
  if(b === "h1"){ const t = ri(2,8)*10 + ri(1,4); const u = ri(1, 9 - (t%10)); x=t; y=u; }
  else if(b === "h2"){ const t = ri(2,8)*10 + ri(5,9); const u = ri(10-(t%10), 9); x=t; y=u; }
  else if(b === "h3"){ x = ri(2,8)*10; y = ri(1,9-Math.floor(x/10)+1)*10; }
  else if(b === "h4"){ const t = ri(1,5)*10 + ri(1,4); const u = ri(1,3)*10 + ri(1, 9-(t%10)); x=t; y=u; }
  else { const t = ri(1,5)*10 + ri(5,9); const u = ri(1,3)*10 + ri(10-(t%10), 9); x=t; y=u; }
  if(x + y > 100){ y = Math.max(1, 100 - x); }
  if(plus)  return {key, text: x + " + " + y, answer: x+y, kind:"add100"};
  return {key, text:(x+y) + " - " + y, answer: x, kind:"sub100"};
}

/* Within a thousand. The two addends are built so that the bucket is
   true by construction rather than by trimming an overflow afterwards:
   a quiet correction would hand the child an easier sum than the bucket
   promised and nothing would ever say so. The ranges below keep every
   total at or under a thousand, and items.test.js checks that they do.
   Subtraction is the same pair read backwards, exactly as within a
   hundred, so one bucket trains both directions of the same step. */
function thousandItem(key){
  const plus = key[1] === "p";
  const b = key.slice(2);
  let x, y;
  if(b === "b1"){                                   // 300 + 200, a round five hundred may land on a thousand
    const h = ri(1,9); x = h * 100; y = ri(1, 10 - h) * 100;
  } else if(b === "b2"){                            // 342 + 5
    x = ri(1,9)*100 + ri(0,9)*10 + ri(1,4); y = ri(1, 9 - (x % 10));
  } else if(b === "b3"){                            // 347 + 6, the ten is crossed, the hundred is not
    x = ri(1,9)*100 + ri(0,8)*10 + ri(5,9); y = ri(10 - (x % 10), 9);
  } else if(b === "b4"){                            // 320 + 40
    const d = ri(1,4); x = ri(1,9)*100 + d*10 + ri(0,9); y = ri(1, 9 - d) * 10;
  } else if(b === "b5"){                            // 342 + 25, stays inside the hundred
    x = ri(1,9)*100 + ri(1,4)*10 + ri(1,4); y = ri(1,3)*10 + ri(1, 9 - (x % 10));
  } else {                                          // 372 + 45, the hundred is crossed
    const d = ri(5,8); x = ri(1,8)*100 + d*10 + ri(0,9); y = ri(10 - d, 9)*10 + ri(0,9);
  }
  if(plus)  return {key, text: x + " + " + y, answer: x+y, kind:"add1000", maxLen:4};
  return {key, text:(x+y) + " - " + y, answer: x, kind:"sub1000", maxLen:4};
}

/* Past the times table. The pair is built so the bucket is true by
   construction: the ranges below are worked out from the multiplier so
   that nothing ever has to be trimmed afterwards, because a quiet
   correction would hand the child an easier example than the bucket
   promised and nothing would say so. Every product stays under a
   thousand, so the answer still fits the three digits the keypad
   offers by default. */
function beyondItem(key){
  const plus = key[1] === "m";        // m multiplies, d reads it backwards
  const b = key.slice(2);
  let x, m;
  if(b === "1"){                      // 12 × 3, every part stays single digit
    m = ri(2,4);
    const cap = Math.floor(9 / m);
    x = ri(1, cap) * 10 + ri(1, cap);
  } else if(b === "2"){               // 17 × 5, the units make a ten
    m = ri(2,7);
    const loU = Math.ceil(10 / m);
    const maxT = Math.floor((99 - loU * m) / (10 * m));
    const tens = ri(1, Math.max(1, maxT));
    const hiU = Math.min(9, Math.floor((99 - tens * 10 * m) / m));
    x = tens * 10 + ri(loU, hiU);
  } else if(b === "3"){               // 34 × 6, the hundred is passed
    m = ri(3,9);
    x = ri(Math.max(11, Math.floor(100 / m) + 1), Math.min(99, Math.floor(999 / m)));
  } else {                            // 213 × 3, three digits and nothing carries
    m = ri(2,4);
    const cap = Math.floor(9 / m);
    let te = ri(0, cap), u = ri(0, cap);
    if(te + u === 0) u = 1;           // a round hundred is a different lesson
    x = ri(1, cap) * 100 + te * 10 + u;
  }
  if(plus) return {key, text: x + " × " + m, answer: x * m, kind:"multx"};
  return {key, text:(x * m) + " : " + m, answer: x, kind:"divx"};
}

/* Rounding is the first question that is not an equation. The line
   reads "347 ≐ ?" rather than "347 = ?", and the sign is a translated
   string because Czech schools write the dotted one and English and
   German ones the wavy one; the child has to recognise the same sign it
   met in class. What to round to is said in words above the keypad,
   which is what `ask` is for.
   Nine hundred and ninety nine rounds to a thousand, so the answer can
   be one digit longer than the question. */
function roundItem(key){
  const b = O_BUCKETS.find(x => x.id === key.slice(1)) || O_BUCKETS[0];
  let n = ri(b.lo, b.hi);
  if(n % b.to === 0) n += ri(1, b.to - 1);        // an already round number is no question
  return {
    key, kind:"round", text: String(n), rel:"relRound", ask: b.ask, maxLen: 4,
    answer: Math.round(n / b.to) * b.to
  };
}

/* A chain of three numbers and two signs, the first question that takes
   more than one step. The triple is built by construction, exactly like
   the thousand and the material past the tables: when a pattern has
   nowhere left to go, for instance 2 - 1 - ?, the signs are drawn again
   rather than a term being trimmed, because a quiet correction would
   hand the child an easier line than the bucket promised and nothing
   would ever say so.
   The ranges below are cut so that every one of the four sign patterns
   can be finished in every bucket, so the loop here finishes on the
   first draw and the four patterns turn up equally often. The ceiling is
   set where no honest run can reach it and running into it throws, name
   of the bucket included: a bucket that cannot serve a pattern any more
   is a broken generator, and a made up fallback triple would go on
   handing the child lines the bucket never promised without a word.
   Every intermediate result stays inside the bucket's range and at or
   above zero, so a negative number never turns up on the way to an
   answer the child is meant to reach in one breath. */
function chainItem(key){
  const b = key.slice(1);
  let got = null;
  for(let i = 0; i < 10000 && !got; i++) got = chainTriple(b, Q_SIGNS[ri(0, Q_SIGNS.length - 1)]);
  if(!got) throw new Error("chainItem: no triple for bucket " + key + " after 10000 draws");
  const [a, s1, y, s2, z] = got;
  const mid = s1 === "+" ? a + y : a - y;
  return {
    key, kind:"chain",
    text: a + " " + s1 + " " + y + " " + s2 + " " + z,
    answer: s2 === "+" ? mid + z : mid - z
  };
}
/* One attempt at a triple for a bucket and a pair of signs, or null when
   that pattern cannot be finished inside the bucket. No bucket has such
   a pattern today: the ranges are cut so that all four always finish,
   which is what keeps the four of them equally common. A new bucket that
   cannot promise that returns null here and the caller draws again. */
function chainTriple(b, sg){
  const s1 = sg[0], s2 = sg[1];
  if(b === "1"){                                  // 7 + 5 - 3, crossing a ten is allowed here
    // Both the first and the second term are single digits, so the
    // middle lands somewhere in 1 to 18 and never needs a ceiling of its
    // own: even 9 + 9 leaves room for a third term inside twenty.
    const a = ri(2,9);
    const y = s1 === "+" ? ri(1, Math.min(9, 19 - a)) : ri(1, a - 1);
    const mid = s1 === "+" ? a + y : a - y;
    const z = s2 === "+" ? ri(1, Math.min(9, 20 - mid)) : ri(1, Math.min(9, mid));
    return [a, s1, y, s2, z];
  }
  if(b === "2"){                                  // 30 + 40 - 20, counted in whole tens
    // Counted in tens, so every term is 1 to 9 and the middle 1 to 10.
    // A plus at the end needs a ten left over, so the middle is held at
    // nine by the ranges that build it, not by throwing the finished
    // draw away: throwing it away is what used to make "++" turn up
    // a third less often than the other three patterns.
    const top = s2 === "+" ? 9 : 10;               // the most the middle may be
    const at = s1 === "+" ? ri(1, top - 1) : ri(2,9);
    const yt = s1 === "+" ? ri(1, top - at) : ri(1, at - 1);
    const mt = s1 === "+" ? at + yt : at - yt;
    const zt = s2 === "+" ? ri(1, 10 - mt) : ri(1, Math.min(9, mt));
    return [at*10, s1, yt*10, s2, zt*10];
  }
  // 47 + 5 - 3: a two digit number that is not round, then a single
  // digit or a whole ten. At least one of the two has to be a single
  // digit, otherwise the line would be whole tens and that is the
  // bucket above.
  // Which of the two is the ten is settled first, because the room the
  // second term may take depends on what the third one still needs: ten
  // for a whole ten, one for a single digit. With that subtracted up
  // front, every range here is non-empty for all four sign patterns, so
  // no pattern is ever drawn again and none of them goes rare.
  const a = ri(1,8)*10 + ri(1,9);
  const tenAt = ri(0,2);                          // 0 neither, 1 the second term, 2 the third
  const zRoom = tenAt === 2 ? 10 : 1;             // what the third term needs at the least
  const term = (isTen, room) => isTen
    ? ri(1, Math.min(5, Math.floor(room / 10))) * 10
    : ri(1, Math.min(9, room));
  const y = term(tenAt === 1, s1 === "+" ? (s2 === "+" ? 100 - zRoom : 100) - a
                                         : a - (s2 === "+" ? 0 : zRoom));
  const mid = s1 === "+" ? a + y : a - y;
  const z = term(tenAt === 2, s2 === "+" ? 100 - mid : mid);
  return [a, s1, y, s2, z];
}

/* The answer is the time as a digital watch shows it, typed on the same
   keypad as everything else: 7:45 is keyed 745 and 19:45 is keyed 1945,
   so hour times a hundred plus minutes is a single whole number and
   nothing about scoring, records or the Leitner box has to change. */
/* A whole hour needs no minutes. A child who has just learned to read
   seven o'clock should be able to say so by keying 7, not by keying two
   zeros it has no reason to think about, so one or two digits are read
   as an hour and three or four as an hour and minutes, which is how a
   display is read anyway. Nothing is made ambiguous by this: midnight
   never comes up, so a lone 19 can only mean seven in the evening. */
function clockTyped(typed){
  const s = String(typed);
  const n = parseInt(s, 10);
  if(isNaN(n)) return NaN;
  return s.length <= 2 ? n * 100 : n;
}
function clockItem(key){
  const b = C_BUCKETS.find(x => x.id === key) || C_BUCKETS[0];
  const m = b.mins ? b.mins[ri(0, b.mins.length - 1)] : ri(1, 59);
  const face = b.pm ? ri(1, 11) : ri(1, 12);      // midnight and noon stay out of the 24 hour bucket
  const h = b.pm ? face + 12 : face;
  const answer = h * 100 + m;
  return {
    key, kind:"clock", text:"", night: !!b.pm,
    svg: clockSVG(face, m, !!b.pm),
    answer,
    check: typed => clockTyped(typed) === answer,
    disp: h + ":" + (m < 10 ? "0" : "") + m,
    maxLen: 4,
    ask: b.pm ? "clockAskPm" : "clockAsk"
  };
}
/* Drawn from parameters like the circuits and the creatures, so the
   dial costs a few hundred bytes and scales to any screen. */
function clockSVG(face, m, night){
  const cx = 46, cy = 54, R = 40;
  const pt = (deg, r) => {
    const a = (deg - 90) * Math.PI / 180;
    return {x: +(cx + Math.cos(a) * r).toFixed(1), y: +(cy + Math.sin(a) * r).toFixed(1)};
  };
  let ticks = "";
  for(let i = 0; i < 60; i++){
    const big = i % 5 === 0;
    const a = pt(i * 6, R - (big ? 7 : 4)), z = pt(i * 6, R - 1.5);
    ticks += `<line x1="${a.x}" y1="${a.y}" x2="${z.x}" y2="${z.y}" stroke="${big ? "#4a5a80" : "#c9d3e8"}"`
          +  ` stroke-width="${big ? 2.2 : 0.9}" stroke-linecap="round"/>`;
  }
  let nums = "";
  for(let i = 1; i <= 12; i++){
    const q = pt(i * 30, R - 11.5);
    nums += `<text x="${q.x}" y="${q.y + 3.6}" text-anchor="middle" font-size="10" font-weight="800" fill="#182543">${i}</text>`;
  }
  const hh = pt((face % 12) * 30 + m * 0.5, R - 21);
  const mm = pt(m * 6, R - 8);
  const badge = night
    ? `<path d="M85 8 a9 9 0 1 0 0 12 a7.2 7.2 0 0 1 0 -12 z" fill="#dfe6f7" stroke="#4a5a80" stroke-width="1.6" stroke-linejoin="round"/>`
    : `<circle cx="86" cy="14" r="8.5" fill="#ffd93d" stroke="#d98b00" stroke-width="2"/>`;
  return `<svg class="dial" viewBox="0 0 100 100" role="img" aria-hidden="true">
    <circle cx="${cx}" cy="${cy}" r="${R + 3}" fill="#ece9ff"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="#ffffff" stroke="#5b4bd6" stroke-width="3"/>
    ${ticks}${nums}
    <line x1="${cx}" y1="${cy}" x2="${hh.x}" y2="${hh.y}" stroke="#182543" stroke-width="5" stroke-linecap="round"/>
    <line x1="${cx}" y1="${cy}" x2="${mm.x}" y2="${mm.y}" stroke="#5b4bd6" stroke-width="3" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="3.4" fill="#182543"/>
    ${badge}
  </svg>`;
}

/* --- choose the questions for one race --- */
function pickWeight(f){
  if(f.reps === 0) return 3.2;                 // nove, ale ne zaplavit
  const byLevel = [7, 8, 6.5, 3.4, 1.6, .8];
  let w = byLevel[Math.min(5, f.lv)];
  const days = (Date.now() - f.seen) / 86400000;
  if(days > 3) w *= 1.5; else if(days > 1) w *= 1.2;
  if(f.bad > f.ok) w *= 1.4;
  return w;
}
function sampleKeys(p, pool, n, maxNew){
  const out = [], used = new Set();
  let newLeft = maxNew, guard = 0;
  const bag = pool.slice();
  while(out.length < n && bag.length){
    if(++guard > n * 25 + 50) break;
    let items = bag.filter(k => !used.has(k));
    if(!items.length){ used.clear(); items = bag.slice(); }
    if(newLeft <= 0){
      const seen = items.filter(k => fact(p,k).reps > 0);
      if(seen.length >= 3) items = seen;
    }
    let total = 0;
    const ws = items.map(k => { const w = pickWeight(fact(p,k)); total += w; return w; });
    let r = Math.random() * total, pick = items[items.length-1];
    for(let i=0;i<items.length;i++){ r -= ws[i]; if(r <= 0){ pick = items[i]; break; } }
    if(fact(p,pick).reps === 0) newLeft--;
    used.add(pick);
    if(out.length && out[out.length-1] === pick && bag.length > 1) continue;
    out.push(pick);
  }
  // if the pool was tiny, pad by repeating what we have
  let i = 0;
  while(out.length < n && out.length){ out.push(out[i++ % out.length]); }
  return out;
}
/* The shape almost every track uses: the material being learned carries
   about seventy percent of the race and the rest comes back as review
   through the Leitner box, which is what keeps the success rate near
   eighty percent. Anything already in the focus is not reviewed twice.
   New families call this rather than writing the split out again. */
function focusAndReview(p, focus, review, n, maxNew){
  const rest = [...new Set(review)].filter(k => !focus.includes(k));
  if(!rest.length) return sampleKeys(p, focus, n, maxNew);
  const nf = Math.round(n * .7);
  return sampleKeys(p, focus, nf, maxNew).concat(sampleKeys(p, rest, n - nf, 0));
}
function buildRun(p, tr){
  const n = p.qCount || 20;
  let keys;
  if(tr.op === "school"){
    // The chapter sets the focus. In the soft mode the rest of the race
    // still comes from earlier chapters, because dropping spaced review
    // would break the strongest part of the design.
    const focus = schoolPool(p);
    const cur = curriculumById(p.curriculum);
    if((p.chapterMode || "soft") === "hard" || !cur || !focus.length){
      keys = sampleKeys(p, focus, n, 6);
    } else {
      const earlier = [];
      for(const ch of cur.chapters){
        if(ch.n >= p.chapter) break;
        earlier.push(...poolKeys(ch.pool));
      }
      keys = focusAndReview(p, focus, earlier, n, 6);
    }
  } else if(tr.op === "mult"){
    const focus = multFactsFor(tr.tables).map(f => mk(f.a,f.b));
    const earlier = [];
    for(const prev of TRACKS){
      if(prev.id === tr.id) break;
      if(prev.op === "mult") earlier.push(...multFactsFor(prev.tables).map(f => mk(f.a,f.b)));
    }
    keys = focusAndReview(p, focus, earlier, n, 5);
  } else if(tr.op === "div"){
    const all = MULT.filter(f => f.a > 1).map(f => dk(f.a,f.b));
    keys = sampleKeys(p, all, n, 5);
  } else if(tr.op === "band"){
    // the range being learned carries the race and everything below it
    // comes back as review, exactly like the multiplication tracks
    const earlier = [];
    for(const b of BANDS){
      if(b.id === tr.id) break;
      earlier.push(...bandKeys(b.id));
    }
    keys = focusAndReview(p, bandKeys(tr.id), earlier, n, 5);
  } else if(tr.op === "bridge"){
    const si = bridgeStage(p);
    const review = [];
    for(let i = 0; i < si; i++) review.push(...stageKeys(i));
    keys = focusAndReview(p, stageKeys(si), review, n, 5);
  } else if(tr.op === "as100"){
    const all = H_BUCKETS.map(b => "p"+b.id).concat(H_BUCKETS.map(b => "n"+b.id));
    keys = sampleKeys(p, all, n, 10);
  } else if(tr.op === "as1000"){
    const ki = as1000Stage(p);
    const review = as1000Keys(K_BUCKETS.slice(0, ki).map(b => b.id));
    keys = focusAndReview(p, as1000Keys([K_BUCKETS[ki].id]), review, n, 2);
  } else if(tr.op === "beyond"){
    const xi = beyondStage(p);
    const review = beyondKeys(X_BUCKETS.slice(0, xi).map(b => b.id));
    keys = focusAndReview(p, beyondKeys([X_BUCKETS[xi].id]), review, n, 2);
  } else if(tr.op === "round"){
    const oi = roundStage(p);
    const review = roundKeys(O_BUCKETS.slice(0, oi).map(b => b.id));
    keys = focusAndReview(p, roundKeys([O_BUCKETS[oi].id]), review, n, 2);
  } else if(tr.op === "chain"){
    const qi = chainStage(p);
    const review = chainKeys(Q_BUCKETS.slice(0, qi).map(b => b.id));
    keys = focusAndReview(p, chainKeys([Q_BUCKETS[qi].id]), review, n, 2);
  } else if(tr.op === "clock"){
    const ci = clockStage(p);
    keys = focusAndReview(p, [C_BUCKETS[ci].id], C_BUCKETS.slice(0, ci).map(b => b.id), n, 1);
  } else if(tr.op === "mix"){
    const all = [];
    for(const other of TRACKS){
      if(other.op === "mix" || other.op === "weak") continue;
      // what the class has not got to yet is not in the championship
      // either, the same way a staged track holds back its later steps
      if(inGrade(p, other) && unlockState(p, other).open) all.push(...reachedKeys(p, other));
    }
    keys = sampleKeys(p, [...new Set(all)], n, 3);
  } else { // weak
    // workshop tasks live in the same box but are not race questions
    const seen = Object.keys(p.facts).filter(k => p.facts[k].reps > 0 && !isJobKey(k));
    seen.sort((x,y) => (p.facts[x].lv - p.facts[y].lv) || (p.facts[y].bad - p.facts[x].bad));
    const worst = seen.slice(0, Math.max(8, Math.round(seen.length * .35)));
    keys = sampleKeys(p, worst.length ? worst : seen, n, 0);
  }
  if(!keys || !keys.length) keys = sampleKeys(p, multFactsFor([1,2,5,10]).map(f => mk(f.a,f.b)), n, 5);
  // shuffle, but never leave the same fact twice in a row
  for(let i = keys.length-1; i > 0; i--){ const j = ri(0,i); [keys[i],keys[j]] = [keys[j],keys[i]]; }
  // A neighbour swap is not enough once a pool is tiny: the first range
  // of the first year holds four facts and twenty questions, so the pass
  // has to look further down the queue for something different rather
  // than only at the next one, and in both directions, because a pair
  // sitting at the end of the queue has nothing to its right to trade with.
  const fits = (i, j) => {
    // moving keys[i] to j and keys[j] to i must not create a pair at
    // either end; neighbours that are the swapped slots themselves are
    // skipped, they are being replaced
    const x = keys[i], y = keys[j];
    if(y === keys[i-1]) return false;
    if(i + 1 < keys.length && i + 1 !== j && y === keys[i+1]) return false;
    if(j - 1 >= 0 && j - 1 !== i && x === keys[j-1]) return false;
    if(j + 1 < keys.length && j + 1 !== i && x === keys[j+1]) return false;
    return true;
  };
  for(let i = 1; i < keys.length; i++){
    if(keys[i] !== keys[i-1]) continue;
    let j = -1;
    for(let k = i + 1; k < keys.length && j < 0; k++) if(fits(i, k)) j = k;
    for(let k = i - 2; k >= 0 && j < 0; k--) if(fits(i, k)) j = k;
    if(j >= 0) [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  const out = keys.slice(0, n).map(itemFromKey);
  // a bucket key is a whole family, so two neighbours drawn from the
  // same bucket can still come out as the very same question; reroll
  // rather than ask it twice in a row
  const face = it => it.disp || it.text;
  for(let i = 1; i < out.length; i++){
    for(let g = 0; g < 8 && face(out[i]) === face(out[i-1]); g++) out[i] = itemFromKey(out[i].key);
  }
  return out;
}

/* =================================================================
   3b. WORKSHOP
   The second mode, and the reason it exists: some of what a child has
   to learn is not a fact to be recalled but a small piece of reasoning.
   Paying twelve crowns has several right answers and the work is in
   thinking one of them through. A race would put a clock on that and
   hand out points for speed, which teaches a child to guess.

   So the workshop measures nothing. No timer, no points, no medal, no
   ghost. It pays in parts, a currency the race cannot earn, and parts
   buy paint in the garage. A piece of work is six tasks long, because
   each one takes as long as several race questions.

   Keys start with `w`, so they live in the same Leitner box as facts
   without ever being mistaken for one: no track pool can produce them
   and the trouble-spots track filters them out.
   ================================================================= */
const isJobKey = k => k[0] === "w";

/* 1, 2, 5, 10, 20 and 50 are the coins in a Czech pocket, and the same
   six values are euro cents and British pence, so one set of artwork
   serves all three interface languages and only the unit changes. */
const MONEY = [1, 2, 5, 10, 20, 50];
/* Fewest coins for an amount. Greedy is provably optimal for this set,
   which is why the "pay it with as few coins as you can" task has one
   right number of coins to compare against. */
function fewestCoins(amount){
  const out = [];
  let left = amount;
  for(let i = MONEY.length - 1; i >= 0; i--){
    while(left >= MONEY[i]){ out.push(MONEY[i]); left -= MONEY[i]; }
  }
  return out;
}
const sum = a => a.reduce((s, x) => s + x, 0);

/* A job belongs to a school year like a track does. Paying with coins up
   to fifty is second year work and a first grader can only stare at it,
   so the workshop shows what the class has already met and nothing else.
   Counting parts is the first year's own job: it is the one thing the
   books spend their first three chapters on, and it is no good in a race
   because the work is the counting, not the recalling. */
const JOBS = [
  {id:"count", keys:["wc1","wc2","wc3"], n:6, grade:1},
  {id:"money", keys:["wm1","wm2","wm3"], n:6, grade:2}
];
const jobById = id => JOBS.find(j => j.id === id) || JOBS[0];
const jobsInGrade = p => JOBS.filter(j => !j.grade || j.grade <= gradeOf(p));
const jobsAhead = p => JOBS.filter(j => j.grade === gradeOf(p) + 1);
function jobStage(p, job){ return stageIndex(p, i => [job.keys[i]], job.keys.length); }

/* One money task. `check` takes the coins the child put on the counter,
   not a typed string, which is exactly why the answer had to stop being
   assumed to be a number. */
function moneyItem(key){
  if(key === "wm2"){
    const amount = ri(3, 99);
    const best = fewestCoins(amount);
    return {
      key, kind:"money", input:"coins", amount,
      ask: "jobPayFew", askArgs: [amount],
      solution: best,
      // the amount has to match and it has to be done in as few coins as
      // possible; getting the amount right the long way is a near miss,
      // not a win, because the whole task is the thinking about change
      check: picked => sum(picked) === amount && picked.length === best.length,
      near:  picked => sum(picked) === amount
    };
  }
  if(key === "wm3"){
    const price = ri(11, 88);
    // the next round note up, and strictly up: handing over exactly the
    // price would make the answer an empty counter, which is no task
    const paid  = price < 20 ? 20 : price < 50 ? 50 : 100;
    const back  = paid - price;
    return {
      key, kind:"money", input:"coins", amount: back,
      ask: "jobChange", askArgs: [price, paid],
      solution: fewestCoins(back),
      check: picked => sum(picked) === back
    };
  }
  const amount = ri(3, 40);
  return {
    key, kind:"money", input:"coins", amount,
    ask: "jobPayExact", askArgs: [amount],
    solution: fewestCoins(amount),
    check: picked => sum(picked) === amount
  };
}
/* --- counting parts, the first year's job ---
   The books open with three chapters of counting things on a picture,
   which is exactly what a race cannot hold: the work is the counting,
   done once, carefully, with a finger. Here the child counts what is in
   the tray and lays out the same number of parts, so the answer is made
   rather than typed and nothing has to be written down.
   Three steps: up to five, up to ten, and two kinds together, which is
   where adding starts in the first year. */
const PART_KINDS = ["bolt", "nut", "washer"];
function partSVG(kind, x, y, s, c){
  const g = `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})`;
  if(kind === "nut"){
    return `<g transform="${g}"><path d="M0 -11 L9.5 -5.5 L9.5 5.5 L0 11 L-9.5 5.5 L-9.5 -5.5 Z"
      fill="${c}" stroke="#7a5a1e" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="0" cy="0" r="4.4" fill="#fdf6e4" stroke="#7a5a1e" stroke-width="1.4"/></g>`;
  }
  if(kind === "washer"){
    return `<g transform="${g}"><circle cx="0" cy="0" r="10" fill="${c}" stroke="#7a5a1e" stroke-width="1.6"/>
      <circle cx="0" cy="0" r="4.2" fill="#fdf6e4" stroke="#7a5a1e" stroke-width="1.4"/></g>`;
  }
  return `<g transform="${g}"><rect x="-3.2" y="-2" width="6.4" height="15" rx="1.6" fill="${c}" stroke="#7a5a1e" stroke-width="1.4"/>
    <path d="M0 -12 L8 -7.5 L8 -2 L0 2.5 L-8 -2 L-8 -7.5 Z" fill="${c}" stroke="#7a5a1e" stroke-width="1.6" stroke-linejoin="round"/></g>`;
}
/* A tray of things to count. They sit on a grid with a little jitter, so
   they look tipped into the tray rather than lined up for marking, but
   never on top of each other: a child counting with a finger must be
   able to tell two of them apart. */
function partsTraySVG(groups){
  const W = 300, H = 104;
  let g = `<rect x="2" y="2" width="${W-4}" height="${H-4}" rx="12" fill="#fff6e6" stroke="#e0c79b" stroke-width="3"/>`;
  const all = [];
  for(const gr of groups) for(let i = 0; i < gr.n; i++) all.push(gr);
  const cols = Math.min(6, Math.max(3, Math.ceil(all.length / 2)));
  const rows = Math.ceil(all.length / cols);
  all.forEach((gr, i) => {
    const cx = (W / (cols + 1)) * ((i % cols) + 1) + (ri(0, 6) - 3);
    const cy = H / (rows + 1) * (Math.floor(i / cols) + 1) + (ri(0, 6) - 3);
    g += partSVG(gr.kind, cx, cy, 1, gr.c);
  });
  return `<svg class="parts" viewBox="0 0 ${W} ${H}" role="img" aria-hidden="true">${g}</svg>`;
}
const PART_C = {bolt:"#f0c063", nut:"#cfd7e6", washer:"#e8a87c"};
function countItem(key){
  const groups = [];
  let n;
  if(key === "wc3"){
    // two kinds in the tray, which is where the first year starts adding
    const a = ri(1, 5), b = ri(1, Math.min(5, 10 - a));
    const k1 = PART_KINDS[ri(0, 2)];
    let k2 = PART_KINDS[ri(0, 2)];
    if(k2 === k1) k2 = PART_KINDS[(PART_KINDS.indexOf(k1) + 1) % 3];
    groups.push({kind: k1, n: a, c: PART_C[k1]}, {kind: k2, n: b, c: PART_C[k2]});
    n = a + b;
  } else {
    n = key === "wc1" ? ri(1, 5) : ri(6, 10);
    const k = PART_KINDS[ri(0, 2)];
    groups.push({kind: k, n, c: PART_C[k]});
  }
  return {
    key, kind: "count", input: "pieces", answer: n,
    ask: key === "wc3" ? "jobCountBoth" : "jobCountAsk",
    pic: partsTraySVG(groups),
    solution: new Array(n).fill(1),
    missMsg: "jobCountMiss",
    check: picked => picked.length === n
  };
}
function jobItemFromKey(key){ return key[1] === "c" ? countItem(key) : moneyItem(key); }
/* Six tasks, the current step carrying most of them and the earlier
   steps coming back as review. Same shape as every track, so the
   workshop inherits spaced repetition rather than inventing its own. */
function buildJob(p, job){
  const si = jobStage(p, job);
  const review = job.keys.slice(0, si);
  const keys = focusAndReview(p, [job.keys[si]], review, job.n, 1);
  return keys.map(jobItemFromKey);
}

/* A coin, drawn from its value like everything else here. The low three
   are silver and the high three brass, which is what a Czech pocket
   looks like and gives the child a shape to sort by before reading. */
function coinSVG(v){
  const big = v >= 10;
  const r = v >= 50 ? 30 : v >= 20 ? 28 : v >= 10 ? 26 : v >= 5 ? 25 : v >= 2 ? 23 : 21;
  const face = big ? "#f0c063" : "#d7deea";
  const edge = big ? "#b5822c" : "#9aa7bd";
  const ink  = big ? "#6b4a12" : "#33405c";
  return `<svg class="coin" viewBox="0 0 64 64" role="img" aria-hidden="true">
    <circle cx="32" cy="32" r="${r}" fill="${edge}"/>
    <circle cx="32" cy="32" r="${r - 3.2}" fill="${face}"/>
    <circle cx="32" cy="32" r="${r - 6.5}" fill="none" stroke="${edge}" stroke-width="1.4" opacity=".55"/>
    <text x="32" y="${32 + r * 0.34}" text-anchor="middle" font-family="Baloo 2, system-ui, sans-serif"
      font-size="${r * 0.95}" font-weight="800" fill="${ink}">${v}</text>
  </svg>`;
}

/* The round window above the counter. Behind it stands the child's own
   racer, and one wedge of the cover comes off for every task solved, so
   by the end of the piece of work the picture is whole.
   What is uncovered is something the child already owns, so there is
   nothing here to win or lose and nothing new is being bought with
   performance; it is feedback in the shape of a picture, not a prize.
   Wedges rather than a fade, because the child should be able to count
   how many are left. A corrected task uncovers one as well, otherwise
   the window would quietly turn into a meter of getting things right
   first time, which is exactly what the workshop is here to avoid.
   The inner drawing arrives as a finished <svg>, which is given a box to
   sit in; a nested svg scales itself to that box. */
function wedgePath(cx, cy, r, a0, a1){
  const pt = a => {
    const q = (a - 0.25) * Math.PI * 2;
    return (cx + Math.cos(q) * r).toFixed(2) + " " + (cy + Math.sin(q) * r).toFixed(2);
  };
  return `M ${cx} ${cy} L ${pt(a0)} A ${r} ${r} 0 ${(a1 - a0) > .5 ? 1 : 0} 1 ${pt(a1)} Z`;
}
function revealSVG(inner, done, total){
  const R = 46, n = Math.max(1, total), got = Math.max(0, Math.min(n, done));
  const pic = String(inner).replace(/^<svg /, '<svg x="11" y="11" width="78" height="78" preserveAspectRatio="xMidYMid meet" ');
  let cover = "";
  for(let i = got; i < n; i++){
    cover += `<path d="${wedgePath(50, 50, R, i / n, (i + 1) / n)}" fill="#f2e3ca" stroke="#dcc5a0" stroke-width="1"/>`;
  }
  // the drawing is square and the window is round, so the corners have to
  // be cut off; without the clip a wide machine would stick out past the
  // rim, where no wedge can ever cover it
  return `<svg class="reveal" viewBox="0 0 100 100" role="img" aria-hidden="true">
    <defs><clipPath id="revcut"><circle cx="50" cy="50" r="${R}"/></clipPath></defs>
    <circle cx="50" cy="50" r="${R}" fill="#fffaf0"/>
    <g clip-path="url(#revcut)">${pic}</g>${cover}
    <circle cx="50" cy="50" r="${R}" fill="none" stroke="#dcc5a0" stroke-width="3"/>
  </svg>`;
}

/* --- the collection ---
   One place in a collection fills the moment one fact reaches level four
   in the box. It is therefore not a reward beside the learning but a
   picture of it: it cannot be collected by going round the outside, and
   it makes the Leitner box, which the child has no other way of seeing,
   visible.
   A lit place never goes dark. When a fact is forgotten and its level
   falls back, the place stays: a collection that emptied itself would
   punish the child for exactly the thing the whole game is built on,
   which is forgetting and coming back to it. That is why this is a field
   of its own and not something computed from `facts`. */
const STAR_LV = 4;
const starred = (p, key) => !!(p.stars || {})[key];
function lightStar(p, key){ (p.stars || (p.stars = {}))[key] = true; }
function starCount(p, keys){
  let n = 0;
  for(const k of keys) if(starred(p, k)) n++;
  return n;
}

/* --- record one answer into the Leitner box --- */
const SPEED = { slow:{fast:5200, super:3000}, normal:{fast:3800, super:2100}, fast:{fast:2800, super:1500} };
function thresholds(p, item){
  const s = SPEED[p.speedMode || "normal"];
  // reading a dial takes longer than recalling a fact, and the four
  // digits of a time take longer to key in than one or two
  // splitting a number apart and multiplying both halves is more work
  // than carrying once in a sum, so past the tables gets the longest
  // allowance of all; without this the child would score slow answers
  // for doing exactly what the book teaches
  // a chain is two operations where every other family has one, so it
  // gets twice the allowance of a plain sum; forgetting this is the one
  // thing in a new family that goes wrong quietly
  const slower = item.kind === "multx" || item.kind === "divx" ? 2.6
               : item.kind === "chain" ? 2.0
               : item.kind === "round" ? 2.0
               : item.kind === "clock" ? 2.4
               : (item.kind === "add1000" || item.kind === "sub1000") ? 2.2
               : (item.kind === "add100" || item.kind === "sub100") ? 1.9 : 1;
  return { fast: s.fast * slower, super: s.super * slower };
}
/* `ms` is null for workshop tasks, which are not timed at all. Such an
   answer counts towards accuracy and moves the Leitner level, but never
   touches the average answer time, because a piece of reasoning and a
   recalled fact are not the same measurement. */
function record(p, item, correct, ms){
  const f = p.facts[item.key] || (p.facts[item.key] = {lv:0, reps:0, ok:0, bad:0, best:null, seen:0});
  const timed = ms !== null && ms !== undefined;
  f.reps++; f.seen = Date.now();
  p.totalAns++;
  if(timed){ p.msSum += Math.min(ms, 20000); p.msN++; }
  if(correct){
    f.ok++; p.totalOk++;
    if(!timed){
      f.lv = Math.min(5, f.lv + 1);
    } else {
      if(f.best === null || ms < f.best) f.best = ms;
      const th = thresholds(p, item);
      if(ms <= th.fast) f.lv = Math.min(5, f.lv + 1);
      else if(f.lv < 3)  f.lv = f.lv + 1;
    }
  } else {
    f.bad++;
    f.lv = f.lv >= 3 ? 1 : Math.max(0, f.lv - 1);
  }
  // one place in the collection per fact that has reached level four; the
  // check sits after both branches so there is one place that can light
  // one, and none at all that can put one out
  if(f.lv >= STAR_LV) lightStar(p, item.key);
}

/* =================================================================
   4. COLLECTIBLES AND ARTWORK
   Every sprite is drawn from parameters, so the whole set costs a few
   hundred bytes instead of a folder full of images.
   ================================================================= */
const PETS = [
  {id:"pet_bimbo",   body:"blob",  c1:"#7ad3ff", c2:"#3ea8e0", ear:"round",  ex:"none",    pat:"none",   cost:25},
  {id:"pet_lupi",    body:"round", c1:"#ffd166", c2:"#e3a521", ear:"pointy", ex:"none",    pat:"spots",  cost:30},
  {id:"pet_mecha",    body:"round", c1:"#c79b73", c2:"#9c7350", ear:"round",  ex:"none",    pat:"none",   cost:30},
  {id:"pet_kiki",    body:"tall",  c1:"#ff9ec4", c2:"#e56d9d", ear:"long",   ex:"none",    pat:"none",   cost:40},
  {id:"pet_zub",  body:"blob",  c1:"#a4e768", c2:"#6fbb34", ear:"pointy", ex:"fin",     pat:"stripes",cost:40},
  {id:"pet_duha", body:"tall",  c1:"#d3a4ff", c2:"#9a6ae0", ear:"long",   ex:"horn",    pat:"none",   cost:60},
  {id:"pet_puk",     body:"round", c1:"#8ee6d5", c2:"#4bb8a4", ear:"none",   ex:"antenna", pat:"spots",  cost:60},
  {id:"pet_flek",  body:"blob",  c1:"#ffb3a1", c2:"#e0705a", ear:"round",  ex:"none",    pat:"spots",  cost:70},
  {id:"pet_sova",   body:"round", c1:"#b9a4ff", c2:"#7d63d8", ear:"pointy", ex:"wings",   pat:"none",   cost:80},
  {id:"pet_drak",  body:"tall",  c1:"#6fe0a8", c2:"#2ba36c", ear:"pointy", ex:"wings",   pat:"stripes",cost:100},
  {id:"pet_hvezd", body:"blob",  c1:"#ffe17a", c2:"#e0ab1f", ear:"none",   ex:"horn",    pat:"none",   cost:120},
  {id:"pet_noc",  body:"tall",  c1:"#6d7cff", c2:"#3a44b8", ear:"long",   ex:"wings",   pat:"spots",  cost:150}
];
const RIDES = [
  {id:"ri_raketa",   kind:"rocket", c1:"#ff6b6b", c2:"#ffd166", cost:50},
  {id:"ri_auto",  kind:"car",    c1:"#3ec1ff", c2:"#ffd166", cost:50},
  {id:"ri_motor",  kind:"bike",   c1:"#a4e768", c2:"#2f3b57", cost:70},
  {id:"ri_letad",  kind:"plane",  c1:"#ffb3d9", c2:"#7d63d8", cost:90},
  {id:"ri_ponor",  kind:"sub",    c1:"#ffd166", c2:"#f2557f", cost:110},
  {id:"ri_ufo", kind:"ufo", c1:"#8ee6d5", c2:"#5b4bd6", cost:140},
  {id:"ri_mech",    kind:"mech",   c1:"#5b6b8c", c2:"#ff6b6b", cost:60},
  {id:"ri_bugina",   kind:"buggy",  c1:"#2f3b57", c2:"#a4e768", cost:80}
];
/* Paints are what parts are for. They are bought with workshop currency
   only, so they cannot be raced for, and they change nothing but the
   colour of a machine: the rival is still your own best lap, and a
   repaint must not be able to make it easier to beat. */
const PAINTS = [
  {id:"pa_neon",   c1:"#3dffa0", c2:"#0f6b3a", cost:30},
  {id:"pa_cherry", c1:"#ff4d6d", c2:"#8c1230", cost:30},
  // deep blue on purpose: the starter car is already a light blue, and
  // a paint that costs forty parts has to look like something happened
  {id:"pa_ocean",  c1:"#1f6fd0", c2:"#0b3d73", cost:40},
  {id:"pa_sun",    c1:"#ffc93c", c2:"#a86a00", cost:40},
  {id:"pa_grape",  c1:"#a06bff", c2:"#4b2a9c", cost:55},
  {id:"pa_steel",  c1:"#c7d2e5", c2:"#4a5a80", cost:55},
  {id:"pa_lava",   c1:"#ff7a3d", c2:"#7a2a10", cost:70},
  {id:"pa_frost",  c1:"#d9f4ff", c2:"#3f7fa8", cost:70}
];
const paintById = id => PAINTS.find(x => x.id === id) || null;
/* Paint goes on the machine currently chosen. If the child is riding an
   animal there is nothing to paint, so it lands on the starter car and
   is waiting there next time a machine is picked. */
function wearPaint(p, paintId){
  const base = itemById(p.runner).kind ? p.runner : "ri_auto";
  if(paintId) p.paint[base] = paintId; else delete p.paint[base];
}

/* The starter six are free and picked before each race, the rest cost coins. */
const STARTERS = ["ri_auto", "ri_raketa", "ri_mech", "pet_kiki", "pet_lupi", "pet_mecha"];
const ALL_ITEMS = PETS.concat(RIDES);
const itemById = id => ALL_ITEMS.find(i => i.id === id) || PETS[0];
const nameOf = it => t(typeof it === "string" ? it : it.id);
const EVO = [0, 70, 220];   // experience needed for growth stages 1, 2, 3

function stageOf(p, id){
  const xp = p.xp[id] || 0;
  return xp >= EVO[2] ? 3 : xp >= EVO[1] ? 2 : 1;
}

/* --- sprite drawing --- */
function eyes(cx1, cx2, cy, r, look){
  const p = look ? 1.6 : 0;
  return `
   <ellipse cx="${cx1}" cy="${cy}" rx="${r}" ry="${r*1.1}" fill="#fff"/>
   <ellipse cx="${cx2}" cy="${cy}" rx="${r}" ry="${r*1.1}" fill="#fff"/>
   <circle cx="${cx1+p}" cy="${cy+.5}" r="${r*.55}" fill="#22314f"/>
   <circle cx="${cx2+p}" cy="${cy+.5}" r="${r*.55}" fill="#22314f"/>
   <circle cx="${cx1+p-r*.22}" cy="${cy-r*.28}" r="${r*.2}" fill="#fff"/>
   <circle cx="${cx2+p-r*.22}" cy="${cy-r*.28}" r="${r*.2}" fill="#fff"/>`;
}
function petSVG(it, stage){
  const s = stage || 1;
  const sc = s === 1 ? .84 : s === 2 ? 1 : 1.12;
  const w = it.body === "tall" ? 34 : it.body === "blob" ? 40 : 37;
  const h = it.body === "tall" ? 44 : it.body === "blob" ? 34 : 37;
  const cy = 62;
  let g = "";

  if(it.ex === "wings" && s >= 2){
    g += `<ellipse cx="${50-w*.95}" cy="${cy-6}" rx="15" ry="20" fill="${it.c2}" opacity=".75" transform="rotate(-22 ${50-w*.95} ${cy-6})"/>
          <ellipse cx="${50+w*.95}" cy="${cy-6}" rx="15" ry="20" fill="${it.c2}" opacity=".75" transform="rotate(22 ${50+w*.95} ${cy-6})"/>`;
  }
  if(it.ex === "fin"){
    g += `<path d="M50 ${cy-h-6} L${50+w*.7} ${cy-h*.2} L${50-w*.1} ${cy-h*.35} Z" fill="${it.c2}"/>`;
  }
  if(it.ear === "round"){
    g += `<circle cx="${50-w*.62}" cy="${cy-h*.82}" r="${9*sc}" fill="${it.c2}"/>
          <circle cx="${50+w*.62}" cy="${cy-h*.82}" r="${9*sc}" fill="${it.c2}"/>`;
  } else if(it.ear === "pointy"){
    g += `<path d="M${50-w*.72} ${cy-h*.55} L${50-w*.5} ${cy-h*1.28} L${50-w*.18} ${cy-h*.72} Z" fill="${it.c2}"/>
          <path d="M${50+w*.72} ${cy-h*.55} L${50+w*.5} ${cy-h*1.28} L${50+w*.18} ${cy-h*.72} Z" fill="${it.c2}"/>`;
  } else if(it.ear === "long"){
    g += `<ellipse cx="${50-w*.42}" cy="${cy-h*1.05}" rx="6.5" ry="17" fill="${it.c2}" transform="rotate(-12 ${50-w*.42} ${cy-h*1.05})"/>
          <ellipse cx="${50+w*.42}" cy="${cy-h*1.05}" rx="6.5" ry="17" fill="${it.c2}" transform="rotate(12 ${50+w*.42} ${cy-h*1.05})"/>`;
  }
  // nozky
  g += `<ellipse cx="${50-w*.42}" cy="${cy+h*.92}" rx="9" ry="6" fill="${it.c2}"/>
        <ellipse cx="${50+w*.42}" cy="${cy+h*.92}" rx="9" ry="6" fill="${it.c2}"/>`;
  // telo
  if(it.body === "blob"){
    g += `<path d="M50 ${cy-h} C ${50+w*1.15} ${cy-h*.75}, ${50+w*1.1} ${cy+h*.85}, 50 ${cy+h}
                   C ${50-w*1.1} ${cy+h*.85}, ${50-w*1.15} ${cy-h*.75}, 50 ${cy-h} Z" fill="${it.c1}"/>`;
  } else {
    g += `<ellipse cx="50" cy="${cy}" rx="${w}" ry="${h}" fill="${it.c1}"/>`;
  }
  if(it.pat === "spots"){
    g += `<circle cx="${50-w*.45}" cy="${cy+h*.2}" r="6" fill="${it.c2}" opacity=".55"/>
          <circle cx="${50+w*.5}" cy="${cy-h*.15}" r="4.5" fill="${it.c2}" opacity=".55"/>
          <circle cx="${50+w*.2}" cy="${cy+h*.5}" r="5" fill="${it.c2}" opacity=".55"/>`;
  } else if(it.pat === "stripes"){
    g += `<path d="M${50-w*.9} ${cy-h*.2} q ${w*.9} 8 ${w*1.8} 0" stroke="${it.c2}" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>
          <path d="M${50-w*.75} ${cy+h*.3} q ${w*.75} 8 ${w*1.5} 0" stroke="${it.c2}" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>`;
  }
  // bricho
  g += `<ellipse cx="50" cy="${cy+h*.34}" rx="${w*.55}" ry="${h*.42}" fill="#fff" opacity=".38"/>`;
  if(it.ex === "horn"){
    g += `<path d="M50 ${cy-h-2} l7 16 l-14 0 Z" fill="#fff8d6" stroke="${it.c2}" stroke-width="2.5" stroke-linejoin="round"/>`;
  }
  if(it.ex === "antenna"){
    g += `<path d="M50 ${cy-h+2} q 4 -16 12 -19" stroke="${it.c2}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <circle cx="${62}" cy="${cy-h-17}" r="6" fill="${it.c2}"/>`;
  }
  g += eyes(50 - w*.32, 50 + w*.32, cy - h*.18, 7.6 * (s===3?1.05:1), s >= 2);
  g += `<path d="M${50-6} ${cy+h*.16} q 6 7 12 0" stroke="#22314f" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  if(s === 3){
    g += `<path d="M50 ${cy-h-14} l3.5 7.5 8 1 -6 5.5 1.6 8-7.1-4-7.1 4 1.6-8-6-5.5 8-1 Z" fill="#ffd166" stroke="#e0ab1f" stroke-width="1.6" stroke-linejoin="round"/>`;
  }
  return `<svg viewBox="0 0 100 118" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g transform="translate(50 62) scale(${sc}) translate(-50 -62)">${g}</g></svg>`;
}
function rideSVG(it){
  const {c1, c2} = it;
  let g = "";
  if(it.kind === "rocket"){
    g = `<path d="M20 62 q 34 -46 62 -4 q -28 16 -62 4 Z" fill="${c1}"/>
         <path d="M28 60 q -14 4 -16 18 q 16 -2 22 -12 Z" fill="${c2}"/>
         <circle cx="60" cy="52" r="8" fill="#e8f4ff" stroke="${c2}" stroke-width="3"/>
         <path d="M22 64 q -14 6 -18 16 q 16 0 24 -8 Z" fill="${c2}" opacity=".7"/>
         <path d="M14 70 q -12 4 -12 12 q 12 0 18 -6 Z" fill="#ffb020" opacity=".9"/>`;
  } else if(it.kind === "car"){
    g = `<path d="M12 66 q 6 -16 22 -16 l 8 -12 q 18 -3 26 12 l 14 3 q 8 3 6 13 Z" fill="${c1}"/>
         <path d="M44 42 q 14 -2 20 10 l -22 0 Z" fill="#e8f4ff"/>
         <circle cx="30" cy="72" r="11" fill="#2f3b57"/><circle cx="30" cy="72" r="4.5" fill="${c2}"/>
         <circle cx="70" cy="72" r="11" fill="#2f3b57"/><circle cx="70" cy="72" r="4.5" fill="${c2}"/>`;
  } else if(it.kind === "bike"){
    g = `<circle cx="26" cy="70" r="14" fill="none" stroke="#2f3b57" stroke-width="6"/>
         <circle cx="74" cy="70" r="14" fill="none" stroke="#2f3b57" stroke-width="6"/>
         <path d="M26 70 L50 50 L74 70" stroke="${c1}" stroke-width="8" fill="none" stroke-linecap="round"/>
         <path d="M44 48 q 14 -10 26 -2" stroke="${c2}" stroke-width="6" fill="none" stroke-linecap="round"/>
         <ellipse cx="46" cy="48" rx="12" ry="7" fill="${c1}"/>`;
  } else if(it.kind === "plane"){
    g = `<ellipse cx="50" cy="58" rx="38" ry="12" fill="${c1}"/>
         <path d="M40 56 L26 30 L38 30 L54 54 Z" fill="${c2}"/>
         <path d="M44 60 L34 82 L46 82 L58 62 Z" fill="${c2}" opacity=".8"/>
         <circle cx="70" cy="56" r="6" fill="#e8f4ff" stroke="${c2}" stroke-width="2.5"/>
         <path d="M12 58 l -8 -10 l 0 20 Z" fill="${c2}"/>`;
  } else if(it.kind === "sub"){
    g = `<ellipse cx="50" cy="62" rx="36" ry="17" fill="${c1}"/>
         <rect x="42" y="36" width="16" height="14" rx="4" fill="${c2}"/>
         <circle cx="64" cy="60" r="8" fill="#e8f4ff" stroke="${c2}" stroke-width="3"/>
         <circle cx="42" cy="62" r="5" fill="#e8f4ff" stroke="${c2}" stroke-width="2.5"/>
         <path d="M14 62 l -10 -9 l 0 18 Z" fill="${c2}"/>`;
  } else if(it.kind === "mech"){
    g = `<rect x="20" y="66" width="18" height="14" rx="4" fill="${c1}"/>
         <rect x="58" y="66" width="18" height="14" rx="4" fill="${c1}"/>
         <rect x="30" y="34" width="40" height="34" rx="9" fill="${c1}"/>
         <rect x="36" y="42" width="28" height="13" rx="5" fill="#0f1730"/>
         <rect x="40" y="45" width="7" height="7" rx="2" fill="${c2}"/>
         <rect x="53" y="45" width="7" height="7" rx="2" fill="${c2}"/>
         <rect x="14" y="42" width="12" height="26" rx="5" fill="${c2}"/>
         <rect x="74" y="42" width="12" height="26" rx="5" fill="${c2}"/>
         <rect x="46" y="22" width="8" height="12" rx="3" fill="${c2}"/>
         <circle cx="50" cy="20" r="5" fill="#ffd166"/>`;
  } else if(it.kind === "buggy"){
    g = `<path d="M16 64 L26 44 L62 44 L76 64 Z" fill="${c1}"/>
         <path d="M30 46 L36 34 L58 34 L64 46 Z" fill="none" stroke="${c2}" stroke-width="4" stroke-linejoin="round"/>
         <rect x="14" y="60" width="70" height="8" rx="4" fill="${c2}"/>
         <circle cx="28" cy="72" r="13" fill="#1b2436"/><circle cx="28" cy="72" r="5" fill="${c2}"/>
         <circle cx="72" cy="72" r="13" fill="#1b2436"/><circle cx="72" cy="72" r="5" fill="${c2}"/>`;
  } else {
    g = `<ellipse cx="50" cy="66" rx="40" ry="12" fill="${c2}"/>
         <ellipse cx="50" cy="60" rx="26" ry="16" fill="${c1}" opacity=".95"/>
         <ellipse cx="50" cy="52" rx="18" ry="14" fill="#e8f4ff" opacity=".9"/>
         <circle cx="24" cy="70" r="4" fill="#fff"/><circle cx="50" cy="74" r="4" fill="#fff"/><circle cx="76" cy="70" r="4" fill="#fff"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${g}</svg>`;
}
function itemSVG(p, id){
  const it = itemById(id);
  if(!it.kind) return petSVG(it, stageOf(p, id));
  const pa = paintById((p.paint || {})[id]);
  return rideSVG(pa ? Object.assign({}, it, {c1: pa.c1, c2: pa.c2}) : it);
}

/* --- track environments ---
   A palette is four colours: two for the ground and two for whatever is
   scattered on it. `dark` swaps the scenery for stars on a night sky,
   and `tok` says what is collected there, because the thing found in a
   place belongs to the place rather than to the track.
   The first fifteen were picked by hand and stay exactly as they are;
   they are the look of the circuit world. The other worlds are generated
   from a hue, so a whole new world costs fifteen short lines instead of
   sixty hand mixed colours. */
function hsl(h, s, l){
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  const t3 = h < 60 ? [c,x,0] : h < 120 ? [x,c,0] : h < 180 ? [0,c,x]
           : h < 240 ? [0,x,c] : h < 300 ? [x,0,c] : [c,0,x];
  return "#" + t3.map(v => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("");
}
/* Ground hue, scenery hue, lightness, what is collected, and then the
   handful of things only some places need: `dark` for a night sky,
   `h2`/`l2` for a gradient that ends somewhere other than a shade of its
   own colour, and `sat` for stone and fog, which have to be dull.
   `hill1` is always the top of the gradient and `hill2` the bottom. On
   the ground that means light above and darker below, which is how a
   field looks; a sky is the other way round, dark overhead and bright at
   the horizon, so a sky says so rather than being derived. */
function pal(h, dh, l, tok, opt){
  const o = opt || {};
  const sat = o.sat === undefined ? 46 : o.sat;
  const e = {
    hill1: hsl(h,  sat, l),
    hill2: hsl(o.h2 === undefined ? h : o.h2, sat - 2, o.l2 === undefined ? l - 13 : o.l2),
    dec:   hsl(dh, sat - 2, Math.max(15, l - 24)),
    dec2:  hsl(dh, sat,     Math.max(9,  l - 34)),
    tok: tok
  };
  if(o.dark) e.dark = true;
  return e;
}
const ENVS = Object.assign({
  meadow:{hill1:"#8fd88a", hill2:"#63b862", dec:"#3d9b57", dec2:"#2c7c42", tok:"flower"},
  forest:{hill1:"#5fa96b", hill2:"#37804d", dec:"#225936", dec2:"#164227", tok:"leaf"},
  canyon:{hill1:"#e08a5b", hill2:"#bd6440", dec:"#8c4224", dec2:"#67311a", tok:"stone"},
  peaks:{ hill1:"#a8bde0", hill2:"#7a93bb", dec:"#51658c", dec2:"#3b4d6d", tok:"crystal"},
  city:{  hill1:"#8f7fd0", hill2:"#6455ac", dec:"#3d3280", dec2:"#2a2260", tok:"star", dark:true},
  space:{ hill1:"#3a3577", hill2:"#221d4a", dec:"#4a4290", dec2:"#332d68", tok:"star", dark:true},
  beach:{ hill1:"#ffe0a3", hill2:"#f2c274", dec:"#3fa8b8", dec2:"#d49a44", tok:"shell"},
  ocean:{ hill1:"#3f9fc4", hill2:"#256d8c", dec:"#19566f", dec2:"#0f3f52", tok:"shell"},
  night:{ hill1:"#33406e", hill2:"#1e2848", dec:"#3d4b7d", dec2:"#2a3560", tok:"star", dark:true},
  storm:{ hill1:"#5c6790", hill2:"#3d456b", dec:"#313a5f", dec2:"#222a49", tok:"star", dark:true},
  school:{hill1:"#7fd4c2", hill2:"#46a894", dec:"#2d7f6d", dec2:"#1d5c4e", tok:"star"},
  clocktown:{hill1:"#f6c9d8", hill2:"#d992ad", dec:"#a85f81", dec2:"#7c4460", tok:"flower"},
  // deliberately darker and redder than the canyon, which is the only
  // other warm environment and would otherwise look like the same place
  volcano:{hill1:"#c9584a", hill2:"#8f2f24", dec:"#5e1b13", dec2:"#3d0f0a", tok:"drop"},
  // olive and gold, so it reads as neither the green meadow and forest
  // nor the orange canyon nor the pale sand of the beach
  savanna:{hill1:"#cbb457", hill2:"#a08a34", dec:"#6e5c1c", dec2:"#4d4012", tok:"leaf"},
  // brown stone, the one colour family nothing else uses
  cave:{   hill1:"#9c7b5e", hill2:"#6f543c", dec:"#4a3626", dec2:"#32241a", tok:"stone"}
}, {
  // The first year's ranges, a coastline that walks along beside the
  // beach the twenty track already had: the child goes from the dunes
  // down to the water and along it, and crossing the ten is the pier.
  // A marsh for the circuit: a deep blue green, the one colour family
  // none of the fifteen hand mixed circuit places and none of the
  // coastline uses. Darker than the school track's mint on purpose, or
  // the two would read as the same place on a thumbnail.
  marsh:  pal(170, 150, 52, "drop"),
  dunes:  pal( 46,  90, 72, "shell"),
  shore:  pal( 38, 190, 76, "shell"),
  palms:  pal(105, 150, 58, "leaf"),
  bay:    pal(186, 200, 64, "drop"),
  cliffs: pal( 28,  95, 56, "stone"),
  pier:   pal(205, 215, 54, "crystal"),
  // The trail: woods, water and open ground, walked rather than driven.
  // The ground stays in the colours ground comes in; where a place is
  // genuinely another colour, the heather and the blossom, it sits above
  // green rather than turning the whole field purple.
  tr_moss:    pal(112, 130, 68, "flower"),
  tr_ferns:   pal(128, 145, 58, "leaf"),
  tr_birch:   pal( 88, 110, 72, "leaf"),
  tr_clearing:pal(100, 125, 62, "flower"),
  tr_creek:   pal(174, 190, 62, "drop"),
  tr_log:     pal( 35,  95, 52, "stone"),
  tr_glade:  pal( 96, 130, 64, "flower"),
  tr_pines:  pal(145, 160, 44, "leaf"),
  tr_heath:  pal(288, 120, 58, "flower", {h2:120, l2:44, sat:32}),
  tr_rocks:  pal(212, 220, 58, "stone",  {sat:20}),
  tr_village:pal( 32,  20, 60, "star"),
  tr_burrow: pal( 25,  30, 34, "stone"),
  tr_field:  pal( 48,  40, 62, "leaf"),
  tr_quarry: pal( 12,  18, 46, "crystal", {sat:26}),
  tr_brook:  pal(186, 200, 60, "drop"),
  tr_lake:   pal(205, 215, 48, "shell"),
  tr_falls:  pal(168, 185, 40, "drop"),
  tr_orchard:pal(340, 350, 66, "flower", {h2:110, l2:52, sat:34}),
  tr_dusk:   pal(255, 265, 28, "star",   {dark:1}),
  tr_mist:   pal(215, 225, 44, "drop",   {sat:16}),
  tr_garden: pal(120, 100, 55, "flower"),
  tr_reeds:  pal(150, 130, 58, "leaf"),
  // The sky: the top of the gradient stays in the blues whatever the
  // track, because that is what makes it read as sky at all, and the
  // character of the place is carried by the horizon underneath it.
  sk_meadowair:pal(198, 210, 62, "drop",  {h2:110, l2:78}),
  sk_hilltop:  pal(202, 215, 58, "star",  {h2:150, l2:80}),
  sk_updraft:  pal(208, 220, 60, "leaf",  {h2: 60, l2:82}),
  sk_first:    pal(196, 205, 64, "drop",  {h2:190, l2:84}),
  sk_flock:    pal(214, 225, 54, "star",  {h2:220, l2:80}),
  sk_arch:     pal(226, 300, 52, "crystal", {h2:280, l2:80}),
  sk_dawn:   pal(205, 285, 64, "star",    {h2: 38, l2:86}),
  sk_clouds: pal(206, 210, 58, "drop",    {h2:200, l2:83}),
  sk_sunset: pal(258, 330, 46, "star",    {h2: 18, l2:74}),
  sk_ridge:  pal(220, 235, 50, "crystal", {h2:196, l2:79}),
  sk_rainbow:pal(232, 300, 58, "crystal", {h2:320, l2:81}),
  sk_void:   pal(245, 255, 20, "star",    {h2:250, l2:32, dark:1}),
  sk_dust:   pal(210,  40, 56, "stone",   {h2: 42, l2:77}),
  sk_storm:  pal(230, 240, 28, "drop",    {h2:235, l2:44, dark:1, sat:24}),
  sk_breeze: pal(195, 185, 56, "leaf",    {h2:176, l2:85}),
  sk_high:   pal(212, 205, 46, "drop",    {h2:200, l2:75}),
  sk_ember:  pal(250,  20, 44, "drop",    {h2: 24, l2:72}),
  sk_moon:   pal(262, 285, 26, "star",    {h2:272, l2:41, dark:1}),
  sk_night:  pal(236, 250, 14, "star",    {h2:242, l2:27, dark:1}),
  sk_fog:    pal(212, 218, 58, "drop",    {h2:216, l2:81, sat:22}),
  sk_kite:   pal(200, 140, 52, "leaf",    {h2:150, l2:79}),
  sk_haze:   pal(204, 170, 60, "drop",    {h2:160, l2:82}),
  // The deep: water at the top and the sea floor below it, so the light
  // falls the right way and no track ends up looking like a red sea.
  dp_pool:   pal(184, 160, 70, "shell",   {h2:178, l2:54}),
  dp_tide:   pal(196, 170, 66, "drop",    {h2:190, l2:50}),
  dp_grass:  pal(180, 150, 60, "leaf",    {h2:155, l2:40}),
  dp_coral:  pal(194,  10, 62, "shell",   {h2: 10, l2:52}),
  dp_drift:  pal(200, 205, 58, "drop",    {h2:205, l2:42}),
  dp_arch:   pal(206, 250, 54, "crystal", {h2:245, l2:36}),
  dp_shallow:pal(190, 165, 62, "shell",   {h2:185, l2:44}),
  dp_kelp:   pal(185, 140, 52, "leaf",    {h2:148, l2:32}),
  dp_reef:   pal(192,   5, 56, "shell",   {h2:345, l2:40}),
  dp_trench: pal(215, 230, 30, "crystal", {h2:225, l2:16, dark:1}),
  dp_city:   pal(200, 250, 50, "crystal", {h2:250, l2:30}),
  dp_abyss:  pal(235, 250, 18, "star",    {h2:240, l2: 8, dark:1}),
  dp_sand:   pal(190,  40, 58, "shell",   {h2: 45, l2:58}),
  dp_cavern: pal(200, 210, 40, "stone",   {h2:210, l2:22, sat:24}),
  dp_lagoon: pal(178, 160, 66, "drop",    {h2:172, l2:48}),
  dp_current:pal(205, 215, 52, "drop",    {h2:212, l2:34}),
  dp_vent:   pal(195,  18, 44, "stone",   {h2: 10, l2:32}),
  dp_pearl:  pal(200, 310, 58, "shell",   {h2:320, l2:48}),
  dp_midnight:pal(230, 245, 18, "star",   {h2:240, l2: 9, dark:1}),
  dp_murk:   pal(190, 200, 42, "drop",    {h2:196, l2:26, sat:20}),
  dp_garden: pal(185, 145, 56, "flower",  {h2:150, l2:40}),
  // a shallow: the floor is close enough to the surface that the water
  // still colours it, so it is a muted green blue rather than the grass
  // green the first draft gave it, which read as a lawn under water
  dp_shoal:  pal(188, 150, 62, "shell",   {h2:158, l2:52, sat:38})
});

/* --- worlds ---
   One game in a different coat, never two games. A world changes the
   landscape of every track, the order the racers are offered in, and a
   handful of words. It changes **no** material, no difficulty and no
   unlocking, and records are stored under the track id, so switching
   worlds leaves every record standing; that has to stay true.
   The racers listed here are only put first. Nothing a child owns ever
   becomes unpickable, because a profile must never lose what it has. */
const WORLDS = [
  // the circuit is the original look, so TRACKS keeps its env as the
  // default and this world adds nothing on top of it
  {id:"circuit", rides:["ri_auto","ri_bugina","ri_motor","ri_mech"], env:{}},
  {id:"trail", rides:["pet_kiki","pet_lupi","pet_mecha","pet_bimbo","pet_zub","pet_duha",
                      "pet_puk","pet_flek","pet_sova","pet_drak","pet_hvezd","pet_noc"],
   env:{a3:"tr_moss", a5:"tr_ferns", a7:"tr_birch", a10:"tr_clearing", a15:"tr_creek",
        a20:"tr_brook", bridge:"tr_log",
        t1:"tr_glade", t2:"tr_pines", t3:"tr_heath", t4:"tr_rocks", t5:"tr_village",
        d1:"tr_burrow", chain:"tr_reeds", beyond:"tr_field", round:"tr_quarry",
        a100:"tr_lake", a1000:"tr_falls", clock:"tr_orchard", mix:"tr_dusk",
        weak:"tr_mist", school:"tr_garden"}},
  {id:"sky", rides:["ri_raketa","ri_letad","ri_ufo","pet_drak","pet_sova"],
   env:{a3:"sk_meadowair", a5:"sk_hilltop", a7:"sk_updraft", a10:"sk_first", a15:"sk_flock",
        a20:"sk_breeze", bridge:"sk_arch",
        t1:"sk_dawn", t2:"sk_clouds", t3:"sk_sunset", t4:"sk_ridge", t5:"sk_rainbow",
        d1:"sk_void", chain:"sk_haze", beyond:"sk_dust", round:"sk_storm",
        a100:"sk_high", a1000:"sk_ember", clock:"sk_moon", mix:"sk_night",
        weak:"sk_fog", school:"sk_kite"}},
  {id:"deep", rides:["ri_ponor","ri_ufo","pet_zub","pet_puk","ri_mech"],
   env:{a3:"dp_pool", a5:"dp_tide", a7:"dp_grass", a10:"dp_coral", a15:"dp_drift",
        a20:"dp_lagoon", bridge:"dp_arch",
        t1:"dp_shallow", t2:"dp_kelp", t3:"dp_reef", t4:"dp_trench", t5:"dp_city",
        d1:"dp_abyss", chain:"dp_shoal", beyond:"dp_sand", round:"dp_cavern",
        a100:"dp_current", a1000:"dp_vent", clock:"dp_pearl", mix:"dp_midnight",
        weak:"dp_murk", school:"dp_garden"}}
];
const worldById = id => WORLDS.find(w => w.id === id) || WORLDS[0];
/* The one place that decides what a track looks like. Everything that
   draws a landscape asks here rather than reading tr.env, which is now
   only the circuit world's default. */
function envOf(p, tr){
  return (worldById(p && p.world).env[tr.id]) || tr.env;
}
/* Older profiles, and anything pointing at a world that no longer
   exists, land in the circuit, which is where they already were. */
function seedWorld(p){
  if(!p.world || !WORLDS.some(w => w.id === p.world)) p.world = WORLDS[0].id;
}
/* The racers this world is about, put first. This orders, it never
   filters: a machine bought with coins stays pickable in every world. */
function ridesOrder(p, items){
  const pref = worldById(p && p.world).rides;
  return items.slice().sort((a, b) => {
    const ia = pref.indexOf(a.id), ib = pref.indexOf(b.id);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
}
function tokenShape(kind, filled, c){
  const f = filled ? c.c1 : "#e6ebf6";
  const s = filled ? c.c2 : "#ccd6e8";
  const w = `fill="${f}" stroke="${s}" stroke-width="1.3" stroke-linejoin="round"`;
  if(kind === "flower"){
    return `<g ${w}><circle cx="12" cy="5.9" r="4"/><circle cx="18.1" cy="12" r="4"/>`
         + `<circle cx="12" cy="18.1" r="4"/><circle cx="5.9" cy="12" r="4"/></g>`
         + `<circle cx="12" cy="12" r="3" fill="${s}"/>`;
  }
  if(kind === "leaf"){
    return `<path d="M20 4 C 20 15, 13 21, 4 20 C 4 9, 11 3, 20 4 Z" ${w}/>`
         + `<path d="M17 7 L7 17" stroke="${s}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
  }
  if(kind === "stone"){
    return `<path d="M4.5 14 L8 5.5 L17 4 L21 11 L16.5 20 L7 19.5 Z" ${w}/>`;
  }
  if(kind === "crystal"){
    return `<path d="M12 2 L19 9 L14 22 L10 22 L5 9 Z" ${w}/>`
         + `<path d="M5 9 L19 9" stroke="${s}" stroke-width="1.1" fill="none"/>`;
  }
  if(kind === "shell"){
    return `<path d="M12 21 C 3 17, 2 8, 12 3 C 22 8, 21 17, 12 21 Z" ${w}/>`
         + `<path d="M12 4 L12 20 M7.5 6 L9.5 20 M16.5 6 L14.5 20" stroke="${s}" stroke-width="1" fill="none"/>`;
  }
  if(kind === "drop"){
    return `<path d="M12 2 C 17 9, 20 12, 20 15.2 A 8 8 0 0 1 4 15.2 C 4 12, 7 9, 12 2 Z" ${w}/>`;
  }
  if(kind === "cog"){
    // the workshop is no landscape, so it gets the one shape that belongs
    // to none of them and is already its own sign everywhere else
    let teeth = "";
    for(let i = 0; i < 6; i++){
      teeth += `<rect x="10.4" y="1.2" width="3.2" height="5" rx="1.2" transform="rotate(${i * 60} 12 12)"/>`;
    }
    return `<g ${w}>${teeth}<circle cx="12" cy="12" r="7"/></g>`
         + `<circle cx="12" cy="12" r="2.7" fill="${s}"/>`;
  }
  return `<path d="M12 2 l3 6.4 7 1 -5 4.9 1.2 7 -6.2 -3.3 -6.2 3.3 1.2 -7 -5 -4.9 7 -1 Z" ${w}/>`;
}
function tokenSVG(kind, filled, c){
  return `<svg class="tok" viewBox="0 0 24 24" aria-hidden="true">${tokenShape(kind, filled, c)}</svg>`;
}
/* A collection can hold nearly two hundred places, so a whole one is
   drawn as a single picture rather than one element per place; the page
   then carries a dozen nodes instead of four hundred. The places keep
   the order of the keys, so a given fact always sits in the same spot. */
function tokenGridSVG(p, spec){
  const n = spec.keys.length;
  const cols = n <= 12 ? 6 : n <= 60 ? 10 : 14;
  const rows = Math.ceil(n / cols);
  const step = 28;
  let g = "";
  for(let i = 0; i < n; i++){
    const x = (i % cols) * step + 2, y = Math.floor(i / cols) * step + 2;
    g += `<g transform="translate(${x} ${y})">${tokenShape(spec.kind, starred(p, spec.keys[i]), spec)}</g>`;
  }
  return `<svg class="toks" viewBox="0 0 ${cols * step} ${rows * step}" aria-hidden="true">${g}</svg>`;
}
/* How big a track's collection is and what it looks like. The size is
   simply how much material the track holds, so a times table has some
   forty places and a bucket track a dozen; different places hold
   different amounts and that is the point of them. */
function trackSpec(p, tr){
  if(tr.op === "mix" || tr.op === "weak") return null;   // no material of their own
  if(tr.op === "school") return null;                    // borrowed pool, would count twice
  const keys = trackKeys(p, tr);
  if(!keys.length) return null;
  // the collection follows the world like the landscape does: what is
  // found in a place belongs to the place, and the count never changes
  const e = ENVS[envOf(p, tr)] || ENVS.meadow;
  return {title: trackName(p, tr), keys, kind: e.tok || "star", c1: e.hill1, c2: e.dec};
}
/* The workshop keeps a collection too, and it is not a track, so it says
   here what its places are rather than being sized from trackKeys(); it
   is exactly the spot where the workshop was forgotten once before, in
   the parent heat map. */
function shopSpec(p){
  return {
    title: t("shopTitle"), kind: "cog", c1: "#f0c063", c2: "#b5822c",
    keys: jobsInGrade(p).reduce((acc, j) => acc.concat(j.keys), [])
  };
}
/* Which collections are worth showing: everything the child can reach,
   plus anything already started behind a closed door, so nothing that
   has been earned can disappear from view. */
function collectionSpecs(p){
  const out = [];
  for(const tr of TRACKS){
    const spec = trackSpec(p, tr);
    if(!spec) continue;
    // next year's collection shows up only once something in it is lit,
    // which is what happens if the child tried it from the peek
    if((inGrade(p, tr) && unlockState(p, tr).open) || starCount(p, spec.keys)) out.push(spec);
  }
  out.push(shopSpec(p));
  return out;
}
/* The number on the map, counted over the collections the child can
   actually open, so it matches what the screen behind the button shows. */
function starsAll(p){
  let n = 0;
  for(const spec of collectionSpecs(p)) n += starCount(p, spec.keys);
  return n;
}
/* =================================================================
   5. RACE CIRCUIT
   Each track is a closed curve made of cubic Bezier segments, grown
   from a seeded random generator so a given track always looks the
   same. All geometry is computed in plain JS rather than through the
   SVG DOM API, which keeps it testable outside a browser.
   ================================================================= */
const VW = 400, VH = 205;                 // souradnice sceny

function seedRand(str){
  let h = 2166136261;
  for(let i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function(){
    h += 0x6D2B79F5; let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function bezPt(p0, c1, c2, p1, t){
  const m = 1 - t, a = m*m*m, b = 3*m*m*t, c = 3*m*t*t, d = t*t*t;
  return {x: a*p0.x + b*c1.x + c*c2.x + d*p1.x, y: a*p0.y + b*c1.y + c*c2.y + d*p1.y};
}

/* --- the route of one race ---
   A world is not the same road repainted. The circuit is a closed loop
   driven round; the trail winds through the woods to a big tree; the sky
   is a line of hops from cloud to cloud up to a rainbow gate; the deep
   sinks past one fish after another to a sunken chest. The child moves
   along it exactly as before, one step of 1/n per correct answer, so
   nothing about scoring, records or the ghost changes: only the shape of
   the line and what stands beside it.
   A route reports the same three things whatever its shape, a path to
   draw, a polyline to measure and a list of stops to put things on, so
   everything downstream, atU() included, never learns which world it is
   in. */
const ROUTE_KIND = {circuit:"loop", trail:"wind", sky:"hop", deep:"dive"};
const STOPS = 8;

/* Sample a chain of cubic segments into a polyline. Closed routes come
   back to where they started, open ones end at the last point; both end
   up as the same kind of table, which is what keeps atU() ignorant of
   the difference. */
function traceSegs(segs, closed){
  const f = v => v.toFixed(1);
  let d = "M " + f(segs[0].p0.x) + " " + f(segs[0].p0.y);
  const samples = []; let total = 0;
  for(const s of segs){
    d += " C " + f(s.c1.x) + " " + f(s.c1.y) + ", " + f(s.c2.x) + " " + f(s.c2.y)
       + ", " + f(s.p1.x) + " " + f(s.p1.y);
    for(let j = 0; j < 36; j++){
      const pt = bezPt(s.p0, s.c1, s.c2, s.p1, j / 36);
      if(samples.length){
        const q = samples[samples.length - 1];
        total += Math.hypot(pt.x - q.x, pt.y - q.y);
      }
      samples.push({x: pt.x, y: pt.y, d: total});
    }
  }
  const last = segs[segs.length - 1].p1;
  total += Math.hypot(last.x - samples[samples.length-1].x, last.y - samples[samples.length-1].y);
  samples.push({x: last.x, y: last.y, d: total});
  if(closed) d += " Z";
  return {d, samples, total};
}
/* A rounded corner joining each pair of points, so a line of stops turns
   into a path that bends rather than a zigzag of straight bits. */
function smoothSegs(pts){
  const segs = [];
  for(let i = 0; i < pts.length - 1; i++){
    const p0 = pts[Math.max(0, i-1)], p1 = pts[i], p2 = pts[i+1], p3 = pts[Math.min(pts.length-1, i+2)];
    segs.push({
      p0: p1, p1: p2,
      c1: {x: p1.x + (p2.x - p0.x)/5.4, y: p1.y + (p2.y - p0.y)/5.4},
      c2: {x: p2.x - (p3.x - p1.x)/5.4, y: p2.y - (p3.y - p1.y)/5.4}
    });
  }
  return segs;
}
/* An arc over each gap instead of a bend through it: this is what makes
   the sky read as hopping from one cloud to the next rather than flying
   a smooth line past them. */
function hopSegs(pts, lift){
  const segs = [];
  for(let i = 0; i < pts.length - 1; i++){
    const a = pts[i], b = pts[i+1], dx = b.x - a.x;
    segs.push({
      p0: a, p1: b,
      c1: {x: a.x + dx/3, y: a.y - lift},
      c2: {x: b.x - dx/3, y: b.y - lift}
    });
  }
  return segs;
}

const routeCache = {};
/* The closed loop of the circuit world, unchanged down to the seed: the
   tracks have to look exactly as they did, and a record set on one of
   them is a record on the same shape. */
function loopRoute(id){
  const rnd = seedRand("okruh-" + id);
  const n = 9 + Math.floor(rnd() * 4);          // 9 to 12 corners
  const cx = VW/2, cy = VH/2 + 2, rx = 134, ry = 64;
  const pts = [];
  const step = Math.PI * 2 / n;
  for(let i = 0; i < n; i++){
    const a = i * step - Math.PI/2 + (rnd() - 0.5) * step * 0.5;
    pts.push({
      x: cx + Math.cos(a) * rx * (0.62 + rnd() * 0.66),
      y: cy + Math.sin(a) * ry * (0.6 + rnd() * 0.68)
    });
  }
  const segs = [];
  for(let i = 0; i < n; i++){
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    segs.push({
      p0: p1, p1: p2,
      c1: {x: p1.x + (p2.x - p0.x)/6.6, y: p1.y + (p2.y - p0.y)/6.6},
      c2: {x: p2.x - (p3.x - p1.x)/6.6, y: p2.y - (p3.y - p1.y)/6.6}
    });
  }
  return Object.assign(traceSegs(segs, true), {stops: [], closed: true, kind: "loop"});
}
/* An open route: eight stops from one side to the other, the last of
   them being where the goal stands. The line is laid out from a seed of
   its own, so a track keeps the same shape in a given world for ever
   while looking like a different place in each. */
function openRoute(kind, id){
  const rnd = seedRand("cesta-" + kind + "-" + id);
  // every track has to be recognisable from its own shape, the way the
  // circuits are, so the number of stops, the size of the bends and how
  // steeply the route climbs or sinks are all drawn from the seed rather
  // than fixed; fifteen routes that differed only in colour would make
  // the map thumbnails useless
  const n = 6 + Math.floor(rnd() * 4);              // 6 to 9 stops
  const lift = 18 + rnd() * 18;                     // how high the hops arc
  const amp = 22 + rnd() * 22;                      // how far the trail swings
  const waves = 1.4 + rnd() * 1.4;                  // how often it swings
  const phase = rnd() * Math.PI * 2;
  const slant = 0.62 + rnd() * 0.38;                // how much of the drop is used
  const x0 = 44, x1 = VW - 42;
  const pts = [];
  const climb = (VH - 104) * slant;
  const from = 40 + rnd() * 26;                     // where the journey starts
  for(let i = 0; i < n; i++){
    const k = i / (n - 1);
    const edge = i === 0 || i === n - 1;
    // the last leg is stretched a little so the goal is not standing on
    // top of the last cloud or fish
    const kx = i === n - 1 ? 1 : k * 0.92;
    const x = x0 + (x1 - x0) * kx + (edge ? 0 : (rnd() - .5) * 22);
    // the climb or the descent is the shape of the world; the wave on top
    // of it is the shape of this one track
    const wave = Math.sin(phase + k * Math.PI * waves) * amp * .45;
    let y;
    if(kind === "hop")       y = VH - from - k * climb + wave + (rnd() - .5) * 12;
    else if(kind === "dive") y = from + k * climb + wave + (rnd() - .5) * 12;
    else                     y = VH/2 + Math.sin(phase + k * Math.PI * waves) * amp + (rnd() - .5) * 12;
    pts.push({x, y: Math.max(34, Math.min(VH - 32, y))});
  }
  const segs = kind === "hop" ? hopSegs(pts, lift) : smoothSegs(pts);
  return Object.assign(traceSegs(segs, false), {stops: pts, closed: false, kind});
}
function route(world, id){
  const kind = ROUTE_KIND[world] || "loop";
  const key = kind + "|" + id;
  if(routeCache[key]) return routeCache[key];
  return (routeCache[key] = kind === "loop" ? loopRoute(id) : openRoute(kind, id));
}
/* The circuit world's loop, kept under its old name because the tests
   and the older notes call it that. */
function circuit(id){ return route("circuit", id); }
function routeOf(p, tr){ return route((p && p.world) || "circuit", tr.id); }

/* position and heading on the track, u runs from 0 to 1 */
function atU(c, u){
  const target = Math.max(0, Math.min(1, u)) * c.total;
  const S = c.samples;
  let lo = 0, hi = S.length - 1;
  while(lo < hi - 1){ const mid = (lo + hi) >> 1; if(S[mid].d <= target) lo = mid; else hi = mid; }
  const a = S[lo], b = S[hi];
  const span = (b.d - a.d) || 1, k = (target - a.d) / span;
  const x = a.x + (b.x - a.x) * k, y = a.y + (b.y - a.y) * k;
  const p = S[Math.max(0, lo - 2)], q = S[Math.min(S.length - 1, hi + 2)];
  return {x, y, ang: Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI};
}

/* --- what stands beside the route ---
   Every one of these is drawn from numbers, like the creatures and the
   circuits, so a whole world costs a few hundred bytes. */
const FISH_C = ["#ff8a5c", "#ffd93d", "#8bd94f", "#4fc3ff", "#f2557f", "#b9a4ff", "#5ee7c4"];
function cloudSVG(x, y, s){
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})" opacity=".96">
    <ellipse cx="0" cy="7" rx="26" ry="9" fill="#ffffff" opacity=".55"/>
    <circle cx="-11" cy="2" r="10" fill="#ffffff"/><circle cx="2" cy="-3" r="13" fill="#ffffff"/>
    <circle cx="14" cy="3" r="9.5" fill="#ffffff"/>
    <rect x="-21" y="2" width="42" height="9" rx="4.5" fill="#ffffff"/>
  </g>`;
}
function fishSVG(x, y, i, flip){
  const c = FISH_C[i % FISH_C.length];
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${flip ? -1 : 1} 1)">
    <path d="M13 0 L22 -7 L22 7 Z" fill="${c}" opacity=".85"/>
    <ellipse cx="0" cy="0" rx="14" ry="8.5" fill="${c}"/>
    <path d="M-2 -8.5 q 5 -7 9 -1" fill="${c}" opacity=".8"/>
    <circle cx="-8" cy="-2" r="2.4" fill="#18253f"/>
    <circle cx="-8.8" cy="-2.8" r="0.9" fill="#fff"/>
  </g>`;
}
function mushroomSVG(x, y, e){
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
    <ellipse cx="0" cy="9" rx="9" ry="3" fill="#000" opacity=".14"/>
    <rect x="-3.2" y="-1" width="6.4" height="11" rx="3" fill="#f6efdc"/>
    <path d="M-12 0 a 12 10 0 0 1 24 0 z" fill="${e.dec}"/>
    <circle cx="-5" cy="-3" r="2.4" fill="#fff8e6" opacity=".9"/>
    <circle cx="4" cy="-4.5" r="1.8" fill="#fff8e6" opacity=".9"/>
  </g>`;
}
/* The goal at the end of the road. The circuit has no goal object
   because its goal is the start line it comes back to. */
function goalSVG(kind, x, y, e){
  if(kind === "hop"){        // a rainbow gate to fly through
    let bands = "";
    ["#ff6b6b","#ffb020","#ffd93d","#8bd94f","#4fc3ff","#a06bff"].forEach((c, i) => {
      bands += `<path d="M ${-30 + i*2.6} 26 a ${30 - i*2.6} ${30 - i*2.6} 0 0 1 ${(30 - i*2.6)*2} 0"
        fill="none" stroke="${c}" stroke-width="2.6"/>`;
    });
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">${bands}
      <ellipse cx="0" cy="28" rx="30" ry="5" fill="#ffffff" opacity=".5"/></g>`;
  }
  if(kind === "dive"){       // a sunken chest, lid open
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      <ellipse cx="0" cy="15" rx="24" ry="5" fill="#000" opacity=".18"/>
      <path d="M-19 -4 a 19 13 0 0 1 38 0 z" fill="#8a5a2b" stroke="#5d3a17" stroke-width="2"/>
      <rect x="-19" y="-2" width="38" height="17" rx="3" fill="#a76f36" stroke="#5d3a17" stroke-width="2"/>
      <rect x="-21" y="-2" width="42" height="4.5" rx="2" fill="#ffd166"/>
      <rect x="-3.5" y="2" width="7" height="9" rx="2" fill="#ffd166"/>
      <circle cx="-9" cy="-8" r="3" fill="#ffe9a8"/><circle cx="8" cy="-9" r="2.4" fill="#bfe9ff"/>
    </g>`;
  }
  if(kind === "wind"){       // the big tree at the end of the trail
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      <ellipse cx="0" cy="22" rx="20" ry="5" fill="#000" opacity=".16"/>
      <rect x="-5" y="-2" width="10" height="24" rx="4" fill="${e.dec2}"/>
      <circle cx="0" cy="-14" r="18" fill="${e.dec}"/>
      <circle cx="-14" cy="-5" r="12" fill="${e.dec}"/>
      <circle cx="14" cy="-6" r="11" fill="${e.dec2}"/>
      <circle cx="0" cy="-4" r="5" fill="#3a2415"/>
    </g>`;
  }
  return "";
}
/* Where the road begins, so it is clear which way the journey runs.
   Drawn rather than written: an emoji here would be at the mercy of
   whatever font the phone happens to have. */
function startSVG(kind, x, y){
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
    <rect x="-1.6" y="-16" width="3.2" height="20" rx="1.6" fill="#ffffff" opacity=".9"/>
    <path d="M1.6 -15 L14 -10.5 L1.6 -6 Z" fill="#ff6b6b" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>
    <ellipse cx="0" cy="4.5" rx="6" ry="2.2" fill="#000" opacity=".18"/></g>`;
}

/* --- render the scene ---
   One drawing for the race screen and for the map thumbnail, because
   what the child taps on the map has to be the place they end up in.
   `thumb` only drops the detail that is unreadable at ninety pixels. */
function sceneSVG(world, env, id, opt){
  const e = ENVS[env] || ENVS.meadow;
  const c = route(world, id);
  const kind = c.kind;
  const dark = !!e.dark;
  const thumb = !!(opt && opt.thumb);
  const prog = Math.max(0, Math.min(1, (opt && opt.prog) || 0));
  const rnd = seedRand("dek2-" + kind + "-" + id);
  const gid = id + "_" + env;

  // scenery, kept off the road itself
  let deco = "";
  const inside = (x, y) => Math.hypot((x - VW/2) / 58, (y - VH/2) / 24) < 1;
  const outside = (x, y) => x < 34 || x > VW - 34 || y < 22 || y > VH - 22;
  const many = thumb ? 22 : 46;
  // whatever stands at the end of the road has to be the thing the eye
  // lands on, so nothing is scattered near it
  const goal = c.stops.length ? c.stops[c.stops.length - 1] : null;
  const clear = (x, y) => !goal || Math.hypot(x - goal.x, y - goal.y) > 52;
  for(let i = 0; i < many; i++){
    const x = rnd() * VW, y = rnd() * VH;
    const s = 0.7 + rnd() * 0.7;
    if(!clear(x, y)) continue;
    if(kind === "hop"){
      // distant clouds, anywhere but where the route is about to be drawn
      if(rnd() < .5) deco += cloudSVG(x, y, s * (thumb ? .5 : .42));
      else deco += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.4*s).toFixed(1)}" fill="#fff" opacity=".5"/>`;
      continue;
    }
    if(kind === "dive"){
      // bubbles, and weed rooted on the sea floor
      if(y > VH - 46 && rnd() < .55){
        deco += `<path d="M${x.toFixed(1)} ${VH} q ${(6*s).toFixed(1)} -14 0 -26 q ${(-6*s).toFixed(1)} -12 0 -20"
          fill="none" stroke="${e.dec}" stroke-width="${(3.4*s).toFixed(1)}" stroke-linecap="round" opacity=".85"/>`;
      } else {
        deco += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2.2*s).toFixed(1)}" fill="none"
          stroke="#ffffff" stroke-width="1.1" opacity="${(.2 + rnd()*.35).toFixed(2)}"/>`;
      }
      continue;
    }
    if(!inside(x, y) && !outside(x, y)) continue;
    if(dark){
      deco += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.1*s).toFixed(1)}" fill="#fff" opacity="${(.25 + rnd()*.5).toFixed(2)}"/>`;
    } else if(rnd() < .62){
      deco += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})">
        <ellipse cx="0" cy="9" rx="8" ry="2.6" fill="#000" opacity=".14"/>
        <rect x="-1.7" y="1" width="3.4" height="8" rx="1.6" fill="${e.dec2}"/>
        <circle cx="0" cy="-4" r="7.8" fill="${e.dec}"/>
        <circle cx="-3.8" cy="0.6" r="5.4" fill="${e.dec}"/>
        <circle cx="4" cy="0" r="5.6" fill="${e.dec2}"/></g>`;
    } else {
      deco += `<ellipse cx="${x.toFixed(1)}" cy="${(y+1.5).toFixed(1)}" rx="${(6.6*s).toFixed(1)}" ry="${(3.8*s).toFixed(1)}" fill="${e.dec2}"/>
               <ellipse cx="${(x-1.2).toFixed(1)}" cy="${(y-1).toFixed(1)}" rx="${(5.4*s).toFixed(1)}" ry="${(3*s).toFixed(1)}" fill="${e.dec}"/>`;
    }
  }

  // one light source, so the sky has a top and the deep has a surface
  if(kind === "hop"){
    deco = (dark
      ? `<circle cx="342" cy="34" r="15" fill="#e8ecff" opacity=".9"/>
         <circle cx="336" cy="30" r="13" fill="${e.hill1}"/>`
      : `<circle cx="52" cy="36" r="19" fill="#fff3b0" opacity=".55"/>
         <circle cx="52" cy="36" r="13" fill="#ffe066"/>`) + deco;
  } else if(kind === "dive"){
    deco = `<path d="M0 0 L400 0 L400 12 Q 200 26 0 12 Z" fill="#ffffff" opacity=".28"/>` + deco;
  }

  // the road itself: tarmac on the circuit, a worn path on the trail,
  // and nothing but a dotted line where there is no ground to walk on
  let road;
  if(kind === "loop"){
    road = `<path d="${c.d}" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="36" stroke-linejoin="round"/>
      <path d="${c.d}" fill="none" stroke="#f4f6fb" stroke-width="33" stroke-linejoin="round"/>
      <path d="${c.d}" fill="none" stroke="#e0556f" stroke-width="33" stroke-linejoin="round"
            stroke-dasharray="9 9" opacity=".85"/>
      <path d="${c.d}" fill="none" stroke="#2b3550" stroke-width="26" stroke-linejoin="round"/>`;
  } else if(kind === "wind"){
    road = `<path d="${c.d}" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="24" stroke-linecap="round"/>
      <path d="${c.d}" fill="none" stroke="#e8d7ae" stroke-width="20" stroke-linecap="round"/>
      <path d="${c.d}" fill="none" stroke="#cbb384" stroke-width="20" stroke-linecap="round"
            stroke-dasharray="2 16" opacity=".8"/>`;
  } else {
    road = `<path d="${c.d}" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"
            stroke-dasharray="1 13" opacity=".55"/>`;
  }

  // the stops, and the goal standing on the last of them
  let stops = "";
  c.stops.forEach((s, i) => {
    if(i === c.stops.length - 1) return;
    if(kind === "hop") stops += cloudSVG(s.x, s.y + 12, 1);
    else if(kind === "dive") stops += fishSVG(s.x, s.y - 16, i, i % 2 === 0);
    else stops += mushroomSVG(s.x, s.y + 19, e);
  });
  let ends = "";
  if(c.stops.length){
    const last = c.stops[c.stops.length - 1], first = c.stops[0];
    // a patch of open ground under the goal, so it reads as a place
    // arrived at rather than one more thing scattered about
    if(kind === "wind"){
      // white rather than a colour from the palette: a lighter patch of
      // whatever ground this is works in every environment, while a tint
      // of the ground colour turns into a stain on half of them
      ends += `<ellipse cx="${last.x.toFixed(1)}" cy="${(last.y + 8).toFixed(1)}" rx="44" ry="24"
        fill="#ffffff" opacity=".2"/>`;
    }
    ends += goalSVG(kind, last.x, last.y - (kind === "hop" ? 4 : 12), e);
    if(!thumb) ends += startSVG(kind, first.x, first.y + (kind === "dive" ? -18 : 16));
  }

  // start and finish line plus the quarter markers, the circuit's own
  let checks = "", marks = "";
  if(kind === "loop"){
    const fin = atU(c, 0);
    checks = `<g transform="translate(${fin.x.toFixed(1)} ${fin.y.toFixed(1)}) rotate(${fin.ang.toFixed(1)})">
      <rect x="-4" y="-15" width="8" height="30" rx="1.5" fill="#fff"/>`;
    for(let r = 0; r < 6; r++) for(let col = 0; col < 2; col++){
      if((r + col) % 2) checks += `<rect x="${-4 + col*4}" y="${-15 + r*5}" width="4" height="5" fill="#1b2436"/>`;
    }
    checks += `</g>`;
  }
  if(!thumb){
    [0.25, 0.5, 0.75].forEach((u, i) => {
      const m = atU(c, u);
      const far = kind === "loop" ? 18 : 8, len = kind === "loop" ? 9 : 6, wide = kind === "loop" ? 4 : 3;
      marks += `<g class="ck" data-ck="${i}" transform="translate(${m.x.toFixed(1)} ${m.y.toFixed(1)}) rotate(${m.ang.toFixed(1)})">
        <rect x="${-wide/2}" y="${-far - len}" width="${wide}" height="${len}" rx="${wide/2}" fill="#ffffff" opacity=".7"/>
        <rect x="${-wide/2}" y="${far}" width="${wide}" height="${len}" rx="${wide/2}" fill="#ffffff" opacity=".7"/></g>`;
    });
  }

  // how far along the child is: on the map it is how much of the track
  // they have mastered, in a race it is where they are right now
  const trailW = kind === "loop" ? (thumb ? 30 : 26) : (thumb ? 11 : 9);
  const off = (c.total * (1 - prog)).toFixed(1);
  const groundA = dark ? "#131c36" : e.hill1;
  const groundB = dark ? "#0d1428" : e.hill2;
  const shade = thumb && kind === "loop"
    ? `<path d="${c.d}" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="40" stroke-linejoin="round"/>
       <path d="${c.d}" fill="none" stroke="#2b3550" stroke-width="30" stroke-linejoin="round"/>`
    : road;

  return `<svg ${thumb ? "" : `id="circuit"`} viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="grd_${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${groundA}"/><stop offset="1" stop-color="${groundB}"/>
      </linearGradient>
      <linearGradient id="trl_${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#4fc3ff"/><stop offset="1" stop-color="#34e39b"/>
      </linearGradient>
    </defs>
    <rect width="${VW}" height="${VH}" fill="url(#grd_${gid})"/>
    ${deco}${shade}${stops}
    <path ${thumb ? "" : `id="trail"`} d="${c.d}" fill="none" stroke="url(#trl_${gid})" stroke-width="${trailW}"
          stroke-linejoin="round" stroke-linecap="${kind === "loop" ? "butt" : "round"}"
          stroke-dasharray="${c.total.toFixed(1)}" stroke-dashoffset="${off}"/>
    ${kind === "loop" && !thumb
      ? `<path d="${c.d}" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-dasharray="7 11" opacity=".45"/>`
      : ""}
    ${ends}${marks}${checks}
  </svg>`;
}
function sceneThumb(world, env, id, prog){
  return sceneSVG(world, env, id, {thumb: true, prog: prog});
}

/* =================================================================
   6. SOUND
   Short synthesised tones, no audio files. The wrong answer tone is
   deliberately soft rather than a buzzer.
   ================================================================= */
let AC = null;
function tone(freqs, dur, type, gain){
  if(!DB.sound) return;
  try{
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if(AC.state === "suspended") AC.resume();
    freqs.forEach((f, i) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type || "sine"; o.frequency.value = f;
      const t0 = AC.currentTime + i * (dur * .55);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(gain || .16, t0 + .015);
      g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
      o.connect(g); g.connect(AC.destination);
      o.start(t0); o.stop(t0 + dur + .02);
    });
  }catch(e){}
}
const sfx = {
  ok:    () => tone([660, 880], .16, "triangle", .13),
  great: () => tone([660, 880, 1170], .15, "triangle", .14),
  bad:   () => tone([300, 232], .2, "sine", .11),
  coin:  () => tone([1050, 1400], .1, "triangle", .1),
  win:   () => tone([523, 659, 784, 1047], .22, "triangle", .13)
};
function buzz(ms){ try{ navigator.vibrate && navigator.vibrate(ms); }catch(e){} }

/* =================================================================
   7. SCREENS
   ================================================================= */
const app = document.getElementById("app");
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* Two axes decide the layout: how wide the window is and whether it is
   held on its side. JS decides them rather than a media query, because
   the map is built in JS and has to know how many columns it has, and
   because a couple of the rules would need an `or` inside a media query,
   which older Android does not understand. The two values are written on
   <html>, so the stylesheet reads them as html[data-w="tablet"] and
   html[data-o="wide"], and the sheets pinned to <body> inherit them too.
   Called once at boot, then on every resize and orientationchange. */
function layoutClass(){
  const de = document.documentElement;
  if(!de || !de.dataset) return;
  const w = window.innerWidth || 375, h = window.innerHeight || 812;
  de.dataset.w = w < 600 ? "phone" : w < 900 ? "tablet" : "desk";
  // a short wide window only pays off from 640 px across: below that the
  // two columns of the race screen would both be too narrow to read
  de.dataset.o = (w > h && w >= 640) ? "wide" : "tall";
}
/* How many columns of places the map has. Two on a phone, because that
   is what 375 px fits; three on a tablet and four from 900 px, where two
   would mean a card nearly half the screen wide and a preview the size
   of half a phone, which stops reading as a map. */
function mapCols(){
  const de = document.documentElement;
  const w = (de && de.dataset && de.dataset.w) || "phone";
  return w === "desk" ? 4 : w === "tablet" ? 3 : 2;
}

let view = {name:"players"};
function go(name, data){ view = Object.assign({name}, data || {}); render(); }

function render(){
  const p = P();
  applyLang();
  if(p && rememberUnlocks(p)) save();
  if(view.name !== "game") stopAnim();
  if(view.name === "setpin"){ app.innerHTML = viewSetPin(); return; }
  if(view.name !== "players" && !p){ view = {name:"players"}; }
  const html =
    view.name === "players"    ? viewPlayers() :
    view.name === "map"        ? viewMap(p) :
    view.name === "game"       ? viewGame(p) :
    view.name === "result"     ? viewResult(p) :
    view.name === "collection" ? viewCollection(p) :
    view.name === "tokens"     ? viewTokens(p) :
    view.name === "shop"       ? viewShop(p) :
    view.name === "job"        ? viewJob(p) :
    view.name === "jobdone"    ? viewJobDone(p) :
    view.name === "gate"       ? viewGate() :
    view.name === "parent"     ? viewParent(p) : viewPlayers();
  app.innerHTML = html;
  if(view.name === "game") mountGame();
  if(view.name === "result") mountResult();
  // A screen may be entered at a particular section rather than at the
  // top: coming out of the workshop with parts to spend, the garage
  // should already be showing the paints instead of asking the child to
  // scroll past every machine and animal to find them.
  if(view.focus){
    const el = document.getElementById(view.focus);
    if(el && el.scrollIntoView) el.scrollIntoView({block:"start"});
  }
}

/* ---------- player picker ---------- */
function viewPlayers(){
  const rows = DB.profiles.map(p => `
    <button class="player" data-act="pick" data-id="${p.id}">
      <span class="av">${itemSVG(p, p.runner)}</span>
      <span style="flex:1;min-width:0">
        <span class="nm">${esc(p.name)}</span>
        <span class="sub">${t("playerLine", p.runs, p.coins)}${p.streak > 1 ? t("playerStreak", p.streak) : ""}</span>
      </span>
      <span class="del" data-act="delplayer" data-id="${p.id}">&#10005;</span>
    </button>`).join("");
  return `<div class="scr narrow">
    <div class="hero">
      <h1>${t("appName")}</h1>
      <p>${t("tagline")}</p>
    </div>
    <div class="scr-scroll">
      <div class="players">
        ${rows || `<div class="card" style="text-align:center"><div class="muted">${t("noPlayers")}</div></div>`}
        <button class="btn wide" data-act="newplayer">${t("newPlayer")}</button>
      </div>
      <div class="pad muted" style="text-align:center;font-size:12px">
        ${t("storageNote")}
      </div>
    </div>
  </div>`;
}

/* ---------- the map, which is a world rather than a list ----------
   Fifteen tracks plus the workshop is past the point where a column of
   cards reads as anything, so the places are laid out along a winding
   road instead. The layout is computed from the same kind of seed as the
   circuits, so a world always looks the same, and it is measured in
   percent across and pixels down, which keeps it inside any phone.
   The road is decoration. **Tapping a place goes straight there**; there
   is no journey along the road to sit through, because the one study
   found on hub structures reports a drop in felt competence and autonomy
   when the player has to keep passing through the middle. */
function medalEmoji(m){ return ["", "&#129353;", "&#129352;", "&#129351;"][m] || ""; }
/* A place is 44 percent wide, so the two columns cannot touch even at
   the far end of the wobble, and the step is half a card, so two places
   on the same side never overlap either. Both are checked by the
   numbers below rather than by looking at it on one phone. */
const PLACE_STEP = 96;      // vertical distance between two neighbours
const PLACE_H = 172;        // how tall a place card is, give or take
/* A wider window gets more columns, and a wider card is a taller card:
   the preview keeps its 400 : 205 shape and the text under it takes the
   measured 92 px whatever the width. Only the two column layout has a
   card of a known height, so only that one can use the constant. */
function placeHeight(widthPx){ return widthPx * 205 / 400 + 92; }
/* How wide one place is, in percent of the map, and how tall in pixels.
   Two columns keep the numbers the phone was measured on; from three
   columns up the width follows the count and the height follows from it.
   The percentages match the widths in the stylesheet, which is where the
   card is actually sized. */
function placeBox(cols){
  if(cols < 3) return {w: 44, h: PLACE_H, step: PLACE_STEP};
  const w = 100 / cols - 3;
  const px = ((app && app.clientWidth) || 375) * w / 100;
  const h = placeHeight(px);
  return {w, h, step: h + 22};
}
/* gapAt, when given, is the index where this year starts: the road takes
   half a step more there, which is the room the year sign stands in.
   With three or four columns the extra half step belongs to the whole
   row, otherwise the places sharing that row would sit at two heights.
   cols defaults to two, so every caller that does not care about the
   width keeps the layout the phone was measured on. */
function worldSpots(p, n, gapAt, cols){
  const rnd = seedRand("svet-" + (p && p.world ? p.world : "circuit"));
  const b = placeBox(cols || 2);
  const out = [];
  if((cols || 2) < 3){
    for(let i = 0; i < n; i++){
      const wobble = rnd() * 3;
      const left = (i % 2 ? 51 : 2) + wobble;        // 2 to 5, or 51 to 54
      const gap = (gapAt != null && i >= gapAt) ? PLACE_STEP / 2 : 0;
      const y = 14 + i * PLACE_STEP + gap;
      out.push({left, y, cx: left + 22, cy: y + PLACE_H / 2});
    }
    return out;
  }
  // the road snakes: left to right along one row, right to left along the
  // next, so it still reads as one path rather than as a grid.
  // This year starts on a row of its own, because the year sign stands in
  // the half step above it and there is no room for it between two cards
  // sharing a row; the cells left over at the end of the row before it
  // simply stay empty.
  const pad = gapAt == null ? 0 : (cols - gapAt % cols) % cols;
  for(let i = 0; i < n; i++){
    const j = gapAt != null && i >= gapAt ? i + pad : i;
    const r = Math.floor(j / cols);
    const c = r % 2 ? cols - 1 - (j % cols) : j % cols;
    // 0.5 to 2.5 of wobble leaves a one percent lane between two columns
    // and keeps the last one half a percent inside the right edge
    const left = c * (100 / cols) + 0.5 + rnd() * 2;
    const y = 14 + r * b.step + (gapAt != null && i >= gapAt ? b.step / 2 : 0);
    out.push({left, y, cx: left + b.w / 2, cy: y + b.h / 2});
  }
  return out;
}
/* An S bend between each pair of places. The stroke keeps its width
   whatever the screen, because the picture is stretched sideways to the
   width of the phone and would otherwise squash the road with it. */
function worldRoad(spots, h){
  if(!spots.length) return "";
  let d = `M ${spots[0].cx.toFixed(1)} 0 L ${spots[0].cx.toFixed(1)} ${spots[0].cy.toFixed(1)}`;
  for(let i = 1; i < spots.length; i++){
    const a = spots[i-1], b = spots[i], m = (b.cy - a.cy) / 2;
    d += ` C ${a.cx.toFixed(1)} ${(a.cy + m).toFixed(1)}, ${b.cx.toFixed(1)} ${(b.cy - m).toFixed(1)},`
       + ` ${b.cx.toFixed(1)} ${b.cy.toFixed(1)}`;
  }
  const last = spots[spots.length - 1];
  return d + ` L ${last.cx.toFixed(1)} ${h}`;
}
/* How full this place's collection is, shown on the place itself so the
   child can see from the map where there is still something to find. */
function placeTokens(p, spec){
  if(!spec) return "";
  return `<span class="tokc">&#10024; ${starCount(p, spec.keys)}/${spec.keys.length}</span>`;
}
function viewMap(p){
  const shown = visibleTracks(p);
  const ahead = peekTracks(p);
  const peeking = PEEK === p.id && ahead.length > 0;
  /* Earlier years are folded away, so the map starts where the class is
     rather than reading as one long continuation of the last two years.
     Nothing is taken away: the material stays in the profile, in the box
     and in the parent area, it is simply behind a door here.

     The door and the year sign hang on there being something behind
     them, that is at least one track yearOf() calls "past", never on
     tr.grade being lower. A second year revises the whole of the first
     year, so it has nothing behind a door and gets neither -- which is
     right: its map is one block, all of it this year's. */
  const past = foldsYears(p) ? shown.filter(tr => yearOf(p, tr) === "past") : [];
  const folding = past.length > 0;
  const own = folding ? shown.filter(tr => yearOf(p, tr) !== "past") : shown;
  const backOpen = folding && BACK === p.id;
  const pastShown = backOpen ? past : [];
  /* the road, top to bottom: the door to earlier years and what is
     behind it when it is open, the year sign, this year's tracks, the
     workshop, then the door to next year and next year's places once
     that one is open */
  const nPast = (folding ? 1 : 0) + pastShown.length;
  const total = nPast + own.length + 1 + (ahead.length ? 1 : 0) + (peeking ? ahead.length : 0);
  const cols = mapCols();
  const spots = worldSpots(p, total, folding ? nPast : null, cols);
  // the map is as tall as its lowest card, whatever the number of columns
  const box = placeBox(cols);
  const height = spots.reduce((m, s) => Math.max(m, s.y), 0) + box.h + 20;

  const placeHTML = (tr, spot, kind) => {
    const peek = kind === "peek";
    const u = peek ? {open: true} : unlockState(p, tr);
    const pr = Math.round(trackProgress(p, tr) * 100);
    const med = p.done[tr.id] || 0;
    const at = `style="left:${spot.left.toFixed(1)}%;top:${spot.y}px"`;
    const head = `<span class="thumb">${sceneThumb(p.world, envOf(p, tr), tr.id, u.open ? trackProgress(p, tr) : 0)}</span>
      <span class="nm">${trackName(p, tr)}</span>
      <span class="sub">${trackSub(p, tr)}</span>`;
    // a locked place is still drawn, just dark: the child sees where the
    // road goes on to, which is the whole point of a map
    if(!u.open){
      return `<div class="place locked${kind ? " " + kind : ""}" ${at}>${head}
        <span class="lockmsg">&#128274; ${u.why}</span></div>`;
    }
    return `<button class="place${kind ? " " + kind : ""}" data-act="play" data-id="${tr.id}" ${at}>${head}
      ${(tr.op === "mix" || tr.op === "weak") ? "" : `<span class="bar"><i style="width:${pr}%"></i></span>`}
      <span class="foot">${medalEmoji(med)}${placeTokens(p, trackSpec(p, tr))}</span>
    </button>`;
  };

  /* The door back into the years the class has already been through, and
     the sign that says where this year begins. The door is only a fold,
     not a lock: everything behind it is the child's own material, drawn
     in full rather than dashed. Like the look ahead, it is a variable
     and not a field in the profile, so closing the game or switching
     player folds it back. */
  let backPlace = "", sign = "";
  if(folding){
    const specs = past.map(tr => trackSpec(p, tr)).filter(Boolean);
    const have = specs.reduce((n, s) => n + starCount(p, s.keys), 0);
    const all = specs.reduce((n, s) => n + s.keys.length, 0);
    const bs = spots[0];
    backPlace = `<button class="place backdoor" data-act="back"
        style="left:${bs.left.toFixed(1)}%;top:${bs.y}px">
      <span class="thumb backthumb">${backOpen ? "&#128214;" : "&#128218;"}</span>
      <span class="nm">${t("backTitle")}</span>
      <span class="sub">${t("backSub", gradeList(past))}</span>
      <span class="foot">${backOpen ? t("backHide") : t("backShow")}
        ${all ? `<span class="tokc">&#10024; ${have}/${all}</span>` : ""}</span>
    </button>`;
    backPlace += pastShown.map((tr, i) => placeHTML(tr, spots[1 + i], "past")).join("");
    // the sign sits on the road halfway through the extra half step; the
    // middle of that S bend is the midpoint of the two places it joins
    const a = spots[nPast - 1], b = spots[nPast];
    sign = `<div class="milestone" id="milestone" style="left:${((a.cx + b.cx) / 2).toFixed(1)}%;`
      + `top:${((a.cy + b.cy) / 2).toFixed(1)}px">${t("yearSign", t("grade" + gradeOf(p)))}</div>`;
  }
  const places = own.map((tr, i) => placeHTML(tr, spots[nPast + i], "")).join("");

  // the workshop keeps its own look and its own place off the road, so it
  // never reads as one more track in the row
  const sp = spots[nPast + own.length];
  const shopPlace = `<button class="place shopplace" data-act="shop"
      style="left:${sp.left.toFixed(1)}%;top:${sp.y}px">
    <span class="thumb shopthumb">&#128736;</span>
    <span class="nm">${t("shopTitle")}</span>
    <span class="sub">${t("shopSub")}</span>
    <span class="foot">&#9881; ${p.parts}${placeTokens(p, shopSpec(p))}</span>
  </button>`;

  /* A door at the end of the road on to what the class does next year.
     Opening it lays the rest of the road out and lets the child try any
     of it, and it is forgotten the moment the game is closed: it is a
     look ahead, not a promotion, and the year in the profile is the
     parent's to set. */
  let peekPlace = "";
  if(ahead.length){
    const ps = spots[nPast + own.length + 1];
    peekPlace = `<button class="place peekdoor" data-act="peek"
        style="left:${ps.left.toFixed(1)}%;top:${ps.y}px">
      <span class="thumb peekthumb">${peeking ? "&#128275;" : "&#128064;"}</span>
      <span class="nm">${t("peekTitle")}</span>
      <span class="sub">${peeking ? t("peekOpenSub") : t("peekSub")}</span>
      <span class="foot">${peeking ? t("peekHide") : t("peekShow")}</span>
    </button>`;
    if(peeking){
      peekPlace += ahead.map((tr, i) => placeHTML(tr, spots[nPast + own.length + 2 + i], "peek")).join("");
    }
  }

  return `<div class="scr">
    <div class="topbar">
      <button class="iconbtn" data-act="players" aria-label="${t("changePlayer")}">&#8592;</button>
      <h1>${esc(p.name)}</h1>
      <button class="iconbtn" data-act="worldpick" aria-label="${t("worldTitle")}">&#129517;</button>
      <button class="iconbtn" data-act="sound" aria-label="${t("soundOn")}">${DB.sound ? "&#128266;" : "&#128263;"}</button>
      <button class="iconbtn" data-act="gate" aria-label="${t("parentArea")}">&#9881;</button>
    </div>
    <div class="scr-scroll">
      <div class="hud">
        <span class="chip warm"><span class="em">&#129689;</span> ${p.coins}</span>
        <span class="chip cool"><span class="em">&#9881;</span> ${p.parts}</span>
        <span class="chip fire"><span class="em">&#128293;</span> ${p.streak} ${p.streak === 1 ? t("day") : t("days")}</span>
        <button class="chip" data-act="tokens"><span class="em">&#10024;</span> ${starsAll(p)}</button>
        <button class="chip" data-act="collection" style="margin-left:auto"><span class="em">&#127873;</span> ${t("collection")}</button>
      </div>
      <div class="world" data-cols="${cols}" style="height:${height}px">
        <svg class="worldroad" viewBox="0 0 100 ${height}" preserveAspectRatio="none" aria-hidden="true">
          <path d="${worldRoad(spots, height)}" fill="none" stroke="var(--line)" stroke-width="16"
                stroke-linecap="round" vector-effect="non-scaling-stroke"/>
          <path d="${worldRoad(spots, height)}" fill="none" stroke="var(--shell-2)" stroke-width="10"
                stroke-linecap="round" stroke-dasharray="1 22" vector-effect="non-scaling-stroke"/>
        </svg>
        ${backPlace}${sign}${places}${shopPlace}${peekPlace}
      </div>
    </div>
  </div>`;
}

/* Which years are behind the door, said in words: "1. a 2." and then
   the word for class comes from backSub. The last two are joined by the
   language's own "and", the rest by commas. */
function gradeList(tracks){
  const gs = [];
  for(const tr of tracks) if(tr.grade && gs.indexOf(tr.grade) < 0) gs.push(tr.grade);
  gs.sort((a, b) => a - b);
  const names = gs.map(g => t("grade" + g));
  if(names.length < 2) return names.join("");
  return names.slice(0, -1).join(", ") + " " + t("backAnd") + " " + names[names.length - 1];
}

/* Who is currently looking ahead at next year, and who has the earlier
   years unfolded. Deliberately variables and not fields in the profile:
   closing the game forgets both, and the next start has the road folded
   back to this year. They hold a profile id, so switching player folds
   them away as well. */
let PEEK = null;
let BACK = null;

/* ---------- race screen ---------- */
let RUN = null;
function startRun(p, trackId){
  const tr = trackById(trackId);
  const n = p.qCount || 20;
  RUN = {
    t: tr, items: buildRun(p, tr), n0: n, idx: 0, answered: 0, prog: 0, dist: 0, hist: [],
    typed: "", state: "ask", t0: 0, wrongKeys: [],
    okCount: 0, marks: [], coins: 0, retries: 0, newStars: 0,
    // the score is normalised to a 100 point scale whatever the race length
    mult: 20 / n
  };
  go("game");
}
const TARGET = 100;

/* A question is either a line of arithmetic or a picture to read. The
   equals sign belongs only to the first kind, so the whole question row
   is rebuilt between questions rather than patched. */
/* What stands between the question and the answer box. Almost always an
   equals sign, but a rounded number is only approximately the answer
   and the sign for that differs by country, so a family may name a
   translated one instead. */
function relOf(item){ return item && item.rel ? t(item.rel) : "="; }
/* A chain of three numbers is a longer line than anything the game drew
   before it, and "47 + 5 - 3 = ?" at the full size runs off a 375 px
   phone, so the row says how long it is and the stylesheet steps the
   letters down.
   Measured on the line as it is drawn, spaces included, because a space
   between a number and a sign takes up as much room as a digit does.
   Counting only the digits and signs would let this very example
   through at six characters, which is what it was tried with first.
   The rest of the row, the sign before the box and the box itself, is
   the same width whatever the question, so it does not need counting.
   A picture question carries no such line at all. */
function questionSize(item){
  if(!item || item.svg || !item.text) return "";
  const n = String(item.text).length;
  return n >= 13 ? " q-xlong" : n >= 9 ? " q-long" : "";
}
function questionHTML(item){
  const inner = !item ? `<span id="qtext"></span>`
    : item.svg ? `<span id="qtext" class="qsvg">${item.svg}</span>`
    : `<span id="qtext">${item.text}</span><span>${relOf(item)}</span>`;
  return `<div class="question${questionSize(item)}" id="qbox">${inner}<span class="answerbox" id="abox">?</span></div>`;
}
/* The answering surface belongs to the question, not to the screen, so
   a race may mix families that are answered differently. Only the
   number pad exists so far; a new input element adds a branch here, a
   `.keypad-<name>` rule in the stylesheet and a branch in `tap()`. */
function keypadHTML(item){
  const kind = (item && item.input) || "pad";
  return `<div class="keypad keypad-${kind}" id="keypad" data-input="${kind}">
    ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="key" data-k="${n}">${n}</button>`).join("")}
    <button class="key del" data-k="del" aria-label="${t("clear")}">&#9003;</button>
    <button class="key" data-k="0">0</button>
    <button class="key act" data-k="ok">OK</button>
  </div>`;
}
/* Some questions need a word of framing before the child answers, for
   instance whether the dial means morning or evening. */
function askText(item){ return item && item.ask ? t(item.ask) : ""; }
/* What the child sees in the answer box while typing. A time is keyed as
   plain digits and gets its colon as soon as the reading is unambiguous. */
function typedText(item, typed){
  if(typed === "") return "?";
  if(item && item.kind === "clock" && typed.length >= 3){
    return typed.slice(0, -2) + ":" + typed.slice(-2);
  }
  return typed;
}

function viewGame(p){
  const tr = RUN.t;
  const pips = RUN.items.map((_, i) => {
    const m = RUN.marks[i];
    return `<span class="pip ${m === 1 || m === 2 ? "ok" : m === 0 ? "bad" : i === RUN.idx ? "now" : ""}"></span>`;
  }).join("");
  const hb = p.best[tr.id];
  const hasGhost = !!(hb && hb.hist && hb.hist.length && (hb.n0 || hb.hist.length) === RUN.n0);
  return `<div class="scr game">
    <div class="stage" id="stage">
      ${sceneSVG(p.world, envOf(p, tr), tr.id)}
      <div class="vig"></div>
      <div class="carwrap rivalcar" id="rivalcar" style="${hasGhost ? "" : "display:none"}">
        <span class="spr">${itemSVG(p, p.runner)}</span>
      </div>
      <div class="carwrap" id="mycar">
        <span class="glow"></span><span class="spr">${itemSVG(p, p.runner)}</span>
      </div>
      <div class="finbadge" id="finbadge">${t("finishBadge")}</div>
      <div class="combo" id="combo">TURBO</div>
      <div class="gamebar">
        <button class="quit" data-act="quit" aria-label="${t("quitRace")}">&#10005;</button>
        <div class="pips">${pips}</div>
        <div class="cnt">${Math.min(RUN.idx + 1, RUN.items.length)} / ${RUN.items.length}</div>
      </div>
    </div>
    <div class="rail">
      <span class="num" id="meters">0 ${t("pts")}</span>
      <span class="lap">${t("ptsLabel")}</span>
      <span class="gap" id="gap">${hasGhost ? t("gapEven") : t("gapFirst")}</span>
    </div>
    <div class="qzone">
      ${questionHTML(RUN.items[RUN.idx])}
      <div class="hintline" id="hint">${askText(RUN.items[RUN.idx])}</div>
    </div>
    ${keypadHTML(RUN.items[RUN.idx])}
  </div>`;
}

/* --- movement around the circuit --- */
let anim = {raf: 0, shown: 0, target: 0, ghostShown: 0, ghostTarget: 0, sector: 0};
function stopAnim(){ if(anim.raf) cancelAnimationFrame(anim.raf); anim.raf = 0; }

function fitBox(){
  const st = document.getElementById("stage");
  if(!st) return null;
  const w = st.clientWidth || 360, h = st.clientHeight || (w * VH / VW);
  const s = Math.min(w / VW, h / VH);
  return {s, ox: (w - VW * s) / 2, oy: (h - VH * s) / 2};
}
function placeCar(el, u, lane){
  const box = fitBox();
  if(!box || !el) return;
  const c = routeOf(P(), RUN.t);
  const pt = atU(c, u);
  // the rival runs in the neighbouring lane: offset perpendicular to the heading
  let x = pt.x, y = pt.y;
  if(lane){
    const r = pt.ang * Math.PI / 180;
    x += Math.sin(r) * lane; y -= Math.cos(r) * lane;
  }
  el.style.left = (box.ox + x * box.s) + "px";
  el.style.top  = (box.oy + y * box.s) + "px";
  const spr = el.querySelector(".spr");
  if(spr){
    let a = pt.ang, dir = 1;
    if(a > 90){ a -= 180; dir = -1; } else if(a < -90){ a += 180; dir = -1; }
    spr.style.transform = "rotate(" + (a * 0.55).toFixed(1) + "deg) scaleX(" + dir + ")";
  }
}
function paintTrail(u){
  const c = routeOf(P(), RUN.t), tr = document.getElementById("trail");
  if(!tr) return;
  tr.style.strokeDashoffset = (c.total * (1 - Math.max(0, Math.min(1, u)))).toFixed(1);
}
/* The car only moves on a correct answer, a mistake leaves it standing.
   The missed question returns as an extra question, so the race gets a
   little longer while the track stays the same length. Correct every
   retry and you cross the finish line exactly. */
function myU(){
  return Math.max(0, Math.min(1, RUN.prog / (RUN.n0 || RUN.items.length || 1)));
}
/* A record is only comparable when it was set over the same number of
   questions, otherwise two differently sized races would be compared. */
function ghostRec(){
  const best = (P().best || {})[RUN.t.id];
  if(!best || !best.hist || !best.hist.length) return null;
  if((best.n0 || best.hist.length) !== RUN.n0) return null;   // jinak dlouhy zavod se neporovnava
  return best;
}
function ghostPts(){
  const best = ghostRec();
  if(!best) return null;
  if(RUN.answered === 0) return 0;
  return best.hist[Math.min(RUN.answered - 1, best.hist.length - 1)] || 0;
}
function ghostU(){
  const g = ghostPts();
  if(g === null) return null;
  return Math.max(0, Math.min(1, myU() - (RUN.dist - g) / TARGET));
}
function updateHud(){
  const score = document.getElementById("meters"), gap = document.getElementById("gap");
  if(score) score.textContent = Math.round(RUN.dist) + " " + t("pts");
  const g = ghostPts();
  if(gap && g !== null){
    const diff = Math.round(RUN.dist - g);
    gap.className = "gap " + (diff > 0 ? "ahead" : diff < 0 ? "behind" : "");
    gap.textContent = diff === 0 ? t("gapEven")
      : diff > 0 ? t("gapAhead", diff) : t("gapBehind", diff);
  }
  const fb = document.getElementById("finbadge");
  if(fb) fb.classList.toggle("on", myU() >= 1);
}
/* smooth drive from the current position to the new one */
function driveTo(u, ghostU){
  anim.target = Math.max(0, Math.min(1, u));
  if(ghostU !== null && ghostU !== undefined) anim.ghostTarget = Math.max(0, Math.min(1, ghostU));
  if(anim.raf) return;
  let last = performance.now();
  const frame = now => {
    const dt = Math.min(50, now - last) / 16.67; last = now;
    const ease = k => 1 - Math.pow(1 - k, 3);
    const step = (cur, tgt) => {
      const diff = tgt - cur;
      if(Math.abs(diff) < 0.0005) return tgt;
      return cur + diff * Math.min(1, 0.12 * dt);
    };
    anim.shown = step(anim.shown, anim.target);
    anim.ghostShown = step(anim.ghostShown, anim.ghostTarget);
    placeCar(document.getElementById("mycar"), anim.shown, 0);
    placeCar(document.getElementById("rivalcar"), anim.ghostShown, -13);
    paintTrail(anim.shown);
    updateHud();
    // light up the quarter markers as they are passed
    const sec = Math.floor(anim.shown * 4);
    if(sec > anim.sector && sec < 4){
      anim.sector = sec;
      document.querySelectorAll("#circuit .ck rect").forEach((r, i) => {
        if(Math.floor(i / 2) < sec) r.setAttribute("fill", "#ffd166"), r.setAttribute("opacity", "1");
      });
      if(sec >= 1) floaty(t(["", "quarterLap", "halfLap", "threeQuarterLap"][sec]));
    }
    if(anim.shown === anim.target && anim.ghostShown === anim.ghostTarget){ anim.raf = 0; return; }
    anim.raf = requestAnimationFrame(frame);
  };
  anim.raf = requestAnimationFrame(frame);
}
function mountGame(){
  RUN.combo = 0;
  anim = {raf: 0, shown: 0, target: 0, ghostShown: 0, ghostTarget: 0, sector: 0};
  placeCar(document.getElementById("mycar"), 0, 0);
  placeCar(document.getElementById("rivalcar"), 0, -13);
  paintTrail(0);
  updateHud();
  document.onkeydown = e => {
    if(view.name !== "game") return;
    if(e.key >= "0" && e.key <= "9") tap(e.key);
    else if(e.key === "Backspace") tap("del");
    else if(e.key === "Enter") tap("ok");
  };
}
function drawRail(){ driveTo(myU(), ghostU()); }

function tap(k){
  if(!RUN || RUN.state !== "ask") return;
  const item = RUN.items[RUN.idx], box = document.getElementById("abox");
  if(k === "del"){ RUN.typed = RUN.typed.slice(0, -1); }
  else if(k === "ok"){ if(RUN.typed !== "") submit(); return; }
  else if(RUN.typed.length < ((item && item.maxLen) || 3)){ RUN.typed += k; }
  box.textContent = typedText(item, RUN.typed);
  box.className = "answerbox" + (RUN.typed ? " filled" : "");
}

function floaty(text, bad){
  const stage = document.getElementById("stage"), car = document.getElementById("mycar");
  if(!stage) return;
  const el = document.createElement("div");
  el.className = "floaty" + (bad ? " bad" : "");
  el.textContent = text;
  const x = car ? parseFloat(car.style.left || "0") : stage.clientWidth / 2;
  const y = car ? parseFloat(car.style.top || "0") : 60;
  el.style.left = Math.max(30, Math.min(stage.clientWidth - 30, x)) + "px";
  el.style.top = Math.max(24, y - 34) + "px";
  el.style.transform = "translateX(-50%)";
  stage.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}
function showCombo(n){
  const c = document.getElementById("combo");
  if(!c) return;
  if(n >= 3){ c.textContent = t("turbo", n); c.classList.add("on"); }
  else c.classList.remove("on");
}

/* Showing the right answer. A time is shown as a time, not as the whole
   number the keypad turned it into. */
function rightAnswerText(item){
  if(item.kind === "clock") return t("clockIs", item.disp);
  return item.text + " " + relOf(item) + " " + item.answer;
}
/* The two mistakes a child actually makes on a dial are reading the hour
   hand one hour ahead once it has passed the half, and reading the hands
   the wrong way round. Naming the mistake beats repeating the answer. */
function missHint(item, typed){
  if(item.kind === "clock"){
    const val = clockTyped(typed);
    if(isNaN(val)) return t("wrongHint");
    const gh = Math.floor(val / 100), gm = val % 100, h = Math.floor(item.answer / 100), m = item.answer % 100;
    if(gm === m && (gh - h === 1 || h - gh === 1)) return t("clockMissHour");
    if(gh === m && gm === h) return t("clockMissSwap");
  }
  return t("wrongHint");
}

function submit(){
  const p = P(), item = RUN.items[RUN.idx];
  const ms = Date.now() - RUN.t0;
  const correct = item.check(RUN.typed);
  const box = document.getElementById("abox"), hint = document.getElementById("hint");
  const car = document.getElementById("mycar");
  const flash = cls => {
    if(!car) return;
    car.classList.remove("boost", "brake");
    void car.offsetWidth;
    car.classList.add(cls);
    setTimeout(() => car && car.classList.remove(cls), 900);
  };
  RUN.state = "feedback";

  const isRetry = !!item.retry;
  // whether this answer filled a place in the collection is asked here
  // rather than inside record(), which must stay the one place that
  // writes the box and nothing else
  const hadStar = starred(p, item.key);
  if(!isRetry) record(p, item, correct, ms);
  if(!hadStar && starred(p, item.key)) RUN.newStars++;

  let gain;
  if(correct){
    const th = thresholds(p, item);
    if(isRetry) gain = 4.6;
    else if(ms <= th.super) gain = 6.5;
    else if(ms <= th.fast)  gain = 5.9;
    else if(ms <= th.fast * 2.4) gain = 5.3;
    else gain = 4.7;
    RUN.okCount++;
    RUN.prog++;
    RUN.combo = (RUN.combo || 0) + 1;
    if(RUN.combo >= 3) gain += Math.min(0.6, (RUN.combo - 2) * 0.2);
    RUN.marks[RUN.idx] = isRetry ? 2 : 1;
    box.className = "answerbox ok";
    flash("boost");
    showCombo(RUN.combo);
    if(gain >= 6.5){ sfx.great(); hint.innerHTML = RUN.combo >= 3 ? t("lightningTurbo") : t("lightning"); }
    else { sfx.ok(); hint.innerHTML = isRetry ? t("retryOk") : t("correct"); }
    buzz(18);
  } else {
    gain = 0.6;
    RUN.combo = 0;
    showCombo(0);
    RUN.marks[RUN.idx] = 0;
    box.className = "answerbox bad";
    flash("brake");
    sfx.bad(); buzz([18, 60, 18]);
    hint.innerHTML = `<b>${rightAnswerText(item)}</b><br>${missHint(item, RUN.typed)}`;
    RUN.wrongKeys.push(item);
    // the question returns as an extra one, nothing is dropped from the queue
    const tries = (item.tries || 0) + 1;
    if(tries <= 2 && RUN.items.length < RUN.n0 + 6){
      const at = Math.min(RUN.items.length, RUN.idx + 3);
      RUN.items.splice(at, 0, Object.assign({}, item, {retry: true, tries}));
      RUN.retries++;
    }
  }

  const step = gain * RUN.mult;
  RUN.dist += step;
  RUN.answered = RUN.idx + 1;
  RUN.hist[RUN.idx] = RUN.dist;
  floaty(correct ? "+" + num(step, 1) : t("brake"), !correct);
  drawRail();

  setTimeout(() => {
    if(!RUN || view.name !== "game") return;
    RUN.idx++;
    // end of race: a short pause so the finishing position is visible
    if(RUN.idx >= RUN.items.length){
      sfx.win();
      const q2 = document.getElementById("qtext");
      if(q2) q2.textContent = t("finishWord");
      if(hint) hint.innerHTML = myU() >= 1 ? t("crossedLine") : t("raceOver");
      setTimeout(() => { if(RUN && view.name === "game") finishRun(); }, 1300);
      return;
    }
    RUN.typed = ""; RUN.state = "ask"; RUN.t0 = Date.now();
    const next = RUN.items[RUN.idx];
    const qb = document.getElementById("qbox");
    if(!qb) return;
    // the whole row is rebuilt because the next question may be a
    // different shape and a different length, so the answer box has to
    // be looked up again afterwards
    qb.outerHTML = questionHTML(next);
    hint.innerHTML = askText(next);
    // a race may mix families answered on different things; swap the
    // answering surface only when it actually changes, so the keys do
    // not flicker on every question
    const kp = document.getElementById("keypad");
    if(kp && kp.dataset.input !== (next.input || "pad")) kp.outerHTML = keypadHTML(next);
    const pipbox = document.querySelector(".pips");
    if(pipbox && pipbox.children.length !== RUN.items.length){
      pipbox.innerHTML = RUN.items.map(() => `<span class="pip"></span>`).join("");
    }
    document.querySelectorAll(".pip").forEach((el, i) => {
      const m = RUN.marks[i];
      el.className = "pip " + (m === 1 || m === 2 ? "ok" : m === 0 ? "bad" : i === RUN.idx ? "now" : "");
    });
    const cnt = document.querySelector(".cnt");
    if(cnt) cnt.textContent = (RUN.idx + 1) + " / " + RUN.items.length;
    drawRail();
  }, correct ? 620 : 1900);
}

function medalFor(dist){
  if(dist >= 115) return 3;
  if(dist >= 100) return 2;
  if(dist >= 85)  return 1;
  return 0;
}
function finishRun(){
  const p = P();
  const med = medalFor(RUN.dist);
  const best = p.best[RUN.t.id];
  RUN.beatGhost = best ? RUN.dist > best.dist : false;
  RUN.prevBest = best ? best.dist : null;
  if(!best || RUN.dist > best.dist) p.best[RUN.t.id] = {dist: RUN.dist, hist: RUN.hist.slice(), n0: RUN.n0};
  if(med > (p.done[RUN.t.id] || 0)) p.done[RUN.t.id] = med;

  RUN.coins = Math.round(RUN.dist / 5 * ((p.qCount || 20) / 20)) + med * 4 + (RUN.beatGhost ? 6 : 0);
  RUN.newDay = touchStreak(p);
  if(RUN.newDay && p.streak > 1) RUN.coins += 5;
  p.coins += RUN.coins;
  p.runs++;
  p.trackRuns = p.trackRuns || {};
  p.trackRuns[RUN.t.id] = (p.trackRuns[RUN.t.id] || 0) + 1;
  p.xp[p.runner] = (p.xp[p.runner] || 0) + RUN.okCount;
  const before = RUN.stageBefore;
  RUN.evolved = !itemById(p.runner).kind && before && stageOf(p, p.runner) > before;
  save();
  sfx.win();
  go("result");
}

/* ---------- result screen ---------- */
function viewResult(p){
  const med = medalFor(RUN.dist);
  const titles = [t("res0"), t("res1"), t("res2"), t("res3")];
  const subs = [t("res0s"), t("res1s"), t("res2s"), t("res3s")];
  const emojis = ["&#127937;", "&#129353;", "&#129352;", "&#129351;"];
  const acc = RUN.items.length ? Math.round(RUN.okCount / RUN.items.length * 100) : 0;

  // deduplicate on what the child actually saw, not on the printed sum:
  // a question that is a picture has no text at all, and keying on that
  // would collapse every missed clock into one chip
  const weak = [...new Map(RUN.wrongKeys.map(i => [i.key + "|" + (i.disp || i.text), i])).values()].slice(0, 6);
  const weakHtml = weak.length ? `
    <div class="h2" style="margin-bottom:6px">${t("reviewNext")}</div>
    <div class="factchips">${weak.map(i => `<span class="factchip">${rightAnswerText(i)}</span>`).join("")}</div>` : "";

  const ghostHtml = RUN.prevBest !== null
    ? (RUN.beatGhost
        ? `<div class="card" style="background:#e7fbf0;border-color:#9ee7c0;margin-top:14px">
             <div style="font-family:var(--font-display);font-size:16px">&#127942; ${t("recordBeat")}</div>
             <div class="muted">${t("recordBeatSub", Math.round(RUN.prevBest), Math.round(RUN.dist))}</div></div>`
        : `<div class="muted" style="margin-top:12px">${t("recordStands", Math.round(RUN.prevBest))}</div>`)
    : "";

  // the championship and the trouble spots have no collection of their
  // own and the school track borrows one, so those races say only how
  // many places lit up; the facts themselves sit in the collections they
  // belong to and are counted there
  const spec = trackSpec(p, RUN.t);
  const tokHtml = spec
    ? tokenCardHTML(p, spec, RUN.newStars)
    : (RUN.newStars ? `<div class="muted" style="margin-top:12px">${t("tokNewPlain", RUN.newStars)}</div>` : "");

  const evoHtml = RUN.evolved ? `
    <div class="newthing">
      <span class="pic">${itemSVG(p, p.runner)}</span>
      <span><b style="font-family:var(--font-display);font-size:17px">${t("grewTitle", nameOf(p.runner))}</b>
      <div class="muted">${t("grewSub")}</div></span>
    </div>` : "";

  return `<div class="scr narrow">
    <div class="scr-scroll">
      <div class="result">
        <div class="medal">${emojis[med]}</div>
        <h2>${titles[med]}</h2>
        <div class="muted">${subs[med]}</div>
        <div class="statrow">
          <div class="stat"><div class="v">${Math.round(RUN.dist)}</div><div class="l">${t("statPoints")}</div></div>
          <div class="stat"><div class="v">${acc}&#8202;%</div><div class="l">${t("statCorrect")}</div></div>
          <div class="stat"><div class="v">+${RUN.coins}</div><div class="l">${t("statCoins")}</div></div>
        </div>
        ${RUN.newDay && p.streak > 1 ? `<div class="chip fire" style="display:inline-flex">&#128293; ${t("streakBonus", p.streak)}</div>` : ""}
        ${ghostHtml}
        ${evoHtml}
        ${tokHtml}
        ${weakHtml}
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:22px">
          <button class="btn mint wide" data-act="again">${t("again")}</button>
          <button class="btn ghost wide" data-act="map">${t("backToMap")}</button>
        </div>
      </div>
    </div>
  </div>`;
}
function mountResult(){ document.onkeydown = null; stopAnim(); }

/* ---------- workshop ----------
   Deliberately quiet next to the race screen: no stage, no car, no
   counter running. What moves is only what the child puts on the
   counter. */
let JOB = null;
function startJob(p, jobId){
  const job = jobById(jobId);
  JOB = {job, items: buildJob(p, job), idx:0, picked:[], state:"ask", ok:0, parts:0,
         retries:0, missed:[], newStars:0};
  go("job");
}
function jobAskText(item){ return t.apply(null, [item.ask].concat(item.askArgs || [])); }
function moneyStr(v){ return v + " " + t("moneyUnit"); }

const JOB_PIC = {count:"&#128295;", money:"&#128176;"};
function viewShop(p){
  const atSchool = chapterJobIds(p);
  // a job belongs to a year like a track does, and the same door at the
  // end of the map opens next year's here as well
  const peeking = PEEK === p.id;
  const shown = jobsInGrade(p).concat(peeking ? jobsAhead(p) : []);
  const cards = shown.map(job => {
    const si = jobStage(p, job);
    const done = (p.jobRuns || {})[job.id] || 0;
    const now = atSchool.includes(job.id);
    const peek = (job.grade || 0) > gradeOf(p);
    return `<button class="job${now ? " now" : ""}${peek ? " peek" : ""}" data-act="jobstart" data-id="${job.id}">
      <span class="jobpic">${JOB_PIC[job.id] || "&#128736;"}</span>
      <span class="body">
        <span class="nm">${t("job_" + job.id)}</span>
        <span class="sub">${t("job_" + job.id + "s")}</span>
        <span class="sub">${t("jobStep", si + 1, job.keys.length)}${done ? t("jobDoneCount", done) : ""}</span>
        ${now ? `<span class="atschool">${t("jobAtSchool")}</span>` : ""}
        ${peek ? `<span class="atschool peek">${t("peekTitle")}</span>` : ""}
      </span>
    </button>`;
  }).join("");
  return `<div class="scr">
    <div class="topbar">
      <button class="iconbtn" data-act="map" aria-label="${t("back")}">&#8592;</button>
      <h1>${t("shopTitle")}</h1>
      <span class="chip cool"><span class="em">&#9881;</span> ${p.parts}</span>
    </div>
    <div class="scr-scroll">
      <div class="pad muted" style="margin:12px 0 2px">${t("shopIntro")}</div>
      <div class="jobs">${cards}</div>
      <div class="pad muted" style="margin-top:14px">${t("shopPartsNote")}</div>
    </div>
  </div>`;
}

function viewJob(p){
  const item = JOB.items[JOB.idx];
  const pips = JOB.items.map((_, i) => {
    const m = JOB.marks && JOB.marks[i];
    return `<span class="pip ${m === 1 || m === 2 ? "ok" : m === 0 ? "bad" : i === JOB.idx ? "now" : ""}"></span>`;
  }).join("");
  return `<div class="scr shop">
    <div class="topbar">
      <button class="iconbtn" data-act="jobquit" aria-label="${t("back")}">&#10005;</button>
      <h1>${t("job_" + JOB.job.id)}</h1>
      <span class="chip cool"><span class="em">&#9881;</span> ${p.parts + JOB.parts}</span>
    </div>
    <div class="pips dark" style="padding:0 18px 6px">${pips}</div>
    <div class="scr-scroll">
      <div class="jobask" id="jobask">${jobAskText(item)}</div>
      ${item.pic ? `<div class="jobpicbox">${item.pic}</div>` : ""}
      <div class="revealbox" id="reveal">${revealHTML(p)}</div>
      <div class="counter" id="counter">${counterHTML()}</div>
      <div class="jobhint" id="jobhint">${t(item.input === "pieces" ? "jobTapPieces" : "jobTapCoins")}</div>
      ${trayHTML(item)}
      <div class="pad jobgo" style="padding-bottom:calc(18px + var(--safe-b))">
        <button class="btn mint wide" data-act="jobcheck" id="jobok">${t("jobReady")}</button>
      </div>
    </div>
  </div>`;
}
/* The window is divided by how long the piece of work is, not by how
   many tasks are currently in the queue: a mistake adds a task, and a
   window that re-divided itself would shrink a wedge that is already
   off. Nothing here can ever take a wedge back. */
function revealHTML(p){
  const total = JOB.job.n;
  return revealSVG(itemSVG(p, p.runner), Math.min(JOB.ok, total), total);
}
function paintReveal(){
  const el = document.getElementById("reveal");
  if(el) el.innerHTML = revealHTML(P());
}
/* What the child answers with. Coins have six values to choose between;
   parts have only one, so the tray is a single big button and the whole
   answer is how many times it is tapped. */
function trayHTML(item){
  if(item.input === "pieces"){
    return `<div class="tray one"><button class="traycoin" data-coin="1" aria-label="${t("jobPiece")}">
      <svg class="coin" viewBox="0 0 64 64" aria-hidden="true">${partSVG("bolt", 32, 30, 1.9, "#f0c063")}</svg>
      </button></div>`;
  }
  return `<div class="tray">${MONEY.map(v =>
    `<button class="traycoin" data-coin="${v}" aria-label="${moneyStr(v)}">${coinSVG(v)}</button>`).join("")}</div>`;
}
const pieceSVG = () => `<svg class="coin" viewBox="0 0 64 64" aria-hidden="true">${partSVG("bolt", 32, 30, 1.9, "#f0c063")}</svg>`;
/* What lies on the counter. Tapping a coin there takes it back, so the
   child can undo without starting over. Parts are counted rather than
   added up, so the chip on the end says how many, not how much. */
function counterHTML(){
  const pieces = (JOB.items[JOB.idx] || {}).input === "pieces";
  if(!JOB.picked.length) return `<span class="counter-empty">${t("jobEmpty")}</span>`;
  return JOB.picked.map((v, i) => `<button class="putcoin" data-drop="${i}">${pieces ? pieceSVG() : coinSVG(v)}</button>`).join("")
    + `<span class="counter-sum">${pieces ? JOB.picked.length : moneyStr(sum(JOB.picked))}</span>`;
}
function paintCounter(){
  const c = document.getElementById("counter");
  if(c) c.innerHTML = counterHTML();
}
function jobTap(v){
  if(!JOB || JOB.state !== "ask" || JOB.picked.length >= 12) return;
  JOB.picked.push(v); sfx.coin(); paintCounter();
}
function jobDrop(i){
  if(!JOB || JOB.state !== "ask") return;
  JOB.picked.splice(i, 1); paintCounter();
}
/* Coins laid out the way the game would do it, shown after a miss so
   the child sees one right answer rather than being told to try again. */
function solutionHTML(item){
  return item.solution.map(v =>
    `<span class="putcoin small">${item.input === "pieces" ? pieceSVG() : coinSVG(v)}</span>`).join("");
}
function jobCheck(){
  if(!JOB || JOB.state !== "ask") return;
  const p = P(), item = JOB.items[JOB.idx];
  if(!JOB.picked.length) return;
  const correct = item.check(JOB.picked);
  const near = !correct && item.near && item.near(JOB.picked);
  const isRetry = !!item.retry;
  JOB.state = "done-step";
  JOB.marks = JOB.marks || [];
  const hadStar = starred(p, item.key);
  if(!isRetry) record(p, item, correct, null);
  if(!hadStar && starred(p, item.key)) JOB.newStars++;

  const hint = document.getElementById("jobhint");
  if(correct){
    JOB.ok++;
    JOB.marks[JOB.idx] = isRetry ? 2 : 1;
    JOB.parts += isRetry ? 1 : 2;
    // the wedge comes off straight away, not on the next task: the child
    // solved it now and should see it now
    paintReveal();
    sfx.great(); buzz(18);
    hint.innerHTML = `<b>${t(isRetry ? "jobRetryOk" : "jobOk")}</b>`;
  } else {
    JOB.marks[JOB.idx] = 0;
    JOB.missed.push(item);
    sfx.bad(); buzz([18, 60, 18]);
    if(near){ JOB.parts += 1; }
    hint.innerHTML = `<b>${t(near ? "jobTooMany" : (item.missMsg || "jobMiss"), item.solution.length)}</b>`
      + `<div class="solrow">${solutionHTML(item)}</div>`;
    const tries = (item.tries || 0) + 1;
    if(tries <= 1 && JOB.items.length < JOB.job.n + 3){
      JOB.items.push(Object.assign({}, item, {retry:true, tries}));
      JOB.retries++;
    }
  }
  const ok = document.getElementById("jobok");
  if(ok) ok.textContent = t("jobNext");
  // the dot for this task turns over straight away, so the answer is
  // marked before the next one is even shown
  const dots = document.querySelectorAll(".pips .pip");
  if(dots[JOB.idx]) dots[JOB.idx].className = "pip " + (JOB.marks[JOB.idx] ? "ok" : "bad");
}
function jobNext(){
  JOB.idx++;
  JOB.picked = [];
  if(JOB.idx >= JOB.items.length){ finishJob(); return; }
  JOB.state = "ask";
  go("job");
}
function finishJob(){
  const p = P();
  // finishing the piece of work is worth something on its own, so a
  // child who found it hard still leaves with more than nothing
  JOB.parts += 3;
  p.parts += JOB.parts;
  p.jobRuns[JOB.job.id] = (p.jobRuns[JOB.job.id] || 0) + 1;
  touchStreak(p);
  save();
  sfx.win();
  go("jobdone");
}
function viewJobDone(p){
  // Two tasks of the same kind are the same chip only when they really ask
  // the same thing. Counting pieces has no amount, so the amount alone
  // glued every counting task into one chip.
  const miss = [...new Map(JOB.missed.map(i =>
    [i.key + "|" + (i.answer !== undefined ? i.answer : i.amount), i])).values()].slice(0, 3);
  return `<div class="scr narrow">
    <div class="scr-scroll">
      <div class="result">
        <div class="medal">&#9881;</div>
        <h2>${t("jobFinished")}</h2>
        <div class="muted">${t("jobFinishedSub")}</div>
        <div class="statrow">
          <div class="stat"><div class="v">+${JOB.parts}</div><div class="l">${t("statParts")}</div></div>
          <div class="stat"><div class="v">${JOB.ok}/${JOB.items.length}</div><div class="l">${t("statSolved")}</div></div>
          <div class="stat"><div class="v">${p.parts}</div><div class="l">${t("statPartsAll")}</div></div>
        </div>
        ${tokenCardHTML(p, shopSpec(p), JOB.newStars)}
        ${miss.length ? `<div class="h2" style="margin-bottom:6px">${t("jobReviewNext")}</div>
          <div class="factchips">${miss.map(i =>
            `<span class="factchip">${jobAskText(i)}</span>`).join("")}</div>` : ""}
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:22px">
          <button class="btn mint wide" data-act="jobagain">${t("jobAgain")}</button>
          <button class="btn ghost wide" data-act="shop">${t("jobBackToShop")}</button>
          <button class="btn ghost wide" data-act="paintshop">${t("jobSpendParts")}</button>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------- the collection of found things ----------
   Deliberately a screen of its own rather than a number somewhere: the
   point of it is to be looked at. It says what fills a place, because a
   collection nobody understands is just decoration, and it never shows
   a place that cannot be filled. */
function viewTokens(p){
  const blocks = collectionSpecs(p).map(spec => `
    <div class="h3">${esc(spec.title)} <span class="tokn">${t("tokHave", starCount(p, spec.keys), spec.keys.length)}</span></div>
    <div class="tokwrap">${tokenGridSVG(p, spec)}</div>`).join("");
  return `<div class="scr narrow">
    <div class="topbar">
      <button class="iconbtn" data-act="map" aria-label="${t("back")}">&#8592;</button>
      <h1>${t("tokens")}</h1>
      <span class="chip"><span class="em">&#10024;</span> ${starsAll(p)}</span>
    </div>
    <div class="scr-scroll pad">
      <div class="muted" style="margin:10px 0 12px">${t("tokensNote")}</div>
      ${blocks}
      <div style="height:20px"></div>
    </div>
  </div>`;
}
/* One collection on the result screen, so the child sees what the race
   just did to it without going looking for it. */
function tokenCardHTML(p, spec, gained){
  if(!spec) return "";
  const have = starCount(p, spec.keys);
  return `<div class="tokcard">
    <div class="h3">${esc(spec.title)} <span class="tokn">${t("tokHave", have, spec.keys.length)}</span>${
      gained ? `<span class="toknew">${t("tokNew", gained)}</span>` : ""}</div>
    <div class="tokwrap">${tokenGridSVG(p, spec)}</div>
    ${have ? "" : `<div class="muted" style="margin-top:6px">${t("tokFirst")}</div>`}
  </div>`;
}

/* ---------- garage / collection ---------- */
function viewCollection(p){
  const cell = it => {
    const owned = p.owned.includes(it.id);
    const st = it.kind ? 0 : stageOf(p, it.id);
    const xp = p.xp[it.id] || 0;
    const nextAt = st === 1 ? EVO[1] : st === 2 ? EVO[2] : null;
    const prevAt = st === 1 ? 0 : EVO[1];
    const pct = nextAt ? Math.min(100, Math.round((xp - prevAt) / (nextAt - prevAt) * 100)) : 100;
    if(!owned){
      return `<button class="item locked" data-act="buy" data-id="${it.id}">
        <span class="pic">${it.kind ? rideSVG(it) : petSVG(it, 1)}</span>
        <span class="nm">&#129689; ${it.cost}</span></button>`;
    }
    return `<button class="item ${p.runner === it.id ? "sel" : ""}" data-act="use" data-id="${it.id}">
      ${st ? `<span class="lvl">${st}</span>` : ""}
      <span class="pic">${itemSVG(p, it.id)}</span>
      <span class="nm">${nameOf(it)}</span>
      ${st && st < 3 ? `<span class="xpbar"><i style="width:${pct}%"></i></span>` : ""}
    </button>`;
  };
  return `<div class="scr">
    <div class="topbar">
      <button class="iconbtn" data-act="map" aria-label="${t("back")}">&#8592;</button>
      <h1>${t("collection")}</h1>
      <span class="chip warm"><span class="em">&#129689;</span> ${p.coins}</span>
    </div>
    <div class="scr-scroll">
      <div class="pad muted" style="margin:10px 0 2px">
        ${t("collectionNote")}
      </div>
      <div class="h2 pad" style="margin-bottom:8px">${t("machines")}</div>
      <div class="grid">${RIDES.map(cell).join("")}</div>
      <div class="h2 pad" style="margin-bottom:8px">${t("animals")}</div>
      <div class="grid">${PETS.map(cell).join("")}</div>
      <div class="h2 pad" id="paintsec" style="margin-bottom:8px">${t("paints")}</div>
      <div class="pad muted" style="margin-bottom:10px">${t("paintsNote")}</div>
      <div class="grid">${paintCells(p)}</div>
      <div style="height:20px"></div>
    </div>
  </div>`;
}
/* Paint is shown on a machine rather than as a swatch, because a colour
   chip tells a child nothing about what the car will look like. The
   machine shown is the one currently chosen, so the preview is of their
   own racer; an animal has nothing to paint, so the plain car stands in. */
function paintCells(p){
  const base = itemById(p.runner).kind ? itemById(p.runner) : RIDES.find(r => r.id === "ri_auto");
  const worn = (p.paint || {})[base.id] || "";
  const cell = (id, svg, label, cost, on) => `
    <button class="item ${on ? "sel" : ""}" data-act="${cost === null ? "usepaint" : "buypaint"}" data-id="${id}">
      <span class="pic">${svg}</span>
      <span class="nm">${label}</span>
    </button>`;
  const none = cell("", rideSVG(base), t("paintNone"), null, !worn);
  const rest = PAINTS.map(pa => {
    const svg = rideSVG(Object.assign({}, base, {c1: pa.c1, c2: pa.c2}));
    const owned = (p.paints || []).includes(pa.id);
    return owned
      ? cell(pa.id, svg, t(pa.id), null, worn === pa.id)
      : cell(pa.id, svg, "&#9881; " + pa.cost, pa.cost, false);
  }).join("");
  return none + rest;
}

/* ---------- parent code ---------- */
function hashPin(s){
  let h = 5381;
  for(let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return "h" + h.toString(36);
}
function viewSetPin(){
  const change = !!DB.pin;
  return `<div class="scr narrow">
    <div class="hero">
      <h1>${change ? t("pinTitleChange") : t("pinTitle")}</h1>
      <p>${change ? t("pinSubChange") : t("pinSub")}</p>
    </div>
    <div class="scr-scroll">
      <div class="gate">
        <div style="font-size:40px;margin-bottom:6px">&#128273;</div>
        <div class="muted" style="margin-bottom:18px;max-width:320px;margin-inline:auto">
          ${t("pinInfo")}
        </div>
        ${change ? "" : `<div class="tiny" style="margin-bottom:8px">${t("langParent")}</div>${langSeg("parentlang", DB.lang)}`}
        <input class="field pinin" id="pin1" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="${t("pinPlaceholder")}" autocomplete="off" style="margin-top:18px">
        <button class="btn wide" data-act="savepin" style="margin-top:6px">${t("pinSave")}</button>
        ${change ? `<button class="btn ghost wide" data-act="parent" style="margin-top:10px">${t("pinBack")}</button>` : ""}
        <div class="muted" id="pinerr" style="margin-top:10px;color:var(--berry)"></div>
      </div>
    </div>
  </div>`;
}
function viewGate(){
  return `<div class="scr narrow">
    <div class="topbar">
      <button class="iconbtn" data-act="map" aria-label="${t("back")}">&#8592;</button>
      <h1>${t("gateTitle")}</h1>
    </div>
    <div class="scr-scroll">
      <div class="gate">
        <div style="font-size:44px">&#128274;</div>
        <div class="h2">${t("gateHeading")}</div>
        <div class="muted" style="margin-bottom:18px">${t("gateSub")}</div>
        <input class="field pinin" id="gatein" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="${t("pinPlaceholder")}" autocomplete="off">
        <button class="btn wide" data-act="gatego">${t("gateGo")}</button>
        <div class="muted" id="gateerr" style="margin-top:10px;color:var(--berry)"></div>
      </div>
    </div>
  </div>`;
}

/* ---------- parent section ---------- */
function heatColor(lv, has){
  if(!has) return "#dfe6f7";
  return ["#f2557f", "#ff8a5c", "#ffb020", "#ffd93d", "#8bd94f", "#12b36a"][lv] || "#dfe6f7";
}

/* The heat map used to be one hard wired eleven by eleven table, so a
   child two months into adding within a hundred looked at an empty
   times table and at a summary reading zero. Every family now says what
   it wants drawn and this screen knows nothing about families.
   Two shapes, because the families do not share one shape: a grid for
   what is a product of two axes, and a strip of tiles for everything
   else. A tile may stand for a single fact or for a whole step of a
   staged track; either way it shows the average Leitner level of the
   keys it covers, so one colour scale reads the same in both shapes. */
function heatCell(p, keys){
  let tot = 0, seen = 0;
  for(const k of keys){ const f = p.facts[k]; if(f && f.reps){ seen++; tot += f.lv; } }
  return {has: seen > 0, lv: seen ? Math.round(tot / keys.length) : 0, seen, n: keys.length};
}
function heatTile(p, tile){
  const c = heatCell(p, tile.keys);
  let detail;
  if(tile.keys.length === 1){
    const f = p.facts[tile.keys[0]];
    detail = c.has ? " · " + f.lv + "/5 · " + f.ok + "/" + f.reps : " · " + t("legendNew");
  } else {
    detail = " · " + t("heatSeen", c.seen, c.n) + (c.has ? " · " + c.lv + "/5" : "");
  }
  return `<span style="background:${heatColor(c.lv, c.has)}" title="${esc(tile.tip + detail)}">`
       + (tile.label ? `<b>${esc(tile.label)}</b>` : "") + (c.has ? c.lv : "") + `</span>`;
}
function heatBlock(p, spec){
  const cells = spec.tiles.map(x => x.hdr !== undefined
    ? `<span class="hdr">${x.hdr}</span>` : heatTile(p, x)).join("");
  return `<div class="h3">${spec.title}</div>
    <div class="heatwrap"><div class="heat ${spec.kind}" style="--hc:${spec.cols}">${cells}</div></div>`;
}
function heatGrid(title, axis, keyAt, tipAt){
  const tiles = [{hdr:""}].concat(axis.map(b => ({hdr:b})));
  for(const a of axis){
    tiles.push({hdr:a});
    for(const b of axis) tiles.push({keys:[keyAt(a,b)], tip: tipAt(a,b)});
  }
  return {title, kind:"grid", cols: axis.length + 1, tiles};
}
function heatStrip(title, cols, tiles){ return {title, kind:"strip", cols, tiles}; }

/* A bucket is named by an example rather than by a label: "342 + 25"
   tells a parent more than any wording could and needs no translating.
   The subtraction half of a bucket is the same pair read backwards, so
   its example is derived rather than written down twice. */
const HEAT_10 = [1,2,3,4,5,6,7,8,9,10];
const HEAT_9  = [2,3,4,5,6,7,8,9,10];
const E_EX = ["9+5", "8+6", "7+5", "6+5"];
const B_EX = {a3:"1+2", a5:"2+3", a7:"3+4", a10:"4+6", a15:"12+3", a20:"13+6"};
const H_EX = {h1:"34+5", h2:"37+6", h3:"30+40", h4:"23+41", h5:"25+47"};
const K_EX = {b1:"300+200", b2:"342+5", b3:"347+6", b4:"320+40", b5:"342+25", b6:"372+45"};
const C_EX = {c1:"7:00", c2:"7:30", c3:"7:15", c4:"7:20", c5:"7:23", c6:"19:45"};
const X_EX = {"1":"12×3", "2":"17×5", "3":"34×6", "4":"213×3"};
const O_EX = {"1":"47→50", "2":"347→350", "3":"347→300"};
const Q_EX = {"1":"7+5-3", "2":"30+40-20", "3":"47+5-3"};
const minusEx = ex => { const [a,b] = ex.split("+").map(Number); return (a+b) + "-" + b; };
const divEx = ex => { const [a,b] = ex.split("×").map(Number); return (a*b) + ":" + b; };
const bucketTiles = (ex, plusKey, minusKey) => Object.keys(ex)
  .map(id => ({label: ex[id], keys:[plusKey(id)], tip: ex[id]}))
  .concat(Object.keys(ex).map(id =>
    ({label: minusEx(ex[id]), keys:[minusKey(id)], tip: minusEx(ex[id])})));

/* Which blocks are worth drawing. A family shows up once the child can
   reach it or once anything of it is in the box; a locked track nobody
   has touched would be a wall of empty squares. The workshop is always
   on the map, so it always gets a block. */
function heatSpecs(p){
  const out = [];
  const push = (trackId, spec) => {
    const tr = trackId && trackById(trackId);
    const reachable = !tr || (inGrade(p, tr) && unlockState(p, tr).open);
    if(reachable || spec.tiles.some(x => x.keys && heatCell(p, x.keys).has)) out.push(spec);
  };
  push("t1", heatGrid(t("heatMult"), HEAT_10,
    (a,b) => a <= b ? mk(a,b) : mk(b,a), (a,b) => a + " × " + b + " = " + (a*b)));
  push("d1", heatGrid(t("trk_d1"), HEAT_9,
    (a,b) => a <= b ? dk(a,b) : dk(b,a), (a,b) => (a*b) + " : " + a + " = " + b));
  // the blocks come in the order the tracks sit on the map, so the
  // multiplying stays together and a parent reads the two in one glance
  push("beyond", heatStrip(t("trk_beyond"), 4, X_BUCKETS.map(b =>
    ({label: X_EX[b.id], keys:["xm" + b.id], tip: X_EX[b.id]}))
    .concat(X_BUCKETS.map(b =>
    ({label: divEx(X_EX[b.id]), keys:["xd" + b.id], tip: divEx(X_EX[b.id])})))));
  // the first year is one block of six ranges rather than six blocks of
  // one, because a parent reads it as one ladder
  push("a3", heatStrip(t("heatBands"), 6, BANDS.map(b =>
    ({label: B_EX[b.id], keys: bandKeys(b.id), tip: B_EX[b.id] + " / " + minusEx(B_EX[b.id])}))));
  push("bridge", heatStrip(t("trk_bridge"), 4, E_STAGES.map((st, i) =>
    ({label: E_EX[i], keys: stageKeys(i), tip: E_EX[i] + " / " + minusEx(E_EX[i])}))));
  push("a100", heatStrip(t("trk_a100"), 5,
    bucketTiles(H_EX, id => "p" + id, id => "n" + id)));
  // the chain of three numbers is still material within a hundred, so it
  // sits right under the hundred and the parent reads the two together
  push("chain", heatStrip(t("trk_chain"), 3, Q_BUCKETS.map(b =>
    ({label: Q_EX[b.id], keys:["q" + b.id], tip: Q_EX[b.id]}))));
  push("a1000", heatStrip(t("trk_a1000"), 6,
    bucketTiles(K_EX, id => "kp" + id, id => "kn" + id)));
  push("round", heatStrip(t("trk_round"), 3, O_BUCKETS.map(b =>
    ({label: O_EX[b.id], keys:["o" + b.id], tip: O_EX[b.id]}))));
  push("clock", heatStrip(t("trk_clock"), 6, C_BUCKETS.map(b =>
    ({label: C_EX[b.id], keys:[b.id], tip: C_EX[b.id]}))));
  push(null, heatStrip(t("shopTitle"), 3, jobsInGrade(p).reduce((acc, j) => acc.concat(
    j.keys.map(k => ({label: t("heat_" + k), keys:[k], tip: t("heat_" + k)}))), [])));
  return out;
}
/* Mastery across everything the child can actually reach, weighted by
   how much material each track holds, which is what poolSize measures.
   The championship and the trouble spots carry no material of their
   own, and neither does the school track: its pool is borrowed from the
   others, so counting it would count the same facts twice. The workshop
   stays out as well, because it is deliberately outside the racing
   economy and is not a track. */
function overallMastery(p){
  let s = 0, w = 0;
  for(const tr of TRACKS){
    if(tr.op === "mix" || tr.op === "weak" || tr.op === "school") continue;
    if(!inGrade(p, tr) || !unlockState(p, tr).open) continue;
    const keys = trackKeys(p, tr), n = poolSize(keys);
    if(!n) continue;
    s += mastery(p, keys) * n; w += n;
  }
  return w ? s / w : 0;
}

function viewParent(p){
  const heat = heatSpecs(p).map(spec => heatBlock(p, spec)).join("");
  const avg = p.msN ? (p.msSum / p.msN / 1000) : 0;
  const accAll = p.totalAns ? Math.round(p.totalOk / p.totalAns * 100) : 0;
  const mAll = Math.round(overallMastery(p) * 100);

  const toggles = TRACKS.filter(tr => tr.op !== "school").map(tr => {
    const st = p.force[tr.id];
    const auto = unlockState(Object.assign({}, p, {force:{}}), tr);
    const on = st === true || (st === undefined && auto.open);
    return `<div class="row">
      <span class="lab"><b>${t("trk_" + tr.id)}</b><span>${t("trk_" + tr.id + "s")}${st === undefined ? t("autoSuffix") : t("manualSuffix")}</span></span>
      <button class="sw ${on ? "on" : ""}" data-act="force" data-id="${tr.id}" role="switch" aria-checked="${on}"><i></i></button>
    </div>`;
  }).join("");

  return `<div class="scr narrow">
    <div class="topbar">
      <button class="iconbtn" data-act="map" aria-label="${t("back")}">&#8592;</button>
      <h1>${t("gateTitle")} &middot; ${esc(p.name)}</h1>
    </div>
    <div class="scr-scroll pad">
      <div class="statrow" style="margin-top:14px">
        <div class="stat"><div class="v">${mAll}&#8202;%</div><div class="l">${t("statMastery")}</div></div>
        <div class="stat"><div class="v">${accAll}&#8202;%</div><div class="l">${t("statAccuracy")}</div></div>
        <div class="stat"><div class="v">${avg ? num(avg, 1) : "0"}&#8202;s</div><div class="l">${t("statAvg")}</div></div>
      </div>

      <div class="h2">${t("secMastery")}</div>
      <div class="card">
        ${heat}
        <div class="legend">
          <span><i style="background:#dfe6f7"></i>${t("legendNew")}</span>
          <span><i style="background:#f2557f"></i>${t("legendBad")}</span>
          <span><i style="background:#ffb020"></i>${t("legendSlow")}</span>
          <span><i style="background:#8bd94f"></i>${t("legendOk")}</span>
          <span><i style="background:#12b36a"></i>${t("legendAuto")}</span>
        </div>
        <div class="muted" style="margin-top:10px">
          ${t("heatNote", num(SPEED[p.speedMode || "normal"].fast / 1000, 1))}
          ${t("heatTileNote")}
        </div>
      </div>

      <div class="h2">${t("secGrade")}</div>
      <div class="card">
        <div class="muted" style="margin-bottom:8px">${t("gradeLabel")}</div>
        ${gradeSeg("gradeset", gradeOf(p))}
        <div class="muted" style="margin-top:10px">${t("gradeNote")}</div>
      </div>

      <div class="h2">${t("secCurriculum")}</div>
      <div class="card">
        <div class="muted" style="margin-bottom:8px">${t("curriculumLabel")}</div>
        <select class="field" data-act="curriculumsel">
          <option value="">${t("curriculumNone")}</option>
          ${CURRICULA.map(c => `<option value="${c.id}" ${p.curriculum === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}
        </select>
        ${curriculumById(p.curriculum) ? `
          <div class="muted" style="margin:16px 0 8px">${t("chapterLabel")}</div>
          <select class="field" data-act="chaptersel">
            ${curriculumById(p.curriculum).chapters.map(ch =>
              `<option value="${ch.n}"${p.chapter === ch.n ? " selected" : ""}${isPlayable(ch) ? "" : " disabled"}>${ch.n}. ${esc(ch.name)}</option>`).join("")}
          </select>
          <div class="muted" style="margin:6px 0 0;font-size:12px">${esc((chapterOf(p) || {}).src || "")}</div>
          <div class="muted" style="margin-top:10px">${t("chapterGreyed")}</div>
          <div class="muted" style="margin:16px 0 8px">${t("chapterModeLabel")}</div>
          <div class="seg">
            ${[["soft", t("chapterSoft")], ["hard", t("chapterHard")]].map(([k,l]) =>
              `<button class="${(p.chapterMode || "soft") === k ? "on" : ""}" data-act="chaptermode" data-cm="${k}">${l}</button>`).join("")}
          </div>
          <div class="muted" style="margin-top:10px">${t("chapterOnMap")}</div>` : ""}
        <div class="muted" style="margin-top:14px">${t("curriculumNote")}</div>
      </div>

      <div class="h2">${t("secUnlocked")}</div>
      <div class="card">
        <div class="row">
          <span class="lab"><b>${t("autoUnlock")}</b><span>${t("autoUnlockSub")}</span></span>
          <button class="sw ${p.autoUnlock ? "on" : ""}" data-act="autounlock" role="switch" aria-checked="${p.autoUnlock}"><i></i></button>
        </div>
        ${toggles}
        <button class="btn ghost wide" data-act="resetforce" style="margin-top:14px">${t("resetForce")}</button>
      </div>

      <div class="h2">${t("secDifficulty")}</div>
      <div class="card">
        <div class="muted" style="margin-bottom:8px">${t("raceLength")}</div>
        <div class="seg" style="margin-bottom:16px">
          ${[10,15,20,25].map(n => `<button class="${p.qCount === n ? "on" : ""}" data-act="qcount" data-n="${n}">${n}</button>`).join("")}
        </div>
        <div class="muted" style="margin-bottom:8px">${t("speedLimit")}</div>
        <div class="seg">
          ${[["slow", num(5.2,1)],["normal", num(3.8,1)],["fast", num(2.8,1)]].map(([k,l]) =>
            `<button class="${(p.speedMode||"normal") === k ? "on" : ""}" data-act="speed" data-sp="${k}">${l}&#8202;s</button>`).join("")}
        </div>
        <div class="muted" style="margin-top:10px">
          ${t("speedNote")}
        </div>
      </div>

      <div class="h2">${t("secLanguage")}</div>
      <div class="card">
        <div class="muted" style="margin-bottom:8px">${t("langParent")}</div>
        ${langSeg("parentlang", DB.lang)}
        <div class="muted" style="margin:16px 0 8px">${t("langChild", esc(p.name))}</div>
        ${langSeg("childlang", p.lang || DB.lang)}
      </div>

      <div class="h2">${t("secBackup")}</div>
      <div class="card">
        <div class="muted" style="margin-bottom:8px">${t("backupNote")}</div>
        <textarea id="dump" spellcheck="false">${esc(JSON.stringify(p))}</textarea>
        <button class="btn ghost wide" data-act="import" style="margin-top:10px">${t("importBtn")}</button>
      </div>

      <div class="h2">${t("secPin")}</div>
      <div class="card">
        <button class="btn ghost wide" data-act="setpin">${t("changePin")}</button>
      </div>

      <div class="h2">${t("secDanger")}</div>
      <div class="card">
        <button class="btn ghost wide" data-act="resetprogress" style="color:var(--berry)">${t("resetProgress")}</button>
      </div>
      <div style="height:20px"></div>
    </div>
  </div>`;
}

/* =================================================================
   8. INTERACTION
   One delegated click handler drives every screen.
   ================================================================= */
function sheet(html){
  const d = document.createElement("div");
  d.className = "sheet";
  d.innerHTML = `<div class="inner">${html}</div>`;
  d.addEventListener("click", e => { if(e.target === d) d.remove(); });
  document.body.appendChild(d);
  return d;
}
function ask(title, text, okLabel, cb){
  const d = sheet(`<h3>${title}</h3><div class="muted" style="margin-bottom:18px">${text}</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <button class="btn wide" data-yes>${okLabel}</button>
      <button class="btn ghost wide" data-no>${t("back")}</button></div>`);
  d.querySelector("[data-yes]").onclick = () => { d.remove(); cb(); };
  d.querySelector("[data-no]").onclick = () => d.remove();
}

document.addEventListener("click", e => {
  const kb = e.target.closest("[data-k]");
  if(kb){ tap(kb.dataset.k); return; }
  // the workshop answers by handling coins, so it has its own two
  // attributes rather than borrowing the keypad's
  const cn = e.target.closest("[data-coin]");
  if(cn){ jobTap(+cn.dataset.coin); return; }
  const dp = e.target.closest("[data-drop]");
  if(dp){ jobDrop(+dp.dataset.drop); return; }
  const el = e.target.closest("[data-act]");
  if(!el) return;
  const act = el.dataset.act, id = el.dataset.id, p = P();

  if(act === "newplayer"){
    // the school year is asked for here rather than left to a default,
    // because it decides how much of the map is laid out, and a wrong
    // guess would either bury a first grader in material or hide half
    // the game from a third grader
    let picked = 0;
    const d = sheet(`<h3>${t("namePrompt")}</h3>
      <div class="muted" style="margin-top:4px">${t("nameNote")}</div>
      <input class="field" id="nm" maxlength="14" placeholder="${t("namePlaceholder")}" style="margin:14px 0 16px">
      <div class="tiny" style="margin-bottom:8px">${t("gradeAsk")}</div>
      ${gradeSeg("newgrade", 0)}
      <button class="btn wide" data-go disabled style="margin-top:18px">${t("nameGo")}</button>`);
    const inp = d.querySelector("#nm"), go2 = d.querySelector("[data-go]");
    setTimeout(() => inp.focus(), 60);
    d.querySelectorAll("[data-gr]").forEach(b => b.onclick = () => {
      picked = +b.dataset.gr;
      d.querySelectorAll("[data-gr]").forEach(x => x.classList.toggle("on", x === b));
      go2.removeAttribute("disabled");
    });
    const create = () => {
      if(!picked) return;
      const nm = (inp.value || t("defaultName")).trim().slice(0, 14) || t("defaultName");
      const np = newProfile(nm, picked);
      DB.profiles.push(np); DB.current = np.id; save(); d.remove(); go("map");
    };
    go2.onclick = create;
    inp.onkeydown = ev => { if(ev.key === "Enter") create(); };
    return;
  }
  if(act === "pick"){ DB.current = id; PEEK = null; BACK = null; save(); go("map"); return; }
  // looking ahead is a toggle and nothing is written down: the year in
  // the profile stays where the parent put it
  if(act === "peek"){ PEEK = (PEEK === p.id) ? null : p.id; sfx.coin(); render(); return; }
  /* Unfolding the earlier years grows the road upwards, so whatever the
     finger was on would be replaced by something else; the view moves
     back to the year sign, both on opening and on closing. Nothing is
     written down here either. */
  if(act === "back"){
    BACK = (BACK === p.id) ? null : p.id; sfx.coin(); go("map", {focus:"milestone"}); return;
  }
  if(act === "delplayer"){
    e.stopPropagation();
    const who = DB.profiles.find(x => x.id === id);
    ask(t("delPlayerTitle"), t("delPlayerText", esc(who.name)), t("delete"), () => {
      DB.profiles = DB.profiles.filter(x => x.id !== id);
      if(DB.current === id) DB.current = null;
      save(); render();
    });
    return;
  }
  if(act === "players"){ go("players"); return; }
  if(act === "map"){ go("map"); return; }
  if(act === "sound"){ DB.sound = !DB.sound; save(); if(DB.sound) sfx.ok(); render(); return; }
  if(act === "collection"){ go("collection"); return; }
  if(act === "tokens"){ go("tokens"); return; }
  // the world is the child's choice, not a setting hidden behind the
  // parent code: it works through recognising yourself in it, which is
  // the whole reason it exists
  if(act === "worldpick"){
    const cells = WORLDS.map(w => `
      <button class="pickworld ${p.world === w.id ? "sel" : ""}" data-act="worldset" data-id="${w.id}">
        <span class="thumb">${sceneThumb(w.id, w.env.t1 || trackById("t1").env, "t1", .55)}</span>
        <span class="body">
          <span class="nm">${t("w_" + w.id)}</span>
          <span class="sub">${t("w_" + w.id + "s")}</span>
        </span>
      </button>`).join("");
    sheet(`<h3>${t("worldTitle")}</h3>
      <div class="muted" style="margin:2px 0 14px">${t("worldNote")}</div>
      <div class="worldgrid">${cells}</div>`);
    return;
  }
  if(act === "worldset"){
    p.world = id; save(); sfx.coin();
    const s = el.closest(".sheet"); if(s) s.remove();
    render();
    return;
  }
  // parts are only good for paint, so spending them opens the garage at
  // the paints and stays there while the child tries colours on
  if(act === "paintshop"){ go("collection", {focus:"paintsec"}); return; }

  if(act === "shop"){ go("shop"); return; }
  if(act === "jobstart"){ startJob(p, id); return; }
  if(act === "jobcheck"){ JOB && JOB.state === "done-step" ? jobNext() : jobCheck(); return; }
  if(act === "jobagain"){ startJob(p, JOB.job.id); return; }
  if(act === "jobquit"){
    // leaving early keeps what was already earned: the workshop never
    // punishes stopping, the same way a race always finishes
    ask(t("jobQuitTitle"), t("jobQuitText"), t("jobQuitYes"), () => {
      p.parts += JOB.parts; save(); go("shop");
    });
    return;
  }

  if(act === "play"){
    // the world puts its own racers first and hides none of the others
    const owned = ridesOrder(p, ALL_ITEMS.filter(it => p.owned.includes(it.id)));
    const cells = owned.map(it => `
      <button class="pickitem ${p.runner === it.id ? "sel" : ""}" data-pick="${it.id}">
        <span class="pic">${itemSVG(p, it.id)}</span>
        <span class="nm">${nameOf(it)}</span></button>`).join("");
    const d = sheet(`<h3>${trackName(p, trackById(id))}</h3>
      <div class="muted" style="margin-top:2px">${trackSub(p, trackById(id))}</div>
      <div class="tiny" style="margin:16px 0 8px">${t("whichRacer")}</div>
      <div class="pickgrid pickscroll">${cells}</div>
      <button class="btn mint wide" data-go style="margin-top:18px">${t("letsGo")}</button>
      <button class="btn ghost wide" data-more style="margin-top:10px">${t("moreRacers")}</button>`);
    d.querySelectorAll("[data-pick]").forEach(b => b.onclick = () => {
      p.runner = b.dataset.pick; save(); sfx.coin();
      d.querySelectorAll("[data-pick]").forEach(x => x.classList.toggle("sel", x === b));
    });
    d.querySelector("[data-more]").onclick = () => { d.remove(); go("collection"); };
    d.querySelector("[data-go]").onclick = () => {
      d.remove();
      RUN = null;
      startRun(p, id);
      RUN.stageBefore = stageOf(p, p.runner);
      RUN.t0 = Date.now();
    };
    return;
  }
  if(act === "again"){
    const trackId = RUN.t.id;
    RUN = null; startRun(p, trackId);
    RUN.stageBefore = stageOf(p, p.runner);
    RUN.t0 = Date.now();
    return;
  }
  if(act === "quit"){
    ask(t("quitTitle"), t("quitText"), t("quitYes"), () => {
      save(); go("map");
    });
    return;
  }

  // picking a machine or an animal means the child has scrolled away
  // from the paints, so the screen must stop jumping back down to them
  if(act === "use"){ delete view.focus; p.runner = id; save(); render(); return; }
  if(act === "buy"){
    delete view.focus;
    const it = itemById(id);
    if(p.coins < it.cost){
      sheet(`<h3>${t("notEnoughTitle")}</h3><div class="muted">${t("notEnoughText", it.cost - p.coins)}</div>
        <button class="btn wide" style="margin-top:16px" data-act="closesheet">${t("okBtn")}</button>`);
      return;
    }
    ask(t("buyTitle", nameOf(it)), t("buyText", it.cost, p.coins), t("buyYes"), () => {
      p.coins -= it.cost; p.owned.push(id); p.runner = id; save(); sfx.coin(); render();
    });
    return;
  }

  if(act === "buypaint"){
    const pa = paintById(id);
    if(p.parts < pa.cost){
      sheet(`<h3>${t("notEnoughPartsTitle")}</h3><div class="muted">${t("notEnoughPartsText", pa.cost - p.parts)}</div>
        <button class="btn wide" style="margin-top:16px" data-act="closesheet">${t("okBtn")}</button>`);
      return;
    }
    ask(t("buyPaintTitle", t(pa.id)), t("buyPaintText", pa.cost, p.parts), t("buyYes"), () => {
      p.parts -= pa.cost; p.paints.push(pa.id);
      wearPaint(p, pa.id); save(); sfx.coin(); render();
    });
    return;
  }
  if(act === "usepaint"){ wearPaint(p, id); save(); render(); return; }

  if(act === "gate"){ DB.pin ? go("gate") : go("setpin"); return; }
  if(act === "gatego"){
    const v = (document.getElementById("gatein").value || "").trim();
    if(hashPin(v) === DB.pin) go("parent");
    else document.getElementById("gateerr").textContent = t("gateWrong");
    return;
  }
  if(act === "setpin"){ go("setpin"); return; }
  if(act === "parent"){ go("parent"); return; }
  if(act === "savepin"){
    const a = (document.getElementById("pin1").value || "").trim();
    const errEl = document.getElementById("pinerr");
    if(!/^\d{4,6}$/.test(a)){ errEl.textContent = t("pinTooShort"); return; }
    DB.pin = hashPin(a); save();
    go(DB.profiles.length ? "parent" : "players");
    return;
  }

  if(act === "parentlang"){
    DB.lang = el.dataset.lang; save(); render(); return;
  }
  if(act === "childlang"){
    p.lang = el.dataset.lang; save(); render(); return;
  }
  // moving the year down takes tracks off the map, which only a parent
  // may do, exactly like closing a track by hand
  if(act === "gradeset"){ p.grade = +el.dataset.gr; PEEK = null; BACK = null; save(); render(); return; }
  if(act === "chaptermode"){ p.chapterMode = el.dataset.cm; save(); render(); return; }
  if(act === "autounlock"){ p.autoUnlock = !p.autoUnlock; save(); render(); return; }
  if(act === "force"){
    const auto = unlockState(Object.assign({}, p, {force:{}}), trackById(id)).open;
    const cur = p.force[id] === undefined ? auto : p.force[id];
    if(!cur === auto) delete p.force[id]; else p.force[id] = !cur;
    save(); render(); return;
  }
  if(act === "resetforce"){ p.force = {}; save(); render(); return; }
  if(act === "qcount"){ p.qCount = +el.dataset.n; save(); render(); return; }
  if(act === "speed"){ p.speedMode = el.dataset.sp; save(); render(); return; }
  if(act === "import"){
    try{
      const obj = JSON.parse(document.getElementById("dump").value);
      if(!obj || !obj.id) throw 0;
      const i = DB.profiles.findIndex(x => x.id === DB.current);
      obj.id = DB.current;
      DB.profiles[i] = Object.assign(newProfile(obj.name || t("defaultName")), obj);
      if(DB.profiles[i].curriculum && !curriculumById(DB.profiles[i].curriculum)) DB.profiles[i].curriculum = null;
      normalizeChapter(DB.profiles[i]);
      seedOpened(DB.profiles[i]);
      seedShop(DB.profiles[i]);
      seedStars(DB.profiles[i]);
      seedWorld(DB.profiles[i]);
      seedGrade(DB.profiles[i]);
      seedBands(DB.profiles[i]);
      save(); render();
    }catch(err){
      sheet(`<h3>${t("importErrTitle")}</h3><div class="muted">${t("importErrText")}</div>
        <button class="btn wide" style="margin-top:16px" data-act="closesheet">${t("okBtn")}</button>`);
    }
    return;
  }
  if(act === "closesheet"){ const s = el.closest(".sheet"); if(s) s.remove(); return; }
  if(act === "resetprogress"){
    ask(t("resetTitle"), t("resetText"), t("resetYes"), () => {
      const i = DB.profiles.findIndex(x => x.id === DB.current);
      const old = DB.profiles[i];
      // Wiping progress wipes progress, not the settings the parent made.
      // The school year above all: without it the child would be handed
      // the whole map of the top year on the next screen.
      const np = newProfile(old.name, old.grade); np.id = DB.current;
      for(const k of ["lang","world","curriculum","chapter","chapterMode","qCount","speedMode","autoUnlock"]){
        if(old[k] !== undefined) np[k] = old[k];
      }
      DB.profiles[i] = np; save(); go("map");
    });
    return;
  }
});

/* Selects need their own listener, the delegated one above is click only. */
document.addEventListener("change", e => {
  const el = e.target.closest("[data-act]");
  if(!el) return;
  const p = P();
  if(!p) return;
  if(el.dataset.act === "curriculumsel"){
    p.curriculum = el.value || null;
    const ok = playableChapters(curriculumById(p.curriculum));
    p.chapter = ok.length ? ok[0].n : null;
    save(); render();
    return;
  }
  if(el.dataset.act === "chaptersel"){
    p.chapter = +el.value;
    save(); render();
    return;
  }
});

/* Turning the tablet changes both axes, so the two values on <html> are
   written again first. The race only has to put the cars back on the
   road, which is cheap; the map is built in JS and has to be built again
   to land in the right number of columns, so it waits for the resize to
   settle. The view scrolls back to the top, which is what turning a
   tablet does anyway. */
let layoutWait = 0;
function onResize(){
  layoutClass();
  if(view.name === "game"){
    placeCar(document.getElementById("mycar"), anim.shown, 0);
    placeCar(document.getElementById("rivalcar"), anim.ghostShown, -13);
    return;
  }
  if(view.name === "map"){
    clearTimeout(layoutWait);
    layoutWait = setTimeout(() => { if(view.name === "map") render(); }, 150);
  }
}
window.addEventListener("resize", onResize);
window.addEventListener("orientationchange", onResize);

/* boot */
load();
save();
layoutClass();
if(!DB.pin) go("setpin");
else if(DB.current && P()) go("map");
else go("players");
