# spec-v124.md — Hepatology function & fibrosis: ALBI grade, MELD-XI, Forns index, BARD score, Fatty Liver Index, and Lok index (+6 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 5** (GI / hepatology / nephrology /
> acid-base / urology). Adds **6** deterministic hepatology function-and-fibrosis
> instruments that fill confirmed gaps beside `meld-childpugh` and `fib4`. None
> duplicates a live tile.
>
> Catalog effect: **539 + 6 = 545 tiles.**
>
> Every prior spec (v4 through v123) remains in force. v124 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine
> (re-binding the [spec-v85](spec-v85.md) §2 doctrine) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has the dominant prognostic liver model (`meld-childpugh`) and one
non-invasive fibrosis index (`fib4`), but the family of objective liver-function
grades and serum fibrosis surrogates that clinicians read **alongside** them is
absent:

- **There is no ALBI grade** — the albumin-bilirubin score that grades liver
  function objectively (no subjective ascites/encephalopathy terms), now standard
  in HCC staging beside Child-Pugh.
- **There is no MELD-XI** — the INR-excluding MELD used when anticoagulation makes
  INR uninterpretable (LVAD, mechanical valves); it sits beside `meld-childpugh`.
- **There is no Forns index** — the four-variable non-invasive HCV fibrosis
  estimator, a near-neighbor of `fib4` and the absent `apri`.
- **There is no BARD score** — the three-variable NAFLD advanced-fibrosis rule-out.
- **There is no Fatty Liver Index** — the steatosis-probability index (companion to
  the v125 Hepatic Steatosis Index).
- **There is no Lok index** — the cirrhosis-probability model from platelets,
  AST/ALT, and INR.

Each is a published, deterministic instrument a hepatologist already uses; v124
brings them onto the page beside the existing liver cluster.

## 2. What v124 adds (6 tiles)

### 2.1 `albi-grade` — Albumin-Bilirubin (ALBI) grade

- **Citation:** Johnson PJ, Berhane S, Kagebayashi C, et al. Assessment of liver
  function in patients with hepatocellular carcinoma: a new evidence-based approach —
  the ALBI grade. *J Clin Oncol.* 2015;33(6):550-558.
- **citationUrl:** https://doi.org/10.1200/JCO.2014.57.9151
- **Group:** Clinical Math & Conversions (`E`); cross-listed Clinical Scoring & Risk
  (`G`) for the grade band.
- **Specialties:** `hepatology`, `oncology`, `gastroenterology`,
  `internal-medicine`.
- **Inputs:** serum albumin (g/L) and total bilirubin (µmol/L), with unit helpers
  for g/dL and mg/dL entry.
- **Output:** **ALBI score = (log₁₀ bilirubin × 0.66) + (albumin × −0.085)**, then the
  **grade — 1 (≤ −2.60), 2 (> −2.60 to ≤ −1.39), 3 (> −1.39)** — naming the
  better/worse-function reading. Class A (fixed 2015 coefficients). Cross-links
  `meld-childpugh`.

### 2.2 `meld-xi` — MELD excluding INR

- **Citation:** Heuman DM, Mihas AA, Habib A, et al. MELD-XI: a rational approach to
  patients with end-stage liver disease requiring anticoagulation. *Liver Transpl.*
  2007;13(1):30-37.
- **citationUrl:** https://doi.org/10.1002/lt.20906
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `hepatology`, `transplant`, `critical-care`,
  `internal-medicine`.
- **Inputs:** total bilirubin (mg/dL) and serum creatinine (mg/dL).
- **Output:** **MELD-XI = 5.11 × ln(bilirubin) + 11.76 × ln(creatinine) + 9.44**,
  with the published lower-bound flooring (lab values floored at 1.0 before the log so
  the score cannot go negative). Class A (fixed 2007 coefficients). **Near-neighbor:**
  `meld-childpugh` — cross-linked, both kept; MELD-XI is for the
  anticoagulated/uninterpretable-INR case.

### 2.3 `forns-index` — Forns index for HCV fibrosis

- **Citation:** Forns X, Ampurdanès S, Llovet JM, et al. Identification of chronic
  hepatitis C patients without hepatic fibrosis by a simple predictive model.
  *Hepatology.* 2002;36(4 Pt 1):986-992.
