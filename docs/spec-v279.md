# spec-v279.md — Resected renal-cell-carcinoma prognosis: the Leibovich score and the UCLA Integrated Staging System (+2 tiles)

> Status: **PROPOSED (2026-07-10, docs-only).** Second feature spec of the **Advanced
> Prognostic & Classification Instruments** program ([spec-v278](spec-v278.md) §1.1).
> Proposes **2** deterministic instruments a urologic-oncology team reaches for after
> nephrectomy — how likely is this clear-cell tumor to recur, and which integrated risk tier
> does this kidney cancer fall in. **Each id was verified absent** ([spec-v85 §6.2](spec-v85.md))
> by a fixed-string scan of the extracted `app.js` id/name list: the catalog carries
> `ssign-score`, `imdc-rcc`, and `mskcc-rcc`, but **not** the Leibovich progression score or
> the UISS.
>
> Catalog effect, if built: **live `UTILITIES.length` + 2**, enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)); no number is copied here.
>
> Every prior spec remains in force. v279 adds no runtime network call and no AI; each tile
> obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its citation inline ([spec-v54](spec-v54.md)), inherits the
> [spec-v59](spec-v59.md) output-safety contract, renders the [spec-v50](spec-v50.md) §3
> posture note, and honors [spec-v11](spec-v11.md) §5.3 (**no treatment, surveillance, or
> adjuvant-therapy order in Sophie's voice** — these compute a recurrence risk or a risk
> tier; the decision stays with the oncology team). **Every point weight, boundary, and
> survival figure is re-fetched and cross-verified against ≥2 independent open sources at
> implementation** ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs the
> [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog carries the metastatic-RCC prognostic models (IMDC/Heng, MSKCC/Motzer) and the
SSIGN cancer-specific-survival score. It does **not** carry the two instruments that grade a
*surgically resected* kidney cancer: the **Leibovich score**, the recurrence-risk model that
selects patients for adjuvant trials, and the **UCLA Integrated Staging System (UISS)**, the
TNM-plus-grade-plus-performance-status tiering used in the pivotal adjuvant-immunotherapy
trials. Both are transparent, externally-validated instruments, freely reproducible from
open sources, and each is decision support — **never a treatment or surveillance order**.

## 2. What v279 adds (2 tiles)

### 2.1 `leibovich-rcc` — Leibovich progression score (clear-cell RCC)

- **Citation:** Leibovich BC, Blute ML, Cheville JC, et al. Prediction of progression after
  radical nephrectomy for patients with clear cell renal cell carcinoma: a stratification
  tool for prospective clinical trials. *Cancer.* 2003;97(7):1663-1671.
- **citationUrl:** https://doi.org/10.1002/cncr.11234
- **Group:** G. **Specialties:** `oncology`, `urology`, `pathology`.
- **Inputs — five factors, additive 0-11** *(each weight cross-verified against the SORCE
  external-validation reproduction at implementation, [spec-v97](spec-v97.md))*: primary
  tumor stage (pT1a = 0, pT1b = 2, pT2 = 3, pT3-pT4 = 4); regional nodes (pNx/pN0 = 0, pN1/pN2
  = 2); tumor size (< 10 cm = 0, ≥ 10 cm = 1); nuclear (Fuhrman) grade (1-2 = 0, 3 = 1, 4 = 3);
  and coagulative tumor necrosis (absent = 0, present = 1).
- **Output:** the **Leibovich total (0-11)** mapped to the three risk bands — **low 0-2,
  intermediate 3-5, high ≥ 6** — with the metastasis-free-survival gradient stated (5-year MFS
  ≈ 97 % / 74 % / 31 % low/intermediate/high in the SORCE validation) and the dominant factors
  named. Framed as the clear-cell recurrence-risk model that stratifies for adjuvant trials;
  **it reports a recurrence risk, never a surveillance or adjuvant-therapy order**
  ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `ssign-score`, `uiss-rcc`, `imdc-rcc`.

### 2.2 `uiss-rcc` — UCLA Integrated Staging System (UISS)

- **Citation:** Zisman A, Pantuck AJ, Dorey F, et al. Improved prognostication of renal cell
  carcinoma using an integrated staging system. *J Clin Oncol.* 2001;19(6):1649-1657; and
  Zisman A, Pantuck AJ, Wieder J, et al. Risk group assessment and clinical outcome algorithm
  to predict the natural history of patients with surgically resected renal cell carcinoma.
  *J Clin Oncol.* 2002;20(23):4559-4566.
- **citationUrl:** https://doi.org/10.1200/JCO.2001.19.6.1649
- **Group:** G. **Specialties:** `oncology`, `urology`.
- **Inputs — TNM stage (1997), Fuhrman grade (1-4), and ECOG performance status (0 vs ≥ 1)**
  *(the localized-branch combinations are cross-verified against the international
  multicenter validation and the adjuvant-trial definitions; the metastatic-branch
  combinations are tagged **verify at implementation** because a clean ≥ 2-source reproduction
  of the exact TNM/grade/ECOG cells could not be obtained in-session, [spec-v97](spec-v97.md))*.
  **Localized (N0M0):** low = T1, grade 1-2, ECOG 0 (5-yr OS ≈ 92 %); high = T3 grade 2-4 with
  ECOG > 0, or T4 (5-yr OS ≈ 44 %); intermediate = all other localized (5-yr OS ≈ 67 %).
  **Metastatic (N1/N2 or M1):** three tiers driven by ECOG and grade, with Zisman-2002 3-year
  survival ≈ 37 % / 23 % / 12 % (low/intermediate/high).
- **Output:** the **UISS risk tier** (low / intermediate / high) for the localized or
  metastatic branch, with the corresponding survival estimate and the node-handling
  convention stated inline (the original routes N1/N2 M0 into the metastatic branch; the
  adjuvant-trial convention differs — the tile states which it applies,
  [spec-v97](spec-v97.md)). Framed as the integrated TNM-grade-performance tier used in the
  pivotal adjuvant trials; **it reports a risk tier, never a treatment order**
  ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `leibovich-rcc`, `ssign-score`,
  `mskcc-rcc`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Leibovich is a bounded
  0-11 integer sum; UISS is a categorical tier lookup — each renders a "complete the fields"
  fallback for a missing input rather than a `NaN`.
- **Each tile reports which factors fired and the resulting band/tier**
  ([spec-v59](spec-v59.md)) — the Leibovich total with its MFS gradient, the UISS tier with
  its survival estimate and node convention — so a result is never read without its basis.
- **Both render a risk category, not an order** ([spec-v11](spec-v11.md) §5.3) and render the
  [spec-v50](spec-v50.md) §3 posture note.
- **Both flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks**,
  fuzzed at the Leibovich 3/6 band edges and the UISS grade/ECOG/stage tier boundaries.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** both **Class A** — fixed point/tier models, each cited by
  journal + authors. Both rest on the older Fuhrman grade and 1997/2002 TNM editions; the
  tile states the edition it reproduces and carries a `docs/citation-staleness.md` row noting
  the grading/staging vintage ([spec-v97](spec-v97.md)). The implementing session confirms
  whether any citation trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)).
