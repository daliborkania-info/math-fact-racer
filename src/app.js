"use strict";
/* =================================================================
   1. LANGUAGE
   The parent section and every player profile can run in a different
   language. render() decides which one applies to the screen it draws.
   ================================================================= */
const FALLBACK_LANG = "en";
const PARENT_VIEWS = ["setpin", "gate", "parent", "players"];
let CUR_LANG = FALLBACK_LANG;

function detectLang(){
  const wanted = (navigator.languages || [navigator.language || ""])
    .map(l => String(l).slice(0, 2).toLowerCase());
  for(const l of wanted) if(I18N[l]) return l;
  return FALLBACK_LANG;
}
function t(key){
  const dict = I18N[CUR_LANG] || I18N[FALLBACK_LANG];
  let s = dict[key];
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
  CUR_LANG = PARENT_VIEWS.indexOf(view.name) >= 0
    ? (DB.lang || FALLBACK_LANG)
    : ((p && p.lang) || DB.lang || FALLBACK_LANG);
  try{ document.documentElement.lang = CUR_LANG; }catch(e){}
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
  }
}
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(DB)); }catch(e){}
}
function P(){ return DB.profiles.find(p => p.id === DB.current) || null; }

function newProfile(name){
  return {
    id: "p" + Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    name: name,
    lang: DB.lang || FALLBACK_LANG,
    facts: {},          // fact key -> {lv, reps, ok, bad, best, seen}
    best: {},           // track id -> best run {dist, hist, n0}
    done: {},           // track id -> best medal 0..3
    owned: STARTERS.slice(),
    runner: STARTERS[0],
    xp: {},             // collectible id -> experience
    coins: 0,
    trackRuns: {},      // track id -> races completed
    opened: {},         // track id -> true once it has ever been unlocked
    force: {},          // parent override: track id -> true/false
    autoUnlock: true,
    qCount: 20,
    speedMode: "normal",// slow | normal | fast (fast answer threshold)
    curriculum: null,   // curriculum id, or null for the adaptive default
    chapter: null,      // chapter number inside that curriculum
    chapterMode: "soft",// soft keeps spaced review, hard drills the chapter only
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

/* Crossing the ten is not one skill but five, and they are not equally
   hard. Making ten from a nine is the easiest bridge and gets taught
   first, then eight, then seven, then the rest. The order is lifted from
   Matyskova matematika part four, which devotes a whole chapter to each,
   and it applies whether or not a curriculum is selected: a child new to
   the track meets sums below ten before anything crosses it.
   A fact belongs to the stage of its larger addend, which is the chapter
   where the book first teaches it.
   Ahead of all the bridges sits the whole of the first grade: the teens
   with the ten parked in front and nothing crossing it. It is easier
   than any bridge and the books teach it a year earlier, so it is the
   second stage, not the last. */
const E_STAGES = [
  // adding to a whole ten never needs regrouping, so it belongs with the easy ones
  {id:"e1", has:(a,b) => Math.max(a,b) <= 10 && !crossesTen(a,b)},
  {id:"e2", has:(a,b) => Math.max(a,b) > 10  && !crossesTen(a,b)},
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

/* Telling the time is not one skill either. The book adds precision one
   step at a time and returns to it every few chapters all through the
   second grade, so the buckets are exclusive: each one holds only the
   minute positions it introduces, and everything earlier comes back as
   review through the Leitner box, exactly like the bridges over ten.
   The last bucket is the afternoon reading, which is where a quarter to
   eight becomes 19:45. The sun or moon drawn beside the dial says which
   half of the day is meant, so one dial still has one answer. */
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

const TRACKS = [
  {id:"t1",   op:"mult",  tables:[1,2,5,10],              env:"meadow"},
  {id:"t2",   op:"mult",  tables:[3,4],                   env:"forest"},
  {id:"t3",   op:"mult",  tables:[6,7],                   env:"canyon"},
  {id:"t4",   op:"mult",  tables:[8,9],                   env:"peaks"},
  {id:"t5",   op:"mult",  tables:[1,2,3,4,5,6,7,8,9,10],  env:"city"},
  {id:"d1",   op:"div",                                   env:"space"},
  {id:"a20",  op:"as20",                                  env:"beach"},
  {id:"a100", op:"as100",                                 env:"ocean"},
  {id:"clock",op:"clock",                                 env:"clocktown"},
  {id:"mix",  op:"mix",                                   env:"night"},
  {id:"weak", op:"weak",                                  env:"storm"},
  {id:"school", op:"school",                              env:"school"}
];
const trackById = id => TRACKS.find(x => x.id === id);

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
  if(spec.clock) out.push(...spec.clock);
  return [...new Set(out)];
}
/* A chapter is offered only when the game can actually generate it.
   Chapters whose topic has no generator yet stay visible in the list so
   the parent sees the whole book, but they cannot be picked, because a
   setting that quietly does nothing reads as broken. */
function playableChapters(cur){
  return cur ? cur.chapters.filter(ch => poolSize(poolKeys(ch.pool)) >= 4) : [];
}
function isPlayable(ch){ return !!ch && poolSize(poolKeys(ch.pool)) >= 4; }
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
const FAMILY_HEADS = "pnc";
const isFamilyKey = k => FAMILY_HEADS.includes(k[0]);
function poolSize(keys){
  let n = 0;
  for(const k of keys) n += isFamilyKey(k) ? 4 : 1;
  return n;
}
function schoolReady(p){ return isPlayable(chapterOf(p)); }
function visibleTracks(p){
  const rest = TRACKS.filter(tr => tr.op !== "school");
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
  if(tr.op === "as20") return ADD.map(f => ak(f.a,f.b)).concat(ADD.map(f => sk(f.a,f.b)));
  if(tr.op === "as100")return H_BUCKETS.map(b => "p"+b.id).concat(H_BUCKETS.map(b => "n"+b.id));
  if(tr.op === "clock") return clockKeys();
  return [];
}
/* Which bridge the child is currently building. The first stage that is
   not yet at the unlock threshold, so mastered stages drop back to being
   review rather than filling the race. */
function as20Stage(p){
  for(let i = 0; i < E_STAGES.length; i++){
    if(mastery(p, stageKeys(i)) < .7) return i;
  }
  return E_STAGES.length - 1;
}
/* Same idea for the clock: the first level of precision not yet at the
   threshold carries the race, so a child who has only ever seen whole
   hours is not shown 17:23 on the first lap. */
function clockStage(p){
  for(let i = 0; i < C_BUCKETS.length; i++){
    if(mastery(p, [C_BUCKETS[i].id]) < .7) return i;
  }
  return C_BUCKETS.length - 1;
}
/* What a track would actually serve right now. A staged track holds
   back the levels the child has not reached yet, and the championship
   has to respect that, otherwise it hands out material that the track
   itself would refuse to. */
function reachedKeys(p, tr){
  if(tr.op === "as20"){
    const out = [];
    for(let i = 0; i <= as20Stage(p); i++) out.push(...stageKeys(i));
    return out;
  }
  if(tr.op === "clock") return C_BUCKETS.slice(0, clockStage(p) + 1).map(b => b.id);
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
  switch(tr.id){
    // telling the time does not build on any of the arithmetic, so it
    // never waits for it
    case "t1": case "a20": case "clock": case "school": return {open:true};
    case "t2": return (m("t1") >= .7 || many("t1")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_t1"))};
    case "t3": return (m("t2") >= .7 || many("t2")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_t2"))};
    case "t4": return (m("t3") >= .7 || many("t3")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_t3"))};
    case "t5": return (m("t4") >= .65 || many("t4")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_t4"))};
    case "d1": return mastery(p, MULT.map(f => mk(f.a,f.b))) >= .55
                 ? {open:true} : {open:false, why: t("lockHalfTable")};
    case "a100": return (m("a20") >= .6 || many("a20")) ? {open:true} : {open:false, why: t("lockFinish", t("trk_a20"))};
    case "mix":  return (unlockState(p, trackById("t5")).open)
                 ? {open:true} : {open:false, why: t("lockOpen", t("trk_t5"))};
    case "weak": return Object.keys(p.facts).length >= 15
                 ? {open:true} : {open:false, why: t("lockRaceFirst")};
  }
  return {open:true};
}

/* --- build one question from a fact key --- */
function itemFromKey(key){
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

/* The answer is the time as a digital watch shows it, typed on the same
   keypad as everything else: 7:45 is keyed 745 and 19:45 is keyed 1945,
   so hour times a hundred plus minutes is a single whole number and
   nothing about scoring, records or the Leitner box has to change. */
function clockItem(key){
  const b = C_BUCKETS.find(x => x.id === key) || C_BUCKETS[0];
  const m = b.mins ? b.mins[ri(0, b.mins.length - 1)] : ri(1, 59);
  const face = b.pm ? ri(1, 11) : ri(1, 12);      // midnight and noon stay out of the 24 hour bucket
  const h = b.pm ? face + 12 : face;
  return {
    key, kind:"clock", text:"", night: !!b.pm,
    svg: clockSVG(face, m, !!b.pm),
    answer: h * 100 + m,
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
function buildRun(p, tr){
  const n = p.qCount || 20;
  let keys;
  if(tr.op === "school"){
    // The chapter sets the focus. In the soft mode the rest of the race
    // still comes from earlier chapters through the Leitner box, because
    // dropping spaced review would break the strongest part of the design.
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
      const review = [...new Set(earlier)].filter(k => !focus.includes(k));
      const nf = review.length ? Math.round(n * .7) : n;
      keys = sampleKeys(p, focus, nf, 6).concat(review.length ? sampleKeys(p, review, n - nf, 0) : []);
    }
  } else if(tr.op === "mult"){
    const focus = multFactsFor(tr.tables).map(f => mk(f.a,f.b));
    const earlier = [];
    for(const prev of TRACKS){
      if(prev.id === tr.id) break;
      if(prev.op === "mult") earlier.push(...multFactsFor(prev.tables).map(f => mk(f.a,f.b)));
    }
    const review = [...new Set(earlier)].filter(k => !focus.includes(k));
    const nf = review.length ? Math.round(n * .7) : n;
    keys = sampleKeys(p, focus, nf, 5).concat(review.length ? sampleKeys(p, review, n - nf, 0) : []);
  } else if(tr.op === "div"){
    const all = MULT.filter(f => f.a > 1).map(f => dk(f.a,f.b));
    keys = sampleKeys(p, all, n, 5);
  } else if(tr.op === "as20"){
    // same shape as the multiplication tracks: the current bridge carries
    // the race, everything already crossed comes back as review
    const si = as20Stage(p);
    const focus = stageKeys(si);
    const review = [];
    for(let i = 0; i < si; i++) review.push(...stageKeys(i));
    const nf = review.length ? Math.round(n * .7) : n;
    keys = sampleKeys(p, focus, nf, 5).concat(review.length ? sampleKeys(p, review, n - nf, 0) : []);
  } else if(tr.op === "as100"){
    const all = H_BUCKETS.map(b => "p"+b.id).concat(H_BUCKETS.map(b => "n"+b.id));
    keys = sampleKeys(p, all, n, 10);
  } else if(tr.op === "clock"){
    // same shape again: the precision being learned carries the race,
    // everything coarser comes back as review
    const ci = clockStage(p);
    const focus = [C_BUCKETS[ci].id];
    const review = C_BUCKETS.slice(0, ci).map(b => b.id);
    const nf = review.length ? Math.round(n * .7) : n;
    keys = sampleKeys(p, focus, nf, 1).concat(review.length ? sampleKeys(p, review, n - nf, 0) : []);
  } else if(tr.op === "mix"){
    const all = [];
    for(const other of TRACKS){
      if(other.op === "mix" || other.op === "weak") continue;
      if(unlockState(p, other).open) all.push(...reachedKeys(p, other));
    }
    keys = sampleKeys(p, [...new Set(all)], n, 3);
  } else { // weak
    const seen = Object.keys(p.facts).filter(k => p.facts[k].reps > 0);
    seen.sort((x,y) => (p.facts[x].lv - p.facts[y].lv) || (p.facts[y].bad - p.facts[x].bad));
    const worst = seen.slice(0, Math.max(8, Math.round(seen.length * .35)));
    keys = sampleKeys(p, worst.length ? worst : seen, n, 0);
  }
  if(!keys || !keys.length) keys = sampleKeys(p, multFactsFor([1,2,5,10]).map(f => mk(f.a,f.b)), n, 5);
  // shuffle, but never leave the same fact twice in a row
  for(let i = keys.length-1; i > 0; i--){ const j = ri(0,i); [keys[i],keys[j]] = [keys[j],keys[i]]; }
  for(let i = 1; i < keys.length; i++){
    if(keys[i] === keys[i-1] && i+1 < keys.length){ [keys[i],keys[i+1]] = [keys[i+1],keys[i]]; }
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

/* --- record one answer into the Leitner box --- */
const SPEED = { slow:{fast:5200, super:3000}, normal:{fast:3800, super:2100}, fast:{fast:2800, super:1500} };
function thresholds(p, item){
  const s = SPEED[p.speedMode || "normal"];
  // reading a dial takes longer than recalling a fact, and the four
  // digits of a time take longer to key in than one or two
  const slower = item.kind === "clock" ? 2.4
               : (item.kind === "add100" || item.kind === "sub100") ? 1.9 : 1;
  return { fast: s.fast * slower, super: s.super * slower };
}
function record(p, item, correct, ms){
  const f = p.facts[item.key] || (p.facts[item.key] = {lv:0, reps:0, ok:0, bad:0, best:null, seen:0});
  f.reps++; f.seen = Date.now();
  p.totalAns++; p.msSum += Math.min(ms, 20000); p.msN++;
  if(correct){
    f.ok++; p.totalOk++;
    if(f.best === null || ms < f.best) f.best = ms;
    const th = thresholds(p, item);
    if(ms <= th.fast) f.lv = Math.min(5, f.lv + 1);
    else if(f.lv < 3)  f.lv = f.lv + 1;
  } else {
    f.bad++;
    f.lv = f.lv >= 3 ? 1 : Math.max(0, f.lv - 1);
  }
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
  return it.kind ? rideSVG(it) : petSVG(it, stageOf(p, id));
}

/* --- track environments --- */
const ENVS = {
  meadow:{hill1:"#8fd88a", hill2:"#63b862", dec:"#3d9b57", dec2:"#2c7c42"},
  forest:{hill1:"#5fa96b", hill2:"#37804d", dec:"#225936", dec2:"#164227"},
  canyon:{hill1:"#e08a5b", hill2:"#bd6440", dec:"#8c4224", dec2:"#67311a"},
  peaks:{ hill1:"#a8bde0", hill2:"#7a93bb", dec:"#51658c", dec2:"#3b4d6d"},
  city:{  hill1:"#8f7fd0", hill2:"#6455ac", dec:"#3d3280", dec2:"#2a2260"},
  space:{ hill1:"#3a3577", hill2:"#221d4a", dec:"#4a4290", dec2:"#332d68"},
  beach:{ hill1:"#ffe0a3", hill2:"#f2c274", dec:"#3fa8b8", dec2:"#d49a44"},
  ocean:{ hill1:"#3f9fc4", hill2:"#256d8c", dec:"#19566f", dec2:"#0f3f52"},
  night:{ hill1:"#33406e", hill2:"#1e2848", dec:"#3d4b7d", dec2:"#2a3560"},
  storm:{ hill1:"#5c6790", hill2:"#3d456b", dec:"#313a5f", dec2:"#222a49"},
  school:{hill1:"#7fd4c2", hill2:"#46a894", dec:"#2d7f6d", dec2:"#1d5c4e"},
  clocktown:{hill1:"#f6c9d8", hill2:"#d992ad", dec:"#a85f81", dec2:"#7c4460"}
};
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

const circuitCache = {};
function circuit(id){
  if(circuitCache[id]) return circuitCache[id];
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
  // Catmull-Rom spline converted to cubic Beziers, closed loop
  const segs = [];
  let d = "M " + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1);
  for(let i = 0; i < n; i++){
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = {x: p1.x + (p2.x - p0.x)/6.6, y: p1.y + (p2.y - p0.y)/6.6};
    const c2 = {x: p2.x - (p3.x - p1.x)/6.6, y: p2.y - (p3.y - p1.y)/6.6};
    segs.push({p0: p1, c1, c2, p1: p2});
    d += " C " + c1.x.toFixed(1) + " " + c1.y.toFixed(1) + ", " + c2.x.toFixed(1) + " " + c2.y.toFixed(1)
       + ", " + p2.x.toFixed(1) + " " + p2.y.toFixed(1);
  }
  d += " Z";
  // sample into a polyline to get length and car positions
  const samples = []; let total = 0;
  for(const s of segs){
    for(let j = 0; j < 36; j++){
      const pt = bezPt(s.p0, s.c1, s.c2, s.p1, j / 36);
      if(samples.length){
        const q = samples[samples.length - 1];
        total += Math.hypot(pt.x - q.x, pt.y - q.y);
      }
      samples.push({x: pt.x, y: pt.y, d: total});
    }
  }
  const first = samples[0];
  total += Math.hypot(first.x - samples[samples.length-1].x, first.y - samples[samples.length-1].y);
  samples.push({x: first.x, y: first.y, d: total});

  const c = {d, samples, total, rnd: seedRand("dekor-" + id)};
  circuitCache[id] = c;
  return c;
}
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

/* --- render the circuit scene --- */
function circuitSVG(env, id){
  const e = ENVS[env] || ENVS.meadow;
  const c = circuit(id);
  const dark = ["space","night","storm","city"].includes(env);
  const rnd = seedRand("dek2-" + id);

  // scenery only outside the tarmac: the border band and the middle of the loop
  let deco = "";
  const inside = (x, y) => Math.hypot((x - VW/2) / 58, (y - VH/2) / 24) < 1;
  const outside = (x, y) => x < 34 || x > VW - 34 || y < 22 || y > VH - 22;
  for(let i = 0; i < 46; i++){
    const x = rnd() * VW, y = rnd() * VH;
    if(!inside(x, y) && !outside(x, y)) continue;
    const s = 0.7 + rnd() * 0.7;
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

  // start/finish line plus the quarter markers
  const fin = atU(c, 0);
  let checks = `<g transform="translate(${fin.x.toFixed(1)} ${fin.y.toFixed(1)}) rotate(${fin.ang.toFixed(1)})">
    <rect x="-4" y="-15" width="8" height="30" rx="1.5" fill="#fff"/>`;
  for(let r = 0; r < 6; r++) for(let col = 0; col < 2; col++){
    if((r + col) % 2) checks += `<rect x="${-4 + col*4}" y="${-15 + r*5}" width="4" height="5" fill="#1b2436"/>`;
  }
  checks += `</g>`;
  let marks = "";
  [0.25, 0.5, 0.75].forEach((u, i) => {
    const m = atU(c, u);
    marks += `<g class="ck" data-ck="${i}" transform="translate(${m.x.toFixed(1)} ${m.y.toFixed(1)}) rotate(${m.ang.toFixed(1)})">
      <rect x="-2" y="-27" width="4" height="9" rx="2" fill="#ffffff" opacity=".7"/>
      <rect x="-2" y="18" width="4" height="9" rx="2" fill="#ffffff" opacity=".7"/></g>`;
  });

  const groundA = dark ? "#131c36" : e.hill1;
  const groundB = dark ? "#0d1428" : e.hill2;
  return `<svg id="circuit" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="grd_${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${groundA}"/><stop offset="1" stop-color="${groundB}"/>
      </linearGradient>
      <linearGradient id="trl_${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#4fc3ff"/><stop offset="1" stop-color="#34e39b"/>
      </linearGradient>
    </defs>
    <rect width="${VW}" height="${VH}" fill="url(#grd_${id})"/>
    ${deco}
    <path d="${c.d}" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="36" stroke-linejoin="round"/>
    <path d="${c.d}" fill="none" stroke="#f4f6fb" stroke-width="33" stroke-linejoin="round"/>
    <path d="${c.d}" fill="none" stroke="#e0556f" stroke-width="33" stroke-linejoin="round"
          stroke-dasharray="9 9" opacity=".85"/>
    <path d="${c.d}" fill="none" stroke="#2b3550" stroke-width="26" stroke-linejoin="round"/>
    <path id="trail" d="${c.d}" fill="none" stroke="url(#trl_${id})" stroke-width="26"
          stroke-linejoin="round" stroke-linecap="butt"
          stroke-dasharray="${c.total.toFixed(1)}" stroke-dashoffset="${c.total.toFixed(1)}"/>
    <path d="${c.d}" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-dasharray="7 11" opacity=".45"/>
    ${marks}${checks}
  </svg>`;
}

/* --- circuit thumbnail for the map, the coloured part shows mastery --- */
function circuitThumb(env, id, prog){
  const e = ENVS[env] || ENVS.meadow;
  const c = circuit(id);
  const dark = ["space","night","storm","city"].includes(env);
  const a = dark ? "#1a2440" : e.hill1, b = dark ? "#0f1730" : e.hill2;
  const off = (c.total * (1 - Math.max(0, Math.min(1, prog || 0)))).toFixed(1);
  return `<svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="tg_${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      <linearGradient id="tt_${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#4fc3ff"/><stop offset="1" stop-color="#34e39b"/></linearGradient>
    </defs>
    <rect width="${VW}" height="${VH}" fill="url(#tg_${id})"/>
    <path d="${c.d}" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="40" stroke-linejoin="round"/>
    <path d="${c.d}" fill="none" stroke="#2b3550" stroke-width="30" stroke-linejoin="round"/>
    <path d="${c.d}" fill="none" stroke="url(#tt_${id})" stroke-width="30" stroke-linejoin="round"
          stroke-dasharray="${c.total.toFixed(1)}" stroke-dashoffset="${off}"/>
  </svg>`;
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
    view.name === "gate"       ? viewGate() :
    view.name === "parent"     ? viewParent(p) : viewPlayers();
  app.innerHTML = html;
  if(view.name === "game") mountGame();
  if(view.name === "result") mountResult();
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
  return `<div class="scr">
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

/* ---------- track map ---------- */
function medalEmoji(m){ return ["", "&#129353;", "&#129352;", "&#129351;"][m] || ""; }
function viewMap(p){
  const cards = visibleTracks(p).map(tr => {
    const u = unlockState(p, tr);
    const pr = Math.round(trackProgress(p, tr) * 100);
    const med = p.done[tr.id] || 0;
    if(!u.open){
      return `<div class="track locked">
        <span class="thumb">${circuitThumb(tr.env, tr.id, 0)}</span>
        <span class="body">
          <span class="nm">${trackName(p, tr)}</span>
          <span class="sub">${trackSub(p, tr)}</span>
          <span class="lockmsg">&#128274; ${u.why}</span>
        </span></div>`;
    }
    return `<button class="track" data-act="play" data-id="${tr.id}">
      <span class="thumb">${circuitThumb(tr.env, tr.id, trackProgress(p, tr))}</span>
      <span class="body">
        <span class="nm">${trackName(p, tr)}</span>
        <span class="sub">${trackSub(p, tr)}</span>
        ${(tr.op === "mix" || tr.op === "weak") ? "" : `<span class="bar"><i style="width:${pr}%"></i></span>`}
      </span>
      <span class="medal">${medalEmoji(med)}</span>
    </button>`;
  }).join("");

  return `<div class="scr">
    <div class="topbar">
      <button class="iconbtn" data-act="players" aria-label="${t("changePlayer")}">&#8592;</button>
      <h1>${esc(p.name)}</h1>
      <button class="iconbtn" data-act="sound" aria-label="${t("soundOn")}">${DB.sound ? "&#128266;" : "&#128263;"}</button>
      <button class="iconbtn" data-act="gate" aria-label="${t("parentArea")}">&#9881;</button>
    </div>
    <div class="scr-scroll">
      <div class="hud">
        <span class="chip warm"><span class="em">&#129689;</span> ${p.coins}</span>
        <span class="chip fire"><span class="em">&#128293;</span> ${p.streak} ${p.streak === 1 ? t("day") : t("days")}</span>
        <button class="chip" data-act="collection" style="margin-left:auto"><span class="em">&#127873;</span> ${t("collection")}</button>
      </div>
      <div class="tracks">${cards}</div>
    </div>
  </div>`;
}

/* ---------- race screen ---------- */
let RUN = null;
function startRun(p, trackId){
  const tr = trackById(trackId);
  const n = p.qCount || 20;
  RUN = {
    t: tr, items: buildRun(p, tr), n0: n, idx: 0, answered: 0, prog: 0, dist: 0, hist: [],
    typed: "", state: "ask", t0: 0, wrongKeys: [],
    okCount: 0, marks: [], coins: 0, retries: 0,
    // the score is normalised to a 100 point scale whatever the race length
    mult: 20 / n
  };
  go("game");
}
const TARGET = 100;

/* A question is either a line of arithmetic or a picture to read. The
   equals sign belongs only to the first kind, so the whole question row
   is rebuilt between questions rather than patched. */
function questionHTML(item){
  if(!item) return `<span id="qtext"></span><span class="answerbox" id="abox">?</span>`;
  if(item.svg) return `<span id="qtext" class="qsvg">${item.svg}</span><span class="answerbox" id="abox">?</span>`;
  return `<span id="qtext">${item.text}</span><span>=</span><span class="answerbox" id="abox">?</span>`;
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
      ${circuitSVG(tr.env, tr.id)}
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
      <div class="question" id="qbox">${questionHTML(RUN.items[RUN.idx])}</div>
      <div class="hintline" id="hint">${askText(RUN.items[RUN.idx])}</div>
    </div>
    <div class="pad3">
      ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="key" data-k="${n}">${n}</button>`).join("")}
      <button class="key del" data-k="del" aria-label="${t("clear")}">&#9003;</button>
      <button class="key" data-k="0">0</button>
      <button class="key act" data-k="ok">OK</button>
    </div>
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
  const c = circuit(RUN.t.id);
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
  const c = circuit(RUN.t.id), tr = document.getElementById("trail");
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
  return item.text + " = " + item.answer;
}
/* The two mistakes a child actually makes on a dial are reading the hour
   hand one hour ahead once it has passed the half, and reading the hands
   the wrong way round. Naming the mistake beats repeating the answer. */
function missHint(item, val){
  if(item.kind === "clock" && !isNaN(val)){
    const gh = Math.floor(val / 100), gm = val % 100, h = Math.floor(item.answer / 100), m = item.answer % 100;
    if(gm === m && (gh - h === 1 || h - gh === 1)) return t("clockMissHour");
    if(gh === m && gm === h) return t("clockMissSwap");
  }
  return t("wrongHint");
}

function submit(){
  const p = P(), item = RUN.items[RUN.idx];
  const ms = Date.now() - RUN.t0;
  const val = parseInt(RUN.typed, 10);
  const correct = val === item.answer;
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
  if(!isRetry) record(p, item, correct, ms);

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
    hint.innerHTML = `<b>${rightAnswerText(item)}</b><br>${missHint(item, val)}`;
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
    const qb = document.getElementById("qbox");
    if(!qb) return;
    // the row is rebuilt because the next question may be a different
    // shape, so the answer box has to be looked up again
    qb.innerHTML = questionHTML(RUN.items[RUN.idx]);
    hint.innerHTML = askText(RUN.items[RUN.idx]);
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

  const evoHtml = RUN.evolved ? `
    <div class="newthing">
      <span class="pic">${itemSVG(p, p.runner)}</span>
      <span><b style="font-family:var(--font-display);font-size:17px">${t("grewTitle", nameOf(p.runner))}</b>
      <div class="muted">${t("grewSub")}</div></span>
    </div>` : "";

  return `<div class="scr">
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
    </div>
  </div>`;
}

/* ---------- parent code ---------- */
function hashPin(s){
  let h = 5381;
  for(let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return "h" + h.toString(36);
}
function viewSetPin(){
  const change = !!DB.pin;
  return `<div class="scr">
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
  return `<div class="scr">
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
function viewParent(p){
  let heat = `<span class="heat hdr"></span>`;
  for(let b = 1; b <= 10; b++) heat += `<span class="heat hdr">${b}</span>`;
  for(let a = 1; a <= 10; a++){
    heat += `<span class="heat hdr">${a}</span>`;
    for(let b = 1; b <= 10; b++){
      const k = a <= b ? mk(a,b) : mk(b,a);
      const f = p.facts[k];
      const has = !!(f && f.reps);
      const tip = a + " × " + b + " = " + (a*b) + (has ? " · " + f.lv + "/5 · " + f.ok + "/" + f.reps : " · " + t("legendNew"));
      heat += `<span style="background:${heatColor(f ? f.lv : 0, has)}" title="${tip}">${has ? f.lv : ""}</span>`;
    }
  }
  const avg = p.msN ? (p.msSum / p.msN / 1000) : 0;
  const accAll = p.totalAns ? Math.round(p.totalOk / p.totalAns * 100) : 0;
  const mAll = Math.round(mastery(p, MULT.map(f => mk(f.a,f.b))) * 100);

  const toggles = TRACKS.filter(tr => tr.op !== "school").map(tr => {
    const st = p.force[tr.id];
    const auto = unlockState(Object.assign({}, p, {force:{}}), tr);
    const on = st === true || (st === undefined && auto.open);
    return `<div class="row">
      <span class="lab"><b>${t("trk_" + tr.id)}</b><span>${t("trk_" + tr.id + "s")}${st === undefined ? t("autoSuffix") : t("manualSuffix")}</span></span>
      <button class="sw ${on ? "on" : ""}" data-act="force" data-id="${tr.id}" role="switch" aria-checked="${on}"><i></i></button>
    </div>`;
  }).join("");

  return `<div class="scr">
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
        <div class="heatwrap"><div class="heat">${heat}</div></div>
        <div class="legend">
          <span><i style="background:#dfe6f7"></i>${t("legendNew")}</span>
          <span><i style="background:#f2557f"></i>${t("legendBad")}</span>
          <span><i style="background:#ffb020"></i>${t("legendSlow")}</span>
          <span><i style="background:#8bd94f"></i>${t("legendOk")}</span>
          <span><i style="background:#12b36a"></i>${t("legendAuto")}</span>
        </div>
        <div class="muted" style="margin-top:10px">
          ${t("heatNote", num(SPEED[p.speedMode || "normal"].fast / 1000, 1))}
        </div>
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
  const el = e.target.closest("[data-act]");
  if(!el) return;
  const act = el.dataset.act, id = el.dataset.id, p = P();

  if(act === "newplayer"){
    const d = sheet(`<h3>${t("namePrompt")}</h3>
      <div class="muted" style="margin-top:4px">${t("nameNote")}</div>
      <input class="field" id="nm" maxlength="14" placeholder="${t("namePlaceholder")}" style="margin:14px 0 16px">
      <button class="btn wide" data-go>${t("nameGo")}</button>`);
    const inp = d.querySelector("#nm");
    setTimeout(() => inp.focus(), 60);
    const create = () => {
      const nm = (inp.value || t("defaultName")).trim().slice(0, 14) || t("defaultName");
      const np = newProfile(nm);
      DB.profiles.push(np); DB.current = np.id; save(); d.remove(); go("map");
    };
    d.querySelector("[data-go]").onclick = create;
    inp.onkeydown = ev => { if(ev.key === "Enter") create(); };
    return;
  }
  if(act === "pick"){ DB.current = id; save(); go("map"); return; }
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

  if(act === "play"){
    const owned = ALL_ITEMS.filter(it => p.owned.includes(it.id));
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

  if(act === "use"){ p.runner = id; save(); render(); return; }
  if(act === "buy"){
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
      const nm = DB.profiles[i].name;
      const np = newProfile(nm); np.id = DB.current;
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

window.addEventListener("resize", () => {
  if(view.name !== "game") return;
  placeCar(document.getElementById("mycar"), anim.shown, 0);
  placeCar(document.getElementById("rivalcar"), anim.ghostShown, -13);
});

/* boot */
load();
save();
if(!DB.pin) go("setpin");
else if(DB.current && P()) go("map");
else go("players");
