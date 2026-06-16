# spec-v90.md — Cardiology computations & ECG: QRS axis, LVH voltage criteria, TIMI-STEMI, Duke treadmill, cardiac power, and aortic valve area (+6 tiles)

> Status: **SHIPPED (2026-06-16).** First feature spec of **Wave 2** of the
> [spec-v85](spec-v85.md) Advanced Clinical Calculators program. Adds **6**
> deterministic cardiology computations that fill confirmed gaps in the catalog's
> cardiology/ECG surface: the mean frontal-plane QRS axis off the 12-lead, the two
> standard ECG LVH voltage criteria, the TIMI risk score for STEMI, the Duke
> treadmill score, cardiac power output, and aortic valve area by the continuity
> equation. The catalog ships `qtc-suite` (E), `sgarbossa` (G), and `map` (E), and
> the [spec-v87](spec-v87.md) hemodynamics, but none of these six. None duplicates
> an existing tile.
>
> Catalog effect at v90 close: **379 + 6 = 385 tiles.**
>
> Every prior spec (v4 through v89) remains in force. v90 adds no runtime network
> call and no AI; each tile obeys the [spec-v85](spec-v85.md) §2 doctrine, passes
> the [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md) output-safety
> contract. As the **first Wave-2 spec**, v90 also AUTHORS the proposed
> `scripts/check-citation-cadence.mjs` monthly staleness-cadence CI job described in
> [spec-v85](spec-v85.md) §6.3 (listed in §5, Files touched).

## 1. Thesis

Cardiology and the 12-lead ECG are where a clinician runs small, fixed computations
constantly, and where the catalog is currently thin. It has `qtc-suite` (the four QTc
formulae), `sgarbossa` (the modified Sgarbossa rule for ischemia under LBBB), and
`map` (mean arterial pressure), plus the [spec-v87](spec-v87.md) hemodynamic suite —
but no QRS-axis geometry, no LVH voltage criteria, no STEMI risk score, no exercise-
treadmill prognosis, no cardiac power, and no continuity-equation valve area. Each of
the six is a published, deterministic instrument a cardiologist, intensivist, or ED
physician already uses:

- **The mean QRS axis is geometry, not a chart.** Given the net QRS deflection in
  lead I and lead aVF, the frontal-plane axis is a fixed `atan2` on the hexaxial
  reference. A clinician should read the degrees and the quadrant interpretation, not
  eyeball a quadrant table. No tile computes it.

- **ECG LVH is two voltage criteria, applied exactly.** Sokolow-Lyon (1949) and the
  Cornell voltage criteria (1985) are simple voltage sums against fixed (and, for
  Cornell, sex-specific) thresholds. The whole value is showing each sum, its
  threshold, and whether it tripped — not recalling 35 mm and 28/20 mm at the bedside.

- **TIMI for STEMI is a weighted score with a published mortality band.** The Morrow
  2000 score is a fixed point sum over nine bedside variables mapping to a 30-day
  mortality band. The catalog has no STEMI risk score.

- **The Duke treadmill score turns three exercise-test values into a prognosis.** A
  fixed linear combination of exercise time, ST deviation, and an angina index, with a
  cited five-year survival per risk band. Absent today.

- **Cardiac power output is the strongest hemodynamic mortality correlate in shock.**
  A single product over 451, with the published < 0.6 W cardiogenic-shock threshold.
  It is the natural companion to the [spec-v87](spec-v87.md) `hemodynamic-suite`.

- **Aortic valve area by continuity is the echo bread-and-butter computation.** The
  continuity equation over entered LVOT and AV measurements, with the dimensionless
  index and the guideline severity band. No tile computes it.

Each is a published, deterministic instrument a physician already uses; v90 brings
them onto the page.

## 2. What v90 adds (6 tiles)

### 2.1 `ecg-axis` — Mean QRS frontal-plane axis

- **Citation:** Standard hexaxial reference electrocardiography. Surawicz B, Knilans
  T. *Chou's Electrocardiography in Clinical Practice.* 6th ed. Saunders; 2008.
