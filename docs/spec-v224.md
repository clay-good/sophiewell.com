# spec-v224.md — Neurology screening, disability & epilepsy outcome: the ID Migraine screener, the Overall Neuropathy Limitations Scale, the END-IT status-epilepticus score, Engel and ILAE epilepsy-surgery outcome classes, the Salzburg NCSE criteria, and the Dizziness Handicap Inventory (+7 tiles)

> Status: **SHIPPED (2026-07-03).** Twelfth feature spec of the **Bedside Decision &
> Physiology Instruments** program ([spec-v213](spec-v213.md)). Adds **7**
> deterministic neurology instruments, each **verified absent by a direct scan of
> `app.js`** (spec-v85 §6.2): the catalog carries `midas`, `pound-migraine`,
> `mrc-sum-score`, `edss`, `stess`, `helps2b`, `mess-first-seizure`, and `mgfa`
> (which already computes MG-ADL), but **not** the ID Migraine screener, ONLS, the
> END-IT score, Engel or ILAE outcome classes, the Salzburg NCSE criteria, or the
> Dizziness Handicap Inventory.
>
> Catalog effect: **live `UTILITIES.length` + 7** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v224 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnostic or treatment order** — these
> screen, classify, and score). **Every point value is re-fetched and cross-verified
> against ≥2 independent open sources** ([spec-v97](spec-v97.md)). The Dizziness
> Handicap Inventory is computed from the counts of Yes / Sometimes answers so no
> copyrighted item text is reproduced.

## 2. What v224 adds (7 tiles)

All Group G; all Class A; journal + author citations, none trips `ISSUER_PATTERN`.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `id-migraine` | ID Migraine screener | 3 yes/no items → positive at >= 2 | Lipton RB, et al. Neurology. 2003;61(3):375-382 |
| `onls` | ONLS | arm (0-5) + leg (0-7) → 0-12 | Graham RC, Hughes RAC. J Neurol Neurosurg Psychiatry. 2006;77(8):973-976 |
| `end-it-score` | END-IT score | 5 items (0-6) → unfavorable at >= 3 | Gao Q, et al. Crit Care. 2016;20:46 |
| `engel-classification` | Engel outcome class | postoperative outcome → Class I-IV | Engel J Jr. Surgical Treatment of the Epilepsies. 1993 |
| `ilae-surgical-outcome` | ILAE outcome class | seizure frequency vs baseline → Class 1-6 | Wieser HG, et al. Epilepsia. 2001;42(2):282-286 |
| `salzburg-ncse-criteria` | Salzburg NCSE criteria | EEG pattern + secondary criteria → definite / possible | Leitinger M, et al. Epilepsy Behav. 2015;49:158-163 |
| `dhi` | Dizziness Handicap Inventory | Yes / Sometimes counts (0-100) → handicap band | Jacobson GP, Newman CW. Arch Otolaryngol Head Neck Surg. 1990;116(4):424-427 |

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** ONLS/END-IT
  parse banded selects to fixed weights; ILAE guards its baseline denominator; DHI
  guards its Yes+Sometimes <= 25 constraint; Engel/Salzburg are classifiers. Each
  renders a complete-the-fields fallback rather than a `NaN`.
- **Each tile reports its score / class / verdict, the band, and the driving
  inputs** ([spec-v59](spec-v59.md)).
- **All seven screen / classify / score, not order** ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All seven flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 4. Files touched

```
docs/spec-v224.md                        (this file)
app.js                                   (+7 UTILITIES rows; import group-v224 RV224 into RENDERERS)
lib/neurology-v224.js                    (new: idMigraine, onls, endIt, engel, ilaeOutcome, salzburg, dhi)
lib/meta.js                              (+7 META entries)
views/group-v224.js                      (new renderer module: 7 renderers)
test/unit/neurology-v224.test.js         (worked examples)
test/unit/fuzz-tools.test.js             (add lib/neurology-v224.js to MODULES)
CHANGELOG.md, README.md, package.json, docs/architecture.md, docs/scope-post-parity.md, docs/scope-mdcalc-parity.md  (catalog count live -> live+7)
```

## 5. Acceptance criteria

v224 is fully shipped when all 7 tiles are live (Class A) with a `META[id]` entry,
inline citation + `citationUrl` + `accessed`, and worked examples; every compute is
finite-guarded and fuzz-covered; `UTILITIES.length` is **live + 7** across all
catalog-truth surfaces; and `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` all pass.

## 6. Out of scope for v224

- **No diagnostic / treatment order** — the tiles screen, classify, and score; the
  decisions stay with the neurologist and the patient ([spec-v11](spec-v11.md)
  §5.3). **MG-ADL** is deferred (already computed inside the live `mgfa` tile);
  **HIT-6** and **QMG** are deferred (proprietary / licensed instruments).
