# spec-v211.md — Hematology-oncology risk stratification: the EUTOS score, the ELN 2022 AML genetic-risk classification, COMPASS-CAT, the IMPROVEDD VTE score, and the HCT-CI (+5 tiles)

> Status: **PROPOSED (2026-07-02).** Third feature spec of the **Advanced Prognostic &
> Risk-Equation Instruments** program ([spec-v209](spec-v209.md) §1.1). Adds **5**
> deterministic hematology-oncology risk-stratification instruments. **Each tile was
> verified absent by a direct scan of `app.js`** (zero id / name / keyword hits at draft):
> the catalog carries the CML tools `sokal-cml` and `hasford-cml`, the myeloid/lymphoid
> scores `ipss`, `ipss-r-mds`, `dipss-mf`, `dipss-plus-mf`, `flipi`, `flipi-2`,
> `myeloma-iss`, `myeloma-r-iss`, and `myeloma-r2-iss`, and the VTE tools `khorana`,
> `padua`, `improve-vte`, `improve-bleeding`, `impede-vte`, `dash-vte`, and `vte-bleed`,
> but **not** the EUTOS score, the ELN 2022 AML genetic-risk classification, COMPASS-CAT,
> the IMPROVEDD VTE score, or the HCT-CI.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v211 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine and the §6 CI/CD contract, passes
> the [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no chemotherapy order, transplant decision, thrombo-
> prophylaxis order, or disposition in Sophie's voice** — these stratify risk; the decision
> stays with the hematologist, the oncologist, and the patient). **Every point weight,
> cytogenetic/molecular category, and risk band is re-fetched and cross-verified against
> ≥2 independent open sources at implementation** ([spec-v97](spec-v97.md)); uncertain
> values carry an explicit *(verify at implementation, [spec-v97](spec-v97.md))* tag. The
> implementing session **re-runs the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 2. What v211 adds (5 tiles)

### 2.1 `eutos` — EUTOS score (CML response / progression-free survival on imatinib)

- **Citation:** Hasford J, Baccarani M, Hoffmann V, et al. Predicting complete cytogenetic
  response and subsequent progression-free survival in 2060 patients with CML on imatinib
  treatment: the EUTOS score. *Blood.* 2011;118(3):686-692.
- **citationUrl:** https://doi.org/10.1182/blood-2010-12-319038
- **Group:** G (clinical scoring & risk). **Specialties:** `hematology`, `oncology`.
- **Inputs:** peripheral-blood basophils (% of leukocytes) and spleen size (cm palpable
  below the left costal margin) at diagnosis, before tyrosine-kinase-inhibitor therapy.
- **Output:** the **EUTOS score** = `7 × basophils(%) + 4 × spleen(cm)`, dichotomized at
  **≤ 87 (low risk) vs > 87 (high risk)** *(the cut-point and the associated 18-month
  complete-cytogenetic-response and 5-year progression-free-survival rates are quoted from
  the source at implementation, [spec-v97](spec-v97.md))* — naming the value and the risk
  group. Framed as a simple two-variable baseline CML risk score complementing Sokal and
  Hasford; **not** a therapy-selection order. Class A. Cross-links `sokal-cml`,
  `hasford-cml`.

### 2.2 `eln-2022-aml` — ELN 2022 genetic-risk classification (acute myeloid leukemia)

- **Citation:** Döhner H, Wei AH, Appelbaum FR, et al. Diagnosis and management of AML in
  adults: 2022 recommendations from an international expert panel on behalf of the ELN.
  *Blood.* 2022;140(12):1345-1377.
