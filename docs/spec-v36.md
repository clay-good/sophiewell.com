# spec-v36.md — Maternal track-and-trigger: MEOWS

> Status: proposed (2026-05-22). v36 is a narrow, single-tile
> spec that closes the maternal-warning gap left by the
> NEWS2/MEWS surface (spec-v13) by shipping MEOWS, the Modified
> Early Obstetric Warning System validated in Singh 2012. It
> does not amend any other spec rule and rides under the
> spec-v11 audit floor and the spec-v12 §5 shipping contract.
>
> Catalog effect at v36 close: **243 + 1 = 244 tiles.**

## 1. Thesis

The obstetric bedside is the one place on a hospital ward where
NEWS2 underperforms — the physiology of late pregnancy and the
peripartum period shifts the threshold for tachycardia,
hypotension, and tachypnea enough that a chart built for the
general adult ward will miss early maternal deterioration. The
CEMACH 2007 confidential enquiry into maternal deaths
recommended a *modified* early obstetric warning system, and the
Singh 2012 validation study at Northwick Park Hospital
established the track-and-trigger thresholds in routine use
across NHS maternity units today. ACOG's 2019 committee opinion
on severe maternal morbidity endorses the same idea.

Sophie already ships APGAR, Bishop, ACOG severe-feature
preeclampsia, and HELLP for the obstetric surface, plus NEWS2
and MEWS for the general adult bedside. None of these covers
the routine maternal vitals chart. An OB nurse who is plotting
maternal vitals on a paper MEOWS chart today should be able to
key the same numbers into Sophie and get the same trigger
decision.

MEOWS is a track-and-trigger chart, not an aggregate-sum score:
each vital sign falls into a *normal*, *yellow*, or *red* band
per Singh 2012 Table 1, and the trigger fires when **any single
red parameter** or **two or more yellow parameters** are
present. That binary trigger is what the bedside nurse acts on
— it passes the v29 §3 one-line test.

## 2. What v36 adds (1 tile)

### 2.1 `meows` — Modified Early Obstetric Warning System (Singh 2012)

- **Citation:** Singh A, McGlennan A, England A, Simons R. *A
  validation study of the CEMACH recommended modified early
  obstetric warning system (MEOWS).* Anaesthesia
  2012;67(1):12-18.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-ob`, `nursing-general`,
  `obstetrics`, `anesthesiology`, `emergency-medicine`,
  `family-medicine`.
- **Inputs:** eight maternal observations — respiratory rate
  (/min), SpO2 (%), temperature (°C), systolic BP (mmHg),
  diastolic BP (mmHg), heart rate (/min), neurological
  response (AVPU), pain score (0-3).
- **Per-parameter bands (Singh 2012 Table 1):**
  - Respiratory rate: red <10 or >30; yellow 21-30; else normal.
  - SpO2: red <95%; else normal.
  - Temperature: red <35 or >38; yellow 35-36; else normal.
  - Systolic BP: red <90 or >160; yellow 150-160 or 90-100;
    else normal.
  - Diastolic BP: red >100; yellow 90-100; else normal.
  - Heart rate: red <40 or >120; yellow 100-120 or 40-50; else
    normal.
  - Neurological response: red P or U (responds to pain or
    unresponsive); yellow V (responds to voice); else normal (A).
  - Pain score: yellow 2-3; else normal.
- **Trigger:** activate the obstetric MEOWS response when
  **any one red** or **two or more yellow** parameters are
  flagged, per Singh 2012.

## 3. Files touched

```
docs/spec-v36.md                         (this file)
app.js                                   (+1 UTILITIES row)
lib/scoring-v4.js                        (+1 export: meows)
lib/meta.js                              (+1 META[id] entry)
views/group-g.js                         (+1 renderer)
test/unit/meows.test.js                  (new)
docs/audits/v11/meows.md                 (new)
docs/scope-mdcalc-parity.md              (catalog count 243 -> 244)
CHANGELOG.md                             (Unreleased: v36 entry)
README.md                                (catalog count 243 -> 244)
package.json                             (description count 243 -> 244)
```

## 4. Acceptance criteria

v36 is fully shipped when:

- This file exists.
- The tile in §2 is present: `META[id]` entry, ≥3 boundary
  worked examples in the test suite, primary citation visible
  inline, spec-v11 audit log in `docs/audits/v11/`.
- `UTILITIES.length` is 244.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v36 with the catalog-count delta.

## 5. Out of scope for v36

- The full CMQCC Maternal Early Warning Criteria (MEWC; Mhyre
  2014) as a separate tile — overlaps substantially with MEOWS
  and uses different cutoffs; candidate for a future spec if
  side-by-side use proves necessary at the bedside.
- The Maternal Early Warning Trigger tool (MEWT; Shields 2016)
  — incorporates etiology-specific triggers (sepsis, hemorrhage,
  hypertension, cardiopulmonary) that go beyond a vitals
  track-and-trigger; out of scope as a single-tile calculator.
- Fetal heart rate categorization (NICHD Category I/II/III) —
  a separate clinical surface (intrapartum fetal monitoring),
  not maternal vitals; out of scope for v36.
- A combined "obstetric vitals dashboard" tile co-displaying
  MEOWS with HELLP or ACOG severe-feature criteria. Each scale
  is validated against its own derivation; co-displaying them
  risks implying a workflow the literature does not endorse.
