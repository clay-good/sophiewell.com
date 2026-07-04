# spec-v254.md — ENT / urology / psychiatry screening tools: the Reflux Symptom Index, the Lund-Mackay CT sinus score, the bladder-outlet-obstruction indices, and the Fagerstrom nicotine-dependence test (+4 tiles → 1098)

> Status: **SHIPPED (2026-07-04).** A cross-specialty screening slice. Adds **4**
> well-established deterministic tools. **Each id was verified absent by a fixed-
> string scan of the extracted `app.js` id/name lists AND the MCP adapter set**
> (spec-v85 §6.2): the catalog carried `rfs-reflux-finding`, `nose-scale`, `ipss`,
> and `auditc`, but none of these four.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1094 → 1098) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v254 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> point value is re-fetched and cross-verified against ≥2 independent open sources**
> ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v254 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `reflux-symptom-index` | Reflux Symptom Index | 9 items × 0-5 → 0-45; > 13 | Belafsky. J Voice. 2002 |
| `lund-mackay` | Lund-Mackay CT sinus score | 5 sinuses × 0-2 + OMC → 0-24 | Lund & Mackay. Rhinology. 1993 |
| `bladder-outlet-obstruction-index` | BOOI + BCI | Pdet − 2·Qmax / Pdet + 5·Qmax | Abrams. BJU Int. 1999 |
| `fagerstrom-ftnd` | Fagerstrom nicotine dependence | 6 items → 0-10 | Heatherton. Br J Addict. 1991 |

## 3. Source cross-verification (spec-v97)

- **RSI:** 9 symptom items each 0-5; 0-45, > 13 abnormal. Reproduced from Belafsky
  2002 and University of Iowa protocols.
- **Lund-Mackay:** 5 sinus systems × 0-2 per side + OMC 0/2 per side; 0-24.
  Reproduced from Lund & Mackay 1993 and PMC8788565.
- **BOOI/BCI:** BOOI = PdetQmax − 2·Qmax (< 20 / 20-40 / > 40); BCI = PdetQmax +
  5·Qmax (< 100 / 100-150 / > 150). Reproduced from Abrams 1999 and NBK562310.
- **FTND:** time-to-first (0-3), refrain (1), morning (1), per-day (0-3), more-morning
  (1), when-ill (1); 0-10. Reproduced from Heatherton 1991 and PMC4241548.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Select,
  checkbox, and pressure/flow inputs coerce to bounded values; a blank form yields a
  0 score or a "complete the fields" message, never a `NaN`.
- **Each tile reports its score / indices and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All score, grade, or compute a value, none diagnose or order**
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v254.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v254 RV254 into RENDERERS)
lib/enturopsych-v254.js                  (new: refluxSymptomIndex, lundMackay, bladderOutletObstructionIndex, fagerstromFtnd)
lib/meta.js                              (+4 META entries)
views/group-v254.js                      (new renderer module: 4 renderers)
test/unit/enturopsych-v254.test.js       (new: worked examples)
test/unit/fuzz-tools.test.js             (register enturopsych-v254.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1094 → 1098)
```
