# spec-v247.md — Pediatric acute-care + toxicology tools: the Pediatric Trauma Score, the BIND score, the Widmark blood-alcohol estimate, and the POVOC score (+4 tiles → 1070)

> Status: **SHIPPED (2026-07-04).** A pediatric acute-care / toxicology slice. Adds
> **4** well-established deterministic tools. **Each id was verified absent by a
> fixed-string scan of the extracted `app.js` id/name lists AND the MCP adapter
> set** (spec-v85 §6.2): the catalog carried `yos` (Yale Observation Scale), `big`
> (BIG score), `apfel` (adult PONV), and `bhutani-bilirubin`, but none of these four.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1066 → 1070) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v247 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> point value / formula is re-fetched and cross-verified against ≥2 independent open
> sources** ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v247 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `pediatric-trauma-score` | Pediatric Trauma Score | 6 components × −1/+1/+2 → −6..+12 | Tepas. J Pediatr Surg. 1987 |
| `bind-score` | BIND score | 3 signs × 0-3 → 0-9 | Johnson & Bhutani. 1999 |
| `widmark-bac` | Widmark BAC estimate | A/(r·wt·10) − 0.015·t | Widmark. 1932 |
| `povoc-ponv` | POVOC pediatric POV score | 4 factors × 1 → 0-4 | Eberhart. Anesth Analg. 2004 |

## 3. Source cross-verification (spec-v97)

- **PTS:** weight, airway, systolic BP, CNS, open wound, skeletal, each −1/+1/+2;
  −6..+12, ≤ 8 increased mortality / transfer. Reproduced from Tepas 1987 and PMC8446435.
- **BIND:** mental status + muscle tone + cry, each 0-3; 0-9, 1-3 mild, 4-6 moderate,
  7-9 severe. Reproduced from Johnson & Bhutani 1999 and PMC4389967.
- **Widmark:** BAC (g/100 mL) = A/(r × weight × 10) − 0.015 × hours (r = 0.68/0.55).
  Reproduced from Widmark 1932 and PMC4361698.
- **POVOC:** surgery ≥ 30 min, age ≥ 3 y, POV/PONV history, strabismus surgery, each
  1; 0-4, POV ~ 9/10/30/55/70%. Reproduced from Eberhart 2004 and medicalalgorithms.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Tri-state and
  0-3 select inputs coerce to bounded integers; the Widmark BAC clamps at 0; a blank
  field yields a bounded score or a "complete the fields" message, never a `NaN`.
- **Each tile reports its score / estimate, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All score or estimate a value, none diagnose or order** ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v247.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v247 RV247 into RENDERERS)
lib/pedstox-v247.js                      (new: pediatricTraumaScore, bindScore, widmarkBac, povocPonv)
lib/meta.js                              (+4 META entries)
views/group-v247.js                      (new renderer module: 4 renderers)
test/unit/pedstox-v247.test.js           (new: worked examples)
test/unit/fuzz-tools.test.js             (register pedstox-v247.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1066 → 1070)
```
