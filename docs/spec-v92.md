# spec-v92.md — Nephrology: KDIGO CKD staging, urine albumin/protein ratios, dialysis adequacy, contrast-nephropathy risk, and cystatin-C eGFR (+5 tiles)

> Status: **PROPOSED (2026-06-16).** Wave 2 feature spec of the
> [spec-v85](spec-v85.md) Advanced Clinical Calculators program (the nephrology slot,
> [spec-v85](spec-v85.md) §4 roster). Adds **5** deterministic nephrology tools that
> close confirmed gaps in the renal cluster: the KDIGO CKD G×A risk heat-map, the
> spot urine albumin/protein-to-creatinine ratios, hemodialysis adequacy (URR +
> Daugirdas Kt/V), the Mehran contrast-induced-nephropathy risk score, and the 2021
> race-free CKD-EPI cystatin-C / creatinine–cystatin eGFR. The catalog ships
> `egfr-suite`, `egfr`, `fena-feurea`, `kdigo-aki`, `ttkg`, and `cockcroft-gault`,
> but **none** of these five — no CKD G×A staging, no proteinuria ratio, no dialysis
> adequacy, no contrast-nephropathy risk, and no cystatin-based eGFR. None duplicates
> an existing tile.
>
> Catalog effect at v92 close: **390 + 5 = 395 tiles.**
>
> Every prior spec (v4 through v91) remains in force. v92 adds no runtime network
> call and no AI; each tile obeys the [spec-v85](spec-v85.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md) output-safety
> contract.

## 1. Thesis

The renal cluster is one of the catalog's strongest — `egfr-suite` and `egfr`
estimate filtration, `fena-feurea` separates pre-renal from intrinsic injury,
`kdigo-aki` stages acute injury, `ttkg` reads the potassium-handling gradient, and
`cockcroft-gault` carries the dosing creatinine clearance. But the *chronic* and
*procedural* nephrology surface a nephrologist, internist, and dialysis nurse reach
for daily is absent:

- **CKD is staged on a two-axis heat-map, not a single eGFR.** KDIGO classifies
  chronic kidney disease by GFR category (G1–G5) **and** albuminuria category
  (A1–A3), and the prognosis — the actionable output — is the risk cell where the two
  axes meet (low / moderately increased / high / very high). A clinician can recall
  "eGFR 38" but cannot, at a glance, place *eGFR 38 with a UACR of 340* in the
  correct KDIGO risk cell. `ckd-staging` runs the heat-map.

- **Proteinuria is reported as a spot ratio, not a 24-hour collection.** The modern
  standard is the spot urine albumin- or protein-to-creatinine ratio, which estimates
  24-hour excretion from a single specimen. The catalog has no ratio tile; `uacr-upcr`
  computes UACR/UPCR, estimates the daily excretion, and maps to the KDIGO A-stage.

- **Dialysis adequacy is a number every unit tracks.** Hemodialysis quality is judged
  by the urea reduction ratio and single-pool Kt/V (the Daugirdas second-generation
  estimate), against KDOQI minimum targets (URR ≥ 65%, spKt/V ≥ 1.2). The catalog has
  no dialysis-adequacy tool; `ktv-urr` ships both with the target framing.

- **Contrast-nephropathy risk is a validated point score.** Before a contrast study
  in a patient with risk factors, the Mehran score predicts contrast-induced
  nephropathy and the post-procedure dialysis risk from eight weighted inputs. The
  catalog has no contrast-nephropathy tool; `mehran-cin` ships the score and its
  risk bands.

- **Cystatin-C eGFR is the race-free confirmatory estimate.** The 2021 CKD-EPI
  equations estimate GFR from cystatin C alone and from creatinine + cystatin C
  combined, without a race coefficient — the recommended confirmatory test when a
  creatinine-only estimate is near a decision threshold. The catalog ships the
  creatinine-only `egfr`; `ckd-epi-cystatin` is its cystatin companion.

Each is a published, deterministic instrument a clinician already uses; v92 brings
them onto the page.

## 2. What v92 adds (5 tiles)