- **citationUrl:** https://doi.org/10.1182/blood.2022016867
- **Group:** G. **Specialties:** `hematology`, `oncology`.
- **Inputs:** the diagnostic cytogenetic and molecular findings — the favorable lesions
  (t(8;21), inv(16)/t(16;16), *NPM1* mutation without *FLT3*-ITD, bZIP in-frame *CEBPA*),
  the adverse lesions (complex/monosomal karyotype, −5/del(5q), −7, −17/abn(17p),
  *TP53* mutation, *RUNX1*, *ASXL1*, *BCOR*, *EZH2*, *SF3B1*, *SRSF2*, *STAG2*, *U2AF1*,
  *ZRSR2*, *KMT2A* rearrangements, *MECOM*, *BCR::ABL1*), and *FLT3*-ITD status — selected
  as present/absent *(the exact 2022 category membership and the *FLT3*-ITD reclassification
  from the 2017 edition are transcribed verbatim at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **ELN 2022 risk category — favorable / intermediate / adverse** — a
  structured deterministic classification (**not** an arithmetic score) that names the
  specific lesion(s) driving the category and the precedence rule (an adverse lesion
  overrides an otherwise-favorable *NPM1*). Framed as the standard genetic risk framework
  that informs post-remission strategy including transplant candidacy; **not** a transplant
  or therapy order. Class A. Cross-links `myeloma-r-iss`, `ipss-r-mds`.

### 2.3 `compass-cat` — COMPASS-CAT (ambulatory cancer-associated VTE risk)

- **Citation:** Gerotziafas GT, Taher A, Abdel-Razeq H, et al. A predictive score for
  thrombosis associated with breast, colorectal, lung, or ovarian cancer: the prospective
  COMPASS-CAT study. *Oncologist.* 2017;22(10):1222-1231.
- **citationUrl:** https://doi.org/10.1634/theoncologist.2016-0414
- **Group:** G. **Specialties:** `oncology`, `hematology`, `internal-medicine`.
- **Inputs:** the cancer-related items (anti-hormonal or anthracycline therapy, time since
  cancer diagnosis, advanced-stage tumor, central venous catheter), the patient-related and
  comorbid items (cardiovascular risk factors, recent hospitalization for acute medical
  illness, personal history of VTE), and the platelet count *(the item point weights are
  transcribed verbatim at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **COMPASS-CAT total** dichotomized at the published cut-point into **low
  vs intermediate/high** 6-month VTE risk, naming the total and the driving items. Framed as
  a risk-assessment model developed specifically for ambulatory patients with breast,
  colorectal, lung, or ovarian cancer on active treatment — a complement to Khorana; **not**
  a thromboprophylaxis order. Class A. Cross-links `khorana`, `padua`.

### 2.4 `improvedd` — IMPROVEDD VTE risk score (medical inpatients, D-dimer-augmented)

- **Citation:** Gibson CM, Spyropoulos AC, Cohen AT, et al. The IMPROVEDD VTE risk score:
  incorporation of D-dimer into the IMPROVE score to improve venous thromboembolism risk
  stratification. *TH Open.* 2017;1(1):e56-e65.
- **citationUrl:** https://doi.org/10.1055/s-0037-1603929
- **Group:** G. **Specialties:** `hematology`, `internal-medicine`, `hospital-medicine`.
- **Inputs:** the seven IMPROVE items (previous VTE, known thrombophilia, current lower-limb
  paralysis, current cancer, immobilization ≥ 7 days, ICU/CCU stay, age > 60) plus a
  **D-dimer ≥ 2× the upper limit of normal (+2 points)** *(the IMPROVE weights and the
  D-dimer increment are transcribed verbatim at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **IMPROVEDD total** with the associated **short-term VTE risk band** and
  the score threshold (≥ 2) above which extended thromboprophylaxis is discussed in the
  guidelines, naming the total and the contributing items — and showing how adding the
  D-dimer reclassifies risk relative to IMPROVE alone. Framed as the D-dimer-augmented
  inpatient medical-VTE stratifier; **not** a prophylaxis order. Class A. Cross-links
  `improve-vte`, `improve-bleeding`.

### 2.5 `hct-ci` — Hematopoietic Cell Transplantation Comorbidity Index (Sorror HCT-CI)

- **Citation:** Sorror ML, Maris MB, Storb R, et al. Hematopoietic cell transplantation
  (HCT)-specific comorbidity index: a new tool for risk assessment before allogeneic HCT.
  *Blood.* 2005;106(8):2912-2919.
- **citationUrl:** https://doi.org/10.1182/blood-2005-05-2004
- **Group:** G. **Specialties:** `hematology`, `oncology`, `transplant-medicine`.
- **Inputs:** the weighted comorbidity set — arrhythmia, cardiac, cerebrovascular,
  psychiatric, hepatic (mild vs moderate/severe), obesity (BMI > 35), infection, rheumatologic,
  peptic ulcer, moderate/severe renal, moderate pulmonary vs severe pulmonary, prior solid
  tumor, heart-valve disease, inflammatory bowel disease, and diabetes — each scored 1, 2,
  or 3 per the published weights *(all comorbidity definitions and weights are transcribed
  verbatim at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **HCT-CI total** with the risk grouping **0 (low) / 1–2 (intermediate) /
  ≥ 3 (high)** and the associated non-relapse-mortality and overall-survival gradient from
  the source, naming the total and the contributing comorbidities. Framed as the standard
  pre-transplant comorbidity index used to weigh allogeneic-HCT risk; **not** a transplant
  eligibility decision. Class A. Cross-links `eln-2022-aml`, `ipss-r-mds`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** `eutos`,
  `compass-cat`, `improvedd`, and `hct-ci` are bounded summed point tables; `eln-2022-aml`
  is a structured categorical classification (favorable/intermediate/adverse) with an
  explicit precedence rule. Each clamps its inputs to the published domains and renders a
  complete-the-fields fallback for a missing item rather than a partial result.
- **Each tile reports which band / category applies and names its inputs**
  ([spec-v59](spec-v59.md)) — the EUTOS low/high split, the ELN category and the lesion(s)
  that set it, the COMPASS-CAT band, the IMPROVEDD band, the HCT-CI risk group — so a result
  is never read without its basis.
- **All five render risk stratification, not orders** — none authors a chemotherapy,
  transplant, or thromboprophylaxis order in Sophie's voice ([spec-v11](spec-v11.md) §5.3);
  each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks**, fuzzed at the band boundaries and at basophil / spleen / platelet / point-total
  extremes.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed published weights /
  categories, each cited by journal + authors. The implementing session confirms whether any
  citation (e.g. the ELN society wording) trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a `docs/citation-staleness.md`
  row only if the live pattern matches; the **ELN 2022** classification carries a
  `docs/citation-staleness.md` row regardless, as a periodically revised consensus that will
  be superseded by a future edition.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/heme-onc-risk-v211.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v211.js`; its `RV211` export is spread into the
  `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog count
  moves on all **13 catalog-truth surfaces** using the **live `UTILITIES.length` + 5**;
  a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium `example-correctness`
  sweep pass.
- **Specialties** are drawn from the closed vocabulary: `hematology`, `oncology`,
  `transplant-medicine`, `internal-medicine`, `hospital-medicine`; the implementing session
  adds any tag missing from `ALLOWED_SPECIALTIES`.

## 5. Files touched

```
docs/spec-v211.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v211 RV211 into RENDERERS)
lib/heme-onc-risk-v211.js                (new: eutos, eln2022Aml, compassCat, improvedd, hctCi)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to sokal-cml, khorana, improve-vte, ipss-r-mds)
views/group-v211.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
docs/citation-staleness.md               (+1 row: eln-2022-aml)
test/unit/eutos.test.js, eln-2022-aml.test.js, compass-cat.test.js, improvedd.test.js, hct-ci.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/heme-onc-risk-v211.js to MODULES)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v211 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v211 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **EUTOS crossing
  the 87 cut-point**, an **ELN 2022 favorable / intermediate / adverse triple that exercises
  the adverse-overrides-*NPM1* precedence rule**, a **COMPASS-CAT low vs high pair**, an
  **IMPROVEDD showing the D-dimer reclassification**, and an **HCT-CI across the 0 / 1–2 /
  ≥ 3 groups**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v211 with the +5 delta.

## 7. Out of scope for v211

- **No chemotherapy / transplant / thromboprophylaxis order** — the tiles stratify risk;
  the treat, transplant, and prophylaxis decisions stay with the clinician and the patient
  ([spec-v11](spec-v11.md) §5.3).
- **No proprietary or non-reproducible model** — any score whose weights are not
  reproducible from ≥ 2 open sources is deferred under [spec-v97](spec-v97.md).

<!-- Program note: v211 is the hematology-oncology risk-stratification slice of the
Advanced Prognostic & Risk-Equation Instruments program (v209–v212). Five fully published,
deterministic, order-free instruments (four point tables + one structured genetic
classification). Each tile was verified absent at draft. -->
