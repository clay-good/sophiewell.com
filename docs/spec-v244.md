# spec-v244.md — Sports-medicine / MSK measures: the Lysholm knee score, the Marx activity rating scale, the Foot Posture Index, and the Balance Error Scoring System (+4 tiles → 1058)

> Status: **SHIPPED (2026-07-04).** A sports-medicine / musculoskeletal slice. Adds
> **4** well-established deterministic measures. **Each id was verified absent by a
> fixed-string scan of the extracted `app.js` id/name lists AND the MCP adapter
> set** (spec-v85 §6.2).
>
> Catalog effect: **live `UTILITIES.length` + 4** (1054 → 1058) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v244 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> point value is re-fetched and cross-verified against ≥2 independent open sources**
> ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v244 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `lysholm-knee-score` | Lysholm knee score | 8 items → 0-100 | Lysholm & Gillquist. Am J Sports Med. 1982 |
| `marx-activity-rating` | Marx activity rating scale | 4 items × 0-4 → 0-16 | Marx. Am J Sports Med. 2001 |
| `foot-posture-index` | Foot Posture Index (FPI-6) | 6 observations × −2..+2 → −12..+12 | Redmond. Clin Biomech. 2006 |
| `bess-balance-error` | Balance Error Scoring System | 6 stances × errors → 0-60 | Riemann & Guskiewicz. 2000 |

## 3. Source cross-verification (spec-v97)

- **Lysholm:** limp (5), support (5), locking (15), instability (25), pain (25),
  swelling (10), stair climbing (10), squatting (5); 0-100, ≥ 95 excellent, 84-94
  good, 65-83 fair, < 65 poor. Reproduced from Lysholm & Gillquist 1982 and physiotutors.
- **Marx:** running + cutting + deceleration + pivoting, each 0-4; 0-16, higher =
  greater knee demand. Reproduced from Marx 2001 (PMC4547111) and APTA.
- **FPI-6:** 6 observations each −2..+2; −12..+12, ≥ +10 highly pronated … ≤ −5
  highly supinated. Reproduced from Redmond 2006 and PMC4004124.
- **BESS:** error counts (max 10) across 6 stances on firm/foam, eyes closed; 0-60,
  higher = worse. Reproduced from Riemann & Guskiewicz and APTA / Shirley Ryan.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Select and
  error-count inputs coerce to bounded values (including the FPI's signed −2..+2);
  a blank form yields a 0 (or 0-error) score, never a `NaN`.
- **Each tile reports its score, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All score or grade, none diagnose or order** ([spec-v11](spec-v11.md) §5.3);
  each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v244.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v244 RV244 into RENDERERS)
lib/sportsmsk-v244.js                    (new: lysholm, marxActivity, footPostureIndex, bess)
lib/meta.js                              (+4 META entries)
views/group-v244.js                      (new renderer module: 4 renderers)
test/unit/sportsmsk-v244.test.js         (new: worked examples)
test/unit/fuzz-tools.test.js             (register sportsmsk-v244.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1054 → 1058)
```
