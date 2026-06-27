# spec-v161.md — Endocrine, metabolic & nutrition-support math: Aldosterone-Renin Ratio, calcium-phosphate product, free thyroxine index, and nitrogen balance (+4 tiles)

> Status: **SHIPPED (2026-06-26).** (was PROPOSED 2026-06-23.) **Closing spec** of the
> [spec-v157](spec-v157.md) **Subspecialty Depth** program. Adds **4**
> deterministic endocrine/metabolic/nutrition-support computes that fill confirmed
> gaps — the primary-aldosteronism screening ratio, the CKD-MBD calcium-phosphate
> product, the thyroid free-thyroxine index, and the nitrogen-balance
> nutrition-support calculation. None duplicates a live tile. With v161 the
> Subspecialty Depth program is **complete (+18, nominal 704 → 722).**
>
> Catalog effect at v161 close: **live count + 4** (catalog-truth gate enforces).
>
> Every prior spec (v4 through v160) remains in force. v161 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract. Formulas, units, and thresholds
> are re-fetched and cross-verified to ≥2 sources at implementation
> ([spec-v97](spec-v97.md)).

## 1. Thesis

The catalog has a deep clinical-chemistry surface (anion gap, osmolal gap, FENa,
corrected calcium/sodium, eGFR suite) and nutrition screening + energy equations
(v152), but four routine endocrine/metabolic/nutrition-support computes are still
absent: the **aldosterone-to-renin ratio** (the primary-aldosteronism screen), the
**calcium-phosphate product** (the CKD-MBD vascular-calcification surrogate), the
**free thyroxine index** (the binding-corrected thyroid estimate), and **nitrogen
balance** (the protein-adequacy calculation in nutrition support). Each is a
closed-form arithmetic compute over standard labs.

## 2. What v161 adds (4 tiles)

### 2.1 `arr` — Aldosterone-Renin Ratio (primary-aldosteronism screen)

- **Citation:** Funder JW, Carey RM, Mantero F, et al. The management of primary
  aldosteronism: case detection, diagnosis, and treatment — an Endocrine Society
  clinical practice guideline. *J Clin Endocrinol Metab.* 2016;101(5):1889-1916.
- **citationUrl:** https://doi.org/10.1210/jc.2015-4061 (verify at implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `endocrinology`, `cardiology`, `nephrology`.
- **Inputs:** plasma aldosterone concentration (ng/dL) and renin — either plasma
  renin activity (PRA, ng/mL/h) or direct renin concentration (DRC, mIU/L or
  ng/L) — with the unit selected explicitly.
- **Output:** the **ARR = aldosterone / renin** in the chosen units, with the
  commonly-cited screening cutoffs surfaced **with their units** (e.g. PAC ng/dL ÷
  PRA ng/mL/h: ARR >20–30 *and* aldosterone ≥15 ng/dL as a positive screen). Class
  A. **Unit handling is the chief risk** — the renderer requires the renin unit and
  states the matching cutoff; it never compares across unit systems. Guards the
  division (renin > 0).

### 2.2 `calcium-phosphate-product` — Calcium-Phosphate Product (CKD-MBD)

- **Citation:** Kidney Disease: Improving Global Outcomes (KDIGO) CKD-MBD Work
  Group. KDIGO clinical practice guideline for CKD-MBD. *Kidney Int Suppl.*
  2009;(113):S1-130 (updated 2017).
- **citationUrl:** https://doi.org/10.1038/ki.2009.188 (verify at implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nephrology`, `endocrinology`.
- **Inputs:** serum calcium and serum phosphate (both mg/dL, with an SI mmol/L
  toggle).
- **Output:** the **Ca × PO₄ product (mg²/dL²)** with the historical >55 mg²/dL²
  caution threshold surfaced, **and** the explicit note that contemporary KDIGO
  guidance favors tracking calcium and phosphate **individually** over the product.
  Class A. Pairs with `corrected-calcium`; cross-linked.

### 2.3 `free-thyroxine-index` — Free Thyroxine Index (FTI / T7)

- **Citation:** Clark F, Horn DB. Assessment of thyroid function by the combined
  use of the serum protein-bound iodine and resin uptake of ¹³¹I-triiodothyronine.
  *J Clin Endocrinol Metab.* 1965;25(1):39-45 (FTI concept).
- **citationUrl:** https://doi.org/10.1210/jcem-25-1-39 (verify at implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `endocrinology`, `internal-medicine`.
- **Inputs:** total T4 and the T3-resin uptake (T3RU %) — or the T-uptake ratio.
- **Output:** the **FTI = total T4 × (T3RU / reference)** (the binding-corrected
  free-hormone estimate) with the interpretive framing (FTI corrects total T4 for
  binding-protein changes, e.g. pregnancy/estrogen). Class A. A legacy-but-still-used
  index where direct free-T4 immunoassay is unavailable; the renderer states that
  context. Guards the ratio.

### 2.4 `nitrogen-balance` — Nitrogen Balance (nutrition support)

- **Citation:** Standard nutrition-support formulation, e.g. Mackenzie TA, et al.,
  and ASPEN guidance: N balance = protein intake N − (UUN + insensible losses).
- **citationUrl:** (ASPEN nutrition-support core curriculum — verify edition at
  implementation)
