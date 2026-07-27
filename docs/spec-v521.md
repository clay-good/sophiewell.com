# spec-v521.md — PC-PTSD-5 (Primary Care PTSD Screen for DSM-5) tile

> Status: **SHIPPED (2026-07-27).** Builds the `pc-ptsd5` tile — the five-item primary-care PTSD screen,
> total 0-5, with a trauma-exposure gate. Catalog **1370 → 1371**, group G.

## Why

`pc-ptsd`, `primary care ptsd`, `ptsd screen`, and `prins` were all zero-hit across `corpus.json`, `app.js`,
and `lib/meta.js`.

The catalog has `pcl-5`, but that is a **different axis of the same condition**: the PCL-5 is a 20-item
**severity** measure scored 0-80, used to quantify and follow symptoms in someone already identified. The
PC-PTSD-5 is a five-item **screen** scored 0-5, used in a primary-care visit to decide whether to ask
further. Reaching for the 20-item severity measure as a screen, or reading a five-item screen as a severity
score, are both real errors, so each tile names the other and says which question it answers.

## What it does

**The trauma-exposure gate is part of the instrument, not a preamble.** The screen opens by asking whether
the person has ever experienced a traumatic event. If the answer is no, the source is explicit: the
PC-PTSD-5 is **complete with a score of 0**, and the five symptom items are never asked — every one of them
refers to "the event(s)" and is unanswerable without one. This tile models the gate: answering *no* returns a
finished, valid, negative result of 0/5, the five items are not required by the lib or the adapter, and the
renderer **hides** them rather than leaving five unanswerable questions on screen. Calculators that drop the
gate invite a clinician to score five questions that presuppose a trauma the patient has not reported.

Otherwise, five yes/no items about the past month, each scoring 1, total **0-5**.

**Two published cut points, and the tile refuses to silently pick one.** The source recommends **3** as
*optimally sensitive* for probable PTSD and **4** as *optimally efficient*. They answer different questions —
"do not miss people" versus "balance missing people against over-referring" — and which applies depends on
what happens next in a given setting. The result reports the total against **both**, labeled, instead of
emitting a bare positive/negative against an unstated threshold. A total of exactly 3 is the case where they
disagree, and the result says so in words.

- `lib/pc-ptsd5-v521.js` — pure answers → total plus both cut-point readings. Exports `PC_PTSD5_ITEMS`.
  Accepts yes/no as words, booleans, or 0/1.
- `views/group-v521.js` (RV521) — the gate select (dom `pcp-trauma`) plus five item selects (`pcp-q1` …
  `pcp-q5`) under two **h2** headings, each with a real `<label for>`.
- `lib/meta.js` — Prins and colleagues 2016 citation + accessed date + bands, related to `pcl-5`. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 11 worked-example unit tests + fuzz registration; synonym entry; corpus → 1371.
- Audiences include `patients`: the items are written in the second person and it is often self-administered.

**HIGH-STAKES:** this is a screen, **not** a diagnosis. A positive screen does not establish PTSD and a
negative screen does not exclude it; either way the next step is a clinical assessment, not a conclusion
([spec-v11](spec-v11.md) §5.3). A unit test asserts the result never emits a diagnostic claim. It does not
measure severity, does not track treatment response, and is not an indication to start or change any
medication or therapy. It also does not assess **suicide risk**, which is a separate question a positive
screen should *prompt* rather than answer.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the abbreviation (`pc-ptsd`), the concept's own name words
(`primary care ptsd`, `ptsd screen`), and the first author (`prins`) — each against **both** `corpus.json`
and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan. All zero. `pcl-5` is present and is the severity
companion, addressed above.

## Sourcing (spec-v97)

- **Citation:** Prins A, Bovin MJ, Smolenski DJ, et al. The Primary Care PTSD Screen for DSM-5 (PC-PTSD-5):
  Development and Evaluation Within a Veteran Primary Care Sample. *J Gen Intern Med.*
  2016;31(10):1206-1211.
- Cross-verified against trauma-assessment references reproducing the same five items, the same
  trauma-exposure gate *including its explicit "complete with a score of 0" instruction*, and both the
  optimally-sensitive cut of 3 and the optimally-efficient cut of 4.

## Verification

Lint (all catalog-truth surfaces at 1371), unit suite (+11 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not administer the PCL-5, apply the sex-specific cut points proposed in later validation work
(the two the tile reports are the ones the source itself recommends), assess suicide risk, or identify the
index trauma. The MCP adapter + golden-probe promotion follow in the next wave (346).
