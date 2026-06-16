# spec-v94.md — Hematology & oncology prognostic scores: HScore, IPSS-R, FLIPI/IPI, MASCC, and Sokal/ELTS (+5 tiles)

> Status: **SHIPPED (2026-06-16).** Wave 2 feature spec of the
> [spec-v85](spec-v85.md) Advanced Clinical Calculators program. Adds **5**
> deterministic heme/onc prognostic scores that fill a confirmed gap in the
> catalog's malignancy surface: the HScore for reactive hemophagocytic syndrome,
> the revised IPSS-R for myelodysplastic syndromes, the FLIPI/IPI lymphoma indices,
> the MASCC risk index for febrile neutropenia, and the Sokal/ELTS risk scores for
> chronic myeloid leukemia. The catalog ships the heme bedside cluster — `anc`,
> `khorana`, `four-ts`, `isth-dic`, and the [spec-v88](spec-v88.md) `tls-cairo-bishop`
> — but **no malignancy-prognosis scores.** None of these five duplicates an
> existing tile.
>
> Catalog effect at v94 close: **401 + 5 = 406 tiles.**
>
> Every prior spec (v4 through v93) remains in force. v94 adds no runtime network
> call and no AI; each tile obeys the [spec-v85](spec-v85.md) §2 doctrine, passes
> the [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md) output-safety
> contract.

## 1. Thesis

The catalog already carries the heme/onc *bedside* cluster — the absolute
neutrophil count (`anc`), the Khorana VTE-risk score (`khorana`), the 4Ts score for
HIT (`four-ts`), the ISTH DIC score (`isth-dic`), and the
[spec-v88](spec-v88.md) Cairo-Bishop tumor-lysis grade (`tls-cairo-bishop`). What it
does **not** carry is the malignancy-*prognosis* layer: the scores an oncologist or
hematologist computes to stratify a new diagnosis, set the survival expectation, and
choose the disposition. Five are textbook, validated, deterministic, and currently
absent:

- **HLH/MAS is a weighted diagnostic score, not gestalt.** The HScore (Fardet 2014)
  turns nine inputs — immunosuppression, fever band, organomegaly, cytopenia count,
  ferritin, triglycerides, fibrinogen, AST, and marrow hemophagocytosis — into a
  0–337 total with a published probability-of-HLH curve. A clinician should run the
  weights, not recall them.

- **MDS prognosis is the IPSS-R.** The revised IPSS-R (Greenberg 2012) weights the
  cytogenetic risk group, marrow blast %, hemoglobin, platelets, and ANC into a band
  (very low → very high) with cited median survival and AML-evolution times. The
  cytogenetic risk groups are a small published constant table compiled into the
  module ([spec-v85](spec-v85.md) §5).

- **Lymphoma risk is the FLIPI and the IPI.** The Follicular Lymphoma IPI
  (Solal-Céligny 2004) and the International Prognostic Index for aggressive NHL
  (1993) are the two standard five-factor lymphoma indices; each maps a 0–5 count to
  a survival band.

- **Febrile-neutropenia disposition turns on the MASCC index.** The MASCC risk index
  (Klastersky 2000) identifies the low-risk patient (≥21) who is a candidate for
  outpatient/oral management — the highest-leverage disposition question in the
  oncology fever workup.

- **CML risk at diagnosis is Sokal and ELTS.** The Sokal relative-risk (1984) and the
  EUTOS long-term-survival (ELTS) score (Pfirrmann 2016) are the standard
  at-diagnosis CML stratifiers, each a hazard formula over age, spleen size,
  platelets, and blast %.

Each is a published, deterministic instrument the heme/onc clinician already uses;
v94 brings them onto the page next to the bedside cluster.

## 2. What v94 adds (5 tiles)

### 2.1 `hscore-hlh` — HScore for reactive hemophagocytic syndrome (HLH/MAS)

- **Citation:** Fardet L, Galicier L, Lambotte O, et al. Development and validation of
  the HScore, a score for the diagnosis of reactive hemophagocytic syndrome.
  *Arthritis Rheumatol.* 2014;66(9):2613-2620.
- **citationUrl:** https://doi.org/10.1002/art.38690
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `rheumatology`, `critical-care`,
  `infectious-disease`.
