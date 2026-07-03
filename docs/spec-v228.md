# spec-v228.md — Microcytic-anemia RBC discrimination indices: England & Fraser, Sirdah, the RDW Index (RDWI), Srivastava, and Ehsani (+5 tiles → 996)

> Status: **SHIPPED (2026-07-03).** A hematology depth slice. Adds **5**
> deterministic red-cell discrimination indices that screen beta-thalassemia
> trait (BTT) against iron-deficiency anemia (IDA) in a microcytic hypochromic
> CBC, from the complete-blood-count values already in hand. **Each tile was
> verified absent by a direct scan of `app.js`** (spec-v85 §6.2): the catalog
> already carries the sibling `mentzer` and `shine-lal` indices but **not**
> England & Fraser, Sirdah, the RDW Index, Srivastava, or Ehsani.
>
> Catalog effect: **live `UTILITIES.length` + 5** (991 → 996) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v228 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test (each computes from user inputs — none
> is a static reference table), ships its citation inline ([spec-v54](spec-v54.md)),
> inherits the [spec-v59](spec-v59.md) output-safety contract, renders the
> [spec-v50](spec-v50.md) §3 posture note, and honors [spec-v11](spec-v11.md) §5.3
> (**no diagnosis and no treatment order** — these screen; hemoglobin
> electrophoresis and iron studies confirm). **Every formula and cutoff is
> re-fetched and cross-verified against ≥2 independent open sources**
> ([spec-v97](spec-v97.md)). No citation names a society acronym that trips the
> `check-citations` ISSUER_PATTERN, so all five are Class A with no staleness rows.

## 2. What v228 adds (5 tiles)

All Group G; all Class A. MCV in fL, RBC in 10^6/µL, Hb in g/dL, MCH in pg, RDW in %.

| id | name | formula → verdict | citation |
| --- | --- | --- | --- |
| `england-fraser-index` | England & Fraser | MCV − RBC − (5 × Hb) − 3.4; < 0 → BTT | England JM, Fraser PM. Lancet. 1973;1(7801):449-452 |
| `sirdah-index` | Sirdah | MCV − RBC − (3 × Hb); < 27 → BTT | Sirdah M, et al. Int J Lab Hematol. 2008;30(4):324-330 |
| `rdw-index` | RDW Index (RDWI) | (MCV × RDW) / RBC; < 220 → BTT | Jayabose S, et al. J Pediatr Hematol Oncol. 1999;21(4):314 |
| `srivastava-index` | Srivastava | MCH / RBC; < 3.8 → BTT | Srivastava PC. Lancet. 1973;2(7821):154-155 |
| `ehsani-index` | Ehsani | MCV − (10 × RBC); < 15 → BTT | Ehsani MA, et al. Pak J Biol Sci. 2009;12(5):473-475 |

In every index, a value **below** the cutoff favors beta-thalassemia trait, a
value **above** it favors iron-deficiency anemia, and a value exactly at the
cutoff is reported as indeterminate.

## 3. Source cross-verification (spec-v97)

Formulas and published cutoffs were re-fetched and reproduced from two independent
open sources — Vehapoglu A, et al. *Anemia.* 2014;2014:576738 (PMC4003757, Table
2) and the Jameel/cutoff-determination review (PMC4003440) — which agree on all
five formulas and on the < 0 / < 27 / < 220 / < 3.8 / < 15 published thresholds.
The England & Fraser discriminant function (constant 3.4, cutoff 0) was confirmed
against a third laboratory-samples discriminant-function review.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Each index
  parses its CBC inputs, range-checks them (MCV 30–200, RBC 0.5–10, Hb 1–25,
  MCH 5–60, RDW 5–60), and renders a complete-the-fields fallback rather than a
  `NaN`.
- **Each tile reports its index value, the favored diagnosis with its cutoff, and
  the driving formula** ([spec-v59](spec-v59.md)).
- **All five screen / stratify, not diagnose or order** ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note deferring
  hemoglobin electrophoresis, iron studies, and the diagnosis to the clinician.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 5. Files touched

```
docs/spec-v228.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v228 RV228 into RENDERERS)
lib/mixed-v228.js                        (new: englandFraser, sirdah, rdwi, srivastava, ehsani)
lib/meta.js                              (+5 META entries)
views/group-v228.js                      (new renderer module: 5 renderers)
test/unit/mixed-v228.test.js             (new: worked examples)
test/unit/fuzz-tools.test.js             (register mixed-v228.js)
index.html, README.md, package.json, docs/scope-mdcalc-parity.md   (catalog count 991 → 996)
```
