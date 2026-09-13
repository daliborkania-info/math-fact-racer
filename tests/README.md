# Tests

Headless regression tests. They load the built `index.html` into jsdom and drive
the real interface, so they catch broken rendering as well as broken logic.

```bash
npm install jsdom      # the only dependency, not committed
cd ..
python3 build.py       # tests run against the built index.html
for f in tests/*.test.js; do echo "$f"; node "$f" | grep '  !!  '; done
```

| File | What it covers |
| --- | --- |
| `flow.test.js` | Whole game cycle: parent code, profile creation with the school year, racer picker, a race with mistakes, records, the map laid out as a world, the collection, garage purchase, parent section, textbook and chapter selection, the workshop in both its jobs, world switching, the look ahead at next year, second profile |
| `items.test.js` | Generates thousands of questions and verifies every answer by evaluating the printed expression; checks the clock dial against its own answer, race composition, sprite validity, curriculum consistency, both chapter modes, the first year's ranges and the bridges over ten, the clock and thousand stages, the unlock memory, the rules for which chapter can be picked, the collection, the workshop window, the four worlds and their route shapes, the school years, and that a counting task draws exactly as many parts as its answer |
| `migration.test.js` | Boots frozen profiles saved by older versions and proves nothing was lost: no field gone, no number smaller, no track closed that used to be open, no chapter moved forward. Reads `fixtures/legacy-profiles.json` |
| `i18n.test.js` | Dictionary completeness across cs/en/de and a full race in each language |
| `names.test.js` | Racer names render in every language in both the pre-race picker and the garage |

Several counts in `flow.test.js` are written down rather than derived: how many
distinct routes and places the map has, how long a first and a second year map
is, how many tracks the look ahead unfolds, and how many chapters of the third
year are still locked. A new track or generator moves them, which is deliberate:
the number has to be looked at and confirmed, not quietly recomputed.

A run is clean when no line contains `!!`. The tests print in Czech because that
is the working language of the project; the code and comments are English.

**Touching the data model means adding a fixture.** `migration.test.js` is the
only guard for children on phones that are not ours, so any change to what a
profile stores gets a new frozen profile in `fixtures/legacy-profiles.json`.
Never fix a failing migration test by deleting a check.

There is no test runner and no CI. Each file is a plain script that exits 0.
