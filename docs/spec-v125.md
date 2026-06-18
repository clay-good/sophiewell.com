# spec-v125.md — Hepatology severity & encephalopathy: PELD, CLIF-C ACLF, Glasgow alcoholic hepatitis, West Haven, and Hepatic Steatosis Index (+5 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 5** (GI / hepatology / nephrology /
> acid-base / urology). Adds **5** deterministic hepatology severity and
> encephalopathy instruments that fill confirmed gaps beside `meld-childpugh`. None
> duplicates a live tile.
>
> Catalog effect: **545 + 5 = 550 tiles.**
>
> Every prior spec (v4 through v124) remains in force. v125 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine
> (re-binding the [spec-v85](spec-v85.md) §2 doctrine) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog scores chronic liver disease (`meld-childpugh`) and, with v124, objective
liver function (`albi-grade`) and fibrosis — but the **severity and complication**
instruments hepatologists reach for in acute deterioration are absent:

- **There is no pediatric MELD (PELD)** — the under-12 transplant-listing score; the
  adult `meld-childpugh` does not apply to small children.
- **There is no CLIF-C ACLF score** — the acute-on-chronic liver failure mortality
  model used in decompensated cirrhosis with organ failure.
- **There is no Glasgow Alcoholic Hepatitis Score (GAHS)** — the 28/84-day mortality
  score that, with the existing severity context, guides steroid candidacy.
- **There is no West Haven (Conn) HE grade** — the canonical 0–4 hepatic
  encephalopathy classification; an ordinal decision rule, not a reference table.
- **There is no Hepatic Steatosis Index** — the NAFLD screen that joins the v124
  Fatty Liver Index.

Each is a published, deterministic instrument; v125 completes the acute-hepatology
severity cluster.

## 2. What v125 adds (5 tiles)

### 2.1 `peld-score` — Pediatric End-Stage Liver Disease (PELD)

- **Citation:** McDiarmid SV, Anand R, Lindblad AS; SPLIT Research Group. Development
  of a pediatric end-stage liver disease score to predict poutcomes in children
  awaiting liver transplantation. *Transplantation.* 2002;74(2):173-181.
- **citationUrl:** https://doi.org/10.1097/00007890-200207270-00006
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hepatology`, `transplant`, `pediatrics`, `gastroenterology`.
- **Inputs:** albumin (g/dL), total bilirubin (mg/dL), INR, age (< 1 yr flag), and
  growth failure (< −2 SD flag).
- **Output:** **PELD = 4.80 × ln(bilirubin) + 18.57 × ln(INR) − 6.87 × ln(albumin) +
  4.36 (if age < 1 yr) + 6.67 (if growth failure)**, with labs floored at 1.0 per the
  published convention. Class A (fixed 2002 coefficients). Cross-links
  `meld-childpugh`.

### 2.2 `clif-c-aclf` — CLIF-C ACLF score

- **Citation:** Jalan R, Saliba F, Pavesi M, et al. Development and validation of a
  prognostic score to predict mortality in patients with acute-on-chronic liver
  failure. *J Hepatol.* 2014;61(5):1038-1047.
- **citationUrl:** https://doi.org/10.1016/j.jhep.2014.06.012
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hepatology`, `critical-care`, `transplant`, `internal-medicine`.
- **Inputs:** the CLIF Organ Failure sub-scores (liver/kidney/brain/coagulation/
  circulation/respiratory), age (yr), and WBC (×10⁹/L).
- **Output:** **CLIF-C ACLF = 10 × [0.33 × CLIF-OF + 0.04 × age + 0.63 × ln(WBC) −
  2]**, reporting the CLIF-OF sub-total and the mortality-risk framing. Class A
  (fixed 2014 coefficients). Cross-links `qsofa-sofa` and `meld-childpugh`.

### 2.3 `gahs` — Glasgow Alcoholic Hepatitis Score

- **Citation:** Forrest EH, Evans CD, Stewart S, et al. Analysis of factors predictive
  of mortality in alcoholic hepatitis and derivation and validation of the Glasgow
  alcoholic hepatitis score. *Gut.* 2005;54(8):1174-1179.
- **citationUrl:** https://doi.org/10.1136/gut.2004.050781
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hepatology`, `gastroenterology`, `critical-care`,
  `internal-medicine`.
- **Inputs:** age, WBC, blood urea, INR (or PT ratio), and total bilirubin — each
  banded to its published 1–3 point assignment.
- **Output:** the **GAHS total (5–12)**, with the published cut-point (**≥ 9** marks
  higher 28/84-day mortality and the cohort in which corticosteroids showed benefit).
  Class A (fixed banded points). Cross-links `meld-childpugh`.

### 2.4 `west-haven-he` — West Haven (Conn) hepatic encephalopathy grade

- **Citation:** Conn HO, Leevy CM, Vlahcevic ZR, et al. Comparison of lactulose and
  neomycin in the treatment of chronic portal-systemic encephalopathy: a double-blind
  controlled trial. *Gastroenterology.* 1977;72(4 Pt 1):573-583.
- **citationUrl:** https://doi.org/10.1016/S0016-5085(77)80135-2
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hepatology`, `gastroenterology`, `critical-care`, `nursing-icu`.
- **Inputs:** the clinical-state selectors (consciousness level, behavior/intellect,
  asterixis/neuromuscular findings) the clinician observes.
- **Output:** the **West Haven grade — 0 (minimal), 1, 2, 3, or 4 (coma)** — an
  ordinal classification computed from the selected findings, rendering the grade's
  description. Class A (the criteria are a fixed 1977 definition). Cross-links
  (v124) `albi-grade` and `meld-childpugh`.

