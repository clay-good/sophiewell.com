# spec-v281.md — Hepatocellular-carcinoma surveillance & detection: the GALAD score and the Toronto HCC Risk Index (+2 tiles)

> Status: **BUILT (2026-07-10).** `galad-hcc` and `toronto-hcc-risk` are live (catalog
> 1142 → 1144), **closing the Advanced Prognostic & Classification Instruments program
> (spec-v278–v281, +7 tiles)**. Every coefficient and point weight was re-fetched and
> cross-verified against ≥ 2 independent open sources per [spec-v97](spec-v97.md): the GALAD
> five coefficients and the Z = -0.63 cutoff agree across the primary paper and independent
> reproductions, and the THRI Table 3 weights were transcribed verbatim from the primary
> Sharma 2017 accepted manuscript (age 0/50/100, etiology autoimmune-or-HCV-SVR 0 / other 36 /
> steatohepatitis 54 / HCV-or-HBV 97, male 80, platelets 0/20/70/89; total 0-366) with the
> low/medium/high < 120 / 120-240 / > 240 bands and the ~3% / 10% / 32% 10-year incidence
> independently corroborated.
>
> Superseded status line — Fourth and final feature spec of the
> **Advanced Prognostic & Classification Instruments** program ([spec-v278](spec-v278.md)
> §1.1). Proposes **2** deterministic instruments a hepatology team reaches for around HCC
> surveillance — how likely is a detected nodule to be HCC given the serum biomarkers, and
> how high is this cirrhotic's future HCC risk. **Each id was verified absent**
> ([spec-v85 §6.2](spec-v85.md)) by a fixed-string scan of the extracted `app.js` id/name
> list: the catalog carries `amap-score`, `page-b`, `clip-hcc`, `bclc-hcc`, `milan-criteria`,
> and `albi-grade`, but **not** the GALAD score or the Toronto HCC Risk Index.
>
> Catalog effect, if built: **live `UTILITIES.length` + 2**, enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)); no number is copied here.
>
> Every prior spec remains in force. v281 adds no runtime network call and no AI; each tile
> obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its citation inline ([spec-v54](spec-v54.md)), inherits the
> [spec-v59](spec-v59.md) output-safety contract, renders the [spec-v50](spec-v50.md) §3
> posture note, and honors [spec-v11](spec-v11.md) §5.3 (**no diagnosis, biopsy, imaging, or
> surveillance-interval order in Sophie's voice** — these compute a probability or a risk
> category; the decision stays with the hepatology team). **Every coefficient, threshold, and
> point weight is re-fetched and cross-verified against ≥2 independent open sources at
> implementation** ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs the
> [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog carries the HCC *staging* and *transplant-eligibility* instruments (BCLC, CLIP,
Milan), the HBV-specific HCC-risk score (PAGE-B), and the aMAP surveillance-risk score. It
does **not** carry the two instruments that bracket HCC surveillance from the biomarker and
the population angle: the **GALAD score**, the serum-biomarker model (Gender, Age, AFP-L3,
AFP, DCP) that estimates the probability a lesion is HCC and outperforms any single
biomarker, and the **Toronto HCC Risk Index (THRI)**, the cirrhosis-cohort score that
stratifies 10-year HCC risk from routinely-available variables. Both are transparent models,
freely reproducible from open sources, and each is decision support — **never a diagnosis or
a surveillance-interval order**.

## 2. What v281 adds (2 tiles)

### 2.1 `galad-hcc` — GALAD score (HCC probability from serum biomarkers)

- **Citation:** Johnson PJ, Pirrie SJ, Cox TF, et al. The detection of hepatocellular
  carcinoma using a prospectively developed and validated model based on serological
  biomarkers. *Cancer Epidemiol Biomarkers Prev.* 2014;23(1):144-153.
- **citationUrl:** https://doi.org/10.1158/1055-9965.EPI-13-0870
- **Group:** G. **Specialties:** `hepatology`, `gastroenterology`, `oncology`.
- **Inputs — five variables:** gender (male/female), age (years), AFP-L3 (%), AFP (ng/mL),
  and DCP / des-γ-carboxy-prothrombin (a.k.a. PIVKA-II, mAU/mL). **Formula (logistic linear
  predictor Z, transcribed and cross-verified at implementation, [spec-v97](spec-v97.md)):**
  Z = −10.08 + 0.09·age + 1.67·sex(male = 1, female = 0) + 2.34·log₁₀(AFP) + 0.04·AFP-L3 +
  1.33·log₁₀(DCP); the probability is the logistic transform of Z, and the model is commonly
  reported at the **Z = −0.63 cutoff** (≈ 85 % sensitivity / 90 % specificity in the
  derivation cohort) *(every coefficient and the cutoff are re-fetched and cross-verified
  against ≥ 2 sources at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **GALAD linear-predictor Z (and its logistic probability)** with the −0.63
  cutoff flagged and the driving biomarkers named, stating the assay-unit assumptions (AFP
  ng/mL, DCP mAU/mL). Framed as the serum-biomarker model that outperforms AFP alone for HCC
  detection; **it reports a probability, never a diagnosis or a biopsy/imaging order**
  ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `amap-score`, `page-b`, `bclc-hcc`.

### 2.2 `toronto-hcc-risk` — Toronto HCC Risk Index (THRI)

- **Citation:** Sharma SA, Kowgier M, Cerocchi O, et al. Toronto HCC risk index: a validated
  scoring system to predict 10-year risk of HCC in patients with cirrhosis. *J Hepatol.*
  2017;S0168-8278(17)32248-1 (online ahead of print).
- **citationUrl:** https://doi.org/10.1016/j.jhep.2017.07.033
- **Group:** G. **Specialties:** `hepatology`, `gastroenterology`.
- **Inputs — four variables, additive** *(each point weight is transcribed verbatim from the
  primary paper at implementation, [spec-v97](spec-v97.md))*: age band, sex, cirrhosis
  etiology (with the higher-risk viral and lower-risk categories weighted separately), and
  platelet-count band. The score sums to a continuous index.
- **Output:** the **THRI total** mapped to the three 10-year-HCC-risk bands — **low
  (< 120), medium (120-240), high (> 240)** — with the approximate 10-year cumulative HCC
  incidence per band stated (≈ 3 % / 10 % / 32 % low/medium/high) and the driving variables
  named. Framed as the cirrhosis-cohort surveillance-risk score complementary to aMAP and
  PAGE-B; **it reports a risk category, never a surveillance-interval order**
  ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `amap-score`, `page-b`, `albi-grade`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** GALAD is a bounded
  logistic of a coefficient sum (with log-domain guards on AFP and DCP > 0); THRI is a bounded
  additive index — each renders a "complete the fields" fallback for a missing input rather
  than a `NaN`, and clamps the GALAD probability to [0, 100] %.
- **Each tile reports its basis** ([spec-v59](spec-v59.md)) — the GALAD Z and its driving
  biomarkers with the −0.63 cutoff, the THRI total with its 10-year risk band — so a result is
  never read without its basis.
- **Both render a probability or category, not an order** ([spec-v11](spec-v11.md) §5.3) and
  render the [spec-v50](spec-v50.md) §3 posture note.
- **Both flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks**,
  fuzzed at the GALAD −0.63 cutoff and the log-domain floors, and at the THRI 120/240 band
  edges.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** both **Class A** — a fixed logistic model and a fixed point
  model, each cited by journal + authors. GALAD depends on assay units (AFP-L3 %, DCP mAU/mL);
  the tile states the assumed units inline. The implementing session confirms whether any
  citation trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the two computes live in a new `lib/hcc-surveillance-v281.js`,
  added to `test/unit/fuzz-tools.test.js` `MODULES`; the GALAD coefficient vector and the THRI
  weight table live as named constants with the source tables cited in a comment. Renderers
  live in a new `views/group-v281.js`; its `RV281` export is spread into the `app.js`
  `RENDERERS` map. Every input carries a real `<label for>`. The catalog count moves on all
  catalog-truth surfaces using the live `UTILITIES.length + 2`; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed `ALLOWED_SPECIALTIES` vocabulary; all tags used
  here already exist.
- **MCP exposure (post-ship):** both are Class A deterministic computes, routinely
  MCP-adaptable — a follow-up MCP wave exposes them per the [spec-v85](spec-v85.md) recipe.
  GALAD self-describes its coefficients and cutoff (so every number in `example.expected`
  appears in the result JSON); THRI echoes its band edges so the round-trip passes.

## 5. Files touched

```
docs/spec-v281.md                        (this file)
app.js                                   (+2 UTILITIES rows; import group-v281 RV281 into RENDERERS)
lib/hcc-surveillance-v281.js             (new: galadHcc, torontoHccRisk + GALAD coefficient + THRI weight constants)
lib/meta.js                              (+2 META entries: inline citation + citationUrl + accessed; cross-links amap-score, page-b, bclc-hcc, albi-grade)
views/group-v281.js                      (new renderer module: 2 renderers)
docs/clinical-citations.md               (+2 rows)
test/unit/galad-hcc.test.js, toronto-hcc-risk.test.js   (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/hcc-surveillance-v281.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+2; record the v281 delta + close the program)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+2; spec-progression line)
```

## 6. Acceptance criteria

v281 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed both ids are absent (as verified at draft).
- Both tiles are live (Class A) with a `META[id]` entry, inline citation + `citationUrl` +
  `accessed`, and ≥ 3 worked examples each — including a **GALAD crossing the −0.63 cutoff**
  (a below-cutoff and an above-cutoff biomarker set) and a **THRI spanning a low and a high
  10-year-risk band**.
- The GALAD five-coefficient logistic (with its cutoff) and the THRI four-variable weight
  table are reproduced from the primary papers and re-verified against ≥ 2 independent
  references at implementation ([spec-v97](spec-v97.md)); the GALAD assay units are stated
  inline.
- Every compute is finite-guarded, routes through `lib/num.js`, clamps the GALAD probability
  to [0, 100] %, guards the AFP/DCP log domains, and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 2** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, and `npm run build` all pass; the CHANGELOG records v281
  with the +2 delta and **closes the Advanced Prognostic & Classification Instruments
  program**.

## 7. Out of scope for v281

- **No diagnosis, biopsy, imaging, or surveillance-interval order** — the tiles compute a
  probability or a risk band; diagnosis and surveillance planning stay with the hepatology
  team ([spec-v11](spec-v11.md) §5.3).
- **No GALADUS/GAAD variants and no assay-unit auto-conversion** — this slice adds the
  canonical GALAD and the THRI only; the ultrasound-augmented GALADUS and the GAAD (AFP+DCP)
  reductions are deferred, and the tile assumes the published assay units rather than
  converting between DCP assays. If the GALAD coefficients or the THRI weight table cannot be
  reproduced from ≥ 2 open sources at implementation, that tile is parked (not approximated),
  per [spec-v97](spec-v97.md) and the [spec-v259](spec-v259.md) precedent.