### 2.1 `ckd-staging` — KDIGO CKD G×A risk classification

- **Citation:** KDIGO 2024 Clinical Practice Guideline for the Evaluation and
  Management of Chronic Kidney Disease. *Kidney Int.* 2024;105(4S):S117-S314.
- **citationUrl:** https://doi.org/10.1016/j.kint.2023.10.018
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nephrology`, `internal-medicine`, `family-medicine`.
- **Inputs:** eGFR (mL/min/1.73m²) and the urine albumin-to-creatinine ratio (mg/g)
  — or the albuminuria category directly.
- **Output:** the **G-stage** (G1 ≥ 90, G2 60–89, G3a 45–59, G3b 30–44, G4 15–29,
  G5 < 15) × the **A-stage** (A1 < 30, A2 30–300, A3 > 300 mg/g), and the resulting
  **KDIGO risk heat-map category** (low / moderately increased / high / very high).
  The result names the G×A cell and quotes the KDIGO prognosis for that cell.
- **Maintenance class:** **Class B** — the KDIGO CKD categories are a revisable
  guideline threshold. A `docs/citation-staleness.md` row names the 2024 edition in
  force, the `accessed` date, and an **on-publication** review cadence
  ([spec-v85](spec-v85.md) §6.3). Cross-links [`egfr-suite`](spec-v90.md) and
  `uacr-upcr` (the A-stage source).

### 2.2 `uacr-upcr` — Spot urine albumin/protein-to-creatinine ratios

- **Citation:** KDIGO 2024 CKD guideline (albuminuria categories); NKF spot-ratio
  measurement guidance. *Kidney Int.* 2024;105(4S):S117-S314.
- **citationUrl:** https://doi.org/10.1016/j.kint.2023.10.018
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nephrology`, `internal-medicine`.
- **Inputs:** urine albumin (mg/dL or mg/L) **or** urine protein (mg/dL), and urine
  creatinine (mg/dL).
- **Output:** the **UACR** (mg/g) and/or **UPCR** (mg/g), the estimated **24-hour
  albumin/protein excretion**, and the **KDIGO albuminuria A-stage** (A1 / A2 / A3).
- **Maintenance class:** **Class A** for the ratio math (a unit-aware division), but
  the A-stage cutoffs cross-reference `ckd-staging` (whose KDIGO categories carry the
  Class B row); this tile does **not** add a second staleness row. Cross-links
  `ckd-staging`. **Robustness:** guards urine-creatinine division by zero (§3).

### 2.3 `ktv-urr` — Hemodialysis adequacy (URR + Daugirdas Kt/V)

- **Citation:** Daugirdas JT. Second generation logarithmic estimates of single-pool
  variable volume Kt/V: an analysis of error. *J Am Soc Nephrol.* 1993;4(5):1205-1213.
