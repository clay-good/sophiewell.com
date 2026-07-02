# spec-v199.md — Myeloid-neoplasm & transplant prognosis: the EUTOS long-term survival score, MIPSS70, GIPSS, MYSEC-PM, and the HCT-CI (+5 tiles)

> Status: **PROPOSED (2026-07-02).** First feature spec of the **Deep Subspecialty
> Quantitation** program (umbrella below, §1.1), advancing the long-horizon
> [scope-mdcalc-parity.md](scope-mdcalc-parity.md) commitment to carry every
> clinically actionable calculator. Adds **5** deterministic myeloid-neoplasm and
> transplant prognostic instruments. **Each tile was verified absent by a direct scan
> of `app.js`** (zero id / name / keyword hits at draft): the catalog carries `sokal`,
> `hasford`, `dipss-plus-mf`, `ipss-r`, `myeloma-r2-iss`, and `ipset-thrombosis`, but
> **not** the EUTOS long-term survival score (ELTS), MIPSS70, GIPSS, MYSEC-PM, or the
> hematopoietic-cell-transplantation comorbidity index (HCT-CI).
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v199 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine (re-binding
> [spec-v85](spec-v85.md) §2) and the §6 CI/CD contract, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no transplant, conditioning, chemotherapy, or
> disposition order in Sophie's voice** — these stratify prognosis; the decision stays
> with the treating hematologist, the transplant team, and the patient). **Every point
> weight, coefficient, and risk band is re-fetched and cross-verified against ≥2
> independent open sources at implementation** ([spec-v97](spec-v97.md)); uncertain
> values carry an explicit *(verify at implementation, [spec-v97](spec-v97.md))* tag.
> The implementing session **re-runs the [spec-v85 §6.2](spec-v85.md) collision
> check** first.

### 1.1 Program umbrella — Deep Subspecialty Quantitation (v199–v203)

The [scope-mdcalc-parity.md](scope-mdcalc-parity.md) tail that remains after the
**Advanced Specialist Quantitation** program ([spec-v193](spec-v193.md)–[spec-v198](spec-v198.md))
is the deepest specialist stratum: the myeloid-malignancy prognostic scores a
hematologist uses at diagnosis, the intensivist's whole-database severity and organ-
dysfunction models, the hepatologist's decompensation and fibrosis math, the
cardiologist's multivariable survival engines, and the perioperative / fracture /
frailty instruments that gate a surgical or geriatric decision. Each slice is a set of
five deterministic, cited, actionable instruments confirmed absent from the catalog:

- **[spec-v199](spec-v199.md)** — myeloid-neoplasm & transplant prognosis (this spec).
- **[spec-v200](spec-v200.md)** — advanced critical-care severity & acid-base.
- **[spec-v201](spec-v201.md)** — hepatology & GI-bleed prognosis.
- **[spec-v202](spec-v202.md)** — cardiovascular & heart-failure risk engines.
- **[spec-v203](spec-v203.md)** — perioperative, fracture & frailty risk.

Each slice follows the same contract; further slices may follow.

## 2. What v199 adds (5 tiles)

### 2.1 `elts` — EUTOS Long-Term Survival score (CML)

- **Citation:** Pfirrmann M, Baccarani M, Saussele S, et al. Prognosis of long-term
  survival considering disease-specific death in patients with chronic myeloid
  leukemia. *Leukemia.* 2016;30(1):48-56.
- **citationUrl:** https://doi.org/10.1038/leu.2015.261
- **Group:** G (clinical scoring & risk). **Specialties:** `hematology`, `oncology`.
- **Inputs:** age (years), spleen size (cm below costal margin), peripheral-blood
  blasts (%), and platelet count (×10⁹/L) at diagnosis, chronic-phase CML.
- **Output:** the **ELTS score** `0.0025 × (age/10)³ + 0.0615 × spleen + 0.1052 ×
  blasts + 0.4104 × (platelets/1000)^−0.5` *(verify the exponent forms and constants
  at implementation, [spec-v97](spec-v97.md))* with the three risk groups — **low
  ≤ 1.5680, intermediate > 1.5680 to ≤ 2.2185, high > 2.2185** — naming which factor
  dominates. Framed as the modern replacement for Sokal in the TKI era, weighting
  disease-specific death. Class A. Cross-links `sokal`, `hasford`.

