# v11 audit - Visit Preparation Question Bank (`prep`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: AHRQ "Questions to Ask Your Doctor" patient-engagement guides (Agency for Healthcare Research and Quality). The bundled `data/workflow/questions.json` is a curated derivative of the AHRQ scaffolds; the citation in META names AHRQ as the source. Confirmed current as of audit date (AHRQ continues to publish the question-builder under the same name).

## Boundary examples added
- META example: visit "annual physical", topic "cholesterol" -> renderer matches via `selectQuestions` and produces the AHRQ-derived cholesterol-relevant prompts under the annual-physical section.
- Empty visit + empty topic: renderer surfaces the "No matching questions" muted line (verified by reading `views/group-h.js prep`).
- Topic-only path: free-text "chest pain" without visit type still produces topic-matched prompts because `selectQuestions` matches on `freeText` keywords independent of `visitType`.

## Cross-implementation differential
- N/A (template / question bank). The differential is "do the rendered prompts come from the bundled AHRQ-derived bank without paraphrase drift?" — covered by `test/unit/keywords.test.js` round-tripping the bank fixtures.

## Edge-input handling notes
- Free-text input is treated as keyword tokens by `lib/keywords.js selectQuestions`; no HTML or script injection path (output is rendered via `el(... text:)`).
- Citation passes spec-v11 §3.5 no-bare-URL guard.
- Print button hands off to `window.print()` using the existing print stylesheet.

## A11y / keyboard notes
- Visit-type `<select>` and free-text `<textarea>` are labelled; result list is a semantic `<h2>` + `<ul>` structure. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
