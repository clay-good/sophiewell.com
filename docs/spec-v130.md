# spec-v130.md — Urology: prostate metrics & risk: prostate volume, PSA density, PSA velocity, PSA doubling time, D'Amico risk, and Gleason Grade Group (+6 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 5** (GI / hepatology / nephrology /
> acid-base / urology). Adds **6** deterministic prostate-metric and prostate-cancer-
> risk instruments that fill a confirmed urology gap. None duplicates a live tile.
>
> Catalog effect: **571 + 6 = 577 tiles.**
>
> Every prior spec (v4 through v129) remains in force. v130 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine
> (re-binding the [spec-v85](spec-v85.md) §2 doctrine) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has essentially no urology calculator surface; the standard prostate
metrics that drive PSA interpretation, biopsy decisions, and risk stratification are
all absent:

- **There is no prostate-volume tile** — the ellipsoid biometry (AP × TR × CC × 0.523)
  that every TRUS/MRI report needs and that PSA density depends on.
- **There is no PSA density** — serum PSA divided by prostate volume, the standard
  refinement for the biopsy decision.
- **There is no PSA velocity** — the rate of PSA rise (ng/mL/yr).
- **There is no PSA doubling time** — months to double, the biochemical-recurrence
  kinetics measure.
- **There is no D'Amico risk classification** — the low/intermediate/high biochemical-
  recurrence stratification from PSA, Gleason, and clinical stage.
- **There is no Gleason Grade Group** — the 2014 ISUP mapping from Gleason sum/pattern
  to Grade Groups 1–5; an ordinal classification, not a reference table.

Each is a published, deterministic instrument; v130 establishes the prostate
metrics-and-risk cluster.

## 2. What v130 adds (6 tiles)

### 2.1 `prostate-volume` — Prostate volume (ellipsoid)

- **Citation:** Terris MK, Stamey TA. Determination of prostate volume by
  transrectal ultrasound. *J Urol.* 1991;145(5):984-987.
- **citationUrl:** https://doi.org/10.1016/S0022-5347(17)38505-9
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `urology`, `interventional-radiology`, `oncology`.
- **Inputs:** the three prostate dimensions — anteroposterior, transverse, and
  craniocaudal (cm).
- **Output:** **volume = AP × TR × CC × 0.523** (mL ≈ g), feeding PSA density. Class A.
  Cross-links (v130) `psa-density`.

### 2.2 `psa-density` — PSA density

- **Citation:** Benson MC, Whang IS, Pantuck A, et al. Prostate specific antigen
  density: a means of distinguishing benign prostatic hypertrophy and prostate cancer.
  *J Urol.* 1992;147(3 Pt 2):815-816.
- **citationUrl:** https://doi.org/10.1016/S0022-5347(17)37393-7
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `urology`, `oncology`, `internal-medicine`.
- **Inputs:** serum PSA (ng/mL) and prostate volume (mL).
- **Output:** **PSA density = PSA ÷ volume** (ng/mL per mL), with the commonly-cited
  flag (> 0.15 raises cancer concern). Class A. Cross-links `prostate-volume`.

### 2.3 `psa-velocity` — PSA velocity

- **Citation:** Carter HB, Pearson JD, Metter EJ, et al. Longitudinal evaluation of
  prostate-specific antigen levels in men with and without prostate disease. *JAMA.*
  1992;267(16):2215-2220.
- **citationUrl:** https://doi.org/10.1001/jama.1992.03480160073037
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `urology`, `oncology`, `internal-medicine`.
- **Inputs:** at least two PSA values with their dates (the tool fits the rate over the
  interval).
- **Output:** the **PSA velocity (ng/mL/yr)**, with the commonly-cited concern
  threshold (> 0.75 ng/mL/yr). Class A. Cross-links (v130) `psa-doubling-time`.

### 2.4 `psa-doubling-time` — PSA doubling time

- **Citation:** Pound CR, Partin AW, Eisenberger MA, et al. Natural history of
  progression after PSA elevation following radical prostatectomy. *JAMA.*
  1999;281(17):1591-1597.
- **citationUrl:** https://doi.org/10.1001/jama.281.17.1591
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `urology`, `oncology`, `internal-medicine`.
- **Inputs:** at least two PSA values with their dates.
- **Output:** the **PSA doubling time (months) = ln(2) ÷ slope of ln-PSA over time**,
  with the recurrence-kinetics reading (shorter = more aggressive). Class A.
  Cross-links `psa-velocity`.

### 2.5 `damico-prostate-risk` — D'Amico risk classification

- **Citation:** D'Amico AV, Whittington R, Malkowicz SB, et al. Biochemical outcome
  after radical prostatectomy, external beam radiation therapy, or interstitial
  radiation therapy for clinically localized prostate cancer. *JAMA.*
  1998;280(11):969-974.
- **citationUrl:** https://doi.org/10.1001/jama.280.11.969
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `urology`, `oncology`, `internal-medicine`.
- **Inputs:** serum PSA (ng/mL), Gleason score, and clinical T stage.
- **Output:** the **D'Amico risk group — low, intermediate, or high** (the worst-
  qualifying of the three criteria governs), naming which feature drove the
  classification. Class A. **Cross-links** (v130) `gleason-grade-group` and
  (v131) `capra-score`.

### 2.6 `gleason-grade-group` — Gleason Grade Group (2014 ISUP)

- **Citation:** Epstein JI, Egevad L, Amin MB, et al. The 2014 International Society of
  Urological Pathology (ISUP) consensus conference on Gleason grading of prostatic
  carcinoma. *Am J Surg Pathol.* 2016;40(2):244-252.
