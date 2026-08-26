# spec-v800.md — Hughes Functional Grading Scale (GBS)

> Status: **SHIPPED (2026-08-26).** Builds the `hughes-gbs` tile. Catalog **1591 → 1592**,
> group G.

## Why

The catalog had three Guillain-Barré tiles — `egris` (respiratory-failure risk), `megos`
(walking outcome), `brighton-gbs` (diagnostic certainty) — and **not the scale two of them
are built around**. mEGOS predicts a Hughes grade at six months; EGRIS predicts the step to
Hughes grade 5. The outcome those tools point at was missing.

## What it does

Seven grades, higher is worse:

| Grade | |
| --- | --- |
| 0 | healthy, no symptoms attributable to the illness |
| 1 | minor symptoms, able to run |
| 2 | walks 10 meters or more without support, unable to run |
| **3** | **walks 10 meters only with help** |
| 4 | bedridden or wheelchair-bound |
| 5 | requires assisted ventilation |
| 6 | death |

**Grade 3 is the threshold that matters.** It is where independent walking is lost, and
grades 3 and above are what the literature counts as disability. The tile says which side of
that line the patient is on, and a test pins both sides.

Grade 5 additionally flags assisted ventilation, the endpoint EGRIS predicts.

**Grade 6 is special-cased**: it does not get "independent walking is lost" appended to it,
which would be a strange thing to print. A test asserts the band ends at "death."

**Worked example:** grade 3 → walks 10 meters only with help, independent walking lost.

## Posture (spec-v97)

Records a functional state at one moment. Not a prognosis, not a treatment decision, and it
**captures no sensory symptoms or pain at all** — a real limitation of the scale worth
stating, since GBS pain is common and invisible to it.

## Files

- `lib/hughes-gbs-v800.js` — `hughesGbs()`, `HUGHES_NOTE`.
- `views/group-v800.js` (RV800) — one select whose option text carries the full grade definition, so the scale itself is readable on the page; a11y-checked.
- `mcp/adapters/hughes-gbs-v800.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, all seven grades, the threshold, the link to the predictive tiles, related (megos, egris, brighton-gbs).
- `test/unit/hughes-gbs.test.js` — 5 tests (all seven grades distinct, the 2/3 threshold from both sides, ventilation from grade 5, the grade-6 special case, required and bounded input).
- `docs/spec-v800.md` (this file).

## Sourcing (spec-v97)

Hughes RA, Newsom-Davis JM, Perkin GD, Pierce JM. *Lancet.* 1978;2(8093):750-753
(PMID 80682). All seven grade definitions and the grade-3 disability threshold were confirmed
against two independent reproductions, which agreed word for word on every grade including
the 10-meter distance in grades 2 and 3. The source's own wording uses "metres"; the tile
uses "meters", since `check-us-english` governs reader-facing copy regardless of what the
source spelled.