- **citationUrl:** (stable textbook reference; no DOI — `accessed` recorded in `META`)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `cardiology`, `emergency-medicine`, `internal-medicine`,
  `nursing-ed`.
- **Inputs:** net QRS deflection (mm, signed) in **lead I** and **lead aVF**;
  optionally **lead II** for refinement.
- **Output:** the **mean frontal-plane QRS axis in degrees** via `atan2` geometry on
  the hexaxial reference (lead I = 0°, aVF = +90°), with the **quadrant
  interpretation** — **normal** (−30° to +90°), **left-axis deviation** (−30° to
  −90°), **right-axis deviation** (+90° to +180°), and **extreme / northwest axis**
  (−90° to −180°). The result names the quadrant and shows the derivation. The
  all-isoelectric `(0, 0)` case is surfaced as an **"indeterminate axis"** fallback,
  never a `NaN`. Class A (fixed hexaxial geometry; no staleness row). Near-neighbors:
  `qtc-suite`, `sgarbossa`.

### 2.2 `lvh-criteria` — ECG left-ventricular-hypertrophy voltage criteria

- **Citation:** Sokolow M, Lyon TP. The ventricular complex in left ventricular
  hypertrophy as obtained by unipolar precordial and limb leads. *Am Heart J.*
  1949;37(2):161-186 (Sokolow-Lyon). Casale PN, Devereux RB, et al.
  Electrocardiographic detection of left ventricular hypertrophy: development and
  prospective validation of improved criteria. *J Am Coll Cardiol.*
  1985;6(3):572-580 (Cornell voltage).
- **citationUrl:** https://doi.org/10.1016/0735-1097(85)90581-1
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `emergency-medicine`.
- **Inputs:** **S in V1** (mm), **R in V5** and **R in V6** (mm), **S in V3** (mm),
  **R in aVL** (mm), and **sex**.
- **Output:** the two criteria, each **met / not-met with the computed value** —
  **Sokolow-Lyon** (SV1 + max(RV5, RV6) ≥ **35 mm**) and **Cornell voltage**
  (SV3 + RaVL; > **28 mm** men, > **20 mm** women). The output shows each sum against
  its threshold and which (if either) is positive. Class A (fixed 1949/1985 voltage
  thresholds; no staleness row). Near-neighbor: `sgarbossa`.

### 2.3 `timi-stemi` — TIMI Risk Score for STEMI

- **Citation:** Morrow DA, Antman EM, Charlesworth A, et al. TIMI risk score for
  ST-elevation myocardial infarction: a convenient, bedside, clinical score for risk
  assessment at presentation. *Circulation.* 2000;102(17):2031-2037.
- **citationUrl:** https://doi.org/10.1161/01.CIR.102.17.2031
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `emergency-medicine`, `nursing-ed`.
- **Inputs:** age band (**< 65** / **65–74** / **≥ 75**); history of **diabetes,
  hypertension, or angina**; **SBP < 100 mmHg**; **HR > 100 bpm**; **Killip class
  II–IV**; **weight < 67 kg**; **anterior STE or LBBB**; and **time to treatment
  > 4 h**.