- **citationUrl:** https://doi.org/10.1097/PAS.0000000000000530
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `urology`, `pathology`, `oncology`.
- **Inputs:** the primary and secondary Gleason patterns (each 3–5).
- **Output:** the **Grade Group (1–5)** mapped from the Gleason sum and pattern split
  (6 → GG1; 3+4=7 → GG2; 4+3=7 → GG3; 8 → GG4; 9–10 → GG5), an ordinal classification
  rendering the group's description. Class A. **Near-neighbor:** `damico-prostate-risk`
  — cross-linked.

## 3. Per-tile robustness

- **`prostate-volume`, `psa-density`, `psa-velocity`, and `psa-doubling-time` guard
  their math.** Dimensions and volume must be positive (PSA density guards the volume
  denominator > 0); the velocity/doubling-time fits require ≥ 2 distinct dated PSA
  values with a positive time interval and positive PSA (the `ln-PSA` slope guards the
  `ln` domain), returning a surfaced `valid:false` fallback otherwise. The doubling-
  time `ln(2)/slope` guards a zero or negative slope (stable/falling PSA → "not
  doubling").
- **`damico-prostate-risk` and `gleason-grade-group` are ordinal classifications.**
  D'Amico takes the worst-qualifying criterion and reports which drove it; the Grade
  Group maps the pattern pair (validated to 3–5 each) to GG1–5. Both flow through the
  [spec-v59](spec-v59.md) fuzz harness and name the governing input — neither is a
  browsable reference table (each consumes inputs and computes a class, per
  [spec-v100](spec-v100.md) §2).
- All six render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). Each compute uses `lib/num.js` and joins the fuzz
  harness with zero non-finite leaks.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all six tiles are **Class A** (fixed formulas and
  the fixed 2014 ISUP/D'Amico definitions) — **no** `docs/citation-staleness.md` row.
  The citations name the **journal and authors** (J Urol/Terris-Stamey and Benson,
  JAMA/Carter, Pound, and D'Amico, Am J Surg Pathol/Epstein), **not** a society
  acronym (AUA/ISUP); phrasing the Gleason citation to lead with **Epstein, et al.**
  rather than "ISUP" keeps it off the `ISSUER_PATTERN` staleness gate
  ([spec-v94](spec-v94.md) lesson).
- **Build & gates (§6.1/§6.2):** `lib/uro-v130.js` (computes `prostateVolume`,
  `psaDensity`, `psaVelocity`, `psaDoublingTime`, `damicoProstateRisk`,
  `gleasonGradeGroup`) is added to `test/unit/fuzz-tools.test.js` `MODULES` (zero
  non-finite leaks, with the `ln-PSA` slope and density division explicitly fuzzed);
  the renderer is `views/group-v130.js` with its `RV130` export added to the `app.js`
  `RENDERERS` spread. Each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for
  `views/group-v130.js`.

## 5. Files touched

```
docs/spec-v130.md                        (this file)
app.js                                   (+6 UTILITIES rows, groups E/G; import group-v130 renderers into RENDERERS)
lib/uro-v130.js                          (new module: prostateVolume, psaDensity, psaVelocity, psaDoublingTime, damicoProstateRisk, gleasonGradeGroup)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links among the prostate cluster + capra-score)
views/group-v130.js                      (new renderer module: 6 renderers; RV130 export; incl. the multi-date PSA input for velocity/doubling-time)
docs/clinical-citations.md               (+ rows for the six sources)
test/unit/prostate-volume.test.js, psa-density.test.js, psa-velocity.test.js, psa-doubling-time.test.js, damico-prostate-risk.test.js, gleason-grade-group.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/uro-v130.js to MODULES)
docs/audits/v12/prostate-volume.md, psa-density.md, psa-velocity.md, psa-doubling-time.md, damico-prostate-risk.md, gleason-grade-group.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 571 -> 577)
CHANGELOG.md                             (Unreleased: v130 entry, +6)
README.md, package.json                  (catalog count 571 -> 577; spec-progression line -> v130)
```

## 6. Acceptance criteria

v130 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  six ids are absent from the live catalog.
- All 6 tiles in §2 are live (groups E/G) with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each — including a
  worked prostate volume feeding a PSA density crossing 0.15, a PSA velocity crossing
  0.75 ng/mL/yr, a doubling-time computed from two dated PSAs (and a stable-PSA "not
  doubling" guard), a D'Amico low/intermediate boundary flip by the worst criterion,
  and a **Gleason 3+4 → Grade Group 2 vs 4+3 → Grade Group 3** mapping — a
  [spec-v11](spec-v11.md) audit log each, and a passing [spec-v29](spec-v29.md) §3
  check.
- The PSA-kinetics tiles require ≥ 2 distinct dated values and guard the `ln-PSA`
  slope; `psa-density`/`prostate-volume` guard their denominators/dimensions;
  `gleason-grade-group` validates patterns 3–5; partial inputs render a complete-the-
  fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- No tile carries a `docs/citation-staleness.md` row (all Class A); the citations name
  journals/authors, not societies.
- `UTILITIES.length` is **577** (or the then-current live count + 6 if specs land out
  of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v130 with the +6 catalog delta.

## 7. Out of scope for v130

- **No biopsy, TRUS, or MRI image parsing** — the clinician enters the dimensions,
  PSA values, Gleason patterns, and stage; no image or pathology feed.
- **No IPSS/AUA-SI symptom index** — the IPSS/AUA-SI question text is licensed and
  excluded per [spec-v100](spec-v100.md) §8; v130 ships the freely-derived metrics
  only.
- **No auto-biopsy, auto-treatment, or active-surveillance order** — each tile reports
  the metric/risk group and the source's stated interpretation; the management decision
  stays with the clinician and local protocol ([spec-v11](spec-v11.md) §5.3).
