# spec-v201.md — Hepatology & GI-bleed prognosis: the Glasgow-Blatchford score, the CLIF-C AD score, the Hepamet fibrosis score, the CLIP score, and Agile 3+ (+5 tiles)

> Status: **PROPOSED (2026-07-02).** Third feature spec of the **Deep Subspecialty
> Quantitation** program ([spec-v199](spec-v199.md) §1.1). Adds **5** deterministic
> hepatology and upper-GI-bleeding prognostic instruments. **Each tile was verified
> absent by a direct scan of `app.js`** (zero id / name / keyword hits at draft): the
> catalog carries `aims65`, `rockall`, `clif-c-aclf`, `meld-childpugh`, `meld-na`,
> `fib4`, `apri`, `nafld-fibrosis`, `forns-index`, and `albi`, but **not** the
> Glasgow-Blatchford score, the CLIF-C Acute Decompensation score, the Hepamet
> fibrosis score, the CLIP score, or the Agile 3+ score.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v201 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no transfusion, endoscopy, biopsy, transplant, or
> disposition order in Sophie's voice**). **Every point weight, coefficient, and band
> threshold is re-fetched and cross-verified against ≥2 independent open sources at
> implementation** ([spec-v97](spec-v97.md)); uncertain values carry an explicit
> *(verify at implementation, [spec-v97](spec-v97.md))* tag. The implementing session
> **re-runs the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

Hepatology's common scores are carried; this slice adds the depth: the emergency
physician's pre-endoscopy bleeding-risk score that safely selects outpatient
management (Glasgow-Blatchford), the hepatologist's acute-decompensation mortality
model for the cirrhotic who has not crossed into ACLF (CLIF-C AD), a non-invasive
NAFLD fibrosis score built to shrink the indeterminate zone (Hepamet), the HCC
prognostic score that integrates tumor burden with liver function and AFP (CLIP), and
a FibroScan-anchored advanced-fibrosis score (Agile 3+). Each is a transparent
computation, and each is decision support — **never a transfusion, endoscopy, biopsy,
or transplant order**.

## 2. What v201 adds (5 tiles)

### 2.1 `glasgow-blatchford` — Glasgow-Blatchford Score (upper GI bleed)

- **Citation:** Blatchford O, Murray WR, Blatchford M. A risk score to predict need
  for treatment for upper-gastrointestinal haemorrhage. *Lancet.*
  2000;356(9238):1318-1321.
- **citationUrl:** https://doi.org/10.1016/S0140-6736(00)02816-6
- **Group:** G (clinical scoring & risk). **Specialties:** `gastroenterology`,
  `emergency-medicine`, `hepatology`.