- **Output:** the **0–14 weighted total** with the **30-day mortality band** per
  Morrow (each step's per-band mortality quoted from the source). The output shows the
  point contributions and the band. Class A (fixed Morrow 2000 point weights and
  mortality bands; no staleness row). Near-neighbor: `sgarbossa`.

### 2.4 `duke-treadmill` — Duke Treadmill Score

- **Citation:** Mark DB, Hlatky MA, Harrell FE Jr, et al. Exercise treadmill score
  for predicting prognosis in coronary artery disease. *Ann Intern Med.*
  1987;106(6):793-800.
- **citationUrl:** https://doi.org/10.7326/0003-4819-106-6-793
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `cardiology`, `internal-medicine`.
- **Inputs:** **exercise time** (min, Bruce protocol); **maximal ST-segment
  deviation** (mm); **exercise angina index** (0 none / 1 non-limiting / 2 limiting).
- **Output:** **DTS = exercise time − (5 × ST deviation) − (4 × angina index)**, with
  the **risk band** (**low** ≥ +5, **moderate** −10 to +4, **high** ≤ −11) and the
  source's cited **five-year survival** for the band. The output shows the derivation.
  Class A (fixed Mark 1987 coefficients and bands; no staleness row). Near-neighbor:
  `qtc-suite`.

### 2.5 `cardiac-power-output` — Cardiac power output

- **Citation:** Fincke R, Hochman JS, Lowe AM, et al. Cardiac power is the strongest
  hemodynamic correlate of mortality in cardiogenic shock: a report from the SHOCK
  trial registry. *J Am Coll Cardiol.* 2004;44(2):340-348.
- **citationUrl:** https://doi.org/10.1016/j.jacc.2004.03.060
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `critical-care`, `cardiology`, `cardiac-surgery`.
- **Inputs:** **mean arterial pressure** (mmHg); **cardiac output** (L/min).
- **Output:** **CPO = (MAP × CO) / 451** in **watts**, with the **< 0.6 W**
  cardiogenic-shock-mortality threshold flagged per Fincke. The output shows the
  derivation and the threshold status. Class A (fixed conversion constant 451; no
  staleness row). Cross-links the [spec-v87](spec-v87.md) `hemodynamic-suite` (which
  consumes a user-entered cardiac output) and `map` (E).

### 2.6 `aortic-valve-area` — Aortic valve area by the continuity equation

- **Citation:** Baumgartner H, Hung J, Bermejo J, et al. Recommendations on the
  echocardiographic assessment of aortic valve stenosis: a focused update from the
  EACVI and the ASE. *J Am Soc Echocardiogr.* 2017;30(4):372-392. Severity bands per
  the 2020 ACC/AHA valvular heart disease guideline (Otto CM, et al. *Circulation.*
  2021;143(5)).
- **citationUrl:** https://doi.org/10.1016/j.echo.2017.02.009
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `cardiology`, `cardiac-surgery`, `echocardiography`.
- **Inputs:** **LVOT diameter** (cm); **LVOT VTI** (cm); **AV VTI** (cm) [or peak
  velocities].
- **Output:** **AVA = (π · (LVOT_d / 2)² × LVOT_VTI) / AV_VTI** in **cm²**, the
  **dimensionless index** (LVOT_VTI / AV_VTI), and the **severity band** (**mild**
  > 1.5, **moderate** 1.0–1.5, **severe** < 1.0 cm²). The output shows the derivation
  and the band. **Class B** — the severity cutoffs follow a revisable society
  guideline, so the tile gets a `docs/citation-staleness.md` row (ASE/EACVI 2017 +
  ACC/AHA 2020 editions, `accessed`, on-publication cadence). Division by
  **AV_VTI = 0** is guarded → surfaced `valid:false` fallback, never a `NaN`.
  Near-neighbor: `qtc-suite`.

## 3. Per-tile robustness

- **`ecg-axis` guards the `atan2` domain.** The axis is computed from the signed lead
  vectors via `atan2`; the **all-isoelectric `(0, 0)` case** — both lead I and aVF net
  deflections zero — is the only ill-defined input, and it returns a surfaced
  **"indeterminate axis"** string rather than a `NaN` or a spurious 0°. Lead II, when
  entered, refines but never breaks the result. This is the `atan2` guard named in
  [spec-v85](spec-v85.md) §2 clause 3.
- **`lvh-criteria` sums non-negative voltages.** Voltage inputs are clamped to
  non-negative (a measured amplitude is a magnitude); the two sums divide by nothing
  and cannot overflow into a non-finite value. The output surfaces each sum and its
  threshold so the met/not-met determination is auditable, and Cornell branches on
  sex without a silent default.
- **`timi-stemi` and `duke-treadmill` are bounded arithmetic.** TIMI is a fixed point
  sum (0–14) with no division; Duke is a fixed linear combination. Both range-clamp
  their numeric inputs (exercise time, ST deviation) and map to the published band
  with a total-out-of-range guard so no input produces an unbanded result.
- **`cardiac-power-output` divides by the fixed nonzero constant 451** only; MAP and
  CO are range-clamped and the < 0.6 W threshold is applied to the finite result.
- **`aortic-valve-area` guards division by AV_VTI.** The continuity equation divides
  by **AV_VTI**, which is guarded against zero (and against a non-positive LVOT
  diameter) → surfaced `valid:false` fallback. The π·(d/2)² area term uses fixed
  constants only.
- All six compute functions use `lib/num.js`, join the [spec-v59](spec-v59.md)
  `fuzz-tools` harness on import (zero non-finite leaks), render the
  [spec-v50](spec-v50.md) §3 clinical posture note, and quote the source's own
  per-band interpretation; none authors a treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). Each tile reads top-to-bottom on a phone with no
  sideways-scrolling derivation table ([spec-v72](spec-v72.md) posture).

