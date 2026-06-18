# spec-v142.md — Surgical & anesthetic risk: POSSUM, P-POSSUM, SORT, Goldman cardiac risk, Wilson airway, and Surgical Risk Scale (+6 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the
> [spec-v100](spec-v100.md) **MDCalc Parity Completion** program, **Wave 8**
> (Surgery / anesthesia / ortho / rheum / geriatrics / pharmacy). Adds **6**
> deterministic perioperative risk instruments that fill confirmed gaps. None
> duplicates a live tile.
>
> Catalog effect at v142 close: **637 + 6 = 643 tiles** (or live count + 6 if
> specs land out of order; the catalog-truth gate enforces agreement).
>
> Every prior spec (v4 through v141) remains in force. v142 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md)
> §3 one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)),
> and inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has the modern perioperative cardiac and pulmonary risk indices —
`rcri` (Revised Cardiac Risk Index), the `gupta`-style logistic MICA models, the
`ariscat` pulmonary score, `pospom` and `asa-ps` — but six classic, still-widely-
cited surgical/anesthetic risk instruments are absent. POSSUM and its Portsmouth
recalibration are the standard UK audit/benchmarking models; SORT is the modern
six-variable bedside mortality estimate; the original Goldman index is the
ancestor of RCRI and is still taught and used; the Wilson Risk Sum Score is a
distinct anatomic difficult-airway predictor (different inputs from
`el-ganzouri`); and the Surgical Risk Scale is the three-line urgency+ASA+grade
mortality estimate. Each sits beside, and cross-links, the existing
`rcri`/`gupta-mica`/`pospom` cluster.

- **POSSUM** — the Physiological and Operative Severity Score, twelve physiology +
  six operative variables driving **two** logistic equations (morbidity and
  mortality); the reference UK surgical-audit model with no tile.
- **P-POSSUM** — Prytherch's Portsmouth recalibration of the POSSUM **mortality**
  equation (POSSUM over-predicts mortality at the low end); a distinct coefficient
  set, cross-linked to POSSUM.
- **SORT** — the Surgical Outcome Risk Tool, a six-preoperative-variable logistic
  30-day mortality estimate (the modern bedside companion to P-POSSUM).
- **Goldman Cardiac Risk Index** — the original 1977 nine-factor weighted preop
  cardiac index (the ancestor of `rcri`), still referenced; cross-links `rcri`.
- **Wilson airway** — the Wilson Risk Sum Score, five anatomic factors (weight,
  head/neck movement, jaw movement, receding mandible, buck teeth) → a 0–10 sum
  with a difficult-intubation threshold; distinct from the El-Ganzouri index.
- **Surgical Risk Scale** — Sutton's in-hospital mortality estimate =
  CEPOD urgency band + ASA grade + BUPA operative-magnitude grade.

## 2. What v142 adds (6 tiles)

### 2.1 `possum` — Physiological and Operative Severity Score (POSSUM)

- **Citation:** Copeland GP, Jones D, Walters M. POSSUM: a scoring system for
  surgical audit. *Br J Surg.* 1991;78(3):355-360.
- **citationUrl:** https://doi.org/10.1002/bjs.1800780327
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `surgery`, `anesthesiology`, `nursing-periop`.
- **Inputs:** the 12 physiological variables (age, cardiac signs, respiratory
  history, systolic BP, pulse, Glasgow Coma Scale, hemoglobin, WBC, urea, sodium,
  potassium, ECG) and the 6 operative variables (operative severity, number of
  procedures, blood loss, peritoneal soiling, malignancy, urgency), each banded to
  its published 1/2/4/8 point grade.
- **Output:** the **physiological score** and **operative score**, plus
  **predicted 30-day morbidity (%)** and **mortality (%)** via the two published
  logistic equations (R₁ morbidity: ln[R/(1−R)] = −5.91 + 0.16·phys + 0.19·op;
  R₂ mortality: ln[R/(1−R)] = −7.04 + 0.13·phys + 0.16·op). Class A (fixed 1991
  coefficients).

### 2.2 `p-possum` — Portsmouth POSSUM (recalibrated mortality)

- **Citation:** Prytherch DR, Whiteley MS, Higgins B, et al. POSSUM and Portsmouth
  POSSUM for predicting mortality. *Br J Surg.* 1998;85(9):1217-1220.
