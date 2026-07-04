# spec-v253.md — Radiologic measurements & scores: NASCET carotid stenosis, the Helsinki CT score, the Genant vertebral-fracture grade, and testicular volume (+4 tiles → 1094)

> Status: **SHIPPED (2026-07-04).** A radiology / measurement slice. Adds **4** well-
> established deterministic calculators. **Each id was verified absent by a fixed-
> string scan of the extracted `app.js` id/name lists AND the MCP adapter set**
> (spec-v85 §6.2): the catalog carried `rotterdam-ct`, `marshall-ct`, and
> `twist-score`, but none of these four.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1090 → 1094) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v253 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> formula / point value is re-fetched and cross-verified against ≥2 independent open
> sources** ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v253 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `nascet-carotid-stenosis` | NASCET carotid stenosis | (1 − narrow/distal)×100 | NASCET. NEJM. 1991 |
| `helsinki-ct-score` | Helsinki CT score | weighted CT features → −3..+14 | Raj. Neurosurgery. 2014 |
| `genant-vertebral-fracture` | Genant grade | % height loss → grade 0-3 | Genant. J Bone Miner Res. 1993 |
| `testicular-volume` | Testicular volume | L×W×H×0.71 | Lambert |

## 3. Source cross-verification (spec-v97)

- **NASCET:** (1 − narrowest / distal ICA) × 100; < 50% mild, 50-69% moderate,
  ≥ 70% severe. Reproduced from NASCET 1991 and PMC7976065.
- **Helsinki CT:** SDH +2, ICH +2, EDH −3, mass > 25 mL +2, IVH +3, cisterns
  0/1/5; −3..+14. Reproduced from Raj 2014 and PMC9519640.
- **Genant:** grade 0 < 20%, 1 20-25%, 2 26-40%, 3 > 40% height loss. Reproduced
  from Genant 1993 and radiologykey.
- **Testicular volume:** L × W × H × 0.71 (Lambert). Reproduced from PMC3538616 and
  PMC3735018.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Dimensions,
  select points, and percentages coerce to bounded values; NASCET guards a residual
  lumen larger than the distal ICA; a blank field yields a bounded score or a
  "complete the fields" message, never a `NaN`.
- **Each tile reports its value / score / grade and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All compute a percentage / score / grade / volume, none diagnose or order**
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v253.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v253 RV253 into RENDERERS)
lib/radmeasure-v253.js                   (new: nascetCarotidStenosis, helsinkiCtScore, genantVertebralFracture, testicularVolume)
lib/meta.js                              (+4 META entries)
views/group-v253.js                      (new renderer module: 4 renderers)
test/unit/radmeasure-v253.test.js        (new: worked examples)
test/unit/fuzz-tools.test.js             (register radmeasure-v253.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1090 → 1094)
```
