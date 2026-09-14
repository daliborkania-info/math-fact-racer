# Tests

Headless regression tests. Most of them load the built `index.html` into jsdom and
drive the real interface, so they catch broken rendering as well as broken logic;
`style.test.js` is the exception and reads the sources as text.

```bash
npm install jsdom      # the only dependency, not committed
cd ..
python3 build.py       # tests run against the built index.html
for f in tests/*.test.js; do echo "$f"; node "$f" | grep '  !!  '; done
```

| File | What it covers |
| --- | --- |
| `flow.test.js` | Whole game cycle: parent code, profile creation with the school year, racer picker, a race with mistakes, records, the map laid out as a world, the collection, garage purchase, parent section, textbook and chapter selection, a race driven by a chapter that asks for its material backwards, where the answer cannot be worked out from the question and is taken from the run itself, the workshop in both its jobs, world switching, the look ahead at next year, a second profile, where the workshop's parts go and when they stop going anywhere, which is the one place the label under the total changes meaning and so is checked on all four combinations of paints and duck parts as well as on what the child sees, and wiping progress, which keeps the school year and every parent setting and takes away only what was earned. It plays on a 375 x 812 phone, set in `beforeParse` because the layout is decided at boot; one check at the end deliberately switches the window to 1024 x 768 and waits for the map to move into four columns |
| `items.test.js` | Generates thousands of questions and verifies every answer by evaluating the printed expression; checks the clock dial against its own answer, race composition, sprite validity, curriculum consistency, both chapter modes, the first year's ranges and the bridges over ten, the clock and thousand stages, the unlock memory, the rules for which chapter can be picked, the collection, the workshop window, the four worlds and their route shapes, how far apart in Lab the palettes of one world stand, because two places painted nearly the same colour are invisible to every other check here and to a rendered picture as well unless the gradient is composed by hand, the school years, the chain of three numbers with the length of its question row, the order of operations, whose answer it works out itself under the precedence rule rather than through `eval`, since that rule is the thing under test, checking as it goes that no division leaves a remainder, that no step falls below zero and that most of the lines would come out differently read left to right, the round tens, where the product has to stay inside a thousand, a division may only be by a number the game has taught, and the longest question of that family is still `1000 : 100`, the unit conversions, where the pair of units and the direction are read back out of the printed question and both the number asked about and the answer have to stay whole and inside a thousand, the missing operand, which is not a family but the same fact asked backwards and so is checked on what a variant owes: that it accepts the hidden number and refuses either neighbour, that the line reads back as a sum that works out, that the key never changes, that `record()` writes under that same key so both shapes share one level, that the answer box is drawn in front of the line and the row is still measured as a row, that the families with nothing to hide come back untouched, and that no track but the school one ever produces it, the championship and the trouble spots included, that a counting task draws exactly as many parts as its answer, the duck's four dressing layers, where all fifty-five patterns, hats, eye pieces and pieces of gear are drawn and then read back out of the drawing: no part may leave the frame, no hat may sit on the eye, which is measured as a disc, or on the bill, which is measured as the wedge it is drawn as rather than the rectangle it fits in, every hat has to touch the head, the pattern has to lie under the eye and the bill and inside a clip pulled in from the edge, the space helmet has to be the only part that covers anything and has to cover it through glass, and, the check none of the others can stand in for, moving `DUCK.HEAD` has to move all twenty hats with it, because a part with a head coordinate written inside it would be left hanging in the air the first time the head moves; the eye and gear layers are held to the same shape of rule and to two more of their own, that everything worn over the eye sits on the eye and stays under the brim line where a hat ends, and that nothing the duck carries climbs above that line, touches the eye or the bill, or floats free of the body, and one that no single part can be asked about at all: the finished drawing is read back in order, and the back half of the gear has to come before the body and the front half after everything, or the duck would wear its tank over its wing and its ball under its belly, the twelve animals, where the promise of step H6 was that the drawing is the only thing allowed to change, so the ids, the shapes, the two colours, the prices and the Czech names are frozen in a table and every one of the three languages has to have a name for each, every animal has to own a drawing rather than fall back on the stand-in, and each of the twelve is drawn at all three stages and read back: nothing may leave the frame once the growth scale is applied and the stroke widths are added, the eyes and the smile have to land exactly where the shape said they do and the mouth has to sit below the eyes, the growth star has to appear once at the third stage, never before it, and never on an eye, and nothing may rotate or use a relative path command, because the frame check is only true while the points can be read straight out of the drawing, and the geometry of the map, that is no two cards overlapping and none running off the side for two, three and four columns. That last one computes the height of a card from `src/styles.css` itself rather than from `placeBox()`, because measuring a definition against itself catches nothing: it reads the padding, the border, the gaps, the preview ratio and the line heights, runs both type scales, nine window widths and the longest track names in all three languages, and checks that `TX_BY_GRADE` in `app.js` still says what `--tx` says in the stylesheet. The two column layout keeps its horizontal positions byte for byte; the vertical step grew, because a card is taller than two old steps |
| `migration.test.js` | Boots frozen profiles saved by older versions and proves nothing was lost: no field gone, no number smaller, no track closed that used to be open, no chapter moved forward. Reads `fixtures/legacy-profiles.json` |
| `i18n.test.js` | Dictionary completeness across cs/en/de and a full race in each language |
| `names.test.js` | Racer names render in every language in both the pre-race picker and the garage |
| `style.test.js` | The rules the pictures of step C were paid for, checked as text in `src/styles.css`, `src/index.template.html` and the manifest: `vh` before `dvh`, a ceiling on the bottom sheet, `orientation: any`, the race grid for a window on its side with its four areas, the keypad rows hanging on `.keypad-pad` rather than on `.keypad`, a key floor that grows with the school year on its side too, a question zone that scrolls rather than being cut, no dead `.runner` or `.ghost` selector, and the type scale, that is the `--tx` values for years one to five living in one place and agreeing with `TX_BY_GRADE` in `app.js`, none of them starting below 12.5 px, and no child text left in the faintest ink. Both the sizes and the colour are swept over **every** rule in the file: each one either multiplies `--tx` or stands on a short, commented list of exceptions, the parent screens and the glyphs that are not text. A hand written list of child selectors never sees the rule added tomorrow. Plain node: no jsdom, no build |

