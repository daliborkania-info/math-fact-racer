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
const appjs = fs.readFileSync(path.join(ROOT, 'src/app.js'), 'utf8');
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
// nejen ze pravidlo existuje, ale ze v nem opravdu stoji mrizka a v ni
// ctyri oblasti, ze kterych je zavod na sirku slozeny
const wideGame = forSel('html[data-o="wide"] .game');
const areas = wideGame.length === 1 ? (wideGame[0].body.match(/grid-template-areas\s*:\s*([^;}]+)/) || [])[1] || '' : '';
ok('zavod na sirku ma vlastni mrizku',
   wideGame.length === 1 && /display\s*:\s*grid/.test(wideGame[0].body)
   && /grid-template-columns\s*:/.test(wideGame[0].body)
   && ['stage', 'qzone', 'keypad', 'rail'].every(a => areas.indexOf(a) >= 0),
   areas.replace(/\s+/g, ' ').trim() || 'zadne oblasti');
// rozvrzeni ciselne klavesnice patri na .keypad-pad, ne na .keypad:
// .keypad je odpovidaci plocha, .keypad-pad je tahle jedna jeji podoba
const wideKeypad = forSel('html[data-o="wide"] .keypad');
ok('rady klaves visi na .keypad-pad, ne na odpovidaci plose',
   wideKeypad.every(r => !/grid-template-rows/.test(r.body))
   && forSel('html[data-o="wide"] .keypad-pad').some(r => /grid-template-rows/.test(r.body)));
// podlaha klavesy roste s pismem na ni i na sirku (C4 proti C1)
ok('klavesa ma i na sirku podlahu podle rocniku',
   forSel('html[data-o="wide"] .key').some(r => /min-height\s*:\s*calc\([^)]*var\(--tx\)/.test(r.body)),
   (forSel('html[data-o="wide"] .key')[0] || {body: 'chybi'}).body.trim());
// co se nevejde, to se roluje: otazka je ta cast zavodu, ktera ustupuje
ok('otazka se pri nedostatku mista roluje',
   forSel('.qzone').some(r => /overflow-y\s*:\s*auto/.test(r.body)));
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
// the fifth year is written down before it exists: switching it on in
// step G must not drop a nine year old's type back to the parent size
const GRADES = [1, 2, 3, 4, 5];
for(const g of GRADES){
  const r = forSel('html[data-grade="' + g + '"]');
  ok('rocnik ' + g + ' ma sve meritko', r.length === 1 && /--tx\s*:\s*[\d.]+/.test(r[0].body),
     r.length ? r[0].body.trim() : 'chybi');
}
// the whole tuning knob is those lines and nowhere else: a scale written
// into a single rule would be the one nobody finds later
const txDefs = RULES.filter(r => /--tx\s*:/.test(r.body));
ok('meritka stoji na jednom miste',
   txDefs.length === GRADES.length + 1 && txDefs.every(r => /^html/.test(r.sel)),
   txDefs.map(r => r.sel).join(' / '));
/* app.js carries the same table as TX_BY_GRADE, because the map has to
   know how tall a card is before it is drawn and a custom property
   cannot be read without a layout. Two copies of one truth are only
   safe while something checks they still say the same thing. */
const txJs = {};
{
  const m = /const TX_BY_GRADE = \{([^}]*)\}/.exec(appjs);
  if(m) for(const p of m[1].split(',')){
    const kv = /"(\d)"\s*:\s*([\d.]+)/.exec(p);
    if(kv) txJs[kv[1]] = parseFloat(kv[2]);
  }
}
const rozpor = GRADES.filter(g => {
  const r = forSel('html[data-grade="' + g + '"]');
  const inCss = r.length ? parseFloat(/--tx\s*:\s*([\d.]+)/.exec(r[0].body)[1]) : null;
  return txJs[g] !== inCss;
});
ok('tabulka meritek v app.js se shoduje s CSS', rozpor.length === 0 && Object.keys(txJs).length === GRADES.length,
   rozpor.length ? 'rozchazi se rocnik ' + rozpor.join(', ') : JSON.stringify(txJs));

/* Every font-size in the stylesheet, not a list written down by hand: a
   hand written list never sees the rule that is added tomorrow, which is
   exactly how .item .lvl kept its 10 px and .rail .lap its 11. So the
   sweep goes the other way round -- everything multiplies --tx unless it
   is on one of the two lists below.

   Read by a grown-up, or before any child is picked: the player picker
   is in PARENT_VIEWS, so --tx is 1 on it whatever is written there. */
const PARENT_TEXT = ['.muted', '.pinin', '.heat span', '.heat .hdr', '.heat.strip b', '.legend',
  '.row .lab b', '.row .lab span', '.seg button', 'textarea',
  '.hero h1', '.hero p', '.player .nm', '.player .sub', '.player .del'];
/* Not a line of text but a glyph in a box of its own: an icon, an emoji,
   the tick and the rubber on the keypad (step C4 leaves those two out on
   purpose, the box does not grow with them). */
const GLYPH = ['.iconbtn', '.chip .em', '.gamebar .quit', '.peekthumb', '.backthumb', '.shopthumb',
  '.job .jobpic', '.medal', '.key.act', '.key.del'];
const VYJIMKY = PARENT_TEXT.concat(GLYPH);
const bez = [], male = [];
for(const r of RULES){
  const sizes = (r.body.match(/font-size\s*:\s*[^;}]+/g) || []).map(s => s.split(':').slice(1).join(':').trim());
  if(!sizes.length) continue;
  const parts = r.sel.split(',').map(s => s.trim().replace(/\s+/g, ' '));
  for(const v of sizes){
    if(v.indexOf('var(--tx)') < 0){
      if(!parts.every(p => VYJIMKY.indexOf(p) >= 0)) bez.push(r.sel.trim() + ': ' + v);
      continue;
    }
    for(const m of v.match(/([\d.]+)px/g) || []){
      if(parseFloat(m) < 12.5) male.push(r.sel.trim() + ': ' + m);
    }
  }
}
ok('kazda velikost pisma bud roste s rocnikem, nebo je na seznamu vyjimek',
   bez.length === 0, bez.join(' | ') || VYJIMKY.length + ' vyjimek, zbytek nasobi --tx');
ok('zadny detsky text nema zaklad pod 12,5 px', male.length === 0, male.join(' | ') || 'nejmensi zaklad 12,5');
// nepouzita vyjimka je vyjimka, ktera uz nic nekryje
const mrtve = VYJIMKY.filter(sel => !RULES.some(r =>
  r.sel.split(',').map(s => s.trim().replace(/\s+/g, ' ')).indexOf(sel) >= 0 && /font-size/.test(r.body)));
ok('seznam vyjimek nema mrtve radky', mrtve.length === 0, mrtve.join(' | ') || 'vsechny plati');

/* --ink-faint is about 2.6 : 1 on the shell, which is a contrast for a
   dot or a border and not for a line a child is meant to read. Again the
   sweep is the other way round: every rule that reaches for the faintest
   ink has to be one of these, not the three that were once fixed. */
const FAINT_OK = ['.tiny', '.player .del', '.heat .hdr'];
const faint = RULES.filter(r => /var\(--ink-faint\)/.test(r.body))
  .map(r => r.sel.trim())
  .filter(sel => sel.split(',').map(s => s.trim().replace(/\s+/g, ' ')).some(p => FAINT_OK.indexOf(p) < 0));
ok('nejsvetlejsi barva stoji jen tam, kde ji cte dospely nebo nikdo',
   faint.length === 0, faint.join(' | ') || FAINT_OK.join(', '));

console.log('\nhotovo');
