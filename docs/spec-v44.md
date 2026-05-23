# spec-v44.md — Rehab-nursing ADL with weighted scoring: Barthel Index

> Status: proposed (2026-05-22). v44 is a narrow, single-tile
> spec that adds the Barthel Index (Mahoney & Barthel 1965)
> named as a candidate in [spec-v42 §5](spec-v42.md) and
> [spec-v43 §5](spec-v43.md). Sophie's discharge-planning
> surface now ships Katz ADL (v42, 6 binary basic-ADL items)
> and Lawton IADL (v43, 8 binary instrumental-ADL items);
> Barthel is the granular weighted ADL used in inpatient stroke
> rehab and post-acute nursing. No other spec rule is amended.
>
> Catalog effect at v44 close: **252 + 1 = 253 tiles.**

## 1. Thesis

Katz and Lawton are the right tools at the hospital-to-home
transition because they are binary and 60-second-fast. Inpatient
rehab nursing needs a more granular instrument: a patient who
needs minor help with transfers is meaningfully different from
one who needs major help, and a Katz score collapses both into
"dependent." Barthel is that granular instrument — 10 items
with weighted 0/5/10/15-point increments, total 0-100, used
serially over a rehab admission to track progress.

Barthel is the standard outcome measure in inpatient stroke
rehab (NIH StrokeNet, AHRQ rehab quality measures), post-
acute SNF nursing, and inpatient PM&R. The 5-point increments
let the bedside RN, PT, OT, and rehab MD speak a common
language about week-over-week functional gain ("his Barthel
went from 35 to 55 this week — mostly transfers and stairs").

The Shah 1989 banding (the modern reference) divides 0-100 into
five bands: 0-20 total dependency, 21-60 severe, 61-90 moderate,
91-99 slight, 100 independent. The bands map to staffing
intensity at the bedside (1:1 vs. 1:4 ratios in many SNFs) and
to discharge-readiness decisions.

Barthel is a measurement, not a screening trigger — it does not
fire stroke alerts, recommend a disposition, or auto-stage a
diet. The score and the band are the bedside RN's hand-off
shorthand.

## 2. What v44 adds (1 tile)

### 2.1 `barthel` — Barthel Index of ADL (Mahoney & Barthel 1965)

- **Citation:** Mahoney FI, Barthel DW. *Functional evaluation:
  the Barthel Index.* Md State Med J. 1965;14:61-65. Severity
  banding: Shah S, Vanclay F, Cooper B. *Improving the
  sensitivity of the Barthel Index for stroke rehabilitation.*
  J Clin Epidemiol. 1989;42(8):703-709.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-floor`, `nursing-rehab`,
  `nursing-general`, `physical-therapy`,
  `occupational-therapy`, `physical-medicine-rehabilitation`,
  `geriatrics`, `case-management`.
- **Inputs:** ten weighted ADL items per Mahoney 1965:
  - feeding (0 unable / 5 needs help / 10 independent)
  - bathing (0 dependent / 5 independent)
  - grooming (0 needs help / 5 independent)
  - dressing (0 dependent / 5 needs help / 10 independent)
  - bowel control (0 incontinent / 5 occasional accident / 10
    continent)
  - bladder control (0 incontinent / 5 occasional accident / 10
    continent)
  - toilet use (0 dependent / 5 needs help / 10 independent)
  - transfers, bed-to-chair (0 unable / 5 major help / 10 minor
    help / 15 independent)
  - mobility on level surfaces (0 immobile / 5 wheelchair
    independent / 10 walks with help / 15 walks independently)
  - stairs (0 unable / 5 needs help / 10 independent)
- **Output:** total `score` (0-100, multiple of 5), `parts`, and
  the Shah 1989 band:
  - **100** — independent.
  - **91-99** — slight dependency.
  - **61-90** — moderate dependency.
  - **21-60** — severe dependency.
  - **0-20** — total dependency.

## 3. Files touched

```
docs/spec-v44.md                         (this file)
app.js                                   (+1 UTILITIES row)
lib/scoring-v4.js                        (+1 export: barthel)
lib/meta.js                              (+1 META[id] entry)
views/group-g.js                         (+1 renderer)
test/unit/barthel.test.js                (new)
docs/audits/v11/barthel.md               (new)
docs/scope-mdcalc-parity.md              (catalog count 252 -> 253)
CHANGELOG.md                             (Unreleased: v44 entry)
README.md                                (catalog count 252 -> 253)
package.json                             (description count 252 -> 253)
```

## 4. Acceptance criteria

v44 is fully shipped when:

- This file exists.
- The tile in §2 is present: `META[id]` entry, ≥3 boundary
  worked examples in the test suite, primary citation visible
  inline, spec-v11 audit log in `docs/audits/v11/`.
- `UTILITIES.length` is 253.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v44 with the catalog-count delta.

## 5. Out of scope for v44

- Modified Barthel Index (Granger 1979) with 0-5-10-15-20 per
  item and a 0-100 total at finer granularity. Less widely used
  than the Mahoney/Shah form; candidate for a future spec if a
  maintainer's rehab unit uses Granger's variant.
- FIM (Functional Independence Measure) — 18-item weighted ADL
  used in inpatient rehab; copyrighted with a formal
  certification requirement that is not Sophie-shaped. Out of
  scope (already documented in [spec-v42 §5](spec-v42.md)).
- A combined "Katz + Lawton + Barthel dashboard" tile —
  co-display is fine but an auto-disposition tile depends on
  factors outside the three scales (social support, prior
  baseline, local SNF availability). Out of scope.
- A "weekly delta" tile that subtracts two Barthel scores —
  trivial subtraction that does not pass the v29 §3 one-line
  test as a new tile. Out of scope.
