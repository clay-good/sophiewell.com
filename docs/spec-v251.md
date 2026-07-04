# spec-v251.md — Cardiometabolic formulas: the corrected TIMI frame count, the Tp-e/QT ratio, SPISE, and the atherogenic index of plasma (+4 tiles → 1086)

> Status: **SHIPPED (2026-07-04).** A cardiology / metabolic slice. Adds **4** well-
> established deterministic formulas. **Each id was verified absent by a fixed-string
> scan of the extracted `app.js` id/name lists AND the MCP adapter set** (spec-v85
> §6.2): the catalog carried `timi-stemi`, `qtc-suite`, `homa-ir`, and `tyg-index`,
> but none of these four.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1082 → 1086) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v251 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> formula is re-fetched and cross-verified against ≥2 independent open sources**
> ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v251 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `corrected-timi-frame-count` | Corrected TIMI frame count | frames × 30/fps (÷1.7 LAD) | Gibson. Circulation. 1996 |
| `tpe-qt-ratio` | Tp-e/QT ratio | Tp-e / QT | Gupta. J Electrocardiol. 2008 |
| `spise` | SPISE | 600·HDL^0.185/(TG^0.2·BMI^1.338) | Paulmichl. Clin Chem. 2016 |
| `atherogenic-index-of-plasma` | Atherogenic index of plasma | log10(TG/HDL) | Dobiasova. Clin Biochem. 2001 |

## 3. Source cross-verification (spec-v97)

- **cTFC:** frame count normalized to 30 fps, LAD divided by 1.7; normal ~21 ± 3.
  Reproduced from Gibson 1996 and PMC2499881.
- **Tp-e/QT:** Tp-e / QT; reference ~0.21, > 0.25 increased. Reproduced from Gupta
  2008 and PMC5477084.
- **SPISE:** 600 × HDL^0.185 / (TG^0.2 × BMI^1.338), lipids mg/dL; < 5.4 IR
  (adolescents). Reproduced from Paulmichl 2016 (PMC6771329) and PMC9945119.
- **AIP:** log10(TG/HDL) mmol/L; < 0.11 low, 0.11-0.21 intermediate, > 0.21 high.
  Reproduced from Dobiasova 2001 and Mayo Clin Proc 2017.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Frame counts,
  intervals, and lipids coerce to bounded numbers; power/log terms operate on
  positive input ranges; a blank field yields a "complete the fields" message, never
  a `NaN`.
- **Each tile reports its value, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All compute a value, none diagnose or order** ([spec-v11](spec-v11.md) §5.3);
  each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v251.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v251 RV251 into RENDERERS)
lib/cardiometab-v251.js                  (new: correctedTimiFrameCount, tpeQtRatio, spise, atherogenicIndexOfPlasma)
lib/meta.js                              (+4 META entries)
views/group-v251.js                      (new renderer module: 4 renderers)
test/unit/cardiometab-v251.test.js       (new: worked examples)
test/unit/fuzz-tools.test.js             (register cardiometab-v251.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1082 → 1086)
```