- **Build & gates (§6.1/§6.2):** the two computes live in a new `lib/rcc-prognosis-v279.js`,
  added to `test/unit/fuzz-tools.test.js` `MODULES`; the Leibovich weight table and the UISS
  tier map live as named constants with the source tables cited in a comment. Renderers live
  in a new `views/group-v279.js`; its `RV279` export is spread into the `app.js` `RENDERERS`
  map. Every input carries a real `<label for>`. The catalog count moves on all catalog-truth
  surfaces using the live `UTILITIES.length + 2`; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed `ALLOWED_SPECIALTIES` vocabulary; all tags used
  here already exist.
- **MCP exposure (post-ship):** both are Class A deterministic computes, routinely
  MCP-adaptable — a follow-up MCP wave exposes them per the [spec-v85](spec-v85.md) recipe,
  self-describing the fired factors and the band/tier so the round-trip passes.

## 5. Files touched

```
docs/spec-v279.md                        (this file)
app.js                                   (+2 UTILITIES rows; import group-v279 RV279 into RENDERERS)
lib/rcc-prognosis-v279.js                (new: leibovichRcc, uissRcc + Leibovich weight + UISS tier constants)
lib/meta.js                              (+2 META entries: inline citation + citationUrl + accessed; cross-links ssign-score, imdc-rcc, mskcc-rcc)
views/group-v279.js                      (new renderer module: 2 renderers)
docs/clinical-citations.md               (+2 rows)
docs/citation-staleness.md               (+2 rows: Fuhrman-grade + TNM-edition vintage)
test/unit/leibovich-rcc.test.js, uiss-rcc.test.js   (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/rcc-prognosis-v279.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+2; record the v279 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+2; spec-progression line)
```

## 6. Acceptance criteria

v279 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed both ids are absent (as verified at draft).
- Both tiles are live (Class A) with a `META[id]` entry, inline citation + `citationUrl` +
  `accessed`, and ≥ 3 worked examples each — including a **Leibovich crossing the 3/6 band
  edges** (a low-risk pT1a case and a high-risk necrosis-plus-grade-4 case) and a **UISS
  spanning a localized-low and a localized-high (or metastatic) tier**.
- The Leibovich five-factor weights and bands, and the UISS localized-branch combinations,
  are reproduced from the primary papers and re-verified against ≥ 2 independent references at
  implementation ([spec-v97](spec-v97.md)); the UISS **metastatic-branch combinations are
  either cross-verified against the Zisman 2002 figure or the branch is shipped with an
  explicit "combinations approximate — verify" note**, never silently.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 2** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, and `npm run build` all pass; the CHANGELOG records v279
  with the +2 delta.

## 7. Out of scope for v279

- **No treatment, surveillance, or adjuvant-therapy order** — the tiles compute a recurrence
  risk or a risk tier; management stays with the oncology team ([spec-v11](spec-v11.md) §5.3).
- **No re-grading to WHO/ISUP or AJCC 8th-edition TNM** — both instruments were derived on the
  Fuhrman grade and the 1997/2002 TNM editions; the tile reproduces the derivation vintage and
  does not silently substitute a newer grading/staging system. If the UISS metastatic-branch
  cells cannot be reproduced from ≥ 2 open sources at implementation, that branch is parked
  (not approximated), per [spec-v97](spec-v97.md) and the [spec-v259](spec-v259.md) precedent.