- **Group:** Medication & Infusion (`F`) — nutrition-support context.
- **Specialties:** `nutrition`, `critical-care`, `surgery`.
- **Inputs:** 24-hour protein (or amino-acid) intake (g) and the 24-hour urine urea
  nitrogen (UUN, g/day); optional adjustable insensible-loss constant (default 4
  g/day).
- **Output:** **N balance = (protein g / 6.25) − (UUN + 4)** g/day, with the
  interpretation (positive = anabolic/adequate, negative = catabolic/under-fed) and
  the **6.25 g protein per g nitrogen** conversion surfaced. Class A. Cross-linked
  to `icu-nutrition-target` and the v152 energy equations. Guards the inputs.

## 3. Per-tile robustness

- All four are **closed-form arithmetic** over finite-checked labs using
  `lib/num.js`; every division (`arr` renin, `free-thyroxine-index` ratio) and
  product/subtraction is guarded — a blank/non-finite/zero-denominator input renders
  a surfaced `valid:false` complete-the-fields fallback rather than `NaN`.
- **Unit discipline is the dominant correctness concern:** `arr` requires the renin
  unit (PRA vs DRC) and shows the matching cutoff, never crossing unit systems;
  `calcium-phosphate-product` and `nitrogen-balance` carry mg/dL↔mmol/L and
  protein↔nitrogen conversions with the factor surfaced. Each conversion path is
  unit-tested.
- **Guideline-posture, not threshold-worship:** `calcium-phosphate-product` surfaces
  the historical >55 caution **and** the contemporary "track individually" caveat so
  the tile does not imply a product target that current guidance has retired.
- All four render the [spec-v50](spec-v50.md) §3 posture note (screening/monitoring
  arithmetic over labs, confirmation and treatment are clinical) and defer the
  decision to the clinician ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** `free-thyroxine-index` and `nitrogen-balance` cite
  journals/standard formulation → **Class A**, no `ISSUER_PATTERN` trip.
  `arr` (**Endocrine Society** cutoffs) and `calcium-phosphate-product` (**KDIGO**)
  cite **issuing societies** → those acronyms **trip `ISSUER_PATTERN`** and force
  **documentation-only `docs/citation-staleness.md` rows** (the *formula* is fixed;
  the cited thresholds are guideline values — same treatment as the live KDIGO
  staging tiles and the v138/v139 society rows).
- **Build & gates (§6.1/§6.2):** the four computes live in the new
  `lib/endo-metab-v161.js` module (`arr`, `calciumPhosphateProduct`,
  `freeThyroxineIndex`, `nitrogenBalance`), added to `fuzz-tools.test.js` `MODULES`
  (every guarded division exercised). Renderers live in the new
  `views/group-v161.js`; its `RV161` export is spread into `app.js` `RENDERERS`.
  The catalog count moves on all **13 catalog-truth surfaces**; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass.

## 5. Files touched

```
docs/spec-v161.md                        (this file)
app.js                                   (+4 UTILITIES rows, groups E/F; import group-v161 RV161 into RENDERERS)
lib/endo-metab-v161.js                   (new module: arr, calciumPhosphateProduct, freeThyroxineIndex, nitrogenBalance)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to corrected-calcium, eag-a1c, icu-nutrition-target, mifflin-st-jeor)
views/group-v161.js                      (new renderer module: 4 renderers)
docs/clinical-citations.md               (+ rows for the four sources)
docs/citation-staleness.md               (+ documentation-only rows for arr [Endocrine Society] and calcium-phosphate-product [KDIGO])
test/unit/arr.test.js, calcium-phosphate-product.test.js, free-thyroxine-index.test.js, nitrogen-balance.test.js   (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/endo-metab-v161.js to MODULES)
docs/audits/v12/arr.md, calcium-phosphate-product.md, free-thyroxine-index.md, nitrogen-balance.md   (spec-v11 audit logs)
docs/scope-subspecialty-depth.md         (catalog ledger; CLOSE the v157 program running count)
CHANGELOG.md                             (Unreleased: v161 entry, +4; note Subspecialty Depth program complete)
README.md, package.json                  (catalog count + spec-progression line -> v161)
```

## 6. Acceptance criteria

v161 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed all four ids are absent.
- All 4 tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including an **ARR
  positive screen with PAC ≥15 ng/dL and the PRA-unit cutoff**, a **Ca×PO₄ at the
  historical 55 threshold with the track-individually caveat**, an **FTI correcting
  a high total-T4 for elevated binding**, and a **negative nitrogen balance**), a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- Every division is guarded and every unit-conversion path is unit-tested; blank
  inputs render a complete-the-fields fallback; `arr` never crosses renin-unit
  systems.
- The Endocrine-Society / KDIGO tiles carry their documentation-only
  `docs/citation-staleness.md` rows.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is live count + 4, all catalog-truth surfaces agree, and
  `docs/scope-subspecialty-depth.md` records the **Subspecialty Depth program
  complete**.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v161 with the +4 delta and the program close.

## 7. Out of scope for v161

- **No confirmatory aldosteronism testing** — `arr` is the screen; saline-infusion/
  captopril confirmation is clinical and not modeled.
- **No replacement of direct free-T4 assay** — `free-thyroxine-index` is the legacy
  binding-corrected estimate for settings without a free-T4 immunoassay; the
  renderer states that.
- **No protein/energy prescription** — `nitrogen-balance` reports adequacy;
  `icu-nutrition-target` and the v152 equations own the goal, cross-linked.
