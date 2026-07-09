# spec-v266.md — Localized renal-cell carcinoma prognosis after nephrectomy: the Leibovich score, the SSIGN score, and the UCLA Integrated Staging System (+3 tiles)

> Status: **PARTIALLY SHIPPED (2026-07-09, +1 of 3; Leibovich & UISS parked).** Third
> feature spec of the **Advanced Sub-specialty Prognostic Instruments** program
> ([spec-v264](spec-v264.md) §1.1). Proposes **3** post-nephrectomy prognostic instruments;
> **1 shipped** (SSIGN), **2 parked** (Leibovich, UISS). **Each id was verified absent**
> ([spec-v85 §6.2](spec-v85.md)).
>
> **Shipped:** `ssign-score` — the SSIGN point table is reproducible from >= 2 independent
> open sources (Frank 2002 + MDCalc "SSIGN Score" for the point grid; the 5-year
> cancer-specific-survival bands are confirmed across external validations) and is live.
>
> **Parked (spec-v97 / [spec-v259](spec-v259.md) precedent):**
>
> - **`leibovich-rcc`** — the exact 2003 point table could not be confirmed from >= 2
>   **independent** open, fetchable sources in-session: the reachable detailed renders trace
>   to a single validation lineage, Radiopaedia/MDCalc/Kidney-Cancer-UK were 403/404, and
>   known variant reproductions differ on the pN and pT weights.
> - **`uiss`** — the localized-branch group-assignment table (TNM x Fuhrman grade x ECOG ->
>   group I-V) is not reproducible from >= 2 open, fetchable sources in-session; the primary
>   Zisman 2001 table and the cliot R source are not extractable here and secondary renders
>   give only partial rules.
>
> **Re-open condition:** ship each parked tile when its point/assignment table is
> reproducible from >= 2 independent open, fetchable sources, or is supplied directly.
>
> Catalog effect this slice: **live `UTILITIES.length` + 1** (SSIGN only), enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)); the remaining +2 lands when the parked
> tiles re-open.
>
> Every prior spec remains in force. v266 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no surveillance, adjuvant-therapy, or biopsy order in
> Sophie's voice** — these compute a risk group or predicted survival; the decision to
> surveil, treat, or enroll stays with the oncology team). **Every variable, point weight,
> and survival estimate is re-fetched and cross-verified against ≥2 independent open sources
> at implementation** ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify
> at implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs the
> [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog carries the metastatic-RCC prognostic models (IMDC/Heng, MSKCC/Motzer) and the
ECOG/Karnofsky performance scales, but it does **not** carry the three instruments that
stratify **localized, non-metastatic** clear-cell RCC after nephrectomy — the decision
point for surveillance intensity and adjuvant-trial eligibility. Each is a transparent,
externally-validated point model, freely reproducible from open sources, and each is
decision support — **never a surveillance, adjuvant-therapy, or biopsy order**.

## 2. What v266 adds (3 tiles)

### 2.1 `leibovich-rcc` — Leibovich score

- **Citation:** Leibovich BC, Blute ML, Cheville JC, et al. Prediction of progression after
  radical nephrectomy for patients with clear cell renal cell carcinoma: a stratification
  tool for prospective clinical trials. *Cancer.* 2003;97(7):1663-1671.
- **citationUrl:** https://doi.org/10.1002/cncr.11234
- **Group:** G. **Specialties:** `urology`, `oncology`, `surgery`.
- **Inputs — 5 pathologic variables** *(each point weight is transcribed verbatim from the
  primary paper at implementation, [spec-v97](spec-v97.md))*: primary tumor (pT) stage,
  regional lymph-node status (pNx/pN0 vs pN1/pN2), tumor size (< 10 vs ≥ 10 cm), nuclear
  grade (Fuhrman 1–2 vs 3 vs 4), and histologic coagulative tumor necrosis (present vs
  absent).
- **Output:** the **Leibovich total** mapped to the **low- / intermediate- / high-risk**
  group for metastasis-free progression after nephrectomy, with the group's predicted
  metastasis-free survival at 1/3/5/10 years *(the score→group and survival lookup is
  transcribed at implementation, [spec-v97](spec-v97.md))*, naming the driving pathology.
  Framed as the metastasis-progression stratifier built to select high-risk patients for
  adjuvant trials; **it reports a risk group, never a surveillance or adjuvant-therapy
  order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `ssign-score`, `uiss`,
  `imdc-rcc`.

### 2.2 `ssign-score` — SSIGN score (Stage, Size, Grade, Necrosis)

- **Citation:** Frank I, Blute ML, Cheville JC, Lohse CM, Weaver AL, Zincke H. An outcome
  prediction model for patients with clear cell renal cell carcinoma treated with radical
  nephrectomy based on tumor stage, size, grade and necrosis: the SSIGN score.
  *J Urol.* 2002;168(6):2395-2400.
- **citationUrl:** https://doi.org/10.1016/S0022-5347(05)64153-5
- **Group:** G. **Specialties:** `urology`, `oncology`, `surgery`.
- **Inputs — 4 pathologic variables** *(each point weight is transcribed verbatim from the
  primary paper at implementation, [spec-v97](spec-v97.md))*: TNM stage (primary tumor +
  regional node + distant metastasis terms), tumor size (< 5 vs ≥ 5 cm), nuclear grade
  (Fuhrman 1–4), and histologic coagulative tumor necrosis (present vs absent).
- **Output:** the **SSIGN total (0–15+)** mapped to the predicted **cancer-specific
  survival** at 1/3/5/10 years, which falls monotonically across the range *(the
  score→survival lookup is transcribed at implementation, [spec-v97](spec-v97.md))*, naming
  the dominant contributors. Framed as the Mayo cancer-specific-survival model that
  externally out-discriminates Leibovich and UISS in most validations (c-index ≈ 0.82); **it
  reports a survival estimate, never a treatment order** ([spec-v11](spec-v11.md) §5.3).
  Class A. Cross-links `leibovich-rcc`, `uiss`.

### 2.3 `uiss` — UCLA Integrated Staging System (UISS)

- **Citation:** Zisman A, Pantuck AJ, Dorey F, et al. Improved prognostication of renal cell
  carcinoma using an integrated staging system. *J Clin Oncol.* 2001;19(6):1649-1657;
  validated in Patard JJ, et al. *J Clin Oncol.* 2004;22(16):3316-3322.
- **citationUrl:** https://doi.org/10.1200/JCO.2001.19.6.1649
- **Group:** G. **Specialties:** `urology`, `oncology`, `surgery`.
- **Inputs — 3 variables** *(the group-assignment table is transcribed verbatim from the
  primary paper at implementation, [spec-v97](spec-v97.md))*: TNM stage (1988 AJCC),
  Fuhrman nuclear grade (1–4), and ECOG performance status (0 vs ≥ 1). The tile applies the
  **localized (non-metastatic) branch** of the two-branch model *(the separate metastatic
  branch is noted; the tile computes the localized branch and states which branch applies —
  [spec-v97](spec-v97.md))*.
- **Output:** the **UISS group (I–V)** with the group's predicted overall survival at 2 and
  5 years *(96 %/94 % for group I down to 9 %/0 % for group V in the derivation cohort; the
  full lookup is transcribed at implementation, [spec-v97](spec-v97.md))*, naming the stage,
  grade, and performance-status inputs. Framed as the integrated three-factor stratifier
  validated internationally; **it reports a risk group, never a treatment order**
  ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `leibovich-rcc`, `ssign-score`,
  `ecog-karnofsky`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Leibovich is a
  bounded point sum, SSIGN a bounded 0–15+ point sum, UISS a bounded I–V group lookup — each
  renders a "complete the fields" fallback for a missing input rather than a `NaN`, and
  clamps survival estimates to [0, 100] %.
- **Each tile reports which pathologic factors fired and the resulting group or survival**
  ([spec-v59](spec-v59.md)) — the Leibovich risk group, the SSIGN survival estimate, the
  UISS group — so a result is never read without its basis.
- **All three render a group or survival estimate, not an order** — none authors a
  surveillance, adjuvant-therapy, or biopsy order in Sophie's voice ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All three flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks**, fuzzed at the Leibovich risk-group edges, the SSIGN score range, and the UISS
  group boundaries.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all three are **Class A** — fixed point/group models, each
  cited by journal + authors. The implementing session confirms whether any citation trips
  `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches. The tiles state that
  they use the **Fuhrman** grade and the AJCC staging edition of the derivation cohort, so a
  reader applying a current WHO/ISUP grade re-maps deliberately.
- **Build & gates (§6.1/§6.2):** the three computes live in a new `lib/rcc-prognosis-v266.js`,
  added to `test/unit/fuzz-tools.test.js` `MODULES`. The Leibovich/SSIGN point tables and the
  UISS group-assignment and survival tables live as named constants with the source table
  cited in a comment. Renderers live in a new `views/group-v266.js`; its `RV266` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The
  catalog count moves on all catalog-truth surfaces using the **live `UTILITIES.length`
  + 3**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary; all tags used here already exist in
  `ALLOWED_SPECIALTIES`.
- **MCP exposure (post-ship):** all three are Class A deterministic computes and are
  **routinely MCP-adaptable** — a follow-up MCP wave exposes them as deterministic agent
  tools per the [spec-v85](spec-v85.md) recipe, self-describing the fired pathology factors
  and the resulting group/survival so the numeric round-trip passes.

## 5. Files touched

```
docs/spec-v266.md                        (this file)
app.js                                   (+3 UTILITIES rows; import group-v266 RV266 into RENDERERS)
lib/rcc-prognosis-v266.js                (new: leibovich, ssign, uiss + point/group/survival table constants)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to imdc-rcc, mskcc-rcc, ecog-karnofsky)
views/group-v266.js                      (new renderer module: 3 renderers)
docs/clinical-citations.md               (+3 rows)
test/unit/leibovich-rcc.test.js, ssign-score.test.js, uiss.test.js   (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/rcc-prognosis-v266.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+3; record the v266 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+3; spec-progression line)
```

## 6. Acceptance criteria

v266 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed all three ids are absent (as verified at draft).
- All 3 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **Leibovich
  spanning low- and high-risk groups**, an **SSIGN spanning a low-score and a high-score
  case with its survival estimate**, and a **UISS spanning at least two of groups I–V with
  an ECOG-performance-status contribution**.
- The transcribed Leibovich and SSIGN point tables and the UISS group-assignment and
  survival tables are reproduced from the primary sources and re-verified against ≥ 2
  independent references at implementation ([spec-v97](spec-v97.md)); each tile states the
  grading system (Fuhrman) and AJCC staging edition it uses.
- Every compute is finite-guarded, routes through `lib/num.js`, clamps survival estimates to
  [0, 100] %, and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 3** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v266 with the +3 delta.

## 7. Out of scope for v266

- **No surveillance / adjuvant-therapy / biopsy order** — the tiles compute a risk group or
  predicted survival; the decision to surveil, offer adjuvant therapy, or enroll in a trial
  stays with the oncology team ([spec-v11](spec-v11.md) §5.3).
- **No non-clear-cell or nomogram-only model** — the Karakiewicz and Kattan/MSKCC
  postoperative nomograms (which require a point-and-axis reader rather than a closed point
  sum) and the papillary/chromophobe-specific models are deferred; this slice adds only the
  three closed-form point/group instruments for clear-cell RCC. If any point or survival
  table cannot be reproduced from ≥ 2 open, fetchable sources at implementation, that tile is
  parked (not approximated), per [spec-v97](spec-v97.md) and the [spec-v259](spec-v259.md)
  precedent.
