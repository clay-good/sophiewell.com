# spec-v187.md — Solid-tumor staging, response & inflammation-based prognosis: BCLC, IMDC, MSKCC/Motzer, RECIST 1.1, and the modified Glasgow Prognostic Score (+5 tiles)

> Status: **PROPOSED (2026-07-01).** First feature spec of the **Subspecialty
> Oncology & Hematology Staging** program (umbrella below, §1.1), advancing the
> long-horizon [scope-mdcalc-parity.md](scope-mdcalc-parity.md) commitment to carry
> every clinically actionable calculator. Adds **5** deterministic solid-tumor
> staging / response / prognosis instruments. **Each tile was verified absent by a
> direct scan of `app.js`** (zero id / name / keyword hits): the catalog carries
> `ecog-karnofsky`, `charlson`, `tnm`-adjacent tiles and the lymphoma indices, but
> not the Barcelona Clinic Liver Cancer stage, the metastatic-RCC risk models, the
> RECIST response criteria, or the inflammation-based Glasgow prognostic score.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v187 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (re-binding
> [spec-v85](spec-v85.md) §2) and the §6 CI/CD contract, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no treatment or allocation order in Sophie's
> voice** — these stage and prognosticate; the decision stays with the tumor board
> and the patient). **Every stage boundary, risk-factor weight, and response
> threshold is re-fetched and cross-verified against ≥2 independent sources at
> implementation** ([spec-v97](spec-v97.md)); uncertain values carry an explicit
> *(verify at implementation, [spec-v97](spec-v97.md))* tag. The implementing
> session **re-runs the [spec-v85 §6.2](spec-v85.md) collision check** first.

### 1.1 Program umbrella — Subspecialty Oncology & Hematology Staging (v187–v189)

The oncology / hematology surface is the deepest remaining
[scope-mdcalc-parity.md](scope-mdcalc-parity.md) tail: dozens of society-standard
staging systems and prognostic indices that the bedside oncologist and
hematologist use daily. v187 opens a three-spec slice: **v187** solid-tumor
staging / response / inflammation prognosis, **[spec-v188](spec-v188.md)** leukemia
& lymphoma staging, and **[spec-v189](spec-v189.md)** myeloma, vasculitis &
anticoagulation-suitability prognosis. Each is deterministic, cited, and
actionable; further slices follow the same contract.

## 2. What v187 adds (5 tiles)

### 2.1 `bclc-hcc` — Barcelona Clinic Liver Cancer (BCLC) Stage

- **Citation:** Llovet JM, Brú C, Bruix J. Prognosis of hepatocellular carcinoma:
  the BCLC staging classification. *Semin Liver Dis.* 1999;19(3):329-338. 2022
  update: Reig M, Forner A, Rimola J, et al. *J Hepatol.* 2022;76(3):681-693.
- **citationUrl:** https://doi.org/10.1016/j.jhep.2021.11.018
- **Group:** G (clinical classification). **Specialties:** `hepatology`,
  `oncology`, `gastroenterology`.
- **Inputs:** performance status (ECOG), tumor burden (single vs multinodular,
  size, number, portal invasion / extrahepatic spread), and liver function
  (Child-Pugh class / preserved-vs-decompensated). The tile maps these to the
  **stage 0 (very early), A (early), B (intermediate), C (advanced), or D
  (terminal)** per the published algorithm.
- **Output:** the **BCLC stage** with the linked treatment strategy the guideline
  attaches to each stage (resection / ablation / transplant / TACE / systemic /
  best supportive care), framed as the guideline's stage-linked *strategy*, not an
  order. Class A. Cross-links `meld-3.0` and the hepatology tiles.

### 2.2 `imdc-rcc` — IMDC (Heng) Metastatic RCC Risk

- **Citation:** Heng DYC, Xie W, Regan MM, et al. Prognostic factors for overall
  survival in patients with metastatic renal cell carcinoma treated with
  vascular endothelial growth factor–targeted agents. *J Clin Oncol.*
  2009;27(34):5794-5799.
- **citationUrl:** https://doi.org/10.1200/JCO.2008.21.4809
- **Group:** G. **Specialties:** `oncology`, `urology`.
- **Inputs:** the six factors, each 1 point — Karnofsky < 80%, time from diagnosis
  to systemic therapy < 1 year, anemia (Hb below normal), hypercalcemia (corrected
  Ca above normal), neutrophilia (above normal), thrombocytosis (above normal).
- **Output:** the **risk group** — favorable (0), intermediate (1–2), poor (≥ 3) —
  with the associated median survival, naming the factors. Class A. Cross-links
  `mskcc-rcc`.

### 2.3 `mskcc-rcc` — MSKCC (Motzer) Metastatic RCC Risk

- **Citation:** Motzer RJ, Mazumdar M, Bacik J, Berg W, Amsterdam A, Ferrara J.
  Survival and prognostic stratification of 670 patients with advanced renal cell
  carcinoma. *J Clin Oncol.* 1999;17(8):2530-2540.
