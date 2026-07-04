# spec-v246.md — IBD / GI activity indices: the Simple Clinical Colitis Activity Index, the Pediatric Ulcerative Colitis Activity Index, the Boston Bowel Preparation Scale, and the simplified autoimmune-hepatitis criteria (+4 tiles → 1066)

> Status: **SHIPPED (2026-07-04).** A gastroenterology slice. Adds **4** well-
> established deterministic indices. **Each id was verified absent by a fixed-string
> scan of the extracted `app.js` id/name lists AND the MCP adapter set** (spec-v85
> §6.2): the catalog carried `harvey-bradshaw` and `mayo-uc`, but none of SCCAI,
> PUCAI, BBPS, or the simplified AIH criteria.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1062 → 1066) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v246 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> point value is re-fetched and cross-verified against ≥2 independent open sources**
> ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v246 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `sccai` | Simple Clinical Colitis Activity Index | 6 domains → 0-19; ≥ 5 active | Walmsley. Gut. 1998 |
| `pucai` | Pediatric Ulcerative Colitis Activity Index | 6 items → 0-85 | Turner. Gastroenterology. 2007 |
| `bbps-boston` | Boston Bowel Preparation Scale | 3 segments × 0-3 → 0-9 | Lai. Gastrointest Endosc. 2009 |
| `simplified-aih` | Simplified AIH criteria | autoantibodies + IgG + histology + viral-absent → 0-8 | Hennes / IAIHG. Hepatology. 2008 |

## 3. Source cross-verification (spec-v97)

- **SCCAI:** day (0-3) + night (0-2) frequency, urgency (0-3), blood (0-3),
  wellbeing (0-4), extracolonic (0-4); 0-19, ≥ 5 active. Reproduced from Walmsley
  1998 and the ECCO e-Guide.
- **PUCAI:** abdominal pain (0/5/10), rectal bleeding (0/10/20/30), stool
  consistency (0/5/10), stools/24 h (0/5/10/15), nocturnal (0/10), activity
  (0/5/10); 0-85, < 10 remission … 65-85 severe. Reproduced from Turner 2007 and MDCalc.
- **BBPS:** right + transverse + left colon each 0-3; 0-9, ≥ 6 adequate. Reproduced
  from Lai 2009 and PMC2763922.
- **Simplified AIH:** autoantibodies (0-2), IgG (0-2), histology (0-2), viral-absent
  (0-1); 0-8, ≥ 6 probable, ≥ 7 definite. Reproduced from Hennes 2008 (IAIHG) and PMC5915689.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Select /
  checkbox inputs coerce to bounded integers; a blank form yields a 0 score, never a
  `NaN`.
- **Each tile reports its score, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All score or grade disease activity, none diagnose or order**
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v246.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v246 RV246 into RENDERERS)
lib/ibd-v246.js                          (new: sccai, pucai, bbpsBoston, simplifiedAih)
lib/meta.js                              (+4 META entries)
views/group-v246.js                      (new renderer module: 4 renderers)
test/unit/ibd-v246.test.js               (new: worked examples)
test/unit/fuzz-tools.test.js             (register ibd-v246.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1062 → 1066)
```
