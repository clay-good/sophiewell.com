# spec-v238.md — Anthropometric / metabolic estimators: relative fat mass, the body roundness index, the US Navy body-fat estimate, and the estimated glucose disposal rate (+4 tiles → 1034)

> Status: **SHIPPED (2026-07-04).** An anthropometric / metabolic slice. Adds **4**
> well-established deterministic estimators. **Each id was verified absent by a
> fixed-string scan of the extracted `app.js` id/name lists AND the MCP adapter
> set** (spec-v85 §6.2): the catalog carried `bmi`, `deurenberg-body-fat`,
> `homa-ir`, `tyg-index`, and `conicity-index`, but none of these four.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1030 → 1034) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v238 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order** — these
> estimate a value). **Every formula is re-fetched and cross-verified against ≥2
> independent open sources** ([spec-v97](spec-v97.md)). All are Class A with no
> staleness rows.

## 2. What v238 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `relative-fat-mass` | Relative fat mass | 64 − 20·(height/waist) + 12·sex → fat % | Woolcott & Bergman. Sci Rep. 2018 |
| `body-roundness-index` | Body roundness index | 364.2 − 365.5·√(1 − …) → index | Thomas. Obesity. 2013 |
| `navy-body-fat` | US Navy body-fat estimate | log-circumference equation → fat % | Hodgdon & Beckett. 1984 |
| `egdr` | Estimated glucose disposal rate | 21.158 − 0.09·waist − 3.407·HTN − 0.551·A1c | Williams. Diabetes. 2000 |

## 3. Source cross-verification (spec-v97)

- **RFM:** 64 − 20·(height/waist) + 12·sex (female = 1, male = 0). Reproduced from
  Woolcott & Bergman 2018 and MDApp.
- **BRI:** 364.2 − 365.5·√(1 − ((waist/(2π))/(0.5·height))²). Reproduced from Thomas
  2013 and JAMA Network Open 2024.
- **US Navy body fat:** men BF% = 495/(1.0324 − 0.19077·log₁₀(waist−neck) +
  0.15456·log₁₀(height)) − 450; women BF% = 495/(1.29579 − 0.35004·log₁₀(waist+hip−
  neck) + 0.22100·log₁₀(height)) − 450 (inches). Reproduced from Hodgdon-Beckett
  1984 and Omnicalculator / LibreTexts.
- **eGDR:** 21.158 − 0.09·waist(cm) − 3.407·hypertension − 0.551·HbA1c. Reproduced
  from Williams 2000 and PMC9392437.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** The BRI
  guards a negative square-root argument, the Navy estimate guards non-positive
  logarithm arguments; a blank field yields a "complete the fields" message, never
  a `NaN`.
- **Each tile reports its estimate and the driving inputs** ([spec-v59](spec-v59.md)).
- **All estimate a value, none diagnose or order** ([spec-v11](spec-v11.md) §5.3);
  each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v238.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v238 RV238 into RENDERERS)
lib/anthro-v238.js                       (new: relativeFatMass, bodyRoundnessIndex, navyBodyFat, egdr)
lib/meta.js                              (+4 META entries)
views/group-v238.js                      (new renderer module: 4 renderers)
test/unit/anthro-v238.test.js            (new: worked examples)
test/unit/fuzz-tools.test.js             (register anthro-v238.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1030 → 1034)
```