- **citationUrl:** https://doi.org/10.1053/jhep.2002.36128
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `hepatology`, `gastroenterology`, `internal-medicine`.
- **Inputs:** age (yr), GGT (U/L), platelet count (×10⁹/L), and total cholesterol
  (mmol/L), with a mg/dL cholesterol helper.
- **Output:** **Forns = 7.811 − 3.131 × ln(platelets) + 0.781 × ln(GGT) + 3.467 ×
  ln(age) − 0.014 × cholesterol**, with the published rule-out (< 4.2) and rule-in
  (> 6.9) thresholds named, and the indeterminate band flagged. Class A.
  Cross-links `fib4`.

### 2.4 `bard-score` — BARD score for NAFLD advanced fibrosis

- **Citation:** Harrison SA, Oliver D, Arnold HL, et al. Development and validation of
  a simple NAFLD clinical scoring system for identifying patients without advanced
  disease. *Gut.* 2008;57(10):1441-1447.
- **citationUrl:** https://doi.org/10.1136/gut.2007.146019
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hepatology`, `gastroenterology`, `internal-medicine`.
- **Inputs:** BMI (≥ 28 → 1 point), AST/ALT ratio (≥ 0.8 → 2 points), and diabetes
  (yes → 1 point).
- **Output:** the **weighted total (0–4)**, with the published rule: a score of
  **2–4** carries an odds ratio ~17 for advanced fibrosis, while **0–1** is a robust
  rule-out — naming which components scored. Class A. Cross-links `fib4` and (v124)
  `forns-index`.

### 2.5 `fatty-liver-index` — Fatty Liver Index (FLI)

- **Citation:** Bedogni G, Bellentani S, Miglioli L, et al. The Fatty Liver Index: a
  simple and accurate predictor of hepatic steatosis in the general population. *BMC
  Gastroenterol.* 2006;6:33.
- **citationUrl:** https://doi.org/10.1186/1471-230X-6-33
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `hepatology`, `gastroenterology`, `internal-medicine`.
- **Inputs:** triglycerides (mg/dL), BMI (kg/m²), GGT (U/L), and waist circumference
  (cm).
- **Output:** the logistic **FLI (0–100) = e^y / (1 + e^y) × 100**, where
  **y = 0.953 × ln(TG) + 0.139 × BMI + 0.718 × ln(GGT) + 0.053 × waist − 15.745**,
  with the published bands (< 30 rules steatosis out; ≥ 60 rules it in). Class A.
  Cross-links (v125) `hepatic-steatosis-index`.

### 2.6 `lok-index` — Lok index for cirrhosis

- **Citation:** Lok AS, Ghany MG, Goodman ZD, et al. Predicting cirrhosis in patients
  with hepatitis C based on standard laboratory tests: results of the HALT-C cohort.
  *Hepatology.* 2005;42(2):282-292.
- **citationUrl:** https://doi.org/10.1002/hep.20772
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `hepatology`, `gastroenterology`, `internal-medicine`.
- **Inputs:** platelet count (×10⁹/L), AST (U/L), ALT (U/L), and INR.
- **Output:** the logistic **Lok probability = e^x / (1 + e^x)**, where
  **x = −5.56 − 0.0089 × platelets + 1.26 × (AST/ALT) + 5.27 × INR**, with the
  published cutoffs (< 0.2 rules cirrhosis out; > 0.5 rules it in). Class A.
  Cross-links `lok-index`'s neighbors `forns-index` and `fib4`.

## 3. Per-tile robustness

- **The log-ratio / logistic indices (`albi-grade`, `forns-index`,
  `fatty-liver-index`, `lok-index`) guard their domains.** Every `ln`/`log₁₀`
  argument (bilirubin, GGT, platelets, age, triglycerides, creatinine) must be
  strictly positive; a non-positive or blank value yields a surfaced `valid:false`
  fallback, never a number from `ln(0)` or `ln(−x)`. The logistic conversions use an
  overflow-safe `1/(1+e^-x)` so an extreme `y`/`x` returns 0 or 100, not `Infinity`.
- **`meld-xi` floors each lab at 1.0 before the log** (per the published convention)
  so the score cannot go negative, and guards `ln(bilirubin)`/`ln(creatinine)`.
- **`bard-score` is bounded threshold logic** (0–4); it flows through the
  [spec-v59](spec-v59.md) fuzz harness and names which components scored.
- All six render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). Each compute uses `lib/num.js` and joins the fuzz
  harness with zero non-finite leaks.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all six tiles are **Class A** (fixed derivation
  papers and coefficients) — **no** `docs/citation-staleness.md` row. The citations
  name the **journal and authors** (J Clin Oncol/Johnson, Liver Transpl/Heuman,
  Hepatology/Forns and Lok, Gut/Harrison, BMC Gastroenterol/Bedogni), **not** a
  society acronym (AASLD/EASL), so none trips the `ISSUER_PATTERN` staleness gate
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson).
- **Build & gates (§6.1/§6.2):** `lib/hep-v124.js` (computes `albiGrade`, `meldXi`,
  `fornsIndex`, `bardScore`, `fattyLiverIndex`, `lokIndex`) is added to
  `test/unit/fuzz-tools.test.js` `MODULES` (zero non-finite leaks, with the logistic
  and log-ratio math explicitly fuzzed for overflow); the renderer is
  `views/group-v124.js` (continuing the `group-vNN` sequence) with its `RV124`
  export added to the `app.js` `RENDERERS` spread. Each `META` example is pinned by
  the chromium `example-correctness` sweep; the catalog count moves on all **13
  catalog-truth surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks
  pass for `views/group-v124.js`.

## 5. Files touched

```
docs/spec-v124.md                        (this file)
app.js                                   (+6 UTILITIES rows, groups E/G; import group-v124 renderers into RENDERERS)
lib/hep-v124.js                          (new module: albiGrade, meldXi, fornsIndex, bardScore, fattyLiverIndex, lokIndex)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to meld-childpugh, fib4, hepatic-steatosis-index)
views/group-v124.js                      (new renderer module: 6 renderers; RV124 export)
docs/clinical-citations.md               (+ rows for the six sources)
test/unit/albi-grade.test.js, meld-xi.test.js, forns-index.test.js, bard-score.test.js, fatty-liver-index.test.js, lok-index.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/hep-v124.js to MODULES)
docs/audits/v12/albi-grade.md, meld-xi.md, forns-index.md, bard-score.md, fatty-liver-index.md, lok-index.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 539 -> 545)
CHANGELOG.md                             (Unreleased: v124 entry, +6)
README.md, package.json                  (catalog count 539 -> 545; spec-progression line -> v124)
```

## 6. Acceptance criteria

v124 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  six ids are absent from the live catalog (and distinct from the existing
  `meld-childpugh`/`fib4`).
- All 6 tiles in §2 are live (groups E/G) with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each — including
  an **ALBI grade-1/grade-2 boundary flip at score −2.60**, a worked MELD-XI with
  floored labs, a Forns rule-out/indeterminate boundary at 4.2, a BARD 1→2 flip, an
  FLI 30/60 band crossing, and a Lok 0.2/0.5 crossing — a [spec-v11](spec-v11.md)
  audit log each, and a passing [spec-v29](spec-v29.md) §3 check.
- The log-ratio/logistic tiles guard every `ln`/`log₁₀` domain and use overflow-safe
  logistics; `meld-xi` floors labs at 1.0; partial inputs render a complete-the-fields
  fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- No tile carries a `docs/citation-staleness.md` row (all Class A); the citations name
  journals/authors, not societies.
- `UTILITIES.length` is **545** (or the then-current live count + 6 if specs land out
  of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v124 with the +6 catalog delta.

## 7. Out of scope for v124

- **No biopsy, elastography, or imaging parsing** — the fibrosis indices take the
  clinician's entered labs/biometry, not a pathology or FibroScan feed.
- **No FibroScan/transient-elastography or FibroTest/FibroSure** — excluded per
  [spec-v100](spec-v100.md) §8 (licensed/assay).
- **No auto-staging or transplant-listing decision** — each tile reports the
  score/grade and the source's stated interpretation; the management decision stays
  with the clinician and local protocol ([spec-v11](spec-v11.md) §5.3).