- **citationUrl:** https://doi.org/10.1681/ASN.V451205
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nephrology`, `dialysis-nursing`.
- **Inputs:** pre- and post-dialysis BUN (mg/dL), ultrafiltration volume (L),
  dialysis session time (h), and post-dialysis weight (kg).
- **Output:** the **urea reduction ratio** URR = (1 − post/pre) × 100%, and the
  **single-pool Kt/V** by the Daugirdas second-generation equation —
  Kt/V = −ln(R − 0.008·t) + (4 − 3.5·R)·UF/W, with R = post-BUN/pre-BUN — shown as a
  derivation, against the **KDOQI minimum targets** (URR ≥ 65%, spKt/V ≥ 1.2).
- **Maintenance class:** **Class A** for the Daugirdas formula ([spec-v85](spec-v85.md)
  §6.3 names it explicitly); the KDOQI targets are quoted as a stated target with a
  low revision frequency and are noted in the output, not authored. **Robustness:**
  guards the ln domain (R − 0.008·t > 0) and pre-BUN > 0 (§3).

### 2.4 `mehran-cin` — Mehran contrast-induced nephropathy risk score

- **Citation:** Mehran R, Aymong ED, Nikolsky E, et al. A simple risk score for
  prediction of contrast-induced nephropathy after percutaneous coronary intervention:
  development and initial validation. *J Am Coll Cardiol.* 2004;44(7):1393-1399.
- **citationUrl:** https://doi.org/10.1016/j.jacc.2004.06.068
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `nephrology`, `interventional-radiology`.
- **Inputs:** hypotension (5), intra-aortic balloon pump (5), congestive heart
  failure (5), age > 75 (4), anemia (3), diabetes (3), contrast volume (1 point per
  100 mL), and eGFR (40–60 = 2 / 20–40 = 4 / < 20 = 6).
- **Output:** the **total score** with the published **CIN-risk and dialysis-risk
  bands** (≤ 5 low, 6–10 moderate, 11–15 high, ≥ 16 very high), naming the band and
  quoting its risk estimate from the source.
- **Maintenance class:** **Class A** — the Mehran point weights are a fixed published
  point table ([spec-v85](spec-v85.md) §5); no staleness row. Cross-links
  `kdigo-aki` and `ckd-staging`.

### 2.5 `ckd-epi-cystatin` — CKD-EPI 2021 cystatin-C and combined creatinine–cystatin eGFR (race-free)

- **Citation:** Inker LA, Eneanya ND, Coresh J, et al. New creatinine- and cystatin
  C–based equations to estimate GFR without race. *N Engl J Med.* 2021;385(19):1737-1749.
- **citationUrl:** https://doi.org/10.1056/NEJMoa2102953
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nephrology`, `internal-medicine`, `oncology`.
- **Inputs:** serum cystatin C (mg/L), serum creatinine (mg/dL), age, and sex.
- **Output:** **eGFRcys** (cystatin-only) and **eGFRcr-cys** (combined) in
  mL/min/1.73m² via the 2021 race-free CKD-EPI equations, presented **beside** the
  creatinine-only value for comparison, with the source note that the combined
  equation is the recommended confirmatory estimate near a decision threshold.
- **Maintenance class:** **Class A** — the 2021 CKD-EPI equations are fixed published
  coefficients; no staleness row. Cross-links the creatinine-only [`egfr`](spec-v85.md)
  (already shipped) and `egfr-suite`.

## 3. Per-tile robustness

- **`ckd-staging` is band-mapping logic** over two ordinal axes; it surfaces a
  `valid:false` fallback when eGFR is non-finite or the albuminuria input is missing
  (it can accept the A-category directly when no numeric UACR is given), and it never
  emits an unlabeled cell. The G3a/G3b boundary (eGFR 45) and the A2/A3 boundary
  (UACR 300) are explicit, inclusive-edge tested band edges.
- **`uacr-upcr` guards its division:** urine creatinine of 0 (or blank) returns a
  surfaced `valid:false` ("urine creatinine required, must be > 0"), never a `NaN` or
  `Infinity` ratio. The albumin/protein unit toggle (mg/dL ↔ mg/L) routes through
  `lib/num.js`. The A-stage uses the same cutoffs as `ckd-staging` so the two agree.
- **`ktv-urr` guards two domains:** pre-BUN must be > 0 (division for R) and the
  Daugirdas logarithm requires R − 0.008·t > 0 — both return a surfaced
  `valid:false` rather than a `NaN`/`-Infinity` from `ln` of a non-positive argument.
  URR is computed independently of Kt/V, so a blank UF/time/weight still yields URR
  alone (partial-input fallback). The signed Kt/V is reported only when its domain
  holds.
- **`mehran-cin` is integer point arithmetic** with no division; a blank optional
  factor contributes 0 points (partial-input fallback), and the contrast-volume term
  (1 per 100 mL) and eGFR band term are clamped to their published ranges. The band
  edges (5/6, 10/11, 15/16) are explicit inclusive-edge tests.
- **`ckd-epi-cystatin` guards its power terms:** cystatin C and creatinine must be
  positive (the equations raise them to fixed exponents); a non-positive or blank
  value returns a surfaced `valid:false`. The cystatin-only and combined estimates are
  computed independently, so a missing creatinine still yields eGFRcys (partial-input
  fallback). All exponentiation uses finite, in-domain bases.