- **citationUrl:** https://doi.org/10.1200/JCO.1999.17.8.2530
- **Group:** G. **Specialties:** `oncology`, `urology`.
- **Inputs:** the five factors, each 1 point — Karnofsky < 80%, LDH > 1.5× ULN, low
  hemoglobin, high corrected calcium, time from diagnosis to treatment < 1 year.
- **Output:** the **risk group** — favorable (0), intermediate (1–2), poor (≥ 3) —
  with the associated median survival. Class A. Cross-links `imdc-rcc`; the tile
  notes IMDC is the modern targeted-therapy-era model and MSKCC the historical
  comparator.

### 2.4 `recist` — RECIST 1.1 Tumor Response

- **Citation:** Eisenhauer EA, Therasse P, Bogaerts J, et al. New response
  evaluation criteria in solid tumours: revised RECIST guideline (version 1.1).
  *Eur J Cancer.* 2009;45(2):228-247.
- **citationUrl:** https://doi.org/10.1016/j.ejca.2008.10.026
- **Group:** E (clinical math). **Specialties:** `oncology`, `radiology`.
- **Inputs:** the baseline sum of target-lesion diameters, the current sum, the
  nadir sum, and the new-lesion / non-target-progression flags. Computes the
  **percent change from baseline and from nadir** and assigns **CR / PR / SD / PD**
  by the rules (PR ≥ 30% decrease from baseline; PD ≥ 20% increase from nadir *and*
  ≥ 5 mm absolute, or any new lesion) *(verify thresholds at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **response category** with the percent changes, naming which rule
  fired. Class A. Cross-links the oncology response tiles.

### 2.5 `glasgow-prognostic-score` — Modified Glasgow Prognostic Score (mGPS)

- **Citation:** McMillan DC. The systemic inflammation-based Glasgow Prognostic
  Score: a decade of experience in patients with cancer. *Cancer Treat Rev.*
  2013;39(5):534-540.
- **citationUrl:** https://doi.org/10.1016/j.ctrv.2012.08.003
- **Group:** G. **Specialties:** `oncology`, `internal-medicine`, `palliative-care`.
- **Inputs:** C-reactive protein and serum albumin. The **modified GPS**: CRP ≤ 10
  mg/L → 0; CRP > 10 with albumin ≥ 3.5 g/dL → 1; CRP > 10 *and* albumin < 3.5 → 2
  *(verify the cut-points at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **mGPS (0–2)** with its inflammation-based prognostic meaning,
  naming the CRP and albumin. Class A. Cross-links the nutrition / inflammation
  tiles (`pni-onodera`, `conut`).

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** RECIST
  guards the baseline and nadir sums > 0 before the percent-change division; the
  point/stage tiles clamp inputs to the published ranges; mGPS guards the CRP and
  albumin values; outside these each tile renders a complete-the-fields fallback,
  never a `NaN`/`Infinity`.
- **`bclc-hcc` renders the stage-linked strategy as the guideline's language, not
  an order** ([spec-v59](spec-v59.md); [spec-v11](spec-v11.md) §5.3).
- **`recist` reports which rule fired** (the −30% PR vs +20%/+5 mm PD vs new-lesion
  logic), so a category is never read without its basis.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the stage / band / percent boundaries.
- **These stage and prognosticate; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a treatment or allocation
  order in Sophie's voice.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed staging
  algorithms / point models / response criteria, each cited by journal + authors.
  The implementing session confirms the `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) result at build time and adds a
  `docs/citation-staleness.md` row only if a society issuer matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/onc-staging-v187.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v187.js`; its `RV187` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all **13 catalog-truth surfaces** using
  the **live `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `oncology`, `hepatology`,
  `gastroenterology`, `urology`, `radiology`, `internal-medicine`,
  `palliative-care` — all already in the vocabulary.

## 5. Files touched

```
docs/spec-v187.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v187 RV187 into RENDERERS)
lib/onc-staging-v187.js                  (new: bclcHcc, imdcRcc, mskccRcc, recist, glasgowPrognosticScore)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links)
views/group-v187.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/bclc-hcc.test.js, imdc-rcc.test.js, mskcc-rcc.test.js, recist.test.js, glasgow-prognostic-score.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/onc-staging-v187.js to MODULES)
docs/audits/v12/*.md                     (5 spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v187 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v187 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **BCLC
  stage across two burden/function inputs**, an **IMDC group crossing 0 → 1 → ≥ 3**,
  an **MSKCC group example**, a **RECIST PR-vs-PD pair (baseline and nadir logic)**,
  and an **mGPS 0/1/2 set**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by
  the [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v187 with the +5 delta.

## 7. Out of scope for v187

- **No treatment or allocation order** — the tiles stage and prognosticate; the
  therapy and transplant-allocation decisions stay with the tumor board and the
  patient ([spec-v11](spec-v11.md) §5.3).
- **No imaging measurement** — `recist` consumes entered lesion diameters; it does
  not measure lesions on a scan.
- **No proprietary genomic-assay scores** — Oncotype DX, MammaPrint, and similar
  closed-algorithm assays fail the [spec-v97](spec-v97.md) free-reproducibility bar
  and are excluded.
