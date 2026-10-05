---
name: study-guide
description: Build a new study guide for Noah or Julien from photos of their worksheets, notes, or a study list. Use when the user attaches school materials and mentions a test, or asks for a study guide, flashcards, or quiz for one of the boys.
---

# Build a study guide

You are adding a guide to the family study site (see README.md for the content formats and layout). The result is a folder like `noah/<subject>/<slug>/` containing `index.html` and `content.js`, plus a row in the right subject section of the student's page. Publishing is a git push to `main`, then confirming that GitHub Pages actually deployed it (step 6).

Subjects are folders under the student: `social-studies`, `math`, `ela`, `science`. Add a new subject section to the student's `index.html` if needed.

**Pick the engine first.**
- Vocabulary, people, events, facts for an upcoming test → **test prep** (`engine/trainer.js`, `window.GUIDE`). Follow steps 1–5 below.
- A skill practiced by doing problems (solving equations, fractions, grammar fixes, unit conversions) → **skill practice** (`engine/practice.js`, `window.PRACTICE`). Copy `noah/math/two-step-equations/` as the model: write problem generators that return integer or simple answers with worked steps, a `hints` list of recognizable wrong answers with a one-line explanation each, 5–6 levels from foundation to mixed challenge, and a short Learn page (rules, the recipe, worked examples, common traps). Fuzz every generator in node for a few thousand problems: answers must match the steps, and no hint value may equal the right answer. For a young student (Julien, 2nd grade), copy `julien/math/money/` instead: `kid: true`, 8 per set, pass at 6, a sticker per level, story text in `<div class="story">`, drawings via `engine/draw.js`, and hints written in plain, warm language. Then skip to step 4.

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

## 6. Confirm it's live before saying so

A push is not a publish. GitHub Pages runs a "pages build and deployment" job after each push to `main`; it normally takes under a minute but can sit queued for many minutes when GitHub is slow (it did on Oct 5, 2026). Never tell the user a change is live until GitHub reports that job succeeded for the commit you pushed.

1. Find the run for your commit and wait for it to finish (poll in the background, about every 30 seconds; don't block the conversation):
   ```
   gh api "repos/akrawchick/study/actions/runs?per_page=3" | python3 -c "import json,sys; [print(r['id'], r['head_sha'][:7], r['status'], r['conclusion']) for r in json.load(sys.stdin)['workflow_runs']]"
   ```
   It is done when the run for your commit's SHA shows `completed success`. Check the jobs (`.../actions/runs/<id>/jobs`) if it's slow: "build" can succeed while "deploy" is still queued, and the site doesn't change until deploy finishes.
2. If you can, also fetch the live page (`curl -sI https://study.krawchick.com/<path>`) and check it shows the new content. This environment's network policy may block the site; if so, say plainly that you confirmed it through GitHub only.
3. Only then reply "it's live", and tell the user to refresh.

If it hasn't finished after about 10 minutes, or it failed or was cancelled: say exactly that (which step, how long it has waited), and tell the user they can re-run it at https://github.com/akrawchick/study/actions (open the top "pages build and deployment" run → Re-run all jobs) and check https://www.githubstatus.com. Keep watching and report when it completes.

Don't push to `main` again while a deploy is still pending. Each push starts a new run and cancels the waiting one, which pushes the publish back further. Batch follow-up changes, or commit them to the working branch and merge once the current deploy is done.

## Reply

Reply with the link (`https://study.krawchick.com/<student>/<slug>/`), the schedule table, the corrections you made to the student's notes, and anything you couldn't see clearly in the photos.

## Working with the boys

When a student is sitting with the user, involve them: offer two or three memory hook options for the trickiest terms and let the student pick; ask them which term they find most confusing and write an extra question for it. Keep language at the student's level. They can also edit `content.js` directly; it's plain text and the format is forgiving.
