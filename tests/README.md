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
| `flow.test.js` | Whole game cycle: parent code, profile creation, racer picker, a race with mistakes, records, garage purchase, parent section, textbook and chapter selection, second profile |
| `items.test.js` | Generates thousands of questions and verifies every answer by evaluating the printed expression; checks the clock dial against its own answer, race composition, sprite validity, curriculum consistency, both chapter modes, the within-twenty and clock stages, the unlock memory, and the rules for which chapter can be picked |
| `migration.test.js` | Boots frozen profiles saved by older versions and proves nothing was lost: no field gone, no number smaller, no track closed that used to be open, no chapter moved forward. Reads `fixtures/legacy-profiles.json` |
| `i18n.test.js` | Dictionary completeness across cs/en/de and a full race in each language |
| `names.test.js` | Racer names render in every language in both the pre-race picker and the garage |

A run is clean when no line contains `!!`. The tests print in Czech because that
is the working language of the project; the code and comments are English.

**Touching the data model means adding a fixture.** `migration.test.js` is the
only guard for children on phones that are not ours, so any change to what a
profile stores gets a new frozen profile in `fixtures/legacy-profiles.json`.
Never fix a failing migration test by deleting a check.

There is no test runner and no CI. Each file is a plain script that exits 0.
