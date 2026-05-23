# spec-v40.md — Post-stroke bedside dysphagia screen: GUSS

> Status: proposed (2026-05-22). v40 is a narrow, single-tile
> spec that adds the Gugging Swallowing Screen (GUSS; Trapl
> 2007) named as a candidate in [spec-v39 §5](spec-v39.md).
> GUSS is the bedside nurse-administered dysphagia screen that
> stands between an acute-stroke patient and their first oral
> intake; it gates aspiration-pneumonia risk before the unit RN
> hands a patient a glass of water. No other spec rule is
> amended.
>
> Catalog effect at v40 close: **248 + 1 = 249 tiles.**

## 1. Thesis

Sophie now ships a full bedside cerebrovascular recognition →
severity → LVO surface (CPSS v37, ROSIER v39, NIHSS / mNIHSS,
LAMS v37, RACE v38). The next decision after recognition and
severity is *aspiration risk*: can this patient swallow safely?
The literature is unambiguous — every acute-stroke patient
should have a bedside dysphagia screen before any oral intake
(AHA/ASA 2018 §6.3), with the goal of preventing the
stroke-associated aspiration pneumonia that drives a sizable
share of stroke-unit length-of-stay and 90-day mortality.

GUSS (Trapl 2007) is the most-validated nurse-administered
bedside dysphagia screen at acute stroke onset. It is two-stage:

1. **Preliminary (indirect swallowing test)** — five items
   covering vigilance, voluntary cough/throat-clear, and a
   saliva swallow (swallow itself, drooling, voice change).
   Total 0-5. The patient **must score 5** to proceed to stage 2.
2. **Direct swallowing test** — three subtests at increasing
   consistency (semisolid → liquid → solid), each 0-5
   (deglutition 0-2 + involuntary cough 0-1 + drooling 0-1 +
   voice change 0-1). The patient **must score 5** on each
   subtest to advance to the next consistency.

Total 0-20 with the gating rule enforced. Per Trapl 2007 Table
3 banding:

- 20: slight / no dysphagia, minimal aspiration risk — normal
  diet.
- 15-19: slight dysphagia, low aspiration risk — dysphagia diet,
  SLP evaluation.
- 10-14: moderate dysphagia, aspiration risk — semisolid only,
  NPO liquids, urgent SLP / FEES.
- 0-9: severe dysphagia, high aspiration risk — NPO, NG/PEG,
  urgent SLP evaluation.

GUSS is the bedside RN's tile. It passes the v29 §3 one-line
test (input items → computed total + band) and is in routine use
at stroke units worldwide.

## 2. What v40 adds (1 tile)

### 2.1 `guss` — Gugging Swallowing Screen (Trapl 2007)

- **Citation:** Trapl M, Enderle P, Nowotny M, Teuschl Y, Matz K,
  Dachenhausen A, Brainin M. *Dysphagia bedside screening for
  acute-stroke patients: the Gugging Swallowing Screen.* Stroke.
  2007;38(11):2948-2952.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-icu`, `nursing-ed`,
  `nursing-general`, `neurology`, `emergency-medicine`,
  `speech-language-pathology`, `family-medicine`.
- **Inputs:** the 17 binary / ternary items on the published
  GUSS form:
  - Preliminary (each 0 / 1): vigilance, voluntary
    cough/throat-clear, saliva swallow successful, no drooling,
    no voice change.
  - Semisolid / liquid / solid subtests (each):
    - deglutition (0 not possible / 1 delayed / 2 successful)
    - no involuntary cough (0 / 1)
    - no drooling (0 / 1)
    - no voice change (0 / 1)
- **Gating rules per Trapl 2007:**
  - Stage 1 < 5 → stage 2 is not performed; total = stage 1.
  - Semisolid < 5 → liquid and solid are not performed; total =
    stage 1 + semisolid.
  - Liquid < 5 → solid is not performed; total = stage 1 +
    semisolid + liquid.
  - Solid completed → total = stage 1 + semisolid + liquid +
    solid (max 20).
- **Output:** `score` (0-20), per-stage subtotals, the Trapl 2007
  band, and a `gated` array naming subtests skipped by the
  gating rules.

## 3. Files touched

```
docs/spec-v40.md                         (this file)
app.js                                   (+1 UTILITIES row)
lib/scoring-v4.js                        (+1 export: guss)
lib/meta.js                              (+1 META[id] entry)
views/group-g.js                         (+1 renderer)
test/unit/guss.test.js                   (new)
docs/audits/v11/guss.md                  (new)
docs/scope-mdcalc-parity.md              (catalog count 248 -> 249)
CHANGELOG.md                             (Unreleased: v40 entry)
README.md                                (catalog count 248 -> 249)
package.json                             (description count 248 -> 249)
```

## 4. Acceptance criteria

v40 is fully shipped when:

- This file exists.
- The tile in §2 is present: `META[id]` entry, ≥3 boundary
  worked examples in the test suite (including at least one
  worked example per gating rule), primary citation visible
  inline, spec-v11 audit log in `docs/audits/v11/`.
- `UTILITIES.length` is 249.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v40 with the catalog-count delta.

## 5. Out of scope for v40

- Yale Swallow Protocol (Suiter 2008) — alternative bedside
  dysphagia screen (3 ounces water + cognition + oral-motor).
  Overlapping clinical use with GUSS. Candidate for a future
  spec if both prove necessary side-by-side.
- 3-Ounce Water Test (DePippo 1992) alone — less specific than
  GUSS or Yale; out of scope.
- TOR-BSST (Toronto Bedside Swallowing Screening Test;
  Martino 2009) — alternative bedside screen with a clinician-
  certification dependency that is not Sophie-shaped. Out of
  scope.
- FEES / VFSS (Fiberoptic Endoscopic Evaluation of Swallowing /
  Videofluoroscopic Swallow Study) — instrumented exams
  performed by SLP / radiology, not bedside RN computation. Out
  of scope.
- A diet-order generator from the GUSS band — depends on local
  formulary and pharmacy/SLP collaboration; the GUSS band is one
  input to that decision, not the decision itself. Out of scope.
