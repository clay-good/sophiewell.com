# spec-v1406 — the rest of the envelopes

[spec-v1404](spec-v1404.md) and [spec-v1405](spec-v1405.md) added weight and height to
`scripts/probe-envelope-unbounded.mjs`. Twelve more of the 36 envelopes in `lib/bounds.js` still had
no row: age, QT, chloride, calcium, magnesium, phosphate, INR, FiO₂ (fraction and percent), BUN,
eGFR, and BMI. Mapping them found **97 fields**.

| section | rows | the worst reading |
|---|---|---|
| reassuring from an impossible value | 1 | `pecarn-head`, age 1,300: *"Very low risk … CT not recommended"* |
| answered from an impossible value | 66 | SCORE2-OP 87.9% and Reynolds 99.4% ten-year risk from age 1,300; Mifflin-St Jeor *"REE -4701 kcal/day"*; a urea reduction ratio of -4900%; warfarin initiation *"Hold today's dose"* from an INR of 200 |
| asked for a value the reader had typed | 30 | a reader who typed an age of 1,300 was told *"Enter the age"*, retyped it, and got the same sentence |

By envelope: age 66, INR 8, BMI 8, eGFR 6, BUN 5, QT 2, phosphate 1, magnesium 1.

## The fixes

The same two shapes as the earlier envelope waves, in about 52 library files:

- **Refuse**, with the shared `boundsAdvisory()` sentence, after each function's own missing-value
  branch, and in the function's own refusal shape (`band` where its page renders `band`; a thrown
  `RangeError` where the function reports errors by throwing).
- **Name the range**, with `gradeFault()` and each file's own bounds, before the missing-value
  message, so a blank field is still asked for and an entered one is not.

Four readings are the tool's own range rather than the shared envelope: `maggic` (18–120 years, BMI
5–80), `rope-score` (18–120), `calvert-carboplatin` (an absolute GFR in mL/min, so the shared sentence
would name the wrong unit), and `mysec-pm` (12–110). The shared envelope's BUN floor of 1 mg/dL now
refuses a BUN of 0 in `saps-ii`, `ktv-urr`, and `npcr-pna`.

Three changes went beyond the library: the `centor` agent adapter returns the McIsaac refusal instead
of answering beside it, the `timi-stemi` and McIsaac pages print the new refusal, and the
`aa-pf-suite` page replaces its "Expected A-a by age" row with the envelope sentence when the age is
impossible (the age feeds only that row).

**The finder reads the agent surface; the page is a separate renderer.** A browser sweep drove all
128 fields fixed in spec-v1404 through this spec past their ceiling on the page and read the result.
It found seven the library fixes did not reach: `pecarn-head` (*"PECARN risk tier: null"*),
`charlson`, `pesi` (*"PESI null - Class null"*) and `must-nutrition` printed headings built from the
refusal's nulls, and `findrisc`, `scorten` and `grobman-vbac` showed "Complete the remaining fields"
because the `invalid()` helper in `views/group-v191.js` and `views/group-v192.js` discarded the
library's message. Each renderer now prints the refusal. After the fixes the sweep reads zero.
Showing the library's message exposed eight older refusals in those two groups that carried none
(`melanoma-t-stage`, `pi-rads`, `guys-stone-score`, `grobman-vbac`, `adhere-hf`), including
Grobman's explanation that the prior vaginal-delivery history is its strongest term, which the page
had never shown. Each now has a specific message, and `probe-refusal-unrendered` reads zero.
(`ich-score` also appeared, as a false positive: its age is a slider capped at 110, so the page
cannot send 1,300.)

Six tests had pinned the old behavior, each with an out-of-range fuzz value (`age: 1e9`, INR 1e9,
INR 0) that used to compute. They now use the top of the envelope and assert the refusal.

## The finder is a gate now

`test/unit/probe-envelope-unbounded.test.js` already required the first two sections to be empty
(spec-v1251). It now requires all three, no mis-mapped row, and a reach of at least 700 fields with
650 testable. A zero from a smaller map is not the same claim, so the gate fails if rows are
removed. The finder's own reach: 708 fields, 664 testable, none mis-mapped. Element symbols (Mg, Ca,
Cl) are deliberately not matched: case-insensitive `\bMg\b` is the "mg" in every "mg/dL", and the
finder's mis-mapping check caught it on the first run.
