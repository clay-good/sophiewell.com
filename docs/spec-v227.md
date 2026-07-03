# spec-v227.md — Closing cross-domain slice: the ICBD 2014 and ISG 1990 Behçet criteria, the BATT trauma-hemorrhage score, the Denver ED Trauma Organ Failure score, the Emergency Transfusion Score, and the WHO 2009 dengue classification (+6 tiles → +100 catalog milestone)

> Status: **SHIPPED (2026-07-03).** Closing feature spec of the **Bedside Decision &
> Physiology Instruments** program ([spec-v213](spec-v213.md)). Adds **6**
> deterministic cross-domain instruments and carries the catalog to the **+100**
> milestone for this program (891 → 991). **Each tile was verified absent by a
> direct scan of `app.js`** (spec-v85 §6.2): the catalog carries `sledai-2k`,
> `iss-rts`, `tash-score`, `abc-mtp`, `rabt-score`, `sirs`, and `curb-65`, but
> **not** the ICBD 2014 or ISG 1990 Behçet criteria, BATT, the Denver ED Trauma
> Organ Failure score, the Emergency Transfusion Score, or the WHO 2009 dengue
> classification.
>
> Catalog effect: **live `UTILITIES.length` + 6** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v227 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no transfusion, TXA, or treatment order** — these
> classify and stratify). **Every point value is re-fetched and cross-verified
> against ≥2 independent open sources** ([spec-v97](spec-v97.md)). `who-dengue-2009`
> names WHO and therefore carries a `docs/citation-staleness.md` row.

## 2. What v227 adds (6 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `icbd-2014-behcet` | ICBD 2014 | weighted criteria → Behçet at >= 4 | Davatchi F, et al. J Eur Acad Dermatol Venereol. 2014;28(3):338-347 |
| `isg-1990-behcet` | ISG 1990 | mandatory oral + >= 2 minor → meets/does not | International Study Group. Lancet. 1990;335(8697):1078-1080 |
| `batt` | BATT score | age/SBP/GCS bands + modifiers (0-27) → TXA threshold >= 2 | Ageron FX, et al. BMJ Open. 2019;9(4):e026823 |
| `denver-ed-tof` | Denver ED Trauma Organ Failure | 6 items (0-9) → MOF risk | Vogel JA, et al. J Trauma Acute Care Surg. 2014;76(1):140-145 |
| `ets` | Emergency Transfusion Score | weighted items → blood need at >= 3 | Ruchholtz S, et al. Transfus Med. 2006;16(1):49-56 |
| `who-dengue-2009` | WHO 2009 dengue classification | severity + warning signs → 3-tier | WHO. Dengue Guidelines. Geneva; 2009 |

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** BATT/ETS
  parse numeric vitals into fixed-weight bands (ETS preserves its half-point
  weights); Denver ED TOF bands hematocrit; the Behçet and dengue tiles are
  count/threshold classifiers. Each renders a complete-the-fields fallback rather
  than a `NaN`.
- **Each tile reports its score / verdict, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All six classify / stratify, not order** ([spec-v11](spec-v11.md) §5.3); each
  renders the [spec-v50](spec-v50.md) §3 posture note.
- **All six flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 4. Files touched

```
docs/spec-v227.md                        (this file)
app.js                                   (+6 UTILITIES rows; import group-v227 RV227 into RENDERERS)
lib/mixed-v227.js                        (new: icbdBehcet, isgBehcet, batt, denverEdTof, ets, whoDengue)
lib/meta.js                              (+6 META entries)
views/group-v227.js                      (new renderer module: 6 renderers)
docs/citation-staleness.md               (+1 row: who-dengue-2009)
test/unit/mixed-v227.test.js             (worked examples)
test/unit/fuzz-tools.test.js             (add lib/mixed-v227.js to MODULES)
CHANGELOG.md, README.md, package.json, docs/architecture.md, docs/scope-post-parity.md, docs/scope-mdcalc-parity.md  (catalog count live -> live+6)
```

## 5. Acceptance criteria

v227 is fully shipped when all 6 tiles are live (Class A) with a `META[id]` entry,
inline citation + `citationUrl` + `accessed`, and worked examples; `who-dengue-2009`
carries a staleness row; every compute is finite-guarded and fuzz-covered;
`UTILITIES.length` is **live + 6** across all catalog-truth surfaces; and
`npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.

## 6. Program note

v213–v227 make up the **Bedside Decision & Physiology Instruments** program, adding
**100** fully published, deterministic, order-free calculators across cardiology,
lipid/device/oncology, hematology, stroke, ED/trauma/infection, metabolic/hepatic,
hepatology prognosis, pulmonary/critical-care, rheumatology, dermatology,
neurology, obstetrics/gynecology, nephrology, and this closing cross-domain slice.
Each was verified absent at draft; each is Class A, cited, finite-guarded, and
order-free. Instruments whose coefficients / point maps are not reproducible from
≥2 open sources, or that duplicate a live tile, were deferred (e.g. Adrogué-Madias
= `sodium-correction`, MG-ADL = `mgfa`, BVAS v3 / VDI, Toronto HCC, BALAD-2).
