# spec-v71.md — Make the `psi` Risk Class I reachable (Fine 1997 Step 1: age ≤50 with no points beyond age)

> Status: **IMPLEMENTED (2026-06-12). Catalog unchanged at 337.**
> A correctness completion, not a new tile. The `psi` (Pneumonia Severity
> Index / PORT) calculator ([`lib/scoring-v4.js`](../lib/scoring-v4.js) `psi()`)
> assigned **Risk Class I** with the guard `age <= 50 && pts === 0` — but the
> first scoring step always adds the **age** contribution (`pts += age` for men,
> `age − 10` for women), so `pts === 0` could only hold for a female aged ≤10,
> never a real community-acquired-pneumonia patient. Class I was therefore
> **unreachable**, and every textbook Class I patient (young, no comorbidity, no
> exam abnormality) was mislabeled Class II. v71 implements Class I as
> `age <= 50 && pts === agePoints` (no points *beyond* the age contribution),
> the Fine 1997 Step 1 screen the tile's own [audit](audits/v11/psi.md) already
> documents. The renderer is unchanged. Every prior spec (v4 through v70) remains
> in force; v71 adds no runtime network call, no AI, and no new tile.

## 1. Thesis

PSI is a **two-step** rule (Fine MJ, et al. N Engl J Med 1997;336(4):243-250,
Figure 1). **Step 1** is a pre-screen: a patient aged ≤50 with none of the five
comorbidities (neoplasm, CHF, cerebrovascular, renal, liver disease) and none of
the five exam abnormalities (altered mental status, pulse ≥125, RR ≥30, SBP <90,
temp <35 or ≥40 °C) is **Risk Class I** (0.1% 30-day mortality) — the lowest-risk
group, managed outpatient without further work-up. **Step 2** point-scores
everyone who fails Step 1 into Classes II–V.

The tile implemented Step 2 perfectly but encoded the Step 1 short-circuit as
`pts === 0`. Because age is the first thing added to `pts`, that test is
unsatisfiable for any real patient: a healthy 30-year-old man scores 30 points
(from age alone) and fell through to "Class II". The result was that the entire
Class I band — the headline output of the whole rule, the "this patient is safe
for home" answer — never appeared. The tile's committed v11 audit even lists
"Age 50, male, no comorbidities → Class I" as expected behavior, and a unit test
was named "30yo healthy male → Class I" while its assertion quietly accepted the
wrong Class II answer. Code, audit, and test all disagreed; the code was wrong.

This is the same class as [spec-v68](spec-v68.md) (align `ttkg` to its own
documented threshold) and [spec-v70](spec-v70.md) (honor a printed band the
branch logic didn't enforce): an existing compute whose interpretation logic
diverged from its own cited source and committed audit, fixable with pure
threshold logic over the existing inputs.

## 2. The change

### `psi` — Class I = age ≤50 with no points beyond the age contribution

```
agePoints = (sex === 'F') ? max(0, age − 10) : age        (the Step-2 age term, captured)
pts       = agePoints + every other Fine 1997 point        (unchanged)

  age <= 50 && pts === agePoints   → Class I    (was: age <= 50 && pts === 0, unreachable)
  pts <= 70                        → Class II    (unchanged)
  pts <= 90                        → Class III   (unchanged)
  pts <= 130                       → Class IV    (unchanged)
  else                             → Class V     (unchanged)
```

`pts === agePoints` means **no risk factor contributed any points** — no
comorbidity, no exam abnormality, no abnormal entered lab, no nursing-home stay.
Combined with `age <= 50` (checked against the *raw* age, not the female-adjusted
value, per Fine 1997), this is exactly Step 1. Classes II–V and every point
assignment are byte-for-byte unchanged.

- **Safety direction:** the screen is conservative. Any entered risk factor —
  including an abnormal lab or nursing-home residence, which the strict Step 1
  pre-screen technically omits — routes the patient to point scoring rather than
  Class I, so the rule can **never under-triage** a patient with a concerning
  finding into the 0.1%-mortality band. (Over-triaging a true Class I patient to
  Class II is harmless: both are outpatient dispositions.)
- **Citation:** none added. The Step 1 criteria are the ones the tile's META
  citation (Fine 1997) and its v11 audit already name; this is a self-consistency
  fix, not a new clinical judgment.
- **Group / audiences / specialties / inputs / output shape:** unchanged. The
  same `{ score, band }` is returned; only the band selection for the lowest-risk
  zone changes. The renderer ([`views/group-g.js`](../views/group-g.js)) needs no
  edit.

## 3. Robustness

- The compute stays pure. The change captures the existing age term in a local
  (`agePoints`) and compares against it; it introduces no new input, no new
  branch beyond the relabeled Class I, and no non-finite path (the comparison is
  over the same numbers the function already summed).
- No output that existed before v71 changes for any patient who was already
  Class II–V: only patients who pass Step 1 (age ≤50, zero non-age points) move
  from the incorrect "Class II" to the correct "Class I". The META example
  (age 70, male, RR ≥30 → 90 points → Class III) and the Class V audit example
  render identically.
- The compute is covered by the [spec-v59](spec-v59.md) fuzz harness
  (scoring-v4.js already enrolled) with zero non-finite leaks.

## 4. Files touched

```
docs/spec-v71.md            (this file)
lib/scoring-v4.js           (psi: capture agePoints; Class I = pts === agePoints + comment)
docs/audits/v11/psi.md      (spec-v11 re-audit: Class I reachable; corrected the stale "0 points" arithmetic)
test/unit/scoring-v4.test.js (fix the mis-named Class I test; +2 tests: age 50/51 boundary, risk-factor routes out of Class I)
README.md                   (intro spec-progression + spec range -> v71)
CHANGELOG.md                (Unreleased: v71 entry, +0 catalog delta)
```

## 5. Acceptance criteria

- `psi({ age: 30, sex: 'M' })` returns Class I (was Class II); `psi({ age: 50,
  sex: 'M' })` is Class I and `psi({ age: 51, sex: 'M' })` is Class II.
- `psi()` with age ≤50 plus any comorbidity, exam abnormality, abnormal lab, or
  nursing-home stay returns Class II or higher — never Class I.
- The META example (age 70, male, RR ≥30) still renders "PSI 90 - Class III"; the
  Class V audit example is unchanged; the female −10 age transform and every
  point assignment are byte-for-byte identical.
- `UTILITIES.length` is still **337** (no new tile); all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) remain in agreement.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v71 with a +0 catalog delta.

## 6. Out of scope for v71

- **No age-range guard added.** PSI is validated in adults; the renderer prefills
  age and reads a blank field as a number, so a non-entry does not reach a
  non-finite branch. v71 fixes the Class I logic only and does not change the
  input contract.
- **No post-2016 disposition integration.** The tile remains the original Fine
  1997 derivation (as its META advisory already states); v71 does not add the
  ATS/IDSA ICU-admission overlay.
- **No new input, no new tile, no change to any other tile's output.**