**A check that fires once in twenty runs is not a check.** The shuffle that keeps
the same fact from being asked twice in a row is tested by building five hundred
races on each of `a3`, `a5`, `a7` and `a10` and counting the neighbouring pairs,
because a single race per track made the old check flap instead of failing.
The same goes for anything else rare: measure it over many runs, do not soften it.

Several counts in `flow.test.js` are written down rather than derived: how many
distinct routes and places the map has, how long a first and a second year map
is, how many tracks the look ahead unfolds, how many chapters of the third
year are still locked, and how many racers a profile starts with. A new track,
generator or free starter moves them, which is deliberate: the number has to be
looked at and confirmed, not quietly recomputed. The starter count went from six
to seven in step H1, when the rubber duck arrived as a seventh free racer, and
the two places that count a profile's racers after one purchase went from seven
to eight with it. Step H3 moved two more: the garage sells 39 duck parts rather
than 9, now that patterns and hats stand under the ten colours, and three tiles
are free to tap rather than one, the classic yellow plus the two empty tiles
that take a pattern or a hat off again. Step H4 moved the same two again, to 64
parts for sale and five free tiles, when the eye and gear layers arrived. Step H7
moved the racer count a third time, from eight to nine: the garage now holds
twenty-eight animals instead of twelve, and the flow test buys one of the new
ones with coins to prove that a new animal is paid for rather than given away.

**Layout is checked in pictures, not in jsdom.** jsdom has no layout at all, so
nothing here can tell whether the keypad fits under the question. What the tests
can hold on to is the arithmetic behind the layout: `worldSpots()` returns
rectangles, and those are checked for overlap and for staying inside the width,
and the rules themselves, which `style.test.js` reads as text. Everything else
about the way a screen looks is checked on rendered images and in a real browser
at the sizes listed in `docs/PLAN.md`, step C. The type scale needs a browser
too: a test can say that every child facing size multiplies `--tx`, not that the
larger letters still fit on the card.

A run is clean when no line contains `!!`. The tests print in Czech because that
is the working language of the project; the code and comments are English.

`!!` alone is not enough to trust a run: a test that throws stops right there and
every check below it silently never happens, while `grep '!!'` still comes back
empty. `flow.test.js` and `names.test.js` were both doing that until step A,
each stuck on a step the interface no longer has. Look at the exit status and at
how many `OK` lines came out, not only at the absence of `!!`.

How long they take: `style.test.js` is instant and needs neither jsdom nor a
build; `items.test.js` runs in about a second and is the one to
run after every change to the engine; `names.test.js` a few seconds;
`migration.test.js` under ten; `i18n.test.js` and `flow.test.js` about a
minute each, because they drive whole games through jsdom. Run those two
before a commit rather than after every edit.

**Touching the data model means adding a fixture.** `migration.test.js` is the
only guard for children on phones that are not ours, so any change to what a
profile stores gets a new frozen profile in `fixtures/legacy-profiles.json`.
Never fix a failing migration test by deleting a check.

There is no test runner and no CI. Each file is a plain script that exits 0.
