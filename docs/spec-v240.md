# spec-v240.md — Palliative / rehabilitation functional measures: the Edmonton Symptom Assessment System, the Rivermead Mobility Index, the predicted 6-minute walk distance, and QuickDASH (+4 tiles → 1042)

> Status: **SHIPPED (2026-07-04).** A palliative / rehabilitation slice. Adds **4**
> well-established deterministic measures. **Each id was verified absent by a fixed-
> string scan of the extracted `app.js` id/name lists AND the MCP adapter set**
> (spec-v85 §6.2).
>
> Catalog effect: **live `UTILITIES.length` + 4** (1038 → 1042) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v240 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> scoring rule / formula is re-fetched and cross-verified against ≥2 independent
> open sources** ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v240 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `esas-symptom-assessment` | Edmonton Symptom Assessment System | 9 symptoms × 0-10 → 0-90 | Bruera. J Palliat Care. 1991 |
| `rivermead-mobility-index` | Rivermead Mobility Index | items achieved → 0-15 | Collen. Int Disabil Stud. 1991 |
| `six-minute-walk-predicted` | Predicted 6-minute walk distance | sex/height/age/weight → meters | Enright & Sherrill. 1998 |
| `quickdash` | QuickDASH | 11 items × 1-5 → 0-100 | Beaton. J Bone Joint Surg Am. 2005 |

## 3. Source cross-verification (spec-v97)

- **ESAS:** 9 symptoms each 0-10, total 0-90. Reproduced from Bruera 1991 and
  Alberta Health Services.
- **RMI:** 15 mobility items, each achieved = 1, total 0-15. Reproduced from Collen
  1991 and Shirley Ryan AbilityLab.
- **Predicted 6MWD:** men = 7.57·height − 5.02·age − 1.76·weight − 309; women =
  2.11·height − 2.29·weight − 5.78·age + 667; LLN = predicted − 153/−139.
  Reproduced from Enright & Sherrill 1998 and medicalalgorithms.
- **QuickDASH:** 11 items each 1-5, score = [(mean) − 1] × 25 (≥ 10 answered).
  Reproduced from Beaton 2005 and the Institute for Work & Health.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Item scores
  and counts coerce to bounded integers; the 6MWD guards a negative distance; a
  blank form yields a bounded score or a "complete the fields" message, never a
  `NaN`.
- **Each tile reports its score / distance and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All sum or estimate a value, none diagnose or order** ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v240.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v240 RV240 into RENDERERS)
lib/rehab-v240.js                        (new: esas, rivermead, sixMinuteWalkPredicted, quickDash)
lib/meta.js                              (+4 META entries)
views/group-v240.js                      (new renderer module: 4 renderers)
test/unit/rehab-v240.test.js             (new: worked examples)
test/unit/fuzz-tools.test.js             (register rehab-v240.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1038 → 1042)
```
