# spec-v243.md — ENT / sleep screening tools: the NOSE scale, the Reflux Finding Score, the No-Apnea OSA screen, and the sleep-efficiency index (+4 tiles → 1054)

> Status: **SHIPPED (2026-07-04).** An otolaryngology / sleep slice. Adds **4** well-
> established deterministic tools. **Each id was verified absent by a fixed-string
> scan of the extracted `app.js` id/name lists AND the MCP adapter set** (spec-v85
> §6.2): the catalog carried `stop-bang`, `epworth`, and `reflux-symptom-index`, but
> none of these four.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1050 → 1054) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v243 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> point value / formula is re-fetched and cross-verified against ≥2 independent open
> sources** ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v243 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `nose-scale` | NOSE scale | 5 items × 0-4 → 0-100 | Stewart. Otolaryngol Head Neck Surg. 2004 |
| `rfs-reflux-finding` | Reflux Finding Score | 8 laryngoscopic findings → 0-26; > 7 LPR | Belafsky. Laryngoscope. 2001 |
| `no-apnea-score` | No-Apnea OSA screen | neck + age → 0-9; > 3 high risk | Duarte. Sleep Breath. 2018 |
| `sleep-efficiency` | Sleep-efficiency index | TST / TIB × 100 | sleep-medicine metric |

## 3. Source cross-verification (spec-v97)

- **NOSE scale:** 5 items each 0-4, raw × 5 = 0-100; 0 none, 5-25 mild, 30-50
  moderate, 55-75 severe, 80-100 extreme. Reproduced from Stewart 2004 and BackTable.
- **RFS:** subglottic edema (0/2), ventricular obliteration (0/2/4), erythema
  (0/2/4), vocal-fold edema (0-4), diffuse edema (0-4), posterior hypertrophy (0-4),
  granuloma (0/2), mucus (0/2); 0-26, > 7 LPR. Reproduced from Belafsky 2001 and otoscape.
- **No-Apnea:** neck circumference (< 37 = 0, 37-39.9 = 1, 40-42.9 = 3, ≥ 43 = 6) +
  age (< 35 = 0, 35-44 = 1, 45-54 = 2, ≥ 55 = 3); 0-9, > 3 high risk. Reproduced from
  Duarte 2018 and PMC6837961.
- **Sleep efficiency:** total sleep time / time in bed × 100; ≥ 85% normal, 75-84%
  moderate, < 75% poor. Reproduced from standard sleep-medicine references.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Select /
  numeric inputs coerce to bounded values; the sleep-efficiency guards TST > TIB; a
  blank form yields a bounded score or a "complete the fields" message, never a `NaN`.
- **Each tile reports its score, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All score, screen, or compute a value, none diagnose or order**
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v243.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v243 RV243 into RENDERERS)
lib/entsleep-v243.js                     (new: noseScale, rfsRefluxFinding, noApnea, sleepEfficiency)
lib/meta.js                              (+4 META entries)
views/group-v243.js                      (new renderer module: 4 renderers)
test/unit/entsleep-v243.test.js          (new: worked examples)
test/unit/fuzz-tools.test.js             (register entsleep-v243.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1050 → 1054)
```