- **citationUrl:** https://doi.org/10.1046/j.1365-2168.1998.00840.x
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `surgery`, `anesthesiology`, `nursing-periop`.
- **Inputs:** the same 12 physiological + 6 operative POSSUM variables.
- **Output:** the **recalibrated predicted mortality (%)** via the Portsmouth
  equation (ln[R/(1−R)] = −9.065 + 0.1692·phys + 0.1550·op). Class A. Near-
  neighbor: `possum` (the morbidity equation and the original mortality calibration
  stay there) — cross-linked, both kept (P-POSSUM is the better-calibrated low-risk
  mortality estimate).

### 2.3 `sort` — Surgical Outcome Risk Tool (SORT)

- **Citation:** Protopapa KL, Simpson JC, Smith NCE, Moonesinghe SR. Development
  and validation of the Surgical Outcome Risk Tool (SORT). *Br J Surg.*
  2014;101(13):1774-1783.
- **citationUrl:** https://doi.org/10.1002/bjs.9638
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `surgery`, `anesthesiology`, `internal-medicine`.
- **Inputs:** ASA-PS grade, urgency (elective / expedited / urgent / immediate),
  high-risk surgical specialty, surgical severity (xmajor/complex), cancer, age
  ≥65 / ≥80.
- **Output:** the **predicted 30-day mortality (%)** via the logistic model
  (logit = −7.366 + Σ published coefficients; risk = 1/(1+e^−logit)). Class A
  (fixed coefficients). Cross-links `p-possum` and `rcri`.

### 2.4 `goldman-cardiac-risk` — Goldman Cardiac Risk Index

- **Citation:** Goldman L, Caldera DL, Nussbaum SR, et al. Multifactorial index of
  cardiac risk in noncardiac surgical procedures. *N Engl J Med.*
  1977;297(16):845-850.
- **citationUrl:** https://doi.org/10.1056/NEJM197710202971601
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `surgery`, `internal-medicine`,
  `nursing-periop`.
- **Inputs:** the 9 weighted factors — third heart sound/JVD (11), recent MI (10),
  non-sinus rhythm/PACs (7), >5 PVCs/min (7), age >70 (5), emergency surgery (4),
  intraperitoneal/intrathoracic/aortic operation (3), significant aortic stenosis
  (3), poor general medical status (3).
- **Output:** the **total (0–53)** mapped to the published **Class I–IV** cardiac-
  risk bands with the source's cardiac-complication/death rate per class. Class A
  (fixed 1977 weights). Near-neighbor: `rcri` (its successor) — cross-linked.

### 2.5 `wilson-airway` — Wilson Risk Sum Score

- **Citation:** Wilson ME, Spiegelhalter D, Robertson JA, Lesser P. Predicting
  difficult intubation. *Br J Anaesth.* 1988;61(2):211-216.
- **citationUrl:** https://doi.org/10.1093/bja/61.2.211
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `anesthesia`, `emergency-medicine`.
- **Inputs:** the 5 anatomic risk factors, each scored 0–2 — body weight,
  head/neck movement, jaw movement (incl. inter-incisor gap and subluxation),
  receding mandible, buck teeth/overbite.
- **Output:** the **Wilson sum (0–10)** with the published difficult-intubation
  threshold (a score **≥ 2** flags elevated risk). Class A. Near-neighbor:
  `el-ganzouri` (a different multifactor airway index) — cross-linked, both kept.

### 2.6 `surgical-risk-scale` — Surgical Risk Scale

- **Citation:** Sutton R, Bann S, Brooks M, Sarin S. The Surgical Risk Scale as an
  improved tool for risk-adjusted analysis in comparative surgical audit. *Br J
  Surg.* 2002;89(6):763-768.
- **citationUrl:** https://doi.org/10.1046/j.1365-2168.2002.02080.x
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `surgery`, `anesthesiology`, `nursing-periop`.
- **Inputs:** CEPOD operative urgency (elective/scheduled/urgent/emergency), ASA-PS
  grade (1–5), and BUPA operative-magnitude grade (minor → complex major).
- **Output:** the **summed score (3–17)** with the published in-hospital-mortality
  framing for the band. Class A.

## 3. Per-tile robustness

