# spec-v232.md — Thrombosis/coagulation bedside scores: the Villalta post-thrombotic-syndrome scale and the ISTH sepsis-induced coagulopathy (SIC) score (+2 tiles → 1009)

> Status: **SHIPPED (2026-07-03).** A vascular-medicine / critical-care slice. Adds
> **2** well-validated deterministic scores. **Each id was verified absent by a
> fixed-string scan of the extracted `app.js` id/name lists AND the MCP adapter
> set** (spec-v85 §6.2): the catalog carried `isth-dic`, `wells-dvt-caprini`,
> `padua`, and `sirs`, but neither the Villalta scale nor the SIC score.
>
> Catalog effect: **live `UTILITIES.length` + 2** (1007 → 1009) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v232 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order** — these
> grade and classify). **Every point value is re-fetched and cross-verified against
> ≥2 independent open sources** ([spec-v97](spec-v97.md)). All are Class A with no
> staleness rows.

## 2. What v232 adds (2 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `villalta` | Villalta scale (PTS) | 5 symptoms + 6 signs × 0-3 + ulcer (0-33) → none/mild/moderate/severe | Kahn SR, et al. J Thromb Haemost. 2009;7(5):884-888 |
| `sic` | ISTH SIC score | platelet + PT-INR + total SOFA, each 0-2 (0-6) → >= 4 SIC | Iba T, et al. J Thromb Haemost. 2019 (BMJ Open. 2017;7(9):e017046) |

Villalta bands: 0-4 none, 5-9 mild, 10-14 moderate, ≥ 15 severe; a venous ulcer is
severe regardless of the total. SIC: a total ≥ 4 diagnoses sepsis-induced
coagulopathy.

## 3. Source cross-verification (spec-v97)

The Villalta 11-item 0-3 scoring, the 0-4 / 5-9 / 10-14 / ≥15 bands, and the
ulcer-overrides-to-severe rule were reproduced from the Kahn 2009 standardization
and independent calculators. The SIC platelet (≥150=0, 100-150=1, <100=2), PT-INR
(≤1.2=0, 1.2-1.4=1, >1.4=2), and total-SOFA (0/1/≥2 → 0/1/2, capped) sub-scores and
the ≥4 threshold were reproduced from the Iba/ISTH-SSC criteria and MDCalc.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** 0-3 / 0-2
  select and checkbox inputs coerce to bounded integers; a blank form yields a 0
  score, not a `NaN`.
- **Each tile reports its score, the band / determination, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **Both grade or classify, not diagnose or order** ([spec-v11](spec-v11.md) §5.3);
  each renders the [spec-v50](spec-v50.md) §3 posture note.
- **Both flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v232.md                        (this file)
app.js                                   (+2 UTILITIES rows; import group-v232 RV232 into RENDERERS)
lib/coagscore-v232.js                    (new: villalta, sic)
lib/meta.js                              (+2 META entries)
views/group-v232.js                      (new renderer module: 2 renderers)
test/unit/coagscore-v232.test.js         (new: worked examples)
test/unit/fuzz-tools.test.js             (register coagscore-v232.js)
index.html, README.md, package.json, docs/scope-mdcalc-parity.md   (catalog count 1007 → 1009)
```