- **Inputs:** known underlying immunosuppression (y/n); temperature band;
  organomegaly (none / hepatomegaly or splenomegaly / both); number of cytopenias
  (1 / 2 / 3 lineages); ferritin band; triglyceride band; fibrinogen band; AST;
  hemophagocytosis features on marrow aspirate (y/n).
- **Output:** the **weighted HScore total (0–337)** with the published
  probability-of-HLH curve (e.g., a total ~169 ≈ 93–100% probability vs a total < 90
  ≈ < 1%), the per-input point contributions shown as a derivation, and the source's
  interpretation that the optimal cutoff (~169) maximizes sensitivity/specificity.
  Class A. Cross-links `anc`, `isth-dic`, `tls-cairo-bishop`.

### 2.2 `ipss-r-mds` — Revised International Prognostic Scoring System (MDS)

- **Citation:** Greenberg PL, Tuechler H, Schanz J, et al. Revised international
  prognostic scoring system for myelodysplastic syndromes. *Blood.*
  2012;120(12):2454-2465.
- **citationUrl:** https://doi.org/10.1182/blood-2012-03-420489
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`.
- **Inputs:** cytogenetic risk group (very good / good / intermediate / poor / very
  poor); bone-marrow blast %; hemoglobin; platelet count; absolute neutrophil count.
- **Output:** the **weighted IPSS-R total** mapped to its risk category — very low
  (≤ 1.5), low (> 1.5–3), intermediate (> 3–4.5), high (> 4.5–6), very high (> 6) —
  with the cited median overall survival and time-to-25%-AML-evolution per band, and
  the point contributions as a derivation. Class A. **Note:** the cytogenetic risk
  groups are compiled constants ([spec-v85](spec-v85.md) §5), not a browsable table.
  Cross-links `anc`.

### 2.3 `flipi` — Follicular Lymphoma IPI (FLIPI) + IPI for aggressive NHL

- **Citation:** Solal-Céligny P, Roy P, Colombat P, et al. Follicular lymphoma
  international prognostic index. *Blood.* 2004;104(5):1258-1265 (FLIPI); The
  International Non-Hodgkin's Lymphoma Prognostic Factors Project. A predictive model
  for aggressive non-Hodgkin's lymphoma. *N Engl J Med.* 1993;329(14):987-994 (IPI).
- **citationUrl:** https://doi.org/10.1182/blood-2003-12-4434
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`.
- **Inputs (FLIPI):** age > 60; Ann Arbor stage III/IV; hemoglobin < 12 g/dL;
  > 4 nodal areas; LDH > normal. **Inputs (IPI):** age > 60; stage III/IV;
  ECOG ≥ 2; LDH > normal; > 1 extranodal site.
- **Output:** the **FLIPI total (0–5)** banded low (0–1), intermediate (2), high
  (≥ 3) and the **IPI total (0–5)** banded low / low-intermediate / high-intermediate
  / high, each with the source's cited survival, and the factor list as a derivation.
  Class A. Cross-link `anc`.

### 2.4 `mascc` — MASCC Risk Index for febrile neutropenia

- **Citation:** Klastersky J, Paesmans M, Rubenstein EB, et al. The Multinational
  Association for Supportive Care in Cancer risk index: a multinational scoring system
  for identifying low-risk febrile neutropenic cancer patients. *J Clin Oncol.*
  2000;18(16):3038-3051.
- **citationUrl:** https://doi.org/10.1200/JCO.2000.18.16.3038
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `oncology`, `hematology`, `emergency-medicine`,
  `infectious-disease`.
- **Inputs:** burden of illness (no/mild symptoms = 5, moderate = 3); no hypotension
  (5); no COPD (4); solid tumor or no prior fungal infection (4); no dehydration
  needing IV fluids (3); outpatient at fever onset (3); age < 60 (2).
- **Output:** the **MASCC total (max 26)**; a total **≥ 21 identifies LOW risk** for
  serious medical complications (a candidate for outpatient / oral management), with
  the point contributions shown and the source's interpretation quoted. The tile
  reports the risk index only and does not author the admission decision (§7).
  Class A. Cross-link `anc`.

