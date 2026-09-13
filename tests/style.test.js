/* Rules the stylesheet has to keep, checked as text.
 *
 * jsdom has no layout at all, so no test here or anywhere else can tell
 * whether the keypad fits under the question; that is looked at in a real
 * browser at the sizes listed in docs/PLAN.md, step C. What can be held
 * on to without a browser is the handful of rules those pictures were
 * paid for: the order of vh and dvh, a ceiling on the bottom sheet, the
 * manifest that lets a tablet turn at all, the two layout values on
 * <html>, and the type scale of step C4, where every child facing size
 * multiplies --tx and none of them starts below 12.5 px.
 *
 * Plain node, no jsdom and no build: it reads the sources. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(ROOT, 'src/styles.css'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'src/index.template.html'), 'utf8');
const manRaw = fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8');
const ok = (n, c, x) => console.log((c ? '  OK  ' : '  !!  ') + n + (x !== undefined ? '   [' + x + ']' : ''));

/* A stylesheet is not a regular language, so this is a brace counter
   rather than a regex: comments go first, then every {...} that is not an
   at-rule is collected as a selector and a body. Nested rules inside a
   media block come out as rules of their own, which is exactly what the
   checks below want. */
function rules(src){
  const out = [];
  const stack = [];
  let buf = '';
  for(const ch of src.replace(/\/\*[\s\S]*?\*\//g, '')){
    if(ch === '{'){ stack.push(buf.trim()); buf = ''; }
    else if(ch === '}'){ const sel = stack.pop(); if(sel && sel[0] !== '@') out.push({sel, body: buf}); buf = ''; }
    else buf += ch;
  }
  return out;
}
const RULES = rules(css);
const forSel = sel => RULES.filter(r => r.sel.split(',').map(s => s.trim().replace(/\s+/g, ' ')).indexOf(sel) >= 0);
const fontSizes = sel => forSel(sel).map(r => (r.body.match(/font-size\s*:\s*([^;}]+)/) || [])[1]).filter(Boolean);

console.log('--- rozvrzeni a spodni list ---');
// dvh is the right unit and vh is the one every browser knows, so vh has
// to stand first and dvh second; the other way round iOS Safari kept vh
// and hid the bottom row of the keypad under its own bar
const iVh = css.indexOf('min-height:100vh'), iDvh = css.indexOf('min-height:100dvh');
ok('#app ma vh pred dvh', iVh >= 0 && iDvh > iVh, iVh + ' < ' + iDvh);
const sheet = forSel('.sheet .inner');
ok('spodni list ma strop vysky', sheet.length === 1 && /max-height\s*:/.test(sheet[0].body));
const iMaxVh = css.indexOf('max-height:calc(100vh'), iMaxDvh = css.indexOf('max-height:calc(100dvh');
ok('i strop listu ma vh pred dvh', iMaxVh >= 0 && iMaxDvh > iMaxVh, iMaxVh + ' < ' + iMaxDvh);
ok('zavod na sirku ma vlastni mrizku', forSel('html[data-o="wide"] .game').length === 1);
ok('sirka aplikace se ridi orientaci', /html\[data-o="wide"\]\{--appw:none\}/.test(css));
// dead selectors from an older race screen: the car is .carwrap and the
// rival is .rivalcar, so a bare .runner or .ghost is a leftover
const dead = /(^|[\s,>+~])\.(runner|ghost)\b/m.exec(css);
ok('mrtve selektory se nevratily', !dead, dead ? dead[0].trim() : 'zadny');

console.log('--- manifest ---');
let man = null;
try{ man = JSON.parse(manRaw); }catch(e){ /* reported by the check below */ }
ok('manifest je platny JSON', !!man);
ok('manifest dovoli obe orientace', !!man && man.orientation === 'any', man && man.orientation);

console.log('--- kostra dokumentu ---');
ok('kostra ma vsechny ctyri znacky pro build',
   ['<<STYLES>>', '<<I18N>>', '<<CURRICULA>>', '<<APP>>'].every(m => tpl.indexOf(m) >= 0));
ok('kostra odkazuje manifest', /rel="manifest"/.test(tpl));
// the stylesheet counts on env(safe-area-inset-*), which stays zero
// without this, and the keypad would sit under the home bar
ok('kostra si rekne o plochu az k okrajum', /viewport-fit=cover/.test(tpl));

console.log('--- meritko pisma podle rocniku ---');
ok('zaklad meritka je jedna', /html\{--tx:1\}/.test(css));
for(const g of [1, 2, 3, 4]){
  const r = forSel('html[data-grade="' + g + '"]');
  ok('rocnik ' + g + ' ma sve meritko', r.length === 1 && /--tx\s*:\s*[\d.]+/.test(r[0].body),
     r.length ? r[0].body.trim() : 'chybi');
}
// the whole tuning knob is those five lines and nowhere else: a scale
// written into a single rule would be the one nobody finds later
const txDefs = RULES.filter(r => /--tx\s*:/.test(r.body));
ok('meritka stoji na jednom miste', txDefs.length === 5 && txDefs.every(r => /^html/.test(r.sel)),
   txDefs.map(r => r.sel).join(' / '));

/* Every size a child reads, from the table in docs/PLAN.md, step C4. The
   list is written down here rather than derived, because the point is to
   notice when a new rule joins the child's part of the game and does not
   scale with the year. */
const CHILD = ['.topbar h1', '.chip', '.btn', '.tiny', '.scr:not(.narrow) .muted',
  '.place .nm', '.place .sub', '.place .foot', '.place .tokc', '.place.locked .lockmsg',
  '.question', '.question.q-long', '.question.q-xlong', '.answerbox', '.key',
  '.hintline', '.hintline b',
  '.result h2', '.stat .v', '.stat .l', '.factchip', '.item .nm',
  '.h3', '.toknew', '.sheet h3', '.field', '.pickitem .nm', '.pickworld .nm', '.pickworld .sub',
  '.job .nm', '.job .sub', '.atschool', '.jobask', '.jobhint', '.jobhint b',
  '.counter-empty', '.counter-sum'];
const bez = [], male = [];
for(const sel of CHILD){
  const sizes = fontSizes(sel);
  if(!sizes.length){ bez.push(sel + ' (zadne font-size)'); continue; }
  for(const v of sizes){
    if(v.indexOf('var(--tx)') < 0){ bez.push(sel + ': ' + v.trim()); continue; }
    for(const m of v.match(/([\d.]+)px/g) || []){
      if(parseFloat(m) < 12.5) male.push(sel + ': ' + m);
    }
  }
}
ok('kazda detska velikost roste s rocnikem', bez.length === 0, bez.join(' | ') || CHILD.length + ' selektoru');
ok('zadny detsky text nema zaklad pod 12,5 px', male.length === 0, male.join(' | ') || 'nejmensi zaklad 12,5');
// --ink-faint is about 2.6 : 1 on the shell, which is a contrast for a
// dot or a border and not for a line a child is meant to read
const faint = ['.place .tokc', '.tokn', '.counter-empty']
  .filter(sel => forSel(sel).some(r => /--ink-faint/.test(r.body)));
ok('detsky text nestoji v nejsvetlejsi barve', faint.length === 0, faint.join(' | ') || 'tri drivejsi mista opravena');

console.log('\nhotovo');
