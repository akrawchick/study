# Krawchick Study

Study guides for Noah and Julien, hosted at **https://study.krawchick.com** (GitHub Pages, repo `akrawchick/study`).

Each guide is a small app: a day-by-day mission from today until the test, flashcards built from the student's own notes, and quizzes that focus on whatever the student keeps missing. Progress is saved in the browser of the device the student uses (no accounts, no server).

## Layout

```
index.html                         site home: pick a student
noah/index.html                    Noah's page, one section per subject
julien/index.html                  Julien's page
noah/<subject>/<slug>/index.html   one guide page (tiny: loads content + an engine)
noah/<subject>/<slug>/content.js   that guide's content
engine/trainer.js                  test-prep engine: schedule, flashcards, quizzes (window.GUIDE)
engine/practice.js                 skill-practice engine: generated problems, typed answers, levels (window.PRACTICE)
engine/trainer.css                 shared styles for everything
.claude/skills/study-guide/        the /study-guide skill for making a new guide
```

Subjects are folders: `social-studies`, `math`, `ela`, `science`. Add more as needed. (`noah/unit2/` is a redirect to `noah/social-studies/unit2/`, kept so the first bookmark still works.)

Two kinds of guide:
- **Test prep** (`trainer.js`): vocabulary and facts, with a day-by-day schedule ending on the test date. Example: `noah/social-studies/unit2/`.
- **Skill practice** (`practice.js`): a skill like solving equations, practiced through generated problems in levels. No test date. Example: `noah/math/two-step-equations/`.

To add a guide: copy the closest existing one to a new folder, rewrite `content.js`, update the title and brand in `index.html`, add a row in the right subject section of the student's `index.html`. Or run `/study-guide` in Claude Code, which does all of that.

Publishing is `git push` to `main`. GitHub Pages rebuilds in about a minute.

## Content format (`content.js`)

```js
window.GUIDE = {
  id: "noah-unit2",          // unique per guide; used as the progress storage key
  student: "Noah",
  subject: "Unit 2",         // short, shown in headlines ("Unit 2 is in the books")
  start: "2026-09-21",       // day 1 (YYYY-MM-DD). The last entry in `days` is the test date.
  days: [                    // one entry per calendar day, first day to test day
    {title:"...", kind:"learn"},    // new flashcards + quiz
    {title:"...", kind:"connect"},  // no new terms: big-picture read + connections quiz
    {title:"...", kind:"review"},   // 25-question practice test, then drill misses
    {title:"...", kind:"final"},    // drill weak spots, then final practice test
    {title:"Test day", kind:"test"} // 5-question warm-up
  ],
  groups: [{key:"R", name:"Renaissance"}, ...],   // up to 4; colors progress bars and card labels
  terms: [{
    id:"luther", day:4, group:"F", kind:"person",  // day = which learn day (1-based) it opens
    term:"Martin Luther",
    def:"...",            // full definition, in the student's words where possible
    short:"...",          // 4–8 word version for matching questions
    hook:"...",           // memory hook shown on the back of the card
    ask:"...",            // optional: answers a question the student wrote in their notes
    article:"the",        // optional: "What was the Ottoman Empire?"
    plural:true,          // optional: "Who were the Huguenots?"
    auto:false            // optional: skip auto-generated questions (for fuzzy items like "Map of ...")
  }],
  questions: [{            // hand-written multiple choice. a[0] is ALWAYS the correct answer.
    t:["luther"],          // term ids this question tests (may be several, or [])
    d:4,                   // learn day it unlocks, or "C" for the connect day
    q:"...", a:["correct","wrong","wrong","wrong"], e:"one-line explanation"
  }],
  orders: [{ q:"Put these in order.", items:["first","second","third"], e:"..." }],
  bigPicture: {            // optional; shown on the connect day
    title:"...", intro:"...", chain:["A","B","C"],
    sections:[{h:"...", chain:["...","..."], note:"optional"}]
  }
};
```

The engine also auto-generates two question styles per term (definition → term, term → definition) and matching questions, so 30 terms plus ~40 hand-written questions gives plenty of variety.

## Content format for skill practice (`content.js` with `practice.js`)

```js
window.PRACTICE = {
  id: "noah-math-two-step", student: "Noah",
  title: "Two-step equations", intro: "one sentence",
  prompt: "Solve for x.", label: "x =", placeholder: "−4",   // defaults for the answer box; a problem can override
  setSize: 10, passAt: 8,                                    // problems per set, correct answers needed to pass a level
  mistakeNames: {sign: "Sign slips", ...},                   // labels for the hint keys, shown on Progress
  levels: [{ name, desc, gen }],                             // gen() returns one problem, see below
  lesson: [{ h: "heading", body: "<p>html</p>" }]            // the Learn page
};
// gen() returns:
{ q: "3x + 5 = −7",            // HTML for the problem (use the .frac span for fractions)
  a: -4,                       // numeric answer; the student may type -4, −4, x=-4, or 3/2
  steps: ["...", "..."],       // worked solution, one HTML string per step
  check: "Check: ...",         // optional
  hints: [{ v: 4, key: "sign", short: "sign slip", msg: "..." }]  // wrong answers we can recognize and explain
}
```

Levels unlock in order (pass the previous one). Progress, streaks and mistake tallies are per device.

## Schedule rules of thumb (test prep)

- Roughly one week of `learn` days, 4–6 new terms each, then a `connect` day, then two review days (`review`, `final`), then `test`.
- Fewer days to the test? Drop the connect day first, then merge learn days. Keep at least one review day.
- The app handles skipped days: unseen cards are folded into the next mission.

## Future: the LLM layer

Plan is a small Cloudflare Worker that holds the Anthropic API key with a spending cap, so guides can offer "explain this differently" and generate fresh questions. The content format above is what that layer would produce.