### 2.2 `mipss70` — MIPSS70 (primary myelofibrosis, transplant-age)

- **Citation:** Guglielmelli P, Lasho TL, Rotunno G, et al. MIPSS70:
  Mutation-Enhanced International Prognostic Score System for Transplantation-Age
  Patients With Primary Myelofibrosis. *J Clin Oncol.* 2018;36(4):310-318.
- **citationUrl:** https://doi.org/10.1200/JCO.2017.76.4886
- **Group:** G. **Specialties:** `hematology`, `oncology`.
- **Inputs:** the weighted items — hemoglobin < 10 g/dL (+1), leukocytes > 25 ×10⁹/L
  (+2), platelets < 100 ×10⁹/L (+2), circulating blasts ≥ 2% (+1), bone-marrow
  fibrosis grade ≥ 2 (+1), constitutional symptoms (+1), absence of *CALR* type-1/like
  mutation (+1), presence of a high-molecular-risk mutation (+1), and ≥ 2 high-
  molecular-risk mutations (+2) *(verify weights at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **MIPSS70 total (0–12)** with the three-tier band — **low 0–1,
  intermediate 2–4, high ≥ 5** — naming the contributors; framed as the
  transplantation-age prognostic model that adds mutation and cytogenetic data to the
  clinical picture. Class A. Cross-links `dipss-plus-mf`, `gipss`.

### 2.3 `gipss` — GIPSS (genetically inspired prognostic scoring system, PMF)

- **Citation:** Tefferi A, Guglielmelli P, Nicolosi M, et al. GIPSS: genetically
  inspired prognostic scoring system for primary myelofibrosis. *Leukemia.*
  2018;32(7):1631-1642.
- **citationUrl:** https://doi.org/10.1038/s41375-018-0107-z
- **Group:** G. **Specialties:** `hematology`, `oncology`.
- **Inputs:** the purely genetic/cytogenetic items — VHR (very-high-risk) karyotype
  (+2) or unfavorable karyotype (+1); absence of *CALR* type-1/like (+1); presence of
  an *ASXL1* mutation (+1); *SRSF2* mutation (+1); and *U2AF1* Q157 mutation (+1)
  *(verify weights at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **GIPSS total (0–8)** with the four risk groups — **low 0,
  intermediate-1 1, intermediate-2 2, high ≥ 3** — naming the contributing lesions;
  framed as the mutation-and-karyotype-only companion to MIPSS70. Class A. Cross-links
  `mipss70`, `dipss-plus-mf`.

### 2.4 `mysec-pm` — MYSEC-PM (myelofibrosis secondary to PV/ET)

- **Citation:** Passamonti F, Giorgino T, Mora B, et al. A clinical-molecular
  prognostic model to predict survival in patients with post polycythemia vera and
  post essential thrombocythemia myelofibrosis. *Leukemia.* 2017;31(12):2726-2731.
- **citationUrl:** https://doi.org/10.1038/leu.2017.169
- **Group:** G. **Specialties:** `hematology`, `oncology`.
- **Inputs:** the weighted items — hemoglobin < 11 g/dL (+2), circulating blasts ≥ 3%
  (+2), platelets < 150 ×10⁹/L (+1), constitutional symptoms (+1), absence of a *CALR*
  mutation (+2), and age (× 0.15 per year, continuous) *(verify the age coefficient and
  weights at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **MYSEC-PM total** with the four risk categories — **low < 11,
  intermediate-1 11 to < 14, intermediate-2 14 to < 16, high ≥ 16** — naming the
  contributors; framed as the dedicated model for post-PV / post-ET (secondary)
  myelofibrosis, where DIPSS underperforms. Class A. Cross-links `dipss-plus-mf`,
  `mipss70`.

### 2.5 `hct-ci` — Hematopoietic Cell Transplantation Comorbidity Index (Sorror)

- **Citation:** Sorror ML, Maris MB, Storb R, et al. Hematopoietic cell
  transplantation (HCT)-specific comorbidity index: a new tool for risk assessment
  before allogeneic HCT. *Blood.* 2005;106(8):2912-2919.
- **citationUrl:** https://doi.org/10.1182/blood-2005-05-2004
- **Group:** G. **Specialties:** `hematology`, `oncology`, `transplant`.
- **Inputs:** the comorbidity grid, each with its published weight — arrhythmia (+1),
  cardiac (+1), IBD (+1), diabetes (+1), cerebrovascular (+1), psychiatric (+1),
  mild hepatic (+1), obesity BMI > 35 (+1), infection (+1), rheumatologic (+1),
  peptic ulcer (+1), moderate renal (+2), moderate pulmonary (+2), prior solid tumor
  (+3), heart-valve disease (+3), severe pulmonary (+3), moderate/severe hepatic (+3)
  *(verify the full grid at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **HCT-CI total** with the risk band — **low 0, intermediate 1–2,
  high ≥ 3** — naming which comorbidities contributed; framed as the pre-transplant
  non-relapse-mortality risk estimate the transplant team weighs against disease risk.
  Class A. Cross-links `charlson`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** ELTS and
  MYSEC-PM carry continuous terms (a cubic in age, an inverse-square-root in platelets,
  a linear age coefficient); each clamps its inputs to the published domains, and any
  non-positive platelet count or out-of-range input renders a complete-the-fields
  fallback, never a `NaN`/`Infinity`.
- **Each tile reports which band applies and names the contributing items**, so a
  result is never read without its basis ([spec-v59](spec-v59.md)).
- **All five render prognosis, not orders.** None authors a transplant, conditioning,
  chemotherapy, or disposition order in Sophie's voice ([spec-v11](spec-v11.md) §5.3);
  each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the band boundaries and at platelet/blast extremes.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed point/coefficient
  models, each cited by journal + authors. `mipss70`/`gipss`/`mysec-pm` name molecular
  loci (*CALR*, *ASXL1*, *SRSF2*, *U2AF1*) — the implementing session confirms whether
  the citation text trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md))
  and adds a `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/myeloid-prognosis-v199.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v199.js`; its `RV199` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real `<label for>`.
  The catalog count moves on all **13 catalog-truth surfaces** using the **live
  `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the
  chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `hematology`, `oncology`,
  `transplant` — all already in the vocabulary.

## 5. Files touched

```
docs/spec-v199.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v199 RV199 into RENDERERS)
lib/myeloid-prognosis-v199.js            (new: elts, mipss70, gipss, mysecPm, hctCi)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to sokal, dipss-plus-mf, charlson)
views/group-v199.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/elts.test.js, mipss70.test.js, gipss.test.js, mysec-pm.test.js, hct-ci.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/myeloid-prognosis-v199.js to MODULES)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v199 delta; open the Deep Subspecialty Quantitation program)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v199 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including an **ELTS low /
  intermediate / high triple**, a **MIPSS70 crossing 0–1 → 2–4 → ≥ 5**, a **GIPSS
  0 → ≥ 3 pair**, a **MYSEC-PM crossing an integer band boundary**, and an **HCT-CI
  0 → ≥ 3 pair**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v199 with the +5 delta and opens the Deep Subspecialty
  Quantitation program (v199–v203).

## 7. Out of scope for v199

- **No transplant / conditioning / chemotherapy / disposition order** — the tiles
  stratify prognosis; the go/no-go transplant, regimen, and timing decisions stay with
  the hematologist, the transplant team, and the patient ([spec-v11](spec-v11.md) §5.3).
- **No copyrighted or single-source model** — models whose weights are not
  independently reproducible from ≥ 2 open sources are deferred under
  [spec-v97](spec-v97.md); the original IPSS-MDS and the WPSS are candidates for a
  later slice once each is re-sourced and confirmed absent.