- All five compute functions use `lib/num.js`, join the
  [`test/unit/fuzz-tools.test.js`](../test/unit/fuzz-tools.test.js) harness on import
  ([spec-v59](spec-v59.md)) with **zero non-finite leaks**, and render the
  [spec-v50](spec-v50.md) §3 clinical posture note — they surface the source's own
  band interpretation and do not author a recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

This spec instantiates the [spec-v85](spec-v85.md) §6 CI/CD contract.

- **Maintenance classes ([spec-v85](spec-v85.md) §6.3).**
  - **Class A — fixed formula / point table (no staleness row):** `uacr-upcr` (ratio
    math), `ktv-urr` (Daugirdas second-generation Kt/V — named Class A in
    [spec-v85](spec-v85.md) §6.3 — plus the URR percentage), `mehran-cin` (the 2004
    Mehran point weights and bands), and `ckd-epi-cystatin` (the fixed 2021 CKD-EPI
    coefficients). These never enter the §6.4 update workflow; their citations are only
    re-verified for retraction/supersession in the routine citation pass.
  - **Class B — revisable guideline threshold (one staleness row):** `ckd-staging`
    — the KDIGO CKD G×A categories are a society-revised classification. A single
    `docs/citation-staleness.md` row names the **KDIGO 2024 edition in force**, the
    `accessed` date, and an **on-publication** review cadence. `uacr-upcr`'s A-stage
    cutoffs reference this same row rather than duplicating it.
- **The §6.2 merge gates apply unchanged:** `check-citations.mjs` requires the KDIGO
  row for the `ckd-staging` Class B acronym (the `ISSUER_PATTERN` trigger);
  `check-catalog-truth.mjs` enforces all **13** catalog-count surfaces equal
  `UTILITIES.length` (395); `fuzz-tools.test.js` requires `lib/nephro-v92.js` in
  `MODULES` with zero non-finite leaks (division, ln, and power-term domain guards);
  `a11y-check.mjs`, the Playwright `all-tools`/`smoke`, `example-correctness`
  (chromium, `retries:2` — rerun isolated to confirm), and
  `mobile-no-hscroll`/`mobile-touch-targets` all gate the new renderers.
- **The §6.3 cadence job** `scripts/check-citation-cadence.mjs` (authored by
  [spec-v90](spec-v90.md), the first wave-2 spec to land a Class B constant) reads the
  new `ckd-staging` KDIGO row and warns (annotates, never blocks or auto-edits) when
  its `accessed` date ages past the on-publication cadence, prompting the maintainer
  to check for a newer KDIGO edition. When KDIGO republishes, the
  [spec-v85](spec-v85.md) §6.4 workflow applies: edit the category table in
  `lib/nephro-v92.js`, bump the `META` `accessed` and the staleness row, re-run the
  `ckd-staging` audit log, and re-gate.

## 5. Files touched

```
docs/spec-v92.md                          (this file)
app.js                                     (+5 UTILITIES rows: uacr-upcr/ktv-urr/ckd-epi-cystatin group E, ckd-staging/mehran-cin group G; import group-v18 renderers into RENDERERS)
lib/nephro-v92.js                          (new module: ckdStaging, uacrUpcr, ktvUrr, mehranCin, ckdEpiCystatin)
lib/meta.js                               (+5 META entries: inline citation + citationUrl + accessed; cross-links to egfr-suite, egfr, kdigo-aki, fena-feurea)
views/group-v18.js                         (new renderer module: 5 renderers; CKD G×A heat-map, ratio inputs, dialysis-adequacy derivation, Mehran checklist, cystatin/creatinine side-by-side)
docs/citation-staleness.md                 (+ row: ckd-staging KDIGO 2024 CKD categories — edition in force, accessed, on-publication cadence)
docs/clinical-citations.md                 (+ 5 rows for the five nephrology sources)
test/unit/ckd-staging.test.js              (new; ≥3 boundary worked examples incl. the G3a/G3b eGFR edge and A2/A3 albuminuria edge -> risk cell)
test/unit/uacr-upcr.test.js                (new; ≥3 incl. the urine-Cr=0 guard, unit toggle, and an A-stage band edge)
test/unit/ktv-urr.test.js                  (new; ≥3 incl. the URR 65% target, the Kt/V 1.2 target, and the ln-domain guard)
test/unit/mehran-cin.test.js               (new; ≥3 incl. each band edge 5/6, 10/11, 15/16 and the contrast-volume/eGFR terms)
test/unit/ckd-epi-cystatin.test.js         (new; ≥3 incl. eGFRcys vs eGFRcr-cys vs creatinine-only and the non-positive guard)
test/unit/fuzz-tools.test.js               (add lib/nephro-v92.js to MODULES)
docs/audits/v12/ckd-staging.md, uacr-upcr.md, ktv-urr.md, mehran-cin.md, ckd-epi-cystatin.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md                (catalog count 390 -> 395; append to the running ledger)
CHANGELOG.md                               (Unreleased: v92 entry, +5)
README.md, package.json                    (catalog count 390 -> 395; spec-progression line -> v92)
```