### 2.5 `sokal-cml` — Sokal / ELTS risk scores for chronic myeloid leukemia

- **Citation:** Sokal JE, Cox EB, Baccarani M, et al. Prognostic discrimination in
  "good-risk" chronic granulocytic leukemia. *Blood.* 1984;63(4):789-799 (Sokal);
  Pfirrmann M, Baccarani M, Saussele S, et al. Prognosis of long-term survival
  considering disease-specific death in patients with CML. *Leukemia.*
  2016;30(1):48-56 (ELTS).
- **citationUrl:** https://doi.org/10.1182/blood.V63.4.789.789
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`.
- **Inputs:** age (years); spleen size (cm below the costal margin); platelet count;
  peripheral-blood blast %.
- **Output:** the **Sokal relative-risk** value banded low (< 0.8), intermediate
  (0.8–1.2), high (> 1.2), and the **ELTS score** with its low / intermediate / high
  band, each shown as a derivation of the published hazard formula. Class A.
  **Robustness:** the `exp`/`ln` domains in the Sokal hazard formula are guarded so a
  zero/negative platelet or blast input returns a surfaced `valid:false` fallback
  rather than `NaN`/`Infinity`.

## 3. Per-tile robustness

- **Categorical inputs are clamped to their allowed set.** The HScore temperature /
  ferritin / triglyceride / fibrinogen / cytopenia-count / organomegaly selectors,
  the IPSS-R cytogenetic group, the MASCC burden-of-illness level, and the FLIPI/IPI
  factor toggles map only to their published point values; an out-of-set value falls
  through to the lowest contribution and the tile never sums an `undefined`.
- **`sokal-cml` guards the `exp`/`ln` domains** in the Sokal hazard formula (and the
  ELTS fractional-power term): logarithms and exponentials of zero, negative, or
  non-finite platelet / blast / spleen / age inputs return a surfaced `valid:false`
  fallback rather than emitting `NaN` or `Infinity` to the DOM
  ([spec-v59](spec-v59.md)).
- **The IPSS-R cytogenetic risk groups are compiled constants**
  ([spec-v85](spec-v85.md) §5) inside `lib/hemonc-v94.js` — a fixed five-level point
  map, not a `data/` file and not a browsable corpus ([spec-v29](spec-v29.md) §3).
- **Partial-input fallback is explicit.** Each tile computes from the factors entered
  and surfaces which inputs are still missing rather than silently scoring a blank as
  zero where that would be clinically misleading; the binary FLIPI/IPI/MASCC factors
  default unchecked (= absent) and the derivation shows the running subtotal.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness** on import via
  `test/unit/fuzz-tools.test.js`; zero non-finite leaks is a merge gate.
- **Clinical posture note ([spec-v50](spec-v50.md) §3):** each tile renders the
  source's own per-band interpretation attributed to the cited authority and the
  user's inputs, and authors no treatment or disposition recommendation in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

This spec instantiates the [spec-v85](spec-v85.md) §6 CI/CD contract.

- **Maintenance class — all five are Class A** ([spec-v85](spec-v85.md) §6.3):
  published fixed-coefficient scores (HScore point weights, the IPSS-R point table,
  the FLIPI/IPI five-factor counts, the MASCC point table, the Sokal/ELTS hazard
  coefficients). They carry **no `docs/citation-staleness.md` row**; they can only
  change by retraction/supersession, caught by the routine README-stats / citation
  re-verification pass ([spec-v85](spec-v85.md) §6.3 cadence). No Class B threshold is
  introduced, so the §6.3 cadence job adds no row.
- **Merge gates ([spec-v85](spec-v85.md) §6.2):** `eslint`, `grep-check.mjs`,
  `check-output-safety.mjs`, `check-citations.mjs` (acronyms here are MASCC/CML/MDS
  paper names, not revisable society issuers — no staleness row demanded),
  `check-catalog-truth.mjs` (the 13 enforced surfaces equal `UTILITIES.length`),
  `a11y-check.mjs`, and the Playwright `all-tools` / `smoke` / `mobile-no-hscroll` /
  `mobile-touch-targets` suites all pass.
- **Fuzz harness:** `lib/hemonc-v94.js` is added to the `MODULES` list in
  `test/unit/fuzz-tools.test.js`; zero non-finite leaks across fuzzed inputs (the
  `exp`/`ln` guards in `sokalCml` are the load-bearing case).
- **`example-correctness` pin (chromium):** each tile's `META` worked example renders
  **verbatim** on the page — flake-prone under CPU load, CI `retries:2`; rerun
  isolated to confirm.
- **`npm run build`** needs no per-tile script change: the `UTILITIES` row, the
  `lib/` compute, the `views/group-v20.js` renderer, and the `lib/meta.js` entry are
  all the builder already parses; it stamps `BUILD_HASH`, pre-renders the five
  `/tools/<id>/index.html` pages as `MedicalCalculator`, regenerates the sitemap /
  topic hubs / service-worker shell precache, and rebuilds the SBOM (the changed
  serialNumber is legitimate — commit it).

## 5. Files touched

```
docs/spec-v94.md                         (this file)
app.js                                   (+5 UTILITIES rows, group G; import group-v20 renderers into RENDERERS)
lib/hemonc-v94.js                        (new module: hscoreHlh, ipssrMds, flipi, mascc, sokalCml)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links anc, khorana, tls-cairo-bishop)
views/group-v20.js                       (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows for the five heme/onc prognostic sources)
test/unit/hscore-hlh.test.js             (new; ≥3 boundary worked examples incl. the probability-band edge)
test/unit/ipss-r-mds.test.js             (new; ≥3 incl. the category-edge cases at 1.5/3/4.5/6)
test/unit/flipi.test.js                  (new; ≥3 incl. FLIPI ≥3 high and the IPI band edges)
test/unit/mascc.test.js                  (new; ≥3 incl. the ≥21 low-risk cut)
test/unit/sokal-cml.test.js              (new; ≥3 incl. the Sokal 0.8/1.2 band edges + guarded-domain fallback)
test/unit/fuzz-tools.test.js             (add lib/hemonc-v94.js to MODULES)
docs/audits/v12/hscore-hlh.md, ipss-r-mds.md, flipi.md, mascc.md, sokal-cml.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 401 -> 406; append to the running ledger)
CHANGELOG.md                             (Unreleased: v94 entry, +5)
README.md, package.json                  (catalog count 401 -> 406; spec-progression line -> v94)
```

## 6. Acceptance criteria

v94 is fully shipped when:

- All 5 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples in the unit test
  (including the band-flip cases), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 scope check.
- `hscore-hlh` returns the weighted total and the correct probability band across the
  HScore curve (e.g., a high total in the ~169 ≈ 93–100% band and a low total in the
  < 90 ≈ < 1% band).
- `ipss-r-mds` maps the weighted total to the correct category at the **1.5 / 3 / 4.5
  / 6 band edges** and reports the cited per-band survival/AML-evolution.
- `flipi` returns the **FLIPI ≥ 3 high** band and the correct **IPI low /
  low-int / high-int / high** band for the corresponding factor counts.
- `mascc` returns the total and flags **LOW risk at ≥ 21** (and not-low at 20),
  reporting the index only.
- `sokal-cml` returns the Sokal relative-risk banded at the **0.8 / 1.2 edges** and
  the ELTS band, and returns a surfaced `valid:false` fallback (never `NaN`/`Infinity`)
  on a guarded `exp`/`ln` domain (zero/negative platelet or blast input).
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is **406** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run test:e2e`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v94 with the +5 catalog delta.

## 7. Out of scope for v94

- **No molecular / NGS-based risk models.** The IPSS-M (and any gene-panel-driven
  successor) requires a sequencing panel as input and a large input surface; it is
  **deferred**, not shipped here. v94 ships the IPSS-R, the clinical/cytogenetic
  standard.
- **No chemotherapy regimen selection.** The tiles stratify prognosis; they do not
  choose or dose a regimen (carboplatin dosing lives in
  [spec-v88](spec-v88.md) `calvert-carboplatin`).
- **No auto-admission / auto-disposition.** `mascc` reports the risk index and the
  source's low-risk-candidate interpretation only; the decision to admit, treat as an
  outpatient, or escalate stays with the clinician and local protocol
  ([spec-v11](spec-v11.md) §5.3).
```
