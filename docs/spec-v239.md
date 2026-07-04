# spec-v239.md — Hepatology / GI-surgery scores: the Bonacini cirrhosis discriminant score, the Goteborg University Cirrhosis Index, the Mannheim Peritonitis Index, and the Boey score (+4 tiles → 1038)

> Status: **SHIPPED (2026-07-04).** A hepatology / GI-surgery slice. Adds **4**
> well-established deterministic scores. **Each id was verified absent by a fixed-
> string scan of the extracted `app.js` id/name lists AND the MCP adapter set**
> (spec-v85 §6.2): the catalog carried `apri`, `fib4`, and `nafld-fibrosis`, but
> none of these four.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1034 → 1038) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v239 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> point value / formula is re-fetched and cross-verified against ≥2 independent open
> sources** ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v239 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `bonacini-cds` | Bonacini cirrhosis discriminant score | platelets + ALT/AST + INR binned → 0-11 | Bonacini. Am J Gastroenterol. 1997 |
| `guci` | Goteborg University Cirrhosis Index | (AST/ULN)·INR·100/platelets | Islam. Scand J Gastroenterol. 2005 |
| `mannheim-peritonitis-index` | Mannheim Peritonitis Index | weighted factors → 0-47; > 26 high | Linder & Wacha. Chirurg. 1987 |
| `boey-score` | Boey score | 3 factors × 1 → 0-3 | Boey. Ann Surg. 1987 |

## 3. Source cross-verification (spec-v97)

- **Bonacini CDS:** platelets (>340=0 … <40=6), ALT/AST ratio (>1.7=0 … <0.6=3),
  INR (<1.1=0, 1.1-1.4=1, >1.4=2); 0-11, ≤ 3 unlikely, ≥ 8 likely. Reproduced from
  Bonacini 1997 (PubMed 9260794) and EBMcalc.
- **GUCI:** (AST/ULN) × INR × 100 / platelets (10⁹/L); > 1.0 suggests cirrhosis.
  Reproduced from Islam 2005 and PMC12452163.
- **Mannheim Peritonitis Index:** age > 50 (5), female (5), organ failure (7),
  malignancy (4), duration > 24 h (4), non-colonic origin (4), diffuse peritonitis
  (6), exudate clear/purulent/fecal (0/6/12); 0-47, > 26 high mortality risk.
  Reproduced from Linder & Wacha 1987 and PMC5013738.
- **Boey score:** shock, perforation > 24 h, comorbidity, each 1 (0-3); mortality
  rises steeply with each factor. Reproduced from Boey 1987 and PMC7282445.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Numeric labs
  bin to bounded points; checkbox / select inputs coerce to bounded integers; a
  blank form yields a 0 score or a "complete the fields" message, never a `NaN`.
- **Each tile reports its score, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All score or classify risk, none diagnose or order** ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v239.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v239 RV239 into RENDERERS)
lib/gisurg-v239.js                       (new: bonaciniCds, guci, mannheimPeritonitisIndex, boeyScore)
lib/meta.js                              (+4 META entries)
views/group-v239.js                      (new renderer module: 4 renderers)
test/unit/gisurg-v239.test.js            (new: worked examples)
test/unit/fuzz-tools.test.js             (register gisurg-v239.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1034 → 1038)
```