## 6. Acceptance criteria

v92 is fully shipped when:

- All 5 tiles in §2 are live in their stated group with a `META[id]` entry, an inline
  primary citation + `citationUrl` + `accessed`, ≥3 boundary worked examples in the
  unit test (including the band-flip cases below), a [spec-v11](spec-v11.md) audit log,
  and a passing [spec-v29](spec-v29.md) §3 scope check.
- `ckd-staging` places eGFR 45 at the **G3a** edge and eGFR 44 at **G3b**, places
  UACR 300 at the **A2** edge and UACR 301 at **A3**, and returns the correct KDIGO
  risk cell (e.g. eGFR 38 + UACR 340 → G3b/A3 → very high), naming the cell.
- `uacr-upcr` computes UACR/UPCR (mg/g) and the estimated 24-hour excretion, maps to
  the correct A-stage, agrees with `ckd-staging` on the A-cutoffs, and returns a
  surfaced `valid:false` (never `NaN`/`Infinity`) when urine creatinine is 0 or blank.
- `ktv-urr` computes URR with the **65%** target edge and single-pool Kt/V with the
  **1.2** target edge, shows the Daugirdas derivation, returns URR alone when the
  Kt/V inputs are blank, and surfaces `valid:false` when R − 0.008·t ≤ 0 or pre-BUN ≤ 0.
- `mehran-cin` totals the eight weighted factors and flips bands exactly at **5/6**,
  **10/11**, and **15/16**, naming the band and its risk estimate; a blank optional
  factor contributes 0.
- `ckd-epi-cystatin` computes eGFRcys and eGFRcr-cys, presents both beside the
  creatinine-only value, yields eGFRcys alone when creatinine is blank, and surfaces
  `valid:false` on a non-positive cystatin C or creatinine.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- The revisable KDIGO classification (`ckd-staging`) carries `accessed` + a
  `docs/citation-staleness.md` row with the edition in force and an on-publication
  cadence; the four Class A tiles carry **no** staleness row.
- `UTILITIES.length` is **395** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run test:e2e`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v92 with the +5 catalog delta.

## 7. Out of scope for v92

- **No 24-hour-collection workflow.** The spot ratios (`uacr-upcr`) *estimate* daily
  excretion from a single specimen; a timed-collection capture/normalization tool is
  not built here.
- **No race-based eGFR equations.** `ckd-epi-cystatin` ships only the 2021 race-free
  CKD-EPI equations, consistent with the source and the
  [scope-mdcalc-parity §4](scope-mdcalc-parity.md) bar against superseded instruments;
  the deprecated race-coefficient equations are excluded by name.
- **No auto-nephrology-referral or auto-disposition.** The tiles report the KDIGO
  cell, the ratio, the adequacy number, the contrast-risk band, and the eGFR estimate
  with the source's stated interpretation; the decision to refer, dialyze, dose, or
  defer a contrast study stays with the clinician and local protocol
  ([spec-v11](spec-v11.md) §5.3).
