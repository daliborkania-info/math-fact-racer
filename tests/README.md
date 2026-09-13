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
| `flow.test.js` | Whole game cycle: parent code, profile creation with the school year, racer picker, a race with mistakes, records, the map laid out as a world, the collection, garage purchase, parent section, textbook and chapter selection, the workshop in both its jobs, world switching, the look ahead at next year, a second profile, and wiping progress, which keeps the school year and every parent setting and takes away only what was earned. It plays on a 375 x 812 phone, set in `beforeParse` because the layout is decided at boot; one check at the end deliberately switches the window to 1024 x 768 and waits for the map to move into four columns |
| `items.test.js` | Generates thousands of questions and verifies every answer by evaluating the printed expression; checks the clock dial against its own answer, race composition, sprite validity, curriculum consistency, both chapter modes, the first year's ranges and the bridges over ten, the clock and thousand stages, the unlock memory, the rules for which chapter can be picked, the collection, the workshop window, the four worlds and their route shapes, how far apart in Lab the palettes of one world stand, because two places painted nearly the same colour are invisible to every other check here and to a rendered picture as well unless the gradient is composed by hand, the school years, the chain of three numbers with the length of its question row, the order of operations, whose answer it works out itself under the precedence rule rather than through `eval`, since that rule is the thing under test, checking as it goes that no division leaves a remainder, that no step falls below zero and that most of the lines would come out differently read left to right, the round tens, where the product has to stay inside a thousand, a division may only be by a number the game has taught, and the longest question of that family is still `1000 : 100`, the unit conversions, where the pair of units and the direction are read back out of the printed question and both the number asked about and the answer have to stay whole and inside a thousand, that a counting task draws exactly as many parts as its answer, and the geometry of the map, that is no two cards overlapping and none running off the side for two, three and four columns. That last one computes the height of a card from `src/styles.css` itself rather than from `placeBox()`, because measuring a definition against itself catches nothing: it reads the padding, the border, the gaps, the preview ratio and the line heights, runs both type scales, nine window widths and the longest track names in all three languages, and checks that `TX_BY_GRADE` in `app.js` still says what `--tx` says in the stylesheet. The two column layout keeps its horizontal positions byte for byte; the vertical step grew, because a card is taller than two old steps |
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
is, how many tracks the look ahead unfolds, and how many chapters of the third
year are still locked. A new track or generator moves them, which is deliberate:
the number has to be looked at and confirmed, not quietly recomputed.

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
