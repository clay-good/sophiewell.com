# spec-v214.md — Cardiology risk scores: AF ablation / progression outcome scores (APPLE, CAAP-AF, ATLAS, HATCH, MB-LATER) and two acute-coronary-syndrome severity scores (Canada ACS, ACTION ICU) (+7 tiles)

> Status: **SHIPPED (2026-07-03).** Second feature spec of the **Bedside Decision
> & Physiology Instruments** program ([spec-v213](spec-v213.md)). Adds **7**
> deterministic cardiology risk scores. **Each tile was verified absent by a
> direct scan of `app.js`** (spec-v85 §6.2): the catalog carries `cha2ds2-va`,
> `grace`, `timi`, `maggic`, and `mipi`, but **not** APPLE, CAAP-AF, ATLAS,
> HATCH, MB-LATER, the Canada ACS score, or the ACTION ICU score.
>
> Catalog effect: **live `UTILITIES.length` + 7** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time.
>
> Every prior spec remains in force. v214 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no ablation, admission, or treatment order** —
> these stratify recurrence / progression / complication risk). **Every point
> value is re-fetched and cross-verified against ≥2 independent open sources at
> implementation** ([spec-v97](spec-v97.md)).

## 2. What v214 adds (7 tiles)

All Group G; all Class A; none trips `ISSUER_PATTERN`, so no staleness rows.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `apple-score` | APPLE Score | age > 65, persistent AF, eGFR < 60, LA >= 43 mm, EF < 50% (0-5) → AF recurrence risk after ablation | Kornej J, et al. Clin Res Cardiol. 2015;104(10):871-876 |
| `caap-af-score` | CAAP-AF Score | CAD, LA-diameter band, age band, persistent AF (+2), failed-AAD band, female (0-13) → freedom from AF after ablation | Winkle RA, et al. Heart Rhythm. 2016;13(11):2119-2125 |
| `atlas-score` | ATLAS Score | age > 60, non-paroxysmal (+2), LA-volume index (+1/10), female (+4), smoking (+7) → recurrence after first PVI | Mesquita J, et al. Europace. 2018;20(FI_3):f428-f435 |
| `hatch-score` | HATCH Score | hypertension, age > 75, TIA/stroke (+2), COPD, heart failure (+2) (0-7) → progression to persistent AF | de Vos CB, et al. J Am Coll Cardiol. 2010;55(8):725-731 |
| `mb-later-score` | MB-LATER Score | male, BBB, LA >= 47 mm, AF type (0-2), early recurrence (0-6) → very-late recurrence after ablation | Mujovic N, et al. Sci Rep. 2017;7:40828 |
| `canada-acs-risk-score` | Canada ACS (C-ACS) | age >= 75, Killip > 1, SBP < 100, HR > 100 (0-4) → in-hospital ACS mortality | Huynh T, et al. Am Heart J. 2013;166(1):58-63 |
| `action-icu-score` | ACTION ICU Score | age, HR band, SBP band, creatinine, troponin, heart failure (+5), ST depression, no prior revascularization, chronic lung disease (0-20) → ICU-level complications in NSTEMI | Fanaroff AC, et al. J Am Heart Assoc. 2018;7(11):e008894 |

Each carries `citationUrl`, `citationAccessed`, ≥ 2 worked examples (see
`test/unit/cardiology-risk-v214.test.js`), and a validation companion cited in the
module header ([spec-v97](spec-v97.md)).

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** The banded
  numeric inputs (CAAP-AF LA diameter / age / failed-AAD; ATLAS LA-volume index;
  MB-LATER AF type; ACTION ICU heart rate / SBP) clamp to their published domains;
  each renders a complete-the-fields fallback rather than a `NaN`.
- **Each tile reports its score, the band that applies, and the positive
  factors** ([spec-v59](spec-v59.md)).
- **All seven render risk stratification, not orders** ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All seven flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 4. Files touched

```
docs/spec-v214.md                        (this file)
app.js                                   (+7 UTILITIES rows; import group-v214 RV214 into RENDERERS)
lib/cardiology-risk-v214.js              (new: apple, caapAf, atlas, hatch, mbLater, canadaAcs, actionIcu)
lib/meta.js                              (+7 META entries)
views/group-v214.js                      (new renderer module: 7 renderers)
test/unit/cardiology-risk-v214.test.js   (worked examples)
test/unit/fuzz-tools.test.js             (add lib/cardiology-risk-v214.js to MODULES)
CHANGELOG.md, README.md, package.json, docs/architecture.md, docs/scope-post-parity.md, docs/scope-mdcalc-parity.md  (catalog count live -> live+7)
```

## 5. Acceptance criteria

v214 is fully shipped when all 7 tiles are live (Class A) with a `META[id]` entry,
inline citation + `citationUrl` + `accessed`, and worked examples; every compute is
finite-guarded and fuzz-covered with zero non-finite leaks; `UTILITIES.length` is
**live + 7** across all catalog-truth surfaces; and `npm run lint`, `npm run test`,
`npm run sbom`, and `npm run build` all pass.

## 6. Out of scope for v214

- **No ablation / admission / treatment order** — the tiles stratify risk; the
  decisions stay with the cardiologist and the patient ([spec-v11](spec-v11.md)
  §5.3).
- **The classic 5-factor IPI, the age-adjusted IPI, and the biologic MIPI are
  deferred** — the classic IPI is already computed by the live `flipi` tile and
  the standard MIPI by `mipi`; their variants would overlap those tiles.
