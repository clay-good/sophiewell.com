# spec-v231.md — Nutrition/inflammation prognostic tools: the Naples Prognostic Score, the neutrophil-to-monocyte ratio, and the fibrinogen-to-albumin ratio (+3 tiles → 1007)

> Status: **SHIPPED (2026-07-03).** A hematology / nutrition slice continuing the
> [spec-v229](spec-v229.md)/[spec-v230](spec-v230.md) index family. Adds **3**
> deterministic prognostic tools computed from labs already in hand. **Each id was
> verified absent by a fixed-string scan of the extracted `app.js` id/name lists
> AND the MCP adapter set** (spec-v85 §6.2).
>
> Catalog effect: **live `UTILITIES.length` + 3** (1004 → 1007) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v231 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). Formulas
> and cutoffs are re-fetched and cross-verified against ≥2 independent open sources
> ([spec-v97](spec-v97.md)). All three are Class A with no staleness rows.

## 2. What v231 adds (3 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `naples-prognostic-score` | Naples Prognostic Score | albumin + cholesterol + NLR + LMR (0-4) → group 0/1/2 | Galizia G, et al. Dis Colon Rectum. 2017;60(12):1273-1284 |
| `nmr` | Neutrophil-to-Monocyte Ratio | ANC / AMC → ratio | Nishijima-class CBC-ratio literature |
| `far` | Fibrinogen-to-Albumin Ratio | fibrinogen (mg/dL) / albumin (g/dL) → ratio | Sun DW, et al. World J Surg Oncol. 2020;18(1):9 |

The Naples score assigns 1 point each for albumin < 4 g/dL, total cholesterol
≤ 180 mg/dL, NLR > 2.96, and LMR ≤ 4.44; the 0-4 total maps to group 0 (0),
group 1 (1-2), and group 2 (3-4). `nmr` and `far` carry no universal cutoff and
report the value with a context-dependence note (the same design as `sii`).

## 3. Source cross-verification (spec-v97)

The Naples four-factor cutoffs (albumin 4 g/dL, cholesterol 180 mg/dL, NLR 2.96,
LMR 4.44) and the 0 / 1-2 / 3-4 grouping were reproduced from the Galizia 2017
derivation and multiple independent validations. NMR = ANC/AMC and FAR =
fibrinogen/albumin are plain quotients; FAR's reporting convention varies across
the literature (g/L vs mg/dL, some ×100) so this tile fixes and labels the
mg/dL-over-g/dL form in both the input labels and the note.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Inputs are
  range-checked; a blank form yields a complete-the-fields fallback, not a `NaN`;
  a divide-by-entered-0 is blocked by the > 0 input bound.
- **Each tile reports its score/value, the group or a context note, and the driving
  inputs** ([spec-v59](spec-v59.md)).
- **All three compute a score or lab value, not a diagnosis or order**
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3
  posture note.
- **All three flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 5. Files touched

```
docs/spec-v231.md                        (this file)
app.js                                   (+3 UTILITIES rows; import group-v231 RV231 into RENDERERS)
lib/prognostic-v231.js                   (new: naples, nmr, far)
lib/meta.js                              (+3 META entries)
views/group-v231.js                      (new renderer module: 3 renderers)
test/unit/prognostic-v231.test.js        (new: worked examples)
test/unit/fuzz-tools.test.js             (register prognostic-v231.js)
index.html, README.md, package.json, docs/scope-mdcalc-parity.md   (catalog count 1004 → 1007)
```
