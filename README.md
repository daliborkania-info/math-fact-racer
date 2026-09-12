# Math Fact Racer

*Čtete raději česky? [README v češtině](README.cs.md).*

Times tables practice for children of roughly seven to ten, played as a lap around a race circuit. One HTML file, no account, no ads, no tracking, no network needed after the page has loaded once. Interface in Czech, English and German.

**[▶ Play it here](https://daliborkania-info.github.io/math-fact-racer/)** — and see [Put it on the phone as an app](#put-it-on-the-phone-as-an-app) below for the two taps that turn it into a proper icon on the home screen.

---

## What it covers

| Track | Content |
| --- | --- |
| Warm-up | times 1, 2, 5 and 10 |
| Threes and fours | times 3 and 4 |
| Sixes and sevens | times 6 and 7 |
| Eights and nines | the hardest corner of the grid |
| Grand circuit | the whole times table to 10 × 10 |
| Division | the same facts read backwards |
| Up to twenty | addition and subtraction within 20 |
| Up to a hundred | addition and subtraction within 100 |
| The clock | reading a dial, from whole hours to afternoon times |
| Championship | everything unlocked, mixed |
| Trouble spots | only the facts the child keeps missing |

Tracks unlock as the previous one is learned. A parent can override any of that.

### Or follow whatever the class is doing

The parent section can be pointed at a textbook and the chapter the class has reached. A track called **What school is doing** then appears on the map and practises exactly that material. Built in so far is Matýskova matematika for years one to three, a Czech series: ninety five chapters in total, sixty three of which the game can practise. The rest stay visible but cannot be picked, so a parent can still see where the class is.

It is set per player, so siblings can follow different books. Loosely means about seventy percent of the questions come from the chosen chapter while the rest returns from earlier material so it is not lost. The default is no textbook at all, where the game picks the material itself from what the child finds hard.

Only the structure is taken from a textbook: which topics, in what order, over what range. No prompts and no artwork, the questions are generated. The curriculum maps live in [docs/kurikulum/](docs/kurikulum/) and are written in Czech.

---

## How a race works

A race is twenty questions and exactly one lap of the circuit. Answer on a big number pad, the car moves one twentieth of the lap for every correct answer, and the part of the track already driven fills with colour behind it. Cross the start-finish line and the lap is done.

**A mistake does not move the car.** It brakes, shows the correct answer, and puts that question back into the queue as an extra question a few turns later. The lap therefore stays the same length whatever happens, and a child who fixes every mistake still crosses the line exactly. Nothing ever moves backwards.

**Speed is rewarded but never demanded.** No timer is displayed and nothing counts down. Answering quickly earns more points, three correct answers in a row light up a turbo bonus, and the points decide the medal at the end. A child who is accurate but deliberate still finishes the lap and still gets a medal.

**The rival is yesterday's self.** The ghost car in the neighbouring lane is the best run ever recorded on that track, positioned by the current points gap. There are no leaderboards and no other children to lose against.

Coins from every race buy racers for the garage: rockets, race cars, a robot, a buggy, and a set of creatures that grow through three stages the more sums they solve with you.

---

## The mechanics, and why they are that way

Every design decision below is a deliberate answer to something in the research literature on arithmetic fluency and on children's motivation. Nothing here is decoration.

### Retrieval, not recognition

The answer is typed on a number pad rather than picked from multiple choice. Producing an answer from memory is retrieval practice; picking one from four is recognition, which is a much weaker way to build a memory. In a classroom study with second graders, flashcard-style retrieval beat chanting the tables out loud on both short-term and long-term multiplication fluency ([Ophuis-Cox et al., 2023](https://onlinelibrary.wiley.com/doi/10.1002/acp.4141), summarised by [The Hechinger Report](https://hechingerreport.org/proof-points-flashcards-prevail-over-repetition-in-memorizing-multiplication-tables/)).

### Spacing, through a Leitner box

Every fact carries a level from 0 to 5. A correct answer moves it up, a mistake moves it down, and the level sets how often the fact comes back. Weak facts return within the same race, strong facts appear rarely. Spaced retrieval outperforms massed practice, and the effect is the second strongest lever in the whole design after retrieval itself.

### Three seconds is the line between recall and reconstruction

A fact only reaches level 4 or 5 if the child answers within the fast threshold, which defaults to 3.8 seconds and is adjustable. Fluency is conventionally defined as producing a fact in under about three seconds without counting on fingers or skip counting, which is the point where the answer is recalled rather than worked out. Measuring response time is therefore the only honest way to see whether a fact is actually known.

### Time is measured, never displayed as a countdown

This is the compromise the evidence forces. Timed practice has strong support: the What Works Clearinghouse panel found a substantial body of studies behind timed fluency work. At the same time, the National Council of Teachers of Mathematics holds that timed tests do not measure fluency and can harm students, and the well known claim that timed testing causes maths anxiety in roughly a third of children traces back to a practitioner article rather than a controlled trial. A 2024 study of 113 fourth and fifth graders found no significant anxiety difference between openly timed and secretly timed tasks ([Education Week](https://www.edweek.org/teaching-learning/do-timed-tasks-really-worsen-math-anxiety/2024/08), [Hechinger Report](https://hechingerreport.org/proof-points-do-math-drills-help-children-learn/)). The debate is genuinely unsettled, so the app takes the part that is well evidenced, timing as a measure, and drops the part that is contested, visible time pressure.

### Errors cost less than success gains

Games research and classroom research agree that punishment discourages faster than reward encourages, that a punished player must understand exactly why, and that unlimited attempts protect persistence. Feedback that emphasises progress and strategy rather than failure protects the child's sense of being able to do it ([feedback and children's persistence in mathematics](https://www.sciencedirect.com/science/article/abs/pii/S0022096524000055), [motivation in response to feedback and math anxiety](https://pmc.ncbi.nlm.nih.gov/articles/PMC12338047/)). Hence: a mistake stalls the car rather than reversing it, the correct answer is shown immediately, the question returns for a second attempt, and every race ends with a medal and coins.

### Aim for roughly eighty percent success

Each race mixes about seventy percent facts the child already handles with thirty percent that need work, and the weighting favours weak facts inside that thirty. A success rate near eighty percent is the common recommendation for keeping a task inside the zone of proximal development, hard enough to teach and easy enough to stay in flow ([designing for challenge in an adaptive learning game](https://bera-journals.onlinelibrary.wiley.com/doi/10.1111/bjet.13146)).

### The load is smaller than it looks, so aim it well

There are 100 products in the grid but only 55 distinct facts once commutativity collapses them, and only about 21 that are genuinely hard once the 0, 1, 2, 5 and 10 rows are excluded. Almost all of those live in the block bounded by 6, 7, 8 and 9, with 7 × 8, 6 × 8 and 4 × 8 consistently the worst ([why 4×8 and 6×8 are so hard](https://www.justinmath.com/why-4x8-and-6x8-are-perhaps-surprisingly-some-of-the-hardest-multiplication-facts-for-students-to-remember/)). The track order walks deliberately towards that corner instead of drilling the grid uniformly.

### Short and daily beats long and occasional

A race takes two to four minutes. The streak counter rewards coming back tomorrow rather than staying longer today. Schools using comparable tools run them for five to ten minutes a day, which is the dose that fits both the spacing effect and a child's attention.

### Competing against yourself

The only opponent is your own record on that track. Leaderboards can motivate, but for a child practising at home the reliable design is self-referenced progress, which cannot produce a loser.

---

## Put it on the phone as an app

The game runs in the browser, but two taps turn it into an icon on the home screen that opens full screen with no browser chrome, exactly like an installed app. It then also works without a signal.

Open the game first: **[daliborkania-info.github.io/math-fact-racer](https://daliborkania-info.github.io/math-fact-racer/)**

### iPhone and iPad

1. Open that link **in Safari**. This does not work from Chrome or from inside the WhatsApp browser, so if the page opened inside another app, tap the ⋯ or the compass icon and choose *Open in Safari*.
2. Tap the **share button** at the bottom of the screen, the square with an arrow pointing up.
3. Scroll the list and tap **Add to Home Screen**.
4. Confirm with **Add** in the top right corner.

### Android

1. Open the link in **Chrome**. If it opened inside WhatsApp, tap the ⋮ menu and choose *Open in Chrome* or *Open in browser*.
2. Tap the **⋮ menu** in the top right corner.
3. Tap **Add to Home screen** or **Install app**, depending on the Chrome version.
4. Confirm with **Add** or **Install**.

The first launch after that asks for a parent code. Pick something a child will not guess, it protects the settings and the progress report. Then create a player and pick a track.

### If you would rather have the file itself

Download [index.html](index.html) and open it from the phone or tablet. It is completely self-contained and works with no connection at all, only the decorative rounded font falls back to the system one. This is also the way to keep a copy that never changes.

---

## Privacy

Nothing leaves the device. Progress lives in the browser's own local storage under a single key, there is no account, no analytics, no ads and no network calls apart from loading the page and its font. Clearing the browser's site data erases the progress, so use the backup panel in the parent section if you want to keep it or move it to another device.

The parent code is stored only as a hash. It keeps a child out of the settings, it is not real security, and anyone with access to the browser's developer tools can get past it.

---

## For developers

The playable page is a single self-contained file. It is generated, not edited by hand.

```
src/index.template.html   document skeleton with three markers
src/styles.css            all styles
src/i18n.js               every user facing string, cs / en / de
src/curricula.js          textbook chapters for the follow-the-class mode
src/app.js                engine, screens, interaction
build.py                  inlines the sources into index.html
index.html                the built, playable file
dist/artifact.html        same page without the html/head/body wrapper
sw.js                     tiny offline cache for the hosted copy
```

```bash
python3 build.py
```

There is no toolchain, no dependencies and no npm. The game is plain ES2017 with no framework, the circuit geometry is computed in JavaScript rather than through the SVG DOM so it can be tested outside a browser, and every sprite and track is drawn from parameters rather than loaded from an image.

To add a language, add a block to `I18N` in `src/i18n.js` with the same keys as `en`, add the code to `LANGS`, and rebuild.

---

## Licence

MIT. Do what you like with it, including handing it to every parent in the class.

---

## Supporting the project

The game is free and will stay free. No ads, no tracking, no account, no paid tier, nothing locked behind money. None of that is going to change.

If it earned its keep at your house and you would like more material added, this is the way to back it. Next up are division with remainders, numbers to a thousand, units, time and money, word problems, and eventually the curriculum of later school years. It gets written in the evenings around a day job, so a contribution is mostly a signal that someone out there is using it.

It is entirely voluntary. Nothing unlocks, nothing speeds up, and the game cannot tell who contributed and who did not. Skip this section and keep playing, that is completely fine and you miss nothing.

The payment QR code below follows the Czech SPAYD standard, which Czech banking apps read directly. Account number for a manual transfer: **2800927751/2010**, IBAN **CZ49 2010 0000 0028 0092 7751**, BIC **FIOBCZPPXXX**. A card option for people outside the SEPA area is on the list, not built yet.

<img src="docs/support-qr.png" alt="Payment QR code" width="180">

---

## Repository

<https://github.com/daliborkania-info/math-fact-racer>

Hosting is GitHub Pages: repository *Settings → Pages → Source: Deploy from a branch → main → / (root)*. The page then lives at `https://daliborkania-info.github.io/math-fact-racer/` and updates on every push.

---

## Project state and handover

A full snapshot of the design decisions, mechanics, architecture, fixed bugs and
the roadmap lives in [docs/PROJECT-STATE.md](docs/PROJECT-STATE.md). It is written
in Czech, the working language of the project, and is meant to be readable on its
own by anyone picking the project up later.
