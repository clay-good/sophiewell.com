# spec-v218.md — ED, trauma & infection decision instruments: the FAINT syncope score, the adult NEXUS Head CT instrument, the HANDOC and DENOVA echo-need bacteremia scores, the 2018 ICM PJI definition, and the AIR and Adult Appendicitis scores (+7 tiles)

> Status: **SHIPPED (2026-07-03).** Sixth feature spec of the **Bedside Decision &
> Physiology Instruments** program ([spec-v213](spec-v213.md)). Adds **7**
> deterministic emergency-department, trauma, and infection decision instruments,
> each **verified absent by a direct scan of `app.js`** (spec-v85 §6.2): the
> catalog carries `canadian-syncope`, `egsys`, `cthr`, `denver-bcvi`,
> `duke-endocarditis`, and `alvarado-pas`, but **not** the FAINT score, the adult
> NEXUS Head CT instrument, the HANDOC or DENOVA scores, the 2018 ICM PJI
> definition, or the AIR / Adult Appendicitis scores.
>
> Catalog effect: **live `UTILITIES.length` + 7** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v218 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no imaging, admission, or surgical order** —
> these stratify and classify). **Every point value is re-fetched and
> cross-verified against ≥2 independent open sources** ([spec-v97](spec-v97.md)).

## 2. What v218 adds (7 tiles)

All Group G; all Class A; journal + author citations, none trips `ISSUER_PATTERN`.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `faint-score` | FAINT score | heart failure, arrhythmia, ECG, NT-proBNP (+2), troponin (0-6) → serious cardiac outcome | Probst MA, et al. Ann Emerg Med. 2020;75(2):147-158 |
| `nexus-head-ct` | NEXUS Head CT (adult) | 8 findings → CT indicated / deferrable | Mower WR, et al. J Trauma. 2005;59(4):954-959 |
| `handoc-score` | HANDOC score | murmur, aetiology, cultures, duration, one species, community (-1 to 6) → echo need | Sunnerhagen T, et al. Clin Infect Dis. 2018;66(5):693-698 |
| `denova-score` | DENOVA score | duration, embolization, cultures, origin, valve, murmur (0-6) → echo need | Berge A, et al. Infection. 2019;47(1):45-50 |
| `icm-pji-2018` | 2018 ICM PJI definition | major criterion + minor-criteria sum → infected / inconclusive / not | Parvizi J, et al. J Arthroplasty. 2018;33(5):1309-1314 |
| `air-score` | AIR score | vomiting, RIF pain, rebound, fever, WBC/PMN/CRP bands (0-12) → appendicitis probability | Andersson M, Andersson RE. World J Surg. 2008;32(8):1843-1849 |
| `adult-appendicitis-score` | Adult Appendicitis Score | RLQ pain/relocation/tenderness, guarding, WBC/PMN/CRP (0-25) → appendicitis probability | Sammalkorpi HE, et al. BMC Gastroenterol. 2014;14:114 |

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** The
  laboratory inputs (AIR and AAS WBC/PMN/CRP; AAS branches its CRP band on symptom
  duration and its tenderness point on sex/age) clamp to their published domains;
  the checkbox rules are pure classifiers. Each renders a complete-the-fields
  fallback rather than a `NaN`.
- **Each tile reports its score / verdict, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All seven stratify / classify, not order** ([spec-v11](spec-v11.md) §5.3);
  each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All seven flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 4. Files touched

```
docs/spec-v218.md                        (this file)
app.js                                   (+7 UTILITIES rows; import group-v218 RV218 into RENDERERS)
lib/ed-decision-v218.js                  (new: faint, nexusHead, handoc, denova, icmPji, airScore, adultAppendicitis)
lib/meta.js                              (+7 META entries)
views/group-v218.js                      (new renderer module: 7 renderers)
test/unit/ed-decision-v218.test.js       (worked examples)
test/unit/fuzz-tools.test.js             (add lib/ed-decision-v218.js to MODULES)
CHANGELOG.md, README.md, package.json, docs/architecture.md, docs/scope-post-parity.md, docs/scope-mdcalc-parity.md  (catalog count live -> live+7)
```

## 5. Acceptance criteria

v218 is fully shipped when all 7 tiles are live (Class A) with a `META[id]` entry,
inline citation + `citationUrl` + `accessed`, and worked examples; every compute is
finite-guarded and fuzz-covered; `UTILITIES.length` is **live + 7** across all
catalog-truth surfaces; and `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` all pass.

## 6. Out of scope for v218

- **No imaging / admission / surgical order** — the tiles stratify and classify;
  the decisions stay with the clinician and the patient ([spec-v11](spec-v11.md)
  §5.3). The **Memphis BCVI criteria** are deferred: the catalog already carries a
  BCVI screening rule (`denver-bcvi`), and the WHO 2009 dengue classifier is
  deferred to a batch that carries its `docs/citation-staleness.md` row.
