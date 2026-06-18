# spec-v129.md — Acid-base compensation & gaps: Stewart SID/SIG, base excess, the three compensation formulas, and urine osmolal gap (+6 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 5** (GI / hepatology / nephrology /
> acid-base / urology). Adds **6** deterministic acid-base instruments that complete
> the compensation set `winters` opened and fill the physicochemical/urine-gap gaps.
> None duplicates a live tile.
>
> Catalog effect: **565 + 6 = 571 tiles.**
>
> Every prior spec (v4 through v128) remains in force. v129 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine
> (re-binding the [spec-v85](spec-v85.md) §2 doctrine) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has the anion gap with differential (`anion-gap-dd`) and Winter's formula
(`winters`) for expected PaCO₂ in metabolic acidosis — but the rest of the
compensation set, the physicochemical approach, and the urine acid-base gaps are
absent:

- **`winters` opened the compensation set; three disorders are still uncovered** —
  there is no expected-HCO₃ for respiratory acidosis (acute/chronic), no expected-HCO₃
  for respiratory alkalosis, and no expected-PaCO₂ for metabolic alkalosis. v129
  completes what `winters` started.
- **There is no Stewart SID / strong-ion-gap tile** — the physicochemical (Stewart-
  Figge) approach to acid-base, complementary to the bicarbonate-centered view.
- **There is no standard base excess** — the Hgb-corrected titratable base
  excess/deficit read off every blood gas.
- **There is no urine osmolal gap** — measured minus calculated urine osmolality,
  whose half approximates urinary ammonium, the key to the non-anion-gap acidosis
  workup.

Each is a published, deterministic formula; v129 brings the acid-base surface to
parity.

## 2. What v129 adds (6 tiles)

### 2.1 `stewart-sid-sig` — Stewart strong ion difference / strong ion gap

- **Citation:** Stewart PA. Modern quantitative acid-base chemistry. *Can J Physiol
  Pharmacol.* 1983;61(12):1444-1461; with the albumin/phosphate correction of Figge J,
  Mydosh T, Fencl V. *J Lab Clin Med.* 1992;120(5):713-719.
