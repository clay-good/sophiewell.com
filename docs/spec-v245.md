# spec-v245.md — Hematology discrimination indices + HS severity: the Shine & Lal index, the Green & King index, the percent platelet recovery, and the IHS4 score (+4 tiles → 1062)

> Status: **SHIPPED (2026-07-04).** A hematology / dermatology slice. Adds **4** well-
> established deterministic tools. **Each id was verified absent by a fixed-string
> scan of the extracted `app.js` id/name lists AND the MCP adapter set** (spec-v85
> §6.2): the catalog carried the `mentzer`, `england-fraser`, `sirdah`, `srivastava`,
> `ehsani`, and `rdw-index` thalassemia discriminants, plus `hurley-stage` and
> `hiscr`, but neither Shine & Lal, Green & King, PPR, nor IHS4.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1058 → 1062) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v245 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> formula / point value is re-fetched and cross-verified against ≥2 independent open
> sources** ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v245 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `shine-lal-index` | Shine & Lal index | (MCV² × MCH)/100; < 1530 thal | Shine & Lal. Lancet. 1977 |
| `green-king-index` | Green & King index | (MCV² × RDW)/(Hb × 100); < 65 thal | Green & King. Blood Cells. 1989 |
| `percent-platelet-recovery` | Percent platelet recovery | [(post−pre)×BV]/transfused | Davis. Transfusion. 1999 |
| `ihs4` | IHS4 severity score | nodules×1 + abscesses×2 + tunnels×4 | Zouboulis. Br J Dermatol. 2017 |

## 3. Source cross-verification (spec-v97)

- **Shine & Lal:** (MCV² × MCH)/100; < 1530 thalassemia trait, > 1530 iron
  deficiency. Reproduced from Shine & Lal 1977 and PMC11303888.
- **Green & King:** (MCV² × RDW)/(Hb × 100); < 65 thalassemia trait. Reproduced
  from Green & King 1989 and EBMcalc.
- **PPR:** [(post − pre) platelet count × blood volume (L)] / [platelets transfused
  (×10¹¹)]; > 30% at 1 h good response. Reproduced from Davis 1999 and PMC5622816.
- **IHS4:** nodules × 1 + abscesses × 2 + draining tunnels × 4; 0-3 mild, 4-10
  moderate, ≥ 11 severe. Reproduced from Zouboulis 2017 and the European HS Foundation.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Cell indices
  and lesion counts coerce to bounded values; the PPR guards a post-count below the
  pre-count; a blank field yields a "complete the fields" message, never a `NaN`.
- **Each tile reports its index / score, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All compute an index or score, none diagnose or order** ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v245.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v245 RV245 into RENDERERS)
lib/hemederm-v245.js                     (new: shineLal, greenKing, percentPlateletRecovery, ihs4)
lib/meta.js                              (+4 META entries)
views/group-v245.js                      (new renderer module: 4 renderers)
test/unit/hemederm-v245.test.js          (new: worked examples)
test/unit/fuzz-tools.test.js             (register hemederm-v245.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1058 → 1062)
```
