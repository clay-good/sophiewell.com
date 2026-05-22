# spec-v38.md — Prehospital LVO predictor: RACE

> Status: proposed (2026-05-22). v38 is a narrow, single-tile
> spec that adds the RACE (Rapid Arterial oCclusion Evaluation)
> prehospital LVO-prediction scale named as a candidate in
> [spec-v37 §5](spec-v37.md). LAMS (Llanes 2004) already ships
> as the three-item motor LVO predictor; RACE is the five-item
> NIHSS-derived LVO predictor used in European stroke protocols
> and an increasing number of US systems. No other spec rule is
> amended.
>
> Catalog effect at v38 close: **246 + 1 = 247 tiles.**

## 1. Thesis

[spec-v37](spec-v37.md) shipped LAMS as the prehospital
LVO-prediction scale. LAMS is fast (three motor items, total
0-5) but does not capture gaze or aphasia/agnosia — two of the
strongest cortical signs for large-vessel occlusion. Several
stroke systems instead use RACE, which adds those signs at the
cost of two extra items. Validation literature is comparable in
quality:

- LAMS (Nazliel 2008): sensitivity 81% / specificity 89% at
  threshold ≥4.
- RACE (Pérez de la Ossa 2014): sensitivity 85% / specificity
  68% at threshold ≥5.

The choice between them is protocol-driven (the maintainer's
local EMS / stroke system specifies one), and the bedside RN /
EMS provider needs whichever their protocol calls for. Shipping
both lets Sophie cover the dominant US (LAMS) and EU/Catalan
(RACE) protocols without forcing a clinical-equivalence claim
between them.

RACE remains a triage tool — it does not classify stroke
severity for the bedside (that is NIHSS) and does not screen for
stroke presence (that is CPSS). It passes the v29 §3 one-line
test (5 integer inputs → computed total + LVO band).

## 2. What v38 adds (1 tile)

### 2.1 `race` — Rapid Arterial oCclusion Evaluation (Pérez de la Ossa 2014)

- **Citation:** Pérez de la Ossa N, Carrera D, Gorchs M, Querol
  M, Millán M, Gomis M, Dorado L, López-Cancio E,
  Hernández-Pérez M, Chicharro V, Escalada X, Jiménez X,
  Dávalos A. *Design and validation of a prehospital stroke
  scale to predict large arterial occlusion: the rapid arterial
  occlusion evaluation scale.* Stroke. 2014;45(1):87-91.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-ed`, `nursing-icu`,
  `nursing-general`, `emergency-medicine`, `neurology`,
  `paramedicine`.
- **Inputs:** five NIHSS-derived integer items:
  - facial palsy: 0 (absent), 1 (mild), 2 (moderate-severe)
  - arm motor function: 0 (normal/mild), 1 (moderate), 2
    (severe)
  - leg motor function: 0 (normal/mild), 1 (moderate), 2
    (severe)
  - head / gaze deviation: 0 (absent), 1 (present)
  - aphasia (if right hemiparesis) or agnosia (if left
    hemiparesis): 0 (normal), 1 (mild), 2 (severe)
- **Output:** `score` (0-9) and `lvoLikely` (boolean). LVO-likely
  band fires at `score >= 5` per Pérez de la Ossa 2014
  (sensitivity 85%, specificity 68% in the derivation cohort).

## 3. Files touched

```
docs/spec-v38.md                         (this file)
app.js                                   (+1 UTILITIES row)
lib/scoring-v4.js                        (+1 export: race)
lib/meta.js                              (+1 META[id] entry)
views/group-g.js                         (+1 renderer)
test/unit/race.test.js                   (new)
docs/audits/v11/race.md                  (new)
docs/scope-mdcalc-parity.md              (catalog count 246 -> 247)
CHANGELOG.md                             (Unreleased: v38 entry)
README.md                                (catalog count 246 -> 247)
package.json                             (description count 246 -> 247)
```

## 4. Acceptance criteria

v38 is fully shipped when:

- This file exists.
- The tile in §2 is present: `META[id]` entry, ≥3 boundary
  worked examples in the test suite, primary citation visible
  inline, spec-v11 audit log in `docs/audits/v11/`.
- `UTILITIES.length` is 247.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v38 with the catalog-count delta.

## 5. Out of scope for v38

- FAST-ED (Lima 2016) — also an LVO predictor (6 items) named in
  [spec-v37 §5](spec-v37.md). Adds limited new signal beyond
  RACE and LAMS for most US protocols; candidate for a future
  spec if a maintainer's local protocol calls for it
  specifically.
- VAN (Vision Aphasia Neglect) — single-step LVO screen with
  weaker validation literature than RACE / LAMS. Candidate for a
  future spec.
- A combined "stroke triage dashboard" co-displaying CPSS, LAMS,
  RACE, and NIHSS — same rationale as [spec-v37 §5](spec-v37.md):
  each scale is validated against its own derivation; co-display
  risks implying a workflow the literature does not endorse.
- tPA / tenecteplase eligibility tile (AHA/ASA 2019). Distinct
  decision surface; out of scope.