- **`possum` and `p-possum` are TWO (resp. one) logistic equations.** The four
  published coefficient sets (POSSUM R₁/R₂ and the Portsmouth recalibration) are
  **re-fetched verbatim** at implementation (the v97 "re-fetch, never recall
  coefficients" lesson) and embedded as compiled constants
  ([spec-v100](spec-v100.md) §5). Each probability uses an overflow-safe
  `1/(1+e^−x)` with the logit argument clamped to `[−40, 40]`; a blank required
  variable returns a surfaced `valid:false` fallback, never a probability from
  `NaN`. The physiological and operative point assignments clamp each variable to
  its published band.
- **`sort` is a single logistic model**, identically overflow-guarded; the six
  inputs are bounded selects, so the only non-finite path is the exponential,
  which the clamp covers.
- **`goldman-cardiac-risk`, `wilson-airway`, and `surgical-risk-scale` are bounded
  weighted sums** mapped to published bands; they name which factors were counted
  and flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.
- All six render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment or proceed/cancel
  recommendation in Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding
[spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all six are **Class A** — fixed derivation
  papers and coefficients/weights. Each citation names the **journal + authors**
  (not an issuing society), so none trips the `ISSUER_PATTERN` in
  `check-citations.mjs` and **none needs a `docs/citation-staleness.md` row**.
- **Build & gates (§6.1/§6.2):** the six computes live in the new
  `lib/surg-v142.js` module (`possum`, `pPossum`, `sort`, `goldmanCardiacRisk`,
  `wilsonAirway`, `surgicalRiskScale`), added to the
  `test/unit/fuzz-tools.test.js` `MODULES` list — the POSSUM/P-POSSUM/SORT
  logistics explicitly fuzzed for overflow (zero non-finite leaks). Renderers live
  in the new `views/group-v142.js` module; its `RV142` export is spread into the
  `app.js` `RENDERERS` map. The catalog count moves on all **13 catalog-truth
  surfaces** in the same change; a11y, `mobile-no-hscroll`, `mobile-touch-targets`,
  and the chromium `example-correctness` sweep pass for `views/group-v142.js`.

## 5. Files touched

```
docs/spec-v142.md                        (this file)
app.js                                   (+6 UTILITIES rows, group G; import group-v142 RV142 into RENDERERS)
lib/surg-v142.js                         (new module: possum, pPossum, sort, goldmanCardiacRisk, wilsonAirway, surgicalRiskScale)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to rcri, gupta-mica, pospom, ariscat, asa-ps, el-ganzouri)
views/group-v142.js                      (new renderer module: 6 renderers)
docs/clinical-citations.md               (+ rows for the six sources)
test/unit/possum.test.js, p-possum.test.js, sort.test.js, goldman-cardiac-risk.test.js, wilson-airway.test.js, surgical-risk-scale.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/surg-v142.js to MODULES)
docs/audits/v12/possum.md, p-possum.md, sort.md, goldman-cardiac-risk.md, wilson-airway.md, surgical-risk-scale.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 637 -> 643; advance the spec-v100 running ledger)
CHANGELOG.md                             (Unreleased: v142 entry, +6)
README.md, package.json                  (catalog count 637 -> 643; spec-progression line -> v142)
```

## 6. Acceptance criteria

v142 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all six ids are absent.
- All 6 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each
  (including a **POSSUM predicted-mortality value at a defined physiology/operative
  point pair**, a **P-POSSUM vs POSSUM low-risk mortality divergence**, a Goldman
  **Class II→III boundary**, a **Wilson sum ≥ 2 difficult-airway flip**, and a SORT
  worked mortality), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- `possum`/`p-possum`/`sort` guard their logistic(s) (overflow clamp; partial
  inputs render a complete-the-fields fallback); coefficients re-fetched verbatim.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is **643** (or live count + 6) and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md` advances the spec-v100
  ledger.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v142 with the +6 catalog delta.

## 7. Out of scope for v142

- **No automatic proceed/cancel/optimize order** — each tile reports the score/
  predicted risk and the source's interpretation; the operative decision stays with
  the clinician and local protocol ([spec-v11](spec-v11.md) §5.3).
- **No ACS-NSQIP Surgical Risk Calculator** — its coefficients are unpublished;
  it is on the [spec-v100](spec-v100.md) §8 permanent-exclusion list, and POSSUM /
  P-POSSUM / SORT are the free, published substitutes.
- **No APACHE III/IV or MPM-III** — proprietary (Cerner); excluded per §8. The
  free `apache2` and `saps-ii` already ship.
- **No `rcri` re-implementation** — the existing tile stands; `goldman-cardiac-risk`
  is its ancestor, cross-linked, both kept.
