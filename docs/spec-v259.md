# spec-v259.md — Cardiac risk engines: the GWTG-Heart Failure score, the Emergency Heart Failure Mortality Risk Grade, and the PRECISE-DAPT bleeding score (+3 tiles)

> Status: **PROPOSED (2026-07-08).** Second feature spec of the **Advanced
> Risk-Stratification Instruments** program ([spec-v258](spec-v258.md) §1.1). Adds **3**
> deterministic cardiology risk engines — two for heart-failure mortality, one for
> bleeding on dual antiplatelet therapy. **Each id was verified absent by a fixed-string
> scan of the extracted `app.js` id/name list** ([spec-v85 §6.2](spec-v85.md)): the
> catalog carries `maggic`, `killip`, `grace`, `timi`, `crusade`, `has-bled`, and
> `dapt-score`, but **not** the GWTG-HF score, the EHMRG, or the PRECISE-DAPT score.
>
> Catalog effect: **live `UTILITIES.length` + 3** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v259 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no admission, ICU-transfer, antiplatelet-duration, or
> discharge order in Sophie's voice** — these estimate risk; the decision stays with the
> cardiologist and the patient). **Every coefficient, nomogram point, and threshold is
> re-fetched and cross-verified against ≥2 independent open sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs the
> [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog carries the chronic heart-failure mortality model (MAGGIC), the ACS
ischemic-risk engines (GRACE, TIMI), and two anticoagulant-bleeding scores (HAS-BLED,
CRUSADE), plus the DAPT score for extended-therapy net benefit. It does **not** carry
the two point/nomogram models that quantify **in-hospital and 7-day** heart-failure
mortality from data present at admission or at the ED door, nor the ESC-endorsed
five-item **bleeding** score that pairs with the DAPT score to time antiplatelet
therapy. Each is a transparent, externally-validated engine and each is decision
support — **never an admission, ICU-transfer, discharge, or drug-duration order**.

## 2. What v259 adds (3 tiles)

### 2.1 `gwtg-hf` — Get With The Guidelines–Heart Failure risk score

- **Citation:** Peterson PN, Rumsfeld JS, Liang L, et al. A validated risk score for
  in-hospital mortality in patients with heart failure from the American Heart
  Association Get With The Guidelines program. *Circ Cardiovasc Qual Outcomes.*
  2010;3(1):25-32.
- **citationUrl:** https://doi.org/10.1161/CIRCOUTCOMES.109.854877
- **Group:** G. **Specialties:** `cardiology`, `emergency-medicine`, `critical-care`,
  `internal-medicine`.
- **Inputs — seven admission variables:** age, systolic BP, BUN, heart rate, serum
  sodium, COPD (yes/no), and race (black vs non-black); each is mapped to points off the
  published nomogram for a total of 0–100 *(the per-variable nomogram point functions
  are transcribed verbatim from the primary paper at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **GWTG-HF total (0–100)** with the corresponding predicted in-hospital
  mortality, which rises steeply and > 24-fold across the range (≈ 0.4 % at the low end
  to ≈ 10 %+ at the high end) *(the score→probability lookup is transcribed at
  implementation, [spec-v97](spec-v97.md))*, naming the dominant contributors. Framed as
  the admission-time in-hospital-mortality engine for acute decompensated HF. Class A.
  Cross-links `maggic`, `ehmrg`, `killip`.

### 2.2 `ehmrg` — Emergency Heart Failure Mortality Risk Grade

- **Citation:** Lee DS, Stitt A, Austin PC, et al. Prediction of heart failure mortality
  in emergent care: a cohort study. *Ann Intern Med.* 2012;156(11):767-775.
- **citationUrl:** https://doi.org/10.7326/0003-4819-156-11-201206050-00003
- **Group:** G. **Specialties:** `emergency-medicine`, `cardiology`, `critical-care`.
- **Inputs — data available at the ED door:** age; arrival by EMS/ambulance; systolic
  BP; heart rate; oxygen saturation; serum creatinine; **serum potassium (a U-shaped
  term — both low and high add points)**; troponin above the local upper limit;
  active cancer; and outpatient metolazone use *(the full coefficient/point table and
  the potassium bands are transcribed verbatim at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **EHMRG continuous score** mapped to the **five 7-day mortality risk
  groups** (very low / low / intermediate / high / very high, with published 7-day
  mortality of ≈ 0 % / 0 % / 0.6 % / 1.9 % / 3.9 %) *(the score→group cutpoints are
  transcribed at implementation, [spec-v97](spec-v97.md))*, naming the dominant
  contributors and flagging the U-shaped potassium term. Framed as the ED-presentation
  short-term-mortality engine that complements the admission-based GWTG-HF; the 30-day
  (EHMRG30-ST) extension that adds ST-depression is noted but **out of scope here**.
  Class A. Cross-links `gwtg-hf`, `maggic`, `killip`.

### 2.3 `precise-dapt` — PRECISE-DAPT bleeding score

- **Citation:** Costa F, van Klaveren D, James S, et al. Derivation and validation of
  the predicting bleeding complications in patients undergoing stent implantation and
  subsequent dual antiplatelet therapy (PRECISE-DAPT) score: a pooled analysis of
  individual-patient datasets from clinical trials. *Lancet.* 2017;389(10073):1025-1034.
- **citationUrl:** https://doi.org/10.1016/S0140-6736(17)30397-5
- **Group:** G. **Specialties:** `cardiology`, `internal-medicine`.
- **Inputs — five items:** age, creatinine clearance (Cockcroft-Gault), hemoglobin,
  white-blood-cell count, and prior spontaneous bleeding (yes/no); each maps to points
  off the published nomogram for a total of 0–100 *(the piecewise per-variable nomogram
  point functions are the reproducibility crux and are transcribed verbatim from the
  primary paper / supplement at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **PRECISE-DAPT total (0–100)** with the **≥ 25 = high bleeding risk**
  dichotomy (a shorter DAPT duration is favored above the threshold, where prolonged DAPT
  increased bleeding without ischemic benefit; below it, standard/long duration is
  reasonable) *(the exact out-of-hospital major/minor-bleeding rate by band is
  transcribed at implementation, [spec-v97](spec-v97.md))*, naming the driving items.
  Framed as the ESC-endorsed bleeding companion to the ischemic DAPT score; **it reports
  a bleeding-risk band, never sets antiplatelet duration** ([spec-v11](spec-v11.md)
  §5.3). Class A. Cross-links `dapt-score`, `has-bled`, `crusade`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** GWTG-HF and
  PRECISE-DAPT are bounded 0–100 nomogram sums; EHMRG is a continuous coefficient model —
  each clamps its inputs to the published domains, renders a "complete the fields"
  fallback for a missing item rather than a `NaN`/`Infinity`, and clamps probabilities to
  [0, 100] %.
- **Each tile reports its band/group and the dominant contributing variables**
  ([spec-v59](spec-v59.md)) — the GWTG mortality decile, the EHMRG risk group, the
  PRECISE-DAPT dichotomy — so a result is never read without its basis.
- **All three render risk, not orders** — none authors an admission, ICU-transfer,
  discharge, or antiplatelet-duration order in Sophie's voice ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All three flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the nomogram band edges, the EHMRG potassium U-boundary,
  and the PRECISE-DAPT ≥ 25 threshold.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all three are **Class A** — fixed coefficient/nomogram
  models, each cited by journal + authors. The implementing session confirms whether any
  citation trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and
  adds a `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the three computes live in a new
  `lib/cardiac-risk-v259.js`, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v259.js`; its `RV259` export is spread into the
  `app.js` `RENDERERS` map. The transcribed nomogram/coefficient tables live as named
  constants in the module with the source table cited in a comment. Every input carries a
  real `<label for>`. The catalog count moves on all catalog-truth surfaces using the
  **live `UTILITIES.length` + 3**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and
  the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary; all tags used here already exist
  in `ALLOWED_SPECIALTIES`.
- **MCP exposure (post-ship):** all three are Class A deterministic computes and are
  **routinely MCP-adaptable** — a follow-up MCP wave exposes them as deterministic agent
  tools per the [spec-v85](spec-v85.md) recipe, self-describing the fired band and the
  driving inputs so the numeric round-trip passes.

## 5. Files touched

```
docs/spec-v259.md                        (this file)
app.js                                   (+3 UTILITIES rows; import group-v259 RV259 into RENDERERS)
lib/cardiac-risk-v259.js                 (new: gwtgHf, ehmrg, preciseDapt + transcribed nomogram/coefficient constants)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to maggic, dapt-score, has-bled)
views/group-v259.js                      (new renderer module: 3 renderers)
docs/clinical-citations.md               (+3 rows)
test/unit/gwtg-hf.test.js, ehmrg.test.js, precise-dapt.test.js   (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/cardiac-risk-v259.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+3; record the v259 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+3; spec-progression line)
```

## 6. Acceptance criteria

v259 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all three ids are absent (as verified at draft).
- All 3 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **GWTG-HF
  spanning a mortality range**, an **EHMRG crossing risk groups and exercising the
  U-shaped potassium term (a hypo- and a hyperkalemic case)**, and a **PRECISE-DAPT
  crossing the < 25 / ≥ 25 threshold**.
- The transcribed GWTG-HF and PRECISE-DAPT nomogram point tables and the EHMRG
  coefficient/potassium bands are reproduced from the primary sources and re-verified
  against ≥ 2 independent references at implementation ([spec-v97](spec-v97.md)).
- Every compute is finite-guarded, routes through `lib/num.js`, clamps probabilities to
  [0, 100] %, and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 3** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v259 with the +3 delta.

## 7. Out of scope for v259

- **No admission / ICU-transfer / discharge / antiplatelet-duration order** — the tiles
  estimate risk; the admit/transfer/discharge and DAPT-duration decisions stay with the
  cardiologist and the patient ([spec-v11](spec-v11.md) §5.3).
- **No proprietary or non-reproducible model** — the Seattle Heart Failure Model
  (multivariable regression whose full coefficient set is distributed only as a
  downloadable application) and the STS/EuroSCORE surgical models are deferred where they
  cannot be reproduced from ≥ 2 open sources ([spec-v97](spec-v97.md)). The EHMRG30-ST
  30-day extension is deferred to a later slice.