## 4. CI/CD & maintenance

This is the first Wave-2 spec; it instantiates the [spec-v85](spec-v85.md) §6
contract and authors the §6.3 cadence job.

**Maintenance classes ([spec-v85](spec-v85.md) §6.3).** Five tiles are **Class A** —
`ecg-axis` (fixed hexaxial geometry), `lvh-criteria` (1949 Sokolow-Lyon and 1985
Cornell voltage thresholds), `timi-stemi` (Morrow 2000 point weights / mortality
bands), `duke-treadmill` (Mark 1987 coefficients / bands), and
`cardiac-power-output` (fixed constant 451). Class A constants do not change on a
calendar and carry **no `docs/citation-staleness.md` row**; their citations are only
re-verified for retraction/supersession in the routine citation pass.

One tile is **Class B** — `aortic-valve-area`: the severity cutoffs (mild / moderate
/ severe) follow the revisable **ASE/EACVI 2017** echo-assessment recommendations and
the **2020 ACC/AHA** valvular guideline. It gets a `docs/citation-staleness.md` row
naming both editions in force, the `accessed` date, and an **on-publication** review
cadence.

**New CI job (program-level, authored here).** v90 AUTHORS
`scripts/check-citation-cadence.mjs` — the **warn-only monthly** scheduled job from
[spec-v85](spec-v85.md) §6.3. It reads `docs/citation-staleness.md` and, for each
**Class B** row whose `accessed` date is older than its declared review cadence,
**annotates the run** (does not block) so the maintainer checks for a newer edition.
It inspects **our own dated rows**, never an external feed ([spec-v5](spec-v5.md) §2),
and never auto-edits — a guideline update is always a reviewed, audited maintainer
change ([spec-v85](spec-v85.md) §6.4). The `aortic-valve-area` row is its first
subject.

**Merge gates ([spec-v85](spec-v85.md) §6.2).** Each compute module is added to the
`test/unit/fuzz-tools.test.js` `MODULES` list (zero non-finite leaks, with the
`atan2`/division guards exercised); each `META` worked example is pinned by the
chromium `example-correctness` sweep (flake-prone under CPU load — CI `retries:2`,
rerun isolated to confirm); and `check-catalog-truth.mjs` enforces that all **13**
catalog-count surfaces equal `UTILITIES.length` = **385** in the same change.
`check-citations.mjs` requires the `aortic-valve-area` Class-B row (the
ASE/EACVI/ACC/AHA acronyms match `ISSUER_PATTERN`).

## 5. Files touched