- **citationUrl:** https://doi.org/10.1139/y83-207
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nephrology`, `critical-care`, `internal-medicine`,
  `nursing-icu`.
- **Inputs:** sodium, potassium, calcium, magnesium, chloride, lactate, bicarbonate,
  albumin, and phosphate.
- **Output:** the **apparent SID, effective SID, and strong ion gap (SIG)** via the
  Stewart-Figge equations, with the unmeasured-anion reading (elevated SIG suggests
  unmeasured anions). Class A (fixed physicochemical formulas). Cross-links
  `anion-gap-dd`.

### 2.2 `base-excess` — Standard base excess

- **Citation:** Siggaard-Andersen O. The Van Slyke equation. *Scand J Clin Lab Invest
  Suppl.* 1977;146:15-20.
- **citationUrl:** https://doi.org/10.3109/00365517709098927
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `critical-care`, `internal-medicine`, `nursing-icu`.
- **Inputs:** bicarbonate (or pH/PaCO₂) and hemoglobin.
- **Output:** the **standard base excess (mEq/L)** via the Hgb-corrected Van Slyke /
  Siggaard-Andersen form, with the sign reading (negative = base deficit/metabolic
  acidosis; positive = base excess). Class A. Cross-links `anion-gap-dd` and (v129)
  the compensation tiles.

### 2.3 `resp-acidosis-compensation` — Expected HCO₃, respiratory acidosis

- **Citation:** Brackett NC Jr, Cohen JJ, Schwartz WB. Carbon dioxide titration curve
  of normal man: effect of increasing degrees of acute hypercapnia on acid-base
  equilibrium. *N Engl J Med.* 1965;272:6-12; chronic compensation per Schwartz WB,
  et al. 1965.
- **citationUrl:** https://doi.org/10.1056/NEJM196501072720102
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `critical-care`, `internal-medicine`, `nephrology`.
- **Inputs:** measured PaCO₂, measured HCO₃, and acute-vs-chronic selector.
- **Output:** the **expected HCO₃** — acute: +1 mEq/L per 10 mmHg ΔPaCO₂; chronic: +4
  per 10 — and whether the measured HCO₃ matches (flagging an added metabolic
  disorder). Class A. Cross-links `winters`.

### 2.4 `resp-alkalosis-compensation` — Expected HCO₃, respiratory alkalosis

- **Citation:** Gennari FJ, Goldstein MB, Schwartz WB. The nature of the renal
  adaptation to chronic hypocapnia. *J Clin Invest.* 1972;51(7):1722-1730.
- **citationUrl:** https://doi.org/10.1172/JCI106973
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `critical-care`, `internal-medicine`, `nephrology`.
- **Inputs:** measured PaCO₂, measured HCO₃, and acute-vs-chronic selector.
- **Output:** the **expected HCO₃** — acute: −2 mEq/L per 10 mmHg ΔPaCO₂; chronic: −4
  to −5 per 10 — and whether the measured HCO₃ matches (flagging an added metabolic
  disorder). Class A. Cross-links `winters` and the v129 acidosis tile.

### 2.5 `met-alkalosis-compensation` — Expected PaCO₂, metabolic alkalosis

- **Citation:** Narins RG, Emmett M. Simple and mixed acid-base disorders: a practical
  approach. *Medicine (Baltimore).* 1980;59(3):161-187.
- **citationUrl:** https://doi.org/10.1097/00005792-198005000-00001
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `critical-care`, `internal-medicine`, `nephrology`.
- **Inputs:** measured HCO₃ and measured PaCO₂.
- **Output:** the **expected PaCO₂** via the published rule (≈ 0.7 × ΔHCO₃ above
  normal, + 40, within a bounded range), and whether the measured PaCO₂ matches
  (flagging an added respiratory disorder). Class A. **Near-neighbor:** `winters` (the
  metabolic-acidosis complement) — cross-linked, both kept.

### 2.6 `urine-osmolal-gap` — Urine osmolal gap

- **Citation:** Halperin ML, Margolis BL, Robinson LA, et al. The urine osmolal gap:
  a clue to estimate urine ammonium in "hybrid" types of metabolic acidosis. *Clin
  Invest Med.* 1988;11(3):198-202.
- **citationUrl:** https://pubmed.ncbi.nlm.nih.gov/3168315/ (verify at implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nephrology`, `internal-medicine`, `critical-care`.
- **Inputs:** measured urine osmolality, urine sodium, urine potassium, urine urea,
  and urine glucose.
- **Output:** the **urine osmolal gap = measured − calculated urine osm**, with the
  **÷ 2 ≈ urinary NH₄⁺** reading that distinguishes renal from extrarenal non-anion-gap
  acidosis. Class A. Cross-links `anion-gap-dd`.

## 3. Per-tile robustness

- **`stewart-sid-sig` and `base-excess` guard their arithmetic** — every input is
  validated numeric; the SIG subtraction and the Hgb-corrected base-excess form return
  a surfaced `valid:false` fallback on a blank required value, never a `NaN`. The
  signed SIG and base excess are reported with their sign, not silently capped.
- **The three compensation formulas are bounded linear predictions** — each computes
  the expected HCO₃ or PaCO₂ from the measured ΔPaCO₂/ΔHCO₃, clamps the prediction to a
  physiologic range, and compares it to the measured value to flag an added disorder.
  The acute-vs-chronic selector is explicit, not inferred. Each flows through the
  [spec-v59](spec-v59.md) fuzz harness.
- **`urine-osmolal-gap` is a calculated-osmolality identity** — it guards against
  negative concentrations and reports the signed gap and its half; the calculated osm
  uses the standard 2×(Na+K) + urea + glucose conversion with unit helpers.
