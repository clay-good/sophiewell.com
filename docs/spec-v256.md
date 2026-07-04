# spec-v256.md — Rheumatology + critical-care tools: the MASES enthesitis score, MMT-8, the Intubation Difficulty Scale, and the CROP weaning index (+4 tiles → 1106)

> Status: **SHIPPED (2026-07-04).** A rheumatology / critical-care slice. Adds **4**
> well-established deterministic tools. **Each id was verified absent by a fixed-
> string scan of the extracted `app.js` id/name lists AND the MCP adapter set**
> (spec-v85 §6.2): the catalog carried `basdai`, `el-ganzouri`, `rsbi`, and
> `integrative-weaning-index`, but none of these four.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1102 → 1106) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v256 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> point value / formula is re-fetched and cross-verified against ≥2 independent open
> sources** ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v256 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `mases-enthesitis` | MASES enthesitis score | 13 sites × 0/1 → 0-13 | Heuft-Dorenbosch. Ann Rheum Dis. 2003 |
| `mmt8-myositis` | Manual Muscle Testing-8 | 8 muscles × 0-10 → 0-80 | IMACS |
| `intubation-difficulty-scale` | Intubation Difficulty Scale | N1-N7 summed | Adnet. Anesthesiology. 1997 |
| `crop-index` | CROP weaning index | Cdyn·PImax·(PaO2/PAO2)/RR | Yang & Tobin. NEJM. 1991 |

## 3. Source cross-verification (spec-v97)

- **MASES:** 13 entheseal sites each 0/1; 0-13, ≥ 1 enthesitis. Reproduced from
  Heuft-Dorenbosch 2003 and PMC9510351.
- **MMT-8:** 8 muscle groups each 0-10; 0-80. Reproduced from the IMACS core-set and
  the NIH/NIEHS scoring sheet.
- **IDS:** N1 attempts + N2 operators + N3 techniques + N4 (Cormack − 1) + N5 force +
  N6 laryngeal pressure + N7 cords; 0 easy, > 5 difficult. Reproduced from Adnet 1997
  and medicalalgorithms.
- **CROP:** [Cdyn × PImax × (PaO2/PAO2)] / RR, PAO2 = 713·FiO2 − PaCO2/0.85; ≥ 13
  favors extubation. Reproduced from Yang & Tobin 1991 and LITFL.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Checkbox,
  select, and physiologic inputs coerce to bounded values; CROP guards a non-positive
  alveolar PO2; a blank field yields a bounded score or a "complete the fields"
  message, never a `NaN`.
- **Each tile reports its score / index and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All score, grade, or compute a value, none diagnose or order**
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v256.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v256 RV256 into RENDERERS)
lib/rheumcrit-v256.js                    (new: masesEnthesitis, mmt8, intubationDifficultyScale, cropIndex)
lib/meta.js                              (+4 META entries)
views/group-v256.js                      (new renderer module: 4 renderers)
test/unit/rheumcrit-v256.test.js         (new: worked examples)
test/unit/fuzz-tools.test.js             (register rheumcrit-v256.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1102 → 1106)
```
