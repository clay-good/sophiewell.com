# spec-v509.md — Sunnybrook Facial Grading System tile

> Status: **SHIPPED (2026-07-27).** Builds the `sunnybrook-facial` tile — the three-axis quantitative grading
> of facial nerve function, composite 0-100. Catalog **1358 → 1359**, group G.

## Why

A companion gap. The catalog already has `house-brackmann`, which assigns one gestalt grade I-VI to the whole
face. The Sunnybrook system is the other half of that pair: it grades resting symmetry, voluntary movement,
and synkinesis separately, so it moves with the small changes House-Brackmann cannot resolve — which is why
it is the measure facial-nerve clinics and facial-retraining therapists actually track a recovery on.
`sunnybrook`, `facial grading system`, and `synkinesis` were all zero-hit across `corpus.json` and `app.js`.

## What it does

The composite is a subtraction, not a lookup:

| Axis | Input | Weight |
| --- | --- | --- |
| Resting symmetry | eye, cheek, mouth, each against the normal side | points × 5 |
| Voluntary movement | five standard expressions, each 1 (none) to 5 (complete) | sum × 4 |
| Synkinesis | the same five expressions, each 0 (none) to 3 (severe) | sum × 1 |

`composite = movement − resting − synkinesis`

- `lib/sunnybrook-facial-v509.js` — pure inputs → the three subscores and the composite. Exports
  `REST_ITEMS`, `EXPRESSIONS`, `MOVEMENT_SCALE`, and `SYNKINESIS_SCALE` so the renderer and the tests share
  one source of wording. Rejects a missing item, a non-integer, an out-of-range scale value, and an unknown
  resting choice.
- `views/group-v509.js` (RV509) — thirteen selects (dom `sb-rest-eye`, `sb-m1` … `sb-m5`, `sb-s1` … `sb-s5`)
  under three headings, each with a real `<label for>`; surfaces the lib's validation message rather than a
  half-result.
- `lib/meta.js` — Ross, Fradet and Nedzelski 1996 citation + accessed date + per-axis bands, related to
  `house-brackmann`. No citation-staleness row (a named-author article, no guideline-issuer acronym).
- 10 worked-example unit tests + fuzz registration; synonym entry; corpus → 1359.

**The two anchors are arithmetic, not assertions.** A normal face computes 100 − 0 − 0 = 100; complete flaccid
paralysis computes (1×5)×4 = 20 movement, minus the worst resting score of 20, minus 0 synkinesis = 0. Both
fall out of the weights rather than being special-cased. The one honest wrinkle: the worst possible
combination (flaccid *and* severe synkinesis on every expression) computes −15. The tile reports it as
computed and the copy states the conventional 0-100 anchors rather than clamping, because clamping would be
this codebase inventing a rule the source does not state.

**HIGH-STAKES:** it is the arithmetic of the examiner's own observations. It is **not** a diagnosis, **not**
an etiology (Bell palsy, Ramsay Hunt, tumor, and post-surgical palsy all score identically), and **not** an
indication for imaging, steroids, antivirals, electrodiagnostic testing, chemodenervation, or surgery
([spec-v11](spec-v11.md) §5.3). A composite of 100 means the two sides looked symmetric on the day of the
exam; it does not rule out disease.

## Duplicate check

Four ways before building, per the procedure in [spec-v508](spec-v508.md): eponym (`sunnybrook`), the concept
words (`facial grading`, `facial nerve grading`), a mechanism probe (`synkinesis`), and the related-instrument
probe (`facial palsy`, `facial paralysis`) — each against **both** `corpus.json` and `app.js`; plus
`ls test/unit/` and a `lib/` scan. `house-brackmann` is the only facial-nerve tile and it grades a different
axis (one gestalt grade, no synkinesis component, no composite).

## Sourcing (spec-v97)

- **Citation:** Ross BG, Fradet G, Nedzelski JM. Development of a sensitive clinical facial grading system.
  *Otolaryngol Head Neck Surg.* 1996;114(3):380-386.
- Cross-verified against facial-nerve rehabilitation references reproducing the same three resting items, the
  same five standard expressions, the same 1-5 movement and 0-3 synkinesis scales, and the same ×5 / ×4
  weights.

## Verification

Lint (all catalog-truth surfaces at 1359), unit suite (+10 + fuzz), a11y, build — all green.

## Out of scope

The tile does not convert between Sunnybrook and House-Brackmann (no accepted crosswalk), score the eFACE or
the Facial Clinimetric Evaluation (FaCE) patient-reported scale, or track change across visits. The MCP
adapter + golden-probe promotion follow in the next wave (334).