```
docs/spec-v90.md                         (this file)
app.js                                   (+6 UTILITIES rows: groups E and G; import group-v16 renderers into RENDERERS)
lib/cardio-v90.js                        (new module: ecgAxis, lvhCriteria, timiStemi, dukeTreadmill, cardiacPowerOutput, aorticValveArea)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to qtc-suite, sgarbossa, map, hemodynamic-suite)
views/group-v16.js                       (new renderer module: 6 renderers; axis derivation, LVH voltage sums, TIMI/Duke point/linear breakdowns, CPO + AVA continuity derivations)
scripts/check-citation-cadence.mjs       (NEW: the spec-v85 §6.3 warn-only monthly citation-cadence job; reads docs/citation-staleness.md)
docs/citation-staleness.md               (+ row: aortic-valve-area severity cutoffs — ASE/EACVI 2017 + ACC/AHA 2020, accessed, on-publication cadence)
docs/clinical-citations.md               (+ rows for the six cardiology sources)
test/unit/ecg-axis.test.js               (new; ≥3 boundary worked examples incl. each quadrant boundary + the (0,0) indeterminate gate)
test/unit/lvh-criteria.test.js           (new; ≥3 incl. the Sokolow-Lyon 35 mm edge and the sex-specific Cornell threshold)
test/unit/timi-stemi.test.js             (new; ≥3 incl. a band-flip and the 0/14 extremes)
test/unit/duke-treadmill.test.js         (new; ≥3 incl. the +5 and −11 band flips)
test/unit/cardiac-power-output.test.js   (new; ≥3 incl. the 0.6 W threshold flip)
test/unit/aortic-valve-area.test.js      (new; ≥3 incl. the 1.0 and 1.5 cm² severity boundaries and the AV_VTI=0 guard)
test/unit/fuzz-tools.test.js             (add lib/cardio-v90.js to MODULES)
docs/audits/v12/ecg-axis.md, lvh-criteria.md, timi-stemi.md, duke-treadmill.md, cardiac-power-output.md, aortic-valve-area.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 379 -> 385; append to the running ledger)
CHANGELOG.md                             (Unreleased: v90 entry, +6)
README.md, package.json                  (catalog count 379 -> 385; spec-progression line -> v90)
```

## 6. Acceptance criteria

v90 is fully shipped when:

- All 6 tiles in §2 are live in their stated group with a `META[id]` entry, an inline
  primary citation + `citationUrl` + `accessed`, ≥3 boundary worked examples in the
  unit test, a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 scope check.
- The boundary examples include the **axis-quadrant boundaries** (the −30° / +90° /
  +180° / −90° edges and the `(0,0)` indeterminate gate), the **Sokolow-Lyon 35 mm
  edge** and the **sex-specific Cornell threshold**, the **DTS band flips** at +5 and
  −11, the **CPO 0.6 W threshold**, and the **AVA severity boundaries** at 1.0 and
  1.5 cm² (plus the AV_VTI = 0 guard).
- `ecg-axis` returns the correct quadrant at each boundary and "indeterminate axis"
  for the all-isoelectric input; `lvh-criteria` reports each voltage sum against its
  threshold with the sex-correct Cornell cutoff; `timi-stemi` produces the 0–14 total
  with the Morrow mortality band; `duke-treadmill` computes the score and the cited
  five-year-survival band; `cardiac-power-output` flags the < 0.6 W threshold; and
  `aortic-valve-area` computes the area, the dimensionless index, and the severity
  band, guarding AV_VTI = 0.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness (`lib/cardio-v90.js` in `MODULES`) with **zero
  non-finite leaks**.
- The Class-B `aortic-valve-area` severity cutoffs carry `accessed` + a
  `docs/citation-staleness.md` row; the five Class-A tiles carry no staleness row.
- `scripts/check-citation-cadence.mjs` exists as the warn-only monthly cadence job and
  reads the new `aortic-valve-area` row without blocking.
- `UTILITIES.length` is **385** and all 13 catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v90 with the +6 catalog delta.

## 7. Out of scope for v90

- **No full 12-lead ECG interpretation or auto-read.** `ecg-axis` computes the mean
  frontal-plane axis from entered net deflections and `lvh-criteria` applies the two
  voltage criteria from entered amplitudes; neither interprets a waveform, classifies
  a rhythm, or auto-reads an ECG image — that would breach the
  [spec-v29](spec-v29.md) §3 one-line test and the [spec-v85](spec-v85.md) §9 no-AI
  rule.
- **No echo image parsing.** `aortic-valve-area` takes entered measurements
  (LVOT diameter, LVOT VTI, AV VTI / peak velocities); it does not trace a Doppler
  envelope or read a DICOM.
- **No auto-disposition.** Each tile reports its computation and the source's stated
  interpretation; the cath-lab activation, the AS-severity adjudication, the
  treadmill-test disposition, and the shock-escalation decision stay with the
  clinician and local protocol ([spec-v11](spec-v11.md) §5.3).