- All six render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). Each compute uses `lib/num.js` and joins the fuzz
  harness with zero non-finite leaks.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all six tiles are **Class A** (fixed physiologic
  formulas and compensation coefficients) — **no** `docs/citation-staleness.md` row.
  The citations name the **journal and authors** (Can J Physiol Pharmacol/Stewart and
  Figge, Scand J Clin Lab Invest/Siggaard-Andersen, NEJM/Brackett, J Clin Invest/
  Gennari, Medicine/Narins-Emmett, Clin Invest Med/Halperin), **not** a society
  acronym, so none trips the `ISSUER_PATTERN` staleness gate.
- **Build & gates (§6.1/§6.2):** `lib/acidbase-v129.js` (computes `stewartSidSig`,
  `baseExcess`, `respAcidosisCompensation`, `respAlkalosisCompensation`,
  `metAlkalosisCompensation`, `urineOsmolalGap`) is added to
  `test/unit/fuzz-tools.test.js` `MODULES` (zero non-finite leaks, with the
  signed/bounded compensation math explicitly fuzzed); the renderer is
  `views/group-v129.js` with its `RV129` export added to the `app.js` `RENDERERS`
  spread. Each `META` example is pinned by the chromium `example-correctness` sweep;
  the catalog count moves on all **13 catalog-truth surfaces**; a11y,
  `mobile-no-hscroll`, and 44px touch-target checks pass for `views/group-v129.js`.

## 5. Files touched

```
docs/spec-v129.md                        (this file)
app.js                                   (+6 UTILITIES rows, group E; import group-v129 renderers into RENDERERS)
lib/acidbase-v129.js                     (new module: stewartSidSig, baseExcess, respAcidosisCompensation, respAlkalosisCompensation, metAlkalosisCompensation, urineOsmolalGap)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to anion-gap-dd, winters)
views/group-v129.js                      (new renderer module: 6 renderers; RV129 export)
docs/clinical-citations.md               (+ rows for the six sources)
test/unit/stewart-sid-sig.test.js, base-excess.test.js, resp-acidosis-compensation.test.js, resp-alkalosis-compensation.test.js, met-alkalosis-compensation.test.js, urine-osmolal-gap.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/acidbase-v129.js to MODULES)
docs/audits/v12/stewart-sid-sig.md, base-excess.md, resp-acidosis-compensation.md, resp-alkalosis-compensation.md, met-alkalosis-compensation.md, urine-osmolal-gap.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 565 -> 571)
CHANGELOG.md                             (Unreleased: v129 entry, +6)
README.md, package.json                  (catalog count 565 -> 571; spec-progression line -> v129)
```

## 6. Acceptance criteria

v129 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  six ids are absent from the live catalog (distinct from `winters`, `anion-gap-dd`).
- All 6 tiles in §2 are live in Group E with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each — including a
  worked SIG with an unmeasured-anion flip, a base-excess **sign flip at 0 (deficit vs
  excess)**, acute-vs-chronic boundary cases for each of the three compensation
  formulas (with an added-disorder flag when measured ≠ expected), and a urine
  osmolal gap whose half estimates urinary NH₄⁺ — a [spec-v11](spec-v11.md) audit log
  each, and a passing [spec-v29](spec-v29.md) §3 check.
- The compensation formulas use an explicit acute-vs-chronic selector and clamp to a
  physiologic range; the SIG/base-excess/urine-gap tiles report signed results; partial
  inputs render a complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- No tile carries a `docs/citation-staleness.md` row (all Class A); the citations name
  journals/authors, not societies.
- `UTILITIES.length` is **571** (or the then-current live count + 6 if specs land out
  of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v129 with the +6 catalog delta.

## 7. Out of scope for v129

- **No blood-gas-analyzer or lab feed** — every value is a clinician input; the tiles
  compute the gap/compensation from entered gas and electrolyte values.
- **No auto-ventilation, auto-bicarbonate, or auto-fluid order** — each tile reports
  the computed value, the expected/measured comparison, and the source's stated
  interpretation; the management decision stays with the clinician and local protocol
  ([spec-v11](spec-v11.md) §5.3).
- **No duplication of `winters`/`anion-gap-dd`** — v129 completes the compensation set
  and adds the physicochemical/urine-gap views; cross-linked, all kept.