### 2.5 `hepatic-steatosis-index` — Hepatic Steatosis Index (HSI)

- **Citation:** Lee JH, Kim D, Kim HJ, et al. Hepatic steatosis index: a simple
  screening tool reflecting nonalcoholic fatty liver disease. *Dig Liver Dis.*
  2010;42(7):503-508.
- **citationUrl:** https://doi.org/10.1016/j.dld.2009.08.002
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hepatology`, `gastroenterology`, `internal-medicine`.
- **Inputs:** ALT (U/L), AST (U/L), BMI (kg/m²), sex, and diabetes (yes/no).
- **Output:** **HSI = 8 × (ALT/AST) + BMI (+ 2 if female) (+ 2 if diabetes)**, with
  the published bands (< 30.0 rules NAFLD out; > 36.0 rules it in). Class A. **Near-
  neighbor:** (v124) `fatty-liver-index` — cross-linked, both kept (different inputs).

## 3. Per-tile robustness

- **`peld-score`, `clif-c-aclf`, and `hepatic-steatosis-index` guard their logs.**
  Every `ln` argument (bilirubin, INR, albumin, WBC) and the HSI `ALT/AST` ratio must
  have a strictly-positive denominator/argument; a non-positive or blank value yields
  a surfaced `valid:false` fallback rather than a number from `ln(0)` or division by
  zero. `peld-score` floors labs at 1.0 before the log per the published convention.
- **`gahs` and `west-haven-he` are bounded ordinal logic.** GAHS sums banded 1–3
  points (5–12); West Haven maps the selected findings to a single 0–4 grade. Both
  flow through the [spec-v59](spec-v59.md) fuzz harness and name which criteria were
  counted; West Haven is a classification, not a sum, and reports the matched grade.
- All five render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). Each compute uses `lib/num.js` and joins the fuzz
  harness with zero non-finite leaks.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all five tiles are **Class A** (fixed derivation
  papers, coefficients, and criteria definitions) — **no** `docs/citation-staleness.md`
  row. The citations name the **journal and authors** (Transplantation/McDiarmid,
  J Hepatol/Jalan, Gut/Forrest, Gastroenterology/Conn, Dig Liver Dis/Lee), **not** a
  society acronym, so none trips the `ISSUER_PATTERN` staleness gate.
- **Build & gates (§6.1/§6.2):** `lib/hep-v125.js` (computes `peldScore`,
  `clifCAclf`, `gahs`, `westHavenHe`, `hepaticSteatosisIndex`) is added to
  `test/unit/fuzz-tools.test.js` `MODULES` (zero non-finite leaks, with the log math
  explicitly fuzzed for overflow); the renderer is `views/group-v125.js` with its
  `RV125` export added to the `app.js` `RENDERERS` spread. Each `META` example is
  pinned by the chromium `example-correctness` sweep; the catalog count moves on all
  **13 catalog-truth surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target
  checks pass for `views/group-v125.js`.

## 5. Files touched

```
docs/spec-v125.md                        (this file)
app.js                                   (+5 UTILITIES rows, group G; import group-v125 renderers into RENDERERS)
lib/hep-v125.js                          (new module: peldScore, clifCAclf, gahs, westHavenHe, hepaticSteatosisIndex)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to meld-childpugh, qsofa-sofa, albi-grade, fatty-liver-index)
views/group-v125.js                      (new renderer module: 5 renderers; RV125 export)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/peld-score.test.js, clif-c-aclf.test.js, gahs.test.js, west-haven-he.test.js, hepatic-steatosis-index.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/hep-v125.js to MODULES)
docs/audits/v12/peld-score.md, clif-c-aclf.md, gahs.md, west-haven-he.md, hepatic-steatosis-index.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 545 -> 550)
CHANGELOG.md                             (Unreleased: v125 entry, +5)
README.md, package.json                  (catalog count 545 -> 550; spec-progression line -> v125)
```

## 6. Acceptance criteria

v125 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  five ids are absent from the live catalog.
- All 5 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each — including
  a worked PELD with the age-<1 and growth-failure flags, a CLIF-C ACLF from a CLIF-OF
  sub-total, a **GAHS 8→9 mortality-band flip**, the West Haven grade-2/grade-3
  boundary, and an HSI 30/36 band crossing — a [spec-v11](spec-v11.md) audit log each,
  and a passing [spec-v29](spec-v29.md) §3 check.
- The log-based tiles guard every `ln` domain and the HSI ratio denominator;
  `peld-score` floors labs at 1.0; `west-haven-he` returns a single ordinal grade;
  partial inputs render a complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- No tile carries a `docs/citation-staleness.md` row (all Class A); the citations name
  journals/authors, not societies.
- `UTILITIES.length` is **550** (or the then-current live count + 5 if specs land out
  of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v125 with the +5 catalog delta.

## 7. Out of scope for v125

- **No EEG, ammonia-feed, or imaging parsing** — `west-haven-he` takes the
  clinician's observed clinical state, not an instrument feed.
- **No FibroScan/elastography or proprietary steatosis assays** — excluded per
  [spec-v100](spec-v100.md) §8; `hepatic-steatosis-index` is the free serum screen.
- **No auto-steroid, auto-listing, or auto-lactulose order** — each tile reports the
  score/grade and the source's stated interpretation; the management decision stays
  with the clinician and local protocol ([spec-v11](spec-v11.md) §5.3).
