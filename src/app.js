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
    seedStarters(p);
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
    seedDuck(p);
    seedStars(p);
    seedWorld(p);
    seedGrade(p);
    seedBands(p);
  }
}
/* The free starter set belongs to everyone, including older profiles and
   backups restored from an older version. It is a seed like any other,
   and it has to run on the imported profile too: a backup made before
   the duck existed carries a list of racers without it, and the import
   overwrites the fresh profile's list with that one, so without this the
   duck a child already had would come back as a locked tile with a price
   on it. Nothing is ever taken away here, only added. */
function seedStarters(p){
  p.owned = p.owned || [];
  for(const s of STARTERS) if(!p.owned.includes(s)) p.owned.push(s);
  if(!p.runner || !p.owned.includes(p.runner)) p.runner = STARTERS[0];
}
/* What goes on the duck, added later. An older profile knows none of it
   and starts with an empty wardrobe; it loses nothing by that, because a
   duck with no body chosen is the classic yellow one, which is what it
   was already looking at. */
function seedDuck(p){
  p.duckParts = p.duckParts || [];   // duck part ids bought with parts
  p.duck      = p.duck      || {};   // layer -> the part id worn on it
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
  for(const k of Object.keys(p.facts || {})) if(p.facts[k].lv >= STAR_LV) lightStar(p, k);
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
    duckParts: [],      // duck part ids bought with parts, never given back
    duck: {},           // duck layer -> the part id worn on it
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

/* Which of two operations is done first. Chapter 13 of the seventh part
   is the one without a thousand in sight, chapter 30 of the eighth part
   comes back to it with bigger numbers, so the four buckets run along
   two axes: brackets or none, and within a hundred or within a
   thousand.
   Multiplying and dividing stay inside the small times table and every
   division comes out even. The track opens on the table alone, and
   nothing in the game has taught a child 360 : 4 yet; that is the
   `tens` family, which is not built. One consequence is worth writing
   down, because it is why the fourth bucket looks different from the
   second: an expression whose outer operation is × or : cannot leave
   the hundred while the table is the limit, so the fourth bucket grows
   the range on the adding side and its brackets are the kind that
   really change the answer, a - (b + c). Read left to right that line
   comes out differently, which is the whole lesson. */
const Z_BUCKETS = [
  {id:"1", label:"no brackets, within a hundred"},    // 4 + 3 × 5
  {id:"2", label:"brackets, within a hundred"},       // (4 + 3) × 5
  {id:"3", label:"no brackets, within a thousand"},   // 300 + 7 × 8
  {id:"4", label:"brackets, within a thousand"}       // 500 - (40 + 30)
];
const opsKeys = ids => ids.map(b => "z" + b);

/* Ten, a hundred, and the round tens that follow from them. The eighth
   part gives four pages to multiplying and dividing by ten and by a
   hundred and lets the round tens fall straight out of it: 3 × 40 is
   3 × 4 with the nought put back. The two buckets are that pair, the
   bare nought first and then a table fact wearing one.
   Dividing is the same product read backwards, so one bucket trains
   both directions, exactly as past the tables does; the key says which
   way round it is, `gm` or `gd`, and the bucket id is a plain number,
   which is the convention that family set. */
const G_BUCKETS = [
  {id:"1", label:"times and divided by ten and a hundred"},
  {id:"2", label:"times and divided by a round ten"}
];
const tensKeys = ids => ids.map(b => "gm" + b).concat(ids.map(b => "gd" + b));

/* Dividing with something left over, chapter 27 of the eighth part. It
   is the longest chapter of the two parts, three double pages, and the
   workbook builds it by marking the multiples of one divisor on a number
   line and then asking how far past the last one the number sits.
   The key is the divisor, `r2` to `r10`, and the dividend is drawn.
   Writing every fact out instead, `r{dividend}x{divisor}`, would be over
   five hundred keys: a collection with five hundred places and a Leitner
   box that never fills up. What the box is worth remembering is how the
   child gets on with dividing by seven, and that is one key, not fifty.
   The buckets are the pairs of divisors the workbook takes them in, two
   and three first and ten last, so one bucket is one double page. */
const R_BUCKETS = [
  {id:"1", div:[2,3]},
  {id:"2", div:[4,5]},
  {id:"3", div:[6,7]},
  {id:"4", div:[8,9]},
  {id:"5", div:[10]}
];
const divremKeys = ids => ids.reduce((out, id) => {
  const b = R_BUCKETS.find(x => x.id === id);
  return b ? out.concat(b.div.map(d => "r" + d)) : out;
}, []);

/* Splitting a number into what each of its places is worth, chapter 21
   of the third year, where the thousand is derived from the hundred the
   child already has.

   Which way round to ask it was the whole decision here, and it went to
   the splitting rather than to the putting together. "300 + 40 + 7 = ▢"
   can be answered by reading the digits off the screen in the order
   they stand in, without ever knowing what any of them is worth, and on
   a keypad it is a sum inside a thousand, which `a1000` already
   teaches. "347 = ▢ + ▢ + ▢" cannot: the four in the middle has to be
   given back as forty, which is the whole of what the chapter is for
   and what carries written adding later on. Asking instead how many
   hundreds, tens and ones there are, answered 3, 4, 7, would be the
   reading again with the arithmetic taken out, so it is not what is
   asked either. The workbook writes the line the same way round.

   The buckets walk the places the way the book derives the range: two
   digits first, which is the hundred the child is standing on, then a
   three digit number that ends in a whole ten, then all three places at
   once. How many boxes the row has therefore comes out of the material
   rather than being fixed: the first two buckets are answered in two,
   the last in three.

   Every place that gets a box is drawn from one to nine, so a number
   never has a nought where a box is waiting. That is a restriction with
   a reason rather than a trim: a book writes 407 as 400 + 7, two terms
   and not three, so a fixed row of three boxes would be asking a child
   for a nought that nobody writes down. */
const V_PLACE = {h: 100, t: 10, o: 1};
const V_BUCKETS = [
  {id:"1", places:["t","o"]},      // 47 = 40 + 7
  {id:"2", places:["h","t"]},      // 350 = 300 + 50
  {id:"3", places:["h","t","o"]}   // 347 = 300 + 40 + 7
];
const splitKeys = ids => ids.map(id => "v" + id);

/* Choosing from what is offered, which is the one thing in the whole
   game that is recognising rather than recalling.

   THE BOUNDARY, and it is the point of this family rather than a note
   on the side. The first of the untouchable principles says the answer
   is written on the number pad and never picked from a list, because
   recall builds a memory trace and recognition does not. Two chapters
   of the book cannot be asked any other way: whether a number is even
   or odd, and how many figures it is written with, are questions whose
   answer is a word. So this family exists, and it exists *only* as a
   supplement inside the track that follows the chapter the class is on.
   It has no track of its own, it is kept out of the championship and
   out of the trouble spots, and `buildRun()` says so out loud if a new
   branch ever hands it to anything else. What that costs is written
   down too: a child guessing between two buttons is right half the
   time, which is exactly why a race may never be built out of this and
   only a chapter's own race may contain it.

   No collection, either, and for the same reason: places in the
   Treasures are sized from a track, this family has none, and a place
   that lights up where nothing can be looked at is worse than no place.
   `lightStar()` is the one gate that says so.

   The buckets. Even and odd come in two, under a hundred and then three
   figures, because ignoring the other figures and reading only the last
   one is a small step of its own. How many figures comes in one bucket
   spanning all three kinds, and it has to: a bucket that never produced
   a three figure number would make the third button one that is never
   right, and a button that is never right is a button a child learns to
   skip.

   Keys are prefixed like the hundred, `"j" + bucket`, and the kind of
   question stands inside the bucket id rather than taking a second
   letter of the alphabet: `jp1`, `jp2` for even and odd, `jd1` for how
   many figures. Ten letters were left and about ten generators are
   planned, so one head carries both kinds the way `k`, `x` and `g`
   carry their two directions. */
const J_BUCKETS = [
  {id:"p1", kind:"parity", lo:1,   hi:99},   // even or odd under a hundred
  {id:"p2", kind:"parity", lo:100, hi:999},  // and then of a three figure number
  {id:"d1", kind:"digits", upto:3}           // one, two or three figures
];
const pickKeys = ids => ids.map(id => "j" + id);
/* What may never be raced outside the chapter it belongs to, asked in
   the places that have to keep it out. Every family answered by
   choosing wears this head, even and odd and how many figures here and
   comparing further down, so that this one line is the whole of the
   boundary rather than one line per family. */
const isPickKey = k => !!k && k[0] === "j";
/* AND HOW MUCH OF ONE RACE IT MAY EVER BE.
   Keeping it out of every track but the school one is only half the
   boundary. The other half is this: a chapter whose pool holds nothing
   but questions answered by choosing would fill the race with them, and
   a race is timed and pays points for speed. That would be paying a
   child for recognising two or three buttons quickly, which is the very
   thing the first of the untouchable principles forbids, and the plan
   promised the opposite -- a supplement, a minority of the questions.
   Nothing was holding it to that, so this does: at most a third of any
   one race, whatever the chapter's pool holds and in the hard mode as
   much as in the soft one. "The chapter and nothing else" cannot be
   allowed to mean "guessing and nothing else".
   A third rather than a half, because a minority has to be visibly one,
   and six questions out of twenty is still each of chapter 6's three
   keys practised twice. What the cap gives back is drawn from the
   chapters before it, which is review the child is due anyway. */
const PICK_MAX_SHARE = 1 / 3;

/* Converting units, one bucket per kind of measure. The seventh part
   introduces length, weight and volume (chapter 17) and then the clock
   and the calendar (chapter 18), and the eighth part converts them
   (chapter 29), so time is a bucket of its own and the other three are
   one each.
   Every pair is written big unit, small unit, how many of the small
   ones go into the big one, and both directions come out of the same
   pair: the generator either multiplies or divides by that number.
   Only conversions the books actually ask for are here; a metre into
   millimetres is arithmetically fine and pedagogically nowhere. */
const U_BUCKETS = [
  {id:"1", pairs:[["m","cm",100], ["km","m",1000], ["dm","cm",10], ["cm","mm",10]]},
  {id:"2", pairs:[["kg","g",1000], ["t","kg",1000]]},
  {id:"3", pairs:[["l","dl",10], ["l","ml",1000], ["hl","l",100]]},
  {id:"4", pairs:[["h","min",60], ["min","s",60], ["day","h",24],
                  ["week","day",7], ["year","month",12]]}
];
const unitKeys = ids => ids.map(b => "u" + b);
/* The short units are written the same way in Czech, English and German,
   so they stand in the table above as they are. The spoken ones do not,
   and Czech needs three forms of each: one day, two to four days, five
   and more days. The dictionary holds all three separated by bars and
   the number picks one; English and German split the same way and
   simply repeat their plural. */
const U_WORDS = ["day", "week", "month", "year"];
/* One noun, three forms, picked by the number standing in front of it.
   The dictionary entry holds all three separated by bars and this is the
   only place that splits them, so a second family that counts things in
   words (the workshop's word problems) asks the same question of the
   same mechanism rather than growing one of its own. */
function pickForm(key, n){
  const forms = t(key).split("|");
  return forms[n === 1 ? 0 : n < 5 ? 1 : 2] || forms[forms.length - 1];
}
function unitLabel(u, n){
  if(U_WORDS.indexOf(u) < 0) return u;
  return pickForm("unit_" + u, n);
}

/* Which of two is more, the second family answered by choosing.

   THE SAME BOUNDARY, said more firmly here than above. Comparing is
   recognising rather than recalling, so it goes against the first of the
   untouchable principles and belongs inside as a supplement, never as a
   track of its own. It is held to that by the same five things the
   family above is held to and, on purpose, by the same code: the key
   head is `j` here as well, so `isPickKey` already covers comparing in
   the championship, in the trouble spots, in `lightStar()` and in the
   guard at the end of `buildRun()`. A second, almost identical set of
   guards would be the trap rather than the safeguard; one head means one
   guard, and a new family that forgets to join it falls over out loud.

   TWO KINDS, and they are not one question. Comparing two numbers is
   reading the places of both, which is what chapter 22 is about.
   Comparing two quantities is converting one of them first and only then
   comparing: "3 m" against "280 cm" is a conversion done in the head
   before there is anything to compare at all. That is why the pairs
   below are drawn straight out of the conversion table rather than out
   of a second one of their own.

   WHY WEIGHT IS NOT HERE. A comparison is worth asking only when either
   side can turn out to be the larger. Within a thousand, where the third
   year counts, no number of grams can pass a kilogram and no number of
   kilograms can pass a tonne, so every weight comparison would be
   settled by reading the unit alone and the child would never convert
   anything. `CMP_MAX_F` says that in one line: only pairs whose ratio
   leaves room on both sides are compared, and a measure left without one
   simply has no bucket. It is the same line that drops the kilometre,
   the litre in millilitres and the tonne out of the measures that stay,
   so what is left is length, volume and time. */
const CMP_MAX_F = 100;
const cmpPairs = b => b.pairs.filter(p => p[2] <= CMP_MAX_F);
const CMP_BUCKETS = [
  {id:"c1", kind:"cmpnum", digits:2},          // 47 and 52
  {id:"c2", kind:"cmpnum", digits:3}           // 347 and 352
].concat(U_BUCKETS.map(b => ({id:"u" + b.id, kind:"cmpunit", pairs: cmpPairs(b)}))
                  .filter(b => b.pairs.length));
/* Comparing shares the head with the family above, so the one guard
   covers both; this asks the narrower question, and only the parent heat
   map needs it, to know which block a key belongs in. */
const isCmpKey = k => isPickKey(k) && CMP_BUCKETS.some(b => "j" + b.id === k);
/* Every fourth question has the two sides equal. It is a decision, the
   same kind as how often a division comes out even, and it is pulled
   from two directions at once.
   Equality has to turn up often enough to stay a real answer: a button
   that is almost never right is a button a child learns to skip, which
   is the very reason how many figures got a bucket that reaches three
   of them. And it has to stay the minority, because the book puts two
   unequal things side by side far more often than two equal ones and
   because spotting that they came out the same is the thing worth
   noticing rather than the thing to expect.
   A quarter is the largest share that still reads as a minority. It also
   keeps the whole thing close to an even draw: less and more get three
   eighths each, so guessing the likeliest single button pays 37.5 per
   cent against the 33.3 of a perfectly even three, and guessing the
   equals sign is the worst of the three guesses rather than the best. */
const CMP_EQUAL = .25;
/* One bucket table per family, one lookup over both, because the head
   they share means a key alone does not say which table it came from. */
const chosenBucket = id => J_BUCKETS.find(b => b.id === id)
  || CMP_BUCKETS.find(b => b.id === id) || null;

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
  // which operation goes first is chapter 13, so it stands between the
  // chain of three numbers and multiplying past the tables
  {id:"ops",  op:"ops",                                   env:"amethyst", grade:3},
  {id:"beyond",op:"beyond",                               env:"savanna",  grade:3},
  // ten, a hundred and the round tens are chapter 28, and they are the
  // same skill as multiplying past the tables read one step further, so
  // the road keeps the two of them side by side
  {id:"tens", op:"tens",                                  env:"mulberry", grade:3},
  // dividing with something left over is chapter 27, one page before the
  // round tens of chapter 28, and it is the last step of the dividing
  // the child has been doing since d1, so the road keeps the whole
  // multiplying and dividing run of the third year together rather than
  // dropping it between the rounding and the thousand
  {id:"divrem",op:"divrem",                               env:"flaxfield",grade:3},
  {id:"round", op:"round",                                env:"cave",     grade:3},
  // splitting a number into what its places are worth is chapter 21,
  // where the book derives the thousand from the hundred, and it comes
  // before the adding of chapters 23 to 25: a child cannot add inside a
  // range it has not met, so the road puts it immediately in front of
  // the thousand rather than after it
  {id:"split",op:"split",                                 env:"barley",   grade:3},
  {id:"a1000",op:"as1000",                                env:"volcano",  grade:3},
  // the units are chapters 18 and 29, but the conversions themselves
  // live in the thousand (1 km is 1000 m), so the road puts them where
  // the child can already count that far, which is right after it
  {id:"units",op:"units",                                 env:"snowfield",grade:3},
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
  // ten and a hundred are one chapter with two directions in it, and
  // the two are kept apart here for the same reason as past the tables
  if(spec.multTens) out.push(...spec.multTens.map(b => "gm" + b));
  if(spec.divTens)  out.push(...spec.divTens.map(b => "gd" + b));
  // one field, not two: a chapter that converts converts both ways, and
  // the bucket is the kind of measure rather than the direction
  if(spec.units) out.push(...unitKeys(spec.units));
  // one field like the units, and for the same reason: a chapter that
  // divides with a remainder divides by whatever its divisors are, and
  // the bucket is the pair of divisors rather than a direction
  if(spec.divrem) out.push(...divremKeys(spec.divrem));
  // one field as well: a chapter that splits a number apart has no
  // second direction, and the bucket is which places the number has
  if(spec.split) out.push(...splitKeys(spec.split));
  // one field like the units, and for the same reason: the double page
  // that names one, two and three figure numbers is the double page
  // that sorts them into even and odd, so a chapter on it is on both
  if(spec.pick) out.push(...pickKeys(spec.pick));
  // comparing is answered by choosing as well and wears the same head,
  // so the same helper builds its keys; a field of its own because it is
  // a different double page of the book, not a different sort of key
  if(spec.cmp) out.push(...pickKeys(spec.cmp));
  if(spec.round) out.push(...spec.round);
  if(spec.chain) out.push(...chainKeys(spec.chain));
  if(spec.ops) out.push(...opsKeys(spec.ops));
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
const FAMILY_HEADS = "pnckxoqzgurvj";
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
  if(tr.op === "tens")  return tensKeys(G_BUCKETS.map(b => b.id));
  if(tr.op === "units") return unitKeys(U_BUCKETS.map(b => b.id));
  if(tr.op === "divrem")return divremKeys(R_BUCKETS.map(b => b.id));
  if(tr.op === "split") return splitKeys(V_BUCKETS.map(b => b.id));
  if(tr.op === "round") return roundKeys(O_BUCKETS.map(b => b.id));
  if(tr.op === "chain") return chainKeys(Q_BUCKETS.map(b => b.id));
  if(tr.op === "ops")   return opsKeys(Z_BUCKETS.map(b => b.id));
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
// the bare nought comes before a table fact wearing one, and each
// bucket multiplies and divides together, so the two rise and fall as
// one step
function tensStage(p){ return stageIndex(p, i => tensKeys([G_BUCKETS[i].id]), G_BUCKETS.length); }
// which kind of measure is being converted: length, then weight, then
// volume, then time, which is the order the books take them in
function unitsStage(p){ return stageIndex(p, i => unitKeys([U_BUCKETS[i].id]), U_BUCKETS.length); }
// which pair of divisors is being shared out with something left over;
// both divisors of a pair rise and fall together, because the workbook
// puts them on one double page and they are one step
function divremStage(p){ return stageIndex(p, i => divremKeys([R_BUCKETS[i].id]), R_BUCKETS.length); }
// how many places of a number are being split apart: two digits first,
// then a three digit number ending in a whole ten, then all three
function splitStage(p){ return stageIndex(p, i => splitKeys([V_BUCKETS[i].id]), V_BUCKETS.length); }
// how far the rounding has got: tens under a hundred, then tens of a
// three digit number, then hundreds
function roundStage(p){ return stageIndex(p, i => roundKeys([O_BUCKETS[i].id]), O_BUCKETS.length); }
// which range the chain of three numbers is being practised in
function chainStage(p){ return stageIndex(p, i => chainKeys([Q_BUCKETS[i].id]), Q_BUCKETS.length); }
// how far the order of operations has got: brackets come after the
// plain line, and the thousand after the hundred
function opsStage(p){ return stageIndex(p, i => opsKeys([Z_BUCKETS[i].id]), Z_BUCKETS.length); }
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
  if(tr.op === "tens") return tensKeys(G_BUCKETS.slice(0, tensStage(p) + 1).map(b => b.id));
  if(tr.op === "units") return unitKeys(U_BUCKETS.slice(0, unitsStage(p) + 1).map(b => b.id));
  if(tr.op === "divrem") return divremKeys(R_BUCKETS.slice(0, divremStage(p) + 1).map(b => b.id));
  if(tr.op === "split") return splitKeys(V_BUCKETS.slice(0, splitStage(p) + 1).map(b => b.id));
  if(tr.op === "round") return roundKeys(O_BUCKETS.slice(0, roundStage(p) + 1).map(b => b.id));
  if(tr.op === "chain") return chainKeys(Q_BUCKETS.slice(0, chainStage(p) + 1).map(b => b.id));
  if(tr.op === "ops") return opsKeys(Z_BUCKETS.slice(0, opsStage(p) + 1).map(b => b.id));
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
    // sharing out with something left over is dividing plus a take-away,
    // and the take-away only makes sense once the child knows where the
    // multiples of the divisor are; that is the dividing track, so this
    // one hangs on the same gate as multiplying past the tables does
    case "divrem": return (m("d1") >= .6 || many("d1")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_d1"))};
    // putting a nought back on 3 × 4 is the step straight after splitting
    // 12 × 3 apart, so this one waits on the track that teaches the
    // splitting rather than on the table underneath it
    case "tens": return (m("beyond") >= .5 || many("beyond")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_beyond"))};
    // rounding needs place value rather than fluent arithmetic, so it
    // opens earlier than the thousand does, and its own first bucket
    // keeps the child on two digit numbers until they are solid
    case "round": return (m("a100") >= .5 || many("a100")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_a100"))};
    // what each place of a number is worth is where the book derives the
    // thousand from the hundred, so it stands on the hundred like the
    // rounding next to it; it is the ground the thousand is built on
    // rather than anything built on the thousand, so it must never wait
    // for it
    case "split": return (m("a100") >= .5 || many("a100")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_a100"))};
    // adding and taking away in one breath is the chapter right after the
    // buckets within a hundred, so it stands on the hundred exactly as
    // rounding does
    case "chain": return (m("a100") >= .5 || many("a100")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_a100"))};
    // knowing which operation goes first is only worth anything once the
    // multiplying itself is fluent, so this one hangs on the whole table
    // rather than on the hundred
    case "ops": return (m("t5") >= .6 || many("t5")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_t5"))};
    // the hundred is built on being able to cross a ten, not merely on
    // having finished the first year's ranges
    case "a100": return (m("bridge") >= .6 || many("bridge")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_bridge"))};
    case "a1000": return (m("a100") >= .6 || many("a100")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_a100"))};
    // a kilometre is a thousand metres and a kilo a thousand grams, so
    // the conversions are the thousand wearing a unit; the gate is lower
    // than the others because the counting itself is already there and
    // what is new is only the unit
    case "units": return (m("a1000") >= .4 || many("a1000")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_a1000"))};
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
   so. Nothing outside here may assume the answer is a number.

   `opts.variant` asks for the same fact in a different shape. A variant
   is not a family: it borrows the key, so nothing downstream has to
   learn about it. */
function itemFromKey(key, opts){
  let it = rawItem(key);
  if(opts && opts.variant === "missing") it = missingItem(it);
  if(!it.input)  it.input  = "pad";
  if(!it.maxLen) it.maxLen = 3;
  if(!it.check)  it.check  = defaultCheck(it.answer);
  return it;
}
/* Whether what was typed is the answer, for a family that has not said
   so itself. An answer written into more than one box is more than one
   value, so it arrives as an array and every value is compared on its
   own. Squashing the two into a single number, the way a time is keyed
   as hours times a hundred plus minutes, would not do here: a quotient
   of 7 with a remainder of 1 and a quotient of 71 would come out the
   same, and a badly written answer would count as a badly worked out
   one. */
function defaultCheck(answer){
  if(!Array.isArray(answer)) return typed => parseInt(typed, 10) === answer;
  return typed => Array.isArray(typed) && typed.length === answer.length
    && answer.every((a, i) => parseInt(typed[i], 10) === a);
}
/* The missing operand, which is also how a sum is checked in an exercise
   book. "Work out 45 - 18, then check 27 + 18" and "▢ - 18 = 27" are the
   same question once the answer is typed on a keypad, so inverse_check
   folds in here rather than getting a shape of its own.

   The key does not change. `6 × 7` and `▢ × 7 = 42` are one fact in the
   Leitner box, one place in the collection and one tile in the parent
   heatmap, because they are one thing the child either knows or does
   not; a second key would be a second box for the same learning and it
   would start at level zero.

   Only a plain arithmetic line has a first operand to hide, so a dial, a
   rounded number, a conversion carrying a unit and a chain of three
   numbers are handed back untouched. That matters: a race built from a
   chapter runs the variant over its review questions too, and the review
   of a chapter about checking sums may well be a clock face. */
const MISSING_HEADS = "mapkxdsn";
function missingItem(it){
  if(!it || it.svg || it.rel || it.unit || !MISSING_HEADS.includes(it.key[0])) return it;
  const parts = /^(\d+) (.+)$/.exec(String(it.text));
  if(!parts) return it;
  const hidden = Number(parts[1]);
  return Object.assign({}, it, {
    // what is left of the line once the first number is gone, with the
    // result written out: the box takes the place of the number
    text: parts[2] + " " + relOf(it) + " " + it.answer,
    answer: hidden,
    layout: "lead",
    variant: "missing",
    ask: "missAsk",
    maxLen: Math.max(it.maxLen || 3, String(hidden).length)
  });
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
  if(head === "g") return tensItem(key);
  if(head === "r") return divremItem(key);
  if(head === "v") return splitItem(key);
  if(head === "j") return pickItem(key);
  if(head === "u") return unitItem(key);
  if(head === "o") return roundItem(key);
  if(head === "q") return chainItem(key);
  if(head === "z") return opsItem(key);
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

/* A key whose bucket the family does not have is a broken caller, not a
   question. Falling out of a chain of ifs into its last branch hands the
   child whatever that branch happens to make, under a key that promised
   something else, and nothing anywhere says a word. The chain of three
   numbers and the conversions already refuse out loud when a bucket
   cannot be served, so a bucket that does not exist at all says so too. */
function noBucket(where, key){ throw new Error(where + ": unknown bucket " + key); }

/* Ten, a hundred and the round tens. Built by construction like every
   family since the thousand: both numbers come out of ranges that
   already hold the bucket and the product, so nothing is ever trimmed
   back afterwards and a division can never be left with a remainder.
   The product never passes a thousand, which is the range the eighth
   part works in; the whole thousand is allowed, because 10 × 100 is one
   of the lines the chapter is actually about, and that is the one
   answer here that needs a fourth digit.
   A round number reads as easily in front as behind and the book writes
   it both ways, so which side it lands on is drawn too. */
function tensItem(key){
  const dir = key[1];                  // m multiplies, d reads it backwards
  const b = key.slice(2);
  if(dir !== "m" && dir !== "d") noBucket("tensItem", key);
  const times = dir === "m";
  let x, r;                            // the plain number and the round one
  if(b === "1"){
    // 23 × 10 and 4 × 100: the round number is the ten or the hundred
    // itself and the other one is as big as a thousand leaves room for
    if(Math.random() < .5){ r = 10;  x = ri(2, 99); }
    else                  { r = 100; x = ri(2, 10); }
  } else if(b === "2"){
    // 3 × 40: a fact from the small table with a nought put back on it
    r = ri(2, 9) * 10;
    x = ri(2, 9);
  } else noBucket("tensItem", key);
  if(times){
    const flip = Math.random() < .5;
    return {key, kind:"multten", maxLen:4,
            text:(flip ? r : x) + " × " + (flip ? x : r), answer: x * r};
  }
  /* Dividing by the round number is what the chapter is named after, so
     the first bucket only ever does that: 230 : 23 would be dividing by
     a two digit number, which nothing has taught yet. The second bucket
     may go either way, because both halves of 3 × 40 are things the
     child can divide by, and reading it back as 120 : 3 is where the
     round answer comes from. */
  const byRound = b === "1" || Math.random() < .5;
  return {key, kind:"divten", maxLen:4,
          text:(x * r) + " : " + (byRound ? r : x), answer: byRound ? x : r};
}

/* Dividing with something left over, the first question answered in two
   boxes. The quotient and the remainder are two numbers and are kept as
   two: squashed into one they could not tell a badly written answer from
   a badly worked out one, which is the whole reason `pad2` exists.
   Built by construction like every family since the thousand, and the
   other way round from how the question reads. The quotient is drawn
   first and what is left over second, out of a range that cannot reach
   the divisor, and the dividend is then worked out from the two. The
   remainder is therefore smaller than the divisor because there is
   nowhere else for it to be, rather than because an overflow was trimmed
   back afterwards, and a bucket or a divisor the family does not have
   says so out loud instead of handing back a made up example.
   The quotient goes up to ten, which is as far as the workbook marks the
   multiples of the divisor on its number line, so the dividend stays
   inside what the child can already count.

   How often it comes out even is a decision, not an accident, and the
   workbook teaches both, so neither can be left out. Drawing the
   remainder evenly from nought upwards would make one division in two
   come out even when dividing by two and one in ten when dividing by
   ten, so every bucket would teach a different lesson. It is a fixed one
   in five instead, the same in all of them: often enough that "nothing
   is left over" stays a real answer the child has to notice and write a
   nought for, rare enough that what is left over is still what the
   chapter is about. */
const DIVREM_EVEN = .2;
function divremItem(key){
  const d = Number(key.slice(1));
  if(!R_BUCKETS.some(b => b.div.includes(d))) noBucket("divremItem", key);
  const q = ri(1, 10);
  const r = Math.random() < DIVREM_EVEN ? 0 : ri(1, d - 1);
  return {
    key, kind:"divrem", divisor: d,
    text:(q * d + r) + " : " + d,
    answer:[q, r],
    input:"pad2",
    // the quotient reaches ten, what is left over never reaches ten
    maxLen:[2, 1],
    /* The words between and after the boxes, finished text on the item
       for the same reason the unit is: the language does not change in
       the middle of a race. What the two boxes are for is said in words
       above the keypad, so the short form in the row never has to be
       guessed at. */
    sep: t("divremSep"), tail: t("divremTail"), ask:"divremAsk"
  };
}

/* Splitting a number into what each of its places is worth, the row the
   workbook writes: "347 = 300 + 40 + 7". Why this way round and not the
   other, and why the digits are never noughts, is written above
   `V_BUCKETS`.

   Built by construction like every family since the thousand: each
   place the bucket asks for is drawn from one to nine and multiplied by
   what that place is worth, and the number in the question is what they
   come to. Nothing is worked out from a number and then trimmed, so the
   parts cannot fail to add up and a bucket the family does not have
   says so out loud.

   The plus sign between the boxes is the same character in all three
   languages, so unlike the words around a remainder it is written here
   rather than looked up; what the boxes mean is said in words above the
   keypad, where the language does belong. */
function splitItem(key){
  const b = V_BUCKETS.find(x => x.id === key.slice(1));
  if(!b) noBucket("splitItem", key);
  const parts = b.places.map(pl => ri(1, 9) * V_PLACE[pl]);
  return {
    key, kind:"split",
    text: String(parts.reduce((a, x) => a + x, 0)),
    answer: parts,
    // how many boxes the row has comes out of the material: two places
    // are answered in two boxes, three in three
    input: "pad" + parts.length,
    // a box is exactly as wide as the digits that go into it: three for
    // the hundreds, two for the tens, one for the ones
    maxLen: b.places.map(pl => String(V_PLACE[pl]).length),
    sep: "+", ask: "splitAsk" + b.id
  };
}

/* Choosing from what is offered: even or odd, and how many figures a
   number is written with. Why this family is a supplement inside the
   school track and nothing else is written above `J_BUCKETS`.

   HOW MANY BUTTONS, and it is a decision rather than a default. Even or
   odd gets two because the question has exactly two answers; a third
   would be a decoy, and a decoy teaches a child to shop around rather
   than to look at the number. How many figures gets three because the
   chapter names exactly three kinds of number. Nothing here ever offers
   a choice that is not a real answer to the question asked.

   HOW THE RIGHT ONE IS DRAWN. Which button is the right one is drawn
   first, evenly, and the number is then built to match it; the buttons
   themselves stand in the same order in the same place every time. So
   the position of the answer carries nothing: each button is the right
   one exactly one time in two, or one time in three, and no run of
   questions rewards a child who presses the same place twice. Shuffling
   the buttons instead would hide the answer just as well and would be
   worse twice over: the target would move under the thumb between two
   questions of the same race, and a surface that rearranges itself is a
   surface that looks like a draw. Nothing here is a draw. The points an
   answer is worth come from being right and from how long it took, the
   same as everywhere else in the game, so there is no prize attached to
   which button was pressed.

   Built by construction like every family since the thousand. For even
   and odd the first number of the wanted parity inside the bucket is
   stepped to, and the draw then goes in twos, so the parity is true
   because nothing else could come out. For how many figures the band of
   the drawn answer is what is drawn from. Nothing is worked out and
   then corrected, and an unknown bucket falls over out loud. */
function pickItem(key){
  const b = chosenBucket(key.slice(1));
  if(!b) noBucket("pickItem", key);
  if(b.kind === "cmpnum" || b.kind === "cmpunit") return cmpItem(key, b);
  if(b.kind === "parity"){
    const a = ri(0, 1);                                  // 0 even, 1 odd, drawn first
    const first = b.lo + ((b.lo % 2) === a ? 0 : 1);     // the first number in the bucket that is it
    return {
      key, kind:"parity", input:"pick",
      text: String(first + 2 * ri(0, Math.floor((b.hi - first) / 2))),
      answer: a,
      // the words on the buttons, finished text on the item like every
      // other word a question carries: the language does not change in
      // the middle of a race
      opts: [t("pickEven"), t("pickOdd")],
      // the line reads "47 je ▢", so what stands between the number and
      // the answer is a word rather than an equals sign
      rel: "pickIs", ask: "parityAsk"
    };
  }
  const a = ri(0, b.upto - 1);                           // how many figures, drawn first
  const lo = a ? Math.pow(10, a) : 1, hi = Math.pow(10, a + 1) - 1;
  return {
    key, kind:"digits", input:"pick",
    text: String(ri(lo, hi)),
    answer: a,
    opts: [t("pickFig1"), t("pickFig2"), t("pickFig3")].slice(0, b.upto),
    rel: "pickHas", ask: "digitsAsk"
  };
}

/* Two numbers with the same number of figures, identical down to the
   place where they first differ. Which place that is is drawn evenly, so
   the easy comparison decided by the first figure and the hard one
   decided by the last turn up as often as each other, and the figures
   after it are free. Built by construction: the two numbers are written
   figure by figure towards the answer that was drawn, so nothing is
   worked out and then corrected.
   Both numbers are the same length on purpose. A two figure number
   against a three figure one is settled by counting the figures, which
   is the chapter before this one; this chapter is about the places, so
   the question has to be one the places decide. */
function cmpNumbers(b, eq, leftBigger){
  const d = b.digits;
  const anyDigit = first => ri(first ? 1 : 0, 9);
  if(eq){
    const n = Number(Array.from({length: d}, (_, i) => anyDigit(!i)).join(""));
    return [n, n];
  }
  const at = ri(0, d - 1);                       // where they first differ
  const hi = [], lo = [];
  for(let i = 0; i < d; i++){
    const first = !i;
    if(i < at){ const same = anyDigit(first); hi.push(same); lo.push(same); }
    else if(i === at){
      const up = ri(first ? 2 : 1, 9);           // the bigger figure at that place
      hi.push(up); lo.push(ri(first ? 1 : 0, up - 1));
    } else { hi.push(anyDigit(false)); lo.push(anyDigit(false)); }
  }
  const more = Number(hi.join("")), less = Number(lo.join(""));
  return leftBigger ? [more, less] : [less, more];
}
/* Two quantities of the same kind in different units, which is a
   conversion before it is a comparison. Built by construction and in
   this order: how many of the bigger unit, then how many of the smaller
   one out of the window that already holds the answer drawn for it.
   Which side wears the bigger unit is drawn on its own, so the unit
   never says which side wins; without that the child would read the
   labels instead of converting, and half of the questions would be free.
   The two sides stay within one of the bigger unit of each other, which
   is what the book prints and what makes the question worth the work:
   "3 m" against "280 cm" is a comparison, "3 m" against "12 cm" is not.
   Both numbers stay inside a thousand, the range the third year counts
   in, and a bucket that cannot serve the answer drawn for it falls over
   with its name rather than quietly handing back something else. */
function cmpUnits(b, eq, leftBigger){
  const pair = b.pairs[ri(0, b.pairs.length - 1)];
  const big = pair[0], small = pair[1], f = pair[2];
  const top = Math.min(20, Math.floor(1000 / f));      // the ceiling a conversion uses
  if(top < 1) throw new Error("cmp bucket " + b.id + ": " + big + " does not fit into " + small);
  const bigLeft = Math.random() < .5;
  let v, w;
  if(eq){ v = ri(1, top); w = v * f; }
  else if(bigLeft === leftBigger){                     // the bigger unit is on the winning side
    v = ri(1, top);
    w = ri(Math.max(1, v * f - f + 1), v * f - 1);
  } else {                                             // and here it is not
    const vMax = Math.min(top, Math.floor(999 / f));
    if(vMax < 1) throw new Error("cmp bucket " + b.id + ": " + small + " cannot pass " + big + " inside a thousand");
    v = ri(1, vMax);
    w = ri(v * f + 1, Math.min(1000, v * f + f));
  }
  const inBig = v + " " + unitLabel(big, v), inSmall = w + " " + unitLabel(small, w);
  // and the same two sides once they are in the same unit, which is what
  // a wrong answer is told, because that is where the work was
  const bigAsSmall = (v * f) + " " + unitLabel(small, v * f);
  return {
    left:  bigLeft ? inBig : inSmall,
    right: bigLeft ? inSmall : inBig,
    same:  bigLeft ? [bigAsSmall, inSmall] : [inSmall, bigAsSmall]
  };
}
/* Which of two is more. The answer is one of three signs and the sign
   stands between the two sides, so the row is the fourth shape
   `questionHTML()` draws: side, box, side. Everything else is the family
   above: the same input element with different labels on the buttons,
   the same single box filling with what was chosen, the same `answer` as
   an index. Three ways to the same thing would have been two too many.
   The answer is drawn first and the two sides are built to it, exactly
   as even and odd is; the signs then stand in the same order in the same
   place every time, so nothing moves under the child's thumb and the
   position of a button carries nothing beyond the share written at
   `CMP_EQUAL`. */
function cmpItem(key, b){
  const eq = Math.random() < CMP_EQUAL;
  const leftBigger = !eq && Math.random() < .5;
  const shared = {
    key, input: "pick", layout: "mid",
    // 0 is less, 1 is the same, 2 is more, in the order they stand in
    answer: eq ? 1 : leftBigger ? 2 : 0,
    // the signs are finished text on the item like every other word a
    // question carries, and they go through the dictionary even though
    // all three languages write them the same today: the rounding sign
    // is the proof that a sign a child knows from class is not the same
    // everywhere, and a language that writes one of these differently
    // then has somewhere to say so
    opts: [t("cmpLt"), t("cmpEq"), t("cmpGt")]
  };
  if(b.kind === "cmpnum"){
    const [l, r] = cmpNumbers(b, eq, leftBigger);
    return Object.assign({kind:"cmpnum", text: String(l), tail: String(r), ask:"cmpAsk"}, shared);
  }
  const s = cmpUnits(b, eq, leftBigger);
  return Object.assign({kind:"cmpunit", text: s.left, tail: s.right, same: s.same,
    ask:"cmpUnitAsk"}, shared);
}

/* Converting units, the first question whose answer wears a unit. The
   line reads "3 m = ? cm": the value with its unit is the question, the
   unit of the answer stands after the answer box, and above the keypad
   `ask` says in words what to do with it. The unit is one more thing
   the item says about itself, exactly like the sign of a rounding
   question; nothing outside here has to know that units exist.
   Built by construction, like the thousand and the chain: the count of
   the bigger unit is drawn from a range that cannot produce anything
   but a whole number, and both the number in the question and the
   answer stay inside a thousand, which is the range a third year
   counts in. Twenty of the bigger unit is the ceiling on top of that,
   so a week never turns into a hundred and forty two days.
   A range that cannot be drawn from throws, bucket named: a made up
   fallback conversion would go on handing the child something the
   bucket never promised without a word. */
function unitItem(key){
  const b = U_BUCKETS.find(x => x.id === key.slice(1)) || U_BUCKETS[0];
  const pair = b.pairs[ri(0, b.pairs.length - 1)];
  const big = pair[0], small = pair[1], f = pair[2];
  const top = Math.min(20, Math.floor(1000 / f));
  if(top < 1) throw new Error("unit bucket " + b.id + ": " + big + " does not fit into " + small);
  const v = ri(1, top);
  /* Both ways round from the same pair. The label of the answer agrees
     with the answer, which is known here; the one in the instruction is
     the plain plural, because "convert into five days" is not what the
     instruction says whatever the number turns out to be. */
  if(Math.random() < .5) return {
    key, kind:"unit", maxLen:4, answer: v * f,
    text: v + " " + unitLabel(big, v), unit: unitLabel(small, v * f),
    ask:"unitAsk", askArgs:[unitLabel(small, 2)]
  };
  return {
    key, kind:"unit", maxLen:4, answer: v,
    text: (v * f) + " " + unitLabel(small, v * f), unit: unitLabel(big, v),
    ask:"unitAsk", askArgs:[unitLabel(big, 2)]
  };
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

/* Which operation goes first. Every line here is built by construction:
   the multiplying or dividing half is drawn first, and the number it is
   joined to comes out of a range that already holds the bucket, so
   nothing is trimmed afterwards, no step falls below zero and no draw
   has to be thrown away and repeated.
   Only the last two buckets can answer in four digits, so only they say
   so; the first two live under a hundred. */
function opsItem(key){
  const b = key.slice(1);
  const e = b === "1" ? opsPlain(100)
          : b === "2" ? opsBracket()
          : b === "3" ? opsPlain(1000)
          : b === "4" ? opsBracketPair()
          : noBucket("opsItem", key);
  const it = {key, kind:"ops", text: e.text, answer: e.answer};
  if(b === "3" || b === "4") it.maxLen = 4;
  return it;
}
/* One multiplication or division out of the small times table, worth at
   most `cap`. Dividing is the same fact read backwards, so it is built
   from the quotient and the divisor and can never leave a remainder.
   Neither half is ever times one: a child gains nothing from 7 × 1 and
   the line would stop being about the order at all. */
function opsFact(cap){
  if(Math.random() < .5){
    const x = ri(2, Math.min(10, Math.floor(cap / 2)));
    const y = ri(2, Math.min(10, Math.floor(cap / x)));
    return {text: x + " × " + y, value: x * y};
  }
  const q = ri(2, Math.min(10, cap));
  const d = ri(2, 10);
  return {text: (q * d) + " : " + d, value: q};
}
/* A line without brackets: a plain number and a table fact, in either
   order. Within a hundred the plain number is anything that leaves room
   for the fact; within a thousand it is a whole ten in the hundreds and
   leads the line, which is how the eighth part writes these. */
function opsPlain(top){
  const f = opsFact(top === 100 ? 90 : 100);
  const v = f.value;
  if(top === 100){
    switch(ri(0, 3)){
      case 0:  { const a = ri(1, 100 - v); return {text: a + " + " + f.text, answer: a + v}; }
      case 1:  { const a = ri(1, 100 - v); return {text: f.text + " + " + a, answer: v + a}; }
      case 2:  { const a = ri(v, 100);     return {text: a + " - " + f.text, answer: a - v}; }
      default: { const a = ri(1, v);       return {text: f.text + " - " + a, answer: v - a}; }
    }
  }
  if(Math.random() < .5){
    const a = ri(10, Math.floor((1000 - v) / 10)) * 10;
    return {text: a + " + " + f.text, answer: a + v};
  }
  const a = ri(Math.max(10, Math.ceil(v / 10)), 90) * 10;
  return {text: a + " - " + f.text, answer: a - v};
}
/* A line whose brackets are done first and then multiplied or divided,
   all of it inside a hundred. The value inside the brackets is drawn
   before it is split into two terms, because it is that value the outer
   operation has to afford: a sum of ten can be multiplied by anything up
   to ten, and a bracket that is to be divided has to be a multiple of
   the divisor. */
function opsBracket(){
  const minus = Math.random() < .5;
  let s, tail, answer;
  if(Math.random() < .5){                     // (a ± b) : c, always even
    const q = ri(2, 10);
    const d = ri(2, Math.min(10, Math.floor((minus ? 90 : 100) / q)));
    s = q * d; tail = " : " + d; answer = q;
  } else {                                    // (a ± b) × c, inside the table
    s = ri(2, 10);
    const c = ri(2, Math.min(10, Math.floor(100 / s)));
    tail = " × " + c; answer = s * c;
  }
  if(minus){
    // The bracket is a subtraction, so the first term is the value plus
    // whatever is taken away again, and both of them are drawn inside
    // the hundred this bucket counts in; a minus bucket holds the value
    // under ninety so that there is always room left for the second
    // term. What is taken away used to be a single digit, which quietly
    // ruled out every line like (45 - 17) : 4, and the narrowing was
    // written down nowhere. Widening it costs nothing: the value of the
    // bracket is settled above, so the answer is the same however the
    // two terms are chosen and the division is still exact.
    const b = ri(1, 99 - s);
    return {text: "(" + (s + b) + " - " + b + ")" + tail, answer};
  }
  const a = ri(1, s - 1);
  return {text: "(" + a + " + " + (s - a) + ")" + tail, answer};
}
/* Brackets inside a thousand. Here they stand in front of an adding or
   taking away, because with the table as the ceiling an outer × or :
   could never reach past a hundred, and a bracket that changes nothing
   teaches nothing: read left to right, both of these lines come out
   differently, which is exactly what the child is being asked to
   notice. */
function opsBracketPair(){
  if(Math.random() < .5){
    const b = ri(11, 89), c = ri(11, 89);
    const a = ri(Math.max(10, Math.ceil((b + c) / 10)), 90) * 10;
    return {text: a + " - (" + b + " + " + c + ")", answer: a - b - c};
  }
  const b = ri(21, 89), c = ri(11, b - 10);
  const a = ri(10, 90) * 10;
  return {text: a + " - (" + b + " - " + c + ")", answer: a - (b - c)};
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
/* The ceiling on questions answered by choosing, applied to a finished
   race rather than written into the draw: the keys can arrive as the
   chapter's own material and as review of an earlier chapter at once,
   so counting them once at the end is the only place that sees all of
   them. Whatever is over the line is replaced by material that is
   written rather than chosen: the chapter's own if it has any, so that
   the hard mode stays inside the chapter wherever it still can, and
   only otherwise the chapters the class has already been through.
   `spare` empty would mean a curriculum whose first playable chapter is
   made of nothing but choosing, with nothing behind it to fall back on.
   No book here has one, and the circuit in items.test.js measures every
   chapter of every curriculum that offers choosing, so the day one
   appears the test says so rather than the child racing a guess. */
function capChosen(p, keys, focus, earlier, n){
  const max = Math.floor(n * PICK_MAX_SHARE);
  const at = [];
  for(let i = 0; i < keys.length; i++) if(isPickKey(keys[i])) at.push(i);
  if(at.length <= max) return keys;
  const mine = focus.filter(k => !isPickKey(k));
  const spare = mine.length ? mine : [...new Set(earlier)].filter(k => !isPickKey(k));
  if(!spare.length) return keys;
  const need = at.length - max;
  const fill = sampleKeys(p, spare, need, 2);
  for(let i = 0; i < need && i < fill.length; i++) keys[at[at.length - 1 - i]] = fill[i];
  return keys;
}
function buildRun(p, tr){
  const n = p.qCount || 20;
  let keys;
  // a chapter may ask for its material in a different shape; no track of
  // its own does, so the championship and the trouble spots never see one
  let opts = null;
  if(tr.op === "school"){
    // The chapter sets the focus. In the soft mode the rest of the race
    // still comes from earlier chapters, because dropping spaced review
    // would break the strongest part of the design.
    // This is also the one branch a question answered by choosing may
    // ever arrive in, whether as the focus of the chapter it belongs to
    // or as review of it from a later chapter; see `J_BUCKETS` and the
    // line at the end of this function.
    const focus = schoolPool(p);
    const cur = curriculumById(p.curriculum);
    const ch = chapterOf(p);
    if(ch && ch.pool && ch.pool.variant) opts = {variant: ch.pool.variant};
    // what the class has already been through, gathered whichever mode
    // is set: the hard mode does not review, but the cap below still
    // needs somewhere to take the rest of the race from
    const earlier = [];
    if(cur) for(const prev of cur.chapters){
      if(prev.n >= p.chapter) break;
      earlier.push(...poolKeys(prev.pool));
    }
    if((p.chapterMode || "soft") === "hard" || !cur || !focus.length){
      keys = sampleKeys(p, focus, n, 6);
    } else {
      keys = focusAndReview(p, focus, earlier, n, 6);
    }
    // and then the one thing neither branch can be trusted with, in
    // both modes alike; see PICK_MAX_SHARE
    keys = capChosen(p, keys, focus, earlier, n);
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
  } else if(tr.op === "tens"){
    const gi = tensStage(p);
    const review = tensKeys(G_BUCKETS.slice(0, gi).map(b => b.id));
    keys = focusAndReview(p, tensKeys([G_BUCKETS[gi].id]), review, n, 2);
  } else if(tr.op === "units"){
    const ui = unitsStage(p);
    const review = unitKeys(U_BUCKETS.slice(0, ui).map(b => b.id));
    keys = focusAndReview(p, unitKeys([U_BUCKETS[ui].id]), review, n, 2);
  } else if(tr.op === "divrem"){
    const ri2 = divremStage(p);
    const review = divremKeys(R_BUCKETS.slice(0, ri2).map(b => b.id));
    keys = focusAndReview(p, divremKeys([R_BUCKETS[ri2].id]), review, n, 2);
  } else if(tr.op === "split"){
    const vi = splitStage(p);
    const review = splitKeys(V_BUCKETS.slice(0, vi).map(b => b.id));
    keys = focusAndReview(p, splitKeys([V_BUCKETS[vi].id]), review, n, 2);
  } else if(tr.op === "round"){
    const oi = roundStage(p);
    const review = roundKeys(O_BUCKETS.slice(0, oi).map(b => b.id));
    keys = focusAndReview(p, roundKeys([O_BUCKETS[oi].id]), review, n, 2);
  } else if(tr.op === "chain"){
    const qi = chainStage(p);
    const review = chainKeys(Q_BUCKETS.slice(0, qi).map(b => b.id));
    keys = focusAndReview(p, chainKeys([Q_BUCKETS[qi].id]), review, n, 2);
  } else if(tr.op === "ops"){
    const zi = opsStage(p);
    const review = opsKeys(Z_BUCKETS.slice(0, zi).map(b => b.id));
    keys = focusAndReview(p, opsKeys([Z_BUCKETS[zi].id]), review, n, 2);
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
    // the school track is one of the tracks gathered above and its pool
    // is the chapter's, so this is where a question answered by
    // choosing would walk into the championship; it does not
    keys = sampleKeys(p, [...new Set(all)].filter(k => !isPickKey(k)), n, 3);
  } else { // weak
    // workshop tasks live in the same box but are not race questions,
    // and neither is anything answered by choosing: it has no track, so
    // the box it leaves behind must not be the back door it returns by
    const seen = Object.keys(p.facts).filter(k => p.facts[k].reps > 0 && !isJobKey(k) && !isPickKey(k));
    seen.sort((x,y) => (p.facts[x].lv - p.facts[y].lv) || (p.facts[y].bad - p.facts[x].bad));
    const worst = seen.slice(0, Math.max(8, Math.round(seen.length * .35)));
    keys = sampleKeys(p, worst.length ? worst : seen, n, 0);
  }
  if(!keys || !keys.length) keys = sampleKeys(p, multFactsFor([1,2,5,10]).map(f => mk(f.a,f.b)), n, 5);
  /* The boundary of the one family that is recognising rather than
     recalling, held here rather than trusted to the branches above. It
     is kept out where it could get in, the championship gathering the
     school track's pool and the trouble spots gathering the box, and
     this line says so out loud if a new track or a new branch ever
     forgets. Nothing can reach it today, which is the point: a quiet
     filter here would hide the day something does. */
  if(tr.op !== "school" && keys.some(isPickKey)){
    throw new Error("buildRun: " + tr.id + " reached a question answered by choosing");
  }
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
  const out = keys.slice(0, n).map(k => itemFromKey(k, opts));
  // a bucket key is a whole family, so two neighbours drawn from the
  // same bucket can still come out as the very same question; reroll
  // rather than ask it twice in a row
  // the unit belongs to the face of the question as much as the number
  // does: "1 l" into decilitres and "1 l" into millilitres are two
  // questions, and without it one of them would be rerolled as a repeat
  const face = it => (it.disp || it.text) + (it.unit ? " " + it.unit : "");
  for(let i = 1; i < out.length; i++){
    for(let g = 0; g < 8 && face(out[i]) === face(out[i-1]); g++) out[i] = itemFromKey(out[i].key, opts);
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
   because the work is the counting, not the recalling.
   Word problems are the third year's job for the same reason one step
   up: the work is reading the sentence and deciding what to do with it,
   and a race would pay for deciding that quickly. */
const JOBS = [
  {id:"count", keys:["wc1","wc2","wc3"], n:6, grade:1},
  {id:"money", keys:["wm1","wm2","wm3"], n:6, grade:2},
  {id:"words", keys:["ww1","ww2","ww3"], n:6, grade:3}
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
/* --- word problems, the third year's job ---
   The first piece of work where what is generated is a sentence and not
   a number, and the reason it is here rather than on a track: the work
   in a word problem is reading it carefully, once, and a stopwatch over
   that teaches a child to guess the operation from the numbers. The
   answer is written on the number pad all the same, because the answer
   really is one number; the pad is borrowed as a drawing, not the race's
   handling of it. See jobKey().

   THE THINGS THE SENTENCES TALK ABOUT.
   Each is three forms in the dictionary, "one | two to four | five and
   more", read by the same pickForm() the spoken units of time use.
   Czech and German need it, English repeats its plural. Everything else
   in a template is written so that it cannot move with a number: a
   count is never below two (so no singular is ever asked for), and the
   boxes the things go into stand in a case that does not change with
   the count - Czech "do {n} krabic" is genitive whatever n is, German
   plural after "in", "auf" and a bare accusative is the same word from
   two upwards. Every one of them is a thing rather than a creature,
   because a Czech animate noun changes in the accusative and half these
   sentences would break on it. */
const W_THINGS = ["apple", "marble", "sticker", "crayon", "chestnut", "screw", "cookie", "card"];
const thingLabel = (id, n) => pickForm("ww_" + id, n);
/* The words handed to a template. Three patterns, because a sentence
   either counts the same thing twice, or counts it once and counts
   boxes, or counts it three times. The last argument of each is always
   the form the question itself needs ("how many apples"), which in
   Czech is the five-and-more one. Resolved here rather than at drawing
   time, exactly like the unit a race question wears: the language does
   not change in the middle of a piece of work. */
const wordsPair  = (n, th) => [n[0], thingLabel(th, n[0]), n[1], thingLabel(th, n[1]), thingLabel(th, 5)];
const wordsGroup = (n, th) => [n[0], thingLabel(th, n[0]), n[1], thingLabel(th, 5)];
const wordsThree = (n, th) => [n[0], thingLabel(th, n[0]), n[1], thingLabel(th, n[1]),
                               n[2], thingLabel(th, n[2]), thingLabel(th, 5)];
const wordsGroupPlus = (n, th) => [n[0], thingLabel(th, n[0]), n[1], n[2], thingLabel(th, n[2]),
                                   thingLabel(th, 5)];
/* One shape of story. `gen` draws the numbers **in the order the
   sentence says them**, so what the child reads and what the answer is
   worked out from are the same list; `nounAt` says which of them carry
   the thing, and `calc` is the line those numbers make, which is what
   the result screen shows and what the test evaluates against the
   answer. Every shape builds its numbers so that the situation it
   describes cannot come out wrong: nothing is ever given away that is
   not there, nothing is shared out that does not divide, and "how many
   fewer" is a different shape from "how many more" rather than the same
   one with a sign. */
const W_SHAPES = {
  add: {ask:"wwAdd", args:wordsPair, nounAt:[0,1],
    gen(){ const a = ri(2, 60); return [a, ri(2, Math.min(40, 100 - a))]; },
    solve: n => n[0] + n[1], calc: n => n[0] + " + " + n[1]},
  sub: {ask:"wwSub", args:wordsPair, nounAt:[0,1],
    gen(){ const a = ri(8, 99); return [a, ri(2, a - 2)]; },
    solve: n => n[0] - n[1], calc: n => n[0] + " - " + n[1]},
  times: {ask:"wwTimes", args:wordsGroup, nounAt:[0],
    gen(){ return [ri(2, 9), ri(2, 9)]; },
    solve: n => n[0] * n[1], calc: n => n[0] + " × " + n[1]},
  share: {ask:"wwShare", args:wordsGroup, nounAt:[0],
    gen(){ const k = ri(2, 9); return [k * ri(2, 9), k]; },
    solve: n => n[0] / n[1], calc: n => n[0] + " : " + n[1]},

  addsub: {ask:"wwAddSub", args:wordsThree, nounAt:[0,1,2],
    gen(){ const a = ri(5, 50), b = ri(2, Math.min(45, 100 - a)); return [a, b, ri(2, a + b - 2)]; },
    solve: n => n[0] + n[1] - n[2], calc: n => n[0] + " + " + n[1] + " - " + n[2]},
  subsub: {ask:"wwSubSub", args:wordsThree, nounAt:[0,1,2],
    gen(){ const a = ri(10, 99), b = ri(2, a - 4); return [a, b, ri(2, a - b - 2)]; },
    solve: n => n[0] - n[1] - n[2], calc: n => n[0] + " - " + n[1] + " - " + n[2]},
  timesadd: {ask:"wwTimesAdd", args:wordsGroupPlus, nounAt:[0,2],
    gen(){ const b = ri(2, 9), k = ri(2, 9); return [b, k, ri(2, Math.min(20, 100 - b * k))]; },
    solve: n => n[0] * n[1] + n[2], calc: n => n[0] + " × " + n[1] + " + " + n[2]},
  timessub: {ask:"wwTimesSub", args:wordsGroupPlus, nounAt:[0,2],
    gen(){ const b = ri(2, 9), k = ri(2, 9); return [b, k, ri(2, b * k - 2)]; },
    solve: n => n[0] * n[1] - n[2], calc: n => n[0] + " × " + n[1] + " - " + n[2]},

  /* "By how much" and "how many times", which is where a third year
     goes wrong most often. Four shapes rather than two with a flag: the
     sentence that asks how many fewer are in the blue box is only ever
     built when there really are fewer in it, so no draw of the numbers
     can ask a question whose answer would be below zero. */
  diffMore: {ask:"wwDiffMore", args:wordsPair, nounAt:[0,1],
    gen(){ const b = ri(2, 97); return [ri(b + 1, 99), b]; },
    solve: n => n[0] - n[1], calc: n => n[0] + " - " + n[1]},
  diffLess: {ask:"wwDiffLess", args:wordsPair, nounAt:[0,1],
    gen(){ const a = ri(2, 97); return [a, ri(a + 1, 99)]; },
    solve: n => n[1] - n[0], calc: n => n[1] + " - " + n[0]},
  timesBlue: {ask:"wwTimesBlue", args:wordsPair, nounAt:[0,1],
    gen(){ const k = ri(2, 9), s = ri(2, Math.floor(99 / k)); return [k * s, s]; },
    solve: n => n[0] / n[1], calc: n => n[0] + " : " + n[1]},
  timesRed: {ask:"wwTimesRed", args:wordsPair, nounAt:[0,1],
    gen(){ const k = ri(2, 9), s = ri(2, Math.floor(99 / k)); return [s, k * s]; },
    solve: n => n[1] / n[0], calc: n => n[1] + " : " + n[0]}
};
/* Three steps: one operation within a hundred, two operations, and the
   two comparing questions. */
const W_STEPS = {
  ww1: ["add", "sub", "times", "share"],
  ww2: ["addsub", "subsub", "timesadd", "timessub"],
  ww3: ["diffMore", "diffLess", "timesBlue", "timesRed"]
};
function wordItem(key){
  const step = W_STEPS[key] || W_STEPS.ww1;
  const id = step[ri(0, step.length - 1)];
  const sh = W_SHAPES[id];
  const thing = W_THINGS[ri(0, W_THINGS.length - 1)];
  const nums = sh.gen();
  const answer = sh.solve(nums);
  return {
    key, kind:"word", input:"pad", maxLen:3,
    shape:id, nums, thing, answer, calc: sh.calc(nums),
    ask: sh.ask, askArgs: sh.args(nums, thing),
    missMsg:"jobWordMiss",
    solution:[answer],
    // what was typed rather than a handful of coins, so the workshop's
    // own key handler fills it; see jobKey()
    check: typed => String(typed).length > 0 && +typed === answer
  };
}
function jobItemFromKey(key){
  return key[1] === "c" ? countItem(key) : key[1] === "w" ? wordItem(key) : moneyItem(key);
}
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
/* One place per fact, and a fact gets one only when there is a
   collection it belongs to. Every collection is sized from a track;
   choosing from what is offered has no track on purpose, so it has no
   collection either, and a place that lit up where nothing can be
   looked at would leave the count on the result screen promising more
   than the Treasures ever show. This is the one gate that lights a
   place, so it is also the one that can withhold one. */
function lightStar(p, key){
  if(isPickKey(key)) return;
  (p.stars || (p.stars = {}))[key] = true;
}
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
  // deciding which half of the line goes first and then doing both of
  // them is the longest piece of thinking in the game so far, brackets
  // included, so it gets a little more room than a chain of plus and
  // minus does
  // putting a nought back is a rule rather than a piece of arithmetic,
  // so it needs a little longer than a plain fact and nowhere near as
  // long as splitting a number apart does
  // a conversion is read, decided and only then counted: the child has
  // to work out which way round the unit goes before a single number is
  // multiplied, which is longer than any one step of arithmetic here
  // sharing out with something left over is a table fact, then a take
  // away, and then two numbers keyed into two boxes with a hop between
  // them, so it needs as much room as deciding which half of a line goes
  // first: two steps of thinking and more keying than anything else here
  // splitting a number apart is a rule rather than a piece of arithmetic,
  // like putting a nought back, but it is written into up to three boxes
  // with a hop between each pair, so the keying is what the allowance is
  // mostly for
  // reading a number and saying what kind it is takes longer than
  // recalling a fact, because the number has to be read before the rule
  // is applied, and far less than anything written down: the answer is
  // one press and there is nothing to key in at all
  // comparing two numbers is reading two of them instead of one before
  // the rule is applied, and still one press at the end of it; comparing
  // two quantities is a conversion first and gets what a conversion
  // gets, because what it saves on keying it spends on the second side
  const slower = item.kind === "multx" || item.kind === "divx" ? 2.6
               : item.kind === "divrem" ? 2.4
               : item.kind === "split" ? 2.2
               : item.kind === "cmpnum" ? 1.6
               : item.kind === "cmpunit" ? 2.2
               : (item.kind === "parity" || item.kind === "digits") ? 1.4
               : item.kind === "unit" ? 2.2
               : item.kind === "multten" || item.kind === "divten" ? 1.8
               : item.kind === "ops" ? 2.4
               : item.kind === "chain" ? 2.0
               : item.kind === "round" ? 2.0
               : item.kind === "clock" ? 2.4
               : (item.kind === "add1000" || item.kind === "sub1000") ? 2.2
               : (item.kind === "add100" || item.kind === "sub100") ? 1.9 : 1;
  // a missing operand is the same fact read backwards, and reading it
  // backwards takes longer than recalling it forwards whatever the fact
  // is, so this multiplies the family allowance rather than replacing it
  const back = item.variant === "missing" ? 1.6 : 1;
  return { fast: s.fast * slower * back, super: s.super * slower * back };
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
/* Twenty-eight animals, and every one of them names the animal it is.
   `shape` points at its drawing in PET_SHAPES; the id, the price and the
   name never change, because a child's experience and savings hang off
   them, and neither do the two colours, because the animal was picked to
   match them. Two of them are deliberately not a species: Lupi and
   Hvězdík stay the creatures they already were, so nobody's friend turns
   into somebody else overnight.
   The list is in price order, cheapest first, and the sixteen added in
   step H7 are threaded into it rather than stacked behind it: the
   cheapest new animal costs less than half of what the dearest old one
   does, so the new row is a ramp a child can start climbing today
   instead of a wall at the end of the garage. Nothing here is drawn at
   random, every price is on show from the first minute, and no animal
   has any attribute but its drawing, so the rival is still your own
   best lap. */
const PETS = [
  {id:"pet_bimbo", shape:"dolphin",   c1:"#7ad3ff", c2:"#3ea8e0", cost:25},
  {id:"pet_lupi",  shape:"critter",   c1:"#ffd166", c2:"#e3a521", cost:30},
  {id:"pet_mecha", shape:"bear",      c1:"#c79b73", c2:"#9c7350", cost:30},
  {id:"pet_kocka", shape:"cat",       c1:"#ffb35c", c2:"#d9832a", cost:35},
  {id:"pet_kiki",  shape:"rabbit",    c1:"#ff9ec4", c2:"#e56d9d", cost:40},
  {id:"pet_zub",   shape:"croc",      c1:"#a4e768", c2:"#6fbb34", cost:40},
  {id:"pet_berus", shape:"ladybug",   c1:"#ff5b5b", c2:"#2b2b33", cost:45},
  {id:"pet_zaba",  shape:"frog",      c1:"#8ee83f", c2:"#4a9e1f", cost:55},
  {id:"pet_duha",  shape:"unicorn",   c1:"#d3a4ff", c2:"#9a6ae0", cost:60},
  {id:"pet_puk",   shape:"axolotl",   c1:"#8ee6d5", c2:"#4bb8a4", cost:60},
  {id:"pet_zelva", shape:"turtle",    c1:"#cfe08a", c2:"#a4713a", cost:65},
  {id:"pet_flek",  shape:"dog",       c1:"#ffb3a1", c2:"#e0705a", cost:70},
  {id:"pet_jezek", shape:"hedgehog",  c1:"#f0d3a8", c2:"#8a6a4a", cost:75},
  {id:"pet_sova",  shape:"owl",       c1:"#b9a4ff", c2:"#7d63d8", cost:80},
  {id:"pet_liska", shape:"fox",       c1:"#ff7a3c", c2:"#d9521c", cost:85},
  {id:"pet_tucnak",shape:"penguin",   c1:"#4a5a78", c2:"#2b3852", cost:95},
  {id:"pet_drak",  shape:"dragon",    c1:"#6fe0a8", c2:"#2ba36c", cost:100},
  {id:"pet_kapy",  shape:"capybara",  c1:"#b5764a", c2:"#8a5230", cost:105},
  {id:"pet_panda", shape:"panda",     c1:"#f2efe6", c2:"#3a3a44", cost:115},
  {id:"pet_hvezd", shape:"hornling",  c1:"#ffe17a", c2:"#e0ab1f", cost:120},
  {id:"pet_lenochod", shape:"sloth",  c1:"#c9b89a", c2:"#8c7a5e", cost:125},
  {id:"pet_slon",  shape:"elephant",  c1:"#b3bccd", c2:"#7d879b", cost:135},
  {id:"pet_noc",   shape:"bat",       c1:"#6d7cff", c2:"#3a44b8", cost:150},
  {id:"pet_lev",   shape:"lion",      c1:"#ffd07a", c2:"#d9902a", cost:150},
  {id:"pet_zralok",shape:"shark",     c1:"#9fb3c8", c2:"#5b7490", cost:165},
  {id:"pet_papous",shape:"parrot",    c1:"#4aa8ff", c2:"#ffc43f", cost:180},
  {id:"pet_chobot",shape:"octopus",   c1:"#ff7a6b", c2:"#d9443a", cost:190},
  {id:"pet_trex",  shape:"trex",      c1:"#f2a54a", c2:"#c26f22", cost:200}
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
/* The rubber duck is the seventh free starter and a third kind of racer:
   not a machine, so no paint goes on it, and not an animal, so it does
   not grow with experience. It is free because what a child is meant to
   collect here are the things that go on a duck, not the duck itself,
   and an entry that had to be raced for would put the whole of it behind
   the race. A rubber duck is a generic object, not a character; nothing
   drawn on it may ever become one. */
const DUCKS = [
  {id:"du_kacka", duck:true, c1:"#ffd23f", c2:"#e0a41f", cost:0}
];
/* --- what a duck wears ---
   The duck itself is free; what costs something is what goes on it, in
   layers. A layer holds one part and only one, so a profile stores
   `duck` as layer -> part id rather than a list: a duck cannot wear two
   bodies. What was paid for lands in `duckParts` and stays there for
   good, exactly like a paint: taking a part off means putting a
   different one on, never losing the one bought, and nothing sells a
   part back.
   Parts are paid for in workshop parts, never in coins. That is the
   whole answer to what parts are for once every paint is bought, and it
   is also why no part may ever be earned by racing.
   No part has any attribute but its drawing. A dressed duck races
   exactly like a bare one, and the rival is still your own best lap.
   There are five layers: the body, the pattern painted on it, what
   goes on the head, what goes over the eye and what the duck carries.
   Each is its own list with the same shape, and nothing rules any
   combination out: a space helmet over sunglasses is funny, and funny
   is fine. */
const BODY_LAYER = "body";
/* Ten bodies, cheapest first, because the first tile a child sees
   should be one they can afford. The classic yellow is free and is what
   an older profile sees without having chosen anything, so it carries
   no colours of its own: it borrows the duck's, and the classic yellow
   is written down in exactly one place.
   Optional fields, each used by one body or two, never scattered as
   special cases through the drawing:
     beak / beak2  the bill is orange because that is how a duck reads;
                   the pink duck from the photo is the one exception
     beakEdge      an outline for a body the orange bill sinks into
     belly         how strongly the pale underside shows through
     eyeRing       a pale patch behind the eye, for a dark body
     edge          an outline, for a body that would vanish on a white tile
     grad          a body that is not a flat colour at all */
const DUCK_BODY = [
  {id:"db_klasik",    cost:0},
  {id:"db_bila",      c1:"#fafcff", c2:"#c2cee0", cost:8,  edge:"#b4c2d8"},
  {id:"db_ruzova",    c1:"#ff9ec4", c2:"#e56d9d", cost:10, beak:"#ff4f96", beak2:"#d62f77"},
  {id:"db_mint",      c1:"#8ee6d5", c2:"#4bb8a4", cost:10},
  {id:"db_nebeska",   c1:"#7ad3ff", c2:"#3ea8e0", cost:12},
  {id:"db_limetka",   c1:"#a4e768", c2:"#6fbb34", cost:12},
  {id:"db_levandule", c1:"#c9a8ff", c2:"#8a63d8", cost:15},
  {id:"db_ohniva",    c1:"#ff7a3d", c2:"#c23a12", cost:15, beakEdge:"#8a3208"},
  {id:"db_uhel",      c1:"#3a4360", c2:"#1b2436", cost:18, belly:.45, eyeRing:"#f2f5ff"},
  // the only body that is not a flat colour; `c1` is what a renderer
  // without gradients falls back to, and the wing keeps a solid edge
  {id:"db_duhova",    c1:"#7ae582", c2:"#e0568a", cost:20,
   grad:["#ff6b6b", "#ffd166", "#7ae582", "#3ec1ff", "#c9a8ff"]}
];
/* --- what is painted on the duck ---
   A pattern goes over the body and the head and is cut to the two of
   them together, or the dots would fly off the duck into the air.
   Where every mark sits is a written down list and never a random
   draw: two ducks dressed the same have to look the same, this morning
   and tomorrow morning.
   Each pattern keeps its own colours and is given a hairline in
   whichever of near white and near black the body under it is not.
   That one line is what lets ten patterns work on ten bodies: without
   it pale marks disappear on the snow duck, dark ones on the coal duck,
   and the rainbow duck changes colour halfway through a mark.
   Marks go where skin shows. The belly, the wing and the bill are
   drawn after the pattern and cover whatever is underneath them, and
   so are the eye and whatever is on the head, so no pattern can ever
   end up on the face. */
const PAT_LAYER = "pat";
const DUCK_PAT = [
  // two colours of dot, so one of them stands out whatever the body is
  {id:"dp_puntiky", cost:6, draw:(g, rim) => {
    const B = g.B, H = g.H;
    const spots = [[B.x-24, B.y-7, 3.2], [B.x-12, B.y-14, 3.2], [B.x+1, B.y-17, 3.2],
                   [B.x+14, B.y-13, 3.2], [B.x+24, B.y-5, 3.2], [B.x+25, B.y+6, 3.2],
                   [B.x-22, B.y+5, 3.2], [B.x+13, B.y+13, 3.2],
                   [H.x-11, H.y-5, 2.6], [H.x-1, H.y-13, 2.6], [H.x-8, H.y+7, 2.6]];
    return spots.map((s, i) => `<circle cx="${g.n(s[0])}" cy="${g.n(s[1])}" r="${s[2]}"`
      + ` fill="${i % 2 ? "#fffdf2" : "#ff5d8f"}" stroke="${rim}" stroke-width=".7"/>`).join("");
  }},
  // sailor stripes: dark and pale in turn, so neither body can swallow
  // the whole pattern, and curved, because the body is
  {id:"dp_pruhy", cost:8, draw:(g) => {
    const B = g.B;
    return [-15, -7, 1, 9].map((dy, i) =>
      `<path d="M${g.n(B.x-B.rx)} ${g.n(B.y+dy)} Q ${B.x} ${g.n(B.y+dy-7)} ${g.n(B.x+B.rx)} ${g.n(B.y+dy)}"`
      + ` fill="none" stroke="${i % 2 ? "#fdfdff" : "#27407a"}" stroke-width="5.4" stroke-linecap="round"/>`).join("");
  }},
  // the chequered flag, two rows of it across the duck; black and white
  // next to each other read on every body there is
  {id:"dp_kostka", cost:8, draw:(g) => {
    const B = g.B, s = 7.6, out = [];
    for(let r = 0; r < 2; r++) for(let c = 0; c < 9; c++)
      out.push(`<rect x="${g.n(B.x-B.rx-1+c*s)}" y="${g.n(B.y-15+r*s)}" width="${s}" height="${s}"`
        + ` fill="${(r+c) % 2 ? "#f6f8ff" : "#23283a"}"/>`);
    return out.join("");
  }},
  {id:"dp_srdicka", cost:10, draw:(g, rim) => {
    const B = g.B, H = g.H;
    const spots = [[B.x-21, B.y-8, 4], [B.x-7, B.y-15, 4], [B.x+8, B.y-15, 4],
                   [B.x+22, B.y-6, 4], [B.x+24, B.y+6, 4], [B.x-20, B.y+6, 4],
                   [H.x-10, H.y-6, 3.2], [H.x-6, H.y+7, 3.2]];
    return spots.map((s, i) => `<path d="${heartPath(s[0], s[1], s[2])}"`
      + ` fill="${i % 2 ? "#fff0f5" : "#ff4f7d"}" stroke="${rim}" stroke-width=".7"/>`).join("");
  }},
  // a football shirt: bars down the duck with its own colour showing
  // between them, the way a team's colour does. No white bar, because a
  // white bar reaching the edge of a pale duck cuts the duck in half
  {id:"dp_dres", cost:12, draw:(g, rim) => {
    const B = g.B, out = [];
    for(let i = 0; i < 4; i++)
      out.push(`<rect x="${g.n(B.x-25+i*14)}" y="${g.n(B.y-B.ry-3)}" width="6.5" height="${g.n(B.ry*2+6)}"`
        + ` fill="#e8402a" stroke="${rim}" stroke-width=".7"/>`);
    return out.join("");
  }},
  // cream stars rather than gold ones: gold on the classic yellow duck
  // is a star nobody can see
  {id:"dp_hvezdicky", cost:12, draw:(g, rim) => {
    const B = g.B, H = g.H;
    const spots = [[B.x-22, B.y-8, 5], [B.x-7, B.y-16, 4.4], [B.x+9, B.y-15, 5],
                   [B.x+23, B.y-4, 4.4], [B.x+23, B.y+8, 5], [B.x-20, B.y+6, 4.4],
                   [H.x-10, H.y-6, 4], [H.x-5, H.y+7, 3.4]];
    return spots.map(s => `<polygon points="${starPts(s[0], s[1], s[2])}"`
      + ` fill="#fff8dc" stroke="${rim}" stroke-width=".8"/>`).join("");
  }},
  // a line has no room for a hairline inside it, so each wave is drawn
  // twice: the wider one underneath is the outline
  {id:"dp_vlnky", cost:12, draw:(g, rim) => {
    const B = g.B;
    const wave = dy => { let d = `M${g.n(B.x-B.rx)} ${g.n(B.y+dy)}`;
      for(let i = 0; i < 4; i++){ const x = B.x - B.rx + i * 16;
        d += ` Q ${g.n(x+4)} ${g.n(B.y+dy-5.5)} ${g.n(x+8)} ${g.n(B.y+dy)}`
           + ` Q ${g.n(x+12)} ${g.n(B.y+dy+5.5)} ${g.n(x+16)} ${g.n(B.y+dy)}`; }
      return d; };
    return [-14, -4, 6].map(dy => `<path d="${wave(dy)}" fill="none" stroke="${rim}" stroke-width="4.4" stroke-linecap="round"/>`
      + `<path d="${wave(dy)}" fill="none" stroke="#2f9fe0" stroke-width="2.6" stroke-linecap="round"/>`).join("");
  }},
  // camouflage is the one pattern that needs no hairline: three colours
  // of blob, none of them pale and none of them dark
  {id:"dp_maskac", cost:14, draw:(g) => {
    const B = g.B, H = g.H, C = ["#7d9b4e", "#47623a", "#cfc79a"];
    const blobs = [[B.x-22, B.y-8, 11, 8, 0], [B.x-4, B.y-14, 13, 7, 1], [B.x+16, B.y-9, 10, 8, 2],
                   [B.x+24, B.y+4, 9, 7, 0], [B.x+4, B.y+8, 12, 8, 2], [B.x-20, B.y+7, 10, 7, 1],
                   [H.x-8, H.y-8, 8, 6, 1], [H.x+6, H.y+2, 7, 6, 0], [H.x-9, H.y+6, 7, 5, 2]];
    return blobs.map(b => `<ellipse cx="${g.n(b[0])}" cy="${g.n(b[1])}" rx="${b[2]}" ry="${b[3]}" fill="${C[b[4]]}"/>`).join("");
  }},
  // three bands right round the duck, high enough that the belly does
  // not wash them out
  {id:"dp_pasy", cost:16, draw:(g) => {
    const B = g.B;
    return [[-21, "#ff5d3b"], [-12, "#fdfdff"], [-3, "#2f6fd0"]].map(b =>
      `<rect x="${g.n(B.x-B.rx-2)}" y="${g.n(B.y+b[0])}" width="${g.n(B.rx*2+4)}" height="9" fill="${b[1]}"/>`).join("");
  }},
  // land and islands, the way they sit on a globe: a green dark enough
  // to be land on a pale duck and light enough to be land on a dark one
  {id:"dp_mapa", cost:16, draw:(g, rim) => {
    const B = g.B, H = g.H;
    const land = [
      `M${g.n(B.x-24)} ${g.n(B.y-7)} Q ${g.n(B.x-21)} ${g.n(B.y-14)} ${g.n(B.x-14)} ${g.n(B.y-13)}`
      + ` Q ${g.n(B.x-9)} ${g.n(B.y-12)} ${g.n(B.x-12)} ${g.n(B.y-6)}`
      + ` Q ${g.n(B.x-14)} ${g.n(B.y-1)} ${g.n(B.x-19)} ${g.n(B.y-2)}`
      + ` Q ${g.n(B.x-23)} ${g.n(B.y-3)} ${g.n(B.x-24)} ${g.n(B.y-7)} Z`,
      `M${g.n(B.x+7)} ${g.n(B.y-14)} Q ${g.n(B.x+15)} ${g.n(B.y-17)} ${g.n(B.x+20)} ${g.n(B.y-11)}`
      + ` Q ${g.n(B.x+24)} ${g.n(B.y-5)} ${g.n(B.x+17)} ${g.n(B.y-3)}`
      + ` Q ${g.n(B.x+10)} ${g.n(B.y-2)} ${g.n(B.x+9)} ${g.n(B.y-8)}`
      + ` Q ${g.n(B.x+8)} ${g.n(B.y-11)} ${g.n(B.x+7)} ${g.n(B.y-14)} Z`,
      `M${g.n(H.x-13)} ${g.n(H.y-3)} Q ${g.n(H.x-10)} ${g.n(H.y-10)} ${g.n(H.x-4)} ${g.n(H.y-8)}`
      + ` Q ${g.n(H.x)} ${g.n(H.y-6)} ${g.n(H.x-5)} ${g.n(H.y-1)}`
      + ` Q ${g.n(H.x-10)} ${g.n(H.y+3)} ${g.n(H.x-13)} ${g.n(H.y-3)} Z`];
    return land.map(d => `<path d="${d}" fill="#3f9e63" stroke="${rim}" stroke-width=".8"/>`).join("")
      + [[B.x-3, B.y+6, 3.2, 2.2], [B.x+13, B.y+7, 2.4, 1.8], [B.x-22, B.y+5, 2.2, 1.7],
         [B.x+2, B.y-18, 2.6, 1.9], [H.x+3, H.y+5, 2.2, 1.7]].map(s =>
        `<ellipse cx="${g.n(s[0])}" cy="${g.n(s[1])}" rx="${s[2]}" ry="${s[3]}" fill="#3f9e63" stroke="${rim}" stroke-width=".7"/>`).join("");
  }}
];

/* --- what goes on the head ---
   Twenty things, and every one of them a thing: a hat, a band, a
   wreath, a helmet. Not one of them is a character, and none of them
   carries a badge, a word or a mascot; the question asked of every
   drawing here was whether a name could be put to it, and a part that
   has a name is the wrong part.
   All of them are built from the head anchor through `duckFit()`, so
   the day the head moves they move with it, and all of them stop at
   the brim line, because below the brim is the eye. The only one that
   covers anything is the space helmet, and it covers it through glass:
   it is drawn last and barely there, so the duck inside still shows. */
const HEAD_LAYER = "head";
const DUCK_HEAD = [
  // a sports band, worn high, with the crown of the head left showing
  // above it, or it would be a swimming cap
  {id:"dh_celenka", cost:6, draw:(g) =>
    `<path d="${g.band(g.brim-3.6, g.brim)}" fill="#ffffff" stroke="#8c9bb3" stroke-width="1.1"/>`
    + `<path d="${g.band(g.brim-2.4, g.brim-1.3)}" fill="#4a9ede"/>`},
  // the peak rises as it goes forward, the way a real one looks from
  // the side, which is also what keeps it off the eye
  {id:"dh_ksilt", cost:8, draw:(g) => { const w = g.wAt(g.brim, g.r+1.5);
    return `<path d="${g.dome(g.brim, g.r+1.5)}" fill="#2f6fd0"/>`
      + `<path d="M${g.n(g.x-3)} ${g.n(g.brim-4)} Q ${g.n(g.x+w+10)} ${g.n(g.brim-8)} ${g.n(g.x+w+7)} ${g.n(g.brim-1.5)}`
      + ` Q ${g.n(g.x+2)} ${g.n(g.brim)} ${g.n(g.x-3)} ${g.n(g.brim-4)} Z" fill="#1f4f97"/>`
      + `<circle cx="${g.x}" cy="${g.n(g.top+1.5)}" r="2.2" fill="#1f4f97"/>`; }},
  // a headscarf with a knot and two ends, tied at the back
  {id:"dh_satek", cost:8, draw:(g) => { const k = g.at(198, g.r-1);
    return `<path d="${g.dome(g.brim)}" fill="#d33a3a"/>`
      + `<path d="${leafPath(k[0], k[1], 165, 15, 3.2)}" fill="#b52b2b"/>`
      + `<path d="${leafPath(k[0], k[1], 205, 13, 2.8)}" fill="#c73434"/>`
      + `<circle cx="${k[0]}" cy="${k[1]}" r="3.6" fill="#d33a3a" stroke="#9b2222" stroke-width=".9"/>`; }},
  {id:"dh_rohy", cost:10, draw:(g) => [[-146, -112, -132], [-34, -68, -48]].map(a => {
    const b1 = g.at(a[0], g.r-1), b2 = g.at(a[1], g.r-1), tp = g.at(a[2], g.r+7);
    return `<path d="M${b1[0]} ${b1[1]} Q ${g.n(b1[0]+(tp[0]-b1[0])*.55)} ${g.n(tp[1]+3)} ${tp[0]} ${tp[1]}`
      + ` Q ${g.n(b2[0]+(tp[0]-b2[0])*.35)} ${g.n(b2[1]-4)} ${b2[0]} ${b2[1]} Z"`
      + ` fill="#f6e3bd" stroke="#c9a96b" stroke-width="1"/>`; }).join("")},
  // a band with ears on it, never ears on their own: the strip has to
  // show, or the duck has quietly turned into an animal
  {id:"dh_ousi", cost:10, draw:(g) => {
    return [-118, -62].map(a => { const c = g.at(a, g.r-1);
      return `<path d="${leafPath(c[0], c[1], a, 13, 4.6)}" fill="#fff1f6" stroke="#c9b3bf" stroke-width=".9"/>`
        + `<path d="${leafPath(g.n(c[0]+2*Math.cos(a*Math.PI/180)), g.n(c[1]+2*Math.sin(a*Math.PI/180)), a, 8, 2.6)}" fill="#ff9ec4"/>`; }).join("")
      + `<path d="${g.band(g.brim-2.6, g.brim)}" fill="#6c7ba8"/>`;
  }},
  {id:"dh_kuchar", cost:12, draw:(g) =>
    [[g.x-8, g.top-3, 8.5], [g.x+8, g.top-3, 8.5], [g.x, g.top-8, 10]].map(c =>
      `<circle cx="${g.n(c[0])}" cy="${g.n(c[1])}" r="${c[2]}" fill="#fdfeff" stroke="#8c9bb3" stroke-width="1.3"/>`).join("")
    + `<path d="${g.band(g.brim-4.4, g.brim)}" fill="#fdfeff" stroke="#8c9bb3" stroke-width="1.3"/>`},
  {id:"dh_cepice", cost:12, draw:(g) =>
    `<path d="M${g.n(g.x-12.2)} ${g.n(g.brim-3)} Q ${g.n(g.x-13)} ${g.n(g.top-10)} ${g.x} ${g.n(g.top-12)}`
    + ` Q ${g.n(g.x+13)} ${g.n(g.top-10)} ${g.n(g.x+12.2)} ${g.n(g.brim-3)} Z" fill="#2f6fd0"/>`
    + `<circle cx="${g.x}" cy="${g.n(g.top-15)}" r="4.6" fill="#f6efe0" stroke="#cfc2a8" stroke-width=".9"/>`
    + `<path d="${g.band(g.brim-4.5, g.brim)}" fill="#f6efe0" stroke="#cfc2a8" stroke-width=".9"/>`},
  // a comb of spikes from the back of the head to the front, sitting on
  // the head rather than growing out of it
  {id:"dh_hreben", cost:14, draw:(g) => [-150, -128, -106, -84, -62, -40].map(a => {
    const b1 = g.at(a-9, g.r-1), b2 = g.at(a+9, g.r-1), tp = g.at(a, g.r+9);
    return `<path d="M${b1[0]} ${b1[1]} L${tp[0]} ${tp[1]} L${b2[0]} ${b2[1]} Z"`
      + ` fill="#ff5fa2" stroke="#cf2f77" stroke-width=".9"/>`; }).join("")},
  {id:"dh_slamak", cost:14, draw:(g) =>
    `<path d="M${g.n(g.x-12.5)} ${g.n(g.brim-4)} Q ${g.n(g.x-11)} ${g.n(g.top-13)} ${g.x} ${g.n(g.top-13.5)}`
    + ` Q ${g.n(g.x+11)} ${g.n(g.top-13)} ${g.n(g.x+12.5)} ${g.n(g.brim-4)} Z" fill="#f0cd7a" stroke="#c49b46" stroke-width="1"/>`
    + `<ellipse cx="${g.n(g.x+1)}" cy="${g.n(g.brim-4)}" rx="22" ry="4" fill="#f0cd7a" stroke="#c49b46" stroke-width="1"/>`
    + `<rect x="${g.n(g.x-11)}" y="${g.n(g.brim-10.5)}" width="22" height="3" fill="#6b8f5a"/>`},
  {id:"dh_vencik", cost:16, draw:(g) => [-165, -140, -115, -90, -65].map((a, k) => {
    const c = g.at(a, g.r-0.5), P = ["#ffffff", "#ffe3ef", "#fff3cf"];
    let s = "";
    for(let i = 0; i < 5; i++){ const b = (i * 72 - 90) * Math.PI / 180;
      s += `<circle cx="${g.n(c[0]+2.6*Math.cos(b))}" cy="${g.n(c[1]+2.6*Math.sin(b))}" r="2.2"`
        + ` fill="${P[k % 3]}" stroke="#d8c9b4" stroke-width=".6"/>`; }
    return s + `<circle cx="${c[0]}" cy="${c[1]}" r="1.7" fill="#ffb02e"/>`; }).join("")},
  // leaves on a branch, and nothing written on a ribbon: a wreath is a
  // wreath, not a badge
  {id:"dh_vavrin", cost:16, draw:(g) => {
    const arc = (a1, a2) => { const p = g.at(a1, g.r-.5), q = g.at(a2, g.r-.5);
      return `<path d="M${p[0]} ${p[1]} A ${g.n(g.r-.5)} ${g.n(g.r-.5)} 0 0 1 ${q[0]} ${q[1]}"`
        + ` fill="none" stroke="#2f6d3c" stroke-width="1.6"/>`; };
    const leaves = (list, tilt) => list.map(a => { const c = g.at(a, g.r-2);
      return `<path d="${leafPath(c[0], c[1], a + tilt, 10, 3.4)}" fill="#5cb264" stroke="#2f6d3c" stroke-width=".8"/>`; }).join("");
    return arc(-170, -95) + arc(-85, -45)
      + leaves([-166, -144, -122, -100], 46) + leaves([-80, -58], -46);
  }},
  // a dome with a ridge along it and a brim in front. The shallow slice
  // of the head it used to be read as a saucer balanced on the duck
  {id:"dh_prilba", cost:16, draw:(g) =>
    `<path d="M${g.n(g.x-12.5)} ${g.n(g.brim-2)} Q ${g.n(g.x-12)} ${g.n(g.top-8)} ${g.x} ${g.n(g.top-8.5)}`
    + ` Q ${g.n(g.x+12)} ${g.n(g.top-8)} ${g.n(g.x+12.5)} ${g.n(g.brim-2)} Z"`
    + ` fill="#ffb700" stroke="#c07d00" stroke-width="1"/>`
    + `<path d="M${g.x} ${g.n(g.top-8.2)} L${g.x} ${g.n(g.brim-2)}" stroke="#c07d00" stroke-width="2.4" fill="none"/>`
    + `<path d="M${g.n(g.x-14)} ${g.n(g.brim-1.5)} Q ${g.x} ${g.n(g.brim+2.5)} ${g.n(g.x+14)} ${g.n(g.brim-1.5)}`
    + ` Q ${g.x} ${g.n(g.brim-5)} ${g.n(g.x-14)} ${g.n(g.brim-1.5)} Z" fill="#ffb700" stroke="#c07d00" stroke-width="1"/>`},
  // curls all the way round the head, from the nape up over the crown and
  // down to the fringe above the eye, with a second row inside the first
  // for depth. Curls only behind the crown left the front of the head
  // bare, and what a child saw was a heap of eggs sitting on a duck
  {id:"dh_kudrny", cost:18, draw:(g) => {
    const curl = (a, q, r) => { const p = g.at(a, q);
      return `<circle cx="${p[0]}" cy="${p[1]}" r="${g.n(r)}" fill="#fdf0c8" stroke="#c9a13c" stroke-width="1.1"/>`; };
    return [[-208, 5], [-192, 5.6], [-174, 6], [-156, 6], [-138, 5.8], [-120, 5.4],
            [-102, 5], [-85, 4.6], [-68, 4.2]].map(c => curl(c[0], g.r - 1.6, c[1])).join("")
      // the inner row stops short of the forehead: a curl there would be
      // hair hanging over the eye, and the eye is the whole face
      + [[-196, 4.2], [-172, 4.6], [-148, 4.6], [-124, 4.2]]
        .map(c => curl(c[0], g.r - 5.5, c[1])).join("");
  }},
  {id:"dh_cylindr", cost:18, draw:(g) =>
    `<path d="M${g.n(g.x-10.5)} ${g.n(g.brim-4)} L${g.n(g.x-9.5)} ${g.n(g.brim-22)}`
    + ` Q ${g.x} ${g.n(g.brim-24)} ${g.n(g.x+9.5)} ${g.n(g.brim-22)} L${g.n(g.x+10.5)} ${g.n(g.brim-4)} Z"`
    + ` fill="#2b2f42" stroke="#6b7390" stroke-width=".9"/>`
    + `<rect x="${g.n(g.x-10.2)}" y="${g.n(g.brim-9)}" width="20.4" height="3.6" fill="#d33a3a"/>`
    + `<ellipse cx="${g.n(g.x+1)}" cy="${g.n(g.brim-3)}" rx="19" ry="3.4" fill="#2b2f42" stroke="#6b7390" stroke-width=".9"/>`},
  // a plain shield on the front, with nothing on the shield: a number
  // or a badge would make it one particular brigade
  {id:"dh_hasic", cost:18, draw:(g) =>
    `<path d="M${g.n(g.x-5)} ${g.n(g.brim-6)} Q ${g.n(g.x-4)} ${g.n(g.y+7)} ${g.n(g.x-9)} ${g.n(g.y+12)}`
    + ` Q ${g.n(g.x-20)} ${g.n(g.y+9)} ${g.n(g.x-20)} ${g.n(g.y-2)}`
    + ` L${g.n(g.x-14)} ${g.n(g.brim-5)} Z" fill="#a02418"/>`
    + `<path d="${g.dome(g.brim-1, g.r+4)}" fill="#d93a2b" stroke="#a02418" stroke-width="1"/>`
    + `<path d="M${g.n(g.x+1)} ${g.n(g.brim-15)} Q ${g.n(g.x-7)} ${g.n(g.brim-13)} ${g.n(g.x-6)} ${g.n(g.brim-5)}`
    + ` Q ${g.n(g.x+1)} ${g.n(g.brim-1)} ${g.n(g.x+8)} ${g.n(g.brim-5)}`
    + ` Q ${g.n(g.x+9)} ${g.n(g.brim-13)} ${g.n(g.x+1)} ${g.n(g.brim-15)} Z" fill="#ffd23f" stroke="#b8860b" stroke-width=".9"/>`},
  // dark blue with a gold band and a round badge, from the photograph.
  // The badge is a ring with a star in it, which is a shape; a crest or
  // a name would make it one navy or one shipping line
  {id:"dh_kapitan", cost:20, draw:(g) => { const w = g.wAt(g.brim, g.r+1.5);
    return `<path d="${g.dome(g.brim-3, g.r+1.5)}" fill="#1f2c50" stroke="#55679b" stroke-width=".9"/>`
      + `<path d="${g.band(g.brim-3, g.brim, g.r+1.5)}" fill="#e8c14a"/>`
      + `<path d="M${g.n(g.x-1)} ${g.n(g.brim-1)} Q ${g.n(g.x+w+15)} ${g.n(g.brim-6)} ${g.n(g.x+w+11)} ${g.n(g.brim-1)}`
      + ` Q ${g.n(g.x+6)} ${g.n(g.brim)} ${g.n(g.x-1)} ${g.n(g.brim-1)} Z" fill="#16203b"/>`
      + `<circle cx="${g.n(g.x+1)}" cy="${g.n(g.brim-7)}" r="4" fill="#e8c14a" stroke="#b8860b" stroke-width=".9"/>`
      + `<polygon points="${starPts(g.x+1, g.brim-7, 2.4)}" fill="#1f2c50"/>`; }},
  {id:"dh_helma", cost:22, draw:(g) => { const p = g.at(-140, g.r-4), q = g.at(-65, g.r-4);
    return `<path d="M${g.n(g.x-4)} ${g.n(g.brim-7)} Q ${g.n(g.x-2)} ${g.n(g.y+6)} ${g.n(g.x-6)} ${g.n(g.y+12)}`
      + ` Q ${g.n(g.x-18)} ${g.n(g.y+10)} ${g.n(g.x-19)} ${g.n(g.y-2)}`
      + ` L${g.n(g.x-13)} ${g.n(g.brim-6)} Z" fill="#e63946" stroke="#b3242f" stroke-width="1"/>`
      + `<path d="${g.dome(g.brim-1, g.r+4)}" fill="#e63946" stroke="#b3242f" stroke-width="1"/>`
      + `<path d="M${p[0]} ${p[1]} A ${g.n(g.r-4)} ${g.n(g.r-4)} 0 0 1 ${q[0]} ${q[1]}"`
      + ` fill="none" stroke="#f7f9ff" stroke-width="3.4"/>`; }},
  {id:"dh_koruna", cost:24, draw:(g) => {
    const w = g.wAt(g.brim-2), tips = [9, 11, 13, 11, 9];
    let d = `M${g.n(g.x-w)} ${g.n(g.brim-2)}`;
    for(let i = 0; i < 5; i++){ const tx = g.x - w + i * (w / 2);
      d += ` L${g.n(tx)} ${g.n(g.brim-tips[i])}`;
      if(i < 4) d += ` L${g.n(tx + w / 4)} ${g.n(g.brim-3.5)}`; }
    d += ` L${g.n(g.x+w)} ${g.n(g.brim-2)} Z`;
    return `<path d="${d}" fill="#f2c13c" stroke="#b8860b" stroke-width="1"/>`
      + `<path d="${g.band(g.brim-2.6, g.brim)}" fill="#f2c13c" stroke="#b8860b" stroke-width="1"/>`
      + [[-6, "#ff4f7d"], [0, "#3ec1ff"], [6, "#ff4f7d"]].map(j =>
        `<circle cx="${g.n(g.x+j[0])}" cy="${g.n(g.brim-1.3)}" r="1.8" fill="${j[1]}"/>`).join("");
  }},
  {id:"dh_kovboj", cost:24, draw:(g) =>
    `<path d="M${g.n(g.x-11)} ${g.n(g.brim-4)} Q ${g.n(g.x-12)} ${g.n(g.top-9)} ${g.n(g.x-4)} ${g.n(g.top-10)}`
    + ` Q ${g.x} ${g.n(g.top-6)} ${g.n(g.x+4)} ${g.n(g.top-10)}`
    + ` Q ${g.n(g.x+12)} ${g.n(g.top-9)} ${g.n(g.x+11)} ${g.n(g.brim-4)} Z" fill="#a5713c" stroke="#6f4622" stroke-width="1"/>`
    + `<rect x="${g.n(g.x-10.5)}" y="${g.n(g.brim-7)}" width="21" height="3.2" fill="#3b3a44"/>`
    + `<path d="M${g.n(g.x-26)} ${g.n(g.brim-3)} Q ${g.x} ${g.n(g.brim+2)} ${g.n(g.x+26)} ${g.n(g.brim-3)}`
    + ` Q ${g.x} ${g.n(g.brim-9)} ${g.n(g.x-26)} ${g.n(g.brim-3)} Z" fill="#a5713c" stroke="#6f4622" stroke-width="1"/>`},
  // the one part that covers anything, and it covers it through glass:
  // low opacity on purpose, so the eye, the bill and whatever pattern
  // is underneath all still show. `see` says so, and the test checks it
  {id:"dh_kosmo", cost:28, see:true, draw:(g) => {
    // big enough to hold the whole duck's head and bill inside the
    // glass: a rim crossing the bill would read as a bill cut in half
    const cx = g.x + 3, cy = g.y - 3, rad = g.r + 11;
    const on = (deg) => [g.n(cx + rad * Math.cos(deg * Math.PI / 180)),
                         g.n(cy + rad * Math.sin(deg * Math.PI / 180))];
    const a1 = on(-160), a2 = on(-125);
    // the collar is the bottom edge of the glass itself, thickened where
    // the helmet meets the duck. A dish drawn under the sphere came away
    // from it and read as a glass bowl lying on the duck's chest, worst
    // of all on a dark body, where the pale oval was the brightest thing
    // in the picture
    const c1 = on(40), c2 = on(140);
    return `<circle cx="${g.n(cx)}" cy="${g.n(cy)}" r="${g.n(rad)}" fill="#dff1ff" opacity=".22"/>`
      + `<circle cx="${g.n(cx)}" cy="${g.n(cy)}" r="${g.n(rad)}" fill="none" stroke="#bcdcf5" stroke-width="1.6" opacity=".85"/>`
      + `<path d="M${a1[0]} ${a1[1]} A ${g.n(rad)} ${g.n(rad)} 0 0 1 ${a2[0]} ${a2[1]}"`
      + ` fill="none" stroke="#ffffff" stroke-width="3.4" opacity=".5"/>`
      + `<path d="M${c1[0]} ${c1[1]} A ${g.n(rad)} ${g.n(rad)} 0 0 1 ${c2[0]} ${c2[1]}"`
      + ` fill="none" stroke="#9fb8cc" stroke-width="5" stroke-linecap="round"/>`
      + `<path d="M${c1[0]} ${c1[1]} A ${g.n(rad)} ${g.n(rad)} 0 0 1 ${c2[0]} ${c2[1]}"`
      + ` fill="none" stroke="#eaf4fc" stroke-width="1.8" stroke-linecap="round"/>`;
  }}
];

/* --- what goes over the eye ---
   The smallest drawing in the whole game and the one that carries the
   face, so three rules hold all nine of them together.
   Every part is built from the eye anchor, so the day the eye moves
   they move with it. Every part stays under the brim line, because the
   brim is where a hat stops: a lens that rides above it is a lens the
   child never sees again the moment a hat goes on. And no part shuts
   the eye. What covers it is always a thing worn over it, a lens, a
   patch, a mask with a hole to see through, never a closed lid and
   never an angry line; a duck with its eye drawn shut reads as dead or
   cross, and the face is the first thing a child looks at.
   None of these is a character either. The round frames carry no scar,
   the carnival mask is a mask with a ribbon rather than a hero in
   disguise, and nothing here comes with a cape. */
const EYE_LAYER = "eye";
const DUCK_EYE = [
  // Two round dark lenses and a bridge, the far one smaller because it
  // is further away. No arm: on a head seen from this side the arm
  // would run straight across the other lens. The frame is a fixed mid
  // grey rather than the contrast colour the patterns use, because a
  // near white line round a dark lens turns the pair into two wide open
  // eyes on the coal duck, and that is a face, not a pair of sunglasses
  {id:"de_brejle", cost:8, draw:(g, rim) => { const E = g.E;
    const lens = (dx, r) => `<circle cx="${g.n(E.x+dx)}" cy="${g.n(E.y)}" r="${r}" fill="#23283a" stroke="#7d8aa6" stroke-width="1"/>`;
    return `<path d="M${g.n(E.x-5.6)} ${g.n(E.y-2.2)} L${g.n(E.x-9)} ${g.n(E.y-2.4)}" fill="none" stroke="#23283a" stroke-width="1.8"/>`
      + lens(-1, 4.6) + lens(-13, 4.2)
      + `<circle cx="${g.n(E.x-2.6)}" cy="${g.n(E.y-1.9)}" r="1.2" fill="#7d8aa6"/>`;
  }},
  // one lens wrapped round the face, dark with a bright brow line, the
  // shape a running shop sells; that line is also what keeps it apart
  // from the two pairs of goggles further down the list
  {id:"de_sport", cost:8, draw:(g, rim) => { const E = g.E;
    return `<path d="M${g.n(E.x+3.8)} ${g.n(E.y-2.8)} Q ${g.n(E.x-4)} ${g.n(E.y-5)} ${g.n(E.x-14.6)} ${g.n(E.y-3.4)}`
      + ` Q ${g.n(E.x-16.4)} ${g.n(E.y+1.6)} ${g.n(E.x-9)} ${g.n(E.y+3.8)}`
      + ` Q ${g.n(E.x-1)} ${g.n(E.y+5.4)} ${g.n(E.x+4)} ${g.n(E.y+1.4)} Z"`
      + ` fill="#2a3550" stroke="#6b7da6" stroke-width=".9"/>`
      + `<path d="M${g.n(E.x-14)} ${g.n(E.y-3)} Q ${g.n(E.x-4.4)} ${g.n(E.y-4.6)} ${g.n(E.x+3.4)} ${g.n(E.y-2.4)}"`
      + ` fill="none" stroke="#ff6a2b" stroke-width="1.6"/>`
      + `<path d="M${g.n(E.x-11.4)} ${g.n(E.y+0.6)} Q ${g.n(E.x-5)} ${g.n(E.y-0.6)} ${g.n(E.x+0.6)} ${g.n(E.y+0.4)}"`
      + ` fill="none" stroke="#6b7da6" stroke-width="1.1"/>`;
  }},
  // the eye stays wide open and the lashes sweep back from it, away
  // from the bill and short of the brim: long lashes, open eye
  {id:"de_rasy", cost:10, draw:(g, rim) => { const E = g.E;
    return `<path d="M${g.n(E.x+3.4)} ${g.n(E.y-2.8)} Q ${g.n(E.x-1.4)} ${g.n(E.y-5.6)} ${g.n(E.x-5.4)} ${g.n(E.y-3.2)}"`
      + ` fill="none" stroke="${rim}" stroke-width="1.4"/>`
      + [[-118, 6.2], [-143, 6.4], [-168, 5.8]].map(a => {
          const c = [E.x + 3.7 * Math.cos(a[0] * Math.PI / 180), E.y + 3.7 * Math.sin(a[0] * Math.PI / 180)];
          return `<path d="${leafPath(g.n(c[0]), g.n(c[1]), a[0], a[1], 1.5)}" fill="${rim}"/>`; }).join("");
  }},
  // rings rather than tinted glass, so the eye looks out through them;
  // the strap round the head is what makes them swimming goggles and
  // not spectacles
  {id:"de_potapec", cost:10, draw:(g, rim) => { const E = g.E;
    const ring = (dx, r) => `<circle cx="${g.n(E.x+dx)}" cy="${g.n(E.y)}" r="${r}" fill="none" stroke="#2f6fd0" stroke-width="2.2"/>`;
    return `<path d="M${g.n(E.x-4.6)} ${g.n(E.y-1.4)} L${g.n(E.x-g.r*1.28)} ${g.n(E.y+2.2)}" fill="none" stroke="#2f6fd0" stroke-width="2.4"/>`
      + `<path d="M${g.n(E.x-5.4)} ${g.n(E.y-1.6)} L${g.n(E.x-9.2)} ${g.n(E.y-1.8)}" fill="none" stroke="#2f6fd0" stroke-width="1.6"/>`
      + ring(-1, 4) + ring(-12.6, 3.4)
      + `<path d="M${g.n(E.x-3)} ${g.n(E.y-2.4)} L${g.n(E.x+0.6)} ${g.n(E.y-1.4)}" fill="none" stroke="#eaf6ff" stroke-width="1.1"/>`;
  }},
  // thin round frames, empty glass and nothing else ever: no scar over
  // them, no lightning anywhere on this duck. They are the pair a
  // grandmother reads with
  {id:"de_dioptr", cost:12, draw:(g, rim) => { const E = g.E;
    const ring = (dx, r) => `<circle cx="${g.n(E.x+dx)}" cy="${g.n(E.y)}" r="${r}" fill="none" stroke="#d8a93a" stroke-width="1.6"/>`;
    return `<path d="M${g.n(E.x-6.2)} ${g.n(E.y-1.6)} Q ${g.n(E.x-9)} ${g.n(E.y-3)} ${g.n(E.x-11.4)} ${g.n(E.y-1.8)}"`
      + ` fill="none" stroke="#d8a93a" stroke-width="1.2"/>`
      + `<path d="M${g.n(E.x-16.6)} ${g.n(E.y+0.4)} L${g.n(E.x-g.r*1.2)} ${g.n(E.y+2.6)}" fill="none" stroke="#d8a93a" stroke-width="1.1"/>`
      + ring(-1.6, 4.4) + ring(-13, 3.8);
  }},
  // a carnival mask: a coloured domino with a hole to see through and
  // two ties running back round the head. The hole matters twice over,
  // because the eye stays open under it, and the ties matter because
  // between them and the scalloped top they are what makes the thing a
  // mask from a party shop rather than a disguise
  {id:"de_maska", cost:12, draw:(g, rim) => { const E = g.E;
    // The eye hole comes first, because the whole part is built round it:
    // the eye stays open under the mask and the hole is what a child
    // reads as a mask rather than as a patch.
    const hole = `M${g.n(E.x+3.4)} ${g.n(E.y-0.4)} Q ${g.n(E.x+3.4)} ${g.n(E.y-4.6)} ${g.n(E.x-0.6)} ${g.n(E.y-4.6)}`
      + ` Q ${g.n(E.x-4.8)} ${g.n(E.y-4.6)} ${g.n(E.x-4.8)} ${g.n(E.y-0.2)}`
      + ` Q ${g.n(E.x-4.8)} ${g.n(E.y+4.2)} ${g.n(E.x-0.6)} ${g.n(E.y+4.2)}`
      + ` Q ${g.n(E.x+3.4)} ${g.n(E.y+4.2)} ${g.n(E.x+3.4)} ${g.n(E.y-0.4)} Z`;
    /* The outline, and every line of it is there to stop the thing being
       a fish. A straight brow across the top instead of scallops, which
       read as a dorsal fin; a squared off back edge instead of a point,
       which read as a tail; and a deep scoop out of the underside behind
       the eye, so the silhouette has a waist where a fish has a belly.
       The front edge drops below the eye to the cheek, which is where a
       party mask ends on a face. */
    const face = `M${g.n(E.x+5)} ${g.n(E.y-3.6)}`
      + ` Q ${g.n(E.x+1.4)} ${g.n(E.y-6.8)} ${g.n(E.x-4.6)} ${g.n(E.y-6.8)}`
      + ` Q ${g.n(E.x-10.6)} ${g.n(E.y-6.8)} ${g.n(E.x-13.6)} ${g.n(E.y-5.2)}`
      + ` L${g.n(E.x-14.2)} ${g.n(E.y+2.6)}`
      + ` Q ${g.n(E.x-11.4)} ${g.n(E.y+3.6)} ${g.n(E.x-8.6)} ${g.n(E.y+1.4)}`
      + ` Q ${g.n(E.x-6.4)} ${g.n(E.y+5.4)} ${g.n(E.x-2)} ${g.n(E.y+6)}`
      // the front edge leans back below the eye, the way a mask ends on a
      // cheek, and that is also what keeps it off the root of the bill
      + ` Q ${g.n(E.x+2.4)} ${g.n(E.y+6.4)} ${g.n(E.x+4.4)} ${g.n(E.y+3.4)}`
      + ` Q ${g.n(E.x+5.4)} ${g.n(E.y-1.8)} ${g.n(E.x+5)} ${g.n(E.y-3.6)} Z`;
    const kn = [g.n(E.x-13.9), g.n(E.y-1.2)];
    // two ties running back round the head at different angles, never a
    // bow on the end of the mask: a bow there was the fin that finished
    // the fish off
    return [[-2.6, 1.15], [3, 1.05]].map(d =>
        `<path d="M${kn[0]} ${g.n(kn[1]+d[0]*.4)} Q ${g.n(E.x-g.r*.95)} ${g.n(E.y+d[0])} ${g.n(E.x-g.r*1.2)} ${g.n(E.y+d[0]*1.5)}"`
        + ` fill="none" stroke="#8a6ab8" stroke-width="${d[1]}"/>`).join("")
      + `<path d="${face} ${hole}" fill-rule="evenodd" fill="#6f4fa8" stroke="${rim}" stroke-width=".9"/>`
      // the brow, drawn as a trim along the top edge only: a line all the
      // way round turned the outline into a lens
      + `<path d="M${g.n(E.x+4.4)} ${g.n(E.y-4.6)} Q ${g.n(E.x+1)} ${g.n(E.y-7.4)}`
      + ` ${g.n(E.x-4.6)} ${g.n(E.y-7.4)} Q ${g.n(E.x-10.4)} ${g.n(E.y-7.4)} ${g.n(E.x-13.2)} ${g.n(E.y-5.9)}"`
      + ` fill="none" stroke="#e8c14a" stroke-width="1.2" stroke-linecap="round"/>`;
  }},
  // a patch is a thing worn, not an eye shut: a soft square of leather
  // with a shine on it and two straps round the head, so what a child
  // reads is a pirate rather than a hurt duck
  {id:"de_klapka", cost:14, draw:(g, rim) => { const E = g.E;
    const b1 = [g.n(E.x - g.r * 1.1), g.n(E.y - 4.6)], b2 = [g.n(E.x - g.r * 1.12), g.n(E.y + 5.4)];
    return `<path d="M${g.n(E.x-4)} ${g.n(E.y-3.4)} L${b1[0]} ${b1[1]}" fill="none" stroke="#2b2f42" stroke-width="1.1"/>`
      + `<path d="M${g.n(E.x-4)} ${g.n(E.y+2.6)} L${b2[0]} ${b2[1]}" fill="none" stroke="#2b2f42" stroke-width="1.1"/>`
      + `<path d="M${g.n(E.x-5)} ${g.n(E.y-3.8)} Q ${g.n(E.x-0.4)} ${g.n(E.y-5.6)} ${g.n(E.x+3.6)} ${g.n(E.y-3.6)}`
      + ` Q ${g.n(E.x+4.2)} ${g.n(E.y+0.6)} ${g.n(E.x+2.6)} ${g.n(E.y+4)}`
      + ` Q ${g.n(E.x-1.4)} ${g.n(E.y+5.4)} ${g.n(E.x-5)} ${g.n(E.y+3.4)}`
      + ` Q ${g.n(E.x-6.4)} ${g.n(E.y-0.6)} ${g.n(E.x-5)} ${g.n(E.y-3.8)} Z" fill="#2b2f42" stroke="#6b7390" stroke-width=".8"/>`
      + `<path d="M${g.n(E.x-3)} ${g.n(E.y-2.2)} Q ${g.n(E.x+0.4)} ${g.n(E.y-3.2)} ${g.n(E.x+2.8)} ${g.n(E.y-1.6)}"`
      + ` fill="none" stroke="#7d8aa6" stroke-width="1.2"/>`;
  }},
  // one big window instead of two little ones, with the seal round it
  // and a wide strap: the mask a child wears at the swimming pool
  {id:"de_snorchl", cost:16, draw:(g, rim) => { const E = g.E;
    const win = `M${g.n(E.x+3.4)} ${g.n(E.y-2.4)} Q ${g.n(E.x+3)} ${g.n(E.y-5.8)} ${g.n(E.x-2.4)} ${g.n(E.y-6)}`
      + ` Q ${g.n(E.x-9.4)} ${g.n(E.y-6.2)} ${g.n(E.x-14)} ${g.n(E.y-4.4)}`
      + ` Q ${g.n(E.x-15.8)} ${g.n(E.y+0.6)} ${g.n(E.x-12.4)} ${g.n(E.y+4)}`
      + ` Q ${g.n(E.x-6.4)} ${g.n(E.y+5.8)} ${g.n(E.x-0.8)} ${g.n(E.y+5)}`
      + ` Q ${g.n(E.x+3.2)} ${g.n(E.y+3.4)} ${g.n(E.x+3.4)} ${g.n(E.y-2.4)} Z`;
    return `<path d="M${g.n(E.x-12)} ${g.n(E.y-3)} L${g.n(E.x-g.r*1.32)} ${g.n(E.y+1.6)}" fill="none" stroke="#e8582f" stroke-width="3.4"/>`
      + `<path d="${win}" fill="none" stroke="#e8582f" stroke-width="2.8"/>`
      + `<path d="M${g.n(E.x-10)} ${g.n(E.y-3.4)} Q ${g.n(E.x-5.4)} ${g.n(E.y-4.6)} ${g.n(E.x-1.8)} ${g.n(E.y-3.6)}"`
      + ` fill="none" stroke="#eaf6ff" stroke-width="1.4"/>`;
  }},
  // the big one: a wide amber lens in a soft frame and a strap with a
  // stripe round the back of the head
  {id:"de_lyze", cost:18, draw:(g, rim) => { const E = g.E;
    const back = g.n(E.x - g.r * 1.34);
    return `<path d="M${g.n(E.x-10)} ${g.n(E.y-4.4)} L${back} ${g.n(E.y-1.6)} L${back} ${g.n(E.y+3.4)} L${g.n(E.x-10)} ${g.n(E.y+4.6)} Z"`
      + ` fill="#2f3a5c" stroke="${rim}" stroke-width=".8"/>`
      + `<path d="M${g.n(back+1)} ${g.n(E.y-0.4)} L${g.n(E.x-10.4)} ${g.n(E.y+1.2)}" fill="none" stroke="#f0f4ff" stroke-width="1.2"/>`
      + `<path d="M${g.n(E.x+3.2)} ${g.n(E.y-2.6)} Q ${g.n(E.x+2.4)} ${g.n(E.y-6.2)} ${g.n(E.x-4.4)} ${g.n(E.y-6.4)}`
      + ` Q ${g.n(E.x-11.6)} ${g.n(E.y-6.6)} ${g.n(E.x-15)} ${g.n(E.y-4.6)}`
      + ` Q ${g.n(E.x-16.8)} ${g.n(E.y+0.4)} ${g.n(E.x-13.8)} ${g.n(E.y+4.4)}`
      + ` Q ${g.n(E.x-6.6)} ${g.n(E.y+6.4)} ${g.n(E.x-1.4)} ${g.n(E.y+5.4)}`
      + ` Q ${g.n(E.x+2.8)} ${g.n(E.y+3.8)} ${g.n(E.x+3.2)} ${g.n(E.y-2.6)} Z"`
      + ` fill="#ffa62b" stroke="#2f3a5c" stroke-width="1.6"/>`
      + `<path d="M${g.n(E.x-12)} ${g.n(E.y-2.8)} Q ${g.n(E.x-5.4)} ${g.n(E.y-4.6)} ${g.n(E.x+0.2)} ${g.n(E.y-3)}"`
      + ` fill="none" stroke="#ffe0a8" stroke-width="1.4"/>`;
  }}
];

/* --- what the duck carries ---
   Sixteen things, and a thing is all any of them is: a ring, a board, a
   bow tie, a ball. No badge, no number, no crest. The pendant is a star
   on a cord and deliberately not a medal, because a medal is the one
   thing in this game a child rides out of a race with, and one that
   could be bought would be worth nothing.
   The layer has two halves. `back` is drawn before the tail and the
   body and `draw` after everything else, so a swim ring can go round
   the duck instead of in front of it, a tank can hang off its back with
   the strap still showing across its chest, and a board can be
   underneath while the duck sits on top. Everything is built from the
   body, wing, tail and water anchors, never from the head: gear belongs
   to the body, and it all stays below the brim line so that whatever is
   on the head has the head to itself. */
const GEAR_LAYER = "gear";
const DUCK_GEAR = [
  // two wings and a knot on the neck point, which is where the head sits
  // on the body: a bow tie any lower is a brooch on the chest
  {id:"dg_motylek", cost:8, draw:(g, rim) => { const k = g.neck;
    const wing = s => `M${g.n(k[0])} ${g.n(k[1])} L${g.n(k[0]+s*9)} ${g.n(k[1]-4.6)}`
      + ` Q ${g.n(k[0]+s*10.4)} ${g.n(k[1])} ${g.n(k[0]+s*9)} ${g.n(k[1]+4.6)} Z`;
    return `<path d="${wing(-1)}" fill="#d33a3a" stroke="${rim}" stroke-width=".8"/>`
      + `<path d="${wing(1)}" fill="#d33a3a" stroke="${rim}" stroke-width=".8"/>`
      + `<circle cx="${g.n(k[0])}" cy="${g.n(k[1])}" r="2.4" fill="#b52b2b" stroke="${rim}" stroke-width=".8"/>`;
  }},
  // round the neck once and then down the chest, because a scarf that
  // only goes round the neck reads as a collar
  {id:"dg_sal", cost:10, draw:(g, rim) => { const k = g.neck;
    return `<path d="M${g.n(k[0]-12)} ${g.n(k[1]-3.4)} Q ${g.n(k[0]-1)} ${g.n(k[1]+3.6)} ${g.n(k[0]+10)} ${g.n(k[1]-4.6)}`
      + ` Q ${g.n(k[0]+11.4)} ${g.n(k[1]-0.6)} ${g.n(k[0]+9.6)} ${g.n(k[1]+1.4)}`
      + ` Q ${g.n(k[0]-1)} ${g.n(k[1]+9)} ${g.n(k[0]-12.6)} ${g.n(k[1]+1)} Z"`
      + ` fill="#e0563b" stroke="${rim}" stroke-width=".8"/>`
      + `<path d="M${g.n(k[0]+2.6)} ${g.n(k[1]+3)} Q ${g.n(k[0]+8)} ${g.n(k[1]+8.4)} ${g.n(k[0]+6)} ${g.n(k[1]+16.4)}`
      + ` Q ${g.n(k[0]+2.6)} ${g.n(k[1]+17.6)} ${g.n(k[0]-0.4)} ${g.n(k[1]+15.6)}`
      + ` Q ${g.n(k[0]+1.6)} ${g.n(k[1]+9)} ${g.n(k[0]-2.4)} ${g.n(k[1]+4)} Z"`
      + ` fill="#e0563b" stroke="${rim}" stroke-width=".8"/>`
      + `<path d="M${g.n(k[0]+0.4)} ${g.n(k[1]+11.6)} Q ${g.n(k[0]+3.4)} ${g.n(k[1]+12.6)} ${g.n(k[0]+6.4)} ${g.n(k[1]+11.4)}"`
      + ` fill="none" stroke="#f6c9b0" stroke-width="1.4"/>`;
  }},
  // a star on a cord and not a medal on a ribbon; see the note above
  {id:"dg_privesek", cost:10, draw:(g, rim) => { const k = g.neck;
    return `<path d="M${g.n(k[0]-8)} ${g.n(k[1]+1.4)} Q ${g.n(k[0])} ${g.n(k[1]+11.4)} ${g.n(k[0]+7.6)} ${g.n(k[1]+0.6)}"`
      + ` fill="none" stroke="${rim}" stroke-width="1.1"/>`
      + `<polygon points="${starPts(g.n(k[0]-0.2), g.n(k[1]+11.6), 5)}" fill="#f2c13c" stroke="#b8860b" stroke-width=".9"/>`;
  }},
  // trunks follow the underside of the duck instead of cutting a
  // straight line across it, which is what the body anchor is for
  {id:"dg_plavky", cost:12, draw:(g, rim) => { const B = g.B, y0 = g.water - 2;
    return `<path d="M${g.n(B.x-24)} ${g.n(y0)} Q ${g.n(B.x)} ${g.n(y0-5.4)} ${g.n(B.x+24)} ${g.n(y0)}`
      + ` Q ${g.n(B.x)} ${g.n(B.y+B.ry+12)} ${g.n(B.x-24)} ${g.n(y0)} Z"`
      + ` fill="#2f6fd0" stroke="${rim}" stroke-width=".8"/>`
      + `<path d="M${g.n(B.x-23.6)} ${g.n(y0-0.6)} Q ${g.n(B.x)} ${g.n(y0-6)} ${g.n(B.x+23.6)} ${g.n(y0-0.6)}"`
      + ` fill="none" stroke="#fdfdff" stroke-width="2.4"/>`
      + `<path d="M${g.n(B.x+2)} ${g.n(y0+1.6)} Q ${g.n(B.x+3.4)} ${g.n(y0+7)} ${g.n(B.x+1.4)} ${g.n(y0+11.4)}"`
      + ` fill="none" stroke="#1f4f97" stroke-width="1.4"/>`;
  }},
  // black and white, because that is what a football is; the panels are
  // a written down list, so every duck's ball is the same ball
  {id:"dg_mic", cost:14, draw:(g, rim) => { const c = [g.B.x + 22, g.water + 1];
    const pent = [];
    for(let i = 0; i < 5; i++){ const a = (i * 72 - 90) * Math.PI / 180;
      pent.push(g.n(c[0] + 4.4 * Math.cos(a)) + "," + g.n(c[1] + 4.4 * Math.sin(a))); }
    return `<circle cx="${g.n(c[0])}" cy="${g.n(c[1])}" r="9.6" fill="#fdfdff" stroke="#23283a" stroke-width="1.2"/>`
      + `<polygon points="${pent.join(" ")}" fill="#23283a"/>`
      + [[-6.6, -4.4], [6.8, -4], [-5.6, 5.8], [5.8, 5.6]].map(d =>
          `<circle cx="${g.n(c[0]+d[0])}" cy="${g.n(c[1]+d[1])}" r="2.2" fill="#23283a"/>`).join("");
  }},
  // bubbles rise beside the duck rather than in front of it, so they
  // never end up sitting on the bill
  {id:"dg_bubliny", cost:14, draw:(g, rim) => { const B = g.B;
    return [[26, 4, 5], [34, -4, 3.6], [30, -10, 2.2], [39, -13, 2.8], [36, -20, 1.8]].map(s =>
      `<circle cx="${g.n(B.x+s[0])}" cy="${g.n(g.water+s[1])}" r="${s[2]}" fill="#dff1ff" stroke="#5fa8d6" stroke-width="1"/>`
      + `<circle cx="${g.n(B.x+s[0]-s[2]*.34)}" cy="${g.n(g.water+s[1]-s[2]*.36)}" r="${g.n(s[2]*.28)}" fill="#ffffff"/>`).join("");
  }},
  // arm bands go round the wing, which is the nearest thing a duck has
  // to an arm
  {id:"dg_kridla", cost:14, draw:(g, rim) => { const W = g.W;
    /* An arm band goes round the wing, across it rather than over it, so
       the root of the wing and its tip both still show: a patch laid
       along the wing hid the whole thing and read as an orange barrel
       with a stripe, which is also what the life jacket looked like, and
       two pieces of gear a child cannot tell apart are one piece of gear.
       The band is drawn about a line across the wing, so every number in
       it is an offset from the wing anchor. `s` runs along that line and
       `t` across it; two bulges with a pinch between them are what makes
       an inflated band rather than a cuff. */
    const pt = (s, t) => `${g.n(W.x - 8 - .41 * s + .91 * t)} ${g.n(W.y - 3 + .91 * s + .41 * t)}`;
    return `<path d="M${pt(-11.5, -5.4)} Q ${pt(-15.4, 0)} ${pt(-11.5, 5.4)}`
      + ` Q ${pt(-5.4, 7) } ${pt(0, 4.2)} Q ${pt(5.4, 7)} ${pt(11.5, 5.4)}`
      + ` Q ${pt(15.4, 0)} ${pt(11.5, -5.4)} Q ${pt(5.4, -7)} ${pt(0, -4.2)}`
      + ` Q ${pt(-5.4, -7)} ${pt(-11.5, -5.4)} Z"`
      + ` fill="#ff8a3d" stroke="${rim}" stroke-width=".9"/>`
      // the seam between the two chambers, and a short highlight on the
      // upper one so the band reads as inflated
      + `<path d="M${pt(0, -4.4)} L${pt(0, 4.4)}" fill="none" stroke="#d8641f" stroke-width="1.4"/>`
      + `<path d="M${pt(-8.6, -2.6)} Q ${pt(-4.6, -4.4)} ${pt(-2.4, -3)}"`
      + ` fill="none" stroke="#ffd9b8" stroke-width="1.8" stroke-linecap="round"/>`;
  }},
  // a pennant on a stick, carried leaning back over the duck's
  // shoulder. The stick is drawn in front and the flag hangs off its
  // top, so the two read as one thing; a flag drawn behind the duck
  // covered its own pole and looked like a triangle in mid air. No
  // emblem on it, it is a flag the way a chequered flag is a flag
  {id:"dg_vlajecka", cost:16, draw:(g, rim) => { const B = g.B;
    const top = [g.n(B.x-20), g.n(B.y-28)];
    return `<path d="M${g.n(B.x-2)} ${g.n(B.y-10)} L${top[0]} ${top[1]}" fill="none" stroke="#8a6b45" stroke-width="2.4" stroke-linecap="round"/>`
      + `<path d="M${top[0]} ${top[1]} L${g.n(B.x-31.4)} ${g.n(B.y-24.4)} L${g.n(B.x-18.4)} ${g.n(B.y-21)} Z"`
      + ` fill="#e8402a" stroke="${rim}" stroke-width=".9"/>`
      + `<path d="M${g.n(B.x-29)} ${g.n(B.y-24.4)} L${g.n(B.x-19.4)} ${g.n(B.y-22.4)}" fill="none" stroke="#fdfdff" stroke-width="1.4"/>`;
  }},
  // a spanner lying against the duck, jaw uppermost; the workshop is
  // where the parts for all of this come from in the first place
  {id:"dg_klic", cost:18, draw:(g, rim) => { const B = g.B;
    const a = [g.n(B.x-9), g.n(B.y+15)], b = [g.n(B.x+4), g.n(B.y-4)];
    // the jaw is an open C, because a wedge on a stick reads as an axe
    return `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" fill="none" stroke="#9aa7bd" stroke-width="4.2" stroke-linecap="round"/>`
      + `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" fill="none" stroke="${rim}" stroke-width=".8"/>`
      + `<path d="M${g.n(B.x+0.6)} ${g.n(B.y-5.4)} L${g.n(B.x+2.6)} ${g.n(B.y-13.4)} L${g.n(B.x+6.4)} ${g.n(B.y-12.4)}`
      + ` L${g.n(B.x+5)} ${g.n(B.y-7.6)} L${g.n(B.x+9.4)} ${g.n(B.y-8.6)} L${g.n(B.x+10.4)} ${g.n(B.y-12.4)}`
      + ` L${g.n(B.x+14)} ${g.n(B.y-11.4)} L${g.n(B.x+12)} ${g.n(B.y-3.4)} Z"`
      + ` fill="#9aa7bd" stroke="${rim}" stroke-width=".8"/>`;
  }},
  {id:"dg_batoh", cost:20, back:(g, rim) => { const T = g.T;
    return `<path d="M${g.n(T.x-19)} ${g.n(T.y-2)} Q ${g.n(T.x-19.6)} ${g.n(T.y+20)} ${g.n(T.x-8)} ${g.n(T.y+21)}`
      + ` Q ${g.n(T.x+3)} ${g.n(T.y+20)} ${g.n(T.x+2.4)} ${g.n(T.y-2)}`
      + ` Q ${g.n(T.x-8)} ${g.n(T.y-7)} ${g.n(T.x-19)} ${g.n(T.y-2)} Z"`
      + ` fill="#6f8f4f" stroke="#41552f" stroke-width="1.1"/>`
      + `<path d="M${g.n(T.x-18.6)} ${g.n(T.y+6)} Q ${g.n(T.x-8)} ${g.n(T.y+11)} ${g.n(T.x+2)} ${g.n(T.y+6)}"`
      + ` fill="none" stroke="#41552f" stroke-width="1.4"/>`
      + `<rect x="${g.n(T.x-11)}" y="${g.n(T.y+7.4)}" width="6" height="4.4" rx="1.4" fill="#d8b14a"/>`;
  }, draw:(g, rim) => { const B = g.B;
    // the strap runs over the shoulder and round the chest, not
    // straight down the duck: a straight line reads as a stick
    const s = `M${g.n(B.x+9)} ${g.n(B.y-15)} Q ${g.n(B.x+2)} ${g.n(B.y-6)} ${g.n(B.x-2)} ${g.n(B.y+5)}`
      + ` Q ${g.n(B.x-5)} ${g.n(B.y+12)} ${g.n(B.x-12)} ${g.n(B.y+13)}`;
    return `<path d="${s}" fill="none" stroke="${rim}" stroke-width="5"/>`
      + `<path d="${s}" fill="none" stroke="#6f8f4f" stroke-width="3.8"/>`
      + `<rect x="${g.n(B.x-3.4)}" y="${g.n(B.y+1)}" width="6" height="4.4" rx="1.2" fill="#d8b14a" stroke="${rim}" stroke-width=".6"/>`;
  }},
  {id:"dg_nadrz", cost:20, back:(g, rim) => { const T = g.T;
    return `<rect x="${g.n(T.x-20)}" y="${g.n(T.y+1)}" width="15" height="30" rx="7" fill="#b8c1cf" stroke="#7d8799" stroke-width="1.1"/>`
      + `<rect x="${g.n(T.x-15)}" y="${g.n(T.y-3.6)}" width="4.4" height="5.4" fill="#7d8799"/>`
      + `<circle cx="${g.n(T.x-12.8)}" cy="${g.n(T.y-4.6)}" r="2.8" fill="#e8582f" stroke="#a33a1a" stroke-width=".9"/>`
      + `<path d="M${g.n(T.x-19.4)} ${g.n(T.y+11)} L${g.n(T.x-5.6)} ${g.n(T.y+11)}" fill="none" stroke="#7d8799" stroke-width="1.8"/>`;
  }, draw:(g, rim) => { const B = g.B;
    const s = `M${g.n(B.x+9)} ${g.n(B.y-15)} Q ${g.n(B.x+2)} ${g.n(B.y-6)} ${g.n(B.x-2)} ${g.n(B.y+5)}`
      + ` Q ${g.n(B.x-5)} ${g.n(B.y+12)} ${g.n(B.x-12)} ${g.n(B.y+13)}`;
    return `<path d="${s}" fill="none" stroke="${rim}" stroke-width="4.4"/>`
      + `<path d="${s}" fill="none" stroke="#8c97ab" stroke-width="3.2"/>`;
  }},
  {id:"dg_vesta", cost:20, draw:(g, rim) => { const B = g.B, k = g.neck;
    /* A life jacket is what goes round a neck and round a body, and that
       is what tells it apart from the arm band on the wing: a collar
       sitting on the neck point, a panel hanging from it down the chest,
       and a belt running right across the duck with a buckle on it. A
       panel on its own, with no collar and no belt, was an upright
       striped box, and at tile size it and the arm band were the same
       orange thing twice. */
    const collar = `M${g.n(k[0]-9)} ${g.n(k[1]-1.6)} Q ${g.n(k[0]-1)} ${g.n(k[1]+5.4)} ${g.n(k[0]+8)} ${g.n(k[1]-3.4)}`
      + ` Q ${g.n(k[0]+10.4)} ${g.n(k[1]+0.6)} ${g.n(k[0]+8.6)} ${g.n(k[1]+3)}`
      + ` Q ${g.n(k[0]-1)} ${g.n(k[1]+11)} ${g.n(k[0]-10.6)} ${g.n(k[1]+2.6)} Z`;
    // the belt goes round the whole duck, not just across the panel
    const belt = `M${g.n(B.x-26)} ${g.n(B.y+6)} Q ${g.n(B.x-2)} ${g.n(B.y+12)} ${g.n(B.x+22)} ${g.n(B.y+4)}`;
    return `<path d="M${g.n(B.x+6)} ${g.n(B.y-9)} Q ${g.n(B.x+16)} ${g.n(B.y-7)} ${g.n(B.x+24)} ${g.n(B.y-11)}`
      + ` Q ${g.n(B.x+27)} ${g.n(B.y-1)} ${g.n(B.x+23)} ${g.n(B.y+9)}`
      + ` Q ${g.n(B.x+14)} ${g.n(B.y+13)} ${g.n(B.x+5)} ${g.n(B.y+8)}`
      + ` Q ${g.n(B.x+2)} ${g.n(B.y-2)} ${g.n(B.x+6)} ${g.n(B.y-9)} Z"`
      + ` fill="#ff7a1f" stroke="${rim}" stroke-width=".9"/>`
      + `<path d="M${g.n(B.x+4.6)} ${g.n(B.y+0.4)} Q ${g.n(B.x+14)} ${g.n(B.y+3.4)} ${g.n(B.x+24.4)} ${g.n(B.y-0.6)}"`
      + ` fill="none" stroke="#fdfdff" stroke-width="2.6"/>`
      + `<path d="${collar}" fill="#ff7a1f" stroke="${rim}" stroke-width=".9"/>`
      + `<path d="${belt}" fill="none" stroke="${rim}" stroke-width="3.6"/>`
      + `<path d="${belt}" fill="none" stroke="#d8641f" stroke-width="2.4"/>`
      + `<rect x="${g.n(B.x+6)}" y="${g.n(B.y+4.4)}" width="5.6" height="4.6" rx="1.2"`
      + ` fill="#f6efe0" stroke="#a8783a" stroke-width=".8"/>`;
  }},
  // a plain shield with a band across it. A crest or a letter on it
  // would make it one particular knight's shield, so it has neither
  {id:"dg_stit", cost:22, draw:(g, rim) => { const B = g.B;
    return `<path d="M${g.n(B.x+9)} ${g.n(B.y-9)} L${g.n(B.x+31)} ${g.n(B.y-9)} L${g.n(B.x+31)} ${g.n(B.y+7)}`
      + ` Q ${g.n(B.x+20)} ${g.n(B.y+20)} ${g.n(B.x+9)} ${g.n(B.y+7)} Z"`
      + ` fill="#3b6fd6" stroke="${rim}" stroke-width="1"/>`
      + `<path d="M${g.n(B.x+9)} ${g.n(B.y-2.4)} L${g.n(B.x+31)} ${g.n(B.y-2.4)} L${g.n(B.x+31)} ${g.n(B.y+2.6)}`
      + ` L${g.n(B.x+9)} ${g.n(B.y+2.6)} Z" fill="#f0f4ff"/>`;
  }},
  // the ring goes round the duck: the far side of it behind the body,
  // the near side in front, which is the whole reason this layer has
  // two halves
  {id:"dg_kruh", cost:24, back:(g, rim) => ringArc(g, 1, "#e8402a", 9, rim),
   draw:(g, rim) => ringArc(g, 0, "#e8402a", 9, rim)
     + [[-19, -3.4], [17, -3.4]].map(d =>
         `<path d="M${g.n(g.B.x+d[0])} ${g.n(g.water+d[1])} L${g.n(g.B.x+d[0]+4)} ${g.n(g.water+8.4)}"`
         + ` fill="none" stroke="#fdfdff" stroke-width="4.6"/>`).join("")},
  {id:"dg_pneu", cost:26, back:(g, rim) => ringArc(g, 1, "#2b2f3a", 10, rim),
   draw:(g, rim) => ringArc(g, 0, "#2b2f3a", 10, rim)
     + [-24, -12, 0, 12, 24].map(dx =>
         `<path d="M${g.n(g.B.x+dx)} ${g.n(g.water+2.6)} L${g.n(g.B.x+dx+1.6)} ${g.n(g.water+8)}"`
         + ` fill="none" stroke="#6b7390" stroke-width="1.4"/>`).join("")},
  // the board is underneath, so it is drawn before the duck and the
  // duck sits on it; only the nose, the tail and the rail below the
  // belly show
  {id:"dg_prkno", cost:30, back:(g, rim) => { const B = g.B;
    // a fin at the back end. Without it the strip showing under the
    // duck is just a stripe; with it, it is a board
    return `<path d="M${g.n(B.x-30)} ${g.n(g.water+13)} L${g.n(B.x-34)} ${g.n(g.water+22)}`
      + ` L${g.n(B.x-25)} ${g.n(g.water+16)} Z" fill="#2f6fd0"/>`
      + `<path d="M${g.n(B.x-41)} ${g.n(g.water+10)} Q ${g.n(B.x)} ${g.n(g.water-1)} ${g.n(B.x+43)} ${g.n(g.water+7)}`
      + ` Q ${g.n(B.x)} ${g.n(g.water+25)} ${g.n(B.x-41)} ${g.n(g.water+10)} Z"`
      + ` fill="#eaf2ff" stroke="#2f6fd0" stroke-width="1.4"/>`
      + `<path d="M${g.n(B.x-33)} ${g.n(g.water+13)} Q ${g.n(B.x)} ${g.n(g.water+8)} ${g.n(B.x+35)} ${g.n(g.water+11)}"`
      + ` fill="none" stroke="#e8582f" stroke-width="3.2"/>`;
  }, draw:() => ""}
];
/* Both rings are the same ellipse cut in half, the far half drawn
   before the duck and the near half after it, so the numbers live in
   one place rather than in two halves that could drift apart. The
   contrast line underneath is what keeps the black tyre off the coal
   duck and the red ring off the fire one, and it is deliberately wide:
   at a hair either side of a ten wide band it was there in the file and
   not there on the tile, and the coal duck wearing the tyre was one
   dark blot with a face somewhere in it. */
function ringArc(g, far, colour, wide, rim){
  // a curve rather than an elliptical arc: the half it draws is the
  // same, and a curve can be read back out of the drawing by the test
  const x1 = svgn(g.B.x - 38), x2 = svgn(g.B.x + 38), y = svgn(g.water);
  const d = `M${x1} ${y} Q ${svgn(g.B.x)} ${svgn(y + (far ? -18 : 18))} ${x2} ${y}`;
  const arc = (c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  return arc(rim, wide + 3.2) + arc(colour, wide);
}
/* --- a part the body would swallow ---
   The snow body already had this problem and answered it by drawing its
   own three shapes underneath in an outline colour, so that a duck the
   same colour as the tile it stands on still has a silhouette. A part
   has it too, and the other way round: the round gold frames vanish on
   the classic yellow, the dark blue cap and the red headscarf vanish on
   the coal duck, and a part nobody can see is a part a child paid for
   twice over.
   So the same answer, worked out per part instead of written into one
   body: the colours a part draws with are measured against the colours
   of the body under it, and when not one of them stands out, the whole
   part is drawn a second time underneath, as outline only, in the
   contrast colour the layer already carries. It holds for every layer
   and for every part added later, which is the point of doing it here
   rather than in twenty drawings. Distance is measured in Lab, because
   two colours that look different in the file can be the same colour on
   the tile; the threshold is the same 25 the ten bodies are held to. */
const DUCK_INK = 25;
function duckLab(hex){
  const h = hex.length === 4 ? "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3] : hex;
  const n = parseInt(h.slice(1), 16);
  const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const r = lin((n >> 16) & 255), g = lin((n >> 8) & 255), b = lin(n & 255);
  const f = t => t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116);
  const X = f((r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047);
  const Y = f(r * 0.2126729 + g * 0.7151522 + b * 0.0721750);
  const Z = f((r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883);
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}
function duckDE(a, b){
  const x = duckLab(a), y = duckLab(b);
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}
function partInk(frag, rim, hues){
  if(!frag) return "";
  const cols = frag.match(/(?:fill|stroke)="(#[0-9a-fA-F]{3,6})"/g) || [];
  const seen = cols.map(s => s.slice(s.indexOf("#"), -1))
    .some(c => hues.every(h => duckDE(c, h) >= DUCK_INK));
  if(seen) return frag;
  // outline only, never a second filled copy: the space helmet is drawn
  // through glass, and a filled ghost of it would put a grey disc over
  // the duck's face
  const ghost = frag.replace(/<(circle|ellipse|rect|path|polygon)\b([^>]*?)\/>/g, (m, tag, at) => {
    let a = at.replace(/(fill|stroke)="[^"]*"/g, "").replace(/stroke-line(join|cap)="[^"]*"/g, "")
             .replace(/stroke-width="([\d.]+)"/, (w, v) => `stroke-width="${svgn(+v + 2.4)}"`);
    if(!/stroke-width=/.test(a)) a += ` stroke-width="2.4"`;
    return `<${tag}${a} fill="none" stroke="${rim}" stroke-linejoin="round" stroke-linecap="round"/>`;
  });
  return ghost + frag;
}

/* Every layer's catalogue in one list, so a part can be looked up by
   id without anybody having to know which layer it came from. */
const DUCK_PARTS = DUCK_BODY.concat(DUCK_PAT, DUCK_HEAD, DUCK_EYE, DUCK_GEAR);
const duckPartById = id => DUCK_PARTS.find(x => x.id === id) || null;
/* A part knows which layer it belongs to from its id, so no catalogue
   entry can be filed under the wrong one by hand. */
const DUCK_LAYER_BY_PREFIX = {db: BODY_LAYER, dp: PAT_LAYER, dh: HEAD_LAYER,
                              de: EYE_LAYER, dg: GEAR_LAYER};
const duckLayerOf = part => DUCK_LAYER_BY_PREFIX[part.id.slice(0, 2)];
/* The free part of a layer belongs to everyone from the start, exactly
   like the starter racers; the rest are paid for once and kept. */
const ownsDuckPart = (p, part) => part.cost === 0 || (p.duckParts || []).includes(part.id);
/* Putting a part on is the only thing that changes; `duckParts` only
   ever grows. An empty id means the layer goes bare, which is how the
   layers after the body will be taken off again. */
function wearDuckPart(p, layer, id){
  p.duck = p.duck || {};
  if(id) p.duck[layer] = id; else delete p.duck[layer];
}
/* No body chosen means the classic yellow, so an older profile opens the
   garage and sees a finished duck rather than an empty one. */
const duckBodyOf = outfit => duckPartById((outfit || {})[BODY_LAYER]) || DUCK_BODY[0];
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

/* The starter seven are free and picked before each race, the rest cost
   coins. The duck is appended rather than inserted, so nobody's first
   racer changes: `load()` hands every profile, however old, whatever it
   is missing from this list, which is the whole of what adding a free
   starter costs. */
const STARTERS = ["ri_auto", "ri_raketa", "ri_mech", "pet_kiki", "pet_lupi", "pet_mecha", "du_kacka"];
const ALL_ITEMS = PETS.concat(RIDES).concat(DUCKS);
const itemById = id => ALL_ITEMS.find(i => i.id === id) || PETS[0];
/* Three kinds of racer and only one of them grows. Everywhere that used
   to ask "is it a machine" has to ask this instead, or the duck would
   quietly earn a growth stage it has no second drawing for. */
const isPet = it => !it.kind && !it.duck;
const nameOf = it => t(typeof it === "string" ? it : it.id);
const EVO = [0, 70, 220];   // experience needed for growth stages 1, 2, 3

function stageOf(p, id){
  const xp = p.xp[id] || 0;
  return xp >= EVO[2] ? 3 : xp >= EVO[1] ? 2 : 1;
}

/* --- sprite drawing ---

   An animal is drawn by its own function, never by one shape with
   switches. Twelve switched shapes are twelve copies of the same
   creature, and the whole point of an animal here is that an eight year
   old names it on sight, on a garage tile the size of a thumbnail, with
   the label covered up. So PET_SHAPES is a table of drawings, one per
   animal, and petSVG() is a dispatcher plus the wrapper all of them
   share: the growth scale, the eyes, the smile and the star of the third
   stage. A shape hands back what it drew and says where its eyes and its
   mouth belong; the two whose mouth is the animal - a beak, a jaw full
   of teeth - draw their own and say so with mouth:"own".

   Two rules hold the whole table together. Nothing is rotated and every
   path is written in absolute commands, so the test can read the points
   straight back out of the drawing and check that no animal leaves the
   frame at any of the three stages. And no drawing may be nameable as a
   character: these are a bear, a rabbit, a dragon, never somebody's
   mascot. If a name can be put to the picture, the picture is wrong. */
const PET = {
  CX: 50,          // the middle of the frame, and of every animal in it
  HEAD: 45,        // where the head of a standing animal sits
  BODY: 80,        // where its body sits
  FLOOR: 96,       // where its feet meet the ground
  STAR: [78, 98]   // the growth star: bottom right, the one corner no
};                 // animal reaches into, and not where the tile's chip is

/* A lighter and a darker relative of a colour, so a muzzle, a belly or a
   paw is the animal's own colour rather than a second palette to keep. */
function tint(hex, k){
  const v = parseInt(hex.slice(1), 16);
  return "#" + [(v >> 16) & 255, (v >> 8) & 255, v & 255]
    .map(c => Math.round(c + (255 - c) * k).toString(16).padStart(2, "0")).join("");
}
function shade(hex, k){
  const v = parseInt(hex.slice(1), 16);
  return "#" + [(v >> 16) & 255, (v >> 8) & 255, v & 255]
    .map(c => Math.round(c * (1 - k)).toString(16).padStart(2, "0")).join("");
}
/* --- the parts more than one animal is built from --- */
function paws(cx, y, dx, rx, ry, c){
  return `<ellipse cx="${svgn(cx - dx)}" cy="${svgn(y)}" rx="${rx}" ry="${ry}" fill="${c}"/>`
       + `<ellipse cx="${svgn(cx + dx)}" cy="${svgn(y)}" rx="${rx}" ry="${ry}" fill="${c}"/>`;
}
function earRound(x, y, r, c, inner){
  return `<circle cx="${svgn(x)}" cy="${svgn(y)}" r="${r}" fill="${c}"/>`
       + `<circle cx="${svgn(x)}" cy="${svgn(y + r * .14)}" r="${svgn(r * .52)}" fill="${inner}"/>`;
}
// a pointed ear, given the two corners of its base and its tip
function earTri(bx1, by1, bx2, by2, tx, ty, c, inner){
  const mid = (a, b, k) => svgn(a + (b - a) * k);
  return `<path d="M${svgn(bx1)} ${svgn(by1)} L${svgn(tx)} ${svgn(ty)} L${svgn(bx2)} ${svgn(by2)} Z" fill="${c}"/>`
       + `<path d="M${mid(bx1, bx2, .24)} ${mid(by1, by2, .24)} L${mid(tx, (bx1 + bx2) / 2, .32)} ${mid(ty, (by1 + by2) / 2, .32)}`
       + ` L${mid(bx2, bx1, .3)} ${mid(by2, by1, .3)} Z" fill="${inner}"/>`;
}
/* A row of spikes along an arc: a dragon's crest and a crocodile's back
   are the same shape seen twice, and working it out from the arc rather
   than writing the triangles down keeps both readable. */
function ridge(cx, cy, r, a0, a1, count, h, fill){
  const P = (deg, q) => { const a = deg * Math.PI / 180;
    return `${svgn(cx + q * Math.cos(a))} ${svgn(cy + q * Math.sin(a))}`; };
  let out = "";
  for(let i = 0; i < count; i++){
    const s = a0 + (a1 - a0) * i / count, e = a0 + (a1 - a0) * (i + 1) / count;
    out += `<path d="M${P(s, r)} L${P((s + e) / 2, r + h)} L${P(e, r)} Z" fill="${fill}"/>`;
  }
  return out;
}
/* A wing of skin with three fingers in it, which is what tells a bat and
   a dragon from a bird. `dir` is which side of the body it grows on. */
function membrane(x, y, dir, w, h, fill, op){
  const P = (fx, fy) => `${svgn(x + dir * w * fx)} ${svgn(y + h * fy)}`;
  return `<path d="M${P(0, 0)} C ${P(.45, -.62)} ${P(.9, -.5)} ${P(1, -.2)}`
       + ` Q ${P(.8, .2)} ${P(.71, -.08)}`
       + ` Q ${P(.53, .4)} ${P(.45, .09)}`
       + ` Q ${P(.26, .56)} ${P(.2, .24)}`
       + ` Q ${P(.08, .56)} ${P(0, .46)} Z" fill="${fill}"`
       + (op ? ` opacity="${op}"` : "") + `/>`;
}
// a row of teeth along a jaw
function toothRow(x0, x1, y, h, count, up, fill){
  const w = (x1 - x0) / count;
  let out = "";
  for(let i = 0; i < count; i++){
    const a = x0 + i * w, b = a + w * .8;
    out += `<path d="M${svgn(a)} ${svgn(y)} L${svgn(b)} ${svgn(y)}`
         + ` L${svgn((a + b) / 2)} ${svgn(y + (up ? -h : h))} Z" fill="${fill || "#fff"}"/>`;
  }
  return out;
}
/* Circles set along an arc. A lion's mane is a ring of them, and the
   same call with a smaller radius gives the second ring it grows. */
function beads(cx, cy, r, a0, a1, count, rr, fill){
  let out = "";
  for(let i = 0; i < count; i++){
    const a = (a0 + (a1 - a0) * i / (count - 1)) * Math.PI / 180;
    out += `<circle cx="${svgn(cx + r * Math.cos(a))}" cy="${svgn(cy + r * Math.sin(a))}"`
         + ` r="${svgn(rr)}" fill="${fill}"/>`;
  }
  return out;
}
// three whiskers on one side of a face; `dir` is which side
function whiskers(x, y, dir, len, c){
  let out = "";
  for(const k of [-1, 0, 1]){
    out += `<path d="M${svgn(x)} ${svgn(y)} Q ${svgn(x + dir * len * .6)} ${svgn(y + k * 3)}`
         + ` ${svgn(x + dir * len)} ${svgn(y + k * 6.5)}" stroke="${c}" stroke-width="1.5"`
         + ` fill="none" stroke-linecap="round"/>`;
  }
  return out;
}
// a six-sided plate, for the shell of a turtle
function hexPlate(cx, cy, r, fill, stroke){
  const pts = [];
  for(let i = 0; i < 6; i++){
    const a = (-90 + i * 60) * Math.PI / 180;
    pts.push(svgn(cx + r * Math.cos(a)) + " " + svgn(cy + r * Math.sin(a)));
  }
  return `<path d="M${pts.join(" L")} Z" fill="${fill}" stroke="${stroke}"`
       + ` stroke-width="1.6" stroke-linejoin="round"/>`;
}
// one feathery gill: a stalk with three lobes on the end of it
function gill(x, y, tx, ty, c){
  const back = tx < x ? 4.2 : -4.2;
  return `<path d="M${svgn(x)} ${svgn(y)} Q ${svgn((x + tx) / 2)} ${svgn((y + ty) / 2 - 3)} ${svgn(tx)} ${svgn(ty)}"`
       + ` stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`
       + `<circle cx="${svgn(tx)}" cy="${svgn(ty)}" r="3.8" fill="${c}"/>`
       + `<circle cx="${svgn(tx + back)}" cy="${svgn(ty - 4.6)}" r="3.2" fill="${c}"/>`
       + `<circle cx="${svgn(tx + back)}" cy="${svgn(ty + 4.6)}" r="3.2" fill="${c}"/>`;
}

/* --- the twelve animals ---
   Each one is told its colours and its stage and hands back
   {g, eye, mouth} and, when the default corner is taken, star. */
const PET_SHAPES = {
  /* A bear is its ears: round, set high and far apart. Then a pale
     muzzle with a small dark nose, small eyes close together, and no
     tail at all - the eyes and the missing tail are what stop it from
     reading as a cat. */
  bear(it){
    const g = earRound(30, 28, 10, it.c2, tint(it.c1, .3))
      + earRound(70, 28, 10, it.c2, tint(it.c1, .3))
      + `<ellipse cx="50" cy="80" rx="25" ry="20" fill="${it.c1}"/>`
      + paws(50, 96, 15, 9.5, 6.5, it.c2)
      + `<ellipse cx="50" cy="83" rx="15" ry="13" fill="#fff" opacity=".28"/>`
      + `<circle cx="50" cy="45" r="22" fill="${it.c1}"/>`
      + `<ellipse cx="50" cy="55" rx="13.5" ry="9.5" fill="${tint(it.c1, .45)}"/>`
      + `<ellipse cx="50" cy="50" rx="4.8" ry="3.6" fill="#3b2a1e"/>`;
    return {g, eye: {xs: [43.5, 56.5], y: 40, r: 5.2}, mouth: {x: 50, y: 56, w: 11, d: 5}};
  },

  /* An owl is one egg, not a head on a body, and what says owl is the
     heart-shaped veil round the face, two huge ringed eyes and the
     little hooked beak between them. The beak is the mouth. */
  owl(it){
    const veil = tint(it.c1, .78);
    const wing = shade(it.c2, .18);
    const g = `<path d="M30 52 C 16 60, 16 80, 27 89 C 33 80, 33 63, 32 52 Z" fill="${wing}"/>`
      + `<path d="M70 52 C 84 60, 84 80, 73 89 C 67 80, 67 63, 68 52 Z" fill="${wing}"/>`
      + `<path d="M32 38 L28 24 L44 31 Z" fill="${it.c2}"/>`
      + `<path d="M68 38 L72 24 L56 31 Z" fill="${it.c2}"/>`
      + `<ellipse cx="50" cy="62" rx="28" ry="34" fill="${it.c1}"/>`
      + paws(50, 95, 9, 6.5, 3.6, "#ffb020")
      + `<path d="M50 82 C 41 82, 38 76, 39 71 C 44 76, 56 76, 61 71 C 62 76, 59 82, 50 82 Z" fill="${veil}" opacity=".55"/>`
      + `<path d="M50 70 C 34 63, 31 45, 38 39 C 44 35, 48 40, 50 46 C 52 40, 56 35, 62 39 C 69 45, 66 63, 50 70 Z" fill="${veil}"/>`
      + `<circle cx="41" cy="51" r="10" fill="#fff"/>`
      + `<circle cx="59" cy="51" r="10" fill="#fff"/>`
      + `<circle cx="41" cy="51" r="10" fill="none" stroke="${it.c2}" stroke-width="1.8"/>`
      + `<circle cx="59" cy="51" r="10" fill="none" stroke="${it.c2}" stroke-width="1.8"/>`
      + `<path d="M50 59 L45.5 63 L50 70 L54.5 63 Z" fill="#ffb020"/>`
      + `<path d="M50 65 L46.6 64.5 L50 70 L53.4 64.5 Z" fill="#e08a10"/>`;
    return {g, eye: {xs: [41, 59], y: 51, r: 7.5}, mouth: "own", star: [50, 18]};
  },

  /* A dragon: five spikes running from the crown down the back, wings of
     skin with fingers in them, and a tail that ends in a point. The
     wings are folded at the first stage and open from the second, which
     is the one growth an animal here has always had. */
  dragon(it, s){
    const dark = shade(it.c2, .14);
    const wing = s >= 2
      ? membrane(36, 58, -1, 26, 32, dark) + membrane(64, 58, 1, 26, 32, dark)
      : membrane(38, 62, -1, 15, 20, dark) + membrane(62, 62, 1, 15, 20, dark);
    const g = `<path d="M42 92 C 32 102, 19 102, 13 92 C 22 93, 32 88, 38 80 Z" fill="${it.c2}"/>`
      + `<path d="M13 92 L13 82 L21 89 Z" fill="${it.c2}"/>`
      + wing
      + ridge(50, 38, 17.5, -108, 8, 5, 8, dark)
      + `<ellipse cx="50" cy="76" rx="21" ry="24" fill="${it.c1}"/>`
      + paws(50, 98, 12, 9.5, 6.5, it.c2)
      + `<ellipse cx="50" cy="80" rx="12.5" ry="15" fill="${tint(it.c1, .5)}"/>`
      + `<circle cx="50" cy="37" r="18" fill="${it.c1}"/>`
      + `<ellipse cx="50" cy="49" rx="15.5" ry="10.5" fill="${tint(it.c1, .45)}"/>`
      + `<path d="M36 52 Q 50 60, 64 52" stroke="${dark}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
      + `<ellipse cx="44.5" cy="44.5" rx="2" ry="1.5" fill="${shade(it.c2, .35)}"/>`
      + `<ellipse cx="55.5" cy="44.5" rx="2" ry="1.5" fill="${shade(it.c2, .35)}"/>`;
    return {g, eye: {xs: [42.5, 57.5], y: 33, r: 5.6}, mouth: {x: 50, y: 50, w: 12, d: 4.5}};
  },

  /* A crocodile can only be told side on: a long flat snout full of
     triangular teeth, eyes sitting on top of the head rather than in it,
     and a sawtooth back. The jaw is the mouth. */
  croc(it){
    const dark = shade(it.c2, .18);
    const g = `<path d="M28 55 C 16 52, 12 63, 15 77 C 21 69, 27 67, 34 70 Z" fill="${it.c1}"/>`
      + ridge(42, 70, 22, -168, -80, 4, 8, dark)
      + `<ellipse cx="42" cy="68" rx="26" ry="18" fill="${it.c1}"/>`
      + paws(42, 86, 15, 8.5, 5.5, it.c2)
      + `<ellipse cx="42" cy="76" rx="18" ry="7.5" fill="${tint(it.c1, .5)}"/>`
      + `<ellipse cx="64" cy="56" rx="17" ry="13" fill="${it.c1}"/>`
      + `<path d="M55 46 L85 51 Q92 56, 85 61 L55 64 Z" fill="${it.c1}"/>`
      + `<path d="M57 61 L85 61 Q91 63.5, 85 66 L57 67 Z" fill="${tint(it.c1, .35)}"/>`
      + toothRow(59, 84, 61, 5.4, 6, false, "#fff")
      + toothRow(60, 83, 61, 5, 5, true, "#fff")
      + `<path d="M55 60 L88 58.5" stroke="${dark}" stroke-width="1.8" stroke-linecap="round"/>`
      + `<ellipse cx="84" cy="53" rx="2.2" ry="1.6" fill="${dark}"/>`
      + `<circle cx="59" cy="42" r="9" fill="${it.c1}"/>`;
    return {g, eye: {xs: [59], y: 41, r: 5.4}, mouth: "own"};
  },

  /* A rabbit: two long ears with pink inside them, a triangular nose,
     two front teeth and a white bobtail. */
  rabbit(it){
    const inner = "#ffd6e6";
    const g = `<path d="M44 33 C 37 24, 35 15, 39 14 C 44 13, 46 22, 48 31 Z" fill="${it.c1}"/>`
      + `<path d="M44.6 31 C 39.5 24, 38 17.5, 40.4 17 C 43 17, 44.4 23, 46 30 Z" fill="${inner}"/>`
      + `<path d="M56 33 C 63 24, 65 15, 61 14 C 56 13, 54 22, 52 31 Z" fill="${it.c1}"/>`
      + `<path d="M55.4 31 C 60.5 24, 62 17.5, 59.6 17 C 57 17, 55.6 23, 54 30 Z" fill="${inner}"/>`
      + `<circle cx="69" cy="74" r="7.5" fill="${tint(it.c1, .45)}"/>`
      + `<circle cx="76" cy="78" r="6.8" fill="${tint(it.c1, .45)}"/>`
      + `<circle cx="70" cy="82" r="6.8" fill="${tint(it.c1, .45)}"/>`
      + `<circle cx="69.5" cy="76" r="4.2" fill="#fff" opacity=".7"/>`
      + `<ellipse cx="50" cy="80" rx="20" ry="18" fill="${it.c1}"/>`
      + paws(50, 95, 12, 9, 6, it.c2)
      + `<ellipse cx="50" cy="83" rx="12" ry="11" fill="#fff" opacity=".32"/>`
      + `<circle cx="50" cy="45" r="19" fill="${it.c1}"/>`
      + `<path d="M50 53 L45.6 48 L54.4 48 Z" fill="${it.c2}"/>`
      + `<path d="M46.7 58 L49.4 58 L49.4 63 Q48 64.4 46.7 63 Z" fill="#fff"/>`
      + `<path d="M50.6 58 L53.3 58 L53.3 63 Q52 64.4 50.6 63 Z" fill="#fff"/>`;
    return {g, eye: {xs: [42.5, 57.5], y: 43, r: 6}, mouth: {x: 50, y: 55, w: 9, d: 3.4}};
  },

  /* Lupi is not a species and is deliberately left as one: a round
     yellow creature with pointed ears and spots, exactly what it has
     always been. Redrawing it as a giraffe would not have been a better
     drawing of the same animal, it would have been a different animal,
     and a child who owns it should find the same friend it had
     yesterday. The giraffe the catalogue wants arrives as a new id. */
  critter(it){
    const g = earTri(37, 32, 48, 27, 32, 15, it.c2, tint(it.c1, .3))
      + earTri(63, 32, 52, 27, 68, 15, it.c2, tint(it.c1, .3))
      + `<ellipse cx="50" cy="80" rx="23" ry="18" fill="${it.c1}"/>`
      + paws(50, 95, 13, 9, 6, it.c2)
      + `<circle cx="38" cy="82" r="5.5" fill="${it.c2}" opacity=".5"/>`
      + `<circle cx="60" cy="77" r="4.2" fill="${it.c2}" opacity=".5"/>`
      + `<circle cx="54" cy="88" r="4.6" fill="${it.c2}" opacity=".5"/>`
      + `<circle cx="50" cy="45" r="20" fill="${it.c1}"/>`
      + `<circle cx="36" cy="40" r="4" fill="${it.c2}" opacity=".45"/>`
      + `<ellipse cx="50" cy="55" rx="11.5" ry="8" fill="${tint(it.c1, .45)}"/>`
      + `<ellipse cx="50" cy="50.5" rx="4.2" ry="3.2" fill="${shade(it.c2, .4)}"/>`;
    return {g, eye: {xs: [43, 57], y: 41, r: 5.8}, mouth: {x: 50, y: 56, w: 10, d: 4.5}};
  },

  /* A dolphin only works side on, and what makes it one is the long
     rostrum, the curved dorsal fin and the tail that ends in a V. One
     eye, because side on there is one eye. */
  dolphin(it){
    const g = `<path d="M26 70 L11 54 L18 70 L11 86 Z" fill="${it.c2}"/>`
      + `<path d="M45 41 C 49 25, 62 22, 64 28 C 58 30, 51 37, 49 45 Z" fill="${it.c2}"/>`
      + `<path d="M22 72 C 19 48, 44 35, 62 43 C 72 47, 80 54, 89 58 Q 92.5 60.5, 88 64`
      + ` C 78 67, 70 68, 64 70 C 58 81, 36 88, 22 72 Z" fill="${it.c1}"/>`
      + `<path d="M26 77 C 42 86, 60 80, 68 66 C 63 79, 40 85, 26 77 Z" fill="${tint(it.c1, .62)}"/>`
      + `<path d="M52 74 C 47 84, 40 90, 44 92 C 51 89, 58 81, 60 75 Z" fill="${it.c2}"/>`;
    return {g, eye: {xs: [69], y: 55, r: 4}, mouth: {x: 77, y: 60, w: 21, d: 2.6}};
  },

  /* An axolotl is three feathery gills on each side of a wide flat head
     and a mouth that grins from one side of it to the other. */
  axolotl(it){
    const frill = "#ff8fb8";
    const g = `<path d="M40 88 C 28 99, 16 97, 13 87 C 22 89, 32 84, 38 75 Z" fill="${it.c2}"/>`
      + `<path d="M40 88 C 30 97, 20 96, 15 89" stroke="${frill}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
      + `<ellipse cx="50" cy="78" rx="19" ry="19" fill="${it.c1}"/>`
      + paws(50, 92, 17, 7.5, 5, it.c2)
      + paws(50, 68, 22, 7, 4.6, it.c2)
      + `<ellipse cx="50" cy="82" rx="11" ry="10" fill="#fff" opacity=".3"/>`
      + gill(30, 39, 16, 32, frill) + gill(28, 47, 13, 45, frill) + gill(30, 55, 16, 58, frill)
      + gill(70, 39, 84, 32, frill) + gill(72, 47, 87, 45, frill) + gill(70, 55, 84, 58, frill)
      + `<ellipse cx="50" cy="47" rx="23" ry="17" fill="${it.c1}"/>`
      + `<circle cx="36" cy="53" r="4.5" fill="${frill}" opacity=".3"/>`
      + `<circle cx="64" cy="53" r="4.5" fill="${frill}" opacity=".3"/>`;
    return {g, eye: {xs: [40, 60], y: 43, r: 4}, mouth: {x: 50, y: 52, w: 22, d: 5.5}};
  },

  /* A dog: one ear down and one up, which no other animal here has, a
     black nose, a dark patch over one eye and a tail held high. */
  dog(it){
    const patch = shade(it.c2, .3);
    const g = `<path d="M63 80 C 74 80, 80 72, 79 63 C 79 57.5, 86 57.5, 86 64 C 87 77, 77 86, 64 86 Z" fill="${it.c2}"/>`
      + `<ellipse cx="50" cy="82" rx="21" ry="16" fill="${it.c1}"/>`
      + paws(50, 95, 12, 9, 6, it.c2)
      + `<ellipse cx="50" cy="85" rx="12" ry="10" fill="#fff" opacity=".3"/>`
      + `<path d="M34 33 C 23 35, 19 50, 24 62 C 31 61, 35 52, 37 43 Z" fill="${it.c2}"/>`
      + `<path d="M63 33 L71 15 L75 39 Z" fill="${it.c2}"/>`
      + `<circle cx="50" cy="46" r="20" fill="${it.c1}"/>`
      + `<path d="M40 28 C 30 31, 28 44, 33 53 C 41 53, 46 44, 47 34 Z" fill="${patch}"/>`
      + `<ellipse cx="50" cy="57" rx="12.5" ry="8.5" fill="${tint(it.c1, .5)}"/>`
      + `<path d="M47 62 Q50 69 53 62 Z" fill="#ff8fa3"/>`
      + `<ellipse cx="50" cy="51.5" rx="5" ry="3.8" fill="#2f2a2a"/>`;
    return {g, eye: {xs: [41, 58], y: 44, r: 5.5}, mouth: {x: 50, y: 59, w: 10, d: 4.5}};
  },

  /* A unicorn is the horn, and this one is called Rainbow, so the mane
     and the tail are the rainbow: three strands, three colours. Hooves
     rather than paws, because a hoof is the other half of the word. */
  unicorn(it){
    const rb = ["#ff6b6b", "#ffd166", "#6fe0a8"];
    const g = `<path d="M33 73 C 22 78, 16 88, 18 99" stroke="${rb[0]}" stroke-width="7" fill="none" stroke-linecap="round"/>`
      + `<path d="M34 78 C 24 83, 19 91, 21 101" stroke="${rb[1]}" stroke-width="7" fill="none" stroke-linecap="round"/>`
      + `<path d="M35 83 C 27 88, 23 94, 25 103" stroke="${rb[2]}" stroke-width="7" fill="none" stroke-linecap="round"/>`
      + `<ellipse cx="50" cy="80" rx="21" ry="17" fill="${it.c1}"/>`
      + `<path d="M41 92 L47 92 L46 104 L42 104 Z" fill="${it.c1}"/>`
      + `<path d="M53 92 L59 92 L58 104 L54 104 Z" fill="${it.c1}"/>`
      + `<path d="M41.7 100 L46.3 100 L46 104 L42 104 Z" fill="${shade(it.c2, .35)}"/>`
      + `<path d="M53.7 100 L58.3 100 L58 104 L54 104 Z" fill="${shade(it.c2, .35)}"/>`
      + `<path d="M54 26 C 66 28, 70 36, 68 45" stroke="${rb[0]}" stroke-width="7" fill="none" stroke-linecap="round"/>`
      + `<path d="M58 31 C 69 35, 72 43, 70 52" stroke="${rb[1]}" stroke-width="7" fill="none" stroke-linecap="round"/>`
      + `<path d="M62 39 C 71 45, 72 54, 68 62" stroke="${rb[2]}" stroke-width="7" fill="none" stroke-linecap="round"/>`
      + earTri(37, 32, 46, 28, 32, 18, it.c1, tint(it.c1, .4))
      + earTri(63, 32, 54, 28, 68, 18, it.c1, tint(it.c1, .4))
      + `<circle cx="50" cy="44" r="18" fill="${it.c1}"/>`
      + `<path d="M50 12 L46.4 31 L53.6 31 Z" fill="#fff6d8" stroke="${shade(it.c2, .1)}" stroke-width="1.7" stroke-linejoin="round"/>`
      + `<path d="M47.4 26.5 L52.8 25" stroke="${shade(it.c2, .1)}" stroke-width="1.5" stroke-linecap="round"/>`
      + `<path d="M48.2 21.5 L52 20.4" stroke="${shade(it.c2, .1)}" stroke-width="1.5" stroke-linecap="round"/>`
      + `<path d="M48.9 17 L51.3 16.3" stroke="${shade(it.c2, .1)}" stroke-width="1.5" stroke-linecap="round"/>`
      + `<ellipse cx="50" cy="54" rx="11.5" ry="8" fill="${tint(it.c1, .5)}"/>`
      + `<ellipse cx="46.5" cy="51.5" rx="1.7" ry="1.3" fill="${shade(it.c2, .3)}"/>`
      + `<ellipse cx="53.5" cy="51.5" rx="1.7" ry="1.3" fill="${shade(it.c2, .3)}"/>`;
    return {g, eye: {xs: [43, 57], y: 42, r: 6}, mouth: {x: 50, y: 56, w: 9, d: 4}};
  },

  /* Hvezdik is the second one left alone. A round yellow creature with a
     single horn is what it has always been, and turning it into a hamster
     would have taken somebody's friend away rather than drawn it better.
     The hamster the catalogue wants arrives as a new id. */
  hornling(it){
    const g = `<ellipse cx="50" cy="70" rx="25" ry="27" fill="${it.c1}"/>`
      + paws(50, 94, 13, 9.5, 6.5, it.c2)
      + `<ellipse cx="50" cy="78" rx="15" ry="14" fill="#fff" opacity=".3"/>`
      + `<path d="M50 19 L43.6 44 L56.4 44 Z" fill="#fff8d6" stroke="${it.c2}" stroke-width="2.4" stroke-linejoin="round"/>`
      + `<path d="M45.4 37 L54.4 35.4" stroke="${it.c2}" stroke-width="1.8" stroke-linecap="round"/>`
      + `<path d="M46.9 31 L52.9 29.9" stroke="${it.c2}" stroke-width="1.8" stroke-linecap="round"/>`
      + `<circle cx="34" cy="70" r="5" fill="${it.c2}" opacity=".35"/>`
      + `<circle cx="66" cy="70" r="5" fill="${it.c2}" opacity=".35"/>`;
    return {g, eye: {xs: [42, 58], y: 62, r: 6.5}, mouth: {x: 50, y: 76, w: 11, d: 5}};
  },

  /* A bat: wings of skin with fingers, ears taller than its head, a nose
     shaped like a V and feet too small to stand on. The wings open
     further from the second stage, the way the dragon's do. */
  bat(it, s){
    const w = s >= 2 ? 27 : 21, h = s >= 2 ? 34 : 27;
    const g = membrane(38, 60, -1, w, h, it.c2) + membrane(62, 60, 1, w, h, it.c2)
      + `<path d="M40 52 C 32 40, 28 25, 32 21 C 38 24, 44 38, 47 48 Z" fill="${it.c1}"/>`
      + `<path d="M40.6 48 C 35.5 39, 33 29, 35 27 C 39 30, 42.6 39, 45 46 Z" fill="${shade(it.c2, .1)}"/>`
      + `<path d="M60 52 C 68 40, 72 25, 68 21 C 62 24, 56 38, 53 48 Z" fill="${it.c1}"/>`
      + `<path d="M59.4 48 C 64.5 39, 67 29, 65 27 C 61 30, 57.4 39, 55 46 Z" fill="${shade(it.c2, .1)}"/>`
      + `<circle cx="50" cy="64" r="20" fill="${it.c1}"/>`
      + paws(50, 84, 6, 4.5, 3.4, it.c2)
      + `<ellipse cx="50" cy="69" rx="13.5" ry="11" fill="${tint(it.c1, .35)}"/>`
      + `<path d="M45.5 68 L54.5 68 L50 74 Z" fill="${shade(it.c2, .25)}"/>`
      + `<path d="M46.6 77 L49 77 L47.8 81.5 Z" fill="#fff"/>`
      + `<path d="M51 77 L53.4 77 L52.2 81.5 Z" fill="#fff"/>`;
    return {g, eye: {xs: [43, 57], y: 61, r: 5.5}, mouth: {x: 50, y: 76, w: 9, d: 3.4}, star: [50, 26]};
  },

  /* --- the sixteen the catalogue added ---
     Same two rules: nothing rotates, every path is absolute, and every
     one of them has to be nameable as an animal and nameable as
     nothing else. */

  /* A cat is whiskers, upright pointed ears and a long tail held up
     with rings on it. The tabby stripes on the forehead and the small
     pink nose keep it from reading as the dog. */
  cat(it){
    const inner = "#ffc2d4", dark = shade(it.c2, .35), stripe = shade(it.c2, .2);
    const g = `<path d="M68 88 C 85 88, 89 72, 82 58" stroke="${it.c2}" stroke-width="8" fill="none" stroke-linecap="round"/>`
      + `<path d="M80 84 L86 80" stroke="${stripe}" stroke-width="3" stroke-linecap="round"/>`
      + `<path d="M84 74 L89 72" stroke="${stripe}" stroke-width="3" stroke-linecap="round"/>`
      + earTri(33, 33, 45, 27, 30, 13, it.c1, inner)
      + earTri(67, 33, 55, 27, 70, 13, it.c1, inner)
      + `<ellipse cx="50" cy="80" rx="21" ry="18" fill="${it.c1}"/>`
      + paws(50, 95, 12, 9, 6, it.c1)
      + `<ellipse cx="50" cy="84" rx="12" ry="11" fill="${tint(it.c1, .55)}"/>`
      + `<path d="M32 74 L40 72" stroke="${stripe}" stroke-width="3" stroke-linecap="round"/>`
      + `<path d="M31 82 L39 81" stroke="${stripe}" stroke-width="3" stroke-linecap="round"/>`
      + `<circle cx="50" cy="45" r="20" fill="${it.c1}"/>`
      + `<path d="M44 30 L46 35" stroke="${stripe}" stroke-width="2.6" stroke-linecap="round"/>`
      + `<path d="M50 28 L50 34" stroke="${stripe}" stroke-width="2.6" stroke-linecap="round"/>`
      + `<path d="M56 30 L54 35" stroke="${stripe}" stroke-width="2.6" stroke-linecap="round"/>`
      + `<ellipse cx="44" cy="56" rx="7" ry="5.5" fill="${tint(it.c1, .55)}"/>`
      + `<ellipse cx="56" cy="56" rx="7" ry="5.5" fill="${tint(it.c1, .55)}"/>`
      + whiskers(37, 55, -1, 18, dark) + whiskers(63, 55, 1, 18, dark)
      + `<path d="M50 53 L45.6 49 L54.4 49 Z" fill="${dark}"/>`;
    return {g, eye: {xs: [42, 58], y: 42, r: 6}, mouth: {x: 50, y: 57, w: 9, d: 3.2}};
  },

  /* A penguin stands upright, has no neck, and is drawn by three things:
     the white front from chin to feet, flippers flat against the sides
     and orange feet sticking out at the bottom. The wedge of a beak is
     the mouth. */
  penguin(it){
    const belly = "#fdf6e8", foot = "#ffb020";
    const g = `<path d="M25 60 C 14 66, 16 86, 27 92 C 28 80, 28 68, 31 60 Z" fill="${it.c2}"/>`
      + `<path d="M75 60 C 86 66, 84 86, 73 92 C 72 80, 72 68, 69 60 Z" fill="${it.c2}"/>`
      + `<path d="M34 92 C 26 94, 24 102, 33 102 L45 102 C 47 95, 42 92, 38 92 Z" fill="${foot}"/>`
      + `<path d="M66 92 C 74 94, 76 102, 67 102 L55 102 C 53 95, 58 92, 62 92 Z" fill="${foot}"/>`
      + `<ellipse cx="50" cy="62" rx="26" ry="34" fill="${it.c1}"/>`
      + `<path d="M50 32 C 33 34, 30 52, 34 68 C 38 86, 62 86, 66 68 C 70 52, 67 34, 50 32 Z" fill="${belly}"/>`
      + `<path d="M42 53 L58 53 L50 63 Z" fill="${foot}"/>`
      + `<path d="M44 58 L56 58 L50 63 Z" fill="${shade(foot, .22)}"/>`;
    return {g, eye: {xs: [42, 58], y: 46, r: 5.4}, mouth: "own"};
  },

  /* A fox: a face that narrows to a point, white cheeks and chest, dark
     socks, and above all the tail, as thick as the body and tipped with
     white. The ears are taller and wider than the cat's. */
  fox(it){
    const white = "#fff6ea", sock = shade(it.c2, .5);
    const g = `<path d="M33 90 C 17 88, 15 62, 26 52" stroke="${it.c1}" stroke-width="15" fill="none" stroke-linecap="round"/>`
      + `<circle cx="26" cy="52" r="8.5" fill="${white}"/>`
      + earTri(34, 36, 48, 26, 28, 12, it.c1, shade(it.c2, .3))
      + earTri(66, 36, 52, 26, 72, 12, it.c1, shade(it.c2, .3))
      + `<ellipse cx="50" cy="84" rx="20" ry="15" fill="${it.c1}"/>`
      + paws(50, 97, 12, 8.5, 5.5, sock)
      + `<ellipse cx="50" cy="88" rx="12" ry="9" fill="${white}"/>`
      + `<path d="M31 33 C 29 52, 38 66, 50 70 C 62 66, 71 52, 69 33 Z" fill="${it.c1}"/>`
      + `<path d="M38 47 C 35 60, 42 68, 50 70 C 58 68, 65 60, 62 47 Z" fill="${white}"/>`
      + `<path d="M50 59 L45.4 54.4 L54.6 54.4 Z" fill="${sock}"/>`;
    return {g, eye: {xs: [41, 59], y: 45, r: 5.4}, mouth: {x: 50, y: 62, w: 8, d: 3}};
  },

  /* A hedgehog is a cap of spines pulled down over a small pale face
     with a pointed snout. The second row of spines is the growth it
     gets: the same animal, more of it. */
  hedgehog(it, s){
    const dark = shade(it.c2, .22);
    const g = `<ellipse cx="50" cy="62" rx="30" ry="25" fill="${it.c2}"/>`
      + ridge(50, 64, 30, 176, 364, 11, 9, dark)
      + (s >= 2 ? ridge(50, 66, 23, 186, 354, 9, 8, it.c2) : "")
      + paws(50, 92, 17, 8, 5.5, tint(it.c1, .15))
      + `<ellipse cx="50" cy="74" rx="20" ry="16" fill="${it.c1}"/>`
      + `<ellipse cx="50" cy="83" rx="8.5" ry="6.5" fill="${tint(it.c1, .4)}"/>`
      + `<ellipse cx="50" cy="79" rx="4" ry="3.2" fill="#3b2a1e"/>`
      + whiskers(42, 83, -1, 14, shade(it.c2, .1))
      + whiskers(58, 83, 1, 14, shade(it.c2, .1));
    return {g, eye: {xs: [42, 58], y: 70, r: 5}, mouth: {x: 50, y: 85, w: 8, d: 2.6}};
  },

  /* A turtle is the shell and nothing else would do: a dome with plates
     drawn on it, a rim along the bottom, a small round head looking out
     over the top and four stubby legs at the corners. */
  turtle(it){
    const shell = it.c2, plate = tint(it.c2, .22), rim = shade(it.c2, .2);
    const g = `<path d="M41 50 L59 50 L59 64 L41 64 Z" fill="${it.c1}"/>`
      + `<path d="M14 88 C 14 50, 86 50, 86 88 Z" fill="${shell}"/>`
      + hexPlate(50, 70, 12, plate, rim)
      + hexPlate(28, 80, 9, plate, rim)
      + hexPlate(72, 80, 9, plate, rim)
      + hexPlate(50, 88, 9, plate, rim)
      + `<path d="M14 88 C 14 96, 86 96, 86 88 Z" fill="${tint(it.c2, .45)}"/>`
      + `<path d="M24 86 C 10 88, 8 100, 20 100 C 29 100, 32 92, 32 87 Z" fill="${it.c1}"/>`
      + `<path d="M76 86 C 90 88, 92 100, 80 100 C 71 100, 68 92, 68 87 Z" fill="${it.c1}"/>`
      + paws(50, 96, 15, 9, 6, it.c1)
      + `<ellipse cx="50" cy="43" rx="16" ry="15" fill="${it.c1}"/>`
      + `<ellipse cx="44" cy="49" rx="2.4" ry="1.8" fill="${shade(it.c1, .35)}"/>`
      + `<ellipse cx="56" cy="49" rx="2.4" ry="1.8" fill="${shade(it.c1, .35)}"/>`;
    return {g, eye: {xs: [44, 56], y: 40, r: 5.2}, mouth: {x: 50, y: 52, w: 9, d: 3.2}};
  },

  /* A frog: eyes up on two bumps that stand clear of the head, a mouth
     from one side of the face to the other, hind legs folded up beside
     the body and toes spread out in front. */
  frog(it){
    const pale = tint(it.c1, .55), dark = shade(it.c2, .12);
    const toes = (x, y, r) => `<circle cx="${svgn(x - r * 1.5)}" cy="${svgn(y)}" r="${r}" fill="${dark}"/>`
      + `<circle cx="${svgn(x)}" cy="${svgn(y + 1.5)}" r="${r}" fill="${dark}"/>`
      + `<circle cx="${svgn(x + r * 1.5)}" cy="${svgn(y)}" r="${r}" fill="${dark}"/>`;
    const g = `<ellipse cx="23" cy="78" rx="12" ry="16" fill="${it.c2}"/>`
      + `<ellipse cx="77" cy="78" rx="12" ry="16" fill="${it.c2}"/>`
      + toes(21, 97, 4.4) + toes(79, 97, 4.4)
      + `<ellipse cx="50" cy="76" rx="26" ry="21" fill="${it.c1}"/>`
      + `<ellipse cx="50" cy="82" rx="16" ry="13" fill="${pale}"/>`
      + toes(39, 92, 5) + toes(61, 92, 5)
      + `<ellipse cx="50" cy="52" rx="28" ry="19" fill="${it.c1}"/>`
      + `<circle cx="34" cy="38" r="11" fill="${it.c1}"/>`
      + `<circle cx="66" cy="38" r="11" fill="${it.c1}"/>`;
    return {g, eye: {xs: [34, 66], y: 38, r: 7.5}, mouth: {x: 50, y: 57, w: 32, d: 7}};
  },

  /* An elephant is the trunk, and after that the ears: two fans wider
     than the head. Small tusks and a smile that the trunk hangs down
     the middle of, which is why the mouth is drawn here. */
  elephant(it){
    const earIn = shade(it.c2, .12), tusk = "#fff6e0";
    const g = `<circle cx="26" cy="50" r="18" fill="${it.c2}"/>`
      + `<circle cx="27" cy="52" r="11" fill="${earIn}"/>`
      + `<circle cx="74" cy="50" r="18" fill="${it.c2}"/>`
      + `<circle cx="73" cy="52" r="11" fill="${earIn}"/>`
      + `<ellipse cx="50" cy="84" rx="24" ry="16" fill="${it.c1}"/>`
      + paws(50, 97, 14, 10, 6.5, it.c2)
      + `<circle cx="50" cy="48" r="23" fill="${it.c1}"/>`
      + `<path d="M36 57 Q 50 71 64 57" stroke="#22314f" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
      + `<path d="M43 64 C 41 71, 42 76, 45 78" stroke="${tusk}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      + `<path d="M57 64 C 59 71, 58 76, 55 78" stroke="${tusk}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      + `<path d="M44 56 C 41 74, 43 88, 51 93 C 57 96, 61 89, 57 86 C 52 83, 50 74, 56 57 Z" fill="${it.c1}"/>`
      + `<path d="M45 66 L55 66" stroke="${shade(it.c2, .1)}" stroke-width="1.6" stroke-linecap="round"/>`
      + `<path d="M44 73 L54 73" stroke="${shade(it.c2, .1)}" stroke-width="1.6" stroke-linecap="round"/>`
      + `<path d="M45 80 L54 80" stroke="${shade(it.c2, .1)}" stroke-width="1.6" stroke-linecap="round"/>`;
    return {g, eye: {xs: [41, 59], y: 46, r: 5.2}, mouth: "own"};
  },

  /* A lion is the mane and only the mane: a ring of it all the way
     round a small face, with the ears poking out of the top and a tuft
     on the end of the tail. It grows a second, fuller ring. */
  lion(it, s){
    const mane = it.c2, deep = shade(it.c2, .18);
    const R = s >= 2 ? 26 : 23, n = s >= 2 ? 13 : 11, rr = s >= 2 ? 10 : 9;
    const g = `<path d="M69 88 C 84 86, 87 72, 81 64" stroke="${it.c1}" stroke-width="5" fill="none" stroke-linecap="round"/>`
      + `<circle cx="81" cy="62" r="6.5" fill="${mane}"/>`
      + `<ellipse cx="50" cy="84" rx="19" ry="14" fill="${it.c1}"/>`
      + paws(50, 96, 12, 9, 6, it.c1)
      + beads(50, 48, R - 7, 0, 327, 9, rr - 1, deep)
      + beads(50, 48, R, 0, 360 * (n - 1) / n, n, rr, mane)
      + earRound(33, 36, 7, it.c1, tint(it.c1, .5))
      + earRound(67, 36, 7, it.c1, tint(it.c1, .5))
      + `<circle cx="50" cy="48" r="20" fill="${it.c1}"/>`
      + `<ellipse cx="44" cy="58" rx="7" ry="5.5" fill="${tint(it.c1, .5)}"/>`
      + `<ellipse cx="56" cy="58" rx="7" ry="5.5" fill="${tint(it.c1, .5)}"/>`
      + `<path d="M50 56 L45.6 51.5 L54.4 51.5 Z" fill="${shade(it.c2, .35)}"/>`;
    return {g, eye: {xs: [43, 57], y: 45, r: 5.5}, mouth: {x: 50, y: 59, w: 10, d: 4}};
  },

  /* A panda is a bear with the pattern the pattern is for: black ears,
     black patches round the eyes, black arms and legs, everything else
     white. Nothing else here is black and white at all. */
  panda(it){
    const dark = it.c2, deep = shade(it.c2, .25);
    const g = earRound(30, 28, 10, dark, deep)
      + earRound(70, 28, 10, dark, deep)
      + `<path d="M28 72 C 20 78, 20 90, 27 94 C 33 90, 34 80, 36 74 Z" fill="${dark}"/>`
      + `<path d="M72 72 C 80 78, 80 90, 73 94 C 67 90, 66 80, 64 74 Z" fill="${dark}"/>`
      + `<ellipse cx="50" cy="80" rx="24" ry="19" fill="${it.c1}"/>`
      + paws(50, 96, 15, 10, 6.5, dark)
      + `<circle cx="50" cy="45" r="22" fill="${it.c1}"/>`
      + `<ellipse cx="40" cy="43" rx="8.5" ry="9.5" fill="${dark}"/>`
      + `<ellipse cx="60" cy="43" rx="8.5" ry="9.5" fill="${dark}"/>`
      + `<ellipse cx="50" cy="55" rx="11" ry="8" fill="${tint(it.c1, .35)}"/>`
      + `<ellipse cx="50" cy="52" rx="4.6" ry="3.4" fill="${deep}"/>`;
    return {g, eye: {xs: [40, 60], y: 43, r: 5.4}, mouth: {x: 50, y: 58, w: 10, d: 4}};
  },

  /* A capybara is a brick with a nose on it. Everything here is aimed at
     the two animals it kept turning into: a bear, because the colours
     are brown and the head was round, and a hamster, because it had
     whiskers and a heap of a body. So the head is a block with a flat
     top and straight sides, the ears are tiny and sit right on the
     corners rather than high and round, the eyes are small, set high and
     wide, the muzzle is the whole lower half of the head and ends in an
     enormous blunt nose pad, there are no whiskers at all, and the body
     is a barrel on short legs with no tail behind it.
     The head also overlaps the body on purpose: a capybara has no neck,
     and the drawing that left daylight between the two read as a head
     floating above a bear. */
  capybara(it){
    const muzzle = tint(it.c1, .3), dark = shade(it.c2, .3), pad = shade(it.c2, .5);
    const g = `<path d="M18 78 Q18 66 34 66 L66 66 Q82 66 82 78 L82 90 Q82 99 64 99`
      + ` L36 99 Q18 99 18 90 Z" fill="${it.c1}"/>`
      + paws(50, 97, 18, 9, 5, it.c2)
      + `<ellipse cx="50" cy="86" rx="19" ry="10" fill="${tint(it.c1, .26)}"/>`
      + earRound(27, 37, 4.8, it.c2, dark)
      + earRound(73, 37, 4.8, it.c2, dark)
      + `<path d="M26 44 Q26 34 36 34 L64 34 Q74 34 74 44 L74 60 Q74 70 62 70`
      + ` L38 70 Q26 70 26 60 Z" fill="${it.c1}"/>`
      + `<path d="M33 56 L67 56 L67 64 Q67 74 50 74 Q33 74 33 64 Z" fill="${muzzle}"/>`
      + `<rect x="40" y="57" width="20" height="10" rx="4.6" fill="${pad}"/>`
      + `<ellipse cx="45" cy="61" rx="1.8" ry="1.2" fill="${muzzle}"/>`
      + `<ellipse cx="55" cy="61" rx="1.8" ry="1.2" fill="${muzzle}"/>`;
    return {g, eye: {xs: [36.5, 63.5], y: 43, r: 3.8}, mouth: {x: 50, y: 70.5, w: 12, d: 2.2}};
  },

  /* A sloth hangs, and that is the whole drawing: a branch across the
     top, two long arms hooked over it by their claws, and everything
     else dangling. The dark mask round the eyes says which animal is
     doing the hanging. */
  sloth(it){
    const bark = "#8a6a4a", face = tint(it.c1, .55), mask = shade(it.c2, .45);
    const claw = (x) => `<path d="M${svgn(x - 6)} 24 C ${svgn(x - 7)} 14, ${svgn(x + 7)} 14, ${svgn(x + 6)} 24"`
      + ` stroke="${it.c2}" stroke-width="6" fill="none" stroke-linecap="round"/>`
      + `<path d="M${svgn(x - 8)} 20 C ${svgn(x - 10)} 13, ${svgn(x - 4)} 11, ${svgn(x - 2)} 15"`
      + ` stroke="${mask}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
      + `<path d="M${svgn(x - 3)} 17 C ${svgn(x - 3)} 11, ${svgn(x + 3)} 11, ${svgn(x + 3)} 16"`
      + ` stroke="${mask}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    const g = `<path d="M10 20 L90 20" stroke="${bark}" stroke-width="8" stroke-linecap="round"/>`
      + `<path d="M38 64 C 24 56, 22 34, 30 24" stroke="${it.c2}" stroke-width="10" fill="none" stroke-linecap="round"/>`
      + `<path d="M62 64 C 76 56, 78 34, 70 24" stroke="${it.c2}" stroke-width="10" fill="none" stroke-linecap="round"/>`
      + claw(30) + claw(70)
      + `<path d="M40 86 C 34 96, 36 104, 44 104" stroke="${it.c2}" stroke-width="9" fill="none" stroke-linecap="round"/>`
      + `<path d="M60 86 C 66 96, 64 104, 56 104" stroke="${it.c2}" stroke-width="9" fill="none" stroke-linecap="round"/>`
      + `<ellipse cx="50" cy="74" rx="20" ry="22" fill="${it.c1}"/>`
      + `<ellipse cx="50" cy="78" rx="12" ry="14" fill="${tint(it.c1, .3)}"/>`
      + `<circle cx="50" cy="54" r="18" fill="${it.c1}"/>`
      + `<ellipse cx="50" cy="56" rx="15" ry="14" fill="${face}"/>`
      + `<ellipse cx="42" cy="52" rx="6.5" ry="7.5" fill="${mask}"/>`
      + `<ellipse cx="58" cy="52" rx="6.5" ry="7.5" fill="${mask}"/>`
      + `<ellipse cx="50" cy="60" rx="4" ry="3" fill="${mask}"/>`;
    return {g, eye: {xs: [42, 58], y: 52, r: 4.6}, mouth: {x: 50, y: 64, w: 13, d: 4}};
  },

  /* A shark, side on like the dolphin, and told apart from it by every
     line: a snout that comes to a point, a dorsal fin with straight
     edges, a tail standing upright, gill slits, and a jaw full of
     triangles, which is the mouth. */
  shark(it){
    const belly = tint(it.c1, .62), dark = shade(it.c2, .2);
    const g = `<path d="M24 62 L10 38 L17 62 L10 88 Z" fill="${it.c2}"/>`
      + `<path d="M44 42 L54 16 L62 46 Z" fill="${it.c2}"/>`
      + `<path d="M42 72 L34 92 L50 80 Z" fill="${it.c2}"/>`
      + `<path d="M20 62 C 22 42, 46 36, 64 43 C 76 48, 86 55, 92 59 C 86 68, 74 78, 58 80 C 38 82, 20 76, 20 62 Z" fill="${it.c1}"/>`
      + `<path d="M26 74 C 40 82, 58 78, 72 66 C 66 76, 44 84, 26 74 Z" fill="${belly}"/>`
      + `<path d="M38 54 C 36 58, 36 62, 38 66" stroke="${dark}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
      + `<path d="M44 53 C 42 57, 42 62, 44 66" stroke="${dark}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
      + `<path d="M50 52 C 48 57, 48 62, 50 66" stroke="${dark}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
      + `<path d="M58 66 C 70 68, 82 64, 90 58" stroke="${dark}" stroke-width="2" fill="none" stroke-linecap="round"/>`
      + toothRow(60, 86, 66, 5, 6, false, "#fff");
    return {g, eye: {xs: [72], y: 53, r: 4.2}, mouth: "own"};
  },

  /* An octopus counts: eight arms, and a child will count them. A dome
     of a head sitting straight on top of them, suckers down every arm,
     and the star has to move out of the bottom corner because the arms
     are already there. */
  octopus(it){
    const sucker = tint(it.c1, .55);
    const arm = (x, tipX, tipY) => {
      const midX = (x + tipX) / 2;
      return `<path d="M${svgn(x - 5)} 60 C ${svgn(midX - 5)} ${svgn(tipY - 16)}, ${svgn(tipX - 5)} ${svgn(tipY - 8)}, ${svgn(tipX)} ${svgn(tipY)}`
        + ` C ${svgn(tipX + 5)} ${svgn(tipY - 8)}, ${svgn(midX + 5)} ${svgn(tipY - 16)}, ${svgn(x + 5)} 60 Z" fill="${it.c1}"/>`
        + `<circle cx="${svgn((x + midX) / 2)}" cy="${svgn(tipY - 20)}" r="2.4" fill="${sucker}"/>`
        + `<circle cx="${svgn(midX)}" cy="${svgn(tipY - 11)}" r="2.2" fill="${sucker}"/>`;
    };
    const g = arm(24, 12, 88) + arm(33, 26, 96) + arm(42, 40, 100) + arm(50, 52, 96)
      + arm(58, 62, 100) + arm(67, 74, 96) + arm(76, 88, 88)
      + `<ellipse cx="50" cy="42" rx="25" ry="27" fill="${it.c1}"/>`
      + `<ellipse cx="50" cy="64" rx="25" ry="10" fill="${it.c2}" opacity=".35"/>`
      + `<circle cx="38" cy="26" r="5" fill="${sucker}"/>`
      + `<circle cx="56" cy="21" r="3.6" fill="${sucker}"/>`
      + `<circle cx="64" cy="30" r="4.4" fill="${sucker}"/>`
      + `<ellipse cx="40" cy="44" rx="10" ry="9" fill="${tint(it.c1, .3)}"/>`
      + `<ellipse cx="60" cy="44" rx="10" ry="9" fill="${tint(it.c1, .3)}"/>`;
    return {g, eye: {xs: [40, 60], y: 44, r: 7}, mouth: {x: 50, y: 57, w: 11, d: 4},
            star: [20, 24]};
  },

  /* A T-rex is the joke about the arms: a head far too big, a jaw full
     of teeth, a tail to balance it, legs like tree trunks and two arms
     the size of a child's hand. Side on, because the arms have to show. */
  trex(it){
    const dark = shade(it.c2, .18), belly = tint(it.c1, .5);
    const g = `<path d="M40 78 C 28 72, 16 74, 8 82 C 18 88, 30 90, 42 88 Z" fill="${it.c1}"/>`
      + ridge(52, 66, 24, -156, -104, 4, 6, dark)
      + `<ellipse cx="48" cy="72" rx="22" ry="22" fill="${it.c1}"/>`
      + `<ellipse cx="44" cy="86" rx="14" ry="15" fill="${it.c2}"/>`
      + `<path d="M38 94 L52 94 L52 102 L38 102 Z" fill="${it.c2}"/>`
      + `<path d="M36 98 L60 98 C 66 100, 66 105, 58 105 L38 105 C 34 105, 34 98, 36 98 Z" fill="${it.c2}"/>`
      + `<path d="M48 105 L48 100 M56 105 L56 100" stroke="${dark}" stroke-width="1.6" stroke-linecap="round"/>`
      + `<ellipse cx="48" cy="78" rx="13" ry="14" fill="${belly}"/>`
      + `<path d="M62 62 C 71 62, 74 68, 72 74" stroke="${it.c2}" stroke-width="5.5" fill="none" stroke-linecap="round"/>`
      + `<path d="M72 74 L77 78 M72 74 L76 71" stroke="${it.c2}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
      + `<path d="M46 44 C 46 30, 62 24, 74 28 C 84 32, 90 40, 90 46 L62 52 C 50 52, 46 50, 46 44 Z" fill="${it.c1}"/>`
      + `<path d="M56 50 L90 46 C 94 50, 90 56, 84 57 L60 58 Z" fill="${shade(it.c1, .1)}"/>`
      + toothRow(62, 88, 50, 5, 6, false, "#fff")
      + `<path d="M62 58 L86 56" stroke="${dark}" stroke-width="1.6" stroke-linecap="round"/>`
      + `<ellipse cx="86" cy="41" rx="2.4" ry="1.8" fill="${dark}"/>`;
    return {g, eye: {xs: [74], y: 38, r: 5}, mouth: "own"};
  },

  /* A ladybird is a red dome split down the middle with black dots on
     it, a black head and two antennae with knobs on the end. Six little
     legs, because that is how many it has. */
  ladybug(it){
    const dark = it.c2, spot = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${dark}"/>`;
    const leg = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}"`
      + ` stroke="${dark}" stroke-width="3" stroke-linecap="round"/>`;
    const g = leg(30, 62, 16, 58) + leg(28, 72, 13, 74) + leg(30, 82, 16, 90)
      + leg(70, 62, 84, 58) + leg(72, 72, 87, 74) + leg(70, 82, 84, 90)
      + `<path d="M34 40 C 28 30, 24 22, 26 18" stroke="${dark}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
      + `<circle cx="26" cy="17" r="4" fill="${dark}"/>`
      + `<path d="M66 40 C 72 30, 76 22, 74 18" stroke="${dark}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
      + `<circle cx="74" cy="17" r="4" fill="${dark}"/>`
      + `<circle cx="50" cy="68" r="28" fill="${it.c1}"/>`
      + `<path d="M50 40 L50 96" stroke="${dark}" stroke-width="3.4" stroke-linecap="round"/>`
      + spot(36, 56, 6) + spot(64, 56, 6) + spot(32, 74, 7)
      + spot(68, 74, 7) + spot(44, 88, 5.5) + spot(56, 88, 5.5)
      + `<path d="M32 46 C 32 28, 68 28, 68 46 Z" fill="${dark}"/>`;
    return {g, eye: {xs: [42, 58], y: 38, r: 5.4}, mouth: {x: 50, y: 44, w: 9, d: 2.6}};
  },

  /* A parrot: the hooked beak first, then the crest of three feathers
     on the crown, a folded wing and two long tail feathers below. The
     beak is the mouth, the way the owl's is. */
  parrot(it){
    const beak = "#4a4a55", cheek = "#fff6ea";
    const g = `<path d="M56 84 L80 104 L68 106 L48 88 Z" fill="${it.c2}"/>`
      + `<path d="M50 86 L64 108 L52 108 L42 90 Z" fill="${shade(it.c2, .2)}"/>`
      + `<path d="M48 28 L34 16 L52 24 Z" fill="${it.c2}"/>`
      + `<path d="M52 26 L45 13 L58 23 Z" fill="${it.c2}"/>`
      + `<path d="M56 27 L56 14 L62 25 Z" fill="${it.c2}"/>`
      + `<ellipse cx="47" cy="66" rx="23" ry="26" fill="${it.c1}"/>`
      + `<ellipse cx="47" cy="74" rx="14" ry="16" fill="${it.c2}"/>`
      + `<path d="M32 92 C 26 96, 28 102, 36 100 M44 94 C 42 100, 46 104, 52 100" stroke="#ffb020" stroke-width="4" fill="none" stroke-linecap="round"/>`
      + `<path d="M60 54 C 70 60, 72 74, 64 84 C 60 74, 56 62, 56 56 Z" fill="${shade(it.c1, .16)}"/>`
      + `<circle cx="48" cy="40" r="20" fill="${it.c1}"/>`
      + `<ellipse cx="54" cy="40" rx="12" ry="11" fill="${cheek}"/>`
      + `<path d="M62 30 C 76 32, 78 44, 68 52 C 62 56, 58 50, 60 44 Z" fill="${beak}"/>`
      + `<path d="M62 46 C 68 48, 70 50, 68 52 C 64 54, 61 51, 61 48 Z" fill="${shade(beak, .3)}"/>`;
    return {g, eye: {xs: [52], y: 38, r: 5.6}, mouth: "own", star: [18, 32]};
  },

  /* A stand-in, so an animal whose shape this version has never heard of
     still draws something instead of breaking the garage. */
  plain(it){
    const g = `<ellipse cx="50" cy="76" rx="24" ry="22" fill="${it.c1}"/>`
      + paws(50, 94, 13, 9, 6, it.c2)
      + `<circle cx="50" cy="46" r="20" fill="${it.c1}"/>`;
    return {g, eye: {xs: [43, 57], y: 43, r: 6}, mouth: {x: 50, y: 56, w: 10, d: 4.5}};
  }
};

/* --- the wrapper every animal shares --- */
function eyesAt(e, look){
  const p = look ? 1.6 : 0, r = e.r;
  return e.xs.map(cx =>
      `<ellipse cx="${svgn(cx)}" cy="${svgn(e.y)}" rx="${svgn(r)}" ry="${svgn(r * 1.1)}" fill="#fff"/>`
    + `<circle cx="${svgn(cx + p)}" cy="${svgn(e.y + .5)}" r="${svgn(r * .55)}" fill="#22314f"/>`
    + `<circle cx="${svgn(cx + p - r * .22)}" cy="${svgn(e.y - r * .28)}" r="${svgn(r * .2)}" fill="#fff"/>`).join("");
}
function smileAt(m){
  const d = m.d === undefined ? m.w * .5 : m.d;
  return `<path d="M${svgn(m.x - m.w / 2)} ${svgn(m.y)} Q ${svgn(m.x)} ${svgn(m.y + d)} ${svgn(m.x + m.w / 2)} ${svgn(m.y)}"`
       + ` stroke="#22314f" stroke-width="${m.sw || 2.6}" fill="none" stroke-linecap="round"/>`;
}
function petStar(x, y){
  const R = 8.5, r = R * .44, pts = [];
  for(let i = 0; i < 10; i++){
    const a = (-90 + i * 36) * Math.PI / 180, q = i % 2 ? r : R;
    pts.push(svgn(x + q * Math.cos(a)) + " " + svgn(y + q * Math.sin(a)));
  }
  return `<path d="M${pts.join(" L")} Z" fill="#ffd166" stroke="#e0ab1f" stroke-width="1.6" stroke-linejoin="round"/>`;
}
function petSVG(it, stage){
  const s = stage || 1;
  const sc = s === 1 ? .84 : s === 2 ? 1 : 1.12;
  const draw = PET_SHAPES[it.shape] || PET_SHAPES.plain;
  const d = draw(it, s);
  let g = d.g + eyesAt(d.eye, s >= 2);
  if(d.mouth !== "own") g += smileAt(d.mouth);
  if(s === 3) g += petStar.apply(null, d.star || PET.STAR);
  return `<svg viewBox="0 0 100 118" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`
       + `<g transform="translate(50 62) scale(${sc}) translate(-50 -62)">${g}</g></svg>`;
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

/* Two decimals is as close as any of this needs to be, and it keeps the
   drawing short enough to read. */
function svgn(v){ return +(+v).toFixed(2); }
/* Three shapes the patterns and the wreaths are built from. They are
   worked out in code rather than by rotating a drawn shape, because a
   rotated shape hides where it ended up, and the test reads the points
   back out of the drawing to check that nothing landed on the eye. */
function leafPath(px, py, deg, len, wid){
  const a = deg * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a);
  const mx = px + dx * len * .5, my = py + dy * len * .5;
  return `M${svgn(px)} ${svgn(py)} Q ${svgn(mx - dy * wid)} ${svgn(my + dx * wid)}`
       + ` ${svgn(px + dx * len)} ${svgn(py + dy * len)}`
       + ` Q ${svgn(mx + dy * wid)} ${svgn(my - dx * wid)} ${svgn(px)} ${svgn(py)} Z`;
}
function starPts(cx, cy, rad, deg){
  const p = [];
  for(let i = 0; i < 10; i++){
    const a = ((deg || -90) + i * 36) * Math.PI / 180, q = i % 2 ? rad * .45 : rad;
    p.push(svgn(cx + q * Math.cos(a)) + "," + svgn(cy + q * Math.sin(a)));
  }
  return p.join(" ");
}
function heartPath(cx, cy, s){
  return `M${svgn(cx)} ${svgn(cy + s * .95)}`
       + ` C ${svgn(cx - s * 1.25)} ${svgn(cy + s * .1)} ${svgn(cx - s * .6)} ${svgn(cy - s * .9)} ${svgn(cx)} ${svgn(cy - s * .2)}`
       + ` C ${svgn(cx + s * .6)} ${svgn(cy - s * .9)} ${svgn(cx + s * 1.25)} ${svgn(cy + s * .1)} ${svgn(cx)} ${svgn(cy + s * .95)} Z`;
}
/* Where a part sits is worked out from the anchors every time it is
   drawn and is never written into the part itself. Move DUCK.HEAD and
   every hat, band and fringe moves with it, move DUCK.EYE and every
   lens follows, move the body and the gear goes with it; that is the
   whole reason the anchors exist, and the test moves each of them and
   checks that they did.
   `brim` is the line a hat stops at. Below it is the eye, and a hat
   that reaches the eye has covered the face, so every brim, band and
   fringe in the catalogue ends there or higher, and everything in the
   eye and gear layers stays below it. */
function duckFit(){
  const H = DUCK.HEAD, B = DUCK.BODY, E = DUCK.EYE, W = DUCK.WING, T = DUCK.TAIL;
  // where the head meets the body. A collar, a bow tie and a cord all go
  // round it, and it is a point on the body rather than on the head,
  // because everything in the gear layer is hung off the body.
  const neck = [svgn(B.x + B.rx * .47), svgn(B.y - B.ry * .55)];
  // how wide a circle around the head is at a given height, so a brim
  // meets the head instead of floating beside it
  const wAt = (y, rad) => { const q = rad === undefined ? H.r : rad;
    return svgn(Math.sqrt(Math.max(0, q * q - (y - H.y) * (y - H.y)))); };
  // a point on the head by angle: -90 is the top of it, 0 the front
  const at = (deg, rad) => { const a = deg * Math.PI / 180, q = rad === undefined ? H.r : rad;
    return [svgn(H.x + q * Math.cos(a)), svgn(H.y + q * Math.sin(a))]; };
  // the strip between two heights with its sides cut by the head: every
  // band, brim fold and hat ribbon is one of these
  const band = (y1, y2, rad) => { const q = rad === undefined ? H.r : rad;
    const a = wAt(y1, q), b = wAt(y2, q);
    return `M${svgn(H.x - a)} ${svgn(y1)} L${svgn(H.x + a)} ${svgn(y1)}`
         + ` A ${q} ${q} 0 0 1 ${svgn(H.x + b)} ${svgn(y2)}`
         + ` L${svgn(H.x - b)} ${svgn(y2)} A ${q} ${q} 0 0 1 ${svgn(H.x - a)} ${svgn(y1)} Z`; };
  // everything above a height: a crown, a dome, the top of a hat
  const dome = (y, rad) => { const q = rad === undefined ? H.r : rad, a = wAt(y, q);
    return `M${svgn(H.x - a)} ${svgn(y)} A ${q} ${q} 0 0 1 ${svgn(H.x + a)} ${svgn(y)} Z`; };
  return {H, B, E, W, T, water: DUCK.WATER, neck, n: svgn, at, wAt, band, dome,
          x: H.x, y: H.y, r: H.r, top: H.y - H.r, brim: H.y - H.r * .65};
}

/* --- the duck ---
   Anchors, not numbers written into the shapes. A hat belongs on the
   head, goggles on the eye, a ring around the body; if each of those
   carried its own copy of where the head is, the day the head moves
   would be the day every one of them slides off. So the drawing reads
   DUCK and nothing else does arithmetic on it.
   The frame is the same 100 x 118 as an animal, and the duck sits low
   in it on purpose: the empty band above the head is head room, and a
   tall hat is going to need all of it.
   The draw order runs back gear, tail, body, head, pattern, belly,
   wing, bill, eye, eyewear, headwear, front gear. Every one of those
   places is there for a reason a child would notice: the pattern under
   the belly and the bill so no dot lands on the face, the eyewear under
   the hat so a brim overlaps a lens the way a real one does, and the
   gear split in two so a ring goes round the duck. The body is the only
   layer that is never empty, because a duck cannot be colourless. */
const DUCK = {
  BODY:  {x:46, y:76, rx:32, ry:22},   // the float: everything hangs off it
  HEAD:  {x:60, y:50, r:17},           // hats, hair and helmets sit here
  EYE:   {x:66, y:45},                 // glasses, masks and patches sit here
  WING:  {x:44, y:76},                 // what is held or strapped on goes here
  BEAK:  {x:71, y:50},                 // stays orange: it is how a duck reads
  TAIL:  {x:26, y:66},                 // a backpack hangs behind this
  WATER: 88                            // where a swim ring would meet the body
};
function duckSVG(it, outfit){
  const B = DUCK.BODY, H = DUCK.HEAD, E = DUCK.EYE, W = DUCK.WING, K = DUCK.BEAK, T = DUCK.TAIL;
  const b = duckBodyOf(outfit);
  // the free body has no colours of its own, so the classic yellow is
  // written down once, on the duck, and nowhere else
  const c1 = b.c1 || it.c1, c2 = b.c2 || it.c2;
  // the rainbow body is one sweep across the whole duck rather than a
  // fill per shape, so the head carries on where the body left off. Its
  // id is fixed on purpose: every rainbow duck on the screen is the same
  // sweep, so two ducks dressed the same still look the same.
  const skin = b.grad ? "url(#duckrb)" : c1;
  const grad = b.grad
    ? `<linearGradient id="duckrb" gradientUnits="userSpaceOnUse"`
      + ` x1="${B.x - B.rx}" y1="${B.y}" x2="${H.x + H.r}" y2="${H.y}">`
      + b.grad.map((c, i) => `<stop offset="${Math.round(i / (b.grad.length - 1) * 100)}%" stop-color="${c}"/>`).join("")
      + `</linearGradient>`
    : "";
  /* A part worn in a layer it does not belong to, or an id this version
     has never heard of, leaves that layer bare instead of breaking the
     duck: a profile dressed by a newer version still has to open. */
  const wornPart = layer => { const q = duckPartById((outfit || {})[layer]);
    return q && duckLayerOf(q) === layer && q.draw ? q : null; };
  const patPart = wornPart(PAT_LAYER), headPart = wornPart(HEAD_LAYER);
  const eyePart = wornPart(EYE_LAYER), gearPart = wornPart(GEAR_LAYER);
  /* How dark the body underneath is, so a pattern can keep its own
     colours and still be seen on any of the ten: every mark is given a
     hairline in whichever of near white and near black the body is not.
     The rainbow body is judged by the average of its stops, because a
     mark on it sits on more than one colour at once. */
  const lumOf = h => { const v = parseInt(h.slice(1), 16);
    return (((v >> 16) & 255) * .299 + ((v >> 8) & 255) * .587 + (v & 255) * .114) / 255; };
  const lum = b.grad ? b.grad.reduce((s, c) => s + lumOf(c), 0) / b.grad.length : lumOf(c1);
  const rim = lum < .45 ? "#f2f7ff" : "#26324c";
  // The pattern is cut to the body and the head together, both pulled in
  // by a hair. Any of it that reached past them would be paint hanging in
  // the air, and a pale mark sitting exactly on the edge would take the
  // outline of the duck with it: the classic yellow has no outline of its
  // own, only its colour against a white tile.
  const clip = patPart
    ? `<clipPath id="duckskin"><ellipse cx="${B.x}" cy="${B.y}" rx="${B.rx - 1.5}" ry="${B.ry - 1.5}"/>`
      + `<circle cx="${H.x}" cy="${H.y}" r="${H.r - 1.5}"/></clipPath>`
    : "";
  const defs = grad || clip ? `<defs>${grad}${clip}</defs>` : "";
  const beak = b.beak || "#ff9f1c", beak2 = b.beak2 || "#e5820c";
  const bill = `M${K.x} ${K.y-5} Q ${K.x+14} ${K.y-6} ${K.x+17} ${K.y-1}`
             + ` Q ${K.x+18} ${K.y+2} ${K.x+13} ${K.y+4} Q ${K.x+6} ${K.y+6} ${K.x} ${K.y+5}`;
  // The tail goes in before the body, so the body hides where it grows
  // out, and the head overlaps the body, so the neck is the notch the
  // two leave. That is why the three come as one call: an outline drawn
  // around each of them separately would draw the seams as well.
  const shell = (tailPaint, skinPaint, extra) =>
      `<path d="M${T.x+4} ${T.y-4} L${T.x-22} ${T.y-15} L${T.x-2} ${T.y+14} Z" fill="${tailPaint}"${extra}/>`
    + `<ellipse cx="${B.x}" cy="${B.y}" rx="${B.rx}" ry="${B.ry}" fill="${skinPaint}"${extra}/>`
    + `<circle cx="${H.x}" cy="${H.y}" r="${H.r}" fill="${skinPaint}"${extra}/>`;
  // A body pale enough to vanish into a white garage tile says so and
  // gets an outline: the same three shapes underneath in the outline
  // colour, so only the silhouette shows and no seam inside it does.
  const edge = b.edge ? shell(b.edge, b.edge, ` stroke="${b.edge}" stroke-width="2.4"`) : "";
  // Where every part sits is worked out from the anchors at the moment
  // of drawing, never stored on the part. The gear layer is the one
  // that comes in two halves: `back` goes in before the tail and the
  // body, `front` after everything, so a swim ring can go round the
  // duck rather than in front of it.
  const fit = duckFit();
  /* The colours the body is wearing, so a part that would be lost in
     them can be given an outline; see `partInk`. The rainbow body hands
     over all five of its stops, because a part on it lies on more than
     one colour at once. */
  const hues = b.grad ? b.grad.slice() : [c1, c2];
  const ink = frag => partInk(frag, rim, hues);
  const pat = patPart ? `<g clip-path="url(#duckskin)">${ink(patPart.draw(fit, rim))}</g>` : "";
  const headwear = headPart ? ink(headPart.draw(fit, rim)) : "";
  const eyewear = eyePart ? ink(eyePart.draw(fit, rim)) : "";
  const back = gearPart && gearPart.back ? ink(gearPart.back(fit, rim)) : "";
  const front = gearPart ? ink(gearPart.draw(fit, rim)) : "";
  const g = defs + back
    + edge
    + shell(c2, skin, "")
    + pat
    // the pale underside, kept wholly inside the body: any part of it
    // that reached past the edge would read as a puddle, not a belly.
    // A dark body needs more of it, or the belly is not there at all.
    + `<ellipse cx="${B.x+2}" cy="${B.y+7}" rx="${B.rx*.75}" ry="${B.ry*.61}"`
    + ` fill="#fff" opacity="${b.belly || .2}"/>`
    + `<path d="M${W.x-16} ${W.y-10} Q ${W.x+4} ${W.y-12} ${W.x+10} ${W.y+2}`
    + ` Q ${W.x-2} ${W.y+12} ${W.x-14} ${W.y+6} Z" fill="${c2}"/>`
    // the bill is orange, because orange is how a duck reads; a body may
    // say otherwise, and exactly one of them does
    + `<path d="${bill} Z" fill="${beak}"/>`
    // the lower half of the bill, darker, so the beak is a beak and not a wedge
    + `<path d="M${K.x} ${K.y+1} Q ${K.x+8} ${K.y+3.5} ${K.x+15.5} ${K.y+1}`
    + ` Q ${K.x+13} ${K.y+4.5} ${K.x+6} ${K.y+5.6} Q ${K.x+2.5} ${K.y+6} ${K.x} ${K.y+5} Z"`
    + ` fill="${beak2}"/>`
    // an orange bill on an orange body needs a line around it, and only
    // around what is outside the head: the same path without the closing
    // side, so nothing is drawn across the face
    + (b.beakEdge ? `<path d="${bill}" fill="none" stroke="${b.beakEdge}"`
                  + ` stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"/>` : "")
    // a dark body swallows a dark eye, so it gets a pale patch to sit on
    + (b.eyeRing ? `<circle cx="${E.x}" cy="${E.y}" r="5" fill="${b.eyeRing}"/>` : "")
    + `<circle cx="${E.x}" cy="${E.y}" r="3.4" fill="#22314f"/>`
    + `<circle cx="${E.x-1.1}" cy="${E.y-1.3}" r="1.2" fill="#fff"/>`
    + eyewear + headwear + front;
  // a duck is wide and low, so it is grown a little and lifted to fill the
  // frame the way an animal does; what is left above the head is head room
  return `<svg viewBox="0 0 100 118" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`
       + `<g transform="translate(50 63) scale(1.08) translate(${-B.x} -65.5)">${g}</g></svg>`;
}

function itemSVG(p, id){
  const it = itemById(id);
  if(it.duck) return duckSVG(it, p && p.duck);
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
  // A snowfield for the circuit. Every one of the ninety six places so
  // far is a colour; white is the one thing none of them is, and at this
  // lightness nothing else comes close, so a thumbnail of it cannot be
  // taken for anywhere else in the game. The blue grey drifts beside the
  // road keep it from reading as blank paper.
  snowfield: pal(205, 215, 90, "crystal", {sat:32, l2:74}),
  // The first year's ranges, a coastline that walks along beside the
  // beach the twenty track already had: the child goes from the dunes
  // down to the water and along it, and crossing the ten is the pier.
  // A marsh for the circuit: dark bog green, the wet ground under the
  // reeds. The first draft was a blue green that meant to be darker than
  // the school track's mint and was not: the two ends of the two
  // gradients came out fifteen apart and on a thumbnail it was the same
  // mint place twice. This one is the one green the circuit did not have,
  // the dark olive of standing water, thirty two from the forest, which
  // is the nearest thing to it anywhere on the map.
  marsh:  pal( 92,  74, 34, "drop"),
  // A violet plateau for the circuit. The green end of the circuit is
  // full (meadow, forest, savanna, marsh), and a yellow green ground
  // read as one more field on a thumbnail; the circuit is the world
  // that already has a pink clock town and a purple city, so a dusky
  // violet belongs there and is unmistakable next to either of them.
  amethyst: pal(272, 285, 44, "crystal", {sat:30}),
  // A mulberry moor for the circuit. The greens, the sands, the blues
  // and the warm reds are all spoken for, and the two violets that are
  // there are a pale pink clock town and a dusky amethyst, so a strong
  // magenta is the one place in the wheel that is still free, and next
  // to either of those two it cannot be taken for the same place.
  mulberry: pal(318, 330, 50, "flower", {sat:40}),
  // A field of flax in flower for the circuit. The violets that are
  // already there are a dusky amethyst plateau and a strong magenta
  // moor; this one is a clean blue violet, lighter than either, and the
  // nearest of them is forty eight away. Nothing else on the circuit is
  // a blue that is not water or sky.
  flaxfield: pal(240, 252, 60, "flower", {sat:50}),
  // A field of barley ripening for the circuit. The yellows that are
  // already there are the pale sand of the beach and the dunes and the
  // dull olive gold of the savanna; this one is the vivid lemon green of
  // a crop that is not dry yet, brighter and greener than any of them,
  // and the savanna, its nearest neighbour, is thirty five away. The
  // circuit's other greens are all darker and bluer than this.
  barley:    pal( 63,  46, 64, "leaf",   {sat:60}),
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
  // the one khaki hollow among two dozen greens, darker and yellower
  // than the birch wood and greener than the stubble field
  tr_hollow: pal( 70,  95, 50, "stone"),
  // a bluebell wood: the flowers make the top of the slope and the wood
  // floor stays green underneath, which is how the trail wears a colour
  // that is not a ground colour; the heath and the orchard do the same,
  // and this one is the blue of the three
  tr_bells:  pal(232, 118, 56, "flower", {h2:118, l2:46, sat:34}),
  // a frosted morning: the rime makes the top of the slope and the wood
  // floor stays green underneath, the same trick as the heath and the
  // bluebells, except this one is pale where all of those are strong
  tr_frost:  pal(198, 130, 84, "crystal", {h2:120, l2:52, sat:28}),
  // a field of poppies: the flowers make the top of the slope and the
  // ground stays green underneath, the same trick as the heath, the
  // bluebells and the orchard. Those three are purple, blue and pink;
  // this is the red one, and it is a true red rather than the warm
  // orange the first draft had, because that one read as one more autumn
  // slope beside the quarry and the orchard. Fifty four from the
  // orchard, which is the nearest of the four
  tr_poppies:pal(  0, 118, 56, "flower", {h2:115, l2:44, sat:62}),
  // a strip of barley beside the path, the crop bright over the green it
  // stands in; the trail's other yellows are the dry golden field and
  // the woodcutter's log, both of them duller and browner
  tr_barley: pal( 52, 100, 66, "leaf",   {h2:104, l2:42, sat:70}),
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
  // Haze over a far ridge, which is violet rather than green. The first
  // draft put a pale green horizon here, six from the hilltop and nine
  // from the kite, so the sky had the same pale green place three times
  // over; every other horizon in this world is pale as well, so what was
  // free was not a hue but a depth. This one is the only deep horizon
  // among them, forty nine from the arch, the nearest violet.
  sk_haze:   pal(212, 280, 46, "drop",    {h2:274, l2:56}),
  // a deeper blue than the rest of the sky, so it does not read as the
  // grey of the dust; the fresh green horizon is what names the place
  sk_gate:   pal(214, 110, 48, "leaf",    {h2: 96, l2:78, sat:56}),
  // the last light: still a blue overhead, but a deeper one than any
  // daytime sky here, and the horizon is rose rather than the gold the
  // sunset and the ember already use
  sk_afterglow: pal(240, 330, 40, "flower", {h2:330, l2:66}),
  // a bright winter sky: the deepest, cleanest blue of all of them over
  // a horizon of snow. The fog has the same two ends of the wheel but
  // all the colour washed out of it, so the two cannot be confused
  sk_snow:   pal(210, 200, 46, "crystal", {h2:195, l2:92, sat:60}),
  // a copper horizon under a deep blue: the sky world's four warm
  // horizons (the sunset, the dawn, the dust and the ember) are all
  // pale gold and all sit high up the lightness scale, so the one thing
  // still free on that side of the wheel is a dark one. This is it,
  // fifty five from the dust, which is the nearest of the four
  sk_copper: pal(204,  18, 44, "stone",   {h2: 12, l2:46, sat:54}),
  // pollen drifting over the fields: a deep blue overhead and a horizon
  // the colour of the crop it comes off. The sky's other bright horizons
  // are the pale corn of the updraft and the grey gold of the dust, both
  // of them washed out where this one is the full colour
  sk_pollen: pal(198,  66, 32, "leaf",    {h2: 66, l2:62, sat:60}),
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
  // a shell bank in shallow water: bright water over a floor of pale
  // broken shell. Muting it towards the water, which is what the second
  // draft did, only put it among the green blue floors of the lagoon,
  // the garden and the weed meadow, all three of them within sixteen of
  // it; the floor down here has to be the thing that names the place, so
  // this one is the palest and pinkest of them, thirty eight from the
  // pearl bank, which is the nearest floor that is not green
  dp_shoal:  pal(186, 300, 50, "shell",   {h2:298, l2:74}),
  // water above and a bed of yellow green weed below, which is the one
  // floor colour the deep has not used yet
  dp_weed:   pal(194,  84, 62, "leaf",    {h2: 84, l2:38}),
  // a bed of purple urchins: the water stays blue and the floor takes
  // the one colour the deep has not used, between the pearl bank's pink
  // and the sunken city's indigo
  dp_urchins:pal(202, 288, 58, "crystal", {h2:288, l2:44}),
  // under the ice: the water is the darkest of all of them and the floor
  // the palest, which is the widest gap between the two ends anywhere in
  // the deep and is what makes it read as light coming through ice
  dp_ice:    pal(204, 206, 34, "crystal", {h2:200, l2:84, sat:40}),
  // a bank of orange sponges: dark water over a warm floor that is
  // lighter than the water above it, which only the ice does otherwise,
  // and the ice is blue where this is amber. The deep's other warm
  // floors are the coral, the reef and the vent, all of them darker and
  // redder; the first draft sat close enough to the coral to read as the
  // same place, so the water went deeper and the floor warmer. The
  // nearest is now the ice, forty six away
  dp_sponges:pal(214,  26, 34, "shell",   {h2: 28, l2:70, sat:60}),
  // a bed of sea lemons: dark water over a floor of the one colour the
  // deep has left, a clear yellow. The sand bank is the nearest thing to
  // it and is a dull gold under bright water, so the two read as
  // different places even at the size of a thumbnail
  dp_lemon:  pal(196,  58, 36, "shell",   {h2: 60, l2:64, sat:70})
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
        d1:"tr_burrow", chain:"tr_reeds", ops:"tr_hollow", beyond:"tr_field",
        tens:"tr_bells", divrem:"tr_poppies", round:"tr_quarry", split:"tr_barley",
        units:"tr_frost",
        a100:"tr_lake", a1000:"tr_falls", clock:"tr_orchard", mix:"tr_dusk",
        weak:"tr_mist", school:"tr_garden"}},
  {id:"sky", rides:["ri_raketa","ri_letad","ri_ufo","pet_drak","pet_sova"],
   env:{a3:"sk_meadowair", a5:"sk_hilltop", a7:"sk_updraft", a10:"sk_first", a15:"sk_flock",
        a20:"sk_breeze", bridge:"sk_arch",
        t1:"sk_dawn", t2:"sk_clouds", t3:"sk_sunset", t4:"sk_ridge", t5:"sk_rainbow",
        d1:"sk_void", chain:"sk_haze", ops:"sk_gate", beyond:"sk_dust",
        tens:"sk_afterglow", divrem:"sk_copper", round:"sk_storm", split:"sk_pollen",
        units:"sk_snow",
        a100:"sk_high", a1000:"sk_ember", clock:"sk_moon", mix:"sk_night",
        weak:"sk_fog", school:"sk_kite"}},
  {id:"deep", rides:["ri_ponor","ri_ufo","pet_zub","pet_puk","ri_mech"],
   env:{a3:"dp_pool", a5:"dp_tide", a7:"dp_grass", a10:"dp_coral", a15:"dp_drift",
        a20:"dp_lagoon", bridge:"dp_arch",
        t1:"dp_shallow", t2:"dp_kelp", t3:"dp_reef", t4:"dp_trench", t5:"dp_city",
        d1:"dp_abyss", chain:"dp_shoal", ops:"dp_weed", beyond:"dp_sand",
        tens:"dp_urchins", divrem:"dp_sponges", round:"dp_cavern", split:"dp_lemon",
        units:"dp_ice",
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
  /* Some webviews report an innerWidth of 0 on the very first frame. The
     document element knows its own width by then, so it is asked before
     the phone sized guess is used; without it the map would be built in
     two columns on a tablet and only put right by the first resize. */
  const w = window.innerWidth || de.clientWidth || 375;
  const h = window.innerHeight || de.clientHeight || 812;
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
/* The type scale of the year at the screen, the same table as the five
   --tx lines in src/styles.css. It is written twice because the map has
   to know how tall a card is before it is drawn, and a custom property
   cannot be read without a layout; tests/style.test.js fails if the two
   copies ever say different things. The stylesheet stays the place to
   tune them (decision R5): the test catches the drift, so the second copy
   cannot quietly go stale. */
const TX_BY_GRADE = {"1": 1.25, "2": 1.12, "3": 1.04, "4": 1, "5": 1};
function txNow(){
  const de = document.documentElement;
  const g = (de && de.dataset && de.dataset.grade) || "";
  return TX_BY_GRADE[g] || 1;
}

let view = {name:"players"};
function go(name, data){ view = Object.assign({name}, data || {}); render(); }

function render(){
  const p = P();
  applyLang();
  /* How big the letters are on this screen. The scale itself lives in the
     stylesheet as --tx; all the screen says is whose eyes are reading it.
     It goes on <html> rather than on #app, because the bottom sheets are
     pinned to <body> and would not inherit it from #app. The parent
     section keeps the plain size, and so does a screen drawn before any
     profile exists. */
  try{
    const parent = PARENT_VIEWS.indexOf(view.name) >= 0;
    document.documentElement.dataset.grade = (parent || !p) ? "" : String(gradeOf(p));
  }catch(e){}
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
  if(view.name === "collection") mountCollection();
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
   cards reads as anything, so the places are laid out along a road
   instead. It runs in reading order, left to right along a row and back
   to the left edge for the next one, because a road that snaked back on
   every second row left an eight year old unable to say where it went.
   The layout is computed from the same kind of seed as the
   circuits, so a world always looks the same, and it is measured in
   percent across and pixels down, which keeps it inside any phone.
   The road is decoration. **Tapping a place goes straight there**; there
   is no journey along the road to sit through, because the one study
   found on hub structures reports a drop in felt competence and autonomy
   when the player has to keep passing through the middle. */
function medalEmoji(m){ return ["", "&#129353;", "&#129352;", "&#129351;"][m] || ""; }
/* A place is 44 percent wide in the two column layout, so the two columns
   cannot touch even at the far end of the wobble, and from three columns
   up the width follows the count. How far apart they stand vertically is
   not a constant any more: the card is as tall as its own preview and its
   own text, and the text grows with the school year. */
/* Clear air between two rows of cards. It used to be 20, which was enough
   to keep two cards apart and nothing more; the road now comes back
   through this band at the end of every row, and the road is drawn with
   a 16 px stroke that does not scale. Sixteen of these thirty six pixels
   are the road itself and ten are left clear above it and below it, so
   the return is plainly visible and never touches a card. */
const PLACE_GAP = 36;       // clear air between two rows, and the return lane
const PLACE_MAX = 205;      // .place max-width, two column layout only
const WORLD_EDGE = 28;      // .world margin: 0 14px, both sides
/* How wide the map is drawn, in pixels. The card is a percentage of
   .world, which is #app less its margins, not of #app itself. Before the
   first layout there is nothing to measure; then the window is taken,
   which can only be wider than #app, never narrower, because --appw only
   caps it. A step that comes out of a guess therefore has too much air
   rather than too little, and never lands a card on its neighbour. */
function mapWidth(){
  const px = (app && app.clientWidth)
    || (typeof window !== "undefined" && window.innerWidth)
    || 375;
  return Math.max(120, px - WORLD_EDGE);
}
/* How tall a place card is, in pixels, added up from src/styles.css. It
   is the worst case of every shape the card takes, so that one step fits
   the whole map and no card can land on the one below it:

     22           .place padding 9 and border 2, top and bottom
     preview      .place .thumb, aspect-ratio 400 / 205 of the inner width
     5 per gap    .place gap, between every pair of children
     .nm          16px * tx, line-height 1.1, up to two lines
     .sub         12.5px * tx, line-height 1.25, up to two lines
     open card    .bar 7px + .foot, min-height 16px or 13px * tx at 1.25
     locked card  .lockmsg, 12.5px * tx, line-height 1.25, up to two lines

   An open track has four gaps (preview, name, subtitle, bar, foot), a
   locked one and a door have three. Two lines is what the name really
   takes: "Šestky a sedmičky", "Sechser und Siebener" and "Was ihr in der
   Schule macht" do not fit on one even at tx 1, and none of the three
   elements can take a third line, because the stylesheet clamps them. */
function placeHeight(widthPx, tx){
  const s = tx || txNow();
  const inner = widthPx - 22;
  const thumb = inner * 205 / 400;
  const nm   = 2 * 16 * 1.1 * s;
  const sub  = 2 * 12.5 * 1.25 * s;
  const foot = Math.max(16, 13 * 1.25 * s);
  const lock = 2 * 12.5 * 1.25 * s;
  const open = 4 * 5 + nm + sub + 7 + foot;
  const shut = 3 * 5 + nm + sub + lock;
  return 22 + thumb + Math.max(open, shut);
}
/* How wide one place is, in percent of the map, and how tall in pixels.
   The percentages match the widths in the stylesheet, which is where the
   card is actually sized. Places stand in rows whatever the number of
   columns, so one step down is always one row. */
function placeBox(cols, tx){
  const c = cols < 3 ? 2 : cols;
  const w = c === 2 ? 44 : 100 / c - 3;
  const px = c === 2 ? Math.min(mapWidth() * w / 100, PLACE_MAX) : mapWidth() * w / 100;
  const h = placeHeight(px, tx);
  return {w, h, step: h + PLACE_GAP};
}
/* Where the places stand, in reading order: left to right along a row,
   then back to the left edge and down to the next one, the way a child
   reads a page. It used to snake, right to left along every second row,
   and an eight year old asked to play it could not tell where the road
   went next; see PROJECT-STATE, section 9.

   gapAt, when given, is the index where this year starts: the road takes
   half a step more there, which is the room the year sign stands in, and
   this year begins a row of its own, because there is no room for the
   sign between two cards sharing a row. The cells left over at the end of
   the row before it simply stay empty.

   cols defaults to two, so every caller that does not care about the
   width keeps the layout the phone was measured on. */
function worldSpots(p, n, gapAt, cols, tx){
  const rnd = seedRand("svet-" + (p && p.world ? p.world : "circuit"));
  const c = cols || 2;
  const b = placeBox(c, tx);
  const out = [];
  const pad = gapAt == null ? 0 : (c - gapAt % c) % c;
  for(let i = 0; i < n; i++){
    const j = (gapAt != null && i >= gapAt) ? i + pad : i;
    const r = Math.floor(j / c);
    // 0.5 to 2.5 of wobble leaves a lane between two columns for the road
    // to show through and keeps the last column inside the right edge
    const left = (j % c) * (100 / c) + 0.5 + rnd() * 2;
    const y = +(14 + r * b.step + (gapAt != null && i >= gapAt ? b.step / 2 : 0)).toFixed(1);
    out.push({left, y, cx: left + b.w / 2, cy: y + b.h / 2});
  }
  return out;
}
/* An S bend between each pair of places, and a return lane at the end of
   every row. The road knows nothing about worlds or columns: it is handed
   a list of points and reads how wide and how tall a card is off the
   points themselves, so a place that lies entirely to the left of the one
   before it can only be the start of the next row. It is not reached by
   cutting across the cards in between but by dropping into the clear band
   between the two rows, running back along it and climbing in from above,
   which is the carriage return the child has to be able to follow.
   The stroke keeps its width whatever the screen, because the picture is
   stretched sideways to the width of the phone and would otherwise
   squash the road with it. */
function worldRoad(spots, h){
  if(!spots.length) return "";
  const f = v => v.toFixed(1);
  let d = `M ${f(spots[0].cx)} 0 L ${f(spots[0].cx)} ${f(spots[0].cy)}`;
  for(let i = 1; i < spots.length; i++){
    const a = spots[i-1], b = spots[i];
    if(b.left + 2 * (b.cx - b.left) <= a.left){
      // the middle of the empty band: half a card below the centre of the
      // row that ends here, half the air above the row that starts there
      const band = (a.cy + (a.cy - a.y) + b.y) / 2;
      // how far to the side the two turns reach; a quarter of the way
      // back at most, so the straight run along the band stays the half
      // of it that reads as a return
      const k = Math.min(8, (a.cx - b.cx) / 4);
      d += ` C ${f(a.cx)} ${f(band)}, ${f(a.cx)} ${f(band)}, ${f(a.cx - k)} ${f(band)}`
         + ` L ${f(b.cx + k)} ${f(band)}`
         + ` C ${f(b.cx)} ${f(band)}, ${f(b.cx)} ${f(band)}, ${f(b.cx)} ${f(b.cy)}`;
      continue;
    }
    const m = (b.cy - a.cy) / 2;
    d += ` C ${f(a.cx)} ${f(a.cy + m)}, ${f(b.cx)} ${f(b.cy - m)},`
       + ` ${f(b.cx)} ${f(b.cy)}`;
  }
  const last = spots[spots.length - 1];
  return d + ` L ${f(last.cx)} ${h}`;
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
  /* The map is as tall as the bottom of its lowest card plus the same air
     that stands between two cards, whatever the number of columns and
     whatever the type scale; the card height has to be the one the cards
     were spaced with, or the last row loses the ground under it. */
  const box = placeBox(cols);
  const height = Math.round(spots.reduce((m, s) => Math.max(m, s.y), 0) + box.h + PLACE_GAP);

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
  const items = buildRun(p, tr);
  RUN = {
    t: tr, items, n0: n, idx: 0, answered: 0, prog: 0, dist: 0, hist: [],
    typed: blankTyped(items[0]), slot: 0, state: "ask", t0: 0, wrongKeys: [],
    okCount: 0, marks: [], coins: 0, retries: 0, newStars: 0,
    // the score is normalised to a 100 point scale whatever the race length
    mult: 20 / n
  };
  go("game");
}
const TARGET = 100;

/* ---------- the answer is not always one number ----------
   Division with a remainder is answered with a quotient and a
   remainder, and those are two numbers, not one number written oddly.
   How many boxes a question has is another thing the question says
   about itself: `input` names the element and the table below says how
   wide that element is.

   `RUN.typed` stays a plain string while there is one box and becomes
   an array of strings once there are several; `RUN.slot` says which of
   them the keys are writing into. Everything that touches what has been
   typed goes through the helpers here, so nothing else has to know
   which of the two shapes is in play.

   This table is the whole of what one more box costs. Splitting a number
   into what each of its places is worth needs three of them, and that
   was one more line here rather than a third way through the screen:
   everything below counts the boxes, none of it asks whether there are
   two. */
const SLOTS = {pad: 1, pad2: 2, pad3: 3, pick: 1};
/* Which answering surface a question wants, for the one question of
   whether the one on screen has to be rebuilt. It is not simply
   `input`, because two questions answered by choosing are answered on
   two different surfaces whenever the choices differ: even or odd
   offers two words, how many figures offers three, and swapping only on
   the name would leave the wrong words under the child's thumb. */
function surfaceOf(item){
  const kind = (item && item.input) || "pad";
  return item && item.opts ? kind + "|" + item.opts.join("|") : kind;
}
function slotsOf(item){ return SLOTS[(item && item.input) || "pad"] || 1; }
/* The first box keeps the id it has always had, because the screen
   around it knows it by that name; the others are numbered from two. */
function boxId(i){ return i ? "abox" + (i + 1) : "abox"; }
function boxAt(i){ return document.getElementById(boxId(i)); }
/* How many characters fit in one box. A single number says the same for
   every box, an array says it box by box, so a two digit quotient and a
   one digit remainder can each be exactly as wide as they need to be. */
function maxLenAt(item, i){
  const m = item && item.maxLen;
  return (Array.isArray(m) ? m[i] : m) || 3;
}
function blankTyped(item){ const n = slotsOf(item); return n > 1 ? new Array(n).fill("") : ""; }
function typedAt(i){ return Array.isArray(RUN.typed) ? (RUN.typed[i] || "") : RUN.typed; }
function setTypedAt(i, v){ if(Array.isArray(RUN.typed)) RUN.typed[i] = v; else RUN.typed = v; }
/* Nothing is sent off until every box has something in it: an empty
   remainder is not an answer of zero, it is an answer not given yet. */
function typedFull(){ return Array.isArray(RUN.typed) ? RUN.typed.every(s => s !== "") : RUN.typed !== ""; }

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
   A picture question carries no such line at all.
   A unit after the answer box is part of that line too, plus the space
   in front of it, because it is drawn in the row and takes up room in
   it; measuring only the question would let "240 měsíců = ? let" call
   itself a short line.
   The lead layout needs no allowance of its own and that is worth
   writing down, because it looks as though it should. Both layouts draw
   exactly one answer box, so the box cancels out; what differs is that
   the usual row draws a sign outside the counted text while a lead row
   carries its sign and its result inside it. Counted plainly, "× 7 = 42"
   lands one short of the small size and measures 316 px drawn on a
   375 px phone, and "- 23 = 58" lands on it at 341 px, which is a pixel
   or two past the room there is. So the plain count is already the right
   line, one character either way. */
function questionSize(item){
  if(!item || item.svg || !item.text) return "";
  let n = String(item.text).length + (item.unit ? String(item.unit).length + 1 : 0);
  /* A comparison writes the other side after the box instead of a unit,
     so that side is counted too. The box between them is not: it holds
     one sign and is narrower than a box of digits, so it cancels out the
     way the box of an ordinary row does. */
  if(item.layout === "mid") n += String(item.tail || "").length;
  /* A second answer box does need an allowance of its own, unlike the
     lead layout above, and for the opposite reason: the one box every
     question draws cancels out, a second one does not. It is the
     widest thing the game puts on a row. Narrowed for this row it is
     58 px, about three characters of the display face, and the words
     that stand between the boxes are counted once for every gap they
     stand in, plus the space in front of each of them, because a row of
     three boxes carries that word twice.
     The one box that cancels out is a box of one digit. Splitting a
     number apart writes three hundred into the first of them, and three
     digits in a box that is sized for one is half as wide again, so
     what the boxes are allowed to hold is counted too; `maxLen` already
     says it, box by box. */
  const nb = slotsOf(item);
  for(let i = 1; i < nb; i++) n += 3 + (item.sep ? String(item.sep).length + 1 : 0);
  if(nb > 1) n += (maxLenAt(item, 0) - 1) + (item.tail ? String(item.tail).length : 0);
  return n >= 13 ? " q-xlong" : n >= 9 ? " q-long" : "";
}
function questionHTML(item, slot){
  const n = slotsOf(item), act = slot || 0;
  /* A box says whether the keys are writing into it, and carries the
     index it stands for, so that tapping it moves them there. One box
     needs neither, and gets neither, so the row of every family drawn
     so far comes out exactly as it did. */
  const box = i => `<span class="answerbox${n > 1 && i === act ? " active" : ""}" id="${boxId(i)}"`
    + (n > 1 ? ` data-slot="${i}"` : "") + `>?</span>`;
  const words = s => s ? `<span class="qsep">${s}</span>` : "";
  // the unit of the answer stands behind the box, where the child would
  // write it in an exercise book
  const unit = item && item.unit ? `<span class="unit">${item.unit}</span>` : "";
  // the second shape of the row, after the picture: the box comes first
  // and the rest of the line follows it, so the child reads "▢ × 7 = 42"
  // in the order it is written in the book
  if(item && item.layout === "lead"){
    return `<div class="question${questionSize(item)}" id="qbox">${box(0)}<span id="qtext">${item.text}</span>${unit}</div>`;
  }
  /* The fourth shape: the box stands between the two things being
     compared, "3 m ▢ 280 cm". Nothing is drawn in front of it, because
     what usually stands there is the sign and here the sign is the
     answer; what follows it is the other side, finished text on the item
     like every other word a question carries. */
  if(item && item.layout === "mid"){
    return `<div class="question q-cmp${questionSize(item)}" id="qbox">`
      + `<span id="qtext">${item.text}</span>${box(0)}<span>${item.tail}</span></div>`;
  }
  const inner = !item ? `<span id="qtext"></span>`
    : item.svg ? `<span id="qtext" class="qsvg">${item.svg}</span>`
    : `<span id="qtext">${item.text}</span><span>${relOf(item)}</span>`;
  /* The third shape of the row: several boxes with the words that
     belong between and after them, "36 : 5 = ▢ (zb. ▢)" and
     "347 = ▢ + ▢ + ▢". The words are on the item as finished text, like
     the unit and for the same reason: the language does not change in
     the middle of a race. `sep` stands in every gap between two boxes,
     so one word covers a row of two boxes and a row of three alike. */
  if(n > 1){
    let mid = "";
    for(let i = 0; i < n; i++) mid += (i ? words(item.sep) : "") + box(i);
    return `<div class="question q-boxes q-boxes${n}${questionSize(item)}" id="qbox">${inner}`
      + `${mid}${words(item.tail)}${unit}</div>`;
  }
  /* A question answered by choosing wears a row class of its own,
     because the box on it fills with a word rather than a number: "347
     má ▢" turns into "347 má tři číslice", and a word set in the size a
     number is set in would run off the side. Everything else about the
     row is the ordinary one box shape. */
  const chosen = item && item.opts ? " q-pick" : "";
  return `<div class="question${chosen}${questionSize(item)}" id="qbox">${inner}${box(0)}${unit}</div>`;
}
/* The answering surface belongs to the question, not to the screen, so
   a race may mix families that are answered differently. A new input
   element adds a branch here, a `.keypad-<name>` rule in the stylesheet
   and a branch in `tap()`. Every key goes through `data-k`, because the
   delegated listener reads that attribute before any other. */
function keypadHTML(item){
  const kind = (item && item.input) || "pad";
  const dig = n => `<button class="key" data-k="${n}">${n}</button>`;
  const del = `<button class="key del" data-k="del" aria-label="${t("clear")}">&#9003;</button>`;
  const ok = `<button class="key act" data-k="ok">OK</button>`;
  /* More than one box gets a key that moves between them. A box that
     fills up hands the keys on by itself, but a one digit quotient in a
     box that holds two does not, and a child is not going to work out
     that the box itself can be tapped. The digits keep their three
     columns and the rubber, the arrow and the tick move into a fourth,
     so the pad is still four rows tall and a race that mixes the
     surfaces does not change height under the child's thumb.
     Two boxes and three get the same pad: the arrow steps round them
     all, so what changes between them is the row above, not the keys. */
  const surf = ` data-surface="${esc(surfaceOf(item))}"`;
  /* A question answered by choosing puts the choices themselves on the
     answering surface, one under the other and across its whole width.
     They are words, not digits: three of them side by side would be a
     hundred and ten pixels each and nothing a child reads at a glance
     fits in that. Three big buttons dropping into the three columns of
     the number pad is the trap this avoids; they would fit, and only by
     accident.
     The surface keeps the height of the number pad, four rows of keys
     and the three gaps between them, and the stylesheet shares those
     rows out between however many choices there are, so a race that
     mixes the two does not move the screen under the child's thumb.
     There is no tick: a choice is not gathered up press by press the
     way a number is, so the button that is pressed is the whole answer
     and sending it is the same move. Every button goes through
     `data-k`, because the delegated listener reads that attribute
     before any other and a `data-act` of its own would never be
     reached. */
  if(kind === "pick"){
    const opts = (item && item.opts) || [];
    /* A choice that is one sign rather than a word is set larger, for the
       same reason a word is set smaller than a digit: what the button
       says has to be read at a glance and there is room. It is said here
       by what is on the buttons rather than by which family asked, so
       nothing in the stylesheet has to know that comparing exists. */
    const glyph = opts.length && opts.every(o => Array.from(o).length === 1) ? ` data-glyph="1"` : "";
    return `<div class="keypad keypad-pick" id="keypad" data-input="pick" data-opts="${opts.length}"${glyph}${surf}>
      ${opts.map((o, i) => `<button class="key opt" data-k="opt${i}">${esc(o)}</button>`).join("")}
    </div>`;
  }
  if(SLOTS[kind] > 1){
    const next = `<button class="key nx" data-k="next" aria-label="${t("nextBox")}">&#8594;</button>`;
    return `<div class="keypad keypad-${kind}" id="keypad" data-input="${kind}"${surf}>
      ${dig(1)}${dig(2)}${dig(3)}${del}
      ${dig(4)}${dig(5)}${dig(6)}${next}
      ${dig(7)}${dig(8)}${dig(9)}${ok}
      <button class="key zero" data-k="0">0</button>
    </div>`;
  }
  return `<div class="keypad keypad-pad" id="keypad" data-input="pad"${surf}>
    ${[1,2,3,4,5,6,7,8,9].map(n => dig(n)).join("")}
    ${del}${dig(0)}${ok}
  </div>`;
}
/* Some questions need a word of framing before the child answers, for
   instance whether the dial means morning or evening. */
function askText(item){ return item && item.ask ? t.apply(null, [item.ask].concat(item.askArgs || [])) : ""; }
/* What the child sees in one answer box while typing. A time is keyed as
   plain digits and gets its colon as soon as the reading is unambiguous;
   that belongs to the single box of a dial, so a box that has an index
   of its own shows exactly what was typed into it. */
function typedText(item, typed, slot){
  if(typed === "") return "?";
  /* A question answered by choosing keeps which button was pressed, so
     the box shows the choice that was made rather than the number of
     the button: "347 má tři číslice", not "347 má 2". */
  if(item && item.opts) return item.opts[+typed] === undefined ? typed : item.opts[+typed];
  if(!slot && item && item.kind === "clock" && typed.length >= 3){
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
      ${questionHTML(RUN.items[RUN.idx], RUN.slot)}
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
}
function drawRail(){ driveTo(myU(), ghostU()); }

/* The whole question row is rebuilt between questions, so the boxes are
   looked up again every time rather than held on to. */
function paintBoxes(item){
  const n = slotsOf(item);
  for(let i = 0; i < n; i++){
    const box = boxAt(i);
    if(!box) continue;
    const v = typedAt(i);
    box.textContent = typedText(item, v, i);
    box.className = "answerbox" + (v ? " filled" : "") + (n > 1 && i === RUN.slot ? " active" : "");
  }
}
/* Which box the keys write into. Two ways lead here, the arrow key and
   a tap on the box itself, and both are the same move. */
function pickSlot(i){
  if(!RUN || RUN.state !== "ask") return;
  const item = RUN.items[RUN.idx];
  if(!(i >= 0) || i >= slotsOf(item)) return;
  RUN.slot = i;
  paintBoxes(item);
}

function tap(k){
  if(!RUN || RUN.state !== "ask") return;
  const item = RUN.items[RUN.idx], n = slotsOf(item);
  /* A question answered by choosing has nothing to gather: the button
     that was pressed is the whole answer, so it is written into the box
     and sent in one move. A number key can still arrive from a real
     keyboard, where 1 is the first choice; on the surface itself there
     are no number keys at all. */
  if(item && item.opts){
    const i = k.slice(0, 3) === "opt" ? +k.slice(3) : (k >= "1" && k <= "9" ? +k - 1 : -1);
    if(!(i >= 0) || i >= item.opts.length) return;
    RUN.typed = String(i);
    paintBoxes(item);
    submit();
    return;
  }
  if(k === "next"){ if(n > 1) pickSlot((RUN.slot + 1) % n); return; }
  if(k === "ok"){ if(typedFull()) submit(); return; }
  if(k === "del"){
    /* Rubbing out past the start of a box steps back into the one
       before it, so a wrong quotient is reached by pressing the same
       key again rather than by first finding the right box. */
    if(typedAt(RUN.slot) === "" && RUN.slot > 0) RUN.slot--;
    setTypedAt(RUN.slot, typedAt(RUN.slot).slice(0, -1));
  } else if(typedAt(RUN.slot).length < maxLenAt(item, RUN.slot)){
    setTypedAt(RUN.slot, typedAt(RUN.slot) + k);
    // a box that has filled up hands the keys on by itself
    if(typedAt(RUN.slot).length >= maxLenAt(item, RUN.slot) && RUN.slot < n - 1) RUN.slot++;
  }
  paintBoxes(item);
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
   number the keypad turned it into, and an answer that wears a unit is
   shown with it: "3 m = 300 cm", the way the whole line reads.
   A line whose box stands in front reads back with the box filled in,
   "6 × 7 = 42", because that is the whole sum the child was after; the
   equals sign and the result are already part of the line. */
function rightAnswerText(item){
  if(item.kind === "clock") return t("clockIs", item.disp);
  if(item.layout === "lead") return item.answer + " " + item.text;
  /* A comparison reads back as the line with the sign put in,
     "3 m > 280 cm", because the sign is the answer and the two sides
     were already the whole line. */
  if(item.layout === "mid") return item.text + " " + item.opts[item.answer] + " " + item.tail;
  /* A question answered by choosing reads back as the sentence it is,
     "347 má tři číslice", because the choice is a word and the number
     of the button it stood on would say nothing. */
  if(item.opts) return item.text + " " + relOf(item) + " " + item.opts[item.answer];
  /* An answer that was written into several boxes reads back as the
     whole line, with the words that stood between the boxes standing
     between the numbers: "36 : 5 = 7 (zb. 1)". */
  if(Array.isArray(item.answer)){
    const mid = item.sep ? " " + item.sep + " " : " ";
    return item.text + " " + relOf(item) + " " + item.answer.join(mid) + (item.tail || "");
  }
  return item.text + " " + relOf(item) + " " + item.answer + (item.unit ? " " + item.unit : "");
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
  /* The two mistakes worth naming when something is left over. Leaving
     as much as the divisor or more means one more of it still fits in,
     which is the mistake the whole chapter is about; getting what is
     left over right but the quotient wrong is miscounting how many times
     it goes in, and saying so beats repeating the answer. Both need the
     divisor, which is why they had to wait for the generator. */
  if(item.kind === "divrem" && Array.isArray(typed)){
    const q = parseInt(typed[0], 10), r = parseInt(typed[1], 10);
    if(!isNaN(r) && r >= item.divisor) return t("divremTooBig", item.divisor);
    if(!isNaN(q) && r === item.answer[1] && q !== item.answer[0]) return t("divremQuotient", item.divisor);
  }
  /* Even and odd has one rule behind it and the whole chapter is that
     rule, so a wrong answer gets told the rule rather than the answer:
     only the last figure decides. How many figures gets no message of
     its own, because the line read back above it already says what the
     number is, which is the only thing there was to miscount. */
  if(item.kind === "parity") return t("parityMiss");
  /* Two quantities are compared only after one of them has been
     converted, so the work was the conversion and that is what a wrong
     answer is handed back: the two sides once they are in the same unit.
     Two plain numbers have nothing to convert, so there the one rule
     worth naming is which way the sign opens. */
  if(item.kind === "cmpunit") return t("cmpUnitMiss", item.same[0], item.same[1]);
  if(item.kind === "cmpnum") return t("cmpMiss");
  /* The one mistake splitting a number apart is about: writing the
     digit down instead of what it is worth, a 4 where forty belongs.
     Every part of the answer is a digit times what its place is worth,
     so the digit is the first character of it, and the message names
     the first box where the bare digit was written. */
  if(item.kind === "split" && Array.isArray(typed)){
    for(let i = 0; i < item.answer.length; i++){
      const worth = item.answer[i], digit = Number(String(worth)[0]);
      if(worth > 9 && parseInt(typed[i], 10) === digit) return t("splitDigits", digit, worth);
    }
  }
  return t("wrongHint");
}

function submit(){
  const p = P(), item = RUN.items[RUN.idx];
  const ms = Date.now() - RUN.t0;
  const correct = item.check(RUN.typed);
  const hint = document.getElementById("hint");
  // every box of the answer is marked, not just the first one
  const markBoxes = cls => { for(let i = 0; i < slotsOf(item); i++){ const b = boxAt(i); if(b) b.className = cls; } };
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
    markBoxes("answerbox ok");
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
    markBoxes("answerbox bad");
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
    const next = RUN.items[RUN.idx];
    // the next question may be answered in a different number of boxes,
    // so what has been typed starts again in the shape that one wants
    RUN.typed = blankTyped(next); RUN.slot = 0; RUN.state = "ask"; RUN.t0 = Date.now();
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
    // it asks the surface, not the name of the input element: two
    // questions answered by choosing share a name and not the words on
    // the buttons
    const kp = document.getElementById("keypad");
    if(kp && kp.dataset.surface !== surfaceOf(next)) kp.outerHTML = keypadHTML(next);
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
  RUN.evolved = isPet(itemById(p.runner)) && before && stageOf(p, p.runner) > before;
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
function mountResult(){ stopAnim(); }

/* ---------- workshop ----------
   Deliberately quiet next to the race screen: no stage, no car, no
   counter running. What moves is only what the child puts on the
   counter. */
let JOB = null;
function startJob(p, jobId){
  const job = jobById(jobId);
  JOB = {job, items: buildJob(p, job), idx:0, picked:[], typed:"", state:"ask", ok:0, parts:0,
         retries:0, missed:[], newStars:0};
  go("job");
}
function jobAskText(item){ return t.apply(null, [item.ask].concat(item.askArgs || [])); }
function moneyStr(v){ return v + " " + t("moneyUnit"); }

const JOB_PIC = {count:"&#128295;", money:"&#128176;", words:"&#128221;"};
function viewShop(p){
  const atSchool = chapterJobIds(p);
  // the workshop says where its parts go, because a child who cannot see
  // that has no reason to care about them. It is a sentence and not a
  // tally: what is left to buy is in the garage, where it can be looked
  // at, and nothing here counts down towards it
  const partsNote = shelvesEmpty(p) ? t("shopPartsDone") : t("shopPartsNote");
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
      <div class="pad muted" style="margin-top:14px">${partsNote}</div>
    </div>
  </div>`;
}

/* How to answer this one, in a sentence. Three input elements, three
   sentences, and the one that is written rather than laid out says so
   plainly, because nothing else on the screen would. */
function jobHintKey(item){
  return item.input === "pieces" ? "jobTapPieces"
       : item.input === "pad"    ? "jobTypeAnswer"
       : "jobTapCoins";
}
function viewJob(p){
  const item = JOB.items[JOB.idx];
  /* A word problem is three sentences where a money task is one, so the
     question asks for smaller type once it is long, the same way a long
     line of arithmetic does in a race. It is measured on the text as it
     is drawn, so the language it is drawn in decides. */
  const ask = jobAskText(item);
  const askCls = ask.length > 90 ? " long" : "";
  const pips = JOB.items.map((_, i) => {
    const m = JOB.marks && JOB.marks[i];
    return `<span class="pip ${m === 1 || m === 2 ? "ok" : m === 0 ? "bad" : i === JOB.idx ? "now" : ""}"></span>`;
  }).join("");
  return `<div class="scr shop${item.input === "pad" ? " written" : ""}">
    <div class="topbar">
      <button class="iconbtn" data-act="jobquit" aria-label="${t("back")}">&#10005;</button>
      <h1>${t("job_" + JOB.job.id)}</h1>
      <span class="chip cool"><span class="em">&#9881;</span> ${p.parts + JOB.parts}</span>
    </div>
    <div class="pips dark" style="padding:0 18px 6px">${pips}</div>
    <div class="scr-scroll">
      <div class="jobask${askCls}" id="jobask">${ask}</div>
      ${item.pic ? `<div class="jobpicbox">${item.pic}</div>` : ""}
      <div class="revealbox" id="reveal">${revealHTML(p)}</div>
      <div class="counter" id="counter">${counterHTML()}</div>
      <div class="jobhint" id="jobhint">${t(jobHintKey(item))}</div>
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
   answer is how many times it is tapped. A word problem has a number
   for an answer and is written on the number pad, which is the race's
   drawing and nothing else of the race: the keys are the same keys, the
   handling of them is jobKey() below. */
function trayHTML(item){
  if(item.input === "pad") return `<div class="tray pad">${keypadHTML(item)}</div>`;
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
  const input = (JOB.items[JOB.idx] || {}).input;
  /* A written answer goes on the counter too, rather than into a box of
     its own: it is the one place on this screen where what the child
     has done so far shows up, whether it was laid out or keyed in. */
  if(input === "pad"){
    return JOB.typed
      ? `<span class="counter-sum">${esc(JOB.typed)}</span>`
      : `<span class="counter-empty">${t("jobEmptyTyped")}</span>`;
  }
  const pieces = input === "pieces";
  if(!JOB.picked.length) return `<span class="counter-empty">${t("jobEmpty")}</span>`;
  return JOB.picked.map((v, i) => `<button class="putcoin" data-drop="${i}">${pieces ? pieceSVG() : coinSVG(v)}</button>`).join("")
    + `<span class="counter-sum">${pieces ? JOB.picked.length : moneyStr(sum(JOB.picked))}</span>`;
}
function paintCounter(){
  const c = document.getElementById("counter");
  if(c) c.innerHTML = counterHTML();
}
/* THE WORKSHOP'S OWN PLACE FOR A KEY PRESS.
   The number pad on a word problem is drawn by keypadHTML(), which is
   only a drawing, but tap() is not: it holds the race's typing, its
   stopwatch, its points for speed and its car. Sending workshop keys
   through it would put a clock on a task whose whole point is that
   there is none, so the workshop has this instead, and the delegated
   listener decides between the two by which screen is up. It knows
   about three keys and ignores everything else, because there is
   nothing else on that pad. */
function jobKey(k){
  if(!JOB || JOB.state !== "ask") return;
  const item = JOB.items[JOB.idx];
  if(!item || item.input !== "pad") return;
  if(k === "ok"){ jobCheck(); return; }
  if(k === "del"){
    if(!JOB.typed) return;
    JOB.typed = JOB.typed.slice(0, -1); paintCounter(); return;
  }
  if(!/^[0-9]$/.test(k)) return;
  if(JOB.typed === "0") JOB.typed = "";            // no answer begins with a nought
  if(JOB.typed.length >= (item.maxLen || 3)) return;
  JOB.typed += k; sfx.coin(); paintCounter();
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
   the child sees one right answer rather than being told to try again.
   A written answer is one number, so it is shown as one number; the
   sentence above it says to read the task again rather than naming the
   result twice. */
function solutionHTML(item){
  if(item.input === "pad") return `<span class="solnum">${item.answer}</span>`;
  return item.solution.map(v =>
    `<span class="putcoin small">${item.input === "pieces" ? pieceSVG() : coinSVG(v)}</span>`).join("");
}
function jobCheck(){
  if(!JOB || JOB.state !== "ask") return;
  const p = P(), item = JOB.items[JOB.idx];
  // laid out or written down, it is the same answer to the same task
  const given = item.input === "pad" ? JOB.typed : JOB.picked;
  if(!given.length) return;
  const correct = item.check(given);
  const near = !correct && item.near && item.near(given);
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
  JOB.typed = "";
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
  // A word problem goes on its chip as the line its numbers make rather
  // than as the whole story: three sentences in a pill would be a
  // paragraph with a border round it, and what is worth seeing again is
  // what the reading came out as.
  const miss = [...new Map(JOB.missed.map(i =>
    [i.key + "|" + (i.answer !== undefined ? i.answer : i.amount), i])).values()].slice(0, 3);
  // the label under the total, and the one decision it carries: while
  // anything is still for sale the number is a purse, and once nothing
  // is it says how much work has been done instead. Nothing else about
  // the number changes, and there is no offer to go shopping when there
  // is nothing left to shop for
  const shelves = partsShelves(p);
  const totalLabel = shelves.length ? t("statPartsAll") : t("statPartsWork");
  const spendTo = spendTarget(p);
  return `<div class="scr narrow">
    <div class="scr-scroll">
      <div class="result">
        <div class="medal">&#9881;</div>
        <h2>${t("jobFinished")}</h2>
        <div class="muted">${t("jobFinishedSub")}</div>
        <div class="statrow">
          <div class="stat"><div class="v">+${JOB.parts}</div><div class="l">${t("statParts")}</div></div>
          <div class="stat"><div class="v">${JOB.ok}/${JOB.items.length}</div><div class="l">${t("statSolved")}</div></div>
          <div class="stat"><div class="v">${p.parts}</div><div class="l">${totalLabel}</div></div>
        </div>
        ${tokenCardHTML(p, shopSpec(p), JOB.newStars)}
        ${miss.length ? `<div class="h2" style="margin-bottom:6px">${t("jobReviewNext")}</div>
          <div class="factchips">${miss.map(i =>
            `<span class="factchip">${i.calc || jobAskText(i)}</span>`).join("")}</div>` : ""}
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:22px">
          <button class="btn mint wide" data-act="jobagain">${t("jobAgain")}</button>
          <button class="btn ghost wide" data-act="shop">${t("jobBackToShop")}</button>
          ${spendTo ? `<button class="btn ghost wide" data-act="spendparts">${t("jobSpendParts")}</button>` : ""}
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
/* Which shelf of the garage is open, and whose it is. Deliberately a
   variable and not a field in the profile, exactly like PEEK and BACK on
   the map: folding is a way of looking at the catalogue, not a piece of
   progress, so closing the game forgets it and the next start opens the
   garage folded again. It holds a profile id, so switching player folds
   it away too. */
let SHELF = null;
const shelfOpen = (p, sec) => !!SHELF && SHELF.id === p.id && SHELF.sec === sec;
/* What a folded shelf says about itself, and it has to be enough that
   folding reads as tidying rather than as hiding: what is on the shelf,
   how many of them there are, how many are already the child's, what the
   cheapest thing still left costs, and what is being worn from it. The
   last one is why a shelf a child already has something on never reads
   as empty while it is shut. */
function shelfInfo(sh){
  const n = sh.list.length;
  const left = sh.list.filter(x => !sh.owns(x));
  const bits = [n + " " + pickForm(sh.word, n), t("shelfHas", n - left.length)];
  bits.push(left.length
    ? t("shelfFrom", Math.min.apply(null, left.map(x => x.cost))) + " &#9881;"
    : t("shelfAll"));
  // what is worn from the shelf goes on a line of its own: the counting
  // line is already as long as a phone holds, and a line that wrapped in
  // the middle of a phrase would read worse than two short ones
  return `<span class="shelfsub">${bits.join(" &middot; ")}</span>`
    + (sh.worn ? `<span class="shelfworn">${t("shelfOn", sh.worn)}</span>` : "");
}
/* The six shelves, in the order they hang: the paints for the machines
   first, then the five duck layers in the order the duck is built up.
   Each says what it holds, how to tell whether a thing on it is already
   the child's and what is worn from it, so one piece of code draws the
   bar for all six and a seventh shelf would be one entry here. */
function garageShelves(p){
  const wornPaint = (p.paint || {})[paintBase(p).id] || "";
  const out = [{
    sec: "paintsec", title: t("paints"), note: t("paintsNote"),
    list: PAINTS, word: "shelfPaint",
    owns: pa => (p.paints || []).includes(pa.id),
    worn: wornPaint ? t(wornPaint) : "",
    cells: () => paintCells(p)
  }];
  for(const spec of DUCK_LAYERS){
    // a layer that cannot be empty is wearing its first part when the
    // profile says nothing, the same way the duck is drawn
    const worn = (p.duck || {})[spec.layer] || (spec.none ? "" : spec.list[0].id);
    out.push({
      sec: spec.sec, title: t(spec.title), note: t(spec.note),
      list: spec.list, word: "shelfPart",
      owns: part => ownsDuckPart(p, part),
      worn: worn ? t(worn) : "",
      cells: () => duckPartCells(p, spec)
    });
  }
  return out;
}
/* One shelf: the bar always, what is on it only while it is open. The
   cells arrive as a function and not as a string on purpose -- a shut
   shelf must not build sixty whole ducks and throw them away, because
   not building them is the entire point. */
function shelfHTML(p, sh){
  const open = shelfOpen(p, sh.sec);
  return `<section class="shelf${open ? " open" : ""}" id="${sh.sec}">
    <button class="shelfhead" data-act="shelf" data-sec="${sh.sec}" aria-expanded="${open}">
      <span class="shelfmark" aria-hidden="true">${open ? "&#9662;" : "&#9656;"}</span>
      <span class="shelftxt"><span class="shelfname">${sh.title}</span>${shelfInfo(sh)}</span>
    </button>
    ${open ? `<div class="pad muted" style="margin-bottom:10px">${sh.note}</div>
    <div class="grid">${sh.cells()}</div>` : ""}
  </section>`;
}
/* The garage draws whole things and never swatches: a machine, an
   animal, or a whole duck wearing the one part a tile is offering. That
   is the right call, because a coloured square tells a child nothing
   about what they would end up with, but it means the number of tiles is
   the number of nodes, and after step H a hundred and fifteen of them
   were built at once.

   So the six shelves below the racers fold, and one is open at a time.
   That is what puts a ceiling on the screen -- the racers plus one
   shelf, whatever the catalogue grows to -- and a shut shelf is not
   built at all rather than merely hidden. Nothing is taken away by it:
   the bar of a shut shelf says what is on it, how much of it, how much
   is already the child's, from what price and what is worn from it, and
   one tap opens it.

   The racers themselves never fold. That row is how a racer is chosen,
   the choice only ever sorts and never filters, and a bought machine
   that could not be picked would be a worse thing than any number of
   nodes. (R11, decided 14 September 2026.) */
function viewCollection(p){
  const cell = it => {
    const owned = p.owned.includes(it.id);
    const st = isPet(it) ? stageOf(p, it.id) : 0;
    const xp = p.xp[it.id] || 0;
    const nextAt = st === 1 ? EVO[1] : st === 2 ? EVO[2] : null;
    const prevAt = st === 1 ? 0 : EVO[1];
    const pct = nextAt ? Math.min(100, Math.round((xp - prevAt) / (nextAt - prevAt) * 100)) : 100;
    if(!owned){
      return `<button class="item locked" data-act="buy" data-id="${it.id}">
        <span class="pic">${it.duck ? duckSVG(it) : it.kind ? rideSVG(it) : petSVG(it, 1)}</span>
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
      <div class="h2 pad" id="ducksec" style="margin-bottom:8px">${t("ducks")}</div>
      <div class="grid">${DUCKS.map(cell).join("")}</div>
      <div class="pad muted" style="margin:18px 0 0">${t("shelfNote")}</div>
      ${garageShelves(p).map(sh => shelfHTML(p, sh)).join("")}
      <div style="height:20px"></div>
    </div>
  </div>`;
}
/* Paint is shown on a machine rather than as a swatch, because a colour
   chip tells a child nothing about what the car will look like. The
   machine shown is the one currently chosen, so the preview is of their
   own racer; an animal has nothing to paint, so the plain car stands in. */
const paintBase = p => itemById(p.runner).kind ? itemById(p.runner) : RIDES.find(r => r.id === "ri_auto");
/* The one place that knows what a paint tile shows, so the tile and the
   filling in of a tile later cannot drift apart. An empty id is the
   machine as it came. */
function paintPic(p, id){
  const base = paintBase(p), pa = paintById(id);
  return rideSVG(pa ? Object.assign({}, base, {c1: pa.c1, c2: pa.c2}) : base);
}
/* The same for a duck tile: the child's own duck, dressed the way they
   have it, with this one part swapped into its layer. An empty id
   leaves the layer bare, which is what the empty tile is for. */
function duckPic(p, layer, id){
  return duckSVG(DUCKS[0], Object.assign({}, p.duck, {[layer]: id}));
}
/* How many tiles of a shelf are drawn together with the screen. The rest
   carry only what they need to be drawn from and get their picture when
   they come near the screen; see mountCollection(). Eight is a row of
   the widest grid the garage draws and getting on for three rows of a
   phone, so what the shelf opens onto is drawn already and the observer
   only ever has to keep up with a thumb. */
const SHELF_EAGER = 8;
/* A tile's picture, either now or later. What the tile says about itself
   is enough to draw it from, so nothing about the waiting tiles is held
   anywhere: the screen is still drawn from the profile. */
function tilePic(p, kind, layer, id, i){
  if(i < SHELF_EAGER){
    return `<span class="pic">${kind === "paint" ? paintPic(p, id) : duckPic(p, layer, id)}</span>`;
  }
  return `<span class="pic" data-draw="${kind}:${layer}:${id}"></span>`;
}
function paintCells(p){
  const base = paintBase(p);
  const worn = (p.paint || {})[base.id] || "";
  let i = 0;
  const cell = (id, label, cost, on) => `
    <button class="item ${on ? "sel" : ""}" data-act="${cost === null ? "usepaint" : "buypaint"}" data-id="${id}">
      ${tilePic(p, "paint", "", id, i++)}
      <span class="nm">${label}</span>
    </button>`;
  const none = cell("", t("paintNone"), null, !worn);
  const rest = PAINTS.map(pa => {
    const owned = (p.paints || []).includes(pa.id);
    return owned
      ? cell(pa.id, t(pa.id), null, worn === pa.id)
      : cell(pa.id, "&#9881; " + pa.cost, pa.cost, false);
  }).join("");
  return none + rest;
}
/* A duck part is shown on a whole duck wearing it, not as a swatch, for
   the same reason a paint is shown on a machine: a coloured square tells
   a child nothing about what they would end up with. The duck shown is
   dressed the way the child has it, with this one part swapped in, so
   the tile is a preview of their own duck. */
function duckPartCells(p, spec){
  const worn = (p.duck || {})[spec.layer] || "";
  let i = 0;
  const tile = (id, label, on, owned) => `<button class="item ${on ? "sel" : ""}"
    data-act="${owned ? "useduck" : "buyduck"}" data-id="${id}" data-layer="${spec.layer}">
    ${tilePic(p, "duck", spec.layer, id, i++)}
    <span class="nm">${label}</span>
  </button>`;
  // a layer that can be taken off gets an empty tile first, the way the
  // paints do; the body has none, because a duck cannot be colourless
  return (spec.none ? tile("", t(spec.none), !worn, true) : "")
    + spec.list.map(part => tile(part.id,
        ownsDuckPart(p, part) ? t(part.id) : "&#9881; " + part.cost,
        worn === part.id || (!worn && !spec.none && part === spec.list[0]),
        ownsDuckPart(p, part))).join("");
}
/* Putting the picture into one waiting tile. Everything it needs stands
   on the tile itself, so this draws exactly what the cell would have
   drawn, and the tile stops waiting once it has it. */
function drawTile(p, el){
  const a = String(el.dataset.draw || "").split(":");
  el.innerHTML = a[0] === "paint" ? paintPic(p, a[2]) : duckPic(p, a[1], a[2]);
  el.removeAttribute("data-draw");
}
let TILE_EYE = null;
/* Drawing the rest of a shelf only as it is scrolled to. Folding the
   shelves was the first half of R11 and it bounds the screen at the
   racers plus one shelf; this is the second half, and it is what lets
   one shelf hold sixty whole ducks, which is where the flags are going.
   A whole duck is some thirty nodes of drawing against five of button,
   so a tile is written in two pieces and only the piece the child can
   see is paid for.

   A browser with no IntersectionObserver gets every picture at mount
   time, which is exactly what the garage did before: a catalogue of
   empty squares would be worse than a slow screen. */
function mountCollection(){
  let late;
  try{ late = [].slice.call(document.querySelectorAll(".shelf .pic[data-draw]")); }catch(e){ return; }
  if(!late.length) return;
  const p = P();
  if(typeof IntersectionObserver !== "function"){ late.forEach(el => drawTile(p, el)); return; }
  if(TILE_EYE) TILE_EYE.disconnect();
  TILE_EYE = new IntersectionObserver(function(entries){
    for(const e of entries) if(e.isIntersecting){ drawTile(p, e.target); TILE_EYE.unobserve(e.target); }
  }, {rootMargin: "400px 0px"});
  late.forEach(el => TILE_EYE.observe(el));
}
/* The five layers in the order the garage shows them: the body first,
   because it is the one that is never empty, then what is painted on,
   what goes on the head, what goes over the eye and what the duck
   carries. Cheapest part first inside each of them, so the first tile
   a child sees is one they can afford. */
const DUCK_LAYERS = [
  {layer: BODY_LAYER, list: DUCK_BODY, sec: "duckbodysec", title: "duckBodies", note: "duckBodiesNote"},
  {layer: PAT_LAYER,  list: DUCK_PAT,  sec: "duckpatsec",  title: "duckPats",   note: "duckPatsNote",  none: "duckPatNone"},
  {layer: HEAD_LAYER, list: DUCK_HEAD, sec: "duckheadsec", title: "duckHeads",  note: "duckHeadsNote", none: "duckHeadNone"},
  {layer: EYE_LAYER,  list: DUCK_EYE,  sec: "duckeyesec",  title: "duckEyes",   note: "duckEyesNote",  none: "duckEyeNone"},
  {layer: GEAR_LAYER, list: DUCK_GEAR, sec: "duckgearsec", title: "duckGear",   note: "duckGearNote",  none: "duckGearNone"}
];
/* Where parts go, and the one place that knows it. Parts buy two
   different things now, paints for the machines and an outfit for the
   duck, so the workshop can say what they are for and send the child
   straight to a section that still has something in it.
   The sections come back cheapest first, by what the cheapest thing
   still left in each of them costs, and that is the whole point of the
   order: the cheapest paint is thirty parts and the cheapest duck part
   is six, so a child with one job's worth of parts in hand who was sent
   to the paints was being walked to a shelf where everything was out of
   reach. Ordering by price means the first section named is one the
   child has the most chance of being able to buy from.
   This answers with places, never with how many are left. A line saying
   "nine of sixty-five" would turn a shelf to browse into a target to
   chase, and the workshop is the one room in the game with nothing to
   chase in it. */
function shelvesLeft(p){
  const out = [];
  const paints = PAINTS.filter(pa => !(p.paints || []).includes(pa.id));
  if(paints.length) out.push({sec: "paintsec", cost: Math.min(...paints.map(pa => pa.cost))});
  for(const spec of DUCK_LAYERS){
    const rest = spec.list.filter(part => !ownsDuckPart(p, part));
    if(rest.length) out.push({sec: spec.sec, cost: Math.min(...rest.map(part => part.cost))});
  }
  return out.sort((a, b) => a.cost - b.cost);
}
const partsShelves = p => shelvesLeft(p).map(s => s.sec);
/* Where the "spend your parts" button goes, and whether it is offered at
   all. It is the cheapest section the child can actually pay from today;
   when everything left costs more than they have, there is nothing to
   offer and the button stays away, exactly as it does when the shelves
   are empty altogether. A button that walks a child to a wall of prices
   they cannot meet is a promise the game does not keep, and an offer
   that quietly does nothing is the thing this game does not do. */
const spendTarget = p => (shelvesLeft(p).find(s => s.cost <= p.parts) || {}).sec || null;
/* What parts are for once every shelf is empty, decided long before the
   duck existed: the number stops looking like a purse and starts saying
   how much work has been done altogether. The condition is both shelves
   and not just one. The paints are about twenty six pieces of work on
   their own, the duck is another sixty three, and a child who owns every
   paint still has somewhere for the next part to go.
   When it does switch, only the label switches. No new goods are
   invented, no goal is added, and parts keep coming in exactly as
   before. */
const shelvesEmpty = p => partsShelves(p).length === 0;

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
// this family names both directions itself: dividing by a round number
// is not the multiplication read backwards on paper, so deriving the
// second half from the first would print the wrong example
const G_EX = {m1:"7×10", d1:"70:10", m2:"3×40", d2:"120:40"};
const O_EX = {"1":"47→50", "2":"347→350", "3":"347→300"};
// one example per kind of measure; the arrow says which way round it is
// being read, and every one of them is asked both ways
const U_EX = {"1":"3 m→cm", "2":"1 kg→g", "3":"4 l→dl", "4":"2 h→min"};
const Q_EX = {"1":"7+5-3", "2":"30+40-20", "3":"47+5-3"};
const Z_EX = {"1":"4+3×5", "2":"(4+3)×5", "3":"300+7×8", "4":"500-(40+30)"};
// one tile per divisor rather than per bucket, because the divisor is
// what the key remembers and a parent wants to see that it is the
// sevens that are sticking
// one example per bucket, the number and the line it splits into
const V_EX = {"1":["47", "40 + 7"], "2":["350", "300 + 50"], "3":["347", "300 + 40 + 7"]};
const R_EX = {"2":"9:2", "3":"14:3", "4":"23:4", "5":"36:5", "6":"40:6",
              "7":"52:7", "8":"60:8", "9":"75:9", "10":"87:10"};
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
  /* `reach` is for a family that has no track to be asked about: it
     says in its own words whether the child can get at the material.
     Without it the choice is between always showing a block and never
     showing one, and neither is the truth for material that arrives
     only through one chapter of one book. */
  const push = (trackId, spec, reach) => {
    const tr = trackId && trackById(trackId);
    const reachable = reach !== undefined ? reach : (!tr || (inGrade(p, tr) && unlockState(p, tr).open));
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
  // ten and a hundred are the step straight after that, so the two
  // multiplying blocks stand together the way the tracks do on the map
  push("tens", heatStrip(t("trk_tens"), 2, G_BUCKETS.map(b =>
    ({label: G_EX["m" + b.id], keys:["gm" + b.id], tip: G_EX["m" + b.id]}))
    .concat(G_BUCKETS.map(b =>
    ({label: G_EX["d" + b.id], keys:["gd" + b.id], tip: G_EX["d" + b.id]})))));
  // sharing out with something left over is the last of the dividing, so
  // it closes the multiplying and dividing run, exactly where it closes
  // it on the map
  push("divrem", heatStrip(t("trk_divrem"), 3, Object.keys(R_EX).map(d =>
    ({label: R_EX[d], keys:["r" + d], tip: R_EX[d]}))));
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
  // which operation goes first is the chapter right after the chain, so
  // the two lines of several numbers stand together
  push("ops", heatStrip(t("trk_ops"), 4, Z_BUCKETS.map(b =>
    ({label: Z_EX[b.id], keys:["z" + b.id], tip: Z_EX[b.id]}))));
  /* What kind of number it is stands just before what its places are
     worth, because both are reading a number rather than counting with
     one, and the book takes them in that order. It has no track, so
     there is nothing to ask whether it is reachable: it is shown when
     the chapter the class is on asks for it, or when the child has
     already answered some of it. A parent whose child is nowhere near
     that chapter would otherwise read three grey squares of material
     the game will never hand out. The heat map is the one place this
     family is visible at all, and it belongs here: it says what the
     child has in the box, not which paths exist. */
  const pickTiles = J_BUCKETS.map(b => {
    // the label is a word rather than an example sum, because there is
    // no sum to show; it is looked up by the key, the way the workshop
    // names its own tiles
    const k = "j" + b.id;
    return {label: t("heat_" + k), keys:[k], tip: t("heat_" + k)};
  });
  push(null, heatStrip(t("heatPick"), 3, pickTiles),
    schoolPool(p).some(k => isPickKey(k) && !isCmpKey(k)));
  /* Which of two is more stands right under it: both are answered by
     choosing, both are reading numbers rather than counting with them,
     and neither has a track to be asked about, so the same rule decides
     whether the block is drawn. Two blocks rather than one, because a
     parent reads two different double pages of the book here. */
  const cmpTiles = CMP_BUCKETS.map(b => {
    const k = "j" + b.id;
    return {label: t("heat_" + k), keys:[k], tip: t("heat_" + k)};
  });
  push(null, heatStrip(t("heatCmp"), 5, cmpTiles), schoolPool(p).some(isCmpKey));
  // what each place of a number is worth is the ground the thousand is
  // built on, so the parent reads the two one under the other, which is
  // also how they stand on the map
  push("split", heatStrip(t("trk_split"), 3, V_BUCKETS.map(b =>
    ({label: V_EX[b.id][0], keys:["v" + b.id], tip: V_EX[b.id].join(" = ")}))));
  push("a1000", heatStrip(t("trk_a1000"), 6,
    bucketTiles(K_EX, id => "kp" + id, id => "kn" + id)));
  // converting units is the thousand wearing a unit, so it stands right
  // under it, the same way the two tracks stand on the map
  push("units", heatStrip(t("trk_units"), 4, U_BUCKETS.map(b =>
    ({label: U_EX[b.id], keys:["u" + b.id], tip: U_EX[b.id]}))));
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

/* Where the note about backing the project sends the parent. It is the
   section of the README on GitHub, reached by the anchor GitHub builds
   out of the heading; both anchors were read off the rendered page
   rather than guessed, because a heading with Czech diacritics keeps
   them in the anchor and a guess would have been wrong as often as
   right. There is no German README, so German reads the English one.
   Nothing here is fetched: it is a plain link, so a game running with
   no connection is exactly as it was. */
const SUPPORT_README = "https://github.com/daliborkania-info/math-fact-racer/blob/main/";
const SUPPORT_URL = {
  cs: SUPPORT_README + "README.cs.md#podpora-projektu",
  en: SUPPORT_README + "README.md#supporting-the-project",
  de: SUPPORT_README + "README.md#supporting-the-project"
};
/* The parent section speaks the parent's language, never the child's,
   so this reads DB.lang and not the profile. */
function supportUrl(){ return SUPPORT_URL[DB.lang] || SUPPORT_URL[FALLBACK_LANG]; }
/* Three sentences and a link, drawn as one more card of the parent
   section rather than as a banner over it. It is asked for here and
   nowhere else: no child screen may ever call this, which is what the
   sweep in tests/flow.test.js watches. */
function supportCard(){
  return `<div class="card support" style="margin-top:14px">
    <div class="head"><span class="mark">&#9829;</span><b>${t("supportTitle")}</b></div>
    <div class="muted">${t("supportWhat")} ${t("supportFine")}</div>
    <a class="more" href="${supportUrl()}" target="_blank" rel="noopener noreferrer">${t("supportMore")} &#8594;</a>
  </div>`;
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

      ${supportCard()}

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
  /* The same keys, two places that handle them. The workshop borrows
     the drawing of the number pad for a word problem, never tap(): that
     one belongs to the race and carries its stopwatch, its points for
     speed and its car. Which of the two is meant is decided by the
     screen that is up, because the pad is the only thing they share. */
  if(kb){ view.name === "job" ? jobKey(kb.dataset.k) : tap(kb.dataset.k); return; }
  // an answer written into several boxes: tapping a box moves the keys
  // into it. Its own attribute rather than data-act, because this
  // listener reads data-k first and data-act last.
  const sb = e.target.closest("[data-slot]");
  if(sb){ pickSlot(+sb.dataset.slot); return; }
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
  if(act === "pick"){ DB.current = id; PEEK = null; BACK = null; SHELF = null; save(); go("map"); return; }
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
  // spending parts opens the garage at the first section that still has
  // something in it, so it stands at the paints while paints are left
  // and moves on to the duck afterwards, and stays there while the child
  // tries things on
  // and it opens that shelf on the way, because landing on a shut bar
  // would be walking the child to a closed door
  if(act === "spendparts"){
    const sec = spendTarget(p) || partsShelves(p)[0] || "paintsec";
    SHELF = {id: p.id, sec};
    go("collection", {focus: sec});
    return;
  }

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

  /* Opening a shelf, and shutting the one that was open: the garage
     shows the racers plus at most one shelf, which is what keeps the
     screen from building the whole catalogue at once. The screen is then
     drawn at that shelf, so the bar the child tapped stays under the
     thumb instead of the page growing out from under it, the same way
     the map lands on the year sign when the earlier years unfold.
     Nothing about this is written to the profile. */
  if(act === "shelf"){
    const sec = el.dataset.sec;
    SHELF = shelfOpen(p, sec) ? null : {id: p.id, sec};
    sfx.coin();
    go("collection", {focus: sec});
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

  // the same two steps as a paint, and for the same currency: parts are
  // earned in the workshop and never in a race, and nothing here can be
  // bought with coins
  if(act === "buyduck"){
    const part = duckPartById(id);
    if(p.parts < part.cost){
      sheet(`<h3>${t("notEnoughPartsTitle")}</h3><div class="muted">${t("notEnoughPartsText", part.cost - p.parts)}</div>
        <button class="btn wide" style="margin-top:16px" data-act="closesheet">${t("okBtn")}</button>`);
      return;
    }
    ask(t("buyDuckTitle", t(part.id)), t("buyDuckText", part.cost, p.parts), t("buyYes"), () => {
      p.parts -= part.cost; p.duckParts.push(part.id);
      wearDuckPart(p, duckLayerOf(part), part.id); save(); sfx.coin(); render();
    });
    return;
  }
  if(act === "useduck"){ wearDuckPart(p, el.dataset.layer, id); save(); render(); return; }

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
      seedStarters(DB.profiles[i]);
      seedOpened(DB.profiles[i]);
      seedShop(DB.profiles[i]);
      seedDuck(DB.profiles[i]);
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

/* A key on a real keyboard is the same press as a key on the drawn pad,
   so it is decided the same way, by the screen that is up, and it hangs
   here beside the click rather than being set up by the race's own
   screen. It used to be, and it returned unless a race was on, which
   left a child on a laptop able to write a sum in a race and not the
   answer to a word problem in the workshop, on the very screen that
   draws the same twelve keys.
   Nothing of the race comes with it: the workshop's press goes to
   jobKey(), never to tap(), where the stopwatch, the points for speed
   and the car are. The arrow moves between answer boxes, which the
   workshop has none of, so it is the one key that stays with the race. */
document.addEventListener("keydown", e => {
  const to = view.name === "game" ? tap : view.name === "job" ? jobKey : null;
  if(!to) return;
  if(e.key >= "0" && e.key <= "9") to(e.key);
  else if(e.key === "Backspace") to("del");
  else if(e.key === "Enter") to("ok");
  else if(e.key === "ArrowRight" && to === tap) to("next");
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
