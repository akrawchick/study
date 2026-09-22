# Krawchick Study

Study guides for Noah and Julien, hosted at **https://study.krawchick.com** (GitHub Pages, repo `akrawchick/study`).

Each guide is a small app: a day-by-day mission from today until the test, flashcards built from the student's own notes, and quizzes that focus on whatever the student keeps missing. Progress is saved in the browser of the device the student uses (no accounts, no server).

## Layout

```
index.html              site home: pick a student
noah/index.html         Noah's list of guides
julien/index.html       Julien's list of guides
noah/unit2/index.html   one guide page (tiny: loads content + engine)
noah/unit2/content.js   that guide's content: schedule, terms, questions
engine/trainer.js       shared app logic, used by every guide
engine/trainer.css      shared styles
.claude/skills/study-guide/   the /study-guide skill for making a new guide
```

To add a guide: copy `noah/unit2/` to a new folder, rewrite `content.js`, update the title and brand in `index.html`, add a row to the student's `index.html` and update the count on the site home. Or run `/study-guide` in Claude Code, which does all of that.

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

## Schedule rules of thumb

- Roughly one week of `learn` days, 4–6 new terms each, then a `connect` day, then two review days (`review`, `final`), then `test`.
- Fewer days to the test? Drop the connect day first, then merge learn days. Keep at least one review day.
- The app handles skipped days: unseen cards are folded into the next mission.

## Future: the LLM layer

Plan is a small Cloudflare Worker that holds the Anthropic API key with a spending cap, so guides can offer "explain this differently" and generate fresh questions. The content format above is what that layer would produce.
