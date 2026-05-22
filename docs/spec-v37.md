# spec-v37.md — Prehospital / ED stroke triage scales: CPSS and LAMS

> Status: proposed (2026-05-22). v37 is a narrow, two-tile spec
> that closes the prehospital and ED triage gap left in the
> stroke surface: Sophie already ships the bedside-severity
> NIHSS (`nihss`) and its telemedicine-collapsed companion
> mNIHSS (`mnihss`, spec-v29 wave 29-3a), but carries no
> triage-grade screen and no LVO-prediction scale. v37 adds
> CPSS (Kothari 1999) and LAMS (Llanes 2004; LVO threshold
> Nazliel 2008). No other spec rule is amended. The tiles ride
> under the spec-v11 audit floor and the spec-v12 §5 shipping
> contract.
>
> Catalog effect at v37 close: **244 + 2 = 246 tiles.**

## 1. Thesis

Sophie's stroke surface today is NIHSS-only: the bedside
severity scale a neuro-ICU or stroke-unit RN performs after the
stroke team has arrived. Two earlier, equally important nursing
decisions are missing:

1. **Triage screen.** An ED triage RN, urgent-care RN, or first
   responder needs a three-item screen at the door — "could this
   be a stroke?" — that drives stroke-pathway activation. CPSS
   is the standard. It is 30 seconds at the bedside (facial
   droop, arm drift, abnormal speech), each item binary. Any one
   abnormal item triggers stroke-pathway activation.
2. **LVO predictor.** Once a stroke is suspected, the next
   decision is destination: a primary stroke center for tPA, or
   a comprehensive / thrombectomy-capable center for an LVO
   (large-vessel occlusion). LAMS is the most-validated
   prehospital LVO predictor — three motor items, total 0-5,
   threshold ≥4 for LVO with sensitivity 81% and specificity 89%
   per Nazliel 2008. ED RNs and EMS use it routinely on every
   stroke alert at hospitals with a thrombectomy referral
   relationship.

Both scales pass the v29 §3 one-line test (input → computed
output), both are nurse / EMS bedside-actionable today, and both
are clinically distinct from NIHSS (which is performed after
arrival, by the stroke team, and does not return an LVO call).

## 2. What v37 adds (2 tiles)

### 2.1 `cpss` — Cincinnati Prehospital Stroke Scale (Kothari 1999)

- **Citation:** Kothari RU, Pancioli A, Liu T, Brott T, Broderick
  J. *Cincinnati Prehospital Stroke Scale: reproducibility and
  validity.* Ann Emerg Med. 1999;33(4):373-378.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-ed`, `nursing-general`,
  `emergency-medicine`, `neurology`, `paramedicine`,
  `family-medicine`.
- **Inputs:** three binary items (each integer 0 normal / 1
  abnormal):
  - facial droop (smile / show teeth)
  - arm drift (eyes closed, both arms extended 10 s)
  - abnormal speech (slurred, wrong words, or mute)
- **Output:** `abnormalCount` (0-3) and `positive` (boolean).
  Positive when any single item is abnormal, per Kothari 1999.

### 2.2 `lams` — Los Angeles Motor Scale (Llanes 2004; LVO threshold Nazliel 2008)

- **Citation:** Llanes JN, Kidwell CS, Starkman S, Leary MC,
  Eckstein M, Saver JL. *The Los Angeles Motor Scale (LAMS): a
  new measure to characterize stroke severity in the field.*
  Prehosp Emerg Care. 2004;8(1):46-50. LVO threshold: Nazliel B,
  Starkman S, Liebeskind DS, et al. *A brief prehospital stroke
  severity scale identifies ischemic stroke patients harboring
  persisting large arterial occlusions.* Stroke.
  2008;39(8):2264-2267.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-ed`, `nursing-icu`,
  `nursing-general`, `emergency-medicine`, `neurology`,
  `paramedicine`.
- **Inputs:** three integer motor items:
  - facial droop: 0 (absent) or 1 (present)
  - arm drift: 0 (absent), 1 (drift down), 2 (falls rapidly)
  - grip strength: 0 (normal), 1 (weak grip), 2 (no grip)
- **Output:** `score` (0-5) and `lvoLikely` (boolean). LVO-likely
  band fires at `score >= 4` per Nazliel 2008 (sensitivity 81%,
  specificity 89% in an acute stroke cohort).

## 3. Files touched

```
docs/spec-v37.md                         (this file)
app.js                                   (+2 UTILITIES rows)
lib/scoring-v4.js                        (+2 exports: cpss, lams)
lib/meta.js                              (+2 META[id] entries)
views/group-g.js                         (+2 renderers)
test/unit/cpss-lams.test.js              (new)
docs/audits/v11/cpss.md                  (new)
docs/audits/v11/lams.md                  (new)
docs/scope-mdcalc-parity.md              (catalog count 244 -> 246)
CHANGELOG.md                             (Unreleased: v37 entry)
README.md                                (catalog count 244 -> 246)
package.json                             (description count 244 -> 246)
```

## 4. Acceptance criteria

v37 is fully shipped when:

- This file exists.
- The two tiles in §2 are present: `META[id]` entries, ≥3
  boundary worked examples each in the test suite, primary
  citation visible inline, spec-v11 audit logs in
  `docs/audits/v11/`.
- `UTILITIES.length` is 246.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v37 with the catalog-count delta.

## 5. Out of scope for v37

- FAST-ED (Lima 2016) and RACE (Pérez de la Ossa 2014) — two
  other validated prehospital LVO predictors. They overlap
  substantially with LAMS and each adds gaze and aphasia /
  agnosia items that the bedside RN may not be trained on at
  triage. Candidates for a future spec if a maintainer's local
  EMS protocol calls for one of them.
- VAN (Vision Aphasia Neglect) — single-step LVO screen; less
  literature than LAMS. Candidate for a future spec.
- A combined "stroke triage dashboard" tile co-displaying CPSS,
  LAMS, and NIHSS. Each scale is validated against its own
  derivation; co-displaying them risks implying a workflow the
  literature does not endorse and conflates triage / severity /
  LVO-prediction surfaces that the bedside RN performs at
  different points in care.
- tPA / tenecteplase eligibility decision tile (AHA/ASA 2019).
  Distinct decision surface (time-from-onset, contraindication
  checklist, imaging). Out of scope for v37.
