# spec-v250.md — Obstetric calculators: the Pearl Index, the Robinson-Fleming CRL dating equation, the CARPREG II cardiac-risk score, and the Malinas imminent-delivery score (+4 tiles → 1082)

> Status: **SHIPPED (2026-07-04).** An obstetrics slice. Adds **4** well-established
> deterministic calculators. **Each id was verified absent by a fixed-string scan of
> the extracted `app.js` id/name lists AND the MCP adapter set** (spec-v85 §6.2): the
> catalog carried `bishop`, `due-date`, `afi`, and `fullpiers`, but none of these four.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1078 → 1082) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v250 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> formula / point value is re-fetched and cross-verified against ≥2 independent open
> sources** ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v250 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `pearl-index` | Pearl Index | (pregnancies × 1200)/months | Pearl. Lancet. 1933 |
| `robinson-crl-dating` | Robinson-Fleming CRL dating | 8.052·√(1.037·CRL) + 23.73 | Robinson & Fleming. 1975 |
| `carpreg-ii` | CARPREG II cardiac-risk score | weighted factors → risk % | Silversides. JACC. 2018 |
| `malinas-score` | Malinas imminent-delivery score | 5 criteria × 0-2 → 0-10 | Malinas |

## 3. Source cross-verification (spec-v97)

- **Pearl Index:** (accidental pregnancies × 1200)/months of exposure. Reproduced
  from ScienceDirect and Drugs.com.
- **Robinson-Fleming:** GA (days) = 8.052 × √(1.037 × CRL) + 23.73; valid CRL 5-84
  mm. Reproduced from Robinson & Fleming 1975 and Omnicalculator.
- **CARPREG II:** prior events 3, NYHA III-IV/cyanosis 3, mechanical valve 3,
  ventricular dysfunction 2, left obstruction 2, pulmonary HTN 2, aortopathy 2,
  coronary 2, no prior intervention 1, late assessment 1; risk 0-1=5% … >4=41%.
  Reproduced from Silversides 2018 (JACC) and MDApp.
- **Malinas:** parity, labour duration, contraction duration, interval, membranes,
  each 0-2; 0-10, ≥ 6 imminent. Reproduced from Wikipedia and French SAMU guidelines.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Numeric,
  select, and checkbox inputs coerce to bounded values; the Pearl Index guards a
  zero denominator via its positive month range; a blank field yields a bounded
  score or a "complete the fields" message, never a `NaN`.
- **Each tile reports its value, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All compute a rate / dating / score, none diagnose or order**
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v250.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v250 RV250 into RENDERERS)
lib/obgyn-v250.js                        (new: pearlIndex, robinsonCrlDating, carpregII, malinasScore)
lib/meta.js                              (+4 META entries)
views/group-v250.js                      (new renderer module: 4 renderers)
test/unit/obgyn-v250.test.js             (new: worked examples)
test/unit/fuzz-tools.test.js             (register obgyn-v250.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1078 → 1082)
```
