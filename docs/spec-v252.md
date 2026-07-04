# spec-v252.md — Orthopedic / spine radiographic ratios: the Insall-Salvati ratio, the Torg-Pavlov ratio, the Meyerding spondylolisthesis grade, and the Beighton hypermobility score (+4 tiles → 1090)

> Status: **SHIPPED (2026-07-04).** An orthopedics / spine slice. Adds **4** well-
> established deterministic radiographic ratios & scores. **Each id was verified
> absent by a fixed-string scan of the extracted `app.js` id/name lists AND the MCP
> adapter set** (spec-v85 §6.2).
>
> Catalog effect: **live `UTILITIES.length` + 4** (1086 → 1090) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v252 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> ratio / point value is re-fetched and cross-verified against ≥2 independent open
> sources** ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v252 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `insall-salvati-ratio` | Insall-Salvati ratio | tendon / patella length | Insall & Salvati. Radiology. 1971 |
| `torg-pavlov-ratio` | Torg-Pavlov ratio | canal / body diameter | Pavlov & Torg. Radiology. 1987 |
| `meyerding-spondylolisthesis` | Meyerding grade | % slip → grade I-V | Meyerding. 1932 |
| `beighton-hypermobility` | Beighton hypermobility score | 9 manoeuvres → 0-9 | Beighton. Ann Rheum Dis. 1973 |

## 3. Source cross-verification (spec-v97)

- **Insall-Salvati:** patellar-tendon / patellar-bone length; 0.8-1.2 normal, < 0.8
  baja, > 1.2 alta. Reproduced from Insall & Salvati 1971 and physio-pedia.
- **Torg-Pavlov:** sagittal canal / vertebral-body diameter; ≤ 0.8 stenosis.
  Reproduced from Pavlov & Torg 1987 and EBMconsult.
- **Meyerding:** % slip = displacement / caudal-endplate width × 100; grade I 1-25%
  … V > 100%. Reproduced from Meyerding 1932 (StatPearls) and Orthobullets.
- **Beighton:** 5th finger, thumb, elbow, knee (L + R each) + palms flat; 0-9, ≥ 5
  adults. Reproduced from Beighton 1973 and the Ehlers-Danlos Society.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Length and
  displacement inputs coerce to bounded numbers; the Meyerding guards an
  implausible displacement; a blank field yields a bounded score or a "complete the
  fields" message, never a `NaN`.
- **Each tile reports its ratio / grade / score and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All compute a ratio / grade / score, none diagnose or order**
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v252.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v252 RV252 into RENDERERS)
lib/orthospine-v252.js                   (new: insallSalvati, torgPavlov, meyerdingSpondylolisthesis, beightonHypermobility)
lib/meta.js                              (+4 META entries)
views/group-v252.js                      (new renderer module: 4 renderers)
test/unit/orthospine-v252.test.js        (new: worked examples)
test/unit/fuzz-tools.test.js             (register orthospine-v252.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1086 → 1090)
```
