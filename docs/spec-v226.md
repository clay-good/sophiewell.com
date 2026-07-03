# spec-v226.md — Nephrology, electrolyte & fluid formulas: Watson total body water, the Salazar-Corcoran obese creatinine clearance, estimated plasma volume status, the furosemide stress test, the fractional excretion of bicarbonate, and the pH-corrected serum potassium (+6 tiles)

> Status: **SHIPPED (2026-07-03).** Fourteenth feature spec of the **Bedside
> Decision & Physiology Instruments** program ([spec-v213](spec-v213.md)). Adds
> **6** deterministic nephrology / fluid formulas, each **verified absent by a
> direct scan of `app.js`** (spec-v85 §6.2): the catalog carries `sodium-correction`
> (which already computes the Adrogué-Madias infusate formula), `cockcroft-gault`,
> `egfr`, `fena-feurea`, `kdigo-aki`, and `urine-anion-gap`, but **not** Watson TBW,
> the Salazar-Corcoran clearance, ePVS, the furosemide stress test, the fractional
> excretion of bicarbonate, or the pH-corrected serum potassium.
>
> Catalog effect: **live `UTILITIES.length` + 6** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v226 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no fluid, dosing, or dialysis order** — these
> estimate and stratify). **Every formula/coefficient is re-fetched and
> cross-verified against ≥2 independent open sources** ([spec-v97](spec-v97.md)).

## 2. What v226 adds (6 tiles)

All Class A; journal + author citations, none trips `ISSUER_PATTERN`.

| id | group | name | inputs → output | citation |
| --- | --- | --- | --- | --- |
| `watson-tbw` | E | Watson total body water | age, height, weight, sex → TBW (L) | Watson PE, et al. Am J Clin Nutr. 1980;33(1):27-39 |
| `salazar-corcoran` | E | Salazar-Corcoran CrCl | age, weight, height, SCr, sex → CrCl | Salazar DE, Corcoran GB. Am J Med. 1988;84(6):1053-1060 |
| `epvs` | G | Estimated plasma volume status | hematocrit, hemoglobin → ePVS (dL/g) | Duarte K, et al. JACC Heart Fail. 2015;3(11):886-893 |
| `furosemide-stress-test` | G | Furosemide stress test | weight, 2-h urine, prior exposure → AKI progression | Chawla LS, et al. Crit Care. 2013;17(5):R207 |
| `fe-bicarbonate` | E | Fractional excretion of bicarbonate | urine/plasma HCO3 and Cr → FEHCO3 (%) | Kurtzman NA. South Med J. 2000;93(11):1042-1052 |
| `corrected-potassium-ph` | E | pH-corrected serum potassium | measured K, pH → corrected K | Adrogue HJ, Madias NE. Am J Med. 1981;71(3):456-467 |

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** All ratios
  and clearances use strictly-positive guards on their denominators; the corrected
  potassium bounds pH to a physiologic range. Each renders a complete-the-fields
  fallback rather than a `NaN`.
- **Each tile reports its value / verdict and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All six estimate / stratify, not order** ([spec-v11](spec-v11.md) §5.3); each
  renders the [spec-v50](spec-v50.md) §3 posture note.
- **All six flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 4. Files touched

```
docs/spec-v226.md                        (this file)
app.js                                   (+6 UTILITIES rows; import group-v226 RV226 into RENDERERS)
lib/nephrology-v226.js                   (new: watsonTbw, salazarCorcoran, epvs, furosemideStressTest, feBicarbonate, correctedPotassiumPh)
lib/meta.js                              (+6 META entries)
views/group-v226.js                      (new renderer module: 6 renderers)
test/unit/nephrology-v226.test.js        (worked examples)
test/unit/fuzz-tools.test.js             (add lib/nephrology-v226.js to MODULES)
CHANGELOG.md, README.md, package.json, docs/architecture.md, docs/scope-post-parity.md, docs/scope-mdcalc-parity.md  (catalog count live -> live+6)
```

## 5. Acceptance criteria

v226 is fully shipped when all 6 tiles are live (Class A) with a `META[id]` entry,
inline citation + `citationUrl` + `accessed`, and worked examples; every compute is
finite-guarded and fuzz-covered; `UTILITIES.length` is **live + 6** across all
catalog-truth surfaces; and `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` all pass.

## 6. Out of scope for v226

- **No fluid / dosing / dialysis order** — the tiles estimate and stratify; the
  decisions stay with the clinician and the patient ([spec-v11](spec-v11.md) §5.3).
  The **Adrogué-Madias** infusate formula is deferred: the live `sodium-correction`
  tile already computes it.
