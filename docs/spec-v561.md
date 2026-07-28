# spec-v561.md — SPADI tile

> Status: **SHIPPED (2026-07-28).** Builds the `spadi` tile — Shoulder Pain and Disability Index.
> Catalog **1410 → 1411**, group G.

## Why

`spadi` was zero-hit, and `grep -c "id: 'spadi'" app.js` returned 0.

## What it does

13 items in two subscales, each 0-10. **Higher is worse.**

- Pain subscale (5 items): sum ÷ 50 × 100
- Disability subscale (8 items): sum ÷ 80 × 100
- **Total = the mean of the two subscale percentages**

## The three rules a plausible implementation breaks

**1. The total is the mean of two subscale percentages — not the sum over 130.** Thirteen items on a single
0-10 scale look like one questionnaire, so summing them and dividing by 130 is the obvious move, and it
gives a different, wrong number. The lib returns `naiveTotal` — that wrong-but-tempting computation —
alongside the correct total, so the divergence is visible rather than merely asserted. A test pins a case
where they differ (50% vs 38.5%) and one where they coincide (both subscales at the same level).

**2. The consequence is unequal implicit item weighting.** Five pain items carry half the total; eight
disability items carry the other half. One pain item is therefore worth **1.6×** one disability item. A test
measures the ratio directly by moving a single item in each subscale.

**3. The published missing-data rules diverge, so only complete forms are scored.** One rendering drops an
omitted item from its subscale denominator (requiring ≥⅔ of each subscale answered); another replaces up to
two missing values with the subscale mean. Those rules are **not equivalent** — they give different totals
on the same form. Picking one silently would report a number under an authority it does not have, so the lib
requires all 13 items and says in the refusal that the handling of omissions is disputed (spec-v97). A user
with a genuinely incomplete form is better served knowing that than getting a plausible number.

## Two smaller disclosures

**Response format.** The 1991 original used a **visual analogue scale**; the current widely reproduced form
uses a **0-10 numeric rating scale**, which is what this implements. The literature treats scores as
interchangeable, but the instruments differ, so the format is stated rather than assumed.

**The MDC belongs to a comparison.** A change of 13 points at 90% confidence is the smallest difference
between two of the *same patient's* scores unlikely to be measurement noise. It says nothing about whether a
single score is high.

## Scope (spec-v11 §5.3)

A patient-reported measure of pain and function. It does **not** diagnose anything and does not distinguish
among the causes of shoulder pain, which are managed very differently — rotator cuff disease, adhesive
capsulitis, glenohumeral or acromioclavicular arthritis, instability, and pain referred from the cervical
spine all produce a high score. It does **not** detect the findings that make a shoulder urgent rather than
chronic: an acute traumatic tear in a young patient, a suspected dislocation, infection, or a mass all need
assessment *regardless of the score*. Being entirely self-reported it measures neither range of motion nor
strength, and it is not an indication for imaging, injection or surgery.

## Files

- `lib/spadi-v561.js` — `spadi()`, `SPADI_PAIN_ITEMS`, `SPADI_DISABILITY_ITEMS`, `PAIN_MAX`,
  `DISABILITY_MAX`, `SPADI_MDC`.
- `views/group-v561.js` (RV561) — the two subscales under **h2** headings carrying the instrument's own
  stems.
- `mcp/adapters/spadi-v561.js` — wave 386.
- `test/unit/spadi.test.js` — 14 tests.
- `docs/spec-v561.md` (this file).

## Sourcing (spec-v97)

Transcribed from a permission-bearing reproduction of the form and verified against an independent rendering
with matching item order and content.

- Roach KE, Budiman-Mak E, Songsiridej N, Lertratanakul Y. Development of a shoulder pain and disability
  index. *Arthritis Care Res.* 1991;4(4):143-149.
- Williams JW Jr, Holleman DR Jr, Simel DL. Measuring shoulder function with the Shoulder Pain and
  Disability Index. *J Rheumatol.* 1995;22(4):727-732.
