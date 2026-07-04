# spec-v237.md — Cardiology ECG / echo bedside calculators: the Romhilt-Estes LVH score, the Wilkins mitral-valve score, the mitral valve area by pressure half-time, the aortic dimensionless index, and the rate-pressure product (+5 tiles → 1030)

> Status: **SHIPPED (2026-07-04).** A cardiology slice. Adds **5** well-established
> deterministic calculators. **Each id was verified absent by a fixed-string scan of
> the extracted `app.js` id/name lists AND the MCP adapter set** (spec-v85 §6.2).
>
> Catalog effect: **live `UTILITIES.length` + 5** (1025 → 1030) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v237 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> point value / formula is re-fetched and cross-verified against ≥2 independent open
> sources** ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v237 adds (5 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `romhilt-estes` | Romhilt-Estes LVH score | weighted ECG criteria → 0-13; ≥ 5 definite | Romhilt & Estes. Am Heart J. 1968 |
| `wilkins-score` | Wilkins mitral-valve score | 4 features × 1-4 → 4-16; ≤ 8 favorable | Wilkins. Br Heart J. 1988 |
| `mitral-valve-area-pht` | MVA by pressure half-time | 220 / PHT → cm² | Hatle. Circulation. 1979 |
| `aortic-dvi` | Aortic dimensionless index | LVOT VTI / AV VTI → ratio | ASE/EACVI. 2017 |
| `rate-pressure-product` | Rate-pressure product | HR × SBP | Gobel. Circulation. 1978 |

## 3. Source cross-verification (spec-v97)

- **Romhilt-Estes:** voltage 3, ST-T strain 3 (1 on digitalis), LA abnormality 3,
  LAD ≥ −30° 2, QRS ≥ 90 ms 1, intrinsicoid ≥ 50 ms 1; ≥ 5 definite, 4 probable.
  Reproduced from Romhilt & Estes 1968 (PMC5495629) and my-ekg.
- **Wilkins:** leaflet mobility, thickening, calcification, subvalvular thickening,
  each 1-4 (4-16); ≤ 8 favorable for PBMV, 9-12 intermediate, ≥ 13 unfavorable.
  Reproduced from Wilkins 1988 and appcardio / johnsonfrancis.
- **MVA by PHT:** 220 / pressure half-time (ms); > 1.5 mild, 1.0-1.5 moderate,
  < 1.0 severe. Reproduced from Hatle 1979 and e-echocardiography.
- **Aortic DVI:** LVOT VTI / aortic-valve VTI; ≤ 0.25 severe, 0.25-0.50 moderate,
  > 0.50 mild. Reproduced from ASE/EACVI 2017 and cardioserv.
- **Rate-pressure product:** HR × SBP; myocardial-oxygen-demand surrogate.
  Reproduced from Gobel 1978 and standard references.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Checkbox /
  select / numeric inputs coerce to bounded values; the MVA and DVI guard against
  zero denominators; a blank field yields a bounded score or a "complete the
  fields" message, never a `NaN`.
- **Each tile reports its score / value, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All score, classify, or compute a value, none diagnose or order**
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v237.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v237 RV237 into RENDERERS)
lib/cardioecho-v237.js                   (new: romhiltEstes, wilkinsScore, mitralValveAreaPht, aorticDvi, ratePressureProduct)
lib/meta.js                              (+5 META entries)
views/group-v237.js                      (new renderer module: 5 renderers)
test/unit/cardioecho-v237.test.js        (new: worked examples)
test/unit/fuzz-tools.test.js             (register cardioecho-v237.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1025 → 1030)
```