- **Inputs:** blood urea (mg/dL or mmol/L, unit-toggled), hemoglobin (with sex-
  specific bands), systolic BP, pulse ≥ 100, melena, syncope, hepatic disease, and
  cardiac failure, each weighted per the published grid *(verify the urea/hemoglobin
  bands at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **GBS total (0–23)** with the interpretation — a **score of 0** (or
  ≤ 1 by the low-risk extension) identifies patients who may be considered for
  outpatient management, higher scores predict need for transfusion / endoscopic
  intervention — naming the contributors. Framed as a pre-endoscopy triage aid. Class
  A. Cross-links `rockall`, `aims65`.

### 2.2 `clif-c-ad` — CLIF-C Acute Decompensation score

- **Citation:** Jalan R, Pavesi M, Saliba F, et al. The CLIF Consortium Acute
  Decompensation score (CLIF-C ADs) for prognosis of hospitalised cirrhotic patients
  without acute-on-chronic liver failure. *J Hepatol.* 2015;62(4):831-840.
- **citationUrl:** https://doi.org/10.1016/j.jhep.2014.11.012
- **Group:** G. **Specialties:** `hepatology`, `gastroenterology`, `critical-care`.
- **Inputs:** age (years), white-cell count (×10⁹/L), sodium (mmol/L), and creatinine
  (mg/dL) — the four predictors — in a hospitalized decompensated cirrhotic **without**
  ACLF.
- **Output:** the **CLIF-C AD score** `10 × [0.03 × age + 0.66 × ln(creatinine) +
  1.71 × ln(WBC) + 0.88 × ... ]` *(the full coefficient/intercept set and the sodium
  term are transcribed verbatim at implementation, [spec-v97](spec-v97.md))* with the
  interpretation banding higher scores to worse 3- and 12-month mortality; framed as
  the companion to CLIF-C ACLF for the pre-ACLF decompensated patient. Class A.
  Cross-links `clif-c-aclf`, `meld-na`.

### 2.3 `hepamet-fibrosis` — Hepamet Fibrosis Score (NAFLD)

- **Citation:** Ampuero J, Pais R, Aller R, et al. Development and Validation of
  Hepamet Fibrosis Scoring System–Based on Simple, Available, and Objective Metrics for
  Advanced Fibrosis in Nonalcoholic Fatty Liver Disease. *Clin Gastroenterol Hepatol.*
  2020;18(1):216-225.e5.
- **citationUrl:** https://doi.org/10.1016/j.cgh.2019.05.051
- **Group:** G. **Specialties:** `hepatology`, `gastroenterology`.
- **Inputs:** age, sex, diabetes status, AST, ALT, albumin, HOMA-IR (or fasting
  glucose + insulin), and platelet count — the published logistic inputs.
- **Output:** the **Hepamet score (0–1)** from the published logistic model *(the
  coefficients are transcribed verbatim at implementation, [spec-v97](spec-v97.md))*
  with the two cut-points — **< 0.12 rules out advanced fibrosis, > 0.47 rules it in,
  0.12–0.47 indeterminate** — framed as a non-invasive score built to shrink the
  FIB-4/NFS grey zone. Class A. Cross-links `fib4`, `nafld-fibrosis`.

### 2.4 `clip-hcc` — CLIP score (Cancer of the Liver Italian Program)

- **Citation:** The Cancer of the Liver Italian Program (CLIP) Investigators. A new
  prognostic system for hepatocellular carcinoma: a retrospective study of 435
  patients. *Hepatology.* 1998;28(3):751-755.
- **citationUrl:** https://doi.org/10.1002/hep.510280322
- **Group:** G. **Specialties:** `hepatology`, `oncology`, `gastroenterology`.
- **Inputs:** the four items scored 0/1/2 — Child-Pugh stage (A/B/C), tumor morphology
  (uninodular ≤ 50% / multinodular ≤ 50% / massive or > 50%), alpha-fetoprotein
  (< 400 vs ≥ 400 ng/mL), and portal-vein thrombosis (no/yes) *(verify the item
  weights at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **CLIP total (0–6)** with the published survival strata, naming the
  contributors; framed as an HCC prognostic score that integrates liver function with
  tumor burden and AFP, complementary to BCLC. Class A. Cross-links `bclc-hcc`,
  `meld-childpugh`, `albi`.

### 2.5 `agile-3plus` — Agile 3+ (advanced-fibrosis, FibroScan-anchored)

- **Citation:** Sanyal AJ, Foucquier J, Younossi ZM, et al. Enhanced diagnosis of
  advanced fibrosis and cirrhosis in individuals with NAFLD using FibroScan-based Agile
  scores. *J Hepatol.* 2023;78(2):247-259.
- **citationUrl:** https://doi.org/10.1016/j.jhep.2022.10.034
- **Group:** G. **Specialties:** `hepatology`, `gastroenterology`.
- **Inputs:** liver stiffness measurement (LSM, kPa) by vibration-controlled transient
  elastography, AST, ALT, platelet count, diabetes status, and sex — the published
  logistic inputs.
- **Output:** the **Agile 3+ probability (0–1)** of advanced (≥ F3) fibrosis from the
  published model *(the coefficients are transcribed verbatim at implementation,
  [spec-v97](spec-v97.md))* with the two cut-points — a **low rule-out** and a **high
  rule-in** threshold, indeterminate between — framed as a FibroScan-anchored score
  that outperforms LSM alone. Class A. Cross-links `hepamet-fibrosis`, `fib4`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** The logistic
  models (CLIF-C AD, Hepamet, Agile 3+) take `ln()` of labs; each clamps its inputs to
  positive physiologic domains and renders a complete-the-fields fallback for a
  non-positive or blank input rather than a `NaN`/`Infinity`.
- **Each tile reports which band applies and names the contributing items**
  ([spec-v59](spec-v59.md)) — the GBS contributors, the CLIF-C AD predictors, the
  Hepamet / Agile cut-point crossed, the CLIP items — so a result is never read
  without its basis.
- **All five render prognosis/triage, not orders** — the GBS as an outpatient-vs-admit
  triage aid, CLIP/CLIF-C AD/Hepamet/Agile as stratifiers; none authors a transfusion,
  endoscopy, biopsy, or transplant order in Sophie's voice ([spec-v11](spec-v11.md)
  §5.3). Each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the band boundaries and at lab extremes.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed point/coefficient
  models, each cited by journal + authors. CLIF-C names the CLIF Consortium and CLIP
  names its investigator group; the implementing session confirms whether either trips
  `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/hepatology-gibleed-v201.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v201.js`; its `RV201` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real `<label for>`.
  Blood urea uses a mg/dL ↔ mmol/L unit toggle (view-only, per the LTC-GA precedent).
  The catalog count moves on all **13 catalog-truth surfaces** using the **live
  `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the
  chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `hepatology`,
  `gastroenterology`, `emergency-medicine`, `critical-care`, `oncology` — all already
  in the vocabulary.

## 5. Files touched

```
docs/spec-v201.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v201 RV201 into RENDERERS)
lib/hepatology-gibleed-v201.js           (new: glasgowBlatchford, clifcAd, hepamet, clip, agile3plus)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to rockall, clif-c-aclf, fib4, bclc-hcc)
views/group-v201.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/glasgow-blatchford.test.js, clif-c-ad.test.js, hepamet.test.js, clip-hcc.test.js, agile-3plus.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/hepatology-gibleed-v201.js to MODULES)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v201 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v201 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **GBS = 0
  low-risk case and a high case**, a **CLIF-C AD spanning a mortality range**, a
  **Hepamet in each of the < 0.12 / indeterminate / > 0.47 bands**, a **CLIP spanning
  its survival strata**, and an **Agile 3+ rule-out vs rule-in pair**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v201 with the +5 delta.

## 7. Out of scope for v201

- **No transfusion / endoscopy / biopsy / transplant / disposition order** — the tiles
  triage and stratify; those decisions stay with the clinician and the patient
  ([spec-v11](spec-v11.md) §5.3).
- **No proprietary elastography output** — Agile 3+ takes the LSM value the operator
  reads from the device; Sophie does not reproduce any vendor's raw elastography
  processing. Any score whose coefficients are not independently reproducible from ≥ 2
  open sources is deferred under [spec-v97](spec-v97.md).
