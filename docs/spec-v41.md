# spec-v41.md — ICU coma scale for intubated patients: FOUR Score

> Status: proposed (2026-05-22). v41 is a narrow, single-tile
> spec that closes a meaningful gap in Sophie's bedside-neuro
> surface: GCS — already shipped via the v3 GCS tile — is the
> default coma scale for the bedside, but a sizable share of
> neuro-ICU patients are intubated or chemically sedated and the
> GCS verbal component (V) is unavailable. The FOUR Score
> (Wijdicks 2005) was designed for exactly this surface and is
> the validated ICU coma scale for intubated and severely
> obtunded patients. No other spec rule is amended.
>
> Catalog effect at v41 close: **249 + 1 = 250 tiles.**

## 1. Thesis

GCS is the universal coma scale at the bedside, but it has two
well-known weak spots in the ICU:

1. **Intubated patients.** The verbal (V) component is
   unscoreable; the conventional workaround is the "Vt" suffix
   (e.g., GCS 7T), which preserves the score with a verbal=1 but
   does not capture the airway-protection signal the bedside
   nurse needs to communicate.
2. **Brainstem function.** GCS does not assess pupillary or
   corneal reflexes, so a patient with a fixed dilated pupil and
   the same motor / eye pattern as a less-injured patient
   receives the same GCS — losing critical prognostic signal.

FOUR Score (Wijdicks 2005) addresses both. It is four 0-4
ordinal items — eye response, motor response, brainstem
reflexes, and respiration pattern — summing to 0-16. The verbal
component is omitted; brainstem reflexes are scored; and the
respiration component captures whether the patient is intubated
and whether they are over-breathing the ventilator. Validation
across multiple ICU cohorts demonstrates equivalent or superior
inter-rater reliability vs. GCS and superior prognostic
discrimination at the very-low-GCS end (where the GCS floor of
3 conflates multiple distinct neurologic states).

A CCRN, neuro-ICU RN, or trauma-ICU RN at the bedside uses FOUR
Score multiple times per shift today; it is the de-facto
language on neuro-ICU rounds at academic centers and is one of
the metrics in the AAN brain-death determination guidance for
ruling out confounders. It passes the v29 §3 one-line test
(four integer inputs → computed total + textual interpretation)
and is nurse-bedside-actionable on shift.

## 2. What v41 adds (1 tile)

### 2.1 `four-score` — Full Outline of UnResponsiveness (Wijdicks 2005)

- **Citation:** Wijdicks EFM, Bamlet WR, Maramattom BV, Manno
  EM, McClelland RL. *Validation of a new coma scale: The FOUR
  score.* Ann Neurol. 2005;58(4):585-593.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-icu`, `nursing-general`,
  `neurology`, `critical-care`, `emergency-medicine`,
  `family-medicine`.
- **Inputs:** four integer ordinal items each 0-4 per Wijdicks
  2005:
  - **E**ye response: 4 tracking/blinking-to-command; 3 open,
    not tracking; 2 closed, opens to loud voice; 1 closed, opens
    to pain; 0 remains closed with pain.
  - **M**otor response: 4 thumbs-up/fist/peace-sign to command;
    3 localizing to pain; 2 flexion to pain; 1 extensor
    posturing; 0 no response or generalized myoclonus status.
  - **B**rainstem reflexes: 4 pupil and corneal both present; 3
    one pupil wide and fixed; 2 pupil OR corneal absent; 1 pupil
    AND corneal absent; 0 absent pupil, corneal, AND cough.
  - **R**espiration: 4 not intubated, regular pattern; 3 not
    intubated, Cheyne-Stokes; 2 not intubated, irregular; 1
    intubated, breathes above ventilator rate; 0 intubated, at
    vent rate or apnea.
- **Output:** total `score` (0-16) and per-component `parts`.
  The FOUR is a *measurement* — there is no banded risk
  classification in Wijdicks 2005. v41 surfaces two
  clinically-anchored notes from Wijdicks 2005:
  - score = 16 → "All four components maximal."
  - score = 0 → "All four components absent — consistent with
    very poor prognosis; the FOUR-=-0 pattern is part of the AAN
    brain-death determination workup as a screen for confounders
    per Wijdicks 2010 AAN guidance."
- **No prognostic automation.** v41 does not predict mortality,
  rehab potential, or brain death; those are downstream clinical
  decisions that depend on etiology, time-course, and imaging
  outside the FOUR Score itself.

## 3. Files touched

```
docs/spec-v41.md                         (this file)
app.js                                   (+1 UTILITIES row)
lib/scoring-v4.js                        (+1 export: fourScore)
lib/meta.js                              (+1 META[id] entry)
views/group-g.js                         (+1 renderer)
test/unit/four-score.test.js             (new)
docs/audits/v11/four-score.md            (new)
docs/scope-mdcalc-parity.md              (catalog count 249 -> 250)
CHANGELOG.md                             (Unreleased: v41 entry)
README.md                                (catalog count 249 -> 250)
package.json                             (description count 249 -> 250)
```

## 4. Acceptance criteria

v41 is fully shipped when:

- This file exists.
- The tile in §2 is present: `META[id]` entry, ≥3 boundary
  worked examples in the test suite, primary citation visible
  inline, spec-v11 audit log in `docs/audits/v11/`.
- `UTILITIES.length` is 250.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v41 with the catalog-count delta.

## 5. Out of scope for v41

- A mortality-prediction tile from the FOUR Score band — the
  literature ties FOUR to outcome at multiple endpoints
  (in-hospital mortality, 6-month mRS, etc.) but the regression
  coefficients are cohort-specific and not a published
  deterministic formula. Out of scope.
- A combined "GCS + FOUR Score" comparison tile — each scale is
  validated against its own derivation; co-display risks
  implying clinical equivalence beyond what the literature
  endorses. Out of scope.
- Brain-death determination workflow per AAN 2010 — a distinct,
  attending-physician-driven decision surface with prerequisite
  exclusions (sedation, temperature, electrolytes) far beyond a
  single bedside score. Out of scope.
- Pediatric FOUR Score (Cohen 2009) — separate validation cohort
  with different respiration anchors. Candidate for a future
  spec if pediatric neuro-ICU prove a primary audience.
