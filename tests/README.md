# Tests

Headless regression tests. They load the built `index.html` into jsdom and drive
the real interface, so they catch broken rendering as well as broken logic.

```bash
npm install jsdom      # the only dependency, not committed
cd ..
python3 build.py       # tests run against the built index.html
node tests/flow.test.js
node tests/items.test.js
node tests/i18n.test.js
node tests/names.test.js
```

| File | What it covers |
| --- | --- |
| `flow.test.js` | Whole game cycle: parent code, profile creation, racer picker, a race with mistakes, records, garage purchase, parent section, second profile |
| `items.test.js` | Generates thousands of questions and verifies every answer by evaluating the printed expression; checks race composition and that no sprite renders as NaN |
| `i18n.test.js` | Dictionary completeness across cs/en/de and a full race in each language |
| `names.test.js` | Racer names render in every language in both the pre-race picker and the garage |

A passing run prints `chyby za behu: zadne` or `chyby: zadne`. Anything else is a
regression. The tests print in Czech because that is the working language of the
project; the code and comments are English.

There is no test runner and no CI. Each file is a plain script that exits 0.
