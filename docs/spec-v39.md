# spec-v39.md — ED stroke recognition with mimic discrimination: ROSIER

> Status: proposed (2026-05-22). v39 is a narrow, single-tile
> spec that closes a recognition-stage gap in the cerebrovascular
> surface. CPSS (spec-v37) is a sensitive but non-specific
> triage screen; NIHSS is a post-recognition severity score;
> LAMS / RACE (spec-v37 / spec-v38) are LVO predictors that
> assume a stroke. ROSIER is the validated ED instrument for
> distinguishing real stroke from stroke mimic (seizure,
> syncope) at the recognition step. No other spec rule is
> amended.
>
> Catalog effect at v39 close: **247 + 1 = 248 tiles.**

## 1. Thesis

CPSS is sensitive — it triggers on any one of three abnormal
items — but it is non-specific: post-ictal Todd's paresis,
syncope with focal neurology, and migraine-with-aura all flip
CPSS positive. The ED RN performing recognition needs an
instrument that subtracts points for the two most common stroke
*mimics* (seizure activity and a syncope-pattern loss of
consciousness) and adds points for the focal-deficit items that
distinguish a real stroke. ROSIER is that instrument.

Nor 2005 derived ROSIER on 343 ED patients and validated it on a
prospective cohort: at threshold >0 it reaches sensitivity 93%
and specificity 83% for any stroke. It is in routine ED use at
UK stroke centers and increasingly in US ED triage protocols.
Crucially, it is performed by an ED RN at the door using
30-second history-taking and a 30-second neuro exam — it passes
the v29 §3 one-line test and is bedside-actionable on shift.

ROSIER is a recognition tool, not a triage screen (that is
[CPSS](spec-v37.md)), not a severity score (that is NIHSS), and
not an LVO predictor (those are [LAMS](spec-v37.md) and
[RACE](spec-v38.md)). The four scales answer four different
bedside questions in sequence.

## 2. What v39 adds (1 tile)

### 2.1 `rosier` — Recognition of Stroke in the Emergency Room (Nor 2005)

- **Citation:** Nor AM, Davis J, Sen B, Shipsey D, Louw SJ,
  Dyker AG, Davis M, Ford GA. *The Recognition of Stroke in the
  Emergency Room (ROSIER) scale: development and validation of a
  stroke recognition instrument.* Lancet Neurol.
  2005;4(11):727-734.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-ed`, `nursing-general`,
  `emergency-medicine`, `neurology`, `family-medicine`.
- **Inputs:** seven binary clinical items per Nor 2005:
  - loss of consciousness / syncope: **−1** if present
  - seizure activity: **−1** if present
  - new acute asymmetric facial weakness: **+1** if present
  - new acute asymmetric arm weakness: **+1** if present
  - new acute asymmetric leg weakness: **+1** if present
  - speech disturbance: **+1** if present
  - visual field defect: **+1** if present
- **Output:** total `score` (range −2 to +5) and a boolean
  `strokeLikely`. Per Nor 2005, `score > 0` indicates stroke is
  likely (sensitivity 93%, specificity 83% in the derivation
  cohort). A score of 0 or less is classified by Nor 2005 as
  "low probability of stroke" — the ED workup should look for a
  mimic but stroke is not fully excluded.

## 3. Files touched

```
docs/spec-v39.md                         (this file)
app.js                                   (+1 UTILITIES row)
lib/scoring-v4.js                        (+1 export: rosier)
lib/meta.js                              (+1 META[id] entry)
views/group-g.js                         (+1 renderer)
test/unit/rosier.test.js                 (new)
docs/audits/v11/rosier.md                (new)
docs/scope-mdcalc-parity.md              (catalog count 247 -> 248)
CHANGELOG.md                             (Unreleased: v39 entry)
README.md                                (catalog count 247 -> 248)
package.json                             (description count 247 -> 248)
```

## 4. Acceptance criteria

v39 is fully shipped when:

- This file exists.
- The tile in §2 is present: `META[id]` entry, ≥3 boundary
  worked examples in the test suite, primary citation visible
  inline, spec-v11 audit log in `docs/audits/v11/`.
- `UTILITIES.length` is 248.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v39 with the catalog-count delta.

## 5. Out of scope for v39

- FAST-ED (Lima 2016) — LVO predictor named in
  [spec-v37 §5](spec-v37.md). Overlaps with LAMS and RACE.
  Candidate for a future spec if a maintainer's local protocol
  calls for it.
- VAN (Vision Aphasia Neglect) — single-step LVO screen with
  weaker validation literature than RACE / LAMS. Candidate for a
  future spec.
- Gugging Swallowing Screen (GUSS; Trapl 2007) — post-stroke
  nurse-administered bedside dysphagia screen. Clinically
  important (aspiration-pneumonia prevention) but a different
  decision surface (post-recognition, not recognition).
  Candidate for a future spec.
- LAPSS (Los Angeles Prehospital Stroke Screen) — older
  prehospital screen largely superseded by CPSS in US protocols.
  Out of scope.
