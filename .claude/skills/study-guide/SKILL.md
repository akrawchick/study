---
name: study-guide
description: Build a new study guide for Noah or Julien from photos of their worksheets, notes, or a study list. Use when the user attaches school materials and mentions a test, or asks for a study guide, flashcards, or quiz for one of the boys.
---

# Build a study guide

You are adding a guide to the family study site (see README.md for the content formats and layout). The result is a folder like `noah/<subject>/<slug>/` containing `index.html` and `content.js`, plus a row in the right subject section of the student's page. Publishing is a git push to `main`.

Subjects are folders under the student: `social-studies`, `math`, `ela`, `science`. Add a new subject section to the student's `index.html` if needed.

**Pick the engine first.**
- Vocabulary, people, events, facts for an upcoming test → **test prep** (`engine/trainer.js`, `window.GUIDE`). Follow steps 1–5 below.
- A skill practiced by doing problems (solving equations, fractions, grammar fixes, unit conversions) → **skill practice** (`engine/practice.js`, `window.PRACTICE`). Copy `noah/math/two-step-equations/` as the model: write problem generators that return integer or simple answers with worked steps, a `hints` list of recognizable wrong answers with a one-line explanation each, 5–6 levels from foundation to mixed challenge, and a short Learn page (rules, the recipe, worked examples, common traps). Fuzz every generator in node for a few thousand problems: answers must match the steps, and no hint value may equal the right answer. Then skip to step 4.

## 1. Gather

From the conversation and attachments, pin down: student (Noah or Julien), subject and unit name, **test date**, and the materials. If the test date is missing, ask; everything else can be inferred or defaulted. Ask about the test format (multiple choice, matching, short answer) only if the user hasn't said; if unknown, proceed with mixed formats.

Read every attached image fully. The student's own definitions are the source of truth for wording, since that's what the test draws from. Transcribe them faithfully, then fix:
- Factual errors (e.g. "Martin Luther King" for Martin Luther). Fix on the card, and turn the confusion into a quiz question.
- Spellings of names and terms.
- Grammar, lightly. Keep the student's voice.
Tell the user every correction you made, in the reply.

Also capture anything the student wrote as a *question* (gallery walks and graphic organizers often have a Questions column). Answer each briefly in the term's `ask` field.

## 2. Plan the schedule

Count days from today to the test date inclusive. Then:
- Test day: `test`.
- The two days before: `review`, `final` (drop to one `review` if there are fewer than 6 days total).
- One `connect` day before those if there are 9 or more days total.
- The rest are `learn` days. Split terms into groups of 4–6 that make sense together (chronological or thematic), one group per learn day, and give each day a short title.
- If today is already past the first planned day (the user came late), set `start` to today and compress.

Show the user the day-by-day table in the reply before or as you build. Keep the description of each day to one line.

## 3. Write the content

Create `<student>/<unit-slug>/content.js` following the format in README.md exactly. Quality bar:
- **Every term** has `def`, `short` (4–8 words), and `hook`. Hooks are concrete: word roots, a comparison to something a 13-year-old knows, a way to avoid a common mix-up. No filler.
- **Hand-written questions**: aim for 1–2 per term plus 6–10 `d:"C"` connection questions (cause and effect, "which belongs / doesn't belong", "which statement is correct"). `a[0]` is the correct answer. Distractors are plausible, drawn from the same unit. Each `e` is one sentence that teaches, not just "Correct."
- **Orders**: 2–3 put-in-order questions if the unit has any sequence.
- **bigPicture**: one connecting idea and 3–4 short chains. Omit if the unit has no throughline.
- Set `auto:false` on terms that are really summaries (maps, "art of the ...") rather than definable words.
- `id` values are lowercase, no spaces, unique across the guide.

Copy `noah/unit2/index.html` for the new `index.html`; change the `<title>` and the brand text, and check the relative paths to `engine/`.

## 4. Wire it up

- Add a row at the top of the guide list in `<student>/index.html` (copy the existing `<a class="guide">` block). The pill shows the test day.
- Update the student's card on the site `index.html` (guide count and next test).

## 5. Check and publish

Open the new guide locally once (`open <student>/<slug>/index.html` or via the browser tool) and confirm: the home screen shows the right day count and test date, a flashcard flips, and one quiz question gives feedback. Fix anything visibly broken. Don't build a longer test loop.

Then commit and push to `main`:

```
git add -A && git commit -m "Add <Student> <unit> guide" && git push
```

Reply with the link (`https://study.krawchick.com/<student>/<slug>/`), the schedule table, the corrections you made to the student's notes, and anything you couldn't see clearly in the photos.

## Working with the boys

When a student is sitting with the user, involve them: offer two or three memory hook options for the trickiest terms and let the student pick; ask them which term they find most confusing and write an extra question for it. Keep language at the student's level. They can also edit `content.js` directly; it's plain text and the format is forgiving.
